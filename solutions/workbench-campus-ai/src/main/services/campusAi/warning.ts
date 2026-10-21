/**
 * 学业预警：读名单 / 成绩 / 考勤三类表 → 按规则逐人算不及格门数、不及格学分、缺勤率 → 红橙黄三级。
 *
 * 数字全部在这里算，模型不参与；每个人的级别带「依据」（哪几门、多少学分、缺勤几次）。
 * 一人一门课多条成绩（补考、重修）取最好的一次：只要有一次及格就不算不及格。
 */
import { basename } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import {
  CA_DATASET_ROLES, CA_LEVELS,
  type CaDatasetKey, type CaFailedCourse, type CaLevel, type CaSkippedRow, type CaStudentResult, type CaWarnRules, type CaWarnSummary,
} from '@totalclaw/ipc-contracts';
import { listSheetNames, readTable, type SheetTable } from '../serviceSettlement/excel';
import KW from './columnKeywords.json';

export interface RosterRow { studentId: string; name: string; className: string; college: string; major: string; counselor: string; counselorEmail: string }
export interface GradeRow { studentId: string; name: string; course: string; score: string; credit: number; term: string }
export interface AttendanceRow { studentId: string; name: string; course: string; absent: number; total: number }
export interface WarnData { roster: RosterRow[]; grades: GradeRow[]; attendance: AttendanceRow[] }

const COLS = KW.columns as Record<string, string[]>;

const norm = (s: string): string => String(s || '').toLowerCase().replace(/[\s_\-()（）:：]/g, '');

/** 认列：先整格相等、再包含；关键字按优先级；同一列不重复认给两个角色 */
export function detectMapping(headers: string[], dataset: CaDatasetKey, preset?: Record<string, string> | null): Record<string, string> {
  const roles = [...CA_DATASET_ROLES[dataset].required, ...CA_DATASET_ROLES[dataset].optional];
  const used = new Set<string>();
  const out: Record<string, string> = {};
  for (const r of roles) {
    const p = preset?.[r];
    if (p && headers.includes(p)) { out[r] = p; used.add(p); }
  }
  for (const pass of ['exact', 'contains'] as const) {
    for (const r of roles) {
      if (out[r]) continue;
      for (const kw of COLS[r] || []) {
        const k = norm(kw);
        const hit = headers.find((h) => !used.has(h) && (pass === 'exact' ? norm(h) === k : norm(h).includes(k)));
        if (hit) { out[r] = hit; used.add(hit); break; }
      }
    }
  }
  // 名单里「邮箱」只有在已认出辅导员时才算辅导员邮箱
  if (dataset === 'roster' && out.counselorEmail && !out.counselor) delete out.counselorEmail;
  return out;
}

export function missingRoles(dataset: CaDatasetKey, mapping: Record<string, string>): string[] {
  const miss = CA_DATASET_ROLES[dataset].required.filter((r) => !mapping[r]);
  // 考勤要么有状态列（逐次记录），要么有缺勤次数列（汇总）
  if (dataset === 'attendance' && !mapping.status && !mapping.absent) miss.push('absent');
  return miss;
}

export function roleLabel(role: string): string {
  return ({
    studentId: i18nT('学号'), name: i18nT('姓名'), className: i18nT('班级'), college: i18nT('学院'), major: i18nT('专业'),
    counselor: i18nT('辅导员'), counselorEmail: i18nT('辅导员邮箱'), course: i18nT('课程'), score: i18nT('成绩'), credit: i18nT('学分'),
    term: i18nT('学期'), status: i18nT('考勤状态'), absent: i18nT('缺勤次数'), total: i18nT('应到次数'), date: i18nT('日期'),
  } as Record<string, string>)[role] || role;
}

export function readSheet(path: string, sheet?: string): { table: SheetTable; sheetNames: string[] } {
  const sheetNames = (() => { try { return listSheetNames(path); } catch { return []; } })();
  return { table: readTable(path, { sheetName: sheet }), sheetNames };
}

