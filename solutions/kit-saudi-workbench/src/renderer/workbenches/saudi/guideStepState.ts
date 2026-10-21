/**
 * 五步向导（接通道 / 收件 / 解析确认 / 匹配·方案 / 审批交付）的步骤态推导。
 *
 * 与 workflowStepState.ts（案件内六步闭环）同一口径：
 *   **active = 系统正在做**，todo = 等人操作，done = 完成，failed = 这一步出了错。
 * 转圈只属于 active，所以「通道还没配」「收件箱空着」这种等人的状态一律 todo，
 * 页面上任何时刻最多只有系统真在跑的那几步显示「进行中」。
 *
 * 抽成纯函数是为了可测：改版前这段逻辑藏在 SFC 里，
 * 曾同时把第 1、2 步都标成「进行中」（其实什么都没在跑）。
 */
import type { ChannelState, IntakeChannel } from './types';
import { reachedApproval, type CaseStatusLike, type StepStatus } from './workflowStepState';

export type GuideStepStatus = StepStatus;

export interface GuideStepInput {
  /** 通道探测结果（只看 state；upload 通道随时可用，不算「接通」） */
  channels: ReadonlyArray<{ channel: IntakeChannel; state: ChannelState }>;
  channelsLoading: boolean;
  /** 收件箱条目数 */
  intakeCount: number;
  /** 正在载入演示样例 / 清演示 —— 收件箱这一步在跑 */
  intakeBusy: boolean;
  /** 已建案（进入工作台） */
  hasCase: boolean;
  /** 上传 / 抽取字段进行中 —— 解析确认这一步在跑 */
  parseBusy: boolean;
  caseStatus?: CaseStatusLike;
  outputCount: number;
  hasImpact: boolean;
  /** Proof Switch 重算中的卡片数 */
  recalculatingCount: number;
  mailBusy: boolean;
}

export const GUIDE_STEP_COUNT = 5;

export function computeGuideStepStates(input: GuideStepInput): GuideStepStatus[] {
  const out: GuideStepStatus[] = ['todo', 'todo', 'todo', 'todo', 'todo'];

  // ① 接通道
  if (input.channels.some((c) => c.state === 'error')) out[0] = 'failed';
  else if (input.channels.some((c) => c.state === 'ready' && c.channel !== 'upload')) out[0] = 'done';
  else if (input.channelsLoading) out[0] = 'active';

  // ② 收件
  if (input.intakeCount > 0) out[1] = 'done';
  else if (input.intakeBusy) out[1] = 'active';

  // ③ 解析确认：建案本身就是它的产物
  if (input.hasCase) out[2] = 'done';
  else if (input.parseBusy) out[2] = 'active';

  if (!input.hasCase) return out;

  // ④ 匹配 / 方案：与六步闭环里「建议」同口径
  const advised = input.hasImpact || input.outputCount > 0 || reachedApproval(input.caseStatus);
  out[3] = advised ? 'done' : 'active';
  if (input.recalculatingCount > 0) out[3] = 'active';

  // ⑤ 审批交付
  const s = input.caseStatus;
  if (s === 'rejected' || s === 'returned') out[4] = 'failed';
  else if (s === 'delivered') out[4] = 'done';
  else if (s === 'pending_approval' || input.mailBusy) out[4] = 'active';
  else out[4] = 'todo';
  return out;
}

/**
 * 「下一步」按钮能不能点：第 1 步随时能往下（未配通道也能靠上传 / 演示样例走通），
 * 第 2 步要有案件，第 3、4 步要本步 done；最后一步没有下一步。
 * 只管「按钮能否点」，不拦顶部步骤条的自由跳转（回看 / 跳过是允许的）。
 */
export function canAdvanceFrom(index: number, states: ReadonlyArray<GuideStepStatus>, input: Pick<GuideStepInput, 'channelsLoading' | 'hasCase'>): boolean {
  if (index < 0 || index >= GUIDE_STEP_COUNT - 1) return false;
  if (index === 0) return !input.channelsLoading;
  if (index === 1) return input.hasCase;
  return states[index] === 'done';
}

/** 顶部进度文案用：第一个没完成的步（全完成则停在最后一步） */
export function currentGuideStep(states: ReadonlyArray<GuideStepStatus>): number {
  const i = states.findIndex((s) => s !== 'done');
  return i < 0 ? states.length - 1 : i;
}
