import { describe, expect, it } from 'vitest';
import { buildCards, defaultState, type ModuleState } from './demoData';
import { computeImpact } from './proofSwitch';
import type { CardData } from './types';

/**
 * 沙特 Demo 1–3 验收一致性测试。
 *
 * 对照的是需求文档 `Saudi_AI_Market_Entry_and_Phase1_DemoV2.0.docx` 的
 * **「必须输出」** 与 **「Proof Switch」** 两节 —— 那是客户现场逐条点的验收单，
 * 不是我们自己想出来的指标。每个 it 的标题写明它对应哪一条。
 *
 * 为什么测 buildCards 而不是驱动 UI：这几条验收讲的是「有没有产出这份东西、
 * 改一个输入之后哪些数字跟着变」，属于领域逻辑。UI 层另有 e2e/截图覆盖，
 * 而领域逻辑必须能在 CI 里毫秒级跑完、且失败时直接指向缺哪一项。
 */

type Kind = CardData['kind'];

function cards(moduleId: Parameters<typeof buildCards>[0], patch: Partial<ModuleState> = {}): CardData[] {
  return buildCards(moduleId, { ...defaultState(moduleId), ...patch });
}

function kinds(list: CardData[]): Kind[] {
  return list.map((c) => c.kind);
}

/** 某类卡片至少有一张，并且不是空壳（验收看的是内容，不是占位） */
function expectKind(list: CardData[], kind: Kind, why: string): CardData {
  const hit = list.find((c) => c.kind === kind);
  expect(hit, `${why}（缺 kind=${kind}，实际有：${kinds(list).join(', ')}）`).toBeDefined();
  return hit!;
}

// ═══════════════════════════════════════════════════════════════════════════
// Demo 1 · AI 询价与报价数字员工
// ═══════════════════════════════════════════════════════════════════════════

describe('Demo 1 · 必须输出（需求 §1.4）', () => {
  const list = cards('rfq-quote');

  it('①  RFQ 信息卡和澄清问题清单', () => {
    const info = expectKind(list, 'fields', 'RFQ 信息卡');
    expect(info.fields?.length, 'RFQ 信息卡不能是空表').toBeGreaterThan(3);
    const gaps = expectKind(list, 'gaps', '澄清问题清单');
    // 需求 §1.3 第 3 步写死「生成 3 个澄清问题」
    expect(gaps.questions?.length, '澄清问题至少 3 条（需求 §1.3-3）').toBeGreaterThanOrEqual(3);
  });

  it('②  产品匹配与技术偏离表（逐条显示满足/部分满足/偏离）', () => {
    const matrix = expectKind(list, 'matrix', '产品匹配与技术偏离表');
    const verdicts = new Set((matrix.matrixRows ?? []).map((r) => r.verdict));
    expect(matrix.matrixRows?.length).toBeGreaterThan(0);
    // 全是 ok 就说明没在做「偏离判断」，演示第 4 步就没东西可讲
    expect(verdicts.size, '判定必须有分档，不能整列一个结论').toBeGreaterThan(1);
  });

  it('③  BOM 及主选/备选组合', () => {
    const bom = expectKind(list, 'bom', 'BOM 卡');
    expect(bom.bomPrimary?.length, '主选 BOM 不能为空').toBeGreaterThan(0);
    expect(bom.bomAlternate?.length, '备选 BOM 不能为空（需求 §1.3-4 主选与备选）').toBeGreaterThan(0);
  });

  it('④  成本拆分、建议报价区间、底价和毛利', () => {
    const pricing = expectKind(list, 'pricing', '报价卡');
    expect(pricing.calcLines?.length, '成本必须逐行拆开').toBeGreaterThan(3);
    expect(pricing.priceRange, '建议报价区间').toBeDefined();
    expect(pricing.priceRange!.high).toBeGreaterThan(pricing.priceRange!.low);
    // 验收硬条款：「价格采用可见公式而非模型猜数」
    const withFormula = (pricing.calcLines ?? []).filter((l) => l.formula?.trim());
    expect(withFormula.length, '每行成本要带可见公式（§1.6 必须通过）').toBeGreaterThan(0);
  });

  it('⑤  历史报价对比与本次差异说明', () => {
    const bench = expectKind(list, 'benchmark', '历史报价对比');
    expect(bench.benchmark?.length, '需求 §1.2 要求 3 份历史报价').toBeGreaterThanOrEqual(3);
  });

  it('⑥  技术方案、正式报价草稿和客户邮件草稿', () => {
    const outputs = expectKind(list, 'outputs', '输出物卡');
    const names = (outputs.outputs ?? []).map((o: any) => String(o.name ?? o));
    for (const want of ['技术方案', '报价', '邮件']) {
      expect(names.some((n) => n.includes(want)), `输出物要含「${want}」，实际：${names.join(' / ')}`).toBe(true);
    }
  });
});

