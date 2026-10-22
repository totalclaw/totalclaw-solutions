// AI 公司运营中心（workbench-legion-hq）主进程核心：判定 / 计划 / 执行 / 快照 / 公司档案 / 例行 / 剧本 / 大屏服务 / 子机视角
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { SOLUTIONS_DIR } from '../tools/lib/common.mjs';

const DIR = join(SOLUTIONS_DIR, 'workbench-legion-hq');
const require = createRequire(join(DIR, 'src', 'main', 'index.cjs'));
const { listInstalledLegions, publicLegion } = require('./legions.cjs');
const { triage, triageByRules, validateTriage, isChannelError } = require('./triage.cjs');
const { buildPlan } = require('./planner.cjs');
const { LegionBus, Recorder, redactText } = require('./bus.cjs');
const { createState, applyEvent, snapshot } = require('./screenState.cjs');
const { resolveProfile, displayProfile, identityLine } = require('./company.cjs');
const { Fleet } = require('./fleet.cjs');
const { TaskRunner } = require('./runner.cjs');
const { RoutineScheduler, dueKey, LIBRARY } = require('./routines.cjs');
const { loadScripts, validateScript } = require('./director.cjs');
const { ScreenServer } = require('./screenServer.cjs');
const { EmployeeWatch } = require('./employee.cjs');

const LEGIONS = listInstalledLegions(DIR);
const tick = (ms = 5) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 3000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const v = fn();
    if (v) return v;
    await tick(5);
  }
  throw new Error('等待超时');
}

test('部门注册表：从仓库布局读到 8 个部门和它们的工作流', () => {
  assert.equal(LEGIONS.length, 8);
  const fin = LEGIONS.find((L) => L.id === 'legion-finance');
  assert.equal(fin.workflows.length, 2);
  assert.equal(publicLegion(fin).staff, fin.roles.length);
});

test('部门注册表：安装布局（installed.json）', () => {
  const root = mkdtempSync(join(tmpdir(), 'lhq-inst-'));
  const mk = (id, m) => {
    mkdirSync(join(root, id, '1.0.0+x'), { recursive: true });
    writeFileSync(join(root, id, '1.0.0+x', 'solution.json'), JSON.stringify(m));
  };
  const legal = JSON.parse(readFileSync(join(SOLUTIONS_DIR, 'legion-legal', 'solution.json'), 'utf8'));
  mk('legion-legal', legal);
  mk('legion-broken', { id: 'legion-broken', kind: 'legion', legion: {} });
  mk('workbench-legion-hq', { id: 'workbench-legion-hq' });
  writeFileSync(join(root, 'installed.json'), JSON.stringify({ items: {
    'legion-legal': { id: 'legion-legal', kind: 'legion', activePath: 'legion-legal/1.0.0+x' },
    'legion-broken': { id: 'legion-broken', kind: 'legion', activePath: 'legion-broken/1.0.0+x' },
    'workbench-legion-hq': { id: 'workbench-legion-hq', kind: 'workbench', activePath: 'workbench-legion-hq/1.0.0+x' },
  } }));
  const warns = [];
  const got = listInstalledLegions(join(root, 'workbench-legion-hq', '1.0.0+x'), { warn: (m) => warns.push(m) });
  assert.deepEqual(got.map((L) => L.id), ['legion-legal']);
  assert.equal(warns.length, 1, '坏清单跳过并警告');
});

test('判定：模型输出合法 → 采用；依赖成环 / 选了不可用部门 / 通道错误 / 脏 JSON → 回落规则', async () => {
  const llmOk = async () => '```json\n{"legions":["legion-finance","legion-sales"],"mode":"multi","reason":"先算价再报价","steps":[{"legionId":"legion-sales","goal":"出报价单","dependsOn":["legion-finance"]},{"legionId":"legion-finance","goal":"算底价","dependsOn":[]}]}\n```';
  const ok = await triage('给客户出报价', LEGIONS, { llm: llmOk });
  assert.equal(ok.via, 'model');
  assert.deepEqual(ok.steps.find((s) => s.legionId === 'legion-sales').dependsOn, ['legion-finance']);

  const cyc = async () => '{"legions":["legion-finance","legion-sales"],"steps":[{"legionId":"legion-sales","dependsOn":["legion-finance"]},{"legionId":"legion-finance","dependsOn":["legion-sales"]}]}';
  assert.equal((await triage('出报价', LEGIONS, { llm: cyc })).via, 'rules');
  const ghost = async () => '{"legions":["legion-ghost"]}';
  const g = await triage('审合同', LEGIONS, { llm: ghost });
  assert.equal(g.via, 'rules');
  assert.match(g.fallbackReason, /不可用/);
  const chanErr = async () => '⚠️ 模型调用失败：API Key 无效';
  const ce = await triage('审合同', LEGIONS, { llm: chanErr });
  assert.equal(ce.via, 'rules');
  assert.deepEqual(ce.legions, ['legion-legal'], '通道错误话术不能被当成判定结果');
  const dirty = async () => '好的，我认为应该交给法务。';
  assert.equal((await triage('审合同', LEGIONS, { llm: dirty })).via, 'rules');
  assert.ok(isChannelError(''));
});

test('判定规则：单部门 / 全公司 / 无匹配 / 默认先后', () => {
  assert.deepEqual(triageByRules('帮我审一下这份经销合同', LEGIONS).legions, ['legion-legal']);
  const all = triageByRules('下季度新品上市，全公司全面准备', LEGIONS);
  assert.equal(all.mode, 'all');
  assert.equal(all.legions.length, 8);
  assert.ok(all.steps.find((s) => s.legionId === 'legion-sales').dependsOn.includes('legion-finance'));
  const none = triageByRules('早上好', LEGIONS);
  assert.equal(none.mode, 'none');
  assert.deepEqual(none.steps, []);
});

test('判定：强制部门（剧本 D3）', async () => {
  const r = await triage('随便什么', LEGIONS, { forced: ['legion-hr', 'legion-ghost'], llm: async () => { throw new Error('不该调模型'); } });
  assert.equal(r.via, 'forced');
  assert.deepEqual(r.legions, ['legion-hr']);
});

