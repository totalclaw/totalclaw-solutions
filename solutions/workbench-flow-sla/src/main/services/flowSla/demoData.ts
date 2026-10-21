/**
 * 流程时效监控 · 示例数据。
 *
 * 按规则表里的流程名和节点名，造一套三个系统最近十周左右的报表和一份花名册，写成 Excel：
 *   OA、费控各两张（流程表 + 节点表），CSS 一张（一行一个节点、流程字段重复）。
 * 覆盖：办结超时、在途临期、在途已逾期、管理干部与非管理干部审核、金额高于和低于 10 万、
 * CSS 内外部节点、备用商 / 服务商两档时效、对不上规则的流程名、没登记内外部的节点、不在花名册里的审核人。
 * 三个系统的时间故意写成三种格式。人名、部门、文件名等素材在 columnKeywords.json 的 demo 段。
 * 随机数固定种子，同一时刻生成的数据相同。
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { FS_SYSTEMS } from '@totalclaw/ipc-contracts';
import { writeWorkbook } from '../serviceSettlement/excel';
import { DAY, type SlaRules } from './calc';
import KW from './columnKeywords.json';

const D = KW.demo;
const HOUR = 3_600_000;
type Cell = string | number | Date | null;

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number): string => String(n).padStart(2, '0');
const minute = (t: number): number => Math.round(t / 60000) * 60000;
const fmtDash = (t: number): string => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`; };
const fmtSlash = (t: number): string => { const d = new Date(t); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${pad(d.getMinutes())}`; };

export interface DemoFiles { dir: string; oaFlow: string; oaNode: string; fkFlow: string; fkNode: string; css: string; roster: string; flows: number; nodes: number }

interface Person { name: string; dept: string; manager: boolean }
interface GenNode { node: string; handler: string; start: number; end: number | null }
interface GenFlow { no: string; name: string; feeType: string; title: string; initiator: Person; amount: number; start: number; end: number | null; terminated: boolean; nodes: GenNode[] }

export function buildDemo(rules: SlaRules, now: number): { flows: Record<'oa' | 'fk' | 'css', GenFlow[]>; people: Person[] } {
  const rand = rng(20261013);
  const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)];
  const between = (a: number, b: number): number => a + rand() * (b - a);
  const depts = D.depts as string[];
  const staff: Person[] = (D.staff as string[]).map((name, i) => ({ name, dept: depts[i % depts.length], manager: false }));
  // 示例里的管理干部用虚构姓名（靠花名册的「身份」列标成管理干部），不拿规则表里真实的人名配上编出来的超时数据
  const managers: Person[] = (D.managers as string[]).map((name, i) => ({ name, dept: depts[i % depts.length], manager: true }));
  const people = [...managers, ...staff];
  const outsider: Person = { name: D.outsider as string, dept: '', manager: false };

  let seq = 0;
  const number = (prefix: string): string => { seq += 1; return `${prefix}${new Date(now).getFullYear()}${String(100000 + seq).slice(1)}`; };

  /** 按节点顺序走时间：超过「现在」的那个节点没有结束时间，后面的节点还没到 */
  const walk = (start: number, steps: Array<{ node: string; handler: Person; hours: number }>): { nodes: GenNode[]; end: number | null } => {
    const nodes: GenNode[] = [];
    let t = start;
    for (const s of steps) {
      const begin = minute(t);
      if (begin >= now) return { nodes, end: null };
      const finish = minute(begin + s.hours * HOUR);
      if (finish >= now) { nodes.push({ node: s.node, handler: s.handler.name, start: begin, end: null }); return { nodes, end: null }; }
      nodes.push({ node: s.node, handler: s.handler.name, start: begin, end: finish });
      t = finish + between(0, 3) * HOUR;
    }
    return { nodes, end: nodes.length ? nodes[nodes.length - 1].end : null };
  };

  const reviewer = (): Person => {
    const r = rand();
    if (r < 0.04) return outsider;
    return r < 0.42 ? pick(managers) : pick(staff);
  };
  /** 节点处理时长（小时）：大多数当天到两天，少数拖很久 */
  const hours = (internal: boolean, slowChance: number): number => {
    if (!internal) return between(0.2, 30);
    const r = rand();
    if (r < slowChance) return between(80, 260);
    return r < 0.55 ? between(0.5, 20) : between(20, 60);
  };

  const oaNodesOf = (name: string): Array<[string, boolean]> => {
    const rows = rules.oaFkNodes.filter((r) => r[0] === name).map((r) => [r[1], r[2]] as [string, boolean]);
    // 起草 / 提交类的外部节点排最前面，其余按规则表顺序
    return [...rows.filter((r) => !r[1]).slice(0, 1), ...rows.filter((r) => r[1])].slice(0, 6);
  };
  const withNodes = (names: string[]): string[] => names.filter((n) => oaNodesOf(n).some((r) => r[1]));
  const e2eNames = (system: string): string[] => rules.e2e.filter((r) => !r.fallback && r.system.toUpperCase() === system.toUpperCase()).map((r) => r.flowType);

  const makeOaLike = (prefix: string, name: string, opts: { startDaysAgo: number; stuckAt?: number; slow?: number; amount?: number; title?: string; extraNode?: boolean; terminated?: boolean }): GenFlow => {
    const initiator = pick(staff);
    const start = minute(now - opts.startDaysAgo * DAY + between(1, 9) * HOUR);
    const defs = oaNodesOf(name);
    const steps = defs.map(([node, internal], i) => ({
      node, handler: internal ? reviewer() : initiator,
      hours: opts.stuckAt === i ? 24 * 400 : hours(internal, opts.slow ?? 0.1),
    }));
    if (opts.extraNode) steps.splice(Math.min(2, steps.length), 0, { node: D.newNode as string, handler: pick(staff), hours: between(2, 30) });
    const w = walk(start, steps);
    return { no: number(prefix), name, feeType: '', title: opts.title ?? `${name}-${initiator.name}`, initiator, amount: opts.amount ?? 0, start, end: opts.terminated ? null : w.end, terminated: !!opts.terminated, nodes: w.nodes };
  };

  // —— OA ——
  const oaRule = withNodes(e2eNames('OA'));
  const oaRegular = withNodes(D.regularOa as string[]);
  const variantRule = rules.e2e.find((r) => r.variants?.length && r.system.toUpperCase() === 'OA');
  const oa: GenFlow[] = [];
  for (let i = 0; i < 96; i += 1) {
    const regular = oaRegular.length > 0 && rand() < 0.22;
    const name = regular ? pick(oaRegular) : pick(oaRule);
    const title = variantRule && name === variantRule.flowType ? `${pick(D.variantTitles as string[])}-${pick(staff).name}` : undefined;
    oa.push(makeOaLike('OA', name, { startDaysAgo: between(2, 68), slow: 0.12, title, extraNode: rand() < 0.08, terminated: rand() < 0.02 }));
  }
  // 特意安排：在途已逾期、在途临期
  if (oaRule.length) {
    const shortest = [...oaRule].sort((a, b) => (rules.e2e.find((r) => r.flowType === a)?.limitDays ?? 999) - (rules.e2e.find((r) => r.flowType === b)?.limitDays ?? 999))[0];
    const limit = rules.e2e.find((r) => r.flowType === shortest)?.limitDays ?? 7;
    oa.push(makeOaLike('OA', shortest, { startDaysAgo: limit * 3, stuckAt: 2 }));
    oa.push(makeOaLike('OA', shortest, { startDaysAgo: limit * 2, stuckAt: 1 }));
    oa.push(makeOaLike('OA', shortest, { startDaysAgo: limit * 0.9, stuckAt: 1 }));
  }
  if (variantRule) {
    const titles = D.variantTitles as string[];
    oa.push(makeOaLike('OA', variantRule.flowType, { startDaysAgo: 20, stuckAt: 2, title: `${titles[0]}-${pick(staff).name}` }));
    oa.push(makeOaLike('OA', variantRule.flowType, { startDaysAgo: 20, stuckAt: 2, title: `${titles[1]}-${pick(staff).name}` }));
  }

  // —— 费控 ——
  const fkRule = withNodes(e2eNames(FS_SYSTEMS[1]));
  const fk: GenFlow[] = [];
  for (let i = 0; i < 104; i += 1) {
    const amount = rand() < 0.3 ? Math.round(between(100000, 480000)) : Math.round(between(300, 99000));
    fk.push(makeOaLike('FK', pick(fkRule), { startDaysAgo: between(2, 68), slow: 0.1, amount, extraNode: rand() < 0.05, terminated: rand() < 0.03 }));
  }
  if (fkRule.length) {
    const byLimit = [...fkRule].sort((a, b) => (rules.e2e.find((r) => r.flowType === a)?.limitDays ?? 999) - (rules.e2e.find((r) => r.flowType === b)?.limitDays ?? 999));
    const limit = rules.e2e.find((r) => r.flowType === byLimit[0])?.limitDays ?? 7;
    fk.push(makeOaLike('FK', byLimit[0], { startDaysAgo: limit * 2.5, stuckAt: 1, amount: 188000 }));
    fk.push(makeOaLike('FK', byLimit[0], { startDaysAgo: limit * 0.88, stuckAt: 1, amount: 5200 }));
    fk.push(makeOaLike('FK', byLimit[1] ?? byLimit[0], { startDaysAgo: 45, stuckAt: 2, amount: 260000 }));
  }

  // —— CSS ——
  const cssTypes = new Map<string, { flowType: string; feeType: string; nodes: Array<{ node: string; internal: boolean }> }>();
  for (const r of rules.cssNodes) {
    const k = `${r.flowType}|${r.feeType}`;
    const cur = cssTypes.get(k) ?? { flowType: r.flowType, feeType: r.feeType, nodes: [] };
    cur.nodes.push({ node: r.node, internal: r.internal });
    cssTypes.set(k, cur);
  }
  const cssList = [...cssTypes.values()];
  const makeCss = (type: { flowType: string; feeType: string; nodes: Array<{ node: string; internal: boolean }> }, opts: { startDaysAgo: number; stuckAt?: number; slow?: number }): GenFlow => {
    const initiator = pick(staff);
    const start = minute(now - opts.startDaysAgo * DAY + between(1, 9) * HOUR);
    const steps = type.nodes.slice(0, 9).map((n, i) => ({
      node: n.node, handler: n.internal ? reviewer() : initiator,
      hours: opts.stuckAt === i ? 24 * 400 : n.internal ? between(0.5, rand() < (opts.slow ?? 0.12) ? 110 : 30) : between(0.1, i === 0 ? 1 : 150),
    }));
    const w = walk(start, steps);
    return { no: number('CSS'), name: type.flowType, feeType: type.feeType, title: `${type.flowType}-${initiator.name}`, initiator, amount: 0, start, end: w.end, terminated: false, nodes: w.nodes };
  };
  const css: GenFlow[] = [];
  for (let i = 0; i < 84; i += 1) css.push(makeCss(pick(cssList), { startDaysAgo: between(2, 66) }));
  const firstInternal = (t: { nodes: Array<{ internal: boolean }> }): number => Math.max(0, t.nodes.findIndex((n) => n.internal));
  for (const t of cssList.slice(0, 3)) css.push(makeCss(t, { startDaysAgo: 30, stuckAt: firstInternal(t) }));
  for (let i = 0; i < 4; i += 1) {
    const initiator = pick(staff);
    const start = minute(now - between(4, 40) * DAY);
    const w = walk(start, [{ node: cssList[0]?.nodes[0]?.node ?? (D.newNode as string), handler: initiator, hours: 0.5 }, { node: D.newNode as string, handler: pick(staff), hours: between(4, 60) }]);
    css.push({ no: number('CSS'), name: D.unmatchedCss as string, feeType: '', title: `${D.unmatchedCss}-${initiator.name}`, initiator, amount: 0, start, end: w.end, terminated: false, nodes: w.nodes });
  }

  return { flows: { oa, fk, css }, people };
}

