/**
 * 会议智能管理 · 企业微信服务端 API（自建应用）。
 *
 * 只做三件事：
 *   1. 取 access_token（缓存到过期前 5 分钟；接口回 42001 / 40014 时作废缓存、换新令牌重试一次）；
 *   2. 全量拉通讯录：部门（含上级、部门负责人顺序）、成员（主部门、职务、直属上级）；
 *   3. 发 textcard 卡片消息（标题 + 摘要 + 按钮）。
 *
 * 通讯录字段近年收紧过（2022-06 起新建自建应用拿不到手机 / 邮箱等，代开发 / 第三方应用拿不到姓名、
 * 职务、直属上级、部门负责人等）：拿不到的字段留空，不报错；部门负责人拿不到时用成员的
 * is_leader_in_dept 补（顺序按成员在部门内的排序值，未必等于后台设置的负责人顺序）。
 *
 * 接口降级：
 *   - department/list 被拒（48009 通讯录同步助手新增 IP / 48005 接口废弃）→ department/simplelist + department/get；
 *   - user/list 被拒（同上）→ user/list_id（仅通讯录同步 Secret 可调）+ user/get。
 *
 * fetch 可注入（单测打桩，不真的请求企微）。错误码一律转成中文原因（给管理员看怎么修）。
 */
import { createHash } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';
import type { MmDept, MmOrg, MmPerson } from '../../../shared/meetingMgmt/types';

export const WECOM_API_BASE = 'https://qyapi.weixin.qq.com/cgi-bin';

/** textcard 字段上限（官方文档：标题 128 字、描述 512 字、按钮 4 个字、链接 2048 字节） */
export const TEXTCARD_LIMITS = { title: 128, description: 512, btntxt: 4, urlBytes: 2048 } as const;
/** message/send 每次最多 1000 个接收人 */
const MAX_TOUSER = 1000;
const REQUEST_TIMEOUT_MS = 15_000;
/** 令牌提前 5 分钟视为过期 */
const TOKEN_EARLY_MS = 5 * 60 * 1000;
/** 逐部门 / 逐成员拉取时的并发数（企微有并发上限 45033） */
const CONCURRENCY = 4;
/** 令牌失效、需要换新令牌重试的错误码 */
const TOKEN_INVALID_CODES = new Set([40014, 42001]);
/** 接口被拒、可以换用替代接口的错误码 */
const FALLBACK_CODES = new Set([48009, 48005]);
/** 逐个读部门 / 成员时，单个对象不存在或无权限：跳过这一个，不让整个同步失败 */
const SKIP_ONE_CODES = new Set([60003, 60011, 60123, 60111, 40003, 60021, 60030, 92000]);

export interface WecomConfig {
  corpId: string;
  agentId: string;
  secret: string;
}

export interface WecomCardInput {
  title: string;
  /** 纯文本（\n 分行，会转义）或已拼好的 textcard 描述（含 <div class="gray|normal|highlight">） */
  description: string;
  url: string;
  btntxt?: string;
}

export interface WecomSendResult {
  ok: boolean;
  error?: string;
  /** 部分接收人无效（不在可见范围 / 已离职 / 没有许可）：消息照发，这些人收不到 */
  invalidUsers?: string[];
}

/** 企微接口返回 errcode ≠ 0（或连不上）时抛的错误；message 已是中文原因 */
export class WecomApiError extends Error {
  constructor(message: string, readonly errcode: number, readonly errmsg: string, readonly api: string) {
    super(message);
    this.name = 'WecomApiError';
  }
}

// ─── 错误码 → 中文原因 ────────────────────────────────────────────────

