/**
 * 报废台账 8.21 模板版护栏。
 *
 *   (a) 真实业务文件（~/Downloads/AI结算测试/报废/报废测试-更新，没有就跳过）：
 *       OEM 鉴定表「汇总」sheet 里 不可维修=1 且 责任≠供应商 的台数 = 记入台账行数（期望值在测试里直接从原表算，
 *       不写死数字）；拆零 368 行；表头 = 模板真表头顺序；对照表匹配数按条码集合交集算。
 *   (b) 合成文件（总是跑）：两层表头解析、质量鉴定拼法、供应商/流程号推断、拆零映射、对照表 + 品类推断、
 *       自定义模板列序、金额列路径、工作簿落盘。
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import { readTable } from './excel';
import {
  buildScrapLedger, parseOemAppraisal, parseScrapBarcodes, inferProcessNo, inferSupplier, inferCategory,
  readTemplateHeaders, writeScrapLedgerWorkbook, writeScrapSummaryWorkbook, LEDGER_HEADERS, LEDGER_FIELDS as F, AMOUNT_HEADER,
  REASON_HEADER, WrongSourceKindError, inspectScrapSources, scrapOutputStamp, describeLedgerWriteError,
} from './scrapTemplate';
import { listSpreadsheetFiles } from './proc';

const REAL = process.env.SCRAP_SAMPLE_DIR || '/Users/macpro/Downloads/AI结算测试/报废/报废测试-更新';
const REAL_OEM_DIR = join(REAL, 'OEM报废/FYSQ026080001005');
// 客户原件与去品牌化副本均支持；不改动客户文件，也不因文件名不同静默漏验。
const sampleFile = (dir: string, ...names: string[]) => names.map(name => join(dir, name)).find(existsSync) || join(dir, names[0]);
const REAL_OEM_115 = sampleFile(REAL_OEM_DIR, '2026年7月10日退奥荣鉴定表（115台）（品牌方版）.xlsx', '2026年7月10日退奥荣鉴定表（115台）（华帝版）.xlsx');
const REAL_OEM_6 = sampleFile(REAL_OEM_DIR, '2026年7月10日退奥荣鉴定表（6台）（品牌方版）.xlsx', '2026年7月10日退奥荣鉴定表（6台）（华帝版）.xlsx');
const SAMPLE_BRAND_QUALITY = REAL_OEM_115.includes('（华帝版）') ? '华帝非质量问题不可维修' : '品牌方非质量问题不可维修';
const REAL_BARCODE = join(REAL, '拆零报废/FYSQ026070001392/报废条码(368).xls');
const REAL_LOOKUP = join(REAL, '渠道匹配对照表.xlsx');
const REAL_TEMPLATE = join(REAL, '报废台账模板.xlsx');
const hasReal = [REAL_OEM_115, REAL_OEM_6, REAL_BARCODE, REAL_LOOKUP, REAL_TEMPLATE].every((p) => existsSync(p));

/** 直接从原表算期望：汇总 sheet 里 不可维修=1 且 供应商≠1 的行数 */
function expectedOemFromRaw(path: string): { units: number; kept: number; supplier: number; repairable: number } {
  const wb = XLSX.readFile(path);
  const ws = wb.Sheets[wb.SheetNames.find((n) => n.includes('汇总')) || wb.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: null, blankrows: false }) as unknown[][];
  const headerIdx = aoa.findIndex((r) => (r || []).some((c) => String(c ?? '').includes('条形码')));
  const sub = (aoa[headerIdx + 1] || []).map((c) => String(c ?? '').replace(/\s+/g, ''));
  const cUnrep = sub.indexOf('不可维修');
  const cSupplier = sub.indexOf('供应商');
  const cBarcode = (aoa[headerIdx] || []).findIndex((c) => String(c ?? '').includes('条形码'));
  expect(cUnrep).toBeGreaterThan(0);
  expect(cSupplier).toBeGreaterThan(0);
  let units = 0; let kept = 0; let supplier = 0; let repairable = 0;
  for (const row of aoa.slice(headerIdx + 2)) {
    const first = String((row || []).find((c) => c != null && String(c).trim() !== '') ?? '');
    if (/^合计/.test(first)) break;
    if (!row || String(row[cBarcode] ?? '').trim() === '') continue;
    units += 1;
    const unrep = Number(row[cUnrep]) === 1;
    const sup = Number(row[cSupplier]) === 1;
    if (!unrep) repairable += 1;
    else if (sup) supplier += 1;
    else kept += 1;
  }
  return { units, kept, supplier, repairable };
}

