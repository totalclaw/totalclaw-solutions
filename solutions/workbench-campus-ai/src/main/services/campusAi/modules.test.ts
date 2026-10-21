import { describe, expect, it } from 'vitest';
import type { CaKeyItem, CaTicket } from '@totalclaw/ipc-contracts';
import { classifyDomain, domainOf } from './domains';
import { routeDept } from './qa';
import { gradeObjective, newRow, normalizeChoice, normalizeJudge, parseAnswers, parseKey, parseQuiz, clampScore } from './teaching';
import { parseOutputs, researchStats, verifyGuide } from './research';
import { cleanDocBody, docUnverifiedNumbers, hotspotReport, hotspotTemplate } from './governance';
import { listScenarios, emptyScenarioStore, usageCount } from './scenarios';
import type { StoredQa } from './store';

const table = (headers: string[], rows: string[][]) => ({ path: '', fileName: 't.xlsx', sheetName: 'S', headers, rows: rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? '']))) });

describe('领域助手', () => {
  it('按关键词分领域，没命中归综合助手', () => {
    expect(classifyDomain('食堂有没有清真窗口')).toBe('life');
    expect(classifyDomain('补考什么时候考')).toBe('academic');
    expect(classifyDomain('国家助学金怎么申请')).toBe('aid');
    expect(classifyDomain('今天天气怎么样')).toBe('general');
  });
  it('没有依据时：来源可信按来源部门，否则按领域部门，再否则待分派', () => {
    const weak = [{ kind: 'doc' as const, id: 'd', title: '新生入学指南', dept: '招生办', text: '', score: 0.13 }];
    expect(routeDept(weak, 'life', '待分派')).toBe(domainOf('life').dept);
    expect(routeDept([{ ...weak[0], score: 0.4 }], 'life', '待分派')).toBe('招生办');
    expect(routeDept(weak, 'general', '待分派')).toBe('待分派');
  });
});

describe('出题', () => {
  const chunks = [{ title: '讲义', text: '串联电路中流过各电阻的电流相等；总电压等于各电阻两端电压之和。正弦交流电的有效值等于最大值除以根号 2。' }];
  it('引文必须在资料里逐字能找到；格式不对的丢掉', () => {
    const r = parseQuiz({ questions: [
      { type: 'single', stem: '串联电路中各电阻的电流？', options: ['A. 不等', 'B. 相等', 'C. 为零', 'D. 无法判断'], answer: 'B', source: 1, quote: '串联电路中流过各电阻的电流相等' },
      { type: 'judge', stem: '有效值等于最大值除以根号2', answer: '正确', source: 1, quote: '有效值等于最大值除以根号 2' },
      { type: 'single', stem: '编造的题', options: ['a', 'b', 'c', 'd'], answer: 'A', source: 1, quote: '资料里根本没有这句话' },
      { type: 'multiple', stem: '多选只给一个答案', options: ['a', 'b', 'c', 'd'], answer: 'A', source: 1, quote: '总电压等于各电阻两端电压之和' },
      { type: 'short', stem: '说说串联电路的特点', answer: '电流相等，电压相加', points: ['电流相等', '电压相加'], score: 10, source: 1, quote: '总电压等于各电阻两端电压之和' },
    ] }, chunks);
    expect(r.questions.map((q) => q.type)).toEqual(['single', 'judge', 'short']);
    expect(r.questions[0].options[1]).toBe('相等'); // 去掉了「B.」前缀
    expect(r.questions[1].answer).toBe('T');
    expect(r.dropped).toBe(2);
  });
  it('答案归一：多选去重排序，判断题存 T / F', () => {
    expect(normalizeChoice('c, a', 4)).toBe('AC');
    expect(normalizeChoice('E', 4)).toBe('');
    expect(normalizeJudge('√')).toBe('T');
    expect(normalizeJudge('错误')).toBe('F');
    expect(normalizeJudge('也许')).toBe('');
  });
});

describe('批改', () => {
  const key: CaKeyItem[] = parseKey(table(['题号', '题型', '标准答案', '分值', '评分要点'], [
    ['1', '单选', 'B', '2', ''], ['2', '判断', '对', '2', ''], ['3', '多选', 'AC', '3', ''], ['4', '简答', '电流相等', '10', '电流相等；电压相加'],
  ])).items;
  it('读标准答案表', () => {
    expect(key.map((k) => [k.no, k.type, k.answer, k.score])).toEqual([['1', 'single', 'B', 2], ['2', 'judge', 'T', 2], ['3', 'multiple', 'AC', 3], ['4', 'short', '电流相等', 10]]);
    expect(key[3].points).toEqual(['电流相等', '电压相加']);
  });
  it('客观题按规则判分，多选须完全一致；简答待评', () => {
    expect(gradeObjective(key[0], 'b').final).toBe(2);
    expect(gradeObjective(key[1], '√').final).toBe(2);
    expect(gradeObjective(key[2], 'A').final).toBe(0);
    expect(gradeObjective(key[2], 'CA').final).toBe(3);
    const { sheets } = parseAnswers(table(['学号', '姓名', '第1题', '第2题', 'Q3', '4'], [['001', '甲', 'B', '错', 'AC', '电流相等电压相加']]), key);
    const row = newRow(sheets[0], key);
    expect(row.items.map((i) => i.final)).toEqual([2, 0, 3, null]);
    expect(row.total).toBe(5);
  });
  it('建议分钳在 0～满分，按 0.5 取整', () => {
    expect(clampScore(11, 10)).toBe(10);
    expect(clampScore(7.3, 10)).toBe(7.5);
    expect(clampScore('x', 10)).toBeNull();
  });
});

