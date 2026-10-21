/**
 * ⑦ 归档（第 5.4 节）：最后一级签核通过后，把签核时的文件副本、签核页（xlsx + pdf）、数据集快照、哈希清单
 * 复制到项目归档区 archive/<runId>/。归档后只读；文件被改动后 signoff.verify 判「签核失效」。
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { tIn } from '@totalclaw/i18n';
import type { FauCompany, FauProject, FauRun, FauSignoffRecord } from '@totalclaw/ipc-contracts';
import { moduleById } from '../../../shared/financeAudit/catalog';
import { FinanceAuditStore, nowIso } from './store';
import { activeRecords, sha256File } from './signoff';
import { OUT } from './outputs/common';
import { signoffSpec, writeSignoffPage } from './outputs/signoffPage';

export type PdfWriter = (path: string, html: string) => Promise<void>;

export async function archiveRun(
  store: FinanceAuditStore, run: FauRun, company: FauCompany, project: FauProject, all: FauSignoffRecord[], writePdf?: PdfWriter,
): Promise<{ dir: string; files: { name: string; sha256: string }[] }> {
  const dir = store.archiveDir(company.id, project.id, run.id);
  const files: { name: string; sha256: string }[] = [];
  for (const a of run.artifacts) {
    if (!existsSync(a.path)) continue;
    const target = join(dir, basename(a.path));
    copyFileSync(a.path, target);
    files.push({ name: basename(a.path), sha256: sha256File(target) || '' });
  }
  const def = moduleById(run.moduleId);
  const t = (k: string) => tIn(run.outputLocale, k);
  const title = `${def?.code || ''} ${def ? t(def.name) : run.moduleId} · ${project.name}`;
  const spec = signoffSpec(run.outputLocale, title, activeRecords(run.id, all), run.reminders, [
    [t(OUT.company), company.name], [t(OUT.project), project.name], [t(OUT.period), project.period],
  ]);
  const page = writeSignoffPage(dir, run.outputLocale, spec);
  files.push({ name: basename(page.xlsxPath), sha256: sha256File(page.xlsxPath) || '' });
  if (writePdf) {
    const pdf = join(dir, `${basename(page.xlsxPath, '.xlsx')}.pdf`);
    try {
      await writePdf(pdf, page.html);
      files.push({ name: basename(pdf), sha256: sha256File(pdf) || '' });
    } catch { /* PDF 渲染失败不挡归档：xlsx 签核页已在 */ }
  } else {
    writeFileSync(join(dir, 'signoff.html'), page.html, 'utf8');
  }
  // 数据集快照（只读副本）
  const dsDir = join(dir, 'datasets');
  mkdirSync(dsDir, { recursive: true });
  for (const id of Object.values(run.inputs).flat()) {
    const d = store.dataset(company.id, project.id, id);
    if (d) writeFileSync(join(dsDir, `${id}.json`), JSON.stringify(d), 'utf8');
  }
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ runId: run.id, moduleId: run.moduleId, archivedAt: nowIso(), files }, null, 2), 'utf8');
  return { dir, files };
}
