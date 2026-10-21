/**
 * 投标前自检：**代码判定，不问模型**。
 *
 * 废标是标书场景里唯一不可挽回的事故，判定依据必须是确定的：
 * 章节缺了、占位符没填、资格项不满足、截止时间过了 —— 这些都能用数据直接判，
 * 交给模型只会得到一句「整体较为完善，建议进一步完善」。
 *
 * blocker 未清只允许导出草稿件（带 DRAFT 水印），与项目工作台的 exportBlockers 同一条规矩。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  BidWriterComplianceItem, BidWriterProject, BidWriterRequirement, BidWriterSection,
} from '@totalclaw/ipc-contracts';
import { ANY_BRACKET_TOKEN_RE, BRACE_TOKEN_RE, DATE_RE, PLACEHOLDER_RE as GAP_RE, TIME_RE } from './matchPatterns';

/** 正文里的待补充占位：生成时模型没有依据就写这个，绝不编数字（模式定义在 matchPatterns） */
export { PLACEHOLDER_RE } from './matchPatterns';

/**
 * 正文里所有「没填上的空」：我们约定的【待补充：…】，加上模型自创的任何 【…】/{{…}} 标记。
 * 后者是实测踩到的 —— 事实已经给了模型，它仍写成「统一社会信用代码：【USCC_1】」。
 */
export function collectPlaceholders(content: string): string[] {
  const text = String(content || '');
  const out: string[] = [];
  const known = new Set<string>();
  for (const m of text.matchAll(GAP_RE)) { out.push(m[1].trim()); known.add(m[0]); }
  // 模型有时写成裸「【投标总报价】」而不是「【待补充：投标总报价】」：同一件事，
  // 加前缀会让它在缺料表里分成两行、用户填两遍（2026-09-20 实测）。直接取里面的字。
  for (const m of text.matchAll(ANY_BRACKET_TOKEN_RE)) {
    if (known.has(m[0])) continue;
    const label = m[1].trim();
    if (label && label.length <= 30) out.push(label);
  }
  for (const m of text.matchAll(BRACE_TOKEN_RE)) {
    const label = m[1].trim();
    if (label) out.push(label);
  }
  return [...new Set(out)];
}

