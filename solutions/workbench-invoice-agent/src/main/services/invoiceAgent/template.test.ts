import { describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import AdmZip from 'adm-zip';
import * as XLSX from 'xlsx';
import type { IvDraft } from '@totalclaw/ipc-contracts';
import { ETAX, etaxBatchProblems, etaxBatchSheets } from './logic';
import { appendRows, colLetter, readTemplateVersion, writeEtaxImport } from './template';

/** 应用自带的官方模板（2026-10-10 从吉林电子税务局批量开票页下载的 V260401 版原文件） */
const OFFICIAL = resolve(__dirname, '../../../../../../resources/invoice-agent/etax-batch-template-V260401.xlsx');

const draft = (over: Partial<IvDraft> = {}): IvDraft => ({
  id: 'd1', batchId: 'b', serial: '26101005240001', kind: 'normal', buyerName: '甲科技有限公司', buyerTaxNo: '91350100M000100Y43', buyerAddress: '长春市某路 1 号', buyerPhone: '0431-1',
  buyerBank: '工行', buyerBankAccount: '0012345678', email: 'a@jia.cn', mobile: '', personal: false, amount: 150, tax: 19.5, total: 169.5, remark: '订单号：A1 <&>', orderNos: ['A1'],
  status: 'confirmed', issues: [], updatedAt: '',
  lines: [{ itemName: '键盘', taxCode: '1090511010000000000', shortName: '', spec: 'K-1', unit: '个', qty: 3, price: 50, amount: 150, tax: 19.5, total: 169.5, taxRate: 0.13, rowIds: [] }],
  ...over,
});
const read = (file: string, sheet: string): string[][] => XLSX.utils.sheet_to_json<string[]>(XLSX.read(readFileSync(file), { type: 'buffer' }).Sheets[sheet], { header: 1, defval: '', raw: true });

describe('官方批量导入模板', () => {
  it('自带的模板就是官方原文件：表名、第 3 行列名、版本', () => {
    expect(existsSync(OFFICIAL)).toBe(true);
    const wb = XLSX.read(readFileSync(OFFICIAL), { type: 'buffer', sheets: [ETAX.baseName, ETAX.detailName] });
    expect(wb.SheetNames).toEqual(expect.arrayContaining([ETAX.baseName, ETAX.detailName, '3-特定业务信息', '4-附加要素信息', 'excelVersion']));
    const base = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[ETAX.baseName], { header: 1, defval: '' });
    const detail = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[ETAX.detailName], { header: 1, defval: '' });
    expect(String(base[0][0])).toContain('填表说明');
    expect(base[2].slice(0, 7)).toEqual(['发票流水号', '发票类型', '特定业务类型', '是否含税', '受票方自然人标识', '购买方名称', '购买方纳税人识别号']);
    expect(base[2]).toHaveLength(39);
    expect(detail[2]).toEqual(['发票流水号', '项目名称', '商品和服务税收编码', '规格型号', '单位', '数量', '单价', '金额', '税率', '折扣金额', '是否使用优惠政策', '优惠政策类型', '即征即退类型', '煤炭种类']);
    // 我们要写的每一列在官方模板里都有同名的列
    for (const h of ETAX.base) expect(base[2]).toContain(h);
    for (const h of ETAX.detail) expect(detail[2]).toContain(h);
    expect(readTemplateVersion(readFileSync(OFFICIAL))).toBe('pt:20260401');
  });

  it('只往两张表追加数据行，其它内容一个字节不动', () => {
    const dir = mkdtempSync(join(tmpdir(), 'iv-tpl-'));
    try {
      const out = join(dir, 'out.xlsx');
      const drafts = [draft(), draft({ id: 'd2', serial: '26101005240002', buyerName: '张三', buyerTaxNo: '', personal: true, email: '', buyerAddress: '', buyerPhone: '', buyerBank: '', buyerBankAccount: '', remark: '',
        lines: [{ ...draft().lines[0], itemName: '鼠标', qty: 0, price: 0, amount: 29.5, tax: 3.83, total: 33.33 }, { ...draft().lines[0], itemName: '鼠标垫', qty: 2, amount: 17.7, tax: 2.3, total: 20 }] })];
      const r = writeEtaxImport(out, etaxBatchSheets(drafts), OFFICIAL);
      expect(r).toMatchObject({ usedOfficial: true, unplaced: [], templateVersion: 'pt:20260401' });
      expect(r.unfilled).toContain('1-发票基本信息 · 特定业务类型');

      const base = read(out, ETAX.baseName);
      expect(base).toHaveLength(5);
      expect(String(base[0][0])).toContain('填表说明');
      const col = (name: string) => base[2].indexOf(name);
      expect(base[3][col('发票流水号')]).toBe('26101005240001');
      expect(base[3][col('发票类型')]).toBe('普通发票');
      expect(base[3][col('是否含税')]).toBe('是');
      expect(base[3][col('受票方自然人标识')]).toBe('否');
      expect(base[3][col('购买方纳税人识别号')]).toBe('91350100M000100Y43');
      expect(base[3][col('购买方银行账号')]).toBe('0012345678'); // 文本，前导零还在
      expect(base[3][col('是否展示购买方地址电话银行账号')]).toBe(''); // 名字相近的列没有被误填
      expect(base[3][col('备注')]).toBe('订单号：A1 <&>');
      expect(base[3][col('购买方邮箱')]).toBe('a@jia.cn');
      expect(base[4][col('受票方自然人标识')]).toBe('是');
      expect(base[4][col('购买方纳税人识别号')]).toBe('');

      const detail = read(out, ETAX.detailName);
      expect(detail).toHaveLength(6);
      const dc = (name: string) => detail[2].indexOf(name);
      expect([detail[3][dc('数量')], detail[3][dc('单价')], detail[3][dc('金额')], detail[3][dc('税率')], detail[3][dc('商品和服务税收编码')]]).toEqual(['3', '56.5', '169.50', '0.13', '1090511010000000000']);
      expect([detail[4][dc('数量')], detail[4][dc('单价')], detail[4][dc('金额')]]).toEqual(['', '', '33.33']);
      expect(detail.slice(3).map((x) => x[0])).toEqual(['26101005240001', '26101005240002', '26101005240002']);

      // 除了两张表的数据行，压缩包里其它文件与官方原文件完全一样
      const a = new AdmZip(OFFICIAL); const b = new AdmZip(out);
      const names = a.getEntries().map((e) => e.entryName);
      expect(b.getEntries().map((e) => e.entryName).sort()).toEqual([...names].sort());
      const changed = names.filter((n) => !a.readFile(n)!.equals(b.readFile(n)!));
      expect(changed.sort()).toEqual(['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet6.xml']);
      // 改过的表里，数据校验等原有内容还在
      const s1a = a.readAsText('xl/worksheets/sheet1.xml'); const s1b = b.readAsText('xl/worksheets/sheet1.xml');
      expect((s1b.match(/<dataValidation /g) || []).length).toBe((s1a.match(/<dataValidation /g) || []).length);
      expect(s1b.replace(/<row r="[45]">[\s\S]*?<\/row>/g, '')).toBe(s1a);
      expect(s1b).toContain('&lt;&amp;&gt;');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('没有模板时写三行表头结构，并如实标记没用官方模板', () => {
    const dir = mkdtempSync(join(tmpdir(), 'iv-tpl-'));
    try {
      const out = join(dir, 'plain.xlsx');
      expect(writeEtaxImport(out, etaxBatchSheets([draft()])).usedOfficial).toBe(false);
      const base = read(out, ETAX.baseName);
      expect(base[2]).toEqual(ETAX.base);
      expect(base[3][0]).toBe('26101005240001');
      expect(writeEtaxImport(join(dir, 'x.xlsx'), etaxBatchSheets([draft()]), join(dir, '不存在.xlsx')).usedOfficial).toBe(false);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('列字母、追加行、整批检查', () => {
    expect([0, 25, 26, 38, 701, 702].map(colLetter)).toEqual(['A', 'Z', 'AA', 'AM', 'ZZ', 'AAA']);
    const xml = '<worksheet><sheetData><row r="1"><c r="A1"/></row><row r="3" spans="1:2"><c r="A3" t="s"><v>0</v></c></row><row r="4"><c r="A4"><v>示例</v></c></row></sheetData><x/></worksheet>';
    const out = appendRows(xml, 3, [['a', '', 'c']]);
    expect(out).toBe('<worksheet><sheetData><row r="1"><c r="A1"/></row><row r="3" spans="1:2"><c r="A3" t="s"><v>0</v></c></row><row r="4"><c r="A4" t="inlineStr"><is><t xml:space="preserve">a</t></is></c><c r="C4" t="inlineStr"><is><t xml:space="preserve">c</t></is></c></row></sheetData><x/></worksheet>');
    expect(etaxBatchProblems([draft(), draft()]).map((i) => i.code)).toEqual(['serial_dup']);
    expect(etaxBatchProblems([draft({ serial: 'x'.repeat(21) })]).map((i) => i.code)).toEqual(['serial_long']);
    const many = draft({ lines: Array.from({ length: 2001 }, () => draft().lines[0]) });
    expect(etaxBatchProblems([many]).map((i) => `${i.level}:${i.code}`)).toEqual(['warning:many_lines']);
  });
});