/** 把企微 errcode 转成给管理员看的中文原因（带怎么修） */
export function wecomErrorText(errcode: number, errmsg = ''): string {
  const ip = /from ip:\s*([0-9a-fA-F.:]+)/i.exec(errmsg)?.[1];
  switch (errcode) {
    case -1: return i18nT('企业微信系统繁忙，请稍后重试');
    case 40001:
    case 40091: return i18nT('Secret 不正确：请确认填的是这个自建应用的 Secret（没有被重置），且应用没有停用');
    case 40013: return i18nT('CorpID 不正确：请到企业微信管理后台「我的企业 → 企业信息」底部复制企业 ID');
    case 41002: return i18nT('没有填写 CorpID');
    case 41004: return i18nT('没有填写 Secret');
    case 40014:
    case 42001: return i18nT('企业微信访问令牌已失效，请重试');
    case 40056: return i18nT('AgentId 不正确：请到企业微信管理后台「应用管理 → 本应用」查看 AgentId');
    case 301002: return i18nT('AgentId 与 Secret 不属于同一个应用：请核对两者都取自同一个自建应用');
    case 60020: return ip
      ? i18nT('本机出口 IP（{p0}）不在企业可信 IP 中：请在企业微信管理后台「应用管理 → 本应用 → 企业可信 IP」里加上它，约 1 分钟后生效', { p0: ip })
      : i18nT('本机出口 IP 不在企业可信 IP 中：请在企业微信管理后台「应用管理 → 本应用 → 企业可信 IP」里加上本机的出口 IP，约 1 分钟后生效');
    case 48002: return i18nT('应用没有调用这个接口的权限：请检查应用的通讯录读取权限与接口权限');
    case 48008: return i18nT('当前 Secret 只有通讯录编辑授权，不能读取通讯录详情：请改用自建应用的 Secret');
    case 48009: return i18nT('企业微信不再允许「通讯录同步」Secret 从新 IP 读取通讯录详情：请改用自建应用的 Secret，并把应用可见范围设为需要同步的部门');
    case 48001: return i18nT('这个接口功能未授权');
    case 48005: return i18nT('这个企业微信接口已停用');
    case 48006: return i18nT('应用的接口权限已被收回（应用长期未使用）：请管理员在后台重新启用应用');
    case 50003: return i18nT('应用已被禁用：请在企业微信管理后台启用该应用');
    case 60011: return i18nT('没有通讯录权限：要读取的部门或成员不在应用可见范围内，请把应用可见范围设为需要同步的部门');
    case 60021:
    case 60030:
    case 92000: return i18nT('成员不在应用可见范围内：请扩大应用可见范围');
    case 60003: return i18nT('部门不存在（可能已被删除或不在可见范围内）');
    case 60111: return i18nT('成员不存在（可能已离职，或不在应用可见范围内）');
    case 40003: return i18nT('成员 UserID 无效（可能已离职或不在通讯录中）');
    case 81013: return i18nT('接收人全部无效：可能已离职，或不在应用可见范围内');
    case 82001: return i18nT('没有可发送的接收人');
    case 45009: return i18nT('企业微信接口调用次数超过限制，请稍后再试');
    case 45033: return i18nT('企业微信接口并发调用超过限制，请稍后再试');
    case 40058: return i18nT('请求参数不合法：{p0}', { p0: errmsg || String(errcode) });
    default: return i18nT('企业微信返回错误 {p0}：{p1}', { p0: errcode, p1: errmsg || '-' });
  }
}

// ─── 令牌缓存（模块级：每次新建客户端也不重复取令牌，避免 gettoken 频率拦截）──────

interface CachedToken { token: string; expiresAt: number }
const tokenCache = new Map<string, CachedToken>();
const tokenInflight = new Map<string, Promise<string>>();

/** 测试用：清空令牌缓存 */
export function clearWecomTokenCache(): void {
  tokenCache.clear();
  tokenInflight.clear();
}

// ─── 企微原始返回 ─────────────────────────────────────────────────────

interface WxBase { errcode?: number; errmsg?: string }
interface WxDept { id: number | string; name?: string; parentid?: number | string; department_leader?: string[]; order?: number }
interface WxUser {
  userid: string;
  name?: string;
  department?: Array<number | string>;
  main_department?: number | string;
  position?: string;
  direct_leader?: string[];
  is_leader_in_dept?: number[];
  order?: number[];
  status?: number;
}

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v));

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// ─── 客户端 ───────────────────────────────────────────────────────────

export class WecomClient {
  private readonly cfg: WecomConfig;
  private readonly fetchImpl: typeof fetch;
  private readonly cacheKey: string;

