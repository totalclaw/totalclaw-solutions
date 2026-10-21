/**
 * 慈善活动内容工场 · 演示素材（随安装包：resources/bundled-solutions/charity-content/demo-materials/）。
 *
 * 「载入演示素材」先把它们复制到用户可写目录 <文稿>/TotalClaw/慈善演示素材/，再按普通素材目录扫描，
 * 产物照常写到该目录下 输出/<时间戳>/。不能直接在安装目录上跑：mac 的 .app 是签名只读的，
 * Windows 可能装在 Program Files，往里写产物要么失败要么破坏签名。
 *
 * 复制幂等：同名同大小的跳过；大小不同（上次复制中断 / 被改坏）的重新复制；用户在该目录里
 * 自己放的其它文件一律不动，也不删除任何东西。单个文件先写 .part 再改名，中途退出不留半截文件。
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import { matchLiteral } from '../../../shared/matchTokens';
import { PREBAKED_REL } from './prebaked';

/** 相对壳资源根（shellResourcesPath）的演示素材目录 */
export const DEMO_MATERIALS_REL = join(PREBAKED_REL, 'demo-materials');
/** 用户目录下的落点名：文件系统路径段，不随界面语言变（否则切语言后历史成品「消失」） */
export const DEMO_MATERIALS_DIR_NAME = matchLiteral('慈善演示素材');
const DEMO_FILE_RE = /\.(jpe?g|png|webp|mp4|mov|m4v|webm|pdf)$/i;

export function demoMaterialsSourceDir(shellResources: string): string {
  return join(shellResources, DEMO_MATERIALS_REL);
}

/** documentsDir = app.getPath('documents')（mac ~/Documents，Windows 文档库，含 OneDrive 重定向） */
export function demoMaterialsTargetDir(documentsDir: string): string {
  return join(documentsDir, 'TotalClaw', DEMO_MATERIALS_DIR_NAME);
}

/** 文章转语音线的工作目录名：同样固定不随界面语言变，否则切语言后历史成品「消失」 */
export const ARTICLE_DIR_NAME = matchLiteral('慈善文章配音');

/**
 * 文章转语音线没有素材目录，产物也得有个固定落点：<文稿>/TotalClaw/慈善文章配音/，
 * 其下照常是 输出/<runId>/。与演示素材分开放，免得两条线的历史混在一个列表里。
 */
export function articleWorkDir(documentsDir: string): string {
  return join(documentsDir, 'TotalClaw', ARTICLE_DIR_NAME);
}

export interface DemoMaterialsResult { dir: string; copied: string[]; skipped: string[] }

export function prepareDemoMaterials(srcDir: string, destDir: string): DemoMaterialsResult {
  const files = existsSync(srcDir)
    ? readdirSync(srcDir).filter((n) => !n.startsWith('.') && DEMO_FILE_RE.test(n)).sort()
    : [];
  if (!files.length) throw new Error(i18nT('安装包里没有演示素材，请重新安装应用，或手动选择素材目录'));
  mkdirSync(destDir, { recursive: true });
  const copied: string[] = [];
  const skipped: string[] = [];
  for (const name of files) {
    const src = join(srcDir, name);
    const dst = join(destDir, name);
    const size = statSync(src).size;
    if (existsSync(dst)) {
      const cur = statSync(dst);
      // 同名目录不是我们放的：不碰（不删用户的东西），这一个素材就不载入
      if (!cur.isFile() || cur.size === size) { skipped.push(name); continue; }
    }
    const part = `${dst}.part`;
    try {
      copyFileSync(src, part);
      renameSync(part, dst);
    } catch (e) {
      try { rmSync(part, { force: true }); } catch { /* 清理失败不掩盖原错误 */ }
      throw e;
    }
    copied.push(name);
  }
  return { dir: destDir, copied, skipped };
}
