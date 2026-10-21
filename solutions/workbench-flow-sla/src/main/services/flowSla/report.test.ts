import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FsPeriod } from '@totalclaw/ipc-contracts';
import rulesJson from './defaultRules.json';
import { readAllSheets, writeWorkbook } from '../serviceSettlement/excel';
import { analyzeNodes, compareWithPrevious, computeSla, toSnapshot, yearOverdueRunning, type CalcOptions, type SlaRules } from './calc';
import { effectiveRules, ingestAll, previewTable, thresholdsOf } from './ingest';
import { writeDemo } from './demoData';
import { buildCases, classifyByRule, numbersIn } from './reasons';
import {
  acceptModelSummary, bottomReviewers, buildFacts, detailSheets, fmtDays, fmtRate, monthlyMailText, monthlyReportHtml, overallDelta, reportSubject,
  ruleSuggestions, ruleSummary, svgBars, svgLine, weeklyMail, type ReportContext,
} from './report';

const rules = rulesJson as unknown as SlaRules;
const T = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00` : s).getTime();
const dir = mkdtempSync(join(tmpdir(), 'fs-report-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

// 用示例数据走真实的读入 → 计算，报告里的数字拿去和计算结果逐个对
const now = T('2026-10-13T10:00:00');
const files = writeDemo(dir, rules, now);
const spec = (path: string, slot: 'flow' | 'node' | 'roster') => ({ path, mapping: previewTable(path, slot).mapping });
const data = ingestAll({
  systems: { OA: { flow: spec(files.oaFlow, 'flow'), node: spec(files.oaNode, 'node') }, 费控: { flow: spec(files.fkFlow, 'flow'), node: spec(files.fkNode, 'node') }, CSS: { flow: spec(files.css, 'flow') } },
  roster: spec(files.roster, 'roster'),
});
const eff = effectiveRules(rules, { roster: data.roster });
const base = { now, roster: data.roster.map((r) => r.name), rosterDept: Object.fromEntries(data.roster.map((r) => [r.name, r.dept])) };

function context(kind: 'weekly' | 'monthly'): ReportContext {
  const cur: CalcOptions = kind === 'monthly' ? { ...base, periodStart: T('2026-09-01'), periodEnd: T('2026-10-01') } : { ...base, periodStart: T('2026-10-05'), periodEnd: T('2026-10-12') };
  const prevOpt: CalcOptions = kind === 'monthly' ? { ...base, periodStart: T('2026-08-01'), periodEnd: T('2026-09-01') } : { ...base, periodStart: T('2026-09-28'), periodEnd: T('2026-10-05') };
  const result = computeSla(data.flows, data.nodes, eff, cur);
  const prevRes = computeSla(data.flows, data.nodes, eff, prevOpt);
  const previous = toSnapshot(kind === 'monthly' ? '2026-08' : '2026-09-28 ~ 2026-10-04', prevOpt, prevRes);
  const compare = compareWithPrevious(result, previous, eff);
  const abnormal = compare.filter((t) => t.abnormal).map((t) => ({ ...t, analysis: analyzeNodes(t.flowType, t.system, result, data.nodes, eff, cur) }));
  const period: FsPeriod = { kind, start: cur.periodStart, end: cur.periodEnd, asOf: now, label: kind === 'monthly' ? '2026-09' : '2026-10-05 ~ 2026-10-11' };
  const samples = ['资料不全被退回补充', '审批人出差', '服务商未反馈', '需要财务会签', ''];
  const cases = buildCases(result, data.roster).map((c, i) => {
    const reason = samples[i % samples.length];
    return { ...c, reason, categoryId: reason ? classifyByRule(reason) : '' as const, classifiedBy: reason ? 'rule' as const : '' as const };
  });
  const ctx: ReportContext = {
    period, result, previous, delta: overallDelta(result.overall, previous.overall), compare, abnormal,
    yearOverdue: kind === 'monthly' ? yearOverdueRunning(result, now) : [], cases, rootCauses: {}, summary: '', suggestions: [],
    thresholds: thresholdsOf(eff),
    trend: [{ label: previous.label, complianceRate: previous.overall.complianceRate, avgDays: previous.overall.avgDays }, { label: period.label, complianceRate: result.overall.complianceRate, avgDays: result.overall.avgDays }],
    generatedAt: now,
  };
  ctx.summary = ruleSummary(ctx);
  ctx.suggestions = ruleSuggestions(ctx);
  return ctx;
}
const weekly = context('weekly');
const monthly = context('monthly');
const strip = (html: string): string => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

describe('格式', () => {
  it('比例和天数', () => {
    expect(fmtRate(0.9234)).toBe('92.3%');
    expect(fmtRate(1)).toBe('100.0%');
    expect(fmtRate(null)).toBe('-');
    expect(fmtDays(6.256)).toBe('6.26');
    expect(fmtDays(null)).toBe('-');
  });
  it('环比只做差，缺一边就是空', () => {
    const d = overallDelta({ ...weekly.result.overall, doneCount: 50, avgDays: 6.5, complianceRate: 0.9 }, { ...weekly.result.overall, doneCount: 40, avgDays: 8, complianceRate: 0.95 });
    expect(d).toMatchObject({ doneCount: 10, avgDays: -1.5, complianceRate: -0.05 });
    expect(overallDelta(weekly.result.overall, null).doneCount).toBeNull();
    expect(overallDelta({ ...weekly.result.overall, avgDays: null }, weekly.result.overall).avgDays).toBeNull();
  });
  it('靠后名单不让只审过一两次的人垫底', () => {
    const rank = [{ name: 'a', identity: '', dept: '', count: 1, compliant: 0, rate: 0, avgDays: 9, rank: 3 }, { name: 'b', identity: '', dept: '', count: 10, compliant: 8, rate: 0.8, avgDays: 2, rank: 2 }, { name: 'c', identity: '', dept: '', count: 5, compliant: 5, rate: 1, avgDays: 1, rank: 1 }];
    expect(bottomReviewers(rank, 3).map((p) => p.name)).toEqual(['b']);
  });
});

describe('周报', () => {
  const m = weeklyMail(weekly);
  const o = weekly.result.overall;
  it('主题和正文里的关键数字都来自计算结果', () => {
    expect(m.subject).toBe(reportSubject(weekly));
    expect(m.subject).toContain('2026-10-05 ~ 2026-10-11');
    expect(m.text).toContain(`办结 ${o.doneCount} 单`);
    expect(m.text).toContain(`平均用时 ${fmtDays(o.avgDays)} 天`);
    expect(m.text).toContain(`流程时效合规率 ${fmtRate(o.complianceRate)}`);
    expect(m.text).toContain(`在途 ${o.runningCount} 单，已逾期 ${o.runningOverdue} 单，较大逾期风险 ${o.runningRisk} 单`);
    expect(m.text).toContain(`异常流程类型（${weekly.abnormal.length} 个）`);
    expect(m.text).toContain('2026-09-28 ~ 2026-10-04');
  });
  it('网页版：有七张数字卡、各张表，没有脚本', () => {
    expect(m.html.startsWith('<!doctype html>')).toBe(true);
    expect(m.html).not.toMatch(/<script/i);
    expect((m.html.match(/class="kpi"/g) || []).length).toBe(7);
    const text = strip(m.html);
    expect(text).toContain(fmtRate(o.complianceRate));
    expect(text).toContain(fmtRate(o.reviewRate));
    for (const a of weekly.abnormal.slice(0, 3)) expect(text).toContain(a.flowType.replace(/&/g, '&amp;'));
    const overdue = weekly.result.flows.filter((f) => f.status === 'running' && f.runningLabel === 'overdue').sort((a, b) => b.overdueDays - a.overdueDays)[0];
    expect(text).toContain(overdue.flowNo);
  });
  it('流程名里的尖括号不会变成标签', () => {
    const ctx: ReportContext = { ...weekly, abnormal: [{ ...weekly.abnormal[0], flowType: '<b>x</b>' }] };
    expect(weeklyMail(ctx).html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });
});

describe('月报', () => {
  const html = monthlyReportHtml(monthly);
  const o = monthly.result.overall;
  it('十个章节齐全，图是内联 SVG，没有脚本和外链', () => {
    expect((html.match(/<h2>/g) || []).length).toBe(10);
    expect((html.match(/<svg /g) || []).length).toBeGreaterThanOrEqual(4);
    expect(html).not.toMatch(/<script|<img|<link|https?:\/\/(?!www\.w3\.org)/i);
    expect(html).toContain('@page');
  });
  it('数字与计算结果一致', () => {
    const text = strip(html);
    expect(text).toContain(String(o.doneCount));
    expect(text).toContain(fmtRate(o.complianceRate));
    expect(text).toContain(fmtDays(o.avgDays));
    for (const p of monthly.result.reviewerRank.slice(0, 5)) expect(text).toContain(p.name);
    for (const f of monthly.yearOverdue.slice(0, 3)) { expect(text).toContain(f.flowNo); expect(text).toContain(fmtDays(f.overdueDays)); }
    for (const a of monthly.abnormal.slice(0, 3)) if (a.analysis.longestNode) expect(text).toContain(a.analysis.longestNode);
    for (const s of monthly.suggestions) expect(text).toContain(s.deadline);
  });
  it('本年度在途超时清单：都是今年发起、在途、已逾期', () => {
    expect(monthly.yearOverdue.length).toBeGreaterThan(0);
    expect(monthly.yearOverdue.every((f) => f.status === 'running' && f.runningLabel === 'overdue' && f.startAt >= T('2026-01-01'))).toBe(true);
  });
  it('邮件正文', () => {
    const t = monthlyMailText(monthly);
    expect(t).toContain(`本月办结 ${o.doneCount} 单`);
    expect(t).toContain(`改善建议 ${monthly.suggestions.length} 条`);
  });
});

describe('规则写的总结与建议', () => {
  it('总结四段，里面的每个数字都能在事实清单里找到', () => {
    const s = ruleSummary(monthly);
    expect(s.split('\n\n')).toHaveLength(4);
    for (const tag of ['【整体表现】', '【异常趋势】', '【重点问题】', '【责任维度】']) expect(s).toContain(tag);
    const allowed = new Set(numbersIn(buildFacts(monthly).join('\n')));
    for (const n of numbersIn(s)) expect(allowed.has(n), `总结里的 ${n} 不在事实清单里`).toBe(true);
  });
  it('建议带责任部门 / 责任人 / 期限 / 验收要求', () => {
    const list = ruleSuggestions(monthly);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(6);
    for (const s of list) {
      expect(s.item && s.requirement && s.acceptance).toBeTruthy();
      expect(s.deadline).toBe('2026-10-31');
    }
    expect(list.some((s) => s.owner)).toBe(true);
  });
  it('没有上一周期时不写环比数字', () => {
    const ctx: ReportContext = { ...weekly, previous: null, delta: overallDelta(weekly.result.overall, null), compare: compareWithPrevious(weekly.result, null, eff) };
    expect(ruleSummary(ctx)).toContain('没有上一周期的数据');
    expect(weeklyMail(ctx).text).toContain('没有上一周期的数据');
  });
});

describe('收模型写的总结', () => {
  const facts = buildFacts(monthly).join('\n');
  const o = monthly.result.overall;
  it('数字都在事实里的保留', () => {
    const good = `【整体表现】本月办结 ${o.doneCount} 单，流程时效合规率 ${fmtRate(o.complianceRate)}，整体平稳，需要继续关注在途流程的处理进度。`;
    const out = acceptModelSummary({ summary: good, suggestions: [{ item: '压缩审批停留时间', dept: '甲部', owner: '某人', requirement: '审批人出差前设置代理人', deadline: '2026-11-15', acceptance: '下月超时数量下降' }] }, monthly);
    expect(out.usedModel).toBe(true);
    expect(out.summary).toBe(good);
    expect(out.suggestions).toEqual([{ item: '压缩审批停留时间', dept: '甲部', owner: '某人', requirement: '审批人出差前设置代理人', deadline: '2026-11-15', acceptance: '下月超时数量下降' }]);
    expect(out.dropped).toBe(0);
  });
  it('编出来的数字整句丢掉；丢得只剩一点就退回规则版', () => {
    expect(facts).not.toContain('87.65');
    const out = acceptModelSummary({ summary: '合规率 87.65%，较上月提升 4.32 个百分点。', suggestions: [{ item: '把合规率提升到 99.99%', requirement: '加强管理' }] }, monthly);
    expect(out.usedModel).toBe(false);
    expect(out.summary).toBe(ruleSummary(monthly));
    expect(out.suggestions).toEqual(ruleSuggestions(monthly));
    expect(out.dropped).toBeGreaterThanOrEqual(2);
  });
  it('期限写得不对的换成周期结束后 30 天；不成形的输入退回规则版', () => {
    const out = acceptModelSummary({ summary: '【整体表现】本月流程时效整体平稳，需要继续关注在途流程的处理进度，重点跟进已经逾期的流程。', suggestions: [{ item: '建立催办节奏', requirement: '每周跟进一次', deadline: '下个月底' }] }, monthly);
    expect(out.suggestions[0].deadline).toBe('2026-10-31');
    expect(acceptModelSummary(null, monthly).usedModel).toBe(false);
    expect(acceptModelSummary({ summary: 42, suggestions: 'x' }, monthly).summary).toBe(ruleSummary(monthly));
  });
});

describe('图', () => {
  it('条形图：一行一条，带目标线，超线的标红', () => {
    const svg = svgBars([{ label: '内部驱动型', value: 0.97, text: '97.0%' }, { label: '外部流转型', value: 0.8, text: '80.0%', warn: true }, { label: '没有数据', value: null, text: '-' }], { max: 1, mark: { value: 0.95, label: '95.0%' } });
    expect((svg.match(/<rect /g) || []).length).toBe(6);
    expect(svg).toContain('#e5484d');
    expect(svg).toContain('stroke-dasharray');
    expect(svg).toContain('80.0%');
  });
  it('折线图：空值跳过，全空给一个空图', () => {
    const svg = svgLine([{ label: 'a', value: 0.9, text: '90.0%' }, { label: 'b', value: null, text: '-' }, { label: 'c', value: 0.95, text: '95.0%' }]);
    expect((svg.match(/<circle /g) || []).length).toBe(2);
    expect(svg).toContain('<polyline');
    expect(svgLine([{ label: 'a', value: null, text: '-' }])).not.toContain('<polyline');
  });
});

describe('明细表', () => {
  it('写成真实的 xlsx 再读回来：表齐全，行数与计算结果一致', () => {
    const file = join(dir, '明细.xlsx');
    writeWorkbook(file, detailSheets(monthly));
    const sheets = Object.fromEntries(readAllSheets(file).map((s) => [s.sheetName, s]));
    for (const name of ['汇总', '按大类', '按细类', '环比', '审核人排名', '发起人排名', '在途流程', '超时原因', '本年在途超时', '改善建议', '个人审核明细', '办结明细']) expect(sheets[name], name).toBeTruthy();
    expect(sheets['按大类'].rows).toHaveLength(monthly.result.byCategory.length);
    expect(sheets['按细类'].rows).toHaveLength(monthly.result.byType.length);
    expect(sheets['审核人排名'].rows).toHaveLength(monthly.result.reviewerRank.length);
    expect(sheets['在途流程'].rows).toHaveLength(monthly.result.overall.runningCount);
    expect(sheets['办结明细'].rows).toHaveLength(monthly.result.overall.doneCount);
    expect(sheets['个人审核明细'].rows).toHaveLength(monthly.result.overall.reviewCount);
    expect(sheets['本年在途超时'].rows).toHaveLength(monthly.yearOverdue.length);
    expect(sheets['汇总'].rows.find((r) => r['指标'] === '办结数')?.['本期']).toBe(String(monthly.result.overall.doneCount));
    expect(sheets['汇总'].rows.find((r) => r['指标'] === '流程时效合规率')?.['本期']).toBe(fmtRate(monthly.result.overall.complianceRate));
  });
  it('周报的明细表不带月报专有的两张', () => {
    const names = detailSheets(weekly).map((s) => s.name);
    expect(names).not.toContain('本年在途超时');
    expect(names).not.toContain('改善建议');
  });
});
