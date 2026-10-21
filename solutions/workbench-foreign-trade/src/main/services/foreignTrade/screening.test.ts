/**
 * 交易对手名单筛查。
 *
 * 「watchman 对照」用例的期望值照抄 moov-io/watchman internal/stringscore/jaro_winkler_test.go
 * （TestJaroWinkler / TestBestPairCombinationJaroWinkler，容差同原测试 0.01），用来证明 TS 实现与 Go 版数值一致。
 * __fixtures__ 里的名单片段截自 watchman 的 testdata（官方名单原文）。
 */
import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  bestPairCombination, bestPairsJaroWinkler, buildIndex, canonicalLegalForms, normalizeName, parseCsl, parseCsv, parseEuCsv, parseUkCsv,
  parseUnXml, screenName, ScreeningLists, type ScreeningEntry,
} from './screening';

const fields = (s: string) => s.split(/\s+/).filter(Boolean);
const lrp = normalizeName; // watchman prepare.LowerAndRemovePunctuation 在这些用例上与 normalizeName 结果相同
const fx = (n: string) => readFileSync(join(__dirname, '__fixtures__', n), 'utf-8');

describe('Jaro-Winkler（watchman 对照）', () => {
  const cases: Array<[string, string, number]> = [
    ['wei, zhao', 'wei, Zhao', 0.917], ['WEI, Zhao', 'WEI, Zhao', 1.0], ['WEI Zhao', 'WEI Zhao', 1.0],
    ['wei zhao', lrp('WEI, Zhao'), 1.0],
    ['jane doe', 'jan lahore', 0.439], ['jan lahore', 'jane doe', 0.549],
    ['john doe', 'paul john', 0.624], ['john doe', 'john othername', 0.440], ['tai me', 'taim', 0.819], ['elvin', 'elvis', 0.920],
    ['jane doe', 'jane doe2', 0.940],
    ['kalamity linden', 'kala limited', 0.687], ['kala limited', 'kalamity linden', 0.687],
    ['nicolas', 'nicolas', 1.0], ['nicolas moros maduro', 'nicolas maduro', 0.958], ['nicolas maduro', 'nicolas moros maduro', 0.839],
    ['ian', 'ian mckinley', 0.429], ['iap', 'ian mckinley', 0.352], ['ian mckinley', 'ian', 0.891], ['ian mckinley', 'iap', 0.733],
    ['ian mckinley', 'tian xiang 7', 0.000],
    ['bindaree food group pty', lrp('independent insurance group ltd'), 0.269],
    ['bindaree food group pty ltd', 'independent insurance group ltd', 0.401],
    ['p.c.c. (singapore) private limited', 'culver max entertainment private limited', 0.514],
    ['zincum llc', 'easy verification inc.', 0.000], ['transpetrochart co ltd', 'jx metals trading co.', 0.431],
    ['technolab', 'moomoo technologies inc', 0.565], ['sewa security services', 'sesa - safety & environmental services australia pty ltd', 0.480],
    ['nicolas maduro', 'nicolás maduro', 0.937], ['nicolas maduro', lrp('nicolás maduro'), 1.0], ['nic maduro', 'nicolas maduro', 0.872],
    ['nick maduro', 'nicolas maduro', 0.859], ['nicolas maduroo', 'nicolas maduro', 0.966], ['maduro moros, nicolas', 'nicolas maduro', 0.953],
    ['nicolas maduro moros', 'maduro', 0.900], ['nicolas maduro moros', 'nicolás maduro', 0.898], ['nicolas, maduro moros', 'maduro', 0.897],
    ['africada financial services bureau change', 'skylight', 0.441], ['africada financial services bureau change', 'skylight financial services', 0.778],
    ['the group for the preservation of the holy sites', 'the bridgespan group', 0.715],
    ['group preservation holy sites', 'bridgespan group', 0.692], ['the group for the preservation of the holy sites', 'the group', 0.880],
    ['i c sogo kenkyusho', lrp('A.I.C. SOGO KENKYUSHO'), 0.968], [lrp('A.I.C. SOGO KENKYUSHO'), 'sogo kenkyusho', 0.972],
    [lrp('11,420.2-1 CORP.'), '11 420 2 1 corp', 1.0], [lrp('11,420.2-1 CORP.'), '11420 21 corp', 0.787],
    ['JSCARGUMENT', 'JSC ARGUMENT', 0.413], ['ARGUMENTJSC', 'JSC ARGUMENT', 0.750],
    ['ivan', 'john', 0.01], ['john smith', 'john smythe', 0.893], ['sean', 'shawn', 0.757], ['mohamed', 'muhammed', 0.849],
    ['a', 'a', 1.0], ['a', 'b', 0.0], ['', 'hello', 0.0], ['hello', '', 0.0], ['café', 'cafe', 0.8], ['123', '123', 1.0], ['123', '456', 0.0],
    ['hello world', 'hello   world', 1.0], ['very long string with many words', 'another very long string with different words', 0.725],
    ['αβγ', 'αβγ', 1.0], ['αβγ', 'abc', 0.0],
  ];
  it.each(cases)('%s ↔ %s ≈ %s', (indexed, search, want) => {
    expect(Math.abs(bestPairsJaroWinkler(fields(search), fields(indexed)) - want)).toBeLessThanOrEqual(0.01);
  });

  it.each([
    ['i c sogo kenkyusho', lrp('A.I.C. SOGO KENKYUSHO'), 0.968], [lrp('11,420.2-1 CORP.'), '11 420 21 corp', 1.0],
    [lrp('11,420.2-1 CORP.'), '114202 1 corp', 1.0], [lrp('11,420.2-1 CORP.'), '1142021 corp', 1.0],
    ['JSCARGUMENT', 'JSC ARGUMENT', 1.0], ['ARGUMENTJSC', 'JSC ARGUMENT', 0.750],
  ] as Array<[string, string, number]>)('短词合并 %s ↔ %s ≈ %s', (indexed, search, want) => {
    expect(Math.abs(bestPairCombination(fields(search), fields(indexed)) - want)).toBeLessThanOrEqual(0.01);
  });
});

