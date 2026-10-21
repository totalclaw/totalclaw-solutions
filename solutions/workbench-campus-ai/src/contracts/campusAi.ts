/**
 * 解决方案 · 高校一体化 AI 智能体（校级 AI 中心）。docs/campus-ai-workbench.md
 *
 * 一条动作通道 WORKBENCH_CA_INVOKE（{ action, payload }），状态变化经 WORKBENCH_CA_EVENT 推给渲染层。
 * 模块：校园知识库 / 校园智能问答（含手机端与转办）/ 学业预警 / 运维审计。
 */

// ── 校园知识库 ────────────────────────────────────────────────────────────────

export type CaDocStatus = 'pending' | 'building' | 'built' | 'failed';

export interface CaDoc {
  id: string;
  name: string;
  dept: string;
  category: string;
  /** 知识库里留存的副本 */
  path: string;
  size: number;
  status: CaDocStatus;
  error?: string;
  /** 抽出的文字数 / 分段数（构建后） */
  chars: number;
  chunks: number;
  /** 抽取提示（扫描件 OCR、读到空文本等） */
  warning?: string;
  /** 课程资料（只给该课程的助教用，不进全校问答） */
  courseId?: string;
  addedAt: string;
  builtAt?: string;
}

export type CaFaqSource = 'manual' | 'import' | 'ticket';

export interface CaFaq {
  id: string;
  question: string;
  /** 相似问法 */
  similar: string[];
  answer: string;
  dept: string;
  source: CaFaqSource;
  createdAt: string;
  updatedAt: string;
  /** 被问答直接命中的次数 */
  hits: number;
}

export interface CaFaqInput {
  id?: string;
  question: string;
  similar?: string[];
  answer: string;
  dept?: string;
}

/** 检索命中（文档片段或 FAQ） */
export interface CaHit {
  kind: 'doc' | 'faq';
  id: string;
  title: string;
  dept: string;
  text: string;
  score: number;
  /** 文档片段序号 */
  chunk?: number;
}

// ── 校园智能问答 ──────────────────────────────────────────────────────────────

/**
 * faq：FAQ 命中，直接给部门审定的答案（不经模型）；
 * answer：依据检索到的原文作答；quote：模型回答里有原文找不到的数字，改为直接列出原文；
 * no_evidence：知识库里没有依据，已转办；sensitive：敏感问题，给求助方式并置顶转办。
 */
export type CaAnswerKind = 'faq' | 'answer' | 'quote' | 'no_evidence' | 'sensitive';
export type CaChannel = 'desk' | 'mobile';

export interface CaSource {
  kind: 'doc' | 'faq';
  id: string;
  title: string;
  dept: string;
  snippet: string;
}

export interface CaAnswer {
  qaId: string;
  kind: CaAnswerKind;
  /** 分到的领域助手 */
  domain?: string;
  text: string;
  sources: CaSource[];
  ticketId?: string;
  /** 转给了哪个部门 */
  dept?: string;
  ms: number;
}

export interface CaQaRecord {
  id: string;
  at: string;
  channel: CaChannel;
  domain?: string;
  /** 课程助教的问答 */
  courseId?: string;
  question: string;
  kind: CaAnswerKind;
  answer: string;
  sources: CaSource[];
  ticketId?: string;
  model?: string;
  feedback?: 'up' | 'down';
  ms: number;
}

export type CaTicketStatus = 'open' | 'answered' | 'closed';

export interface CaTicket {
  id: string;
  at: string;
  question: string;
  dept: string;
  status: CaTicketStatus;
  sensitive: boolean;
  channel: CaChannel;
  qaId?: string;
  answer?: string;
  answeredAt?: string;
  /** 答复沉淀成的 FAQ */
  faqId?: string;
  note?: string;
}

// ── 学业预警 ──────────────────────────────────────────────────────────────────

export type CaDatasetKey = 'roster' | 'grades' | 'attendance';
export const CA_DATASETS: CaDatasetKey[] = ['roster', 'grades', 'attendance'];

