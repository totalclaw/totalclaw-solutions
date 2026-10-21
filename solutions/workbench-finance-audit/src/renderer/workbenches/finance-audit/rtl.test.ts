/**
 * 阿语 RTL 静态检查（docs/finance-audit-solution.md 第 13.5 节第 5 条）：
 *   ① 本目录与视图的 .vue / .css 里没有 left / right 物理方向属性（只许 inline-start / inline-end / text-align: start）；
 *   ② 模板里格式化金额 / 比例的调用只在 FauNum 里（其它地方一律 <FauNum>，保证 <bdi dir="ltr">，负号千分位不错位）。
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIR = __dirname;
const VIEW = join(DIR, '..', '..', 'views', 'FinanceAuditWorkbenchView.vue');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.(vue|css)$/.test(n) ? [p] : [];
  });
}
const ALL = [...files(DIR), VIEW];

/** .css 全文；.vue 取 <style> 块与模板里的 style="" 属性 */
function styleText(path: string): string {
  const src = readFileSync(path, 'utf8');
  if (path.endsWith('.css')) return src;
  const blocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const inline = [...src.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1]);
  return [...blocks, ...inline].join('\n');
}

const PHYSICAL = [
  /\b(margin|padding|border)-(left|right)\b/,
  /(^|[\s;{])(left|right)\s*:/m,
  /text-align\s*:\s*(left|right)\b/,
  /float\s*:\s*(left|right)\b/,
  /\b(border-(top|bottom)-(left|right)-radius)\b/,
];

function template(path: string): string {
  const src = readFileSync(path, 'utf8');
  const m = src.match(/<template>([\s\S]*)<\/template>/);
  return m ? m[1] : '';
}

describe('财会审计 · RTL 静态检查', () => {
  it('扫描范围不为空', () => {
    expect(ALL.length).toBeGreaterThan(10);
  });

  it('各批次的模块组件都在扫描范围内（批次 5：财务分析与管理报告 FpaPanel）', () => {
    expect(ALL.some((p) => p.endsWith(join('modules', 'fpa', 'FpaPanel.vue')))).toBe(true);
  });

  it('批次 4 税务组的组件在扫描范围内', () => {
    const tax = ALL.filter((p) => p.includes(join('modules', 'tax'))).map((p) => relative(DIR, p));
    expect(tax).toEqual(expect.arrayContaining([
      join('modules', 'tax', 'TaxParams.vue'), join('modules', 'tax', 'TaxResult.vue'),
      join('modules', 'tax', 'RuleSources.vue'), join('modules', 'tax', 'FindingList.vue'),
    ]));
  });

  it('批次 3 审计组面板（B1–B6、P4 质检）与共用样式都在扫描范围里', () => {
    const names = ALL.map((p) => relative(DIR, p).replace(/\\/g, '/'));
    for (const f of ['IcfrPanel.vue', 'InternalAuditPanel.vue', 'ExtAuditPanel.vue', 'ReviewPanel.vue', 'FraudPanel.vue', 'KycPanel.vue', 'OfficeQcPanel.vue', 'audit.css']) {
      expect(names, f).toContain(`modules/audit/${f}`);
    }
  });

  it('批次 7 投融资与估值的面板在扫描范围里', () => {
    const names = ALL.map((p) => relative(DIR, p));
    expect(names).toEqual(expect.arrayContaining([join('modules', 'capital', 'CapitalInputPanel.vue'), join('modules', 'capital', 'CapitalResultPanel.vue')]));
  });

  it('批次 6 资金与金融风险的组件在扫描范围内', () => {
    for (const n of ['TreasuryPanel.vue', 'CashForecastChart.vue']) expect(ALL.some((p) => p.endsWith(join('modules', 'treasury', n))), n).toBe(true);
  });

  it.each(ALL.map((p) => [relative(DIR, p), p]))('%s 没有 left / right 物理方向属性', (_name, path) => {
    const css = styleText(path);
    const hits = PHYSICAL.filter((re) => re.test(css)).map(String);
    expect(hits, `${path} 用了物理方向属性，请换成逻辑属性（inline-start / inline-end）`).toEqual([]);
  });

  it.each(ALL.filter((p) => p.endsWith('.vue') && !p.endsWith('FauNum.vue')).map((p) => [relative(DIR, p), p]))('%s 模板里的金额都经过 FauNum', (_name, path) => {
    const tpl = template(path);
    expect(tpl).not.toMatch(/\b(fmtCents|fmtRatio)\s*\(/);
    expect(tpl).not.toMatch(/toLocaleString\s*\(/);
  });

  it('批次 2（A3–A8）的面板与共用样式都在扫描范围内', () => {
    const names = ALL.map((p) => relative(DIR, p).replace(/\\/g, '/'));
    for (const f of ['ArPanel.vue', 'ApPanel.vue', 'ExpensePanel.vue', 'FixedAssetsPanel.vue', 'PayrollPanel.vue', 'IntercompanyPanel.vue', 'FauFlags.vue', 'panels.css']) {
      expect(names, f).toContain(`modules/accounting/${f}`);
    }
  });

  it('阳性对照：物理属性会被认出来', () => {
    expect(PHYSICAL.some((re) => re.test('.x { margin-left: 4px; }'))).toBe(true);
    expect(PHYSICAL.some((re) => re.test('.x{left:0}'))).toBe(true);
    expect(PHYSICAL.some((re) => re.test('.x { margin-inline-start: 4px; text-align: start; }'))).toBe(false);
  });
});
