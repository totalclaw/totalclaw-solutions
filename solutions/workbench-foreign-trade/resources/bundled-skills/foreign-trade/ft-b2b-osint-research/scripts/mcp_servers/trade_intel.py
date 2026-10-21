"""
Trade Intelligence MCP Server
B2B 外贸尽调专用工具集，四个核心功能按优先级排列：

  1. import_history_lookup    — ImportYeti 进出口历史（买家实际采购记录）
  2. procurement_intent_check — 采购意向信号检测（是否处于主动买货阶段）
  3. payment_risk_score       — 付款风险复合评分（外贸收款安全评估）
  4. sanctions_check          — 制裁名单自动命中检测（OFAC / Trade.gov CSL）
"""

import json
import ssl
import urllib.request
import urllib.parse
import re
import certifi
from datetime import datetime, timezone
from fastmcp import FastMCP

_SSL_CTX = ssl.create_default_context(cafile=certifi.where())

mcp = FastMCP(
    "trade-intel",
    instructions=(
        "Foreign trade B2B due diligence tools. "
        "import_history_lookup: verify real import activity via ImportYeti US customs records. "
        "procurement_intent_check: detect active buying signals (hiring/funding/trade shows). "
        "payment_risk_score: composite payment risk score with recommended payment terms. "
        "sanctions_check: screen against OFAC SDN and Trade.gov Consolidated Screening List."
    ),
)


# ── HTTP helpers ──────────────────────────────────────────────────────────────

def _get_html(url: str, timeout: int = 20) -> str:
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        return f"__ERR__:{e}"


def _get_json(url: str, timeout: int = 20) -> dict:
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "OSINT-trade-intel/1.0",
                "Accept": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"__error__": str(e)}


def _google_search_html(query: str, time_range: str = "") -> str:
    """Fetch Google search results HTML for a query."""
    params = {"q": query, "num": "8", "hl": "en"}
    if time_range:
        params["tbs"] = time_range  # e.g. "qdr:y" = past year
    url = "https://www.google.com/search?" + urllib.parse.urlencode(params)
    return _get_html(url)


# ── Tool 1: import_history_lookup ─────────────────────────────────────────────

