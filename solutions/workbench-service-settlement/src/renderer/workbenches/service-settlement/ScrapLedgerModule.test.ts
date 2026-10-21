// @vitest-environment happy-dom
/**
 * 模块三界面（报废台账 8.21）审查修复的护栏 —— 主进程逻辑在 scrapTemplate.test.ts，这里只守界面编排：
 *   P1-1 文件名含「鉴定」却拖进条码框（或反之）→ 自动归到正确的框；
 *   P1-2 文件一进来就 dryRun 预识别，认不出供应商 / 流程号给输入框，填的值传给生成；
 *   P2-9 「选流程文件夹」往下钻两层，「对照」文件直接当对照表载入；
 *   P3-13 生成后再加文件：四步全回 todo，粘性进度条也回到第 1 步；
 *   P3-14 对照表加载失败落在第 2 步卡片上（steps.fail），不只 toast。
 * IPC 全部打桩，不碰真文件。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ScrapLedgerModule from './ScrapLedgerModule.vue';
import FileDropField from './FileDropField.vue';
import TableMapping from './TableMapping.vue';
import StepCard from './StepCard.vue';
import StickyProgress from './StickyProgress.vue';

const i18nStub = {
  install: (app: any) => {
    app.config.globalProperties.$t = (s: string, p?: Record<string, unknown>) =>
      p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s;
  },
};

const OEM = '/data/OEM报废/FYSQ026080001005/2026年7月10日退奥荣鉴定表（115台）.xlsx';
const BC = '/data/拆零报废/FYSQ026070001392/报废条码(368).xls';
const LOOSE_BC = '/downloads/报废条码(12).xls';
const LOOKUP = '/data/渠道匹配对照表.xlsx';

function inspectResponse(req: any) {
  const src = (kind: 'oem' | 'barcode', p: string) => {
    const name = p.split('/').pop() || p;
    const dirName = p.split('/').slice(-2, -1)[0] || '';
    const processNo = (req.processNoByFile?.[p] || '').trim() || (/^[A-Z]{2,6}\d{6,}$/.test(dirName) ? dirName : '');
    const supplier = kind === 'oem' ? ((req.supplierByFile?.[p] || '').trim() || (name.match(/退(.+?)鉴定/)?.[1] ?? '')) : undefined;
    return { kind, path: p, fileName: name, sheets: ['汇总'], processNo, supplier, units: 10, kept: 4 };
  };
  return { dryRun: true, sources: [...req.oemFiles.map((p: string) => src('oem', p)), ...req.barcodeFiles.map((p: string) => src('barcode', p))], warnings: [] };
}
const buildResponse = {
  outputPath: '/out/报废台账-2026-09-03-0905.xlsx', summaryPath: '/out/汇总.xlsx', outputDir: '/out',
  headers: ['条形码'], preview: [], warnings: [], sources: [],
  counts: { oemFiles: 1, barcodeFiles: 1, oemUnits: 10, oemKept: 4, oemDroppedSupplier: 1, oemDroppedRepairable: 5, barcodeUnits: 10, total: 14, totalUnits: 14, matched: 14, unmatched: 0, blankBarcode: 0, categoryInferred: 0, lookupRows: 20, lookupDuplicates: 0, duplicateBarcodes: 0 },
  aggregate: { rows: [{ channel: '新零售', category: '灶具', count: 14, amount: 14 }], channelTotals: [{ channel: '新零售', count: 14, amount: 14 }], total: { count: 14, amount: 14 }, blankChannelRows: 0 },
  aggregateAmount: null, summaryHeaders: ['渠道', '品类', '记录数', '台数'], summary: [['合计', '', 14, 14]], pivot: { headers: ['渠道', '合计'], rows: [['合计', 14]] },
  unmatched: [], templateUsed: false, startDate: '',
};
const lookupTable = { path: LOOKUP, fileName: '渠道匹配对照表.xlsx', sheetName: 'Sheet1', sheetNames: ['Sheet1'], headers: ['条形码', '渠道', '产品类型'], rowCount: 20, preview: [], mapping: { barcode: '条形码', channel: '渠道', category: '产品类型' } };

let ss: Record<string, ReturnType<typeof vi.fn>>;
let w: VueWrapper<any>;

beforeEach(() => {
  vi.useFakeTimers();
  setActivePinia(createPinia());
  ss = {
    scrapLedgerBuild: vi.fn(async (req: any) => (req.dryRun ? inspectResponse(req) : buildResponse)),
    inspectTable: vi.fn(async (req: any) => ({ ...lookupTable, path: req.path, fileName: req.path.split('/').pop(), sheetName: req.sheetName || 'Sheet1', mapping: { ...lookupTable.mapping } })),
    pickFolder: vi.fn(async () => ({ path: '/data' })),
    listFolderFiles: vi.fn(async () => ({ files: [LOOKUP, '/data/报废台账模板.xlsx', OEM, BC, '/data/OEM报废/FYSQ026080001005/不可维修品牌方责任.xls'] })),
    pickFiles: vi.fn(async () => ({ paths: [] })),
  };
  (window as any).electronAPI = { workbenches: { serviceSettlement: ss }, solution: { openPath: vi.fn() } };
  w = mount(ScrapLedgerModule, { props: { state: {} }, global: { plugins: [i18nStub] } });
});
afterEach(() => { w.unmount(); vi.useRealTimers(); });

/** 等 250ms 防抖 + IPC promise */
async function settle(): Promise<void> {
  await vi.advanceTimersByTimeAsync(300);
  await flushPromises();
}
/** 四个拖拽框的顺序：0 鉴定表 / 1 报废条码 / 2 台账模板 / 3 渠道对照表（与 e2e demo 里 drops.nth(n) 同序） */
const drops = () => w.findAllComponents(FileDropField);
const LOOKUP_DROP = 3;
const filesOf = (i: number) => ((drops()[i]!.props('files') ?? []) as { path: string }[]).map((f) => f.path);
const cards = () => w.findAllComponents(StepCard);
const sourceRow = (i: number) => w.findAll('[data-testid="scrap-sources"] tbody tr')[i]!;
const currentKey = () => w.findComponent(StickyProgress).props('currentKey') as string;
const stateOf = (i: number) => (cards()[i]!.props('runtime') as { state: string }).state;
// 共享步骤条（WorkbenchStepBar）的步骤按钮文字就是步骤标题（如「生成报废台账」），按文字找动作按钮时要把它排除
const button = (text: string) => w.findAll('button').find((b) => !b.classes().some((c) => c.startsWith('wsb-')) && b.text().includes(text))!;
const dryRuns = () => ss.scrapLedgerBuild.mock.calls.filter(([r]) => r.dryRun);

