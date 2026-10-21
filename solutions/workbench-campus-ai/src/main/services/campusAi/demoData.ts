/**
 * 示例数据：知识库 5 份校园文档 + FAQ 表；学业预警 4 个班约 120 人的名单 / 成绩 / 考勤。
 * 人名由姓 + 名随机拼，邮箱用 example.edu.cn；固定种子，每次生成一样的数据。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { writeWorkbook } from '../serviceSettlement/excel';
import DEMO from './demoCampus.json';

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DemoKbFiles { docs: Array<{ path: string; dept: string; category: string }>; faqFile: string }

export function writeDemoKb(dir: string): DemoKbFiles {
  mkdirSync(dir, { recursive: true });
  const docs = DEMO.docs.map((d) => {
    const path = join(dir, d.file);
    writeFileSync(path, d.text, 'utf-8');
    return { path, dept: d.dept, category: d.category };
  });
  const faqFile = join(dir, '示例-常见问题FAQ.xlsx');
  writeWorkbook(faqFile, [{
    name: 'FAQ',
    headers: ['问题', '相似问法', '答案', '部门'],
    rows: DEMO.faqs.map((f) => [f.question, f.similar.join('；'), f.answer, f.dept]),
  }]);
  return { docs, faqFile };
}

export interface DemoStudentFiles { roster: string; grades: string; attendance: string; students: number }

export function writeDemoStudents(dir: string): DemoStudentFiles {
  mkdirSync(dir, { recursive: true });
  const r = rng(20261021);
  const pick = <T>(list: T[]): T => list[Math.floor(r() * list.length)];
  const gauss = (): number => (r() + r() + r() + r() - 2) * 1.7;
  const usedNames = new Set<string>();
  const roster: (string | number)[][] = [];
  const grades: (string | number)[][] = [];
  const attendance: (string | number)[][] = [];
  let seq = 0;
  DEMO.classes.forEach((c, ci) => {
    for (let k = 0; k < 30; k++) {
      seq++;
      const id = `2024${String(ci + 1).padStart(2, '0')}${String(k + 1).padStart(3, '0')}`;
      let name = '';
      do { name = pick(DEMO.surnames) + pick(DEMO.given); } while (usedNames.has(name));
      usedNames.add(name);
      roster.push([id, name, c.className, c.college, c.major, c.counselor, c.counselorEmail]);
      // 大约十分之一的学生基础薄弱，二十分之一缺勤多
      const weak = r() < 0.1;
      const truant = r() < 0.06;
      const ability = weak ? 50 + gauss() * 6 : 76 + gauss() * 7;
      for (const [course, credit] of c.courses as Array<[string, number]>) {
        let score = Math.round(Math.min(100, Math.max(18, ability + gauss() * 7)));
        if (course === '体育' && score < 60 && r() < 0.7) score = 60 + Math.round(r() * 20);
        grades.push([id, name, course, credit, '2025-2026-1', score]);
        if (score < 60 && r() < 0.35) grades.push([id, name, course, credit, '2025-2026-1补考', 60 + Math.round(r() * 12)]);
        const total = credit * 8;
        const absent = truant ? Math.round(total * (0.22 + r() * 0.2)) : weak ? Math.round(r() * total * 0.15) : (r() < 0.25 ? 1 + Math.floor(r() * 2) : 0);
        attendance.push([id, name, course, Math.min(absent, total), total]);
      }
    }
  });
  const rosterFile = join(dir, '示例-学生名单.xlsx');
  const gradesFile = join(dir, '示例-课程成绩.xlsx');
  const attFile = join(dir, '示例-考勤汇总.xlsx');
  writeWorkbook(rosterFile, [{ name: '学生名单', headers: ['学号', '姓名', '班级', '学院', '专业', '辅导员', '辅导员邮箱'], rows: roster }]);
  writeWorkbook(gradesFile, [{ name: '成绩', headers: ['学号', '姓名', '课程名称', '学分', '学期', '总评成绩'], rows: grades }]);
  writeWorkbook(attFile, [{ name: '考勤', headers: ['学号', '姓名', '课程', '缺勤次数', '应到次数'], rows: attendance }]);
  return { roster: rosterFile, grades: gradesFile, attendance: attFile, students: seq };
}

// ── 教学 / 科研示例 ─────────────────────────────────────────────────────────────

export interface DemoCourseFiles { courseName: string; teacher: string; docs: string[]; keyFile: string; answersFile: string }

/** 一门课的讲义 + 5 道题的标准答案 + 20 名学生的作答（简答题作答质量有好有差） */
export function writeDemoCourse(dir: string): DemoCourseFiles {
  mkdirSync(dir, { recursive: true });
  const C = DEMO.course;
  const doc = join(dir, C.file);
  writeFileSync(doc, C.text, 'utf-8');
  const keyFile = join(dir, '示例-电工电子技术作业-标准答案.xlsx');
  writeWorkbook(keyFile, [{ name: '标准答案', headers: ['题号', '题型', '标准答案', '分值', '评分要点'], rows: DEMO.key.map((k) => [k.no, k.type, k.answer, k.score, k.points]) }]);
  const r = rng(20261022);
  const pick = <T>(list: T[]): T => list[Math.floor(r() * list.length)];
  const rows: (string | number)[][] = [];
  const used = new Set<string>();
  for (let i = 0; i < 20; i++) {
    let name = '';
    do { name = pick(DEMO.surnames) + pick(DEMO.given); } while (used.has(name));
    used.add(name);
    const good = r() < 0.65;
    const short = DEMO.shortAnswers as Record<string, string[]>;
    rows.push([
      `2024010${String(i + 1).padStart(2, '0')}`, name,
      good ? 'B' : pick(['A', 'C', 'D', 'B']),
      good ? '对' : pick(['对', '错']),
      good ? 'AC' : pick(['A', 'AC', 'ABC', 'C']),
      good ? short['4'][Math.floor(r() * 3)] : pick(short['4']),
      good ? short['5'][Math.floor(r() * 2)] : pick(short['5']),
    ]);
  }
  const answersFile = join(dir, '示例-电工电子技术作业-学生作答.xlsx');
  writeWorkbook(answersFile, [{ name: '作答', headers: ['学号', '姓名', '第1题', '第2题', '第3题', '第4题', '第5题'], rows }]);
  return { courseName: C.name, teacher: C.teacher, docs: [doc], keyFile, answersFile };
}

