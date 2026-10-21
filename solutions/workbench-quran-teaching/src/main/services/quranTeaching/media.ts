/**
 * 多媒体教学（说明书第十三节 / 能力⑤）。
 *
 * 图片：HTML 模板 → 离屏 Chromium 渲染成 PNG。经文永远是**文字层**（HTML 文本，可复制、可核验），
 * 不交给图像模型「画」；背景可选用 fal 文生图（提示词只描述几何纹样/光影，不含任何经文与人物）。
 * 不生成对真主的具象化形象，不生成先知人物形象（提示词硬编码 no people / no figures）。
 *
 * 视频：现场生成脚本与分镜（模板 + 可选 LLM 润色）；成片样例由分镜卡 PNG + 本地 TTS + ffmpeg 合成
 * （ffmpeg / TTS 不可用时返回可读错误，界面回落到预置样例）。
 */
import type { QuranLang, QuranParseResult, QuranTri, QuranVerse, QuranVideoScene, QuranVideoScript } from '@totalclaw/ipc-contracts';
import templates from './mediaTemplates.json';
import { fill } from './quiz';
import { rangeLabel } from './textUtils';

type Tri3 = [string, string, string];
const T = templates as unknown as {
  cardTitle: Record<string, Tri3>; footer: Tri3; aiBadge: Tri3;
  script: { title: Tri3; objective: Tri3; intro: Record<string, Tri3>; unit: Record<string, Tri3>; vocab: Record<string, Tri3>; map: Record<string, Tri3>; review: Record<string, Tri3>; reviewQ: Tri3[] };
};

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type CardKind = 'vocab' | 'concept_map' | 'timeline' | 'review' | 'structure';

export interface CardInput {
  kind: CardKind;
  lang: QuranLang;
  chapterName: string;
  parse: QuranParseResult;
  verses: QuranVerse[];
  corpusVersion: string;
  /** fal 背景图 data URL（可选） */
  backgroundDataUrl?: string;
  /** 复习卡：指定概念 / 经文 */
  focusRefs?: string[];
}

export const CARD_W = 1280;
export const CARD_H = 800;

/** 卡片上会出现的全部经文文字（返回给调用方保存成 textLayer，供核验） */
export function cardTextLayer(input: CardInput): string[] {
  const v = input.verses;
  if (input.kind === 'vocab') return input.parse.vocabulary.filter((w) => w.meaning).slice(0, 6).map((w) => w.word);
  if (input.kind === 'review') return v.filter((x) => (input.focusRefs || []).includes(x.ref)).slice(0, 3).map((x) => x.arabic);
  if (input.kind === 'concept_map') return input.parse.concepts.slice(0, 6).flatMap((c) => c.verseRefs.slice(0, 1)).map((ref) => v.find((x) => x.ref === ref)?.arabic || '').filter(Boolean);
  if (input.kind === 'structure') return input.parse.units.slice(0, 8).map((u) => v.find((x) => x.ref === u.verseRefs[0])?.arabic || '').filter(Boolean);
  return [];
}

