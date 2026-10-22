<template>
  <div class="bid-desk" :dir="isRtl ? 'rtl' : 'ltr'">
    <header class="bid-header">
      <div class="bid-title">
        <PageBackButton />
        <span class="bid-logo"><i class="ri-file-list-3-line"></i></span>
        <div>
          <h1>{{ bt('title') }}</h1>
          <p>{{ bt('subtitle') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn ghost" @click="resetDemoData">
          <i class="ri-restart-line"></i>{{ bt('resetDemo') }}
        </button>
        <button class="btn primary" :disabled="creatingCase" @click="createBidCase">
          <i :class="creatingCase ? 'ri-loader-4-line spin' : 'ri-add-line'"></i>{{ bt('newCase') }}
        </button>
      </div>
    </header>

    <div v-if="bidCase" class="bid-body">
      <section class="case-hero">
        <div class="case-identity">
          <select v-model="activeCaseId" class="case-selector">
            <option v-for="item in cases" :key="item.id" :value="item.id">
              {{ item.id }} · {{ displayText(item.customer) }}
            </option>
          </select>
          <span class="status-pill" :class="`status-${bidCase.status}`">
            {{ statusLabel(bidCase.status) }}
          </span>
          <span class="version-pill">{{ bt('version') }} {{ bidCase.version }}</span>
        </div>
        <div class="case-copy">
          <h2>{{ displayText(bidCase.project) }}</h2>
          <p>{{ displayText(bidCase.customer) }} · {{ bidCase.rfqNumber || 'RFQ —' }}</p>
        </div>
        <div class="case-meta">
          <div><span>{{ bt('deadline') }}</span><strong>{{ bidCase.deadline || '—' }}</strong></div>
          <div><span>{{ bt('owner') }}</span><strong>{{ bidCase.owner ? displayText(bidCase.owner) : '—' }}</strong></div>
          <div><span>{{ bt('currentLanguage') }}</span><strong>{{ locale }}</strong></div>
        </div>
      </section>

      <section class="metric-grid">
        <article class="metric">
          <span class="metric-icon blue"><i class="ri-file-copy-2-line"></i></span>
          <div><strong>{{ bidCase.documents.length }}</strong><span>{{ bt('files') }}</span></div>
        </article>
        <article class="metric">
          <span class="metric-icon amber"><i class="ri-user-follow-line"></i></span>
          <div><strong>{{ pendingReviewCount }}</strong><span>{{ bt('pendingReviews') }}</span></div>
        </article>
        <article class="metric">
          <span class="metric-icon red"><i class="ri-alarm-warning-line"></i></span>
          <div><strong>{{ criticalRiskCount }}</strong><span>{{ bt('criticalRisks') }}</span></div>
        </article>
        <article class="metric">
          <span class="metric-icon green"><i class="ri-money-dollar-circle-line"></i></span>
          <div><strong>{{ currentScenario ? money(currentScenario.offeredPriceSar) : '—' }}</strong><span>{{ bt('currentOffer') }}</span></div>
        </article>
        <article class="metric">
          <span class="metric-icon violet"><i class="ri-links-line"></i></span>
          <div><strong>{{ evidenceCoverage }}%</strong><span>{{ bt('evidenceCoverage') }}</span></div>
        </article>
      </section>

      <section class="workflow-band">
        <div class="workflow-band-head">
          <div>
            <span class="section-kicker">{{ bt('workflow') }}</span>
            <strong>{{
              workflowConnected
                ? bt('workflowReady')
                : workflowAvailable
                  ? bt('workflowAvailable')
                  : bt('workflowUnavailable')
            }}</strong>
          </div>
          <div class="workflow-actions">
            <span class="workflow-result-hint">{{ bt('workflowResultsHint') }}</span>
            <button
              v-if="workflowConnected"
              class="btn secondary compact"
              :disabled="workflowBusy"
              @click="openLinkedWorkflow"
            >
              <i class="ri-flow-chart"></i>{{ bt('viewLinkedWorkflow') }}
            </button>
            <button class="btn primary compact" :disabled="workflowBusy || !workflowAvailable" @click="openWorkflowRun">
              <i :class="workflowBusy ? 'ri-loader-2-line spin' : 'ri-route-line'"></i>{{ bt('openWorkflowRun') }}
            </button>
          </div>
        </div>
        <div class="stage-track">
          <template v-for="(stage, index) in bidCase.workflowStages" :key="stage.id">
            <div class="stage" :class="`stage-${stage.status}`">
              <span class="stage-dot"><i :class="stageIcon(stage.status)"></i></span>
              <div><strong>{{ stageName(stage) }}</strong><small>{{ stageStatusLabel(stage.status) }}</small></div>
            </div>
            <i v-if="index < bidCase.workflowStages.length - 1" class="ri-arrow-right-line stage-arrow"></i>
          </template>
        </div>
      </section>

      <nav class="bid-tabs" aria-label="Bid Desk">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>{{ $t(tab.label) }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </nav>

      <main class="tab-panel">
        <template v-if="activeTab === 'overview'">
          <section class="content-grid two">
            <article class="panel">
              <div class="panel-head">
                <div><span class="section-kicker">{{ bt('overview') }}</span><h3>{{ bt('caseHeading') }}</h3></div>
                <button class="link-btn" @click="metaEditing = !metaEditing">
                  <i class="ri-edit-line"></i>
                </button>
              </div>
              <div v-if="metaEditing" class="form-grid">
                <label><span>{{ bt('customer') }}</span><input v-model="metaDraft.customer" /></label>
                <label><span>{{ bt('project') }}</span><input v-model="metaDraft.project" /></label>
                <label><span>RFQ</span><input v-model="metaDraft.rfqNumber" /></label>
                <label><span>{{ bt('deadline') }}</span><input v-model="metaDraft.deadline" type="date" /></label>
                <label><span>{{ bt('owner') }}</span><input v-model="metaDraft.owner" /></label>
                <div class="form-action"><button class="btn primary compact" @click="saveMeta">{{ bt('accept') }}</button></div>
              </div>
              <dl v-else class="summary-list">
                <div><dt>{{ bt('customer') }}</dt><dd>{{ displayText(bidCase.customer) }}</dd></div>
                <div><dt>{{ bt('project') }}</dt><dd>{{ displayText(bidCase.project) }}</dd></div>
                <div><dt>RFQ</dt><dd>{{ bidCase.rfqNumber || '—' }}</dd></div>
                <div><dt>{{ bt('deadline') }}</dt><dd>{{ bidCase.deadline || '—' }}</dd></div>
                <div><dt>{{ bt('status') }}</dt><dd>{{ statusLabel(bidCase.status) }}</dd></div>
              </dl>
            </article>

            <article class="panel capability-panel">
              <div class="panel-head">
                <div><span class="section-kicker">{{ bt('actualCapability') }}</span><h3>TotalClaw Core</h3></div>
                <i class="ri-shield-check-line capability-icon"></i>
              </div>
              <p>{{ bt('actualCapabilityText') }}</p>
              <div class="capability-chips">
                <span>WorkflowEngine</span><span>AgentEngine</span><span>VLM</span>
                <span>Embedding/RAG</span><span>Document Output</span><span>i18n/RTL</span>
              </div>
            </article>
          </section>

          <section class="content-grid two lower">
            <article class="panel">
              <div class="panel-head">
                <div><span class="section-kicker">{{ bt('documents') }}</span><h3>{{ bidCase.documents.length }} {{ bt('files') }}</h3></div>
                <button class="link-btn" @click="activeTab = 'documents'">{{ bt('viewEvidence') }}</button>
              </div>
              <div class="doc-list compact-list">
                <div v-for="doc in bidCase.documents.slice(0, 4)" :key="doc.id" class="doc-row">
                  <i :class="documentIcon(doc.kind)"></i>
                  <div><strong>{{ displayText(doc.name) }}</strong><small>{{ formatBytes(doc.size) }}</small></div>
                  <span :class="`parse-${doc.parseStatus}`">{{ parseLabel(doc.parseStatus) }}</span>
                </div>
                <p v-if="!bidCase.documents.length" class="empty">{{ bt('noDocuments') }}</p>
              </div>
            </article>
            <article class="panel">
              <div class="panel-head">
                <div><span class="section-kicker">{{ bt('timeline') }}</span><h3>{{ bidCase.audit.length }}</h3></div>
                <button class="link-btn" @click="activeTab = 'timeline'">{{ bt('viewAll') }}</button>
              </div>
              <div class="audit-list mini">
                <div v-for="event in bidCase.audit.slice(0, 5)" :key="event.id" class="audit-row">
                  <span class="audit-dot"></span>
                  <div><strong>{{ auditActionLabel(event.action) }}</strong><p>{{ displayText(event.detail) }}</p><small>{{ formatDate(event.at) }}</small></div>
                </div>
              </div>
            </article>
          </section>
        </template>

        <template v-else-if="activeTab === 'documents'">
          <section class="panel upload-panel">
            <div class="panel-head">
              <div><span class="section-kicker">{{ bt('documents') }}</span><h3>{{ bt('upload') }}</h3></div>
              <label class="btn primary compact file-button">
                <i class="ri-upload-cloud-2-line"></i>{{ bt('upload') }}
                <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.tiff" @change="onFilesSelected" />
              </label>
            </div>
            <div class="doc-grid">
              <article v-for="doc in bidCase.documents" :key="doc.id" class="doc-card">
                <i :class="documentIcon(doc.kind)"></i>
                <div>
                  <strong>{{ displayText(doc.name) }}</strong>
                  <p>{{ doc.kind.toUpperCase() }} · {{ formatBytes(doc.size) }} · {{ displayText(doc.uploadedBy) }}</p>
                  <select
                    class="purpose-select"
                    :value="doc.purpose"
                    @change="setDocumentPurpose(doc.id, $event)"
                  >
                    <option v-for="option in documentPurposes" :key="option.value" :value="option.value">{{ $t(option.label) }}</option>
                  </select>
                  <small v-if="doc.warnings?.length" class="document-warning">{{ doc.warnings.join($t('；')) }}</small>
                </div>
                <span :class="`parse-${doc.parseStatus}`">{{ parseLabel(doc.parseStatus) }}</span>
              </article>
            </div>
          </section>

          <section class="panel table-panel">
            <div class="panel-head"><div><span class="section-kicker">{{ bt('fieldsReview') }}</span><h3>{{ bt('evidenceExtraction') }}</h3></div></div>
            <div class="data-table">
              <div class="table-row table-head fields">
                <span>{{ bt('field') }}</span><span>{{ bt('value') }}</span><span>{{ bt('confidence') }}</span><span>{{ bt('sourceEvidence') }}</span><span></span>
              </div>
              <div v-for="field in bidCase.fields" :key="field.id" class="table-row fields">
                <span class="field-key">{{ field.key }}</span>
                <input v-model="fieldDrafts[field.id]" />
                <span class="confidence"><i :style="{ width: `${field.confidence * 100}%` }"></i>{{ Math.round(field.confidence * 100) }}%</span>
                <button class="evidence-link" @click="selectedEvidence = field.evidence">{{ evidenceLabel(field.evidence[0]) }}</button>
                <div class="row-actions">
                  <button class="icon-action success" :title="bt('accept')" @click="reviewField(field.id, 'accepted')"><i class="ri-check-line"></i></button>
                  <button class="icon-action danger" :title="bt('reject')" @click="reviewField(field.id, 'rejected')"><i class="ri-close-line"></i></button>
                </div>
              </div>
            </div>
          </section>

          <section class="panel table-panel">
            <div class="panel-head"><div><span class="section-kicker">{{ bt('lineItems') }}</span><h3>BOQ</h3></div></div>
            <div class="data-table">
              <div class="table-row table-head items">
                <span>{{ bt('description') }}</span><span>{{ bt('quantity') }}</span><span>{{ bt('matchedProduct') }}</span>
                <span>{{ bt('unitCost') }}</span><span>{{ bt('customerUnitPrice') }}</span><span>{{ bt('sourceEvidence') }}</span><span></span>
              </div>
              <div v-for="item in bidCase.lineItems" :key="item.id" class="table-row items">
                <span><strong>{{ displayText(item.description) }}</strong><small>{{ displayText(item.model) }}</small></span>
                <span>{{ item.quantity }} {{ item.unit }}</span>
                <input v-model="productDrafts[item.id]" />
                <input v-model.number="linePricingDrafts[item.id].unitCostSar" type="number" min="0" step="100" />
                <input v-model.number="linePricingDrafts[item.id].unitPriceSar" type="number" min="0" step="100" />
                <button class="evidence-link" @click="selectedEvidence = item.evidence">{{ evidenceLabel(item.evidence[0]) }}</button>
                <button class="icon-action success" @click="reviewProduct(item.id)"><i class="ri-check-line"></i></button>
              </div>
            </div>
          </section>
        </template>

        <template v-else-if="activeTab === 'compliance'">
          <section class="risk-summary">
            <div v-for="item in complianceSummary" :key="item.key" :class="`risk-count risk-${item.key}`">
              <strong>{{ item.count }}</strong><span>{{ $t(item.label) }}</span>
            </div>
          </section>
          <section class="finding-list">
            <article
              v-for="finding in bidCase.findings"
              :key="finding.id"
              class="finding-card"
              :class="[
                `severity-${finding.severity}`,
                {
                  'conclusion-saved': !isFindingEditing(finding),
                  'just-saved': savedFindingId === finding.id,
                },
              ]"
            >
              <div class="finding-top">
                <div>
                  <span class="severity-pill">{{ finding.severity }}</span>
                  <h3>{{ displayText(finding.requirement) }}</h3>
                </div>
                <span class="finding-status">{{ complianceLabel(finding.humanDecision || finding.status) }}</span>
              </div>
              <div class="finding-columns">
                <div><span>{{ bt('response') }}</span><p>{{ displayText(finding.response) }}</p></div>
                <div>
                  <span>{{ bt('sourceEvidence') }}</span>
                  <button class="evidence-link" @click="selectedEvidence = finding.evidence">{{ evidenceLabel(finding.evidence[0]) }}</button>
                </div>
              </div>
              <div v-if="isFindingEditing(finding)" class="finding-decision">
                <select v-model="findingDrafts[finding.id].decision">
                  <option value="compliant">{{ complianceLabel('compliant') }}</option>
                  <option value="conditional">{{ complianceLabel('conditional') }}</option>
                  <option value="missing">{{ complianceLabel('missing') }}</option>
                  <option value="deviation">{{ complianceLabel('deviation') }}</option>
                  <option value="major_deviation">{{ complianceLabel('major_deviation') }}</option>
                  <option value="pending">{{ complianceLabel('pending') }}</option>
                </select>
                <input v-model="findingDrafts[finding.id].clarification" :placeholder="bt('clarification')" />
                <button
                  class="btn primary compact finding-save-btn"
                  :disabled="savingFindingId === finding.id"
                  @click="saveFinding(finding.id)"
                >
                  <i :class="savingFindingId === finding.id ? 'ri-loader-4-line spin' : 'ri-save-3-line'"></i>
                  {{ bt('saveDecision') }}
                </button>
              </div>
              <div v-else class="finding-conclusion" aria-live="polite">
                <span class="finding-conclusion-icon"><i class="ri-checkbox-circle-fill"></i></span>
                <div class="finding-conclusion-copy">
                  <span>{{ bt('decisionSaved') }}</span>
                  <strong>{{ complianceLabel(finding.humanDecision || finding.status) }}</strong>
                  <p>{{ finding.clarification ? displayText(finding.clarification) : bt('noClarification') }}</p>
                </div>
                <button class="btn secondary compact" @click="editFinding(finding.id)">
                  <i class="ri-edit-line"></i>{{ bt('editDecision') }}
                </button>
              </div>
            </article>
          </section>
        </template>

        <template v-else-if="activeTab === 'pricing'">
          <section class="content-grid pricing-layout">
            <article class="panel">
              <div class="panel-head"><div><span class="section-kicker">{{ bt('pricingInputs') }}</span><h3>{{ bt('pricingEngine') }}</h3></div></div>
              <div class="pricing-form">
                <label v-for="field in pricingFields" :key="field.key">
                  <span>{{ $t(field.label) }}</span>
                  <div class="number-input">
                    <input v-model.number="pricingDraft[field.key]" type="number" :step="field.rate ? '0.01' : '100'" />
                    <small v-if="field.rate">× 100%</small>
                  </div>
                </label>
              </div>
              <div class="panel-actions">
                <button class="btn ghost" @click="savePricing">{{ bt('savePricing') }}</button>
                <input v-model="scenarioName" class="scenario-name" :placeholder="bt('scenarioName')" />
                <button class="btn primary" @click="generateScenario"><i class="ri-calculator-line"></i>{{ bt('createScenario') }}</button>
              </div>
            </article>
            <article class="panel scenario-panel">
              <div class="panel-head"><div><span class="section-kicker">{{ bt('scenarios') }}</span><h3>{{ bidCase.scenarios.length }}</h3></div></div>
              <p v-if="!bidCase.scenarios.length" class="empty">{{ bt('noScenario') }}</p>
              <article v-for="scenario in bidCase.scenarios" :key="scenario.id" class="scenario-card" :class="{ warning: scenario.belowMinimumMargin }">
                <div class="scenario-title"><strong>{{ displayText(scenario.name) }}</strong><small>{{ formatDate(scenario.createdAt) }}</small></div>
                <div class="scenario-numbers">
                  <div><span>{{ bt('landedCost') }}</span><strong>{{ money(scenario.landedCostSar) }}</strong></div>
                  <div><span>{{ bt('offeredPrice') }}</span><strong>{{ money(scenario.offeredPriceSar) }}</strong></div>
                  <div><span>{{ bt('margin') }}</span><strong>{{ percent(scenario.marginRate) }}</strong></div>
                </div>
                <p v-if="scenario.belowMinimumMargin" class="rule-alert"><i class="ri-alarm-warning-line"></i>{{ bt('ruleAlert') }}</p>
              </article>
            </article>
          </section>
        </template>

        <template v-else-if="activeTab === 'approval'">
          <section class="decision-layout">
            <article class="decision-card">
              <div class="decision-card-head">
                <div>
                  <span class="section-kicker">{{ bt('decisionCard') }}</span>
                  <h2>{{ displayText(bidCase.customer) }} · {{ displayText(bidCase.project) }}</h2>
                  <small>{{ bidCase.id }} · {{ bidCase.rfqNumber }}</small>
                </div>
                <span class="decision-state" :class="`decision-${bidCase.decision.decision}`">{{ decisionLabel(bidCase.decision.decision) }}</span>
              </div>
              <div class="decision-metrics">
                <div><span>{{ bt('offeredPrice') }}</span><strong>{{ currentScenario ? money(currentScenario.offeredPriceSar) : '—' }}</strong></div>
                <div><span>{{ bt('margin') }}</span><strong>{{ currentScenario ? `${money(currentScenario.marginSar)} · ${percent(currentScenario.marginRate)}` : '—' }}</strong></div>
                <div><span>{{ bt('criticalRisks') }}</span><strong>{{ criticalRiskCount }}</strong></div>
                <div><span>{{ bt('deviations') }}</span><strong>{{ deviationCount }}</strong></div>
              </div>
              <div class="decision-evidence">
                <p><i class="ri-shield-check-line"></i>{{ evidenceCoverage }}% {{ bt('evidenceCoverage') }}</p>
                <p><i class="ri-flow-chart"></i>{{ completedStageCount }}/{{ bidCase.workflowStages.length }} {{ bt('workflow') }}</p>
              </div>
              <section class="decision-summary">
                <strong>{{ bt('aiRecommendation') }}</strong>
                <p>{{ displayText(bidCase.decisionSummary.aiRecommendation || i18nT('等待工作流生成建议。')) }}</p>
                <div v-if="bidCase.decisionSummary.risks.length" class="decision-summary-list">
                  <span v-for="risk in bidCase.decisionSummary.risks" :key="risk"><i class="ri-error-warning-line"></i>{{ displayText(risk) }}</span>
                </div>
              </section>
              <label class="decision-scenario">
                <span>{{ bt('frozenScenario') }}</span>
                <select v-model="selectedScenarioId">
                  <option value="">—</option>
                  <option v-for="scenario in bidCase.scenarios" :key="scenario.id" :value="scenario.id">
                    {{ displayText(scenario.name) }} · {{ money(scenario.offeredPriceSar) }} · {{ percent(scenario.marginRate) }}
                  </option>
                </select>
              </label>
              <label class="comment-field"><span>{{ bt('comment') }}</span><textarea v-model="decisionComment" rows="3"></textarea></label>
              <div v-if="approvalIssues.length" class="approval-blockers">
                <strong><i class="ri-lock-line"></i> {{ bt('approvalBlocked') }}</strong>
                <span v-for="issue in approvalIssues" :key="issue">{{ displayText(issue) }}</span>
                <button
                  v-if="approvalIssues.some((issue) => issue.includes($t('逐行金额合计')))"
                  class="btn secondary compact"
                  @click="alignLinePrices"
                >
                  <i class="ri-scales-3-line"></i>{{ bt('allocateBoq') }}
                </button>
              </div>
              <div class="decision-actions">
                <button class="btn danger" @click="decide('rejected')"><i class="ri-close-circle-line"></i>{{ bt('rejectCase') }}</button>
                <button class="btn ghost" @click="decide('returned')"><i class="ri-arrow-go-back-line"></i>{{ bt('returnReview') }}</button>
                <button class="btn ghost" @click="decide('more_information')"><i class="ri-question-answer-line"></i>{{ bt('moreInformation') }}</button>
                <button class="btn secondary" @click="modifyBeforeApproval"><i class="ri-edit-line"></i>{{ bt('modifyBeforeApproval') }}</button>
                <button class="btn primary" :disabled="approvalIssues.length > 0" @click="decide('approved')"><i class="ri-checkbox-circle-line"></i>{{ bt('approve') }}</button>
              </div>
            </article>
            <article class="panel output-panel">
              <div class="panel-head">
                <div>
                  <span class="section-kicker">{{ bt('outputManifest') }}</span>
                  <h3>{{ bidCase.decision.decision === 'approved' ? `${bt('frozenVersion')} ${bidCase.decision.version}` : bt('draft') }}</h3>
                </div>
                <button class="btn primary compact" :disabled="bidCase.decision.decision !== 'approved' || exportingArtifacts" @click="exportAllArtifacts">
                  <i :class="exportingArtifacts ? 'ri-loader-2-line spin' : 'ri-folder-download-line'"></i>{{ bt('exportAll') }}
                </button>
              </div>
              <p>{{ artifacts.length }} {{ bt('artifactCount') }} · {{ bt('outputs') }}</p>
              <ul class="artifact-list">
                <li v-for="artifact in artifacts" :key="artifact.id">
                  <i :class="artifactIcon(artifact.kind)"></i>
                  <div><strong>{{ artifact.title }}</strong><small>{{ artifact.filename }}</small></div>
                  <button class="link-btn" @click="artifactPreview = artifact"><i class="ri-eye-line"></i>{{ bt('preview') }}</button>
                  <button class="link-btn" :disabled="exportingArtifacts || bidCase.decision.decision !== 'approved'" @click="exportOneArtifact(artifact)"><i class="ri-download-line"></i>{{ bt('exportFile') }}</button>
                </li>
              </ul>
              <div class="output-lock">
                <i :class="bidCase.decision.decision === 'approved' ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i>
                {{ bidCase.decision.decision === 'approved' ? bt('outputReady') : bt('outputLocked') }}
              </div>
            </article>
          </section>
        </template>

        <template v-else>
          <section class="panel audit-panel">
            <div class="panel-head"><div><span class="section-kicker">{{ bt('timeline') }}</span><h3>{{ bidCase.audit.length }}</h3></div></div>
            <div v-if="bidCase.audit.length" class="audit-list">
              <div v-for="event in bidCase.audit" :key="event.id" class="audit-row">
                <span class="audit-dot"></span>
                <div>
                  <div class="audit-title"><strong>{{ auditActionLabel(event.action) }}</strong><span>{{ displayText(event.actor) }}</span></div>
                  <p>{{ displayText(event.detail) }}</p>
                  <small>{{ formatDate(event.at) }}</small>
                  <details v-if="event.before !== undefined || event.after !== undefined">
                    <summary>{{ bt('beforeAfter') }}</summary>
                    <pre>{{ JSON.stringify({ before: event.before, after: event.after }, null, 2) }}</pre>
                  </details>
                </div>
              </div>
            </div>
            <p v-else class="empty">{{ bt('auditEmpty') }}</p>
          </section>
        </template>
      </main>
    </div>

    <div v-if="selectedEvidence" class="modal-backdrop" @click.self="selectedEvidence = null">
      <section class="evidence-modal">
        <div class="panel-head"><h3>{{ bt('sourceEvidence') }}</h3><button class="link-btn" @click="selectedEvidence = null"><i class="ri-close-line"></i></button></div>
        <article v-for="(evidence, index) in selectedEvidence" :key="index">
          <strong>{{ documentName(evidence.fileId) }}</strong>
          <p>{{ evidenceLabel(evidence) }}</p>
          <blockquote>{{ displayText(evidence.excerpt) }}</blockquote>
        </article>
      </section>
    </div>

    <div v-if="artifactPreview" class="modal-backdrop artifact-backdrop" @click.self="artifactPreview = null">
      <section class="artifact-modal">
        <div class="artifact-modal-head">
          <div class="artifact-modal-title"><span class="section-kicker">{{ bt('preview') }}</span><h3>{{ artifactPreview.title }}</h3></div>
          <div class="artifact-modal-actions">
            <button class="btn primary compact" :disabled="bidCase?.decision.decision !== 'approved'" @click="exportOneArtifact(artifactPreview)"><i class="ri-download-line"></i>{{ bt('exportFile') }}</button>
            <button class="artifact-close" :aria-label="i18nT('关闭预览')" :title="i18nT('关闭预览')" @click="artifactPreview = null"><i class="ri-close-line"></i></button>
          </div>
        </div>
        <!-- 报价/方案是纯静态模板，不需要脚本。不加 sandbox 时 srcdoc 继承主窗口源，
             一旦模板里混进未转义文本就能直接摸到 window.parent.electronAPI。 -->
        <iframe
          v-if="artifactPreview.kind === 'html'"
          class="artifact-frame"
          :title="artifactPreview.title"
          :srcdoc="artifactPreview.content"
          sandbox=""
          referrerpolicy="no-referrer"
        ></iframe>
        <pre v-else class="artifact-source">{{ artifactPreview.content }}</pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { localizeBuiltinText } from '../composables/bidDeskAuditText';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import PageBackButton from '../components/PageBackButton.vue';
import { humanizeErrorMessage } from '../utils/humanize';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification';
import { setWorkflowAutoRun } from '../composables/workflowAutoRun';
import {
  bidDeskWorkflowDefinition,
  REFERENCE_BID_CASE_ID,
  useBidDeskStore,
  type BidCase,
  type BidCaseStatus,
  type BidWorkflowStage,
  type ComplianceFinding,
  type ComplianceStatus,
  type EvidenceAnchor,
  type PricingInput,
  type ReviewStatus,
  type SourceDocument,
} from '../stores/bidDesk';
import { useBidDeskLocale } from '../composables/bidDeskLocale';
import { t as i18nT } from '../i18n';
import {
  buildBidArtifacts,
  type BidArtifact,
  type BidArtifactKind,
} from '../utils/bidDeskArtifacts';
import { registerWorkspaceTask } from '../utils/workspaceTaskRegistration';

const store = useBidDeskStore();
const notif = useNotificationStore();
const router = useRouter();
const { cases, activeCaseId, activeCase: bidCase } = storeToRefs(store);
const { locale, isRtl, bt } = useBidDeskLocale();
const activeTab = ref<'overview' | 'documents' | 'compliance' | 'pricing' | 'approval' | 'timeline'>('overview');
const metaEditing = ref(false);
const workflowConnected = ref(false);
const workflowAvailable = ref(false);
const workflowBusy = ref(false);
const creatingCase = ref(false);
const linkedWorkflowIds = ref<Set<string>>(new Set());
const selectedEvidence = ref<EvidenceAnchor[] | null>(null);
const artifactPreview = ref<BidArtifact | null>(null);
const exportingArtifacts = ref(false);
const scenarioName = ref(i18nT('推荐报价方案'));
const selectedScenarioId = ref('');
const decisionComment = ref('');

const metaDraft = reactive({ customer: '', project: '', rfqNumber: '', owner: '', deadline: '' });
const pricingDraft = reactive<PricingInput>({
  productCostUsd: 0, exchangeRate: 3.75, supplierQuoteSar: 0, freightSar: 0, insuranceSar: 0, dutyRate: 0,
  clearanceSar: 0, storageSar: 0, certificationSar: 0, localTransportSar: 0, installationSar: 0,
  warrantyReserveSar: 0, riskReserveSar: 0, paymentTermCostSar: 0,
  targetMarginRate: 0.2, minimumMarginRate: 0.15, discountRate: 0,
});
const fieldDrafts = reactive<Record<string, string>>({});
const productDrafts = reactive<Record<string, string>>({});
const linePricingDrafts = reactive<Record<string, { unitCostSar: number; unitPriceSar: number }>>({});
const findingDrafts = reactive<Record<string, { decision: ComplianceStatus; clarification: string }>>({});
const editingFindingIds = ref<Set<string>>(new Set());
const savingFindingId = ref('');
const savedFindingId = ref('');
let savedFindingTimer: number | undefined;

const documentPurposes: Array<{ value: SourceDocument['purpose']; label: string }> = [
  { value: 'rfq', label: i18nT('本次招标/RFQ') },
  { value: 'boq', label: i18nT('工程量清单/BOQ') },
  { value: 'catalog', label: i18nT('产品与技术资料') },
  { value: 'supplier', label: i18nT('供应商报价') },
  { value: 'history', label: i18nT('历史项目与澄清') },
  { value: 'template', label: i18nT('企业模板') },
  { value: 'other', label: i18nT('其他资料') },
];

function syncDrafts() {
  if (!bidCase.value) return;
  Object.assign(metaDraft, {
    customer: displayText(bidCase.value.customer),
    project: displayText(bidCase.value.project),
    rfqNumber: bidCase.value.rfqNumber,
    owner: displayText(bidCase.value.owner),
    deadline: bidCase.value.deadline,
  });
  Object.assign(pricingDraft, bidCase.value.pricingInput);
  for (const field of bidCase.value.fields) fieldDrafts[field.id] = displayText(field.value);
  for (const item of bidCase.value.lineItems) {
    productDrafts[item.id] = item.matchedProduct || '';
    linePricingDrafts[item.id] = {
      unitCostSar: item.unitCostSar || 0,
      unitPriceSar: item.unitPriceSar || 0,
    };
  }
  for (const finding of bidCase.value.findings) {
    findingDrafts[finding.id] = {
      decision: finding.humanDecision || finding.status,
      clarification: finding.clarification ? displayText(finding.clarification) : '',
    };
  }
  selectedScenarioId.value =
    bidCase.value.decision.frozenScenarioId || bidCase.value.scenarios[0]?.id || '';
  decisionComment.value = bidCase.value.decision.comment || '';
}

syncDrafts();
watch(activeCaseId, () => {
  editingFindingIds.value = new Set();
  savingFindingId.value = '';
  savedFindingId.value = '';
  syncDrafts();
  const workflowId = bidCase.value
    ? bidDeskWorkflowDefinition(Date.now(), bidCase.value).id
    : '';
  workflowConnected.value = Boolean(workflowId && linkedWorkflowIds.value.has(workflowId));
});
watch(() => bidCase.value?.updatedAt, () => {
  if (!metaEditing.value) syncDrafts();
});

const pendingReviewCount = computed(() => {
  if (!bidCase.value) return 0;
  return bidCase.value.fields.filter((f) => f.reviewStatus === 'pending').length
    + bidCase.value.lineItems.filter((item) => item.reviewStatus === 'pending').length
    + bidCase.value.findings.filter((finding) => !finding.humanDecision).length;
});
const criticalRiskCount = computed(() => bidCase.value?.findings.filter((f) => f.severity === 'critical' || f.severity === 'high').length || 0);
const deviationCount = computed(() => bidCase.value?.findings.filter((f) => ['deviation', 'major_deviation'].includes(f.humanDecision || f.status)).length || 0);
const evidenceCoverage = computed(() => {
  if (!bidCase.value) return 0;
  const items = [...bidCase.value.fields, ...bidCase.value.findings];
  if (!items.length) return 0;
  return Math.round((items.filter((item) => item.evidence?.length).length / items.length) * 100);
});
const currentScenario = computed(() => {
  if (!bidCase.value) return null;
  return bidCase.value.scenarios.find((item) => item.id === selectedScenarioId.value) || bidCase.value.scenarios[0] || null;
});
const approvalIssues = computed(() =>
  store.approvalBlockers(selectedScenarioId.value || undefined, decisionComment.value));
const completedStageCount = computed(() => bidCase.value?.workflowStages.filter((s) => s.status === 'completed').length || 0);
const artifacts = computed(() => bidCase.value ? buildBidArtifacts(bidCase.value, locale.value) : []);

const tabs = computed(() => [
  { id: 'overview' as const, icon: 'ri-dashboard-3-line', label: bt('overview') },
  { id: 'documents' as const, icon: 'ri-file-search-line', label: bt('documents'), badge: pendingReviewCount.value || undefined },
  { id: 'compliance' as const, icon: 'ri-shield-check-line', label: bt('compliance'), badge: criticalRiskCount.value || undefined },
  { id: 'pricing' as const, icon: 'ri-calculator-line', label: bt('pricing') },
  { id: 'approval' as const, icon: 'ri-stamp-line', label: bt('approval') },
  { id: 'timeline' as const, icon: 'ri-history-line', label: bt('timeline') },
]);

const pricingFields = computed(() => [
  { key: 'productCostUsd' as const, label: bt('productCost') },
  { key: 'exchangeRate' as const, label: bt('exchangeRate') },
  { key: 'supplierQuoteSar' as const, label: bt('supplierQuote') },
  { key: 'freightSar' as const, label: bt('freight') },
  { key: 'insuranceSar' as const, label: bt('insurance') },
  { key: 'dutyRate' as const, label: bt('dutyRate'), rate: true },
  { key: 'clearanceSar' as const, label: bt('clearance') },
  { key: 'storageSar' as const, label: bt('storage') },
  { key: 'certificationSar' as const, label: bt('certification') },
  { key: 'localTransportSar' as const, label: bt('localTransport') },
  { key: 'installationSar' as const, label: bt('installation') },
  { key: 'warrantyReserveSar' as const, label: bt('warrantyReserve') },
  { key: 'riskReserveSar' as const, label: bt('riskReserve') },
  { key: 'paymentTermCostSar' as const, label: bt('paymentTermCost') },
  { key: 'targetMarginRate' as const, label: bt('targetMargin'), rate: true },
  { key: 'minimumMarginRate' as const, label: bt('minimumMargin'), rate: true },
  { key: 'discountRate' as const, label: bt('discount'), rate: true },
]);

const complianceSummary = computed(() => {
  const counts: Record<string, number> = { compliant: 0, conditional: 0, missing: 0, deviation: 0, major_deviation: 0, pending: 0 };
  for (const item of bidCase.value?.findings || []) counts[item.humanDecision || item.status] += 1;
  return Object.entries(counts).map(([key, count]) => ({ key, count, label: complianceLabel(key as ComplianceStatus) }));
});

async function saveMeta() {
  store.updateCaseMeta({ ...metaDraft });
  metaEditing.value = false;
  if (bidCase.value) await ensureWorkflow(bidCase.value);
}
function reviewField(fieldId: string, status: ReviewStatus) {
  store.reviewField(fieldId, fieldDrafts[fieldId] || '', status);
}
function reviewProduct(itemId: string) {
  store.reviewLineItem(itemId, productDrafts[itemId] || '', 'accepted');
  const pricing = linePricingDrafts[itemId] || { unitCostSar: 0, unitPriceSar: 0 };
  store.updateLinePricing(itemId, pricing.unitCostSar, pricing.unitPriceSar);
}
function setDocumentPurpose(documentId: string, event: Event) {
  const value = (event.target as HTMLSelectElement).value as SourceDocument['purpose'];
  store.updateDocumentPurpose(documentId, value);
}
function isFindingEditing(finding: ComplianceFinding): boolean {
  return finding.humanDecision === undefined || editingFindingIds.value.has(finding.id);
}

function editFinding(id: string) {
  editingFindingIds.value = new Set(editingFindingIds.value).add(id);
}

function saveFinding(id: string) {
  if (savingFindingId.value) return;
  const draft = findingDrafts[id];
  if (!draft) {
    notif.error(bt('saveDecisionFailed'));
    return;
  }
  savingFindingId.value = id;
  try {
    const saved = store.decideFinding(id, draft.decision, draft.clarification.trim());
    if (!saved) throw new Error(bt('saveDecisionFailed'));
    const next = new Set(editingFindingIds.value);
    next.delete(id);
    editingFindingIds.value = next;
    savedFindingId.value = id;
    notif.success(`${bt('decisionSaved')} · ${complianceLabel(draft.decision)}`);
    if (savedFindingTimer) window.clearTimeout(savedFindingTimer);
    savedFindingTimer = window.setTimeout(() => {
      if (savedFindingId.value === id) savedFindingId.value = '';
    }, 1_600);
  } catch (error: any) {
    notif.fromException(bt('saveDecisionFailed'), error);
  } finally {
    savingFindingId.value = '';
  }
}
function savePricing() {
  store.updatePricing({ ...pricingDraft });
  notif.success(bt('savePricing'));
}
function generateScenario() {
  store.updatePricing({ ...pricingDraft });
  const scenario = store.createScenario(scenarioName.value);
  if (scenario) selectedScenarioId.value = scenario.id;
}
function decide(decision: 'approved' | 'rejected' | 'returned' | 'more_information') {
  const result = store.decideCase(decision, selectedScenarioId.value || undefined, decisionComment.value);
  if (!result.ok) {
    notif.warn(result.blockers.join(i18nT('；')));
    return;
  }
  notif.success(decision === 'approved' ? i18nT('当前版本已批准并冻结，可以导出正式文件。') : i18nT('处理意见已记录。'));
}

function modifyBeforeApproval() {
  activeTab.value = 'documents';
  notif.info(i18nT('请修改字段、产品匹配或报价后重新进入审批；所有变更都会写入审计记录。'));
}

function alignLinePrices() {
  if (!selectedScenarioId.value || !store.allocateLinePrices(selectedScenarioId.value)) {
    notif.warn(i18nT('请先选择有效的报价场景。'));
    return;
  }
  syncDrafts();
  notif.success(i18nT('BOQ 客户单价已按成本权重分摊，并写入审计记录。'));
}

function browserDownloadArtifact(artifact: BidArtifact) {
  const blob = new Blob([artifact.content], { type: artifact.mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = artifact.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

async function exportArtifacts(selected?: BidArtifact[]) {
  if (bidCase.value?.decision.decision !== 'approved') {
    notif.warn(bt('outputLocked'));
    return;
  }
  if (selected && !selected.length) return;
  exportingArtifacts.value = true;
  try {
    const rootApi = (window as any).electronAPI;
    const solutionApi = rootApi?.solution;
    const bidDeskApi = rootApi?.bidDesk;
    if (solutionApi?.pickFolder && bidDeskApi?.exportPackage && bidCase.value) {
      const folderPath = await solutionApi.pickFolder({ title: i18nT('选择投标文件输出文件夹') });
      if (!folderPath) return;
      // contextBridge 会在进入 preload 方法前先克隆参数；Vue Proxy 在这一步就会
      // 抛 “An object could not be cloned”，因此必须在渲染层先冻结成纯数据快照。
      const exportPayload = JSON.parse(JSON.stringify({
        folderPath,
        bidCase: bidCase.value,
        locale: locale.value,
        artifactIds: selected?.map((artifact) => artifact.id),
      }));
      const result = await bidDeskApi.exportPackage(exportPayload);
      if (!result?.ok) throw new Error(result?.error || bt('exportFailed'));
      store.recordOutputs(result.paths || []);
      notif.success(`${bt('exportSuccess')} · ${folderPath}`);
      return;
    }
    for (const artifact of selected || artifacts.value) browserDownloadArtifact(artifact);
    notif.success(bt('exportSuccess'));
  } catch (error: any) {
    notif.fromException(bt('exportFailed'), error);
  } finally {
    exportingArtifacts.value = false;
  }
}

function exportAllArtifacts() {
  if (bidCase.value?.decision.decision !== 'approved') {
    notif.warn(bt('outputLocked'));
    return;
  }
  void exportArtifacts();
}

function exportOneArtifact(artifact: BidArtifact) {
  void exportArtifacts([artifact]);
}

async function onFilesSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  if (!files.length) return;
  const rootApi = (window as any).electronAPI;
  const documents = store.addDocuments(files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    path: rootApi?.getPathForFile ? rootApi.getPathForFile(file) : undefined,
  })));
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const document = documents[i];
    if (!document) continue;
    if (file.type.startsWith('image/')) {
      void analyzeImage(file, document);
      continue;
    }
    void parseDocument(document);
  }
  target.value = '';
}

