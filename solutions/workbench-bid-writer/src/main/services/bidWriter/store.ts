/**
 * 标书项目的落盘：快照 + 每个项目一个目录（模板副本、导出件）。
 *
 * 快照永远在账号私有目录（切账号即换库），单文件原子写；公告正文与章节正文会很大，
 * 写入前逐项截断（正文 40 万字符、公告 12 万字符），免得快照涨到几十 MB 把启动拖死。
 *
 * **标书文件本身的存放位置用户可以自己选**（默认账号私有目录下的 `bid-writer/`）：
 * 客户常要求标书落在公司共享盘 / 项目目录里，藏在 Application Support 深处等于找不到。
 * 换位置只影响**以后**导出的文件；已导出记录里存的是绝对路径，旧文件照样打得开。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type { BidWriterProject, BidWriterState } from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';

export const BID_WRITER_STATE_VERSION = 1;
const MAX_NOTICE_TEXT = 120_000;
const MAX_SECTION_TEXT = 400_000;
const MAX_SNAPSHOT_BYTES = 40 * 1024 * 1024;

/** 快照与设置固定在账号私有目录，不跟着用户选的存放位置走 */
function privateDir(): string {
  return accountPath('bid-writer'); // account-scope:account
}

function snapshotPath(): string {
  return join(privateDir(), 'projects.json');
}

function settingsPath(): string {
  return join(privateDir(), 'settings.json');
}

export function defaultDocRoot(): string {
  return privateDir();
}

/** 用户选的标书存放位置；没选过或路径已失效就回默认 */
export function docRoot(): string {
  try {
    const p = settingsPath();
    if (!existsSync(p)) return defaultDocRoot();
    const raw = JSON.parse(readFileSync(p, 'utf-8'));
    const custom = String(raw?.docRoot || '').trim();
    if (!custom || !isAbsolute(custom)) return defaultDocRoot();
    // 目录被删/被换盘符：回默认，不让导出直接炸
    if (!existsSync(custom) || !statSync(custom).isDirectory()) return defaultDocRoot();
    return custom;
  } catch {
    return defaultDocRoot();
  }
}

/** 换存放位置。只影响以后导出的文件，已导出的路径不动。 */
export function setDocRoot(nextRaw: string): string {
  const next = String(nextRaw || '').trim();
  if (next && (!isAbsolute(next) || !existsSync(next) || !statSync(next).isDirectory())) {
    throw new Error(i18nT('这个目录不存在，请重新选择'));
  }
  mkdirSync(privateDir(), { recursive: true });
  const temp = `${settingsPath()}.tmp`;
  writeFileSync(temp, JSON.stringify({ docRoot: next || '' }, null, 2), { encoding: 'utf-8', mode: 0o600 });
  renameSync(temp, settingsPath());
  return docRoot();
}

/**
 * 某个项目的工作目录（模板副本 / 导出件都放这）。
 * 目录名用**项目名**而不是内部 id —— 用户是去访达里找文件的，`bid_mfx3k2_a1` 这种名字等于没写。
 * 后缀带 id 尾 6 位防重名（两个项目都叫「智慧园区」时不会互相覆盖）。
 */
export function projectDir(projectId: string, projectName?: string): string {
  const id = String(projectId || '').replace(/[^A-Za-z0-9_-]/g, '') || 'project';
  const name = safeFileName(String(projectName || '').trim());
  const folder = projectName ? `${name}-${id.slice(-6)}` : id;
  const dir = join(docRoot(), folder);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function emptyState(): BidWriterState {
  return { version: BID_WRITER_STATE_VERSION, projects: [], currentId: '' };
}

export function readState(): BidWriterState {
  try {
    const p = snapshotPath();
    if (!existsSync(p)) return emptyState();
    const raw = JSON.parse(readFileSync(p, 'utf-8'));
    if (raw?.version !== BID_WRITER_STATE_VERSION || !Array.isArray(raw.projects)) return emptyState();
    return raw as BidWriterState;
  } catch {
    return emptyState();
  }
}

/** 写入前截断超长文本，保证快照不失控 */
export function trimProject(project: BidWriterProject): BidWriterProject {
  const p = { ...project };
  if (p.notice?.text && p.notice.text.length > MAX_NOTICE_TEXT) {
    p.notice = { ...p.notice, text: `${p.notice.text.slice(0, MAX_NOTICE_TEXT)}\n${i18nT('…（已截断）')}` };
  }
  p.sections = (p.sections || []).map((s) => (
    s.content && s.content.length > MAX_SECTION_TEXT
      ? { ...s, content: s.content.slice(0, MAX_SECTION_TEXT) }
      : s
  ));
  return p;
}

export function writeState(state: BidWriterState): void {
  if (!state || state.version !== BID_WRITER_STATE_VERSION || !Array.isArray(state.projects)) {
    throw new Error(i18nT('标书工作台快照格式无效'));
  }
  const trimmed: BidWriterState = { ...state, projects: state.projects.map(trimProject) };
  const serialized = JSON.stringify(trimmed, null, 2);
  if (Buffer.byteLength(serialized, 'utf-8') > MAX_SNAPSHOT_BYTES) {
    throw new Error(i18nT('标书工作台数据超过 40MB，请删除不再需要的项目后重试'));
  }
  mkdirSync(privateDir(), { recursive: true });
  const target = snapshotPath();
  const temp = `${target}.tmp`;
  writeFileSync(temp, serialized, { encoding: 'utf-8', mode: 0o600 });
  renameSync(temp, target);
}

export function findProject(state: BidWriterState, projectId: string): BidWriterProject {
  const found = state.projects.find((p) => p.id === projectId);
  if (!found) throw new Error(i18nT('找不到这个标书项目，可能已被删除'));
  return found;
}

/** 文件名安全化（导出件用项目名命名） */
export function safeFileName(raw: string): string {
  return String(raw || '')
    .replace(/[\\/:*?"<>|\n\r\t]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60) || 'bid-document';
}
