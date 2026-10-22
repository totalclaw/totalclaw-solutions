// 法务 / 人事工作台（workbench-legal-agent / workbench-hr-agent）：共用文件一致、zip/docx、定位、审查与筛选规则、端到端
// 示例合同与简历全部虚构（人名用「候选人甲」之类占位）。
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { SOLUTIONS_DIR } from '../tools/lib/common.mjs';

const LEGAL = join(SOLUTIONS_DIR, 'workbench-legal-agent');
const HR = join(SOLUTIONS_DIR, 'workbench-hr-agent');
const reqL = createRequire(join(LEGAL, 'src/main/index.cjs'));
const reqH = createRequire(join(HR, 'src/main/index.cjs'));
const { readZip, writeZip } = reqL('./zip.cjs');
const { docxParagraphs, locate, appearsIn, linesToParas } = reqL('./docText.cjs');
const { buildDocx, buildRevisedDocx } = reqL('./docx.cjs');
const R = reqL('./review.cjs');
const S = reqH('./screening.cjs');

const statutes = JSON.parse(readFileSync(join(LEGAL, 'resources/statutes.json'), 'utf8')).items;
const clauseTypes = JSON.parse(readFileSync(join(LEGAL, 'resources/clause-types.json'), 'utf8')).items;
const playbook = JSON.parse(readFileSync(join(LEGAL, 'resources/playbooks/sales-distribution.json'), 'utf8'));

const CONTRACT = [
  '经销合同',
  '甲方：示例电器有限公司　乙方：某某商贸有限公司',
  '第一条　乙方在华东地区独家经销甲方产品，期限三年。',
  '第二条　乙方年度最低采购额为人民币伍佰万元，未达标的按差额的 20% 向甲方支付违约金。',
  '第三条　乙方逾期付款的，每日按应付金额的千分之五支付违约金。',
  '第四条　因本合同发生的争议，由甲方所在地人民法院管辖。',
];
const paras = CONTRACT.map((text, i) => ({ i, page: null, text }));

function fakeCtx(pkgDir, idHint) {
  const dataRoot = mkdtempSync(join(tmpdir(), `${idHint}-`));
  const handlers = new Map();
  return {
    dataRoot,
    handlers,
    ctx: {
      id: idHint,
      version: '1.0.0',
      appVersion: '2.0.5',
      log: { info() {}, warn() {} },
      dataPath: (rel) => join(dataRoot, rel),
      readJson: (rel, fb) => {
        try {
          return JSON.parse(readFileSync(join(dataRoot, rel), 'utf8'));
        } catch {
          return fb;
        }
      },
      writeJson: (rel, v) => {
        mkdirSync(join(dataRoot, rel, '..'), { recursive: true });
        writeFileSync(join(dataRoot, rel), JSON.stringify(v));
      },
      packagePath: (rel) => join(pkgDir, rel),
      handle: (a, fn) => handlers.set(a, fn),
      emit: () => {},
    },
  };
}

test('共用文件在三个方案里内容一致（法务 / 人事 / 运营中心）', () => {
  const HQ = join(SOLUTIONS_DIR, 'workbench-legion-hq');
  for (const f of ['zip.cjs', 'docText.cjs', 'docx.cjs']) {
    const a = readFileSync(join(LEGAL, 'src/main', f), 'utf8');
    assert.equal(a, readFileSync(join(HR, 'src/main', f), 'utf8'), f);
    assert.equal(a, readFileSync(join(HQ, 'src/main', f), 'utf8'), f);
  }
});

test('zip 读写往返', () => {
  const buf = writeZip([{ name: 'a.txt', data: '你好' }, { name: 'd/b.bin', data: Buffer.from([1, 2, 3]) }]);
  const m = readZip(buf);
  assert.equal(m.get('a.txt').toString(), '你好');
  assert.deepEqual([...m.get('d/b.bin')], [1, 2, 3]);
  assert.throws(() => readZip(Buffer.from('not a zip at all, just text')));
});

test('docx 生成 → 解析段落往返（含表格与 XML 转义）', () => {
  const buf = buildDocx([{ text: '标题 <A&B>', style: 'title' }, { text: '正文一' }, { table: [['表头', 'x'], ['单元格', 'y']] }]);
  const ps = docxParagraphs(buf);
  assert.deepEqual(ps, ['标题 <A&B>', '正文一', '表头', 'x', '单元格', 'y']);
  const xml = readZip(buf).get('word/styles.xml').toString();
  assert.match(xml, /微软雅黑/);
});

