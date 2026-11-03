/**
 * 金融知识库：多个知识来源统一检索，给制度问答（含手机端）/ 营销审查做补充依据。
 *
 * 来源（每个独立开关 + 数据级别 public / internal / sensitive）：
 *   docs    本方案文档库（本地）：导入的产品手册 / 监管文件 / 培训材料，段落切块 + BM25
 *   app     本机知识库（本地）：App「知识库」的某个图谱，向量 + 关键词混合检索（宿主 searchGraph）
 *   db      远程数据库（只读）：App 已配数据源 + 检索 SQL 模板（{{q}} 占位，程序转义），走宿主只读 /v1/db/query
 *   http    远程检索接口：POST {query, topK} → 按字段映射取 items / 标题 / 正文 / 链接；令牌加密保存
 *
 * 本文件只放纯逻辑（可单测）；宿主调用（searchGraph / runDataFetchTool / fetch / safeStorage）由 index.cjs 注入。
 */
const { createHash } = require('node:crypto');

const LEVELS = ['public', 'internal', 'sensitive'];
const LEVEL_RANK = { public: 0, internal: 1, sensitive: 2 };
const SOURCE_KINDS = ['docs', 'app', 'db', 'http'];
const CHUNK_CHARS = 480;
const MAX_HIT_CHARS = 900;
const HTTP_TIMEOUT_MS = 8000;
const HTTP_MAX_BYTES = 2 * 1024 * 1024;

/** 段落切块：按空行 / 换行切，太短的并到下一段，太长的按句号再切 */
function chunkText(text, max = CHUNK_CHARS) {
  const paras = String(text || '').replace(/\r/g, '').split(/\n{1,}/).map((s) => s.trim()).filter(Boolean);
  const out = [];
  let buf = '';
  const push = () => { if (buf.trim()) out.push(buf.trim()); buf = ''; };
  for (const p of paras) {
    if (p.length > max) {
      push();
      let cur = '';
      for (const sent of p.split(/(?<=[。！？；.!?;])/)) {
        if ((cur + sent).length > max && cur) { out.push(cur.trim()); cur = ''; }
        cur += sent;
      }
      if (cur.trim()) out.push(cur.trim());
      continue;
    }
    if ((buf + p).length > max && buf) push();
    buf += (buf ? '\n' : '') + p;
  }
  push();
  return out;
}

/** 来源配置规整：只认已知类型与级别；凭据不在这里（index.cjs 单独加密保存） */
function normalizeSource(raw, prev = {}) {
  const kind = SOURCE_KINDS.includes(raw?.kind) ? raw.kind : prev.kind;
  if (!kind) throw new Error('未知的知识来源类型');
  const s = {
    id: String(prev.id || raw?.id || `ks-${createHash('sha1').update(`${kind}${Date.now()}${Math.random()}`).digest('hex').slice(0, 8)}`),
    kind,
    name: String(raw?.name ?? prev.name ?? '').trim().slice(0, 60) || { docs: '本方案文档库', app: '本机知识库', db: '远程数据库', http: '远程检索接口' }[kind],
    enabled: raw?.enabled === undefined ? prev.enabled !== false : !!raw.enabled,
    level: LEVELS.includes(raw?.level) ? raw.level : LEVELS.includes(prev.level) ? prev.level : 'internal',
  };
  if (kind === 'app') s.graphId = String(raw?.graphId ?? prev.graphId ?? '');
  if (kind === 'db') {
    s.dataSource = String(raw?.dataSource ?? prev.dataSource ?? '').trim();
    s.sql = String(raw?.sql ?? prev.sql ?? '').trim().slice(0, 2000);
    s.titleCol = String(raw?.titleCol ?? prev.titleCol ?? 'title').trim();
    s.textCol = String(raw?.textCol ?? prev.textCol ?? 'content').trim();
    s.refCol = String(raw?.refCol ?? prev.refCol ?? '').trim();
    if (s.sql && !/\{\{\s*q\s*\}\}/.test(s.sql)) throw new Error('检索 SQL 里要用 {{q}} 表示问题关键词，例如 WHERE content LIKE {{q}}');
    if (s.sql && !/^\s*(select|with)\b/i.test(s.sql)) throw new Error('只允许 SELECT 查询（远程数据库只读）');
  }
  if (kind === 'http') {
    s.url = String(raw?.url ?? prev.url ?? '').trim();
    if (s.url && !/^https?:\/\/[^\s]+$/i.test(s.url)) throw new Error('检索接口地址要以 http:// 或 https:// 开头');
    s.itemsPath = String(raw?.itemsPath ?? prev.itemsPath ?? 'items').trim();
    s.titleField = String(raw?.titleField ?? prev.titleField ?? 'title').trim();
    s.textField = String(raw?.textField ?? prev.textField ?? 'content').trim();
    s.urlField = String(raw?.urlField ?? prev.urlField ?? 'url').trim();
  }
  return s;
}

