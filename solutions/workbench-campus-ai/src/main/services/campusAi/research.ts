/**
 * 科研：成果统计 + 申报指南解读。
 *
 * 成果统计全部由规则汇总（条数、经费按学院 / 类型 / 年度 / 级别），不经模型。
 * 指南解读：模型从指南原文里抽截止时间、申报条件、材料清单、资助额度、联系方式，
 *   每条必须带一句原文引文；引文在原文里找不到的条目丢掉并计数（宁缺不编）。
 */
import type { CaGuideItem, CaOutput, CaResearchStats } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { SheetTable } from '../serviceSettlement/excel';
import { looseText } from './teaching';

const pick = (headers: string[], res: RegExp[]): string => {
  for (const re of res) { const h = headers.find((x) => re.test(x)); if (h) return h; }
  return '';
};

export function parseOutputs(table: SheetTable): { rows: CaOutput[]; skipped: number; problems: string[] } {
  const h = table.headers;
  const cTitle = pick(h, [/成果名称|项目名称|论文题目|题目|名称|title/i]);
  const cType = pick(h, [/成果类型|类型|类别|type/i]);
  const cCollege = pick(h, [/学院|二级学院|单位|部门|系部|college/i]);
  const cOwner = pick(h, [/负责人|第一作者|作者|主持人|发明人|owner|author/i]);
  const cYear = pick(h, [/年度|年份|立项年|发表年|日期|时间|year|date/i]);
  const cLevel = pick(h, [/级别|等级|层次|level/i]);
  const cFund = pick(h, [/经费|金额|资助|到账|funding|amount/i]);
  if (!cTitle) return { rows: [], skipped: 0, problems: [i18nT('成果表要有「成果名称」（或项目名称、论文题目）列')] };
  const problems: string[] = [];
  if (!cType) problems.push(i18nT('没有「类型」列：全部按「未分类」统计'));
  if (!cCollege) problems.push(i18nT('没有「学院」列：全部按「未填学院」统计'));
  if (!cYear) problems.push(i18nT('没有年份 / 日期列：全部按「未填年份」统计'));
  const rows: CaOutput[] = [];
  let skipped = 0;
  for (const r of table.rows) {
    const title = String(r[cTitle] || '').trim();
    if (!title) { skipped++; continue; }
    const yearRaw = cYear ? String(r[cYear] || '') : '';
    const ym = /(19|20)\d{2}/.exec(yearRaw);
    const fund = cFund ? Number(String(r[cFund] ?? '').replace(/[,，\s万元¥￥]/g, '')) : 0;
    rows.push({
      title,
      type: (cType && String(r[cType] || '').trim()) || i18nT('未分类'),
      college: (cCollege && String(r[cCollege] || '').trim()) || i18nT('未填学院'),
      owner: cOwner ? String(r[cOwner] || '').trim() : '',
      year: ym ? ym[0] : i18nT('未填年份'),
      level: (cLevel && String(r[cLevel] || '').trim()) || i18nT('未填级别'),
      funding: Number.isFinite(fund) && fund > 0 ? Math.round(fund * 100) / 100 : 0,
    });
  }
  if (cFund) problems.push(i18nT('经费按表里的数原样相加，单位以原表为准'));
  return { rows, skipped, problems };
}

function group(rows: CaOutput[], key: (r: CaOutput) => string): Array<{ key: string; count: number; funding: number }> {
  const m = new Map<string, { key: string; count: number; funding: number }>();
  for (const r of rows) {
    const k = key(r);
    const g = m.get(k) || { key: k, count: 0, funding: 0 };
    g.count++; g.funding = Math.round((g.funding + r.funding) * 100) / 100;
    m.set(k, g);
  }
  return [...m.values()];
}

export function researchStats(rows: CaOutput[]): CaResearchStats {
  const byYear = group(rows, (r) => r.year).sort((a, b) => a.key.localeCompare(b.key));
  const byType = group(rows, (r) => r.type).sort((a, b) => b.count - a.count);
  const byCollege = group(rows, (r) => r.college).sort((a, b) => b.count - a.count);
  const byLevel = group(rows, (r) => r.level).sort((a, b) => b.count - a.count);
  const colleges = byCollege.map((x) => x.key);
  const types = byType.map((x) => x.key);
  const cells = colleges.map((c) => types.map((t) => rows.filter((r) => r.college === c && r.type === t).length));
  return {
    total: rows.length,
    funding: Math.round(rows.reduce((s, r) => s + r.funding, 0) * 100) / 100,
    byYear, byType, byCollege, byLevel,
    matrix: { rows: colleges, cols: types, cells },
  };
}

// ── 申报指南 ──────────────────────────────────────────────────────────────────

export const GUIDE_PART = 9000;

export function buildGuidePrompt(part: string, index: number, total: number): string {
  return [
    i18nT('下面是一份科研项目申报指南的原文（第 {a}/{b} 部分）。请帮科研处老师把要点抽出来。', { a: index + 1, b: total }),
    i18nT('用 JSON 返回：{p0}', { p0: '{"title":"...","deadlines":[{"text":"...","date":"YYYY-MM-DD","quote":"..."}],"eligibility":[{"text":"...","quote":"..."}],"materials":[{"text":"...","quote":"..."}],"funding":[{"text":"...","quote":"..."}],"contacts":[{"text":"...","quote":"..."}]}' }),
    i18nT('deadlines：各类截止时间与时间节点；eligibility：申报条件与限制；materials：要提交的材料；funding：资助额度与经费要求；contacts：联系人与联系方式。'),
    i18nT('每条都必须带 quote：从原文逐字摘录的一句（不改字）；原文没写的不要写。text 用一句话概括，不要加原文没有的数字。'),
    '',
    i18nT('=== 指南原文 ==='),
    part,
  ].join('\n');
}

export function splitGuide(text: string): string[] {
  const t = String(text || '');
  if (t.length <= GUIDE_PART) return [t];
  const parts: string[] = [];
  for (let i = 0; i < t.length && parts.length < 4; i += GUIDE_PART) parts.push(t.slice(i, i + GUIDE_PART));
  return parts;
}

type Section = 'deadlines' | 'eligibility' | 'materials' | 'funding' | 'contacts';
export const GUIDE_SECTIONS: Section[] = ['deadlines', 'eligibility', 'materials', 'funding', 'contacts'];

/** 引文逐条回原文核对；同一引文只留一条 */
export function verifyGuide(parts: any[], fullText: string): { title: string; sections: Record<Section, CaGuideItem[]>; dropped: number } {
  const hay = looseText(fullText);
  const sections = Object.fromEntries(GUIDE_SECTIONS.map((k) => [k, [] as CaGuideItem[]])) as Record<Section, CaGuideItem[]>;
  let dropped = 0;
  let title = '';
  const seen = new Set<string>();
  for (const p of parts) {
    if (!title && p?.title) title = String(p.title).trim().slice(0, 120);
    for (const k of GUIDE_SECTIONS) {
      for (const it of Array.isArray(p?.[k]) ? p[k] : []) {
        const quote = String(it?.quote || '').trim();
        const text = String(it?.text || '').trim();
        const q = looseText(quote);
        if (!text || q.length < 4 || !hay.includes(q)) { dropped++; continue; }
        if (seen.has(`${k}:${q}`)) continue;
        seen.add(`${k}:${q}`);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(it?.date || '')) ? String(it.date) : undefined;
        sections[k].push({ text: text.slice(0, 300), quote: quote.slice(0, 300), date, verified: true });
      }
    }
  }
  sections.deadlines.sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  return { title, sections, dropped };
}
