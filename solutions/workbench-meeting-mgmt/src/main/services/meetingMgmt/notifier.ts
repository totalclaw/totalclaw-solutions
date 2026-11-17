/**
 * 会议智能管理 · 企微卡片内容。
 *
 * 卡片只放标题 + 摘要 + 按钮，长文在系统内看（需求 2 章「企微卡片显示」）：
 *   正式纪要      = 会议主题 + 3 行摘要
 *   执行方案      = 任务名 + 截止时间（方案待确认 / 新任务待接收 / 调整后方案待确认）
 *   进度汇总报告  = 完成率 + 逾期数
 *   项目总结报告  = 项目已归档
 *   其它事件      = 一句话摘要
 * 按钮按卡片点开后要做的事（需求 5.3「企微卡片直达的页面」）：去确认 / 去终审 / 去接收 / 去更新 /
 * 去复核 / 去裁决 / 去审核；只读的事件一律「查看」。
 *
 * 卡片正文从 MmNotice.summary 取（A 生成通知时写好）。为了让各处写法一致，这里也导出拼摘要的小工具
 * cardSummary.*：正式纪要 3 行、方案「任务名（截止 日期）」逐行、报告「完成率 · 逾期数」。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { MmLink, MmNotice, MmNoticeType, MmReportStats } from '../../../shared/meetingMgmt/types';
import { TEXTCARD_LIMITS, clipChars, escapeCardText } from './wecom';

export interface NoticeCard {
  title: string;
  /** 企微 textcard 描述（已转义、已排版：灰色事件名 + 正文行），不超过 512 字 */
  description: string;
  url: string;
  btntxt: string;
}

/** 每行正文的长度上限（手机卡片一行大约 20 字，留两行余量） */
const LINE_MAX = 60;
/** 方案 / 任务类最多列几项，其余写「等 N 项」 */
const PLAN_LINES = 3;

/** 事件名（卡片第一行的灰字；消息中心也可以用） */
export function noticeTypeLabel(type: MmNoticeType): string {
  switch (type) {
    case 'speech_confirm': return i18nT('发言待确认');
    case 'speech_remind': return i18nT('发言确认催办');
    case 'minutes_review': return i18nT('纪要待终审');
    case 'minutes_final': return i18nT('正式纪要已生成');
    case 'plan_confirm': return i18nT('执行方案待确认');
    case 'task_new': return i18nT('新任务待接收');
    case 'task_progress_remind': return i18nT('进度更新提醒');
    case 'task_due_remind': return i18nT('任务到期提醒');
    case 'task_overdue': return i18nT('任务逾期提醒');
    case 'objection_review': return i18nT('异议待复核');
    case 'plan_adjusted': return i18nT('调整后方案待确认');
    case 'arbitration': return i18nT('异议待裁决');
    case 'arbitration_result': return i18nT('裁决结果');
    case 'progress_report': return i18nT('进度汇总报告');
    case 'summary_review': return i18nT('总结报告待审核');
    case 'project_archived': return i18nT('项目已归档');
    case 'task_done': return i18nT('任务已完成');
    case 'task_progress': return i18nT('任务进度更新');
    default: return i18nT('通知');
  }
}

/** 按钮文字（企微限 4 个字） */
export function noticeButtonText(type: MmNoticeType): string {
  switch (type) {
    case 'speech_confirm':
    case 'speech_remind':
    case 'plan_confirm': return i18nT('去确认');
    case 'minutes_review': return i18nT('去终审');
    case 'task_new':
    case 'plan_adjusted': return i18nT('去接收');
    case 'task_progress_remind':
    case 'task_due_remind': return i18nT('去更新');
    case 'objection_review': return i18nT('去复核');
    case 'arbitration': return i18nT('去裁决');
    case 'summary_review': return i18nT('去审核');
    // 逾期提醒同时发给部门负责人和任务负责人，后者只能看，统一「查看」
    case 'task_overdue':
    case 'minutes_final':
    case 'arbitration_result':
    case 'progress_report':
    case 'project_archived':
    case 'task_done':
    case 'task_progress':
    default: return i18nT('查看');
  }
}

/** 按行拆开，去掉行首的列表符号（「- 」「• 」「1. 」「2、」；不动「1.5 亿」这类数字） */
const splitLines = (s: string | undefined): string[] =>
  (s ?? '').split(/\r?\n/).map((l) => l.replace(/^\s*(?:[-*•·]\s+|\d{1,2}[.、)）]\s*(?!\d))/, '').trim()).filter(Boolean);

/** 一段话拆成句子（只有一行长摘要时，正式纪要按句拆成 3 行） */
const splitSentences = (s: string): string[] => s.split(/(?<=[。；;！？!?])/).map((x) => x.trim()).filter(Boolean);

