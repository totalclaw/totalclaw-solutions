/**
 * B6 抽取结果回原文核对（纯函数）：值必须在引用里、引用必须在原文里；司法辖区代码与日期只要求引用能定位。
 * 定位不到的事实类字段直接丢弃，记进 dropped（第 6.4 节第 4 条）。
 */
import type { FauKycRecord, FauKycValue } from '@totalclaw/ipc-contracts';
import type { KycOut } from '../../../prompts/kyc';
import { locate, type LoadedDoc } from '../docs';

const norm = (s: string) => String(s || '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();

function check(docs: LoadedDoc[], v: { value: string; quote: string; docName: string } | null, valueInQuote: boolean): FauKycValue | null {
  if (!v || !v.value.trim()) return null;
  if (valueInQuote && !norm(v.quote).includes(norm(v.value))) return null;
  const loc = locate(docs, v.quote, v.docName);
  return loc.verified ? { value: v.value.trim(), quote: v.quote, docName: loc.docName, verified: true } : null;
}

export function verifyKyc(out: KycOut, docs: LoadedDoc[]): FauKycRecord {
  const dropped: string[] = [];
  const keep = (key: string, v: KycOut['legalName'], inQuote = true) => {
    const r = check(docs, v, inQuote);
    if (!r && v?.value) dropped.push(key);
    return r;
  };
  const known = new Set(docs.map((d) => d.name));
  return {
    applicantType: out.applicantType || '',
    legalName: keep('legalName', out.legalName),
    dobOrFormation: keep('dobOrFormation', out.dobOrFormation, false),
    jurisdiction: (() => { const r = keep('jurisdiction', out.jurisdiction, false); return r ? { ...r, value: r.value.toUpperCase().slice(0, 2) } : null; })(),
    address: keep('address', out.address),
    sourceOfFunds: keep('sourceOfFunds', out.sourceOfFunds, false),
    pepDeclared: out.pepDeclared,
    idDocuments: out.idDocuments.flatMap((d, i) => { const n = keep(`idDocuments[${i}]`, d.number); return n ? [{ type: d.type, number: n, expiry: /^\d{4}-\d{2}-\d{2}$/.test(d.expiry) ? d.expiry : '' }] : []; }),
    beneficialOwners: out.beneficialOwners.flatMap((b, i) => { const n = keep(`beneficialOwners[${i}]`, b.name); return n ? [{ name: n, nationality: b.nationality.toUpperCase(), pct: b.pct }] : []; }),
    controllers: out.controllers.flatMap((c, i) => { const n = keep(`controllers[${i}]`, c.name); return n ? [{ name: n, role: c.role }] : []; }),
    // 文件清单只认真实上传的文件名（模型编的文件名丢弃）
    documents: out.documents.filter((d) => known.has(d.docName)).map((d) => ({ type: d.type, docName: d.docName, date: /^\d{4}-\d{2}-\d{2}$/.test(d.date) ? d.date : '' })),
    dropped,
  };
}
