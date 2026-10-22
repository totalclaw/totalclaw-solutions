/**
 * 07 导演台：剧本（D1）、一键开演 / 暂停 / 重置（D2）、强制部门（D3）、回放兜底（D4）。观众看不到。
 *
 * 剧本 = 一组定时下发的事：{ at: 开演后第几秒, text, title?, source?, legions?: 强制部门 }。
 * 暂停 = 不再下新的事（已在跑的继续）；重置 = 中止全部任务、清空大屏。
 * 回放 = 读录制的 JSONL，按原时间间隔把事件喂给大屏（标记 replay），网络或模型出问题时一键切换。
 */
const { readFileSync, readdirSync, existsSync } = require('node:fs');
const { join } = require('node:path');

function validateScript(s) {
  if (!s || typeof s !== 'object') throw new Error('剧本不是对象');
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(String(s.id || ''))) throw new Error(`剧本 id 不合法：${s.id}`);
  if (!s.name) throw new Error('剧本缺 name');
  if (!Array.isArray(s.items) || !s.items.length) throw new Error('剧本至少一件事');
  let last = -1;
  for (const it of s.items) {
    if (!Number.isFinite(it.at) || it.at < 0) throw new Error(`剧本事项 at 不合法：${it.at}`);
    if (it.at < last) throw new Error('剧本事项要按 at 升序');
    last = it.at;
    if (!String(it.text || '').trim()) throw new Error('剧本事项缺 text');
  }
  return s;
}

function loadScripts(builtinDir, customList = []) {
  const out = [];
  if (existsSync(builtinDir)) {
    for (const f of readdirSync(builtinDir).filter((x) => x.endsWith('.json')).sort()) {
      try {
        out.push({ ...validateScript(JSON.parse(readFileSync(join(builtinDir, f), 'utf8'))), builtin: true });
      } catch {
        /* 内置剧本有单测保证，这里坏了就跳过 */
      }
    }
  }
  for (const s of customList) {
    try {
      out.push({ ...validateScript(s), builtin: false });
    } catch {
      /* 自定义剧本坏了跳过 */
    }
  }
  return out;
}

class Director {
  /**
   * @param {object} o
   * @param {() => object[]} o.scripts
   * @param {(item:object) => any} o.submit   下一件事 → runner.submit
   * @param {() => void} o.resetAll
   * @param {import('./bus.cjs').LegionBus} o.bus
   * @param {import('./bus.cjs').Recorder} o.recorder
   */
  constructor({ scripts, submit, resetAll, bus, recorder, now = () => Date.now(), onChange = () => {} }) {
    Object.assign(this, { scripts, submit, resetAll, bus, recorder, now, onChange });
    this.state = { mode: 'idle', scriptId: null, startedAt: null, elapsedMs: 0, next: 0, total: 0, replayFile: null };
    this.timer = null;
  }

  status() {
    const s = this.state;
    const elapsed = s.mode === 'playing' || s.mode === 'replaying' ? s.elapsedMs + (this.now() - s.startedAt) : s.elapsedMs;
    return { ...s, elapsedMs: elapsed };
  }

  play(scriptId) {
    const script = this.scripts().find((s) => s.id === scriptId);
    if (!script) throw new Error('没有这个剧本');
    this.stopTimer();
    this.state = { mode: 'playing', scriptId, startedAt: this.now(), elapsedMs: 0, next: 0, total: script.items.length, replayFile: null };
    this.script = script;
    this.schedule();
    this.onChange(this.status());
    return this.status();
  }

  schedule() {
    this.stopTimer();
    const s = this.state;
    if (s.mode !== 'playing') return;
    const item = this.script.items[s.next];
    if (!item) {
      s.mode = 'finished';
      s.elapsedMs += this.now() - s.startedAt;
      this.onChange(this.status());
      return;
    }
    const elapsed = s.elapsedMs + (this.now() - s.startedAt);
    const wait = Math.max(0, item.at * 1000 - elapsed);
    this.timer = setTimeout(() => {
      s.next++;
      try {
        this.submit({ text: item.text, title: item.title, source: item.source || 'script', forcedLegions: item.legions });
      } catch {
        /* 一件事下发失败不影响剧本往下走 */
      }
      this.onChange(this.status());
      this.schedule();
    }, wait);
    if (this.timer.unref) this.timer.unref();
  }

  pause() {
    const s = this.state;
    if (s.mode !== 'playing') return this.status();
    this.stopTimer();
    s.elapsedMs += this.now() - s.startedAt;
    s.mode = 'paused';
    this.onChange(this.status());
    return this.status();
  }

  resume() {
    const s = this.state;
    if (s.mode !== 'paused') return this.status();
    s.mode = 'playing';
    s.startedAt = this.now();
    this.schedule();
    this.onChange(this.status());
    return this.status();
  }

  reset() {
    this.stopTimer();
    this.resetAll();
    this.state = { mode: 'idle', scriptId: null, startedAt: null, elapsedMs: 0, next: 0, total: 0, replayFile: null };
    this.onChange(this.status());
    return this.status();
  }

  /** D4 回放：先清屏（标记 replay），再按原时间间隔转发录制的事件 */
  replay(file, { speed = 1 } = {}) {
    const events = this.recorder.read(file).filter((e) => !['screen:reset'].includes(e.type));
    if (!events.length) throw new Error('录制文件是空的');
    this.stopTimer();
    this.resetAll();
    this.bus.publish('screen:reset', { replay: true });
    // 回放前把最新的公司 / 部门 / 机器状态补上（录制开头可能没有）
    this.state = { mode: 'replaying', scriptId: null, startedAt: this.now(), elapsedMs: 0, next: 0, total: events.length, replayFile: file };
    const t0 = events[0].ts;
    const step = () => {
      const s = this.state;
      if (s.mode !== 'replaying') return;
      const ev = events[s.next];
      if (!ev) {
        s.mode = 'finished';
        this.onChange(this.status());
        return;
      }
      const due = (ev.ts - t0) / Math.max(0.25, speed);
      const elapsed = this.now() - s.startedAt;
      this.timer = setTimeout(() => {
        s.next++;
        this.bus.replay({ ...ev, ts: this.now() });
        step();
      }, Math.max(0, due - elapsed));
      if (this.timer.unref) this.timer.unref();
    };
    step();
    this.onChange(this.status());
    return this.status();
  }

  stopTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  dispose() {
    this.stopTimer();
  }
}

module.exports = { Director, loadScripts, validateScript };
