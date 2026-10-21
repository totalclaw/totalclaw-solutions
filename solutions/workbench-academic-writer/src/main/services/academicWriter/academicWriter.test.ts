/**
 * 学术写作智能体：各学术库返回的解析、跨库合并去重、引用编号重排与参考文献格式。
 */
import { describe, expect, it } from 'vitest';
import type { AwPaper } from '@totalclaw/ipc-contracts';
import { arxivQuery, invertedToText, mergePapers, parseArxiv, parseCrossref, parseEuropePmc, parsePubmedAbstracts, parsePubmedSummary, parseOpenAlex } from './sources';
import { extractCites, formatReference, renderManuscript, toBibtex, wordCount } from './citations';

const paper = (over: Partial<AwPaper>): AwPaper => ({
  id: 'x', source: 'pubmed', sourceId: '1', title: 'T', authors: [], journal: 'J', year: '2024', url: '', abstract: '', ...over,
});

describe('学术库解析', () => {
  it('PubMed：esummary 元数据 + efetch 结构化摘要', () => {
    const abs = parsePubmedAbstracts('<PubmedArticle><PMID Version="1">42771730</PMID><AbstractText Label="BACKGROUND" NlmCategory="BACKGROUND">LLMs are used.</AbstractText><AbstractText Label="AIM">To evaluate.</AbstractText></PubmedArticle>');
    expect(abs['42771730']).toBe('Background: LLMs are used.\nAim: To evaluate.');
    const list = parsePubmedSummary({ result: { uids: ['42771730'], 42771730: { title: 'Accuracy of LLMs.', authors: [{ name: 'Nasreen MK', authtype: 'Author' }], fulljournalname: 'J Dent', pubdate: '2026 Sep 1', volume: '44', issue: '5', pages: '546-552', articleids: [{ idtype: 'doi', value: '10.4103/X.1' }] } } }, abs);
    expect(list[0]).toMatchObject({ title: 'Accuracy of LLMs', year: '2026', doi: '10.4103/x.1', pages: '546-552', pmid: '42771730' });
  });

  it('Europe PMC：摘要去标签、开放获取 PDF', () => {
    const [p] = parseEuropePmc({ resultList: { result: [{ id: '1', pmid: '1', doi: '10.1/A', title: 'X', authorString: 'Erturk SM, Durmaz M.', journalInfo: { volume: '33', issue: '9', journal: { title: 'Acad Radiol' } }, pubYear: '2026', pageInfo: '1-2', abstractText: '<h4>Rationale</h4>To evaluate.', isOpenAccess: 'Y', citedByCount: '3', fullTextUrlList: { fullTextUrl: [{ documentStyle: 'pdf', availability: 'Open access', url: 'https://x/pdf' }] } }] } });
    expect(p).toMatchObject({ authors: ['Erturk SM', 'Durmaz M'], journal: 'Acad Radiol', abstract: 'Rationale\nTo evaluate.', openAccess: true, pdfUrl: 'https://x/pdf', citedBy: 3 });
  });

  it('arXiv / Crossref / OpenAlex', () => {
    const [a] = parseArxiv('<feed><entry><id>http://arxiv.org/abs/2312.10793v3</id><title>Demystifying\n  Instruction Mixing</title><published>2023-12-17T00:00:00Z</published><summary>Instruction tuning ...</summary><author><name>Renxi Wang</name></author></entry></feed>');
    expect(a).toMatchObject({ arxivId: '2312.10793v3', title: 'Demystifying Instruction Mixing', year: '2023', authors: ['Renxi Wang'], pdfUrl: 'https://arxiv.org/pdf/2312.10793v3' });
    const [c] = parseCrossref({ message: { items: [{ DOI: '10.1016/J.ACRA.2024.03.028', title: ['LLM Chatbots'], author: [{ given: 'Sam', family: 'Sedaghat' }], 'container-title': ['Academic Radiology'], issued: { 'date-parts': [[2024, 10]] }, volume: '31', issue: '10', page: '4296-4297' }] } });
    expect(c).toMatchObject({ doi: '10.1016/j.acra.2024.03.028', authors: ['Sam Sedaghat'], year: '2024' });
    expect(invertedToText({ Large: [0], models: [2], language: [1] })).toBe('Large language models');
    const [o] = parseOpenAlex({ results: [{ id: 'https://openalex.org/W1', doi: 'https://doi.org/10.1148/radiol.232756', title: 'Chatbots', authorships: [{ author: { display_name: 'Rajesh Bhayana' } }], publication_year: 2024, biblio: { volume: '310', first_page: 'e232756' }, abstract_inverted_index: { Hello: [0] }, cited_by_count: 200, open_access: { is_oa: false } }] });
    expect(o).toMatchObject({ doi: '10.1148/radiol.232756', year: '2024', pages: 'e232756', citedBy: 200 });
  });

  it('arXiv 检索式按词 AND，保留引号短语，丢掉其它库的布尔写法', () => {
    expect(decodeURIComponent(arxivQuery('large language model radiology')).replace(/\+/g, ' ')).toBe('all:large AND all:language AND all:model AND all:radiology');
    expect(decodeURIComponent(arxivQuery('("deep learning" OR CNN) AND MRI')).replace(/\+/g, ' ')).toBe('all:"deep learning" AND all:CNN AND all:MRI');
  });

  it('跨库合并：同 DOI 合成一条，补齐缺的字段、记下都在哪查到', () => {
    const a = paper({ id: 'a', source: 'pubmed', doi: '10.1/x', pmid: '9', abstract: 'short', citedBy: undefined });
    const b = paper({ id: 'b', source: 'openalex', doi: '10.1/x', abstract: 'a much longer abstract', citedBy: 12, pdfUrl: 'https://oa' });
    const c = paper({ id: 'c', source: 'arxiv', title: 'Other paper' });
    const out = mergePapers([[a], [b, c]]);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ foundIn: ['pubmed', 'openalex'], abstract: 'a much longer abstract', citedBy: 12, pdfUrl: 'https://oa' });
  });

  it('排序：多库命中在前，其余按各库相关度名次交错，不按被引数', () => {
    const l1 = [paper({ id: 'a1', title: 'A1', citedBy: 1 }), paper({ id: 'a2', title: 'A2', citedBy: 1 })];
    const l2 = [paper({ id: 'b1', source: 'openalex', title: 'B1', citedBy: 9999 }), paper({ id: 'b2', source: 'openalex', title: 'B2 famous', citedBy: 50000 })];
    expect(mergePapers([l1, l2]).map((p) => p.title)).toEqual(['A1', 'B1', 'A2', 'B2 famous']);
  });
});

