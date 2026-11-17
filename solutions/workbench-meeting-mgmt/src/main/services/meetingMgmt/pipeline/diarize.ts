/**
 * 发言人识别（纯函数）：每个切片一个 CAM++ 声纹 → 聚类 → 和本场参会人的声纹比对 → 每片一个发言人标签。
 *
 *   1. 声纹可靠的切片（有效发声 ≥ 1.5 秒）做层次聚类：**平均连接**（两组之间所有切片两两相似度的加权平均），
 *      低于 clusterSim 停止合并。不用质心连接 —— 同一间会议室、同一支麦克风录下来的不同人，CAM++ 余弦也有 0.4 上下
 *      （用户 67 分钟实测：随机两片中位数 0.44，相邻两片中位数 0.84），大组的质心是「平均嗓音」，跟谁都像，
 *      质心连接会把所有人并成一个（实测 0.4~0.6 门限下 99% 都归到同一人）；平均连接在 0.55~0.6 之间稳定分出 5 个主要发言人。
 *   2. 每个聚类和参会人声纹逐片比对，取组内各片余弦的（按时长）加权平均：≥ 门限、且明显领先第二像的人才认作这个人
 *      （一个人分成两组时两组都认给他）。逐片比、按组投票，比单片认人稳：短片、咳嗽、两人抢话的片不会把人认错。
 *      两道保护（用户 67 分钟录音实测，前半场注册、认后半场）：正确认人时第一名领先第二名 0.22~0.34；
 *      某人没注册声纹时，他那组「最像的别人」只领先 0.00~0.12，得分 0.44~0.56（会越过 0.55 门槛），
 *      而那个别人自己那组的得分还要高 0.19~0.40。所以 ① 领先不到 matchMargin 不认；
 *      ② 同一个人被几组认领时，比他得分最高那组低 duplicateGap 以上、且只比门槛高不到 weakBand 的组不认
 *      （同一个人远近麦克风分成两组时，弱的那组也明显高于门槛，照样认给他）。认不出的留给主持人指认。
 *      ③ 但弱的那组领先第二像的人 ≥ duplicateKeepMargin 时照样认：有底噪时同一个人会按「声音清楚 / 被噪声盖住」
 *      分成两组，被盖住那组得分掉到 0.55 上下（贴着门槛），却仍明显领先第二像的人。用户录音后半场加粉红噪声实测
 *      （信噪比 20 / 15 / 10dB）：这种组领先 0.18~0.20，被②挡掉要占后半场 22% 的时长；
 *      没注册声纹的人被认成别人时最多领先 0.15（7 种噪声 × 缺任一人，共 26 组）。
 *   3. 总时长太短的小组（零星几句）并到最像的大组（平均相似度 ≥ tinyMergeSim 才并）。
 *   4. 声纹不可靠的短切片（「好」「对」）：先看前后相邻切片是哪一组，和那一组不比最像的一组差太多就跟着前后文走。
 *   5. 按首次发言的先后编号 S1、S2…；认出的人在槽位上带 personId（matchedBy = 'voiceprint'），其余留给主持人指认。
 */
import type { MmSpeakerSlot } from '../../../../shared/meetingMgmt/types';

export interface DiarizeSlice {
  start: number;
  end: number;
  /** 有效发声秒数 */
  speech: number;
  /** CAM++ 声纹 */
  emb: number[] | null | undefined;
  /** ERes2NetV2 声纹（装了这个模型才有）：有就用它聚类；参会人都有新模型声纹时也用它认人 */
  emb2?: number[] | null;
}

/** 本场用的是哪个声纹模型（cluster = 聚类，match = 认人） */
export type DiarizeModel = 'campplus' | 'eres2netv2';

export interface DiarizeOptions {
  reliableSec: number;
  clusterSim: number;
  minSpeakerSec: number;
  tinyMergeSim: number;
  neighborSlack: number;
  /** 聚类时一片的权重上限（秒）：几段长独白不能把组间平均拖走 */
  maxWeightSec: number;
  /** 参与聚类的切片上限（再多就挑最长的这么多片聚类，其余按最近的组归属），控制内存 */
  maxClusterItems: number;
  /** 认人时第一像的人至少领先第二像的人这么多 */
  matchMargin: number;
  /** 同一个人被几组认领：比得分最高那组低这么多以上、且只比门槛高不到 weakBand 的组不认 */
  duplicateGap: number;
  weakBand: number;
  /** 弱的那组领先第二像的人至少这么多时，②不挡 */
  duplicateKeepMargin: number;
}