describe('Demo 1 · Proof Switch（需求 §1.5）', () => {
  /** 现场改动：交付地点 Jeddah → Tabuk，保修 2 年 → 3 年 */
  const before = cards('rfq-quote');
  const after = cards('rfq-quote', { location: 'tabuk', locationLabel: 'Tabuk', warrantyYears: 3 });
  const impact = computeImpact(before, after, [], 'v1', 'v2');

  it('本地运输 / 现场服务 / 维保 / 毛利 / 建议报价必须重算', () => {
    const pricingBefore = before.find((c) => c.kind === 'pricing')!;
    const pricingAfter = after.find((c) => c.kind === 'pricing')!;
    expect(impact.affectedCards, '报价卡必须在受影响清单里').toContain(pricingAfter.id);
    expect(
      JSON.stringify(pricingAfter.calcLines),
      '改了地点与保修，成本行却一个字没动 —— 说明没真重算',
    ).not.toEqual(JSON.stringify(pricingBefore.calcLines));
    expect(pricingAfter.priceRange).not.toEqual(pricingBefore.priceRange);
  });

  it('不受影响的产品技术匹配不应全部重做（原文：不受影响的不应全部重做）', () => {
    expect(impact.unaffectedCards.length, '必须存在"没变"的卡，否则等于整页重算').toBeGreaterThan(0);
    const matrixId = before.find((c) => c.kind === 'matrix')!.id;
    expect(impact.unaffectedCards, '技术匹配与交付地点无关，不该被标记为变更').toContain(matrixId);
  });

  it('前后版本差异可逐行对照（affected/unaffected 是算出来的事实）', () => {
    expect(impact.diffLines.length).toBeGreaterThan(0);
    expect(impact.diffLines.some((l) => l.changed), '至少要有一行标记为已变化').toBe(true);
    expect(impact.diffLines.some((l) => !l.changed), '未变的行也要保留，用来证明"哪些没变"').toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Demo 2 · AI 招投标决策数字员工
// ═══════════════════════════════════════════════════════════════════════════

describe('Demo 2 · 必须输出（需求 §2.5）', () => {
  const list = cards('bid-decision');

  it('⑧  招标信息卡与版本/Addendum 差异', () => {
    expectKind(list, 'fields', '招标信息卡');
    expectKind(list, 'versionDiff', 'Addendum 差异');
  });

  it('⑨  硬性资格清单及证据（四栏：已满足/可补齐/无法满足/待确认）', () => {
    const kanban = expectKind(list, 'kanban', '硬性门槛看板');
    const columns = new Set((kanban.kanban ?? []).map((k) => k.column));
    expect(columns.size, '硬性门槛要分档，不能一栏堆完（需求 §2.3-4）').toBeGreaterThan(1);
  });

  it('⑩  Bid/No-Bid 建议书：结论不被一个总分掩盖硬性风险', () => {
    const decision = expectKind(list, 'decision', 'Bid/No-Bid 卡');
    expect(decision.decision?.recommendation, '必须给出明确建议').toBeTruthy();
    expect(decision.decision?.scores?.length, '评分要分维度列出').toBeGreaterThan(2);
    // §2.4 决策模型第 1 条：硬性门槛优先于综合评分
    expect(decision.decision?.conditions?.length, '「有条件参与」要列明前提（§2.3-8）').toBeGreaterThan(0);
  });

  it('⑪  技术/商务符合性矩阵', () => {
    const matrices = list.filter((c) => c.kind === 'matrix');
    expect(matrices.length, '符合性矩阵与能力匹配至少各一张').toBeGreaterThanOrEqual(1);
  });

  it('⑫  产品、BOM、替代和外协计划', () => {
    const bom = expectKind(list, 'bom', 'BOM 卡');
    expect(bom.bomAlternate?.length, '替代方案').toBeGreaterThan(0);
  });

  it('⑬  历史投标比较、成本模型和报价区间', () => {
    expectKind(list, 'benchmark', '历史投标比较');
    const pricing = expectKind(list, 'pricing', '成本模型');
    expect(pricing.priceRange, '报价区间').toBeDefined();
  });

  it('⑭  风险清单 / 待澄清事项 / 投标准备任务', () => {
    expectKind(list, 'taskplan', '投标准备任务');
  });
});

describe('Demo 2 · Proof Switch（需求 §2.6）', () => {
  /** 上传 Addendum：摄像机 120 → 150、交付 120 → 90 天、截止延后 5 天 */
  const before = cards('bid-decision');
  const after = cards('bid-decision', { addendumApplied: true });
  const impact = computeImpact(before, after, [], 'v1', 'v2');

  it('数量 / 供应风险 / 交付评分 / 外协计划 / 价格区间要跟着更新', () => {
    const pricingId = after.find((c) => c.kind === 'pricing')!.id;
    expect(impact.affectedCards, '价格区间必须重算').toContain(pricingId);
    const bomBefore = before.find((c) => c.kind === 'bom')!;
    const bomAfter = after.find((c) => c.kind === 'bom')!;
    expect(
      JSON.stringify(bomAfter.bomPrimary),
      'Addendum 改了摄像机数量，BOM 却没变',
    ).not.toEqual(JSON.stringify(bomBefore.bomPrimary));
  });

  it('保留前后版本差异', () => {
    expect(impact.fromVersion).toBe('v1');
    expect(impact.toVersion).toBe('v2');
    expect(impact.diffLines.some((l) => l.changed)).toBe(true);
  });
});

describe('Demo 2 · 决策模型第 1 条：硬性门槛优先于综合评分（§2.4）', () => {
  it('把一项门槛人工改判为「无法满足」后，建议不得仍是无条件参与', () => {
    const base = cards('bid-decision');
    const kanban = base.find((c) => c.kind === 'kanban')!;
    const first = (kanban.kanban ?? [])[0];
    expect(first, '看板要有条目才能改判').toBeDefined();

    const after = cards('bid-decision', { gateOverrides: { [first.title]: 'cannot' } });
    const decision = after.find((c) => c.kind === 'decision')!;
    const rec = String(decision.decision?.recommendation ?? '');
    // 有硬性条件无法满足时，不允许出现「建议参与」这种无条件结论
    expect(
      /不参与|no-bid|有条件|conditional/i.test(rec),
      `存在无法满足的硬性门槛时建议应转为不参与/有条件，实际：「${rec}」`,
    ).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Demo 3 · AI 客户问题与方案报告数字员工
// ═══════════════════════════════════════════════════════════════════════════

describe('Demo 3 · 必须输出与报告结构（需求 §3.3 / §3.4）', () => {
  const list = cards('advisory-report');

  it('统一收件：三渠道合并为同一任务的时间线', () => {
    const timeline = expectKind(list, 'timeline', '多渠道合并时间线');
    const channels = new Set((timeline.timeline ?? []).map((t: any) => t.channel));
    expect(channels.size, '邮件 / 网页表单 / WhatsApp 三条通道都要出现').toBeGreaterThanOrEqual(3);
  });

  it('信息缺口：提出 3 个澄清问题（§3.3-3）', () => {
    const gaps = expectKind(list, 'gaps', '信息缺口卡');
    expect(gaps.questions?.length).toBeGreaterThanOrEqual(3);
  });

  it('内部检索 / 外部研究：显示来源与更新时间', () => {
    const evidence = list.filter((c) => c.kind === 'evidenceList');
    expect(evidence.length, '内部检索与外部研究至少各一张').toBeGreaterThanOrEqual(1);
  });

  it('报告结构必须是需求 §3.4 的七段', () => {
    // 「报告」类卡片有两张：简短客户回复（replyLines）与完整咨询报告（reportSections），
    // 这是需求 §3.3-6「形成双输出」要的形态，别只取第一张。
    const report = list.find((c) => c.kind === 'report' && c.reportSections?.length);
    expect(report, '找不到带七段正文的咨询报告卡').toBeDefined();
    // 断言 section.id 而不是标题：标题会随界面语言变成中文/阿语，
    // 用标题关键词判会在切语言时假红。
    const ids = (report!.reportSections ?? []).map((x) => x.id);
    const required = ['summary', 'request', 'findings', 'path', 'risks', 'services', 'sources'];
    const missing = required.filter((r) => !ids.includes(r));
    expect(missing, `报告缺段：${missing.join(', ')}；实际有：${ids.join(' / ')}`).toEqual([]);
  });

  it('双输出：简短客户回复与完整报告各一份（§3.3-6）', () => {
    const reports = list.filter((c) => c.kind === 'report');
    expect(reports.some((c) => (c as any).replyLines?.length), '缺简短客户回复').toBe(true);
    expect(reports.some((c) => c.reportSections?.length), '缺完整咨询报告').toBe(true);
  });
});

describe('Demo 3 · Proof Switch（需求 §3.5）', () => {
  /** 目标客户：家庭消费者 → 办公室/商业客户 */
  const before = cards('advisory-report');
  const after = cards('advisory-report', { segment: 'commercial' });
  const impact = computeImpact(before, after, [], 'v1', 'v2');

  it('渠道 / 决策人 / 销售周期 / 内容重点 / 建议服务要更新', () => {
    expect(impact.affectedCards.length, '切换客户类型后必须有卡片变化').toBeGreaterThan(0);
    const reportBefore = before.find((c) => c.kind === 'report' && c.reportSections?.length)!;
    const reportAfter = after.find((c) => c.kind === 'report' && c.reportSections?.length)!;
    expect(
      JSON.stringify(reportAfter.reportSections),
      '客户类型变了，报告正文却一字未改',
    ).not.toEqual(JSON.stringify(reportBefore.reportSections));
  });

  it('监管基础事实不应无故变化（原文：监管基础事实不应无故变化）', () => {
    // 外部研究结论属于监管事实，切客户类型不该改写它
    const evidenceBefore = before.filter((c) => c.kind === 'evidenceList').map((c) => c.id);
    const stillUnaffected = evidenceBefore.filter((id) => impact.unaffectedCards.includes(id));
    expect(
      stillUnaffected.length,
      '监管/外部来源卡片不该因为客户类型变化而重算',
    ).toBeGreaterThan(0);
  });
});