describe.skipIf(!hasReal)('报废台账 8.21 · 真实业务文件', () => {
  let out: string;
  beforeAll(() => { out = mkdtempSync(join(tmpdir(), 'ss-scrap-real-')); });
  afterAll(() => { rmSync(out, { recursive: true, force: true }); });

  it('OEM 鉴定表：只记非供应商责任的不可维修台数；供应商名 / 流程号从文件名 / 目录名带出', () => {
    const exp115 = expectedOemFromRaw(REAL_OEM_115);
    const exp6 = expectedOemFromRaw(REAL_OEM_6);
    expect(exp115.units).toBe(115);
    expect(exp6.units).toBe(6);
    const p = parseOemAppraisal(REAL_OEM_115);
    expect(p.supplier).toBe('奥荣');
    expect(p.processNo).toBe('FYSQ026080001005');
    expect(p.sheetsUsed).toEqual(['汇总']);
    expect(p.units).toHaveLength(115);
    expect(p.units.filter((u) => u.unrepairable && !u.supplierResponsible)).toHaveLength(exp115.kept);
    expect(p.units.filter((u) => u.unrepairable && u.supplierResponsible)).toHaveLength(exp115.supplier);
    expect(p.units.every((u) => u.returnDate === '2026-07-10')).toBe(true);
    const r = buildScrapLedger({ oemFiles: [REAL_OEM_115, REAL_OEM_6], barcodeFiles: [], lookup: { path: REAL_LOOKUP } });
    expect(r.counts).toMatchObject({
      oemUnits: 121, oemKept: exp115.kept + exp6.kept, oemDroppedSupplier: exp115.supplier + exp6.supplier, oemDroppedRepairable: exp115.repairable + exp6.repairable,
    });
    expect(r.rows).toHaveLength(exp115.kept + exp6.kept);
    // 模板示例行：1422605004326 → 奥荣 / 品牌方非质量问题不可维修 / 机身正面变形 / 4998
    const sample = r.rows.find((x) => x[F.barcode] === '1422605004326')!;
    expect(sample).toMatchObject({
      [F.maker]: '奥荣', [F.quality]: SAMPLE_BRAND_QUALITY, [F.verdict]: '机身正面变形', [F.location]: '4998',
      [F.materialCode]: '9MJ0000383', [F.description]: '电热水器DJF60-YP09/机械式', [F.quantity]: '1', [F.processNo]: 'FYSQ026080001005',
      [F.returnDate]: '2026-07-10', [F.channel]: '新零售', [F.category]: '电热水器', [F.returnType]: '', [F.workOrder]: '',
    });
    expect(r.rows.every((x) => x[F.quality].endsWith('不可维修') && !x[F.quality].startsWith('供应商'))).toBe(true);
  });

  it('拆零报废条码：368 行，自制 / 质量鉴定空 / 工单编码整数不带小数', () => {
    const p = parseScrapBarcodes(REAL_BARCODE);
    expect(p.units).toHaveLength(368);
    expect(p.processNo).toBe('FYSQ026070001392');
    const r = buildScrapLedger({ oemFiles: [], barcodeFiles: [REAL_BARCODE], lookup: { path: REAL_LOOKUP } });
    expect(r.rows).toHaveLength(368);
    const sample = r.rows.find((x) => x[F.barcode] === '1012505017209')!;
    expect(sample).toMatchObject({
      [F.maker]: '自制', [F.returnType]: '残次', [F.workOrder]: '1300013823', [F.materialCode]: '1AD0006638', [F.quality]: '',
      [F.returnDate]: '', [F.production]: '淘汰', [F.location]: '4918', [F.processNo]: 'FYSQ026070001392', [F.quantity]: '1',
    });
    // 8.21 模板示例行的鉴定结果是裸「不可维修」：368 行原因全非空，拼上原因就 368 行全部与模板不同
    expect(sample[F.verdict]).toBe('不可维修');
    expect(r.rows.every((x) => x[F.verdict] === '不可维修')).toBe(true);
    expect(r.headers).not.toContain(REASON_HEADER);
    expect(r.rows.every((x) => x[F.quality] === '')).toBe(true);
    // 要原因就开 includeReason：独立列，鉴定结果不动
    const r2 = buildScrapLedger({ oemFiles: [], barcodeFiles: [REAL_BARCODE], lookup: { path: REAL_LOOKUP }, includeReason: true });
    expect(r2.headers[r2.headers.length - 1]).toBe(REASON_HEADER);
    expect(r2.rows.find((x) => x[F.barcode] === '1012505017209')![REASON_HEADER]).toBe('包装破损');
    expect(r2.rows.every((x) => x[F.verdict] === '不可维修')).toBe(true);
  });

  it('放错框：鉴定表拖进「报废条码」框 / 对照表拖进任一框 → 拒收，不会被当拆零全量记入', () => {
    // 正则钉「是 XX 表」：文件名本身就带「鉴定表」「对照表」，光匹配这三个字会被「没找到表头」那条泛错误假过
    expect(() => parseScrapBarcodes(REAL_OEM_115)).toThrow(WrongSourceKindError);
    expect(() => parseScrapBarcodes(REAL_OEM_115)).toThrow(/是 OEM 鉴定表/);
    expect(() => buildScrapLedger({ oemFiles: [], barcodeFiles: [REAL_OEM_115], lookup: { path: REAL_LOOKUP } })).toThrow(/是 OEM 鉴定表/);
    expect(() => parseOemAppraisal(REAL_BARCODE)).toThrow(/是拆零「报废条码」表/);
    expect(() => parseOemAppraisal(REAL_LOOKUP)).toThrow(/是渠道对照表/);
    expect(() => parseScrapBarcodes(REAL_LOOKUP)).toThrow(/是渠道对照表/);
    // 预识别：错的那份带 error，对的照常给供应商 / 流程号 / 台数
    const insp = inspectScrapSources({ oemFiles: [REAL_OEM_6], barcodeFiles: [REAL_OEM_115, REAL_BARCODE] });
    expect(insp.sources.map((s) => [s.kind, Boolean(s.error), s.units])).toEqual([['oem', false, 6], ['barcode', true, 0], ['barcode', false, 368]]);
    expect(insp.sources[0]).toMatchObject({ supplier: '奥荣', processNo: 'FYSQ026080001005' });
    expect(insp.sources[1].error).toMatch(/是 OEM 鉴定表/);
  });

  it('总表：模板表头顺序、对照表匹配数 = 条码交集、渠道×品类台数 = 总行数', () => {
    const tpl = readTemplateHeaders(REAL_TEMPLATE);
    expect(tpl.fromTemplate).toBe(true);
    expect(tpl.headers).toEqual([...LEDGER_HEADERS]);
    const r = buildScrapLedger({ oemFiles: [REAL_OEM_115, REAL_OEM_6], barcodeFiles: [REAL_BARCODE], lookup: { path: REAL_LOOKUP }, templatePath: REAL_TEMPLATE, startDate: '2026-08-01' });
    expect(r.templateUsed).toBe(true);
    expect(r.headers).toEqual([...LEDGER_HEADERS]);
    expect(r.counts.total).toBe(r.counts.oemKept + 368);
    expect(r.rows.every((x) => x[F.startDate] === '2026-08-01')).toBe(true);
    // 期望匹配数：台账条码 ∩ 对照表条码
    const lookup = readTable(REAL_LOOKUP);
    const keys = new Set(lookup.rows.map((x) => String(x['条形码'] || '').trim().toUpperCase()).filter(Boolean));
    const expectedMatched = r.rows.filter((x) => keys.has(x[F.barcode].toUpperCase())).length;
    expect(r.counts.matched).toBe(expectedMatched);
    expect(r.counts.unmatched).toBe(r.counts.total - expectedMatched);
    expect(r.unmatched).toHaveLength(r.counts.unmatched);
    expect(r.counts.matched).toBeGreaterThan(0);
    // 台数聚合：每台 1 → 合计台数 = 行数；没有金额列
    expect(r.aggregate.total.count).toBe(r.counts.total);
    expect(r.aggregate.total.amount).toBe(r.counts.totalUnits);
    expect(r.aggregateAmount).toBeNull();
    expect(r.amountColumn).toBeUndefined();
    expect(r.summaryHeaders).toHaveLength(4);
    expect(r.summary[r.summary.length - 1][3]).toBe(r.counts.totalUnits);
    // 落盘 + 读回：4 个 sheet，台账行数一致
    const ledgerPath = join(out, '报废台账.xlsx');
    writeScrapLedgerWorkbook(ledgerPath, r);
    const wb = XLSX.readFile(ledgerPath);
    expect(wb.SheetNames).toHaveLength(4);
    const back = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });
    expect(back).toHaveLength(r.rows.length + 1);
    expect(back[0]).toEqual([...LEDGER_HEADERS]);
    const summaryPath = join(out, '汇总.xlsx');
    writeScrapSummaryWorkbook(summaryPath, r);
    expect(XLSX.readFile(summaryPath).SheetNames).toHaveLength(2);
    // 给人看的结论（报告用）
    // eslint-disable-next-line no-console
    console.info('[scrapTemplate real]', JSON.stringify({ counts: r.counts, summary: r.summary, warnings: r.warnings }));
  });

  // ── 2026-09-07 客户反馈「金额有差异」后的逐行对真值 ────────────────────────────
  const REAL_TRUTH = sampleFile(REAL_OEM_DIR, '不可维修品牌方责任  04.08.xls', '不可维修华帝责任  04.08.xls');
  const REAL_LIST = join(REAL, '拆零报废/FYSQ026070001392/368灶具拆机报废清单.xls');
  const aoaOf = (path: string, sheet: string): unknown[][] => {
    const wb = XLSX.readFile(path, { cellDates: true });
    return XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheet], { header: 1, raw: true, defval: null, blankrows: false }) as unknown[][];
  };
  const txt = (v: unknown): string => String(v ?? '').trim();

  it.skipIf(!existsSync(REAL_TRUTH))('OEM 记入集合 = 客户自己做的《不可维修品牌方责任 04.08.xls》「奥荣115+6」sheet（48 台，条码 / 成品编码 / 型号逐格一致）', () => {
    const truth = aoaOf(REAL_TRUTH, '奥荣115+6').slice(1).filter((row) => txt(row[0])).map((row) => ({ barcode: txt(row[0]), code: txt(row[1]), model: txt(row[2]), qty: Number(row[3]) }));
    expect(truth).toHaveLength(48);
    const r = buildScrapLedger({ oemFiles: [REAL_OEM_115, REAL_OEM_6], barcodeFiles: [], lookup: { path: REAL_LOOKUP } });
    expect(r.rows).toHaveLength(truth.length);
    const ours = new Map(r.rows.map((x) => [x[F.barcode], x]));
    expect([...ours.keys()].sort()).toEqual(truth.map((t) => t.barcode).sort());
    for (const t of truth) {
      expect(ours.get(t.barcode)).toMatchObject({ [F.materialCode]: t.code, [F.description]: t.model, [F.quantity]: String(t.qty), [F.maker]: '奥荣' });
    }
    // 汇总 sheet 最右一列客户手写的「品牌方责任不可维修 / 物流责任不可维修」标记 = 我们的记入集合（供应商责任那 3 台没有标记）
    const marked: string[] = [];
    for (const p of [REAL_OEM_115, REAL_OEM_6]) for (const row of aoaOf(p, '汇总').slice(3)) if (txt(row[2]) && /责任不可维修$/.test(txt(row[22]))) marked.push(txt(row[2]));
    expect(marked.sort()).toEqual([...ours.keys()].sort());
    // 责任只有 品牌方 / 物流 两种，质量鉴定全部是「非质量问题」
    const qualities = new Set(r.rows.map((x) => x[F.quality]));
    expect([...qualities].sort()).toEqual([SAMPLE_BRAND_QUALITY, '物流非质量问题不可维修'].sort());
  });

  it('模板两条「例」行逐格复现（含 Excel 类型：工单编码数值、流程发起日期 / 退货时间真日期格、条形码文本）', () => {
    const tplRows = aoaOf(REAL_TEMPLATE, 'Sheet1').filter((row) => txt(row[0]) === '例').map((row) => row.slice(1, 17));
    expect(tplRows).toHaveLength(2);
    const r = buildScrapLedger({ oemFiles: [REAL_OEM_115, REAL_OEM_6], barcodeFiles: [REAL_BARCODE], lookup: { path: REAL_LOOKUP }, templatePath: REAL_TEMPLATE, startDate: '2026-08-01' });
    const ledgerPath = join(out, '模板核对.xlsx');
    writeScrapLedgerWorkbook(ledgerPath, r);
    const back = aoaOf(ledgerPath, '报废台账');
    expect(back[0]).toEqual([...LEDGER_HEADERS]);
    const iBarcode = LEDGER_HEADERS.indexOf(F.barcode);
    const same = (a: unknown, b: unknown): boolean => {
      if (a instanceof Date || b instanceof Date) {
        const d = (v: unknown): string => (v instanceof Date ? `${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}` : txt(v));
        return d(a) === d(b);
      }
      if (typeof a === 'number' || typeof b === 'number') return Number(a) === Number(b) && typeof a === typeof b;
      return txt(a) === txt(b);
    };
    for (const tpl of tplRows) {
      const mine = back.find((row) => txt(row[iBarcode]) === txt(tpl[iBarcode]));
      expect(mine, `模板示例条码 ${txt(tpl[iBarcode])} 在台账里`).toBeTruthy();
      for (let c = 0; c < 16; c += 1) {
        expect(same(mine![c], tpl[c]), `${LEDGER_HEADERS[c]}：我们=${JSON.stringify(mine![c])} 模板=${JSON.stringify(tpl[c])}`).toBe(true);
      }
    }
    // 类型：工单编码数值（模板 1300013837 是数值）、条形码文本、日期是 Date
    const bcRow = back.find((row) => txt(row[iBarcode]) === '1012502039759')!;
    expect(typeof bcRow[LEDGER_HEADERS.indexOf(F.workOrder)]).toBe('number');
    expect(typeof bcRow[iBarcode]).toBe('string');
    expect(bcRow[LEDGER_HEADERS.indexOf(F.startDate)]).toBeInstanceOf(Date);
    const oemRow = back.find((row) => txt(row[iBarcode]) === '1422605004326')!;
    expect(oemRow[LEDGER_HEADERS.indexOf(F.returnDate)]).toBeInstanceOf(Date);
  });

  it.skipIf(!existsSync(REAL_LIST))('拆零渠道按需求指定的对照表：与客户《368灶具拆机报废清单》「渠道」列冲突时以对照表为准，冲突数如实记录', () => {
    const r = buildScrapLedger({ oemFiles: [REAL_OEM_115, REAL_OEM_6], barcodeFiles: [REAL_BARCODE], lookup: { path: REAL_LOOKUP } });
    // 期望值直接从对照表算，不写死
    const lookup = readTable(REAL_LOOKUP);
    const chOf = new Map(lookup.rows.map((x) => [String(x['条形码'] || '').trim(), { ch: String(x['渠道'] || '').trim(), cat: String(x['产品类型'] || '').trim() }]));
    const expected = new Map<string, number>();
    for (const x of r.rows) { const h = chOf.get(x[F.barcode])!; const k = `${h.ch}|${h.cat}`; expected.set(k, (expected.get(k) || 0) + 1); }
    for (const row of r.aggregate.rows) expect(row.amount, `${row.channel}|${row.category}`).toBe(expected.get(`${row.channel}|${row.category}`));
    expect(r.aggregate.rows.length).toBe(expected.size);
    // 清单：工单号 → 渠道；与对照表按条码给的渠道不一致的台数（客户数据问题，报告里列出，代码不替客户裁决）
    const list = aoaOf(REAL_LIST, '368').filter((row) => typeof row[0] === 'number');
    const listCh = new Map(list.map((row) => [txt(row[1]), txt(row[7])]));
    const bc = parseScrapBarcodes(REAL_BARCODE).units;
    const conflicts = bc.filter((u) => listCh.has(u.workOrder) && chOf.get(u.barcode)?.ch !== listCh.get(u.workOrder));
    // eslint-disable-next-line no-console
    console.info('[scrapTemplate real] 对照表 vs 清单 渠道冲突台数', conflicts.length, '清单渠道分布', JSON.stringify([...new Set(listCh.values())]));
    expect(bc.every((u) => listCh.has(u.workOrder))).toBe(true);
  });
});

