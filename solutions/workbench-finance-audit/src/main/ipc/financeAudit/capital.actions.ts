/**
 * 财会审计 · capital 分组的模块特有 action（F1–F8，批次 7），八个模块共用一套录入，action 名用「capital.」前缀：
 *   capital.save          第 ② 步的录入表（手工录入 / 公开链接 / 上传导入）：按 specs.ts 只留登记过的字段与列；
 *   capital.pickTable     选表格文件（xlsx / xls / csv：终端导出、公开数据下载）；
 *   capital.inspectTable  列识别预览（按列名的中 / 英 / 阿三语写法认列，TableMapping 由人确认）；
 *   capital.importTable   导入到录入表：文件复制进项目、登记为本次运行的数据文件（归档时快照），每行记「文件 + 行号」作来源；
 *   capital.template      录入表模板（三语表头，导回来自动认列）；
 *   capital.connectors    本模块可选的授权连接器状态（默认关闭、标「需授权」；这里只读状态，不取数）。
 */
import { dialog } from 'electron';
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { i18nKey, tIn, t as i18nT } from '@totalclaw/i18n';
import { FAU_LOCALES, type FauCapInputs, type FauCapRow, type FauDatasetMeta, type FauInspectResult, type FauLocale, type FauRun } from '@totalclaw/ipc-contracts';
import { capSpec, type CapModeSpec, type CapTableSpec } from '../../../shared/financeAudit/capital/specs';
import { moduleById } from '../../../shared/financeAudit/catalog';
import { dataSourceByConnector, DS_NAME_KEYS } from '../../../shared/financeAudit/dataSources';
import { listConnectorCatalog } from '../../../shared/connectorCatalog';
import { listSheetNames, readTable } from '../../services/serviceSettlement/excel';
import { isNumericUnit, parseNum, sanitizeInputs } from '../../services/financeAudit/engines/capital/inputs';
import { FauStepError } from '../../services/financeAudit/skillRunner';
import { sha256File } from '../../services/financeAudit/signoff';
import { newId, nowIso } from '../../services/financeAudit/store';
import { writeWorkbookFile } from '../../services/financeAudit/outputs/xlsx';
import { outputDirFor } from '../../services/financeAudit/outputs/common';
import { getConnectorsService } from '../../services/connectors';
import type { ActionTable, FauActionCtx } from './context';

const CAPITAL = ['valuation', 'capex', 'ma', 'ib', 'pe', 'research', 'markets', 'wealth'];
const MAX_IMPORT_ROWS = 2000;
const norm = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();

/** 列识别关键字：列名在三种语言下的写法 + 列 key 本身（模板表头就是「中 / English / العربية」） */
export function columnKeywords(label: string, key: string): string[] {
  return [...new Set([...FAU_LOCALES.map((l) => tIn(l, label)), key])].filter(Boolean);
}

/** 按列识别：先精确匹配任一写法（含「中 / English / العربية」模板表头里的任一段），再按表头包含匹配 */
export function detectTableColumns(headers: string[], table: CapTableSpec): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();
  const parts = (h: string) => [norm(h), ...h.split('/').map(norm)];
  for (const pass of ['exact', 'contains'] as const) {
    for (const c of table.columns) {
      if (out[c.key]) continue;
      const kws = columnKeywords(c.label, c.key).map(norm);
      const hit = headers.find((h) => !used.has(h) && kws.some((k) => (pass === 'exact' ? parts(h).includes(k) : k.length > 1 && norm(h).includes(k))));
      if (hit) { out[c.key] = hit; used.add(hit); }
    }
  }
  return out;
}

/** 表格行 → 录入行（来源：文件 + 原表行号，表头下第一行 = 2） */
export function tableRows(rows: Record<string, string>[], mapping: Record<string, string>, table: CapTableSpec, file: string, sha256: string): FauCapRow[] {
  return rows.slice(0, MAX_IMPORT_ROWS).map((r, i): FauCapRow => ({
    cells: Object.fromEntries(table.columns.map((c) => {
      const raw = mapping[c.key] ? String(r[mapping[c.key]] ?? '').trim() : '';
      return [c.key, raw === '' ? null : isNumericUnit(c.unit) ? parseNum(raw, c.unit) : raw];
    })),
    src: { kind: 'upload', file, row: i + 2, sha256 },
  })).filter((r) => Object.values(r.cells).some((v) => v !== null && v !== ''));
}

