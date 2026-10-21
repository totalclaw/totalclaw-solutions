"""
Web Check MCP Server
域名/网站情报分析工具集 — 从网站本身提取公司真实数字化水平

  1. domain_tech_stack       — 技术栈检测（CMS/框架/CDN/服务器）
  2. domain_dns_security     — 邮件安全配置（SPF/DKIM/DMARC）+ 安全评级
  3. domain_whois            — 域名注册信息（年龄/注册商/到期日）
  4. domain_web_archive      — Wayback Machine 历史（快照数/变化频率）
  5. domain_threat_check     — 威胁检测（恶意软件/钓鱼/黑名单）
"""

import json
import re
import socket
import ssl
import urllib.request
import urllib.parse
import certifi
from datetime import datetime, timezone
from fastmcp import FastMCP

_SSL_CTX = ssl.create_default_context(cafile=certifi.where())

mcp = FastMCP(
    "web-check",
    instructions=(
        "Domain/website intelligence tools for OSINT investigations. "
        "domain_tech_stack: detect CMS, frameworks, CDN, server software from HTTP headers and HTML. "
        "domain_dns_security: check SPF/DKIM/DMARC email security configuration. "
        "domain_whois: lookup domain registration age, registrar, expiry via RDAP. "
        "domain_web_archive: query Wayback Machine for historical snapshots and change frequency. "
        "domain_threat_check: screen domain against malware/phishing databases (URLhaus, Google Safe Browsing)."
    ),
)


# ── HTTP helpers ──────────────────────────────────────────────────────────────

def _get(url: str, timeout: int = 15, accept: str = "*/*") -> tuple[int, dict, str]:
    """Return (status_code, headers_dict, body). On error returns (-1, {}, error_msg)."""
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                "Accept": accept,
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as resp:
            headers = {k.lower(): v for k, v in resp.getheaders()}
            body = resp.read().decode("utf-8", errors="replace")
            return (resp.status, headers, body)
    except urllib.error.HTTPError as e:
        return (e.code, {}, str(e))
    except Exception as e:
        return (-1, {}, str(e))


def _get_json(url: str, timeout: int = 15) -> dict:
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "OSINT-web-check/1.0", "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"__error__": str(e)}


def _dns_txt(domain: str) -> list[str]:
    """Query TXT records via DNS-over-HTTPS (Cloudflare)."""
    url = f"https://cloudflare-dns.com/dns-query?name={domain}&type=TXT"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/dns-json"})
        with urllib.request.urlopen(req, timeout=10, context=_SSL_CTX) as resp:
            data = json.loads(resp.read().decode())
            return [ans.get("data", "").strip('"') for ans in data.get("Answer", [])]
    except Exception:
        return []


def _dns_query(domain: str, qtype: str) -> list[dict]:
    """Query DNS records via Cloudflare DoH."""
    url = f"https://cloudflare-dns.com/dns-query?name={domain}&type={qtype}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/dns-json"})
        with urllib.request.urlopen(req, timeout=10, context=_SSL_CTX) as resp:
            data = json.loads(resp.read().decode())
            return data.get("Answer", [])
    except Exception:
        return []


def _clean_domain(domain: str) -> str:
    """Strip protocol, path, trailing slash from user input."""
    domain = domain.strip()
    domain = re.sub(r"^https?://", "", domain)
    domain = domain.split("/")[0].split("?")[0]
    return domain.lower()


# ── Tool 1: domain_tech_stack ─────────────────────────────────────────────────

