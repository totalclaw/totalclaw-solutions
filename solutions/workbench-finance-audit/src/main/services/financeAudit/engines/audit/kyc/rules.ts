/**
 * B6 规则网格与处置（kyc-rules，纯函数）：风险评分 → 必备文件 → 逐条规则结论（必须引用规则号）→ 处置建议。
 *
 * 处置只有四种：clear（无异常，仍由合规官决定）/ request-docs / escalate-EDD / decline-recommend，**从不批准**。
 *   decline-recommend：触发「拒绝」规则或强命中制裁名单；
 *   escalate-EDD：高风险、触发升级规则、或任何名单命中；
 *   request-docs：缺必备文件或触发补件规则；
 *   clear：低 / 中风险、文件齐全、没有任何升级。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauImpactLevel, FauKycDisposition, FauKycHit, FauKycRecord, FauKycRuleOutcome } from '@totalclaw/ipc-contracts';
import { daysBetween } from '../../accounting/common';
import { matchValue, toNum, type ParsedTable } from '../table';
import GRID from './defaultGrid.json';

export const BUILTIN_RULES = {
  K1: i18nKey('K1 申请人或受益所有人不在高风险司法辖区'),
  K2: i18nKey('K2 信托等复杂结构计入风险评分'),
  K3: i18nKey('K3 法人与信托须披露受益所有人'),
  K4: i18nKey('K4 政治公众人物须升级强化尽调'),
  K5: i18nKey('K5 名单命中须升级，强命中制裁名单建议拒绝'),
  K6: i18nKey('K6 须说明资金来源'),
  K7: i18nKey('K7 身份证件须在有效期内'),
  K8: i18nKey('K8 地址证明不超过 3 个月'),
  K9: i18nKey('K9 必备文件齐全'),
} as const;

export interface GridRule { ruleId: string; text: string; field: string; op: string; value: string; effect: FauKycRuleOutcome['effect'] }

export function parseRules(p: ParsedTable): GridRule[] {
  return p.rows.map((r) => ({
    ruleId: r.get('ruleId'), text: r.get('ruleText'), field: r.get('field').trim(), op: r.get('op').trim().toLowerCase(), value: r.get('value'),
    effect: matchValue(r.get('effect'), ['escalate', 'request_docs', 'decline', 'risk'] as const) || 'escalate',
  })).filter((x) => x.ruleId);
}

/** 规则表能引用的字段（中英写法都认，别名在 defaultGrid.json） */
function fieldValue(rec: FauKycRecord, field: string): string | number | boolean | null {
  const f = field.toLowerCase().replace(/[\s_-]/g, '');
  const k = Object.entries(GRID.fieldAliases as Record<string, string[]>).find(([, xs]) => xs.includes(f))?.[0];
  switch (k) {
    case 'applicantType': return rec.applicantType || null;
    case 'jurisdiction': return rec.jurisdiction?.value || null;
    case 'pepDeclared': return rec.pepDeclared;
    case 'sourceOfFunds': return rec.sourceOfFunds?.value || null;
    case 'beneficialOwners': return rec.beneficialOwners.length;
    case 'legalName': return rec.legalName?.value || null;
    case 'address': return rec.address?.value || null;
    default: return null;
  }
}

export function evalGridRule(rule: GridRule, rec: FauKycRecord): FauKycRuleOutcome {
  const v = fieldValue(rec, rule.field);
  const want = rule.value.trim();
  const list = want.split(/[,，;；|]/).map((s) => s.trim().toUpperCase()).filter(Boolean);
  const s = v === null ? '' : String(v).toUpperCase();
  let fired: boolean | null;
  const op = Object.entries(GRID.opAliases as Record<string, string[]>).find(([, xs]) => xs.includes(rule.op))?.[0];
  switch (op) {
    case 'missing': fired = v === null || v === '' || v === 0; break;
    case 'exists': fired = !(v === null || v === '' || v === 0); break;
    case 'equals': fired = v === null ? null : s === want.toUpperCase(); break;
    case 'in': fired = v === null ? null : list.includes(s); break;
    case 'contains': fired = v === null ? null : s.includes(want.toUpperCase()); break;
    case 'gt': fired = typeof v === 'number' ? v > (toNum(want) ?? 0) : null; break;
    case 'lt': fired = typeof v === 'number' ? v < (toNum(want) ?? 0) : null; break;
    case 'true': fired = v === null ? null : v === true; break;
    default: fired = null;
  }
  return { ruleId: rule.ruleId, text: rule.text, builtin: false, outcome: fired === null ? 'n/a' : fired ? 'fail' : 'pass', evidence: v === null ? '' : String(v), effect: rule.effect };
}

