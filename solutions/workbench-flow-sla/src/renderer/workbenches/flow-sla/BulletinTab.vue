<template>
  <div class="ss-module">
    <StickyProgress :title="$t('时效通报')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <!-- 1 导入 -->
      <StepCard step-key="fs-import" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['fs-import']" :is-current="currentKey === 'fs-import'">
        <div class="ss-actions">
          <div class="fs-seg" role="radiogroup">
            <button v-for="k in KINDS" :key="k" type="button" :class="{ on: form.kind === k }" :data-test="`fs-kind-${k}`" @click="setKind(k)">{{ kindLabel(k) }}</button>
          </div>
          <label class="ss-field inline"><span>{{ $t('统计周期') }}</span><input v-model="form.start" type="date" data-test="fs-period-start" /></label>
          <label class="ss-field inline"><span>{{ $t('至') }}</span><input v-model="form.lastDay" type="date" data-test="fs-period-end" /></label>
          <label class="ss-field inline"><span>{{ $t('报表导出日期') }}</span><input v-model="form.asOf" type="date" /></label>
          <span class="ss-muted">{{ $t('在途时长算到报表导出那一天') }}</span>
        </div>
        <div v-for="sys in SYSTEMS" :key="sys" class="fs-sys">
          <h4><i class="ri-database-2-line"></i>{{ sys }}<small>{{ systemHint(sys) }}</small></h4>
          <div class="fs-slots">
            <div v-for="slot in SLOTS" :key="slot" class="fs-slot">
              <FileDropField
                :label="slot === 'flow' ? $t('{sys} 流程表（一行一个流程）', { sys }) : $t('{sys} 节点表（一行一次节点处理）', { sys })"
                :hint="slot === 'flow' ? $t('发起人维度的时效报表；一行一个节点的合并表也放这里') : $t('处理人维度的时效报表，算个人审核用时要用')"
                :multi="false" compact :disabled="!!busy"
                :files="tables[sys][slot] ? [{ path: tables[sys][slot]!.path, name: tables[sys][slot]!.fileName }] : []"
                @picked="(p: string[]) => pick(sys, slot, p[0])" @remove="tables[sys][slot] = null"
              />
              <template v-if="tables[sys][slot]">
                <p v-if="tables[sys][slot]!.combined && slot === 'flow'" class="ss-note info"><i class="ri-information-line"></i>{{ $t('这张表一行是一个节点，流程会按单号归并出来，不用再放节点表') }}</p>
                <TableMapping :table="tables[sys][slot]!" :roles="roleDefs(slot, tables[sys][slot]!.mapping, !!tables[sys].flow)" @update="(m: Record<string, string>) => (tables[sys][slot]!.mapping = m)" @sheet="(n: string) => pick(sys, slot, tables[sys][slot]!.path, n)" />
              </template>
            </div>
          </div>
        </div>
        <div class="fs-sys">
          <h4><i class="ri-team-line"></i>{{ $t('花名册') }}<small>{{ $t('本中心人员名单：个人排名只统计名单里的人；有邮箱才能发原因收集和提醒邮件') }}</small></h4>
          <FileDropField :label="$t('中心人员花名册')" :multi="false" compact :disabled="!!busy" :files="roster ? [{ path: roster.path, name: roster.fileName }] : []" @picked="(p: string[]) => pickRoster(p[0])" @remove="roster = null" />
          <TableMapping v-if="roster" :table="roster" :roles="roleDefs('roster', roster.mapping, false)" @update="(m: Record<string, string>) => (roster!.mapping = m)" @sheet="(n: string) => pickRoster(roster!.path, n)" />
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !canImport" data-test="fs-import-commit" @click="commit"><i :class="busy === 'fs-import' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('导入并标准化') }}</button>
          <button type="button" class="ss-btn" :disabled="!!busy" data-test="fs-demo" @click="demo"><i class="ri-file-download-line"></i>{{ $t('生成示例数据') }}</button>
          <span v-if="importBlock" class="ss-muted">{{ importBlock }}</span>
        </div>
        <template v-if="ingest">
          <p v-if="demoDir" class="ss-file-out"><i class="ri-folder-check-line"></i><code>{{ demoDir }}</code><button type="button" class="ss-link" @click="openPath(demoDir, true)">{{ $t('打开示例数据所在文件夹') }}</button></p>
          <p v-for="w in ingest.warnings" :key="w" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ w }}</p>
          <div v-if="ingest.skipped.length" class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('没有收的行') }}</th><th>{{ $t('原因') }}</th><th class="num">{{ $t('行数') }}</th><th>{{ $t('在文件里的行号') }}</th></tr></thead>
              <tbody><tr v-for="s in ingest.skipped" :key="s.file + s.reason"><td>{{ s.file }}</td><td>{{ s.reason }}</td><td class="num">{{ s.count }}</td><td>{{ s.rows.join($t('、')) }}{{ s.count > s.rows.length ? ' …' : '' }}</td></tr></tbody>
            </table>
          </div>
        </template>
      </StepCard>

      <!-- 2 核对 -->
      <StepCard step-key="fs-check" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['fs-check']" :is-current="currentKey === 'fs-check'">
        <p v-if="!check" class="ss-empty">{{ $t('导入后在这里核对规则对得上对不上') }}</p>
        <template v-else>
          <div class="ss-kpis">
            <div v-for="c in check.counts" :key="c.system" class="ss-kpi"><small>{{ c.system }}{{ c.derived ? $t('（按单号归并）') : '' }}</small><strong>{{ c.flows }}</strong><small>{{ $t('办结 {a} · 在途 {b} · 终止 {c} · 节点 {d} 行', { a: c.done, b: c.running, c: c.terminated, d: c.nodes }) }}</small></div>
            <div class="ss-kpi"><small>{{ $t('花名册') }}</small><strong>{{ check.rosterCount }}</strong><small>{{ check.rosterCount ? $t('个人排名只统计名单里的人') : $t('没有花名册：所有审核人都参与排名') }}</small></div>
          </div>
          <div class="ss-subhead">{{ $t('对不上规则表的流程名（{n} 个）', { n: pendingUnmatched.length }) }}</div>
          <p v-if="!check.unmatched.length" class="ss-note ok"><i class="ri-checkbox-circle-line"></i>{{ $t('所有流程名都对上了规则表') }}</p>
          <div v-else class="ss-table-wrap fs-scroll">
            <table class="ss-table">
              <thead><tr><th>{{ $t('系统') }}</th><th>{{ $t('报表里的流程名') }}</th><th class="num">{{ $t('流程数') }}</th><th>{{ $t('现在怎么算') }}</th><th>{{ $t('改成按这个细类算') }}</th></tr></thead>
              <tbody>
                <tr v-for="u in check.unmatched" :key="u.system + u.flowName" :class="{ bad: !u.regular && u.system === 'CSS' }">
                  <td>{{ u.system }}</td><td>{{ u.flowName }}</td><td class="num">{{ u.count }}</td>
                  <td>{{ u.system === 'CSS' ? $t('没有时效要求，不参与合规率') : u.regular ? $t('已确认为常规流程') : $t('按常规流程（无整体时效要求）') }}</td>
                  <td>
                    <select :disabled="!!busy" :data-test="`fs-alias-${u.flowName}`" @change="setAlias(u.system, u.flowName, ($event.target as HTMLSelectElement).value)">
                      <option value="">{{ $t('— 选择规则细类 —') }}</option>
                      <option v-if="u.system !== 'CSS' && !u.regular" :value="REGULAR">{{ $t('确认是常规流程，不再提示') }}</option>
                      <option v-for="r in typesFor(u.system)" :key="r.flowType" :value="r.flowType">{{ r.category }} · {{ r.flowType }}</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="mappedAliases.length" class="ss-muted">{{ $t('已对应：') }}<span v-for="a in mappedAliases" :key="a.system + a.flowName" class="ss-chip brand fs-chip">{{ a.system }} · {{ a.flowName }} → {{ a.target }}<button type="button" :title="$t('取消')" @click="setAlias(a.system, a.flowName, '')"><i class="ri-close-line"></i></button></span></p>

          <div class="ss-subhead">{{ $t('没有登记内外部属性的节点（{n} 个）', { n: check.unknownNodes.length }) }}</div>
          <p v-if="!check.unknownNodes.length" class="ss-note ok"><i class="ri-checkbox-circle-line"></i>{{ $t('所有节点都有内外部属性') }}</p>
          <template v-else>
            <p class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('没定之前这些节点不计入个人审核用时。选「计入」= 内部节点，算审核人的用时；选「不计入」= 外部节点。') }}</p>
            <div class="ss-table-wrap fs-scroll">
              <table class="ss-table">
                <thead><tr><th>{{ $t('系统') }}</th><th>{{ $t('流程名') }}</th><th>{{ $t('节点') }}</th><th class="num">{{ $t('出现次数') }}</th><th>{{ $t('怎么处理') }}</th></tr></thead>
                <tbody>
                  <tr v-for="n in check.unknownNodes" :key="n.system + n.flowName + n.node">
                    <td>{{ n.system }}</td><td>{{ n.flowName }}</td><td>{{ n.node }}</td><td class="num">{{ n.count }}</td>
                    <td class="fs-ops"><button type="button" class="ss-btn sm" :disabled="!!busy" data-test="fs-node-in" @click="decide(n, true)">{{ $t('计入') }}</button><button type="button" class="ss-btn sm" :disabled="!!busy" data-test="fs-node-out" @click="decide(n, false)">{{ $t('不计入') }}</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <p v-if="check.decisions.length" class="ss-muted">{{ $t('已定：') }}<span v-for="d in check.decisions" :key="d.system + d.flowName + d.node" class="ss-chip fs-chip">{{ $t('{p0} · {p1}：{p2}', { p0: d.flowName, p1: d.node, p2: d.internal ? $t('计入') : $t('不计入') }) }}<button type="button" :title="$t('取消')" @click="decide(d, null)"><i class="ri-close-line"></i></button></span></p>

          <template v-if="check.outOfRoster.length">
            <div class="ss-subhead">{{ $t('不在花名册里的审核人（{n} 人，不参与个人排名）', { n: check.outOfRoster.length }) }}</div>
            <p class="fs-chips"><span v-for="n in check.outOfRoster" :key="n" class="ss-chip">{{ n }}</span></p>
          </template>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="fs-check-done" @click="confirmCheck"><i class="ri-check-line"></i>{{ $t('核对好了，去计算') }}</button>
          </div>
        </template>
      </StepCard>

      <!-- 3 计算 -->
      <StepCard step-key="fs-calc" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['fs-calc']" :is-current="currentKey === 'fs-calc'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !check" data-test="fs-calc-run" @click="runCalc"><i :class="busy === 'fs-calc' ? 'ri-loader-4-line spin' : 'ri-calculator-line'"></i>{{ calc ? $t('重新计算') : $t('开始计算') }}</button>
          <button v-if="calc" type="button" class="ss-btn" :disabled="!!busy" data-test="fs-calc-export" @click="exportCalc"><i class="ri-file-excel-2-line"></i>{{ $t('导出全部明细') }}</button>
        </div>
        <template v-if="calc">
          <p v-if="calcFile" class="ss-file-out"><i class="ri-file-excel-2-line"></i><code>{{ calcFile }}</code><button type="button" class="ss-link" @click="openPath(calcFile)">{{ $t('打开') }}</button><button type="button" class="ss-link" @click="openPath(calcFile, true)">{{ $t('所在文件夹') }}</button></p>
          <div class="ss-kpis" data-test="fs-kpis">
            <div class="ss-kpi"><small>{{ $t('办结数') }}</small><strong>{{ calc.overall.doneCount }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('平均用时（天）') }}</small><strong>{{ fmtDays(calc.overall.avgDays) }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('流程时效合规率') }}</small><strong>{{ fmtRate(calc.overall.complianceRate) }}</strong><small>{{ $t('超时 {a} / 参与判定 {b}', { a: calc.overall.overtime, b: calc.overall.judged }) }}</small></div>
            <div class="ss-kpi"><small>{{ $t('在途数') }}</small><strong>{{ calc.overall.runningCount }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('已逾期') }}</small><strong :class="{ 'fs-bad': calc.overall.runningOverdue > 0 }">{{ calc.overall.runningOverdue }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('较大逾期风险') }}</small><strong :class="{ 'fs-warn': calc.overall.runningRisk > 0 }">{{ calc.overall.runningRisk }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('个人审核合规率') }}</small><strong>{{ fmtRate(calc.overall.reviewRate) }}</strong><small>{{ $t('合规 {a} / 审核 {b} 次', { a: calc.overall.reviewCompliant, b: calc.overall.reviewCount }) }}</small></div>
          </div>
          <p v-if="calc.approxCount" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('{n} 个 CSS 流程没有节点明细，用时按「结束 − 开始」估算（规则要求只累计内部节点）', { n: calc.approxCount }) }}</p>
          <p v-if="trackNote" class="ss-note info"><i class="ri-notification-3-line"></i>{{ trackNote }}</p>

          <div class="ss-subhead">{{ $t('按大类') }}</div>
          <div class="ss-table-wrap"><table class="ss-table">
            <thead><tr><th>{{ $t('大类') }}</th><th class="num">{{ $t('办结') }}</th><th class="num">{{ $t('平均用时（天）') }}</th><th class="num">{{ $t('超时') }}</th><th class="num">{{ $t('合规率') }}</th><th class="num">{{ $t('在途') }}</th><th class="num">{{ $t('在途逾期') }}</th><th class="num">{{ $t('在途超时占比') }}</th></tr></thead>
            <tbody><tr v-for="t in calc.byCategory" :key="t.category"><td>{{ t.category }}</td><td class="num">{{ t.doneCount }}</td><td class="num">{{ fmtDays(t.avgDays) }}</td><td class="num">{{ t.overtime }}</td><td class="num">{{ fmtRate(t.complianceRate) }}</td><td class="num">{{ t.runningCount }}</td><td class="num">{{ t.runningOverdue }}</td><td class="num">{{ fmtRate(t.runningOverdueRate) }}</td></tr></tbody>
          </table></div>

          <div class="ss-subhead">{{ $t('按细类（{n} 类）', { n: calc.byType.length }) }}</div>
          <div class="ss-table-wrap fs-scroll"><table class="ss-table">
            <thead><tr><th>{{ $t('大类') }}</th><th>{{ $t('流程细类') }}</th><th>{{ $t('系统') }}</th><th class="num">{{ $t('办结') }}</th><th class="num">{{ $t('平均用时（天）') }}</th><th class="num">{{ $t('时效要求') }}</th><th class="num">{{ $t('超时') }}</th><th class="num">{{ $t('合规率') }}</th><th class="num">{{ $t('在途') }}</th><th class="num">{{ $t('在途逾期') }}</th></tr></thead>
            <tbody><tr v-for="t in calc.byType" :key="t.category + t.flowType + t.system" :class="{ bad: t.complianceRate !== null && t.complianceRate < minRate }"><td>{{ t.category }}</td><td>{{ t.flowType }}</td><td>{{ t.system }}</td><td class="num">{{ t.doneCount }}</td><td class="num">{{ fmtDays(t.avgDays) }}</td><td class="num">{{ t.limitDays ?? '-' }}</td><td class="num">{{ t.overtime }}</td><td class="num">{{ fmtRate(t.complianceRate) }}</td><td class="num">{{ t.runningCount }}</td><td class="num">{{ t.runningOverdue }}</td></tr></tbody>
          </table></div>

          <div class="fs-two">
            <div>
              <div class="ss-subhead">{{ $t('审核人合规率排名（{n} 人）', { n: calc.reviewerRank.length }) }}</div>
              <div class="ss-table-wrap fs-scroll"><table class="ss-table">
                <thead><tr><th class="num">{{ $t('排名') }}</th><th>{{ $t('姓名') }}</th><th>{{ $t('部门') }}</th><th>{{ $t('身份') }}</th><th class="num">{{ $t('审核次数') }}</th><th class="num">{{ $t('合规率') }}</th><th class="num">{{ $t('平均用时') }}</th></tr></thead>
                <tbody><tr v-for="p in calc.reviewerRank" :key="p.name"><td class="num">{{ p.rank }}</td><td>{{ p.name }}</td><td>{{ p.dept }}</td><td>{{ p.identity }}</td><td class="num">{{ p.count }}</td><td class="num">{{ fmtRate(p.rate) }}</td><td class="num">{{ fmtDays(p.avgDays) }}</td></tr></tbody>
              </table></div>
            </div>
            <div>
              <div class="ss-subhead">{{ $t('发起人合规率排名（{n} 人）', { n: calc.initiatorRank.length }) }}</div>
              <div class="ss-table-wrap fs-scroll"><table class="ss-table">
                <thead><tr><th class="num">{{ $t('排名') }}</th><th>{{ $t('姓名') }}</th><th>{{ $t('部门') }}</th><th class="num">{{ $t('办结数') }}</th><th class="num">{{ $t('合规率') }}</th><th class="num">{{ $t('平均用时') }}</th></tr></thead>
                <tbody><tr v-for="p in calc.initiatorRank" :key="p.name"><td class="num">{{ p.rank }}</td><td>{{ p.name }}</td><td>{{ p.dept }}</td><td class="num">{{ p.count }}</td><td class="num">{{ fmtRate(p.rate) }}</td><td class="num">{{ fmtDays(p.avgDays) }}</td></tr></tbody>
              </table></div>
            </div>
          </div>

          <div class="ss-subhead">{{ $t('本期办结超时（{n} 单）', { n: calc.overtime.length }) }}</div>
          <FlowTable :flows="calc.overtime" :empty="$t('本期没有办结超时的流程')" />
          <div class="ss-subhead">{{ $t('在途已逾期与较大逾期风险（{n} 单）', { n: calc.runningAbnormal.length }) }}</div>
          <FlowTable :flows="calc.runningAbnormal" running :empty="$t('没有逾期或临期的在途流程')" />
        </template>
      </StepCard>

      <!-- 4 环比与异常 -->
      <StepCard step-key="fs-compare" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['fs-compare']" :is-current="currentKey === 'fs-compare'">
        <p v-if="!calc" class="ss-empty">{{ $t('计算完成后在这里和上一周期对比') }}</p>
        <template v-else>
          <div class="ss-actions">
            <label v-if="compare && compare.candidates.length" class="ss-field inline"><span>{{ $t('对比周期') }}</span>
              <select v-model="prevId" data-test="fs-prev"><option value="">{{ $t('自动（上一个同类周期）') }}</option><option v-for="c in compare.candidates" :key="c.id" :value="c.id">{{ c.label }}</option></select>
            </label>
            <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="fs-compare-run" @click="runCompare"><i :class="busy === 'fs-compare' ? 'ri-loader-4-line spin' : 'ri-line-chart-line'"></i>{{ compare ? $t('重新分析') : $t('环比分析') }}</button>
          </div>
          <template v-if="compare">
            <p v-if="!compare.previous" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('还没有上一周期的快照，这一期只按「合规率低于 {p0}」判断异常；下一期起会有环比。', { p0: fmtRate(minRate) }) }}</p>
            <div v-else class="ss-kpis">
              <div class="ss-kpi"><small>{{ $t('对比周期') }}</small><strong class="fs-small">{{ compare.previous.label }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('合规率变化（百分点）') }}</small><strong :class="deltaClass(compare.delta.complianceRate, true)">{{ fmtPoints(compare.delta.complianceRate) }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('平均用时变化（天）') }}</small><strong :class="deltaClass(compare.delta.avgDays, false)">{{ fmtSigned(compare.delta.avgDays) }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('办结量变化') }}</small><strong>{{ fmtSigned(compare.delta.doneCount) }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('在途逾期变化') }}</small><strong :class="deltaClass(compare.delta.runningOverdue, false)">{{ fmtSigned(compare.delta.runningOverdue) }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('个人审核合规率变化（百分点）') }}</small><strong :class="deltaClass(compare.delta.reviewRate, true)">{{ fmtPoints(compare.delta.reviewRate) }}</strong></div>
            </div>
            <div class="ss-subhead">{{ $t('各流程类型环比（异常 {n} 类）', { n: compare.abnormal.length }) }}</div>
            <div class="ss-table-wrap fs-scroll"><table class="ss-table">
              <thead><tr><th>{{ $t('流程细类') }}</th><th>{{ $t('系统') }}</th><th class="num">{{ $t('办结') }}</th><th class="num">{{ $t('平均用时') }}</th><th class="num">{{ $t('上期') }}</th><th class="num">{{ $t('变化') }}</th><th class="num">{{ $t('合规率') }}</th><th class="num">{{ $t('上期') }}</th><th class="num">{{ $t('变化（百分点）') }}</th><th>{{ $t('异常原因') }}</th></tr></thead>
              <tbody><tr v-for="t in compare.types" :key="t.flowType + t.system" :class="{ bad: t.abnormal }"><td>{{ t.flowType }}</td><td>{{ t.system }}</td><td class="num">{{ t.doneCount }}</td><td class="num">{{ fmtDays(t.avgDays) }}</td><td class="num">{{ fmtDays(t.prevAvgDays) }}</td><td class="num">{{ fmtSigned(t.avgDelta) }}</td><td class="num">{{ fmtRate(t.complianceRate) }}</td><td class="num">{{ fmtRate(t.prevComplianceRate) }}</td><td class="num">{{ fmtPoints(t.rateDelta) }}</td><td class="fs-wrap">{{ t.reasons.join($t('；')) }}</td></tr></tbody>
            </table></div>

            <div v-for="a in compare.abnormal" :key="a.flowType + a.system" class="fs-abn" data-test="fs-abnormal">
              <header><strong>{{ a.flowType }}</strong><span class="ss-chip">{{ a.system }}</span><span v-for="r in a.reasons" :key="r" class="ss-chip bad">{{ r }}</span>
                <span v-if="a.analysis.longestNode" class="ss-chip warn"><i class="ri-timer-flash-line"></i>{{ $t('耗时最长的节点：{p0}', { p0: a.analysis.longestNode }) }}</span></header>
              <p v-if="!a.analysis.nodes.length" class="ss-muted">{{ $t('这一类流程没有节点明细，定位不到具体节点') }}</p>
              <div v-else class="ss-table-wrap"><table class="ss-table">
                <thead><tr><th>{{ $t('节点') }}</th><th>{{ $t('内外部') }}</th><th class="num">{{ $t('处理次数') }}</th><th class="num">{{ $t('平均耗时（天）') }}</th><th class="num">{{ $t('最长（天）') }}</th><th class="num">{{ $t('平均等待（天）') }}</th><th class="num">{{ $t('耗时占比') }}</th><th class="num">{{ $t('在途停留数') }}</th><th class="num">{{ $t('平均停留（天）') }}</th></tr></thead>
                <tbody><tr v-for="n in a.analysis.nodes" :key="n.node" :class="{ bad: n.node === a.analysis.longestNode }"><td>{{ n.node }}</td><td>{{ n.internal == null ? $t('未登记') : n.internal ? $t('内部') : $t('外部') }}</td><td class="num">{{ n.count }}</td><td class="num">{{ fmtDays(n.avgDays) }}</td><td class="num">{{ fmtDays(n.maxDays) }}</td><td class="num">{{ fmtDays(n.avgWaitDays) }}</td><td class="num">{{ fmtRate(n.share) }}</td><td class="num">{{ n.stuckCount }}</td><td class="num">{{ fmtDays(n.avgStuckDays) }}</td></tr></tbody>
              </table></div>
            </div>

            <template v-if="calc.period.kind === 'monthly'">
              <div class="ss-subhead">{{ $t('本年度发起、仍未办结且已超时的在途流程（{n} 单）', { n: compare.yearOverdue.length }) }}</div>
              <FlowTable :flows="compare.yearOverdue" running :empty="$t('本年度没有超时未办结的在途流程')" />
            </template>
          </template>
        </template>
      </StepCard>

      <!-- 5 原因 -->
      <StepCard step-key="fs-reason" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['fs-reason']" :is-current="currentKey === 'fs-reason'">
        <p v-if="!calc" class="ss-empty">{{ $t('计算完成后在这里收集超时原因') }}</p>
        <template v-else>
          <p v-if="!cases.length" class="ss-note ok"><i class="ri-checkbox-circle-line"></i>{{ $t('本期没有办结超时或在途逾期的流程，不需要收集原因') }}</p>
          <template v-else>
            <MailStatus />
            <div class="ss-subhead">{{ $t('按责任人发原因收集邮件（{a} 人，{b} 个流程）', { a: mails.length, b: cases.length }) }}</div>
            <div class="ss-table-wrap fs-scroll"><table class="ss-table">
              <thead><tr><th><input type="checkbox" :checked="allPicked" @change="toggleAll(($event.target as HTMLInputElement).checked)" /></th><th>{{ $t('责任人') }}</th><th class="num">{{ $t('流程数') }}</th><th>{{ $t('邮箱') }}</th><th>{{ $t('状态') }}</th><th></th></tr></thead>
              <tbody>
                <template v-for="m in mails" :key="m.owner">
                  <tr>
                    <td><input v-model="picked" type="checkbox" :value="m.owner" :disabled="!m.email" /></td>
                    <td>{{ m.owner || $t('（没有责任人）') }}</td><td class="num">{{ m.count }}</td>
                    <td><input type="text" :value="m.email" :placeholder="$t('花名册里没有邮箱，可在这里补')" @change="setOwnerEmail(m.owner, ($event.target as HTMLInputElement).value)" /></td>
                    <td><span v-if="m.mailedAt" class="ss-chip ok">{{ $t('已发 {p0}', { p0: fmtDateTime(m.mailedAt) }) }}</span><span v-else-if="!m.email" class="ss-chip warn">{{ $t('没有邮箱，发不了') }}</span><span v-else class="ss-chip">{{ $t('未发') }}</span></td>
                    <td><button type="button" class="ss-link" @click="previewOwner = previewOwner === m.owner ? '' : m.owner">{{ previewOwner === m.owner ? $t('收起') : $t('预览邮件') }}</button></td>
                  </tr>
                  <tr v-if="previewOwner === m.owner"><td colspan="6"><div class="fs-mail"><b>{{ m.subject }}</b><pre>{{ m.body }}</pre><small>{{ $t('附件：这位责任人名下流程的《超时原因收集表》') }}</small></div></td></tr>
                </template>
              </tbody>
            </table></div>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !picked.length" data-test="fs-reason-send" @click="sendReasonMails"><i :class="busy === 'fs-reason-send' ? 'ri-loader-4-line spin' : 'ri-mail-send-line'"></i>{{ $t('发送给所选的 {n} 人', { n: picked.length }) }}</button>
              <button type="button" class="ss-btn" :disabled="!!busy" @click="exportReasons"><i class="ri-file-excel-2-line"></i>{{ $t('导出原因收集表') }}</button>
              <button type="button" class="ss-btn" :disabled="!!busy" @click="importReasons"><i class="ri-upload-2-line"></i>{{ $t('导入填好的表') }}</button>
            </div>
            <p v-for="n in reasonNotes" :key="n.text" class="ss-note" :class="n.cls"><i class="ri-information-line"></i>{{ n.text }}</p>
            <p v-if="reasonFile" class="ss-file-out"><i class="ri-file-excel-2-line"></i><code>{{ reasonFile }}</code><button type="button" class="ss-link" @click="openPath(reasonFile)">{{ $t('打开') }}</button></p>

            <div class="ss-subhead">{{ $t('原因回填与归类（已填 {a} / {b}）', { a: filledCount, b: cases.length }) }}</div>
            <div class="ss-table-wrap fs-scroll"><table class="ss-table">
              <thead><tr><th>{{ $t('责任人') }}</th><th>{{ $t('系统') }}</th><th>{{ $t('单号') }}</th><th>{{ $t('流程细类') }}</th><th>{{ $t('类型') }}</th><th class="num">{{ $t('超出（天）') }}</th><th>{{ $t('超时原因') }}</th><th>{{ $t('原因类别') }}</th></tr></thead>
              <tbody>
                <tr v-for="c in cases" :key="c.key">
                  <td>{{ c.owner }}</td><td>{{ c.system }}</td><td>{{ c.flowNo }}</td><td>{{ c.flowType }}</td>
                  <td><span class="ss-chip" :class="c.kind === 'running' ? 'bad' : 'warn'">{{ c.kind === 'running' ? $t('在途已逾期') : $t('已办结超时') }}</span></td>
                  <td class="num">{{ fmtDays(c.overdueDays) }}</td>
                  <td><input type="text" class="fs-reason" :value="c.reason" :placeholder="$t('填责任人反馈的原因')" :data-test="`fs-reason-${c.flowNo}`" @change="setReason(c.key, ($event.target as HTMLInputElement).value)" /></td>
                  <td><select :value="c.categoryId" :disabled="!c.reason" @change="setCategory(c.key, ($event.target as HTMLSelectElement).value)"><option value="">{{ $t('未归类') }}</option><option v-for="id in CATEGORIES" :key="id" :value="id">{{ reasonCategoryLabel(id) }}</option></select></td>
                </tr>
              </tbody>
            </table></div>
            <div class="ss-actions">
              <button type="button" class="ss-btn" :disabled="!!busy || !filledCount" data-test="fs-classify-rule" @click="classify(false)"><i :class="busy === 'fs-classify' ? 'ri-loader-4-line spin' : 'ri-price-tag-3-line'"></i>{{ $t('按关键字归类') }}</button>
              <button type="button" class="ss-btn" :disabled="!!busy || !filledCount" @click="classify(true)"><i class="ri-price-tag-3-line"></i>{{ $t('用模型归类并写根因') }}</button>
              <span class="ss-muted">{{ $t('模型只在固定的七类里选，不算任何数字；它写的话里出现材料里没有的数字会被去掉') }}</span>
            </div>
            <div v-if="categoryStats.length" class="fs-roots">
              <label v-for="s in categoryStats" :key="s.id" class="ss-field"><span><b>{{ reasonCategoryLabel(s.id) }}</b> · {{ $t('{n} 单', { n: s.count }) }}</span>
                <textarea :value="rootCauses[s.id] || ''" rows="2" :placeholder="$t('根因说明')" @change="setRootCause(s.id, ($event.target as HTMLTextAreaElement).value)"></textarea>
              </label>
            </div>
          </template>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="fs-reason-done" @click="confirmReasons"><i class="ri-check-line"></i>{{ cases.length && filledCount < cases.length ? $t('先按已收到的继续（还有 {n} 个没填）', { n: cases.length - filledCount }) : $t('原因收集完成') }}</button>
          </div>
        </template>
      </StepCard>

      <!-- 6 通报 -->
      <StepCard step-key="fs-report" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime['fs-report']" :is-current="currentKey === 'fs-report'">
        <p v-if="!calc" class="ss-empty">{{ $t('计算完成后在这里生成通报') }}</p>
        <template v-else>
          <div class="ss-actions">
            <button type="button" class="ss-btn" :disabled="!!busy" data-test="fs-draft-rule" @click="draft(false)"><i :class="busy === 'fs-draft' ? 'ri-loader-4-line spin' : 'ri-file-text-line'"></i>{{ $t('按数据起草总结与建议') }}</button>
            <button type="button" class="ss-btn" :disabled="!!busy" @click="draft(true)"><i class="ri-quill-pen-line"></i>{{ $t('用模型起草') }}</button>
            <span v-if="draftNote" class="ss-muted">{{ draftNote }}</span>
          </div>
          <label class="ss-field"><span>{{ calc.period.kind === 'monthly' ? $t('月度总结（整体表现 / 异常趋势 / 重点问题 / 责任维度）') : $t('小结（可留空）') }}</span>
            <textarea v-model="summary" rows="8" data-test="fs-summary"></textarea>
          </label>
          <template v-if="calc.period.kind === 'monthly'">
            <div class="ss-subhead">{{ $t('改善建议（{n} 条，发送月报时记入改善台账）', { n: suggestions.length }) }}</div>
            <div class="ss-table-wrap"><table class="ss-table fs-sug">
              <thead><tr><th>{{ $t('建议事项') }}</th><th>{{ $t('责任部门') }}</th><th>{{ $t('责任人') }}</th><th>{{ $t('执行要求') }}</th><th>{{ $t('执行期限') }}</th><th>{{ $t('验收要求') }}</th><th></th></tr></thead>
              <tbody>
                <tr v-for="(s, i) in suggestions" :key="i">
                  <td><input v-model="s.item" type="text" class="fs-wide" /></td><td><input v-model="s.dept" type="text" /></td><td><input v-model="s.owner" type="text" /></td>
                  <td><input v-model="s.requirement" type="text" class="fs-wide" /></td><td><input v-model="s.deadline" type="date" /></td><td><input v-model="s.acceptance" type="text" class="fs-wide" /></td>
                  <td><button type="button" class="ss-link" @click="suggestions.splice(i, 1)">{{ $t('删除') }}</button></td>
                </tr>
              </tbody>
            </table></div>
            <div class="ss-actions"><button type="button" class="ss-btn sm" @click="suggestions.push({ item: '', dept: '', owner: '', requirement: '', deadline: '', acceptance: '' })"><i class="ri-add-line"></i>{{ $t('加一条') }}</button></div>
          </template>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="fs-report-build" @click="buildReport"><i :class="busy === 'fs-report-build' ? 'ri-loader-4-line spin' : 'ri-file-chart-line'"></i>{{ report ? $t('重新生成通报') : $t('生成通报并预览') }}</button>
          </div>
          <template v-if="report">
            <p v-for="f in report.files" :key="f.path" class="ss-file-out"><i class="ri-attachment-2"></i><code>{{ f.path }}</code><button type="button" class="ss-link" @click="openPath(f.path)">{{ $t('打开') }}</button><button type="button" class="ss-link" @click="openPath(f.path, true)">{{ $t('所在文件夹') }}</button></p>
            <div class="ss-subhead">{{ report.kind === 'monthly' ? $t('分析报告预览（附件 PDF 的内容）') : $t('通报预览（附件网页版的内容）') }}</div>
            <iframe class="fs-preview" sandbox="" :srcdoc="report.html" :title="$t('通报预览')" data-test="fs-preview"></iframe>
            <MailStatus />
            <label class="ss-field"><span>{{ $t('邮件主题') }}</span><input v-model="mailSubject" type="text" /></label>
            <label class="ss-field"><span>{{ $t('邮件正文') }}</span><textarea v-model="mailText" rows="9"></textarea></label>
            <label class="ss-field"><span>{{ $t('收件人（多个用逗号、分号或换行隔开，下次自动带出）') }}</span><textarea v-model="recipients" rows="2" placeholder="a@example.com; b@example.com" data-test="fs-recipients"></textarea></label>
            <p v-if="rcpt.bad.length" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('这些地址写得不对：{p0}', { p0: rcpt.bad.join('、') }) }}</p>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !rcpt.ok || rcpt.bad.length > 0" data-test="fs-report-send" @click="sendReport"><i :class="busy === 'fs-report-send' ? 'ri-loader-4-line spin' : 'ri-mail-send-line'"></i>{{ $t('发送给 {n} 位收件人', { n: rcpt.ok }) }}</button>
              <button v-if="report.kind === 'monthly' && !session?.ledgerWritten && suggestions.length" type="button" class="ss-btn" :disabled="!!busy" @click="toLedger"><i class="ri-book-2-line"></i>{{ $t('不发邮件，只把建议记入台账') }}</button>
              <span v-if="session?.sentAt" class="ss-chip ok">{{ $t('已发送 {p0}', { p0: fmtDateTime(session.sentAt) }) }}</span>
              <span v-if="session?.ledgerWritten" class="ss-chip ok">{{ $t('改善建议已记入台账') }}</span>
            </div>
            <p v-if="sendNote" class="ss-note ok"><i class="ri-checkbox-circle-line"></i>{{ sendNote }}</p>
          </template>
        </template>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 时效通报向导：导入 → 核对 → 计算 → 环比与异常 → 超时原因 → 生成并发送通报。 */
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  FS_REASON_CATEGORIES, FS_SYSTEMS,
  type FsCalcView, type FsCase, type FsCheckView, type FsCompareView, type FsFlowResult, type FsIngestRequest, type FsIngestSummary, type FsOwnerMail, type FsPeriod,
  type FsPeriodKind, type FsReasonCategory, type FsReportPreview, type FsSlot, type FsSuggestion, type FsSystem, type FsTablePreview,
} from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import FileDropField from '../service-settlement/FileDropField.vue';
import TableMapping from '../service-settlement/TableMapping.vue';
import {
  countRecipients, defaultPeriodForm, flowStateClass, flowStateLabel, fmtDateTime, fmtDays, fmtPoints, fmtRate, fmtSigned, fmtTime, formFromPeriod, fs, fsState,
  kindLabel, missingRoles, openPath, periodFromForm, reasonCategoryLabel, refreshState, roleDefs, scrollToStep, useSteps, type PeriodForm, type StepMeta,
} from './shared';

