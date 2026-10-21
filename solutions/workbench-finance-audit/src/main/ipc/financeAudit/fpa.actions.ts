/** 财会审计 · fpa 分组的模块特有 action（D1–D10，批次 5）。action 名用「<模块 id>.」前缀。 */
import { setFpaPdfWriter } from '../../services/financeAudit/engines/fpa/base';
import type { ActionTable, FauActionCtx } from './context';

export function fpaActions(ctx: FauActionCtx): ActionTable {
  // 管理报告的 PDF 用主进程的 Electron printToPDF 渲染（与签核页同一个渲染器）
  setFpaPdfWriter(ctx.writePdf);
  return {};
}