test('计划：单部门命中常用工作流 → 展开（跨部门步骤保留）；部门不可用的步骤剔除并接上依赖', () => {
  const d = validateTriage({ legions: ['legion-sales'] }, LEGIONS);
  const p = buildPlan('给华东经销商出报价单', d, LEGIONS);
  assert.equal(p.workflow.id, 'quote');
  assert.deepEqual(p.steps.map((s) => s.legionId), ['legion-finance', 'legion-sales']);
  assert.deepEqual(p.steps[1].dependsOn, ['s1']);
  assert.equal(p.approval.kind, 'discount');
  const noFin = LEGIONS.filter((L) => L.id !== 'legion-finance');
  const p2 = buildPlan('给华东经销商出报价单', validateTriage({ legions: ['legion-sales'] }, noFin), noFin);
  assert.deepEqual(p2.steps.map((s) => [s.legionId, s.dependsOn]), [['legion-sales', []]]);
});

test('计划：多部门一部门一步、≥4 个部门要老板确认、红线动作要老板确认', () => {
  const all = buildPlan('全公司全面准备', triageByRules('全公司全面准备', LEGIONS), LEGIONS);
  assert.equal(all.steps.length, 8);
  assert.ok(all.summary);
  assert.equal(all.approval.kind, 'major');
  const pay = buildPlan('把这笔货款付款给供应商', validateTriage({ legions: ['legion-finance'] }, LEGIONS), LEGIONS);
  assert.equal(pay.approval.kind, 'payment');
  const plain = buildPlan('做一份推广投放计划', validateTriage({ legions: ['legion-rd'] }, LEGIONS), LEGIONS);
  assert.equal(plain.approval, null, '准备计划不是对外发布');
});

test('总线脱敏：路径、密钥、手机号、邮箱、证件号、agent 占位符', () => {
  const s = redactText('客户[NAME_1]电话13812345678，邮箱a@b.com，文件 /Users/x/合同.docx，key sk-abcdefghijklmnop1234，身份证110101199003071234');
  assert.doesNotMatch(s, /13812345678|a@b\.com|\/Users|sk-abc|110101199003071234|NAME_1/);
  assert.match(s, /某客户/);
  const bus = new LegionBus();
  const ev = bus.publish('task:received', { taskId: 't-1', title: '联系 13812345678' });
  assert.equal(ev.taskId, 't-1');
  assert.match(ev.title, /手机号/);
  const logo = `data:image/png;base64,${'A'.repeat(200)}`;
  assert.equal(bus.publish('company:changed', { company: { name: 'x', logoImage: logo } }).company.logoImage, logo, '标志图片不被当成密钥抹掉');
});

test('快照：重复 / 乱序事件丢弃，未知任务的事件丢弃，完成计数与上限', () => {
  const st = createState();
  const bus = new LegionBus();
  const evs = [];
  bus.on('event', (e) => evs.push(e));
  bus.publish('legions:changed', { legions: LEGIONS.map(publicLegion) });
  bus.publish('node:done', { taskId: 'ghost', stepId: 's1' });
  bus.publish('task:received', { taskId: 't1', taskNo: 1, title: '审合同', source: 'boss' });
  bus.publish('task:triaged', { taskId: 't1', taskNo: 1, legions: ['legion-legal'], mode: 'single', reason: 'x', via: 'rules' });
  bus.publish('task:planned', { taskId: 't1', taskNo: 1, steps: [{ id: 's1', legionId: 'legion-legal', goal: '审', dependsOn: [] }], summary: false });
  bus.publish('node:dispatched', { taskId: 't1', taskNo: 1, stepId: 's1', machineName: '员工机 A' });
  for (const e of evs) applyEvent(st, e);
  assert.equal(applyEvent(st, evs[3]), false, '重复事件丢弃');
  let s = snapshot(st);
  assert.equal(s.legionLoad['legion-legal'].active, 1);
  assert.equal(s.tasks[0].steps[0].machine, '员工机 A');
  const done = bus.publish('task:done', { taskId: 't1', taskNo: 1, ok: true, summary: '好了' });
  applyEvent(st, done);
  s = snapshot(st);
  assert.equal(s.counters.doneToday, 1);
  assert.equal(s.tasks[0].steps[0].status, 'done');
  for (let i = 2; i < 40; i++) {
    applyEvent(st, bus.publish('task:received', { taskId: `t${i}`, taskNo: i, title: 'x' }));
    applyEvent(st, bus.publish('task:done', { taskId: `t${i}`, taskNo: i, ok: true }));
  }
  assert.ok(snapshot(st).tasks.length <= 20, '已结束任务最多 20 个');
  assert.ok(snapshot(st).feed.length <= 50, '动态最多 50 条');
});

test('公司档案：本地 > 宿主 > 默认；演示模式；显示名推导；身份句', () => {
  assert.equal(resolveProfile({}, []).from, 'default');
  const h = resolveProfile({}, [{ name: '泰途科技有限公司' }]);
  assert.equal(h.from, 'host');
  assert.equal(h.short, '泰途科技');
  assert.equal(h.logo, '泰');
  const l = resolveProfile({ name: '甲乙丙股份有限公司', boss: '张总' }, [{ name: '泰途科技有限公司' }]);
  assert.equal(l.from, 'local');
  assert.equal(l.short, '甲乙丙');
  assert.equal(resolveProfile({ name: 'x'.repeat(100) }).name.length, 40, '字段截断');
  assert.equal(displayProfile(l, true).short, '示例科技');
  assert.match(identityLine(l, LEGIONS[1]), /甲乙丙股份有限公司.*法务部/);
});

test('默认公司 = 北京泰途科技有限公司 + App logo；换了公司名且没给标志图时不挂泰途 logo', () => {
  const logo = 'data:image/png;base64,AAAA';
  const d = resolveProfile({}, [], { defaultLogoImage: logo });
  assert.equal(d.name, '北京泰途科技有限公司');
  assert.equal(d.short, '泰途科技');
  assert.equal(d.logoImage, logo);
  assert.equal(resolveProfile({ boss: '张总' }, [], { defaultLogoImage: logo }).logoImage, logo, '只改老板称呼仍是泰途');
  assert.equal(resolveProfile({ name: '别的公司有限公司' }, [], { defaultLogoImage: logo }).logoImage, undefined);
  assert.equal(resolveProfile({ name: '别的公司有限公司', logoImage: 'data:image/png;base64,BBBB' }, [], { defaultLogoImage: logo }).logoImage, 'data:image/png;base64,BBBB');
  assert.ok(readFileSync(join(DIR, 'resources', 'company-logo.png')).length > 1000, '包内带 App logo');
});