const REGULAR = '__regular__';
const KINDS: FsPeriodKind[] = ['weekly', 'monthly'];
const SYSTEMS = FS_SYSTEMS;
const SLOTS: Array<'flow' | 'node'> = ['flow', 'node'];
const CATEGORIES = FS_REASON_CATEGORIES;

const notif = useNotificationStore();
const router = useRouter();
const session = computed(() => fsState.value?.session ?? null);
const minRate = computed(() => fsState.value?.thresholds.minComplianceRate ?? 0.95);

const metas: StepMeta[] = [
  { key: 'fs-import', title: i18nT('导入报表与花名册'), hint: i18nT('放进 OA、费控、CSS 导出的时效报表和中心花名册，选周报还是月报') },
  { key: 'fs-check', title: i18nT('标准化与规则核对'), hint: i18nT('看流程名、节点、人员和规则表对不对得上，对不上的在这里定') },
  { key: 'fs-calc', title: i18nT('计算'), hint: i18nT('按时效规则算端到端用时、个人审核用时、合规率和排名，识别临期与超时') },
  { key: 'fs-compare', title: i18nT('环比与异常分析'), hint: i18nT('和上一周期比，找出异常流程类型，展开看卡在哪个节点') },
  { key: 'fs-reason', title: i18nT('超时原因收集'), hint: i18nT('按责任人发邮件收集原因，回填后归类并写根因') },
  { key: 'fs-report', title: i18nT('生成并发送通报'), hint: i18nT('周报出邮件和明细表，月报出分析报告 PDF；预览后由你点发送') },
];
const steps = useSteps(metas);
const { runtime, currentKey } = steps;
const busy = ref('');