# Known technology fingerprints: (pattern_in_html_or_headers, tech_name, category)
_TECH_FINGERPRINTS = [
    # CMS / Ecommerce
    (r'content="WordPress', "WordPress", "CMS"),
    (r'wp-content/', "WordPress", "CMS"),
    (r'content="Shopify', "Shopify", "Ecommerce"),
    (r'cdn\.shopify\.com', "Shopify", "Ecommerce"),
    (r'myshopify\.com', "Shopify", "Ecommerce"),
    (r'content="Wix\.com', "Wix", "Website Builder"),
    (r'wix\.com/[a-z]', "Wix", "Website Builder"),
    (r'squarespace\.com', "Squarespace", "Website Builder"),
    (r'content="Drupal', "Drupal", "CMS"),
    (r'sites/default/files', "Drupal", "CMS"),
    (r'content="Joomla', "Joomla", "CMS"),
    (r'/media/jui/', "Joomla", "CMS"),
    (r'magento', "Magento", "Ecommerce"),
    (r'Magento', "Magento", "Ecommerce"),
    (r'bigcommerce\.com', "BigCommerce", "Ecommerce"),
    (r'WooCommerce', "WooCommerce", "Ecommerce"),
    (r'wc-ajax', "WooCommerce", "Ecommerce"),
    (r'PrestaShop', "PrestaShop", "Ecommerce"),
    (r'webflow\.com', "Webflow", "Website Builder"),

    # JS Frameworks
    (r'react', "React", "JS Framework"),
    (r'__next', "Next.js", "JS Framework"),
    (r'_next/static', "Next.js", "JS Framework"),
    (r'__nuxt', "Nuxt.js", "JS Framework"),
    (r'ng-version', "Angular", "JS Framework"),
    (r'vue\.js', "Vue.js", "JS Framework"),
    (r'svelte', "Svelte", "JS Framework"),
    (r'gatsby', "Gatsby", "Static Site Generator"),
    (r'astro', "Astro", "Static Site Generator"),

    # Analytics / Marketing
    (r'google-analytics\.com|gtag|GA-|G-[A-Z0-9]', "Google Analytics", "Analytics"),
    (r'googletagmanager\.com', "Google Tag Manager", "Analytics"),
    (r'hotjar\.com', "Hotjar", "Analytics"),
    (r'facebook\.net/en_US/fbevents', "Meta Pixel", "Analytics"),
    (r'connect\.facebook\.net', "Facebook SDK", "Social"),
    (r'snap\.licdn\.com', "LinkedIn Insight Tag", "Analytics"),
    (r'clarity\.ms', "Microsoft Clarity", "Analytics"),
    (r'hubspot\.com', "HubSpot", "Marketing"),
    (r'hs-scripts\.com', "HubSpot", "Marketing"),
    (r'intercom\.io|intercomcdn\.com', "Intercom", "Support"),
    (r'crisp\.chat', "Crisp", "Support"),
    (r'zendesk\.com', "Zendesk", "Support"),
    (r'tawk\.to', "Tawk.to", "Support"),
    (r'klaviyo\.com', "Klaviyo", "Email Marketing"),
    (r'mailchimp\.com', "Mailchimp", "Email Marketing"),

    # CDN / Infrastructure
    (r'cloudflare', "Cloudflare", "CDN"),
    (r'cdn\.cloudflare\.com', "Cloudflare", "CDN"),
    (r'fastly', "Fastly", "CDN"),
    (r'akamai', "Akamai", "CDN"),
    (r'cloudfront\.net', "AWS CloudFront", "CDN"),
    (r'amazonaws\.com', "AWS", "Hosting"),
    (r'vercel', "Vercel", "Hosting"),
    (r'netlify', "Netlify", "Hosting"),
    (r'herokuapp\.com', "Heroku", "Hosting"),
    (r'github\.io', "GitHub Pages", "Hosting"),

    # Payment
    (r'stripe\.com|js\.stripe', "Stripe", "Payment"),
    (r'paypal\.com', "PayPal", "Payment"),
    (r'braintree', "Braintree", "Payment"),

    # Chat / AI
    (r'chatgpt|openai\.com', "OpenAI/ChatGPT", "AI"),
    (r'drift\.com', "Drift", "Chat"),
]


