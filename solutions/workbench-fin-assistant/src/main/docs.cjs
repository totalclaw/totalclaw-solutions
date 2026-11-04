/**
 * 资料智能处理（纯逻辑，可单测）：多格式资料 → 识别格式 → 取出文字 → 分类 → 按类别抽关键字段 → 逐字核对。
 *
 *   识别：按文件头字节认格式（改了后缀骗不过），WPS 三件套（.wps/.et/.dps）按后缀 + 文件头区分新旧格式
 *   取文字：文档走宿主文档解析；老格式二进制（.doc/.wps/.et/.dps/.xls/.ppt）取 UTF-16 文本段；图片走本机 OCR；
 *          音频 / 视频先用 ffmpeg 转 16k 单声道，再用本机语音模型转写（数据不出本机）—— 这些在 index.cjs 里调宿主
 *   分类：先按关键词打分（零成本、可解释），拿不准再交模型在固定类目里选一个，选出类目外的不算
 *   抽字段：模型按类别的字段表抽取并给出原文摘录，程序逐字核对摘录在不在原文里，对不上的标「未核实」
 */

// ── 格式识别 ──

const EXT_GROUP = {
  document: ['.pdf', '.docx', '.doc', '.wps', '.txt', '.md', '.rtf', '.html', '.htm', '.eml'],
  sheet: ['.xlsx', '.xls', '.et', '.csv'],
  slides: ['.pptx', '.ppt', '.dps'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.heic'],
  audio: ['.mp3', '.wav', '.m4a', '.aac', '.amr', '.flac', '.ogg', '.wma'],
  video: ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v', '.3gp'],
};
const FORMAT_LABEL = { document: '文档', sheet: '表格', slides: '演示文稿', image: '图片', audio: '音频', video: '视频', unknown: '未知' };

/**
 * 认格式：{ group, format, wps, legacy }。
 * format 是具体格式（pdf/docx/ole/jpeg/mp3…），legacy=true 表示老式二进制（OLE 复合文档），wps=true 表示金山 WPS 文件
 */
function detectFormat(head, ext) {
  const b = head || Buffer.alloc(0);
  const at = (i, ...xs) => xs.every((x, k) => b[i + k] === x);
  const str = (i, n) => b.subarray(i, i + n).toString('latin1');
  const e = String(ext || '').toLowerCase();
  const wps = ['.wps', '.et', '.dps'].includes(e);
  const groupOfExt = Object.entries(EXT_GROUP).find(([, list]) => list.includes(e))?.[0] || 'unknown';
  let format = '';
  if (str(0, 4) === '%PDF') format = 'pdf';
  else if (at(0, 0x50, 0x4b, 0x03, 0x04)) format = 'zip';
  else if (at(0, 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) format = 'ole';
  else if (at(0, 0xff, 0xd8, 0xff)) format = 'jpeg';
  else if (at(0, 0x89, 0x50, 0x4e, 0x47)) format = 'png';
  else if (str(0, 4) === 'GIF8') format = 'gif';
  else if (str(0, 4) === 'RIFF' && str(8, 4) === 'WEBP') format = 'webp';
  else if (str(0, 2) === 'BM') format = 'bmp';
  else if (at(0, 0x49, 0x49, 0x2a, 0x00) || at(0, 0x4d, 0x4d, 0x00, 0x2a)) format = 'tiff';
  else if (str(0, 4) === 'RIFF' && str(8, 4) === 'WAVE') format = 'wav';
  else if (str(0, 4) === 'RIFF' && str(8, 4) === 'AVI ') format = 'avi';
  else if (str(0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) format = 'mp3';
  else if (str(0, 6) === '#!AMR\n') format = 'amr';
  else if (str(0, 4) === 'fLaC') format = 'flac';
  else if (str(0, 4) === 'OggS') format = 'ogg';
  else if (at(0, 0x1a, 0x45, 0xdf, 0xa3)) format = 'mkv';
  else if (str(0, 3) === 'FLV') format = 'flv';
  else if (str(4, 4) === 'ftyp') {
    const brand = str(8, 4);
    format = /^(M4A |M4B )/.test(brand) ? 'm4a' : /^(heic|heix|mif1)/.test(brand) ? 'heic' : brand.startsWith('qt') ? 'mov' : 'mp4';
  } else if (str(0, 5) === '{\\rtf') format = 'rtf';
  let group = groupOfExt;
  const byFormat = { pdf: 'document', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', bmp: 'image', tiff: 'image', heic: 'image', wav: 'audio', mp3: 'audio', amr: 'audio', flac: 'audio', ogg: 'audio', m4a: 'audio', avi: 'video', mkv: 'video', flv: 'video', mov: 'video', mp4: 'video', rtf: 'document' };
  if (byFormat[format]) group = byFormat[format];
  // mp4 容器只有声音（录音笔导出）也常见：按后缀认成音频
  if (format === 'mp4' && groupOfExt === 'audio') group = 'audio';
  if (!format) format = groupOfExt === 'unknown' ? 'unknown' : 'text';
  return { group, format, wps, legacy: format === 'ole', label: FORMAT_LABEL[group] || '未知' };
}

/**
 * 老式二进制文档（OLE：.doc/.wps/.dps/.ppt）取文字：Word / WPS 正文以 UTF-16LE 存，扫出连续的可打印字符段（≥4 个字）。
 * 不解析格式，能保证的是「拿到正文文字」，用来分类和抽字段足够
 */
function oleTextRuns(buf, minLen = 4) {
  const out = [];
  let cur = '';
  const flush = () => { if (cur.replace(/\s/g, '').length >= minLen) out.push(cur.trim()); cur = ''; };
  for (let i = 0; i + 1 < buf.length; i += 2) {
    const c = buf[i] | (buf[i + 1] << 8);
    const ok = (c >= 0x20 && c < 0x7f) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3000 && c <= 0x303f) || (c >= 0xff00 && c <= 0xffef) || c === 0x0d || c === 0x0a || c === 0x09 || (c >= 0x2010 && c <= 0x2027);
    if (ok) cur += c === 0x0d ? '\n' : String.fromCharCode(c);
    else flush();
  }
  flush();
  // 去掉明显的结构噪声（字体名、样式表里的英文短串）
  return out.filter((s) => /[一-鿿]/.test(s) || s.length >= 12).join('\n');
}

// ── 分类 ──

/** 金融机构常见资料类目（顺序即界面顺序）：关键词打分 + 字段表 */
const CATEGORIES = [
  { id: 'contract', name: '合同协议', keywords: ['合同', '协议', '甲方', '乙方', '违约', '签订', '双方'], fields: ['合同名称', '甲方', '乙方', '合同金额', '期限', '签署日期'] },
  { id: 'policy', name: '制度办法', keywords: ['办法', '制度', '细则', '第一条', '第二条', '本办法', '施行', '解释'], fields: ['制度名称', '发文部门', '生效日期', '适用范围'] },
  { id: 'regulatory', name: '监管文件', keywords: ['银保监', '金融监管总局', '人民银行', '通知', '各银行', '监管', '文号', '发〔'], fields: ['发文机关', '文号', '发布日期', '主题'] },
  { id: 'financial', name: '财务报表', keywords: ['资产负债表', '利润表', '现金流量表', '营业收入', '净利润', '总资产', '负债合计'], fields: ['报表主体', '报表期间', '营业收入', '净利润', '资产总计', '负债合计'] },
  { id: 'statement', name: '银行流水', keywords: ['流水', '交易日期', '对方户名', '余额', '摘要', '借方', '贷方', '账号'], fields: ['户名', '账号', '起止日期', '收入合计', '支出合计'] },
  { id: 'invoice', name: '发票票据', keywords: ['发票', '税额', '价税合计', '开票日期', '销售方', '购买方', '纳税人识别号'], fields: ['发票号码', '开票日期', '销售方', '购买方', '金额', '税额', '价税合计'] },
  { id: 'license', name: '证照资质', keywords: ['营业执照', '统一社会信用代码', '法定代表人', '注册资本', '成立日期', '经营范围', '身份证'], fields: ['名称', '统一社会信用代码', '法定代表人', '注册资本', '成立日期'] },
  { id: 'minutes', name: '会议纪要', keywords: ['会议', '纪要', '参会', '议题', '决议', '主持', '与会'], fields: ['会议主题', '会议时间', '参会人', '决议事项', '待办与负责人'] },
  { id: 'marketing', name: '营销物料', keywords: ['收益', '年化', '产品', '理财', '限时', '抢购', '客户经理', '活动'], fields: ['产品名称', '收益表述', '风险提示', '活动期限'] },
  { id: 'call', name: '客户沟通录音', keywords: ['您好', '请问', '客户', '办理', '好的', '谢谢', '我们这边', '您看'], fields: ['客户诉求', '承诺事项', '是否提示风险', '后续跟进'] },
  { id: 'other', name: '其他资料', keywords: [], fields: ['标题', '要点'] },
];
const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/** 关键词打分：每个类目命中的关键词数（同一词只算一次）；返回按分数排的前几项 */
function scoreCategories(text, { group } = {}) {
  const s = String(text || '').slice(0, 20000);
  const rows = CATEGORIES.filter((c) => c.id !== 'other').map((c) => ({ id: c.id, name: c.name, score: c.keywords.filter((k) => s.includes(k)).length }));
  // 录音 / 视频转写来的文字，口语词权重更高（不然一段讲合同的通话会被分进合同）
  if (group === 'audio' || group === 'video') for (const r of rows) if (r.id === 'call') r.score += 2;
  return rows.sort((a, b) => b.score - a.score);
}

/** 关键词就能定的：最高分 ≥3 且领先第二名 ≥2 → 直接定；否则交模型（返回 null） */
function ruleCategory(text, opts) {
  const [a, b] = scoreCategories(text, opts);
  if (!a || a.score < 3) return null;
  if (b && a.score - b.score < 2) return null;
  return { id: a.id, by: 'rule', score: a.score };
}

/** 模型返回的类目：只认固定类目里的 id，认不出归「其他」 */
function normalizeCategory(raw) {
  const id = String(raw?.category || raw?.id || raw || '').trim();
  if (CATEGORY_BY_ID[id]) return id;
  const byName = CATEGORIES.find((c) => c.name === id);
  return byName ? byName.id : 'other';
}

// ── 字段抽取与核对 ──

const norm = (s) => String(s || '').replace(/[\s　]+/g, '').replace(/[，,]/g, ',').replace(/[：:]/g, ':');

/**
 * 模型给的字段（{ 字段: { value, quote } }）→ 规整 + 逐字核对：摘录（或值本身）能在原文里找到才算「已核实」。
 * 只保留类目字段表里的字段；值超长截断
 */
function verifyFields(raw, text, categoryId) {
  const fields = CATEGORY_BY_ID[categoryId]?.fields || [];
  const src = norm(text);
  const out = [];
  for (const f of fields) {
    const r = raw?.[f];
    const value = String((r && typeof r === 'object' ? r.value : r) ?? '').trim().slice(0, 300);
    const quote = String((r && typeof r === 'object' ? r.quote : '') ?? '').trim().slice(0, 300);
    if (!value || /^(无|未提及|未知|null|n\/a|—|-)$/i.test(value)) { out.push({ field: f, value: '', quote: '', verified: false, missing: true }); continue; }
    const verified = (!!quote && src.includes(norm(quote))) || src.includes(norm(value));
    out.push({ field: f, value, quote, verified });
  }
  return out;
}

/** 规则先抽的确定性字段（不靠模型）：日期、金额、统一社会信用代码、发票号 */
function regexFacts(text) {
  const s = String(text || '');
  const pick = (re, max = 5) => [...new Set([...s.matchAll(re)].map((m) => m[0].trim()))].slice(0, max);
  return {
    dates: pick(/\d{4}\s*[年\-/.]\s*\d{1,2}\s*[月\-/.]\s*\d{1,2}\s*日?/g),
    amounts: pick(/(?:人民币|￥|¥)?\s*\d{1,3}(?:,\d{3})+(?:\.\d+)?\s*(?:元|万元|亿元)?|\d+(?:\.\d+)?\s*(?:万元|亿元|元)/g),
    creditCodes: pick(/(?<![0-9A-Z])[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}(?![0-9A-Z])/g),
    invoiceNos: pick(/(?:发票号码|No\.?)\s*[:：]?\s*\d{8,20}/g),
  };
}

/** 资料台账导出 CSV（每个字段一列） */
function docsCsv(list) {
  const fieldSet = [];
  for (const d of list || []) for (const f of d.fields || []) if (!fieldSet.includes(f.field)) fieldSet.push(f.field);
  const cols = ['文件名', '格式', '类别', '分类方式', '字数', '状态', ...fieldSet];
  const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows = (list || []).map((d) => {
    const fv = Object.fromEntries((d.fields || []).map((f) => [f.field, f.value ? `${f.value}${f.verified ? '' : '（未核实）'}` : '']));
    return [d.name, d.formatLabel, CATEGORY_BY_ID[d.category]?.name || '', d.categoryBy === 'rule' ? '关键词' : d.categoryBy === 'model' ? '模型' : d.categoryBy === 'manual' ? '人工' : '', (d.text || '').length, d.status, ...fieldSet.map((f) => fv[f] || '')];
  });
  return `﻿${[cols, ...rows].map((r) => r.map(esc).join(',')).join('\n')}\n`;
}

// ── 文字清洗 ──

/**
 * 纯文本解码：先按 UTF-8（去 BOM），解出替换符（U+FFFD）再按 GB18030 重解——银行系统导出的 CSV / TXT 多是 GBK。
 * 不走表格解析：表格解析会把「2026-10-01」当日期再按 UTC 转回来，零时区以西差一天、格式也变成 9/30/26。
 */
function decodeText(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf || '');
  let s = b.toString('utf8');
  if (s.includes('\uFFFD')) {
    try { const g = new TextDecoder('gb18030').decode(b); if (!g.includes('\uFFFD')) s = g; } catch { /* 没有 gb18030 解码器就用 UTF-8 结果 */ }
  }
  return s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

/**
 * PDF 抽出来的字常是康熙部首 / 部首补充区的「⾦ ⽉ ⽇ ⼈」，看着一样、码位不同：关键词分类、检索、逐字核对都会对不上。
 * 只把这两个区段的字按 NFKC 换成常用汉字，不整体 NFKC（那会把全角括号、冒号也换成半角，改掉原文）。
 */
function normalizeCjk(text) {
  return String(text || '').replace(/[\u2E80-\u2EFF\u2F00-\u2FDF]/g, (c) => c.normalize('NFKC'));
}

module.exports = { decodeText, normalizeCjk, EXT_GROUP, FORMAT_LABEL, CATEGORIES, CATEGORY_BY_ID, detectFormat, oleTextRuns, scoreCategories, ruleCategory, normalizeCategory, verifyFields, regexFacts, docsCsv };
