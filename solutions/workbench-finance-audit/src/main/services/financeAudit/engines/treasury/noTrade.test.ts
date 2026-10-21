/**
 * 批次 6 硬边界守卫（扫源码，新增文件自动纳入）：
 *   外汇模块代码里没有任何下单 / 成交 / 确认交易的路径；付款只出计划与建议，没有付款、审批付款、发起转账的路径；
 *   E3 的模式不钉 fa-fx-deal-execution（那份技能正文写着下单步骤，本方案只拿它做询价准备）；treasury 分组的 action 都是只读重算。
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { moduleById } from '../../../../../shared/financeAudit/catalog';
import { treasuryActions } from '../../../../ipc/financeAudit/treasury.actions';

const SHELL = join(__dirname, '..', '..', '..', '..', '..', '..');
const ROOTS = [
  'src/main/services/financeAudit/engines/treasury',
  'src/main/services/financeAudit/intake/treasury.ts',
  'src/main/services/financeAudit/prompts/treasury.ts',
  'src/main/ipc/financeAudit/treasury.actions.ts',
  'src/shared/financeAudit/catalog/treasury.ts',
  'src/shared/financeAudit/treasuryLabels.ts',
  'src/renderer/workbenches/finance-audit/modules/treasury',
].map((p) => join(SHELL, p));

function* files(p: string): Generator<string> {
  if (!existsSync(p)) return;
  if (statSync(p).isDirectory()) { for (const n of readdirSync(p)) yield* files(join(p, n)); }
  else if (/\.(ts|vue)$/.test(p) && !/\.test\.ts$/.test(p)) yield p;
}
const SOURCES = ROOTS.flatMap((r) => [...files(r)]).map((f) => ({ f: relative(SHELL, f), text: readFileSync(f, 'utf8') }));

describe('资金与金融风险：不下单、不付款', () => {
  it('扫到了源码', () => {
    expect(SOURCES.length).toBeGreaterThan(12);
  });

  it('没有下单、成交、确认交易的调用', () => {
    const re = /placeOrder|submitOrder|sendOrder|newOrderSingle|executeTrade|bookTrade|confirmTrade|dealExecut|tradeExecut|executeDeal|\/v1\/(fx|trade|deal|order)\b|fix\s*protocol/i;
    expect(SOURCES.filter((s) => re.test(s.text)).map((s) => s.f)).toEqual([]);
  });

  it('没有付款、审批付款、发起转账的调用', () => {
    const re = /executePayment|makePayment|approvePayment|initiatePayment|payNow|bankTransfer|wireTransfer|\/v1\/(pay|payment|bank|transfer)\b/i;
    expect(SOURCES.filter((s) => re.test(s.text)).map((s) => s.f)).toEqual([]);
  });

  it('外汇模块的模式不钉交易执行技能；授权复核的结论里没有「批准」', () => {
    expect(moduleById('fx')!.modes.flatMap((m) => m.skills)).not.toContain('fa-fx-deal-execution');
    const contract = readFileSync(join(SHELL, '..', '..', 'packages/ipc-contracts/src/financeAudit.ts'), 'utf8');
    expect(contract).toMatch(/export type FauAuthAdvice = 'proceed' \| 'request_docs' \| 'hold' \| 'reject_recommend';/);
  });

  it('treasury 分组只有重算类 action', () => {
    expect(Object.keys(treasuryActions({} as never))).toEqual(['financing.params.update']);
  });
});
