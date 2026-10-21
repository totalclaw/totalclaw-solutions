/**
 * bidWriter.ipc —— 标书制作智能体。
 *
 * 一条主线：**目标 + 目标投标网站的公告 + 标书模板 + 知识库里的公司资料 → 逐章成文 → 自检 → 正式件**。
 *
 * 几条定死的规矩（都是标书场景里出事就无法挽回的地方）：
 *  · 公告里的编号 / 预算 / 保证金 / 截止时间由**正则原样截取**，不交模型（见 noticeRules）。
 *  · 模型条目化出来的每条要求，必须能在公告原文里找到依据，找不到就丢（verifyAgainstText）。
 *  · 写正文时只允许用传进去的公司事实；缺的写【待补充：…】占位，自检把占位汇总成缺料清单，
 *    有占位就只能导草稿件（带 DRAFT）。
 *  · 模板没上传时才去知识库找；找到的是**候选**，由用户选定，不替用户拍板。
 */
import { ipcMain, dialog, shell } from 'electron';
import { basename, extname, join } from 'node:path';
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import { t as i18nT } from '@totalclaw/i18n';
import {
  IPC_CHANNELS,
  type BidWriterCheckRequest, type BidWriterCheckResponse,
  type BidWriterCompanyField, type BidWriterCompanyRequest, type BidWriterCompanyResponse,
  type BidWriterComposeRequest, type BidWriterComposeResponse,
  type BidWriterEvent, type BidWriterExportRequest, type BidWriterExportResponse,
  type BidWriterExtractNoticeRequest, type BidWriterFetchNoticeRequest, type BidWriterFetchNoticeResponse,
  type BidWriterGoalRequest, type BidWriterGoalResponse,
  type BidWriterSearchRequest, type BidWriterSearchResponse,
  type BidWriterKnowledgeSummary, type BidWriterNotice, type BidWriterProject, type BidWriterQualificationCheck,
  type BidWriterRootResponse,
  type BidWriterRequirement, type BidWriterSection, type BidWriterSource, type BidWriterState,
  type BidWriterStateResponse, type BidWriterTemplateAdoptRequest, type BidWriterTemplateCandidate,
  type BidWriterTemplateResponse, type BidWriterTemplateSuggestRequest, type BidWriterTemplateSuggestResponse,
} from '@totalclaw/ipc-contracts';
import type { IpcDeps } from './shared';
import { rateLimit } from './shared';
import { runOneshotChat } from '../services/councilChatRouter';
import { extractDocument } from '../services/documentExtractor';
import { knowledgeStore, graphQueryEmbedder } from '../services/knowledgeBase/service';
import { searchGraph, rankFacts } from '../services/knowledgeBase/retrieval';
import { fieldLabel } from '../services/knowledgeBase/fieldCatalog';
import { fetchNoticePage } from '../services/bidWriter/noticeFetch';
import { buildQueries, deriveKeywords, rankHits, searchViaBrowser, searchViaQiyeApi } from '../services/bidWriter/noticeSearch';
import { extractNoticeFacts, extractRequirementsByRules, missingFactWarnings, qualificationKind, verifyAgainstText } from '../services/bidWriter/noticeRules';
import { EVIDENCE_QUERIES, TEMPLATE_HINTS } from '../services/bidWriter/matchPatterns';
import { builtinOutline, parseOutline } from '../services/bidWriter/outline';
import { collectPlaceholders, countWords, hasBlocker, runComplianceCheck } from '../services/bidWriter/compliance';
import { goalPrompt, noticeExtractPrompt, qualificationPrompt, requirementKindLabel, sectionPrompt } from '../services/bidWriter/prompts';
import { buildBidDocx, buildBidHtml, writePdfFromHtml } from '../services/bidWriter/docx';
import { isChannelErrorReply, parseJsonLoose } from '../services/bidWriter/llmReply';
import { defaultDocRoot, docRoot, findProject, projectDir, readState, safeFileName, setDocRoot, writeState } from '../services/bidWriter/store';

const COMPOSE_TIMEOUT_MS = 240_000;
const EXTRACT_TIMEOUT_MS = 180_000;

/** 标书用得上的公司字段（知识库 canonical key 优先，后三条是标书特有、知识库没有对应字段的） */
const COMPANY_FIELD_KEYS = [
  'company_name', 'uscc', 'legal_rep', 'reg_capital', 'established',
  'address', 'phone', 'email', 'website', 'business_scope', 'main_business', 'intro',
] as const;

/** 标书特有字段：知识库没有 canonical key，靠文档检索 + 手填（检索词是匹配模式，不翻译） */
function extraFieldDefs(): Array<{ key: string; label: string; query: string }> {
  return [
    { key: 'bid_qualifications', label: i18nT('资质与认证'), query: EVIDENCE_QUERIES.qualifications },
    { key: 'bid_performance', label: i18nT('类似项目业绩'), query: EVIDENCE_QUERIES.performance },
    { key: 'bid_team', label: i18nT('项目人员配备'), query: EVIDENCE_QUERIES.team },
  ];
}

// ─── 工具 ────────────────────────────────────────────────────────────

function emit(deps: IpcDeps, event: BidWriterEvent): void {
  try { deps.getMainWindow()?.webContents.send(IPC_CHANNELS.WORKBENCH_BW_EVENT, event); } catch { /* 窗口已关 */ }
}

/** 模型返回的 JSON：容忍代码围栏与前后废话（解析在 llmReply.ts，这里只负责文案） */
function parseModelJson(raw: string): any {
  try {
    return parseJsonLoose(raw);
  } catch {
    throw new Error(i18nT('模型没有返回可解析的结构化结果，请重试或改用纯规则抽取'));
  }
}