@mcp.tool()
def import_history_lookup(
    company_name: str,
    country: str = "US",
) -> str:
    """
    Look up a company's US import records via ImportYeti (US Customs Bill of Lading data).

    This is the #1 check for verifying a buyer is real and actively importing:
    - Confirms the company actually imports (not just a paper/broker company)
    - Reveals their current Chinese/Asian suppliers (your direct competitors)
    - Shows shipment volume and frequency
    - Exposes product categories they source

    Args:
        company_name: Buyer company name (e.g. "Renogy", "BougeRV", "Goal Zero")
        country:      Buyer's country — ImportYeti primarily covers US imports (default "US")

    Returns:
        JSON with: status, total_shipments, identified_suppliers, product_categories,
        trade_activity_signal, importyeti_url, and interpretation.
    """
    slug = re.sub(r"[^a-z0-9]+", "-", company_name.lower()).strip("-")
    url = f"https://www.importyeti.com/company/{slug}"
    html = _get_html(url)

    out = {
        "company": company_name,
        "country": country,
        "importyeti_url": url,
        "data_source": "ImportYeti — US Customs Bill of Lading records",
    }

    if html.startswith("__ERR__"):
        out["status"] = "fetch_failed"
        out["error"] = html[8:]
        out["fallback"] = f"Open manually: {url}"
        return json.dumps(out, ensure_ascii=False, indent=2)

    # 404 / not found detection
    if len(html) < 3000 or "page not found" in html.lower() or "404" in html[:200]:
        out["status"] = "not_found"
        out["note"] = (
            "Company not in ImportYeti. Possible reasons: "
            "(1) No US imports on record, "
            "(2) Imports under a different legal name, "
            "(3) Company too small to appear in customs records. "
            "Consider checking ImportYeti manually with alternate spellings."
        )
        return json.dumps(out, ensure_ascii=False, indent=2)

    # ── Extract shipment count ────────────────────────────────────────────
    ship_m = re.search(r"([\d,]+)\s*[Ss]hipments?", html)
    total_shipments = ship_m.group(1) if ship_m else "unknown"

    # ── Extract Chinese supplier names from bill of lading text ──────────
    # BL records typically contain shipper city names in caps
    supplier_raw = re.findall(
        r"(?:SHENZHEN|GUANGDONG|FUJIAN|ZHEJIANG|JIANGSU|SHANGHAI|BEIJING|"
        r"HANGZHOU|SUZHOU|NINGBO|DONGGUAN|FOSHAN|GUANGZHOU|WUHAN|CHENGDU|"
        r"TIANJIN|QINGDAO|XIAMEN|CHANGSHA)\s+[A-Z][A-Z\s&]+?"
        r"(?:CO\.|LTD|CORP|INC|LLC|TECHNOLOGY|ELECTRONICS|MANUFACTURING|"
        r"INDUSTRIAL|ENERGY|SOLAR|POWER|GROUP|INTERNATIONAL)[\.,\s]",
        html[:60000],
        re.IGNORECASE,
    )
    suppliers = list(dict.fromkeys([s.strip().rstrip(".,") for s in supplier_raw]))[:10]

    # ── Extract product keywords ──────────────────────────────────────────
    kw_pattern = (
        r"\b(SOLAR|BATTERY|CHARGER|PANEL|INVERTER|POWER STATION|LITHIUM|"
        r"LED|CABLE|MOTOR|PUMP|VALVE|SENSOR|MODULE|CONTROLLER|GENERATOR|"
        r"CONVERTER|ADAPTER|SWITCH|RELAY|MONITOR|TRACKER|MOUNT)\b"
    )
    kws = re.findall(kw_pattern, html[:40000], re.IGNORECASE)
    product_categories = list(dict.fromkeys([k.upper() for k in kws]))[:8]

    # ── Last shipment date ────────────────────────────────────────────────
    date_m = re.search(
        r"(?:last shipment|most recent|latest)[:\s]*([\w]+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})",
        html,
        re.IGNORECASE,
    )
    last_shipment = date_m.group(1).strip() if date_m else "unknown"

    # ── Page title confirms company ───────────────────────────────────────
    title_m = re.search(r"<title>([^<]+)</title>", html, re.IGNORECASE)
    page_title = title_m.group(1).strip() if title_m else ""

    status = "found" if (ship_m or suppliers) else "partial_data"

    out.update(
        {
            "status": status,
            "page_title": page_title,
            "total_shipments": total_shipments,
            "last_shipment_date": last_shipment,
            "identified_suppliers": suppliers,
            "product_categories": product_categories,
            "trade_activity_signal": (
                "active_importer" if suppliers or (total_shipments != "unknown")
                else "insufficient_data"
            ),
            "interpretation": (
                f"Shipments on record: {total_shipments}. "
                + (
                    f"Current suppliers include: {', '.join(suppliers[:3])}. "
                    if suppliers
                    else "Supplier names not parseable from page preview — open URL for full data. "
                )
                + (
                    f"Product focus: {', '.join(product_categories[:4])}."
                    if product_categories
                    else ""
                )
            ).strip(),
        }
    )
    return json.dumps(out, ensure_ascii=False, indent=2)


# ── Tool 2: procurement_intent_check ─────────────────────────────────────────

