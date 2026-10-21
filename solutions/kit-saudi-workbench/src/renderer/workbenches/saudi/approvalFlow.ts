/**
 * 审批之后的流程交接规则。
 *
 * 单独成文件是为了能单测：这条规则藏在 SaudiWorkbench 的 `decide()` 里时没法验，
 * 而它正是「批准 → 立刻能发」这一步的交接点 —— 漏了它，用户点完批准像是什么都没发生
 * （用户实证：三个模块审批通过后输出中心弹层都不出来）。
 */

/** 会让案件进入「可发送」状态的审批动作 —— 与 isApproved 的状态判定一一对应。 */
export const APPROVE_ACTIONS = new Set(['approve', 'approve_with_edits']);

/**
 * 审批之后要不要自动弹输出中心。
 *
 * **通过就弹，不看有没有文件。**
 * 早先加过「没文件不弹，免得是个空面板」的判断，实测反而挡住了最常见的一条路：
 * 刚建的单子还没生成任何交付物，批准完弹层不出来，用户以为功能坏了（实证反馈两次）。
 * 而且空面板并不空 —— 里面有交付目录设置，和一句「还没有生成任何文件，去输出物卡片点生成」，
 * 正好是批准之后该做的下一步。
 */
export function shouldOpenOutputsAfterDecision(action: string, _outputCount?: number): boolean {
  return APPROVE_ACTIONS.has(action);
}
