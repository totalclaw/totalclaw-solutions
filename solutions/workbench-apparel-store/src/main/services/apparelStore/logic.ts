/**
 * 服装实体店智能体 · 纯规则（不碰文件、不调模型，全部可单测）。
 *
 *   - 试穿码：6 位，去掉易混字符（0/O、1/I/L）；
 *   - 尺码助手：身高体重 × 尺码表规则算，不交给模型；
 *   - 换装提示词：顾客照片 + 服装图（+ 自定义背景）→ 固定约束 + 选项库的英文画面描述；
 *   - 形象分析 / 打标签的模型输出只收选项库里有的 id，库外的丢弃；
 *   - 看板统计、保留期到期判定。
 */
import type {
  ApAudience, ApBodyShape, ApCustomer, ApGarment, ApPhotoCheck, ApStats, ApStyleChoice, ApSuggestion, ApTryon,
} from '@totalclaw/ipc-contracts';
import type { StyleOptionDef } from './styleOptions';

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function newTryonCode(taken: Set<string>, rand: () => number = Math.random): string {
  for (let attempt = 0; attempt < 1000; attempt++) {
    let s = '';
    for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length) % CODE_ALPHABET.length];
    if (!taken.has(s)) return s;
  }
  throw new Error('TRYON_CODE_EXHAUSTED');
}

export function normalizeCode(raw: string): string {
  return String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1').slice(0, 6);
}

/** 试穿码比对时，顾客把 0/O、1/I/L 读混也能对上 */
export function codeMatches(stored: string, input: string): boolean {
  return normalizeCode(stored) === normalizeCode(input) && normalizeCode(input).length === 6;
}

// ── 尺码助手 ─────────────────────────────────────────────

const LETTER_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL', '4XL'];
const LETTER_RANK: Record<string, number> = { XXS: 0, XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, '2XL': 6, XXXL: 7, '3XL': 7, '4XL': 8 };
/** [身高上限 cm, 体重上限 kg] → S / M / L / XL / XXL（国标常用对照，偏宽松取值） */
const CHART: Record<'women' | 'men', Array<[number, number, string]>> = {
  women: [[155, 47, 'S'], [162, 54, 'M'], [168, 61, 'L'], [174, 69, 'XL'], [999, 999, 'XXL']],
  men: [[165, 57, 'S'], [172, 65, 'M'], [178, 74, 'L'], [184, 84, 'XL'], [999, 999, 'XXL']],
};

function sizeRank(size: string): number | null {
  const s = size.trim().toUpperCase();
  if (s in LETTER_RANK) return LETTER_RANK[s];
  return null;
}

function leadingNumber(size: string): number | null {
  const m = /^(\d{2,3})/.exec(size.trim());
  return m ? Number(m[1]) : null;
}

/**
 * 推荐尺码。没填身高就不推荐（返回 undefined）——不给没有依据的建议。
 * 字母码按尺码表取身高、体重两者中较大的一档；数字码（童装 110/120、女装 160/84A）按身高取不小于身高的最小一档。
 * 推荐档不在售时取最接近的在售档，优先偏大一档（宽松能穿，偏小穿不上）。
 */
export function recommendSize(audience: ApAudience, sizes: string[], heightCm?: number, weightKg?: number): string | undefined {
  const avail = sizes.map((s) => s.trim()).filter(Boolean);
  if (!avail.length || !heightCm || heightCm < 50 || heightCm > 230) return undefined;
  const numeric = avail.filter((s) => leadingNumber(s) != null);
  if (numeric.length === avail.length || audience === 'kids') {
    const list = numeric.map((s) => ({ s, n: leadingNumber(s)! })).sort((a, b) => a.n - b.n);
    if (!list.length) return undefined;
    return (list.find((x) => x.n >= heightCm) || list[list.length - 1]).s;
  }
  const chart = CHART[audience === 'men' ? 'men' : 'women'];
  const byH = chart.findIndex(([h]) => heightCm <= h);
  const byW = weightKg && weightKg > 20 && weightKg < 250 ? chart.findIndex(([, w]) => weightKg <= w) : -1;
  const target = chart[Math.max(byH, byW, 0)][2];
  const targetRank = LETTER_RANK[target];
  const ranked = avail.map((s) => ({ s, r: sizeRank(s) })).filter((x): x is { s: string; r: number } => x.r != null);
  if (!ranked.length) return undefined;
  const exact = ranked.find((x) => x.r === targetRank);
  if (exact) return exact.s;
  const bigger = ranked.filter((x) => x.r > targetRank).sort((a, b) => a.r - b.r)[0];
  if (bigger) return bigger.s;
  return ranked.sort((a, b) => b.r - a.r)[0].s;
}

