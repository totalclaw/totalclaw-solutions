/**
 * 配置引导 · 电脑配置检测与转写模型推荐：扛得住就推 FireRedASR2（最准，SenseVoice 兜底），内存 / 核数 / 磁盘不够推 SenseVoice 并说明原因。
 */
import { describe, expect, it } from 'vitest';
import { detectHardware, estimateMinPerHour, recommendAsr, type HardwareInfo } from './setupCheck';

const hw = (o: Partial<HardwareInfo>): HardwareInfo => ({ cpu: 'x', cores: 18, memGb: 24, arch: 'arm64', platform: 'darwin', appleSilicon: true, freeDiskGb: 200, ...o });

describe('recommendAsr', () => {
  it('实测那台（18 核 / 24GB Apple 芯片）：FireRedASR2（先装 SenseVoice 兜底），评级好', () => {
    const r = recommendAsr(hw({}));
    expect(r).toMatchObject({ engine: 'firered', installIds: ['asr-meeting-sensevoice', 'asr-meeting-firered2'], tier: 'good', sizeMb: 1406 });
    expect(r.downgradeReason).toBeUndefined();
  });

  it('16GB / 8 核的 Windows 电脑：仍推 FireRedASR2，但更慢', () => {
    const r = recommendAsr(hw({ cores: 8, memGb: 16, appleSilicon: false, platform: 'win32', arch: 'x64' }));
    expect(r.engine).toBe('firered');
    expect(r.estMinPerHour).toBeGreaterThan(recommendAsr(hw({})).estMinPerHour);
  });

  it('内存不到 16GB、核太少、磁盘放不下：推 SenseVoice，带原因', () => {
    expect(recommendAsr(hw({ memGb: 15.8 }))).toMatchObject({ engine: 'sensevoice', installIds: ['asr-meeting-sensevoice'], downgradeReason: 'memory', tier: 'ok' });
    expect(recommendAsr(hw({ memGb: 7.8 }))).toMatchObject({ engine: 'sensevoice', tier: 'weak' });
    expect(recommendAsr(hw({ cores: 4 }))).toMatchObject({ engine: 'sensevoice', downgradeReason: 'cores' });
    expect(recommendAsr(hw({ freeDiskGb: 2 }))).toMatchObject({ engine: 'sensevoice', downgradeReason: 'disk' });
    // 读不到磁盘空间时不因此降级
    expect(recommendAsr(hw({ freeDiskGb: null })).engine).toBe('firered');
  });

  it('SenseVoice 比 FireRedASR2 快得多', () => {
    expect(estimateMinPerHour('sensevoice', hw({})).minutes).toBeLessThan(estimateMinPerHour('firered', hw({})).minutes / 3);
  });
});

describe('detectHardware', () => {
  it('读得到本机的核数、内存和磁盘', () => {
    const h = detectHardware(process.cwd());
    expect(h.cores).toBeGreaterThan(0);
    expect(h.memGb).toBeGreaterThan(0);
    expect(h.freeDiskGb === null || h.freeDiskGb > 0).toBe(true);
    expect(detectHardware('/definitely/not/here').freeDiskGb).toBeNull();
  });
});
