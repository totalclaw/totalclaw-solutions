/**
 * 学术写作智能体的落盘：账号私有目录下一个 state.json（论文项目 + 设置），原子写。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';
import type { AwProject, AwSettings, AwState } from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';

export type AwStored = Omit<AwState, 'outputDir'>;

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function defaultSettings(): AwSettings {
  return { outputDir: '', contactEmail: '', defaultSources: ['pubmed', 'europepmc', 'arxiv', 'openalex'] };
}

export function newProject(input: Partial<AwProject> = {}): AwProject {
  return {
    id: input.id || newId('awp'),
    title: String(input.title || i18nT('未命名论文')).trim(),
    field: String(input.field || ''),
    language: input.language === 'en' ? 'en' : 'zh',
    style: input.style === 'apa' || input.style === 'ieee' ? input.style : 'gbt7714',
    paperType: input.paperType || 'review',
    requirements: String(input.requirements || ''),
    library: [], outline: [], sections: [], exports: [],
    createdAt: new Date().toISOString(),
  };
}

function normalize(raw: any): AwStored {
  const d = defaultSettings();
  const s = raw?.settings || {};
  const projects: AwProject[] = Array.isArray(raw?.projects)
    ? raw.projects.filter((p: any) => p?.id).map((p: any) => ({ ...newProject(p), ...p, library: p.library || [], outline: p.outline || [], sections: p.sections || [], exports: p.exports || [] }))
    : [];
  if (!projects.length) projects.push(newProject());
  return {
    projects,
    activeProjectId: projects.some((p) => p.id === raw?.activeProjectId) ? raw.activeProjectId : projects[0].id,
    settings: { ...d, ...s, defaultSources: Array.isArray(s.defaultSources) && s.defaultSources.length ? s.defaultSources : d.defaultSources },
  };
}

export class AcademicWriterStore {
  private cache: AwStored | null = null;
  private cacheDir = '';

  constructor(private readonly dirOf: () => string = () => accountPath('academic-writer')) {}

  private file(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) { this.cache = null; this.cacheDir = d; }
    mkdirSync(d, { recursive: true });
    return join(d, 'state.json');
  }

  read(): AwStored {
    const f = this.file();
    if (!this.cache) {
      let raw: any = null;
      try { raw = existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null; } catch { raw = null; }
      this.cache = normalize(raw);
    }
    return this.cache;
  }

  update<T>(fn: (s: AwStored) => T): T {
    const s = this.read();
    const out = fn(s);
    const f = this.file();
    writeFileSync(`${f}.tmp`, JSON.stringify(s), 'utf-8');
    renameSync(`${f}.tmp`, f);
    return out;
  }

  project(s = this.read()): AwProject {
    return s.projects.find((p) => p.id === s.activeProjectId) || s.projects[0];
  }
}
