/**
 * 对抗性回归：学生端答题**不许跨题互相影响**（2026-09-22 用户实测反馈）。
 *
 * 用户现象：「第一二题选择完了之后，第三题选择，第一题的选中被清掉」。
 * 这组用例真的把学生页那段内联脚本跑起来（happy-dom + 桩 fetch），
 * 一题一题点过去，再翻回去核对每题的选中态与 deck.answers，
 * 任何跨题污染都会在这里现形 —— 光读代码看不出来的那种。
 *
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QURAN_STUDENT_PAGE_HTML } from './studentPage';

/** 三道单选题（选项文字刻意不同，便于断言没串味） */
const QUESTIONS = [
  { id: 'q-1', type: 'single', dimension: 'vocab', stem: '第一题', options: ['A1', 'A2', 'A3', 'A4'] },
  { id: 'q-2', type: 'single', dimension: 'vocab', stem: '第二题', options: ['B1', 'B2', 'B3', 'B4'] },
  { id: 'q-3', type: 'single', dimension: 'vocab', stem: '第三题', options: ['C1', 'C2', 'C3', 'C4'] },
];

function installPage(questions: any[] = QUESTIONS): any {
  // 整页写进 document，再单独执行内联脚本（happy-dom 不会自动跑 innerHTML 里的 script）
  const html = QURAN_STUDENT_PAGE_HTML.replace(/^<!DOCTYPE html>/i, '');
  document.documentElement.innerHTML = html;
  const scripts = Array.from(document.querySelectorAll('script'));
  const code = scripts.map((s) => s.textContent || '').join('\n');
  const win = window as any;
  win.localStorage.setItem('qt_token', 'tkn');
  win.fetch = vi.fn(async (path: string) => {
    if (String(path).includes('/api/learn')) {
      return { ok: true, status: 200, json: async () => ({ lang: 'zh', chapter: 1, from: 1, to: 3, chapterName: '测试章', verses: [], units: [], vocab: [] }) } as any;
    }
    if (String(path).includes('/api/paper')) {
      return { ok: true, status: 200, json: async () => ({ id: 'p1', title: '测试卷', lang: 'zh', studentName: '学生一', questions }) } as any;
    }
    return { ok: true, status: 200, json: async () => ({}) } as any;
  });
  // eslint-disable-next-line no-new-func
  new Function(code).call(win);
  return win;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

/** 当前这页的选项按钮 */
const opts = (): HTMLElement[] => Array.from(document.querySelectorAll('.opt[data-o]')) as HTMLElement[];
const stem = (): string => (document.querySelector('.stem')?.textContent || '').trim();
const clickNext = (): void => (document.getElementById('next') as HTMLElement)?.click();
const clickPrev = (): void => (document.getElementById('prev') as HTMLElement)?.click();

/** 一路点到第一道题所在的那页 */
async function gotoFirstQuestion(): Promise<void> {
  for (let i = 0; i < 12; i += 1) {
    if (stem() === '第一题') return;
    clickNext();
    await flush();
  }
  throw new Error('没走到第一题，当前题干：' + stem());
}

/** 混合题型：真实卷子就是单选 + 排序 + 配对混着出 */
const MIXED = [
  { id: 'm-1', type: 'single', dimension: 'vocab', stem: '单选题', options: ['S1', 'S2', 'S3'] },
  { id: 'm-2', type: 'order', dimension: 'vocab', stem: '排序题', options: ['O1', 'O2', 'O3'] },
  { id: 'm-3', type: 'match', dimension: 'vocab', stem: '配对题', left: ['词甲', '词乙'], options: ['M1', 'M2'] },
  { id: 'm-4', type: 'single', dimension: 'vocab', stem: '第二单选', options: ['T1', 'T2', 'T3'] },
];

describe('混合题型也不跨题污染', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('单选 → 排序 → 配对 → 单选，逐题回看选中都在', async () => {
    installPage(MIXED);
    await flush(); await flush();
    for (let i = 0; i < 12 && stem() !== '单选题'; i += 1) { clickNext(); await flush(); }
    expect(stem()).toBe('单选题');

    opts()[2].click(); await flush();                       // 单选选 S3
    expect(opts()[2].className).toContain('on');

    clickNext(); await flush();
    expect(stem()).toBe('排序题');
    // 排序题要选满全部选项才算作答完成（exDone 要求 a.length === options.length）
    opts()[1].click(); await flush(); opts()[0].click(); await flush(); opts()[2].click(); await flush();
    expect(opts().filter((b) => b.className.includes('on'))).toHaveLength(3);

    clickNext(); await flush();
    expect(stem()).toBe('配对题');
    const chips = () => Array.from(document.querySelectorAll('.chip[data-l]')) as HTMLElement[];
    chips().find((c) => c.getAttribute('data-l') === '0' && c.getAttribute('data-o') === '0')!.click();
    await flush();
    chips().find((c) => c.getAttribute('data-l') === '1' && c.getAttribute('data-o') === '1')!.click();
    await flush();
    expect(chips().filter((c) => c.className.includes('on'))).toHaveLength(2);

    clickNext(); await flush();
    expect(stem()).toBe('第二单选');
    opts()[0].click(); await flush();                        // 就是这一步，用户说前面的会被清掉

    // 逐题回看
    clickPrev(); await flush();
    expect(stem()).toBe('配对题');
    expect(chips().filter((c) => c.className.includes('on'))).toHaveLength(2);

    clickPrev(); await flush();
    expect(stem()).toBe('排序题');
    expect(opts().filter((b) => b.className.includes('on'))).toHaveLength(3);

    clickPrev(); await flush();
    expect(stem()).toBe('单选题');
    expect(opts().findIndex((b) => b.className.includes('on'))).toBe(2);
  });
});

