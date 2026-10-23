<template>
  <div v-if="r" class="fau-tr" data-test="fau-treasury-panel">
    <p v-if="def.id === 'cash' && run.modeId === 'payment' || def.id === 'treasury' && run.modeId === 'authorization'" class="ss-note warn"><i class="ri-shield-check-line"></i>{{ $t('付款计划与授权意见只是草稿和建议：本工作台不付款、不审批付款，付款由有权人在网银或资金系统里完成。') }}</p>
    <p v-if="def.id === 'fx'" class="ss-note warn"><i class="ri-shield-check-line"></i>{{ $t('对冲方案与询价单只是草稿：本工作台不下单、不成交、不确认交易，是否交易由有权人在银行渠道完成。') }}</p>

    <!-- 资金日报：三方核对 -->
    <section v-if="position" class="fau-sec" data-test="fau-cash-position">
      <header class="fau-row">
        <strong class="grow">{{ $t('资金日报') }} · <FauNum :value="position.asOf" /></strong>
        <span class="fau-badge">{{ $t('本位币可用余额') }} <FauNum :cents="position.totals.available" /></span>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('银行账号') }}</th><th>{{ $t('开户银行') }}</th><th>{{ $t('币种') }}</th><th class="num">{{ $t('银行余额') }}</th><th class="num">{{ $t('账面余额') }}</th><th class="num">{{ $t('资金系统余额') }}</th><th class="num">{{ $t('最大差额') }}</th><th>{{ $t('三方核对') }}</th><th class="num">{{ $t('可用余额') }}</th></tr></thead>
          <tbody>
            <tr v-for="a in position.accounts" :key="a.row" :class="{ bad: a.status === 'breach' || a.belowSafety }" :data-test="`fau-acct-${a.account}`">
              <td><FauNum :value="a.account" /></td><td>{{ a.bank }}</td><td><FauNum :value="a.currency" /></td>
              <td class="num"><FauNum :cents="a.bankBalance" /></td><td class="num"><FauNum :cents="a.bookBalance" /></td><td class="num"><FauNum :cents="a.systemBalance" /></td>
              <td class="num"><FauNum :cents="a.maxDiff" /></td>
              <td><span class="fau-badge" :class="RAG_CLASS[a.status]">{{ a.sources < 2 ? $t('来源不足，未核对') : $t(RECON3_LABEL[a.status]) }}</span><span v-if="a.belowSafety" class="fau-badge bad">{{ $t('低于安全线') }}</span></td>
              <td class="num"><FauNum :cents="a.available" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 13 周预测 -->
    <section v-if="forecast" class="fau-sec" data-test="fau-cash-forecast">
      <header class="fau-row">
        <strong class="grow">{{ $t('13 周现金预测') }}</strong>
        <span class="fau-badge" :class="forecast.gapTier === 'none' ? 'ok' : 'warn'">{{ $t(GAP_TIER_LABEL[forecast.gapTier]) }}</span>
        <span v-if="forecast.facilityAvailable != null" class="fau-badge muted">{{ $t('可用授信') }} <FauNum :cents="forecast.facilityAvailable" /></span>
      </header>
      <CashForecastChart :forecast="forecast" />
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('情景') }}</th><th class="num">{{ $t('合计流入') }}</th><th class="num">{{ $t('合计流出') }}</th><th class="num">{{ $t('期末余额') }}</th><th class="num">{{ $t('最低余额') }}</th><th>{{ $t('首个缺口周') }}</th><th class="num">{{ $t('最大缺口') }}</th></tr></thead>
          <tbody>
            <tr v-for="s in forecast.scenarios" :key="s.id" :class="{ bad: s.maxGap > 0 }" :data-test="`fau-scenario-${s.id}`">
              <td>{{ $t(SCENARIO_LABEL[s.id]) }}</td>
              <td class="num"><FauNum :cents="s.totalIn" /></td><td class="num"><FauNum :cents="s.totalOut" /></td>
              <td class="num" data-test="fau-scenario-end"><FauNum :cents="s.endBalance" /></td><td class="num"><FauNum :cents="s.minBalance" /></td>
              <td><FauNum :value="s.firstGapWeek ? `W${s.firstGapWeek}` : '-'" /></td><td class="num"><FauNum :cents="s.maxGap" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul v-if="forecast.concentration.some((c) => c.status !== 'ok')" class="fau-tr-flags">
        <li v-for="c in forecast.concentration.filter((x) => x.status !== 'ok')" :key="c.counterparty"><i class="ri-alarm-warning-line"></i>{{ c.counterparty }} · <FauNum :ratio="c.share" /> · {{ $t(RAG_LABEL[c.status]) }}</li>
      </ul>
    </section>

    <!-- 付款计划草稿 -->
    <section v-if="payments" class="fau-sec" data-test="fau-payment-plan">
      <div class="fau-tr-kpis">
        <span class="fau-badge muted">{{ $t('可用资金') }} <FauNum :cents="payments.available" /></span>
        <span class="fau-badge ok">{{ $t('排入计划') }} <FauNum :cents="payments.scheduled" /></span>
        <span class="fau-badge warn">{{ $t('延后') }} <FauNum :cents="payments.deferred" /></span>
        <span class="fau-badge bad">{{ $t('暂停核实') }} <FauNum :cents="payments.held" /></span>
        <span v-if="payments.gap" class="fau-badge bad">{{ $t('P0 资金缺口') }} <FauNum :cents="payments.gap" /></span>
      </div>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('申请单号') }}</th><th>{{ $t('收款方') }}</th><th class="num">{{ $t('付款金额') }}</th><th>{{ $t('到期日') }}</th><th>{{ $t('优先级') }}</th><th>{{ $t('计划') }}</th><th>{{ $t('提示') }}</th></tr></thead>
          <tbody>
            <tr v-for="l in payments.lines" :key="l.id" :class="{ bad: l.plan === 'hold', warn: l.plan === 'defer' }" :data-test="`fau-pay-${l.id}`">
              <td><FauNum :value="l.id" /></td><td>{{ l.payee }}</td><td class="num"><FauNum :cents="l.amount" /></td><td><FauNum :value="l.dueDate" /></td>
              <td :title="$t(PAY_PRIORITY_HINT[l.priority])"><FauNum :value="l.priority" /> <small class="ss-muted">{{ $t(PRIORITY_SOURCE_LABEL[l.prioritySource]) }}</small></td>
              <td>{{ $t(PAY_PLAN_LABEL[l.plan]) }}</td><td class="wrap">{{ l.flags.map((f) => msg(f)).join(sep) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 授权复核 -->
    <section v-if="tr?.authorizations" class="fau-sec" data-test="fau-auth">
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('申请单号') }}</th><th>{{ $t('收款方') }}</th><th class="num">{{ $t('付款金额') }}</th><th>{{ $t('复核建议') }}</th><th>{{ $t('问题') }}</th></tr></thead>
          <tbody>
            <tr v-for="a in tr.authorizations" :key="a.id" :class="{ bad: a.advice === 'hold' || a.advice === 'reject_recommend' }" :data-test="`fau-auth-${a.id}`">
              <td><FauNum :value="a.id" /></td><td>{{ a.payee }}</td><td class="num"><FauNum :cents="a.amount" /><span v-if="a.large" class="fau-badge warn">{{ $t('大额') }}</span></td>
              <td><span class="fau-badge" :class="ADVICE_CLASS[a.advice]">{{ $t(AUTH_ADVICE_LABEL[a.advice]) }}</span></td>
              <td class="wrap">{{ a.checks.filter((c) => !c.ok).map((c) => msg(c.message)).join(sep) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 现金池 -->
    <section v-if="tr?.pool" class="fau-sec" data-test="fau-pool">
      <div class="fau-tr-kpis">
        <span class="fau-badge muted">{{ $t('主账户') }} <FauNum :value="tr.pool.header" /></span>
        <span class="fau-badge">{{ $t('上划合计') }} <FauNum :cents="tr.pool.sweepUp" /></span>
        <span class="fau-badge">{{ $t('下拨合计') }} <FauNum :cents="tr.pool.sweepDown" /></span>
        <span class="fau-badge ok">{{ $t('归集后可调度资金') }} <FauNum :cents="tr.pool.pooled" /></span>
        <span class="fau-badge ok" data-test="fau-pool-gain">{{ $t('年化利息增益估算') }} <FauNum :cents="tr.pool.interestGain" /></span>
      </div>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('银行账号') }}</th><th>{{ $t('主体') }}</th><th class="num">{{ $t('余额') }}</th><th class="num">{{ $t('留存目标') }}</th><th class="num">{{ $t('上划 / 下拨') }}</th></tr></thead>
          <tbody>
            <tr v-for="a in tr.pool.accounts" :key="a.account"><td><FauNum :value="a.account" /></td><td>{{ a.entity }}</td><td class="num"><FauNum :cents="a.balance" /></td><td class="num"><FauNum :cents="a.target" /></td><td class="num"><FauNum :cents="a.sweep" /></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 银行关系 -->
    <section v-if="tr?.banks" class="fau-sec" data-test="fau-banks">
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('银行') }}</th><th class="num">{{ $t('授信使用率') }}</th><th class="num">{{ $t('利率') }}</th><th class="num">{{ $t('综合评分') }}</th><th>{{ $t('分级') }}</th><th>{{ $t('提示') }}</th></tr></thead>
          <tbody>
            <tr v-for="b in tr.banks" :key="b.bank" :data-test="`fau-bank-score-${b.bank}`">
              <td>{{ b.bank }}</td><td class="num"><FauNum :ratio="b.utilization" /></td><td class="num"><FauNum :ratio="b.rate" /></td>
              <td class="num"><FauNum :value="b.total.toFixed(2)" /></td><td>{{ $t(BANK_TIER_LABEL[b.tier]) }}</td><td class="wrap">{{ b.flags.map((f) => msg(f)).join(sep) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- LCR / NSFR -->
    <section v-if="tr?.liquidity" class="fau-sec" data-test="fau-lcr">
      <div class="fau-tr-kpis">
        <span class="fau-badge" :class="RAG_CLASS[tr.liquidity.lcrStatus]" data-test="fau-lcr-value">LCR <FauNum :ratio="tr.liquidity.lcr" /></span>
        <span class="fau-badge" :class="RAG_CLASS[tr.liquidity.nsfrStatus]">NSFR <FauNum :ratio="tr.liquidity.nsfr" /></span>
        <span class="fau-badge muted">{{ $t('优质流动性资产合计') }} <FauNum :cents="tr.liquidity.hqla.total" /></span>
        <span class="fau-badge muted">{{ $t('净现金流出') }} <FauNum :cents="tr.liquidity.netOutflows" /></span>
      </div>
    </section>

    <!-- 外汇 -->
    <template v-if="fx">
      <section class="fau-sec" data-test="fau-fx">
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('币种') }}</th><th class="num">{{ $t('交易敞口（外币）') }}</th><th class="num">{{ $t('会计敞口（外币）') }}</th><th class="num">{{ $t('交易敞口（本位币）') }}</th><th class="num">{{ $t('已对冲') }}</th><th class="num">{{ $t('目标对冲额') }}</th><th class="num">{{ $t('还需对冲') }}</th><th class="num">{{ $t('已对冲比例') }}</th></tr></thead>
            <tbody>
              <tr v-for="e in fx.exposures" :key="e.currency" :class="{ bad: e.overLimit }" :data-test="`fau-fx-${e.currency}`">
                <td><FauNum :value="e.currency" /></td><td class="num"><FauNum :cents="e.transaction" /></td><td class="num"><FauNum :cents="e.translation" /></td>
                <td class="num"><FauNum :cents="e.transactionLocal" /></td><td class="num"><FauNum :cents="e.hedged" /></td><td class="num"><FauNum :cents="e.hedgeTarget" /></td>
                <td class="num"><FauNum :cents="e.hedgeNeed" /></td><td class="num"><FauNum :ratio="e.hedgeRatio" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section v-if="fx.rfq.length" class="fau-sec" data-test="fau-rfq">
        <strong>{{ $t('询价单草稿') }}</strong>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('币种') }}</th><th>{{ $t('方向') }}</th><th class="num">{{ $t('名义本金（外币）') }}</th><th>{{ $t('交割月份') }}</th><th>{{ $t('覆盖的敞口层级') }}</th></tr></thead>
            <tbody>
              <tr v-for="q in fx.rfq" :key="q.id" :data-test="`fau-rfq-${q.id}`">
                <td><FauNum :value="q.currency" /></td><td>{{ $t(FX_SIDE_LABEL[q.side]) }}</td><td class="num"><FauNum :cents="q.notional" /></td><td><FauNum :value="q.valueMonth" /></td><td>{{ $t(FX_CERTAINTY_LABEL[q.layer]) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 融资 -->
    <section v-if="fin?.cost" class="fau-sec" data-test="fau-fin-cost">
      <div class="fau-tr-kpis">
        <span class="fau-badge muted">{{ $t('有息负债合计') }} <FauNum :cents="fin.cost.debt" /></span>
        <span class="fau-badge">{{ $t('税后债务成本') }} <FauNum :ratio="fin.cost.kdAfterTax" /></span>
        <span class="fau-badge">{{ $t('股权成本') }} <FauNum :ratio="fin.cost.ke" /></span>
        <span class="fau-badge ok" data-test="fau-wacc">WACC <FauNum :ratio="fin.cost.wacc" /></span>
      </div>
      <form class="fau-tr-params" @submit.prevent="saveParams">
        <label>{{ $t('无风险利率') }} (%)<input v-model="params.rf" type="number" step="0.01" :disabled="locked" data-test="fau-param-rf" /></label>
        <label>Beta<input v-model="params.beta" type="number" step="0.01" :disabled="locked" data-test="fau-param-beta" /></label>
        <label>{{ $t('市场风险溢价') }} (%)<input v-model="params.erp" type="number" step="0.01" :disabled="locked" /></label>
        <label>{{ $t('所得税率') }} (%)<input v-model="params.taxRate" type="number" step="0.01" :disabled="locked" /></label>
        <label>{{ $t('权益价值') }}<input v-model="params.equity" type="number" step="0.01" :disabled="locked" /></label>
        <button type="submit" class="ss-btn sm" :disabled="locked || busy" data-test="fau-param-save"><i class="ri-refresh-line"></i>{{ $t('按新假设重算') }}</button>
      </form>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('贷款人') }}</th><th class="num">{{ $t('本金余额') }}</th><th class="num">{{ $t('综合成本') }}</th><th>{{ $t('到期日') }}</th></tr></thead>
          <tbody><tr v-for="l in fin.cost.loans" :key="l.id"><td>{{ l.lender }}</td><td class="num"><FauNum :cents="l.principal" /></td><td class="num"><FauNum :ratio="l.allIn" /></td><td><FauNum :value="l.maturity" /></td></tr></tbody>
        </table>
      </div>
    </section>
    <section v-if="fin?.covenants" class="fau-sec" data-test="fau-covenants">
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('贷款人') }}</th><th>{{ $t('条款') }}</th><th>{{ $t('限值') }}</th><th v-for="v in fin.covenants[0]?.values || []" :key="v.period"><FauNum :value="v.period" /><small v-if="v.forecast" class="ss-muted"> · {{ $t('预测') }}</small></th></tr></thead>
          <tbody>
            <tr v-for="c in fin.covenants" :key="c.id" :class="{ bad: c.current === 'breach' }" :data-test="`fau-covenant-${c.id}`">
              <td>{{ c.lender }}</td><td>{{ c.name }} <small class="ss-muted">{{ $t(COVENANT_METRIC_LABEL[c.metric]) }}</small></td>
              <td><FauNum :value="`${COVENANT_OP_LABEL[c.op]} ${c.metric === 'net_worth' ? fmtMajor(c.limit) : c.limit}`" /></td>
              <td v-for="v in c.values" :key="v.period"><span class="fau-badge" :class="RAG_CLASS[v.status]"><FauNum :value="covValue(c.metric, v.value)" /> · {{ $t(RAG_LABEL[v.status]) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ECL -->
    <template v-if="ecl">
      <section class="fau-sec" data-test="fau-ecl">
        <div class="fau-tr-kpis">
          <span class="fau-badge muted">{{ $t('违约敞口合计') }} <FauNum :cents="ecl.totalEad" /></span>
          <span class="fau-badge" data-test="fau-ecl-total">{{ $t('预期信用损失合计') }} <FauNum :cents="ecl.totalEcl" /></span>
          <span class="fau-badge muted">{{ $t('前瞻系数') }} <FauNum :value="ecl.forwardFactor.toFixed(4)" /></span>
          <span v-for="s in ecl.scenarios" :key="s.id" class="fau-badge muted">{{ $t(SCENARIO_LABEL[s.id] || s.name) }} <FauNum :ratio="s.weight" /> × <FauNum :value="s.pdMultiplier" /></span>
        </div>
        <div v-if="ecl.stages" class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('阶段') }}</th><th class="num">{{ $t('笔数') }}</th><th class="num">{{ $t('违约敞口') }}</th><th class="num">{{ $t('加权 ECL') }}</th><th class="num">{{ $t('覆盖率') }}</th></tr></thead>
            <tbody><tr v-for="s in ecl.stages" :key="s.stage" :data-test="`fau-ecl-stage-${s.stage}`"><td>{{ $t(ECL_STAGE_LABEL[s.stage]) }}</td><td class="num"><FauNum :value="s.count" /></td><td class="num"><FauNum :cents="s.ead" /></td><td class="num"><FauNum :cents="s.ecl" /></td><td class="num"><FauNum :ratio="s.coverage" /></td></tr></tbody>
          </table>
        </div>
        <div v-if="ecl.migration" class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('上期阶段') }}</th><th>{{ $t('本期阶段') }}</th><th class="num">{{ $t('笔数') }}</th><th class="num">{{ $t('违约敞口') }}</th></tr></thead>
            <tbody><tr v-for="m in ecl.migration" :key="`${m.from}-${m.to}`"><td>{{ $t(ECL_STAGE_LABEL[m.from]) }}</td><td>{{ $t(ECL_STAGE_LABEL[m.to]) }}</td><td class="num"><FauNum :value="m.count" /></td><td class="num"><FauNum :cents="m.ead" /></td></tr></tbody>
          </table>
        </div>
        <div v-if="ecl.matrix" class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('账龄区间') }}</th><th class="num">{{ $t('应收余额') }}</th><th class="num">{{ $t('损失率') }}</th><th class="num">{{ $t('预期信用损失') }}</th></tr></thead>
            <tbody><tr v-for="m in ecl.matrix" :key="m.bucket" :data-test="`fau-ecl-bucket-${m.bucket}`"><td>{{ $t(AGING_BUCKET_LABEL[m.bucket]) }}</td><td class="num"><FauNum :cents="m.amount" /></td><td class="num"><FauNum :ratio="m.rate" /></td><td class="num"><FauNum :cents="m.ecl" /></td></tr></tbody>
          </table>
        </div>
      </section>
      <details v-if="ecl.lines" class="fau-sec">
        <summary>{{ $t('阶段与计量') }}</summary>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('敞口编号') }}</th><th>{{ $t('交易对手') }}</th><th class="num">{{ $t('违约敞口') }}</th><th>{{ $t('阶段') }}</th><th>{{ $t('判定理由') }}</th><th class="num">{{ $t('加权 ECL') }}</th></tr></thead>
            <tbody><tr v-for="l in ecl.lines" :key="l.id"><td><FauNum :value="l.id" /></td><td>{{ l.counterparty }}</td><td class="num"><FauNum :cents="l.ead" /></td><td>{{ $t(ECL_STAGE_LABEL[l.stage]) }}</td><td class="wrap">{{ l.reasons.map((x) => $t(ECL_REASON_LABEL[x] || x)).join(sep) }}</td><td class="num"><FauNum :cents="l.weighted" /></td></tr></tbody>
          </table>
        </div>
      </details>
    </template>

    <!-- 营运资本 -->
    <template v-if="wc">
      <section v-if="wc.ccc" class="fau-sec" data-test="fau-ccc">
        <div class="fau-tr-kpis">
          <span class="fau-badge">DSO <FauNum :value="days(wc.ccc.dso)" /></span>
          <span class="fau-badge">DIO <FauNum :value="days(wc.ccc.dio)" /></span>
          <span class="fau-badge">DPO <FauNum :value="days(wc.ccc.dpo)" /></span>
          <span class="fau-badge ok" data-test="fau-ccc-value">CCC <FauNum :value="days(wc.ccc.ccc)" /></span>
          <span class="fau-badge muted">{{ $t('应收每缩短 1 天释放') }} <FauNum :cents="wc.ccc.perDay.dso" /></span>
          <span class="fau-badge warn">{{ $t('逾期应收') }} <FauNum :cents="wc.ccc.overdueAr" /></span>
        </div>
      </section>
      <section v-if="wc.inventory" class="fau-sec" data-test="fau-inventory">
        <div class="fau-tr-kpis">
          <span v-for="c in (['A', 'B', 'C'] as const)" :key="c" class="fau-badge muted"><FauNum :value="c" /> <FauNum :value="wc.inventory.byClass[c].count" /> · <FauNum :cents="wc.inventory.byClass[c].amount" /></span>
          <span class="fau-badge warn">{{ $t(INV_AGING_LABEL.slow) }} <FauNum :cents="wc.inventory.slow" /></span>
          <span class="fau-badge bad">{{ $t(INV_AGING_LABEL.obsolete) }} <FauNum :cents="wc.inventory.obsolete" /></span>
          <span class="fau-badge ok" data-test="fau-inv-release">{{ $t('可释放资金占用') }} <FauNum :cents="wc.inventory.release" /></span>
        </div>
      </section>
      <section v-if="wc.suppliers" class="fau-sec" data-test="fau-suppliers">
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('供应商') }}</th><th class="num">{{ $t('未清金额') }}</th><th class="num">{{ $t('占比') }}</th><th class="num">{{ $t('平均账期（天）') }}</th><th class="num">{{ $t('30 天内到期') }}</th></tr></thead>
            <tbody><tr v-for="s in wc.suppliers" :key="s.supplier" :class="{ warn: s.status !== 'ok' }"><td>{{ s.supplier }}</td><td class="num"><FauNum :cents="s.open" /></td><td class="num"><FauNum :ratio="s.share" /></td><td class="num"><FauNum :value="days(s.avgTermDays)" /></td><td class="num"><FauNum :cents="s.dueIn30" /></td></tr></tbody>
          </table>
        </div>
      </section>
      <section v-if="wc.scf" class="fau-sec" data-test="fau-scf">
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('方案') }}</th><th class="num">{{ $t('基数') }}</th><th class="num">{{ $t('现金效应') }}</th><th class="num">{{ $t('年化成本（负数为节约）') }}</th></tr></thead>
            <tbody><tr v-for="o in wc.scf" :key="o.id"><td>{{ $t(SCF_LABEL[o.id]) }}</td><td class="num"><FauNum :cents="o.base" /></td><td class="num"><FauNum :cents="o.cashEffect" /></td><td class="num"><FauNum :cents="o.annualCost" /></td></tr></tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 投融资 -->
    <section v-if="inv?.portfolio" class="fau-sec" data-test="fau-portfolio">
      <div class="fau-tr-kpis">
        <span class="fau-badge muted">{{ $t('市值') }} <FauNum :cents="inv.portfolio.totals.marketValue" /></span>
        <span class="fau-badge" :class="inv.portfolio.totals.pnl < 0 ? 'warn' : 'ok'" data-test="fau-portfolio-pnl">{{ $t('浮动盈亏') }} <FauNum :cents="inv.portfolio.totals.pnl" /></span>
        <span class="fau-badge muted">{{ $t('加权收益率') }} <FauNum :ratio="inv.portfolio.weightedYield" /></span>
      </div>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('产品名称') }}</th><th>{{ $t('投资类型') }}</th><th class="num">{{ $t('市值') }}</th><th class="num">{{ $t('浮动盈亏') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('提示') }}</th></tr></thead>
          <tbody><tr v-for="l in inv.portfolio.lines" :key="l.id" :class="{ bad: l.status === 'breach', warn: l.status === 'watch' }"><td>{{ l.product }}</td><td>{{ $t(INVEST_TYPE_LABEL[l.type]) }}</td><td class="num"><FauNum :cents="l.marketValue" /></td><td class="num"><FauNum :cents="l.pnl" /></td><td>{{ $t(RAG_LABEL[l.status]) }}</td><td class="wrap">{{ l.flags.map((f) => msg(f)).join(sep) }}</td></tr></tbody>
        </table>
      </div>
    </section>
    <section v-if="inv?.liquidity" class="fau-sec" data-test="fau-liquidity">
      <div class="fau-tr-kpis">
        <span class="fau-badge ok">{{ $t('可用流动性合计') }} <FauNum :cents="inv.liquidity.available" /></span>
        <span class="fau-badge muted">{{ $t('一年内到期债务') }} <FauNum :cents="inv.liquidity.debtDue12m" /></span>
        <span class="fau-badge" :class="RAG_CLASS[inv.liquidity.statuses.current]">{{ $t('流动比率') }} <FauNum :value="ratioX(inv.liquidity.currentRatio)" /></span>
        <span class="fau-badge" :class="RAG_CLASS[inv.liquidity.statuses.quick]">{{ $t('速动比率') }} <FauNum :value="ratioX(inv.liquidity.quickRatio)" /></span>
        <span class="fau-badge" :class="RAG_CLASS[inv.liquidity.statuses.coverage]">{{ $t('短期债务覆盖') }} <FauNum :value="ratioX(inv.liquidity.coverage)" /></span>
        <span class="fau-badge" :class="RAG_CLASS[inv.liquidity.statuses.facility]">{{ $t('授信使用率') }} <FauNum :ratio="inv.liquidity.facilityUtilization" /></span>
      </div>
    </section>

    <!-- 模型说明（H 型） -->
    <section v-if="narrative.length" class="fau-sec" data-test="fau-narrative">
      <strong>{{ $t('模型说明（数字已回核）') }}</strong>
      <div v-for="n in narrative" :key="n.id" class="fau-tr-para" :class="{ bad: n.status !== 'verified' }">
        <span class="fau-badge" :class="n.status === 'verified' ? 'ok' : 'bad'">{{ $t(n.topic) }} · {{ n.status === 'verified' ? $t('已核实') : $t('未核实') }}</span>
        <p>{{ n.text }}</p>
      </div>
    </section>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/** G5 资金与金融风险（E1–E7）第 ④ 步结果：按模块与模式渲染；数字一律经 FauNum（阿语 RTL 下负号、千分位不错位） */