/**
 * 大模型调用。两件事：把开发者措辞翻成用户能懂的引导；**把「通道把错误当正文返回」挡下来**。
 *
 * 后者是实测踩到的：本机大脑没配好时，runOneshotChat 正常 resolve，正文却是
 * 「⚠️ 大模型 API Key 无效或未配置。」——不挡的话这段话会被当成写好的一章存进标书，
 * 界面上还显示「已完成」。宁可这一章报错，也不能把错误提示印进投标文件。
 * （同 groundedQa.ipc 的 `/^\s*⚠/` 判据。）
 */
async function llm(deps: IpcDeps, prompt: string, timeoutMs: number): Promise<string> {
  let reply: string;
  try {
    reply = await runOneshotChat(deps, prompt, { plainCompletion: true, timeoutMs });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (/SessionProvider|engineRegistry|未就绪|API key|api_key|not.*ready|provider/i.test(msg)) {
      throw new Error(i18nT('AI 大脑尚未就绪，请到「设置 → 模型配置」完成配置后重试'));
    }
    throw e;
  }
  if (isChannelErrorReply(reply)) {
    const first = reply.replace(/\s+/g, ' ').trim().slice(0, 160);
    throw new Error(i18nT('大模型通道返回的是错误而不是正文：{m}', { m: first }));
  }
  return reply;
}

/** 与古兰经教学工作台同口径：有活跃引擎就算大脑可用（真不可用时 llm() 会给出可读引导） */
function llmReady(deps: IpcDeps): boolean {
  try { return !!deps.engineRegistry?.getActive?.(); } catch { return false; }
}

