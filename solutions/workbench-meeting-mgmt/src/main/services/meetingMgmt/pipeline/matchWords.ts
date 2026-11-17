/**
 * 会议处理流水线拿来和**原文**逐字比对的中文模式（不是界面文案，不进词典，i18n codemod 需豁免本文件）：
 * 转写 / 文字记录永远是会议原话，这些词翻译了就匹配不上。
 */

/** 规则兜底抽决议：含这些词的句子当作决议 / 待办 */
export const DECISION_WORDS = [
  // 用户给的六个词，加上意思同样明确的几个；「安排 / 推进 / 下周」这类太泛，议程介绍里也到处是，不收
  '决定', '确定', '负责', '截止', '需要', '完成', '同意', '通过', '落实', '务必', '必须', '牵头', '定下来', '拍板',
];

/** 话里说了这些，建议完成时间取短（7 天），否则 14 天 */
export const URGENT_WORDS = ['尽快', '马上', '立即', '立刻', '本周', '这周', '紧急', '加急', '优先'];

/** 文字记录里「标签：值」形式的元信息，不是发言人 */
export const TRANSCRIPT_META_LABELS = [
  '时间', '日期', '地点', '会议地点', '会议时间', '主题', '会议主题', '议题', '标题', '会议名称', '参会人', '参会人员', '出席', '出席人员',
  '列席', '缺席', '记录人', '记录', '抄送', '备注', '注意', '说明', '附件', '结论', '摘要', '总结', '待办', '决议', '议程', '会议纪要', '纪要',
  '链接', '会议号', '会议链接', '录制', '文字记录', '发言记录', '智能纪要', '章节', '关键词',
  'subject', 'date', 'time', 'location', 'attendees', 'agenda', 'note', 'notes', 'summary', 'title', 'link', 'url', 'http', 'https',
];

/** 没有真名的通用发言人标签（腾讯会议 / 飞书 / Zoom 导出常见），不按昵称匹配员工 */
export const GENERIC_SPEAKER_RE = /^(说话人|发言人|讲话人|参会人|用户|speaker|spk|s)\s*[-_#]?\s*\d+$/i;

/** Whisper 静音幻听 / 提示词回声（归一化后包含即丢弃） */
export const ASR_HALLUCINATIONS = [
  '以下是普通话的', '请使用简体中文转写',
  '请不吝点赞订阅', '点赞订阅转发', '打赏支持明镜', '明镜与点点栏目', '字幕由', '字幕提供', '字幕志愿者', 'amara.org',
  '谢谢观看', '谢谢大家观看', '感谢观看', '订阅我的频道', '多谢您收看', '下集再见', '优优独播剧场',
  'thanksforwatching', 'thankyouforwatching', 'pleasesubscribe', 'likeandsubscribe',
];

/** 报告叙述里「数字 + 量词」才当数字回核（避免把「一致」「统一」里的「一」当数字） */
export const CN_COUNT_UNITS = '项个次条名位人天日周月年场家部门份处%';

/** 中文数字（数字回核时把「三项」「十二个部门」换算成数字） */
export const CN_DIGIT: Record<string, number> = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
export const CN_MAGNITUDE: Record<string, number> = { 十: 10, 百: 100, 千: 1000 };
export const CN_WAN = '万';
/** 只由数字字组成（「二〇二六」逐位读） */
export const CN_DIGITS_ONLY_RE = /^[零〇一二两三四五六七八九]+$/;
/** 「数 + 量词」；前面是「第」的是序数，不算 */
export function cnNumberWithUnitRe(units: string): RegExp {
  return new RegExp(`(^|[^第])([零〇一二两三四五六七八九十百千万]+)(?=[${units}])`, 'g');
}
