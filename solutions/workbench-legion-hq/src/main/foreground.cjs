/**
 * 「真实运行」时部门步骤在执行机前台展示：挑这一步该打开哪个工作台。
 * 部门清单里可能有好几个工作台（财务部：财务 / 发票 / 审计 / 结算），按事情和这一步的交付物里的关键词挑最贴的，
 * 都不沾边用第一个。只决定打开哪个页面，不影响怎么执行。
 */
const HINTS = {
  'workbench-invoice-agent': /发票|开票|税票|数电/,
  'workbench-finance-audit': /审计|内控|底稿|关账|对账|税务合规/,
  'workbench-service-settlement': /结算|核销|激励|服务商|好评/,
  'workbench-finance-agent': /财务|报表|成本|预算|费用|利润|现金/,
  'workbench-global-ads': /广告|投放|推广|海外|Meta|YouTube|TikTok/i,
  'workbench-flow-sla': /流程|时效|超时|审批/,
  'workbench-parts-alert': /配件|补库|库存预警|缺货|呆滞/,
  'workbench-biz-automation': /门店|收银|上架|下架|短视频|数字人|经营/,
  'workbench-rfq-quote': /报价|询价|RFQ|BOQ/i,
  'workbench-bid-writer': /标书|投标文件|招标/,
  'workbench-bid-decision': /投标决策|要不要投|是否投标/,
  'workbench-foreign-trade': /外贸|出口|海外客户|询盘/,
  'workbench-zcy-agent': /政采云|政府采购/,
  'workbench-legal-agent': /合同|条款|法务|协议|法律/,
  'workbench-hr-agent': /招聘|简历|面试|录用|入职|绩效|员工/,
  'workbench-grounded-qa': /客服|投诉|咨询|答复|售后/,
};

/** 只认 workbench-xxx 形状的工作台（界面按 /workbenches/xxx 打开）；没有就返回 '' */
function pickWorkbench(legion, text) {
  const list = (legion && Array.isArray(legion.workbenches) ? legion.workbenches : []).filter((id) => /^workbench-[a-z0-9-]+$/.test(id));
  if (!list.length) return '';
  const s = String(text || '');
  let best = '';
  let bestScore = 0;
  for (const id of list) {
    const re = HINTS[id];
    if (!re) continue;
    const m = s.match(new RegExp(re.source, `${re.flags.replace('g', '')}g`));
    const score = m ? m.length : 0;
    if (score > bestScore) { best = id; bestScore = score; }
  }
  return best || list[0];
}

module.exports = { pickWorkbench };
