# totalclaw-solutions · TotalClaw 解决方案仓库

TotalClaw 企业助手（qiye-app）「项目工作台」里**全部解决方案**的唯一来源：方案源码、清单、目录与发布。

- **方案仓库**负责：方案代码、名称、版本、分类、三语描述（`solutions/<id>/`、`index.json`）
- **totalclaw-web**负责：谁能用（账号授权 `enabledSolutionIds`、申请审批），目录从本仓库 `index.json` 同步
- **qiye-app**负责：按 id / 名称下载安装（`packages/installer`）、授权即安装、已安装方案自动升级；用户数据与记忆不随升级改动

架构详见 `ceshi/qiye-project-todo/ARCHITECTURE.md`。

## 目录

```
solutions/<id>/          一个方案一个目录（目录名 == id == totalclaw-web 方案 id）
  solution.json          清单（manifestVersion 2，见 schema/solution.schema.json）
  CHANGELOG.md           每个版本一节（validate 强制）
  README.md
  origin.json            来源追溯：从 qiye-app 迁入时的文件映射与 import 依赖分析（生成物）
  src/                   源码（保持 qiye-app apps/desktop-shell/src 下的原相对路径）
  resources/             运行资源（模板 / 技能 / 演示素材）
  migrations/            数据迁移脚本
index.json               v2 目录摘要（生成物，客户端拉取）
index/<id>.json          各方案逐文件 sha256 清单（生成物，安装时拉取）
catalog.json             v1 目录（生成物，仅 runner/pipeline，兼容旧版 qiye-app 市场）
removed.json             下架清单
registry/web-solution-ids.json   totalclaw-web 方案目录快照（id 对账）
packages/installer/      安装器库（qiye-app 主进程直接引用，零依赖）
bin/tcsol.mjs            安装器命令行
tools/                   导入 / 生成目录 / 校验 / 打包
test/                    node:test
```

## 方案一览

共 36 个目录：totalclaw-web 授权目录中的 **30 个方案** + 2 个共享 kit + 4 个免授权市场流水线包。

| id | 名称 | 类型 |
|---|---|---|
| workbench-edu-hub | AI 学习中心（文档生成教案） | workbench |
| rd-workflow | 研发工作流 | workbench |
| workbench-education | 职教与高校工作台 | workbench |
| workbench-grounded-qa | 知识问答助手 | workbench |
| workbench-healthcare | 智慧医院运营工作台 | workbench |
| workbench-warehouse | 产销存协同工作台 | workbench |
| workbench-global-ads | 阿联酋广告代投放工作台 | workbench |
| workbench-rfq-quote | AI 询价与报价数字员工 | workbench |
| workbench-bid-decision | AI 招投标决策数字员工 | workbench |
| workbench-bid-writer | 标书制作智能体 | workbench |
| workbench-advisory-report | AI 客户问题与方案报告数字员工 | workbench |
| workbench-industry-watch | 盘面情报台 | workbench |
| workbench-digital-human | 数字人口播与直播工作台 | workbench |
| workbench-foreign-trade | 外贸业务智能体 | workbench |
| workbench-academic-writer | 学术写作智能体 | workbench |
| workbench-finance-agent | 财务智能体 | workbench |
| workbench-apparel-store | 服装实体店智能体 | workbench |
| workbench-biz-automation | 经营自动化智能体 | workbench |
| workbench-invoice-agent | 发票智能体 | workbench |
| workbench-flow-sla | 流程时效监控智能体 | workbench |
| workbench-parts-alert | 配件预警与补库智能体 | workbench |
| workbench-campus-ai | 高校一体化AI智能体 | workbench |
| workbench-zcy-agent | 政采云智能体 | workbench |
| workbench-service-settlement | 服务商结算与激励核算 | workbench |
| workbench-finance-audit | 财会审计解决方案 | workbench |
| workbench-charity-content | 慈善活动内容工场 | workbench |
| workbench-quran-teaching | 人工智能《古兰经》智能教学平台（演示） | workbench（hidden） |
| embedded-bid-desk | 项目工作台 | workbench |
| embedded-video-studio | 短视频创作与发布工作台 | workbench |
| material-to-table | 办公材料整理智能体 | runner |
| kit-saudi-workbench | 沙特数字员工底座 | kit |
| kit-automation-ops | 自动化运营控制台 | kit |
| oneclick-video / daizhang-accounting / dev-pipeline / website-test | 市场流水线包 | runner / pipeline |

