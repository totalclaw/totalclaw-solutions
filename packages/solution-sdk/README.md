# 宿主 SDK（hostApi = 1）

动态方案（`solution.json` 中 `runtime.mode = "dynamic"`）的界面和主进程逻辑都放在方案包里，qiye-app 安装后直接加载，不用改 App，也不用发版。类型声明见 `index.d.ts`，参考实现见 `solutions/demo-dynamic-workbench`。

## 清单

```jsonc
"runtime": {
  "mode": "dynamic",
  "runner": "workbench",
  "route": "/workbenches/<短名>",          // 宿主动态挂载的路由（子路径 <route>/... 同样指向本方案）
  "entries": {
    "renderer": "src/renderer/index.mjs",  // ESM，宿主经 tc-solution:// 协议 import
    "main": "src/main/index.cjs"           // CommonJS，宿主 require 后调用 activate(ctx)
  }
},
"compat": { "minAppVersion": "2.0.5", "hostApi": 1 },
"data": { "schemaVersion": 1, "paths": ["<id>/"] }
```

## 渲染层

```js
export default function createSolution(sdk) {
  const { defineComponent, h, ref, onMounted } = sdk.vue;   // 不要 import 'vue'
  return defineComponent({
    setup() {
      const rows = ref([]);
      onMounted(async () => { rows.value = await sdk.invoke('list'); });
      return () => h('div', rows.value.map((r) => h('p', r.text)));
    },
  });
}
```

用 SFC 开发时，构建产物里的 `import { … } from 'vue'` 改写成 `const { … } = globalThis.__TOTALCLAW_SDK__.vue`。拿 SDK 实例用 `globalThis.__TOTALCLAW_SDK__.forSolution('<id>')`。

## 主进程

```js
module.exports = {
  hostApi: 1,
  activate(ctx) {
    ctx.handle('list', () => ctx.readJson('<id>/rows.json', []));
    ctx.handle('add', (p) => { /* … */ ctx.writeJson('<id>/rows.json', next); ctx.emit('changed'); return next; });
  },
  deactivate() { /* 清理定时器 / 子进程 */ },
};
```

- 只能经 `ctx` 读写账号数据，路径必须在 `data.paths` 声明的范围内，否则抛 `DATA_PATH_DENIED`。
- 不要写方案包目录，升级时代码目录会被整体替换。
- 宿主负责授权：方案需要授权（`access.requiresSolutionGrant`）而账号未开通时，`invoke` 一律返回 `NOT_GRANTED`，撤销授权后立即生效。
- 热替换顺序：方案升级后，宿主先停止接收新调用，等在途调用结束（最多 60 秒），然后 `deactivate()` 旧版、`activate()` 新版。新版激活失败时继续由旧版服务。
- 正在打开的方案不会被自动升级，关闭后下一轮再升级。

## 升级与数据

数据结构有破坏性变化时，新增 `migrations/NNN-<name>.mjs`（导出 `{ from, to, up(ctx) }`），并提升 `data.schemaVersion`。宿主在进入方案前，先快照数据再执行迁移；迁移失败时自动恢复数据，并拒绝打开。