import { computed, reactive, ref, watch } from 'vue';
import type {
  FauCashResult, FauCovenantMetric, FauEclResult, FauFinancingResult, FauFxResult, FauInvestResult, FauModuleDef, FauRun, FauTreasuryNarrative,
  FauTreasuryResult, FauWcResult,
} from '@totalclaw/ipc-contracts';
import {
  AGING_BUCKET_LABEL, AUTH_ADVICE_LABEL, BANK_TIER_LABEL, COVENANT_METRIC_LABEL, COVENANT_OP_LABEL, ECL_REASON_LABEL, ECL_STAGE_LABEL, FX_CERTAINTY_LABEL,
  FX_SIDE_LABEL, GAP_TIER_LABEL, INVEST_TYPE_LABEL, INV_AGING_LABEL, PAY_PLAN_LABEL, PAY_PRIORITY_HINT, PRIORITY_SOURCE_LABEL, RAG_LABEL, RECON3_LABEL,
  SCENARIO_LABEL, SCF_LABEL,
} from '../../../../../shared/financeAudit/treasuryLabels';
import { listSeparator } from '../../../../i18n';
import FauNum from '../../FauNum.vue';
import { errorMessage, fau, fmtCents, msg } from '../../shared';
import CashForecastChart from './CashForecastChart.vue';

