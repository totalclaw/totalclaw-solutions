<template>
  <div class="ss-module">
    <StickyProgress :title="$t('批量开票')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <!-- 1 销售方与通道 -->
      <StepCard step-key="i-seller" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['i-seller']" :is-current="currentKey === 'i-seller'">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('销售方名称') }}</span><input v-model="seller.name" type="text" data-test="iv-seller-name" /></label>
          <label class="ss-field"><span>{{ $t('销售方税号') }}</span><input v-model="seller.taxNo" type="text" data-test="iv-seller-taxno" /></label>
          <label class="ss-field"><span>{{ $t('纳税人类型') }}</span>
            <select v-model="seller.taxpayerType"><option value="general">{{ $t('一般纳税人') }}</option><option value="small">{{ $t('小规模纳税人') }}</option></select>
          </label>
          <label class="ss-field"><span>{{ $t('默认税率（表里没写时用）') }}</span>
            <select v-model.number="seller.defaultTaxRate"><option v-for="r in rateOptions" :key="r" :value="r">{{ pct(r) }}</option></select>
          </label>
          <label class="ss-field"><span>{{ $t('电子税务局省份（拼音，如 jilin）') }}</span><input v-model="seller.province" type="text" placeholder="jilin" data-test="iv-seller-province" /></label>
          <label class="ss-field"><span>{{ $t('单张限额（价税合计，0 = 不拆）') }}</span><input v-model.number="seller.perInvoiceLimit" type="number" min="0" /></label>
          <label class="ss-field"><span>{{ $t('本月剩余可开额度（不含税，0 = 不检查）') }}</span><input v-model.number="seller.remainingQuota" type="number" min="0" /></label>
        </div>
        <div class="iv-channels">
          <button v-for="c in channels" :key="c.key" type="button" class="iv-channel" :class="{ on: channel === c.key }" :data-test="`iv-channel-${c.key}`" @click="channel = c.key">
            <strong><i :class="c.icon"></i>{{ c.title }}</strong><span>{{ c.text }}</span>
          </button>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="iv-seller-save" @click="saveSeller"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
          <span class="ss-muted">{{ $t('走电子税务局通道时，剩余额度会在第 6 步从页面上自动读回来；额度不够要先申请调额，系统不会代办') }}</span>
        </div>
      </StepCard>

      <!-- 2 导入 -->
      <StepCard step-key="i-import" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['i-import']" :is-current="currentKey === 'i-import'">
        <div class="ss-actions">
          <label v-if="state?.batches.length" class="ss-field inline"><span>{{ $t('继续处理') }}</span>
            <select v-model="batchId" data-test="iv-batch-select"><option value="">{{ $t('— 新建一批 —') }}</option><option v-for="b in state.batches" :key="b.id" :value="b.id">{{ $t('{p0}（{n} 行）', { p0: b.name, n: b.rowCount }) }}</option></select>
          </label>
          <button v-if="batchId" type="button" class="ss-link" @click="removeBatch">{{ $t('删除这一批') }}</button>
        </div>
        <template v-if="!batchId">
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="iv-pick-excel" @click="pickExcel"><i class="ri-file-excel-2-line"></i>{{ $t('选择付款单 / 开票申请表') }}</button>
            <button type="button" class="ss-btn" :disabled="!!busy" @click="pickSlips"><i class="ri-bank-card-line"></i>{{ $t('选择付款回单（PDF / 图片）') }}</button>
            <button type="button" class="ss-link" @click="showPaste = !showPaste">{{ $t('粘贴付款信息文字') }}</button>
          </div>
          <div v-if="showPaste" class="iv-paste">
            <textarea v-model="pasteText" rows="5" :placeholder="$t('把银行回单、付款通知里的文字粘贴到这里；模型只负责读出付款方和金额，读出来的内容会逐条回原文核对')"></textarea>
            <button type="button" class="ss-btn sm primary" :disabled="!!busy || !pasteText.trim()" @click="importSlips([])"><i :class="busy === 'i-import' ? 'ri-loader-4-line spin' : 'ri-file-search-line'"></i>{{ $t('抽取') }}</button>
          </div>
          <div v-for="(f, fi) in previews" :key="f.path" class="iv-preview">
            <div class="iv-preview__head">
              <b><i class="ri-file-excel-2-line"></i>{{ fileName(f.path) }}</b>
              <select v-if="f.sheets.length > 1" :value="f.sheet" @change="changeSheet(fi, ($event.target as HTMLSelectElement).value)"><option v-for="s in f.sheets" :key="s" :value="s">{{ s }}</option></select>
              <span class="ss-muted">{{ $t('{n} 行', { n: f.rowCount }) }}</span>
              <button type="button" class="ss-link" @click="previews.splice(fi, 1)">{{ $t('移除') }}</button>
            </div>
            <p v-if="missingOf(f).length" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('这些必填列没认出来，请在下面手动对应：{p0}', { p0: missingOf(f).map(fieldLabel).join('、') }) }}</p>
            <div class="iv-map">
              <label v-for="fd in FIELDS" :key="fd.key" class="ss-field">
                <span>{{ fieldLabel(fd.key) }}<em v-if="fd.required">*</em></span>
                <select v-model="f.mapping[fd.key]"><option value="">{{ $t('（没有这一列）') }}</option><option v-for="h in f.headers" :key="h" :value="h">{{ h }}</option></select>
              </label>
            </div>
          </div>
          <div v-if="previews.length" class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || previews.some((f) => missingOf(f).length > 0)" data-test="iv-import-commit" @click="commitImport"><i :class="busy === 'i-import' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('导入 {n} 行', { n: previews.reduce((n, f) => n + f.rowCount, 0) }) }}</button>
          </div>
        </template>
        <p v-for="m in importNotes" :key="m" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ m }}</p>
      </StepCard>

      <!-- 3 校验 -->
      <StepCard step-key="i-check" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['i-check']" :is-current="currentKey === 'i-check'">
        <p v-if="!batchId" class="ss-empty">{{ $t('导入后在这里逐行校验') }}</p>
        <template v-else-if="summary">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('明细行') }}</small><strong>{{ summary.rows - summary.skipped }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('购买方') }}</small><strong>{{ summary.buyers }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('金额合计') }}</small><strong>{{ money(summary.total) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('要修的行') }}</small><strong :class="{ 'iv-bad': summary.errors > 0 }" data-test="iv-error-count">{{ summary.errors }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('有提醒的行') }}</small><strong>{{ summary.warnings }}</strong></div>
          </div>
          <div class="ss-actions">
            <label class="iv-check"><input v-model="onlyIssues" type="checkbox" />{{ $t('只看有问题的行') }}</label>
            <button type="button" class="ss-btn sm" :disabled="!!busy" @click="refill"><i class="ri-contacts-book-2-line"></i>{{ $t('用客户档案补全') }}</button>
            <span class="ss-muted">{{ $t('改完一格按回车或点别处即保存；有错误的行不会进发票') }}</span>
          </div>
          <p v-if="!shownRows.length" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有需要处理的行') }}</p>
          <div v-else class="ss-table-wrap iv-rows">
            <table class="ss-table">
              <thead><tr><th>{{ $t('行') }}</th><th>{{ $t('购买方名称') }}</th><th>{{ $t('购买方税号') }}</th><th>{{ $t('项目名称') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('税率') }}</th><th>{{ $t('发票类型') }}</th><th>{{ $t('问题') }}</th><th></th></tr></thead>
              <tbody>
                <tr v-for="r in shownRows" :key="r.id" :class="{ bad: hasError(r), 'iv-skipped': r.skipped }">
                  <td :title="`${r.file} ${r.sheet}`">{{ r.rowNo }}</td>
                  <td><input :value="r.buyerName" type="text" @change="patchRow(r, { buyerName: val($event) })" /></td>
                  <td><input :value="r.buyerTaxNo" type="text" class="iv-mono" @change="patchRow(r, { buyerTaxNo: val($event) })" /></td>
                  <td><input :value="r.itemName" type="text" @change="patchRow(r, { itemName: val($event) })" /></td>
                  <td class="num"><input :value="r.amount" type="number" class="iv-num" @change="patchRow(r, { amount: Number(val($event)) })" /></td>
                  <td><select :value="r.taxRate" @change="patchRow(r, { taxRate: Number(val($event)) })"><option v-for="x in rateOptions" :key="x" :value="x">{{ pct(x) }}</option><option v-if="!rateOptions.includes(r.taxRate)" :value="r.taxRate">{{ Number.isNaN(r.taxRate) ? '?' : pct(r.taxRate) }}</option></select></td>
                  <td><select :value="r.kind" @change="patchRow(r, { kind: val($event) as any })"><option value="normal">{{ $t('普通发票') }}</option><option value="special">{{ $t('专用发票') }}</option></select></td>
                  <td class="iv-issues">
                    <span v-for="(i, n) in r.issues" :key="n" class="ss-chip" :class="i.level === 'error' ? 'bad' : 'warn'" :title="i.message">{{ i.message }}</span>
                  </td>
                  <td class="iv-ops">
                    <button v-if="r.issues.some((i) => i.code === 'taxno_checksum')" type="button" class="ss-link" :title="$t('税号核对无误：加入客户档案后不再拦')" @click="trustCustomer(r)">{{ $t('税号无误') }}</button>
                    <button type="button" class="ss-link" @click="patchRow(r, { skipped: !r.skipped })">{{ r.skipped ? $t('恢复') : $t('不开这行') }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </StepCard>

      <!-- 4 税收分类编码 -->
      <StepCard step-key="i-code" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['i-code']" :is-current="currentKey === 'i-code'">
        <p v-if="!batchId" class="ss-empty">{{ $t('导入后列出这一批用到的开票项目') }}</p>
        <template v-else>
          <div class="ss-actions">
            <button type="button" class="ss-btn" :disabled="!!busy || !codeItems.some((x) => !x.goods?.taxCode)" @click="suggestCodes"><i :class="busy === 'i-code' ? 'ri-loader-4-line spin' : 'ri-barcode-line'"></i>{{ $t('让模型建议编码') }}</button>
            <span class="ss-muted">{{ $t('批量导入模板里「商品和服务税收编码」是必填；模型建议的要你逐条确认') }}</span>
          </div>
          <p v-if="codeNote" class="ss-note info"><i class="ri-information-line"></i>{{ codeNote }}</p>
          <div class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('项目名称') }}</th><th>{{ $t('税收分类编码（19 位）') }}</th><th>{{ $t('分类简称') }}</th><th>{{ $t('状态') }}</th><th></th></tr></thead>
              <tbody>
                <tr v-for="x in codeItems" :key="x.name">
                  <td>{{ x.name }}</td>
                  <td><input v-model="codeEdit[x.name].taxCode" type="text" class="iv-mono iv-code" maxlength="19" :data-test="`iv-code-${x.name}`" /></td>
                  <td><input v-model="codeEdit[x.name].shortName" type="text" /></td>
                  <td><span class="ss-chip" :class="x.goods?.confirmed ? 'ok' : x.goods?.taxCode ? 'warn' : ''">{{ x.goods?.confirmed ? $t('已确认') : x.goods?.taxCode ? $t('模型建议，待确认') : $t('未填') }}</span></td>
                  <td><button type="button" class="ss-btn sm" :disabled="!!busy || codeEdit[x.name].taxCode.length !== 19" @click="saveCode(x.name)">{{ x.goods?.confirmed ? $t('保存') : $t('确认') }}</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </StepCard>

      <!-- 5 组票与确认 -->
      <StepCard step-key="i-build" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['i-build']" :is-current="currentKey === 'i-build'">
        <p v-if="!batchId" class="ss-empty">{{ $t('校验通过后在这里组票') }}</p>
        <template v-else>
          <div class="ss-actions">
            <label class="ss-field inline"><span>{{ $t('合并方式') }}</span>
              <select v-model="mergeMode" :disabled="locked"><option value="buyer">{{ $t('同一购买方合成一张') }}</option><option value="order">{{ $t('同一订单号一张') }}</option><option value="row">{{ $t('一行一张') }}</option></select>
            </label>
            <button type="button" class="ss-btn primary" :disabled="!!busy || locked || !summary || summary.rows === summary.skipped" data-test="iv-build" @click="build"><i :class="busy === 'i-build' ? 'ri-loader-4-line spin' : 'ri-stack-line'"></i>{{ drafts.length ? $t('重新组票') : $t('组票') }}</button>
            <button v-if="drafts.some((d) => d.status === 'draft' && !hasError(d))" type="button" class="ss-btn" :disabled="!!busy" data-test="iv-confirm-all" @click="confirmAll"><i class="ri-check-double-line"></i>{{ $t('全部确认（跳过有错误的）') }}</button>
            <span v-if="locked" class="ss-muted">{{ $t('这一批已有交出去的发票，不能重新组票') }}</span>
          </div>
          <p v-if="summary && summary.errors" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('有 {n} 行还有错误，这些行不会进发票', { n: summary.errors }) }}</p>
          <p v-if="quotaOver" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('这一批不含税合计 {p0} 元，超过你填的本月剩余额度 {p1} 元：先在电子税务局申请调额，或只确认一部分', { p0: money(batchNet), p1: money(seller.remainingQuota) }) }}</p>
          <div v-if="drafts.length" class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('发票张数') }}</small><strong data-test="iv-draft-count">{{ drafts.length }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('不含税金额') }}</small><strong>{{ money(batchNet) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('税额') }}</small><strong>{{ money(sumOf('tax')) }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('价税合计') }}</small><strong data-test="iv-draft-total">{{ money(sumOf('total')) }}</strong></div>
          </div>
          <div v-for="d in drafts" :key="d.id" class="iv-draft" :class="{ bad: hasError(d) }">
            <div class="iv-draft__head">
              <span class="ss-chip" :class="statusClass(d.status)">{{ statusLabel(d.status) }}</span>
              <b>{{ d.buyerName }}</b>
              <code v-if="d.buyerTaxNo">{{ d.buyerTaxNo }}</code><span v-else-if="d.personal" class="ss-chip">{{ $t('自然人') }}</span>
              <span class="ss-chip brand">{{ kindLabel(d.kind) }}</span>
              <span v-if="d.part" class="ss-chip warn">{{ $t('拆 {a}/{b}', { a: d.part.index, b: d.part.of }) }}</span>
              <span class="iv-grow"></span>
              <span class="iv-total">{{ money(d.total) }}</span>
              <button type="button" class="ss-link" @click="toggleOpen(d.id)">{{ opened.has(d.id) ? $t('收起') : $t('{n} 行明细', { n: d.lines.length }) }}</button>
              <button v-if="d.status === 'draft'" type="button" class="ss-btn sm primary" :disabled="!!busy || hasError(d)" @click="confirm([d.id], true)">{{ $t('确认') }}</button>
              <button v-else-if="d.status === 'confirmed'" type="button" class="ss-link" @click="confirm([d.id], false)">{{ $t('撤回确认') }}</button>
            </div>
            <p v-for="(i, n) in d.issues" :key="n" class="ss-note" :class="i.level === 'error' ? 'danger' : 'warn'"><i class="ri-error-warning-line"></i>{{ i.message }}</p>
            <div v-if="opened.has(d.id)" class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('项目名称') }}</th><th>{{ $t('税收分类编码') }}</th><th>{{ $t('规格型号') }}</th><th>{{ $t('单位') }}</th><th class="num">{{ $t('数量') }}</th><th class="num">{{ $t('不含税金额') }}</th><th>{{ $t('税率') }}</th><th class="num">{{ $t('税额') }}</th><th class="num">{{ $t('价税合计') }}</th></tr></thead>
                <tbody>
                  <tr v-for="(l, n) in d.lines" :key="n"><td>{{ l.shortName ? `*${l.shortName}*` : '' }}{{ l.itemName }}</td><td class="iv-mono">{{ l.taxCode }}</td><td>{{ l.spec }}</td><td>{{ l.unit }}</td><td class="num">{{ l.qty || '' }}</td><td class="num">{{ money(l.amount) }}</td><td>{{ pct(l.taxRate) }}</td><td class="num">{{ money(l.tax) }}</td><td class="num">{{ money(l.total) }}</td></tr>
                  <tr class="total"><td colspan="5">{{ $t('合计') }}</td><td class="num">{{ money(d.amount) }}</td><td></td><td class="num">{{ money(d.tax) }}</td><td class="num">{{ money(d.total) }}</td></tr>
                </tbody>
              </table>
              <p v-if="d.remark" class="ss-muted">{{ $t('备注：{p0}', { p0: d.remark }) }}</p>
            </div>
          </div>
        </template>
      </StepCard>

      <!-- 6 开具 -->
      <StepCard step-key="i-issue" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime['i-issue']" :is-current="currentKey === 'i-issue'">
        <p v-if="!confirmed.length && !handed.length" class="ss-empty">{{ $t('没有已确认的发票') }}</p>

        <template v-if="channel === 'etax_batch'">
          <p class="ss-note info"><i class="ri-shield-user-line"></i>{{ $t('电子税务局不接受应用的内置浏览器，这里用系统的 Chrome / Edge 打开。登录和扫脸只能你本人完成；应用只负责走到「批量开票」页、放入导入文件、读回结果，不会点「批量开具」。') }}</p>
          <div class="iv-sub-step">
            <b>{{ $t('① 生成导入文件') }}</b>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !confirmed.length" data-test="iv-export" @click="exportBatch"><i :class="busy === 'i-issue' ? 'ri-loader-4-line spin' : 'ri-file-download-line'"></i>{{ $t('生成批量导入文件（{n} 张）', { n: confirmed.length }) }}</button>
              <span class="ss-muted">{{ $t('在官方《批量导入开具发票模板》原文件上追加数据，其它内容不动') }}</span>
            </div>
            <template v-if="exported">
              <div class="ss-file-out"><i class="ri-file-excel-2-fill"></i><code data-test="iv-export-file">{{ exported.file }}</code>
                <span>{{ $t('{a} 张 · {c} 行明细 · 价税合计 {b} 元', { a: exported.count, b: money(exported.total), c: exported.lines }) }}</span>
                <button type="button" class="ss-link" @click="openPath(exported.file)">{{ $t('打开') }}</button><button type="button" class="ss-link" @click="openPath(exported.file, true)">{{ $t('在文件夹中显示') }}</button>
              </div>
              <p v-if="exported.usedOfficial" class="ss-muted" data-test="iv-export-template">{{ exported.ownTemplate ? $t('用的是你提供的模板（{p0}）', { p0: exported.templateVersion }) : $t('用的是应用自带的官方模板（{p0}）', { p0: exported.templateVersion }) }}</p>
              <p v-if="exported.templateIgnored || !exported.usedOfficial" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('官方模板没用上（文件读不了或结构不对），这份文件只有两张数据表，电子税务局可能拒收') }}</p>
              <p v-if="exported.unplaced.length" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('这些数据在模板里找不到对应的列，没有写进文件，请手工处理：{p0}', { p0: exported.unplaced.join('、') }) }}</p>
              <p v-for="w in exported.warnings" :key="w" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ w }}</p>
            </template>
          </div>

          <div class="iv-sub-step">
            <b>{{ $t('② 打开电子税务局，走到「批量开票」页') }}</b>
            <div class="ss-actions">
              <button type="button" class="ss-btn" :disabled="!!busy" data-test="iv-etax-open" @click="etaxDo('etax.open')"><i class="ri-global-line"></i>{{ $t('打开电子税务局') }}</button>
              <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="iv-etax-goto" @click="etaxDo('etax.goto')"><i class="ri-route-line"></i>{{ $t('带我到批量开票页') }}</button>
              <button type="button" class="ss-link" :disabled="!!busy" @click="etaxDo('etax.state')">{{ $t('刷新状态') }}</button>
            </div>
            <div v-if="etax" class="iv-etax" data-test="iv-etax-state">
              <span class="ss-chip" :class="etax.need ? 'warn' : etax.kind === 'batch' ? 'ok' : 'brand'">{{ etaxWhere }}</span>
              <span v-if="etax.company">{{ etax.company }}</span>
              <span v-if="etax.quota != null" class="ss-muted">{{ $t('可用额度 {p0} 元', { p0: money(etax.quota) }) }}</span>
              <span v-if="etax.templateVersion" class="ss-muted">{{ $t('页面要求的模板 {p0}', { p0: etax.templateVersion }) }}</span>
            </div>
            <p v-if="etax?.need" class="ss-note warn" data-test="iv-etax-need"><i class="ri-user-follow-line"></i>{{ etaxNeedText }}</p>
            <p v-if="etax?.sellerMismatch" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('电子税务局登录的是「{p0}」，和第 1 步的销售方不是同一家', { p0: etax.company }) }}</p>
            <p v-if="etax && exported && etax.templateVersion && exported.templateVersion && !exported.templateVersion.includes(etax.templateVersion.replace('V', '20'))" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('页面要求的模板是 {p0}，这份文件用的是 {p1}：请在页面上下载最新模板，放到「设置 → 官方批量导入模板」后重新生成', { p0: etax.templateVersion, p1: exported.templateVersion }) }}</p>
          </div>

          <div class="iv-sub-step">
            <b>{{ $t('③ 放入导入文件，核对后由你点「批量开具」') }}</b>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !exported || etax?.kind !== 'batch' || !!etax?.need" data-test="iv-etax-attach" @click="attach"><i class="ri-upload-2-line"></i>{{ $t('把导入文件放进「选择文件」') }}</button>
              <button type="button" class="ss-btn" :disabled="!!busy || !exported" data-test="iv-self-import" @click="markHanded(exported!.ids)"><i class="ri-user-line"></i>{{ $t('我自己选文件导入，标记为开具中') }}</button>
            </div>
            <template v-if="attached">
              <p class="ss-note" :class="attached.previewCount === attached.expected && !attached.diff.length ? 'ok' : 'danger'"><i class="ri-list-check-2"></i>{{ $t('页面导入后列出 {a} 张，应为 {b} 张', { a: attached.previewCount, b: attached.expected }) }}{{ attached.diff.length ? $t('；这些流水号的价税合计和页面上的不一致：{p0}', { p0: attached.diff.join('、') }) : '' }}{{ attached.missing.length ? $t('；页面上没有这些流水号：{p0}', { p0: attached.missing.slice(0, 5).join('、') }) : '' }}</p>
              <p v-for="m in attached.messages" :key="m" class="ss-note warn"><i class="ri-message-2-line"></i>{{ m.slice(0, 200) }}</p>
              <p class="ss-note info"><i class="ri-cursor-line"></i>{{ $t('现在请在电子税务局页面上核对列表，确认无误后亲自点「批量开具」。开完回到下一步读回结果。') }}</p>
            </template>
          </div>
        </template>

        <template v-else>
          <p class="ss-note info"><i class="ri-plug-line"></i>{{ $t('接口通道对接的是诺诺开放平台（诺税通 SaaS）。要先在诺诺开通接口开票权限并拿到 appKey / appSecret；数电账号仍要在诺诺这边做税局登录验证（短信或扫码），失效后要重做。这条通道没有用真实诺诺账号跑通过。') }}</p>
          <div class="iv-sub-step">
            <b>{{ $t('① 接口凭据') }}</b>
            <p v-if="state && !state.secretStorage" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('这台电脑的系统钥匙串不可用，接口密钥没法安全保存，接口通道用不了') }}</p>
            <div class="ss-grid">
              <label class="ss-field"><span>appKey</span><input v-model="api.appKey" type="text" autocomplete="off" data-test="iv-api-key" /></label>
              <label class="ss-field"><span>appSecret</span><input v-model="api.appSecret" type="password" autocomplete="new-password" :placeholder="state?.settings.api.hasSecret ? $t('已保存，留空不改') : ''" data-test="iv-api-secret" /></label>
              <label class="ss-field"><span>{{ $t('环境') }}</span><select v-model="api.sandbox"><option :value="true">{{ $t('沙箱（测试税号，不产生真实发票）') }}</option><option :value="false">{{ $t('正式') }}</option></select></label>
              <label class="ss-field"><span>{{ $t('accessToken（沙箱应用给的才填；正式环境留空）') }}</span><input v-model="api.token" type="password" autocomplete="new-password" :placeholder="state?.settings.api.hasToken ? $t('已保存，留空不改') : ''" /></label>
              <label class="ss-field"><span>{{ $t('数电账号（登录电子税务局的手机号或证件号）') }}</span><input v-model="api.eleAccount" type="text" autocomplete="off" /></label>
            </div>
            <div class="ss-actions"><button type="button" class="ss-btn" :disabled="!!busy" data-test="iv-api-save" @click="saveApi"><i class="ri-save-line"></i>{{ $t('保存凭据') }}</button><span v-if="state?.settings.api.hasSecret" class="ss-chip ok" data-test="iv-api-saved"><i class="ri-lock-line"></i>{{ $t('密钥已加密保存') }}</span></div>
          </div>
          <div class="iv-sub-step">
            <b>{{ $t('② 税局登录验证（登录失效时做）') }}</b>
            <div class="ss-actions">
              <button type="button" class="ss-btn" :disabled="!!busy" @click="apiLogin('1')"><i class="ri-message-3-line"></i>{{ $t('发短信验证码') }}</button>
              <button type="button" class="ss-btn" :disabled="!!busy" @click="apiLogin('3')"><i class="ri-qr-code-line"></i>{{ $t('税务 APP 扫码') }}</button>
            </div>
            <template v-if="verify">
              <p v-if="verify.already" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('已经是登录状态，不用验证') }}</p>
              <template v-else-if="verify.type === '1'">
                <p class="ss-muted">{{ $t('验证码已发到 {p0}', { p0: verify.verifyData || $t('数电账号绑定的手机') }) }}</p>
                <div class="ss-actions"><input v-model="smsCode" type="text" class="iv-sms" :placeholder="$t('短信验证码')" /><button type="button" class="ss-btn sm primary" :disabled="!!busy || !smsCode" @click="apiVerify">{{ $t('提交验证') }}</button></div>
              </template>
              <template v-else>
                <p class="ss-muted">{{ $t('请用税务 APP 扫描服务商返回的二维码内容（下面是二维码字符串，可粘到任意二维码生成工具），扫完点「我已扫码」') }}</p>
                <code class="iv-qr">{{ verify.verifyData || $t('还没拿到二维码，请稍后重试') }}</code>
                <div class="ss-actions"><button type="button" class="ss-btn sm primary" :disabled="!!busy" @click="apiVerify">{{ $t('我已扫码') }}</button></div>
              </template>
              <p v-if="verify.failMsg" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ verify.failMsg }}</p>
              <p v-if="verifyDone" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('税局登录验证成功') }}</p>
            </template>
          </div>
          <div class="iv-sub-step">
            <b>{{ $t('③ 提交开票') }}</b>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !confirmed.length" data-test="iv-api-submit" @click="apiSubmit"><i :class="busy === 'i-issue' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('提交 {n} 张到服务商开具', { n: confirmed.length }) }}</button>
              <span class="ss-muted">{{ api.sandbox ? $t('沙箱环境：不会产生真实发票') : $t('正式环境：点了就会真的开出发票') }}</span>
            </div>
            <p v-for="m in apiErrors" :key="m" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ m }}</p>
          </div>
        </template>

        <div v-for="d in handed" :key="d.id" class="ss-actions">
          <span class="ss-chip" :class="d.status === 'failed' ? 'bad' : 'warn'">{{ statusLabel(d.status) }}</span><span>{{ d.buyerName }} · {{ money(d.total) }}</span><code class="iv-serial">{{ d.serial }}</code><span v-if="d.failReason" class="ss-muted">{{ d.failReason }}</span>
        </div>
      </StepCard>

      <!-- 7 回填 -->
      <StepCard step-key="i-fill" :index="6" :title="metas[6].title" :hint="metas[6].hint" :runtime="runtime['i-fill']" :is-current="currentKey === 'i-fill'">
        <div class="ss-actions">
          <button v-if="channel === 'etax_batch'" type="button" class="ss-btn primary" :disabled="!!busy || !handed.length" data-test="iv-etax-records" @click="readRecords"><i :class="busy === 'i-fill' ? 'ri-loader-4-line spin' : 'ri-download-cloud-2-line'"></i>{{ $t('从「批量开票记录」读回结果') }}</button>
          <button v-else type="button" class="ss-btn primary" :disabled="!!busy || !handed.length" data-test="iv-api-poll" @click="apiPoll"><i :class="busy === 'i-fill' ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('查询开票结果') }}</button>
          <button type="button" class="ss-btn" :disabled="!!busy || !handed.length" @click="importIssued"><i class="ri-file-search-line"></i>{{ $t('导入已开发票清单回填') }}</button>
          <span class="ss-muted">{{ channel === 'etax_batch' ? $t('按发票流水号精确回填，不用猜；也可以导入「全量发票查询」导出的表') : $t('开票是异步的，提交后过一会儿再查') }}</span>
        </div>
        <p v-if="fillNote" class="ss-note info" data-test="iv-fill-note"><i class="ri-information-line"></i>{{ fillNote }}</p>
        <p v-if="!handed.length && !issuedCount" class="ss-empty">{{ $t('交出去的发票在这里登记结果') }}</p>
        <div v-if="handed.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('发票流水号') }}</th><th>{{ $t('购买方名称') }}</th><th class="num">{{ $t('价税合计') }}</th><th>{{ $t('发票号码') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="d in handed" :key="d.id" :class="{ bad: ambiguous.includes(d.id) || d.status === 'failed' }">
                <td class="iv-mono">{{ d.serial }}</td><td>{{ d.buyerName }}</td><td class="num">{{ money(d.total) }}</td>
                <td><input v-model="noEdit[d.id]" type="text" class="iv-mono" :placeholder="$t('20 位数电发票号码')" :data-test="`iv-no-${d.serial.slice(-4)}`" /></td>
                <td class="iv-ops">
                  <button type="button" class="ss-btn sm primary" :disabled="!!busy || !noEdit[d.id]" :data-test="`iv-issued-${d.serial.slice(-4)}`" @click="markIssued(d)">{{ $t('已开具') }}</button>
                  <input v-model="failEdit[d.id]" type="text" :placeholder="$t('没开成的原因')" />
                  <button type="button" class="ss-link" :disabled="!failEdit[d.id]" @click="markFailed(d)">{{ $t('标记没开成') }}</button>
                  <button v-if="d.status === 'failed'" type="button" class="ss-link" @click="retry(d)">{{ $t('改回已确认，重新开') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="issuedCount" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('这一批已开具 {n} 张，在「发票台账」里可以导出、附发票文件、登记红冲', { n: issuedCount }) }}</p>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 批量开票向导：销售方与通道 → 导入 → 校验 → 税收编码 → 组票确认 → 开具 → 回填。 */
