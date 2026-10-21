/**
 * ZATCA 电子发票二维码（TLV，base64）解析与票面核对（第 5.6 节 A5，第 13.4 节电子发票）。纯函数。
 *
 *   标签 1 卖方名称、2 卖方增值税号、3 开票时间戳、4 含税总额、5 增值税额（第一阶段必有）；
 *   6 发票哈希、7 ECDSA 签名、8 公钥（第二阶段起有，9 为简化发票的证书签名）。
 *   增值税号 15 位、首尾都是 3。核对：卖方名称、税号、开票日期、含税总额、增值税额与报销表里的票面一致。
 * 只核对二维码与票面是否一致，不验证签名（验签要 ZATCA 证书链，平台查验由人在 FATOORA 上做）。
 */
import type { FauZatcaQr } from '@totalclaw/ipc-contracts';

export interface TlvField { tag: number; value: string }

export function decodeTlv(base64: string): TlvField[] | null {
  let buf: Buffer;
  try {
    const s = String(base64 || '').replace(/\s+/g, '');
    if (!s || !/^[A-Za-z0-9+/=_-]+$/.test(s)) return null;
    buf = Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  } catch { return null; }
  const out: TlvField[] = [];
  let i = 0;
  while (i < buf.length) {
    if (i + 2 > buf.length) return null;
    const tag = buf[i];
    const len = buf[i + 1];
    if (i + 2 + len > buf.length || tag === 0) return null;
    const raw = buf.subarray(i + 2, i + 2 + len);
    // 第二阶段的哈希 / 签名 / 公钥是二进制，按 base64 留着；前五个是 UTF-8 文本
    out.push({ tag, value: tag <= 5 ? raw.toString('utf8') : raw.toString('base64') });
    i += 2 + len;
  }
  return out.length ? out : null;
}

export function encodeTlv(fields: TlvField[]): string {
  const parts = fields.map((f) => {
    const v = Buffer.from(f.value, 'utf8');
    return Buffer.concat([Buffer.from([f.tag, v.length]), v]);
  });
  return Buffer.concat(parts).toString('base64');
}

const decimalCents = (s: string): number | null => {
  const t = String(s || '').trim();
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const [i, d = ''] = t.replace('-', '').split('.');
  const c = Number(i) * 100 + Number((d + '00').slice(0, 2));
  return t.startsWith('-') ? -c : c;
};
const norm = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();

export function checkZatcaQr(
  qr: string, face: { sellerName: string; sellerTaxId: string; invoiceDate: string; total: number; tax: number }, tol = 1,
): FauZatcaQr {
  const fields = decodeTlv(qr);
  if (!fields) return { ok: false, phase: 1, sellerName: '', vatNo: '', timestamp: '', total: null, vat: null, problems: ['decode'] };
  const get = (t: number) => fields.find((f) => f.tag === t)?.value ?? '';
  const sellerName = get(1);
  const vatNo = get(2);
  const timestamp = get(3);
  const total = decimalCents(get(4));
  const vat = decimalCents(get(5));
  const problems: string[] = [];
  if ([1, 2, 3, 4, 5].some((t) => !fields.some((f) => f.tag === t))) problems.push('missing_tags');
  if (vatNo && !/^3\d{13}3$/.test(vatNo)) problems.push('vat_no_format');
  if (face.sellerName && sellerName && norm(face.sellerName) !== norm(sellerName)) problems.push('seller');
  if (face.sellerTaxId && vatNo && face.sellerTaxId !== vatNo) problems.push('vat_no');
  if (face.invoiceDate && timestamp && timestamp.slice(0, 10) !== face.invoiceDate) problems.push('date');
  if (total != null && Math.abs(total - face.total) > tol) problems.push('total');
  if (vat != null && Math.abs(vat - face.tax) > tol) problems.push('vat');
  const phase: 1 | 2 = [6, 7, 8].every((t) => fields.some((f) => f.tag === t)) ? 2 : 1;
  return { ok: !problems.length, phase, sellerName, vatNo, timestamp, total, vat, problems };
}
