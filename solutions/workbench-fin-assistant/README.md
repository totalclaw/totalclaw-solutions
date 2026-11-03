# 智能金融助手（workbench-fin-assistant）

依据《金融行业 AI 应用解决方案 2.0》做的金融业务工作台，不含研发 Agent（编码助手、代码评审）。手写方案包（hostApi 2）：页面 `src/renderer/index.mjs`，主进程 `src/main/index.cjs`，纯逻辑 `src/main/lib.cjs`（单测 `test/fin-assistant.test.mjs`）。

## 模块

| 模块 | 程序负责 | 模型负责 | 人负责 |
|---|---|---|---|
| 安全与审计 | 数据分级路由拦截、审计串联哈希与校验 | — | 管理员确认模型是否内网私有部署 |
| 制度与合规问答 | 禁区话题拒答、BM25 + 专名检索、证据充分性判定、数字回原文核对、版本上下线 | 依据条款作答并标引用 | 制度管理部门维护制度、处理缺口反馈 |
| 智能问数 | 口径校验、按口径计算、等价 SQL、解读数字核对 | 把问题映射到口径库、写解读 | 数据岗维护口径 |
| 授信材料预审 | 材料清单缺件、原文定位、平衡 / 比率 / 流水匹配 / 有效期 / 大额与关联交易、删掉结论性句子 | 抽取数据并摘原话、起草预审意见 | 审批人逐条确认 |
| 营销物料审查 | 禁用表述 / 必备提示 / 收益表述硬匹配、模型摘句回原文核对 | 语义判断 | 合规岗终审 |

## 规则与口径（`resources/`）

- `forbidden-topics.json` 禁区话题（合规部门维护）
- `marketing-rules.json` 营销物料规则库（合规与法务部门维护）
- `credit-checklists.json` 授信材料清单（授信管理部门维护）
- `metrics.json` 问数口径库（数据岗维护；示例主题域：零售存款）
- `demo/` 示例材料（虚构）

## 数据

账号私有目录 `fin-assistant/`：settings、audit（串联哈希）、policies、qa、dataset、asks、credits/、mkt。
