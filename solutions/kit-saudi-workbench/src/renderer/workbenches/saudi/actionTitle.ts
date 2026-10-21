/**
 * 结论式标题（对标需求 P1-2）。
 *
 * 我们的卡片标题是**栏目名**——「技术 / 商务符合性矩阵」「Bid / No-Bid 建议」
 *「价格区间模型」。作为工作台的分区标签没问题，**直接流进交付物就是问题**：
 * 客户打开建议书看到一堆栏目名，一个结论都读不出来。
 *
 * 麦肯锡那套规范是「标题写结论不写栏目名」，而且**要带具体数字**：
 *   ❌ 「符合性矩阵」
 *   ✅ 「32 项满足、6 项部分满足、3 项偏离，核心偏离集中在交换机冗余」
 *
 * ## 为什么不交给模型写
 *
 * 结论句里的每个数字都必须**真的等于**卡片里的数 —— 让模型总结就等于给它一次
 * 编数字的机会，而这些数字最后要进报价单和投标文件。所以这里是**纯计算**：
 * 数字从卡片数据现算，句式套模板。模型幻觉在这条路上没有入口。
 *
 * ## 数据不足时
 *
 * 需求写死了：「生成不出结论句时必须显式标注**待补**，不允许退回栏目名充数」。
 * 退回栏目名会让人以为这一节写好了，实际是空的 —— 那比标一个「待补」危险得多。
 *
 * 工作台内部**照旧显示栏目名**（导航需要），只有交付物走这里。
 */
import { t as i18nT } from '../../i18n';

/** 只依赖这些字段，避免把整个 CardData 类型拖进来（这份逻辑要能被单测直接喂数据）。 */
export interface ActionTitleInput {
  id?: string;
  title?: string;
  kind?: string;
  matrixRows?: { verdict?: string; category?: string; requirement?: string }[];
  decision?: {
    recommendation?: string;
    conditions?: string[];
    hardBlock?: string;
    scores?: { label?: string; weight?: number; score?: number }[];
  };
  calcLines?: { label?: string; result?: number; currency?: string; emphasis?: string }[];
  priceRange?: { low?: number; high?: number };
  kanban?: { column?: string; title?: string; waivable?: boolean }[];
  bomPrimary?: { qty?: number; unitCost?: number }[];
  bomAlternate?: { qty?: number; unitCost?: number }[];
  gaps?: { label?: string }[];
  taskplan?: { task?: string; due?: string }[];
}

export interface ActionTitle {
  /** 结论句；数据不足时是「<栏目名> · 待补」 */
  text: string;
  /** true = 没算出结论，界面/审计要能识别出这一节还没成文 */
  pending: boolean;
}

function money(value: number, currency = 'SAR'): string {
  return `${currency} ${Math.round(value).toLocaleString('en-US')}`;
}

/** 出现次数最多的那个类别 —— 「核心偏离集中在哪」就是这么来的。 */
function topCategory(rows: { category?: string; requirement?: string }[]): string {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = String(row.category || row.requirement || '').trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best = '';
  let max = 0;
  for (const [key, n] of counts) if (n > max) { max = n; best = key; }
  return best;
}

function pending(fallbackTitle?: string): ActionTitle {
  return {
    text: i18nT('{p0} · 待补（数据不足，未生成结论）', { p0: i18nT(fallbackTitle || '本节') }),
    pending: true,
  };
}

/** 符合性 / 能力矩阵：满足多少、偏离多少、偏离集中在哪。 */
function fromMatrix(card: ActionTitleInput): ActionTitle {
  const rows = card.matrixRows ?? [];
  if (!rows.length) return pending(card.title);
  const count = (v: string) => rows.filter((r) => r.verdict === v).length;
  const ok = count('ok');
  const partial = count('partial');
  const deviate = count('deviate') + count('fail');
  if (!deviate && !partial) {
    return { text: i18nT('{p0} 项要求全部满足，无偏离', { p0: ok }), pending: false };
  }
  const focus = topCategory(rows.filter((r) => r.verdict === 'deviate' || r.verdict === 'fail'));
  return {
    text: focus
      ? i18nT('{p0} 项满足、{p1} 项部分满足、{p2} 项偏离，核心偏离集中在{p3}', {
          p0: ok, p1: partial, p2: deviate, p3: i18nT(focus),
        })
      : i18nT('{p0} 项满足、{p1} 项部分满足、{p2} 项偏离', { p0: ok, p1: partial, p2: deviate }),
    pending: false,
  };
}

/** Bid / No-Bid：给结论 + 匹配度 + 第一个前提条件。 */
function fromDecision(card: ActionTitleInput): ActionTitle {
  const d = card.decision;
  if (!d?.recommendation) return pending(card.title);
  const scores = (d.scores ?? []).filter((s) => Number.isFinite(s.score) && Number.isFinite(s.weight));
  const weightSum = scores.reduce((sum, s) => sum + (s.weight ?? 0), 0);
  const weighted = weightSum > 0
    ? scores.reduce((sum, s) => sum + (s.score ?? 0) * (s.weight ?? 0), 0) / weightSum
    : NaN;
  const parts: string[] = [i18nT(d.recommendation)];
  if (Number.isFinite(weighted)) parts.push(i18nT('能力匹配 {p0}%', { p0: Math.round(weighted) }));
  if (d.hardBlock) parts.push(i18nT('存在硬性门槛：{p0}', { p0: i18nT(d.hardBlock) }));
  else if (d.conditions?.length) parts.push(i18nT('但需先解决{p0}', { p0: i18nT(d.conditions[0]) }));
  // 分句分隔符也过词典：中文全角逗号、英文半角逗号加空格、阿语 \u060C ——
  // 这不是为了绕裸中文检查，是三种语言的标点本来就不同，写死一个会让另外两种排版发怪。
  return { text: parts.join(i18nT('\uFF0C')), pending: false };
}