import { computed, reactive, ref, watch } from 'vue';
import { IV_FIELDS, type IvBatchSummary, type IvChannel, type IvColumnGuess, type IvDraft, type IvGoods, type IvMergeMode, type IvRow, type IvSeller } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import {
  errorMessage, fieldLabel, iv, ivBatchId, ivState, kindLabel, money, openPath, pct, refreshState, scrollToStep,
  statusClass, statusLabel, type StepMeta, type StepRuntime,
} from './shared';

type Preview = IvColumnGuess & { path: string; sheets: string[] };
interface Exported { file: string; count: number; total: number; lines: number; unplaced: string[]; usedOfficial: boolean; templateIgnored: boolean; templateVersion: string; ownTemplate: boolean; warnings: string[]; ids: string[] }

const notif = useNotificationStore();
const state = ivState;
const batchId = ivBatchId;
const FIELDS = IV_FIELDS;
const busy = ref('');
const errors = ref<Record<string, string>>({});

// ── 1 销售方 ──
const seller = reactive<IvSeller>({ name: '', taxNo: '', address: '', phone: '', bank: '', bankAccount: '', drawer: '', taxpayerType: 'general', defaultTaxRate: 0.13, province: '', perInvoiceLimit: 0, remainingQuota: 0 });
const channel = ref<IvChannel>('etax_batch');
const mergeMode = ref<IvMergeMode>('buyer');
let seeded = false;
watch(state, (s) => {
  if (!s || seeded) return;
  seeded = true;
  Object.assign(seller, s.settings.seller);
  channel.value = s.settings.channel;
  mergeMode.value = s.settings.mergeMode;
}, { immediate: true });
const rateOptions = computed(() => (seller.taxpayerType === 'small' ? [0.01, 0.03, 0.05, 0] : [0.13, 0.09, 0.06, 0.05, 0.03, 0.01, 0]));
const channels: Array<{ key: IvChannel; icon: string; title: string; text: string }> = [
  { key: 'etax_batch', icon: 'ri-file-upload-line', title: i18nT('电子税务局批量开票（推荐）'), text: i18nT('不用接口、不用额外付费：系统浏览器打开电子税务局，你登录扫脸，应用走到批量开票页并放入导入文件，你点「批量开具」，结果自动读回') },
  { key: 'api', icon: 'ri-plug-line', title: i18nT('开票服务商接口（诺诺）'), text: i18nT('已经开通诺税通 SaaS 接口开票的企业用：提交后由服务商开具，结果按流水号查回；税局登录验证仍要你做') },
];
async function saveSeller(): Promise<void> {
  await run('i-seller', async () => {
    if (!seller.name.trim() || !seller.taxNo.trim()) throw new Error(i18nT('请填销售方名称和税号'));
    await iv('settings.patch', { patch: { seller: { ...seller }, channel: channel.value, mergeMode: mergeMode.value } });
  });
}

