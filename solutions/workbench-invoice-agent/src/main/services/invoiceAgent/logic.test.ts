import { describe, expect, it } from 'vitest';
import type { IvCustomer, IvDraft, IvGoods, IvRow } from '@totalclaw/ipc-contracts';
import {
  buildDrafts, cents, checkCreditCode, detectMapping, etaxBatchSheets, fillFromCustomers, fitToTemplate, matchIssued, missingRequired, parseIssuedTable,
  parseRows, parseTaxRate, splitLine, splitTax, taxDiffProblems, validateRows, verifyExtracted,
} from './logic';

const DEF = { defaultTaxRate: 0.13, amountTaxIncluded: true, defaultKind: 'normal' as const };
let seq = 0;
const ids = { batchId: 'b1', newId: () => `r${++seq}` };
const goods = (name: string, confirmed = true): IvGoods => ({ id: `g-${name}`, name, taxCode: '1090511010000000000', shortName: '计算机配套产品', spec: '', unit: '', taxRate: 0.13, confirmed, source: confirmed ? 'manual' : 'suggested' });
const opts = (over: Partial<Parameters<typeof buildDrafts>[2]> = {}) => ({ mergeMode: 'buyer' as const, perInvoiceLimit: 0, maxLines: 100, goods: [goods('键盘'), goods('鼠标')], taxCodeRequired: true, newId: () => `d${++seq}`, now: '2026-10-10T00:00:00.000Z', ...over });
// 真实存在的统一社会信用代码（校验位正确）
const GOOD = '91350100M000100Y43';

function table(rows: Record<string, string>[]) { return { fileName: 'a.xlsx', sheetName: 'S1', rows }; }
function rowsOf(list: Record<string, string>[], mapping?: Record<string, string>): IvRow[] {
  const m = mapping || detectMapping(Object.keys(list[0]));
  const rows = parseRows(table(list), m, DEF, ids);
  validateRows(rows, { seller: { taxpayerType: 'general' }, customers: [] });
  return rows;
}

describe('税号与税率', () => {
  it('统一社会信用代码校验位', () => {
    expect(checkCreditCode(GOOD)).toBe(true);
    expect(checkCreditCode('91350100M000100Y44')).toBe(false);
    expect(checkCreditCode('9135010OM000100Y43')).toBe(false); // 含字母 O
  });
  it('税率写法都认', () => {
    expect(parseTaxRate('13%')).toBe(0.13);
    expect(parseTaxRate('13')).toBe(0.13);
    expect(parseTaxRate('0.06')).toBe(0.06);
    expect(parseTaxRate('免税')).toBe(0);
    expect(Number.isNaN(parseTaxRate('十三'))).toBe(true);
  });
  it('含税拆分一分不差', () => {
    for (const t of [11300, 9999, 1, 100001, 333]) { const { net, tax } = splitTax(t, 0.13); expect(net + tax).toBe(t); }
    expect(splitTax(11300, 0.13)).toEqual({ net: 10000, tax: 1300 });
  });
});

describe('列识别', () => {
  it('常见付款单表头', () => {
    const m = detectMapping(['序号', '付款单位', '纳税人识别号', '款项内容', '付款金额', '付款单号', '备注', '邮箱']);
    expect(m).toMatchObject({ buyerName: '付款单位', buyerTaxNo: '纳税人识别号', itemName: '款项内容', amount: '付款金额', orderNo: '付款单号', remark: '备注', email: '邮箱' });
    expect(m.unit).toBeUndefined(); // 「付款单位」不能被当成计量单位
    expect(missingRequired(m)).toEqual([]);
  });
  it('开票申请表表头，单位只认整格', () => {
    const m = detectMapping(['购买方名称', '税号', '项目名称', '规格型号', '单位', '数量', '单价', '金额', '税率', '发票类型']);
    expect(m.unit).toBe('单位');
    expect(m.buyerName).toBe('购买方名称');
    expect(m.spec).toBe('规格型号');
  });
  it('缺必填列会报出来', () => {
    expect(missingRequired(detectMapping(['客户名称', '数量']))).toEqual(['itemName', 'amount']);
  });
});

