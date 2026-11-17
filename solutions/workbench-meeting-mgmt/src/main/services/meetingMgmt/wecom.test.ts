import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MmOrg, MmPerson } from '../../../shared/meetingMgmt/types';
import { TEXTCARD_LIMITS, WecomClient, clearWecomTokenCache, diffOrg, formatTextcardDescription, wecomErrorText } from './wecom';

type Handler = (url: URL, body: any) => unknown;

/** 企微接口打桩：按路径（gettoken / department/list …）返回 JSON；记录每次调用 */
function stub(routes: Record<string, Handler | unknown>) {
  const calls: Array<{ api: string; url: URL; body: any; method: string }> = [];
  const fn = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const api = url.pathname.replace(/^\/cgi-bin\//, '');
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ api, url, body, method: init?.method ?? 'GET' });
    const route = routes[api];
    if (route === undefined) return new Response(JSON.stringify({ errcode: 404, errmsg: `no stub ${api}` }), { status: 200 });
    const data = typeof route === 'function' ? (route as Handler)(url, body) : route;
    if (data instanceof Response) return data;
    return new Response(JSON.stringify(data), { status: 200 });
  });
  return { fetch: fn as unknown as typeof fetch, calls, count: (api: string) => calls.filter((c) => c.api === api).length };
}

const cfg = { corpId: 'ww123', agentId: '1000002', secret: 's3cret' };
const ok = (extra: Record<string, unknown> = {}) => ({ errcode: 0, errmsg: 'ok', ...extra });
let tokenSeq = 0;
const gettoken = () => ok({ access_token: `tok${++tokenSeq}`, expires_in: 7200 });

const DEPTS = [
  { id: 1, name: '速腾总部', parentid: 0, department_leader: ['ceo'] },
  { id: 2, name: '研发部', parentid: 1, department_leader: ['lin', 'zhou'] },
  { id: 3, name: '市场部', parentid: 1 }, // 拿不到 department_leader
];
const USERS: Record<string, unknown[]> = {
  '1': [{ userid: 'ceo', name: '陈总', department: [1], main_department: 1, position: '总经理' }],
  '2': [
    { userid: 'lin', name: '林晓', department: [2, 3], main_department: 2, position: '研发总监', direct_leader: ['ceo'], is_leader_in_dept: [1, 0] },
    { userid: 'zhou', name: '周宁', department: [2], is_leader_in_dept: [1], direct_leader: [] },
    { userid: 'gone', name: '离开的人', department: [2], status: 5 },
  ],
  '3': [
    { userid: 'lin', name: '林晓', department: [2, 3], main_department: 2 }, // 跨部门重复出现
    { userid: 'wang', department: [3], is_leader_in_dept: [1], order: [10] }, // 没有姓名 / 职务（权限收紧）
    { userid: 'li', name: '李娜', department: [3], is_leader_in_dept: [1], order: [50] },
  ],
};
const baseRoutes = (): Record<string, Handler | unknown> => ({
  gettoken,
  'department/list': ok({ department: DEPTS }),
  'user/list': (u: URL) => ok({ userlist: USERS[u.searchParams.get('department_id') ?? ''] ?? [] }),
  'agent/get': ok({ agentid: 1000002, name: '会议助手', close: 0, allow_partys: { partyid: [1] }, allow_userinfos: { user: [] }, allow_tags: { tagid: [] } }),
  'message/send': ok({ invaliduser: '', msgid: 'm1' }),
});

beforeEach(() => { clearWecomTokenCache(); tokenSeq = 0; });
afterEach(() => { vi.useRealTimers(); });

