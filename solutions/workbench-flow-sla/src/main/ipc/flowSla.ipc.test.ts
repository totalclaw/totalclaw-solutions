/**
 * 流程时效监控 · 主进程动作通道的整链路：示例数据 → 核对 → 计算 → 环比 → 原因 → 通报 → 看板 / 跟进 / 台账 / 规则。
 * electron、账号目录、发信、模型、PDF 渲染换成替身，其余（读写真实 Excel、计算、落盘）都是真的。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const h = vi.hoisted(() => ({
  root: '',
  handler: null as null | ((e: unknown, req: { action: string; payload?: unknown }) => Promise<any>),
  sent: [] as any[],
  events: [] as any[],
  notifications: [] as string[],
  mailOk: true,
  llm: null as null | ((module: string, prompt: string) => any),
}));

vi.mock('electron', () => ({
  app: { getPath: () => join(h.root, 'documents') },
  dialog: { showOpenDialog: vi.fn(async () => ({ canceled: true, filePaths: [] })) },
  ipcMain: { handle: (_c: string, fn: any) => { h.handler = fn; } },
  Notification: class { static isSupported() { return true; } constructor(private readonly o: { title: string }) {} show() { h.notifications.push(this.o.title); } },
  shell: { openPath: vi.fn(async () => ''), showItemInFolder: vi.fn() },
  BrowserWindow: class {},
}));
vi.mock('../services/accountScope', () => ({ accountPath: (...sub: string[]) => join(h.root, 'account', ...sub) }));
vi.mock('../services/caseMailSender', async (orig) => ({
  ...(await orig<typeof import('../services/caseMailSender')>()),
  sendCaseMail: vi.fn(async (_creds: unknown, input: any) => { h.sent.push(input); return h.mailOk ? { ok: true, via: 'self', messageId: 'm1' } : { ok: false, message: 'SMTP 连接超时' }; }),
}));
vi.mock('../services/workbenchLlm', () => ({
  createWorkbenchLlm: () => ({ llmJson: async (module: string, prompt: string) => { if (!h.llm) throw new Error('模型通道没有配置'); return { json: h.llm(module, prompt), model: 'test' }; } }),
}));
vi.mock('../services/charityContent/render', () => ({ renderHtmlToPdf: vi.fn(async (html: string, out: string) => { writeFileSync(out, `%PDF-fake ${html.length}`); }) }));

import { FS_SYSTEMS, type FsBoardView, type FsCalcView, type FsCase, type FsCheckView, type FsCompareView, type FsOwnerMail, type FsPeriod, type FsReportPreview, type FsState } from '@totalclaw/ipc-contracts';
import { readAllSheets } from '../services/serviceSettlement/excel';
import { registerFlowSlaHandlers } from './flowSla.ipc';

const T = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00` : s).getTime();
const call = async <R = any>(action: string, payload?: unknown): Promise<R> => h.handler!(null, { action, payload });

beforeAll(() => {
  h.root = mkdtempSync(join(tmpdir(), 'fs-ipc-'));
  registerFlowSlaHandlers({
    logger: { info: vi.fn(), warn: vi.fn() },
    getMainWindow: () => ({ webContents: { send: (_c: string, ev: unknown) => h.events.push(ev) } }),
    readEmailCredentials: () => ({ EMAIL_ADDRESS: 'me@example.com', EMAIL_PASSWORD: 'x', EMAIL_SMTP_HOST: 'smtp.example.com', EMAIL_SENDER_NAME: '流程管理组' }),
    serviceAuth: null, authState: { authenticated: true }, qiyeApiProc: null,
  } as any);
});
afterAll(() => rmSync(h.root, { recursive: true, force: true }));

// 示例数据按「现在」往前造十周：上一个整月和上上个整月都有数据
const now = Date.now();
const d = new Date(now);
const monthStart = (back: number): number => new Date(d.getFullYear(), d.getMonth() - back, 1).getTime();
const lastMonth: FsPeriod = { kind: 'monthly', start: monthStart(1), end: monthStart(0), asOf: now, label: '' };
const prevMonth: FsPeriod = { kind: 'monthly', start: monthStart(2), end: monthStart(1), asOf: now, label: '' };
const week = (back: number): FsPeriod => {
  const day = new Date(now); day.setHours(0, 0, 0, 0);
  const monday = new Date(day.getFullYear(), day.getMonth(), day.getDate() - ((day.getDay() + 6) % 7) - 7 * back).getTime();
  return { kind: 'weekly', start: monday - 7 * 86_400_000, end: monday, asOf: now, label: '' };
};

describe('整链路', () => {
  let calc: FsCalcView;
  let check: FsCheckView;

  it('没导入就计算，给出能照做的提示', async () => {
    await expect(call('calc.run')).rejects.toThrow('还没有导入报表');
    await expect(call('no.such.action')).rejects.toThrow('未知操作');
    const s = await call<FsState>('state.get');
    expect(s).toMatchObject({ hasData: false, snapshots: [], mail: { address: 'me@example.com', smtpConfigured: true, officialRelay: false }, rules: { custom: false, counts: { e2e: 35, cssNodes: 76, oaFkNodes: 669, personal: 31, managers: 11 } } });
    expect(s.outputDir).toBe(join(h.root, 'documents', 'TotalClaw', '流程时效监控'));
  });

  it('生成示例数据：写出六个文件并载入', async () => {
    const r = await call('demo.generate', { period: prevMonth });
    expect(r.summary.systems.map((x: any) => x.system)).toEqual(FS_SYSTEMS);
    expect(r.summary.skipped).toEqual([]);
    expect(r.period.label).toMatch(/^\d{4}-\d{2}$/);
    for (const k of ['oaFlow', 'oaNode', 'fkFlow', 'fkNode', 'css', 'roster']) expect(existsSync(r.files[k]), k).toBe(true);
    expect(r.dir).toBe(join(h.root, 'documents', 'TotalClaw', '流程时效监控', '示例数据'));
    const s = await call<FsState>('state.get');
    expect(s.hasData).toBe(true);
    expect(s.session.ingest?.roster).toBe(29);
    expect(h.events.some((e) => e.type === 'state')).toBe(true);
  });

  it('上上个月先算一遍，留下一个可以环比的快照', async () => {
    const r = await call<FsCalcView>('calc.run');
    expect(r.overall.runningCount).toBeGreaterThan(0);
    expect((await call<FsState>('state.get')).snapshots).toHaveLength(1);
  });

  it('换成上个月重新导入：后面步骤的进度清空，快照和跟进名单留着', async () => {
    const files = (await call('demo.generate', { period: lastMonth })).files;
    const s = await call<FsState>('state.get');
    expect(s.session).toMatchObject({ snapshotId: '', cases: [], summary: '' });
    expect(s.snapshots).toHaveLength(1);
    expect(s.tracking.length).toBeGreaterThan(0);
    // 预览：认列、合并表、缺列
    const p = await call('ingest.preview', { path: files.css, slot: 'flow' });
    expect(p).toMatchObject({ combined: true, missing: [] });
    const node = await call('ingest.preview', { path: files.oaNode, slot: 'node', hasFlowTable: false });
    expect(node.missing).toEqual([]);
    await expect(call('ingest.preview', { path: join(h.root, 'nope.xlsx'), slot: 'flow' })).rejects.toThrow('文件不存在');
  });

  it('核对：对不上的流程名可以指定细类，未登记节点可以定性，都会记住', async () => {
    check = await call<FsCheckView>('check.run');
    expect(check.counts).toHaveLength(3);
    expect(check.outOfRoster).toEqual(['外部审核员']);
    const css = check.unmatched.find((u) => u.system === 'CSS')!;
    expect(css.flowName).toBe('配件索赔登记');
    const oa = check.unmatched.find((u) => u.system === 'OA')!;
    const node = check.unknownNodes[0];
    expect(node.node).toBeTruthy();

    await expect(call('alias.set', { system: 'CSS', flowName: css.flowName, target: '不存在的细类' })).rejects.toThrow('规则表里没有这个流程细类');
    await call('alias.set', { system: 'CSS', flowName: css.flowName, target: '质量报告单' });
    await call('alias.set', { system: 'OA', flowName: oa.flowName, target: '__regular__' });
    await call('node.decide', { system: node.system, flowName: node.flowName, node: node.node, internal: true });
    const after = await call<FsCheckView>('check.run');
    expect(after.unmatched.some((u) => u.system === 'CSS')).toBe(false);
    expect(after.unmatched.find((u) => u.flowName === oa.flowName)?.regular).toBe(true);
    expect(after.unknownNodes.some((n) => n.system === node.system && n.flowName === node.flowName && n.node === node.node)).toBe(false);
    expect(after.aliases).toEqual(expect.arrayContaining([{ system: 'CSS', flowName: css.flowName, target: '质量报告单' }]));
    expect(after.decisions).toEqual([{ system: node.system, flowName: node.flowName, node: node.node, internal: true }]);
    // 取消
    await call('node.decide', { system: node.system, flowName: node.flowName, node: node.node, internal: null });
    expect((await call<FsCheckView>('check.run')).decisions).toEqual([]);
  });

  it('计算：存快照、同步跟进名单、建原因名单；结果里仍是报表原来的流程名', async () => {
    const r = await call<FsCalcView & { tracking: { added: number; closed: number } }>('calc.run');
    calc = r;
    expect(r.overall.doneCount).toBeGreaterThan(20);
    expect(r.overall.runningOverdue).toBeGreaterThan(0);
    expect(r.overtime.every((f) => f.status === 'done' && f.overtime === true && f.inPeriod)).toBe(true);
    expect(r.runningAbnormal.every((f) => f.status === 'running' && (f.runningLabel === 'overdue' || f.runningLabel === 'risk'))).toBe(true);
    const s = await call<FsState>('state.get');
    expect(s.snapshots).toHaveLength(2);
    expect(s.snapshots[0]).toMatchObject({ id: r.snapshotId, kind: 'monthly', overall: r.overall });
    expect(s.session.snapshotId).toBe(r.snapshotId);
    const open = s.tracking.filter((t) => !t.closedAt);
    expect(open).toHaveLength(r.overall.runningOverdue);
    expect(new Set(open.map((t) => t.intervalDays))).toEqual(new Set([3, 7]));
    expect(s.session.cases).toHaveLength(r.overtime.length + r.overall.runningOverdue);
    // 重算同一周期不会多出一个快照
    await call('calc.run');
    expect((await call<FsState>('state.get')).snapshots).toHaveLength(2);
    expect(await call<FsCalcView>('calc.view')).toMatchObject({ overall: r.overall });
  });

  it('导出明细：真实的 xlsx，行数和计算结果对得上', async () => {
    const file = await call<string>('calc.export');
    const sheets = Object.fromEntries(readAllSheets(file).map((s) => [s.sheetName, s]));
    expect(sheets['在途流程'].rows).toHaveLength(calc.overall.runningCount);
    expect(sheets['办结明细'].rows).toHaveLength(calc.overall.doneCount);
    expect(sheets['超时流程']?.rows.length ?? 0).toBe(calc.overtime.length);
  });

  it('环比：默认对上上个月；异常类型带节点分析；月报带本年度在途超时', async () => {
    const r = await call<FsCompareView>('compare.run', {});
    expect(r.previous?.kind).toBe('monthly');
    expect(r.previous?.periodEnd).toBe(lastMonth.start);
    expect(r.candidates).toHaveLength(1);
    expect(r.delta.doneCount).toBe(calc.overall.doneCount - r.previous!.overall.doneCount);
    expect(r.abnormal.length).toBeGreaterThan(0);
    for (const a of r.abnormal) { expect(a.reasons.length).toBeGreaterThan(0); expect(a.analysis.flowType).toBe(a.flowType); }
    expect(r.abnormal.some((a) => a.analysis.longestNode)).toBe(true);
    expect(r.yearOverdue.every((f) => f.runningLabel === 'overdue')).toBe(true);
    expect((await call<FsState>('state.get')).session.prevSnapshotId).toBe(r.previous!.id);
  });

  let cases: FsCase[];
  it('原因收集：一人一封，没邮箱的跳过并说出来；发信失败不算已发', async () => {
    const r = await call<{ cases: FsCase[]; mails: FsOwnerMail[] }>('cases.get');
    cases = r.cases;
    expect(r.mails.reduce((n, m) => n + m.count, 0)).toBe(cases.length);
    const withMail = r.mails.filter((m) => m.email).slice(0, 2);
    expect(withMail).toHaveLength(2);
    // 让第三位责任人没有邮箱（花名册里没登记邮箱的人就是这种情况）
    const third = r.mails.filter((m) => m.email)[2];
    await call('cases.setEmail', { owner: third.owner, email: '' });
    const noMail = (await call<{ mails: FsOwnerMail[] }>('cases.get')).mails.find((m) => !m.email);
    expect(noMail?.owner).toBe(third.owner);
    await expect(call('reasons.send', { owners: [] })).rejects.toThrow('请先勾选');

    h.sent.length = 0; h.mailOk = false;
    const failed = await call('reasons.send', { owners: [withMail[0].owner] });
    expect(failed).toMatchObject({ sent: [], failed: [{ owner: withMail[0].owner, message: 'SMTP 连接超时' }] });
    expect((await call<{ mails: FsOwnerMail[] }>('cases.get')).mails.find((m) => m.owner === withMail[0].owner)?.mailedAt).toBe('');

    h.sent.length = 0; h.mailOk = true;
    const ok = await call('reasons.send', { owners: [withMail[0].owner, withMail[1].owner, noMail!.owner] });
    expect(ok.sent.sort()).toEqual([withMail[0].owner, withMail[1].owner].sort());
    expect(ok.skipped).toEqual([noMail!.owner]);
    expect(h.sent).toHaveLength(2);
    expect(h.sent[0].to).toEqual([withMail[0].email]);
    expect(h.sent[0].body).toContain('流程管理组');
    const att = h.sent[0].attachments[0].path;
    expect(readAllSheets(att)[0].rows).toHaveLength(withMail[0].count);
    expect((await call<{ mails: FsOwnerMail[] }>('cases.get')).mails.find((m) => m.owner === withMail[0].owner)?.mailedAt).not.toBe('');
    // 手工补邮箱
    await expect(call('cases.setEmail', { owner: noMail!.owner, email: '不是邮箱' })).rejects.toThrow('邮箱格式不对');
    await call('cases.setEmail', { owner: noMail!.owner, email: 'out@example.com' });
    expect((await call<{ mails: FsOwnerMail[] }>('cases.get')).mails.find((m) => m.owner === noMail!.owner)?.email).toBe('out@example.com');
  });

  it('原因回填：手填、整表导回；按关键字归类；模型乱给的类别不收', async () => {
    await expect(call('reasons.classify', {})).rejects.toThrow('还没有任何流程填了超时原因');
    await call('reasons.set', { key: cases[0].key, reason: '审批人出差一周' });
    // 导出 → 在表里填 → 导回
    const file = await call<string>('reasons.export');
    const XLSX = await import('xlsx');
    const wb = XLSX.read(readFileSync(file), { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    const reasonCol = aoa[0].indexOf('超时原因');
    const row1 = aoa.findIndex((r, i) => i > 0 && r[1] === cases[1].flowNo);
    const row2 = aoa.findIndex((r, i) => i > 0 && r[1] === cases[2].flowNo);
    aoa[row1][reasonCol] = '资料不全被退回补充';
    aoa[row2][reasonCol] = '服务商未反馈';
    aoa.push(['OA', '不存在的单号', '', '', '', '', '', '', '', '', '随便写的']);
    const back = join(h.root, '填好的.xlsx');
    XLSX.writeFile({ SheetNames: ['Sheet1'], Sheets: { Sheet1: XLSX.utils.aoa_to_sheet(aoa) } }, back);
    const imp = await call('reasons.import', { path: back });
    expect(imp).toMatchObject({ filled: 3, unmatched: 1 });

    const rule = await call('reasons.classify', {});
    expect(rule.by).toBe('rule');
    const by = Object.fromEntries((rule.cases as FsCase[]).map((c) => [c.key, c]));
    expect(by[cases[0].key]).toMatchObject({ categoryId: 'absence', classifiedBy: 'rule' });
    expect(by[cases[1].key].categoryId).toBe('materials');
    expect(by[cases[2].key].categoryId).toBe('external');
    expect(Object.keys(rule.rootCauses).sort()).toEqual(['absence', 'external', 'materials']);

    // 没有模型：明说，并保留关键字结果
    h.llm = null;
    const noModel = await call('reasons.classify', { useModel: true });
    expect(noModel).toMatchObject({ by: 'rule', modelError: '模型通道没有配置' });
    // 模型：一个合法、一个编的类别、一段带编造数字的根因
    h.llm = () => ({ items: [{ key: cases[0].key, category: 'cross_dept' }, { key: cases[1].key, category: '乱编的类别' }], rootCauses: { cross_dept: '跨部门确认没有约定答复时限。', materials: '平均被退回 9999 次。' } });
    const model = await call('reasons.classify', { useModel: true });
    const by2 = Object.fromEntries((model.cases as FsCase[]).map((c) => [c.key, c]));
    expect(model.by).toBe('model');
    expect(by2[cases[0].key]).toMatchObject({ categoryId: 'cross_dept', classifiedBy: 'model' });
    expect(by2[cases[1].key]).toMatchObject({ categoryId: 'materials', classifiedBy: 'rule' });
    expect(model.rootCauses.cross_dept).toBe('跨部门确认没有约定答复时限。');
    expect(model.rootCauses.materials).not.toContain('9999');
    expect(model.rejected).toBe(2);
    // 人改过的类别，再归类也不动
    await call('reasons.set', { key: cases[2].key, categoryId: 'design' });
    await expect(call('reasons.set', { key: cases[2].key, categoryId: 'nope' })).rejects.toThrow('原因类别不在名单里');
    const again = await call('reasons.classify', {});
    expect((again.cases as FsCase[]).find((c) => c.key === cases[2].key)).toMatchObject({ categoryId: 'design', classifiedBy: 'manual' });
  });

  let preview: FsReportPreview;
  it('总结：规则版直接可用；模型编数字时退回规则版', async () => {
    const rule = await call('summary.draft', {});
    expect(rule.by).toBe('rule');
    expect(rule.summary).toContain('【整体表现】');
    expect(rule.suggestions.length).toBeGreaterThan(0);
    h.llm = () => ({ summary: '本月合规率 12.34%，环比提升 56.78 个百分点。', suggestions: [] });
    const bad = await call('summary.draft', { useModel: true });
    expect(bad).toMatchObject({ by: 'rule', summary: rule.summary });
    expect(bad.dropped).toBeGreaterThan(0);
    h.llm = (_m, prompt) => {
      expect(prompt).toContain('FACTS:');
      return { summary: `【整体表现】本月办结 ${calc.overall.doneCount} 单，在途 ${calc.overall.runningCount} 单，整体需要继续关注在途流程的处理进度。`, suggestions: [{ item: '建立催办节奏', dept: '不存在的部门', owner: '不存在的人', requirement: '每周跟进一次', deadline: '2030-01-31', acceptance: '超时数量下降' }] };
    };
    const good = await call('summary.draft', { useModel: true });
    expect(good.by).toBe('model');
    expect(good.suggestions).toEqual([{ item: '建立催办节奏', dept: '', owner: '', requirement: '每周跟进一次', deadline: '2030-01-31', acceptance: '超时数量下降' }]);
    h.llm = null;
  });

  it('月报：生成 PDF 和明细表，预览与附件齐全', async () => {
    await call('summary.save', { summary: '手工改过的总结', suggestions: [{ item: '整理资料清单', dept: '服务交付部', owner: '林晓彤', requirement: '发起前自查', deadline: '2030-01-31', acceptance: '退回减少' }, { item: '  ', dept: '', owner: '', requirement: '', deadline: '', acceptance: '' }] });
    preview = await call<FsReportPreview>('report.build');
    expect(preview.kind).toBe('monthly');
    expect(preview.subject).toContain('月度通报');
    expect(preview.files.map((f) => f.name.split('.').pop())).toEqual(['pdf', 'xlsx']);
    for (const f of preview.files) expect(existsSync(f.path), f.path).toBe(true);
    expect(preview.html).toContain('手工改过的总结');
    expect(preview.html).toContain('整理资料清单');
    expect(preview.html).not.toMatch(/<script/i);
    expect(preview.text).toContain(`本月办结 ${calc.overall.doneCount} 单`);
    expect(readAllSheets(preview.files[1].path).map((s) => s.sheetName)).toEqual(expect.arrayContaining(['汇总', '改善建议', '本年在途超时']));
  });

  it('发送：收件人不对不发；发信失败如实报；发出后记住收件人并把建议记入台账（只记一次）', async () => {
    await expect(call('report.send', { to: '张三; a@example.com', subject: 's', text: 't' })).rejects.toThrow('这些收件人地址不对');
    await expect(call('report.send', { to: '', subject: 's', text: 't' })).rejects.toThrow('请填写收件人');
    h.sent.length = 0; h.mailOk = false;
    await expect(call('report.send', { to: 'all@example.com', subject: preview.subject, text: preview.text })).rejects.toThrow('SMTP 连接超时');
    expect((await call<FsState>('state.get')).ledger).toEqual([]);
    h.sent.length = 0; h.mailOk = true;
    const r = await call('report.send', { to: 'all@example.com; boss@example.com', subject: preview.subject, text: preview.text });
    expect(r).toMatchObject({ ok: true, recipients: 2, ledgerAdded: 1 });
    expect(h.sent[0]).toMatchObject({ to: ['all@example.com', 'boss@example.com'], subject: preview.subject, body: preview.text });
    expect(h.sent[0].attachments.map((a: any) => a.path)).toEqual(preview.files.map((f) => f.path));
    const s = await call<FsState>('state.get');
    expect(s.settings.monthlyRecipients).toBe('all@example.com; boss@example.com');
    expect(s.session.sentAt).not.toBe('');
    expect(s.ledger).toHaveLength(1);
    expect(s.ledger[0]).toMatchObject({ item: '整理资料清单', dept: '服务交付部', owner: '林晓彤', deadline: '2030-01-31', status: 'doing', escalated: false });
    expect(s.ledger[0].source).toContain('月度通报');
    await call('report.send', { to: 'all@example.com', subject: preview.subject, text: preview.text });
    expect((await call<FsState>('state.get')).ledger).toHaveLength(1);
    await expect(call('report.toLedger')).rejects.toThrow('已经记入台账');
  });

  it('周报：网页版 + 明细表，不往台账里写', async () => {
    await call('demo.generate', { period: week(0) });
    await call('calc.run');
    await call('compare.run', {});
    const p = await call<FsReportPreview>('report.build');
    expect(p.kind).toBe('weekly');
    expect(p.files.map((f) => f.name.split('.').pop())).toEqual(['html', 'xlsx']);
    expect(readFileSync(p.files[0].path, 'utf-8')).toBe(p.html);
    expect(p.text).toContain('一、关键数字');
    h.sent.length = 0;
    const r = await call('report.send', { to: 'team@example.com', subject: p.subject, text: p.text });
    expect(r.ledgerAdded).toBe(0);
    const s = await call<FsState>('state.get');
    expect(s.settings.weeklyRecipients).toBe('team@example.com');
    expect(s.settings.monthlyRecipients).toBe('all@example.com');
    expect(s.ledger).toHaveLength(1);
    expect(s.snapshots.map((x) => x.kind).sort()).toEqual(['monthly', 'monthly', 'weekly']);
  });
});

describe('看板', () => {
  it('默认最新周期；趋势按周期从早到晚；筛选后数字由主进程重算', async () => {
    const all = await call<FsBoardView>('board.get', {});
    expect(all.snapshot?.kind).toBe('weekly');
    expect(all.trend.map((t) => t.periodEnd)).toEqual([...all.trend.map((t) => t.periodEnd)].sort((a, b) => a - b));
    expect(all.trend).toHaveLength(3);
    expect(all.overall).toEqual(all.snapshot!.overall);
    expect(all.options.systems).toEqual(expect.arrayContaining(FS_SYSTEMS));
    expect(all.flowTotal).toBeGreaterThan(0);

    const monthly = (await call<FsState>('state.get')).snapshots.find((s) => s.kind === 'monthly')!;
    const m = await call<FsBoardView>('board.get', { snapshotId: monthly.id });
    expect(m.overall).toEqual(monthly.overall);
    const oa = await call<FsBoardView>('board.get', { snapshotId: monthly.id, system: 'OA' });
    expect(oa.flows.every((f) => f.system === 'OA')).toBe(true);
    expect(oa.overall!.doneCount).toBe(m.byType.filter((t) => t.system === 'OA').reduce((n, t) => n + t.doneCount, 0));
    expect(oa.overall!.doneCount).toBeLessThan(m.overall!.doneCount);
    const type = m.byType.find((t) => t.doneCount > 0)!;
    const one = await call<FsBoardView>('board.get', { snapshotId: monthly.id, system: type.system, category: type.category, flowType: type.flowType });
    expect(one.byType).toHaveLength(1);
    expect(one.byType[0]).toMatchObject({ doneCount: type.doneCount, avgDays: type.avgDays, complianceRate: type.complianceRate });
    expect(one.flows.every((f) => f.flowType === type.flowType)).toBe(true);
    const dept = m.options.depts[0];
    const byDept = await call<FsBoardView>('board.get', { snapshotId: monthly.id, dept });
    expect(byDept.flows.length).toBeGreaterThan(0);
    expect(byDept.flows.every((f) => f.dept === dept)).toBe(true);
  });

  it('删掉一个周期的快照', async () => {
    const s = await call<FsState>('state.get');
    const weekly = s.snapshots.find((x) => x.kind === 'weekly')!;
    await call('snapshot.remove', { id: weekly.id });
    const after = await call<FsBoardView>('board.get', {});
    expect(after.trend).toHaveLength(2);
    expect(after.snapshot?.kind).toBe('monthly');
  });
});

describe('在途跟进', () => {
  it('记进展顺延下次跟进；发提醒要有邮箱；手工闭环后离开名单', async () => {
    const s = await call<FsState>('state.get');
    const item = s.tracking.find((t) => !t.closedAt && t.handlerEmail)!;
    const noMail = s.tracking.find((t) => !t.closedAt && !t.handlerEmail);
    await expect(call('track.note', { key: item.key, text: '  ' })).rejects.toThrow('请填写进展');
    await call('track.note', { key: item.key, text: '已电话催办' });
    const t1 = (await call<FsState>('state.get')).tracking.find((t) => t.key === item.key)!;
    expect(t1.notes[t1.notes.length - 1]).toMatchObject({ text: '已电话催办', kind: 'note' });
    expect(Date.parse(t1.nextFollowAt) - Date.parse(t1.lastFollowAt)).toBe(t1.intervalDays * 86_400_000);

    const mail = await call('track.mailPreview', { key: item.key });
    expect(mail.to).toBe(item.handlerEmail);
    expect(mail.body).toContain(item.flowNo);
    h.sent.length = 0;
    await call('track.remind', { key: item.key, subject: mail.subject, body: mail.body });
    expect(h.sent[0]).toMatchObject({ to: [item.handlerEmail], subject: mail.subject });
    const t2 = (await call<FsState>('state.get')).tracking.find((t) => t.key === item.key)!;
    expect(t2.notes[t2.notes.length - 1].kind).toBe('mail');
    if (noMail) await expect(call('track.remind', { key: noMail.key, subject: 's', body: 'b' })).rejects.toThrow('没有邮箱');

    await call('track.close', { key: item.key, reason: '已线下办结' });
    const t3 = (await call<FsState>('state.get')).tracking.find((t) => t.key === item.key)!;
    expect(t3).toMatchObject({ closeReason: '已线下办结' });
    expect(t3.closedAt).not.toBe('');
    await expect(call('track.note', { key: item.key, text: 'x' })).rejects.toThrow('跟进条目不存在');
  });

  it('立即检查提醒：没有到期的就不提醒', async () => {
    expect(await call<number>('reminders.check')).toBe(0);
  });
});

describe('改善台账', () => {
  it('登记、改期、记进展、完成、归档、导出、删除', async () => {
    await expect(call('ledger.save', { item: { item: ' ' } })).rejects.toThrow('请填写改善事项');
    await expect(call('ledger.save', { item: { item: 'x', deadline: '明年' } })).rejects.toThrow('执行期限');
    const saved = await call('ledger.save', { item: { item: '梳理审批节点', dept: '运营管理部', owner: '何家明', deadline: '2020-01-01', acceptance: '节点减少' } });
    expect(saved).toMatchObject({ item: '梳理审批节点', status: 'overdue', source: '手工登记' });
    // 过了期限：后台检查后升级督办并提醒一次
    h.notifications.length = 0;
    expect(await call<number>('reminders.check')).toBe(1);
    expect(h.notifications[0]).toContain('已逾期');
    expect(await call<number>('reminders.check')).toBe(0);
    let s = await call<FsState>('state.get');
    expect(s.ledger.find((l) => l.id === saved.id)).toMatchObject({ status: 'overdue', escalated: true });
    expect(s.reminders[0].type).toBe('ledger_overdue');
    // 延期 → 回到进行中
    await call('ledger.save', { item: { id: saved.id, item: '梳理审批节点', deadline: '2030-12-31' } });
    s = await call<FsState>('state.get');
    expect(s.ledger.find((l) => l.id === saved.id)).toMatchObject({ status: 'doing', escalated: false, deadline: '2030-12-31', dept: '运营管理部' });
    await call('ledger.progress', { id: saved.id, text: '已与责任人确认，下周提交方案' });
    await call('ledger.save', { item: { id: saved.id, item: '梳理审批节点', status: 'done' } });
    await call('ledger.save', { item: { id: saved.id, item: '梳理审批节点', status: 'archived' } });
    s = await call<FsState>('state.get');
    const cur = s.ledger.find((l) => l.id === saved.id)!;
    expect(cur.status).toBe('archived');
    expect(cur.progress.map((p) => p.text)).toEqual(['已与责任人确认，下周提交方案', '状态改为：已完成', '状态改为：已归档']);

    const file = await call<string>('ledger.export');
    const rows = readAllSheets(file)[0].rows;
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r['改善事项'] === '梳理审批节点')).toMatchObject({ 责任部门: '运营管理部', 责任人: '何家明', 状态: '已归档', 是否升级督办: '否' });
    await call('ledger.remove', { id: saved.id });
    expect((await call<FsState>('state.get')).ledger).toHaveLength(1);
    await call('reminders.clear');
    expect((await call<FsState>('state.get')).reminders).toEqual([]);
  });
});

describe('规则与设置', () => {
  it('阈值：改了生效、越界的不收、可以恢复默认；改规则后要重新计算', async () => {
    const before = await call('rules.get');
    expect(before).toMatchObject({ custom: false, thresholds: { riskRatio: 0.8, minComplianceRate: 0.95, internalDays: 3, externalDays: 7, improveRemindDays: 7 } });
    expect([before.e2e.length, before.cssNodes.length, before.oaFkNodes.length, before.personal.length, before.managers.length]).toEqual([35, 76, 669, 31, 11]);
    const th = await call('rules.thresholds', { patch: { riskRatio: 0.7, minComplianceRate: 5, internalDays: 2 } });
    expect(th).toMatchObject({ riskRatio: 0.7, minComplianceRate: 0.95, internalDays: 2 });
    const s = await call<FsState>('state.get');
    expect(s.thresholds.riskRatio).toBe(0.7);
    expect(s.session.snapshotId).toBe('');
    expect(await call('rules.thresholds', { patch: null })).toMatchObject({ riskRatio: 0.8, internalDays: 3 });
  });

  it('节假日：写错的日期不收；保存后参与 CSS 工作日计算', async () => {
    await expect(call('calendar.save', { holidays: ['2026-10-01', '十月一日'], extraWorkdays: [] })).rejects.toThrow('日期写得不对');
    await call('calendar.save', { holidays: ['2026-10-02', '2026-10-01', '2026-10-01'], extraWorkdays: ['2026-10-10'] });
    expect(await call('rules.get')).toMatchObject({ holidays: ['2026-10-01', '2026-10-02'], extraWorkdays: ['2026-10-10'] });
  });

  it('导入规则工作簿：整体替换；缺表报错且不动现有规则；恢复内置', async () => {
    const XLSX = await import('xlsx');
    const good = join(h.root, '时效看板指标-新版.xlsx');
    const wb = XLSX.utils.book_new();
    const add = (name: string, aoa: unknown[][]) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), name);
    add('端到端用时', [['大类', '流程细类', '流程所属系统', '整体时效要求'], ['内部驱动型', '日常费用报销', '费控', '25天'], ['常规流程', '除了以上流程', 'OA/费控', '/']]);
    add('CSS各节点时效要求', [['流程细类', '审核节点', '审核时效要求', '备注', null, '事务类型', '费用类型', '审批节点名', '是否计入端对端时效', '单节点要求（工作日）'], [null, null, null, null, null, '质量报告单', null, '技术支持审核', '内部', 2]]);
    add('oa、费控节点内外部', [['流程名', '环节名称', '节点属性'], ['日常费用报销', '部门负责人', '内部']]);
    add('oa费控个人节点时效要求', [['审核人身份', '大类', '流程细类', '平台', '金额', '重要性', '时效要求'], ['管理干部', '常规流程', '除了以上流程都是', 'OA/费控', '/', '次要流程', '2天'], ['非管理干部', '常规流程', '/', 'OA/费控', '/', '内部节点', '3天']]);
    add('审核人身份', [['姓名', '身份'], ['甲', '管理干部'], ['其他人', '非管理']]);
    XLSX.writeFile(wb, good);
    const r = await call('rules.import', { path: good });
    expect(r.counts).toEqual({ e2e: 2, cssNodes: 1, oaFkNodes: 1, personal: 2, managers: 1 });
    const after = await call('rules.get');
    expect(after).toMatchObject({ custom: true, version: '时效看板指标-新版', managers: ['甲'] });
    expect(after.e2e[0].limitDays).toBe(25);
    expect((await call<FsState>('state.get')).rules).toMatchObject({ custom: true, counts: { e2e: 2 } });

    const bad = join(h.root, '缺表.xlsx');
    const wb2 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb2, XLSX.utils.aoa_to_sheet([['大类', '流程细类', '流程所属系统', '整体时效要求'], ['a', 'b', 'OA', '3天']]), '端到端用时');
    XLSX.writeFile(wb2, bad);
    await expect(call('rules.import', { path: bad })).rejects.toThrow('CSS各节点时效要求');
    expect((await call('rules.get')).version).toBe('时效看板指标-新版');

    await call('rules.reset');
    expect(await call('rules.get')).toMatchObject({ custom: false });
    expect((await call('rules.get')).e2e).toHaveLength(35);
  });

  it('输出目录和收件人可以改', async () => {
    const dir = join(h.root, 'my-out');
    require('node:fs').mkdirSync(dir);
    await call('settings.patch', { patch: { outputDir: dir, weeklyRecipients: 'w@example.com' } });
    const s = await call<FsState>('state.get');
    expect(s.outputDir).toBe(dir);
    expect(s.settings.weeklyRecipients).toBe('w@example.com');
    await expect(call('path.open', { path: join(dir, 'nope') })).rejects.toThrow('文件不存在');
    expect(await call('files.pick', {})).toEqual([]);
  });
});