/** 中英混排的"字数"：中文按字，西文按词 */
export function countWords(content: string): number {
  const s = String(content || '').trim();
  if (!s) return 0;
  const han = (s.match(/[一-龥]/g) || []).length;
  const words = (s.replace(/[一-龥]/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
  return han + words;
}

/**
 * 覆盖判定用的特征片段：中文切二字片段 + 西文整词。
 *
 * 不能按「词」切中文 —— 没有分词器时 `[一-龥]{2,10}` 会把
 * 「提供营业执照副本复印件加盖公章」切成两个 10 字长串，而正文里写的是
 * 「附营业执照副本复印件，已加盖公章」，一个都对不上，于是「明明写了」还被判成缺。
 * 二字片段对标点和语序都不敏感，是这里唯一稳的办法。
 */
function coverageTokens(text: string): string[] {
  const tokens = new Set<string>();
  const han = String(text || '').replace(/[^一-龥]/g, ' ');
  for (const run of han.split(/\s+/)) {
    for (let i = 0; i + 2 <= run.length; i += 1) tokens.add(run.slice(i, i + 2));
  }
  for (const word of String(text || '').toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []) tokens.add(word);
  // 数字串也是特征：「账号：12590209571000100000156」中文只切得出「账号」一个片段，
  // 少于 3 个特征就被判未覆盖 —— 正文里明明写着这个账号（用户 2026-09-20 实测）
  for (const num of String(text || '').match(/\d{4,}/g) || []) tokens.add(num);
  return [...tokens];
}

/** 必交材料是否被某一章覆盖：显式绑定优先，否则看特征片段重合度（过半即认） */
function coveredBy(sections: BidWriterSection[], requirement: BidWriterRequirement): boolean {
  const tokens = coverageTokens(requirement.text);
  const strip = (t: string) => t.replace(/[\s\u3000，,。；;：:、（）()【】\[\]"'"']/g, '').toLowerCase();
  const needle = strip(requirement.text);
  return sections.some((s) => {
    if (s.requirementIds?.includes(requirement.id)) return true;
    const hay = `${s.title}\n${s.content || ''}`;
    // 特征太少（「账号：1259…」这类）时退回整串包含判断，别一刀切成「没覆盖」
    if (tokens.length < 3) return needle.length >= 6 && strip(hay).includes(needle);
    const lower = hay.toLowerCase();
    const hits = tokens.filter((t) => lower.includes(t)).length;
    return hits / tokens.length >= 0.5;
  });
}

function item(
  id: string, level: BidWriterComplianceItem['level'], title: string, detail: string, stepKey?: string,
): BidWriterComplianceItem {
  return { id, level, title, detail, stepKey };
}

/** 截止时间是否已过（解析不出来就不判，宁可不说也不误报） */
export function deadlinePassed(raw: string | undefined, now = Date.now()): boolean | null {
  const s = String(raw || '').trim();
  if (!s) return null;
  const m = DATE_RE.exec(s);
  if (!m) return null;
  const hm = TIME_RE.exec(s.slice(m.index + m[0].length));
  const d = new Date(
    Number(m[1]), Number(m[2]) - 1, Number(m[3]),
    hm ? Number(hm[1]) : 23, hm?.[2] ? Number(hm[2]) : 59,
  );
  if (!Number.isFinite(d.getTime())) return null;
  return d.getTime() < now;
}

export function runComplianceCheck(project: BidWriterProject, now = Date.now()): BidWriterComplianceItem[] {
  const items: BidWriterComplianceItem[] = [];
  const sections = project.sections || [];
  const requirements = project.notice?.requirements || [];

  // ① 章节完成度
  const unfinished = sections.filter((s) => !String(s.content || '').trim());
  const failed = sections.filter((s) => s.state === 'failed');
  if (!sections.length) {
    items.push(item('sections_empty', 'blocker', i18nT('还没有章节'), i18nT('先在「标书模板」这一步确定章节骨架。'), 'template'));
  } else if (unfinished.length) {
    items.push(item('sections_unfinished', 'blocker', i18nT('有 {n} 章还没有正文', { n: String(unfinished.length) }),
      unfinished.slice(0, 8).map((s) => s.title).join(i18nT('、')), 'compose'));
  } else {
    items.push(item('sections_done', 'ok', i18nT('章节正文齐了'), i18nT('共 {n} 章。', { n: String(sections.length) }), 'compose'));
  }
  if (failed.length) {
    items.push(item('sections_failed', 'blocker', i18nT('有 {n} 章生成失败', { n: String(failed.length) }),
      failed.slice(0, 8).map((s) => `${s.title}：${s.error || i18nT('未知错误')}`).join(i18nT('；')), 'compose'));
  }

  // ② 待补充占位（缺料清单）
  const gaps = sections.flatMap((s) => (s.placeholders || []).map((p) => `${s.title} → ${p}`));
  if (gaps.length) {
    items.push(item('placeholders', 'blocker', i18nT('有 {n} 处待补充内容', { n: String(gaps.length) }),
      gaps.slice(0, 12).join(i18nT('；')), 'compose'));
  } else if (sections.length) {
    items.push(item('placeholders_none', 'ok', i18nT('没有待补充占位'), i18nT('正文里的数字与资质都有出处。'), 'compose'));
  }

  // ③ 资格门槛
  const unmet = (project.qualifications || []).filter((q) => q.verdict === 'unmet');
  const unknown = (project.qualifications || []).filter((q) => q.verdict === 'unknown');
  if (unmet.length) {
    items.push(item('qualification_unmet', 'blocker', i18nT('有 {n} 条资格要求不满足', { n: String(unmet.length) }),
      unmet.slice(0, 6).map((q) => q.text.slice(0, 60)).join(i18nT('；')), 'company'));
  }
  if (unknown.length) {
    items.push(item('qualification_unknown', 'warning', i18nT('有 {n} 条资格要求还没确认', { n: String(unknown.length) }),
      unknown.slice(0, 6).map((q) => q.text.slice(0, 60)).join(i18nT('；')), 'company'));
  }

  // ④ 必交材料覆盖
  const deliverables = requirements.filter((r) => r.kind === 'deliverable');
  const missing = deliverables.filter((r) => !coveredBy(sections, r));
  if (deliverables.length && missing.length) {
    items.push(item('deliverable_missing', 'warning', i18nT('有 {n} 项必交材料没找到对应章节', { n: String(missing.length) }),
      missing.slice(0, 8).map((r) => r.text.slice(0, 50)).join(i18nT('；')), 'template'));
  } else if (deliverables.length) {
    items.push(item('deliverable_ok', 'ok', i18nT('必交材料都有对应章节'), i18nT('共 {n} 项。', { n: String(deliverables.length) }), 'template'));
  }

  // ⑤ 公司资料缺口
  const missingFields = (project.company || []).filter((f) => f.from === 'missing' || !String(f.value).trim());
  if (missingFields.length) {
    items.push(item('company_missing', 'warning', i18nT('公司资料缺 {n} 项', { n: String(missingFields.length) }),
      missingFields.slice(0, 8).map((f) => f.label).join(i18nT('、')), 'company'));
  }

  // ⑥ 截止时间
  const passed = deadlinePassed(project.notice?.bidDeadline, now);
  if (passed === true) {
    items.push(item('deadline_passed', 'blocker', i18nT('投标截止时间已过'),
      i18nT('公告写的截止时间是 {t}。', { t: String(project.notice?.bidDeadline || '') }), 'notice'));
  } else if (passed === false) {
    items.push(item('deadline_ok', 'ok', i18nT('还在投标有效期内'),
      i18nT('截止时间：{t}', { t: String(project.notice?.bidDeadline || '') }), 'notice'));
  } else if (!project.notice?.bidDeadline) {
    items.push(item('deadline_unknown', 'warning', i18nT('没有投标截止时间'), i18nT('公告里没抓到，请手工补上再自检。'), 'notice'));
  }

  // ⑦ 格式要求只提示、不判定（份数 / 密封 / 签章这些要人去做）
  const formats = requirements.filter((r) => r.kind === 'format');
  if (formats.length) {
    items.push(item('format_manual', 'warning', i18nT('有 {n} 条格式要求需人工落实', { n: String(formats.length) }),
      formats.slice(0, 6).map((r) => r.text.slice(0, 60)).join(i18nT('；')), 'review'));
  }

  /*
   * 人工确认过的阻断项降级为提醒（用户实测：演示用的公告截止时间早就过了，
   * 但他要的是把文件导出来 —— 人看过并确认，就该放行，而不是卡死在那）。
   * 只降级不删除：自检表里仍然列着，注明是人工放行的。
   */
  const acked = new Set(project.complianceAcks || []);
  const finalized = items.map((item) => (
    item.level !== 'ok' && acked.has(item.id)
      // 人看过并确认了就是「通过」，显示成「提醒」等于还在提示他有事没办（用户实测反馈）。
      // 仍然留在清单里并注明是人工放行 —— 自检表 xlsx 里也看得到，这是留痕不是抹掉。
      ? { ...item, level: 'ok' as const, detail: `${item.detail}${item.detail ? ' ' : ''}${i18nT('（已人工确认，不再阻断）')}` }
      : item
  ));

  const rank = { blocker: 0, warning: 1, ok: 2 };
  return finalized.sort((a, b) => rank[a.level] - rank[b.level]);
}

export function hasBlocker(items: BidWriterComplianceItem[]): boolean {
  return items.some((i) => i.level === 'blocker');
}
