/**
 * 运营中心（军团集群指挥）主进程入口（hostApi=2，手写 CommonJS，不经 qiye-app solutions-build）。
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
const { readFileSync, readdirSync, unlinkSync, existsSync, writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');
const { listInstalledLegions, normalizeCustomLegion, CUSTOM_PREFIX, publicLegion } = require('./legions.cjs');
const { parseJsonLoose } = require('./triage.cjs');
const { LegionBus, Recorder } = require('./bus.cjs');
const { createState, applyEvent, snapshot } = require('./screenState.cjs');
const { resolveProfile, displayProfile, clean: cleanCompany } = require('./company.cjs');
const { Fleet, cleanWorkbench } = require('./fleet.cjs');
const { TaskRunner } = require('./runner.cjs');
const { RoutineScheduler } = require('./routines.cjs');
const { Director, loadScripts, validateScript } = require('./director.cjs');
const { AutoPilot, commandPool } = require('./autopilot.cjs');
const { ScreenServer, filePages } = require('./screenServer.cjs');
const { EmployeeWatch } = require('./employee.cjs');
const X = require('./extras.cjs');
const { buildDocx } = require('./docx.cjs');

const D = 'legion-hq';
const SETTINGS = `${D}/settings.json`;
// L12 部门专用模型 / key：单独一个文件，界面只拿打码后的
const LEGION_KEYS = `${D}/legion-keys.json`;
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

/** 主控统一管理员工机配置（宿主 services/employeeConfig.ts）：文字 / 图片 / 视频 / 语音模型，key 由宿主主进程下发。
 *  旧宿主没有这个模块时返回 null（界面提示升级）。host: 模块只有本入口文件能 require。 */