describe('名称归一', () => {
  it('公司后缀全称统一成简写，拆开的 L.L.C. 拼回去', () => {
    expect(canonicalLegalForms(normalizeName('Harrowfield Bearings Limited'))).toBe('harrowfield bearings ltd');
    expect(canonicalLegalForms(normalizeName('HARROWFIELD BEARINGS LTD.'))).toBe('harrowfield bearings ltd');
    expect(canonicalLegalForms(normalizeName('Acme L.L.C.'))).toBe('acme llc');
    expect(normalizeName('Société Générale & Co.')).toBe('societe generale and co');
  });
});

const ENTRIES: ScreeningEntry[] = [
  { s: 'us_csl', l: 'CSL · SDN', n: 'AEROCARIBBEAN AIRLINES', a: ['AERO-CARIBBEAN'], t: 'Entity', c: ['CU'], p: 'CUBA', r: '36' },
  { s: 'us_csl', l: 'CSL · EL', n: 'Huawei Technologies Co., Ltd.', a: ['Huawei'], t: 'Entity', c: ['CN'] },
  { s: 'us_csl', l: 'CSL · EL', n: 'Semiconductor Manufacturing International Corporation', c: ['CN'] },
  { s: 'un', l: 'UN · DRC', n: 'BUTEMBO AIRLINES', t: 'Entity' },
  ...['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map((x): ScreeningEntry => ({ s: 'uk', l: 'UK · Russia', n: `${x} Trading Company` })),
  ...['North', 'South', 'East', 'West', 'Central'].map((x): ScreeningEntry => ({ s: 'eu', l: 'EU · RUS', n: `Global ${x} Shipping LLC` })),
];
const index = buildIndex(ENTRIES);

describe('筛查打分（85 高度疑似 / 70 待查）', () => {
  it('完全一致、去后缀一致、别名、缩写', () => {
    expect(screenName(index, 'Aerocaribbean Airlines')[0]).toMatchObject({ score: 100, level: 'high', list: 'CSL · SDN' });
    expect(screenName(index, 'HUAWEI TECHNOLOGIES COMPANY LIMITED')[0]).toMatchObject({ score: 100, level: 'high' });
    expect(screenName(index, 'Huawei Technologies')[0]).toMatchObject({ score: 95, level: 'high' });
    expect(screenName(index, 'Aero Caribbean')[0].name).toBe('AEROCARIBBEAN AIRLINES');
    expect(screenName(index, 'SMIC')[0]).toMatchObject({ name: 'Semiconductor Manufacturing International Corporation', score: 78, level: 'review' });
  });

  it('拼写差一点仍能抓到', () => {
    const m = screenName(index, 'Huawey Technologies Co Ltd')[0];
    expect(m.name).toBe('Huawei Technologies Co., Ltd.');
    expect(m.score).toBeGreaterThanOrEqual(85);
  });

  it('只靠常见行业词撑起来的相似不算命中', () => {
    expect(screenName(index, 'Completely Fictional Trading Company')).toEqual([]);
    expect(screenName(index, 'Global Industries Ltd')).toEqual([]);
    expect(screenName(index, 'Shenzhen Bright Lighting Co., Ltd.')).toEqual([]);
  });

  it('国家只做注释，不排除', () => {
    const m = screenName(index, 'Aerocaribbean Airlines', { country: 'Mexico' })[0];
    expect(m.level).toBe('high');
    expect(m.basis).toMatch(/不同/);
  });
});

describe('官方名单解析', () => {
  it('美国 CSL（CSV 片段）', () => {
    const { entries } = parseCsl(fx('csl-sample.csv'));
    expect(entries.length).toBeGreaterThan(10);
    const a = entries.find((e) => e.n === 'AEROCARIBBEAN AIRLINES')!;
    expect(a).toMatchObject({ l: 'CSL · SDN', a: ['AERO-CARIBBEAN'], p: 'CUBA' });
    expect(screenName(buildIndex(entries), 'Aero-Caribbean')[0].name).toBe('AEROCARIBBEAN AIRLINES');
  });

  it('美国 CSL（JSON）', () => {
    const { entries, version } = parseCsl(JSON.stringify({ sources_used: [{ source: 'SDN', source_last_updated: '2026-10-18T00:00:00Z' }], results: [{ name: 'ACME RUS LLC', alt_names: ['AKME'], source: 'Entity List (EL) - Bureau of Industry and Security', addresses: [{ country: 'RU' }] }] }));
    expect(version).toBe('2026-10-18T00:00:00Z');
    expect(entries[0]).toMatchObject({ n: 'ACME RUS LLC', l: 'CSL · EL', a: ['AKME'], c: ['RU'] });
  });

  it('联合国 XML（片段）', () => {
    const { entries, version } = parseUnXml(fx('un-sample.xml'));
    expect(version).toMatch(/^20\d\d-/);
    const adf = entries.find((e) => e.n === 'ADF')!;
    expect(adf.a).toContain('Allied Democratic Forces');
    expect(entries.filter((e) => e.t === 'Individual').length).toBe(3);
    expect(screenName(buildIndex(entries), 'Allied Democratic Forces')[0].name).toBe('ADF');
  });

  it('欧盟 FSF CSV（片段，分号分隔、多行合并成一个实体）', () => {
    const { entries, version } = parseEuCsv(fx('eu-sample.csv'));
    expect(version).toBe('28/10/2022');
    const saddam = entries.find((e) => e.n === 'Saddam Hussein Al-Tikriti')!;
    expect(saddam.a).toContain('Abu Ali');
    expect(new Set(entries.map((e) => e.r)).size).toBe(entries.length);
  });

  it('英国 UKSL CSV：首行报告日期、按 Unique ID 合并主名与别名', () => {
    const head = ['Last Updated', 'Unique ID', 'OFSI Group ID', 'UN Reference Number', 'Name 6', 'Name 1', 'Name 2', 'Name 3', 'Name 4', 'Name 5', 'Name type', 'Alias strength', 'Title', 'Name non-latin script', 'Non-latin script type', 'Non-latin script language', 'Regime Name', 'Designation Type'];
    const row = (id: string, n6: string, type: string) => [...['2026-10-01', id, '1', '', n6, '', '', '', '', '', type, '', '', '', '', '', 'Russia', 'Entity']];
    const csv = [['Report Date: 15-Oct-2026'], head, row('RUS0001', 'BRAVO MARINE', 'Primary Name'), row('RUS0001', 'BRAVO SHIPPING', 'Alias')]
      .map((r) => r.map((c) => (/[",]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\r\n');
    const { entries, version } = parseUkCsv(csv);
    expect(version).toBe('15-Oct-2026');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ n: 'BRAVO MARINE', a: ['BRAVO SHIPPING'], l: 'UK · Russia', t: 'Entity' });
  });

  it('CSV：引号、转义引号、引号内换行', () => {
    expect(parseCsv('a,"b ""x""",c\r\n"multi\nline",2,3\n')).toEqual([['a', 'b "x"', 'c'], ['multi\nline', '2', '3']]);
  });
});

describe('缓存与筛查日志', () => {
  it('下载失败保留上次缓存并记下原因；手动导入可用；没有任何名单时说清楚', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ft-scr-'));
    const lists = new ScreeningLists(() => dir);
    expect(() => lists.screen('X', { id: 's1' })).toThrow(/还没有下载/);
    lists.importText('us_csl', fx('csl-sample.csv'));
    const ok = lists.status().find((x) => x.id === 'us_csl')!;
    expect(ok.count).toBeGreaterThan(10);
    expect(ok.version).toMatch(/^sha256:/);
    const failing = async () => ({ ok: false, status: 503, text: async () => '', headers: { get: () => null } });
    const after = await lists.refresh(failing as any, ['us_csl']);
    const st = after.find((x) => x.id === 'us_csl')!;
    expect(st.error).toBeTruthy();
    expect(st.fetchedAt).toBe(ok.fetchedAt);
    const r = lists.screen('AEROCARIBBEAN AIRLINES', { id: 's2', context: 'test' });
    expect(r.level).toBe('high');
    expect(r.lists[0]).toMatchObject({ id: 'us_csl', version: ok.version });
    expect(r.missing).toEqual(['un', 'uk', 'eu']);
    expect(lists.screen('Nobody Real Holdings Zxq', { id: 's3' }).level).toBe('clear');
  });
});