export const DEFAULT_DIARIZE_OPTIONS: DiarizeOptions = {
  reliableSec: 1.5,
  clusterSim: 0.58,
  minSpeakerSec: 8,
  tinyMergeSim: 0.5,
  neighborSlack: 0.12,
  maxWeightSec: 12,
  maxClusterItems: 3000,
  matchMargin: 0.15,
  duplicateGap: 0.12,
  weakBand: 0.1,
  duplicateKeepMargin: 0.18,
};

export interface DiarizeSpeaker extends MmSpeakerSlot {
  /** 本场累计切片时长（秒） */
  seconds: number;
  firstStart: number;
  /** 本组声纹均值（已归一化）；没有声纹时为 null */
  centroid: number[] | null;
  /** 最有代表性的切片（试听用）下标 */
  repSlice: number | null;
  sliceCount: number;
}

export interface DiarizeResult {
  labels: string[];
  speakers: DiarizeSpeaker[];
  model?: { cluster: DiarizeModel; match: DiarizeModel | null };
}

/**
 * ERes2NetV2 的参数（2026-11-17；这个模型目前不上架，见 speakerModel.ts）。扫过 聚类门槛 0.58~0.66 × 领先 0.08~0.15 × 认人门槛 0.5~0.6：
 * 没有一组在真实会议和合成演示上同时不差于 CAM++（聚类门槛高了把同一个人拆成两组，低了把两个相近的声音并成一组），所以沿用 CAM++ 那套。
 */
export const DEFAULT_DIARIZE_OPTIONS_V2: DiarizeOptions = { ...DEFAULT_DIARIZE_OPTIONS };
/** 两个模型各自的默认认人门限；设置里的门限按「比默认严 / 松多少」换算到当前模型（设置默认 0.55 = 各用各的默认） */
export const MATCH_THRESHOLD_BASE: Record<DiarizeModel, number> = { campplus: 0.55, eres2netv2: 0.55 };
export const SETTINGS_THRESHOLD_DEFAULT = 0.55;
/** 认人用的声纹参数（门限 / 领先 / 同一人多组），按认人用的模型取 */
const MATCH_KEYS = ['matchMargin', 'duplicateGap', 'weakBand', 'duplicateKeepMargin'] as const;

export function dot(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i]! * b[i]!;
  return s;
}

export function norm(a: ArrayLike<number>): number {
  return Math.sqrt(dot(a, a));
}

export function cosineSim(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (!a.length || a.length !== b.length) return -1;
  const na = norm(a);
  const nb = norm(b);
  return na > 0 && nb > 0 ? dot(a, b) / (na * nb) : -1;
}

function unit(v: ArrayLike<number>): number[] {
  const n = norm(v);
  return n > 1e-12 ? Array.from(v, x => x / n) : Array.from(v);
}

/**
 * 按权重的平均连接层次聚类（UPGMA）。每行缓存最像的那一列，合并后只重算受影响的行。
 * vectors 须已归一化。返回每个聚类的成员（输入下标，升序）。
 */
