import { describe, expect, it } from 'vitest';
import { agglomerate, cosineSim, diarize, type DiarizeSlice } from './diarize';
import { speakerVector } from './testHelpers';

/** 同一间会议室：每个人的声纹 = 本人 + 一个公共分量（不同人之间余弦约 0.4，和真实录音一致） */
const ROOM = speakerVector(99);
function voice(spk: number, salt: number, noise = 0.6, room = 0.8): number[] {
  const own = speakerVector(spk, noise, salt);
  const v = own.map((x, k) => x + room * ROOM[k]!);
  const n = Math.hypot(...v);
  return v.map(x => x / n);
}

/** 时间线：[说话人, 秒数]，每 5 秒一片 */
function timeline(plan: Array<[number, number]>, sliceSec = 5): { slices: DiarizeSlice[]; truth: number[] } {
  const slices: DiarizeSlice[] = [];
  const truth: number[] = [];
  let t = 0;
  let salt = 0;
  for (const [spk, dur] of plan) {
    for (let k = 0; k < dur / sliceSec; k++) {
      slices.push({ start: t, end: t + sliceSec - 0.5, speech: sliceSec - 1, emb: voice(spk, salt++) });
      truth.push(spk);
      t += sliceSec;
    }
  }
  return { slices, truth };
}

/** 预测标签和真实说话人一一对应的比例 */
function purity(labels: string[], truth: number[]): number {
  const map = new Map<string, Map<number, number>>();
  labels.forEach((l, i) => { const m = map.get(l) || new Map(); m.set(truth[i]!, (m.get(truth[i]!) || 0) + 1); map.set(l, m); });
  let ok = 0;
  for (const m of map.values()) ok += Math.max(...m.values());
  return ok / labels.length;
}

describe('agglomerate（平均连接）', () => {
  it('同一间会议室里不同人也有 0.4 上下的相似度，平均连接照样分得开', () => {
    const vs = [voice(1, 1), voice(1, 2), voice(1, 3), voice(2, 4), voice(2, 5), voice(3, 6), voice(3, 7)];
    expect(cosineSim(vs[0]!, vs[3]!)).toBeGreaterThan(0.25);
    const cl = agglomerate(vs, vs.map(() => 4), 0.58);
    expect(cl.map(c => c.length).sort()).toEqual([2, 2, 3]);
  });
});