// ── 合成文件 ──────────────────────────────────────────────────────────────────

function writeAoa(path: string, aoa: unknown[][], sheetName = 'Sheet1'): string {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa as any[][]), sheetName);
  XLSX.writeFile(wb, path);
  return path;
}

/** 两层表头鉴定表：标题行 / 组表头 / 子表头 / 数据 / 合计 */
function writeAppraisal(path: string, rows: { seq: number; barcode: string; code: string; model: string; loc: string; verdict: string; quality: 'q' | 'nq' | ''; resp: '物流' | '品牌方' | '供应商' | ''; repair: 'ok' | 'no' | '' ; amount?: number }[], withAmount = false): string {
  const header = ['序号', '退货时间', '条形码', '成品的\n物料编码', '产品\n型号', '库位', '数量', '鉴定结果', '质量鉴定', null, '责任鉴定', null, null, '是否\n可以维修', null, ...(withAmount ? ['报废金额'] : [])];
  const sub = [null, null, null, null, null, null, null, null, '质量问题', '非质量问题', '物流', '品牌方', '供应商', '可维修', '不可维修', ...(withAmount ? [null] : [])];
  const data = rows.map((r) => [
    r.seq, new Date(2026, 6, 10), r.barcode, r.code, r.model, r.loc, 1, r.verdict,
    r.quality === 'q' ? 1 : null, r.quality === 'nq' ? 1 : null,
    r.resp === '物流' ? 1 : null, r.resp === '品牌方' ? 1 : null, r.resp === '供应商' ? 1 : null,
    r.repair === 'ok' ? 1 : null, r.repair === 'no' ? 1 : null,
    ...(withAmount ? [r.amount ?? null] : []),
  ]);
  const total = ['合计', null, null, null, null, null, rows.length];
  return writeAoa(path, [['品牌方市场退货产品鉴定报告'], header, sub, ...data, total], '汇总');
}

