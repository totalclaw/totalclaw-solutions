// 军团（kind=legion）清单校验：军团 = 一个可安装的部门方案，和机器解耦，一台机器可以装多个。
//
// solution.json 里 kind=legion 的方案必须带 legion 段：
//   legion.short / color / icon       大屏与军团页的显示
//   legion.summary                    给 AI 总经理判定「这件事要不要这个部门」用（一两句话）
//   legion.routingHints               模型判定失败时的关键词兜底
//   legion.roles / leadRole           部门里的 AI 员工（qiye-app 角色 id）与负责人
//   legion.workbenches                关联工作台（本仓库方案 id）
//   legion.workflows                  部门常用工作流（包内相对路径，节点带 legionId / roleId）
//   legion.defaultModel               为空 = 跟随所在机器的全局模型
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const ROLE_ID_RE = /^[a-z0-9][a-z0-9_-]{1,99}$/;

/** 收集 qiye-app roles/ 下的全部角色 id（文件名去 .md；bundled 与 community 都算） */
export function loadRoleIds(rolesDir) {
  if (!rolesDir || !existsSync(rolesDir)) return null;
  const ids = new Set();
  const visit = (dir, depth) => {
    if (depth > 4) return;
    for (const name of readdirSync(dir)) {
      if (name.startsWith('.') || name === 'node_modules' || name === 'scripts' || name === 'examples' || name === 'evals') continue;
      const abs = join(dir, name);
      const st = statSync(abs);
      if (st.isDirectory()) visit(abs, depth + 1);
      else if (name.endsWith('.md') && !/^[A-Z]/.test(name)) ids.add(name.slice(0, -3));
    }
  };
  visit(rolesDir, 0);
  return ids;
}

/**
 * 校验单个军团清单。返回错误文本数组（空 = 通过）。
 * @param {object} m            solution.json
 * @param {string} dir          方案目录
 * @param {object} ctx
 * @param {Set<string>} ctx.solutionIds  仓库全部方案 id（校验关联工作台）
 * @param {Set<string>|null} ctx.roleIds  角色 id 全集；null = 找不到 qiye-app，跳过角色存在性检查
 */
export function validateLegion(m, dir, { solutionIds, roleIds }) {
  const errors = [];
  const L = m.legion;
  if (!L || typeof L !== 'object') return ['kind=legion 必须有 legion 段'];
  for (const k of ['short', 'summary', 'icon']) if (!L[k] || typeof L[k] !== 'string') errors.push(`legion.${k} 必填`);
  if (typeof L.short === 'string' && L.short.length > 6) errors.push(`legion.short 最多 6 个字（大屏节点放不下）：${L.short}`);
  if (typeof L.summary === 'string' && L.summary.length > 200) errors.push('legion.summary 最多 200 字（判定提示词里每个部门只放一句）');
  if (!COLOR_RE.test(L.color || '')) errors.push(`legion.color 必须是 #RRGGBB：${L.color}`);
  if (!Array.isArray(L.routingHints) || !L.routingHints.length) errors.push('legion.routingHints 至少一个关键词');
  else if (L.routingHints.some((h) => typeof h !== 'string' || !h.trim())) errors.push('legion.routingHints 不能有空词');
  if (!Array.isArray(L.roles) || !L.roles.length) errors.push('legion.roles 至少一个角色');
  else {
    const seen = new Set();
    for (const r of L.roles) {
      if (typeof r !== 'string' || !ROLE_ID_RE.test(r)) errors.push(`legion.roles 角色 id 不合法：${r}`);
      else if (seen.has(r)) errors.push(`legion.roles 重复：${r}`);
      else if (roleIds && !roleIds.has(r)) errors.push(`legion.roles 角色在 qiye-app roles/ 中不存在：${r}`);
      seen.add(r);
    }
    if (!L.roles.includes(L.leadRole)) errors.push(`legion.leadRole（${L.leadRole}）必须在 legion.roles 里`);
  }
  if (L.defaultModel != null && (typeof L.defaultModel !== 'string' || !L.defaultModel.includes('/'))) errors.push('legion.defaultModel 为空或 provider/model');
  for (const w of L.workbenches || []) if (!solutionIds.has(w)) errors.push(`legion.workbenches 关联的方案不存在：${w}`);
  for (const rel of L.workflows || []) {
    const abs = join(dir, rel);
    if (!existsSync(abs)) {
      errors.push(`legion.workflows 文件不存在：${rel}`);
      continue;
    }
    let wf;
    try {
      wf = JSON.parse(readFileSync(abs, 'utf8'));
    } catch (e) {
      errors.push(`legion.workflows ${rel} 不是合法 JSON：${e.message}`);
      continue;
    }
    for (const e of validateLegionWorkflow(wf, m.id, L.roles || [])) errors.push(`${rel}：${e}`);
  }
  if (m.runtime?.runner !== 'legion') errors.push('kind=legion 的 runtime.runner 必须是 legion');
  if (m.access?.requiresSolutionGrant) errors.push('军团包随运营中心授权，自己不单独授权（access.requiresSolutionGrant=false）');
  return errors;
}

/**
 * 部门常用工作流：{ id, name, trigger: string[], steps: [{ id, legionId, roleId, goal, dependsOn: [] }] }
 * 步骤只允许本部门（legionId == 自己）或别的军团 id（跨部门工作流，由运营中心按装机情况派发）。
 */
export function validateLegionWorkflow(wf, legionId, roles) {
  const errors = [];
  if (!wf || typeof wf !== 'object') return ['不是对象'];
  if (!wf.id || !/^[a-z0-9][a-z0-9-]{1,63}$/.test(wf.id)) errors.push(`id 不合法：${wf.id}`);
  if (!wf.name) errors.push('name 必填');
  if (!Array.isArray(wf.steps) || !wf.steps.length) return [...errors, 'steps 至少一步'];
  const ids = new Set();
  for (const s of wf.steps) {
    if (!s.id || ids.has(s.id)) errors.push(`步骤 id 缺失或重复：${s.id}`);
    ids.add(s.id);
    if (!s.goal) errors.push(`步骤 ${s.id} 缺 goal`);
    if (!s.legionId) errors.push(`步骤 ${s.id} 缺 legionId`);
    if (s.legionId === legionId && s.roleId && !roles.includes(s.roleId)) errors.push(`步骤 ${s.id} 的 roleId ${s.roleId} 不在本部门 roles 里`);
  }
  for (const s of wf.steps) for (const d of s.dependsOn || []) if (!ids.has(d)) errors.push(`步骤 ${s.id} 依赖不存在的步骤 ${d}`);
  // 成环检查
  const state = new Map();
  const byId = new Map(wf.steps.map((s) => [s.id, s]));
  const visit = (id) => {
    if (state.get(id) === 1) return true;
    if (state.get(id) === 2) return false;
    state.set(id, 1);
    for (const d of byId.get(id)?.dependsOn || []) if (byId.has(d) && visit(d)) return true;
    state.set(id, 2);
    return false;
  };
  if (wf.steps.some((s) => visit(s.id))) errors.push('步骤依赖成环');
  return errors;
}
