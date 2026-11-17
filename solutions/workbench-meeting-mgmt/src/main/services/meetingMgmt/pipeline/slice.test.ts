import { describe, expect, it } from 'vitest';
import { adaptiveThreshold, planSlices, sliceStats, speechMask } from './slice';

/** 10ms 一帧的能量序列：spans 里是有声（-20dB），其余是底噪 */
function frames(totalSec: number, spans: Array<[number, number]>, opts: { floor?: number; speech?: number } = {}): Float32Array {
  const n = Math.round(totalSec * 100);
  const db = new Float32Array(n).fill(opts.floor ?? -50);
  for (const [a, b] of spans) for (let i = Math.round(a * 100); i < Math.round(b * 100); i++) db[i] = (opts.speech ?? -20) + ((i * 7) % 5) - 2;
  return db;
}

describe('planSlices', () => {
  it('停顿里有底噪起伏（一阵阵冒过门限的 0.1 秒「响动」）：先平滑再判，句间停顿照样切开', () => {
    const db = frames(20, [[1, 4], [5, 8], [9, 12.5]], { floor: -40 });
    // 每个停顿里冒 3 次 0.09 秒高出底噪 9dB 的响动（风扇 / 空调的低频起伏），把 1 秒的停顿打成几截 0.2 秒
    for (const g of [4, 8]) for (const t of [0.2, 0.45, 0.7]) for (let i = Math.round((g + t) * 100); i < Math.round((g + t + 0.09) * 100); i++) db[i] = -31;
    expect(planSlices(db, { smoothFrames: 1 }).length).toBeLessThan(3);
    expect(planSlices(db).length).toBe(3);
  });

  it('在 ≥0.5 秒的停顿处切开', () => {
    const db = frames(20, [[1, 4], [4.8, 8], [9, 12.5]]);
    const s = planSlices(db);
    expect(s.length).toBe(3);
    expect(s[0]!.start).toBeCloseTo(0.9, 1);
    expect(s[0]!.end).toBeCloseTo(4.1, 1);
    expect(s[1]!.start).toBeCloseTo(4.7, 1);
    expect(s[2]!.end).toBeCloseTo(12.6, 1);
    // 余量不超过停顿的一半：相邻两片不重叠
    for (let k = 1; k < s.length; k++) expect(s[k]!.start).toBeGreaterThanOrEqual(s[k - 1]!.end);
  });

  it('字间短气口（<0.15 秒）不算停顿，0.15~0.5 秒的停顿不切', () => {
    const db = frames(10, [[1, 2], [2.1, 3], [3.3, 5]]);
    const s = planSlices(db);
    expect(s.length).toBe(1);
    expect(s[0]!.speech).toBeGreaterThan(3.5);
  });

  it('超过 20 秒的段在段内最长停顿处再切，每段都不超过 20 秒', () => {
    // 45 秒连续说话，只有 0.3 秒的小停顿，其中 20.55~21 秒的停顿最长（0.45 秒）
    const spans: Array<[number, number]> = [[1, 4.7], [5, 9.7], [10, 14.7], [15, 20.55], [21, 25.7], [26, 30.7], [31, 35.7], [36, 40.7], [41, 46]];
    const s = planSlices(frames(50, spans));
    expect(s.length).toBeGreaterThanOrEqual(3);
    for (const x of s) expect(x.end - x.start).toBeLessThanOrEqual(20.3);
    // 第一刀切在最长的那个停顿里
    expect(s[0]!.end).toBeGreaterThan(20.5);
    expect(s[0]!.end).toBeLessThanOrEqual(20.8);
    expect(s[1]!.start).toBeGreaterThanOrEqual(20.75);
  });

  it('一口气说 50 秒没有停顿：在能量最低处硬切，每段不超过 20 秒', () => {
    const db = frames(62, [[6, 56]]);
    db[2400] = -40; // 一个能量谷
    const s = planSlices(db);
    for (const x of s) expect(x.end - x.start).toBeLessThanOrEqual(20.3);
    expect(s.reduce((a, x) => a + x.speech, 0)).toBeGreaterThan(49);
  });

  it('整段都在说话、前后 15 秒看不出停顿音量：放大窗口找底噪，不会整段判成静音', () => {
    // 3 秒静音 + 120 秒说话（每 30 秒才停 0.6 秒）
    const spans: Array<[number, number]> = [[3, 33], [33.6, 63], [63.6, 93], [93.6, 123]];
    const s = planSlices(frames(125, spans));
    expect(s.reduce((a, x) => a + x.speech, 0)).toBeGreaterThan(115);
  });

  it('短句隔着真停顿（≥ 0.5 秒）不并进邻段：别人插的「嗯，行」不会归到前后长句的发言人；孤立的短句保留', () => {
    // 0.6 秒的「好」离前一句 0.7 秒、离后一句 1.1 秒：以前按 1.2 秒并到前面，现在单独成段
    const db = frames(30, [[1, 5], [5.7, 6.3], [7.4, 10], [20, 20.5]]);
    const s = planSlices(db);
    expect(s.length).toBe(4);
    expect(s[0]!.end).toBeLessThan(5.5);
    expect(s[1]!.start).toBeGreaterThan(5.4);
    expect(s[1]!.end).toBeLessThan(6.6);
    // 20 秒处 0.5 秒的孤立短句：前后都隔得很远，单独保留
    expect(s[3]!.start).toBeGreaterThan(19.8);
    // 旧行为仍可用参数打开（mergeMaxGapSec 1.2）
    expect(planSlices(db, { mergeMaxGapSec: 1.2 }).length).toBe(3);
  });

  it('太短的响动（<80ms）和数字静音不出切片', () => {
    const db = new Float32Array(3000).fill(-120);
    db[500] = -10; db[501] = -10; db[502] = -10;
    expect(planSlices(db)).toEqual([]);
  });

  it('底噪随时间变化（空调开了）时门限跟得上', () => {
    const db = frames(60, [[2, 6], [7, 12], [40, 45], [46, 50]], { floor: -55 });
    for (let i = 3000; i < db.length; i++) if (db[i]! < -30) db[i] = -38; // 后半段底噪抬高 17dB
    const s = planSlices(db);
    expect(s.length).toBe(4);
    const thr = adaptiveThreshold(db);
    expect(thr[5500]!).toBeGreaterThan(thr[500]!);
    expect(speechMask(db, thr)[4200]).toBe(1);
  });

  it('sliceStats 汇总时长分布', () => {
    const st = sliceStats([{ start: 0, end: 2, speech: 1.5 }, { start: 3, end: 9, speech: 5 }]);
    expect(st.count).toBe(2);
    expect(st.total).toBe(8);
    expect(st.max).toBe(6);
  });
});
