/**
 * 发信闸门、退订 / 退信自动停发、客户打分复算（E1–E4）、背调确定性检查、平台标题 lint。
 * 规则来源见 logic.ts 对应小节的注释；这里每条规则至少一个「拦」和一个「放」。
 */
import { describe, expect, it, vi } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FtSendRecord, FtSuppression } from '@totalclaw/ipc-contracts';

vi.mock('../accountScope', () => ({ accountPath: (...p: string[]) => join(tmpdir(), 'ft-unused', ...p) }));

import {
  applyOptOuts, backgroundChecks, checkOutgoing, countWords, emailLevel, hashOutgoing, lintTitle, recomputeLeadScore, wantsOptOut,
  type FtGateContext, type FtOutgoingDraft,
} from './logic';
import { defaultSettings, emptyState } from './store';
import type { FetchedMail } from './mailboxes';

const NOW = Date.parse('2026-10-20T10:00:00');
const OPT = 'If this is not relevant to you, just reply "unsubscribe" and we will not email you again.';
const draft = (over: Partial<FtOutgoingDraft> = {}): FtOutgoingDraft => ({
  kind: 'outreach', mailboxId: 'mb1', to: ['anna.berg@nordlicht.de'], subject: 'LED panels for Nordlicht projects',
  body: `Hi Anna,\n\nI saw Nordlicht supplies office lighting across Bavaria. We make 600x600 LED panels with 5-year warranty.\nWould a sample help?\n\nBest,\nLi\n\n${OPT}`,
  ...over,
});
const ctx = (over: Partial<FtGateContext> = {}): FtGateContext => ({ rules: defaultSettings().sendRules, suppressions: [], sendLog: [], now: NOW, ...over });
const rules = (r: ReturnType<typeof checkOutgoing>) => r.issues.filter((i) => i.level === 'block').map((i) => i.rule);
const sent = (n: number, at = new Date(NOW).toISOString(), mailboxId = 'mb1'): FtSendRecord[] => Array.from({ length: n }, (_, i) => ({ id: `s${i}`, mailboxId, kind: 'outreach', to: [`x${i}@a.com`], subject: 's', hash: 'h', at, status: 'sent' }));

