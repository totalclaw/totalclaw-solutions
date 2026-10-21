import { describe, it, expect, vi, beforeEach } from 'vitest';
const mocks = vi.hoisted(() => ({ search: vi.fn(), fetchOne: vi.fn(), connect: vi.fn(), logout: vi.fn(), release: vi.fn() }));
vi.mock('electron', () => ({ Notification: class {} }));
vi.mock('imapflow', () => ({ ImapFlow: class {
  search = mocks.search; fetchOne = mocks.fetchOne; connect = mocks.connect; logout = mocks.logout;
  async getMailboxLock() { return { release: mocks.release }; }
} }));
import { ServiceSettlementProc } from './proc';
const record = { period: '2026-09', provider: 'Supplier', email: 'edited@example.com', sentRecipients: 'supplier@example.com', messageId: '<sent@example.com>', sentAt: '2026-09-10T00:00:00Z' };
function setup(configured = true, overrides: Record<string, unknown> = {}) {
  const records = [{ ...record, ...overrides }];
  const store = { get: () => ({ settlement: { records } }), upsertTracking: vi.fn() };
  const proc = new ServiceSettlementProc({ store: store as any, broadcast: vi.fn(), defaultOutputDir: () => '', readEmailCredentials: (): Record<string, string> => configured ? { EMAIL_ADDRESS: 'sender@example.com', EMAIL_PASSWORD: 'test', EMAIL_IMAP_HOST: 'imap.example.com' } : {} });
  return { proc, store, records };
}
beforeEach(() => { vi.resetAllMocks(); mocks.search.mockResolvedValue([]); });
describe('IMAP receipt scan', () => {
  it('reports missing credentials and connection errors instead of successful zero results', async () => {
    await expect(setup(false).proc.scanMailReceipts(true)).rejects.toThrow('IMAP');
    mocks.connect.mockRejectedValue(new Error('authentication failed'));
    await expect(setup().proc.scanMailReceipts(true)).rejects.toThrow('回执扫描失败');
  });
  it('propagates search failure and releases the mailbox lock', async () => {
    mocks.search.mockRejectedValue(new Error('search failed'));
    await expect(setup().proc.scanMailReceipts(true)).rejects.toThrow('search failed');
    expect(mocks.release).toHaveBeenCalled();
    expect(mocks.logout).toHaveBeenCalled();
  });
  it('finds evidence after the first five candidates and uses original recipients and server arrival time', async () => {
    mocks.search.mockResolvedValue([1, 2, 3, 4, 5, 6]);
    mocks.fetchOne.mockImplementation(async (uid: string) => ({
      internalDate: new Date('2026-09-11T01:00:00Z'),
      source: Buffer.from(`From: ${uid === '6' ? 'supplier' : 'stranger'}@example.com\r\nIn-Reply-To: <sent@example.com>\r\nDate: Mon, 1 Jan 2001 00:00:00 +0000\r\nSubject: Re: settlement\r\n\r\nReply`),
    }));
    const { proc, store } = setup();
    expect(await proc.scanMailReceipts(true)).toBe(1);
    expect(store.upsertTracking).toHaveBeenCalledWith('2026-09', 'Supplier', { readAt: '2026-09-11T01:00:00.000Z', repliedAt: '2026-09-11T01:00:00.000Z', receiptEvidenceVersion: 2, readSource: undefined });
    expect(mocks.search.mock.calls[0][0].or).toContainEqual({ body: 'sent@example.com' });
    expect(mocks.fetchOne).toHaveBeenCalledTimes(6);
  });
  it('does not write any reading state when no matching evidence exists', async () => {
    const { proc, store } = setup();
    expect(await proc.scanMailReceipts(true)).toBe(0);
    expect(store.upsertTracking).not.toHaveBeenCalled();
  });
  it('revalidates and removes a legacy unsubstantiated read after a successful scan', async () => {
    const { proc, store } = setup(true, { readAt: '2026-09-10T01:00:00Z', repliedAt: '2026-09-10T01:00:00Z' });
    expect(await proc.scanMailReceipts(true)).toBe(1);
    expect(store.upsertTracking).toHaveBeenCalledWith('2026-09', 'Supplier', { readAt: undefined, repliedAt: undefined, receiptEvidenceVersion: 2, readSource: undefined });
  });
  it('does not remove a verified receipt simply because it was archived out of INBOX', async () => {
    const { proc, store } = setup(true, { readAt: '2026-09-10T01:00:00Z', receiptEvidenceVersion: 2, readSource: undefined });
    expect(await proc.scanMailReceipts(true)).toBe(0);
    expect(store.upsertTracking).not.toHaveBeenCalled();
  });
  it('does not overwrite a new sending round with evidence from an in-flight scan', async () => {
    const { proc, store, records } = setup();
    mocks.search.mockResolvedValue([1]);
    mocks.fetchOne.mockImplementation(async () => {
      records[0].messageId = '<new-round@example.com>';
      return { internalDate: new Date('2026-09-11T01:00:00Z'), source: Buffer.from('From: supplier@example.com\r\nIn-Reply-To: <sent@example.com>\r\nSubject: Re: settlement\r\n\r\nReply') };
    });
    expect(await proc.scanMailReceipts(true)).toBe(0);
    expect(store.upsertTracking).not.toHaveBeenCalled();
  });

  it('reads Seen only from the configured recipient mailbox and records observation time', async () => {
    const { proc, store } = setup(true, { email: 'sender@example.com', sentRecipients: 'sender@example.com', sentAt: '2026-09-11T01:00:01.100Z' });
    mocks.search.mockResolvedValue([1]);
    mocks.fetchOne.mockResolvedValue({ internalDate: new Date('2026-09-11T01:00:00Z'),
      source: Buffer.from('From: original@example.com\r\nMessage-ID: <sent@example.com>\r\nSubject: settlement\r\n\r\nOriginal'),
      envelope: { messageId: '<sent@example.com>', to: [{ address: 'sender@example.com' }] }, flags: new Set(['\\Seen']) });
    const start = Date.now();
    expect(await proc.scanMailReceipts(true)).toBe(1);
    const patch = store.upsertTracking.mock.calls[0][2];
    expect(patch.readSource).toBe('mailbox');
    expect(Date.parse(patch.readAt)).toBeGreaterThanOrEqual(start);
    expect(mocks.search.mock.calls[0][0].or).toContainEqual({ header: { 'message-id': 'sent@example.com' } });
  });

});
