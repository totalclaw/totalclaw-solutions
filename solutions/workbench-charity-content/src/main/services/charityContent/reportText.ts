/**
 * 慈善活动内容工场 · 报告文案（纯函数，可单测）。
 *
 * 模型只负责措辞：提示词把档案事实和素材描述一起给它，要求三语 JSON；
 * 回来后用 findForeignNumbers 核对——出现档案里没有的数字就整份判废，
 * 退回 deterministicReport（模板拼接，数字必然只来自档案）。
 */
import type { CharityArchive, CharityLang, CharityMediaDescription, CharityReport, CharityReportContent, CharityTri } from '@totalclaw/ipc-contracts';
import { LANGS, archiveFacts, archiveNumbers, extractJsonObject, stripImageLead, tri } from './archive';

const LANG_NAME: Record<CharityLang, string> = { zh: '简体中文', en: 'English（英文）', ar: 'العربية（现代标准阿拉伯语，可直接刊发）' };

/** 单语言报告提示词：一次只写一种语言（三语一次出容易被输出上限截断，阿语尤甚） */
export function reportPrompt(archive: CharityArchive, descriptions: CharityMediaDescription[], lang: CharityLang, contentPrompt = ''): string {
  const facts = archiveFacts(archive, lang);
  // 「未识别」的素材只有档案兜底文字，不是画面描述，不喂给模型
  const scenes = descriptions.filter((d) => !d.unrecognized).map((d, i) => `${i + 1}. [${d.kind === 'video' ? '视频' : '照片'}] ${d.description[lang] || d.description.zh || d.description.en}`);
  return [
    `你是公益机构的传播主编。请根据【活动档案】和【素材画面描述】，用${LANG_NAME[lang]}写一份活动报告。`,
    '硬性规则：',
    '1. 人数、金额、日期等一切数字只能原样引用活动档案里已有的；档案未披露的就不写数字，用「多位」「一批」等措辞。绝不新增任何数字（包括约数、百分比、序号）。',
    '2. 不编造人名、头衔、具体地名；只用档案和画面描述里出现的信息。',
    '3. 语气温暖、有画面感，面向公众与捐赠人；机构名、活动名、地点使用档案里该语言的写法。',
    '4. 以活动和机构为主语叙述，不要写成看图说话（不要用「图片展示了」「画面中」「The image shows」「تُظهر الصورة」这类开头）。',
    '严格只输出一个 JSON 对象，不要解释，格式：',
    '{"title":"报告标题","overview":"概况 80~150 字","highlights":["亮点1","亮点2","亮点3"],"scene":"现场 80~150 字","thanks":"致谢 40~80 字","summary":"给旁白用的口语化摘要（35 秒内读完：中文 ≤110 字 / 英文 ≤75 words / 阿语 ≤60 words）","captions":["短视频字幕1（≤18 字 / 8 words）","字幕2","字幕3","字幕4","字幕5"]}',
    '',
    '【活动档案】',
    ...facts,
    '',
    '【素材画面描述】',
    ...(scenes.length ? scenes : ['（暂无）']),
    // 第 1 步「内容提示词」：决定侧重点与语气；与上面的硬性规则冲突时以规则为准
    ...(contentPrompt.trim() ? ['', '【内容提示词（用户对侧重点与语气的要求，报告、摘要、字幕都按它写）】', contentPrompt.trim(), '与上面的硬性规则冲突时以硬性规则为准：数字只能来自活动档案，不编造人名与地名。'] : []),
  ].join('\n');
}

/** 第一次回复被 findForeignNumbers 判废后的重试提示：原提示词末尾再压一句禁造数 */
export function reportRetryPrompt(prompt: string): string {
  return `${prompt}\n\n再次强调：除档案给出的数字外，一个数字都不许出现。`;
}

function strList(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? '').trim()).filter(Boolean).slice(0, max);
}

