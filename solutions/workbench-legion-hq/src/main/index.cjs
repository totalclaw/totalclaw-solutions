/**
 * AI 公司运营中心（军团集群指挥）主进程入口（hostApi=2，手写 CommonJS，不经 qiye-app solutions-build）。
 *
 * 宿主能力只经 ctx.host.deps（IpcDeps）取：
 *   clusterDiscoveryProc   集群节点 / 跨机派发（worker.run、config.get/set、cluster.cancel）
 *   workbenchLlm（host 模块）本机模型调用（默认通道走 runOneshotChat，通道错误会抛错）
 *   serviceAuth            登录账号里的公司信息（尽力而为）
 *   getMainWindow          主窗口关闭时一起关大屏窗口
 * 没有宿主 deps（单测 / hostApi 1 宿主）时：单机模式、不能调模型（判定走规则，步骤报「本机模型不可用」）。
 *
 * 数据（账号目录下 legion-hq/）：settings.json、company-profile.json、tasks/*.json、records/*.jsonl、scripts.json
 */
const { readFileSync, readdirSync, unlinkSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { listInstalledLegions, publicLegion } = require('./legions.cjs');
const { LegionBus, Recorder } = require('./bus.cjs');
const { createState, applyEvent, snapshot } = require('./screenState.cjs');
const { resolveProfile, displayProfile, clean: cleanCompany } = require('./company.cjs');
const { Fleet } = require('./fleet.cjs');
const { TaskRunner } = require('./runner.cjs');
const { RoutineScheduler } = require('./routines.cjs');
const { Director, loadScripts, validateScript } = require('./director.cjs');
const { ScreenServer, filePages } = require('./screenServer.cjs');
const { EmployeeWatch } = require('./employee.cjs');

const D = 'legion-hq';
const SETTINGS = `${D}/settings.json`;
const COMPANY = `${D}/company-profile.json`;
const SCRIPTS = `${D}/scripts.json`;
const MAX_TASK_FILES = 200;

let disposers = [];

function hostLlm(ctx, deps) {
  if (!deps) return null;
  let mod;
  try {
    mod = require('host:apps/desktop-shell/src/main/services/workbenchLlm.ts');
  } catch (e) {
    ctx.log.warn(`宿主模型模块不可用：${e.message}`);
    return null;
  }
  // 按次指定模型：模块名带上模型（workbenchLlm 按模块取模型），空 = 跟随本机默认
  const wl = mod.createWorkbenchLlm(deps, { logTag: 'legion-hq', moduleModel: (m) => (m.startsWith('model:') ? m.slice(6) : '') });
  return async (prompt, opts = {}) => {
    const r = await wl.llm(opts.model ? `model:${opts.model}` : 'legion-hq', prompt, opts.timeoutMs || 180_000);
    return r.text;
  };
}

/** 员工画像：宿主 accountScope.privateRoot()/employee-profile.json（与 clusterDispatchRouter 同一处）。
 *  host: 模块只有本入口文件能 require（宿主只给入口注入专用 require），子模块经参数拿。 */
function employeeProfilePath() {
  try {
    const { privateRoot } = require('host:apps/desktop-shell/src/main/services/accountScope.ts');
    return join(privateRoot(), 'employee-profile.json');
  } catch {
    return '';
  }
}

function hostCompanySources(deps) {
  const out = [];
  try {
    const u = deps?.serviceAuth?.readSession?.()?.user;
    const name = u && (u.companyName || u.company?.name || u.enterpriseName || u.orgName);
    if (name) out.push({ name: String(name) });
  } catch {
    /* 未登录 / 字段不存在 */
  }
  return out;
}

module.exports = {
  hostApi: 2,

  async activate(ctx) {
    const deps = ctx.host?.deps || null;
    const settings = () => ctx.readJson(SETTINGS, {});
    const saveSettings = (patch) => {
      const next = { ...settings(), ...patch };
      ctx.writeJson(SETTINGS, next);
      return next;
    };

    // ── 部门（军团）──
    let legions = listInstalledLegions(ctx.packagePath('.'), ctx.log);
    const reloadLegions = () => {
      legions = listInstalledLegions(ctx.packagePath('.'), ctx.log);
      return legions;
    };

    // ── 总线 / 快照 / 录制 ──
    const bus = new LegionBus();
    const recorder = new Recorder(ctx.dataPath(`${D}/records`));
    bus.recorder = recorder;
    const state = createState();
    let stateTimer = null;
    bus.on('event', (ev) => {
      if (!applyEvent(state, ev)) return;
      ctx.emit('event', ev);
      if (!stateTimer) {
        stateTimer = setTimeout(() => {
          stateTimer = null;
          ctx.emit('state', snapshot(state));
        }, 300);
      }
    });

    // ── 公司档案 ──
    let defaultLogoImage = '';
    try {
      defaultLogoImage = `data:image/png;base64,${readFileSync(ctx.packagePath('resources/company-logo.png')).toString('base64')}`;
    } catch {
      /* 没有包内 logo 就只用标志文字 */
    }
    const profile = () => resolveProfile(ctx.readJson(COMPANY, {}), hostCompanySources(deps), { defaultLogoImage });
    const publishCompany = () => bus.publish('company:changed', { company: displayProfile(profile(), !!settings().demoMode) });

    // ── 机器与装机 ──
    const fleet = new Fleet({
      proc: () => deps?.clusterDiscoveryProc || null,
      readPlacement: () => settings().placement || {},
      writePlacement: (p) => saveSettings({ placement: p }),
      installedIds: () => legions.map((L) => L.id),
      log: ctx.log,
    });
    let lastFleetKey = '';
    const publishFleet = (machines) => {
      const key = JSON.stringify(machines.map((m) => [m.id, m.name, m.online, m.hosts, m.busy, m.load, m.note]));
      if (key === lastFleetKey) return;
      lastFleetKey = key;
      bus.publish('fleet:changed', { machines: machines.map((m) => ({ id: m.id, name: m.name, ip: m.ip, local: m.local, online: m.online, hosts: m.hosts, busy: m.busy, load: m.load || null, note: m.note || null })) });
    };
    const refreshFleet = async (force = false) => {
      const machines = await fleet.refresh({ force });
      publishFleet(machines);
      return machines;
    };

    // ── 执行 ──
    const llm = hostLlm(ctx, deps);
    const runner = new TaskRunner({
      bus,
      legions: () => legions,
      fleet,
      company: profile,
      settings,
      log: ctx.log,
      llm: async (prompt, opts) => {
        if (!llm) throw new Error('本机模型不可用（宿主未提供模型通道）');
        return llm(prompt, opts);
      },
      saveTask: (rec) => {
        ctx.writeJson(`${D}/tasks/${rec.id}.json`, rec);
        pruneTaskFiles(ctx);
      },
    });
    // 机器忙闲变化随步骤开始 / 结束推给大屏
    bus.on('event', (ev) => {
      if (ev.type === 'node:dispatched' || ev.type === 'node:done' || ev.type === 'node:failed') publishFleet(fleet.machines(fleet.onlineNodes()));
    });

    const routines = new RoutineScheduler({
      read: () => settings().routines || {},
      write: (s) => saveSettings({ routines: s }),
      fire: (r) => (fleet.mode() === 'employee' ? null : runner.submit({ text: r.text, title: r.name, source: 'cron', forcedLegions: r.legions.filter((id) => legions.some((L) => L.id === id)) })),
      log: ctx.log,
    });

    const director = new Director({
      scripts: () => loadScripts(ctx.packagePath('resources/scripts'), ctx.readJson(SCRIPTS, [])),
      submit: (item) => runner.submit(item),
      resetAll: () => runner.resetAll(),
      bus,
      recorder,
      onChange: (s) => ctx.emit('director', s),
    });

    // ── 大屏服务 ──
    const screen = new ScreenServer({
      bus,
      getState: () => snapshot(state),
      getCoverage: () => JSON.parse(readFileSync(ctx.packagePath('resources/coverage.json'), 'utf8')),
      pages: filePages(ctx.packagePath('resources/screen/index.html'), ctx.packagePath('resources/screen/remote.html')),
      onCommand: (b) => runner.submit({ text: b?.text, source: ['boss', 'customer', 'mail'].includes(b?.source) ? b.source : 'boss' }),
      onConfirm: (b) => (b?.approve === false ? runner.reject(String(b.taskId), b.comment) : runner.confirm(String(b?.taskId))),
      onCompany: (b) => {
        if (settings().demoMode) throw new Error('演示模式下不能在大屏改公司名，请在主控关闭演示模式');
        saveCompany(b);
        return displayProfile(profile(), false);
      },
    });
    const saveCompany = (input) => {
      const c = cleanCompany(input || {});
      if (!c.name && !c.short) throw new Error('公司名称不能为空');
      ctx.writeJson(COMPANY, { ...ctx.readJson(COMPANY, {}), ...c });
      publishCompany();
      return profile();
    };

    let screenWin = null;
    const closeWindow = () => {
      if (screenWin && !screenWin.isDestroyed()) screenWin.close();
      screenWin = null;
    };

    // 子机视角：本机承载的部门 + 主控派来的正在跑的任务
    const employee = new EmployeeWatch({
      proc: () => deps?.clusterDiscoveryProc || null,
      profilePath: employeeProfilePath,
      onChange: (snap) => ctx.emit('employee', snap),
    });
    employee.start();

    // 初始状态
    bus.publish('legions:changed', { legions: legions.map(publicLegion) });
    publishCompany();
    publishFleet(fleet.machines());
    routines.start();
    const fleetTimer = setInterval(() => {
      if (fleet.mode() === 'cluster') refreshFleet().catch(() => {});
    }, 5000);
    if (fleetTimer.unref) fleetTimer.unref();
    if (settings().screenAutoStart && fleet.mode() !== 'employee') screen.start({ port: settings().screenPort || undefined }).catch((e) => ctx.log.warn(e.message));

    disposers = [
      () => clearInterval(fleetTimer),
      () => employee.stop(),
      () => stateTimer && clearTimeout(stateTimer),
      () => routines.stop(),
      () => director.dispose(),
      () => closeWindow(),
      () => screen.stop(),
      () => runner.resetAll(),
    ];

    const info = () => ({
      id: ctx.id,
      version: ctx.version,
      appVersion: ctx.appVersion,
      mode: fleet.mode(),
      self: fleet.self(),
      hasModel: !!llm,
      legions: legions.map(publicLegion),
      settings: {
        demoMode: !!settings().demoMode,
        useModelTriage: settings().useModelTriage !== false,
        outputChars: settings().outputChars || 900,
        responseLocale: settings().responseLocale || '',
        screenAutoStart: !!settings().screenAutoStart,
        screenPort: settings().screenPort || null,
        terms: settings().terms === 'legion' ? 'legion' : 'department',
      },
      screen: screen.status(),
    });

    // ── action ──
    const h = (name, fn) => ctx.handle(name, fn);
    h('info', info);
    h('state', () => snapshot(state));
    h('employee.state', () => employee.snapshot());
    h('command', (p) => runner.submit({ text: p?.text, title: p?.title, source: p?.source || 'boss', forcedLegions: Array.isArray(p?.legions) && p.legions.length ? p.legions : null }));
    h('confirm', (p) => (p?.approve === false ? runner.reject(String(p.taskId), p.comment) : runner.confirm(String(p?.taskId))));
    h('cancel', (p) => runner.cancel(String(p?.taskId)));
    h('tasks.list', () => listTaskFiles(ctx));
    h('tasks.get', (p) => runner.get(String(p?.taskId)) || ctx.readJson(`${D}/tasks/${String(p?.taskId).replace(/[^\w-]/g, '')}.json`, null));

    h('legions.reload', () => {
      reloadLegions();
      bus.publish('legions:changed', { legions: legions.map(publicLegion) });
      publishFleet(fleet.machines());
      return legions.map(publicLegion);
    });
    h('fleet.list', async (p) => (fleet.mode() === 'cluster' ? refreshFleet(!!p?.force) : fleet.machines()));
    h('fleet.assign', async (p) => {
      const L = legions.find((x) => x.id === p?.legionId);
      if (!L) throw new Error('本机没有装这个部门');
      const machines = await fleet.assign(L.id, String(p.machineId), !!p.on);
      publishFleet(machines);
      return machines;
    });
    h('fleet.rename', (p) => {
      const machines = fleet.rename(String(p?.machineId), p?.name);
      publishFleet(machines);
      return machines;
    });

    h('company.get', () => ({ profile: profile(), display: displayProfile(profile(), !!settings().demoMode) }));
    h('company.save', (p) => saveCompany(p));
    h('company.reset', () => {
      ctx.writeJson(COMPANY, {});
      publishCompany();
      return profile();
    });

    h('settings.save', (p) => {
      const patch = {};
      if (typeof p?.demoMode === 'boolean') patch.demoMode = p.demoMode;
      if (typeof p?.useModelTriage === 'boolean') patch.useModelTriage = p.useModelTriage;
      if (Number.isFinite(p?.outputChars)) patch.outputChars = Math.min(2000, Math.max(300, Math.round(p.outputChars)));
      if (['', 'zh-CN', 'en-US', 'ar'].includes(p?.responseLocale)) patch.responseLocale = p.responseLocale;
      if (typeof p?.screenAutoStart === 'boolean') patch.screenAutoStart = p.screenAutoStart;
      if (p?.screenPort === null || (Number.isInteger(p?.screenPort) && p.screenPort >= 1024 && p.screenPort <= 65000)) patch.screenPort = p.screenPort;
      if (['legion', 'department'].includes(p?.terms)) patch.terms = p.terms;
      saveSettings(patch);
      if ('demoMode' in patch) publishCompany();
      return info().settings;
    });

    h('screen.status', () => screen.status());
    h('screen.start', async (p) => {
      if (fleet.mode() === 'employee') throw new Error('本机是员工机：指挥大屏只在主控（或单机）上开');
      return screen.start({ port: Number.isInteger(p?.port) ? p.port : settings().screenPort || undefined });
    });
    h('screen.stop', async () => {
      closeWindow();
      return screen.stop();
    });
    h('screen.rotate', () => {
      const s = screen.rotateToken();
      if (screenWin && !screenWin.isDestroyed() && s.localUrl) screenWin.loadURL(s.localUrl);
      return s;
    });
    h('displays.list', () => {
      const { screen: es } = require('electron');
      const primary = es.getPrimaryDisplay().id;
      return es.getAllDisplays().map((d, i) => ({ id: d.id, label: `${i + 1} 号屏 ${d.size.width}×${d.size.height}${d.id === primary ? '（主屏）' : ''}`, primary: d.id === primary }));
    });
    // S2 主控本机全屏窗口：在选定显示器开无边框全屏窗口，加载与局域网同一个页面（不给 preload，页面只读 HTTP）
    h('screen.openWindow', async (p) => {
      if (fleet.mode() === 'employee') throw new Error('本机是员工机：指挥大屏只在主控（或单机）上开');
      const st = screen.status().running ? screen.status() : await screen.start({ port: settings().screenPort || undefined });
      const { BrowserWindow, screen: es } = require('electron');
      const display = es.getAllDisplays().find((d) => d.id === Number(p?.displayId)) || es.getPrimaryDisplay();
      closeWindow();
      const { x, y, width, height } = display.bounds;
      screenWin = new BrowserWindow({
        x,
        y,
        width,
        height,
        frame: false,
        fullscreen: true,
        backgroundColor: '#050B1C',
        autoHideMenuBar: true,
        webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
      });
      screenWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      screenWin.webContents.on('will-navigate', (e, url) => {
        if (!url.startsWith(`http://127.0.0.1:${st.port}/`)) e.preventDefault();
      });
      // Esc：先退出全屏，再按一次关闭
      screenWin.webContents.on('before-input-event', (e, input) => {
        if (input.type !== 'keyDown' || input.key !== 'Escape' || !screenWin) return;
        if (screenWin.isFullScreen()) screenWin.setFullScreen(false);
        else closeWindow();
      });
      screenWin.on('closed', () => {
        screenWin = null;
      });
      const main = deps?.getMainWindow?.();
      if (main && !main.isDestroyed()) main.once('closed', closeWindow);
      await screenWin.loadURL(st.localUrl);
      return { ok: true, displayId: display.id };
    });
    h('screen.closeWindow', () => {
      closeWindow();
      return { ok: true };
    });

    h('routines.list', () => routines.list());
    h('routines.toggle', (p) => routines.setEnabled(String(p?.id), !!p?.on));
    h('routines.runNow', (p) => routines.runNow(String(p?.id)));

    h('scripts.list', () => director.scripts().map((s) => ({ id: s.id, name: s.name, description: s.description || '', items: s.items, builtin: s.builtin })));
    h('scripts.save', (p) => {
      const s = validateScript(p);
      if (director.scripts().some((x) => x.builtin && x.id === s.id)) throw new Error('不能覆盖内置剧本，请换一个 id');
      const custom = ctx.readJson(SCRIPTS, []).filter((x) => x.id !== s.id);
      ctx.writeJson(SCRIPTS, [...custom, s]);
      return { ok: true };
    });
    h('scripts.remove', (p) => {
      ctx.writeJson(SCRIPTS, ctx.readJson(SCRIPTS, []).filter((x) => x.id !== p?.id));
      return { ok: true };
    });
    h('director.status', () => director.status());
    h('director.play', (p) => director.play(String(p?.scriptId)));
    h('director.pause', () => director.pause());
    h('director.resume', () => director.resume());
    h('director.reset', () => director.reset());
    h('director.replay', (p) => director.replay(String(p?.file), { speed: Number(p?.speed) || 1 }));
    h('records.list', () => recorder.list());

    h('coverage', () => JSON.parse(readFileSync(ctx.packagePath('resources/coverage.json'), 'utf8')));

    ctx.log.info(`activated: ${legions.length} 个部门，模式 ${fleet.mode()}`);
  },

  async deactivate() {
    const list = disposers;
    disposers = [];
    for (const fn of list) {
      try {
        await fn();
      } catch {
        /* 清理尽力而为 */
      }
    }
  },
};

function taskDir(ctx) {
  return ctx.dataPath(`${D}/tasks`);
}

function listTaskFiles(ctx) {
  const dir = taskDir(ctx);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ctx.readJson(`${D}/tasks/${f}`, null))
    .filter(Boolean)
    .map((r) => ({ id: r.id, no: r.no, title: r.title, source: r.source, status: r.status, createdAt: r.createdAt, finishedAt: r.finishedAt, legions: r.decision?.legions || [] }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function pruneTaskFiles(ctx) {
  const dir = taskDir(ctx);
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  if (files.length <= MAX_TASK_FILES) return;
  const withTime = files.map((f) => ({ f, t: ctx.readJson(`${D}/tasks/${f}`, {})?.createdAt || 0 })).sort((a, b) => a.t - b.t);
  for (const x of withTime.slice(0, files.length - MAX_TASK_FILES)) {
    try {
      unlinkSync(join(dir, x.f));
    } catch {
      /* */
    }
  }
}