function requirementId(prefix: string, index: number): string {
  return `${prefix}_${index.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function sectionUid(): string {
  return `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** 知识库当前图谱里的公司事实（rankFacts 已按「用户确认 > 手填 > 置信度」排好） */
function knowledgeFacts(): Array<{ field: string; label: string; value: string; docName?: string; evidence?: string }> {
  try {
    const store = knowledgeStore();
    const graphId = store.currentGraphId();
    return rankFacts(store.facts(graphId)).map((f) => ({
      field: f.field,
      label: fieldLabel(f.field),
      value: f.value,
      docName: f.sources?.[0] ? store.doc(f.sources[0].docId)?.name : undefined,
      evidence: f.sources?.[0]?.evidence,
    }));
  } catch {
    return [];
  }
}

/** 知识库现状：docCount / builtCount / factCount / 公司名 —— UI 用它解释「为什么没带出来」 */
function knowledgeSummary(): BidWriterKnowledgeSummary {
  try {
    const store = knowledgeStore();
    const graphId = store.currentGraphId();
    const state = store.graphState(graphId);
    const built = Object.values(state.docs || {}).filter((d: any) => d?.builtAt).length;
    const facts = store.facts(graphId);
    const ranked = rankFacts(facts);
    const company = ranked.find((f) => f.field === 'company_name')?.value;
    // 没有全称时找个最接近的（简称 / 英文名 / 品牌），只用于把提示写准，不自动填
    const near = company ? undefined : ranked.find((f) => ['company_short_name', 'english_name', 'brand'].includes(f.field));
    return {
      docCount: store.docs().length,
      builtCount: built,
      factCount: facts.length,
      companyName: company,
      nearestName: near ? { label: fieldLabel(near.field), value: near.value } : undefined,
    };
  } catch {
    return { docCount: 0, builtCount: 0, factCount: 0 };
  }
}

async function knowledgeSearch(
  query: string, topK: number,
): Promise<Array<{ docId: string; docName: string; text: string; score: number; chunkIndex: number }>> {
  try {
    const store = knowledgeStore();
    const graphId = store.currentGraphId();
    const r = await searchGraph(store, graphId, query, topK, graphQueryEmbedder(graphId));
    return r.hits.map((h) => ({ docId: h.docId, docName: h.docName, text: h.text, score: h.score, chunkIndex: h.chunkIndex }));
  } catch {
    return [];
  }
}

/**
 * 把检索命中的片段拼回**接近原文的顺序**（同一文档按 chunkIndex 升序）。
 * 之前是按相关度排序 + 每条截 240 字，结果「类似项目业绩」从「项目四」开头、
 * 「资质与认证」缺了集成二级和 ISO 体系 —— 模型看不到就只能写占位（用户实测）。
 */
function joinExcerptsInOrder(
  hits: Array<{ docId: string; docName: string; text: string; chunkIndex: number }>,
  perChunk = 600,
  total = 2_500,
): string {
  const ordered = [...hits].sort((a, b) => (a.docId === b.docId ? a.chunkIndex - b.chunkIndex : a.docId.localeCompare(b.docId)));
  let out = '';
  for (const h of ordered) {
    const piece = h.text.replace(/\s+/g, ' ').trim().slice(0, perChunk);
    if (!piece) continue;
    if (out.length + piece.length > total) break;
    out += (out ? '\n' : '') + piece;
  }
  return out;
}

// ─── 招标公告 ────────────────────────────────────────────────────────

/** 模型条目化：只补规则抽不出来的条款，且逐条回原文核对 */
async function llmRequirements(
  deps: IpcDeps, text: string, sourceLabel: string, locator: string | undefined,
): Promise<{ requirements: BidWriterRequirement[]; warning?: string }> {
  try {
    const raw = await llm(deps, noticeExtractPrompt(text), EXTRACT_TIMEOUT_MS);
    const parsed = parseModelJson(raw);
    const list = Array.isArray(parsed?.requirements) ? parsed.requirements : [];
    const kept: BidWriterRequirement[] = [];
    let dropped = 0;
    list.slice(0, 80).forEach((item: any, index: number) => {
      const body = String(item?.text || '').trim();
      if (body.length < 6) return;
      // 编造拦截：原文里找不到依据的条目直接丢
      if (!verifyAgainstText(text, body)) { dropped += 1; return; }
      const kind = ['qualification', 'scoring', 'deliverable', 'technical', 'commercial', 'format']
        .includes(String(item?.kind)) ? String(item.kind) : 'technical';
      kept.push({
        id: requirementId('llm', index),
        kind: kind as BidWriterRequirement['kind'],
        text: body.slice(0, 400),
        points: Number.isFinite(Number(item?.points)) && Number(item.points) > 0 ? Number(item.points) : undefined,
        mandatory: Boolean(item?.mandatory),
        source: { kind: 'notice', label: sourceLabel, locator, quote: body.slice(0, 160) },
      });
    });
    return {
      requirements: kept,
      warning: dropped
        ? i18nT('模型给出的 {n} 条内容在公告原文里找不到依据，已丢弃（防编造）。', { n: String(dropped) })
        : undefined,
    };
  } catch (e: any) {
    return { requirements: [], warning: i18nT('模型条目化失败，已只用规则抽取：{m}', { m: String(e?.message || e).slice(0, 120) }) };
  }
}

/** 同一条要求规则和模型都抓到时去重（归一化后前 30 字相同即视为同一条） */
function dedupeRequirements(items: BidWriterRequirement[]): BidWriterRequirement[] {
  const seen = new Set<string>();
  const out: BidWriterRequirement[] = [];
  for (const item of items) {
    const key = `${item.kind}|${item.text.replace(/[\s　，,。；;：:、]/g, '').slice(0, 30)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function extractNotice(deps: IpcDeps, payload: BidWriterExtractNoticeRequest): Promise<BidWriterNotice> {
  const text = String(payload?.text || '');
  if (text.replace(/\s/g, '').length < 100) throw new Error(i18nT('公告正文太短（不足 100 字），先抓取或粘贴完整公告再抽取'));
  const label = String(payload?.title || payload?.url || i18nT('招标公告'));
  const locator = payload?.url ? String(payload.url) : undefined;
  emit(deps, { projectId: String(payload?.projectId || ''), stage: 'extract', done: 0, total: 2, message: i18nT('正在按规则抽取关键信息…') });

  const facts = extractNoticeFacts(text);
  const ruleRequirements = extractRequirementsByRules(text, label, locator);
  const warnings = [...missingFactWarnings(facts)];

  let requirements = ruleRequirements;
  if (!payload?.rulesOnly) {
    emit(deps, { projectId: String(payload?.projectId || ''), stage: 'extract', done: 1, total: 2, message: i18nT('正在让模型把条款逐条列出来…') });
    const llmResult = await llmRequirements(deps, text, label, locator);
    if (llmResult.warning) warnings.push(llmResult.warning);
    requirements = dedupeRequirements([...ruleRequirements, ...llmResult.requirements]);
  } else {
    warnings.push(i18nT('本次只用了规则抽取，没有调用模型。'));
  }
  if (!requirements.length) warnings.push(i18nT('没抽出任何要求条款，请确认这是招标公告详情页；也可以直接在下面手工添加。'));

  emit(deps, { projectId: String(payload?.projectId || ''), stage: 'extract', done: 2, total: 2, message: i18nT('抽取完成') });
  return {
    url: payload?.url,
    title: payload?.title,
    ...facts,
    fetchedAt: Date.now(),
    text: text.slice(0, 120_000),
    requirements,
    warnings,
  };
}

/**
 * 按投标目标检索招标公告。先 qiye-api 搜索服务，它没起来就用隐藏窗口打搜索页兜底。
 * 两条都空就如实说没搜到 —— 绝不编一个看着像样的网址糊弄。
 */
async function searchNotices(deps: IpcDeps, payload: BidWriterSearchRequest): Promise<BidWriterSearchResponse> {
  const state = readState();
  const project = findProject(state, String(payload?.projectId || ''));
  const keywords = String(payload?.keywords || '').trim()
    || deriveKeywords(project.name, project.goal, project.strategies || []);
  if (!keywords) {
    return { ok: false, keywords: '', hits: [], error: i18nT('先填项目名称或投标目标，或者自己输入检索关键词') };
  }
  const queries = buildQueries(keywords);
  const warnings: string[] = [];

  emit(deps, { projectId: project.id, stage: 'fetch', done: 0, total: 2, message: i18nT('正在检索招标公告…') });
  let raw = await searchViaQiyeApi((deps as any).qiyeApiProc, queries);
  let via: BidWriterSearchResponse['via'] = 'qiye-api';
  if (!raw.length) {
    // 搜索服务没起来 / 没结果：用浏览器兜底（与抓公告共用同一份登录态分区）
    emit(deps, { projectId: project.id, stage: 'fetch', done: 1, total: 2, message: i18nT('搜索服务不可用，改用内置浏览器检索…') });
    raw = await searchViaBrowser(queries);
    via = 'browser';
    if (raw.length) warnings.push(i18nT('这次是用内置浏览器搜的（AI 工具箱的搜索服务没启动），结果可能少一些。'));
  }
  const hits = rankHits(raw, keywords);
  emit(deps, { projectId: project.id, stage: 'fetch', done: 2, total: 2, message: i18nT('检索完成') });
  if (!hits.length) {
    return {
      ok: false, keywords, hits: [], via, warnings,
      error: i18nT('没搜到像公告详情页的结果。换个更具体的关键词（比如加上地区或采购人名称），或者直接把公告网址粘进下面。'),
    };
  }
  deps.logger.audit?.('bid-writer', i18nT('检索招标公告'), { keywords, hits: hits.length, via });
  return { ok: true, keywords, hits, via, warnings };
}

// ─── 模板 ────────────────────────────────────────────────────────────

function templateReason(name: string, text: string): { score: number; reason: string } | null {
  const lowerName = name.toLowerCase();
  const hitName = TEMPLATE_HINTS.find((h) => lowerName.includes(h.toLowerCase()));
  if (hitName) return { score: 1, reason: i18nT('文件名含「{w}」', { w: hitName }) };
  const hitText = TEMPLATE_HINTS.find((h) => text.includes(h));
  if (hitText) return { score: 0.6, reason: i18nT('正文出现「{w}」', { w: hitText }) };
  return null;
}

async function suggestTemplates(payload: BidWriterTemplateSuggestRequest): Promise<BidWriterTemplateSuggestResponse> {
  const store = (() => { try { return knowledgeStore(); } catch { return null; } })();
  if (!store) return { candidates: [], note: i18nT('知识库还没初始化。') };
  const docs = store.docs();
  if (!docs.length) return { candidates: [], note: i18nT('知识库里还没有文档。先到「知识库」导入你们常用的标书模板，下次就能直接选。') };

  const query = String(payload?.query || '').trim() || TEMPLATE_HINTS.slice(0, 6).join(' ');
  const hits = await knowledgeSearch(query, 30);
  const hitText = new Map<string, string>();
  for (const h of hits) hitText.set(h.docId, `${hitText.get(h.docId) || ''}\n${h.text}`.slice(0, 4_000));

  const candidates: BidWriterTemplateCandidate[] = [];
  const graphId = store.currentGraphId();
  const state = store.graphState(graphId);
  for (const doc of docs) {
    const hit = templateReason(doc.name, hitText.get(doc.id) || '');
    if (!hit) continue;
    const built = state.docs[doc.id]?.builtAt;
    candidates.push({
      docId: doc.id,
      name: doc.name,
      reason: hit.reason,
      score: hit.score + (hitText.has(doc.id) ? 0.2 : 0),
      builtAt: built,
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  return {
    candidates: candidates.slice(0, 12),
    note: candidates.length
      ? undefined
      : i18nT('知识库里没找到像标书模板的文档。你可以直接上传模板，或用内置标准大纲开始。'),
  };
}

/** 文档 → 大纲；抽不出文字如实报错，不静默回落 */
async function outlineFromFile(path: string, name: string): Promise<{ sections: BidWriterSection[]; note: string; text: string }> {
  const doc = await extractDocument(path, name);
  const text = String(doc.text || '').trim();
  if (!text) throw new Error(i18nT('这个文件没抽出文字（可能是扫描件）。请换可选中文字的版本，或直接用内置标准大纲。'));
  const parsed = parseOutline(text);
  return { sections: parsed.sections, note: parsed.note, text };
}

// ─── 公司资料 / 资格自检 ──────────────────────────────────────────────

async function buildCompanyProfile(
  deps: IpcDeps, payload: BidWriterCompanyRequest,
): Promise<BidWriterCompanyResponse> {
  const projectId = String(payload?.projectId || '');
  emit(deps, { projectId, stage: 'company', done: 0, total: 3, message: i18nT('正在读知识库里的公司资料…') });
  const facts = knowledgeFacts();
  const manual = new Map((payload?.manual || []).map((f) => [f.key, f]));
  const warnings: string[] = [];

  const fields: BidWriterCompanyField[] = [];
  for (const key of COMPANY_FIELD_KEYS) {
    const keep = manual.get(key);
    // 手填的优先：用户比知识库更知道这次要报哪个主体
    if (keep && String(keep.value || '').trim()) { fields.push({ ...keep, from: 'manual' }); continue; }
    const fact = facts.find((f) => f.field === key);
    fields.push(fact
      ? {
        key,
        label: fieldLabel(key),
        value: fact.value,
        from: 'knowledge',
        source: { kind: 'knowledge', label: fact.docName || i18nT('知识库'), quote: fact.evidence?.slice(0, 160) },
      }
      : { key, label: fieldLabel(key), value: '', from: 'missing' });
  }

  emit(deps, { projectId, stage: 'company', done: 1, total: 3, message: i18nT('正在检索资质、业绩等证明材料…') });
  const evidenceDocs: BidWriterCompanyResponse['evidenceDocs'] = [];
  for (const def of extraFieldDefs()) {
    const keep = manual.get(def.key);
    if (keep && String(keep.value || '').trim()) { fields.push({ ...keep, from: 'manual' }); continue; }
    const hits = await knowledgeSearch(def.query, 8);
    if (!hits.length) { fields.push({ key: def.key, label: def.label, value: '', from: 'missing' }); continue; }
    const value = joinExcerptsInOrder(hits);
    fields.push({
      key: def.key,
      label: def.label,
      value,
      from: 'knowledge',
      source: { kind: 'knowledge', label: hits[0].docName, quote: hits[0].text.slice(0, 160) },
    });
    for (const h of hits.slice(0, 2)) {
      if (evidenceDocs.some((d) => d.docId === h.docId)) continue;
      evidenceDocs.push({ docId: h.docId, name: h.docName, reason: def.label });
    }
  }
  if (!facts.length) warnings.push(i18nT('知识库里还没有公司事实。先到「知识库」把营业执照、资质证书、公司简介导进去并形成知识图谱，这一步就能自动填。'));

  // 资格自检
  const qualifications: BidWriterQualificationCheck[] = [];
  const qualificationReqs = (payload?.requirements || []).filter((r) => r.kind === 'qualification').slice(0, 30);
  if (qualificationReqs.length) {
    emit(deps, { projectId, stage: 'company', done: 2, total: 3, message: i18nT('正在逐条核对资格要求…') });
    const known = fields.filter((f) => String(f.value || '').trim());
    if (known.length && llmReady(deps)) {
      try {
        const raw = await llm(deps, qualificationPrompt(qualificationReqs, known), EXTRACT_TIMEOUT_MS);
        const parsed = parseModelJson(raw);
        const checks = Array.isArray(parsed?.checks) ? parsed.checks : [];
        for (const req of qualificationReqs) {
          const hit = checks.find((c: any) => String(c?.requirementId) === req.id);
          const verdict = ['met', 'unmet', 'unknown'].includes(String(hit?.verdict)) ? String(hit.verdict) : 'unknown';
          qualifications.push({
            requirementId: req.id,
            text: req.text,
            verdict: verdict as BidWriterQualificationCheck['verdict'],
            evidence: hit?.evidence ? String(hit.evidence).slice(0, 200) : undefined,
            note: hit?.note ? String(hit.note).slice(0, 200) : undefined,
          });
        }
      } catch (e: any) {
        warnings.push(i18nT('资格自检没跑成功，已全部标为待确认：{m}', { m: String(e?.message || e).slice(0, 120) }));
      }
    }
    // 模型没跑或跑失败：一律待确认，绝不默认"满足"
    if (!qualifications.length) {
      for (const req of qualificationReqs) {
        qualifications.push({
          requirementId: req.id, text: req.text, verdict: 'unknown',
          note: i18nT('请人工确认'),
        });
      }
    }

    /*
     * 声明类条款自动判满足（用户实测：一屏全是「待确认」，其实那几条本来就只能靠承诺）。
     * 政府采购法第二十二条那六条 + 无违法记录 / 非关联投标 / 不接受联合体这类，
     * 没有任何外部材料可"证明"，投标人在《资格声明及承诺函》里书面承诺即满足。
     * 证明类（资质等级、业绩、报表、社保凭证）照旧交给模型与人工，绝不自动判满足；
     * 模型若已明确判 unmet 则尊重模型，不覆盖成 met。
     */
    for (const q of qualifications) {
      if (q.verdict !== 'unknown') continue;
      if (qualificationKind(q.text) !== 'declaration') continue;
      q.verdict = 'met';
      q.evidence = i18nT('声明类条款：由投标人在《资格声明及承诺函》中书面承诺满足');
      q.note = i18nT('无需外部材料，随标书一并出具承诺函即可；如实际不满足请改回。');
    }
  }
  emit(deps, { projectId, stage: 'company', done: 3, total: 3, message: i18nT('公司资料就绪') });
  return { fields, qualifications, evidenceDocs, warnings };
}

// ─── 逐章成文 ────────────────────────────────────────────────────────

/** 这一章该看哪些招标要求：显式绑定优先，否则按标题关键词匹配 */
export function relevantRequirements(section: BidWriterSection, all: BidWriterRequirement[]): BidWriterRequirement[] {
  if (section.requirementIds?.length) {
    const picked = all.filter((r) => section.requirementIds!.includes(r.id));
    if (picked.length) return picked.slice(0, 40);
  }
  const words = (`${section.title} ${section.guide || ''}`.match(/[一-龥A-Za-z]{2,8}/g) || []).slice(0, 12);
  const scored = all.map((r) => ({
    r,
    score: words.filter((w) => r.text.includes(w)).length + (r.mandatory ? 0.5 : 0),
  }));
  const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.r);
  if (matched.length) return matched.slice(0, 25);
  // 一条都没匹配上时给资格 + 必交材料 + 评分办法（这些对每一章都有约束力）
  return all.filter((r) => r.kind === 'scoring' || r.kind === 'deliverable').slice(0, 15);
}

async function composeSection(deps: IpcDeps, payload: BidWriterComposeRequest): Promise<BidWriterComposeResponse> {
  const state = readState();
  const project = findProject(state, String(payload?.projectId || ''));
  const section = (project.sections || []).find((s) => s.id === String(payload?.sectionId || ''));
  if (!section) throw new Error(i18nT('找不到这一章，可能已被删除'));

  emit(deps, { projectId: project.id, stage: 'compose', done: 0, total: 1, message: i18nT('正在撰写「{t}」…', { t: section.title }) });
  const requirements = relevantRequirements(section, project.notice?.requirements || []);
  // 知识库摘录：按章节标题 + 项目名检索，给模型可引用的原文
  // 检索面放宽一点：资质 / 业绩 / 团队这些散在不同文档里，只取 5 段常常够不着，
  // 模型拿不到就只能写占位（用户实测一份草稿 106 项待填，有一半知识库里其实有）
  const excerpts = (await knowledgeSearch(`${section.title} ${project.name} ${project.bidder}`, 8))
    .map((h) => ({ label: h.docName, text: h.text }));
  // 模板里这一章的原文片段（用标题在模板全文里定位）
  let templateExcerpt: string | undefined;
  const templatePath = project.template?.path;
  if (templatePath && existsSync(templatePath)) {
    try {
      const doc = await extractDocument(templatePath, basename(templatePath));
      const full = String(doc.text || '');
      const at = full.indexOf(section.title);
      if (at >= 0) templateExcerpt = full.slice(at, at + 2_000);
    } catch { /* 模板读不了就不给片段，不影响成文 */ }
  }

  /*
   * 部分级标题的三重判定（老项目解析时还没有 partHeading 标记，得兜底）：
   *   ① 解析时打的标（「第一部分 …」「Part 1 …」）；
   *   ② 一级标题且后面紧跟更深层级；
   *   ③ 标题本身就是「商务/技术投标文件」这种容器名。
   */
  const index = project.sections.findIndex((s) => s.id === section.id);
  const next = project.sections[index + 1];
  const partHeading = section.partHeading === true
    || (section.level === 1 && Boolean(next) && next.level > section.level)
    || /^(商务|技术|资格|服务|报价)?投标文件$|^第.{1,3}(部分|篇|章)/.test(section.title.trim());

  const prompt = sectionPrompt({
    project,
    section,
    requirements,
    company: project.company || [],
    knowledgeExcerpts: excerpts,
    templateExcerpt,
    instruction: payload?.instruction,
    partHeading,
  });
  const content = (await llm(deps, prompt, COMPOSE_TIMEOUT_MS)).trim();
  if (!content) throw new Error(i18nT('模型没有返回正文，请重试'));

  const sources: BidWriterSource[] = [
    ...(project.notice?.url ? [{ kind: 'notice' as const, label: project.notice.title || project.notice.url, locator: project.notice.url }] : []),
    ...excerpts.map((e) => ({ kind: 'knowledge' as const, label: e.label })),
    ...(project.template?.name ? [{ kind: 'template' as const, label: project.template.name }] : []),
  ];
  emit(deps, { projectId: project.id, stage: 'compose', done: 1, total: 1, message: i18nT('「{t}」写好了', { t: section.title }) });
  return {
    ok: true,
    sectionId: section.id,
    content,
    placeholders: collectPlaceholders(content),
    wordCount: countWords(content),
    sources,
  };
}

// ─── 投标目标 ────────────────────────────────────────────────────────

/**
 * 大脑不可用时的本地兜底：把选中的侧重拼成一句能用的目标。
 * 比弹一句「AI 未就绪」强 —— 用户点标签就是想要一段文字，拼出来的这句他可以直接改。
 * UI 会标明这是本地拼的，不冒充模型产出。
 */
function localGoalDraft(strategies: string[], projectName: string): string {
  const picked = strategies.filter(Boolean);
  if (!picked.length) return '';
  const head = picked.slice(0, 3).join(i18nT('、'));
  const rest = picked.slice(3);
  const tail = rest.length ? i18nT('，同时确保{rest}。', { rest: rest.join(i18nT('、')) }) : i18nT('。');
  return i18nT('本项目以{head}作为主要取胜点参与{name}投标{tail}', {
    head, name: projectName || i18nT('本项目'), tail,
  });
}

async function draftGoal(deps: IpcDeps, payload: BidWriterGoalRequest): Promise<BidWriterGoalResponse> {
  const state = readState();
  const project = findProject(state, String(payload?.projectId || ''));
  const strategies = (payload?.strategies || []).map((t) => String(t || '').trim()).filter(Boolean).slice(0, 10);
  if (!strategies.length) return { ok: false, error: i18nT('先选一个侧重标签') };

  if (!llmReady(deps)) {
    const text = localGoalDraft(strategies, project.name);
    return { ok: Boolean(text), text, fallback: true };
  }
  const scoring = (project.notice?.requirements || [])
    .filter((r) => r.kind === 'scoring')
    .map((r) => (r.points ? `${r.text}（${r.points}${i18nT('分')}）` : r.text));
  try {
    const text = (await llm(deps, goalPrompt({
      projectName: project.name,
      bidder: project.bidder,
      strategies,
      buyer: project.notice?.buyer,
      budget: project.notice?.budget,
      scoring,
      lang: project.lang,
    }), 90_000)).trim().replace(/^["'\u201c\u2018]|["'\u201d\u2019]$/g, '');
    if (!text) throw new Error(i18nT('模型没有返回内容'));
    return { ok: true, text };
  } catch (e: any) {
    // 模型挂了也别让用户白点：回本地兜底，并如实标 fallback
    const text = localGoalDraft(strategies, project.name);
    return { ok: Boolean(text), text, fallback: true, error: String(e?.message || e) };
  }
}

// ─── 导出 ────────────────────────────────────────────────────────────

function buildChecklistWorkbook(project: BidWriterProject): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const levelLabel = (level: string) => (
    level === 'blocker' ? i18nT('阻断') : level === 'warning' ? i18nT('提醒') : i18nT('通过')
  );
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    [i18nT('级别'), i18nT('检查项'), i18nT('说明')],
    ...(project.compliance || []).map((c) => [levelLabel(c.level), c.title, c.detail]),
  ]), i18nT('投标前自检'));

  const gaps = (project.sections || []).flatMap((s) => (s.placeholders || []).map((p) => [s.title, p]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    [i18nT('章节'), i18nT('待补充内容')],
    ...(gaps.length ? gaps : [[i18nT('（无）'), i18nT('正文里没有待补充占位')]]),
  ]), i18nT('缺料清单'));

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    [i18nT('类型'), i18nT('要求'), i18nT('分值'), i18nT('硬性'), i18nT('来源')],
    ...(project.notice?.requirements || []).map((r) => [
      requirementKindLabel(r.kind), r.text, r.points ?? '', r.mandatory ? i18nT('是') : '',
      r.source?.locator || r.source?.label || '',
    ]),
  ]), i18nT('招标要求对照'));
  return wb;
}

async function exportPackage(deps: IpcDeps, payload: BidWriterExportRequest): Promise<BidWriterExportResponse> {
  const state = readState();
  const project = findProject(state, String(payload?.projectId || ''));
  const draft = payload?.draft !== false;
  const formats = payload?.formats?.length ? payload.formats : ['docx', 'pdf', 'checklist'];

  if (!draft) {
    // 正式件的硬闸：自检必须现跑一遍（不看界面上那份可能已经过期的结果）
    const items = runComplianceCheck(project);
    if (hasBlocker(items)) {
      const blockers = items.filter((i) => i.level === 'blocker').map((i) => i.title).join(i18nT('；'));
      return { ok: false, error: i18nT('还不能导出正式件：{list}。先处理完再导，或先导草稿件。', { list: blockers }) };
    }
  }
  if (!(project.sections || []).some((s) => String(s.content || '').trim())) {
    return { ok: false, error: i18nT('一章正文都还没有，没什么可导的') };
  }

  const dir = projectDir(project.id, project.name);
  const base = safeFileName(project.name || i18nT('投标文件'));
  const suffix = draft ? `_${i18nT('草稿')}` : '';
  const paths: string[] = [];
  const total = formats.length;
  let done = 0;

  if (formats.includes('docx')) {
    emit(deps, { projectId: project.id, stage: 'export', done, total, message: i18nT('正在生成 Word…') });
    const p = join(dir, `${base}${suffix}.docx`);
    writeFileSync(p, buildBidDocx(project, draft));
    paths.push(p);
    done += 1;
  }
  if (formats.includes('pdf')) {
    emit(deps, { projectId: project.id, stage: 'export', done, total, message: i18nT('正在生成 PDF…') });
    const p = join(dir, `${base}${suffix}.pdf`);
    await writePdfFromHtml(p, buildBidHtml(project, draft));
    paths.push(p);
    done += 1;
  }
  if (formats.includes('checklist') || formats.includes('gaps')) {
    emit(deps, { projectId: project.id, stage: 'export', done, total, message: i18nT('正在生成自检表…') });
    const p = join(dir, `${base}_${i18nT('自检表')}.xlsx`);
    XLSX.writeFile(buildChecklistWorkbook(project), p);
    paths.push(p);
    done += 1;
  }
  emit(deps, { projectId: project.id, stage: 'export', done: total, total, message: i18nT('导出完成') });
  try { if (paths[0]) shell.showItemInFolder(paths[0]); } catch { /* 忽略 */ }
  deps.logger.audit?.('bid-writer', i18nT('导出标书'), { projectId: project.id, draft, count: paths.length });
  return { ok: true, paths };
}

// ─── 注册 ────────────────────────────────────────────────────────────

export function registerBidWriterHandlers(deps: IpcDeps): void {
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_STATE_GET, (): BidWriterStateResponse => {
    const knowledge = knowledgeSummary();
    return {
      state: readState(),
      defaultBidder: knowledge.companyName,
      llmReady: llmReady(deps),
      docRoot: docRoot(),
      defaultDocRoot: defaultDocRoot(),
      knowledge,
    };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_NOTICE_SEARCH, async (_e, payload: BidWriterSearchRequest): Promise<BidWriterSearchResponse> => {
    rateLimit('BID_WRITER_SEARCH', 20);
    try {
      return await searchNotices(deps, payload);
    } catch (e: any) {
      return { ok: false, keywords: String(payload?.keywords || ''), hits: [], error: String(e?.message || e) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_GOAL_DRAFT, async (_e, payload: BidWriterGoalRequest): Promise<BidWriterGoalResponse> => {
    rateLimit('BID_WRITER_GOAL', 60);
    try {
      return await draftGoal(deps, payload);
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_PICK_ROOT, async (): Promise<BidWriterRootResponse> => {
    rateLimit('BID_WRITER_PICK_ROOT', 30);
    const win = deps.getMainWindow();
    const opts: Electron.OpenDialogOptions = {
      title: i18nT('选择标书存放位置'),
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: docRoot(),
    };
    const picked = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts);
    if (picked.canceled || !picked.filePaths.length) return { ok: false, docRoot: docRoot(), defaultDocRoot: defaultDocRoot() };
    try {
      const next = setDocRoot(picked.filePaths[0]);
      deps.logger.audit?.('bid-writer', i18nT('更改标书存放位置'), { path: next });
      return { ok: true, docRoot: next, defaultDocRoot: defaultDocRoot() };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e), docRoot: docRoot(), defaultDocRoot: defaultDocRoot() };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_SET_ROOT, (_e, payload: { path?: string }): BidWriterRootResponse => {
    try {
      const next = setDocRoot(String(payload?.path || ''));
      deps.logger.audit?.('bid-writer', i18nT('更改标书存放位置'), { path: next });
      return { ok: true, docRoot: next, defaultDocRoot: defaultDocRoot() };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e), docRoot: docRoot(), defaultDocRoot: defaultDocRoot() };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_STATE_SAVE, (_e, payload: { state: BidWriterState }) => {
    writeState(payload?.state);
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_NOTICE_FETCH, async (_e, payload: BidWriterFetchNoticeRequest): Promise<BidWriterFetchNoticeResponse> => {
    rateLimit('BID_WRITER_FETCH', 30);
    const projectId = String(payload?.projectId || '');
    try {
      emit(deps, { projectId, stage: 'fetch', done: 0, total: 1, message: i18nT('正在打开公告页…') });
      const r = await fetchNoticePage(String(payload?.url || ''));
      emit(deps, { projectId, stage: 'fetch', done: 1, total: 1, message: i18nT('抓取完成') });
      deps.logger.audit?.('bid-writer', i18nT('抓取招标公告'), { url: r.url, chars: r.text.length });
      return {
        ok: !r.loginRequired,
        url: r.url,
        title: r.title,
        text: r.text,
        attachments: r.attachments,
        loginRequired: r.loginRequired,
        warnings: r.warnings,
        error: r.loginRequired
          ? i18nT('这个页面要登录才能看。请先在内置浏览器里登录该网站，再回来重新抓取（登录状态会被复用）。')
          : undefined,
      };
    } catch (e: any) {
      emit(deps, { projectId, stage: 'fetch', done: 1, total: 1, message: i18nT('抓取失败') });
      return { ok: false, error: String(e?.message || e) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_NOTICE_IMPORT, async (): Promise<BidWriterFetchNoticeResponse> => {
    rateLimit('BID_WRITER_IMPORT', 30);
    const win = deps.getMainWindow();
    const opts: Electron.OpenDialogOptions = {
      title: i18nT('选择招标文件'),
      properties: ['openFile'],
      filters: [{ name: i18nT('招标文件'), extensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'txt', 'md', 'html'] }],
    };
    const picked = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts);
    if (picked.canceled || !picked.filePaths.length) return { ok: false };
    const path = picked.filePaths[0];
    try {
      const doc = await extractDocument(path, basename(path));
      const text = String(doc.text || '').trim();
      if (!text) return { ok: false, error: i18nT('这个文件没抽出文字（可能是扫描件），请换可选中文字的版本。') };
      return { ok: true, title: basename(path), text, warnings: doc.warning ? [doc.warning] : undefined };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_NOTICE_EXTRACT, async (_e, payload: BidWriterExtractNoticeRequest) => {
    rateLimit('BID_WRITER_EXTRACT', 20);
    return extractNotice(deps, payload);
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_TEMPLATE_IMPORT, async (_e, payload: { projectId?: string }): Promise<BidWriterTemplateResponse> => {
    rateLimit('BID_WRITER_TEMPLATE', 30);
    const win = deps.getMainWindow();
    const opts: Electron.OpenDialogOptions = {
      title: i18nT('选择标书模板'),
      properties: ['openFile'],
      filters: [{ name: i18nT('标书模板'), extensions: ['docx', 'doc', 'pdf', 'xlsx', 'txt', 'md'] }],
    };
    const picked = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts);
    if (picked.canceled || !picked.filePaths.length) return { ok: false };
    const source = picked.filePaths[0];
    try {
      // 模板拷进项目目录：原文件被移动 / 删除后，重写某一章时仍能拿到模板片段
      const projectId = String(payload?.projectId || 'shared');
      const projectName = readState().projects.find((p) => p.id === projectId)?.name;
      const target = join(projectDir(projectId, projectName), `template${extname(source).toLowerCase() || '.docx'}`);
      try { copyFileSync(source, target); } catch { /* 拷贝失败就用原路径 */ }
      const usable = existsSync(target) ? target : source;
      const parsed = await outlineFromFile(usable, basename(source));
      deps.logger.audit?.('bid-writer', i18nT('导入标书模板'), { name: basename(source), sections: parsed.sections.length });
      return {
        ok: true,
        template: { kind: 'upload', name: basename(source), path: usable, parsedAt: Date.now(), note: parsed.note },
        sections: parsed.sections,
        warnings: [parsed.note],
      };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_TEMPLATE_SUGGEST, async (_e, payload: BidWriterTemplateSuggestRequest) => {
    rateLimit('BID_WRITER_SUGGEST', 30);
    return suggestTemplates(payload);
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_TEMPLATE_ADOPT, async (_e, payload: BidWriterTemplateAdoptRequest): Promise<BidWriterTemplateResponse> => {
    if (payload?.kind === 'builtin') {
      return {
        ok: true,
        template: { kind: 'builtin', name: i18nT('内置标准大纲'), parsedAt: Date.now() },
        sections: builtinOutline(),
        warnings: [i18nT('用的是内置标准大纲。如果招标文件规定了投标文件格式，请上传后重新解析。')],
      };
    }
    try {
      const store = knowledgeStore();
      const doc = store.doc(String(payload?.docId || ''));
      if (!doc) throw new Error(i18nT('知识库里找不到这份文档'));
      const parsed = await outlineFromFile(store.absPath(doc.file), doc.name);
      return {
        ok: true,
        template: { kind: 'knowledge', name: doc.name, docId: doc.id, path: store.absPath(doc.file), parsedAt: Date.now(), note: parsed.note },
        sections: parsed.sections,
        warnings: [parsed.note],
      };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_COMPANY_PROFILE, async (_e, payload: BidWriterCompanyRequest): Promise<BidWriterCompanyResponse> => {
    rateLimit('BID_WRITER_COMPANY', 20);
    return buildCompanyProfile(deps, payload);
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_SECTION_COMPOSE, async (_e, payload: BidWriterComposeRequest): Promise<BidWriterComposeResponse> => {
    rateLimit('BID_WRITER_COMPOSE', 120);
    try {
      return await composeSection(deps, payload);
    } catch (e: any) {
      return { ok: false, sectionId: String(payload?.sectionId || ''), error: String(e?.message || e) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_COMPLIANCE_CHECK, async (_e, payload: BidWriterCheckRequest): Promise<BidWriterCheckResponse> => {
    const state = readState();
    const project = findProject(state, String(payload?.projectId || ''));
    const items = runComplianceCheck(project);
    return { items, blocked: hasBlocker(items) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BW_EXPORT, async (_e, payload: BidWriterExportRequest): Promise<BidWriterExportResponse> => {
    rateLimit('BID_WRITER_EXPORT', 20);
    try {
      return await exportPackage(deps, payload);
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
}
