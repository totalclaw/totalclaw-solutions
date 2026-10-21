/**
 * 合同财税审核智能体（纯函数部分）：合同类型、金额、印花税、固定规则的涉税风险。
 *
 * 模型抽取的条款与风险在 ipc 层做「引用回原文核对」，核不上的条款标未核实、风险直接丢弃；
 * 这里的规则部分不依赖模型，没有模型也能出一份基础审核结果。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { FaCalcLine, FaContractClause, FaFinding } from '@totalclaw/ipc-contracts';
import { fmt, foundIn, normalizeForMatch, round2 } from './common';
import RULES from './contractRules.json';

type TypeRule = { type: string; keywords: string[]; rate: number };
type CheckRule = { code: string; level: FaFinding['level']; absent?: string; present?: string };
const TYPES = RULES.types as TypeRule[];
const CHECKS = RULES.checks as CheckRule[];

export function typeLabel(type: string): string {
  const L: Record<string, string> = {
    借款合同: i18nT('借款合同'), 融资租赁合同: i18nT('融资租赁合同'), 建设工程合同: i18nT('建设工程合同'), 技术合同: i18nT('技术合同'),
    运输合同: i18nT('运输合同'), 承揽合同: i18nT('承揽合同'), 租赁合同: i18nT('租赁合同'), 仓储合同: i18nT('仓储合同'),
    保管合同: i18nT('保管合同'), 财产保险合同: i18nT('财产保险合同'), 产权转移书据: i18nT('产权转移书据'), 买卖合同: i18nT('买卖合同'),
    服务合同: i18nT('服务合同'), 其他: i18nT('其他'),
  };
  return L[type] || type;
}

function checkText(code: string): { title: string; suggestion: string } {
  const T: Record<string, { title: string; suggestion: string }> = {
    no_invoice_type: { title: i18nT('没有约定发票'), suggestion: i18nT('写明开具发票的类型（增值税专用 / 普通发票）、税率与开票时间；采购方未取得专票将无法抵扣进项') },
    no_tax_rate: { title: i18nT('价款没有写明是否含税 / 税率'), suggestion: i18nT('价款条款写明「含税价 X 元，其中不含税价 Y 元、增值税 Z 元，税率 N%」，价税分离还能少缴印花税') },
    no_invoice_time: { title: i18nT('没有约定开票时间'), suggestion: i18nT('约定在付款前若干日内开具发票，避免先付款后拿不到票') },
    invoice_after_payment: { title: i18nT('先付款后开票'), suggestion: i18nT('作为付款方，约定「先票后款」或按付款进度分次开票；全额付款后才开票，一旦对方不开票，进项无法抵扣、成本缺少扣除凭证') },
    no_payment: { title: i18nT('没有付款条款'), suggestion: i18nT('写明付款节点、比例和期限；增值税纳税义务发生时间与收款或书面约定的付款日挂钩') },
    tax_inclusive_burden: { title: i18nT('包税 / 税后价条款'), suggestion: i18nT('法定纳税人不因合同约定改变；包税条款要把税费折算进价款并约定对方开票，否则可能出现代扣代缴义务与票据缺失') },
    cash_payment: { title: i18nT('约定现金支付'), suggestion: i18nT('大额现金支付难以证明业务真实性，改为对公转账') },
    personal_account: { title: i18nT('约定付款到个人账户'), suggestion: i18nT('付款到个人账户与合同主体不一致，存在资金、发票、合同三流不一致风险，改为对公账户') },
    no_fake_invoice_clause: { title: i18nT('没有发票不合规的责任条款'), suggestion: i18nT('加上：提供的发票不合规或被认定虚开的，对方负责重开并赔偿因此产生的税款、滞纳金与罚款') },
    no_rate_change: { title: i18nT('没有约定税率调整怎么办'), suggestion: i18nT('约定「如遇国家税率调整，不含税价不变，按开票时适用税率计算含税价」') },
  };
  return T[code] || { title: code, suggestion: '' };
}

export function detectContractType(text: string): TypeRule | null {
  const head = String(text || '').slice(0, 1500);
  return TYPES.find((t) => t.keywords.some((k) => head.includes(k))) || TYPES.find((t) => t.keywords.some((k) => text.includes(k))) || null;
}

/** 合同金额：优先「合同总价 / 总金额」附近的数字；「万元」换算成元。同时读有没有单列增值税 */
export function extractContractAmount(text: string): { total: number | null; exclTax: number | null; quote: string } {
  const t = String(text || '').replace(/[,，]/g, '');
  const re = /(合同(?:总)?(?:金额|价款|总价)|总(?:金额|价款|价)|价款(?:合计)?|含税(?:总)?(?:价|金额)|租金总额|借款金额)[^0-9¥￥\n]{0,12}[¥￥]?\s*(\d+(?:\.\d{1,2})?)\s*(万元|万|元)?/;
  const m = t.match(re);
  let total: number | null = null;
  if (m) total = round2(Number(m[2]) * (/万/.test(m[3] || '') ? 10_000 : 1));
  const ex = t.match(/(?:不含税(?:价|金额|总价)?)[^0-9¥￥\n]{0,8}[¥￥]?\s*(\d+(?:\.\d{1,2})?)\s*(万元|万|元)?/);
  const exclTax = ex ? round2(Number(ex[1]) * (/万/.test(ex[2] || '') ? 10_000 : 1)) : null;
  return { total, exclTax, quote: m ? m[0] : '' };
}

