/**
 * 批次 5 产出物三语检查（第 13.5 节第 7 条）：管理报告 xlsx / docx / pdf（HTML）与董事会 pptx 在 zh / en / ar 各生成一次：
 *   表头与固定文案是 tIn 对应语言；ar / en 固定文案没有汉字（用户数据除外）；阿语 xlsx 有 RTL、docx 有 bidi、HTML dir="rtl"；
 *   pptx 从三语模板替换，全部占位符都被替换，阿语模板段落 rtl="1" 右对齐、文字 lang="ar-SA"。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import { i18nKey, tIn } from '@totalclaw/i18n';
import type { FauFpaResult, FauLocale } from '@totalclaw/ipc-contracts';
import { readPptx } from '../../pptxEditor';
import * as F from '../__fixtures__/fpa/fpa';
import { finMetrics, METRIC_LABELS } from '../engines/fpa/metrics';
import { col } from '../engines/fpa/kit';
import { OUT } from './common';
import type { OutputCtx } from './close';
import { writeFpaDocx, writeFpaPdf, writeFpaXlsx } from './fpa';
import { DECK_BULLETS, DECK_SLIDES, deckTemplate, writeDeck, type DeckContent } from './pptx';

const DIR = mkdtempSync(join(tmpdir(), 'fau-fpa-out-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));
const HAN = /[一-鿿]/;
const LOCALES: FauLocale[] = ['zh-CN', 'en-US', 'ar'];

const m = finMetrics(F.tb, 'cn').m;
const res: FauFpaResult = {
  moduleId: 'mgmt-report', period: F.PERIOD,
  tables: [{
    id: 'metrics', title: i18nKey('核心财务指标'),
    columns: [col('metric', i18nKey('指标'), 'label'), col('current', i18nKey('本期'), 'amount'), col('diffPriorPct', i18nKey('变动率'), 'pct'), col('level', i18nKey('预警'), 'level'), col('source', i18nKey('来源'))],
    rows: [{ metric: METRIC_LABELS.revenue, current: m.revenue, diffPriorPct: 0.1111, level: 'green', source: '科目余额表 #14' }, { metric: METRIC_LABELS.netProfit, current: m.netProfit, diffPriorPct: -0.1129, level: 'yellow', source: '科目余额表 #14,15' }],
  }],
  narratives: [{ id: 'overview', heading: i18nKey('业绩概述'), text: 'Revenue 500,000.00', status: 'verified' }, { id: 'outlook', heading: i18nKey('下期关注'), text: 'X 123', status: 'unverified', missing: ['123'] }],
  charts: [], alerts: [{ id: 'gross_margin_drop', level: 'yellow', message: { key: i18nKey('毛利率由 {p0} 降至 {p1}'), params: { p0: '33.33%', p1: '30.00%' } } }],
  sources: [{ datasetId: 'ds_1', label: '科目余额表-2026-09.xlsx', kind: 'tb', slot: 'tb', rows: 18, signed: true, signedBy: ['fin-analysis'] }],
  checks: [{ id: 'bs', ok: true, message: { key: i18nKey('资产 = 负债 + 所有者权益') } }],
};
const ctx = (locale: FauLocale): OutputCtx => ({
  locale, dir: join(DIR, locale), companyName: '测试集团', projectName: '2026-09 月结', period: F.PERIOD,
  moduleCode: 'D1', moduleName: i18nKey('管理报告'), modeName: i18nKey('月度管理报告编制'), standardLabel: i18nKey('企业会计准则'), model: 'fake',
});
const extra = { title: i18nKey('管理报告'), levels: ['prepare', 'approve'], reminders: [], statements: [i18nKey('材料分发由董秘或指定人员人工完成，本工作台不代发')] };
const USER = new Set(['测试集团', '2026-09 月结', '科目余额表-2026-09.xlsx', '科目余额表 #14', '科目余额表 #14,15']);

describe.each(LOCALES)('fpa 产出 · %s', (locale) => {
  it('xlsx：第一行草稿警示、表头按输出语言、阿语 RTL、Checks 页', () => {
    const p = writeFpaXlsx(ctx(locale), res, extra);
    const wb = XLSX.read(readFileSync(p), { type: 'buffer' });
    expect(!!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(locale === 'ar');
    expect(wb.SheetNames).toContain('Checks');
    const sheet = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[1]], { header: 1, defval: '' });
    expect(sheet[0][0]).toBe(tIn(locale, OUT.draft));
    expect(sheet[1]).toEqual([tIn(locale, '指标'), tIn(locale, '本期'), `${tIn(locale, '变动率')} (%)`, tIn(locale, '预警'), tIn(locale, '来源')]);
    expect(sheet[2].slice(0, 3)).toEqual([tIn(locale, METRIC_LABELS.revenue), 500000, 11.11]);
    if (locale !== 'zh-CN') {
      for (const name of wb.SheetNames) {
        for (const row of XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, defval: '' })) {
          for (const c of row) if (typeof c === 'string' && !USER.has(c)) expect(HAN.test(c), `${name}: ${c}`).toBe(false);
        }
      }
    }
  });

  it('docx + pdf（HTML）：阿语 bidi / dir=rtl，固定文案按语言，标出未核实', async () => {
    const doc = writeFpaDocx(ctx(locale), res, extra);
    const xml = new AdmZip(doc.path).readAsText('word/document.xml');
    expect(xml.includes('<w:bidi/>')).toBe(locale === 'ar');
    expect(xml.includes('<w:bidiVisual/>')).toBe(locale === 'ar');
    expect(xml).toContain(tIn(locale, i18nKey('未核实')));
    expect(new AdmZip(doc.path).readAsText('word/header1.xml')).toContain(tIn(locale, OUT.notOpinion));
    const pdf = await writeFpaPdf(ctx(locale), doc.spec, null);
    expect(pdf.html).toContain(`dir="${locale === 'ar' ? 'rtl' : 'ltr'}"`);
    if (locale !== 'zh-CN') {
      const text = xml.replace(/<[^>]+>/g, '\n').split('\n').map((s) => s.trim()).filter(Boolean);
      for (const s of text) if (![...USER].some((u) => s.includes(u))) expect(HAN.test(s), s).toBe(false);
    }
    let written = '';
    const withWriter = await writeFpaPdf(ctx(locale), doc.spec, async (path, html) => { written = html; writeFileSync(path, '%PDF-1.4'); });
    expect(withWriter.pdf).toBe(true);
    expect(existsSync(withWriter.path)).toBe(true);
    expect(written).toBe(withWriter.html);
  });

  it('pptx：从三语模板替换，全部占位符都被替换，阿语段落 rtl="1" 右对齐', () => {
    expect(deckTemplate(locale)).toBeTruthy();
    const t = (k: string) => tIn(locale, k);
    const content: DeckContent = {
      cover: { title: t(i18nKey('董事会与审计委员会材料')), subtitle: t(i18nKey('董事会材料包')), company: '测试集团', period: F.PERIOD, draft: t(OUT.draft), boundary: t(OUT.boundary) },
      footer: t(OUT.notOpinion),
      slides: Array.from({ length: DECK_SLIDES - 1 }, (_v, i) => ({ title: `${t(i18nKey('会议议程'))} ${i + 2}`, bullets: [`${t(METRIC_LABELS.revenue)}: 500,000.00`, 'B'] })),
    };
    const out = writeDeck(locale, join(DIR, locale, 'deck.pptx'), content);
    expect(out.filled).toBe(6 + (DECK_SLIDES - 1) * (1 + DECK_BULLETS + 1));
    const deck = readPptx(out.path);
    const all = deck.slides.flatMap((s) => s.shapes.flatMap((sh) => sh.runs.map((r) => r.text)));
    expect(all.some((x) => x.includes('{{'))).toBe(false);
    expect(all).toContain(t(i18nKey('董事会与审计委员会材料')));
    const slide2 = new AdmZip(out.path).readAsText('ppt/slides/slide2.xml');
    expect(slide2.includes('rtl="1"')).toBe(locale === 'ar');
    expect(slide2.includes('algn="r"')).toBe(locale === 'ar');
    expect(slide2).toContain(locale === 'ar' ? 'lang="ar-SA"' : `lang="${locale}"`);
    if (locale !== 'zh-CN') for (const s of all) if (s !== '测试集团') expect(HAN.test(s), s).toBe(false);
  });
});
