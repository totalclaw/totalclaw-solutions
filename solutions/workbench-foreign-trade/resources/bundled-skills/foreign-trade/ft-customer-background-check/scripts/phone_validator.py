#!/usr/bin/env python3
"""
Phone Validator - 电话验证模块

功能:
1. 电话格式验证
2. 归属国家判断
3. 号码类型判断 (手机/座机)
4. 与客户声称国家匹配验证

使用方式:
    python phone_validator.py --phone "+44 7123 456789" --country "UK"
    python phone_validator.py --phone "+1 555 123 4567" --country "US"

输出: JSON格式的验证结果
"""

import argparse
import json
import re
import sys
from typing import Optional, Dict, Any
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from config import COUNTRY_PHONE_CODES, COUNTRY_CODE_MAP, SCORING_RULES


def clean_phone_number(phone: str) -> str:
    """
    清理电话号码,移除空格和格式字符

    Args:
        phone: 原始电话号码

    Returns:
        str: 清理后的号码
    """
    if not phone:
        return ""
    # 保留 + 号和数字
    cleaned = re.sub(r'[^\d+]', '', phone)
    return cleaned


def validate_phone_format(phone: str) -> Dict[str, Any]:
    """
    方式1: 使用 phonenumbers 库验证 (推荐)

    Args:
        phone: 电话号码

    Returns:
        dict: 验证结果
    """
    result = {
        "method": "phonenumbers",
        "valid": False,
        "country_code": None,
        "national_number": None,
        "number_type": None,
        "error": None
    }

    try:
        import phonenumbers

        # 尝试解析号码
        parsed = phonenumbers.parse(phone, None)

        result["valid"] = phonenumbers.is_valid_number(parsed)
        result["country_code"] = parsed.country_code
        result["national_number"] = parsed.national_number

        # 判断号码类型
        number_type = phonenumbers.number_type(parsed)
        type_map = {
            phonenumbers.PhoneNumberType.MOBILE: "mobile",
            phonenumbers.PhoneNumberType.FIXED_LINE: "landline",
            phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "mobile_or_landline",
            phonenumbers.PhoneNumberType.TOLL_FREE: "toll_free",
            phonenumbers.PhoneNumberType.PREMIUM_RATE: "premium",
            phonenumbers.PhoneNumberType.SHARED_COST: "shared_cost",
            phonenumbers.PhoneNumberType.VOIP: "voip",
            phonenumbers.PhoneNumberType.PERSONAL_NUMBER: "personal",
            phonenumbers.PhoneNumberType.PAGER: "pager",
            phonenumbers.PhoneNumberType.UAN: "uan",
            phonenumbers.PhoneNumberType.UNKNOWN: "unknown"
        }
        result["number_type"] = type_map.get(number_type, "unknown")

    except ImportError:
        result["error"] = "phonenumbers not installed"
    except phonenumbers.NumberParseException as e:
        result["error"] = str(e)
    except Exception as e:
        result["error"] = str(e)

    return result


def validate_phone_regex(phone: str) -> Dict[str, Any]:
    """
    方式2: 使用正则表达式验证 (备选)

    Args:
        phone: 电话号码

    Returns:
        dict: 验证结果
    """
    result = {
        "method": "regex",
        "valid": False,
        "country_code": None,
        "number_type": None,
        "error": None
    }

    try:
        cleaned = clean_phone_number(phone)

        if not cleaned:
            result["error"] = "Empty phone number"
            return result

        # 检查国际格式 (+开头)
        if cleaned.startswith('+'):
            # 提取国家代码
            # 常见国家代码长度: 1-3位
            for code_length in [3, 2, 1]:
                potential_code = cleaned[1:1+code_length]
                if potential_code in [str(v) for v in COUNTRY_PHONE_CODES.values()]:
                    result["country_code"] = int(potential_code)
                    remaining = cleaned[1+code_length:]
                    if len(remaining) >= 6:  # 至少6位号码
                        result["valid"] = True
                        # 简单判断手机号 (以特定数字开头)
                        if remaining[0] in '789':  # 很多国家手机号以7,8,9开头
                            result["number_type"] = "mobile"
                        else:
                            result["number_type"] = "landline"
                    break

            if not result["country_code"]:
                # 无法识别国家代码,但格式可能有效
                if len(cleaned) >= 10:
                    result["valid"] = True
                    result["number_type"] = "unknown"

        else:
            # 非国际格式,检查长度
            if len(cleaned) >= 8:
                result["valid"] = True
                result["number_type"] = "unknown"

    except Exception as e:
        result["error"] = str(e)

    return result