export function buildCardHtml(input: CardInput, fontCss = ''): string {
  const { lang, parse, verses } = input;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const title = fill(T.cardTitle[input.kind], lang, { chapter: input.chapterName, range: rangeLabel(parse.from, parse.to) });
  const footer = fill(T.footer, lang, { version: input.corpusVersion });
  const bg = input.backgroundDataUrl
    ? `background: linear-gradient(180deg, rgba(8,20,32,.78), rgba(8,20,32,.9)), url(${input.backgroundDataUrl}) center/cover;`
    : 'background: radial-gradient(1200px 600px at 20% 0%, #1f4d5a 0%, #0d2430 45%, #071620 100%);';
  const byRef = new Map(verses.map((v) => [v.ref, v]));
  let body = '';
  if (input.kind === 'vocab') {
    const words = parse.vocabulary.filter((w) => w.meaning).slice(0, 6);
    body = `<div class="grid">${words.map((w) => `<div class="cell"><div class="ar">${esc(w.word)}</div><div class="mean">${esc(w.meaning![lang])}</div><div class="ref">${esc(w.refs.slice(0, 2).join(' · '))}</div></div>`).join('')}</div>`;
  } else if (input.kind === 'concept_map') {
    const concepts = parse.concepts.slice(0, 6);
    body = `<div class="map"><div class="hub">${esc(input.chapterName)}<small>${rangeLabel(parse.from, parse.to)}</small></div><div class="spokes">${concepts.map((c) => { const v = byRef.get(c.verseRefs[0]); return `<div class="spoke"><div class="c">${esc(c.label[lang])}</div><div class="ar small">${esc(v?.arabic || '')}</div><div class="ref">${esc(c.verseRefs.slice(0, 3).join(', '))}</div></div>`; }).join('')}</div></div>`;
  } else if (input.kind === 'timeline') {
    const events = parse.events.length ? parse.events : parse.units.map((u, i) => ({ order: i + 1, title: u.title, from: u.from, to: u.to, persons: [] as QuranTri[] }));
    body = `<div class="timeline">${events.slice(0, 8).map((e) => `<div class="ev"><div class="dot">${e.order}</div><div class="t">${esc(e.title[lang])}</div><div class="ref">${rangeLabel(e.from, e.to)}${e.persons.length ? ` · ${esc(e.persons.slice(0, 3).map((p) => p[lang]).join(lang === 'ar' ? '، ' : ' / '))}` : ''}</div></div>`).join('')}</div>`;
  } else if (input.kind === 'review') {
    const refs = input.focusRefs?.length ? input.focusRefs : verses.slice(0, 3).map((v) => v.ref);
    body = `<div class="review">${refs.slice(0, 3).map((ref) => { const v = byRef.get(ref); return v ? `<div class="line"><div class="ar">${esc(v.arabic)}</div><div class="ref">${esc(v.ref)}</div></div>` : ''; }).join('')}<div class="hint">${parse.vocabulary.filter((w) => w.meaning && w.refs.some((r) => refs.includes(r))).slice(0, 4).map((w) => `<span>${esc(w.word)} — ${esc(w.meaning![lang])}</span>`).join('')}</div></div>`;
  } else {
    body = `<div class="structure">${parse.units.slice(0, 8).map((u) => `<div class="unit"><div class="n">${u.index}</div><div><div class="t">${esc(u.title[lang])}</div><div class="ref">${rangeLabel(u.from, u.to)}${u.repeated ? ` · ×${u.repeated.count}` : ''}</div><div class="ar small">${esc(byRef.get(u.verseRefs[0])?.arabic || '')}</div></div></div>`).join('')}</div>`;
  }
  return `<!doctype html><html lang="${lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'zh-CN'}" dir="${dir}"><head><meta charset="utf-8"><style>${fontCss}
  html,body{margin:0;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden}
  body{${bg}color:#f4efe4;font-family:"Amiri Quran","Amiri","Noto Naskh Arabic","Scheherazade New","Geeza Pro","PingFang SC","Segoe UI",sans-serif;position:relative}
  .frame{position:absolute;inset:22px;border:1px solid rgba(232,201,126,.45);border-radius:18px;pointer-events:none}
  .frame:before{content:"";position:absolute;inset:8px;border:1px solid rgba(232,201,126,.2);border-radius:12px}
  h1{margin:0;padding:44px 64px 8px;font-size:34px;letter-spacing:.5px;color:#e8c97e;font-weight:700}
  .badge{position:absolute;top:48px;${dir === 'rtl' ? 'left' : 'right'}:64px;font-size:14px;padding:6px 12px;border-radius:999px;background:rgba(232,201,126,.16);color:#e8c97e;border:1px solid rgba(232,201,126,.4)}
  .content{padding:8px 64px 0;height:${CARD_H - 190}px;box-sizing:border-box;display:grid;align-content:stretch}
  .content>*{height:100%;box-sizing:border-box}
  .ar{font-size:40px;line-height:1.8;direction:rtl;text-align:right;font-family:"Amiri Quran","Amiri","Noto Naskh Arabic","Scheherazade New","Geeza Pro","KFGQPC Uthman Taha Naskh",serif}
  .ar.small{font-size:26px;line-height:1.7}
  .mean{font-size:20px;color:#d9e6ea;margin-top:6px}
  .ref{font-size:14px;color:#9fb8c2;margin-top:6px;direction:ltr;text-align:${dir === 'rtl' ? 'right' : 'left'}}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:18px}
  .cell{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;justify-content:center}
  .map{display:flex;gap:28px;align-items:stretch;height:100%}
  .hub{flex:0 0 240px;display:flex;flex-direction:column;justify-content:center;align-items:center;font-size:36px;color:#e8c97e;border:2px solid rgba(232,201,126,.6);border-radius:24px;background:rgba(232,201,126,.08)}
  .hub small{font-size:18px;color:#d9e6ea;margin-top:8px}
  .spokes{flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
  .spoke{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px 16px}
  .spoke .c{font-size:22px;color:#e8c97e;margin-bottom:4px}
  .timeline{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:1fr;gap:22px 16px;padding-top:18px}
  .ev{position:relative;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:44px 16px 16px;display:flex;flex-direction:column;justify-content:center}
  .ev .t{font-size:24px;line-height:1.4}
  .dot{position:absolute;top:-14px;${dir === 'rtl' ? 'right' : 'left'}:16px;width:36px;height:36px;border-radius:50%;background:#e8c97e;color:#071620;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:18px}
  .t{font-size:20px;color:#f4efe4}
  .review{display:flex;flex-direction:column;justify-content:center}
  .review .line{padding:12px 0;border-bottom:1px dashed rgba(255,255,255,.18)}
  .review .hint{margin-top:14px;display:flex;flex-wrap:wrap;gap:10px}
  .review .hint span{font-size:18px;padding:6px 12px;border-radius:10px;background:rgba(255,255,255,.08)}
  .structure{display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:1fr;gap:12px}
  .unit{display:flex;gap:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px 14px}
  .unit .n{width:32px;height:32px;border-radius:50%;background:#e8c97e;color:#071620;font-weight:800;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
  footer{position:absolute;bottom:34px;left:64px;right:64px;font-size:13px;color:#9fb8c2;display:flex;justify-content:space-between;gap:16px}
  </style></head><body><div class="frame"></div><h1>${esc(title)}</h1><span class="badge">${esc(fill(T.aiBadge, lang, {}))}</span><div class="content">${body}</div><footer><span>${esc(footer)}</span><span>${esc(input.chapterName)} · ${parse.chapter}:${rangeLabel(parse.from, parse.to)}</span></footer></body></html>`;
}

