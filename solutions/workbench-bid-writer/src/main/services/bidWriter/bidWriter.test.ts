/**
 * 标书制作工作台 · 确定性部分的单测。
 *
 * 这三个模块决定了「标书会不会因为格式或废标条款翻车」，所以它们一条模型都不调：
 * 大纲解析、公告要点抽取、投标前自检全是纯函数，喂样本就能断言。
 */
import { describe, it, expect } from 'vitest';
import type { BidWriterProject } from '@totalclaw/ipc-contracts';
import { builtinOutline, parseOutline, stripNumbering } from './outline';
import { extractNoticeFacts, extractRequirementsByRules, normalizeNoticeText, qualificationKind, verifyAgainstText } from './noticeRules';
import { collectPlaceholders, countWords, deadlinePassed, hasBlocker, runComplianceCheck } from './compliance';
import { numberSections } from './docx';
import { isChannelErrorReply, parseJsonLoose } from './llmReply';
import { buildQueries, deriveKeywords, rankHits } from './noticeSearch';
import { looksLikeListingUrl } from './matchPatterns';

const TEMPLATE_SAMPLE = `
投标文件格式
第一章 投标函及投标函附录
投标人应按本格式填写，加盖公章。
第二章 法定代表人身份证明
1. 法定代表人身份证明书
2. 授权委托书（如适用）
第三章 技术方案
3.1 总体设计
3.2 实施进度
第四章 商务部分
报价一览表见附件。
`;

const NOTICE_SAMPLE = `
某某市智慧园区平台建设项目招标公告
采购人：某某市大数据管理局
代理机构：某某招标有限公司
项目编号：SZYQ-2026-0417
预算金额：人民币 860 万元
投标保证金：人民币 8 万元
投标文件递交截止时间：2026年10月20日 09:30
开标时间：2026年10月20日 09:30
联系人：张工 0571-88880000

一、投标人资格要求
1. 投标人须具备独立法人资格，持有有效的营业执照；
2. 投标人须具备信息系统集成及服务资质二级及以上；
3. 近三年内承担过不少于 2 个同类项目，并提供合同复印件；

二、评标办法
1. 技术方案 40 分；
2. 商务报价 35 分；
3. 同类业绩 15 分；

三、投标文件应提交的材料
1. 投标函及投标函附录；
2. 法定代表人身份证明及授权委托书；
3. 营业执照副本复印件加盖公章；

四、格式要求
1. 投标文件正本一份、副本四份，密封递交，否则按废标处理；
`;

function baseProject(patch: Partial<BidWriterProject> = {}): BidWriterProject {
  return {
    id: 'p1', name: '测试项目', createdAt: 1, updatedAt: 1, lang: 'zh-CN',
    goal: '', strategies: [], bidder: '某某科技', siteUrl: '',
    notice: { requirements: [] }, template: null, sections: [], company: [],
    qualifications: [], compliance: [], exports: [], stepState: {},
    ...patch,
  };
}

describe('模板 → 章节大纲', () => {
  it('识别中文章节标题并去掉编号', () => {
    const r = parseOutline(TEMPLATE_SAMPLE);
    expect(r.fromTemplate).toBe(true);
    const titles = r.sections.map((s) => s.title);
    expect(titles).toContain('投标函及投标函附录');
    expect(titles).toContain('技术方案');
    // 层级口径：一级=第X章/部分，二级=「1.」「（一）」，三级=「1.1」及更深
    expect(r.sections.find((s) => s.title === '总体设计')?.level).toBe(3);
  });

  it('把标题下面的说明收进 guide', () => {
    const r = parseOutline(TEMPLATE_SAMPLE);
    const first = r.sections.find((s) => s.title === '投标函及投标函附录');
    expect(first?.guide).toContain('加盖公章');
  });

  it('必交件类标题自动标必备', () => {
    const r = parseOutline(TEMPLATE_SAMPLE);
    expect(r.sections.find((s) => s.title === '投标函及投标函附录')?.required).toBe(true);
  });

  it('解析不出标题时回落内置大纲，并如实说明', () => {
    const r = parseOutline('这是一段没有任何标题的说明文字，全是连续的句子。'.repeat(20));
    expect(r.fromTemplate).toBe(false);
    expect(r.sections.length).toBeGreaterThan(5);
    expect(r.note).toContain('内置标准大纲');
  });

  it('stripNumbering 去掉各种编号形态', () => {
    expect(stripNumbering('第三章 技术方案')).toBe('技术方案');
    expect(stripNumbering('（二）资格审查')).toBe('资格审查');
    expect(stripNumbering('3.2 实施进度')).toBe('实施进度');
    expect(stripNumbering('Section 2 Commercial')).toBe('Commercial');
  });

  it('内置大纲覆盖商务/技术/服务三段', () => {
    const titles = builtinOutline().map((s) => s.title);
    expect(titles.some((t) => t.includes('技术方案'))).toBe(true);
    expect(titles.some((t) => t.includes('商务'))).toBe(true);
    expect(titles.some((t) => t.includes('售后'))).toBe(true);
  });
});

