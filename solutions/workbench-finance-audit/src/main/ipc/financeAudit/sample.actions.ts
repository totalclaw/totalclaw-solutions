/**
 * 财会审计 · 示例项目（一键体验）。
 *
 * sample.open：建一家标明「示例数据」的示例公司和一个示例项目，把 sampleData/ 的手算夹具写成 xlsx / txt 放进项目工作区，
 *   走和 data.import 同一条导入路径建数据集，再给每个已可用的业务模块建一次草稿运行、挂好第 ② 步的数据。
 *   用户点进任意模块，第 ② 步已有数据，点「开始校验并计算」就能走到结果与草稿。已经建过就直接切过去。
 * sample.remove：删掉示例公司（含项目、运行、签核、归档）和它的产出目录，切回用户自己的公司。
 *
 * 示例数据放在独立的示例公司里，不碰用户自己公司的阈值、签核人和项目。
 */
import { rmSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { getLocale, t as i18nT } from '@totalclaw/i18n';
import type { FauCompany, FauLocale, FauProject } from '@totalclaw/ipc-contracts';
import { newId, nowIso } from '../../services/financeAudit/store';
import { SAMPLE_PERIOD, SAMPLE_RUNS, SAMPLE_SIGNERS } from '../../services/financeAudit/sampleData';
import { safeFileName } from '../../services/serviceSettlement/excel';
import { sanitizeInputs } from '../../services/financeAudit/engines/capital/inputs';
import { capSpec } from '../../../shared/financeAudit/capital/specs';
import { ensureOutputRoot, importDataset, validateCompany } from './common.actions';
import type { ActionTable, FauActionCtx } from './context';

export function sampleActions(ctx: FauActionCtx): ActionTable {
  const { store, runs } = ctx;
  const sampleCompany = (): FauCompany | undefined => store.listCompanies().find((c) => c.sample);

  function buildProject(company: FauCompany): FauProject {
    const now = nowIso();
    const project = store.saveProject({
      id: newId('pj'), companyId: company.id, type: 'month_close', period: SAMPLE_PERIOD,
      name: i18nT('示例项目（示例数据）'), status: 'open', createdAt: now, updatedAt: now,
    });
    // 示例文件放在项目工作区里，删示例公司时一起删
    const srcDir = join(store.projectDir(company.id, project.id), 'sample-src');
    const imported = new Map<string, string>();
    for (const spec of SAMPLE_RUNS) {
      const inputs: Record<string, string[]> = {};
      for (const [slot, files] of Object.entries(spec.inputs)) {
        inputs[slot] = files.map((f) => {
          const key = `${f.kind}:${f.name}`;
          let id = imported.get(key);
          if (!id) {
            const path = join(srcDir, f.name);
            f.write(path);
            id = importDataset(store, company, project, { path, kind: f.kind, slot, moduleId: spec.moduleId }).id;
            imported.set(key, id);
          }
          return id;
        });
      }
      // 投融资与估值的录入表按录入定义规整（和 capital.save 同一个口子）
      const capInput = capSpec(spec.moduleId, spec.modeId);
      const params = capInput && spec.params?.cap ? { ...spec.params, cap: sanitizeInputs(capInput, spec.params.cap) } : spec.params;
      const run = runs.create(company, project, { moduleId: spec.moduleId, modeId: spec.modeId, params });
      runs.setInputs(run, inputs);
    }
    return project;
  }

  return {
    'sample.open': () => {
      let company = sampleCompany();
      if (!company) {
        const base = validateCompany({
          name: i18nT('示例公司（示例数据）'), regions: ['CN'], region: 'CN', standard: 'CAS', currency: 'CNY',
          signers: SAMPLE_SIGNERS.map((s) => ({ ...s, levels: [...s.levels] })), sodMode: 'block', outputLocale: getLocale() as FauLocale,
        }, null);
        company = store.saveCompany({ ...base, sample: true });
        ensureOutputRoot(store);
      }
      const project = store.listProjects(company.id)[0] || buildProject(company);
      store.patchSettings({ currentCompanyId: company.id, currentProjectId: project.id });
      ctx.emit({ type: 'todo.changed' });
      return { company, project };
    },

    'sample.remove': () => {
      const company = sampleCompany();
      if (!company) return false;
      store.removeCompany(company.id);
      // 产出目录：<产出根>/<公司名>/…（只删产出根下面这一家的目录）
      const root = resolve(store.settings().outputRoot || store.root());
      const out = resolve(join(root, safeFileName(company.name, 'company')));
      if (out.startsWith(root + sep)) rmSync(out, { recursive: true, force: true });
      if (store.settings().currentCompanyId === company.id) {
        const next = store.listCompanies()[0];
        store.patchSettings({ currentCompanyId: next?.id || '', currentProjectId: next ? store.listProjects(next.id)[0]?.id || '' : '' });
      }
      ctx.emit({ type: 'todo.changed' });
      return true;
    },
  };
}
