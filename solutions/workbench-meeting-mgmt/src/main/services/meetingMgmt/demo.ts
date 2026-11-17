/**
 * 会议智能管理 · 演示组织与演示数据（和原型图同名）。
 *
 * 组织：6 个部门（运营中心、研发部、质量部、采购部、生产部、工艺部，各设负责人）、20 人；管理员 / 默认当前身份「林晓」。
 * 项目：「数字化工厂一期」（负责人林晓）「A2 量产导入项目」（负责人陈立峰）「华东生产基地扩产」（负责人吴刚）。
 * 会议覆盖各状态（含待终审的「数字化工厂周例会」：MES 二期上线范围 / 设备采购与到货 / 培训与上线切换，决议 4 条）；
 * 任务覆盖待接收 / 进行中 / 逾期 / 待复核 / 待裁决（「主控芯片到货跟踪」：周婷与刘洋就 12-15 还是 12-20 有分歧）。
 * 时间都按「现在」往前 / 往后推，任何时候载入都是「正在进行中」的样子。
 *
 * 另有一份演示用文字记录 DEMO_TRANSCRIPT（带发言人昵称），不靠音频也能从新建会议一路走通闭环。
 *
 * 这里的人名、部门名、会议内容都是演示用的「用户数据」，不是界面文案，按惯例不翻译（i18n-ignore 标在各声明上）。
 */
import type {
  MmConfirmation, MmDecision, MmDept, MmMeeting, MmMeetingStatus, MmNotice, MmObjection, MmOrg, MmPerson, MmPlan, MmPlanItem,
  MmProgressLog, MmProject, MmSegment, MmSpeakerSlot, MmTask, MmTaskStatus, MmTopic,
} from '../../../shared/meetingMgmt/types';
import { addDaysYmd, ymd } from './rules';

const DAY = 86_400_000;
const HOUR = 3_600_000;

/** 演示组织的管理员 / 默认当前身份 */
export const DEMO_ADMIN_ID = 'linxiao';

// i18n-ignore：演示组织的部门名是用户数据
const DEPTS: Array<[id: string, name: string, leaderId: string]> = [
  ['d_ops', '运营中心', 'linxiao'],
  ['d_rd', '研发部', 'zhaolei'],
  ['d_qa', '质量部', 'sunhao'],
  ['d_pur', '采购部', 'zhouting'],
  ['d_prod', '生产部', 'wugang'],
  ['d_proc', '工艺部', 'zhengkai'],
];

// i18n-ignore：演示组织的人名、职务是用户数据
const PEOPLE: Array<[id: string, name: string, deptId: string, title: string, leaderId?: string]> = [
  ['linxiao', '林晓', 'd_ops', '运营总监'],
  ['chenlifeng', '陈立峰', 'd_ops', '项目总监', 'linxiao'],
  ['liuyang', '刘洋', 'd_ops', '项目经理', 'linxiao'],
  ['lina', '李娜', 'd_ops', '运营专员', 'linxiao'],
  ['zhaolei', '赵磊', 'd_rd', '研发经理'],
  ['qiancheng', '钱程', 'd_rd', '硬件工程师', 'zhaolei'],
  ['huanghai', '黄海', 'd_rd', '软件工程师', 'zhaolei'],
  ['machao', '马超', 'd_rd', '测试工程师', 'zhaolei'],
  ['sunhao', '孙浩', 'd_qa', '质量经理'],
  ['yangfan', '杨帆', 'd_qa', '质量工程师', 'sunhao'],
  ['zhulin', '朱琳', 'd_qa', '检验员', 'sunhao'],
  ['zhouting', '周婷', 'd_pur', '采购经理'],
  ['hejing', '何静', 'd_pur', '采购专员', 'zhouting'],
  ['xuliang', '许亮', 'd_pur', '供应商管理', 'zhouting'],
  ['wugang', '吴刚', 'd_prod', '生产经理'],
  ['luojun', '罗军', 'd_prod', '车间主任', 'wugang'],
  ['gaofeng', '高峰', 'd_prod', '生产计划员', 'wugang'],
  ['zhengkai', '郑凯', 'd_proc', '工艺经理'],
  ['liangyu', '梁宇', 'd_proc', '工艺工程师', 'zhengkai'],
  ['songjia', '宋佳', 'd_proc', '工艺工程师', 'zhengkai'],
];

/** 演示组织：6 部门 20 人（演示组织里 wecomUserId 与 id 相同） */
export function buildDemoOrg(): { depts: MmDept[]; people: MmPerson[] } {
  return {
    depts: DEPTS.map(([id, name, leaderId]) => ({ id, name, leaderIds: [leaderId] })),
    people: PEOPLE.map(([id, name, deptId, title, leaderId]) => ({ id, name, deptId, title, wecomUserId: id, ...(leaderId ? { leaderId } : {}) })),
  };
}

