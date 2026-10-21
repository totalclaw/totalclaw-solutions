/**
 * 高校一体化 AI 智能体 · 知识库 / 问答 / 转办 / 统计（电脑端 IPC 与学生手机端共用）。
 */
import { copyFileSync, existsSync, rmSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import type {
  CaAnswer, CaAnswerKind, CaChannel, CaDoc, CaFaq, CaFaqInput, CaHit, CaModule, CaQaRecord, CaStats, CaTicket,
} from '@totalclaw/ipc-contracts';
import { CA_DIRECTIONS } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { extractDocument } from '../documentExtractor';
import { readTable, writeWorkbook } from '../serviceSettlement/excel';
import { buildIndex, search } from './kb';
import { answerQuestion, noEvidenceReply } from './qa';
import { classifyDomain, listDomains } from './domains';
import { listScenarios } from './scenarios';
import { CampusAiStore, newId, schoolLabel, type StoredQa } from './store';

export const KB_EXTS = ['.pdf', '.docx', '.doc', '.txt', '.md', '.xlsx', '.xls', '.csv', '.pptx', '.html', '.htm'];

export type CaLlm = (prompt: string) => Promise<{ text: string; model: string }>;

const AUTO_KINDS: CaAnswerKind[] = ['faq', 'answer', 'quote'];

export function publicQa(r: StoredQa): CaQaRecord {
  const { askerId: _a, ...rest } = r;
  return rest;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export class CampusAiService {
  private building: Promise<void> = Promise.resolve();

  constructor(
    readonly store: CampusAiStore,
    private readonly llm: CaLlm,
    private readonly onChange: () => void,
    private readonly onProgress: (message: string) => void = () => {},
  ) {}

  audit(module: CaModule, action: string, ok: boolean, started?: number, detail?: string): void {
    this.store.audit({ at: new Date().toISOString(), module, action, ok, ms: started ? Date.now() - started : undefined, detail: detail ? detail.slice(0, 200) : undefined });
  }

  // ── 文档 ───────────────────────────────────────────────────────────

  async importDocs(paths: string[], dept: string, category: string, courseId?: string): Promise<CaDoc[]> {
    const files = (paths || []).filter((p) => p && existsSync(p) && KB_EXTS.includes(extname(p).toLowerCase()));
    if (!files.length) throw new Error(i18nT('没有可导入的文档（支持 PDF、Word、Excel、PPT、TXT、Markdown、HTML）'));
    const dir = this.store.dir('docs');
    const made: CaDoc[] = [];
    this.store.update((s) => {
      for (const src of files) {
        const id = newId('cad');
        const dest = join(dir, `${id}${extname(src).toLowerCase()}`);
        copyFileSync(src, dest);
        const doc: CaDoc = {
          id, name: basename(src), dept: dept || s.settings.depts[0] || '', category: category || '', path: dest,
          size: statSync(dest).size, status: 'pending', chars: 0, chunks: 0, addedAt: new Date().toISOString(),
          ...(courseId ? { courseId } : {}),
        };
        s.docs.unshift(doc);
        made.push(doc);
      }
    });
    this.audit(courseId ? 'teach' : 'kb', courseId ? 'course.docs' : 'docs.import', true, undefined, i18nT('{n} 份', { n: made.length }));
    this.onChange();
    return made;
  }

  /** 构建（抽文字 → 分段 → 向量）。串行，免得一次拖进来几十份同时抽 PDF 把主进程压满 */
  buildDocs(ids?: string[]): Promise<void> {
    const run = async (): Promise<void> => {
      const targets = this.store.read().docs.filter((d) => (ids?.length ? ids.includes(d.id) : d.status !== 'built'));
      let n = 0;
      for (const d of targets) {
        n++;
        this.onProgress(i18nT('正在构建 {a}/{b}：{p0}', { a: n, b: targets.length, p0: d.name }));
        await this.buildOne(d.id);
      }
      this.onProgress('');
    };
    this.building = this.building.then(run, run);
    return this.building;
  }

  private async buildOne(id: string): Promise<void> {
    const started = Date.now();
    const setDoc = (patch: Partial<CaDoc>) => this.store.update((s) => { const d = s.docs.find((x) => x.id === id); if (d) Object.assign(d, patch); });
    const doc = this.store.read().docs.find((x) => x.id === id);
    if (!doc) return;
    setDoc({ status: 'building', error: undefined });
    this.onChange();
    try {
      if (!existsSync(doc.path)) throw new Error(i18nT('文档副本不见了，请删除后重新导入'));
      const ex = await extractDocument(doc.path, doc.name);
      const text = String(ex.text || '').trim();
      if (!text) throw new Error(ex.warning || i18nT('没有读到文字'));
      const idx = buildIndex(text);
      if (!idx.chunks.length) throw new Error(i18nT('没有读到文字'));
      this.store.setIndex(id, idx);
      setDoc({ status: 'built', chars: text.length, chunks: idx.chunks.length, warning: ex.warning || undefined, builtAt: new Date().toISOString() });
      this.audit('kb', 'doc.build', true, started, i18nT('{n} 段', { n: idx.chunks.length }));
    } catch (e) {
      setDoc({ status: 'failed', error: (e as Error)?.message || String(e) });
      this.audit('kb', 'doc.build', false, started, (e as Error)?.message);
    }
    this.onChange();
  }

  updateDoc(id: string, patch: { dept?: string; category?: string }): CaDoc {
    const r = this.store.update((s) => {
      const d = s.docs.find((x) => x.id === id);
      if (!d) throw new Error(i18nT('文档不存在或已删除'));
      if (patch.dept !== undefined) d.dept = String(patch.dept).trim();
      if (patch.category !== undefined) d.category = String(patch.category).trim();
      return d;
    });
    this.onChange();
    return r;
  }

  removeDoc(id: string): void {
    const d = this.store.read().docs.find((x) => x.id === id);
    this.store.update((s) => { s.docs = s.docs.filter((x) => x.id !== id); });
    if (d?.path && d.path.startsWith(this.store.dir('docs'))) rmSync(d.path, { force: true });
    this.store.removeIndex(id);
    this.audit('kb', 'doc.remove', true);
    this.onChange();
  }

  // ── FAQ ────────────────────────────────────────────────────────────

  saveFaq(input: CaFaqInput, source: CaFaq['source'] = 'manual'): CaFaq {
    const question = String(input?.question || '').trim();
    const answer = String(input?.answer || '').trim();
    if (!question) throw new Error(i18nT('请填写问题'));
    if (!answer) throw new Error(i18nT('请填写答案'));
    const now = new Date().toISOString();
    const similar = [...new Set((input.similar || []).map((x) => String(x).trim()).filter((x) => x && x !== question))].slice(0, 20);
    const r = this.store.update((s) => {
      const cur = input.id ? s.faqs.find((f) => f.id === input.id) : undefined;
      if (input.id && !cur) throw new Error(i18nT('FAQ 不存在或已删除'));
      if (cur) {
        Object.assign(cur, { question, answer, similar, dept: String(input.dept ?? cur.dept).trim(), updatedAt: now });
        return cur;
      }
      const f: CaFaq = { id: newId('caf'), question, answer, similar, dept: String(input.dept || '').trim(), source, createdAt: now, updatedAt: now, hits: 0 };
      s.faqs.unshift(f);
      return f;
    });
    this.audit('kb', 'faq.save', true);
    this.onChange();
    return r;
  }

  removeFaq(id: string): void {
    this.store.update((s) => { s.faqs = s.faqs.filter((f) => f.id !== id); });
    this.onChange();
  }

  /** 从 Excel 批量导入：问题、相似问法（；或换行分隔）、答案、部门。问题相同的覆盖更新 */
  importFaqs(path: string): { added: number; updated: number; skipped: number } {
    const table = readTable(path);
    const qCol = table.headers.find((h) => /问题|问法|question/i.test(h) && !/相似/.test(h)) || '';
    const aCol = table.headers.find((h) => /答案|回答|答复|answer/i.test(h)) || '';
    const sCol = table.headers.find((h) => /相似|同义|similar/i.test(h)) || '';
    const dCol = table.headers.find((h) => /部门|dept/i.test(h)) || '';
    if (!qCol || !aCol) throw new Error(i18nT('没认出「问题」和「答案」两列，请检查表头'));
    let added = 0; let updated = 0; let skipped = 0;
    const now = new Date().toISOString();
    this.store.update((s) => {
      for (const row of table.rows) {
        const question = String(row[qCol] || '').trim();
        const answer = String(row[aCol] || '').trim();
        if (!question || !answer) { skipped++; continue; }
        const similar = sCol ? String(row[sCol] || '').split(/[；;\n|]/).map((x) => x.trim()).filter(Boolean) : [];
        const dept = dCol ? String(row[dCol] || '').trim() : '';
        const cur = s.faqs.find((f) => f.question === question);
        if (cur) { Object.assign(cur, { answer, similar, dept: dept || cur.dept, updatedAt: now }); updated++; continue; }
        s.faqs.unshift({ id: newId('caf'), question, answer, similar, dept, source: 'import', createdAt: now, updatedAt: now, hits: 0 });
        added++;
      }
    });
    this.audit('kb', 'faq.import', true, undefined, i18nT('新增 {a}，更新 {b}', { a: added, b: updated }));
    this.onChange();
    return { added, updated, skipped };
  }

  exportFaqs(dir: string): string {
    const file = join(dir, i18nT('常见问题FAQ-{p0}.xlsx', { p0: dayKey(new Date()) }));
    writeWorkbook(file, [{
      name: 'FAQ',
      headers: [i18nT('问题'), i18nT('相似问法'), i18nT('答案'), i18nT('部门'), i18nT('命中次数'), i18nT('更新时间')],
      rows: this.store.read().faqs.map((f) => [f.question, f.similar.join(i18nT('；')), f.answer, f.dept, f.hits, f.updatedAt.slice(0, 10)]),
    }]);
    return file;
  }

  // ── 检索 / 问答 ────────────────────────────────────────────────────

  /** 全校问答只查非课程资料；课程助教只查该课程的资料（不混 FAQ） */
  private searchSource(courseId?: string) {
    const s = this.store.read();
    return {
      docs: s.docs.filter((d) => d.status === 'built' && (courseId ? d.courseId === courseId : !d.courseId)).map((d) => ({ id: d.id, name: d.name, dept: d.dept, index: this.store.index(d.id) })),
      faqs: courseId ? [] : s.faqs,
    };
  }

  /** 课程资料片段（出题用）：有侧重就按侧重检索，否则在各份资料里均匀取 */
  courseChunks(courseId: string, focus: string, limit = 8): Array<{ title: string; text: string }> {
    const src = this.searchSource(courseId);
    if (!src.docs.length) throw new Error(i18nT('这门课还没有已构建的资料，请先导入课程资料'));
    if (focus.trim()) {
      const hits = search(src, focus, limit);
      if (hits.length) return hits.map((h) => ({ title: h.title, text: h.text }));
    }
    const all = src.docs.flatMap((d) => (d.index?.chunks || []).map((c) => ({ title: d.name, text: c.text })));
    if (all.length <= limit) return all;
    const step = all.length / limit;
    return Array.from({ length: limit }, (_, i) => all[Math.floor(i * step)]);
  }

  search(query: string, topK = 8): CaHit[] {
    const q = String(query || '').trim();
    if (!q) throw new Error(i18nT('请输入要检索的问题'));
    return search(this.searchSource(), q, topK);
  }

  async ask(question: string, channel: CaChannel, askerId?: string, courseId?: string): Promise<CaAnswer> {
    const q = String(question || '').trim().slice(0, 500);
    if (!q) throw new Error(i18nT('请输入问题'));
    const started = Date.now();
    const s = this.store.read();
    const course = courseId ? s.courses.find((c) => c.id === courseId) : undefined;
    if (courseId && !course) throw new Error(i18nT('课程不存在或已删除'));
    const out = await answerQuestion({
      question: q,
      source: this.searchSource(courseId),
      faqs: courseId ? [] : s.faqs,
      minScore: s.settings.minScore,
      schoolName: schoolLabel(s.settings),
      hotline: s.settings.hotline,
      sensitiveDept: s.settings.sensitiveDept,
      defaultDept: i18nT('待分派'),
      llm: this.llm,
    }).catch((e) => {
      this.audit(course ? 'teach' : channel === 'mobile' ? 'mobile' : 'qa', course ? 'tutor' : 'ask', false, started, (e as Error)?.message);
      throw e;
    });
    const qaId = newId('caq');
    let ticketId: string | undefined;
    // 课程助教答不了的问题转任课教师（记在转办里，部门写课程名）
    if (course && out.ticketDept && out.kind !== 'sensitive') {
      out.ticketDept = i18nT('课程：{p0}', { p0: course.name });
      out.text = noEvidenceReply(out.ticketDept);
    }
    if (out.ticketDept) {
      ticketId = newId('cat');
      const t: CaTicket = { id: ticketId, at: new Date().toISOString(), question: q, dept: out.ticketDept, status: 'open', sensitive: out.kind === 'sensitive', channel, qaId };
      this.store.update((st) => { st.tickets.unshift(t); });
    }
    if (out.faqId) this.store.update((st) => { const f = st.faqs.find((x) => x.id === out.faqId); if (f) f.hits++; });
    const ms = Date.now() - started;
    this.store.updateQa((list) => {
      list.unshift({ id: qaId, at: new Date().toISOString(), channel, question: q, kind: out.kind, domain: out.domain, ...(courseId ? { courseId } : {}), answer: out.text, sources: out.sources, ticketId, model: out.model, ms, askerId });
    });
    this.audit(course ? 'teach' : channel === 'mobile' ? 'mobile' : 'qa', course ? 'tutor' : 'ask', true, started, out.kind + (out.unsupported?.length ? ` unsupported=${out.unsupported.join(',')}` : ''));
    this.onChange();
    return { qaId, kind: out.kind, domain: out.domain, text: out.text, sources: out.sources, ticketId, dept: out.ticketDept, ms };
  }

  feedback(qaId: string, value: 'up' | 'down' | null, askerId?: string): void {
    this.store.updateQa((list) => {
      const r = list.find((x) => x.id === qaId && (!askerId || x.askerId === askerId));
      if (!r) throw new Error(i18nT('问答记录不存在'));
      if (value) r.feedback = value; else delete r.feedback;
    });
    this.onChange();
  }

  // ── 转办 ───────────────────────────────────────────────────────────

  answerTicket(id: string, answer: string, opts: { toFaq?: boolean; faqQuestion?: string } = {}): CaTicket {
    const text = String(answer || '').trim();
    if (!text) throw new Error(i18nT('请填写答复'));
    const cur = this.store.read().tickets.find((t) => t.id === id);
    if (!cur) throw new Error(i18nT('转办问题不存在'));
    let faqId: string | undefined;
    if (opts.toFaq && !cur.sensitive) {
      faqId = this.saveFaq({ question: String(opts.faqQuestion || cur.question).trim(), answer: text, dept: cur.dept }, 'ticket').id;
    }
    const r = this.store.update((s) => {
      const t = s.tickets.find((x) => x.id === id)!;
      Object.assign(t, { answer: text, status: 'answered', answeredAt: new Date().toISOString(), faqId: faqId || t.faqId });
      return t;
    });
    this.audit('ticket', 'answer', true, undefined, faqId ? 'faq' : '');
    this.onChange();
    return r;
  }

  updateTicket(id: string, patch: { dept?: string; status?: CaTicket['status']; note?: string }): CaTicket {
    const r = this.store.update((s) => {
      const t = s.tickets.find((x) => x.id === id);
      if (!t) throw new Error(i18nT('转办问题不存在'));
      if (patch.dept !== undefined) t.dept = String(patch.dept).trim() || t.dept;
      if (patch.status) t.status = patch.status;
      if (patch.note !== undefined) t.note = String(patch.note).slice(0, 300);
      return t;
    });
    this.onChange();
    return r;
  }

  /** 手机端「我的问题」：本人问过的，带转办答复 */
  mine(askerId: string): Array<{ qaId: string; at: string; question: string; kind: CaAnswerKind; answer: string; sources: CaQaRecord['sources']; ticketStatus?: string; ticketAnswer?: string; feedback?: string }> {
    const tickets = new Map(this.store.read().tickets.map((t) => [t.id, t]));
    return this.store.qa().filter((r) => r.askerId === askerId).slice(0, 50).map((r) => {
      const t = r.ticketId ? tickets.get(r.ticketId) : undefined;
      return { qaId: r.id, at: r.at, question: r.question, kind: r.kind, answer: r.answer, sources: r.sources, ticketStatus: t?.status, ticketAnswer: t?.answer, feedback: r.feedback };
    });
  }

  // ── 统计 ───────────────────────────────────────────────────────────

  stats(warnPending = 0, now = new Date()): CaStats {
    const scen = listScenarios(this.store.read().scenarios, this.store.auditList(5000), now.getTime());
    const s = this.store.read();
    const qa = this.store.qa();
    const byKind: Record<CaAnswerKind, number> = { faq: 0, answer: 0, quote: 0, no_evidence: 0, sensitive: 0 };
    for (const r of qa) byKind[r.kind] = (byKind[r.kind] || 0) + 1;
    const auto = AUTO_KINDS.reduce((n, k) => n + byKind[k], 0);
    const days: Array<{ day: string; qa: number; auto: number }> = [];
    for (let i = 13; i >= 0; i--) days.push({ day: dayKey(new Date(now.getTime() - i * 86_400_000)), qa: 0, auto: 0 });
    const dayIdx = new Map(days.map((d, i) => [d.day, i]));
    const weekAgo = now.getTime() - 7 * 86_400_000;
    let qa7d = 0;
    const counts = new Map<string, { question: string; count: number }>();
    for (const r of qa) {
      const t = Date.parse(r.at);
      if (t >= weekAgo) qa7d++;
      const i = dayIdx.get(dayKey(new Date(t)));
      if (i !== undefined) { days[i].qa++; if (AUTO_KINDS.includes(r.kind)) days[i].auto++; }
      if (r.kind === 'sensitive' || r.courseId) continue; // 敏感问题、课程助教不进「热门问题」
      const key = r.question.replace(/[\s？?。！!]/g, '');
      const c = counts.get(key) || { question: r.question, count: 0 };
      c.count++;
      counts.set(key, c);
    }
    return {
      docs: s.docs.length,
      docsBuilt: s.docs.filter((d) => d.status === 'built').length,
      chunks: s.docs.reduce((n, d) => n + (d.status === 'built' ? d.chunks : 0), 0),
      faqs: s.faqs.length,
      qaTotal: qa.length,
      qa7d,
      autoRate: qa.length ? Math.round((auto / qa.length) * 1000) / 1000 : null,
      byKind,
      openTickets: s.tickets.filter((t) => t.status === 'open').length,
      sensitiveOpen: s.tickets.filter((t) => t.status === 'open' && t.sensitive).length,
      warnPending,
      byDay: days,
      topQuestions: [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 8),
      // 早于领域助手的记录没有 domain，按问题现分类（不回写）
      byDomain: listDomains().map((d) => ({ id: d.id, name: d.name, count: qa.filter((r) => !r.courseId && (r.domain || classifyDomain(r.question)) === d.id).length })).filter((d) => d.count).sort((a, b) => b.count - a.count),
      directions: Object.fromEntries(CA_DIRECTIONS.map((d) => {
        const list = scen.filter((x) => x.direction === d);
        return [d, { scenarios: list.length, live: list.filter((x) => x.stage === 'live').length, usage30d: list.reduce((n, x) => n + x.usage30d, 0) }];
      })) as CaStats['directions'],
      courses: s.courses.length,
      questions: this.store.questions().length,
      outputs: this.store.outputs().length,
      officialDocs: s.officialDocs.length,
      recent: qa.slice(0, 12).map((r) => ({ at: r.at, question: r.kind === 'sensitive' ? i18nT('（敏感问题，已隐藏）') : r.question, kind: r.kind, domain: r.domain, channel: r.channel })),
    };
  }

  purgeExpired(): number {
    const days = this.store.read().settings.retentionDays;
    const n = this.store.purgeQa(days);
    this.store.purgeAudit(days);
    if (n) { this.audit('ops', 'qa.purge', true, undefined, String(n)); this.onChange(); }
    return n;
  }
}
