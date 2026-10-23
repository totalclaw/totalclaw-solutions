/**
 * 自动演示（大屏无人值守）：老板自动审批 + 持续下不同的命令。
 *
 * 每 tickMs 检查一次：
 *   - 老板待办里的事进来超过 approveDelayMs 就批准（先让观众看到它进了待办）；
 *   - 正在办的事少于 maxActive、距上一条命令超过 minGapMs，就下下一条命令。
 * 命令从内置剧本的事项里轮流取（打乱顺序，不会连着两次同一条），带上剧本里写好的来源与部门。
 * 纯逻辑 + 注入时钟 / 定时器，可单测。
 */
const ACTIVE = new Set(['triaging', 'planning', 'running', 'summarizing', 'awaiting']);

function shuffle(list, rand) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 剧本事项去重（按命令文字）后作为自动演示的命令池 */
function commandPool(scripts) {
  const seen = new Set();
  const out = [];
  for (const s of scripts || []) {
    for (const it of s.items || []) {
      const text = String(it?.text || '').trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      out.push({ text, title: it.title || '', source: it.source || 'boss', legions: Array.isArray(it.legions) ? it.legions : null });
    }
  }
  return out;
}

class AutoPilot {
  /**
   * @param {object} o
   * @param {() => object[]} o.pool        命令池（commandPool 的结果）
   * @param {() => object[]} o.tasks       当前任务（含 id / status）
   * @param {(cmd) => any} o.submit        下令
   * @param {(taskId) => any} o.approve    批准
   * @param {(on:boolean) => void} [o.onChange]
   * @param {(cmd) => boolean} [o.canIssue]  这条命令现在能不能下（要的部门有在线机器承载）；不能就先跳过、留到下一轮
   */
  constructor({ pool, tasks, submit, approve, onChange, canIssue = () => true, now = () => Date.now(), rand = Math.random, setInterval: si = setInterval, clearInterval: ci = clearInterval, tickMs = 3000, approveDelayMs = 6000, minGapMs = 20000, maxActive = 2 }) {
    Object.assign(this, { pool, tasks, submit, approve, onChange, canIssue, now, rand, si, ci, tickMs, approveDelayMs, minGapMs, maxActive });
    this.timer = null;
    this.queue = [];
    this.lastText = '';
    this.lastIssue = -Infinity;
    this.awaitingSince = new Map();
  }

  get on() {
    return !!this.timer;
  }

  start() {
    if (this.timer) return;
    this.lastIssue = -Infinity; // 一开就下第一条
    this.timer = this.si(() => this.tick(), this.tickMs);
    this.timer?.unref?.();
    this.onChange?.(true);
    this.tick();
  }

  stop() {
    if (!this.timer) return;
    this.ci(this.timer);
    this.timer = null;
    this.awaitingSince.clear();
    this.onChange?.(false);
  }

  next() {
    if (!this.queue.length) {
      const pool = this.pool() || [];
      if (!pool.length) return null;
      this.queue = shuffle(pool, this.rand);
      // 新一轮第一条别和上一轮最后一条相同
      if (this.queue.length > 1 && this.queue[0].text === this.lastText) this.queue.push(this.queue.shift());
    }
    const c = this.queue.shift();
    this.lastText = c.text;
    return c;
  }

  tick() {
    if (!this.timer) return;
    const now = this.now();
    const tasks = this.tasks() || [];
    // 自动批准
    for (const t of tasks) {
      if (t.status !== 'awaiting') {
        this.awaitingSince.delete(t.id);
        continue;
      }
      if (!this.awaitingSince.has(t.id)) this.awaitingSince.set(t.id, now);
      else if (now - this.awaitingSince.get(t.id) >= this.approveDelayMs) {
        this.awaitingSince.delete(t.id);
        try { this.approve(t.id); } catch { /* 已被人批了 / 驳回 */ }
      }
    }
    // 持续下令
    const active = tasks.filter((t) => ACTIVE.has(t.status)).length;
    if (active < this.maxActive && now - this.lastIssue >= this.minGapMs) {
      // 刚启动员工机还没连上时，要的部门没人承载：跳过这条（放回队尾），一轮都下不了就等下次
      let c = null;
      const n = Math.max(1, (this.pool() || []).length);
      for (let k = 0; k < n; k++) {
        const x = this.next();
        if (!x) break;
        if (this.canIssue(x)) { c = x; break; }
        this.queue.push(x);
      }
      if (c) {
        this.lastIssue = now;
        try { this.submit(c); } catch { /* 下令失败下一轮再试 */ }
      }
    }
  }
}

module.exports = { AutoPilot, commandPool };
