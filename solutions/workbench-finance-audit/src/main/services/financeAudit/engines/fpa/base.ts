/**
 * fpa 分组的 ModuleRunner 骨架：十个模块共用 ③ 校验（基础校验 + 模块补充）、④ 子进度、⑤ 按模块定义的 outputs 出文件。
 * 各模块只写自己的 analyze（规则计算 + 可选的模型叙述）和产出标题 / 演示文稿内容。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauArtifact, FauFpaResult, FauSubProgress, FauValidationReport } from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS } from '../../../../../shared/financeAudit/regions';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import { outputFileName } from '../../outputs/common';
import type { OutputCtx } from '../../outputs/close';
import { writeFpaDocx, writeFpaPdf, writeFpaXlsx, type FpaPdfWriter } from '../../outputs/fpa';
import { writeDeck, type DeckContent } from '../../outputs/pptx';
import { tIn } from '@totalclaw/i18n';
import { baseValidation, fpaPeriod } from './kit';

export const SUB_LABELS: Record<string, string> = {
  compute: i18nKey('规则计算'),
  narrate: i18nKey('模型写说明并回核'),
  quotes: i18nKey('原文定位与回核'),
  deck: i18nKey('编排材料'),
};

let pdfWriter: FpaPdfWriter | null = null;
/** fpa.actions 注册时把主进程的 PDF 渲染器（Electron printToPDF）交进来；单测里没有，就只出 HTML */
export function setFpaPdfWriter(w: FpaPdfWriter | null | undefined): void {
  pdfWriter = w || null;
}

export interface FpaOutputsPlan {
  /** 产出名（词典 key） */
  title: string;
  statements?: string[];
  /** docx 只放这些表（不给 = 全部） */
  docTables?: string[];
  deck?: DeckContent;
  deckTitle?: string;
}

export interface FpaPlan {
  subs: (modeId: string) => string[];
  /** 模块补充的校验（往 report 里追加） */
  validate?: (ctx: RunCtx, report: FauValidationReport) => void | Promise<void>;
  analyze: (ctx: RunCtx) => Promise<AnalyzeResult & { result: FauFpaResult }>;
  outputs: (ctx: RunCtx, res: FauFpaResult) => FpaOutputsPlan;
}

/** 子步骤包一层：running → done / failed（看门狗用 progressAt） */
export async function sub<T>(ctx: RunCtx, id: string, fn: () => T | Promise<T>): Promise<T> {
  ctx.progress(id, 'running');
  try {
    const v = await fn();
    ctx.progress(id, 'done');
    return v;
  } catch (e) {
    ctx.progress(id, 'failed');
    throw e;
  }
}

export function outputCtx(ctx: RunCtx): OutputCtx {
  const mode = ctx.def.modes.find((m) => m.id === ctx.run.modeId);
  return {
    locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: fpaPeriod(ctx),
    moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || ctx.run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: ctx.run.model,
  };
}

export function fpaRunner(plan: FpaPlan): ModuleRunner {
  return {
    subSteps(modeId: string): FauSubProgress[] {
      return plan.subs(modeId).map((id) => ({ id, label: { key: SUB_LABELS[id] || id }, status: 'todo' }));
    },
    async validate(ctx: RunCtx): Promise<FauValidationReport> {
      const report = baseValidation(ctx);
      await plan.validate?.(ctx, report);
      return report;
    },
    analyze: plan.analyze,
    async draft(ctx: RunCtx) {
      const run = ctx.run;
      const res = run.result as FauFpaResult;
      const octx = outputCtx(ctx);
      const p = plan.outputs(ctx, res);
      const extra = { title: p.title, levels: run.requiredLevels, reminders: run.reminders, statements: p.statements };
      const art = (kind: FauArtifact['kind'], path: string, title: string): FauArtifact => ({ id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() });
      const artifacts: FauArtifact[] = [];
      const outs = ctx.def.outputs;
      if (outs.includes('xlsx')) artifacts.push(art('xlsx', writeFpaXlsx(octx, res, extra), p.title));
      if (outs.includes('docx') || outs.includes('pdf')) {
        const doc = writeFpaDocx(octx, res, extra, { tables: p.docTables });
        if (outs.includes('docx')) artifacts.push(art('docx', doc.path, p.title));
        if (outs.includes('pdf')) {
          const pdf = await writeFpaPdf(octx, doc.spec, pdfWriter);
          if (pdf.pdf) artifacts.push(art('pdf', pdf.path, p.title));
        }
      }
      if (outs.includes('pptx') && p.deck) {
        const title = p.deckTitle || p.title;
        const path = join(octx.dir, outputFileName(octx.moduleCode, tIn(ctx.locale, title), octx.period, 'pptx', octx.at));
        artifacts.push(art('pptx', writeDeck(ctx.locale, path, p.deck).path, title));
      }
      return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
    },
  };
}
