/**
 * AI 应用中心：五大方向的场景目录。
 * 内置场景对应本工作台的页签或平台已有工作台，默认「已上线」；学校自己规划的场景可以新增，阶段由人维护。
 * 用量 = 近 30 天审计里该场景对应模块 / 动作的调用次数。
 */
import type { CaAuditEntry, CaDirection, CaModule, CaScenario, CaScenarioInput, CaStage } from '@totalclaw/ipc-contracts';
import { CA_DIRECTIONS } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';

interface Builtin {
  id: string;
  direction: CaDirection;
  name: string;
  desc: string;
  dept: string;
  target: string;
  /** 用量统计口径：审计里的模块（可再限定动作前缀） */
  usage: Array<{ module: CaModule; action?: string }>;
}

export function builtinScenarios(): Builtin[] {
  return [
    { id: 'plan-kb', direction: 'plan', name: i18nT('统一校园知识底座'), desc: i18nT('各部门制度、指南、FAQ 汇成一个知识库，问答与助教共用'), dept: i18nT('信息中心'), target: 'tab:kb', usage: [{ module: 'kb' }] },
    { id: 'plan-apps', direction: 'plan', name: i18nT('AI 应用规划与建设台账'), desc: i18nT('五大方向场景目录、建设阶段与责任部门'), dept: i18nT('信息中心'), target: 'tab:apps', usage: [{ module: 'apps' }] },
    { id: 'plan-ops', direction: 'plan', name: i18nT('模型服务与调用审计'), desc: i18nT('服务状态、调用留痕、数据保留与清理'), dept: i18nT('信息中心'), target: 'tab:ops', usage: [{ module: 'ops' }] },
    { id: 'teach-tutor', direction: 'teach', name: i18nT('课程助教'), desc: i18nT('学生问课程问题，只依据该课程资料作答'), dept: i18nT('教务处'), target: 'tab:teach', usage: [{ module: 'teach', action: 'tutor' }] },
    { id: 'teach-quiz', direction: 'teach', name: i18nT('智能出题'), desc: i18nT('从课程资料出题，每题附原文出处'), dept: i18nT('教务处'), target: 'tab:teach', usage: [{ module: 'teach', action: 'quiz' }] },
    { id: 'teach-grade', direction: 'teach', name: i18nT('作业批改'), desc: i18nT('客观题按答案判分，主观题给建议分由教师确认'), dept: i18nT('教务处'), target: 'tab:teach', usage: [{ module: 'teach', action: 'grade' }] },
    { id: 'teach-warning', direction: 'teach', name: i18nT('学业预警'), desc: i18nT('成绩与考勤算三级预警，辅导员复核后谈话'), dept: i18nT('学工处'), target: 'tab:warning', usage: [{ module: 'warning' }] },
    { id: 'teach-lesson', direction: 'teach', name: i18nT('教案生成'), desc: i18nT('按课程资料生成教案与课堂材料'), dept: i18nT('教务处'), target: 'route:/workbenches/edu-hub', usage: [] },
    { id: 'research-stats', direction: 'research', name: i18nT('科研成果统计'), desc: i18nT('按学院、类型、年度、级别统计成果与经费'), dept: i18nT('科研处'), target: 'tab:research', usage: [{ module: 'research', action: 'outputs' }] },
    { id: 'research-guide', direction: 'research', name: i18nT('申报指南解读'), desc: i18nT('抽取截止时间、申报条件、材料清单，每条附原文'), dept: i18nT('科研处'), target: 'tab:research', usage: [{ module: 'research', action: 'guide' }] },
    { id: 'research-writer', direction: 'research', name: i18nT('申报书与论文写作'), desc: i18nT('引用可核对的学术写作'), dept: i18nT('科研处'), target: 'route:/workbenches/academic-writer', usage: [] },
    { id: 'gov-doc', direction: 'gov', name: i18nT('公文助手'), desc: i18nT('通知、请示、报告、函、纪要，按国标版式导出 Word'), dept: i18nT('党政办'), target: 'tab:gov', usage: [{ module: 'gov', action: 'doc' }] },
    { id: 'gov-hotspot', direction: 'gov', name: i18nT('诉求热点分析'), desc: i18nT('师生诉求按领域、部门、时间统计热点与知识缺口'), dept: i18nT('党政办'), target: 'tab:gov', usage: [{ module: 'gov', action: 'hotspot' }] },
    { id: 'service-qa', direction: 'service', name: i18nT('校园智能问答'), desc: i18nT('有出处的回答，没依据不编、转部门'), dept: i18nT('学工处'), target: 'tab:qa', usage: [{ module: 'qa' }] },
    { id: 'service-mobile', direction: 'service', name: i18nT('学生手机扫码提问'), desc: i18nT('校园网内扫码即用，匿名会话'), dept: i18nT('信息中心'), target: 'tab:qa', usage: [{ module: 'mobile' }] },
    { id: 'service-ticket', direction: 'service', name: i18nT('转办闭环'), desc: i18nT('答不了的转部门，答复沉淀为 FAQ'), dept: i18nT('党政办'), target: 'tab:tickets', usage: [{ module: 'ticket' }] },
    { id: 'service-care', direction: 'service', name: i18nT('心理危机识别'), desc: i18nT('敏感问题立即给求助方式并置顶提醒'), dept: i18nT('学工处'), target: 'tab:tickets', usage: [] },
  ];
}