describe('access_token 缓存与刷新', () => {
  it('同一配置只取一次令牌（跨客户端实例共享），带在后续请求上', async () => {
    const s = stub(baseRoutes());
    await new WecomClient(cfg, s.fetch).fetchOrg();
    await new WecomClient(cfg, s.fetch).fetchOrg();
    expect(s.count('gettoken')).toBe(1);
    const tokenCall = s.calls.find((c) => c.api === 'gettoken')!;
    expect(tokenCall.url.searchParams.get('corpid')).toBe('ww123');
    expect(tokenCall.url.searchParams.get('corpsecret')).toBe('s3cret');
    expect(s.calls.find((c) => c.api === 'department/list')!.url.searchParams.get('access_token')).toBe('tok1');
  });

  it('缓存到过期前 5 分钟：之前复用，之后重新取', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T09:00:00Z'));
    const s = stub(baseRoutes());
    const c = new WecomClient(cfg, s.fetch);
    await c.sendCard(['lin'], { title: 't', description: 'd', url: 'https://x.test/a' });
    vi.setSystemTime(Date.now() + (7200 - 300) * 1000 - 1000);
    await c.sendCard(['lin'], { title: 't', description: 'd', url: 'https://x.test/a' });
    expect(s.count('gettoken')).toBe(1);
    vi.setSystemTime(Date.now() + 2000);
    await c.sendCard(['lin'], { title: 't', description: 'd', url: 'https://x.test/a' });
    expect(s.count('gettoken')).toBe(2);
    expect(s.calls.filter((x) => x.api === 'message/send').at(-1)!.url.searchParams.get('access_token')).toBe('tok2');
  });

  it.each([42001, 40014])('令牌失效（%i）：作废缓存、换新令牌重试一次', async (code) => {
    let n = 0;
    const s = stub({ ...baseRoutes(), 'department/list': () => (++n === 1 ? { errcode: code, errmsg: 'access_token expired' } : ok({ department: DEPTS })) });
    const org = await new WecomClient(cfg, s.fetch).fetchOrg();
    expect(org.depts).toHaveLength(3);
    expect(s.count('gettoken')).toBe(2);
    expect(s.count('department/list')).toBe(2);
  });

  it('换新令牌后仍失效：只重试一次，然后报中文错误', async () => {
    const s = stub({ ...baseRoutes(), 'department/list': { errcode: 42001, errmsg: 'expired' } });
    await expect(new WecomClient(cfg, s.fetch).fetchOrg()).rejects.toThrow('访问令牌已失效');
    expect(s.count('department/list')).toBe(2);
    expect(s.count('gettoken')).toBe(2);
  });

  it('并发请求只取一次令牌', async () => {
    const s = stub(baseRoutes());
    const c = new WecomClient(cfg, s.fetch);
    await Promise.all([c.sendCard(['a'], { title: 't', description: 'd', url: 'https://x.test' }), c.sendCard(['b'], { title: 't', description: 'd', url: 'https://x.test' })]);
    expect(s.count('gettoken')).toBe(1);
  });
});

