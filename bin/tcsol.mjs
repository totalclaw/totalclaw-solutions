#!/usr/bin/env node
// tcsol：方案安装器命令行（开发联调 / 运维 / 离线环境）。qiye-app 主进程直接引用 packages/installer，不经过 CLI。
//
//   tcsol list                         已安装方案
//   tcsol catalog                      目录中的全部方案
//   tcsol search <关键词>
//   tcsol info <id|名称>
//   tcsol install <id|名称>...        按 id 或名称安装（含依赖）
//   tcsol check                        检查可用升级（只读）
//   tcsol update [id] [--all]          升级
//   tcsol rollback <id>                回滚到上一版本（并锁定）
//   tcsol pin <id> | unpin <id>
//   tcsol uninstall <id> [--purge-data --data <账号数据目录>]
//   tcsol verify [id] | repair [id]
//   tcsol migrate <id> --data <账号数据目录>
//   tcsol doctor
//
// 通用选项：
//   --root <dir>       安装根目录（默认 ~/.totalclaw/solution-packages）
//   --source <spec>    gitee | gitee:owner/repo@branch | <本地仓库目录> | <发布包.tgz>（默认 gitee）
//   --app-version <v>  宿主版本（默认 999.0.0，不做 minAppVersion 限制）
//   --host-api <n>     宿主 SDK 版本（默认 2）
//   --json             输出 JSON
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { SolutionManager, sourceFromSpec } from '../packages/installer/src/index.mjs';
import { parseArgs } from '../tools/lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const [cmd, ...rest] = args._;
const json = !!args.json;

function print(value, human) {
  if (json) console.log(JSON.stringify(value, null, 2));
  else human(value);
}

function table(rows, cols) {
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c] ?? '').length)));
  console.log(cols.map((c, i) => c.padEnd(widths[i])).join('  '));
  for (const r of rows) console.log(cols.map((c, i) => String(r[c] ?? '').padEnd(widths[i])).join('  '));
}

function manager() {
  const root = resolve(args.root || process.env.TCSOL_ROOT || join(homedir(), '.totalclaw', 'solution-packages'));
  const spec = args.source || process.env.TCSOL_SOURCE || 'gitee';
  const source = sourceFromSpec(spec === 'gitee' || spec.startsWith('gitee:') || spec.endsWith('.tgz') ? spec : resolve(spec), {
    token: process.env.GITEE_TOKEN || null,
  });
  let last = '';
  return new SolutionManager({
    root,
    source,
    appVersion: args['app-version'] || '999.0.0',
    hostApi: Number(args['host-api'] || 2),
    onProgress: ({ id, done, total }) => {
      if (json || !process.stderr.isTTY) return;
      const line = `  ${id} ${done}/${total}`;
      if (line !== last) process.stderr.write(`\r${line}`);
      last = line;
      if (done === total) process.stderr.write('\n');
    },
    log: (m) => !json && console.error(`· ${m}`),
  });
}

const HELP = `用法：tcsol <list|catalog|search|info|install|check|update|rollback|pin|unpin|uninstall|verify|repair|migrate|doctor> [参数] [--root dir] [--source spec] [--json]`;