// ─── 演示数据 ─────────────────────────────────────────────────────────

type Line = [personId: string | null, text: string];

interface MeetingSpec {
  id: string;
  projectId: string;
  title: string;
  time: number;
  hostId: string;
  attendeeIds: string[];
  status: MmMeetingStatus;
  lines?: Line[];
  /** [议题, 第几句（从 0 起）] */
  topics?: Array<[string, number[]]>;
  decisions?: Array<[string, number[]]>;
  summaryLines?: string[];
  /** 已确认的人（其余发言人未确认）；不给 = 全部已确认 */
  confirmed?: string[];
  processedAt?: number;
  reviewStartedAt?: number;
  finalizedAt?: number;
  taskDecision?: 'generate' | 'none';
  plan?: MmPlan;
  matchedBy?: MmSpeakerSlot['matchedBy'];
}

function buildMeeting(s: MeetingSpec): MmMeeting {
  const lines = s.lines || [];
  const labels = new Map<string, string>();
  let unknown = 0;
  const speakers: MmSpeakerSlot[] = [];
  const labelOf = (pid: string | null, i: number): string => {
    if (!pid) {
      // 没识别出来的发言人：同一段连续没认出的算同一个人
      const prev = i > 0 && lines[i - 1][0] === null ? speakers[speakers.length - 1]?.label : '';
      if (prev) return prev;
      unknown += 1;
      const label = `S${labels.size + unknown}`;
      speakers.push({ label });
      return label;
    }
    let label = labels.get(pid);
    if (!label) {
      label = `S${labels.size + unknown + 1}`;
      labels.set(pid, label);
      speakers.push({ label, personId: pid, matchedBy: s.matchedBy || 'voiceprint', score: 0.82 });
    }
    return label;
  };
  let t = 3;
  const segments: MmSegment[] = lines.map(([pid, text], i) => {
    const len = Math.max(6, Math.round(text.length / 4.5));
    const seg: MmSegment = { id: `${s.id}_g${i + 1}`, start: t, end: t + len, speakerLabel: labelOf(pid, i), text };
    t += len + 2;
    return seg;
  });
  const topics: MmTopic[] = (s.topics || []).map(([title, idx], i) => {
    const ids = idx.map((n) => segments[n]?.id).filter(Boolean) as string[];
    for (const id of ids) { const seg = segments.find((x) => x.id === id); if (seg) seg.topicId = `${s.id}_t${i + 1}`; }
    return { id: `${s.id}_t${i + 1}`, title, segmentIds: ids };
  });
  const decisions: MmDecision[] = (s.decisions || []).map(([text, idx], i) => ({
    id: `${s.id}_d${i + 1}`, text, segmentIds: idx.map((n) => segments[n]?.id).filter(Boolean) as string[],
  }));
  const persons = speakers.filter((x) => x.personId).map((x) => x.personId!) as string[];
  const processedAt = s.processedAt ?? s.time + 2 * HOUR;
  const afterProcess = !['pending_upload', 'processing', 'failed'].includes(s.status);
  const confirmations: MmConfirmation[] = afterProcess && s.status !== 'pending_assign'
    ? persons.map((pid) => {
      const done = s.confirmed ? s.confirmed.includes(pid) : true;
      return done
        ? { personId: pid, status: 'confirmed' as const, requestedAt: processedAt, confirmedAt: processedAt + HOUR }
        : { personId: pid, status: 'pending' as const, requestedAt: processedAt };
    })
    : [];
  return {
    id: s.id, projectId: s.projectId, title: s.title, time: s.time, source: 'offline', hostId: s.hostId,
    attendeeIds: [...new Set([s.hostId, ...s.attendeeIds, ...persons])], createdBy: s.hostId, createdAt: s.time - DAY,
    status: s.status,
    files: afterProcess ? [{ id: `${s.id}_f1`, name: `${s.title}.m4a`, kind: 'audio', size: 18_400_000, path: '', uploadedAt: s.time + HOUR }] : [],
    ...(afterProcess ? { process: { stage: 'done' as const, progress: 100, startedAt: s.time + HOUR, finishedAt: processedAt, log: [] } } : {}),
    speakers: afterProcess ? speakers : [],
    segments: afterProcess ? segments : [],
    topics: afterProcess ? topics : [],
    decisions: afterProcess ? decisions : [],
    summaryLines: afterProcess ? (s.summaryLines || decisions.slice(0, 3).map((d) => d.text)) : [],
    confirmations,
    ...(s.reviewStartedAt ? { reviewStartedAt: s.reviewStartedAt } : {}),
    ...(s.finalizedAt ? { finalizedAt: s.finalizedAt, finalizedBy: s.hostId } : {}),
    ...(s.taskDecision ? { taskDecision: s.taskDecision } : {}),
    ...(s.plan ? { plan: s.plan } : {}),
    taskIds: [],
    ...(afterProcess ? { durationSec: t } : {}),
  };
}

