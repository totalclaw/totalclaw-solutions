"""Deterministic pre-send gate — the last line before an email leaves.

LLM instructions are a floor, not a guarantee. Every outgoing email passes
these non-LLM checks at send time; a failure blocks the send and records
why, so a bad generation can never reach a prospect. This is the pattern
the surviving commercial AI-SDR vendors converged on after the 2025
autonomous-agent flameouts: constraints in the prompt, verification in
code.
"""

import re
from dataclasses import dataclass, field

# Spam-filter and AI-tell phrases that must never appear in outgoing mail.
# Mirrors prompts/writer.md; enforced here because prompts can be ignored.
BANNED_PHRASES = (
    "act now", "buy now", "click here", "click below", "limited time",
    "limited offer", "exclusive deal", "special offer", "risk-free",
    "no obligation", "100% free", "make money", "double your",
    "guaranteed results", "winner", "congratulations",
    "i hope this finds you well", "hope this email finds you well",
    "i hope this email finds you", "picture this", "what if i told you",
    "in today's fast-paced world", "game-changer", "game changer",
    "cutting-edge solution", "revolutionize your", "unlock your",
    "supercharge your", "as an ai", "i'm an ai", "i am an ai",
    "as a language model",
)

MAX_SUBJECT_LEN = 90
MAX_BODY_WORDS = 220        # hard ceiling; sequences aim far lower
MAX_LINKS = 1

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
MERGE_TAG_RE = re.compile(r"\{\{\s*\w+\s*\}\}|\{\s*\w+\s*\}(?!\})")
URL_RE = re.compile(r"https?://\S+", re.IGNORECASE)

DELIVERABLE_STATUSES = {"verified", "risky"}


@dataclass
class GateResult:
    ok: bool
    reasons: list[str] = field(default_factory=list)

    def __bool__(self):
        return self.ok


def pre_send_check(
    to_email: str,
    subject: str,
    body: str,
    prospect=None,
    allow_risky: bool = False,
    kind: str = "sequence",
) -> GateResult:
    """Run every deterministic check. Returns ok=False with reasons on any hit."""
    reasons: list[str] = []
    subject = (subject or "").strip()
    body = (body or "").strip()
    to_email = (to_email or "").strip().lower()

    # Recipient sanity
    if not EMAIL_RE.match(to_email):
        reasons.append(f"invalid recipient address '{to_email}'")
    if prospect is not None:
        if (prospect.email or "").strip().lower() != to_email:
            reasons.append("recipient does not match the prospect record")
        allowed = DELIVERABLE_STATUSES if allow_risky else {"verified"}
        # Replies go back to someone who emailed US — deliverability proven.
        if kind == "sequence" and (prospect.email_status or "guess") not in allowed:
            reasons.append(
                f"email_status '{prospect.email_status or 'guess'}' is not deliverable"
            )

    # Content sanity
    if not subject:
        reasons.append("empty subject")
    if not body:
        reasons.append("empty body")
    if len(subject) > MAX_SUBJECT_LEN:
        reasons.append(f"subject too long ({len(subject)} > {MAX_SUBJECT_LEN})")
    word_count = len(body.split())
    if word_count > MAX_BODY_WORDS:
        reasons.append(f"body too long ({word_count} words > {MAX_BODY_WORDS})")

    # Unrendered merge tags — the classic mass-mail embarrassment
    leftover = MERGE_TAG_RE.findall(subject + " " + body)
    if leftover:
        reasons.append(f"unrendered merge tags: {sorted(set(leftover))[:3]}")

    # Banned phrases (spam triggers + AI tells)
    lowered = (subject + " " + body).lower()
    hits = [p for p in BANNED_PHRASES if p in lowered]
    if hits:
        reasons.append(f"banned phrases: {hits[:3]}")

    # Link budget: cold email with links goes to spam
    links = URL_RE.findall(body)
    if len(links) > MAX_LINKS:
        reasons.append(f"too many links ({len(links)} > {MAX_LINKS})")

    # No HTML — Harvey sends plain text only
    if re.search(r"<\s*(html|body|div|table|img|a)\b", body, re.IGNORECASE):
        reasons.append("HTML markup in body (plain text only)")

    return GateResult(ok=not reasons, reasons=reasons)


