/**
 * 合规边界守卫（第 9.1 节，写进代码）：财会审计目录里
 *   - 对 /v1/erp/* 的调用只能是 status / providers / configure / query / reconcile 五个端点（不写账、不调 tax/prepare）；
 *   - 不出现税务提交、ERP 写入、付款、自动发送邮件 / IM 的调用；
 *     唯一的受保护例外是 B3 函证（批次 3）：只允许在 audit.actions 里、经人工确认节点（一次性确认令牌核销后）才交给邮件发送；
 *   - 交给模型的提示词不给工具、不提这些动作；
 *   - 产出文书没有「意见段」：文案里不出现「审计意见 / 鉴证意见」这类结论性措辞（「非审计 / 鉴证意见」「不出具审计意见」这类免责声明除外）。
 * 扫的是源码文本，新增文件自动纳入。
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const SHELL = join(__dirname, '..', '..', '..', '..');
const ROOTS = [
  'src/main/services/financeAudit',
  'src/main/ipc/financeAudit',
  'src/main/ipc/financeAudit.ipc.ts',
  'src/shared/financeAudit',
  'src/renderer/workbenches/finance-audit',
  'src/renderer/views/FinanceAuditWorkbenchView.vue',
].map((p) => join(SHELL, p));

function* files(p: string): Generator<string> {
  if (!existsSync(p)) return;
  if (statSync(p).isDirectory()) {
    for (const n of readdirSync(p)) if (n !== '__fixtures__') yield* files(join(p, n));
  } else if (/\.(ts|vue|json)$/.test(p) && !/\.test\.ts$/.test(p)) yield p;
}
/** 受保护的发送例外只在这一个文件里 */
const MAIL_EXCEPTION = 'src/main/ipc/financeAudit/audit.actions.ts';
const SOURCES = ROOTS.flatMap((r) => [...files(r)]).map((f) => ({ f: relative(SHELL, f), text: readFileSync(f, 'utf8') }));

describe('财会审计合规边界', () => {
  it('扫到了源码（路径没写错）', () => {
    expect(SOURCES.length).toBeGreaterThan(30);
  });

  it('/v1/erp/* 只允许五个只读 / 配置端点', () => {
    const allowed = new Set(['status', 'providers', 'configure', 'query', 'reconcile']);
    const bad: string[] = [];
    for (const { f, text } of SOURCES) {
      for (const m of text.matchAll(/\/v1\/erp\/([A-Za-z_/-]+)/g)) {
        if (!allowed.has(m[1].split('/')[0]) || m[1].includes('tax')) bad.push(`${f}: ${m[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('没有税务提交、ERP 写入、付款、自动对外发送的调用', () => {
    const patterns: Array<[string, RegExp]> = [
      ['税务提交', /tax[_/]?submit|submitTax|declareSubmit|tax\/prepare/i],
      ['ERP 写入', /erp[_/.]?(write|post|push)|\/v1\/erp\/write|postVoucher/i],
      ['付款执行', /executePayment|makePayment|payNow|bankTransfer\(/i],
      ['自动发邮件', /sendCaseMail|caseMailSender|nodemailer|relaySendMail|smtp/i],
      ['IM 推送', /imRunLink|sendImMessage|wechat.*send|dingtalk.*send|feishu.*send/i],
      ['浏览器 / 电脑操作', /browserTabs|computerUse|foregroundBrowser|automationExecution/i],
    ];
    const bad: string[] = [];
    for (const { f, text } of SOURCES) {
      for (const [name, re] of patterns) {
        if (name === '自动发邮件' && f === MAIL_EXCEPTION) continue;
        if (re.test(text)) bad.push(`${name}: ${f}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('只允许经人工确认的发送：函证发送只有一处，必须先核销确认令牌', () => {
    const actions = SOURCES.find((s) => s.f === MAIL_EXCEPTION)!.text;
    const send = SOURCES.find((s) => s.f.endsWith('engines/audit/extAudit/send.ts'))!.text;
    const guard = SOURCES.find((s) => s.f.endsWith('engines/audit/extAudit/sendGuard.ts'))!.text;
    // 发邮件的调用只有一次，且写在 sendConfirmed(…令牌…) 的发送回调里
    expect(actions.match(/sendCaseMail\(/g)).toHaveLength(1);
    const at = actions.indexOf('sendCaseMail(');
    const confirmed = actions.lastIndexOf('sendConfirmed(guard, p?.token', at);
    expect(confirmed).toBeGreaterThan(0);
    expect(actions.slice(confirmed, at)).not.toMatch(/\n {4}'[a-z-]+\.[a-z.]+':/);
    // sendConfirmed 先核销令牌、核销不过就抛错，之后才调用发送函数
    expect(send.indexOf('guard.consume(')).toBeGreaterThan(0);
    expect(send.indexOf('guard.consume(')).toBeLessThan(send.indexOf('await sender('));
    expect(send).toMatch(/if \(!ids\) throw/);
    // 令牌一次性、有有效期、绑定运行
    expect(guard).toContain('this.tickets.delete(token)');
    expect(guard).toMatch(/expiresAt <= now \|\| t\.runId !== runId/);
  });

  it('交给模型的提示词：纯补全、不给工具', () => {
    const prompts = SOURCES.filter((s) => s.f.includes('financeAudit/prompts/') || s.f.endsWith('skillRunner.ts'));
    expect(prompts.length).toBeGreaterThanOrEqual(3);
    for (const p of prompts) expect(p.text).not.toMatch(/toolsets?\s*:|tools\s*:\s*\[/);
    const runner = SOURCES.find((s) => s.f.endsWith('skillRunner.ts'))!.text;
    expect(runner).toContain('untrusted_document');
    expect(runner).toContain('No markdown, no tools');
  });

  it('产出文书没有意见段：只允许否定式的免责声明', () => {
    const bad: string[] = [];
    for (const { f, text } of SOURCES.filter((s) => s.f.includes('financeAudit/outputs/') || /financeAudit\/engines\/[a-z]+\/.*output\.ts$/.test(s.f))) {
      for (const m of text.matchAll(/i18nKey\('([^']*(审计意见|鉴证意见|无保留意见|保留意见)[^']*)'\)/g)) {
        // 免责声明（「非审计 / 鉴证意见」「不出具审计意见」）是否定句，允许
        if (!/非审计|不出具/.test(m[1])) bad.push(`${f}: ${m[1]}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
