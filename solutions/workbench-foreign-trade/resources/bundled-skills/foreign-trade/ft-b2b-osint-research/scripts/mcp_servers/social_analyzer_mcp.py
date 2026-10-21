"""
Social Analyzer MCP Server
Wraps qeeqbox/social-analyzer for username-based social media OSINT.
1000+ platforms with confidence scoring (0-100).

Tools:
  social_search_username        — general username search across 1000+ platforms
  social_search_multi_usernames — search multiple username variants in parallel
  social_brand_audit            — competitor brand social presence + operational snapshot
  social_person_audit           — B2B decision-maker personal account discovery
"""

import json
import ssl
import urllib.request
import re
import certifi
from fastmcp import FastMCP
from importlib import import_module

_SSL_CTX = ssl.create_default_context(cafile=certifi.where())

mcp = FastMCP(
    "social-analyzer",
    instructions=(
        "Social media OSINT tool. "
        "social_brand_audit: analyze competitor brand presence & operations across platforms. "
        "social_person_audit: find B2B decision-maker personal accounts for outreach. "
        "social_search_username: general 1000+ platform scan by username."
    )
)

# Lazy-load to avoid startup overhead
_sa = None

def _get_sa():
    global _sa
    if _sa is None:
        try:
            _sa = import_module("social-analyzer").SocialAnalyzer(silent=True)
        except ImportError:
            raise RuntimeError(
                "social-analyzer not installed. Run: pip3 install social-analyzer"
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize social-analyzer: {e}")
    return _sa


def _safe_run(sa, **kwargs) -> dict:
    """Run social-analyzer with timeout protection and friendly errors."""
    import signal

    def _timeout_handler(signum, frame):
        raise TimeoutError("social-analyzer scan timed out after 120s")

    old_handler = signal.signal(signal.SIGALRM, _timeout_handler)
    signal.alarm(120)  # 2 min max per scan
    try:
        return sa.run_as_object(**kwargs)
    except TimeoutError:
        return {"error": "Scan timed out after 120s. Try fewer platforms or use mode='fast'."}
    except Exception as e:
        return {"error": f"social-analyzer scan failed: {e}"}
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old_handler)


@mcp.tool()
def social_search_username(
    username: str,
    websites: str = "all",
    mode: str = "fast",
    filter: str = "good",
    top: int = 50,
    metadata: bool = False,
) -> str:
    """
    Search for a person's profiles across 1000+ social media platforms by username.

    Args:
        username: The username or handle to search for (e.g. "johndoe")
        websites: Space-separated list of sites to check, or "all" for full scan.
                  Common options: "twitter linkedin github instagram facebook youtube reddit"
        mode: Detection speed — "fast" (recommended), "slow" (more thorough), "special"
        filter: Confidence threshold — "good" (high confidence only), "maybe", "bad", or "good maybe"
        top: Limit scan to top N most-ranked websites (default 50; use higher for broader scan)
        metadata: Extract additional metadata like bio, avatar, follower count (slower)

    Returns:
        JSON string with detected profiles, confidence scores, and metadata.
        Each result includes: link, rate (0-100%), status, title, country, type.

    Usage examples:
        - Quick check on key platforms: websites="twitter linkedin github instagram"
        - Full broad scan: websites="all", top=100
        - Deep scan with metadata: metadata=True, mode="slow"
    """
    try:
        sa = _get_sa()
    except RuntimeError as e:
        return json.dumps({"error": str(e)})

    results = _safe_run(
        sa,
        username=username,
        websites=websites,
        mode=mode,
        output="json",
        filter=filter,
        top=top,
        metadata=metadata,
        silent=True,
    )
    if "error" in results:
        results["username"] = username
        return json.dumps(results, ensure_ascii=False, indent=2)

    detected = results.get("detected", [])
    unknown = results.get("unknown", [])

    # Clean up output — only keep useful fields
    clean_detected = []
    for r in detected:
        clean_detected.append({
            "platform": r.get("website", ""),
            "link": r.get("link", ""),
            "confidence": r.get("rate", ""),
            "status": r.get("status", ""),
            "title": r.get("title", ""),
            "country": r.get("country", ""),
            "category": r.get("type", ""),
            "language": r.get("language", ""),
            **({"text_preview": r.get("text", "")[:200]} if r.get("text") else {}),
            **({"metadata": r.get("metadata", {})} if metadata and r.get("metadata") else {}),
        })

    summary = {
        "username": username,
        "total_detected": len(detected),
        "total_checked": len(detected) + len(unknown),
        "filter_used": filter,
        "mode": mode,
        "profiles": clean_detected,
    }

    return json.dumps(summary, ensure_ascii=False, indent=2)


