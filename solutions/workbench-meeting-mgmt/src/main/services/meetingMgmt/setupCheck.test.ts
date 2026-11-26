/**
 * 配置引导 · 电脑配置检测与转写模型推荐：扛得住就推 FireRedASR2（最准，SenseVoice 兜底），内存 / 核数 / 磁盘不够推 SenseVoice 并说明原因。
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { detectHardware, downloadMeetingModelFromCdn, estimateMinPerHour, recommendAsr, verifyMeetingModelIntegrity, type HardwareInfo } from './setupCheck';

const hw = (o: Partial<HardwareInfo>): HardwareInfo => ({ cpu: 'x', cores: 18, memGb: 24, arch: 'arm64', platform: 'darwin', appleSilicon: true, freeDiskGb: 200, ...o });

describe('recommendAsr', () => {
  it('实测那台（18 核 / 24GB Apple 芯片）：FireRedASR2（先装 SenseVoice 兜底），评级好', () => {
    const r = recommendAsr(hw({}));
    expect(r).toMatchObject({ engine: 'firered', installIds: ['asr-meeting-sensevoice', 'asr-meeting-firered2'], tier: 'good', sizeMb: 1406 });
    expect(r.downgradeReason).toBeUndefined();
  });

  it('16GB / 8 核的 Windows 电脑：仍推 FireRedASR2，但更慢', () => {
    const r = recommendAsr(hw({ cores: 8, memGb: 16, appleSilicon: false, platform: 'win32', arch: 'x64' }));
    expect(r.engine).toBe('firered');
    expect(r.estMinPerHour).toBeGreaterThan(recommendAsr(hw({})).estMinPerHour);
  });

  it('内存不到 16GB、核太少、磁盘放不下：推 SenseVoice，带原因', () => {
    expect(recommendAsr(hw({ memGb: 15.8 }))).toMatchObject({ engine: 'sensevoice', installIds: ['asr-meeting-sensevoice'], downgradeReason: 'memory', tier: 'ok' });
    expect(recommendAsr(hw({ memGb: 7.8 }))).toMatchObject({ engine: 'sensevoice', tier: 'weak' });
    expect(recommendAsr(hw({ cores: 4 }))).toMatchObject({ engine: 'sensevoice', downgradeReason: 'cores' });
    expect(recommendAsr(hw({ freeDiskGb: 2 }))).toMatchObject({ engine: 'sensevoice', downgradeReason: 'disk' });
    // 读不到磁盘空间时不因此降级
    expect(recommendAsr(hw({ freeDiskGb: null })).engine).toBe('firered');
  });

  it('SenseVoice 比 FireRedASR2 快得多', () => {
    expect(estimateMinPerHour('sensevoice', hw({})).minutes).toBeLessThan(estimateMinPerHour('firered', hw({})).minutes / 3);
  });
});

describe('detectHardware', () => {
  it('读得到本机的核数、内存和磁盘', () => {
    const h = detectHardware(process.cwd());
    expect(h.cores).toBeGreaterThan(0);
    expect(h.memGb).toBeGreaterThan(0);
    expect(h.freeDiskGb === null || h.freeDiskGb > 0).toBe(true);
    expect(detectHardware('/definitely/not/here').freeDiskGb).toBeNull();
  });
});

describe('downloadMeetingModelFromCdn', () => {
  it('支持 Range 断点续传、SHA-256 校验与已下好文件跳过', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mm-cdn-'));
    try {
      const payload = Buffer.from('0123456789abcdefghij');
      const sha = createHash('sha256').update(payload).digest('hex');
      // 模拟上一次已下了前 10 字节到 .part
      writeFileSync(join(dir, 'model.int8.onnx.part'), payload.subarray(0, 10));
      const ranges: Array<string | null> = [];
      const fetchImpl: typeof fetch = async (_url, init) => {
        const range = (init?.headers as Record<string, string> | undefined)?.Range ?? null;
        ranges.push(range);
        const start = range ? Number(range.replace(/^bytes=(\d+)-$/, '$1')) : 0;
        const body = payload.subarray(start);
        return new Response(body, { status: start > 0 ? 206 : 200 });
      };
      const ticks: number[] = [];
      const r = await downloadMeetingModelFromCdn('asr-meeting-sensevoice', {
        baseUrl: 'https://cdn2.taituai.com/meeting-models',
        fetchImpl,
        targetOverride: { destDir: dir, label: 'SenseVoice', files: [{ file: 'model.int8.onnx', sha256: sha, bytes: payload.length }] },
        onProgress: (p) => ticks.push(p.percent),
      });
      expect(r).toEqual({ ok: true, destDir: dir });
      expect(ranges).toEqual(['bytes=10-']);
      expect(readFileSync(join(dir, 'model.int8.onnx')).equals(payload)).toBe(true);
      expect(existsSync(join(dir, 'model.int8.onnx.part'))).toBe(false);
      expect(ticks.length).toBeGreaterThan(0);

      // 第二次调用：文件已齐直接跳过，不发请求
      const r2 = await downloadMeetingModelFromCdn('asr-meeting-sensevoice', {
        baseUrl: 'https://cdn2.taituai.com/meeting-models',
        fetchImpl,
        targetOverride: { destDir: dir, label: 'SenseVoice', files: [{ file: 'model.int8.onnx', sha256: sha, bytes: payload.length }] },
      });
      expect(r2.ok).toBe(true);
      expect(ranges).toHaveLength(1);

      // force: true：即使目标文件同字节数已存在且留有坏 .part，也必须清空 .part 从头重新下载覆盖
      writeFileSync(join(dir, 'model.int8.onnx'), Buffer.from('XXXXXXXXXXXXXXXXXXXX'));
      writeFileSync(join(dir, 'model.int8.onnx.part'), Buffer.from('stale'));
      const r3 = await downloadMeetingModelFromCdn('asr-meeting-sensevoice', {
        baseUrl: 'https://cdn2.taituai.com/meeting-models',
        fetchImpl,
        force: true,
        targetOverride: { destDir: dir, label: 'SenseVoice', files: [{ file: 'model.int8.onnx', sha256: sha, bytes: payload.length }] },
      });
      expect(r3.ok).toBe(true);
      expect(ranges).toEqual(['bytes=10-', null]);
      expect(readFileSync(join(dir, 'model.int8.onnx')).equals(payload)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('SHA-256 不匹配时删除坏文件并报错', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mm-cdn-bad-'));
    try {
      const payload = Buffer.from('corrupted-data');
      const fetchImpl: typeof fetch = async () => new Response(payload, { status: 200 });
      const r = await downloadMeetingModelFromCdn('asr-meeting-sensevoice', {
        baseUrl: 'https://cdn2.taituai.com/meeting-models',
        fetchImpl,
        maxRetries: 1,
        targetOverride: { destDir: dir, label: 'SenseVoice', files: [{ file: 'tokens.txt', sha256: '0'.repeat(64), bytes: payload.length }] },
      });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain('校验不通过');
      expect(existsSync(join(dir, 'tokens.txt'))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('verifyMeetingModelIntegrity 校验文件大小与 SHA-256，区分完好模型与同字节损坏文件', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mm-verify-'));
    try {
      const good = Buffer.from('valid-onnx-bytes-0123456789');
      const sha = createHash('sha256').update(good).digest('hex');
      const targetOverride = { destDir: dir, label: 'CAM++', files: [{ file: 'campp.onnx', sha256: sha, bytes: good.length }] };
      expect(await verifyMeetingModelIntegrity('speaker-campplus', { targetOverride })).toBe(false);
      writeFileSync(join(dir, 'campp.onnx'), good);
      expect(await verifyMeetingModelIntegrity('speaker-campplus', { targetOverride })).toBe(true);
      // 同字节数但内容被改坏
      writeFileSync(join(dir, 'campp.onnx'), Buffer.from('X'.repeat(good.length)));
      expect(await verifyMeetingModelIntegrity('speaker-campplus', { targetOverride })).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('分块写入触发多次背压时不泄漏 WriteStream error 监听器（不报 MaxListenersExceededWarning）', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mm-cdn-bp-'));
    const warnings: string[] = [];
    const onWarning = (w: Error) => warnings.push(`${w.name}: ${w.message}`);
    process.on('warning', onWarning);
    try {
      // 30 块 × 64KB = ~1.9MB，远超默认 16KB highWaterMark，必然触发十余次 drain
      const chunk = Buffer.alloc(64 * 1024, 0x41);
      const chunks = Array.from({ length: 30 }, () => chunk);
      const total = Buffer.concat(chunks);
      const sha = createHash('sha256').update(total).digest('hex');
      const fetchImpl: typeof fetch = async () => new Response(new ReadableStream<Uint8Array>({
        start(ctrl) {
          for (const c of chunks) ctrl.enqueue(new Uint8Array(c));
          ctrl.close();
        },
      }), { status: 200 });
      const r = await downloadMeetingModelFromCdn('asr-meeting-sensevoice', {
        baseUrl: 'https://cdn2.taituai.com/meeting-models',
        fetchImpl,
        targetOverride: { destDir: dir, label: 'SenseVoice', files: [{ file: 'big.onnx', sha256: sha, bytes: total.length }] },
      });
      expect(r.ok).toBe(true);
      await new Promise((res) => setTimeout(res, 20));
      expect(warnings.filter((w) => /MaxListenersExceededWarning/.test(w))).toEqual([]);
    } finally {
      process.off('warning', onWarning);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
