// ── 研发工作流（固化的解决方案）──────────────────────────────────────────────
// 6 节点软件研发生命周期：客户交付需求(表单) → AI 产品经理(选项式 brainstorm) → AI 开发 →
// AI 代码评审 → AI 测试 → AI 运维。每个 AI 节点钉一个 ai-* 角色（引擎 totalclaw-agent 用该人设，
// 带文件工具在工作区真实写/改代码）。提示词（node.config.goal）与开发类型表全部固化在本文件。
//
// 数据传递：${requirement}/${projectName}/${devType}/${techStack}/${constraints} 是运行入参，
// ${node_<id>_result} 是上游产出，引擎运行时插值（interpolate，见 workflow-engine index.ts）。
// 人在环：PM 后插一个 human_confirm 节点做选项式 brainstorm（选项 + 自填）；各 AI 节点提示词要求
// 「缺关键输入用 [[WAIT_FOR_HUMAN]] 暂停请求补充」，配合任务运行路径的暂停机制。
import type { Workflow } from '@totalclaw/core-domain';
import { t as i18nT } from '../i18n';

export const FIXED_RD_WORKFLOW_ID = 'sol-rd-workflow';

/** 开发类型（覆盖市面基本所有开发；other 允许用户自填）。用于表单选择 + 注入各节点提示词。 */
export interface RdDevType {
  id: string;
  label: string;
  /** 给 AI 的技术栈默认建议（用户未指定技术栈时用） */
  stackHint: string;
}

// 只保留大方向（用户反馈：不要太细）。具体技术栈由 PM/开发结合方向给建议，或用户在「技术栈偏好」自填。
export const RD_DEV_TYPES: RdDevType[] = [
  { id: 'web', label: i18nT('Web 网站 / 应用'), stackHint: 'React/Vue + TypeScript' },
  { id: 'h5', label: i18nT('H5 页面 / 活动页'), stackHint: i18nT('Vue/React + 移动端适配') },
  { id: 'miniprogram', label: i18nT('小程序'), stackHint: i18nT('微信小程序 / uni-app / Taro') },
  { id: 'app', label: i18nT('App（移动端）'), stackHint: i18nT('Flutter/React Native 或原生') },
  { id: 'desktop', label: i18nT('桌面应用'), stackHint: 'Electron/Tauri' },
  { id: 'backend', label: i18nT('后端 / 服务'), stackHint: 'Node/Python/Go + REST/gRPC' },
  { id: 'data_ai', label: i18nT('数据 / AI'), stackHint: i18nT('Python + 数据管道/大模型') },
  { id: 'other', label: i18nT('其他（自填技术栈）'), stackHint: '' },
];

/** 6 节点在 UI 侧的元信息（图标 / 一句话职责），供工作台逐节点渲染实时状态。 */
export interface RdNodeMeta {
  id: string;
  name: string;
  roleId: string;
  icon: string;
  duty: string;
  /** 该节点是否会在工作区写/改代码文件（决定是否展示「文件改动」区） */
  writesFiles: boolean;
}

export const RD_NODE_METAS: RdNodeMeta[] = [
  { id: 'intake', name: i18nT('客户交付需求'), roleId: '', icon: 'clipboard', duty: i18nT('收集需求与开发类型，缺必填不放行'), writesFiles: false },
  { id: 'pm', name: i18nT('AI 产品经理'), roleId: 'ai-pm', icon: 'clipboard', duty: i18nT('需求分析、选项式头脑风暴、用户故事与任务拆解'), writesFiles: false },
  { id: 'dev', name: i18nT('AI 开发工程师'), roleId: 'ai-dev', icon: 'code', duty: i18nT('技术方案 + 在工作区编写代码 + 基础自测'), writesFiles: true },
  { id: 'reviewer', name: i18nT('AI 代码评审员'), roleId: 'ai-reviewer', icon: 'search', duty: i18nT('审查 Bug 与安全、规范检查、生成单元测试'), writesFiles: true },
  { id: 'qa', name: i18nT('AI 测试工程师'), roleId: 'ai-qa', icon: 'bug', duty: i18nT('编写并执行测试用例、回归、Bug 报告'), writesFiles: true },
  { id: 'ops', name: i18nT('AI 运维工程师'), roleId: 'ai-ops', icon: 'server', duty: i18nT('自动化部署发布、监控告警、故障自愈与成本优化'), writesFiles: false },
];

