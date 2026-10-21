/**
 * 经营自动化智能体 · 发给模型的提示词（英文指令 + 要求简体中文输出；是载荷不是界面文案，不进词典）。
 *
 * 共同约束：数字（价格、折扣、销量、金额）只许引用给定的事实；没有给的信息不许编。
 */
import type { ApGarment, BaChannel, BaMetrics, BaPublishPlatform, BaVideoType } from '@totalclaw/ipc-contracts';
import { metricsFacts } from './logic';

const PLATFORM_STYLE: Record<BaPublishPlatform, string> = {
  douyin: 'Douyin: punchy hook in the first 2 seconds, title <= 30 chars, 3-5 hashtags',
  kuaishou: 'Kuaishou: down-to-earth and friendly, title <= 30 chars, 3-5 hashtags',
  xiaohongshu: 'Xiaohongshu: "种草" note style with emojis, title <= 20 chars, caption 80-200 chars, 5-8 hashtags',
  wxchannels: 'WeChat Channels: warm and credible, title <= 30 chars, 2-4 hashtags',
};

const TYPE_GUIDE: Record<BaVideoType, string> = {
  new_arrival: 'New arrival showcase: open with the newest item, 1 scene per image, close with store call-to-action.',
  multi_look: 'One item, many looks: each scene shows the same item in a different styling/scene.',
  store_tour: 'Store tour: invite viewers to visit the store, mention what they can try.',
  promotion: 'Promotion: state the offer exactly as given in the brief, create urgency without exaggeration.',
  styling_tips: 'Styling tips: give practical outfit advice for an occasion, using the items shown.',
};

function garmentFacts(g: ApGarment): string {
  return `- ${g.name} | category=${g.category} | color=${g.color} | style=${g.style} | fabric=${g.fabric} | season=${g.season} | price=${g.price || 'n/a'} | points=${g.sellingPoints || ''}`;
}

export function videoScriptPrompt(p: { type: BaVideoType; brand: string; brief: string; garments: ApGarment[]; imageCount: number; platforms: BaPublishPlatform[] }): string {
  return [
    'You write short vertical videos (15-30 seconds) for a physical clothing store.',
    `Store/brand: ${p.brand || '(not given)'}`,
    `Video type: ${TYPE_GUIDE[p.type]}`,
    `Brief from the store owner (the ONLY source for offers, discounts, dates): ${p.brief || '(none)'}`,
    'Products:',
    ...p.garments.map(garmentFacts),
    `There are ${p.imageCount} images numbered 0..${p.imageCount - 1} in the order the products are listed (product image first, then its try-on photos).`,
    'Rules: write in Simplified Chinese; never invent prices, discounts, sales numbers or materials; do not use absolute words banned by Chinese advertising law (最低/第一/顶级/100% etc.).',
    'Return ONLY JSON:',
    '{"scenes":[{"image": <index>, "line": "<one sentence voice-over, max 22 Chinese chars>"}] (4-8 scenes),',
    ` "copies": {${p.platforms.map((x) => `"${x}": {"title": "...", "caption": "...", "topics": ["..."]}`).join(', ')}}}`,
    'Platform styles:',
    ...p.platforms.map((x) => `- ${PLATFORM_STYLE[x]}`),
  ].join('\n');
}

export function avatarScriptPrompt(p: { topic: string; brand: string; facts: Array<{ label: string; value: string }>; seconds: number }): string {
  return [
    'You write a talking-head script for a digital human presenter introducing a company / store.',
    `Topic: ${p.topic}`,
    `Brand: ${p.brand || '(see facts)'}`,
    `Target length: about ${p.seconds} seconds of speech (~${Math.round(p.seconds * 4)} Chinese characters).`,
    'Facts from the company knowledge base (the ONLY allowed source of facts):',
    ...(p.facts.length ? p.facts.map((f) => `- ${f.label}: ${f.value}`) : ['(no facts found)']),
    'Rules: write in Simplified Chinese, spoken style, short sentences.',
    'Any fact you need but which is NOT listed above (founding year, address, awards, numbers...) must be written as a placeholder like 【待补充：成立年份】 — never invent it.',
    'Do not use absolute words banned by Chinese advertising law (最/第一/顶级/国家级 etc.).',
    'Return ONLY the script text, no JSON, no stage directions.',
  ].join('\n');
}