async function parseDocument(document: SourceDocument) {
  const api = (window as any).electronAPI?.bidDesk;
  if (!api?.parseDocument || !document.path) {
    store.recordParsedDocument(document.id, { warnings: [i18nT('未取得真实文件路径，无法解析。')] }, true);
    return;
  }
  try {
    const result = await api.parseDocument({ path: document.path, name: document.name });
    if (Array.isArray(result?.pageImages) && result.pageImages.length) {
      const ocrPages: string[] = [];
      for (const pageImage of result.pageImages) {
        try {
          const text = await extractTextFromImageUrl(pageImage.dataUrl);
          if (text.trim()) ocrPages.push(i18nT("[第 {p0} 页 · OCR]\n{p1}", { p0: pageImage.page, p1: text.trim() }));
        } catch (error: any) {
          result.warnings = [
            ...(result.warnings || []),
            i18nT('第 {p0} 页视觉识别失败：{p1}', { p0: pageImage.page, p1: humanizeErrorMessage(error) }),
          ];
        }
      }
      result.text = `${result.text || ''}\n\n${ocrPages.join('\n\n')}`.trim();
      delete result.pageImages;
    }
    store.recordParsedDocument(document.id, result);
  } catch (error: any) {
    store.recordParsedDocument(document.id, { warnings: [humanizeErrorMessage(error)] }, true);
  }
}

