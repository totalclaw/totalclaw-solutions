#!/usr/bin/env python3
"""
Email Validator - 邮箱验证模块

功能:
1. 邮箱格式验证
2. MX记录查询 (多种方式)
3. 企业/个人邮箱判断
4. 域名与公司名匹配度计算

使用方式:
    python email_validator.py --email "customer@example.com" --company "ABC Ltd"
    python email_validator.py --email "test@gmail.com"

输出: JSON格式的验证结果
"""

import argparse
import json
import re
import socket
import subprocess
import sys
from typing import Optional, Dict, Any, List
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from config import load_personal_email_domains, SCORING_RULES


def validate_email_format(email: str) -> bool:
    """
    验证邮箱格式是否正确

    Args:
        email: 邮箱地址

    Returns:
        bool: 格式是否有效
    """
    if not email or not isinstance(email, str):
        return False

    # RFC 5322 简化版正则
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))


def extract_domain(email: str) -> Optional[str]:
    """
    从邮箱地址提取域名

    Args:
        email: 邮箱地址

    Returns:
        str: 域名或None
    """
    if not email or '@' not in email:
        return None
    return email.split('@')[-1].strip().lower()


def check_mx_record_dns(domain: str, timeout: int = 5) -> Dict[str, Any]:
    """
    方式1: 使用 dnspython 库查询 MX 记录

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: MX记录信息
    """
    result = {
        "method": "dnspython",
        "exists": False,
        "records": [],
        "error": None
    }

    try:
        import dns.resolver

        resolver = dns.resolver.Resolver()
        resolver.timeout = timeout
        resolver.lifetime = timeout

        answers = resolver.resolve(domain, 'MX')
        result["exists"] = True
        result["records"] = [str(r.exchange) for r in answers]

    except ImportError:
        result["error"] = "dnspython not installed"
    except dns.resolver.NXDOMAIN:
        result["error"] = "Domain does not exist"
    except dns.resolver.NoAnswer:
        result["error"] = "No MX record found"
    except dns.resolver.Timeout:
        result["error"] = "DNS query timeout"
    except Exception as e:
        result["error"] = str(e)

    return result


def check_mx_record_nslookup(domain: str, timeout: int = 5) -> Dict[str, Any]:
    """
    方式2: 使用 nslookup 命令查询 MX 记录 (备选方式)

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: MX记录信息
    """
    result = {
        "method": "nslookup",
        "exists": False,
        "records": [],
        "error": None
    }

    try:
        # Windows 和 Linux 都支持
        cmd = ['nslookup', '-type=MX', domain]

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        output = proc.stdout.lower()

        # 检查是否有 MX 记录
        if 'mail exchanger' in output or 'mx' in output:
            result["exists"] = True
            # 提取 MX 记录
            lines = output.split('\n')
            for line in lines:
                if 'mail exchanger' in line or 'mx' in line:
                    result["records"].append(line.strip())

    except subprocess.TimeoutExpired:
        result["error"] = "nslookup timeout"
    except FileNotFoundError:
        result["error"] = "nslookup command not found"
    except Exception as e:
        result["error"] = str(e)

    return result


def check_mx_record_socket(domain: str, timeout: int = 5) -> Dict[str, Any]:
    """
    方式3: 使用 socket 检查域名是否可解析 (最基础的备选)

    Args:
        domain: 域名
        timeout: 超时秒数

    Returns:
        dict: 域名解析信息
    """
    result = {
        "method": "socket",
        "exists": False,
        "records": [],
        "error": None
    }

    try:
        # 尝试解析域名 (获取 A 记录)
        socket.setdefaulttimeout(timeout)
        ip = socket.gethostbyname(domain)
        result["exists"] = True
        result["records"] = [f"A record: {ip}"]

    except socket.gaierror as e:
        result["error"] = f"Domain resolution failed: {e}"
    except socket.timeout:
        result["error"] = "Socket timeout"
    except Exception as e:
        result["error"] = str(e)

    return result


def check_mx_records(domain: str) -> Dict[str, Any]:
    """
    使用多种方式检查 MX 记录 (都执行策略)

    Args:
        domain: 域名

    Returns:
        dict: 综合结果
    """
    results = []

    # 方式1: dnspython (推荐)
    result1 = check_mx_record_dns(domain)
    results.append(result1)

    # 方式2: nslookup (备选)
    result2 = check_mx_record_nslookup(domain)
    results.append(result2)

    # 方式3: socket (最基础备选)
    result3 = check_mx_record_socket(domain)
    results.append(result3)

    # 综合判断: 任一成功即认为有效
    exists = any(r["exists"] for r in results)

    # 合并记录
    all_records = []
    for r in results:
        if r["exists"] and r["records"]:
            all_records.extend(r["records"])

    # 选择最佳结果
    best_result = None
    for r in results:
        if r["exists"]:
            best_result = r
            break

    return {
        "exists": exists,
        "records": list(set(all_records)),  # 去重
        "methods_tried": len(results),
        "methods_succeeded": sum(1 for r in results if r["exists"]),
        "details": results,
        "best_method": best_result["method"] if best_result else None
    }