# ═════════════════════════════════════════════════════════════════════════
# 以下为本产品增补（不是上游代码）：命令行入口，外加三项上游 gate.py 没有的检查。
#   · 退订句、风险声明词 / 套话：规则取自 b2b-lead-hunter-skill 的
#     scripts/evaluate_outreach_drafts.py（spam_risk / claim_risk）
#   · 抑制名单（email / domain / company）与审批 hash：取自同仓库 scripts/send_smtp.py
#     （suppression_reason / body_hash）
# 只用标准库。用法：python3 scripts/gate.py drafts.jsonl [--suppression 抑制名单.csv]
#                     [--allow-risky] [--print-hash] | --self-test
# ═════════════════════════════════════════════════════════════════════════

import csv
import hashlib
import json
import sys
from types import SimpleNamespace
from urllib.parse import urlparse

# evaluate_outreach_drafts.py spam_risk()：正文没有这些词之一 → 缺退订句（阻断）。
# "退订" 为本产品补充，便于中文正文；外语正文请在记录里给 opt_out_line。
OPT_OUT_HINTS = ("stop", "unsubscribe", "not contact", "退订")
# evaluate_outreach_drafts.py 的 SPAM_PHRASES 与 HIGH_RISK_CLAIM_TERMS：上游只记为「需复核」，这里同样只出 warning。
REVIEW_SPAM_PHRASES = (
    "best price", "cheapest", "guaranteed", "risk-free", "limited time", "act now",
    "urgent", "free quote", "dear sir/madam", "to whom it may concern",
)
REVIEW_CLAIM_TERMS = (
    "certified", "authorized", "exclusive", "local stock", "in stock",
    "factory direct lowest", "guarantee", "approved supplier", "existing customer",
)


def _domain(value: str) -> str:
    text = (value or "").strip().lower()
    if not text:
        return ""
    if "@" in text and "://" not in text:
        text = text.rsplit("@", 1)[-1]
    if "://" not in text:
        text = "https://" + text
    host = urlparse(text).netloc.lower().split(":", 1)[0]
    return host[4:] if host.startswith("www.") else host


def _company_key(name: str) -> str:
    return "".join(ch for ch in (name or "").lower() if ch.isalnum())


def approval_hash(rec: dict) -> str:
    """与 send_smtp.py body_hash() 同算法：收件人(去空格转小写)\\n主题\\n正文\\n退订句 的 SHA-256。"""
    payload = "\n".join([
        str(rec.get("to_email") or "").strip().lower(),
        str(rec.get("subject") or ""),
        str(rec.get("body") or ""),
        str(rec.get("opt_out_line") or ""),
    ])
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def load_suppressions(path=None) -> dict:
    out = {"email": set(), "domain": set(), "company": set()}
    if not path:
        return out
    with open(path, "r", encoding="utf-8-sig", newline="") as fh:
        for row in csv.DictReader(fh):
            typ = str(row.get("type") or "").strip().lower()
            value = str(row.get("value") or "").strip()
            if not value:
                continue
            if typ == "email":
                out["email"].add(value.lower())
            elif typ == "domain":
                out["domain"].add(_domain(value))
            elif typ == "company":
                out["company"].add(_company_key(value))
    return out