/** 尺码表（上架详情里的尺码表图用）：字母码给身高 / 体重参考区间，数字码按身高 */
export function sizeChartRows(audience: ApAudience, sizes: string[]): Array<{ size: string; height: string; weight: string }> {
  const chart = CHART[audience === 'men' ? 'men' : 'women'];
  return sortSizes(sizes).map((size) => {
    const n = leadingNumber(size);
    if (n != null && (audience === 'kids' || sizeRank(size) == null)) return { size, height: `≤ ${n} cm`, weight: '—' };
    const r = sizeRank(size);
    const idx = r == null ? -1 : chart.findIndex(([, , s]) => LETTER_RANK[s] === r);
    if (idx < 0) return { size, height: '—', weight: '—' };
    const lo = idx > 0 ? chart[idx - 1] : null;
    const hi = chart[idx];
    const range = (a: number | null, b: number, unit: string) => (b >= 999 ? `> ${a} ${unit}` : a == null ? `≤ ${b} ${unit}` : `${a + 1}–${b} ${unit}`);
    return { size, height: range(lo ? lo[0] : null, hi[0], 'cm'), weight: range(lo ? lo[1] : null, hi[1], 'kg') };
  });
}

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ra = sizeRank(a); const rb = sizeRank(b);
    if (ra != null && rb != null) return ra - rb;
    const na = leadingNumber(a); const nb = leadingNumber(b);
    if (na != null && nb != null) return na - nb;
    return a.localeCompare(b);
  });
}

