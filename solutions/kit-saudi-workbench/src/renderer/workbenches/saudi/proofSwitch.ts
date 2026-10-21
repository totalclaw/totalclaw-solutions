/**
 * 增量重算（Proof Switch）—— 演示成败点。
 *
 * 需求 P0-15 的原话：变更输入 → 影响面分析 → **只重算受影响模块** → 生成前后版本差异。
 * 客户看的就是「哪些变了、哪些没变」，所以这里的 affected / unaffected 必须是
 * **按新旧两份卡片逐字比对算出来的事实**，不是预先写死的名单。
 *
 * 视觉侧的约束（SaudiWorkbench.vue 执行）：
 *   - 只有 affectedCards 里的卡进骨架态；
 *   - unaffected 的卡片 key 不变 → Vue 不重挂载 → 肉眼可见地不闪；
 *   - 执行后自动切右栏 Diff Tab，未变项显示「未变化」且无底色。
 */
import type { CardData, ChangeImpact } from './types';
import { t as i18nT } from '../../i18n';

/** 卡片内容指纹：用于判断这张卡在新状态下是否真的变了。 */
function fingerprint(card: CardData): string {
  return JSON.stringify(card);
}

/** 从两份卡片里抽出可对照的数字/文本行，喂给右栏 Diff。 */
function extractLines(card: CardData): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  if (card.fields) {
    for (const f of card.fields) out.push({ label: `${card.title} · ${f.label}`, value: String(f.value) });
  }
  if (card.calcLines) {
    for (const l of card.calcLines) {
      out.push({ label: `${card.title} · ${l.label}`, value: `${l.currency ?? ''} ${Math.round(l.result).toLocaleString('en-US')}`.trim() });
    }
  }
  if (card.priceRange) {
    out.push({
      label: i18nT('{p0} · 建议报价区间', { p0: card.title }),
      value: `${card.priceRange.low.toLocaleString('en-US')} — ${card.priceRange.high.toLocaleString('en-US')}`,
    });
  }
  if (card.bomPrimary) {
    for (const r of card.bomPrimary) out.push({ label: `${card.title} · ${r.sku}`, value: `${r.qty} ${r.unit}` });
  }
  if (card.decision) {
    out.push({ label: i18nT('{p0} · 建议', { p0: card.title }), value: card.decision.recommendation });
    for (const s of card.decision.scores) out.push({ label: `${card.title} · ${s.label}`, value: `${s.score}/${s.weight}` });
  }
  if (card.reportSections) {
    for (const s of card.reportSections) {
      out.push({ label: `${card.title} · ${s.title}${s.regulatory ? i18nT('（监管基础事实）') : ''}`, value: s.body });
    }
  }
  if (card.replyLines?.length) out.push({ label: i18nT('{p0} · 正文', { p0: card.title }), value: card.replyLines.join('\n') });
  if (card.matrixRows) {
    for (const r of card.matrixRows) out.push({ label: `${card.title} · ${r.requirement}`, value: `${r.specValue} / ${r.verdict}` });
  }
  return out;
}

function shorten(value: string, max = 90): string {
  const flat = value.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

export function computeImpact(
  before: CardData[],
  after: CardData[],
  changedFields: { label: string; before: string; after: string }[],
  fromVersion: string,
  toVersion: string,
): ChangeImpact {
  const beforeById = new Map(before.map((c) => [c.id, c]));
  const affected: string[] = [];
  const unaffected: string[] = [];

  for (const card of after) {
    const prev = beforeById.get(card.id);
    if (!prev) { affected.push(card.id); continue; }
    if (fingerprint(prev) === fingerprint(card)) unaffected.push(card.id);
    else affected.push(card.id);
  }

  // 差异行：按 label 对齐，未变的也保留（右栏要显示「未变化」且无底色）
  const beforeLines = new Map(before.flatMap(extractLines).map((l) => [l.label, l.value]));
  const afterLines = after.flatMap(extractLines);
  const diffLines = afterLines.map((line) => {
    const prevValue = beforeLines.get(line.label);
    return {
      label: line.label,
      before: shorten(prevValue ?? '—'),
      after: shorten(line.value),
      changed: prevValue !== undefined && prevValue !== line.value,
    };
  });

  return {
    changeId: `chg-${toVersion}`,
    changedFields,
    affectedCards: affected,
    unaffectedCards: unaffected,
    fromVersion,
    toVersion,
    computedAt: new Date().toISOString(),
    diffLines,
  };
}