// ── 2 导入 ──
const previews = ref<Preview[]>([]);
const importNotes = ref<string[]>([]);
const showPaste = ref(false);
const pasteText = ref('');
const fileName = (p: string) => p.split(/[\\/]/).pop() || p;
const missingOf = (f: Preview) => FIELDS.filter((x) => x.required && !f.mapping[x.key]).map((x) => x.key);
async function pickExcel(): Promise<void> {
  const paths = await iv<string[]>('files.pick', { kind: 'excel', multi: true });
  await addExcel(paths);
}
async function addExcel(paths: string[]): Promise<void> {
  await run('i-import', async () => {
    for (const path of paths) {
      if (previews.value.some((f) => f.path === path)) continue;
      const g = await iv<IvColumnGuess & { sheets: string[] }>('import.preview', { path });
      previews.value.push({ ...g, path });
    }
  }, false);
}
async function changeSheet(i: number, sheet: string): Promise<void> {
  const f = previews.value[i];
  await run('i-import', async () => { previews.value[i] = { ...(await iv<IvColumnGuess & { sheets: string[] }>('import.preview', { path: f.path, sheet })), path: f.path }; }, false);
}
async function commitImport(): Promise<void> {
  importNotes.value = [];
  await run('i-import', async () => {
    const r = await iv<{ batchId: string; filled: number }>('import.commit', { items: previews.value.map((f) => ({ path: f.path, sheet: f.sheet, mapping: f.mapping })) });
    previews.value = [];
    batchId.value = r.batchId;
    if (r.filled) importNotes.value = [i18nT('有 {n} 行用客户档案补全了税号等信息', { n: r.filled })];
  });
}
async function pickSlips(): Promise<void> {
  const paths = await iv<string[]>('files.pick', { kind: 'slip', multi: true });
  if (paths.length) await importSlips(paths);
}
async function importSlips(paths: string[]): Promise<void> {
  importNotes.value = [];
  await run('i-import', async () => {
    const r = await iv<{ batchId: string; rejected: string[]; unreadable: string[] }>('import.slips', { paths, text: pasteText.value });
    batchId.value = r.batchId;
    pasteText.value = ''; showPaste.value = false;
    importNotes.value = [
      ...r.rejected.map((x) => i18nT('没有收下（和原文对不上）：{p0}', { p0: x })),
      ...(r.unreadable.length ? [i18nT('这些文件读不出文字：{p0}', { p0: r.unreadable.join('、') })] : []),
      i18nT('付款回单里通常没有税号和规范的开票项目，请在下一步补全'),
    ];
  });
}
async function removeBatch(): Promise<void> {
  if (!batchId.value || !window.confirm(i18nT('删除这一批导入的数据和它的发票草稿？'))) return;
  await run('i-import', async () => { await iv('batch.remove', { id: batchId.value }); batchId.value = ''; });
}

