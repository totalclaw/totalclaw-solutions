/**
 * Test-only helpers for the meeting pipeline (not imported by production code).
 * Synthetic audio is generated with ffmpeg; the Python worker is replaced by a fake that
 * returns deterministic text and embeddings, so tests never need real Whisper / CAM++ models.
 */
import { execFileSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { WorkerReady, WorkerSpec } from './workerPool';

const REPO = join(__dirname, '../../../../../../..');

function works(bin: string): boolean {
  try {
    execFileSync(bin, ['-version'], { stdio: 'ignore', timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

function find(tool: 'ffmpeg' | 'ffprobe'): string | null {
  const plats = process.arch === 'arm64' ? ['darwin-arm64', 'darwin-x64'] : ['darwin-x64', 'darwin-arm64'];
  const cands = [
    process.env[tool === 'ffmpeg' ? 'TOTALCLAW_FFMPEG' : 'TOTALCLAW_FFPROBE'] || '',
    ...(process.platform === 'darwin' ? plats.map(p => join(REPO, 'resources/vendor/totalclaw-agent/dist', p, 'ffmpeg', tool)) : []),
    ...(process.platform === 'win32' ? [join(REPO, 'resources/vendor/totalclaw-agent/dist/win32-x64/ffmpeg', `${tool}.exe`)] : []),
    `/opt/homebrew/bin/${tool}`, `/usr/local/bin/${tool}`, `/usr/bin/${tool}`,
    ...(process.env.PATH || '').split(process.platform === 'win32' ? ';' : ':').map(d => join(d, process.platform === 'win32' ? `${tool}.exe` : tool)),
  ].filter(Boolean);
  for (const c of cands) if (existsSync(c) && works(c)) return c;
  return null;
}

export const FFMPEG = find('ffmpeg');
export const FFPROBE = find('ffprobe');

export function hasEncoder(name: string): boolean {
  if (!FFMPEG) return false;
  try {
    const out = execFileSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8', timeout: 10_000 });
    return new RegExp(`\\s${name}\\s`).test(out);
  } catch {
    return false;
  }
}

/**
 * Speech-like test signal: voiced bursts (pitch wobble) with short pauses, over a faint noise floor.
 * pauses: [startSec, endSec] ranges that are near-silent.
 */
export function speechExpr(opts: { duration: number; f0?: number; burstOn?: number; burstOff?: number; silences?: Array<[number, number]> }): string {
  const f0 = opts.f0 ?? 160;
  const on = opts.burstOn ?? 0.25;
  const period = on + (opts.burstOff ?? 0.12);
  const gate = (opts.silences || []).map(([a, b]) => `(1-between(t,${a},${b}))`).join('*') || '1';
  const voice = `0.35*sin(2*PI*(${f0}+30*sin(2*PI*3*t))*t)*lt(mod(t,${period}),${on})*${gate}`;
  return `${voice}+0.002*(random(0)-0.5)`;
}

/** Writes a synthetic file with ffmpeg; extra args choose codec / container / video. */
export function synth(out: string, expr: string, duration: number, extra: string[] = [], video = false): void {
  if (!FFMPEG) throw new Error('no ffmpeg');
  // 表达式里有逗号，用单引号包住（ffmpeg 滤镜语法里的引号，不经过 shell）
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `aevalsrc='${expr}':s=16000:d=${duration}`];
  if (video) args.push('-f', 'lavfi', '-i', `testsrc=size=160x120:rate=10:duration=${duration}`);
  args.push(...extra, out);
  execFileSync(FFMPEG, args, { stdio: 'ignore', timeout: 60_000 });
}

/**
 * Hand-built AMR-NB file (no AMR encoder ships with ffmpeg / macOS): 12.2 kbps frames with
 * pseudo-random payload for "speech" and all-zero payload for pauses (decodes to near silence).
 * Payload bits are masked so the decoded level stays below clipping.
 */
export function writeAmr(out: string, seconds: number): void {
  let seed = 3;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) & 255; };
  const parts: Buffer[] = [Buffer.from('#!AMR\n')];
  const frames = Math.round(seconds * 50);
  for (let f = 0; f < frames; f++) {
    const speech = (f % 15) < 10;
    const b = Buffer.alloc(32);
    b[0] = 0x3c; // FT=7 (12.2 kbps), Q=1
    if (speech) for (let i = 1; i < 32; i++) b[i] = rnd() & 7;
    parts.push(b);
  }
  writeFileSync(out, Buffer.concat(parts));
}

/** Deterministic unit vector per speaker id, with optional noise */
export function speakerVector(id: number, noise = 0, salt = 0): number[] {
  let seed = id * 7919 + 17;
  let seed2 = id * 104729 + salt * 31 + 5;
  const r = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff - 0.5; };
  const r2 = () => { seed2 = (seed2 * 1103515245 + 12345) & 0x7fffffff; return seed2 / 0x7fffffff - 0.5; };
  const v = Array.from({ length: 192 }, () => r() + noise * r2());
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return v.map(x => x / n);
}

export interface FakeWorkerOptions {
  /** text for a slice (seconds); prompt = the initial_prompt sent with this request ('' = none) */
  text?: (start: number, end: number, prompt: string) => string;
  /** embedding for a slice */
  emb?: (start: number, end: number, k: number) => number[] | null;
  asr?: boolean;
  emb_?: boolean;
  /** throw on the n-th request (1-based) to exercise retry */
  failOnRequest?: number;
  /** start() rejects for these worker creations (1-based) */
  failStartFor?: number[];
  log?: Array<{ op: string; slices: number[][]; spec: WorkerSpec }>;
}

/** Drop-in replacement for MeetingWorker */
export function fakeWorkerFactory(o: FakeWorkerOptions = {}) {
  let requests = 0;
  let created = 0;
  return (spec: WorkerSpec) => {
    let alive = false;
    const nth = ++created;
    const w = {
      ready: null as WorkerReady | null,
      get alive() { return alive; },
      async start(): Promise<WorkerReady> {
        if (o.failStartFor?.includes(nth)) throw new Error('cannot start');
        alive = true;
        w.ready = { asr: o.asr ?? !!spec.model, emb: o.emb_ ?? !!spec.campp };
        return w.ready;
      },
      async request(req: any, onItem: (m: any) => void): Promise<any> {
        requests++;
        o.log?.push({ op: req.op, slices: req.slices, spec });
        if (o.failOnRequest && requests === o.failOnRequest) { alive = false; throw new Error('worker exited'); }
        if (req.op === 'detect') return { done: true, lang: 'zh', prob: 0.95 };
        (req.slices as number[][]).forEach(([s, e], k) => {
          const msg: any = { id: 1, i: k };
          if (req.asr && w.ready!.asr) msg.text = o.text ? o.text(s!, e!, req.prompt || '') : `t${Math.round(s! * 10)}`;
          if (req.emb && w.ready!.emb) msg.emb = o.emb ? o.emb(s!, e!, k) : speakerVector(1, 0.1, k);
          onItem(msg);
        });
        return { done: true };
      },
      kill() { alive = false; },
    };
    return w;
  };
}