describe('公告 → 要点（规则）', () => {
  it('关键数字原样截取，不改写', () => {
    const f = extractNoticeFacts(NOTICE_SAMPLE);
    expect(f.projectCode).toBe('SZYQ-2026-0417');
    expect(f.buyer).toBe('某某市大数据管理局');
    expect(f.budget).toContain('860');
    expect(f.deposit).toContain('8 万元');
    expect(f.bidDeadline).toContain('2026年10月20日');
  });

  it('按小标题给要求分类', () => {
    const rs = extractRequirementsByRules(NOTICE_SAMPLE, '公告', 'https://example.com/a');
    const kinds = new Set(rs.map((r) => r.kind));
    expect(kinds.has('qualification')).toBe(true);
    expect(kinds.has('scoring')).toBe(true);
    expect(kinds.has('deliverable')).toBe(true);
    expect(kinds.has('format')).toBe(true);
  });

  it('评分项带上分值，资格项标硬性', () => {
    const rs = extractRequirementsByRules(NOTICE_SAMPLE, '公告');
    const tech = rs.find((r) => r.kind === 'scoring' && r.text.includes('技术方案'));
    expect(tech?.points).toBe(40);
    expect(rs.filter((r) => r.kind === 'qualification').every((r) => r.mandatory)).toBe(true);
  });

  it('每条都带原文来源', () => {
    const rs = extractRequirementsByRules(NOTICE_SAMPLE, '某公告', 'https://example.com/a');
    expect(rs[0].source?.kind).toBe('notice');
    expect(rs[0].source?.locator).toBe('https://example.com/a');
    expect(rs[0].source?.quote).toBeTruthy();
  });

  it('模型编的内容在原文里找不到依据 → 判假', () => {
    expect(verifyAgainstText(NOTICE_SAMPLE, '投标人须具备信息系统集成及服务资质二级及以上')).toBe(true);
    // 轻微改写仍认（去标点后前缀命中）
    expect(verifyAgainstText(NOTICE_SAMPLE, '投标人须具备独立法人资格，持有有效的营业执照')).toBe(true);
    // 凭空编的整条
    expect(verifyAgainstText(NOTICE_SAMPLE, '投标人须缴纳履约保函人民币五十万元整并提供银行授信证明')).toBe(false);
  });
});