/** 关键词：取问题里最有区分度的几个词，给远程 SQL / 接口用（不把整句原样塞进 SQL） */
function keyTerms(q, tokenize, limit = 4) {
  const words = [...new Set(tokenize(q).filter((w) => w.length >= 2))].sort((a, b) => b.length - a.length);
  return words.slice(0, limit);
}

/** SQL 字符串字面量转义：只允许按值替换，单引号翻倍、去掉控制字符与注释符 */
function sqlLiteral(v) {
  return `'${String(v).replace(/[\u0000-\u001f]/g, ' ').replace(/--|\/\*|\*\//g, ' ').replace(/'/g, "''")}'`;
}

/** {{q}} → '%关键词%'（多个关键词时第一个；SQL 模板自己决定怎么用） */
function buildSql(template, terms) {
  const term = terms[0] || '';
  return String(template).replace(/\{\{\s*q\s*\}\}/g, sqlLiteral(`%${term}%`));
}

/** 按点号路径取值（items / data.hits / result.list） */
function pick(obj, path) {
  if (!path) return obj;
  return String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** 远程接口返回 → 统一命中 */
function mapHttpItems(json, s) {
  const items = pick(json, s.itemsPath);
  if (!Array.isArray(items)) throw new Error(`接口返回里没有找到列表（字段路径：${s.itemsPath || '（根）'}）`);
  return items.slice(0, 20).map((it, i) => ({
    title: String(pick(it, s.titleField) ?? `结果 ${i + 1}`).slice(0, 120),
    text: String(pick(it, s.textField) ?? '').slice(0, MAX_HIT_CHARS),
    ref: String(pick(it, s.urlField) ?? '').slice(0, 300),
  })).filter((x) => x.text.trim());
}

/** 数据库行 → 统一命中 */
function mapDbRows(rows, s) {
  return (Array.isArray(rows) ? rows : []).slice(0, 20).map((r, i) => ({
    title: String(r?.[s.titleCol] ?? `第 ${i + 1} 行`).slice(0, 120),
    text: String(r?.[s.textCol] ?? '').slice(0, MAX_HIT_CHARS),
    ref: s.refCol ? String(r?.[s.refCol] ?? '').slice(0, 300) : '',
  })).filter((x) => x.text.trim());
}

/**
 * 合并多个来源的命中：每个来源内部已按相关度排序，这里按「来源内名次」轮流取（不同来源的分数口径不同，不直接比），
 * 去掉重复正文，最多 limit 条。敏感级命中在 allowSensitive=false 时剔除并计数。
 */
function mergeHits(bySource, { limit = 6, allowSensitive = true } = {}) {
  const lists = bySource.map((x) => ({ ...x, hits: (x.hits || []).slice() }));
  const out = [];
  const seen = new Set();
  let droppedSensitive = 0;
  // 级别按条判断：命中自带级别（文档库里按文档设的）与来源级别取更严的那个
  const eff = (h, src) => (h.level && LEVEL_RANK[h.level] > LEVEL_RANK[src.level] ? h.level : src.level);
  for (const l of lists) {
    if (allowSensitive) continue;
    const keep = l.hits.filter((h) => eff(h, l.source) !== 'sensitive');
    droppedSensitive += l.hits.length - keep.length;
    l.hits = keep;
  }
  for (let round = 0; out.length < limit && lists.some((l) => l.hits.length); round += 1) {
    for (const l of lists) {
      const h = l.hits.shift();
      if (!h) continue;
      const key = h.text.replace(/\s+/g, '').slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...h, sourceId: l.source.id, sourceName: l.source.name, sourceKind: l.source.kind, level: eff(h, l.source) });
      if (out.length >= limit) break;
    }
  }
  return { hits: out, droppedSensitive };
}

/** 一组命中的最高数据级别（决定调用模型时按哪一级路由） */
function maxLevel(hits) {
  return (hits || []).reduce((m, h) => (LEVEL_RANK[h.level] > LEVEL_RANK[m] ? h.level : m), 'public');
}

module.exports = { LEVELS, SOURCE_KINDS, HTTP_TIMEOUT_MS, HTTP_MAX_BYTES, chunkText, normalizeSource, keyTerms, sqlLiteral, buildSql, pick, mapHttpItems, mapDbRows, mergeHits, maxLevel };
