/**
 * TotalClaw 宿主 SDK（hostApi = 1）类型声明 —— 动态方案（runtime.mode = "dynamic"）开发用。
 * 实现在 qiye-app：渲染层 apps/desktop-shell/src/renderer/solutionRuntime/dynamicSolutions.ts，
 * 主进程 apps/desktop-shell/src/main/services/solutionRuntime.ts。
 */
import type * as Vue from 'vue';

export const HOST_API: 1;

// ── 渲染层：runtime.entries.renderer（ESM），export default (sdk) => 组件 ──

export interface SolutionSdkNotify {
  success(msg: string): void;
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

export interface SolutionSdk {
  hostApi: 1;
  /** 本方案 id */
  id: string;
  /** 宿主的 Vue（必须用它，不能自带 vue） */
  vue: typeof Vue;
  /** 宿主多语言：中文原文为 key，没有译文时原样返回 */
  t(text: string, params?: Record<string, unknown>): string;
  /** 调用主进程模块 ctx.handle 注册的 action；失败抛 Error，error.code 见下方错误码 */
  invoke<T = unknown>(action: string, payload?: unknown): Promise<T>;
  /** 订阅主进程 ctx.emit 的事件；返回取消订阅 */
  on(event: string, fn: (payload: unknown) => void): () => void;
  navigate(path: string): void;
  notify: SolutionSdkNotify;
  /** 本方案包内文件的 URL（tc-solution://<id>/<rel>） */
  asset(rel: string): string;
}

export type SolutionRendererEntry = (sdk: SolutionSdk) => Vue.Component | Promise<Vue.Component>;

/** invoke 错误码 */
export type SolutionInvokeErrorCode =
  | 'NOT_READY'
  | 'NOT_INSTALLED'
  | 'NOT_GRANTED'
  | 'NOT_ACTIVE'
  | 'NO_SUCH_ACTION'
  | 'DATA_PATH_DENIED'
  | 'PATH_ESCAPE'
  | 'ACTION_FAILED';

// ── 主进程：runtime.entries.main（CommonJS），module.exports = { hostApi, activate, deactivate } ──

export interface SolutionContext {
  id: string;
  version: string;
  hostApi: 1;
  appVersion: string;
  log: { info(msg: string, data?: unknown): void; warn(msg: string, data?: unknown): void };
  /** 当前账号数据目录下的绝对路径；rel 必须落在 solution.json data.paths 声明的范围内 */
  dataPath(rel: string): string;
  readJson<T = unknown>(rel: string, fallback?: T): T;
  /** 原子写（tmp + rename） */
  writeJson(rel: string, value: unknown): void;
  /** 当前账号的数据结构版本（迁移由宿主在进入方案前完成） */
  dataSchemaVersion(): number;
  /** 方案包内只读文件的绝对路径 */
  packagePath(rel: string): string;
  handle(action: string, fn: (payload: unknown) => unknown | Promise<unknown>): void;
  emit(event: string, payload?: unknown): void;
}

export interface SolutionMainModule {
  hostApi?: 1;
  activate(ctx: SolutionContext): void | Promise<void>;
  /** 热替换 / 卸载前调用：清理定时器、子进程、监听 */
  deactivate?(): void | Promise<void>;
}

// ── 数据迁移：migrations/NNN-<name>.mjs ──

export interface MigrationContext {
  id: string;
  dataRoot: string;
  from: number;
  to: number;
  dataPath(rel: string): string;
  readJson<T = unknown>(rel: string, fallback?: T): T;
  writeJson(rel: string, value: unknown): void;
  log(msg: string): void;
}

export interface SolutionMigration {
  from: number;
  to: number;
  up(ctx: MigrationContext): void | Promise<void>;
}
