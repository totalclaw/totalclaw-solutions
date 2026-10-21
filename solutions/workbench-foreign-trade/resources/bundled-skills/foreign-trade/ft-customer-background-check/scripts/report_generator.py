#!/usr/bin/env python3
"""
Report Generator - 报告生成模块

功能:
1. 生成背调报告 (Markdown格式)
2. 支持模板渲染
3. 输出汇总信息

使用方式:
    python report_generator.py --data customer_data.json --output report.md
    python report_generator.py --data customer_data.json --format excel

输出: Markdown或Excel格式的背调报告
"""

import argparse
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


def generate_markdown_report(data: Dict[str, Any]) -> str:
    """
    生成 Markdown 格式的背调报告

    Args:
        data: 客户背调数据

    Returns:
        str: Markdown格式报告
    """
    report = []

    # 标题
    report.append("# 客户背调报告 (Customer Background Check Report)")
    report.append("")

    # 基本信息
    report.append("## 一、基本信息 (Basic Information)")
    report.append("")
    report.append("| 项目 | 内容 |")
    report.append("|------|------|")

    basic_info = data.get("basic_info", {})
    report.append(f"| 客户姓名 (Name) | {basic_info.get('name', 'N/A')} |")
    report.append(f"| 邮箱地址 (Email) | {basic_info.get('email', 'N/A')} |")
    report.append(f"| 电话号码 (Phone) | {basic_info.get('phone', 'N/A')} |")
    report.append(f"| 所在地区 (Region) | {basic_info.get('region', 'N/A')} |")
    report.append(f"| 公司名称 (Company) | {basic_info.get('company', 'N/A')} |")
    report.append(f"| 兴趣产品 (Products) | {basic_info.get('products', 'N/A')} |")
    report.append(f"| 背调日期 (Date) | {datetime.now().strftime('%Y-%m-%d %H:%M')} |")
    report.append("")

    # 验证结果
    report.append("## 二、验证结果 (Verification Results)")
    report.append("")

    # 2.1 邮箱验证
    email_result = data.get("email_verification", {})
    report.append("### 2.1 邮箱验证 (Email Verification)")
    report.append("")
    report.append("| 检查项 | 结果 |")
    report.append("|--------|------|")
    report.append(f"| 格式验证 | {'✅ 有效' if email_result.get('format_valid') else '❌ 无效'} |")
    report.append(f"| MX记录 | {'✅ 存在' if email_result.get('mx_exists') else '❌ 不存在'} |")
    report.append(f"| 邮箱类型 | {email_result.get('email_type', 'N/A')} |")
    report.append(f"| 域名匹配公司 | {'✅ 匹配' if email_result.get('domain_matches') else '❌ 不匹配'} |")
    report.append(f"| 得分 | {email_result.get('score', 0)} |")
    report.append("")

    # 2.2 电话验证
    phone_result = data.get("phone_verification", {})
    report.append("### 2.2 电话验证 (Phone Verification)")
    report.append("")
    report.append("| 检查项 | 结果 |")
    report.append("|--------|------|")
    report.append(f"| 格式验证 | {'✅ 有效' if phone_result.get('format_valid') else '❌ 无效'} |")
    report.append(f"| 归属国家 | {phone_result.get('phone_country', 'N/A')} |")
    report.append(f"| 号码类型 | {phone_result.get('number_type', 'N/A')} |")
    report.append(f"| 国家匹配 | {'✅ 匹配' if phone_result.get('country_matches') else '❌ 不匹配'} |")
    report.append(f"| 得分 | {phone_result.get('score', 0)} |")
    report.append("")

    # 2.3 公司验证
    company_result = data.get("company_verification", {})
    report.append("### 2.3 公司验证 (Company Verification)")
    report.append("")
    report.append("| 检查项 | 结果 |")
    report.append("|--------|------|")
    best_match = company_result.get("best_match", {})
    report.append(f"| 公司名称 | {best_match.get('name', 'N/A')} |")
    report.append(f"| 注册号 | {best_match.get('company_number') or best_match.get('siren', 'N/A')} |")
    report.append(f"| 公司状态 | {best_match.get('status', 'N/A')} |")
    report.append(f"| 注册地址 | {best_match.get('address', 'N/A')} |")
    report.append(f"| 成立日期 | {best_match.get('incorporation_date', 'N/A')} |")
    report.append(f"| 得分 | {company_result.get('score', 0)} |")
    report.append("")

    # 2.4 数字资产
    digital_result = data.get("digital_assets", {})
    report.append("### 2.4 数字资产验证 (Digital Assets)")
    report.append("")
    report.append("| 检查项 | 结果 |")
    report.append("|--------|------|")
    report.append(f"| DNS解析 | {'✅ 正常' if digital_result.get('dns_resolved') else '❌ 失败'} |")
    report.append(f"| 网站访问 | {'✅ 可访问' if digital_result.get('website_accessible') else '❌ 不可访问'} |")
    report.append(f"| SSL证书 | {'✅ 有效' if digital_result.get('ssl_valid') else '❌ 无效'} |")
    report.append(f"| 得分 | {digital_result.get('score', 0)} |")
    report.append("")

    # 2.5 社交媒体
    social_result = data.get("social_media", {})
    if social_result:
        report.append("### 2.5 社交媒体验证 (Social Media)")
        report.append("")
        report.append("| 平台 | 状态 |")
        report.append("|------|------|")
        for platform, status in social_result.items():
            status_symbol = "✅ 找到" if status else "❌ 未找到"
            report.append(f"| {platform} | {status_symbol} |")
        report.append("")

    # 2.6 电商平台
    ecommerce_result = data.get("ecommerce", {})
    if ecommerce_result:
        report.append("### 2.6 电商平台验证 (E-commerce)")
        report.append("")
        report.append("| 平台 | 状态 |")
        report.append("|------|------|")
        for platform, status in ecommerce_result.items():
            status_symbol = "✅ 有店铺" if status else "❌ 无店铺"
            report.append(f"| {platform} | {status_symbol} |")
        report.append("")

    # 2.7 海关贸易
    trade_result = data.get("trade", {})
    if trade_result:
        report.append("### 2.7 海关贸易验证 (Trade Records)")
        report.append("")
        report.append("| 检查项 | 结果 |")
        report.append("|--------|------|")
        report.append(f"| 进口记录 | {'✅ 有记录' if trade_result.get('has_records') else '❌ 无记录'} |")
        if trade_result.get('has_records'):
            report.append(f"| 最近进口 | {trade_result.get('last_import', 'N/A')} |")
            report.append(f"| 进口品类 | {trade_result.get('categories', 'N/A')} |")
        report.append("")

    # 风险评分
    risk_result = data.get("risk_assessment", {})
    report.append("## 三、风险评分 (Risk Assessment)")
    report.append("")
    report.append(f"### 综合得分: **{risk_result.get('total_score', 0)}**")
    report.append("")

    risk_level = risk_result.get("risk_level", {})
    report.append(f"### 风险等级: {risk_level.get('symbol', '')} **{risk_level.get('label', 'N/A')}** ({risk_level.get('label_zh', 'N/A')})")
    report.append("")

    # 维度得分详情
    dimension_scores = risk_result.get("dimension_scores", {})
    if dimension_scores:
        report.append("| 维度 | 得分 | 权重 | 加权分 |")
        report.append("|------|------|------|--------|")
        for dim, details in dimension_scores.items():
            report.append(f"| {dim} | {details.get('score', 0)} | {details.get('weight', 0)*100:.0f}% | {details.get('weighted', 0)} |")
        report.append("")

    # 建议
    report.append("## 四、验证建议 (Recommendation)")
    report.append("")
    report.append(risk_result.get("recommendation", "N/A"))
    report.append("")

    # 附录
    report.append("## 五、附录 (Appendix)")
    report.append("")
    report.append("- 搜索链接和原始数据已保存")
    report.append("- 背调框架版本: v1.1")
    report.append(f"- 报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("")

    return "\n".join(report)


def generate_summary_line(data: Dict[str, Any]) -> str:
    """
    生成一行摘要

    Args:
        data: 客户背调数据

    Returns:
        str: 摘要行
    """
    basic = data.get("basic_info", {})
    risk = data.get("risk_assessment", {})

    name = basic.get("name", "N/A")
    company = basic.get("company", "N/A")
    score = risk.get("total_score", 0)
    level = risk.get("risk_level", {}).get("symbol", "")

    return f"{name} | {company} | {level} {score}分"


def save_report(report: str, output_path: str) -> None:
    """
    保存报告到文件

    Args:
        report: 报告内容
        output_path: 输出路径
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Report Generator - 报告生成工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python report_generator.py --data customer_data.json --output report.md
  python report_generator.py --data customer_data.json --output report.md --summary
        '''
    )

    parser.add_argument('--data', required=True, help='JSON file with customer verification data')
    parser.add_argument('--output', required=True, help='Output file path')
    parser.add_argument('--summary', action='store_true', help='Output summary line only')
    parser.add_argument('--format', choices=['markdown', 'md', 'text'], default='markdown')

    args = parser.parse_args()

    # 读取数据
    with open(args.data, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 生成报告
    if args.summary:
        report = generate_summary_line(data)
    else:
        report = generate_markdown_report(data)

    # 保存
    save_report(report, args.output)
    print(f"Report saved to: {args.output}")


if __name__ == '__main__':
    main()