// ── 3 校验 ──
const rows = ref<IvRow[]>([]);
const summary = ref<IvBatchSummary | null>(null);
const onlyIssues = ref(true);
const hasError = (x: { issues: Array<{ level: string }> }) => x.issues.some((i) => i.level === 'error');
const shownRows = computed(() => (onlyIssues.value ? rows.value.filter((r) => r.issues.length || r.skipped) : rows.value).slice(0, 300));
const val = (e: Event) => (e.target as HTMLInputElement).value;
function applyRows(r: { rows: IvRow[]; summary: IvBatchSummary } | null): void { if (r) { rows.value = r.rows; summary.value = r.summary; } }
async function loadRows(): Promise<void> {
  if (!batchId.value) { rows.value = []; summary.value = null; codeItems.value = []; return; }
  applyRows(await iv('rows.list', { batchId: batchId.value }));
  await loadCodes();
}
async function patchRow(r: IvRow, patch: Partial<IvRow>): Promise<void> {
  await run('i-check', async () => { applyRows(await iv('rows.update', { id: r.id, patch })); await loadCodes(); }, false);
}
async function refill(): Promise<void> {
  await run('i-check', async () => { const r = await iv<{ filled: number; rows: IvRow[]; summary: IvBatchSummary }>('rows.refill', { batchId: batchId.value }); applyRows(r); notif.info(i18nT('补全了 {n} 行', { n: r.filled })); }, false);
}
async function trustCustomer(r: IvRow): Promise<void> {
  if (!window.confirm(i18nT('确认「{p0}」的税号 {p1} 核对无误，加入客户档案？', { p0: r.buyerName, p1: r.buyerTaxNo }))) return;
  await run('i-check', async () => { await iv('customers.upsert', { name: r.buyerName, taxNo: r.buyerTaxNo, batchId: batchId.value }); await loadRows(); });
}