describe('投标前自检', () => {
  it('章节没正文 = 阻断', () => {
    const p = baseProject({ sections: [{ id: 's1', level: 1, title: '技术方案', state: 'todo' }] });
    const items = runComplianceCheck(p);
    expect(hasBlocker(items)).toBe(true);
    expect(items[0].stepKey).toBe('compose');
  });

  it('待补充占位 = 阻断，并列出缺什么', () => {
    const p = baseProject({
      sections: [{
        id: 's1', level: 1, title: '企业业绩', state: 'done',
        content: '我公司近三年完成【待补充：同类项目清单】等项目。',
        placeholders: ['同类项目清单'],
      }],
    });
    const items = runComplianceCheck(p);
    const gap = items.find((i) => i.id === 'placeholders');
    expect(gap?.level).toBe('blocker');
    expect(gap?.detail).toContain('同类项目清单');
  });

  it('资格不满足 = 阻断；待确认只是提醒', () => {
    const p = baseProject({
      sections: [{ id: 's1', level: 1, title: '技术方案', state: 'done', content: '正文'.repeat(50) }],
      qualifications: [
        { requirementId: 'r1', text: '需二级资质', verdict: 'unmet' },
        { requirementId: 'r2', text: '需三年业绩', verdict: 'unknown' },
      ],
    });
    const items = runComplianceCheck(p);
    expect(items.find((i) => i.id === 'qualification_unmet')?.level).toBe('blocker');
    expect(items.find((i) => i.id === 'qualification_unknown')?.level).toBe('warning');
  });

  it('必交材料没有对应章节 → 提醒', () => {
    const p = baseProject({
      sections: [{ id: 's1', level: 1, title: '技术方案', state: 'done', content: '技术路线说明。' }],
      notice: {
        requirements: [{ id: 'd1', kind: 'deliverable', text: '提供营业执照副本复印件加盖公章' }],
      },
    });
    const items = runComplianceCheck(p);
    expect(items.find((i) => i.id === 'deliverable_missing')?.level).toBe('warning');
  });

  it('有对应章节时不再提醒', () => {
    const p = baseProject({
      sections: [{
        id: 's1', level: 1, title: '营业执照及资格材料', state: 'done',
        content: '附营业执照副本复印件，已加盖公章。',
      }],
      notice: {
        requirements: [{ id: 'd1', kind: 'deliverable', text: '提供营业执照副本复印件加盖公章' }],
      },
    });
    const items = runComplianceCheck(p);
    expect(items.find((i) => i.id === 'deliverable_missing')).toBeUndefined();
    expect(items.find((i) => i.id === 'deliverable_ok')?.level).toBe('ok');
  });

  it('截止时间过了 = 阻断；解析不出来就不瞎判', () => {
    const now = Date.parse('2026-10-21T00:00:00+08:00');
    expect(deadlinePassed('2026年10月20日 09:30', now)).toBe(true);
    expect(deadlinePassed('2026年10月22日 09:30', now)).toBe(false);
    expect(deadlinePassed('详见招标文件', now)).toBeNull();
  });

  it('全部就绪时没有阻断项', () => {
    const p = baseProject({
      sections: [{ id: 's1', level: 1, title: '技术方案', state: 'done', content: '正文内容。'.repeat(20), placeholders: [] }],
      notice: { requirements: [], bidDeadline: '2099年12月31日 17:00' },
      company: [{ key: 'company_name', label: '公司名称', value: '某某科技', from: 'knowledge' }],
    });
    expect(hasBlocker(runComplianceCheck(p))).toBe(false);
  });

  it('占位与字数统计（中英混排）', () => {
    expect(collectPlaceholders('见【待补充：资质编号】与【待补充：资质编号】')).toEqual(['资质编号']);
    // 模型自创的占位也要算（实测 DeepSeek 写过「统一社会信用代码：【USCC_1】」）
    const mixed = collectPlaceholders('统一社会信用代码：【USCC_1】，公司名称：{{company}}，另见【待补充：业绩清单】');
    expect(mixed).toContain('业绩清单');
    expect(mixed.some((p) => p.includes('USCC_1'))).toBe(true);
    expect(mixed.some((p) => p.includes('company'))).toBe(true);
    // 正常正文不能被当成占位
    expect(collectPlaceholders('本项目工期 90 日历天，质保期 3 年。')).toEqual([]);
    expect(countWords('三年 ISO 9001 认证')).toBe(2 + 2 + 2); // 中文 4 字 + ISO + 9001
  });
});

describe('章节编号', () => {
  it('一级中文序号，二三级按点号递进', () => {
    const numbered = numberSections([
      { id: 'a', level: 1, title: '商务', state: 'todo' },
      { id: 'b', level: 2, title: '报价', state: 'todo' },
      { id: 'c', level: 3, title: '税费', state: 'todo' },
      { id: 'd', level: 1, title: '技术', state: 'todo' },
    ]);
    expect(numbered.map((s) => s.label)).toEqual(['一、', '1.1 ', '1.1.1 ', '二、']);
  });
});

