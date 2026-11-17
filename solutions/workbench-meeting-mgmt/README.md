# 会议智能管理

- id：`workbench-meeting-mgmt`
- 分类：项目管理
- 类型：workbench（dynamic，hostApi 2）
- 入口路由：`/workbenches/meeting-mgmt`

以项目会议为源头：上传录音、录屏或文字记录，本机转写并按声纹识别发言人，发言人确认、主持人终审后生成正式纪要；AI 从决议拆出任务派给各部门负责人，跟进进度、处理异议与裁决，最后生成项目总结并归档。

会议 → 纪要 → 任务 → 跟进 → 归档全流程闭环：转写与声纹识别都在本机，按停顿切片、只和本场参会人比对，噪声大时认不准的交给主持人指认；发言人逐段确认（超时自动催办）、主持人终审定稿；AI 生成执行方案，任务负责人确认后按责任部门下发；部门负责人接收或提异议，复核、裁决全程留痕；每周进度汇总、到期与逾期提醒；结项检查通过后 AI 生成总结，审核后归档。第一次打开有配置引导（检测电脑配置并推荐转写模型、组织、通知、手机端、声纹、大模型）；通知支持企业微信自建应用卡片或群机器人（可按手机号 @ 人），手机页在企微里就能处理，含声纹采集。

## 安装

```bash
npm run tcsol -- install workbench-meeting-mgmt
```

qiye-app 中按 id `workbench-meeting-mgmt` 或名称「会议智能管理」安装；已安装后随方案仓库发布自动升级，用户数据（`meeting-mgmt/`）不受影响。

## 开发

源码只在本仓库维护。在 qiye-app 根目录执行 `pnpm solutions:pull` 把源码叠加回 App 原路径开发、跑测试，改完 `pnpm solutions:sync --push` 带回来，再 `pnpm solutions:build --only workbench-meeting-mgmt` 生成 `dist/`。

设计与实测记录见 qiye-app `docs/meeting-mgmt-workbench.md`。会议录音只在本机转写与识别发言人，不上传。