export function screen(input: {
  record: FauKycRecord; hits: FauKycHit[]; rules: GridRule[] | null; asOf: string; th: Record<string, number>;
}): { rating: FauImpactLevel; factors: { factor: string; value: string; points: number }[]; outcomes: FauKycRuleOutcome[]; missingDocs: string[]; disposition: FauKycDisposition; reasons: string[] } {
  const { record: rec, hits, th } = input;
  const factors: { factor: string; value: string; points: number }[] = [];
  const outcomes: FauKycRuleOutcome[] = [];
  const add = (ruleId: keyof typeof BUILTIN_RULES, fail: boolean | null, evidence: string, effect: FauKycRuleOutcome['effect']) =>
    outcomes.push({ ruleId, text: BUILTIN_RULES[ruleId], builtin: true, outcome: fail === null ? 'n/a' : fail ? 'fail' : 'pass', evidence, effect });

  const jur = (rec.jurisdiction?.value || '').toUpperCase();
  const uboJur = rec.beneficialOwners.map((b) => b.nationality.toUpperCase()).filter(Boolean);
  const high = (GRID.highRiskJurisdictions as string[]);
  const hrHit = [jur, ...uboJur].filter((x) => high.includes(x));
  add('K1', jur || uboJur.length ? hrHit.length > 0 : null, [jur, ...uboJur].filter(Boolean).join(', '), 'escalate');
  if (hrHit.length) factors.push({ factor: i18nKey('高风险司法辖区'), value: hrHit.join(', '), points: th['points.jurisdiction'] ?? 3 });
  const trust = rec.applicantType === 'trust';
  add('K2', trust, rec.applicantType, 'risk');
  if (trust) factors.push({ factor: i18nKey('信托或复杂结构'), value: rec.applicantType, points: th['points.trust'] ?? 2 });
  const needUbo = rec.applicantType === 'entity' || rec.applicantType === 'trust';
  const pctSum = rec.beneficialOwners.reduce((s, b) => s + (b.pct ?? 0), 0);
  const opaque = needUbo && (rec.beneficialOwners.length === 0 || pctSum < 25);
  add('K3', needUbo ? rec.beneficialOwners.length === 0 : null, `${rec.beneficialOwners.length} · ${pctSum}%`, 'request_docs');
  if (opaque) factors.push({ factor: i18nKey('受益所有人不清'), value: `${rec.beneficialOwners.length} · ${pctSum}%`, points: th['points.opacity'] ?? 2 });
  add('K4', rec.pepDeclared, rec.pepDeclared === null ? '' : String(rec.pepDeclared), 'escalate');
  if (rec.pepDeclared) factors.push({ factor: i18nKey('政治公众人物'), value: 'PEP', points: th['points.pep'] ?? 3 });
  const sanctionWords = GRID.sanctionListWords as string[];
  const strongSanction = hits.some((h) => h.strength === 'strong' && sanctionWords.some((w) => h.listName.toLowerCase().includes(w)));
  add('K5', hits.length > 0, hits.map((h) => `${h.subject}≈${h.entry}(${h.score})`).join('; '), strongSanction ? 'decline' : 'escalate');
  const funds = !!rec.sourceOfFunds?.value;
  add('K6', !funds, rec.sourceOfFunds?.value || '', 'request_docs');
  if (!funds) factors.push({ factor: i18nKey('资金来源不清'), value: '', points: th['points.funds'] ?? 2 });
  const expired = rec.idDocuments.filter((d) => d.expiry && d.expiry < input.asOf);
  add('K7', rec.idDocuments.length ? expired.length > 0 : null, expired.map((d) => `${d.type} ${d.expiry}`).join('; '), 'request_docs');
  const addr = rec.documents.filter((d) => d.type === 'address');
  const fresh = addr.filter((d) => d.date && daysBetween(d.date, input.asOf) <= (th['address.maxAgeDays'] ?? 90));
  add('K8', addr.length ? fresh.length === 0 : null, addr.map((d) => `${d.docName} ${d.date}`).join('; '), 'request_docs');
  const req = rec.applicantType ? (GRID.requiredDocs as Record<string, string[]>)[rec.applicantType] || [] : [];
  const have = new Set(rec.documents.map((d) => d.type));
  const missingDocs = req.filter((d) => !have.has(d) || (d === 'address' && addr.length > 0 && fresh.length === 0) || (d === 'identity' && expired.length > 0 && expired.length === rec.idDocuments.length));
  add('K9', req.length ? missingDocs.length > 0 : null, missingDocs.join(', '), 'request_docs');

  if (input.rules) outcomes.push(...input.rules.map((r) => evalGridRule(r, rec)));
  for (const o of outcomes.filter((x) => !x.builtin && x.outcome === 'fail' && x.effect === 'risk')) factors.push({ factor: o.ruleId, value: o.evidence, points: 1 });

  const points = factors.reduce((s, f) => s + f.points, 0);
  let rating: FauImpactLevel = points >= (th['rating.high'] ?? 5) ? 'high' : points >= (th['rating.medium'] ?? 2) ? 'medium' : 'low';
  if (hits.some((h) => h.strength === 'strong')) rating = 'high';
  const fired = outcomes.filter((o) => o.outcome === 'fail');
  const reasons = fired.filter((o) => o.effect !== 'risk').map((o) => `${o.ruleId}: ${o.evidence}`.slice(0, 200));
  let disposition: FauKycDisposition;
  if (fired.some((o) => o.effect === 'decline')) disposition = 'decline-recommend';
  else if (rating === 'high' || fired.some((o) => o.effect === 'escalate') || hits.length) disposition = 'escalate-EDD';
  else if (missingDocs.length || fired.some((o) => o.effect === 'request_docs')) disposition = 'request-docs';
  else disposition = 'clear';
  return { rating, factors, outcomes, missingDocs, disposition, reasons };
}