// ── 执行（R3–R9）：假集群 + 假模型 ──
function fakeCluster({ nodes, failNode = null, delay = 20, workbench = null } = {}) {
  const proc = new EventEmitter();
  const caps = new Map(nodes.map((n) => [n.nodeId, []]));
  const calls = [];
  proc.getSelf = () => ({ nodeId: 'master', deploymentRole: 'orchestrator', status: 'running', lanInterfaces: ['192.168.3.60'] });
  proc.getOnlineNodes = () => nodes.map((n) => ({ ...n, status: 'online', roles: [] }));
  proc.dispatchTask = async (d) => {
    calls.push(d);
    if (d.roleId === 'config.get') return { status: 'success', output: { capabilities: caps.get(d.targetNodeId), model: 'm/x' } };
    if (d.roleId === 'config.set') {
      caps.set(d.targetNodeId, d.payload.capabilities);
      return { status: 'success', output: {} };
    }
    if (d.roleId === 'status.report') return { status: 'success', output: { busyAgents: 0, ...(workbench ? { workbench: workbench[d.targetNodeId] } : {}) } };
    if (d.roleId === 'cluster.cancel') return { status: 'success', output: {} };
    if (d.roleId === 'worker.run') {
      if (d.targetNodeId === failNode) throw new Error('目标节点不可用');
      await tick(delay);
      return { status: 'success', output: { text: `${d.targetNodeId} 完成：${d.payload.legionHq.goal}\n价格 199 元` } };
    }
    return { status: 'failed', error: 'unknown' };
  };
  return { proc, calls, caps };
}

function makeRunner({ cluster, llm, placement = { local: [] } } = {}) {
  let place = placement;
  const bus = new LegionBus();
  const state = createState();
  bus.on('event', (e) => applyEvent(state, e));
  const fleet = new Fleet({ proc: () => cluster?.proc || null, readPlacement: () => place, writePlacement: (p) => (place = p), installedIds: () => LEGIONS.map((L) => L.id) });
  const saved = [];
  const runner = new TaskRunner({
    bus,
    legions: () => LEGIONS,
    fleet,
    llm: llm || (async (p) => `本机：${p.slice(0, 10)}`),
    company: () => resolveProfile({ name: '示例科技有限公司' }),
    settings: () => ({ useModelTriage: false }),
    saveTask: (r) => saved.push(r),
  });
  return { bus, state, fleet, runner, saved };
}

test('派活：部门装到员工机（config.set 往返）→ 按负载派 worker.run，跨部门交接带上游产物，汇总后办完', async () => {
  const cluster = fakeCluster({ nodes: [{ nodeId: 'A', host: '192.168.3.61' }, { nodeId: 'B', host: '192.168.3.62' }] });
  const { fleet, runner, state } = makeRunner({ cluster, placement: { local: ['legion-admin'] } });
  await fleet.refresh();
  await fleet.assign('legion-finance', 'A', true);
  await fleet.assign('legion-sales', 'B', true);
  assert.deepEqual(cluster.caps.get('A'), ['legion:legion-finance']);
  const ms = fleet.machines();
  assert.equal(ms.find((m) => m.id === 'A').name, '员工机 A');
  assert.equal(ms.find((m) => m.id === 'A').load.busy, 0, '读到员工机 status.report');

  const { taskId } = runner.submit({ text: '给客户出报价单', forcedLegions: ['legion-sales'] });
  const rec = await until(() => ['done', 'awaiting', 'failed'].includes(runner.get(taskId).status) && runner.get(taskId));
  assert.equal(rec.status, 'awaiting', '报价折扣进老板待办');
  assert.deepEqual(rec.plan.steps.map((s) => s.legionId), ['legion-finance', 'legion-sales']);
  const runs = cluster.calls.filter((c) => c.roleId === 'worker.run');
  assert.deepEqual(runs.map((c) => c.targetNodeId), ['A', 'B']);
  assert.match(runs[1].payload.prompt, /财务部的产出/, '下游提示词带上游产物');
  assert.match(runs[1].payload.prompt, /价格 199 元/);
  assert.equal(Object.keys(runs[0].payload)[0], 'legionHq', 'legionHq 放在 payload 最前（入站历史只截前 300 字）');
  const snap = snapshot(state);
  assert.ok(snap.tasks[0].handoffs.some((x) => x.from === 'legion-finance' && x.to === 'legion-sales'));
  assert.equal(snap.inbox.length, 1);
  runner.confirm(taskId);
  assert.equal(runner.get(taskId).status, 'done');
  assert.equal(snapshot(state).counters.doneToday, 1);
});

test('派活：开跑前机器不可用 → 换机；没有机器承载 → 步骤失败给出原因', async () => {
  const cluster = fakeCluster({ nodes: [{ nodeId: 'A', host: '10.0.0.2' }, { nodeId: 'B', host: '10.0.0.3' }], failNode: 'A' });
  const { fleet, runner } = makeRunner({ cluster });
  await fleet.refresh();
  await fleet.assign('legion-legal', 'A', true);
  await fleet.assign('legion-legal', 'B', true);
  const a = runner.submit({ text: '审一下这份合同', forcedLegions: ['legion-legal'] });
  const ra = await until(() => runner.get(a.taskId).status !== 'running' && runner.get(a.taskId).status !== 'triaging' && runner.get(a.taskId));
  assert.equal(ra.outputs.s1.machine, '员工机 B');

  const b = runner.submit({ text: '招个人', forcedLegions: ['legion-hr'] });
  const rb = await until(() => runner.get(b.taskId).status === 'failed' && runner.get(b.taskId));
  assert.match(rb.error, /没有在线机器承载人事部/);
});

test('并发：三件事同时下（单部门 / 双部门 / 全公司），互不阻塞，各自回到各自任务', async () => {
  const { runner } = makeRunner({ llm: async (p) => { await tick(15); return `ok ${p.length}`; } }); // 单机：全部本机
  const ids = [
    runner.submit({ text: '审合同', forcedLegions: ['legion-legal'] }).taskId,
    runner.submit({ text: '出报价', forcedLegions: ['legion-finance', 'legion-sales'] }).taskId,
    runner.submit({ text: '下季度新品上市，全公司全面准备' }).taskId,
  ];
  const t0 = Date.now();
  await until(() => ids.every((id) => ['done', 'awaiting', 'failed'].includes(runner.get(id).status)), 5000);
  assert.ok(Date.now() - t0 < 2000);
  assert.equal(runner.get(ids[2]).plan.steps.length, 8);
  assert.equal(runner.get(ids[2]).status, 'awaiting');
  assert.ok(ids.every((id) => runner.get(id).status !== 'failed'));
});

