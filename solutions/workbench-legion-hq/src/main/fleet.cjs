/**
 * 机器与部门装机索引（L3 / L4 / R3）。
 *
 * 部门和机器解耦：一台机器可以承载多个部门。
 * - 员工机承载哪些部门：主控经现有集群通道 config.set 把能力标签 `legion:<部门 id>` 写到员工机画像，
 *   config.get 回读（员工机重启不丢）。宿主现在没有「员工机上报已装方案包」，这是不改 App 能做到的真实往返。
 * - 主控本机承载哪些部门：存在本方案数据里（单机演示时全部部门都在本机）。
 * - 派活（legion_affinity）：在「承载该部门的在线员工机」里挑本方案在途最少的；没有就看主控本机是否承载；
 *   都没有 → 返回 null，由调用方报「没有在线机器承载 X 部门」。
 */

const TAG = 'legion:';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CAPS_TTL_MS = 15_000;

function tagsToLegions(caps) {
  return (Array.isArray(caps) ? caps : []).map(String).filter((c) => c.startsWith(TAG)).map((c) => c.slice(TAG.length));
}

/** 工作台细步骤（status.report.workbench / 本机快照）→ 大屏用的精简形状 */
function cleanWorkbench(list) {
  if (!Array.isArray(list)) return [];
  const num = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : null);
  return list
    .slice(0, 8)
    .filter((a) => a && typeof a.legionId === 'string' && a.legionId)
    .map((a) => ({ legionId: a.legionId.slice(0, 60), label: String(a.label || '').slice(0, 20), done: num(a.done), total: num(a.total) }));
}

/**
 * 自动分配部门：主控要判定、派活、汇总（也占 CPU），所以有员工机在线时主控一个部门都不承载；
 * 部门按人数从多到少，依次放到当前人数合计最少的员工机（人数相同按名称），尽量均衡。
 * 没有员工机在线时全部放在主控本机兜底。纯函数，可单测。
 * @returns {Record<string,string[]>} machineId → 部门 id 列表（含主控，主控 id 用传入的 localId）
 */
function planPlacement(legions, employees, localId) {
  const out = { [localId]: [] };
  const emps = [...employees].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  if (!emps.length) {
    out[localId] = legions.map((L) => L.id);
    return out;
  }
  const load = new Map(emps.map((m) => [m.id, 0]));
  for (const m of emps) out[m.id] = [];
  const order = [...legions].sort((a, b) => (b.staff || 1) - (a.staff || 1) || String(a.id).localeCompare(String(b.id)));
  for (const L of order) {
    const m = emps.reduce((best, x) => (load.get(x.id) < load.get(best.id) ? x : best), emps[0]);
    out[m.id].push(L.id);
    load.set(m.id, load.get(m.id) + (L.staff || 1));
  }
  return out;
}

class Fleet {
  /**
   * @param {object} o
   * @param {() => any} o.proc               宿主 clusterDiscoveryProc（可为 null）
   * @param {() => object} o.readPlacement   { local: string[]|null, aliases: {nodeId: name} }
   * @param {(p:object) => void} o.writePlacement
   * @param {() => string[]} o.installedIds  本机已装部门 id
   */
  constructor({ proc, readPlacement, writePlacement, installedIds, log, now = () => Date.now() }) {
    Object.assign(this, { proc, readPlacement, writePlacement, installedIds, log, now });
    this.caps = new Map(); // nodeId → { legions, at, error }
    this.busy = new Map(); // machineId → 在途步骤数
    this.order = []; // 见过的员工机顺序（决定 A/B/C 字母）
    this.lastMachines = [];
    this.pkg = new Map(); // `${nodeId}|${legionId}` → { state: 'installing'|'ok'|'failed'|'unsupported', error }（L3 员工机装部门包）
  }

  self() {
    const p = this.proc();
    if (!p || typeof p.getSelf !== 'function') return { nodeId: 'local', role: 'non_cluster', status: 'idle' };
    try {
      const s = p.getSelf();
      return { nodeId: s.nodeId || 'local', role: s.deploymentRole || 'non_cluster', status: s.status || 'idle', interfaces: s.lanInterfaces || [] };
    } catch {
      return { nodeId: 'local', role: 'non_cluster', status: 'idle' };
    }
  }

  /** standalone = 单机（全部本机执行）/ cluster = 本机是主控 / employee = 本机是员工机 */
  mode() {
    const r = this.self().role;
    return r === 'orchestrator' ? 'cluster' : r === 'employee' ? 'employee' : 'standalone';
  }

  onlineNodes() {
    const p = this.proc();
    if (!p || this.mode() !== 'cluster') return [];
    try {
      const self = this.self().nodeId;
      // 只算员工机：另一台主控（演示时临时切成主控的机器）不承载部门、不接活（与宿主 clusterDispatchTargets 同一口径；
      // 没带 roles 的旧版本节点不排除）
      return (p.getOnlineNodes() || []).filter((n) => n && n.nodeId && n.nodeId !== self && !(Array.isArray(n.roles) && n.roles.includes('orchestrator')));
    } catch {
      return [];
    }
  }