describe('模型回复的两道检查', () => {
  it('通道把错误当正文返回时要认出来（实测：key 失效时正文是 ⚠️ 开头那段）', () => {
    expect(isChannelErrorReply('⚠️ 大模型 API Key 无效或未配置。\n请在设置中配置正确的大模型 API Key 后重试。')).toBe(true);
    expect(isChannelErrorReply('  ⚠ 上游 402：组织余额不足')).toBe(true);
    expect(isChannelErrorReply('Your API Key is invalid, please configure it.')).toBe(true);
  });

  it('正常正文不能被误判成错误', () => {
    expect(isChannelErrorReply('一、技术方案\n本项目采用……')).toBe(false);
    expect(isChannelErrorReply('')).toBe(false);
    // 正文里提到 API Key 是正常的（技术方案里会写接口鉴权），不能一碰到就判错
    const body = '本系统对外接口采用 API Key 鉴权，密钥由甲方统一分发，'.repeat(6);
    expect(isChannelErrorReply(body)).toBe(false);
  });

  it('JSON 容忍代码围栏与前后废话', () => {
    expect(parseJsonLoose('```json\n{"requirements":[]}\n```')).toEqual({ requirements: [] });
    expect(parseJsonLoose('好的，结果如下：{"checks":[{"verdict":"met"}]} 以上。')).toEqual({ checks: [{ verdict: 'met' }] });
    expect(() => parseJsonLoose('完全不是 JSON')).toThrow();
  });
});

describe('按目标检索招标公告', () => {
  it('项目名原样当关键词，只去掉「…建设项目」这类到处都一样的尾巴', () => {
    const kw = deriveKeywords('某某市智慧园区平台建设项目', '以成熟案例与本地化运维团队取胜', ['技术方案领先']);
    // 「智慧园区」必须整着留（分词会切成「智慧」「园区」，拆开搜命中一堆不相干的）
    expect(kw).toBe('某某市智慧园区平台');
    expect(kw).not.toContain('建设项目');
  });

  it('项目名太短才退回分词取词', () => {
    const kw = deriveKeywords('园区', '智慧园区运维服务与安防改造', []);
    expect(kw).toContain('园区');
    expect(kw).not.toContain('服务'); // 停用词
  });

  it('项目名和目标都空时退回侧重标签', () => {
    expect(deriveKeywords('', '', ['价格有竞争力', '技术方案领先'])).toBe('价格有竞争力 技术方案领先');
  });

  it('检索式 = 关键词 × 公告词，不限定平台（限定会漏掉省市平台）', () => {
    const qs = buildQueries('智慧园区 杭州');
    expect(qs.length).toBeGreaterThanOrEqual(3);
    expect(qs[0]).toBe('智慧园区 杭州 招标公告');
    expect(qs.some((q) => q.includes('site:'))).toBe(false);
  });

  it('首页 / 栏目页判得出来（截图里那种 zcygov.cn 首页正是这类）', () => {
    expect(looksLikeListingUrl('https://www.zcygov.cn')).toBe(true);
    expect(looksLikeListingUrl('https://www.ccgp.gov.cn/index.htm')).toBe(true);
    expect(looksLikeListingUrl('http://www.ccgp.gov.cn/cggg/dfgg/gkzb/202609/t20260918_23456789.htm')).toBe(false);
  });

  it('只留像公告详情页的结果：首页丢掉、软文丢掉、平台加分', () => {
    const hits = rankHits([
      { title: '政采云 - 首页', url: 'https://www.zcygov.cn' },
      { title: '某某市智慧园区平台建设项目招标公告', url: 'http://www.ccgp.gov.cn/cggg/dfgg/202609/t20260918_1234567.htm', snippet: '智慧园区 预算 860 万元' },
      { title: '智慧园区行业观察：市场规模持续扩大', url: 'https://news.example.com/article/20260918001.html' },
      { title: '智慧园区平台采购项目竞争性磋商公告', url: 'https://www.example-zfcg.gov.cn/notice/98765432.html' },
    ], '智慧园区 平台');
    const urls = hits.map((h) => h.url);
    expect(urls).toContain('http://www.ccgp.gov.cn/cggg/dfgg/202609/t20260918_1234567.htm');
    expect(urls).toContain('https://www.example-zfcg.gov.cn/notice/98765432.html');
    expect(urls).not.toContain('https://www.zcygov.cn');            // 首页
    expect(urls).not.toContain('https://news.example.com/article/20260918001.html'); // 新闻软文
    // 政府采购网那条关键词命中更多 + 在已知平台上，应排第一
    expect(hits[0].url).toContain('ccgp.gov.cn');
    expect(hits[0].source).toBe('中国政府采购网');
  });

  it('同一网址只留一条', () => {
    const url = 'http://www.ccgp.gov.cn/cggg/dfgg/202609/t20260918_1234567.htm';
    const hits = rankHits([
      { title: '某某项目招标公告', url },
      { title: '某某项目招标公告（重复）', url },
    ], '某某');
    expect(hits).toHaveLength(1);
  });
});

