var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.cache/solutions-build/workbench-warehouse/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-warehouse/src/main/ipc/warehouseWorkbench.ipc.ts
var import_electron = require("electron");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_workbenchApi = require("host:apps/desktop-shell/src/main/ipc/workbenchApi.ts");
var import_shared = require("host:apps/desktop-shell/src/main/ipc/shared.ts");

// ../../../totalclaw-solutions/solutions/workbench-warehouse/src/main/services/warehouseNormalization.ts
var import_i18n = require("npm:@totalclaw/i18n");
var DEFAULT_UNIT_MULTIPLIERS = {
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
  PALLET: 120
};
function readPath(record, path) {
  if (!path) return void 0;
  return path.split(".").reduce((value, segment) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
    return value[segment];
  }, record);
}
function normalizeDigits(value) {
  const arabic = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
  const eastern = "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9";
  return value.replace(/[٠-٩]/g, (digit) => String(arabic.indexOf(digit))).replace(/[۰-۹]/g, (digit) => String(eastern.indexOf(digit)));
}
function numberValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const normalized = normalizeDigits(value).replace(/\s/g, "").replace(/,/g, "").replace(/[^\d.+-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
function textValue(value) {
  return value == null ? "" : String(value).trim();
}
function unitCode(value) {
  return textValue(value).toUpperCase().replace(/\./g, "") || "PCS";
}
function currencyCode(value) {
  const raw = textValue(value).toUpperCase();
  if (!raw) return "SAR";
  if (raw === "\u0631.\u0633" || raw === "\uFDFC" || raw === "SR") return "SAR";
  if (raw === "$" || raw === "US$") return "USD";
  if (raw === "\u062F.\u0625" || raw === "DH") return "AED";
  return raw;
}
function round(value, digits = 4) {
  const scale = 10 ** digits;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}
function collectPaths(records) {
  const paths = /* @__PURE__ */ new Set();
  const visit = (value, prefix, depth) => {
    if (!value || typeof value !== "object" || Array.isArray(value) || depth > 2) return;
    for (const [key, child] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (child && typeof child === "object" && !Array.isArray(child)) {
        visit(child, path, depth + 1);
      } else {
        paths.add(path);
      }
    }
  };
  records.slice(0, 20).forEach((record) => visit(record, "", 0));
  return [...paths].sort();
}
function normalizeWarehouseRecords(payload) {
  if (!payload || !Array.isArray(payload.records) || payload.records.length === 0) {
    throw new Error((0, import_i18n.t)("\u5F52\u4E00\u5316\u81F3\u5C11\u9700\u8981\u4E00\u6761\u6E90\u8BB0\u5F55"));
  }
  if (payload.records.length > 1e4) {
    throw new Error((0, import_i18n.t)("\u5355\u6B21\u5F52\u4E00\u5316\u6700\u591A\u5904\u7406 10000 \u6761\u8BB0\u5F55"));
  }
  if (!payload.mapping || typeof payload.mapping !== "object") {
    throw new Error((0, import_i18n.t)("\u5B57\u6BB5\u6620\u5C04\u4E0D\u80FD\u4E3A\u7A7A"));
  }
  const sourceId = textValue(payload.sourceId) || "warehouse-source";
  const sourceFormat = textValue(payload.format) || "unknown";
  const configuredMultipliers = {};
  for (const [key, rawValue] of Object.entries(payload.unitMultipliers ?? {})) {
    const value = Number(rawValue);
    if (Number.isFinite(value) && value > 0) configuredMultipliers[unitCode(key)] = value;
  }
  const multipliers = { ...DEFAULT_UNIT_MULTIPLIERS, ...configuredMultipliers };
  const evidence = [];
  const normalized = [];
  let convertedUnits = 0;
  let rejected = 0;
  payload.records.forEach((record, index) => {
    const rowNumber = index + 1;
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      rejected += 1;
      evidence.push({
        row: rowNumber,
        level: "error",
        action: "reject",
        detail: (0, import_i18n.t)("\u6E90\u8BB0\u5F55\u4E0D\u662F\u5BF9\u8C61")
      });
      return;
    }
    const sku = textValue(readPath(record, payload.mapping.sku)).toUpperCase();
    const warehouse = textValue(readPath(record, payload.mapping.warehouse)).toUpperCase();
    const sourceQuantity = numberValue(readPath(record, payload.mapping.quantity));
    const sourceUnit = unitCode(readPath(record, payload.mapping.unit));
    const explicitMultiplier = numberValue(readPath(record, payload.mapping.packSize));
    const multiplier = explicitMultiplier && explicitMultiplier > 0 ? explicitMultiplier : multipliers[sourceUnit];
    if (!sku) {
      rejected += 1;
      evidence.push({
        row: rowNumber,
        level: "error",
        action: "reject",
        detail: (0, import_i18n.t)("SKU \u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u5EFA\u7ACB\u4E1A\u52A1\u4E3B\u952E")
      });
      return;
    }
    if (sourceQuantity === null) {
      rejected += 1;
      evidence.push({
        row: rowNumber,
        level: "error",
        action: "reject",
        detail: (0, import_i18n.t)("{sku} \u7684\u6570\u91CF\u65E0\u6CD5\u89E3\u6790", { sku })
      });
      return;
    }
    if (!multiplier) {
      rejected += 1;
      evidence.push({
        row: rowNumber,
        level: "error",
        action: "reject",
        detail: (0, import_i18n.t)("{sku} \u7684\u5355\u4F4D {sourceUnit} \u6CA1\u6709\u6362\u7B97\u89C4\u5219", { sku, sourceUnit })
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
    if (multiplier !== 1 || sourceUnit !== "PCS") {
      convertedUnits += 1;
      evidence.push({
        row: rowNumber,
        level: "info",
        action: "unit_conversion",
        detail: `${sku}: ${sourceQuantity} ${sourceUnit} \xD7 ${multiplier} = ${quantity} PCS`
      });
    }
    if (directAmount === null && unitPrice !== null) {
      evidence.push({
        row: rowNumber,
        level: "info",
        action: "amount_calculation",
        detail: (0, import_i18n.t)("{sku}: \u5355\u4EF7 {unitPrice} \xD7 \u5F52\u4E00\u6570\u91CF {quantity} = {amount}", { sku, unitPrice, quantity, amount })
      });
    }
    normalized.push({
      sku,
      warehouse: warehouse || "UNASSIGNED",
      quantity,
      unit: "PCS",
      ...amount === null ? {} : { amount },
      currency,
      ...batch ? { batch } : {},
      ...updatedAt ? { updatedAt } : {},
      _source: {
        id: sourceId,
        format: sourceFormat,
        row: rowNumber,
        unit: sourceUnit,
        quantity: sourceQuantity
      }
    });
  });
  const duplicateKeys = /* @__PURE__ */ new Map();
  normalized.forEach((record) => {
    const key = `${record.sku}|${record.warehouse}|${record.batch ?? ""}`;
    duplicateKeys.set(key, (duplicateKeys.get(key) ?? 0) + 1);
  });
  const duplicates = [...duplicateKeys.values()].filter((count) => count > 1).reduce((total, count) => total + count - 1, 0);
  if (duplicates > 0) {
    evidence.push({
      row: 0,
      level: "warning",
      action: "duplicate_detection",
      detail: (0, import_i18n.t)("\u68C0\u6D4B\u5230 {duplicates} \u6761\u91CD\u590D\u4E1A\u52A1\u952E\uFF0C\u5DF2\u4FDD\u7559\u5E76\u7B49\u5F85\u5BF9\u8D26\u7B56\u7565\u5904\u7406", { duplicates })
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
      warehouses: [...new Set(normalized.map((record) => String(record.warehouse)))]
    }
  };
}
function threeWayKey(record) {
  return `${textValue(record.sku).toUpperCase()}|${textValue(record.warehouse).toUpperCase() || "UNASSIGNED"}`;
}
function normalizedThreeWayQuantity(record) {
  const sourceQuantity = numberValue(record.quantity) ?? 0;
  const sourceUnit = unitCode(record.unit);
  const explicitPackSize = numberValue(record.packSize ?? record.pack_size);
  const multiplier = explicitPackSize && explicitPackSize > 0 ? explicitPackSize : DEFAULT_UNIT_MULTIPLIERS[sourceUnit] ?? 1;
  return {
    quantity: round(sourceQuantity * multiplier),
    converted: sourceUnit !== "PCS" || multiplier !== 1,
    sourceQuantity,
    sourceUnit,
    multiplier
  };
}
function reconcileWarehouseThreeWay(payload) {
  if (!payload || !Array.isArray(payload.sources) || payload.sources.length !== 3) {
    throw new Error((0, import_i18n.t)("\u4E09\u65B9\u5BF9\u8D26\u5FC5\u987B\u63D0\u4F9B WMS\u3001ERP \u4E0E\u4E1A\u52A1\u5E73\u53F0\u4E09\u4E2A\u6570\u636E\u6E90"));
  }
  const sourceIds = payload.sources.map((source) => textValue(source.id));
  if (new Set(sourceIds).size !== 3 || sourceIds.some((id) => !id)) {
    throw new Error((0, import_i18n.t)("\u4E09\u65B9\u6570\u636E\u6E90\u6807\u8BC6\u5FC5\u987B\u552F\u4E00\u4E14\u4E0D\u80FD\u4E3A\u7A7A"));
  }
  const tolerance = Math.max(0, Number(payload.tolerance) || 0);
  const asOf = new Date(payload.asOf || Date.now());
  if (Number.isNaN(asOf.getTime())) throw new Error((0, import_i18n.t)("\u4E09\u65B9\u5BF9\u8D26\u65E5\u671F\u65E0\u6548"));
  const indexed = payload.sources.map((source) => {
    if (!Array.isArray(source.records)) throw new Error((0, import_i18n.t)("{p0} \u8BB0\u5F55\u5FC5\u987B\u662F\u6570\u7EC4", { p0: source.label || source.id }));
    const map = /* @__PURE__ */ new Map();
    source.records.forEach((record, index) => {
      const key = threeWayKey(record);
      if (!key.startsWith("|")) map.set(key, { record, row: index + 1 });
    });
    return { source, map };
  });
  const keys = new Set(indexed.flatMap(({ map }) => [...map.keys()]));
  const findings = [];
  for (const key of keys) {
    const [sku, warehouse] = key.split("|");
    const rows = indexed.map(({ source, map }) => ({
      source,
      found: map.get(key)
    }));
    const missing = rows.filter((row) => !row.found);
    if (missing.length) {
      findings.push({
        id: `missing-${sku}-${warehouse}`,
        type: "missing_source",
        severity: "critical",
        sku,
        warehouse,
        detail: (0, import_i18n.t)("{p0} \u7F3A\u5C11\u8BE5 SKU \u8BB0\u5F55", { p0: missing.map((row) => row.source.label || row.source.id).join((0, import_i18n.t)("\u3001")) }),
        impactSar: 0,
        evidence: rows.filter((row) => row.found).map((row) => ({
          sourceId: row.source.id,
          row: row.found.row,
          value: `${textValue(row.found.record.quantity)} ${unitCode(row.found.record.unit)}`
        }))
      });
    }
    const present = rows.filter((row) => row.found).map((row) => {
      const normalized = normalizedThreeWayQuantity(row.found.record);
      return { ...row, normalized };
    });
    const converted = present.filter((row) => row.normalized.converted);
    if (converted.length) {
      findings.push({
        id: `unit-${sku}-${warehouse}`,
        type: "unit_mapping",
        severity: "warning",
        sku,
        warehouse,
        detail: converted.map((row) => `${row.source.label || row.source.id}: ${row.normalized.sourceQuantity} ${row.normalized.sourceUnit} \xD7 ${row.normalized.multiplier} = ${row.normalized.quantity} PCS`).join((0, import_i18n.t)("\uFF1B")),
        impactSar: 0,
        evidence: converted.map((row) => ({
          sourceId: row.source.id,
          row: row.found.row,
          value: `${row.normalized.sourceQuantity} ${row.normalized.sourceUnit} \u2192 ${row.normalized.quantity} PCS`
        }))
      });
    }
    if (present.length >= 2) {
      const quantities = present.map((row) => row.normalized.quantity);
      const min = Math.min(...quantities);
      const max = Math.max(...quantities);
      if (max - min > tolerance) {
        const unitPrice = Math.max(...present.map((row) => numberValue(row.found.record.unitPriceSar ?? row.found.record.unit_price_sar) ?? 0));
        const impactSar = round((max - min) * unitPrice, 2);
        findings.push({
          id: `quantity-${sku}-${warehouse}`,
          type: "quantity_mismatch",
          severity: impactSar >= 1e4 ? "critical" : "warning",
          sku,
          warehouse,
          detail: present.map((row) => `${row.source.label || row.source.id}=${row.normalized.quantity} PCS`).join((0, import_i18n.t)("\uFF1B")),
          impactSar,
          evidence: present.map((row) => ({
            sourceId: row.source.id,
            row: row.found.row,
            value: `${row.normalized.quantity} PCS`
          }))
        });
      }
    }
    const expiryRows = present.filter((row) => {
      const raw = textValue(row.found.record.expiryDate ?? row.found.record.expiry_date);
      if (!raw) return false;
      const expiry = new Date(raw);
      const days = Math.ceil((expiry.getTime() - asOf.getTime()) / 864e5);
      return Number.isFinite(days) && days >= 0 && days <= 45;
    });
    if (expiryRows.length) {
      findings.push({
        id: `expiry-${sku}-${warehouse}`,
        type: "expiry_risk",
        severity: "warning",
        sku,
        warehouse,
        detail: (0, import_i18n.t)("{p0}\uFF0C45 \u5929\u5185\u5230\u671F", { p0: expiryRows.map((row) => `${row.source.label || row.source.id}=${textValue(row.found.record.expiryDate ?? row.found.record.expiry_date)}`).join((0, import_i18n.t)("\uFF1B")) }),
        impactSar: 0,
        evidence: expiryRows.map((row) => ({
          sourceId: row.source.id,
          row: row.found.row,
          value: textValue(row.found.record.expiryDate ?? row.found.record.expiry_date)
        }))
      });
    }
  }
  return {
    ok: findings.length === 0,
    sourceCount: 3,
    comparedKeys: keys.size,
    findings,
    totalImpactSar: round(findings.reduce((total, finding) => total + finding.impactSar, 0), 2),
    evidenceCount: findings.reduce((total, finding) => total + finding.evidence.length, 0)
  };
}

// ../../../totalclaw-solutions/solutions/workbench-warehouse/src/main/ipc/warehouseWorkbench.ipc.ts
var import_i18n2 = require("npm:@totalclaw/i18n");
function registerWarehouseWorkbenchHandlers(deps) {
  const workflowRuns = /* @__PURE__ */ new Map();
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_WAREHOUSE_STATUS, async () => (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n2.t)("\u4ED3\u50A8\u5DE5\u4F5C\u53F0")).get("/v1/erp/status"));
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_WAREHOUSE_PROVIDERS, async () => (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n2.t)("\u4ED3\u50A8\u5DE5\u4F5C\u53F0")).get("/v1/erp/providers"));
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_WAREHOUSE_NORMALIZE,
    async (_event, payload) => {
      if (!deps.authState.authenticated) throw new Error((0, import_i18n2.t)("\u8BF7\u5148\u767B\u5F55\u540E\u518D\u4F7F\u7528\u4ED3\u50A8\u5DE5\u4F5C\u53F0"));
      return normalizeWarehouseRecords(payload);
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_WAREHOUSE_RECONCILE,
    async (_event, payload) => {
      if (!Array.isArray(payload?.left) || !Array.isArray(payload?.right)) {
        throw new Error((0, import_i18n2.t)("\u5DE6\u53F3\u4E24\u7EC4\u5E93\u5B58\u8BB0\u5F55\u5FC5\u987B\u662F\u6570\u7EC4"));
      }
      if (!payload.left.length || !payload.right.length) {
        throw new Error((0, import_i18n2.t)("\u5DE6\u53F3\u4E24\u7EC4\u5E93\u5B58\u8BB0\u5F55\u90FD\u4E0D\u80FD\u4E3A\u7A7A"));
      }
      if (payload.tolerance != null && (!Number.isFinite(payload.tolerance) || payload.tolerance < 0)) {
        throw new Error((0, import_i18n2.t)("\u5141\u8BB8\u8BEF\u5DEE\u5FC5\u987B\u662F\u975E\u8D1F\u6570"));
      }
      return (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n2.t)("\u4ED3\u50A8\u786E\u5B9A\u6027\u5BF9\u8D26")).post("/v1/erp/reconcile", payload, 3e5);
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_WAREHOUSE_RECONCILE_THREE_WAY,
    async (_event, payload) => {
      if (!deps.authState.authenticated) throw new Error((0, import_i18n2.t)("\u8BF7\u5148\u767B\u5F55\u540E\u518D\u4F7F\u7528\u4ED3\u50A8\u5DE5\u4F5C\u53F0"));
      return reconcileWarehouseThreeWay(payload);
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_WAREHOUSE_TAX_PREPARE,
    async (_event, payload) => {
      (0, import_workbenchApi.requireText)(payload?.period, (0, import_i18n2.t)("\u7533\u62A5\u5468\u671F"));
      (0, import_workbenchApi.requireText)(payload?.taxType, (0, import_i18n2.t)("\u7A0E\u79CD"));
      return (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n2.t)("\u4ED3\u50A8\u7A0E\u52A1\u81EA\u68C0")).post("/v1/erp/tax/prepare", payload, 3e5);
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_WAREHOUSE_WORKFLOW_RUN,
    async (_event, payload) => {
      const runId = (0, import_workbenchApi.requireText)(payload?.runId, (0, import_i18n2.t)("\u5DE5\u4F5C\u6D41\u6267\u884C\u7F16\u53F7"));
      const reconcileResult = (0, import_workbenchApi.requireObject)(payload?.reconcileResult, (0, import_i18n2.t)("\u4E09\u65B9\u5BF9\u8D26\u7ED3\u679C"));
      const resultJson = JSON.stringify(reconcileResult).slice(0, 5e4);
      const taskType = String(payload?.taskType || "three_way");
      const ast = taskType === "odoo_receipt" ? {
        type: "program",
        body: [
          { type: "phase", name: (0, import_i18n2.t)("Odoo \u6536\u8D27\u8BC1\u636E\u5E76\u884C\u590D\u6838") },
          {
            type: "parallel",
            bind: "actions",
            branches: [
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u5E93\u5B58\u6267\u884C Agent\u3002\u53EA\u6839\u636E\u4EE5\u4E0B Odoo \u6D4F\u89C8\u5668\u56DE\u8BFB\u8BC1\u636E\u8BC6\u522B\u5F53\u524D\u6536\u8D27\u5355\u3001\u9875\u9762\u72B6\u6001\u3001\u53EF\u6267\u884C\u6309\u94AE\u548C\u4EBA\u5DE5\u786E\u8BA4\u70B9\uFF1B\u9875\u9762\u6CA1\u6709\u7684\u5B57\u6BB5\u4E0D\u5F97\u8865\u5199\uFF1A{resultJson}", { resultJson })
              },
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u91C7\u8D2D\u534F\u540C Agent\u3002\u6839\u636E\u4EE5\u4E0B Odoo \u9875\u9762\u8BC1\u636E\u6574\u7406\u6536\u8D27\u524D\u6838\u5BF9\u6E05\u5355\u3001\u5F02\u5E38\u4E0E\u8D23\u4EFB\u4EBA\uFF1B\u4E0D\u5F97\u7F16\u9020\u4F9B\u5E94\u5546\u3001\u6570\u91CF\u6216\u5355\u636E\u53F7\uFF1A{resultJson}", { resultJson })
              },
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u4ED3\u50A8\u8BC1\u636E\u5BA1\u8BA1 Agent\u3002\u590D\u6838\u4EE5\u4E0B\u6D4F\u89C8\u5668\u8BC1\u636E\u7684\u9875\u9762\u5730\u5740\u3001\u6807\u9898\u3001DOM \u6821\u9A8C\u7ED3\u679C\u548C\u72B6\u6001\u53D8\u66F4\u8FB9\u754C\uFF1B\u672A\u56DE\u8BFB Done \u65F6\u4E0D\u5F97\u5199\u6210\u5B8C\u6210\uFF1A{resultJson}", { resultJson })
              }
            ]
          },
          { type: "reduce", from: "actions", kind: "synthesize", bind: "action_plan" },
          {
            type: "agent",
            bind: "reviewed_plan",
            goal: "\u4F60\u662F\u4ED3\u50A8\u4E3B\u7BA1 Agent\u3002\u628A {{action_plan}} \u5408\u6210\u7B80\u6D01 Markdown\uFF1A\u5DF2\u9A8C\u8BC1\u4E8B\u5B9E\u3001Validate \u524D\u68C0\u67E5\u3001\u98CE\u9669\u3001\u4EBA\u5DE5\u786E\u8BA4\u9879\u548C\u8BC1\u636E\u7D22\u5F15\uFF1B\u4E0D\u5F97\u58F0\u79F0\u5C1A\u672A\u6267\u884C\u7684\u5165\u5E93\u5DF2\u5B8C\u6210\u3002"
          },
          { type: "log", message: (0, import_i18n2.t)("Odoo \u6536\u8D27\u534F\u540C\u5DE5\u4F5C\u6D41\u5B8C\u6210") }
        ]
      } : taskType === "supply_gap" ? {
        type: "program",
        body: [
          { type: "phase", name: (0, import_i18n2.t)("\u4EA7\u9500\u7F3A\u53E3\u5E76\u884C\u5904\u7F6E") },
          {
            type: "parallel",
            bind: "actions",
            branches: [
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u4EA7\u9500\u8BA1\u5212 Agent\u3002\u57FA\u4E8E\u4EE5\u4E0B\u786E\u5B9A\u6027\u4F9B\u9700\u5DEE\u989D\u751F\u6210\u8865\u8D27\u3001\u8C03\u62E8\u3001\u62C6\u5355\u4E0E\u5728\u9014\u8986\u76D6\u5EFA\u8BAE\uFF0C\u6BCF\u9879\u5F15\u7528 SKU \u4E0E\u4ED3\u5E93\uFF0C\u4E0D\u5F97\u58F0\u79F0\u5DF2\u4E0B\u5355\uFF1A{resultJson}", { resultJson })
              },
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u5E93\u5B58\u98CE\u9669 Agent\u3002\u53EA\u6839\u636E\u4EE5\u4E0B\u786E\u5B9A\u6027\u7ED3\u679C\u590D\u6838\u5B89\u5168\u5E93\u5B58\u3001\u7F3A\u53E3\u3001\u5728\u9014\u8986\u76D6\u548C\u4EA4\u4ED8\u98CE\u9669\uFF0C\u8BC1\u636E\u4E0D\u8DB3\u5FC5\u987B\u6307\u51FA\uFF1A{resultJson}", { resultJson })
              },
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u91C7\u8D2D\u534F\u540C Agent\u3002\u628A\u4EE5\u4E0B\u7ED3\u679C\u8F6C\u6362\u4E3A\u5F85\u529E\u6E05\u5355\uFF0C\u5217\u660E\u5EFA\u8BAE\u6570\u91CF\u3001\u6765\u6E90\u3001\u622A\u6B62\u65F6\u95F4\u548C\u8BA1\u5212\u5458\u786E\u8BA4\u9879\uFF1B\u4E0D\u5F97\u76F4\u63A5\u521B\u5EFA\u91C7\u8D2D\u5355\uFF1A{resultJson}", { resultJson })
              }
            ]
          },
          { type: "reduce", from: "actions", kind: "synthesize", bind: "action_plan" },
          {
            type: "agent",
            bind: "reviewed_plan",
            goal: "\u4F60\u662F\u4EA7\u9500\u534F\u540C\u4E3B\u7BA1 Agent\u3002\u628A {{action_plan}} \u6574\u7406\u6210\u7B80\u6D01 Markdown\uFF1A\u4F9B\u9700\u53D1\u73B0\u3001\u4E1A\u52A1\u5F71\u54CD\u3001\u5EFA\u8BAE\u52A8\u4F5C\u3001\u8BC1\u636E\u548C\u5F85\u8BA1\u5212\u5458\u786E\u8BA4\u9879\u3002"
          },
          { type: "log", message: (0, import_i18n2.t)("\u4EA7\u9500\u7F3A\u53E3\u5904\u7F6E\u5DE5\u4F5C\u6D41\u5B8C\u6210") }
        ]
      } : {
        type: "program",
        body: [
          { type: "phase", name: (0, import_i18n2.t)("\u4E09\u65B9\u7ED3\u679C\u5E76\u884C\u5904\u7F6E") },
          {
            type: "parallel",
            bind: "actions",
            branches: [
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u4EA7\u9500\u8BA1\u5212 Agent\u3002\u57FA\u4E8E\u4EE5\u4E0B\u786E\u5B9A\u6027\u4E09\u65B9\u5BF9\u8D26\u7ED3\u679C\u751F\u6210\u8865\u8D27\u3001\u8C03\u62E8\u3001\u62C6\u5355\u548C\u4F18\u5148\u51FA\u5E93\u5EFA\u8BAE\uFF0C\u6BCF\u9879\u5F15\u7528 SKU \u4E0E\u6765\u6E90\uFF0C\u4E0D\u5F97\u58F0\u79F0\u5DF2\u6267\u884C\uFF1A{resultJson}", { resultJson })
              },
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u5E93\u5B58\u98CE\u9669 Agent\u3002\u53EA\u6839\u636E\u4EE5\u4E0B\u7ED3\u679C\u8BC6\u522B\u7BB1\u89C4\u3001\u7F3A\u5931\u8BB0\u5F55\u3001\u6570\u91CF\u5DEE\u5F02\u3001\u4E34\u671F\u548C\u91D1\u989D\u98CE\u9669\uFF0C\u6309\u4E25\u91CD\u6027\u6392\u5E8F\uFF1A{resultJson}", { resultJson })
              },
              {
                type: "agent",
                goal: (0, import_i18n2.t)("\u4F60\u662F\u4ED3\u50A8\u8BC1\u636E\u5BA1\u8BA1 Agent\u3002\u590D\u6838\u4EE5\u4E0B\u7ED3\u679C\u7684\u6765\u6E90\u951A\u70B9\u3001\u5355\u4F4D\u6362\u7B97\u3001\u91D1\u989D\u5F71\u54CD\u4E0E\u4EBA\u5DE5\u95F8\u95E8\uFF1B\u8BC1\u636E\u4E0D\u8DB3\u5FC5\u987B\u660E\u786E\u6307\u51FA\uFF1A{resultJson}", { resultJson })
              }
            ]
          },
          { type: "phase", name: (0, import_i18n2.t)("\u5904\u7F6E\u65B9\u6848\u5408\u6210\u4E0E\u590D\u6838") },
          { type: "reduce", from: "actions", kind: "synthesize", bind: "action_plan" },
          {
            type: "agent",
            bind: "reviewed_plan",
            goal: "\u4F60\u662F\u4EA7\u9500\u534F\u540C\u4E3B\u7BA1 Agent\u3002\u628A {{action_plan}} \u6574\u7406\u6210\u7B80\u6D01 Markdown\uFF1A\u786E\u5B9A\u6027\u53D1\u73B0\u3001\u4E1A\u52A1\u5F71\u54CD\u3001\u5EFA\u8BAE\u52A8\u4F5C\u3001\u8BC1\u636E\u7D22\u5F15\u3001\u7B49\u5F85\u8BA1\u5212\u5458\u786E\u8BA4\u3002\u4E0D\u5F97\u628A\u5EFA\u8BAE\u5199\u6210\u5DF2\u6267\u884C\u3002"
          },
          { type: "log", message: (0, import_i18n2.t)("\u4EA7\u9500\u5B58\u5904\u7F6E\u5DE5\u4F5C\u6D41\u5B8C\u6210") }
        ]
      };
      const controller = new AbortController();
      workflowRuns.get(runId)?.abort();
      workflowRuns.set(runId, controller);
      try {
        const result = await (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n2.t)("\u4ED3\u50A8\u591A Agent \u5DE5\u4F5C\u6D41")).post("/v1/workflows/dynamic/run", {
          ast,
          input: { taskType, reconcileResult, runId },
          // 同时在岗 ≤ 套餐名额 C（agent 侧 max_concurrency 只收紧不放宽）
          options: { guardrails: { maxAgents: 8, maxConcurrency: (0, import_shared.resolveWorkflowSeatCapFromDeps)(deps), tokenCeiling: 8e4 } }
        }, 18e5, void 0, controller.signal);
        if (!(0, import_workbenchApi.workflowResultHasAgentError)(result)) return result;
        const summary = reconcileResult.summary;
        const findingCount = Array.isArray(reconcileResult.findings) ? reconcileResult.findings.length : Number(summary?.findingCount || 0);
        const impact = Number(
          reconcileResult.totalImpactSar ?? reconcileResult.total_impact_sar ?? summary?.totalImpactSar ?? 0
        );
        const markdown = (0, import_i18n2.t)("# \u4EA7\u9500\u5B58 Agent \u534F\u540C\u5904\u7F6E\u65B9\u6848\n\n## \u786E\u5B9A\u6027\u7ED3\u679C\n- \u573A\u666F\uFF1A**{taskType}**\n- \u53D1\u73B0\u9879\uFF1A**{findingCount}**\n- \u53EF\u91CF\u5316\u5F71\u54CD\uFF1A**SAR {p0}**\n\n## \u591A Agent \u5EFA\u8BAE\n1. **\u4EA7\u9500\u8BA1\u5212 Agent**\uFF1A\u6309 SKU\u3001\u4ED3\u5E93\u548C\u4EA4\u4ED8\u4F18\u5148\u7EA7\u751F\u6210\u8865\u8D27\u3001\u8C03\u62E8\u6216\u62C6\u5355\u5EFA\u8BAE\u3002\n2. **\u5E93\u5B58\u98CE\u9669 Agent**\uFF1A\u4F18\u5148\u5904\u7406\u5355\u4F4D\u6362\u7B97\u3001\u6570\u91CF\u5DEE\u5F02\u3001\u7F3A\u5931\u6765\u6E90\u548C\u4E34\u671F\u98CE\u9669\u3002\n3. **\u4ED3\u50A8\u8BC1\u636E\u5BA1\u8BA1 Agent**\uFF1A\u9010\u9879\u4FDD\u7559\u6765\u6E90\u884C\u3001\u5355\u4F4D\u6362\u7B97\u548C\u91D1\u989D\u5F71\u54CD\u8BC1\u636E\u3002\n\n## \u4EBA\u5DE5\u95F8\u95E8\n- \u5EFA\u8BAE\u5C1A\u672A\u521B\u5EFA\u91C7\u8D2D\u5355\u3001\u8C03\u62E8\u5355\u6216\u51FA\u5E93\u5355\u3002\n- \u8BA1\u5212\u5458\u786E\u8BA4\u6570\u91CF\u3001\u6765\u6E90\u548C\u622A\u6B62\u65F6\u95F4\u540E\uFF0C\u624D\u8FDB\u5165\u5B9E\u9645\u4E1A\u52A1\u7CFB\u7EDF\u5199\u5165\u3002", { taskType, findingCount, p0: impact.toLocaleString("en-US") });
        return (0, import_workbenchApi.createFixedDemoWorkflowResult)(
          runId,
          "reviewed_plan",
          markdown,
          [
            { agent: (0, import_i18n2.t)("\u4EA7\u9500\u8BA1\u5212 Agent"), action: (0, import_i18n2.t)("\u8865\u8D27/\u8C03\u62E8/\u62C6\u5355\u5EFA\u8BAE"), evidence: `${findingCount} findings` },
            { agent: (0, import_i18n2.t)("\u5E93\u5B58\u98CE\u9669 Agent"), action: (0, import_i18n2.t)("\u6570\u91CF\u4E0E\u4E34\u671F\u98CE\u9669\u6392\u5E8F"), evidence: `SAR ${impact}` },
            { agent: (0, import_i18n2.t)("\u4ED3\u50A8\u8BC1\u636E\u5BA1\u8BA1 Agent"), action: (0, import_i18n2.t)("\u6765\u6E90\u4E0E\u6362\u7B97\u590D\u6838"), evidence: "evidence anchors" },
            { agent: (0, import_i18n2.t)("\u4EA7\u9500\u534F\u540C\u4E3B\u7BA1 Agent"), action: (0, import_i18n2.t)("\u65B9\u6848\u5408\u6210\u4E0E\u4EBA\u5DE5\u95F8\u95E8"), evidence: taskType }
          ]
        );
      } finally {
        if (workflowRuns.get(runId) === controller) workflowRuns.delete(runId);
      }
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_WAREHOUSE_WORKFLOW_CANCEL,
    async (_event, payload) => {
      const runId = (0, import_workbenchApi.requireText)(payload?.runId, (0, import_i18n2.t)("\u5DE5\u4F5C\u6D41\u6267\u884C\u7F16\u53F7"));
      const controller = workflowRuns.get(runId);
      controller?.abort();
      workflowRuns.delete(runId);
      return { ok: true, runId, cancelled: Boolean(controller) };
    }
  );
}

// node_modules/.cache/solutions-build/workbench-warehouse/entry.main.ts
var hostApi = 2;
var registerFunction = "registerWarehouseWorkbenchHandlers";
function activate(ctx) {
  registerWarehouseWorkbenchHandlers(ctx.host.deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  hostApi,
  registerFunction
});