export function parseSizes(raw: string): string[] {
  return sortSizes([...new Set(String(raw || '').split(/[,，、/／\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean))]);
}

// ── 造型选择 ─────────────────────────────────────────────

export const DEFAULT_CHOICE: ApStyleChoice = { backgroundId: 'B29', backgroundVariant: 'B29-1', poseId: 'P01', poseVariant: 'P01-1', hairId: 'H00' };

/** 把任意来源的选择归一到选项库：id 不存在就回落默认，细分不属于该项就去掉 */
export function normalizeChoice(raw: Partial<ApStyleChoice> | undefined, defs: StyleOptionDef[]): ApStyleChoice {
  const pick = (kind: 'background' | 'pose' | 'hair', id: unknown, variant: unknown, fallback: string): [string, string | undefined] => {
    const opt = defs.find((d) => d.kind === kind && d.id === id) || defs.find((d) => d.id === fallback)!;
    const v = opt.variants.find((x) => x.id === variant);
    return [opt.id, v?.id];
  };
  const [backgroundId, backgroundVariant] = pick('background', raw?.backgroundId, raw?.backgroundVariant, DEFAULT_CHOICE.backgroundId);
  const [poseId, poseVariant] = pick('pose', raw?.poseId, raw?.poseVariant, DEFAULT_CHOICE.poseId);
  const [hairId, hairVariant] = pick('hair', raw?.hairId, raw?.hairVariant, DEFAULT_CHOICE.hairId);
  const out: ApStyleChoice = { backgroundId, poseId, hairId };
  if (backgroundVariant) out.backgroundVariant = backgroundVariant;
  if (poseVariant) out.poseVariant = poseVariant;
  if (hairVariant) out.hairVariant = hairVariant;
  if (raw?.customBackground && defs.find((d) => d.id === backgroundId)?.needsUpload) out.customBackground = raw.customBackground;
  return out;
}

export function choiceKey(c: ApStyleChoice): string {
  return [c.backgroundId, c.backgroundVariant || '', c.poseId, c.poseVariant || '', c.hairId, c.hairVariant || '', c.customBackground || ''].join('|');
}

function describe(defs: StyleOptionDef[], id: string, variant?: string): string {
  const opt = defs.find((d) => d.id === id);
  if (!opt) return '';
  const v = opt.variants.find((x) => x.id === variant);
  return v ? `${opt.prompt}, ${v.prompt}` : opt.prompt;
}

export type GarmentCoverage = 'top' | 'bottom' | 'full' | 'unknown';

const FULL_RE = /连衣裙|连体|套装|旗袍|礼服|睡裙|dress|jumpsuit|romper|gown|\bsuit\b/i;
const BOTTOM_RE = /裤|半身裙|短裙|长裙|裙裤|skirt|pants|trousers|jeans|shorts|leggings/i;
const TOP_RE = /上衣|T恤|t恤|衬衫|衬衣|卫衣|针织|毛衣|外套|夹克|大衣|风衣|西装|马甲|背心|吊带|打底衫|polo|开衫|羽绒|棉服|罩衫|雪纺衫|tee|shirt|blouse|hoodie|sweater|jacket|coat|blazer|vest|tank|cardigan|\btop\b/i;

/** 商品覆盖哪一段身体：按品类判断，品类为空再看名称；判不出交给模型看图 */
export function garmentCoverage(garment: Pick<ApGarment, 'category' | 'name'>): GarmentCoverage {
  for (const text of [garment.category, garment.name]) {
    const s = String(text || '');
    if (!s) continue;
    if (FULL_RE.test(s)) return 'full';
    if (BOTTOM_RE.test(s)) return 'bottom';
    if (TOP_RE.test(s)) return 'top';
  }
  return 'unknown';
}

/** 只换一件时其余衣物怎么处理 —— 不写清楚模型会把整身都换成这件，单买上衣就光腿 */
function coverageRule(coverage: GarmentCoverage): string {
  const fallback = 'If image 1 does not show suitable ones, add plain neutral-colored ones that match the style.';
  switch (coverage) {
    case 'top':
      return `The garment is a TOP: replace only the upper-body clothing. Keep the customer's bottoms (trousers / skirt) and shoes from image 1. ${fallback}`;
    case 'bottom':
      return `The garment is a BOTTOM: replace only the lower-body clothing. Keep the customer's top and shoes from image 1. ${fallback}`;
    case 'full':
      return 'The garment is a one-piece outfit: it replaces both top and bottom clothing; keep or choose shoes that match.';
    default:
      return `Judge from image 2 whether the garment is a top, a bottom or a one-piece outfit, and replace only that part of the clothing; keep the rest of the outfit from image 1. ${fallback}`;
  }
}

/**
 * 换装提示词。图片顺序固定：第 1 张顾客、第 2 张服装、第 3 张（可选）自定义背景。
 * 约束写死：保脸、保身材、服装按商品图还原 —— 这是「看起来像不像我穿这件」的全部前提。
 */
export function buildTryonPrompt(garment: Pick<ApGarment, 'category' | 'color' | 'fabric' | 'name'>, choice: ApStyleChoice, defs: StyleOptionDef[]): string {
  const hair = choice.hairId === 'H00' ? 'Keep the person\'s own hairstyle exactly as in image 1.' : `Hairstyle: ${describe(defs, choice.hairId, choice.hairVariant)}.`;
  const bgOpt = defs.find((d) => d.id === choice.backgroundId);
  const bg = bgOpt?.needsUpload && choice.customBackground
    ? 'Background: use image 3 as the background scene, keep it recognizable.'
    : `Background: ${describe(defs, choice.backgroundId, choice.backgroundVariant)}.`;
  const garmentDesc = [garment.color, garment.fabric, garment.category].filter(Boolean).join(' ');
  // 保脸写在最前、写成硬约束：顾客要看的是「自己」穿上的样子，脸被模型重画成别人这张图就没用了（门店实测反馈）
  return [
    'Virtual try-on photo editing. Image 1 is the customer. Image 2 is the garment product photo.',
    'IDENTITY LOCK (highest priority, overrides every other instruction): this is the same real person as image 1, not a model or a look-alike.',
    'Keep the customer\'s face exactly as in image 1: same face shape, eyes, eyebrows, nose, mouth, ears, age, expression, skin tone, skin texture, moles, makeup and glasses.',
    'Do not redraw, beautify, slim, smooth, whiten, de-age or stylize the face. Do not take any face from image 2 or image 3; ignore any model wearing the garment in image 2.',
    'Keep the customer\'s body shape, height and proportions identical to image 1. Only the clothing, pose, hair (if asked) and background may change.',
    `Dress the customer from image 1 in the garment from image 2${garmentDesc ? ` (${garmentDesc})` : ''}.`,
    'Reproduce the garment faithfully: same color, print/pattern, fabric texture, cut, length and details as image 2.',
    coverageRule(garmentCoverage(garment)),
    'The customer must always be fully and decently dressed: never bare legs without trousers, shorts or a skirt, never underwear only.',
    `Pose: ${describe(defs, choice.poseId, choice.poseVariant)}.`,
    hair,
    bg,
    'Photorealistic, natural lighting consistent with the scene, natural fabric folds, full body visible from head to shoes, single person, portrait 3:4 composition, no text, no watermark.',
  ].join(' ');
}

/** 形象分析的模型输出 → 只收选项库里有的推荐，最多 3 组 */
export function sanitizeSuggestions(raw: unknown, defs: StyleOptionDef[], audience?: ApAudience): ApSuggestion[] {
  const list = Array.isArray(raw) ? raw : [];
  const out: ApSuggestion[] = [];
  const has = (kind: string, id: unknown) => defs.some((d) => d.kind === kind && d.id === id && (!audience || d.audience.includes(audience)));
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    if (!has('background', r.backgroundId) || !has('pose', r.poseId) || !has('hair', r.hairId)) continue;
    if (defs.find((d) => d.id === r.backgroundId)?.needsUpload) continue;
    const c = normalizeChoice(r as Partial<ApStyleChoice>, defs);
    if (out.some((x) => choiceKey(x) === choiceKey(c))) continue;
    out.push({ ...c, reason: String(r.reason || '').slice(0, 120) });
    if (out.length >= 3) break;
  }
  return out;
}