/** fal 背景提示词：只描述纹样光影，硬性排除文字与人物 */
export function backgroundPrompt(kind: CardKind): string {
  const mood: Record<CardKind, string> = {
    vocab: 'deep teal and gold islamic geometric pattern, soft light, elegant, minimal',
    concept_map: 'abstract network of golden lines on dark emerald, geometric arabesque, minimal',
    timeline: 'desert dunes at dusk, warm gold and deep blue, subtle geometric border',
    review: 'quiet night sky with fine golden arabesque pattern, minimal',
    structure: 'layered geometric tiles, deep blue and gold, calm, minimal',
  };
  return `${mood[kind]}, no text, no letters, no calligraphy, no people, no faces, no figures, no animals, background only, high quality`;
}

// ── 视频脚本 / 分镜 ─────────────────────────────────────

export function buildVideoScript(id: string, lang: QuranLang, chapterName: string, parse: QuranParseResult, verses: QuranVerse[]): QuranVideoScript {
  const range = rangeLabel(parse.from, parse.to);
  const scenes: QuranVideoScene[] = [];
  let no = 1;
  scenes.push({ no: no++, durationSec: 6, visual: fill(T.script.intro.visual, lang, {}), narration: fill(T.script.intro.narration, lang, { chapter: chapterName, range }), subtitle: fill(T.script.intro.subtitle, lang, { chapter: chapterName, range }), verseRefs: [] });
  for (const u of parse.units.slice(0, 4)) {
    const refs = u.verseRefs.slice(0, 3);
    scenes.push({ no: no++, durationSec: 12, visual: fill(T.script.unit.visual, lang, { refs: refs.join(', ') }), narration: fill(T.script.unit.narration, lang, { n: u.index, title: u.title[lang], theme: u.theme[lang] }), subtitle: refs.map((r) => verses.find((v) => v.ref === r)?.arabic || '').filter(Boolean).join('\n'), verseRefs: refs });
  }
  const words = parse.vocabulary.filter((w) => w.meaning).slice(0, 3);
  if (words.length) scenes.push({ no: no++, durationSec: 10, visual: fill(T.script.vocab.visual, lang, { words: words.map((w) => w.word).join('، ') }), narration: fill(T.script.vocab.narration, lang, { list: words.map((w) => `${w.word} — ${w.meaning![lang]}`).join('; ') }), subtitle: fill(T.script.vocab.subtitle, lang, { words: words.map((w) => w.word).join('  ·  ') }), verseRefs: Array.from(new Set(words.flatMap((w) => w.refs.slice(0, 1)))) });
  const concepts = parse.concepts.slice(0, 4).map((c) => c.label[lang]);
  if (concepts.length) scenes.push({ no: no++, durationSec: 10, visual: fill(T.script.map.visual, lang, {}), narration: fill(T.script.map.narration, lang, { concepts: concepts.join('; ') }), subtitle: fill(T.script.map.subtitle, lang, { concepts: concepts.join(' · ') }), verseRefs: parse.concepts.slice(0, 4).flatMap((c) => c.verseRefs.slice(0, 1)) });
  const q1 = fill(T.script.reviewQ[0], lang, { ref: verses[0]?.ref || `${parse.chapter}:${parse.from}` });
  const q2 = words[0] ? fill(T.script.reviewQ[1], lang, { word: words[0].word }) : fill(T.script.reviewQ[2], lang, {});
  scenes.push({ no: no++, durationSec: 8, visual: fill(T.script.review.visual, lang, {}), narration: fill(T.script.review.narration, lang, { q1, q2 }), subtitle: fill(T.script.review.subtitle, lang, {}), verseRefs: [] });
  const totalSec = scenes.reduce((a, s) => a + s.durationSec, 0);
  return {
    id, chapter: parse.chapter, from: parse.from, to: parse.to,
    title: fill(T.script.title, lang, { chapter: chapterName, range }),
    objective: fill(T.script.objective, lang, { sec: totalSec, chapter: chapterName, range }),
    scenes, reviewQuestions: [q1, q2], totalSec, aiGenerated: true, generator: 'template', lang, createdAt: Date.now(),
  };
}

