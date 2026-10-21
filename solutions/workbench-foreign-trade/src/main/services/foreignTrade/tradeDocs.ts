/**
 * 外贸单据：形式发票（PI）、商业发票（CI）、装箱单（PL）的生成与核对。纯函数，不碰 electron、不调模型。
 *
 * 金额、重量、大写金额全部按规则计算。移植自 Dangooy/trade-pipeline-skill（MIT，Copyright (c) 2026 Yang Haoping）：
 *   trade_pipeline/models/amounts.py         计价方式只在一处判断，同一规则既算数值也生成 Excel 公式（PI / CI 永远一致）
 *   trade_pipeline/models/order_model.py     effective_weight_kg：净重统一口径，0 是合法重量、空才是「没数据」
 *   trade_pipeline/writers/ci_writer.py      amount_to_words：整数分运算，0.995 正确进位，负数前缀 MINUS
 *   trade_pipeline/writers/pl_writer_lite.py _compute_packing：行净重 = 每箱重 × 箱数，单据内「每箱重 × 箱数 = 净重」恒成立
 *   trade_pipeline/validation/rules.py       生成前检查 R001–R013（身份、条款、银行、目的港、单价、数量、重量、金额、信用证、证书）
 *   trade_pipeline/validation/cross_doc.py   CI 与 PL 的净重、毛重必须相等（容差 0.01 kg）
 * 单据核对补上 Dangooy/tianji-skills verify-docs/SKILL.md（MIT）的规则：大写金额 / 打印合计 / 逐行重算三方比对；
 * 按对齐键（序号，没有序号时用品名）配行，不按物理行序硬对；公式没有缓存值时标「无法核验」，不当 0。
 * 原许可证全文见 resources/foreign-trade/licenses/。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  FtDocFinding, FtDocLine, FtDocTable, FtOrderDoc, FtPackingRow, FtTradeDocInput, FtTradeLine, FtTradeTotals,
} from '@totalclaw/ipc-contracts';
import KW from './columnKeywords.json';

/** 按 Excel 的口径取整（先按 15 位有效数字规整再四舍五入、远离 0）：缓存值与打开后重算的结果一致，8.265 → 8.27 */
const roundTo = (n: number, d: number) => { const f = 10 ** d; return (Math.sign(n) * Math.round(Number((Math.abs(n) * f).toPrecision(15)))) / f; };
const r2 = (n: number) => roundTo(n, 2);
const r3 = (n: number) => roundTo(n, 3);

// ─── 计价方式与金额（amounts.py）────────────────────────────────────────

export type PricingMode = 'per_mille' | 'per_ton' | 'flat';

/** TON 优先于 MPCS；空 / 未知按「数量 × 单价」（最安全的默认） */
export function pricingMode(priceUnit?: string | null): PricingMode {
  const pu = String(priceUnit || '').toUpperCase();
  if (pu.includes('TON')) return 'per_ton';
  if (pu.includes('MPCS')) return 'per_mille';
  return 'flat';
}

/** 单行金额；未报价（单价为空）返回 0，不计入合计 */
export function computeAmount(priceUnit: string | null | undefined, quantity: number | null | undefined, weightKg: number | null | undefined, unitPrice: number | null | undefined): number {
  if (unitPrice == null) return 0;
  const mode = pricingMode(priceUnit);
  if (mode === 'per_ton') return ((weightKg || 0) / 1000) * unitPrice;
  if (mode === 'per_mille') return ((quantity || 0) / 1000) * unitPrice;
  return (quantity || 0) * unitPrice;
}

/** 与 computeAmount 同源同规则的 Excel 公式（含前导 =），列引用由调用方给 */
export function amountFormula(priceUnit: string | null | undefined, cells: { qty: string; weight: string; price: string }): string {
  const mode = pricingMode(priceUnit);
  if (mode === 'per_ton') return `=${cells.weight}/1000*${cells.price}`;
  if (mode === 'per_mille') return `=${cells.qty}/1000*${cells.price}`;
  return `=${cells.qty}*${cells.price}`;
}

/** 本行总净重：总净重 → 单件净重 × 数量 → 空（0 是合法值） */
export function effectiveNetKg(line: Pick<FtTradeLine, 'netWeightKg' | 'unitNetKg' | 'quantity'>): number | null {
  if (line.netWeightKg != null && Number.isFinite(line.netWeightKg)) return line.netWeightKg;
  if (line.unitNetKg != null && Number.isFinite(line.unitNetKg)) return line.unitNetKg * (line.quantity || 0);
  return null;
}

// ─── 大写金额（ci_writer.py）────────────────────────────────────────────

const ONES = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN',
  'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
const SCALES: Array<[number, string]> = [[1e12, 'TRILLION'], [1e9, 'BILLION'], [1e6, 'MILLION'], [1000, 'THOUSAND']];

