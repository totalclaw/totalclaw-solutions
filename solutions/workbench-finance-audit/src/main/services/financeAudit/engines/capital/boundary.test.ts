/**
 * G6 合规边界（第 9.1 节「不做投资建议」+ 本批「不执行交易」）：投融资与估值的源码里没有下单 / 交易执行 / 对外发送的路径；
 * 研究、市场、财富的提示词明确禁止买卖评级与交易指令，产出声明三语都有。扫的是源码文本，新增文件自动纳入。
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tIn } from '@totalclaw/i18n';
import { capTask } from '../../prompts/capital';
import { CAP_OUT } from '../../outputs/capital';

const SHELL = join(__dirname, '..', '..', '..', '..', '..', '..');
const ROOTS = [
  'src/main/services/financeAudit/engines/capital', 'src/main/services/financeAudit/outputs/capital.ts', 'src/main/services/financeAudit/outputs/capitalModels.ts',
  'src/main/services/financeAudit/prompts/capital.ts', 'src/main/ipc/financeAudit/capital.actions.ts', 'src/shared/financeAudit/capital',
  'src/renderer/workbenches/finance-audit/modules/capital',
].map((p) => join(SHELL, p));

function* files(p: string): Generator<string> {
  if (!existsSync(p)) return;
  if (statSync(p).isDirectory()) for (const n of readdirSync(p)) yield* files(join(p, n));
  else if (/\.(ts|vue)$/.test(p) && !/\.test\.ts$/.test(p)) yield p;
}
const SOURCES = ROOTS.flatMap((r) => [...files(r)]).map((f) => ({ f: relative(SHELL, f), text: readFileSync(f, 'utf8') }));

describe('G6 合规边界', () => {
  it('扫到了源码', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(15);
  });

  it('没有下单、交易执行、经纪商、付款或对外发送的调用', () => {
    const bad = SOURCES.flatMap(({ f, text }) => [
      /placeOrder|submitOrder|sendOrder|executeTrade|tradeExecut|createOrder|brokerApi|\/orders?\b/i,
      /executePayment|makePayment|bankTransfer\(/i,
      /sendCaseMail|caseMailSender|nodemailer|smtp|imRunLink|sendImMessage/i,
    ].filter((re) => re.test(text)).map((re) => `${f}: ${re}`));
    expect(bad).toEqual([]);
  });

  it('研究 / 市场 / 财富的任务指令禁止评级、目标价与交易指令；不给工具', () => {
    expect(capTask('research', 'initiate', true)).toMatch(/not investment advice.*rating/i);
    expect(capTask('markets', 'fx_carry', false)).toMatch(/no trading instructions|not investment advice/i);
    expect(capTask('wealth', 'investment_proposal', false)).toMatch(/never address the client.*executes no trades/i);
    for (const s of SOURCES.filter((x) => x.f.includes('prompts/'))) expect(s.text).not.toMatch(/toolsets?\s*:|tools\s*:\s*\[/);
  });

  it('「非投资建议」声明三语都有，英文 / 阿语里没有汉字', () => {
    for (const k of [CAP_OUT.research, CAP_OUT.markets, CAP_OUT.wealth]) {
      for (const loc of ['en-US', 'ar'] as const) {
        const v = tIn(loc, k);
        expect(v, `${loc} ${k}`).not.toBe(k);
        expect(/[一-鿿]/.test(v), `${loc} ${v}`).toBe(false);
      }
    }
  });
});
