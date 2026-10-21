/**
 * ISO 20022 CAMT.053（BkToCstmrStmt）银行对账单解析（批次 2）。纯函数。
 *
 *   Stmt：Acct/Id/IBAN 或 Acct/Id/Othr/Id 为账号；Bal 里 OPBD / PRCD 为期初、CLBD 为期末；
 *   Ntry：Amt@Ccy + CdtDbtInd（CRDT 收 / DBIT 付）；RvslInd=true 是冲正，方向按相反读（与 MT940 的 RC / RD 同义）；
 *         只收已记账（Sts=BOOK，含 v8+ 的 Sts/Cd）条目，其余记为跳过；
 *         参考号依次取 AcctSvcrRef → EndToEndId → TxId；对方取 Dbtr / Cdtr 名称（收款取付款人，付款取收款人）；
 *         摘要取 RmtInf/Ustrd，没有再取 AddtlNtryInf。
 * 不引 XML 依赖：一个只认元素、属性、文本、CDATA、注释的小解析器就够（命名空间前缀去掉）。
 */
import type { BankStatement, StatementTx } from './mt940';

export interface XNode { name: string; attrs: Record<string, string>; children: XNode[]; text: string }

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENT[e] ?? m;
  });
}
const local = (n: string) => n.replace(/^[^:]+:/, '');

export function parseXmlLite(xml: string): XNode {
  const root: XNode = { name: '#root', attrs: {}, children: [], text: '' };
  const stack: XNode[] = [root];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<\/([^\s>]+)\s*>|<([^\s/>]+)((?:\s+[^\s=]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
  for (const m of String(xml || '').replace(/^﻿/, '').matchAll(re)) {
    const top = stack[stack.length - 1];
    if (m[1] !== undefined) top.text += m[1];
    else if (m[2]) { if (stack.length > 1) stack.pop(); }
    else if (m[3]) {
      const attrs: Record<string, string> = {};
      for (const a of (m[4] || '').matchAll(/([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[local(a[1])] = decode(a[2] ?? a[3] ?? '');
      const node: XNode = { name: local(m[3]), attrs, children: [], text: '' };
      top.children.push(node);
      if (!m[5]) stack.push(node);
    } else if (m[6]) top.text += decode(m[6]);
  }
  return root;
}

const kids = (n: XNode | undefined, name: string) => (n ? n.children.filter((c) => c.name === name) : []);
const kid = (n: XNode | undefined, name: string) => kids(n, name)[0];
/** 按路径取第一个节点：path('Acct/Id/IBAN') */
function at(n: XNode | undefined, path: string): XNode | undefined {
  let cur = n;
  for (const p of path.split('/')) cur = kid(cur, p);
  return cur;
}
const txt = (n: XNode | undefined, path?: string) => (path ? at(n, path) : n)?.text.trim() || '';
function find(n: XNode, name: string): XNode[] {
  const out: XNode[] = [];
  const walk = (x: XNode) => { for (const c of x.children) { if (c.name === name) out.push(c); walk(c); } };
  walk(n);
  return out;
}
/** 「1234.56」→ 分 */
function decimalToCents(s: string): number {
  const [i, d = ''] = String(s || '0').trim().split('.');
  return Number(i || '0') * 100 + Number((d + '00').slice(0, 2));
}
const dateOf = (n: XNode | undefined) => (txt(n, 'Dt') || txt(n, 'DtTm')).slice(0, 10);

export function parseCamt053(xml: string): BankStatement[] {
  const doc = parseXmlLite(xml);
  const out: BankStatement[] = [];
  for (const st of find(doc, 'Stmt')) {
    const acct = kid(st, 'Acct');
    const s: BankStatement = {
      format: 'camt053', account: txt(acct, 'Id/IBAN') || txt(acct, 'Id/Othr/Id'), currency: txt(acct, 'Ccy'),
      statementNo: txt(st, 'ElctrncSeqNb') || txt(st, 'LglSeqNb') || txt(st, 'Id'), opening: null, closing: null, txs: [], skipped: 0,
    };
    for (const b of kids(st, 'Bal')) {
      const code = txt(b, 'Tp/CdOrPrtry/Cd') || txt(b, 'Tp/CdOrPrtry/Prtry');
      const amtNode = kid(b, 'Amt');
      const amt = decimalToCents(txt(amtNode)) * (txt(b, 'CdtDbtInd') === 'DBIT' ? -1 : 1);
      s.currency = s.currency || amtNode?.attrs.Ccy || '';
      if ((code === 'OPBD' || code === 'PRCD') && !s.opening) s.opening = { date: dateOf(kid(b, 'Dt')), amount: amt };
      if (code === 'CLBD') s.closing = { date: dateOf(kid(b, 'Dt')), amount: amt };
    }
    kids(st, 'Ntry').forEach((e, i) => {
      const status = txt(e, 'Sts/Cd') || txt(e, 'Sts');
      if (status && status !== 'BOOK') { s.skipped += 1; return; }
      const reversal = /^true$/i.test(txt(e, 'RvslInd'));
      const credit = (txt(e, 'CdtDbtInd') === 'CRDT') !== reversal;
      const cents = decimalToCents(txt(e, 'Amt'));
      const tx = kid(kid(e, 'NtryDtls'), 'TxDtls');
      const party = credit ? (txt(tx, 'RltdPties/Dbtr/Nm') || txt(tx, 'RltdPties/Dbtr/Pty/Nm')) : (txt(tx, 'RltdPties/Cdtr/Nm') || txt(tx, 'RltdPties/Cdtr/Pty/Nm'));
      const ustrd = find(e, 'Ustrd').map((u) => u.text.trim()).filter(Boolean).join(' ');
      const ref = txt(e, 'AcctSvcrRef') || txt(tx, 'Refs/AcctSvcrRef') || txt(tx, 'Refs/EndToEndId') || txt(tx, 'Refs/TxId');
      const t: StatementTx = {
        // CAMT 没有行号概念：记第 N 条分录（1-based），追溯时按「第 N 条 Ntry」找
        line: i + 1, valueDate: dateOf(kid(e, 'ValDt')) || dateOf(kid(e, 'BookgDt')), bookingDate: dateOf(kid(e, 'BookgDt')) || dateOf(kid(e, 'ValDt')),
        amount: credit ? cents : -cents, reversal, ref: /^NOTPROVIDED$/i.test(ref) ? '' : ref, bankRef: txt(e, 'AcctSvcrRef'),
        counterparty: party, summary: ustrd || txt(e, 'AddtlNtryInf'), typeCode: txt(e, 'BkTxCd/Domn/Cd') || txt(e, 'BkTxCd/Prtry/Cd'),
      };
      s.txs.push(t);
    });
    out.push(s);
  }
  return out;
}
