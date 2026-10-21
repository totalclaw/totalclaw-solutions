/**
 * 财会审计技能库守卫（docs/finance-audit-solution.md 第 6.6、15 节）。
 *
 * resources/bundled-skills/finance-audit/ 由 scripts/import-finance-audit-skills.mjs 生成，
 * 这里核对生成结果：格式、许可证、产品名、竞品过滤、来源去向、模块归属、批次范围。
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { competitorSkillFindingAt } from '@totalclaw/package-hub';
import { FAU_MODULES, SOURCE_INVENTORY, moduleByCode } from '../../../shared/financeAudit/catalog';

const REPO = resolve(__dirname, '../../../../../..');
const ROOT = join(REPO, 'resources/bundled-skills/finance-audit');
const MAP = JSON.parse(readFileSync(join(REPO, 'scripts/finance-audit-skill-map.json'), 'utf8')) as {
  skills: Array<{ repo: string; path: string; name: string; target: string; treatment: string; module: string; batch: number }>;
  targets: Record<string, { module: string; batch: number; treatment: string }>;
  nonSkillItems: Array<{ module: string }>;
};
const DIRS = readdirSync(ROOT).filter((n) => statSync(join(ROOT, n)).isDirectory()).sort();
const FORBIDDEN = [/\bClaude\b/i, /Cowork/i, /\bHermes\b/i, /OpenClaw/i, /Anthropic/i, /~\/\.hermes/, /\.config\/finance-skills/];

function frontmatter(dir: string): { text: string; fm: string; name: string; description: string; module: string; priority: string } {
  const text = readFileSync(join(ROOT, dir, 'SKILL.md'), 'utf8');
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] || '';
  const top = (k: string) => (new RegExp(`^${k}:\\s*(.*)$`, 'm').exec(fm)?.[1] || '').trim().replace(/^"([\s\S]*)"$/, '$1');
  const nested = (k: string) => (new RegExp(`^\\s{4}${k}:\\s*(.*)$`, 'm').exec(fm)?.[1] || '').trim();
  return { text, fm, name: top('name'), description: top('description'), module: nested('module'), priority: nested('priority') };
}

describe('财会审计技能库：格式与许可证', () => {
  it('目录正好是已导入批次的目标技能（批次 1 的 18 个 + 已合入批次的全部）', () => {
    const batch1 = Object.entries(MAP.targets).filter(([, t]) => t.batch <= 1).map(([k]) => k);
    expect(batch1).toHaveLength(18);
    // 批次并行开发、按序合入：已导入的批次以 sourceInventory 里源技能的状态为准（批次 1 的自建技能没有源条目，固定算上）
    const imported = new Set([1, ...SOURCE_INVENTORY.items.filter((i) => i.type === 'skill' && i.status === 'imported').map((i) => i.batch)]);
    const expected = Object.entries(MAP.targets).filter(([, t]) => imported.has(t.batch)).map(([k]) => k).sort();
    expect(DIRS).toEqual(expected);
  });

  it.each(DIRS)('%s：name / 单行 description / LICENSE / NOTICE.md', (dir) => {
    const f = frontmatter(dir);
    expect(f.name).toBe(dir);
    expect(f.name.startsWith('fa-')).toBe(true);
    expect(f.description.length).toBeGreaterThan(10);
    // 单行：description 行之后紧跟的是下一个字段，不是续行
    expect(f.fm).toMatch(/^description: ".*"\nversion: /m);
    expect(f.description).toMatch(/EN: .+ AR: .+/);
    expect(existsSync(join(ROOT, dir, 'LICENSE'))).toBe(true);
    expect(readFileSync(join(ROOT, dir, 'NOTICE.md'), 'utf8')).toContain('# 来源与改动说明');
    expect(f.text).toContain('## 本地化与地区适配');
    expect(f.text).toContain('## 输出语言与地区');
  });

  it('name 全部唯一', () => {
    const names = DIRS.map((d) => frontmatter(d).name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(DIRS)('%s：正文与 reference 不含被禁的产品名', (dir) => {
    const files = [join(ROOT, dir, 'SKILL.md')];
    const ref = join(ROOT, dir, 'reference');
    if (existsSync(ref)) for (const f of readdirSync(ref)) if (f.endsWith('.md')) files.push(join(ref, f));
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const re of FORBIDDEN) expect(re.test(text), `${file} 命中 ${re}`).toBe(false);
    }
  });

  it.each(DIRS)('%s：不会被技能竞品过滤误删', (dir) => {
    expect(competitorSkillFindingAt(`finance-audit/${dir}`, join(ROOT, dir))).toBeNull();
  });

  it('只有 fa-conventions 不标 low（L1 索引只单列它）', () => {
    for (const dir of DIRS) expect(frontmatter(dir).priority, dir).toBe(dir === 'fa-conventions' ? 'normal' : 'low');
  });

  it('每个 metadata.totalclaw.module 都在模块目录里', () => {
    for (const dir of DIRS) expect(moduleByCode(frontmatter(dir).module), dir).toBeTruthy();
    for (const [name, t] of Object.entries(MAP.targets)) expect(moduleByCode(t.module), name).toBeTruthy();
  });

  it('THIRD_PARTY_NOTICES 列出全部 224 个目标技能（设计稿 222 个 + 阿联酋 2 个地区技能）', () => {
    const names = Object.keys(MAP.targets);
    expect(names).toHaveLength(224);
    const notices = readFileSync(join(ROOT, 'THIRD_PARTY_NOTICES.md'), 'utf8');
    for (const n of names) expect(notices, n).toContain(`\`${n}\``);
  });
});

describe('财会审计技能库：来源去向', () => {
  it('220 个源技能，处理方式与设计稿一致（原样 198 / 合并 16 / 五并一 5 / 改造 1）', () => {
    expect(MAP.skills).toHaveLength(220);
    expect(MAP.skills.filter((s) => s.repo === 'finance-skills')).toHaveLength(157);
    expect(MAP.skills.filter((s) => s.repo === 'financial-services')).toHaveLength(63);
    const count = (t: string) => MAP.skills.filter((s) => s.treatment === t).length;
    expect([count('as-is'), count('merge'), count('merge-5to1'), count('rework')]).toEqual([198, 16, 5, 1]);
  });

  it('sourceInventory 里每个源技能都有去向（目标技能存在于映射表）', () => {
    const skills = SOURCE_INVENTORY.items.filter((i) => i.type === 'skill');
    expect(skills).toHaveLength(220);
    for (const s of skills) {
      expect(s.target, s.path).toBeTruthy();
      expect(MAP.targets[s.target!], s.path).toBeTruthy();
      expect(['as-is', 'merge', 'merge-5to1', 'rework']).toContain(s.treatment);
    }
    // 已导入的源技能，其目标目录必须真实存在
    for (const s of skills.filter((i) => i.status === 'imported')) expect(DIRS, s.path).toContain(s.target);
  });

  it('非技能条目（agent / 子代理 / 命令 / hooks / 知识后端 / 连接器 / 工程件）都有模块归属', () => {
    for (const i of SOURCE_INVENTORY.items) expect(moduleByCode(i.module), `${i.type} ${i.path}`).toBeTruthy();
    const n = (t: string) => SOURCE_INVENTORY.items.filter((i) => i.type === t).length;
    expect([n('agent'), n('subagent'), n('command'), n('hook'), n('knowledge')]).toEqual([10, 30, 41, 4, 99]);
  });

  it('ready 模块的模式里引用的技能目录都存在', () => {
    for (const m of FAU_MODULES.filter((x) => x.status === 'ready')) {
      for (const mode of m.modes) for (const s of mode.skills) expect(existsSync(join(ROOT, s, 'SKILL.md')), `${m.code} ${mode.id} → ${s}`).toBe(true);
    }
  });
});
