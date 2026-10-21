/**
 * 受控问答知识库：导入资料 → 逐页存原文 → 提问时检索 → 判边界 → 给模型。
 *
 * 只做存储与编排，**判定全在 groundedQa.logic.ts**（纯函数、可单测）。
 * 这里刻意不写任何"要不要拒答"的逻辑，避免边界判据散落两处各改一半。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { accountPath } from './accountScope';
import { t as i18nT } from '@totalclaw/i18n';
import {
  decide, search, fuseHits, withNextPages, buildPrompt, suggestQuestions, suggestLatinQuestions, pickOutOfScopeQuestion, compilePatterns, mergeParsedPages, MAX_CONTEXT_PAGES,
  type AnswerLang, type GroundedPage, type GroundedDecision, type GroundedTurn,
} from './groundedQa.logic';

/**
 * 解析器版本。解析方式改进后加一，手册文件夹同步时会把旧版本解析的资料重新导入（保留审批状态）。
 * 2：pypdf + macOS OCR 合并 + 叠字/空格清洗
 */
export const PARSER_VERSION = 2;

/** 知识库支持的资料格式（与文档解析器能力一致） */
export const KB_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];

export interface KbDoc {
  id: string;
  name: string;
  ext: string;
  pages: number;
  chars: number;
  /** 未审批的资料**不进可回答范围** —— 演示里要能现场展示这条边界。 */
  approved: boolean;
  importedAt: number;
  /** 来自知识手册文件夹时记下原路径，下次同步据此判断「已经导入过」 */
  source?: string;
  /** 用哪一版解析器导入的；缺省 = 1 */
  parser?: number;
}

/** 示例问题。inScope=false 的那条是故意放的「答不上」用例，用来演示拒答边界。 */
export interface Suggestion { q: string; inScope: boolean }

/** 预取好的答案（点示例问题时直接回，不再等模型）。 */
export interface CachedAnswer {
  answered: boolean;
  answer?: string;
  refusal?: string;
  reason?: string;
  lang: AnswerLang;
  citations: { docName: string; page: number; snippet: string }[];
}
interface AnswerCache { fingerprint: string; answers: Record<string, CachedAnswer> }
interface SuggestionCache { fingerprint: string; byLang: Partial<Record<AnswerLang, string[]>> }

export interface AskResult {
  answered: boolean;
  /** 拒答时给用户看的话；回答时为空 */
  refusal?: string;
  reason?: GroundedDecision['reason'];
  /** 回答正文（由调用方用模型生成后回填），这里只负责给出提示词与引用 */
  prompt?: string;
  citations: { docName: string; page: number; snippet: string }[];
}

type ExtractFn = (filePath: string) => Promise<{ n: number; text: string }[]>;
/** 导入进度回调：一份文件一份文件报，UI 拿去显示「正在识别 X/Y 页」 */
export type ImportProgress = (p: { file: string; done: number; total: number }) => void;

/**
 * 这一页要不要 OCR。判据只看 pypdf 的产出质量：
 *   ① 几乎没抽到字 → 多半是整图页或转曲正文；
 *   ② 叠字（粗体描边被抽成「相相信信」）→ 文本在，但脏得没法检索。
 * 其余页一律不 OCR —— 文字型 PDF 占绝大多数，整本识别纯属浪费十几分钟。
 */
export function needsOcr(text: string): boolean {
  const t = (text || '').trim();
  if (t.length < 200) return true;
  const doubled = t.match(/([\u4e00-\u9fff])\1/g)?.length ?? 0;
  return doubled > t.length / 40;
}
/** 对 PDF 指定页 OCR，返回 页码 → 文本；不可用时返回空 Map */
type OcrFn = (filePath: string, pages: number[], onProgress?: (done: number, total: number) => void) => Promise<Map<number, string>>;

export class GroundedQaStore {
  private docs: KbDoc[] = [];
  private pages: GroundedPage[] = [];

  constructor(private readonly extract: ExtractFn, private readonly ocr?: OcrFn) {
    this.load();
  }

  private dir(...sub: string[]): string {
    const d = accountPath('grounded-qa', ...sub); // account-scope:account
    mkdirSync(join(d, '..'), { recursive: true });
    return d;
  }
  private get docsFile() { return this.dir('docs.json'); }
  private get pagesFile() { return this.dir('pages.json'); }
  /** 用户选定的资料文件夹。独立存一份：换文件夹不该动已导入的资料与审批状态 */
  private get folderFile() { return this.dir('folder.json'); }

  /** 当前资料文件夹；没选过返回 null（调用方回落到自动探测） */
  getFolder(): string | null {
    try {
      if (!existsSync(this.folderFile)) return null;
      const v = JSON.parse(readFileSync(this.folderFile, 'utf8'))?.path;
      return typeof v === 'string' && v ? v : null;
    } catch { return null; }
  }

