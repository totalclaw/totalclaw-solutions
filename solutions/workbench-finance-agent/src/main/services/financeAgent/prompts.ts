/**
 * 财务智能体 · 给模型的指令（不是界面文案，豁免 i18n 词典，见 scripts/i18n-codemod.mjs）。
 *
 * 共同约束：模型只抽取与写文字，不算钱；给它的数字都是规则算好的，要求原样引用、不许改写、不许新增。
 */

const JSON_ONLY = '只输出一个 JSON 对象，不要 Markdown 代码块，不要解释。';
const NO_NUMBERS = '文中出现的所有金额、比例必须原样取自上面给出的数据，不得自行计算、四舍五入或编造新的数字；数据里没有的就不要写。';

export function invoiceFillPrompt(text: string, missing: string[], categories: string[]): string {
  return [
    '你在帮财务从票据识别文字里抄字段。下面是一张发票 / 客票 / 银行回单 OCR 或文字层的原文。',
    `需要补的字段：${missing.join('、')}。字段含义：invoiceNo 发票号码；invoiceCode 发票代码；date 开票日期（YYYY-MM-DD）；buyerName / buyerTaxId 购买方名称 / 纳税人识别号；sellerName / sellerTaxId 销售方名称 / 纳税人识别号；amount 不含税金额；tax 税额；total 价税合计；taxRate 税率（小数，如 0.06）；payer / payee 付款方 / 收款方；purpose 用途。`,
    `另给出费用类别 category，只能从这些里选一个：${categories.join('、')}。`,
    '规则：每个值必须能在原文里逐字找到（数字允许去掉千分位和 ¥）；原文里没有的字段填 null，不要猜。',
    JSON_ONLY,
    '格式：{"fields": {"字段名": 值 或 null}, "category": "类别"}',
    '--- 原文 ---',
    text.slice(0, 6000),
  ].join('\n');
}

export function taxNotePrompt(ledger: string, period: string, facts: string, findings: string): string {
  return [
    `你是企业的税务会计，为「${ledger}」${period} 的纳税申报写一份申报备注，给复核人看。`,
    '内容：本期各税种应纳税额概况、与上期或账面相比的主要差异及原因提示、风险预检发现的问题与处理建议、申报前需要人工确认的事项清单。',
    '语气：简洁、专业，分小标题，300～600 字。明确写出「本备注为草稿，申报须由财务人员在电子税务局人工核对后提交」。',
    NO_NUMBERS,
    '--- 规则算出的数据 ---',
    facts,
    '--- 风险预检 ---',
    findings || '无',
  ].join('\n');
}

export function statementAnalysisPrompt(ledger: string, period: string, facts: string, notes: string): string {
  return [
    `为「${ledger}」${period} 的财务报表写一段经营简要分析，给老板看。`,
    '三部分：营收（规模与变动）、毛利（毛利额、毛利率及变动原因的可能方向）、费用波动（哪类费用变化大）；最后给 2～3 条关注建议。',
    '有上期数据才谈变动，没有就只描述本期。可能原因只能写成「可能」「建议核实」，不能下结论。',
    '300～500 字，分小标题。',
    NO_NUMBERS,
    '--- 报表数据 ---',
    facts,
    notes ? `--- 账套备注（此前的记录，供参考） ---\n${notes.slice(0, 1500)}` : '',
  ].filter(Boolean).join('\n');
}

export function riskSummaryPrompt(ledger: string, findings: string): string {
  return [
    `以下是对「${ledger}」账套按固定规则巡检出的财税风险点。写一段总体结论（150～300 字）：`,
    '整体风险水平、最需要优先处理的 2～3 项及理由、整改的先后顺序。不要逐条复述明细，明细会另列。',
    NO_NUMBERS,
    '--- 风险点 ---',
    findings,
  ].join('\n');
}

export function budgetCommentaryPrompt(ledger: string, facts: string): string {
  return [
    `为「${ledger}」写一段月度预算执行解读（200～400 字）：总体执行率、超预算和接近上限的部门 / 类别、本月与预算的差异、给预算负责人的建议（控制措施或调整预算的理由）。`,
    NO_NUMBERS,
    '--- 预算执行数据 ---',
    facts,
  ].join('\n');
}

export function costCommentaryPrompt(ledger: string, facts: string): string {
  return [
    `为「${ledger}」的成本核算结果写一段成本分析（200～400 字）：各产品单位成本构成（料工费占比）、与上期的波动、异常损耗提示、改进建议。`,
    NO_NUMBERS,
    '--- 成本数据 ---',
    facts,
  ].join('\n');
}

