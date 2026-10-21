/**
 * 在系统浏览器里走电子税务局的开票路径（应用的内置浏览器会被税务局的反爬校验挡成空白页，实测）。
 *
 * 应用只做四件事，其余全部留给人：
 *   1. 打开门户，一步步点进「发票业务 → 蓝字发票开具 → 批量开票」（只点导航入口）；
 *   2. 读页面：登录的是哪家企业、本月可用额度、现在卡在哪（没登录 / 要扫脸 / 认证等级不够）；
 *   3. 把生成好的导入文件放进「选择文件」（等于人手选了这个文件），读回导入后的预览核对张数与金额；
 *   4. 人点完「批量开具」后，读「批量开票记录」按发票流水号回填号码。
 * 「批量开具」「发票开具」这类最终按钮，这里没有任何代码会去点。
 */
import { ETAX_TEXT, SNAPSHOT_SCRIPT, etaxFacts, etaxHomeUrl, etaxPageKind, isChinataxHost, locateScript, parseBatchPreview, parseBatchRecords, parseSnapshot, type BatchRecord, type EtaxFacts, type EtaxPageKind, type EtaxSnapshot } from './etaxPage';
import type { ForegroundTarget, ForegroundTargetOps } from '../foregroundBrowserCdp';

export const ETAX_CONTEXT = 'invoice-agent-etax';

export interface EtaxBrowserDeps {
  cdpUrl: () => Promise<string>;
  list: (cdpUrl: string) => Promise<ForegroundTarget[]>;
  withTarget: <T>(cdpUrl: string, targetId: string, fn: (ops: ForegroundTargetOps) => Promise<T>, timeoutMs?: number) => Promise<T>;
  openTab: (cdpUrl: string, url: string) => Promise<string>;
  sleep?: (ms: number) => Promise<void>;
}

export interface EtaxState extends EtaxFacts {
  /** 浏览器里有没有税务局的页面 */
  opened: boolean;
  url: string;
  /** 这一步为什么停下（给日志与界面看） */
  note: string;
}

export type EtaxGoal = 'portal' | 'blue' | 'batch';

/** 越靠后越接近批量开票页 */
const RANK: Record<EtaxPageKind, number> = { other: 0, login: 1, portal: 1, portal_login: 2, invoice_business: 3, blue: 4, makeout: 4, batch: 5 };

export class EtaxBrowser {
  private readonly sleep: (ms: number) => Promise<void>;
  constructor(private readonly deps: EtaxBrowserDeps) { this.sleep = deps.sleep || ((ms) => new Promise((r) => setTimeout(r, ms))); }

  private async pages(cdp: string): Promise<Array<ForegroundTarget & { kind: EtaxPageKind }>> {
    return (await this.deps.list(cdp)).filter((t) => isChinataxHost(t.url)).map((t) => ({ ...t, kind: etaxPageKind(t.url) }));
  }
  private best(pages: Array<ForegroundTarget & { kind: EtaxPageKind }>): (ForegroundTarget & { kind: EtaxPageKind }) | null {
    return [...pages].sort((a, b) => RANK[b.kind] - RANK[a.kind])[0] || null;
  }
  private async snapshot(cdp: string, targetId: string): Promise<EtaxSnapshot> {
    return this.deps.withTarget(cdp, targetId, async (ops) => parseSnapshot(await ops.evaluate(SNAPSHOT_SCRIPT)));
  }
  private async click(cdp: string, targetId: string, text: string, scope = ''): Promise<boolean> {
    return this.deps.withTarget(cdp, targetId, async (ops) => {
      const raw = await ops.evaluate(locateScript(text, scope));
      if (!raw) return false;
      const p = JSON.parse(String(raw)) as { x: number; y: number };
      await this.sleep(300); // 滚到可见位置后等布局稳定
      const again = await ops.evaluate(locateScript(text, scope));
      const q = again ? JSON.parse(String(again)) as { x: number; y: number } : p;
      await ops.clickAt(q.x, q.y);
      return true;
    });
  }

  /** 打开门户（已有税务局页面就不重复开） */
  async open(province: string): Promise<EtaxState> {
    const cdp = await this.deps.cdpUrl();
    if (!(await this.pages(cdp)).length) { await this.deps.openTab(cdp, etaxHomeUrl(province)); await this.sleep(2500); }
    return this.state();
  }

  async state(note = ''): Promise<EtaxState> {
    const cdp = await this.deps.cdpUrl();
    const cur = this.best(await this.pages(cdp));
    if (!cur) return { opened: false, url: '', kind: 'other', company: '', taxNo: '', quota: null, totalQuota: null, need: 'login', templateVersion: '', note };
    const facts = etaxFacts(await this.snapshot(cdp, cur.targetId));
    return { ...facts, opened: true, url: cur.url, note };
  }