test('原文定位：忽略空白与全半角、跨段、找不到返回 null；PDF 按行拼段', () => {
  assert.equal(locate(paras, '每日按应付金额的 千分之五').para, 4);
  assert.equal(locate(paras, '第一条 乙方在华东地区独家经销').para, 2);
  assert.equal(locate(paras, '期限三年。第二条　乙方年度最低采购额').para, 2, '跨段回到起始段');
  assert.equal(locate(paras, '乙方可随时解除本合同'), null);
  assert.deepEqual(linesToParas('第一条 甲方应\n按时付款。\n第二条 乙方应\n验收'), ['第一条 甲方应按时付款。', '第二条 乙方应验收']);
});

test('法条格式核对：中文 / 阿拉伯条号、简称、超出条数与不存在的法律丢弃', () => {
  assert.equal(R.articleNumber('第五百八十五条'), 585);
  assert.equal(R.articleNumber('第1260条'), 1260);
  assert.equal(R.articleNumber('第一千二百六十条'), 1260);
  const { kept, dropped } = R.checkLegalBasis(
    [
      { law: '民法典', article: '第五百八十五条' },
      { law: '《中华人民共和国民法典》', article: '第2000条' },
      { law: '合同违约特别法', article: '第3条' },
      { law: '劳动合同法', article: '第十九条' },
    ],
    statutes,
  );
  assert.deepEqual(kept.map((k) => `${k.law}${k.article}`), ['中华人民共和国民法典第585条', '中华人民共和国劳动合同法第19条']);
  assert.equal(dropped, 2);
});

test('审查结果校验：引用找不到的风险丢弃、缺失条款按模板算、汇总由代码算', () => {
  const clauses = R.normalizeClauses(
    { clauses: [{ clauseType: 'exclusivity', quote: '乙方在华东地区独家经销甲方产品' }, { clauseType: 'payment-terms', quote: '编造的付款条款' }, { clauseType: 'nope', quote: '期限三年' }] },
    paras,
    clauseTypes,
  );
  assert.equal(clauses.clauses.length, 1);
  assert.equal(clauses.dropped, 2);
  const rv = R.normalizeReview(
    {
      risks: [
        { clauseType: 'breach-liability', quote: '每日按应付金额的千分之五支付违约金', level: 'high', reason: '违约金过高', legalBasis: [{ law: '民法典', article: '第585条' }], action: 'replace', suggestion: '每日按应付金额的万分之五支付违约金，总额不超过合同金额的 10%。', priority: 'must' },
        { clauseType: 'exclusivity', quote: '这句话合同里没有', level: 'medium', reason: 'x', action: 'replace' },
        { clauseType: 'force-majeure', level: 'low', reason: '缺不可抗力条款', action: 'insert', suggestion: '因不可抗力不能履行的，部分或全部免除责任。' },
      ],
      missing: ['force-majeure', 'not-a-type'],
      framework: { oneSided: { answer: 'yes', note: '只约束乙方' } },
    },
    { paras, clauseTypes, statutes, playbook, clauses: clauses.clauses },
  );
  assert.equal(rv.risks.length, 2);
  assert.equal(rv.stats.droppedQuotes, 1);
  assert.equal(rv.risks[0].level, 'high');
  assert.ok(rv.missing.includes('payment-terms') && rv.missing.includes('force-majeure') && !rv.missing.includes('not-a-type'));
  assert.equal(rv.framework.exitSymmetric.answer, 'unclear');
  const s = R.summarize(rv.risks, rv.missing);
  assert.equal(s.count.high, 1);
  assert.equal(s.verdict, '建议修改后再签');
});

test('修订稿：替换写成修订痕迹 + 批注，新增成插入段落，重叠降级为批注', () => {
  const { buffer, applied, asComment } = buildRevisedDocx(paras, [
    { para: 4, quote: '每日按应付金额的千分之五', action: 'replace', suggestion: '每日按应付金额的万分之五', note: '违约金过高' },
    { para: 4, quote: '应付金额的千分之五支付', action: 'delete', note: '重叠' },
    { para: null, action: 'insert', suggestion: '第五条　不可抗力……' },
  ]);
  const files = readZip(buffer);
  const xml = files.get('word/document.xml').toString();
  assert.match(xml, /<w:del [^>]*><w:r><w:delText xml:space="preserve">每日按应付金额的千分之五<\/w:delText>/);
  assert.match(xml, /<w:ins [^>]*><w:r><w:rPr><\/w:rPr><w:t xml:space="preserve">每日按应付金额的万分之五/);
  assert.match(xml, /第五条　不可抗力/);
  assert.ok(files.get('word/comments.xml').toString().includes('违约金过高'));
  assert.equal(applied, 2);
  assert.equal(asComment, 1);
  // 修订后的正文（去掉删除的文字）仍能被解析
  assert.ok(docxParagraphs(buffer).some((p) => p.includes('万分之五')));
});

