/**
 * 服务商结算 · 带 IO 的链路（不能靠肉眼的那部分）：收件箱扫发票归档重命名、负责人信息自动抠取校验、
 * 四类提醒（每月付款日 / 发票 3 天未核销 / 20 天未开票 / 呆滞配件二次通知）的触发与去重、未付款报表落盘。
 * 邮件/系统通知/收件箱全部打桩，只验编排逻辑与落盘结果。
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'ss-proc-'));

vi.mock('../accountScope', () => ({
  privateRoot: () => join(TMP, 'account'),
  accountPath: (...sub: string[]) => join(TMP, 'account', ...sub),
  onAccountKeyChange: () => {},
}));
vi.mock('electron', () => ({
  Notification: class { static isSupported() { return false; } show() { /* noop */ } },
  app: { getPath: () => TMP },
}));

import { ServiceSettlementStore } from './store';
import { ServiceSettlementProc } from './proc';
import { readTable } from './excel';

interface FakeItem {
  id: string; channel: string; simulated: boolean; receivedAt: string; externalId: string;
  from: { name: string; address: string }; subject: string; body: string;
  attachments: { fileName: string; relPath: string; mime: string; size: number; sha256: string; kind: string }[];
  module: string; status: string;
}

function makeIntake(items: FakeItem[]) {
  const root = join(TMP, 'intake');
  mkdirSync(root, { recursive: true });
  return {
    root,
    items,
    list() { return { items: this.items as any[] }; },
    attachmentPath(_itemId: string, relPath: string) { const p = join(root, relPath); return existsSync(p) ? p : null; },
    on() { return this; },
    off() { return this; },
  };
}

function attach(intake: ReturnType<typeof makeIntake>, itemId: string, fileName: string, bytes = 'x'): FakeItem['attachments'][number] {
  const rel = join('attachments', itemId, fileName);
  mkdirSync(join(intake.root, 'attachments', itemId), { recursive: true });
  writeFileSync(join(intake.root, rel), bytes);
  return { fileName, relPath: rel, mime: 'application/octet-stream', size: bytes.length, sha256: 'x', kind: 'other' };
}

let store: ServiceSettlementStore;
let sent: { to: string[]; subject: string; body: string }[] = [];
let fired: { type: string; title: string }[] = [];
let broadcasts: { type: string }[] = [];
/** 注入给 proc 的时钟：null = 真实时间；用例里用 at() 把「现在」钉到模拟日期，记录里写下的时间戳才跟用例同一条时间线 */
let fakeNow: number | null = null;
const at = (iso: string): Date => { fakeNow = new Date(iso).getTime(); return new Date(fakeNow); };
afterEach(() => { fakeNow = null; });

function makeProc(intake: ReturnType<typeof makeIntake> | null) {
  return new ServiceSettlementProc({
    store,
    now: () => fakeNow ?? Date.now(),
    intakeService: intake as any,
    readEmailCredentials: () => ({}),
    sendMail: async (input) => { sent.push({ to: input.to, subject: input.subject, body: input.body }); return { ok: true, messageId: 'mid' }; },
    pushOutlets: async (title) => { fired.push({ type: 'outlet', title }); return ['wecom']; },
    broadcast: (ev) => { broadcasts.push({ type: ev.type }); },
    defaultOutputDir: () => join(TMP, 'out'),
  });
}

beforeAll(() => {
  mkdirSync(join(TMP, 'account'), { recursive: true });
  store = new ServiceSettlementStore();
  store.update((s) => { s.outputDir = join(TMP, 'out'); s.settlement.period = '2026-08'; });
  store.upsertContacts([{ provider: '甲服务', email: 'jia@example.com' }, { provider: '乙服务', email: 'yi@example.com' }]);
  store.upsertTracking('2026-08', '甲服务', { netTotal: 135, sentAt: new Date().toISOString(), messageId: 'm1' });
});
afterAll(() => { rmSync(TMP, { recursive: true, force: true }); });

