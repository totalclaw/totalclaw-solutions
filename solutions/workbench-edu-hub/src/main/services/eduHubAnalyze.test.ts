/**
 * 资料判定：学段 / 时长 / 语言。
 *
 * 用户实拍：导进来一份英文的《EVoc 112 Syllabus (Final Exam).docx》，三个下拉照样是
 * 「初中 / 45 分钟 / 中文」—— 因为那压根不是分析结果，是写死的默认值。
 * 这组用例把「真按文档判」和「判不出就别瞎猜」两条都钉住。
 */
import { describe, it, expect } from 'vitest';
import { analyzeMaterial, eduHubGradeOptions } from './eduHubStore';

const pages = (...texts: string[]) => texts.map((text, i) => ({ n: i + 1, text }));

describe('语言按正文字符集判', () => {
  it('英文文档判英文，不再默认中文', () => {
    const r = analyzeMaterial(pages('Basic Electrical Engineering: from measurement to power systems.'), 'EVoc 112 Syllabus.docx');
    expect(r.lang).toBe('en-US');
  });

  it('中文文档判中文', () => {
    const r = analyzeMaterial(pages('本章讲解电路的基本组成与欧姆定律，并通过实验加深理解。'), '电路基础.docx');
    expect(r.lang).toBe('zh-CN');
  });

  it('阿语文档判阿语', () => {
    const r = analyzeMaterial(pages('الهندسة الكهربائية الأساسية من القياس إلى أنظمة الطاقة'), 'x.docx');
    expect(r.lang).toBe('ar');
  });

  it('文件名是英文但正文是中文 → 判中文（只看正文）', () => {
    const r = analyzeMaterial(pages('第一节 电流与电压的关系，配合实验演示与课堂练习。'), 'Chapter1-Syllabus.docx');
    expect(r.lang).toBe('zh-CN');
  });
});

describe('学段按关键词判，判不出就留空', () => {
  it('职业教育（EVoc / vocational）判中职/高职', () => {
    const r = analyzeMaterial(pages('EVoc 112 vocational training on multimeter usage.'), 'EVoc 112 Syllabus.docx');
    expect(r.grade).toBe(eduHubGradeOptions()[4]); // 中职/高职
  });

  it('大学 syllabus 判大学/本科', () => {
    const r = analyzeMaterial(pages('University course syllabus for undergraduate students, semester 1, lecture 3.'), 'syllabus.docx');
    expect(r.grade).toBe(eduHubGradeOptions()[5]);
  });

  it('八年级判初中', () => {
    const r = analyzeMaterial(pages('八年级物理下册 第三章 声现象'), '八年级物理.docx');
    expect(r.grade).toBe(eduHubGradeOptions()[2]);
  });

  it('没有任何学段信号 → null（宁可让老师选，也不冒充分析结果）', () => {
    const r = analyzeMaterial(pages('这是一段没有任何学段线索的通用说明文字。'), 'note.txt');
    expect(r.grade).toBeNull();
    expect(r.reason).toContain('学段没判出来');
  });
});

describe('时长按体量估', () => {
  it('短文按 40 分钟', () => {
    expect(analyzeMaterial(pages('短'.repeat(500))).durationMinutes).toBe(40);
  });
  it('中等篇幅按 45 分钟', () => {
    expect(analyzeMaterial(pages('中'.repeat(10000))).durationMinutes).toBe(45);
  });
  it('两万五千字以上按 90 分钟（一节 45 分钟塞不下）', () => {
    expect(analyzeMaterial(pages('长'.repeat(30000))).durationMinutes).toBe(90);
  });
});

describe('判定依据要说人话', () => {
  it('判出学段时把三项都写清楚', () => {
    const r = analyzeMaterial(pages('八年级数学 第一章'), 'x.docx');
    expect(r.reason).toContain('按文档判定');
    // 跨进程传的是稳定键，界面据此自己翻译；标签只留给主进程拼提示词用
    expect(r.gradeKey).toBeTruthy();
    expect(r.reason).toContain('初中');
    expect(r.reason).toContain('可改');
  });
});

/**
 * 判定结果里的**显示文案**是主进程在解析时翻译好、连同资料一起存盘的，
 * 界面后来换语言不会重算 —— 用户实拍过英文界面里挂着中文「按文档判定：英文 · 中职/高职」。
 * 更糟的是那个中文标签会被塞进渲染层的学段下拉框，两边语言不一致时对不上任何一项，
 * 连「生成教案」都会被「先选学段」挡住。所以跨进程必须有个不随语言变的键。
 */
describe('学段要给稳定键，不能只给翻译后的标签', () => {
  it('判得出学段时同时给出 gradeKey，且是约定的六个之一', async () => {
    const { analyzeMaterial } = await import('./eduHubStore');
    const r = analyzeMaterial([{ n: 1, text: '本教材面向中职学生，vocational training 课程安排如下。'.repeat(20) }], 'evoc.docx');
    expect(r.gradeKey).toBe('vocational');
    expect(['primary', 'primary_upper', 'junior', 'senior', 'vocational', 'university']).toContain(r.gradeKey);
  });

  it('判不出学段时 gradeKey 为 null，不硬猜', async () => {
    const { analyzeMaterial } = await import('./eduHubStore');
    const r = analyzeMaterial([{ n: 1, text: 'aaaa bbbb cccc dddd'.repeat(50) }], 'x.docx');
    expect(r.gradeKey).toBeNull();
    expect(r.grade).toBeNull();
  });

  it('gradeKey 与 grade 标签一一对应，不会一个有一个没有', async () => {
    const { analyzeMaterial } = await import('./eduHubStore');
    for (const text of ['小学三年级语文'.repeat(30), '大学本科 syllabus semester'.repeat(30), '毫无线索'.repeat(30)]) {
      const r = analyzeMaterial([{ n: 1, text }], 'x.docx');
      expect(Boolean(r.gradeKey)).toBe(Boolean(r.grade));
    }
  });
});
