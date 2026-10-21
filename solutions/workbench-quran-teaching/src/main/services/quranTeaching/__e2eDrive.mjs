/**
 * 端到端验收：真 Chrome 打开学生端，认领 → 逐题作答 → 回看 → 交卷，
 * 核对「跨题互相影响」是否真的没有了，以及交上去的答案与学生看到的是不是同一份。
 *
 * 用法：node apps/desktop-shell/src/main/services/quranTeaching/__e2eDrive.mjs <url> <classCode> [学生名]
 * 与 __e2eBoot.mts 配套，仅供验收，不进产品链路。
 */
import { chromium } from 'playwright';

const [, , URL_, CODE, WHO = 'stu-a'] = process.argv;   // 按学生 id 选，名册文案随界面语言变
if (!URL_ || !CODE) { console.error('用法: node __e2eDrive.mjs <url> <classCode> [学生名]'); process.exit(2); }

const fail = [];
const ok = (cond, msg) => { if (!cond) { fail.push(msg); console.log('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.on('pageerror', (e) => { fail.push('页面 JS 异常: ' + e.message); });
page.on('dialog', (d) => d.accept());

await page.goto(URL_.includes('?') ? URL_ : URL_ + '?lang=zh');   // 不带 lang 的话名册回落英文
await page.waitForSelector('#code');
await page.fill('#code', CODE);
await page.selectOption('#who', WHO);
await page.click('#go');
// 认领是异步的，而 .slide 在登录页就存在 —— 必须等 token 真落到 localStorage
await page.waitForFunction(() => !!localStorage.getItem('qt_token'), null, { timeout: 15000 });
await page.waitForTimeout(500);

/** 一路翻到第一道题 */
const stem = () => page.evaluate(() => (document.querySelector('.stem')?.textContent || '').trim());
const isQuestion = () => page.evaluate(() => !!document.querySelector('.stem'));
for (let i = 0; i < 40 && !(await isQuestion()); i += 1) {
  await page.click('#next');
  await page.waitForTimeout(80);
}
if (!(await isQuestion())) { console.error('没走到题目页'); await browser.close(); process.exit(1); }

/** 当前题的形态与选中态快照 —— 全部从 DOM 读，就是学生眼睛看到的 */
const snap = () => page.evaluate(() => {
  const chips = Array.from(document.querySelectorAll('.chip[data-l]'));
  if (chips.length) {
    const rows = {};
    for (const c of chips) {
      const li = c.getAttribute('data-l');
      (rows[li] ||= []).push({ o: Number(c.getAttribute('data-o')), on: c.className.includes('on'), text: c.textContent.trim() });
    }
    return { kind: 'match', stem: (document.querySelector('.stem')?.textContent || '').trim(), rows };
  }
  const opts = Array.from(document.querySelectorAll('.opt[data-o]'));
  return {
    kind: 'choice',
    stem: (document.querySelector('.stem')?.textContent || '').trim(),
    on: opts.map((b, i) => (b.className.includes('on') ? i : -1)).filter((i) => i >= 0),
    n: opts.length,
  };
});
const selectedOf = (s) => (s.kind === 'choice'
  ? s.on.slice()
  : Object.entries(s.rows).map(([li, cs]) => [Number(li), cs.findIndex((c) => c.on)]));

console.log('\n── 逐题作答 ──');
const answered = [];   // { idx, stem, kind, want }
for (let n = 0; n < 12; n += 1) {
  const s = await snap();
  if (s.kind === 'choice') {
    // 故意每题挑不同下标：串味了一眼看得出。用户原话「选 4 会影响随机 1/2/3」
    const pick = (n + 1) % s.n;
    await page.click(`.opt[data-o="${pick}"]`);
    await page.waitForTimeout(60);
  } else {
    // 配对题：第 i 行配第 i 个释义
    const lis = Object.keys(s.rows).map(Number).sort((a, b) => a - b);
    for (const li of lis) {
      const oi = li % s.rows[String(li)].length;
      await page.click(`.chip[data-l="${li}"][data-o="${oi}"]`);
      await page.waitForTimeout(50);
    }
  }
  const after = await snap();
  answered.push({ stem: after.stem, kind: after.kind, want: selectedOf(after) });
  console.log(`  第 ${answered.length} 题（${after.kind}）「${after.stem.slice(0, 16)}」→ ${JSON.stringify(after.want)}`);

  const hasNext = await page.evaluate(() => !!document.getElementById('next'));
  if (!hasNext) break;
  await page.click('#next');
  await page.waitForTimeout(120);
  if (!(await isQuestion())) break;
}

console.log('\n── 倒着回看，核对每题选中还在不在 ──');
for (let i = answered.length - 1; i >= 0; i -= 1) {
  const back = await page.evaluate(() => !!document.getElementById('prev'));
  if (!back && i !== answered.length - 1) break;
  if (i !== answered.length - 1) { await page.click('#prev'); await page.waitForTimeout(120); }
  const s = await snap();
  const want = answered[i];
  ok(s.stem === want.stem, `回到第 ${i + 1} 题：题干一致（${s.stem.slice(0, 14)}）`);
  ok(JSON.stringify(selectedOf(s)) === JSON.stringify(want.want),
    `第 ${i + 1} 题选中未被别的题影响：期望 ${JSON.stringify(want.want)}，实际 ${JSON.stringify(selectedOf(s))}`);
}

console.log('\n── 配对题：点已被占用的释义，必须拒绝且不动别人 ──');
// 翻回最后一题再往前找一道配对题
for (let i = 0; i < 12; i += 1) {
  const s = await snap();
  if (s.kind === 'match' && Object.keys(s.rows).length >= 2) {
    const before = selectedOf(s);
    const [row0] = before;                       // [li, oi]
    const other = before.find(([li]) => li !== row0[0]);
    if (other) {
      await page.click(`.chip[data-l="${other[0]}"][data-o="${row0[1]}"]`);   // 抢第 0 行已占的那个
      await page.waitForTimeout(120);
      const after = await snap();
      ok(JSON.stringify(selectedOf(after)) === JSON.stringify(before),
        `抢占被拒绝且谁也没动：${JSON.stringify(selectedOf(after))}`);
      const err = await page.evaluate(() => (document.getElementById('err')?.textContent || '').trim());
      ok(err.length > 0, `给出了可操作提示：「${err.slice(0, 40)}」`);
    }
    break;
  }
  const hasNext = await page.evaluate(() => !!document.getElementById('next'));
  if (!hasNext) break;
  await page.click('#next');
  await page.waitForTimeout(100);
}

console.log('\n── 交卷 ──');
for (let i = 0; i < 20; i += 1) {
  const btn = await page.evaluate(() => (document.getElementById('submit') ? 'submit' : (document.getElementById('next') ? 'next' : '')));
  if (btn === 'submit') { await page.click('#submit'); break; }
  if (!btn) break;
  await page.click('#next');
  await page.waitForTimeout(100);
}
await page.waitForTimeout(1500);
const result = await page.evaluate(() => document.body.innerText.slice(0, 400));
console.log(result.split('\n').filter(Boolean).slice(0, 8).join(' | '));

await browser.close();
console.log('\n' + (fail.length ? `✗ ${fail.length} 条不通过:\n  - ` + fail.join('\n  - ') : '✓ 全部通过'));
process.exit(fail.length ? 1 : 0);
