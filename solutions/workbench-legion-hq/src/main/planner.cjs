/**
 * R2 按判定结果生成执行计划（运营中心自己的轻量 DAG，节点 = 某部门的一步）。
 *
 * - 只有一个部门且命中它的常用工作流（trigger）→ 展开该工作流（可能含跨部门步骤）；
 * - 否则每个部门一步，roleId = 部门负责人，按 dependsOn 连边；
 * - 多于一步时末尾由 AI 总经理汇总；
 * - 老板拍板（O10）：工作流声明了 approval、涉及 ≥4 个部门、或事情本身含「钱 / 签约 / 对外发布 / 录用」动作。
 *   这些动作 AI 只准备不执行。
 */

const APPROVAL_RULES = [
  { kind: 'payment', label: '付款', re: /付款|支付|打款|转账|下单|发工资|发薪/ },
  { kind: 'invoice', label: '开票', re: /开票|开发票|红冲/ },
  { kind: 'discount', label: '报价折扣', re: /折扣|让利|降价|优惠价/ },
  { kind: 'contract', label: '签约', re: /签约|签合同|签署|盖章/ },
  { kind: 'publish', label: '对外发布', re: /对外发布|正式发布|发布到|群发|发公告|发通稿/ },
  { kind: 'hire', label: '录用', re: /录用|发 ?offer|入职通知/i },
];
const APPROVAL_LABEL = Object.fromEntries(APPROVAL_RULES.map((r) => [r.kind, r.label]));

function approvalOf(text, workflow, legionCount) {
  if (workflow && workflow.approval) return { kind: workflow.approval, label: APPROVAL_LABEL[workflow.approval] || workflow.approval, reason: `「${workflow.name}」的最终动作由老板拍板` };
  const hit = APPROVAL_RULES.find((r) => r.re.test(String(text || '')));
  if (hit) return { kind: hit.kind, label: hit.label, reason: `涉及${hit.label}，AI 只准备、由老板拍板` };
  if (legionCount >= 4) return { kind: 'major', label: '重大事项', reason: `${legionCount} 个部门协同的重大事项，结果由老板确认` };
  return null;
}

function matchWorkflow(text, legion) {
  const t = String(text || '');
  return (legion.workflows || []).find((w) => (w.trigger || []).some((k) => k && t.includes(k))) || null;
}

/** 展开部门常用工作流；步骤所属部门不可用时剔除该步，下游改依赖它的上游 */
function expandWorkflow(wf, legionId, avail) {
  const byId = new Map(wf.steps.map((s) => [s.id, s]));
  const keep = new Set(wf.steps.filter((s) => avail.has(s.legionId || legionId)).map((s) => s.id));
  const resolveDeps = (ids, seen = new Set()) =>
    ids.flatMap((d) => {
      if (seen.has(d)) return [];
      seen.add(d);
      if (keep.has(d)) return [d];
      return resolveDeps(byId.get(d)?.dependsOn || [], seen);
    });
  return wf.steps
    .filter((s) => keep.has(s.id))
    .map((s) => {
      const L = avail.get(s.legionId || legionId);
      return {
        key: s.id,
        legionId: L.id,
        roleId: s.roleId && L.roles.includes(s.roleId) ? s.roleId : L.leadRole,
        goal: s.goal,
        deps: [...new Set(resolveDeps(s.dependsOn || []))],
      };
    });
}

/**
 * @param {string} text
 * @param {object} decision   triage() 的结果
 * @param {object[]} legions  可用部门（完整清单，含 workflows / roles）
 * @returns {{steps:object[], summary:boolean, approval:object|null, workflow:{id,name}|null}}
 */
function buildPlan(text, decision, legions) {
  const avail = new Map(legions.map((L) => [L.id, L]));
  let raw = [];
  let workflow = null;
  if (decision.legions.length === 1) {
    const L = avail.get(decision.legions[0]);
    const wf = L ? matchWorkflow(text, L) : null;
    if (wf) {
      workflow = { id: wf.id, name: wf.name, approval: wf.approval || null };
      raw = expandWorkflow(wf, L.id, avail);
    }
  }
  if (!raw.length) {
    raw = decision.steps
      .filter((s) => avail.has(s.legionId))
      .map((s) => ({ key: s.legionId, legionId: s.legionId, roleId: avail.get(s.legionId).leadRole, goal: s.goal, deps: s.dependsOn || [] }));
  }
  const idOf = new Map(raw.map((s, i) => [s.key, `s${i + 1}`]));
  const steps = raw.map((s, i) => ({
    id: `s${i + 1}`,
    legionId: s.legionId,
    roleId: s.roleId,
    goal: s.goal,
    dependsOn: s.deps.map((d) => idOf.get(d)).filter(Boolean),
  }));
  const legionCount = new Set(steps.map((s) => s.legionId)).size;
  return {
    steps,
    summary: steps.length > 1,
    approval: approvalOf(text, workflow, legionCount),
    workflow,
  };
}

module.exports = { buildPlan, approvalOf, matchWorkflow, APPROVAL_LABEL };
