/**
 * 校务治理：公文起草 + 诉求热点分析。
 *
 * 公文：模型只按填写的要点起草正文，不得补充要点里没有的事实；正文里出现、要点和标题里都没有的数字
 *   列为「待核对」（公文最后都要人审，不自动删，但必须提醒）。
 * 诉求热点：全部由问答记录与转办记录按规则统计（领域分布、环比、部门响应、知识缺口、高频词），
 *   模型只在已算好的事实上写一段小结，小结里出现事实以外的数字就改用规则写的版本。
 */
import type { CaDocKind, CaHotspotReport, CaTicket } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { extractKeywords } from '../knowledgeBase/textAnalysis';
import { questionSimilarity } from './kb';
import { classifyDomain, domainOf, listDomains } from './domains';
import type { StoredQa } from './store';

export function docKindLabel(k: CaDocKind): string {
  return { notice: i18nT('通知'), request: i18nT('请示'), report: i18nT('报告'), letter: i18nT('函'), minutes: i18nT('会议纪要') }[k];
}

/**
 * 模型常把标题、主送机关重复写进正文开头、把署名日期写进结尾（实测提示词说了也会写），
 * 这些在版式里已有固定位置，正文里再出现就是重复：开头三行、结尾三行里命中的去掉。
 */
export function cleanDocBody(body: string, title: string, recipients: string, issuer: string): string {
  const norm = (x: string) => String(x || '').replace(/[\s：:，,。]/g, '');
  const lines = String(body || '').replace(/\r/g, '').split('\n');
  const isHead = (l: string) => { const n = norm(l); return !!n && (n === norm(title) || (recipients && n === norm(recipients))); };
  const isTail = (l: string) => { const n = norm(l); return !!n && (n === norm(issuer) || /^\d{4}年\d{1,2}月\d{1,2}日$/.test(n)); };
  let start = 0;
  while (start < Math.min(lines.length, 4) && (!lines[start].trim() || isHead(lines[start]))) start++;
  let end = lines.length;
  while (end > start && lines.length - end < 4 && (!lines[end - 1].trim() || isTail(lines[end - 1]))) end--;
  return lines.slice(start, end).join('\n').trim();
}