async function runToBuilt(): Promise<void> {
  drops()[0]!.vm.$emit('picked', [OEM]);
  drops()[1]!.vm.$emit('picked', [BC]);
  await settle();
  await button('文件都齐了').trigger('click');
  drops()[LOOKUP_DROP]!.vm.$emit('picked', [LOOKUP]);
  await flushPromises();
  await button('对照表没问题').trigger('click');
  await button('生成报废台账').trigger('click');
  await flushPromises();
}

describe('P1-1 放错框按文件名归正', () => {
  it('「鉴定表」拖进报废条码框 → 进鉴定表框；「条码」拖进鉴定表框 → 进条码框；「对照表」拖进任一框 → 当对照表载入', async () => {
    drops()[1]!.vm.$emit('picked', [OEM]);
    drops()[0]!.vm.$emit('picked', [BC, LOOKUP]);
    await settle();
    expect(filesOf(0)).toEqual([OEM]);
    expect(filesOf(1)).toEqual([BC]);
    expect(ss.inspectTable).toHaveBeenCalledWith(expect.objectContaining({ path: LOOKUP }));
    const last = dryRuns().at(-1)![0];
    expect(last).toMatchObject({ oemFiles: [OEM], barcodeFiles: [BC], dryRun: true });
  });
});

describe('P1-2 来源预识别与补填', () => {
  it('文件一进来就 dryRun；认出的显示在表里，认不出的给输入框并标「待补填」', async () => {
    drops()[0]!.vm.$emit('picked', [OEM]);
    drops()[1]!.vm.$emit('picked', [LOOSE_BC]);
    await settle();
    expect(dryRuns()).toHaveLength(1);
    expect(w.findAll('[data-testid="scrap-sources"] tbody tr')).toHaveLength(2);
    expect(sourceRow(0).find('input[data-role="supplier"]').element.getAttribute('value')).toBe('奥荣');
    expect(sourceRow(0).find('input[data-role="process-no"]').element.getAttribute('value')).toBe('FYSQ026080001005');
    expect(sourceRow(0).text()).toContain('已识别');
    // 浏览器下载记录里的条码表不在流程号目录：流程号空 → 输入框标 missing、状态待补填
    const pn = sourceRow(1).find('input[data-role="process-no"]');
    expect(pn.element.getAttribute('value')).toBe('');
    expect(pn.classes()).toContain('missing');
    expect(sourceRow(1).text()).toContain('待补填');
    expect(sourceRow(1).find('input[data-role="supplier"]').exists()).toBe(false); // 拆零固定「自制」
  });

  it('补填流程号 → 重新预识别带上 processNoByFile；生成台账时 supplierByFile / processNoByFile / includeReason 一起传下去', async () => {
    drops()[0]!.vm.$emit('picked', [OEM]);
    drops()[1]!.vm.$emit('picked', [LOOSE_BC]);
    await settle();
    const pn = sourceRow(1).find('input[data-role="process-no"]');
    await pn.setValue('FYSQ026070009999');
    await settle();
    expect(dryRuns().at(-1)![0].processNoByFile).toEqual({ [LOOSE_BC]: 'FYSQ026070009999' });
    expect(sourceRow(1).text()).toContain('已识别');
    const sup = sourceRow(0).find('input[data-role="supplier"]');
    await sup.setValue('奥荣科技');
    await settle();
    await w.find('input[type="checkbox"]').setValue(true);
    await button('文件都齐了').trigger('click');
    expect((cards()[0]!.props('runtime') as any).summary).toContain('手工补填 2 份');
    drops()[LOOKUP_DROP]!.vm.$emit('picked', [LOOKUP]);
    await flushPromises();
    await button('对照表没问题').trigger('click');
    await button('生成报废台账').trigger('click');
    await flushPromises();
    const build = ss.scrapLedgerBuild.mock.calls.find(([r]) => !r.dryRun)![0];
    expect(build).toMatchObject({
      oemFiles: [OEM], barcodeFiles: [LOOSE_BC], includeReason: true,
      supplierByFile: { [OEM]: '奥荣科技' }, processNoByFile: { [LOOSE_BC]: 'FYSQ026070009999' },
      lookups: [{ path: LOOKUP, barcodeColumn: '条形码', channelColumn: '渠道', categoryColumn: '产品类型' }],
    });
    expect(stateOf(2)).toBe('done');
  });

  it('预识别报错（放错框 / 坏文件）→ 行标红、第 1 步按钮禁用；移除后恢复', async () => {
    ss.scrapLedgerBuild.mockImplementation(async (req: any) => {
      if (!req.dryRun) return buildResponse;
      const r = inspectResponse(req);
      r.sources = r.sources.map((s: any) => (s.path === BC ? { ...s, units: 0, kept: 0, error: '「报废条码(368).xls」是 OEM 鉴定表，请放到「鉴定表」框' } : s));
      return r;
    });
    drops()[0]!.vm.$emit('picked', [OEM]);
    drops()[1]!.vm.$emit('picked', [BC]);
    await settle();
    expect(w.find('[data-testid="scrap-sources"] tbody tr.bad').exists()).toBe(true);
    expect(w.find('.ss-note.danger').text()).toContain('鉴定表');
    expect(button('文件都齐了').attributes('disabled')).toBeDefined();
    drops()[1]!.vm.$emit('remove', BC);
    await settle();
    expect(w.find('[data-testid="scrap-sources"] tbody tr.bad').exists()).toBe(false);
    expect(button('文件都齐了').attributes('disabled')).toBeUndefined();
  });
});

