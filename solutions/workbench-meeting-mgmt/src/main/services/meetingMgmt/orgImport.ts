/**
 * 会议智能管理 · 导入通讯录表格（没有企微自建应用、读不了通讯录接口时用）。
 *
 * 认企业微信管理后台「通讯录 → 导出成员」导出的表格，也认自己整理的表格：只要有一行表头含「姓名」，
 * 再加上下面这些列里的任意几列（列名按关键字认，顺序不限）：
 *   - 账号 / 帐号 / UserID：企微账号（群机器人按它 @ 人；没有就按姓名 + 手机号生成一个本地 id）
 *   - 手机 / 手机号：群机器人也能按手机号 @ 人
 *   - 部门：企微导出的是完整路径「公司/研发部/测试组」，多个部门用分号隔开 → 取第一个当主部门
 *   - 职务、直属上级（填姓名或账号都行）
 *   - 部门负责人 / 是否部门负责人 / 身份：是、上级、负责人 → 是本人主部门的负责人（按表里的先后排第一、第二位）
 *
 * 纯函数：入参是表格的行（二维数组），出参是部门 + 人员 + 给管理员看的提醒。
 */
import { createHash } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';
import type { MmDept, MmPerson } from '../../../shared/meetingMgmt/types';

export interface OrgImportResult {
  depts: MmDept[];
  people: MmPerson[];
  warnings: string[];
}

// i18n-ignore：表头关键字要和表格原文逐字比对，不能翻译
const COLS = {
  name: ['姓名', '名字', 'name'],
  userId: ['账号', '帐号', 'userid', 'user id', '成员id', '企微账号', '企业微信账号'],
  mobile: ['手机号码', '手机号', '手机', 'mobile', 'phone'],
  dept: ['所在部门', '部门名称', '部门', 'department'],
  title: ['职务', '职位', 'title', 'position'],
  leader: ['直属上级', '汇报对象', '上级'],
  isLeader: ['是否部门负责人', '部门负责人', '身份', '是否负责人'],
} as const;
// i18n-ignore：「是否部门负责人」列里表示「是」的写法
const YES = /^(是|上级|负责人|部门负责人|y|yes|true|1|√|✓)$/i;

const norm = (v: unknown): string => String(v ?? '').replace(/\s+/g, ' ').trim();
const key = (v: unknown): string => norm(v).toLowerCase().replace(/[\s_（）()]/g, '');
const shortHash = (s: string): string => createHash('sha1').update(s).digest('hex').slice(0, 10);

/** 手机号只留数字和开头的 +；不像手机号的返回空 */
export function normalizeMobile(v: unknown): string {
  let s = norm(v).replace(/[\s\-()（）]/g, '').replace(/^00/, '+');
  // 企微按注册时的手机号 @：大陆号码去掉 +86 / 86 前缀
  const cn = /^(?:\+?86)(1\d{10})$/.exec(s);
  if (cn) s = cn[1]!;
  const m = /^(\+?\d{6,15})$/.exec(s);
  return m ? m[1]! : '';
}

/** 企微账号：字母、数字和 _ . @ -，最长 64 */
export function normalizeWecomUserId(v: unknown): string {
  const s = norm(v);
  return /^[A-Za-z0-9_.@-]{1,64}$/.test(s) ? s : '';
}

function findHeader(rows: unknown[][]): { row: number; col: Record<keyof typeof COLS, number> } | null {
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const cells = (rows[r] || []).map(key);
    const col = {} as Record<keyof typeof COLS, number>;
    for (const k of Object.keys(COLS) as Array<keyof typeof COLS>) {
      // 先找完全相等的列名，再找包含关键字的（「部门」不要误认「部门负责人」那列）
      const words = COLS[k].map(key);
      let idx = cells.findIndex((c) => words.includes(c));
      if (idx < 0) idx = cells.findIndex((c) => c && words.some((w) => c.includes(w)) && !(k === 'dept' && /负责人|上级/.test(c)) && !(k === 'leader' && /部门负责人/.test(c)));
      col[k] = idx;
    }
    if (col.name >= 0 && (col.userId >= 0 || col.dept >= 0 || col.mobile >= 0)) return { row: r, col };
  }
  return null;
}

