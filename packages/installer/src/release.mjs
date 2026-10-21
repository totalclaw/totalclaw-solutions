// 发布策略：渠道、灰度、兼容、吊销、隔离、账号策略 —— 决定「这台机器此刻该装哪个版本」。
//
// 版本号只负责排序与兼容判断；版本身份是 treeDigest；签名保证来源。本模块在这些之上做选择：
//   候选 = index/<id>.json 的 versions[]（老目录没有 versions 时退化为只有最新版）
//   过滤：未被吊销 → 渠道可见 → 灰度命中（或账号策略强制放行）→ 宿主兼容 → 未被本机隔离 → 账号策略锁定版本
//   取 semver 最高者
import { createHash } from 'node:crypto';
import * as semver from './semver.mjs';

export const CHANNELS = ['stable', 'beta'];

/** 渠道稳定度：数字越小越稳定；订阅 beta 也能看到 stable */
export function channelRank(ch) {
  const i = CHANNELS.indexOf(ch || 'stable');
  return i < 0 ? CHANNELS.length : i;
}

/** 灰度分桶 0–99：同一设备对同一方案版本结果稳定，不同版本重新抽签 */
export function rolloutBucket(deviceId, id, version) {
  const h = createHash('sha256').update(`${deviceId || 'anonymous'}\0${id}\0${version}`).digest();
  return h.readUInt32BE(0) % 100;
}

export const DEFAULT_POLICY = Object.freeze({ channel: 'stable', autoUpdate: true, overrides: {} });

export function normalizePolicy(p) {
  return {
    channel: CHANNELS.includes(p?.channel) ? p.channel : 'stable',
    autoUpdate: p?.autoUpdate !== false,
    overrides: p?.overrides && typeof p.overrides === 'object' ? p.overrides : {},
  };
}

/** 目录条目 → 版本候选列表 */
export function versionsOf(item, detail) {
  if (Array.isArray(detail?.versions) && detail.versions.length) return detail.versions;
  return [
    {
      version: item.version,
      treeDigest: item.treeDigest,
      filesRef: item.filesRef,
      ref: null,
      channel: item.release?.channel || 'stable',
      rollout: item.release?.rollout ?? 100,
      minAppVersion: item.compat?.minAppVersion,
      hostApi: item.compat?.hostApi ?? 1,
    },
  ];
}

export function isRevoked(index, id, version) {
  return (index?.removed || []).some((r) => r.id === id && (!r.versions || r.versions.includes(version)));
}

/** 整个方案被下架（removed 条目没有 versions） */
export function isDelisted(index, id) {
  return (index?.removed || []).some((r) => r.id === id && !r.versions);
}

/**
 * 选出目标版本。
 * @returns {{ target: object|null, skipped: Array<{version:string, reason:string}> }}
 */
export function selectVersion({ item, detail, index, policy, deviceId, appVersion, hostApi, quarantined = [] }) {
  const pol = normalizePolicy(policy);
  const ov = pol.overrides[item.id] || {};
  const skipped = [];
  const ok = [];
  for (const v of versionsOf(item, detail)) {
    const skip = (reason) => skipped.push({ version: v.version, reason });
    if (!semver.valid(v.version)) { skip('BAD_VERSION'); continue; }
    if (isRevoked(index, item.id, v.version)) { skip('REVOKED'); continue; }
    if (ov.pinVersion && v.version !== ov.pinVersion) { skip('POLICY_PIN'); continue; }
    if (!ov.pinVersion && channelRank(v.channel) > channelRank(pol.channel)) { skip('CHANNEL'); continue; }
    const rollout = Number.isFinite(v.rollout) ? v.rollout : 100;
    if (!ov.pinVersion && rollout < 100 && !ov.forceAllowRollout && rolloutBucket(deviceId, item.id, v.version) >= rollout) { skip('ROLLOUT'); continue; }
    if (v.minAppVersion && semver.valid(v.minAppVersion) && semver.valid(appVersion) && semver.lt(appVersion, v.minAppVersion)) { skip('APP_TOO_OLD'); continue; }
    if ((v.hostApi ?? 1) > hostApi) { skip('HOST_API'); continue; }
    if (quarantined.includes(v.version)) { skip('QUARANTINED'); continue; }
    ok.push(v);
  }
  ok.sort((a, b) => semver.compare(b.version, a.version));
  return { target: ok[0] || null, skipped };
}

/**
 * 是否必须更新（忽略本机锁定 / 自动更新开关）：
 *   - 已装版本被吊销（安全问题）
 *   - 已装版本低于 minimumVersion（安全修复的最低版本）
 */
export function forcedReason({ index, item, installedVersion }) {
  if (isRevoked(index, item.id, installedVersion)) return 'REVOKED';
  const min = item.release?.minimumVersion;
  if (min && semver.valid(min) && semver.valid(installedVersion) && semver.lt(installedVersion, min)) return 'MINIMUM_VERSION';
  return null;
}