function contentFrom(rec: Record<string, unknown> | undefined, lang?: CharityLang): CharityReportContent | null {
  if (!rec) return null;
  const s = (k: string): string => (typeof rec[k] === 'string' ? (rec[k] as string).trim() : '');
  // 摘要（旁白）与首句字幕（海报标语）以活动为主语：去掉看图口吻开头，去完为空保留原句
  const lead = (v: string): string => (lang ? stripImageLead(v, lang) || v : v);
  const c: CharityReportContent = {
    title: s('title'), overview: lead(s('overview')), highlights: strList(rec.highlights, 5), scene: s('scene'), thanks: s('thanks'),
    summary: lead(s('summary')), captions: strList(rec.captions, 6).map(lead),
  };
  if (!c.title || !c.overview) return null;
  if (!c.summary) c.summary = c.overview;
  if (!c.captions.length) c.captions = [c.title, ...c.highlights].slice(0, 5);
  return c;
}

/** 单语言回复 → 报告正文；缺标题/概况即 null */
export function parseReportContent(text: string, lang?: CharityLang): CharityReportContent | null {
  const obj = extractJsonObject(text);
  return obj ? contentFrom(obj, lang) : null;
}

/** 三语 JSON（预置 report.json / 旧格式）→ 三语报告；任一语言缺失即返回 null（半份报告没法「三语并出」） */
export function parseReport(text: string): CharityReport | null {
  const obj = extractJsonObject(text);
  if (!obj) return null;
  const out = {} as CharityReport;
  for (const lang of LANGS) {
    const c = contentFrom(obj[lang] as Record<string, unknown> | undefined, lang);
    if (!c) return null;
    out[lang] = c;
  }
  return out;
}

const NUM_RE = /\d[\d,]*(?:\.\d+)?/g;

/** 报告里出现、但档案里没有的数字。年份 / 序号 1~9 放行（"第 3 项"这类不算造数） */
export function findForeignNumbers(report: CharityReport | CharityReportContent, archive: CharityArchive): string[] {
  const allowed = archiveNumbers(archive);
  const texts: string[] = [];
  const push = (c: CharityReportContent): void => { texts.push(c.title, c.overview, c.scene, c.thanks, c.summary, ...c.highlights, ...c.captions); };
  if ('zh' in report && typeof (report as CharityReport).zh === 'object') for (const l of LANGS) push((report as CharityReport)[l]);
  else push(report as CharityReportContent);
  const foreign = new Set<string>();
  for (const t of texts) {
    for (const m of t.matchAll(NUM_RE)) {
      const raw = m[0].replace(/,/g, '');
      if (allowed.has(raw)) continue;
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 1 && n <= 9 && !raw.includes('.')) continue;
      if (/^(19|20)\d{2}$/.test(raw)) continue;
      foreign.add(m[0]);
    }
  }
  return [...foreign];
}

