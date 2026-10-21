"""
SpiderFoot MCP Server
本地 SpiderFoot 4.0 的 MCP 封装，提供三个工具：

  1. spiderfoot_scan       — 启动扫描并等待结果（域名/IP/邮箱/用户名/人名）
  2. spiderfoot_scan_quick  — 仅被动模块快速扫描（不主动触碰目标）
  3. spiderfoot_results     — 查询已完成扫描的结果

SpiderFoot 必须在本地运行：python3 sf.py -l 127.0.0.1:5001
"""

import json
import time
import urllib.request
import urllib.parse
from fastmcp import FastMCP

SF_BASE = "http://127.0.0.1:5001"

mcp = FastMCP(
    "spiderfoot",
    instructions=(
        "Local SpiderFoot OSINT scanner. "
        "spiderfoot_scan: run a full scan on a domain/IP/email/username/person name. "
        "spiderfoot_scan_quick: passive-only scan (no active probing). "
        "spiderfoot_results: retrieve results from a completed scan."
    ),
)


def _sf_request(path: str, params: dict = None, method: str = "GET") -> str:
    """Make a request to SpiderFoot web API."""
    url = f"{SF_BASE}/{path}"
    if params and method == "GET":
        url += "?" + urllib.parse.urlencode(params)

    headers = {"Accept": "application/json"}

    if method == "POST" and params:
        data = urllib.parse.urlencode(params).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    else:
        req = urllib.request.Request(url, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    except Exception as e:
        return json.dumps({"error": str(e)})


def _wait_for_scan(scan_id: str, timeout: int = 300, poll_interval: int = 5) -> dict:
    """Poll scan status until finished or timeout."""
    elapsed = 0
    while elapsed < timeout:
        raw = _sf_request("scanstatus", {"id": scan_id})
        try:
            status = json.loads(raw)
        except json.JSONDecodeError:
            return {"error": "Failed to parse scan status", "raw": raw}

        if not status:
            return {"error": "Scan not found", "scan_id": scan_id}

        # status[5] is the scan status string
        scan_status = status[5] if len(status) > 5 else "UNKNOWN"

        if scan_status in ("FINISHED", "ABORTED", "ERROR-FAILED"):
            return {
                "scan_id": scan_id,
                "status": scan_status,
                "target": status[1] if len(status) > 1 else "",
                "started": status[3] if len(status) > 3 else "",
                "ended": status[4] if len(status) > 4 else "",
            }

        time.sleep(poll_interval)
        elapsed += poll_interval

    return {"error": "Scan timed out", "scan_id": scan_id, "elapsed": elapsed}


def _get_scan_results(scan_id: str, event_type: str = "ALL") -> list:
    """Get scan results, grouped by event type."""
    # Get summary first
    raw_summary = _sf_request("scansummary", {"id": scan_id, "by": "type"})
    try:
        summary = json.loads(raw_summary)
    except json.JSONDecodeError:
        summary = []

    # Get detailed results for key event types
    key_types = [
        "EMAILADDR", "HUMAN_NAME", "PHONE_NUMBER",
        "DOMAIN_NAME", "INTERNET_NAME", "IP_ADDRESS",
        "SOCIAL_MEDIA", "LINKED_URL_EXTERNAL",
        "COMPANY_NAME", "GEOINFO", "WEBSERVER_TECHNOLOGY",
        "VULNERABILITY_CVE_CRITICAL", "VULNERABILITY_CVE_HIGH",
        "DNS_TEXT", "DNS_SPF", "SSL_CERTIFICATE_ISSUED",
        "ACCOUNT_EXTERNAL_OWNED", "USERNAME",
    ]

    results = {"summary": [], "details": {}}

    for row in summary:
        results["summary"].append({
            "event_type": row[0] if len(row) > 0 else "",
            "count": row[1] if len(row) > 1 else 0,
        })

    # Fetch details for important event types
    for etype in key_types:
        raw = _sf_request("scaneventresultsunique", {"id": scan_id, "eventType": etype})
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue

        if data:
            results["details"][etype] = [
                {"value": row[0], "count": row[1]} if len(row) > 1 else {"value": row[0]}
                for row in data[:20]  # Limit to 20 per type
            ]

    return results


@mcp.tool()
def spiderfoot_scan(
    target: str,
    scan_name: str = "",
    timeout_seconds: int = 300,
) -> str:
    """Run a full SpiderFoot scan (all modules) on a target.

    Args:
        target: Domain, IP, email, username, or person name to scan.
        scan_name: Optional name for this scan (auto-generated if empty).
        timeout_seconds: Max seconds to wait for completion (default 300 = 5 min).

    Returns:
        JSON with scan results grouped by event type (emails, domains, social media, etc.)
    """
    if not scan_name:
        scan_name = f"MCP_{target}_{int(time.time())}"

    # Start scan with "all" usecase
    raw = _sf_request("startscan", {
        "scanname": scan_name,
        "scantarget": target,
        "modulelist": "",
        "typelist": "",
        "usecase": "all",
    }, method="POST")

    try:
        resp = json.loads(raw)
    except json.JSONDecodeError:
        return json.dumps({"error": "Failed to start scan", "raw": raw[:500]})

    if isinstance(resp, list) and len(resp) >= 2:
        if resp[0] == "ERROR":
            return json.dumps({"error": resp[1]})
        scan_id = resp[1]
    else:
        return json.dumps({"error": "Unexpected response", "raw": raw[:500]})

    # Wait for completion
    wait_result = _wait_for_scan(scan_id, timeout=timeout_seconds)
    if "error" in wait_result:
        return json.dumps(wait_result)

    # Fetch results
    results = _get_scan_results(scan_id)
    results["scan_info"] = wait_result

    return json.dumps(results, ensure_ascii=False, indent=2)


@mcp.tool()
def spiderfoot_scan_quick(
    target: str,
    timeout_seconds: int = 180,
) -> str:
    """Run a passive-only SpiderFoot scan (no active probing of target).

    Uses only passive reconnaissance modules — safe to run without alerting the target.
    Faster than full scan but less comprehensive.

    Args:
        target: Domain, IP, email, username, or person name to scan.
        timeout_seconds: Max seconds to wait (default 180 = 3 min).

    Returns:
        JSON with scan results.
    """
    scan_name = f"MCP_passive_{target}_{int(time.time())}"

    raw = _sf_request("startscan", {
        "scanname": scan_name,
        "scantarget": target,
        "modulelist": "",
        "typelist": "",
        "usecase": "passive",
    }, method="POST")

    try:
        resp = json.loads(raw)
    except json.JSONDecodeError:
        return json.dumps({"error": "Failed to start scan", "raw": raw[:500]})

    if isinstance(resp, list) and len(resp) >= 2:
        if resp[0] == "ERROR":
            return json.dumps({"error": resp[1]})
        scan_id = resp[1]
    else:
        return json.dumps({"error": "Unexpected response", "raw": raw[:500]})

    wait_result = _wait_for_scan(scan_id, timeout=timeout_seconds)
    if "error" in wait_result:
        return json.dumps(wait_result)

    results = _get_scan_results(scan_id)
    results["scan_info"] = wait_result

    return json.dumps(results, ensure_ascii=False, indent=2)


@mcp.tool()
def spiderfoot_results(scan_id: str) -> str:
    """Retrieve results from a previously completed SpiderFoot scan.

    Args:
        scan_id: The scan ID returned from a previous scan.

    Returns:
        JSON with scan results grouped by event type.
    """
    # Check scan exists and status
    raw = _sf_request("scanstatus", {"id": scan_id})
    try:
        status = json.loads(raw)
    except json.JSONDecodeError:
        return json.dumps({"error": "Failed to get scan status"})

    if not status:
        return json.dumps({"error": "Scan not found", "scan_id": scan_id})

    scan_status = status[5] if len(status) > 5 else "UNKNOWN"

    if scan_status not in ("FINISHED", "ABORTED"):
        return json.dumps({
            "scan_id": scan_id,
            "status": scan_status,
            "message": "Scan is still running. Try again later.",
        })

    results = _get_scan_results(scan_id)
    results["scan_info"] = {
        "scan_id": scan_id,
        "status": scan_status,
        "target": status[1] if len(status) > 1 else "",
    }

    return json.dumps(results, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