describe('fetchOrg', () => {
  it('部门：上级、负责人顺序；成员：主部门、职务、直属上级；去重、排除已退出', async () => {
    const s = stub(baseRoutes());
    const { depts, people } = await new WecomClient(cfg, s.fetch).fetchOrg();
    expect(depts.find((d) => d.id === '1')).toEqual({ id: '1', name: '速腾总部', leaderIds: ['ceo'] });
    expect(depts.find((d) => d.id === '2')).toEqual({ id: '2', name: '研发部', parentId: '1', leaderIds: ['lin', 'zhou'] });
    const ids = people.map((p) => p.id).sort();
    expect(ids).toEqual(['ceo', 'li', 'lin', 'wang', 'zhou']);
    const lin = people.find((p) => p.id === 'lin')!;
    expect(lin).toEqual({ id: 'lin', name: '林晓', deptId: '2', title: '研发总监', leaderId: 'ceo', wecomUserId: 'lin' });
    // 拿不到的字段留空：姓名用 userid 代替、没有职务 / 上级
    const wang = people.find((p) => p.id === 'wang')!;
    expect(wang).toEqual({ id: 'wang', name: 'wang', deptId: '3', wecomUserId: 'wang' });
    expect(people.find((p) => p.id === 'zhou')!.leaderId).toBeUndefined();
  });

  it('部门负责人字段拿不到时，用成员 is_leader_in_dept 补（按部门内排序值从大到小）', async () => {
    const s = stub(baseRoutes());
    const { depts } = await new WecomClient(cfg, s.fetch).fetchOrg();
    expect(depts.find((d) => d.id === '3')!.leaderIds).toEqual(['li', 'wang']);
  });

  it('没有主部门：取第一个能看到的部门', async () => {
    const s = stub({ ...baseRoutes(), 'user/list': (u: URL) => ok({ userlist: u.searchParams.get('department_id') === '3' ? [{ userid: 'x', name: 'X', department: [99, 3] }] : [] }) });
    const { people } = await new WecomClient(cfg, s.fetch).fetchOrg();
    expect(people).toEqual([{ id: 'x', name: 'X', deptId: '3', wecomUserId: 'x' }]);
  });

  it('某个部门没有查看权限：跳过这个部门；全部都没有权限才报错', async () => {
    const partial = stub({ ...baseRoutes(), 'user/list': (u: URL) => (u.searchParams.get('department_id') === '3' ? { errcode: 60011, errmsg: 'no privilege' } : ok({ userlist: USERS[u.searchParams.get('department_id')!] })) });
    const r = await new WecomClient(cfg, partial.fetch).fetchOrg();
    expect(r.people.map((p) => p.id).sort()).toEqual(['ceo', 'lin', 'zhou']);
    clearWecomTokenCache();
    const none = stub({ ...baseRoutes(), 'user/list': { errcode: 60011, errmsg: 'no privilege' } });
    await expect(new WecomClient(cfg, none.fetch).fetchOrg()).rejects.toThrow('没有通讯录权限');
  });

  it('user/list 被拒（48009）→ user/list_id 分页 + user/get 逐个读', async () => {
    const s = stub({
      ...baseRoutes(),
      'user/list': { errcode: 48009, errmsg: 'api forbidden' },
      'user/list_id': (_u: URL, body: any) => (body?.cursor
        ? ok({ next_cursor: '', dept_user: [{ userid: 'zhou', department: 2 }] })
        : ok({ next_cursor: 'c2', dept_user: [{ userid: 'lin', department: 2 }, { userid: 'lin', department: 3 }, { userid: 'nobody', department: 2 }] })),
      'user/get': (u: URL) => {
        const id = u.searchParams.get('userid');
        if (id === 'nobody') return { errcode: 60111, errmsg: 'userid not found' };
        return ok(id === 'lin' ? { userid: 'lin', name: '林晓', department: [2, 3], main_department: 2, position: '研发总监' } : { userid: 'zhou', name: '周宁', department: [2] });
      },
    });
    const { people } = await new WecomClient(cfg, s.fetch).fetchOrg();
    expect(people.map((p) => p.id).sort()).toEqual(['lin', 'zhou']);
    expect(s.count('user/list_id')).toBe(2);
    expect(s.calls.filter((c) => c.api === 'user/list_id')[1].body).toEqual({ cursor: 'c2', limit: 10000 });
    expect(s.count('user/get')).toBe(3);
  });

  it('department/list 被拒（48009）→ department/simplelist + department/get', async () => {
    const s = stub({
      ...baseRoutes(),
      'department/list': { errcode: 48009, errmsg: 'forbidden' },
      'department/simplelist': ok({ department_id: [{ id: 1, parentid: 0 }, { id: 2, parentid: 1 }] }),
      'department/get': (u: URL) => (u.searchParams.get('id') === '2' ? ok({ department: { id: 2, name: '研发部', parentid: 1, department_leader: ['lin'] } }) : { errcode: 60011, errmsg: 'no privilege' }),
    });
    const { depts } = await new WecomClient(cfg, s.fetch).fetchOrg();
    expect(depts).toEqual([
      { id: '1', name: '1', leaderIds: [] }, // 详情读不到：名称用 id 代替，不让整个同步失败
      { id: '2', name: '研发部', parentId: '1', leaderIds: ['lin'] },
    ]);
  });

  it('一个部门都读不到：提示设置应用可见范围', async () => {
    const s = stub({ ...baseRoutes(), 'department/list': ok({ department: [] }) });
    await expect(new WecomClient(cfg, s.fetch).fetchOrg()).rejects.toThrow('可见范围');
  });

  it('IP 不在可信 IP：错误里带上本机出口 IP', async () => {
    const s = stub({ ...baseRoutes(), 'department/list': { errcode: 60020, errmsg: 'not allow to access from your ip, hint: [x], from ip: 203.0.113.7, more info at https://open.work.weixin.qq.com/devtool/query?e=60020' } });
    await expect(new WecomClient(cfg, s.fetch).fetchOrg()).rejects.toThrow(/203\.0\.113\.7.*企业可信 IP/);
  });

  it('没填 CorpID / Secret：不发请求直接报错', async () => {
    const s = stub(baseRoutes());
    await expect(new WecomClient({ ...cfg, corpId: ' ' }, s.fetch).fetchOrg()).rejects.toThrow('CorpID');
    await expect(new WecomClient({ ...cfg, secret: '' }, s.fetch).fetchOrg()).rejects.toThrow('Secret');
    expect(s.calls).toHaveLength(0);
  });
});

