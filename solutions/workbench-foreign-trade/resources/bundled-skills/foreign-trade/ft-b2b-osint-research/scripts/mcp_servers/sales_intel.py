"""
Sales Intelligence MCP Server
Hunter.io + Apollo.io API integration for OSINT decision-maker research.
"""

import os
import json
import ssl
import time
import urllib.request
import urllib.parse
import urllib.error
import certifi
from fastmcp import FastMCP

_SSL_CTX = ssl.create_default_context(cafile=certifi.where())

mcp = FastMCP("sales-intel", instructions="Sales intelligence tools for finding decision-makers at target companies via Hunter.io and Apollo.io APIs.")

HUNTER_API_KEY = os.environ.get("HUNTER_API_KEY", "")


_MAX_RETRIES = 2
_RETRY_DELAY = 2  # seconds


def _http_get(url: str, retries: int = _MAX_RETRIES) -> dict:
    """HTTP GET with retry, timeout, and friendly error messages."""
    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=30, context=_SSL_CTX) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:500]
            code = e.code
            if code == 401:
                return {"error": f"Hunter.io API key invalid or missing (HTTP 401). Check HUNTER_API_KEY env var."}
            if code == 403:
                return {"error": f"Hunter.io access denied (HTTP 403). This endpoint may require a paid plan. Details: {body}"}
            if code == 429:
                return {"error": "Hunter.io rate limit exceeded (HTTP 429). Wait a minute or check your plan quota with hunter_account_info()."}
            if code >= 500 and attempt < retries:
                time.sleep(_RETRY_DELAY * (attempt + 1))
                last_err = f"Hunter.io server error (HTTP {code}), retrying..."
                continue
            return {"error": f"Hunter.io HTTP {code}: {body}"}
        except urllib.error.URLError as e:
            if attempt < retries:
                time.sleep(_RETRY_DELAY)
                last_err = str(e)
                continue
            return {"error": f"Network error connecting to Hunter.io: {e}. Check internet connection."}
        except TimeoutError:
            if attempt < retries:
                time.sleep(_RETRY_DELAY)
                last_err = "timeout"
                continue
            return {"error": "Hunter.io request timed out after 30s. Try again later."}
        except json.JSONDecodeError:
            return {"error": "Hunter.io returned invalid JSON. API may be experiencing issues."}
    return {"error": f"Hunter.io request failed after {retries + 1} attempts. Last error: {last_err}"}



# ── Hunter.io Tools ──────────────────────────────────────────────────────────

@mcp.tool()
def hunter_domain_search(domain: str, department: str = "", seniority: str = "", limit: int = 10) -> str:
    """Search all emails associated with a domain. Returns employees with names, positions, emails, and LinkedIn profiles.

    Args:
        domain: Company domain to search (e.g. "renogy.com")
        department: Filter by department: executive, it, finance, management, sales, legal, support, hr, marketing, communication, education, design, health, operations
        seniority: Filter by seniority: junior, senior, executive
        limit: Max results (1-10 on free plan)
    """
    params = {"domain": domain, "api_key": HUNTER_API_KEY, "limit": min(limit, 10)}
    if department:
        params["department"] = department
    if seniority:
        params["seniority"] = seniority
    if not HUNTER_API_KEY:
        return json.dumps({"error": "HUNTER_API_KEY not set. Export it as an environment variable."})
    url = f"https://api.hunter.io/v2/domain-search?{urllib.parse.urlencode(params)}"
    result = _http_get(url)
    if "error" in result and "data" not in result:
        return json.dumps(result, ensure_ascii=False, indent=2)
    data = result.get("data", {})
    out = {
        "domain": data.get("domain"),
        "organization": data.get("organization"),
        "email_pattern": data.get("pattern"),
        "total_results": result.get("meta", {}).get("results", 0),
        "emails": []
    }
    for e in data.get("emails", []):
        out["emails"].append({
            "email": e.get("value"),
            "name": f"{e.get('first_name', '')} {e.get('last_name', '')}".strip(),
            "position": e.get("position"),
            "department": e.get("department"),
            "seniority": e.get("seniority"),
            "linkedin": e.get("linkedin"),
            "confidence": e.get("confidence"),
            "verified": e.get("verification", {}).get("status")
        })
    return json.dumps(out, ensure_ascii=False, indent=2)


@mcp.tool()
def hunter_email_finder(domain: str, first_name: str, last_name: str) -> str:
    """Find the email address of a specific person at a company.

    Args:
        domain: Company domain (e.g. "renogy.com")
        first_name: Person's first name
        last_name: Person's last name
    """
    params = {
        "domain": domain,
        "first_name": first_name,
        "last_name": last_name,
        "api_key": HUNTER_API_KEY
    }
    if not HUNTER_API_KEY:
        return json.dumps({"error": "HUNTER_API_KEY not set. Export it as an environment variable."})
    url = f"https://api.hunter.io/v2/email-finder?{urllib.parse.urlencode(params)}"
    result = _http_get(url)
    if "error" in result and "data" not in result:
        return json.dumps(result, ensure_ascii=False, indent=2)
    data = result.get("data", {})
    return json.dumps({
        "email": data.get("email"),
        "score": data.get("score"),
        "position": data.get("position"),
        "linkedin": data.get("linkedin_url"),
        "sources_count": len(data.get("sources", [])),
        "verified": data.get("verification", {}).get("status")
    }, ensure_ascii=False, indent=2)


@mcp.tool()
def hunter_email_verifier(email: str) -> str:
    """Verify if an email address is valid and deliverable.

    Args:
        email: Email address to verify
    """
    if not HUNTER_API_KEY:
        return json.dumps({"error": "HUNTER_API_KEY not set. Export it as an environment variable."})
    params = {"email": email, "api_key": HUNTER_API_KEY}
    url = f"https://api.hunter.io/v2/email-verifier?{urllib.parse.urlencode(params)}"
    result = _http_get(url)
    if "error" in result and "data" not in result:
        return json.dumps(result, ensure_ascii=False, indent=2)
    data = result.get("data", {})
    return json.dumps({
        "email": data.get("email"),
        "result": data.get("result"),
        "score": data.get("score"),
        "status": data.get("status"),
        "disposable": data.get("disposable"),
        "webmail": data.get("webmail"),
        "mx_records": data.get("mx_records")
    }, ensure_ascii=False, indent=2)


@mcp.tool()
def hunter_account_info() -> str:
    """Check Hunter.io account status and remaining API credits."""
    if not HUNTER_API_KEY:
        return json.dumps({"error": "HUNTER_API_KEY not set. Export it as an environment variable."})
    url = f"https://api.hunter.io/v2/account?api_key={HUNTER_API_KEY}"
    result = _http_get(url)
    if "error" in result and "data" not in result:
        return json.dumps(result, ensure_ascii=False, indent=2)
    data = result.get("data", {})
    requests = data.get("requests", {})
    return json.dumps({
        "email": data.get("email"),
        "plan": data.get("plan_name"),
        "searches_used": requests.get("searches", {}).get("used"),
        "searches_available": requests.get("searches", {}).get("available"),
        "verifications_used": requests.get("verifications", {}).get("used"),
        "verifications_available": requests.get("verifications", {}).get("available")
    }, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