let cachedVlmProvider = '';
async function resolveVlmProvider(api: any): Promise<string> {
  if (cachedVlmProvider) return cachedVlmProvider;
  try {
    const list = await api.chatProviders?.();
    cachedVlmProvider = (Array.isArray(list) ? list : []).find((provider: any) => provider?.supportsVision)?.name || 'openai';
  } catch {
    cachedVlmProvider = 'openai';
  }
  return cachedVlmProvider;
}

async function extractTextFromImageUrl(imageUrl: string): Promise<string> {
  const api = (window as any).electronAPI?.qiyeApi;
  if (!api?.vlm) throw new Error(i18nT('当前没有可用的视觉识别服务'));
  const result = await api.vlm({
    provider: await resolveVlmProvider(api),
    operation: 'extract_text',
    imageUrl,
    maxTokens: 1800,
  });
  return String(result?.text || '');
}

async function analyzeImage(file: File, document: SourceDocument) {
  try {
    const imageUrl = await fileToDataUrl(file);
    store.recordDocumentAnalysis(document.id, await extractTextFromImageUrl(imageUrl));
  } catch (error: any) {
    store.recordDocumentAnalysis(document.id, humanizeErrorMessage(error), true);
  }
}
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function shouldCreateOrUpgradeWorkflow(existing: any, definition: ReturnType<typeof bidDeskWorkflowDefinition>): boolean {
  if (!existing) return true;
  if (existing?.origin?.kind !== 'bid-desk') return false;
  return Number(existing.origin.definitionVersion || 0) < Number(definition.origin.definitionVersion);
}

