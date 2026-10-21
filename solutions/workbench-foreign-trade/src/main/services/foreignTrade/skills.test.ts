/**
 * 外贸技能库守卫（docs/foreign-trade-workbench.md「内置技能与连接器」）。
 *
 * resources/bundled-skills/foreign-trade/ 由 scripts/import-foreign-trade-skills.mjs 按
 * scripts/foreign-trade-skill-map.json 生成，这里核对生成结果：格式、许可证与来源说明、产品名与上游项目名、
 * 竞品过滤、安全扫描、模块入口、来源仓库全覆盖，以及工作台与外贸专家角色引用的技能都真实存在。
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { competitorSkillFindingAt } from '@totalclaw/package-hub';
import { FT_MODULE_KEYS } from '@totalclaw/ipc-contracts';
import { scanPackageDirRisk } from '../solutionStudio/riskScan';
import { FT_MODULE_ROLE, FT_MODULE_SKILLS } from '../../../shared/foreignTradeSkills';

const REPO = resolve(__dirname, '../../../../../..');
const ROOT = join(REPO, 'resources/bundled-skills/foreign-trade');
const MAP = JSON.parse(readFileSync(join(REPO, 'scripts/foreign-trade-skill-map.json'), 'utf8')) as {
  modules: Record<string, { label: string }>;
  sources: Record<string, { url: string; commit: string; files: string[] }>;
  targets: Record<string, { self?: boolean; source?: string; module: string; description: string }>;
  reviewed?: Array<{ target: string; file: string; code: string }>;
};
const DIRS = readdirSync(ROOT).filter((n) => statSync(join(ROOT, n)).isDirectory()).sort();
const UPSTREAM = Object.entries(MAP.targets).filter(([, t]) => !t.self).map(([n]) => n);
const MODULES_USED = [...new Set(UPSTREAM.map((n) => MAP.targets[n].module))];
const FORBIDDEN = [/\bClaude\b/i, /\bHermes\b/i, /OpenClaw/i, /Anthropic/i, /\bCowork\b/];
const UPSTREAM_NAMES = /nexscope|gmapsscraper|harvey|superleads|tianji|openext|watchman|yente|smart-?trade|tradepilot|agent-?sdr|b-agent|evoagent|mentarc|kakacells|\balex\b|gosom|osint-agent|lead-hunter|trade-pipeline|fast-builder|comtradeapicall|hscodecomp|marco-?deep/i;

function files(dir: string): Array<{ path: string; size: number }> {
  const out: Array<{ path: string; size: number }> = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push({ path: relative(dir, p), size: statSync(p).size });
    }
  };
  walk(dir);
  return out;
}

function frontmatter(dir: string) {
  const text = readFileSync(join(ROOT, dir, 'SKILL.md'), 'utf8');
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] || '';
  const top = (k: string) => (new RegExp(`^${k}:\\s*(.*)$`, 'm').exec(fm)?.[1] || '').trim().replace(/^"([\s\S]*)"$/, '$1');
  const nested = (k: string) => (new RegExp(`^\\s{4}${k}:\\s*(.*)$`, 'm').exec(fm)?.[1] || '').trim();
  return { text, fm, name: top('name'), description: top('description'), module: nested('module'), priority: nested('priority'), commit: nested('source_commit') };
}

describe('外贸技能库：格式与许可证', () => {
  it('目录正好是映射表的技能 + 每个用到的模块一个入口目录', () => {
    const expected = [...Object.keys(MAP.targets), ...MODULES_USED.map((m) => `ft-${m}-master`)].sort();
    expect(DIRS).toEqual(expected);
  });

  it.each(DIRS)('%s：name / 单行 description / LICENSE 或无许可证说明 / NOTICE.md', (dir) => {
    const f = frontmatter(dir);
    expect(f.name).toBe(dir);
    expect(f.name).toMatch(/^ft-[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(f.fm).toMatch(/^description: ".*"\nversion: /m);
    expect(f.description).toMatch(/[\u4e00-\u9fff].*EN: \S/);
    expect(MAP.modules[f.module], `${dir} module ${f.module}`).toBeTruthy();
    const notice = readFileSync(join(ROOT, dir, 'NOTICE.md'), 'utf8');
    expect(notice).toContain('# 来源与改动说明');
    expect(existsSync(join(ROOT, dir, 'LICENSE')) || notice.includes('来源仓库未附许可证'), dir).toBe(true);
  });

  it.each(UPSTREAM)('%s：正文前有「在本产品中使用」，frontmatter 记了来源仓库提交号', (dir) => {
    const f = frontmatter(dir);
    expect(f.text).toContain('## 在本产品中使用');
    expect(f.commit).toBe(MAP.sources[MAP.targets[dir].source!].commit);
  });

  it('技能名与描述不出现上游项目名', () => {
    for (const dir of DIRS) {
      const f = frontmatter(dir);
      expect(UPSTREAM_NAMES.test(f.name) || UPSTREAM_NAMES.test(f.description), dir).toBe(false);
    }
  });

  it.each(DIRS)('%s：Markdown 里不含被禁的产品名，目录里只有一个 SKILL.md', (dir) => {
    const all = files(join(ROOT, dir));
    expect(all.filter((x) => x.path.endsWith('SKILL.md')).map((x) => x.path)).toEqual(['SKILL.md']);
    // NOTICE.md 照实记录上游路径（如 .claude/skills/…），不查
    for (const x of all.filter((y) => y.path.endsWith('.md') && y.path !== 'NOTICE.md')) {
      const text = readFileSync(join(ROOT, dir, x.path), 'utf8');
      for (const re of FORBIDDEN) expect(re.test(text), `${dir}/${x.path} 命中 ${re}`).toBe(false);
    }
  });

  it.each(DIRS)('%s：不会被技能竞品过滤误删', (dir) => {
    expect(competitorSkillFindingAt(`foreign-trade/${dir}`, join(ROOT, dir))).toBeNull();
  });

  it.each(DIRS)('%s：安全扫描没有高风险文件（可执行文件、下载执行、读浏览器密码等）', (dir) => {
    const report = scanPackageDirRisk(join(ROOT, dir), files(join(ROOT, dir)), 'skill');
    // 文档里的警示语（如「不执行未审阅的 curl | bash」）会被同一条规则命中：人看过的登记在映射表 reviewed，只许是 Markdown
    const reviewed = new Set((MAP.reviewed || []).filter((r) => r.target === dir && r.file.endsWith('.md')).map((r) => `${r.file}#${r.code}`));
    expect(report.findings.filter((x) => x.level === 'high' && !reviewed.has(`${x.file}#${x.code}`))).toEqual([]);
  });

  it('只有 ft-conventions 不标 low（L1 索引只单列它，其余走分类汇总与 -master 入口）', () => {
    for (const dir of DIRS) expect(frontmatter(dir).priority, dir).toBe(dir === 'ft-conventions' ? 'normal' : 'low');
  });

  it('THIRD_PARTY_NOTICES 列出全部来自上游的技能', () => {
    const notices = readFileSync(join(ROOT, 'THIRD_PARTY_NOTICES.md'), 'utf8');
    for (const n of UPSTREAM) expect(notices, n).toContain(`\`${n}\``);
  });

  it('33 个来源仓库都收了东西', () => {
    const used = new Set(UPSTREAM.map((n) => MAP.targets[n].source));
    expect(Object.keys(MAP.sources)).toHaveLength(33);
    expect(Object.keys(MAP.sources).filter((s) => !used.has(s))).toEqual([]);
  });
});

describe('外贸技能库：工作台与专家角色引用', () => {
  it('十个模块都登记了相关技能，第一项是该类入口目录，名字都真实存在', () => {
    for (const key of FT_MODULE_KEYS) {
      const skills = FT_MODULE_SKILLS[key];
      expect(skills.length, key).toBeGreaterThan(0);
      expect(skills[0]).toMatch(/^ft-[a-z]+-master$/);
      for (const s of skills) expect(DIRS, `${key} → ${s}`).toContain(s);
    }
  });

  it('每个模块的外贸专家角色存在，角色 frontmatter 里挂的技能都真实存在', () => {
    const roleFile = (id: string) => {
      const dept = id.startsWith('supply-chain-') ? 'supply-chain' : id.split('-')[0];
      return join(REPO, 'roles/bundled', dept, `${id}.md`);
    };
    for (const id of new Set(Object.values(FT_MODULE_ROLE))) {
      expect(existsSync(roleFile(id)), id).toBe(true);
      const fm = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(roleFile(id), 'utf8'))?.[1] || '';
      const skills = [...(/^skills:\n((?:\s+-\s+.+\n?)+)/m.exec(fm)?.[1] || '').matchAll(/-\s+(\S+)/g)].map((m) => m[1]);
      expect(skills.length, id).toBeGreaterThan(3);
      for (const s of skills) expect(DIRS, `${id} → ${s}`).toContain(s);
    }
  });
});
