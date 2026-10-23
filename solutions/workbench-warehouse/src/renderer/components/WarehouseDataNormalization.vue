<template>
  <section class="normalization-lab">
    <header class="lab-header">
      <div>
        <span class="eyebrow">{{ brandName().toUpperCase() }} DATA PIPELINE</span>
        <h2>{{ $t('多源库存接入与数据归一') }}</h2>
        <p>{{ $t('内置来源为格式样例；上传文件后使用你的数据，通过真实解析与对账接口执行。') }}</p>
      </div>
      <div class="pipeline-state" :class="busy ? 'running' : 'ready'">
        <i :class="busy ? 'ri-loader-4-line spin' : 'ri-pulse-line'"></i>
        {{ busy ? $t('处理中') : $t('等待处理') }}
      </div>
    </header>

    <div class="lab-layout">
      <aside class="source-column">
        <div class="column-title">
          <span>{{ $t('01 · 数据源') }}</span>
          <small>{{ $t('{p0} 个数据来源', { p0: sources.length }) }}</small>
        </div>
        <button
          v-for="source in sources"
          :key="source.id"
          type="button"
          class="source-card"
          :class="{ active: source.id === selectedSourceId }"
          @click="selectSource(source.id)"
        >
          <span class="source-icon"><i :class="source.icon"></i></span>
          <span class="source-copy">
            <strong>{{ source.name }}</strong>
            <small>{{ source.system }} · {{ source.format.toUpperCase() }} <span v-if="!source.id.startsWith('upload-')">· {{ $t('格式样例') }}</span></small>
            <em>{{ source.description }}</em>
          </span>
          <i class="ri-arrow-right-s-line"></i>
        </button>

        <label class="upload-card">
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.json,.xml,.xlsx,.xls,.ndjson"
            @change="handleFileUpload"
          />
          <i class="ri-upload-cloud-2-line"></i>
          <span>
            <strong>{{ $t('接入本地文件') }}</strong>
            <small>CSV / Excel / JSON / XML / NDJSON</small>
          </span>
        </label>

        <div class="ledger-slots">
          <span>{{ $t('对账槽位') }}</span>
          <div :class="{ filled: Boolean(baseline) }">
            <b>A</b>
            <span>{{ baseline?.name || $t('等待基准账') }}</span>
            <small>{{ baseline ? $t('{p0} 条', { p0: baseline.records.length }) : $t('未装载') }}</small>
          </div>
          <div :class="{ filled: Boolean(comparison) }">
            <b>B</b>
            <span>{{ comparison?.name || $t('等待待核账') }}</span>
            <small>{{ comparison ? $t('{p0} 条', { p0: comparison.records.length }) : $t('未装载') }}</small>
          </div>
          <button
            class="run-compare"
            type="button"
            :disabled="busy || !baseline || !comparison"
            @click="runNormalizedReconcile"
          >
            <i class="ri-git-merge-line"></i>
            {{ reconcileRunning ? $t('真实对账中…') : $t('对比已归一数据') }}
          </button>
        </div>
      </aside>

      <main class="mapping-column">
        <div class="source-toolbar">
          <div>
            <span class="format-tag">{{ selectedSource.format.toUpperCase() }}</span>
            <strong>{{ selectedSource.name }}</strong>
            <small>{{ selectedSource.system }}</small>
          </div>
          <button type="button" :disabled="busy" @click="inspectSelectedSource">
            <i class="ri-radar-line"></i>{{ $t('重新读取') }}
          </button>
        </div>

        <div class="data-tabs">
          <button :class="{ active: activeTab === 'raw' }" @click="activeTab = 'raw'">{{ $t('原始数据') }}</button>
          <button :class="{ active: activeTab === 'mapping' }" @click="activeTab = 'mapping'">
            {{ $t('字段映射') }} <span>{{ detectedFields.length }}</span>
          </button>
          <button :class="{ active: activeTab === 'result' }" @click="activeTab = 'result'">
            {{ $t('归一结果') }} <span>{{ normalizeResult?.records.length || 0 }}</span>
          </button>
        </div>

        <section v-if="activeTab === 'raw'" class="tab-panel raw-panel">
          <div class="data-facts">
            <span><i class="ri-file-code-line"></i>{{ selectedSource.format.toUpperCase() }}</span>
            <span><i class="ri-database-line"></i>{{ $t('{p0} 条记录', { p0: parsedRecords.length }) }}</span>
            <span><i class="ri-braces-line"></i>{{ $t('{p0} 个字段', { p0: detectedFields.length }) }}</span>
            <span><i class="ri-shield-check-line"></i>{{ $t('原始内容保留') }}</span>
          </div>
          <pre>{{ selectedSource.preview }}</pre>
          <div v-if="parseError" class="message error"><i class="ri-error-warning-line"></i>{{ parseError }}</div>
        </section>

        <section v-else-if="activeTab === 'mapping'" class="tab-panel mapping-panel">
          <div class="mapping-intro">
            <div>
              <strong>{{ $t('统一数据模型') }}</strong>
              <span>{{ $t('源字段 → 标准字段；修改任一选择后可重新执行。') }}</span>
            </div>
            <span class="model-badge">InventoryRecord v1</span>
          </div>
          <div class="mapping-grid">
            <label v-for="field in canonicalFields" :key="field.key">
              <span>
                <b>{{ field.label }}</b>
                <em>{{ field.required ? $t('必需') : $t('可选') }}</em>
              </span>
              <div>
                <select v-model="mapping[field.key]">
                  <option value="">{{ $t('不映射') }}</option>
                  <option v-for="sourceField in detectedFields" :key="sourceField" :value="sourceField">
                    {{ sourceField }}
                  </option>
                </select>
                <i class="ri-arrow-right-line"></i>
                <code>{{ field.key }}</code>
              </div>
            </label>
          </div>
          <div class="unit-rules">
            <div>
              <strong>{{ $t('单位换算规则') }}</strong>
              <span>{{ $t('目标单位统一为 PCS；可现场修改倍率。') }}</span>
            </div>
            <label v-for="unit in editableUnits" :key="unit.code">
              <span>{{ unit.code }}</span>
              <input v-model.number="unitMultipliers[unit.code]" type="number" min="0.0001" step="0.01" />
              <em>PCS</em>
            </label>
          </div>
        </section>

        <section v-else class="tab-panel result-panel">
          <template v-if="normalizeResult">
            <div class="result-metrics">
              <div><span>{{ $t('接收') }}</span><strong>{{ normalizeResult.summary.received }}</strong></div>
              <div><span>{{ $t('成功归一') }}</span><strong>{{ normalizeResult.summary.normalized }}</strong></div>
              <div><span>{{ $t('单位换算') }}</span><strong>{{ normalizeResult.summary.convertedUnits }}</strong></div>
              <div :class="{ danger: normalizeResult.summary.rejected > 0 }">
                <span>{{ $t('拒绝') }}</span><strong>{{ normalizeResult.summary.rejected }}</strong>
              </div>
              <div><span>{{ $t('重复键') }}</span><strong>{{ normalizeResult.summary.duplicates }}</strong></div>
            </div>
            <div class="normalized-table">
              <table>
                <thead>
                  <tr>
                    <th>{{ $t('来源行') }}</th><th>SKU</th><th>{{ $t('仓库') }}</th><th>{{ $t('数量') }}</th><th>{{ $t('单位') }}</th>
                    <th>{{ $t('金额') }}</th><th>{{ $t('币种') }}</th><th>{{ $t('批次') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in normalizeResult.records" :key="`${row.sku}-${index}`">
                    <td>#{{ sourceRow(row) }}</td>
                    <td><code>{{ row.sku }}</code></td>
                    <td>{{ row.warehouse }}</td>
                    <td>{{ row.quantity }}</td>
                    <td><span class="unit-chip">{{ row.unit }}</span></td>
                    <td>{{ row.amount ?? '—' }}</td>
                    <td>{{ row.currency }}</td>
                    <td>{{ row.batch ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <details v-if="normalizeResult.evidence.length" class="evidence-list" open>
              <summary>{{ $t('转换证据（{p0}）', { p0: normalizeResult.evidence.length }) }}</summary>
              <p v-for="(item, index) in normalizeResult.evidence" :key="index" :class="item.level">
                <i :class="evidenceIcon(item.level)"></i>
                <span>{{ item.row ? $t('第 {p0} 行 · ', { p0: item.row }) : '' }}{{ item.detail }}</span>
              </p>
            </details>
          </template>
          <div v-else class="empty-result">
            <i class="ri-filter-3-line"></i>
            <strong>{{ $t('尚未执行归一') }}</strong>
            <span>{{ $t('检查映射后点击下方“执行真实归一”。') }}</span>
          </div>
        </section>

        <footer class="mapping-actions">
          <div>
            <span>{{ $t('当前链路') }}</span>
            <strong>{{ selectedSource.system }} → {{ brandName() }} → InventoryRecord v1</strong>
          </div>
          <button type="button" class="secondary" :disabled="busy || !normalizeResult" @click="assignLedger('baseline')">
            {{ $t('设为基准账 A') }}
          </button>
          <button type="button" class="secondary" :disabled="busy || !normalizeResult" @click="assignLedger('comparison')">
            {{ $t('设为待核账 B') }}
          </button>
          <button type="button" class="primary" :disabled="busy || parsedRecords.length === 0" @click="runNormalization">
            <i :class="normalizing ? 'ri-loader-4-line spin' : 'ri-play-circle-line'"></i>
            {{ normalizing ? $t('正在归一…') : $t('执行真实归一') }}
          </button>
        </footer>
      </main>

      <aside class="trace-column">
        <div class="trace-header">
          <div><span>{{ $t('实时执行记录') }}</span><strong>{{ runId }}</strong></div>
          <span class="live-dot"><i></i>LIVE</span>
        </div>
        <ol class="trace-list">
          <li v-for="entry in trace" :key="entry.id" :class="entry.state">
            <span class="trace-node">
              <i :class="entry.state === 'running' ? 'ri-loader-4-line spin' : entry.state === 'error' ? 'ri-close-line' : 'ri-check-line'"></i>
            </span>
            <div>
              <time>{{ entry.time }}</time>
              <strong>{{ entry.title }}</strong>
              <p>{{ entry.detail }}</p>
            </div>
          </li>
        </ol>
        <div v-if="reconcileResult" class="compare-receipt">
          <span>{{ $t('真实对账回执') }}</span>
          <strong>{{ reconcileResult.summary?.clean ? $t('两账已对平') : $t('发现业务差异') }}</strong>
          <div>
            <em>{{ $t('匹配 {p0}', { p0: reconcileResult.summary?.matched ?? 0 }) }}</em>
            <em>{{ $t('金额差异 {p0}', { p0: reconcileResult.summary?.amountMismatch ?? 0 }) }}</em>
            <em>{{ $t('仅 A {p0}', { p0: reconcileResult.summary?.onlyLeft ?? 0 }) }}</em>
            <em>{{ $t('仅 B {p0}', { p0: reconcileResult.summary?.onlyRight ?? 0 }) }}</em>
          </div>
        </div>
        <div class="trace-footnote">
          <i class="ri-lock-line"></i>
          <span>{{ $t('每条记录都保留来源 ID、格式、行号与换算前数量，可回溯，不覆盖原始数据。') }}</span>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { humanizeErrorMessage } from '../utils/humanize';
import * as XLSX from 'xlsx';
import { t as i18nT } from '../i18n';
import { brandName } from '../utils/brand';

type JsonRecord = Record<string, unknown>;
type SourceFormat = 'csv' | 'xlsx' | 'json' | 'xml' | 'ndjson';

interface DataSource {
  id: string;
  name: string;
  system: string;
  format: SourceFormat;
  description: string;
  icon: string;
  content: string;
  preview: string;
  mapping: Record<string, string>;
}

interface NormalizeEvidence {
  row: number;
  level: 'info' | 'warning' | 'error';
  detail: string;
}

interface NormalizeResult {
  ok: boolean;
  sourceId: string;
  detectedFields: string[];
  records: JsonRecord[];
  evidence: NormalizeEvidence[];
  summary: {
    received: number;
    normalized: number;
    rejected: number;
    convertedUnits: number;
    duplicates: number;
    currencies: string[];
    warehouses: string[];
  };
}

interface ReconcileResult {
  summary?: {
    clean?: boolean;
    matched?: number;
    amountMismatch?: number;
    onlyLeft?: number;
    onlyRight?: number;
  };
  [key: string]: unknown;
}

interface LedgerSlot {
  name: string;
  records: JsonRecord[];
}

interface TraceEntry {
  id: number;
  time: string;
  title: string;
  detail: string;
  state: 'done' | 'running' | 'error';
}

const emit = defineEmits<{
  normalizedReconcile: [payload: { left: JsonRecord[]; right: JsonRecord[]; result: ReconcileResult }];
}>();

const canonicalFields = [
  { key: 'sku', label: i18nT('商品编码'), required: true },
  { key: 'warehouse', label: i18nT('仓库 / 库位'), required: false },
  { key: 'quantity', label: i18nT('库存数量'), required: true },
  { key: 'unit', label: i18nT('源单位'), required: false },
  { key: 'packSize', label: i18nT('包装含量'), required: false },
  { key: 'unitPrice', label: i18nT('单位价格'), required: false },
  { key: 'amount', label: i18nT('库存金额'), required: false },
  { key: 'currency', label: i18nT('币种'), required: false },
  { key: 'batch', label: i18nT('批次 / Lot'), required: false },
  { key: 'updatedAt', label: i18nT('更新时间'), required: false },
] as const;

const editableUnits = [
  { code: 'PCS' }, { code: 'EA' }, { code: 'BOX' },
  { code: 'CTN' }, { code: 'DOZ' }, { code: 'PALLET' },
];

function makeExcelSource(): DataSource {
  const rows = [
    { Material: 'sku-001', Storage_Loc: 'ruh-a', Unrestricted: 2, Base_UoM: 'CTN', Pack_Qty: 12, Unit_Cost: 100, Currency: 'SAR', Batch: 'b-2407' },
    { Material: 'sku-002', Storage_Loc: 'ruh-a', Unrestricted: 1, Base_UoM: 'DOZ', Pack_Qty: 12, Unit_Cost: 120, Currency: 'SAR', Batch: 'b-2408' },
    { Material: 'sku-004', Storage_Loc: 'jed-b', Unrestricted: 4, Base_UoM: 'BOX', Pack_Qty: 6, Unit_Cost: 155, Currency: 'SAR', Batch: 'b-2410' },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'MB52');
  const content = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  return {
    id: 'sap-xlsx',
    name: i18nT('SAP MB52 库存导出'),
    system: 'SAP S/4HANA',
    format: 'xlsx',
    description: i18nT('Excel · 箱/打/盒混合单位'),
    icon: 'ri-file-excel-2-line',
    content,
    preview: [
      'Workbook: SAP_MB52_2026-07-29.xlsx',
      'Sheet: MB52 · 3 rows × 9 columns',
      '',
      'Material | Storage_Loc | Unrestricted | Base_UoM | Pack_Qty | Unit_Cost',
      'sku-001 | ruh-a | 2 | CTN | 12 | 100',
      'sku-002 | ruh-a | 1 | DOZ | 12 | 120',
      'sku-004 | jed-b | 4 | BOX | 6 | 155',
    ].join('\n'),
    mapping: {
      sku: 'Material', warehouse: 'Storage_Loc', quantity: 'Unrestricted', unit: 'Base_UoM',
      packSize: 'Pack_Qty', unitPrice: 'Unit_Cost', currency: 'Currency', batch: 'Batch',
    },
  };
}

const sources = reactive<DataSource[]>([
  {
    id: 'wms-csv',
    name: i18nT('WMS 每日库存快照'),
    system: 'Manhattan WMS',
    format: 'csv',
    description: i18nT('CSV · 分号分隔 · 件'),
    icon: 'ri-file-text-line',
    content: [
      'product_code;warehouse_code;on_hand;uom;inventory_value;currency;lot_no;updated_at',
      'SKU-001;RUH-A;24;PCS;2400.00;SAR;B-2407;2026-07-29T08:04:12Z',
      'SKU-002;RUH-A;12;PCS;1440.00;SAR;B-2408;2026-07-29T08:04:13Z',
      'SKU-003;JED-B;8;PCS;1040.00;SAR;B-2409;2026-07-29T08:04:14Z',
    ].join('\n'),
    preview: '',
    mapping: {
      sku: 'product_code', warehouse: 'warehouse_code', quantity: 'on_hand', unit: 'uom',
      amount: 'inventory_value', currency: 'currency', batch: 'lot_no', updatedAt: 'updated_at',
    },
  },
  makeExcelSource(),
  {
    id: 'commerce-json',
    name: i18nT('电商库存 API'),
    system: 'Commerce Cloud',
    format: 'json',
    description: i18nT('JSON · 嵌套字段 · 实时接口形态'),
    icon: 'ri-braces-line',
    content: JSON.stringify({
      requestId: 'req_inv_7f13c2',
      inventory: [
        { item: { code: 'sku-001' }, location: { id: 'ruh-a' }, stock: { available: '24', unit: 'EA' }, financials: { value: 'SAR 2400.00', currency: 'ر.س' }, lot: 'b-2407', syncedAt: '2026-07-29T08:05:02Z' },
        { item: { code: 'sku-002' }, location: { id: 'ruh-a' }, stock: { available: '11', unit: 'EA' }, financials: { value: 'SAR 1320.00', currency: 'ر.س' }, lot: 'b-2408', syncedAt: '2026-07-29T08:05:03Z' },
        { item: { code: 'sku-005' }, location: { id: 'dmm-c' }, stock: { available: '6', unit: 'EA' }, financials: { value: 'SAR 570.00', currency: 'ر.س' }, lot: 'b-2411', syncedAt: '2026-07-29T08:05:04Z' },
      ],
    }, null, 2),
    preview: '',
    mapping: {
      sku: 'item.code', warehouse: 'location.id', quantity: 'stock.available', unit: 'stock.unit',
      amount: 'financials.value', currency: 'financials.currency', batch: 'lot', updatedAt: 'syncedAt',
    },
  },
  {
    id: 'supplier-xml',
    name: i18nT('供应商 ASN / EDI'),
    system: 'Oracle NetSuite',
    format: 'xml',
    description: i18nT('XML · 到货通知 · 箱单位'),
    icon: 'ri-code-s-slash-line',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<inventory>
  <record><itemCode>sku-001</itemCode><site>ruh-a</site><qty>2</qty><uom>CTN</uom><pack>12</pack><unitCost>100</unitCost><currency>SAR</currency><lot>b-2407</lot></record>
  <record><itemCode>sku-002</itemCode><site>ruh-a</site><qty>1</qty><uom>CTN</uom><pack>12</pack><unitCost>120</unitCost><currency>SAR</currency><lot>b-2408</lot></record>
  <record><itemCode>sku-006</itemCode><site>jed-b</site><qty>1</qty><uom>CTN</uom><pack>10</pack><unitCost>80</unitCost><currency>SAR</currency><lot>b-2412</lot></record>
</inventory>`,
    preview: '',
    mapping: {
      sku: 'itemCode', warehouse: 'site', quantity: 'qty', unit: 'uom',
      packSize: 'pack', unitPrice: 'unitCost', currency: 'currency', batch: 'lot',
    },
  },
  {
    id: 'scanner-ndjson',
    name: i18nT('PDA 扫码事件流'),
    system: 'RF Scanner Gateway',
    format: 'ndjson',
    description: i18nT('NDJSON · Webhook 逐行事件'),
    icon: 'ri-qr-scan-2-line',
    content: [
      '{"event_id":"evt-701","barcode":"SKU-001","zone":"RUH-A","counted":"٢٤","measure":"EA","batch":"B-2407","at":"2026-07-29T08:06:10Z"}',
      '{"event_id":"evt-702","barcode":"SKU-002","zone":"RUH-A","counted":"١٢","measure":"EA","batch":"B-2408","at":"2026-07-29T08:06:18Z"}',
      '{"event_id":"evt-703","barcode":"SKU-003","zone":"JED-B","counted":"٧","measure":"EA","batch":"B-2409","at":"2026-07-29T08:06:25Z"}',
    ].join('\n'),
    preview: '',
    mapping: {
      sku: 'barcode', warehouse: 'zone', quantity: 'counted', unit: 'measure',
      batch: 'batch', updatedAt: 'at',
    },
  },
]);

sources.forEach((source) => {
  if (!source.preview) source.preview = source.content;
});

const selectedSourceId = ref(sources[0].id);
const activeTab = ref<'raw' | 'mapping' | 'result'>('raw');
const parsedRecords = ref<JsonRecord[]>([]);
const detectedFields = ref<string[]>([]);
const mapping = reactive<Record<string, string>>({});
const unitMultipliers = reactive<Record<string, number>>({
  PCS: 1, EA: 1, BOX: 6, CTN: 12, DOZ: 12, PALLET: 120,
});
const normalizing = ref(false);
const reconcileRunning = ref(false);
const parseError = ref('');
const normalizeResult = ref<NormalizeResult | null>(null);
const baseline = ref<LedgerSlot | null>(null);
const comparison = ref<LedgerSlot | null>(null);
const reconcileResult = ref<ReconcileResult | null>(null);
const trace = ref<TraceEntry[]>([]);
const traceCounter = ref(0);
const runId = `TC-NORM-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const selectedSource = computed(() =>
  sources.find((source) => source.id === selectedSourceId.value) ?? sources[0]);
const busy = computed(() => normalizing.value || reconcileRunning.value);

function nowTime(): string {
  return new Intl.DateTimeFormat(document.documentElement.lang || 'zh-CN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date());
}

function addTrace(title: string, detail: string, state: TraceEntry['state'] = 'done'): number {
  const id = ++traceCounter.value;
  trace.value.unshift({ id, time: nowTime(), title, detail, state });
  return id;
}

function finishTrace(id: number, detail: string, state: 'done' | 'error' = 'done'): void {
  const entry = trace.value.find((item) => item.id === id);
  if (!entry) return;
  entry.detail = detail;
  entry.state = state;
}

function flattenPaths(record: JsonRecord, prefix = '', depth = 0): string[] {
  const fields: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value) && depth < 2) {
      fields.push(...flattenPaths(value as JsonRecord, path, depth + 1));
    } else {
      fields.push(path);
    }
  }
  return fields;
}

function parseXmlRecords(xml: string): JsonRecord[] {
  const blocks = [...xml.matchAll(/<record\b[^>]*>([\s\S]*?)<\/record>/gi)];
  return blocks.map((block) => {
    const row: JsonRecord = {};
    for (const field of block[1].matchAll(/<([\w:-]+)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
      row[field[1]] = field[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    }
    return row;
  });
}

function parseSource(source: DataSource): JsonRecord[] {
  if (source.format === 'xlsx') {
    const workbook = XLSX.read(source.content, { type: 'base64' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<JsonRecord>(firstSheet, { defval: '' });
  }
  if (source.format === 'csv') {
    const workbook = XLSX.read(source.content, { type: 'string', FS: ';' });
    return XLSX.utils.sheet_to_json<JsonRecord>(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
  }
  if (source.format === 'ndjson') {
    return source.content.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord);
  }
  if (source.format === 'xml') return parseXmlRecords(source.content);
  const parsed = JSON.parse(source.content) as unknown;
  if (Array.isArray(parsed)) return parsed as JsonRecord[];
  if (parsed && typeof parsed === 'object') {
    const container = parsed as JsonRecord;
    const array = Object.values(container).find((value) => Array.isArray(value));
    if (Array.isArray(array)) return array as JsonRecord[];
    return [container];
  }
  throw new Error(i18nT('JSON 顶层没有可读取的对象或数组'));
}

function selectSource(sourceId: string): void {
  if (busy.value) return;
  selectedSourceId.value = sourceId;
  activeTab.value = 'raw';
  inspectSelectedSource();
}

function inspectSelectedSource(): void {
  parseError.value = '';
  normalizeResult.value = null;
  const source = selectedSource.value;
  const traceId = addTrace(i18nT('读取数据源'), i18nT('{p0} · 正在解析 {p1}', { p0: source.system, p1: source.format.toUpperCase() }), 'running');
  try {
    const records = parseSource(source);
    parsedRecords.value = records;
    detectedFields.value = [...new Set(records.flatMap((record) => flattenPaths(record)))].sort();
    Object.keys(mapping).forEach((key) => delete mapping[key]);
    Object.assign(mapping, source.mapping);
    finishTrace(traceId, i18nT('读取 {p0} 条记录，识别 {p1} 个源字段', { p0: records.length, p1: detectedFields.value.length }));
    addTrace(i18nT('保留来源证据'), i18nT('源 ID={p0}；格式={p1}；原始内容未改写', { p0: source.id, p1: source.format.toUpperCase() }));
  } catch (error) {
    parsedRecords.value = [];
    detectedFields.value = [];
    // 原来直出 JS 原生报错（如 `SyntaxError: Unexpected token } in JSON at position 42`），
    // 中文用户看不懂也不知道该改哪一行数据
    parseError.value = humanizeErrorMessage(error, i18nT('数据解析失败，请检查文件格式是否正确'));
    finishTrace(traceId, parseError.value, 'error');
  }
}

async function runNormalization(): Promise<void> {
  const api = (window as any).electronAPI?.workbenches?.warehouse;
  if (!api?.normalize) {
    addTrace(i18nT('归一化失败'), i18nT('仓储归一化主进程接口不可用'), 'error');
    return;
  }
  normalizing.value = true;
  normalizeResult.value = null;
  activeTab.value = 'result';
  const traceId = addTrace(i18nT('执行字段归一'), i18nT('记录已通过安全 IPC 发送至 TotalClaw 确定性处理器'), 'running');
  try {
    const result = await api.normalize({
      sourceId: selectedSource.value.id,
      format: selectedSource.value.format,
      // Vue 会把 ref 内的对象深度代理；Electron structured clone 不能传 Proxy。
      records: JSON.parse(JSON.stringify(parsedRecords.value)) as JsonRecord[],
      mapping: { ...mapping },
      unitMultipliers: { ...unitMultipliers },
    }) as NormalizeResult;
    normalizeResult.value = result;
    finishTrace(traceId, i18nT('{p0}/{p1} 条成功；拒绝 {p2} 条', { p0: result.summary.normalized, p1: result.summary.received, p2: result.summary.rejected }));
    addTrace(i18nT('单位与金额标准化'), i18nT('{p0} 条完成单位换算；币种 {p1}', { p0: result.summary.convertedUnits, p1: result.summary.currencies.join(', ') || '—' }));
    addTrace(i18nT('质量规则检查'), i18nT('重复键 {p0}；覆盖仓库 {p1}', { p0: result.summary.duplicates, p1: result.summary.warehouses.join(', ') || '—' }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    finishTrace(traceId, message, 'error');
  } finally {
    normalizing.value = false;
  }
}

function assignLedger(slot: 'baseline' | 'comparison'): void {
  if (!normalizeResult.value) return;
  const ledger = {
    name: selectedSource.value.name,
    records: normalizeResult.value.records.map((record) => ({ ...record })),
  };
  if (slot === 'baseline') baseline.value = ledger;
  else comparison.value = ledger;
  reconcileResult.value = null;
  addTrace(
    slot === 'baseline' ? i18nT('装载基准账 A') : i18nT('装载待核账 B'),
    i18nT('{p0} · {p1} 条标准记录已进入对账槽位', { p0: ledger.name, p1: ledger.records.length }),
  );
}

async function runNormalizedReconcile(): Promise<void> {
  const api = (window as any).electronAPI?.workbenches?.warehouse;
  if (!baseline.value || !comparison.value) return;
  if (!api?.reconcile) {
    addTrace(i18nT('对账失败'), i18nT('仓储对账主进程接口不可用'), 'error');
    return;
  }
  reconcileRunning.value = true;
  reconcileResult.value = null;
  const traceId = addTrace(i18nT('调用确定性对账'), i18nT('按 SKU + warehouse + batch 比较两组已归一记录'), 'running');
  try {
    const result = await api.reconcile({
      left: JSON.parse(JSON.stringify(baseline.value.records)),
      right: JSON.parse(JSON.stringify(comparison.value.records)),
      keyFields: ['sku', 'warehouse', 'batch'],
      amountField: 'amount',
      tolerance: 0.01,
    }) as ReconcileResult;
    reconcileResult.value = result;
    finishTrace(
      traceId,
      i18nT('匹配 {p0}；金额差异 {p1}；仅 A {p2}；仅 B {p3}', { p0: result.summary?.matched ?? 0, p1: result.summary?.amountMismatch ?? 0, p2: result.summary?.onlyLeft ?? 0, p3: result.summary?.onlyRight ?? 0 }),
    );
    addTrace(i18nT('写入证据链'), i18nT('归一记录、来源行号、换算过程和对账回执已关联到本次运行'));
    emit('normalizedReconcile', {
      left: baseline.value.records,
      right: comparison.value.records,
      result,
    });
  } catch (error) {
    finishTrace(traceId, error instanceof Error ? error.message : String(error), 'error');
  } finally {
    reconcileRunning.value = false;
  }
}

function fileFormat(name: string): SourceFormat | null {
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'xlsx' || extension === 'xls') return 'xlsx';
  if (extension === 'csv') return 'csv';
  if (extension === 'json') return 'json';
  if (extension === 'xml') return 'xml';
  if (extension === 'ndjson') return 'ndjson';
  return null;
}

async function handleFileUpload(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const format = fileFormat(file.name);
  if (!format) {
    addTrace(i18nT('文件接入失败'), i18nT('{p0} 的格式不受支持', { p0: file.name }), 'error');
    return;
  }
  try {
  let content: string;
  if (format === 'xlsx') {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 32768) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
    }
    content = btoa(binary);
  } else { content = await file.text(); }
  const id = `upload-${Date.now()}`;
  sources.push({
    id,
    name: file.name,
    system: i18nT('本地文件导入'),
    format,
    description: i18nT('{p0} KB · 用户选择', { p0: Math.max(1, Math.round(file.size / 1024)) }),
    icon: format === 'xlsx' ? 'ri-file-excel-2-line' : 'ri-file-upload-line',
    content,
    preview: format === 'xlsx'
      ? i18nT("Workbook: {p0}\nSize: {p1} bytes\n\n点击“重新读取”解析工作表和字段。", { p0: file.name, p1: file.size })
      : content.slice(0, 12_000),
    mapping: {},
  });
  selectedSourceId.value = id;
  activeTab.value = 'raw';
  inspectSelectedSource();
  addTrace(i18nT('接入本地文件'), i18nT('{p0} 已进入隔离解析流程', { p0: file.name }));
  } catch (error) {
    addTrace(i18nT('文件接入失败'), humanizeErrorMessage(error), 'error');
  } finally { input.value = ''; }
}

function sourceRow(row: JsonRecord): string {
  const source = row._source;
  if (!source || typeof source !== 'object') return '—';
  return String((source as JsonRecord).row ?? '—');
}

function evidenceIcon(level: string): string {
  if (level === 'error') return 'ri-close-circle-line';
  if (level === 'warning') return 'ri-alert-line';
  return 'ri-information-line';
}

onMounted(() => inspectSelectedSource());
</script>

<style scoped>
.normalization-lab {
  max-width: 1440px;
  margin: 0 auto 16px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-brand) 25%, var(--color-border));
  border-radius: 16px;
  background: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
}

.lab-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(120deg, color-mix(in srgb, var(--color-brand) 8%, transparent), transparent 62%);
}
.eyebrow { display: block; margin-bottom: 4px; color: var(--color-brand); font-size: 10px; font-weight: 800; letter-spacing: .1em; }
.lab-header h2 { margin: 0 0 5px; font-size: 18px; }
.lab-header p { margin: 0; color: var(--color-text-secondary); font-size: 12px; }
.pipeline-state { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.pipeline-state.ready { color: var(--color-success); background: color-mix(in srgb, var(--color-success) 11%, transparent); }
.pipeline-state.running { color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 11%, transparent); }

.lab-layout { display: grid; grid-template-columns: 230px minmax(0, 1fr) 290px; min-height: 610px; }
.source-column, .trace-column { min-width: 0; padding: 15px; background: color-mix(in srgb, var(--color-bg-hover) 60%, var(--color-bg-card)); }
.source-column { border-inline-end: 1px solid var(--color-border); }
.trace-column { border-inline-start: 1px solid var(--color-border); }
.mapping-column { display: flex; min-width: 0; flex-direction: column; }
.column-title { display: flex; justify-content: space-between; margin-bottom: 9px; }
.column-title span { font-size: 11px; font-weight: 800; }
.column-title small { color: var(--color-text-muted); font-size: 9px; }

.source-card {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  margin-bottom: 7px;
  padding: 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--color-text-primary);
  background: transparent;
  text-align: start;
  cursor: pointer;
}
.source-card:hover { background: var(--color-bg-card); }
.source-card.active { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); background: var(--color-bg-card); box-shadow: inset 3px 0 var(--color-brand); }
.source-icon { display: grid; width: 30px; height: 30px; flex: 0 0 auto; place-items: center; border-radius: 8px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 10%, transparent); }
.source-copy { min-width: 0; flex: 1; }
.source-copy strong, .source-copy small, .source-copy em { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.source-copy strong { font-size: 11px; }
.source-copy small { margin-top: 2px; color: var(--color-text-secondary); font-size: 9px; }
.source-copy em { margin-top: 3px; color: var(--color-text-muted); font-size: 9px; font-style: normal; }

.upload-card { display: flex; align-items: center; gap: 8px; margin: 11px 0; padding: 10px; border: 1px dashed var(--color-border); border-radius: 10px; cursor: pointer; }
.upload-card:hover { border-color: var(--color-brand); }
.upload-card input { display: none; }
.upload-card > i { color: var(--color-brand); font-size: 19px; }
.upload-card strong, .upload-card small { display: block; }
.upload-card strong { font-size: 10px; }
.upload-card small { margin-top: 2px; color: var(--color-text-muted); font-size: 9px; }

.ledger-slots { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border); }
.ledger-slots > span { display: block; margin-bottom: 7px; color: var(--color-text-secondary); font-size: 10px; font-weight: 700; }
.ledger-slots > div { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; align-items: center; gap: 7px; margin-bottom: 6px; padding: 7px; border: 1px dashed var(--color-border); border-radius: 8px; }
.ledger-slots > div.filled { border-style: solid; border-color: color-mix(in srgb, var(--color-success) 35%, var(--color-border)); background: color-mix(in srgb, var(--color-success) 6%, transparent); }
.ledger-slots b { display: grid; width: 20px; height: 20px; place-items: center; border-radius: 6px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 12%, transparent); font-size: 10px; }
.ledger-slots div span { overflow: hidden; font-size: 9px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.ledger-slots div small { color: var(--color-text-muted); font-size: 8px; }
.run-compare { display: flex; width: 100%; align-items: center; justify-content: center; gap: 5px; margin-top: 8px; padding: 8px; border: 0; border-radius: 8px; color: var(--color-on-accent); background: var(--color-brand); font-size: 10px; font-weight: 700; cursor: pointer; }
.run-compare:disabled { opacity: .45; cursor: not-allowed; }

.source-toolbar { display: flex; min-height: 61px; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--color-border); }
.source-toolbar > div { display: flex; align-items: center; gap: 8px; min-width: 0; }
.source-toolbar strong { font-size: 12px; }
.source-toolbar small { color: var(--color-text-muted); font-size: 10px; }
.format-tag { padding: 4px 6px; border-radius: 6px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 10%, transparent); font-size: 9px; font-weight: 800; }
.source-toolbar button, .mapping-actions button { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 9px; color: var(--color-text-primary); background: var(--color-bg-card); font-size: 10px; font-weight: 600; cursor: pointer; }