test('老板驳回：带意见重做汇总后再交确认；中止：发 task:done cancelled', async () => {
  const prompts = [];
  const { runner } = makeRunner({ llm: async (p) => { prompts.push(p); return 'ok'; } });
  const { taskId } = runner.submit({ text: '下季度新品上市，全公司全面准备' });
  await until(() => runner.get(taskId).status === 'awaiting');
  runner.reject(taskId, '预算压到 50 万以内');
  await until(() => runner.get(taskId).status === 'awaiting' && runner.get(taskId).rejects === 1);
  assert.match(prompts[prompts.length - 1], /预算压到 50 万以内/);
  runner.cancel(taskId);
  assert.equal(runner.get(taskId).status, 'cancelled');
});

test('例行事务：到点只触发一次；每周 / 每月最后一天 / 季度', () => {
  const fired = [];
  let store = { enabled: { 'daily-report': true, 'month-close': true } };
  const at = (s) => () => new Date(s);
  const sch = new RoutineScheduler({ read: () => store, write: (s) => (store = s), fire: (r) => fired.push(r.id), now: at('2026-10-22T08:30:10') });
  assert.deepEqual(sch.tick(), ['daily-report']);
  assert.deepEqual(sch.tick(), [], '同一天不重复');
  assert.equal(dueKey({ kind: 'monthly', day: 'last', time: '16:00' }, new Date('2026-10-31T16:00:00')), '2026-10-31');
  assert.equal(dueKey({ kind: 'monthly', day: 'last', time: '16:00' }, new Date('2026-10-30T16:00:00')), null);
  assert.equal(dueKey({ kind: 'weekly', weekday: 4, time: '09:00' }, new Date('2026-10-22T09:00:00')), '2026-10-22'); // 周四
  assert.equal(dueKey({ kind: 'monthly', day: 'last', time: '15:00', months: [3, 6, 9, 12] }, new Date('2026-10-31T15:00:00')), null);
  assert.equal(LIBRARY.length, 9);
});

test('内置剧本合法，部门 id 都存在', () => {
  const scripts = loadScripts(join(DIR, 'resources', 'scripts'));
  assert.equal(scripts.length, 4);
  const ids = new Set(LEGIONS.map((L) => L.id));
  for (const s of scripts) for (const it of s.items) for (const l of it.legions || []) assert.ok(ids.has(l), `${s.id}: ${l}`);
  assert.throws(() => validateScript({ id: 'x1', name: 'x', items: [{ at: 5, text: 'a' }, { at: 1, text: 'b' }] }), /升序/);
});

test('录制：按行写 JSONL、列出与读回', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lhq-rec-'));
  const bus = new LegionBus();
  bus.recorder = new Recorder(dir);
  bus.publish('task:received', { taskId: 't1', title: 'a' });
  bus.publish('task:done', { taskId: 't1', ok: true });
  const [f] = bus.recorder.list();
  assert.equal(f.events, 2);
  assert.deepEqual(bus.recorder.read(f.name).map((e) => e.type), ['task:received', 'task:done']);
  assert.throws(() => bus.recorder.read('../x.jsonl'));
});

test('大屏服务：无口令 401、快照、SSE 推送、下令、换口令', async () => {
  const bus = new LegionBus();
  const state = createState();
  bus.on('event', (e) => applyEvent(state, e));
  const cmds = [];
  const srv = new ScreenServer({
    bus,
    getState: () => snapshot(state),
    pages: () => ({ page: '<html>screen</html>', remote: '<html>remote</html>' }),
    onCommand: (b) => {
      cmds.push(b.text);
      return { taskId: 't9', no: 9 };
    },
    onConfirm: () => ({ ok: true }),
    onCompany: () => ({}),
  });
  const st = await srv.start({ port: 18240, host: '127.0.0.1' });
  try {
    const base = `http://127.0.0.1:${st.port}`;
    assert.equal((await fetch(`${base}/api/state`)).status, 401);
    assert.equal((await fetch(`${base}/?t=wrong`)).status, 401);
    assert.equal((await fetch(`${base}/?t=${st.token}`)).status, 200);
    const s = await (await fetch(`${base}/api/state?t=${st.token}`)).json();
    assert.deepEqual(s.tasks, []);
    const r = await fetch(`${base}/api/command?t=${st.token}`, { method: 'POST', body: JSON.stringify({ text: '审合同' }) });
    assert.deepEqual(await r.json(), { taskId: 't9', no: 9 });
    assert.deepEqual(cmds, ['审合同']);
    // SSE
    const ac = new AbortController();
    const res = await fetch(`${base}/api/events?t=${st.token}`, { signal: ac.signal });
    const reader = res.body.getReader();
    let text = '';
    const read = async (re) => {
      while (!re.test(text)) text += new TextDecoder().decode((await reader.read()).value);
    };
    await read(/event: state/);
    await until(() => srv.status().viewers === 1);
    bus.publish('task:received', { taskId: 't1', taskNo: 1, title: '新任务' });
    await read(/event: ev[\s\S]*task:received/);
    ac.abort();
    await until(() => srv.status().viewers === 0);
    const old = st.token;
    srv.rotateToken();
    assert.equal((await fetch(`${base}/api/state?t=${old}`)).status, 401);
  } finally {
    await srv.stop();
  }
  assert.equal(srv.status().running, false);
});

test('大屏服务：端口被占顺延', async () => {
  const mk = () => new ScreenServer({ bus: new LegionBus(), getState: () => ({}), pages: () => ({ page: '', remote: '' }), onCommand() {}, onConfirm() {}, onCompany() {} });
  const a = mk();
  const b = mk();
  const sa = await a.start({ port: 18260, host: '127.0.0.1' });
  const sb = await b.start({ port: 18260, host: '127.0.0.1' });
  assert.equal(sb.port, sa.port + 1);
  await a.stop();
  await b.stop();
});