/** 各数据集要认的列。required 不全不能导入 */
export const CA_DATASET_ROLES: Record<CaDatasetKey, { required: string[]; optional: string[] }> = {
  roster: { required: ['studentId', 'name'], optional: ['className', 'college', 'major', 'counselor', 'counselorEmail'] },
  grades: { required: ['studentId', 'course', 'score'], optional: ['credit', 'term', 'name'] },
  attendance: { required: ['studentId'], optional: ['course', 'status', 'absent', 'total', 'date', 'name'] },
};

export interface CaSkippedRow { row: number; reason: string }

export interface CaDatasetMeta {
  path: string;
  fileName: string;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  rowCount: number;
  preview: Record<string, string>[];
  mapping: Record<string, string>;
  missing: string[];
  loaded: boolean;
  count: number;
  skippedCount: number;
  skipped: CaSkippedRow[];
  notes: string[];
  loadedAt: string;
}

export type CaLevel = 'red' | 'orange' | 'yellow';
export const CA_LEVELS: CaLevel[] = ['red', 'orange', 'yellow'];

/** 某一级的门槛：任一条满足即达到该级 */
export interface CaLevelRule {
  failCourses: number;
  failCredits: number;
  /** 缺勤率（0~1） */
  absenceRate: number;
}

export interface CaWarnRules {
  passScore: number;
  red: CaLevelRule;
  orange: CaLevelRule;
  yellow: CaLevelRule;
}

export interface CaFailedCourse { course: string; score: string; credit: number; term?: string }

export interface CaStudentResult {
  studentId: string;
  name: string;
  className: string;
  college: string;
  major: string;
  counselor: string;
  counselorEmail: string;
  failCourses: number;
  failCredits: number;
  failed: CaFailedCourse[];
  absent: number;
  totalSessions: number;
  /** 没有考勤数据时为 null */
  absenceRate: number | null;
  level: CaLevel | null;
  /** 达到该级的依据（人话，带数字） */
  basis: string[];
}

export type CaReviewStatus = 'pending' | 'confirmed' | 'dismissed';

export interface CaReview {
  status: CaReviewStatus;
  /** 辅导员调整后的级别（空 = 用计算结果） */
  level?: CaLevel;
  note?: string;
  at?: string;
}

export interface CaNotice {
  studentId: string;
  /** 谈话提纲（不含姓名学号） */
  outline: string;
  /** 给学生的通知草稿（姓名用 [STUDENT] 占位，导出时替换） */
  notice: string;
  /** model：模型写的且数字核对通过；template：规则模板（模型没写好或没调模型） */
  by: 'model' | 'template';
  model?: string;
  at: string;
}

export interface CaWarnSummary {
  students: number;
  warned: number;
  byLevel: Record<CaLevel, number>;
  noGrades: number;
  noAttendance: boolean;
  unknownStudents: string[];
}

export interface CaWarnRun {
  id: string;
  computedAt: string;
  rules: CaWarnRules;
  summary: CaWarnSummary;
  reviews: Record<string, CaReview>;
  notices: Record<string, CaNotice>;
  stale: boolean;
  staleReason?: string;
  exportedAt?: string;
  exportDir?: string;
}

// ── 运维 ──────────────────────────────────────────────────────────────────────

export type CaModule = 'kb' | 'qa' | 'mobile' | 'ticket' | 'warning' | 'ops' | 'apps' | 'teach' | 'research' | 'gov';

export interface CaAuditEntry {
  at: string;
  module: CaModule;
  action: string;
  ok: boolean;
  ms?: number;
  /** 不含学生个人信息原文 */
  detail?: string;
}

/** 学校档案（运维与设置里填写，页头、手机端、导出文件与提示词用） */
export interface CaSchoolProfile {
  englishName: string;
  motto: string;
  /** 建校年份 */
  founded: string;
  address: string;
  website: string;
  intro: string;
  /** 校徽文件（账号目录 brand/ 下的副本；空 = 没传） */
  logoPath: string;
}