function bidWorkflowMetadataChanged(existing: any, definition: ReturnType<typeof bidDeskWorkflowDefinition>): boolean {
  return existing?.origin?.kind === 'bid-desk'
    && (
      existing.name !== definition.name
      || existing.description !== definition.description
      || existing.origin.caseId !== definition.origin.caseId
    );
}

async function ensureWorkflow(targetCase: BidCase = bidCase.value as BidCase): Promise<boolean> {
  const api = (window as any).electronAPI;
  if (!targetCase || !api?.saveWorkflow || !api?.listWorkflows) {
    workflowConnected.value = false;
    notif.warn(bt('workflowUnavailable'));
    return false;
  }
  workflowBusy.value = true;
  try {
    const definition = bidDeskWorkflowDefinition(Date.now(), targetCase);
    const list = await api.listWorkflows();
    const existing = Array.isArray(list) ? list.find((item: any) => item.id === definition.id) : undefined;
    if (shouldCreateOrUpgradeWorkflow(existing, definition)) {
      await api.saveWorkflow(JSON.parse(JSON.stringify({
        ...definition,
        createdAt: Number(existing?.createdAt) || definition.createdAt,
      })));
    } else if (bidWorkflowMetadataChanged(existing, definition)) {
      await api.saveWorkflow(JSON.parse(JSON.stringify({
        ...existing,
        name: definition.name,
        description: definition.description,
        origin: definition.origin,
      })));
    }
    linkedWorkflowIds.value = new Set(linkedWorkflowIds.value).add(definition.id);
    if (targetCase.id === activeCaseId.value) workflowConnected.value = true;
    store.markWorkflowSaved(definition.id, targetCase.id);
    return true;
  } catch (error: any) {
    notif.fromException(bt('workflow'), error);
    return false;
  } finally {
    workflowBusy.value = false;
  }
}

