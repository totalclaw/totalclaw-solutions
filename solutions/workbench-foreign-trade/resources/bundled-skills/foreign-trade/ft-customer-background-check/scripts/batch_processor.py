#!/usr/bin/env python3
"""
Batch Processor - 批量处理模块

功能:
1. 批量处理客户名单
2. 并行执行验证
3. 输出汇总结果

使用方式:
    python batch_processor.py --input customers.xlsx --output results.xlsx
    python batch_processor.py --input customers.csv --output results.xlsx --parallel 4

输入Excel/CSV需包含以下列:
- name: 客户姓名
- email: 邮箱
- phone: 电话
- company: 公司名称
- country: 国家
- products: 兴趣产品
"""

import argparse
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from email_validator import validate_email
from phone_validator import validate_phone_with_country
from domain_checker import check_domain
from company_lookup import lookup_company
from risk_scorer import calculate_risk_score
from report_generator import generate_summary_line


def load_customers_from_excel(file_path: str) -> List[Dict[str, Any]]:
    """
    从Excel文件加载客户列表

    Args:
        file_path: Excel文件路径

    Returns:
        list: 客户信息列表
    """
    try:
        import pandas as pd
        df = pd.read_excel(file_path)
        customers = df.to_dict('records')
        return customers
    except ImportError:
        raise ImportError("pandas is required for Excel processing: pip install pandas openpyxl")


def load_customers_from_csv(file_path: str) -> List[Dict[str, Any]]:
    """
    从CSV文件加载客户列表

    Args:
        file_path: CSV文件路径

    Returns:
        list: 客户信息列表
    """
    try:
        import pandas as pd
        df = pd.read_csv(file_path)
        customers = df.to_dict('records')
        return customers
    except ImportError:
        raise ImportError("pandas is required for CSV processing: pip install pandas")


def process_single_customer(customer: Dict[str, Any]) -> Dict[str, Any]:
    """
    处理单个客户的完整背调流程

    Args:
        customer: 客户信息

    Returns:
        dict: 完整的背调结果
    """
    result = {
        "basic_info": {
            "name": customer.get("name") or customer.get("客户名称", ""),
            "email": customer.get("email") or customer.get("邮箱", ""),
            "phone": customer.get("phone") or customer.get("客户手机", ""),
            "company": customer.get("company") or customer.get("公司名称", ""),
            "region": customer.get("country") or customer.get("地区") or customer.get("国家", ""),
            "products": customer.get("products") or customer.get("兴趣产品", "")
        },
        "email_verification": None,
        "phone_verification": None,
        "company_verification": None,
        "digital_assets": None,
        "risk_assessment": None,
        "errors": []
    }

    try:
        # 1. 邮箱验证
        if result["basic_info"]["email"]:
            result["email_verification"] = validate_email(
                result["basic_info"]["email"],
                result["basic_info"]["company"]
            )
    except Exception as e:
        result["errors"].append(f"Email verification failed: {str(e)}")

    try:
        # 2. 电话验证
        if result["basic_info"]["phone"]:
            result["phone_verification"] = validate_phone_with_country(
                result["basic_info"]["phone"],
                result["basic_info"]["region"]
            )
    except Exception as e:
        result["errors"].append(f"Phone verification failed: {str(e)}")

    try:
        # 3. 公司查询
        if result["basic_info"]["company"] and result["basic_info"]["region"]:
            result["company_verification"] = lookup_company(
                result["basic_info"]["region"],
                result["basic_info"]["company"]
            )
    except Exception as e:
        result["errors"].append(f"Company lookup failed: {str(e)}")

    try:
        # 4. 域名验证
        email = result["basic_info"]["email"]
        if email and "@" in email:
            domain = email.split("@")[1]
            # 跳过个人邮箱域名
            from config import load_personal_email_domains
            if domain.lower() not in load_personal_email_domains():
                result["digital_assets"] = check_domain(domain)
    except Exception as e:
        result["errors"].append(f"Domain check failed: {str(e)}")

    try:
        # 5. 计算风险评分
        email_score = result["email_verification"]["score"] if result["email_verification"] else 0
        company_score = result["company_verification"]["score"] if result["company_verification"] else 0

        result["risk_assessment"] = calculate_risk_score(
            email_score=email_score,
            company_status_score=company_score,
            personnel_score=0,  # 需要额外的董事查询
            digital_assets_score=result["digital_assets"]["score"] if result["digital_assets"] else 0,
            ecommerce_score=0,  # 需要额外的电商查询
            trade_score=0  # 需要额外的贸易查询
        )
    except Exception as e:
        result["errors"].append(f"Risk scoring failed: {str(e)}")

    return result