async function main() {
  if (!cmd || cmd === 'help' || args.help) {
    console.log(HELP);
    return;
  }
  const m = manager();
  await m.recover();
  switch (cmd) {
    case 'list':
      return print(m.list(), (rows) =>
        rows.length ? table(rows.map((r) => ({ id: r.id, 名称: r.name, 版本: r.version, 锁定: r.pinned ? '是' : '', 自动更新: r.autoUpdate ? '开' : '关' })), ['id', '名称', '版本', '锁定', '自动更新']) : console.log('（尚未安装任何方案）'),
      );
    case 'catalog':
    case 'search': {
      const { ref, index } = await m.catalog();
      const q = rest.join(' ').toLowerCase();
      const items = index.items.filter((it) => !q || [it.id, it.name, it.category, ...(it.aliases || [])].some((s) => String(s).toLowerCase().includes(q)));
      return print({ ref, items: items.map(({ files, ...it }) => it) }, ({ items: rows }) => {
        console.log(`目录快照 ${ref}`);
        table(rows.map((it) => ({ id: it.id, 名称: it.name, 版本: it.version, 类型: it.kind, 分类: it.category })), ['id', '名称', '版本', '类型', '分类']);
      });
    }
    case 'info': {
      const item = await m.resolve(rest.join(' '));
      const installed = m.get(item.id);
      return print({ ...item, files: undefined, installed }, (it) => {
        console.log(`${it.name}（${it.id}）v${it.version}  ${it.kind} / ${it.category}`);
        console.log(it.description);
        console.log(`依赖：${it.dependsOn.join(', ') || '无'}；文件 ${it.fileCount} 个，${(it.size / 1024).toFixed(0)} KB`);
        console.log(`数据目录：${it.data.paths.join(', ') || '无'}（升级不会改动）`);
        console.log(installed ? `已安装 v${installed.version} → ${m.activePath(it.id)}` : '未安装');
      });
    }
    case 'install': {
      if (!rest.length) throw new Error('install 需要 id 或名称');
      const results = [];
      for (const q of rest) results.push(await m.install(q, { reason: 'manual', force: !!args.force }));
      return print(results, (rs) => rs.forEach((r) => console.log(`✓ ${r.id} ${r.status} ${r.from ? `${r.from} → ` : ''}${r.version || ''}`)));
    }
    case 'check': {
      const plan = await m.checkUpdates();
      return print(plan, (rows) => table(rows.map((p) => ({ id: p.id, 当前: p.from, 最新: p.to ?? '-', 动作: p.action, 原因: p.reason || '' })), ['id', '当前', '最新', '动作', '原因']));
    }
    case 'update': {
      if (args.all || !rest.length) {
        const r = await m.updateAll();
        return print(r, ({ results }) => (results.length ? results.forEach((x) => console.log(`${x.status === 'failed' ? '✗' : '✓'} ${x.id} ${x.status} ${x.error || `${x.from || ''} → ${x.version || ''}`}`)) : console.log('全部已是最新')));
      }
      const r = await m.update(rest[0], { acceptCapabilities: !!args['accept-capabilities'] });
      return print(r, (x) => console.log(`✓ ${x.id} ${x.status} ${x.from || ''} → ${x.version}`));
    }
    case 'rollback':
      return print(await m.rollback(rest[0]), (r) => console.log(`✓ ${r.id} 回滚 ${r.from} → ${r.version}（已锁定，unpin 后恢复自动更新）`));
    case 'pin':
    case 'unpin':
      return print(await m.setPinned(rest[0], cmd === 'pin'), (r) => console.log(`✓ ${r.id} ${r.pinned ? '已锁定' : '已解锁'} v${r.version}`));
    case 'uninstall': {
      const purge = !!args['purge-data'];
      if (purge && !args.data) throw new Error('--purge-data 需要同时指定 --data <账号数据目录>');
      const r = await m.uninstall(rest[0], { purgeData: purge, dataRoots: args.data ? [resolve(args.data)] : [] });
      return print(r, (x) => console.log(`✓ ${x.id} 已卸载，${x.keptData ? '用户数据已保留' : `已删除数据 ${x.purged.length} 项`}${x.dependents.length ? `；注意：${x.dependents.join(', ')} 依赖它` : ''}`));
    }
    case 'verify':
      return print(m.verify(rest[0]), (rows) => rows.forEach((r) => console.log(`${r.ok ? '✓' : '✗'} ${r.id} ${r.reason || ''}`)));
    case 'repair':
      return print(await m.repair(rest[0]), (rows) => (rows.length ? rows.forEach((r) => console.log(`✓ ${r.id} 已修复`)) : console.log('无需修复')));
    case 'migrate': {
      if (!args.data) throw new Error('migrate 需要 --data <账号数据目录>');
      return print(await m.migrate(rest[0], resolve(args.data)), (r) => console.log(r.steps.length ? `✓ 数据版本 ${r.from} → ${r.to}，备份 ${r.backup}` : `数据已是最新（v${r.to}）`));
    }
    case 'doctor': {
      const { ref, index } = await m.catalog({ refresh: true });
      const verify = m.verify();
      const plan = await m.checkUpdates({ refresh: false });
      return print({ root: m.root, source: m.source.describe(), ref, catalog: index.items.length, installed: verify, updates: plan.filter((p) => p.action !== 'up-to-date') }, (d) => {
        console.log(`安装目录：${d.root}`);
        console.log(`来源：${JSON.stringify(d.source)} @ ${d.ref}`);
        console.log(`目录方案：${d.catalog} 个；已安装：${d.installed.length} 个（校验失败 ${d.installed.filter((x) => !x.ok).length}）`);
        console.log(`待处理升级：${d.updates.length} 个`);
      });
    }
    default:
      console.error(HELP);
      process.exitCode = 2;
  }
}

main().catch((err) => {
  if (json) console.log(JSON.stringify({ ok: false, code: err.code, error: err.message, candidates: err.candidates }, null, 2));
  else console.error(`✗ ${err.message}`);
  process.exit(1);
});