/**
 * 跑一步：状态落在这一步上，失败写真实原因。
 * mark = false 是步骤里的局部动作（选文件、发邮件、归类）：进行中照样亮出来，做完回到原来的状态，不把整步标成完成。
 */
async function runStep(key: string, fn: () => Promise<string | void>, opts: { mark?: boolean; busyKey?: string } = {}): Promise<boolean> {
  const mark = opts.mark !== false;
  const before = runtime[key].state === 'failed' || runtime[key].state === 'running' ? 'todo' : runtime[key].state;
  busy.value = opts.busyKey || key;
  if (mark) steps.start(key); else steps.set(key, { state: 'running', error: undefined, startedAt: Date.now() });
  try {
    const summary = await fn();
    if (mark) steps.done(key, summary || undefined); else steps.set(key, { state: before });
    return true;
  } catch (e) {
    steps.fail(key, e);
    return false;
  } finally {
    busy.value = '';
  }
}
function jump(key: string): void { void scrollToStep(key); }

// ── 1 导入 ──
const form = reactive<PeriodForm>(defaultPeriodForm('weekly'));
function setKind(k: FsPeriodKind): void { Object.assign(form, defaultPeriodForm(k)); }
type Tables = Record<FsSystem, { flow: FsTablePreview | null; node: FsTablePreview | null }>;
const tables = reactive<Tables>(Object.fromEntries(SYSTEMS.map((s) => [s, { flow: null, node: null }])) as Tables);
const roster = ref<FsTablePreview | null>(null);
const ingest = ref<FsIngestSummary | null>(null);
const demoDir = ref('');