test('两版对比：增 / 删 / 改', () => {
  const b = [paras[0], paras[1], { ...paras[2], text: '第一条　乙方在华东地区非独家经销甲方产品，期限一年。' }, paras[4], { i: 9, text: '第六条　新增条款' }];
  const d = R.compareVersions(paras, b);
  assert.ok(d.some((x) => x.type === 'changed' && x.text.includes('非独家')));
  assert.ok(d.some((x) => x.type === 'removed' && x.text.startsWith('第二条')));
  assert.ok(d.some((x) => x.type === 'added' && x.text.includes('新增条款')));
});

test('法务端到端：上传示例合同 → 七步 → 导出修订稿与意见书', async () => {
  const mod = reqL('./index.cjs');
  const { ctx, handlers, dataRoot } = fakeCtx(LEGAL, 'legal');
  mod.__setLlmForTests(async (prompt) => {
    if (prompt.includes('识别基本信息')) return JSON.stringify({ contractType: 'sales-distribution', title: '经销合同', parties: [{ name: '示例电器有限公司', role: '甲方' }, { name: '编造的公司', role: '丙方' }], amount: '伍佰万元', term: '三年', focus: ['违约金'] });
    if (prompt.includes('从合同里找出')) return JSON.stringify({ clauses: [{ clauseType: 'exclusivity', quote: '乙方在华东地区独家经销甲方产品', summary: '独家' }, { clauseType: 'breach-liability', quote: '每日按应付金额的千分之五支付违约金', summary: '逾期违约金' }] });
    if (prompt.includes('逐条给出风险')) return JSON.stringify({ risks: [{ clauseType: 'breach-liability', quote: '每日按应付金额的千分之五支付违约金', level: 'high', reason: '违约金明显过高', legalBasis: [{ law: '民法典', article: '第五百八十五条' }], action: 'replace', suggestion: '每日按应付金额的万分之五支付违约金', fallback: '万分之八', priority: 'must' }], missing: [], framework: {}, overall: '建议修改违约金条款' });
    return '对方可能认为……';
  });
  await mod.activate(ctx);
  try {
    const base64 = Buffer.from(CONTRACT.join('\n\n'), 'utf8').toString('base64');
    let r = await handlers.get('review.create')({ fileName: '经销合同.txt', base64 });
    assert.equal(r.paras.length, 6);
    r = await handlers.get('review.preAnalyze')({ id: r.id });
    assert.deepEqual(r.pre.parties.map((p) => p.name), ['示例电器有限公司'], '原文没有的主体被丢弃');
    assert.equal(r.playbook.id, 'sales-distribution');
    r = await handlers.get('review.setStance')({ id: r.id, stance: { side: 'second', partyName: '某某商贸有限公司', mustKeep: '违约金不超过万分之五' } });
    await handlers.get('playbook.save')({ id: 'sales-distribution', entries: playbook.entries.slice(0, 3) });
    r = await handlers.get('review.setPlaybook')({ id: r.id, playbookId: 'sales-distribution' });
    assert.equal(handlers.get('playbooks.list')().find((b) => b.id === 'sales-distribution').versions, 1, '模板改动留版本');
    r = await handlers.get('review.extract')({ id: r.id });
    assert.equal(r.clauses.length, 2);
    r = await handlers.get('review.run')({ id: r.id });
    assert.equal(r.summary.count.high, 1);
    assert.equal(r.review.risks[0].legalBasis[0].article, '第585条');
    r = await handlers.get('review.accept')({ id: r.id, all: true });
    const ex = await handlers.get('review.exportRevised')({ id: r.id });
    assert.equal(ex.applied, 1);
    assert.ok(existsSync(ex.path));
    const op = await handlers.get('review.exportOpinion')({ id: r.id });
    assert.ok(docxParagraphs(readFileSync(op.path)).some((p) => p.includes('合同审查意见书')));
    r = await handlers.get('review.rebuttal')({ id: r.id, riskId: 'r1' });
    assert.match(r.rebuttals.r1, /对方/);
    assert.equal(handlers.get('review.list')().length, 1);
    assert.ok(readdirSync(join(dataRoot, 'legal-agent')).includes('files'));
  } finally {
    mod.__setLlmForTests(null);
  }
});

