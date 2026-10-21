#!/usr/bin/env python3
"""
Domain Checker - 域名/网站验证模块

功能:
1. DNS解析验证 (多种方式)
2. 网站可访问性检查
3. SSL证书验证
4. Whois信息查询

使用方式:
    python domain_checker.py --domain "example.com"
    python domain_checker.py --domain "company.co.uk" --check-ssl

输出: JSON格式的验证结果
"""

import argparse
import json
import re
import socket
import ssl
import subprocess
import sys
from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from config import SCORING_RULES


def check_dns_resolution_dns(domain: str, timeout: int = 5) -> Dict[str, Any]:
    """
    方式1: 使用 dnspython 库查询 DNS (推荐)

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: DNS解析结果
    """
    result = {
        "method": "dnspython",
        "resolved": False,
        "records": {},
        "error": None
    }

    try:
        import dns.resolver

        resolver = dns.resolver.Resolver()
        resolver.timeout = timeout
        resolver.lifetime = timeout

        # 查询 A 记录
        try:
            a_records = resolver.resolve(domain, 'A')
            result["records"]["A"] = [str(r) for r in a_records]
            result["resolved"] = True
        except Exception:
            pass

        # 查询 AAAA 记录
        try:
            aaaa_records = resolver.resolve(domain, 'AAAA')
            result["records"]["AAAA"] = [str(r) for r in aaaa_records]
            result["resolved"] = True
        except Exception:
            pass

    except ImportError:
        result["error"] = "dnspython not installed"
    except Exception as e:
        result["error"] = str(e)

    return result


def check_dns_resolution_socket(domain: str, timeout: int = 5) -> Dict[str, Any]:
    """
    方式2: 使用 socket 解析 (备选)

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: DNS解析结果
    """
    result = {
        "method": "socket",
        "resolved": False,
        "records": {},
        "error": None
    }

    try:
        socket.setdefaulttimeout(timeout)

        # 获取 IP 地址
        ip = socket.gethostbyname(domain)
        result["resolved"] = True
        result["records"]["A"] = [ip]

        # 尝试获取更多信息
        try:
            info = socket.getaddrinfo(domain, None)
            ips = set()
            for item in info:
                if item[0] == socket.AF_INET:
                    ips.add(item[4][0])
            if ips:
                result["records"]["A"] = list(ips)
        except Exception:
            pass

    except socket.gaierror as e:
        result["error"] = f"DNS resolution failed: {e}"
    except socket.timeout:
        result["error"] = "Socket timeout"
    except Exception as e:
        result["error"] = str(e)

    return result


def check_dns_resolution_nslookup(domain: str, timeout: int = 5) -> Dict[str, Any]:
    """
    方式3: 使用 nslookup 命令 (备选)

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: DNS解析结果
    """
    result = {
        "method": "nslookup",
        "resolved": False,
        "records": {},
        "error": None
    }

    try:
        cmd = ['nslookup', domain]

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        output = proc.stdout

        # 解析输出
        ips = []
        lines = output.split('\n')
        for line in lines:
            if 'Address' in line and ':' in line:
                parts = line.split(':')
                if len(parts) >= 2:
                    ip = parts[-1].strip()
                    # 验证是否为有效IP
                    if re.match(r'\d+\.\d+\.\d+\.\d+', ip):
                        ips.append(ip)

        if ips:
            result["resolved"] = True
            result["records"]["A"] = list(set(ips))

    except subprocess.TimeoutExpired:
        result["error"] = "nslookup timeout"
    except FileNotFoundError:
        result["error"] = "nslookup command not found"
    except Exception as e:
        result["error"] = str(e)

    return result