test('子机视角：订阅入站任务，按 legionHq 显示部门与目标；控制面消息不进列表', () => {
  const proc = new EventEmitter();
  const dir = mkdtempSync(join(tmpdir(), 'lhq-emp-'));
  writeFileSync(join(dir, 'employee-profile.json'), JSON.stringify({ capabilities: ['frontend', 'legion:legion-legal', 'legion:legion-finance'] }));
  const changes = [];
  const w = new EmployeeWatch({ proc: () => proc, profilePath: () => join(dir, 'employee-profile.json'), onChange: (s) => changes.push(s) });
  w.start();
  proc.emit('task:received', { taskId: 'x1', roleId: 'status.report', payload: {} });
  proc.emit('task:received', { taskId: 'x2', roleId: 'worker.run', payload: { legionHq: { taskNo: 3, title: '审合同', legionId: 'legion-legal', legionName: '法务部', goal: '逐条审查', company: '示例科技' }, prompt: '...' } });
  let s = w.snapshot();
  assert.deepEqual(s.hosted, ['legion-legal', 'legion-finance']);
  assert.equal(s.running.length, 1);
  assert.equal(s.running[0].goal, '逐条审查');
  assert.equal(s.company, '示例科技');
  proc.emit('task:result', { taskId: 'x2', status: 'success', durationMs: 1200 });
  s = w.snapshot();
  assert.equal(s.running.length, 0);
  assert.equal(s.recent[0].status, 'done');
  w.stop();
  assert.equal(proc.listenerCount('task:received'), 0);
});

test('activate：用假 ctx 跑通入口（无宿主 deps = 单机、无模型）', async () => {
  const dataRoot = mkdtempSync(join(tmpdir(), 'lhq-data-'));
  const handlers = new Map();
  const emitted = [];
  const ctx = {
    id: 'workbench-legion-hq',
    version: '1.0.0',
    appVersion: '2.0.5',
    log: { info() {}, warn() {} },
    dataPath: (rel) => join(dataRoot, rel),
    readJson: (rel, fb) => {
      try {
        return JSON.parse(readFileSync(join(dataRoot, rel), 'utf8'));
      } catch {
        return fb;
      }
    },
    writeJson: (rel, v) => {
      mkdirSync(join(dataRoot, rel, '..'), { recursive: true });
      writeFileSync(join(dataRoot, rel), JSON.stringify(v));
    },
    packagePath: (rel) => join(DIR, rel),
    handle: (a, fn) => handlers.set(a, fn),
    emit: (e, p) => emitted.push([e, p]),
  };
  const mod = require('./index.cjs');
  await mod.activate(ctx);
  try {
    const info = await handlers.get('info')();
    assert.equal(info.mode, 'standalone');
    assert.equal(info.legions.length, 8);
    assert.equal(info.hasModel, false);
    await handlers.get('company.save')({ name: '甲乙丙有限公司', boss: '李总' });
    assert.equal((await handlers.get('company.get')()).display.short, '甲乙丙');
    const { taskId } = await handlers.get('command')({ text: '审一下这份合同' });
    await until(() => handlers.get('tasks.get')({ taskId }).status === 'failed');
    assert.match(handlers.get('tasks.get')({ taskId }).error, /模型不可用/, '没有模型时如实失败，不编造结果');
    const scr = await handlers.get('screen.start')({ port: 18280 });
    assert.ok(scr.running);
    const page = await fetch(`http://127.0.0.1:${scr.port}/?t=${scr.token}`);
    assert.match(await page.text(), /AI 公司运营中心/);
    assert.ok((await handlers.get('coverage')()).items.length === 39);
    assert.ok(emitted.some(([e]) => e === 'event'));
  } finally {
    await mod.deactivate();
  }
});

// ── 2026-10-22 第二轮：二维码 / 资料包 / 来信 / 调优表 / 成本看板 / 考卷 / 员工机进度 ──
const { encode, toSvg } = require('./qr.cjs');
const X = require('./extras.cjs');

test('二维码：与 npm qrcode 逐模块一致（qiye-app 在旁边时比对），版本随长度增长，SVG 可生成', () => {
  const urls = ['http://192.168.3.60:8240/?t=0a49464813b06a292093427f', 'http://10.0.0.8:8241/remote?t=' + 'f'.repeat(24), '中文 http://x.cn', 'z'.repeat(190)];
  for (const u of urls) {
    const q = encode(u);
    assert.equal(q.size, q.version * 4 + 17);
    assert.ok(q.version >= 1 && q.version <= 10);
  }
  assert.ok(encode('a').version < encode('a'.repeat(150)).version);
  assert.match(toSvg(urls[0]), /^<svg [^>]*viewBox="0 0 \d+ \d+"/);
  assert.throws(() => encode('x'.repeat(400)), /太长/);
  let QR = null;
  try {
    QR = createRequire(join(SOLUTIONS_DIR, '..', '..', 'totalclaw-qiye-app', 'package.json'))('qrcode');
  } catch {
    QR = null; // 方案仓库单独克隆时没有参照库，跳过比对
  }
  if (!QR) return;
  for (const u of urls) {
    for (let mask = 0; mask < 8; mask++) {
      const m = encode(u, { mask });
      const r = QR.create([{ data: u, mode: 'byte' }], { errorCorrectionLevel: 'M', maskPattern: mask, version: m.version });
      const { size, data } = r.modules;
      let diff = 0;
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) if (!!data[i * size + j] !== m.modules[i][j]) diff++;
      assert.equal(diff, 0, `${u.slice(0, 20)} mask ${mask}`);
    }
    assert.equal(encode(u).mask, QR.create([{ data: u, mode: 'byte' }], { errorCorrectionLevel: 'M', version: encode(u).version }).maskPattern, '自动选的掩码一致');
  }
});

test('演示资料包：读全部 md、截断在上限内', () => {
  const t = X.loadDemoPack(join(DIR, 'resources', 'demo-pack'));
  assert.match(t, /示例科技/);
  assert.match(t, /186 元/);
  assert.ok(t.length <= 3300);
  assert.equal(X.loadDemoPack('/nonexistent'), '');
});