function systemHint(sys: FsSystem): string {
  if (sys === 'OA') return i18nT('审批类流程：状态看「审批状态」，结束 = 办结，待审 = 在途');
  if (sys === 'CSS') return i18nT('售后服务类流程：状态看「状态」，已审核 = 办结，审核中 = 在途；用时只累计内部节点');
  return i18nT('费用类流程：状态看「当前处理人」，结束 = 办结，终止不统计，其余在途');
}
async function pick(sys: FsSystem, slot: 'flow' | 'node', path: string, sheet?: string): Promise<void> {
  if (!path) return;
  await runStep('fs-import', async () => {
    tables[sys][slot] = await fs<FsTablePreview>('ingest.preview', { path, slot, sheet, hasFlowTable: slot === 'node' && !!tables[sys].flow });
  }, { mark: false });
}
async function pickRoster(path: string, sheet?: string): Promise<void> {
  if (!path) return;
  await runStep('fs-import', async () => { roster.value = await fs<FsTablePreview>('ingest.preview', { path, slot: 'roster', sheet }); }, { mark: false });
}
const picked0 = computed(() => SYSTEMS.flatMap((s) => SLOTS.map((slot) => ({ sys: s, slot, t: tables[s][slot] }))).filter((x) => x.t));
const importBlock = computed(() => {
  if (!picked0.value.length) return i18nT('至少放一个系统的报表');
  for (const x of picked0.value) {
    const miss = missingRoles(x.slot as FsSlot, x.t!.mapping, !!tables[x.sys].flow);
    if (miss.length) return i18nT('{p0}：还有必填列没有对应上', { p0: x.t!.fileName });
  }
  if (roster.value && missingRoles('roster', roster.value.mapping, false).length) return i18nT('花名册还没有对应上姓名列');
  return '';
});
const canImport = computed(() => !importBlock.value);