  constructor(cfg: { corpId: string; agentId: string; secret: string }, fetchImpl?: typeof fetch) {
    this.cfg = { corpId: str(cfg?.corpId).trim(), agentId: str(cfg?.agentId).trim(), secret: str(cfg?.secret).trim() };
    this.fetchImpl = fetchImpl ?? ((...a: Parameters<typeof fetch>) => globalThis.fetch(...a));
    this.cacheKey = createHash('sha256').update(`${this.cfg.corpId}\u0000${this.cfg.secret}`).digest('hex');
  }

  /** 校验配置：能取到令牌、AgentId 与 Secret 属于同一个应用、本机 IP 在可信 IP 里 */
  async test(): Promise<{ ok: boolean; error?: string; agentName?: string }> {
    try {
      this.checkConfig(true);
      const agent = await this.call<WxBase & { name?: string; close?: number; allow_userinfos?: { user?: unknown[] }; allow_partys?: { partyid?: unknown[] }; allow_tags?: { tagid?: unknown[] } }>(
        'agent/get', { query: { agentid: this.cfg.agentId } },
      );
      if (agent.close === 1) return { ok: false, error: wecomErrorText(50003), agentName: agent.name };
      const visible = (agent.allow_userinfos?.user?.length ?? 0) + (agent.allow_partys?.partyid?.length ?? 0) + (agent.allow_tags?.tagid?.length ?? 0);
      if (agent.allow_userinfos || agent.allow_partys || agent.allow_tags) {
        if (visible === 0) return { ok: false, error: i18nT('应用可见范围为空：请在企业微信管理后台把应用可见范围设为需要同步的部门'), agentName: agent.name };
      }
      return { ok: true, agentName: agent.name };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  /** 全量拉通讯录：部门（上级、负责人顺序）、成员（主部门、职务、直属上级）。失败抛中文错误 */
  async fetchOrg(): Promise<{ depts: MmDept[]; people: MmPerson[] }> {
    this.checkConfig(false);
    const wxDepts = await this.fetchDepts();
    if (!wxDepts.length) throw new Error(i18nT('没有读到任何部门：请把应用可见范围设为需要同步的部门'));
    const users = await this.fetchUsers(wxDepts.map((d) => str(d.id)));

    const depts: MmDept[] = wxDepts.map((d) => {
      const parent = str(d.parentid);
      return {
        id: str(d.id),
        name: d.name ? String(d.name) : str(d.id),
        ...(parent && parent !== '0' ? { parentId: parent } : {}),
        leaderIds: Array.isArray(d.department_leader) ? d.department_leader.map(String).filter(Boolean) : [],
      };
    });

    // 部门负责人字段拿不到时，用成员的 is_leader_in_dept 补（按成员在部门内的排序值从大到小）
    const derived = new Map<string, Array<{ id: string; order: number }>>();
    for (const u of users) {
      (u.department ?? []).forEach((dep, i) => {
        if (u.is_leader_in_dept?.[i] !== 1) return;
        const k = str(dep);
        const list = derived.get(k) ?? [];
        list.push({ id: u.userid, order: Number(u.order?.[i] ?? 0) || 0 });
        derived.set(k, list);
      });
    }
    for (const d of depts) {
      if (d.leaderIds.length) continue;
      const list = derived.get(d.id);
      if (list?.length) d.leaderIds = list.sort((a, b) => b.order - a.order || a.id.localeCompare(b.id)).map((x) => x.id);
    }

    const deptIds = new Set(depts.map((d) => d.id));
    const people: MmPerson[] = users.map((u) => {
      const ownDepts = (u.department ?? []).map(str).filter(Boolean);
      const main = str(u.main_department);
      const deptId = (main && (deptIds.has(main) || !ownDepts.length) ? main : '') || ownDepts.find((x) => deptIds.has(x)) || ownDepts[0] || '';
      const leader = Array.isArray(u.direct_leader) ? str(u.direct_leader[0]) : '';
      const p: MmPerson = { id: u.userid, name: u.name ? String(u.name) : u.userid, deptId, wecomUserId: u.userid };
      if (u.position) p.title = String(u.position);
      if (leader) p.leaderId = leader;
      return p;
    });
    return { depts, people };
  }

  /** 发 textcard 卡片。toUserIds 是企微 userid（'@all' = 应用可见范围内全员）。不抛错，失败在 error 里 */
  async sendCard(toUserIds: string[], card: WecomCardInput): Promise<WecomSendResult> {
    try {
      this.checkConfig(true);
      const users = [...new Set(toUserIds.map((x) => str(x).trim()).filter(Boolean))];
      if (!users.length) return { ok: false, error: wecomErrorText(82001) };
      const url = str(card.url).trim();
      if (!/^https?:\/\//i.test(url)) return { ok: false, error: i18nT('卡片链接需要以 http:// 或 https:// 开头（请先开启手机页服务或配置卡片跳转地址）') };
      if (Buffer.byteLength(url, 'utf8') > TEXTCARD_LIMITS.urlBytes) return { ok: false, error: i18nT('卡片链接太长（超过 2048 字节）') };
      const textcard = {
        title: clipChars(str(card.title).trim() || ' ', TEXTCARD_LIMITS.title),
        description: formatTextcardDescription(str(card.description)),
        url,
        btntxt: clipChars(str(card.btntxt).trim() || i18nT('详情'), TEXTCARD_LIMITS.btntxt, ''),
      };
      const chunks: string[][] = users.includes('@all') ? [['@all']] : [];
      if (!chunks.length) for (let i = 0; i < users.length; i += MAX_TOUSER) chunks.push(users.slice(i, i + MAX_TOUSER));
      const invalid: string[] = [];
      for (const chunk of chunks) {
        const r = await this.call<WxBase & { invaliduser?: string; unlicenseduser?: string }>('message/send', {
          method: 'POST',
          body: { touser: chunk.join('|'), msgtype: 'textcard', agentid: Number(this.cfg.agentId), textcard },
        });
        for (const s of [r.invaliduser, r.unlicenseduser]) if (s) invalid.push(...String(s).split('|').filter(Boolean));
      }
      return invalid.length ? { ok: true, invalidUsers: [...new Set(invalid)] } : { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  // ── 内部 ───────────────────────────────────────────

  private checkConfig(needAgent: boolean): void {
    if (!this.cfg.corpId) throw new Error(wecomErrorText(41002));
    if (!this.cfg.secret) throw new Error(wecomErrorText(41004));
    if (needAgent && !/^\d+$/.test(this.cfg.agentId)) throw new Error(i18nT('AgentId 应为数字：请到企业微信管理后台「应用管理 → 本应用」查看'));
  }

  private async fetchDepts(): Promise<WxDept[]> {
    try {
      const r = await this.call<WxBase & { department?: WxDept[] }>('department/list');
      return r.department ?? [];
    } catch (e) {
      if (!(e instanceof WecomApiError) || !FALLBACK_CODES.has(e.errcode)) throw e;
    }
    const ids = (await this.call<WxBase & { department_id?: WxDept[] }>('department/simplelist')).department_id ?? [];
    return mapLimit(ids, CONCURRENCY, async (d) => {
      try {
        const one = (await this.call<WxBase & { department?: WxDept }>('department/get', { query: { id: str(d.id) } })).department;
        return { ...d, ...(one ?? {}) };
      } catch (err) {
        // 单个部门详情读不到（不存在 / 无权限）：保留 id / 上级，名称用 id 代替，不让整个同步失败
        if (err instanceof WecomApiError && SKIP_ONE_CODES.has(err.errcode)) return d;
        throw err;
      }
    });
  }

  private async fetchUsers(deptIds: string[]): Promise<WxUser[]> {
    const byId = new Map<string, WxUser>();
    const add = (u: WxUser): void => {
      if (!u?.userid || u.status === 5) return; // 5 = 已退出企业
      if (!byId.has(u.userid)) byId.set(u.userid, u);
    };
    try {
      const skipped: WecomApiError[] = [];
      const lists = await mapLimit(deptIds, CONCURRENCY, async (id) => {
        try {
          return (await this.call<WxBase & { userlist?: WxUser[] }>('user/list', { query: { department_id: id } })).userlist ?? [];
        } catch (err) {
          // 某个部门没有查看权限 / 已删除：跳过这个部门；全部部门都这样才报错
          if (err instanceof WecomApiError && SKIP_ONE_CODES.has(err.errcode)) { skipped.push(err); return null; }
          throw err;
        }
      });
      if (skipped.length && lists.every((l) => l === null)) throw skipped[0];
      for (const list of lists) for (const u of list ?? []) add(u);
      return [...byId.values()];
    } catch (e) {
      if (!(e instanceof WecomApiError) || !FALLBACK_CODES.has(e.errcode)) throw e;
    }
    // 降级：user/list_id 拿全部 userid（仅通讯录同步 Secret 可调），再逐个 user/get
    const userIds = new Set<string>();
    let cursor = '';
    for (let page = 0; page < 1000; page += 1) {
      const r = await this.call<WxBase & { next_cursor?: string; dept_user?: Array<{ userid: string }> }>('user/list_id', {
        method: 'POST', body: cursor ? { cursor, limit: 10000 } : { limit: 10000 },
      });
      for (const du of r.dept_user ?? []) if (du?.userid) userIds.add(du.userid);
      cursor = str(r.next_cursor);
      if (!cursor) break;
    }
    const users = await mapLimit([...userIds], CONCURRENCY, async (userid) => {
      try {
        return await this.call<WxBase & WxUser>('user/get', { query: { userid } });
      } catch (err) {
        if (err instanceof WecomApiError && SKIP_ONE_CODES.has(err.errcode)) return null;
        throw err;
      }
    });
    for (const u of users) if (u) add(u);
    return [...byId.values()];
  }

  private async token(force = false): Promise<string> {
    const now = Date.now();
    const hit = tokenCache.get(this.cacheKey);
    if (!force && hit && hit.expiresAt > now) return hit.token;
    const running = tokenInflight.get(this.cacheKey);
    if (running) return running;
    const p = (async () => {
      const r = await this.request<WxBase & { access_token?: string; expires_in?: number }>('gettoken', 'GET', {
        corpid: this.cfg.corpId, corpsecret: this.cfg.secret,
      });
      if (!r.access_token) throw new WecomApiError(i18nT('企业微信没有返回访问令牌'), -2, '', 'gettoken');
      const ttlMs = Math.max(60_000, (Number(r.expires_in) || 7200) * 1000 - TOKEN_EARLY_MS);
      tokenCache.set(this.cacheKey, { token: r.access_token, expiresAt: Date.now() + ttlMs });
      return r.access_token;
    })();
    tokenInflight.set(this.cacheKey, p);
    try {
      return await p;
    } finally {
      tokenInflight.delete(this.cacheKey);
    }
  }

  /** 带令牌调接口：令牌失效（42001 / 40014）时作废缓存、换新令牌重试一次 */
  private async call<T extends WxBase>(api: string, o: { method?: 'GET' | 'POST'; query?: Record<string, string>; body?: unknown } = {}): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      const token = await this.token(attempt > 0);
      try {
        return await this.request<T>(api, o.method ?? 'GET', { ...(o.query ?? {}), access_token: token }, o.body);
      } catch (e) {
        if (attempt === 0 && e instanceof WecomApiError && TOKEN_INVALID_CODES.has(e.errcode)) {
          tokenCache.delete(this.cacheKey);
          continue;
        }
        throw e;
      }
    }
  }

  private async request<T extends WxBase>(api: string, method: 'GET' | 'POST', query: Record<string, string>, body?: unknown): Promise<T> {
    const qs = new URLSearchParams(query).toString();
    const url = `${WECOM_API_BASE}/${api}${qs ? `?${qs}` : ''}`;
    let res: Response;
    try {
      res = await this.fetchImpl(url, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json; charset=utf-8' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : undefined,
      });
    } catch (e) {
      const reason = (e as Error)?.name === 'TimeoutError' ? i18nT('请求超时') : str((e as Error)?.message) || 'network';
      throw new WecomApiError(i18nT('连不上企业微信（{p0}）：请检查本机网络，能否访问 qyapi.weixin.qq.com', { p0: reason }), -2, reason, api);
    }
    if (!res.ok) throw new WecomApiError(i18nT('企业微信接口返回 HTTP {p0}', { p0: res.status }), -2, `HTTP ${res.status}`, api);
    let data: T;
    try {
      data = (await res.json()) as T;
    } catch {
      throw new WecomApiError(i18nT('企业微信返回的内容无法解析'), -2, 'bad json', api);
    }
    const code = Number(data?.errcode ?? 0);
    if (code !== 0) throw new WecomApiError(wecomErrorText(code, str(data?.errmsg)), code, str(data?.errmsg), api);
    return data;
  }
}

// ─── textcard 描述排版 ────────────────────────────────────────────────

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const escapeCardText = (s: string): string => s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c]);

/** 按字符（码点）截断，超出时末尾加省略号 */
export function clipChars(s: string, max: number, ellipsis = '…'): string {
  const cps = Array.from(s);
  if (cps.length <= max) return s;
  const keep = Math.max(0, max - Array.from(ellipsis).length);
  return cps.slice(0, keep).join('') + ellipsis;
}

const isCardMarkup = (s: string): boolean => /<div\b[^>]*>|<br\s*\/?>/i.test(s);

/**
 * textcard 描述：纯文本按行转义后用 <br> 连接；已含 <div>/<br> 的视为拼好的描述原样用。
 * 超过 512 字时：拼好的描述从末尾整块去掉 <div>…</div>（不切断标签），纯文本直接截断加省略号。
 */
export function formatTextcardDescription(raw: string): string {
  const max = TEXTCARD_LIMITS.description;
  const len = (s: string): number => Array.from(s).length;
  const fromPlain = (plain: string): string => plain.split('\n').map((l) => l.trim()).filter(Boolean).map(escapeCardText).join('<br>');
  const fitPlain = (plain: string): string => {
    const whole = fromPlain(plain);
    if (len(whole) <= max) return whole || ' ';
    // 转义后超长：按原文截断再转义（不切断实体），二分找能放下的最长前缀
    const cps = Array.from(plain);
    let lo = 0;
    let hi = cps.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (len(fromPlain(cps.slice(0, mid).join(''))) + 1 <= max) lo = mid;
      else hi = mid - 1;
    }
    return `${fromPlain(cps.slice(0, lo).join(''))}…`;
  };
  if (!isCardMarkup(raw)) return fitPlain(raw.replace(/\r\n?/g, '\n'));
  const s = raw.trim();
  if (len(s) <= max) return s;
  const blockRe = /<div\b[^>]*>[\s\S]*?<\/div>/gi;
  const blocks = s.match(blockRe) ?? [];
  if (blocks.length && !s.replace(blockRe, '').trim()) {
    // 全是 <div> 块：从末尾整块去掉，直到放得下
    const kept = [...blocks];
    while (kept.length > 1 && len(kept.join('')) > max) kept.pop();
    if (len(kept.join('')) <= max) return kept.join('');
  }
  // 兜底：去掉标签按纯文本截断
  const unescaped = s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/div>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot);/g, (_, k: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"' } as Record<string, string>)[k] ?? '');
  return fitPlain(unescaped);
}

// ─── 同步前后对比 ─────────────────────────────────────────────────────

/** 同步前后对比：新增（含离职后重新出现）/ 变更（姓名、主部门、职务、直属上级、企微账号）/ 离职 的人员 id */
export function diffOrg(prev: MmOrg, next: { depts: MmDept[]; people: MmPerson[] }): { added: string[]; changed: string[]; left: string[] } {
  const before = new Map((prev?.people ?? []).map((p) => [p.id, p]));
  const after = new Map((next?.people ?? []).map((p) => [p.id, p]));
  const added: string[] = [];
  const changed: string[] = [];
  const left: string[] = [];
  const norm = (v: string | undefined): string => (v ?? '').trim();
  for (const [id, p] of after) {
    const old = before.get(id);
    if (!old || old.left) { added.push(id); continue; }
    if (norm(old.name) !== norm(p.name) || norm(old.deptId) !== norm(p.deptId) || norm(old.title) !== norm(p.title)
      || norm(old.leaderId) !== norm(p.leaderId) || norm(old.wecomUserId) !== norm(p.wecomUserId)) changed.push(id);
  }
  for (const [id, p] of before) if (!p.left && !after.has(id)) left.push(id);
  return { added, changed, left };
}