@mcp.tool()
def domain_tech_stack(domain: str) -> str:
    """
    Detect a website's technology stack by analyzing HTTP headers and HTML source.

    Identifies: CMS (WordPress/Shopify/etc), JS frameworks, CDN, analytics,
    marketing tools, payment processors, chat widgets, and hosting platform.

    This reveals digital maturity: Shopify = basic DTC, custom React + HubSpot = serious operation.
    A site with no analytics and default server headers = minimal digital investment.

    Args:
        domain: Website domain (e.g. "anker.com", "renogy.com")

    Returns:
        JSON with detected technologies grouped by category, server info, and maturity assessment.
    """
    domain = _clean_domain(domain)
    url = f"https://{domain}"
    status, headers, html = _get(url)

    out = {
        "domain": domain,
        "url_checked": url,
    }

    if status == -1:
        # Try HTTP fallback
        url = f"http://{domain}"
        status, headers, html = _get(url)

    if status == -1:
        out["status"] = "unreachable"
        out["error"] = html
        return json.dumps(out, ensure_ascii=False, indent=2)

    out["http_status"] = status

    # ── Server info from headers ──────────────────────────────────────────
    server_info = {}
    for key in ["server", "x-powered-by", "x-generator", "x-cms", "x-shopify-stage"]:
        if key in headers:
            server_info[key] = headers[key]

    # Detect CDN from headers
    cdn_headers = {
        "cf-ray": "Cloudflare",
        "x-cdn": None,  # value is CDN name
        "x-fastly-request-id": "Fastly",
        "x-amz-cf-id": "AWS CloudFront",
        "x-vercel-id": "Vercel",
        "x-nf-request-id": "Netlify",
        "fly-request-id": "Fly.io",
    }
    for hdr, cdn_name in cdn_headers.items():
        if hdr in headers:
            server_info["cdn"] = cdn_name or headers[hdr]
            break

    out["server_info"] = server_info

    # ── Security headers ──────────────────────────────────────────────────
    sec_headers_check = [
        "strict-transport-security",
        "content-security-policy",
        "x-frame-options",
        "x-content-type-options",
        "referrer-policy",
        "permissions-policy",
    ]
    sec_present = [h for h in sec_headers_check if h in headers]
    out["security_headers"] = {
        "present": sec_present,
        "missing": [h for h in sec_headers_check if h not in headers],
        "score": f"{len(sec_present)}/{len(sec_headers_check)}",
    }

    # ── Technology fingerprinting ─────────────────────────────────────────
    # Combine headers string + first 100KB of HTML for matching
    scan_text = json.dumps(headers) + "\n" + html[:100000]

    detected = {}  # category -> set of tech names
    for pattern, tech_name, category in _TECH_FINGERPRINTS:
        if re.search(pattern, scan_text, re.IGNORECASE):
            detected.setdefault(category, set()).add(tech_name)

    # ── HTML meta generator ───────────────────────────────────────────────
    gen_match = re.search(r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)', html, re.IGNORECASE)
    if gen_match:
        gen = gen_match.group(1).strip()
        detected.setdefault("CMS", set()).add(gen)

    # Convert sets to sorted lists
    tech_stack = {cat: sorted(techs) for cat, techs in sorted(detected.items())}
    out["technologies"] = tech_stack
    out["total_technologies_detected"] = sum(len(v) for v in tech_stack.values())

    # ── SSL certificate info ──────────────────────────────────────────────
    try:
        ctx = ssl.create_default_context(cafile=certifi.where())
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(8)
            s.connect((domain, 443))
            cert = s.getpeercertificate()
            if cert:
                out["ssl"] = {
                    "issuer": dict(x[0] for x in cert.get("issuer", [])).get("organizationName", "unknown"),
                    "subject": dict(x[0] for x in cert.get("subject", [])).get("commonName", "unknown"),
                    "not_before": cert.get("notBefore", ""),
                    "not_after": cert.get("notAfter", ""),
                    "san": [v for _, v in cert.get("subjectAltName", [])][:10],
                }
    except Exception:
        out["ssl"] = {"status": "could_not_retrieve"}

    # ── Maturity assessment ───────────────────────────────────────────────
    maturity_score = 0
    maturity_signals = []

    has_analytics = bool(detected.get("Analytics"))
    has_marketing = bool(detected.get("Marketing") or detected.get("Email Marketing"))
    has_ecommerce = bool(detected.get("Ecommerce") or detected.get("Payment"))
    has_cdn = bool(detected.get("CDN") or server_info.get("cdn"))
    has_framework = bool(detected.get("JS Framework") or detected.get("Static Site Generator"))
    sec_score = len(sec_present)

    if has_analytics:
        maturity_score += 15
        maturity_signals.append("Analytics tracking active")
    if has_marketing:
        maturity_score += 20
        maturity_signals.append("Marketing automation tools deployed")
    if has_ecommerce:
        maturity_score += 15
        maturity_signals.append("Ecommerce/payment infrastructure present")
    if has_cdn:
        maturity_score += 10
        maturity_signals.append("CDN/performance optimization in place")
    if has_framework:
        maturity_score += 15
        maturity_signals.append("Modern frontend framework detected")
    if sec_score >= 4:
        maturity_score += 15
        maturity_signals.append(f"Strong security headers ({sec_score}/6)")
    elif sec_score >= 2:
        maturity_score += 5
        maturity_signals.append(f"Basic security headers ({sec_score}/6)")
    if detected.get("Support"):
        maturity_score += 10
        maturity_signals.append("Customer support widget active")

    if maturity_score >= 70:
        level = "HIGH — Serious digital operation"
    elif maturity_score >= 40:
        level = "MEDIUM — Standard business website"
    elif maturity_score >= 15:
        level = "LOW — Minimal digital investment"
    else:
        level = "VERY LOW — Bare-bones or placeholder site"

    out["digital_maturity"] = {
        "score": maturity_score,
        "max_score": 100,
        "level": level,
        "signals": maturity_signals,
    }

    return json.dumps(out, ensure_ascii=False, indent=2)


