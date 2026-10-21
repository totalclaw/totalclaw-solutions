/**
 * 案件存储：沙特三模块的任务实体 + 审批 + 输出中心 + 审计留痕。
 *
 * 三条硬约束（需求 P0-10 / P0-11 / P0-12 / P0-17）：
 *   1. **批准前不能发送** —— 未审批的输出物一律 draft=true，导出带 DRAFT 水印，
 *      simulateSend 在未审批时直接 blocked，不是靠前端按钮 disabled 兜底；
 *   2. **全平台不存在真实外发路径** —— 发送只写一条回执，明确写"未真实发送"；
 *   3. **任一最终数字都能反查**「谁在什么时候把 AI 的 X 改成了 Y」—— 每次字段编辑、
 *      每次审批动作、每次增量重算都落一条审计。
 */
import { EventEmitter } from 'events';
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'fs';
import { join, sep } from 'path';
import type {
  CaseAuditEntryDTO, CaseDecideRequest, CaseDeliveryDirsDTO, CaseDTO, CaseOutputDTO,
  CaseRecordRecalcRequest, CaseValidationDTO, IntakeFilingMode, IntakeFilingSettingsDTO, IntakeModuleId,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { IntakeLogger } from './intakeService';

export interface SaudiCaseStoreOptions {
  totalclawHome: string;
  logger?: IntakeLogger;
}

interface CaseStoreShape {
  version: 1;
  cases: CaseDTO[];
  audit: CaseAuditEntryDTO[];
  /** 用户自选的另存目录（导出 / 备份）；案件目录始终是权威副本 */
  deliveryDirs?: CaseDeliveryDirsDTO;
  /** 收件箱建档模式（按模块各记各的）。持久化在这里，重进页面/重启都还在 */
  filing?: IntakeFilingSettingsDTO;
}

const EXT_BY_KIND: Record<CaseOutputDTO['kind'], string> = {
  word: '.docx',
  excel: '.xlsx',
  pdf: '.pdf',
  email: '.eml',
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** 任务编号的模块前缀。用行业通用缩写，客户一眼知道是哪类事。 */
const CASE_NO_PREFIX: Record<Exclude<IntakeModuleId, 'unclassified'>, string> = {
  'rfq-quote': 'RFQ',
  'bid-decision': 'BID',
  'advisory-report': 'ADV',
};

/**
 * 生成可读任务编号：`RFQ-2026-0813-001`。
 *
 * 序号按「同模块 + 同一天」递增，取当天已有编号的最大值 +1（不是用 length，
 * 中间删过案件的话 length 会撞号）。跨天自动从 001 重来。
 */
export function nextCaseNo(
  existing: readonly { caseNo?: string }[],
  module: Exclude<IntakeModuleId, 'unclassified'>,
  now: Date,
): string {
  const prefix = CASE_NO_PREFIX[module] || 'CASE';
  const y = now.getFullYear();
  const md = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const head = `${prefix}-${y}-${md}-`;
  let max = 0;
  for (const c of existing) {
    if (!c.caseNo?.startsWith(head)) continue;
    const n = Number(c.caseNo.slice(head.length));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${head}${String(max + 1).padStart(3, '0')}`;
}

export class SaudiCaseStore extends EventEmitter {
  private readonly root: string;
  private readonly storePath: string;
  private readonly logger?: IntakeLogger;
  private store: CaseStoreShape = { version: 1, cases: [], audit: [] };

  constructor(options: SaudiCaseStoreOptions) {
    super();
    this.root = join(options.totalclawHome, 'cases');
    this.storePath = join(this.root, 'case-store.json');
    this.logger = options.logger;
    if (!existsSync(this.root)) mkdirSync(this.root, { recursive: true });
    this.load();
  }

  private load(): void {
    if (!existsSync(this.storePath)) return;
    try {
      const parsed = JSON.parse(readFileSync(this.storePath, 'utf-8'));
      if (parsed && Array.isArray(parsed.cases)) {
        this.store = {
          version: 1,
          cases: parsed.cases,
          audit: Array.isArray(parsed.audit) ? parsed.audit : [],
          deliveryDirs: parsed.deliveryDirs || {},
          filing: parsed.filing && typeof parsed.filing === 'object' ? parsed.filing : { byModule: {} },
        };
        this.backfillCaseNumbers();
      }
    } catch (error) {
      this.logger?.warn(i18nT('[case] 案件存档损坏，已从空状态开始'), { detail: (error as Error)?.message });
    }
  }

  /**
   * 给升级前建的案件补编号。按 createdAt 从早到晚补，保证「先建的号更小」，
   * 否则界面按编号排序会和实际先后颠倒。补完落一次盘，之后就稳定了。
   */
  private backfillCaseNumbers(): void {
    const missing = this.store.cases.filter((c) => !c.caseNo);
    if (!missing.length) return;
    missing.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    for (const record of missing) {
      const at = new Date(record.createdAt || Date.now());
      record.caseNo = nextCaseNo(this.store.cases, record.module, Number.isNaN(at.getTime()) ? new Date() : at);
    }
    this.logger?.info?.(i18nT('[case] 已为历史案件补任务编号'), { count: missing.length });
    this.save();
  }

  private save(): void {
    try {
      const tmp = `${this.storePath}.part`;
      writeFileSync(tmp, JSON.stringify(this.store, null, 2), 'utf-8');
      renameSync(tmp, this.storePath);
    } catch (error) {
      this.logger?.error(i18nT('[case] 案件存档写入失败'), { detail: (error as Error)?.message });
    }
  }

  private audit(entry: Omit<CaseAuditEntryDTO, 'id' | 'at'> & { caseId: string }): void {
    const record: CaseAuditEntryDTO & { caseId?: string } = {
      id: newId('aud'),
      at: nowIso(),
      ...entry,
    };
    this.store.audit.unshift(record as CaseAuditEntryDTO & { caseId: string });
    if (this.store.audit.length > 5000) this.store.audit = this.store.audit.slice(0, 4000);
  }

  /** 发送被拦（未审批）也要留痕 —— 事后能查到「谁试图在批准前发出去」。 */
  recordSendBlocked(caseId: string, outputName: string): void {
    const record = this.get(caseId);
    if (!record) return;
    this.audit({
      caseId, actor: record.owner, role: 'system',
      action: i18nT('发送被拦截'), target: outputName, note: i18nT('未审批'),
    });
    this.save();
  }

  /**
   * 记一次**真实**发送。与 simulateSend 走同一套状态流转（→ delivered），
   * 但审计里明确写清是真发、发给了谁、SMTP 回执 id 是多少 ——
   * 「到底发没发出去」这件事必须能一眼查到，不能和模拟混在一起。
   */
  recordRealSend(input: {
    caseId: string; outputId: string; to: string[]; cc?: string; subject: string; messageId?: string;
  }): string {
    const record = this.get(input.caseId);
    const output = record?.outputs.find((o) => o.id === input.outputId);
    if (!record || !output) return '';
    const receipt = [
      i18nT('已真实发送'),
      `${i18nT('任务编号')}: ${record.caseNo}`,
      `${i18nT('文件')}: ${output.name} ${output.version}`,
      `${i18nT('主题')}: ${input.subject}`,
      `${i18nT('收件人')}: ${input.to.join(', ') || '-'}`,
      input.cc ? `${i18nT('抄送')}: ${input.cc}` : '',
      `${i18nT('回执 ID')}: ${input.messageId || '-'}`,
      `${i18nT('时间')}: ${nowIso()}`,
    ].filter(Boolean).join('\n');
    record.status = 'delivered';
    record.updatedAt = nowIso();
    this.audit({
      caseId: record.id, actor: record.owner, role: 'system',
      action: i18nT('真实发送邮件'),
      target: `${output.name} ${output.version}`,
      note: `${input.to.join(', ')}${input.cc ? ` / cc ${input.cc}` : ''} · ${input.messageId || ''}`,
    });
    this.save();
    this.emit('changed', { type: 'sent', caseId: record.id });
    return receipt;
  }

  /** 输出物 relPath（相对 cases 根）→ 绝对路径。越界一律回 null。 */
  outputAbsolutePath(relPath: string): string | null {
    const full = join(this.root, relPath);
    const rootWithSep = this.root.endsWith(sep) ? this.root : this.root + sep;
    return full.startsWith(rootWithSep) ? full : null;
  }

  /**
   * 建档模式。默认 **manual** —— 演示时要一步步讲「收到 → 人看一眼 → 建档」，
   * 自动建案会把这一幕跳过去；真实业务跑顺了再由用户切 auto。
   */
  getFilingMode(module: IntakeModuleId): IntakeFilingMode {
    return this.store.filing?.byModule?.[module] === 'auto' ? 'auto' : 'manual';
  }

  getFilingSettings(): IntakeFilingSettingsDTO {
    return { byModule: { ...(this.store.filing?.byModule || {}) } };
  }

  setFilingMode(module: IntakeModuleId, mode: IntakeFilingMode): IntakeFilingSettingsDTO {
    if (!this.store.filing) this.store.filing = { byModule: {} };
    this.store.filing.byModule = { ...this.store.filing.byModule, [module]: mode };
    this.save();
    this.emit('changed', { type: 'filing-mode' });
    return this.getFilingSettings();
  }

  getDeliveryDirs(): CaseDeliveryDirsDTO {
    return { ...(this.store.deliveryDirs || {}) };
  }

  setDeliveryDirs(next: CaseDeliveryDirsDTO): CaseDeliveryDirsDTO {
    this.store.deliveryDirs = { ...(this.store.deliveryDirs || {}), ...next };
    this.save();
    this.emit('changed', { type: 'delivery-dirs' });
    return this.getDeliveryDirs();
  }

  /**
   * 把正式件另存到用户指定的导出/备份目录。
   *
   * 案件目录里那份始终是权威副本，这里只是**多复制一份**方便人取用（共享盘 / 留档）。
   * 目录不存在就建；复制失败只 warn —— 备份盘没插、共享盘掉线不该让「生成报价」整个失败。
   * 文件名前缀上任务编号，一堆文件混在一个目录里时还认得出是哪个任务的。
   */
  private exportCopies(record: CaseDTO, sourcePath: string, fileName: string): string[] {
    const dirs = this.store.deliveryDirs || {};
    const targets = [dirs.outputDir, dirs.backupDir].filter(Boolean) as string[];
    const written: string[] = [];
    for (const dir of targets) {
      try {
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        const target = join(dir, `${record.caseNo || record.id}-${fileName}`);
        copyFileSync(sourcePath, target);
        written.push(target);
      } catch (error) {
        this.logger?.warn(i18nT('[case] 正式件另存失败（案件目录里的那份不受影响）'), {
          dir, detail: (error as Error)?.message,
        });
      }
    }
    return written;
  }

  list(module?: IntakeModuleId): CaseDTO[] {
    const all = this.store.cases;
    return module && module !== 'unclassified' ? all.filter((c) => c.module === module) : [...all];
  }

  get(caseId: string): CaseDTO | undefined {
    return this.store.cases.find((c) => c.id === caseId);
  }

  create(input: {
    module: Exclude<IntakeModuleId, 'unclassified'>;
    subject: string;
    customer: string;
    deadline?: string;
    owner?: string;
    itemIds: string[];
  }): CaseDTO {
    const record: CaseDTO = {
      id: newId('case'),
      caseNo: nextCaseNo(this.store.cases, input.module, new Date()),
      module: input.module,
      subject: input.subject,
      customer: input.customer,
      deadline: input.deadline,
      owner: input.owner || i18nT('未指派'),
      status: 'received',
      version: 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      itemIds: [...input.itemIds],
      outputs: [],
      edits: {},
    };
    this.store.cases.unshift(record);
    this.audit({
      caseId: record.id,
      actor: record.owner,
      role: 'system',
      action: i18nT('建案'),
      target: record.subject,
      note: i18nT('来源条目 {p0} 条', { p0: input.itemIds.length }),
    });
    this.save();
    this.emit('changed', { type: 'created', caseId: record.id });
    return record;
  }

  /** 卡片字段人工修改 —— 审计要能反查「谁把 AI 的 X 改成了 Y」。 */
  editField(input: {
    caseId: string; cardId: string; fieldKey: string; label: string;
    before: string; after: string; actor?: string;
  }): CaseDTO | undefined {
    const record = this.get(input.caseId);
    if (!record) return undefined;
    const actor = input.actor || record.owner;
    record.edits[`${input.cardId}.${input.fieldKey}`] = {
      before: input.before, after: input.after, by: actor, at: nowIso(),
    };
    record.updatedAt = nowIso();
    if (record.status === 'received' || record.status === 'parsed') record.status = 'analyzed';
    this.audit({
      caseId: record.id,
      actor,
      role: 'operator',
      action: i18nT('修改字段'),
      target: `${input.cardId} · ${input.label}`,
      before: input.before,
      after: input.after,
    });
    this.save();
    this.emit('changed', { type: 'edited', caseId: record.id });
    return record;
  }

  submit(caseId: string, actor?: string): CaseDTO | undefined {
    const record = this.get(caseId);
    if (!record) return undefined;
    record.status = 'pending_approval';
    record.updatedAt = nowIso();
    this.audit({
      caseId, actor: actor || record.owner, role: 'operator',
      action: i18nT('提交审批'), target: record.subject,
    });
    this.save();
    this.emit('changed', { type: 'submitted', caseId });
    return record;
  }

  /** 审批五动作。return / reject 必须给理由——不给就拒绝执行，不是前端提示了事。 */
  decide(request: CaseDecideRequest): { case?: CaseDTO; message?: string } {
    const record = this.get(request.caseId);
    if (!record) return { message: i18nT('案件不存在') };
    if ((request.action === 'return' || request.action === 'reject') && !request.reason?.trim()) {
      return { message: i18nT('退回 / 拒绝必须填写理由') };
    }
    const actor = request.actor || i18nT('审批人');
    const statusByAction: Record<CaseDecideRequest['action'], CaseDTO['status']> = {
      approve: 'approved',
      approve_with_edits: 'approved_with_edits',
      return: 'returned',
      reject: 'rejected',
      reassign: 'reassigned',
    };
    record.status = statusByAction[request.action];
    record.decision = { action: request.action, by: actor, at: nowIso(), reason: request.reason };
    if (request.action === 'reassign' && request.assignee) record.owner = request.assignee;
    record.updatedAt = nowIso();

    // 审批通过 → 解锁发送。但二进制正式件的水印是**画进文件内部**的，
    // 翻个标志位去不掉它 —— 标记 generatedBeforeApproval，UI 提示"重新生成才是干净正式件"。
    // 不做这一步的话，客户会收到一份带 DRAFT 水印却显示"已审批"的报价单。
    const approved = request.action === 'approve' || request.action === 'approve_with_edits';
    if (approved) {
      for (const output of record.outputs) {
        if (output.draft) output.generatedBeforeApproval = true;
        output.draft = false;
      }
    }

    this.audit({
      caseId: record.id,
      actor,
      role: 'approver',
      action: i18nT('审批：{p0}', { p0: this.actionLabel(request.action) }),
      target: record.subject,
      after: record.status,
      note: request.reason,
    });
    this.save();
    this.emit('changed', { type: 'decided', caseId: record.id });
    return { case: record };
  }

  private actionLabel(action: CaseDecideRequest['action']): string {
    return i18nT({
      approve: '批准',
      approve_with_edits: '修改后批准',
      return: '退回',
      reject: '拒绝',
      reassign: '转交',
    }[action]);
  }

  /** 该案件是否已审批（决定输出物带不带 DRAFT 水印、能不能发送）。 */
  isApproved(caseId: string): boolean {
    const record = this.get(caseId);
    return !!record && ['approved', 'approved_with_edits', 'delivered'].includes(record.status);
  }

  /**
   * 本案件**之外**的客户 / 项目名。交付物里冒出这些名字就是串标或信息交叉泄露，
   * 校验器据此判死（凭正则猜"哪些字像公司名"会误伤，必须拿已知集合来比）。
   */
  foreignPartyNames(caseId: string): string[] {
    const self = this.get(caseId);
    const names = new Set<string>();
    for (const record of this.store.cases) {
      if (record.id === caseId) continue;
      for (const name of [record.customer, record.subject]) {
        const trimmed = String(name ?? '').trim();
        // 同名客户的另一个案件不算串标；太短的名字（"ABC"）拿去做子串匹配必然误伤
        if (trimmed.length >= 4 && trimmed !== self?.customer && trimmed !== self?.subject) names.add(trimmed);
      }
    }
    return [...names];
  }

  /**
   * 大纲确认（P1-1）。这是**人审通过**的动作，必须进审计 ——
   * 事后要能查到谁在什么时候放行了这份结构，以及放行的是第几版。
   */
  recordOutlineConfirmed(caseId: string, outputName: string, version: number, sectionCount: number): void {
    const record = this.get(caseId);
    if (!record) return;
    this.audit({
      caseId, actor: record.owner, role: 'operator',
      action: i18nT('确认交付物大纲'),
      target: outputName,
      after: `v${version}`,
      note: i18nT('共 {p0} 节', { p0: sectionCount }),
    });
    this.save();
  }

  /**
   * 记一次**被校验拦下**的生成。这条必须留痕 —— 事后要能回答
   * 「这份报价单当时为什么没生成出来」，而不是只在界面上闪过一个 toast。
   */
  recordValidationBlocked(caseId: string, outputName: string, validation: CaseValidationDTO): void {
    const record = this.get(caseId);
    if (!record) return;
    this.audit({
      caseId, actor: record.owner, role: 'system',
      action: i18nT('生成被校验拦截'),
      target: outputName,
      before: validation.summary,
      note: validation.issues
        .filter((i) => i.severity === 'block')
        .map((i) => `${i.locator}: ${i.message}`)
        .join(' | '),
    });
    this.save();
  }

  /**
   * 生成输出物。未审批 → draft=true，**文件内部**盖 DRAFT 水印（不是只改文件名）。
   * content 传 Buffer 时按二进制写（真 docx / xlsx / pdf），传字符串按文本写。
   *
   * `validation` 与**这一版文件**绑定落盘 —— 「这个数字核过没有」要能逐版本查。
   */
  generateOutput(input: {
    caseId: string; kind: CaseOutputDTO['kind']; name: string; content: string | Buffer;
    validation?: CaseValidationDTO;
  }): { output?: CaseOutputDTO; message?: string } {
    const record = this.get(input.caseId);
    if (!record) return { message: i18nT('案件不存在') };
    const approved = record.status === 'approved' || record.status === 'approved_with_edits' || record.status === 'delivered';
    const dir = join(this.root, record.id, 'outputs');
    mkdirSync(dir, { recursive: true });

    const versionNo = record.outputs.filter((o) => o.name === input.name).length + 1;
    const fileName = `${input.name}-v${versionNo}${EXT_BY_KIND[input.kind]}`;
    const fullPath = join(dir, fileName);
    if (Buffer.isBuffer(input.content)) {
      // 二进制正式件：水印已经由生成器画进文档，这里再往前塞文本会直接破坏文件
      writeFileSync(fullPath, input.content);
    } else {
      const watermark = approved
        ? ''
        : `${i18nT('【草稿 DRAFT · 未经审批不得对外】')}\n${'='.repeat(48)}\n\n`;
      writeFileSync(fullPath, watermark + input.content, 'utf-8');
    }

    const output: CaseOutputDTO = {
      id: newId('out'),
      name: input.name,
      kind: input.kind,
      version: `v${versionNo}`,
      draft: !approved,
      generatedBeforeApproval: false,
      generatedAt: nowIso(),
      relPath: join(record.id, 'outputs', fileName),
      validation: input.validation,
      // 用户配了导出/备份目录就顺手各放一份（失败不影响这份权威副本）
      exportedPaths: this.exportCopies(record, fullPath, fileName),
    };
    record.outputs.unshift(output);
    if (record.status === 'analyzed' || record.status === 'received' || record.status === 'parsed') {
      record.status = 'drafted';
    }
    record.updatedAt = nowIso();
    this.audit({
      caseId: record.id,
      actor: record.owner,
      role: 'system',
      action: i18nT('生成输出物'),
      target: fileName,
      // 校验结论与文件版本绑在同一条审计上 —— 事后查「这版核过没有」只需看这一行
      after: input.validation?.summary,
      note: [
        output.draft ? i18nT('未审批 · 带草稿水印') : i18nT('已审批 · 正式件'),
        input.validation?.warningCount
          ? i18nT('校验提醒 {p0} 项', { p0: input.validation.warningCount })
          : '',
      ].filter(Boolean).join(' · '),
    });
    this.save();
    this.emit('changed', { type: 'output', caseId: record.id });
    return { output };
  }

  /**
   * 删除一份输出物。
   *
   * 为什么不做「重新生成即覆盖」：这是合规工作台，版本留痕是产品价值本身
   * （审批过的 v1 发出去了，v2 才是改过的，覆盖掉等于把已发出去的那份从记录里抹了）。
   * 所以给的是**显式删除** —— 用户自己决定哪一版不要了，并且这个动作照样进审计。
   *
   * 磁盘上三处一起清：案件目录里的权威副本 + 导出目录 / 备份目录里那两份拷贝
   * （都是我们自己按记录的路径放的）。删不掉的（被占用/已被移走）只记不报错 ——
   * 删除是幂等动作，不该因为一个文件不在了就整体失败。
   */
  deleteOutput(caseId: string, outputId: string): { ok: boolean; message?: string; removedPaths?: string[] } {
    const record = this.get(caseId);
    if (!record) return { ok: false, message: i18nT('案件不存在') };
    const idx = record.outputs.findIndex((o) => o.id === outputId);
    if (idx < 0) return { ok: false, message: i18nT('输出物不存在') };
    const output = record.outputs[idx];
    const removed: string[] = [];
    const paths = [
      ...(output.relPath ? [this.outputAbsolutePath(output.relPath)] : []),
      ...(output.exportedPaths || []),
    ];
    for (const p of paths) {
      if (!p) continue;
      try { if (existsSync(p)) { unlinkSync(p); removed.push(p); } } catch { /* 被占用/权限不足：跳过，不阻断删除 */ }
    }
    record.outputs.splice(idx, 1);
    record.updatedAt = nowIso();
    this.audit({
      caseId: record.id,
      actor: record.owner,
      role: 'operator',
      action: i18nT('删除输出物'),
      target: `${output.name} ${output.version}`,
      note: removed.length
        ? i18nT('已删除 {n} 个文件', { n: String(removed.length) })
        : i18nT('磁盘上已无对应文件，仅移除记录'),
    });
    this.save();
    this.emit('changed', { type: 'output', caseId: record.id });
    return { ok: true, removedPaths: removed };
  }

  /**
   * 模拟发送。**批准前直接拦在这里**（不是靠前端按钮 disabled），
   * 且无论如何都不存在真实外发路径 —— 只写一条明确说明"未真实发送"的回执。
   */
  simulateSend(caseId: string, outputId: string, to?: string): { receipt: string; blocked?: boolean; message?: string } {
    const record = this.get(caseId);
    if (!record) return { receipt: '', message: i18nT('案件不存在') };
    const output = record.outputs.find((o) => o.id === outputId);
    if (!output) return { receipt: '', message: i18nT('输出物不存在') };
    if (output.draft) {
      this.audit({
        caseId, actor: record.owner, role: 'system',
        action: i18nT('发送被拦截'), target: output.name, note: i18nT('未审批'),
      });
      this.save();
      return {
        receipt: '',
        blocked: true,
        message: i18nT('该文件仍是草稿，需先完成审批才能发送'),
      };
    }
    const receipt = [
      i18nT('模拟发送回执'),
      `${i18nT('文件')}: ${output.name} ${output.version}`,
      `${i18nT('收件人')}: ${to || i18nT('（演示未指定）')}`,
      `${i18nT('时间')}: ${nowIso()}`,
      '',
      i18nT('未真实发送任何邮件或写入任何 CRM —— 本平台不存在真实外发路径。'),
    ].join('\n');
    record.status = 'delivered';
    record.updatedAt = nowIso();
    this.audit({
      caseId, actor: record.owner, role: 'system',
      action: i18nT('模拟发送'), target: `${output.name} ${output.version}`, note: to,
    });
    this.save();
    this.emit('changed', { type: 'delivered', caseId });
    return { receipt };
  }

  /** 记录一次增量重算（Proof Switch）：受影响 / 未受影响都写进审计，便于事后复盘。 */
  recordRecalc(request: CaseRecordRecalcRequest): void {
    const record = this.get(request.caseId);
    if (!record) return;
    record.version += 1;
    record.updatedAt = nowIso();
    for (const field of request.changedFields) {
      this.audit({
        caseId: record.id,
        actor: record.owner,
        role: 'operator',
        action: i18nT('模拟变更'),
        target: field.label,
        before: field.before,
        after: field.after,
        ruleVersion: request.ruleVersion,
        dataVersion: request.toVersion,
      });
    }
    this.audit({
      caseId: record.id,
      actor: record.owner,
      role: 'system',
      action: i18nT('增量重算'),
      target: `${request.fromVersion} → ${request.toVersion}`,
      before: i18nT('重算 {p0} 张卡', { p0: request.affectedCards.length }),
      after: i18nT('未受影响 {p0} 张卡', { p0: request.unaffectedCards.length }),
      note: [
        `${i18nT('受影响')}: ${request.affectedCards.join(', ') || '—'}`,
        `${i18nT('未受影响')}: ${request.unaffectedCards.join(', ') || '—'}`,
      ].join(' | '),
      ruleVersion: request.ruleVersion,
      dataVersion: request.toVersion,
    });
    this.save();
    this.emit('changed', { type: 'recalculated', caseId: record.id });
  }

  auditEntries(caseId?: string): CaseAuditEntryDTO[] {
    const all = this.store.audit as (CaseAuditEntryDTO & { caseId?: string })[];
    return caseId ? all.filter((e) => e.caseId === caseId) : [...all];
  }
}
