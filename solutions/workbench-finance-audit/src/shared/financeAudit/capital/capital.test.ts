/**
 * 批次 7 守卫：投融资与估值 8 个模块可用、41 条斜杠命令都有归属（39 条落到 F1–F8 的快捷操作，2 条在 P4）、
 * 每个模式都有录入定义与引擎、付费数据源与文档库的连接器条目默认关闭且标「需授权」、P5 的每个源端点在数据源目录里有去向。
 */
import { describe, expect, it } from 'vitest';
import { FAU_MODULES, SOURCE_INVENTORY, moduleByCode } from '../catalog';
import { FAU_DATA_SOURCES } from '../dataSources';
import { listConnectorCatalog } from '../../connectorCatalog';
import { CAP_SPECS, capSpec, sourceTag } from './specs';

const CAPITAL = FAU_MODULES.filter((m) => m.group === 'capital');

describe('G6 投融资与估值：目录与命令', () => {
  it('8 个模块全部 ready，同一张卡里、默认折叠的扩展包（package=capital）', () => {
    expect(CAPITAL.map((m) => m.code)).toEqual(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']);
    for (const m of CAPITAL) {
      expect(m.status, m.code).toBe('ready');
      expect(m.package).toBe('capital');
      expect(m.batch).toBe(7);
    }
  });

  it('每个模式都有录入定义；签核级别与设计稿第 5.6 节一致', () => {
    for (const m of CAPITAL) for (const mode of m.modes) expect(capSpec(m.id, mode.id), `${m.code} ${mode.id}`).toBeTruthy();
    expect(Object.keys(CAP_SPECS).sort()).toEqual(CAPITAL.map((m) => m.id).sort());
    const levels = Object.fromEntries(CAPITAL.map((m) => [m.code, m.signoff.levels.join('+')]));
    expect(levels).toEqual({ F1: 'prepare+review', F2: 'prepare+approve', F3: 'prepare+review+approve', F4: 'prepare+review', F5: 'prepare+review+approve', F6: 'prepare+review', F7: 'prepare+review', F8: 'prepare+review' });
  });

  it('41 条斜杠命令都有归属：F 组 39 条是本模块的快捷操作（id = 模式 id），P4 的 2 条归质检', () => {
    const cmds = SOURCE_INVENTORY.items.filter((i) => i.type === 'command');
    expect(cmds).toHaveLength(41);
    const f = cmds.filter((c) => c.module.startsWith('F'));
    expect(f).toHaveLength(39);
    expect(cmds.filter((c) => c.module === 'P4').map((c) => c.name).sort()).toEqual(['/debug-model', '/ppt-template']);
    for (const c of f) {
      const m = moduleByCode(c.module)!;
      const qa = m.quickActions?.find((q) => q.command === c.name);
      expect(qa, `${c.module} ${c.name}`).toBeTruthy();
      expect(m.modes.some((x) => x.id === qa!.id), `${c.name} → ${qa!.id}`).toBe(true);
      expect(c.status).toBe('mapped');
    }
  });

  it('投行、PE、研究、财富、估值的 agent 与子代理全部归到 F 组且已落地（mapped）', () => {
    const items = SOURCE_INVENTORY.items.filter((i) => ['agent', 'subagent', 'hook', 'knowledge', 'scenario-config'].includes(i.type) && i.module.startsWith('F'));
    expect(items.filter((i) => i.type === 'agent').map((i) => i.name).sort()).toEqual(['earnings-reviewer', 'market-researcher', 'meeting-prep-agent', 'model-builder', 'pitch-agent', 'valuation-reviewer']);
    expect(items.filter((i) => i.type === 'subagent')).toHaveLength(18);
    for (const i of items) expect(['mapped', 'imported'], `${i.type} ${i.name}`).toContain(i.status);
    // F 组的源技能全部导入
    for (const s of SOURCE_INVENTORY.items.filter((x) => x.type === 'skill' && x.module.startsWith('F'))) expect(s.status, s.path).toBe('imported');
  });

  it('来源标注：手工 / 上传（文件 + 行号）/ 公开 / 连接器 / 默认值 = 未注明来源', () => {
    expect(sourceTag({ kind: 'manual' }).key).toBe('[手工录入]');
    expect(sourceTag({ kind: 'upload', file: 'a.csv', row: 3 })).toEqual({ key: '[上传: {p0} 第 {n} 行]', params: { p0: 'a.csv', n: 3 } });
    expect(sourceTag({ kind: 'public', url: 'https://x' }).params?.p0).toBe('https://x');
    expect(sourceTag({ kind: 'default' }).key).toBe('[未注明来源]');
    expect(sourceTag(undefined).key).toBe('[未注明来源]');
  });
});

describe('G6 付费数据源与连接器条目', () => {
  const catalog = listConnectorCatalog();
  const PAID = ['daloopa', 'morningstar', 'sp-global', 'factset', 'moodys', 'mtnewswire', 'aiera', 'lseg', 'pitchbook', 'chronograph'];

  it('10 个付费数据源 + egnyte / box / SharePoint 在连接器目录里：远程 https、需授权（OAuth）、审批逐次确认', () => {
    for (const id of [...PAID, 'egnyte', 'box', 'sharepoint']) {
      const e = catalog.find((x) => x.id === id);
      expect(e, id).toBeTruthy();
      expect(e!.transport.kind).toBe('http');
      expect(e!.auth).toBe('oauth');
      expect(e!.approval).toBe('ask');
      expect(e!.description).toContain('需授权');
    }
  });

  it('模块定义里引用的连接器都在目录里', () => {
    for (const m of CAPITAL) for (const c of m.connectors || []) expect(catalog.some((e) => e.id === c), `${m.code} → ${c}`).toBe(true);
  });

  it('P5 的每个源端点、连接器、企业自有服务、M365 部署件都在数据源目录里有去向', () => {
    const names = new Set(FAU_DATA_SOURCES.flatMap((d) => d.sources));
    const p5 = SOURCE_INVENTORY.items.filter((i) => i.module === 'P5' && i.type !== 'engineering');
    expect(p5.length).toBeGreaterThan(80);
    for (const i of p5) expect(names.has(i.name), `${i.type} ${i.name}`).toBe(true);
    for (const d of FAU_DATA_SOURCES) {
      for (const code of d.modules) expect(moduleByCode(code), `${d.id} → ${code}`).toBeTruthy();
      if (d.connectorId) expect(catalog.some((e) => e.id === d.connectorId), d.id).toBe(true);
    }
  });
});
