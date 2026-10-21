/** 项目上下文 project.md（批次 8）：三语固定文案按输出语言，en / ar 不漏汉字（用户数据除外），运行与签核都汇进来。 */
import { describe, expect, it } from 'vitest';
import { containsHanText } from '@totalclaw/i18n';
import { buildProjectMd } from './projectMd';

const company: any = {
  id: 'co_1', name: 'Demo Co', regions: ['SA'], region: 'SA', standard: 'SOCPA', currency: 'SAR', fiscalYearStartMonth: 1, erp: 'other', outputLocale: 'ar',
  signers: [{ name: 'Ali', title: 'CFO', levels: ['prepare', 'approve'] }],
};
const project: any = { id: 'pj_1', companyId: 'co_1', name: '2026-09 close', type: 'month_close', period: '2026-09', status: 'open' };
const run: any = {
  id: 'run_1', moduleId: 'recon', modeId: 'bank', status: 'ready', updatedAt: '2026-10-01T00:00:00Z', requiredLevels: ['prepare', 'approve'],
  steps: { analyze: { summary: { key: '{n} 个账户，未达账项 {m} 笔，升级事项 {e} 条', params: { n: 2, m: 4, e: 1 } } } },
  reminders: [{ id: 'r1' }], artifacts: [{ path: '/x/A2.xlsx', sha256: 'abcdef0123456789abcdef', title: { key: '银行余额调节表' } }],
};

describe('project.md', () => {
  it.each(['zh-CN', 'en-US', 'ar'] as const)('%s：章节齐全，运行、数据集、签核都在', (locale) => {
    const md = buildProjectMd({
      company, project, locale, prev: null, at: '2026-10-01T00:00:00Z',
      datasets: [{ label: 'bank.xlsx', kind: 'bank', rowCount: 8, from: 'file', importedAt: '2026-10-01', sha256: '0123456789abcdef0123' }],
      runs: [run],
      signoffs: [{ runId: 'run_1', moduleId: 'recon', level: 'prepare', decision: 'approve', signer: { name: 'Ali', title: 'CFO' }, at: '2026-10-01T01:00:00Z' } as any],
      handoffs: [],
    });
    expect(md.split('\n')[0]).toMatch(/^# .+: 2026-09 close$/);
    expect(md).toContain('bank.xlsx');
    expect(md).toContain('A2.xlsx');
    expect(md).toContain('Ali');
    expect((md.match(/^## /gm) || []).length).toBe(6);
    if (locale !== 'zh-CN') {
      // 用户数据（公司名、文件名）都是英文：整份不应有汉字
      const han = md.split('\n').filter((l) => containsHanText(l));
      expect(han).toEqual([]);
    }
  });
});