describe('报废台账 8.21 · 合成文件', () => {
  let dir: string;
  let oemPath: string;
  let barcodePath: string;
  let lookupPath: string;
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'ss-scrap-syn-'));
    const oemDir = join(dir, 'OEM', 'FYSQ026080009999');
    const bcDir = join(dir, '拆零', 'FYSQ026070008888');
    mkdirSync(oemDir, { recursive: true });
    mkdirSync(bcDir, { recursive: true });
    oemPath = writeAppraisal(join(oemDir, '2026年8月1日退甲供鉴定表（6台）.xlsx'), [
      { seq: 1, barcode: 'B001', code: 'M1', model: '电热水器DJF60-X/机械式', loc: '4901', verdict: '纸箱破损', quality: 'nq', resp: '物流', repair: 'ok' },
      { seq: 2, barcode: 'B002', code: 'M1', model: '电热水器DJF60-X/机械式', loc: '4901', verdict: '机身正面变形', quality: 'nq', resp: '品牌方', repair: 'no' },
      { seq: 3, barcode: 'B003', code: 'M2', model: '电热水器DDF80-Y/电脑型', loc: '4902', verdict: '内胆漏水', quality: 'q', resp: '供应商', repair: 'no' },
      { seq: 4, barcode: 'B004', code: 'M2', model: '电热水器DDF80-Y/电脑型', loc: '4902', verdict: '机身侧面变形', quality: 'nq', resp: '物流', repair: 'no' },
      { seq: 5, barcode: 'B005', code: 'M3', model: '燃气热水器JSQ-Z', loc: '4903', verdict: '控制板故障', quality: 'q', resp: '品牌方', repair: 'no' },
      { seq: 6, barcode: 'B006', code: 'M3', model: '燃气热水器JSQ-Z', loc: '4903', verdict: '', quality: '', resp: '', repair: '' },
    ]);
    barcodePath = writeAoa(join(bcDir, '报废条码(3).xlsx'), [
      ['序号', '上线类型', '工单编码', '标签编码', '产品编码', '产品名称', '鉴定结果', '不良/报废原因', '性能不良', '在产情况', '使用情况', '库位'],
      [1, '残次', 1300000001, 'C001', '1AD0001', '双眼灶JZT-A/黑色玻璃面板', '不可维修', '包装破损', '/', '淘汰', '新机', '4918'],
      [2, '残次', 1300000002, 'C002', '1AD0002', '双眼灶JZY-B/黑色玻璃面板', '不可维修', '/', '/', '在产', '使用过', '4918'],
      [3, '退货', 1300000003, 'C003', '1AD0003', '吸油烟机CXW-C', '不可维修', '面板油污', '/', '淘汰', '使用过', '4901'],
    ]);
    lookupPath = writeAoa(join(dir, '渠道匹配对照表.xlsx'), [
      ['条形码', '成品物料编码', '产品型号', '渠道', '产品类型'],
      ['B002', 'M1', '电热水器DJF60-X/机械式', '新零售', '电热水器'],
      ['B004', 'M2', '电热水器DDF80-Y/电脑型', '线下', '电热水器'],
      ['C001', '1AD0001', '双眼灶JZT-A/黑色玻璃面板', '新零售', '灶具'],
      ['C002', '1AD0002', '双眼灶JZY-B/黑色玻璃面板', '新零售', '灶具'],
      ['C002', '1AD0002', '重复行', '线下', '灶具'],
    ]);
  });
  afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

  it('推断：流程号只认「大写字母+数字」目录名，供应商从「退XX鉴定」抠，品类按描述前缀', () => {
    expect(inferProcessNo('/a/FYSQ026080001005/x.xlsx')).toBe('FYSQ026080001005');
    expect(inferProcessNo('/a/OEM报废/x.xlsx')).toBe('');
    expect(inferProcessNo('/a/fysq123/x.xlsx')).toBe('');
    expect(inferSupplier('2026年7月10日退奥荣鉴定表（115台）（品牌方版）.xlsx')).toBe('奥荣');
    expect(inferSupplier('鉴定表.xlsx')).toBe('');
    expect(inferCategory('电热水器DJF60-YP09/机械式')).toBe('电热水器');
    expect(inferCategory('双眼灶JZY-8T201/黑色玻璃面板20Y')).toBe('灶具');
    expect(inferCategory('吸油烟机CXW-200')).toBe('烟机');
    expect(inferCategory('')).toBe('');
    // 客户 04.08 表里的其它品类：集成灶不能被「灶」抢成灶具；各种烟机归烟机；消毒柜；认不出的按中文前缀
    expect(inferCategory('一体式消毒柜款集成灶PG07玻璃面板12T')).toBe('集成灶');
    expect(inferCategory('一体式蒸烤一体款集成灶PY07玻璃面板12T')).toBe('集成灶');
    expect(inferCategory('单眼灶JZY-B861B2/黑色玻璃面板20Y')).toBe('灶具');
    expect(inferCategory('橱柜烟机CXW-200-i11S66/星韵灰/2.4G')).toBe('烟机');
    expect(inferCategory('侧吸式烟机CXW-238-J651C-1不锈钢')).toBe('烟机');
    expect(inferCategory('嵌入式食具消毒柜ZTD100-i13035')).toBe('消毒柜');
    expect(inferCategory('电烤箱JKD611-03国内/冻结')).toBe('电烤箱');
  });

  it('两层表头鉴定表：不可维修 且 非供应商责任 才记入；质量鉴定 = 责任 + 质量/非质量 + 不可维修', () => {
    const p = parseOemAppraisal(oemPath);
    expect(p.supplier).toBe('甲供');
    expect(p.processNo).toBe('FYSQ026080009999');
    expect(p.units).toHaveLength(6);
    expect(p.units.map((u) => u.returnDate)).toEqual(Array(6).fill('2026-07-10'));
    expect(p.warnings.some((w) => w.includes('1'))).toBe(true); // 第 6 台没勾维修
    const r = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [], lookup: { path: lookupPath } });
    expect(r.counts).toMatchObject({ oemUnits: 6, oemKept: 3, oemDroppedSupplier: 1, oemDroppedRepairable: 2, total: 3 });
    expect(r.rows.map((x) => x[F.barcode])).toEqual(['B002', 'B004', 'B005']);
    expect(r.rows[0][F.quality]).toBe('品牌方非质量问题不可维修');
    expect(r.rows[1][F.quality]).toBe('物流非质量问题不可维修');
    expect(r.rows[2][F.quality]).toBe('品牌方质量问题不可维修');
    expect(r.rows[0]).toMatchObject({ [F.maker]: '甲供', [F.channel]: '新零售', [F.category]: '电热水器', [F.processNo]: 'FYSQ026080009999', [F.startDate]: '' });
    // B005 对照表没有 → 渠道空、品类按描述推断
    expect(r.rows[2]).toMatchObject({ [F.channel]: '', [F.category]: '燃气热水器' });
    expect(r.counts).toMatchObject({ matched: 2, unmatched: 1, categoryInferred: 1, lookupDuplicates: 1 });
    expect(r.unmatched).toEqual([{ barcode: 'B005', description: '燃气热水器JSQ-Z', source: '2026年8月1日退甲供鉴定表（6台）.xlsx', processNo: 'FYSQ026080009999' }]);
  });

  it('多份对照表合并：互补条码照常匹配，渠道冲突的条码拒绝匹配而不是按拖入顺序取第一份', () => {
    const extra = writeAoa(join(dir, '线上.xlsx'), [
      ['条形码', '渠道', '产品类型'],
      ['B005', '线上', '燃热'],          // 互补：第一份表没有，照常并入
      ['B002', '冲突渠道', '冲突品类'],   // 冲突：与第一份表给的渠道不同
    ]);
    const r = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [], lookups: [{ path: lookupPath }, { path: extra }] });
    expect(r.rows.find((row) => row[F.barcode] === 'B005')).toMatchObject({ [F.channel]: '线上', [F.category]: '燃热' });
    // B002 两份表说法不一，必须落进未匹配让人裁决 —— 静默取一个会让「同样的文件，
    // 换个拖入顺序，渠道×品类汇总的数字就不同」。同文件内型号/店铺冲突本来就是这么处理的。
    expect(r.rows.find((row) => row[F.barcode] === 'B002')?.[F.channel]).toBeFalsy();
    expect(r.counts).toMatchObject({ matched: 2, unmatched: 1 });
    expect(r.warnings.some((w) => w.includes('B002') && w.includes('渠道不一致'))).toBe(true);
  });

  it('多份对照表里同一条码渠道一致时仍按第一条取，不误报冲突', () => {
    const same = writeAoa(join(dir, '同渠道补充.xlsx'), [
      ['条形码', '渠道', '产品类型'],
      ['B002', '新零售', '电热水器'],
    ]);
    const r = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [], lookups: [{ path: lookupPath }, { path: same }] });
    expect(r.rows.find((row) => row[F.barcode] === 'B002')).toMatchObject({ [F.channel]: '新零售' });
    expect(r.warnings.some((w) => w.includes('渠道不一致'))).toBe(false);
  });

  it('条码优先，空渠道继续按型号、店铺匹配；歧义和空值不能产生假匹配', () => {
    const source = writeAoa(join(dir, '多级报废条码.xlsx'), [
      ['标签编码', '上线类型', '工单编码', '产品编码', '产品名称', '产品型号', '店铺名称'],
      ['X1', '退货', 'W1', 'P1', '灶具', 'M1', '店A'],
      ['X2', '退货', 'W2', 'P2', '灶具', ' m1 ', '店A'],
      ['X3', '退货', 'W3', 'P3', '灶具', '冲突型号', '店A'],
      ['X4', '退货', 'W4', 'P4', '灶具', '无型号', '店A'],
      ['X5', '退货', 'W5', 'P5', '灶具', '冲突型号', '冲突店铺'],
      ['', '退货', 'W6', 'P6', '灶具', 'M1', ''],
      ['X7', '退货', 'W7', 'P7', '灶具', '/', '/'],
      ['X8', '退货', 'W8', 'P8', '灶具', 'M1-PLUS', ''],
    ]);
    const first = writeAoa(join(dir, '条码渠道.xlsx'), [
      ['条形码', '渠道'], ['X1', '条码渠道'], ['X2', ''],
    ]);
    const second = writeAoa(join(dir, '型号店铺渠道.xlsx'), [
      ['产品型号', '店铺名称', '渠道', '产品类型'],
      ['M1', '', '型号渠道', '灶具'],
      ['冲突型号', '', '渠道A', '灶具'],
      ['', '店A', '店铺渠道', '灶具'],
      ['', '冲突店铺', '渠道A', '灶具'],
      ['/', '/', '占位符渠道', '灶具'],
    ]);
    const third = writeAoa(join(dir, '跨表冲突.xlsx'), [
      ['产品型号', '店铺名称', '渠道'],
      ['冲突型号', '', '渠道B'], ['', '冲突店铺', '渠道B'],
    ]);
    const r = buildScrapLedger({ oemFiles: [], barcodeFiles: [source], lookups: [second, first, third].map((path) => ({ path })) });
    expect(r.rows.map((row) => row[F.channel])).toEqual(['条码渠道', '型号渠道', '店铺渠道', '店铺渠道', '', '型号渠道', '', '']);
    expect(r.counts).toMatchObject({ matched: 5, unmatched: 3, blankBarcode: 1 });
    expect(r.warnings.some((w) => w.includes('条码 1 行、型号 2 行、店铺 2 行'))).toBe(true);
    expect(r.warnings.some((w) => w.includes('1 行型号或店铺对应多个渠道'))).toBe(true);
  });

  it('来源首行条码为空时仍通过型号匹配，不当子表头跳过', () => {
    const source = writeAoa(join(dir, '首行空条码.xlsx'), [
      ['标签编码', '上线类型', '产品编码', '产品型号'],
      ['', '退货', 'P1', 'M1'],
    ]);
    const lookup = writeAoa(join(dir, '仅型号.xlsx'), [['产品型号', '渠道'], ['M1', '线上']]);
    const r = buildScrapLedger({ oemFiles: [], barcodeFiles: [source], lookups: [{ path: lookup }] });
    expect(r.counts).toMatchObject({ total: 1, matched: 1, blankBarcode: 1 });
    expect(r.rows[0][F.channel]).toBe('线上');
  });

  it('OEM 来源按型号完整值兜底，条码空渠道可使用后表有效记录', () => {
    const first = writeAoa(join(dir, '空渠道.xlsx'), [['条形码', '渠道'], ['B002', '']]);
    const second = writeAoa(join(dir, 'OEM型号.xlsx'), [
      ['条形码', '产品型号', '渠道'],
      ['B002', '', '条码补全'],
      ['', '燃气热水器JSQ-Z', '型号补全'],
    ]);
    const r = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [], lookups: [{ path: first }, { path: second }] });
    expect(r.rows.map((row) => row[F.channel])).toEqual(['条码补全', '', '型号补全']);
  });

  it('拆零报废条码：自制 / 退货类型=上线类型 / 鉴定结果带原因 / 质量鉴定与退货时间空', () => {
    const p = parseScrapBarcodes(barcodePath);
    expect(p.units).toHaveLength(3);
    expect(p.processNo).toBe('FYSQ026070008888');
    const r = buildScrapLedger({ oemFiles: [], barcodeFiles: [barcodePath], lookup: { path: lookupPath }, startDate: '2026/8/1' });
    expect(r.startDate).toBe('2026-08-01');
    expect(r.rows[0]).toMatchObject({
      [F.startDate]: '2026-08-01', [F.returnDate]: '', [F.maker]: '自制', [F.returnType]: '残次', [F.barcode]: 'C001', [F.materialCode]: '1AD0001',
      [F.description]: '双眼灶JZT-A/黑色玻璃面板', [F.quantity]: '1', [F.category]: '灶具', [F.channel]: '新零售', [F.workOrder]: '1300000001',
      [F.quality]: '', [F.verdict]: '不可维修', [F.processNo]: 'FYSQ026070008888', [F.production]: '淘汰', [F.location]: '4918',
    });
    expect(r.rows[1][F.verdict]).toBe('不可维修');
    expect(r.rows[2]).toMatchObject({ [F.channel]: '', [F.category]: '烟机', [F.returnType]: '退货' });
    expect(r.counts).toMatchObject({ barcodeUnits: 3, matched: 2, unmatched: 1, categoryInferred: 1 });
    // includeReason：末尾追加「报废原因」列，"/" 的原因为空
    const r2 = buildScrapLedger({ oemFiles: [], barcodeFiles: [barcodePath], lookup: { path: lookupPath }, includeReason: true });
    expect(r2.headers).toEqual([...LEDGER_HEADERS, REASON_HEADER]);
    expect(r2.rows.map((x) => x[REASON_HEADER])).toEqual(['包装破损', '', '面板油污']);
    expect(r2.rows.map((x) => x[F.verdict])).toEqual(['不可维修', '不可维修', '不可维修']);
  });

  it('两种来源合并 → 渠道×品类台数汇总 + 透视；没有金额列不虚报费用', () => {
    const r = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [barcodePath], lookup: { path: lookupPath } });
    expect(r.headers).toEqual([...LEDGER_HEADERS]);
    expect(r.counts.total).toBe(6);
    expect(r.counts.totalUnits).toBe(6);
    expect(r.amountColumn).toBeUndefined();
    expect(r.aggregateAmount).toBeNull();
    const find = (ch: string, cat: string) => r.aggregate.rows.find((x) => x.channel === ch && x.category === cat);
    expect(find('新零售', '电热水器')).toMatchObject({ count: 1, amount: 1 });
    expect(find('新零售', '灶具')).toMatchObject({ count: 2, amount: 2 });
    expect(find('线下', '电热水器')).toMatchObject({ count: 1, amount: 1 });
    expect(r.aggregate.blankChannelRows).toBe(2);
    expect(r.summaryHeaders).toHaveLength(4);
    expect(r.summary[r.summary.length - 1].slice(2)).toEqual([6, 6]);
    expect(r.pivot.headers[0]).toBeTruthy();
    expect(r.pivot.rows[r.pivot.rows.length - 1][r.pivot.headers.length - 1]).toBe(6);
    expect(r.sources.map((s) => [s.kind, s.units, s.kept])).toEqual([['oem', 6, 3], ['barcode', 3, 3]]);
  });

  it('自定义模板：按模板列序输出，多出的列留空，缺的列提示', () => {
    const tplPath = writeAoa(join(dir, '模板.xlsx'), [
      ['说明：自定义'],
      [null, '流程号', '条形码', '渠道', '产品类别', '整机数量', '备注'],
    ]);
    const r = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [], lookup: { path: lookupPath }, templatePath: tplPath });
    expect(r.templateUsed).toBe(true);
    expect(r.headers).toEqual(['流程号', '条形码', '渠道', '产品类别', '整机数量', '备注']);
    expect(r.rows[0]).toEqual({ 流程号: 'FYSQ026080009999', 条形码: 'B002', 渠道: '新零售', 产品类别: '电热水器', 整机数量: '1', 备注: '' });
    expect(r.warnings.some((w) => w.includes(F.quality))).toBe(true);
    // 认不出表头的模板 → 回默认 16 列
    const bad = writeAoa(join(dir, '坏模板.xlsx'), [['随便', '两列']]);
    const r2 = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [], lookup: { path: lookupPath }, templatePath: bad });
    expect(r2.templateUsed).toBe(false);
    expect(r2.headers).toEqual([...LEDGER_HEADERS]);
  });

  it('来源表有金额列时：台账末尾追加费用列，汇总多一列费用', () => {
    const p = writeAppraisal(join(dir, 'OEM', 'FYSQ026080009999', '2026年8月2日退乙供鉴定表（2台）.xlsx'), [
      { seq: 1, barcode: 'B002', code: 'M1', model: '电热水器DJF60-X/机械式', loc: '4901', verdict: '变形', quality: 'nq', resp: '品牌方', repair: 'no', amount: 120.5 },
      { seq: 2, barcode: 'B004', code: 'M2', model: '电热水器DDF80-Y/电脑型', loc: '4902', verdict: '变形', quality: 'nq', resp: '物流', repair: 'no', amount: 80 },
    ], true);
    const r = buildScrapLedger({ oemFiles: [p], barcodeFiles: [], lookup: { path: lookupPath } });
    expect(r.amountColumn).toBe('报废金额');
    expect(r.headers[r.headers.length - 1]).toBe(AMOUNT_HEADER);
    expect(r.rows[0][AMOUNT_HEADER]).toBe('120.5');
    expect(r.aggregateAmount?.total.amount).toBe(200.5);
    expect(r.summaryHeaders).toHaveLength(5);
    expect(r.summary[r.summary.length - 1]).toEqual(expect.arrayContaining([2, 2, 200.5]));
  });

  it('没有「汇总」sheet 时合并明细 sheet 并按条码去重；工作簿落盘 4 个 sheet', () => {
    const wb = XLSX.utils.book_new();
    const header = ['序号', '退货时间', '条形码', '成品的\n物料编码', '产品\n型号', '库位', '数量', '鉴定结果', '责任鉴定', null, '是否\n可以维修', null];
    const sub = [null, null, null, null, null, null, null, null, '品牌方', '供应商', '可维修', '不可维修'];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['报告'], header, sub, [1, '2026-07-10', 'D001', 'M9', '电热水器X', '4901', 1, '好的', 1, null, 1, null], ['合计']] as any), '可返修');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['报告'], header, sub, [1, '2026-07-10', 'D002', 'M9', '电热水器X', '4901', 1, '坏了', 1, null, null, 1], [2, '2026-07-10', 'D001', 'M9', '电热水器X', '4901', 1, '好的', 1, null, 1, null], ['合计']] as any), '不可返修');
    const p = join(dir, 'OEM', 'FYSQ026080009999', '退丙供鉴定表.xlsx');
    XLSX.writeFile(wb, p);
    const parsed = parseOemAppraisal(p);
    expect(parsed.sheetsUsed).toEqual(['可返修', '不可返修']);
    expect(parsed.units).toHaveLength(2);
    expect(parsed.warnings.some((w) => w.includes('1'))).toBe(true);
    const r = buildScrapLedger({ oemFiles: [p], barcodeFiles: [barcodePath], lookup: null });
    expect(r.counts).toMatchObject({ oemUnits: 2, oemKept: 1, total: 4, matched: 0, unmatched: 4 });
    expect(r.rows[0][F.quality]).toBe('品牌方不可维修'); // 没有质量鉴定组
    expect(r.rows[0][F.returnDate]).toBe('2026-07-10');
    const outPath = join(dir, 'out.xlsx');
    writeScrapLedgerWorkbook(outPath, r);
    const back = XLSX.readFile(outPath);
    expect(back.SheetNames).toHaveLength(4);
    const unmatched = XLSX.utils.sheet_to_json<unknown[]>(back.Sheets[back.SheetNames[3]], { header: 1 });
    expect(unmatched).toHaveLength(5);
    const ledger = XLSX.utils.sheet_to_json<Record<string, unknown>>(back.Sheets[back.SheetNames[0]]);
    expect(typeof ledger[0][F.quantity]).toBe('number');
  });

  it('空输入 / 坏文件报可读错误', () => {
    expect(() => buildScrapLedger({ oemFiles: [], barcodeFiles: [] })).toThrow();
    const junk = writeAoa(join(dir, 'junk.xlsx'), [['a', 'b'], [1, 2]]);
    expect(() => parseOemAppraisal(junk)).toThrow(/条形码/);
    expect(() => parseScrapBarcodes(junk)).toThrow(/条码/);
  });
});

