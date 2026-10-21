#!/usr/bin/env python3
"""ICP 契合度确定性打分（标准库移植版）。

逻辑逐行移植自上游 backend/app/services/prospecting_scoring.py 的
ProspectingScoringService._calculate / _target_match / _score_response，
数字与分支保持一致；去掉了数据库、Pydantic、多用户与画像版本管理。

用法：
  python3 scripts/icp_score.py 联系人.csv [--profile 画像.json] [-o 打分结果.csv]
  python3 scripts/icp_score.py --self-test
联系人 CSV / JSONL 字段见 SKILL.md「输入」。
"""

import argparse
import csv
import json
import sys
from pathlib import Path

DEFAULT_WEIGHTS = {"role_fit": 40, "contact_quality": 35, "evidence_quality": 25}
DEFAULT_PROFILE = {
    "target_departments": ["executive", "sales", "management"],
    "target_seniorities": ["executive", "senior"],
    "title_keywords": ["founder", "owner", "director", "head", "vp"],
    "preferred_contact_types": ["personal"],
    "weights": dict(DEFAULT_WEIGHTS),
    "minimum_score": 65,
}
VERIFICATION = {"valid": 1.0, "accept_all": 0.55, "unknown": 0.25, "webmail": 0.2, "disposable": 0.0, "invalid": 0.0}
OUT_FIELDS = ["role_fit", "contact_quality", "evidence_quality", "base_score", "final_score", "tier", "recommended", "reasons", "missing_signals"]


def _norm(values):
    return list(dict.fromkeys(str(v).strip().lower() for v in values or [] if str(v).strip()))


def _blank(v):
    return v is None or str(v).strip() == ""


def _bool_or_none(v):
    if _blank(v):
        return None
    if isinstance(v, bool):
        return v
    return str(v).strip().lower() in ("true", "1", "yes", "y", "是")


def _target_match(value, targets, signal, reasons, missing):
    if not targets:
        return 1.0
    if _blank(value):
        missing.append(signal)
        return 0.5
    if str(value).lower() in targets:
        reasons.append(f"{signal}_match")
        return 1.0
    return 0.0


def _evidence_count(v):
    if isinstance(v, list):
        return len(v)
    if _blank(v):
        return 0
    text = str(v).strip()
    if text.isdigit():
        return int(text)
    return len([x for x in text.split("|") if x.strip()])


def score_contact(c, profile):
    reasons, missing, role_values = [], [], []
    role_values.append(_target_match(c.get("department"), _norm(profile["target_departments"]), "department", reasons, missing))
    role_values.append(_target_match(c.get("seniority"), _norm(profile["target_seniorities"]), "seniority", reasons, missing))
    keywords = _norm(profile["title_keywords"])
    position = "" if _blank(c.get("position")) else str(c["position"])
    if keywords:
        if not position:
            role_values.append(0.5)
            missing.append("position")
        elif any(word in position.lower() for word in keywords):
            role_values.append(1.0)
            reasons.append("title_keyword_match")
        else:
            role_values.append(0.0)
    dm = _bool_or_none(c.get("decision_maker"))
    role_values.append(1.0 if dm is True else 0.2 if dm is False else 0.5)
    if dm is True:
        reasons.append("decision_maker_match")
    elif dm is None:
        missing.append("decision_maker")

    status = None if _blank(c.get("verification_status")) else str(c["verification_status"]).strip().lower()
    verification = VERIFICATION.get(status, 0.25)
    if status == "valid":
        reasons.append("verified_email")
    if _blank(c.get("confidence")):
        confidence = 0.5
        missing.append("confidence")
    else:
        confidence = max(0.0, min(float(c["confidence"]), 100.0)) / 100
    preferred = set(_norm(profile["preferred_contact_types"]))
    ctype = None if _blank(c.get("contact_type")) else str(c["contact_type"]).strip().lower()
    if ctype is None:
        contact_type = 0.5
        missing.append("contact_type")
    elif not preferred or ctype in preferred:
        contact_type = 1.0
        reasons.append("preferred_contact_type")
    else:
        contact_type = 0.3

    n_evidence = _evidence_count(c.get("evidence"))
    evidence_depth = min(n_evidence / 2, 1.0)
    if n_evidence:
        reasons.append("source_evidence_available")
    else:
        missing.append("evidence")
    filled = [c.get("company"), c.get("domain"), c.get("position"), c.get("first_name") or c.get("last_name")]
    completeness = sum(not _blank(v) for v in filled) / len(filled)

    factors = {
        "role_fit": round(sum(role_values) / len(role_values) * 100, 1),
        "contact_quality": round((verification + confidence + contact_type) / 3 * 100, 1),
        "evidence_quality": round((evidence_depth + completeness) / 2 * 100, 1),
    }
    weights = profile.get("weights") or DEFAULT_WEIGHTS
    base = round(sum(factors[f] * float(weights[f]) / 100 for f in DEFAULT_WEIGHTS), 1)
    adj = 0 if _blank(c.get("score_adjustment")) else int(float(c["score_adjustment"]))
    if not -20 <= adj <= 20:
        raise ValueError(f"score_adjustment must be -20..20, got {adj}")
    final = round(max(0.0, min(base + adj, 100.0)), 1)
    tier = "A" if final >= 80 else "B" if final >= 65 else "C" if final >= 50 else "D"
    review = (c.get("review_status") or "unreviewed").strip().lower()
    recommended = review == "qualified" or (review != "disqualified" and final >= profile["minimum_score"])
    return {**factors, "base_score": base, "final_score": final, "tier": tier, "recommended": recommended,
            "reasons": "|".join(dict.fromkeys(reasons)), "missing_signals": "|".join(dict.fromkeys(missing))}