// 缺料标注通则（拼进每个 AI 节点提示词）。遇缺关键信息不臆造，用醒目约定标注供用户补充；
// PM 后的 human_confirm 闸门是真正的交互暂停点（选项式 + 自填）。
const WAIT_HUMAN_RULE = i18nT('\n\n【缺料规则】遇到必须由用户拍板或补充才能继续的关键信息（缺账号/密钥/接口文档/目标平台细节/歧义需求等），不要臆造，在回复**开头**用一行 `【需要补充】` 列出缺什么、为什么，并只在已知信息范围内先给出可交付的部分，把待补项清楚标出，等用户补齐后可在下一轮继续。');

// 工作区约定（拼进写文件的节点）：当前工作目录 = 用户在表单里选定的「产出地址」，
// 所有代码落在其下的 <projectName>/ 子目录，便于隔离与查看（相对路径即可，无需绝对路径）。
const WORKSPACE_RULE = i18nT('\n\n【工作区·必须遵守】你的**当前工作目录就是本项目产出目录**「${outputDir}/${projectName}/」（已自动创建好，可直接写入，不用自己再建）。用文件工具（write_file/patch/read_file）把代码真实写进来：**直接用相对路径即可**（例如 write_file 到 `src/index.html`、`README.md`），也可用完整绝对路径「${outputDir}/${projectName}/src/index.html」。不要把文件写到工作目录之外。每个文件用规范项目结构 + 必要注释；改动前先 read_file 看现状再 patch。');

// 机器可读方向清单：PM 在产出末尾附一段固定 sentinel 包裹的候选方向，供 brainstorm 闸门把"可选项"
// 动态换成模型真实生成的方向（而非写死的通用三项）。sentinel 与 workflow-engine 抽取端严格对齐。
const BRAINSTORM_OPTIONS_RULE = i18nT('\n\n【机器可读方向清单·必须输出】在全部内容的最末尾另起一段，严格用如下格式列出你上面第 2 步提出的候选产品方向（系统据此为用户生成可勾选的方向按钮）。每个方向单独一行、控制在 40 字内、格式「方向名：一句话卖点」，不要编号字母、不要在这两行标记之外添加任何字符：\n===BRAINSTORM_OPTIONS===\n方向一名称：一句话卖点\n方向二名称：一句话卖点\n===END_BRAINSTORM_OPTIONS===');