// ── 审查修复（P1-1 / P1-2 / P2-4 ~ P2-7 / P2-9 / P3-11 / P3-15） ────────────────

describe('报废台账 8.21 · 审查修复', () => {
  let dir: string;
  let oemPath: string;
  let barcodePath: string;
  let lookupPath: string;
  const header = ['序号', '退货时间', '条形码', '成品的\n物料编码', '产品\n型号', '库位', '数量', '鉴定结果', '质量鉴定', null, '责任鉴定', null, null, '是否\n可以维修', null];
  const sub = [null, null, null, null, null, null, null, null, '质量问题', '非质量问题', '物流', '品牌方', '供应商', '可维修', '不可维修'];
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'ss-scrap-review-'));
    const oemDir = join(dir, 'OEM', 'FYSQ026080009999');
    const bcDir = join(dir, '拆零', 'FYSQ026070008888');
    mkdirSync(oemDir, { recursive: true });
    mkdirSync(bcDir, { recursive: true });
    oemPath = writeAppraisal(join(oemDir, '2026年8月1日退甲供鉴定表（2台）.xlsx'), [
      { seq: 1, barcode: 'B001', code: 'M1', model: '电热水器DJF60-X/机械式', loc: '4901', verdict: '变形', quality: 'nq', resp: '品牌方', repair: 'no' },
      { seq: 2, barcode: 'B002', code: 'M1', model: '电热水器DJF60-X/机械式', loc: '4901', verdict: '纸箱破损', quality: 'nq', resp: '物流', repair: 'ok' },
    ]);
    barcodePath = writeAoa(join(bcDir, '报废条码(2).xlsx'), [
      ['序号', '上线类型', '工单编码', '标签编码', '产品编码', '产品名称', '鉴定结果', '不良/报废原因', '性能不良', '在产情况', '使用情况', '库位'],
      [1, '残次', 1300000001, 'C001', '1AD0001', '双眼灶JZT-A/黑色玻璃面板', '不可维修', '包装破损', '/', '淘汰', '新机', '4918'],
      [2, '/', 1300000002, 'C002', '1AD0002', '双眼灶JZY-B/黑色玻璃面板', '不可维修', '/', '/', '/', '使用过', '4918'],
    ]);
    lookupPath = writeAoa(join(dir, '渠道匹配对照表.xlsx'), [
      ['条形码', '成品物料编码', '产品型号', '渠道', '产品类型'],
      ['B001', 'M1', '电热水器DJF60-X/机械式', '新零售', '电热水器'],
      ['C001', '1AD0001', '双眼灶JZT-A/黑色玻璃面板', '新零售', '灶具'],
    ]);
  });
  afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

  it('P1-1 放错框：鉴定表进「报废条码」框 / 条码表进「鉴定表」框 / 对照表进任一框 → 抛清晰错误而不是静默记入', () => {
    expect(() => parseScrapBarcodes(oemPath)).toThrow(WrongSourceKindError);
    expect(() => parseScrapBarcodes(oemPath)).toThrow(/是 OEM 鉴定表.*鉴定表」框/);
    expect(() => parseOemAppraisal(barcodePath)).toThrow(/是拆零「报废条码」表.*报废条码」框/);
    expect(() => parseOemAppraisal(lookupPath)).toThrow(/是渠道对照表.*对照表框/);
    expect(() => parseScrapBarcodes(lookupPath)).toThrow(/是渠道对照表.*对照表框/);
    expect(() => buildScrapLedger({ oemFiles: [], barcodeFiles: [oemPath], lookup: { path: lookupPath } })).toThrow(/是 OEM 鉴定表/);
    // 放对了照常
    expect(parseScrapBarcodes(barcodePath).units).toHaveLength(2);
    expect(parseOemAppraisal(oemPath).units).toHaveLength(2);
  });

  it('P1-2 预识别：逐文件给供应商 / 流程号 / 台数 / 错误；手工补填透传到台账', () => {
    const loose = writeAoa(join(dir, '报废条码(1).xlsx'), [
      ['序号', '上线类型', '工单编码', '标签编码', '产品编码', '产品名称', '鉴定结果', '不良/报废原因'],
      [1, '残次', 1300000009, 'C009', '1AD0009', '双眼灶JZT-Z', '不可维修', '磕碰'],
    ]);
    const noName = writeAppraisal(join(dir, '鉴定表.xlsx'), [
      { seq: 1, barcode: 'B009', code: 'M9', model: '电热水器X', loc: '4901', verdict: '变形', quality: 'nq', resp: '品牌方', repair: 'no' },
    ]);
    const junk = writeAoa(join(dir, 'junk.xlsx'), [['a', 'b'], [1, 2]]);
    const insp = inspectScrapSources({ oemFiles: [oemPath, noName, junk], barcodeFiles: [barcodePath, loose] });
    expect(insp.sources.map((s) => [s.kind, s.fileName, s.supplier ?? '', s.processNo, s.units, s.kept, Boolean(s.error)])).toEqual([
      ['oem', '2026年8月1日退甲供鉴定表（2台）.xlsx', '甲供', 'FYSQ026080009999', 2, 1, false],
      ['oem', '鉴定表.xlsx', '', '', 1, 1, false],          // 文件名 / 目录名都认不出 → 空，界面给补填框
      ['oem', 'junk.xlsx', '', '', 0, 0, true],
      ['barcode', '报废条码(2).xlsx', '', 'FYSQ026070008888', 2, 2, false],
      ['barcode', '报废条码(1).xlsx', '', '', 1, 1, false],  // 不在流程号目录（浏览器下载记录导入的就是这样）
    ]);
    expect(insp.sources[2].error).toMatch(/条形码/);
    expect(insp.warnings.some((w) => w.includes('鉴定表.xlsx') && w.includes('供应商'))).toBe(true);
    // 补填：预识别与台账都按 supplierByFile / processNoByFile 生效
    const fills = { supplierByFile: { [noName]: '乙供' }, processNoByFile: { [noName]: 'FYSQ026080000001', [loose]: 'FYSQ026070000002' } };
    const insp2 = inspectScrapSources({ oemFiles: [noName], barcodeFiles: [loose], ...fills });
    expect(insp2.sources[0]).toMatchObject({ supplier: '乙供', processNo: 'FYSQ026080000001' });
    expect(insp2.sources[1]).toMatchObject({ processNo: 'FYSQ026070000002' });
    expect(insp2.warnings.some((w) => w.includes('供应商') || w.includes('流程号'))).toBe(false);
    const r = buildScrapLedger({ oemFiles: [noName], barcodeFiles: [loose], lookup: null, ...fills });
    expect(r.rows.map((x) => [x[F.maker], x[F.processNo]])).toEqual([['乙供', 'FYSQ026080000001'], ['自制', 'FYSQ026070000002']]);
    // 空字符串 = 没填，回落推断（不能把识别出来的清成空）
    const r2 = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [], lookup: null, supplierByFile: { [oemPath]: '' }, processNoByFile: { [oemPath]: '  ' } });
    expect(r2.rows[0]).toMatchObject({ [F.maker]: '甲供', [F.processNo]: 'FYSQ026080009999' });
  });

  it('P2-4 「合计/小计」行在中间：跳过而不是截断，后半段不丢', () => {
    const p = writeAoa(join(dir, 'OEM', 'FYSQ026080009999', '退丁供鉴定表（中间小计）.xlsx'), [
      ['报告'], header, sub,
      [1, '2026-07-10', 'E001', 'M1', '电热水器X', '4901', 1, '变形', null, 1, null, 1, null, null, 1],
      ['小计', null, null, null, null, null, 1],
      [2, '2026-07-10', 'E002', 'M1', '电热水器X', '4901', 1, '变形', null, 1, null, 1, null, null, 1],
      ['合计', null, null, null, null, null, 2],
      [3, '2026-07-10', 'E003', 'M1', '电热水器X', '4901', 1, '变形', null, 1, null, 1, null, null, 1],
    ], '汇总');
    const parsed = parseOemAppraisal(p);
    expect(parsed.units.map((u) => u.barcode)).toEqual(['E001', 'E002', 'E003']);
    const bc = writeAoa(join(dir, '拆零', 'FYSQ026070008888', '报废条码(合计在中间).xlsx'), [
      ['序号', '上线类型', '工单编码', '标签编码', '产品编码', '产品名称', '鉴定结果', '不良/报废原因'],
      [1, '残次', 1, 'G001', '1AD1', '灶A', '不可维修', 'x'],
      ['合计', null, null, null, null, null, null, null],
      [2, '残次', 2, 'G002', '1AD2', '灶B', '不可维修', 'y'],
    ]);
    expect(parseScrapBarcodes(bc).units.map((u) => u.barcode)).toEqual(['G001', 'G002']);
  });

  it('P2-5 「汇总」sheet 有名无实（没有条形码表头）→ 回退明细 sheet，不整份拒掉', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['本次退回共 2 台，明细见后页'], ['可返修 1', '不可返修 1']] as any), '汇总');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['报告'], header, sub, [1, '2026-07-10', 'H001', 'M1', '电热水器X', '4901', 1, '好的', null, 1, null, 1, null, 1, null], ['合计']] as any), '可返修');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['报告'], header, sub, [1, '2026-07-10', 'H002', 'M1', '电热水器X', '4901', 1, '坏了', null, 1, null, 1, null, null, 1], ['合计']] as any), '不可返修');
    const p = join(dir, 'OEM', 'FYSQ026080009999', '退戊供鉴定表（假汇总）.xlsx');
    XLSX.writeFile(wb, p);
    const parsed = parseOemAppraisal(p);
    expect(parsed.sheetsUsed).toEqual(['可返修', '不可返修']);
    expect(parsed.units.map((u) => u.barcode)).toEqual(['H001', 'H002']);
    expect(parsed.warnings.some((w) => w.includes('汇总') && w.includes('明细'))).toBe(true);
    const r = buildScrapLedger({ oemFiles: [p], barcodeFiles: [], lookup: null });
    expect(r.counts).toMatchObject({ oemUnits: 2, oemKept: 1 });
    expect(r.rows[0][F.barcode]).toBe('H002');
    // 汇总 sheet 是唯一 sheet 且没表头 → 仍然报「没找到表头」
    const only = writeAoa(join(dir, 'OEM', 'FYSQ026080009999', '退己供鉴定表（只有假汇总）.xlsx'), [['说明'], ['x']], '汇总');
    expect(() => parseOemAppraisal(only)).toThrow(/条形码/);
  });

  it('P2-6 勾选格写着列名文字（「不可维修」「品牌方」「非质量问题」）也算勾，不被「不」字头判成未勾', () => {
    const p = writeAoa(join(dir, 'OEM', 'FYSQ026080009999', '退庚供鉴定表（文字勾选）.xlsx'), [
      ['报告'], header, sub,
      [1, '2026-07-10', 'T001', 'M1', '电热水器X', '4901', 1, '变形', null, '非质量问题', null, '品牌方', null, null, '不可维修'],
      [2, '2026-07-10', 'T002', 'M1', '电热水器X', '4901', 1, '变形', '质量问题', null, null, null, '供应商', null, '不可维修'],
      [3, '2026-07-10', 'T003', 'M1', '电热水器X', '4901', 1, '好的', null, '非质量问题', '物流', null, null, '可维修', null],
      [4, '2026-07-10', 'T004', 'M1', '电热水器X', '4901', 1, '变形', null, '非质量问题', null, '品牌方', null, '否', '是'],
      [5, '2026-07-10', 'T005', 'M1', '电热水器X', '4901', 1, '好的', null, '非质量问题', null, '品牌方', null, '√', '/'],
    ], '汇总');
    const parsed = parseOemAppraisal(p);
    expect(parsed.units.map((u) => [u.barcode, u.unrepairable, u.supplierResponsible, u.responsibilityLabel, u.qualityLabel])).toEqual([
      ['T001', true, false, '品牌方', '非质量问题'],
      ['T002', true, true, '供应商', '质量问题'],
      ['T003', false, false, '物流', '非质量问题'],
      ['T004', true, false, '品牌方', '非质量问题'],
      ['T005', false, false, '品牌方', '非质量问题'],
    ]);
    expect(parsed.warnings.some((w) => w.includes('既没勾'))).toBe(false);
    const r = buildScrapLedger({ oemFiles: [p], barcodeFiles: [], lookup: null });
    expect(r.rows.map((x) => [x[F.barcode], x[F.quality]])).toEqual([['T001', '品牌方非质量问题不可维修'], ['T004', '品牌方非质量问题不可维修']]);
  });

  it('P2-7 子表头写成「不可以维修」认得出；只有「可维修」列时没勾 = 不可维修，整张不再 0 行记入', () => {
    const sub2 = [...sub]; sub2[14] = '不可以维修';
    const p1 = writeAoa(join(dir, 'OEM', 'FYSQ026080009999', '退辛供鉴定表（不可以维修）.xlsx'), [
      ['报告'], header, sub2,
      [1, '2026-07-10', 'U001', 'M1', '电热水器X', '4901', 1, '变形', null, 1, null, 1, null, null, 1],
      [2, '2026-07-10', 'U002', 'M1', '电热水器X', '4901', 1, '好的', null, 1, null, 1, null, 1, null],
    ], '汇总');
    const r1 = buildScrapLedger({ oemFiles: [p1], barcodeFiles: [], lookup: null });
    expect(r1.counts).toMatchObject({ oemUnits: 2, oemKept: 1, oemDroppedRepairable: 1 });
    expect(r1.rows[0]).toMatchObject({ [F.barcode]: 'U001', [F.quality]: '品牌方非质量问题不可以维修' });
    // 「不可维修」列整个不存在，只剩「可维修」：没勾可维修的按不可维修记，并提示
    const header3 = header.slice(0, 14); const sub3 = sub.slice(0, 14);
    const p2 = writeAoa(join(dir, 'OEM', 'FYSQ026080009999', '退壬供鉴定表（只有可维修列）.xlsx'), [
      ['报告'], header3, sub3,
      [1, '2026-07-10', 'V001', 'M1', '电热水器X', '4901', 1, '变形', null, 1, null, 1, null, null],
      [2, '2026-07-10', 'V002', 'M1', '电热水器X', '4901', 1, '好的', null, 1, null, 1, null, 1],
      [3, '2026-07-10', 'V003', 'M1', '电热水器X', '4901', 1, '坏', 1, null, null, null, 1, null],
    ], '汇总');
    const parsed = parseOemAppraisal(p2);
    expect(parsed.warnings.some((w) => w.includes('没勾') && w.includes('不可维修'))).toBe(true);
    const r2 = buildScrapLedger({ oemFiles: [p2], barcodeFiles: [], lookup: null });
    expect(r2.counts).toMatchObject({ oemUnits: 3, oemKept: 1, oemDroppedRepairable: 1, oemDroppedSupplier: 1 });
    expect(r2.rows[0]).toMatchObject({ [F.barcode]: 'V001', [F.quality]: '品牌方非质量问题不可维修' });
  });

  it('P2-9 目录列举：depth 往下钻子目录，隐藏目录 / Office 锁文件跳过，有上限', () => {
    const root = join(dir, 'pack');
    mkdirSync(join(root, 'OEM报废', 'FYSQ026080000001'), { recursive: true });
    mkdirSync(join(root, '拆零报废', 'FYSQ026070000001', 'deeper'), { recursive: true });
    mkdirSync(join(root, '.hidden'), { recursive: true });
    const touch = (p: string) => writeAoa(p, [['a'], [1]]);
    touch(join(root, '渠道匹配对照表.xlsx'));
    touch(join(root, '报废台账模板.xlsx'));
    touch(join(root, '~$报废台账模板.xlsx'));
    touch(join(root, 'OEM报废', 'FYSQ026080000001', '退甲供鉴定表.xlsx'));
    touch(join(root, '拆零报废', 'FYSQ026070000001', '报废条码(1).xls'));
    touch(join(root, '拆零报废', 'FYSQ026070000001', 'deeper', '太深.xlsx'));
    touch(join(root, '.hidden', '隐藏.xlsx'));
    const names = (list: string[]) => list.map((p) => p.slice(root.length + 1)).sort();
    expect(names(listSpreadsheetFiles(root, 0))).toEqual(['报废台账模板.xlsx', '渠道匹配对照表.xlsx']);
    expect(names(listSpreadsheetFiles(root, 1))).toEqual(['报废台账模板.xlsx', '渠道匹配对照表.xlsx']);
    expect(names(listSpreadsheetFiles(root, 2))).toEqual(['OEM报废/FYSQ026080000001/退甲供鉴定表.xlsx', '报废台账模板.xlsx', '拆零报废/FYSQ026070000001/报废条码(1).xls', '渠道匹配对照表.xlsx'].sort());
    expect(names(listSpreadsheetFiles(root, 3))).toContain('拆零报废/FYSQ026070000001/deeper/太深.xlsx');
    expect(listSpreadsheetFiles(root, 3, 2)).toHaveLength(2);
    expect(listSpreadsheetFiles(join(root, '不存在'), 2)).toEqual([]);
  });

  it('P3-11 拆零「上线类型 / 在产情况 / 原因」为「/」→ 空，不原样落进台账', () => {
    const r = buildScrapLedger({ oemFiles: [], barcodeFiles: [barcodePath], lookup: { path: lookupPath }, includeReason: true });
    expect(r.rows[0]).toMatchObject({ [F.returnType]: '残次', [F.production]: '淘汰', [REASON_HEADER]: '包装破损' });
    expect(r.rows[1]).toMatchObject({ [F.returnType]: '', [F.production]: '', [REASON_HEADER]: '', [F.verdict]: '不可维修' });
  });

  it('Excel 类型与模板一致：工单编码数值（前导零 / 带字母保持文本）、流程发起日期 / 退货时间真日期格、条形码 / 成品编码文本、自定义模板列名也生效', () => {
    const bc = writeAoa(join(dir, '拆零', 'FYSQ026070008888', '报废条码(类型).xlsx'), [
      ['序号', '上线类型', '工单编码', '标签编码', '产品编码', '产品名称', '鉴定结果', '不良/报废原因', '在产情况', '库位'],
      [1, '残次', 1300013837, '1012502039759', '1AD0006830', '双眼灶JZY-8T201/黑色玻璃面板20Y', '不可维修', '包装破损', '淘汰', '4918'],
      [2, '残次', '0012345', '1012502039760', '1AD0006830', '双眼灶JZY-8T201/黑色玻璃面板20Y', '不可维修', '包装破损', '淘汰', '4918'],
      [3, '残次', 'GD-778', '1012502039761', '1AD0006830', '双眼灶JZY-8T201/黑色玻璃面板20Y', '不可维修', '包装破损', '淘汰', '4918'],
    ]);
    const r = buildScrapLedger({ oemFiles: [oemPath], barcodeFiles: [bc], lookup: { path: lookupPath }, startDate: '2026-08-01' });
    const p = join(dir, '类型.xlsx');
    writeScrapLedgerWorkbook(p, r);
    const wb = XLSX.readFile(p, { cellDates: true });
    const back = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: null }) as unknown[][];
    const col = (name: string) => (back[0] as string[]).indexOf(name);
    const ymdOf = (v: unknown) => (v instanceof Date ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}` : v);
    // 行 1 = OEM（B001 记入），行 2~4 = 拆零
    expect(ymdOf(back[1][col(F.startDate)])).toBe('2026-08-01');
    expect(ymdOf(back[1][col(F.returnDate)])).toBe('2026-07-10');
    expect(back[2][col(F.returnDate)]).toBeNull();
    expect(back[2][col(F.workOrder)]).toBe(1300013837);
    expect(back[3][col(F.workOrder)]).toBe('0012345');
    expect(back[4][col(F.workOrder)]).toBe('GD-778');
    expect(back[2][col(F.barcode)]).toBe('1012502039759');
    expect(back[2][col(F.materialCode)]).toBe('1AD0006830');
    expect(back[2][col(F.quantity)]).toBe(1);
    // 自定义模板把「工单编码」叫「工单号」：按映射仍转数值
    const tpl = writeAoa(join(dir, '模板-工单号.xlsx'), [[null, '流程发起日期', '条形码', '工单号', '整机数量']]);
    const r2 = buildScrapLedger({ oemFiles: [], barcodeFiles: [bc], lookup: { path: lookupPath }, templatePath: tpl, startDate: '2026-08-01' });
    expect(r2.headers).toEqual(['流程发起日期', '条形码', '工单号', '整机数量']);
    const p2 = join(dir, '类型2.xlsx');
    writeScrapLedgerWorkbook(p2, r2);
    const wb2 = XLSX.readFile(p2, { cellDates: true });
    const back2 = XLSX.utils.sheet_to_json<unknown[]>(wb2.Sheets[wb2.SheetNames[0]], { header: 1, raw: true, defval: null }) as unknown[][];
    expect(ymdOf(back2[1][0])).toBe('2026-08-01');
    expect(back2[1].slice(1)).toEqual(['1012502039759', 1300013837, 1]);
  });

  it('P3-15 输出文件名带时分；写失败时 EBUSY/EPERM 提示先关掉已打开的台账', () => {
    expect(scrapOutputStamp(new Date(2026, 8, 3, 9, 5))).toBe('2026-09-03-0905');
    expect(scrapOutputStamp(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31-2359');
    const busy = Object.assign(new Error("EBUSY: resource busy or locked, open 'C:\\x\\报废台账-2026-09-03-0905.xlsx'"), { code: 'EBUSY' });
    const msg = describeLedgerWriteError(busy, 'C:\\x\\报废台账-2026-09-03-0905.xlsx');
    expect(msg).toContain('关闭');
    expect(msg).toContain('报废台账-2026-09-03-0905.xlsx');
    expect(msg).not.toContain('C:\\x');
    expect(describeLedgerWriteError(Object.assign(new Error('x'), { code: 'EPERM' }), '/a/b.xlsx')).toContain('关闭');
    expect(describeLedgerWriteError(new Error('The process cannot access the file because it is being used by another process'), '/a/b.xlsx')).toContain('关闭');
    const other = describeLedgerWriteError(new Error('disk full'), '/a/b.xlsx');
    expect(other).toContain('b.xlsx');
    expect(other).toContain('disk full');
    expect(other).not.toContain('关闭');
  });
});