test('JD 体检：歧视性用词给出原文，必备过多提示', () => {
  const r = S.checkJd('招聘销售，限男性优先，男性优先，35岁以下，已婚已育优先，本地户口。', Array.from({ length: 9 }, () => ({ severity: 'must' })));
  assert.deepEqual([...new Set(r.issues.map((x) => x.kind))].sort(), ['婚育', '年龄', '性别', '户籍地域'].sort());
  assert.ok(r.issues.some((x) => x.text === '35岁以下'));
  assert.ok(r.warnings.some((w) => w.includes('9 条')));
  assert.deepEqual(S.normalizeWeights([{ weight: 1 }, { weight: 1 }, { weight: 1 }]).map((d) => d.weight).reduce((a, b) => a + b), 100);
});

const RESUME = '姓名：候选人甲\n电话：13800001111\n邮箱：jia@example.com\n教育：示例大学 计算机科学 本科 2018\n工作：示例科技有限公司 前端工程师 2018-2024，负责 Vue 3 组件库与性能优化，带 3 人小组。\n技能：Vue、TypeScript、Node.js';

test('简历结构化：只收原文里有的字段', () => {
  const r = S.normalizeResume({ basics: { name: '候选人甲', email: 'jia@example.com', phone: '138-0000-1111', location: '上海' }, work: [{ name: '示例科技有限公司', position: '前端工程师' }, { name: '编造的大厂', position: 'CTO' }], education: [{ institution: '示例大学', studyType: '本科' }], skills: ['Vue', 'Rust'] }, RESUME);
  assert.equal(r.basics.name, '候选人甲');
  assert.equal(r.basics.phone, '138-0000-1111', '电话按数字比对');
  assert.equal(r.basics.location, '');
  assert.deepEqual(r.work.map((w) => w.name), ['示例科技有限公司']);
  assert.deepEqual(r.skills, ['Vue']);
});

test('筛选：证据不在简历 → 未知 / 0 分；未提及不判不满足；总分与决定由代码算', () => {
  const job = { title: '前端工程师', gates: [{ id: 'g1', condition: '本科及以上', severity: 'must' }, { id: 'g2', condition: '有英语六级', severity: 'must' }, { id: 'g3', condition: '有大厂经历', severity: 'prefer' }], dims: [{ id: 'd1', name: '前端技术', weight: 60, anchors: [] }, { id: 'd2', name: '带团队', weight: 40, anchors: [] }] };
  const raw = {
    gates: [{ id: 'g1', verdict: 'met', evidence: '示例大学 计算机科学 本科' }, { id: 'g2', verdict: 'unmet', evidence: '' }, { id: 'g3', verdict: 'met', evidence: '在字节跳动工作五年' }],
    scores: [{ id: 'd1', score: 4, evidence: '负责 Vue 3 组件库与性能优化' }, { id: 'd2', score: 3, evidence: '管理 20 人团队' }],
  };
  const r = S.normalizeScreening(raw, job, RESUME);
  assert.equal(r.gates[1].verdict, 'unknown', '没有证据的「不满足」改判未知');
  assert.equal(r.gates[2].verdict, 'unknown', '证据不在简历里改判未知');
  assert.equal(r.scores[1].score, 0);
  assert.equal(r.total, 60);
  assert.equal(r.decision, 'hold', '必备条件未知 → 待定');
  assert.ok(r.flags.length >= 2);
  const r2 = S.normalizeScreening({ ...raw, gates: [{ id: 'g1', verdict: 'unmet', evidence: '大专' }] }, job, `${RESUME}\n大专`);
  assert.equal(r2.decision, 'reject');
});