describe('diarize', () => {
  it('聚出 3 位发言人，按首次发言编号 S1/S2/S3，回到同一个人时用同一个标签', () => {
    const { slices, truth } = timeline([[1, 60], [2, 40], [3, 30], [1, 30], [2, 20]]);
    const r = diarize({ slices, voiceprints: [], threshold: 0.5 });
    expect(r.speakers.map(s => s.label)).toEqual(['S1', 'S2', 'S3']);
    expect(purity(r.labels, truth)).toBeGreaterThan(0.95);
    expect(r.labels[0]).toBe('S1');
    expect(r.labels[slices.length - 1]).toBe(r.labels[12]); // 最后一段是 2 号，和第一次出现的 2 号同标签
    expect(r.speakers.every(s => !s.personId)).toBe(true);
    const s1 = r.speakers[0]!;
    expect(s1.seconds).toBeGreaterThan(80);
    expect(s1.repSlice).not.toBeNull();
  });

  it('和本场参会人的声纹比对：够门限认人，不够的留给主持人指认', () => {
    const { slices } = timeline([[1, 40], [2, 40], [3, 40]]);
    const vps = [
      { personId: 'p-b', vector: voice(2, 1000) },   // 2 号的注册声纹（另一次录音）
      { personId: 'p-x', vector: voice(7, 1001) },   // 没来发言的人
    ];
    const r = diarize({ slices, voiceprints: vps, threshold: 0.5 });
    const b = r.speakers.find(s => s.personId === 'p-b');
    expect(b).toBeTruthy();
    expect(b!.matchedBy).toBe('voiceprint');
    expect(b!.score!).toBeGreaterThanOrEqual(0.5);
    expect(r.speakers.filter(s => s.personId).length).toBe(1);
    expect(r.speakers.some(s => s.personId === 'p-x')).toBe(false);
    // 门限调高到够不着：谁也不认
    const strict = diarize({ slices, voiceprints: vps, threshold: 0.99 });
    expect(strict.speakers.every(s => !s.personId)).toBe(true);
  });

  it('某人没注册声纹：他那组即使够门槛，也不认给只是「稍微更像」的别人', () => {
    const { slices } = timeline([[1, 40], [2, 40], [3, 40]]);
    // 只有 2 号、3 号注册了；1 号那组和 2、3 号都一样「有点像」（同一间会议室）
    const vps = [{ personId: 'p2', vector: voice(2, 1000) }, { personId: 'p3', vector: voice(3, 1001) }];
    const loose = diarize({ slices, voiceprints: vps, threshold: 0.2 });
    const one = loose.speakers.find(s => s.label === 'S1')!;
    expect(one.personId).toBeUndefined();
    expect(loose.speakers.find(s => s.label === 'S2')!.personId).toBe('p2');
    expect(loose.speakers.find(s => s.label === 'S3')!.personId).toBe('p3');
    // 不加领先保护时（matchMargin 0、duplicateGap 很大），1 号那组会被认给 2 号或 3 号
    const raw = diarize({ slices, voiceprints: vps, threshold: 0.2, opts: { matchMargin: 0, duplicateGap: 9 } });
    expect(raw.speakers.filter(s => s.personId).length).toBe(2);
    expect(new Set(raw.labels).size).toBe(2);
  });

  it('同一个人被两组认领：比最像那组差很多的那组不认（多半是没注册声纹的另一个人）', () => {
    const { slices } = timeline([[1, 40], [2, 40]]);
    // 只注册了 2 号；1 号那组和 2 号的声纹只有会议室公共分量那点像。门槛压到刚好低于这点「像」：
    // 只看门槛（只有一个人注册，没有第二名可比领先）会被认成 2 号
    const vp = voice(2, 1000);
    const cross = slices.slice(0, 8).reduce((s, x) => s + cosineSim(x.emb!, vp), 0) / 8;
    const own = slices.slice(8).reduce((s, x) => s + cosineSim(x.emb!, vp), 0) / 8;
    expect(own - cross).toBeGreaterThan(0.12);
    const threshold = cross - 0.05;
    const vps = [{ personId: 'p2', vector: vp }];
    const noDup = diarize({ slices, voiceprints: vps, threshold, opts: { duplicateGap: 9 } });
    expect(noDup.speakers.filter(s => s.personId === 'p2')).toHaveLength(1);
    expect(new Set(noDup.labels).size).toBe(1); // 两组被并成「p2」一个人
    const r = diarize({ slices, voiceprints: vps, threshold });
    expect(r.speakers).toHaveLength(2);
    expect(r.speakers.find(s => s.label === 'S2')!.personId).toBe('p2');
    expect(r.speakers.find(s => s.label === 'S1')!.personId).toBeUndefined();
  });

  it('有底噪时同一人被拆成「清楚 / 被盖住」两组：弱的那组贴着门槛但明显领先第二像的人，照样认给他', () => {
    // 4 维手搓向量：A、B 两人的注册声纹是两个坐标轴；被噪声盖住的那组只剩 0.57 像 A
    const mk = (a: number, b: number) => [a, b, Math.sqrt(Math.max(0, 1 - a * a - b * b)), 0];
    const vps = [{ personId: 'A', vector: [1, 0, 0, 0] }, { personId: 'B', vector: [0, 1, 0, 0] }];
    const build = (weakB: number): DiarizeSlice[] => [
      ...Array.from({ length: 8 }, (_, k) => ({ start: k * 5, end: k * 5 + 4.5, speech: 4, emb: [0.95, 0.05, 0, Math.sqrt(1 - 0.95 ** 2 - 0.05 ** 2)] })),
      ...Array.from({ length: 8 }, (_, k) => ({ start: 50 + k * 5, end: 50 + k * 5 + 4.5, speech: 4, emb: mk(0.57, weakB) })),
    ];
    // 领先 0.22（≥ 0.18）：两组都认给 A，并成一个槽位
    const kept = diarize({ slices: build(0.35), voiceprints: vps, threshold: 0.55 });
    expect(kept.speakers.filter(s => s.personId === 'A')).toHaveLength(1);
    expect(new Set(kept.labels).size).toBe(1);
    // 领先 0.16（过了 0.15 的认人保护，但不到 0.18）：弱的那组仍按「同一人被几组认领」不认，交给主持人
    const held = diarize({ slices: build(0.41), voiceprints: vps, threshold: 0.55 });
    expect(held.speakers).toHaveLength(2);
    expect(held.speakers.filter(s => s.personId === 'A')).toHaveLength(1);
    expect(held.speakers.filter(s => !s.personId)).toHaveLength(1);
  });

  it('同一个人被分成两组时都认给他，合成一个槽位', () => {
    const slices: DiarizeSlice[] = [];
    // 2 号的前后两段用两个明显不同的「状态」（远近麦克风），聚成两组
    for (let k = 0; k < 8; k++) slices.push({ start: k * 5, end: k * 5 + 4.5, speech: 4, emb: voice(2, k, 0.3) });
    const shifted = speakerVector(55);
    for (let k = 0; k < 8; k++) {
      const v = voice(2, 100 + k, 0.3).map((x, i) => x + 2 * shifted[i]!);
      const n = Math.hypot(...v);
      slices.push({ start: 40 + k * 5, end: 40 + k * 5 + 4.5, speech: 4, emb: v.map(x => x / n) });
    }
    const vp = voice(2, 999, 0.3).map((x, i) => x + 1 * shifted[i]!);
    expect(diarize({ slices, voiceprints: [], threshold: 0.5 }).speakers).toHaveLength(2);
    const r = diarize({ slices, voiceprints: [{ personId: 'p2', vector: vp }], threshold: 0.5 });
    expect(r.speakers.filter(s => s.personId === 'p2')).toHaveLength(1);
    expect(new Set(r.labels).size).toBe(1);
  });

  it('声纹不可靠的短句跟着前后文走；零星一两句的「杂音」组不单列成发言人', () => {
    const { slices } = timeline([[1, 40], [2, 40]]);
    // 1 号说话中间插一句 0.6 秒的「对」（声纹很乱）
    slices.splice(4, 0, { start: 19.6, end: 20.2, speech: 0.6, emb: speakerVector(42) });
    // 一片 2 秒的怪声（不像任何人）
    slices.push({ start: 200, end: 202, speech: 1.8, emb: speakerVector(77) });
    const r = diarize({ slices, voiceprints: [], threshold: 0.5 });
    expect(r.speakers).toHaveLength(2);
    expect(r.labels[4]).toBe(r.labels[3]);
    expect(r.labels[slices.length - 1]).toBe(r.labels[slices.length - 2]);
  });

  it('没有声纹（未下载声纹模型）：全部归 S1', () => {
    const slices: DiarizeSlice[] = [0, 5, 10].map(t => ({ start: t, end: t + 4, speech: 3, emb: null }));
    const r = diarize({ slices, voiceprints: [{ personId: 'p', vector: voice(1, 1) }], threshold: 0.5 });
    expect(r.labels).toEqual(['S1', 'S1', 'S1']);
    expect(r.speakers).toHaveLength(1);
    expect(r.speakers[0]!.personId).toBeUndefined();
  });

  it('几百片也很快', () => {
    const plan: Array<[number, number]> = [];
    for (let k = 0; k < 40; k++) plan.push([1 + (k % 5), 50]);
    const { slices, truth } = timeline(plan);
    const t0 = Date.now();
    const r = diarize({ slices, voiceprints: [], threshold: 0.5 });
    expect(Date.now() - t0).toBeLessThan(3000);
    expect(r.speakers).toHaveLength(5);
    expect(purity(r.labels, truth)).toBeGreaterThan(0.95);
  });
});

