import { t as i18nT } from '@totalclaw/i18n';
const DEFAULT_WORKFLOW_ID = 'bid_desk_default_v1';
const BID_WORKFLOW_DEFINITION_VERSION = 3;

export function bidDeskWorkflowId(caseId?: string): string {
  const normalized = String(caseId || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized ? `bid_desk_${normalized}_v1` : DEFAULT_WORKFLOW_ID;
}

export function bidDeskWorkflowDefinition(
  now = Date.now(),
  bidCase?: { id: string; customer: string; project: string; rfqNumber: string },
) {
  const caseId = bidCase?.id?.trim();
  const workflowId = bidDeskWorkflowId(caseId);
  const projectLabel = bidCase?.project?.trim() || i18nT('受控投标准备流程');
  const customerLabel = bidCase?.customer?.trim();
  return {
    id: workflowId,
    name: caseId
      ? i18nT('投标 · {caseId} · {projectLabel}', { caseId, projectLabel })
      : i18nT('AI 询价与投标 · 受控投标准备流程'),
    description: caseId
      ? i18nT('{p0}{p1}。从招标文件解析、人工复核、符合性分析、商业报价到管理审批和文件输出。', { p0: customerLabel ? `${customerLabel} · ` : '', p1: bidCase?.rfqNumber || i18nT('RFQ 待补充') })
      : i18nT('从招标文件解析、人工复核、符合性分析、商业报价到管理审批和文件输出的真实动态工作流'),
    version: 1,
    createdAt: now,
    updatedAt: now,
    origin: {
      kind: 'bid-desk',
      caseId: caseId || '',
      label: i18nT('项目工作台'),
      definitionVersion: BID_WORKFLOW_DEFINITION_VERSION,
    },
    inputs: [
      { key: 'caseId', label: i18nT('投标项目编号') },
      { key: 'customer', label: i18nT('客户名称') },
      { key: 'project', label: i18nT('项目名称') },
      { key: 'documents', label: i18nT('招标文件清单（JSON）') },
      { key: 'pricing', label: i18nT('报价快照（JSON）') },
      { key: 'knowledge', label: i18nT('企业知识检索片段（JSON）') },
      { key: 'clientLocale', label: i18nT('客户输出语言') },
    ],
    nodes: [
      { id: 'start', type: 'start', name: i18nT('投标项目已创建'), config: {}, next: ['document_analysis'] },
      {
        id: 'document_analysis',
        type: 'llm_call',
        name: i18nT('招标文件解析专员'),
        config: {
          prompt:
            i18nT('你是招标文件解析专员。请针对投标项目 ${caseId}，审阅文件清单 ${documents}。')
            + i18nT('文件已由本地解析器提取文本；若提供 path 也可使用文件工具复核，但不得只根据文件名推断。')
            + i18nT('企业知识检索结果为 ${knowledge}，它只能用于产品匹配和历史经验参考，不能覆盖本次招标原文。')
            + i18nT('只返回一个 JSON 对象，不要 Markdown。结构必须为：')
            + '{"fields":[{"key":"customer","value":"","rawValue":"","confidence":0.9,"evidence":[{"fileId":"","page":1,"sheet":"","cell":"","excerpt":""}]}],'
            + '"lineItems":[{"description":"","model":"","quantity":1,"unit":"EA","matchedProduct":"","matchConfidence":0.8,"unitCostSar":0,"unitPriceSar":0,"evidence":[]}],'
            + '"missingItems":[],"knowledgeMatches":[{"documentId":"","excerpt":""}]}。'
            + i18nT('严禁编造字段、页码、金额或承诺；没有证据的内容放入 missingItems。'),
          roleId: '',
        },
        next: ['field_review'],
      },
      {
        id: 'field_review',
        type: 'human_confirm',
        name: i18nT('关键字段人工复核'),
        config: {
          question: i18nT('招标文件的关键字段和出处已经整理完成，是否按当前证据进入技术与商务符合性分析？'),
          detail: i18nT('请重点核对截止时间、资格条件、交付范围、付款条件和保函要求。下面会直接展示文件解析结果与来源证据。'),
          options: [i18nT('字段与证据无误'), i18nT('已补充修正意见')],
          requireComment: true,
          approveLabel: i18nT('确认字段并开始符合性分析'),
          rejectLabel: i18nT('带意见退回文件解析'),
          approveEffect: i18nT('锁定当前字段快照，开始逐条检查招标要求与我方响应的符合程度。'),
          rejectEffect: i18nT('把修改意见交给文件解析专员重新处理，完成后再次回到本确认节点。'),
        },
        next: ['compliance_analysis'],
      },
      {
        id: 'compliance_analysis',
        type: 'llm_call',
        name: i18nT('技术符合性与风险专员'),
        config: {
          prompt:
            i18nT('你是 ${customer} / ${project} 项目的技术符合性分析专员。')
            + i18nT('上一步真实文件解析结果如下：${node_document_analysis_result}。')
            + i18nT('企业产品、供应商与历史项目检索片段：${knowledge}。')
            + i18nT('只返回一个 JSON 对象，不要 Markdown：')
            + '{"findings":[{"requirement":"","response":"","status":"pending","severity":"medium","owner":"",'
            + '"evidence":[{"fileId":"","page":1,"sheet":"","cell":"","excerpt":""}],"clarification":""}]}。'
            + i18nT('status 仅可为 compliant/conditional/missing/deviation/major_deviation/pending；')
            + i18nT('必须明确区分招标原文、人工确认结果和 AI 建议，不得代表公司作最终承诺。'),
          roleId: '',
        },
        next: ['commercial_review'],
      },
      {
        id: 'commercial_review',
        type: 'human_confirm',
        name: i18nT('商业报价人工闸口'),
        config: {
          question: i18nT('成本、汇率、毛利和折扣已经计算完成，是否按当前报价生成管理层决策材料？'),
          detail: i18nT('请核对报价口径、目标毛利、折扣权限和汇率假设。确认后，系统会把报价与符合性风险合并为管理层决策卡。'),
          options: [i18nT('报价口径无误'), i18nT('已说明例外条件')],
          requireComment: true,
          approveLabel: i18nT('确认报价并生成决策卡'),
          rejectLabel: i18nT('带意见退回重新测算'),
          approveEffect: i18nT('冻结当前报价快照，结合技术风险生成管理层决策卡。'),
          rejectEffect: i18nT('把修改意见交给上一步重新分析和测算，完成后再次回到本确认节点。'),
        },
        next: ['decision_card'],
      },
      {
        id: 'decision_card',
        type: 'llm_call',
        name: i18nT('风险与管理决策专员'),
        config: {
          prompt:
            i18nT('请为投标项目 ${caseId} 生成管理层决策卡。报价快照：${pricing}。')
            + i18nT('技术符合性分析结果：${node_compliance_analysis_result}。')
            + i18nT('只返回一个 JSON 对象，不要 Markdown：')
            + '{"aiRecommendation":"","risks":[],"keyDecisions":[],"evidenceSources":[{"fileId":"","page":1,"sheet":"","cell":"","excerpt":""}]}。'
            + i18nT('必须汇总报价金额、毛利金额与毛利率、偏离项、主要风险、证据缺口和待决事项；')
            + i18nT('不得改写任何数值，也不得省略超过审批阈值的风险。'),
          roleId: '',
        },
        next: ['final_approval'],
      },
      {
        id: 'final_approval',
        type: 'human_confirm',
        name: i18nT('管理层人工审批'),
        config: {
          question: i18nT('报价、风险和偏离项已经汇总完成，是否批准当前版本并生成正式投标草稿？'),
          detail: i18nT('这是正式文件生成前的最后一道审批。请核对管理层决策卡、重大偏离、报价有效期和授权范围。'),
          options: [i18nT('批准当前版本'), i18nT('附条件批准')],
          requireComment: true,
          approveLabel: i18nT('批准版本并生成正式草稿'),
          rejectLabel: i18nT('带意见退回决策复核'),
          approveEffect: i18nT('冻结已审批的报价与风险版本，生成正式投标文件草稿和交付清单。'),
          rejectEffect: i18nT('把修改意见交给决策卡负责人重新复核，完成后再次回到本确认节点。'),
        },
        next: ['document_output'],
      },
      {
        id: 'document_output',
        type: 'llm_call',
        name: i18nT('投标文件编制专员'),
        config: {
          prompt:
            i18nT('请仅使用已审批数据，为投标项目 ${caseId} 生成 ${clientLocale} 业务文件清单：')
            + i18nT('文件解析结果：${node_document_analysis_result}；符合性分析：${node_compliance_analysis_result}；')
            + i18nT('管理层决策卡：${node_decision_card_result}；管理审批结果：${node_final_approval_result}。')
            + i18nT('列出正式报价单、英阿双语报价单、结构化BOQ、技术符合性矩阵、澄清问题清单、')
            + i18nT('技术偏离清单、商业方案、内部审批单和审计记录。')
            + i18nT('不得在客户文件中披露内部成本或目标毛利。'),
          roleId: '',
        },
        next: ['end'],
      },
      { id: 'end', type: 'end', name: i18nT('投标成果已生成'), config: {}, next: [] },
    ],
  };
}