describe('P2-9 选流程文件夹', () => {
  it('往下钻两层列文件；「对照」直接当对照表载入、「模板」进模板框、其余按名分类', async () => {
    await button('选一个流程文件夹').trigger('click');
    await flushPromises();
    expect(ss.listFolderFiles).toHaveBeenCalledWith({ dir: '/data', depth: 2 });
    expect(ss.inspectTable).toHaveBeenCalledWith(expect.objectContaining({ path: LOOKUP }));
    expect(filesOf(0)).toEqual([OEM]);
    expect(filesOf(1)).toEqual([BC]);
    expect(filesOf(2)).toEqual(['/data/报废台账模板.xlsx']);
    await flushPromises();
    expect(filesOf(LOOKUP_DROP)).toEqual([LOOKUP]);
  });
});

describe('P3-13 / P3-14 步骤态', () => {
  it('生成后再加文件：四步全回 todo，粘性进度条回到第 1 步', async () => {
    await runToBuilt();
    expect([stateOf(0), stateOf(1), stateOf(2)]).toEqual(['done', 'done', 'done']);
    expect(currentKey()).toBe('summary');
    drops()[1]!.vm.$emit('picked', [LOOSE_BC]);
    await settle();
    expect([stateOf(0), stateOf(1), stateOf(2), stateOf(3)]).toEqual(['todo', 'todo', 'todo', 'todo']);
    expect(currentKey()).toBe('source');
    expect(w.find('.ss-file-out').exists()).toBe(false);
  });

  it('改补填框也作废台账并回到第 1 步（供应商名变了台账就变）', async () => {
    await runToBuilt();
    const sup = sourceRow(0).find('input[data-role="supplier"]');
    await sup.setValue('别家');
    await settle();
    expect(stateOf(0)).toBe('todo');
    expect(currentKey()).toBe('source');
  });

  it('对照表加载失败 → 第 2 步卡片标失败并带原因', async () => {
    ss.inspectTable.mockRejectedValueOnce(new Error('渠道对照表没有「条形码」列'));
    drops()[LOOKUP_DROP]!.vm.$emit('picked', ['/data/坏对照表.xlsx']);
    await flushPromises();
    expect(stateOf(1)).toBe('failed');
    expect((cards()[1]!.props('runtime') as any).error).toContain('条形码');
    expect(currentKey()).toBe('lookup');
    // 换一份好的就恢复
    drops()[LOOKUP_DROP]!.vm.$emit('picked', [LOOKUP]);
    await flushPromises();
    expect(stateOf(1)).toBe('todo');
  });
});