def check_record(rec: dict, suppressions: dict[str, set[str]], allow_risky: bool = False) -> dict:
    """单条草稿的完整发前检查。字段见 SKILL.md「输入格式」。"""
    kind = rec.get("kind") or "sequence"
    to_email = str(rec.get("to_email") or "")
    prospect = SimpleNamespace(
        email=str(rec.get("prospect_email") or to_email),
        email_status=rec.get("email_status") or "guess",
    )
    gate = pre_send_check(to_email, rec.get("subject", ""), rec.get("body", ""),
                          prospect=prospect, allow_risky=allow_risky, kind=kind)
    reasons = list(gate.reasons)
    warnings: list[str] = []
    body = str(rec.get("body") or "")
    lowered = " ".join(body.split()).lower()

    if kind == "sequence":
        opt_out_line = str(rec.get("opt_out_line") or "").strip()
        has_line = bool(opt_out_line) and opt_out_line in body
        if not has_line and not any(h in lowered for h in OPT_OUT_HINTS):
            reasons.append("missing clear opt-out line")

    email = to_email.strip().lower()
    email_domain = email.rsplit("@", 1)[-1] if "@" in email else ""
    company_domain = _domain(str(rec.get("company_domain") or ""))
    company = _company_key(str(rec.get("company_name") or ""))
    if email and email in suppressions["email"]:
        reasons.append("recipient email is suppressed")
    elif email_domain and email_domain in suppressions["domain"]:
        reasons.append("recipient email domain is suppressed")
    elif company_domain and company_domain in suppressions["domain"]:
        reasons.append("company domain is suppressed")
    elif company and company in suppressions["company"]:
        reasons.append("company is suppressed")

    digest = approval_hash(rec)
    approved = str(rec.get("approved_hash") or "")
    if approved and approved != digest:
        reasons.append("approved_hash does not match recipient/subject/body/opt-out (content changed after approval)")

    spam = [p for p in REVIEW_SPAM_PHRASES if p in lowered]
    claims = [t for t in REVIEW_CLAIM_TERMS if t in lowered]
    if spam:
        warnings.append("spam-like wording: " + ", ".join(spam))
    if claims:
        warnings.append("risky claim terms (verify or remove): " + ", ".join(claims))
    return {"ok": not reasons, "reasons": reasons, "warnings": warnings, "hash": digest}


def _self_test() -> None:
    good = {
        "to_email": "anna.berg@acme-trade.de", "email_status": "verified", "kind": "sequence",
        "subject": "pump seals for acme",
        "body": "Anna, saw Acme distributes dosing pumps in Bavaria. Would seal kits be relevant?\n"
                "If this is not relevant, reply stop and we will not contact you again.",
    }
    r = check_record(good, load_suppressions(None))
    assert r["ok"], r
    assert check_record({**good, "approved_hash": r["hash"]}, load_suppressions(None))["ok"]
    changed = check_record({**good, "approved_hash": r["hash"], "body": good["body"] + " Thanks"}, load_suppressions(None))
    assert not changed["ok"] and "approved_hash" in changed["reasons"][-1], changed
    guess = check_record({**good, "email_status": "guess"}, load_suppressions(None))
    assert not guess["ok"], guess
    reply_guess = check_record({**good, "email_status": "guess", "kind": "reply", "body": "Thanks Anna, specs attached in the next mail."}, load_suppressions(None))
    assert reply_guess["ok"], reply_guess
    no_opt_out = check_record({**good, "body": "Anna, saw Acme distributes dosing pumps. Would seal kits be relevant?"}, load_suppressions(None))
    assert "missing clear opt-out line" in no_opt_out["reasons"], no_opt_out
    tags = check_record({**good, "body": good["body"] + " {{first_name}}"}, load_suppressions(None))
    assert any("merge tags" in x for x in tags["reasons"]), tags
    sup = {"email": set(), "domain": {"acme-trade.de"}, "company": set()}
    assert not check_record(good, sup)["ok"]
    print("self-test ok")


def main(argv: list[str]) -> int:
    import argparse
    parser = argparse.ArgumentParser(description="发信前确定性闸门（不发信，只判定）")
    parser.add_argument("drafts", nargs="?", help="草稿 JSONL，每行一封")
    parser.add_argument("--suppression", help="抑制名单 CSV（列 type,value[,reason]，type=email|domain|company）")
    parser.add_argument("--allow-risky", action="store_true", help="允许发给 catch-all（risky）邮箱；默认只放行 verified")
    parser.add_argument("--print-hash", action="store_true", help="只打印每条的审批 hash，供审批记录使用")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args(argv)
    if args.self_test:
        _self_test()
        return 0
    if not args.drafts:
        parser.error("drafts is required")
    suppressions = load_suppressions(args.suppression)
    blocked = 0
    with open(args.drafts, "r", encoding="utf-8") as fh:
        for i, line in enumerate((l for l in fh if l.strip()), start=1):
            rec = json.loads(line)
            if args.print_hash:
                print(json.dumps({"index": i, "to": rec.get("to_email"), "hash": approval_hash(rec)}, ensure_ascii=False))
                continue
            result = check_record(rec, suppressions, allow_risky=args.allow_risky)
            blocked += 0 if result["ok"] else 1
            print(json.dumps({"index": i, "to": rec.get("to_email"), **result}, ensure_ascii=False))
    return 1 if blocked else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