/** 正文里出现、要点和标题里没有的数字（「一、」这类层次序号不算） */
export function docUnverifiedNumbers(body: string, points: string, title: string): string[] {
  // 先逐行去掉行首分点序号再取数（先去空白会把「1. 11月」并成 1.11）
  const half = (s: string) => String(s || '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  const nums = (s: string) => half(s).split('\n').map((l) => l.replace(/^\s*\d+\s*[.、．)）]\s*/, '')).join('\n').match(/\d+(?:\.\d+)?/g) || [];
  const hay = new Set(nums(`${points}\n${title}`));
  return [...new Set(nums(body).filter((n) => !hay.has(n)))];
}

// ── 诉求热点 ──────────────────────────────────────────────────────────────────

const AUTO = new Set(['faq', 'answer', 'quote']);
const NEGATIVE = /投诉|不满|太差|没人管|没人回|多次反映|一直没|拖了|乱收费|欺负|不公平|很差|差评/;

export function hotspotReport(qa: readonly StoredQa[], tickets: readonly CaTicket[], from: Date, to: Date, now = new Date()): CaHotspotReport {
  const span = to.getTime() - from.getTime();
  const inRange = (iso: string, a: number, b: number) => { const t = Date.parse(iso); return t >= a && t < b; };
  const cur = qa.filter((r) => !r.courseId && inRange(r.at, from.getTime(), to.getTime()));
  const prev = qa.filter((r) => !r.courseId && inRange(r.at, from.getTime() - span, from.getTime()));
  const auto = cur.filter((r) => AUTO.has(r.kind)).length;

  const byDomain = listDomains().map((d) => ({
    id: d.id, name: d.name,
    count: cur.filter((r) => (r.domain || classifyDomain(r.question)) === d.id).length,
    noEvidence: cur.filter((r) => (r.domain || classifyDomain(r.question)) === d.id && r.kind === 'no_evidence').length,
    prev: prev.filter((r) => (r.domain || classifyDomain(r.question)) === d.id).length,
  })).filter((d) => d.count || d.prev).sort((a, b) => b.count - a.count);

  const tks = tickets.filter((t) => inRange(t.at, from.getTime(), to.getTime()));
  const depts = [...new Set(tks.map((t) => t.dept))];
  const byDept = depts.map((dept) => {
    const list = tks.filter((t) => t.dept === dept);
    const answered = list.filter((t) => t.answeredAt);
    const hours = answered.map((t) => (Date.parse(t.answeredAt!) - Date.parse(t.at)) / 3_600_000).filter((h) => h >= 0);
    return {
      dept,
      open: list.filter((t) => t.status === 'open').length,
      answered: answered.length,
      avgHours: hours.length ? Math.round((hours.reduce((s, h) => s + h, 0) / hours.length) * 10) / 10 : null,
      overdue: list.filter((t) => t.status === 'open' && now.getTime() - Date.parse(t.at) > 48 * 3_600_000).length,
    };
  }).sort((a, b) => b.open - a.open || b.overdue - a.overdue);

  // 高频词：按问题计（同一个问题里出现多次只算一次）
  const df = new Map<string, number>();
  for (const r of cur) {
    if (r.kind === 'sensitive') continue;
    for (const { term } of extractKeywords(r.question, 6)) df.set(term, (df.get(term) || 0) + 1);
  }
  const keywords = [...df.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([term, count]) => ({ term, count }));

  // 知识缺口：没有依据的问题按问法相近聚在一起
  const clusters: Array<{ question: string; count: number; domain: string }> = [];
  for (const r of cur.filter((x) => x.kind === 'no_evidence')) {
    const hit = clusters.find((c) => questionSimilarity(c.question, r.question) >= 0.5);
    if (hit) hit.count++; else clusters.push({ question: r.question, count: 1, domain: domainOf(r.domain || classifyDomain(r.question)).name });
  }
  const gaps = clusters.sort((a, b) => b.count - a.count).slice(0, 15);

  return {
    from: from.toISOString(), to: to.toISOString(),
    total: cur.length, prevTotal: prev.length,
    autoRate: cur.length ? Math.round((auto / cur.length) * 1000) / 1000 : null,
    byDomain, byDept, keywords, gaps,
    sensitive: cur.filter((r) => r.kind === 'sensitive').length,
    negative: cur.filter((r) => NEGATIVE.test(r.question)).length,
  };
}

const pct = (r: number | null) => (r === null ? '—' : `${Math.round(r * 1000) / 10}%`);

/** 交给模型的事实（全部是已算好的数） */
export function hotspotFacts(r: CaHotspotReport): string[] {
  const f = [
    i18nT('本期问答 {a} 次，上期 {b} 次；自动答复率 {c}', { a: r.total, b: r.prevTotal, c: pct(r.autoRate) }),
    ...r.byDomain.slice(0, 6).map((d) => i18nT('{p0}：{a} 次（上期 {b}），其中无依据 {c} 次', { p0: d.name, a: d.count, b: d.prev, c: d.noEvidence })),
    ...r.byDept.slice(0, 6).map((d) => i18nT('{p0}：待答复 {a}，已答复 {b}，超过 48 小时未答复 {c}', { p0: d.dept, a: d.open, b: d.answered, c: d.overdue })),
    ...r.gaps.slice(0, 5).map((g) => i18nT('知识缺口：「{p0}」被问 {n} 次', { p0: g.question, n: g.count })),
  ];
  if (r.sensitive) f.push(i18nT('敏感问题 {n} 次', { n: r.sensitive }));
  if (r.negative) f.push(i18nT('带不满情绪的问题 {n} 次', { n: r.negative }));
  return f;
}

export function hotspotTemplate(r: CaHotspotReport): string {
  const top = r.byDomain[0];
  const lines = [i18nT('本期师生共提问 {a} 次（上期 {b} 次），自动答复率 {c}。', { a: r.total, b: r.prevTotal, c: pct(r.autoRate) })];
  if (top) lines.push(i18nT('诉求最集中的是{p0}，共 {n} 次。', { p0: top.name, n: top.count }));
  const lagging = r.byDept.filter((d) => d.overdue > 0);
  if (lagging.length) lines.push(i18nT('有超过 48 小时未答复转办的部门：{p0}，请督促答复。', { p0: lagging.map((d) => `${d.dept} ${d.overdue}`).join('、') }));
  if (r.gaps.length) lines.push(i18nT('知识库缺口 {n} 类，建议相关部门补充资料或 FAQ：{p0}。', { n: r.gaps.length, p0: r.gaps.slice(0, 3).map((g) => `「${g.question}」`).join('、') }));
  if (r.sensitive) lines.push(i18nT('本期有 {n} 次敏感问题，请学工处确认已全部跟进。', { n: r.sensitive }));
  return lines.join('\n');
}

export function buildHotspotPrompt(facts: string[], school: string): string {
  return [
    i18nT('你是{p0}党政办的分析员。根据下面已统计好的师生诉求数据，写一段 150～250 字的周报小结，指出热点、响应慢的部门和需要补充的知识，并给出 2～3 条改进建议。', { p0: school }),
    i18nT('只能使用下面事实里的数字，不要计算新的数字、不要写事实里没有的数字。用纯文本输出。'),
    '',
    i18nT('=== 统计事实 ==='),
    ...facts,
  ].join('\n');
}
