/**
 * 正式件生成：产出的必须是**真能打开**的 Office 文件，不是改了扩展名的文本。
 *
 * 重点验三件事：
 *   xlsx 里报价行是**公式**（客户改数量能自己重算），不是算死的数字
 *   docx 是合法 OOXML 包（zip 里有 [Content_Types].xml 与 word/document.xml）
 *   未审批时水印**画进文件内部**，不是只写在文件名上
 */
import { describe, it, expect, vi } from 'vitest';

// BrowserWindow 只在 PDF 路径用到；这里不测 PDF（要真 Electron 环境），mock 掉避免 import 失败
vi.mock('electron', () => ({ BrowserWindow: class {} }));

import { buildEml, buildOutputHtml, buildProposalDocx, buildQuotationXlsx } from './saudiOutputBuilder';

const ctx = {
  title: '正式报价 · Nexa Gulf',
  customer: 'Nexa Gulf Integrated Solutions',
  project: '吉达物流园区安防与网络',
  ruleVersion: 'v1.4',
  draft: true,
  bom: [
    { sku: 'IPC-4K-BLT-30', description: '室外筒机 4K', qty: 60, unit: '台', unitCost: 7450 },
    { sku: 'NVR-64CH-R5', description: '64 路 NVR', qty: 2, unit: '台', unitCost: 21500 },
  ],
  calcLines: [
    { label: '设备采购', formula: 'Σ(数量 × 单价)', result: 490000, currency: 'SAR' },
    { label: '目标毛利 18%', formula: '成本合计 × 目标毛利率', result: 98000, currency: 'SAR' },
  ],
  priceRange: { low: 700000, high: 760000 },
  fields: [{ label: '交货地点', value: '吉达 Jeddah' }],
  sections: [{ title: '执行摘要', body: '第一行\n第二行' }],
};

describe('Excel 报价表', () => {
  it('行小计与合计是公式，不是算死的数字', async () => {
    const buffer = await buildQuotationXlsx(ctx);
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    // 找到带公式的单元格
    const formulaCells = Object.keys(sheet)
      .filter((k) => !k.startsWith('!') && sheet[k]?.f)
      .map((k) => sheet[k].f as string);
    expect(formulaCells.some((f) => /^D\d+\*F\d+$/.test(f))).toBe(true);   // 行小计 = 数量 × 单价
    expect(formulaCells.some((f) => /^SUM\(G\d+:G\d+\)$/.test(f))).toBe(true); // 合计
  });

  it('未审批时首行有 DRAFT 警示，sheet 名也带 DRAFT', async () => {
    const buffer = await buildQuotationXlsx(ctx);
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    expect(wb.SheetNames[0]).toContain('DRAFT');
    expect(String(wb.Sheets[wb.SheetNames[0]].A1?.v ?? '')).toContain('DRAFT');
  });

  it('已审批时不带 DRAFT', async () => {
    const buffer = await buildQuotationXlsx({ ...ctx, draft: false });
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    expect(wb.SheetNames[0]).not.toContain('DRAFT');
    expect(String(wb.Sheets[wb.SheetNames[0]].A1?.v ?? '')).not.toContain('DRAFT');
  });

  it('成本页每行都带公式文本（客户看得见依据）', async () => {
    const buffer = await buildQuotationXlsx({ ...ctx, draft: false });
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const costSheet = wb.Sheets[wb.SheetNames[1]];
    const text = XLSX.utils.sheet_to_csv(costSheet);
    expect(text).toContain('Σ(数量 × 单价)');
    expect(text).toContain('成本合计 × 目标毛利率');
  });
});

