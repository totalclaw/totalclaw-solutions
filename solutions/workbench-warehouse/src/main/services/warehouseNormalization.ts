import type {
  WarehouseNormalizeEvidence,
  WarehouseNormalizeRequest,
  WarehouseNormalizeResponse,
  WarehouseThreeWayFinding,
  WarehouseThreeWayReconcileRequest,
  WarehouseThreeWayReconcileResponse,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';

type SourceRecord = Record<string, unknown>;

const DEFAULT_UNIT_MULTIPLIERS: Record<string, number> = {
  EA: 1,
  EACH: 1,
  PC: 1,
  PCS: 1,
  PIECE: 1,
  PIECES: 1,
  UNIT: 1,
  UNITS: 1,
  DOZ: 12,
  DOZEN: 12,
  BOX: 6,
  CASE: 12,
  CTN: 12,
  CARTON: 12,
  PALLET: 120,
};

function readPath(record: SourceRecord, path: string | undefined): unknown {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    return (value as SourceRecord)[segment];
  }, record);
}

function normalizeDigits(value: string): string {
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  const eastern = '۰۱۲۳۴۵۶۷۸۹';
  return value
    .replace(/[٠-٩]/g, (digit) => String(arabic.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(eastern.indexOf(digit)));
}

function numberValue(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const normalized = normalizeDigits(value)
    .replace(/\s/g, '')
    .replace(/,/g, '')
    .replace(/[^\d.+-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function textValue(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

function unitCode(value: unknown): string {
  return textValue(value).toUpperCase().replace(/\./g, '') || 'PCS';
}

function currencyCode(value: unknown): string {
  const raw = textValue(value).toUpperCase();
  if (!raw) return 'SAR';
  if (raw === 'ر.س' || raw === '﷼' || raw === 'SR') return 'SAR';
  if (raw === '$' || raw === 'US$') return 'USD';
  if (raw === 'د.إ' || raw === 'DH') return 'AED';
  return raw;
}

function round(value: number, digits = 4): number {
  const scale = 10 ** digits;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

function collectPaths(records: SourceRecord[]): string[] {
  const paths = new Set<string>();
  const visit = (value: unknown, prefix: string, depth: number) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 2) return;
    for (const [key, child] of Object.entries(value as SourceRecord)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (child && typeof child === 'object' && !Array.isArray(child)) {
        visit(child, path, depth + 1);
      } else {
        paths.add(path);
      }
    }
  };
  records.slice(0, 20).forEach((record) => visit(record, '', 0));
  return [...paths].sort();
}

export function normalizeWarehouseRecords(
  payload: WarehouseNormalizeRequest,
): WarehouseNormalizeResponse {
  if (!payload || !Array.isArray(payload.records) || payload.records.length === 0) {
    throw new Error(i18nT('归一化至少需要一条源记录'));
  }
  if (payload.records.length > 10_000) {
    throw new Error(i18nT('单次归一化最多处理 10000 条记录'));
  }
  if (!payload.mapping || typeof payload.mapping !== 'object') {
    throw new Error(i18nT('字段映射不能为空'));
  }

  const sourceId = textValue(payload.sourceId) || 'warehouse-source';
  const sourceFormat = textValue(payload.format) || 'unknown';
  const configuredMultipliers: Record<string, number> = {};
  for (const [key, rawValue] of Object.entries(payload.unitMultipliers ?? {})) {
    const value = Number(rawValue);
    if (Number.isFinite(value) && value > 0) configuredMultipliers[unitCode(key)] = value;
  }
  const multipliers = { ...DEFAULT_UNIT_MULTIPLIERS, ...configuredMultipliers };
  const evidence: WarehouseNormalizeEvidence[] = [];
  const normalized: SourceRecord[] = [];
  let convertedUnits = 0;
  let rejected = 0;

  payload.records.forEach((record, index) => {
    const rowNumber = index + 1;
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      rejected += 1;
      evidence.push({
        row: rowNumber,
        level: 'error',
        action: 'reject',
        detail: i18nT('源记录不是对象'),
      });
      return;
    }

    const sku = textValue(readPath(record, payload.mapping.sku)).toUpperCase();
    const warehouse = textValue(readPath(record, payload.mapping.warehouse)).toUpperCase();
    const sourceQuantity = numberValue(readPath(record, payload.mapping.quantity));
    const sourceUnit = unitCode(readPath(record, payload.mapping.unit));
    const explicitMultiplier = numberValue(readPath(record, payload.mapping.packSize));
    const multiplier = explicitMultiplier && explicitMultiplier > 0
      ? explicitMultiplier
      : multipliers[sourceUnit];

    if (!sku) {
      rejected += 1;
      evidence.push({
        row: rowNumber,
        level: 'error',
        action: 'reject',
        detail: i18nT('SKU 为空，无法建立业务主键'),
      });
      return;
    }
    if (sourceQuantity === null) {
      rejected += 1;
      evidence.push({
        row: rowNumber,
        level: 'error',
        action: 'reject',
        detail: i18nT('{sku} 的数量无法解析', { sku }),
      });
      return;
    }
    if (!multiplier) {
      rejected += 1;
      evidence.push({
        row: rowNumber,
        level: 'error',
        action: 'reject',
        detail: i18nT('{sku} 的单位 {sourceUnit} 没有换算规则', { sku, sourceUnit }),
      });
      return;
    }

    const quantity = round(sourceQuantity * multiplier);
    const directAmount = numberValue(readPath(record, payload.mapping.amount));
    const unitPrice = numberValue(readPath(record, payload.mapping.unitPrice));
    const amount = directAmount ?? (unitPrice === null ? null : round(unitPrice * quantity, 2));
    const currency = currencyCode(readPath(record, payload.mapping.currency));
    const batch = textValue(readPath(record, payload.mapping.batch)).toUpperCase();
    const updatedAt = textValue(readPath(record, payload.mapping.updatedAt));

    if (multiplier !== 1 || sourceUnit !== 'PCS') {
      convertedUnits += 1;
      evidence.push({
        row: rowNumber,
        level: 'info',
        action: 'unit_conversion',
        detail: `${sku}: ${sourceQuantity} ${sourceUnit} × ${multiplier} = ${quantity} PCS`,
      });
    }
    if (directAmount === null && unitPrice !== null) {
      evidence.push({
        row: rowNumber,
        level: 'info',
        action: 'amount_calculation',
        detail: i18nT('{sku}: 单价 {unitPrice} × 归一数量 {quantity} = {amount}', { sku, unitPrice, quantity, amount }),
      });
    }

    normalized.push({
      sku,
      warehouse: warehouse || 'UNASSIGNED',
      quantity,
      unit: 'PCS',
      ...(amount === null ? {} : { amount }),
      currency,
      ...(batch ? { batch } : {}),
      ...(updatedAt ? { updatedAt } : {}),
      _source: {
        id: sourceId,
        format: sourceFormat,
        row: rowNumber,
        unit: sourceUnit,
        quantity: sourceQuantity,
      },
    });
  });

  const duplicateKeys = new Map<string, number>();
  normalized.forEach((record) => {
    const key = `${record.sku}|${record.warehouse}|${record.batch ?? ''}`;
    duplicateKeys.set(key, (duplicateKeys.get(key) ?? 0) + 1);
  });
  const duplicates = [...duplicateKeys.values()].filter((count) => count > 1)
    .reduce((total, count) => total + count - 1, 0);
  if (duplicates > 0) {
    evidence.push({
      row: 0,
      level: 'warning',
      action: 'duplicate_detection',
      detail: i18nT('检测到 {duplicates} 条重复业务键，已保留并等待对账策略处理', { duplicates }),
    });
  }

  return {
    ok: rejected === 0,
    sourceId,
    detectedFields: collectPaths(payload.records),
    records: normalized,
    evidence,
    summary: {
      received: payload.records.length,
      normalized: normalized.length,
      rejected,
      convertedUnits,
      duplicates,
      currencies: [...new Set(normalized.map((record) => String(record.currency)))],
      warehouses: [...new Set(normalized.map((record) => String(record.warehouse)))],
    },
  };
}

function threeWayKey(record: SourceRecord): string {
  return `${textValue(record.sku).toUpperCase()}|${textValue(record.warehouse).toUpperCase() || 'UNASSIGNED'}`;
}

function normalizedThreeWayQuantity(record: SourceRecord): {
  quantity: number;
  converted: boolean;
  sourceQuantity: number;
  sourceUnit: string;
  multiplier: number;
} {
  const sourceQuantity = numberValue(record.quantity) ?? 0;
  const sourceUnit = unitCode(record.unit);
  const explicitPackSize = numberValue(record.packSize ?? record.pack_size);
  const multiplier = explicitPackSize && explicitPackSize > 0
    ? explicitPackSize
    : (DEFAULT_UNIT_MULTIPLIERS[sourceUnit] ?? 1);
  return {
    quantity: round(sourceQuantity * multiplier),
    converted: sourceUnit !== 'PCS' || multiplier !== 1,
    sourceQuantity,
    sourceUnit,
    multiplier,
  };
}

export function reconcileWarehouseThreeWay(
  payload: WarehouseThreeWayReconcileRequest,
): WarehouseThreeWayReconcileResponse {
  if (!payload || !Array.isArray(payload.sources) || payload.sources.length !== 3) {
    throw new Error(i18nT('三方对账必须提供 WMS、ERP 与业务平台三个数据源'));
  }
  const sourceIds = payload.sources.map((source) => textValue(source.id));
  if (new Set(sourceIds).size !== 3 || sourceIds.some((id) => !id)) {
    throw new Error(i18nT('三方数据源标识必须唯一且不能为空'));
  }
  const tolerance = Math.max(0, Number(payload.tolerance) || 0);
  const asOf = new Date(payload.asOf || Date.now());
  if (Number.isNaN(asOf.getTime())) throw new Error(i18nT('三方对账日期无效'));

  const indexed = payload.sources.map((source) => {
    if (!Array.isArray(source.records)) throw new Error(i18nT('{p0} 记录必须是数组', { p0: source.label || source.id }));
    const map = new Map<string, { record: SourceRecord; row: number }>();
    source.records.forEach((record, index) => {
      const key = threeWayKey(record);
      if (!key.startsWith('|')) map.set(key, { record, row: index + 1 });
    });
    return { source, map };
  });
  const keys = new Set(indexed.flatMap(({ map }) => [...map.keys()]));
  const findings: WarehouseThreeWayFinding[] = [];

  for (const key of keys) {
    const [sku, warehouse] = key.split('|');
    const rows = indexed.map(({ source, map }) => ({
      source,
      found: map.get(key),
    }));
    const missing = rows.filter((row) => !row.found);
    if (missing.length) {
      findings.push({
        id: `missing-${sku}-${warehouse}`,
        type: 'missing_source',
        severity: 'critical',
        sku,
        warehouse,
        detail: i18nT('{p0} 缺少该 SKU 记录', { p0: missing.map((row) => row.source.label || row.source.id).join(i18nT('、')) }),
        impactSar: 0,
        evidence: rows.filter((row) => row.found).map((row) => ({
          sourceId: row.source.id,
          row: row.found!.row,
          value: `${textValue(row.found!.record.quantity)} ${unitCode(row.found!.record.unit)}`,
        })),
      });
    }
    const present = rows.filter((row) => row.found).map((row) => {
      const normalized = normalizedThreeWayQuantity(row.found!.record);
      return { ...row, normalized };
    });
    const converted = present.filter((row) => row.normalized.converted);
    if (converted.length) {
      findings.push({
        id: `unit-${sku}-${warehouse}`,
        type: 'unit_mapping',
        severity: 'warning',
        sku,
        warehouse,
        detail: converted.map((row) =>
          `${row.source.label || row.source.id}: ${row.normalized.sourceQuantity} ${row.normalized.sourceUnit} × ${row.normalized.multiplier} = ${row.normalized.quantity} PCS`).join(i18nT('；')),
        impactSar: 0,
        evidence: converted.map((row) => ({
          sourceId: row.source.id,
          row: row.found!.row,
          value: `${row.normalized.sourceQuantity} ${row.normalized.sourceUnit} → ${row.normalized.quantity} PCS`,
        })),
      });
    }
    if (present.length >= 2) {
      const quantities = present.map((row) => row.normalized.quantity);
      const min = Math.min(...quantities);
      const max = Math.max(...quantities);
      if (max - min > tolerance) {
        const unitPrice = Math.max(...present.map((row) =>
          numberValue(row.found!.record.unitPriceSar ?? row.found!.record.unit_price_sar) ?? 0));
        const impactSar = round((max - min) * unitPrice, 2);
        findings.push({
          id: `quantity-${sku}-${warehouse}`,
          type: 'quantity_mismatch',
          severity: impactSar >= 10_000 ? 'critical' : 'warning',
          sku,
          warehouse,
          detail: present.map((row) =>
            `${row.source.label || row.source.id}=${row.normalized.quantity} PCS`).join(i18nT('；')),
          impactSar,
          evidence: present.map((row) => ({
            sourceId: row.source.id,
            row: row.found!.row,
            value: `${row.normalized.quantity} PCS`,
          })),
        });
      }
    }
    const expiryRows = present.filter((row) => {
      const raw = textValue(row.found!.record.expiryDate ?? row.found!.record.expiry_date);
      if (!raw) return false;
      const expiry = new Date(raw);
      const days = Math.ceil((expiry.getTime() - asOf.getTime()) / 86_400_000);
      return Number.isFinite(days) && days >= 0 && days <= 45;
    });
    if (expiryRows.length) {
      findings.push({
        id: `expiry-${sku}-${warehouse}`,
        type: 'expiry_risk',
        severity: 'warning',
        sku,
        warehouse,
        detail: i18nT('{p0}，45 天内到期', { p0: expiryRows.map((row) =>
          `${row.source.label || row.source.id}=${textValue(row.found!.record.expiryDate ?? row.found!.record.expiry_date)}`).join(i18nT('；')) }),
        impactSar: 0,
        evidence: expiryRows.map((row) => ({
          sourceId: row.source.id,
          row: row.found!.row,
          value: textValue(row.found!.record.expiryDate ?? row.found!.record.expiry_date),
        })),
      });
    }
  }

  return {
    ok: findings.length === 0,
    sourceCount: 3,
    comparedKeys: keys.size,
    findings,
    totalImpactSar: round(findings.reduce((total, finding) => total + finding.impactSar, 0), 2),
    evidenceCount: findings.reduce((total, finding) => total + finding.evidence.length, 0),
  };
}