  placement() {
    const p = this.readPlacement() || {};
    return {
      local: Array.isArray(p.local) ? p.local : null,
      aliases: p.aliases && typeof p.aliases === 'object' ? p.aliases : {},
      order: Array.isArray(p.order) ? p.order.map(String) : [],
    };
  }

  localLegions() {
    const installed = this.installedIds();
    // 单机：全部部门都在本机（装机勾选只对集群主控有意义）
    if (this.mode() === 'standalone') return installed;
    const p = this.placement();
    return p.local ? p.local.filter((id) => installed.includes(id)) : installed;
  }

  async rpc(nodeId, roleId, payload, timeoutMs = 8000) {
    const p = this.proc();
    const id = `lhq-${roleId}-${this.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const call = p.dispatchTask({ taskId: id, idempotencyKey: id, targetNodeId: nodeId, roleId, priority: 'normal', payload: payload || {} });
    const timer = new Promise((_, rej) => setTimeout(() => rej(new Error(`${roleId} 超时`)), timeoutMs).unref?.());
    const res = await Promise.race([call, timer]);
    if (!res || res.status !== 'success') throw new Error(res?.error || `${roleId} 失败`);
    return res.output || {};
  }

  async readCaps(node, force = false) {
    const c = this.caps.get(node.nodeId);
    if (!force && c && this.now() - c.at < CAPS_TTL_MS) return c;
    try {
      const out = await this.rpc(node.nodeId, 'config.get', {});
      // 员工机真实负载（宿主 status.report：本机忙碌的 agent / 单次会话数），读不到不影响部门标签
      let load = null;
      try {
        const st = await this.rpc(node.nodeId, 'status.report', {});
        // 宿主 status.report（2026-10-22 起）还带承载的部门与正在执行的部门任务
        load = {
          busy: Number(st.busyAgents) || 0,
          model: typeof out.model === 'string' ? out.model : null,
          activities: Array.isArray(st.activities) ? st.activities.slice(0, 8).map((a) => ({ taskNo: a.taskNo ?? null, legionId: String(a.legionId || ''), phase: String(a.phase || '').slice(0, 40) })) : [],
          // LG7 / HR7：员工机工作台的细步骤（宿主 workbenchActivity）
          workbench: cleanWorkbench(st.workbench),
          // L3：员工机实际装了的部门方案包
          installedLegions: Array.isArray(st.installedLegions) ? st.installedLegions.filter((x) => typeof x === 'string').slice(0, 40) : null,
        };
      } catch {
        load = c?.load || null;
      }
      const next = { legions: tagsToLegions(out.capabilities), caps: Array.isArray(out.capabilities) ? out.capabilities : [], load, at: this.now(), error: null };
      this.caps.set(node.nodeId, next);
      return next;
    } catch (e) {
      const next = { legions: c?.legions || [], caps: c?.caps || [], load: c?.load || null, at: this.now(), error: String(e.message || e) };
      this.caps.set(node.nodeId, next);
      return next;
    }
  }

  /** 刷新机器列表（读各员工机的部门标签）；返回机器列表 */
  async refresh({ force = false } = {}) {
    const nodes = this.onlineNodes().sort((a, b) => String(a.host).localeCompare(String(b.host), 'en', { numeric: true }));
    await Promise.all(nodes.map((n) => this.readCaps(n, force)));
    return this.machines(nodes);
  }

  machines(nodes = this.onlineNodes()) {
    const p = this.placement();
    // A / B / C 的字母按「第一次见到」的顺序，并落盘：主控重启后同一台员工机还叫原来的名字（三实例联调实测：重启后 A / B 对调）
    if (!this.order.length && p.order.length) this.order = [...p.order];
    const seen = this.order.length;
    for (const n of nodes) if (!this.order.includes(n.nodeId)) this.order.push(n.nodeId);
    if (this.order.length !== seen) this.writePlacement({ ...p, order: this.order.slice(-200) });
    const self = this.self();
    const mode = this.mode();
    const list = [
      {
        id: self.nodeId,
        name: mode === 'standalone' ? '本机' : '主控（本机）',
        ip: (self.interfaces && self.interfaces[0]) || '',
        local: true,
        online: true,
        hosts: this.localLegions(),
        busy: this.busy.get(self.nodeId) || 0,
        note: null,
      },
    ];
    for (const n of nodes) {
      const c = this.caps.get(n.nodeId);
      const letter = LETTERS[this.order.indexOf(n.nodeId)] || String(this.order.indexOf(n.nodeId) + 1);
      list.push({
        id: n.nodeId,
        name: p.aliases[n.nodeId] || `员工机 ${letter}`,
        ip: n.host || '',
        local: false,
        online: n.status !== 'offline',
        hosts: c?.legions || [],
        busy: this.busy.get(n.nodeId) || 0,
        load: c?.load || null,
        packages: this.packagesOf(n.nodeId, c?.load?.installedLegions),
        note: c?.error ? `读取部门失败：${c.error}` : null,
      });
    }
    this.lastMachines = list;
    return list;
  }

  /** 把部门装到 / 撤出某台机器 */
  async assign(legionId, machineId, on) {
    const self = this.self();
    if (machineId === self.nodeId || machineId === 'local') {
      const p = this.placement();
      const cur = new Set(this.localLegions());
      if (on) cur.add(legionId);
      else cur.delete(legionId);
      this.writePlacement({ ...p, local: [...cur] });
      return this.machines();
    }
    const node = this.onlineNodes().find((n) => n.nodeId === machineId);
    if (!node) throw new Error('这台机器不在线');
    const c = await this.readCaps(node, true);
    if (c.error) throw new Error(c.error);
    const keep = c.caps.filter((x) => !String(x).startsWith(TAG));
    const legions = new Set(c.legions);
    if (on) legions.add(legionId);
    else legions.delete(legionId);
    // 只传 capabilities：员工机画像里的模型不动（config.set 对缺省字段保留原值）
    await this.rpc(machineId, 'config.set', { capabilities: [...keep, ...[...legions].map((l) => TAG + l)] });
    await this.readCaps(node, true);
    // L3：承载标签立即生效；部门方案包在后台让员工机自己从方案仓库装（可能要下载，不阻塞勾选）。
    // 撤出时不卸包：包留着无害，数据也不动；要卸到「部门与机器」里点「卸包」
    // 自定义部门（legion-c-*，L11）没有方案包，只写承载标签
    if (on && !legionId.startsWith('legion-c-')) void this.installPackage(machineId, legionId);
    return this.machines();
  }

  /** L3：让员工机安装部门方案包（及其免开通的工作台）；旧版员工机不认这个指令时标 unsupported */
  async installPackage(machineId, legionId, uninstall = false) {
    const key = `${machineId}|${legionId}`;
    this.pkg.set(key, { state: 'installing', error: null });
    try {
      const out = await this.rpc(machineId, uninstall ? 'legion.uninstall' : 'legion.install', { ids: [legionId] }, 5 * 60_000);
      const mine = (out.items || []).find((x) => x.id === legionId);
      if (mine && mine.ok) this.pkg.set(key, { state: uninstall ? 'removed' : 'ok', error: null });
      else this.pkg.set(key, { state: 'failed', error: mine?.error || '安装失败' });
    } catch (e) {
      const msg = String(e?.message || e);
      this.pkg.set(key, { state: /未知 roleId|unknown roleId/i.test(msg) ? 'unsupported' : 'failed', error: msg });
    }
    const node = this.onlineNodes().find((n) => n.nodeId === machineId);
    if (node) await this.readCaps(node, true).catch(() => {});
    return this.pkg.get(key);
  }

  /** 每个部门在这台员工机上的包状态：installed（status.report 回读）/ 进行中 / 失败 / 旧版不支持 */
  packagesOf(nodeId, installed) {
    const out = {};
    for (const [key, v] of this.pkg) {
      const [nid, lid] = key.split('|');
      if (nid === nodeId) out[lid] = v.state === 'ok' ? 'installed' : v.state;
    }
    if (Array.isArray(installed)) for (const lid of installed) if (out[lid] !== 'installing') out[lid] = 'installed';
    return out;
  }

  rename(machineId, name) {
    const p = this.placement();
    const aliases = { ...p.aliases };
    const v = String(name || '').trim().slice(0, 12);
    if (v) aliases[machineId] = v;
    else delete aliases[machineId];
    this.writePlacement({ ...p, aliases });
    return this.machines();
  }

  /** 承载该部门、可派活的机器，员工机在前（按在途少优先），主控本机兜底 */
  candidates(legionId, exclude = []) {
    const list = this.lastMachines.length ? this.lastMachines : this.machines();
    const remote = list.filter((m) => !m.local && m.online && m.hosts.includes(legionId) && !exclude.includes(m.id));
    remote.sort((a, b) => (this.busy.get(a.id) || 0) - (this.busy.get(b.id) || 0) || a.name.localeCompare(b.name));
    const local = list.filter((m) => m.local && m.hosts.includes(legionId) && !exclude.includes(m.id));
    return [...remote, ...local];
  }

  pick(legionId, exclude = []) {
    return this.candidates(legionId, exclude)[0] || null;
  }

  /** 在线可用的部门 id（至少一台机器承载） */
  availableLegionIds() {
    const list = this.lastMachines.length ? this.lastMachines : this.machines();
    return [...new Set(list.filter((m) => m.online).flatMap((m) => m.hosts))];
  }

  acquire(machineId) {
    this.busy.set(machineId, (this.busy.get(machineId) || 0) + 1);
  }

  release(machineId) {
    this.busy.set(machineId, Math.max(0, (this.busy.get(machineId) || 0) - 1));
  }
}

module.exports = { planPlacement, cleanWorkbench, Fleet, tagsToLegions, TAG };