def process_customers_batch(
    customers: List[Dict[str, Any]],
    max_workers: int = 4,
    progress_callback=None
) -> List[Dict[str, Any]]:
    """
    批量处理客户

    Args:
        customers: 客户列表
        max_workers: 最大并行数
        progress_callback: 进度回调函数

    Returns:
        list: 所有客户的背调结果
    """
    results = []
    total = len(customers)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(process_single_customer, customer): i
            for i, customer in enumerate(customers)
        }

        for future in as_completed(futures):
            i = futures[future]
            try:
                result = future.result()
                results.append((i, result))

                if progress_callback:
                    progress_callback(len(results), total, i)
            except Exception as e:
                results.append((i, {"error": str(e)}))

    # 按原始顺序排序
    results.sort(key=lambda x: x[0])
    return [r[1] for r in results]


def save_results_to_excel(results: List[Dict[str, Any]], output_path: str) -> None:
    """
    保存结果到Excel

    Args:
        results: 背调结果列表
        output_path: 输出路径
    """
    try:
        import pandas as pd

        rows = []
        for result in results:
            basic = result.get("basic_info", {})
            risk = result.get("risk_assessment", {})
            email = result.get("email_verification", {})
            phone = result.get("phone_verification", {})
            company = result.get("company_verification", {})

            row = {
                "客户姓名": basic.get("name", ""),
                "邮箱": basic.get("email", ""),
                "电话": basic.get("phone", ""),
                "公司": basic.get("company", ""),
                "国家": basic.get("region", ""),
                "兴趣产品": basic.get("products", ""),
                "邮箱得分": email.get("score", 0) if email else 0,
                "邮箱类型": email.get("email_type", "") if email else "",
                "电话得分": phone.get("score", 0) if phone else 0,
                "国家匹配": "是" if phone.get("country_matches") else "否",
                "公司得分": company.get("score", 0) if company else 0,
                "公司状态": company.get("best_match", {}).get("status", "") if company.get("best_match") else "",
                "综合得分": risk.get("total_score", 0),
                "风险等级": risk.get("risk_level", {}).get("label_zh", "") if risk else "",
                "建议": risk.get("recommendation", "") if risk else "",
                "错误": "; ".join(result.get("errors", []))
            }
            rows.append(row)

        df = pd.DataFrame(rows)
        df.to_excel(output_path, index=False)
        print(f"Results saved to: {output_path}")

    except ImportError:
        raise ImportError("pandas is required for Excel output: pip install pandas openpyxl")


def save_results_to_json(results: List[Dict[str, Any]], output_path: str) -> None:
    """
    保存结果到JSON

    Args:
        results: 背调结果列表
        output_path: 输出路径
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2, default=str)
    print(f"Results saved to: {output_path}")


def print_progress(current: int, total: int, index: int):
    """打印进度"""
    percent = (current / total) * 100
    print(f"\rProgress: {current}/{total} ({percent:.1f}%) - Processing customer {index + 1}", end="")
    if current == total:
        print()


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Batch Processor - 批量背调处理工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python batch_processor.py --input customers.xlsx --output results.xlsx
  python batch_processor.py --input customers.csv --output results.xlsx --parallel 4
  python batch_processor.py --input customers.xlsx --output results.json --format json

输入文件需包含以下列:
- name/客户名称: 客户姓名
- email/邮箱: 邮箱地址
- phone/客户手机: 电话号码
- company/公司名称: 公司名称
- country/地区/国家: 国家
- products/兴趣产品: 兴趣产品
        '''
    )

    parser.add_argument('--input', required=True, help='Input file (Excel or CSV)')
    parser.add_argument('--output', required=True, help='Output file path')
    parser.add_argument('--parallel', type=int, default=4, help='Number of parallel workers')
    parser.add_argument('--format', choices=['excel', 'json'], default='excel', help='Output format')

    args = parser.parse_args()

    # 加载客户数据
    print(f"Loading customers from: {args.input}")
    input_path = Path(args.input)

    if input_path.suffix.lower() == '.csv':
        customers = load_customers_from_csv(args.input)
    else:
        customers = load_customers_from_excel(args.input)

    print(f"Loaded {len(customers)} customers")

    # 批量处理
    print(f"Processing with {args.parallel} workers...")
    start_time = time.time()

    results = process_customers_batch(
        customers,
        max_workers=args.parallel,
        progress_callback=print_progress
    )

    elapsed = time.time() - start_time
    print(f"\nProcessing completed in {elapsed:.1f} seconds")

    # 保存结果
    if args.format == 'json' or args.output.endswith('.json'):
        save_results_to_json(results, args.output)
    else:
        save_results_to_excel(results, args.output)

    # 打印摘要
    print("\n=== Summary ===")
    high_risk = sum(1 for r in results if r.get("risk_assessment", {}).get("risk_level", {}).get("level") == "high")
    medium_risk = sum(1 for r in results if r.get("risk_assessment", {}).get("risk_level", {}).get("level") == "medium")
    low_risk = sum(1 for r in results if r.get("risk_assessment", {}).get("risk_level", {}).get("level") == "low")

    print(f"Total customers: {len(results)}")
    print(f"✅ Low risk (Verified): {low_risk}")
    print(f"⚠️ Medium risk (Needs supplement): {medium_risk}")
    print(f"❌ High risk: {high_risk}")


if __name__ == '__main__':
    main()