function hostEmployeeConfig() {
  try {
    return require('host:apps/desktop-shell/src/main/services/employeeConfig.ts').getEmployeeConfigService() || null;
  } catch {
    return null;
  }
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
    // L11：方案包部门 + 自定义部门（运营中心数据里，角色从方案包部门的角色里选）
    const CUSTOM = `${D}/custom-legions.json`;
    const loadAllLegions = () => {
      const pkgs = listInstalledLegions(ctx.packagePath('.'), ctx.log);
      const knownRoles = [...new Set(pkgs.flatMap((L) => L.roles))];
      const customs = (ctx.readJson(CUSTOM, []) || []).map((r, i) => normalizeCustomLegion(r, knownRoles, 8000 + i)).filter(Boolean);
      return [...pkgs, ...customs.filter((c) => !pkgs.some((p) => p.id === c.id))];
    };
    let legions = loadAllLegions();
    const reloadLegions = () => {
      legions = loadAllLegions();
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
    // LG7 / HR7：本机工作台细步骤（法务逐条审查、人事批量筛选）；员工机的经 status.report 带回
    let localWorkbench = () => [];
    try {
      const wa = require('host:apps/desktop-shell/src/main/services/workbenchActivity.ts');
      localWorkbench = () => cleanWorkbench(wa.workbenchActivitySnapshot());
    } catch {
      /* 旧宿主 / 单测 */
    }
    const withLocalWorkbench = (machines) => {
      const wb = localWorkbench();
      return machines.map((m) => (m.local ? { ...m, load: { ...(m.load || {}), workbench: wb } } : m));
    };
    const publishFleet = (raw) => {
      const machines = withLocalWorkbench(raw);
      const key = JSON.stringify(machines.map((m) => [m.id, m.name, m.online, m.hosts, m.busy, m.load, m.note, m.packages]));
      if (key === lastFleetKey) return;
      lastFleetKey = key;
      bus.publish('fleet:changed', { machines: machines.map((m) => ({ id: m.id, name: m.name, ip: m.ip, local: m.local, online: m.online, hosts: m.hosts, busy: m.busy, load: m.load || null, packages: m.packages || null, note: m.note || null })) });
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
      // 演示模式（默认开）：不调模型、不派员工机，执行与汇总都是本机模拟
      simulate: () => settings().demoRun !== false && fleet.mode() !== 'employee',
      legionKeys: (id) => ctx.readJson(LEGION_KEYS, {})[id] || null,
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
    // D6 演示公司资料包：开启后作为「公司资料」附进各部门提示词
    let demoPackText = null;
    runner.extraContext = () => {
      if (!settings().demoPack) return '';
      if (demoPackText == null) demoPackText = X.loadDemoPack(ctx.packagePath('resources/demo-pack'));
      return demoPackText;
    };
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

    // 自动演示（大屏无人值守）：老板自动审批 + 持续下不同的命令（命令取自内置剧本事项）
    const autopilot = new AutoPilot({
      pool: () => commandPool(director.scripts().filter((x) => x.builtin)),
      tasks: () => snapshot(state).tasks,
      submit: (c) => runner.submit({ text: c.text, title: c.title || undefined, source: c.source, forcedLegions: c.legions && c.legions.length ? c.legions : null }),
      approve: (taskId) => runner.confirm(taskId),
      onChange: (on) => bus.publish('demo:changed', { on }),
    });
    // 演示模式开关（主控页面与大屏共用）：开 = 自动下令 + 自动审批 + 不调模型
    const setDemoRun = (on) => {
      if (fleet.mode() === 'employee') throw new Error('本机是员工机：演示模式只在主控（或单机）上开');
      saveSettings({ demoRun: !!on });
      if (on) autopilot.start();
      else autopilot.stop();
      return { on: autopilot.on };
    };
    if (settings().demoRun !== false && fleet.mode() !== 'employee') autopilot.start();
    disposers.push(() => autopilot.stop());

    // ── 大屏服务 ──
    const screen = new ScreenServer({
      bus,
      getState: () => snapshot(state),
      getCoverage: () => JSON.parse(readFileSync(ctx.packagePath('resources/coverage.json'), 'utf8')),
      pages: filePages(ctx.packagePath('resources/screen/index.html'), ctx.packagePath('resources/screen/remote.html')),
      onCommand: (b) => runner.submit({ text: b?.text, source: ['boss', 'customer', 'mail'].includes(b?.source) ? b.source : 'boss' }),
      onConfirm: (b) => (b?.approve === false ? runner.reject(String(b.taskId), b.comment) : runner.confirm(String(b?.taskId))),
      onDemo: (b) => setDemoRun(!!b?.on),
      onCompany: (b) => {
        if (settings().demoMode) throw new Error('已设为隐藏真实名称，不能在大屏改公司名，请在主控取消「隐藏真实名称」');
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

    // E3：员工机回传的执行阶段（宿主 task.progress 经集群 task:received 事件到这里），转成大屏「正在做什么」
    const procRef = deps?.clusterDiscoveryProc || null;
    const onInbound = (d) => {
      try {
        if (d?.roleId === 'task.progress' && d.payload) runner.onRemoteProgress(d.payload.taskId, d.payload.phase);
      } catch {
        /* 畸形帧忽略 */
      }
    };
    if (procRef && typeof procRef.on === 'function') procRef.on('task:received', onInbound);

    // O7：需要老板拍板、例行事务办完时发系统通知（可在设置里关掉）；打开「同时发到老板 IM」时经宿主发给机主私聊
    let pushToOwner = null;
    try {
      pushToOwner = require('host:apps/desktop-shell/src/main/services/imRunLink.ts').pushToImOwner || null;
    } catch {
      pushToOwner = null; // 宿主早于 2026-10-22 没有这个接口
    }
    const notify = (title, body) => {
      if (settings().notify !== false) {
        try {
          const { Notification } = require('electron');
          if (Notification?.isSupported?.()) new Notification({ title, body: String(body || '').slice(0, 120) }).show();
        } catch {
          /* 无 electron（单测）或系统不支持 */
        }
      }
      if (settings().imPush === true && pushToOwner) {
        const co = displayProfile(profile(), !!settings().demoMode);
        Promise.resolve(pushToOwner(`【${co.short || co.name}】${title}\n${String(body || '').slice(0, 1500)}`))
          .then((ok) => { if (!ok) ctx.log.warn('发到老板 IM 没成功（网关未就绪或没绑定机主）'); })
          .catch(() => {});
      }
    };
    bus.on('event', (ev) => {
      if (ev.replay) return;
      if (ev.type === 'task:awaiting_confirm') notify(`待你拍板：#${ev.taskNo}`, ev.approval?.label ? `${ev.approval.label} · ${ev.approval.reason || ''}` : '');
      if (ev.type === 'task:done' && ev.ok) {
        const t = runner.get(ev.taskId);
        if (t && t.source === 'cron') notify(`例行事务完成：${t.title}`, ev.summary || '');
      }
    });

    // O6：来信文件夹（把邮件导出的 .eml 或文本放进去，自动成为来源 = 来信 的任务；按文件名 + 修改时间去重，不改动原文件）
    const MAIL_SEEN = `${D}/mail-seen.json`;
    const scanMail = () => {
      const dir = settings().mailFolder;
      if (!dir || fleet.mode() === 'employee') return [];
      const seen = new Set(ctx.readJson(MAIL_SEEN, []));
      const fresh = X.scanMailFolder(dir, seen);
      const made = [];
      for (const f of fresh.slice(0, 10)) {
        seen.add(f.key);
        try {
          const mail = X.parseMailFile(readFileSync(f.file, 'utf8'), f.name);
          made.push(runner.submit(X.mailToTask(mail)));
        } catch (e) {
          ctx.log.warn(`来信解析失败：${f.name} ${e.message}`);
        }
      }
      if (fresh.length) ctx.writeJson(MAIL_SEEN, [...seen].slice(-2000));
      return made;
    };
    const mailTimer = setInterval(() => {
      try {
        scanMail();
      } catch (e) {
        ctx.log.warn(`来信文件夹扫描失败：${e.message}`);
      }
    }, 20_000);
    if (mailTimer.unref) mailTimer.unref();

    // E1：宿主工作流页（集群工作流）的运行也上大屏动态 —— 开始 / 节点派到哪台员工机（带部门）/ 完成或失败
    let wfBus = null;
    try {
      wfBus = require('host:apps/desktop-shell/src/main/services/workflowEventBus.ts').workflowEventBus;
    } catch {
      wfBus = null; // 旧宿主没有工作流事件总线
    }
    const machineName = (id) => (fleet.machines().find((m) => m.id === id) || {}).name || id;
    const onWorkflowEvent = (ev) => {
      try {
        if (!ev || fleet.mode() === 'employee' || ev.kind === 'node:token') return;
        const run = String(ev.runId || '').slice(-4);
        let text = '';
        if (ev.kind === 'run:started') text = `集群工作流开始（…${run}）`;
        else if (ev.kind === 'node:dispatched' && ev.dispatchStatus === 'dispatched') text = `工作流节点 → ${machineName(ev.dispatchTargetId)}${ev.dispatchRole ? `（${ev.dispatchRole}）` : ''}`;
        else if (ev.kind === 'node:dispatched' && ev.dispatchStatus === 'fallback') text = '工作流节点没有可派的员工机，在主控本机执行';
        else if (ev.kind === 'run:completed') text = `集群工作流完成（…${run}）`;
        else if (ev.kind === 'run:failed') text = `集群工作流失败（…${run}）：${String(ev.error || '').slice(0, 40)}`;
        if (text) bus.publish('workflow:external', { text, legionId: ev.dispatchLegionId || null });
      } catch {
        /* 动态写不进不影响工作流 */
      }
    };
    if (wfBus) wfBus.on('event', onWorkflowEvent);

    // O6 直连邮箱：宿主 IMAP 收件（设置 → 邮件 配了收件服务器）新到的真实邮件交给 AI 总经理；
    // 宿主已滤掉 noreply / 群发 / 自动回复。按收件箱条目 id 去重；员工机不收
    const MAILBOX_SEEN = `${D}/mailbox-seen.json`;
    const intake = deps?.intakeService && typeof deps.intakeService.on === 'function' ? deps.intakeService : null;
    const onIntakeItem = (item) => {
      try {
        if (settings().mailboxIntake !== true || fleet.mode() === 'employee') return;
        if (!item || item.channel !== 'email' || item.simulated) return;
        const seen = new Set(ctx.readJson(MAILBOX_SEEN, []));
        if (seen.has(item.id)) return;
        seen.add(item.id);
        ctx.writeJson(MAILBOX_SEEN, [...seen].slice(-2000));
        const task = X.mailToTask({ from: item.from?.name || item.from?.address || '', subject: item.subject || '（无主题）', body: String(item.body || '') });
        runner.submit(task);
      } catch (e) {
        ctx.log.warn(`邮箱来信转任务失败：${e.message}`);
      }
    };
    if (intake) intake.on('item-added', onIntakeItem);

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
    // 本机工作台细步骤 3 秒一查（publishFleet 内部去重，没变化不推）
    const wbTimer = setInterval(() => publishFleet(fleet.machines()), 3000);
    if (wbTimer.unref) wbTimer.unref();
    if (settings().screenAutoStart && fleet.mode() !== 'employee') screen.start({ port: settings().screenPort || undefined }).catch((e) => ctx.log.warn(e.message));

    disposers = [
      () => clearInterval(fleetTimer),
      () => clearInterval(wbTimer),
      () => clearInterval(mailTimer),
      () => intake && typeof intake.off === 'function' && intake.off('item-added', onIntakeItem),
      () => wfBus && wfBus.off('event', onWorkflowEvent),
      () => procRef && typeof procRef.off === 'function' && procRef.off('task:received', onInbound),
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
        demoRun: autopilot.on,
        screenView: ['topo', 'office'].includes(settings().screenView) ? settings().screenView : 'auto',
        screenPort: settings().screenPort || null,
        terms: settings().terms === 'legion' ? 'legion' : 'department',
        demoPack: !!settings().demoPack,
        notify: settings().notify !== false,
        imPush: settings().imPush === true,
        imPushAvailable: !!pushToOwner,
        mailFolder: settings().mailFolder || '',
        mailboxIntake: settings().mailboxIntake === true,
        mailboxAvailable: !!intake,
        mailboxStatus: (() => {
          try {
            return deps?.mailIntakeProc?.getStatus?.() || null;
          } catch {
            return null;
          }
        })(),
        cost: { ...X.COST_DEFAULTS, ...(settings().cost || {}) },
      },
      screen: screen.status(),
    });

    // ── action ──
    const h = (name, fn) => ctx.handle(name, fn);
    h('info', info);
    h('state', () => snapshot(state));
    h('employee.state', () => employee.snapshot());
    h('command', (p) => runner.submit({ text: p?.text, title: p?.title, source: p?.source || 'boss', forcedLegions: Array.isArray(p?.legions) && p.legions.length ? p.legions : null }));
    h('demoRun.set', (p) => setDemoRun(!!p?.on));
    h('confirm', (p) => (p?.approve === false ? runner.reject(String(p.taskId), p.comment) : runner.confirm(String(p?.taskId))));
    h('cancel', (p) => runner.cancel(String(p?.taskId)));
    h('retry', (p) => runner.retryFailed(String(p?.taskId)));
    // 部门与机器：按机器配模型（与宿主「总控」页同一个服务、同一份配置）
    const needCfg = () => {
      const s = hostEmployeeConfig();
      if (!s) throw new Error('当前 App 版本不支持统一配置员工机模型，请升级，或在「集群 → 总控」里配置');
      return s;
    };
    h('machineConfig.get', async () => {
      const s = hostEmployeeConfig();
      return s ? { available: true, ...(await s.get()) } : { available: false };
    });
    h('machineConfig.save', async (p) => needCfg().save(String(p?.scope || ''), p?.desired || {}));
    h('machineConfig.clear', async (p) => needCfg().clearNode(String(p?.nodeId || '')));
    h('tasks.list', () => listTaskFiles(ctx));
    h('tasks.get', (p) => runner.get(String(p?.taskId)) || ctx.readJson(`${D}/tasks/${String(p?.taskId).replace(/[^\w-]/g, '')}.json`, null));

    // L11 现场造一个新部门：一句话 → AI 起草（只能从已有角色里选人）→ 人确认 → 保存后即可分配到机器、被派任务
    const knownRoleList = () => [...new Set(legions.filter((L) => !L.custom).flatMap((L) => L.roles.map((r) => ({ id: r, dept: L.short }))).map((x) => JSON.stringify(x)))].map((x) => JSON.parse(x));
    h('legions.draftCustom', async (p) => {
      const need = String(p?.text || '').trim().slice(0, 300);
      if (!need) throw new Error('说一句要什么部门');
      const roles = knownRoleList();
      const prompt = [
        `老板想新设一个部门：${need}`,
        '从下面已有的 AI 员工角色里挑 2–8 个组成这个部门（只能用列表里的 id，不能编）：',
        ...roles.map((r) => `- ${r.id}（现属${r.dept}）`),
        '只输出 JSON：{"name":"××部（≤6 字）","short":"简称 2 字","summary":"这个部门管什么（一句话）","routingHints":["什么样的事交给它的关键词，5–12 个"],"roles":["角色 id"],"leadRole":"负责人角色 id","color":"#RRGGBB"}',
      ].join('\n');
      const raw = parseJsonLoose(await runner.llm(prompt, { timeoutMs: 120_000 }));
      const draft = normalizeCustomLegion({ ...raw, id: `${CUSTOM_PREFIX}draft0000` }, roles.map((r) => r.id));
      if (!draft) throw new Error('AI 起草的部门不完整（名称 / 职责 / 角色缺失或角色不在角色库里），换个说法再试');
      return { name: draft.name, short: draft.short, summary: draft.summary, routingHints: draft.routingHints, roles: draft.roles, leadRole: draft.leadRole, color: draft.color, roleOptions: roles };
    });
    h('legions.saveCustom', (p) => {
      const list = ctx.readJson(CUSTOM, []) || [];
      if (list.length >= 8) throw new Error('自定义部门最多 8 个');
      const id = `${CUSTOM_PREFIX}${Date.now().toString(36)}`;
      const L = normalizeCustomLegion({ ...p, id }, knownRoleList().map((r) => r.id));
      if (!L) throw new Error('部门不完整：要有名称、职责，至少一个角色库里的角色');
      if (legions.some((x) => x.name === L.name)) throw new Error(`已经有「${L.name}」了`);
      list.push({ id, name: L.name, short: L.short, summary: L.summary, routingHints: L.routingHints, roles: L.roles, leadRole: L.leadRole, color: L.color, createdAt: Date.now() });
      ctx.writeJson(CUSTOM, list);
      reloadLegions();
      bus.publish('legions:changed', { legions: legions.map(publicLegion) });
      publishFleet(fleet.machines());
      return { id, legions: legions.map(publicLegion) };
    });
    h('legions.removeCustom', (p) => {
      const id = String(p?.id || '');
      if (!id.startsWith(CUSTOM_PREFIX)) throw new Error('只能删自定义部门');
      ctx.writeJson(CUSTOM, (ctx.readJson(CUSTOM, []) || []).filter((x) => x.id !== id));
      reloadLegions();
      bus.publish('legions:changed', { legions: legions.map(publicLegion) });
      publishFleet(fleet.machines());
      return legions.map(publicLegion);
    });

    h('legions.reload', () => {
      reloadLegions();
      bus.publish('legions:changed', { legions: legions.map(publicLegion) });
      publishFleet(fleet.machines());
      return legions.map(publicLegion);
    });
    h('fleet.list', async (p) => withLocalWorkbench(fleet.mode() === 'cluster' ? await refreshFleet(!!p?.force) : fleet.machines()));
    h('fleet.assign', async (p) => {
      const L = legions.find((x) => x.id === p?.legionId);
      if (!L) throw new Error('本机没有装这个部门');
      const machines = await fleet.assign(L.id, String(p.machineId), !!p.on);
      publishFleet(machines);
      return machines;
    });
    // L3：重装 / 卸载员工机上的部门方案包（勾选承载时已自动装过一次）
    h('fleet.package', async (p) => {
      const L = legions.find((x) => x.id === p?.legionId);
      if (!L) throw new Error('本机没有装这个部门');
      const st = await fleet.installPackage(String(p.machineId), L.id, p?.action === 'uninstall');
      publishFleet(fleet.machines());
      return { state: st?.state, error: st?.error || null, machines: withLocalWorkbench(fleet.machines()) };
    });
    h('fleet.rename', (p) => {
      const machines = fleet.rename(String(p?.machineId), p?.name);
      publishFleet(machines);
      return machines;
    });

    // L12：部门专用模型 / key
    const maskKey = (k) => (k ? `${String(k).slice(0, 3)}…${String(k).slice(-4)}` : '');
    h('legionKeys.list', () => {
      const all = ctx.readJson(LEGION_KEYS, {});
      return legions.map((L) => {
        const v = all[L.id] || {};
        return { legionId: L.id, name: L.name, provider: v.provider || '', model: v.model || '', baseUrl: v.baseUrl || '', outputChars: v.outputChars || 0, key: maskKey(v.apiKey), hasKey: !!v.apiKey, defaultModel: L.defaultModel || '' };
      });
    });
    h('legionKeys.set', (p) => {
      const id = String(p?.legionId || '');
      if (!legions.some((L) => L.id === id)) throw new Error('没有这个部门');
      const all = ctx.readJson(LEGION_KEYS, {});
      const prev = all[id] || {};
      const str = (v, n) => String(v ?? '').trim().slice(0, n);
      const oc = Number(p.outputChars);
      const next = { provider: str(p.provider, 40), model: str(p.model, 120), baseUrl: str(p.baseUrl, 300), apiKey: p.apiKey === undefined ? prev.apiKey || '' : str(p.apiKey, 400), outputChars: Number.isFinite(oc) && oc >= 300 ? Math.min(2000, Math.round(oc)) : 0 };
      if (next.baseUrl && !/^https?:\/\//i.test(next.baseUrl)) throw new Error('接口地址要以 http:// 或 https:// 开头');
      if (next.apiKey && !next.provider) throw new Error('填了 key 就要填服务商（如 deepseek）');
      if (!next.provider && !next.model && !next.apiKey && !next.outputChars) delete all[id];
      else all[id] = next;
      ctx.writeJson(LEGION_KEYS, all);
      return { ok: true };
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
      if (['auto', 'topo', 'office'].includes(p?.screenView)) patch.screenView = p.screenView;
      if (p?.screenPort === null || (Number.isInteger(p?.screenPort) && p.screenPort >= 1024 && p.screenPort <= 65000)) patch.screenPort = p.screenPort;
      if (['legion', 'department'].includes(p?.terms)) patch.terms = p.terms;
      if (typeof p?.demoPack === 'boolean') patch.demoPack = p.demoPack;
      if (typeof p?.notify === 'boolean') patch.notify = p.notify;
      if (typeof p?.imPush === 'boolean') patch.imPush = p.imPush;
      if (p?.mailFolder === '' || p?.mailFolder === null) patch.mailFolder = '';
      if (typeof p?.mailboxIntake === 'boolean') patch.mailboxIntake = p.mailboxIntake;
      if (p?.cost && typeof p.cost === 'object') {
        const c = {};
        for (const k of Object.keys(X.COST_DEFAULTS)) if (Number.isFinite(Number(p.cost[k])) && Number(p.cost[k]) >= 0) c[k] = Number(p.cost[k]);
        patch.cost = c;
      }
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
      // 用局部变量：重开时旧窗口的 closed 回调晚到，原来会把全局 screenWin 置空，
      // 新窗口的全屏 / 置顶 / 拿焦点全跳过（第二次打开起不全屏，本机实测）
      const win = new BrowserWindow({
        x,
        y,
        width,
        height,
        frame: false,
        // macOS 原生全屏会把窗口放进单独的桌面空间：App 不在前台时大屏「打开了却看不到」（本机实测）。
        // macOS 用简单全屏（铺满所选显示器、留在当前空间），其它系统照旧原生全屏
        fullscreen: process.platform !== 'darwin',
        show: false,
        backgroundColor: '#050B1C',
        autoHideMenuBar: true,
        webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
      });
      win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      win.webContents.on('will-navigate', (e, url) => {
        if (!url.startsWith(`http://127.0.0.1:${st.port}/`)) e.preventDefault();
      });
      // Esc：先退出全屏，再按一次关闭
      screenWin = win;
      win.webContents.on('before-input-event', (e, input) => {
        if (input.type !== 'keyDown' || input.key !== 'Escape' || win.isDestroyed()) return;
        if (win.isAlwaysOnTop()) win.setAlwaysOnTop(false);
        if (win.isSimpleFullScreen()) win.setSimpleFullScreen(false);
        else if (win.isFullScreen()) win.setFullScreen(false);
        else win.close();
      });
      win.on('closed', () => {
        if (screenWin === win) screenWin = null;
      });
      const main = deps?.getMainWindow?.();
      if (main && !main.isDestroyed()) main.once('closed', closeWindow);
      // 默认画面（拓扑 / 办公室）：现场仍可按 F 或点右上角切换
      await win.loadURL(st.localUrl + `&view=${['topo', 'office'].includes(settings().screenView) ? settings().screenView : 'auto'}`);
      if (win.isDestroyed()) return { ok: false, error: '大屏窗口已关闭' };
      if (process.platform === 'darwin') win.setSimpleFullScreen(true);
      // 展示大屏要在最上层：点按钮时 App 常不在前台，拿不到焦点就会被正在用的程序窗口挡住（本机实测）。点一下大屏再按 Esc 退出
      win.setAlwaysOnTop(true, 'screen-saver');
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      // 加载完再显示并拿焦点：点按钮时 App 可能不在前台，不主动拿就会躲在别的窗口后面
      win.show();
      try { require('electron').app.focus({ steal: true }); } catch { /* 拿不到焦点也已显示 */ }
      win.focus();
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

    // ── O6 来信文件夹 ──
    h('mail.pickFolder', async () => {
      const { dialog } = require('electron');
      const r = await dialog.showOpenDialog(deps?.getMainWindow?.() || undefined, { properties: ['openDirectory', 'createDirectory'], title: '选择来信文件夹' });
      if (r.canceled || !r.filePaths?.[0]) return { canceled: true };
      saveSettings({ mailFolder: r.filePaths[0] });
      return { folder: r.filePaths[0], made: scanMail() };
    });
    h('mail.scanNow', () => ({ made: scanMail() }));

    // ── D5 剧本调优表：本次开演以来（没开演则最近 2 小时）每步耗时 / 机器 / 产出字数 ──
    const allTasks = () => {
      const files = listTaskFiles(ctx).map((x) => x.id);
      const live = runner.list();
      const ids = new Set(live.map((x) => x.id));
      return [...live, ...files.filter((id) => !ids.has(id)).map((id) => ctx.readJson(`${D}/tasks/${id}.json`, null)).filter(Boolean)];
    };
    h('director.report', (p) => {
      const since = Number(p?.since) || director.status().runStartedAt || Date.now() - 2 * 3600_000;
      return { since, ...X.tuningRows(allTasks(), since) };
    });

    // ── O14 成本看板（演示口径）──
    h('cost.board', () => X.costBoard(allTasks(), legions, settings().cost || {}));

    // ── O3 产出导出：带公司抬头的 Word ──
    h('tasks.export', async (p) => {
      const t = runner.get(String(p?.taskId)) || ctx.readJson(`${D}/tasks/${String(p?.taskId).replace(/[^\w-]/g, '')}.json`, null);
      if (!t) throw new Error('找不到这件事');
      const co = displayProfile(profile(), !!settings().demoMode);
      const name = (id) => legions.find((L) => L.id === id)?.name || id;
      const blocks = [
        { text: `${co.name}`, style: 'note' },
        { text: `${t.title}`, style: 'title' },
        { text: `来源：${{ boss: '老板下令', cron: '定时例行', customer: '客户消息', mail: '来信', script: '剧本' }[t.source] || t.source}　编号 #${t.no}　${new Date(t.createdAt).toLocaleString('zh-CN')}`, style: 'note' },
        t.decision ? { text: `AI 总经理判定：${t.decision.reason}`, style: 'note' } : null,
        t.summary ? { text: t.plan?.summary ? '一、汇总结论' : '结果', style: 'h1' } : null,
        t.summary ? { text: t.summary } : null,
        (t.plan?.steps || []).length > 1 ? { text: '二、各部门产出', style: 'h1' } : null,
        ...((t.plan?.steps || []).length > 1
          ? t.plan.steps.flatMap((s) => [{ text: `${name(s.legionId)}：${s.goal}`, style: 'h2' }, { text: t.outputs?.[s.id]?.error ? `（未完成：${t.outputs[s.id].error}）` : t.outputs?.[s.id]?.text || '' }])
          : []),
        { text: `由「${co.short || co.name} · 运营中心」生成；涉及付款、签约、对外发布、录用的最终动作需老板确认。`, style: 'note' },
      ].filter(Boolean);
      const buf = buildDocx(blocks);
      const fileName = `${(co.short || co.name).replace(/[\\/:*?"<>|]/g, '')}-${t.title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 30)}.docx`;
      try {
        const { dialog, app, shell } = require('electron');
        const r = await dialog.showSaveDialog(deps?.getMainWindow?.() || undefined, { defaultPath: join(app.getPath('documents'), fileName), filters: [{ name: 'Word', extensions: ['docx'] }] });
        if (r.canceled || !r.filePath) return { canceled: true };
        writeFileSync(r.filePath, buf);
        shell.showItemInFolder(r.filePath);
        return { path: r.filePath };
      } catch (e) {
        if (e && e.message && !/Cannot find module|electron/.test(e.message)) throw e;
        const target = ctx.dataPath(`${D}/exports/${fileName}`);
        mkdirSync(join(target, '..'), { recursive: true });
        writeFileSync(target, buf);
        return { path: target };
      }
    });

    // ── O12 OPC 考卷 ──
    const EXAM = `${D}/exam.json`;
    const exam = () => JSON.parse(readFileSync(ctx.packagePath('resources/opc-exam.json'), 'utf8'));
    const examResults = () => ctx.readJson(EXAM, {});
    h('exam.list', () => ({ exam: exam(), results: examResults() }));
    h('exam.run', (p) => {
      const q = exam().items.find((x) => x.id === p?.id);
      if (!q) throw new Error('没有这道题');
      // 考题按「示例科技」资料包出（成本 186 元、逾期应收、三款产品等）；没开资料包作答各部门看不到这些数，答卷没有意义
      const demoPackOn = !settings().demoPack;
      if (demoPackOn) saveSettings({ demoPack: true });
      const r = { ...runner.submit({ text: q.prompt, title: `考卷 ${q.id}：${q.task}`, source: 'boss' }), demoPackOn };
      const all = examResults();
      all[q.id] = { ...(all[q.id] || {}), taskId: r.taskId, ranAt: Date.now() };
      ctx.writeJson(EXAM, all);
      return r;
    });
    h('exam.score', (p) => {
      const q = exam().items.find((x) => x.id === p?.id);
      if (!q) throw new Error('没有这道题');
      if (!X.VERDICTS.includes(p.verdict)) throw new Error('评分只能是 通过 / 部分 / 不通过');
      const all = examResults();
      all[q.id] = { ...(all[q.id] || {}), verdict: p.verdict, checks: q.checks.map((_, i) => !!(p.checks || [])[i]), note: String(p.note || '').slice(0, 300), scoredAt: Date.now() };
      ctx.writeJson(EXAM, all);
      return all[q.id];
    });
    h('exam.report', () => X.examReport(exam(), examResults(), JSON.parse(readFileSync(ctx.packagePath('resources/coverage.json'), 'utf8'))));
    h('exam.export', async () => {
      const rep = X.examReport(exam(), examResults(), JSON.parse(readFileSync(ctx.packagePath('resources/coverage.json'), 'utf8')));
      try {
        const { dialog, app } = require('electron');
        const r = await dialog.showSaveDialog(deps?.getMainWindow?.() || undefined, { defaultPath: join(app.getPath('documents'), 'opc-coverage-report.md'), filters: [{ name: 'Markdown', extensions: ['md'] }] });
        if (r.canceled || !r.filePath) return { canceled: true };
        writeFileSync(r.filePath, rep.markdown);
        return { path: r.filePath };
      } catch {
        const target = ctx.dataPath(`${D}/exports/opc-coverage-report.md`);
        mkdirSync(join(target, '..'), { recursive: true });
        writeFileSync(target, rep.markdown);
        return { path: target };
      }
    });

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