export function agglomerate(vectors: number[][], weights: number[], stopSim: number): number[][] {
  const n = vectors.length;
  if (!n) return [];
  if (n === 1) return [[0]];
  const S = new Float32Array(n * n);
  for (let i = 0; i < n; i++) {
    S[i * n + i] = -Infinity;
    for (let j = i + 1; j < n; j++) { const s = dot(vectors[i]!, vectors[j]!); S[i * n + j] = s; S[j * n + i] = s; }
  }
  const size = weights.map(w => Math.max(1e-6, w));
  const alive = new Uint8Array(n).fill(1);
  const members: number[][] = vectors.map((_, i) => [i]);
  const bestJ = new Int32Array(n).fill(-1);
  const bestS = new Float64Array(n).fill(-Infinity);
  const recompute = (i: number) => {
    let bj = -1;
    let bs = -Infinity;
    const row = i * n;
    for (let j = 0; j < n; j++) {
      if (j === i || !alive[j]) continue;
      const s = S[row + j]!;
      if (s > bs) { bs = s; bj = j; }
    }
    bestJ[i] = bj;
    bestS[i] = bs;
  };
  for (let i = 0; i < n; i++) recompute(i);
  for (;;) {
    let bi = -1;
    let bs = -Infinity;
    for (let i = 0; i < n; i++) if (alive[i] && bestS[i]! > bs) { bs = bestS[i]!; bi = i; }
    if (bi < 0 || bs < stopSim) break;
    const bj = bestJ[bi]!;
    if (bj < 0 || !alive[bj]) { recompute(bi); continue; }
    const wi = size[bi]!;
    const wj = size[bj]!;
    for (let k = 0; k < n; k++) {
      if (!alive[k] || k === bi || k === bj) continue;
      const v = (wi * S[bi * n + k]! + wj * S[bj * n + k]!) / (wi + wj);
      S[bi * n + k] = v;
      S[k * n + bi] = v;
    }
    size[bi] = wi + wj;
    alive[bj] = 0;
    members[bi]!.push(...members[bj]!);
    recompute(bi);
    for (let k = 0; k < n; k++) {
      if (!alive[k] || k === bi) continue;
      if (bestJ[k] === bj || bestJ[k] === bi) { recompute(k); continue; }
      const s = S[k * n + bi]!;
      if (s > bestS[k]!) { bestS[k] = s; bestJ[k] = bi; }
    }
  }
  const out: number[][] = [];
  for (let i = 0; i < n; i++) if (alive[i]) out.push(members[i]!.sort((a, b) => a - b));
  return out;
}

interface Group {
  personId?: string;
  members: number[];
  score?: number;
}