def determine_email_type(domain: str) -> str:
    """
    判断邮箱类型 (企业/个人)

    Args:
        domain: 域名

    Returns:
        str: "corporate" 或 "personal"
    """
    personal_domains = load_personal_email_domains()

    if domain in personal_domains:
        return "personal"
    return "corporate"


def check_domain_company_match(domain: str, company_name: Optional[str]) -> Dict[str, Any]:
    """
    检查域名与公司名称是否匹配

    Args:
        domain: 域名
        company_name: 公司名称

    Returns:
        dict: 匹配结果
    """
    result = {
        "matches": False,
        "domain": domain,
        "company": company_name,
        "confidence": "none",
        "reason": None
    }

    if not company_name:
        result["reason"] = "No company name provided"
        return result

    # 清理公司名称
    company_clean = re.sub(r'[^a-zA-Z0-9]', '', company_name.lower())
    domain_clean = re.sub(r'[^a-zA-Z0-9]', '', domain.lower())

    # 移除常见后缀
    suffixes = ['ltd', 'limited', 'inc', 'corp', 'corporation', 'llc', 'llp', 'co', 'company', 'gmbh', 'sa', 'ag']
    for suffix in suffixes:
        if company_clean.endswith(suffix):
            company_clean = company_clean[:-len(suffix)]

    # 检查包含关系
    if company_clean in domain_clean or domain_clean in company_clean:
        result["matches"] = True
        result["confidence"] = "high"
        result["reason"] = "Domain name contains company name"
    elif len(company_clean) > 4:
        # 部分匹配
        if company_clean[:min(6, len(company_clean))] in domain_clean:
            result["matches"] = True
            result["confidence"] = "medium"
            result["reason"] = "Partial match between domain and company name"
        else:
            result["reason"] = "No match found"
    else:
        result["reason"] = "Company name too short for matching"

    return result


def calculate_email_score(
    email_type: str,
    mx_exists: bool,
    domain_match: bool,
    domain_match_confidence: str
) -> int:
    """
    计算邮箱验证得分

    Args:
        email_type: 邮箱类型
        mx_exists: MX记录是否存在
        domain_match: 域名是否匹配公司
        domain_match_confidence: 匹配置信度

    Returns:
        int: 得分 (0-100)
    """
    rules = SCORING_RULES["email"]

    if not mx_exists:
        return rules["invalid"]

    if email_type == "corporate":
        if domain_match and domain_match_confidence in ["high", "medium"]:
            return rules["corporate_match"]
        return rules["corporate_no_match"]

    return rules["personal"]


def validate_email(
    email: str,
    company_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    验证邮箱 (主入口函数)

    Args:
        email: 邮箱地址
        company_name: 公司名称 (可选)

    Returns:
        dict: 完整的验证结果
    """
    result = {
        "email": email,
        "company": company_name,
        "format_valid": False,
        "domain": None,
        "mx_record": None,
        "email_type": None,
        "domain_matches_company": False,
        "match_details": None,
        "score": 0,
        "errors": []
    }

    # 1. 格式验证
    result["format_valid"] = validate_email_format(email)
    if not result["format_valid"]:
        result["errors"].append("Invalid email format")
        return result

    # 2. 提取域名
    result["domain"] = extract_domain(email)
    if not result["domain"]:
        result["errors"].append("Could not extract domain")
        return result

    # 3. MX 记录检查 (多种方式)
    result["mx_record"] = check_mx_records(result["domain"])

    # 4. 邮箱类型判断
    result["email_type"] = determine_email_type(result["domain"])

    # 5. 域名与公司名匹配
    if company_name:
        match_result = check_domain_company_match(result["domain"], company_name)
        result["domain_matches_company"] = match_result["matches"]
        result["match_details"] = match_result

    # 6. 计算得分
    result["score"] = calculate_email_score(
        result["email_type"],
        result["mx_record"]["exists"],
        result["domain_matches_company"],
        result["match_details"]["confidence"] if result["match_details"] else "none"
    )

    return result


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Email Validator - 邮箱验证工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python email_validator.py --email "customer@company.com"
  python email_validator.py --email "john@abc.co.uk" --company "ABC Trading Ltd"
  python email_validator.py --email "test@gmail.com" --output json
        '''
    )

    parser.add_argument('--email', required=True, help='Email address to validate')
    parser.add_argument('--company', help='Company name for domain matching')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')

    args = parser.parse_args()

    # 执行验证
    result = validate_email(args.email, args.company)

    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Email: {result['email']}")
        print(f"Format Valid: {result['format_valid']}")
        print(f"Domain: {result['domain']}")
        print(f"MX Record Exists: {result['mx_record']['exists'] if result['mx_record'] else 'N/A'}")
        print(f"Email Type: {result['email_type']}")
        print(f"Domain Matches Company: {result['domain_matches_company']}")
        print(f"Score: {result['score']}")


if __name__ == '__main__':
    main()