describe('折扣列（只在真有折扣时才出现）', () => {
  const withDiscount = {
    ...ctx,
    draft: false,
    bom: [{ sku: 'IPC-4K-BLT-30', description: '室外筒机 4K', qty: 60, unit: '台', unitCost: 7450, discount: 0.9 }],
  };

  it('有折扣时行小计公式带上折扣列', async () => {
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(await buildQuotationXlsx(withDiscount), { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const formulas = Object.keys(sheet).filter((k) => !k.startsWith('!') && sheet[k]?.f).map((k) => sheet[k].f);
    expect(formulas.some((f: string) => /^D\d+\*F\d+\*G\d+$/.test(f))).toBe(true);
    expect(formulas.some((f: string) => /^SUM\(H\d+:H\d+\)$/.test(f))).toBe(true);
    expect(XLSX.utils.sheet_to_csv(sheet)).toContain('折扣率');
  });

  it('没折扣时不摆一列全 1 的折扣（客户会以为是漏填）', async () => {
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(await buildQuotationXlsx({ ...ctx, draft: false }), { type: 'buffer' });
    expect(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])).not.toContain('折扣率');
  });

  it('折扣行的缓存值 = 数量 × 单价 × 折扣（没点重算也能看到正确数）', async () => {
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(await buildQuotationXlsx(withDiscount), { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const cell = Object.keys(sheet).find((k) => /^H\d+$/.test(k) && sheet[k]?.f?.includes('*G'));
    expect(sheet[cell!].v).toBe(60 * 7450 * 0.9);
  });
});

describe('来源标注（P0-2）', () => {
  const withSource = {
    ...ctx,
    draft: false,
    validationNote: '12/12 项通过',
    provenance: {
      sources: [{
        name: 'Etimad 公开标讯（快照）',
        url: 'https://tenders.etimad.sa/Tender/Detail/123',
        fetchedAt: '2026-08-13T21:04:00Z',
        kind: 'snapshot' as const,
      }],
      itemCount: 3,
      basis: '金额口径=含税',
      caseNo: 'BID-2026-0813-007',
    },
  };

  it('xlsx 每个 sheet 表尾都带来源行', async () => {
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(await buildQuotationXlsx(withSource), { type: 'buffer' });
    for (const name of wb.SheetNames) {
      const text = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
      expect(text).toContain('tenders.etimad.sa');
      expect(text).toContain('BID-2026-0813-007');
    }
  });

  it('来源行含合规三件套：来源名称 + 链接 + 抓取时间', async () => {
    const xml = await docXml(withSource);
    expect(xml).toContain('Etimad');
    expect(xml).toContain('tenders.etimad.sa');
    expect(xml).toContain('2026-08-13T21:04:00Z');
  });

  it('来源行含条目数、计算口径、校验结论与任务编号', async () => {
    const xml = await docXml(withSource);
    expect(xml).toContain('条目 3 条');
    expect(xml).toContain('金额口径=含税');
    expect(xml).toContain('12/12 项通过');
    expect(xml).toContain('BID-2026-0813-007');
  });

  it('AI 生成免责声明每种格式都有（合规项，不是体验项）', async () => {
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(await buildQuotationXlsx(withSource), { type: 'buffer' });
    expect(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])).toContain('内容由 AI 生成');
    expect(await docXml(withSource)).toContain('内容由 AI 生成');
    expect(buildOutputHtml(withSource)).toContain('内容由 AI 生成');
    expect(buildEml(withSource, '正文', 'a@b.c').toString('utf-8')).toContain('内容由 AI 生成');
  });

  it('没有来源数据时不留空白，退回「本机录入」', async () => {
    expect(buildOutputHtml({ ...ctx, draft: false })).toContain('本机录入');
  });
});

describe('Word 方案文档', () => {
  it('是合法 OOXML 包（能被 Word 打开的最小结构）', async () => {
    const buffer = await buildProposalDocx(ctx);
    const AdmZip = (await import('adm-zip')).default as any;
    const zip = new AdmZip(buffer);
    const names = zip.getEntries().map((e: any) => e.entryName);
    expect(names).toContain('[Content_Types].xml');
    expect(names).toContain('_rels/.rels');
    expect(names).toContain('word/document.xml');
    // docx 必须是 zip：前两个字节是 PK
    expect(buffer.subarray(0, 2).toString()).toBe('PK');
  });

  it('正文含标题、字段表与段落，换行转成 <w:br/>', async () => {
    const buffer = await buildProposalDocx(ctx);
    const AdmZip = (await import('adm-zip')).default as any;
    const xml = new AdmZip(buffer).readAsText('word/document.xml');
    expect(xml).toContain('正式报价 · Nexa Gulf');
    expect(xml).toContain('交货地点');
    expect(xml).toContain('<w:br/>');     // 段落里的 \n
    expect(xml).toContain('<w:tbl>');     // 字段表
  });

  it('未审批时首段是红色 DRAFT 警示', async () => {
    const xmlDraft = await docXml({ ...ctx, draft: true });
    const xmlFinal = await docXml({ ...ctx, draft: false });
    expect(xmlDraft).toContain('B42318');           // 红色
    expect(xmlDraft).toContain('DRAFT');
    expect(xmlFinal).not.toContain('DRAFT');
  });

  it('XML 特殊字符被转义（& < > 不会破坏文档）', async () => {
    const xml = await docXml({ ...ctx, draft: false, customer: 'A & B <Ltd>' });
    expect(xml).toContain('A &amp; B &lt;Ltd&gt;');
  });
});

async function docXml(context: any): Promise<string> {
  const buffer = await buildProposalDocx(context);
  const AdmZip = (await import('adm-zip')).default as any;
  return new AdmZip(buffer).readAsText('word/document.xml');
}

describe('PDF 用的 HTML', () => {
  it('未审批时有斜向水印层与红框警示', () => {
    const html = buildOutputHtml(ctx);
    expect(html).toContain('class="wm"');
    expect(html).toContain('DRAFT');
  });

  it('已审批时没有水印', () => {
    expect(buildOutputHtml({ ...ctx, draft: false })).not.toContain('class="wm"');
  });

  it('BOM 与成本表都渲染，且金额右对齐', () => {
    const html = buildOutputHtml(ctx);
    expect(html).toContain('IPC-4K-BLT-30');
    expect(html).toContain('Σ(数量 × 单价)');
    expect(html).toContain('class="num"');
  });
});

describe('邮件草稿', () => {
  it('是标准 .eml（有 To / Subject / MIME 头）', () => {
    const eml = buildEml({ ...ctx, draft: false }, '您好，报价如下……', 'client@example.com').toString('utf-8');
    expect(eml).toContain('To: client@example.com');
    expect(eml).toContain('Subject: 正式报价 · Nexa Gulf');
    expect(eml).toContain('Content-Type: text/plain; charset=UTF-8');
    expect(eml).toContain('您好，报价如下');
  });

  it('未审批时正文顶部带 DRAFT 警示', () => {
    expect(buildEml(ctx, '正文', 'a@b.c').toString('utf-8')).toContain('DRAFT');
  });
});