const BODY_SHAPES: ApBodyShape[] = ['pear', 'apple', 'hourglass', 'rectangle', 'inverted_triangle'];
export function normalizeBodyShape(raw: unknown): ApBodyShape {
  const s = String(raw || '').toLowerCase().replace(/[\s-]+/g, '_');
  return (BODY_SHAPES as string[]).includes(s) ? (s as ApBodyShape) : 'unknown';
}

export function normalizePhotoCheck(raw: any): ApPhotoCheck {
  const issues = Array.isArray(raw?.issues) ? raw.issues.map((x: unknown) => String(x).slice(0, 60)).filter(Boolean).slice(0, 4) : [];
  // 模型明说不合格、或列出了问题，都按不合格处理；只有明确 ok 且没问题才放行
  return { ok: raw?.ok !== false && !issues.length, issues };
}

/** 保脸核对的模型输出 → 只有明说 same=false 才算换了脸（核对本身答不上来不拦，免得把好图判废） */
export function normalizeFaceMatch(raw: any): { same: boolean; reason: string } {
  const same = raw?.same === false || String(raw?.same).toLowerCase() === 'false' ? false : true;
  return { same, reason: String(raw?.reason || '').slice(0, 40) };
}

const AUDIENCES: ApAudience[] = ['women', 'men', 'kids'];
export function normalizeAudience(raw: unknown, fallback: ApAudience = 'women'): ApAudience {
  const s = String(raw || '').toLowerCase();
  if ((AUDIENCES as string[]).includes(s)) return s as ApAudience;
  if (/男|men|male/.test(s)) return 'men';
  if (/童|kid|child/.test(s)) return 'kids';
  if (/女|women|female/.test(s)) return 'women';
  return fallback;
}

// ── 看板 ─────────────────────────────────────────────

function countBy<T>(items: T[], key: (x: T) => string): Array<{ id: string; count: number }> {
  const m = new Map<string, number>();
  for (const it of items) { const k = key(it); if (k) m.set(k, (m.get(k) || 0) + 1); }
  return [...m].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

const ratio = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 1000) / 1000 : 0);