@mcp.tool()
def procurement_intent_check(
    company_name: str,
    domain: str = "",
    industry_keywords: str = "",
) -> str:
    """
    Detect if a company is currently in an active buying/procurement phase.

    Answers: "Is NOW the right time to contact this buyer?"

    Signals checked (all from public data):
    - LinkedIn hiring: Procurement / Sourcing / Supply Chain job postings
    - Recent funding: Closed financing round in last 12 months (budget signal)
    - Website activity: Recent content dates on their site
    - Trade show presence: Exhibitor / attendee signals
    - Business growth signals: Expansion, new product, partnership news

    Args:
        company_name:      Company name (e.g. "Renogy", "BougeRV Solar")
        domain:            Company domain if known (e.g. "renogy.com") for website check
        industry_keywords: Product keywords relevant to your category
                           (e.g. "solar panels lithium battery") for trade show detection

    Returns:
        JSON with intent_score (0-100), timing_recommendation, and per-signal breakdown.
    """
    signals = []
    intent_score = 0

    # ── Signal 1: LinkedIn procurement hiring ─────────────────────────────
    lq = f'"{company_name}" site:linkedin.com/jobs (procurement OR sourcing OR "supply chain" OR purchasing OR buyer)'
    lhtml = _google_search_html(lq)
    found_roles = [
        r for r in ["procurement", "sourcing", "supply chain", "purchasing", "buyer", "category manager"]
        if r in lhtml.lower()
    ]
    if found_roles:
        add = min(30, len(found_roles) * 8)
        intent_score += add
        signals.append({
            "type": "LinkedIn Hiring",
            "triggered": True,
            "detail": f"Procurement-related job postings detected: {', '.join(found_roles[:3])}",
            "score": add,
            "meaning": "Active hiring in procurement = approved budget, expanding purchasing capacity",
        })
    else:
        signals.append({
            "type": "LinkedIn Hiring",
            "triggered": False,
            "detail": "No active procurement hiring detected",
            "score": 0,
            "meaning": "May be in maintenance mode or using existing procurement team",
        })

    # ── Signal 2: Recent funding ──────────────────────────────────────────
    fq = f'"{company_name}" funding raised million 2024 OR 2025 OR 2026'
    fhtml = _google_search_html(fq, time_range="qdr:y")
    found_funding = [
        t for t in ["raised", "series a", "series b", "series c", "funding round", "investment", "venture"]
        if t in fhtml.lower()
    ]
    if len(found_funding) >= 2:
        add = 25
        intent_score += add
        signals.append({
            "type": "Recent Funding",
            "triggered": True,
            "detail": f"Funding signals: {', '.join(found_funding[:3])}",
            "score": add,
            "meaning": "Fresh capital = budget available, likely in growth/procurement phase",
        })
    else:
        signals.append({
            "type": "Recent Funding",
            "triggered": False,
            "detail": "No recent funding news found",
            "score": 0,
            "meaning": "Bootstrapped or funding not publicly announced",
        })

    # ── Signal 3: Website activity ────────────────────────────────────────
    if domain:
        site_html = _get_html(f"https://{domain}", timeout=12)
        if not site_html.startswith("__ERR__"):
            recent = re.findall(r"20(24|25|26)[-/](0[1-9]|1[0-2])", site_html[:25000])
            if recent:
                add = 15
                intent_score += add
                signals.append({
                    "type": "Website Activity",
                    "triggered": True,
                    "detail": f"Recent content dates found ({len(recent)} instances of 2024/2025/2026)",
                    "score": add,
                    "meaning": "Actively maintained website = operationally live company",
                })
            else:
                signals.append({
                    "type": "Website Activity",
                    "triggered": False,
                    "detail": "Website reachable but no recent date signals",
                    "score": 0,
                })
        else:
            signals.append({"type": "Website Activity", "triggered": False, "detail": f"Could not reach {domain}", "score": 0})
    else:
        signals.append({"type": "Website Activity", "triggered": False, "detail": "No domain provided — skipped", "score": 0})

    # ── Signal 4: Trade show presence ─────────────────────────────────────
    show_terms_q = industry_keywords if industry_keywords else company_name
    sq = f'"{company_name}" ({show_terms_q}) exhibitor OR "trade show" OR "trade fair" 2025 OR 2026'
    shtml = _google_search_html(sq)
    found_shows = [t for t in ["exhibitor", "trade show", "trade fair", "booth", "expo", "exhibition"] if t in shtml.lower()]
    if len(found_shows) >= 2:
        add = 20
        intent_score += add
        signals.append({
            "type": "Trade Show Presence",
            "triggered": True,
            "detail": f"Trade show signals: {', '.join(found_shows[:3])}",
            "score": add,
            "meaning": "Attending/exhibiting = actively sourcing products/suppliers",
        })
    else:
        signals.append({
            "type": "Trade Show Presence",
            "triggered": False,
            "detail": "No trade show signals found",
            "score": 0,
        })

    # ── Signal 5: Growth / expansion news ────────────────────────────────
    gq = f'"{company_name}" expanding growth "new product" OR "product launch" OR partnership 2025 OR 2026'
    ghtml = _google_search_html(gq, time_range="qdr:y")
    found_growth = [t for t in ["expanding", "growth", "new product", "launch", "partnership", "expansion", "record"] if t in ghtml.lower()]
    if len(found_growth) >= 2:
        add = 10
        intent_score += add
        signals.append({
            "type": "Growth Signals",
            "triggered": True,
            "detail": f"Business growth signals: {', '.join(found_growth[:3])}",
            "score": add,
            "meaning": "Active growth = procurement needs expanding",
        })
    else:
        signals.append({"type": "Growth Signals", "triggered": False, "detail": "No growth signals", "score": 0})

    # ── Timing recommendation ─────────────────────────────────────────────
    triggered = len([s for s in signals if s["triggered"]])
    if intent_score >= 55:
        timing = "NOW — High Intent"
        timing_note = "Multiple active buying signals. Reach out immediately — window may be narrow."
        timing_color = "hot"
    elif intent_score >= 30:
        timing = "SOON — Moderate Signals"
        timing_note = "Some active signals. Good time to initiate contact and qualify interest."
        timing_color = "warm"
    else:
        timing = "NURTURE — Low Immediate Intent"
        timing_note = "No strong active buying signals. Add to nurture, revisit in 30–60 days."
        timing_color = "cold"

    return json.dumps(
        {
            "company": company_name,
            "intent_score": intent_score,
            "intent_score_max": 100,
            "signals_triggered": triggered,
            "timing_recommendation": timing,
            "timing_color": timing_color,
            "timing_note": timing_note,
            "signal_breakdown": signals,
        },
        ensure_ascii=False,
        indent=2,
    )