/** 不靠模型的模板报告：句子里嵌的是档案字段，数字天然只来自档案 */
export function deterministicReport(archive: CharityArchive, descriptions: CharityMediaDescription[]): CharityReport {
  const scenes = (lang: CharityLang): string[] => descriptions.filter((d) => !d.unrecognized).map((d) => d.description[lang]).filter(Boolean);
  const n = archive.participants;
  const money = archive.donation;
  const zh = (): CharityReportContent => {
    const org = archive.orgName.zh; const ev = archive.eventName.zh; const loc = archive.location.zh;
    const people = n == null ? '多位伙伴' : `${n} 位参与者`;
    const sc = scenes('zh');
    return {
      title: `${ev} · 活动报告`,
      overview: `${archive.date ? archive.date + '，' : ''}${org}${loc ? `在${loc}` : ''}举办了「${ev}」。${people}参与其中${money ? `，活动共筹集善款 ${money}` : ''}。${archive.summary.zh}`,
      highlights: [
        `${org}以真诚与专业完成了本次活动的组织与接待`,
        money ? `善款 ${money} 将全部用于既定公益用途` : '现场交流热烈，参与者收获真切的连接与理解',
        sc[0] ? sc[0].slice(0, 60) : '每一个环节都把人放在第一位',
      ],
      scene: sc.length ? sc.slice(0, 4).join(' ') : `${loc || '活动现场'}秩序井然，志愿者与参与者相互支持，交流温暖而真诚。`,
      thanks: `感谢${archive.organizer.zh || org}及所有志愿者、合作伙伴与捐赠人的支持。因为你们，善意得以传递。`,
      summary: `${org}举办的「${ev}」${loc ? `在${loc}` : ''}圆满举行。${people}参与${money ? `，共筹集善款 ${money}` : ''}。${archive.summary.zh} 感谢每一位支持者。`,
      captions: [ev, org, loc ? `地点：${loc}` : '真诚的相遇', n == null ? '每一份参与都珍贵' : `${n} 位参与者`, money ? `善款 ${money}` : '善意，正在传递', '感谢每一位支持者'].filter(Boolean).slice(0, 6),
    };
  };
  const en = (): CharityReportContent => {
    const org = archive.orgName.en; const ev = archive.eventName.en; const loc = archive.location.en;
    const people = n == null ? 'many participants' : `${n} participants`;
    const sc = scenes('en');
    return {
      title: `${ev} — Event Report`,
      overview: `${archive.date ? 'On ' + archive.date + ', ' : ''}${org} held "${ev}"${loc ? ` in ${loc}` : ''}. The event brought together ${people}${money ? ` and raised ${money}` : ''}. ${archive.summary.en}`,
      highlights: [
        `${org} delivered the programme with sincerity and professionalism`,
        money ? `All ${money} raised goes to the intended charitable purpose` : 'Warm exchanges left participants with genuine connection and understanding',
        sc[0] ? sc[0].slice(0, 80) : 'Every moment kept people at the centre',
      ],
      scene: sc.length ? sc.slice(0, 4).join(' ') : `${loc || 'The venue'} was orderly and welcoming; volunteers and guests supported one another in a warm, honest atmosphere.`,
      thanks: `Our thanks go to ${archive.organizer.en || org}, every volunteer, partner and donor. Because of you, kindness travels further.`,
      summary: `"${ev}" by ${org}${loc ? ` in ${loc}` : ''} was a success, with ${people}${money ? ` and ${money} raised` : ''}. ${archive.summary.en} Thank you to everyone who supported us.`,
      captions: [ev, org, loc ? `Location: ${loc}` : 'A sincere encounter', n == null ? 'Every contribution matters' : `${n} participants`, money ? `${money} raised` : 'Kindness in motion', 'Thank you for your support'].filter(Boolean).slice(0, 6),
    };
  };
  const ar = (): CharityReportContent => {
    const org = archive.orgName.ar; const ev = archive.eventName.ar; const loc = archive.location.ar;
    const people = n == null ? 'عدد كبير من المشاركين' : `${n} مشاركًا`;
    const sc = scenes('ar');
    return {
      title: `${ev} — تقرير الفعالية`,
      overview: `${archive.date ? 'بتاريخ ' + archive.date + '، ' : ''}أقامت ${org} فعالية «${ev}»${loc ? ` في ${loc}` : ''}. جمعت الفعالية ${people}${money ? ` وحققت تبرعات بلغت ${money}` : ''}. ${archive.summary.ar}`,
      highlights: [
        `نفذت ${org} البرنامج بصدق واحترافية`,
        money ? `تُوجَّه التبرعات البالغة ${money} بالكامل للغرض الخيري المحدد` : 'لقاءات دافئة تركت أثرًا حقيقيًا من التواصل والفهم',
        sc[0] ? sc[0].slice(0, 80) : 'كان الإنسان في قلب كل لحظة',
      ],
      scene: sc.length ? sc.slice(0, 4).join(' ') : `كان ${loc || 'موقع الفعالية'} منظمًا ومرحبًا، وتعاون المتطوعون والضيوف في أجواء دافئة وصادقة.`,
      thanks: `شكرًا لـ${archive.organizer.ar || org} ولكل المتطوعين والشركاء والمتبرعين. بفضلكم يمتد أثر الخير.`,
      summary: `أُقيمت فعالية «${ev}» من تنظيم ${org}${loc ? ` في ${loc}` : ''} بنجاح، بمشاركة ${people}${money ? ` وتبرعات بلغت ${money}` : ''}. ${archive.summary.ar} شكرًا لكل من دعمنا.`,
      captions: [ev, org, loc ? `المكان: ${loc}` : 'لقاء صادق', n == null ? 'كل مساهمة لها قيمتها' : `${n} مشاركًا`, money ? `تبرعات ${money}` : 'الخير يمضي قدمًا', 'شكرًا لدعمكم'].filter(Boolean).slice(0, 6),
    };
  };
  return { zh: zh(), en: en(), ar: ar() };
}

