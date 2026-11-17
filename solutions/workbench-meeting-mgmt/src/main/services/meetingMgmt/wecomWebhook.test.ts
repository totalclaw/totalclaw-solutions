/**
 * 企微群机器人：地址规范化 / 打码、群消息 markdown（@人、转义、字节上限）、每分钟 20 条限流、错误码转中文。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  WEBHOOK_MARKDOWN_MAX_BYTES, WEBHOOK_SEND_URL, WEBHOOK_TEXT_MAX_BYTES, WecomWebhook, __resetWebhookRate, buildGroupMessage, clipBytes, escapeMarkdown, groupMessageMarkdown,
  lanLinkNote, maskWebhookUrl, normalizeWebhookUrl,
} from './wecomWebhook';

const KEY = '693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa';

describe('地址', () => {
  it('认完整地址（可带别的参数）和只贴 key；别的域名、http、不是 send 接口一律不认', () => {
    expect(normalizeWebhookUrl(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${KEY}`)).toBe(`${WEBHOOK_SEND_URL}?key=${KEY}`);
    expect(normalizeWebhookUrl(`  https://qyapi.weixin.qq.com/cgi-bin/webhook/send?debug=1&key=${KEY}  `)).toBe(`${WEBHOOK_SEND_URL}?key=${KEY}`);
    expect(normalizeWebhookUrl(KEY)).toBe(`${WEBHOOK_SEND_URL}?key=${KEY}`);
    expect(normalizeWebhookUrl(`http://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${KEY}`)).toBeNull();
    expect(normalizeWebhookUrl(`https://evil.example.com/cgi-bin/webhook/send?key=${KEY}`)).toBeNull();
    expect(normalizeWebhookUrl(`https://qyapi.weixin.qq.com/cgi-bin/message/send?key=${KEY}`)).toBeNull();
    expect(normalizeWebhookUrl('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=')).toBeNull();
    expect(normalizeWebhookUrl('')).toBeNull();
  });

  it('打码只露 key 头尾各 4 位', () => {
    expect(maskWebhookUrl(`${WEBHOOK_SEND_URL}?key=${KEY}`)).toBe('…key=693a****5aaa');
  });
});

describe('群消息', () => {
  const base = { label: '发言待确认', title: '设备到货协调会', summary: '会议纪要已生成，请确认本人发言', buttonText: '去确认', url: 'http://192.168.1.5:8280/g#/meeting/mt1' };

  it('有手机号 / 可信账号的人真 @：发 text，按手机号优先、没手机号按账号；@ 不到的人写在正文里', () => {
    const m = buildGroupMessage({ ...base, mentions: [{ name: '周婷', mobile: '13800000002', userId: 'ZhouTing' }, { name: '吴刚', userId: 'WuGang' }, { name: '郑凯' }] });
    expect(m).toMatchObject({ msgtype: 'text', mobiles: ['13800000002'], userIds: ['WuGang'] });
    expect(m.content).toBe('【发言待确认】设备到货协调会\n会议纪要已生成，请确认本人发言\n请 @郑凯 和下面被提醒的同事处理\n去确认：http://192.168.1.5:8280/g#/meeting/mt1');
    const all = buildGroupMessage({ ...base, mentions: [{ name: '周婷', mobile: '13800000002' }] });
    expect(all.content).toContain('请下面被提醒的同事处理');
    const long = buildGroupMessage({ ...base, summary: '长'.repeat(3000), mentions: [{ name: '周婷', mobile: '13800000002' }] });
    expect(Buffer.byteLength(long.content, 'utf8')).toBeLessThanOrEqual(WEBHOOK_TEXT_MAX_BYTES);
    expect(long.content).toContain('去确认：http://192.168.1.5:8280/g#/meeting/mt1');
  });

  it('一个都 @ 不到（演示组织）：发 markdown，只写「@姓名」；按钮是群链接', () => {
    const m = buildGroupMessage({ ...base, mentions: [{ name: '周婷' }, { name: '吴刚' }] });
    expect(m.msgtype).toBe('markdown');
    expect(m.content).toContain('**【发言待确认】**设备到货协调会');
    expect(m.content).toContain('> 会议纪要已生成，请确认本人发言\n\n请 @周婷');
    expect(m.content).toContain('请 @周婷 @吴刚 处理');
    expect(m.content).toContain('[去确认](http://192.168.1.5:8280/g#/meeting/mt1)');
    expect(m.content).not.toContain('<@');
  });

  it('会议内容里的 markdown / @ 记号换成全角，不会冒出假 @ 或打乱格式；没有链接时提示到电脑端处理', () => {
    const md = groupMessageMarkdown({ label: '纪要待终审', title: '<@all> **紧急** [点我](http://x)', summary: '第一行\n第二行 #标题', mentions: [], buttonText: '去终审' });
    expect(md).not.toContain('<@all>');
    expect(md).toContain('＜@all＞ ＊＊紧急＊＊ ［点我］(http://x)');
    expect(md).toContain('> 第一行 第二行 ＃标题');
    expect(md).toContain('请在电脑端或手机页处理');
    expect(escapeMarkdown('a`b')).toBe('a＇b');
  });

  it('链接是公司内网地址：链接下面注明要连公司 Wi-Fi；外网地址不加', () => {
    const t = buildGroupMessage({ ...base, lanOnly: true, mentions: [{ name: '周婷', mobile: '13800000002' }] });
    expect(t.content).toContain(`去确认：http://192.168.1.5:8280/g#/meeting/mt1\n（${lanLinkNote()}）`);
    const md = buildGroupMessage({ ...base, lanOnly: true, mentions: [{ name: '周婷' }] });
    expect(md.content).toContain(`[去确认](http://192.168.1.5:8280/g#/meeting/mt1)\n<font color="comment">${lanLinkNote()}</font>`);
    expect(buildGroupMessage({ ...base, url: 'https://meet.example.com/g#/meeting/mt1', mentions: [{ name: '周婷' }] }).content).not.toContain(lanLinkNote());
    expect(buildGroupMessage({ ...base, url: '', lanOnly: true, mentions: [{ name: '周婷' }] }).content).not.toContain(lanLinkNote());
  });

  it('超长摘要截断，整条不超过 4096 字节', () => {
    const md = groupMessageMarkdown({ label: '正式纪要已生成', title: '周例会', summary: '很长的摘要'.repeat(800), mentions: Array.from({ length: 30 }, (_, i) => ({ name: `员工${i}` })), buttonText: '查看', url: 'http://h/g#/meeting/1' });
    expect(Buffer.byteLength(md, 'utf8')).toBeLessThanOrEqual(WEBHOOK_MARKDOWN_MAX_BYTES);
    expect(md).toContain('[查看](http://h/g#/meeting/1)');
    expect(md).toContain('@员工29');
    expect(clipBytes('一二三', 7)).toBe('一…');
  });
});

describe('发送', () => {
  beforeEach(() => __resetWebhookRate());
  const ok = () => new Response(JSON.stringify({ errcode: 0, errmsg: 'ok' }), { status: 200 });

  it('POST markdown；错误码转中文原因', async () => {
    const fetchImpl = vi.fn(async (_u: any, _i: any) => ok());
    const hook = new WecomWebhook(`${WEBHOOK_SEND_URL}?key=${KEY}`, fetchImpl as any);
    expect(await hook.sendMarkdown('**hi**')).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(`${WEBHOOK_SEND_URL}?key=${KEY}`);
    expect(JSON.parse(init.body)).toEqual({ msgtype: 'markdown', markdown: { content: '**hi**' } });
    await hook.sendText('请确认', { mobiles: ['13800000002'], userIds: ['WuGang'] });
    expect(JSON.parse(fetchImpl.mock.calls[1]![1].body)).toEqual({ msgtype: 'text', text: { content: '请确认', mentioned_list: ['WuGang'], mentioned_mobile_list: ['13800000002'] } });
    fetchImpl.mockImplementationOnce(async () => new Response(JSON.stringify({ errcode: 93000, errmsg: 'invalid webhook url' })));
    expect(await hook.sendMarkdown('x')).toMatchObject({ ok: false, errcode: 93000, error: expect.stringContaining('重新复制地址') });
    fetchImpl.mockImplementationOnce(async () => { throw new Error('ECONNRESET'); });
    expect((await hook.sendMarkdown('x')).error).toContain('连不上企业微信');
    fetchImpl.mockImplementationOnce(async () => new Response('busy', { status: 502 }));
    expect((await hook.sendMarkdown('x')).error).toContain('HTTP 502');
  });

  it('每分钟最多 20 条：第 21 条等到最早那条过 60 秒再发', async () => {
    let t = 1_000_000;
    const sleeps: number[] = [];
    const fetchImpl = vi.fn(async () => ok());
    const hook = new WecomWebhook(`${WEBHOOK_SEND_URL}?key=${KEY}`, fetchImpl as any, async (ms) => { sleeps.push(ms); t += ms; }, () => t);
    for (let i = 0; i < 20; i++) { await hook.sendMarkdown(`m${i}`); t += 100; }
    expect(sleeps).toEqual([]);
    await hook.sendMarkdown('m20');
    expect(sleeps.length).toBe(1);
    expect(sleeps[0]).toBeGreaterThanOrEqual(58_000);
    expect(fetchImpl).toHaveBeenCalledTimes(21);
  });
});
