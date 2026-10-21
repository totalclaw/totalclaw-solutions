/**
 * 教案 JSON 解析的容错与报错。
 *
 * 用户实拍：换 gpt 之后连续两次「生成失败 / 模型输出不是合法 JSON」——
 * 那七个字既没说模型到底回了什么，也没说下一步该干嘛。
 */
import { describe, it, expect } from 'vitest';
import { extractJson, describeJsonFailure } from './eduHubStore';

describe('能救的都救回来', () => {
  it('markdown 代码围栏里的 JSON', () => {
    expect(extractJson('好的：\n```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('前后有寒暄的 JSON', () => {
    expect(extractJson('这是结果：{"a":1} 希望有帮助！')).toEqual({ a: 1 });
  });

  it('尾逗号', () => {
    expect(extractJson('{"a":1,"b":[1,2,],}')).toEqual({ a: 1, b: [1, 2] });
  });

  it('被 max_tokens 截断（括号没闭合）', () => {
    const out = extractJson('{"plan":{"title":"电路基础","objectives":["认识电流"');
    expect(out.plan.title).toBe('电路基础');
  });

  it('截断正好落在反斜杠上 —— 直接补引号会拼出非法转义', () => {
    const out = extractJson('{"a":"line\\');
    expect(out).toHaveProperty('a');
  });

  it('截断落在半截 \\uXXXX 上', () => {
    const out = extractJson('{"a":"x\\u12');
    expect(out).toHaveProperty('a');
  });

  it('截断落在「键写完值还没开始」', () => {
    const out = extractJson('{"a":1,"b":');
    expect(out).toEqual({ a: 1 });
  });

  it('字符串里有没转义的换行（模型很爱这么干）', () => {
    const out = extractJson('{"intro":"第一行\n第二行"}');
    expect(String(out.intro)).toContain('第一行');
  });
});

describe('救不回来时，报错要说清「模型到底回了什么」', () => {
  it('空输出 → 指向超时/额度，而不是甩「不是合法 JSON」', () => {
    const msg = describeJsonFailure('   ');
    expect(msg).toContain('没有返回任何内容');
    expect(msg).toContain('重试');
  });

  it('模型答非所问 → 把它的原话摆出来', () => {
    const msg = describeJsonFailure('抱歉，我无法完成这个请求。');
    expect(msg).toContain('抱歉，我无法完成这个请求。');
    expect(msg).toContain('换一个');
  });

  it('模型原话很长时截断，不把整篇糊到界面上', () => {
    const msg = describeJsonFailure('啊'.repeat(500));
    expect(msg.length).toBeLessThan(300);
  });

  it('有 { 但拼不出对象 → 判为被截断，给「换快速模式/换模型」的出路', () => {
    // 只有开括号、且救不回来的极端串
    const msg = describeJsonFailure('{'.repeat(3) + '乱码'.repeat(10));
    expect(msg).toContain('不完整');
    expect(msg).toContain('快速');
  });

  it('抛出来的就是这条人话，不再是七个字', () => {
    expect(() => extractJson('抱歉，我无法完成这个请求。')).toThrowError(/无法完成这个请求/);
  });
});
