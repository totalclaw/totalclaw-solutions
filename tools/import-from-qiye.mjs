#!/usr/bin/env node
// 从 qiye-app 把内置工作台源码复制进方案仓库，并生成 solution.json / origin.json / README / CHANGELOG。
//
// 用法：node tools/import-from-qiye.mjs [--qiye <qiye-app 根目录>] [--web <totalclaw-web 根目录>] [--only <id,id>]
//
// 复制规则（见 tools/import-map.json）：
//   src:<p>  = <qiye>/apps/desktop-shell/src/<p>  →  solutions/<id>/src/<p>
//   pkg:ipc-contracts/src/<f> →  solutions/<id>/src/contracts/<f>
//   res:<p>  = <qiye>/resources/<p>             →  solutions/<id>/resources/<p>
// 保持相对 apps/desktop-shell/src 的原路径，方案内部的相对 import 不变。
// 已存在的 solution.json 只刷新元数据，保留 version / data.schemaVersion（版本由开发者手动提升）。
//
// ⚠ 切换日之后方案源码只在方案仓库维护，本工具仅用于迁移期 / 历史追溯：
//   会跳过 qiye-app apps/desktop-shell/solution-sdk.json 里的宿主 SDK 文件，也不再生成 kit。
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, posix, resolve } from 'node:path';
import {
  MAX_FILE_BYTES,
  REPO_ROOT,
  SOLUTIONS_DIR,
  parseArgs,
  readJson,
  sha256,
  toPosix,
  walkFiles,
  writeJson,
} from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const QIYE = resolve(args.qiye || process.env.TOTALCLAW_QIYE_APP_DIR || join(REPO_ROOT, '..', 'totalclaw-qiye-app'));
const WEB = resolve(args.web || process.env.TOTALCLAW_WEB_DIR || join(REPO_ROOT, '..', 'totalclaw-web'));
const APP = join(QIYE, 'apps', 'desktop-shell');
const APP_SRC = join(APP, 'src');
const ONLY = args.only ? new Set(String(args.only).split(',')) : null;

const MIN_APP_VERSION = readJson(join(APP, 'package.json')).version;
const map = readJson(join(REPO_ROOT, 'tools', 'import-map.json'));

function git(cwd, ...a) {
  try {
    return execFileSync('git', a, { cwd, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}
const baseline = {
  repo: map.baseline.repo,
  branch: git(QIYE, 'branch', '--show-current'),
  commit: git(QIYE, 'rev-parse', 'HEAD'),
};

// ── 读取 qiye-app registry.ts 与 totalclaw-web 种子目录（只取对象字面量，不执行 TS 模块） ──

function evalArrayLiteral(source, startMarker, openMarker, label) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`${label}: 找不到 ${startMarker}`);
  const open = source.indexOf(openMarker, start) + openMarker.length - 1;
  let depth = 0;
  let quote = null;
  let end = -1;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && source[i + 1] === '/') {
      i = source.indexOf('\n', i);
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      i = source.indexOf('*/', i) + 1;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === '[') depth++;
    else if (c === ']' && --depth === 0) {
      end = i;
      break;
    }
  }
  const body = source
    .slice(open, end + 1)
    .replace(/i18nT\(/g, '__t(')
    .replace(/!import\.meta\.env\.DEV/g, 'true')
    .replace(/import\.meta\.env\.DEV/g, 'false');
  return new Function('__t', `return ${body};`)((s) => s);
}

const registry = evalArrayLiteral(
  readFileSync(join(APP_SRC, 'renderer', 'workbenches', 'registry.ts'), 'utf8'),
  'export function builtinWorkbenchDescriptors',
  'return [',
  'registry.ts',
);
const registryById = new Map(registry.map((d) => [d.id, d]));

const webCatalogFile = join(WEB, 'server', 'user-info-api', 'backend', 'src', 'admin', 'solution-catalog.ts');
const webCatalog = existsSync(webCatalogFile)
  ? evalArrayLiteral(readFileSync(webCatalogFile, 'utf8'), 'export const ADMIN_SOLUTION_CATALOG', 'freeze([', 'solution-catalog.ts')
  : readJson(join(REPO_ROOT, 'registry', 'web-solution-ids.json')).items;
const webById = new Map(webCatalog.map((d) => [d.id, d]));

