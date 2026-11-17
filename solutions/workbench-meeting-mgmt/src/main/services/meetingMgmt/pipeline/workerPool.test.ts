import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { makeBatches, MeetingWorker, runSlices, type WorkerSpec } from './workerPool';
import { writeWav16k } from './audio';
import { fakeWorkerFactory } from './testHelpers';

const spec: WorkerSpec = { python: 'py', pluginsDir: '', model: 'large-v3', modelsDir: '', campp: '/c.onnx', threads: 2, env: {} };

describe('分批', () => {
  it('按累计音频秒数和片数打包，每片仍单独转写（不拼接）', () => {
    const slices = [[0, 5], [6, 12], [13, 20], [21, 41], [42, 44], [45, 52], [53, 80]].map(([s, e]) => ({ start: s!, end: e! }));
    expect(makeBatches(slices, 30, 8)).toEqual([[0, 1, 2], [3, 4, 5], [6]]);
    expect(makeBatches(slices, 1000, 2)).toEqual([[0, 1], [2, 3], [4, 5], [6]]);
  });
});

describe('runSlices（假 worker）', () => {
  const slices = Array.from({ length: 30 }, (_, k) => ({ start: k * 6, end: k * 6 + 5 }));

  it('多进程并行跑完，结果与切片同序，进度逐片回报', async () => {
    const log: any[] = [];
    const progress: number[] = [];
    const out = await runSlices(spec, '/x.wav', slices, { workers: 3, asr: true, emb: true, lang: 'zh', createWorker: fakeWorkerFactory({ log }), onProgress: d => progress.push(d) });
    expect(out.map(o => o.text)).toEqual(slices.map(s => `t${s.start * 10}`));
    expect(out.every(o => o.emb?.length === 192)).toBe(true);
    expect(progress[progress.length - 1]).toBe(30);
    expect(new Set(log.map(l => l.spec)).size).toBe(1);
    expect(log.every(l => l.slices.length >= 1 && l.slices.length <= 12)).toBe(true);
  });

  it('某个进程中途死掉：重起一次把这一批重跑，不丢片', async () => {
    const out = await runSlices(spec, '/x.wav', slices, { workers: 2, asr: true, emb: false, createWorker: fakeWorkerFactory({ failOnRequest: 2 }) });
    expect(out.every(o => typeof o.text === 'string')).toBe(true);
  });

  it('有个进程起不来：剩下的进程把活干完；全都起不来才报错', async () => {
    const out = await runSlices(spec, '/x.wav', slices, { workers: 2, asr: true, emb: false, createWorker: fakeWorkerFactory({ failStartFor: [1, 3] }) });
    expect(out.every(o => typeof o.text === 'string')).toBe(true);
    await expect(runSlices(spec, '/x.wav', slices, { workers: 2, asr: true, emb: false, createWorker: fakeWorkerFactory({ failStartFor: [1, 2, 3, 4, 5, 6] }) })).rejects.toThrow(/cannot start/);
  });

  it('取消：抛「处理已取消」', async () => {
    const ac = new AbortController();
    ac.abort();
    await expect(runSlices(spec, '/x.wav', slices, { workers: 2, asr: true, emb: true, signal: ac.signal, createWorker: fakeWorkerFactory() })).rejects.toThrow(/取消/);
  });
});

// 真 Python 进程（不加载任何模型）：验证 worker 源码能跑、wav 解析与按窗口回报的协议
const PY = join(__dirname, '../../../../../../../resources/vendor/totalclaw-agent/.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
describe.skipIf(!existsSync(PY))('MeetingWorker（真 Python，不加载模型）', () => {
  let dir = '';
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'mm-py-')); });
  afterAll(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });

  it('没给模型时报告 asr/emb 都不可用，逐片回报', async () => {
    const wav = join(dir, 'a.wav');
    writeWav16k(wav, new Int16Array(16000 * 10));
    const w = new MeetingWorker({ python: PY, pluginsDir: '', model: '', modelsDir: '', campp: '', threads: 1, env: { ...process.env, PYTHONUTF8: '1' } });
    try {
      const ready = await w.start(60_000);
      expect(ready).toMatchObject({ asr: false, emb: false });
      const items: any[] = [];
      const done = await w.request({ op: 'run', wav, slices: [[0, 2], [3, 5], [6, 9]], asr: true, emb: true }, m => items.push(m), 30_000);
      expect(done.done).toBe(true);
      expect(items.map(m => m.i).sort()).toEqual([0, 1, 2]);
      const bad = await w.request({ op: 'run', wav: join(dir, 'missing.wav'), slices: [[0, 1]] }, () => {}, 30_000).catch(e => e);
      expect(String(bad?.message || bad)).toMatch(/No such file|not a wav|Errno/);
    } finally {
      w.kill();
    }
  }, 60_000);
  it('要转写但进程没能加载语音识别模型（只剩声纹）：报出原因，不悄悄返回一堆空文字', async () => {
    const slices = [{ start: 0, end: 3 }, { start: 3, end: 6 }];
    await expect(runSlices(spec, '/x.wav', slices, { workers: 1, asr: true, emb: true, createWorker: fakeWorkerFactory({ asr: false }) }))
      .rejects.toThrow('语音识别模型没能加载');
    // 只要声纹（不转写）时照常跑
    const out = await runSlices(spec, '/x.wav', slices, { workers: 1, asr: false, emb: true, createWorker: fakeWorkerFactory({ asr: false }) });
    expect(out.every((o) => o.emb)).toBe(true);
  });
});