describe('科研', () => {
  it('成果统计按学院 / 类型 / 年度汇总，年份从日期里取', () => {
    const { rows } = parseOutputs(table(['成果名称', '成果类型', '所属学院', '立项日期', '经费（万元）'], [
      ['A', '纵向项目', '甲学院', '2025-03', '10'], ['B', '论文', '甲学院', '2024年', ''], ['C', '纵向项目', '乙学院', '2025/9/1', '5.5'], ['', '论文', '乙', '2025', ''],
    ]));
    expect(rows).toHaveLength(3);
    const st = researchStats(rows);
    expect(st.funding).toBe(15.5);
    expect(st.byYear.map((x) => [x.key, x.count])).toEqual([['2024', 1], ['2025', 2]]);
    expect(st.matrix.cells[st.matrix.rows.indexOf('甲学院')][st.matrix.cols.indexOf('纵向项目')]).toBe(1);
  });
  it('指南要点的引文要回原文核对，找不到的丢掉', () => {
    const text = '网上申报时间为2026年11月10日至2026年11月30日17:00。项目负责人须具有中级及以上专业技术职称。';
    const v = verifyGuide([{ deadlines: [{ text: '11 月 30 日截止', date: '2026-11-30', quote: '2026年11月10日至2026年11月30日17:00' }, { text: '编的', quote: '12月31日前提交' }], eligibility: [{ text: '中级职称', quote: '须具有中级及以上专业技术职称' }] }], text);
    expect(v.sections.deadlines).toHaveLength(1);
    expect(v.sections.eligibility).toHaveLength(1);
    expect(v.dropped).toBe(1);
  });
});

describe('校务治理', () => {
  it('公文正文里要点没有的数字列为待核对；层次序号不算', () => {
    expect(docUnverifiedNumbers('一、时间安排\n1. 11月10日前完成报名，共30人。', '11月10日前报名', '关于报名的通知')).toEqual(['30']);
  });
  it('正文开头重复的标题 / 主送机关、结尾的署名日期去掉（实测模型会写进正文）', () => {
    const body = '关于做好学业预警工作的通知\n\n各二级学院、各相关部门：\n为做好……\n特此通知。\n\n示例学院\n2026年10月21日';
    expect(cleanDocBody(body, '关于做好学业预警工作的通知', '各二级学院、各相关部门', '示例学院')).toBe('为做好……\n特此通知。');
    expect(cleanDocBody('一、工作安排\n特此通知。', '标题', '', '示例学院')).toBe('一、工作安排\n特此通知。');
  });
  it('诉求热点：领域分布、环比、部门超时、知识缺口', () => {
    const now = new Date('2026-10-21T10:00:00Z');
    const day = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
    const qa = [
      { id: '1', at: day(1), channel: 'mobile', question: '食堂有没有清真窗口', kind: 'no_evidence', domain: 'life', answer: '', sources: [], ms: 1 },
      { id: '2', at: day(2), channel: 'mobile', question: '食堂有清真窗口吗', kind: 'no_evidence', domain: 'life', answer: '', sources: [], ms: 1 },
      { id: '3', at: day(3), channel: 'desk', question: '补考什么时候', kind: 'faq', domain: 'academic', answer: '', sources: [], ms: 1 },
      { id: '4', at: day(10), channel: 'desk', question: '宿舍报修', kind: 'faq', domain: 'life', answer: '', sources: [], ms: 1 },
    ] as StoredQa[];
    const tickets = [{ id: 't', at: day(4), question: 'x', dept: '后勤处', status: 'open', sensitive: false, channel: 'mobile' }] as CaTicket[];
    const r = hotspotReport(qa, tickets, new Date(now.getTime() - 7 * 86_400_000), now, now);
    expect(r.total).toBe(3);
    expect(r.prevTotal).toBe(1);
    expect(r.byDomain[0]).toMatchObject({ id: 'life', count: 2, noEvidence: 2, prev: 1 });
    expect(r.byDept[0]).toMatchObject({ dept: '后勤处', open: 1, overdue: 1 });
    expect(r.gaps[0].count).toBe(2);
    expect(hotspotTemplate(r)).toContain('后勤处');
  });
});

describe('AI 应用中心', () => {
  it('内置场景默认已上线，用量按审计统计；自定义场景一起列出', () => {
    const now = Date.parse('2026-10-21T00:00:00Z');
    const audit = [
      { at: '2026-10-20T00:00:00Z', module: 'qa' as const, action: 'ask', ok: true },
      { at: '2026-10-19T00:00:00Z', module: 'teach' as const, action: 'quiz', ok: true },
      { at: '2026-08-01T00:00:00Z', module: 'qa' as const, action: 'ask', ok: true },
    ];
    expect(usageCount(audit, [{ module: 'qa' }], now - 30 * 86_400_000)).toBe(1);
    const st = emptyScenarioStore();
    st.overrides['teach-quiz'] = { stage: 'building' };
    st.custom.push({ id: 'c1', direction: 'research', name: '科研项目全过程管理', desc: '', dept: '科研处', stage: 'planned' });
    const list = listScenarios(st, audit, now);
    expect(list.find((x) => x.id === 'service-qa')).toMatchObject({ stage: 'live', usage30d: 1 });
    expect(list.find((x) => x.id === 'teach-quiz')).toMatchObject({ stage: 'building', usage30d: 1 });
    expect(list.find((x) => x.id === 'c1')).toMatchObject({ builtin: false, stage: 'planned' });
    expect(new Set(list.map((x) => x.direction))).toEqual(new Set(['plan', 'teach', 'research', 'gov', 'service']));
  });
});
