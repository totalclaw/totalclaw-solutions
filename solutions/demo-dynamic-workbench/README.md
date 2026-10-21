# 动态方案样例（开发者模板）

- id：`demo-dynamic-workbench`
- 类型：workbench（`runtime.mode = dynamic`）
- 入口路由：`/workbenches/demo-dynamic`（`access.hidden = true`，不在项目工作台列表展示，直接访问路由即可按需安装并打开）

新方案照此结构开发：界面与主进程逻辑都在方案包里，不需要改 qiye-app、不需要发版。

| 文件 | 说明 |
|---|---|
| `src/renderer/index.mjs` | 渲染入口：`export default (sdk) => Vue 组件`；用 `sdk.vue`，不要 `import 'vue'` |
| `src/main/index.cjs` | 主进程模块：`activate(ctx)` 里 `ctx.handle(action, fn)` 注册 action；`deactivate()` 清理定时器 |
| `solution.json` | `runtime.entries` 指向上面两个文件；`data.paths` 声明本方案在账号目录下的数据（`ctx.readJson/writeJson` 只能写这里） |

宿主 SDK 契约见仓库 `packages/solution-sdk/README.md`。