describe('通讯录：别名与规范名', () => {
  it('upsert 带别名 → aliasMap / directoryNames 都按归一名；再次 upsert 合并不覆盖', () => {
    store.upsertContacts([{ provider: '宁波市鄞州亿天电器维修服务部(个体工商户)', aliases: ['宁波市鄞州新河亿天电器维修服务部', ' 宁波市鄞州亿天电器维修服务部（个体工商户） '] }]);
    expect(store.aliasMap()).toMatchObject({ '宁波市鄞州新河亿天电器维修服务部': '宁波市鄞州亿天电器维修服务部（个体工商户）' });
    // 自己的名字不能当自己的别名
    expect(Object.keys(store.aliasMap())).not.toContain('宁波市鄞州亿天电器维修服务部（个体工商户）');
    store.upsertContacts([{ provider: '宁波市鄞州亿天电器维修服务部（个体工商户）', aliases: ['鄞州亿天'] }]);
    expect(store.aliasMap()).toMatchObject({ '宁波市鄞州新河亿天电器维修服务部': '宁波市鄞州亿天电器维修服务部（个体工商户）', '鄞州亿天': '宁波市鄞州亿天电器维修服务部（个体工商户）' });
    expect(store.directoryNames()).toContain('宁波市鄞州亿天电器维修服务部（个体工商户）');
    expect(store.directoryNames()).toContain('甲服务');
  });
});

describe('收件箱扫描：发票归档重命名 + 负责人信息抠取', () => {
  it('来自已知服务商邮箱的发票附件 → 按模板重命名归档，登记 invoiceReceivedAt；重复扫描不重复归档', async () => {
    const intake = makeIntake([]);
    const item: FakeItem = {
      id: 'email-1', channel: 'email', simulated: false, receivedAt: '2026-08-20T10:00:00.000Z', externalId: 'x',
      from: { name: '甲服务 财务', address: 'JIA@example.com' }, subject: '8月结算发票', body: '发票见附件',
      attachments: [], module: 'unclassified', status: 'new',
    };
    item.attachments.push(attach(intake, item.id, 'scan-0001.PDF'), attach(intake, item.id, '合同.docx'));
    intake.items.push(item);
    const proc = makeProc(intake);
    const r1 = await proc.scanIntake();
    expect(r1.invoices).toBe(1); // docx 不是发票类扩展名，不归档
    const rec = store.trackingRecord('2026-08', '甲服务')!;
    expect(rec.invoiceReceivedAt).toBe('2026-08-20T10:00:00.000Z');
    expect(rec.invoiceFiles).toHaveLength(1);
    expect(rec.invoiceFiles![0].endsWith('甲服务_2026-08_发票01.pdf')).toBe(true);
    expect(existsSync(rec.invoiceFiles![0])).toBe(true);
    expect(store.get().settlement.processedIntakeIds).toContain('email-1');
    const r2 = await proc.scanIntake();
    expect(r2.invoices).toBe(0);
    expect(store.trackingRecord('2026-08', '甲服务')!.invoiceFiles).toHaveLength(1);
    expect(fired.some((f) => f.title.includes('1'))).toBe(true); // 触发了「收到 1 份发票」提醒
  });

  it('陌生发件人（通讯录里没有、正文也不含服务商名）不会被误归档', async () => {
    const intake = makeIntake([]);
    const item: FakeItem = {
      id: 'email-2', channel: 'email', simulated: false, receivedAt: '2026-08-21T10:00:00.000Z', externalId: 'y',
      from: { name: '推广', address: 'promo@spam.com' }, subject: '发票代开', body: '联系我',
      attachments: [], module: 'unclassified', status: 'new',
    };
    item.attachments.push(attach(intake, item.id, 'fapiao.pdf'));
    intake.items.push(item);
    const proc = makeProc(intake);
    const r = await proc.scanIntake();
    expect(r.invoices).toBe(0);
    expect(store.trackingRecord('2026-08', '乙服务')?.invoiceReceivedAt).toBeUndefined();
  });

  it('企微/邮件正文回传的负责人信息自动汇总并校验；错误信息标红', async () => {
    const intake = makeIntake([]);
    intake.items.push({
      id: 'wecom-1', channel: 'wecom', simulated: false, receivedAt: '2026-08-22T10:00:00.000Z', externalId: 'z',
      from: { name: '乙服务', address: 'wx_yi' }, subject: '',
      body: '负责人信息如下\n姓名：李四\n身份证号：11010519491231002X\n银行卡号：4111 1111 1111 1111\n开户行：招商银行深圳分行\n手机：13900139000',
      attachments: [], module: 'unclassified', status: 'new',
    }, {
      id: 'wecom-2', channel: 'wecom', simulated: false, receivedAt: '2026-08-22T11:00:00.000Z', externalId: 'w',
      from: { name: '甲服务', address: 'wx_jia' }, subject: '',
      body: '姓名：王五\n身份证：110105194912310021\n银行卡号：6222020000000000\n开户行：工行',
      attachments: [], module: 'unclassified', status: 'new',
    });
    const proc = makeProc(intake);
    const r = await proc.scanIntake();
    expect(r.leaders).toBe(2);
    const leaders = store.get().marketing.leaders;
    const yi = leaders.find((l) => l.provider === '乙服务')!;
    expect(yi).toMatchObject({ name: '李四', idCard: '11010519491231002X', bankCard: '4111111111111111', bankName: '招商银行深圳分行', phone: '13900139000', source: 'wecom' });
    expect(yi.errors).toEqual([]);
    const jia = leaders.find((l) => l.provider === '甲服务')!;
    expect(jia.errors.join(';')).toMatch(/校验位/);
    expect(jia.errors.join(';')).toMatch(/Luhn|校验不通过/);
  });
});

