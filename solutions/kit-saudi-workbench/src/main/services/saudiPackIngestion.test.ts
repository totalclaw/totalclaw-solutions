import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { docKindOf, extractDocument } from './documentExtractor';

/**
 * 沙特 Demo 物料包的真实解析回归。
 *
 * 跑的是客户给的原始素材（`Saudi_AI_Demo1-3_Raw_Material_Pack_v1`），不是我们自己
 * 造的样例 —— 它有意混进了自由文本、缺字段、过期记录、混合币种和版本冲突。
 *
 * 物料包在仓库外（客户资料不入库），不在本机时整组跳过，不拖垮 CI。
 * 要跑：把物料包放到下面的路径，或设 SAUDI_PACK 环境变量指过去。
 */
const PACK = process.env.SAUDI_PACK
  || '/Users/mac02/Desktop/沙特/0811/Saudi_AI_Demo1-3_Raw_Material_Pack_v1/Synthetic_Raw_Inputs';

const hasPack = existsSync(PACK);
const d = hasPack ? describe : describe.skip;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

d('沙特物料包 · 真实文件解析', () => {
  // 注意：describe.skip 仍会执行这个回调来收集测试结构，只是不跑用例。
  // 所以这里必须自己判 hasPack —— 直接 walk 一个不存在的目录会抛 ENOENT，
  // 那是「整个文件收集失败」，比跑失败还难查（报错里看不出是缺物料包）。
  const files = hasPack ? walk(PACK).sort() : [];

  it('PDF 全部能抽出正文与页码（报价单/标书/Addendum/实验报告）', async () => {
    const pdfs = files.filter((f) => f.toLowerCase().endsWith('.pdf'));
    expect(pdfs.length, '物料包里应当有 PDF').toBeGreaterThan(5);
    const bad: string[] = [];
    for (const f of pdfs) {
      const doc = await extractDocument(f, f.split('/').pop());
      // 页码是「点字段回原文」的定位基础，缺了就只能锚到文件级
      if (!doc.text?.trim() || !doc.pages?.length) bad.push(f.split('/').pop()!);
    }
    expect(bad, `这些 PDF 没抽出正文或页码：${bad.join(', ')}`).toEqual([]);
  }, 120000);

  it('Excel/CSV 全部能抽出工作表（数量表/产品目录/报价/证书台账/BOQ）', async () => {
    const sheets = files.filter((f) => /\.(xlsx|xls|csv)$/i.test(f));
    expect(sheets.length).toBeGreaterThan(5);
    const bad: string[] = [];
    for (const f of sheets) {
      const doc = await extractDocument(f, f.split('/').pop());
      if (!doc.sheets?.length) bad.push(f.split('/').pop()!);
    }
    expect(bad, `这些表格没抽出工作表：${bad.join(', ')}`).toEqual([]);
  }, 120000);

  it('Word 能抽出正文（页码定位缺失是已知限制，必须如实写进 warning）', async () => {
    const docs = files.filter((f) => /\.docx?$/i.test(f));
    expect(docs.length).toBeGreaterThan(0);
    for (const f of docs) {
      const doc = await extractDocument(f, f.split('/').pop());
      expect(doc.text?.trim(), `${f} 没抽出正文`).toBeTruthy();
      // 不能默默降级：拿到一份定位不到页的抽取结果却不知情，比明说更糟
      expect(doc.warning, `${f} 应当声明 Word 无稳定页码`).toBeTruthy();
    }
  }, 120000);

  it('客户原始诉求：邮件 / 网页表单 / 聊天记录都能解析（Demo 1 §1.3-1、Demo 3 §3.3-1）', async () => {
    const primary = files.filter((f) => /\.(eml|json|txt)$/i.test(f));
    expect(primary.length, '物料包里确实有这几类主诉求文件').toBeGreaterThan(0);
    const bad: string[] = [];
    for (const f of primary) {
      const name = f.split('/').pop()!;
      if (docKindOf(name) === 'unsupported') { bad.push(`${name}(类型不支持)`); continue; }
      const doc = await extractDocument(f, name);
      if (!doc.text?.trim()) bad.push(`${name}(没抽出正文)`);
    }
    expect(bad, `这些主诉求文件解析不了：${bad.join(', ')}`).toEqual([]);
  }, 120000);

  it('.eml 解出发件人与主题，且软换行被接回（否则型号会从中间断开）', async () => {
    const eml = files.find((f) => f.endsWith('01_customer_rfq_email.eml'));
    expect(eml, '物料包里应有客户询价邮件').toBeTruthy();
    const doc = await extractDocument(eml!, eml!.split('/').pop());
    expect(doc.kind).toBe('email');
    expect(doc.email?.from).toContain('@');
    // RFC 2047 编码字被解开（原始头里是 =?utf-8?b?4oCU?=）
    expect(doc.email?.subject).toContain('RFQ RS-LP-26-118');
    expect(doc.email?.subject).not.toContain('=?');
    // quoted-printable 软换行接回：原文里是 `P=\noE`
    expect(doc.text).toContain('PoE');
    expect(doc.text).not.toMatch(/=\r?\n/);
  }, 60000);

  it('网页表单的空字段必须显式保留 —— 那正是「信息缺口」的证据', async () => {
    const json = files.find((f) => f.endsWith('02_web_form_submission.json'));
    expect(json).toBeTruthy();
    const doc = await extractDocument(json!, json!.split('/').pop());
    expect(doc.kind).toBe('json');
    // 素材里 saudi_importer / target_retail_price_sar 都是 null，Demo 3 §3.3-3 要据此提澄清问题
    expect(doc.text).toContain('known_gaps.saudi_importer');
    expect(doc.text).toContain('known_gaps.target_retail_price_sar');
  }, 60000);

  it('网页快照能取到正文（Demo 2 §2.3-1 网站公告与邮件识别为同一项目）', async () => {
    // Public_Originals 与 Synthetic_Raw_Inputs 平级
    const pub = PACK.replace(/Synthetic_Raw_Inputs$/, 'Public_Originals');
    if (!existsSync(pub)) return;
    const snapshots = walk(pub).filter((f) => /\.html?$/i.test(f));
    expect(snapshots.length, '应当有网页快照').toBeGreaterThan(0);
    const bad: string[] = [];
    for (const f of snapshots) {
      const doc = await extractDocument(f, f.split('/').pop());
      // 导航栏噪音清掉后仍要留下成段正文，不能只剩一堆项目符号
      if ((doc.text || '').replace(/[-\s]/g, '').length < 200) bad.push(f.split('/').pop()!);
    }
    expect(bad, `这些网页快照没取到正文：${bad.join(', ')}`).toEqual([]);
  }, 120000);

  it('聊天记录拆成「时间 说话人：正文」', async () => {
    const chat = files.find((f) => f.endsWith('03_whatsapp_chat.txt'));
    expect(chat).toBeTruthy();
    const doc = await extractDocument(chat!, chat!.split('/').pop());
    expect(doc.kind).toBe('text');
    expect(doc.text).toMatch(/\[[^\]]+\]\s+[^:]+:/);
  }, 60000);
});
