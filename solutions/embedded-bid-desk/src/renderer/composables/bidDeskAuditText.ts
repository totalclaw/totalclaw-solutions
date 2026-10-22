/**
 * 投标桌内置文案按当前语言显示：演示案例 / 审计记录的文案是生成时按当时界面语言落盘的中文，切换语言后要按词典重新翻译。
 *   - 不带参数的：按词典精确匹配（用户自己录入的客户名、文件名不在词典里，原样返回）；
 *   - 审计记录里带参数的（宿主 stores/bidDesk.ts 的 addAudit）：按模板反解出参数，参数里的内置词（状态名、用途）也翻译，再按当前语言重填。
 */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

// i18n-ignore：模板只用于反解落盘的中文，翻译 key 由宿主 stores/bidDesk.ts 登记
const AUDIT_TEMPLATES = [
  '{p0} 已归类为 {purpose}。',
  '{p0} 已真实解析：{p1} 字符、{p2} 个工作表；已建立证据与知识索引。',
  '品项“{p0}”已标记为{statusLabel}。',
  '品项“{p0}”的逐行成本和售价已更新。',
  '字段“{p0}”已标记为{statusLabel}。',
  '已从批准的第 {p0} 版导出 {p1} 个正式文件。',
  '已在本机创建并关联 {p0} 份可实际读取的中文招标源文件。',
  '已按成本权重把 {p0} 的报价分摊到 {p1} 个 BOQ 品项。',
  '已添加 {p0} 份招标来源文件。',
  '真实工作流运行 {p0} 已启动。',
  '真实工作流运行 {p0} 已完成，结果已回写项目工作台。',
  '要求“{p0}”的人工结论为{decisionLabel}。',
].map((key) => {
  const names: string[] = [];
  const pattern = key.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{(\w+)\}/g, (_m, name: string) => { names.push(name); return '(.+?)'; });
  return { key, names, re: new RegExp(`^${pattern}$`) };
});

export function localizeBuiltinText(text: string, t: Translate): string {
  for (const tpl of AUDIT_TEMPLATES) {
    const m = tpl.re.exec(text);
    if (m) return t(tpl.key, Object.fromEntries(tpl.names.map((n, i) => [n, t(m[i + 1])])));
  }
  return t(text);
}