export interface CaSettings {
  /** 学校名称（空 = 没填，界面不显示校名） */
  schoolName: string;
  profile: CaSchoolProfile;
  depts: string[];
  categories: string[];
  /** 敏感问题转给的部门 */
  sensitiveDept: string;
  /** 学校心理咨询 / 值班电话 */
  hotline: string;
  /** 问答记录保留天数 */
  retentionDays: number;
  /** 手机端每台设备每天最多提问次数 */
  mobileDailyLimit: number;
  /** 检索证据下限（0~1） */
  minScore: number;
  outputDir: string;
  warnRules: CaWarnRules;
}

export interface CaMobileStatus {
  running: boolean;
  url: string | null;
  /** 带校园口令的扫码地址 */
  joinUrl: string | null;
  port: number | null;
}

export interface CaStats {
  docs: number;
  docsBuilt: number;
  chunks: number;
  faqs: number;
  qaTotal: number;
  qa7d: number;
  /** 自动答复率：faq + answer + quote 占全部的比例（无记录为 null） */
  autoRate: number | null;
  byKind: Record<CaAnswerKind, number>;
  openTickets: number;
  sensitiveOpen: number;
  warnPending: number;
  byDay: Array<{ day: string; qa: number; auto: number }>;
  topQuestions: Array<{ question: string; count: number }>;
  byDomain: Array<{ id: string; name: string; count: number }>;
  /** 各方向：场景总数 / 已上线 / 近 30 天用量 */
  directions: Record<CaDirection, { scenarios: number; live: number; usage30d: number }>;
  courses: number;
  questions: number;
  outputs: number;
  officialDocs: number;
  /** 最近几条问答（总览滚动用；只有问题与答复方式） */
  recent: Array<{ at: string; question: string; kind: CaAnswerKind; domain?: string; channel: CaChannel }>;
}

export interface CaState {
  settings: CaSettings;
  defaults: { warnRules: CaWarnRules };
  docs: CaDoc[];
  faqs: CaFaq[];
  tickets: CaTicket[];
  datasets: Record<CaDatasetKey, CaDatasetMeta | null>;
  warn: CaWarnRun | null;
  mobile: CaMobileStatus;
  stats: CaStats;
  outputDir: string;
  /** 当前默认大模型（空 = 没配） */
  model: string;
  /** 校徽（data URL，没传为空） */
  logo: string;
  scenarios: CaScenario[];
  domains: CaDomain[];
  courses: CaCourse[];
  gradings: Array<Pick<CaGrading, 'id' | 'title' | 'courseId' | 'createdAt' | 'gradedAt' | 'exportedAt' | 'exportPath'> & { students: number; confirmed: number }>;
  research: { outputsFile: string; outputs: number; skipped: number; stats: CaResearchStats | null; guides: CaGuide[] };
  officialDocs: CaOfficialDoc[];
}

// ── 五大方向与 AI 应用中心 ─────────────────────────────────────────────────────

/** 统一规划建设运维 / 教学 / 科研 / 校务治理 / 师生服务 */
export type CaDirection = 'plan' | 'teach' | 'research' | 'gov' | 'service';
export const CA_DIRECTIONS: CaDirection[] = ['plan', 'teach', 'research', 'gov', 'service'];

export type CaStage = 'planned' | 'building' | 'live';

export interface CaScenario {
  id: string;
  direction: CaDirection;
  name: string;
  desc: string;
  dept: string;
  stage: CaStage;
  /** 内置场景对应的页签或路由；自定义规划项为空 */
  target?: string;
  builtin: boolean;
  note?: string;
  /** 近 30 天调用次数（来自审计） */
  usage30d: number;
}

export interface CaScenarioInput {
  id?: string;
  direction: CaDirection;
  name: string;
  desc?: string;
  dept?: string;
  stage: CaStage;
  note?: string;
}

/** 问答意图分到的领域助手 */
export interface CaDomain {
  id: string;
  name: string;
  dept: string;
}

// ── 教学 ──────────────────────────────────────────────────────────────────────

export interface CaCourse {
  id: string;
  name: string;
  teacher: string;
  /** 学生能不能在手机上问这门课的助教 */
  publicTutor: boolean;
  createdAt: string;
}

export type CaQuestionType = 'single' | 'multiple' | 'judge' | 'short';
export const CA_QUESTION_TYPES: CaQuestionType[] = ['single', 'multiple', 'judge', 'short'];

