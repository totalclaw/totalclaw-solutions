/**
 * E1 运营中心事件总线 + E8 对外脱敏 + E7 录制。
 *
 * 大屏所有动画都由这里的事件驱动；控制台界面（ctx.emit）、局域网大屏（SSE）、录制文件都从同一处订阅。
 * 事件统一形如 { seq, ts, type, taskId?, ... }，seq 单调递增，用于去重与乱序丢弃。
 * 大屏对外展示：进总线前先脱敏（文件路径、key、手机号、邮箱、身份证号、agent 脱敏占位符）。
 */
const { EventEmitter } = require('node:events');
const { appendFileSync, mkdirSync, existsSync, readdirSync, readFileSync } = require('node:fs');
const { join, dirname } = require('node:path');

const REDACTIONS = [
  [/\[(?:NAME|PERSON|ORG|COMPANY|CUSTOMER)_\d+\]/g, '某客户'],
  [/\[(?:PHONE|EMAIL|ID|ADDRESS|ACCOUNT)_\d+\]/g, '***'],
  [/(?:[A-Za-z]:\\|\/(?:Users|home|private|var|tmp|Volumes)\/)[^\s"'，。；）)]+/g, '[文件]'],
  [/\b(?:sk|pk|ak|tc)-[A-Za-z0-9_-]{12,}\b/g, '[密钥]'],
  [/\b[A-Za-z0-9_-]{32,}\b/g, '[密钥]'],
  [/[\w.+-]+@[\w-]+\.[\w.]+/g, '[邮箱]'],
  [/(?<!\d)1[3-9]\d{9}(?!\d)/g, '[手机号]'],
  [/(?<!\d)\d{17}[\dXx](?!\d)/g, '[证件号]'],
];

function redactText(s) {
  let out = String(s ?? '');
  for (const [re, rep] of REDACTIONS) out = out.replace(re, rep);
  return out;
}

/** 递归脱敏事件里的字符串字段（数字、布尔、id 字段原样保留） */
// logoImage 是图片 data URL（base64 会命中长串密钥规则），不是文本，原样保留
const KEEP_KEYS = new Set(['logoImage', 'type', 'taskId', 'stepId', 'legionId', 'fromLegion', 'toLegion', 'machineId', 'source', 'status', 'kind', 'mode', 'via', 'roleId', 'id']);
function redactEvent(ev) {
  const walk = (v, key) => {
    if (typeof v === 'string') return KEEP_KEYS.has(key) ? v : redactText(v);
    if (Array.isArray(v)) return v.map((x) => walk(x, key));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
    return v;
  };
  return walk(ev, '');
}

class LegionBus extends EventEmitter {
  constructor({ now = () => Date.now() } = {}) {
    super();
    this.setMaxListeners(100);
    this.seq = 0;
    this.now = now;
    this.recorder = null;
  }

  /** 发事件：补 seq / ts、脱敏，然后通知全部订阅者 */
  publish(type, payload = {}) {
    const ev = redactEvent({ ...payload, type, seq: ++this.seq, ts: payload.ts || this.now() });
    if (this.recorder) this.recorder.write(ev);
    this.emit('event', ev);
    return ev;
  }

  /** 回放用：事件原样转发（不改 seq），标记 replay */
  replay(ev) {
    const out = { ...ev, replay: true };
    this.emit('event', out);
    return out;
  }
}

/** E7 录制：按天一个 JSONL 文件，<dir>/<YYYY-MM-DD>-<序号>.jsonl；每次启动新开一个序号 */
class Recorder {
  constructor(dir, { now = () => Date.now() } = {}) {
    this.dir = dir;
    this.now = now;
    this.file = null;
    this.count = 0;
  }

  open() {
    mkdirSync(this.dir, { recursive: true });
    const day = new Date(this.now()).toISOString().slice(0, 10);
    const n = existsSync(this.dir) ? readdirSync(this.dir).filter((f) => f.startsWith(day)).length + 1 : 1;
    this.file = join(this.dir, `${day}-${String(n).padStart(2, '0')}.jsonl`);
    return this.file;
  }

  write(ev) {
    if (!this.file) this.open();
    try {
      mkdirSync(dirname(this.file), { recursive: true });
      appendFileSync(this.file, JSON.stringify(ev) + '\n');
      this.count++;
    } catch {
      /* 录制失败不影响演示 */
    }
  }

  list() {
    if (!existsSync(this.dir)) return [];
    return readdirSync(this.dir)
      .filter((f) => f.endsWith('.jsonl'))
      .sort()
      .reverse()
      .map((f) => {
        const text = readFileSync(join(this.dir, f), 'utf8');
        return { name: f, events: text ? text.split('\n').filter(Boolean).length : 0 };
      });
  }

  read(name) {
    if (!/^[\w.-]+\.jsonl$/.test(name)) throw new Error('录制文件名不合法');
    const text = readFileSync(join(this.dir, name), 'utf8');
    return text
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }
}

module.exports = { LegionBus, Recorder, redactText, redactEvent };