test('来信：.eml（base64 / quoted-printable / multipart / RFC2047 主题）与 .txt 解析；文件夹按名称 + 修改时间去重', () => {
  const b64 = Buffer.from('您好，请报 500 台 X1 的价格。', 'utf8').toString('base64');
  const eml1 = `From: =?UTF-8?B?${Buffer.from('华东经销商', 'utf8').toString('base64')}?= <a@b.com>\r\nSubject: =?UTF-8?B?${Buffer.from('询价：X1', 'utf8').toString('base64')}?=\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64}\r\n`;
  const m1 = X.parseMailFile(eml1, 'a.eml');
  assert.equal(m1.subject, '询价：X1');
  assert.match(m1.from, /华东经销商/);
  assert.match(m1.body, /500 台 X1/);
  const eml2 = 'Subject: invoice\r\nContent-Type: multipart/alternative; boundary="BB"\r\n\r\n--BB\r\nContent-Type: text/html\r\n\r\n<p>x</p>\r\n--BB\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n=E5=8F=91=E7=A5=A8=E5=82=AC=E5=BC=80\r\n--BB--\r\n';
  assert.equal(X.parseMailFile(eml2, 'b.eml').body, '发票催开');
  assert.equal(X.parseMailFile('# 简历投递\n\n应聘区域销售', 'c.md').subject, '简历投递');
  const dir = mkdtempSync(join(tmpdir(), 'lhq-mail-'));
  writeFileSync(join(dir, 'a.eml'), eml1);
  writeFileSync(join(dir, 'skip.pdf'), 'x');
  const seen = new Set();
  const first = X.scanMailFolder(dir, seen);
  assert.equal(first.length, 1);
  seen.add(first[0].key);
  assert.equal(X.scanMailFolder(dir, seen).length, 0, '同一文件不重复');
  const task = X.mailToTask(m1);
  assert.equal(task.source, 'mail');
  assert.match(task.title, /^来信/);
});

test('调优表 / 成本看板 / 考卷汇总', () => {
  const now = Date.now();
  const tasks = [
    { no: 1, title: 'a', createdAt: now - 5000, finishedAt: now, plan: { steps: [{ id: 's1', legionId: 'legion-legal', goal: '审' }, { id: 's2', legionId: 'legion-finance', goal: '算' }] }, outputs: { s1: { text: 'x'.repeat(100), machine: 'A', ms: 3000 }, s2: { error: 'boom', machine: 'B' } } },
    { no: 2, title: 'b', createdAt: now - 99_999_999, finishedAt: now - 99_999_000, plan: { steps: [] }, outputs: {} },
  ];
  const r = X.tuningRows(tasks, now - 10_000);
  assert.equal(r.rows.length, 2);
  assert.equal(r.tasks, 1);
  assert.equal(r.slowest[0].ms, 3000);
  const c = X.costBoard(tasks, LEGIONS, { tokensPerChar: 2, yuanPer1kTokens: 1, minutesPerStep: 60, hourlyWage: 100 });
  const legal = c.rows.find((x) => x.legionId === 'legion-legal');
  assert.deepEqual([legal.steps, legal.tokens, legal.modelCost, legal.laborCost], [1, 200, 0.2, 100]);
  assert.equal(c.rows.find((x) => x.legionId === 'legion-finance').steps, 0, '失败的步骤不计');
  assert.match(c.note, /估算/);
  const exam = JSON.parse(readFileSync(join(DIR, 'resources', 'opc-exam.json'), 'utf8'));
  const coverage = JSON.parse(readFileSync(join(DIR, 'resources', 'coverage.json'), 'utf8'));
  assert.equal(exam.items.length, 39);
  assert.deepEqual(new Set(exam.items.map((q) => q.coverageId)).size, 39, '一题对应能力地图一项');
  for (const q of exam.items) assert.ok(q.checks.length >= 3 && q.checks.length <= 6, q.id);
  const rep = X.examReport(exam, { q01: { verdict: 'pass', checks: [true, true, true] }, q02: { verdict: 'partial' }, q03: { verdict: 'fail' } }, coverage);
  assert.deepEqual([rep.answered, rep.count.pass, rep.count.partial, rep.count.fail, rep.count.todo], [3, 1, 1, 1, 36]);
  assert.match(rep.markdown, /未全部作答，结论不成立/);
  assert.deepEqual(rep.gaps.map((g) => g.id), ['q03', 'q02'], '不通过排在部分通过前面');
  assert.match(rep.markdown, /缺口排序[\s\S]*已知缺口（考卷外）：客户跟进/);
});

test('机器列表只算员工机（另一台主控不承载部门）；员工机回传的执行阶段转成步骤进度', async () => {
  const cluster = fakeCluster({ nodes: [{ nodeId: 'A', host: '10.0.0.2' }, { nodeId: 'boss2', host: '10.0.0.3' }], delay: 80 });
  const realNodes = cluster.proc.getOnlineNodes;
  cluster.proc.getOnlineNodes = () => realNodes().map((n) => (n.nodeId === 'boss2' ? { ...n, roles: ['orchestrator'] } : { ...n, roles: ['employee'] }));
  const { fleet, runner, state } = makeRunner({ cluster });
  await fleet.refresh();
  assert.deepEqual(fleet.machines().filter((m) => !m.local).map((m) => m.id), ['A']);
  await fleet.assign('legion-legal', 'A', true);
  // 不用「审合同」：它命中合同审查工作流，最后进老板待办，不会自己办完
  const { taskId } = runner.submit({ text: '看看这条保密条款', forcedLegions: ['legion-legal'] });
  const dispatchId = await until(() => [...runner.dispatches.keys()][0]);
  assert.equal(runner.onRemoteProgress(dispatchId, '调用工具：读文件'), true);
  assert.equal(runner.onRemoteProgress('nope', 'x'), false, '不是本中心派出去的不认');
  const t = snapshot(state).tasks.find((x) => x.id === taskId);
  assert.equal(t.steps[0].phase, '调用工具：读文件');
  await until(() => runner.get(taskId).status === 'done');
  assert.equal(runner.dispatches.size, 0, '派发结束后映射清掉');
});

