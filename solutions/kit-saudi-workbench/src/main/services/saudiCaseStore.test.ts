/**
 * 案件库：审批闸门 / 草稿水印 / 审计可反查。
 *
 * 需求里三条红线，逐条钉成测试：
 *   「批准前不能发送」「未审批导出带 DRAFT 水印」「任一最终数字都能反查谁把 X 改成了 Y」。
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SaudiCaseStore, nextCaseNo } from './saudiCaseStore';

let home: string;
let store: SaudiCaseStore;

function newCase() {
  return store.create({
    module: 'rfq-quote',
    subject: 'RFQ – Jeddah CCTV',
    customer: 'Nexa Gulf',
    deadline: '2026-08-18',
    owner: 'A. Malik',
    itemIds: ['item-1'],
  });
}

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), 'tc-case-'));
  store = new SaudiCaseStore({ totalclawHome: home });
});

afterEach(() => {
  rmSync(home, { recursive: true, force: true });
});

describe('输出物与草稿水印', () => {
  it('未审批生成的输出物 draft=true，文件里有 DRAFT 水印', () => {
    const record = newCase();
    const { output } = store.generateOutput({
      caseId: record.id, kind: 'excel', name: '正式报价', content: '设备采购,612400',
    });
    expect(output?.draft).toBe(true);
    const text = readFileSync(join(home, 'cases', output!.relPath!), 'utf-8');
    expect(text).toContain('DRAFT');
    expect(text).toContain('设备采购,612400');
  });

  it('审批通过后已生成的输出物解除草稿态', () => {
    const record = newCase();
    store.generateOutput({ caseId: record.id, kind: 'excel', name: '正式报价', content: 'x' });
    store.submit(record.id);
    store.decide({ caseId: record.id, action: 'approve', actor: 'M. Saleh' });
    expect(store.get(record.id)!.outputs.every((o) => !o.draft)).toBe(true);
  });

  it('同名输出物版本号递增', () => {
    const record = newCase();
    store.generateOutput({ caseId: record.id, kind: 'pdf', name: '技术方案', content: 'v1' });
    const second = store.generateOutput({ caseId: record.id, kind: 'pdf', name: '技术方案', content: 'v2' });
    expect(second.output?.version).toBe('v2');
  });
});

describe('审批闸门', () => {
  it('未审批时发送被拦在主进程，不靠前端按钮 disabled', () => {
    const record = newCase();
    const { output } = store.generateOutput({ caseId: record.id, kind: 'email', name: '客户邮件', content: '正文' });
    const result = store.simulateSend(record.id, output!.id, 'client@example.com');
    expect(result.blocked).toBe(true);
    expect(result.receipt).toBe('');
    expect(store.get(record.id)!.status).not.toBe('delivered');
  });

  it('批准后可发送，但回执明确写"未真实发送"', () => {
    const record = newCase();
    const { output } = store.generateOutput({ caseId: record.id, kind: 'email', name: '客户邮件', content: '正文' });
    store.submit(record.id);
    store.decide({ caseId: record.id, action: 'approve', actor: 'M. Saleh' });
    const result = store.simulateSend(record.id, output!.id, 'client@example.com');
    expect(result.blocked).toBeUndefined();
    expect(result.receipt).toContain('未真实发送');
    expect(store.get(record.id)!.status).toBe('delivered');
  });

  it('退回 / 拒绝必须填理由，不填直接拒绝执行', () => {
    const record = newCase();
    store.submit(record.id);
    expect(store.decide({ caseId: record.id, action: 'return' }).message).toBeTruthy();
    expect(store.get(record.id)!.status).toBe('pending_approval');
    expect(store.decide({ caseId: record.id, action: 'return', reason: '价格需再核' }).case?.status).toBe('returned');
  });

  it('转交会改负责人', () => {
    const record = newCase();
    store.submit(record.id);
    store.decide({ caseId: record.id, action: 'reassign', assignee: 'S. Ali', actor: 'M. Saleh' });
    expect(store.get(record.id)!.owner).toBe('S. Ali');
  });
});

describe('审计留痕', () => {
  it('字段修改能反查「谁在什么时候把 AI 的 X 改成了 Y」', () => {
    const record = newCase();
    store.editField({
      caseId: record.id, cardId: 'pricing', fieldKey: 'target_margin', label: '目标毛利',
      before: '18%', after: '16%', actor: 'A. Malik',
    });
    const entry = store.auditEntries(record.id).find((e) => e.action.includes('修改'));
    expect(entry?.actor).toBe('A. Malik');
    expect(entry?.before).toBe('18%');
    expect(entry?.after).toBe('16%');
    expect(entry?.target).toContain('目标毛利');
    expect(store.get(record.id)!.edits['pricing.target_margin'].after).toBe('16%');
  });

  it('增量重算把受影响 / 未受影响都写进审计', () => {
    const record = newCase();
    store.recordRecalc({
      caseId: record.id,
      changedFields: [{ label: '交付地点', before: '吉达', after: '塔布克' }],
      affectedCards: ['pricing', 'benchmark'],
      unaffectedCards: ['match', 'gap'],
      fromVersion: 'v1',
      toVersion: 'v2',
      ruleVersion: 'v1.3',
    });
    const entries = store.auditEntries(record.id);
    expect(entries.some((e) => e.action.includes('模拟变更') && e.after === '塔布克')).toBe(true);
    const recalc = entries.find((e) => e.action.includes('增量重算'));
    expect(recalc?.note).toContain('match');
    expect(recalc?.ruleVersion).toBe('v1.3');
    expect(store.get(record.id)!.version).toBe(2);
  });

  it('审计按案件隔离', () => {
    const a = newCase();
    const b = newCase();
    store.submit(a.id);
    expect(store.auditEntries(b.id).every((e) => !e.action.includes('提交审批'))).toBe(true);
  });
});

describe('任务编号', () => {
  it('按「模块前缀-年-月日-当日序号」生成，三个模块各排各的', () => {
    const day = new Date(2026, 7, 13, 10, 0, 0); // 本地时间 2026-08-13 10:00
    const existing: { caseNo?: string }[] = [];
    const a = nextCaseNo(existing, 'rfq-quote', day);
    existing.push({ caseNo: a });
    const b = nextCaseNo(existing, 'rfq-quote', day);
    existing.push({ caseNo: b });
    const c = nextCaseNo(existing, 'bid-decision', day);
    expect(a).toMatch(/^RFQ-2026-0813-001$/);
    expect(b).toBe('RFQ-2026-0813-002');
    expect(c).toBe('BID-2026-0813-001'); // 招投标自己从 001 开始
    expect(nextCaseNo(existing, 'advisory-report', day)).toBe('ADV-2026-0813-001');
  });

  it('跨天从 001 重来', () => {
    const existing = [{ caseNo: 'RFQ-2026-0813-007' }];
    expect(nextCaseNo(existing, 'rfq-quote', new Date(2026, 7, 14, 1, 0, 0))).toBe('RFQ-2026-0814-001');
  });

  it('中间删过案件也不会撞号（取最大值 +1，不是按条数）', () => {
    // 001、002 建过又被删掉，只剩 003
    const existing = [{ caseNo: 'RFQ-2026-0813-003' }];
    expect(nextCaseNo(existing, 'rfq-quote', new Date(2026, 7, 13, 12, 0, 0))).toBe('RFQ-2026-0813-004');
  });

  it('建案时真的带上编号', () => {
    const record = store.create({
      module: 'rfq-quote', subject: '带编号', customer: 'X', itemIds: ['i1'],
    });
    expect(record.caseNo).toMatch(/^RFQ-\d{4}-\d{4}-\d{3}$/);
  });
});
