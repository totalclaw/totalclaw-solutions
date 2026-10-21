/**
 * 三个模块的基线演示数据。
 *
 * 关键设计：卡片不是写死的静态 JSON，而是 `buildCards(moduleId, state)` 按当前状态**算出来**的。
 * Proof Switch 改的就是 state（交付地点 / 保修年限 / 是否应用 Addendum / 目标客户），
 * 于是「哪些卡真的变了、哪些卡逐字未变」是算出来的事实，不是演出来的效果。
 *
 * 演示案例来自需求文档：
 *   模块一 Nexa Gulf — 吉达物流园区 60 台室外 IP 摄像机 / 6 台 PoE 交换机 / 2 台 NVR
 *   模块二 Al Noor Industrial City — 周界安防与网络升级，Addendum 把 120 台改成 150 台
 *   模块三 Gulf Air Quality — H13 空气净化器进入沙特市场
 */
import { computePricing, money, RULE_SET, RULE_VERSION, type RuleSet } from './calc';
import type {
  BomRow, CardData, IntakeGroup, IntakeItem, KanbanCard, SaudiModuleId,
} from './types';
import { t as i18nT } from '../../i18n';

/**
 * 数据包（主进程 saudiDataPack 下发）。产品目录与规则都从这里来，
 * 拿不到就回落出厂基线——演示不会因为数据包没就绪就白屏。
 */
export interface DataPackInput {
  version?: string;
  rules?: Partial<RuleSet>;
  products?: { sku: string; description: string; unitCost: number; unit: string; leadTime: string; stock: string; stockShort?: boolean }[];
  benchmarks?: { name: string; scope: string; total: string; margin: string; result: string }[];
  decisionWeights?: { key: string; label: string; weight: number }[];
}

/** 用数据包里的单价/交期/库存覆盖基线 BOM 行——同一 SKU 以数据包为准。 */
function applyPack(rows: BomRow[], pack?: DataPackInput): BomRow[] {
  const byId = new Map((pack?.products ?? []).map((p) => [p.sku, p]));
  return rows.map((row) => {
    const hit = byId.get(row.sku);
    if (!hit) return row;
    return {
      ...row,
      description: hit.description || row.description,
      unitCost: Number.isFinite(hit.unitCost) && hit.unitCost > 0 ? hit.unitCost : row.unitCost,
      unit: hit.unit || row.unit,
      leadTime: hit.leadTime || row.leadTime,
      stock: hit.stock || row.stock,
      stockShort: hit.stockShort ?? row.stockShort,
    };
  });
}

/** Proof Switch 与卡内操作可改的运行状态。 */
export interface ModuleState {
  location: string;
  locationLabel: string;
  warrantyYears: number;
  addendumApplied: boolean;
  segment: 'household' | 'commercial';
  /** BOM 选的是主选还是备选 —— 需求 D1-10 验收：切换后成本必须联动重算 */
  bomVariant: 'primary' | 'alternate';
  /** 硬性门槛的人工改判：卡片标题 → 目标栏位（需求 D2-12 验收：改判后建议要翻转） */
  gateOverrides: Record<string, 'met' | 'closeable' | 'cannot' | 'review'>;
}