const RD_NODES: Array<{ id: string; name: string; roleId: string; goal: string }> = [
  {
    id: 'pm', name: i18nT('② AI 产品经理 · 需求与规划'), roleId: 'ai-pm',
    goal: i18nT('你是资深 AI 产品经理，负责需求分析与产品规划。项目「${projectName}」，开发类型：${devType}。基于客户需求，产出（Markdown）：\n1. 需求澄清：列 3-6 个关键待确认问题；\n2. **选项式头脑风暴（重要）**：给出 3-5 个候选产品方向/功能组合，每个含「一句话卖点 + 适用场景 + 粗略工作量」，清晰编号列出供用户选择（工作流会在你产出后暂停，让用户勾选一个方向或自填后再继续）；\n3. 供用户拍板：给出你推荐的方向与理由，以及基于该方向的 MVP 范围(本期做/不做)、用户故事(含验收标准)、编号任务拆解(标 P0/P1/P2 与依赖)、产品路线图。\n结构化、可直接交付开发。信息不足处显式标「缺：X」，不编造。\n\n客户需求：\n${requirement}\n\n约束：${constraints}') + BRAINSTORM_OPTIONS_RULE + WAIT_HUMAN_RULE,
  },
  {
    id: 'dev', name: i18nT('③ AI 开发工程师 · 技术方案 + 编码'), roleId: 'ai-dev',
    goal: i18nT('你是资深 AI 开发工程师。基于产品经理的规划，开发类型「${devType}」，技术栈偏好「${techStack}」（未指定则按开发类型选主流栈并说明理由）：\n1. 给《技术设计》：架构、模块划分、数据模型、关键接口、依赖选型；\n2. **真实编写代码**：按任务逐模块用文件工具把可运行代码写进工作区，遵循该语言/框架规范；\n3. 基础自测：给自测步骤或简单自测用例与预期。\n未实现/待定/需第三方凭据处标「缺：X」。\n\n产品规划：\n${node_pm_result}\n\n【用户已拍板的产品方向 —— 必须严格按此方向开发，不要另选方向】\n${node_brainstorm_choice}') + WORKSPACE_RULE + WAIT_HUMAN_RULE,
  },
  {
    id: 'reviewer', name: i18nT('④ AI 代码评审员 · 评审 + 单测'), roleId: 'ai-reviewer',
    goal: i18nT('你是严格的 AI 代码评审员。read_file 读开发写入工作区的代码，逐项审查：\n1. 潜在 Bug（问题/场景/影响/修法）、边界与错误处理；\n2. 安全审查（注入/越权/密钥硬编码/依赖漏洞…按 P0/P1/P2 排）；\n3. 规范与可维护性，给具体修改建议；\n4. **用文件工具为核心逻辑写真实可运行的单元测试**（标框架，覆盖正常/边界/异常）。\n给出是否可进入测试的结论与必须先改的 P0 阻塞项（有 P0 建议打回开发）。\n\n技术方案：\n${node_dev_result}') + WORKSPACE_RULE + WAIT_HUMAN_RULE,
  },
  {
    id: 'qa', name: i18nT('⑤ AI 测试工程师 · 测试用例 + 执行'), roleId: 'ai-qa',
    goal: i18nT('你是 AI 测试工程师。基于规划、代码与评审：\n1. 按验收标准编写功能/边界/异常/兼容测试用例（表格：编号/前置/步骤/预期/优先级）；\n2. 设计集成与回归用例；\n3. **用文件工具把可执行的自动化测试写进工作区并尽量执行**，记录通过/失败，失败项自动生成 Bug 报告（标题/复现/期望vs实际/严重度/指向模块）；\n4. 给发布准入准出结论，未达标列阻断项。\n缺可执行环境/测试数据标「缺：X」。\n\n规划：\n${node_pm_result}\n\n评审：\n${node_reviewer_result}') + WORKSPACE_RULE + WAIT_HUMAN_RULE,
  },
  {
    id: 'ops', name: i18nT('⑥ AI 运维工程师 · 部署运维'), roleId: 'ai-ops',
    goal: i18nT('你是 AI 运维工程师，负责自动化部署与发布、监控告警、故障自愈与成本优化。基于已通过测试的产物、开发类型「${devType}」：\n1. 自动化部署与发布：环境、构建、CI/CD 步骤、回滚策略（结合平台给容器/Serverless/静态托管/应用商店等具体做法，可写 CI 配置/部署脚本到工作区）；\n2. 智能监控与告警：关键指标(可用/延迟/错误率/资源/成本)、阈值、通知方式；\n3. 故障自愈：常见故障与自愈动作(重启/扩缩容/熔断/切流)及人工介入边界；\n4. 成本优化 + 上线检查清单。\n缺目标环境/云账号/密钥标「缺：X」，不臆造真实凭据。\n\n测试结论：\n${node_qa_result}\n\n技术方案：\n${node_dev_result}') + WAIT_HUMAN_RULE,
  },
];

/**
 * 构建研发工作流定义（固定 id）。start → pm → brainstorm(human_confirm) → dev → reviewer → qa → ops → end。
 * brainstorm 节点做选项式确认（预置方向 + 引用 PM 的候选方向 + 自填），是「选项式 + 用户自填」的落点。
 */
