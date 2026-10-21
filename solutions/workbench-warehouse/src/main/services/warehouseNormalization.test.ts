import { describe, expect, it } from 'vitest';
import {
  normalizeWarehouseRecords,
  reconcileWarehouseThreeWay,
} from './warehouseNormalization';

describe('normalizeWarehouseRecords', () => {
  it('maps nested fields and converts cartons to pieces with traceable evidence', () => {
    const result = normalizeWarehouseRecords({
      sourceId: 'commerce-api',
      format: 'json',
      records: [{
        item: { code: 'sku-001' },
        stock: { available: '2', unit: 'CTN', pack: 12 },
        location: { code: 'ruh-a' },
        price: 'SAR 100.00',
      }],
      mapping: {
        sku: 'item.code',
        warehouse: 'location.code',
        quantity: 'stock.available',
        unit: 'stock.unit',
        packSize: 'stock.pack',
        unitPrice: 'price',
      },
    });

    expect(result.ok).toBe(true);
    expect(result.records[0]).toMatchObject({
      sku: 'SKU-001',
      warehouse: 'RUH-A',
      quantity: 24,
      unit: 'PCS',
      amount: 2400,
    });
    expect(result.records[0]._source).toMatchObject({
      id: 'commerce-api',
      format: 'json',
      row: 1,
      unit: 'CTN',
      quantity: 2,
    });
    expect(result.summary.convertedUnits).toBe(1);
    expect(result.evidence.map((item) => item.action)).toEqual([
      'unit_conversion',
      'amount_calculation',
    ]);
  });

  it('normalizes Arabic digits and reports rejected and duplicate rows', () => {
    const result = normalizeWarehouseRecords({
      sourceId: 'scanner',
      format: 'ndjson',
      records: [
        { barcode: 'sku-009', zone: 'jed-b', counted: '١٢', unit: 'EA' },
        { barcode: 'sku-009', zone: 'jed-b', counted: '12', unit: 'EA' },
        { barcode: '', zone: 'jed-b', counted: '2', unit: 'EA' },
      ],
      mapping: {
        sku: 'barcode',
        warehouse: 'zone',
        quantity: 'counted',
        unit: 'unit',
      },
    });

    expect(result.ok).toBe(false);
    expect(result.records).toHaveLength(2);
    expect(result.records[0].quantity).toBe(12);
    expect(result.summary.rejected).toBe(1);
    expect(result.summary.duplicates).toBe(1);
    expect(result.evidence).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'reject', level: 'error' }),
      expect.objectContaining({ action: 'duplicate_detection', level: 'warning' }),
    ]));
  });

  it('rejects unknown units until a user-defined multiplier is supplied', () => {
    const input = {
      sourceId: 'legacy-edi',
      format: 'xml',
      records: [{ sku: 'A-1', qty: 3, uom: 'TRAY' }],
      mapping: { sku: 'sku', quantity: 'qty', unit: 'uom' },
    };

    expect(normalizeWarehouseRecords(input).summary.rejected).toBe(1);
    expect(normalizeWarehouseRecords({
      ...input,
      unitMultipliers: { TRAY: 20 },
    }).records[0].quantity).toBe(60);
  });

  it('reconciles WMS, ERP and commerce records with five traceable findings', () => {
    const result = reconcileWarehouseThreeWay({
      asOf: '2026-07-29',
      sources: [
        {
          id: 'wms',
          label: 'WMS',
          records: [
            { sku: 'SKU-100', warehouse: 'RUH-A', quantity: 100, unit: 'PCS', unitPriceSar: 520 },
            { sku: 'SKU-200', warehouse: 'JED-B', quantity: 40, unit: 'PCS' },
            { sku: 'SKU-300', warehouse: 'DMM-C', quantity: 30, unit: 'PCS', unitPriceSar: 5000 },
            { sku: 'SKU-400', warehouse: 'RUH-A', quantity: 60, unit: 'PCS', expiryDate: '2026-08-15' },
          ],
        },
        {
          id: 'erp',
          label: 'SAP ERP',
          records: [
            { sku: 'SKU-100', warehouse: 'RUH-A', quantity: 10, unit: 'CTN', packSize: 12, unitPriceSar: 520 },
            { sku: 'SKU-200', warehouse: 'JED-B', quantity: 40, unit: 'PCS' },
            { sku: 'SKU-300', warehouse: 'DMM-C', quantity: 30, unit: 'PCS', unitPriceSar: 5000 },
            { sku: 'SKU-400', warehouse: 'RUH-A', quantity: 60, unit: 'PCS' },
          ],
        },
        {
          id: 'commerce',
          label: '电商平台',
          records: [
            { sku: 'SKU-100', warehouse: 'RUH-A', quantity: 120, unit: 'PCS', unitPriceSar: 520 },
            { sku: 'SKU-300', warehouse: 'DMM-C', quantity: 25, unit: 'PCS', unitPriceSar: 5000 },
            { sku: 'SKU-400', warehouse: 'RUH-A', quantity: 60, unit: 'PCS' },
          ],
        },
      ],
    });

    expect(result.sourceCount).toBe(3);
    expect(result.comparedKeys).toBe(4);
    expect(result.findings).toHaveLength(5);
    expect(result.totalImpactSar).toBe(35_400);
    expect(result.evidenceCount).toBeGreaterThanOrEqual(9);
    expect(result.findings.map((finding) => finding.type)).toEqual(expect.arrayContaining([
      'unit_mapping',
      'quantity_mismatch',
      'missing_source',
      'expiry_risk',
    ]));
  });
});
