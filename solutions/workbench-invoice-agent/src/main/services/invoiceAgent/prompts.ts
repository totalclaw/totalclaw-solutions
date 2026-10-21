/**
 * 发票智能体 · 发给模型的提示词（是载荷不是界面文案，不进词典）。
 *
 * 模型只做两件事：读付款回单上的文字、给税收分类编码建议。金额与税额由程序计算。
 * 电子税务局的页面操作不交给模型：由应用在系统浏览器里按固定步骤走（见 etaxBrowser.ts）。
 */
/** 从付款单 / 回单的文字里抽开票信息：只抽原文里有的，不许补、不许算 */
export function slipExtractPrompt(text: string): string {
  return [
    'You extract invoicing requests from Chinese payment slips, bank receipts, or payment notices.',
    'Return ONLY a JSON array. One element per payment. Fields:',
    '  buyerName   - the PAYER (付款方 / 付款人 / 付款单位 / 对方户名), exactly as written',
    '  buyerTaxNo  - taxpayer id / unified social credit code if it literally appears, else ""',
    '  itemName    - what was paid for (用途 / 摘要 / 款项内容), exactly as written, else ""',
    '  amount      - the paid amount as a number, exactly as written (no rounding, no conversion)',
    '  orderNo     - order / contract / transaction number if present, else ""',
    '  remark      - 附言 / 备注 if present, else ""',
    'Rules: copy text verbatim from the source; never invent a tax id, never compute or sum amounts,',
    'never use the PAYEE (收款方) as buyerName. If nothing can be extracted return [].',
    '',
    'SOURCE:',
    text.slice(0, 12000),
  ].join('\n');
}

/** 建议税收分类编码：只是建议，界面上标「待确认」，人确认后才能开票 */
export function taxCodePrompt(items: string[]): string {
  return [
    'You suggest Chinese VAT "税收分类编码" (19-digit goods and services tax classification codes) for invoice item names.',
    'Return ONLY a JSON array, one element per input item, in the same order:',
    '  { "name": <input item name verbatim>, "taxCode": <19 digits or "" if unsure>, "shortName": <the official 简称 of that category, without asterisks, or "">, "confidence": "high" | "low" }',
    'Rules: answer "" when you are not sure; never pad or guess digits; shortName must be the category short name (e.g. 信息技术服务, 计算机配套产品, 纸制品), in Simplified Chinese.',
    '',
    'ITEMS:',
    ...items.slice(0, 60).map((x, i) => `${i + 1}. ${x}`),
  ].join('\n');
}