export function capitalActions(ctx: FauActionCtx): ActionTable {
  const { store, runs } = ctx;

  const loadRun = (runId: unknown): { run: FauRun; company: ReturnType<FauActionCtx['currentCompany']>; project: NonNullable<ReturnType<typeof store.getProject>>; spec: CapModeSpec } => {
    const company = ctx.currentCompany();
    const run = store.findRun(company.id, String(runId || ''), store.settings().currentProjectId);
    if (!run || !CAPITAL.includes(run.moduleId)) throw new FauStepError(i18nKey('找不到这次运行'));
    if (['signing', 'archived', 'void', 'running'].includes(run.status)) throw new FauStepError(i18nKey('已经开始签核，不能再改；请复核人退回后再改'));
    const project = store.getProject(company.id, run.projectId);
    if (!project) throw new FauStepError(i18nKey('找不到项目'));
    const spec = capSpec(run.moduleId, run.modeId);
    if (!spec) throw new FauStepError(i18nKey('这个模块没有「{p0}」模式'), { p0: run.modeId });
    return { run, company, project, spec };
  };
  const tableOf = (spec: CapModeSpec, id: unknown): CapTableSpec => {
    const t = spec.tables.find((x) => x.id === id);
    if (!t) throw new FauStepError(i18nKey('没有这张录入表'));
    return t;
  };
  const fileOk = (p: unknown): string => {
    const path = String(p || '');
    if (!path || !existsSync(path) || !statSync(path).isFile() || !/\.(xlsx|xlsm|xls|csv)$/i.test(path)) throw new FauStepError(i18nKey('文件不存在：{p0}'), { p0: path });
    return path;
  };
  const save = (run: FauRun, cap: FauCapInputs, inputs = run.inputs): FauRun => runs.setInputs(run, inputs, { cap });

  return {
    'capital.save': (p: { runId: string; cap: unknown }) => {
      const { run, spec } = loadRun(p?.runId);
      return save(run, sanitizeInputs(spec, p?.cap));
    },

    'capital.pickTable': async () => {
      const w = ctx.win();
      const opts = { properties: ['openFile'] as Array<'openFile'>, filters: [{ name: 'Excel / CSV', extensions: ['xlsx', 'xls', 'xlsm', 'csv'] }] };
      const r = w ? await dialog.showOpenDialog(w, opts) : await dialog.showOpenDialog(opts);
      return { paths: r.canceled ? [] : r.filePaths };
    },

    'capital.inspectTable': (p: { runId: string; path: string; tableId: string; sheet?: string; mapping?: Record<string, string> }): FauInspectResult => {
      const { spec } = loadRun(p?.runId);
      const table = tableOf(spec, p?.tableId);
      const path = fileOk(p?.path);
      const t = readTable(path, { sheetName: p?.sheet });
      const mapping: Record<string, string> = { ...detectTableColumns(t.headers, table) };
      for (const [k, v] of Object.entries(p?.mapping || {})) if (table.columns.some((c) => c.key === k)) mapping[k] = v && t.headers.includes(v) ? v : '';
      return {
        path, fileName: t.fileName, kind: 'market_data', sheetName: t.sheetName, sheetNames: listSheetNames(path), headers: t.headers, rowCount: t.rows.length,
        preview: t.rows.slice(0, 5), mapping,
        roles: table.columns.map((c) => ({ key: c.key, label: c.label, required: !!c.required })),
        missing: table.columns.filter((c) => c.required && !mapping[c.key]).map((c) => c.key),
      };
    },

    'capital.importTable': (p: { runId: string; path: string; tableId: string; sheet?: string; mapping?: Record<string, string>; append?: boolean }) => {
      const { run, company, project, spec } = loadRun(p?.runId);
      const table = tableOf(spec, p?.tableId);
      const path = fileOk(p?.path);
      const t = readTable(path, { sheetName: p?.sheet });
      const mapping = Object.fromEntries(Object.entries(p?.mapping || {}).filter(([k, v]) => table.columns.some((c) => c.key === k) && t.headers.includes(v)));
      const miss = table.columns.filter((c) => c.required && !mapping[c.key]);
      if (miss.length) throw new FauStepError(i18nKey('还有必需的列没对应：{p0}'), { p0: miss.map((c) => i18nT(c.label)).join(i18nT('、')) });
      const hash = sha256File(path) || '';
      const stored = join(store.filesDir(company.id, project.id), `${hash.slice(0, 12)}-${basename(path)}`);
      if (!existsSync(stored)) copyFileSync(path, stored);
      const rows = tableRows(t.rows, mapping, table, t.fileName, hash);
      const meta: FauDatasetMeta = {
        id: newId('ds'), projectId: project.id, kind: 'evidence', slot: 'dataFiles', moduleId: run.moduleId, label: `${basename(path)} · ${i18nT(table.label)}`,
        fileName: basename(path), sourcePath: path, storedPath: stored, sha256: hash, sheetName: t.sheetName, mapping, rowCount: rows.length,
        importedAt: nowIso(), from: 'file', issues: [], currency: company.currency,
      };
      store.saveDataset(company.id, meta, rows);
      const cap = sanitizeInputs(spec, run.params.cap);
      cap.tables[table.id] = [...(p?.append ? cap.tables[table.id] || [] : []), ...rows];
      ctx.emit({ type: 'todo.changed' });
      return save(run, sanitizeInputs(spec, cap), { ...run.inputs, dataFiles: [...(run.inputs.dataFiles || []), meta.id] });
    },

    'capital.template': (p: { moduleId: string; modeId: string; tableId: string; locale?: string }) => {
      const spec = CAPITAL.includes(String(p?.moduleId)) ? capSpec(String(p.moduleId), String(p?.modeId || '')) : null;
      if (!spec) throw new FauStepError(i18nKey('没有这张录入表'));
      const table = tableOf(spec, p?.tableId);
      const { company, project } = ctx.current();
      const loc: FauLocale = FAU_LOCALES.includes(p?.locale as FauLocale) ? p!.locale as FauLocale : company.outputLocale;
      const dir = join(outputDirFor(store.settings().outputRoot || store.root(), company.name, project.name, 'G6', tIn(loc, i18nKey('投融资与估值'))), 'templates');
      const path = join(dir, `${tIn(loc, table.label)}-${tIn(loc, i18nKey('模板'))}.xlsx`.replace(/[\\/:*?"<>|]/g, '_'));
      // 表头写三语（是数据，导回来按列名认列）
      writeWorkbookFile(path, [
        { name: tIn(loc, table.label), headers: table.columns.map((c) => columnKeywords(c.label, '').join(' / ')), rows: [] },
        { name: tIn(loc, i18nKey('填写说明')), rows: [[tIn(loc, table.help)], [tIn(loc, i18nKey('比例可填 12.5% 或 0.125；金额与模型其它数字用同一单位。'))]] },
      ], { rtl: loc === 'ar' });
      return { path };
    },

    'capital.connectors': (p: { moduleId: string }) => {
      const ids = CAPITAL.includes(String(p?.moduleId)) ? moduleById(String(p.moduleId))?.connectors || [] : [];
      const catalog = listConnectorCatalog(i18nT);
      let installed: Array<{ url: string; authorized: boolean }> = [];
      try {
        installed = (getConnectorsService()?.list() || []).map((r) => ({
          url: r.def.transport.kind === 'http' ? r.def.transport.url : '',
          authorized: r.def.enabled && (!!r.authorized || r.oauth?.state === 'logged_in' || r.status === 'ready'),
        }));
      } catch { /* 连接器服务没起来：一律按未授权显示 */ }
      return ids.map((id) => {
        const entry = catalog.find((e) => e.id === id);
        const url = entry?.transport.kind === 'http' ? entry.transport.url.replace(/\/+$/, '') : '';
        const hit = url ? installed.find((x) => x.url.replace(/\/+$/, '') === url) : undefined;
        const ds = dataSourceByConnector(id);
        return {
          id, name: DS_NAME_KEYS[ds?.id || ''] || entry?.name || ds?.name || id,
          status: hit ? (hit.authorized ? 'authorized' : 'added') : 'needs_auth',
          fallback: ds?.fallback || '',
        };
      });
    },
  };
}