/** 约 80 条科研成果：论文 / 专利 / 纵向项目 / 横向项目 / 获奖 / 著作 */
export function writeDemoOutputs(dir: string): string {
  mkdirSync(dir, { recursive: true });
  const r = rng(20261023);
  const pick = <T>(list: T[]): T => list[Math.floor(r() * list.length)];
  const colleges = ['智能制造学院', '信息工程学院', '经济管理学院', '建筑工程学院', '马克思主义学院'];
  const types: Array<[string, number]> = [['论文', 0], ['专利', 0], ['纵向项目', 1], ['横向项目', 1], ['获奖', 0], ['著作', 0]];
  const levels = ['国家级', '省级', '市级', '校级'];
  const topics = ['工业机器人', '智能传感', '数字孪生', '跨境电商', '乡村振兴', '装配式建筑', '职业教育', '大数据', '新能源汽车', '课程思政'];
  const rows: (string | number)[][] = [];
  for (let i = 0; i < 80; i++) {
    const [type, funded] = pick(types);
    const college = pick(colleges);
    const year = 2022 + Math.floor(r() * 5);
    const level = type === '论文' ? pick(['核心期刊', '普通期刊']) : pick(levels);
    const fund = funded ? Math.round((type === '纵向项目' ? 2 + r() * 28 : 5 + r() * 45) * 10) / 10 : '';
    rows.push([`${pick(topics)}${pick(['关键技术研究', '应用研究', '实践探索', '系统设计', '教学改革研究'])}${i + 1}`, type, college, pick(DEMO.surnames) + pick(DEMO.given), `${year}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}`, level, fund]);
  }
  const file = join(dir, '示例-科研成果登记表.xlsx');
  writeWorkbook(file, [{ name: '成果', headers: ['成果名称', '成果类型', '所属学院', '负责人', '立项/发表日期', '级别', '经费（万元）'], rows }]);
  return file;
}

export function writeDemoGuide(dir: string): string {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, DEMO.guide.file);
  writeFileSync(file, DEMO.guide.text, 'utf-8');
  return file;
}
