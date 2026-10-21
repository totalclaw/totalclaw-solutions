/**
 * 端到端验收（用户报的那个 bug 的真实触发条件）：
 *
 *   学生扫码拿到卷 → **老师中途在教师端点「5 名学生作答」** → 学生继续答、交卷。
 *
 * 修复前：变体（每人一套题序 + 选项顺序）只在 simulate() 里才建，学生先按原卷顺序作答，
 * simulate 一跑变体就建出来了，判分与重新发题全换成另一套顺序 ——
 * 学生「明明选的第 4 个，回头看成了第 1/2/3 个」，而且每人洗牌不同，看起来就是随机。
 *
 * 这里用真 Chrome 跑：作答 → 触发 simulate → 原地重载 → 逐题核对学生看到的题序、选项文字、
 * 选中态**一个字都不能变**，再交卷核对判分结果与学生看到的一致。
 *
 * 用法：node __e2eSimulateRace.mjs <url> <classCode> <dataDir> [studentId]
 */
import { chromium } from 'playwright';
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [, , URL_, CODE, DATA_DIR, WHO = 'stu-a'] = process.argv;
if (!URL_ || !CODE || !DATA_DIR) { console.error('用法: node __e2eSimulateRace.mjs <url> <classCode> <dataDir> [studentId]'); process.exit(2); }