/** 配对题：三个词、三个释义 —— 用户说的「第一二题选完，第三题选同一个，第一题就没了」 */
const MATCH3 = [
  { id: 'p-1', type: 'match', dimension: 'vocab', stem: '配对题', left: ['词一', '词二', '词三'], options: ['释义A', '释义B', '释义C'] },
];

describe('配对题：选已被占用的释义，绝不清掉别人的选中', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  const chips = (): HTMLElement[] => Array.from(document.querySelectorAll('.chip[data-l]')) as HTMLElement[];
  const chip = (li: number, oi: number): HTMLElement =>
    chips().find((c) => c.getAttribute('data-l') === String(li) && c.getAttribute('data-o') === String(oi))!;
  const onOf = (li: number): number =>
    chips().filter((c) => c.getAttribute('data-l') === String(li)).findIndex((c) => c.className.includes('on'));

  it('词一配释义A、词二配释义B 之后，词三再点释义A 被拒绝且前两个不动', async () => {
    installPage(MATCH3);
    await flush(); await flush();
    for (let i = 0; i < 12 && stem() !== '配对题'; i += 1) { clickNext(); await flush(); }
    expect(stem()).toBe('配对题');

    chip(0, 0).click(); await flush();          // 词一 → 释义A
    chip(1, 1).click(); await flush();          // 词二 → 释义B
    expect(onOf(0)).toBe(0);
    expect(onOf(1)).toBe(1);

    chip(2, 0).click(); await flush();          // 词三 → 释义A（已被词一占用）
    // 关键：词一的选中必须还在，词三不该被配上
    expect(onOf(0), '词一的选中被清掉了').toBe(0);
    expect(onOf(1), '词二的选中被清掉了').toBe(1);
    expect(onOf(2), '词三不该配上已被占用的释义').toBe(-1);
    // 而且要给出可操作的提示
    expect(document.getElementById('err')?.textContent || '').toContain('词一');
  });

  it('先在词一取消，再配给词三就能成功', async () => {
    installPage(MATCH3);
    await flush(); await flush();
    for (let i = 0; i < 12 && stem() !== '配对题'; i += 1) { clickNext(); await flush(); }

    chip(0, 0).click(); await flush();
    chip(0, 0).click(); await flush();          // 取消词一
    expect(onOf(0)).toBe(-1);
    chip(2, 0).click(); await flush();          // 现在词三可以拿 A
    expect(onOf(2)).toBe(0);
  });
});