.data-tabs { display: flex; gap: 4px; padding: 8px 14px 0; border-bottom: 1px solid var(--color-border); }
.data-tabs button { padding: 8px 10px; border: 0; border-bottom: 2px solid transparent; color: var(--color-text-secondary); background: transparent; font-size: 10px; cursor: pointer; }
.data-tabs button.active { border-bottom-color: var(--color-brand); color: var(--color-brand); font-weight: 700; }
.data-tabs span { margin-inline-start: 3px; padding: 1px 4px; border-radius: 999px; background: var(--color-bg-hover); font-size: 8px; }
.tab-panel { min-height: 0; flex: 1; overflow: auto; padding: 14px 16px; }

.data-facts { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.data-facts span { display: flex; align-items: center; gap: 4px; padding: 5px 7px; border-radius: 7px; color: var(--color-text-secondary); background: var(--color-bg-hover); font-size: 9px; }
.raw-panel pre { max-height: 395px; overflow: auto; margin: 0; padding: 13px; border: 1px solid var(--color-border); border-radius: 10px; color: var(--color-text-secondary); background: color-mix(in srgb, #0f172a 94%, var(--color-bg-card)); font: 10px/1.65 var(--font-mono); white-space: pre-wrap; word-break: break-word; }
.message.error { margin-top: 9px; padding: 8px; border-radius: 8px; color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 8%, transparent); font-size: 10px; }

.mapping-intro, .unit-rules > div:first-child { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.mapping-intro strong, .mapping-intro span, .unit-rules strong, .unit-rules span { display: block; }
.mapping-intro strong, .unit-rules strong { font-size: 11px; }
.mapping-intro span:not(.model-badge), .unit-rules > div span { margin-top: 2px; color: var(--color-text-secondary); font-size: 9px; }
.model-badge { padding: 4px 7px; border-radius: 999px; color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); font: 9px var(--font-mono); }
.mapping-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.mapping-grid label { padding: 8px; border: 1px solid var(--color-border); border-radius: 9px; }
.mapping-grid label > span { display: flex; justify-content: space-between; margin-bottom: 5px; }
.mapping-grid b { font-size: 9px; }
.mapping-grid em { color: var(--color-text-muted); font-size: 8px; font-style: normal; }
.mapping-grid label > div { display: grid; grid-template-columns: minmax(0, 1fr) 16px minmax(75px, .7fr); align-items: center; gap: 4px; }
.mapping-grid select { min-width: 0; height: 29px; border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-text-primary); background: var(--color-bg-input); font-size: 9px; }
.mapping-grid i { color: var(--color-text-muted); text-align: center; }
.mapping-grid code { overflow: hidden; color: var(--color-brand); font-size: 9px; text-overflow: ellipsis; }
.unit-rules { margin-top: 12px; padding-top: 11px; border-top: 1px solid var(--color-border); }
.unit-rules { display: flex; flex-wrap: wrap; gap: 7px; }
.unit-rules > div:first-child { width: 100%; }
.unit-rules label { display: grid; grid-template-columns: 34px 52px 25px; align-items: center; gap: 4px; padding: 5px 6px; border: 1px solid var(--color-border); border-radius: 7px; }
.unit-rules label span { font-size: 8px; font-weight: 700; }
.unit-rules input { width: 52px; height: 25px; box-sizing: border-box; border: 1px solid var(--color-border); border-radius: 5px; color: var(--color-text-primary); background: var(--color-bg-input); font-size: 9px; }
.unit-rules em { color: var(--color-text-muted); font-size: 8px; font-style: normal; }

.result-metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; margin-bottom: 10px; }
.result-metrics div { padding: 8px; border-radius: 8px; background: var(--color-bg-hover); }
.result-metrics span, .result-metrics strong { display: block; }
.result-metrics span { color: var(--color-text-secondary); font-size: 8px; }
.result-metrics strong { margin-top: 2px; font-size: 15px; }
.result-metrics .danger { color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 8%, transparent); }
.normalized-table { overflow: auto; border: 1px solid var(--color-border); border-radius: 9px; }
.normalized-table table { width: 100%; border-collapse: collapse; font-size: 9px; }
.normalized-table th, .normalized-table td { padding: 7px; border-bottom: 1px solid var(--color-border); text-align: start; white-space: nowrap; }
.normalized-table th { color: var(--color-text-secondary); background: var(--color-bg-hover); }
.unit-chip { padding: 2px 5px; border-radius: 999px; color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); font-size: 8px; font-weight: 700; }
.evidence-list { margin-top: 10px; }
.evidence-list summary { color: var(--color-brand); font-size: 10px; font-weight: 700; cursor: pointer; }
.evidence-list p { display: flex; gap: 5px; margin: 6px 0 0; padding: 6px; border-radius: 6px; color: var(--color-text-secondary); background: var(--color-bg-hover); font-size: 9px; }
.evidence-list p.error { color: var(--color-danger); }
.evidence-list p.warning { color: var(--color-warning); }
.empty-result { display: grid; min-height: 330px; place-content: center; justify-items: center; color: var(--color-text-muted); }
.empty-result i { margin-bottom: 8px; font-size: 32px; }
.empty-result strong { font-size: 12px; }
.empty-result span { margin-top: 4px; font-size: 9px; }

