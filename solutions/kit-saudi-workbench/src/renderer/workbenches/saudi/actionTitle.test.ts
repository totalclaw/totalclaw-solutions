/**
 * 结论式标题：客户打开建议书要**光看标题就能读完故事线**。
 *
 * 两条硬要求逐条验：
 *   ① 标题里的数字必须真的等于卡片里的数（这是纯计算不是模型总结，不许有出入）；
 *   ② 数据不足时必须标「待补」，**不许退回栏目名充数**——退回去会让人以为写好了。
 */
import { describe, it, expect } from 'vitest';
import { buildActionTitle, buildConclusionSections } from './actionTitle';

describe('符合性矩阵', () => {
  const rows = [
    ...Array.from({ length: 32 }, () => ({ verdict: 'ok', category: '通用' })),
    ...Array.from({ length: 6 }, () => ({ verdict: 'partial', category: '供电' })),
    ...Array.from({ length: 3 }, () => ({ verdict: 'deviate', category: '交换机冗余' })),
  ];

  it('数出满足 / 部分满足 / 偏离，并点出偏离集中在哪', () => {
    const { text, pending } = buildActionTitle({ title: '符合性矩阵', matrixRows: rows });
    expect(pending).toBe(false);
    expect(text).toContain('32 项满足');
    expect(text).toContain('6 项部分满足');
    expect(text).toContain('3 项偏离');
    expect(text).toContain('交换机冗余');
    expect(text).not.toContain('符合性矩阵');   // 标题写结论，不写栏目名
  });

  it('全部满足时不硬凑偏离描述', () => {
    const { text } = buildActionTitle({ matrixRows: [{ verdict: 'ok' }, { verdict: 'ok' }] });
    expect(text).toContain('2 项要求全部满足');
    expect(text).toContain('无偏离');
  });

  it('fail 也算偏离（不能只数 deviate）', () => {
    const { text } = buildActionTitle({ matrixRows: [{ verdict: 'ok' }, { verdict: 'fail', category: '接地' }] });
    expect(text).toContain('1 项偏离');
    expect(text).toContain('接地');
  });
});

describe('Bid / No-Bid 决策', () => {
  it('给结论 + 加权匹配度 + 首要前提', () => {
    const { text } = buildActionTitle({
      title: 'Bid / No-Bid 建议',
      decision: {
        recommendation: '建议投标',
        conditions: ['光纤外协排期', '本地化率证明'],
        scores: [
          { label: '技术', weight: 5, score: 90 },
          { label: '商务', weight: 5, score: 78 },
        ],
      },
    });
    expect(text).toContain('建议投标');
    expect(text).toContain('能力匹配 84%');     // (90*5 + 78*5) / 10 = 84
    expect(text).toContain('光纤外协排期');
  });

  it('有硬性门槛时优先说门槛，而不是说前提条件', () => {
    const { text } = buildActionTitle({
      decision: { recommendation: '不建议投标', hardBlock: '缺少本地承包商资质', conditions: ['随便什么'] },
    });
    expect(text).toContain('缺少本地承包商资质');
    expect(text).not.toContain('随便什么');
  });

  it('没有评分时不编造匹配度', () => {
    const { text } = buildActionTitle({ decision: { recommendation: '建议投标' } });
    expect(text).toBe('建议投标');
    expect(text).not.toContain('%');
  });
});

describe('成本与报价', () => {
  it('报价区间 + 按下限计的毛利率', () => {
    const { text } = buildActionTitle({
      title: '价格区间模型',
      priceRange: { low: 700000, high: 760000 },
      calcLines: [{ label: '成本合计', result: 490000, currency: 'SAR', emphasis: 'total' }],
    });
    expect(text).toContain('SAR 700,000');
    expect(text).toContain('SAR 760,000');
    expect(text).toContain('30.0%');   // (700000-490000)/700000
  });

  it('没有成本行时只报区间，不硬算毛利率', () => {
    const { text } = buildActionTitle({ priceRange: { low: 100, high: 200 } });
    expect(text).toContain('SAR 100');
    expect(text).not.toContain('%');
  });

  it('只有成本没有区间时报成本合计', () => {
    const { text } = buildActionTitle({
      calcLines: [{ label: '成本合计', result: 12345, currency: 'AED', emphasis: 'total' }],
    });
    expect(text).toContain('AED 12,345');
  });
});

describe('硬性门槛看板', () => {
  it('全过时说全部满足', () => {
    const { text } = buildActionTitle({ kanban: [{ column: 'met' }, { column: 'met' }] });
    expect(text).toContain('2 条');
    expect(text).toContain('全部满足');
  });

  it('有不可化解的门槛时点名首要阻塞', () => {
    const { text } = buildActionTitle({
      kanban: [
        { column: 'met' },
        { column: 'cannot', title: '缺少沙特本地实体', waivable: false },
      ],
    });
    expect(text).toContain('1 条硬性门槛无法满足');
    expect(text).toContain('缺少沙特本地实体');
  });

  it('门槛都可化解时说「有条件参与」，不误报成不能投', () => {
    const { text } = buildActionTitle({
      kanban: [{ column: 'cannot', title: '既往业绩认定', waivable: true }],
    });
    expect(text).toContain('有条件参与');
    expect(text).not.toContain('无法满足且不可化解');
  });
});

describe('数据不足 → 必须标「待补」，不许回落栏目名', () => {
  it('空矩阵', () => {
    const { text, pending } = buildActionTitle({ title: '符合性矩阵', matrixRows: [] });
    expect(pending).toBe(true);
    expect(text).toContain('待补');
  });

  it('不认识的卡片形态', () => {
    const { text, pending } = buildActionTitle({ title: '某个新卡', kind: 'whatever' });
    expect(pending).toBe(true);
    expect(text).toContain('待补');
    expect(text).toContain('数据不足');
  });

  it('待补标题里保留栏目名做定位，但明确写着未生成结论', () => {
    const { text } = buildActionTitle({ title: 'Bid / No-Bid 建议', decision: {} as any });
    expect(text).toContain('Bid / No-Bid 建议');
    expect(text).toContain('未生成结论');
  });
});

describe('章节装配', () => {
  it('每节标题是结论句，正文里才留栏目名（工作台导航仍要用栏目名）', () => {
    const sections = buildConclusionSections([
      { title: '符合性矩阵', matrixRows: [{ verdict: 'ok' }] },
      { title: 'Bid / No-Bid 建议', decision: { recommendation: '建议投标' } },
    ]);
    expect(sections).toHaveLength(2);
    expect(sections[0].title).toContain('1 项要求全部满足');
    expect(sections[0].body).toContain('符合性矩阵');
    expect(sections[1].title).toBe('建议投标');
    expect(sections.every((s) => !s.pending)).toBe(true);
  });

  it('待补的节照样出，但打了 pending 标记（审计要能查到哪节没成文）', () => {
    const sections = buildConclusionSections([{ title: '空卡' }]);
    expect(sections[0].pending).toBe(true);
  });
});
