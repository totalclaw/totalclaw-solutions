import { openSpreadsheetFile, readWorksheetData } from '../spreadsheetRead';
/**
 * 服务商结算工作台 · Excel 读写底座。
 *
 * 四个模块（好评激励 / 结案汇总 / 报废台账 / 营销激励）的输入全是业务同事从京东、天猫、
 * 费控系统、有赞、CSS 导出来的 Excel，列名五花八门（"服务商" / "服务商名称" / "网点" …）。
 * 这里只做两件事：
 *   1. 把任意 .xlsx/.xls/.csv 读成 {headers, rows}（第一行为表头，空行丢弃）；
 *   2. 按「关键字优先级」自动识别业务列（服务商列、金额列、条码列…），识别结果回给界面
 *      让用户确认 / 改选——小白不需要懂列名，只需要看一眼"识别到的是不是那一列"。
 *
 * 计算逻辑不在这里，见 reviewIncentive.ts / settlementSummary.ts / scrapLedger.ts / marketingIncentive.ts。
 */
import * as XLSX from 'xlsx';
import { basename, extname } from 'path';
import { t as i18nT } from '@totalclaw/i18n';
import columnKeywords from './columnKeywords.json';
import DK from './dataKeywords.json';

export interface SheetTable {
  /** 来源文件（绝对路径） */
  path: string;
  fileName: string;
  sheetName: string;
  headers: string[];
  /** 每行按表头取值，单元格转成 string（数字保留原值的字符串形式） */
  rows: Record<string, string>[];
}

export interface ReadOptions {
  /** 只读这个 sheet；不传读第一个非空 sheet */
  sheetName?: string;
  /** 表头所在行（0-based）；不传自动找「非空单元格最多」的前 10 行之一 */
  headerRowIndex?: number;
}

function cellToString(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof v === 'number') {
    // 避免 0.1+0.2 这类浮点尾巴进到界面
    return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6)));
  }
  return String(v).trim();
}