// web 目录快照：validate 用它对账（totalclaw-web 不在本机时也能校验）
writeJson(join(REPO_ROOT, 'registry', 'web-solution-ids.json'), {
  $comment: 'totalclaw-web ADMIN_SOLUTION_CATALOG 的 id 快照；requiresSolutionGrant=true 的方案 id 必须在此列表中。由 tools/import-from-qiye.mjs 刷新。',
  source: 'totalclaw-web/server/user-info-api/backend/src/admin/solution-catalog.ts',
  items: webCatalog.map(({ id, name, category, description, descriptionEn, descriptionAr }) => ({
    id,
    name,
    category,
    description,
    ...(descriptionEn ? { descriptionEn } : {}),
    ...(descriptionAr ? { descriptionAr } : {}),
  })),
});

// ── 展开 seeds → 文件列表 ──

function seedToAbs(seed) {
  const [kind, rest] = [seed.slice(0, seed.indexOf(':')), seed.slice(seed.indexOf(':') + 1)];
  if (kind === 'src') return { abs: join(APP_SRC, rest), dest: (rel) => posix.join('src', rest, rel) };
  if (kind === 'res') return { abs: join(QIYE, 'resources', rest), dest: (rel) => posix.join('resources', rest, rel) };
  if (kind === 'pkg') {
    const m = rest.match(/^ipc-contracts\/src\/(.+)$/);
    if (!m) throw new Error(`不支持的 pkg seed: ${seed}`);
    return { abs: join(QIYE, 'packages', rest), dest: (rel) => posix.join('src', 'contracts', m[1], rel) };
  }
  throw new Error(`未知 seed 前缀: ${seed}`);
}

/** 文件 seed 自动带上同目录同名测试：X.ts → X.test.ts / X.*.test.ts；X.vue → X.test.ts / X.*.test.ts */
function siblingTests(absFile) {
  const dir = dirname(absFile);
  const stem = basename(absFile).replace(/\.(ts|vue|js|mjs)$/, '');
  return walkFiles(dir)
    .filter((f) => !f.includes('/'))
    .filter((f) => f !== basename(absFile) && (f === `${stem}.test.ts` || (f.startsWith(`${stem}.`) && f.endsWith('.test.ts'))))
    .map((f) => join(dir, f));
}

function expandSeeds(seeds) {
  const files = []; // { abs, dest }
  const missing = [];
  for (const seed of seeds) {
    const { abs, dest } = seedToAbs(seed);
    if (!existsSync(abs)) {
      missing.push(seed);
      continue;
    }
    if (statSync(abs).isDirectory()) {
      for (const rel of walkFiles(abs)) files.push({ abs: join(abs, rel), dest: dest(rel) });
    } else {
      files.push({ abs, dest: dest('') });
      const base = dirname(dest(''));
      for (const t of siblingTests(abs)) files.push({ abs: t, dest: posix.join(base, basename(t)) });
    }
  }
  const seen = new Set();
  return { files: files.filter((f) => (seen.has(f.abs) ? false : seen.add(f.abs))), missing };
}

const sdkFile = join(APP, 'solution-sdk.json');
const sdkSet = existsSync(sdkFile) ? new Set(readJson(sdkFile).files.map((f) => join(QIYE, f))) : null;
const entries = [
  ...(sdkSet ? [] : Object.entries(map.kits).map(([id, cfg]) => ({ id, kind: 'kit', cfg }))),
  ...Object.entries(map.solutions).map(([id, cfg]) => ({ id, kind: 'workbench', cfg })),
];
for (const e of entries) {
  Object.assign(e, expandSeeds(e.cfg.seeds));
  if (sdkSet) e.files = e.files.filter((f) => !sdkSet.has(f.abs));
}

// 所有权：源文件绝对路径 → 方案 id（用于跨方案依赖识别）
const owner = new Map();
for (const e of entries) {
  for (const f of e.files) {
    if (owner.has(f.abs) && owner.get(f.abs) !== e.id) {
      console.warn(`! 文件同时属于 ${owner.get(f.abs)} 与 ${e.id}: ${f.abs}`);
    } else owner.set(f.abs, e.id);
  }
}

// ── import 依赖分析 ──

const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^'"`;]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g;
const CODE_EXT = /\.(ts|tsx|js|mjs|cjs|vue)$/;

function resolveRelative(fromAbs, spec) {
  const base = resolve(dirname(fromAbs), spec);
  const cands = [base, `${base}.ts`, `${base}.js`, `${base}.vue`, `${base}.json`, `${base}.mjs`, join(base, 'index.ts'), join(base, 'index.js')];
  return cands.find((c) => existsSync(c) && statSync(c).isFile()) || null;
}