# ── Tool 2: domain_dns_security ───────────────────────────────────────────────

@mcp.tool()
def domain_dns_security(domain: str) -> str:
    """
    Check a domain's email security configuration: SPF, DKIM, DMARC records.

    This reveals IT maturity — a company with proper SPF+DKIM+DMARC has a real IT team.
    Missing DMARC = your emails to them might land in spam, and they're vulnerable to spoofing.

    Also checks MX records to identify email provider (Google Workspace, Microsoft 365, etc).

    Args:
        domain: Domain to check (e.g. "anker.com")

    Returns:
        JSON with SPF/DKIM/DMARC status, email provider, and security grade (A/B/C/F).
    """
    domain = _clean_domain(domain)
    out = {"domain": domain}

    # ── TXT records (SPF + DMARC + misc) ──────────────────────────────────
    txt_records = _dns_txt(domain)
    dmarc_records = _dns_txt(f"_dmarc.{domain}")

    # SPF
    spf = [r for r in txt_records if r.startswith("v=spf1")]
    out["spf"] = {
        "present": bool(spf),
        "record": spf[0] if spf else None,
        "meaning": (
            "SPF defines which servers can send email for this domain. "
            + ("Configured correctly." if spf else "MISSING — anyone can spoof emails from this domain.")
        ),
    }

    # DMARC
    dmarc = [r for r in dmarc_records if r.startswith("v=DMARC1")]
    dmarc_policy = None
    if dmarc:
        pm = re.search(r"p=(none|quarantine|reject)", dmarc[0])
        dmarc_policy = pm.group(1) if pm else "unknown"

    out["dmarc"] = {
        "present": bool(dmarc),
        "record": dmarc[0] if dmarc else None,
        "policy": dmarc_policy,
        "meaning": (
            "DMARC tells receiving servers what to do with unauthenticated email. "
            + (
                f"Policy: {dmarc_policy}. "
                + ("'reject' = strongest protection. " if dmarc_policy == "reject"
                   else "'quarantine' = moderate protection. " if dmarc_policy == "quarantine"
                   else "'none' = monitoring only, no enforcement. " if dmarc_policy == "none"
                   else "")
                if dmarc_policy else ""
            )
            + ("" if dmarc else "MISSING — domain has no email authentication policy.")
        ),
    }

    # DKIM (check common selectors)
    dkim_selectors = ["google", "default", "selector1", "selector2", "k1", "mandrill", "mailjet", "ses"]
    dkim_found = []
    for sel in dkim_selectors:
        recs = _dns_txt(f"{sel}._domainkey.{domain}")
        if any("DKIM" in r.upper() or "v=DKIM1" in r or "p=" in r for r in recs):
            dkim_found.append(sel)

    out["dkim"] = {
        "present": bool(dkim_found),
        "selectors_found": dkim_found,
        "meaning": (
            "DKIM cryptographically signs outgoing email. "
            + (f"Found selectors: {', '.join(dkim_found)}. " if dkim_found
               else "No common DKIM selectors found (may use non-standard selector). ")
        ),
    }

    # ── MX records (email provider detection) ─────────────────────────────
    mx_answers = _dns_query(domain, "MX")
    mx_hosts = [a.get("data", "").lower() for a in mx_answers]

    email_provider = "Unknown"
    for mx in mx_hosts:
        if "google" in mx or "gmail" in mx:
            email_provider = "Google Workspace"
            break
        elif "outlook" in mx or "microsoft" in mx:
            email_provider = "Microsoft 365"
            break
        elif "zoho" in mx:
            email_provider = "Zoho Mail"
            break
        elif "protonmail" in mx or "proton" in mx:
            email_provider = "ProtonMail"
            break
        elif "mimecast" in mx:
            email_provider = "Mimecast"
            break
        elif "barracuda" in mx:
            email_provider = "Barracuda"
            break
        elif "pphosted" in mx or "proofpoint" in mx:
            email_provider = "Proofpoint"
            break
        elif "secureserver" in mx:
            email_provider = "GoDaddy"
            break
        elif "qq.com" in mx:
            email_provider = "Tencent Enterprise Mail"
            break
        elif "ali" in mx and ("mail" in mx or "mxhichina" in mx):
            email_provider = "Alibaba Enterprise Mail"
            break

    out["mx"] = {
        "records": mx_hosts[:5],
        "email_provider": email_provider,
    }

    # ── Other interesting TXT records ─────────────────────────────────────
    verification_records = []
    for r in txt_records:
        if any(v in r.lower() for v in ["google-site-verification", "facebook-domain", "ms=", "apple-domain", "hubspot"]):
            verification_records.append(r[:100])

    if verification_records:
        out["domain_verifications"] = verification_records[:5]

    # ── Security grade ────────────────────────────────────────────────────
    score = 0
    if spf:
        score += 25
    if dkim_found:
        score += 25
    if dmarc:
        score += 25
        if dmarc_policy == "reject":
            score += 15
        elif dmarc_policy == "quarantine":
            score += 10
        elif dmarc_policy == "none":
            score += 5
    if email_provider != "Unknown":
        score += 10

    if score >= 90:
        grade = "A"
        grade_meaning = "Excellent email security — professional IT team"
    elif score >= 70:
        grade = "B"
        grade_meaning = "Good email security — most protections in place"
    elif score >= 40:
        grade = "C"
        grade_meaning = "Partial email security — some gaps remain"
    else:
        grade = "F"
        grade_meaning = "Poor email security — vulnerable to spoofing, minimal IT investment"

    out["security_grade"] = {
        "grade": grade,
        "score": score,
        "max_score": 100,
        "meaning": grade_meaning,
    }

    return json.dumps(out, ensure_ascii=False, indent=2)


