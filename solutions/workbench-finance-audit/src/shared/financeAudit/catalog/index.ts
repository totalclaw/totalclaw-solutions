/**
 * 财会审计模块目录（48 个，第 4 节）：主进程与渲染层共用。
 * 每个分组一个文件，各批次只改自己那一组；provenance 由 sourceInventory.json 按模块编号汇总。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauBundle, FauGroup, FauModuleDef, FauModuleInput, FauPackage, FauProvenance } from '@totalclaw/ipc-contracts';
import inventory from '../sourceInventory.json';
import { PLATFORM_MODULES } from './platform';
import { ACCOUNTING_MODULES } from './accounting';
import { AUDIT_MODULES } from './audit';
import { TAX_MODULES } from './tax';
import { FPA_MODULES } from './fpa';
import { TREASURY_MODULES } from './treasury';
import { CAPITAL_MODULES } from './capital';
import type { FauModuleSpec } from './types';

export interface InventoryItem {
  repo: 'financial-services' | 'finance-skills';
  type: string;
  path: string;
  name: string;
  module: string;
  treatment: string;
  target?: string;
  batch: number;
  status: 'imported' | 'pending' | 'mapped';
  note?: string;
}

export const SOURCE_INVENTORY = inventory as unknown as { version: number; sources: Record<string, { url: string; commit: string; license: string }>; items: InventoryItem[] };

function provenanceOf(code: string): FauProvenance[] {
  return SOURCE_INVENTORY.items.filter((i) => i.module === code).map((i) => ({ repo: i.repo, path: i.path, type: i.type }));
}

const SPECS: FauModuleSpec[] = [
  ...PLATFORM_MODULES, ...ACCOUNTING_MODULES, ...AUDIT_MODULES, ...TAX_MODULES,
  ...FPA_MODULES, ...TREASURY_MODULES, ...CAPITAL_MODULES,
];

export const FAU_MODULES: FauModuleDef[] = SPECS.map((s) => ({ ...s, provenance: provenanceOf(s.code) }));

export function moduleById(id: string): FauModuleDef | undefined {
  return FAU_MODULES.find((m) => m.id === id);
}

export function moduleByCode(code: string): FauModuleDef | undefined {
  return FAU_MODULES.find((m) => m.code === code);
}

export const GROUP_LABELS: Record<FauGroup, string> = {
  platform: i18nKey('平台与公共'),
  accounting: i18nKey('会计核算'),
  audit: i18nKey('审计与内控'),
  tax: i18nKey('税务与合规'),
  fpa: i18nKey('财务分析与管理报告'),
  treasury: i18nKey('资金与金融风险'),
  capital: i18nKey('投融资与估值'),
};

export const PACKAGE_LABELS: Record<FauPackage, string> = {
  core: i18nKey('核算与平台'),
  audit: i18nKey('审计与内控'),
  tax: i18nKey('税务与合规'),
  fpa: i18nKey('财务分析与管理报告'),
  treasury: i18nKey('资金与金融风险'),
  capital: i18nKey('投融资扩展包'),
};

/**
 * 默认启用的套餐：全部（2026-10-19 用户拍板）。投融资与估值（capital）在同一张卡里，
 * 首页分组默认折叠、展开即可用，不单独授权；折叠是界面状态，不靠套餐开关。
 */
export const DEFAULT_PACKAGES: FauPackage[] = ['core', 'audit', 'tax', 'fpa', 'treasury', 'capital'];

/** 首页默认折叠的分组 */
export const COLLAPSED_GROUPS: FauGroup[] = ['capital'];

export const BUNDLE_LABELS: Record<FauBundle, string> = {
  all: i18nKey('全量'),
  accounting: i18nKey('核算包'),
  audit: i18nKey('审计包'),
  tax: i18nKey('税务包'),
  fpa: i18nKey('管理报告包'),
  treasury: i18nKey('资金包'),
  capital: i18nKey('投融资扩展包'),
};

/** 套餐（第 4.1 节）：核算包 G0+G1；审计包 G0+G2+A1+A2；税务包 G0+G3+A5；管理报告 G0+G4；资金 G0+G5；投融资 G0+G6 */
export function bundleIncludes(bundle: FauBundle, m: FauModuleDef): boolean {
  if (bundle === 'all' || m.group === 'platform') return true;
  switch (bundle) {
    case 'accounting': return m.group === 'accounting';
    case 'audit': return m.group === 'audit' || m.id === 'close' || m.id === 'recon';
    case 'tax': return m.group === 'tax' || m.id === 'expense';
    case 'fpa': return m.group === 'fpa';
    case 'treasury': return m.group === 'treasury';
    case 'capital': return m.group === 'capital';
    default: return true;
  }
}

/** 某模式下要出现的输入，以及哪些必需 */
export function inputsForMode(m: FauModuleDef, modeId: string): Array<FauModuleInput & { needed: boolean }> {
  return m.inputs
    .filter((i) => !i.modes || i.modes.includes(modeId))
    .map((i) => ({ ...i, needed: i.requiredModes ? i.requiredModes.includes(modeId) : i.required }));
}