describe('行校验', () => {
  it('合计行和空行不进来，地址电话拆开', () => {
    const rows = rowsOf([
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 金额: '113', 地址电话: '福州市鼓楼区一号 0591-88886666' },
      { 购买方名称: '合计', 税号: '', 项目名称: '', 金额: '113', 地址电话: '' },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].buyerAddress).toBe('福州市鼓楼区一号');
    expect(rows[0].buyerPhone).toBe('0591-88886666');
    expect(rows[0].issues).toEqual([]);
  });
  it('税号抄错一位、同名不同税号、数量单价对不上、专票无税号', () => {
    const rows = rowsOf([
      { 购买方名称: '甲公司', 税号: '91350100M000100Y44', 项目名称: '键盘', 数量: '2', 单价: '50', 金额: '100', 发票类型: '' },
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 数量: '2', 单价: '50', 金额: '120', 发票类型: '' },
      { 购买方名称: '乙公司', 税号: '', 项目名称: '鼠标', 数量: '', 单价: '', 金额: '50', 发票类型: '专票' },
      { 购买方名称: '张三', 税号: '', 项目名称: '鼠标', 数量: '', 单价: '', 金额: '-5', 发票类型: '' },
    ]);
    const codes = (i: number) => rows[i].issues.map((x) => x.code);
    expect(codes(0)).toEqual(expect.arrayContaining(['taxno_checksum', 'name_taxno_conflict']));
    expect(codes(1)).toEqual(expect.arrayContaining(['name_taxno_conflict', 'amount_mismatch']));
    expect(codes(2)).toContain('special_needs_taxno');
    expect(rows[3].personal).toBe(true);
    expect(codes(3)).toContain('amount_negative');
  });
  it('客户档案补全税号，并且档案里确认过的税号不再拦校验位', () => {
    const customers: IvCustomer[] = [{ id: 'c1', name: '甲公司', taxNo: '91350100M000100Y44', address: '', phone: '', bank: '', bankAccount: '', email: 'a@b.cn', mobile: '', updatedAt: '' }];
    const rows = parseRows(table([{ 购买方名称: '甲公司', 项目名称: '键盘', 金额: '113' }]), detectMapping(['购买方名称', '项目名称', '金额']), DEF, ids);
    expect(fillFromCustomers(rows, customers)).toBe(1);
    validateRows(rows, { seller: { taxpayerType: 'general' }, customers });
    expect(rows[0].buyerTaxNo).toBe('91350100M000100Y44');
    expect(rows[0].email).toBe('a@b.cn');
    expect(rows[0].issues).toEqual([]);
  });
  it('小规模纳税人不能用 13%，重复行给提醒', () => {
    const rows = parseRows(table([
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 金额: '113', 订单号: 'A1' },
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 金额: '113', 订单号: 'A1' },
    ]), detectMapping(['购买方名称', '税号', '项目名称', '金额', '订单号']), DEF, ids);
    validateRows(rows, { seller: { taxpayerType: 'small' }, customers: [] });
    expect(rows[0].issues.map((x) => x.code)).toContain('rate_invalid');
    expect(rows[1].issues.map((x) => x.code)).toContain('dup_in_batch');
  });
});

