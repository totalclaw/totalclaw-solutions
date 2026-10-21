# 来源与改动说明

- 来源：
  - https://github.com/uncomtrade/comtradeapicall，提交 0848a3f1cf63234a93fb5635b9b19b2265afab71，路径 `src/comtradeapicall`、`examples/example calculating unit value.ipynb`、`examples/example Group Trade Matrix Data.ipynb`、`examples/example tracking top traded products.ipynb`、`examples/example viewing trade balance.ipynb`、`examples/example World top traded products.ipynb`、`tests/example calling functions - script.py`
- 许可证：MIT（代码；数据适用 UN Comtrade 条款）（Copyright (c) 2018 The Python Packaging Authority）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-comtrade-market-data`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；代码 MIT（comtradeapicall 1.3.2）；数据适用 UN Comtrade 使用条款。导入包需要 pandas、urllib3、requests。examples/example bilateral trade matrix view.ipynb 约 7.1MB 超过 1MB 未收；示例 notebook 开头含 pip install 单元格，正文已提示不要整本运行。
