// @vitest-environment happy-dom
/**
 * 手机页 / 声纹采集页：
 *   ① 静态护栏：脚本与样式里不写中文（文案只在 text.ts）、用到的文案键都存在、脚本能编译、文案 JSON 不会提前闭合 <script>；
 *   ② 在 happy-dom 里真跑页面脚本（fetch / XHR 打桩）：卡片直达路由、按 can / my 显示按钮、本人发言定位与修改、
 *      令牌失效页、通讯录里没有这个人、声纹采集「授权 → 录音（系统录音入口）→ 提交不合格原样提示 → 重录 → 采集成功」。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Script } from 'node:vm';

vi.mock('../../../util/quitRegistry', () => ({ onAppWillQuit: () => {} }));

import { MM_MOBILE_TEXT, mmText } from './text';
import { MM_MOBILE_CSS } from './styles';
import { MM_CLIENT_COMMON_JS } from './clientCommon';
import { MM_APP_JS } from './appScript';
import { MM_VOICE_JS } from './voiceScript';
import { buildPageScript, scriptSafeJson, MEETING_MOBILE_APP_HTML, MEETING_VOICE_PAGE_HTML, MEETING_MOBILE_EXPIRED_HTML } from './pages';
import { MM_MOBILE_ACTIONS, mobileHashFor } from './server';

const CJK = new RegExp('[\\u3000-\\u303f\\u4e00-\\u9fff\\uff00-\\uffef]');

describe('静态护栏', () => {
  it('样式与脚本里不写中文：文案全部在 text.ts（以后翻译只动一个对象）', () => {
    for (const [name, src] of Object.entries({ MM_MOBILE_CSS, MM_CLIENT_COMMON_JS, MM_APP_JS, MM_VOICE_JS })) {
      const hit = src.split('\n').findIndex((l) => CJK.test(l));
      expect(hit, `${name} line ${hit + 1}`).toBe(-1);
    }
  });

  it('脚本里 tx(\'…\') 用到的文案键、lbl(\'…\') 用到的分组都存在', () => {
    const all = MM_CLIENT_COMMON_JS + MM_APP_JS + MM_VOICE_JS;
    // 以 . 结尾的是拼接前缀（tx('nav.' + x)），下面单独核对
    const keys = new Set([...all.matchAll(/\btx\('([A-Za-z0-9_.]+)'/g)].map((m) => m[1]).filter((k) => !k.endsWith('.')));
    expect(keys.size).toBeGreaterThan(100);
    // 先当字符串传、再在别处 tx(key) 的（stat(…, 'home.statTodos') / chip(…, 'meetings.filterAll') 等）：
    // 凡是「顶层分组.键」形状的字符串字面量都当文案键核对
    const groupsTop = new Set(Object.keys(MM_MOBILE_TEXT));
    // （api('meeting.get') 这类动作名不算：和文案分组同名而已）
    for (const m of all.matchAll(/(?<!api\()'([a-z][A-Za-z]*\.[A-Za-z_]+(?:\.[A-Za-z_]+)?)'/g)) {
      if (groupsTop.has(m[1].split('.')[0]) && !MM_MOBILE_ACTIONS.has(m[1])) keys.add(m[1]);
    }
    const missing = [...keys].filter((k) => mmText(k) === k);
    expect(missing).toEqual([]);
    const groups = new Set([...all.matchAll(/\blbl\('([A-Za-z0-9_]+)'/g)].map((m) => m[1]));
    for (const g of groups) expect(typeof (MM_MOBILE_TEXT as any)[g], g).toBe('object');
    // 拼接出来的键（tx('nav.' + x) / tx('voice.' + k)）
    for (const k of ['home', 'meetings', 'tasks', 'projects', 'me']) expect(mmText(`nav.${k}`)).not.toBe(`nav.${k}`);
    for (const k of ['purposeTitle', 'purpose', 'scopeTitle', 'scope', 'storeTitle', 'store', 'withdrawTitle', 'withdraw']) expect(mmText(`voice.${k}`)).not.toBe(`voice.${k}`);
  });

  it('两个页面脚本能编译；页面里只有一段 <script>，文案 JSON 里的 < 已转义', () => {
    expect(() => new Script(buildPageScript(MM_APP_JS))).not.toThrow();
    expect(() => new Script(buildPageScript(MM_VOICE_JS))).not.toThrow();
    for (const html of [MEETING_MOBILE_APP_HTML, MEETING_VOICE_PAGE_HTML]) {
      expect(html.match(/<script>/g)?.length).toBe(1);
      expect(html.match(/<\/script>/g)?.length).toBe(1);
      expect(html).not.toMatch(/<script[^>]+src=/);
      expect(html).not.toMatch(/https?:\/\//);
    }
    expect(scriptSafeJson({ a: '</script><b>' })).toBe('{"a":"\\u003c/script>\\u003cb>"}');
    expect(MEETING_MOBILE_EXPIRED_HTML).toContain('链接已失效，请在企微里重新打开');
  });
});

// ─── 在 happy-dom 里真跑页面 ─────────────────────────────────────────

type Responder = (action: string, payload: any) => { status?: number; body: unknown } | unknown;
interface Mounted { calls: Array<{ action: string; payload: any }> }

const ME = { id: 'p1', name: '赵磊', deptId: 'd1' };
const BOOT = { me: { person: ME, isAdmin: false, canCreateProject: false }, badges: { home: 2, meetings: 1, tasks: 1 } };
const PEOPLE = {
  depts: [{ id: 'd1', name: '研发部', leaderIds: ['p1'] }],
  people: [ME, { id: 'p2', name: '李娜', deptId: 'd1' }],
};

function mount(pageJs: string, url: string, responder: Responder): Mounted {
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', url);
  const calls: Mounted['calls'] = [];
  (globalThis as any).fetch = vi.fn(async (u: string, init?: any) => {
    // 页面用相对路径（api/meta），这样挂在 https 反代的子路径下也能用
    if (/^api\/meta/.test(String(u))) return { status: 200, ok: true, json: async () => ({ maxUploadBytes: 10_000_000, httpsBase: (globalThis as any).__mmHttpsBase || '' }) };
    if (String(u).startsWith('/')) throw new Error(`absolute url ${u}`);
    const body = JSON.parse(init?.body || '{}');
    calls.push({ action: body.action, payload: body.payload });
    let r: any = responder(body.action, body.payload);
    if (!r || typeof r !== 'object' || !('body' in r)) r = { status: 200, body: { ok: true, data: r ?? null } };
    const status = r.status ?? 200;
    return { status, ok: status >= 200 && status < 300, json: async () => r.body };
  });
  // eslint-disable-next-line no-new-func
  new Function(buildPageScript(pageJs))();
  return { calls };
}

async function waitFor<T>(fn: () => T | null | undefined | false, ms = 3000): Promise<T> {
  const t0 = Date.now();
  for (;;) {
    const v = fn();
    if (v) return v as T;
    if (Date.now() - t0 > ms) throw new Error(`waitFor timeout; app = ${document.getElementById('app')?.innerHTML.slice(0, 400)}`);
    await new Promise((r) => setTimeout(r, 10));
  }
}
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null;

beforeEach(() => {
  document.querySelectorAll('.mask,.toast').forEach((n) => n.remove());
});

describe('手机页（H5）', () => {
  it('页面里的 linkHash 与服务端 mobileHashFor 一致（企微卡片直达）', async () => {
    mount(MM_APP_JS, '/m?t=tok#/me', (a) => (a === 'boot' ? BOOT : a === 'people.list' ? PEOPLE : a === 'voiceprint.list' ? [] : null));
    await waitFor(() => (window as any).__mmApp);
    const links = [
      { kind: 'meeting', id: 'm1' }, { kind: 'meeting', id: 'm 1', anchor: 's/2' }, { kind: 'meeting_plan', id: 'm1' },
      { kind: 'task', id: 't1' }, { kind: 'project', id: 'p1' }, { kind: 'project_summary', id: 'p1' }, { kind: 'report', id: 'p1', anchor: 'r1' },
    ] as const;
    for (const l of links) expect((window as any).__mmApp.linkHash(l)).toBe(mobileHashFor(l as any));
  });

  it('新任务待接收：按 can 显示「提出异议 / 确认接收」，不显示无权的按钮', async () => {
    const task = {
      id: 't1', title: '完成 3 项设计变更方案并验证', status: 'to_accept', percent: 0, due: '2026-11-22', overdue: false, overdueDays: 0,
      deptName: '研发部', assigneeName: '赵磊', ownerName: '刘洋', ownerId: 'p3', assigneeId: 'p1', meetingId: 'm1', meetingTitle: '第 3 次周例会',
      projectId: 'pr1', projectName: 'A2 量产导入', standard: '变更方案评审通过', progressLog: [], events: [], objectionHistory: [],
    };
    mount(MM_APP_JS, '/m?t=tok#/task/t1', (a, p) => {
      if (a === 'boot') return BOOT;
      if (a === 'people.list') return PEOPLE;
      if (a === 'task.get') { expect(p).toEqual({ id: 't1' }); return { task, names: {}, can: { accept: true, object: true } }; }
      return null;
    });
    await waitFor(() => $('[data-act="accept"]'));
    expect($('[data-act="object"]')).not.toBeNull();
    expect($('[data-act="progress"]')).toBeNull();
    expect($('[data-act="arbKeep"]')).toBeNull();
    expect(document.body.textContent).toContain('完成 3 项设计变更方案并验证');
    expect(document.body.textContent).toContain('待接收');
  });

  it('发言待确认：定位到本人发言（anchor），只有本人发言可改；修改走 meeting.segment.edit；底部有「提交确认」', async () => {
    const meeting = {
      id: 'm1', projectId: 'pr1', title: 'A2 量产导入第 3 次周例会', time: Date.now(), source: 'offline', hostId: 'p2', attendeeIds: ['p1', 'p2'],
      status: 'pending_confirm', files: [], taskIds: [], topics: [], decisions: [], summaryLines: [],
      speakers: [{ label: 'S1', personId: 'p2' }, { label: 'S2', personId: 'p1' }],
      segments: [
        { id: 's1', start: 72, end: 90, speakerLabel: 'S1', text: '今天主要过三件事' },
        { id: 's2', start: 220, end: 240, speakerLabel: 'S2', text: '11 月 20 日前完成验证' },
      ],
      confirmations: [{ personId: 'p1', status: 'pending' }, { personId: 'p2', status: 'confirmed', confirmedAt: Date.now() }],
    };
    const m = mount(MM_APP_JS, '/m?t=tok#/meeting/m1?anchor=s2', (a) => {
      if (a === 'boot') return BOOT;
      if (a === 'people.list') return PEOPLE;
      if (a === 'meeting.get') {
        return { meeting, projectName: 'A2', projectStatus: 'active', names: { p1: { name: '赵磊' }, p2: { name: '李娜' } },
          my: { isHost: false, isSpeaker: true, isPlanOwner: false, myLabels: ['S2'] }, confirm: { done: 1, total: 2 }, tasks: [] };
      }
      return { ok: true };
    });
    const mine = await waitFor(() => $('#seg-s2'));
    expect(mine.className).toContain('mine');
    expect(mine.className).toContain('flash');
    expect(mine.querySelector('[data-act="segEdit"]')).not.toBeNull();
    expect($('#seg-s1')!.querySelector('[data-act="segEdit"]')).toBeNull();
    expect($('[data-act="confirmMine"]')).not.toBeNull();
    expect(document.body.textContent).toContain('发言人确认 1/2');

    (mine.querySelector('[data-act="segEdit"]') as HTMLElement).click();
    const ta = await waitFor(() => mine.querySelector('textarea') as HTMLTextAreaElement | null);
    ta.value = '11 月 22 日前完成验证';
    (mine.querySelector('[data-act="segSave"]') as HTMLElement).click();
    await waitFor(() => m.calls.find((c) => c.action === 'meeting.segment.edit'));
    expect(m.calls.find((c) => c.action === 'meeting.segment.edit')!.payload).toEqual({ id: 'm1', segmentId: 's2', text: '11 月 22 日前完成验证' });
  });

  it('发言待确认（手机）：本人确认过也能补全本人发言；主持人每段都能改', async () => {
    const meeting = {
      id: 'm1', projectId: 'pr1', title: '周例会', time: Date.now(), source: 'offline', hostId: 'p2', attendeeIds: ['p1', 'p2'],
      status: 'pending_confirm', files: [], taskIds: [], topics: [], decisions: [], summaryLines: [],
      speakers: [{ label: 'S1', personId: 'p2' }, { label: 'S2', personId: 'p1' }],
      segments: [
        { id: 's1', start: 72, end: 90, speakerLabel: 'S1', text: '今天主要过三件事' },
        { id: 's2', start: 220, end: 240, speakerLabel: 'S2', text: '11 月 20 日前完成验证' },
      ],
      confirmations: [{ personId: 'p1', status: 'confirmed', confirmedAt: Date.now() }, { personId: 'p2', status: 'pending' }],
    };
    const detail = (my: any) => ({ meeting, projectName: 'A2', projectStatus: 'active', names: { p1: { name: '赵磊' }, p2: { name: '李娜' } }, my, confirm: { done: 1, total: 2 }, tasks: [] });
    // 赵磊（p1）已确认：本人段仍可改，别人的不行
    mount(MM_APP_JS, '/m?t=tok#/meeting/m1', (a) => (a === 'boot' ? BOOT : a === 'people.list' ? PEOPLE : a === 'meeting.get' ? detail({ isHost: false, isSpeaker: true, myLabels: ['S2'] }) : { ok: true }));
    const mine = await waitFor(() => $('#seg-s2'));
    expect(mine.querySelector('[data-act="segEdit"]')).not.toBeNull();
    expect($('#seg-s1')!.querySelector('[data-act="segEdit"]')).toBeNull();
    // 主持人：每段都能改
    mount(MM_APP_JS, '/m?t=tok#/meeting/m1', (a) => (a === 'boot' ? BOOT : a === 'people.list' ? PEOPLE : a === 'meeting.get' ? detail({ isHost: true, isSpeaker: true, myLabels: ['S1'] }) : { ok: true }));
    await waitFor(() => $('#seg-s1') && $('#seg-s1')!.querySelector('[data-act="segEdit"]'));
    expect($('#seg-s2')!.querySelector('[data-act="segEdit"]')).not.toBeNull();
  });

  it('任务负责人可多位（手机）：待确认时横幅列出全部负责人；主持人指定时是多选、带上原来的人，提交 ownerIds', async () => {
    const base = {
      id: 'm1', projectId: 'pr1', title: '周例会', time: Date.now(), source: 'offline', hostId: 'p1', attendeeIds: ['p1', 'p2'],
      files: [], taskIds: [], topics: [], decisions: [], summaryLines: [], speakers: [], segments: [], confirmations: [],
    };
    const detail = (meeting: any, my: any) => ({ meeting, projectName: 'A2', projectStatus: 'active', names: { p1: { name: '赵磊' }, p2: { name: '李娜' } }, my, confirm: { done: 0, total: 0 }, tasks: [] });
    // 待确认、我不是负责人：横幅里两位都在
    const plan = { generatedAt: 1, summary: '', items: [{ id: 'i1', deptId: 'd1', title: '设备到货', standard: '', due: '2026-12-01' }], ownerId: 'p1', ownerIds: ['p1', 'p2'] };
    mount(MM_APP_JS, '/m?t=tok#/meeting/m1', (a) => (a === 'boot' ? BOOT : a === 'people.list' ? PEOPLE : a === 'meeting.get' ? detail({ ...base, status: 'plan_confirm', plan }, { isHost: false, isSpeaker: false, isPlanOwner: false, myLabels: [] }) : { ok: true }));
    await waitFor(() => document.body.textContent?.includes('执行方案待任务负责人 赵磊、李娜 确认'));
    // 待指定、我是主持人：多选、已选的人勾上
    const m = mount(MM_APP_JS, '/m?t=tok#/meeting/m1', (a) => (a === 'boot' ? BOOT : a === 'people.list' ? PEOPLE : a === 'meeting.get' ? detail({ ...base, status: 'pending_owner', plan: { ...plan, ownerIds: ['p1'] } }, { isHost: true, isSpeaker: false, isPlanOwner: false, myLabels: [] }) : { ok: true }));
    (await waitFor(() => $('[data-act="pickOwner"]')) as HTMLElement).click();
    const boxes = await waitFor(() => { const l = document.querySelectorAll('.pick-row input'); return l.length ? [...l] as HTMLInputElement[] : null; });
    expect(boxes.every((x) => x.type === 'checkbox')).toBe(true);
    expect(boxes.find((x) => x.value === 'p1')!.checked).toBe(true);
    const p2 = boxes.find((x) => x.value === 'p2')!;
    p2.checked = true;
    p2.dispatchEvent(new Event('change', { bubbles: true }));
    ((document.querySelector('.sheet-f [data-i="1"]')) as HTMLElement).click();
    await waitFor(() => m.calls.find((c) => c.action === 'meeting.plan.owner'));
    expect(m.calls.find((c) => c.action === 'meeting.plan.owner')!.payload).toEqual({ id: 'm1', ownerIds: ['p1', 'p2'] });
  });

  it('令牌失效（接口 401）→ 整页显示「链接已失效，请在企微里重新打开」', async () => {
    mount(MM_APP_JS, '/m?t=old#/home', () => ({ status: 401, body: { ok: false, error: 'UNAUTHORIZED' } }));
    await waitFor(() => document.body.textContent?.includes('链接已失效，请在企微里重新打开'));
  });

  it('通讯录里没有这个人 → 提示联系管理员同步通讯录', async () => {
    mount(MM_APP_JS, '/m?t=tok#/home', (a) => (a === 'boot' ? { ...BOOT, me: { person: null, isAdmin: false, canCreateProject: false } } : null));
    await waitFor(() => document.body.textContent?.includes('请联系管理员同步通讯录'));
  });
});

describe('声纹采集页', () => {
  class FakeXHR {
    static bodies: unknown[] = [];
    upload: { onprogress: ((e: any) => void) | null } = { onprogress: null };
    status = 0;
    responseText = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    open() { /* */ }
    setRequestHeader() { /* */ }
    send(body: unknown) {
      FakeXHR.bodies.push(body);
      setTimeout(() => {
        this.upload.onprogress?.({ lengthComputable: true, loaded: 3, total: 3 });
        this.status = 200;
        this.responseText = JSON.stringify({ ok: true, data: { path: '/up/p-0123456789ab/20261116-101010-abcdef-a.m4a', name: 'a.m4a', size: 3 } });
        this.onload?.();
      }, 0);
    }
  }

  it('授权 → 录音（局域网 http 下走系统录音入口）→ 不合格原样提示 → 重录 → 采集成功', async () => {
    (globalThis as any).XMLHttpRequest = FakeXHR;
    (URL as any).createObjectURL = vi.fn(() => 'blob:fake');
    (URL as any).revokeObjectURL = vi.fn();
    let enrollTimes = 0;
    const m = mount(MM_VOICE_JS, '/v?t=tok', (a, p) => {
      if (a === 'boot') return BOOT;
      if (a === 'people.list') return PEOPLE;
      if (a === 'voiceprint.list') return { status: 400, body: { ok: false, error: '只有管理员可以查看' } };
      if (a === 'voiceprint.enroll') {
        expect(p).toEqual({ personId: 'p1', path: '/up/p-0123456789ab/20261116-101010-abcdef-a.m4a', consent: true });
        enrollTimes++;
        if (enrollTimes === 1) return { status: 400, body: { ok: false, error: '没有检测到人声，请在安静的地方重录' } };
        return { personId: 'p1', sampleSeconds: 12, consentAt: Date.now(), enrolledAt: Date.now() };
      }
      return null;
    });
    // ① 授权
    const agree = await waitFor(() => $('#agree') as HTMLInputElement | null);
    expect(document.body.textContent).toContain('采集用途');
    expect(document.body.textContent).toContain('授权人：赵磊 · 研发部');
    const startBtn = $('#start') as HTMLButtonElement;
    expect(startBtn.disabled).toBe(true);
    // 会议补充写在同一份说明里，不单独勾
    expect($('#learn')).toBeNull();
    expect(document.body.textContent).toContain('确认过的会议发言会用来补充你的声纹');
    agree.checked = true;
    agree.dispatchEvent(new Event('change'));
    expect(startBtn.disabled).toBe(false);
    startBtn.click();
    // ② 录音：局域网 http 不给麦克风 → 说明原因；安卓浏览器给系统录音机入口（只收音频）+ 选录音文件；绝不出现录像
    const rec = await waitFor(() => $('#f-rec') as HTMLInputElement | null);
    expect(rec.getAttribute('accept')).toBe('audio/*');
    expect(rec.hasAttribute('capture')).toBe(true);
    expect(document.body.textContent).toContain('手机浏览器不允许网页直接录音');
    expect(($('#f-pick') as HTMLInputElement).getAttribute('accept')).toBe('audio/*');
    expect(document.querySelector('input[accept*="video"]')).toBeNull();
    expect(document.body.textContent).toContain('我是研发部的赵磊');
    const pick = (input: HTMLInputElement) => {
      Object.defineProperty(input, 'files', { configurable: true, value: [new File(['abc'], 'a.m4a', { type: 'audio/mp4' })] });
      input.dispatchEvent(new Event('change'));
    };
    pick(rec);
    // ③ 试听并提交：第一次质量不合格，原因原样显示，主按钮变成「重新录制」
    (await waitFor(() => $('[data-v="submit"]'))).click();
    await waitFor(() => document.body.textContent?.includes('没有检测到人声，请在安静的地方重录'));
    expect(document.body.textContent).toContain('录音不合格，请重录');
    expect($('[data-v="rerecord"]')!.className).toContain('pri');
    $('[data-v="rerecord"]')!.click();
    pick(await waitFor(() => $('#f-pick') as HTMLInputElement | null));
    (await waitFor(() => $('[data-v="submit"]'))).click();
    // ④ 完成
    await waitFor(() => document.body.textContent?.includes('采集成功'));
    expect(document.body.textContent).toContain('有效语音 12 秒');
    expect(enrollTimes).toBe(2);
    expect(FakeXHR.bodies.length).toBe(2);
    expect(m.calls.filter((c) => c.action === 'voiceprint.enroll').length).toBe(2);
  });

  it('企业微信 / iPhone 里（http）：不给会打开相机的录音入口、也没有录像；有 https 外网地址就给「用 https 地址打开」', async () => {
    const ua = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(navigator), 'userAgent');
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (Linux; Android 14) wxwork/4.1.30 MicroMessenger/7.0.1' });
    (globalThis as any).__mmHttpsBase = 'https://taituai.com/mm';
    try {
      mount(MM_VOICE_JS, '/v?t=tok', (a) => (a === 'boot' ? BOOT : a === 'people.list' ? PEOPLE : a === 'voiceprint.list' ? { status: 400, body: { ok: false, error: 'x' } } : null));
      const agree = await waitFor(() => $('#agree') as HTMLInputElement | null);
      agree.checked = true;
      agree.dispatchEvent(new Event('change'));
      ($('#start') as HTMLButtonElement).click();
      const open = await waitFor(() => document.querySelector('a[href^="https://taituai.com/mm/v?t=tok"]') as HTMLAnchorElement | null);
      expect(open.textContent).toContain('用 https 地址打开');
      expect($('#f-rec')).toBeNull();
      expect(document.querySelector('input[accept*="video"]')).toBeNull();
      expect(document.querySelector('input[capture]')).toBeNull();
      expect(($('#f-pick') as HTMLInputElement).getAttribute('accept')).toBe('audio/*');
      expect(document.body.textContent).toContain('语音备忘录');
    } finally {
      delete (globalThis as any).__mmHttpsBase;
      if (ua) Object.defineProperty(Object.getPrototypeOf(navigator), 'userAgent', ua);
      delete (navigator as any).userAgent;
    }
  });

  it('https（安全上下文）：页面里直接录音；麦克风被拒绝 → 说明怎么开、可重试，仍然没有录像', async () => {
    const restore: Array<() => void> = [];
    const def = (o: any, k: string, v: any) => { const d = Object.getOwnPropertyDescriptor(o, k); Object.defineProperty(o, k, { configurable: true, value: v }); restore.push(() => (d ? Object.defineProperty(o, k, d) : delete o[k])); };
    def(window, 'isSecureContext', true);
    const getUserMedia = vi.fn(async () => { throw new Error('NotAllowedError'); });
    def(navigator, 'mediaDevices', { getUserMedia });
    def(window, 'MediaRecorder', function MediaRecorder() {});
    try {
      mount(MM_VOICE_JS, '/v?t=tok', (a) => (a === 'boot' ? BOOT : a === 'people.list' ? PEOPLE : a === 'voiceprint.list' ? { status: 400, body: { ok: false, error: 'x' } } : null));
      const agree = await waitFor(() => $('#agree') as HTMLInputElement | null);
      agree.checked = true;
      agree.dispatchEvent(new Event('change'));
      ($('#start') as HTMLButtonElement).click();
      const recBtn = await waitFor(() => $('[data-v="recStart"]'));
      expect(document.querySelector('input[accept*="video"]')).toBeNull();
      recBtn.click();
      await waitFor(() => document.body.textContent?.includes('没有拿到麦克风权限：请在弹窗里允许使用麦克风'));
      expect(getUserMedia).toHaveBeenCalled();
      expect($('[data-v="micRetry"]')).not.toBeNull();
      expect(document.querySelector('input[accept*="video"]')).toBeNull();
      ($('[data-v="micRetry"]') as HTMLElement).click();
      await waitFor(() => $('[data-v="recStart"]'));
    } finally {
      restore.reverse().forEach((f) => f());
    }
  });

  it('系统里没有这个人 → 提示联系管理员同步通讯录', async () => {
    mount(MM_VOICE_JS, '/v?t=tok', (a) => (a === 'boot' ? { ...BOOT, me: { person: null, isAdmin: false, canCreateProject: false } } : null));
    await waitFor(() => document.body.textContent?.includes('请联系管理员同步通讯录'));
    expect(document.body.textContent).toContain('系统里没有找到你的信息');
  });

  it('令牌失效 → 失效页', async () => {
    mount(MM_VOICE_JS, '/v?t=old', () => ({ status: 401, body: { ok: false, error: 'UNAUTHORIZED' } }));
    await waitFor(() => document.body.textContent?.includes('链接已失效，请在企微里重新打开'));
  });
});
