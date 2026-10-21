/** G0 平台与公共（6）。P1–P3 批次 1 落地为首页的配置向导 / 项目空间 / 数据接入；P4 批次 3，P5 批次 7，P6 批次 8。 */
import { i18nKey } from '@totalclaw/i18n';
import { planned, type FauModuleSpec } from './types';

export const PLATFORM_MODULES: FauModuleSpec[] = [
  {
    id: 'setup', code: 'P1', group: 'platform', archetype: 'P', package: 'core', status: 'ready', batch: 1,
    name: i18nKey('首次配置与地区档案'),
    summary: i18nKey('公司与地区、准则与科目映射、ERP、重要性水平与阈值、签核人与职责分离、启用套餐'),
    modes: [{ id: 'wizard', name: i18nKey('配置向导'), skills: ['fa-setup-guide'] }],
    inputs: [], outputs: [], signoff: { required: false, levels: [] }, regions: 'all',
  },
  {
    id: 'projects', code: 'P2', group: 'platform', archetype: 'P', package: 'core', status: 'ready', batch: 1,
    name: i18nKey('项目空间'),
    summary: i18nKey('月结期、年审、申报周期、并购项目：新建、切换、查看详情、关联上一期、归档后只读'),
    modes: [{ id: 'manage', name: i18nKey('项目管理'), skills: ['fa-project-workspace'] }],
    inputs: [], outputs: [], signoff: { required: false, levels: [] }, regions: 'all',
  },
  {
    id: 'data-intake', code: 'P3', group: 'platform', archetype: 'P', package: 'core', status: 'ready', batch: 1,
    name: i18nKey('数据接入与清洗'),
    summary: i18nKey('上传序时账、余额表、银行流水等，自动识别列与 ERP 导出格式，校验后转成项目内的标准数据集'),
    modes: [{ id: 'import', name: i18nKey('导入数据'), skills: ['fa-clean-data-xls'] }],
    inputs: [], outputs: [], signoff: { required: false, levels: [] }, regions: 'all',
    reuse: [{ workbench: 'workbench-finance-agent', route: '/workbenches/finance-agent', label: i18nKey('从财务智能体账套导入') }],
  },
  // P4 批次 3：独立质检入口（不走七步、不签核），表格 / 模型审计三档范围、演示文稿数字与措辞质检、用新数字刷新
  {
    id: 'office-output', code: 'P4', group: 'platform', archetype: 'P', package: 'core', status: 'ready', batch: 3,
    name: i18nKey('办公产出与质检'),
    summary: i18nKey('底稿生成、表格与模型审计、演示文稿质检与刷新、模板'),
    modes: [{ id: 'qc', name: i18nKey('质检'), skills: ['fa-audit-xls', 'fa-ib-check-deck', 'fa-deck-refresh', 'fa-ppt-template-creator', 'fa-xlsx-author', 'fa-pptx-author'] }],
    inputs: [], outputs: ['xlsx', 'pptx'], signoff: { required: false, levels: [] }, regions: 'all',
    quickActions: [
      { id: 'debug-model', name: i18nKey('表格与模型质检'), skill: 'fa-audit-xls', command: '/debug-model' },
      { id: 'check-deck', name: i18nKey('演示文稿质检'), skill: 'fa-ib-check-deck' },
      { id: 'deck-refresh', name: i18nKey('用新数字刷新演示文稿'), skill: 'fa-deck-refresh' },
      { id: 'ppt-template', name: i18nKey('演示文稿模板'), skill: 'fa-ppt-template-creator', command: '/ppt-template' },
    ],
  },
  planned({
    id: 'connectors', code: 'P5', group: 'platform', archetype: 'P', package: 'core', batch: 7,
    name: i18nKey('连接器与数据源'),
    summary: i18nKey('ERP 只读取数、付费数据源与文档库连接器目录，取不到时降级为上传'),
    outputs: [], levels: [],
  }),
  // P6 批次 8：引导到现有的 AutoCoder「Skill 开发」，并附 fa-skill-creator（不另做编辑器、不走七步）
  {
    id: 'skill-studio', code: 'P6', group: 'platform', archetype: 'P', package: 'core', status: 'ready', batch: 8,
    name: i18nKey('企业技能自建'),
    summary: i18nKey('把本企业的制度与模板做成技能'),
    modes: [{ id: 'build', name: i18nKey('自建技能'), skills: ['fa-skill-creator'] }],
    inputs: [], outputs: ['md'], signoff: { required: false, levels: [] }, regions: 'all',
  },
];