export function computeStats(garments: ApGarment[], customers: ApCustomer[], tryons: ApTryon[], days = 14, now = new Date()): ApStats {
  const done = tryons.filter((t) => t.status === 'done');
  const want = tryons.filter((t) => t.wantVisit);
  const tried = tryons.filter((t) => t.visit && (t.visit.status === 'tried' || t.visit.status === 'purchased' || t.visit.status === 'left'));
  const purchased = tryons.filter((t) => t.visit?.status === 'purchased');
  const gStats = garments.map((g) => {
    const mine = tryons.filter((t) => t.garmentId === g.id);
    return {
      garmentId: g.id, name: g.name,
      tryons: mine.length,
      done: mine.filter((t) => t.status === 'done').length,
      wantVisit: mine.filter((t) => t.wantVisit).length,
      tried: mine.filter((t) => t.visit && t.visit.status !== 'prepared').length,
      purchased: mine.filter((t) => t.visit?.status === 'purchased').length,
    };
  }).sort((a, b) => b.tryons - a.tryons || a.name.localeCompare(b.name));

  // 高试穿低成交：试穿量排前 30% 且成交率排后 30%（至少 5 次试穿才有统计意义）
  const eligible = gStats.filter((g) => g.done >= 5);
  const lagging: string[] = [];
  if (eligible.length >= 2) {
    const topN = Math.max(1, Math.ceil(eligible.length * 0.3));
    const byTry = [...eligible].sort((a, b) => b.done - a.done).slice(0, topN).map((g) => g.garmentId);
    const byConv = [...eligible].sort((a, b) => a.purchased / a.done - b.purchased / b.done).slice(0, topN).map((g) => g.garmentId);
    for (const id of byTry) if (byConv.includes(id)) lagging.push(id);
  }

  const combos = countBy(done, (t) => `${t.choice.backgroundId}|${t.choice.poseId}|${t.choice.hairId}`).slice(0, 10)
    .map(({ id, count }) => { const [backgroundId, poseId, hairId] = id.split('|'); return { backgroundId, poseId, hairId, count }; });

  const byDay: ApStats['byDay'] = [];
  const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const k = dayKey(d);
    byDay.push({
      day: k,
      tryons: tryons.filter((t) => dayKey(new Date(t.createdAt)) === k).length,
      purchased: purchased.filter((t) => t.visit && dayKey(new Date(t.visit.at)) === k).length,
    });
  }

  return {
    tryons: tryons.length,
    done: done.length,
    failed: tryons.filter((t) => t.status === 'failed').length,
    customers: customers.length,
    mobileShare: ratio(tryons.filter((t) => t.source === 'mobile').length, tryons.length),
    wantVisit: want.length,
    tried: tried.length,
    purchased: purchased.length,
    wantRate: ratio(want.length, done.length),
    visitRate: ratio(tried.length, want.length),
    closeRate: ratio(purchased.length, tried.length),
    garments: gStats,
    lagging,
    combos,
    backgrounds: countBy(done, (t) => t.choice.backgroundId),
    poses: countBy(done, (t) => t.choice.poseId),
    hairs: countBy(done, (t) => t.choice.hairId),
    byDay,
  };
}

// ── 隐私 ─────────────────────────────────────────────

/** 到期要清除的顾客：创建时间超过保留天数且还没清过 */
export function expiredCustomers(customers: ApCustomer[], retentionDays: number, now = Date.now()): ApCustomer[] {
  const days = Math.min(Math.max(Math.round(retentionDays) || 7, 1), 30);
  const cutoff = now - days * 86_400_000;
  return customers.filter((c) => !c.purgedAt && Date.parse(c.createdAt) < cutoff);
}

/** 今天该顾客已生成几张（手机端每日上限用） */
export function tryonsToday(tryons: ApTryon[], customerId: string, now = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return tryons.filter((t) => t.customerId === customerId && Date.parse(t.createdAt) >= start).length;
}

/** 试穿码当天有效：以点「想试实物」的日期（没有就用生成日期）为准 */
export function codeValidToday(t: Pick<ApTryon, 'wantAt' | 'createdAt'>, now = new Date()): boolean {
  const d = new Date(t.wantAt || t.createdAt);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