test('activate：资料包进提示词、来信文件夹、导出 Word、考卷、成本看板、调优表', async () => {
  const dataRoot = mkdtempSync(join(tmpdir(), 'lhq-data2-'));
  const handlers = new Map();
  const ctx = {
    id: 'workbench-legion-hq', version: '1.0.0', appVersion: '2.0.5', log: { info() {}, warn() {} },
    dataPath: (rel) => join(dataRoot, rel),
    readJson: (rel, fb) => { try { return JSON.parse(readFileSync(join(dataRoot, rel), 'utf8')); } catch { return fb; } },
    writeJson: (rel, v) => { mkdirSync(join(dataRoot, rel, '..'), { recursive: true }); writeFileSync(join(dataRoot, rel), JSON.stringify(v)); },
    packagePath: (rel) => join(DIR, rel), handle: (a, fn) => handlers.set(a, fn), emit: () => {},
  };
  const mod = require('./index.cjs');
  await mod.activate(ctx);
  try {
    await handlers.get('settings.save')({ demoPack: true });
    const mailDir = mkdtempSync(join(tmpdir(), 'lhq-inbox-'));
    writeFileSync(join(mailDir, '询价.txt'), '询价\n请报 500 台 X1');
    ctx.writeJson('legion-hq/settings.json', { ...ctx.readJson('legion-hq/settings.json', {}), mailFolder: mailDir });
    const made = handlers.get('mail.scanNow')().made;
    assert.equal(made.length, 1);
    assert.equal(handlers.get('mail.scanNow')().made.length, 0);
    const rec = await until(() => { const r = handlers.get('tasks.get')({ taskId: made[0].taskId }); return r && ['failed', 'done'].includes(r.status) && r; });
    assert.equal(rec.source, 'mail');
    const ex = await handlers.get('tasks.export')({ taskId: rec.id });
    assert.ok(readFileSync(ex.path).length > 500);
    const run = handlers.get('exam.run')({ id: 'q10' });
    assert.ok(run.taskId);
    handlers.get('exam.score')({ id: 'q10', verdict: 'partial', checks: [true, false, true], note: '底价对' });
    const rep = handlers.get('exam.report')();
    assert.equal(rep.count.partial, 1);
    assert.ok((await handlers.get('exam.export')()).path.endsWith('opc-coverage-report.md'));
    assert.ok(handlers.get('cost.board')().rows.length === 8);
    assert.ok(Array.isArray(handlers.get('director.report')({ since: 1 }).rows));
  } finally {
    await mod.deactivate();
  }
});

test('打开「同时发到老板 IM」：拍板 / 例行办完经宿主 pushToImOwner 发给机主，带公司简称', async () => {
  const sent = [];
  const Module = createRequire(import.meta.url)('node:module');
  const origLoad = Module._load;
  Module._load = function (req, ...rest) {
    if (req === 'host:apps/desktop-shell/src/main/services/imRunLink.ts') return { pushToImOwner: async (text) => (sent.push(text), true) };
    if (req === 'host:apps/desktop-shell/src/main/services/workbenchLlm.ts') return { createWorkbenchLlm: () => ({ llm: async () => ({ text: '已审：第 5 条违约金偏高，建议调整为 10%。' }) }) };
    return origLoad.call(this, req, ...rest);
  };
  const dataRoot = mkdtempSync(join(tmpdir(), 'lhq-im-'));
  const handlers = new Map();
  const ctx = {
    id: 'workbench-legion-hq', version: '1.0.0', appVersion: '2.0.5', log: { info() {}, warn() {} },
    dataPath: (rel) => join(dataRoot, rel),
    readJson: (rel, fb) => { try { return JSON.parse(readFileSync(join(dataRoot, rel), 'utf8')); } catch { return fb; } },
    writeJson: (rel, v) => { mkdirSync(join(dataRoot, rel, '..'), { recursive: true }); writeFileSync(join(dataRoot, rel), JSON.stringify(v)); },
    packagePath: (rel) => join(DIR, rel), handle: (a, fn) => handlers.set(a, fn), emit: () => {},
  };
  const path = require.resolve('./index.cjs');
  delete require.cache[path];
  const mod = require('./index.cjs');
  try {
    ctx.host = { deps: {} };
    await mod.activate(ctx);
    assert.equal(handlers.get('info')().settings.imPushAvailable, true);
    await handlers.get('settings.save')({ imPush: true, notify: false });
    const rid = handlers.get('routines.list')()[0].id;
    await handlers.get('routines.runNow')({ id: rid });
    await until(() => sent.length > 0, 20000);
    assert.match(sent[0], /^【泰途科技】例行事务完成：/);
  } finally {
    await mod.deactivate();
    Module._load = origLoad;
    delete require.cache[path];
  }
});

test('L12 部门专用模型 / key：只随派往员工机的那一步走，放在 payload 最后；本机步骤只换模型', async () => {
  const cluster = fakeCluster({ nodes: [{ nodeId: 'A', host: '10.0.0.2' }] });
  const { fleet, runner } = makeRunner({ cluster });
  const llmCalls = [];
  runner.llm = async (p, o) => (llmCalls.push(o), '本机产出');
  runner.legionKeys = (id) => ({ 'legion-legal': { provider: 'deepseek', apiKey: 'sk-legal', model: 'deepseek/deepseek-chat' }, 'legion-finance': { provider: 'deepseek', apiKey: 'sk-fin', model: 'm-fin' } })[id] || null;
  await fleet.refresh();
  await fleet.assign('legion-legal', 'A', true);
  await fleet.assign('legion-finance', 'local', true);
  const a = runner.submit({ text: '看看保密条款', forcedLegions: ['legion-legal'] });
  await until(() => runner.get(a.taskId).status === 'done');
  const w = cluster.calls.find((c) => c.roleId === 'worker.run');
  assert.deepEqual(w.payload.credential, { provider: 'deepseek', apiKey: 'sk-legal' });
  assert.equal(w.payload.model, 'deepseek/deepseek-chat');
  assert.equal(Object.keys(w.payload).pop(), 'credential', '放最后，入站预览截前 300 字截不到');
  const b = runner.submit({ text: '算一下成本', forcedLegions: ['legion-finance'] });
  await until(() => ['done', 'awaiting'].includes(runner.get(b.taskId).status));
  assert.equal(llmCalls[0].model, 'm-fin');
  assert.equal(llmCalls[0].credential, undefined, '主控本机步骤不带专用 key');
});