function ingestSummary(s: FsIngestSummary): string {
  return s.systems.map((x) => i18nT('{p0} {p1} 个流程', { p0: x.system, p1: x.flows })).join(i18nT('，')) + i18nT('；花名册 {p0} 人', { p0: s.roster });
}
async function afterIngest(r: { summary: FsIngestSummary; period: FsPeriod }): Promise<void> {
  ingest.value = r.summary;
  Object.assign(form, formFromPeriod(r.period));
  resetFrom('fs-import');
  await refreshState();
}
async function commit(): Promise<void> {
  demoDir.value = '';
  const ok = await runStep('fs-import', async () => {
    const systems: FsIngestRequest['systems'] = {};
    for (const s of SYSTEMS) {
      const { flow, node } = tables[s];
      if (!flow && !node) continue;
      systems[s] = {
        ...(flow ? { flow: { path: flow.path, sheet: flow.sheetName, mapping: flow.mapping } } : {}),
        ...(node ? { node: { path: node.path, sheet: node.sheetName, mapping: node.mapping } } : {}),
      };
    }
    const r = await fs<{ summary: FsIngestSummary; period: FsPeriod }>('ingest.commit', {
      period: periodFromForm(form), systems,
      ...(roster.value ? { roster: { path: roster.value.path, sheet: roster.value.sheetName, mapping: roster.value.mapping } } : {}),
    });
    await afterIngest(r);
    return ingestSummary(r.summary);
  });
  if (ok) await loadCheck();
}
async function demo(): Promise<void> {
  const ok = await runStep('fs-import', async () => {
    const r = await fs<{ summary: FsIngestSummary; period: FsPeriod; dir: string }>('demo.generate', { period: periodFromForm(form) });
    for (const s of SYSTEMS) { tables[s].flow = null; tables[s].node = null; }
    roster.value = null;
    await afterIngest(r);
    demoDir.value = r.dir;
    return i18nT('已载入示例数据：{p0}', { p0: ingestSummary(r.summary) });
  });
  if (ok) await loadCheck();
}