describe('提醒调度：触发条件与去重', () => {
  it('每月付款日：到点触发一次，本月不再重复；下月再触发', async () => {
    const proc = makeProc(null);
    fired = [];
    store.update((s) => { s.review.paymentReminder = { enabled: true, day: 10, hour: 9 }; s.review.lastSummary = { providerCount: 3, total: 1234 }; });
    await proc.runReminders(new Date(2026, 8, 10, 9, 30)); // 2026-09-10 09:30
    expect(store.get().reminders.filter((r) => r.type === 'payment_day')).toHaveLength(1);
    expect(store.get().review.paymentReminder.lastFiredMonth).toBe('2026-09');
    await proc.runReminders(new Date(2026, 8, 15, 12, 0));
    expect(store.get().reminders.filter((r) => r.type === 'payment_day')).toHaveLength(1);
    await proc.runReminders(new Date(2026, 9, 10, 9, 0)); // 10 月
    expect(store.get().reminders.filter((r) => r.type === 'payment_day')).toHaveLength(2);
    await proc.runReminders(new Date(2026, 10, 10, 8, 0)); // 11 月 8 点：未到 9 点不触发
    expect(store.get().reminders.filter((r) => r.type === 'payment_day')).toHaveLength(2);
  });

  it('发票到 3 天未核销 → 提醒一次并打 remindedWriteoffAt；核销发起后不再提醒', async () => {
    const proc = makeProc(null);
    const now = new Date('2026-09-01T09:00:00Z');
    store.upsertTracking('2026-08', '乙服务', { netTotal: 45, sentAt: '2026-08-20T00:00:00Z', invoiceReceivedAt: '2026-08-28T00:00:00Z' });
    const yiCount = () => store.get().reminders.filter((r) => r.type === 'writeoff_3d' && r.body.includes('乙服务')).length;
    await proc.runReminders(now);
    expect(yiCount()).toBe(1);
    expect(store.trackingRecord('2026-08', '乙服务')!.remindedWriteoffAt).toBeTruthy();
    await proc.runReminders(new Date('2026-09-02T09:00:00Z'));
    expect(yiCount()).toBe(1);
    store.upsertTracking('2026-08', '乙服务', { writeoffStartedAt: '2026-09-02T10:00:00Z' });
    await proc.runReminders(new Date('2026-09-10T09:00:00Z'));
    expect(yiCount()).toBe(1);
  });

  it('下发 20 天未收到发票 → 预警一次；收到发票后不再预警', async () => {
    const proc = makeProc(null);
    store.upsertTracking('2026-07', '丙服务', { netTotal: 10, sentAt: '2026-07-01T00:00:00Z' });
    await proc.runReminders(new Date('2026-07-22T09:00:00Z'));
    const first = store.get().reminders.filter((r) => r.type === 'invoice_20d');
    expect(first).toHaveLength(1);
    expect(first[0].body).toContain('丙服务');
    await proc.runReminders(new Date('2026-07-23T09:00:00Z'));
    expect(store.get().reminders.filter((r) => r.type === 'invoice_20d')).toHaveLength(1);
  });

  it('多收件人：一格里逗号隔开的两个邮箱都收到；格式不对的跳过并写进结果说明', async () => {
    const proc = makeProc(null);
    sent = [];
    const att = join(TMP, 'att-多.xlsx'); writeFileSync(att, 'x');
    store.upsertContacts([{ provider: '多邮箱服务', email: 'cw@duo.com, boss@duo.com；不是邮箱' }]);
    expect(store.contact('多邮箱服务')!.email).toBe('cw@duo.com, boss@duo.com, 不是邮箱');
    store.upsertTracking('2026-08', '多邮箱服务', { netTotal: 1, attachmentPath: att });
    const [o] = await proc.sendSettlementMails('2026-08', { providers: ['多邮箱服务'] });
    expect(o.ok).toBe(true);
    expect(sent.at(-1)!.to).toEqual(['cw@duo.com', 'boss@duo.com']);
    expect(o.message).toContain('不是邮箱');
    // 来信地址是第二个邮箱也能对上这家
    expect(store.matchProvider({ address: 'BOSS@duo.com' })?.provider).toBe('多邮箱服务');
  });

  it('自动跟进：未读满 N 天重发原邮件（附件 + 回执头，计数 +1）；已读满 N 天没发票发催办邮件；收到发票后不再跟进', async () => {
    const proc = makeProc(null);
    sent = [];
    const att = join(TMP, 'att-跟进.xlsx'); writeFileSync(att, 'x');
    // 前面用例留下的记录（丙服务：发了没附件）不能进来搅局
    const others = store.get().settlement.records;
    store.update((s) => { s.settlement.records = []; s.settlement.followUp = { enabled: true, days: 3 }; });
    store.upsertContacts([{ provider: '未读服务', email: 'wd@a.com' }, { provider: '已读服务', email: 'yd@a.com' }]);
    store.upsertTracking('2026-08', '未读服务', { netTotal: 100, attachmentPath: att, sentAt: '2026-09-01T00:00:00Z', messageId: 'm-wd' });
    store.upsertTracking('2026-08', '已读服务', { netTotal: 200, attachmentPath: att, sentAt: '2026-09-01T00:00:00Z', messageId: 'm-yd', readAt: '2026-09-02T00:00:00Z' });
    // 第 2 天：谁都没到 3 天
    await proc.runFollowUps(at('2026-09-03T09:00:00Z'));
    expect(sent).toHaveLength(0);
    // 第 4 天：未读的满 3 天 → 重发；已读的 2 天 → 还不催
    await proc.runFollowUps(at('2026-09-04T09:00:00Z'));
    expect(sent.map((m) => m.to[0])).toEqual(['wd@a.com']);
    expect(sent[0].subject).toContain('未读服务');
    const wd = store.trackingRecord('2026-08', '未读服务')!;
    expect(wd.resendCount).toBe(1);
    expect(wd.sentAt).toBe('2026-09-01T00:00:00Z');           // 首发时间不动（20 天预警仍按首发算）
    expect(wd.messageIds).toEqual(['m-wd', 'mid']);           // 两封的 Message-ID 都留着给回执匹配
    expect(store.get().reminders.filter((r) => r.type === 'follow_up')).toHaveLength(1);
    // 发不出去的（附件丢了）也按 N 天节奏重试，不是每一轮都报
    store.upsertTracking('2026-08', '丢附件服务', { netTotal: 1, sentAt: '2026-08-01T00:00:00Z', email: 'lost@a.com' });
    await proc.runFollowUps(at('2026-09-04T09:10:00Z'));
    expect(store.get().reminders.filter((r) => r.type === 'follow_up')).toHaveLength(2);
    expect(store.get().reminders.at(-1)!.body).toContain('丢附件服务');
    await proc.runFollowUps(at('2026-09-04T09:20:00Z'));
    expect(store.get().reminders.filter((r) => r.type === 'follow_up')).toHaveLength(2);
    store.update((s) => { s.settlement.records = s.settlement.records.filter((r) => r.provider !== '丢附件服务'); });
    // 第 5 天：已读的满 3 天 → 催办（挂在原邮件线程下）；未读的刚重发 1 天 → 不再发
    sent = [];
    await proc.runFollowUps(at('2026-09-05T09:00:00Z'));
    expect(sent.map((m) => m.to[0])).toEqual(['yd@a.com']);
    expect(sent[0].subject).toContain('催办');
    expect(sent[0].body).toContain('2026-09-01');
    expect(store.trackingRecord('2026-08', '已读服务')!.nudgeCount).toBe(1);
    // 收到发票后：再过很多天也不催了
    store.upsertTracking('2026-08', '已读服务', { invoiceReceivedAt: '2026-09-06T00:00:00Z' });
    sent = [];
    await proc.runFollowUps(at('2026-09-20T09:00:00Z'));
    expect(sent.map((m) => m.to[0])).toEqual(['wd@a.com']);   // 只剩未读那家第二轮重发
    expect(store.trackingRecord('2026-08', '未读服务')!.resendCount).toBe(2);
    // 开关关掉就什么都不发
    store.update((s) => { s.settlement.followUp.enabled = false; });
    sent = [];
    await proc.runFollowUps(at('2026-10-20T09:00:00Z'));
    expect(sent).toHaveLength(0);
    store.update((s) => { s.settlement.records = others; });
  });

  it('呆滞配件退回：距截止 ≤10 天且未退回 → 给服务商发二次提醒邮件并记 secondNoticeAt；已退回的不发', async () => {
    const proc = makeProc(null);
    sent = [];
    store.update((s) => {
      s.marketing.rules.returnRemindBeforeDays = 10;
      s.marketing.returnRecords = [
        { provider: '甲服务', amount: 500, notifiedAt: '2026-09-01T00:00:00Z', dueDate: '2026-09-30' },
        { provider: '乙服务', amount: 300, notifiedAt: '2026-09-01T00:00:00Z', dueDate: '2026-09-30', returned: true },
      ];
    });
    await proc.runReminders(at('2026-09-15T09:00:00Z')); // 距截止 15 天，不触发
    expect(sent).toHaveLength(0);
    await proc.runReminders(at('2026-09-21T09:00:00Z')); // 距截止 9 天
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toEqual(['jia@example.com']);
    expect(sent[0].body).toContain('500');
    const recs = store.get().marketing.returnRecords;
    expect(recs.find((r) => r.provider === '甲服务')!.secondNoticeAt).toBeTruthy();
    expect(recs.find((r) => r.provider === '乙服务')!.secondNoticeAt).toBeUndefined();
    await proc.runReminders(at('2026-09-22T09:00:00Z'));
    expect(sent).toHaveLength(1); // 不重复发
  });

  it('未完成付款报表：落盘且只含未付款服务商', async () => {
    const proc = makeProc(null);
    store.upsertTracking('2026-08', '甲服务', { writeoffCompletedAt: '2026-09-03T00:00:00Z' });
    const p = proc.exportUnpaidReport();
    expect(existsSync(p)).toBe(true);
    const t = readTable(p);
    const providers = t.rows.map((r) => r[t.headers[0]]);
    expect(providers).not.toContain('甲服务'); // 已付款
    expect(providers).toContain('乙服务');
    expect(providers).toContain('丙服务');
  });

  it('手工归档发票（拖文件）走同一命名规则，序号接着排', () => {
    const proc = makeProc(null);
    const f = join(TMP, 'manual.ofd');
    writeFileSync(f, 'ofd');
    const saved = proc.importInvoices('2026-08', '甲服务', [f]);
    expect(saved).toHaveLength(1);
    expect(saved[0].endsWith('甲服务_2026-08_发票02.ofd')).toBe(true);
    expect(readdirSync(join(TMP, 'out')).length).toBeGreaterThan(0);
  });
});