function planOf(meetingId: string, generatedAt: number, items: Array<[deptId: string, title: string, standard: string, due: string, decisionNo?: number]>, ownerId?: string, confirmedAt?: number): MmPlan {
  const planItems: MmPlanItem[] = items.map(([deptId, title, standard, due, decisionNo], i) => ({
    id: `${meetingId}_p${i + 1}`, deptId, title, standard, due, ...(decisionNo ? { decisionId: `${meetingId}_d${decisionNo}` } : {}),
  }));
  return {
    generatedAt,
    // i18n-ignore：演示方案概述是用户数据
    summary: `根据会议决议拆分为 ${planItems.length} 项任务，每项对应一个责任部门。`,
    ...(ownerId ? { ownerId } : {}),
    items: planItems,
    ...(confirmedAt ? { confirmedAt } : {}),
  };
}

interface TaskSpec {
  meeting: MmMeeting;
  item: number;
  assigneeId: string;
  status: MmTaskStatus;
  percent?: number;
  createdAt: number;
  acceptedAt?: number;
  doneAt?: number;
  progress?: Array<[at: number, percent: number, note: string]>;
  objection?: MmObjection;
  extraEvents?: MmTask['events'];
}

function buildTask(s: TaskSpec): MmTask {
  const it = s.meeting.plan!.items[s.item];
  const owner = s.meeting.plan!.ownerId!;
  const events: MmTask['events'] = [{ at: s.createdAt, by: owner, action: 'created' }];
  if (s.acceptedAt) events.push({ at: s.acceptedAt, by: s.assigneeId, action: 'accepted' });
  const progressLog: MmProgressLog[] = (s.progress || []).map(([at, percent, note]) => ({ at, by: s.assigneeId, status: 'in_progress', percent, note }));
  for (const p of progressLog) events.push({ at: p.at, by: s.assigneeId, action: 'progress', note: p.note });
  if (s.doneAt) {
    progressLog.push({ at: s.doneAt, by: s.assigneeId, status: 'done', percent: 100, note: '' });
    events.push({ at: s.doneAt, by: s.assigneeId, action: 'done' });
  }
  events.push(...(s.extraEvents || []));
  events.sort((a, b) => a.at - b.at);
  return {
    id: `${s.meeting.id}_k${s.item + 1}`, projectId: s.meeting.projectId, meetingId: s.meeting.id, planItemId: it.id, deptId: it.deptId,
    assigneeId: s.assigneeId, ownerId: owner, title: it.title, standard: it.standard, due: it.due, status: s.status,
    percent: s.status === 'done' ? 100 : (s.percent ?? 0), createdAt: s.createdAt,
    ...(s.acceptedAt ? { acceptedAt: s.acceptedAt } : {}), ...(s.doneAt ? { doneAt: s.doneAt } : {}),
    ...(s.objection ? { objection: s.objection } : {}),
    objectionHistory: [], progressLog, events, reminders: {},
  };
}

/** 主控芯片的截止日：今年 12-15（已过了就用明年的），异议建议 12-20 */
function chipDates(now: number): { due: string; suggested: string } {
  const d = new Date(now);
  const year = d.getMonth() === 11 && d.getDate() > 15 ? d.getFullYear() + 1 : d.getFullYear();
  return { due: `${year}-12-15`, suggested: `${year}-12-20` };
}

export interface DemoData {
  projects: MmProject[];
  meetings: MmMeeting[];
  tasks: MmTask[];
  notices: MmNotice[];
}