describe('多份渠道对照表', () => {
  it('批量与追加导入保留各表，重复文件去重，全部传给生成；移除单表作废结果', async () => {
    await runToBuilt();
    const second = '/data/线上.xlsx';
    const third = '/data/其他.xlsx';
    expect(drops()[LOOKUP_DROP]!.props('multi')).toBe(true);
    drops()[LOOKUP_DROP]!.vm.$emit('picked', [second, third, LOOKUP]);
    await flushPromises();
    expect(filesOf(LOOKUP_DROP)).toEqual([LOOKUP, second, third]);
    expect(w.findAllComponents(TableMapping)).toHaveLength(3);
    expect(stateOf(2)).toBe('todo');
    await button('对照表没问题').trigger('click');
    await button('生成报废台账').trigger('click');
    await flushPromises();
    expect(ss.scrapLedgerBuild.mock.calls.at(-1)![0].lookups.map((t: any) => t.path)).toEqual([LOOKUP, second, third]);
    drops()[LOOKUP_DROP]!.vm.$emit('remove', second);
    await flushPromises();
    expect(filesOf(LOOKUP_DROP)).toEqual([LOOKUP, third]);
    expect(stateOf(2)).toBe('todo');
    expect(w.find('.ss-file-out').exists()).toBe(false);
  });

  it('每表独立切换 sheet 和映射，修改后重新确认', async () => {
    await runToBuilt();
    drops()[LOOKUP_DROP]!.vm.$emit('picked', ['/data/线上.xlsx']);
    await flushPromises();
    w.findAllComponents(TableMapping)[1]!.vm.$emit('sheet', '线上');
    await flushPromises();
    expect(w.findAllComponents(TableMapping).map((t) => t.props('table').sheetName)).toEqual(['Sheet1', '线上']);
    await button('对照表没问题').trigger('click');
    w.findAllComponents(TableMapping)[1]!.vm.$emit('update', { barcode: '', channel: '渠道' });
    await flushPromises();
    expect(stateOf(1)).toBe('todo');
    expect(button('对照表没问题').attributes('disabled')).toBeDefined();
  });
});


it('允许只含型号或店铺的对照表，并将独立映射传给生成', async () => {
  drops()[0]!.vm.$emit('picked', [OEM]);
  await settle();
  await button('文件都齐了').trigger('click');
  ss.inspectTable.mockImplementation(async (req: any) => ({
    ...lookupTable, path: req.path, headers: ['型号', '门店', '渠道'],
    mapping: { barcode: '', channel: '渠道', category: '' },
  }));
  drops()[LOOKUP_DROP]!.vm.$emit('picked', ['/data/型号店铺.xlsx']);
  await flushPromises();
  expect(button('对照表没问题').attributes('disabled')).toBeUndefined();
  await button('对照表没问题').trigger('click');
  await button('生成报废台账').trigger('click');
  await flushPromises();
  expect(ss.scrapLedgerBuild.mock.calls.at(-1)![0].lookups[0]).toMatchObject({ modelColumn: '型号', shopColumn: '门店', channelColumn: '渠道' });
});
