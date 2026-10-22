<template>
  <section class="ss-module">
    <StickyProgress :title="$t('服务费用结案汇总、下发及付款跟踪')" :metas="steps.metas" :runtime="steps.runtime" :current-key="steps.currentKey.value" @jump="scrollToStep" />

    <div class="ss-steps">
      <!-- 第 1 步：读取表格 → 汇总 -->
      <StepCard step-key="summary" :index="0" :title="steps.metas[0].title" :hint="steps.metas[0].hint" :runtime="steps.runtime.summary" :is-current="steps.currentKey.value === 'summary'">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('结算期') }}</span><input v-model="period" type="month" /></label>
        </div>
        <div class="ss-source">
          <div class="ss-subhead">{{ $t('① 工单结算明细表') }}</div>
          <FileDropField :label="$t('工单结算明细 Excel')" :hint="$t('每行一张工单，含服务商与结算金额')" :files="chips(workOrders)" @picked="(p) => addWorkOrders(p)" @remove="(p) => remove(workOrders, p)" />
          <TableMapping v-for="(t, i) in workOrders" :key="t.path + t.sheetName" :table="t" :roles="WO_ROLES" @update="(m) => (workOrders[i].mapping = m)" @sheet="(s) => reloadSheet(workOrders, i, s, WO_ROLES)" />
        </div>
        <div class="ss-source">
          <div class="ss-subhead">{{ $t('② 各项激励及补扣表格（一个费用项一个文件，可多选；激励/补扣按文件名自动判断，可改）') }}</div>
          <FileDropField :label="$t('激励 / 补扣表格 Excel')" :hint="$t('例如：好评激励.xlsx、质量补扣.xlsx、培训费用补扣.xlsx')" :files="chips(feeItems)" @picked="(p) => addFeeItems(p)" @remove="(p) => remove(feeItems, p)" />
          <div v-for="(t, i) in feeItems" :key="t.path + t.sheetName" class="ss-fee">
            <div class="ss-rule-row">
              <span class="lbl">{{ $t('费用项名称（作为服务商附件里的子表名）') }}</span>
              <input v-model="t.name" type="text" style="width: 220px; text-align: left;" />
              <select v-model.number="t.sign"><option :value="1">{{ $t('激励（+）') }}</option><option :value="-1">{{ $t('补扣（−）') }}</option></select>
            </div>
            <TableMapping :table="t" :roles="FEE_ROLES" @update="(m) => (feeItems[i].mapping = m)" @sheet="(s) => reloadSheet(feeItems, i, s, FEE_ROLES)" />
          </div>
        </div>
        <div class="ss-actions">
          <!-- 没有工单结算明细也能先把激励 / 补扣项汇总（客户 7 月的结案包里就没有工单表） -->
          <button type="button" class="ss-btn primary" :disabled="(!workOrders.length && !feeItems.length) || steps.isRunning()" @click="runSummary">
            <i :class="steps.runtime.summary.state === 'running' ? 'ri-loader-4-line spin' : 'ri-table-line'"></i>{{ $t('生成服务商结算总汇总表') }}
          </button>
          <template v-if="summary">
            <button type="button" class="ss-btn" @click="openPath(summaryPath)"><i class="ri-file-excel-2-line"></i>{{ $t('打开汇总表') }}</button>
          </template>
        </div>
        <template v-if="summary">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('服务商数') }}</small><strong>{{ summary.totals.providerCount }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('工单结算金额') }}</small><strong>¥{{ fmtMoney(summary.totals.workOrderAmount) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('激励合计') }}</small><strong>¥{{ fmtMoney(summary.totals.incentiveTotal) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('补扣合计') }}</small><strong>¥{{ fmtMoney(summary.totals.deductionTotal) }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('应付合计') }}</small><strong>¥{{ fmtMoney(summary.totals.netTotal) }}</strong></div>
          </div>
          <p v-for="w in summary.warnings" :key="w" class="ss-note warn"><i class="ri-alert-line"></i>{{ w }}</p>
        </template>
      </StepCard>

      <!-- 第 2 步：拆分 -->
      <StepCard step-key="split" :index="1" :title="steps.metas[1].title" :hint="steps.metas[1].hint" :runtime="steps.runtime.split" :is-current="steps.currentKey.value === 'split'">
        <p class="ss-note"><i class="ri-information-line"></i>{{ $t('生成汇总表时已经同步拆好：每家服务商一个 Excel，文件名 = 服务商名称，里面的子表 = 工单结算明细 + 每个费用项（子表名 = 费用项名）。') }}</p>
        <div v-if="splitFiles.length" class="ss-table-wrap" style="max-height: 300px; overflow: auto;">
          <table class="ss-table">
            <thead><tr><th>{{ $t('服务商') }}</th><th>{{ $t('文件') }}</th><th>{{ $t('子表') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="f in splitFiles" :key="f.provider">
                <td>{{ f.provider }}</td><td><code>{{ baseName(f.path) }}</code></td><td>{{ f.sheets.join(' · ') }}</td>
                <td><button type="button" class="ss-link" @click="openPath(f.path)">{{ $t('打开') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="!splitDir" @click="openPath(splitDir)"><i class="ri-folder-open-line"></i>{{ $t('打开拆分文件夹') }}</button>
          <button type="button" class="ss-btn primary" :disabled="!splitFiles.length || steps.isRunning()" @click="confirmSplit"><i class="ri-check-line"></i>{{ $t('拆分没问题，去下发') }}</button>
        </div>
      </StepCard>

      <!-- 第 3 步：邮件下发 + 已读打标 -->
      <StepCard step-key="send" :index="2" :title="steps.metas[2].title" :hint="steps.metas[2].hint" :runtime="steps.runtime.send" :is-current="steps.currentKey.value === 'send'">
        <p v-if="!email.smtpConfigured && !email.officialRelay" class="ss-note danger"><i class="ri-mail-close-line"></i>{{ $t('还没配置发信邮箱：请到「设置 · 邮件」填邮箱地址、授权码与 SMTP 服务器，或登录后使用官方代发。') }}</p>
        <p v-else-if="!email.smtpConfigured" class="ss-note warn"><i class="ri-mail-send-line"></i>{{ $t('未配置自己的 SMTP，将用 TotalClaw 官方代发（发件人不是你的邮箱，已读回执不可用）。建议到「设置 · 邮件」配置。') }}</p>
        <p v-else class="ss-note ok"><i class="ri-mail-check-line"></i>{{ $t('发件邮箱：{addr}；已读回执已开启（对方邮件客户端同意回执时会自动打「已读」）。', { addr: email.address }) }}</p>
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('邮件主题（可用 {provider} {period} {payable}）', TEMPLATE_VAR_LABELS) }}</span><input v-model="mailSubject" type="text" /></label>
        </div>
        <label class="ss-field"><span>{{ $t('邮件正文') }}</span><textarea v-model="mailBody"></textarea></label>
        <div class="ss-subhead">{{ $t('收件人（服务商邮箱，多个用逗号隔开；填好后自动记住，下个月不用再填）') }}</div>
        <div class="ss-table-wrap" style="max-height: 320px; overflow: auto;">
          <table class="ss-table">
            <thead><tr><th></th><th>{{ $t('服务商') }}</th><th class="num">{{ $t('应付合计') }}</th><th>{{ $t('邮箱') }}</th><th>{{ $t('附件') }}</th><th>{{ $t('发送状态') }}</th><th>{{ $t('阅读状态') }}</th></tr></thead>
            <tbody>
              <tr v-for="r in periodRecords" :key="r.provider" :class="{ bad: r.sendError }">
                <td><input v-model="selected[r.provider]" type="checkbox" /></td>
                <td>{{ r.provider }}</td>
                <td class="num">{{ fmtMoney(r.netTotal) }}</td>
                <td><input :value="r.email || ''" type="text" style="min-width: 220px" :placeholder="$t('多个邮箱用逗号隔开')" @change="saveEmail(r.provider, ($event.target as HTMLInputElement).value)" /></td>
                <td><button v-if="r.attachmentPath" type="button" class="ss-link" @click="openPath(r.attachmentPath)">{{ baseName(r.attachmentPath) }}</button></td>
                <td>
                  <span v-if="r.sentAt" class="ss-chip ok">{{ $t('已发送') }} {{ fmtDateTime(r.sentAt) }}</span>
                  <span v-else-if="r.sendError" class="ss-chip bad" :title="r.sendError">{{ $t('失败') }}</span>
                  <span v-else class="ss-chip">{{ $t('未发送') }}</span>
                  <span v-if="r.resendCount" class="ss-chip warn" :title="fmtDateTime(r.resentAt)">{{ $t('未获阅读确认，已重发 {n} 次', { n: r.resendCount }) }}</span>
                </td>
                <td>
                  <span class="ss-chip" :class="readChipClass(r)">{{ readLabel(r) }}</span>
                  <span v-if="r.nudgeCount" class="ss-chip warn" :title="fmtDateTime(r.nudgedAt)">{{ $t('已催办 {n} 次', { n: r.nudgeCount }) }}</span>
                  <button v-if="r.sentAt && !r.invoiceReceivedAt" type="button" class="ss-btn sm ghost" :disabled="nudging === r.provider" :title="$t('按催办模板再发一封，挂在原邮件下')" @click="nudge(r.provider)">
                    <i :class="nudging === r.provider ? 'ri-loader-4-line spin' : 'ri-alarm-warning-line'"></i>{{ $t('催办') }}
                  </button>
                </td>
              </tr>
              <tr v-if="!periodRecords.length"><td colspan="7" class="ss-muted">{{ $t('先在第 1 步生成汇总表') }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ss-rule-row">
          <label class="ss-switch"><input v-model="followUp.enabled" type="checkbox" @change="saveFollowUp" /><span>{{ $t('自动跟进') }}</span></label>
          <span class="lbl">{{ $t('发出后未获阅读确认满') }}</span>
          <input v-model.number="followUp.days" type="number" min="1" max="60" :disabled="!followUp.enabled" @change="saveFollowUp" />
          <span class="lbl">{{ $t('天 → 自动重发原邮件；已读后同样天数仍未收到发票 → 自动发催办邮件（各最多 3 轮，收到发票即停）') }}</span>
          <button type="button" class="ss-btn sm ghost" @click="showNudgeTpl = !showNudgeTpl"><i class="ri-edit-line"></i>{{ showNudgeTpl ? $t('收起催办模板') : $t('编辑催办模板') }}</button>
        </div>
        <div v-if="showNudgeTpl" class="ss-grid">
          <label class="ss-field"><span>{{ $t('催办主题（可用 {provider} {period} {payable} {sentDate}）', TEMPLATE_VAR_LABELS) }}</span><input v-model="nudgeSubject" type="text" @change="saveNudgeTemplate" /></label>
          <label class="ss-field"><span>{{ $t('催办正文') }}</span><textarea v-model="nudgeBody" @change="saveNudgeTemplate"></textarea></label>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn ghost sm" @click="toggleAll(true)">{{ $t('全选') }}</button>
          <button type="button" class="ss-btn ghost sm" @click="toggleAll(false)">{{ $t('全不选') }}</button>
          <button type="button" class="ss-btn ghost sm" @click="importContacts"><i class="ri-contacts-book-line"></i>{{ $t('从 Excel 导入服务商邮箱') }}</button>
          <span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="!selectedProviders.length || steps.isRunning() || (!email.smtpConfigured && !email.officialRelay)" @click="send">
            <i :class="steps.runtime.send.state === 'running' ? 'ri-loader-4-line spin' : 'ri-mail-send-line'"></i>{{ $t('发送给选中的 {n} 家服务商', { n: selectedProviders.length }) }}
          </button>
          <button type="button" class="ss-btn" :disabled="steps.isRunning()" @click="scanNow"><i class="ri-refresh-line"></i>{{ $t('刷新已读 / 回信状态') }}</button>
        </div>
        <div v-if="sendOutcomes.length" class="ss-note" :class="sendOutcomes.every((o) => o.ok) ? 'ok' : 'warn'">
          <i class="ri-mail-check-line"></i>
          <span>{{ $t('本次发送：成功 {a}，失败 {b}。', { a: sendOutcomes.filter((o) => o.ok).length, b: sendOutcomes.filter((o) => !o.ok).length }) }}
            <template v-for="o in sendOutcomes.filter((x) => !x.ok)" :key="o.provider">{{ $t('{p0}：{p1}；', { p0: o.provider, p1: o.message }) }}</template></span>
        </div>
      </StepCard>

      <!-- 第 4 步：发票监听与归档 -->
      <StepCard step-key="invoice" :index="3" :title="steps.metas[3].title" :hint="steps.metas[3].hint" :runtime="steps.runtime.invoice" :is-current="steps.currentKey.value === 'invoice'">
        <p class="ss-note" :class="email.imapConfigured ? 'ok' : 'warn'">
          <i :class="email.imapConfigured ? 'ri-inbox-line' : 'ri-inbox-unarchive-line'"></i>
          <span v-if="email.imapConfigured">{{ $t('邮箱收件监听已开启（每分钟自动收取）；企微回传经「收件箱」同一落点。服务商回传的发票附件会自动下载并按命名规则归档。') }}</span>
          <span v-else>{{ $t('邮箱未配置 IMAP 收件服务器，收不到邮件回传的发票。到「设置 · 邮件」补 IMAP 服务器与端口（常见 993）；也可以把发票文件直接拖到下面对应服务商那一行。') }}</span>
        </p>
        <div class="ss-rule-row">
          <span class="lbl">{{ $t('发票文件命名规则') }}</span>
          <input v-model="invoiceTemplate" type="text" style="width: 300px; text-align: left;" @change="saveTemplate" />
          <span class="lbl">{{ $t('可用占位：') }}</span>
          <button v-for="ph in INVOICE_TOKENS" :key="ph" type="button" class="ss-chip brand" @click="invoiceTemplate += ph; saveTemplate()">{{ ph }}</button>
          <span class="ss-muted">{{ $t('示例：{ex}', { ex: exampleInvoiceName }) }}</span>
        </div>
        <div class="ss-table-wrap" style="max-height: 340px; overflow: auto;">
          <table class="ss-table">
            <thead><tr><th>{{ $t('服务商') }}</th><th>{{ $t('下发') }}</th><th>{{ $t('发票接收') }}</th><th>{{ $t('发票文件') }}</th><th>{{ $t('手工归档') }}</th></tr></thead>
            <tbody>
              <tr v-for="r in periodRecords" :key="r.provider" :class="{ bad: flagOf(r).invoiceOverdue }" @dragover.prevent @drop.prevent="(ev) => dropInvoice(r.provider, ev)">
                <td>{{ r.provider }}</td>
                <td>{{ r.sentAt ? fmtDate(r.sentAt) : $t('未下发') }}</td>
                <td>
                  <span v-if="r.invoiceReceivedAt" class="ss-chip ok">{{ fmtDate(r.invoiceReceivedAt) }}</span>
                  <span v-else-if="flagOf(r).invoiceOverdue" class="ss-chip bad">{{ $t('⚠ 超 20 天未开票') }}</span>
                  <span v-else-if="r.sentAt" class="ss-chip warn">{{ $t('等待开票 {d} 天', { d: flagOf(r).daysSinceSent ?? 0 }) }}</span>
                  <span v-else class="ss-chip">-</span>
                </td>
                <td>
                  <template v-if="r.invoiceFiles?.length">
                    <button v-for="f in r.invoiceFiles" :key="f" type="button" class="ss-link" style="margin-inline-end: 8px" @click="openPath(f)">{{ baseName(f) }}</button>
                  </template>
                  <span v-else class="ss-muted">{{ $t('（拖发票文件到这一行）') }}</span>
                </td>
                <td><button type="button" class="ss-btn sm ghost" @click="pickInvoice(r.provider)"><i class="ri-upload-2-line"></i>{{ $t('选择发票文件') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="steps.isRunning()" @click="scanInvoices"><i :class="steps.runtime.invoice.state === 'running' ? 'ri-loader-4-line spin' : 'ri-mail-download-line'"></i>{{ $t('立即收取并扫描发票') }}</button>
          <button type="button" class="ss-btn" @click="openPath(invoiceDir)"><i class="ri-folder-open-line"></i>{{ $t('打开发票归档文件夹') }}</button>
          <span class="ss-muted">{{ $t('上次扫描：{t}', { t: props.state?.settlement?.lastScanAt ? fmtDateTime(props.state.settlement.lastScanAt) : $t('尚未') }) }}</span>
        </div>
      </StepCard>

      <!-- 第 5 步：核销与付款跟踪 -->
      <StepCard step-key="track" :index="4" :title="steps.metas[4].title" :hint="steps.metas[4].hint" :runtime="steps.runtime.track" :is-current="steps.currentKey.value === 'track'">
        <div class="ss-rule-row">
          <span class="lbl">{{ $t('费控系统网址') }}</span>
          <input v-model="expenseUrl" type="text" style="width: 320px; text-align: left;" :placeholder="$t('例如 https://fk.company.com')" @change="saveExpenseUrl" />
          <button type="button" class="ss-btn sm" :disabled="!expenseUrl" @click="openExpenseSystem"><i class="ri-external-link-line"></i>{{ $t('打开费控系统（记住登录）') }}</button>
          <button type="button" class="ss-btn sm ghost" @click="importWriteback"><i class="ri-file-upload-line"></i>{{ $t('从费控系统导出表回写核销状态') }}</button>
        </div>
        <p class="ss-note"><i class="ri-information-line"></i>{{ $t('发票收到后 3 天内没有发起核销会提醒；核销流程完成后记录结束时间作为付款时间；下发超 20 天未开票会在汇总表标预警。下面每行可直接点日期登记，或用费控导出表批量回写。') }}</p>
        <div class="ss-table-wrap" style="max-height: 380px; overflow: auto;">
          <table class="ss-table">
            <thead><tr><th>{{ $t('服务商') }}</th><th class="num">{{ $t('应付') }}</th><th>{{ $t('阶段') }}</th><th>{{ $t('发票接收') }}</th><th>{{ $t('核销发起') }}</th><th>{{ $t('付款时间（核销结束）') }}</th><th>{{ $t('提醒 / 预警') }}</th></tr></thead>
            <tbody>
              <tr v-for="r in periodRecords" :key="r.provider" :class="{ bad: flagOf(r).invoiceOverdue || flagOf(r).writeoffReminderDue }">
                <td>{{ r.provider }}</td>
                <td class="num">{{ fmtMoney(r.netTotal) }}</td>
                <td><span class="ss-chip" :class="stageClass(flagOf(r).stage)">{{ stageLabel(flagOf(r).stage) }}</span></td>
                <td><input type="date" :value="toDateInput(r.invoiceReceivedAt)" @change="track(r.provider, 'invoiceReceivedAt', ($event.target as HTMLInputElement).value)" /></td>
                <td><input type="date" :value="toDateInput(r.writeoffStartedAt)" @change="track(r.provider, 'writeoffStartedAt', ($event.target as HTMLInputElement).value)" /></td>
                <td><input type="date" :value="toDateInput(r.writeoffCompletedAt)" @change="track(r.provider, 'writeoffCompletedAt', ($event.target as HTMLInputElement).value)" /></td>
                <td>
                  <span v-if="flagOf(r).writeoffReminderDue" class="ss-chip bad">{{ $t('发票已到 3 天未核销') }}</span>
                  <span v-if="flagOf(r).invoiceOverdue" class="ss-chip bad">{{ $t('超 20 天未开票') }}</span>
                  <span v-if="flagOf(r).paid" class="ss-chip ok">{{ $t('已付款') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ss-rule-row">
          <label class="ss-switch"><input v-model="unpaidReport.enabled" type="checkbox" @change="saveUnpaidReport" /><span>{{ $t('定期输出未完成付款报表') }}</span></label>
          <span class="lbl">{{ $t('每周') }}</span>
          <select v-model.number="unpaidReport.weekday" @change="saveUnpaidReport"><option v-for="(w, i) in WEEKDAYS" :key="i" :value="i">{{ w }}</option></select>
          <input v-model.number="unpaidReport.hour" type="number" min="0" max="23" @change="saveUnpaidReport" /><span class="lbl">{{ $t('点') }}</span>
          <span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="steps.isRunning()" @click="exportReport"><i class="ri-file-chart-line"></i>{{ $t('现在输出未完成付款报表') }}</button>
        </div>
        <div v-if="reportPaths" class="ss-file-out"><i class="ri-file-excel-2-line"></i><code>{{ reportPaths.unpaidPath }}</code><button type="button" class="ss-link" @click="openPath(reportPaths.unpaidPath)">{{ $t('打开') }}</button><button type="button" class="ss-link" @click="openPath(reportPaths.trackingPath)">{{ $t('打开付款跟踪表') }}</button></div>
      </StepCard>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 模块二 · 服务费用结案汇总、下发及付款跟踪。
 * 汇总 → 拆分（同步产出）→ 邮件下发 + 已读打标 → 发票监听归档 → 核销/付款跟踪与定期报表。
 */
import { computed, reactive, ref, watch } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { i18n, t as i18nT } from '../../i18n';
import { templateToken, normalizeTemplateTokens, VAR } from '../../../main/services/serviceSettlement/templateTokens';
import StepCard from './StepCard.vue';
import DK from './dataKeywords.json';
import FileDropField from './FileDropField.vue';
import TableMapping from './TableMapping.vue';
import StickyProgress from './StickyProgress.vue';
import {
  api, useSteps, scrollToStep, inspectTable, fmtMoney, fmtDate, fmtDateTime, openPath, currentPeriod, errorMessage, pickFiles,
  droppedPaths, INVOICE_RE, openEmbeddedBrowser, type PickedTable,
} from './shared';

/** 模板变量名按当前界面语言显示（{服务商} / {Provider} / …；主进程三种写法都认），经参数传入 $t */
const uiLocale = (): string => String((i18n.global.locale as any)?.value ?? i18n.global.locale);
const tok = (zh: string): string => templateToken(zh, uiLocale());
const TEMPLATE_VAR_LABELS = computed(() => ({ provider: tok(VAR.provider), period: tok(VAR.period), payable: tok(VAR.payable), sentDate: tok(VAR.sentDate) }));
const INVOICE_TOKENS = computed(() => [VAR.provider, VAR.period, VAR.seq, VAR.date, VAR.originalName].map(tok));

const props = defineProps<{ state: any; email: any; trackingFlags: Record<string, any>; dir?: string }>();
const emit = defineEmits<{ (e: 'refresh'): void }>();
const notif = useNotificationStore();

const steps = useSteps([
  { key: 'summary', title: i18nT('读取表格并生成结算总汇总表'), hint: i18nT('工单结算明细 + 各项激励 / 补扣表 → 服务商结算总汇总表') },
  { key: 'split', title: i18nT('按服务商拆分附件'), hint: i18nT('每家一个 Excel，文件名 = 服务商，子表 = 各补扣费用') },
  { key: 'send', title: i18nT('邮件下发并记录已读状态'), hint: i18nT('逐家发送到服务商邮箱（可多个），回执 / 回信自动打「已读」；未获阅读确认 N 天自动重发、已读 N 天未开票自动催办') },
  { key: 'invoice', title: i18nT('监听发票回传并归档'), hint: i18nT('邮箱 / 企微回传发票 → 自动下载 → 按规则重命名') },
  { key: 'track', title: i18nT('核销提醒、付款回写与未付款报表'), hint: i18nT('3 天未核销提醒 · 核销结束 = 付款时间 · 20 天未开票预警 · 定期报表') },
]);

const WO_ROLES = [{ key: 'provider', required: true }, { key: 'amount', required: true, label: i18nT('结算金额') }, { key: 'orderNo' }];
const FEE_ROLES = [{ key: 'provider', required: true }, { key: 'amount', required: true, label: i18nT('金额') }];
const WEEKDAYS = [i18nT('周日'), i18nT('周一'), i18nT('周二'), i18nT('周三'), i18nT('周四'), i18nT('周五'), i18nT('周六')];

const period = ref<string>(props.state?.settlement?.period || currentPeriod());
const workOrders = reactive<PickedTable[]>([]);
type FeeTable = PickedTable & { name: string; sign: 1 | -1 };
const feeItems = reactive<FeeTable[]>([]);

const chips = (list: PickedTable[]) => list.map((t) => ({ path: t.path, name: t.fileName, note: i18nT('{n} 行', { n: t.rowCount }) }));
const baseName = (p?: string) => (p || '').split(/[\\/]/).pop() || '';

async function addWorkOrders(paths: string[]): Promise<void> {
  for (const p of paths) {
    if (workOrders.some((t) => t.path === p)) continue;
    try { workOrders.push(await inspectTable(p, WO_ROLES.map((r) => r.key))); } catch (e) { notif.error(errorMessage(e)); }
  }
}
// 客户把所有调整项都叫「已录补扣-xxx」（补 = 加、扣 = 减）：文件名含 激励/补贴/奖励/返利/减免/核销 的是加项。
// 与主进程 settlementSummary.guessFeeSign 同口径。
function guessSign(name: string): 1 | -1 {
  const n = name.replace(/^已录补扣[-—_ ]*/, '');
  if (/激励|补贴|奖励|返利|返点|减免|核销|补发|奖金/.test(n)) return 1;
  return /补扣|扣款|扣罚|罚款|扣除|考核扣|违约|赔付|扣减/.test(n) ? -1 : 1;
}
async function addFeeItems(paths: string[]): Promise<void> {
  for (const p of paths) {
    if (feeItems.some((t) => t.path === p)) continue;
    try {
      // 多 sheet 时优先「xx-外发」页（客户外发版本），没有再取第一页
      const t = await inspectTable(p, FEE_ROLES.map((r) => r.key), undefined, DK.feeSheetPrefer);
      const name = t.fileName.replace(/\.(xlsx|xls|xlsm|csv)$/i, '').replace(/^已录补扣[-—_ ]*/, '').replace(/^\d{4}[-_.]?\d{1,2}[-_.]?/, '').slice(0, 31);
      feeItems.push({ ...t, name, sign: guessSign(name) });
    } catch (e) { notif.error(errorMessage(e)); }
  }
}
function remove(list: PickedTable[], path: string): void {
  const i = list.findIndex((t) => t.path === path);
  if (i >= 0) list.splice(i, 1);
}
async function reloadSheet(list: PickedTable[], index: number, sheetName: string, roles: { key: string }[]): Promise<void> {
  const old = list[index] as FeeTable;
  try {
    const t = await inspectTable(old.path, roles.map((r) => r.key), sheetName);
    list[index] = { ...t, ...(old.name ? { name: old.name, sign: old.sign } : {}) } as any;
  } catch (e) { notif.error(errorMessage(e)); }
}

const summary = ref<any>(null);
const summaryPath = ref('');
const splitDir = ref(props.state?.settlement?.lastSplitDir || '');
const splitFiles = ref<{ provider: string; path: string; sheets: string[] }[]>([]);
const records = ref<any[]>(props.state?.settlement?.records || []);
watch(() => props.state?.settlement?.records, (v) => { if (Array.isArray(v)) records.value = v; });
const periodRecords = computed(() => records.value.filter((r) => r.period === period.value).sort((a, b) => a.provider.localeCompare(b.provider, 'zh-CN')));
const flagOf = (r: any) => props.trackingFlags?.[`${r.period}|${r.provider}`] || evalLocal(r);
function evalLocal(r: any) {
  const now = Date.now();
  const days = (iso?: string) => (iso ? Math.floor((now - Date.parse(iso)) / 86400000) : undefined);
  const ds = days(r.sentAt); const di = days(r.invoiceReceivedAt);
  const paid = Boolean(r.writeoffCompletedAt);
  return {
    paid, daysSinceSent: ds, daysSinceInvoice: di,
    invoiceOverdue: Boolean(r.sentAt) && !r.invoiceReceivedAt && (ds ?? 0) >= 20,
    writeoffReminderDue: Boolean(r.invoiceReceivedAt) && !r.writeoffStartedAt && (di ?? 0) >= 3,
    stage: paid ? 'paid' : r.writeoffStartedAt ? 'writeoff_in_progress' : r.invoiceReceivedAt ? 'awaiting_writeoff' : r.sentAt ? 'awaiting_invoice' : 'unsent',
    readState: r.repliedAt ? 'replied' : r.readAt ? 'read' : r.sentAt ? 'sent' : r.sendError ? 'failed' : 'unsent',
  };
}

/** 演示预填（外部调用可传入路径预填）：8 份激励 / 补扣表一次放进来，自动挑「外发」页、判正负 */
async function prefillDemo(d: { period: string; feeFiles: string[] }): Promise<void> {
  period.value = d.period;
  workOrders.splice(0, workOrders.length);
  feeItems.splice(0, feeItems.length);
  for (const m of steps.metas) steps.reset(m.key);
  steps.currentKey.value = 'summary';
  await addFeeItems(d.feeFiles);
}
defineExpose({ prefillDemo });

async function runSummary(): Promise<void> {
  steps.start('summary');
  summary.value = null;
  try {
    if (!/^\d{4}-\d{2}$/.test(period.value)) throw new Error(i18nT('请选择结算期'));
    const missing = [...workOrders, ...feeItems].filter((t) => !t.mapping.provider || !t.mapping.amount);
    if (missing.length) throw new Error(i18nT('{files} 缺少服务商列或金额列', { files: missing.map((t) => t.fileName).join('、') }));
    const refOf = (t: PickedTable) => ({ path: t.path, sheetName: t.sheetName, mapping: t.mapping });
    const r = await api().settlementRun({
      period: period.value,
      workOrders: workOrders.map(refOf),
      feeItems: feeItems.map((t) => ({ ...refOf(t), name: t.name, sign: t.sign })),
    });
    summary.value = r.result;
    summaryPath.value = r.summaryPath;
    splitDir.value = r.splitDir;
    splitFiles.value = r.files;
    records.value = [...records.value.filter((x) => x.period !== period.value), ...r.records];
    for (const rec of r.records) if (selected[rec.provider] === undefined) selected[rec.provider] = true;
    steps.done('summary', i18nT('{n} 家服务商，应付合计 ¥{total}，汇总表与 {m} 个拆分附件已生成', { n: r.result.totals.providerCount, total: fmtMoney(r.result.totals.netTotal), m: r.files.length }));
    steps.done('split', i18nT('{m} 个服务商附件，子表按费用项命名', { m: r.files.length }));
    steps.currentKey.value = 'split';
    await api().statePatch({ settlement: { period: period.value } });
    emit('refresh');
  } catch (e) { steps.fail('summary', e); }
}
function confirmSplit(): void { steps.done('split', i18nT('{m} 个服务商附件已确认', { m: splitFiles.value.length })); }

// ── 下发 ──
const mailSubject = ref(props.state?.settlement?.mailSubjectTemplate || '');
const mailBody = ref(props.state?.settlement?.mailBodyTemplate || '');
const selected = reactive<Record<string, boolean>>({});
const selectedProviders = computed(() => periodRecords.value.filter((r) => selected[r.provider]).map((r) => r.provider));
const sendOutcomes = ref<any[]>([]);
const email = computed(() => props.email || {});
function toggleAll(v: boolean): void { for (const r of periodRecords.value) selected[r.provider] = v; }
async function saveEmail(provider: string, value: string): Promise<void> {
  try {
    const r = await api().settlementTrackUpdate({ period: period.value, provider, patch: { email: value.trim() } });
    const idx = records.value.findIndex((x) => x.period === period.value && x.provider === provider);
    if (idx >= 0) records.value[idx] = r.record;
  } catch (e) { notif.error(errorMessage(e)); }
}
async function importContacts(): Promise<void> {
  const paths = await pickFiles('excel', false, i18nT('选择服务商通讯录 Excel（含服务商、邮箱列）'));
  if (!paths[0]) return;
  try {
    const r = await api().contactsImport({ path: paths[0] });
    notif.success(i18nT('已导入 {n} 条服务商联系方式', { n: r.imported }));
    // 把邮箱同步进本期记录
    for (const rec of periodRecords.value) {
      const c = (r.providerDirectory || []).find((x: any) => x.provider === rec.provider);
      if (c?.email && c.email !== rec.email) await saveEmail(rec.provider, c.email);
    }
    emit('refresh');
  } catch (e) { notif.error(errorMessage(e)); }
}
async function send(): Promise<void> {
  steps.start('send');
  sendOutcomes.value = [];
  try {
    await api().statePatch({ settlement: { mailSubjectTemplate: mailSubject.value, mailBodyTemplate: mailBody.value } });
    const r = await api().settlementSend({ period: period.value, providers: selectedProviders.value, subjectTemplate: mailSubject.value, bodyTemplate: mailBody.value, requestReadReceipt: true });
    sendOutcomes.value = r.outcomes;
    records.value = [...records.value.filter((x) => x.period !== period.value), ...r.records];
    const ok = r.outcomes.filter((o: any) => o.ok).length;
    const failed = r.outcomes.length - ok;
    if (ok === 0) throw new Error(r.outcomes.map((o: any) => `${o.provider}：${o.message}`).join(i18nT('；')));
    steps.done('send', i18nT('已发送 {a} 家{b}', { a: ok, b: failed ? i18nT('，{n} 家失败（见下方原因）', { n: failed }) : '' }));
    emit('refresh');
  } catch (e) { steps.fail('send', e); }
}
// ── 自动跟进（未读 N 天重发 / 已读 N 天催办，同一个 N）──
const followUp = reactive<{ enabled: boolean; days: number }>({ enabled: Boolean(props.state?.settlement?.followUp?.enabled), days: Number(props.state?.settlement?.followUp?.days) || 3 });
const showNudgeTpl = ref(false);
const nudgeSubject = ref(props.state?.settlement?.nudgeSubjectTemplate || '');
const nudgeBody = ref(props.state?.settlement?.nudgeBodyTemplate || '');
const nudging = ref('');
async function saveFollowUp(): Promise<void> {
  if (!Number.isFinite(followUp.days) || followUp.days < 1) followUp.days = 1;
  try { await api().statePatch({ settlement: { followUp: { enabled: followUp.enabled, days: followUp.days } } }); } catch (e) { notif.error(errorMessage(e)); }
}
async function saveNudgeTemplate(): Promise<void> {
  try { await api().statePatch({ settlement: { nudgeSubjectTemplate: nudgeSubject.value, nudgeBodyTemplate: nudgeBody.value } }); } catch (e) { notif.error(errorMessage(e)); }
}
async function nudge(provider: string): Promise<void> {
  nudging.value = provider;
  try {
    const r = await api().settlementNudge({ period: period.value, providers: [provider] });
    records.value = [...records.value.filter((x) => x.period !== period.value), ...r.records];
    const o = r.outcomes?.[0];
    if (o?.ok) notif.success(i18nT('已向 {p} 发出催办邮件（{e}）', { p: provider, e: o.email || '' })); else notif.error(i18nT('{p}：{m}', { p: provider, m: o?.message || i18nT('催办失败') }));
    emit('refresh');
  } catch (e) { notif.error(errorMessage(e)); } finally { nudging.value = ''; }
}
async function scanNow(): Promise<void> {
  try {
    const r = await api().settlementScanNow();
    records.value = r.records;
    notif.info(i18nT('已刷新：阅读状态更新 {a} 条，发票 {b} 份', { a: r.receipts, b: r.invoices }));
    emit('refresh');
  } catch (e) { notif.error(errorMessage(e)); }
}
function readLabel(r: any): string {
  const s = flagOf(r).readState;
  return s === 'replied' ? i18nT('收到收件人回复') : s === 'read' ? (r.readSource === 'mailbox' ? i18nT('收件邮箱标记已读') : i18nT('收到收件人已读回执')) : s === 'sent' ? i18nT('已发送，阅读状态未知') : s === 'failed' ? i18nT('发送失败') : i18nT('未发送');
}
function readChipClass(r: any): string {
  const s = flagOf(r).readState;
  return s === 'replied' || s === 'read' ? 'ok' : s === 'sent' ? 'warn' : s === 'failed' ? 'bad' : '';
}

// ── 发票 ──
const invoiceTemplate = ref(props.state?.settlement?.invoiceNameTemplate || `${tok(VAR.provider)}_${tok(VAR.period)}_${i18nT('发票')}${tok(VAR.seq)}`);
const exampleInvoiceName = computed(() => normalizeTemplateTokens(invoiceTemplate.value).replace('{服务商}', i18nT('某某服务商')).replace('{结算期}', period.value).replace('{序号}', '01').replace('{日期}', '20260901').replace('{原文件名}', 'scan') + '.pdf');
const invoiceDir = computed(() => props.dir || props.state?.outputDir || '');
async function saveTemplate(): Promise<void> { try { await api().statePatch({ settlement: { invoiceNameTemplate: invoiceTemplate.value } }); } catch (e) { notif.error(errorMessage(e)); } }
async function pickInvoice(provider: string): Promise<void> {
  const paths = await pickFiles('invoice', true, i18nT('选择 {p} 的发票文件', { p: provider }));
  if (paths.length) await importInvoiceFiles(provider, paths);
}
async function dropInvoice(provider: string, ev: DragEvent): Promise<void> {
  const paths = droppedPaths(ev, INVOICE_RE);
  if (paths.length) await importInvoiceFiles(provider, paths);
}
async function importInvoiceFiles(provider: string, paths: string[]): Promise<void> {
  try {
    const r = await api().settlementImportInvoices({ period: period.value, provider, paths });
    const idx = records.value.findIndex((x) => x.period === period.value && x.provider === provider);
    if (idx >= 0 && r.record) records.value[idx] = r.record;
    notif.success(i18nT('已归档 {n} 份发票', { n: r.saved.length }));
    emit('refresh');
  } catch (e) { notif.error(errorMessage(e)); }
}
async function scanInvoices(): Promise<void> {
  steps.start('invoice');
  try {
    const r = await api().settlementScanNow();
    records.value = r.records;
    const received = periodRecords.value.filter((x) => x.invoiceReceivedAt).length;
    steps.done('invoice', i18nT('本次新收 {a} 份发票；本期已收到发票 {b} / {c} 家', { a: r.invoices, b: received, c: periodRecords.value.length }));
    emit('refresh');
  } catch (e) { steps.fail('invoice', e); }
}

// ── 跟踪 ──
const expenseUrl = ref(props.state?.settlement?.expenseSystemUrl || '');
async function saveExpenseUrl(): Promise<void> { try { await api().statePatch({ settlement: { expenseSystemUrl: expenseUrl.value } }); } catch (e) { notif.error(errorMessage(e)); } }
async function openExpenseSystem(): Promise<void> {
  const ok = await openEmbeddedBrowser(expenseUrl.value, 'service-settlement-expense');
  if (!ok) notif.warn(i18nT('内置浏览器不可用，请手动打开费控系统'));
}
const toDateInput = (iso?: string) => (iso ? fmtDate(iso) : '');
async function track(provider: string, key: string, value: string): Promise<void> {
  steps.start('track');
  try {
    const r = await api().settlementTrackUpdate({ period: period.value, provider, patch: { [key]: value ? `${value}T12:00:00` : '' } });
    const idx = records.value.findIndex((x) => x.period === period.value && x.provider === provider);
    if (idx >= 0) records.value[idx] = r.record;
    const paid = periodRecords.value.filter((x) => x.writeoffCompletedAt).length;
    steps.done('track', i18nT('已登记；本期已付款 {a} / {b} 家', { a: paid, b: periodRecords.value.length }));
    emit('refresh');
  } catch (e) { steps.fail('track', e); }
}
async function importWriteback(): Promise<void> {
  const paths = await pickFiles('excel', false, i18nT('选择费控系统导出的核销流程表'));
  if (!paths[0]) return;
  steps.start('track');
  try {
    const r = await api().settlementWritebackImport({ period: period.value, path: paths[0] });
    records.value = [...records.value.filter((x) => x.period !== period.value), ...r.records];
    steps.done('track', i18nT('回写 {n} 家服务商的核销状态{m}', { n: r.updated, m: r.missing.length ? i18nT('；{k} 家在本期没有记录：{names}', { k: r.missing.length, names: r.missing.slice(0, 5).join('、') }) : '' }));
    emit('refresh');
  } catch (e) { steps.fail('track', e); }
}
const stageLabel = (s: string) => ({ unsent: i18nT('未下发'), awaiting_invoice: i18nT('待开票'), awaiting_writeoff: i18nT('待核销'), writeoff_in_progress: i18nT('核销中'), paid: i18nT('已付款') } as Record<string, string>)[s] || s;
const stageClass = (s: string) => (s === 'paid' ? 'ok' : s === 'awaiting_writeoff' ? 'warn' : s === 'writeoff_in_progress' ? 'brand' : '');
const unpaidReport = reactive({ enabled: false, weekday: 1, hour: 9 });
watch(() => props.state?.settlement?.unpaidReport, (u) => { if (u) Object.assign(unpaidReport, { enabled: u.enabled, weekday: u.weekday, hour: u.hour }); }, { immediate: true });
watch(() => props.state?.settlement?.followUp, (f) => { if (f) Object.assign(followUp, { enabled: Boolean(f.enabled), days: Number(f.days) || 3 }); }, { immediate: true });
watch(() => props.state?.settlement?.nudgeSubjectTemplate, (v) => { if (v && !nudgeSubject.value) nudgeSubject.value = v; }, { immediate: true });
watch(() => props.state?.settlement?.nudgeBodyTemplate, (v) => { if (v && !nudgeBody.value) nudgeBody.value = v; }, { immediate: true });
async function saveUnpaidReport(): Promise<void> { try { await api().statePatch({ settlement: { unpaidReport: { ...unpaidReport } } }); } catch (e) { notif.error(errorMessage(e)); } }
const reportPaths = ref<{ unpaidPath: string; trackingPath: string } | null>(null);
async function exportReport(): Promise<void> {
  steps.start('track');
  try {
    const r = await api().settlementReport({ period: period.value });
    reportPaths.value = r;
    steps.done('track', i18nT('未完成付款报表已生成：{n} 家未付款', { n: r.unpaidCount }));
  } catch (e) { steps.fail('track', e); }
}

// 有历史记录时直接把步骤态恢复出来，让用户回来就能看到「第几步了」；切换结算期时重算（否则步骤态还停在上一期）
function restoreFromRecords(): void {
  for (const k of ['summary', 'split', 'send', 'invoice', 'track']) steps.reset(k);
  summary.value = null;
  summaryPath.value = '';
  splitFiles.value = [];
  sendOutcomes.value = [];
  reportPaths.value = null;
  for (const k of Object.keys(selected)) delete selected[k];
  const recs = periodRecords.value;
  if (!recs.length) { steps.currentKey.value = 'summary'; return; }
  steps.set('summary', { state: 'done', summary: i18nT('本期已有 {n} 家服务商的结算记录（可重新生成）', { n: recs.length }) });
  steps.set('split', { state: 'done' });
  if (recs.some((r) => r.sentAt)) steps.set('send', { state: 'done', summary: i18nT('已下发 {n} 家', { n: recs.filter((r) => r.sentAt).length }) });
  if (recs.some((r) => r.invoiceReceivedAt)) steps.set('invoice', { state: 'done', summary: i18nT('已收到发票 {n} 家', { n: recs.filter((r) => r.invoiceReceivedAt).length }) });
  steps.currentKey.value = recs.some((r) => r.invoiceReceivedAt) ? 'track' : recs.some((r) => r.sentAt) ? 'invoice' : 'send';
  for (const r of recs) selected[r.provider] = !r.sentAt;
}
restoreFromRecords();
watch(period, () => { if (!steps.isRunning()) restoreFromRecords(); });
</script>

<style scoped>
.ss-source { display: grid; gap: 8px; padding: 10px 12px; border-radius: 12px; background: var(--color-bg-primary); border: 1px solid var(--color-border); }
.ss-fee { display: grid; gap: 6px; }
.ss-switch { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer; }
.spin { animation: ss-spin 1s linear infinite; }
@keyframes ss-spin { to { transform: rotate(360deg); } }
</style>
