/**
 * ERP 只读取数（批次 8，第 8.1 / 8.2 节）。没有真实账套：用本机假的 /v1/erp/* 端点验证——
 *   - 四个 backend（金蝶云星空、用友 U8、畅捷通 T+、精斗云）之外一律拒绝；会静默截断的带上限，拿满即判失败；
 *   - 分页总数大于返回行数、或超过单次上限，同样判失败，不拿部分数据；
 *   - 子账号白名单之外的单据类型被拦；每次取数（成功失败）都进访问审计；
 *   - 整个过程只打到 /v1/erp/query 与 /v1/erp/status，没有任何写接口（守卫）。
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'fau-erp-'));
const audits = vi.hoisted(() => [] as any[]);
vi.mock('../../dataAccessAudit', () => ({ recordDataAccess: (r: any) => { audits.push(r); return true; } }));
vi.mock('../../accountScope', () => ({ accountPath: (...p: string[]) => join(TMP, ...p), devicePath: (...p: string[]) => join(TMP, 'device', ...p), privateRoot: () => TMP }));

import { configureDataSourceGrants } from '../../dataSourceGrants';
import { namedRows, normalizeErpRequest, periodVars, pullErpToCsv } from './erpPull';
import { platformActions } from '../../../ipc/financeAudit/platform.actions';
import { FAU_ERP_MAX_ROWS } from '../../../../shared/financeAudit/dataSources';

const calls: Array<{ method: string; path: string; body: any }> = [];
let reply: (body: any) => any = () => ({ ok: true, data: [] });
let server: Server;
let deps: any;

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : null;
      calls.push({ method: req.method || '', path: req.url || '', body });
      res.setHeader('Content-Type', 'application/json');
      if (req.url === '/v1/erp/status') {
        res.end(JSON.stringify({ enabled: true, default_provider: 'kingdee_cloud', providers: [{ name: 'kingdee_cloud', configured: true }, { name: 'yonyou_u8', configured: false }, { name: 'sap_s4', configured: true }] }));
        return;
      }
      res.end(JSON.stringify(reply(body)));
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  deps = { qiyeApiProc: { getStatus: () => 'ready', getBaseUrl: () => base, getBearerToken: () => 'test-token' } };
});
afterAll(() => { server?.close(); rmSync(TMP, { recursive: true, force: true }); });
afterEach(() => { configureDataSourceGrants({ file: null, currentUser: () => null }); });

describe('ERP 取数请求整理', () => {
  it('只认四个 backend；会截断的带上限；期间占位符代入；非法键丢掉；原始 SQL 不追加上限', () => {
    expect(() => normalizeErpRequest({ provider: 'sap_s4', docType: 'x' })).toThrow();
    expect(() => normalizeErpRequest({ provider: 'kingdee_cloud', docType: '' })).toThrow();
    const k = normalizeErpRequest({ provider: 'kingdee_cloud', docType: 'GL_VOUCHER', period: '2026-09', filters: { filter_string: "FDate>='{from}' and FDate<='{to}'", 'bad key': 1 } });
    expect(k.filters).toEqual({ filter_string: "FDate>='2026-09-01' and FDate<='2026-09-30'", limit: FAU_ERP_MAX_ROWS });
    const u = normalizeErpRequest({ provider: 'yonyou_u8', docType: 'GL_accvouch', period: '2026-02', filters: { _sql: 'SELECT * FROM GL_accvouch WHERE iyear = {year} AND iperiod = {month}' } });
    expect(u.filters).toEqual({ _sql: 'SELECT * FROM GL_accvouch WHERE iyear = 2026 AND iperiod = 2' });
    expect(normalizeErpRequest({ provider: 'changjietong', docType: '/tplus/api/v2/x', filters: {} }).filters).toEqual({});
    expect(periodVars('2025')).toEqual({ year: '2025', month: '12', from: '2025-01-01', to: '2025-12-31' });
    expect(periodVars('2024-02').to).toBe('2024-02-29');
  });

  it('金蝶按 FieldKeys 返回的数组行换成带列名的行', () => {
    const r = namedRows(['0', '1'], [['2026-09-01', 100]] as any, 'FDate, FDEBIT');
    expect(r).toEqual({ columns: ['FDate', 'FDEBIT'], rows: [{ FDate: '2026-09-01', FDEBIT: 100 }] });
  });
});

describe('ERP 取数（本机假端点；真实账套未验证）', () => {
  it('金蝶取数 → CSV（列名按 FieldKeys），审计记一条成功', async () => {
    calls.length = 0; audits.length = 0;
    reply = () => ({ ok: true, provider: 'kingdee_cloud', operation: 'query_documents', data: [['2026-09-03', '记-0001', '6602', 60000, 0], ['2026-09-03', '记-0001', '100201', 0, 60000]], rows: 2 });
    const r = await pullErpToCsv(deps, { provider: 'kingdee_cloud', docType: 'GL_VOUCHER', period: '2026-09', filters: { field_keys: 'FDate,FBillNo,FAccountId,FDEBIT,FCREDIT' } }, join(TMP, 'files'));
    expect(r.rowCount).toBe(2);
    expect(r.columns).toEqual(['FDate', 'FBillNo', 'FAccountId', 'FDEBIT', 'FCREDIT']);
    expect(readFileSync(r.path, 'utf8')).toContain('FDate,FBillNo,FAccountId,FDEBIT,FCREDIT');
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/v1/erp/query', body: { doc_type: 'GL_VOUCHER', provider: 'kingdee_cloud' } });
    expect(calls[0].body.filters.limit).toBe(FAU_ERP_MAX_ROWS);
    expect(audits).toEqual([expect.objectContaining({ action: 'read', source: 'erp:GL_VOUCHER', tool: 'data.erp_query', rowCount: 2, ok: true })]);
  });

  it('截断判失败：拿满上限 / 分页总数大于返回行数 / 不带上限的超过单次上限；审计记失败', async () => {
    audits.length = 0;
    reply = () => ({ ok: true, data: Array.from({ length: FAU_ERP_MAX_ROWS }, (_, i) => [i]), rows: FAU_ERP_MAX_ROWS });
    await expect(pullErpToCsv(deps, { provider: 'kingdee_cloud', docType: 'GL_VOUCHER' }, join(TMP, 'files'))).rejects.toThrow(/截断/);
    reply = () => ({ ok: true, data: { data: [{ a: 1 }, { a: 2 }], total: 10 }, rows: 1 });
    await expect(pullErpToCsv(deps, { provider: 'changjietong', docType: '/tplus/api/v2/receivable/Query' }, join(TMP, 'files'))).rejects.toThrow(/截断/);
    reply = () => ({ ok: true, data: { has_more: true, data: [{ a: 1 }] } });
    await expect(pullErpToCsv(deps, { provider: 'jdy', docType: '/jdy/v2/gl/voucher' }, join(TMP, 'files'))).rejects.toThrow(/截断/);
    reply = () => ({ ok: true, data: Array.from({ length: FAU_ERP_MAX_ROWS + 1 }, (_, i) => ({ id: i })) });
    await expect(pullErpToCsv(deps, { provider: 'jdy', docType: '/jdy/v2/gl/voucher' }, join(TMP, 'files'))).rejects.toThrow(/上限/);
    expect(audits.filter((a) => a.ok === false).length).toBeGreaterThanOrEqual(3);
  });

  it('子账号白名单：没授权的单据类型被拦，且不发请求', async () => {
    const grants = join(TMP, 'grants.json');
    writeFileSync(grants, JSON.stringify({ '13800000000': { '13900000000': ['erp:AR_RECEIVABLE'] } }));
    configureDataSourceGrants({ file: grants, currentUser: () => ({ phone: '13900000000', masterPhone: '13800000000' }) });
    calls.length = 0;
    await expect(pullErpToCsv(deps, { provider: 'kingdee_cloud', docType: 'GL_VOUCHER' }, join(TMP, 'files'))).rejects.toThrow(/没有被授权/);
    expect(calls).toHaveLength(0);
  });

  it('ERP 状态只列本方案支持的 backend；数据服务没就绪时说明原因', async () => {
    const ctx: any = { deps, store: {} };
    const s: any = await platformActions(ctx)['erp.status']({});
    expect(s).toMatchObject({ available: true, enabled: true, defaultProvider: 'kingdee_cloud' });
    expect(s.providers).toEqual([{ id: 'kingdee_cloud', configured: true }, { id: 'yonyou_u8', configured: false }]);
    const down: any = await platformActions({ deps: { qiyeApiProc: { getStatus: () => 'starting' } }, store: {} } as any)['erp.status']({});
    expect(down.available).toBe(false);
    expect(down.reason).toBeTruthy();
  });

  it('守卫：整个过程只打到 status / query，没有任何写接口', () => {
    const paths = new Set(calls.map((c) => c.path));
    for (const p of paths) expect(['/v1/erp/status', '/v1/erp/query']).toContain(p);
    expect(calls.every((c) => c.method === 'GET' || c.path === '/v1/erp/query')).toBe(true);
  });
});