/** 前面的步骤重跑后，后面的结果全部作废 */
function resetFrom(key: string): void {
  steps.resetAfter(key);
  const idx = metas.findIndex((m) => m.key === key);
  if (idx < 1) check.value = null;
  if (idx < 2) { calc.value = null; calcFile.value = ''; trackNote.value = ''; }
  if (idx < 3) compare.value = null;
  if (idx < 4) { reasonNotes.value = []; reasonFile.value = ''; }
  if (idx < 5) { report.value = null; sendNote.value = ''; draftNote.value = ''; }
}

// ── 2 核对 ──
const check = ref<FsCheckView | null>(null);
const pendingUnmatched = computed(() => (check.value?.unmatched || []).filter((u) => !u.regular));
const mappedAliases = computed(() => (check.value?.aliases || []).filter((a) => a.target !== REGULAR));
const typesFor = (system: string) => (check.value?.ruleTypes || []).filter((r) => r.system.toUpperCase().split('/').includes(system.toUpperCase()));
async function loadCheck(): Promise<boolean> {
  return runStep('fs-check', async () => { check.value = await fs<FsCheckView>('check.run'); }, { mark: false });
}
async function setAlias(system: FsSystem, flowName: string, target: string): Promise<void> {
  if (!target && !check.value?.aliases.some((a) => a.system === system && a.flowName === flowName)) return;
  await runStep('fs-check', async () => {
    await fs('alias.set', { system, flowName, target });
    resetFrom('fs-check');
    check.value = await fs<FsCheckView>('check.run');
  }, { mark: false });
}
async function decide(n: { system: FsSystem; flowName: string; node: string }, internal: boolean | null): Promise<void> {
  await runStep('fs-check', async () => {
    await fs('node.decide', { system: n.system, flowName: n.flowName, node: n.node, internal });
    resetFrom('fs-check');
    check.value = await fs<FsCheckView>('check.run');
  }, { mark: false });
}
function confirmCheck(): void {
  if (!check.value) return;
  const c = check.value;
  steps.done('fs-check', i18nT('流程名待定 {a} 个，未登记节点 {b} 个，花名册外审核人 {c} 人', { a: pendingUnmatched.value.length, b: c.unknownNodes.length, c: c.outOfRoster.length }));
  void scrollToStep('fs-calc');
}

// ── 3 计算 ──
const calc = ref<FsCalcView | null>(null);
const calcFile = ref('');
const trackNote = ref('');
function calcSummary(c: FsCalcView): string {
  return i18nT('办结 {a} 单，合规率 {b}，在途逾期 {c} 单', { a: c.overall.doneCount, b: fmtRate(c.overall.complianceRate), c: c.overall.runningOverdue });
}
async function runCalc(): Promise<void> {
  if (runtime['fs-check'].state !== 'done') confirmCheck();
  const ok = await runStep('fs-calc', async () => {
    resetFrom('fs-calc');
    const r = await fs<FsCalcView & { tracking: { added: number; closed: number } }>('calc.run');
    calc.value = r;
    trackNote.value = r.tracking.added || r.tracking.closed ? i18nT('在途跟进名单：新增 {a} 条，闭环 {b} 条（见「在途跟进」页）', { a: r.tracking.added, b: r.tracking.closed }) : '';
    await refreshState();
    return calcSummary(r);
  });
  if (ok) await loadCases();
}
async function exportCalc(): Promise<void> {
  await runStep('fs-calc', async () => { calcFile.value = await fs<string>('calc.export'); }, { mark: false });
}

// ── 4 环比 ──
const compare = ref<FsCompareView | null>(null);
const prevId = ref('');
async function runCompare(): Promise<void> {
  await runStep('fs-compare', async () => {
    const r = await fs<FsCompareView>('compare.run', { prevId: prevId.value || undefined });
    compare.value = r;
    return r.previous
      ? i18nT('对比 {a}：异常流程类型 {b} 个', { a: r.previous.label, b: r.abnormal.length })
      : i18nT('没有上一周期，异常流程类型 {b} 个', { b: r.abnormal.length });
  });
}
function deltaClass(n: number | null, higherIsBetter: boolean): string {
  if (n == null || n === 0) return '';
  return (n > 0) === higherIsBetter ? 'fs-ok' : 'fs-bad';
}