function hostLabel(abs) {
  if (abs.startsWith(APP_SRC)) return toPosix(abs.slice(APP_SRC.length + 1));
  return toPosix(abs.slice(QIYE.length + 1));
}

function analyze(entry) {
  const solutions = new Map(); // id → Set(host-relative path)
  const host = new Set();
  const packages = new Set();
  let internal = 0;
  for (const f of entry.files) {
    if (!CODE_EXT.test(f.abs)) continue;
    const text = readFileSync(f.abs, 'utf8');
    for (const m of text.matchAll(IMPORT_RE)) {
      const spec = m[1] || m[2] || m[3];
      if (!spec) continue;
      if (spec.startsWith('.')) {
        const target = resolveRelative(f.abs, spec);
        if (!target) continue;
        const o = owner.get(target);
        if (o === entry.id) internal++;
        else if (o) {
          if (!solutions.has(o)) solutions.set(o, new Set());
          solutions.get(o).add(hostLabel(target));
        } else host.add(hostLabel(target));
      } else {
        const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
        if (!pkg.startsWith('node:')) packages.add(pkg);
      }
    }
  }
  return {
    internal,
    solutions: Object.fromEntries([...solutions].sort().map(([k, v]) => [k, [...v].sort()])),
    host: [...host].sort(),
    packages: [...packages].sort(),
  };
}

// ── 生成方案目录 ──

function firstDest(files, re) {
  return files.map((f) => f.dest).find((d) => re.test(d) && !d.endsWith('.test.ts')) || null;
}

function buildManifest(entry, analysis, largeAssets, existing) {
  const reg = registryById.get(entry.id);
  const web = webById.get(entry.id);
  const isKit = entry.kind === 'kit';
  if (!isKit && !reg) throw new Error(`registry.ts 中找不到 ${entry.id}`);
  const name = isKit ? entry.cfg.name : reg.name;
  const aliases = new Set(existing?.aliases || []);
  if (web && web.name !== name) aliases.add(web.name);
  const shortId = entry.id.replace(/^(workbench|embedded)-/, '');
  if (shortId !== entry.id) aliases.add(shortId);
  const dependsOn = [...new Set([...(entry.cfg.dependsOn || []), ...Object.keys(analysis.solutions)])]
    .filter((d) => d !== entry.id)
    .sort();
  return {
    manifestVersion: 2,
    schemaVersion: 1,
    id: entry.id,
    name,
    aliases: [...aliases].sort(),
    version: existing?.version || '1.0.0',
    kind: entry.kind,
    category: isKit ? entry.cfg.category : reg.category,
    icon: isKit ? 'icon-solutions' : reg.icon,
    order: entry.cfg.order ?? 1000,
    description: isKit ? entry.cfg.description : reg.description,
    ...(web?.descriptionEn ? { descriptionEn: web.descriptionEn } : {}),
    ...(web?.descriptionAr ? { descriptionAr: web.descriptionAr } : {}),
    ...(reg?.detail ? { detail: reg.detail } : {}),
    ...(reg?.shortcuts ? { shortcuts: reg.shortcuts } : {}),
    ...(reg?.highlights ? { highlights: reg.highlights } : {}),
    access: {
      requiresSolutionGrant: isKit ? false : reg.requiresSolutionGrant !== false,
      feature: isKit ? null : reg.feature,
      hidden: isKit ? true : reg.hidden === true,
    },
    compat: { minAppVersion: existing?.compat?.minAppVersion || MIN_APP_VERSION, hostApi: 1 },
    runtime: {
      mode: 'bundled',
      runner: isKit ? 'kit' : 'workbench',
      route: isKit ? null : reg.directPath,
      renderer: isKit ? null : firstDest(entry.files, /^src\/renderer\/views\/.+\.vue$/) || firstDest(entry.files, /^src\/renderer\/.+\.vue$/),
      main: firstDest(entry.files, /^src\/main\/ipc\/.+\.ipc\.ts$/),
    },
    dependsOn,
    data: {
      schemaVersion: existing?.data?.schemaVersion || 1,
      paths: entry.cfg.data?.paths || [],
      localStorage: entry.cfg.data?.localStorage || [],
    },
    capabilities: existing?.capabilities || [],
    largeAssets,
    distribution: { channel: 'stable', path: `solutions/${entry.id}` },
  };
}

