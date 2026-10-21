/**
 * 税务组合规边界（第 9.1 节，写进代码）：只出申报草稿，不提交申报。
 * 税务引擎、产出、动作与界面里没有任何网络请求、税局 / ZATCA / FTA 接口调用或「提交」动作；
 * 中国申报代填只是跳转到财务智能体的页面。扫的是源码文本，新增文件自动纳入。
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SHELL = join(__dirname, '..', '..', '..', '..', '..', '..');
const ROOTS = [
  'src/main/services/financeAudit/engines/tax', 'src/main/services/financeAudit/outputs/tax.ts', 'src/main/services/financeAudit/intake/tax.ts',
  'src/main/services/financeAudit/prompts/regulatory.ts', 'src/main/services/financeAudit/prompts/tp.ts',
  'src/main/ipc/financeAudit/tax.actions.ts', 'src/renderer/workbenches/finance-audit/modules/tax',
].map((p) => join(SHELL, p));

function* files(p: string): Generator<string> {
  if (!existsSync(p)) return;
  if (statSync(p).isDirectory()) { for (const n of readdirSync(p)) yield* files(join(p, n)); }
  else if (/\.(ts|vue)$/.test(p) && !/\.test\.ts$/.test(p)) yield p;
}
const SOURCES = ROOTS.flatMap((r) => [...files(r)]).map((f) => ({ f: relative(SHELL, f), text: readFileSync(f, 'utf8') }));

describe('税务组合规边界', () => {
  it('扫到了源码', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(15);
  });

  it('没有网络请求、税局接口或提交动作', () => {
    const patterns: Array<[string, RegExp]> = [
      ['网络请求', /\bfetch\s*\(|https?\.request|net\.request|axios|XMLHttpRequest|WebSocket/],
      ['税局 / 平台接口', /fatoora\.zatca|zatca\.gov\.sa\/\S|tax\.gov\.ae\/\S|chinatax\.gov|\/api\/\S*(submit|declar)/i],
      ['提交动作', /submit(Return|Filing|Declaration|Tax)|fileReturn|declare\(|e-?filing/i],
    ];
    const bad: string[] = [];
    for (const { f, text } of SOURCES) for (const [name, re] of patterns) if (re.test(text)) bad.push(`${name}: ${f}`);
    expect(bad).toEqual([]);
  });

  it('中国申报代填只跳转到财务智能体页面', () => {
    const panel = SOURCES.find((s) => s.f.endsWith('TaxResult.vue'))!.text;
    expect(panel).toContain("router.push('/workbenches/finance-agent')");
  });
});