// ── 5 原因 ──
const cases = ref<FsCase[]>([]);
const mails = ref<FsOwnerMail[]>([]);
const picked = ref<string[]>([]);
const previewOwner = ref('');
const reasonNotes = ref<Array<{ text: string; cls: string }>>([]);
const reasonFile = ref('');
const rootCauses = ref<Partial<Record<FsReasonCategory, string>>>({});
const filledCount = computed(() => cases.value.filter((c) => c.reason.trim()).length);
const allPicked = computed(() => mails.value.some((m) => m.email) && mails.value.filter((m) => m.email).every((m) => picked.value.includes(m.owner)));
const categoryStats = computed(() => CATEGORIES.map((id) => ({ id, count: cases.value.filter((c) => c.reason.trim() && c.categoryId === id).length })).filter((x) => x.count > 0));
function toggleAll(on: boolean): void { picked.value = on ? mails.value.filter((m) => m.email).map((m) => m.owner) : []; }
async function loadCases(): Promise<void> {
  try {
    const r = await fs<{ cases: FsCase[]; mails: FsOwnerMail[] }>('cases.get');
    cases.value = r.cases; mails.value = r.mails;
    picked.value = picked.value.filter((o) => r.mails.some((m) => m.owner === o && m.email));
    rootCauses.value = { ...(fsState.value?.session.rootCauses || {}) };
  } catch (e) { steps.fail('fs-reason', e); }
}
async function reasonAction(busyKey: string, fn: () => Promise<void>): Promise<void> {
  await runStep('fs-reason', fn, { mark: false, busyKey });
}
async function setOwnerEmail(owner: string, email: string): Promise<void> {
  await reasonAction('fs-reason', async () => { await fs('cases.setEmail', { owner, email }); await loadCases(); });
}
async function sendReasonMails(): Promise<void> {
  const n = picked.value.length;
  if (!window.confirm(i18nT('给 {n} 位责任人各发一封原因收集邮件？', { n }))) return;
  await reasonAction('fs-reason-send', async () => {
    const r = await fs<{ sent: string[]; skipped: string[]; failed: Array<{ owner: string; message: string }> }>('reasons.send', { owners: picked.value });
    reasonNotes.value = [
      ...(r.sent.length ? [{ text: i18nT('已发送给 {n} 人：{p0}', { n: r.sent.length, p0: r.sent.join('、') }), cls: 'ok' }] : []),
      ...(r.skipped.length ? [{ text: i18nT('没有邮箱，没有发：{p0}', { p0: r.skipped.join('、') }), cls: 'warn' }] : []),
      ...r.failed.map((f) => ({ text: i18nT('{p0} 发送失败：{p1}', { p0: f.owner, p1: f.message }), cls: 'danger' })),
    ];
    picked.value = [];
    await loadCases();
  });
}
async function exportReasons(): Promise<void> {
  await reasonAction('fs-reason', async () => { reasonFile.value = await fs<string>('reasons.export'); });
}
async function importReasons(): Promise<void> {
  const paths = await fs<string[]>('files.pick', { multi: false });
  if (!paths.length) return;
  await reasonAction('fs-reason', async () => {
    const r = await fs<{ filled: number; unmatched: number }>('reasons.import', { path: paths[0] });
    reasonNotes.value = [{ text: i18nT('回填了 {a} 个流程的原因', { a: r.filled }) + (r.unmatched ? i18nT('；{b} 行的单号在本期名单里找不到', { b: r.unmatched }) : ''), cls: r.unmatched ? 'warn' : 'ok' }];
    await loadCases();
  });
}
async function setReason(key: string, reason: string): Promise<void> {
  await reasonAction('fs-reason', async () => { cases.value = await fs<FsCase[]>('reasons.set', { key, reason }); });
}
async function setCategory(key: string, categoryId: string): Promise<void> {
  await reasonAction('fs-reason', async () => { cases.value = await fs<FsCase[]>('reasons.set', { key, categoryId }); });
}
async function classify(useModel: boolean): Promise<void> {
  await reasonAction('fs-classify', async () => {
    const r = await fs<{ by: string; modelError: string; rejected: number; cases: FsCase[]; rootCauses: Partial<Record<FsReasonCategory, string>> }>('reasons.classify', { useModel });
    cases.value = r.cases; rootCauses.value = { ...r.rootCauses };
    reasonNotes.value = [
      r.modelError ? { text: i18nT('模型没有用上（{p0}），已按关键字归类', { p0: r.modelError }), cls: 'warn' }
        : { text: r.by === 'model' ? i18nT('模型已归类') + (r.rejected ? i18nT('；{n} 处没通过核对，保留关键字归类或通用说明', { n: r.rejected }) : '') : i18nT('已按关键字归类，归得不对的可以在表里改'), cls: 'ok' },
    ];
  });
}
async function setRootCause(id: FsReasonCategory, text: string): Promise<void> {
  await reasonAction('fs-reason', async () => { rootCauses.value = { ...(await fs<Partial<Record<FsReasonCategory, string>>>('rootCause.set', { id, text })) }; });
}
function confirmReasons(): void {
  steps.done('fs-reason', cases.value.length ? i18nT('需要说明 {a} 个流程，已收到 {b} 个原因', { a: cases.value.length, b: filledCount.value }) : i18nT('本期不需要收集原因'));
  void scrollToStep('fs-report');
}

// ── 6 通报 ──
const summary = ref('');
const suggestions = ref<FsSuggestion[]>([]);
const draftNote = ref('');
const report = ref<FsReportPreview | null>(null);
const mailSubject = ref('');
const mailText = ref('');
const recipients = ref('');
const sendNote = ref('');
const rcpt = computed(() => countRecipients(recipients.value));
async function reportAction(busyKey: string, fn: () => Promise<void>): Promise<boolean> {
  return runStep('fs-report', fn, { mark: false, busyKey });
}
async function draft(useModel: boolean): Promise<void> {
  await reportAction('fs-draft', async () => {
    const r = await fs<{ summary: string; suggestions: FsSuggestion[]; by: string; modelError: string; dropped: number }>('summary.draft', { useModel });
    summary.value = r.summary; suggestions.value = r.suggestions;
    draftNote.value = r.modelError ? i18nT('模型没有用上（{p0}），已按数据起草', { p0: r.modelError })
      : r.by === 'model' ? i18nT('模型起草') + (r.dropped ? i18nT('，去掉了 {n} 句带有材料里没有的数字的话', { n: r.dropped }) : '')
        : useModel ? i18nT('模型写的内容没有通过数字核对，已按数据起草') : i18nT('已按数据起草，可以直接改');
  });
}
async function buildReport(): Promise<void> {
  sendNote.value = '';
  await reportAction('fs-report-build', async () => {
    if (!summary.value.trim() && calc.value?.period.kind === 'monthly') {
      const d = await fs<{ summary: string; suggestions: FsSuggestion[] }>('summary.draft', { useModel: false });
      summary.value = d.summary; suggestions.value = d.suggestions;
    }
    await fs('summary.save', { summary: summary.value, suggestions: suggestions.value });
    const r = await fs<FsReportPreview>('report.build');
    report.value = r;
    mailSubject.value = r.subject; mailText.value = r.text;
    const st = await refreshState();
    if (!recipients.value.trim()) recipients.value = r.kind === 'monthly' ? st.settings.monthlyRecipients : st.settings.weeklyRecipients;
  });
}
async function sendReport(): Promise<void> {
  if (!report.value) return;
  if (!window.confirm(i18nT('把通报发给 {n} 位收件人？附件 {m} 个。', { n: rcpt.value.ok, m: report.value.files.length }))) return;
  busy.value = 'fs-report-send';
  steps.start('fs-report');
  try {
    const r = await fs<{ via: string; notice: string; recipients: number; ledgerAdded: number }>('report.send', { to: recipients.value, subject: mailSubject.value, text: mailText.value });
    sendNote.value = i18nT('已发送给 {n} 位收件人', { n: r.recipients })
      + (r.via === 'official' ? i18nT('（经官方代发，发件人不是你自己的邮箱）') : '')
      + (r.ledgerAdded ? i18nT('；{n} 条改善建议已记入改善台账', { n: r.ledgerAdded }) : '')
      + (r.notice ? ` ${r.notice}` : '');
    steps.done('fs-report', i18nT('通报已发送给 {n} 位收件人', { n: r.recipients }));
    await refreshState();
  } catch (e) {
    steps.fail('fs-report', e);
  } finally {
    busy.value = '';
  }
}
async function toLedger(): Promise<void> {
  await reportAction('fs-report', async () => {
    await fs('summary.save', { summary: summary.value, suggestions: suggestions.value });
    const n = await fs<number>('report.toLedger');
    notif.success(i18nT('{n} 条改善建议已记入改善台账', { n }));
    await refreshState();
  });
}