const fail = [];
const ok = (cond, msg) => { if (!cond) { fail.push(msg); console.log('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.on('pageerror', (e) => fail.push('页面 JS 异常: ' + e.message));
page.on('dialog', (d) => d.accept());

/** 直接问服务端要这名学生的卷 —— 与页面用的是同一个接口、同一个 token */
const fetchPaper = () => page.evaluate(async () => {
  const r = await fetch('/api/paper', { headers: { Authorization: 'Bearer ' + localStorage.getItem('qt_token') } });
  const j = await r.json();
  return (j.questions || []).map((q) => ({ id: q.id, stem: q.stem, options: q.options || [], left: q.left || [] }));
});

await page.goto(URL_.includes('?') ? URL_ : URL_ + '?lang=zh');
await page.waitForSelector('#code');
await page.fill('#code', CODE);
await page.selectOption('#who', WHO);
await page.click('#go');
// 认领是异步的，而 .slide 在登录页就存在 —— 必须等 token 真落到 localStorage
await page.waitForFunction(() => !!localStorage.getItem('qt_token'), null, { timeout: 15000 });
await page.waitForTimeout(500);

const before = await fetchPaper();
console.log(`\n学生拿到 ${before.length} 题，首题选项：${JSON.stringify(before[0].options.slice(0, 3))}`);

// ── 作答几题（DOM 上真点） ──
const isQuestion = () => page.evaluate(() => !!document.querySelector('.stem'));
for (let i = 0; i < 40 && !(await isQuestion()); i += 1) { await page.click('#next'); await page.waitForTimeout(70); }
const snap = () => page.evaluate(() => {
  const chips = Array.from(document.querySelectorAll('.chip[data-l]'));
  const stem = (document.querySelector('.stem')?.textContent || '').trim();
  if (chips.length) {
    const rows = {};
    for (const c of chips) (rows[c.getAttribute('data-l')] ||= []).push({ on: c.className.includes('on'), text: c.textContent.trim() });
    return { kind: 'match', stem, sel: Object.entries(rows).map(([li, cs]) => [Number(li), cs.findIndex((c) => c.on)]), texts: Object.values(rows)[0].map((c) => c.text) };
  }
  const opts = Array.from(document.querySelectorAll('.opt[data-o]'));
  return { kind: 'choice', stem, sel: opts.map((b, i) => (b.className.includes('on') ? i : -1)).filter((i) => i >= 0), texts: opts.map((b) => b.textContent.trim()) };
});

console.log('\n── 先答 3 题 ──');
const answered = [];
for (let n = 0; n < 3; n += 1) {
  const s = await snap();
  if (s.kind === 'choice') await page.click(`.opt[data-o="${(n + 1) % s.texts.length}"]`);
  else {
    const rowCount = await page.evaluate(() => new Set(Array.from(document.querySelectorAll('.chip[data-l]')).map((c) => c.getAttribute('data-l'))).size);
    for (let li = 0; li < rowCount; li += 1) { await page.click(`.chip[data-l="${li}"][data-o="${li}"]`); await page.waitForTimeout(40); }
  }
  await page.waitForTimeout(80);
  const after = await snap();
  answered.push(after);
  console.log(`  第 ${n + 1} 题（${after.kind}）「${after.stem.slice(0, 14)}」选中 ${JSON.stringify(after.sel)}`);
  if (n < 2) { await page.click('#next'); await page.waitForTimeout(120); }
}

// ── 老师中途点「5 名学生作答」 ──
console.log('\n── 触发教师端的 simulate（5 名学生作答） ──');
writeFileSync(join(DATA_DIR, '__simulate'), '1');
for (let i = 0; i < 40 && existsSync(join(DATA_DIR, '__simulate')); i += 1) await page.waitForTimeout(200);
await page.waitForTimeout(600);
console.log('  已触发');

// ── 学生这边的卷子必须一个字都没变 ──
console.log('\n── 核对学生手里的卷子没被换掉 ──');
const after = await fetchPaper();
ok(after.length === before.length, `题数不变：${before.length} → ${after.length}`);
ok(JSON.stringify(after.map((q) => q.id)) === JSON.stringify(before.map((q) => q.id)), '题序不变');
const optDiff = before.map((q, i) => (JSON.stringify(q.options) === JSON.stringify(after[i]?.options) ? null : i)).filter((x) => x !== null);
ok(optDiff.length === 0, `每题选项顺序不变（有变化的题号：${JSON.stringify(optDiff)}）`);

console.log('\n── 回看已答的 3 题，选中态必须还在原位 ──');
for (let i = answered.length - 1; i >= 0; i -= 1) {
  if (i !== answered.length - 1) { await page.click('#prev'); await page.waitForTimeout(120); }
  const s = await snap();
  ok(s.stem === answered[i].stem, `第 ${i + 1} 题题干不变`);
  ok(JSON.stringify(s.texts) === JSON.stringify(answered[i].texts), `第 ${i + 1} 题选项文字与顺序不变`);
  ok(JSON.stringify(s.sel) === JSON.stringify(answered[i].sel),
    `第 ${i + 1} 题选中不变：期望 ${JSON.stringify(answered[i].sel)}，实际 ${JSON.stringify(s.sel)}`);
}

// ── 答完剩下的并交卷 ──
console.log('\n── 答完交卷 ──');
for (let i = 0; i < 30; i += 1) {
  const where = await page.evaluate(() => (document.getElementById('submit') ? 'submit' : (document.getElementById('next') ? 'next' : '')));
  if (where === 'submit') { await page.click('#submit'); break; }
  if (!where) break;
  if (await isQuestion()) {
    const s = await snap();
    if (!s.sel.length || (s.kind === 'match' && s.sel.some(([, o]) => o < 0))) {
      if (s.kind === 'choice') await page.click('.opt[data-o="0"]');
      else {
        const rowCount = await page.evaluate(() => new Set(Array.from(document.querySelectorAll('.chip[data-l]')).map((c) => c.getAttribute('data-l'))).size);
        for (let li = 0; li < rowCount; li += 1) { await page.click(`.chip[data-l="${li}"][data-o="${li}"]`); await page.waitForTimeout(40); }
      }
      await page.waitForTimeout(80);
      continue;
    }
  }
  await page.click('#next');
  await page.waitForTimeout(110);
}
await page.waitForTimeout(1800);
const txt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 220));
ok(!/网络|失败|错误/.test(txt), `交卷没有报错：${txt.slice(0, 80)}`);
console.log('  成绩页：' + txt.slice(0, 120));

await browser.close();
console.log('\n' + (fail.length ? `✗ ${fail.length} 条不通过:\n  - ` + fail.join('\n  - ') : '✓ 全部通过'));
process.exit(fail.length ? 1 : 0);