async function syncAllBidWorkflows(): Promise<void> {
  const api = (window as any).electronAPI;
  if (!api?.saveWorkflow || !api?.listWorkflows) return;
  workflowBusy.value = true;
  try {
    const list = await api.listWorkflows();
    const existingById = new Map<string, any>(
      (Array.isArray(list) ? list : []).map((item: any) => [String(item.id), item]),
    );
    const nextIds = new Set<string>();
    for (const targetCase of cases.value) {
      const definition = bidDeskWorkflowDefinition(Date.now(), targetCase);
      const existing = existingById.get(definition.id);
      if (shouldCreateOrUpgradeWorkflow(existing, definition)) {
        const saved = await api.saveWorkflow({
          ...definition,
          createdAt: Number(existing?.createdAt) || definition.createdAt,
        });
        existingById.set(definition.id, saved || definition);
      } else if (bidWorkflowMetadataChanged(existing, definition)) {
        const saved = await api.saveWorkflow({
          ...existing,
          name: definition.name,
          description: definition.description,
          origin: definition.origin,
        });
        existingById.set(definition.id, saved || definition);
      }
      nextIds.add(definition.id);
      store.markWorkflowSaved(definition.id, targetCase.id);
    }
    linkedWorkflowIds.value = nextIds;
    const activeWorkflowId = bidCase.value
      ? bidDeskWorkflowDefinition(Date.now(), bidCase.value).id
      : '';
    workflowConnected.value = Boolean(activeWorkflowId && nextIds.has(activeWorkflowId));
  } catch (error: any) {
    workflowConnected.value = false;
    notif.fromException(bt('workflow'), error);
  } finally {
    workflowBusy.value = false;
  }
}

async function createBidCase() {
  if (creatingCase.value) return;
  creatingCase.value = true;
  try {
    const created = store.createCase();
    const linked = await ensureWorkflow(created);
    await ensureBidWorkspaceTask(created);
    notif.success(
      linked
        ? i18nT('投标项目和工作流已创建，并已登记到工作区')
        : i18nT('投标项目已创建，并已登记到工作区'),
    );
  } catch (error: any) {
    notif.fromException(i18nT('创建投标项目失败'), error);
  } finally {
    creatingCase.value = false;
  }
}

async function ensureBidWorkspaceTask(targetCase: BidCase): Promise<void> {
  const definition = bidDeskWorkflowDefinition(Date.now(), targetCase);
  await registerWorkspaceTask({
    departmentName: i18nT('投标项目'),
    departmentDescription: i18nT('招标文件解析、符合性检查、商业报价、审批与投标文件输出任务。'),
    taskName: definition.name,
    description: definition.description,
    members: ['general_assistant'],
    origin: {
      kind: 'bid-desk',
      id: `${targetCase.id}:${targetCase.createdAt}`,
      label: i18nT('项目工作台'),
      route: '/bid-desk',
    },
  });
}

async function openLinkedWorkflow() {
  if (!bidCase.value || !(await ensureWorkflow(bidCase.value))) return;
  const workflowId = bidDeskWorkflowDefinition(Date.now(), bidCase.value).id;
  await router.push({
    path: '/cluster-workflows',
    query: { wf: workflowId, view: 'edit', source: 'bid-desk' },
  });
}

async function openWorkflowRun() {
  const api = (window as any).electronAPI;
  if (!api?.saveWorkflow || !api?.runWorkflow || !bidCase.value) {
    notif.warn(bt('workflowUnavailable'));
    return;
  }
  if (bidCase.value.id === REFERENCE_BID_CASE_ID && !(await ensureDemoSourceFiles())) return;
  if (!(await ensureWorkflow(bidCase.value))) return;
  try {
    await ensureBidWorkspaceTask(bidCase.value);
  } catch (error: any) {
    notif.fromException(i18nT('登记工作区任务失败'), error);
    return;
  }
  const definition = bidDeskWorkflowDefinition(Date.now(), bidCase.value);
  const caseId = bidCase.value.id;
  store.prepareWorkflowRun(definition.id, caseId);
  setWorkflowAutoRun(definition.id, {
    caseId,
    bidCaseId: caseId,
    workflowSource: 'bid-desk',
    returnPath: '/bid-desk',
    customer: bidCase.value.customer,
    project: bidCase.value.project,
    documents: JSON.stringify(bidCase.value.documents.map((doc) => ({
      name: doc.name,
      path: doc.path,
      kind: doc.kind,
      language: doc.language,
      parseStatus: doc.parseStatus,
    }))),
    pricing: JSON.stringify(currentScenario.value || bidCase.value.pricingInput),
    knowledge: JSON.stringify(store.retrieveKnowledge(
      `${bidCase.value.project} ${bidCase.value.lineItems.map((item) => `${item.description} ${item.model}`).join(' ')}`,
      8,
      caseId,
    )),
    clientLocale: locale.value,
  });
  await router.push({ path: '/workflow' });
}

let cleanupWorkflow: (() => void) | null = null;
onMounted(async () => {
  await store.hydrate();
  syncDrafts();
  const api = (window as any).electronAPI;
  await ensureDemoSourceFiles(false);
  workflowAvailable.value = Boolean(api?.saveWorkflow && api?.listWorkflows && api?.runWorkflow);
  if (api?.onWorkflowEvent) cleanupWorkflow = api.onWorkflowEvent((event: any) => store.applyWorkflowEvent(event));
  if (workflowAvailable.value) await syncAllBidWorkflows();
});
onUnmounted(() => {
  cleanupWorkflow?.();
  if (savedFindingTimer) window.clearTimeout(savedFindingTimer);
});

async function ensureDemoSourceFiles(notifyFailure = true): Promise<boolean> {
  const api = (window as any).electronAPI?.solution;
  if (!api?.prepareBidDemoFiles) {
    if (notifyFailure) notif.warn(i18nT('当前版本尚未提供项目源文件写入能力'));
    return false;
  }
  try {
    const prepared = await api.prepareBidDemoFiles();
    const documents = Array.isArray(prepared?.documents) ? prepared.documents : [];
    if (!documents.length) throw new Error(i18nT('未生成招标源文件'));
    store.attachDemoDocuments(documents);
    return true;
  } catch (error: any) {
    if (notifyFailure) notif.fromException(i18nT('创建中文招标源文件失败'), error);
    return false;
  }
}

async function resetDemoData() {
  store.resetDemo();
  syncDrafts();
  await ensureDemoSourceFiles();
  await syncAllBidWorkflows();
}

function money(value: number) {
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : locale.value, {
    style: 'currency', currency: 'SAR', maximumFractionDigits: 0,
  }).format(value);
}
function percent(value: number) { return `${(value * 100).toFixed(1)}%`; }
function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
function formatDate(value: number) { return new Date(value).toLocaleString(locale.value === 'ar' ? 'ar-SA' : locale.value); }
/**
 * 内置演示案例（createCompletedDemoCase / seedCase）的文案在创建时按当时界面语言落盘，切换语言后会残留中文。
 * 显示时按词典精确匹配翻译：只命中词典里登记过的内置文案，用户自己录入的客户名、文件名等不在词典里，原样显示。
 */
function displayText(value: unknown): string { return localizeBuiltinText(String(value ?? ''), i18nT); }

