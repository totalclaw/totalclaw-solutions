/**
 * L2 本机部门（军团）注册表：列出本机已装的 kind=legion 方案。
 *
 * 部门包和运营中心一样是方案包，装在同一个安装根下：
 *   <root>/installed.json            安装器锁文件（items[id].activePath / kind）
 *   <root>/<id>/<version+digest>/    只读代码目录（本方案自己就在这里）
 * 开发期（qiye-app 直接从方案仓库加载）没有 installed.json，退回仓库布局 solutions/<id>/。
 * 清单只信任格式合法的字段，坏清单跳过并记一条警告，不让一个坏包拖垮整页。
 */
const { existsSync, readFileSync, readdirSync } = require('node:fs');
const { join, dirname, resolve } = require('node:path');

const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function readJsonSafe(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** 从本方案包目录往上找安装根（含 installed.json）或方案仓库根（含 solutions/） */
function locateRoots(packageDir) {
  let dir = resolve(packageDir);
  for (let i = 0; i < 4; i++) {
    if (existsSync(join(dir, 'installed.json'))) return { kind: 'installed', root: dir };
    if (existsSync(join(dir, 'solutions')) && existsSync(join(dir, 'index.json'))) return { kind: 'repo', root: dir };
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

/** 列出候选部门包目录：[{ id, dir }] */
function candidateDirs(packageDir) {
  const loc = locateRoots(packageDir);
  if (!loc) return [];
  if (loc.kind === 'installed') {
    const lock = readJsonSafe(join(loc.root, 'installed.json')) || {};
    return Object.values(lock.items || {})
      .filter((it) => it && (it.kind === 'legion' || String(it.id || '').startsWith('legion-')) && it.activePath)
      .map((it) => ({ id: it.id, dir: join(loc.root, it.activePath) }));
  }
  const sol = join(loc.root, 'solutions');
  return readdirSync(sol)
    .filter((n) => n.startsWith('legion-'))
    .map((n) => ({ id: n, dir: join(sol, n) }));
}

/** 规范化一个部门清单；不合格返回 null */
function normalizeLegion(m, dir) {
  if (!m || m.kind !== 'legion' || !m.legion) return null;
  const L = m.legion;
  const roles = Array.isArray(L.roles) ? L.roles.filter((r) => typeof r === 'string' && r) : [];
  if (!roles.length || !L.summary) return null;
  const workflows = [];
  for (const rel of Array.isArray(L.workflows) ? L.workflows : []) {
    const wf = dir ? readJsonSafe(join(dir, rel)) : null;
    if (wf && Array.isArray(wf.steps) && wf.steps.length) workflows.push(wf);
  }
  return {
    id: m.id,
    name: String(m.name || m.id),
    short: String(L.short || m.name || m.id).slice(0, 6),
    shortEn: String(L.shortEn || ''),
    color: COLOR_RE.test(L.color || '') ? L.color : '#64748B',
    icon: String(L.icon || ''),
    summary: String(L.summary).slice(0, 200),
    routingHints: (Array.isArray(L.routingHints) ? L.routingHints : []).map(String).filter(Boolean),
    roles,
    leadRole: roles.includes(L.leadRole) ? L.leadRole : roles[0],
    defaultModel: typeof L.defaultModel === 'string' && L.defaultModel.includes('/') ? L.defaultModel : null,
    workbenches: (Array.isArray(L.workbenches) ? L.workbenches : []).map(String),
    workflows,
    version: String(m.version || ''),
    order: Number.isInteger(m.order) ? m.order : 9999,
  };
}

/** L11 自定义部门的 id 前缀（没有方案包，只存在运营中心数据里） */
const CUSTOM_PREFIX = 'legion-c-';

/**
 * L11：自定义部门（现场一句话造的）。角色只能从已装部门的角色里选（员工机上都有），负责人必须在角色里。
 * @returns {object|null} 与方案包部门同形状（custom=true），不合法返回 null
 */
function normalizeCustomLegion(raw, knownRoles, order = 8000) {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || '');
  if (!id.startsWith(CUSTOM_PREFIX) || !/^[a-z0-9-]{10,60}$/.test(id)) return null;
  const known = new Set(knownRoles);
  const roles = [...new Set((Array.isArray(raw.roles) ? raw.roles : []).map(String).filter((r) => known.has(r)))].slice(0, 12);
  const name = String(raw.name || '').trim().slice(0, 12);
  const summary = String(raw.summary || '').trim().slice(0, 200);
  if (!name || !summary || !roles.length) return null;
  const L = normalizeLegion(
    {
      id,
      kind: 'legion',
      name,
      order,
      legion: {
        short: String(raw.short || name).trim().slice(0, 4),
        color: raw.color,
        summary,
        routingHints: (Array.isArray(raw.routingHints) ? raw.routingHints : []).map((x) => String(x).trim().slice(0, 12)).filter(Boolean).slice(0, 20),
        roles,
        leadRole: raw.leadRole,
      },
    },
    null,
  );
  return L ? { ...L, custom: true } : null;
}

/** 本机已装的全部部门，按 order 排序 */
function listInstalledLegions(packageDir, log) {
  const out = [];
  const seen = new Set();
  for (const c of candidateDirs(packageDir)) {
    if (seen.has(c.id)) continue;
    const m = readJsonSafe(join(c.dir, 'solution.json'));
    const L = normalizeLegion(m, c.dir);
    if (!L) {
      if (log) log.warn(`部门包清单无效，已跳过：${c.id}`);
      continue;
    }
    seen.add(L.id);
    out.push(L);
  }
  return out.sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
}

/** 大屏 / 界面用的精简信息（不带工作流全文） */
function publicLegion(L) {
  return {
    id: L.id,
    name: L.name,
    short: L.short,
    shortEn: L.shortEn,
    color: L.color,
    icon: L.icon,
    summary: L.summary,
    staff: L.roles.length,
    leadRole: L.leadRole,
    workbenches: L.workbenches,
    custom: !!L.custom,
    workflows: L.workflows.map((w) => ({ id: w.id, name: w.name, approval: w.approval || null, steps: w.steps.length })),
    defaultModel: L.defaultModel,
  };
}

module.exports = { listInstalledLegions, normalizeLegion, normalizeCustomLegion, CUSTOM_PREFIX, publicLegion, locateRoots };