// ── 4 编码 ──
const codeItems = ref<Array<{ name: string; goods: IvGoods | null }>>([]);
const codeEdit = reactive<Record<string, { taxCode: string; shortName: string }>>({});
const codeNote = ref('');
async function loadCodes(): Promise<void> {
  if (!batchId.value) return;
  const list = await iv<Array<{ name: string; goods: IvGoods | null }>>('goods.missing', { batchId: batchId.value });
  for (const x of list) if (!codeEdit[x.name] || (x.goods && !codeEdit[x.name].taxCode)) codeEdit[x.name] = { taxCode: x.goods?.taxCode || '', shortName: x.goods?.shortName || '' };
  codeItems.value = list;
}
async function suggestCodes(): Promise<void> {
  codeNote.value = '';
  await run('i-code', async () => {
    const r = await iv<{ suggested: number; unsure: string[] }>('goods.suggest', { batchId: batchId.value });
    await loadCodes();
    codeNote.value = i18nT('模型建议了 {a} 个，请逐条核对后点确认', { a: r.suggested }) + (r.unsure.length ? i18nT('；这些它没把握，要你自己查：{p0}', { p0: r.unsure.join('、') }) : '');
  });
}
async function saveCode(name: string): Promise<void> {
  await run('i-code', async () => { await iv('goods.upsert', { name, ...codeEdit[name] }); await loadCodes(); });
}