export function contractPrompt(text: string): string {
  return [
    '你在做合同财税审核。读下面的合同原文，做两件事：',
    '1. 抽出涉税条款 clauses：type 取「价款」「税率」「发票类型」「开票时间」「付款节点」「税费承担」「收款账户」「违约责任」之一；quote 必须是原文里逐字连续的一句（不超过 80 字）；value 用一句话概括约定内容。',
    '2. 找出财税风险条款 risks：level 为 high / warn / info；title 一句话；quote 为原文逐字引用；detail 说明为什么有风险；suggestion 给修改建议。只列有原文依据的，没有就返回空数组。',
    '重点关注：价税是否分离、发票类型与税率是否与业务匹配、开票与付款的先后、包税条款、付款到个人账户、收款方与签约方不一致、预付款比例过高、无发票不合规责任条款、混合销售 / 兼营未分别约定价款。',
    JSON_ONLY,
    '格式：{"clauses":[{"type":"","quote":"","value":""}],"risks":[{"level":"warn","title":"","quote":"","detail":"","suggestion":""}]}',
    '--- 合同原文 ---',
    text.slice(0, 24000),
  ].join('\n');
}

export function qaPrompt(question: string, citations: Array<{ title: string; excerpt: string; ref?: string }>, history: Array<{ role: string; text: string }>, ledger: { name: string; taxpayer: string; notes: string }): string {
  const refs = citations.map((c, i) => `[${i + 1}] ${c.title}${c.ref ? `（${c.ref}）` : ''}\n${c.excerpt}`).join('\n\n');
  const hist = history.slice(-8).map((m) => `${m.role === 'user' ? '问' : '答'}：${m.text.slice(0, 600)}`).join('\n');
  return [
    '你是企业的财税问答助手，回答员工或客户的财税问题（开票、个税、小规模优惠、报销、账务处理等）。',
    `当前账套：${ledger.name}（${ledger.taxpayer}）。`,
    ledger.notes ? `账套备注：${ledger.notes.slice(0, 800)}` : '',
    '回答规则：',
    '- 只依据下面的参考资料作答，用 [1] [2] 标出依据；资料里没有的，明说「内置资料和企业制度里没有找到依据」，可以给一般性思路但要标明需要核实。',
    '- 企业内部制度与税法冲突时，以税法为准并指出冲突。',
    '- 涉及计算的给出计算过程；政策有执行期限的写明期限。',
    '- 结尾提醒：具体以主管税务机关最新口径为准。',
    '- 用提问所用的语言回答，简洁分点。',
    hist ? `--- 之前的对话 ---\n${hist}` : '',
    '--- 参考资料 ---',
    refs || '（没有检索到相关资料）',
    '--- 问题 ---',
    question,
  ].filter(Boolean).join('\n');
}

export function expenseNoticePrompt(notice: string): string {
  return [
    '把下面这段报销预审通知改写得更礼貌、清楚，给员工看。保持所有原因条目、金额与数字完全不变，不增加新的要求。只输出改写后的正文。',
    notice,
  ].join('\n');
}

export function filingInstruction(input: {
  ledger: string; taxId: string; taxpayer: string; period: string; portal: string;
  sections: Array<{ title: string; lines: string[] }>;
}): string {
  return [
    `请在内置浏览器里帮我在电子税务局填写「${input.ledger}」（纳税人识别号 ${input.taxId}，${input.taxpayer}）所属期 ${input.period} 的纳税申报。`,
    '',
    '必须遵守：',
    `1. 打开 ${input.portal}。如果看到登录页 / 扫码页 / 身份验证，停下来告诉我先登录，登录由我本人完成，你不要尝试输入账号密码或验证码。`,
    '2. 核对页面上的纳税人名称和识别号与上面一致，不一致立刻停下来告诉我。',
    '3. 按下面的数字逐项填写对应申报表。电子税务局预填的数据（开票、认证数据）如果和下面的数字不一样，不要改成任何一边，停下来把两边的数字都列给我。',
    '4. 所有表都填好后，在点击「提交申报」「确认申报」「缴款」之前一定停下来，把每张表的关键栏次和填写值列给我核对。提交与缴款由我本人点击，你不要点。',
    '5. 如果某张表找不到、栏次对不上、或页面要求填写下面没有的数据，停下来问我，不要猜。',
    '',
    ...input.sections.flatMap((s) => [`【${s.title}】`, ...s.lines.map((l) => `- ${l}`), '']),
    '以上数字由财务智能体按规则计算，已由财务复核；本次只做填写，不做提交。',
  ].join('\n');
}
