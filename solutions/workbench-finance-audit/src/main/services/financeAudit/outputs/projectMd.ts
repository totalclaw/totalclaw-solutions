/**
 * 项目上下文 project.md（批次 8）：把公司档案、项目、数据集、运行、签核与转交汇成一份 Markdown，
 * 给人看，也给对话里的财会技能读（技能约定「对话中没有公司档案时读项目上下文 project.md」）。
 * 固定文案按输出语言（tIn）；公司名、数据集名、文件名等用户数据原样保留。只读汇总，不改任何记录。
 */
import { basename } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauCompany, FauLocale, FauProject, FauRun, FauSignLevel, FauSignoffRecord } from '@totalclaw/ipc-contracts';
import { moduleById } from '../../../../shared/financeAudit/catalog';
import { STANDARD_LABELS, regionProfile } from '../../../../shared/financeAudit/regions';
import type { HandoffRecord } from '../store';
import { nextLevel } from '../signoff';
import { OUT, labeler } from './common';

const RUN_STATUS: Record<FauRun['status'], string> = {
  draft: i18nKey('草稿'), running: i18nKey('进行中'), ready: i18nKey('待签核'), signing: i18nKey('签核中'), returned: i18nKey('被退回'), archived: i18nKey('已归档'), void: i18nKey('已作废'),
};
const LEVEL: Record<FauSignLevel, string> = { prepare: OUT.prepare, review: OUT.review, approve: OUT.approve };
const PROJECT_TYPE: Record<FauProject['type'], string> = {
  month_close: i18nKey('月结'), annual_audit: i18nKey('年审'), filing: i18nKey('申报'), controls: i18nKey('内控'), ma: i18nKey('并购'), custom: i18nKey('自定义'),
};
const PROJECT_STATUS: Record<FauProject['status'], string> = { open: i18nKey('进行中'), closed: i18nKey('已关闭'), archived: i18nKey('已归档') };

/** 表格单元格：竖线与换行会破坏 Markdown 表格 */
const cell = (v: unknown) => String(v ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');

export function buildProjectMd(input: {
  company: FauCompany;
  project: FauProject;
  prev?: FauProject | null;
  datasets: Array<{ label: string; kind: string; rowCount: number; from: string; importedAt: string; sha256: string }>;
  runs: FauRun[];
  signoffs: FauSignoffRecord[];
  handoffs: HandoffRecord[];
  locale: FauLocale;
  at?: string;
}): string {
  const L = labeler(input.locale);
  const { company, project } = input;
  const modName = (id: string) => { const m = moduleById(id); return m ? `${m.code} ${L(m.name)}` : id; };
  const modeName = (r: FauRun) => { const m = moduleById(r.moduleId)?.modes.find((x) => x.id === r.modeId); return m ? L(m.name) : r.modeId; };
  const lines: string[] = [
    `# ${L(i18nKey('项目上下文'))}: ${project.name}`,
    '',
    `> ${L(OUT.boundary)}`,
    '',
    `- ${L(i18nKey('导出时间'))}: ${input.at || new Date().toISOString()}`,
    '',
    `## ${L(i18nKey('公司档案'))}`,
    '',
    `- ${L(OUT.company)}: ${company.name}`,
    `- ${L(i18nKey('地区档案'))}: ${company.regions.map((r) => L(regionProfile(r).name)).join(', ')}`,
    `- ${L(OUT.standard)}: ${L(STANDARD_LABELS[company.standard] || company.standard)}`,
    `- ${L(i18nKey('记账本位币'))}: ${company.currency}`,
    `- ${L(i18nKey('会计年度起始月'))}: ${company.fiscalYearStartMonth}`,
    `- ERP: ${company.erp}`,
    `- ${L(OUT.outputLocale)}: ${company.outputLocale}`,
    `- ${L(i18nKey('签核人'))}: ${company.signers.map((s) => `${s.name} (${s.title}; ${s.levels.map((l) => L(LEVEL[l])).join('/')})`).join('; ') || '-'}`,
    '',
    `## ${L(OUT.project)}`,
    '',
    `- ${L(i18nKey('类型'))}: ${L(PROJECT_TYPE[project.type])}`,
    `- ${L(OUT.period)}: ${project.period}`,
    `- ${L(i18nKey('状态'))}: ${L(PROJECT_STATUS[project.status])}`,
    `- ${L(i18nKey('上一期项目'))}: ${input.prev?.name || '-'}`,
    '',
    `## ${L(i18nKey('数据集'))}`,
    '',
  ];
  if (input.datasets.length) {
    lines.push(`| ${L(i18nKey('数据集'))} | ${L(i18nKey('类型'))} | ${L(i18nKey('行数'))} | ${L(OUT.source)} | ${L(i18nKey('导入时间'))} | SHA-256 |`, '|---|---|---|---|---|---|');
    for (const d of input.datasets) lines.push(`| ${cell(d.label)} | ${d.kind} | ${d.rowCount} | ${d.from} | ${d.importedAt} | ${d.sha256 ? d.sha256.slice(0, 16) : '-'} |`);
  } else lines.push(L(i18nKey('还没有导入数据')));
  lines.push('', `## ${L(i18nKey('运行记录'))}`, '');
  if (input.runs.length) {
    lines.push(`| ${L(OUT.module)} | ${L(OUT.mode)} | ${L(i18nKey('状态'))} | ${L(i18nKey('待签级别'))} | ${L(i18nKey('更新时间'))} |`, '|---|---|---|---|---|');
    for (const r of input.runs) {
      const next = r.artifacts.length && r.status !== 'archived' && r.status !== 'void' ? nextLevel(r, input.signoffs) : null;
      lines.push(`| ${cell(modName(r.moduleId))} | ${cell(modeName(r))} | ${L(RUN_STATUS[r.status])} | ${next ? L(LEVEL[next]) : '-'} | ${r.updatedAt} |`);
    }
    for (const r of input.runs.filter((x) => x.artifacts.length)) {
      lines.push('', `### ${modName(r.moduleId)} · ${modeName(r)} · ${r.id}`, '');
      if (r.steps.analyze.summary) lines.push(`- ${L(i18nKey('计算结果'))}: ${L(r.steps.analyze.summary.key, r.steps.analyze.summary.params)}`);
      if (r.reminders.length) lines.push(`- ${L(i18nKey('提醒项'))}: ${r.reminders.length}`);
      for (const a of r.artifacts) lines.push(`- ${L(a.title.key, a.title.params)}: ${basename(a.path)} (SHA-256 ${a.sha256.slice(0, 16)})`);
    }
  } else lines.push(L(i18nKey('还没有运行')));
  lines.push('', `## ${L(i18nKey('签核记录'))}`, '');
  if (input.signoffs.length) {
    lines.push(`| ${L(OUT.module)} | ${L(OUT.signLevel)} | ${L(OUT.result)} | ${L(OUT.signer)} | ${L(OUT.signAt)} |`, '|---|---|---|---|---|');
    for (const s of input.signoffs) lines.push(`| ${cell(modName(s.moduleId))} | ${L(LEVEL[s.level])} | ${L(s.decision === 'approve' ? i18nKey('通过') : i18nKey('退回'))} | ${cell(s.signer.name)} | ${s.at} |`);
  } else lines.push(L(i18nKey('还没有签核')));
  lines.push('', `## ${L(i18nKey('模块间转交'))}`, '');
  if (input.handoffs.length) for (const h of input.handoffs) lines.push(`- ${modName(h.fromModuleId)} → ${modName(h.toModuleId)} (${h.at})`);
  else lines.push('-');
  lines.push('');
  return lines.join('\n');
}
