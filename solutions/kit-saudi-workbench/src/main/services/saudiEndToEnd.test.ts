/**
 * 沙特三模块**跨服务端到端**集成测试：真文件、真落盘、真跨模块调用。
 *
 * 单测覆盖的是各服务内部逻辑；这里补的是它们**连起来**是否成立——
 * 收件落盘 → 建案 → 抽 BOQ → 按数据包算价 → 生成正式件 → 审批闸门 → 审计可反查。
 * 这条链上任何一环的契约对不上（字段名、类型、顺序），单测都发现不了，只有连起来跑才暴露。
 *
 * 不碰 Electron（printToPDF 那条路要真窗口，另测），其余全是真实现。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

vi.mock('electron', () => ({ BrowserWindow: class {} }));

import { IntakeService } from './intakeService';
import { SaudiCaseStore } from './saudiCaseStore';
import { SaudiDataPackStore } from './saudiDataPack';
import { buildQuotationXlsx, buildProposalDocx } from './saudiOutputBuilder';

let home: string;
let intake: IntakeService;
let cases: SaudiCaseStore;
let pack: SaudiDataPackStore;

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), 'tc-e2e-'));
  intake = new IntakeService({ totalclawHome: home });
  intake.start();
  cases = new SaudiCaseStore({ totalclawHome: home });
  pack = new SaudiDataPackStore({ totalclawHome: home });
});

afterEach(() => {
  intake.stop();
  rmSync(home, { recursive: true, force: true });
});

/** 造一份真 xlsx 附件（BOQ 数量表），走真实的 xlsx 编码路径。 */
async function makeBoqXlsx(): Promise<Buffer> {
  const XLSX: any = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet([
    ['Bill of Quantities'],
    ['SKU', '描述', '数量', '单位', '单价'],
    ['IPC-4K-BLT-30', '室外筒机 4K', 60, '台', 7450],
    ['SW-POE-24-370', '24 口 PoE 交换机', 6, '台', 9800],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'BOQ');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

describe('询价 → 报价 全链路', () => {
  it('收件落盘 → 建案 → 生成带公式的报价 → 审批闸门 → 审计可反查', async () => {
    // ① 收件：真写 ingress（含真 xlsx 附件），watcher 消费
    const boq = await makeBoqXlsx();
    intake.writeIngress(
      {
        channel: 'email',
        externalId: 'imap:e2e:1',
        from: { name: 'Ahmed', address: 'ahmed@nexagulf.example', org: 'Nexa Gulf' },
        subject: 'RFQ – Jeddah CCTV',
        body: '请报价 60 台摄像机与 6 台交换机',
        hints: { customer: 'Nexa Gulf', deadline: '2026-08-18' },
      },
      [{ fileName: 'BOQ.xlsx', data: boq, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }],
    );
    await intake.drainInbox();

    const { items } = intake.list();
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.module).toBe('rfq-quote');           // 分类器认出是询价
    expect(item.attachments[0].sha256).toMatch(/^[0-9a-f]{64}$/);

    // 附件真能按路径读回来（抽取链路就靠它）
    const attachmentPath = intake.attachmentPath(item.id, item.attachments[0].relPath);
    expect(attachmentPath).toBeTruthy();
    expect(existsSync(attachmentPath!)).toBe(true);

    // ② 建案：收件与案件双向挂钩
    const record = cases.create({
      module: 'rfq-quote',
      subject: item.subject,
      customer: item.customer!,
      deadline: item.deadline,
      owner: 'A. Malik',
      itemIds: [item.id],
    });
    intake.assign([item.id], 'rfq-quote', record.id);
    expect(intake.list().items[0].caseId).toBe(record.id);
    expect(intake.list().items[0].status).toBe('assigned');

    // ③ 数据包：改毛利要 bump 版本，后面报价与审计都引用它
    const saved = pack.save({ rules: { ...pack.get().rules, targetMargin: 0.16 } }, 'A. Malik');
    expect(saved.changed).toBe(true);
    const ruleVersion = saved.pack.version;

    // ④ 生成正式件（未审批）：真 xlsx + 公式 + DRAFT
    const xlsx = await buildQuotationXlsx({
      title: '正式报价', customer: 'Nexa Gulf', project: 'Jeddah CCTV',
      ruleVersion, draft: !cases.isApproved(record.id),
      bom: [
        { sku: 'IPC-4K-BLT-30', description: '室外筒机 4K', qty: 60, unit: '台', unitCost: 7450 },
        { sku: 'SW-POE-24-370', description: '24 口 PoE', qty: 6, unit: '台', unitCost: 9800 },
      ],
      calcLines: [{ label: '设备采购', formula: 'Σ(数量 × 单价)', result: 505800, currency: 'SAR' }],
    });
    const generated = cases.generateOutput({ caseId: record.id, kind: 'excel', name: '正式报价', content: xlsx });
    expect(generated.output?.draft).toBe(true);

    // 落盘的是真 xlsx：读回来公式还在
    const filePath = join(home, 'cases', generated.output!.relPath!);
    expect(existsSync(filePath)).toBe(true);
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(readFileSync(filePath), { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const formulas = Object.keys(sheet).filter((k) => !k.startsWith('!') && sheet[k]?.f);
    expect(formulas.length).toBeGreaterThan(0);
    expect(wb.SheetNames[0]).toContain('DRAFT');

    // ⑤ 审批闸门：未审批发送必须被主进程拦住
    const blocked = cases.simulateSend(record.id, generated.output!.id, 'client@example.com');
    expect(blocked.blocked).toBe(true);
    expect(cases.get(record.id)!.status).not.toBe('delivered');

    // ⑥ 提交 → 批准 → 发送
    cases.submit(record.id, 'A. Malik');
    const decided = cases.decide({ caseId: record.id, action: 'approve', actor: 'M. Saleh' });
    expect(decided.case?.status).toBe('approved');
    // 审批前生成的文件要标出来：水印画在文件里，翻标志位去不掉
    expect(cases.get(record.id)!.outputs[0].generatedBeforeApproval).toBe(true);

    const sent = cases.simulateSend(record.id, generated.output!.id, 'client@example.com');
    expect(sent.receipt).toContain('未真实发送');
    expect(cases.get(record.id)!.status).toBe('delivered');

    // ⑦ 审计：整条链都留痕，且能反查
    const audit = cases.auditEntries(record.id).map((e) => e.action).join('|');
    expect(audit).toContain('建案');
    expect(audit).toContain('生成输出物');
    expect(audit).toContain('提交审批');
    expect(audit).toContain('批准');
    expect(audit).toContain('模拟发送');
    expect(audit).toContain('发送被拦截');
  });
});

describe('招投标 → 多源合并 全链路', () => {
  it('两条来源被识别为同一项目 → 人工确认合并 → 建案带上全部来源', async () => {
    const boq = await makeBoqXlsx();
    // 公告（工单）与 RFP（邮件）带同一份附件 —— sha256 相同是最强的合并依据
    intake.writeIngress(
      {
        channel: 'webform', externalId: 'ticket:tender:7',
        from: { name: 'Al Noor', address: 'tenders@alnoor.example', org: 'Al Noor Industrial City' },
        subject: 'Perimeter Security Upgrade 招标公告',
        body: '周界安防与网络升级 投标',
        hints: { customer: 'Al Noor Industrial City', targetModule: 'bid-decision' },
      },
      [{ fileName: 'BOQ.xlsx', data: boq }],
    );
    intake.writeIngress(
      {
        channel: 'email', externalId: 'imap:alnoor:1',
        from: { name: 'Al Noor', address: 'tenders@alnoor.example', org: 'Al Noor Industrial City' },
        subject: 'Perimeter Security & Network Upgrade — RFP 与 BOQ',
        body: 'RFP 与 BOQ 见附件 招标',
        hints: { customer: 'Al Noor Industrial City' },
      },
      [{ fileName: 'BOQ.xlsx', data: boq }],
    );
    await intake.drainInbox();

    const { items, groups } = intake.list();
    expect(items).toHaveLength(2);
    expect(groups).toHaveLength(1);
    expect(groups[0].merged).toBe(false);            // 绝不自动合并
    expect(groups[0].reasons.map((r) => r.label).join()).toContain('sha256');

    const group = groups[0];
    intake.merge(group.itemIds, group.id);
    expect(intake.list().groups[0].merged).toBe(true);

    const record = cases.create({
      module: 'bid-decision',
      subject: items[0].subject,
      customer: 'Al Noor Industrial City',
      owner: 'R. Ahmed',
      itemIds: group.itemIds,
    });
    intake.assign(group.itemIds, 'bid-decision', record.id);
    expect(cases.get(record.id)!.itemIds).toHaveLength(2);
    expect(intake.list().items.every((i) => i.caseId === record.id)).toBe(true);

    // 撤销合并后条目还在、来源标签还在（需求明确要求）
    intake.unmerge(group.id);
    expect(intake.list().items).toHaveLength(2);
    expect(intake.list().items.map((i) => i.channel).sort()).toEqual(['email', 'webform']);
  });
});

describe('数据包 → 报价 → 正式件 一致性', () => {
  it('改规则后生成的文件里带的是新版本号', async () => {
    const record = cases.create({
      module: 'rfq-quote', subject: 'T', customer: 'C', owner: 'O', itemIds: [],
    });
    const first = pack.get().version;
    const saved = pack.save({ rules: { ...pack.get().rules, installUnitCost: 1500 } }, 'A');
    expect(saved.pack.version).not.toBe(first);

    const docx = await buildProposalDocx({
      title: '技术方案', customer: 'C', project: 'P',
      ruleVersion: saved.pack.version, draft: true,
      sections: [{ title: '概述', body: '正文' }],
    });
    const out = cases.generateOutput({ caseId: record.id, kind: 'word', name: '技术方案', content: docx });
    const AdmZip = (await import('adm-zip')).default as any;
    const xml = new AdmZip(readFileSync(join(home, 'cases', out.output!.relPath!))).readAsText('word/document.xml');
    expect(xml).toContain(saved.pack.version);
    expect(xml).toContain('DRAFT');
  });

  /**
   * 校验闸门端到端：**错的数字必须在落盘之前被拦下**。
   * 单测验的是校验器算得对，这里验的是「拦下之后确实一个文件都没写、且审计查得到」。
   */
  it('数值校验不过 → 不生成文件、审计留痕、来源与校验结论进得了文件', async () => {
    const record = cases.create({
      module: 'rfq-quote', subject: 'Jeddah CCTV', customer: 'Nexa Gulf', owner: 'A. Malik', itemIds: [],
    });
    const { validateDeliverable } = await import('./deliverableValidator');

    // ① 单价为负 —— 阻断，且定位到具体行与字段
    const bad = {
      title: '正式报价', customer: 'Nexa Gulf', project: 'Jeddah CCTV', ruleVersion: 'v1', draft: true,
      bom: [{ sku: 'IPC-4K', description: '筒机', qty: 60, unit: '台', unitCost: -7450, lineTotal: -447000 }],
    };
    const report = validateDeliverable(bad, { foreignNames: cases.foreignPartyNames(record.id) });
    expect(report.passed).toBe(false);
    expect(report.issues.some((i) => i.code === 'RANGE_UNIT_COST' && i.locator.includes('第 1 行'))).toBe(true);

    // ② 主进程按这个结论拦住生成：一个输出物都不该多出来
    cases.recordValidationBlocked(record.id, '正式报价', report as any);
    expect(cases.get(record.id)!.outputs).toHaveLength(0);
    const audit = cases.auditEntries(record.id);
    expect(audit.some((e) => e.action.includes('拦截') && (e.note ?? '').includes('单价'))).toBe(true);

    // ③ 改对之后放行，校验结论与来源标注一起落进文件
    const good = {
      ...bad,
      bom: [{ sku: 'IPC-4K', description: '筒机', qty: 60, unit: '台', unitCost: 7450, lineTotal: 447000 }],
      validationNote: '',
      provenance: {
        sources: [{ name: 'Etimad 标讯（快照）', url: 'https://tenders.etimad.sa/x', fetchedAt: '2026-08-13T21:04:00Z' }],
        itemCount: 1, basis: '金额口径=含税', caseNo: record.caseNo,
      },
    };
    const ok = validateDeliverable(good, {});
    expect(ok.passed).toBe(true);
    good.validationNote = ok.summary;

    const xlsx = await buildQuotationXlsx(good as any);
    const generated = cases.generateOutput({
      caseId: record.id, kind: 'excel', name: '正式报价', content: xlsx, validation: ok as any,
    });
    expect(generated.output?.validation?.passed).toBe(true);

    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(readFileSync(join(home, 'cases', generated.output!.relPath!)), { type: 'buffer' });
    const text = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
    expect(text).toContain('tenders.etimad.sa');       // 来源链接
    expect(text).toContain('2026-08-13T21:04:00Z');    // 抓取时间
    expect(text).toContain(record.caseNo!);            // 任务编号
    expect(text).toContain(ok.summary);                // 校验结论
    // 审计里查得到「这一版核过、结论是什么」
    expect(cases.auditEntries(record.id).some((e) => e.after === ok.summary)).toBe(true);
  });

  it('别的案件的客户名混进交付物 → 阻断（防串标）', async () => {
    cases.create({ module: 'rfq-quote', subject: 'Metro 项目', customer: 'Riyadh Metro Logistics', owner: 'A', itemIds: [] });
    const mine = cases.create({ module: 'rfq-quote', subject: 'Jeddah CCTV', customer: 'Nexa Gulf', owner: 'A', itemIds: [] });

    const { validateDeliverable } = await import('./deliverableValidator');
    const report = validateDeliverable({
      title: '技术方案', customer: 'Nexa Gulf', project: 'Jeddah CCTV', draft: true,
      sections: [{ title: '参考案例', body: '参考此前为 Riyadh Metro Logistics 做的同类方案。' }],
    }, { foreignNames: cases.foreignPartyNames(mine.id) });

    expect(report.passed).toBe(false);
    expect(report.issues.some((i) => i.code === 'ANTI_CROSS_CUSTOMER')).toBe(true);
  });

  it('数据包重启后仍在（落盘不是内存态）', () => {
    pack.save({ rules: { ...pack.get().rules, riskRate: 0.05 } }, 'A');
    const reopened = new SaudiDataPackStore({ totalclawHome: home });
    expect(reopened.get().rules.riskRate).toBe(0.05);
  });

  it('收件与案件重启后仍在', async () => {
    intake.writeIngress({ channel: 'upload', externalId: 'u:1', subject: '重启前收的件', body: '' });
    await intake.drainInbox();
    cases.create({ module: 'rfq-quote', subject: '重启前的案件', customer: 'C', owner: 'O', itemIds: [] });

    const intake2 = new IntakeService({ totalclawHome: home });
    intake2.start();
    const cases2 = new SaudiCaseStore({ totalclawHome: home });
    try {
      expect(intake2.list().items.some((i) => i.subject === '重启前收的件')).toBe(true);
      expect(cases2.list().some((c) => c.subject === '重启前的案件')).toBe(true);
    } finally {
      intake2.stop();
    }
  });
});