describe('两个声纹模型（CAM++ / ERes2NetV2）', () => {
  // 新模型空间里每个人用不同的种子（和 CAM++ 空间互不相干），模拟「同一段声音、两个模型各出一个声纹」
  const v2 = (spk: number, salt: number) => voice(spk + 50, salt + 1000);
  function dual(plan: Array<[number, number]>, noV1 = false): { slices: DiarizeSlice[]; truth: number[] } {
    const base = timeline(plan);
    let salt = 0;
    base.slices = base.slices.map((s, i) => ({ ...s, emb: noV1 ? null : s.emb, emb2: v2(base.truth[i]!, salt++) }));
    return base;
  }
  const plan: Array<[number, number]> = [[1, 30], [2, 30], [3, 30], [1, 20]];

  it('参会人都有新模型声纹：聚类和认人都用 ERes2NetV2；分数按新模型空间算', () => {
    const { slices, truth } = dual(plan);
    const r = diarize({
      slices, threshold: 0.55,
      voiceprints: [1, 2, 3].map(p => ({ personId: `p${p}`, vector: voice(p, 500 + p), vector2: v2(p, 600 + p) })),
    });
    expect(r.model).toEqual({ cluster: 'eres2netv2', match: 'eres2netv2' });
    expect(purity(r.labels, truth)).toBeGreaterThan(0.95);
    const who = new Map(r.speakers.map(s => [s.label, s.personId]));
    expect(r.labels.every((l, i) => who.get(l) === `p${truth[i]}`)).toBe(true);
  });

  it('有人还是只有旧 CAM++ 声纹：聚类用新模型，认人整场退回 CAM++（两个模型的分数不混着比）', () => {
    const { slices, truth } = dual(plan);
    const r = diarize({
      slices, threshold: 0.55,
      voiceprints: [
        { personId: 'p1', vector: voice(1, 501), vector2: v2(1, 601) },
        { personId: 'p2', vector: voice(2, 502) },
        { personId: 'p3', vector: voice(3, 503), vector2: v2(3, 603) },
      ],
    });
    expect(r.model).toEqual({ cluster: 'eres2netv2', match: 'campplus' });
    const who = new Map(r.speakers.map(s => [s.label, s.personId]));
    expect(r.labels.every((l, i) => who.get(l) === `p${truth[i]}`)).toBe(true);
  });

  it('只装了新模型（切片没有 CAM++ 声纹）：只认有新声纹的人，旧声纹的人留给主持人指认', () => {
    const { slices, truth } = dual(plan, true);
    const r = diarize({
      slices, threshold: 0.55,
      voiceprints: [{ personId: 'p1', vector: voice(1, 501), vector2: v2(1, 601) }, { personId: 'p2', vector: voice(2, 502) }],
    });
    expect(r.model).toEqual({ cluster: 'eres2netv2', match: 'eres2netv2' });
    const who = new Map(r.speakers.map(s => [s.label, s.personId]));
    expect(r.labels.filter((l, i) => truth[i] === 1).every(l => who.get(l) === 'p1')).toBe(true);
    expect(r.labels.filter((l, i) => truth[i] === 2).every(l => !who.get(l))).toBe(true);
  });

  it('设置里的门限是相对默认的松紧：默认 0.55 = 各用各的默认，调高 0.4 谁都认不出', () => {
    const { slices } = dual(plan);
    const vps = [1, 2, 3].map(p => ({ personId: `p${p}`, vector: voice(p, 500 + p), vector2: v2(p, 600 + p) }));
    expect(diarize({ slices, threshold: 0.55, voiceprints: vps }).speakers.filter(s => s.personId).length).toBe(3);
    expect(diarize({ slices, threshold: 0.95, voiceprints: vps }).speakers.filter(s => s.personId).length).toBe(0);
  });
});