// ── 5 组票 ──
const drafts = computed<IvDraft[]>(() => (state.value?.drafts || []).filter((d) => d.batchId === batchId.value));
const locked = computed(() => drafts.value.some((d) => d.status !== 'draft' && d.status !== 'confirmed'));
const confirmed = computed(() => drafts.value.filter((d) => d.status === 'confirmed'));
const handed = computed(() => drafts.value.filter((d) => d.status === 'handed' || d.status === 'failed'));
const issuedCount = computed(() => drafts.value.filter((d) => d.status === 'issued').length);
const sumOf = (k: 'amount' | 'tax' | 'total') => Math.round(drafts.value.reduce((n, d) => n + Math.round(d[k] * 100), 0)) / 100;
const batchNet = computed(() => sumOf('amount'));
const quotaOver = computed(() => seller.remainingQuota > 0 && batchNet.value > seller.remainingQuota);
const opened = reactive(new Set<string>());
function toggleOpen(id: string): void { if (opened.has(id)) opened.delete(id); else opened.add(id); }
async function build(): Promise<void> {
  await run('i-build', async () => {
    await iv('settings.patch', { patch: { mergeMode: mergeMode.value, channel: channel.value } });
    await iv('drafts.build', { batchId: batchId.value });
    exported.value = null;
  });
}
async function confirm(ids: string[], on: boolean): Promise<void> {
  await run('i-build', async () => {
    const r = await iv<{ changed: number; blocked: number }>('drafts.confirm', { ids, confirmed: on });
    if (r.blocked) notif.warn(i18nT('{n} 张有错误，没有确认', { n: r.blocked }));
    exported.value = null;
  });
}
const confirmAll = () => confirm(drafts.value.filter((d) => d.status === 'draft').map((d) => d.id), true);