def validate_phone(phone: str) -> Dict[str, Any]:
    """
    使用多种方式验证电话 (都执行策略)

    Args:
        phone: 电话号码

    Returns:
        dict: 综合结果
    """
    results = []

    # 方式1: phonenumbers 库 (推荐)
    result1 = validate_phone_format(phone)
    results.append(result1)

    # 方式2: 正则表达式 (备选)
    result2 = validate_phone_regex(phone)
    results.append(result2)

    # 综合判断
    valid = any(r["valid"] for r in results)

    # 选择最佳结果
    best_result = None
    for r in results:
        if r["valid"] and r["country_code"]:
            best_result = r
            break

    if not best_result:
        for r in results:
            if r["valid"]:
                best_result = r
                break

    return {
        "valid": valid,
        "country_code": best_result["country_code"] if best_result else None,
        "number_type": best_result["number_type"] if best_result else None,
        "methods_tried": len(results),
        "methods_succeeded": sum(1 for r in results if r["valid"]),
        "details": results,
        "best_method": best_result["method"] if best_result else None
    }


def get_country_from_code(country_code: int) -> Optional[str]:
    """
    从国家代码获取国家名称

    Args:
        country_code: 国家代码 (如 44, 1, 33)

    Returns:
        str: 国家代码 (如 UK, US, FR)
    """
    for code, phone_code in COUNTRY_PHONE_CODES.items():
        if str(phone_code) == str(country_code):
            return code
    return None


def check_country_match(
    phone_country_code: Optional[int],
    claimed_country: Optional[str]
) -> Dict[str, Any]:
    """
    检查电话归属国家与声称国家是否匹配

    Args:
        phone_country_code: 电话的国家代码
        claimed_country: 客户声称的国家

    Returns:
        dict: 匹配结果
    """
    result = {
        "matches": False,
        "phone_country": None,
        "claimed_country": claimed_country,
        "confidence": "none",
        "reason": None
    }

    if not claimed_country:
        result["reason"] = "No claimed country provided"
        return result

    if not phone_country_code:
        result["reason"] = "Could not determine phone country"
        return result

    # 获取电话归属国家
    phone_country = get_country_from_code(phone_country_code)
    result["phone_country"] = phone_country

    # 标准化声称国家
    claimed_normalized = COUNTRY_CODE_MAP.get(
        claimed_country.upper().strip(),
        claimed_country.upper().strip()
    )

    # 比较
    if phone_country == claimed_normalized:
        result["matches"] = True
        result["confidence"] = "high"
        result["reason"] = "Phone country matches claimed country"
    else:
        result["matches"] = False
        result["reason"] = f"Phone country ({phone_country}) does not match claimed country ({claimed_normalized})"

    return result


def calculate_phone_score(
    valid: bool,
    country_matches: bool,
    number_type: Optional[str]
) -> int:
    """
    计算电话验证得分

    Args:
        valid: 格式是否有效
        country_matches: 国家是否匹配
        number_type: 号码类型

    Returns:
        int: 得分 (0-100)
    """
    if not valid:
        return 0

    score = 50  # 基础分

    if country_matches:
        score += 40

    if number_type == "mobile":
        score += 10
    elif number_type == "landline":
        score += 5

    return min(score, 100)


def validate_phone_with_country(
    phone: str,
    country: Optional[str] = None
) -> Dict[str, Any]:
    """
    验证电话 (主入口函数)

    Args:
        phone: 电话号码
        country: 客户声称的国家

    Returns:
        dict: 完整的验证结果
    """
    result = {
        "phone": phone,
        "claimed_country": country,
        "format_valid": False,
        "country_code": None,
        "phone_country": None,
        "number_type": None,
        "country_matches": False,
        "country_match_details": None,
        "score": 0,
        "errors": []
    }

    # 1. 电话验证 (多种方式)
    validation_result = validate_phone(phone)
    result["format_valid"] = validation_result["valid"]
    result["country_code"] = validation_result["country_code"]
    result["number_type"] = validation_result["number_type"]

    if not result["format_valid"]:
        result["errors"].append("Invalid phone format")
        return result

    # 2. 国家匹配检查
    if country:
        match_result = check_country_match(result["country_code"], country)
        result["country_matches"] = match_result["matches"]
        result["phone_country"] = match_result["phone_country"]
        result["country_match_details"] = match_result

    # 3. 计算得分
    result["score"] = calculate_phone_score(
        result["format_valid"],
        result["country_matches"],
        result["number_type"]
    )

    return result


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='Phone Validator - 电话验证工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python phone_validator.py --phone "+44 7123 456789"
  python phone_validator.py --phone "+1 555 123 4567" --country "US"
  python phone_validator.py --phone "+33 6 12 34 56 78" --country "France"
        '''
    )

    parser.add_argument('--phone', required=True, help='Phone number to validate')
    parser.add_argument('--country', help='Claimed country for matching')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')

    args = parser.parse_args()

    # 执行验证
    result = validate_phone_with_country(args.phone, args.country)

    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Phone: {result['phone']}")
        print(f"Format Valid: {result['format_valid']}")
        print(f"Country Code: {result['country_code']}")
        print(f"Phone Country: {result['phone_country']}")
        print(f"Number Type: {result['number_type']}")
        print(f"Country Matches: {result['country_matches']}")
        print(f"Score: {result['score']}")


if __name__ == '__main__':
    main()
