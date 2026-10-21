/**
 * 服装实体店智能体 · 发给看图模型的提示词（英文指令 + 要求简体中文取值）。
 * 是发给模型的载荷，不是界面文案：i18n codemod 整文件豁免，里面的中文示例值不能被翻译。
 * `catalog` 是选项库清单（id=名称），模型只许从里面挑。
 */

export function garmentTagPrompt(catalog: string): string {
  return [
    'You are a fashion retail merchandiser. Look at this garment product photo.',
    'Return ONLY a JSON object with keys:',
    'name (short product name, max 12 Chinese chars), category (e.g. 连衣裙/衬衫/T恤/外套/半身裙/裤装/卫衣/针织衫/西装/鞋/包), color, style (e.g. 通勤/休闲/甜美/街头/优雅/运动/复古), fabric (best guess), season (春/夏/秋/冬/四季),',
    'audience ("women" | "men" | "kids"), tags (3-6 short keywords), sellingPoints (one sentence, max 40 Chinese chars, only what is visible),',
    'recommended: {backgroundId, poseId, hairId} chosen from these ids:',
    catalog,
    'All text values in Simplified Chinese. Do not invent brand names or materials you cannot see.',
  ].join('\n');
}

export function photoCheckPrompt(): string {
  return [
    'Check if this photo is suitable for a virtual clothing try-on.',
    'Requirements: exactly one person; full body visible from head to feet (or at least head to knees); front-facing; not too dark or blurry.',
    'It must be a photo of a real person. A garment alone, clothes on a hanger, a mannequin, a flat-lay or a product shot is NOT suitable (issue "照片里没有真人").',
    'Return ONLY JSON: {"ok": boolean, "issues": [short problems in Simplified Chinese, e.g. "画面里有多个人", "没有拍到全身", "光线太暗"]}.',
    'If suitable, return {"ok": true, "issues": []}.',
  ].join('\n');
}

export function analyzePrompt(catalog: string): string {
  return [
    'You are a friendly personal stylist in a clothing store. Look at the customer photo.',
    'Return ONLY JSON with keys:',
    'bodyShape: one of "pear","apple","hourglass","rectangle","inverted_triangle";',
    'skinTone (short, e.g. 暖调偏白/自然肤色/小麦色), faceShape (e.g. 鹅蛋脸/圆脸/方脸/长脸/心形脸),',
    'notes (one positive styling tip in Simplified Chinese, max 40 chars, no judgement about weight or attractiveness),',
    'suggestions: array of exactly 3 {backgroundId, poseId, hairId, reason (max 20 Chinese chars)} chosen from these ids:',
    catalog,
  ].join('\n');
}

/** 造型库示意图（文生图）：背景不出人物，姿势 / 发型用中性棚拍人像 */
export function thumbPrompt(kind: 'background' | 'pose' | 'hair', optionPrompt: string): string {
  if (kind === 'background') return `Photorealistic scene photo of ${optionPrompt}, empty scene without people, soft natural light, vertical composition.`;
  if (kind === 'pose') return `Photorealistic full-body fashion photo of a young Asian woman in a plain white T-shirt and jeans, ${optionPrompt}, plain light grey studio background.`;
  return `Photorealistic head-and-shoulders portrait of a young Asian woman with ${optionPrompt}, plain light grey studio background, soft light.`;
}

/** 试穿图保脸核对：图 1 顾客原照，图 2 生成的试穿图。只看脸是不是同一个人，衣服 / 发型 / 背景 / 姿势变了都正常 */
export function faceMatchPrompt(): string {
  return [
    'Image 1 is a customer photo. Image 2 is an AI-generated try-on photo that must show the SAME person wearing different clothes.',
    'Compare ONLY the face: face shape, eyes, eyebrows, nose, mouth, age, skin tone, moles, glasses.',
    'Ignore differences in clothing, hairstyle, pose, background, lighting and small angle changes.',
    'Answer "same": false if the face in image 2 looks like a different person, was noticeably beautified / slimmed / de-aged, or is not visible.',
    'Return ONLY JSON: {"same": boolean, "reason": short reason in Simplified Chinese (max 20 chars)}.',
  ].join('\n');
}
