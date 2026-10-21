/**
 * SWIFT MT940 银行对账单解析（第 7.1 节 bank 数据集，批次 2）。纯函数，只读文本，不执行任何东西。
 *
 *   :25: 账号；:28C: 对账单号；:60F: / :60M: 期初（D/C + YYMMDD + 币种 + 金额，逗号小数）；
 *   :61: 交易行（起息日 YYMMDD [+ 记账日 MMDD] + C / D / RC / RD + [资金码] + 金额 + 交易类型 + 客户参考 [//银行参考] [换行补充说明]）；
 *   :86: 交易附言（多行，到下一个标签为止）；:62F: / :62M: 期末。
 * RC（贷记冲正）按支出、RD（借记冲正）按收入。金额一律最小货币单位整数。
 * 一个文件里可以有多张对账单（多账户 / 多页），可以带 SWIFT 信封 {1:}{2:}{4: … -}。
 */

export interface StatementTx {
  /** 文件里的行号（1-based），追溯用 */
  line: number;
  valueDate: string;
  /** 记账日（没有就等于起息日） */
  bookingDate: string;
  /** 收为正、付为负 */
  amount: number;
  reversal: boolean;
  ref: string;
  bankRef: string;
  counterparty: string;
  summary: string;
  typeCode: string;
}

export interface StatementBalance { date: string; amount: number }

export interface BankStatement {
  format: 'mt940' | 'camt053';
  account: string;
  currency: string;
  statementNo: string;
  opening: StatementBalance | null;
  closing: StatementBalance | null;
  txs: StatementTx[];
  /** 跳过的交易（如 CAMT 的 PDNG 未记账条目） */
  skipped: number;
}

/** 「1234,56」「1234,」→ 分 */
export function swiftAmountToCents(s: string): number {
  const [i, d = ''] = String(s || '0').trim().split(',');
  return Number(i || '0') * 100 + Number((d + '00').slice(0, 2));
}

/** YYMMDD → YYYY-MM-DD（YY < 80 记 20YY） */
export function yymmdd(s: string): string {
  if (!/^\d{6}$/.test(s)) return '';
  const yy = Number(s.slice(0, 2));
  return `${yy < 80 ? 2000 + yy : 1900 + yy}-${s.slice(2, 4)}-${s.slice(4, 6)}`;
}

/** :61: 的记账日只有 MMDD：跨年时按起息日推年份 */
function bookingFrom(valueDate: string, mmdd: string | undefined): string {
  if (!mmdd || !valueDate) return valueDate;
  let y = Number(valueDate.slice(0, 4));
  const vm = Number(valueDate.slice(5, 7));
  const bm = Number(mmdd.slice(0, 2));
  if (vm === 12 && bm === 1) y += 1;
  else if (vm === 1 && bm === 12) y -= 1;
  return `${y}-${mmdd.slice(0, 2)}-${mmdd.slice(2, 4)}`;
}

function balanceOf(v: string): { date: string; currency: string; amount: number } | null {
  const m = /^([CD])(\d{6})([A-Z]{3})([\d,]+)/.exec(v.trim());
  if (!m) return null;
  const amt = swiftAmountToCents(m[4]);
  return { date: yymmdd(m[2]), currency: m[3], amount: m[1] === 'D' ? -amt : amt };
}

/** :86: 附言：常见的两种结构化写法里取对方户名（?32/?33 或 /NAME/），其余原样当摘要 */
function splitInfo(info: string): { counterparty: string; summary: string } {
  const t = info.replace(/\s*\n\s*/g, '');
  if (/\?\d{2}/.test(t)) {
    const fields = new Map<string, string>();
    for (const m of t.matchAll(/\?(\d{2})([^?]*)/g)) fields.set(m[1], `${fields.get(m[1]) || ''}${m[2]}`);
    const purpose = [...fields.entries()].filter(([k]) => Number(k) >= 20 && Number(k) <= 29).map(([, v]) => v).join(' ').trim();
    return { counterparty: `${fields.get('32') || ''}${fields.get('33') || ''}`.trim(), summary: purpose || t.replace(/\?\d{2}/g, ' ').trim() };
  }
  const name = /\/(?:BENM\/\/NAME|ORDP\/\/NAME|NAME)\/([^/]+)/.exec(t);
  const remi = /\/REMI\/(?:USTD\/\/)?([^/]+)/.exec(t);
  return { counterparty: name ? name[1].trim() : '', summary: (remi ? remi[1] : info.replace(/\s*\n\s*/g, ' ')).trim() };
}

const TX_RE = /^(\d{6})(\d{4})?(RC|RD|C|D)([A-Z])?(\d[\d,]*)([NSF][A-Z0-9]{3})?([^\n]*)/;

export function parseMt940(text: string): BankStatement[] {
  const lines = String(text || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  // 拼成「标签 + 值（含续行）」的序列，记下标签所在行号
  const fields: { tag: string; value: string; line: number }[] = [];
  lines.forEach((raw, i) => {
    const l = raw.replace(/^\{4:/, '');
    const m = /^:(\d{2}[A-Z]?):(.*)$/.exec(l);
    if (m) fields.push({ tag: m[1], value: m[2], line: i + 1 });
    else if (fields.length && !/^-\}?\s*$/.test(l) && !/^\{[1-5]:/.test(l)) fields[fields.length - 1].value += `\n${l}`;
  });
  const out: BankStatement[] = [];
  let cur: BankStatement | null = null;
  let lastTx: StatementTx | null = null;
  const flush = () => { if (cur) out.push(cur); cur = null; lastTx = null; };
  for (const f of fields) {
    switch (f.tag) {
      case '20': flush(); cur = { format: 'mt940', account: '', currency: '', statementNo: '', opening: null, closing: null, txs: [], skipped: 0 }; break;
      case '25': if (cur) cur.account = f.value.trim(); break;
      case '28C': if (cur) cur.statementNo = f.value.trim(); break;
      case '60F': case '60M': {
        const b = balanceOf(f.value);
        if (cur && b) { cur.opening = { date: b.date, amount: b.amount }; cur.currency = b.currency; }
        break;
      }
      case '62F': case '62M': {
        const b = balanceOf(f.value);
        if (cur && b) { cur.closing = { date: b.date, amount: b.amount }; cur.currency = cur.currency || b.currency; }
        break;
      }
      case '61': {
        if (!cur) break;
        const [first, ...rest] = f.value.split('\n');
        const m = TX_RE.exec(first.trim());
        if (!m) break;
        const valueDate = yymmdd(m[1]);
        const amt = swiftAmountToCents(m[5]);
        const credit = m[3] === 'C' || m[3] === 'RD';
        const [ref, bankRef = ''] = (m[7] || '').split('//');
        lastTx = {
          line: f.line, valueDate, bookingDate: bookingFrom(valueDate, m[2]), amount: credit ? amt : -amt, reversal: m[3].startsWith('R'),
          ref: /^NONREF$/i.test(ref.trim()) ? bankRef.trim() : ref.trim(), bankRef: bankRef.trim(),
          counterparty: '', summary: rest.join(' ').trim(), typeCode: m[6] || '',
        };
        cur.txs.push(lastTx);
        break;
      }
      case '86': {
        if (!lastTx) break;
        const info = splitInfo(f.value);
        lastTx.counterparty = info.counterparty;
        lastTx.summary = [lastTx.summary, info.summary].filter(Boolean).join(' ');
        break;
      }
      default: break;
    }
  }
  flush();
  return out.filter((s) => s.account || s.txs.length);
}