export function listingPrompt(p: { garment: ApGarment; channel: BaChannel; brand: string }): string {
  const sizes = Object.keys(p.garment.stock || {}).join('/');
  return [
    `Write an e-commerce listing for ${p.channel.name}.`,
    `Brand: ${p.brand || '(none)'}`,
    'Product facts (the ONLY allowed source):',
    garmentFacts(p.garment),
    `Sizes: ${sizes || 'n/a'}; tags: ${p.garment.tags.join(', ')}`,
    `Rules: Simplified Chinese; title <= ${p.channel.titleMax} characters, keyword-rich but natural; never invent materials, certifications, sales numbers or discounts; no absolute words banned by Chinese advertising law.`,
    'Return ONLY JSON: {"title": "...", "sellingPoints": ["3-5 short points"], "detail": "detail page copy, 150-300 chars, with a size advice line", "keywords": ["5-8 search keywords"]}',
  ].join('\n');
}

export function reportCommentaryPrompt(p: { kind: string; brand: string; metrics: BaMetrics; hints: string[] }): string {
  return [
    `You are the business analyst of a clothing retail store${p.brand ? ` (${p.brand})` : ''}. Write the ${p.kind} business report commentary.`,
    'Facts (the ONLY numbers you may cite — copy them exactly, do not compute new numbers except simple differences already given):',
    ...metricsFacts(p.metrics),
    ...(p.hints.length ? ['Other notes:', ...p.hints.map((h) => `- ${h}`)] : []),
    'Write in Simplified Chinese, 4-6 short bullet points: overall result, what drove it (channel / category / top items), cost & expense notes, 1-2 concrete actions for tomorrow/next period.',
    'If costCoverage is below 100%, say gross profit only covers sales with cost data.',
    'Return plain text bullets starting with "• ".',
  ].join('\n');
}

export function financeQaPrompt(p: { question: string; brand: string; blocks: Array<{ title: string; facts: string[] }>; sources: string[] }): string {
  return [
    `Answer a store owner's question about their business data${p.brand ? ` (${p.brand})` : ''}.`,
    'Data (the ONLY numbers you may cite):',
    ...p.blocks.flatMap((b) => [`[${b.title}]`, ...b.facts]),
    `Data sources (imported files): ${p.sources.join('; ') || 'n/a'}`,
    'Definitions: netRevenue = settled sales - refunds; grossProfit = revenue - cost of goods (only rows with cost); avgOrderValue = netRevenue / orders; unitsPerOrder = units / orders; sellThrough = sold / (sold + stock); inventoryTurnoverDays = inventory cost / daily cost of goods.',
    `Question: ${p.question}`,
    'Answer in Simplified Chinese, concise. Cite the period for every number, and end with one line "数据来源：..." naming the source file(s) and one line "口径：..." with the definition used. If the data does not contain the answer, say so plainly and tell them which table to import.',
  ].join('\n');
}

/** 缺模特图时：只给商品图，让改图模型生成一张模特上身图（服装按原图还原） */
export function modelShotPrompt(g: ApGarment): string {
  const who = g.audience === 'men' ? 'a young Asian male model' : g.audience === 'kids' ? 'a smiling Asian child model' : 'a young Asian female model';
  return [
    `Photorealistic e-commerce fashion photo of ${who} wearing exactly the garment in the image${g.category ? ` (${g.category})` : ''}.`,
    'Reproduce the garment faithfully: same color, print, fabric texture, cut and details.',
    'Full body, natural standing pose, clean light studio background, soft light, portrait 3:4, no text, no watermark.',
  ].join(' ');
}