export function parseOrgTable(rows: unknown[][]): OrgImportResult {
  const header = findHeader(rows);
  if (!header) throw new Error(i18nT('没认出表头：表格里要有一行写着「姓名」，以及「账号」「部门」「手机」中的至少一列'));
  const { col } = header;
  const at = (row: unknown[], k: keyof typeof COLS): string => (col[k] >= 0 ? norm(row[col[k]]) : '');
  const warnings: string[] = [];
  const deptByPath = new Map<string, MmDept>();
  const deptOf = (path: string): MmDept => {
    const p = path || i18nT('未分配部门');
    let d = deptByPath.get(p);
    if (!d) {
      const parts = p.split(/[/／\\>＞]/).map((x) => x.trim()).filter(Boolean);
      d = { id: `d_${shortHash(p)}`, name: parts[parts.length - 1] || p, leaderIds: [] };
      deptByPath.set(p, d);
    }
    return d;
  };
  const people: MmPerson[] = [];
  const rawLeader = new Map<string, string>();
  const seen = new Set<string>();
  let badMobile = 0;
  for (const row of rows.slice(header.row + 1)) {
    if (!Array.isArray(row)) continue;
    const name = at(row, 'name');
    if (!name) continue;
    const uid = normalizeWecomUserId(at(row, 'userId'));
    const mobileRaw = at(row, 'mobile');
    const mobile = normalizeMobile(mobileRaw);
    if (mobileRaw && !mobile) badMobile += 1;
    const id = uid || `p_${shortHash(`${name}|${mobile}`)}`;
    if (seen.has(id)) { warnings.push(i18nT('「{p0}」在表里出现了不止一次，只取第一行', { p0: name })); continue; }
    seen.add(id);
    const deptPath = at(row, 'dept').split(/[;；,，\n]/).map((x) => x.trim()).filter(Boolean)[0] || '';
    const dept = deptOf(deptPath);
    const title = at(row, 'title');
    people.push({ id, name, deptId: dept.id, ...(title ? { title } : {}), ...(uid ? { wecomUserId: uid } : {}), ...(mobile ? { mobile } : {}) });
    const leader = at(row, 'leader');
    if (leader) rawLeader.set(id, leader.split(/[;；,，]/)[0]!.trim());
    if (YES.test(at(row, 'isLeader'))) dept.leaderIds.push(id);
  }
  if (!people.length) throw new Error(i18nT('表格里没有读到人员：表头下面每行要有姓名'));
  // 直属上级：填的是账号或姓名（重名时不认，免得挂错人）
  const byUid = new Map(people.filter((p) => p.wecomUserId).map((p) => [p.wecomUserId!, p.id]));
  const byName = new Map<string, string | null>();
  for (const p of people) byName.set(p.name, byName.has(p.name) ? null : p.id);
  for (const p of people) {
    const raw = rawLeader.get(p.id);
    if (!raw) continue;
    const lid = byUid.get(raw) ?? byName.get(raw) ?? null;
    if (lid && lid !== p.id) p.leaderId = lid;
  }
  const depts = [...deptByPath.values()];
  const noLeader = depts.filter((d) => !d.leaderIds.length).map((d) => d.name);
  if (noLeader.length) {
    warnings.push(i18nT('{p0} 个部门没有标负责人，派给这些部门的任务没人接收：{p1}。可在表里加一列「是否部门负责人」填「是」后重新导入', {
      p0: noLeader.length, p1: noLeader.slice(0, 8).join(i18nT('、')) + (noLeader.length > 8 ? '…' : ''),
    }));
  }
  if (badMobile) warnings.push(i18nT('{p0} 个手机号格式不对，已忽略（群消息按手机号提醒不到这些人）', { p0: badMobile }));
  const noMention = people.filter((p) => !p.wecomUserId && !p.mobile).length;
  if (noMention) warnings.push(i18nT('{p0} 人既没有企微账号也没有手机号：群消息里只能写姓名，提醒不到本人', { p0: noMention }));
  return { depts, people, warnings };
}
