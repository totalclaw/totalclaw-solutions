/**
 * 「生成文件」这条链的回归护栏。
 *
 * 出过的事故：三个模块的「输出物」卡片点「生成文件」，一个文件都落不下来，
 * 界面上只留一句「还没有生成任何文件。在『输出物』卡片里点生成。」——
 * 因为渲染层送过去的 costTotal 是 BOM 小计、sellPrice 是建议区间下限，
 * 而卡片上的「成本合计 / 目标毛利」按完整成本口径算，主进程的恒等式校验必然对不上，
 * 每一份输出物都被**自己的报价模型**阻断。
 *
 * 所以这里不测「函数返回了什么字段」，而是把三个模块的真实卡片
 * → 真装配 → **真校验器** → **真生成器** 走通，断言每份输出物都能落成文件。
 * 载荷字段改一个口径就会在这里红。
 */
import { describe, it, expect } from 'vitest';
import { buildStructuredOutput } from './outputPayload';
import { buildCards, defaultState } from './demoData';
import { SAUDI_MODULES } from './modules';
import { validateDeliverable, describeBlockingIssues } from '../../../main/services/deliverableValidator';
import { buildEml, buildProposalDocx, buildQuotationXlsx, type OutputContext } from '../../../main/services/saudiOutputBuilder';
import type { CardData, SaudiModuleId } from './types';

const MODULE_IDS: SaudiModuleId[] = ['rfq-quote', 'bid-decision', 'advisory-report'];

function cardsFor(moduleId: SaudiModuleId): CardData[] {
  return buildCards(moduleId, defaultState(moduleId));
}

function declaredOutputs(cards: CardData[]): { name: string; kind: string }[] {
  const card = cards.find((c) => c.kind === 'outputs');
  return (card?.outputs ?? []).map((o) => ({ name: o.name, kind: String(o.kind ?? '') }));
}

/** 与 intake.ipc.ts 的 CASE_GENERATE_OUTPUT 同一条装配路径（含未审批草稿态）。 */
function assemble(moduleId: SaudiModuleId, name: string, kind: string) {
  const cards = cardsFor(moduleId);
  const structured = buildStructuredOutput(kind, name, {
    cards,
    bomVariant: 'primary',
    title: `${SAUDI_MODULES[moduleId].title} · 测试案件`,
    customer: '测试客户',
    project: '测试案件',
    ruleVersion: 'v1.3',
    subject: '测试案件',
    to: 'buyer@example.com',
  });
  const ctx = { ...structured, draft: true } as OutputContext & Record<string, any>;
  const report = validateDeliverable(ctx, {
    foreignNames: [],
    costTotal: structured.costTotal,
    sellPrice: structured.sellPrice,
    bomSubtotal: structured.bomSubtotal,
  });
  return { cards, structured, ctx, report };
}

describe('三个模块的每一份输出物都能真的生成出来', () => {
  for (const moduleId of MODULE_IDS) {
    const outputs = declaredOutputs(cardsFor(moduleId));

    it(`${moduleId}：输出物卡片不为空`, () => {
      expect(outputs.length).toBeGreaterThan(0);
    });

    for (const output of outputs) {
      it(`${moduleId} · ${output.name} 不被交付物校验阻断`, () => {
        const { report } = assemble(moduleId, output.name, output.kind);
        // 失败时把逐条定位打进断言消息 —— 只报 "false !== true" 等于没报
        expect(report.passed, `${output.name}\n${describeBlockingIssues(report)}`).toBe(true);
      });
    }
  }
});

describe('载荷只描述这份文件本身', () => {
  it('表格类 xlsx（符合性矩阵 / 任务清单）不夹带 BOM 与报价行', () => {
    for (const name of ['技术商务符合性矩阵.xlsx', '投标准备任务清单.xlsx']) {
      const { structured } = assemble('bid-decision', name, 'excel');
      expect(structured.table?.rows?.length, name).toBeGreaterThan(0);
      // 这些数字在生成出来的表格件里一个都不会出现，传过去只会被拿去做无意义的对账
      expect(structured.bom, name).toBeUndefined();
      expect(structured.calcLines, name).toBeUndefined();
      expect(structured.priceRange, name).toBeUndefined();
      expect(structured.costTotal, name).toBeUndefined();
      expect(structured.sellPrice, name).toBeUndefined();
    }
  });

  it('两份表格件内容不同（不是同一张表导出两遍）', async () => {
    const matrix = await buildQuotationXlsx(assemble('bid-decision', '技术商务符合性矩阵.xlsx', 'excel').ctx);
    const tasks = await buildQuotationXlsx(assemble('bid-decision', '投标准备任务清单.xlsx', 'excel').ctx);
    expect(matrix.equals(tasks)).toBe(false);
  });
});

describe('报价口径按 calc.ts 的模型传，不拿一个数顶另一个', () => {
  it('costTotal = 成本合计行、sellPrice = 底价行、bomSubtotal = 设备采购行', () => {
    const cards = cardsFor('rfq-quote');
    const pricing = cards.find((c) => c.kind === 'pricing');
    const line = (key: string) => pricing?.calcLines?.find((l) => l.key === key)?.result;
    const { structured } = assemble('rfq-quote', '正式报价_Nexa_Gulf_v1.xlsx', 'excel');

    expect(structured.costTotal).toBe(line('total_cost'));
    expect(structured.sellPrice).toBe(line('floor_price'));
    expect(structured.bomSubtotal).toBe(line('equipment'));
    // 三个数确实互不相同 —— 否则这条断言只是在验证一个巧合
    expect(new Set([structured.costTotal, structured.sellPrice, structured.bomSubtotal]).size).toBe(3);
  });

  it('BOM 与报价行不同源（改了 BOM 没重算报价）时照样拦下来', () => {
    const { ctx, structured } = assemble('rfq-quote', '正式报价_Nexa_Gulf_v1.xlsx', 'excel');
    const tampered = { ...ctx, bom: (ctx.bom ?? []).map((r, i) => (i === 0 ? { ...r, qty: r.qty + 5, lineTotal: (r.qty + 5) * r.unitCost } : r)) };
    const report = validateDeliverable(tampered, {
      costTotal: structured.costTotal, sellPrice: structured.sellPrice, bomSubtotal: structured.bomSubtotal,
    });
    expect(report.passed).toBe(false);
    expect(report.issues.some((i) => i.code === 'IDENTITY_GRAND_TOTAL')).toBe(true);
  });
});

describe('落盘的是真排版件', () => {
  it('docx / xlsx / eml 都能生成出非空二进制', async () => {
    const docx = await buildProposalDocx(assemble('bid-decision', 'Bid_No-Bid_建议书.docx', 'word').ctx);
    const xlsx = await buildQuotationXlsx(assemble('rfq-quote', '正式报价_Nexa_Gulf_v1.xlsx', 'excel').ctx);
    const { ctx, structured } = assemble('rfq-quote', '客户邮件草稿.eml', 'email');
    const eml = buildEml(ctx, structured.emailBody, structured.to);

    expect(docx.length).toBeGreaterThan(1000);
    expect(xlsx.length).toBeGreaterThan(1000);
    expect(eml.length).toBeGreaterThan(100);
    // docx / xlsx 都是 zip 容器，头两个字节必须是 PK —— 落一个纯文本却叫 .docx 是客户双击打不开的老 bug
    expect(docx.subarray(0, 2).toString()).toBe('PK');
    expect(xlsx.subarray(0, 2).toString()).toBe('PK');
  });
});