test('L12 legionKeys.set / list：界面只拿打码后的 key；不改 key 时保留原 key；全空即删除', async () => {
  const dataRoot = mkdtempSync(join(tmpdir(), 'lhq-keys-'));
  const handlers = new Map();
  const ctx = {
    id: 'workbench-legion-hq', version: '1.0.0', appVersion: '2.0.5', log: { info() {}, warn() {} },
    dataPath: (rel) => join(dataRoot, rel),
    readJson: (rel, fb) => { try { return JSON.parse(readFileSync(join(dataRoot, rel), 'utf8')); } catch { return fb; } },
    writeJson: (rel, v) => { mkdirSync(join(dataRoot, rel, '..'), { recursive: true }); writeFileSync(join(dataRoot, rel), JSON.stringify(v)); },
    packagePath: (rel) => join(DIR, rel), handle: (a, fn) => handlers.set(a, fn), emit: () => {},
  };
  const mod = require('./index.cjs');
  await mod.activate(ctx);
  try {
    handlers.get('legionKeys.set')({ legionId: 'legion-legal', provider: 'deepseek', apiKey: 'sk-abcdefgh1234', model: 'm' });
    let row = handlers.get('legionKeys.list')().find((k) => k.legionId === 'legion-legal');
    assert.equal(row.key, 'sk-…1234');
    assert.ok(!JSON.stringify(handlers.get('legionKeys.list')()).includes('abcdefgh'));
    handlers.get('legionKeys.set')({ legionId: 'legion-legal', provider: 'deepseek', model: 'm2' });
    assert.equal(ctx.readJson('legion-hq/legion-keys.json', {})['legion-legal'].apiKey, 'sk-abcdefgh1234');
    assert.throws(() => handlers.get('legionKeys.set')({ legionId: 'legion-legal', apiKey: 'x', provider: '' }), /服务商/);
    assert.throws(() => handlers.get('legionKeys.set')({ legionId: 'legion-legal', provider: 'p', baseUrl: 'ftp://x' }), /http/);
    handlers.get('legionKeys.set')({ legionId: 'legion-legal', provider: '', model: '', baseUrl: '', apiKey: '' });
    row = handlers.get('legionKeys.list')().find((k) => k.legionId === 'legion-legal');
    assert.equal(row.hasKey, false);
  } finally {
    await mod.deactivate();
  }
});

test('O6 公司邮箱来信：开关打开后，宿主收件箱新到的真实邮件成为来信任务；模拟数据 / 其它通道 / 重复不收；关掉不收', async () => {
  const { EventEmitter } = await import('node:events');
  const intake = new EventEmitter();
  const dataRoot = mkdtempSync(join(tmpdir(), 'lhq-mbox-'));
  const handlers = new Map();
  const ctx = {
    id: 'workbench-legion-hq', version: '1.0.0', appVersion: '2.0.5', log: { info() {}, warn() {} },
    host: { deps: { intakeService: intake, mailIntakeProc: { getStatus: () => ({ channel: 'email', state: 'ready', detail: '' }) } } },
    dataPath: (rel) => join(dataRoot, rel),
    readJson: (rel, fb) => { try { return JSON.parse(readFileSync(join(dataRoot, rel), 'utf8')); } catch { return fb; } },
    writeJson: (rel, v) => { mkdirSync(join(dataRoot, rel, '..'), { recursive: true }); writeFileSync(join(dataRoot, rel), JSON.stringify(v)); },
    packagePath: (rel) => join(DIR, rel), handle: (a, fn) => handlers.set(a, fn), emit: () => {},
  };
  const mod = require('./index.cjs');
  await mod.activate(ctx);
  try {
    const mail = { id: 'it-1', channel: 'email', simulated: false, from: { name: '华东经销商', address: 'a@b.com' }, subject: '询价 X1', body: '请报 500 台价格' };
    intake.emit('item-added', mail);
    assert.equal(handlers.get('tasks.list')().length, 0, '默认关');
    const s = handlers.get('info')().settings;
    assert.deepEqual([s.mailboxAvailable, s.mailboxStatus.state], [true, 'ready']);
    await handlers.get('settings.save')({ mailboxIntake: true });
    intake.emit('item-added', mail);
    intake.emit('item-added', mail);
    intake.emit('item-added', { ...mail, id: 'it-2', simulated: true });
    intake.emit('item-added', { ...mail, id: 'it-3', channel: 'whatsapp' });
    const list = await until(() => { const l = handlers.get('tasks.list')(); return l.length && l; });
    await tick(50);
    assert.equal(handlers.get('tasks.list')().length, 1);
    assert.equal(list[0].source, 'mail');
    assert.match(list[0].title, /华东经销商.*询价 X1/);
  } finally {
    await mod.deactivate();
  }
  assert.equal(intake.listenerCount('item-added'), 0, '停用时取消订阅');
});

test('LG7 / HR7 员工机回报的工作台细步骤进机器负载（字段清洗）', async () => {
  const cluster = fakeCluster({ nodes: [{ nodeId: 'A', host: '10.0.0.2' }], workbench: { A: [{ key: 'hr:j1:筛选', legionId: 'legion-hr', label: '筛选', done: 37, total: 100, ageMs: 5 }, { legionId: '' }, 'junk'] } });
  const { fleet } = makeRunner({ cluster });
  const ms = await fleet.refresh({ force: true });
  assert.deepEqual(ms.find((m) => m.id === 'A').load.workbench, [{ legionId: 'legion-hr', label: '筛选', done: 37, total: 100 }]);
});

test('L3 勾选承载后让员工机装部门方案包（后台进行）；状态回读；旧版员工机标「不支持」；可卸包', async () => {
  const cluster = fakeCluster({ nodes: [{ nodeId: 'A', host: '10.0.0.2' }, { nodeId: 'OLD', host: '10.0.0.3' }] });
  const installed = new Set();
  const orig = cluster.proc.dispatchTask;
  cluster.proc.dispatchTask = async (d) => {
    if (d.roleId === 'legion.install') {
      if (d.targetNodeId === 'OLD') return { status: 'failed', error: '未知 roleId: legion.install' };
      d.payload.ids.forEach((id) => installed.add(id));
      return { status: 'success', output: { items: d.payload.ids.map((id) => ({ id, ok: true, status: 'installed' })) } };
    }
    if (d.roleId === 'legion.uninstall') {
      d.payload.ids.forEach((id) => installed.delete(id));
      return { status: 'success', output: { items: d.payload.ids.map((id) => ({ id, ok: true })) } };
    }
    if (d.roleId === 'status.report') return { status: 'success', output: { busyAgents: 0, installedLegions: d.targetNodeId === 'A' ? [...installed] : undefined } };
    return orig(d);
  };
  const { fleet } = makeRunner({ cluster });
  await fleet.refresh();
  await fleet.assign('legion-legal', 'A', true);
  await fleet.assign('legion-legal', 'OLD', true);
  await until(() => fleet.machines().find((m) => m.id === 'A').packages['legion-legal'] === 'installed');
  await until(() => fleet.machines().find((m) => m.id === 'OLD').packages['legion-legal'] === 'unsupported');
  assert.ok(installed.has('legion-legal'));
  await fleet.assign('legion-legal', 'A', false);
  assert.ok(installed.has('legion-legal'), '撤出承载不卸包');
  const st = await fleet.installPackage('A', 'legion-legal', true);
  assert.equal(st.state, 'removed');
  assert.equal(fleet.machines().find((m) => m.id === 'A').packages['legion-legal'], 'removed');
});
