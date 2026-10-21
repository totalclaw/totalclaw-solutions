#!/usr/bin/env python3
"""
Social Media Search - 社交媒体搜索链接生成模块

功能:
1. 生成各平台搜索链接
2. 提供搜索语法模板
3. 支持多个平台并行

使用方式:
    python social_media_search.py --name "John Smith" --country "UK" --company "ABC Ltd"

输出: JSON格式的搜索链接
"""

import argparse
import json
import sys
import urllib.parse
from typing import Dict, Any, List
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import SOCIAL_MEDIA_PLATFORMS


def generate_linkedin_search(name: str = None, company: str = None, country: str = None) -> Dict[str, Any]:
    """
    生成 LinkedIn 搜索链接

    Args:
        name: 人名
        company: 公司名称
        country: 国家

    Returns:
        dict: 搜索链接
    """
    result = {
        "platform": "LinkedIn",
        "searches": []
    }

    # 个人页搜索
    if name:
        query = f'"{name}"'
        if country:
            query += f' "{country}"'
        result["searches"].append({
            "type": "person",
            "google_search": f"https://www.google.com/search?q=site%3Alinkedin.com%2Fin%2F+{urllib.parse.quote(query)}",
            "search_syntax": f'site:linkedin.com/in/ {query}'
        })

    # 公司页搜索
    if company:
        query = f'"{company}"'
        result["searches"].append({
            "type": "company",
            "google_search": f"https://www.google.com/search?q=site%3Alinkedin.com%2Fcompany%2F+{urllib.parse.quote(query)}",
            "direct_url": f"https://www.linkedin.com/company/{urllib.parse.quote(company.lower().replace(' ', '-'))}",
            "search_syntax": f'site:linkedin.com/company/ {query}'
        })

    return result


def generate_facebook_search(company: str = None, name: str = None) -> Dict[str, Any]:
    """
    生成 Facebook 搜索链接

    Args:
        company: 公司名称
        name: 人名

    Returns:
        dict: 搜索链接
    """
    result = {
        "platform": "Facebook",
        "searches": []
    }

    if company:
        query = f'"{company}"'
        result["searches"].append({
            "type": "page",
            "google_search": f"https://www.google.com/search?q=site%3Afacebook.com+{urllib.parse.quote(query)}",
            "direct_url": f"https://www.facebook.com/search/top?q={urllib.parse.quote(company)}",
            "search_syntax": f'site:facebook.com {query}'
        })

    return result


def generate_instagram_search(company: str = None, name: str = None, product: str = None) -> Dict[str, Any]:
    """
    生成 Instagram 搜索链接

    Args:
        company: 公司名称
        name: 人名
        product: 产品关键词

    Returns:
        dict: 搜索链接
    """
    result = {
        "platform": "Instagram",
        "searches": []
    }

    queries = []
    if company:
        queries.append(f'"{company}"')
    if name:
        queries.append(f'"{name}"')
    if product:
        queries.append(f'"{product}"')

    if queries:
        query = " OR ".join(queries)
        result["searches"].append({
            "type": "profile",
            "google_search": f"https://www.google.com/search?q=site%3Ainstagram.com+{urllib.parse.quote(query)}",
            "search_syntax": f'site:instagram.com {query}'
        })

    return result


def generate_youtube_search(company: str = None, name: str = None, product: str = None) -> Dict[str, Any]:
    """
    生成 YouTube 搜索链接

    Args:
        company: 公司名称
        name: 人名
        product: 产品关键词

    Returns:
        dict: 搜索链接
    """
    result = {
        "platform": "YouTube",
        "searches": []
    }

    queries = []
    if company:
        queries.append(f'"{company}"')
    if name:
        queries.append(f'"{name}"')
    if product:
        queries.append(f'"{product}"')

    if queries:
        query = " OR ".join(queries)
        result["searches"].append({
            "type": "channel",
            "google_search": f"https://www.google.com/search?q=site%3Ayoutube.com+{urllib.parse.quote(query)}",
            "direct_url": f"https://www.youtube.com/results?search_query={urllib.parse.quote(query.replace(' OR ', ' '))}",
            "search_syntax": f'site:youtube.com {query}'
        })

    return result


def generate_all_searches(
    name: str = None,
    company: str = None,
    country: str = None,
    product: str = None
) -> Dict[str, Any]:
    """
    生成所有平台的搜索链接

    Args:
        name: 人名
        company: 公司名称
        country: 国家
        product: 产品关键词

    Returns:
        dict: 所有搜索链接
    """
    return {
        "query": {
            "name": name,
            "company": company,
            "country": country,
            "product": product
        },
        "platforms": [
            generate_linkedin_search(name, company, country),
            generate_facebook_search(company, name),
            generate_instagram_search(company, name, product),
            generate_youtube_search(company, name, product)
        ]
    }


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Social Media Search - 社交媒体搜索链接生成工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python social_media_search.py --name "John Smith" --country "UK"
  python social_media_search.py --company "ABC Trading Ltd"
  python social_media_search.py --name "John Smith" --company "ABC Ltd" --country "UK" --product "cosmetics"
        '''
    )

    parser.add_argument('--name', help='Person name')
    parser.add_argument('--company', help='Company name')
    parser.add_argument('--country', help='Country')
    parser.add_argument('--product', help='Product keywords')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')

    args = parser.parse_args()

    # 生成搜索链接
    result = generate_all_searches(args.name, args.company, args.country, args.product)

    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        for platform in result['platforms']:
            print(f"\n=== {platform['platform']} ===")
            for search in platform['searches']:
                print(f"  Type: {search['type']}")
                if 'google_search' in search:
                    print(f"  Google Search: {search['google_search']}")
                if 'direct_url' in search:
                    print(f"  Direct URL: {search['direct_url']}")
                if 'search_syntax' in search:
                    print(f"  Search Syntax: {search['search_syntax']}")


if __name__ == '__main__':
    main()