# ── Tool 3: domain_whois ─────────────────────────────────────────────────────

@mcp.tool()
def domain_whois(domain: str) -> str:
    """
    Look up domain registration info via RDAP (IANA standard, free, no API key needed).

    Key intelligence: domain age is a strong legitimacy signal.
    - Domain < 6 months = red flag (potential fly-by-night)
    - Domain < 1 year = yellow flag
    - Domain > 5 years = green signal (established web presence)

    Also reveals: registrar, expiry date (short renewal = low commitment), nameservers.

    Args:
        domain: Domain to check (e.g. "anker.com")

    Returns:
        JSON with registration dates, domain age, registrar, expiry, nameservers, and risk signal.
    """
    domain = _clean_domain(domain)
    out = {"domain": domain}

    # ── Step 1: Find the RDAP server for this TLD ─────────────────────────
    tld = domain.split(".")[-1]
    bootstrap = _get_json("https://data.iana.org/rdap/dns.json")

    rdap_base = None
    if "__error__" not in bootstrap:
        for entry in bootstrap.get("services", []):
            tlds, urls = entry
            if tld in tlds:
                rdap_base = urls[0].rstrip("/")
                break

    if not rdap_base:
        # Fallback known RDAP endpoints
        fallbacks = {
            "com": "https://rdap.verisign.com/com/v1",
            "net": "https://rdap.verisign.com/net/v1",
            "org": "https://rdap.org/org/v1",
            "io": "https://rdap.nic.io",
            "co": "https://rdap.nic.co",
        }
        rdap_base = fallbacks.get(tld)

    if not rdap_base:
        out["status"] = "no_rdap_server"
        out["note"] = f"No RDAP server found for TLD '.{tld}'. Try manual whois."
        out["fallback_url"] = f"https://who.is/whois/{domain}"
        return json.dumps(out, ensure_ascii=False, indent=2)

    # ── Step 2: Query RDAP ────────────────────────────────────────────────
    rdap_url = f"{rdap_base}/domain/{domain}"
    data = _get_json(rdap_url)

    if "__error__" in data:
        out["status"] = "rdap_failed"
        out["error"] = data["__error__"]
        out["fallback_url"] = f"https://who.is/whois/{domain}"
        return json.dumps(out, ensure_ascii=False, indent=2)

    out["status"] = "found"

    # ── Parse events (registration, expiration, last changed) ─────────────
    events = {}
    for ev in data.get("events", []):
        action = ev.get("eventAction", "")
        date_str = ev.get("eventDate", "")
        if action and date_str:
            events[action] = date_str[:10]  # YYYY-MM-DD

    out["registration_date"] = events.get("registration", "unknown")
    out["expiration_date"] = events.get("expiration", "unknown")
    out["last_changed"] = events.get("last changed", events.get("last update of RDAP database", "unknown"))

    # ── Calculate domain age ──────────────────────────────────────────────
    reg_date = events.get("registration")
    if reg_date:
        try:
            reg_dt = datetime.strptime(reg_date[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            age_days = (now - reg_dt).days
            age_years = round(age_days / 365.25, 1)
            out["domain_age_days"] = age_days
            out["domain_age_years"] = age_years

            if age_days < 180:
                out["age_signal"] = "RED FLAG — Domain less than 6 months old"
            elif age_days < 365:
                out["age_signal"] = "YELLOW — Domain less than 1 year old"
            elif age_years < 3:
                out["age_signal"] = "NEUTRAL — Relatively new domain"
            else:
                out["age_signal"] = f"GREEN — Established domain ({age_years} years)"
        except ValueError:
            pass

    # ── Expiry analysis ───────────────────────────────────────────────────
    exp_date = events.get("expiration")
    if exp_date:
        try:
            exp_dt = datetime.strptime(exp_date[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            days_until_expiry = (exp_dt - now).days
            out["days_until_expiry"] = days_until_expiry
            if days_until_expiry < 60:
                out["expiry_signal"] = "RED FLAG — Domain expiring very soon, may not be renewed"
            elif days_until_expiry < 180:
                out["expiry_signal"] = "YELLOW — Domain expiring within 6 months"
            else:
                out["expiry_signal"] = "GREEN — Domain renewal is current"
        except ValueError:
            pass

    # ── Registrar ─────────────────────────────────────────────────────────
    entities = data.get("entities", [])
    for ent in entities:
        roles = ent.get("roles", [])
        if "registrar" in roles:
            vcard = ent.get("vcardArray", [None, []])
            name = ""
            if len(vcard) > 1:
                for item in vcard[1]:
                    if item[0] == "fn":
                        name = item[3]
                        break
            if not name:
                name = ent.get("handle", "unknown")
            out["registrar"] = name
            break

    # ── Nameservers ───────────────────────────────────────────────────────
    ns_list = []
    for ns in data.get("nameservers", []):
        ns_name = ns.get("ldhName", "")
        if ns_name:
            ns_list.append(ns_name.lower())
    out["nameservers"] = ns_list[:6]

    # Detect DNS provider from nameservers
    ns_joined = " ".join(ns_list)
    if "cloudflare" in ns_joined:
        out["dns_provider"] = "Cloudflare"
    elif "awsdns" in ns_joined:
        out["dns_provider"] = "AWS Route 53"
    elif "google" in ns_joined:
        out["dns_provider"] = "Google Cloud DNS"
    elif "azure" in ns_joined or "microsoft" in ns_joined:
        out["dns_provider"] = "Azure DNS"
    elif "domaincontrol" in ns_joined:
        out["dns_provider"] = "GoDaddy"
    elif "hichina" in ns_joined or "alidns" in ns_joined:
        out["dns_provider"] = "Alibaba Cloud DNS"
    elif "dnspod" in ns_joined:
        out["dns_provider"] = "DNSPod (Tencent)"

    out["rdap_url"] = rdap_url
    out["fallback_url"] = f"https://who.is/whois/{domain}"

    return json.dumps(out, ensure_ascii=False, indent=2)


# ── Tool 4: domain_web_archive ────────────────────────────────────────────────

@mcp.tool()
def domain_web_archive(domain: str) -> str:
    """
    Query Wayback Machine for a domain's web archive history.

    Intelligence value:
    - Total snapshots = how much attention the site gets (bots/researchers archive active sites more)
    - First snapshot date = confirms how long the site has actually been live (vs just registered)
    - Recent change frequency = is the site actively maintained or abandoned?
    - A domain registered 5 years ago but first archived 2 months ago = suspicious

    Args:
        domain: Domain to check (e.g. "anker.com")

    Returns:
        JSON with total snapshots, first/last archive date, recent activity, and archive URL.
    """
    domain = _clean_domain(domain)
    out = {"domain": domain}

    # ── CDX API: count total captures ─────────────────────────────────────
    cdx_url = (
        f"https://web.archive.org/cdx/search/cdx?"
        f"url={domain}&output=json&fl=timestamp,statuscode&limit=5000&collapse=timestamp:6"
    )
    status, _, body = _get(cdx_url, timeout=20, accept="application/json")

    if status == -1 or not body.strip():
        out["status"] = "wayback_unavailable"
        out["error"] = body if status == -1 else "Empty response"
        out["archive_url"] = f"https://web.archive.org/web/*/{domain}"
        return json.dumps(out, ensure_ascii=False, indent=2)

    try:
        rows = json.loads(body)
    except json.JSONDecodeError:
        out["status"] = "parse_error"
        out["archive_url"] = f"https://web.archive.org/web/*/{domain}"
        return json.dumps(out, ensure_ascii=False, indent=2)

    # First row is header
    if rows and rows[0] == ["timestamp", "statuscode"]:
        rows = rows[1:]

    if not rows:
        out["status"] = "no_snapshots"
        out["note"] = "Domain has never been archived by Wayback Machine — could be very new or obscure"
        out["archive_url"] = f"https://web.archive.org/web/*/{domain}"
        return json.dumps(out, ensure_ascii=False, indent=2)

    out["status"] = "found"

    # ── Parse timestamps (YYYYMM format due to collapse) ──────────────────
    timestamps = [r[0] for r in rows if r[0]]
    total_monthly_snapshots = len(timestamps)

    first_ts = timestamps[0]
    last_ts = timestamps[-1]

    def _fmt_ts(ts: str) -> str:
        if len(ts) >= 8:
            return f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}"
        elif len(ts) >= 6:
            return f"{ts[:4]}-{ts[4:6]}"
        return ts

    out["total_monthly_snapshots"] = total_monthly_snapshots
    out["first_snapshot"] = _fmt_ts(first_ts)
    out["last_snapshot"] = _fmt_ts(last_ts)

    # ── Calculate archive age ─────────────────────────────────────────────
    try:
        first_year = int(first_ts[:4])
        first_month = int(first_ts[4:6]) if len(first_ts) >= 6 else 1
        now = datetime.now(timezone.utc)
        archive_age_years = round((now.year - first_year) + (now.month - first_month) / 12, 1)
        out["archive_age_years"] = archive_age_years
    except (ValueError, IndexError):
        pass

    # ── Recent activity (last 24 months) ──────────────────────────────────
    try:
        cutoff = datetime.now(timezone.utc)
        cutoff_str = f"{cutoff.year - 2}{cutoff.month:02d}"
        recent = [t for t in timestamps if t[:6] >= cutoff_str]
        out["snapshots_last_24_months"] = len(recent)

        if len(recent) >= 18:
            out["activity_signal"] = "VERY ACTIVE — Frequently updated site"
        elif len(recent) >= 6:
            out["activity_signal"] = "ACTIVE — Regularly maintained"
        elif len(recent) >= 1:
            out["activity_signal"] = "LOW ACTIVITY — Infrequent updates"
        else:
            out["activity_signal"] = "DORMANT — No recent changes detected"
    except Exception:
        pass

    # ── Year-by-year distribution (for trend) ─────────────────────────────
    yearly = {}
    for ts in timestamps:
        year = ts[:4]
        yearly[year] = yearly.get(year, 0) + 1
    out["snapshots_by_year"] = dict(sorted(yearly.items()))

    out["archive_url"] = f"https://web.archive.org/web/*/{domain}"
    out["first_snapshot_url"] = f"https://web.archive.org/web/{first_ts}/{domain}"

    return json.dumps(out, ensure_ascii=False, indent=2)


# ── Tool 5: domain_threat_check ───────────────────────────────────────────────

@mcp.tool()
def domain_threat_check(domain: str) -> str:
    """
    Check if a domain is flagged as malicious, phishing, or compromised.

    Sources checked:
    - URLhaus (abuse.ch) — active malware distribution URLs
    - Google Safe Browsing Transparency Report — phishing/malware flags
    - DNS blackhole check — is domain sinkholed by security providers?

    A positive hit = immediate red flag for supplier/partner risk.

    Args:
        domain: Domain to check (e.g. "suspicious-supplier.com")

    Returns:
        JSON with threat status per source, overall risk level, and recommendation.
    """
    domain = _clean_domain(domain)
    out = {
        "domain": domain,
        "checks": [],
        "threats_found": [],
        "overall_status": "CLEAN",
        "risk_level": "LOW",
    }

    # ── Check 1: URLhaus (abuse.ch) ───────────────────────────────────────
    try:
        urlhaus_data = urllib.parse.urlencode({"host": domain}).encode()
        req = urllib.request.Request(
            "https://urlhaus-api.abuse.ch/v1/host/",
            data=urlhaus_data,
            headers={"User-Agent": "OSINT-web-check/1.0"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10, context=_SSL_CTX) as resp:
            uh_result = json.loads(resp.read().decode())

        uh_status = uh_result.get("query_status", "no_results")
        urls_count = uh_result.get("urls_count", 0) if isinstance(uh_result.get("urls_count"), int) else 0

        check = {
            "source": "URLhaus (abuse.ch)",
            "status": uh_status,
            "urls_flagged": urls_count,
        }

        if uh_status != "no_results" and urls_count > 0:
            # Get recent malware URLs
            recent_urls = []
            for u in uh_result.get("urls", [])[:3]:
                recent_urls.append({
                    "url": u.get("url", "")[:100],
                    "threat": u.get("threat", ""),
                    "status": u.get("url_status", ""),
                    "date_added": u.get("date_added", ""),
                })
            check["recent_threats"] = recent_urls
            check["flagged"] = True
            out["threats_found"].append(f"URLhaus: {urls_count} malware URLs associated with this domain")
        else:
            check["flagged"] = False

        out["checks"].append(check)
    except Exception as e:
        out["checks"].append({"source": "URLhaus", "status": "check_failed", "error": str(e)})

    # ── Check 2: Google Safe Browsing Transparency ────────────────────────
    try:
        gsb_url = f"https://transparencyreport.google.com/transparencyreport/api/v3/safebrowsing/status?site={domain}"
        _, _, gsb_body = _get(gsb_url, timeout=10)

        check = {"source": "Google Safe Browsing Transparency"}
        if "SAFE" in gsb_body.upper() or "no unsafe" in gsb_body.lower():
            check["status"] = "safe"
            check["flagged"] = False
        elif "DANGEROUS" in gsb_body.upper() or "unsafe" in gsb_body.lower():
            check["status"] = "dangerous"
            check["flagged"] = True
            out["threats_found"].append("Google Safe Browsing: site flagged as dangerous")
        else:
            check["status"] = "inconclusive"
            check["flagged"] = False

        check["check_url"] = f"https://transparencyreport.google.com/safe-browsing/search?url={domain}"
        out["checks"].append(check)
    except Exception as e:
        out["checks"].append({"source": "Google Safe Browsing", "status": "check_failed", "error": str(e)})

    # ── Check 3: DNS sinkhole / blackhole check ───────────────────────────
    try:
        # Check if domain resolves to known sinkhole IPs
        sinkhole_ips = {
            "0.0.0.0", "127.0.0.1", "127.0.0.2",
            "146.112.61.104",  # OpenDNS block page
            "146.112.61.105",  # OpenDNS block page
            "::1",
        }
        a_records = _dns_query(domain, "A")
        resolved_ips = [r.get("data", "") for r in a_records]

        check = {
            "source": "DNS Sinkhole Check",
            "resolved_ips": resolved_ips[:5],
        }

        sinkholes = [ip for ip in resolved_ips if ip in sinkhole_ips]
        if sinkholes:
            check["status"] = "sinkholed"
            check["flagged"] = True
            out["threats_found"].append(f"DNS resolves to sinkhole IP: {sinkholes[0]}")
        elif not resolved_ips:
            check["status"] = "no_dns"
            check["flagged"] = False
            check["note"] = "Domain does not resolve — may be parked or expired"
        else:
            check["status"] = "normal"
            check["flagged"] = False

        out["checks"].append(check)
    except Exception as e:
        out["checks"].append({"source": "DNS Sinkhole", "status": "check_failed", "error": str(e)})

    # ── Check 4: VirusTotal domain report (public, no API key) ────────────
    try:
        vt_check_url = f"https://www.virustotal.com/api/v3/domains/{domain}"
        # Without API key, we check the public page instead
        _, _, vt_body = _get(f"https://www.virustotal.com/gui/domain/{domain}/detection", timeout=10)
        check = {
            "source": "VirusTotal",
            "check_url": f"https://www.virustotal.com/gui/domain/{domain}",
        }
        # We can't parse the SPA response without JS, so just provide the link
        check["status"] = "manual_check_required"
        check["flagged"] = False
        check["note"] = "VirusTotal requires browser access — use link for full report"
        out["checks"].append(check)
    except Exception as e:
        out["checks"].append({"source": "VirusTotal", "status": "check_failed", "error": str(e)})

    # ── Overall assessment ────────────────────────────────────────────────
    threat_count = len(out["threats_found"])
    if threat_count >= 2:
        out["overall_status"] = "DANGEROUS"
        out["risk_level"] = "CRITICAL"
        out["recommendation"] = (
            "Multiple threat sources flagged this domain. "
            "DO NOT interact with this domain or click any links. "
            "If this is a supplier/partner, consider this a disqualifying red flag."
        )
    elif threat_count == 1:
        out["overall_status"] = "SUSPICIOUS"
        out["risk_level"] = "HIGH"
        out["recommendation"] = (
            "One threat source flagged this domain. "
            "Investigate further before any business interaction. "
            "Check VirusTotal link for detailed community reports."
        )
    else:
        out["overall_status"] = "CLEAN"
        out["risk_level"] = "LOW"
        out["recommendation"] = (
            "No threats detected across checked sources. "
            "Domain appears safe for normal business interaction."
        )

    return json.dumps(out, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