describe('发信闸门', () => {
  it('合格的开发信放行，并给出审批摘要', () => {
    const r = checkOutgoing(draft(), ctx());
    expect(r.ok).toBe(true);
    expect(r.hash).toBe(hashOutgoing(draft()));
  });

  it('未替换的变量与占位', () => {
    for (const body of ['Hi {{first_name}}, …', 'Dear {客户名}, …', 'Regards, [Your Name]', '我司 [请补充] 认证', '【公司名】 敬上', 'Price: TBD']) {
      expect(rules(checkOutgoing(draft({ body: `${body}\n${OPT}` }), ctx()))).toContain('placeholder');
    }
    expect(rules(checkOutgoing(draft({ body: `See section [1] of the catalog.\n${OPT}` }), ctx()))).not.toContain('placeholder');
  });

  it('AI 腔一律拦；垃圾词开发信拦、回复只提醒', () => {
    expect(rules(checkOutgoing(draft({ body: `I hope this email finds you well.\n${OPT}` }), ctx()))).toContain('ai_tell');
    expect(rules(checkOutgoing(draft({ body: `作为一个AI助手，我……\n${OPT}` }), ctx()))).toContain('ai_tell');
    expect(rules(checkOutgoing(draft({ body: `Best price guaranteed, act now!\n${OPT}` }), ctx()))).toContain('banned');
    const reply = checkOutgoing(draft({ kind: 'inquiry_reply', body: 'Thanks, we offer the best price for 5000 pcs.' }), ctx());
    expect(reply.ok).toBe(true);
    expect(reply.issues.find((i) => i.rule === 'banned')?.level).toBe('warn');
    expect(rules(checkOutgoing(draft({ body: `Our widgets are amazing.\n${OPT}` }), ctx({ rules: { ...defaultSettings().sendRules, extraBanned: ['Widgets'] } })))).toContain('banned');
  });

  it('长度、链接数、退订句', () => {
    expect(rules(checkOutgoing(draft({ subject: 'x'.repeat(95) }), ctx()))).toContain('subject_long');
    expect(rules(checkOutgoing(draft({ body: `${'word '.repeat(230)}\n${OPT}` }), ctx()))).toContain('body_long');
    expect(rules(checkOutgoing(draft({ body: `see https://a.com and https://b.com\n${OPT}` }), ctx()))).toContain('links');
    expect(rules(checkOutgoing(draft({ body: 'Hi Anna, samples ready.' }), ctx()))).toContain('no_opt_out');
    expect(rules(checkOutgoing(draft({ body: 'Hi Anna, samples ready. 如不需要请回复退订。' }), ctx()))).not.toContain('no_opt_out');
    expect(rules(checkOutgoing(draft({ kind: 'followup', body: 'Hi Anna, any feedback on the samples?' }), ctx()))).not.toContain('no_opt_out');
    expect(countWords('你好世界 hello there')).toBe(4);
  });

  it('抑制名单（邮箱 / 整个域名）', () => {
    const sup: FtSuppression[] = [{ id: '1', domain: 'nordlicht.de', reason: '客户要求', source: 'manual', at: '' }];
    const r = checkOutgoing(draft(), ctx({ suppressions: sup }));
    expect(rules(r)).toContain('suppressed');
    expect(r.issues.find((i) => i.rule === 'suppressed')!.message).toContain('客户要求');
    expect(rules(checkOutgoing(draft({ kind: 'auto_reply' }), ctx({ suppressions: [{ id: '2', email: 'anna.berg@nordlicht.de', reason: 'r', source: 'unsubscribe', at: '' }] })))).toContain('suppressed');
  });

  it('每邮箱每日额度：只数今天、只数这个邮箱', () => {
    const limit = { ...defaultSettings().sendRules, dailyLimit: 3 };
    expect(rules(checkOutgoing(draft(), ctx({ rules: limit, sendLog: sent(3) })))).toContain('daily_limit');
    expect(rules(checkOutgoing(draft(), ctx({ rules: limit, sendLog: sent(3, '2026-10-19T10:00:00') })))).not.toContain('daily_limit');
    expect(rules(checkOutgoing(draft(), ctx({ rules: limit, sendLog: sent(3, new Date(NOW).toISOString(), 'mb2') })))).not.toContain('daily_limit');
    expect(rules(checkOutgoing(draft({ to: ['a@x.com', 'b@x.com'] }), ctx({ rules: limit, sendLog: sent(2) })))).toContain('daily_limit');
  });

  it('退信率超阈值停发开发信（至少发过 10 封才判）', () => {
    const bounces: FtSuppression[] = Array.from({ length: 2 }, (_, i) => ({ id: `b${i}`, email: `b${i}@x.com`, reason: '退信', source: 'bounce', at: new Date(NOW - 86_400_000).toISOString(), mailboxId: 'mb1' }));
    expect(rules(checkOutgoing(draft(), ctx({ sendLog: sent(20, new Date(NOW - 2 * 86_400_000).toISOString()), suppressions: bounces })))).toContain('bounce_rate');
    expect(rules(checkOutgoing(draft(), ctx({ sendLog: sent(5, new Date(NOW - 2 * 86_400_000).toISOString()), suppressions: bounces })))).not.toContain('bounce_rate');
  });

  it('确认之后内容被改：摘要对不上就拦', () => {
    const approved = checkOutgoing(draft(), ctx()).hash;
    expect(checkOutgoing(draft(), ctx({ approvedHash: approved })).ok).toBe(true);
    expect(rules(checkOutgoing(draft({ body: `${draft().body} PS` }), ctx({ approvedHash: approved })))).toContain('changed');
    expect(rules(checkOutgoing(draft({ to: ['other@nordlicht.de'] }), ctx({ approvedHash: approved })))).toContain('changed');
  });

  it('发前再查线程：对方已回信就停；已有人回过——自动回复停、人工回复提醒', () => {
    expect(rules(checkOutgoing(draft({ kind: 'followup' }), ctx({ repliedAt: '2026-10-20T08:00:00Z' })))).toContain('replied');
    expect(rules(checkOutgoing(draft({ kind: 'auto_reply' }), ctx({ answeredAt: '2026-10-20T08:00:00Z' })))).toContain('answered');
    const manual = checkOutgoing(draft({ kind: 'inquiry_reply' }), ctx({ answeredAt: '2026-10-20T08:00:00Z' }));
    expect(manual.ok).toBe(true);
    expect(manual.issues.find((i) => i.rule === 'answered')?.level).toBe('warn');
  });

  it('开发信收件域名与官网不同只提醒（E3）', () => {
    const r = checkOutgoing(draft({ to: ['anna@gmail.com'] }), ctx({ websiteHost: 'nordlicht.de' }));
    expect(r.ok).toBe(true);
    expect(r.issues.some((i) => i.rule === 'email_domain')).toBe(true);
  });
});

