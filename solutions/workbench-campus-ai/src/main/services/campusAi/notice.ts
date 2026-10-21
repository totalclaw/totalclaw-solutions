/**
 * 学业预警的谈话提纲与学生通知。
 *
 * 发给模型的只有匿名事实（「该生」、课程、分数、学分、缺勤）——不发姓名、学号、班级。
 * 模型写出的数字必须都在事实里出现过，否则整份不用，换成规则模板。不调模型也能出模板版。
 * 通知里学生称呼用 [STUDENT] 占位，导出时才替换成真名。
 */
import type { CaLevel, CaNotice, CaStudentResult } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { pctText } from './warning';

/** ASCII 占位：词典翻译不会动它（中文占位在英文 / 阿语词典里可能被译掉） */
export const NAME_SLOT = '[STUDENT]';

export function levelLabel(l: CaLevel): string {
  return { red: i18nT('红色预警'), orange: i18nT('橙色预警'), yellow: i18nT('黄色预警') }[l];
}

/** 匿名事实：模型只看得到这些 */
export function anonymousFacts(s: CaStudentResult, level: CaLevel): string[] {
  const facts = [i18nT('预警级别：{p0}', { p0: levelLabel(level) })];
  if (s.failed.length) {
    facts.push(i18nT('不及格课程 {n} 门，共 {c} 学分：', { n: s.failed.length, c: s.failCredits }));
    for (const f of s.failed) facts.push(`- ${f.course}：${f.score}${f.credit ? i18nT('（{p0} 学分）', { p0: f.credit }) : ''}`);
  }
  if (s.totalSessions > 0) facts.push(i18nT('缺勤 {a} 次 / 应到 {b} 次，缺勤率 {c}', { a: s.absent, b: s.totalSessions, c: pctText(s.absenceRate || 0) }));
  else if (s.absent > 0) facts.push(i18nT('缺勤 {a} 次', { a: s.absent }));
  return facts;
}

export function buildNoticePrompt(facts: string[], schoolName: string): string {
  return [
    i18nT('你是{p0}的辅导员助手。下面是一名学生的学业预警事实（已匿名）。', { p0: schoolName }),
    i18nT('请写两段内容，用 JSON 返回：{p0}', { p0: '{"outline":"...","notice":"..."}' }),
    i18nT('outline：给辅导员用的谈话提纲，4～6 条，用「1. 2. 3.」分点，包括了解原因、学习计划、补考 / 重修安排、需要的帮扶。'),
    i18nT('notice：给学生本人的通知，语气关心、具体、不训斥，150～250 字，称呼一律写 {p0}，落款写「辅导员」。', { p0: NAME_SLOT }),
    i18nT('只能使用事实里给出的课程名和数字，不要写任何事实里没有的数字、日期、分数或比例。'),
    '',
    i18nT('=== 事实 ==='),
    ...facts,
  ].join('\n');
}

const UNIT_RE = /(\d+(?:\.\d+)?)\s*(门|次|学分|%)/g;
const stripListMarks = (s: string): string => String(s || '').replace(/^\s*\d+\s*[.、)）]\s*/gm, '');

/**
 * 文字里出现、事实里没有的数字。
 * 带「门 / 次 / 学分 / %」的按「数 + 单位」整体比（「3 门」不能因为事实里有「3 学分」就放过）；
 * 其余数字按数值比；行首的分点序号不算。
 */
export function numbersOutsideFacts(text: string, facts: string[]): string[] {
  const factText = facts.join('\n');
  const withUnit = new Set([...factText.matchAll(UNIT_RE)].map((m) => `${m[1]}${m[2]}`));
  const plain = new Set(factText.match(/\d+(?:\.\d+)?/g) || []);
  const body = stripListMarks(text);
  const bad = new Set<string>();
  for (const m of body.matchAll(UNIT_RE)) if (!withUnit.has(`${m[1]}${m[2]}`)) bad.add(`${m[1]}${m[2]}`);
  for (const n of body.replace(UNIT_RE, ' ').match(/\d+(?:\.\d+)?/g) || []) if (!plain.has(n)) bad.add(n);
  return [...bad];
}

export function templateNotice(s: CaStudentResult, level: CaLevel, schoolName: string): { outline: string; notice: string } {
  const items: string[] = [];
  if (s.failed.length) items.push(i18nT('{n} 门课程不及格（{p0}）', { n: s.failed.length, p0: s.failed.map((f) => `${f.course} ${f.score}`).join('、') }));
  if (s.totalSessions > 0 && s.absent > 0) items.push(i18nT('缺勤 {a} 次，缺勤率 {b}', { a: s.absent, b: pctText(s.absenceRate || 0) }));
  else if (s.absent > 0) items.push(i18nT('缺勤 {a} 次', { a: s.absent }));
  const situation = items.join(i18nT('；'));
  const outline = [
    `1. ${i18nT('说明预警情况：{p0}，{p1}', { p0: levelLabel(level), p1: situation })}`,
    `2. ${i18nT('了解原因：学习方法、课程难度、作息、家庭或身体情况')}`,
    s.failed.length ? `3. ${i18nT('确认补考 / 重修安排：{p0}', { p0: s.failed.map((f) => f.course).join('、') })}` : `3. ${i18nT('确认按时到课的具体办法')}`,
    `4. ${i18nT('一起制定学习计划，明确下次跟进时间')}`,
    `5. ${i18nT('需要时联系任课教师、学业帮扶或心理咨询')}`,
  ].join('\n');
  const notice = [
    i18nT('{p0}同学：', { p0: NAME_SLOT }),
    i18nT('你本学期的学业情况已达到{p0}：{p1}。', { p0: levelLabel(level), p1: situation }),
    i18nT('这不是处分，是提醒我们一起尽早想办法。请在收到通知后主动联系辅导员，约一个时间聊聊遇到的困难，我们会帮你安排补考复习、学业帮扶，把后面的课程跟上。'),
    i18nT('{p0} 辅导员', { p0: schoolName }),
  ].join('\n');
  return { outline, notice };
}

export interface NoticeLlm { (prompt: string): Promise<{ json: any; model: string }> }

/** 写一份：模型写的数字核对通过就用模型版，否则用模板版 */
export async function draftNotice(s: CaStudentResult, level: CaLevel, schoolName: string, llm: NoticeLlm | null): Promise<CaNotice> {
  const at = new Date().toISOString();
  const fallback = (): CaNotice => ({ studentId: s.studentId, ...templateNotice(s, level, schoolName), by: 'template', at });
  if (!llm) return fallback();
  const facts = anonymousFacts(s, level);
  try {
    const { json, model } = await llm(buildNoticePrompt(facts, schoolName));
    const outline = String(json?.outline || '').trim();
    const notice = String(json?.notice || '').trim();
    if (!outline || !notice) return fallback();
    if (numbersOutsideFacts(`${outline}\n${notice}`, facts).length) return { ...fallback(), model };
    // 模型偶尔会把占位写成别的称呼：没有占位就补在开头
    const withSlot = notice.includes(NAME_SLOT) ? notice : `${NAME_SLOT}${i18nT('同学：')}\n${notice}`;
    return { studentId: s.studentId, outline, notice: withSlot, by: 'model', model, at };
  } catch {
    return fallback();
  }
}

export function fillName(text: string, name: string): string {
  return String(text || '').split(NAME_SLOT).join(name || i18nT('同学'));
}