/** 一句话摘要：第一行；第一行太长时取第一句 */
function oneLine(summary: string | undefined): string {
  const first = splitLines(summary)[0] ?? '';
  if (Array.from(first).length <= LINE_MAX) return first;
  const sentence = splitSentences(first)[0] ?? first;
  return clipChars(sentence, LINE_MAX);
}

function bodyLines(n: MmNotice): { lines: string[]; highlight?: number } {
  const lines = splitLines(n.summary);
  switch (n.type) {
    case 'minutes_final': {
      const src = lines.length === 1 ? splitSentences(lines[0]) : lines;
      return { lines: src.slice(0, 3).map((l) => clipChars(l, LINE_MAX)) };
    }
    case 'plan_confirm':
    case 'plan_adjusted':
    case 'task_new': {
      if (lines.length <= PLAN_LINES) return { lines: lines.map((l) => clipChars(l, LINE_MAX)) };
      const head = lines.slice(0, PLAN_LINES - 1).map((l) => clipChars(l, LINE_MAX));
      return { lines: [...head, i18nT('…等共 {p0} 项任务', { p0: lines.length })] };
    }
    case 'progress_report':
      return { lines: lines.slice(0, 2).map((l) => clipChars(l, LINE_MAX)), highlight: 0 };
    case 'project_archived': {
      const extra = oneLine(n.summary);
      const fixed = i18nT('项目已归档，项目内容转为只读，总结报告可在系统内查看');
      return { lines: extra && extra !== fixed ? [fixed, extra] : [fixed] };
    }
    case 'task_overdue':
    case 'task_due_remind': {
      const l = oneLine(n.summary);
      return { lines: l ? [l] : [], highlight: 0 };
    }
    default: {
      const l = oneLine(n.summary);
      return { lines: l ? [l] : [] };
    }
  }
}

/**
 * 通知 → 企微卡片内容。卡片只放摘要；按钮跳 linkFor(接收人, 链接) 给的地址（手机页专属链接）。
 * description 已是 textcard 排版（灰色事件名 + 正文行），WecomClient.sendCard 原样发送。
 */
export function noticeCard(n: MmNotice, ctx: { linkFor: (personId: string, link: MmLink) => string; footnote?: string }): NoticeCard {
  const label = noticeTypeLabel(n.type);
  const { lines, highlight } = bodyLines(n);
  const blocks = [`<div class="gray">${escapeCardText(label)}</div>`];
  lines.forEach((l, i) => blocks.push(`<div class="${i === highlight ? 'highlight' : 'normal'}">${escapeCardText(l)}</div>`));
  // 卡片末尾的灰字提醒（如「公司内网链接…」）：超长时先删正文行，提醒留着
  const foot = ctx.footnote ? `<div class="gray">${escapeCardText(ctx.footnote)}</div>` : '';
  // 超过 512 字时从末尾整行去掉（事件名那行保留）
  while (blocks.length > 1 && Array.from(blocks.join('') + foot).length > TEXTCARD_LIMITS.description) blocks.pop();
  const body = blocks.join('');
  const title = clipChars((n.title ?? '').trim() || label, TEXTCARD_LIMITS.title);
  return {
    title,
    description: Array.from(body + foot).length <= TEXTCARD_LIMITS.description ? body + foot : body,
    url: ctx.linkFor(n.to, n.link),
    btntxt: clipChars(noticeButtonText(n.type), TEXTCARD_LIMITS.btntxt, ''),
  };
}

// ─── 拼摘要的小工具（A 生成 MmNotice.summary 时用，卡片和消息中心显示一致）────────────

const pct = (v: number): string => `${Math.round(Number.isFinite(v) ? v : 0)}%`;

export const cardSummary = {
  /** 正式纪要：3 行摘要 */
  minutes(summaryLines: string[]): string {
    return summaryLines.map((l) => l.trim()).filter(Boolean).slice(0, 3).join('\n');
  },
  /** 单个任务：任务名（截止 YYYY-MM-DD） */
  task(t: { title: string; due: string }): string {
    return t.due ? i18nT('{p0}（截止 {p1}）', { p0: t.title.trim(), p1: t.due }) : t.title.trim();
  },
  /** 执行方案：每项一行「任务名（截止 日期）」 */
  plan(items: Array<{ title: string; due: string }>): string {
    return items.map((t) => cardSummary.task(t)).join('\n');
  },
  /** 进度汇总报告：完成率 + 逾期数 */
  report(stats: Pick<MmReportStats, 'completionRate' | 'overdue' | 'done' | 'total'>): string {
    return i18nT('完成率 {p0}（{p1}/{p2}） · 逾期 {p3} 项', { p0: pct(stats.completionRate), p1: stats.done, p2: stats.total, p3: stats.overdue });
  },
};