describe('学生端答题不跨题污染', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('依次答完三题后回看，每题的选中都还在且互不相同', async () => {
    installPage();
    await flush(); await flush();
    await gotoFirstQuestion();

    // 第一题选 A2（下标 1）
    expect(stem()).toBe('第一题');
    opts()[1].click();
    await flush();
    expect(opts()[1].className).toContain('on');

    clickNext(); await flush();
    // 第二题选 B3（下标 2）
    expect(stem()).toBe('第二题');
    opts()[2].click();
    await flush();
    expect(opts()[2].className).toContain('on');

    clickNext(); await flush();
    // 第三题选 C1（下标 0）—— 用户说的「选了第三题，第一题的选中没了」就在这一步
    expect(stem()).toBe('第三题');
    opts()[0].click();
    await flush();
    expect(opts()[0].className).toContain('on');

    // 回看第二题、第一题：选中态必须还在，且是各自当初选的那个
    clickPrev(); await flush();
    expect(stem()).toBe('第二题');
    expect(opts().findIndex((b) => b.className.includes('on'))).toBe(2);

    clickPrev(); await flush();
    expect(stem()).toBe('第一题');
    expect(opts().findIndex((b) => b.className.includes('on'))).toBe(1);
  });

  it('改选同一题的另一个选项，只影响这一题', async () => {
    installPage();
    await flush(); await flush();
    await gotoFirstQuestion();

    opts()[0].click(); await flush();
    clickNext(); await flush();
    opts()[3].click(); await flush();
    // 回到第一题改选
    clickPrev(); await flush();
    opts()[2].click(); await flush();

    // 只用 DOM 断言：脚本里的 deck 是局部变量，而用户看到的本来就是 DOM
    expect(opts().findIndex((b) => b.className.includes('on'))).toBe(2);
    clickNext(); await flush();
    expect(stem()).toBe('第二题');
    expect(opts().findIndex((b) => b.className.includes('on'))).toBe(3);   // 第二题不受影响
  });
});

/**
 * 两道配对题连排：第一题触发的冲突高亮不许跟着翻到第二题。
 *
 * 今天成立是因为翻页走整段重渲染（exBody 重新拼 HTML，不带 released 类），
 * 而 paintEx 只在点击时调用。这条用例钉的就是这个性质 —— 哪天有人让 render()
 * 也走 paintEx、或把状态类烤进 exBody，它就会红。
 */
const MATCH2 = [
  { id: 'x-1', type: 'match', dimension: 'vocab', stem: '配对一', left: ['甲一', '甲二', '甲三'], options: ['释一', '释二', '释三'] },
  { id: 'x-2', type: 'match', dimension: 'vocab', stem: '配对二', left: ['乙一', '乙二', '乙三'], options: ['义一', '义二', '义三'] },
];

describe('冲突高亮只属于触发它的那一页', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('第一题点到被占用的释义（第 3 行高亮），翻到第二题后第 3 行不该还亮着', async () => {
    installPage(MATCH2);
    await flush(); await flush();
    for (let i = 0; i < 12 && stem() !== '配对一'; i += 1) { clickNext(); await flush(); }
    expect(stem()).toBe('配对一');

    const chips = (): HTMLElement[] => Array.from(document.querySelectorAll('.chip[data-l]')) as HTMLElement[];
    const chip = (li: number, oi: number): HTMLElement =>
      chips().find((c) => c.getAttribute('data-l') === String(li) && c.getAttribute('data-o') === String(oi))!;
    const rows = (): HTMLElement[] => Array.from(document.querySelectorAll('.pair[data-li]')) as HTMLElement[];

    // 先配满（配对题要全配上才允许翻页），最后一步再制造冲突 ——
    // 顺序很重要：成功配对会把高亮清掉，冲突必须是翻页前的最后一个动作
    chip(0, 0).click(); await flush();
    chip(1, 1).click(); await flush();
    chip(2, 2).click(); await flush();
    chip(2, 0).click(); await flush();                      // 释一已配给「甲一」→ 拒绝 + 第 0 行闪
    expect(rows().filter((r) => r.className.includes('released')).map((r) => r.getAttribute('data-li'))).toEqual(['0']);

    clickNext(); await flush();
    expect(stem()).toBe('配对二');
    expect(rows().filter((r) => r.className.includes('released')), '冲突高亮跟着翻页跑到下一题了').toHaveLength(0);
  });
});