/**
 * 2026-09-20 用户实测：采购人 / 代理机构 / 截止时间 / 开标时间 / 联系方式全抓成了正文句子。
 * 这段样本把当时踩到的五个坑逐字复刻（标签词出现在正文中间、小标题「开标时间和地点」、
 * 金额带千分位），断言「宁可留空也不要填错」。
 */
const TRAP_NOTICE = [
  '网络安全态势感知产品软件开发服务采购项目',
  '一、项目基本情况',
  '招标编号：2025-CICDINFBY-F1001',
  '采购人：中国信息通信研究院',
  '代理机构：北京某某招标有限责任公司',
  '预算金额：人民币750,000.00元',
  '',
  '二、申请人资格要求',
  '1. 供应商须具备为采购人提供网络安全态势感知产品软件开发服务的能力；',
  '2. 供应商应提供投标截止时间日前6个月内任意1个月依法缴纳税收和社保的证明材料；',
  '3. 供应商须于投标截止时间当天在信用中国网站及中国政府采购网查询并提供截图；',
  '4. 获取招标文件方式：向供应商邮箱发送招标文件电子版。',
  '',
  '三、开标时间和地点',
  '（一）提交投标文件时间：2025年10月20日 09:30',
  '（二）开标时间：2025年10月20日 09:30',
  '（三）开标地点：北京市海淀区某某路 1 号',
  '',
  '四、联系方式',
  '项目联系人：张工   联系电话：010-62300000',
].join('\n');

describe('公告字段抽取：标签出现在正文里也不能抓错', () => {
  const facts = extractNoticeFacts(TRAP_NOTICE);

  it('采购人 / 代理机构取的是机构名，不是「提供网络安全…」这种正文', () => {
    expect(facts.buyer).toBe('中国信息通信研究院');
    expect(facts.agency).toBe('北京某某招标有限责任公司');
  });

  it('截止时间必须是时间，不是「日前6个月内任意1个月…」', () => {
    expect(facts.bidDeadline).toContain('2025年10月20日');
    expect(facts.bidDeadline).not.toContain('6个月');
  });

  it('开标时间不被小标题「开标时间和地点」带偏', () => {
    expect(facts.openAt).toContain('2025年10月20日');
    expect(facts.openAt).not.toContain('地点');
  });

  it('联系方式要有电话，不是「向供应商邮箱发送招标文件电子版」', () => {
    expect(facts.contact).toMatch(/\d{3,4}-?\d{7,8}|1[3-9]\d{9}/);
  });

  it('金额带千分位要取全，不被逗号截断', () => {
    expect(facts.budget).toBe('人民币750,000.00元');
  });

  it('编号取到，且不含整句中文', () => {
    expect(facts.projectCode).toBe('2025-CICDINFBY-F1001');
  });

  it('公告里压根没有的字段留空，不硬填', () => {
    expect(facts.deposit).toBeUndefined(); // 这份公告没写保证金
  });
});

/**
 * 网页直出的公告：整篇**没有换行**，用全角空格「　　」当段落分隔（用户 2026-09-20 实测的那份
 * 南方网公告就是这样）。不还原结构的话：字段全在正文句子里撞标签、逐条要求一条都切不出来（实测 0 条）。
 * 这里按那份公告的真实形态复刻关键片段。
 */
