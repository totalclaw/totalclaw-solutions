# 数据迁移

破坏性数据结构变更时在此新增 `NNN-<name>.mjs`，导出 `{ from, to, up(ctx) }`，并把 solution.json 的 `data.schemaVersion` 提升到 `to`。
安装器在激活新版本前，按账号快照 `data.paths` 后依次执行。详见仓库 README「数据迁移」。