def check_dns(domain: str) -> Dict[str, Any]:
    """
    使用多种方式检查 DNS 解析 (都执行策略)

    Args:
        domain: 域名

    Returns:
        dict: 综合结果
    """
    results = []

    # 方式1: dnspython
    result1 = check_dns_resolution_dns(domain)
    results.append(result1)

    # 方式2: socket
    result2 = check_dns_resolution_socket(domain)
    results.append(result2)

    # 方式3: nslookup
    result3 = check_dns_resolution_nslookup(domain)
    results.append(result3)

    # 综合判断
    resolved = any(r["resolved"] for r in results)

    # 合并记录
    all_records = {}
    for r in results:
        if r["resolved"] and r["records"]:
            for record_type, ips in r["records"].items():
                if record_type not in all_records:
                    all_records[record_type] = []
                all_records[record_type].extend(ips)

    # 去重
    for record_type in all_records:
        all_records[record_type] = list(set(all_records[record_type]))

    return {
        "resolved": resolved,
        "records": all_records,
        "methods_tried": len(results),
        "methods_succeeded": sum(1 for r in results if r["resolved"]),
        "details": results
    }


def check_website_access(domain: str, timeout: int = 10) -> Dict[str, Any]:
    """
    检查网站可访问性

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: 可访问性结果
    """
    result = {
        "accessible": False,
        "http_status": None,
        "final_url": None,
        "response_time_ms": None,
        "error": None
    }

    try:
        import urllib.request
        import urllib.error
        import time

        urls_to_try = [
            f"https://{domain}",
            f"http://{domain}"
        ]

        for url in urls_to_try:
            try:
                start_time = time.time()

                req = urllib.request.Request(
                    url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                )

                response = urllib.request.urlopen(req, timeout=timeout)

                end_time = time.time()

                result["accessible"] = True
                result["http_status"] = response.getcode()
                result["final_url"] = response.url
                result["response_time_ms"] = int((end_time - start_time) * 1000)
                break

            except urllib.error.HTTPError as e:
                result["http_status"] = e.code
                if e.code < 500:
                    result["accessible"] = True
                    break
            except urllib.error.URLError:
                continue
            except Exception:
                continue

    except Exception as e:
        result["error"] = str(e)

    return result


def check_ssl_certificate(domain: str, timeout: int = 5) -> Dict[str, Any]:
    """
    检查 SSL 证书

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: SSL证书信息
    """
    result = {
        "valid": False,
        "issuer": None,
        "expiry_date": None,
        "days_remaining": None,
        "error": None
    }

    try:
        context = ssl.create_default_context()

        with socket.create_connection((domain, 443), timeout=timeout) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()

                result["valid"] = True
                result["issuer"] = dict(x[0] for x in cert.get('issuer', []))

                # 获取过期日期
                expiry_str = cert.get('notAfter')
                if expiry_str:
                    expiry_date = datetime.strptime(expiry_str, '%b %d %H:%M:%S %Y %Z')
                    result["expiry_date"] = expiry_str
                    result["days_remaining"] = (expiry_date - datetime.now()).days

    except ssl.SSLCertVerificationError as e:
        result["error"] = f"SSL verification failed: {e}"
    except socket.timeout:
        result["error"] = "Connection timeout"
    except socket.gaierror:
        result["error"] = "DNS resolution failed"
    except Exception as e:
        result["error"] = str(e)

    return result


def check_whois(domain: str, timeout: int = 10) -> Dict[str, Any]:
    """
    查询 Whois 信息

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: Whois信息
    """
    result = {
        "available": False,
        "registrar": None,
        "creation_date": None,
        "expiry_date": None,
        "registrant_country": None,
        "error": None
    }

    # 方式1: 使用 python-whois 库
    try:
        import whois

        w = whois.whois(domain)

        if w:
            result["available"] = True
            result["registrar"] = w.registrar
            result["creation_date"] = str(w.creation_date) if w.creation_date else None
            result["expiry_date"] = str(w.expiration_date) if w.expiration_date else None
            result["registrant_country"] = w.get('country')

    except ImportError:
        result["error"] = "python-whois not installed"
    except Exception as e:
        result["error"] = str(e)

    # 方式2: 使用 whois 命令 (如果方式1失败)
    if not result["available"]:
        try:
            proc = subprocess.run(
                ['whois', domain],
                capture_output=True,
                text=True,
                timeout=timeout
            )

            output = proc.stdout.lower()

            if output:
                result["available"] = True

                # 解析常用字段
                if 'registrar' in output:
                    lines = proc.stdout.split('\n')
                    for line in lines:
                        if 'registrar' in line.lower():
                            result["registrar"] = line.split(':')[-1].strip() if ':' in line else None
                            break

                if 'creation date' in output or 'created' in output:
                    for line in proc.stdout.split('\n'):
                        if 'creation' in line.lower() or 'created' in line.lower():
                            result["creation_date"] = line.split(':')[-1].strip() if ':' in line else None
                            break

        except FileNotFoundError:
            if result["error"] is None:
                result["error"] = "whois command not found"
        except subprocess.TimeoutExpired:
            if result["error"] is None:
                result["error"] = "whois timeout"
        except Exception as e:
            if result["error"] is None:
                result["error"] = str(e)

    return result