/** 找表头行：前 10 行里非空单元格最多且含至少 2 个文本格的那一行 */
export function detectHeaderRow(aoa: unknown[][]): number {
  let best = 0;
  let bestScore = -1;
  const limit = Math.min(aoa.length, 10);
  for (let i = 0; i < limit; i += 1) {
    const row = aoa[i] || [];
    const nonEmpty = row.filter((c) => cellToString(c) !== '');
    const textCount = nonEmpty.filter((c) => typeof c === 'string').length;
    if (textCount < 2) continue;
    const score = nonEmpty.length * 2 + textCount;
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return best;
}

export function listSheetNames(path: string): string[] {
  const wb = openSpreadsheetFile(path, { bookSheets: true });
  return wb.SheetNames || [];
}

/** 读一个表。CSV 也走这里（xlsx 能识别）。 */
export function readTable(path: string, options: ReadOptions = {}): SheetTable {
  const wb = openSpreadsheetFile(path, { cellDates: true, raw: false });
  const names = wb.SheetNames || [];
  if (!names.length) throw new Error(i18nT('文件没有任何工作表：{p0}', { p0: basename(path) }));
  let sheetName = options.sheetName && names.includes(options.sheetName) ? options.sheetName : '';
  if (!sheetName) {
    // 第一个有内容的 sheet
    sheetName = names.find((n) => {
      const ws = wb.Sheets[n];
      return ws && ws['!ref'];
    }) || names[0];
  }
  const ws = wb.Sheets[sheetName];
  const aoa = readWorksheetData(ws, { raw: true, defval: null }).rows;
  if (!aoa.length) return { path, fileName: basename(path), sheetName, headers: [], rows: [] };
  const headerIdx = options.headerRowIndex ?? detectHeaderRow(aoa);
  const rawHeaders = (aoa[headerIdx] || []).map((h) => cellToString(h));
  // 空表头补成 "列X"，重复表头加序号——否则 rows[header] 会互相覆盖
  const seen = new Map<string, number>();
  const headers = rawHeaders.map((h, i) => {
    let name = h || i18nT('列{p0}', { p0: i + 1 });
    const count = seen.get(name) || 0;
    seen.set(name, count + 1);
    if (count > 0) name = `${name}(${count + 1})`;
    return name;
  });
  const rows: Record<string, string>[] = [];
  for (let r = headerIdx + 1; r < aoa.length; r += 1) {
    const line = aoa[r] || [];
    const obj: Record<string, string> = {};
    let nonEmpty = 0;
    headers.forEach((h, i) => {
      const s = cellToString(line[i]);
      if (s !== '') nonEmpty += 1;
      obj[h] = s;
    });
    if (nonEmpty === 0) continue;
    rows.push(obj);
  }
  return { path, fileName: basename(path), sheetName, headers, rows };
}

/** 读一个文件里的所有 sheet（结案汇总的「各项激励及补扣表格」一个文件可能好几个子表） */
export function readAllSheets(path: string): SheetTable[] {
  const names = listSheetNames(path);
  const out: SheetTable[] = [];
  for (const n of names) {
    try {
      const t = readTable(path, { sheetName: n });
      if (t.headers.length && t.rows.length) out.push(t);
    } catch { /* 单个 sheet 坏了不影响其它 */ }
  }
  return out;
}

// ── 列识别 ────────────────────────────────────────────────────────────────────

/**
 * 业务列角色 → 候选关键字（优先级从高到低，先精确匹配再包含匹配）。
 * 放在 JSON 里而不是 TS 字面量：这些是**匹配导出表表头用的中文数据**，不是展示文案，
 * 不能被 i18n codemod 包成 t() —— 切到英文界面后还得认得出"服务商名称"这一列。
 */
export const COLUMN_KEYWORDS: Record<string, string[]> = columnKeywords as Record<string, string[]>;

/**
 * 各角色「能不选就别选」的表头特征（2026-09-03 灌客户真实结案表实测）：
 *   provider：旧机回收表同时有「自建单服务商」（二级）和「建单一级服务商全称」，抽查明细有「服务商名称」
 *             与「一级服务商名称」，包含匹配按表头顺序先撞上二级 → 511 家 vs 真实 216 家一级服务商；
 *   amount：7 月补扣总表「原金额 | 已补扣金额 | 待补扣金额」选了原金额，工单补贴「基础补贴金额 | 本次应用补贴金额」
 *           选了基础金额 —— 结算要的是本次应结的那列。
 *   task：区域经理延保任务表「二季度目标 | 4月任务」按关键字「任务」先撞上「4月任务」（月份专列）→ 季度任务缩成 1/3，
 *         5 折判定全部失真（2026-09-03 营销激励审查 P0-3）；月份专列（4月 / 四月…开头）一律避开。
 *   date：营销激励订单表的「季度」「月份」标签列也算日期列（Q1 / 4月 / 04 会按季度筛），但「二季度目标」「季度任务」
 *         这类任务列含同样的字，不能被当成日期（P0-2）。
 * 规则：先在避开这些特征的列里找，一个都没有再退回全表。
 */
const COLUMN_AVOID: Record<string, RegExp> = {
  provider: /二级|编码|编号|代码|\bid\b|手机|电话|类型/i,
  amount: /原金额|基础|单价|已补扣|目标|任务|上限|折扣|系数|比例|率|说明|备注/,
  task: /完成|实际|达成|金额$|^\d{1,2}月|^[一二三四五六七八九十]+月/,
  date: /任务|目标|完成|数量|金额|率/,
  // 评价 / 满意度：天猫表「评价分数 | 评价月份 | 评价内容标签」靠列序才选对分数列，标签 / 备注 / 月份类一律避开
  rating: /时间|日期|月份|内容|标签|说明|备注|原因/,
  satisfaction: /时间|日期|月份|内容|标签|说明|备注|原因/,
};

/** 在表头里找某个角色的列；返回列名或 '' */
export function detectColumn(headers: string[], role: keyof typeof COLUMN_KEYWORDS | string, exclude: string[] = []): string {
  const keywords = COLUMN_KEYWORDS[role] || [];
  const avoid = COLUMN_AVOID[role];
  const basePool = headers.filter((h) => !exclude.includes(h));
  if (avoid) {
    const preferred = basePool.filter((h) => !avoid.test(h));
    if (preferred.length && preferred.length < basePool.length) {
      const hit = detectInPool(preferred, keywords);
      if (hit) return hit;
    }
  }
  return detectInPool(basePool, keywords);
}

function detectInPool(pool: string[], keywords: string[]): string {
  const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  // 非时间角色的包含匹配要避开时间列：真实数据里「评价时间」「满意度投票时间」这类表头
  // 会被『评价』『满意度』的包含匹配抢先命中（2026-08-31 灌真实好评明细实测:rating 认成
  // 「评价时间」→ 374 家服务商全部 0 好评 0 差评,结果表整张空转)。关键字本身含时间字样
  //（date 角色的「下单时间」等）不受影响。
  const timeLike = /时间|日期/;
  // 按关键字优先级逐个找：同一个关键字先精确再包含。
  // 不能「全部关键字先精确、再全部包含」：达人样机核销表同时有「总金额」「需申请核销金额」，
  // 后者才是本次应结的数（前者是含不核销部分的合计），精确命中「总金额」会把高优先级的
  // 「申请核销金额」包含匹配挤掉（2026-09-03 实测少算 510 元，3 家服务商 0 元）。
  for (const kw of keywords) {
    const exact = pool.find((h) => norm(h) === norm(kw));
    if (exact) return exact;
    const kwIsTime = timeLike.test(kw);
    const hit = pool.find((h) => norm(h).includes(norm(kw)) && (kwIsTime || !timeLike.test(h)));
    if (hit) return hit;
  }
  return '';
}

/** 一次识别多个角色，后识别的角色不会重复挑中前面已占用的列 */
export function detectColumns(headers: string[], roles: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  const used: string[] = [];
  for (const role of roles) {
    const col = detectColumn(headers, role, used);
    out[role] = col;
    if (col) used.push(col);
  }
  return out;
}

// ── 数值 / 判定工具 ──────────────────────────────────────────────────────────────

/**
 * 服务商名称归一：去首尾空格、压掉内部空白、半角括号转全角。
 * 客户各张表里同一家写法不一（「…（个体工商户)」半角右括号、「 中山市…」带前导空格），
 * 不归一会拆成两家、出两个附件（2026-09-03 实测「南关区顺盈安装服务中心」在两张表里括号不同）。
 */
export function normalizeProviderName(v: unknown): string {
  return String(v ?? '')
    .replace(/[\s　]+/g, '')
    .replace(/\(/g, DK.fullWidthParens[0]) // 半角 ( → 全角（；常量放 JSON，免得被 i18n codemod 当文案
    .replace(/\)/g, DK.fullWidthParens[1]) // 半角 ) → 全角）
    .trim();
}

/**
 * 服务商别名归并：归一化后再查别名表（键、值都是归一名）。
 * 客户会把改过名的同一家按一个主体付款（2026-09-07 实报：「宁波市鄞州新河亿天」并进「宁波市鄞州亿天」），
 * 明细里两个名字都出现，不归并就拆成两家、金额对不上。别名表来自通讯录的「别名」列。
 */
export function canonicalProvider(v: unknown, aliases?: Record<string, string> | null): string {
  const n = normalizeProviderName(v);
  if (!n || !aliases) return n;
  const hit = aliases[n];
  return hit ? normalizeProviderName(hit) : n;
}

/**
 * 服务商名称「骨架」：归一 → 去掉括号里的内容（（个体工商户））→ 去掉「市」→ 循环剥掉结尾的
 * 法律形态 / 业态词（有限公司 / 服务部 / 商行 / 电器 …，见 dataKeywords.providerVariant）。
 * 两个名字骨架相等 = 同一家的不同写法。2026-09-07 客户对账实测的四类写法差：
 *   甘肃海象 ↔ 甘肃海象商贸有限公司；大同开发区美和乐电器经销部 ↔ 大同市开发区美和乐电器经销部；
 *   惠州市惠阳区淡水金粤新电器服务商 ↔ …服务部；黄山高新区鑫禾源电器商行 ↔ …商行（个体工商户）。
 * 「宁波市鄞州新河亿天」和「宁波市鄞州亿天」骨架不同——那是客户按一家付款的商业决定，只能走别名。
 */
export function providerSkeleton(v: unknown): string {
  let s = normalizeProviderName(v).replace(/（[^（）]*）/g, '');
  for (const ch of DK.providerVariant.dropChars) s = s.split(ch).join('');
  let changed = true;
  while (changed && s.length > 2) {
    changed = false;
    for (const suf of DK.providerVariant.legalSuffixes) {
      if (s.length > suf.length + 1 && s.endsWith(suf)) { s = s.slice(0, -suf.length); changed = true; }
    }
  }
  return s;
}

export interface ProviderMerge { from: string; to: string }

/**
 * 把「明细里出现的名字」归到「通讯录里的规范名」，生成别名表（连同手工别名一起返回，手工优先）。
 * 规则只在**唯一命中**时归并：骨架相等；或骨架互为前缀（短的 ≥4 字）。命中多家 = 不归并，宁可拆开也不并错。
 * 通讯录没有的名字，再在本次出现的名字之间互相归并（规范名取最长的那个——全称通常更长）。
 * 客户 2026-07 总表就是这么手工合并的：核算前不并，同一家在汇总表里出两行、拆分附件出两个文件。
 */
export function buildProviderAliasMap(opts: {
  directory?: Iterable<string>;
  aliases?: Record<string, string> | null;
  observed?: Iterable<string>;
}): { map: Record<string, string>; merges: ProviderMerge[] } {
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(opts.aliases || {})) {
    const nk = normalizeProviderName(k);
    const nv = normalizeProviderName(v);
    if (nk && nv && nk !== nv) map[nk] = nv;
  }
  const dirNames = [...new Set([...(opts.directory || [])].map((n) => normalizeProviderName(n)).filter(Boolean))];
  const dirSet = new Set(dirNames);
  const observed = [...new Set([...(opts.observed || [])].map((n) => normalizeProviderName(n)).filter(Boolean))];
  const merges: ProviderMerge[] = [];
  const skelOf = new Map<string, string>();
  const skel = (n: string): string => {
    let s = skelOf.get(n);
    if (s === undefined) { s = providerSkeleton(n); skelOf.set(n, s); }
    return s;
  };
  const unique = <T>(arr: T[]): T | undefined => (arr.length === 1 ? arr[0] : undefined);
  const findIn = (pool: string[], n: string): string | undefined => {
    const sk = skel(n);
    if (sk.length < 2) return undefined;
    const others = pool.filter((c) => c !== n);
    const equal = unique(others.filter((c) => skel(c) === sk));
    if (equal) return equal;
    if (sk.length < 4) return undefined;
    return unique(others.filter((c) => {
      const cs = skel(c);
      return cs.length >= 4 && cs !== sk && (cs.startsWith(sk) || sk.startsWith(cs));
    }));
  };
  const add = (from: string, to: string): void => {
    if (!from || !to || from === to || map[from]) return;
    map[from] = to;
    merges.push({ from, to });
  };
  // ① 明细名 → 通讯录规范名
  const leftovers: string[] = [];
  for (const n of observed) {
    if (map[n] || dirSet.has(n)) continue;
    const hit = findIn(dirNames, n);
    if (hit) add(n, hit); else leftovers.push(n);
  }
  // ② 通讯录没有的：本次出现的名字之间互相归并，规范名取最长。
  //    骨架相同的一组（甘肃海象 / 甘肃海象商贸 / 甘肃海象商贸有限公司）整组并到最长的；前缀关系仍要求唯一。
  const longestFirst = (a: string, b: string) => b.length - a.length || a.localeCompare(b, 'zh-CN');
  const groups = new Map<string, string[]>();
  for (const n of leftovers) {
    const sk = skel(n);
    if (sk.length < 2) continue;
    const g = groups.get(sk);
    if (g) g.push(n); else groups.set(sk, [n]);
  }
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    const canon = [...g].sort(longestFirst)[0];
    for (const n of g) add(n, canon);
  }
  const rest = leftovers.filter((n) => !map[n]).sort(longestFirst);
  for (const n of rest) {
    if (map[n]) continue;
    const sk = skel(n);
    if (sk.length < 4) continue;
    const hit = unique(rest.filter((c) => {
      if (c === n || map[c]) return false;
      const cs = skel(c);
      return cs.length >= 4 && cs !== sk && (cs.startsWith(sk) || sk.startsWith(cs));
    }));
    if (!hit) continue;
    const [from, to] = hit.length >= n.length ? [n, hit] : [hit, n];
    add(from, to);
  }
  // ③ 压平链：a→b、b→c 变成 a→c；规范名自身不能再是别名
  for (const k of Object.keys(map)) {
    let target = map[k];
    const seen = new Set([k]);
    while (map[target] && !seen.has(target)) { seen.add(target); target = map[target]; }
    map[k] = target;
  }
  for (const m of merges) m.to = map[m.from];
  return { map, merges };
}