## 常用命令

```bash
npm test                 # 全部测试（安装器 + 真实仓库端到端）
npm run validate         # 校验清单、id 对账、CHANGELOG、文件安全、生成物最新
npm run index            # 重新生成 index.json / index/*.json / catalog.json
npm run pack -- <id>     # 打发布包 dist/<id>-<version>.tgz（--all 打全部）
npm run import           # 从 qiye-app 重新同步源码（迁移期使用）

# 安装器 CLI
npm run tcsol -- catalog                              # 看目录（默认来源 gitee master）
npm run tcsol -- install 财务智能体                     # 按名称安装（含依赖）
npm run tcsol -- install workbench-finance-agent --source .   # 从本地仓库安装
npm run tcsol -- check | update --all | rollback <id> | uninstall <id>
```

## 新增方案

1. 新建 `solutions/<id>/`：`solution.json`（参照 schema）、`CHANGELOG.md`、`README.md`、源码。
2. 需要授权售卖的方案（`access.requiresSolutionGrant: true`）：id 先在 totalclaw-web 目录中存在（web 侧同步上线后由本仓库自动同步，届时刷新 `registry/web-solution-ids.json` 即可）。
3. `npm run index && npm run validate && npm test`，提交 PR。合入 master 即发布。

## 升级方案（发布新版本）

1. 修改 `solutions/<id>/**`。
2. **必须**提升 `solution.json` 的 `version`（semver），并在 `CHANGELOG.md` 写对应版本一节。PR 检查 `npm run validate:pr` 会拦截「改了文件没升版本」。
3. 数据结构有破坏性变化：新增 `migrations/NNN-<name>.mjs` 并把 `data.schemaVersion` +1（见下）。
4. `npm run index` 后提交。合入 master 后，已安装该方案的 qiye-app 在下个检查周期（启动 30 秒后、之后每 6 小时）自动升级。

## 数据与记忆保护

- 安装目录（代码）与账号数据目录物理分离：安装器只写 `solution-packages/`，**从不写**账号数据。
- 每个方案在 `data.paths` 声明自己的数据路径（相对账号目录 `accounts/<key>/`），只用于迁移前快照和用户明确选择「卸载并删除数据」。
- 宿主公共目录（`memory/`、`conversations/`、`knowledge/`、`totalclaw-agent/` 根等）禁止被任何方案声明，validate 强制。
- 卸载默认保留数据；重新安装即可恢复。

### 数据迁移

```js
// solutions/<id>/migrations/002-split-items.mjs
export default {
  from: 1,
  to: 2,
  async up(ctx) {
    const s = ctx.readJson('finance-agent/state.json', {});
    ctx.writeJson('finance-agent/state.json', { ...s, items: s.items ?? [] });
  },
};
```

- 宿主在账号首次进入该方案时调用 `manager.migrate(id, accountDir)`。
- 执行前把 `data.paths` 快照到 `accounts/<key>/.solution-backups/<id>/`（保留 3 份）；任一步失败自动恢复快照、版本不变。
- 数据版本记在 `accounts/<key>/.solution-data/<id>.json`；数据版本高于代码支持版本时拒绝运行（防止旧代码写坏新数据）。

## 下架

在 `removed.json` 加 `{ "id": "...", "reason": "...", "versions": ["1.2.0"] }`（不写 versions 表示整个方案），`npm run index` 后提交。客户端停止新装，已装的标记已下架，不删数据。

## 当前阶段说明

29 个内置工作台目前 `runtime.mode = "bundled"`：代码仍由 qiye-app 构建期编译（后续由 qiye-app `solutions:sync` 从本仓库同步），安装器负责版本跟踪、资源/技能/模板分发、数据迁移与自动升级。宿主 SDK 与动态加载就绪后，逐个方案切换为 `dynamic`，届时下载即运行。见 ARCHITECTURE.md §8。