describe('会议补充样本（本人同意后从确认过的会议里加的）', () => {
  it('注册时的声音和开会时不一样（换了麦克风 / 房间）：注册声纹认不出，加上会议样本后认得出；取最像的那个', () => {
    // 注册时带麦克风 A 的特征，开会时带会议室 B 的特征（两者无关）：同一个人两种录音余弦只有 0.4 多，过不了 0.55
    const MIC = speakerVector(76);
    const ROOM2 = speakerVector(77);
    const mix = (own: number[], ch: number[]) => { const v = own.map((x, k) => x + ch[k]!); const n = Math.hypot(...v); return v.map(x => x / n); };
    const meetVoice = (spk: number, salt: number) => mix(speakerVector(spk, 0.6, salt), ROOM2);
    const slices: DiarizeSlice[] = [];
    let t = 0;
    for (const [spk, n] of [[1, 6], [2, 6], [1, 4]] as Array<[number, number]>) for (let k = 0; k < n; k++) { slices.push({ start: t, end: t + 4.5, speech: 4, emb: meetVoice(spk, t) }); t += 5; }
    const enrolled = [1, 2].map(p => ({ personId: `p${p}`, vector: mix(speakerVector(p, 0.6, 900 + p), MIC) }));
    const before = diarize({ slices, threshold: 0.55, voiceprints: enrolled });
    expect(before.speakers.filter(s => s.personId).length).toBe(0);
    const learned = enrolled.map((v, i) => ({ ...v, samples: [{ vector: meetVoice(i + 1, 5000 + i) }] }));
    const after = diarize({ slices, threshold: 0.55, voiceprints: learned });
    const who = new Map(after.speakers.map(s => [s.label, s.personId]));
    expect(after.labels.slice(0, 6).every(l => who.get(l) === 'p1')).toBe(true);
    expect(after.labels.slice(6, 12).every(l => who.get(l) === 'p2')).toBe(true);
    expect(after.labels.slice(12).every(l => who.get(l) === 'p1')).toBe(true);
  });
});