function numToWords(n: number): string {
  if (n === 0) return 'ZERO';
  if (n < 0) return `MINUS ${numToWords(-n)}`;
  const parts: string[] = [];
  for (const [scale, name] of SCALES) {
    if (n >= scale) {
      parts.push(`${numToWords(Math.floor(n / scale))} ${name}`);
      n %= scale;
    }
  }
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} HUNDRED`);
    n %= 100;
  }
  if (n >= 20) parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ''));
  else if (n > 0) parts.push(ONES[n]);
  return parts.join(' ');
}

export function amountToWords(amount: number, currency = 'USD'): string {
  const negative = amount < 0;
  const totalCents = Math.round(Math.abs(amount) * 100);
  const integer = Math.floor(totalCents / 100);
  const cents = totalCents % 100;
  let words = `${currency} `;
  if (negative && totalCents > 0) words += 'MINUS ';
  words += numToWords(integer);
  if (cents > 0) words += ` AND ${numToWords(cents)} CENTS`;
  return `${words} ONLY`;
}

const WORD_VALUE: Record<string, number> = {
  ZERO: 0, ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6, SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10, ELEVEN: 11, TWELVE: 12,
  THIRTEEN: 13, FOURTEEN: 14, FIFTEEN: 15, SIXTEEN: 16, SEVENTEEN: 17, EIGHTEEN: 18, NINETEEN: 19, TWENTY: 20, THIRTY: 30,
  FORTY: 40, FOURTY: 40, FIFTY: 50, SIXTY: 60, SEVENTY: 70, EIGHTY: 80, NINETY: 90,
};
const SCALE_VALUE: Record<string, number> = { THOUSAND: 1000, MILLION: 1e6, BILLION: 1e9, TRILLION: 1e12 };
const isNumWord = (w: string) => w in WORD_VALUE || w === 'HUNDRED' || w in SCALE_VALUE;

function wordsToInt(words: string[]): number | null {
  let total = 0;
  let cur = 0;
  let any = false;
  for (const w of words) {
    if (w in WORD_VALUE) { cur += WORD_VALUE[w]; any = true; } else if (w === 'HUNDRED') { cur = (cur || 1) * 100; any = true; } else if (w in SCALE_VALUE) { total += (cur || 1) * SCALE_VALUE[w]; cur = 0; any = true; }
  }
  return any ? total + cur : null;
}

/**
 * 英文大写金额还原成数字（核对用）。认 "SAY USD ONE THOUSAND AND FIFTY CENTS ONLY"、"… AND CENTS FIFTY ONLY"、
 * "… POINT FIVE SIX"；读不出返回 null（不当 0）。
 */
export function wordsToAmount(text: string): number | null {
  const tokens = String(text || '').toUpperCase().split(/[^A-Z]+/).filter(Boolean);
  const pointAt = tokens.indexOf('POINT');
  if (pointAt >= 0) {
    const int = wordsToInt(tokens.slice(0, pointAt));
    const digits = tokens.slice(pointAt + 1).filter((w) => w in WORD_VALUE && WORD_VALUE[w] < 10).map((w) => WORD_VALUE[w]).join('');
    if (int == null) return null;
    return digits ? Number(`${int}.${digits}`) : int;
  }
  const centAt = tokens.findIndex((w) => w === 'CENTS' || w === 'CENT');
  if (centAt < 0) return wordsToInt(tokens.filter(isNumWord));
  const after = tokens.slice(centAt + 1).filter(isNumWord);
  let intTokens: string[];
  let centTokens: string[];
  if (after.length) {
    centTokens = after;
    intTokens = tokens.slice(0, centAt).filter(isNumWord);
  } else {
    // 分在 CENTS 之前：往前取连续数词，到 AND 为止
    let i = centAt - 1;
    while (i >= 0 && isNumWord(tokens[i])) i--;
    centTokens = tokens.slice(i + 1, centAt);
    intTokens = tokens.slice(0, Math.max(i, 0)).filter(isNumWord);
  }
  const int = wordsToInt(intTokens) ?? 0;
  const cents = wordsToInt(centTokens);
  if (cents == null || cents > 99) return null;
  return r2(int + cents / 100);
}

// ─── 装箱（pl_writer_lite.py）───────────────────────────────────────────

export function computePacking(lines: FtTradeLine[], p: FtTradeDocInput['packing']): { rows: FtPackingRow[]; totals: Omit<FtTradeTotals, 'amount' | 'amountInWords'>; cbmEstimated: boolean } {
  if (!lines.length) throw new Error(i18nT('订单没有任何产品行，不能生成装箱单'));
  if (!(p.kgPerCarton > 0)) throw new Error(i18nT('每箱重量必须大于 0'));
  const rows: FtPackingRow[] = [];
  let cbmKnown = true;
  for (const l of lines) {
    const nw = effectiveNetKg(l) ?? 0;
    const cartons = l.pcsPerCarton && l.pcsPerCarton > 0
      ? Math.max(1, Math.ceil(l.quantity / l.pcsPerCarton))
      : nw > 0 ? Math.max(1, Math.ceil(nw / p.kgPerCarton)) : 1;
    const kgPerCarton = r2(nw / cartons);
    const net = r2(kgPerCarton * cartons);
    const gross = r2(net + cartons * (p.cartonTareKg || 0));
    if (!(l.cartonCbm && l.cartonCbm > 0)) cbmKnown = false;
    rows.push({ no: l.no, description: l.description, quantity: l.quantity, unit: l.unit, cartons, kgPerCarton, netWeightKg: net, grossWeightKg: gross, cbm: l.cartonCbm ? r3(cartons * l.cartonCbm) : 0 });
  }
  const cartons = rows.reduce((s, x) => s + x.cartons, 0);
  const pallets = p.cartonsPerPallet > 0 ? Math.max(1, Math.ceil(cartons / p.cartonsPerPallet)) : 0;
  const netWeightKg = r2(rows.reduce((s, x) => s + x.netWeightKg, 0));
  const grossWeightKg = r2(rows.reduce((s, x) => s + x.grossWeightKg, 0) + pallets * (p.palletWeightKg || 0));
  const cbm = cbmKnown ? r3(rows.reduce((s, x) => s + x.cbm, 0)) : r2(Math.max(pallets, 1) * (p.cbmPerPallet || 0));
  return {
    rows,
    totals: { quantity: rows.reduce((s, x) => s + x.quantity, 0), cartons, pallets, netWeightKg, grossWeightKg, cbm },
    cbmEstimated: !cbmKnown,
  };
}

/** 界面传来的单据信息：数字框留空会是 ''，统一成 undefined；文本去掉首尾空白（主进程入口，不信任渲染层） */
export function normalizeTradeInput(raw: FtTradeDocInput): FtTradeDocInput {
  const n = (v: unknown) => (v === '' || v == null || !Number.isFinite(Number(v)) ? undefined : Number(v));
  const str = (v: unknown) => String(v ?? '').trim();
  const pk = raw.packing || ({} as FtTradeDocInput['packing']);
  return {
    ...raw,
    seller: { ...raw.seller, name: str(raw.seller?.name), address: str(raw.seller?.address) },
    buyer: { ...raw.buyer, name: str(raw.buyer?.name), address: str(raw.buyer?.address) },
    bank: { ...raw.bank, name: str(raw.bank?.name), accountNo: str(raw.bank?.accountNo), swift: str(raw.bank?.swift).toUpperCase(), accountName: str(raw.bank?.accountName) },
    currency: str(raw.currency).toUpperCase() || 'USD',
    packing: { kgPerCarton: n(pk.kgPerCarton) ?? 0, cartonsPerPallet: n(pk.cartonsPerPallet) ?? 0, palletWeightKg: n(pk.palletWeightKg) ?? 0, cartonTareKg: n(pk.cartonTareKg) ?? 0, cbmPerPallet: n(pk.cbmPerPallet) ?? 0 },
    lines: (Array.isArray(raw.lines) ? raw.lines : []).map((l, i) => ({
      ...l, no: i + 1, model: str(l.model), description: str(l.description), unit: str(l.unit) || 'PCS', quantity: n(l.quantity) ?? 0,
      unitPrice: n(l.unitPrice), netWeightKg: n(l.netWeightKg), unitNetKg: n(l.unitNetKg), pcsPerCarton: n(l.pcsPerCarton), cartonCbm: n(l.cartonCbm),
    })),
  };
}

// ─── 生成前检查（rules.py）─────────────────────────────────────────────

const blank = (v?: string | null) => !String(v ?? '').trim();
const rowNos = (ls: FtTradeLine[]) => ls.map((l) => l.no).join(', ');
const SWIFT_RE = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export function validateTradeDocInput(input: FtTradeDocInput): FtDocFinding[] {
  const out: FtDocFinding[] = [];
  const err = (rule: string, message: string, suggestion?: string) => out.push({ rule, level: 'error', message, suggestion });
  const warn = (rule: string, message: string, suggestion?: string) => out.push({ rule, level: 'warning', message, suggestion });
  const info = (rule: string, message: string, suggestion?: string) => out.push({ rule, level: 'info', message, suggestion });
  if (blank(input.seller?.name)) err('R001', i18nT('卖方（出单公司）名称没填，单据抬头无从填写'), i18nT('在「单据抬头与银行」里填写公司英文名称和地址'));
  if (blank(input.buyer?.name)) err('R002', i18nT('买方名称没填，收货方和抬头无法确定'));
  if (blank(input.incoterm) || blank(input.payment)) err('R003', i18nT('贸易术语或付款方式没填'));
  const bank = input.bank || ({} as FtTradeDocInput['bank']);
  const missingBank = [[bank.name, i18nT('银行名称')], [bank.accountNo, i18nT('账号')], [bank.swift, 'SWIFT']].filter(([v]) => blank(v as string)).map(([, l]) => l);
  if (missingBank.length) err('R013', i18nT('收款银行信息不全：缺{p0}', { p0: missingBank.join('、') }));
  else if (!SWIFT_RE.test(bank.swift.replace(/\s/g, '').toUpperCase())) err('R013', i18nT('SWIFT 应为 8 或 11 位字母数字，当前「{p0}」', { p0: bank.swift }));
  if (blank(input.piNo) || blank(input.ciNo)) err('R016', i18nT('PI 号或 CI 号没填'));
  if (blank(input.portOfDestination)) warn('R004', i18nT('目的港没填，CI / 装箱单上会留白，清关时通常要补改'));
  const lines = input.lines || [];
  if (!lines.length) { err('R000', i18nT('没有产品行')); return out; }
  const noPrice = lines.filter((l) => l.unitPrice == null || !Number.isFinite(l.unitPrice));
  if (noPrice.length) err('R005', i18nT('第 {p0} 行没有单价，金额无法计算', { p0: rowNos(noPrice) }));
  const badQty = lines.filter((l) => !(l.quantity > 0));
  if (badQty.length) err('R006', i18nT('第 {p0} 行数量为空或不大于 0', { p0: rowNos(badQty) }));
  const noWeight = lines.filter((l) => { const w = effectiveNetKg(l); return w == null || w <= 0; });
  if (noWeight.length) {
    if (pricingMode(input.priceUnit) === 'per_ton') err('R007', i18nT('按吨计价（{p0}），第 {p1} 行缺重量，金额算不出', { p0: input.priceUnit, p1: rowNos(noWeight) }));
    else warn('R007', i18nT('第 {p0} 行缺净重，PI / CI 不受影响，装箱单的重量会是 0', { p0: rowNos(noWeight) }));
  }
  const badAmount = lines.filter((l) => l.unitPrice != null && computeAmount(input.priceUnit, l.quantity, effectiveNetKg(l), l.unitPrice) <= 0);
  if (badAmount.length) err('R008', i18nT('第 {p0} 行按 {p1} 试算金额不大于 0', { p0: rowNos(badAmount), p1: input.priceUnit || 'PCS' }));
  const unconfirmed = lines.filter((l) => !blank(l.hsCode) && !l.hsConfirmed);
  if (unconfirmed.length) err('R014', i18nT('第 {p0} 行的 HS 编码还没有人工确认，不能进单据', { p0: rowNos(unconfirmed) }), i18nT('到「报价 → 产品目录」里确认 HS 编码'));
  const noHs = lines.filter((l) => blank(l.hsCode));
  if (noHs.length) warn('R015', i18nT('第 {p0} 行没有 HS 编码，CI 上这一栏会留空', { p0: rowNos(noHs) }));
  const lcSignals = [input.lcNumber ? i18nT('信用证号 {p0}', { p0: input.lcNumber }) : '', /L\/C|LETTER OF CREDIT|信用证/i.test(input.payment || '') ? i18nT('付款方式含信用证') : ''].filter(Boolean);
  if (lcSignals.length) info('R009', i18nT('信用证订单（{p0}）：单据必须与信用证条款逐字一致，签发前请人工逐项核对', { p0: lcSignals.join('；') }));
  if (blank(input.certificates)) info('R010', i18nT('没有记录产地证 / 质检证书需求，请和客户确认'));
  return out;
}

// ─── 单据排版模型（PI / CI / PL 共用一套布局，公式与数值同源）──────────────

export interface DocCell { v: string | number; f?: string }

export interface TradeDocModel {
  kind: 'PI' | 'CI' | 'PL';
  title: string;
  number: string;
  head: Array<[string, string]>;
  columns: string[];
  /** 行内公式用 {r} 表示本行、{first} / {last} 表示明细首末行，由 layoutSheet 换成真实行号 */
  rows: DocCell[][];
  total: DocCell[];
  footer: string[];
  table: FtDocTable;
}

export function colLetter(i: number): string {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** 整张表的二维布局（标题、抬头、表头、明细、合计、页脚）；公式里的行号在这里定 */
export function layoutSheet(doc: TradeDocModel): DocCell[][] {
  const aoa: DocCell[][] = [[{ v: doc.title }], [{ v: `No. ${doc.number}` }]];
  for (const [k, v] of doc.head) aoa.push([{ v: k }, { v }]);
  aoa.push([]);
  aoa.push(doc.columns.map((c) => ({ v: c })));
  const first = aoa.length + 1;
  const last = first + doc.rows.length - 1;
  const fix = (c: DocCell, r: number): DocCell => (c.f ? { v: c.v, f: c.f.replace(/^=/, '').replace(/\{r\}/g, String(r)).replace(/\{first\}/g, String(first)).replace(/\{last\}/g, String(last)) } : c);
  doc.rows.forEach((row, i) => aoa.push(row.map((c) => fix(c, first + i))));
  aoa.push(doc.total.map((c) => fix(c, last + 1)));
  aoa.push([]);
  for (const f of doc.footer) aoa.push([{ v: f }]);
  return aoa;
}

function headCommon(input: FtTradeDocInput): Array<[string, string]> {
  return [
    ['Seller', [input.seller.name, input.seller.address].filter(Boolean).join(', ')],
    ['Buyer', [input.buyer.name, input.buyer.address].filter(Boolean).join(', ')],
    ['Date', input.date],
    ['Terms', `${input.incoterm}${input.portOfDestination ? ` ${input.portOfDestination}` : ''}`],
  ];
}

function bankFooter(input: FtTradeDocInput): string[] {
  const b = input.bank;
  return [
    `Payment: ${input.payment}`,
    `Beneficiary Bank: ${b.name}${b.address ? `, ${b.address}` : ''}`,
    `Account Name: ${b.accountName || input.seller.name}`,
    `Account No.: ${b.accountNo}`,
    `SWIFT: ${b.swift}`,
  ];
}

/** HS 编码只写人工确认过的；没确认的留空（validate 已经拦了，这里再兜一层） */
const hsOf = (l: FtTradeLine) => (l.hsConfirmed && l.hsCode ? l.hsCode : '');

/** PI / CI 的明细列：No. | Model | Description | HS Code | Qty | Unit | N.W.(kg) | Unit Price | Amount */
function invoiceRows(input: FtTradeDocInput): { rows: DocCell[][]; lines: FtDocLine[]; amount: number } {
  const QTY = 'E';
  const NW = 'G';
  const PRICE = 'H';
  let amount = 0;
  const lines: FtDocLine[] = [];
  const rows = input.lines.map((l) => {
    const nw = effectiveNetKg(l);
    const a = r2(computeAmount(input.priceUnit, l.quantity, nw, l.unitPrice));
    amount += a;
    lines.push({ no: l.no, description: l.description, model: l.model, quantity: l.quantity, unitPrice: l.unitPrice, amount: a, netWeightKg: nw ?? undefined });
    return [
      { v: l.no }, { v: l.model }, { v: l.description }, { v: hsOf(l) }, { v: l.quantity }, { v: l.unit },
      { v: nw ?? '' }, { v: l.unitPrice ?? '' },
      // 每行金额取整到分（公式里同样 ROUND），合计 = 各行之和，单据上的数字加得起来
      { v: a, f: `ROUND(${amountFormula(input.priceUnit, { qty: `${QTY}{r}`, weight: `${NW}{r}`, price: `${PRICE}{r}` }).slice(1)},2)` },
    ];
  });
  return { rows, lines, amount: r2(amount) };
}

const INVOICE_COLUMNS = (cur: string, unit: string) => ['No.', 'Model', 'Description', 'HS Code', 'Qty', 'Unit', 'N.W. (kg)', `Unit Price (${unit || cur})`, `Amount (${cur})`];

export function buildProforma(input: FtTradeDocInput): TradeDocModel {
  const { rows, lines, amount } = invoiceRows(input);
  const words = amountToWords(amount, input.currency);
  return {
    kind: 'PI',
    title: 'PROFORMA INVOICE',
    number: input.piNo,
    head: [...headCommon(input), ['Port of Loading', input.portOfLoading || ''], ['Port of Destination', input.portOfDestination || '']],
    columns: INVOICE_COLUMNS(input.currency, input.priceUnit),
    rows,
    total: [{ v: '' }, { v: 'TOTAL' }, { v: '' }, { v: '' }, { v: input.lines.reduce((s, l) => s + l.quantity, 0), f: 'SUM(E{first}:E{last})' }, { v: '' }, { v: '' }, { v: '' }, { v: amount, f: 'SUM(I{first}:I{last})' }],
    footer: [`SAY: ${words}`, ...bankFooter(input)],
    table: { lines, total: amount, amountInWords: words, generated: true },
  };
}

export function buildCommercialInvoice(input: FtTradeDocInput): TradeDocModel {
  const { rows, lines, amount } = invoiceRows(input);
  const words = amountToWords(amount, input.currency);
  // 净重毛重与装箱单同源：都从 computePacking 来（trade-pipeline B3：CI 读 PL 的回写值，不再各算各的）
  const pk = computePacking(input.lines, input.packing);
  return {
    kind: 'CI',
    title: 'COMMERCIAL INVOICE',
    number: input.ciNo,
    head: [...headCommon(input), ['Contract / PI No.', input.piNo], ['From', input.portOfLoading || ''], ['To', input.portOfDestination || ''],
      ...(input.vessel ? [['Vessel', input.vessel] as [string, string]] : []), ...(input.lcNumber ? [['L/C No.', input.lcNumber] as [string, string]] : [])],
    columns: INVOICE_COLUMNS(input.currency, input.priceUnit),
    rows,
    total: [{ v: '' }, { v: 'TOTAL' }, { v: '' }, { v: '' }, { v: pk.totals.quantity, f: 'SUM(E{first}:E{last})' }, { v: '' }, { v: '' }, { v: '' }, { v: amount, f: 'SUM(I{first}:I{last})' }],
    footer: [
      `SAY: ${words}`,
      `PACKED IN ${pk.totals.cartons} CARTONS${pk.totals.pallets ? ` / ${pk.totals.pallets} PALLETS` : ''}`,
      `N.W.: ${pk.totals.netWeightKg.toFixed(2)} KGS    G.W.: ${pk.totals.grossWeightKg.toFixed(2)} KGS    MEAS.: ${pk.totals.cbm} CBM`,
      ...(input.shippingMarks ? [`Shipping Marks: ${input.shippingMarks}`] : []),
      ...bankFooter(input),
    ],
    table: { lines, total: amount, amountInWords: words, netWeightKg: pk.totals.netWeightKg, grossWeightKg: pk.totals.grossWeightKg, generated: true },
  };
}

/** 装箱单列：No. | Model | Description | Qty | Unit | Cartons | Kg/Ctn | N.W.(kg) | G.W.(kg) | CBM */
export function buildPackingList(input: FtTradeDocInput): TradeDocModel {
  const pk = computePacking(input.lines, input.packing);
  const tare = input.packing.cartonTareKg || 0;
  const lines: FtDocLine[] = [];
  const rows: DocCell[][] = pk.rows.map((p, i) => {
    lines.push({ no: p.no, description: p.description, model: input.lines[i].model, quantity: p.quantity, cartons: p.cartons, netWeightKg: p.netWeightKg, grossWeightKg: p.grossWeightKg });
    return [
      { v: p.no }, { v: input.lines[i].model }, { v: p.description }, { v: p.quantity }, { v: p.unit }, { v: p.cartons }, { v: p.kgPerCarton },
      { v: p.netWeightKg, f: 'F{r}*G{r}' }, { v: p.grossWeightKg, f: tare ? `H{r}+F{r}*${tare}` : 'H{r}' }, { v: p.cbm || '' },
    ];
  });
  const palletKg = input.packing.palletWeightKg || 0;
  return {
    kind: 'PL',
    title: 'PACKING LIST',
    number: input.ciNo,
    head: [...headCommon(input), ['Invoice No.', input.ciNo], ['From', input.portOfLoading || ''], ['To', input.portOfDestination || '']],
    columns: ['No.', 'Model', 'Description', 'Qty', 'Unit', 'Cartons', 'Kg/Ctn', 'N.W. (kg)', 'G.W. (kg)', 'CBM'],
    rows,
    total: [{ v: '' }, { v: 'TOTAL' }, { v: '' }, { v: pk.totals.quantity, f: 'SUM(D{first}:D{last})' }, { v: '' }, { v: pk.totals.cartons, f: 'SUM(F{first}:F{last})' }, { v: '' },
      { v: pk.totals.netWeightKg, f: 'SUM(H{first}:H{last})' },
      { v: pk.totals.grossWeightKg, f: pk.totals.pallets && palletKg ? `SUM(I{first}:I{last})+${pk.totals.pallets}*${palletKg}` : 'SUM(I{first}:I{last})' },
      { v: pk.totals.cbm }],
    footer: [
      `TOTAL: ${pk.totals.cartons} CARTONS${pk.totals.pallets ? ` IN ${pk.totals.pallets} PALLETS` : ''}`,
      ...(pk.totals.pallets && palletKg ? [`G.W. includes ${pk.totals.pallets} pallets x ${palletKg} kg`] : []),
      ...(pk.cbmEstimated ? [`Measurement estimated at ${input.packing.cbmPerPallet} CBM per pallet`] : []),
      ...(input.shippingMarks ? [`Shipping Marks: ${input.shippingMarks}`] : []),
    ],
    table: { lines, netWeightKg: pk.totals.netWeightKg, grossWeightKg: pk.totals.grossWeightKg, generated: true },
  };
}

export function tradeTotals(input: FtTradeDocInput): FtTradeTotals {
  const pk = computePacking(input.lines, input.packing);
  const amount = r2(input.lines.reduce((s, l) => s + r2(computeAmount(input.priceUnit, l.quantity, effectiveNetKg(l), l.unitPrice)), 0));
  return { ...pk.totals, amount, amountInWords: amountToWords(amount, input.currency) };
}

/** 生成后的单据字段（给原有的跨单据字段核对用） */
export function docFields(doc: TradeDocModel, input: FtTradeDocInput): Record<string, string> {
  const out: Record<string, string> = {
    order_no: input.piNo,
    consignee: input.buyer.name,
    product_names: input.lines.map((l) => l.description).join(', '),
    total_quantity: String(input.lines.reduce((s, l) => s + l.quantity, 0)),
    destination: input.portOfDestination || '',
  };
  if (doc.kind !== 'PL') { out.total_amount = String(doc.table.total ?? ''); out.currency = input.currency; }
  return out;
}

// ─── 上传的 Excel 单据：按表头读出明细（不经模型）─────────────────────────

export interface SheetCell { v?: string | number | boolean | null; f?: string; addr: string }

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const numOf = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const s = String(v ?? '').trim();
  if (!s) return undefined;
  // 欧洲格式 1.234,56 / 12,5（trade-pipeline C4）
  const t = /^-?\d{1,3}(\.\d{3})+,\d{1,2}$/.test(s) || /^-?\d+,\d{1,2}$/.test(s) ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  const n = Number(t.replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) && /\d/.test(t) ? n : undefined;
};

/** 表头匹配顺序：越具体的列越先认（N.W. 先于 Weight、Unit Price 先于 Price / Amount） */
const DOC_FIELD_ORDER = ['no', 'cartons', 'netWeightKg', 'grossWeightKg', 'unitPrice', 'amount', 'quantity', 'model', 'description'] as const;
type DocField = typeof DOC_FIELD_ORDER[number];

function matchHeader(text: string, words: string[]): boolean {
  return words.some((w) => text === w || (w.length > 2 && text.includes(w)) || (w.length <= 2 && new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\#/]/g, '\\$&')}($|[^a-z])`).test(text)));
}