export function defaultState(moduleId: SaudiModuleId): ModuleState {
  return {
    location: 'jeddah',
    locationLabel: moduleId === 'bid-decision' ? i18nT('达曼 Dammam') : i18nT('吉达 Jeddah'),
    warrantyYears: moduleId === 'bid-decision' ? 3 : 2,
    addendumApplied: false,
    segment: 'household',
    bomVariant: 'primary',
    gateOverrides: {},
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 收件条目（三条通道各来一条，模块三演示"三条属于同一任务"）
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_INTAKE: Record<SaudiModuleId, IntakeItem[]> = {
  'rfq-quote': [
    {
      id: 'rfq-mail-1',
      channel: 'email',
      receivedAt: '2026-08-12 09:14',
      from: { name: 'Ahmed Al-Rashid', address: 'ahmed@nexagulf.example', org: 'Nexa Gulf Integrated Solutions' },
      subject: 'RFQ – Jeddah Logistics Park CCTV & Network',
      body: i18nT('请就吉达物流园区的安防与网络项目报价：60 台室外 IP 摄像机、6 台 PoE 交换机、2 台 NVR、存储、安装调试，两年保修，21 天交付。技术要求与数量表见附件。'),
      attachments: [
        { fileName: 'Technical_Requirements.pdf', relPath: 'demo/Technical_Requirements.pdf', kind: 'pdf', size: 1979 },
        { fileName: 'BOQ_Quantities.xlsx', relPath: 'demo/BOQ_Quantities.xlsx', kind: 'xlsx', size: 16934 },
      ],
      module: 'rfq-quote',
      status: 'assigned',
      deadline: '2026-08-18',
      customer: 'Nexa Gulf Integrated Solutions',
    },
    {
      id: 'rfq-upload-1',
      // 询价模块只接邮件 + 上传件（开发todo/03 A 节）：这条演客户后补一份现场图纸。
      // 原来挂在 webform 通道上是错的 —— 工单库是咨询模块的通道，不该出现在这里。
      channel: 'upload',
      receivedAt: '2026-08-12 10:02',
      from: { name: 'Sara Khalid', address: 'sara@dammam-tech.example', org: 'Dammam TechWorks' },
      subject: i18nT('仓库监控扩容询价（现场图纸补充）'),
      body: i18nT('两个仓库共 24 台摄像机扩容，需含安装；现场平面图见附件。'),
      attachments: [{ fileName: 'site_layout.pdf', relPath: 'demo/site_layout.pdf', kind: 'pdf', size: 1059 }],
      module: 'rfq-quote',
      status: 'new',
      deadline: '2026-08-26',
      customer: 'Dammam TechWorks',
    },
  ],

  'bid-decision': [
    {
      id: 'bid-web-1',
      // 公告来自**招标网站快照**（websnapshot），不是客户提交的工单（webform）——
      // M2-A1 要的就是「网站快照 + 邮件 + 上传件被认成同一项目」这一幕。
      channel: 'websnapshot',
      receivedAt: '2026-08-05 08:40',
      from: { name: 'Al Noor Procurement', address: 'tenders@alnoor-city.example', org: 'Al Noor Industrial City' },
      subject: i18nT('Perimeter Security & Network Upgrade — 招标公告'),
      body: i18nT('公告快照：周界安防与网络升级，含摄像机、存储、网络、光纤施工、安装调试、培训与三年维保。'),
      attachments: [{ fileName: 'Tender_Notice.pdf', relPath: 'demo/Tender_Notice.pdf', kind: 'pdf', size: 1143 }],
      module: 'bid-decision',
      status: 'merged',
      deadline: '2026-08-23',
      customer: 'Al Noor Industrial City',
      // 合规：外部来源的链接、抓取时间、适用范围与 Snapshot 标识都得在界面上看得见
      external: {
        sourceName: i18nT('Al Noor 采购公告页'),
        sourceUrl: 'https://tenders.alnoor-city.example/notices/TN-2026-0805-0007',
        fetchedAt: '2026-08-05 08:40',
        scope: i18nT('安防与网络类公开公告'),
        snapshot: true,
      },
    },
    {
      id: 'bid-mail-1',
      channel: 'email',
      receivedAt: '2026-08-06 11:25',
      from: { name: 'Al Noor Procurement', address: 'tenders@alnoor-city.example', org: 'Al Noor Industrial City' },
      subject: i18nT('RFP + BOQ 文件发送'),
      body: i18nT('RFP 与 BOQ 见附件，澄清截止 08-18。'),
      attachments: [
        { fileName: 'RFP.pdf', relPath: 'demo/RFP.pdf', kind: 'pdf', size: 1813 },
        { fileName: 'BOQ.xlsx', relPath: 'demo/BOQ.xlsx', kind: 'xlsx', size: 16931 },
      ],
      module: 'bid-decision',
      status: 'merged',
      deadline: '2026-08-23',
      customer: 'Al Noor Industrial City',
    },
  ],

  'advisory-report': [
    {
      id: 'adv-mail-1',
      channel: 'email',
      receivedAt: '2026-08-09 09:12',
      from: { name: 'Faisal Al-Otaibi', address: 'faisal@gulfair-quality.example', org: 'Gulf Air Quality Trading Est.' },
      subject: i18nT('H13 空气净化器进入沙特市场咨询'),
      body: i18nT('我们计划把 H13 空气净化器引入沙特，需要了解市场进入方式、产品合规、进口商责任、销售渠道、时间与风险。'),
      attachments: [{ fileName: 'Product_Spec_H13.pdf', relPath: 'demo/Product_Spec_H13.pdf', kind: 'pdf', size: 1265 }],
      module: 'advisory-report',
      status: 'merged',
      deadline: '2026-08-17',
      customer: 'Gulf Air Quality Trading Est.',
    },
    {
      id: 'adv-form-1',
      channel: 'webform',
      receivedAt: '2026-08-09 14:20',
      from: { name: 'Faisal Al-Otaibi', address: '+966 5x xxx xxxx', org: 'Gulf Air Quality Trading Est.' },
      subject: i18nT('咨询：空气净化器认证与清关周期'),
      body: i18nT('想确认认证流程要多久、清关是否需要本地进口商。'),
      attachments: [
        // 与邮件那条是**同一份文件** —— 合并打分靠 sha256 命中，不是靠主题相似度凑
        { fileName: 'Product_Spec_H13.pdf', relPath: 'demo/Product_Spec_H13.pdf', kind: 'pdf', size: 1265 },
        { fileName: 'target_sku_list.xlsx', relPath: 'demo/target_sku_list.xlsx', kind: 'xlsx', size: 16546 },
      ],
      module: 'advisory-report',
      status: 'merged',
      deadline: '2026-08-17',
      customer: 'Gulf Air Quality Trading Est.',
      ticket: {
        sourceName: 'crm_main',
        table: 'web_form_ticket',
        ticketNo: 'WF-2026-0809-0037',
        pkValue: 10237,
        status: 'new',
        createdAt: '2026-08-09 14:20',
        updatedAt: '2026-08-09 14:20',
        fields: {
          公司: 'Gulf Air Quality Trading Est.',
          联系人: 'Faisal Al-Otaibi',
          联系方式: 'faisal@gulfair-quality.example',
          需求类型: i18nT('咨询'),
          期望完成: '2026-08-17',
          来源页面: '/contact/consulting',
        },
        query: 'SELECT t.*, f.file_name, f.file_url FROM web_form_ticket t LEFT JOIN web_form_ticket_file f ON f.ticket_id = t.id WHERE t.id = 10237',
      },
    },
    {
      id: 'adv-wa-1',
      channel: 'whatsapp',
      receivedAt: '2026-08-10 10:05',
      from: { name: 'Faisal', address: '+966 5x xxx xxxx', org: 'Gulf Air Quality Trading Est.' },
      subject: i18nT('补充：目标是家庭消费者市场'),
      body: i18nT('补充一下，我们先做家庭消费者市场，之后再看办公场景。另外想知道大概预算区间。'),
      attachments: [],
      module: 'advisory-report',
      status: 'merged',
      deadline: '2026-08-17',
      customer: 'Gulf Air Quality Trading Est.',
    },
  ],
};

export const DEMO_GROUPS: Record<SaudiModuleId, IntakeGroup[]> = {
  'rfq-quote': [],
  'bid-decision': [
    {
      id: 'grp-bid-1',
      itemIds: ['bid-web-1', 'bid-mail-1'],
      customer: 'Al Noor Industrial City',
      subject: i18nT('Al Noor 周界安防与网络升级'),
      module: 'bid-decision',
      deadline: '2026-08-23',
      reasons: [
        { label: i18nT('客户名规范化后相同'), score: 25 },
        { label: i18nT('项目名相似度 0.93'), score: 25 },
        { label: i18nT('BOQ 指纹相同（行数 + 前 5 SKU + 合计数量）'), score: 40 },
      ],
      totalScore: 90,
      merged: true,
    },
  ],
  'advisory-report': [
    {
      id: 'grp-adv-1',
      itemIds: ['adv-mail-1', 'adv-form-1', 'adv-wa-1'],
      customer: 'Gulf Air Quality Trading Est.',
      subject: i18nT('H13 空气净化器进入沙特市场'),
      module: 'advisory-report',
      deadline: '2026-08-17',
      reasons: [
        { label: i18nT('客户名规范化后相同'), score: 25 },
        { label: i18nT('主题相似度 0.86'), score: 25 },
        { label: i18nT('同一联系人 72 小时内'), score: 10 },
        { label: i18nT('附件 sha256 相同（Product_Spec_H13.pdf）'), score: 60 },
      ],
      totalScore: 120,
      merged: false,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BOM
// ─────────────────────────────────────────────────────────────────────────────

const RFQ_BOM_PRIMARY: BomRow[] = [
  { sku: 'IPC-4K-BLT-30', description: i18nT('室外筒机 4K / 30m 红外 / IP67'), qty: 60, unit: i18nT('台'), unitCost: 7450, leadTime: i18nT('2 周'), stock: i18nT('充足') },
  { sku: 'SW-POE-24-370', description: i18nT('24 口 PoE 交换机 370W'), qty: 6, unit: i18nT('台'), unitCost: 9800, leadTime: i18nT('4 周'), stock: i18nT('不足（现货 2）'), stockShort: true },
  { sku: 'NVR-64CH-R5', description: i18nT('64 路 NVR / RAID5'), qty: 2, unit: i18nT('台'), unitCost: 21500, leadTime: i18nT('3 周'), stock: i18nT('充足') },
  { sku: 'HDD-8T-SURV', description: i18nT('8TB 监控级硬盘'), qty: 16, unit: i18nT('块'), unitCost: 1180, leadTime: i18nT('1 周'), stock: i18nT('充足') },
  { sku: 'ACC-MNT-OUT', description: i18nT('室外支架与防水盒套件'), qty: 60, unit: i18nT('套'), unitCost: 320, leadTime: i18nT('1 周'), stock: i18nT('充足') },
];

const RFQ_BOM_ALTERNATE: BomRow[] = RFQ_BOM_PRIMARY.map((row) =>
  row.sku === 'SW-POE-24-370'
    ? { ...row, sku: 'SW-POE-24-400A', description: i18nT('24 口 PoE 交换机 400W（替代型号，现货）'), unitCost: 10650, leadTime: i18nT('1 周'), stock: i18nT('充足'), stockShort: false }
    : { ...row },
);

function bidBom(cameras: number): BomRow[] {
  return [
    { sku: 'IPC-4K-BLT-30', description: i18nT('室外筒机 4K / 30m 红外 / IP67'), qty: cameras, unit: i18nT('台'), unitCost: 7450, leadTime: i18nT('2 周'), stock: cameras > 130 ? i18nT('需分批（现货 120）') : i18nT('充足'), stockShort: cameras > 130 },
    { sku: 'SW-POE-48-740', description: i18nT('48 口 PoE 交换机 740W'), qty: 12, unit: i18nT('台'), unitCost: 16400, leadTime: i18nT('5 周'), stock: i18nT('不足（现货 6）'), stockShort: true },
    { sku: 'NVR-128CH-R6', description: i18nT('128 路 NVR / RAID6'), qty: 3, unit: i18nT('台'), unitCost: 38900, leadTime: i18nT('4 周'), stock: i18nT('充足') },
    { sku: 'HDD-16T-SURV', description: i18nT('16TB 监控级硬盘'), qty: 36, unit: i18nT('块'), unitCost: 2260, leadTime: i18nT('2 周'), stock: i18nT('充足') },
    { sku: 'FBR-SM-12C', description: i18nT('12 芯单模光缆（含熔接）'), qty: 4200, unit: i18nT('米'), unitCost: 12, leadTime: i18nT('3 周'), stock: i18nT('充足') },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 卡片构建
// ─────────────────────────────────────────────────────────────────────────────

function pdf(docName: string, page: number) {
  return { docId: docName, docName, type: 'pdf' as const, page };
}
function xls(docName: string, cell: string) {
  return { docId: docName, docName, type: 'xlsx' as const, cell };
}

function rfqCards(state: ModuleState, pack?: DataPackInput): CardData[] {
  // 需求 D1-10 验收：「主选、备选两套 BOM 可切换，切换后成本联动」。
  // 所以报价必须按当前选中的那套 BOM 算，而不是恒用主选。
  const primary = applyPack(RFQ_BOM_PRIMARY, pack);
  const alternate = applyPack(RFQ_BOM_ALTERNATE, pack);
  const activeBom = state.bomVariant === 'alternate' ? alternate : primary;
  const pricing = computePricing({
    bom: activeBom,
    location: state.location,
    locationLabel: state.locationLabel,
    warrantyYears: state.warrantyYears,
    subcontractCost: 54000,
  }, { ...(pack?.rules || {}), version: pack?.version || RULE_SET.version });

  return [
    {
      id: 'request',
      title: i18nT('请求信息卡'),
      kind: 'fields',
      confidence: 0.94,
      evidenceCount: 7,
      fields: [
        { key: 'customer', label: i18nT('客户'), value: 'Nexa Gulf Integrated Solutions', confidence: 0.98, anchors: [pdf('Technical_Requirements.pdf', 1)] },
        { key: 'project', label: i18nT('项目'), value: i18nT('吉达物流园区安防与网络'), confidence: 0.95, anchors: [pdf('Technical_Requirements.pdf', 1)] },
        { key: 'received', label: i18nT('收件方式'), value: i18nT('邮件（含 PDF + Excel 附件）'), confidence: 1, anchors: [] },
        { key: 'deadline', label: i18nT('报价截止'), value: '2026-08-18', confidence: 0.92, anchors: [pdf('Technical_Requirements.pdf', 2)] },
        { key: 'location', label: i18nT('交货地点'), value: state.locationLabel, confidence: 0.93, anchors: [pdf('Technical_Requirements.pdf', 3)] },
        { key: 'leadtime', label: i18nT('要求工期'), value: i18nT('21 天'), confidence: 0.9, anchors: [pdf('Technical_Requirements.pdf', 3)] },
        { key: 'warranty', label: i18nT('保修'), value: i18nT('{p0} 年', { p0: state.warrantyYears }), confidence: 0.95, anchors: [pdf('Technical_Requirements.pdf', 4)] },
        { key: 'payment', label: i18nT('付款条件'), value: i18nT('30% 预付 / 60% 到货 / 10% 验收'), confidence: 0.88, anchors: [pdf('Technical_Requirements.pdf', 5)] },
        { key: 'attachments', label: i18nT('附件'), value: i18nT('2 件（技术要求 PDF、数量表 Excel）'), confidence: 1, anchors: [xls('BOQ_Quantities.xlsx', 'BOQ!A1')] },
      ],
    },
    {
      id: 'gap',
      title: i18nT('信息缺口与澄清问题'),
      kind: 'gaps',
      badge: i18nT('3 项缺失'),
      badgeTone: 'warn',
      gaps: [
        { label: i18nT('目标存储天数'), note: i18nT('未说明（影响 NVR 与硬盘容量选型）') },
        { label: i18nT('网络拓扑'), note: i18nT('未说明（是否复用既有核心交换）') },
        { label: i18nT('夜间施工要求'), note: i18nT('未说明（影响安装人工与工期）') },
      ],
      questions: [
        i18nT('录像需要保存多少天？我们按 30 天与 90 天分别给出存储配置与差价。'),
        i18nT('现场是否已有可用核心交换与光纤主干？若复用，PoE 交换机数量可下调。'),
        i18nT('是否允许夜间或非营业时间施工？这会影响 21 天工期能否达成。'),
      ],
    },
    {
      id: 'match',
      title: i18nT('产品匹配与技术偏离'),
      kind: 'matrix',
      badge: i18nT('18 满足 · 4 部分 · 2 偏离'),
      badgeTone: 'warn',
      evidenceCount: 24,
      matrixColumns: [i18nT('RFQ 要求'), i18nT('建议型号'), i18nT('规格值'), i18nT('判定'), i18nT('替代')],
      matrixRows: [
        { requirement: i18nT('室外筒机 ≥ 4K 分辨率'), requirementAnchor: pdf('Technical_Requirements.pdf', 6), proposed: 'IPC-4K-BLT-30', specValue: '3840×2160', verdict: 'ok' },
        { requirement: i18nT('红外距离 ≥ 40m'), requirementAnchor: pdf('Technical_Requirements.pdf', 6), proposed: 'IPC-4K-BLT-30', specValue: '30m', verdict: 'deviate', alternate: i18nT('IPC-4K-BLT-50（50m，+SAR 640/台）') },
        { requirement: i18nT('防护等级 IP67'), requirementAnchor: pdf('Technical_Requirements.pdf', 6), proposed: 'IPC-4K-BLT-30', specValue: 'IP67', verdict: 'ok' },
        { requirement: i18nT('PoE 供电总功率 ≥ 350W'), requirementAnchor: xls('BOQ_Quantities.xlsx', 'BOQ!C12'), proposed: 'SW-POE-24-370', specValue: '370W', verdict: 'ok' },
        { requirement: i18nT('交换机支持堆叠'), requirementAnchor: pdf('Technical_Requirements.pdf', 8), proposed: 'SW-POE-24-370', specValue: i18nT('不支持堆叠'), verdict: 'deviate', alternate: i18nT('SW-POE-24-400A（支持堆叠）') },
        { requirement: i18nT('NVR 支持 RAID5 及以上'), requirementAnchor: pdf('Technical_Requirements.pdf', 9), proposed: 'NVR-64CH-R5', specValue: 'RAID5', verdict: 'ok' },
        { requirement: i18nT('存储保留 ≥ 30 天'), requirementAnchor: pdf('Technical_Requirements.pdf', 9), proposed: 'HDD-8T-SURV ×16', specValue: i18nT('按 4K/15fps 估 27 天'), verdict: 'partial', alternate: i18nT('加 4 块 8TB 可达 34 天') },
      ],
    },
    {
      id: 'bom',
      title: i18nT('BOM 主选 / 备选'),
      kind: 'bom',
      badge: state.bomVariant === 'alternate'
        ? i18nT('备选合计 {p0}', { p0: money(alternate.reduce((sum, r) => sum + r.qty * r.unitCost, 0)) })
        : i18nT('主选合计 {p0}', { p0: money(primary.reduce((sum, r) => sum + r.qty * r.unitCost, 0)) }),
      bomVariant: state.bomVariant,
      bomPrimary: primary,
      bomAlternate: alternate,
    },
    {
      id: 'supply',
      title: i18nT('供应可得性与外协'),
      kind: 'matrix',
      badge: i18nT('1 项缺货 · 1 项外协'),
      badgeTone: 'warn',
      matrixColumns: [i18nT('项目'), i18nT('需求 / 现状'), i18nT('判定'), i18nT('处理')],
      matrixRows: [
        { requirement: i18nT('SW-POE-24-370（需 6 台）'), proposed: i18nT('现货 2 台'), specValue: i18nT('补货交期 4 周 > 工期 21 天'), verdict: 'fail', alternate: i18nT('替代 SW-POE-24-400A：现货充足、交期 1 周、支持堆叠，单价 +SAR 850') },
        { requirement: i18nT('IPC-4K-BLT-30（需 60 台）'), proposed: i18nT('现货 80 台'), specValue: i18nT('交期 2 周'), verdict: 'ok' },
        { requirement: i18nT('安装调试团队（需 3 组 × 10 天）'), proposed: i18nT('自有 1 组可排期'), specValue: i18nT('缺 2 组'), verdict: 'partial', alternate: i18nT('外协 Jeddah Site Services，估 {p0}，已计入报价', { p0: money(54000) }) },
      ],
    },
    {
      id: 'pricing',
      title: i18nT('成本与报价'),
      kind: 'pricing',
      badge: i18nT('规则集 {p0}', { p0: pack?.version || RULE_VERSION }),
      calcLines: pricing.lines,
      priceRange: pricing.range,
    },
    {
      id: 'benchmark',
      title: i18nT('历史对比'),
      kind: 'benchmark',
      benchmark: [
        ...(pack?.benchmarks?.length
          ? pack.benchmarks
          : [
              { name: i18nT('历史 A · 利雅得园区'), scope: i18nT('48 台摄像机 + 4 交换机'), total: money(742000), margin: '16.5%', result: i18nT('中标') },
              { name: i18nT('历史 B · 达曼仓储'), scope: i18nT('36 台摄像机'), total: money(515000), margin: '19.2%', result: i18nT('未中标') },
              { name: i18nT('历史 C · 吉达港区'), scope: i18nT('72 台摄像机 + 光纤'), total: money(1084000), margin: '17.8%', result: i18nT('中标') },
            ]),
        { name: i18nT('本次'), scope: i18nT('60 台摄像机 + 6 交换机 + 2 NVR'), total: money(pricing.floorPrice), margin: `${((pack?.rules?.targetMargin ?? RULE_SET.targetMargin) * 100).toFixed(1)}%`, result: i18nT('待定') },
      ],
      benchmarkNote:
        i18nT('本次毛利率高于历史 A 1.5 个百分点，主要因为{p0}的现场服务系数与维保年限（{p1} 年）推高了准备金；', { p0: state.locationLabel, p1: state.warrantyYears }) +
        i18nT('若客户接受替代交换机型号，设备成本可再降约 {p0}。', { p0: money(3800) }),
    },
    {
      id: 'output',
      title: i18nT('输出物'),
      kind: 'outputs',
      badge: i18nT('未审批 · 带草稿水印'),
      badgeTone: 'muted',
      outputs: [
        { name: i18nT('技术方案_Nexa_Gulf_v1.docx'), kind: 'word', version: 'v1', draft: true },
        { name: i18nT('正式报价_Nexa_Gulf_v1.xlsx'), kind: 'excel', version: 'v1', draft: true },
        { name: i18nT('客户邮件草稿.eml'), kind: 'email', version: 'v1', draft: true },
      ],
    },
  ];
}

function bidCards(state: ModuleState, pack?: DataPackInput): CardData[] {
  const cameras = state.addendumApplied ? 150 : 120;
  const deliveryDays = state.addendumApplied ? 90 : 120;
  const bomPrimary = applyPack(bidBom(cameras), pack);
  const bomAlternate = bomPrimary.map((r) => (r.stockShort
    ? { ...r, description: i18nT('{p0}（分两批到货）', { p0: r.description }), leadTime: i18nT('首批 2 周 / 次批 5 周'), stock: i18nT('分批可满足'), stockShort: false }
    : r));
  const bom = state.bomVariant === 'alternate' ? bomAlternate : bomPrimary;
  const pricing = computePricing({
    bom,
    location: state.location,
    locationLabel: state.locationLabel,
    warrantyYears: state.warrantyYears,
    subcontractCost: state.addendumApplied ? 268000 : 214000,
    projectManagementCost: 96000,
  }, { ...(pack?.rules || {}), version: pack?.version || RULE_SET.version });

  const cards: CardData[] = [
    {
      id: 'tender',
      title: i18nT('招标信息卡'),
      kind: 'fields',
      confidence: 0.93,
      evidenceCount: 18,
      fields: [
        { key: 'client', label: i18nT('招标人'), value: 'Al Noor Industrial City', confidence: 0.98, anchors: [pdf('RFP.pdf', 1)] },
        { key: 'scope', label: i18nT('范围'), value: i18nT('周界安防、存储、网络、光纤施工、安装调试、培训、三年维保'), confidence: 0.91, anchors: [pdf('RFP.pdf', 4)] },
        { key: 'deadline', label: i18nT('提交截止'), value: state.addendumApplied ? i18nT('2026-08-28（Addendum 延后 5 天）') : '2026-08-23', confidence: 0.96, anchors: [pdf('RFP.pdf', 2)] },
        { key: 'bond', label: i18nT('投标保证金'), value: '2% · SAR 340,000', confidence: 0.94, anchors: [pdf('RFP.pdf', 7)] },
        { key: 'qualification', label: i18nT('资格要求'), value: i18nT('商业登记、经营许可、ISO 27001、本地 3 年同类案例、光纤施工资质'), confidence: 0.89, anchors: [pdf('RFP.pdf', 11)] },
        { key: 'payment', label: i18nT('付款'), value: i18nT('预付 10% / 进度 70% / 验收 15% / 质保金 5%'), confidence: 0.9, anchors: [pdf('RFP.pdf', 14)] },
        { key: 'delivery', label: i18nT('交付周期'), value: i18nT('{deliveryDays} 天', { deliveryDays }), confidence: 0.92, anchors: [pdf('RFP.pdf', 15)] },
        { key: 'boq', label: i18nT('BOQ 项'), value: i18nT('{p0} 类 · 摄像机 {cameras} 台', { p0: bom.length, cameras }), confidence: 0.97, anchors: [xls('BOQ.xlsx', 'BOQ!B4')] },
      ],
    },
  ];

  cards.push({
    id: 'version',
    title: i18nT('Addendum 差异'),
    kind: 'versionDiff',
    badge: state.addendumApplied ? i18nT('Addendum 01 已应用') : i18nT('暂无 Addendum'),
    badgeTone: state.addendumApplied ? 'warn' : 'muted',
    versionDiff: state.addendumApplied
      ? [
          { field: i18nT('摄像机数量'), before: '120', after: '150', delta: '+30' },
          { field: i18nT('交付周期'), before: i18nT('120 天'), after: i18nT('90 天'), delta: i18nT('−30 天') },
          { field: i18nT('提交截止'), before: '2026-08-23', after: '2026-08-28', delta: i18nT('+5 天') },
        ]
      : [],
    affectedCards: state.addendumApplied ? ['bom', 'subcontract', 'pricing', 'capability', 'decision'] : [],
    unaffectedCards: state.addendumApplied ? ['gate', 'compliance', 'tender'] : [],
  });

  // 需求 D2-12 验收：「把某证书改成过期，建议立刻从『有条件参与』翻转为『不参与』，
  // 且总分不变也要翻转」。所以四栏看板要能人工改判，且 decision 卡的结论必须由
  // 「cannot 栏是否非空」推导，而不是写死——否则那一幕演不出来。
  const baseGates: KanbanCard[] = [
      { title: i18nT('商业登记 CR'), column: 'met' },
      { title: i18nT('经营许可'), column: 'met' },
      { title: i18nT('增值税登记'), column: 'met' },
      { title: i18nT('安防系统集成资质'), column: 'met' },
      { title: i18nT('本地雇员比例'), column: 'met' },
      { title: i18nT('财务健康证明'), column: 'met' },
      { title: 'ISO 27001', note: i18nT('2026-09-02 到期，可在投标前完成续证'), column: 'closeable' },
      { title: i18nT('光纤施工资质'), note: i18nT('自有缺失，外协伙伴具备'), column: 'closeable' },
      // 可化解：招标人接受以联合体 / 既往项目替代认定 —— 所以基线是「有条件参与」而非 No-Bid
    { title: i18nT('本地同类案例 3 年'), note: i18nT('我方最近案例为 2024 年，不满足"近 3 年内两个同规模项目"'), column: 'cannot', waivable: true },
      { title: i18nT('保函格式'), note: i18nT('招标文件未附模板，待澄清'), column: 'review' },
    { title: i18nT('税务证明适用范围'), note: i18nT('范围是否覆盖光纤施工待确认'), column: 'review' },
  ];
  const gates: KanbanCard[] = baseGates.map((gate) => {
    const moved = state.gateOverrides[gate.title];
    // 人工改判进「无法满足」= 人已经判定它不可解，因此 waivable 归 false
    return moved && moved !== gate.column
      ? {
          ...gate,
          column: moved,
          waivable: moved === 'cannot' ? false : gate.waivable,
          note: gate.note ? i18nT('{p0}（人工改判）', { p0: gate.note }) : i18nT('人工改判'),
        }
      : gate;
  });
  const cannotMeetGates = gates.filter((g) => g.column === 'cannot');
  /** 真正阻断的只有「无法满足且不可化解」的那些。 */
  const blockingGates = cannotMeetGates.filter((g) => !g.waivable);

  cards.push({
    id: 'gate',
    title: i18nT('硬性门槛'),
    kind: 'kanban',
    badge: cannotMeetGates.length ? i18nT('{p0} 项无法满足', { p0: cannotMeetGates.length }) : i18nT('无阻断项'),
    badgeTone: cannotMeetGates.length ? 'danger' : 'ok',
    kanban: gates,
  });

  cards.push({
    id: 'capability',
    title: i18nT('能力匹配'),
    kind: 'matrix',
    badge: i18nT('缺口 3 项（2 可补齐，1 不可）'),
    badgeTone: 'warn',
    matrixColumns: [i18nT('要求能力'), i18nT('我方能力'), i18nT('判定'), i18nT('缺口处理')],
    matrixRows: [
      { requirement: i18nT('安防系统集成（150 台级）'), proposed: i18nT('自有，历史最大 72 台'), specValue: i18nT('本次 {cameras} 台', { cameras }), verdict: 'partial', alternate: i18nT('增派 2 组施工队，已计入项目管理成本') },
      { requirement: i18nT('光纤熔接与敷设 4,200m'), proposed: i18nT('自有能力缺失'), specValue: '—', verdict: 'fail', alternate: i18nT('外协 Gulf Fiber Works（已列入外协计划）') },
      { requirement: i18nT('三年维保驻场'), proposed: i18nT('自有服务团队'), specValue: i18nT('可覆盖'), verdict: 'ok' },
      { requirement: i18nT('本地培训交付'), proposed: i18nT('自有讲师 + 阿语材料'), specValue: i18nT('可覆盖'), verdict: 'ok' },
      { requirement: i18nT('近 3 年本地同类案例 ×2'), proposed: i18nT('2024 年 1 个'), specValue: i18nT('不满足'), verdict: 'fail', alternate: i18nT('不可补齐 —— 触发硬性门槛') },
    ],
  });

  cards.push({
    id: 'compliance',
    title: i18nT('技术 / 商务符合性矩阵'),
    kind: 'matrix',
    badge: i18nT('32 满足 · 6 部分 · 3 偏离'),
    matrixColumns: [i18nT('类别'), i18nT('要求'), i18nT('我方响应'), i18nT('判定')],
    matrixRows: [
      { category: i18nT('技术'), requirement: i18nT('摄像机 4K / IP67 / 30m 红外'), proposed: 'IPC-4K-BLT-30', specValue: i18nT('满足'), verdict: 'ok', requirementAnchor: pdf('RFP.pdf', 21) },
      { category: i18nT('技术'), requirement: i18nT('存储保留 90 天'), proposed: 'NVR-128CH-R6 ×3 + 16TB ×36', specValue: i18nT('估 86 天'), verdict: 'partial', alternate: i18nT('加 6 块 16TB 可达 98 天'), requirementAnchor: pdf('RFP.pdf', 23) },
      { category: i18nT('技术'), requirement: i18nT('核心交换双电源冗余'), proposed: 'SW-POE-48-740', specValue: i18nT('单电源'), verdict: 'deviate', alternate: i18nT('SW-POE-48-740R（冗余电源）') },
      { category: i18nT('商务'), requirement: i18nT('质保金 5% 保留 24 个月'), proposed: i18nT('接受'), specValue: i18nT('满足'), verdict: 'ok', requirementAnchor: pdf('RFP.pdf', 31) },
      { category: i18nT('商务'), requirement: i18nT('违约金上限 10%'), proposed: i18nT('要求下调至 7%'), specValue: i18nT('偏离'), verdict: 'deviate' },
      { category: i18nT('商务'), requirement: i18nT('本地含量 ≥ 40%'), proposed: i18nT('经外协可达 43%'), specValue: i18nT('满足'), verdict: 'ok' },
    ],
  });

  cards.push({
    id: 'bom',
    title: i18nT('BOM 主选 / 备选'),
    kind: 'bom',
    badge: i18nT('摄像机 {cameras} 台', { cameras }),
    bomVariant: state.bomVariant,
    bomPrimary,
    bomAlternate,
  });

  cards.push({
    id: 'subcontract',
    title: i18nT('外协计划'),
    kind: 'matrix',
    badge: state.addendumApplied ? i18nT('2 项 · 成本上调') : i18nT('2 项'),
    badgeTone: 'warn',
    matrixColumns: [i18nT('外协项'), i18nT('原因'), i18nT('伙伴 / 成本'), i18nT('风险')],
    matrixRows: [
      {
        requirement: i18nT('光纤熔接与敷设 4,200m'),
        proposed: i18nT('自有能力缺失'),
        specValue: `Gulf Fiber Works · ${money(state.addendumApplied ? 196000 : 156000)}`,
        verdict: 'partial',
        alternate: state.addendumApplied ? i18nT('90 天工期需两班作业，单价上浮 12%') : i18nT('常规排期'),
      },
      {
        requirement: i18nT('高空作业与支架安装'),
        proposed: i18nT('自有人手不足'),
        specValue: `Dammam Site Services · ${money(state.addendumApplied ? 72000 : 58000)}`,
        verdict: 'ok',
      },
    ],
  });

  cards.push({
    id: 'pricing',
    title: i18nT('价格区间模型'),
    kind: 'pricing',
    badge: i18nT('规则集 {p0}', { p0: pack?.version || RULE_VERSION }),
    calcLines: pricing.lines,
    priceRange: pricing.range,
  });

  cards.push({
    id: 'benchmark',
    title: i18nT('历史投标对比'),
    kind: 'benchmark',
    benchmark: [
      { name: i18nT('历史 A · 工业园周界'), scope: i18nT('96 台 + 光纤 2.1km'), total: money(3120000), margin: '15.2%', result: i18nT('中标') },
      { name: i18nT('历史 B · 港区安防'), scope: i18nT('140 台 + 存储'), total: money(4260000), margin: '13.8%', result: i18nT('未中标（价格高 6%）') },
      { name: i18nT('历史 C · 市政监控'), scope: i18nT('110 台'), total: money(3480000), margin: '16.9%', result: i18nT('中标') },
      { name: i18nT('本次'), scope: i18nT('{cameras} 台 + 光纤 4.2km + 三年维保', { cameras }), total: money(pricing.floorPrice), margin: '18.0%', result: i18nT('待定') },
    ],
    benchmarkNote:
      i18nT('历史投标仅作对照口径，不直接抄价：历史 B 的失利价差来自当时未计外协溢价。') +
      (state.addendumApplied
        ? i18nT('本次因 90 天工期触发两班作业，外协单价上浮 12%，建议区间下限相应上移。')
        : i18nT('本次外协按常规排期计价。')),
  });

  // 结论由「cannot 栏是否非空」推导：硬性不满足优先于综合评分（需求 D2-17 第 1 条规则）。
  // 现场把 ISO 证书拖进「无法满足」→ 这里立刻翻成不参与，而下面的 scores 一分不变
  //（正是需求要的「总分不变也要翻转」）。
  const blocked = blockingGates.length > 0;
  cards.push({
    id: 'decision',
    title: i18nT('Bid / No-Bid 建议'),
    kind: 'decision',
    badge: blocked ? i18nT('不参与') : i18nT('有条件参与'),
    badgeTone: blocked ? 'danger' : 'warn',
    decision: {
      recommendation: blocked ? i18nT('不参与（No-Bid）') : i18nT('有条件参与（Conditional Bid）'),
      tone: blocked ? 'danger' : 'warn',
      confidence: blocked ? i18nT('高（硬性条件不可解）') : i18nT('中等（68%）'),
      conditions: blocked
        ? blockingGates.map((g) => i18nT('先解决：{p0}{p1}', { p0: g.title, p1: g.note ? `（${g.note}）` : '' }))
        : [
            i18nT('光纤熔接外协伙伴在 08-18 前书面确认排期与单价'),
            i18nT('ISO 27001 证书在投标前完成续证（现证 09-02 到期）'),
            i18nT('招标人接受"近 3 年本地同类案例"以联合体或既往项目替代认定'),
          ],
      // 需求 C3：只要「无法满足」栏非空就强制出现红条（提醒总分不能覆盖硬性风险）；
      // 结论翻不翻是另一回事——可化解的走前提条件，不可化解的才 No-Bid。
      hardBlock: cannotMeetGates.length
        ? (blocked
            ? i18nT('硬性条件未满足：{p0} —— 总分不能覆盖', { p0: blockingGates.map((g) => g.title).join('、') })
            : i18nT('硬性条件未满足：{p0} —— 需招标人书面放宽，总分不能覆盖', { p0: cannotMeetGates.map((g) => g.title).join('、') }))
        : undefined,
      // 权重来自数据包（Administrator 可配）；得分按"该档达成率 × 权重"算，
      // 改权重立刻反映到分数上，但**不影响硬性门槛的翻转结论**（需求 D2-17 第 1 条）。
      scores: decisionScores(state, pack),
    },
  });

  cards.push({
    id: 'taskplan',
    title: i18nT('投标准备任务'),
    kind: 'taskplan',
    badge: i18nT('审批通过后生成 · 不外发'),
    badgeTone: 'muted',
    taskplan: [
      { task: i18nT('向招标人提交案例认定澄清函'), owner: i18nT('商务 · M. Saleh'), due: '2026-08-15', dependsOn: '—' },
      { task: i18nT('锁定光纤外协排期与报价'), owner: i18nT('采购 · A. Khan'), due: '2026-08-18', dependsOn: i18nT('外协计划') },
      { task: i18nT('ISO 27001 续证材料提交'), owner: i18nT('质量 · L. Zhou'), due: '2026-08-20', dependsOn: '—' },
      { task: i18nT('技术方案与符合性矩阵定稿'), owner: i18nT('技术 · R. Ahmed'), due: '2026-08-21', dependsOn: i18nT('符合性矩阵') },
      { task: i18nT('价格终审与保函办理'), owner: i18nT('财务 · S. Ali'), due: '2026-08-25', dependsOn: i18nT('价格区间模型') },
    ],
  });

  // 输出物 —— 需求 2.5「必须输出」里可交付成文件的那几项。
  // 之前招投标模块整条链走到最后没有任何生成入口，等于演到 Bid/No-Bid 就断了。
  cards.push({
    id: 'output',
    title: i18nT('输出物'),
    kind: 'outputs',
    badge: i18nT('未审批 · 带草稿水印'),
    badgeTone: 'muted',
    outputs: [
      { name: i18nT('Bid_No-Bid_建议书.docx'), kind: 'word', version: 'v1', draft: true },
      { name: i18nT('技术商务符合性矩阵.xlsx'), kind: 'excel', version: 'v1', draft: true },
      { name: i18nT('投标准备任务清单.xlsx'), kind: 'excel', version: 'v1', draft: true },
    ],
  });

  return cards;
}

/** 各档达成率（0-1）。交付一档受 Addendum 影响——90 天工期把交付分打下来。 */
function achievementRates(state: ModuleState): Record<string, number> {
  return {
    qualification: 0.7,
    technical: 0.84,
    delivery: state.addendumApplied ? 0.53 : 0.8,
    profit: 0.8,
    history: 0.7,
    supply: 0.6,
    risk: 0.6,
  };
}

/** 评分 = 达成率 × 权重（权重由数据包配）。缺档位就回落出厂权重。 */
function decisionScores(state: ModuleState, pack?: DataPackInput): { label: string; weight: number; score: number }[] {
  const weights = pack?.decisionWeights?.length
    ? pack.decisionWeights
    : [
        { key: 'qualification', label: i18nT('资质'), weight: 20 },
        { key: 'technical', label: i18nT('技术 / 产品'), weight: 25 },
        { key: 'delivery', label: i18nT('交付'), weight: 15 },
        { key: 'profit', label: i18nT('利润'), weight: 15 },
        { key: 'history', label: i18nT('历史 / 客户'), weight: 10 },
        { key: 'supply', label: i18nT('外协 / 供应'), weight: 10 },
        { key: 'risk', label: i18nT('综合风险'), weight: 5 },
      ];
  const rates = achievementRates(state);
  return weights.map((w) => ({
    label: w.label,
    weight: w.weight,
    score: Math.round(w.weight * (rates[w.key] ?? 0.7)),
  }));
}

function advisoryCards(state: ModuleState): CardData[] {
  const commercial = state.segment === 'commercial';

  return [
    {
      id: 'request',
      title: i18nT('请求信息卡'),
      kind: 'fields',
      confidence: 0.92,
      evidenceCount: 9,
      fields: [
        { key: 'customer', label: i18nT('客户'), value: 'Gulf Air Quality Trading Est.', confidence: 0.97, anchors: [] },
        { key: 'product', label: i18nT('产品'), value: i18nT('H13 空气净化器'), confidence: 0.96, anchors: [pdf('Product_Spec_H13.pdf', 1)] },
        { key: 'market', label: i18nT('目标市场'), value: i18nT('沙特阿拉伯'), confidence: 0.98, anchors: [] },
        { key: 'segment', label: i18nT('目标客户'), value: commercial ? i18nT('办公室与商业客户') : i18nT('家庭消费者'), confidence: 0.9, anchors: [] },
        { key: 'question', label: i18nT('问题摘要'), value: i18nT('市场进入方式、产品合规、进口商责任、销售渠道、时间与风险'), confidence: 0.93, anchors: [] },
        { key: 'urgency', label: i18nT('紧急度'), value: i18nT('高（期望 08-17 前答复）'), confidence: 0.85, anchors: [] },
        { key: 'deliverable', label: i18nT('期望交付物'), value: i18nT('简短回复 + 完整咨询报告'), confidence: 0.9, anchors: [] },
        { key: 'channels', label: i18nT('收件渠道'), value: i18nT('3 条（邮件 / 网页表单工单 / WhatsApp）'), confidence: 1, anchors: [] },
      ],
    },
    {
      id: 'merge',
      title: i18nT('多渠道合并'),
      kind: 'timeline',
      badge: i18nT('3 条来源 · 建议合并'),
      badgeTone: 'warn',
      timeline: [
        { channel: 'email', at: '2026-08-09 09:12', summary: i18nT('H13 空气净化器进入沙特市场咨询（含产品参数 PDF）') },
        { channel: 'webform', at: '2026-08-09 14:20', summary: i18nT('认证与清关周期咨询（工单 WF-2026-0809-0037）'), ticketNo: 'WF-2026-0809-0037' },
        { channel: 'whatsapp', at: '2026-08-10 10:05', summary: i18nT('补充：先做家庭消费者市场，想知道预算区间') },
      ],
      mergeReasons: [
        { label: i18nT('客户名规范化后相同'), score: 25 },
        { label: i18nT('主题相似度 0.86'), score: 25 },
        { label: i18nT('同一联系人 72 小时内'), score: 10 },
        { label: i18nT('附件 sha256 相同（Product_Spec_H13.pdf）'), score: 60 },
      ],
    },
    {
      id: 'gap',
      title: i18nT('信息缺口与澄清问题'),
      kind: 'gaps',
      badge: i18nT('3 项缺失'),
      badgeTone: 'warn',
      gaps: [
        { label: i18nT('认证状态'), note: i18nT('未说明产品是否已有 CE / 其他市场认证可复用') },
        { label: i18nT('目标价格'), note: i18nT('未说明零售定价区间（影响渠道与关税测算）') },
        { label: i18nT('进口商安排'), note: i18nT('未说明是否已有本地进口商或计划设立实体') },
      ],
      questions: [
        i18nT('产品目前持有哪些市场的认证（CE / FCC / 其他）？部分测试报告可在 SABER 流程中复用。'),
        i18nT('计划的零售价格区间是多少？这会直接影响渠道选择与利润测算。'),
        i18nT('是否已有本地进口商，或计划以外资实体自行进口？两条路径的责任主体不同。'),
      ],
    },
    {
      id: 'internal',
      title: i18nT('内部检索结果'),
      kind: 'evidenceList',
      badge: i18nT('5 条内部引用'),
      evidences: [
        {
          id: 'int-1', kind: 'internal_doc', title: i18nT('过往报告：小家电进入沙特市场（2025）'),
          excerpt: i18nT('同类小家电从提交测试到取得符合性证书平均 6–9 周，其中实验室排期占 3–4 周。'),
          updatedAt: '2025-11-20', permission: 'internal', confidence: 0.88,
          anchor: pdf('Report_SmallAppliance_2025.pdf', 14),
        },
        {
          id: 'int-2', kind: 'internal_doc', title: i18nT('服务目录：市场进入与合规服务'),
          excerpt: i18nT('合规路线图（2 周）、进口商对接（3 周）、渠道落地陪跑（8 周）三档服务及价格区间。'),
          updatedAt: '2026-06-01', permission: 'internal', confidence: 0.95,
          anchor: pdf('Service_Catalog.pdf', 3),
        },
        {
          id: 'int-3', kind: 'history', title: i18nT('历史客户问答：进口商责任归属'),
          excerpt: i18nT('客户常见误解：以为货代可代为承担进口商责任；实际责任主体须为持证进口实体。'),
          updatedAt: '2026-03-12', permission: 'internal', confidence: 0.82,
        },
        {
          id: 'int-4', kind: 'internal_doc',
          title: commercial ? i18nT('案例：B2B 商业客户渠道搭建') : i18nT('案例：消费电子零售渠道搭建'),
          excerpt: commercial
            ? i18nT('面向办公与商业客户以项目型销售为主，决策链为设施经理 → 采购 → 财务，平均周期 8–14 周。')
            : i18nT('面向家庭消费者以电商与连锁零售为主，决策周期短，售后与本地化说明书是关键。'),
          updatedAt: '2026-05-08', permission: 'internal', confidence: 0.86,
        },
      ],
    },
    {
      id: 'external',
      title: i18nT('外部研究结果'),
      kind: 'evidenceList',
      badge: i18nT('仅限获准来源 (4/4)'),
      badgeTone: 'ok',
      approvedSourceNote: i18nT('本卡只检索管理页登记的获准来源；问到清单外内容时明确回答「无获准来源覆盖」，不自由发挥。'),
      evidences: [
        {
          id: 'ext-1', kind: 'external_site', title: i18nT('清关前需取得符合性证书（SABER 流程）'),
          excerpt: i18nT('受管制产品须在清关前完成产品符合性与货运符合性两级证书。'),
          updatedAt: '2026-08-04', scope: i18nT('全部受管制品类'), permission: 'public', confidence: 0.91,
          anchor: { docId: 'saso', docName: 'saso.gov.sa', type: 'web', url: 'https://saso.gov.sa', capturedAt: '2026-08-04' },
        },
        {
          id: 'ext-2', kind: 'snapshot', title: i18nT('能效与安全标准适用性'),
          excerpt: i18nT('家用空气处理设备适用相应安全与电磁兼容标准，需由获认可实验室出具报告。'),
          updatedAt: '2026-07-28', scope: i18nT('家用电器'), permission: 'public', confidence: 0.84,
          anchor: { docId: 'std', docName: i18nT('standards-portal（快照）'), type: 'web', url: 'https://standards.example', capturedAt: '2026-07-28' },
        },
        {
          id: 'ext-3', kind: 'external_site', title: i18nT('进口商责任主体 —— 来源 A'),
          excerpt: i18nT('进口商（Importer of Record）为符合性与市场后监管的责任主体。'),
          updatedAt: '2026-08-04', scope: i18nT('进口合规'), permission: 'public', confidence: 0.8,
          conflictsWith: ['ext-4'],
          anchor: { docId: 'srcA', docName: i18nT('来源 A（快照）'), type: 'web', url: 'https://a.example', capturedAt: '2026-08-04' },
        },
        {
          id: 'ext-4', kind: 'external_site', title: i18nT('进口商责任主体 —— 来源 B'),
          excerpt: i18nT('在特定安排下，经销商可作为记录进口方承担相应责任。'),
          updatedAt: '2026-07-12', scope: i18nT('进口合规'), permission: 'public', confidence: 0.62,
          conflictsWith: ['ext-3'],
          anchor: { docId: 'srcB', docName: i18nT('来源 B（快照）'), type: 'web', url: 'https://b.example', capturedAt: '2026-07-12' },
        },
      ],
    },
    {
      id: 'reply',
      title: i18nT('简短客户回复'),
      kind: 'report',
      badge: i18nT('一屏读完'),
      // 逐行给，不在这里 join —— 拼出来的整段不是字面量，收不进 i18n 词典，
      // 阿语/英语下会整段留中文。按行存，每行都是可翻译单元，渲染时再逐行 $t()。
      replyLines: commercial
        ? [
            i18nT('Faisal 您好，'),
            '',
            i18nT('就 H13 空气净化器面向沙特**办公室与商业客户**的进入方式，先给出要点：'),
            i18nT('1) 合规：清关前需完成产品符合性与货运符合性两级证书，按同类小家电经验约 6–9 周；'),
            i18nT('2) 责任主体：需由持证进口实体承担进口商责任 —— 这一点两份公开来源口径不一致，我们已标注待人工核验；'),
            i18nT('3) 渠道：商业客户以项目型销售为主，建议优先接触设施管理服务商与办公家具/装修集成商，决策周期约 8–14 周；'),
            i18nT('4) 时间：认证与首批进口并行推进，最快约 12 周可具备开售条件。'),
            '',
            i18nT('完整报告随附，其中列明了三项待您确认的信息（认证状态、目标价格、进口商安排）。'),
          ]
        : [
            i18nT('Faisal 您好，'),
            '',
            i18nT('就 H13 空气净化器面向沙特**家庭消费者**的进入方式，先给出要点：'),
            i18nT('1) 合规：清关前需完成产品符合性与货运符合性两级证书，按同类小家电经验约 6–9 周；'),
            i18nT('2) 责任主体：需由持证进口实体承担进口商责任 —— 这一点两份公开来源口径不一致，我们已标注待人工核验；'),
            i18nT('3) 渠道：消费市场以电商平台与连锁零售为主，阿语包装与本地售后是上架前置条件；'),
            i18nT('4) 时间：认证与首批进口并行推进，最快约 12 周可具备开售条件。'),
            '',
            i18nT('完整报告随附，其中列明了三项待您确认的信息（认证状态、目标价格、进口商安排）。'),
          ],
    },
    {
      id: 'report',
      title: i18nT('七段咨询报告'),
      kind: 'report',
      badge: i18nT('来源自动生成'),
      reportSections: [
        {
          id: 'summary', title: i18nT('执行摘要'),
          body: commercial
            ? i18nT('H13 空气净化器可以进入沙特市场，面向办公室与商业客户的路径以项目型销售为主。关键前置是清关前取得两级符合性证书，并明确进口商责任主体。按同类产品经验，认证约 6–9 周，最快 12 周具备开售条件。')
            : i18nT('H13 空气净化器可以进入沙特市场，面向家庭消费者的路径以电商与连锁零售为主。关键前置是清关前取得两级符合性证书，并明确进口商责任主体。按同类产品经验，认证约 6–9 周，最快 12 周具备开售条件。'),
        },
        {
          id: 'request', title: i18nT('需求与假设'),
          body: i18nT('客户要求说明市场进入、产品合规、进口商责任、销售渠道、时间与风险。已知：产品为 H13 级过滤，目标市场为沙特。假设：产品持有可复用的境外测试报告；未确认事项见"风险与核验"。缺口三项：认证状态、目标价格、进口商安排。'),
        },
        {
          id: 'findings', title: i18nT('发现'),
          body: commercial
            ? i18nT('合规：受管制品类须完成产品符合性与货运符合性两级证书。渠道：商业客户决策链为设施经理 → 采购 → 财务，平均周期 8–14 周，采购看重批量报价、维保与滤芯供应承诺。时间：实验室排期占认证总时长的 3–4 周。内部能力：我方具备合规路线图、进口商对接与渠道陪跑三档服务。')
            : i18nT('合规：受管制品类须完成产品符合性与货运符合性两级证书。渠道：消费市场以电商平台与连锁零售为主，阿语包装、说明书与本地售后是上架前置条件。时间：实验室排期占认证总时长的 3–4 周。内部能力：我方具备合规路线图、进口商对接与渠道陪跑三档服务。'),
        },
        {
          id: 'path', title: i18nT('建议路径'),
          body: commercial
            ? i18nT('30 天：确认认证复用范围、启动测试、锁定进口商主体。60 天：完成证书、组建商业客户目标名单（设施管理服务商、办公集成商），准备批量报价与维保方案。90 天：首批到货、启动 3–5 个样板项目并沉淀案例。')
            : i18nT('30 天：确认认证复用范围、启动测试、锁定进口商主体。60 天：完成证书、完成阿语包装与说明书、洽谈电商与连锁渠道。90 天：首批到货、上架并启动首轮零售推广。'),
        },
        {
          id: 'risks', title: i18nT('风险与核验'),
          body: i18nT('① 进口商责任主体：两份公开来源口径不一致（来源 A 08-04 / 来源 B 07-12），**待人工核验**，置信度 62%–80%。② 实验室排期波动可能使认证延长 2–3 周，置信度 84%。③ 未取得目标价格前，关税与渠道毛利测算为区间估计，置信度 70%。以上结论须由顾问审核后方可对外。'),
        },
        {
          id: 'services', title: i18nT('服务与下一步'),
          body: i18nT('可提供：合规路线图（2 周）、进口商对接（3 周）、渠道落地陪跑（8 周）。下一步建议先做合规路线图，产出认证清单、时间表与费用明细；同时并行确认进口商安排。'),
        },
        {
          id: 'sources', title: i18nT('来源'),
          body: [
            i18nT('内部：过往报告《小家电进入沙特市场（2025）》p.14；服务目录 p.3；历史客户问答（2026-03-12）。'),
            i18nT('外部：saso.gov.sa（快照 2026-08-04）；standards-portal（快照 2026-07-28）；来源 A（快照 2026-08-04）；来源 B（快照 2026-07-12）。'),
            i18nT('冲突项：进口商责任主体 —— 来源 A 与来源 B 不一致，已标注待人工核验。'),
          ].join('\n'),
        },
      ].map((s) => ({
        ...s,
        // 监管基础事实段落：Proof Switch 切换目标客户时**逐字不变**
        regulatory: ['risks', 'sources'].includes(s.id) || s.id === 'request',
      })),
    },
    // 输出物 —— 需求 3.3 第 7 步「形成双输出」要落成文件才算交付完。
    // 之前咨询模块也没有生成入口，报告只能停在屏幕上。
    {
      id: 'output',
      title: i18nT('输出物'),
      kind: 'outputs',
      badge: i18nT('未审批 · 带草稿水印'),
      badgeTone: 'muted',
      outputs: [
        { name: i18nT('咨询报告_七段.docx'), kind: 'word', version: 'v1', draft: true },
        { name: i18nT('咨询报告_七段.pdf'), kind: 'pdf', version: 'v1', draft: true },
        { name: i18nT('简短客户回复.eml'), kind: 'email', version: 'v1', draft: true },
      ],
    },
  ];
}

export function buildCards(moduleId: SaudiModuleId, state: ModuleState, pack?: DataPackInput): CardData[] {
  if (moduleId === 'rfq-quote') return rfqCards(state, pack);
  if (moduleId === 'bid-decision') return bidCards(state, pack);
  return advisoryCards(state);
}