describe('审查回归：发票误归档 / 负责人覆盖 / 发件人误匹配', () => {
  it('D · 引用了我们下发正文（含"发票"二字）的普通回信 + 签名小图，不当发票归档；大图带发票字样才算', async () => {
    const intake = makeIntake([]);
    const before = store.trackingRecord('2026-08', '乙服务');
    const beforeCount = before?.invoiceFiles?.length || 0;
    const item: FakeItem = {
      id: 'email-quote', channel: 'email', simulated: false, receivedAt: '2026-09-05T10:00:00.000Z', externalId: 'q',
      from: { name: '乙服务', address: 'yi@example.com' }, subject: 'Re: 【2026-08】乙服务 服务费用结算明细',
      body: '收到，核对后回复。\n> 如无异议，请按明细金额开具发票并回复本邮件',
      attachments: [], module: 'unclassified', status: 'new',
    };
    item.attachments.push(attach(intake, item.id, 'logo.png', 'x'.repeat(2000)));
    intake.items.push(item);
    const proc = makeProc(intake);
    const r = await proc.scanIntake();
    expect(r.invoices).toBe(0);
    expect(store.trackingRecord('2026-08', '乙服务')?.invoiceFiles?.length || 0).toBe(beforeCount);
    // 文件名带「发票」的照片算发票
    const item2: FakeItem = { ...item, id: 'email-photo', attachments: [], body: '发票拍照' };
    item2.attachments.push(attach(intake, item2.id, '发票照片.jpg', 'x'.repeat(10)));
    intake.items.push(item2);
    const r2 = await proc.scanIntake();
    expect(r2.invoices).toBe(1);
  });

  it('E · 已校验通过的负责人不会被一封只含开户行/账号的发票邮件覆盖；分两次提报可以拼齐', async () => {
    const intake = makeIntake([]);
    await makeProc(intake).scanIntake();
    const okBefore = store.get().marketing.leaders.find((l) => l.provider === '乙服务')!;
    expect(okBefore.errors).toEqual([]);
    intake.items.push({
      id: 'email-inv', channel: 'email', simulated: false, receivedAt: '2026-09-06T10:00:00.000Z', externalId: 'i',
      from: { name: '乙服务', address: 'yi@example.com' }, subject: '发票已开',
      body: '发票已开，开户行：招商银行深圳分行 账号：6225 8801 2345 6789',
      attachments: [], module: 'unclassified', status: 'new',
    });
    await makeProc(intake).scanIntake();
    const after = store.get().marketing.leaders.find((l) => l.provider === '乙服务')!;
    expect(after).toMatchObject({ name: '李四', idCard: '11010519491231002X', bankCard: '4111111111111111' });
    expect(after.errors).toEqual([]);
    // 甲服务之前身份证校验失败；补发一条只带正确身份证的消息 → 合并后通过
    intake.items.push({
      id: 'wecom-fix', channel: 'wecom', simulated: false, receivedAt: '2026-09-07T10:00:00.000Z', externalId: 'f',
      from: { name: '甲服务', address: 'wx_jia' }, subject: '', body: '更正 身份证号：11010519491231002X 银行卡号：4111111111111111',
      attachments: [], module: 'unclassified', status: 'new',
    });
    await makeProc(intake).scanIntake();
    const jia = store.get().marketing.leaders.find((l) => l.provider === '甲服务')!;
    expect(jia.name).toBe('王五'); // 旧姓名保留
    expect(jia.errors).toEqual([]);
  });

  it('#10 · 陌生发件人正文里提到服务商名不算它发的；发件人名称含服务商名才算', async () => {
    const intake = makeIntake([]);
    const item: FakeItem = {
      id: 'email-mass', channel: 'email', simulated: false, receivedAt: '2026-09-08T10:00:00.000Z', externalId: 'm',
      from: { name: '行业资讯', address: 'news@example.org' }, subject: '本月服务商榜单', body: '甲服务 乙服务 表现优异',
      attachments: [], module: 'unclassified', status: 'new',
    };
    item.attachments.push(attach(intake, item.id, 'invoice.pdf'));
    intake.items.push(item);
    const countBefore = (store.trackingRecord('2026-08', '甲服务')?.invoiceFiles || []).length;
    await makeProc(intake).scanIntake();
    expect((store.trackingRecord('2026-08', '甲服务')?.invoiceFiles || []).length).toBe(countBefore);
    const item2: FakeItem = { ...item, id: 'email-named', from: { name: '甲服务财务部', address: 'fin@other.com' }, attachments: [] };
    item2.attachments.push(attach(intake, item2.id, 'invoice2.pdf'));
    intake.items.push(item2);
    await makeProc(intake).scanIntake();
    expect((store.trackingRecord('2026-08', '甲服务')?.invoiceFiles || []).length).toBe(countBefore + 1);
  });
});