describe('引用与参考文献', () => {
  const lib = [
    paper({ id: '1', title: 'Alpha study', authors: ['Smith JA', 'Lee K'], journal: 'Nature', year: '2023', volume: '600', issue: '2', pages: '1-10', doi: '10.1/a' }),
    paper({ id: '2', title: 'Beta study', authors: ['John A Brown', 'Mary Chen', 'Tom Li', 'Ann Wu'], journal: 'Science', year: '2022' }),
    paper({ id: '3', source: 'arxiv', title: 'Gamma preprint', authors: ['Zhang San'], journal: 'arXiv', year: '2024', url: 'https://arxiv.org/abs/1' }),
  ];

  it('找引用：支持 [1, 3]、[1-2]，库外编号单独列出', () => {
    expect(extractCites('见 [3]。又见 [1, 3] 与 [1-2]，还有 [9]。', 3)).toEqual({ order: [3, 1, 2], bad: [9] });
  });

  it('GB/T 7714：按首次出现重编号，库外编号显示为 [?n]', () => {
    const r = renderManuscript('A [3]. B [1, 3]. C [9].', lib, 'gbt7714');
    expect(r.text).toBe('A [1]. B [2, 1]. C [?9].');
    expect(r.references[1]).toBe('[2] SMITH J A, LEE K. Alpha study[J]. Nature, 2023, 600(2): 1-10. DOI: 10.1/a.');
    expect(r.references[0]).toContain('Gamma preprint[EB/OL]. 2024. https://arxiv.org/abs/1');
    expect(formatReference(lib[1], 'gbt7714', 1)).toContain('BROWN J A, CHEN M, LI T, et al');
  });

  it('APA：文中换成（作者, 年份），参考文献按字母排', () => {
    const r = renderManuscript('A [1]. B [2].', lib, 'apa');
    expect(r.text).toBe('A (Smith & Lee, 2023). B (Brown et al., 2022).');
    expect(r.references[0].startsWith('Brown, J. A., Chen, M., Li, T., & Wu, A. (2022). Beta study.')).toBe(true);
  });

  it('BibTeX 与字数', () => {
    expect(toBibtex(lib[0])).toContain('@article{smith2023alpha');
    expect(wordCount('中文五个字 and two words')).toBe(8);
  });
});
