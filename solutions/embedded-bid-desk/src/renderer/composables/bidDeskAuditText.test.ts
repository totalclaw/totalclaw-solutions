/**
 * 投标桌内置文案（含审计记录里带参数的文案）切换语言后按当前语言显示；用户录入的内容原样。
 */
import { describe, expect, it } from 'vitest';
import { localizeBuiltinText } from './bidDeskAuditText';

const EN: Record<string, string> = {
  '努拉·卡赫塔尼': 'Noura Qahtani',
  '已在本机创建并关联 {p0} 份可实际读取的中文招标源文件。': '{p0} readable tender source files were created and linked on this device.',
  '品项“{p0}”已标记为{statusLabel}。': 'Item "{p0}" was marked as {statusLabel}.',
  '已确认': 'Confirmed',
};
const en = (key: string, params?: Record<string, unknown>) =>
  (EN[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (params && k in params ? String(params[k]) : m));

describe('投标桌内置文案本地化', () => {
  it('精确匹配的内置文案翻译；用户录入的原样', () => {
    expect(localizeBuiltinText('努拉·卡赫塔尼', en)).toBe('Noura Qahtani');
    expect(localizeBuiltinText('张三的标书.pdf', en)).toBe('张三的标书.pdf');
  });
  it('带参数的审计文案：反解参数后按当前语言重填，参数里的内置词也翻译', () => {
    expect(localizeBuiltinText('已在本机创建并关联 5 份可实际读取的中文招标源文件。', en)).toBe('5 readable tender source files were created and linked on this device.');
    expect(localizeBuiltinText('品项“空调主机”已标记为已确认。', en)).toBe('Item "空调主机" was marked as Confirmed.');
  });
});