/** "1,234.50 元" / "¥1234" / "12%" → number；解析不了 = 0 */
export function toNumber(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = String(v ?? '').replace(/[,\s，元¥￥]/g, '');
  if (!s) return 0;
  const pct = /%$/.test(s);
  const n = Number(pct ? s.slice(0, -1) : s);
  if (!Number.isFinite(n)) return 0;
  return pct ? n / 100 : n;
}

/** "是/Y/yes/true/1/可/可以" → true；"否/N/no/false/0/不/不可" → false；其它 → undefined */
export function toBool(v: unknown): boolean | undefined {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return undefined;
  // 判定词用正则字面量写：它们是匹配导出数据的词，不是界面文案，不能进词典
  if (/^(是|y|yes|true|1|可|可以|可评价|计取|计入|√|✓|已评价|已评)$/.test(s)) return true;
  if (/^(否|n|no|false|0|不|不可|不可评价|不计取|不计入|×|x|未评价|未评)$/.test(s)) return false;
  if (/^不|^否|^未|^无/.test(s)) return false;
  if (/^是|^可|^已/.test(s)) return true;
  return undefined;
}

/**
 * 「是否计取 / 是否好评激励」列解析。京东安装真实导出该列取值是「好评激励 / /」
 * （2026-09-03 灌客户数据：123 行「/」没被剔除）——toBool 只认 是/否，这里补齐业务词。
 * 否定形态先判（「非好评激励」含「好评激励」子串）。空值 = 未知（不剔除）。
 */