describe('组票', () => {
  const sum = (ds: IvDraft[], k: 'amount' | 'tax' | 'total') => ds.reduce((n, d) => n + cents(d[k]), 0);
  it('同一购买方合成一张，同项目同单价并行，合计一分不差', () => {
    const rows = rowsOf([
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 数量: '2', 单价: '56.5', 金额: '113', 订单号: 'A1' },
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 数量: '1', 单价: '56.5', 金额: '56.5', 订单号: 'A2' },
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '鼠标', 数量: '3', 单价: '33.33', 金额: '99.99', 订单号: 'A2' },
      { 购买方名称: '张三', 税号: '', 项目名称: '鼠标', 数量: '1', 单价: '33.33', 金额: '33.33', 订单号: '' },
    ]);
    const ds = buildDrafts(rows, 'b1', opts());
    expect(ds).toHaveLength(2);
    const a = ds.find((d) => d.buyerName === '甲公司')!;
    expect(a.lines).toHaveLength(2);
    expect(a.lines[0]).toMatchObject({ itemName: '键盘', qty: 3, total: 169.5 });
    expect(a.total).toBe(269.49);
    expect(cents(a.amount) + cents(a.tax)).toBe(cents(a.total));
    expect(a.remark).toContain('A1');
    expect(a.issues.filter((i) => i.level === 'error')).toEqual([]);
    expect(taxDiffProblems(a)).toEqual([]);
    expect(ds.find((d) => d.buyerName === '张三')!.personal).toBe(true);
    expect(sum(ds, 'total')).toBe(11300 + 5650 + 9999 + 3333);
  });
  it('有错误的行不进发票；按订单号、逐行两种合并方式', () => {
    const rows = rowsOf([
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 金额: '113', 订单号: 'A1' },
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '鼠标', 金额: '50', 订单号: 'A2' },
      { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '', 金额: '50', 订单号: 'A2' },
    ]);
    expect(buildDrafts(rows, 'b1', opts({ mergeMode: 'order' }))).toHaveLength(2);
    expect(buildDrafts(rows, 'b1', opts({ mergeMode: 'row' }))).toHaveLength(2);
    expect(buildDrafts(rows, 'b1', opts())).toHaveLength(1);
  });
  it('超单张限额：按数量拆行、拆票，合计不变', () => {
    const rows = rowsOf([{ 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 数量: '10', 单价: '300', 金额: '3000' }]);
    const ds = buildDrafts(rows, 'b1', opts({ perInvoiceLimit: 1000 }));
    expect(ds).toHaveLength(4);
    expect(ds.map((d) => d.total)).toEqual([900, 900, 900, 300]);
    expect(ds.every((d) => d.total <= 1000)).toBe(true);
    expect(ds[0].part).toEqual({ index: 1, of: 4 });
    expect(sum(ds, 'total')).toBe(300000);
    expect(sum(ds, 'amount') + sum(ds, 'tax')).toBe(300000);
    expect(ds.flatMap((d) => d.lines).reduce((n, l) => n + l.qty, 0)).toBe(10);
  });
  it('没有数量的一行超限额：按金额拆，余数落在最后一张', () => {
    const [l] = buildDrafts(rowsOf([{ 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 金额: '2500.01' }]), 'b1', opts()).flatMap((d) => d.lines);
    const parts = splitLine(l, 100000);
    expect(parts.map((p) => p.total)).toEqual([1000, 1000, 500.01]);
    expect(parts.reduce((n, p) => n + cents(p.amount), 0)).toBe(cents(l.amount));
    expect(parts.reduce((n, p) => n + cents(p.tax), 0)).toBe(cents(l.tax));
  });
  it('行数上限拆票；没编码 / 编码待确认拦下', () => {
    const list = Array.from({ length: 5 }, (_, i) => ({ 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 数量: '1', 单价: String(10 + i), 金额: String(10 + i) }));
    expect(buildDrafts(rowsOf(list), 'b1', opts({ maxLines: 2 }))).toHaveLength(3);
    const noCode = buildDrafts(rowsOf(list), 'b1', opts({ goods: [] }));
    expect(noCode[0].issues.find((i) => i.code === 'tax_code_missing')?.level).toBe('error');
    expect(buildDrafts(rowsOf(list), 'b1', opts({ goods: [], taxCodeRequired: false }))[0].issues.find((i) => i.code === 'tax_code_missing')?.level).toBe('warning');
    expect(buildDrafts(rowsOf(list), 'b1', opts({ goods: [goods('键盘', false)] }))[0].issues.map((i) => i.code)).toContain('tax_code_unconfirmed');
  });
  it('不含税金额：税额按税率算', () => {
    const rows = parseRows(table([{ 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 金额: '100', 是否含税: '否' }]), detectMapping(['购买方名称', '税号', '项目名称', '金额', '是否含税']), DEF, ids);
    validateRows(rows, { seller: { taxpayerType: 'general' }, customers: [] });
    const [d] = buildDrafts(rows, 'b1', opts());
    expect([d.amount, d.tax, d.total]).toEqual([100, 13, 113]);
  });
});

