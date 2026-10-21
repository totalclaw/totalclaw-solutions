/**
 * 六步闭环的状态推导（接收 / 理解 / 检索 / 建议 / 审批 / 交付）。
 *
 * 单独成文件是因为它误导过用户两次，而藏在 SFC 的 computed 里没法测：
 *   · 案件已批准、但还没点过「生成文件」时，「建议」一直挂 active 转圈
 *     —— 审批的对象就是这份建议，审批都过了它却显示"正在进行"；
 *   · 批准后「交付」被标成 active，一直转 —— 看起来像系统在自动发件，
 *     其实它什么都没做，等的是人去生成文件、点发送。
 *
 * 一条口径贯穿全文件：**active = 系统正在做**，todo = 等人操作，done = 完成。
 * 转圈图标只属于 active，所以任何"其实在等用户"的状态都必须是 todo。
 */

export type StepStatus = 'done' | 'active' | 'todo' | 'failed';

/** 案件状态：与 CaseDTO.status 对齐（这里只列推导用得到的） */
export type CaseStatusLike =
  | 'received' | 'parsed' | 'analyzed' | 'drafted'
  | 'pending_approval' | 'approved' | 'approved_with_edits'
  | 'returned' | 'rejected' | 'delivered'
  | (string & {});

export interface WorkflowStateInput {
  /** 没有案件时六步全部按「未开始」处理 */
  hasCase: boolean;
  status?: CaseStatusLike;
  /** 已经真实生成的输出物份数 */
  outputCount: number;
  /** 是否发生过重算（Proof Switch / BOM 切换等） */
  hasImpact: boolean;
}

export function isApprovedStatus(status?: CaseStatusLike): boolean {
  return status === 'approved' || status === 'approved_with_edits' || status === 'delivered';
}

/** 进过审批环节（含被退回/拒绝）——说明「建议」这一步早已交付出去了 */
export function reachedApproval(status?: CaseStatusLike): boolean {
  return status === 'pending_approval'
    || status === 'returned'
    || status === 'rejected'
    || isApprovedStatus(status);
}

/**
 * 推导六步状态。返回长度 6 的数组，与 workflowSteps 顺序一致。
 * 前三步（接收/理解/检索）在有案件时一律 done —— 建案本身就是它们的产物。
 */
export function computeWorkflowStates(input: WorkflowStateInput): StepStatus[] {
  if (!input.hasCase) return ['todo', 'todo', 'todo', 'todo', 'todo', 'todo'];
  const { status, outputCount, hasImpact } = input;

  const advised = hasImpact || outputCount > 0 || reachedApproval(status);
  const out: StepStatus[] = [
    'done', 'done', 'done',
    advised ? 'done' : 'active',
    'todo',
    'todo',
  ];

  if (status === 'pending_approval') out[4] = 'active';
  if (status === 'returned' || status === 'rejected') out[4] = 'failed';
  if (isApprovedStatus(status)) {
    out[4] = 'done';
    // 交付：批准后等人生成文件 + 点发送，属于待办；只有真发完才 done
    out[5] = status === 'delivered' ? 'done' : 'todo';
  }
  return out;
}
