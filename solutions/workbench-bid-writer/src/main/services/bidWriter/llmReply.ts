/**
 * 模型回复的两道纯函数检查（可单测，不碰 electron）。
 *
 * 1) **通道把错误当正文返回**：实测本机大脑 key 失效时，runOneshotChat 正常 resolve，
 *    正文却是「⚠️ 大模型 API Key 无效或未配置。」。不挡的话这段话会被当成写好的一章
 *    存进标书，界面还显示「已完成」—— 宁可这一章报错，也不能把错误提示印进投标文件。
 * 2) **模型输出的 JSON**：容忍代码围栏与前后废话，取最完整的那个对象。
 */

/** 通道错误的特征：以 ⚠ 开头（与 groundedQa.ipc 同判据），或整段就是一句配置引导 */
export function isChannelErrorReply(reply: string): boolean {
  const s = String(reply ?? '').trim();
  if (!s) return false;
  if (/^⚠/.test(s)) return true;
  // 少数通道不带 ⚠，但整段很短且只在说「去配置 key」
  return s.length < 200 && /(API\s*Key|api_key)/i.test(s) && /(无效|未配置|not configured|invalid)/i.test(s);
}

/** 模型回复里的 JSON 对象；找不到抛错由调用方转成可读提示 */
export function parseJsonLoose(raw: string): any {
  const s = String(raw ?? '').trim();
  const candidates: string[] = [s];
  for (const m of s.matchAll(/```[a-zA-Z]*\s*([\s\S]*?)```/g)) candidates.push(m[1].trim());
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first >= 0 && last > first) candidates.push(s.slice(first, last + 1));
  for (const c of candidates) {
    try {
      const v = JSON.parse(c);
      if (v && typeof v === 'object') return v;
    } catch { /* 下一个候选 */ }
  }
  throw new Error('NO_JSON');
}