const WEB_NOTICE = [
  '　　中通服咨询设计研究院有限公司受广东南方网络信息科技有限公司的委托，采用公开招标方式组织采购软件开发服务项目。',
  '　　一、项目基本情况：　　1、项目编号：2025-CICDINFBY-F1001；　　2、项目名称：软件开发服务项目；',
  '　　4、预算金额：人民币750,000.00元；',
  '　　二、采购需求：　　本项目拟通过公开招标的方式选定一家中标人，为采购人提供网络安全态势感知产品软件开发服务。',
  '　　三、投标供应商的资格要求：　　（一）具有独立承担民事责任的能力。',
  '　　（二）有依法缴纳税收和社会保障资金的良好记录。【提供投标截止日前6个月内任意1个月依法缴纳税收和社会保障资金的相关材料。】',
  '　　五、递交投标文件截止时间、开标时间和地点　　（一）提交投标文件时间：2025年4月1日9时30分至10时00分（北京时间）。',
  '　　（二）提交投标文件截止时间/开标时间：2025年4月1日10时00分（北京时间）',
  '　　（六）开标地点：本项目采用线上/线下开标方式。',
  '　　七、对本次招标提出询问，请按以下方式联系。　　（一）采购人信息　　名称：广东南方网络信息科技有限公司　　地址：广州市越秀区广州大道中289号　　联系人：贾小姐　　联系方式：020-83002023',
  '　　（二）采购代理机构信息　　名称：中通服咨询设计研究院有限公司　　地址：广州市林和西横路219号康富来大厦5楼',
].join('');

describe('网页直出公告（整篇无换行）', () => {
  it('先把结构还原成行，否则什么都切不出来', () => {
    const lines = normalizeNoticeText(WEB_NOTICE).split('\n');
    expect(lines.length).toBeGreaterThan(10);
    expect(lines.some((l) => l.startsWith('（二）提交投标文件截止时间'))).toBe(true);
  });

  it('机构名从「采购人信息 / 采购代理机构信息」块里的「名称」取', () => {
    const f = extractNoticeFacts(WEB_NOTICE);
    expect(f.buyer).toBe('广东南方网络信息科技有限公司');
    expect(f.agency).toBe('中通服咨询设计研究院有限公司');
  });

  it('截止时间取「截止时间」那条，不是上一行的递交时间段', () => {
    const f = extractNoticeFacts(WEB_NOTICE);
    // （一）是 9时30分至10时00分的递交时间段；（二）才是截止点
    expect(f.bidDeadline).toBe('2025年4月1日10时00分（北京时间）');
    expect(f.openAt).toBe('2025年4月1日10时00分（北京时间）');
  });

  it('金额带千分位取全；联系方式取到电话', () => {
    const f = extractNoticeFacts(WEB_NOTICE);
    expect(f.budget).toBe('人民币750,000.00元');
    expect(f.contact).toContain('020-83002023');
  });

  it('逐条要求能切出来（还原前是 0 条）', () => {
    const reqs = extractRequirementsByRules(WEB_NOTICE, '公告');
    expect(reqs.length).toBeGreaterThan(0);
    expect(reqs.some((r) => r.kind === 'qualification')).toBe(true);
  });
});

describe('资格条款分类：哪些能自动判满足', () => {
  it('政府采购法第二十二条那类 = 声明类（承诺即满足）', () => {
    for (const t of [
      '具有独立承担民事责任的能力。',
      '具有良好的商业信誉和健全的财务会计制度。',
      '履行合同所必需的设备和专业技术能力。',
      '参加采购活动前3年内，在经营活动中没有重大违法记录。',
      '单位负责人为同一人或者存在直接控股、管理关系的不同供应商，不得同时参加本采购项目投标。',
      '本项目不接受联合体投标，不允许转包、违法分包。',
      '具备开具增值税专用发票的能力。',
    ]) {
      expect(qualificationKind(t), t).toBe('declaration');
    }
  });

  it('要资质 / 业绩 / 凭证的 = 证明类（不许自动判满足）', () => {
    for (const t of [
      '投标人须具备信息系统集成及服务资质二级及以上；',
      '近三年内承担过不少于 2 个同类项目，并提供合同复印件；',
      '提供投标截止日前6个月内任意1个月依法缴纳税收和社会保障资金的相关材料。',
      '具备 ISO9001 质量管理体系认证证书。',
      '注册资金不低于人民币 500 万元。',
    ]) {
      expect(qualificationKind(t), t).toBe('evidence');
    }
  });

  it('定义句不进资格清单（「重大违法记录，是指…」）', () => {
    const text = [
      '三、投标供应商的资格要求：',
      '（一）参加采购活动前3年内，在经营活动中没有重大违法记录。',
      '（二）重大违法记录，是指供应商因违法经营受到刑事处罚或者责令停产停业、吊销许可证或者执照、较大数额罚款等行政处罚。',
    ].join('\n');
    const reqs = extractRequirementsByRules(text, '公告').filter((r) => r.kind === 'qualification');
    expect(reqs.some((r) => r.text.includes('没有重大违法记录'))).toBe(true);
    expect(reqs.some((r) => r.text.includes('是指供应商因违法经营'))).toBe(false);
  });
});