export interface CaQuestion {
  id: string;
  courseId: string;
  type: CaQuestionType;
  stem: string;
  /** 选择题选项（A、B、C、D 顺序） */
  options: string[];
  /** 单选 "B"；多选 "AC"；判断 "T"/"F"；简答为参考答案 */
  answer: string;
  explanation: string;
  /** 出处：资料名 + 原文片段（已逐字核对） */
  sourceTitle: string;
  sourceQuote: string;
  /** 简答题评分要点 */
  points: string[];
  score: number;
  reviewed: boolean;
  createdAt: string;
}

export interface CaKeyItem {
  no: string;
  /** 从题库生成时带上题干（简答题批改时给模型看） */
  stem?: string;
  type: CaQuestionType;
  answer: string;
  score: number;
  points: string[];
}

export interface CaGradeItem {
  no: string;
  response: string;
  /** 客观题自动判分；主观题模型建议分 */
  auto: number | null;
  /** 教师确认后的分数（空 = 未确认） */
  final: number | null;
  max: number;
  reason: string;
  by: 'rule' | 'model' | 'teacher' | 'pending';
}

export interface CaGradeRow {
  studentId: string;
  name: string;
  items: CaGradeItem[];
  total: number;
  confirmed: boolean;
}

export interface CaGrading {
  id: string;
  title: string;
  courseId: string;
  key: CaKeyItem[];
  keyFile: string;
  answersFile: string;
  rows: CaGradeRow[];
  createdAt: string;
  gradedAt?: string;
  exportedAt?: string;
  exportPath?: string;
}

// ── 科研 ──────────────────────────────────────────────────────────────────────

export interface CaOutput {
  title: string;
  type: string;
  college: string;
  owner: string;
  year: string;
  level: string;
  funding: number;
}

export interface CaResearchStats {
  total: number;
  funding: number;
  byYear: Array<{ key: string; count: number; funding: number }>;
  byType: Array<{ key: string; count: number; funding: number }>;
  byCollege: Array<{ key: string; count: number; funding: number }>;
  byLevel: Array<{ key: string; count: number; funding: number }>;
  /** 学院 × 类型 */
  matrix: { rows: string[]; cols: string[]; cells: number[][] };
}

export interface CaGuideItem { text: string; quote: string; date?: string; verified: boolean }

export interface CaGuide {
  id: string;
  fileName: string;
  path: string;
  at: string;
  title: string;
  deadlines: CaGuideItem[];
  eligibility: CaGuideItem[];
  materials: CaGuideItem[];
  funding: CaGuideItem[];
  contacts: CaGuideItem[];
  /** 模型给了、但原文里找不到引文而丢掉的条数 */
  dropped: number;
  model?: string;
}

// ── 校务治理 ──────────────────────────────────────────────────────────────────

export type CaDocKind = 'notice' | 'request' | 'report' | 'letter' | 'minutes';
export const CA_DOC_KINDS: CaDocKind[] = ['notice', 'request', 'report', 'letter', 'minutes'];

export interface CaOfficialDoc {
  id: string;
  kind: CaDocKind;
  issuer: string;
  docNo: string;
  title: string;
  recipients: string;
  points: string;
  attachments: string;
  date: string;
  body: string;
  /** 正文里出现、要点里没有的数字（提醒人工核对） */
  unverified: string[];
  model?: string;
  createdAt: string;
  updatedAt: string;
  docxPath?: string;
}

export interface CaHotspotReport {
  from: string;
  to: string;
  total: number;
  prevTotal: number;
  autoRate: number | null;
  byDomain: Array<{ id: string; name: string; count: number; noEvidence: number; prev: number }>;
  byDept: Array<{ dept: string; open: number; answered: number; avgHours: number | null; overdue: number }>;
  keywords: Array<{ term: string; count: number }>;
  /** 知识库缺口：反复被问却没有依据的问题 */
  gaps: Array<{ question: string; count: number; domain: string }>;
  sensitive: number;
  negative: number;
  summary?: string;
  summaryBy?: 'model' | 'template';
}