function documentName(id: string) { const name = bidCase.value?.documents.find((item) => item.id === id)?.name; return name ? displayText(name) : id; }
function evidenceLabel(evidence?: EvidenceAnchor) {
  if (!evidence) return '—';
  if (evidence.sheet) return `${documentName(evidence.fileId)} · ${evidence.sheet}!${evidence.cell || ''}`;
  return `${documentName(evidence.fileId)}${evidence.page ? ` · p.${evidence.page}` : ''}`;
}
function documentIcon(kind: SourceDocument['kind']) {
  return {
    pdf: 'ri-file-pdf-2-line', word: 'ri-file-word-2-line', excel: 'ri-file-excel-2-line',
    image: 'ri-image-line', other: 'ri-file-line',
  }[kind];
}
function artifactIcon(kind: BidArtifactKind) {
  return {
    html: 'ri-file-code-line',
    csv: 'ri-file-excel-2-line',
    markdown: 'ri-markdown-line',
    json: 'ri-braces-line',
  }[kind];
}
function parseLabel(status: SourceDocument['parseStatus']) {
  if (status === 'completed') return bt('parseCompleted');
  if (status === 'review') return bt('parseReview');
  if (status === 'failed') return bt('stageFailed');
  return bt('parseQueued');
}
function stageIcon(status: BidWorkflowStage['status']) {
  return {
    pending: 'ri-time-line', running: 'ri-loader-2-line spin', waiting_human: 'ri-user-voice-line',
    completed: 'ri-check-line', failed: 'ri-close-line',
  }[status];
}
function stageStatusLabel(status: BidWorkflowStage['status']) {
  return {
    pending: bt('stagePending'), running: bt('stageRunning'), waiting_human: bt('stageWaiting'),
    completed: bt('stageCompleted'), failed: bt('stageFailed'),
  }[status];
}
function stageName(stage: BidWorkflowStage) {
  return {
    document_analysis: bt('stageIngest'),
    field_review: bt('stageFieldReview'),
    compliance_analysis: bt('stageCompliance'),
    commercial_review: bt('stageCommercial'),
    decision_card: bt('stageDecision'),
    final_approval: bt('stageApproval'),
    document_output: bt('stageOutput'),
  }[stage.nodeId] || stage.name;
}
function statusLabel(status: BidCaseStatus) {
  const labels: Record<BidCaseStatus, string> = {
    new: bt('statusNew'),
    under_review: bt('statusUnderReview'),
    clarification_required: bt('statusClarification'),
    pricing: bt('statusPricing'),
    pending_approval: bt('statusPendingApproval'),
    approved: bt('statusApproved'),
    submitted: bt('statusSubmitted'),
    closed: bt('statusClosed'),
  };
  return labels[status];
}
function decisionLabel(decision: 'draft' | 'approved' | 'rejected' | 'returned' | 'more_information') {
  return {
    draft: bt('decisionDraft'),
    approved: bt('decisionApproved'),
    rejected: bt('decisionRejected'),
    returned: bt('decisionReturned'),
    more_information: bt('moreInformation'),
  }[decision];
}
function auditActionLabel(action: string) {
  const zhLabels: Record<string, string> = {
    'workflow.completed': i18nT('真实工作流已完成'),
    'workflow.started': i18nT('真实工作流已启动'),
    'workflow.queued': i18nT('已提交工作流'),
    'workflow.saved': i18nT('已关联工作流'),
    'workflow.failed': i18nT('真实工作流失败'),
    'artifacts.prepared': i18nT('业务文件已生成'),
    'decision.approved': i18nT('管理层已批准'),
    'decision.rejected': i18nT('管理层已拒绝'),
    'decision.returned': i18nT('已退回复核'),
    'decision-card.prepared': i18nT('管理决策卡已生成'),
    'compliance.deviation-approved': i18nT('偏离项已批准'),
    'compliance.completed': i18nT('符合性分析已完成'),
    'compliance.decided': i18nT('符合性结论已更新'),
    'documents.added': i18nT('招标文件已接收'),
    'documents.provisioned': i18nT('中文招标源文件已创建'),
    'document.added': i18nT('来源文件已添加'),
    'document.extracted': i18nT('招标文件已解析'),
    'document.vlm-extracted': i18nT('文件识别已完成'),
    'document.analysis-failed': i18nT('文件识别失败'),
    'fields.reviewed': i18nT('关键字段已复核'),
    'field.reviewed': i18nT('关键字段已复核'),
    'line-item.reviewed': i18nT('品项匹配已复核'),
    'case.created': i18nT('投标项目已创建'),
    'case.metadata-updated': i18nT('项目信息已更新'),
    'pricing.input-updated': i18nT('报价参数已更新'),
    'pricing.scenario-created': i18nT('报价场景已生成'),
    'pricing.scenarios-created': i18nT('报价场景已生成'),
    'artifacts.exported': i18nT('正式文件已导出'),
    'decision.more_information': i18nT('已要求补充资料'),
    'document.purpose-updated': i18nT('文件用途已调整'),
    'line-item.pricing-updated': i18nT('品项成本与售价已更新'),
    'line-item.pricing-allocated': i18nT('BOQ 单价已分摊'),
    'workflow.document-analysis-backfilled': i18nT('解析结果已回写'),
    'workflow.compliance-backfilled': i18nT('符合性结果已回写'),
    'workflow.cancelled': i18nT('工作流已停止'),
  };
  return i18nT(zhLabels[action] || action);
}
function complianceLabel(status: ComplianceStatus) {
  const labels: Record<ComplianceStatus, Record<string, string>> = {
    compliant: { 'zh-CN': i18nT('符合'), 'en-US': 'Compliant', ar: 'مطابق' },
    conditional: { 'zh-CN': i18nT('条件符合'), 'en-US': 'Conditional', ar: 'مطابق بشروط' },
    missing: { 'zh-CN': i18nT('缺失'), 'en-US': 'Missing', ar: 'مفقود' },
    deviation: { 'zh-CN': i18nT('偏离'), 'en-US': 'Deviation', ar: 'انحراف' },
    major_deviation: { 'zh-CN': i18nT('重大偏离'), 'en-US': 'Major deviation', ar: 'انحراف جوهري' },
    pending: { 'zh-CN': i18nT('待确认'), 'en-US': 'Pending', ar: 'قيد المراجعة' },
  };
  return labels[status][locale.value];
}
</script>

