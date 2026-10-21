# @totalclaw/solution-installer

方案安装器：按 id / 名称从方案仓库下载、逐文件校验、原子安装，自动升级、回滚、数据迁移。零依赖 ESM，Node ≥ 18（Electron 主进程可直接用）。

## qiye-app 接入示例

```js
import { app } from 'electron';
import { join } from 'node:path';
import { GiteeSource, SolutionManager } from '@totalclaw/solution-installer';

const manager = new SolutionManager({
  root: join(app.getPath('userData'), 'solution-packages'), // 代码：设备级，多账号共用
  source: new GiteeSource({ owner: 'jlzdyx', repo: 'totalclaw-solutions', branch: 'master' }),
  appVersion: app.getVersion(),
  hostApi: 1,
  onProgress: (e) => win.webContents.send('solution-pkg:progress', e),
  log: (m) => logger.info(`[solution-pkg] ${m}`),
});

await manager.recover();                               // 启动：收尾上次中断的安装

// 授权即安装：/auth/me 拿到 enabledSolutionIds 后
for (const id of enabledSolutionIds) {
  if (!manager.get(id)) await manager.install(id, { reason: 'granted' }); // 用户卸载过的会被 tombstone 跳过
}

// 按名称安装（语音 / 搜索框）
await manager.install('财务智能体', { reason: 'manual' });

// 自动升级（启动 30 秒后 + 每 6 小时）；正在运行任务的方案推迟
const { plan, results } = await manager.updateAll({ isBusy: (id) => runningSolutions.has(id) });

// 账号进入某方案前：执行数据迁移（数据目录只在这里被方案脚本修改）
await manager.migrate('workbench-finance-agent', accountPath());
```

## API

| 方法 | 说明 |
|---|---|
| `catalog({refresh})` | 目录快照 `{ ref, index }`（5 分钟缓存） |
| `resolve(query)` | id → 名称 → 别名 → 名称包含（唯一命中），歧义抛 `AMBIGUOUS` |
| `install(query, {reason, force, withDependencies})` | 安装/升级到最新；自动安装 `dependsOn`；同版本同摘要幂等 |
| `checkUpdates()` | 只读：`update` / `blocked`(PINNED、AUTO_UPDATE_OFF、APP_TOO_OLD、HOST_API、NEEDS_CONSENT) / `delisted` / `up-to-date` |
| `update(id)` / `updateAll({isBusy})` | 应用升级；单个失败不影响其他 |
| `rollback(id)` | 切回上一版本并锁定 |
| `setPinned` / `setAutoUpdate` / `acceptCapabilities` | 用户策略 |
| `uninstall(id, {purgeData, dataRoots})` | 默认保留数据 + tombstone；purgeData 只删清单声明路径 |
| `verify(id?)` / `repair(id?)` | 摘要校验 / 从源重装 |
| `migrate(id, dataRoot)` | 数据迁移（快照 → 执行 → 失败恢复；拒绝降级） |
| `recover()` | 启动恢复 |
| `activePath(id)` / `manifest(id)` / `list()` / `get(id)` | 查询 |

来源：`GiteeSource`（commit 快照 + raw 逐文件 + 整仓归档兜底）、`LocalSource`（本地仓库目录）、`TarballSource`（`tools/pack.mjs` 发布包）。

## 磁盘布局

```
<root>/installed.json            锁文件
<root>/.journal.json             发布日志（崩溃恢复）
<root>/<id>/<version>+<digest8>/ 代码（只保留当前版本与上一版本）
<账号目录>/.solution-data/<id>.json       数据版本
<账号目录>/.solution-backups/<id>/...     迁移前快照（保留 3 份）
```
