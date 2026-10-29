const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const ut = [
  "{p0} 已归类为 {purpose}。",
  "{p0} 已真实解析：{p1} 字符、{p2} 个工作表；已建立证据与知识索引。",
  "品项“{p0}”已标记为{statusLabel}。",
  "品项“{p0}”的逐行成本和售价已更新。",
  "字段“{p0}”已标记为{statusLabel}。",
  "已从批准的第 {p0} 版导出 {p1} 个正式文件。",
  "已在本机创建并关联 {p0} 份可实际读取的中文招标源文件。",
  "已按成本权重把 {p0} 的报价分摊到 {p1} 个 BOQ 品项。",
  "已添加 {p0} 份招标来源文件。",
  "真实工作流运行 {p0} 已启动。",
  "真实工作流运行 {p0} 已完成，结果已回写项目工作台。",
  "要求“{p0}”的人工结论为{decisionLabel}。"
].map((v) => {
  const s = [], c = v.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\w+)\}/g, (f, S) => (s.push(S), "(.+?)"));
  return { key: v, names: s, re: new RegExp(`^${c}$`) };
});
function pt(v, s) {
  for (const c of ut) {
    const f = c.re.exec(v);
    if (f) return s(c.key, Object.fromEntries(c.names.map((S, b) => [S, s(f[b + 1])])));
  }
  return s(v);
}
const Re = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!Re) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const mt = Re.default, re = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/brand.ts"];
if (!re) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/brand.ts");
re.default;
const z = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/humanize.ts"];
if (!z) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/humanize.ts");
z.default;
const se = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:pinia"];
if (!se) throw new Error("宿主模块未就绪：npm:pinia");
se.default;
const ce = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!ce) throw new Error("宿主模块未就绪：npm:vue-router");
ce.default;
const de = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!de) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
de.default;
const ue = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/workflowAutoRun.ts"];
if (!ue) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/workflowAutoRun.ts");
ue.default;
const k = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/bidDesk.ts"];
if (!k) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/bidDesk.ts");
k.default;
const n = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!n) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
n.default;
const Te = {
  "zh-CN": {
    title: n.t("AI 项目工作台"),
    subtitle: n.t("从 RFQ/BOQ 到审批文件的可追溯业务闭环"),
    newCase: n.t("新建投标项目"),
    resetDemo: n.t("载入完整项目数据"),
    customer: n.t("客户"),
    project: n.t("项目"),
    deadline: n.t("截止时间"),
    owner: n.t("负责人"),
    version: n.t("版本"),
    documents: n.t("文件与字段"),
    compliance: n.t("符合性与风险"),
    pricing: n.t("商业报价"),
    approval: n.t("审批与输出"),
    timeline: n.t("审计时间线"),
    overview: n.t("项目工作台"),
    upload: n.t("添加 RFQ / BOQ / 规格书"),
    noDocuments: n.t("尚未添加文件"),
    fieldsReview: n.t("关键字段复核"),
    sourceEvidence: n.t("来源证据"),
    accept: n.t("接受"),
    reject: n.t("驳回"),
    pending: n.t("待确认"),
    lineItems: n.t("品项与产品匹配"),
    finding: n.t("客户要求"),
    response: n.t("我方响应"),
    severity: n.t("严重度"),
    decision: n.t("人工结论"),
    clarification: n.t("澄清问题"),
    saveDecision: n.t("保存结论"),
    decisionSaved: n.t("结论已保存"),
    editDecision: n.t("修改结论"),
    noClarification: n.t("未填写补充说明"),
    saveDecisionFailed: n.t("保存结论失败"),
    pricingInputs: n.t("成本与商业参数"),
    productCost: n.t("产品成本（USD）"),
    exchangeRate: n.t("USD/SAR 汇率"),
    supplierQuote: n.t("供应商报价（SAR）"),
    freight: n.t("国际运输（SAR）"),
    insurance: n.t("保险（SAR）"),
    dutyRate: n.t("关税率"),
    clearance: n.t("清关费用（SAR）"),
    storage: n.t("仓储费用（SAR）"),
    certification: n.t("认证/SABER（SAR）"),
    localTransport: n.t("本地运输（SAR）"),
    installation: n.t("安装调试（SAR）"),
    warrantyReserve: n.t("质保准备（SAR）"),
    riskReserve: n.t("风险准备（SAR）"),
    paymentTermCost: n.t("账期资金成本（SAR）"),
    targetMargin: n.t("目标毛利率"),
    minimumMargin: n.t("最低毛利率"),
    discount: n.t("折扣率"),
    createScenario: n.t("生成报价场景"),
    landedCost: n.t("落地成本"),
    offeredPrice: n.t("报价"),
    margin: n.t("毛利率"),
    ruleAlert: n.t("低于最低毛利，必须升级审批"),
    decisionCard: n.t("管理层决策卡"),
    approve: n.t("批准并冻结"),
    returnReview: n.t("退回复核"),
    rejectCase: n.t("拒绝"),
    comment: n.t("审批意见"),
    outputManifest: n.t("业务文件清单"),
    workflow: n.t("动态工作流"),
    installWorkflow: n.t("写入工作流"),
    validateWorkflow: n.t("验证流程"),
    runWorkflow: n.t("真实运行"),
    openWorkflowRun: n.t("进入工作流并真实运行"),
    viewLinkedWorkflow: n.t("在工作流中查看"),
    workflowResultsHint: n.t("项目与工作流双向关联"),
    caseWorkflowCreated: n.t("投标项目与专属工作流已同步创建"),
    workflowReady: n.t("已接入 WorkflowEngine"),
    workflowAvailable: n.t("WorkflowEngine 已就绪 · 项目流程待同步"),
    workflowUnavailable: n.t("当前环境没有工作流 IPC"),
    status: n.t("状态"),
    evidenceCoverage: n.t("证据覆盖"),
    pendingReviews: n.t("待人工复核"),
    criticalRisks: n.t("重大风险"),
    currentOffer: n.t("当前报价"),
    files: n.t("文件"),
    stagePending: n.t("待运行"),
    stageRunning: n.t("运行中"),
    stageWaiting: n.t("等待人工"),
    stageCompleted: n.t("已完成"),
    stageFailed: n.t("失败"),
    noScenario: n.t("尚未生成报价场景"),
    currentLanguage: n.t("当前语言"),
    actualCapability: n.t("复用能力"),
    actualCapabilityText: n.t("WorkflowEngine · AgentEngine · VLM/Embedding · 文档输出 · i18n/RTL"),
    auditEmpty: n.t("尚无审计事件"),
    viewEvidence: n.t("查看证据"),
    close: n.t("关闭"),
    parseQueued: n.t("待解析"),
    parseReview: n.t("待复核"),
    parseCompleted: n.t("已完成"),
    outputs: n.t("英文报价、阿拉伯语报价、英阿双语报价、结构化 BOQ、缺失项、合规矩阵、澄清/偏离清单、商业方案、内部审批与审计"),
    savePricing: n.t("保存参数"),
    workflowStarted: n.t("工作流已启动"),
    workflowSaved: n.t("投标工作流已保存到现有工作流引擎"),
    caseHeading: n.t("投标项目"),
    viewAll: n.t("查看全部"),
    evidenceExtraction: n.t("证据优先提取"),
    field: n.t("字段"),
    value: n.t("值"),
    confidence: n.t("置信度"),
    description: n.t("描述"),
    quantity: n.t("数量"),
    matchedProduct: n.t("匹配产品"),
    match: n.t("匹配度"),
    pricingEngine: n.t("确定性定价引擎"),
    scenarioName: n.t("场景名称"),
    scenarios: n.t("报价场景"),
    deviations: n.t("偏离项"),
    frozenScenario: n.t("冻结的报价场景"),
    frozenVersion: n.t("已冻结版本"),
    draft: n.t("草稿"),
    outputReady: n.t("已审批数据可以生成正式文件"),
    outputLocked: n.t("正式文件生成前必须完成审批"),
    beforeAfter: n.t("变更前 / 变更后"),
    stageIngest: n.t("文档接收与解析"),
    stageFieldReview: n.t("关键字段复核"),
    stageCompliance: n.t("符合性与风险"),
    stageCommercial: n.t("商业报价闸口"),
    stageDecision: n.t("管理层决策卡"),
    stageApproval: n.t("管理层审批"),
    stageOutput: n.t("业务文件输出"),
    statusNew: n.t("新建"),
    statusUnderReview: n.t("复核中"),
    statusClarification: n.t("待澄清"),
    statusPricing: n.t("报价中"),
    statusPendingApproval: n.t("待审批"),
    statusApproved: n.t("已批准"),
    statusSubmitted: n.t("已提交"),
    statusClosed: n.t("已关闭"),
    decisionDraft: n.t("草稿"),
    decisionApproved: n.t("已批准"),
    decisionRejected: n.t("已拒绝"),
    decisionReturned: n.t("已退回"),
    preview: n.t("预览"),
    exportFile: n.t("导出"),
    exportAll: n.t("导出正式文件包"),
    exportSuccess: n.t("正式文件已导出"),
    exportFailed: n.t("导出失败"),
    artifactCount: n.t("份已审批业务文件"),
    unitCost: n.t("单位成本 SAR"),
    customerUnitPrice: n.t("客户单价 SAR"),
    aiRecommendation: n.t("AI 建议"),
    approvalBlocked: n.t("当前还不能批准"),
    moreInformation: n.t("补充资料"),
    modifyBeforeApproval: n.t("修改后再审"),
    allocateBoq: n.t("按当前报价自动分摊 BOQ 单价")
  },
  "en-US": {
    title: "AI Project Workspace",
    subtitle: "A traceable business loop from RFQ/BOQ to approved deliverables",
    newCase: "New Bid Case",
    resetDemo: "Load full project data",
    customer: "Customer",
    project: "Project",
    deadline: "Deadline",
    owner: "Owner",
    version: "Version",
    documents: "Documents & fields",
    compliance: "Compliance & risk",
    pricing: "Commercial pricing",
    approval: "Approval & outputs",
    timeline: "Audit timeline",
    overview: "Case workspace",
    upload: "Add RFQ / BOQ / specification",
    noDocuments: "No source documents",
    fieldsReview: "Critical field review",
    sourceEvidence: "Source evidence",
    accept: "Accept",
    reject: "Reject",
    pending: "Pending",
    lineItems: "Line items & product match",
    finding: "Requirement",
    response: "Our response",
    severity: "Severity",
    decision: "Human decision",
    clarification: "Clarification",
    saveDecision: "Save decision",
    decisionSaved: "Decision saved",
    editDecision: "Edit decision",
    noClarification: "No additional note",
    saveDecisionFailed: "Failed to save decision",
    pricingInputs: "Cost and commercial inputs",
    productCost: "Product cost (USD)",
    exchangeRate: "USD/SAR rate",
    supplierQuote: "Supplier quotation (SAR)",
    freight: "International freight (SAR)",
    insurance: "Insurance (SAR)",
    dutyRate: "Duty rate",
    clearance: "Customs clearance (SAR)",
    storage: "Storage (SAR)",
    certification: "Certification/SABER (SAR)",
    localTransport: "Local transport (SAR)",
    installation: "Installation (SAR)",
    warrantyReserve: "Warranty reserve (SAR)",
    riskReserve: "Risk reserve (SAR)",
    paymentTermCost: "Payment-term financing (SAR)",
    targetMargin: "Target margin",
    minimumMargin: "Minimum margin",
    discount: "Discount",
    createScenario: "Create scenario",
    landedCost: "Landed cost",
    offeredPrice: "Offer price",
    margin: "Margin",
    ruleAlert: "Below minimum margin; escalation approval is required",
    decisionCard: "Management Decision Card",
    approve: "Approve & freeze",
    returnReview: "Return for review",
    rejectCase: "Reject",
    comment: "Approval comment",
    outputManifest: "Business output manifest",
    workflow: "Dynamic workflow",
    installWorkflow: "Connect existing workflow",
    validateWorkflow: "Validate dry-run",
    runWorkflow: "Run live",
    openWorkflowRun: "Open workflow and run live",
    viewLinkedWorkflow: "View in workflows",
    workflowResultsHint: "Bid case and workflow stay linked",
    caseWorkflowCreated: "Bid case and its workflow were created together",
    workflowReady: "Connected to WorkflowEngine",
    workflowAvailable: "WorkflowEngine ready · project workflow can be synced",
    workflowUnavailable: "Workflow IPC is unavailable",
    status: "Status",
    evidenceCoverage: "Evidence coverage",
    pendingReviews: "Pending reviews",
    criticalRisks: "Critical risks",
    currentOffer: "Current offer",
    files: "Files",
    stagePending: "Pending",
    stageRunning: "Running",
    stageWaiting: "Waiting for human",
    stageCompleted: "Completed",
    stageFailed: "Failed",
    noScenario: "No pricing scenario yet",
    currentLanguage: "Client language",
    actualCapability: "Reused capabilities",
    actualCapabilityText: "WorkflowEngine · AgentEngine · VLM/Embedding · document outputs · i18n/RTL",
    auditEmpty: "No audit events",
    viewEvidence: "View evidence",
    close: "Close",
    parseQueued: "Queued",
    parseReview: "Review",
    parseCompleted: "Completed",
    outputs: "English, Arabic and EN-AR quotations, BOQ, missing items, compliance, clarifications, deviations, proposal, approval and audit",
    savePricing: "Save inputs",
    workflowStarted: "Workflow started",
    workflowSaved: "Bid Desk workflow saved to the existing WorkflowEngine",
    caseHeading: "Bid Case",
    viewAll: "View all",
    evidenceExtraction: "Evidence-first extraction",
    field: "Field",
    value: "Value",
    confidence: "Confidence",
    description: "Description",
    quantity: "Quantity",
    matchedProduct: "Matched product",
    match: "Match",
    pricingEngine: "Deterministic pricing engine",
    scenarioName: "Scenario name",
    scenarios: "Pricing scenarios",
    deviations: "Deviations",
    frozenScenario: "Frozen scenario",
    frozenVersion: "Frozen version",
    draft: "Draft",
    outputReady: "Approved data can be rendered",
    outputLocked: "Approval is required before final rendering",
    beforeAfter: "Before / after",
    stageIngest: "Document intake",
    stageFieldReview: "Critical field review",
    stageCompliance: "Compliance & risk",
    stageCommercial: "Commercial gate",
    stageDecision: "Decision Card",
    stageApproval: "Management approval",
    stageOutput: "Document output",
    statusNew: "New",
    statusUnderReview: "Under review",
    statusClarification: "Clarification required",
    statusPricing: "Pricing",
    statusPendingApproval: "Pending approval",
    statusApproved: "Approved",
    statusSubmitted: "Submitted",
    statusClosed: "Closed",
    decisionDraft: "Draft",
    decisionApproved: "Approved",
    decisionRejected: "Rejected",
    decisionReturned: "Returned",
    preview: "Preview",
    exportFile: "Export",
    exportAll: "Export formal package",
    exportSuccess: "Formal deliverables exported",
    exportFailed: "Export failed",
    artifactCount: "approved business artifacts",
    unitCost: "Unit cost SAR",
    customerUnitPrice: "Customer unit price SAR",
    aiRecommendation: "AI recommendation",
    approvalBlocked: "Approval is currently blocked",
    moreInformation: "Request information",
    modifyBeforeApproval: "Modify and review",
    allocateBoq: "Allocate the current offer across BOQ lines"
  },
  ar: {
    title: "مساحة عمل المشروع الذكية",
    subtitle: "دورة أعمال قابلة للتتبع من طلب العرض إلى المستندات المعتمدة",
    newCase: "إنشاء ملف عرض",
    resetDemo: "تحميل بيانات المشروع الكاملة",
    customer: "العميل",
    project: "المشروع",
    deadline: "الموعد النهائي",
    owner: "المسؤول",
    version: "الإصدار",
    documents: "المستندات والحقول",
    compliance: "المطابقة والمخاطر",
    pricing: "التسعير التجاري",
    approval: "الاعتماد والمخرجات",
    timeline: "سجل التدقيق",
    overview: "مساحة ملف العرض",
    upload: "إضافة RFQ / BOQ / المواصفات",
    noDocuments: "لا توجد مستندات مصدر",
    fieldsReview: "مراجعة الحقول المهمة",
    sourceEvidence: "دليل المصدر",
    accept: "قبول",
    reject: "رفض",
    pending: "قيد المراجعة",
    lineItems: "البنود ومطابقة المنتجات",
    finding: "متطلب العميل",
    response: "استجابتنا",
    severity: "الخطورة",
    decision: "قرار المراجع",
    clarification: "استفسار",
    saveDecision: "حفظ القرار",
    decisionSaved: "تم حفظ القرار",
    editDecision: "تعديل القرار",
    noClarification: "لا توجد ملاحظات إضافية",
    saveDecisionFailed: "فشل حفظ القرار",
    pricingInputs: "التكلفة والمدخلات التجارية",
    productCost: "تكلفة المنتج بالدولار",
    exchangeRate: "سعر USD/SAR",
    supplierQuote: "عرض المورد (ر.س)",
    freight: "الشحن الدولي (ر.س)",
    insurance: "التأمين (ر.س)",
    dutyRate: "نسبة الجمارك",
    clearance: "تكلفة التخليص الجمركي (ر.س)",
    storage: "تكلفة التخزين (ر.س)",
    certification: "الشهادات/SABER (ر.س)",
    localTransport: "النقل المحلي (ر.س)",
    installation: "التركيب (ر.س)",
    warrantyReserve: "احتياطي الضمان (ر.س)",
    riskReserve: "احتياطي المخاطر (ر.س)",
    paymentTermCost: "تكلفة تمويل شروط الدفع (ر.س)",
    targetMargin: "هامش الربح المستهدف",
    minimumMargin: "الحد الأدنى للهامش",
    discount: "الخصم",
    createScenario: "إنشاء سيناريو",
    landedCost: "التكلفة النهائية",
    offeredPrice: "سعر العرض",
    margin: "هامش الربح",
    ruleAlert: "أقل من الحد الأدنى للهامش؛ يلزم اعتماد إضافي",
    decisionCard: "بطاقة قرار الإدارة",
    approve: "اعتماد وتجميد",
    returnReview: "إعادة للمراجعة",
    rejectCase: "رفض",
    comment: "ملاحظة الاعتماد",
    outputManifest: "قائمة مستندات الأعمال",
    workflow: "سير العمل الديناميكي",
    installWorkflow: "ربط سير العمل الحالي",
    validateWorkflow: "اختبار Dry-run",
    runWorkflow: "تشغيل فعلي",
    openWorkflowRun: "فتح سير العمل وتشغيله فعلياً",
    viewLinkedWorkflow: "عرض في مسارات العمل",
    workflowResultsHint: "المشروع ومسار العمل مرتبطان",
    caseWorkflowCreated: "تم إنشاء مشروع العطاء ومسار العمل المرتبط به",
    workflowReady: "متصل بمحرك WorkflowEngine",
    workflowAvailable: "محرك سير العمل جاهز · يمكن مزامنة سير العرض",
    workflowUnavailable: "واجهة سير العمل غير متاحة",
    status: "الحالة",
    evidenceCoverage: "تغطية الأدلة",
    pendingReviews: "بانتظار المراجعة",
    criticalRisks: "المخاطر الحرجة",
    currentOffer: "العرض الحالي",
    files: "الملفات",
    stagePending: "قيد الانتظار",
    stageRunning: "قيد التشغيل",
    stageWaiting: "بانتظار المراجع",
    stageCompleted: "مكتمل",
    stageFailed: "فشل",
    noScenario: "لم يتم إنشاء سيناريو تسعير",
    currentLanguage: "لغة العميل",
    actualCapability: "القدرات المعاد استخدامها",
    actualCapabilityText: "WorkflowEngine · AgentEngine · VLM/Embedding · المستندات · i18n/RTL",
    auditEmpty: "لا توجد أحداث تدقيق",
    viewEvidence: "عرض الدليل",
    close: "إغلاق",
    parseQueued: "بانتظار التحليل",
    parseReview: "للمراجعة",
    parseCompleted: "مكتمل",
    outputs: "عروض إنجليزية وعربية وثنائية اللغة، BOQ، النواقص، المطابقة، الاستفسارات، الانحرافات، العرض التجاري، الاعتماد والتدقيق",
    savePricing: "حفظ المدخلات",
    workflowStarted: "تم تشغيل سير العمل",
    workflowSaved: "تم حفظ سير عمل Bid Desk في WorkflowEngine الحالي",
    caseHeading: "ملف العرض",
    viewAll: "عرض الكل",
    evidenceExtraction: "استخراج قائم على الأدلة",
    field: "الحقل",
    value: "القيمة",
    confidence: "درجة الثقة",
    description: "الوصف",
    quantity: "الكمية",
    matchedProduct: "المنتج المطابق",
    match: "نسبة المطابقة",
    pricingEngine: "محرك تسعير حتمي",
    scenarioName: "اسم السيناريو",
    scenarios: "سيناريوهات التسعير",
    deviations: "الانحرافات",
    frozenScenario: "سيناريو السعر المجمد",
    frozenVersion: "الإصدار المجمد",
    draft: "مسودة",
    outputReady: "يمكن إنشاء المستندات الرسمية من البيانات المعتمدة",
    outputLocked: "يجب إكمال الاعتماد قبل إنشاء المستندات النهائية",
    beforeAfter: "قبل / بعد",
    stageIngest: "استلام المستندات وتحليلها",
    stageFieldReview: "مراجعة الحقول المهمة",
    stageCompliance: "المطابقة والمخاطر",
    stageCommercial: "بوابة التسعير التجاري",
    stageDecision: "بطاقة قرار الإدارة",
    stageApproval: "اعتماد الإدارة",
    stageOutput: "إخراج مستندات الأعمال",
    statusNew: "جديد",
    statusUnderReview: "قيد المراجعة",
    statusClarification: "بانتظار الاستفسار",
    statusPricing: "قيد التسعير",
    statusPendingApproval: "بانتظار الاعتماد",
    statusApproved: "معتمد",
    statusSubmitted: "تم التقديم",
    statusClosed: "مغلق",
    decisionDraft: "مسودة",
    decisionApproved: "معتمد",
    decisionRejected: "مرفوض",
    decisionReturned: "معاد للمراجعة",
    preview: "معاينة",
    exportFile: "تصدير",
    exportAll: "تصدير حزمة العرض",
    exportSuccess: "تم تصدير مستندات العرض",
    exportFailed: "فشل التصدير",
    artifactCount: "مستندات أعمال معتمدة",
    unitCost: "تكلفة الوحدة (ر.س)",
    customerUnitPrice: "سعر الوحدة للعميل (ر.س)",
    aiRecommendation: "توصية الذكاء الاصطناعي",
    approvalBlocked: "لا يمكن الاعتماد حالياً",
    moreInformation: "طلب معلومات إضافية",
    modifyBeforeApproval: "تعديل ثم مراجعة",
    allocateBoq: "توزيع قيمة العرض الحالي على بنود BOQ"
  }
};
function ft() {
  const v = e.computed(() => {
    const f = String(n.i18n.global.locale.value);
    return f === "ar" || f === "en-US" ? f : f === "vi" || f === "ms" ? "en-US" : "zh-CN";
  }), s = e.computed(() => v.value === "ar");
  return { locale: v, isRtl: s, bt: (f) => Te[v.value][f] || Te["zh-CN"][f] };
}
const pe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/bidDeskArtifacts.ts"];
if (!pe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/bidDeskArtifacts.ts");
pe.default;
const me = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/workspaceTaskRegistration.ts"];
if (!me) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/workspaceTaskRegistration.ts");
me.default;
const vt = ["dir"], gt = { class: "bid-header" }, kt = { class: "bid-title" }, Et = { class: "header-actions" }, wt = ["disabled"], Nt = {
  key: 0,
  class: "bid-body"
}, Vt = { class: "case-hero" }, yt = { class: "case-identity" }, _t = ["value"], St = { class: "version-pill" }, Dt = { class: "case-copy" }, bt = { class: "case-meta" }, ht = { class: "metric-grid" }, Ct = { class: "metric" }, At = { class: "metric" }, Bt = { class: "metric" }, Tt = { class: "metric" }, Rt = { class: "metric" }, Lt = { class: "workflow-band" }, xt = { class: "workflow-band-head" }, Wt = { class: "section-kicker" }, Pt = { class: "workflow-actions" }, Ft = { class: "workflow-result-hint" }, Ot = ["disabled"], $t = ["disabled"], It = { class: "stage-track" }, Ut = { class: "stage-dot" }, Mt = {
  key: 0,
  class: "ri-arrow-right-line stage-arrow"
}, jt = {
  class: "bid-tabs",
  "aria-label": "Bid Desk"
}, zt = ["onClick"], Kt = {
  key: 0,
  class: "tab-badge"
}, Qt = { class: "tab-panel" }, qt = { class: "content-grid two" }, Jt = { class: "panel" }, Ht = { class: "panel-head" }, Gt = { class: "section-kicker" }, Xt = {
  key: 0,
  class: "form-grid"
}, Yt = { class: "form-action" }, Zt = {
  key: 1,
  class: "summary-list"
}, en = { class: "panel capability-panel" }, tn = { class: "panel-head" }, nn = { class: "section-kicker" }, on = { class: "content-grid two lower" }, ln = { class: "panel" }, an = { class: "panel-head" }, rn = { class: "section-kicker" }, sn = { class: "doc-list compact-list" }, cn = {
  key: 0,
  class: "empty"
}, dn = { class: "panel" }, un = { class: "panel-head" }, pn = { class: "section-kicker" }, mn = { class: "audit-list mini" }, fn = { class: "panel upload-panel" }, vn = { class: "panel-head" }, gn = { class: "section-kicker" }, kn = { class: "btn primary compact file-button" }, En = { class: "doc-grid" }, wn = ["value", "onChange"], Nn = ["value"], Vn = {
  key: 0,
  class: "document-warning"
}, yn = { class: "panel table-panel" }, _n = { class: "panel-head" }, Sn = { class: "section-kicker" }, Dn = { class: "data-table" }, bn = { class: "table-row table-head fields" }, hn = { class: "field-key" }, Cn = ["onUpdate:modelValue"], An = { class: "confidence" }, Bn = ["onClick"], Tn = { class: "row-actions" }, Rn = ["title", "onClick"], Ln = ["title", "onClick"], xn = { class: "panel table-panel" }, Wn = { class: "panel-head" }, Pn = { class: "section-kicker" }, Fn = { class: "data-table" }, On = { class: "table-row table-head items" }, $n = ["onUpdate:modelValue"], In = ["onUpdate:modelValue"], Un = ["onUpdate:modelValue"], Mn = ["onClick"], jn = ["onClick"], zn = { class: "risk-summary" }, Kn = { class: "finding-list" }, Qn = { class: "finding-top" }, qn = { class: "severity-pill" }, Jn = { class: "finding-status" }, Hn = { class: "finding-columns" }, Gn = ["onClick"], Xn = {
  key: 0,
  class: "finding-decision"
}, Yn = ["onUpdate:modelValue"], Zn = { value: "compliant" }, eo = { value: "conditional" }, to = { value: "missing" }, no = { value: "deviation" }, oo = { value: "major_deviation" }, lo = { value: "pending" }, io = ["onUpdate:modelValue", "placeholder"], ao = ["disabled", "onClick"], ro = {
  key: 1,
  class: "finding-conclusion",
  "aria-live": "polite"
}, so = { class: "finding-conclusion-copy" }, co = ["onClick"], uo = {
  key: 3,
  class: "content-grid pricing-layout"
}, po = { class: "panel" }, mo = { class: "panel-head" }, fo = { class: "section-kicker" }, vo = { class: "pricing-form" }, go = { class: "number-input" }, ko = ["onUpdate:modelValue", "step"], Eo = { key: 0 }, wo = { class: "panel-actions" }, No = ["placeholder"], Vo = { class: "panel scenario-panel" }, yo = { class: "panel-head" }, _o = { class: "section-kicker" }, So = {
  key: 0,
  class: "empty"
}, Do = { class: "scenario-title" }, bo = { class: "scenario-numbers" }, ho = {
  key: 0,
  class: "rule-alert"
}, Co = {
  key: 4,
  class: "decision-layout"
}, Ao = { class: "decision-card" }, Bo = { class: "decision-card-head" }, To = { class: "section-kicker" }, Ro = { class: "decision-metrics" }, Lo = { class: "decision-evidence" }, xo = { class: "decision-summary" }, Wo = {
  key: 0,
  class: "decision-summary-list"
}, Po = { class: "decision-scenario" }, Fo = ["value"], Oo = { class: "comment-field" }, $o = {
  key: 0,
  class: "approval-blockers"
}, Io = { class: "decision-actions" }, Uo = ["disabled"], Mo = { class: "panel output-panel" }, jo = { class: "panel-head" }, zo = { class: "section-kicker" }, Ko = ["disabled"], Qo = { class: "artifact-list" }, qo = ["onClick"], Jo = ["disabled", "onClick"], Ho = { class: "output-lock" }, Go = {
  key: 5,
  class: "panel audit-panel"
}, Xo = { class: "panel-head" }, Yo = { class: "section-kicker" }, Zo = {
  key: 0,
  class: "audit-list"
}, el = { class: "audit-title" }, tl = { key: 0 }, nl = {
  key: 1,
  class: "empty"
}, ol = { class: "evidence-modal" }, ll = { class: "panel-head" }, il = { class: "artifact-modal" }, al = { class: "artifact-modal-head" }, rl = { class: "artifact-modal-title" }, sl = { class: "section-kicker" }, cl = { class: "artifact-modal-actions" }, dl = ["disabled"], ul = ["aria-label", "title"], pl = ["title", "srcdoc"], ml = {
  key: 1,
  class: "artifact-source"
}, fl = /* @__PURE__ */ e.defineComponent({
  __name: "BidDeskView",
  setup(v) {
    const s = k.useBidDeskStore(), c = de.useNotificationStore(), f = ce.useRouter(), { cases: S, activeCaseId: b, activeCase: a } = se.storeToRefs(s), { locale: y, isRtl: Le, bt: i } = ft(), E = e.ref("overview"), P = e.ref(!1), h = e.ref(!1), K = e.ref(!1), C = e.ref(!1), F = e.ref(!1), Q = e.ref(/* @__PURE__ */ new Set()), A = e.ref(null), w = e.ref(null), O = e.ref(!1), Z = e.ref(n.t("推荐报价方案")), _ = e.ref(""), $ = e.ref(""), g = e.reactive({ customer: "", project: "", rfqNumber: "", owner: "", deadline: "" }), I = e.reactive({
      productCostUsd: 0,
      exchangeRate: 3.75,
      supplierQuoteSar: 0,
      freightSar: 0,
      insuranceSar: 0,
      dutyRate: 0,
      clearanceSar: 0,
      storageSar: 0,
      certificationSar: 0,
      localTransportSar: 0,
      installationSar: 0,
      warrantyReserveSar: 0,
      riskReserveSar: 0,
      paymentTermCostSar: 0,
      targetMarginRate: 0.2,
      minimumMarginRate: 0.15,
      discountRate: 0
    }), q = e.reactive({}), J = e.reactive({}), B = e.reactive({}), T = e.reactive({}), R = e.ref(/* @__PURE__ */ new Set()), L = e.ref(""), U = e.ref("");
    let M;
    const xe = [
      { value: "rfq", label: n.t("本次招标/RFQ") },
      { value: "boq", label: n.t("工程量清单/BOQ") },
      { value: "catalog", label: n.t("产品与技术资料") },
      { value: "supplier", label: n.t("供应商报价") },
      { value: "history", label: n.t("历史项目与澄清") },
      { value: "template", label: n.t("企业模板") },
      { value: "other", label: n.t("其他资料") }
    ];
    function x() {
      if (a.value) {
        Object.assign(g, {
          customer: d(a.value.customer),
          project: d(a.value.project),
          rfqNumber: a.value.rfqNumber,
          owner: d(a.value.owner),
          deadline: a.value.deadline
        }), Object.assign(I, a.value.pricingInput);
        for (const l of a.value.fields) q[l.id] = d(l.value);
        for (const l of a.value.lineItems)
          J[l.id] = l.matchedProduct || "", B[l.id] = {
            unitCostSar: l.unitCostSar || 0,
            unitPriceSar: l.unitPriceSar || 0
          };
        for (const l of a.value.findings)
          T[l.id] = {
            decision: l.humanDecision || l.status,
            clarification: l.clarification ? d(l.clarification) : ""
          };
        _.value = a.value.decision.frozenScenarioId || a.value.scenarios[0]?.id || "", $.value = a.value.decision.comment || "";
      }
    }
    x(), e.watch(b, () => {
      R.value = /* @__PURE__ */ new Set(), L.value = "", U.value = "", x();
      const l = a.value ? k.bidDeskWorkflowDefinition(Date.now(), a.value).id : "";
      h.value = !!(l && Q.value.has(l));
    }), e.watch(() => a.value?.updatedAt, () => {
      P.value || x();
    });
    const fe = e.computed(() => a.value ? a.value.fields.filter((l) => l.reviewStatus === "pending").length + a.value.lineItems.filter((l) => l.reviewStatus === "pending").length + a.value.findings.filter((l) => !l.humanDecision).length : 0), ee = e.computed(() => a.value?.findings.filter((l) => l.severity === "critical" || l.severity === "high").length || 0), We = e.computed(() => a.value?.findings.filter((l) => ["deviation", "major_deviation"].includes(l.humanDecision || l.status)).length || 0), ve = e.computed(() => {
      if (!a.value) return 0;
      const l = [...a.value.fields, ...a.value.findings];
      return l.length ? Math.round(l.filter((o) => o.evidence?.length).length / l.length * 100) : 0;
    }), D = e.computed(() => a.value && (a.value.scenarios.find((l) => l.id === _.value) || a.value.scenarios[0]) || null), H = e.computed(() => s.approvalBlockers(_.value || void 0, $.value)), Pe = e.computed(() => a.value?.workflowStages.filter((l) => l.status === "completed").length || 0), te = e.computed(() => a.value ? pe.buildBidArtifacts(a.value, y.value) : []), Fe = e.computed(() => [
      { id: "overview", icon: "ri-dashboard-3-line", label: i("overview") },
      { id: "documents", icon: "ri-file-search-line", label: i("documents"), badge: fe.value || void 0 },
      { id: "compliance", icon: "ri-shield-check-line", label: i("compliance"), badge: ee.value || void 0 },
      { id: "pricing", icon: "ri-calculator-line", label: i("pricing") },
      { id: "approval", icon: "ri-stamp-line", label: i("approval") },
      { id: "timeline", icon: "ri-history-line", label: i("timeline") }
    ]), Oe = e.computed(() => [
      { key: "productCostUsd", label: i("productCost") },
      { key: "exchangeRate", label: i("exchangeRate") },
      { key: "supplierQuoteSar", label: i("supplierQuote") },
      { key: "freightSar", label: i("freight") },
      { key: "insuranceSar", label: i("insurance") },
      { key: "dutyRate", label: i("dutyRate"), rate: !0 },
      { key: "clearanceSar", label: i("clearance") },
      { key: "storageSar", label: i("storage") },
      { key: "certificationSar", label: i("certification") },
      { key: "localTransportSar", label: i("localTransport") },
      { key: "installationSar", label: i("installation") },
      { key: "warrantyReserveSar", label: i("warrantyReserve") },
      { key: "riskReserveSar", label: i("riskReserve") },
      { key: "paymentTermCostSar", label: i("paymentTermCost") },
      { key: "targetMarginRate", label: i("targetMargin"), rate: !0 },
      { key: "minimumMarginRate", label: i("minimumMargin"), rate: !0 },
      { key: "discountRate", label: i("discount"), rate: !0 }
    ]), $e = e.computed(() => {
      const l = { compliant: 0, conditional: 0, missing: 0, deviation: 0, major_deviation: 0, pending: 0 };
      for (const o of a.value?.findings || []) l[o.humanDecision || o.status] += 1;
      return Object.entries(l).map(([o, t]) => ({ key: o, count: t, label: N(o) }));
    });
    async function Ie() {
      s.updateCaseMeta({ ...g }), P.value = !1, a.value && await X(a.value);
    }
    function ge(l, o) {
      s.reviewField(l, q[l] || "", o);
    }
    function Ue(l) {
      s.reviewLineItem(l, J[l] || "", "accepted");
      const o = B[l] || { unitCostSar: 0, unitPriceSar: 0 };
      s.updateLinePricing(l, o.unitCostSar, o.unitPriceSar);
    }
    function Me(l, o) {
      const t = o.target.value;
      s.updateDocumentPurpose(l, t);
    }
    function ke(l) {
      return l.humanDecision === void 0 || R.value.has(l.id);
    }
    function je(l) {
      R.value = new Set(R.value).add(l);
    }
    function ze(l) {
      if (L.value) return;
      const o = T[l];
      if (!o) {
        c.error(i("saveDecisionFailed"));
        return;
      }
      L.value = l;
      try {
        if (!s.decideFinding(l, o.decision, o.clarification.trim())) throw new Error(i("saveDecisionFailed"));
        const r = new Set(R.value);
        r.delete(l), R.value = r, U.value = l, c.success(`${i("decisionSaved")} · ${N(o.decision)}`), M && window.clearTimeout(M), M = window.setTimeout(() => {
          U.value === l && (U.value = "");
        }, 1600);
      } catch (t) {
        c.fromException(i("saveDecisionFailed"), t);
      } finally {
        L.value = "";
      }
    }
    function Ke() {
      s.updatePricing({ ...I }), c.success(i("savePricing"));
    }
    function Qe() {
      s.updatePricing({ ...I });
      const l = s.createScenario(Z.value);
      l && (_.value = l.id);
    }
    function G(l) {
      const o = s.decideCase(l, _.value || void 0, $.value);
      if (!o.ok) {
        c.warn(o.blockers.join(n.t("；")));
        return;
      }
      c.success(l === "approved" ? n.t("当前版本已批准并冻结，可以导出正式文件。") : n.t("处理意见已记录。"));
    }
    function qe() {
      E.value = "documents", c.info(n.t("请修改字段、产品匹配或报价后重新进入审批；所有变更都会写入审计记录。"));
    }
    function Je() {
      if (!_.value || !s.allocateLinePrices(_.value)) {
        c.warn(n.t("请先选择有效的报价场景。"));
        return;
      }
      x(), c.success(n.t("BOQ 客户单价已按成本权重分摊，并写入审计记录。"));
    }
    function He(l) {
      const o = new Blob([l.content], { type: l.mime }), t = URL.createObjectURL(o), r = document.createElement("a");
      r.href = t, r.download = l.filename, document.body.appendChild(r), r.click(), r.remove(), window.setTimeout(() => URL.revokeObjectURL(t), 1e3);
    }
    async function Ee(l) {
      if (a.value?.decision.decision !== "approved") {
        c.warn(i("outputLocked"));
        return;
      }
      if (!(l && !l.length)) {
        O.value = !0;
        try {
          const o = window.electronAPI, t = o?.solution, r = o?.bidDesk;
          if (t?.pickFolder && r?.exportPackage && a.value) {
            const m = await t.pickFolder({ title: n.t("选择投标文件输出文件夹") });
            if (!m) return;
            const u = JSON.parse(JSON.stringify({
              folderPath: m,
              bidCase: a.value,
              locale: y.value,
              artifactIds: l?.map((V) => V.id)
            })), p = await r.exportPackage(u);
            if (!p?.ok) throw new Error(p?.error || i("exportFailed"));
            s.recordOutputs(p.paths || []), c.success(`${i("exportSuccess")} · ${m}`);
            return;
          }
          for (const m of l || te.value) He(m);
          c.success(i("exportSuccess"));
        } catch (o) {
          c.fromException(i("exportFailed"), o);
        } finally {
          O.value = !1;
        }
      }
    }
    function Ge() {
      if (a.value?.decision.decision !== "approved") {
        c.warn(i("outputLocked"));
        return;
      }
      Ee();
    }
    function we(l) {
      Ee([l]);
    }
    async function Xe(l) {
      const o = l.target, t = Array.from(o.files || []);
      if (!t.length) return;
      const r = window.electronAPI, m = s.addDocuments(t.map((u) => ({
        name: u.name,
        size: u.size,
        type: u.type,
        path: r?.getPathForFile ? r.getPathForFile(u) : void 0
      })));
      for (let u = 0; u < t.length; u += 1) {
        const p = t[u], V = m[u];
        if (V) {
          if (p.type.startsWith("image/")) {
            et(p, V);
            continue;
          }
          Ye(V);
        }
      }
      o.value = "";
    }
    async function Ye(l) {
      const o = window.electronAPI?.bidDesk;
      if (!o?.parseDocument || !l.path) {
        s.recordParsedDocument(l.id, { warnings: [n.t("未取得真实文件路径，无法解析。")] }, !0);
        return;
      }
      try {
        const t = await o.parseDocument({ path: l.path, name: l.name });
        if (Array.isArray(t?.pageImages) && t.pageImages.length) {
          const r = [];
          for (const m of t.pageImages)
            try {
              const u = await Ne(m.dataUrl);
              u.trim() && r.push(n.t(`[第 {p0} 页 · OCR]
{p1}`, { p0: m.page, p1: u.trim() }));
            } catch (u) {
              t.warnings = [
                ...t.warnings || [],
                n.t("第 {p0} 页视觉识别失败：{p1}", { p0: m.page, p1: z.humanizeErrorMessage(u) })
              ];
            }
          t.text = `${t.text || ""}

${r.join(`

`)}`.trim(), delete t.pageImages;
        }
        s.recordParsedDocument(l.id, t);
      } catch (t) {
        s.recordParsedDocument(l.id, { warnings: [z.humanizeErrorMessage(t)] }, !0);
      }
    }
    let j = "";
    async function Ze(l) {
      if (j) return j;
      try {
        const o = await l.chatProviders?.();
        j = (Array.isArray(o) ? o : []).find((t) => t?.supportsVision)?.name || "openai";
      } catch {
        j = "openai";
      }
      return j;
    }
    async function Ne(l) {
      const o = window.electronAPI?.qiyeApi;
      if (!o?.vlm) throw new Error(n.t("当前没有可用的视觉识别服务"));
      const t = await o.vlm({
        provider: await Ze(o),
        operation: "extract_text",
        imageUrl: l,
        maxTokens: 1800
      });
      return String(t?.text || "");
    }
    async function et(l, o) {
      try {
        const t = await tt(l);
        s.recordDocumentAnalysis(o.id, await Ne(t));
      } catch (t) {
        s.recordDocumentAnalysis(o.id, z.humanizeErrorMessage(t), !0);
      }
    }
    function tt(l) {
      return new Promise((o, t) => {
        const r = new FileReader();
        r.onload = () => o(String(r.result || "")), r.onerror = () => t(r.error || new Error("File read failed")), r.readAsDataURL(l);
      });
    }
    function Ve(l, o) {
      return l ? l?.origin?.kind !== "bid-desk" ? !1 : Number(l.origin.definitionVersion || 0) < Number(o.origin.definitionVersion) : !0;
    }
    function ye(l, o) {
      return l?.origin?.kind === "bid-desk" && (l.name !== o.name || l.description !== o.description || l.origin.caseId !== o.origin.caseId);
    }
    async function X(l = a.value) {
      const o = window.electronAPI;
      if (!l || !o?.saveWorkflow || !o?.listWorkflows)
        return h.value = !1, c.warn(i("workflowUnavailable")), !1;
      C.value = !0;
      try {
        const t = k.bidDeskWorkflowDefinition(Date.now(), l), r = await o.listWorkflows(), m = Array.isArray(r) ? r.find((u) => u.id === t.id) : void 0;
        return Ve(m, t) ? await o.saveWorkflow(JSON.parse(JSON.stringify({
          ...t,
          createdAt: Number(m?.createdAt) || t.createdAt
        }))) : ye(m, t) && await o.saveWorkflow(JSON.parse(JSON.stringify({
          ...m,
          name: t.name,
          description: t.description,
          origin: t.origin
        }))), Q.value = new Set(Q.value).add(t.id), l.id === b.value && (h.value = !0), s.markWorkflowSaved(t.id, l.id), !0;
      } catch (t) {
        return c.fromException(i("workflow"), t), !1;
      } finally {
        C.value = !1;
      }
    }
    async function _e() {
      const l = window.electronAPI;
      if (!(!l?.saveWorkflow || !l?.listWorkflows)) {
        C.value = !0;
        try {
          const o = await l.listWorkflows(), t = new Map(
            (Array.isArray(o) ? o : []).map((u) => [String(u.id), u])
          ), r = /* @__PURE__ */ new Set();
          for (const u of S.value) {
            const p = k.bidDeskWorkflowDefinition(Date.now(), u), V = t.get(p.id);
            if (Ve(V, p)) {
              const ae = await l.saveWorkflow({
                ...p,
                createdAt: Number(V?.createdAt) || p.createdAt
              });
              t.set(p.id, ae || p);
            } else if (ye(V, p)) {
              const ae = await l.saveWorkflow({
                ...V,
                name: p.name,
                description: p.description,
                origin: p.origin
              });
              t.set(p.id, ae || p);
            }
            r.add(p.id), s.markWorkflowSaved(p.id, u.id);
          }
          Q.value = r;
          const m = a.value ? k.bidDeskWorkflowDefinition(Date.now(), a.value).id : "";
          h.value = !!(m && r.has(m));
        } catch (o) {
          h.value = !1, c.fromException(i("workflow"), o);
        } finally {
          C.value = !1;
        }
      }
    }
    async function nt() {
      if (!F.value) {
        F.value = !0;
        try {
          const l = s.createCase(), o = await X(l);
          await Se(l), c.success(
            o ? n.t("投标项目和工作流已创建，并已登记到工作区") : n.t("投标项目已创建，并已登记到工作区")
          );
        } catch (l) {
          c.fromException(n.t("创建投标项目失败"), l);
        } finally {
          F.value = !1;
        }
      }
    }
    async function Se(l) {
      const o = k.bidDeskWorkflowDefinition(Date.now(), l);
      await me.registerWorkspaceTask({
        departmentName: n.t("投标项目"),
        departmentDescription: n.t("招标文件解析、符合性检查、商业报价、审批与投标文件输出任务。"),
        taskName: o.name,
        description: o.description,
        members: ["general_assistant"],
        origin: {
          kind: "bid-desk",
          id: `${l.id}:${l.createdAt}`,
          label: n.t("项目工作台"),
          route: "/bid-desk"
        }
      });
    }
    async function ot() {
      if (!a.value || !await X(a.value)) return;
      const l = k.bidDeskWorkflowDefinition(Date.now(), a.value).id;
      await f.push({
        path: "/cluster-workflows",
        query: { wf: l, view: "edit", source: "bid-desk" }
      });
    }
    async function lt() {
      const l = window.electronAPI;
      if (!l?.saveWorkflow || !l?.runWorkflow || !a.value) {
        c.warn(i("workflowUnavailable"));
        return;
      }
      if (a.value.id === k.REFERENCE_BID_CASE_ID && !await ne() || !await X(a.value)) return;
      try {
        await Se(a.value);
      } catch (r) {
        c.fromException(n.t("登记工作区任务失败"), r);
        return;
      }
      const o = k.bidDeskWorkflowDefinition(Date.now(), a.value), t = a.value.id;
      s.prepareWorkflowRun(o.id, t), ue.setWorkflowAutoRun(o.id, {
        caseId: t,
        bidCaseId: t,
        workflowSource: "bid-desk",
        returnPath: "/bid-desk",
        customer: a.value.customer,
        project: a.value.project,
        documents: JSON.stringify(a.value.documents.map((r) => ({
          name: r.name,
          path: r.path,
          kind: r.kind,
          language: r.language,
          parseStatus: r.parseStatus
        }))),
        pricing: JSON.stringify(D.value || a.value.pricingInput),
        knowledge: JSON.stringify(s.retrieveKnowledge(
          `${a.value.project} ${a.value.lineItems.map((r) => `${r.description} ${r.model}`).join(" ")}`,
          8,
          t
        )),
        clientLocale: y.value
      }), await f.push({ path: "/workflow" });
    }
    let De = null;
    e.onMounted(async () => {
      await s.hydrate(), x();
      const l = window.electronAPI;
      await ne(!1), K.value = !!(l?.saveWorkflow && l?.listWorkflows && l?.runWorkflow), l?.onWorkflowEvent && (De = l.onWorkflowEvent((o) => s.applyWorkflowEvent(o))), K.value && await _e();
    }), e.onUnmounted(() => {
      De?.(), M && window.clearTimeout(M);
    });
    async function ne(l = !0) {
      const o = window.electronAPI?.solution;
      if (!o?.prepareBidDemoFiles)
        return l && c.warn(n.t("当前版本尚未提供项目源文件写入能力")), !1;
      try {
        const t = await o.prepareBidDemoFiles(), r = Array.isArray(t?.documents) ? t.documents : [];
        if (!r.length) throw new Error(n.t("未生成招标源文件"));
        return s.attachDemoDocuments(r), !0;
      } catch (t) {
        return l && c.fromException(n.t("创建中文招标源文件失败"), t), !1;
      }
    }
    async function it() {
      s.resetDemo(), x(), await ne(), await _e();
    }
    function W(l) {
      return new Intl.NumberFormat(y.value === "ar" ? "ar-SA" : y.value, {
        style: "currency",
        currency: "SAR",
        maximumFractionDigits: 0
      }).format(l);
    }
    function oe(l) {
      return `${(l * 100).toFixed(1)}%`;
    }
    function be(l) {
      return l < 1024 ? `${l} B` : l < 1024 * 1024 ? `${(l / 1024).toFixed(1)} KB` : `${(l / 1024 / 1024).toFixed(1)} MB`;
    }
    function le(l) {
      return new Date(l).toLocaleString(y.value === "ar" ? "ar-SA" : y.value);
    }
    function d(l) {
      return pt(String(l ?? ""), n.t);
    }
    function ie(l) {
      const o = a.value?.documents.find((t) => t.id === l)?.name;
      return o ? d(o) : l;
    }
    function Y(l) {
      return l ? l.sheet ? `${ie(l.fileId)} · ${l.sheet}!${l.cell || ""}` : `${ie(l.fileId)}${l.page ? ` · p.${l.page}` : ""}` : "—";
    }
    function he(l) {
      return {
        pdf: "ri-file-pdf-2-line",
        word: "ri-file-word-2-line",
        excel: "ri-file-excel-2-line",
        image: "ri-image-line",
        other: "ri-file-line"
      }[l];
    }
    function at(l) {
      return {
        html: "ri-file-code-line",
        csv: "ri-file-excel-2-line",
        markdown: "ri-markdown-line",
        json: "ri-braces-line"
      }[l];
    }
    function Ce(l) {
      return i(l === "completed" ? "parseCompleted" : l === "review" ? "parseReview" : l === "failed" ? "stageFailed" : "parseQueued");
    }
    function rt(l) {
      return {
        pending: "ri-time-line",
        running: "ri-loader-2-line spin",
        waiting_human: "ri-user-voice-line",
        completed: "ri-check-line",
        failed: "ri-close-line"
      }[l];
    }
    function st(l) {
      return {
        pending: i("stagePending"),
        running: i("stageRunning"),
        waiting_human: i("stageWaiting"),
        completed: i("stageCompleted"),
        failed: i("stageFailed")
      }[l];
    }
    function ct(l) {
      return {
        document_analysis: i("stageIngest"),
        field_review: i("stageFieldReview"),
        compliance_analysis: i("stageCompliance"),
        commercial_review: i("stageCommercial"),
        decision_card: i("stageDecision"),
        final_approval: i("stageApproval"),
        document_output: i("stageOutput")
      }[l.nodeId] || l.name;
    }
    function Ae(l) {
      return {
        new: i("statusNew"),
        under_review: i("statusUnderReview"),
        clarification_required: i("statusClarification"),
        pricing: i("statusPricing"),
        pending_approval: i("statusPendingApproval"),
        approved: i("statusApproved"),
        submitted: i("statusSubmitted"),
        closed: i("statusClosed")
      }[l];
    }
    function dt(l) {
      return {
        draft: i("decisionDraft"),
        approved: i("decisionApproved"),
        rejected: i("decisionRejected"),
        returned: i("decisionReturned"),
        more_information: i("moreInformation")
      }[l];
    }
    function Be(l) {
      const o = {
        "workflow.completed": n.t("真实工作流已完成"),
        "workflow.started": n.t("真实工作流已启动"),
        "workflow.queued": n.t("已提交工作流"),
        "workflow.saved": n.t("已关联工作流"),
        "workflow.failed": n.t("真实工作流失败"),
        "artifacts.prepared": n.t("业务文件已生成"),
        "decision.approved": n.t("管理层已批准"),
        "decision.rejected": n.t("管理层已拒绝"),
        "decision.returned": n.t("已退回复核"),
        "decision-card.prepared": n.t("管理决策卡已生成"),
        "compliance.deviation-approved": n.t("偏离项已批准"),
        "compliance.completed": n.t("符合性分析已完成"),
        "compliance.decided": n.t("符合性结论已更新"),
        "documents.added": n.t("招标文件已接收"),
        "documents.provisioned": n.t("中文招标源文件已创建"),
        "document.added": n.t("来源文件已添加"),
        "document.extracted": n.t("招标文件已解析"),
        "document.vlm-extracted": n.t("文件识别已完成"),
        "document.analysis-failed": n.t("文件识别失败"),
        "fields.reviewed": n.t("关键字段已复核"),
        "field.reviewed": n.t("关键字段已复核"),
        "line-item.reviewed": n.t("品项匹配已复核"),
        "case.created": n.t("投标项目已创建"),
        "case.metadata-updated": n.t("项目信息已更新"),
        "pricing.input-updated": n.t("报价参数已更新"),
        "pricing.scenario-created": n.t("报价场景已生成"),
        "pricing.scenarios-created": n.t("报价场景已生成"),
        "artifacts.exported": n.t("正式文件已导出"),
        "decision.more_information": n.t("已要求补充资料"),
        "document.purpose-updated": n.t("文件用途已调整"),
        "line-item.pricing-updated": n.t("品项成本与售价已更新"),
        "line-item.pricing-allocated": n.t("BOQ 单价已分摊"),
        "workflow.document-analysis-backfilled": n.t("解析结果已回写"),
        "workflow.compliance-backfilled": n.t("符合性结果已回写"),
        "workflow.cancelled": n.t("工作流已停止")
      };
      return n.t(o[l] || l);
    }
    function N(l) {
      return {
        compliant: { "zh-CN": n.t("符合"), "en-US": "Compliant", ar: "مطابق" },
        conditional: { "zh-CN": n.t("条件符合"), "en-US": "Conditional", ar: "مطابق بشروط" },
        missing: { "zh-CN": n.t("缺失"), "en-US": "Missing", ar: "مفقود" },
        deviation: { "zh-CN": n.t("偏离"), "en-US": "Deviation", ar: "انحراف" },
        major_deviation: { "zh-CN": n.t("重大偏离"), "en-US": "Major deviation", ar: "انحراف جوهري" },
        pending: { "zh-CN": n.t("待确认"), "en-US": "Pending", ar: "قيد المراجعة" }
      }[l][y.value];
    }
    return (l, o) => (e.openBlock(), e.createElementBlock("div", {
      class: "bid-desk",
      dir: e.unref(Le) ? "rtl" : "ltr"
    }, [
      e.createElementVNode("header", gt, [
        e.createElementVNode("div", kt, [
          e.createVNode(mt),
          o[21] || (o[21] = e.createElementVNode(
            "span",
            { class: "bid-logo" },
            [
              e.createElementVNode("i", { class: "ri-file-list-3-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(e.unref(i)("title")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(e.unref(i)("subtitle")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Et, [
          e.createElementVNode("button", {
            class: "btn ghost",
            onClick: it
          }, [
            o[22] || (o[22] = e.createElementVNode(
              "i",
              { class: "ri-restart-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(i)("resetDemo")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            class: "btn primary",
            disabled: F.value,
            onClick: nt
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(F.value ? "ri-loader-4-line spin" : "ri-add-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(e.unref(i)("newCase")),
              1
              /* TEXT */
            )
          ], 8, wt)
        ])
      ]),
      e.unref(a) ? (e.openBlock(), e.createElementBlock("div", Nt, [
        e.createElementVNode("section", Vt, [
          e.createElementVNode("div", yt, [
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": o[0] || (o[0] = (t) => e.isRef(b) ? b.value = t : null),
                class: "case-selector"
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(S), (t) => (e.openBlock(), e.createElementBlock("option", {
                    key: t.id,
                    value: t.id
                  }, e.toDisplayString(t.id) + " · " + e.toDisplayString(d(t.customer)), 9, _t))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, e.unref(b)]
            ]),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["status-pill", `status-${e.unref(a).status}`])
              },
              e.toDisplayString(Ae(e.unref(a).status)),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "span",
              St,
              e.toDisplayString(e.unref(i)("version")) + " " + e.toDisplayString(e.unref(a).version),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Dt, [
            e.createElementVNode(
              "h2",
              null,
              e.toDisplayString(d(e.unref(a).project)),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(d(e.unref(a).customer)) + " · " + e.toDisplayString(e.unref(a).rfqNumber || "RFQ —"),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", bt, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(i)("deadline")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(e.unref(a).deadline || "—"),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(i)("owner")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(e.unref(a).owner ? d(e.unref(a).owner) : "—"),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(i)("currentLanguage")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(e.unref(y)),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        e.createElementVNode("section", ht, [
          e.createElementVNode("article", Ct, [
            o[23] || (o[23] = e.createElementVNode(
              "span",
              { class: "metric-icon blue" },
              [
                e.createElementVNode("i", { class: "ri-file-copy-2-line" })
              ],
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(e.unref(a).documents.length),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(i)("files")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("article", At, [
            o[24] || (o[24] = e.createElementVNode(
              "span",
              { class: "metric-icon amber" },
              [
                e.createElementVNode("i", { class: "ri-user-follow-line" })
              ],
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(fe.value),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(i)("pendingReviews")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("article", Bt, [
            o[25] || (o[25] = e.createElementVNode(
              "span",
              { class: "metric-icon red" },
              [
                e.createElementVNode("i", { class: "ri-alarm-warning-line" })
              ],
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(ee.value),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(i)("criticalRisks")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("article", Tt, [
            o[26] || (o[26] = e.createElementVNode(
              "span",
              { class: "metric-icon green" },
              [
                e.createElementVNode("i", { class: "ri-money-dollar-circle-line" })
              ],
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(D.value ? W(D.value.offeredPriceSar) : "—"),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(i)("currentOffer")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("article", Rt, [
            o[27] || (o[27] = e.createElementVNode(
              "span",
              { class: "metric-icon violet" },
              [
                e.createElementVNode("i", { class: "ri-links-line" })
              ],
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(ve.value) + "%",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(i)("evidenceCoverage")),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        e.createElementVNode("section", Lt, [
          e.createElementVNode("div", xt, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                Wt,
                e.toDisplayString(e.unref(i)("workflow")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(h.value ? e.unref(i)("workflowReady") : K.value ? e.unref(i)("workflowAvailable") : e.unref(i)("workflowUnavailable")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Pt, [
              e.createElementVNode(
                "span",
                Ft,
                e.toDisplayString(e.unref(i)("workflowResultsHint")),
                1
                /* TEXT */
              ),
              h.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                class: "btn secondary compact",
                disabled: C.value,
                onClick: ot
              }, [
                o[28] || (o[28] = e.createElementVNode(
                  "i",
                  { class: "ri-flow-chart" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(i)("viewLinkedWorkflow")),
                  1
                  /* TEXT */
                )
              ], 8, Ot)) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("button", {
                class: "btn primary compact",
                disabled: C.value || !K.value,
                onClick: lt
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(C.value ? "ri-loader-2-line spin" : "ri-route-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(e.unref(i)("openWorkflowRun")),
                  1
                  /* TEXT */
                )
              ], 8, $t)
            ])
          ]),
          e.createElementVNode("div", It, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(a).workflowStages, (t, r) => (e.openBlock(), e.createElementBlock(
                e.Fragment,
                {
                  key: t.id
                },
                [
                  e.createElementVNode(
                    "div",
                    {
                      class: e.normalizeClass(["stage", `stage-${t.status}`])
                    },
                    [
                      e.createElementVNode("span", Ut, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(rt(t.status))
                          },
                          null,
                          2
                          /* CLASS */
                        )
                      ]),
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(ct(t)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(st(t.status)),
                          1
                          /* TEXT */
                        )
                      ])
                    ],
                    2
                    /* CLASS */
                  ),
                  r < e.unref(a).workflowStages.length - 1 ? (e.openBlock(), e.createElementBlock("i", Mt)) : e.createCommentVNode("v-if", !0)
                ],
                64
                /* STABLE_FRAGMENT */
              ))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        e.createElementVNode("nav", jt, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(Fe.value, (t) => (e.openBlock(), e.createElementBlock("button", {
              key: t.id,
              class: e.normalizeClass({ active: E.value === t.id }),
              onClick: (r) => E.value = t.id
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(t.icon)
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(l.$t(t.label)) + " ",
                1
                /* TEXT */
              ),
              t.badge ? (e.openBlock(), e.createElementBlock(
                "span",
                Kt,
                e.toDisplayString(t.badge),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ], 10, zt))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("main", Qt, [
          E.value === "overview" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createElementVNode("section", qt, [
                e.createElementVNode("article", Jt, [
                  e.createElementVNode("div", Ht, [
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "span",
                        Gt,
                        e.toDisplayString(e.unref(i)("overview")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "h3",
                        null,
                        e.toDisplayString(e.unref(i)("caseHeading")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("button", {
                      class: "link-btn",
                      onClick: o[1] || (o[1] = (t) => P.value = !P.value)
                    }, [...o[29] || (o[29] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-edit-line" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])])
                  ]),
                  P.value ? (e.openBlock(), e.createElementBlock("div", Xt, [
                    e.createElementVNode("label", null, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(e.unref(i)("customer")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": o[2] || (o[2] = (t) => g.customer = t)
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, g.customer]
                      ])
                    ]),
                    e.createElementVNode("label", null, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(e.unref(i)("project")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": o[3] || (o[3] = (t) => g.project = t)
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, g.project]
                      ])
                    ]),
                    e.createElementVNode("label", null, [
                      o[30] || (o[30] = e.createElementVNode(
                        "span",
                        null,
                        "RFQ",
                        -1
                        /* CACHED */
                      )),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": o[4] || (o[4] = (t) => g.rfqNumber = t)
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, g.rfqNumber]
                      ])
                    ]),
                    e.createElementVNode("label", null, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(e.unref(i)("deadline")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": o[5] || (o[5] = (t) => g.deadline = t),
                          type: "date"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, g.deadline]
                      ])
                    ]),
                    e.createElementVNode("label", null, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(e.unref(i)("owner")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": o[6] || (o[6] = (t) => g.owner = t)
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, g.owner]
                      ])
                    ]),
                    e.createElementVNode("div", Yt, [
                      e.createElementVNode(
                        "button",
                        {
                          class: "btn primary compact",
                          onClick: Ie
                        },
                        e.toDisplayString(e.unref(i)("accept")),
                        1
                        /* TEXT */
                      )
                    ])
                  ])) : (e.openBlock(), e.createElementBlock("dl", Zt, [
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "dt",
                        null,
                        e.toDisplayString(e.unref(i)("customer")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "dd",
                        null,
                        e.toDisplayString(d(e.unref(a).customer)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "dt",
                        null,
                        e.toDisplayString(e.unref(i)("project")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "dd",
                        null,
                        e.toDisplayString(d(e.unref(a).project)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", null, [
                      o[31] || (o[31] = e.createElementVNode(
                        "dt",
                        null,
                        "RFQ",
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode(
                        "dd",
                        null,
                        e.toDisplayString(e.unref(a).rfqNumber || "—"),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "dt",
                        null,
                        e.toDisplayString(e.unref(i)("deadline")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "dd",
                        null,
                        e.toDisplayString(e.unref(a).deadline || "—"),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "dt",
                        null,
                        e.toDisplayString(e.unref(i)("status")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "dd",
                        null,
                        e.toDisplayString(Ae(e.unref(a).status)),
                        1
                        /* TEXT */
                      )
                    ])
                  ]))
                ]),
                e.createElementVNode("article", en, [
                  e.createElementVNode("div", tn, [
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "span",
                        nn,
                        e.toDisplayString(e.unref(i)("actualCapability")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "h3",
                        null,
                        e.toDisplayString(e.unref(re.brandName)()) + " Core",
                        1
                        /* TEXT */
                      )
                    ]),
                    o[32] || (o[32] = e.createElementVNode(
                      "i",
                      { class: "ri-shield-check-line capability-icon" },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ]),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(e.unref(i)("actualCapabilityText")),
                    1
                    /* TEXT */
                  ),
                  o[33] || (o[33] = e.createElementVNode(
                    "div",
                    { class: "capability-chips" },
                    [
                      e.createElementVNode("span", null, "WorkflowEngine"),
                      e.createElementVNode("span", null, "AgentEngine"),
                      e.createElementVNode("span", null, "VLM"),
                      e.createElementVNode("span", null, "Embedding/RAG"),
                      e.createElementVNode("span", null, "Document Output"),
                      e.createElementVNode("span", null, "i18n/RTL")
                    ],
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              e.createElementVNode("section", on, [
                e.createElementVNode("article", ln, [
                  e.createElementVNode("div", an, [
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "span",
                        rn,
                        e.toDisplayString(e.unref(i)("documents")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "h3",
                        null,
                        e.toDisplayString(e.unref(a).documents.length) + " " + e.toDisplayString(e.unref(i)("files")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "button",
                      {
                        class: "link-btn",
                        onClick: o[7] || (o[7] = (t) => E.value = "documents")
                      },
                      e.toDisplayString(e.unref(i)("viewEvidence")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", sn, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).documents.slice(0, 4), (t) => (e.openBlock(), e.createElementBlock("div", {
                        key: t.id,
                        class: "doc-row"
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(he(t.kind))
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(d(t.name)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(be(t.size)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(`parse-${t.parseStatus}`)
                          },
                          e.toDisplayString(Ce(t.parseStatus)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.unref(a).documents.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "p",
                      cn,
                      e.toDisplayString(e.unref(i)("noDocuments")),
                      1
                      /* TEXT */
                    ))
                  ])
                ]),
                e.createElementVNode("article", dn, [
                  e.createElementVNode("div", un, [
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "span",
                        pn,
                        e.toDisplayString(e.unref(i)("timeline")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "h3",
                        null,
                        e.toDisplayString(e.unref(a).audit.length),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "button",
                      {
                        class: "link-btn",
                        onClick: o[8] || (o[8] = (t) => E.value = "timeline")
                      },
                      e.toDisplayString(e.unref(i)("viewAll")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", mn, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).audit.slice(0, 5), (t) => (e.openBlock(), e.createElementBlock("div", {
                        key: t.id,
                        class: "audit-row"
                      }, [
                        o[34] || (o[34] = e.createElementVNode(
                          "span",
                          { class: "audit-dot" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(Be(t.action)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            null,
                            e.toDisplayString(d(t.detail)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(le(t.at)),
                            1
                            /* TEXT */
                          )
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : E.value === "documents" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 1 },
            [
              e.createElementVNode("section", fn, [
                e.createElementVNode("div", vn, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "span",
                      gn,
                      e.toDisplayString(e.unref(i)("documents")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "h3",
                      null,
                      e.toDisplayString(e.unref(i)("upload")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("label", kn, [
                    o[35] || (o[35] = e.createElementVNode(
                      "i",
                      { class: "ri-upload-cloud-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(e.unref(i)("upload")) + " ",
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "input",
                      {
                        type: "file",
                        multiple: "",
                        accept: ".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.tiff",
                        onChange: Xe
                      },
                      null,
                      32
                      /* NEED_HYDRATION */
                    )
                  ])
                ]),
                e.createElementVNode("div", En, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(a).documents, (t) => (e.openBlock(), e.createElementBlock("article", {
                      key: t.id,
                      class: "doc-card"
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(he(t.kind))
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(d(t.name)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "p",
                          null,
                          e.toDisplayString(t.kind.toUpperCase()) + " · " + e.toDisplayString(be(t.size)) + " · " + e.toDisplayString(d(t.uploadedBy)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("select", {
                          class: "purpose-select",
                          value: t.purpose,
                          onChange: (r) => Me(t.id, r)
                        }, [
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(xe, (r) => e.createElementVNode("option", {
                              key: r.value,
                              value: r.value
                            }, e.toDisplayString(l.$t(r.label)), 9, Nn)),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ], 40, wn),
                        t.warnings?.length ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Vn,
                          e.toDisplayString(t.warnings.join(l.$t("；"))),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(`parse-${t.parseStatus}`)
                        },
                        e.toDisplayString(Ce(t.parseStatus)),
                        3
                        /* TEXT, CLASS */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              e.createElementVNode("section", yn, [
                e.createElementVNode("div", _n, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "span",
                      Sn,
                      e.toDisplayString(e.unref(i)("fieldsReview")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "h3",
                      null,
                      e.toDisplayString(e.unref(i)("evidenceExtraction")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", Dn, [
                  e.createElementVNode("div", bn, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("field")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("value")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("confidence")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("sourceEvidence")),
                      1
                      /* TEXT */
                    ),
                    o[36] || (o[36] = e.createElementVNode(
                      "span",
                      null,
                      null,
                      -1
                      /* CACHED */
                    ))
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(a).fields, (t) => (e.openBlock(), e.createElementBlock("div", {
                      key: t.id,
                      class: "table-row fields"
                    }, [
                      e.createElementVNode(
                        "span",
                        hn,
                        e.toDisplayString(t.key),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (r) => q[t.id] = r
                      }, null, 8, Cn), [
                        [e.vModelText, q[t.id]]
                      ]),
                      e.createElementVNode("span", An, [
                        e.createElementVNode(
                          "i",
                          {
                            style: e.normalizeStyle({ width: `${t.confidence * 100}%` })
                          },
                          null,
                          4
                          /* STYLE */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(Math.round(t.confidence * 100)) + "%",
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("button", {
                        class: "evidence-link",
                        onClick: (r) => A.value = t.evidence
                      }, e.toDisplayString(Y(t.evidence[0])), 9, Bn),
                      e.createElementVNode("div", Tn, [
                        e.createElementVNode("button", {
                          class: "icon-action success",
                          title: e.unref(i)("accept"),
                          onClick: (r) => ge(t.id, "accepted")
                        }, [...o[37] || (o[37] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-check-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, Rn),
                        e.createElementVNode("button", {
                          class: "icon-action danger",
                          title: e.unref(i)("reject"),
                          onClick: (r) => ge(t.id, "rejected")
                        }, [...o[38] || (o[38] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-close-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, Ln)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              e.createElementVNode("section", xn, [
                e.createElementVNode("div", Wn, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "span",
                      Pn,
                      e.toDisplayString(e.unref(i)("lineItems")),
                      1
                      /* TEXT */
                    ),
                    o[39] || (o[39] = e.createElementVNode(
                      "h3",
                      null,
                      "BOQ",
                      -1
                      /* CACHED */
                    ))
                  ])
                ]),
                e.createElementVNode("div", Fn, [
                  e.createElementVNode("div", On, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("description")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("quantity")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("matchedProduct")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("unitCost")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("customerUnitPrice")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(e.unref(i)("sourceEvidence")),
                      1
                      /* TEXT */
                    ),
                    o[40] || (o[40] = e.createElementVNode(
                      "span",
                      null,
                      null,
                      -1
                      /* CACHED */
                    ))
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(a).lineItems, (t) => (e.openBlock(), e.createElementBlock("div", {
                      key: t.id,
                      class: "table-row items"
                    }, [
                      e.createElementVNode("span", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(d(t.description)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(d(t.model)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.quantity) + " " + e.toDisplayString(t.unit),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (r) => J[t.id] = r
                      }, null, 8, $n), [
                        [e.vModelText, J[t.id]]
                      ]),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (r) => B[t.id].unitCostSar = r,
                        type: "number",
                        min: "0",
                        step: "100"
                      }, null, 8, In), [
                        [
                          e.vModelText,
                          B[t.id].unitCostSar,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (r) => B[t.id].unitPriceSar = r,
                        type: "number",
                        min: "0",
                        step: "100"
                      }, null, 8, Un), [
                        [
                          e.vModelText,
                          B[t.id].unitPriceSar,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      e.createElementVNode("button", {
                        class: "evidence-link",
                        onClick: (r) => A.value = t.evidence
                      }, e.toDisplayString(Y(t.evidence[0])), 9, Mn),
                      e.createElementVNode("button", {
                        class: "icon-action success",
                        onClick: (r) => Ue(t.id)
                      }, [...o[41] || (o[41] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-check-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, jn)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : E.value === "compliance" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            [
              e.createElementVNode("section", zn, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList($e.value, (t) => (e.openBlock(), e.createElementBlock(
                    "div",
                    {
                      key: t.key,
                      class: e.normalizeClass(`risk-count risk-${t.key}`)
                    },
                    [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.count),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.$t(t.label)),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              e.createElementVNode("section", Kn, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(a).findings, (t) => (e.openBlock(), e.createElementBlock(
                    "article",
                    {
                      key: t.id,
                      class: e.normalizeClass(["finding-card", [
                        `severity-${t.severity}`,
                        {
                          "conclusion-saved": !ke(t),
                          "just-saved": U.value === t.id
                        }
                      ]])
                    },
                    [
                      e.createElementVNode("div", Qn, [
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "span",
                            qn,
                            e.toDisplayString(t.severity),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(d(t.requirement)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "span",
                          Jn,
                          e.toDisplayString(N(t.humanDecision || t.status)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", Hn, [
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(e.unref(i)("response")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            null,
                            e.toDisplayString(d(t.response)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(e.unref(i)("sourceEvidence")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("button", {
                            class: "evidence-link",
                            onClick: (r) => A.value = t.evidence
                          }, e.toDisplayString(Y(t.evidence[0])), 9, Gn)
                        ])
                      ]),
                      ke(t) ? (e.openBlock(), e.createElementBlock("div", Xn, [
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (r) => T[t.id].decision = r
                        }, [
                          e.createElementVNode(
                            "option",
                            Zn,
                            e.toDisplayString(N("compliant")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            eo,
                            e.toDisplayString(N("conditional")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            to,
                            e.toDisplayString(N("missing")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            no,
                            e.toDisplayString(N("deviation")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            oo,
                            e.toDisplayString(N("major_deviation")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            lo,
                            e.toDisplayString(N("pending")),
                            1
                            /* TEXT */
                          )
                        ], 8, Yn), [
                          [e.vModelSelect, T[t.id].decision]
                        ]),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (r) => T[t.id].clarification = r,
                          placeholder: e.unref(i)("clarification")
                        }, null, 8, io), [
                          [e.vModelText, T[t.id].clarification]
                        ]),
                        e.createElementVNode("button", {
                          class: "btn primary compact finding-save-btn",
                          disabled: L.value === t.id,
                          onClick: (r) => ze(t.id)
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(L.value === t.id ? "ri-loader-4-line spin" : "ri-save-3-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createTextVNode(
                            " " + e.toDisplayString(e.unref(i)("saveDecision")),
                            1
                            /* TEXT */
                          )
                        ], 8, ao)
                      ])) : (e.openBlock(), e.createElementBlock("div", ro, [
                        o[43] || (o[43] = e.createElementVNode(
                          "span",
                          { class: "finding-conclusion-icon" },
                          [
                            e.createElementVNode("i", { class: "ri-checkbox-circle-fill" })
                          ],
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("div", so, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(e.unref(i)("decisionSaved")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(N(t.humanDecision || t.status)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            null,
                            e.toDisplayString(t.clarification ? d(t.clarification) : e.unref(i)("noClarification")),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("button", {
                          class: "btn secondary compact",
                          onClick: (r) => je(t.id)
                        }, [
                          o[42] || (o[42] = e.createElementVNode(
                            "i",
                            { class: "ri-edit-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(e.unref(i)("editDecision")),
                            1
                            /* TEXT */
                          )
                        ], 8, co)
                      ]))
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : E.value === "pricing" ? (e.openBlock(), e.createElementBlock("section", uo, [
            e.createElementVNode("article", po, [
              e.createElementVNode("div", mo, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    fo,
                    e.toDisplayString(e.unref(i)("pricingInputs")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(e.unref(i)("pricingEngine")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", vo, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(Oe.value, (t) => (e.openBlock(), e.createElementBlock("label", {
                    key: t.key
                  }, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(l.$t(t.label)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", go, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (r) => I[t.key] = r,
                        type: "number",
                        step: t.rate ? "0.01" : "100"
                      }, null, 8, ko), [
                        [
                          e.vModelText,
                          I[t.key],
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      t.rate ? (e.openBlock(), e.createElementBlock("small", Eo, "× 100%")) : e.createCommentVNode("v-if", !0)
                    ])
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              e.createElementVNode("div", wo, [
                e.createElementVNode(
                  "button",
                  {
                    class: "btn ghost",
                    onClick: Ke
                  },
                  e.toDisplayString(e.unref(i)("savePricing")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": o[9] || (o[9] = (t) => Z.value = t),
                  class: "scenario-name",
                  placeholder: e.unref(i)("scenarioName")
                }, null, 8, No), [
                  [e.vModelText, Z.value]
                ]),
                e.createElementVNode("button", {
                  class: "btn primary",
                  onClick: Qe
                }, [
                  o[44] || (o[44] = e.createElementVNode(
                    "i",
                    { class: "ri-calculator-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(e.unref(i)("createScenario")),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            e.createElementVNode("article", Vo, [
              e.createElementVNode("div", yo, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    _o,
                    e.toDisplayString(e.unref(i)("scenarios")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(e.unref(a).scenarios.length),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.unref(a).scenarios.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "p",
                So,
                e.toDisplayString(e.unref(i)("noScenario")),
                1
                /* TEXT */
              )),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(a).scenarios, (t) => (e.openBlock(), e.createElementBlock(
                  "article",
                  {
                    key: t.id,
                    class: e.normalizeClass(["scenario-card", { warning: t.belowMinimumMargin }])
                  },
                  [
                    e.createElementVNode("div", Do, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(d(t.name)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(le(t.createdAt)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", bo, [
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(e.unref(i)("landedCost")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(W(t.landedCostSar)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(e.unref(i)("offeredPrice")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(W(t.offeredPriceSar)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(e.unref(i)("margin")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(oe(t.marginRate)),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    t.belowMinimumMargin ? (e.openBlock(), e.createElementBlock("p", ho, [
                      o[45] || (o[45] = e.createElementVNode(
                        "i",
                        { class: "ri-alarm-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(e.unref(i)("ruleAlert")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : E.value === "approval" ? (e.openBlock(), e.createElementBlock("section", Co, [
            e.createElementVNode("article", Ao, [
              e.createElementVNode("div", Bo, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    To,
                    e.toDisplayString(e.unref(i)("decisionCard")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(d(e.unref(a).customer)) + " · " + e.toDisplayString(d(e.unref(a).project)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(e.unref(a).id) + " · " + e.toDisplayString(e.unref(a).rfqNumber),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["decision-state", `decision-${e.unref(a).decision.decision}`])
                  },
                  e.toDisplayString(dt(e.unref(a).decision.decision)),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              e.createElementVNode("div", Ro, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(i)("offeredPrice")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(D.value ? W(D.value.offeredPriceSar) : "—"),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(i)("margin")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(D.value ? `${W(D.value.marginSar)} · ${oe(D.value.marginRate)}` : "—"),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(i)("criticalRisks")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(ee.value),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(i)("deviations")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(We.value),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", Lo, [
                e.createElementVNode("p", null, [
                  o[46] || (o[46] = e.createElementVNode(
                    "i",
                    { class: "ri-shield-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(ve.value) + "% " + e.toDisplayString(e.unref(i)("evidenceCoverage")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("p", null, [
                  o[47] || (o[47] = e.createElementVNode(
                    "i",
                    { class: "ri-flow-chart" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(Pe.value) + "/" + e.toDisplayString(e.unref(a).workflowStages.length) + " " + e.toDisplayString(e.unref(i)("workflow")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("section", xo, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(e.unref(i)("aiRecommendation")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "p",
                  null,
                  e.toDisplayString(d(e.unref(a).decisionSummary.aiRecommendation || e.unref(n.t)("等待工作流生成建议。"))),
                  1
                  /* TEXT */
                ),
                e.unref(a).decisionSummary.risks.length ? (e.openBlock(), e.createElementBlock("div", Wo, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(a).decisionSummary.risks, (t) => (e.openBlock(), e.createElementBlock("span", { key: t }, [
                      o[48] || (o[48] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(d(t)),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("label", Po, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(e.unref(i)("frozenScenario")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": o[10] || (o[10] = (t) => _.value = t)
                  },
                  [
                    o[49] || (o[49] = e.createElementVNode(
                      "option",
                      { value: "" },
                      "—",
                      -1
                      /* CACHED */
                    )),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).scenarios, (t) => (e.openBlock(), e.createElementBlock("option", {
                        key: t.id,
                        value: t.id
                      }, e.toDisplayString(d(t.name)) + " · " + e.toDisplayString(W(t.offeredPriceSar)) + " · " + e.toDisplayString(oe(t.marginRate)), 9, Fo))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, _.value]
                ])
              ]),
              e.createElementVNode("label", Oo, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(e.unref(i)("comment")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": o[11] || (o[11] = (t) => $.value = t),
                    rows: "3"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, $.value]
                ])
              ]),
              H.value.length ? (e.openBlock(), e.createElementBlock("div", $o, [
                e.createElementVNode("strong", null, [
                  o[50] || (o[50] = e.createElementVNode(
                    "i",
                    { class: "ri-lock-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    " " + e.toDisplayString(e.unref(i)("approvalBlocked")),
                    1
                    /* TEXT */
                  )
                ]),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(H.value, (t) => (e.openBlock(), e.createElementBlock(
                    "span",
                    { key: t },
                    e.toDisplayString(d(t)),
                    1
                    /* TEXT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                H.value.some((t) => t.includes(l.$t("逐行金额合计"))) ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  class: "btn secondary compact",
                  onClick: Je
                }, [
                  o[51] || (o[51] = e.createElementVNode(
                    "i",
                    { class: "ri-scales-3-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(e.unref(i)("allocateBoq")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", Io, [
                e.createElementVNode("button", {
                  class: "btn danger",
                  onClick: o[12] || (o[12] = (t) => G("rejected"))
                }, [
                  o[52] || (o[52] = e.createElementVNode(
                    "i",
                    { class: "ri-close-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(e.unref(i)("rejectCase")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  class: "btn ghost",
                  onClick: o[13] || (o[13] = (t) => G("returned"))
                }, [
                  o[53] || (o[53] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-go-back-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(e.unref(i)("returnReview")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  class: "btn ghost",
                  onClick: o[14] || (o[14] = (t) => G("more_information"))
                }, [
                  o[54] || (o[54] = e.createElementVNode(
                    "i",
                    { class: "ri-question-answer-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(e.unref(i)("moreInformation")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  class: "btn secondary",
                  onClick: qe
                }, [
                  o[55] || (o[55] = e.createElementVNode(
                    "i",
                    { class: "ri-edit-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(e.unref(i)("modifyBeforeApproval")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  class: "btn primary",
                  disabled: H.value.length > 0,
                  onClick: o[15] || (o[15] = (t) => G("approved"))
                }, [
                  o[56] || (o[56] = e.createElementVNode(
                    "i",
                    { class: "ri-checkbox-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(e.unref(i)("approve")),
                    1
                    /* TEXT */
                  )
                ], 8, Uo)
              ])
            ]),
            e.createElementVNode("article", Mo, [
              e.createElementVNode("div", jo, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    zo,
                    e.toDisplayString(e.unref(i)("outputManifest")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(e.unref(a).decision.decision === "approved" ? `${e.unref(i)("frozenVersion")} ${e.unref(a).decision.version}` : e.unref(i)("draft")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  class: "btn primary compact",
                  disabled: e.unref(a).decision.decision !== "approved" || O.value,
                  onClick: Ge
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(O.value ? "ri-loader-2-line spin" : "ri-folder-download-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(e.unref(i)("exportAll")),
                    1
                    /* TEXT */
                  )
                ], 8, Ko)
              ]),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(te.value.length) + " " + e.toDisplayString(e.unref(i)("artifactCount")) + " · " + e.toDisplayString(e.unref(i)("outputs")),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", Qo, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(te.value, (t) => (e.openBlock(), e.createElementBlock("li", {
                    key: t.id
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(at(t.kind))
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.filename),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("button", {
                      class: "link-btn",
                      onClick: (r) => w.value = t
                    }, [
                      o[57] || (o[57] = e.createElementVNode(
                        "i",
                        { class: "ri-eye-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(e.unref(i)("preview")),
                        1
                        /* TEXT */
                      )
                    ], 8, qo),
                    e.createElementVNode("button", {
                      class: "link-btn",
                      disabled: O.value || e.unref(a).decision.decision !== "approved",
                      onClick: (r) => we(t)
                    }, [
                      o[58] || (o[58] = e.createElementVNode(
                        "i",
                        { class: "ri-download-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(e.unref(i)("exportFile")),
                        1
                        /* TEXT */
                      )
                    ], 8, Jo)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              e.createElementVNode("div", Ho, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(e.unref(a).decision.decision === "approved" ? "ri-lock-unlock-line" : "ri-lock-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  " " + e.toDisplayString(e.unref(a).decision.decision === "approved" ? e.unref(i)("outputReady") : e.unref(i)("outputLocked")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])) : (e.openBlock(), e.createElementBlock("section", Go, [
            e.createElementVNode("div", Xo, [
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  Yo,
                  e.toDisplayString(e.unref(i)("timeline")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(e.unref(a).audit.length),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.unref(a).audit.length ? (e.openBlock(), e.createElementBlock("div", Zo, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(a).audit, (t) => (e.openBlock(), e.createElementBlock("div", {
                  key: t.id,
                  class: "audit-row"
                }, [
                  o[59] || (o[59] = e.createElementVNode(
                    "span",
                    { class: "audit-dot" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("div", null, [
                    e.createElementVNode("div", el, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(Be(t.action)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(d(t.actor)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "p",
                      null,
                      e.toDisplayString(d(t.detail)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(le(t.at)),
                      1
                      /* TEXT */
                    ),
                    t.before !== void 0 || t.after !== void 0 ? (e.openBlock(), e.createElementBlock("details", tl, [
                      e.createElementVNode(
                        "summary",
                        null,
                        e.toDisplayString(e.unref(i)("beforeAfter")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "pre",
                        null,
                        e.toDisplayString(JSON.stringify({ before: t.before, after: t.after }, null, 2)),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              nl,
              e.toDisplayString(e.unref(i)("auditEmpty")),
              1
              /* TEXT */
            ))
          ]))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      A.value ? (e.openBlock(), e.createElementBlock("div", {
        key: 1,
        class: "modal-backdrop",
        onClick: o[17] || (o[17] = e.withModifiers((t) => A.value = null, ["self"]))
      }, [
        e.createElementVNode("section", ol, [
          e.createElementVNode("div", ll, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(e.unref(i)("sourceEvidence")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              class: "link-btn",
              onClick: o[16] || (o[16] = (t) => A.value = null)
            }, [...o[60] || (o[60] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])])
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(A.value, (t, r) => (e.openBlock(), e.createElementBlock("article", { key: r }, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(ie(t.fileId)),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(Y(t)),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "blockquote",
                null,
                e.toDisplayString(d(t.excerpt)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      w.value ? (e.openBlock(), e.createElementBlock("div", {
        key: 2,
        class: "modal-backdrop artifact-backdrop",
        onClick: o[20] || (o[20] = e.withModifiers((t) => w.value = null, ["self"]))
      }, [
        e.createElementVNode("section", il, [
          e.createElementVNode("div", al, [
            e.createElementVNode("div", rl, [
              e.createElementVNode(
                "span",
                sl,
                e.toDisplayString(e.unref(i)("preview")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(w.value.title),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", cl, [
              e.createElementVNode("button", {
                class: "btn primary compact",
                disabled: e.unref(a)?.decision.decision !== "approved",
                onClick: o[18] || (o[18] = (t) => we(w.value))
              }, [
                o[61] || (o[61] = e.createElementVNode(
                  "i",
                  { class: "ri-download-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(i)("exportFile")),
                  1
                  /* TEXT */
                )
              ], 8, dl),
              e.createElementVNode("button", {
                class: "artifact-close",
                "aria-label": e.unref(n.t)("关闭预览"),
                title: e.unref(n.t)("关闭预览"),
                onClick: o[19] || (o[19] = (t) => w.value = null)
              }, [...o[62] || (o[62] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-close-line" },
                  null,
                  -1
                  /* CACHED */
                )
              ])], 8, ul)
            ])
          ]),
          e.createCommentVNode(` 报价/方案是纯静态模板，不需要脚本。不加 sandbox 时 srcdoc 继承主窗口源，
             一旦模板里混进未转义文本就能直接摸到 window.parent.electronAPI。 `),
          w.value.kind === "html" ? (e.openBlock(), e.createElementBlock("iframe", {
            key: 0,
            class: "artifact-frame",
            title: w.value.title,
            srcdoc: w.value.content,
            sandbox: "",
            referrerpolicy: "no-referrer"
          }, null, 8, pl)) : (e.openBlock(), e.createElementBlock(
            "pre",
            ml,
            e.toDisplayString(w.value.content),
            1
            /* TEXT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ], 8, vt));
  }
}), vl = (v, s) => {
  const c = v.__vccOpts || v;
  for (const [f, S] of s)
    c[f] = S;
  return c;
}, gl = /* @__PURE__ */ vl(fl, [["__scopeId", "data-v-4ba4862b"]]);
export {
  gl as default
};