export function directionLabel(d: CaDirection): string {
  return { plan: i18nT('统一规划、建设与运维'), teach: i18nT('教学'), research: i18nT('科研'), gov: i18nT('校务治理'), service: i18nT('师生服务') }[d];
}

/** 存在 state 里的：内置场景的阶段 / 部门覆盖 + 自定义场景 */
export interface ScenarioStore {
  overrides: Record<string, { stage?: CaStage; dept?: string; note?: string }>;
  custom: Array<{ id: string; direction: CaDirection; name: string; desc: string; dept: string; stage: CaStage; note?: string }>;
}

export const emptyScenarioStore = (): ScenarioStore => ({ overrides: {}, custom: [] });

const STAGES: CaStage[] = ['planned', 'building', 'live'];

export function normalizeScenarioInput(raw: CaScenarioInput): CaScenarioInput {
  const name = String(raw?.name || '').trim().slice(0, 60);
  if (!name) throw new Error(i18nT('请填写场景名称'));
  return {
    id: raw.id,
    direction: CA_DIRECTIONS.includes(raw.direction) ? raw.direction : 'plan',
    name,
    desc: String(raw.desc || '').trim().slice(0, 200),
    dept: String(raw.dept || '').trim().slice(0, 30),
    stage: STAGES.includes(raw.stage) ? raw.stage : 'planned',
    note: String(raw.note || '').trim().slice(0, 300),
  };
}

export function usageCount(audit: readonly CaAuditEntry[], rules: Builtin['usage'], since: number): number {
  if (!rules.length) return 0;
  let n = 0;
  for (const a of audit) {
    if (Date.parse(a.at) < since) continue;
    if (rules.some((r) => r.module === a.module && (!r.action || a.action.startsWith(r.action)))) n++;
  }
  return n;
}

export function listScenarios(store: ScenarioStore, audit: readonly CaAuditEntry[], now = Date.now()): CaScenario[] {
  const since = now - 30 * 86_400_000;
  const out: CaScenario[] = builtinScenarios().map((b) => {
    const o = store.overrides[b.id] || {};
    return {
      id: b.id, direction: b.direction, name: b.name, desc: b.desc, dept: o.dept || b.dept, stage: o.stage || 'live',
      target: b.target, builtin: true, note: o.note, usage30d: usageCount(audit, b.usage, since),
    };
  });
  for (const c of store.custom) out.push({ ...c, builtin: false, usage30d: 0 });
  return out;
}