describe('批量导入模板与回填', () => {
  const drafts = () => buildDrafts(rowsOf([
    { 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 数量: '2', 单价: '56.5', 金额: '113' },
    { 购买方名称: '张三', 税号: '', 项目名称: '鼠标', 数量: '', 单价: '', 金额: '33.33' },
  ]), 'b1', opts());
  it('基本信息与明细按流水号关联，自然人不带税号', () => {
    const [base, detail] = etaxBatchSheets(drafts());
    const b = (name: string) => base.headers.indexOf(name);
    const d = (name: string) => detail.headers.indexOf(name);
    expect(base.rows).toHaveLength(2);
    expect(detail.rows).toHaveLength(2);
    expect(base.rows[0][0]).toBe(detail.rows[0][0]);
    const person = base.rows.find((r) => r[b('购买方名称')] === '张三')!;
    expect(person[b('受票方自然人标识')]).toBe('是');
    expect(person[b('购买方纳税人识别号')]).toBe('');
    expect(base.rows[0][b('发票类型')]).toBe('普通发票');
    expect([detail.rows[0][d('数量')], detail.rows[0][d('单价')], detail.rows[0][d('金额')], detail.rows[0][d('税率')]]).toEqual([2, 56.5, '113.00', 0.13]);
  });
  it('按模板的列名对位：顺序不同、列更多、有重名列也不会错列', () => {
    const [base] = etaxBatchSheets(drafts());
    const fit = fitToTemplate(base, ['购买方名称', '发票流水号', '购买方统一社会信用代码/纳税人识别号', '是否展示购买方银行账号', '备注', '购买方名称']);
    expect(fit.rows[0]).toEqual(['甲公司', '0001', GOOD, '', '', '']);
    expect(fit.unfilled).toEqual(['是否展示购买方银行账号', '购买方名称']); // 第二个同名列不重复填
    // 我们有数据但模板里没位置的列要报出来，不能悄悄丢
    expect(fit.unplaced).toEqual(['发票类型', '是否含税', '受票方自然人标识']);
  });
  it('流水号带批次前缀，总长不超过 20 位', () => {
    const ds = buildDrafts(rowsOf([{ 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 金额: '113' }]), 'b1', opts({ serialPrefix: '2610100524' }));
    expect(ds[0].serial).toBe('26101005240001');
    expect(buildDrafts(rowsOf([{ 购买方名称: '甲公司', 税号: GOOD, 项目名称: '键盘', 金额: '113' }]), 'b1', opts({ serialPrefix: 'x'.repeat(30) }))[0].serial).toHaveLength(18);
  });
  it('回填：购方与价税合计都相同才配，数量对不上交人', () => {
    const ds = drafts().map((d) => ({ ...d, status: 'handed' as const }));
    const records = parseIssuedTable({ headers: ['数电发票号码', '购买方名称', '购买方纳税人识别号', '价税合计', '开票日期', '发票状态'], rows: [
      { 数电发票号码: '26352000000012345678', 购买方名称: '甲公司', 购买方纳税人识别号: GOOD, 价税合计: '113.00', 开票日期: '2026-10-10 10:00:00', 发票状态: '正常' },
      { 数电发票号码: '26352000000012345679', 购买方名称: '张三', 购买方纳税人识别号: '', 价税合计: '33.33', 开票日期: '2026-10-10', 发票状态: '正常' },
      { 数电发票号码: '26352000000012345680', 购买方名称: '张三', 购买方纳税人识别号: '', 价税合计: '33.33', 开票日期: '2026-10-10', 发票状态: '正常' },
      { 数电发票号码: '26352000000012345681', 购买方名称: '丙公司', 购买方纳税人识别号: '', 价税合计: '-10', 开票日期: '2026-10-10', 发票状态: '已红冲' },
    ] });
    expect(records).toHaveLength(3);
    const r = matchIssued(ds, records);
    expect(r.matched).toEqual([{ draftId: ds[0].id, invoiceNo: '26352000000012345678', issuedAt: '2026-10-10 10:00:00' }]);
    expect(r.ambiguous).toEqual([ds[1].id]);
    expect(matchIssued(ds.map((d) => ({ ...d, status: 'draft' as const })), records).matched).toEqual([]);
  });
  it('导错表会明说', () => {
    expect(() => parseIssuedTable({ headers: ['姓名', '金额'], rows: [] })).toThrow();
  });
});

describe('付款单抽取回核', () => {
  it('名称或金额在原文里找不到的不收', () => {
    const text = '付款方：福州甲科技有限公司\n金额：12,800.00 元\n用途：技术服务费';
    const r = verifyExtracted([
      { buyerName: '福州甲科技有限公司', amount: 12800 },
      { buyerName: '福州甲科技有限公司', amount: 12900 },
      { buyerName: '乙公司', amount: 12800 },
    ], text);
    expect(r.ok).toHaveLength(1);
    expect(r.rejected).toHaveLength(2);
  });
});