function readme(m, analysis) {
  const lines = [
    `# ${m.name}`,
    '',
    `- id：\`${m.id}\``,
    `- 分类：${m.category}`,
    `- 类型：${m.kind}`,
    m.runtime.route ? `- 入口路由：\`${m.runtime.route}\`` : null,
    m.dependsOn.length ? `- 依赖：${m.dependsOn.map((d) => `\`${d}\``).join('、')}` : null,
    '',
    m.description,
    '',
    m.detail || '',
    '',
    '## 安装',
    '',
    '```bash',
    `npm run tcsol -- install ${m.id}`,
    '```',
    '',
    `qiye-app 中按 id \`${m.id}\` 或名称「${m.name}」安装；已安装后随方案仓库发布自动升级，用户数据（${m.data.paths.length ? m.data.paths.map((p) => `\`${p}\``).join('、') : '无本地数据目录'}）不受影响。`,
    '',
    '## 宿主依赖',
    '',
    `本方案代码引用了 ${analysis.host.length} 个宿主模块、${analysis.packages.length} 个 npm 包，明细见 \`origin.json\`。`,
    '',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

let imported = 0;
for (const entry of entries) {
  if (ONLY && !ONLY.has(entry.id)) continue;
  const dir = join(SOLUTIONS_DIR, entry.id);
  const manifestFile = join(dir, 'solution.json');
  const existing = existsSync(manifestFile) ? readJson(manifestFile) : null;

  rmSync(join(dir, 'src'), { recursive: true, force: true });
  rmSync(join(dir, 'resources'), { recursive: true, force: true });

  const largeAssets = [];
  const fileMap = [];
  for (const f of entry.files) {
    const size = statSync(f.abs).size;
    const from = hostLabel(f.abs);
    if (size > MAX_FILE_BYTES) {
      largeAssets.push({ path: f.dest, size, sha256: sha256(readFileSync(f.abs)), origin: from });
      continue;
    }
    const out = join(dir, f.dest);
    mkdirSync(dirname(out), { recursive: true });
    copyFileSync(f.abs, out);
    fileMap.push({ path: f.dest, from });
  }

  const analysis = analyze(entry);
  const manifest = buildManifest(entry, analysis, largeAssets, existing);
  writeJson(manifestFile, manifest);
  writeJson(join(dir, 'origin.json'), {
    $comment: '来源追溯（生成物）：从 qiye-app 复制的文件映射与 import 依赖分析。host = 宿主公共代码（阶段 B 由 @totalclaw/solution-sdk 提供），solutions = 依赖的其他方案。',
    baseline,
    missingSeeds: entry.missing,
    imports: analysis,
    largeAssets,
    files: fileMap,
  });
  if (!existsSync(join(dir, 'README.md'))) writeFileSync(join(dir, 'README.md'), readme(manifest, analysis));
  if (!existsSync(join(dir, 'CHANGELOG.md'))) {
    writeFileSync(
      join(dir, 'CHANGELOG.md'),
      `# ${manifest.name} 更新日志\n\n## ${manifest.version}\n\n- 首次入库：从 qiye-app \`${baseline.branch}\` @ \`${baseline.commit.slice(0, 8)}\` 迁入方案仓库。\n`,
    );
  }
  mkdirSync(join(dir, 'migrations'), { recursive: true });
  if (!existsSync(join(dir, 'migrations', 'README.md'))) {
    writeFileSync(
      join(dir, 'migrations', 'README.md'),
      '# 数据迁移\n\n破坏性数据结构变更时在此新增 `NNN-<name>.mjs`，导出 `{ from, to, up(ctx) }`，并把 solution.json 的 `data.schemaVersion` 提升到 `to`。\n安装器在激活新版本前，按账号快照 `data.paths` 后依次执行。详见仓库 README「数据迁移」。\n',
    );
  }
  imported++;
  const warn = entry.missing.length ? `  缺失 seed: ${entry.missing.join(', ')}` : '';
  console.log(
    `✓ ${entry.id.padEnd(30)} ${String(fileMap.length).padStart(4)} 文件  大文件 ${largeAssets.length}  依赖 ${manifest.dependsOn.join(',') || '-'}${warn}`,
  );
}
console.log(`\n导入 ${imported} 个方案（基线 ${baseline.branch}@${baseline.commit.slice(0, 8)}）`);
