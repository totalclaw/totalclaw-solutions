<template>
  <section class="ss-module">
    <StickyProgress :title="$t('服务营销激励结案')" :metas="steps.metas" :runtime="steps.runtime" :current-key="steps.currentKey.value" @jump="scrollToStep" />

    <div class="ss-steps">
      <!-- 1 有赞订单 -->
      <StepCard step-key="youzan" :index="0" :title="steps.metas[0].title" :hint="steps.metas[0].hint" :runtime="steps.runtime.youzan" :is-current="steps.currentKey.value === 'youzan'">
        <div class="ss-rule-row">
          <span class="lbl">{{ $t('结案季度') }}</span>
          <input v-model.number="year" type="number" min="2020" max="2099" style="width: 90px" />
          <select v-model.number="quarter"><option :value="1">{{ $t('Q1（1–3 月）') }}</option><option :value="2">{{ $t('Q2（4–6 月）') }}</option><option :value="3">{{ $t('Q3（7–9 月）') }}</option><option :value="4">{{ $t('Q4（10–12 月）') }}</option></select>
          <span class="lbl">{{ $t('有赞商城网址') }}</span>
          <input v-model="youzanUrl" type="text" style="width: 280px; text-align: left;" placeholder="https://www.youzan.com/v4/..." @change="saveUrls" />
          <button type="button" class="ss-btn sm" :disabled="!youzanUrl" @click="openYouzan"><i class="ri-external-link-line"></i>{{ $t('打开有赞，查询并导出本季度辅材订单') }}</button>
          <button type="button" class="ss-btn sm ghost" @click="loadDownloads('orders')"><i class="ri-download-cloud-2-line"></i>{{ $t('从浏览器下载记录导入') }}</button>
        </div>
        <div v-if="downloads.orders.length" class="ss-dl">
          <button v-for="d in downloads.orders" :key="d.path" type="button" class="ss-chip brand" @click="addTables(orders, [d.path], ORDER_ROLES)"><i class="ri-file-excel-2-line"></i>{{ d.filename }}</button>
        </div>
        <FileDropField :label="$t('有赞导出的辅材销售订单 Excel')" :hint="$t('导出后把文件拖进来即可；「订单创建季度 / 月份」这类标签列（Q1、4月、04）也能按季度筛')" :files="chips(orders)" @picked="(p) => addTables(orders, p, ORDER_ROLES)" @remove="(p) => remove(orders, p)" />
        <TableMapping v-for="(t, i) in orders" :key="t.path + t.sheetName" :table="t" :roles="ORDER_ROLES" @update="(m) => (orders[i].mapping = m)" @sheet="(s) => reload(orders, i, s, ORDER_ROLES)" />
        <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="!orders.length || steps.isRunning()" @click="confirmOrders"><i class="ri-check-line"></i>{{ $t('订单选好了，下一步') }}</button></div>
      </StepCard>

      <!-- 2 辅材达成 -->
      <StepCard step-key="aux" :index="1" :title="steps.metas[1].title" :hint="steps.metas[1].hint" :runtime="steps.runtime.aux" :is-current="steps.currentKey.value === 'aux'">
        <div class="ss-grid">
          <div class="ss-source">
            <div class="ss-subhead">{{ $t('服务商季度任务表（可含区域经理归属、电动止回阀目标、年度任务）') }}</div>
            <FileDropField :label="$t('服务商任务 Excel')" :multi="false" compact :files="providerTasks ? [{ path: providerTasks.path, name: providerTasks.fileName }] : []" @picked="(p) => loadSingle('providerTasks', p[0], PTASK_ROLES)" @remove="providerTasks = null" />
            <TableMapping v-if="providerTasks" :table="providerTasks" :roles="PTASK_ROLES" @update="(m) => (providerTasks!.mapping = m)" @sheet="(s) => loadSingle('providerTasks', providerTasks!.path, PTASK_ROLES, s)" />
          </div>
          <div class="ss-source">
            <div class="ss-subhead">{{ $t('区域经理季度任务表') }}</div>
            <FileDropField :label="$t('区域经理任务 Excel')" :multi="false" compact :files="managerTasks ? [{ path: managerTasks.path, name: managerTasks.fileName }] : []" @picked="(p) => loadSingle('managerTasks', p[0], MTASK_ROLES)" @remove="managerTasks = null" />
            <TableMapping v-if="managerTasks" :table="managerTasks" :roles="MTASK_ROLES" @update="(m) => (managerTasks!.mapping = m)" @sheet="(s) => loadSingle('managerTasks', managerTasks!.path, MTASK_ROLES, s)" />
          </div>
        </div>
        <div class="ss-grid">
          <div class="ss-source">
            <div class="ss-subhead">{{ $t('可选 · 区域经理绩效等级表（S / A / B+ / B / C → 绩效系数）') }}</div>
            <FileDropField :label="$t('绩效等级 Excel')" :multi="false" compact :files="gradeTable ? [{ path: gradeTable.path, name: gradeTable.fileName }] : []" @picked="(p) => loadSingle('gradeTable', p[0], GRADE_ROLES)" @remove="gradeTable = null" />
            <TableMapping v-if="gradeTable" :table="gradeTable" :roles="GRADE_ROLES" @update="(m) => (gradeTable!.mapping = m)" @sheet="(s) => loadSingle('gradeTable', gradeTable!.path, GRADE_ROLES, s)" />
          </div>
          <div class="ss-source">
            <div class="ss-subhead">{{ $t('可选 · 服务商信息表（引入时间 → 服务年限 → 呆滞配件返利；经理归属兜底）') }}</div>
            <FileDropField :label="$t('服务商信息 Excel')" :multi="false" compact :files="providerInfo ? [{ path: providerInfo.path, name: providerInfo.fileName }] : []" @picked="(p) => loadSingle('providerInfo', p[0], INFO_ROLES)" @remove="providerInfo = null" />
            <TableMapping v-if="providerInfo" :table="providerInfo" :roles="INFO_ROLES" @update="(m) => (providerInfo!.mapping = m)" @sheet="(s) => loadSingle('providerInfo', providerInfo!.path, INFO_ROLES, s)" />
          </div>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="steps.runtime.youzan.state !== 'done' || !providerTasks || steps.isRunning()" @click="computeAux"><i :class="spin('aux', 'ri-calculator-line')"></i>{{ $t('计算辅材实际达成与达成率') }}</button>
        </div>
        <template v-if="aux">
          <p v-for="w in aux.warnings" :key="w" class="ss-note warn"><i class="ri-alert-line"></i>{{ w }}</p>
          <div class="ss-grid">
            <div class="ss-table-wrap" style="max-height: 300px; overflow: auto;">
              <table class="ss-table">
                <thead><tr><th>{{ $t('服务商') }}</th><th>{{ $t('区域经理') }}</th><th class="num">{{ $t('实际') }}</th><th class="num">{{ $t('任务') }}</th><th class="num">{{ $t('达成率') }}</th><th v-if="hasQualifier" class="num">{{ $t('门槛品类实际/任务') }}</th></tr></thead>
                <tbody><tr v-for="p in aux.providers" :key="p.name" :class="{ bad: p.task > 0 && p.rate < 0.8 }"><td>{{ p.name }}</td><td>{{ p.manager }}</td><td class="num">{{ fmtMoney(p.actual) }}</td><td class="num">{{ fmtMoney(p.task) }}</td><td class="num">{{ fmtPct(p.rate, 1) }}</td><td v-if="hasQualifier" class="num">{{ fmtMoney(p.qualifierActual || 0) }} / {{ fmtMoney(p.qualifierTask || 0) }}</td></tr></tbody>
              </table>
            </div>
            <div class="ss-table-wrap" style="max-height: 300px; overflow: auto;">
              <table class="ss-table">
                <thead><tr><th>{{ $t('区域经理') }}</th><th class="num">{{ $t('实际') }}</th><th class="num">{{ $t('任务') }}</th><th class="num">{{ $t('达成率') }}</th></tr></thead>
                <tbody><tr v-for="m in aux.managers" :key="m.name"><td>{{ m.name }}</td><td class="num">{{ fmtMoney(m.actual) }}</td><td class="num">{{ fmtMoney(m.task) }}</td><td class="num">{{ fmtPct(m.rate, 1) }}</td></tr></tbody>
              </table>
            </div>
          </div>
        </template>
      </StepCard>

      <!-- 3 规则 PDF → 初始激励 -->
      <StepCard step-key="rules" :index="2" :title="steps.metas[2].title" :hint="steps.metas[2].hint" :runtime="steps.runtime.rules" :is-current="steps.currentKey.value === 'rules'">
        <FileDropField :label="$t('【服务营销激励计算规则】PDF')" :hint="$t('支持多选、拖入和追加多个 PDF；选齐后统一抽取，扫描件会先做 OCR')" kind="pdf" :multi="true" :disabled="steps.isRunning()" :files="rulesPdfs.map(path => ({ path, name: baseName(path) }))" @picked="addRulesPdfs" @remove="removeRulesPdf" />
        <div class="ss-actions"><button type="button" class="ss-btn" :disabled="!rulesPdfs.length || steps.isRunning()" @click="extractRules"><i class="ri-sparkling-line"></i>{{ $t('{p0}（{p1}）', { p0: $t('读取全部 PDF 并抽取规则'), p1: rulesPdfs.length }) }}</button></div>
        <div v-if="rulesError" class="ss-error-banner"><i class="ri-error-warning-fill"></i><div><strong>{{ $t('规则未抽取成功，下方仍是上次的规则') }}</strong><div>{{ rulesError }}</div></div></div>
        <p v-if="rulesNote" class="ss-note" :class="rulesNoteKind"><i class="ri-sparkling-line"></i>{{ rulesNote }}</p>
        <!-- 不阻塞但需要人工核对的事情单独用警告色。混进上面那条绿色成功提示里等于没提示。 -->
        <p v-if="rulesWarn" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ rulesWarn }}</p>
        <div v-if="rulesDraft" class="ss-rules">
          <h4>{{ $t('待核对草稿（尚未应用）') }}</h4>
          <p class="ss-note warn">{{ $t('仅列出本批文件有引用的字段。其余字段未提取，应用后仍保留现有设置，不代表来自此 PDF。') }}</p>
          <div v-for="review in rulesDraft.documents || []" :key="review.file"><strong>{{ rulesPdfs[review.file - 1]?.split(/[\\/]/).pop() }}</strong><p>{{ review.subject }} · {{ review.period }}</p><p>{{ review.conditions }}</p><p>{{ review.uncertainties }}</p></div>
          <p>{{ $t('{p0}：{p1}', { p0: $t('未提取字段（不代表原文未规定）'), p1: rulesDraft.missing.join('、') }) }}</p>
          <div v-for="field in rulesDraft.extracted" :key="field">
            <strong>{{ field }}</strong><pre style="white-space: pre-wrap">{{ JSON.stringify(rulesDraft.draft[field], null, 2) }}</pre>
            <blockquote v-for="(e, i) in rulesDraft.evidence.filter((e: any) => e.field === field)" :key="i">
              {{ $t('{p0} · {p1}：{p2}', { p0: baseName(rulesPdfs[e.file - 1] || ''), p1: $t('第 {n} 页', { n: e.page }), p2: e.quote }) }}
            </blockquote>
          </div>
          <button type="button" class="ss-btn" @click="applyRulesDraft">{{ $t('已核对，仅应用以上字段并保留其余现有设置') }}</button>
        </div>
        <p v-if="rulesChangedNote" class="ss-note warn"><i class="ri-alert-line"></i>{{ rulesChangedNote }}</p>
        <div class="ss-rules">
          <h4><i class="ri-file-list-3-line"></i>{{ $t('规则（来源：{s}）', { s: rules.source || $t('默认') }) }}</h4>
          <div class="ss-actions">
            <!-- 预设不受 isRunning 约束：扫描件 OCR 最坏十几分钟，等的时候得能直接套预设（P1-8；晚到的抽取结果按序号丢弃） -->
            <button type="button" class="ss-btn sm" @click="applyPreset"><i class="ri-magic-line"></i>{{ $t('套用 2026 默认政策') }}</button>
            <button type="button" class="ss-btn sm ghost" @click="resetRules"><i class="ri-refresh-line"></i>{{ $t('恢复示例规则') }}</button>
            <button v-if="rulesReviewPending || rulesError || rulesDraft" type="button" class="ss-btn sm ghost" @click="confirmManualRules">{{ $t('已对照原件核对下方全部规则，使用手工设置') }}</button>
            <span class="ss-muted">{{ $t('档位「整体」= 命中区间时实际 × 比例；「边际」= 目标倍数区间内的增量 × 比例累加（如 A×3% + (B−A)×4%）') }}</span>
          </div>

          <div class="ss-subhead">{{ $t('A · 服务商辅材提货激励') }}</div>
          <div class="ss-rule-row">
            <span class="lbl">{{ $t('达成率低于') }}</span><input v-model.number="rules.auxMinRatePct" type="number" min="0" /><span class="lbl">{{ $t('% 无激励') }}</span>
            <label class="ss-switch"><input v-model="rules.auxMissingTaskAsMet" type="checkbox" /><span>{{ $t('未制定任务的服务商视同达成（按基础档计）') }}</span></label>
          </div>
          <div v-for="(t, i) in rules.auxTiers" :key="'a' + i" class="ss-rule-row">
            <span class="lbl">{{ $t('达成率') }}</span><input v-model.number="t.fromPct" type="number" min="0" /><span class="lbl">% ~</span><input v-model.number="t.toPct" type="number" min="0" :placeholder="$t('无上限')" /><span class="lbl">%</span>
            <select v-model="t.basis"><option value="marginal">{{ $t('边际') }}</option><option value="whole">{{ $t('整体') }}</option><option value="fixed">{{ $t('固定金额') }}</option></select>
            <template v-if="t.basis === 'fixed'"><input v-model.number="t.fixed" type="number" min="0" /><span class="lbl">{{ $t('元') }}</span></template>
            <template v-else><input v-model.number="t.ratioPct" type="number" step="0.1" min="0" /><span class="lbl">%</span><span class="lbl">×</span><input v-model.number="t.factor" type="number" step="0.1" min="0" style="width: 60px" /></template>
            <button type="button" class="ss-link" @click="rules.auxTiers.splice(i, 1)">{{ $t('删除') }}</button>
          </div>
          <button type="button" class="ss-link" @click="rules.auxTiers.push(newTier())">+ {{ $t('加一档') }}</button>
          <div class="ss-rule-row">
            <label class="ss-switch"><input v-model="rules.qualifierEnabled" type="checkbox" /><span>{{ $t('门槛品类有任务时须达成季度任务，否则提货激励不发') }}</span></label>
            <input v-model="rules.qualifierPattern" type="text" style="width: 140px; text-align: left;" :placeholder="$t('如 电动止回阀')" /><span class="ss-muted">{{ $t('订单表「产品」列命中即计入门槛实际；任务取任务表「门槛品类任务」列') }}</span>
          </div>
          <div class="ss-rule-row">
            <label class="ss-switch"><input v-model="rules.rebateEnabled" type="checkbox" /><span>{{ $t('呆滞配件返利：实际提货 ≥ 任务目标时按服务年限返利') }}</span></label>
            <span class="lbl">{{ $t('年限截止') }}</span><select v-model="rules.rebateYearsAsOf"><option value="lastMonthStart">{{ $t('季度开始前一个月的 1 日') }}</option><option value="quarterStart">{{ $t('季度开始前一日') }}</option><option value="quarterEnd">{{ $t('季度末') }}</option></select>
          </div>
          <div v-for="(t, i) in rules.rebateTiers" :key="'r' + i" class="ss-rule-row">
            <span class="lbl">{{ $t('服务年限 ≥') }}</span><input v-model.number="t.minYears" type="number" min="0" /><span class="lbl">{{ $t('年 → 返利') }}</span><input v-model.number="t.ratioPct" type="number" step="0.5" min="0" /><span class="lbl">%</span>
            <button type="button" class="ss-link" @click="rules.rebateTiers.splice(i, 1)">{{ $t('删除') }}</button>
          </div>
          <button type="button" class="ss-link" @click="rules.rebateTiers.push({ minYears: 0, ratioPct: 5 })">+ {{ $t('加一档返利') }}</button>

          <div class="ss-subhead">{{ $t('B · 区域经理（辅材、延保各算一次）') }}</div>
          <div class="ss-rule-row">
            <span class="lbl">{{ $t('完成率低于') }}</span><input v-model.number="rules.managerMinRatePct" type="number" min="0" /><span class="lbl">{{ $t('% 无激励；季度预发提成按') }}</span><input v-model.number="rules.managerAdvanceRatioPct" type="number" step="0.1" min="0" /><span class="lbl">{{ $t('% 基础比例（0 = 预发即准确）') }}</span>
          </div>
          <div v-for="(t, i) in rules.managerTiers" :key="'m' + i" class="ss-rule-row">
            <span class="lbl">{{ $t('完成率') }}</span><input v-model.number="t.fromPct" type="number" min="0" /><span class="lbl">% ~</span><input v-model.number="t.toPct" type="number" min="0" :placeholder="$t('无上限')" /><span class="lbl">%</span>
            <select v-model="t.basis"><option value="marginal">{{ $t('边际') }}</option><option value="whole">{{ $t('整体') }}</option><option value="fixed">{{ $t('固定金额') }}</option></select>
            <template v-if="t.basis === 'fixed'"><input v-model.number="t.fixed" type="number" min="0" /><span class="lbl">{{ $t('元') }}</span></template>
            <template v-else><input v-model.number="t.ratioPct" type="number" step="0.1" min="0" /><span class="lbl">%</span><span class="lbl">×</span><input v-model.number="t.factor" type="number" step="0.1" min="0" style="width: 60px" /></template>
            <button type="button" class="ss-link" @click="rules.managerTiers.splice(i, 1)">{{ $t('删除') }}</button>
          </div>
          <button type="button" class="ss-link" @click="rules.managerTiers.push(newTier())">+ {{ $t('加一档') }}</button>
          <div class="ss-rule-row">
            <span class="lbl">{{ $t('基础激励每项最高') }}</span><input v-model.number="rules.managerBase.perItemMax" type="number" min="0" /><span class="lbl">{{ $t('元（完成率 ≥') }}</span><input v-model.number="rules.managerBase.minRatePct" type="number" min="0" /><span class="lbl">{{ $t('% 按完成率折算，≥100% 给满），每季度最高') }}</span><input v-model.number="rules.managerBase.quarterMax" type="number" min="0" /><span class="lbl">{{ $t('元（0 = 不封顶）') }}</span>
            <label class="ss-switch"><input v-model="rules.managerBase.applyCoefficient" type="checkbox" /><span>{{ $t('基础也乘绩效系数') }}</span></label>
            <label class="ss-switch"><input v-model="rules.managerBase.applyDiscount" type="checkbox" /><span>{{ $t('基础也打折') }}</span></label>
          </div>
          <div v-for="(t, i) in rules.managerDiscountTiers" :key="'d' + i" class="ss-rule-row">
            <span class="lbl">{{ $t('区域经理延保达成率 <') }}</span><input v-model.number="t.belowRatePct" type="number" min="0" /><span class="lbl">%</span>
            <span class="lbl">→ {{ $t('辅材提成打') }}</span><input v-model.number="t.discountZhe" type="number" step="0.5" min="0" max="10" /><span class="lbl">{{ $t('折') }}</span>
            <button type="button" class="ss-link" @click="rules.managerDiscountTiers.splice(i, 1)">{{ $t('删除') }}</button>
          </div>
          <button type="button" class="ss-link" @click="rules.managerDiscountTiers.push({ belowRatePct: 80, discountZhe: 8 })">+ {{ $t('加一档打折') }}</button>
          <div class="ss-rule-row">
            <span class="lbl">{{ $t('绩效系数') }}</span>
            <template v-for="(c, i) in rules.coefficients" :key="'c' + i"><input v-model="c.grade" type="text" style="width: 50px" /><span class="lbl">:</span><input v-model.number="c.value" type="number" step="0.1" min="0" style="width: 60px" /><button type="button" class="ss-link" @click="rules.coefficients.splice(i, 1)">×</button></template>
            <button type="button" class="ss-link" @click="rules.coefficients.push({ grade: '', value: 1 })">+ {{ $t('加等级') }}</button>
          </div>

          <div class="ss-subhead">{{ $t('C · 服务商延保 & 负责人') }}</div>
          <div class="ss-rule-row">
            <span class="lbl">{{ $t('延保激励方式') }}</span>
            <select v-model="rules.warrantyMode"><option value="perOrder">{{ $t('每单固定金额') }}</option><option value="ratio">{{ $t('延保实际 × 档位比例（服务商 / 负责人分开）') }}</option></select>
            <template v-if="rules.warrantyMode === 'perOrder'"><input v-model.number="rules.warrantyPerOrder" type="number" min="0" /><span class="lbl">{{ $t('元/单') }}</span></template>
          </div>
          <template v-if="rules.warrantyMode === 'ratio'">
            <div v-for="(t, i) in rules.warrantyTiers" :key="'w' + i" class="ss-rule-row">
              <span class="lbl">{{ $t('延保达成率 ≥') }}</span><input v-model.number="t.minRatePct" type="number" min="0" /><span class="lbl">%</span>
              <span class="lbl">→ {{ $t('服务商') }}</span><input v-model.number="t.providerRatioPct" type="number" step="0.1" min="0" /><span class="lbl">%</span>
              <span class="lbl">+ {{ $t('负责人') }}</span><input v-model.number="t.leaderRatioPct" type="number" step="0.1" min="0" /><span class="lbl">%</span>
              <button type="button" class="ss-link" @click="rules.warrantyTiers.splice(i, 1)">{{ $t('删除') }}</button>
            </div>
            <button type="button" class="ss-link" @click="rules.warrantyTiers.push({ minRatePct: 100, providerRatioPct: 5, leaderRatioPct: 3 })">+ {{ $t('加一档') }}</button>
          </template>
          <div v-if="rules.warrantyMode === 'perOrder' || !rules.warrantyTiers.some((t) => t.leaderRatioPct > 0)" class="ss-rule-row">
            <span class="lbl">{{ $t('负责人激励 =') }}</span>
            <select v-model="rules.leaderShareBase"><option value="both">{{ $t('辅材 + 延保激励') }}</option><option value="warranty">{{ $t('延保激励') }}</option><option value="aux">{{ $t('辅材激励') }}</option></select>
            <span class="lbl">×</span><input v-model.number="rules.leaderShareRatioPct" type="number" step="0.1" min="0" /><span class="lbl">%</span>
          </div>
          <div class="ss-rule-row">
            <span class="lbl">{{ $t('呆滞配件退回期限') }}</span><input v-model.number="rules.returnDueDays" type="number" min="1" /><span class="lbl">{{ $t('天，到期前') }}</span><input v-model.number="rules.returnRemindBeforeDays" type="number" min="0" /><span class="lbl">{{ $t('天二次提醒') }}</span>
          </div>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="rulesReviewPending || !!rulesDraft || !!rulesError || steps.runtime.aux.state !== 'done' || steps.isRunning()" @click="computeInitial"><i :class="spin('rules', 'ri-calculator-line')"></i>{{ $t('按规则计算服务商辅材激励初始金额') }}</button>
        </div>
        <template v-if="incentive">
          <p v-for="w in incentive.warnings || []" :key="w" class="ss-note warn"><i class="ri-alert-line"></i>{{ w }}</p>
          <div class="ss-table-wrap" style="max-height: 320px; overflow: auto;">
            <table class="ss-table">
              <thead><tr><th>{{ $t('服务商') }}</th><th class="num">{{ $t('辅材实际') }}</th><th class="num">{{ $t('达成率') }}</th><th class="num">{{ $t('折算比例') }}</th><th class="num">{{ $t('提货激励(元)') }}</th><th>{{ $t('门槛品类') }}</th><th class="num">{{ $t('服务年限') }}</th><th class="num">{{ $t('呆滞返利(元)') }}</th><th class="num">{{ $t('合计(元)') }}</th><th>{{ $t('说明') }}</th></tr></thead>
              <tbody>
                <tr v-for="p in incentive.providers" :key="p.provider" :class="{ bad: p.qualifierMet === false }">
                  <td>{{ p.provider }}</td><td class="num">{{ fmtMoney(p.auxActual) }}</td><td class="num">{{ fmtPct(p.auxRate, 1) }}</td><td class="num">{{ fmtPct(p.auxRatio, 2) }}</td><td class="num"><strong>{{ fmtMoney(p.auxInitial) }}</strong></td>
                  <td><span v-if="p.qualifierMet === null" class="ss-muted">{{ $t('不涉及') }}</span><span v-else class="ss-chip" :class="p.qualifierMet ? 'ok' : 'bad'">{{ p.qualifierMet ? $t('达成') : $t('未达成') }} {{ fmtMoney(p.qualifierActual) }}/{{ fmtMoney(p.qualifierTask) }}</span></td>
                  <td class="num">{{ p.serviceYears ?? '-' }}</td><td class="num">{{ p.rebateAmount ? fmtMoney(p.rebateAmount) + ' (' + fmtPct(p.rebateRatio, 0) + ')' : '-' }}</td><td class="num"><strong>{{ fmtMoney(p.providerTotal) }}</strong></td><td class="ss-muted">{{ p.auxNote || '' }}</td>
                </tr>
                <tr class="total"><td>{{ $t('合计') }}</td><td></td><td></td><td></td><td class="num">{{ fmtMoney(incentive.totals.auxInitial) }}</td><td></td><td></td><td class="num">{{ fmtMoney(incentive.totals.rebateAmount) }}</td><td class="num">{{ fmtMoney(incentive.totals.providerTotal) }}</td><td></td></tr>
              </tbody>
            </table>
          </div>
        </template>
      </StepCard>

      <!-- 4 退回通知 -->
      <StepCard step-key="return" :index="3" :title="steps.metas[3].title" :hint="steps.metas[3].hint" :runtime="steps.runtime.return" :is-current="steps.currentKey.value === 'return'">
        <div class="ss-rule-row">
          <span class="lbl">{{ $t('退回截止日') }}</span><input v-model="returnDue" type="date" style="width: 150px; text-align: left;" />
          <span class="ss-muted">{{ $t('（默认今天 + {n} 天；距截止 {m} 天仍未退回的服务商会自动发二次提醒）', { n: rules.returnDueDays, m: rules.returnRemindBeforeDays }) }}</span>
        </div>
        <div class="ss-table-wrap" style="max-height: 320px; overflow: auto;">
          <table class="ss-table">
            <thead><tr><th></th><th>{{ $t('服务商') }}</th><th>{{ $t('邮箱') }}</th><th class="num">{{ $t('需退回等额(元)') }}</th><th>{{ $t('通知') }}</th><th>{{ $t('二次提醒') }}</th><th>{{ $t('已退回') }}</th></tr></thead>
            <tbody>
              <tr v-for="p in (incentive?.providers || [])" :key="p.provider">
                <td><input v-model="selReturn[p.provider]" type="checkbox" /></td>
                <td>{{ p.provider }}</td>
                <td><input :value="contactEmail(p.provider)" type="email" :placeholder="$t('填写邮箱')" @change="saveContactEmail(p.provider, ($event.target as HTMLInputElement).value)" /></td>
                <td class="num">{{ fmtMoney(p.auxInitial) }}</td>
                <td><span v-if="ret(p.provider)?.notifiedAt" class="ss-chip ok">{{ fmtDate(ret(p.provider)?.notifiedAt) }} · {{ $t('截止') }} {{ ret(p.provider)?.dueDate }}</span><span v-else-if="ret(p.provider)?.notifyError" class="ss-chip bad" :title="ret(p.provider)?.notifyError">{{ $t('失败') }}</span><span v-else class="ss-chip">{{ $t('未通知') }}</span></td>
                <td><span v-if="ret(p.provider)?.secondNoticeAt" class="ss-chip warn">{{ fmtDate(ret(p.provider)?.secondNoticeAt) }}</span><span v-else class="ss-muted">-</span></td>
                <td><label class="ss-switch"><input type="checkbox" :checked="!!ret(p.provider)?.returned" @change="markReturned(p.provider, ($event.target as HTMLInputElement).checked)" /><span>{{ ret(p.provider)?.returned ? fmtDate(ret(p.provider)?.returnedAt) : $t('未退回') }}</span></label></td>
              </tr>
              <tr v-if="!incentive"><td colspan="7" class="ss-muted">{{ $t('先完成第 3 步') }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn ghost sm" @click="toggleSel(selReturn, true)">{{ $t('全选') }}</button>
          <button type="button" class="ss-btn ghost sm" @click="toggleSel(selReturn, false)">{{ $t('全不选') }}</button>
          <span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="!incentive || !selectedOf(selReturn).length || steps.isRunning()" @click="notify('return', 'return')"><i :class="spin('return', 'ri-mail-send-line')"></i>{{ $t('向选中的 {n} 家发送退回通知', { n: selectedOf(selReturn).length }) }}</button>
        </div>
      </StepCard>

      <!-- 5 延保达成 -->
      <StepCard step-key="warranty" :index="4" :title="steps.metas[4].title" :hint="steps.metas[4].hint" :runtime="steps.runtime.warranty" :is-current="steps.currentKey.value === 'warranty'">
        <div class="ss-rule-row">
          <span class="lbl">{{ $t('CSS 系统网址') }}</span>
          <input v-model="cssUrl" type="text" style="width: 280px; text-align: left;" placeholder="https://css.company.com" @change="saveUrls" />
          <button type="button" class="ss-btn sm" :disabled="!cssUrl" @click="openCss"><i class="ri-external-link-line"></i>{{ $t('打开 CSS 系统导出延保达成订单') }}</button>
          <button type="button" class="ss-btn sm ghost" @click="loadDownloads('css')"><i class="ri-download-cloud-2-line"></i>{{ $t('从浏览器下载记录导入') }}</button>
          <span class="lbl">{{ $t('延保达成按') }}</span>
          <select v-model="warrantyMeasure"><option value="amount">{{ $t('金额') }}</option><option value="quantity">{{ $t('数量（单数）') }}</option></select>
        </div>
        <div v-if="downloads.css.length" class="ss-dl">
          <button v-for="d in downloads.css" :key="d.path" type="button" class="ss-chip brand" @click="addTables(cssOrders, [d.path], CSS_ROLES)"><i class="ri-file-excel-2-line"></i>{{ d.filename }}</button>
        </div>
        <div class="ss-grid">
          <div class="ss-source">
            <div class="ss-subhead">{{ $t('CSS 延保达成订单') }}</div>
            <FileDropField :label="$t('延保订单 Excel')" compact :files="chips(cssOrders)" @picked="(p) => addTables(cssOrders, p, CSS_ROLES)" @remove="(p) => remove(cssOrders, p)" />
            <TableMapping v-for="(t, i) in cssOrders" :key="t.path + t.sheetName" :table="t" :roles="CSS_ROLES" @update="(m) => (cssOrders[i].mapping = m)" @sheet="(s) => reload(cssOrders, i, s, CSS_ROLES)" />
          </div>
          <div class="ss-source">
            <div class="ss-subhead">{{ $t('延保任务表（服务商任务；区域经理任务可另选）') }}</div>
            <FileDropField :label="$t('服务商延保任务 Excel')" :multi="false" compact :files="warrantyTasks ? [{ path: warrantyTasks.path, name: warrantyTasks.fileName }] : []" @picked="(p) => loadSingle('warrantyTasks', p[0], WTASK_ROLES)" @remove="warrantyTasks = null" />
            <TableMapping v-if="warrantyTasks" :table="warrantyTasks" :roles="WTASK_ROLES" @update="(m) => (warrantyTasks!.mapping = m)" @sheet="(s) => loadSingle('warrantyTasks', warrantyTasks!.path, WTASK_ROLES, s)" />
            <FileDropField :label="$t('区域经理延保任务 Excel（可选）')" :multi="false" compact :files="warrantyManagerTasks ? [{ path: warrantyManagerTasks.path, name: warrantyManagerTasks.fileName }] : []" @picked="(p) => loadSingle('warrantyManagerTasks', p[0], MTASK_ROLES)" @remove="warrantyManagerTasks = null" />
            <TableMapping v-if="warrantyManagerTasks" :table="warrantyManagerTasks" :roles="MTASK_ROLES" @update="(m) => (warrantyManagerTasks!.mapping = m)" @sheet="(s) => loadSingle('warrantyManagerTasks', warrantyManagerTasks!.path, MTASK_ROLES, s)" />
          </div>
        </div>
        <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="!cssOrders.length || !warrantyTasks || steps.isRunning()" @click="computeWarranty"><i :class="spin('warranty', 'ri-calculator-line')"></i>{{ $t('计算区域经理 & 服务商延保达成率') }}</button></div>
        <template v-if="warranty">
          <p v-for="w in warranty.warnings" :key="w" class="ss-note warn"><i class="ri-alert-line"></i>{{ w }}</p>
          <div class="ss-grid">
            <div class="ss-table-wrap" style="max-height: 260px; overflow: auto;"><table class="ss-table"><thead><tr><th>{{ $t('服务商') }}</th><th class="num">{{ $t('延保实际') }}</th><th class="num">{{ $t('任务') }}</th><th class="num">{{ $t('达成率') }}</th></tr></thead><tbody><tr v-for="p in warranty.providers" :key="p.name"><td>{{ p.name }}</td><td class="num">{{ p.actual }}</td><td class="num">{{ p.task }}</td><td class="num">{{ fmtPct(p.rate, 1) }}</td></tr></tbody></table></div>
            <div class="ss-table-wrap" style="max-height: 260px; overflow: auto;"><table class="ss-table"><thead><tr><th>{{ $t('区域经理') }}</th><th class="num">{{ $t('延保实际') }}</th><th class="num">{{ $t('任务') }}</th><th class="num">{{ $t('达成率') }}</th></tr></thead><tbody><tr v-for="m in warranty.managers" :key="m.name"><td>{{ m.name }}</td><td class="num">{{ m.actual }}</td><td class="num">{{ m.task }}</td><td class="num">{{ fmtPct(m.rate, 1) }}</td></tr></tbody></table></div>
          </div>
        </template>
      </StepCard>

      <!-- 6 打折判定 -->
      <StepCard step-key="discount" :index="5" :title="steps.metas[5].title" :hint="steps.metas[5].hint" :runtime="steps.runtime.discount" :is-current="steps.currentKey.value === 'discount'">
        <p class="ss-note"><i class="ri-information-line"></i>{{ $t('判定规则：{rules}', { rules: discountRuleText }) }}</p>
        <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="rulesReviewPending || !!rulesDraft || !!rulesError || steps.runtime.warranty.state !== 'done' || steps.isRunning()" @click="computeFinal"><i :class="spin('discount', 'ri-scales-3-line')"></i>{{ $t('按延保达成率判定并核算最终激励') }}</button></div>
        <template v-if="finalDone">
          <p v-for="w in incentive!.warnings || []" :key="w" class="ss-note warn"><i class="ri-alert-line"></i>{{ w }}</p>
          <div class="ss-table-wrap" style="max-height: 260px; overflow: auto;">
            <table class="ss-table">
              <thead><tr><th>{{ $t('区域经理') }}</th><th class="num">{{ $t('延保达成率') }}</th><th>{{ $t('判定') }}</th><th class="num">{{ $t('折扣') }}</th></tr></thead>
              <tbody><tr v-for="m in incentive!.managers" :key="m.manager" :class="{ bad: m.discount < 1 }"><td>{{ m.manager }}</td><td class="num">{{ fmtPct(m.warrantyRate, 1) }}</td><td><span class="ss-chip" :class="m.discount < 1 ? 'bad' : 'ok'">{{ m.discount < 1 ? $t('打折结算') : $t('全额结算') }}</span></td><td class="num">{{ m.discount < 1 ? $t('{z} 折', { z: (m.discount * 10).toFixed(1) }) : '-' }}</td></tr></tbody>
            </table>
          </div>
        </template>
      </StepCard>

      <!-- 7 区域经理最终激励 -->
      <StepCard step-key="manager" :index="6" :title="steps.metas[6].title" :hint="steps.metas[6].hint" :runtime="steps.runtime.manager" :is-current="steps.currentKey.value === 'manager'">
        <div v-if="finalDone" class="ss-table-wrap" style="max-height: 340px; overflow: auto;">
          <table class="ss-table">
            <thead><tr><th>{{ $t('区域经理') }}</th><th class="num">{{ $t('辅材达成率') }}</th><th class="num">{{ $t('延保达成率') }}</th><th>{{ $t('等级/系数') }}</th><th class="num">{{ $t('基础激励') }}</th><th class="num">{{ $t('辅材提成(折扣/系数前)') }}</th><th class="num">{{ $t('折扣') }}</th><th class="num">{{ $t('辅材提成(折后)') }}</th><th class="num">{{ $t('延保提成(系数前)') }}</th><th class="num">{{ $t('延保提成(系数后)') }}</th><th class="num">{{ $t('预发合计') }}</th><th class="num">{{ $t('最终激励(元)') }}</th></tr></thead>
            <tbody>
              <tr v-for="m in incentive!.managers" :key="m.manager">
                <td>{{ m.manager }}</td><td class="num">{{ fmtPct(m.auxRate, 1) }}</td><td class="num">{{ fmtPct(m.warrantyRate, 1) }}</td><td>{{ m.grade || '-' }} / {{ m.coefficient }}</td>
                <td class="num">{{ fmtMoney(m.baseTotal) }}</td><td class="num">{{ fmtMoney(m.auxCommission) }}</td><td class="num">{{ m.discount }}</td><td class="num">{{ fmtMoney(m.auxCommissionNet) }}</td>
                <td class="num">{{ fmtMoney(m.warrantyCommission) }}</td><td class="num">{{ fmtMoney(m.warrantyCommissionNet) }}</td>
                <td class="num">{{ fmtMoney(m.advanceTotal) }}</td><td class="num"><strong>{{ fmtMoney(m.finalIncentive) }}</strong></td>
              </tr>
              <tr class="total"><td>{{ $t('合计') }}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class="num">{{ fmtMoney(incentive!.totals.managerAdvance) }}</td><td class="num">{{ fmtMoney(incentive!.totals.managerFinal) }}</td></tr>
            </tbody>
          </table>
        </div>
        <p v-if="finalDone" class="ss-muted">{{ $t('最终激励 = 基础激励 + 辅材提成(折后) + 延保提成(系数后)；辅材提成(折后) = 折扣/系数前 × 折扣 × 绩效系数，即客户「打印」表的「准确辅材销售提成激励」口径；「预发合计」按基础比例算，年度多退少补。') }}</p>
        <div class="ss-actions">
          <button v-if="incentivePath" type="button" class="ss-btn" @click="openPath(incentivePath)"><i class="ri-file-excel-2-line"></i>{{ $t('打开核算表') }}</button>
          <button type="button" class="ss-btn primary" :disabled="!finalDone || steps.isRunning()" @click="confirmManager"><i class="ri-check-line"></i>{{ $t('区域经理激励确认') }}</button>
        </div>
      </StepCard>

      <!-- 8 服务商最终延保激励 + 开票通知 + 负责人激励 + 信息提报通知 -->
      <StepCard step-key="provider" :index="7" :title="steps.metas[7].title" :hint="steps.metas[7].hint" :runtime="steps.runtime.provider" :is-current="steps.currentKey.value === 'provider'">
        <div v-if="finalDone" class="ss-table-wrap" style="max-height: 320px; overflow: auto;">
          <table class="ss-table">
            <thead><tr><th></th><th>{{ $t('服务商') }}</th><th class="num">{{ $t('延保实际') }}</th><th class="num">{{ $t('延保达成率') }}</th><th class="num">{{ $t('服务商比例') }}</th><th class="num">{{ $t('最终延保激励(元)') }}</th><th class="num">{{ $t('负责人比例') }}</th><th class="num">{{ $t('负责人激励(元)') }}</th><th>{{ $t('开票通知') }}</th><th>{{ $t('信息提报通知') }}</th></tr></thead>
            <tbody>
              <tr v-for="p in incentive!.providers" :key="p.provider">
                <td><input v-model="selProvider[p.provider]" type="checkbox" /></td>
                <td>{{ p.provider }}</td><td class="num">{{ p.warrantyActual }}</td><td class="num">{{ fmtPct(p.warrantyRate, 1) }}</td><td class="num">{{ fmtPct(p.warrantyRatio, 0) }}</td>
                <td class="num"><strong>{{ fmtMoney(p.warrantyIncentive) }}</strong></td><td class="num">{{ fmtPct(p.leaderRatio, 0) }}</td><td class="num">{{ fmtMoney(p.leaderIncentive) }}</td>
                <td><span v-if="ret(p.provider)?.invoiceNoticeAt" class="ss-chip ok">{{ fmtDate(ret(p.provider)?.invoiceNoticeAt) }}</span><span v-else class="ss-chip">{{ $t('未发') }}</span></td>
                <td><span v-if="ret(p.provider)?.leaderInfoNoticeAt" class="ss-chip ok">{{ fmtDate(ret(p.provider)?.leaderInfoNoticeAt) }}</span><span v-else class="ss-chip">{{ $t('未发') }}</span></td>
              </tr>
              <tr class="total"><td></td><td>{{ $t('合计') }}</td><td></td><td></td><td></td><td class="num">{{ fmtMoney(incentive!.totals.warrantyIncentive) }}</td><td></td><td class="num">{{ fmtMoney(incentive!.totals.leaderIncentive) }}</td><td></td><td></td></tr>
            </tbody>
          </table>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn ghost sm" @click="toggleSel(selProvider, true)">{{ $t('全选') }}</button>
          <button type="button" class="ss-btn ghost sm" @click="toggleSel(selProvider, false)">{{ $t('全不选') }}</button>
          <span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="!finalDone || !selectedOf(selProvider).length || steps.isRunning()" @click="notify('invoice', 'provider')"><i class="ri-bill-line"></i>{{ $t('发开票通知（按最终延保激励金额）') }}</button>
          <button type="button" class="ss-btn primary" :disabled="!finalDone || !selectedOf(selProvider).length || steps.isRunning()" @click="notify('leader_info', 'provider')"><i class="ri-id-card-line"></i>{{ $t('通知提报负责人身份证 / 银行账户') }}</button>
        </div>
      </StepCard>

      <!-- 9 负责人信息收集与校验 -->
      <StepCard step-key="leaders" :index="8" :title="steps.metas[8].title" :hint="steps.metas[8].hint" :runtime="steps.runtime.leaders" :is-current="steps.currentKey.value === 'leaders'">
        <p class="ss-note"><i class="ri-inbox-line"></i>{{ $t('服务商通过企微 / 邮箱回传的「姓名 / 身份证号 / 银行卡号 / 开户行」会自动识别汇总到这里（正文或 Excel 都认），并做身份证校验位、银行卡校验；有错的行标红，改对了就消失。') }}</p>
        <div class="ss-table-wrap" style="max-height: 360px; overflow: auto;">
          <table class="ss-table">
            <thead><tr><th>{{ $t('服务商') }}</th><th>{{ $t('姓名') }}</th><th>{{ $t('身份证号') }}</th><th>{{ $t('银行卡号') }}</th><th>{{ $t('开户行') }}</th><th>{{ $t('手机号') }}</th><th>{{ $t('来源') }}</th><th>{{ $t('校验') }}</th></tr></thead>
            <tbody>
              <tr v-for="l in leaders" :key="l.provider" :class="{ bad: l.errors.length }">
                <td>{{ l.provider }}</td>
                <td><input :value="l.name" type="text" @change="updLeader(l.provider, 'name', ($event.target as HTMLInputElement).value)" /></td>
                <td><input :value="l.idCard" type="text" style="min-width: 170px" @change="updLeader(l.provider, 'idCard', ($event.target as HTMLInputElement).value)" /></td>
                <td><input :value="l.bankCard" type="text" style="min-width: 170px" @change="updLeader(l.provider, 'bankCard', ($event.target as HTMLInputElement).value)" /></td>
                <td><input :value="l.bankName" type="text" style="min-width: 150px" @change="updLeader(l.provider, 'bankName', ($event.target as HTMLInputElement).value)" /></td>
                <td><input :value="l.phone || ''" type="text" @change="updLeader(l.provider, 'phone', ($event.target as HTMLInputElement).value)" /></td>
                <td><span class="ss-chip">{{ l.source || '-' }}</span></td>
                <td><span v-if="l.errors.length" class="ss-chip bad" :title="l.errors.join($t('；'))">{{ l.errors.join($t('；')) }}</span><span v-else class="ss-chip ok">{{ $t('通过') }}</span></td>
              </tr>
              <tr v-if="!leaders.length"><td colspan="8" class="ss-muted">{{ $t('还没有收到负责人信息。可点「立即收取」或手工添加。') }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="steps.isRunning()" @click="scanLeaders"><i :class="spin('leaders', 'ri-mail-download-line')"></i>{{ $t('立即收取企微 / 邮箱回传并校验') }}</button>
          <button type="button" class="ss-btn" @click="importLeaders"><i class="ri-file-upload-line"></i>{{ $t('从 Excel 导入') }}</button>
          <div class="ss-rule-row"><span class="lbl">{{ $t('手工添加：') }}</span><select v-model="manualProvider"><option value="">{{ $t('选服务商') }}</option><option v-for="p in providerNames" :key="p" :value="p">{{ p }}</option></select><button type="button" class="ss-btn sm" :disabled="!manualProvider" @click="addManualLeader"><i class="ri-add-line"></i>{{ $t('添加一行') }}</button></div>
          <span class="grow"></span>
          <span class="ss-chip" :class="leaders.some((l: any) => l.errors.length) ? 'bad' : 'ok'">{{ $t('通过 {a} / 共 {b}', { a: leaders.filter((l: any) => !l.errors.length).length, b: leaders.length }) }}</span>
        </div>
      </StepCard>

      <!-- 10 个税申报表 -->
      <StepCard step-key="tax" :index="9" :title="steps.metas[9].title" :hint="steps.metas[9].hint" :runtime="steps.runtime.tax" :is-current="steps.currentKey.value === 'tax'">
        <FileDropField :label="$t('个税申报表模板 Excel（可选）')" :hint="$t('有公司模板就拖进来，系统按模板表头填；没有就用内置的劳务报酬申报格式')" :multi="false" compact :files="taxTemplate ? [{ path: taxTemplate, name: baseName(taxTemplate) }] : []" @picked="(p) => (taxTemplate = p[0])" @remove="taxTemplate = ''" />
        <p class="ss-note"><i class="ri-information-line"></i>{{ $t('按「劳务报酬所得」预扣预缴口径：收入 ≤ 4000 减 800，> 4000 减 20%；预扣率 20% / 30% / 40%（速算扣除 0 / 2000 / 7000）。只对校验通过的负责人生成。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!finalDone || steps.isRunning()" @click="exportTax"><i :class="spin('tax', 'ri-file-text-line')"></i>{{ $t('生成个税申报表') }}</button>
          <button v-if="taxPath" type="button" class="ss-btn" @click="openPath(taxPath)"><i class="ri-file-excel-2-line"></i>{{ $t('打开个税申报表') }}</button>
        </div>
      </StepCard>

      <!-- 11 季度结案报告 -->
      <StepCard step-key="report" :index="10" :title="steps.metas[10].title" :hint="steps.metas[10].hint" :runtime="steps.runtime.report" :is-current="steps.currentKey.value === 'report'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!finalDone || steps.isRunning()" @click="genReport"><i :class="spin('report', 'ri-article-line')"></i>{{ $t('生成季度结案报告') }}</button>
          <button v-if="reportPath" type="button" class="ss-btn" @click="openPath(reportPath)"><i class="ri-file-text-line"></i>{{ $t('打开报告') }}</button>
          <button v-if="reportPath" type="button" class="ss-btn ghost" @click="openPath(reportPath, true)"><i class="ri-folder-open-line"></i>{{ $t('打开所在文件夹') }}</button>
        </div>
        <p v-if="reportNote" class="ss-note warn"><i class="ri-alert-line"></i>{{ reportNote }}</p>
        <pre v-if="reportMd" class="ss-report">{{ reportMd }}</pre>
      </StepCard>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 模块四 · 服务营销激励结案（需求 11 步一一对应）。
 *
 * 2026-09-03 规则模型 v2：第 3 步的规则编辑器暴露完整模型（边际阶梯 / 区域经理基础激励与绩效系数 /
 * 电动止回阀门槛 / 呆滞配件返利 / 延保拆服务商与负责人），带「套用 2026 默认政策」预设；
 * PDF 抽取失败（扫描件无 OCR / 模型失败）红色横幅醒目提示，规则不会被静默换成默认值。
 * 第 2 步可选补充：绩效等级表、服务商信息表（引入时间 → 服务年限；经理归属兜底）。
 */
import { computed, reactive, ref, watch } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from './StepCard.vue';
import DK from './dataKeywords.json';
import FileDropField from './FileDropField.vue';
import TableMapping from './TableMapping.vue';
import StickyProgress from './StickyProgress.vue';
import { api, useSteps, scrollToStep, inspectTable, fmtMoney, fmtPct, fmtDate, openPath, errorMessage, pickFiles, openEmbeddedBrowser, recentBrowserDownloads, type PickedTable } from './shared';

const props = defineProps<{ state: any }>();
const emit = defineEmits<{ (e: 'refresh'): void }>();
const notif = useNotificationStore();

const steps = useSteps([
  { key: 'youzan', title: i18nT('从有赞商城导出季度辅材销售订单'), hint: i18nT('打开有赞指定页面查询导出，或直接放入已导出的订单 Excel') },
  { key: 'aux', title: i18nT('计算辅材实际达成与达成率'), hint: i18nT('服务商 & 区域经理各自的实际、任务、达成率（订单行有经理列时按行归属）') },
  { key: 'rules', title: i18nT('读取激励规则 PDF，算服务商辅材激励初始金额'), hint: i18nT('扫描件先 OCR → AI 抽出阶梯规则 → 你核对（或直接套 2026 默认政策）→ 按规则算') },
  { key: 'return', title: i18nT('通知服务商退回等额呆滞配件'), hint: i18nT('到期前 10 天未退回自动二次提醒') },
  { key: 'warranty', title: i18nT('计算延保达成率'), hint: i18nT('延保订单取自 CSS 系统，任务取外部表；算区域经理 & 服务商') },
  { key: 'discount', title: i18nT('延保达成率判定 → 区域经理辅材激励是否打折'), hint: i18nT('低于阈值的按折扣结算') },
  { key: 'manager', title: i18nT('核算区域经理最终激励金额'), hint: i18nT('基础激励 + （辅材提成 × 折扣 + 延保提成）× 绩效系数') },
  { key: 'provider', title: i18nT('服务商最终延保激励、开票通知、负责人激励与信息提报通知'), hint: i18nT('核算 + 两封通知') },
  { key: 'leaders', title: i18nT('收集并校验负责人信息'), hint: i18nT('企微 / 邮箱回传自动汇总，信息错误即报错') },
  { key: 'tax', title: i18nT('生成个税申报表'), hint: i18nT('按模板（或内置格式）生成') },
  { key: 'report', title: i18nT('生成季度结案报告'), hint: i18nT('汇总全流程事实，生成 Markdown 报告') },
]);

type Role = { key: string; label?: string; required?: boolean };
const ORDER_ROLES: Role[] = [{ key: 'provider', required: true }, { key: 'amount', required: true, label: i18nT('订单金额') }, { key: 'date', label: i18nT('日期 / 季度标签') }, { key: 'manager', label: i18nT('服务经理（按行归属）') }, { key: 'product', label: i18nT('产品（门槛品类判定）') }, { key: 'status' }, { key: 'orderNo' }];
const PTASK_ROLES: Role[] = [{ key: 'provider', required: true }, { key: 'task', required: true }, { key: 'qualifierTask', label: i18nT('门槛品类任务（电动止回阀）') }, { key: 'annualTask', label: i18nT('年度任务（返利门槛）') }, { key: 'manager' }];
const WTASK_ROLES: Role[] = [{ key: 'provider', required: true }, { key: 'task', required: true }, { key: 'manager' }];
const MTASK_ROLES: Role[] = [{ key: 'manager', required: true }, { key: 'task', required: true }];
const CSS_ROLES: Role[] = [{ key: 'provider', required: true }, { key: 'providerAlt', label: i18nT('变更/归属服务商（非空时这一行按它算）') }, { key: 'amount' }, { key: 'quantity' }, { key: 'date', label: i18nT('日期 / 月份') }, { key: 'manager', label: i18nT('区域经理（按行归属）') }, { key: 'status' }];
const GRADE_ROLES: Role[] = [{ key: 'manager', required: true }, { key: 'grade', required: true, label: i18nT('绩效等级') }];
const INFO_ROLES: Role[] = [{ key: 'provider', required: true }, { key: 'introducedAt', label: i18nT('引入时间') }, { key: 'manager', label: i18nT('省区/区域经理（归属兜底）') }, { key: 'alias', label: i18nT('更名记录 / 曾用名（并入现名）') }];
/** 主进程关键字表不认识的角色，这里按表头正则补识别（用户仍可改选） */
const AUTO_PICK: Record<string, RegExp[]> = {
  product: [/^产品$/, /产品(名称|类型|品类)/],
  qualifierTask: [/止回阀.*(目标|任务)/, /(目标|任务).*止回阀/],
  annualTask: [/^\d{2,4}年.*(目标|任务)/, /年度.*(目标|任务)/],
  providerAlt: [/变更服务商/, /归属服务商/],
  grade: [/^等级$/, /绩效等级/, /等级/],
  introducedAt: [/引入时间/, /引入年份/, /引入日期/, /合作(开始|起始)?(时间|日期)/, /签约(时间|日期)/],
};
const PREFER: Record<string, RegExp[]> = { manager: [/^省区经理$/] };
function autoPick(t: PickedTable, roles: Role[], prefer?: Record<string, RegExp[]>): void {
  const norm = (h: string) => h.replace(/\s+/g, '');
  const taken = () => Object.values(t.mapping).filter(Boolean);
  for (const r of roles) {
    const preferRes = prefer?.[r.key];
    if (preferRes) {
      const hit = t.headers.find((h) => preferRes.some((re) => re.test(norm(h))));
      if (hit) { t.mapping[r.key] = hit; continue; }
    }
    if (t.mapping[r.key]) continue;
    for (const re of AUTO_PICK[r.key] || []) {
      const hit = t.headers.find((h) => re.test(norm(h)) && !taken().includes(h));
      if (hit) { t.mapping[r.key] = hit; break; }
    }
  }
}

/**
 * 没有已存季度时默认「上一季度」（跨年：1 月默认去年 Q4）。结案总在季度结束后做（9 月结 Q2），
 * 之前默认当前季度，全新机器上演示数据 6,373 行订单全被「不在季度范围」剔除（2026-09-03 审查 P1-5）。
 */
function previousQuarter(d: Date): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return q === 1 ? { year: d.getFullYear() - 1, quarter: 4 } : { year: d.getFullYear(), quarter: (q - 1) as 1 | 2 | 3 | 4 };
}
const defaultPeriod = previousQuarter(new Date());
const year = ref<number>(props.state?.marketing?.year || defaultPeriod.year);
const quarter = ref<1 | 2 | 3 | 4>(props.state?.marketing?.quarter || defaultPeriod.quarter);
const youzanUrl = ref(props.state?.marketing?.youzanUrl || '');
const cssUrl = ref(props.state?.marketing?.cssUrl || '');
async function saveUrls(): Promise<void> { try { await api().statePatch({ marketing: { youzanUrl: youzanUrl.value, cssUrl: cssUrl.value, year: year.value, quarter: quarter.value } }); } catch (e) { notif.error(errorMessage(e)); } }
async function openYouzan(): Promise<void> { if (!(await openEmbeddedBrowser(youzanUrl.value, 'service-settlement-youzan'))) notif.warn(i18nT('内置浏览器不可用')); }
async function openCss(): Promise<void> { if (!(await openEmbeddedBrowser(cssUrl.value, 'service-settlement-css'))) notif.warn(i18nT('内置浏览器不可用')); }
const downloads = reactive<{ orders: any[]; css: any[] }>({ orders: [], css: [] });
async function loadDownloads(k: 'orders' | 'css'): Promise<void> {
  downloads[k] = await recentBrowserDownloads();
  if (!downloads[k].length) notif.info(i18nT('内置浏览器里还没有下载完成的表格文件'));
}

const orders = reactive<PickedTable[]>([]);
const cssOrders = reactive<PickedTable[]>([]);
const providerTasks = ref<PickedTable | null>(null);
const managerTasks = ref<PickedTable | null>(null);
const warrantyTasks = ref<PickedTable | null>(null);
const warrantyManagerTasks = ref<PickedTable | null>(null);
const gradeTable = ref<PickedTable | null>(null);
const providerInfo = ref<PickedTable | null>(null);
const singles = { providerTasks, managerTasks, warrantyTasks, warrantyManagerTasks, gradeTable, providerInfo };
const chips = (list: PickedTable[]) => list.map((t) => ({ path: t.path, name: t.fileName, note: i18nT('{n} 行', { n: t.rowCount }) }));
const baseName = (p: string) => p.split(/[\\/]/).pop() || p;
const spin = (key: string, icon: string) => (steps.runtime[key]?.state === 'running' ? 'ri-loader-4-line spin' : icon);
const rolesOf = (roles: Role[]) => roles.map((r) => r.key);
/**
 * 有赞辅材订单真实导出没有「服务商」列，服务商名写在「客户备注」（上游按买家手机号映射填入）。
 * 主进程识别不到服务商列就在这里自动填它并提示 —— 以前只在主进程算达成率时回落，可界面第 1 步
 * 「服务商列必填」的校验先把用户拦在门外，回落逻辑永远走不到（2026-09-03 审查 P0-4）。
 */
function fallbackOrderProvider(t: PickedTable): void {
  if (t.mapping.provider || !t.headers.includes(DK.orderProviderFallbackColumn)) return;
  t.mapping.provider = DK.orderProviderFallbackColumn;
  notif.info(i18nT('{f}：没有服务商列，已用「{c}」作服务商列（有赞订单的备注即服务商名；不对的话直接改选）', { f: t.fileName, c: DK.orderProviderFallbackColumn }));
}
async function addTables(list: PickedTable[], paths: string[], roles: Role[]): Promise<void> {
  for (const p of paths) {
    if (list.some((t) => t.path === p)) continue;
    try {
      const t = await inspectTable(p, rolesOf(roles));
      autoPick(t, roles);
      if (roles === ORDER_ROLES) fallbackOrderProvider(t);
      list.push(t);
    } catch (e) { notif.error(errorMessage(e)); }
  }
}
function remove(list: PickedTable[], path: string): void { const i = list.findIndex((t) => t.path === path); if (i >= 0) list.splice(i, 1); }
async function reload(list: PickedTable[], i: number, sheet: string, roles: Role[]): Promise<void> {
  try {
    const t = await inspectTable(list[i].path, rolesOf(roles), sheet);
    autoPick(t, roles);
    if (roles === ORDER_ROLES) fallbackOrderProvider(t);
    list[i] = t;
  } catch (e) { notif.error(errorMessage(e)); }
}
async function loadSingle(which: keyof typeof singles, path: string, roles: Role[], sheet?: string): Promise<void> {
  if (!path) return;
  try {
    const t = await inspectTable(path, rolesOf(roles), sheet);
    autoPick(t, roles, which === 'providerInfo' ? PREFER : undefined);
    singles[which].value = t;
  } catch (e) { notif.error(errorMessage(e)); }
}
const refOf = (t: PickedTable) => ({ path: t.path, sheetName: t.sheetName, mapping: t.mapping });
const refOrNull = (t: PickedTable | null) => (t ? refOf(t) : null);

/**
 * 演示预填（外部调用可传入路径预填）：一个工作簿八张表各挑对应 sheet，季度 / 规则预设一并填好，
 * 之后只需从第 1 步逐步点「下一步」。
 */
async function prefillDemo(d: { year: number; quarter: 1 | 2 | 3 | 4; workbook: string; sheets: Record<string, string> }): Promise<void> {
  year.value = d.year;
  quarter.value = d.quarter;
  orders.splice(0, orders.length);
  cssOrders.splice(0, cssOrders.length);
  for (const k of Object.keys(singles) as (keyof typeof singles)[]) singles[k].value = null;
  for (const m of steps.metas) steps.reset(m.key);
  steps.currentKey.value = 'youzan';
  await addTables(orders, [d.workbook], ORDER_ROLES);
  if (orders[0] && orders[0].sheetName !== d.sheets.orders) await reload(orders, 0, d.sheets.orders, ORDER_ROLES);
  await loadSingle('providerTasks', d.workbook, PTASK_ROLES, d.sheets.providerTasks);
  await loadSingle('managerTasks', d.workbook, MTASK_ROLES, d.sheets.managerTasks);
  await loadSingle('gradeTable', d.workbook, GRADE_ROLES, d.sheets.grades);
  await loadSingle('providerInfo', d.workbook, INFO_ROLES, d.sheets.providerInfo);
  await addTables(cssOrders, [d.workbook], CSS_ROLES);
  if (cssOrders[0] && cssOrders[0].sheetName !== d.sheets.css) await reload(cssOrders, 0, d.sheets.css, CSS_ROLES);
  await loadSingle('warrantyTasks', d.workbook, WTASK_ROLES, d.sheets.warrantyTasks);
  await loadSingle('warrantyManagerTasks', d.workbook, MTASK_ROLES, d.sheets.warrantyManagerTasks);
  await applyPreset();
}
defineExpose({ prefillDemo });

function confirmOrders(): void {
  steps.start('youzan');
  const bad = orders.filter((t) => !t.mapping.provider || !t.mapping.amount);
  if (bad.length) { steps.fail('youzan', i18nT('{f} 缺少服务商列或金额列', { f: bad.map((t) => t.fileName).join('、') })); return; }
  void saveUrls();
  steps.resetAfter('youzan');
  aux.value = null;
  incentive.value = null;
  finalDone.value = false;
  steps.done('youzan', i18nT('{y} 年 Q{q}，{n} 份订单表共 {r} 行', { y: year.value, q: quarter.value, n: orders.length, r: orders.reduce((s, t) => s + t.rowCount, 0) }));
}

// 2 辅材达成
const aux = ref<any>(null);
/** 上次算达成率时用的门槛品类正则；规则里改了它第 2 步就得重算（见 rules 的 watch） */
let auxQualifierPattern = '';
const hasQualifier = computed(() => !!aux.value?.providers?.some((p: any) => p.qualifierTask != null));
async function computeAux(): Promise<void> {
  steps.start('aux');
  aux.value = null;
  rulesChangedNote.value = '';
  try {
    if (!providerTasks.value?.mapping.provider || !providerTasks.value?.mapping.task) throw new Error(i18nT('服务商任务表需要「服务商」和「任务」两列'));
    // 门槛正则**始终**传：它只决定第 2 步统计门槛品类实际，「是否启用门槛」只在第 3 步核算时决定清不清零。
    // 以前按 enabled 传 → 默认规则 enabled=false 时不统计 → 第 3 步套预设打开门槛后 26 家被当成
    // 「有任务但实际 0」清零，提货激励 80,900 vs 应 154,148（2026-09-03 审查 P0-1）。
    auxQualifierPattern = rules.qualifierPattern || '';
    const r = await api().marketingAchievement({
      year: year.value, quarter: quarter.value, orders: orders.map(refOf),
      providerTasks: refOf(providerTasks.value), managerTasks: refOrNull(managerTasks.value), measure: 'amount',
      providerInfo: refOrNull(providerInfo.value),
      qualifierPattern: auxQualifierPattern || undefined,
    });
    aux.value = r;
    steps.resetAfter('aux');
    incentive.value = null;
    finalDone.value = false;
    steps.done('aux', i18nT('{a} 家服务商 / {b} 位区域经理；整体达成率 {r}', { a: r.providers.length, b: r.managers.length, r: fmtPct(r.totals.rate, 1) }));
  } catch (e) { steps.fail('aux', e); }
}

// 3 规则（表单用百分数；提交时换算成小数的 v2 JSON）
interface TierForm { fromPct: number; toPct: number | null; ratioPct: number; factor: number; basis: 'whole' | 'marginal' | 'fixed'; fixed: number }
const newTier = (): TierForm => ({ fromPct: 100, toPct: null, ratioPct: 3, factor: 1, basis: 'marginal', fixed: 0 });
const wholeSteps = (steps: [number, number][]): TierForm[] => steps.map(([fromPct, ratioPct], i) => ({ fromPct, toPct: steps[i + 1] ? steps[i + 1][0] : null, ratioPct, factor: 1, basis: 'whole' as const, fixed: 0 }));
const DEFAULT_RULES_FORM = () => ({
  source: '',
  auxTiers: wholeSteps([[0, 0], [80, 3], [100, 5], [120, 8]]), auxMinRatePct: 0, auxMissingTaskAsMet: false,
  qualifierEnabled: false, qualifierPattern: DK.qualifierPattern,
  rebateEnabled: false, rebateTiers: [{ minYears: 20, ratioPct: 10 }, { minYears: 10, ratioPct: 8 }, { minYears: 0, ratioPct: 5 }], rebateYearsAsOf: 'quarterEnd' as 'quarterEnd' | 'quarterStart' | 'lastMonthStart',
  managerTiers: wholeSteps([[0, 0], [80, 3], [100, 5], [120, 8]]), managerMinRatePct: 0,
  managerBase: { perItemMax: 0, minRatePct: 80, quarterMax: 0, applyCoefficient: false, applyDiscount: false },
  managerAdvanceRatioPct: 0,
  managerDiscountTiers: [{ belowRatePct: 80, discountZhe: 8 }],
  coefficients: [{ grade: 'S', value: 1.2 }, { grade: 'A', value: 1.1 }, { grade: 'B+', value: 1 }, { grade: 'B', value: 0.9 }, { grade: 'C', value: 0.8 }],
  warrantyMode: 'perOrder' as 'perOrder' | 'ratio', warrantyPerOrder: 20,
  warrantyTiers: [{ minRatePct: 0, providerRatioPct: 0, leaderRatioPct: 0 }, { minRatePct: 100, providerRatioPct: 5, leaderRatioPct: 0 }],
  leaderShareRatioPct: 10, leaderShareBase: 'both' as 'both' | 'warranty' | 'aux', returnDueDays: 30, returnRemindBeforeDays: 10,
});
const rules = reactive(DEFAULT_RULES_FORM());
const pct = (v: unknown): number => Math.round(Number(v || 0) * 10000) / 100;
function tiersToForm(list: any[]): TierForm[] {
  return list.map((t: any, i: number) => {
    if (t.fromRate != null || t.basis) {
      return { fromPct: pct(t.fromRate), toPct: t.toRate == null ? null : pct(t.toRate), ratioPct: pct(t.ratio), factor: t.factor ?? 1, basis: t.basis === 'marginal' || t.basis === 'fixed' ? t.basis : 'whole', fixed: t.fixed ?? 0 };
    }
    // v1：minRate 阶梯（旧 store）
    const next = list[i + 1];
    return { fromPct: pct(t.minRate), toPct: next ? pct(next.minRate) : null, ratioPct: pct(t.ratio), factor: 1, basis: t.fixed != null && !t.ratio ? 'fixed' : 'whole', fixed: t.fixed ?? 0 };
  });
}
function loadRules(r: any): void {
  if (!r) return;
  rules.source = r.source || '';
  if (Array.isArray(r.auxTiers) && r.auxTiers.length) rules.auxTiers = tiersToForm(r.auxTiers);
  if (r.auxMinRate != null) rules.auxMinRatePct = pct(r.auxMinRate);
  rules.auxMissingTaskAsMet = !!r.auxMissingTaskAsMet;
  if (r.qualifier) { rules.qualifierEnabled = !!r.qualifier.enabled; if (r.qualifier.productPattern) rules.qualifierPattern = r.qualifier.productPattern; }
  if (r.rebate) {
    rules.rebateEnabled = !!r.rebate.enabled;
    if (Array.isArray(r.rebate.tiers) && r.rebate.tiers.length) rules.rebateTiers = r.rebate.tiers.map((t: any) => ({ minYears: Number(t.minYears) || 0, ratioPct: pct(t.ratio) }));
    if (r.rebate.yearsAsOf) rules.rebateYearsAsOf = r.rebate.yearsAsOf === 'quarterStart' || r.rebate.yearsAsOf === 'lastMonthStart' ? r.rebate.yearsAsOf : 'quarterEnd';
  }
  const managerRaw = r.managerTiers ?? r.managerAuxTiers;
  if (Array.isArray(managerRaw) && managerRaw.length) rules.managerTiers = tiersToForm(managerRaw);
  else if (Array.isArray(r.auxTiers) && r.auxTiers.length) rules.managerTiers = tiersToForm(r.auxTiers);
  if (r.managerMinRate != null) rules.managerMinRatePct = pct(r.managerMinRate);
  if (r.managerBase) rules.managerBase = { perItemMax: Number(r.managerBase.perItemMax) || 0, minRatePct: pct(r.managerBase.minRate ?? 0.8), quarterMax: Number(r.managerBase.quarterMax) || 0, applyCoefficient: !!r.managerBase.applyCoefficient, applyDiscount: !!r.managerBase.applyDiscount };
  if (r.managerAdvanceRatio != null) rules.managerAdvanceRatioPct = pct(r.managerAdvanceRatio);
  if (Array.isArray(r.managerDiscountTiers)) rules.managerDiscountTiers = r.managerDiscountTiers.map((t: any) => ({ belowRatePct: pct(t.belowRate), discountZhe: Math.round(Number(t.discount) * 100) / 10 }));
  if (r.performanceCoefficients && typeof r.performanceCoefficients === 'object' && Object.keys(r.performanceCoefficients).length) rules.coefficients = Object.entries(r.performanceCoefficients).map(([grade, value]) => ({ grade, value: Number(value) }));
  rules.warrantyMode = r.warrantyMode === 'ratio' ? 'ratio' : 'perOrder';
  if (r.warrantyPerOrder != null) rules.warrantyPerOrder = r.warrantyPerOrder;
  if (Array.isArray(r.warrantyTiers) && r.warrantyTiers.length) rules.warrantyTiers = r.warrantyTiers.map((t: any) => ({ minRatePct: pct(t.minRate), providerRatioPct: pct(t.providerRatio ?? t.ratio), leaderRatioPct: pct(t.leaderRatio) }));
  if (r.leaderShareRatio != null) rules.leaderShareRatioPct = pct(r.leaderShareRatio);
  if (r.leaderShareBase) rules.leaderShareBase = r.leaderShareBase;
  if (r.returnDueDays != null) rules.returnDueDays = r.returnDueDays;
  if (r.returnRemindBeforeDays != null) rules.returnRemindBeforeDays = r.returnRemindBeforeDays;
}
loadRules(props.state?.marketing?.rules);
const dec = (v: unknown): number => Number(v || 0) / 100;
const tierPayload = (t: TierForm) => ({ fromRate: dec(t.fromPct), toRate: t.toPct == null || t.toPct === ('' as any) ? null : dec(t.toPct), ratio: dec(t.ratioPct), factor: Number(t.factor) || 1, basis: t.basis, fixed: Number(t.fixed) || 0 });
/**
 * 绩效系数：空着不许当成数字用。
 *
 * `v-model.number` 绑 `type="number"`，输入框被清空时 Vue 的 looseToNumber 返回的是**空字符串**，
 * 而 `Number('') === 0` 且 `Number.isFinite(0)` 为真 —— 于是系数悄悄落成 0，该等级下所有区域经理的
 * 激励全部 ×0 = 0 元，界面上没有任何异样。（更早的写法 `Number(c.value) || 1` 同样是静默改数，
 * 只是改成 1 而已，一样不能接受：用户清空它，不代表他想要 1。）
 *
 * 0 本身是合法的（某个等级就是不发），所以不能拿 0 当哨兵；必须把「空」和「数字 0」分开判。
 * 这是算钱的入口，宁可挡住让人填清楚，也不能猜。
 */
function coefficientValue(c: { grade: string; value: unknown }): number {
  const raw = c.value;
  const text = typeof raw === 'string' ? raw.trim() : raw;
  if (text === '' || text == null) {
    throw new Error(i18nT('绩效系数「{p0}」没有填数值。请填一个数（不发奖金就填 0），或删掉这一行。', { p0: c.grade.trim() }));
  }
  const n = Number(text);
  if (!Number.isFinite(n)) {
    throw new Error(i18nT('绩效系数「{p0}」不是有效数字：{p1}', { p0: c.grade.trim(), p1: String(raw) }));
  }
  if (n < 0) {
    throw new Error(i18nT('绩效系数「{p0}」不能是负数：{p1}', { p0: c.grade.trim(), p1: n }));
  }
  return n;
}

function rulesPayload() {
  return {
    source: rules.source, version: 2,
    auxTiers: rules.auxTiers.map(tierPayload), auxMinRate: dec(rules.auxMinRatePct), auxMissingTaskAsMet: rules.auxMissingTaskAsMet,
    qualifier: { enabled: rules.qualifierEnabled, productPattern: rules.qualifierPattern, label: rules.qualifierPattern },
    rebate: { enabled: rules.rebateEnabled, tiers: rules.rebateTiers.map((t) => ({ minYears: Number(t.minYears) || 0, ratio: dec(t.ratioPct) })), yearsAsOf: rules.rebateYearsAsOf },
    managerTiers: rules.managerTiers.map(tierPayload), managerMinRate: dec(rules.managerMinRatePct),
    managerBase: { perItemMax: Number(rules.managerBase.perItemMax) || 0, minRate: dec(rules.managerBase.minRatePct), quarterMax: Number(rules.managerBase.quarterMax) || 0, applyCoefficient: rules.managerBase.applyCoefficient, applyDiscount: rules.managerBase.applyDiscount },
    managerAdvanceRatio: dec(rules.managerAdvanceRatioPct),
    managerDiscountTiers: rules.managerDiscountTiers.map((t) => ({ belowRate: dec(t.belowRatePct), discount: Number(t.discountZhe) / 10 })),
    performanceCoefficients: Object.fromEntries(rules.coefficients.filter((c) => c.grade.trim()).map((c) => [c.grade.trim(), coefficientValue(c)])),
    warrantyMode: rules.warrantyMode, warrantyPerOrder: Number(rules.warrantyPerOrder),
    warrantyTiers: rules.warrantyTiers.map((t) => ({ minRate: dec(t.minRatePct), providerRatio: dec(t.providerRatioPct), leaderRatio: dec(t.leaderRatioPct) })),
    leaderShareRatio: dec(rules.leaderShareRatioPct), leaderShareBase: rules.leaderShareBase,
    returnDueDays: Number(rules.returnDueDays), returnRemindBeforeDays: Number(rules.returnRemindBeforeDays),
  };
}
/**
 * 规则装载序号：PDF 抽取（OCR 最坏十几分钟）期间用户点了「套用预设」/「恢复示例」，晚到的抽取结果
 * 不能再把预设盖掉 —— 每次装载 +1，抽取回来发现序号变了就丢弃并提示（P1-8）。
 */
let rulesLoadSeq = 0;
function resetRules(): void { rulesDraft.value = null; rulesLoadSeq += 1; Object.assign(rules, DEFAULT_RULES_FORM()); rulesNote.value = i18nT('已恢复示例规则'); rulesNoteKind.value = 'info'; rulesError.value = ''; rulesWarn.value = ''; }
const rulesPdfs = ref<string[]>(props.state?.marketing?.rulesPdfPaths ?? (props.state?.marketing?.rulesPdfPath ? [props.state.marketing.rulesPdfPath] : []));
async function saveRulesPdfs(): Promise<void> {
  rulesLoadSeq += 1; rulesDraft.value = null; rulesReviewPending.value = true;
  rulesNote.value = i18nT('文件列表已更新，请读取全部 PDF 后核对规则；下方暂保留原规则。');
  rulesNoteKind.value = 'warn';
  rulesWarn.value = '';
  try { const saved = await api().statePatch({ marketing: { rulesPdfPaths: [...rulesPdfs.value], rulesPdfPath: rulesPdfs.value[0] || '' } }); rulesReviewRevision.value = saved.state.marketing.rulesReviewRevision; } catch (e) { notif.error(errorMessage(e)); }
}
function addRulesPdfs(paths: string[]): void { rulesPdfs.value = [...new Set([...rulesPdfs.value, ...paths])]; void saveRulesPdfs(); }
function removeRulesPdf(path: string): void { rulesPdfs.value = rulesPdfs.value.filter(p => p !== path); void saveRulesPdfs(); }
const rulesDraft = ref<any>(null);
const rulesReviewPending = ref(!!props.state?.marketing?.rulesReviewPending);
const rulesReviewRevision = ref(Number(props.state?.marketing?.rulesReviewRevision) || 0);
async function applyRulesDraft(): Promise<void> {
  const draft = rulesDraft.value;
  const confirmationSeq = rulesLoadSeq;
  if (!draft) return;
  const previous = rulesPayload();
  const patch = { ...draft.draft };
  for (const key of ['managerBase', 'qualifier', 'rebate']) {
    if (patch[key]) patch[key] = { ...(previous as any)[key], ...patch[key] };
  }
  const next = { ...previous, ...patch, source: i18nT('{p0}；已核对补充：{p1}（{p2}）', { p0: previous.source || i18nT('原有设置'), p1: draft.source, p2: draft.extracted.join('、') }) };
  try { await api().statePatch({ marketing: { rules: next, rulesReviewed: true, reviewedRevision: rulesReviewRevision.value } }); }
  catch (e) { notif.error(errorMessage(e)); return; }
  if (confirmationSeq !== rulesLoadSeq) return;
  loadRules(next);
  rulesReviewPending.value = false;
  rulesDraft.value = null;
  rulesNote.value = i18nT('已应用核对字段；未提取字段保留原有设置，请确认后再计算。');
  rulesNoteKind.value = 'warn';
  rulesWarn.value = '';
}
async function confirmManualRules(): Promise<void> {
  const confirmationSeq = rulesLoadSeq;
  const next = { ...rulesPayload(), source: i18nT('手工核对：{p0}', { p0: rulesPdfs.value.map(baseName).join('、') || i18nT('当前设置') }) };
  try { await api().statePatch({ marketing: { rules: next, rulesReviewed: true, reviewedRevision: rulesReviewRevision.value } }); }
  catch (e) { notif.error(errorMessage(e)); return; }
  if (confirmationSeq !== rulesLoadSeq) return;
  rulesReviewPending.value = false;
  rulesLoadSeq += 1;
  rulesDraft.value = null;
  rulesError.value = '';
  rules.source = i18nT('手工核对：{p0}', { p0: rulesPdfs.value.map(baseName).join('、') || i18nT('当前设置') });
  rulesNote.value = i18nT('已确认使用下方手工核对的全部规则，请重新计算。');
  rulesNoteKind.value = 'warn';
  rulesWarn.value = '';
  steps.set('rules', { state: 'todo' });
}
const rulesNote = ref(rulesReviewPending.value ? i18nT('当前政策仍待核对；重新打开工作台不会解除，请重新抽取或对照原件确认下方全部规则。') : '');
const rulesNoteKind = ref('info');
/**
 * 「做完了，但有一处要你人工核对」这类**不阻塞的提醒**单独一条，用警告色。
 *
 * 之前它被拼进绿色的成功提示里：「已套用 2026 默认政策…延保档位表原件 OCR 有错位，
 * 请对照原件确认 8%/9%/10%/11% 四档」整条是绿的，真正要人动手的那半句被淹没。
 * 用户实拍反馈过。成功归成功，要核对的归警告。
 */
const rulesWarn = ref('');
const rulesError = ref('');
const rulesChangedNote = ref('');
async function extractRules(): Promise<void> {
  const paths = [...rulesPdfs.value];
  if (!paths.length) return;
  const seq = ++rulesLoadSeq;
  rulesReviewPending.value = true;
  rulesDraft.value = null;
  steps.start('rules');
  rulesError.value = '';
  rulesNote.value = i18nT('AI 正在读取 PDF 并抽取规则（扫描件需先 OCR，首次约 1–3 分钟）…');
  rulesNoteKind.value = 'info';
  const stale = () => {
    if (seq === rulesLoadSeq) return false;
    rulesNote.value = i18nT('PDF 抽取已结束，但等待期间你已套用预设 / 恢复示例规则，本次抽取结果未采用；需要的话重新拖入 PDF。');
    rulesNoteKind.value = 'warn';
    return true;
  };
  try {
    const r = await api().marketingRulesFromPdf({ paths });
    if (stale()) return;
    rulesReviewRevision.value = r.reviewRevision;
    if (r.error) {
      rulesError.value = r.error;
      rulesNote.value = '';
      steps.fail('rules', r.error);
      return;
    }
    rulesDraft.value = r;
    rulesNote.value = i18nT('已生成待核对草稿，尚未应用。{p0} {p1}', { p0: r.notes || '', p1: r.llmNote || '' });
    rulesNoteKind.value = 'warn';
    steps.set('rules', { state: 'todo' });
  } catch (e) {
    if (stale()) return;
    rulesError.value = i18nT('PDF 读取失败：{msg}。可点「套用 2026 默认政策」或对照 PDF 手工填写下方规则。', { msg: errorMessage(e) });
    rulesNote.value = '';
    steps.fail('rules', e);
  }
}
async function applyPreset(): Promise<void> {
  rulesDraft.value = null;
  rulesLoadSeq += 1;
  try {
    const r = await api().marketingRulesFromPdf({ preset: 'vatti-2026' });
    loadRules(r.rules);
    rulesReviewPending.value = false;
    rulesError.value = '';
    rulesNote.value = i18nT('已套用 2026 默认政策（TZ-270 / TZ-271）。');
    rulesNoteKind.value = 'ok';
    rulesWarn.value = i18nT('延保档位表原件 OCR 有错位，请对照原件确认 8% / 9% / 10% / 11% 四档后再计算。');
    steps.set('rules', { state: 'todo' });
  } catch (e) { notif.error(errorMessage(e)); }
}
const incentive = ref<any>(null);
const incentivePath = ref('');
const finalDone = ref(false);
/**
 * 规则一动（套预设 / PDF 抽取 / 手改任一字段），第 3 步起的核算结果全部作废并打回，界面明确提示重算 ——
 * 以前改完规则不重算，界面上还挂着旧规则算出来的激励（P0-1 的另一半）。
 * 门槛品类正则还决定第 2 步统计哪些行算门槛实际，它变了连第 2 步一起打回。
 */
watch(rules, () => {
  const hadResult = !!incentive.value || finalDone.value || steps.runtime.rules.state === 'done';
  const patternChanged = !!aux.value && (rules.qualifierPattern || '') !== auxQualifierPattern;
  if (!hadResult && !patternChanged) return;
  incentive.value = null;
  finalDone.value = false;
  if (patternChanged) {
    aux.value = null;
    steps.resetAfter('youzan');
    rulesChangedNote.value = i18nT('门槛品类关键字改了，第 2 步的门槛实际要重新统计：请回到第 2 步重新计算，再按规则算激励。');
  } else {
    // 第 5 步（延保达成率）不吃规则，结果留着；其余靠规则算出来的步骤全部打回
    for (const key of ['rules', 'return', 'discount', 'manager', 'provider', 'tax', 'report']) if (steps.runtime[key].state !== 'todo') steps.reset(key);
    rulesChangedNote.value = i18nT('规则已变更，之前算出的激励已作废，请重新点「按规则计算服务商辅材激励初始金额」。');
  }
}, { deep: true });
async function runCompute(withWarranty: boolean): Promise<any> {
  const r = await api().marketingCompute({
    year: year.value, quarter: quarter.value, aux: aux.value, warranty: withWarranty ? warranty.value : null, rules: rulesPayload(),
    grades: refOrNull(gradeTable.value), providerInfo: refOrNull(providerInfo.value),
  });
  incentive.value = r.result;
  incentivePath.value = r.outputPath;
  returnRecords.value = r.returnRecords;
  emit('refresh');
  return r;
}
async function computeInitial(): Promise<void> {
  if (rulesReviewPending.value || rulesDraft.value || rulesError.value) return;
  steps.start('rules');
  rulesChangedNote.value = '';
  try {
    const r = await runCompute(false);
    finalDone.value = false;
    steps.resetAfter('rules');
    for (const p of r.result.providers) if (selReturn[p.provider] === undefined) selReturn[p.provider] = p.auxInitial > 0;
    steps.done('rules', i18nT('服务商辅材激励初始金额合计 ¥{t}{r}', { t: fmtMoney(r.result.totals.auxInitial), r: r.result.totals.rebateAmount ? i18nT('，呆滞配件返利合计 ¥{x}', { x: fmtMoney(r.result.totals.rebateAmount) }) : '' }));
  } catch (e) { steps.fail('rules', e); }
}

// 4 退回通知
const returnRecords = ref<any[]>(props.state?.marketing?.returnRecords || []);
watch(() => props.state?.marketing?.returnRecords, (v) => { if (Array.isArray(v)) returnRecords.value = v; });
const ret = (provider: string) => returnRecords.value.find((r) => r.provider === provider);
const selReturn = reactive<Record<string, boolean>>({});
const selProvider = reactive<Record<string, boolean>>({});
const selectedOf = (m: Record<string, boolean>) => Object.keys(m).filter((k) => m[k]);
function toggleSel(m: Record<string, boolean>, v: boolean): void { for (const p of incentive.value?.providers || []) m[p.provider] = v; }
const returnDue = ref('');
// 用本地日期拼，不用 toISOString（UTC）：北京时间凌晨 0–8 点会算出早一天的截止日并发给服务商
const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
watch(() => rules.returnDueDays, () => { const d = new Date(); d.setDate(d.getDate() + Number(rules.returnDueDays || 30)); returnDue.value = localDate(d); }, { immediate: true });
const contactEmail = (p: string) => (props.state?.providerDirectory || []).find((c: any) => c.provider === p)?.email || '';
async function saveContactEmail(provider: string, email: string): Promise<void> {
  try { await api().contactsUpsert({ contacts: [{ provider, email }] }); emit('refresh'); } catch (e) { notif.error(errorMessage(e)); }
}
async function notify(kind: 'return' | 'invoice' | 'leader_info', stepKey: string): Promise<void> {
  steps.start(stepKey);
  try {
    const sel = kind === 'return' ? selectedOf(selReturn) : selectedOf(selProvider);
    const providers = (incentive.value?.providers || []).filter((p: any) => sel.includes(p.provider)).map((p: any) => ({
      provider: p.provider, amount: kind === 'return' ? p.auxInitial : kind === 'invoice' ? p.warrantyIncentive : p.leaderIncentive,
    }));
    const r = await api().marketingNotify({ kind, year: year.value, quarter: quarter.value, providers, dueDate: returnDue.value });
    returnRecords.value = r.returnRecords;
    const ok = r.outcomes.filter((o: any) => o.ok).length;
    const failed = r.outcomes.filter((o: any) => !o.ok);
    if (!ok) throw new Error(failed.map((o: any) => `${o.provider}：${o.message}`).join(i18nT('；')) || i18nT('没有可发送的服务商'));
    const label = kind === 'return' ? i18nT('退回通知') : kind === 'invoice' ? i18nT('开票通知') : i18nT('信息提报通知');
    steps.done(stepKey, i18nT('{l}已发 {a} 家{b}', { l: label, a: ok, b: failed.length ? i18nT('，{n} 家失败：{d}', { n: failed.length, d: failed.map((o: any) => `${o.provider}（${o.message}）`).join('、') }) : '' }));
    emit('refresh');
  } catch (e) { steps.fail(stepKey, e); }
}
async function markReturned(provider: string, returned: boolean): Promise<void> {
  try { const r = await api().marketingReturnUpdate({ provider, patch: { returned } }); returnRecords.value = r.returnRecords; } catch (e) { notif.error(errorMessage(e)); }
}

// 5 延保
const warrantyMeasure = ref<'quantity' | 'amount'>('amount');
const warranty = ref<any>(null);
async function computeWarranty(): Promise<void> {
  steps.start('warranty');
  warranty.value = null;
  try {
    const r = await api().marketingAchievement({
      year: year.value, quarter: quarter.value, orders: cssOrders.map(refOf),
      providerTasks: refOrNull(warrantyTasks.value),
      managerTasks: refOrNull(warrantyManagerTasks.value),
      measure: warrantyMeasure.value, knownProviderManager: aux.value?.providerManager || {},
      providerInfo: refOrNull(providerInfo.value),
    });
    warranty.value = r;
    steps.resetAfter('warranty');
    finalDone.value = false;
    steps.done('warranty', i18nT('服务商 {a} 家、区域经理 {b} 位；整体延保达成率 {r}', { a: r.providers.length, b: r.managers.length, r: fmtPct(r.totals.rate, 1) }));
  } catch (e) { steps.fail('warranty', e); }
}

// 6/7/8
const discountRuleText = computed(() => rules.managerDiscountTiers.map((t) => i18nT('延保达成率 < {r}% → 辅材提成打 {z} 折', { r: t.belowRatePct, z: t.discountZhe })).join(i18nT('；')) || i18nT('（未设置打折档位 = 全额结算）'));
async function computeFinal(): Promise<void> {
  if (rulesReviewPending.value || rulesDraft.value || rulesError.value) return;
  steps.start('discount');
  try {
    const r = await runCompute(true);
    finalDone.value = true;
    for (const p of r.result.providers) if (selProvider[p.provider] === undefined) selProvider[p.provider] = true;
    const discounted = r.result.managers.filter((m: any) => m.discount < 1).length;
    steps.done('discount', i18nT('{n} 位区域经理需打折结算，{m} 位全额', { n: discounted, m: r.result.managers.length - discounted }));
    steps.set('manager', { state: 'todo', summary: undefined });
    steps.set('provider', { state: 'todo', summary: undefined });
  } catch (e) { steps.fail('discount', e); }
}
function confirmManager(): void {
  steps.start('manager');
  steps.done('manager', i18nT('区域经理最终激励合计 ¥{t}（预发口径 ¥{a}），核算表已生成', { t: fmtMoney(incentive.value.totals.managerFinal), a: fmtMoney(incentive.value.totals.managerAdvance) }));
}

// 9 负责人
const leaders = ref<any[]>(props.state?.marketing?.leaders || []);
watch(() => props.state?.marketing?.leaders, (v) => { if (Array.isArray(v)) leaders.value = v; });
const providerNames = computed<string[]>(() => (incentive.value?.providers || []).map((p: any) => p.provider));
const manualProvider = ref('');
async function scanLeaders(): Promise<void> {
  steps.start('leaders');
  try {
    await api().settlementScanNow();
    const r = await api().stateGet();
    leaders.value = r.state.marketing.leaders;
    const bad = leaders.value.filter((l) => l.errors.length).length;
    steps.done('leaders', i18nT('已汇总 {n} 家负责人信息，{b} 家信息有误需修正', { n: leaders.value.length, b: bad }));
    emit('refresh');
  } catch (e) { steps.fail('leaders', e); }
}
async function importLeaders(): Promise<void> {
  const paths = await pickFiles('excel', false, i18nT('选择负责人信息 Excel'));
  if (!paths[0]) return;
  steps.start('leaders');
  try {
    const r = await api().marketingLeadersImport({ path: paths[0] });
    leaders.value = r.leaders;
    steps.done('leaders', i18nT('导入 {n} 条；{b} 条信息有误', { n: r.imported, b: leaders.value.filter((l) => l.errors.length).length }));
  } catch (e) { steps.fail('leaders', e); }
}
async function updLeader(provider: string, key: string, value: string): Promise<void> {
  try { const r = await api().marketingLeaderUpdate({ provider, patch: { [key]: value } }); leaders.value = r.leaders; } catch (e) { notif.error(errorMessage(e)); }
}
async function addManualLeader(): Promise<void> {
  if (!manualProvider.value) return;
  await updLeader(manualProvider.value, 'name', '');
  manualProvider.value = '';
}

// 10 个税
const taxTemplate = ref(props.state?.marketing?.taxTemplatePath || '');
const taxPath = ref(props.state?.marketing?.lastTaxPath || '');
async function exportTax(): Promise<void> {
  steps.start('tax');
  try {
    const r = await api().marketingTaxExport({ templatePath: taxTemplate.value || undefined, incentiveByProvider: Object.fromEntries((incentive.value?.providers || []).map((p: any) => [p.provider, p.leaderIncentive])) });
    taxPath.value = r.outputPath;
    steps.done('tax', i18nT('{n} 人，应扣缴税额合计 ¥{t}{tpl}{skip}', { n: r.count, t: fmtMoney(r.totalTax), tpl: r.usedTemplate ? i18nT('（已套用模板）') : i18nT('（内置格式）'), skip: r.skipped.length ? i18nT('；{k} 家信息有误未生成：{names}', { k: r.skipped.length, names: r.skipped.join('、') }) : '' }));
  } catch (e) { steps.fail('tax', e); }
}

// 11 报告
const reportPath = ref(props.state?.marketing?.lastReportPath || '');
const reportMd = ref('');
const reportNote = ref('');
async function genReport(): Promise<void> {
  steps.start('report');
  reportMd.value = '';
  try {
    const r = await api().marketingReport({ year: year.value, quarter: quarter.value, aux: aux.value, warranty: warranty.value, incentive: incentive.value });
    reportPath.value = r.outputPath;
    reportMd.value = r.markdown;
    reportNote.value = r.llmNote || '';
    steps.done('report', i18nT('季度结案报告已生成'));
    notif.success(i18nT('季度结案报告已生成'));
    emit('refresh');
  } catch (e) { steps.fail('report', e); }
}
</script>

<style scoped>
.ss-source { display: grid; gap: 8px; padding: 10px 12px; border-radius: 12px; background: var(--color-bg-primary); border: 1px solid var(--color-border); }
.ss-dl { display: flex; flex-wrap: wrap; gap: 6px; }
.ss-dl .ss-chip { cursor: pointer; border: none; font: inherit; }
.ss-switch { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer; white-space: nowrap; }
.ss-report { white-space: pre-wrap; font: inherit; font-size: 12.5px; line-height: 1.6; max-height: 420px; overflow: auto; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); margin: 0; }
.ss-error-banner { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--color-danger, #d92d20); background: color-mix(in srgb, var(--color-danger, #d92d20) 10%, var(--color-bg-primary)); color: var(--color-danger, #d92d20); font-size: 13px; line-height: 1.5; }
.ss-error-banner i { font-size: 20px; line-height: 1; }
.ss-rules .ss-subhead { margin-top: 10px; }
.spin { animation: ss-spin 1s linear infinite; }
@keyframes ss-spin { to { transform: rotate(360deg); } }
</style>