describe('自检：人工确认后不再阻断', () => {
  const base = () => baseProject({
    sections: [{ id: 's1', level: 1, title: '技术方案', state: 'done', content: '正文内容。'.repeat(20), placeholders: [] }],
    notice: { requirements: [], bidDeadline: '2025年4月1日10时00分' },   // 早就过期的演示公告
  });

  it('截止时间已过默认是阻断', () => {
    const items = runComplianceCheck(base(), Date.parse('2026-09-20T10:00:00+08:00'));
    const deadline = items.find((i) => i.id === 'deadline_passed');
    expect(deadline?.level).toBe('blocker');
    expect(hasBlocker(items)).toBe(true);
  });

  it('人工确认后显示「通过」，导出不再被挡；自检表里仍然列着并注明', () => {
    const p = base();
    p.complianceAcks = ['deadline_passed'];
    const items = runComplianceCheck(p, Date.parse('2026-09-20T10:00:00+08:00'));
    const deadline = items.find((i) => i.id === 'deadline_passed');
    // 人看过并确认了就该是「通过」——显示成「提醒」等于还在提示他有事没办
    expect(deadline?.level).toBe('ok');
    expect(deadline?.detail).toContain('已人工确认');
    expect(hasBlocker(items)).toBe(false);
  });

  it('提醒类也能人工确认掉（必交材料对不上这类）', () => {
    const p = base();
    p.notice = { requirements: [{ id: 'd1', kind: 'deliverable', text: '提供某某材料复印件' }] };
    expect(runComplianceCheck(p).find((i) => i.id === 'deliverable_missing')?.level).toBe('warning');
    p.complianceAcks = ['deliverable_missing'];
    expect(runComplianceCheck(p).find((i) => i.id === 'deliverable_missing')?.level).toBe('ok');
  });

  it('纯数字的必交项（账号 / 编号）能认出正文里写过 —— 特征太少不该一刀切成未覆盖', () => {
    const p = baseProject({
      sections: [{
        id: 's1', level: 1, title: '付款信息', state: 'done',
        content: '六 付款信息：开户银行：招商银行南京分行城北支行；账号：12590209571000100000156；',
      }],
      notice: { requirements: [{ id: 'd1', kind: 'deliverable', text: '账号：12590209571000100000156' }] },
    });
    const items = runComplianceCheck(p);
    expect(items.find((i) => i.id === 'deliverable_missing')).toBeUndefined();
    expect(items.find((i) => i.id === 'deliverable_ok')?.level).toBe('ok');
  });

  it('资格全部确认为满足后，「还没确认」那条就消失', () => {
    const p = base();
    p.qualifications = [
      { requirementId: 'r1', text: '具有独立承担民事责任的能力', verdict: 'unknown' },
      { requirementId: 'r2', text: '近三年无重大违法记录', verdict: 'unknown' },
    ];
    expect(runComplianceCheck(p).find((i) => i.id === 'qualification_unknown')?.level).toBe('warning');
    p.qualifications.forEach((q) => { q.verdict = 'met'; });
    expect(runComplianceCheck(p).find((i) => i.id === 'qualification_unknown')).toBeUndefined();
  });
});