// ── 小组件 ──
const MailStatus = defineComponent({
  name: 'FsMailStatus',
  setup() {
    return () => {
      const m = fsState.value?.mail;
      if (!m) return null;
      const go = () => { void router.push({ path: '/settings', query: { section: 'notify', focus: 'smtp' } }); };
      const link = h('button', { type: 'button', class: 'ss-link', onClick: go }, i18nT('去设置邮箱'));
      if (m.smtpConfigured) return h('p', { class: 'ss-note ok' }, [h('i', { class: 'ri-mail-check-line' }), i18nT('发件邮箱：{p0}', { p0: m.address })]);
      if (m.officialRelay) return h('p', { class: 'ss-note warn' }, [h('i', { class: 'ri-mail-line' }), i18nT('还没有配置自己的发件邮箱，会经官方代发（发件人不是你的邮箱，对方回信到不了你这里）。'), link]);
      return h('p', { class: 'ss-note danger' }, [h('i', { class: 'ri-mail-close-line' }), i18nT('还没有配置发件邮箱，邮件发不出去。'), link]);
    };
  },
});

const FlowTable = defineComponent({
  name: 'FsFlowTable',
  props: { flows: { type: Array as () => FsFlowResult[], required: true }, running: Boolean, empty: { type: String, default: '' } },
  setup(props) {
    const all = ref(false);
    return () => {
      if (!props.flows.length) return h('p', { class: 'ss-note ok' }, [h('i', { class: 'ri-checkbox-circle-line' }), props.empty]);
      const list = all.value ? props.flows : props.flows.slice(0, 30);
      const heads = [i18nT('系统'), i18nT('单号'), i18nT('流程细类'), i18nT('标题'), i18nT('发起人'), i18nT('状态'), props.running ? i18nT('在途（天）') : i18nT('用时（天）'), i18nT('时效要求'), i18nT('超出（天）'),
        ...(props.running ? [i18nT('当前节点'), i18nT('当前处理人'), i18nT('节点停留（天）')] : [i18nT('开始'), i18nT('结束')])];
      const numIdx = new Set(props.running ? [6, 7, 8, 11] : [6, 7, 8]);
      return h('div', { class: 'fs-flowtable' }, [
        h('div', { class: 'ss-table-wrap fs-scroll' }, h('table', { class: 'ss-table' }, [
          h('thead', h('tr', heads.map((t, i) => h('th', { class: numIdx.has(i) ? 'num' : '' }, t)))),
          h('tbody', list.map((f) => h('tr', { key: `${f.system}|${f.flowNo}` }, [
            h('td', f.system), h('td', f.flowNo), h('td', f.flowType), h('td', { class: 'fs-wrap' }, f.title), h('td', f.initiator),
            h('td', h('span', { class: ['ss-chip', flowStateClass(f)] }, flowStateLabel(f))),
            h('td', { class: 'num' }, fmtDays(f.days) + (f.approx ? ' *' : '')), h('td', { class: 'num' }, f.limitDays ?? '-'), h('td', { class: 'num' }, f.overdueDays ? fmtDays(f.overdueDays) : '-'),
            ...(props.running
              ? [h('td', f.currentNode), h('td', f.currentHandler), h('td', { class: 'num' }, fmtDays(f.currentNodeDays))]
              : [h('td', fmtTime(f.startAt)), h('td', fmtTime(f.endAt))]),
          ]))),
        ])),
        props.flows.length > 30 ? h('button', { type: 'button', class: 'ss-link', onClick: () => { all.value = !all.value; } }, all.value ? i18nT('只看前 30 条') : i18nT('显示全部 {n} 条', { n: props.flows.length })) : null,
      ]);
    };
  },
});

// ── 进来时接上上次的进度；别的页改了规则，这里的结果作废 ──
onMounted(async () => {
  const s = fsState.value?.session;
  if (!s?.period || !s.ingest || !fsState.value?.hasData) return;
  Object.assign(form, formFromPeriod(s.period));
  ingest.value = s.ingest;
  steps.set('fs-import', { state: 'done', summary: ingestSummary(s.ingest) });
  if (!(await loadCheck())) return;
  if (!s.snapshotId) { currentKey.value = 'fs-check'; return; }
  try {
    calc.value = await fs<FsCalcView>('calc.view');
    steps.set('fs-check', { state: 'done' });
    steps.set('fs-calc', { state: 'done', summary: calcSummary(calc.value) });
    currentKey.value = 'fs-compare';
    summary.value = s.summary; suggestions.value = s.suggestions.map((x) => ({ ...x }));
    await loadCases();
  } catch (e) { steps.fail('fs-calc', e); }
});
watch(() => fsState.value?.session.snapshotId, (id, old) => {
  if (old && !id && calc.value && !busy.value) {
    resetFrom('fs-check');
    steps.set('fs-check', { state: 'todo', summary: undefined });
    currentKey.value = 'fs-check';
    void loadCheck();
  }
});

defineExpose({ pick, commit, demo, runCalc, runCompare, tables, form });
</script>

<style scoped>
.fs-seg { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-4); overflow: hidden; }
.fs-seg button { height: 34px; padding: 0 16px; border: none; background: var(--color-bg-card); color: var(--color-text-secondary); font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; }
.fs-seg button.on { background: var(--color-brand); color: var(--color-on-accent); }
.fs-sys { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.fs-sys h4 { margin: 0; font-size: 13.5px; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.fs-sys h4 small { font-weight: 400; font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.fs-slots { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); align-items: start; }
.fs-slot { display: grid; gap: 8px; min-width: 0; }
.fs-scroll { max-height: 380px; overflow: auto; }
.fs-two { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); }
.fs-two > div { display: grid; gap: 8px; min-width: 0; align-content: start; }
.fs-ops { display: flex; gap: 6px; }
.fs-chips { margin: 0; display: flex; gap: 6px; flex-wrap: wrap; }
.fs-chip { margin: 2px 4px 2px 0; }
.fs-chip button { border: none; background: none; color: inherit; cursor: pointer; padding: 0; display: inline-flex; }
.fs-bad { color: var(--color-danger); }
.fs-warn { color: var(--color-warning); }
.fs-ok { color: var(--color-success); }
.fs-small { font-size: var(--font-size-md) !important; }
.fs-wrap { white-space: normal !important; max-width: 320px; }
:deep(.fs-wrap) { white-space: normal !important; max-width: 280px; }
:deep(.fs-flowtable) { display: grid; gap: 6px; justify-items: start; }
:deep(.fs-flowtable .ss-table-wrap) { width: 100%; }
.fs-abn { display: grid; gap: 8px; padding: 12px; border: 1px solid color-mix(in srgb, var(--color-danger) 35%, var(--color-border)); border-radius: var(--radius-5); }
.fs-abn header { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: var(--font-size-md); }
.fs-mail { display: grid; gap: 6px; padding: 8px 4px; white-space: normal; }
.fs-mail pre { margin: 0; white-space: pre-wrap; font: inherit; font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.6; }
.fs-mail small { color: var(--color-text-secondary); }
.fs-reason { min-width: 260px !important; width: 100%; }
.fs-roots { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); }
.fs-roots textarea { min-height: 56px; }
.fs-sug input { min-width: 110px; }
.fs-sug .fs-wide { min-width: 220px; }
.fs-preview { width: 100%; height: 520px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--fsbt2-surface); }
.spin { animation: fs-spin 1s linear infinite; }
@keyframes fs-spin { to { transform: rotate(360deg); } }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.ss-module { /* ui-theme-exempt: 经典主题原值 */
  --fsbt2-surface: #fff;
}
:root[data-ui-theme] .ss-module {
  --fsbt2-surface: var(--color-bg-card);
}
</style>