// ── 6 开具 ──
interface EtaxView { opened: boolean; kind: string; company: string; quota: number | null; need: string; templateVersion: string; note: string; sellerMismatch: boolean }
const exported = ref<Exported | null>(null);
const etax = ref<EtaxView | null>(null);
const attached = ref<{ previewCount: number; expected: number; missing: string[]; diff: string[]; messages: string[] } | null>(null);
const etaxWhere = computed(() => {
  const e = etax.value;
  if (!e || !e.opened) return i18nT('还没打开');
  return ({ portal: i18nT('门户（未登录）'), login: i18nT('登录页'), portal_login: i18nT('门户（已登录）'), invoice_business: i18nT('发票业务'), blue: i18nT('蓝字发票开具'), batch: i18nT('批量开票页'), makeout: i18nT('单张开票表单'), other: i18nT('其它页面') } as Record<string, string>)[e.kind] || e.kind;
});
const etaxNeedText = computed(() => ({
  login: i18nT('请在浏览器里登录电子税务局（企业业务，扫码或账号密码 + 扫脸），登录后再点「带我到批量开票页」'),
  face: i18nT('页面上弹出了扫脸二维码：请用电子税务局 APP 扫码完成扫脸认证，然后再点「带我到批量开票页」'),
  level: i18nT('页面提示「当前认证等级无法访问该功能」：请在页面上点「开始认证」完成实人认证，然后再点「带我到批量开票页」'),
  ack: i18nT('扫脸已通过：请在页面上点「我已知晓，继续开票」'),
  session: i18nT('数电平台的会话失效了：请回到门户页重新登录，再点「带我到批量开票页」'),
} as Record<string, string>)[etax.value?.need || ''] || '');
async function etaxDo(action: 'etax.open' | 'etax.goto' | 'etax.state'): Promise<void> {
  await run('i-issue', async () => { etax.value = await iv<EtaxView>(action, action === 'etax.goto' ? { goal: 'batch' } : {}); }, action !== 'etax.state');
}
async function exportBatch(): Promise<void> {
  attached.value = null;
  await run('i-issue', async () => { exported.value = await iv<Exported>('issue.exportBatch', { batchId: batchId.value }); });
}
async function attach(): Promise<void> {
  const ex = exported.value;
  if (!ex) return;
  await run('i-issue', async () => { attached.value = await iv('etax.attach', { file: ex.file, ids: ex.ids }); });
}
async function markHanded(ids: string[]): Promise<void> {
  await run('i-issue', async () => { await iv('drafts.status', { ids, status: 'handed' }); });
}
const api = reactive({ appKey: '', appSecret: '', token: '', sandbox: true, eleAccount: '' });
const apiErrors = ref<string[]>([]);
const verify = ref<{ type: '1' | '3'; already: boolean; verifyStatus: string; verifyData: string; failMsg: string } | null>(null);
const verifyDone = ref(false);
const smsCode = ref('');
watch(state, (s) => { if (s && !api.appKey && !api.eleAccount) Object.assign(api, { appKey: s.settings.api.appKey, sandbox: s.settings.api.sandbox, eleAccount: s.settings.api.eleAccount }); }, { immediate: true });
async function saveApi(): Promise<boolean> {
  const ok = await run('i-issue', () => iv('api.save', { appKey: api.appKey, sandbox: api.sandbox, eleAccount: api.eleAccount, ...(api.appSecret ? { appSecret: api.appSecret } : {}), ...(api.token ? { token: api.token } : {}) }));
  if (ok) { api.appSecret = ''; api.token = ''; }
  return ok;
}
async function apiLogin(type: '1' | '3'): Promise<void> {
  verifyDone.value = false; smsCode.value = '';
  if (!(await saveApi())) return;
  await run('i-issue', async () => { verify.value = { type, ...(await iv<{ already: boolean; verifyStatus: string; verifyData: string; failMsg: string }>('api.login.send', { type })) }; }, false);
}
async function apiVerify(): Promise<void> {
  const v = verify.value;
  if (!v) return;
  await run('i-issue', async () => {
    const r = await iv<{ verifyStatus: string; failMsg: string }>('api.login.submit', { type: v.type, ...(v.type === '1' ? { smsCode: smsCode.value } : {}) });
    verifyDone.value = r.verifyStatus === '4';
    verify.value = { ...v, failMsg: r.verifyStatus === '5' ? (r.failMsg || i18nT('验证失败')) : r.verifyStatus === '3' ? i18nT('还在验证中，请稍后再点一次') : '' };
  }, false);
}
async function apiSubmit(): Promise<void> {
  apiErrors.value = [];
  if (!api.sandbox && !window.confirm(i18nT('正式环境：确定把 {n} 张发票提交给服务商开具？提交后就会真的开出发票。', { n: confirmed.value.length }))) return;
  await run('i-issue', async () => { const r = await iv<{ submitted: number; errors: string[] }>('api.submit', { batchId: batchId.value }); apiErrors.value = r.errors; });
}

// ── 7 回填 ──
const noEdit = reactive<Record<string, string>>({});
const failEdit = reactive<Record<string, string>>({});
const ambiguous = ref<string[]>([]);
const fillNote = ref('');
async function importIssued(): Promise<void> {
  const paths = await iv<string[]>('files.pick', { kind: 'excel' });
  if (!paths.length) return;
  await run('i-fill', async () => {
    const r = await iv<{ matched: number; ambiguous: string[]; unmatched: number; records: number }>('ledger.importIssued', { path: paths[0] });
    ambiguous.value = r.ambiguous;
    fillNote.value = i18nT('表里 {a} 张有效发票：回填 {b} 张；{c} 张对不上唯一一条（标红，请手填）；{d} 张不属于待回填的发票', { a: r.records, b: r.matched, c: r.ambiguous.length, d: r.unmatched });
  });
}
async function readRecords(): Promise<void> {
  await run('i-fill', async () => {
    const r = await iv<{ records: number; issued: number; failed: number }>('etax.records');
    fillNote.value = i18nT('批量开票记录里读到 {a} 条：回填已开具 {b} 张，失败 {c} 张', { a: r.records, b: r.issued, c: r.failed });
  });
}
async function apiPoll(): Promise<void> {
  await run('i-fill', async () => {
    const r = await iv<{ checked: number; issued: number; failed: number; pending: number }>('api.poll');
    fillNote.value = i18nT('已开具 {a} 张，失败 {b} 张，还在开具中 {c} 张', { a: r.issued, b: r.failed, c: r.pending });
  });
}
async function retry(d: IvDraft): Promise<void> { await run('i-fill', () => iv('drafts.status', { ids: [d.id], status: 'confirmed' })); }
async function markIssued(d: IvDraft): Promise<void> {
  await run('i-fill', () => iv('drafts.status', { ids: [d.id], status: 'issued', invoiceNo: noEdit[d.id] }));
}
async function markFailed(d: IvDraft): Promise<void> {
  await run('i-fill', () => iv('drafts.status', { ids: [d.id], status: 'failed', failReason: failEdit[d.id] || '' }));
}