/** 演示数据（按 now 推时间）；人员 id 对应 buildDemoOrg() */
export function buildDemoData(now: number): DemoData {
  const today = ymd(now);
  const due = (days: number): string => addDaysYmd(today, days);
  const chip = chipDates(now);
  const md = (s: string): string => s.slice(5);

  // i18n-ignore：演示项目、会议、任务内容是用户数据
  const projects: MmProject[] = [
    { id: 'pj_dfactory', name: '数字化工厂一期', desc: 'MES 系统建设与产线数字化改造，一期覆盖总装线与检测线，年底前上线。', ownerId: 'linxiao', memberIds: [], status: 'active', createdAt: now - 30 * DAY, createdBy: 'linxiao', weeklyReports: [] },
    { id: 'pj_a2', name: 'A2 量产导入项目', desc: 'A2 产品从试产到量产的导入：工艺文件、物料齐套、排产与首件检验。', ownerId: 'chenlifeng', memberIds: [], status: 'active', createdAt: now - 25 * DAY, createdBy: 'linxiao', weeklyReports: [] },
    { id: 'pj_east', name: '华东生产基地扩产', desc: '华东基地新增两条装配线：产能测算、设备选型与采购、基建配套。', ownerId: 'wugang', memberIds: [], status: 'active', createdAt: now - 40 * DAY, createdBy: 'linxiao', weeklyReports: [] },
  ];

  // ── 数字化工厂一期 ──
  // i18n-ignore：演示会议内容
  const kickoff = buildMeeting({
    id: 'mt_df_kickoff', projectId: 'pj_dfactory', title: '数字化工厂启动会', time: now - 14 * DAY, hostId: 'linxiao',
    attendeeIds: ['liuyang', 'zhaolei', 'zhouting', 'sunhao', 'lina'], status: 'dispatched',
    lines: [
      ['linxiao', '数字化工厂一期今天正式启动，目标是年底前 MES 在总装线和检测线两条线上线。'],
      ['liuyang', '我来做这个项目的任务负责人，统一跟进各部门的进度。'],
      ['zhaolei', 'MES 二期的需求还要和各车间再确认一轮，研发这边下周开始排。'],
      ['zhouting', '设备主控芯片要提前锁定货源，原厂交期可能比较长。'],
      ['sunhao', '质量部同步出一版设备点检标准，上线前要用起来。'],
      ['lina', '上线培训计划运营中心可以牵头编制。'],
      ['linxiao', '好，那就按这个分工，各部门把任务接下来。'],
    ],
    topics: [['项目目标与分工', [0, 1, 6]], ['各部门准备事项', [2, 3, 4, 5]]],
    decisions: [
      ['年底前 MES 在总装线、检测线两条线上线', [0]],
      ['主控芯片提前锁定货源并跟踪到货', [3]],
      ['质量部制定设备点检标准', [4]],
      ['运营中心牵头编制上线培训计划', [5]],
    ],
    summaryLines: ['数字化工厂一期正式启动，年底前 MES 在总装线和检测线上线', '刘洋任任务负责人，统一跟进各部门进度', '主控芯片提前锁定货源，质量部出点检标准，运营中心编培训计划'],
    processedAt: now - 14 * DAY + 2 * HOUR, finalizedAt: now - 13.5 * DAY, taskDecision: 'generate',
  });
  kickoff.plan = planOf(kickoff.id, now - 13.4 * DAY, [
    ['d_pur', '主控芯片到货跟踪', '锁定主控芯片货源，按期到货并完成来料检验，每周同步一次原厂排产', chip.due, 2],
    ['d_rd', 'MES 二期需求确认', '与总装、检测两个车间逐项确认需求，输出需求确认书并双方签字', due(5), 1],
    ['d_ops', '上线培训计划编制', '输出两轮全员培训计划（含课表、讲师、考核方式），覆盖两条线全部班组', due(-2), 4],
    ['d_qa', '设备点检标准制定', '覆盖两条线全部关键设备的点检项目、周期与判定标准', due(-3), 3],
  ], 'liuyang', now - 13 * DAY);

  // i18n-ignore：演示会议内容
  const weekly = buildMeeting({
    id: 'mt_df_weekly', projectId: 'pj_dfactory', title: '数字化工厂周例会', time: now - 26 * HOUR, hostId: 'linxiao',
    attendeeIds: ['zhaolei', 'zhouting', 'zhengkai', 'liuyang', 'wugang'], status: 'pending_review',
    lines: [
      ['linxiao', '今天过三件事：MES 二期上线范围、设备采购与到货、培训与上线切换。先说范围。'],
      ['zhaolei', '研发这边建议二期首批只上总装线和检测线，仓储模块的接口还没联调完，放第二批更稳。'],
      ['zhengkai', '工艺部同意。两条线的工艺路线数据，我们 12 月第一周前可以整理完。'],
      ['linxiao', '那就定下来：首批上总装线和检测线，仓储放第二批。'],
      ['zhouting', `主控芯片原厂交期偏紧，目前回复是 12 月中旬，我们在同步找备选渠道。`],
      ['liuyang', `芯片是联调的前置条件，目标还是按 ${md(chip.due)} 到货，再晚会压缩联调时间。`],
      ['wugang', '生产这边扫码枪和工控机已经到了一半，剩下的下周到。'],
      ['linxiao', `芯片按 ${md(chip.due)} 到货为目标，采购部同步启动备选渠道，每周例会同步一次。`],
      ['liuyang', '上线切换建议放在周末，避开工作日的生产。'],
      ['wugang', '可以，切换前希望一线班组长至少培训两轮。'],
      ['linxiao', '那就周末切换，切换前完成两轮全员培训，培训计划运营中心来出。'],
    ],
    topics: [['MES 二期上线范围', [0, 1, 2, 3]], ['设备采购与到货', [4, 5, 6, 7]], ['培训与上线切换', [8, 9, 10]]],
    decisions: [
      ['MES 二期首批上线总装线与检测线，仓储模块放到第二批', [1, 3]],
      [`主控芯片以 ${md(chip.due)} 到货为目标，采购部同步启动备选渠道`, [4, 5, 7]],
      ['工艺部 12 月第一周前完成两条线的工艺路线数据整理', [2]],
      ['上线切换安排在周末，切换前完成两轮全员培训', [8, 9, 10]],
    ],
    summaryLines: ['MES 二期首批上线总装线与检测线，仓储模块放到第二批', `主控芯片以 ${md(chip.due)} 到货为目标，采购部同步启动备选渠道`, '上线切换安排在周末，切换前完成两轮全员培训'],
    processedAt: now - 24 * HOUR, reviewStartedAt: now - 5 * HOUR,
  });

  // ── A2 量产导入项目 ──
  // i18n-ignore：演示会议内容
  const a2Kickoff = buildMeeting({
    id: 'mt_a2_kickoff', projectId: 'pj_a2', title: 'A2 量产导入启动会', time: now - 10 * DAY, hostId: 'chenlifeng',
    attendeeIds: ['zhengkai', 'zhouting', 'wugang', 'sunhao', 'qiancheng'], status: 'dispatched',
    lines: [
      ['chenlifeng', 'A2 下个月进入小批量试产，今天把量产导入的分工定下来。'],
      ['zhengkai', '试产工艺文件工艺部来编，下周可以出初稿。'],
      ['zhouting', '物料齐套我们按 BOM 逐项确认，长周期物料先下单。'],
      ['wugang', '产线排产和人员要等工艺文件出来再细排。'],
      ['sunhao', '首件检验方案质量部负责，覆盖全部关键参数。'],
      ['qiancheng', '研发会配合解答试产中遇到的设计问题。'],
    ],
    topics: [['量产导入分工', [0, 1, 2, 3, 4, 5]]],
    decisions: [
      ['工艺部编制试产工艺文件', [1]],
      ['采购部完成 A2 物料齐套确认', [2]],
      ['生产部完成产线排产与人员安排', [3]],
      ['质量部输出首件检验方案', [4]],
    ],
    processedAt: now - 10 * DAY + 2 * HOUR, finalizedAt: now - 9.6 * DAY, taskDecision: 'generate',
  });
  a2Kickoff.plan = planOf(a2Kickoff.id, now - 9.5 * DAY, [
    ['d_proc', '试产工艺文件编制', '输出 A2 试产全工序作业指导书与工艺参数表', due(7), 1],
    ['d_pur', 'A2 物料齐套确认', '按 BOM 逐项确认到料时间，长周期物料全部下单', due(3), 2],
    ['d_prod', '产线排产与人员安排', '输出试产排产计划与各工位人员安排', due(10), 3],
    ['d_qa', '首件检验方案', '首件检验覆盖全部 32 项关键参数，形成检验记录模板', due(6), 4],
  ], 'chenlifeng', now - 9 * DAY);

  // i18n-ignore：演示会议内容
  const a2Review = buildMeeting({
    id: 'mt_a2_review', projectId: 'pj_a2', title: 'A2 试产问题复盘会', time: now - 21 * HOUR, hostId: 'chenlifeng',
    attendeeIds: ['linxiao', 'zhengkai', 'sunhao', 'qiancheng'], status: 'pending_confirm',
    lines: [
      ['chenlifeng', '复盘一下第一轮试产暴露出来的问题。'],
      ['sunhao', '首件有两项尺寸超差，集中在外壳卡扣的位置。'],
      ['zhengkai', '卡扣问题和夹具定位有关，工艺这边调整夹具后再验证一次。'],
      ['qiancheng', '设计上卡扣公差可以放宽 0.05，我回去出设计变更。'],
      ['linxiao', '运营中心会把复盘结论同步进 A2 的整体排期。'],
      ['chenlifeng', '第二轮试产定在下周三，问题全部闭环后再进量产评审。'],
    ],
    topics: [['试产问题', [0, 1, 2, 3]], ['后续安排', [4, 5]]],
    decisions: [
      ['调整夹具定位后重新验证卡扣尺寸', [2]],
      ['卡扣公差放宽 0.05，研发出设计变更', [3]],
      ['第二轮试产定在下周三', [5]],
    ],
    confirmed: ['chenlifeng', 'zhengkai', 'qiancheng'],
    processedAt: now - 18 * HOUR,
  });

  // i18n-ignore：演示会议标题
  const a2Weekly = buildMeeting({
    id: 'mt_a2_weekly', projectId: 'pj_a2', title: 'A2 量产导入周会', time: now - 2 * HOUR, hostId: 'chenlifeng',
    attendeeIds: ['zhouting', 'wugang', 'zhengkai'], status: 'pending_upload',
  });

  // ── 华东生产基地扩产 ──
  // i18n-ignore：演示会议内容
  const eastPlan = buildMeeting({
    id: 'mt_east_plan', projectId: 'pj_east', title: '扩产规划评审会', time: now - 3 * DAY, hostId: 'wugang',
    attendeeIds: ['linxiao', 'zhengkai', 'zhouting', 'luojun'], status: 'plan_confirm',
    lines: [
      ['wugang', '华东基地扩产今天评审整体规划，新增两条装配线。'],
      ['luojun', '按现在的订单预测，新线投产后产能能提升 40% 左右。'],
      ['zhengkai', '新线设备清单工艺部来出，和现有线尽量通用。'],
      ['zhouting', '设备采购预算要等清单出来再细算。'],
      ['linxiao', '这几项运营中心牵头跟进，我来做任务负责人。'],
    ],
    topics: [['扩产规划', [0, 1]], ['分工', [2, 3, 4]]],
    decisions: [
      ['新增两条装配线', [0]],
      ['生产部完成产能测算报告', [1]],
      ['工艺部输出新线设备清单', [2]],
      ['采购部编制设备采购预算', [3]],
    ],
    processedAt: now - 3 * DAY + 2 * HOUR, finalizedAt: now - 2.5 * DAY, taskDecision: 'generate',
  });
  eastPlan.plan = planOf(eastPlan.id, now - 2.4 * DAY, [
    ['d_prod', '产能测算报告', '按订单预测测算新线产能与人员需求，输出测算报告', due(10), 2],
    ['d_proc', '新线设备清单', '输出两条新线的设备清单与技术要求，标注与现有线通用的部分', due(14), 3],
    ['d_pur', '设备采购预算', '按设备清单询价并编制采购预算', due(21), 4],
  ], 'linxiao');

  // i18n-ignore：演示会议内容
  const eastCapacity = buildMeeting({
    id: 'mt_east_capacity', projectId: 'pj_east', title: '产能测算讨论会', time: now - 22 * HOUR, hostId: 'wugang',
    attendeeIds: ['luojun', 'gaofeng'], status: 'pending_assign',
    lines: [
      ['wugang', '今天把新线的产能测算口径对一下。'],
      [null, '按两班倒算，单线日产能大约 1200 台。'],
      ['luojun', '换型时间要算进去，实际能到 1100 台就不错了。'],
      [null, '那测算报告里按 1100 台做基准，1200 台做上限。'],
    ],
    topics: [['产能测算口径', [0, 1, 2, 3]]],
    decisions: [['产能测算按单线日产 1100 台做基准、1200 台做上限', [3]]],
    processedAt: now - 20 * HOUR,
  });

  // i18n-ignore：演示会议内容
  const eastSite = buildMeeting({
    id: 'mt_east_site', projectId: 'pj_east', title: '选址沟通会', time: now - 20 * DAY, hostId: 'wugang',
    attendeeIds: ['linxiao', 'luojun'], status: 'ended',
    lines: [
      ['wugang', '新线放在三号厂房东侧，地面承重已经确认过了。'],
      ['linxiao', '同意，这个会只是通报，不用拆任务。'],
      ['luojun', '东侧通道要保留，物流车要能进。'],
    ],
    topics: [['选址', [0, 1, 2]]],
    decisions: [['新线放在三号厂房东侧，保留东侧物流通道', [0, 2]]],
    processedAt: now - 20 * DAY + 2 * HOUR, finalizedAt: now - 19.5 * DAY, taskDecision: 'none',
  });

  // i18n-ignore：演示会议内容
  const eastEquip = buildMeeting({
    id: 'mt_east_equip', projectId: 'pj_east', title: '设备选型会', time: now - 2 * DAY, hostId: 'wugang',
    attendeeIds: ['zhengkai', 'liangyu'], status: 'finalized',
    lines: [
      ['wugang', '新线贴片机选型今天定一下，两家供应商的方案都看过了。'],
      ['zhengkai', '工艺上更倾向 A 方案，换线速度快，和现有线的程序也能通用。'],
      ['liangyu', 'A 方案的设备我在别的工厂调过，稳定性没问题。'],
      ['wugang', '那就定 A 方案，下一步出详细技术协议。'],
    ],
    topics: [['贴片机选型', [0, 1, 2, 3]]],
    decisions: [['新线贴片机选用 A 方案', [1, 3]], ['工艺部出详细技术协议', [3]]],
    processedAt: now - 2 * DAY + 2 * HOUR, finalizedAt: now - 1.2 * DAY,
  });

  // i18n-ignore：演示会议内容
  const eastBuild = buildMeeting({
    id: 'mt_east_build', projectId: 'pj_east', title: '基建进度协调会', time: now - 4 * DAY, hostId: 'wugang',
    attendeeIds: ['luojun', 'gaofeng', 'zhouting'], status: 'pending_owner',
    lines: [
      ['wugang', '三号厂房东侧的地面改造下周开工。'],
      ['luojun', '施工期间东侧通道要临时封闭，物流要改走北门。'],
      ['zhouting', '施工方的合同这周可以签下来。'],
      ['gaofeng', '改造期间排产会受点影响，我提前调整计划。'],
    ],
    topics: [['基建进度', [0, 1, 2, 3]]],
    decisions: [['地面改造下周开工，期间物流改走北门', [0, 1]], ['采购部本周签订施工合同', [2]], ['生产部提前调整改造期间的排产', [3]]],
    processedAt: now - 4 * DAY + 2 * HOUR, finalizedAt: now - 3.5 * DAY, taskDecision: 'generate',
  });
  eastBuild.plan = planOf(eastBuild.id, now - 3.4 * DAY, [
    ['d_pur', '施工合同签订', '与施工方签订地面改造合同，明确工期与验收标准', due(3), 2],
    ['d_prod', '改造期间排产调整', '输出改造期间的排产调整计划与物流路线', due(5), 3],
  ]);

  // ── 任务 ──
  // i18n-ignore：演示异议内容
  const chipObjection: MmObjection = {
    id: 'ob_chip', kind: 'objection', target: 'time',
    reason: '原厂排产紧张，交期回复为 12 月 18 日，按原定截止日无法保证到货。',
    suggestion: `截止日调整为 ${md(chip.suggested)}，同时启动备选渠道，每周同步一次原厂排产。`,
    suggestedDue: chip.suggested, raisedBy: 'zhouting', raisedAt: now - 3 * DAY, prevStatus: 'to_accept', stage: 'arbitration',
    review: { by: 'liuyang', at: now - 2 * DAY, decision: 'reject', note: `${md(chip.due)} 是 MES 联调的前置节点，推迟会影响整体上线，请协调备选渠道保证到货。` },
  };
  // i18n-ignore：演示异议内容
  const inspectObjection: MmObjection = {
    id: 'ob_inspect', kind: 'change', target: 'requirement',
    reason: '首件检验要求覆盖全部 32 项参数，现有检测设备只能测 28 项。',
    suggestion: '另外 4 项送外部实验室检测，交付时间顺延 3 天。',
    suggestedDue: due(9), raisedBy: 'sunhao', raisedAt: now - 5 * HOUR, prevStatus: 'in_progress', stage: 'review',
  };

  // i18n-ignore：演示进度说明
  const tasks: MmTask[] = [
    buildTask({ meeting: kickoff, item: 0, assigneeId: 'zhouting', status: 'to_accept', createdAt: now - 13 * DAY, objection: chipObjection,
      extraEvents: [
        { at: now - 3 * DAY, by: 'zhouting', action: 'objection_raised', note: chipObjection.reason },
        { at: now - 2 * DAY, by: 'liuyang', action: 'review_reject', note: chipObjection.review!.note },
        { at: now - 1 * DAY, by: 'zhouting', action: 'escalated' },
      ] }),
    buildTask({ meeting: kickoff, item: 1, assigneeId: 'zhaolei', status: 'in_progress', percent: 60, createdAt: now - 13 * DAY, acceptedAt: now - 12.5 * DAY,
      progress: [[now - 10 * DAY, 20, '总装车间需求已确认'], [now - 3 * DAY, 60, '检测车间需求确认过半']] }),
    buildTask({ meeting: kickoff, item: 2, assigneeId: 'linxiao', status: 'in_progress', percent: 30, createdAt: now - 13 * DAY, acceptedAt: now - 12 * DAY,
      progress: [[now - 9 * DAY, 30, '培训课表初稿完成，讲师待定']] }),
    buildTask({ meeting: kickoff, item: 3, assigneeId: 'sunhao', status: 'done', createdAt: now - 13 * DAY, acceptedAt: now - 12.8 * DAY,
      progress: [[now - 8 * DAY, 70, '总装线点检项目已整理']], doneAt: now - 4 * DAY }),
    buildTask({ meeting: a2Kickoff, item: 0, assigneeId: 'zhengkai', status: 'to_accept', createdAt: now - 9 * DAY }),
    buildTask({ meeting: a2Kickoff, item: 1, assigneeId: 'zhouting', status: 'in_progress', percent: 40, createdAt: now - 9 * DAY, acceptedAt: now - 8.8 * DAY,
      progress: [[now - 2 * DAY, 40, '长周期物料已全部下单，其余按 BOM 核对中']] }),
    buildTask({ meeting: a2Kickoff, item: 2, assigneeId: 'wugang', status: 'not_started', createdAt: now - 9 * DAY, acceptedAt: now - 8 * DAY }),
    buildTask({ meeting: a2Kickoff, item: 3, assigneeId: 'sunhao', status: 'in_progress', percent: 50, createdAt: now - 9 * DAY, acceptedAt: now - 8.9 * DAY,
      progress: [[now - 4 * DAY, 50, '28 项参数的检验方法已确定']], objection: inspectObjection,
      extraEvents: [{ at: now - 5 * HOUR, by: 'sunhao', action: 'objection_raised', note: inspectObjection.reason }] }),
  ];
  kickoff.taskIds = tasks.filter((t) => t.meetingId === kickoff.id).map((t) => t.id);
  a2Kickoff.taskIds = tasks.filter((t) => t.meetingId === a2Kickoff.id).map((t) => t.id);

  const meetings = [kickoff, weekly, a2Kickoff, a2Review, a2Weekly, eastPlan, eastCapacity, eastSite, eastEquip, eastBuild];

  // 项目成员：负责人、主持人、参会人、任务负责人、接收任务的部门负责人
  for (const p of projects) {
    const ids = new Set<string>([p.ownerId]);
    for (const m of meetings.filter((x) => x.projectId === p.id)) {
      ids.add(m.hostId);
      m.attendeeIds.forEach((id) => ids.add(id));
      if (m.plan?.ownerId) ids.add(m.plan.ownerId);
    }
    for (const t of tasks.filter((x) => x.projectId === p.id)) { ids.add(t.assigneeId); ids.add(t.ownerId); }
    p.memberIds = [...ids];
  }

  // i18n-ignore：演示通知内容
  const notices: MmNotice[] = [
    { id: 'nt_demo_1', at: now - 1 * DAY, to: 'linxiao', type: 'arbitration', title: '待裁决：主控芯片到货跟踪', summary: `周婷与刘洋对截止日有分歧（${md(chip.due)} / ${md(chip.suggested)}）`, link: { kind: 'task', id: tasks[0].id }, read: false },
    { id: 'nt_demo_2', at: now - 6 * HOUR, to: 'linxiao', type: 'task_overdue', title: '逾期提醒：上线培训计划编制', summary: `截止 ${tasks[2].due}，已逾期 2 天`, link: { kind: 'task', id: tasks[2].id }, read: false },
    { id: 'nt_demo_3', at: now - 18 * HOUR, to: 'linxiao', type: 'speech_confirm', title: '发言待确认：A2 试产问题复盘会', summary: '请核对并确认你在会上的发言', link: { kind: 'meeting', id: a2Review.id }, read: false },
    { id: 'nt_demo_4', at: now - 5 * HOUR, to: 'linxiao', type: 'minutes_review', title: '纪要待终审：数字化工厂周例会', summary: '发言人已全部确认，请终审', link: { kind: 'meeting', id: weekly.id }, read: false },
    { id: 'nt_demo_5', at: now - 2.4 * DAY, to: 'linxiao', type: 'plan_confirm', title: '方案待确认：扩产规划评审会', summary: eastPlan.plan!.items.map((i) => `${i.title}（截止 ${i.due}）`).join('\n'), link: { kind: 'meeting_plan', id: eastPlan.id }, read: false },
    { id: 'nt_demo_6', at: now - 13.5 * DAY, to: 'linxiao', type: 'minutes_final', title: '正式纪要：数字化工厂启动会', summary: kickoff.summaryLines.join('\n'), link: { kind: 'meeting', id: kickoff.id }, read: true },
    { id: 'nt_demo_7', at: now - 5 * HOUR, to: 'chenlifeng', type: 'objection_review', title: '申请变更：首件检验方案', summary: inspectObjection.reason, link: { kind: 'task', id: tasks[7].id }, read: false },
    { id: 'nt_demo_8', at: now - 9 * DAY, to: 'zhengkai', type: 'task_new', title: '新任务待接收：试产工艺文件编制', summary: `${tasks[4].title}（截止 ${tasks[4].due}）`, link: { kind: 'task', id: tasks[4].id }, read: false },
  ];

  return { projects, meetings, tasks, notices };
}

