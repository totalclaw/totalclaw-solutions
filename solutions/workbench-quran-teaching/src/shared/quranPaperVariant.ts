/**
 * 学生个人卷版本的摊平逻辑（主进程与渲染层共用）。
 *
 * 说明书 11.2 要求「5 名学生的试卷不得全部完全相同」。实现上不复制 5 份题面
 * （经文是锁定源数据，复制多份既占地方又多了走样的机会），只记每人的「题序 + 选项顺序」，
 * 用到的时候现算。主进程判分、渲染层出题都必须走这里，两边算出来的必须是同一份。
 */
import type { QuranPaper, QuranPaperVariant, QuranQuestion } from '@totalclaw/ipc-contracts';

/**
 * 把「原卷 + 某生的变体」摊成这名学生真正看到的题目：
 * 题序按 variant.order，选项按 variant.optionOrder 重排，**正确答案下标同步换算**。
 *
 * 换算是这里唯一容易错的地方：optionOrder[新下标] = 原下标，所以「原下标 → 新下标」要取逆映射。
 * 判分一律用本函数产出的题目对象，别拿原卷的 answer 去比变体里的作答下标。
 */
export function variantQuestions(paper: QuranPaper, variant: QuranPaperVariant): QuranQuestion[] {
  const byId = new Map(paper.questions.map((q) => [q.id, q]));
  const out: QuranQuestion[] = [];
  for (const id of variant.order) {
    const q = byId.get(id);
    if (!q) continue;
    const perm = variant.optionOrder[id];
    if (!perm || perm.length !== q.options.length) { out.push(q); continue; }
    const inverse = new Array<number>(perm.length);
    perm.forEach((origIdx, newIdx) => { inverse[origIdx] = newIdx; });
    const options = perm.map((origIdx) => q.options[origIdx]);
    const answer = typeof q.answer === 'number' ? inverse[q.answer] : q.answer.map((v) => inverse[v] ?? v);
    out.push({ ...q, options, answer });
  }
  // 变体里漏掉的题（理论上不会有）补在末尾，保证题量与原卷一致，分析口径不变
  for (const q of paper.questions) if (!variant.order.includes(q.id)) out.push(q);
  return out;
}

/** 某生的题目视图；没有变体（旧存档 / 尚未分发）就退回原卷，口径不变 */
export function questionsForStudent(paper: QuranPaper, studentId: string): QuranQuestion[] {
  const v = paper.variants?.find((x) => x.studentId === studentId);
  return v ? variantQuestions(paper, v) : paper.questions;
}
