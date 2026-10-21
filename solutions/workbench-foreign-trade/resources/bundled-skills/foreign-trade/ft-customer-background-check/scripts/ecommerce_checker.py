#!/usr/bin/env python3
"""
E-commerce Checker - 电商平台验证模块

功能:
1. 生成各平台搜索链接
2. 店铺验证模板
3. 评分评估规则

使用方式:
    python ecommerce_checker.py --company "ABC Store" --platforms amazon,ebay,alibaba

输出: JSON格式的搜索链接和验证指南
"""

import argparse
import json
import sys
import urllib.parse
from typing import Dict, Any, List
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import ECOMMERCE_PLATFORMS


def generate_amazon_search(company: str) -> Dict[str, Any]:
    """
    生成 Amazon 搜索链接

    Args:
        company: 公司名称/店铺名

    Returns:
        dict: 搜索链接和验证指南
    """
    return {
        "platform": "Amazon",
        "searches": [
            {
                "type": "seller_search",
                "google_search": f"https://www.google.com/search?q=site%3Aamazon.com+{urllib.parse.quote(f'"{company}" seller')}",
                "search_syntax": f'site:amazon.com "{company}" seller'
            },
            {
                "type": "store_search",
                "direct_url": f"https://www.amazon.com/s?me=&marketplaceID=ATVPDKIKX0DER&redirect=true&keyword={urllib.parse.quote(company)}",
                "note": "Search for seller storefront"
            }
        ],
        "verification_checklist": [
            "Check Seller Profile page exists",
            "Verify seller rating (out of 5 stars)",
            "Check number of reviews",
            "Verify years in business",
            "Check product categories match claimed business"
        ],
        "scoring": {
            "high_rated": "Rating >= 4.5 stars + 100+ reviews → 100 points",
            "store_exists": "Storefront exists → 70 points",
            "no_store": "No store found → 30 points"
        }
    }


def generate_ebay_search(company: str) -> Dict[str, Any]:
    """
    生成 eBay 搜索链接

    Args:
        company: 公司名称/卖家名

    Returns:
        dict: 搜索链接和验证指南
    """
    return {
        "platform": "eBay",
        "searches": [
            {
                "type": "seller_search",
                "google_search": f"https://www.google.com/search?q=site%3Aebay.com+{urllib.parse.quote(f'"{company}" seller')}",
                "search_syntax": f'site:ebay.com "{company}" seller'
            },
            {
                "type": "store_search",
                "direct_url": f"https://www.ebay.com/sch/i.html?_ssn={urllib.parse.quote(company.replace(' ', ''))}",
                "note": "Search for eBay seller"
            }
        ],
        "verification_checklist": [
            "Check seller profile exists",
            "Verify feedback score (number in parentheses)",
            "Check feedback percentage (aim for 98%+)",
            "Verify member since date",
            "Check selling categories"
        ],
        "scoring": {
            "high_rated": "Feedback >= 99% + 1000+ transactions → 100 points",
            "store_exists": "Seller profile exists → 70 points",
            "no_store": "No seller found → 30 points"
        }
    }


def generate_alibaba_search(company: str) -> Dict[str, Any]:
    """
    生成 Alibaba 搜索链接

    Args:
        company: 公司名称

    Returns:
        dict: 搜索链接和验证指南
    """
    return {
        "platform": "Alibaba",
        "searches": [
            {
                "type": "supplier_search",
                "google_search": f"https://www.google.com/search?q=site%3Aalibaba.com+{urllib.parse.quote(f'"{company}" supplier')}",
                "search_syntax": f'site:alibaba.com "{company}" supplier'
            },
            {
                "type": "direct_search",
                "direct_url": f"https://www.alibaba.com/trade/search?SearchText={urllib.parse.quote(company)}&tab=all&tabType=all",
                "note": "Search Alibaba suppliers"
            }
        ],
        "verification_checklist": [
            "Check if Gold Supplier (verified)",
            "Verify years as supplier",
            "Check supplier location",
            "Verify business type (manufacturer/trader)",
            "Check product certifications"
        ],
        "scoring": {
            "verified_gold": "Gold Supplier 5+ years → 100 points",
            "store_exists": "Supplier profile exists → 70 points",
            "no_store": "No supplier found → 30 points"
        }
    }


def generate_etsy_search(company: str) -> Dict[str, Any]:
    """
    生成 Etsy 搜索链接

    Args:
        company: 公司名称/店铺名

    Returns:
        dict: 搜索链接和验证指南
    """
    return {
        "platform": "Etsy",
        "searches": [
            {
                "type": "shop_search",
                "google_search": f"https://www.google.com/search?q=site%3Aetsy.com+{urllib.parse.quote(f'"{company}" shop')}",
                "search_syntax": f'site:etsy.com "{company}" shop'
            },
            {
                "type": "direct_search",
                "direct_url": f"https://www.etsy.com/search?q={urllib.parse.quote(company)}&ref=search_bar",
                "note": "Search Etsy shops"
            }
        ],
        "verification_checklist": [
            "Check shop exists",
            "Verify number of sales",
            "Check average review rating",
            "Verify shop location",
            "Check since date"
        ],
        "scoring": {
            "high_rated": "5-star rating + 100+ sales → 100 points",
            "store_exists": "Shop exists → 70 points",
            "no_store": "No shop found → 30 points"
        }
    }


def generate_all_platform_searches(
    company: str,
    platforms: List[str] = None
) -> Dict[str, Any]:
    """
    生成所有平台的搜索链接

    Args:
        company: 公司名称
        platforms: 指定平台列表

    Returns:
        dict: 所有平台搜索链接
    """
    if platforms is None:
        platforms = ["amazon", "ebay", "alibaba", "etsy"]

    result = {
        "query": {
            "company": company,
            "platforms": platforms
        },
        "platforms": []
    }

    platform_functions = {
        "amazon": generate_amazon_search,
        "ebay": generate_ebay_search,
        "alibaba": generate_alibaba_search,
        "etsy": generate_etsy_search
    }

    for platform in platforms:
        if platform.lower() in platform_functions:
            result["platforms"].append(
                platform_functions[platform.lower()](company)
            )

    return result


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='E-commerce Checker - 电商平台验证工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python ecommerce_checker.py --company "ABC Store"
  python ecommerce_checker.py --company "MyShop" --platforms amazon,ebay
        '''
    )

    parser.add_argument('--company', required=True, help='Company/shop name')
    parser.add_argument('--platforms', default='amazon,ebay,alibaba,etsy',
                       help='Comma-separated platforms (amazon,ebay,alibaba,etsy)')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')

    args = parser.parse_args()

    platforms = [p.strip().lower() for p in args.platforms.split(',')]

    # 生成搜索链接
    result = generate_all_platform_searches(args.company, platforms)

    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Company: {result['query']['company']}")
        for platform in result['platforms']:
            print(f"\n=== {platform['platform']} ===")
            for search in platform['searches']:
                print(f"  Type: {search['type']}")
                if 'google_search' in search:
                    print(f"  Google Search: {search['google_search']}")
                if 'direct_url' in search:
                    print(f"  Direct URL: {search['direct_url']}")


if __name__ == '__main__':
    main()