export function toCounted(v: unknown): boolean | undefined {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return undefined;
  if (/^[\/\\—–\-]+$/.test(s)) return false;
  if (/非好评激励|不激励|无激励|不计|不纳|不统计|不参与|剔除/.test(s)) return false;
  if (/激励|计入|计取|纳入|参与/.test(s)) return true;
  return toBool(s);
}

/** 星级：支持 "5" / "五星" / "★★★★★" / "5星" / "好评"(=5) / "差评"(=1) / "中评"(=3) */
/**
 * 「是否差评」布尔列解析（京东安装评价明细真实导出没有星级列，只有这一列，
 * 取值实测为「差评 / 非差评」——2026-08-31 灌真实数据发现的 schema 缺口）。
 * ⚠ 否定形态必须先判（「非差评」含「差评」子串，与 toStars 的否定词教训同款）。
 */
export function toBadFlag(v: unknown): boolean | undefined {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return undefined;
  if (/非差评|不是差评|无差评|好评|中评/.test(s)) return false;
  if (/差评/.test(s)) return true;
  if (/^(是|y|yes|true|1)$/.test(s)) return true;
  if (/^(否|n|no|false|0)$/.test(s)) return false;
  return undefined;
}

export function toStars(v: unknown): number | null {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const starChars = (s.match(/★/g) || []).length;
  if (starChars) return starChars;
  const cn: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5 };
  const cnHit = s.match(/([一二三四五])星/);
  if (cnHit) return cn[cnHit[1]];
  const num = s.match(/(\d+(?:\.\d+)?)/);
  if (num) {
    const n = Number(num[1]);
    if (n >= 1 && n <= 5) return Math.round(n);
    // 百分制 / 十分制
    if (n > 5 && n <= 10) return Math.round(n / 2);
    if (n > 10 && n <= 100) return Math.round(n / 20);
  }
  // 否定词先判：「不满意」含「满意」二字，顺序反了会把差评算成 5 星
  if (/差评|不满意|不满|很差|极差/.test(s)) return 1;
  if (/中评|一般/.test(s)) return 3;
  if (/好评|非常满意|满意/.test(s)) return 5;
  if (/未评|无评|未评价|暂无/.test(s)) return null;
  return null;
}