export function writeDemo(root: string, rules: SlaRules, now: number): DemoFiles {
  const dir = join(root, D.files.dir);
  mkdirSync(dir, { recursive: true });
  const { flows, people } = buildDemo(rules, now);
  const H = D.headers;
  const st = D.status;
  const current = (f: GenFlow): GenNode | undefined => [...f.nodes].reverse().find((n) => n.end === null);
  const file = (name: string): string => join(dir, `${name}.xlsx`);
  const mgrLabel = (KW.managerIdentity as string[])[0];
  const staffLabel = (KW.nonManagerIdentity as string[])[0];

  // OA：时间写成 2026-10-01 09:05:00，流程表表头上面多一行标题
  const oaFlow = file(D.files.oaFlow);
  writeWorkbook(oaFlow, [{
    name: 'Sheet1', headers: [H.titleRow], colWidths: [18, 26, 30, 10, 14, 10, 20, 20, 18, 12],
    rows: [H.oaFlow as Cell[], ...flows.oa.map((f): Cell[] => [f.no, f.name, f.title, f.initiator.name, f.initiator.dept, f.terminated ? st.OA[2] : f.end ? st.OA[0] : st.OA[1], fmtDash(f.start), f.end ? fmtDash(f.end) : '', current(f)?.node ?? '', current(f)?.handler ?? ''])],
  }]);
  const oaNode = file(D.files.oaNode);
  writeWorkbook(oaNode, [{ name: 'Sheet1', headers: H.oaNode, rows: flows.oa.flatMap((f) => f.nodes.map((n): Cell[] => [f.no, f.name, n.node, n.handler, fmtDash(n.start), n.end ? fmtDash(n.end) : ''])) }]);

  // 费控：时间写成 2026/10/1 9:05，状态看「当前处理人」
  const fkFlow = file(D.files.fkFlow);
  writeWorkbook(fkFlow, [{
    name: 'Sheet1', headers: H.fkFlow,
    rows: flows.fk.map((f): Cell[] => [f.no, f.name, f.title, f.initiator.name, f.initiator.dept, f.amount, fmtSlash(f.start), f.end ? fmtSlash(f.end) : '', current(f)?.node ?? '', f.terminated ? st.FK[1] : f.end ? st.FK[0] : current(f)?.handler ?? f.initiator.name]),
  }]);
  const fkNode = file(D.files.fkNode);
  writeWorkbook(fkNode, [{ name: 'Sheet1', headers: H.fkNode, rows: flows.fk.flatMap((f) => f.nodes.map((n): Cell[] => [f.no, f.name, n.node, n.handler, fmtSlash(n.start), n.end ? fmtSlash(n.end) : ''])) }]);

  // CSS：一行一个节点，时间是真正的日期格
  const css = file(D.files.css);
  writeWorkbook(css, [{
    name: 'Sheet1', headers: H.css, colWidths: [16, 30, 16, 30, 10, 10, 24, 12, 20, 20],
    rows: flows.css.flatMap((f) => f.nodes.map((n): Cell[] => [f.no, f.name, f.feeType, f.title, f.initiator.name, f.end ? st.CSS[0] : st.CSS[1], n.node, n.handler, new Date(n.start), n.end ? new Date(n.end) : null])),
  }]);

  const roster = file(D.files.roster);
  writeWorkbook(roster, [{ name: 'Sheet1', headers: H.roster, rows: people.map((p, i): Cell[] => [p.name, p.dept, `user${pad(i + 1)}@example.com`, p.manager ? mgrLabel : staffLabel]) }]);

  const all = [...flows.oa, ...flows.fk, ...flows.css];
  return { dir, oaFlow, oaNode, fkFlow, fkNode, css, roster, flows: all.length, nodes: all.reduce((n, f) => n + f.nodes.length, 0) };
}
