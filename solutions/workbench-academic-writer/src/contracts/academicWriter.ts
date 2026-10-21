/**
 * 解决方案 · 学术写作智能体 —— 契约类型。
 *
 * 流程：检索（PubMed / Europe PMC / arXiv / Crossref / OpenAlex 公开接口 + 内置浏览器里的学术网站抓取）
 * → 文献库与精读 → 提纲 → 分节成稿（只许引用文献库里的文献）→ 人机双写编辑器里人改 → 参考文献与引用查验 → 导出。
 *
 * 学术诚信红线：参考文献只能来自文献库（真实检索到的条目），模型写出库外的 [n] 一律标红；
 * 精读要点必须能在摘要原文里找到依据；成稿是草稿，由作者负责核对与改写。
 */

export type AwModuleKey = 'search' | 'read' | 'outline' | 'write';
export const AW_MODULE_KEYS: AwModuleKey[] = ['search', 'read', 'outline', 'write'];

export type AwSource = 'pubmed' | 'europepmc' | 'arxiv' | 'crossref' | 'openalex' | 'web';
export const AW_API_SOURCES: Exclude<AwSource, 'web'>[] = ['pubmed', 'europepmc', 'arxiv', 'crossref', 'openalex'];

export type AwCiteStyle = 'gbt7714' | 'apa' | 'ieee';
export type AwPaperType = 'review' | 'research' | 'thesis' | 'proposal';

export interface AwQuote {
  field: string;
  text: string;
  quote: string;
  /** 引用在摘要 / 原文里找到了 */
  verified: boolean;
}

export interface AwPaperSummary {
  question: string;
  method: string;
  findings: string;
  limitations: string;
  quotes: AwQuote[];
  model: string;
  at: string;
}

export interface AwPaper {
  id: string;
  source: AwSource;
  sourceId: string;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  arxivId?: string;
  url: string;
  pdfUrl?: string;
  abstract: string;
  citedBy?: number;
  openAccess?: boolean;
  /** 在哪些来源里都查到了（去重合并后） */
  foundIn?: AwSource[];
  note?: string;
  summary?: AwPaperSummary;
  addedAt?: string;
  /** DOI 查验结果：ok = Crossref 能查到，missing = 查不到，undefined = 没查 */
  doiCheck?: 'ok' | 'missing';
}

export interface AwSearchRun {
  id: string;
  query: string;
  sources: AwSource[];
  yearFrom?: number;
  results: AwPaper[];
  errors: Array<{ source: AwSource; message: string }>;
  at: string;
}

export interface AwOutlineSection {
  id: string;
  heading: string;
  points: string[];
  /** 文献库里的文献 id */
  cites: string[];
}

export interface AwSection {
  id: string;
  heading: string;
  text: string;
  model?: string;
  /** 引用了库外编号（模型编的）的记录 */
  badRefs: string[];
  at?: string;
}

export interface AwCheck {
  cited: string[];
  uncited: string[];
  badRefs: string[];
  doiMissing: string[];
  wordCount: number;
  at: string;
}

export interface AwProject {
  id: string;
  title: string;
  field: string;
  language: 'zh' | 'en';
  style: AwCiteStyle;
  paperType: AwPaperType;
  requirements: string;
  library: AwPaper[];
  lastSearch?: AwSearchRun;
  outline: AwOutlineSection[];
  outlineModel?: string;
  sections: AwSection[];
  /** 从人机双写编辑器取回的全文（人改过的版本，优先于 sections 拼出来的） */
  manuscript?: string;
  manuscriptAt?: string;
  check?: AwCheck;
  exports: Array<{ path: string; kind: 'docx' | 'md' | 'bib'; at: string }>;
  createdAt: string;
}

export interface AwSettings {
  /** 已停用：学术写作智能体固定走系统默认模型，不让用户选（2026-09-23）。旧快照里的值保留但不再读 */
  model?: string;
  moduleModels?: Partial<Record<AwModuleKey, string>>;
  outputDir: string;
  /** NCBI 建议带联系邮箱（礼貌访问，限流更宽） */
  contactEmail: string;
  defaultSources: AwSource[];
}

export interface AwState {
  projects: AwProject[];
  activeProjectId: string;
  settings: AwSettings;
  outputDir: string;
}

export interface AwOpenWithApp {
  name: string;
  path: string;
  icon?: string;
  isDefault?: boolean;
}

export interface AwModelOption { value: string; label: string; provider: string; group?: string }
export interface AwModelsResponse { options: AwModelOption[]; defaultLabel: string }
