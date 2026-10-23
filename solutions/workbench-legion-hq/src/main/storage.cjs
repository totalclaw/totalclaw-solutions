/**
 * 产物存放位置（主控统一设置，便于查找与及时清理）。
 *
 * 产物根目录（默认在本方案数据目录下 files/，可改到任意文件夹，例如专门的数据盘）下：
 *   交付物/<日期>/<时分>-#<编号>-<标题>/   每件事办完自动落盘：00-结论.md + 各部门交付物（员工机的产出随结果回传主控，统一存这里）
 *   导出/                                   导出的 Word / 考卷报告默认存这里
 * 任务记录、录制在方案数据目录（大屏恢复与回放要读），只统计占用、可按天清理。
 * 日志：主控本机与各员工机的应用日志、引擎日志，由宿主 machine.storage 回报占用、按天清理。
 */
const { existsSync, lstatSync, mkdirSync, readdirSync, rmSync, unlinkSync, writeFileSync } = require('node:fs');
const { join, isAbsolute } = require('node:path');

const safe = (s, n = 40) => String(s || '').replace(/[\\/:*?"<>|\r\n\t]/g, '_').replace(/\s+/g, ' ').trim().slice(0, n) || '未命名';
const pad = (n) => String(n).padStart(2, '0');

function walk(dir, out = [], depth = 0) {
  if (depth > 6 || !existsSync(dir)) return out;
  let names = [];
  try { names = readdirSync(dir); } catch { return out; }
  for (const n of names) {
    const p = join(dir, n);
    let st;
    try { st = lstatSync(p); } catch { continue; }
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) walk(p, out, depth + 1);
    else if (st.isFile()) out.push({ path: p, size: st.size, mtimeMs: st.mtimeMs });
  }
  return out;
}

function measure(dir) {
  const fs = walk(dir);
  return { bytes: fs.reduce((n, f) => n + f.size, 0), files: fs.length };
}

/** 删 days 天前的文件；交付物按「日期文件夹」整个删（文件夹名早于截止日），其余按文件修改时间 */
function cleanOlderThan(dir, days, now = Date.now(), byDateFolder = false) {
  const cutoff = now - Math.max(1, days) * 86_400_000;
  let removed = 0;
  let freed = 0;
  if (!existsSync(dir)) return { removed, freed };
  if (byDateFolder) {
    const cut = new Date(cutoff);
    const cutKey = `${cut.getFullYear()}-${pad(cut.getMonth() + 1)}-${pad(cut.getDate())}`;
    for (const n of readdirSync(dir)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(n) || n >= cutKey) continue;
      const p = join(dir, n);
      const m = measure(p);
      try { rmSync(p, { recursive: true, force: true }); removed += m.files; freed += m.bytes; } catch { /* 占用中的跳过 */ }
    }
    return { removed, freed };
  }
  for (const f of walk(dir)) {
    if (f.mtimeMs > cutoff) continue;
    try { unlinkSync(f.path); removed++; freed += f.size; } catch { /* 跳过 */ }
  }
  return { removed, freed };
}

class Storage {
  /**
   * @param {object} o
   * @param {() => string|null} o.root        用户设置的产物根目录（null = 默认）
   * @param {() => string} o.defaultRoot      默认根目录（方案数据目录下 files/）
   * @param {() => Record<string,string>} o.internalDirs  任务记录 / 录制目录（只统计与清理）
   */
  constructor(o) {
    Object.assign(this, o);
  }

  rootDir() {
    const r = this.root();
    return r && isAbsolute(r) ? r : this.defaultRoot();
  }

  deliverablesDir() {
    return join(this.rootDir(), '交付物');
  }

  exportsDir() {
    return join(this.rootDir(), '导出');
  }

  /** 一件事办完（含待老板确认）：把结论与各部门交付物写成文件，返回文件夹路径 */
  writeDeliverables(rec, legionName, now = Date.now()) {
    const steps = rec?.plan?.steps || [];
    if (!rec || (!rec.summary && !steps.some((s) => rec.outputs?.[s.id]?.text))) return null;
    // 按收件时间定文件夹：待确认时写一次、批准后再写，落在同一个文件夹
    const d = new Date(rec.createdAt || now);
    const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const dir = join(this.deliverablesDir(), day, `${pad(d.getHours())}${pad(d.getMinutes())}-#${rec.no}-${safe(rec.title, 30)}`);
    mkdirSync(dir, { recursive: true });
    const head = `# #${rec.no} ${rec.title}\n\n老板交办：${rec.text || rec.title}\n\n`;
    if (rec.summary) writeFileSync(join(dir, '00-结论.md'), `${head}${rec.summary}\n`, 'utf8');
    steps.forEach((s, i) => {
      const o = rec.outputs?.[s.id];
      if (!o || (!o.text && !o.error)) return;
      const nm = legionName(s.legionId);
      writeFileSync(join(dir, `${pad(i + 1)}-${safe(nm, 12)}-${safe(s.goal, 30)}.md`), `# ${nm}：${s.goal}\n\n${o.error ? `（未完成：${o.error}）` : o.text}\n`, 'utf8');
    });
    return dir;
  }

  report() {
    const rows = [
      { key: 'deliverables', label: '交付物', dir: this.deliverablesDir(), movable: true },
      { key: 'exports', label: '导出', dir: this.exportsDir(), movable: true },
      ...Object.entries(this.internalDirs()).map(([key, dir]) => ({ key, label: key === 'tasks' ? '任务记录' : key === 'records' ? '录制' : key, dir, movable: false })),
    ];
    return { root: this.rootDir(), custom: !!this.root(), rows: rows.map((r) => ({ ...r, ...measure(r.dir) })) };
  }

  clean(key, days, now = Date.now()) {
    const rep = this.report().rows.find((r) => r.key === key);
    if (!rep) throw new Error(`没有这类产物：${key}`);
    return cleanOlderThan(rep.dir, days, now, key === 'deliverables');
  }
}

module.exports = { Storage, cleanOlderThan, measure, safeName: safe };