  /**
   * 朝目标页面走，直到到达或者需要人（登录 / 扫脸 / 认证）。每一步只点导航入口。
   * 返回停下时的状态；need 非空就是在等人。
   */
  async advance(goal: EtaxGoal, province: string): Promise<EtaxState> {
    const cdp = await this.deps.cdpUrl();
    const want = goal === 'batch' ? 5 : goal === 'blue' ? 4 : 2;
    for (let step = 0; step < 8; step += 1) {
      let pages = await this.pages(cdp);
      if (!pages.length) { await this.deps.openTab(cdp, etaxHomeUrl(province)); await this.sleep(3000); pages = await this.pages(cdp); }
      const cur = this.best(pages);
      if (!cur) return this.state('no-page');
      const facts = etaxFacts(await this.snapshot(cdp, cur.targetId));
      if (facts.need === 'ack') { await this.click(cdp, cur.targetId, ETAX_TEXT.faceAck, '.t-dialog button, .t-dialog__footer *'); await this.sleep(1500); continue; }
      if (facts.need === 'session') {
        // 数电平台的会话丢了：回门户重新点「发票业务」带会话过去
        const portal = pages.find((p) => p.kind === 'portal_login');
        if (!portal) return { ...facts, opened: true, url: cur.url, note: 'session-lost' };
        await this.deps.withTarget(cdp, cur.targetId, (ops) => ops.navigate('about:blank'));
        await this.click(cdp, portal.targetId, ETAX_TEXT.invoiceBusiness);
        await this.sleep(5000);
        continue;
      }
      if (facts.need) return { ...facts, opened: true, url: cur.url, note: `need-${facts.need}` };
      if (RANK[cur.kind] >= want && !(goal === 'batch' && cur.kind === 'makeout')) return { ...facts, opened: true, url: cur.url, note: 'arrived' };

      const before = pages.length; const beforeUrl = cur.url;
      let clicked = false;
      if (cur.kind === 'portal_login') clicked = await this.click(cdp, cur.targetId, ETAX_TEXT.invoiceBusiness);
      else if (cur.kind === 'invoice_business') clicked = await this.click(cdp, cur.targetId, ETAX_TEXT.blueInvoice, '.page_app_item');
      else if (cur.kind === 'blue') clicked = await this.click(cdp, cur.targetId, ETAX_TEXT.batch, '.invoice-entrance-choose');
      if (!clicked) return { ...facts, opened: true, url: cur.url, note: 'entry-not-found' };
      // 等页面变化：新标签页、地址变了，或者弹出了要人处理的窗口
      let moved = false;
      for (let i = 0; i < 12 && !moved; i += 1) {
        await this.sleep(1000);
        const now = await this.pages(cdp);
        const b = this.best(now);
        if (now.length !== before || (b && b.url !== beforeUrl)) { moved = true; break; }
        if (b && etaxFacts(await this.snapshot(cdp, b.targetId)).need) { moved = true; break; }
      }
      if (!moved) return { ...facts, opened: true, url: cur.url, note: 'no-response' };
      await this.sleep(1500);
    }
    return this.state('too-many-steps');
  }

  private async batchPage(cdp: string): Promise<ForegroundTarget & { kind: EtaxPageKind }> {
    const p = (await this.pages(cdp)).find((x) => x.kind === 'batch');
    if (!p) throw new Error('not-on-batch');
    return p;
  }

  /**
   * 把导入文件放进批量开票页的「选择文件」。只在数电平台的批量开票页上做，放完读回预览表。
   * 这一步等于人选了文件并导入；发票还没有开，要人在页面上点「批量开具」。
   */
  async attach(file: string): Promise<{ attached: boolean; preview: Array<{ serial: string; total: number; buyer: string }>; messages: string[] }> {
    const cdp = await this.deps.cdpUrl();
    const page = await this.batchPage(cdp);
    const ok = await this.deps.withTarget(cdp, page.targetId, async (ops) => { await ops.activate(); return ops.setFiles('.t-upload input[type=file]', [file]); });
    if (!ok) return { attached: false, preview: [], messages: [] };
    let preview: Array<{ serial: string; total: number; buyer: string }> = []; let messages: string[] = [];
    for (let i = 0; i < 15; i += 1) {
      await this.sleep(1200);
      const s = await this.snapshot(cdp, page.targetId);
      preview = parseBatchPreview(s); messages = s.dialogs;
      if (preview.length || messages.length) break;
    }
    return { attached: true, preview, messages };
  }

  /** 读「批量开票记录」（会切到那个页签；只读） */
  async records(): Promise<BatchRecord[]> {
    const cdp = await this.deps.cdpUrl();
    const page = await this.batchPage(cdp);
    await this.click(cdp, page.targetId, ETAX_TEXT.batchRecords, '.t-tabs__nav-item');
    let out: BatchRecord[] = [];
    for (let i = 0; i < 6 && !out.length; i += 1) { await this.sleep(1200); out = parseBatchRecords(await this.snapshot(cdp, page.targetId)); }
    return out;
  }

  /** 读完记录后切回「批量开票」页签 */
  async backToBatchTab(): Promise<void> {
    const cdp = await this.deps.cdpUrl();
    const page = await this.batchPage(cdp);
    await this.click(cdp, page.targetId, ETAX_TEXT.batch, '.t-tabs__nav-item');
  }
}
