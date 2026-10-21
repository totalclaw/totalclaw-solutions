#!/usr/bin/env python3
"""
Company Lookup - 公司查询聚合模块

功能:
1. 根据国家自动选择数据源
2. 支持多国公司查询 (UK, FR, SE, US, DE, AU, CA, JP)
3. 多种查询方式 (API + WebFetch)
4. 返回标准化结果

使用方式:
    python company_lookup.py --country "UK" --company "ABC Trading Ltd"
    python company_lookup.py --country "FR" --company "SARL Company"

输出: JSON格式的查询结果
"""

import argparse
import json
import re
import sys
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional, Dict, Any, List
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from config import COMPANY_REGISTRIES, COUNTRY_CODE_MAP, SCORING_RULES, get_api_key


def normalize_country(country: str) -> str:
    """
    标准化国家代码

    Args:
        country: 国家名称或代码

    Returns:
        str: 标准化的国家代码
    """
    if not country:
        return ""

    normalized = COUNTRY_CODE_MAP.get(country.upper().strip(), country.upper().strip())

    # 检查是否在支持列表中
    if normalized not in COMPANY_REGISTRIES:
        return ""

    return normalized


def clean_company_name(company: str) -> str:
    """
    清理公司名称用于搜索

    Args:
        company: 公司名称

    Returns:
        str: 清理后的名称
    """
    if not company:
        return ""

    # 移除常见后缀进行搜索
    suffixes = [' LTD', ' LIMITED', ' LLC', ' INC', ' CORP', ' CO', ' GMBH', ' SA', ' AG', ' SARL', ' BV', ' NV']
    cleaned = company.upper().strip()

    for suffix in suffixes:
        if cleaned.endswith(suffix):
            cleaned = cleaned[:-len(suffix)]
            break

    return cleaned.strip()


# ==================
# UK Companies House
# ==================

def lookup_uk_company_api(company_name: str, api_key: str = None) -> Dict[str, Any]:
    """
    方式1: 使用 Companies House API 查询英国公司

    Args:
        company_name: 公司名称
        api_key: API密钥

    Returns:
        dict: 查询结果
    """
    result = {
        "method": "companies_house_api",
        "found": False,
        "companies": [],
        "error": None
    }

    if not api_key:
        api_key = get_api_key("companies_house")

    if not api_key:
        result["error"] = "Companies House API key not configured"
        return result

    try:
        import base64

        # Companies House API 使用 Basic Auth
        auth_string = base64.b64encode(f"{api_key}:".encode()).decode()

        query = urllib.parse.quote(company_name)
        url = f"https://api.company-information.service.gov.uk/search/companies?q={query}&items_per_page=10"

        req = urllib.request.Request(url)
        req.add_header('Authorization', f'Basic {auth_string}')

        response = urllib.request.urlopen(req, timeout=10)
        data = json.loads(response.read().decode())

        if data.get('items'):
            result["found"] = True
            for item in data['items'][:5]:  # 最多返回5个结果
                result["companies"].append({
                    "name": item.get('title'),
                    "company_number": item.get('company_number'),
                    "status": item.get('company_status'),
                    "address": item.get('address', {}).get('premises', '') + ' ' +
                              item.get('address', {}).get('address_line_1', ''),
                    "incorporation_date": item.get('date_of_creation')
                })

    except urllib.error.HTTPError as e:
        result["error"] = f"HTTP Error: {e.code}"
    except urllib.error.URLError as e:
        result["error"] = f"URL Error: {e.reason}"
    except Exception as e:
        result["error"] = str(e)

    return result


def lookup_uk_company_web(company_name: str) -> Dict[str, Any]:
    """
    方式2: 使用 WebFetch 方式查询 (备选,需要手动访问)

    Args:
        company_name: 公司名称

    Returns:
        dict: 查询结果信息
    """
    result = {
        "method": "companies_house_web",
        "found": None,
        "search_url": None,
        "error": None
    }

    try:
        query = urllib.parse.quote(clean_company_name(company_name))
        result["search_url"] = f"https://find-and-update.company-information.service.gov.uk/companies?companyName={query}"
        result["found"] = "requires_manual_access"
        result["note"] = "Please use WebFetch to access this URL"

    except Exception as e:
        result["error"] = str(e)

    return result


# ==================
# France
# ==================

def lookup_french_company_api(company_name: str) -> Dict[str, Any]:
    """
    使用法国政府API查询公司

    Args:
        company_name: 公司名称

    Returns:
        dict: 查询结果
    """
    result = {
        "method": "recherche_entreprises_api",
        "found": False,
        "companies": [],
        "error": None
    }

    try:
        query = urllib.parse.quote(company_name)
        url = f"https://recherche-entreprises.api.gouv.fr/search?q={query}&per_page=10"

        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0')

        response = urllib.request.urlopen(req, timeout=10)
        data = json.loads(response.read().decode())

        if data.get('results'):
            result["found"] = True
            for item in data['results'][:5]:
                result["companies"].append({
                    "name": item.get('nom_complet'),
                    "siren": item.get('siren'),
                    "siret": item.get('siret'),
                    "address": item.get('siege', {}).get('adresse'),
                    "activity": item.get('activite_principale')
                })

    except urllib.error.HTTPError as e:
        result["error"] = f"HTTP Error: {e.code}"
    except urllib.error.URLError as e:
        result["error"] = f"URL Error: {e.reason}"
    except Exception as e:
        result["error"] = str(e)

    return result


