/** P4 演示文稿质检与刷新：跨页数字不一致、占位符与口语、缺来源；刷新保留原写法、派生数字只提示不改、写回无损。 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import AdmZip from 'adm-zip';
import { readPptx, writePptx } from '../../../pptxEditor';
import { checkDeck, planRefresh, restyle, tokens } from './office/deck';

const DIR = mkdtempSync(join(tmpdir(), 'fau-p4-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));

/** 最小 pptx：每页若干文本框，每个文本框一段一个 run */
function deck(path: string, slides: string[][]): string {
  const zip = new AdmZip();
  zip.addFile('ppt/presentation.xml', Buffer.from('<p:presentation xmlns:p="p"><p:sldSz cx="9144000" cy="5143500"/></p:presentation>'));
  slides.forEach((texts, i) => {
    const sps = texts.map((t, k) => `<p:sp><p:spPr><a:xfrm><a:off x="0" y="${k * 100000}"/><a:ext cx="100" cy="100"/></a:xfrm></p:spPr><p:txBody><a:p><a:r><a:rPr sz="1800"/><a:t>${t}</a:t></a:r></a:p></p:txBody></p:sp>`).join('');
    zip.addFile(`ppt/slides/slide${i + 1}.xml`, Buffer.from(`<p:sld xmlns:p="p" xmlns:a="a"><p:cSld><p:spTree>${sps}</p:spTree></p:cSld></p:sld>`));
  });
  writeFileSync(path, zip.toBuffer());
  return path;
}

describe('P4 演示文稿质检', () => {
  const path = deck(join(DIR, 'pitch.pptx'), [
    ['FY2025 revenue grew to $485M', 'Source: company filings'],
    ['FY2025 revenue of $512M', 'TBD: add chart', 'Margins are pretty good!'],
    ['Market share 12%', 'EBITDA $120M', 'Net income $40M'],
  ]);
  const findings = checkDeck(readPptx(path), 'pitch.pptx');
  const rules = findings.map((f) => `${f.rule}@${f.location}`);
  it('同一指标同一期间跨页不一致 → 严重', () => {
    const m = findings.find((f) => f.rule === 'number_mismatch');
    expect(m?.severity).toBe('critical');
    expect(m?.location).toBe('#1 #2');
  });
  it('占位符、口语、感叹号、有数字没来源', () => {
    expect(rules).toEqual(expect.arrayContaining(['placeholder@#2', 'casual_language@#2', 'exclamation@#2', 'missing_source@#3']));
    expect(rules).not.toContain('missing_source@#1');
  });
});

describe('P4 用新数字刷新', () => {
  it('数字识别：$485M / $485.0 million / 485MM 都是 4.85 亿；年份不算', () => {
    expect(tokens('$485M').map((t) => t.value)).toEqual([485e6]);
    expect(tokens('$485.0 million').map((t) => t.value)).toEqual([485e6]);
    expect(tokens('485MM in FY2025').map((t) => t.value)).toEqual([485e6]);
    expect(restyle(tokens('$485.0 million')[0], 512e6)).toBe('$512.0 million');
    expect(restyle(tokens('485MM')[0], 512e6)).toBe('512MM');
  });
  it('所有写法都换、原写法保留；同页百分比只提示；另存的文件读回来是新值', () => {
    const src = deck(join(DIR, 'refresh.pptx'), [['Revenue grew to $485M', '+15% YoY'], ['$485.0 million in FY2025 revenue'], ['EBITDA $120M']]);
    const doc = readPptx(src);
    const plan = planRefresh(doc, [{ from: '$485M', to: '$512M' }]);
    expect(plan.changes.map((c) => `${c.slide}:${c.before}→${c.after}`)).toEqual(['1:$485M→$512M', '2:$485.0 million→$512.0 million']);
    expect(plan.flagged.map((f) => f.slide)).toEqual([1]);
    const out = join(DIR, 'refreshed.pptx');
    writeFileSync(out, writePptx(src, plan.patches));
    const texts = readPptx(out).slides.flatMap((s) => s.shapes.flatMap((sh) => sh.runs.map((r) => r.text)));
    expect(texts).toEqual(['Revenue grew to $512M', '+15% YoY', '$512.0 million in FY2025 revenue', 'EBITDA $120M']);
  });
});