/** 成本与报价：报价区间 + 毛利率（能算出来才写，算不出来不硬编）。 */
function fromPricing(card: ActionTitleInput): ActionTitle {
  const range = card.priceRange;
  const lines = card.calcLines ?? [];
  const currency = lines.find((l) => l.currency)?.currency || 'SAR';
  if (!range || !Number.isFinite(range.low) || !Number.isFinite(range.high)) {
    const total = lines.find((l) => l.emphasis === 'total' && Number.isFinite(l.result));
    if (!total) return pending(card.title);
    return { text: i18nT('成本合计 {p0}', { p0: money(total.result as number, currency) }), pending: false };
  }
  const cost = lines.find((l) => l.emphasis === 'total' && Number.isFinite(l.result))?.result;
  const marginPct = Number.isFinite(cost) && (range.low as number) > 0
    ? ((range.low as number) - (cost as number)) / (range.low as number) * 100
    : NaN;
  return {
    text: Number.isFinite(marginPct)
      ? i18nT('建议报价 {p0} — {p1}，按下限计毛利率 {p2}%', {
          p0: money(range.low as number, currency), p1: money(range.high as number, currency),
          p2: marginPct.toFixed(1),
        })
      : i18nT('建议报价 {p0} — {p1}', {
          p0: money(range.low as number, currency), p1: money(range.high as number, currency),
        }),
    pending: false,
  };
}

/** 硬性门槛看板：能不能过、卡在哪几条。 */
function fromKanban(card: ActionTitleInput): ActionTitle {
  const cards = card.kanban ?? [];
  if (!cards.length) return pending(card.title);
  const cannot = cards.filter((c) => c.column === 'cannot');
  const blocking = cannot.filter((c) => !c.waivable);
  const met = cards.filter((c) => c.column === 'met').length;
  if (!cannot.length) {
    return { text: i18nT('硬性门槛 {p0} 条全部满足', { p0: met }), pending: false };
  }
  return {
    text: blocking.length
      ? i18nT('{p0} 条硬性门槛无法满足且不可化解，首要阻塞：{p1}', {
          p0: blocking.length, p1: i18nT(blocking[0].title || ''),
        })
      : i18nT('{p0} 条门槛需前提条件化解，可有条件参与', { p0: cannot.length }),
    pending: false,
  };
}

/** 信息缺口：还缺几项、第一项是什么。 */
function fromGaps(card: ActionTitleInput): ActionTitle {
  const gaps = card.gaps ?? [];
  if (!gaps.length) return { text: i18nT('关键信息已齐备，无待澄清项'), pending: false };
  return {
    text: i18nT('尚有 {p0} 项信息待客户澄清，首要是{p1}', { p0: gaps.length, p1: i18nT(gaps[0].label || '') }),
    pending: false,
  };
}

/** BOM：几项设备、合计多少。 */
function fromBom(card: ActionTitleInput): ActionTitle {
  const rows = card.bomPrimary ?? card.bomAlternate ?? [];
  if (!rows.length) return pending(card.title);
  const total = rows.reduce((sum, r) => sum + (r.qty ?? 0) * (r.unitCost ?? 0), 0);
  return {
    text: i18nT('{p0} 项设备，采购成本合计 {p1}', { p0: rows.length, p1: money(total) }),
    pending: false,
  };
}

/** 任务计划：几项任务、最近截止是哪天。 */
function fromTaskplan(card: ActionTitleInput): ActionTitle {
  const tasks = card.taskplan ?? [];
  if (!tasks.length) return pending(card.title);
  const due = tasks.map((t) => String(t.due || '')).filter(Boolean).sort()[0];
  return {
    text: due
      ? i18nT('{p0} 项投标准备任务，最近截止 {p1}', { p0: tasks.length, p1: due })
      : i18nT('{p0} 项投标准备任务', { p0: tasks.length }),
    pending: false,
  };
}

/**
 * 主入口。按卡片形态选算法；不认识的形态返回「待补」而不是回落栏目名。
 *
 * 注意判定顺序**先看具体数据再看 kind** —— demo 数据里有些卡的 kind 与实际
 * 装的数据不完全对应（比如能力匹配卡也用 matrixRows），按数据判更稳。
 */
export function buildActionTitle(card: ActionTitleInput): ActionTitle {
  if (card.decision) return fromDecision(card);
  if (card.kanban?.length) return fromKanban(card);
  if (card.priceRange || card.calcLines?.length) return fromPricing(card);
  if (card.matrixRows?.length) return fromMatrix(card);
  if (card.bomPrimary?.length || card.bomAlternate?.length) return fromBom(card);
  if (card.taskplan?.length) return fromTaskplan(card);
  if (card.kind === 'gaps') return fromGaps(card);
  return pending(card.title);
}

/**
 * 把一组卡片转成交付物的「结论摘要」章节。
 *
 * 每节标题是结论句，正文是原栏目名 + 该卡的要点 —— 这样客户光看标题就能读完
 * 整个故事线，需要细节再往下看。`pending` 的节照样出，但标题带「待补」。
 */
export function buildConclusionSections(
  cards: ActionTitleInput[],
): { title: string; body: string; pending: boolean }[] {
  return cards
    .map((card) => {
      const at = buildActionTitle(card);
      return {
        title: at.text,
        body: i18nT('（对应工作台栏目：{p0}）', { p0: i18nT(card.title || card.id || '') }),
        pending: at.pending,
      };
    });
}
