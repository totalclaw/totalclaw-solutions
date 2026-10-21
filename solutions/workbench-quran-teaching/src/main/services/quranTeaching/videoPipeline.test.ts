/** 视频样例流水线冒烟：真 ffmpeg 串联分镜（离屏渲染用最小 PNG 桩代替 Electron），验证 concat 与输出落盘。 */
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { resolveFfmpegPair } from '../ffmpegPath';
import { QuranTeachingStore } from './store';

const CORPUS = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources', 'quran-demo-corpus');
const RES = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources');

function tinyPng(w: number, h: number): Buffer {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b: Buffer): number => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type: string, data: Buffer): Buffer => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((w * 3 + 1) * h, 0x20);
  for (let y = 0; y < h; y += 1) raw[y * (w * 3 + 1)] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

describe('视频样例流水线（ffmpeg 真跑）', () => {
  const pair = resolveFfmpegPair(RES);
  const run = pair.ffmpeg ? it : it.skip;
  run('脚本 → 分镜帧 → 静音片段 → concat 成片', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'quran-video-'));
    try {
      const store = new QuranTeachingStore({
        dataDir: dir, bundledCorpusDir: CORPUS, ffmpeg: pair.ffmpeg,
        renderImage: async (_html, out) => { writeFileSync(out, tinyPng(64, 36)); },
        tts: async () => null,
      });
      const script = await store.makeVideoScript({ chapter: 103, lang: 'ar', polish: false });
      const sample = await store.makeVideoSample(script.id);
      expect(existsSync(sample.path)).toBe(true);
      expect(statSync(sample.path).size).toBeGreaterThan(1000);
      expect(sample.voiceEngine).toBe('none');
      expect(sample.source).toBe('generated');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 120_000);
});