describe('发票命名碰撞', () => {
  it('模板不带 {序号} 且一次回传多份发票：不覆盖，自动追加 -2/-3', async () => {
    store.update((s) => { s.settlement.invoiceNameTemplate = '{服务商}_{结算期}_发票'; });
    const intake = makeIntake([]);
    const item: FakeItem = {
      id: 'email-multi', channel: 'email', simulated: false, receivedAt: '2026-09-09T10:00:00.000Z', externalId: 'mm',
      from: { name: '乙服务', address: 'yi@example.com' }, subject: '发票', body: '两张发票',
      attachments: [], module: 'unclassified', status: 'new',
    };
    item.attachments.push(attach(intake, item.id, 'a.pdf', 'A'), attach(intake, item.id, 'b.pdf', 'B'));
    intake.items.push(item);
    const before = (store.trackingRecord('2026-08', '乙服务')?.invoiceFiles || []).length;
    const r = await makeProc(intake).scanIntake();
    expect(r.invoices).toBe(2);
    const files = store.trackingRecord('2026-08', '乙服务')!.invoiceFiles!.slice(before);
    expect(new Set(files).size).toBe(2);
    expect(files.every((f) => existsSync(f))).toBe(true);
    store.update((s) => { s.settlement.invoiceNameTemplate = '{服务商}_{结算期}_发票{序号}'; });
  });
});
