import { describe, it, expect, vi } from 'vitest';
import { readPolicyPages, readableChinese, validatePolicyDraft, POLICY_PROMPT } from './policyExtraction';
import type { ExtractedDoc } from '../documentExtractor';
const chinese = '区域经理完成辖区季度销售任务后，按照政策规定的目标完成率核算激励金额。';
const doc = (texts: string[]): ExtractedDoc => ({ kind: 'pdf', fileName: '政策.pdf', pages: texts.map((text, i) => ({ page: i + 1, text, items: [] })), sheets: [], text: texts.join('\n') });
describe('中文政策识别', () => {
  it('显式传中文语种；阿语乱码不算成功，只有失败页走视觉兜底', async () => {
    const local = vi.fn(async () => ({ pages: [{ page: 1, ok: true, text: chinese }, { page: 2, ok: true, text: 'العربية '.repeat(80) }] }));
    const vision = vi.fn(async () => [{ page: 2, text: chinese }]);
    const result = await readPolicyPages(doc(['', '']), '/policy.pdf', { local, vision });
    expect(local).toHaveBeenCalledWith({ filePath: '/policy.pdf', pages: [1, 2], lang: ['chi_sim', 'eng'] });
    expect(vision).toHaveBeenCalledWith([2]);
    expect(result.pages.every(p => p.text === chinese)).toBe(true);
  });
  it('长文字页不能掩盖另一页扫描失败；保留缺中文语言包和视觉错误', async () => {
    await expect(readPolicyPages(doc([chinese.repeat(20), '']), '/policy.pdf', {
      local: async () => ({ error: { code: 'language_missing', detail: 'chi_sim missing' }, pages: [] }),
      vision: async () => { throw new Error('vision model unsupported'); },
    })).rejects.toThrow(/第 2 页.*chi_sim missing.*vision model unsupported/);
  });
  it('页码包装文字和数字均不能冒充正文', () => {
    expect(readableChinese('[第 1 页]\n[第 2 页]')).toBe(false);
    expect(readableChinese('123456789 '.repeat(100))).toBe(false);
  });
  it('正常文字 PDF 不调用 OCR', async () => {
    const local = vi.fn(); const vision = vi.fn();
    await readPolicyPages(doc([chinese]), '/policy.pdf', { local, vision });
    expect(local).not.toHaveBeenCalled(); expect(vision).not.toHaveBeenCalled();
  });
});
const quote = '区域经理每项基础激励最高1000元，最低完成率80%，每人每季度最高2000元。';
const docs = [{ path: '/policy.pdf', pages: [{ page: 1, text: quote }] }];
const draft = { rules: { managerBase: { perItemMax: 1000, minRate: 0.8, quarterMax: 2000 } }, evidence: [{ field: 'managerBase', file: 1, page: 1, quote }] };
describe('规则草稿边界', () => {
  it('只返回原文所列字段，经理政策不补服务商/旧默认规则', () => {
    const result = validatePolicyDraft(draft, docs);
    expect(result.rules).toEqual(draft.rules);
    expect(result.missing).toContain('auxTiers');
  });
  it('一页走了 OCR 不该拖累整份文档 —— 依据引自文字层完好的页必须照常采用', () => {
    // 真实形状：80 页政策里只有第 7 页（阶梯表，汉字占比低）走了 OCR，第 1 页文字层完好。
    // 按文档级判脏时，引自第 1 页的 managerBase 也会被扫描件防护拒掉，
    // 结果是模块四最核心的那批阶梯/系数规则一个都抽不出来。
    const mixed = [{ path: '/policy.pdf', ocr: true, ocrPages: [7], pages: [{ page: 1, text: quote }] }];
    const result = validatePolicyDraft(draft, mixed);
    expect(result.rules).toEqual(draft.rules);
  });

  it('依据确实引自 OCR 页时，阶梯类字段仍旧必须拒绝', () => {
    const scanned = [{ path: '/policy.pdf', ocr: true, ocrPages: [1], pages: [{ page: 1, text: quote }] }];
    // 本例只有这一个字段，全被拒时 validatePolicyDraft 整体抛出（保留「依据来自扫描表格」的原因）。
    expect(() => validatePolicyDraft(draft, scanned)).toThrow(/依据来自扫描表格/);
  });

  it('旧数据没有 ocrPages 时退回文档级判断（保守：宁可多挡）', () => {
    const legacy = [{ path: '/policy.pdf', ocr: true, pages: [{ page: 1, text: quote }] }];
    expect(() => validatePolicyDraft(draft, legacy)).toThrow(/依据来自扫描表格/);
  });

  it('档位比例互换必须被挡住 —— 数字全在引用里，靠「出现过」这一条抓不到', () => {
    const tierQuote = '区域经理提成：达成率80%~120%的部分按4%计提；\n达成率120%以上的部分按5%计提。';
    const tierDocs = [{ path: '/policy.pdf', pages: [{ page: 1, text: tierQuote }] }];
    const evidence = [{ field: 'managerTiers', file: 1, page: 1, quote: tierQuote }];
    // 正确顺序：照常通过
    const right = { rules: { managerTiers: [
      { fromRate: 0.8, toRate: 1.2, ratio: 0.04, basis: 'marginal' },
      { fromRate: 1.2, toRate: null, ratio: 0.05, basis: 'marginal' },
    ] }, evidence };
    expect(validatePolicyDraft(right, tierDocs).rules.managerTiers).toHaveLength(2);
    // 两档比例互换：{0.8,1.2,0.04,0.05} 四个数字仍然全在引用里，
    // 只有「同一档的数字要出现在同一句」这条能抓住它。
    const swapped = { rules: { managerTiers: [
      { fromRate: 0.8, toRate: 1.2, ratio: 0.05, basis: 'marginal' },
      { fromRate: 1.2, toRate: null, ratio: 0.04, basis: 'marginal' },
    ] }, evidence };
    expect(() => validatePolicyDraft(swapped, tierDocs)).toThrow(/档位错位|同一句/);
  });

  it('Windows Tesseract 的汉字间空格不影响主体识别与数字核验', () => {
    const spaced = quote.replace('区域经理', '区 域 经 理').replace('80%', '80 %');
    const result = validatePolicyDraft({ ...draft, evidence: [{ ...draft.evidence[0], quote: spaced }] }, [{ path: '/policy.pdf', pages: [{ page: 1, text: spaced }] }]);
    expect(result.fields).toEqual(['managerBase']);
  });
  it('伪造引用、错误页码、缺少依据均拒绝', () => {
    expect(() => validatePolicyDraft({ ...draft, evidence: [] }, docs)).toThrow('缺少原文依据');
    expect(() => validatePolicyDraft({ ...draft, evidence: [{ ...draft.evidence[0], page: 2 }] }, docs)).toThrow('引用不在');
    expect(() => validatePolicyDraft({ ...draft, evidence: [{ ...draft.evidence[0], quote: '不存在的原文不存在的原文' }] }, docs)).toThrow('引用不在');
  });
  it('经理原文不能当服务商的依据', () => {
    expect(() => validatePolicyDraft({ rules: { auxMinRate: 0.8 }, evidence: [{ ...draft.evidence[0], field: 'auxMinRate' }] }, docs)).toThrow('未明确适用于服务商');
  });
  it('无规则、非法字段、冲突、嵌套缺值、空阶梯都拒绝', () => {
    for (const rules of [{}, { source: '假的' }, { managerBase: { perItemMax: 1000 } }, { managerTiers: [] }]) {
      expect(() => validatePolicyDraft({ ...draft, rules }, docs)).toThrow();
    }
    expect(() => validatePolicyDraft({ ...draft, conflicts: ['同范围不同金额'] }, docs)).toThrow('政策冲突');
  });
  it('即便引用存在，未在引用出现的数字也不能混入草稿', () => {
    expect(() => validatePolicyDraft({ ...draft, rules: { managerBase: { perItemMax: 1000, minRate: 0.8, quarterMax: 9000 } } }, docs)).toThrow('9000 未出现在引用中');
  });
  it('绩效等级由原文决定，允许自定义两档但不允许错配系数', () => {
    const text = '区域经理绩效系数为优秀:1.1、合格:1，按季度核算。';
    const evidence = [{ field: 'performanceCoefficients', file: 1, page: 1, quote: text }];
    const documents = [{ path: '/custom.pdf', pages: [{ page: 1, text }] }];
    expect(validatePolicyDraft({ rules: { performanceCoefficients: { 优秀: 1.1, 合格: 1 } }, evidence }, documents).rules.performanceCoefficients).toEqual({ 优秀: 1.1, 合格: 1 });
    expect(() => validatePolicyDraft({ rules: { performanceCoefficients: { 优秀: 1, 合格: 1.1 } }, evidence }, documents)).toThrow('缺少对应原文');
  });
  it('多份互补政策综合保留来源；漏分析文件与跨文件伪造引用都拒绝', () => {
    const extra = '区域经理季度提成按照基础比例3%发放，剩余年终核算。';
    const documents = [...docs, { path: '/supplement.pdf', pages: [{ page: 1, text: extra }] }];
    const input = { rules: { ...draft.rules, managerAdvanceRatio: 0.03 }, evidence: [...draft.evidence, { field: 'managerAdvanceRatio', file: 2, page: 1, quote: extra }], documents: [1, 2].map(file => ({ file, subject: '区域经理', period: '同一年度', conditions: '季度结算', uncertainties: '' })) };
    expect(validatePolicyDraft(input, documents).fields).toEqual(['managerBase', 'managerAdvanceRatio']);
    expect(() => validatePolicyDraft({ ...input, documents: input.documents.slice(0, 1) }, documents)).toThrow('未逐份分析');
    expect(() => validatePolicyDraft({ ...input, conflicts: ['同期间同主体金额冲突'] }, documents)).toThrow('政策冲突');
    const wrong = { ...input, evidence: input.evidence.map(e => ({ ...e, file: 1 })) };
    expect(validatePolicyDraft(wrong, documents).fields).toEqual(['managerBase']);
  });
  it('扫描 OCR 数字即便自洽也不能证明表格完整，不采用系数表', () => {
    const text = quote + ' 区域经理绩效系数S:1.2、A:1、B:0.9、C:0.8。';
    const result = validatePolicyDraft({ rules: { managerMinRate: 0.8, ...draft.rules, performanceCoefficients: { S: 1.2, A: 1, B: 0.9, C: 0.8 } }, evidence: [{ ...draft.evidence[0], field: 'managerMinRate' }, ...draft.evidence, { field: 'performanceCoefficients', file: 1, page: 1, quote: text }] }, [{ path: '/scan.pdf', ocr: true, pages: [{ page: 1, text }] }]);
    expect(result.fields).toEqual(['managerMinRate']);
    expect(result.notes).toContain('扫描表格');
  });
  it('提示词没有奖励比例和绩效系数样例，不提示缺失填零', () => {
    expect(POLICY_PROMPT).not.toMatch(/3%|4%|5%|1\.2|0\.8|填 0/);
  });
});