@mcp.tool()
def social_search_multi_usernames(
    usernames: str,
    websites: str = "twitter linkedin github instagram facebook",
    mode: str = "fast",
) -> str:
    """
    Search multiple username variations simultaneously (useful when a person may use different handles).

    Args:
        usernames: Space-separated list of usernames to check (e.g. "johndoe john_doe john.doe")
        websites: Space-separated list of platforms to check
        mode: Detection speed — "fast" or "slow"

    Returns:
        JSON with results grouped by username, showing which handles are active where.
    """
    try:
        sa = _get_sa()
    except RuntimeError as e:
        return json.dumps({"error": str(e)})

    username_list = usernames.strip().split()
    all_results = {}

    for uname in username_list:
        results = _safe_run(
            sa,
            username=uname,
            websites=websites,
            mode=mode,
            output="json",
            filter="good maybe",
            silent=True,
        )
        if "error" in results:
            all_results[uname] = {"error": results["error"]}
            continue
        detected = results.get("detected", [])
        all_results[uname] = [
            {
                "platform": r.get("website", ""),
                "link": r.get("link", ""),
                "confidence": r.get("rate", ""),
                "title": r.get("title", ""),
            }
            for r in detected
        ]

    return json.dumps(all_results, ensure_ascii=False, indent=2)


# ── Helpers ──────────────────────────────────────────────────────────────────

_BRAND_PLATFORMS = "facebook twitter linkedin youtube instagram reddit pinterest telegram"
_PERSON_PLATFORMS = "twitter linkedin github instagram facebook reddit medium"

def _fetch_url(url: str, timeout: int = 15) -> str:
    """Fetch raw HTML/text from a public URL. Returns empty string on failure."""
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; OSINT-research-bot/1.0)"},
        )
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception:
        return ""


def _extract_meta(html: str, property_name: str) -> str:
    """Extract <meta property/name content> value from HTML."""
    for pattern in [
        rf'<meta[^>]+property=["\']og:{property_name}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:{property_name}["\']',
        rf'<meta[^>]+name=["\']{property_name}["\'][^>]+content=["\']([^"\']+)["\']',
    ]:
        m = re.search(pattern, html, re.IGNORECASE)
        if m:
            return m.group(1).strip()
    return ""


def _quick_page_snapshot(url: str) -> dict:
    """
    Fetch a public social page and extract OG title, description, follower hints.
    Returns a dict with: title, description, follower_hint, url.
    """
    html = _fetch_url(url)
    if not html:
        return {"url": url, "reachable": False}

    title = _extract_meta(html, "title") or re.search(r"<title>([^<]+)</title>", html, re.I)
    if hasattr(title, "group"):
        title = title.group(1).strip()

    desc = _extract_meta(html, "description")

    # Hunt for follower/subscriber numbers in visible text (heuristic)
    follower_hint = ""
    for pattern in [
        r"([\d,.]+[KkMm]?)\s*(?:Followers|followers|Subscriber|subscriber)",
        r"(?:Followers|followers)[:\s]*([\d,.]+[KkMm]?)",
    ]:
        m = re.search(pattern, html)
        if m:
            follower_hint = m.group(1)
            break

    return {
        "url": url,
        "reachable": True,
        "title": title if isinstance(title, str) else "",
        "description": desc[:300] if desc else "",
        "follower_hint": follower_hint,
    }


# ── Tool: social_brand_audit ─────────────────────────────────────────────────

@mcp.tool()
def social_brand_audit(
    username: str,
    brand_name: str = "",
    platforms: str = "",
    deep_snapshot: bool = True,
) -> str:
    """
    Competitor brand social media audit.
    Discovers which platforms the brand is on, then pulls a quick operational
    snapshot (title, bio/description, follower hint) from each live account.

    Use this for:
    - Mapping a competitor's full social presence
    - Comparing brand positioning across platforms
    - Identifying which channels they invest in vs ignore

    Args:
        username:     Brand's social username/handle (e.g. "ankerinnovations")
        brand_name:   Human-readable brand name for the report (optional)
        platforms:    Space-separated platform list, or "" for default brand set
                      Default: facebook twitter linkedin youtube instagram reddit pinterest telegram
        deep_snapshot: Fetch each discovered account for bio/follower data (default True)

    Returns:
        JSON with platform_map (presence by channel), snapshots (bio/followers per platform),
        and a positioning_summary derived from bio texts.
    """
    try:
        sa = _get_sa()
    except RuntimeError as e:
        return json.dumps({"error": str(e)})

    scan_sites = platforms.strip() if platforms.strip() else _BRAND_PLATFORMS

    results = _safe_run(
        sa,
        username=username,
        websites=scan_sites,
        mode="fast",
        output="json",
        filter="good maybe",
        metadata=False,
        silent=True,
    )
    if "error" in results:
        results["username"] = username
        return json.dumps(results, ensure_ascii=False, indent=2)

    detected = results.get("detected", [])

    platform_map = {}
    snapshots = []

    for r in detected:
        link = r.get("link", "")
        conf = r.get("rate", "")
        title = r.get("title", "")

        # Derive platform name from URL domain
        domain_m = re.search(r"https?://(?:www\.|mobile\.)?([^/]+)", link)
        platform = domain_m.group(1).split(".")[0].capitalize() if domain_m else link

        entry = {
            "platform": platform,
            "link": link,
            "confidence": conf,
            "display_title": title,
        }

        if deep_snapshot and link:
            snap = _quick_page_snapshot(link)
            entry["bio"] = snap.get("description", "")
            entry["follower_hint"] = snap.get("follower_hint", "")
            entry["page_title"] = snap.get("title", "")
            entry["reachable"] = snap.get("reachable", False)

        platform_map[platform] = link
        snapshots.append(entry)

    # Derive a positioning summary from collected bios
    bios = [s["bio"] for s in snapshots if s.get("bio")]
    positioning_note = (
        "Multiple bio texts collected — see snapshots for per-platform positioning."
        if len(bios) > 1
        else (bios[0][:400] if bios else "No bio data retrievable from public pages.")
    )

    return json.dumps({
        "brand": brand_name or username,
        "username_searched": username,
        "platforms_found": len(detected),
        "platforms_scanned": scan_sites,
        "platform_map": platform_map,
        "positioning_summary": positioning_note,
        "snapshots": snapshots,
    }, ensure_ascii=False, indent=2)