describe('test()', () => {
  it('令牌 + 应用详情都正常 → ok，带应用名', async () => {
    const s = stub(baseRoutes());
    expect(await new WecomClient(cfg, s.fetch).test()).toEqual({ ok: true, agentName: '会议助手' });
    expect(s.calls.find((c) => c.api === 'agent/get')!.url.searchParams.get('agentid')).toBe('1000002');
  });

  it.each([
    [{ gettoken: { errcode: 40001, errmsg: 'invalid credential' } }, 'Secret 不正确'],
    [{ gettoken: { errcode: 40013, errmsg: 'invalid corpid' } }, 'CorpID 不正确'],
    [{ 'agent/get': { errcode: 301002, errmsg: 'not allow operate another agent' } }, '不属于同一个应用'],
    [{ 'agent/get': { errcode: 60020, errmsg: 'from ip: 198.51.100.2' } }, '198.51.100.2'],
    [{ 'agent/get': ok({ name: '会议助手', close: 1 }) }, '已被禁用'],
    [{ 'agent/get': ok({ name: '会议助手', allow_partys: { partyid: [] }, allow_userinfos: { user: [] }, allow_tags: { tagid: [] } }) }, '可见范围为空'],
  ])('常见错误转中文：%#', async (over, text) => {
    const s = stub({ ...baseRoutes(), ...over });
    const r = await new WecomClient(cfg, s.fetch).test();
    expect(r.ok).toBe(false);
    expect(r.error).toContain(text);
  });

  it('AgentId 不是数字 → 不发请求直接报错', async () => {
    const s = stub(baseRoutes());
    const r = await new WecomClient({ ...cfg, agentId: 'abc' }, s.fetch).test();
    expect(r).toMatchObject({ ok: false });
    expect(r.error).toContain('AgentId');
    expect(s.calls).toHaveLength(0);
  });

  it('网络不通 / HTTP 错误 / 非 JSON → 中文原因', async () => {
    const down = vi.fn(async () => { throw new TypeError('fetch failed'); }) as unknown as typeof fetch;
    expect((await new WecomClient(cfg, down).test()).error).toContain('连不上企业微信');
    clearWecomTokenCache();
    const http = stub({ ...baseRoutes(), gettoken: new Response('bad gateway', { status: 502 }) });
    expect((await new WecomClient(cfg, http.fetch).test()).error).toContain('HTTP 502');
    clearWecomTokenCache();
    const html = stub({ ...baseRoutes(), gettoken: new Response('<html>', { status: 200 }) });
    expect((await new WecomClient(cfg, html.fetch).test()).error).toContain('无法解析');
  });
});

describe('sendCard', () => {
  it('textcard：touser 用 | 连接、agentid 为数字、按钮 ≤ 4 字', async () => {
    const s = stub(baseRoutes());
    const r = await new WecomClient(cfg, s.fetch).sendCard(['lin', 'zhou', 'lin', ' '], { title: '发言待确认', description: '第一行\n第二行 <b>', url: 'https://m.test/x?t=1', btntxt: '去确认一下吧' });
    expect(r).toEqual({ ok: true });
    const call = s.calls.find((c) => c.api === 'message/send')!;
    expect(call.method).toBe('POST');
    expect(call.body).toEqual({
      touser: 'lin|zhou', msgtype: 'textcard', agentid: 1000002,
      textcard: { title: '发言待确认', description: '第一行<br>第二行 &lt;b&gt;', url: 'https://m.test/x?t=1', btntxt: '去确认一' },
    });
  });

  it('标题 / 描述超长截断；已拼好的 <div> 描述原样发送', async () => {
    const s = stub(baseRoutes());
    const c = new WecomClient(cfg, s.fetch);
    await c.sendCard(['lin'], { title: '题'.repeat(200), description: '<div class="gray">事件</div><div class="normal">正文</div>', url: 'https://m.test' });
    const tc = s.calls.find((x) => x.api === 'message/send')!.body.textcard;
    expect(Array.from(tc.title)).toHaveLength(TEXTCARD_LIMITS.title);
    expect(tc.title.endsWith('…')).toBe(true);
    expect(tc.description).toBe('<div class="gray">事件</div><div class="normal">正文</div>');
    expect(tc.btntxt).toBe('详情');
  });

  it('超过 1000 人分批发送；部分接收人无效时照发并列出', async () => {
    let n = 0;
    const s = stub({ ...baseRoutes(), 'message/send': () => ok(++n === 2 ? { invaliduser: 'u1000', unlicenseduser: 'u3' } : {}) });
    const users = Array.from({ length: 1001 }, (_, i) => `u${i}`);
    const r = await new WecomClient(cfg, s.fetch).sendCard(users, { title: 't', description: 'd', url: 'https://m.test' });
    expect(s.count('message/send')).toBe(2);
    expect(s.calls.filter((c) => c.api === 'message/send').map((c) => c.body.touser.split('|').length)).toEqual([1000, 1]);
    expect(r).toEqual({ ok: true, invalidUsers: ['u1000', 'u3'] });
  });

  it('@all 发给应用可见范围全员', async () => {
    const s = stub(baseRoutes());
    await new WecomClient(cfg, s.fetch).sendCard(['lin', '@all'], { title: 't', description: 'd', url: 'https://m.test' });
    expect(s.calls.find((c) => c.api === 'message/send')!.body.touser).toBe('@all');
  });

  it('不抛错：没有接收人 / 链接不是 http(s) / 接收人全部无效 → ok=false 带原因', async () => {
    const s = stub({ ...baseRoutes(), 'message/send': { errcode: 81013, errmsg: 'user & party & tag all invalid' } });
    const c = new WecomClient(cfg, s.fetch);
    expect(await c.sendCard([], { title: 't', description: 'd', url: 'https://m.test' })).toMatchObject({ ok: false, error: expect.stringContaining('接收人') });
    expect(await c.sendCard(['lin'], { title: 't', description: 'd', url: '' })).toMatchObject({ ok: false, error: expect.stringContaining('http') });
    expect(await c.sendCard(['lin'], { title: 't', description: 'd', url: 'javascript:alert(1)' })).toMatchObject({ ok: false });
    expect(await c.sendCard(['lin'], { title: 't', description: 'd', url: 'https://m.test' })).toMatchObject({ ok: false, error: expect.stringContaining('全部无效') });
  });
});