export function parseTradeSheet(grid: SheetCell[][]): FtDocTable | null {
  const words = (KW as any).tradeDoc as Record<DocField, string[]>;
  const totalWords = (KW as any).tradeDocTotal as string[];
  let headerAt = -1;
  let cols: Partial<Record<DocField, number>> = {};
  for (let r = 0; r < Math.min(grid.length, 40) && headerAt < 0; r++) {
    const found: Partial<Record<DocField, number>> = {};
    const used = new Set<number>();
    for (const field of DOC_FIELD_ORDER) {
      const c = grid[r].findIndex((cell, i) => !used.has(i) && matchHeader(norm(cell?.v), words[field]));
      if (c >= 0) { found[field] = c; used.add(c); }
    }
    const hits = Object.keys(found).length;
    if (hits >= 3 && (found.quantity != null || found.amount != null)) { headerAt = r; cols = found; }
  }
  if (headerAt < 0) return null;
  const table: FtDocTable = { lines: [], uncached: [] };
  const read = (row: SheetCell[], field: DocField): number | undefined => {
    const c = cols[field];
    if (c == null) return undefined;
    const cell = row[c];
    if (cell?.f && (cell.v == null || cell.v === '')) { table.uncached!.push(cell.addr); return undefined; }
    return numOf(cell?.v);
  };
  for (let r = headerAt + 1; r < grid.length; r++) {
    const row = grid[r] || [];
    const texts = row.map((c) => norm(c?.v));
    // 合计行：单元格就是「合计 / TOTAL」，或「TOTAL:」「合计（USD）」「TOTAL AMOUNT」这类；不认「Total station」这种品名
    if (texts.some((t) => totalWords.some((w) => t === w || /^[:：(（]/.test(t.slice(w.length).trim()) && t.startsWith(w)) || /^(grand )?total (amount|value|qty|quantity)$/.test(t))) {
      table.total = read(row, 'amount');
      table.netWeightKg = read(row, 'netWeightKg');
      table.grossWeightKg = read(row, 'grossWeightKg');
      break;
    }
    const description = cols.description != null ? String(row[cols.description]?.v ?? '').trim() : '';
    const quantity = read(row, 'quantity');
    const amount = read(row, 'amount');
    if (!description && quantity == null && amount == null) continue;
    table.lines.push({
      no: read(row, 'no'),
      description,
      model: cols.model != null ? String(row[cols.model]?.v ?? '').trim() || undefined : undefined,
      quantity,
      unitPrice: read(row, 'unitPrice'),
      amount,
      cartons: read(row, 'cartons'),
      netWeightKg: read(row, 'netWeightKg'),
      grossWeightKg: read(row, 'grossWeightKg'),
    });
  }
  // 大写金额：SAY … ONLY / TOTAL … ONLY
  for (const row of grid) {
    for (const cell of row || []) {
      const t = String(cell?.v ?? '');
      if (/\bONLY\b/i.test(t) && /(SAY|DOLLARS?|USD|EUR|CNY|RMB|CENTS?|HUNDRED|THOUSAND)/i.test(t)) { table.amountInWords = t.trim(); break; }
    }
    if (table.amountInWords) break;
  }
  if (!table.uncached!.length) delete table.uncached;
  return table;
}

// ─── 单据核对：三方比对 + 按对齐键配行（verify-docs）+ 净重毛重一致（cross_doc.py）─────────

const TOL_AMOUNT = 0.01;
const TOL_KG = 0.01;
const differs = (a?: number, b?: number, tol = TOL_AMOUNT) => a != null && b != null && Math.abs(a - b) > tol;
const lineKey = (l: FtDocLine, useNo: boolean) => (useNo && l.no != null ? `#${l.no}` : String(l.description || l.model || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''));
const fmt = (n?: number) => (n == null ? '—' : String(r2(n)));

export function validateTradeDocs(docs: FtOrderDoc[]): FtDocFinding[] {
  const out: FtDocFinding[] = [];
  const withTable = docs.filter((d) => d.table && (d.table.lines.length || d.table.total != null));
  for (const d of withTable) {
    const t = d.table!;
    if (t.uncached?.length) out.push({ rule: 'uncached', level: 'warning', docs: [d.name], message: i18nT('{p0}：{p1} 是公式但没有缓存值（文件没在 Excel / WPS 里保存过），无法核验，没有当 0 处理', { p0: d.name, p1: t.uncached.slice(0, 6).join(', ') }) });
    const priced = t.lines.filter((l) => l.amount != null);
    if (d.kind !== 'PL' && priced.length) {
      const recomputed = r2(priced.reduce((s, l) => s + (l.amount || 0), 0));
      const printed = t.total;
      const fromWords = t.amountInWords ? wordsToAmount(t.amountInWords) : null;
      const pairs: string[] = [];
      if (differs(recomputed, printed)) pairs.push(i18nT('逐行合计 {a} ≠ 印的合计 {b}', { a: fmt(recomputed), b: fmt(printed) }));
      if (fromWords != null && differs(fromWords, printed)) pairs.push(i18nT('大写金额 {a} ≠ 印的合计 {b}', { a: fmt(fromWords), b: fmt(printed) }));
      if (fromWords != null && differs(fromWords, recomputed)) pairs.push(i18nT('大写金额 {a} ≠ 逐行合计 {b}', { a: fmt(fromWords), b: fmt(recomputed) }));
      if (pairs.length) out.push({ rule: 'amount_3way', level: 'error', docs: [d.name], message: i18nT('{p0} 金额对不上：{p1}', { p0: d.name, p1: pairs.join('；') }) });
      if (t.amountInWords && fromWords == null) out.push({ rule: 'words_unreadable', level: 'warning', docs: [d.name], message: i18nT('{p0} 的大写金额读不出数字：{p1}', { p0: d.name, p1: t.amountInWords.slice(0, 80) }) });
      for (const l of t.lines) {
        if (l.quantity == null || l.unitPrice == null || l.amount == null) continue;
        const options = [l.quantity * l.unitPrice, (l.quantity / 1000) * l.unitPrice, ((l.netWeightKg || 0) / 1000) * l.unitPrice];
        if (!options.some((v) => Math.abs(r2(v) - l.amount!) <= TOL_AMOUNT)) out.push({ rule: 'line_amount', level: 'warning', docs: [d.name], message: i18nT('{p0} 第 {p1} 行：数量 × 单价对不上金额 {p2}', { p0: d.name, p1: l.no ?? l.description, p2: fmt(l.amount) }) });
      }
    }
  }
  // 跨单据：CI ↔ PL、PI ↔ CI
  const by = (k: string) => withTable.filter((d) => d.kind === k);
  const pairs: Array<[FtOrderDoc, FtOrderDoc]> = [];
  for (const ci of by('CI')) { for (const pl of by('PL')) pairs.push([ci, pl]); for (const pi of by('PI')) pairs.push([pi, ci]); }
  for (const [a, b] of pairs) {
    const ta = a.table!;
    const tb = b.table!;
    const useNo = ta.lines.every((l) => l.no != null) && tb.lines.every((l) => l.no != null);
    const mb = new Map(tb.lines.map((l) => [lineKey(l, useNo), l]));
    const seen = new Set<string>();
    const names = [a.name, b.name];
    for (const la of ta.lines) {
      const key = lineKey(la, useNo);
      const lb = mb.get(key);
      if (!lb) { out.push({ rule: 'unmatched_line', level: 'warning', docs: names, message: i18nT('{p0} 的「{p1}」在 {p2} 里找不到对应行', { p0: a.name, p1: la.description || la.no, p2: b.name }) }); continue; }
      seen.add(key);
      const label = la.description || String(la.no);
      if (differs(la.quantity, lb.quantity, 0)) out.push({ rule: 'qty', level: 'error', docs: names, message: i18nT('「{p0}」数量：{p1} 写 {a}，{p2} 写 {b}', { p0: label, p1: a.name, p2: b.name, a: fmt(la.quantity), b: fmt(lb.quantity) }) });
      if (differs(la.unitPrice, lb.unitPrice, 0.0001)) out.push({ rule: 'price', level: 'error', docs: names, message: i18nT('「{p0}」单价：{p1} 写 {a}，{p2} 写 {b}', { p0: label, p1: a.name, p2: b.name, a: String(la.unitPrice), b: String(lb.unitPrice) }) });
      // 装箱单的行净重是「每箱重 × 箱数」（每箱重取两位小数），与实重最多差 0.005 kg × 箱数（trade-pipeline B3）
      if (differs(la.netWeightKg, lb.netWeightKg, Math.max(TOL_KG, 0.005 * (lb.cartons || la.cartons || 0) + 1e-9))) out.push({ rule: 'line_nw', level: 'error', docs: names, message: i18nT('「{p0}」净重：{p1} 写 {a} kg，{p2} 写 {b} kg', { p0: label, p1: a.name, p2: b.name, a: fmt(la.netWeightKg), b: fmt(lb.netWeightKg) }) });
    }
    for (const lb of tb.lines) if (!seen.has(lineKey(lb, useNo))) out.push({ rule: 'unmatched_line', level: 'warning', docs: names, message: i18nT('{p0} 的「{p1}」在 {p2} 里找不到对应行', { p0: b.name, p1: lb.description || lb.no, p2: a.name }) });
    if (b.kind === 'PL' && tb.lines.every((l) => l.unitPrice == null)) out.push({ rule: 'price_skipped', level: 'info', docs: names, message: i18nT('{p0} 没有单价列，单价这一项没有参与比对（不算核对通过）', { p0: b.name }) });
    if (differs(ta.netWeightKg, tb.netWeightKg, TOL_KG)) out.push({ rule: 'total_nw', level: 'error', docs: names, message: i18nT('总净重：{p0} {a} kg，{p1} {b} kg', { p0: a.name, p1: b.name, a: fmt(ta.netWeightKg), b: fmt(tb.netWeightKg) }) });
    if (differs(ta.grossWeightKg, tb.grossWeightKg, TOL_KG)) out.push({ rule: 'total_gw', level: 'error', docs: names, message: i18nT('总毛重：{p0} {a} kg，{p1} {b} kg', { p0: a.name, p1: b.name, a: fmt(ta.grossWeightKg), b: fmt(tb.grossWeightKg) }) });
    if (a.kind === 'PI' && differs(ta.total, tb.total)) out.push({ rule: 'pi_ci_total', level: 'warning', docs: names, message: i18nT('PI 合计 {a} 与 CI 合计 {b} 不同（分批出货时正常，否则请核对）', { a: fmt(ta.total), b: fmt(tb.total) }) });
  }
  return out;
}
