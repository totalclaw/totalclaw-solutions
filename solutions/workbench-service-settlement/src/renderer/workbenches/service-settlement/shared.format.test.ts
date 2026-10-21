/**
 * 结算工作台共享格式化 / 路径过滤纯函数的对抗性用例（改版移植配套）。
 *
 * 这些函数直接把主进程回来的数字、日期、错误文本渲染到步骤卡与表格里，
 * 恶意或畸形输入（NaN / Infinity / 超大数 / HTML / 时区边界 / 空拖拽）不能炸、
 * 不能把原始 HTML 当格式化结果、不能把非法文件塞进导入列表。
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  errorMessage, fmtMoney, fmtPct, fmtDate, fmtDateTime, currentPeriod,
  droppedPaths, EXCEL_RE, PDF_RE, INVOICE_RE,
} from './shared';

describe('errorMessage —— 剥 IPC 包装前缀', () => {
  it('空值 / 假值给「未知错误」，不给 undefined 字样', () => {
    for (const v of [null, undefined, '', 0, false]) {
      const out = errorMessage(v);
      expect(out).toBe('未知错误');
      expect(out).not.toMatch(/undefined|null/);
    }
  });
  it('只剥一层 Electron 远程调用前缀，业务文本原样保留（含单引号 / 冒号）', () => {
    expect(errorMessage(new Error("Error invoking remote method 'workbench:x': 文件 'a:b' 打不开")))
      .toBe("文件 'a:b' 打不开");
    expect(errorMessage("Error invoking remote method 'a': Error: 嵌套")).toBe('嵌套');
    expect(errorMessage(new Error('Error: Error: 双前缀'))).toBe('Error: 双前缀');
  });
  it('前缀写法不对（没冒号 / 不在开头）就不剥，不吞用户内容', () => {
    expect(errorMessage("Error invoking remote method 'a'")).toBe("Error invoking remote method 'a'");
    expect(errorMessage("x Error invoking remote method 'a': y")).toBe("x Error invoking remote method 'a': y");
  });
  it('非 Error 对象 / 对象无 message 走 String()，不抛', () => {
    expect(errorMessage(42)).toBe('42');
    expect(errorMessage({ code: 'E1' })).toBe('[object Object]');
    expect(errorMessage(Symbol('s'))).toBe('Symbol(s)');
    expect(errorMessage(new Error(''))).toBe('Error');
  });
  it('HTML / 控制字符原样保留（转义归模板层）', () => {
    const payload = '<img src=x onerror=alert(1)>\u0000\n';
    expect(errorMessage(new Error(payload))).toBe(payload);
  });
});

describe('fmtMoney —— 非有限数一律 "-"', () => {
  it.each([
    [NaN], [Infinity], [-Infinity], ['abc'], [undefined], [{}], [[1, 2]], ['1,000'], ['12abc'], [new Date(NaN)],
  ])('%p → "-"', (v) => {
    expect(fmtMoney(v)).toBe('-');
  });
  it('数字字符串 / 数组单元素 / 布尔按 Number() 语义转', () => {
    expect(fmtMoney('1234.5')).toBe('1,234.50');
    expect(fmtMoney(['7'])).toBe('7.00');
    expect(fmtMoney(true)).toBe('1.00');
    expect(fmtMoney('')).toBe('0.00');
    expect(fmtMoney(' 12 ')).toBe('12.00');
    // null 走 Number(null)=0 → "0.00"，与 undefined → "-" 不对称；这是现行语义，钉住（IPC JSON 缺值多为 null）
    expect(fmtMoney(null)).toBe('0.00');
  });
  it('固定两位小数，四舍五入不截断', () => {
    expect(fmtMoney(0.005)).toMatch(/^0\.0[01]$/);
    expect(fmtMoney(1.005)).toMatch(/^1\.0[01]$/);
    expect(fmtMoney(2.675)).toMatch(/^2\.6[78]$/);
    expect(fmtMoney(-0)).toMatch(/^-?0\.00$/);
    expect(fmtMoney(-1234.567)).toBe('-1,234.57');
  });
  it('极大 / 极小数不走科学计数法，也不丢分组', () => {
    const big = fmtMoney(1e21);
    expect(big).not.toMatch(/e\+/i);
    expect(big).toMatch(/^1(,000){7}\.00$/);
    expect(fmtMoney(Number.MAX_SAFE_INTEGER)).toBe('9,007,199,254,740,991.00');
    expect(fmtMoney(1e-7)).toBe('0.00');
    expect(fmtMoney(BigInt(5) as unknown)).toBe('5.00');
    // Symbol 不能 Number()，但 IPC 结构化克隆根本带不过来 Symbol，不作为输入面
  });
});

describe('fmtPct', () => {
  it('小数比例 → 百分比字符串；digits 可调；非有限数 "-"', () => {
    expect(fmtPct(0.1234)).toBe('12.34%');
    expect(fmtPct(0.1234, 0)).toBe('12%');
    expect(fmtPct(1)).toBe('100.00%');
    expect(fmtPct(-0.5)).toBe('-50.00%');
    expect(fmtPct('0.5')).toBe('50.00%');
    expect(fmtPct(NaN)).toBe('-');
    expect(fmtPct(Infinity)).toBe('-');
    expect(fmtPct('50%')).toBe('-');
  });
  it('超大比例：toFixed 在 1e21 以下不走科学计数法，到 1e21 起是 JS 自身行为', () => {
    expect(fmtPct(1e18, 0)).toBe('100000000000000000000%');
    expect(fmtPct(1e19, 0)).toMatch(/^1e\+21%$/);
  });
});

describe('fmtDate / fmtDateTime', () => {
  it('空值 → 空串', () => {
    expect(fmtDate()).toBe('');
    expect(fmtDate('')).toBe('');
    expect(fmtDateTime(undefined)).toBe('');
  });
  it('本地时间 ISO（无 Z）按本地日期 / 时分格式化，不受时区偏移影响', () => {
    expect(fmtDate('2026-03-01T12:34:56')).toBe('2026-03-01');
    expect(fmtDateTime('2026-03-01T09:05:00')).toBe('2026-03-01 09:05');
    expect(fmtDateTime('2026-12-31T23:59:59.999')).toBe('2026-12-31 23:59');
  });
  it('带时区的时间戳按本机时区换算（与 Date 一致），只认前十位日期', () => {
    const iso = '2026-06-15T16:30:00+00:00';
    const d = new Date(iso);
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(fmtDate(iso)).toBe(expected);
    expect(fmtDateTime(iso)).toBe(`${expected} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  });
  it('解析不了的字符串：fmtDate 只留前十位，fmtDateTime 原样回吐，不抛', () => {
    expect(fmtDate('not-a-date-at-all')).toBe('not-a-date');
    expect(fmtDate('<script>alert(1)</script>')).toBe('<script>al');
    expect(fmtDateTime('垃圾输入')).toBe('垃圾输入');
    expect(fmtDate('2026-13-45')).toBe('2026-13-45');
  });
  it('emoji / 代理对切片不抛（前十个 UTF-16 单元）', () => {
    const s = '😀'.repeat(8);
    expect(fmtDate(s)).toBe(s.slice(0, 10));
    expect(fmtDate(s).length).toBe(10);
  });
  it('数字时间戳字符串不是 ISO，按「解析不了」处理', () => {
    expect(fmtDate('1700000000000')).toBe('1700000000');
  });
});

describe('currentPeriod', () => {
  it('YYYY-MM，月份两位补零', () => {
    const p = currentPeriod();
    expect(p).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    const d = new Date();
    expect(p).toBe(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });
});

describe('droppedPaths —— 拖拽文件过滤', () => {
  const savedWindow = (globalThis as any).window;
  beforeEach(() => { (globalThis as any).window = {}; });
  afterEach(() => { (globalThis as any).window = savedWindow; });

  const ev = (files: any[]): DragEvent => ({ dataTransfer: { files } } as any);

  it('dataTransfer 缺失 / files 为空 → []', () => {
    expect(droppedPaths({} as any, EXCEL_RE)).toEqual([]);
    expect(droppedPaths({ dataTransfer: null } as any, EXCEL_RE)).toEqual([]);
    expect(droppedPaths(ev([]), EXCEL_RE)).toEqual([]);
  });
  it('没有 getPathForFile 时回落 file.path；缺 path 的文件被丢', () => {
    expect(droppedPaths(ev([{ path: '/a/b.xlsx' }, { name: 'c.xlsx' }, { path: '' }]), EXCEL_RE)).toEqual(['/a/b.xlsx']);
  });
  it('优先走 electronAPI.getPathForFile（Electron 32+ 没有 file.path）', () => {
    (globalThis as any).window.electronAPI = { getPathForFile: (f: any) => f.realPath ?? '' };
    expect(droppedPaths(ev([{ realPath: '/x/y.csv', path: '/should/not/use.xlsx' }, { realPath: '' }]), EXCEL_RE))
      .toEqual(['/x/y.csv']);
  });
  it('按 accept 正则过滤，大小写无关，只看后缀', () => {
    const files = [{ path: '/a/A.XLSX' }, { path: '/a/b.xls' }, { path: '/a/c.xlsm' }, { path: '/a/d.csv' },
      { path: '/a/e.pdf' }, { path: '/a/f.xlsx.exe' }, { path: '/a/xlsx' }, { path: '/a/g.xlsx ' }];
    expect(droppedPaths(ev(files), EXCEL_RE)).toEqual(['/a/A.XLSX', '/a/b.xls', '/a/c.xlsm', '/a/d.csv']);
    expect(droppedPaths(ev(files), PDF_RE)).toEqual(['/a/e.pdf']);
  });
  it('getPathForFile 返回非字符串（undefined / 对象）不抛，当无路径处理', () => {
    (globalThis as any).window.electronAPI = { getPathForFile: () => undefined };
    expect(droppedPaths(ev([{ path: '/fallback.xlsx' }]), EXCEL_RE)).toEqual([]);
  });
  it('files 是类数组（FileList 形态）也能遍历', () => {
    const list = { 0: { path: '/l/0.xlsx' }, 1: { path: '/l/1.txt' }, length: 2 };
    expect(droppedPaths(ev(list as any), EXCEL_RE)).toEqual(['/l/0.xlsx']);
  });
});

describe('后缀正则', () => {
  it('EXCEL_RE 只收 Excel/CSV；PDF_RE 只收 pdf；INVOICE_RE 收发票常见格式', () => {
    expect(EXCEL_RE.test('报表.XLSX')).toBe(true);
    expect(EXCEL_RE.test('报表.xlsx.bak')).toBe(false);
    expect(EXCEL_RE.test('报表.numbers')).toBe(false);
    expect(PDF_RE.test('发票.PDF')).toBe(true);
    expect(PDF_RE.test('发票.pdf.exe')).toBe(false);
    for (const ok of ['a.pdf', 'a.ofd', 'a.jpg', 'a.JPEG', 'a.png', 'a.xlsx', 'a.zip']) expect(INVOICE_RE.test(ok)).toBe(true);
    for (const bad of ['a.exe', 'a.docx', 'a.gif', 'a.pdf/', 'a.zip\n']) expect(INVOICE_RE.test(bad)).toBe(false);
  });
  it('正则无 g 标志，连续 test 不会因 lastIndex 漂移', () => {
    for (let i = 0; i < 5; i += 1) expect(EXCEL_RE.test('/same/file.xlsx')).toBe(true);
  });
});