describe('formatTextcardDescription', () => {
  it('纯文本：逐行转义、空行去掉、用 <br> 连接；空串给一个空格（企微必填）', () => {
    expect(formatTextcardDescription('a & b\n\n  c<d>  \n')).toBe('a &amp; b<br>c&lt;d&gt;');
    expect(formatTextcardDescription('')).toBe(' ');
  });

  it('纯文本超长：截到 512 字以内、不切断转义实体、末尾省略号', () => {
    const out = formatTextcardDescription(`${'&'.repeat(300)}\n${'字'.repeat(300)}`);
    expect(Array.from(out).length).toBeLessThanOrEqual(TEXTCARD_LIMITS.description);
    expect(out.endsWith('…')).toBe(true);
    expect(out.replace(/&amp;/g, '')).not.toContain('&');
  });

  it('<div> 描述超长：从末尾整块去掉，不切断标签', () => {
    const blocks = ['<div class="gray">事件</div>', ...Array.from({ length: 10 }, (_, i) => `<div class="normal">${String(i).repeat(60)}</div>`)];
    const out = formatTextcardDescription(blocks.join(''));
    expect(Array.from(out).length).toBeLessThanOrEqual(TEXTCARD_LIMITS.description);
    expect(out.startsWith('<div class="gray">事件</div>')).toBe(true);
    expect(out.endsWith('</div>')).toBe(true);
    expect(out.match(/<div/g)!.length).toBe(out.match(/<\/div>/g)!.length);
  });
});

describe('wecomErrorText', () => {
  it('未知错误码带原始信息', () => {
    expect(wecomErrorText(99999, 'weird')).toContain('99999');
    expect(wecomErrorText(99999, 'weird')).toContain('weird');
  });
});

describe('diffOrg', () => {
  const person = (id: string, over: Partial<MmPerson> = {}): MmPerson => ({ id, name: id.toUpperCase(), deptId: 'd1', wecomUserId: id, ...over });
  const prev: MmOrg = {
    source: 'wecom', depts: [],
    people: [person('a'), person('b', { title: '工程师' }), person('c'), person('d', { left: true }), person('e', { leaderId: 'a' })],
  };

  it('新增 / 变更（姓名、主部门、职务、直属上级）/ 离职；离职后重新出现算新增；早已离职的不重复算', () => {
    const next = {
      depts: [],
      people: [
        person('a'), // 不变
        person('b', { title: '高级工程师' }), // 职务变了
        person('d'), // 重新入职
        person('e', { leaderId: 'b' }), // 上级变了
        person('f'), // 新人
      ],
    };
    expect(diffOrg(prev, next)).toEqual({ added: ['d', 'f'], changed: ['b', 'e'], left: ['c'] });
  });

  it('主部门 / 姓名变化算变更；空白差异不算', () => {
    const next = { depts: [], people: [person('a', { deptId: 'd2' }), person('b', { name: 'B ', title: '工程师' }), person('c', { name: '新名字' }), person('e', { leaderId: 'a' })] };
    expect(diffOrg(prev, next)).toEqual({ added: [], changed: ['a', 'c'], left: [] });
  });

  it('首次同步（之前没有组织）：全部是新增', () => {
    expect(diffOrg({ source: 'none', depts: [], people: [] }, { depts: [], people: [person('x')] })).toEqual({ added: ['x'], changed: [], left: [] });
  });
});