# ── Tool: social_person_audit ────────────────────────────────────────────────

@mcp.tool()
def social_person_audit(
    full_name: str,
    company: str = "",
    username_hints: str = "",
    platforms: str = "",
) -> str:
    """
    B2B decision-maker personal social account discovery.
    Searches likely username variants derived from the person's name,
    then snapshots each found account to surface content focus and activity.

    Use this for:
    - Finding where a prospect is personally active before outreach
    - Understanding their professional interests / pain points from public posts
    - Identifying the best platform and topic angle for first contact

    Args:
        full_name:      Person's full name (e.g. "Ivan Lin")
        company:        Their company (used as context, not searched directly)
        username_hints: Known username(s) to also check, space-separated (optional)
        platforms:      Space-separated platform list, or "" for default person set
                        Default: twitter linkedin github instagram facebook reddit medium

    Returns:
        JSON with found accounts per username variant, per-platform snapshots,
        and an outreach_intel summary (best platform + suggested angle).
    """
    try:
        sa = _get_sa()
    except RuntimeError as e:
        return json.dumps({"error": str(e)})

    scan_sites = platforms.strip() if platforms.strip() else _PERSON_PLATFORMS

    # Generate username variants from full name
    parts = full_name.strip().lower().split()
    variants = set()
    if len(parts) >= 2:
        first, last = parts[0], parts[-1]
        variants.update([
            f"{first}{last}",
            f"{first}.{last}",
            f"{first}_{last}",
            f"{first[0]}{last}",
            f"{first}{last[0]}",
            f"{last}{first}",
        ])
    elif parts:
        variants.add(parts[0])

    # Add any explicit hints
    for hint in username_hints.strip().split():
        variants.add(hint.lower())

    all_found = {}
    for variant in sorted(variants):
        r = _safe_run(
            sa,
            username=variant,
            websites=scan_sites,
            mode="fast",
            output="json",
            filter="good",
            silent=True,
        )
        if "error" in r:
            continue
        detected = r.get("detected", [])
        if detected:
            accounts = []
            for acc in detected:
                link = acc.get("link", "")
                entry = {
                    "link": link,
                    "confidence": acc.get("rate", ""),
                    "display_title": acc.get("title", ""),
                }
                if link:
                    snap = _quick_page_snapshot(link)
                    entry["bio"] = snap.get("description", "")
                    entry["reachable"] = snap.get("reachable", False)
                accounts.append(entry)
            all_found[variant] = accounts

    # Build outreach intel: which platforms had hits + bio snippets
    active_platforms = {}
    for variant, accounts in all_found.items():
        for acc in accounts:
            domain_m = re.search(r"https?://(?:www\.)?([^/]+)", acc.get("link", ""))
            if domain_m:
                plat = domain_m.group(1).split(".")[0].capitalize()
                if plat not in active_platforms:
                    active_platforms[plat] = {
                        "link": acc["link"],
                        "bio": acc.get("bio", ""),
                        "confidence": acc["confidence"],
                    }

    outreach_intel = {
        "person": full_name,
        "company": company,
        "active_on": list(active_platforms.keys()),
        "recommended_platform": (
            next(
                (p for p in ["Linkedin", "Twitter", "Github"] if p in active_platforms),
                list(active_platforms.keys())[0] if active_platforms else "Unknown"
            )
        ),
        "platform_details": active_platforms,
    }

    return json.dumps({
        "person": full_name,
        "company": company,
        "variants_searched": sorted(variants),
        "variants_with_hits": list(all_found.keys()),
        "outreach_intel": outreach_intel,
        "raw_results": all_found,
    }, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