/** 画面描述「未识别」时的兜底文字（按内容语言写死，同模板报告）：只用活动档案里已有的信息（不猜画面） */
export function describeFallback(archive?: CharityArchive): CharityTri {
  const ev = archive?.eventName; const org = archive?.orgName;
  const join2 = (a: string, b: string, sep: string): string => [a, b].filter(Boolean).join(sep);
  return tri(
    ev?.zh ? join2(`「${ev.zh}」活动素材`, org?.zh || '', ' · ') : join2('活动素材', org?.zh || '', ' · '),
    ev?.en ? join2(`Material from "${ev.en}"`, org?.en || '', ' · ') : join2('Event material', org?.en || '', ' · '),
    ev?.ar ? join2(`مادة من فعالية «${ev.ar}»`, org?.ar || '', ' · ') : join2('مادة من الفعالية', org?.ar || '', ' · '),
  );
}

/** 视觉描述提示词：三语 JSON，一句话说清画面（不猜身份、不猜数字） */
export function describePrompt(kind: 'image' | 'video', contentPrompt = ''): string {
  return [
    kind === 'video' ? '这是一段活动视频抽出的几帧画面。' : '这是一张公益活动的现场照片或宣传图。',
    '用一到两句话描述画面里的场景、人物活动、氛围与可见的文字/标识。不要猜测人物身份，不要估计人数或金额。',
    // 第 1 步「内容提示词」只决定描述时关注什么，画面里看不到的仍然不写
    ...(contentPrompt.trim() ? [`描述时的侧重点（用户的内容提示词，只决定关注什么；画面里看不到的不要写）：${contentPrompt.trim().slice(0, 400)}`] : []),
    '严格只输出 JSON：{"zh":"中文描述","en":"English description","ar":"وصف بالعربية"}',
    '字符串里如需引用标题，用「」、“”或 «» 等引号，不要用未转义的英文双引号。',
  ].join('\n');
}

/**
 * 长提示词浓缩（第 4 步拼镜头 / 配乐 prompt 前，两个提示词合计超过 CONDENSE_OVER 时调用一次）：
 * 让文本模型把「内容提示词」「视频提示词」各自压成短要点并分好类，结果按原文语言输出。
 */
export function condensePromptsRequest(contentPrompt: string, videoPrompt: string): string {
  return [
    '你在为一条 9:16 公益宣传短视频准备图生视频与配乐的提示词。下面是用户写的两段提示词，可能很长。',
    '请把它们浓缩成短要点并分类，保留用户的原意与关键细节，不要新增用户没说的东西。',
    '分类：content = 画面里要表现的内容（主题、人物、场景、事件）；style = 画面怎么拍（色调、镜头运动、构图、节奏、转场）；',
    'music = 配乐要求；ending = 片尾要出现的标语原文（没有就留空字符串）。数字规则、写作语气、受众这类只关乎写文案的要求不要放进来。',
    '每个要点 ≤ 30 字（英文 ≤ 12 words）；content ≤ 6 条，style ≤ 6 条，music ≤ 3 条。用原提示词的语言写。',
    '严格只输出一个 JSON 对象：{"content":["…"],"style":["…"],"music":["…"],"ending":""}',
    '',
    '【内容提示词】',
    contentPrompt.trim() || '（无）',
    '',
    '【视频提示词】',
    videoPrompt.trim() || '（无）',
  ].join('\n');
}