export function scriptPolishPrompt(script: QuranVideoScript, approvedText: string): string {
  const langName = script.lang === 'ar' ? 'Arabic' : script.lang === 'en' ? 'English' : 'Chinese';
  return [
    `Polish the narration of a short teaching video. Respond ONLY with JSON: {"scenes":[{"no":number,"narration":string}]}.`,
    `Language: ${langName}. Keep each narration under 45 words. NEVER rewrite, translate or paraphrase Quranic verses; refer to them only by chapter:verse. Explanations must stay within the APPROVED MATERIALS. Do not describe God or prophets as visual figures.`,
    `SCENES: ${JSON.stringify(script.scenes.map((s) => ({ no: s.no, narration: s.narration, verseRefs: s.verseRefs })))}`,
    `APPROVED MATERIALS: ${approvedText.slice(0, 5000)}`,
  ].join('\n');
}

export function applyScriptPolish(script: QuranVideoScript, raw: string): QuranVideoScript {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return script;
  try {
    const parsed = JSON.parse(m[0]);
    if (!Array.isArray(parsed.scenes)) return script;
    return { ...script, generator: 'llm', scenes: script.scenes.map((s) => { const p = parsed.scenes.find((x: any) => Number(x?.no) === s.no); return p && typeof p.narration === 'string' && p.narration.trim() ? { ...s, narration: p.narration.trim().slice(0, 400) } : s; }) };
  } catch { return script; }
}

/** 分镜帧 HTML（成片用：1280×720，字幕 = 锁定经文文字层） */
export function buildSceneHtml(scene: QuranVideoScene, lang: QuranLang, chapterName: string, index: number, total: number, fontCss = ''): string {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const hasArabic = /[؀-ۿ]/.test(scene.subtitle);
  return `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>${fontCss}
  html,body{margin:0;width:1280px;height:720px;overflow:hidden}
  body{background:radial-gradient(900px 500px at 30% 0%, #1f4d5a 0%, #0d2430 50%, #071620 100%);color:#f4efe4;font-family:"Amiri Quran","Amiri","Noto Naskh Arabic","Geeza Pro","PingFang SC","Segoe UI",sans-serif;position:relative}
  .frame{position:absolute;inset:20px;border:1px solid rgba(232,201,126,.4);border-radius:16px}
  .top{position:absolute;top:44px;left:56px;right:56px;display:flex;justify-content:space-between;font-size:18px;color:#e8c97e}
  .sub{position:absolute;left:56px;right:56px;top:110px;bottom:150px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:${hasArabic ? 40 : 30}px;line-height:1.9;direction:${hasArabic ? 'rtl' : dir};white-space:pre-wrap}
  .nar{position:absolute;bottom:52px;left:56px;right:56px;font-size:22px;line-height:1.5;color:#f4efe4;background:rgba(0,0,0,.35);padding:12px 18px;border-radius:12px}
  </style></head><body><div class="frame"></div><div class="top"><span>${esc(chapterName)}</span><span>${index + 1} / ${total}</span></div><div class="sub">${esc(scene.subtitle)}</div><div class="nar">${esc(scene.narration)}</div></body></html>`;
}