// ── 步骤状态 ──
const metas: StepMeta[] = [
  { key: 'i-seller', title: i18nT('销售方与开票通道'), hint: i18nT('确认是哪家公司开票、走哪条通道') },
  { key: 'i-import', title: i18nT('导入付款单或表格'), hint: i18nT('Excel / CSV 自动识别列；付款回单由模型读出后回原文核对') },
  { key: 'i-check', title: i18nT('逐行校验'), hint: i18nT('税号、名称与税号是否矛盾、金额、税率、重复开票') },
  { key: 'i-code', title: i18nT('税收分类编码'), hint: i18nT('每个开票项目对应一个 19 位编码，确认一次以后都记得') },
  { key: 'i-build', title: i18nT('组票与确认'), hint: i18nT('按规则合并、拆票、算税，逐张确认') },
  { key: 'i-issue', title: i18nT('开具'), hint: i18nT('电子税务局批量开票或服务商接口；最终按钮由你点') },
  { key: 'i-fill', title: i18nT('回填发票号码'), hint: i18nT('按发票流水号读回结果，进入台账') },
];
function st(key: string, done: boolean, sum?: string): StepRuntime {
  if (busy.value === key) return { state: 'running' };
  if (errors.value[key]) return { state: 'failed', error: errors.value[key] };
  return done ? { state: 'done', summary: sum } : { state: 'todo' };
}
const sellerSaved = computed(() => !!state.value?.settings.seller.name && !!state.value?.settings.seller.taxNo);
const runtime = computed<Record<string, StepRuntime>>(() => {
  const s = summary.value;
  const codesOk = codeItems.value.length > 0 && codeItems.value.every((x) => x.goods?.confirmed);
  return {
    'i-seller': st('i-seller', sellerSaved.value, state.value?.settings.seller.name),
    'i-import': st('i-import', !!batchId.value, s ? i18nT('{n} 行', { n: s.rows }) : ''),
    'i-check': st('i-check', !!s && s.rows > s.skipped && s.errors === 0, s ? i18nT('{a} 家购买方，合计 {b} 元', { a: s.buyers, b: money(s.total) }) : ''),
    'i-code': st('i-code', !!batchId.value && codesOk),
    'i-build': st('i-build', drafts.value.length > 0 && !drafts.value.some((d) => d.status === 'draft' && !hasError(d)), i18nT('{n} 张', { n: drafts.value.length })),
    'i-issue': st('i-issue', drafts.value.length > 0 && confirmed.value.length === 0 && drafts.value.some((d) => d.status === 'handed' || d.status === 'issued')),
    'i-fill': st('i-fill', issuedCount.value > 0 && handed.value.length === 0, i18nT('已开具 {n} 张', { n: issuedCount.value })),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'i-fill');

async function run(key: string, fn: () => Promise<unknown>, refresh = true): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); if (refresh) await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
function jump(key: string): void { void scrollToStep(key); }

watch(batchId, () => { exported.value = null; attached.value = null; apiErrors.value = []; ambiguous.value = []; fillNote.value = ''; codeNote.value = ''; void loadRows().catch((e) => notif.error(errorMessage(e))); }, { immediate: true });
defineExpose({ addExcel });
</script>

<style scoped>
.iv-channels { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; }
.iv-channel { display: grid; gap: 4px; text-align: start; padding: 12px; border-radius: var(--radius-5); border: 2px solid var(--color-border); background: var(--color-bg-card); font: inherit; font-size: 12.5px; color: var(--color-text-secondary); cursor: pointer; line-height: 1.55; }
.iv-channel strong { display: flex; gap: 6px; align-items: center; color: var(--color-text-primary); font-size: 13.5px; }
.iv-channel.on { border-color: var(--color-brand); }
.iv-channel.on strong { color: var(--color-brand); }
.iv-paste { display: grid; gap: 8px; justify-items: start; }
.iv-paste textarea { width: 100%; box-sizing: border-box; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); padding: 8px 10px; resize: vertical; }
.iv-preview { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.iv-preview__head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: var(--font-size-md); }
.iv-preview__head b { display: inline-flex; gap: 6px; align-items: center; }
.iv-preview__head select { height: 28px; border-radius: var(--radius-2); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); }
.iv-map { display: grid; gap: 8px 12px; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
.iv-map em { color: var(--color-danger); font-style: normal; margin-inline-start: 2px; }
.iv-check { display: inline-flex; gap: 5px; align-items: center; font-size: 12.5px; }
.iv-rows { max-height: 460px; overflow-y: auto; }
.iv-rows input[type="text"] { min-width: 150px; }
.iv-mono { font-family: var(--font-mono); }
.iv-num { width: 110px; text-align: end; }
.iv-code { min-width: 190px; }
.iv-issues { white-space: normal !important; max-width: 320px; }
.iv-issues .ss-chip { white-space: normal; border-radius: var(--radius-3); margin: 1px 2px 1px 0; text-align: start; }
.iv-ops { display: flex; gap: 10px; align-items: center; }
.iv-skipped td { opacity: .5; }
.iv-bad { color: var(--color-danger); }
.iv-draft { display: grid; gap: 8px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.iv-draft.bad { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); }
.iv-draft__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: var(--font-size-md); }
.iv-draft__head code { font-size: 11.5px; color: var(--color-text-secondary); }
.iv-grow { flex: 1; }
.iv-sub-step { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.iv-sub-step > b { font-size: var(--font-size-md); }
.iv-etax { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 12.5px; }
.iv-serial { font-size: 11.5px; color: var(--color-text-secondary); }
.iv-qr { display: block; padding: 8px 10px; border-radius: var(--radius-3); background: var(--color-bg-hover); font-size: 11.5px; word-break: break-all; }
.iv-sms { width: 140px; height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); padding: 0 8px; }
.iv-total { font-weight: 800; font-variant-numeric: tabular-nums; }
.spin { animation: iv-spin 1s linear infinite; }
@keyframes iv-spin { to { transform: rotate(360deg); } }
</style>
