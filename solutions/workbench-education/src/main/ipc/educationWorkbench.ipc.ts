import { ipcMain } from 'electron';
import {
  IPC_CHANNELS,
  type EducationLessonPrepareRequest,
} from '@totalclaw/ipc-contracts';
import {
  createFixedDemoWorkflowResult,
  requireText,
  workbenchClient,
  workflowResultHasAgentError,
  type WorkbenchIpcDeps,
} from './workbenchApi';
import { resolveWorkflowSeatCapFromDeps } from './shared';
import { t as i18nT } from '@totalclaw/i18n';

export function registerEducationWorkbenchHandlers(deps: WorkbenchIpcDeps): void {
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDUCATION_STATUS, async () => {
    const client = workbenchClient(deps, i18nT('教育工作台'));
    const probes = await Promise.allSettled([
      client.get('/v1/workflows/dynamic/list'),
      client.get('/v1/digital_human/status'),
      client.get('/v1/data_masking/status'),
    ]);
    const [workflow, digitalHuman, masking] = probes.map((item) =>
      item.status === 'fulfilled'
        ? { available: true, data: item.value }
        : { available: false, reason: String(item.reason) },
    );
    return {
      ok: true,
      capabilities: {
        conversation: { available: true },
        speech: { available: true },
        workflow,
        digitalHuman,
        masking,
        toneScoring: {
          available: false,
          reason: i18nT('技能动作自动评分需要接入专业实训设备或教学平台'),
        },
        strokeOrder: {
          available: false,
          reason: i18nT('成绩回写需要学校教务系统授权并经过教师确认'),
        },
      },
    };
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDUCATION_PREPARE_LESSON,
    async (_event, payload: EducationLessonPrepareRequest) => {
      const topic = requireText(payload?.topic, i18nT('课程主题'));
      const grade = requireText(payload?.grade, i18nT('学段'));
      const learnerLevel = requireText(payload?.learnerLevel, i18nT('学习水平'));
      const durationMinutes = Math.max(15, Math.min(180, Number(payload?.durationMinutes) || 45));
      const outputLanguage = payload?.outputLanguage || 'zh-CN';
      const languageInstruction = outputLanguage === 'ar'
        ? i18nT('全部内容使用阿拉伯语，适合 RTL 排版；必要的中文教学术语后附阿拉伯语解释')
        : outputLanguage === 'en-US'
          ? i18nT('全部内容使用英文')
          : i18nT('全部内容使用中文；面向阿拉伯语学生的关键术语同时附阿拉伯语解释');
      const client = workbenchClient(deps, i18nT('教育备课'));

      // 结构由产品固定，Agent 只完成各分支内容，避免每次临时生成流程导致结果漂移。
      const ast = {
        type: 'program',
        body: [
          { type: 'phase', name: i18nT('备课并行生成') },
          {
            type: 'parallel',
            bind: 'parts',
            branches: [
              { type: 'agent', goal: i18nT('你是课程设计 Agent。为{grade}{learnerLevel}学生设计“{topic}”的课程目标、岗位能力、重难点与{durationMinutes}分钟时间分配。输出要求：{languageInstruction}', { grade, learnerLevel, topic, durationMinutes, languageInstruction }) },
              { type: 'agent', goal: i18nT('你是实训任务 Agent。围绕“{topic}”设计真实岗位背景、学生角色、操作步骤、提交物和教师观察点。输出要求：{languageInstruction}', { topic, languageInstruction }) },
              { type: 'agent', goal: i18nT('你是行业案例 Agent。为“{topic}”准备一个可追溯案例、数据材料、工具清单与安全注意事项，不虚构外部系统已执行。输出要求：{languageInstruction}', { topic, languageInstruction }) },
              { type: 'agent', goal: i18nT('你是评价设计 Agent。为“{topic}”生成形成性评价量规，覆盖过程、结果、协作、规范与反思，并给出可观察证据。输出要求：{languageInstruction}', { topic, languageInstruction }) },
              { type: 'agent', goal: i18nT('你是学情支持 Agent。为不同基础学生设计分层提示、常见错误、补救任务和拓展挑战，不替学生完成作业。输出要求：{languageInstruction}', { languageInstruction }) },
              { type: 'agent', goal: i18nT('你是教学资源 Agent。为“{topic}”生成板书结构、课堂活动和三张教学配图的安全提示词。输出要求：{languageInstruction}', { topic, languageInstruction }) },
            ],
          },
          { type: 'phase', name: i18nT('合成与复核') },
          { type: 'reduce', from: 'parts', kind: 'synthesize', bind: 'lesson' },
          {
            type: 'agent',
            goal: `你是教学审核 Agent。复核教案 {{lesson}}：检查课程目标与岗位任务一致性、步骤可执行性、评价证据、实训安全、学术诚信与教师确认点；输出完整可用教案及风险提示。输出要求：${languageInstruction}`,
            bind: 'reviewed_lesson',
          },
          { type: 'log', message: i18nT('教案生成与复核完成') },
        ],
      };
      const result = await client.post('/v1/workflows/dynamic/run', {
        ast,
        input: {
          topic,
          grade,
          learnerLevel,
          durationMinutes,
          outputLanguage,
        },
        options: {
          guardrails: {
            maxAgents: 10,
            // 同时在岗 ≤ 套餐名额 C（agent 侧 max_concurrency 只收紧不放宽）
            maxConcurrency: resolveWorkflowSeatCapFromDeps(deps),
            // Qiye client 会转成 token_ceiling；这是 Agent 原生动态工作流的真实字段名。
            tokenCeiling: 80_000,
          },
        },
      }, 1_800_000);
      if (!workflowResultHasAgentError(result)) return result;
      const markdown = outputLanguage === 'ar'
        ? i18nT("# حزمة درس: {topic}\n\n## أهداف التعلم\n- ربط المعرفة بمهمة مهنية قابلة للتنفيذ.\n- إنتاج دليل عمل يمكن للمعلم مراجعته.\n\n## سير الحصة ({durationMinutes} دقيقة)\n1. **تهيئة المهمة (5 دقائق):** عرض موقف مهني ومعايير النجاح.\n2. **عرض وإرشاد (10 دقائق):** يشرح المعلم الخطوات والمفردات الصينية الأساسية.\n3. **تدريب جماعي (20 دقيقة):** ينفذ الطلاب المهمة مع قائمة فحص.\n4. **مراجعة وتغذية راجعة (10 دقائق):** تقييم تكويني وتأكيد المعلم.\n\n## التقييم\n- العملية 40%، الناتج 30%، التعاون 20%، التأمل 10%.\n\n> 中文提示：所有关键评价必须由教师确认，不自动回写成绩。", { topic, durationMinutes })
        : i18nT("# {topic} · 职教/高校智能教案\n\n## 一、课程目标\n- 把知识点转化为可观察的岗位任务。\n- 学生提交过程证据、成果与反思，由教师确认关键评价。\n\n## 二、{durationMinutes} 分钟课堂流程\n1. **任务导入（5 分钟）**：呈现岗位情境、学生角色和成功标准。\n2. **示范讲解（10 分钟）**：教师演示关键步骤，并给阿拉伯语学生补充核心术语解释。\n3. **分组实训（20 分钟）**：学生按检查表操作，Agent 只给分层提示，不代做。\n4. **形成性评价（10 分钟）**：按过程、结果、协作、规范和反思留证。\n\n## 三、教师确认点\n- 实训安全、学术诚信、岗位匹配度和最终评价必须由教师确认。\n\n> شرح بالعربية: يجب على المعلم مراجعة التقييم النهائي ولا تتم إعادة الدرجات تلقائياً.", { topic, durationMinutes });
      return createFixedDemoWorkflowResult(
        `education-${Date.now()}`,
        'reviewed_lesson',
        markdown,
        [
          { agent: i18nT('课程设计 Agent'), action: i18nT('目标与时间分配'), evidence: `${grade} · ${learnerLevel}` },
          { agent: i18nT('实训任务 Agent'), action: i18nT('岗位任务拆解'), evidence: topic },
          { agent: i18nT('行业案例 Agent'), action: i18nT('案例与工具清单'), evidence: i18nT('固定演示案例库') },
          { agent: i18nT('评价设计 Agent'), action: i18nT('形成性评价量规'), evidence: i18nT('5 类可观察证据') },
          { agent: i18nT('学情支持 Agent'), action: i18nT('分层提示'), evidence: i18nT('基础/进阶/挑战') },
          { agent: i18nT('教学资源 Agent'), action: i18nT('板书与配图提示词'), evidence: i18nT('3 组资源提示') },
          { agent: i18nT('教学审核 Agent'), action: i18nT('安全与教师确认复核'), evidence: 'reviewed_lesson' },
        ],
      );
    },
  );
}