test('人事端到端：建岗位 → JD → 导入 10 份虚构简历 → 解析 → 预筛 + 筛选 → 面试 / 邀约 / offer / 入职 → 导出', async () => {
  const mod = reqH('./index.cjs');
  const { ctx, handlers } = fakeCtx(HR, 'hr');
  mod.__setLlmForTests(async (prompt) => {
    if (prompt.includes('写一份 JD')) return JSON.stringify({ jd: '岗位职责：负责前端开发。任职要求：本科及以上；熟悉 Vue。我们提供：五险一金。'.repeat(3), gates: [{ condition: '本科及以上', severity: 'must' }, { condition: '熟悉 Vue', severity: 'prefer' }], dimensions: [{ name: '前端技术', weight: 70, anchors: ['无', '入门', '熟练', '精通', '专家'] }, { name: '协作', weight: 50, anchors: [] }] });
    if (prompt.includes('整理成结构化数据')) {
      const name = /姓名：(\S+)/.exec(prompt)?.[1] || '';
      return JSON.stringify({ basics: { name }, work: [], education: [], skills: [{ name: 'Vue' }] });
    }
    if (prompt.includes('评估这份简历')) return JSON.stringify({ gates: [{ id: 'g1', verdict: 'met', evidence: '本科' }, { id: 'g2', verdict: 'met', evidence: 'Vue' }], scores: [{ id: 'd1', score: 3, evidence: '熟悉 Vue' }, { id: 'd2', score: 2, evidence: '团队协作' }], highlights: ['Vue 熟练'], gaps: ['缺少大型项目'] });
    if (prompt.includes('行为面试题')) return JSON.stringify({ questions: [{ q: '讲一个你做性能优化的例子', dimension: '前端技术', lookFor: '有数据' }] });
    if (prompt.includes('面试邀约邮件')) return JSON.stringify({ subject: '面试邀请', body: '您好，面试时间【请填写】' });
    return '录用通知书正文\n\n请于【请填写】报到。';
  });
  await mod.activate(ctx);
  try {
    let j = handlers.get('job.create')({ title: '前端工程师', dept: '研发部', location: '北京' });
    j = await handlers.get('jd.generate')({ id: j.id });
    assert.equal(j.dims.reduce((n, d) => n + d.weight, 0), 100, '权重归一到 100');
    assert.deepEqual(j.jdCheck.issues, []);
    const files = Array.from({ length: 10 }, (_, i) => ({
      fileName: `候选人${i + 1}.txt`,
      base64: Buffer.from(i < 8 ? `姓名：候选人${'甲乙丙丁戊己庚辛'[i]}\n学历：本科\n熟悉 Vue，注重团队协作。` : `姓名：候选人${i}\n做过仓库管理。`).toString('base64'),
    }));
    files.push({ fileName: '坏文件.exe', base64: 'AAAA' });
    const up = await handlers.get('resume.upload')({ id: j.id, files });
    assert.equal(up.added, 10);
    assert.equal(up.failed.length, 1);
    const parsed = await handlers.get('resume.parse')({ id: j.id });
    assert.equal(parsed.job.candidates.filter((c) => c.resume).length, 10);
    const sc = await handlers.get('screen.run')({ id: j.id, keywords: ['Vue'] });
    j = sc.job;
    const pre = j.candidates.filter((c) => c.screening.prefiltered);
    assert.equal(pre.length, 2, '没命中关键词的 2 份预筛淘汰');
    const ok = j.candidates.filter((c) => !c.screening.prefiltered);
    const [w1, w2] = j.dims.map((d) => d.weight);
    assert.deepEqual([w1, w2], [59, 41], '70 / 50 归一成 59 / 41');
    assert.ok(ok.every((c) => c.screening.total === Math.round((w1 * 0.75 + w2 * 0.5) * 10) / 10));
    const c0 = ok[0];
    j = await handlers.get('interview.generate')({ id: j.id, candidateId: c0.id });
    j = handlers.get('interview.score')({ id: j.id, candidateId: c0.id, dimension: '前端技术', score: 4 });
    assert.equal(j.candidates.find((c) => c.id === c0.id).interview.total, w1);
    j = await handlers.get('invite.generate')({ id: j.id, candidateId: c0.id });
    j = await handlers.get('offer.generate')({ id: j.id, candidateId: c0.id, salary: '20k', startDate: '2026-11-01', probation: '3 个月' });
    j = handlers.get('candidate.stage')({ id: j.id, candidateId: c0.id, stage: 'onboarding' });
    j = handlers.get('onboarding.toggle')({ id: j.id, candidateId: c0.id, index: 0, done: true });
    assert.equal(j.candidates.find((c) => c.id === c0.id).onboarding[0].done, true);
    const offer = await handlers.get('offer.export')({ id: j.id, candidateId: c0.id });
    assert.ok(docxParagraphs(readFileSync(offer.path)).includes('录用通知书'));
    const csv = await handlers.get('screen.export')({ id: j.id });
    const text = readFileSync(csv.path, 'utf8');
    assert.ok(text.startsWith('﻿'));
    assert.equal(text.trim().split('\r\n').length, 11);
  } finally {
    mod.__setLlmForTests(null);
  }
});

test('appearsIn：证据核对忽略空白', () => {
  assert.ok(appearsIn(RESUME, '负责 Vue 3组件库'));
  assert.ok(!appearsIn(RESUME, 'React'));
});