<style scoped>
.bid-desk {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  box-sizing: border-box;
  padding: 24px 28px 48px;
  color: var(--color-text-primary, #182230);
  background:
    radial-gradient(circle at 82% 0%, rgba(72, 88, 255, .09), transparent 30%),
    var(--color-bg-primary, #f6f8fc);
}
.bid-header, .workflow-band-head, .panel-head, .finding-top, .decision-card-head {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.bid-header { max-width: 1480px; margin: 0 auto 18px; }
.bid-title { display: flex; align-items: center; gap: 14px; }
.bid-logo { width: 46px; height: 46px; display: grid; place-items: center; border-radius: 14px; color: #fff; font-size: 22px; background: linear-gradient(135deg, #6258f5, #3185ff); box-shadow: 0 10px 28px rgba(80, 82, 240, .25); }
.bid-title h1 { margin: 0; font-size: 23px; letter-spacing: -.02em; }
.bid-title p { margin: 4px 0 0; color: var(--color-text-secondary, #657085); font-size: 13px; }
.header-actions, .workflow-actions, .panel-actions, .decision-actions { display: flex; align-items: center; gap: 10px; }
.btn { border: 1px solid transparent; border-radius: 10px; padding: 9px 14px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 13px; font-weight: 650; cursor: pointer; transition: .18s ease; }
.btn:hover { transform: translateY(-1px); }
.btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.btn.primary { color: #fff; background: linear-gradient(135deg, #6258f5, #4b7cff); box-shadow: 0 7px 18px rgba(82, 80, 240, .2); }
.btn.secondary { color: #4f55c8; border-color: #d7d9fa; background: #f2f3ff; }
.btn.ghost { color: var(--color-text-primary, #263246); border-color: var(--color-border, #dfe4ee); background: var(--color-bg-card, #fff); }
.btn.danger { color: #b42318; border-color: #f4c7c3; background: #fff4f3; }
.btn.compact { padding: 7px 10px; font-size: 12px; border-radius: 8px; }
.workflow-result-hint { color: var(--color-text-secondary, #697489); font-size: 11px; }
.bid-body { max-width: 1480px; margin: 0 auto; }
.case-hero { position: relative; overflow: hidden; padding: 22px 24px; border: 1px solid rgba(92, 99, 215, .18); border-radius: 18px; background: linear-gradient(115deg, rgba(255,255,255,.98), rgba(243,247,255,.96)); box-shadow: 0 15px 40px rgba(37, 50, 88, .08); }
.case-hero::after { content: ''; position: absolute; width: 260px; height: 260px; inset-inline-end: -80px; top: -150px; border-radius: 50%; border: 35px solid rgba(79, 90, 244, .06); }
.case-identity { display: flex; align-items: center; gap: 9px; position: relative; z-index: 1; }
.case-selector { min-width: 310px; border: 0; background: transparent; color: #4f5de4; font-weight: 700; font-size: 13px; outline: none; }
.status-pill, .version-pill, .parse-queued, .parse-parsing, .parse-review, .parse-completed, .parse-failed { padding: 4px 8px; border-radius: 999px; font-size: 10px; font-weight: 750; text-transform: uppercase; letter-spacing: .04em; }
.status-pill { color: #6941c6; background: #f2edff; }
.status-approved { color: #087443; background: #e9fbf2; }
.status-clarification_required { color: #b54708; background: #fff5e5; }
.version-pill { color: #596780; background: #edf1f7; }
.case-copy { margin-top: 14px; position: relative; z-index: 1; }
.case-copy h2 { margin: 0; font-size: 24px; }
.case-copy p { margin: 5px 0 0; color: #657085; }
.case-meta { margin-top: 20px; display: flex; gap: 30px; position: relative; z-index: 1; }
.case-meta div { display: grid; gap: 3px; }
.case-meta span, .section-kicker, .metric span, .summary-list dt, .finding-columns span, .scenario-numbers span, .decision-metrics span, .decision-scenario span, .comment-field span, .pricing-form label > span { color: var(--color-text-secondary, #707b90); font-size: 11px; }
.case-meta strong { font-size: 13px; }
.metric-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.metric { display: flex; align-items: center; gap: 11px; padding: 14px 16px; border: 1px solid var(--color-border, #e2e6ee); border-radius: 14px; background: var(--color-bg-card, #fff); }
.metric-icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; font-size: 17px; }
.metric-icon.blue { color: #2e69df; background: #eaf1ff; }.metric-icon.amber { color: #b86b00; background: #fff4d9; }.metric-icon.red { color: #c83532; background: #fff0ef; }.metric-icon.green { color: #16845b; background: #e8f8f1; }.metric-icon.violet { color: #6c55d7; background: #f0edff; }
.metric > div { display: grid; gap: 2px; min-width: 0; }
.metric strong { font-size: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.workflow-band { margin-top: 14px; padding: 15px 18px; border: 1px solid #dfe3f8; border-radius: 15px; background: linear-gradient(100deg, #fbfbff, #f3f5ff); }
.workflow-band-head > div:first-child { display: grid; gap: 3px; }
.workflow-band-head strong { font-size: 13px; }
.stage-track { margin-top: 14px; display: flex; align-items: center; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
.stage { display: flex; align-items: center; gap: 8px; min-width: 135px; }
.stage-dot { flex: none; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; color: #78839a; background: #eaedf4; }
.stage > div { display: grid; gap: 1px; }
.stage strong { font-size: 11px; white-space: nowrap; }.stage small { color: #778196; font-size: 9px; }
.stage-arrow { color: #c2c8d6; }
.stage-running .stage-dot { color: #fff; background: #665cf5; }.stage-completed .stage-dot { color: #fff; background: #20a66b; }.stage-waiting_human .stage-dot { color: #8a4b00; background: #ffe5a3; }.stage-failed .stage-dot { color: #fff; background: #d84b45; }
.bid-tabs { margin-top: 18px; display: flex; gap: 5px; padding: 5px; border: 1px solid var(--color-border, #e0e5ee); border-radius: 13px; background: var(--color-bg-card, #fff); overflow-x: auto; }
.bid-tabs button { flex: 1; min-width: 135px; border: 0; padding: 10px 12px; border-radius: 9px; display: flex; align-items: center; justify-content: center; gap: 7px; color: #697489; background: transparent; font-size: 12px; font-weight: 650; cursor: pointer; }
.bid-tabs button.active { color: #4e50d9; background: #eeefff; }
.tab-badge { min-width: 18px; height: 18px; display: inline-grid; place-items: center; padding: 0 5px; border-radius: 999px; color: #fff; background: #f04438; font-size: 9px; }
.tab-panel { margin-top: 14px; }
.content-grid { display: grid; gap: 14px; }.content-grid.two { grid-template-columns: 1.15fr .85fr; }.content-grid.lower { margin-top: 14px; }.content-grid.pricing-layout { grid-template-columns: 1.15fr .85fr; }
.panel, .decision-card { border: 1px solid var(--color-border, #e0e5ee); border-radius: 15px; background: var(--color-bg-card, #fff); box-shadow: 0 8px 25px rgba(31, 43, 75, .045); }
.panel { padding: 18px; }.panel-head { margin-bottom: 14px; }.panel-head > div { display: grid; gap: 3px; }.panel-head h3 { margin: 0; font-size: 17px; }.section-kicker { text-transform: uppercase; letter-spacing: .06em; font-weight: 750; color: #5959dd; }
.link-btn, .evidence-link { border: 0; padding: 0; color: #5658da; background: transparent; cursor: pointer; font-size: 11px; }
.summary-list { margin: 0; }.summary-list > div { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 10px 0; border-bottom: 1px solid #edf0f5; }.summary-list > div:last-child { border: 0; }.summary-list dd { margin: 0; font-size: 13px; font-weight: 650; text-align: end; }
.capability-panel { background: linear-gradient(135deg, #171b3f, #2e3170); color: #fff; }.capability-panel .section-kicker, .capability-panel p { color: #c8ccf9; }.capability-icon { color: #9fa7ff; font-size: 27px; }.capability-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 17px; }.capability-chips span { padding: 6px 8px; border: 1px solid rgba(255,255,255,.16); border-radius: 8px; color: #eef0ff; background: rgba(255,255,255,.07); font-size: 10px; }
.compact-list { display: grid; gap: 7px; }.doc-row { display: grid; grid-template-columns: 28px 1fr auto; gap: 9px; align-items: center; padding: 8px 0; border-bottom: 1px solid #eef1f5; }.doc-row > i { font-size: 20px; color: #5f65db; }.doc-row > div { display: grid; gap: 2px; }.doc-row strong { font-size: 12px; }.doc-row small { color: #828ba0; font-size: 10px; }
.parse-queued, .parse-parsing { color: #6d778c; background: #edf0f5; }.parse-review { color: #a15c00; background: #fff2d2; }.parse-completed { color: #087443; background: #e8f8ef; }.parse-failed { color: #b42318; background: #fff0ef; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }.form-grid label, .pricing-form label, .comment-field, .decision-scenario { display: grid; gap: 5px; }.form-grid input, .pricing-form input, .finding-decision input, .finding-decision select, .data-table input, .decision-scenario select, textarea, .scenario-name { width: 100%; box-sizing: border-box; border: 1px solid #dfe4ec; border-radius: 8px; padding: 8px 10px; color: var(--color-text-primary, #202b3c); background: var(--color-bg-primary, #fbfcfe); outline: none; font: inherit; font-size: 12px; }.form-grid input:focus, .pricing-form input:focus, .data-table input:focus, textarea:focus { border-color: #7776ee; box-shadow: 0 0 0 3px rgba(98, 88, 245, .1); }.form-action { display: flex; align-items: end; }
.upload-panel, .table-panel { margin-bottom: 14px; }.file-button input { display: none; }.doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); gap: 10px; }.doc-card { display: grid; grid-template-columns: 35px 1fr auto; gap: 10px; align-items: center; padding: 12px; border: 1px solid #e7eaf0; border-radius: 10px; }.doc-card > i { font-size: 24px; color: #5f65db; }.doc-card > div { min-width: 0; }.doc-card strong { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }.doc-card p { margin: 3px 0 0; color: #828ba0; font-size: 10px; }
.purpose-select { max-width: 170px; margin-top: 7px; padding: 5px 7px; border: 1px solid #dfe4ec; border-radius: 7px; color: #526078; background: #f8f9fc; font-size: 10px; }
.document-warning { display: block; margin-top: 6px; color: #a15c00; font-size: 9px; line-height: 1.4; }
.data-table { min-width: 760px; }.table-panel { overflow-x: auto; }.table-row { display: grid; align-items: center; gap: 12px; min-height: 49px; padding: 8px 10px; border-bottom: 1px solid #eceff4; font-size: 11px; }.table-row.fields { grid-template-columns: 1.05fr 1.7fr .75fr 1.3fr 70px; }.table-row.items { min-width: 1120px; grid-template-columns: 1.8fr .55fr 1.15fr .7fr .7fr 1.1fr 36px; }.table-head { color: #697489; background: #f7f8fb; font-weight: 750; text-transform: uppercase; letter-spacing: .04em; }.field-key { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #4f55b6; }.confidence { position: relative; overflow: hidden; padding: 4px 7px; border-radius: 999px; background: #eef1f5; font-size: 9px; }.confidence i { position: absolute; inset: 0 auto 0 0; background: rgba(52, 168, 113, .17); }.row-actions { display: flex; gap: 5px; }.icon-action { width: 28px; height: 28px; border: 0; border-radius: 8px; cursor: pointer; }.icon-action.success { color: #087443; background: #e8f8ef; }.icon-action.danger { color: #b42318; background: #fff0ef; }.table-row span > small { display: block; margin-top: 3px; color: #8992a5; }
.risk-summary { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 12px; }.risk-count { padding: 13px; display: grid; gap: 2px; border-radius: 12px; border: 1px solid #e1e5ed; background: #fff; }.risk-count strong { font-size: 21px; }.risk-count span { color: #737d91; font-size: 10px; }.risk-major_deviation, .risk-deviation { border-color: #f1c6c3; background: #fff6f5; }.risk-missing, .risk-conditional { border-color: #f2deb0; background: #fffaf0; }.risk-compliant { border-color: #bee7d3; background: #f3fbf7; }
.finding-list { display: grid; gap: 12px; }.finding-card { padding: 17px; border: 1px solid #e0e5ee; border-inline-start-width: 4px; border-radius: 13px; background: #fff; }.severity-low { border-inline-start-color: #5ea77d; }.severity-medium { border-inline-start-color: #e4aa33; }.severity-high, .severity-critical { border-inline-start-color: #e0524d; }.finding-top h3 { margin: 6px 0 0; font-size: 15px; }.severity-pill { padding: 3px 6px; border-radius: 5px; color: #8f3b36; background: #fff0ef; font-size: 9px; font-weight: 750; text-transform: uppercase; }.finding-status { padding: 6px 9px; border-radius: 8px; color: #5947a8; background: #f0edff; font-size: 10px; font-weight: 750; }.finding-columns { margin-top: 14px; display: grid; grid-template-columns: 1.4fr .6fr; gap: 18px; }.finding-columns p { margin: 5px 0 0; font-size: 12px; line-height: 1.55; }.finding-decision { margin-top: 14px; display: grid; grid-template-columns: 170px 1fr auto; gap: 8px; padding-top: 13px; border-top: 1px solid #edf0f5; }
.finding-card {
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.finding-card.conclusion-saved {
  background: color-mix(in srgb, #f7fffb 56%, #fff);
}
.finding-card.just-saved {
  border-color: color-mix(in srgb, #19a66a 58%, #dce5df);
  box-shadow: 0 0 0 3px rgba(25, 166, 106, .09), 0 10px 28px rgba(24, 94, 66, .08);
}
.finding-save-btn { min-width: 105px; justify-content: center; }
.finding-conclusion {
  margin-top: 14px; display: grid; grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center; gap: 10px; padding: 11px 12px;
  border: 1px solid rgba(25, 166, 106, .2); border-radius: 10px;
  background: rgba(25, 166, 106, .06);
}
.finding-conclusion-icon {
  display: grid; width: 30px; height: 30px; place-items: center;
  border-radius: 9px; color: #15955e; background: rgba(25, 166, 106, .12); font-size: 18px;
}
.finding-conclusion-copy { min-width: 0; }
.finding-conclusion-copy > span {
  display: block; color: #188258; font-size: 10px; font-weight: 750;
}
.finding-conclusion-copy strong {
  display: inline-block; margin-top: 2px; color: var(--color-text-primary, #202b3c); font-size: 12px;
}
.finding-conclusion-copy p {
  overflow: hidden; margin: 3px 0 0; color: var(--color-text-secondary, #647084);
  font-size: 11px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap;
}
.pricing-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }.number-input { position: relative; }.number-input small { position: absolute; inset-inline-end: 8px; top: 9px; color: #8b94a7; }.panel-actions { margin-top: 16px; }.scenario-name { max-width: 150px; }.scenario-panel { align-self: start; }.scenario-card { padding: 14px; border: 1px solid #e3e7ef; border-radius: 11px; margin-bottom: 10px; }.scenario-card.warning { border-color: #f0c47b; background: #fffaf0; }.scenario-title { display: flex; justify-content: space-between; }.scenario-title small { color: #838da1; }.scenario-numbers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }.scenario-numbers > div { display: grid; gap: 3px; }.scenario-numbers strong { font-size: 14px; }.rule-alert { margin: 12px 0 0; color: #a55c00; font-size: 10px; }
.decision-layout { display: grid; grid-template-columns: 1.15fr .85fr; gap: 14px; }.decision-card { padding: 22px; color: #fff; background: linear-gradient(140deg, #171b3d, #303576); border: 0; }.decision-card .section-kicker { color: #aeb5ff; }.decision-card h2 { margin: 4px 0 0; }.decision-state { padding: 6px 9px; border-radius: 8px; background: rgba(255,255,255,.12); font-size: 10px; text-transform: uppercase; }.decision-approved { color: #b9f8d6; }.decision-metrics { margin-top: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }.decision-metrics > div { display: grid; gap: 4px; padding: 12px; border: 1px solid rgba(255,255,255,.11); border-radius: 10px; background: rgba(255,255,255,.055); }.decision-metrics span, .decision-scenario span, .comment-field span { color: #b7bdd8; }.decision-metrics strong { font-size: 17px; }.decision-evidence { margin: 14px 0; display: flex; gap: 20px; color: #c9cee6; font-size: 11px; }.decision-evidence p { margin: 0; }.decision-evidence i { margin-inline-end: 5px; color: #9fa7ff; }.decision-scenario select, .comment-field textarea { color: #fff; border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.08); }.comment-field { margin-top: 12px; }.decision-actions { margin-top: 14px; justify-content: flex-end; }.output-panel p { color: #687389; font-size: 12px; line-height: 1.5; }.output-panel ul { padding: 0; list-style: none; }.output-panel li { padding: 10px 0; display: flex; align-items: center; gap: 9px; border-bottom: 1px solid #eceff4; font-size: 12px; }.output-panel li i { color: #5c61dc; font-size: 17px; }.artifact-list li > div { min-width: 0; flex: 1; display: grid; gap: 2px; }.artifact-list li strong, .artifact-list li small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.artifact-list li small { color: #818a9b; font-size: 9px; }.artifact-list .link-btn { flex-shrink: 0; font-size: 10px; }.output-lock { margin-top: 15px; padding: 10px; border-radius: 9px; color: #755100; background: #fff4d7; font-size: 10px; }
.decision-summary { margin: 14px 0; padding: 12px; border: 1px solid rgba(255,255,255,.12); border-radius: 10px; background: rgba(255,255,255,.05); }
.decision-summary > strong { color: #bfc4ff; font-size: 11px; }.decision-summary p { margin: 5px 0; color: #f2f3ff; font-size: 12px; line-height: 1.5; }.decision-summary-list { display: grid; gap: 5px; margin-top: 8px; }.decision-summary-list span { color: #ffd9ad; font-size: 10px; }.decision-summary-list i { margin-inline-end: 5px; }
.approval-blockers { display: grid; gap: 5px; margin-top: 12px; padding: 10px 12px; border: 1px solid rgba(255,180,100,.28); border-radius: 9px; color: #ffe1ba; background: rgba(132,70,12,.2); font-size: 10px; }.approval-blockers strong { margin-bottom: 2px; }.approval-blockers span::before { content: '•'; margin-inline-end: 6px; }
.audit-list { display: grid; }.audit-row { position: relative; display: grid; grid-template-columns: 16px 1fr; gap: 9px; padding: 0 0 16px; }.audit-row::after { content: ''; position: absolute; width: 1px; inset-inline-start: 5px; top: 12px; bottom: 0; background: #dfe4ec; }.audit-row:last-child::after { display: none; }.audit-dot { width: 11px; height: 11px; margin-top: 3px; border: 3px solid #dfe0ff; border-radius: 50%; background: #6561e7; z-index: 1; }.audit-row strong { font-size: 11px; }.audit-row p { margin: 3px 0; color: #6e788c; font-size: 11px; }.audit-row small { color: #9299a8; font-size: 9px; }.audit-title { display: flex; justify-content: space-between; }.audit-title span { color: #8790a1; font-size: 9px; }.audit-row details { margin-top: 7px; }.audit-row pre { max-height: 220px; overflow: auto; padding: 9px; border-radius: 8px; background: #f5f6f9; font-size: 9px; }.audit-list.mini .audit-row { padding-bottom: 10px; }.empty { color: #8a93a6; text-align: center; padding: 28px; font-size: 12px; }
.modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 30px; background: rgba(15, 21, 40, .46); backdrop-filter: blur(5px); }.evidence-modal { width: min(620px, 90vw); max-height: 75vh; overflow: auto; padding: 20px; border-radius: 15px; background: #fff; box-shadow: 0 28px 80px rgba(0,0,0,.2); }.evidence-modal article { padding: 12px 0; border-top: 1px solid #eceff4; }.evidence-modal article p { color: #727d91; font-size: 11px; }.evidence-modal blockquote { margin: 8px 0 0; padding: 10px 12px; border-inline-start: 3px solid #6a67ea; color: #39445a; background: #f5f6fb; font-size: 12px; line-height: 1.6; }
.artifact-modal { width: min(1040px, 94vw); height: min(780px, 88vh); display: flex; flex-direction: column; gap: 14px; padding: 20px; border-radius: 16px; background: var(--color-bg-card, #fff); box-shadow: 0 28px 80px rgba(0,0,0,.25); }
.artifact-modal-head { flex: none; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.artifact-modal-title { min-width: 0; display: grid; gap: 3px; }
.artifact-modal-title h3 { overflow: hidden; margin: 0; font-size: 17px; text-overflow: ellipsis; white-space: nowrap; }
.artifact-modal-actions { flex: none; display: flex; align-items: center; gap: 8px; }
.artifact-close { width: 34px; height: 34px; flex: none; display: grid; place-items: center; padding: 0; border: 1px solid var(--color-border, #dfe4ee); border-radius: 9px; color: #59657a; background: var(--color-bg-card, #fff); cursor: pointer; font-size: 18px; transition: .18s ease; }
.artifact-close:hover { color: #353ac7; border-color: #c9cdfa; background: #f2f3ff; }
.artifact-frame, .artifact-source { min-height: 0; flex: 1; width: 100%; border: 1px solid var(--color-border, #dfe4ee); border-radius: 11px; background: #fff; }.artifact-source { box-sizing: border-box; overflow: auto; margin: 0; padding: 18px; color: #263246; white-space: pre-wrap; direction: ltr; text-align: start; font-size: 11px; line-height: 1.6; }

/* Theme-complete surfaces.
 * Bid Desk was originally designed with many literal light colors. Keep the
 * semantic status hues, but derive every business surface and divider from
 * the app theme so explicit dark mode and system dark mode behave identically. */
.case-hero {
  border-color: color-mix(in srgb, var(--color-brand) 24%, var(--color-border));
  background: linear-gradient(
    115deg,
    color-mix(in srgb, var(--color-bg-card) 97%, var(--color-brand) 3%),
    color-mix(in srgb, var(--color-bg-card) 90%, var(--color-brand) 10%)
  );
  box-shadow: var(--shadow-md);
}
.case-selector,
.case-selector option {
  color: var(--color-brand);
  background: var(--color-bg-card);
}
.case-copy p,
.stage small,
.bid-tabs button,
.doc-row small,
.doc-card p,
.risk-count span,
.scenario-title small,
.number-input small,
.output-panel p,
.artifact-list li small,
.audit-row p,
.audit-row small,
.audit-title span,
.evidence-modal article p {
  color: var(--color-text-secondary);
}
.btn.secondary {
  color: var(--color-brand);
  border-color: color-mix(in srgb, var(--color-brand) 32%, var(--color-border));
  background: var(--color-brand-subtle);
}
.btn.danger,
.icon-action.danger {
  color: var(--color-status-danger-fg);
  border-color: color-mix(in srgb, var(--color-danger) 34%, var(--color-border));
  background: var(--color-status-danger-bg);
}
.status-pill,
.finding-status {
  color: var(--color-brand);
  background: var(--color-brand-subtle);
}
.status-approved,
.parse-completed,
.icon-action.success {
  color: var(--color-status-success-fg);
  background: var(--color-status-success-bg);
}
.status-clarification_required,
.parse-review {
  color: var(--color-status-warning-fg);
  background: var(--color-status-warning-bg);
}
.version-pill,
.parse-queued,
.parse-parsing,
.confidence {
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
}
.parse-failed,
.severity-pill {
  color: var(--color-status-danger-fg);
  background: var(--color-status-danger-bg);
}
.metric-icon.blue { color: var(--color-info); background: var(--color-status-info-bg); }
.metric-icon.amber { color: var(--color-warning); background: var(--color-status-warning-bg); }
.metric-icon.red { color: var(--color-danger); background: var(--color-status-danger-bg); }
.metric-icon.green { color: var(--color-success); background: var(--color-status-success-bg); }
.metric-icon.violet { color: var(--color-brand); background: var(--color-brand-subtle); }
.workflow-band {
  border-color: color-mix(in srgb, var(--color-brand) 22%, var(--color-border));
  background: linear-gradient(
    100deg,
    color-mix(in srgb, var(--color-bg-card) 96%, var(--color-brand) 4%),
    color-mix(in srgb, var(--color-bg-card) 90%, var(--color-brand) 10%)
  );
}
.stage-dot { color: var(--color-text-secondary); background: var(--color-bg-active); }
.stage-arrow { color: var(--color-text-muted); }
.bid-tabs button.active {
  color: var(--color-brand);
  background: var(--color-brand-subtle);
}
.section-kicker,
.link-btn,
.evidence-link,
.doc-row > i,
.doc-card > i,
.field-key,
.output-panel li i {
  color: var(--color-brand);
}
.summary-list > div,
.doc-row,
.table-row,
.finding-decision,
.output-panel li,
.evidence-modal article {
  border-color: var(--color-divider);
}
.doc-card,
.risk-count,
.finding-card,
.scenario-card {
  border-color: var(--color-border);
  background: var(--color-bg-card);
}
.form-grid input,
.pricing-form input,
.finding-decision input,
.finding-decision select,
.data-table input,
.decision-scenario select,
textarea,
.scenario-name,
.purpose-select {
  color: var(--color-text-primary);
  border-color: var(--color-border);
  background: var(--color-bg-input);
}
.table-head {
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
}
.risk-major_deviation,
.risk-deviation {
  border-color: color-mix(in srgb, var(--color-danger) 42%, var(--color-border));
  background: color-mix(in srgb, var(--color-bg-card) 88%, var(--color-status-danger-bg) 12%);
}
.risk-missing,
.risk-conditional,
.scenario-card.warning {
  border-color: color-mix(in srgb, var(--color-warning) 42%, var(--color-border));
  background: color-mix(in srgb, var(--color-bg-card) 86%, var(--color-status-warning-bg) 14%);
}
.risk-compliant {
  border-color: color-mix(in srgb, var(--color-success) 42%, var(--color-border));
  background: color-mix(in srgb, var(--color-bg-card) 88%, var(--color-status-success-bg) 12%);
}
.finding-card.conclusion-saved {
  background: color-mix(in srgb, var(--color-bg-card) 90%, var(--color-status-success-bg) 10%);
}
.output-lock {
  color: var(--color-status-warning-fg);
  background: var(--color-status-warning-bg);
}
.audit-row::after { background: var(--color-divider); }
.audit-dot { border-color: var(--color-brand-subtle); background: var(--color-brand); }
.audit-row pre,
.artifact-source {
  color: var(--color-text-primary);
  background: var(--color-bg-input);
}
.evidence-modal {
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-xl);
}
.evidence-modal blockquote {
  color: var(--color-text-primary);
  background: var(--color-bg-input);
}
.artifact-close {
  color: var(--color-text-secondary);
  border-color: var(--color-border);
  background: var(--color-bg-card);
}
.artifact-close:hover {
  color: var(--color-brand);
  border-color: color-mix(in srgb, var(--color-brand) 40%, var(--color-border));
  background: var(--color-brand-subtle);
}
.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
[dir="rtl"] .stage-arrow { transform: scaleX(-1); }
@container main-page (max-width: 1150px) {
  .metric-grid { grid-template-columns: repeat(3, 1fr); }
  .content-grid.two, .content-grid.pricing-layout, .decision-layout { grid-template-columns: 1fr; }
  .risk-summary { grid-template-columns: repeat(3, 1fr); }
}
@container main-page (max-width: 780px) {
  .bid-desk { padding: 16px; }
  .bid-header, .workflow-band-head { align-items: flex-start; flex-direction: column; }
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .case-meta { flex-wrap: wrap; }
  .finding-columns, .finding-decision { grid-template-columns: 1fr; }
  .finding-conclusion { grid-template-columns: 32px minmax(0, 1fr); }
  .finding-conclusion > .btn { grid-column: 1 / -1; justify-content: center; }
  .pricing-form, .form-grid { grid-template-columns: 1fr; }
  .decision-metrics { grid-template-columns: repeat(2, 1fr); }
}
</style>