.mapping-actions { display: flex; align-items: center; gap: 7px; padding: 10px 14px; border-top: 1px solid var(--color-border); }
.mapping-actions > div { min-width: 0; flex: 1; }
.mapping-actions span, .mapping-actions strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mapping-actions span { color: var(--color-text-muted); font-size: 8px; }
.mapping-actions strong { margin-top: 2px; font-size: 9px; }
.mapping-actions button:disabled { opacity: .45; cursor: not-allowed; }
.mapping-actions button.primary { border-color: var(--color-brand); color: var(--color-on-accent); background: var(--color-brand); }

.trace-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.trace-header span, .trace-header strong { display: block; }
.trace-header span { color: var(--color-text-secondary); font-size: 9px; }
.trace-header strong { margin-top: 2px; font: 9px var(--font-mono); }
.live-dot { display: flex !important; align-items: center; gap: 4px; color: var(--color-success) !important; font-weight: 800; }
.live-dot i { width: 6px; height: 6px; border-radius: 50%; background: var(--color-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 14%, transparent); }
.trace-list { max-height: 390px; overflow: auto; margin: 0; padding: 0; list-style: none; }
.trace-list li { position: relative; display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 7px; padding-bottom: 12px; }
.trace-list li:not(:last-child)::before { position: absolute; top: 20px; bottom: 0; inset-inline-start: 10px; width: 1px; background: var(--color-border); content: ''; }
.trace-node { z-index: 1; display: grid; width: 20px; height: 20px; place-items: center; border-radius: 50%; color: var(--color-success); background: color-mix(in srgb, var(--color-success) 12%, var(--color-bg-card)); font-size: 9px; }
.trace-list li.running .trace-node { color: var(--color-brand); }
.trace-list li.error .trace-node { color: var(--color-danger); }
.trace-list time { color: var(--color-text-muted); font: 8px var(--font-mono); }
.trace-list strong { display: block; margin-top: 2px; font-size: 10px; }
.trace-list p { margin: 3px 0 0; color: var(--color-text-secondary); font-size: 9px; line-height: 1.45; }
.compare-receipt { margin-top: 10px; padding: 10px; border: 1px solid color-mix(in srgb, var(--color-success) 35%, var(--color-border)); border-radius: 10px; background: color-mix(in srgb, var(--color-success) 7%, transparent); }
.compare-receipt > span, .compare-receipt > strong { display: block; }
.compare-receipt > span { color: var(--color-success); font-size: 8px; font-weight: 700; }
.compare-receipt > strong { margin: 3px 0 7px; font-size: 11px; }
.compare-receipt div { display: flex; flex-wrap: wrap; gap: 4px; }
.compare-receipt em { padding: 3px 5px; border-radius: 5px; background: var(--color-bg-card); font-size: 8px; font-style: normal; }
.trace-footnote { display: flex; gap: 6px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 8px; line-height: 1.5; }
.trace-footnote i { flex: 0 0 auto; color: var(--color-brand); }

.spin { animation: spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@container main-page (max-width: 1180px) {
  .lab-layout { grid-template-columns: 210px minmax(0, 1fr); }
  .trace-column { grid-column: 1 / -1; border-top: 1px solid var(--color-border); border-inline-start: 0; }
  .trace-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; max-height: none; }
  .trace-list li { padding: 8px; border: 1px solid var(--color-border); border-radius: 8px; }
  .trace-list li::before { display: none; }
}

@container main-page (max-width: 780px) {
  .lab-layout { display: block; }
  .source-column { border-inline-end: 0; border-bottom: 1px solid var(--color-border); }
  .mapping-grid { grid-template-columns: 1fr; }
  .mapping-actions { flex-wrap: wrap; }
  .mapping-actions > div { width: 100%; flex-basis: 100%; }
}
</style>
