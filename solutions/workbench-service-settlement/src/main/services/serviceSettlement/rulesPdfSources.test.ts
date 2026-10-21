import { describe, it, expect } from 'vitest';
import { rulesPdfPaths, combineRuleDocuments } from './rulesPdfSources';
describe('multiple policy PDFs', () => {
  it('accepts legacy single selection and preserves deduplicated multi-file order', () => {
    expect(rulesPdfPaths({ path: '/policy/old.pdf' })).toEqual(['/policy/old.pdf']);
    expect(rulesPdfPaths({ paths: ['/policy/one.pdf', '/policy/two.pdf', '/policy/one.pdf'] })).toEqual(['/policy/one.pdf', '/policy/two.pdf']);
  });
  it('rejects empty, invalid and excessive lists', () => {
    expect(() => rulesPdfPaths({ paths: [] })).toThrow();
    expect(() => rulesPdfPaths({ paths: ['file.xlsx'] })).toThrow('PDF');
    expect(() => rulesPdfPaths({ paths: Array.from({ length: 21 }, (_, i) => `${i}.pdf`) })).toThrow('20');
  });
  it('includes full text of all documents with distinct source labels', () => {
    const result = combineRuleDocuments([{ path: '/one.pdf', text: 'A'.repeat(17000) }, { path: '/two.pdf', text: 'second policy 8%' }]);
    expect(result).toContain('A'.repeat(17000));
    expect(result).toContain('文件 2：two.pdf');
    expect(result).toContain('second policy 8%');
  });
  it('fails rather than skipping an unreadable document or truncating combined rules', () => {
    expect(() => combineRuleDocuments([{ path: '/bad.pdf', text: ' ' }])).toThrow('bad.pdf');
    expect(() => combineRuleDocuments([{ path: '/long.pdf', text: 'a'.repeat(64001) }])).toThrow('未截断');
  });
});