  setFolder(dir: string): void {
    writeFileSync(this.folderFile, JSON.stringify({ path: dir, at: Date.now() }), 'utf8');
  }

  private load(): void {
    try {
      mkdirSync(this.dir('files'), { recursive: true });
      if (existsSync(this.docsFile)) this.docs = JSON.parse(readFileSync(this.docsFile, 'utf8'));
      if (existsSync(this.pagesFile)) this.pages = JSON.parse(readFileSync(this.pagesFile, 'utf8'));
    } catch { this.docs = []; this.pages = []; }
  }
  private save(): void {
    writeFileSync(this.docsFile, JSON.stringify(this.docs), 'utf8');
    writeFileSync(this.pagesFile, JSON.stringify(this.pages), 'utf8');
  }

  list(): KbDoc[] { return [...this.docs]; }

  /**
   * 与知识手册文件夹对齐：文件夹里有、库里没有的就导入（**默认已审批** —— 放进手册
   * 文件夹这个动作本身就是机构的发布决定，界面上审批面板默认也是收起的）。
   *
   * 库里已有的保持原审批状态：用户在面板里手动关掉的，不能因为重启又被打开。
   * 早期手动导入的同名资料（没有 source）直接认领，重复导入的多份只留一份
   * （优先留已审批的），否则审批列表里会出现两行一模一样的资料。
   * 文件夹里删掉的文件不跟着删库：检索用的是库里的逐页原文，不依赖原文件。
   */
  async syncFolder(dir: string, onProgress?: ImportProgress): Promise<KbDoc[]> {
    const files = readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && !e.name.startsWith('.') && KB_EXTENSIONS.includes(extname(e.name).toLowerCase()))
      .map((e) => join(dir, e.name))
      .sort();
    const imported: KbDoc[] = [];
    for (const file of files) {
      const name = basename(file);
      const same = this.docs
        .filter((d) => d.source === file || (!d.source && d.name === name))
        .sort((a, b) => Number(b.approved) - Number(a.approved));
      if (same.length) {
        const keep = same[0];
        for (const dup of same.slice(1)) this.remove(dup.id);
        if ((keep.parser ?? 1) >= PARSER_VERSION) { keep.source = file; continue; }
        // 旧解析器导入的：按新解析器重导，审批状态沿用
        this.remove(keep.id);
        imported.push(await this.import(file, { approved: keep.approved, source: file, onProgress }));
        continue;
      }
      imported.push(await this.import(file, { approved: true, source: file, onProgress }));
    }
    this.save();
    return imported;
  }

  /** 导入一份资料：拷进账号目录 → 解析逐页文本 → 默认**未审批**。 */
  async import(filePath: string, opts: { approved?: boolean; source?: string; onProgress?: ImportProgress } = {}): Promise<KbDoc> {
    const id = randomUUID().slice(0, 8);
    const ext = extname(filePath).toLowerCase();
    const dst = join(this.dir('files'), `${id}${ext}`);
    copyFileSync(filePath, dst);
    let parsed = await this.extract(dst);
    if (ext === '.pdf' && this.ocr) {
      // 只 OCR「pypdf 抽得不好」的页：整本逐页识别在 574 页的书上要十几分钟，
      // 而实测这类书只有 4% 的页真的需要（转曲正文 / 整图页 / 叠字）。
      const need = parsed.filter((p) => needsOcr(p.text)).map((p) => p.n);
      const ocred = need.length
        ? await this.ocr(dst, need, (done, total) => opts.onProgress?.({ file: basename(filePath), done, total }))
        : new Map<number, string>();
      parsed = mergeParsedPages(parsed, ocred);
    } else {
      parsed = mergeParsedPages(parsed, new Map());
    }
    // 太短的页多半是封面/空白页，进检索只会制造噪声
    const usable = parsed.filter((p) => (p.text || '').trim().length > 40);
    const name = basename(filePath);
    const doc: KbDoc = {
      id, name, ext, pages: usable.length,
      chars: usable.reduce((n, p) => n + p.text.length, 0),
      approved: opts.approved === true, importedAt: Date.now(), parser: PARSER_VERSION,
      ...(opts.source ? { source: opts.source } : {}),
    };
    this.docs.unshift(doc);
    for (const p of usable) {
      this.pages.push({ docId: id, docTitle: name, page: p.n, text: p.text });
    }
    this.save();
    return doc;
  }

  /**
   * 换文件夹 = 换一套资料：先清空现有资料再导入新目录。
   * 不做「合并」——用户选了新目录就是要换一批资料，留着旧的会让「可回答范围」
   * 变成两个目录的并集，审批列表里还躺着已经删掉的文件，边界就说不清了。
   */
  async replaceFolder(dir: string, onProgress?: ImportProgress): Promise<KbDoc[]> {
    this.clearAll();
    this.setFolder(dir);
    return this.syncFolder(dir, onProgress);
  }

  /** 清空全部资料（含拷进账号目录的原件），只保留文件夹设置。 */
  clearAll(): void {
    for (const d of [...this.docs]) {
      try { unlinkSync(join(this.dir('files'), `${d.id}${d.ext}`)); } catch { /* 文件已不在无妨 */ }
    }
    this.docs = [];
    this.pages = [];
    this.save();
  }

  /**
   * 示例问题：limit 个能答的 + 1 个答不上的（放在最后，用来演示拒答边界）。
   * 能不能答都用真实检索判定算出来，不靠人工维护。
   */
  suggestions(lang: AnswerLang = 'zh', limit = 4): Suggestion[] {
    const scope = this.approvedPages();
    if (!scope.length) return [];
    // 界面语言下已经翻好并验证过的一版优先（中文资料 + 英文界面走这条）
    const cached = this.getSuggestionCache(lang);
    const base: string[] = cached ?? (lang === 'zh'
      ? suggestQuestions(scope, limit)
      // 英文/阿语界面先用资料里的英文术语出题；资料里没有英文术语时返回空，
      // 由后台翻译补齐（见 IPC 的预取），绝不把中文问题塞进英文界面
      : suggestLatinQuestions(scope, limit));
    const inScope: Suggestion[] = base.map((q) => ({ q, inScope: true }));
    const outQ = pickOutOfScopeQuestion(scope, lang);
    return outQ ? [...inScope, { q: outQ, inScope: false }] : inScope;
  }

  private get suggestionsFile() { return this.dir('suggestions.json'); }

  /** 某种语言下已验证可答的示例问题（翻译后逐条跑过真实提问才会写进来）。 */
  getSuggestionCache(lang: AnswerLang): string[] | null {
    try {
      if (!existsSync(this.suggestionsFile)) return null;
      const box = JSON.parse(readFileSync(this.suggestionsFile, 'utf8')) as SuggestionCache;
      if (box.fingerprint !== this.fingerprint()) return null;
      const list = box.byLang?.[lang];
      return Array.isArray(list) && list.length ? list : null;
    } catch { return null; }
  }

  setSuggestionCache(lang: AnswerLang, questions: string[]): void {
    let box: SuggestionCache = { fingerprint: this.fingerprint(), byLang: {} };
    try {
      if (existsSync(this.suggestionsFile)) {
        const prev = JSON.parse(readFileSync(this.suggestionsFile, 'utf8')) as SuggestionCache;
        if (prev.fingerprint === box.fingerprint) box = prev;
      }
    } catch { /* 缓存坏了就重建 */ }
    box.byLang[lang] = questions;
    writeFileSync(this.suggestionsFile, JSON.stringify(box), 'utf8');
  }

  private approvedPages(): GroundedPage[] {
    const approvedIds = new Set(this.docs.filter((d) => d.approved).map((d) => d.id));
    return this.pages.filter((p) => approvedIds.has(p.docId));
  }

  /**
   * 资料指纹：资料集合或审批状态一变就变。
   * 预取的答案挂在这个指纹上 —— 换了资料、关掉某份资料的审批，旧答案立刻失效，
   * 否则会出现「这份资料已经不让用了，点示例问题还照旧答出来」。
   */
  fingerprint(): string {
    const sig = this.docs.map((d) => `${d.id}:${d.approved ? 1 : 0}:${d.pages}`).sort().join('|');
    return createHash('sha1').update(sig).digest('hex').slice(0, 16);
  }

  private get answersFile() { return this.dir('answers.json'); }

  /** 取预取好的答案；资料指纹对不上就当没有。 */
  getCachedAnswer(question: string): CachedAnswer | null {
    try {
      if (!existsSync(this.answersFile)) return null;
      const box = JSON.parse(readFileSync(this.answersFile, 'utf8')) as AnswerCache;
      if (box.fingerprint !== this.fingerprint()) return null;
      return box.answers[question.trim()] ?? null;
    } catch { return null; }
  }

  setCachedAnswer(question: string, value: CachedAnswer): void {
    let box: AnswerCache = { fingerprint: this.fingerprint(), answers: {} };
    try {
      if (existsSync(this.answersFile)) {
        const prev = JSON.parse(readFileSync(this.answersFile, 'utf8')) as AnswerCache;
        if (prev.fingerprint === box.fingerprint) box = prev;
      }
    } catch { /* 缓存坏了就重建 */ }
    box.answers[question.trim()] = value;
    writeFileSync(this.answersFile, JSON.stringify(box), 'utf8');
  }

  /** 审批开关。未审批的资料检索不到 —— 这是现场要演示的边界之一。 */
  setApproved(docId: string, approved: boolean): void {
    const d = this.docs.find((x) => x.id === docId);
    if (!d) throw new Error(i18nT('资料不存在'));
    d.approved = approved;
    this.save();
  }

  remove(docId: string): void {
    const i = this.docs.findIndex((x) => x.id === docId);
    if (i < 0) throw new Error(i18nT('资料不存在'));
    const [d] = this.docs.splice(i, 1);
    this.pages = this.pages.filter((p) => p.docId !== docId);
    try { unlinkSync(join(this.dir('files'), `${d.id}${d.ext}`)); } catch { /* 文件已不在无妨 */ }
    this.save();
  }

  /**
   * 提问。**只在已审批资料里检索**；判定完全交给 logic 层。
   * 返回提示词与引用，由调用方拿去过模型 —— 拒答时 prompt 为空，压根不调模型。
   *
   * searchQueries：检索改写后的独立问题（中文版/英文版）。给了就用它们检索；
   * 原问题只参与禁区判定 —— 追问「那具体怎么做？」本身检索只会蹭到高频虚词，用它的命中反而是错的。
   * 禁区对原问题和每条改写都判：阿语提问绕得过中文禁区表，改写成中文后就绕不过了。
   *
   * expandQueries：模型给的同义词/相关术语。**只用来补召回，不参与放行** —— 至少一条问题本身
   * 过了证据判定才会用它们捞更多相关页，否则模型自己加的词就能把资料之外的问题「凑」成有依据。
   *
   * 多路命中按名次融合（fuseHits），最多 MAX_CONTEXT_PAGES 页给模型：问题问得宽时答案散在好几页，
   * 只取一路的前几页就会答不全。
   */
  ask(question: string, opts: {
    lang?: AnswerLang;
    canRead?: boolean;
    forbiddenPatterns?: string[];
    refusalMessage?: string;
    minScore?: number;
    history?: GroundedTurn[];
    searchQueries?: string[];
    expandQueries?: string[];
  } = {}): AskResult {
    const approvedIds = new Set(this.docs.filter((d) => d.approved).map((d) => d.id));
    const scope = this.pages.filter((p) => approvedIds.has(p.docId));
    const decideOpts = {
      canRead: opts.canRead !== false,
      forbidden: compilePatterns(opts.forbiddenPatterns),
      refusalMessage: opts.refusalMessage,
      minScore: opts.minScore,
    };
    const queries = opts.searchQueries?.length ? opts.searchQueries : [question];
    const refuse = (d: GroundedDecision): AskResult =>
      ({ answered: false, refusal: d.message, reason: d.reason, citations: [] });

    const raw = decide(scope, question, decideOpts);
    if (raw.reason === 'restricted' || raw.reason === 'out_of_scope') return refuse(raw);

    const allowed: { q: string; d: GroundedDecision }[] = [];
    let firstRefusal: GroundedDecision | undefined;
    for (const q of queries) {
      const d = q === question ? raw : decide(scope, q, decideOpts);
      if (d.reason === 'out_of_scope') return refuse(d);
      if (d.allowed) allowed.push({ q, d });
      else firstRefusal ??= d;
    }
    if (!allowed.length) return refuse(firstRefusal ?? raw);

    const fused = fuseHits([
      ...allowed.map((a) => a.d.hits),
      ...(opts.expandQueries || []).map((kw) => search(scope, kw)),
    ], MAX_CONTEXT_PAGES);
    const hits = withNextPages(fused, scope, allowed[0].q);
    // 提示词里注明的「完整意思」优先用改写后的问题（追问时原句看不懂）
    const standalone = allowed.find((a) => a.q !== question)?.q ?? question;

    return {
      answered: true,
      prompt: buildPrompt(question, hits, opts.lang || 'zh', opts.history, standalone),
      citations: hits.map((h) => ({ docName: h.docTitle, page: h.page, snippet: h.snippet })),
    };
  }
}

/**
 * 在桌面找知识手册文件夹：桌面上，或桌面下一层（演示资料常整理在「xx演示/」里）。
 * 找不到返回 null，界面据此提示把资料放到哪。
 * 文件夹名是磁盘上的真实名字，不能翻译 —— 写成比较式，i18n 守卫认它是匹配值而非展示文案。
 */
export function findHandbookDir(desktop: string): string | null {
  const isHandbook = (name: string) => name === '宣教助手知识手册';
  const dirsIn = (d: string) => {
    try { return readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.')); }
    catch { return []; }
  };
  const top = dirsIn(desktop);
  const direct = top.find((e) => isHandbook(e.name));
  if (direct) return join(desktop, direct.name);
  for (const sub of top) {
    const hit = dirsIn(join(desktop, sub.name)).find((e) => isHandbook(e.name));
    if (hit) return join(desktop, sub.name, hit.name);
  }
  return null;
}