def calculate_domain_score(
    dns_resolved: bool,
    website_accessible: bool,
    ssl_valid: bool,
    whois_available: bool
) -> int:
    """
    计算域名验证得分

    Args:
        dns_resolved: DNS是否解析
        website_accessible: 网站是否可访问
        ssl_valid: SSL证书是否有效
        whois_available: Whois信息是否可用

    Returns:
        int: 得分 (0-100)
    """
    score = 0

    if dns_resolved:
        score += 30

    if website_accessible:
        score += 30

    if ssl_valid:
        score += 20

    if whois_available:
        score += 20

    return score


def check_domain(
    domain: str,
    check_ssl: bool = True,
    check_whois_info: bool = True
) -> Dict[str, Any]:
    """
    验证域名 (主入口函数)

    Args:
        domain: 域名
        check_ssl: 是否检查SSL证书
        check_whois_info: 是否查询Whois

    Returns:
        dict: 完整的验证结果
    """
    result = {
        "domain": domain,
        "dns": None,
        "website": None,
        "ssl": None,
        "whois": None,
        "score": 0,
        "errors": []
    }

    # 清理域名
    domain = domain.lower().strip()
    domain = re.sub(r'^https?://', '', domain)
    domain = domain.split('/')[0]  # 移除路径

    # 1. DNS 解析 (多种方式)
    result["dns"] = check_dns(domain)
    if not result["dns"]["resolved"]:
        result["errors"].append("DNS resolution failed")

    # 2. 网站可访问性
    result["website"] = check_website_access(domain)
    if not result["website"]["accessible"]:
        result["errors"].append("Website not accessible")

    # 3. SSL 证书
    if check_ssl and result["dns"]["resolved"]:
        result["ssl"] = check_ssl_certificate(domain)

    # 4. Whois 信息
    if check_whois_info:
        result["whois"] = check_whois(domain)

    # 5. 计算得分
    result["score"] = calculate_domain_score(
        result["dns"]["resolved"],
        result["website"]["accessible"],
        result["ssl"]["valid"] if result["ssl"] else False,
        result["whois"]["available"] if result["whois"] else False
    )

    return result


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Domain Checker - 域名/网站验证工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python domain_checker.py --domain "example.com"
  python domain_checker.py --domain "company.co.uk" --check-ssl
  python domain_checker.py --domain "google.com" --no-whois
        '''
    )

    parser.add_argument('--domain', required=True, help='Domain name to check')
    parser.add_argument('--check-ssl', action='store_true', help='Check SSL certificate')
    parser.add_argument('--no-whois', action='store_true', help='Skip whois lookup')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')

    args = parser.parse_args()

    # 执行验证
    result = check_domain(
        args.domain,
        check_ssl=args.check_ssl,
        check_whois_info=not args.no_whois
    )

    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
    else:
        print(f"Domain: {result['domain']}")
        print(f"DNS Resolved: {result['dns']['resolved']}")
        print(f"Website Accessible: {result['website']['accessible']}")
        print(f"SSL Valid: {result['ssl']['valid'] if result['ssl'] else 'N/A'}")
        print(f"Whois Available: {result['whois']['available'] if result['whois'] else 'N/A'}")
        print(f"Score: {result['score']}")


if __name__ == '__main__':
    main()
