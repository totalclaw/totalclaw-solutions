/**
 * H 型模块（E2 现金池 / E3 对冲策略 / E4 债务重组 / E7 投资复盘与流动性）的说明段：
 * 引擎结果整理成 facts（主单位金额、百分数）交给模型写，叙述里出现的数字逐条回核到 facts，
 * 找不到的带着问题重写一次，仍不行整段标「未核实」（签核时必须逐条确认已知悉）。
 */
import { tIn } from '@totalclaw/i18n';
import type { FauTreasuryNarrative, FauVerificationItem } from '@totalclaw/ipc-contracts';
import { NARRATIVE_TOPIC_LABEL } from '../../../../../shared/financeAudit/treasuryLabels';
import type { RunCtx } from '../../runner';
import { runSkill } from '../../skillRunner';
import { verifyNumbers } from '../../verify';
import { narrativeSchema, narrativeTask, type NarrativeKind } from '../../prompts/treasury';

/** facts 里出现的全部数字（回核的允许集合） */
export function factNumbers(v: unknown, out: number[] = []): number[] {
  if (typeof v === 'number' && Number.isFinite(v)) out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => factNumbers(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => factNumbers(x, out));
  return out;
}

export async function writeNarrative(ctx: RunCtx, o: {
  kind: NarrativeKind; skill: string; topics: string[]; facts: Record<string, unknown>; userData: string[];
}): Promise<{ narrative: FauTreasuryNarrative[]; verification: FauVerificationItem[]; model?: string }> {
  const nums = factNumbers(o.facts);
  const data = { topics: o.topics.map((id) => ({ id, title: tIn(ctx.locale, NARRATIVE_TOPIC_LABEL[id] || id) })), facts: o.facts };
  const call = (extra = '') => runSkill(ctx.llm, {
    module: ctx.def.id, skills: [{ name: o.skill }], task: narrativeTask(o.kind) + extra, data,
    outputLocale: ctx.locale, schema: narrativeSchema, narratives: (out) => out.paragraphs.map((p) => p.text), userData: o.userData.filter(Boolean),
  });
  const first = await call();
  let model = first.model;
  const pick = (paras: { id: string; text: string }[]) => new Map(paras.filter((p) => o.topics.includes(p.id)).map((p) => [p.id, p.text]));
  const text = pick(first.data.paragraphs);
  const bad = o.topics.filter((id) => text.has(id) && !verifyNumbers(text.get(id)!, nums, nums).ok);
  if (bad.length) {
    const fb = bad.map((id) => `${id}: ${verifyNumbers(text.get(id)!, nums, nums).missing.join(', ')}`).join('; ');
    try {
      const second = await call(`\nThese numbers are NOT in data.facts and must not be used: ${fb}. Rewrite only these topics: ${bad.join(', ')}.`);
      model = second.model || model;
      for (const [id, t] of pick(second.data.paragraphs)) if (bad.includes(id) && verifyNumbers(t, nums, nums).ok) text.set(id, t);
    } catch { /* 重写失败：保留第一次的文字，标未核实 */ }
  }
  const narrative: FauTreasuryNarrative[] = o.topics.filter((id) => text.has(id)).map((id) => {
    const chk = verifyNumbers(text.get(id)!, nums, nums);
    return { id, topic: NARRATIVE_TOPIC_LABEL[id] || id, text: text.get(id)!, status: chk.ok ? 'verified' : 'unverified', missing: chk.missing.length ? chk.missing : undefined };
  });
  const verification: FauVerificationItem[] = narrative.map((n) => ({ id: `nar:${n.id}`, ref: `narrative:${n.id}`, text: n.text, status: n.status, missing: n.missing }));
  return { narrative, verification, model };
}