export function diarize(input: {
  slices: DiarizeSlice[];
  /** samples = 本人确认过的会议里自动补充的样本（本人同意才有）：认人时取注册声纹和各样本里最像的那个 */
  voiceprints: Array<{ personId: string; vector: number[]; vector2?: number[] | null; samples?: Array<{ vector?: number[] | null; vector2?: number[] | null }> }>;
  threshold: number;
  opts?: Partial<DiarizeOptions>;
  /** ERes2NetV2 时的参数（测试 / 调参用；缺省 DEFAULT_DIARIZE_OPTIONS_V2） */
  optsV2?: Partial<DiarizeOptions>;
}): DiarizeResult {
  const slices = input.slices;
  // 聚类用哪个模型：切片大多有 ERes2NetV2 声纹就用它；认人：参会人的声纹全都有 ERes2NetV2 才用它（两个模型的分数不能混着比），
  // 有人还是只有旧 CAM++ 声纹就整场用 CAM++ 认人（CAM++ 没装、切片没有 CAM++ 声纹时，只认有新声纹的人）
  const n1 = slices.filter(s => s.emb && s.emb.length).length;
  const n2 = slices.filter(s => s.emb2 && s.emb2.length).length;
  const clusterModel: DiarizeModel = n2 > 0 && n2 >= n1 * 0.9 ? 'eres2netv2' : 'campplus';
  const okVec = (x: unknown): x is number[] => Array.isArray(x) && x.length > 0;
  const v1Of = (v: (typeof input.voiceprints)[number]) => [v.vector].filter(okVec);
  const v2Of = (v: (typeof input.voiceprints)[number]) => [v.vector2].filter(okVec);
  const s1Of = (v: (typeof input.voiceprints)[number]) => (v.samples || []).map(s => s.vector).filter(okVec);
  const s2Of = (v: (typeof input.voiceprints)[number]) => (v.samples || []).map(s => s.vector2).filter(okVec);
  const withV1 = input.voiceprints.filter(v => v1Of(v).length > 0);
  const withV2 = input.voiceprints.filter(v => v2Of(v).length > 0);
  const matchModel: DiarizeModel | null = !input.voiceprints.length ? null
    : n2 > 0 && (withV2.length === input.voiceprints.length || n1 === 0) ? 'eres2netv2'
      : n1 > 0 && withV1.length ? 'campplus' : n2 > 0 && withV2.length ? 'eres2netv2' : null;
  const clusterOpts = clusterModel === 'eres2netv2' ? { ...DEFAULT_DIARIZE_OPTIONS_V2, ...(input.optsV2 || {}) } : { ...DEFAULT_DIARIZE_OPTIONS, ...(input.opts || {}) };
  const matchOpts = matchModel === 'eres2netv2' ? { ...DEFAULT_DIARIZE_OPTIONS_V2, ...(input.optsV2 || {}) } : { ...DEFAULT_DIARIZE_OPTIONS, ...(input.opts || {}) };
  const o: DiarizeOptions = { ...clusterOpts };
  for (const k of MATCH_KEYS) (o as any)[k] = matchOpts[k];
  // 设置里的门限是「相对默认严 / 松多少」：换算到认人用的模型
  const threshold = matchModel ? MATCH_THRESHOLD_BASE[matchModel] + (input.threshold - SETTINGS_THRESHOLD_DEFAULT) : input.threshold;
  // base = 注册时录的声纹；extra = 本人同意后从确认过的会议里补的样本
  const vps = matchModel === 'eres2netv2'
    ? withV2.map(v => ({ personId: v.personId, base: v2Of(v).map(unit), extra: s2Of(v).map(unit) }))
    : withV1.map(v => ({ personId: v.personId, base: v1Of(v).map(unit), extra: s1Of(v).map(unit) }));
  const pick = (s: DiarizeSlice, m: DiarizeModel) => (m === 'eres2netv2' ? s.emb2 : s.emb);
  const units: Array<number[] | null> = slices.map(s => { const e = pick(s, clusterModel); return e && e.length ? unit(e) : null; });
  const matchUnits: Array<number[] | null> = matchModel === clusterModel ? units
    : slices.map(s => { const e = matchModel ? pick(s, matchModel) : null; return e && e.length ? unit(e) : null; });
  const weightOf = (i: number) => Math.max(0.1, Math.min(o.maxWeightSec, slices[i]!.speech || (slices[i]!.end - slices[i]!.start)));
  const durOf = (i: number) => slices[i]!.end - slices[i]!.start;
  const groupOf = new Int32Array(slices.length).fill(-1);
  const groups: Group[] = [];

  // 1. 可靠切片聚类（太多时挑最长的那些）
  let reliable = slices.map((_, i) => i).filter(i => units[i] && slices[i]!.speech >= o.reliableSec);
  if (reliable.length > o.maxClusterItems) {
    reliable = reliable.slice().sort((a, b) => slices[b]!.speech - slices[a]!.speech).slice(0, o.maxClusterItems).sort((a, b) => a - b);
  }
  const clusters = agglomerate(reliable.map(i => units[i]!), reliable.map(weightOf), o.clusterSim).map(c => c.map(k => reliable[k]!));
  for (const c of clusters) {
    const gi = groups.length;
    groups.push({ members: c });
    for (const i of c) groupOf[i] = gi;
  }

  /** 一组切片与某个参会人声纹的按时长加权平均余弦（在认人用的模型空间里比） */
  const avgSim = (members: number[], v: number[]): number => {
    let s = 0;
    let w = 0;
    for (const i of members) { const u = matchUnits[i]; if (!u) continue; const wt = weightOf(i); s += dot(u, v) * wt; w += wt; }
    return w > 0 ? s / w : -1;
  };
  /** 两组之间的平均连接相似度（抽样上限，免得两个大组 n² 太慢） */
  const groupSim = (a: number[], b: number[]): number => {
    const sa = a.filter(i => units[i]).slice(0, 200);
    const sb = b.filter(i => units[i]).slice(0, 200);
    let s = 0;
    let w = 0;
    for (const i of sa) for (const j of sb) { const wt = weightOf(i) * weightOf(j); s += dot(units[i]!, units[j]!) * wt; w += wt; }
    return w > 0 ? s / w : -1;
  };
  const seconds = (g: Group) => g.members.reduce((s, i) => s + durOf(i), 0);

  // 2. 认人：组内逐片和参会人声纹比，取加权平均；够门限、且明显领先第二像的人才认
  //    会议补充样本只用来「补认」：先只用注册声纹认；没认出来的组再加上样本认一次。样本不推翻注册声纹认出的结果——
  //    同一间会议室录的样本彼此都带着这间屋子的声学特征，会把每个人的分数一起抬高，第一名的领先被吃掉（M1 三等分模拟：
  //    某组领先 0.16、样本把第二名抬了 0.01，整组 143 秒变成没认出），所以不能直接混进来比。
  type Hit = { personId: string; score: number; lead: number };
  const matchWith = (useExtra: boolean, only: Group[]): Map<Group, Hit> => {
    const hits = new Map<Group, Hit>();
    for (const g of only) {
      const scores = vps.map(vp => ({ personId: vp.personId, score: Math.max(...(useExtra ? [...vp.base, ...vp.extra] : vp.base).map(x => avgSim(g.members, x))) }))
        .filter(x => Number.isFinite(x.score)).sort((a, b) => b.score - a.score);
      const best = scores[0];
      const second = scores[1]?.score ?? -Infinity;
      if (best && best.score >= threshold && best.score - second >= o.matchMargin) {
        // 只有一个人注册了声纹时没有第二名可比，「领先多少」无从谈起：按 0 算，②照旧挡
        hits.set(g, { personId: best.personId, score: best.score, lead: Number.isFinite(second) ? best.score - second : 0 });
      }
    }
    return hits;
  };
  if (vps.length) {
    const hits = matchWith(false, groups);
    if (vps.some(vp => vp.extra.length)) {
      for (const [g, h] of matchWith(true, groups.filter(g => !hits.has(g)))) hits.set(g, h);
    }
    // 同一个人被几组认领：弱的那组只是勉强过门槛、又比最像那组差很多 → 多半是没注册声纹的另一个人
    const top = new Map<string, number>();
    for (const h of hits.values()) top.set(h.personId, Math.max(top.get(h.personId) ?? -Infinity, h.score));
    for (const [g, h] of hits) {
      if (h.score < top.get(h.personId)! - o.duplicateGap && h.score < threshold + o.weakBand && h.lead < o.duplicateKeepMargin) continue;
      g.personId = h.personId;
      g.score = Math.round(h.score * 1000) / 1000;
    }
  }

  // 3. 零星几句的小组（没认出人的）：够像就并到最像的大组；不像任何组也不单列成一位发言人
  //    （实测 67 分钟里有 7 个这样的小组，各一两片、合计 1.6% 时长，多是笑声、咳嗽、杂音），拆散后按前后文归属。
  //    门槛随会议长短：总时长的 0.5%，3~8 秒之间。
  const totalSec = slices.reduce((s, x) => s + (x.end - x.start), 0);
  const minSpeakerSec = Math.min(o.minSpeakerSec, Math.max(3, totalSec * 0.005));
  const dead = new Set<number>();
  const smallOrder = groups.map((g, gi) => gi).filter(gi => !groups[gi]!.personId && seconds(groups[gi]!) < minSpeakerSec)
    .sort((a, b) => seconds(groups[a]!) - seconds(groups[b]!));
  for (const gi of smallOrder) {
    let target = -1;
    let bs = -Infinity;
    groups.forEach((g, gj) => {
      if (gj === gi || dead.has(gj) || seconds(g) <= seconds(groups[gi]!)) return;
      const s = groupSim(groups[gi]!.members, g.members);
      if (s > bs) { bs = s; target = gj; }
    });
    if (target >= 0 && bs >= o.tinyMergeSim) {
      for (const i of groups[gi]!.members) groupOf[i] = target;
      groups[target]!.members.push(...groups[gi]!.members);
    } else if (groups.some((g, gj) => gj !== gi && !dead.has(gj) && seconds(g) >= minSpeakerSec)) {
      for (const i of groups[gi]!.members) groupOf[i] = -1;
    } else continue;
    groups[gi]!.members = [];
    dead.add(gi);
  }
  // 同一人被分成几组：合成一组（槽位里只出现一次）
  const byPerson = new Map<string, number>();
  groups.forEach((g, gi) => {
    if (!g.personId || dead.has(gi)) return;
    const first = byPerson.get(g.personId);
    if (first === undefined) { byPerson.set(g.personId, gi); return; }
    for (const i of g.members) groupOf[i] = first;
    groups[first]!.members.push(...g.members);
    groups[first]!.score = Math.max(groups[first]!.score ?? -1, g.score ?? -1);
    g.members = [];
    dead.add(gi);
  });

  // 4. 声纹不可靠 / 没参与聚类的片：跟着前后文走
  const live = () => groups.map((g, gi) => ({ g, gi })).filter(x => x.g.members.length && !dead.has(x.gi));
  if (!live().length) {
    // 一个可靠声纹都没有（没有声纹模型 / 全是短句）：全部归一个人，交主持人分配
    groups.push({ members: [] });
  }
  const means = new Map<number, number[] | null>();
  const dim = units.find(Boolean)?.length || 192;
  for (const { g, gi } of live()) {
    const sum = new Array<number>(dim).fill(0);
    let w = 0;
    for (const i of g.members) { const u = units[i]; if (!u) continue; const wt = weightOf(i); for (let k = 0; k < u.length; k++) sum[k] += u[k]! * wt; w += wt; }
    means.set(gi, w > 0 ? unit(sum) : null);
  }
  const neighborGroup = (i: number): number => {
    for (let d = 1; d < slices.length; d++) {
      const p = i - d;
      const q = i + d;
      const gp = p >= 0 ? groupOf[p]! : -1;
      const gq = q < slices.length ? groupOf[q]! : -1;
      if (gp >= 0 && gq >= 0) {
        const dp = slices[i]!.start - slices[p]!.end;
        const dq = slices[q]!.start - slices[i]!.end;
        return dp <= dq ? gp : gq;
      }
      if (gp >= 0) return gp;
      if (gq >= 0) return gq;
      if (p < 0 && q >= slices.length) break;
    }
    return -1;
  };
  const pending = slices.map((_, i) => i).filter(i => groupOf[i] < 0);
  for (const i of pending) {
    const u = units[i];
    const nb = neighborGroup(i);
    let pick = nb;
    if (u) {
      let bg = -1;
      let bs = -Infinity;
      for (const [gi, m] of means) {
        if (!m) continue;
        const s = dot(u, m);
        if (s > bs) { bs = s; bg = gi; }
      }
      if (bg >= 0) {
        const nm = nb >= 0 ? means.get(nb) : null;
        const nbScore = nm ? dot(u, nm) : -Infinity;
        pick = nb >= 0 && nbScore >= bs - o.neighborSlack ? nb : bg;
      }
    }
    if (pick < 0) {
      const l = live();
      pick = l.length ? l.sort((a, b) => seconds(b.g) - seconds(a.g))[0]!.gi : groups.length - 1;
    }
    groupOf[i] = pick;
  }
  // 归属回填到组成员（pending 的片也算进时长）
  for (const g of groups) g.members = [];
  groupOf.forEach((gi, i) => { if (gi >= 0) groups[gi]!.members.push(i); });

  // 5. 编号
  const used = groups.map((g, gi) => gi).filter(gi => groups[gi]!.members.length);
  const firstStart = (gi: number) => Math.min(...groups[gi]!.members.map(i => slices[i]!.start));
  used.sort((a, b) => firstStart(a) - firstStart(b));
  const labelOf = new Map<number, string>();
  used.forEach((gi, k) => labelOf.set(gi, `S${k + 1}`));
  const speakers: DiarizeSpeaker[] = used.map((gi) => {
    const g = groups[gi]!;
    const m = means.get(gi) ?? null;
    let rep: number | null = null;
    let repScore = -Infinity;
    for (const i of g.members) {
      const dur = durOf(i);
      // 优先 5 秒以上、最像本组的一片；都不够 5 秒就挑最长的
      const score = (dur >= 5 ? 10 : 0) + (m && units[i] ? dot(units[i]!, m) : 0) + Math.min(dur, 8) / 100;
      if (score > repScore) { repScore = score; rep = i; }
    }
    const slot: DiarizeSpeaker = {
      label: labelOf.get(gi)!,
      seconds: Math.round(seconds(g) * 10) / 10,
      firstStart: firstStart(gi),
      centroid: m,
      repSlice: rep,
      sliceCount: g.members.length,
    };
    if (g.personId) {
      slot.personId = g.personId;
      slot.matchedBy = 'voiceprint';
      if (g.score !== undefined) slot.score = g.score;
    }
    return slot;
  });
  return { labels: Array.from(groupOf, gi => labelOf.get(gi) || 'S1'), speakers, model: { cluster: clusterModel, match: matchModel } };
}