const inbound = (over: Partial<FetchedMail['message']>): FetchedMail => ({
  automated: false,
  message: { id: Math.random().toString(36).slice(2), mailboxId: 'mb1', direction: 'in', from: 'anna@nordlicht.de', to: ['me@acme.cn'], subject: 'Re: LED panels', body: '', at: '2026-10-20T09:00:00.000Z', attachments: [], ...over },
});

describe('退订 / 退信自动进抑制名单', () => {
  it('对方自己写的退订话术才算；引用里我方的退订句不算', () => {
    expect(wantsOptOut('Please remove me from your list.')).toBe(true);
    expect(wantsOptOut('不要再发了，谢谢')).toBe(true);
    expect(wantsOptOut(`Sounds good, send the catalog.\n\nOn Mon, Li wrote:\n> ${OPT}`)).toBe(false);
    expect(wantsOptOut(`Interested.\n> reply "unsubscribe" and we will not email you again`)).toBe(false);
  });

  it('退信按 Final-Recipient 找回被退的地址，记在发件邮箱名下；重复的不再加', () => {
    const s = emptyState();
    s.messages.push({ id: 'o1', mailboxId: 'mb1', direction: 'out', from: 'me@acme.cn', to: ['ghost@nowhere.io'], subject: 'Hi', body: '', at: '2026-10-19T09:00:00.000Z', attachments: [] });
    const own = new Set(['me@acme.cn']);
    const added = applyOptOuts(s, [
      inbound({ from: 'mailer-daemon@mx.acme.cn', subject: 'Undelivered Mail Returned to Sender', body: 'Final-Recipient: rfc822; ghost@nowhere.io\nStatus: 5.1.1' }),
      inbound({ body: 'Please stop emailing me.' }),
      inbound({ from: 'tom@buyer.com', body: 'Need 500 pcs, please quote FOB Ningbo.' }),
    ], own);
    expect(added.map((x) => [x.email, x.source, x.mailboxId])).toEqual([['ghost@nowhere.io', 'bounce', 'mb1'], ['anna@nordlicht.de', 'unsubscribe', 'mb1']]);
    expect(applyOptOuts(s, [inbound({ body: 'remove me' })], own)).toEqual([]);
  });
});

describe('客户打分：模型初判、代码复算', () => {
  it('邮箱可触达性 E1–E4', () => {
    expect(emailLevel('purchasing@nordlicht.de', 'www.nordlicht.de')).toBe('E1');
    expect(emailLevel('anna.berg@nordlicht.de', 'nordlicht.de')).toBe('E1');
    expect(emailLevel('info@nordlicht.de', 'nordlicht.de')).toBe('E2');
    expect(emailLevel('anna@gmail.com', 'nordlicht.de')).toBe('E3');
    expect(emailLevel('info@nordlicht.de', 'nordlicht.de', false)).toBe('E4');
    expect(emailLevel('', 'nordlicht.de')).toBe('E4');
  });

  it('只挂通用邮箱的公司靠规模分进不了 A；采购邮箱 + 多源证据可以', () => {
    const generic = recomputeLeadScore({ emails: ['info@n.de'], websiteHost: 'n.de', evidence: 3, scale: 1, flags: [], critical: [] });
    expect(generic.tier).toBe('B');
    expect(generic.detail.recomputable).toBeLessThan(0.75);
    const good = recomputeLeadScore({ emails: ['purchasing@n.de', 'anna.berg@n.de'], websiteHost: 'n.de', evidence: 3, scale: 0.8, flags: [], critical: [] });
    expect(good).toMatchObject({ tier: 'A', level: 'E1' });
    expect(good.score).toBe(Math.round((0.4 + 0.25 + 0.2 + 0.15 * 0.8) * 100));
  });

  it('严重疑点封顶 B，单一来源或没邮箱是 C，疑点扣分最多 0.2', () => {
    expect(recomputeLeadScore({ emails: ['purchasing@n.de'], websiteHost: 'n.de', evidence: 3, scale: 1, flags: [], critical: ['网页有指令式文字'] }).tier).toBe('B');
    expect(recomputeLeadScore({ emails: ['purchasing@n.de'], websiteHost: 'n.de', evidence: 1, scale: 1, flags: [], critical: [] }).tier).toBe('C');
    expect(recomputeLeadScore({ emails: [], websiteHost: 'n.de', evidence: 3, scale: 1, flags: [], critical: [] }).tier).toBe('C');
    expect(recomputeLeadScore({ emails: ['info@n.de'], websiteHost: 'n.de', evidence: 2, scale: 0, flags: ['a', 'b', 'c'], critical: [] }).detail.penalty).toBe(0.2);
    expect(recomputeLeadScore({ emails: ['x@gmail.com'], websiteHost: 'n.de', evidence: 3, scale: 1, flags: [], critical: [] }).detail.critical.length).toBe(1);
  });
});