export function stampDuty(type: TypeRule | null, total: number | null, exclTax: number | null): FaCalcLine[] | null {
  if (!type || !total) return null;
  if (!type.rate) return [{ label: i18nT('印花税'), formula: i18nT('{p0}不在印花税税目内，不缴', { p0: typeLabel(type.type) }), value: 0 }];
  const base = exclTax ?? total;
  return [
    { label: i18nT('计税依据'), formula: exclTax != null ? i18nT('合同列明不含税金额') : i18nT('合同金额（未单列增值税，按全额）'), value: base },
    { label: i18nT('适用税率'), formula: i18nT('{p0}：{r}', { p0: typeLabel(type.type), r: `${round2(type.rate * 10000) / 10}‰` }), value: type.rate },
    { label: i18nT('应纳印花税（每一方）'), formula: `${fmt(base)} × ${round2(type.rate * 10000) / 10}‰`, value: round2(base * type.rate) },
  ];
}

export function ruleFindings(text: string): FaFinding[] {
  const out: FaFinding[] = [];
  for (const c of CHECKS) {
    let hit = false;
    let quote = '';
    if (c.absent) hit = !new RegExp(c.absent).test(text);
    if (c.present) {
      const m = text.match(new RegExp(`[^。；\\n]{0,30}(?:${c.present})[^。；\\n]{0,30}`));
      hit = !!m;
      quote = m?.[0]?.trim() || '';
    }
    if (!hit) continue;
    const tx = checkText(c.code);
    out.push({ code: c.code, level: c.level, title: tx.title, detail: quote ? i18nT('原文：「{p0}」', { p0: quote }) : i18nT('全文没有找到相关约定'), suggestion: tx.suggestion });
  }
  return out;
}

/** 模型抽的条款：引用核对，核不上的标未核实 */
export function verifyClauses(raw: unknown, text: string): FaContractClause[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 30).map((c: any) => ({
    type: String(c?.type || '').slice(0, 20),
    quote: String(c?.quote || '').slice(0, 300),
    value: String(c?.value || '').slice(0, 200),
    verified: foundIn(text, c?.quote),
  })).filter((c) => c.type && (c.quote || c.value));
}

/** 模型提的风险：必须带能在原文找到的引用，否则丢掉；与规则结果重复的不再加 */
export function verifyLlmRisks(raw: unknown, text: string, existing: FaFinding[]): FaFinding[] {
  if (!Array.isArray(raw)) return [];
  const out: FaFinding[] = [];
  for (const r of raw.slice(0, 15)) {
    const quote = String((r as any)?.quote || '');
    if (!foundIn(text, quote)) continue;
    const title = String((r as any)?.title || '').slice(0, 60);
    if (!title || existing.some((e) => e.title === title)) continue;
    // 规则已经抓到同一句原文的（包税、付款到个人账户这类），模型换个说法再报一遍只是重复
    const q = normalizeForMatch(quote);
    if ([...existing, ...out].some((e) => e.code !== 'llm' && e.detail && (() => { const d = normalizeForMatch(e.detail); return q.length >= 6 && (d.includes(q.slice(0, 12)) || q.includes(d.slice(4, 16))); })())) continue;
    const level = ['high', 'warn', 'info'].includes((r as any)?.level) ? (r as any).level : 'warn';
    out.push({
      code: 'llm', level, title, detail: i18nT('原文：「{p0}」{p1}', { p0: quote.slice(0, 200), p1: (r as any)?.detail ? `\n${String((r as any).detail).slice(0, 300)}` : '' }),
      suggestion: String((r as any)?.suggestion || '').slice(0, 300),
    });
  }
  return out;
}
