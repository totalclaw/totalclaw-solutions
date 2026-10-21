/**
 * 流程试跑用的内置示例数据（批次 8）：来自各模块单测夹具，金额为最小货币单位整数。
 * 只在流程参数「试跑数据」填 demo 时用（含金标准用例），写在独立的试跑区，不进用户项目。
 * 键 = <模块 id>.<模式 id>。
 */
import type { FauInputKind, FauProjectType, FauRegion, FauStandard } from '@totalclaw/ipc-contracts';
import close from './close.standard.json';
import recon from './recon.bank.json';
import zakat from './tax.sa_zakat.json';

export interface FauSample {
  company: { name: string; regions: FauRegion[]; region: FauRegion; standard: FauStandard; currency: string };
  project: { type: FauProjectType; period: string };
  params: Record<string, unknown>;
  datasets: Array<{ slot: string; kind: FauInputKind; rows: unknown[] }>;
}

export const SAMPLES: Record<string, FauSample> = {
  'close.standard': close as unknown as FauSample,
  'recon.bank': recon as unknown as FauSample,
  'tax.sa_zakat': zakat as unknown as FauSample,
};