const props = defineProps<{ run: FauRun; def: FauModuleDef }>();
const emit = defineEmits<{ (e: 'changed'): void }>();
const sep = listSeparator();
const busy = ref(false);
const error = ref('');

const r = computed(() => props.run.result as Record<string, unknown> | undefined);
const cash = computed(() => (props.def.id === 'cash' ? r.value as unknown as FauCashResult : null));
const tr = computed(() => (props.def.id === 'treasury' ? r.value as unknown as FauTreasuryResult : null));
const fx = computed(() => (props.def.id === 'fx' ? r.value as unknown as FauFxResult : null));
const fin = computed(() => (props.def.id === 'financing' ? r.value as unknown as FauFinancingResult : null));
const ecl = computed(() => (props.def.id === 'ifrs9' ? r.value as unknown as FauEclResult : null));
const wc = computed(() => (props.def.id === 'working-capital' ? r.value as unknown as FauWcResult : null));
const inv = computed(() => (props.def.id === 'investments' ? r.value as unknown as FauInvestResult : null));
const position = computed(() => cash.value?.position || tr.value?.position || null);
const forecast = computed(() => cash.value?.forecast || tr.value?.forecast || null);
const payments = computed(() => cash.value?.payments || null);
const narrative = computed<FauTreasuryNarrative[]>(() => (r.value?.narrative as FauTreasuryNarrative[] | undefined) || []);
const locked = computed(() => ['signing', 'archived', 'void'].includes(props.run.status));

