/**
 * 分镜请求体护栏（2026-08-06 实测教训）：
 *
 * Seedance 直连第 ② 步曾把整份 buildProductionPrompt()（工作流时代给 agent 的**执行指令墙**：
 * 「请使用内置 skill 执行这条任务」「公开发布必须等我确认」「成片后输出 TOTALCLAW_VIDEO_PREVIEW=」
 * 等 20 余行命令）拼进分镜调用 —— 模型据此把自己当成任务执行者，回复不是 JSON 分镜，
 * parseSeedanceShotList 拒收 →「模型没有返回可用的结构化分镜」。
 * 同一套 system prompt 直打 DeepSeek（只给精简需求）实测稳定回标准 {"scenes":[...]}。
 *
 * 这里从源码层面钉死修复后的形态：分镜调用只能用专用精简需求块，且 JSON 契约在最后。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = readFileSync(join(__dirname, 'VideoStudioView.vue'), 'utf-8');

/** 取 runSeedanceDirect 里那次 llmOneshot 调用的实参片段（从调用点的 systemPrompt 行起） */
function shotListCallBlock(): string {
  const anchor = SRC.indexOf('systemPrompt: SEEDANCE_SHOT_SYSTEM_PROMPT');
  expect(anchor, '找不到分镜 oneshot 调用').toBeGreaterThan(0);
  return SRC.slice(anchor, anchor + 600);
}

describe('Seedance 分镜请求体', () => {
  it('分镜调用必须使用专用精简需求块，绝不能拼 buildProductionPrompt()', () => {
    const block = shotListCallBlock();
    expect(block).toContain('buildShotListRequest(');
    // 对抗断言：指令墙一旦回潮，这里立刻红
    expect(block.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, ''))
      .not.toMatch(/prompt:\s*\[[\s\S]{0,400}buildProductionPrompt\(\)/);
  });

  it('精简需求块必须把 JSON 契约放在最后一行（近因效应）', () => {
    const start = SRC.indexOf('function buildShotListRequest');
    expect(start).toBeGreaterThan(0);
    const body = SRC.slice(start, SRC.indexOf('\n}', start));
    const contractIdx = body.indexOf('"scenes"');
    expect(contractIdx, '需求块里必须重申 JSON 契约').toBeGreaterThan(0);
    // 契约之后除了收尾（].join / 括号）不该再有别的内容行
    const after = body.slice(contractIdx).split('\n').slice(1)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//') && !l.startsWith('].join') && l !== '}' && l !== ');');
    expect(after, 'JSON 契约后面不许再追加要求').toEqual([]);
  });

  it('精简需求块只带创作信息，不带任何 agent 执行指令', () => {
    const start = SRC.indexOf('function buildShotListRequest');
    const body = SRC.slice(start, SRC.indexOf('\n}', start));
    for (const forbidden of ['TOTALCLAW_VIDEO_PREVIEW', 'skill 执行', '人工确认', '发布流程', 'tts.py']) {
      expect(body, `分镜需求块混入了执行指令：${forbidden}`).not.toContain(forbidden);
    }
    // 创作必需项仍在
    for (const needed of ['画幅', '参考图', '内容目标']) {
      expect(body).toContain(needed);
    }
  });

  it('解析失败必须留下可观测证据（回复长度 + 片段）', () => {
    // 锚整个 `if (!scenes.length) { … throw }` 块，不用「throw 前 N 个字符」这种
    // 固定窗口 —— 2026-08-07 往块里补了一条主日志上报，窗口就滑出去把护栏跑红了，
    // 而证据其实一直都在。锚点跟着语法块走才不会误报。
    const start = SRC.indexOf('if (!scenes.length) {');
    expect(start, '找不到分镜解析失败分支').toBeGreaterThan(0);
    const end = SRC.indexOf('模型没有返回可用的结构化分镜', start);
    expect(end, '分支里没有如实抛错').toBeGreaterThan(start);
    const block = SRC.slice(start, end);
    expect(block, '解析失败要记录回复长度').toContain('replyLength');
    expect(block, '解析失败要记录回复片段').toContain('head');
  });
});

describe('镜头提示词长度上限', () => {
  it('请求契约里必须写明字数上限', () => {
    const SRC = readFileSync(join(__dirname, 'VideoStudioView.vue'), 'utf-8');
    const idx = SRC.indexOf('function buildShotListRequest');
    expect(idx).toBeGreaterThan(0);
    const body = SRC.slice(idx, SRC.indexOf('async function confirmProduction', idx));
    expect(body, '没告诉模型上限，它会越写越长').toMatch(/200\s*字以内/);
  });

  it('解析侧必须兜底截断（不能只靠模型守规矩）', () => {
    const PARSER = readFileSync(
      join(__dirname, '..', 'utils', 'seedanceShots.ts'), 'utf-8');
    expect(PARSER, '缺硬上限常量').toContain('PROMPT_MAX_CHARS');
    expect(PARSER, '没有真截断').toMatch(/slice\(0,\s*PROMPT_MAX_CHARS\)/);
  });
});

describe('分幕方法论必须显式给到模型', () => {
  const BODY = (() => {
    const SRC = readFileSync(join(__dirname, 'VideoStudioView.vue'), 'utf-8');
    const i = SRC.indexOf('function buildShotListRequest');
    return SRC.slice(i, SRC.indexOf('async function confirmProduction', i));
  })();

  it('要告诉模型怎么切分（叙事骨架 + 幕数区间）', () => {
    expect(BODY, '没给叙事骨架，分几幕全靠模型自由发挥').toMatch(/钩子.*展开.*细节.*收束/);
    // 幕数不能写死区间：每幕固定 5 秒，写死 3–6 幕 = 成片被隐形限制在 15–30 秒，
    // 用户要「一分钟」会被静默压掉（2026-08-07 用户点出）。必须由目标时长推导。
    expect(BODY, '幕数写死区间，长视频做不出来').not.toMatch(/通常\s*3[–\-]6\s*幕/);
    expect(BODY, '未要求按目标时长算幕数').toMatch(/目标时长\s*÷\s*5/);
    expect(BODY, '未给缺省时长兜底').toMatch(/没写时长/);
  });

  it('十要素必须写进请求，不能只留「写满十要素」的悬空引用', () => {
    // 那份清单在 references/seedance-prompting.md 里，模型读不到
    expect(BODY, '仍是悬空引用').not.toContain('写满十要素');
    for (const k of ['景别', '运镜', '构图', '起幅']) {
      expect(BODY, `缺要素：${k}`).toContain(k);
    }
  });

  it('跨幕一致性与负向提示要交代（否则每幕主体长得不一样）', () => {
    expect(BODY, '缺一致性锚点').toMatch(/原句照抄/);
    expect(BODY, '缺负向提示').toMatch(/无任何文字、字幕、水印/);
  });
});
