/**
 * 配件预警与补库 —— 定时运算的取数：在数据文件夹里按文件名关键字找每类数据最新的一份。
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { PaDatasetKey } from '@totalclaw/ipc-contracts';

export interface FoundFile { path: string; name: string; mtimeMs: number }

/** 归属顺序：先认更具体的（按年、提前期、在途、库存），剩下带发货字样的才算按月 */
const ASSIGN_ORDER: PaDatasetKey[] = ['yearly', 'leadTime', 'inTransit', 'stock', 'monthly'];
const EXTS = new Set(['.xlsx', '.xls', '.xlsm', '.csv']);

export function datasetOfFileName(name: string, keywords: Record<PaDatasetKey, string[]>): PaDatasetKey | null {
  const n = name.toLowerCase();
  for (const k of ASSIGN_ORDER) {
    if ((keywords[k] || []).some((kw) => kw && n.includes(kw.toLowerCase()))) return k;
  }
  return null;
}

/** 每类数据取修改时间最新的一份；Excel 打开时生成的 ~$ 临时文件、隐藏文件不算 */
export function pickNewestFiles(folder: string, keywords: Record<PaDatasetKey, string[]>): Partial<Record<PaDatasetKey, FoundFile>> {
  const out: Partial<Record<PaDatasetKey, FoundFile>> = {};
  if (!folder || !existsSync(folder)) return out;
  for (const name of readdirSync(folder)) {
    if (name.startsWith('~$') || name.startsWith('.') || !EXTS.has(extname(name).toLowerCase())) continue;
    const key = datasetOfFileName(name, keywords);
    if (!key) continue;
    const path = join(folder, name);
    let mtimeMs = 0;
    try { const st = statSync(path); if (!st.isFile()) continue; mtimeMs = st.mtimeMs; } catch { continue; }
    const cur = out[key];
    if (!cur || mtimeMs > cur.mtimeMs || (mtimeMs === cur.mtimeMs && name > cur.name)) out[key] = { path, name, mtimeMs };
  }
  return out;
}

/** 到点了没有：今天还没跑过，且当前时间不早于设定时间 */
export function dueToday(time: string, lastRunDay: string | undefined, now = new Date()): boolean {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(time || ''));
  if (!m) return false;
  if (lastRunDay === localDay(now)) return false;
  return now.getHours() * 60 + now.getMinutes() >= Number(m[1]) * 60 + Number(m[2]);
}

export function localDay(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
