# 来源与改动说明

- 来源：
  - https://github.com/Cheryl-Feng/export-screening，提交 99e36aceb799562ae901b553f4436f5fff111fd9，路径 `export_screening.html`、`server.js`、`出口管制筛查模板.csv`、`xlsx.full.min.js`、`启动筛查工具.bat`、`启动筛查工具-ps.bat`、`server.ps1`
- 许可证：MIT（Copyright (c) 2025 Yuki）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-export-screening-batch`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；去掉：scripts/server.js 用 selfbuilt 副本覆盖上游：只绑 127.0.0.1（原版不传 host、监听所有网卡）；重定向只跟随 https://*.trade.gov（原版把 subscription-key 头转发给任意 Location 主机，相对 Location 会让进程抛异常）；日志不再打印 key 前 8 位；启动筛查工具.bat 运行同目录 node.exe，该可执行文件上游只在 GitHub Releases 另发，未复制（不复制二进制），正文改为 node scripts/server.js；server.js 只用 Node 内置模块，package.json / package-lock.json 不需要；xlsx.full.min.js 为 SheetJS 0.18.5 压缩库（约 862KB）；server.ps1 是 -ps.bat 的依赖，一并复制