export function buildRdWorkflow(prefill?: {
  requirement?: string; projectName?: string; devType?: string; techStack?: string; constraints?: string; outputDir?: string;
}): Workflow {
  const now = Date.now();
  const nodes: Workflow['nodes'] = [];
  nodes.push({ id: 'start', type: 'start', name: i18nT('开始'), config: {}, next: ['pm'], position: { x: 40, y: 40 } });

  // ② 产品经理
  nodes.push({ id: 'pm', type: 'llm_call', name: RD_NODES[0].name, config: { goal: RD_NODES[0].goal, roleId: 'ai-pm' }, next: ['brainstorm'], position: { x: 340, y: 40 } });
  // 选项式 brainstorm 闸门：detail 展示 PM 的候选方向，options 预置通用方向，允许自填后继续
  nodes.push({
    id: 'brainstorm', type: 'human_confirm', name: i18nT('确认产品方向（可自填）'),
    config: {
      question: i18nT('从产品经理提出的候选方向里勾选一个，或在下方回答它的澄清问题 / 自填你的方向与优先级'),
      detail: i18nT('AI 产品经理的候选方向与澄清问题如下，请勾选一个方向，并可在下方补充框回答上面的澄清问题：\n\n${node_pm_result}'),
      // optionsFrom：运行时从 PM 产出（node_pm_result）里抽取模型真实给出的候选方向当选项；
      // 抽不到（模型没按格式输出）才回落下面这组静态通用项。这样"可选项"永远贴合模型实际产出。
      optionsFrom: 'node_pm_result',
      options: [i18nT('MVP 快速验证（先跑通核心闭环）'), i18nT('完整功能（覆盖主要场景）'), i18nT('技术预研（验证可行性/难点）')],
      requireComment: false,
      approveLabel: i18nT('按此方向继续'),
      rejectLabel: i18nT('打回产品经理重做'),
    },
    next: ['dev'], position: { x: 640, y: 40 },
  });
  // ③④⑤⑥
  nodes.push({ id: 'dev', type: 'llm_call', name: RD_NODES[1].name, config: { goal: RD_NODES[1].goal, roleId: 'ai-dev' }, next: ['reviewer'], position: { x: 40, y: 230 } });
  nodes.push({ id: 'reviewer', type: 'llm_call', name: RD_NODES[2].name, config: { goal: RD_NODES[2].goal, roleId: 'ai-reviewer' }, next: ['qa'], position: { x: 340, y: 230 } });
  nodes.push({ id: 'qa', type: 'llm_call', name: RD_NODES[3].name, config: { goal: RD_NODES[3].goal, roleId: 'ai-qa' }, next: ['ops'], position: { x: 640, y: 230 } });
  nodes.push({ id: 'ops', type: 'llm_call', name: RD_NODES[4].name, config: { goal: RD_NODES[4].goal, roleId: 'ai-ops' }, next: ['end'], position: { x: 40, y: 420 } });
  nodes.push({ id: 'end', type: 'end', name: i18nT('完成'), config: {}, next: [], position: { x: 340, y: 420 } });

  return {
    id: FIXED_RD_WORKFLOW_ID,
    name: i18nT('研发工作流'),
    description: i18nT('客户需求 → AI 产品经理(选项式头脑风暴) → AI 开发(工作区写代码) → AI 代码评审(+单测) → AI 测试 → AI 运维，逐节点真执行、缺料暂停补充'),
    version: 1,
    nodes,
    inputs: [
      { key: 'requirement', label: i18nT('客户交付需求'), defaultValue: prefill?.requirement || '' },
      { key: 'projectName', label: i18nT('项目名称'), defaultValue: prefill?.projectName || '' },
      { key: 'devType', label: i18nT('开发类型'), defaultValue: prefill?.devType || '' },
      { key: 'techStack', label: i18nT('技术栈偏好（可选）'), defaultValue: prefill?.techStack || '' },
      { key: 'constraints', label: i18nT('约束（截止/预算/合规，可选）'), defaultValue: prefill?.constraints || '' },
      { key: 'outputDir', label: i18nT('产出地址'), defaultValue: prefill?.outputDir || '' },
    ],
    createdAt: now, updatedAt: now,
  };
}
