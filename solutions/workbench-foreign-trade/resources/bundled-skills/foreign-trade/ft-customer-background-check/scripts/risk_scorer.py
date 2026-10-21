#!/usr/bin/env python3
"""
Risk Scorer - 风险评分计算模块

功能:
1. 根据各维度结果计算综合风险评分
2. 输出风险等级和建议
3. 支持自定义权重

使用方式:
    python risk_scorer.py --results '{"email_score":100,"company_score":80,...}'
    python risk_scorer.py --input results.json

输出: JSON格式的风险评分报告
"""

import argparse
import json
import sys
from typing import Dict, Any, Optional
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import RISK_WEIGHTS, RISK_THRESHOLDS, SCORING_RULES


def calculate_weighted_score(scores: Dict[str, int], weights: Dict[str, float] = None) -> Dict[str, Any]:
    """
    计算加权平均得分

    Args:
        scores: 各维度得分
        weights: 权重配置

    Returns:
        dict: 加权计算结果
    """
    if weights is None:
        weights = RISK_WEIGHTS

    dimension_scores = {}
    total_weight = 0
    total_score = 0

    for dimension, score in scores.items():
        # 尝试匹配维度名称
        weight_key = dimension.lower().replace(' ', '_').replace('-', '_')

        weight = weights.get(weight_key, weights.get(dimension, 0))

        if weight > 0:
            weighted = score * weight
            dimension_scores[dimension] = {
                "score": score,
                "weight": weight,
                "weighted": round(weighted, 2)
            }
            total_score += weighted
            total_weight += weight

    # 标准化到100分
    if total_weight > 0 and total_weight < 1:
        pass  # 权重已经是比例形式

    return {
        "dimension_scores": dimension_scores,
        "total_score": round(total_score, 1),
        "total_weight": total_weight
    }


def determine_risk_level(score: int) -> Dict[str, str]:
    """
    根据得分确定风险等级

    Args:
        score: 总分

    Returns:
        dict: 风险等级信息
    """
    if score >= RISK_THRESHOLDS["low_risk"]:
        return {
            "level": "low",
            "symbol": "✅",
            "label": "Verified",
            "label_zh": "可信"
        }
    elif score >= RISK_THRESHOLDS["medium_risk"]:
        return {
            "level": "medium",
            "symbol": "⚠️",
            "label": "Needs Supplement",
            "label_zh": "需补充材料"
        }
    else:
        return {
            "level": "high",
            "symbol": "❌",
            "label": "High Risk",
            "label_zh": "高风险"
        }


def generate_recommendation(score: int, dimension_scores: Dict[str, Any]) -> str:
    """
    根据评分生成建议

    Args:
        score: 总分
        dimension_scores: 各维度得分详情

    Returns:
        str: 建议内容
    """
    recommendations = []

    # 检查各维度得分
    for dimension, details in dimension_scores.items():
        if details["score"] < 50:
            dimension_lower = dimension.lower().replace('_', '')

            if "email" in dimension_lower:
                recommendations.append("Request corporate email or company documentation")
            elif "company" in dimension_lower:
                recommendations.append("Verify company registration and status")
            elif "personnel" in dimension_lower or "director" in dimension_lower:
                recommendations.append("Request employment proof or authorization letter")
            elif "digital" in dimension_lower or "asset" in dimension_lower:
                recommendations.append("Request company website or social media links")
            elif "ecommerce" in dimension_lower:
                recommendations.append("Verify e-commerce store existence")
            elif "trade" in dimension_lower:
                recommendations.append("Check trade records if available")

    # 根据总分给出主要建议
    if score >= 80:
        main_rec = "Customer is verified. Proceed with normal business cooperation."
    elif score >= 50:
        main_rec = "Customer needs additional verification. " + " ".join(recommendations[:2])
    else:
        main_rec = "HIGH RISK ALERT. " + " ".join(recommendations) + " Consider prepayment or guaranteed transaction."

    return main_rec


def calculate_risk_score(
    email_score: int = 0,
    company_status_score: int = 0,
    personnel_score: int = 0,
    digital_assets_score: int = 0,
    ecommerce_score: int = 0,
    trade_score: int = 0,
    **kwargs
) -> Dict[str, Any]:
    """
    计算风险评分 (主入口函数)

    Args:
        email_score: 邮箱验证得分
        company_status_score: 公司状态得分
        personnel_score: 人员关联得分
        digital_assets_score: 数字资产得分
        ecommerce_score: 电商平台得分
        trade_score: 海关贸易得分
        **kwargs: 其他维度得分

    Returns:
        dict: 完整的风险评分报告
    """
    # 合并得分
    scores = {
        "email_verification": email_score,
        "company_status": company_status_score,
        "personnel_association": personnel_score,
        "digital_assets": digital_assets_score,
        "ecommerce_verification": ecommerce_score,
        "trade_verification": trade_score
    }

    # 添加额外维度
    for key, value in kwargs.items():
        if key.endswith('_score') and isinstance(value, int):
            scores[key[:-6]] = value

    # 计算加权得分
    weighted_result = calculate_weighted_score(scores)

    # 确定风险等级
    risk_level = determine_risk_level(weighted_result["total_score"])

    # 生成建议
    recommendation = generate_recommendation(
        weighted_result["total_score"],
        weighted_result["dimension_scores"]
    )

    return {
        "total_score": weighted_result["total_score"],
        "risk_level": risk_level,
        "dimension_scores": weighted_result["dimension_scores"],
        "recommendation": recommendation,
        "thresholds_used": RISK_THRESHOLDS
    }


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Risk Scorer - 风险评分计算工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python risk_scorer.py --email 100 --company 80 --personnel 70 --digital 60 --ecommerce 50 --trade 40
  python risk_scorer.py --results '{"email_verification":100,"company_status":80}'
  python risk_scorer.py --input results.json
        '''
    )

    parser.add_argument('--email', type=int, default=0, help='Email verification score (0-100)')
    parser.add_argument('--company', type=int, default=0, help='Company status score (0-100)')
    parser.add_argument('--personnel', type=int, default=0, help='Personnel association score (0-100)')
    parser.add_argument('--digital', type=int, default=0, help='Digital assets score (0-100)')
    parser.add_argument('--ecommerce', type=int, default=0, help='E-commerce verification score (0-100)')
    parser.add_argument('--trade', type=int, default=0, help='Trade verification score (0-100)')
    parser.add_argument('--results', help='JSON string with all scores')
    parser.add_argument('--input', help='JSON file with all scores')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')

    args = parser.parse_args()

    # 解析输入
    if args.results:
        scores = json.loads(args.results)
        result = calculate_risk_score(**scores)
    elif args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            scores = json.load(f)
        result = calculate_risk_score(**scores)
    else:
        result = calculate_risk_score(
            email_score=args.email,
            company_status_score=args.company,
            personnel_score=args.personnel,
            digital_assets_score=args.digital,
            ecommerce_score=args.ecommerce,
            trade_score=args.trade
        )

    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Total Score: {result['total_score']}")
        print(f"Risk Level: {result['risk_level']['symbol']} {result['risk_level']['label']}")
        print(f"\nDimension Scores:")
        for dim, details in result['dimension_scores'].items():
            print(f"  {dim}: {details['score']} (weight: {details['weight']})")
        print(f"\nRecommendation: {result['recommendation']}")


if __name__ == '__main__':
    main()