describe('背调：覆盖面与确定性红旗', () => {
  it('查到 / 查过没有 / 没查，三态分清', () => {
    const r = backgroundChecks({
      email: 'buyer@gmail.com', website: 'http://nordlicht.de', domainCreated: '2026-06-01T00:00:00Z', mx: undefined, now: NOW,
      sources: [{ title: '官网', url: 'http://nordlicht.de', textLength: 0, fetchError: '超时' }, { title: 'x', url: 'https://dir.example/n', textLength: 0 }],
    });
    const cov = Object.fromEntries(r.coverage.map((c) => [c.area, c.status]));
    expect(cov).toMatchObject({ website: 'checked_none', search: 'found', domain_age: 'found', mail_server: 'not_checked', screening: 'not_checked' });
    expect(r.flags.map((f) => f.rule).sort()).toEqual(['free_mail', 'no_footprint', 'no_https', 'young_domain']);
  });

  it('邮箱域名与官网对不上、没有收信服务器、名单命中都是严重红旗', () => {
    const r = backgroundChecks({
      email: 'sales@nordlicht-trade.com', website: 'https://nordlicht.de', mx: false, domainCreated: null, now: NOW,
      sources: [{ title: '官网', url: 'https://nordlicht.de', textLength: 900 }],
      screening: { id: 's', at: '', query: 'Nordlicht', level: 'high', matches: [{ score: 95, level: 'high', source: 'us_csl', list: 'CSL · EL', name: 'NORDLICHT GMBH', matchedOn: 'NORDLICHT GMBH', basis: '' }], lists: [], missing: [] },
    });
    expect(r.flags.filter((f) => f.level === 'critical').map((f) => f.rule).sort()).toEqual(['domain_mismatch', 'no_mx', 'screening_high']);
    expect(r.coverage.find((c) => c.area === 'domain_age')?.status).toBe('checked_none');
  });
});

describe('平台标题 lint', () => {
  it('极限词、促销词、表情、中文、全大写、堆砌、主词靠后', () => {
    const rules = (t: string, kw: string[] = []) => lintTitle(t, kw).map((i) => i.rule);
    expect(rules('Best LED Panel Light No.1 Quality')).toContain('title_extreme');
    expect(rules('LED Panel Light Hot Sale Free Shipping')).toContain('title_promo');
    expect(rules('LED Panel Light 💡 Office')).toContain('title_emoji');
    expect(rules('LED 面板灯 Panel Light')).toContain('title_cjk');
    expect(rules('LED PANEL LIGHT for office')).toContain('title_caps');
    expect(rules('Panel light panel light panel light')).toContain('title_dup');
    expect(rules('Ultra thin aluminium frame office ceiling recessed LED panel light 600x600', ['led panel light'])).toContain('kw_late');
    expect(rules('LED Panel Light 600x600 Ultra Thin Aluminium Frame for Office Ceiling', ['led panel light'])).toEqual([]);
  });
});