def load_profile(path):
    profile = dict(DEFAULT_PROFILE)
    if path:
        profile.update(json.loads(Path(path).read_text(encoding="utf-8")))
    if sum(int(v) for v in profile["weights"].values()) != 100:
        raise ValueError("ICP weights must total 100")
    return profile


def load_contacts(path):
    p = Path(path)
    if p.suffix.lower() in (".jsonl", ".ndjson"):
        return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]
    with p.open(encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def _self_test():
    full = {"email": "a@x.com", "first_name": "A", "company": "X", "domain": "x.com", "position": "Purchasing Director",
            "department": "management", "seniority": "senior", "decision_maker": "true", "verification_status": "valid",
            "confidence": "100", "contact_type": "personal", "evidence": "u1|u2"}
    r = score_contact(full, DEFAULT_PROFILE)
    assert r["base_score"] == 100.0 and r["tier"] == "A" and r["recommended"], r
    empty = score_contact({"email": "b@y.com"}, DEFAULT_PROFILE)
    assert empty["role_fit"] == 50.0 and empty["contact_quality"] == 41.7 and empty["evidence_quality"] == 0.0, empty
    assert empty["tier"] == "D" and not empty["recommended"], empty
    assert "decision_maker" in empty["missing_signals"] and "evidence" in empty["missing_signals"]
    boosted = score_contact({"email": "b@y.com", "review_status": "qualified"}, DEFAULT_PROFILE)
    assert boosted["recommended"], boosted
    print("self-test ok")


def main(argv):
    ap = argparse.ArgumentParser(description="ICP 契合度确定性打分")
    ap.add_argument("contacts", nargs="?")
    ap.add_argument("--profile")
    ap.add_argument("-o", "--output", help="输出 CSV；不填打印到屏幕")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args(argv)
    if args.self_test:
        _self_test()
        return 0
    if not args.contacts:
        ap.error("contacts is required")
    profile = load_profile(args.profile)
    rows = [{**c, **score_contact(c, profile)} for c in load_contacts(args.contacts)]
    rows.sort(key=lambda r: (-r["final_score"], str(r.get("email") or "")))
    fields = list(dict.fromkeys([k for r in rows for k in r if k not in OUT_FIELDS] + OUT_FIELDS))
    out = open(args.output, "w", encoding="utf-8-sig", newline="") if args.output else sys.stdout
    try:
        w = csv.DictWriter(out, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({k: (json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v) for k, v in r.items()})
    finally:
        if out is not sys.stdout:
            out.close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
