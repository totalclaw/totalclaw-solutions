/**
 * B6 名单匹配（纯函数）：规范化姓名（NFKC、小写、去标点与称谓、阿语去音符 / 统一字母变体）后，
 * 取「词序无关的 Jaro-Winkler」与「字符二元组 Dice」较大者作为相似度。强命中 / 疑似命中门槛见 thresholds/kyc.json。
 */
import type { FauKycHit } from '@totalclaw/ipc-contracts';
import type { ParsedTable } from '../table';

const TITLES = /\b(mr|mrs|ms|miss|dr|prof|sir|sheikh|shaikh|eng|hon)\b\.?/g;

export function normalizeName(s: string): string {
  return String(s || '').normalize('NFKC').toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/(^|\s)(السيد|الشيخ|الدكتور)(?=\s)/g, ' ')
    .replace(TITLES, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ').trim();
}

export function jaroWinkler(a: string, b: string): number {
  if (a === b) return a ? 1 : 0;
  if (!a || !b) return 0;
  const win = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const am = new Array(a.length).fill(false);
  const bm = new Array(b.length).fill(false);
  let m = 0;
  for (let i = 0; i < a.length; i += 1) {
    for (let j = Math.max(0, i - win); j < Math.min(b.length, i + win + 1); j += 1) {
      if (!bm[j] && a[i] === b[j]) { am[i] = true; bm[j] = true; m += 1; break; }
    }
  }
  if (!m) return 0;
  let tr = 0;
  let k = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (!am[i]) continue;
    while (!bm[k]) k += 1;
    if (a[i] !== b[k]) tr += 1;
    k += 1;
  }
  const jaro = (m / a.length + m / b.length + (m - tr / 2) / m) / 3;
  let p = 0;
  while (p < 4 && a[p] === b[p]) p += 1;
  return jaro + p * 0.1 * (1 - jaro);
}

function dice(a: string, b: string): number {
  const g = (s: string) => { const o: string[] = []; for (let i = 0; i < s.length - 1; i += 1) o.push(s.slice(i, i + 2)); return o; };
  const x = g(a.replace(/\s/g, ''));
  const y = g(b.replace(/\s/g, ''));
  if (!x.length || !y.length) return 0;
  const pool = [...y];
  let n = 0;
  for (const t of x) { const i = pool.indexOf(t); if (i >= 0) { n += 1; pool.splice(i, 1); } }
  return (2 * n) / (x.length + y.length);
}

export function nameSimilarity(a: string, b: string): number {
  const x = normalizeName(a);
  const y = normalizeName(b);
  if (!x || !y) return 0;
  const sorted = (s: string) => s.split(' ').sort().join(' ');
  return Math.max(jaroWinkler(sorted(x), sorted(y)), dice(x, y));
}

export interface WatchEntry { row: number; name: string; aliases: string[]; listName: string; country: string }

export function parseWatchlist(p: ParsedTable): WatchEntry[] {
  return p.rows.map((r) => ({ row: r.row, name: r.get('wlName'), aliases: r.get('aliases').split(/[;；|,，、]/).map((s) => s.trim()).filter(Boolean), listName: r.get('listName'), country: r.get('country') }))
    .filter((x) => x.name);
}

export function screenNames(subjects: Array<{ name: string; role: FauKycHit['role'] }>, list: WatchEntry[], th: Record<string, number>): FauKycHit[] {
  const strong = th['name.strong'] ?? 0.92;
  const possible = th['name.possible'] ?? 0.85;
  const out: FauKycHit[] = [];
  for (const s of subjects) {
    if (!s.name) continue;
    for (const e of list) {
      const score = Math.max(...[e.name, ...e.aliases].map((n) => nameSimilarity(s.name, n)));
      if (score >= possible) out.push({ subject: s.name, role: s.role, listName: e.listName, entry: e.name, score: Math.round(score * 1000) / 1000, strength: score >= strong ? 'strong' : 'possible' });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}