# ── Tool 3: payment_risk_score ────────────────────────────────────────────────

@mcp.tool()
def payment_risk_score(
    company_name: str,
    country: str,
    registration_years: float = -1,
    employee_count: int = -1,
    has_litigation_record: bool = False,
    trustpilot_rating: float = -1,
    has_physical_address_verified: bool = True,
    order_size_usd: float = 0,
    has_import_history: bool = False,
    additional_risk_notes: str = "",
) -> str:
    """
    Composite payment risk assessment for foreign trade B2B transactions.
    Outputs a risk tier, recommended payment terms, and protective contract clauses.

    This is the final step before accepting an order — determines HOW to structure payment:
    - 100% prepayment vs 50% deposit vs Net 30
    - Whether to require Letter of Credit
    - Whether to buy trade credit insurance

    Args:
        company_name:                Company being assessed
        country:                     Buyer's country (e.g. "United States", "Nigeria", "Germany")
        registration_years:          Years since company registration (-1 = unknown)
        employee_count:              Number of employees (-1 = unknown)
        has_litigation_record:       Has known court cases / enforcement actions
        trustpilot_rating:           Score on Trustpilot/G2 (1.0–5.0, -1 = not found)
        has_physical_address_verified: Physical office address confirmed
        order_size_usd:              Expected order value in USD (0 = unknown)
        has_import_history:          ImportYeti or similar shows prior trade activity
        additional_risk_notes:       Free-text notes from investigation (e.g. "refused to pay before")

    Returns:
        JSON with risk_score (0-100), risk_tier, recommended_payment_terms,
        contract_clauses, red_flags, yellow_flags.
    """
    risk_score = 0
    red_flags = []
    yellow_flags = []
    green_signals = []

    # Factor 1: Company age
    if registration_years == -1:
        risk_score += 15
        yellow_flags.append("Company registration age unknown — unverifiable track record")
    elif registration_years < 1:
        risk_score += 35
        red_flags.append(f"Company is less than 1 year old ({registration_years:.1f}y) — very high new-entity risk")
    elif registration_years < 2:
        risk_score += 22
        yellow_flags.append(f"Company registered only {registration_years:.1f} years ago — limited track record")
    elif registration_years < 5:
        risk_score += 8
        yellow_flags.append(f"Company registered {registration_years:.1f} years ago — moderate track record")
    else:
        green_signals.append(f"Established company ({registration_years:.0f}+ years)")

    # Factor 2: Employee count
    if employee_count == -1:
        risk_score += 10
        yellow_flags.append("Employee count unknown — cannot verify operational scale")
    elif employee_count < 5:
        risk_score += 28
        red_flags.append(f"Micro company ({employee_count} employees) — very limited operational capacity")
    elif employee_count < 20:
        risk_score += 12
        yellow_flags.append(f"Small company ({employee_count} employees) — verify capacity matches order size")
    elif employee_count >= 100:
        green_signals.append(f"Substantial company size ({employee_count}+ employees)")

    # Factor 3: Order size vs company scale mismatch
    if order_size_usd > 0 and employee_count > 0 and employee_count != -1:
        est_revenue = employee_count * 150_000  # rough B2B per-employee estimate
        if order_size_usd > est_revenue * 0.6:
            risk_score += 18
            yellow_flags.append(
                f"Order size ${order_size_usd:,.0f} is large relative to estimated revenue "
                f"(~${est_revenue:,.0f} based on headcount) — verify buyer can fund this order"
            )

    # Factor 4: Litigation / legal record
    if has_litigation_record:
        risk_score += 32
        red_flags.append("Known litigation or enforcement record — high payment dispute risk")

    # Factor 5: Reputation score
    if trustpilot_rating == -1:
        risk_score += 6
        yellow_flags.append("No third-party review platform presence — limited public reputation data")
    elif trustpilot_rating < 2.0:
        risk_score += 28
        red_flags.append(f"Very poor reputation score ({trustpilot_rating}/5) — significant customer complaint history")
    elif trustpilot_rating < 3.0:
        risk_score += 15
        yellow_flags.append(f"Below-average reputation ({trustpilot_rating}/5)")
    elif trustpilot_rating >= 4.0:
        green_signals.append(f"Good reputation score ({trustpilot_rating}/5)")

    # Factor 6: Physical address verification
    if not has_physical_address_verified:
        risk_score += 22
        red_flags.append("Physical business address unverifiable — potential virtual/shell company")
    else:
        green_signals.append("Physical address verified")

    # Factor 7: Prior import history
    if has_import_history:
        risk_score = max(0, risk_score - 12)
        green_signals.append("Prior import/trade history confirmed — real operating business")
    else:
        risk_score += 10
        yellow_flags.append("No prior import history found — cannot confirm active trade operations")

    # Factor 8: Country risk
    HIGH_RISK = [
        "nigeria", "ghana", "cameroon", "kenya", "ethiopia", "venezuela", "iran", "syria",
        "north korea", "dprk", "myanmar", "burma", "somalia", "sudan", "libya",
        "russia", "belarus", "cuba", "zimbabwe",
    ]
    MEDIUM_RISK = [
        "brazil", "argentina", "egypt", "pakistan", "bangladesh", "indonesia",
        "philippines", "turkey", "mexico", "south africa", "ukraine", "india",
        "vietnam", "sri lanka", "cambodia",
    ]
    LOW_RISK = [
        "united states", "us", "canada", "germany", "uk", "united kingdom",
        "france", "netherlands", "australia", "japan", "south korea",
        "singapore", "switzerland", "sweden", "norway", "denmark",
    ]
    cl = country.lower()
    if any(c in cl for c in HIGH_RISK):
        risk_score += 35
        red_flags.append(f"High-risk country: {country} — payment enforcement and currency transfer challenges")
    elif any(c in cl for c in MEDIUM_RISK):
        risk_score += 15
        yellow_flags.append(f"Medium-risk country: {country} — consider stronger payment security")
    elif any(c in cl for c in LOW_RISK):
        risk_score = max(0, risk_score - 5)
        green_signals.append(f"Low-risk country: {country}")

    # Factor 9: Additional notes scan for risk keywords
    if additional_risk_notes:
        note_risks = ["fraud", "scam", "blacklist", "bounced", "dispute", "fake", "refused", "chargeback", "never paid"]
        if any(w in additional_risk_notes.lower() for w in note_risks):
            risk_score += 30
            red_flags.append(f"Additional notes contain risk keywords — review carefully")

    risk_score = min(100, max(0, risk_score))

    # ── Determine tier & payment terms ───────────────────────────────────
    if risk_score >= 65 or len(red_flags) >= 2:
        tier = "HIGH RISK"
        terms = "100% T/T payment in advance before production starts. No exceptions."
        clauses = [
            "100% prepayment — funds must clear before production begins",
            "No credit terms regardless of relationship length",
            "Consider requiring irrevocable Letter of Credit (L/C) from a top-tier bank",
            "Document all communications via email — no verbal agreements",
            "Do not ship without written release from finance team",
            "Consider trade credit insurance (Sinosure / Coface / Atradius)",
        ]
        summary = "Do not proceed without full prepayment or bank guarantee. Consider declining if red flags are structural."
    elif risk_score >= 38 or len(red_flags) >= 1 or len(yellow_flags) >= 3:
        tier = "MEDIUM RISK"
        terms = "50% T/T deposit before production + 50% before shipment. Or Irrevocable L/C at sight."
        clauses = [
            "Minimum 50% deposit before production start",
            "Balance due and cleared before Bill of Lading release",
            "Consider trade credit insurance for orders above $50,000",
            "Include ICC arbitration clause (Singapore or London seat)",
            "Annual credit review required if extending future open terms",
            "Limit credit exposure to one order at a time until 3+ successful cycles",
        ]
        summary = "Proceed with enhanced payment protection. Do not extend open credit until relationship is established."
    else:
        tier = "LOW RISK"
        terms = "30% deposit + 70% within 30 days of B/L. Or Net 30–60 after established relationship."
        clauses = [
            "Standard payment terms applicable",
            "Consider Net 30 terms after 3 successful transactions",
            "Annual credit limit review recommended",
            "Monitor for changes in ownership, management, or country risk",
        ]
        summary = "Proceed with standard terms. Set annual review date."

    return json.dumps(
        {
            "company": company_name,
            "country": country,
            "risk_score": risk_score,
            "risk_score_max": 100,
            "risk_tier": tier,
            "overall_recommendation": summary,
            "recommended_payment_terms": terms,
            "contract_protection_clauses": clauses,
            "red_flags": red_flags,
            "yellow_flags": yellow_flags,
            "green_signals": green_signals,
            "factors_input": {
                "registration_years": registration_years,
                "employee_count": employee_count,
                "has_litigation": has_litigation_record,
                "trustpilot_rating": trustpilot_rating,
                "address_verified": has_physical_address_verified,
                "import_history": has_import_history,
                "order_size_usd": order_size_usd,
            },
            "disclaimer": (
                "For reference only. Combine with formal due diligence. "
                "Not a substitute for legal or financial advice."
            ),
        },
        ensure_ascii=False,
        indent=2,
    )