/** 演示用文字记录文件名 */
// i18n-ignore：文件名是演示数据
export const DEMO_TRANSCRIPT_NAME = '示例会议文字记录.txt';

/**
 * 演示用文字记录（带发言人昵称的会议转写稿，格式同腾讯会议 / 飞书妙记导出的「昵称 时间」+ 下一行正文）。
 * 发言人都是演示组织里的人：新建会议时把林晓、周婷、吴刚、郑凯选为参会人，上传这份文件即可按昵称识别发言人，
 * 一路走完 确认 → 终审 → 生成任务 → 派发。
 */
// i18n-ignore：演示用会议转写稿是用户数据
export const DEMO_TRANSCRIPT = `林晓 00:00:05
今天开个短会，对齐华东基地新线设备的到货和安装安排。

周婷 00:00:32
设备厂家回复，首批两台贴片机下周发货，剩下的分两批，月底前全部到齐。

吴刚 00:01:10
生产这边要提前把安装位置腾出来，地面改造大概要一周。

郑凯 00:01:45
安装调试的工艺参数我们先按老线出一版，到货后再微调。

林晓 00:02:20
那就这么定：生产部下周完成地面改造，工艺部两周内出调试参数初版，采购部每周同步一次到货进度。

吴刚 00:02:48
没问题，地面改造下周一开工。

周婷 00:03:05
好的，到货进度我每周五在群里同步。

郑凯 00:03:21
调试参数初版出来后，我约生产一起过一遍。
`;