// ── 写出 ──────────────────────────────────────────────────────────────────────

export interface OutSheet {
  name: string;
  headers: string[];
  /** Date 会写成真日期格（不是 "2026-07-10" 文本），客户在 Excel 里按日期筛选 / 排序才有效 */
  rows: (string | number | Date | null | undefined)[][];
  /** 列宽（字符数），不传按表头 + 内容估算 */
  colWidths?: number[];
}

/** Excel sheet 名不能含 : \ / ? * [ ] 且 ≤31 字符 */
export function safeSheetName(name: string, fallback = 'Sheet'): string {
  const cleaned = String(name || '').replace(/[:\\/?*[\]]/g, '_').trim().slice(0, 31);
  return cleaned || fallback;
}

/** 文件名去掉不能用的字符（服务商名里常见的 / 和 * ） */
export function safeFileName(name: string, fallback = 'file'): string {
  const cleaned = String(name || '').replace(/[\\/:*?"<>|\r\n]/g, '_').trim().slice(0, 120);
  return cleaned || fallback;
}

export function writeWorkbook(path: string, sheets: OutSheet[]): void {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();
  sheets.forEach((sheet, idx) => {
    let name = safeSheetName(sheet.name, `Sheet${idx + 1}`);
    let n = 2;
    while (usedNames.has(name)) {
      const suffix = `(${n})`;
      name = `${name.slice(0, 31 - suffix.length)}${suffix}`;
      n += 1;
    }
    usedNames.add(name);
    const aoa: (string | number | Date | null | undefined)[][] = [sheet.headers, ...sheet.rows];
    // dateNF：Date 格落成 yyyy-mm-dd 显示（默认 m/d/yy 两位年，与客户模板的 2026/8/1 风格差太远）
    const ws = XLSX.utils.aoa_to_sheet(aoa, { dateNF: 'yyyy-mm-dd' });
    const widths = sheet.colWidths || sheet.headers.map((h, ci) => {
      let max = String(h).length * 2;
      for (const r of sheet.rows.slice(0, 200)) {
        const cell = r[ci];
        const len = cell == null ? 0 : cell instanceof Date ? 10 : String(cell).replace(/[一-龥]/g, 'xx').length;
        if (len > max) max = len;
      }
      return Math.min(Math.max(max + 2, 8), 60);
    });
    ws['!cols'] = widths.map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, path);
}

export function isSpreadsheetFile(path: string): boolean {
  return ['.xlsx', '.xls', '.xlsm', '.csv'].includes(extname(path).toLowerCase());
}

/** 把一张 SheetTable 原样转成 OutSheet（按服务商拆分附件时要整行保留） */
export function tableToOutSheet(table: SheetTable, name?: string): OutSheet {
  return {
    name: name || table.sheetName,
    headers: table.headers,
    rows: table.rows.map((r) => table.headers.map((h) => r[h] ?? '')),
  };
}