# ── Tool 4: sanctions_check ───────────────────────────────────────────────────

@mcp.tool()
def sanctions_check(
    entity_name: str,
    entity_type: str = "company",
    country: str = "",
) -> str:
    """
    Screen a company or person against major international sanctions lists.

    Lists checked:
    - Trade.gov Consolidated Screening List (CSL): combines OFAC SDN, BIS Denied Persons,
      DDTC, FSE, MBS, DTC, ISN, PLC, CAP, UVML — the most comprehensive free US list
    - OFAC manual check URL provided as backup

    This is the FIRST step in any due diligence — a sanctions hit means STOP.
    Any transaction with a sanctioned entity violates US law (IEEPA/TWEA/OFAC regulations)
    and can result in civil/criminal penalties regardless of where you are located.

    Args:
        entity_name:  Company or person name to screen (e.g. "Huawei Technologies")
        entity_type:  "company" or "person"
        country:      Entity's country (optional, helps reduce false positives)

    Returns:
        JSON with overall_status, risk_level, hits (if any), and recommended_action.
    """
    out = {
        "entity": entity_name,
        "entity_type": entity_type,
        "country": country,
        "lists_checked": [],
        "hits": [],
        "overall_status": "CLEAR",
        "risk_level": "LOW",
        "recommended_action": "No sanctions hits found. Proceed with normal due diligence.",
        "manual_check_url": "https://sanctionssearch.ofac.treas.gov/",
        "un_check_url": "https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list",
    }

    # ── Primary: Trade.gov Consolidated Screening List API ────────────────
    csl_params = {"name": entity_name, "fuzzy_name": "true"}
    if country:
        csl_params["countries"] = country.upper()[:2]  # ISO-2

    csl_url = (
        "https://api.trade.gov/gateway/v1/consolidated_screening_list/search?"
        + urllib.parse.urlencode(csl_params)
    )
    csl_data = _get_json(csl_url)

    if "__error__" not in csl_data:
        out["lists_checked"].append("Trade.gov CSL (OFAC SDN + BIS DPL + DDTC + 8 more lists)")
        total = csl_data.get("total", 0)
        if total > 0:
            for hit in csl_data.get("results", [])[:5]:
                out["hits"].append(
                    {
                        "source_list": hit.get("source", ""),
                        "name": hit.get("name", ""),
                        "aliases": hit.get("alt_names", [])[:4],
                        "entity_type": hit.get("type", ""),
                        "programs": hit.get("programs", []),
                        "country": [
                            a.get("country", "") for a in hit.get("addresses", []) if a.get("country")
                        ][:2],
                        "id": hit.get("id", ""),
                        "remarks": hit.get("remarks", "")[:200],
                    }
                )
    else:
        # Fallback: note API unavailable, provide manual check URLs
        out["lists_checked"].append("Trade.gov CSL — API unavailable, manual check required")
        out["api_note"] = (
            f"Trade.gov CSL API returned error: {csl_data['__error__']}. "
            "Manually check: https://sanctionssearch.ofac.treas.gov/"
        )

    # ── Fallback: Google-based OFAC name check ────────────────────────────
    if not out["hits"]:
        g_html = _google_search_html(f'"{entity_name}" OFAC sanctions SDN list')
        ofac_signals = ["sanctioned", "ofac", "sdn list", "specially designated", "blocked person"]
        found_signals = [s for s in ofac_signals if s in g_html.lower()]
        if len(found_signals) >= 2:
            out["lists_checked"].append("Google OFAC signal check (heuristic fallback)")
            out["google_signals_found"] = found_signals
            out["google_note"] = (
                "Google results contain OFAC-related terms for this entity. "
                "This is a heuristic signal, NOT a confirmed hit. "
                "Manually verify at: https://sanctionssearch.ofac.treas.gov/"
            )

    # ── Evaluate result ───────────────────────────────────────────────────
    if out["hits"]:
        # Check name similarity for strong vs weak matches
        name_lower = entity_name.lower()
        strong = [
            h for h in out["hits"]
            if name_lower in h["name"].lower() or h["name"].lower() in name_lower
        ]
        if strong:
            out["overall_status"] = "HIT — STRONG MATCH"
            out["risk_level"] = "CRITICAL"
            out["recommended_action"] = (
                "STOP ALL TRANSACTIONS IMMEDIATELY. "
                "A strong sanctions match was found. "
                "Any transaction may violate US law (IEEPA/OFAC regulations). "
                "Consult qualified trade compliance counsel before any further action."
            )
        else:
            out["overall_status"] = "PARTIAL MATCH — MANUAL REVIEW REQUIRED"
            out["risk_level"] = "HIGH"
            out["recommended_action"] = (
                "Potential sanctions match found. Do not proceed until legal counsel confirms "
                "this hit does not apply to your specific counterparty. "
                "Verify full record at: https://sanctionssearch.ofac.treas.gov/"
            )
    elif out.get("google_signals_found"):
        out["overall_status"] = "HEURISTIC SIGNAL — VERIFY MANUALLY"
        out["risk_level"] = "MEDIUM"
        out["recommended_action"] = (
            "Google results suggest possible sanctions association. "
            "Manually verify before proceeding: https://sanctionssearch.ofac.treas.gov/"
        )
    elif "api_note" in out:
        # 名单接口没查成时不能报 CLEAR（上游原版此处会误报 CLEAR / LOW）
        out["overall_status"] = "NOT CHECKED — LIST API UNAVAILABLE"
        out["risk_level"] = "UNKNOWN"
        out["recommended_action"] = (
            "The screening list API could not be queried, so nothing was checked. "
            "Screen manually at https://sanctionssearch.ofac.treas.gov/ or with the official CSL files."
        )
    else:
        out["overall_status"] = "CLEAR"
        out["risk_level"] = "LOW"
        out["recommended_action"] = (
            "No sanctions hits found in checked lists. "
            "Proceed with normal due diligence. "
            "Note: This does not guarantee full compliance — always verify specific trade terms, "
            "end-use, and destination country restrictions."
        )

    out["checked_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")  # 上游写死 "2026-03-05"
    return json.dumps(out, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
