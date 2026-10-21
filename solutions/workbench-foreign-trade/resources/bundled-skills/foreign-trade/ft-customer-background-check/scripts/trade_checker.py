#!/usr/bin/env python3
"""
Trade Checker - 海关贸易验证模块

功能:
1. 生成海关数据平台搜索链接
2. 提供进口记录查询指南
3. 支持多个贸易数据源

使用方式:
    python trade_checker.py --company "ABC Trading" --country "US"

输出: JSON格式的搜索链接和验证指南
"""

import argparse
import json
import sys
import urllib.parse
from typing import Dict, Any, List
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import TRADE_DATA_SOURCES


def generate_importgenius_search(company: str, country: str = None) -> Dict[str, Any]:
    """
    生成 ImportGenius 搜索链接

    Args:
        company: 公司名称
        country: 国家

    Returns:
        dict: 搜索链接和验证指南
    """
    return {
        "platform": "ImportGenius",
        "url": "https://www.importgenius.com",
        "requires_subscription": True,
        "searches": [
            {
                "type": "importer_search",
                "direct_url": f"https://www.importgenius.com/search/{urllib.parse.quote(company)}",
                "note": "Search for import records by company name"
            }
        ],
        "verification_checklist": [
            "Verify company appears as importer",
            "Check import frequency (monthly/yearly)",
            "Identify supplier countries",
            "Review product categories (HS codes)",
            "Check import volumes"
        ],
        "data_available": [
            "Bill of lading records",
            "Supplier information",
            "Product descriptions",
            "Shipment dates",
            "Port of entry"
        ],
        "scoring": {
            "import_match": "Import records found + products match interest → 100 points",
            "import_no_match": "Import records found but different products → 50 points",
            "no_record": "No import records found → 40 points"
        }
    }


def generate_panjiva_search(company: str, country: str = None) -> Dict[str, Any]:
    """
    生成 Panjiva 搜索链接

    Args:
        company: 公司名称
        country: 国家

    Returns:
        dict: 搜索链接和验证指南
    """
    return {
        "platform": "Panjiva",
        "url": "https://panjiva.com",
        "requires_subscription": True,
        "searches": [
            {
                "type": "search",
                "direct_url": f"https://panjiva.com/search?q={urllib.parse.quote(company)}",
                "note": "Search supply chain data"
            }
        ],
        "verification_checklist": [
            "Check shipment history",
            "Verify supplier relationships",
            "Review product categories",
            "Check trading partners"
        ],
        "data_available": [
            "Shipment records",
            "Supplier/buyer relationships",
            "Product descriptions",
            "Trade volumes"
        ]
    }


def generate_tradesparq_search(company: str, country: str = None) -> Dict[str, Any]:
    """
    生成 Tradesparq 搜索链接 (有免费层级)

    Args:
        company: 公司名称
        country: 国家

    Returns:
        dict: 搜索链接和验证指南
    """
    return {
        "platform": "Tradesparq",
        "url": "https://www.tradesparq.com",
        "requires_subscription": False,
        "free_tier": True,
        "searches": [
            {
                "type": "search",
                "direct_url": f"https://www.tradesparq.com/suppliers/{urllib.parse.quote(company)}",
                "note": "Free access to some trade data"
            }
        ],
        "verification_checklist": [
            "Check US import records",
            "Verify HS codes",
            "Review shipment details"
        ]
    }


def generate_customs_search(company: str, country: str = None) -> Dict[str, Any]:
    """
    根据国家生成特定的海关数据搜索

    Args:
        company: 公司名称
        country: 国家

    Returns:
        dict: 特定国家的海关搜索链接
    """
    country_platforms = {
        "US": {
            "name": "US Customs Data",
            "sources": [
                {
                    "name": "US Customs (CBP)",
                    "url": "https://www.cbp.gov",
                    "note": "Limited public access"
                },
                {
                    "name": "PORT Exports",
                    "url": "https://portex.pgm.gov",
                    "note": "Trade statistics"
                }
            ]
        }
    }

    result = {
        "platform": "Country-Specific Customs",
        "country": country,
        "sources": []
    }

    if country and country.upper() in country_platforms:
        result["sources"] = country_platforms[country.upper()]["sources"]

    return result


def generate_all_trade_searches(
    company: str,
    country: str = None,
    sources: List[str] = None
) -> Dict[str, Any]:
    """
    生成所有贸易数据源的搜索链接

    Args:
        company: 公司名称
        country: 国家
        sources: 指定数据源列表

    Returns:
        dict: 所有数据源搜索链接
    """
    if sources is None:
        sources = ["importgenius", "panjiva", "tradesparq"]

    result = {
        "query": {
            "company": company,
            "country": country
        },
        "sources": [],
        "note": "Some platforms require subscription. Free platforms can provide basic verification."
    }

    source_functions = {
        "importgenius": generate_importgenius_search,
        "panjiva": generate_panjiva_search,
        "tradesparq": generate_tradesparq_search
    }

    for source in sources:
        if source.lower() in source_functions:
            result["sources"].append(
                source_functions[source.lower()](company, country)
            )

    # 添加特定国家海关搜索
    if country:
        result["sources"].append(generate_customs_search(company, country))

    return result


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Trade Checker - 海关贸易验证工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python trade_checker.py --company "ABC Trading" --country "US"
  python trade_checker.py --company "Global Imports Ltd" --sources importgenius,panjiva

注意: 大部分海关数据平台需要付费订阅才能获取详细数据
        '''
    )

    parser.add_argument('--company', required=True, help='Company name')
    parser.add_argument('--country', help='Target country for customs search')
    parser.add_argument('--sources', default='importgenius,panjiva,tradesparq',
                       help='Comma-separated data sources')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')

    args = parser.parse_args()

    sources = [s.strip().lower() for s in args.sources.split(',')]

    # 生成搜索链接
    result = generate_all_trade_searches(args.company, args.country, sources)

    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Company: {result['query']['company']}")
        print(f"Country: {result['query']['country']}")
        for source in result['sources']:
            print(f"\n=== {source['platform']} ===")
            if 'searches' in source:
                for search in source['searches']:
                    if 'direct_url' in search:
                        print(f"  URL: {search['direct_url']}")


if __name__ == '__main__':
    main()