const toNum = (v: string): number | null => {
  const s = String(v ?? '').replace(/[,，\s]/g, '').replace(/%$/, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const stuId = (v: string): string => String(v || '').trim().replace(/\.0$/, '');

const listHas = (list: string[], v: string): boolean => {
  const s = String(v || '').trim().toLowerCase();
  return !!s && list.some((x) => s === x.toLowerCase());
};

/** 成绩 → 是否及格。null = 不计（缓考、未录入、认不出） */
export function judgeScore(raw: string, passScore: number): { pass: boolean; display: string } | null {
  const s = String(raw ?? '').trim();
  if (!s || listHas(KW.skipGrades, s)) return null;
  const n = toNum(s);
  if (n !== null) return { pass: n >= passScore, display: s };
  if (listHas(KW.failGrades, s)) return { pass: false, display: s };
  const map = KW.passGrades as Record<string, number>;
  const key = Object.keys(map).find((k) => k.toLowerCase() === s.toLowerCase());
  if (key) return { pass: map[key] >= passScore, display: s };
  return null;
}

export interface ParseResult<T> { rows: T[]; skipped: CaSkippedRow[]; skippedCount: number; notes: string[] }

/** 表格行号：表头算第 1 行时，第 i 条数据在第 i+2 行（近似，标题行偏移不计） */
const rowNo = (i: number): number => i + 2;

export function parseRoster(table: SheetTable, m: Record<string, string>): ParseResult<RosterRow> {
  const rows: RosterRow[] = [];
  const skipped: CaSkippedRow[] = [];
  const seen = new Set<string>();
  table.rows.forEach((r, i) => {
    const id = stuId(r[m.studentId]);
    const name = String(r[m.name] || '').trim();
    if (!id) { skipped.push({ row: rowNo(i), reason: i18nT('没有学号') }); return; }
    if (!name) { skipped.push({ row: rowNo(i), reason: i18nT('没有姓名') }); return; }
    if (seen.has(id)) { skipped.push({ row: rowNo(i), reason: i18nT('学号重复，只留第一行') }); return; }
    seen.add(id);
    const g = (k: string) => (m[k] ? String(r[m[k]] || '').trim() : '');
    rows.push({ studentId: id, name, className: g('className'), college: g('college'), major: g('major'), counselor: g('counselor'), counselorEmail: g('counselorEmail') });
  });
  return { rows, skipped: skipped.slice(0, 50), skippedCount: skipped.length, notes: [] };
}

export function parseGrades(table: SheetTable, m: Record<string, string>): ParseResult<GradeRow> {
  const rows: GradeRow[] = [];
  const skipped: CaSkippedRow[] = [];
  const notes: string[] = [];
  table.rows.forEach((r, i) => {
    const id = stuId(r[m.studentId]);
    const course = String(r[m.course] || '').trim();
    const score = String(r[m.score] ?? '').trim();
    if (!id) { skipped.push({ row: rowNo(i), reason: i18nT('没有学号') }); return; }
    if (!course) { skipped.push({ row: rowNo(i), reason: i18nT('没有课程名称') }); return; }
    if (!score) { skipped.push({ row: rowNo(i), reason: i18nT('没有成绩') }); return; }
    const credit = m.credit ? toNum(r[m.credit]) : null;
    rows.push({ studentId: id, name: m.name ? String(r[m.name] || '').trim() : '', course, score, credit: credit !== null && credit >= 0 ? credit : 0, term: m.term ? String(r[m.term] || '').trim() : '' });
  });
  if (!m.credit) notes.push(i18nT('成绩表没有学分列：不及格学分记为 0，「不及格学分」不作为预警门槛'));
  return { rows, skipped: skipped.slice(0, 50), skippedCount: skipped.length, notes };
}

export function parseAttendance(table: SheetTable, m: Record<string, string>): ParseResult<AttendanceRow> {
  const rows: AttendanceRow[] = [];
  const skipped: CaSkippedRow[] = [];
  const notes: string[] = [];
  const byStatus = !!m.status && !m.absent;
  let unknownStatus = 0;
  let leave = 0;
  table.rows.forEach((r, i) => {
    const id = stuId(r[m.studentId]);
    if (!id) { skipped.push({ row: rowNo(i), reason: i18nT('没有学号') }); return; }
    const name = m.name ? String(r[m.name] || '').trim() : '';
    const course = m.course ? String(r[m.course] || '').trim() : '';
    if (byStatus) {
      const st = String(r[m.status] || '').trim();
      if (!st) { skipped.push({ row: rowNo(i), reason: i18nT('没有考勤状态') }); return; }
      const absent = KW.absentStatus.some((k) => st.toLowerCase().includes(k.toLowerCase()));
      const present = !absent && KW.presentStatus.some((k) => st.toLowerCase().includes(k.toLowerCase()));
      if (!absent && !present) { unknownStatus++; skipped.push({ row: rowNo(i), reason: i18nT('考勤状态认不出：{p0}', { p0: st.slice(0, 12) }) }); return; }
      if (/假/.test(st)) leave++;
      rows.push({ studentId: id, name, course, absent: absent ? 1 : 0, total: 1 });
    } else {
      const absent = toNum(r[m.absent]);
      if (absent === null || absent < 0) { skipped.push({ row: rowNo(i), reason: i18nT('缺勤次数不是数字') }); return; }
      const total = m.total ? toNum(r[m.total]) : null;
      if (total !== null && total < absent) { skipped.push({ row: rowNo(i), reason: i18nT('缺勤次数大于应到次数') }); return; }
      rows.push({ studentId: id, name, course, absent, total: total !== null && total > 0 ? total : 0 });
    }
  });
  if (byStatus) notes.push(i18nT('按逐次考勤记录统计：缺勤、旷课计为缺勤；迟到、早退、请假计为出勤'));
  if (leave) notes.push(i18nT('{n} 条请假记录不计缺勤', { n: leave }));
  if (unknownStatus) notes.push(i18nT('{n} 条考勤状态认不出，没有收下', { n: unknownStatus }));
  if (!byStatus && !m.total) notes.push(i18nT('考勤表没有应到次数：只统计缺勤次数，缺勤率不作为预警门槛'));
  return { rows, skipped: skipped.slice(0, 50), skippedCount: skipped.length, notes };
}

export function fileLabel(path: string): string { return basename(path); }

// ── 计算 ──────────────────────────────────────────────────────────────────────

const round1 = (n: number): number => Math.round(n * 10) / 10;
export const pctText = (r: number): string => `${round1(r * 100)}%`;

export function levelOf(fc: number, credits: number, rate: number | null, rules: CaWarnRules): { level: CaLevel | null; basis: string[] } {
  for (const lv of CA_LEVELS) {
    const r = rules[lv];
    const basis: string[] = [];
    if (r.failCourses > 0 && fc >= r.failCourses) basis.push(i18nT('不及格 {a} 门（门槛 {b} 门）', { a: fc, b: r.failCourses }));
    if (r.failCredits > 0 && credits > 0 && credits >= r.failCredits) basis.push(i18nT('不及格学分 {a}（门槛 {b}）', { a: round1(credits), b: r.failCredits }));
    if (r.absenceRate > 0 && rate !== null && rate >= r.absenceRate) basis.push(i18nT('缺勤率 {a}（门槛 {b}）', { a: pctText(rate), b: pctText(r.absenceRate) }));
    if (basis.length) return { level: lv, basis };
  }
  return { level: null, basis: [] };
}

export function computeWarnings(data: WarnData, rules: CaWarnRules): { results: CaStudentResult[]; summary: CaWarnSummary } {
  const roster = new Map(data.roster.map((r) => [r.studentId, r]));
  const ids = new Set<string>(data.roster.map((r) => r.studentId));
  const unknown = new Set<string>();
  const nameOf = new Map<string, string>();
  for (const g of data.grades) { if (!roster.has(g.studentId)) { unknown.add(g.studentId); ids.add(g.studentId); } if (g.name) nameOf.set(g.studentId, g.name); }
  for (const a of data.attendance) { if (!roster.has(a.studentId)) { unknown.add(a.studentId); ids.add(a.studentId); } if (a.name && !nameOf.has(a.studentId)) nameOf.set(a.studentId, a.name); }

  // 每人每门课取最好的一次
  const best = new Map<string, Map<string, { pass: boolean; display: string; credit: number; term: string; n: number }>>();
  for (const g of data.grades) {
    const j = judgeScore(g.score, rules.passScore);
    if (!j) continue;
    const key = g.course;
    const per = best.get(g.studentId) || new Map();
    const cur = per.get(key);
    const n = toNum(g.score);
    if (!cur || (!cur.pass && j.pass) || (cur.pass === j.pass && n !== null && n > cur.n)) {
      per.set(key, { pass: j.pass, display: j.display, credit: g.credit, term: g.term, n: n ?? (j.pass ? 1 : 0) });
    }
    best.set(g.studentId, per);
  }
  const att = new Map<string, { absent: number; total: number }>();
  for (const a of data.attendance) {
    const cur = att.get(a.studentId) || { absent: 0, total: 0 };
    cur.absent += a.absent; cur.total += a.total;
    att.set(a.studentId, cur);
  }

  const results: CaStudentResult[] = [];
  let noGrades = 0;
  for (const id of ids) {
    const r = roster.get(id);
    const per = best.get(id);
    if (!per || !per.size) noGrades++;
    const failed: CaFailedCourse[] = [...(per?.entries() || [])].filter(([, v]) => !v.pass).map(([course, v]) => ({ course, score: v.display, credit: v.credit, term: v.term || undefined }));
    const failCredits = failed.reduce((s, f) => s + f.credit, 0);
    const a = att.get(id);
    const rate = a && a.total > 0 ? a.absent / a.total : null;
    const { level, basis } = levelOf(failed.length, failCredits, rate, rules);
    if (level && a && a.total === 0 && a.absent > 0) basis.push(i18nT('缺勤 {n} 次（没有应到次数，未算缺勤率）', { n: a.absent }));
    results.push({
      studentId: id, name: r?.name || nameOf.get(id) || '', className: r?.className || '', college: r?.college || '', major: r?.major || '',
      counselor: r?.counselor || '', counselorEmail: r?.counselorEmail || '',
      failCourses: failed.length, failCredits: round1(failCredits), failed,
      absent: a?.absent || 0, totalSessions: a?.total || 0, absenceRate: rate === null ? null : Math.round(rate * 10000) / 10000,
      level, basis,
    });
  }
  const order = (l: CaLevel | null) => (l ? CA_LEVELS.indexOf(l) : 9);
  results.sort((x, y) => order(x.level) - order(y.level) || y.failCourses - x.failCourses || (y.absenceRate ?? 0) - (x.absenceRate ?? 0) || x.studentId.localeCompare(y.studentId));
  const byLevel: Record<CaLevel, number> = { red: 0, orange: 0, yellow: 0 };
  for (const s of results) if (s.level) byLevel[s.level]++;
  return {
    results,
    summary: {
      students: results.length,
      warned: byLevel.red + byLevel.orange + byLevel.yellow,
      byLevel,
      noGrades,
      noAttendance: data.attendance.length === 0,
      unknownStudents: [...unknown].slice(0, 200),
    },
  };
}
