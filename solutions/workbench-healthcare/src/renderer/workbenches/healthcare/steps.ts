/**
 * 医疗合规工作台 —— 步骤条状态的纯计算。
 *
 * 视图（HealthcareWorkbenchView）把真实状态（能力状态 / 脱敏结果 / 复核队列 / 审计导出）
 * 喂进来，这里只负责把它们折成 WorkbenchStepBar 需要的四步定义；不碰 IPC、不碰 Vue。
 * 单独成文件是为了能拿边界 / 恶意输入直接测：来自后端的计数可能是字符串、负数、NaN、
 * 甚至对象，界面上不能因此显示「待复核 NaN 项」或 done 状态乱跳。
 */

/** 与 components/WorkbenchStepBar.vue 的 `WorkbenchStep` 同构（这里不 import .vue，保持纯 TS）。 */
export interface HealthcareStep {
  id: number;
  label: string;
  sub?: string;
  done?: boolean;
}

/** 与 vue-i18n `t(key, params)` 同签名；单测里传恒等函数即可。 */
export type StepTranslate = (key: string, params?: Record<string, unknown>) => string;

export interface HealthcareStepState {
  /** 能力状态接口的 `ok` 字段：只有严格 `true` 才算已连接。 */
  statusOk: unknown;
  /** 脱敏结果对象；`null` / `undefined` / `false` 视为尚未脱敏。 */
  maskResult: unknown;
  /** 复核队列总数（任何状态）。 */
  reviewCount: unknown;
  /** 复核队列里 `pending` 的条数。 */
  pendingCount: unknown;
  /** 审计导出结果（其它字段随意，只看 lineCount）；`null` 表示未导出。 */
  audit: { lineCount?: unknown; [extra: string]: unknown } | null | undefined;
}

export const HEALTHCARE_STEP_IDS = [1, 2, 3, 4] as const;
export type HealthcareStepId = (typeof HEALTHCARE_STEP_IDS)[number];

/** 把来路不明的计数收敛成非负整数：NaN / 负数 / 非数值 / 对象 → 0；小数向下取整；上限 1e12 防止界面被超长数字撑爆。 */
export function toCount(value: unknown): number {
  if (typeof value === 'boolean' || value === null || value === undefined) return 0;
  if (typeof value === 'object' || typeof value === 'symbol' || typeof value === 'function') return 0;
  const n = typeof value === 'bigint' ? Number(value) : Number(String(value).trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), 1e12);
}

/** 步骤 id 校验：不是 1~4 的整数（含字符串 "2"、2.5、NaN、越界）一律回到第 1 步。 */
export function clampHealthcareStep(value: unknown): HealthcareStepId {
  if (typeof value !== 'number' || !Number.isInteger(value)) return 1;
  return (HEALTHCARE_STEP_IDS as readonly number[]).includes(value) ? (value as HealthcareStepId) : 1;
}

export function buildHealthcareSteps(state: HealthcareStepState, t: StepTranslate): HealthcareStep[] {
  const statusOk = state.statusOk === true;
  const masked = state.maskResult !== null && state.maskResult !== undefined && state.maskResult !== false;
  const reviewCount = toCount(state.reviewCount);
  const pendingCount = toCount(state.pendingCount);
  const audit = state.audit && typeof state.audit === 'object' ? state.audit : null;
  const auditLines = audit ? toCount(audit.lineCount) : 0;

  return [
    {
      id: 1,
      label: t('状态与边界'),
      sub: statusOk ? t('合规能力已连接') : t('待检查'),
      done: statusOk,
    },
    {
      id: 2,
      label: t('PHI 脱敏'),
      sub: masked ? t('已建立可逆会话') : t('待处理文本'),
      done: masked,
    },
    {
      id: 3,
      label: t('人工复核'),
      sub: t('待复核 {n} 项', { n: pendingCount }),
      done: reviewCount > 0,
    },
    {
      id: 4,
      label: t('审计导出'),
      sub: audit ? t('{n} 行已导出', { n: auditLines }) : t('未导出'),
      done: audit !== null,
    },
  ];
}