# ==================
# Sweden
# ==================

def lookup_swedish_company(company_name: str) -> Dict[str, Any]:
    """
    查询瑞典公司 (返回搜索链接供 WebFetch 使用)

    Args:
        company_name: 公司名称

    Returns:
        dict: 搜索链接
    """
    result = {
        "method": "allabolag_web",
        "found": None,
        "search_url": None,
        "error": None
    }

    try:
        query = urllib.parse.quote(clean_company_name(company_name))
        result["search_url"] = f"https://www.allabolag.se/what/{query}"
        result["found"] = "requires_manual_access"
        result["note"] = "Please use WebFetch to access this URL"

    except Exception as e:
        result["error"] = str(e)

    return result


# ==================
# US
# ==================

def lookup_us_company(company_name: str, state: str = None) -> Dict[str, Any]:
    """
    查询美国公司

    Args:
        company_name: 公司名称
        state: 州代码 (可选)

    Returns:
        dict: 查询结果
    """
    result = {
        "method": "us_sources",
        "found": None,
        "search_urls": [],
        "error": None
    }

    try:
        query = urllib.parse.quote(company_name)

        # BBB 搜索链接
        result["search_urls"].append({
            "source": "BBB",
            "url": f"https://www.bbb.org/search?find_country=USA&find_text={query}"
        })

        # 如果指定了州,添加州注册机构链接
        if state:
            state_urls = {
                "DE": "https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx",
                "CA": "https://bizfileonline.sos.ca.gov/search/business",
                "NY": "https://apps.dos.ny.gov/publicInquiry/",
                "TX": "https://mycpa.cpa.state.tx.us/coa/",
                "FL": "https://dos.myflorida.com/sunbiz/search/"
            }
            if state.upper() in state_urls:
                result["search_urls"].append({
                    "source": f"Secretary of State - {state.upper()}",
                    "url": state_urls[state.upper()]
                })

        result["found"] = "requires_manual_access"
        result["note"] = "Please use WebFetch to access these URLs"

    except Exception as e:
        result["error"] = str(e)

    return result


# ==================
# Main Lookup Function
# ==================

def lookup_company(country: str, company_name: str) -> Dict[str, Any]:
    """
    公司查询主入口 (都执行策略)

    Args:
        country: 国家代码
        company_name: 公司名称

    Returns:
        dict: 综合查询结果
    """
    # 标准化国家代码
    country_code = normalize_country(country)

    result = {
        "query": {
            "country": country,
            "country_code": country_code,
            "company_name": company_name
        },
        "results": [],
        "best_match": None,
        "score": 0,
        "errors": []
    }

    if not country_code:
        result["errors"].append(f"Unsupported country: {country}")
        return result

    if not company_name:
        result["errors"].append("Company name is required")
        return result

    # 根据国家选择查询方式
    if country_code == "UK":
        # 方式1: API
        r1 = lookup_uk_company_api(company_name)
        result["results"].append(r1)
        # 方式2: Web
        r2 = lookup_uk_company_web(company_name)
        result["results"].append(r2)

    elif country_code == "FR":
        r = lookup_french_company_api(company_name)
        result["results"].append(r)

    elif country_code == "SE":
        r = lookup_swedish_company(company_name)
        result["results"].append(r)

    elif country_code == "US":
        r = lookup_us_company(company_name)
        result["results"].append(r)

    else:
        # 其他国家返回搜索链接
        registry = COMPANY_REGISTRIES.get(country_code, {})
        sources = registry.get('sources', [])
        for source in sources:
            url = source.get('url', '')
            if url:
                result["results"].append({
                    "method": source.get('name'),
                    "found": "requires_manual_access",
                    "search_url": url,
                    "note": "Please use WebFetch to access this URL"
                })

    # 选择最佳匹配
    for r in result["results"]:
        if r.get("found") is True and r.get("companies"):
            result["best_match"] = r["companies"][0]
            result["score"] = SCORING_RULES["company_status"]["active_complete"]
            break

    # 如果没有找到,检查是否有搜索链接
    if not result["best_match"]:
        for r in result["results"]:
            if r.get("search_url") or r.get("search_urls"):
                result["score"] = SCORING_RULES["company_status"]["cannot_verify"]
                break

    return result


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Company Lookup - 公司查询工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python company_lookup.py --country "UK" --company "ABC Trading Ltd"
  python company_lookup.py --country "FR" --company "Total"
  python company_lookup.py --country "US" --company "Google" --state "CA"
        '''
    )

    parser.add_argument('--country', required=True, help='Country code (UK, FR, SE, US, DE, AU, CA, JP)')
    parser.add_argument('--company', required=True, help='Company name to search')
    parser.add_argument('--state', help='State code (for US)')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')

    args = parser.parse_args()

    # 执行查询
    result = lookup_company(args.country, args.company)

    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Country: {result['query']['country_code']}")
        print(f"Company: {result['query']['company_name']}")
        if result['best_match']:
            print(f"Best Match: {result['best_match'].get('name')}")
            print(f"Status: {result['best_match'].get('status', 'N/A')}")
        print(f"Score: {result['score']}")


if __name__ == '__main__':
    main()