const RAG_CLASS: Record<string, string> = { ok: 'ok', watch: 'warn', breach: 'bad' };
const ADVICE_CLASS: Record<string, string> = { proceed: 'ok', request_docs: 'warn', hold: 'bad', reject_recommend: 'bad' };

const days = (v: number | null | undefined) => (v == null ? '-' : v.toFixed(1));
const ratioX = (v: number | null | undefined) => (v == null ? '-' : v.toFixed(2));
const fmtMajor = (c: number) => fmtCents(c);
const covValue = (m: FauCovenantMetric, v: number | null) => (v == null ? '-' : m === 'net_worth' ? fmtCents(v) : v.toFixed(2));

const params = reactive({ rf: '', beta: '', erp: '', taxRate: '', equity: '' });
watch(() => fin.value?.cost, (c) => {
  if (!c) return;
  const pct = (x: number) => String(Math.round(x * 10000) / 100);
  Object.assign(params, { rf: pct(c.rf), beta: String(c.beta), erp: pct(c.erp), taxRate: pct(c.taxRate), equity: String(Math.round(c.equity) / 100) });
}, { immediate: true });

async function saveParams(): Promise<void> {
  busy.value = true; error.value = '';
  try {
    await fau('financing.params.update', { runId: props.run.id, ...params });
    emit('changed');
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>

<style scoped>
.fau-tr { display: grid; gap: 10px; }
.fau-sec { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 10px 12px; display: grid; gap: 8px; background: var(--color-bg-card); }
.fau-sec > summary { cursor: pointer; font-weight: 700; font-size: 12.5px; }
.fau-tr-kpis { display: flex; flex-wrap: wrap; gap: 6px; }
.fau-tr-flags { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.fau-tr-flags li { display: flex; gap: 6px; align-items: center; color: var(--color-danger); font-size: 12.5px; }
.fau-tr-params { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: end; font-size: var(--font-size-sm); }
.fau-tr-params label { display: grid; gap: 2px; color: var(--color-text-secondary); }
.fau-tr-params input { width: 110px; height: 28px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); padding-inline: 6px; text-align: end; }
.fau-tr-para { display: grid; gap: 4px; padding-block: 4px; border-block-start: 1px dashed var(--color-border); }
.fau-tr-para p { margin: 0; font-size: 12.5px; line-height: 1.6; }
.fau-tr-para.bad p { color: var(--color-danger); }
</style>
