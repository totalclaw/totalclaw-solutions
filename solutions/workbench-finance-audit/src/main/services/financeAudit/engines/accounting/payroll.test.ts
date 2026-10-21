/**
 * A7 薪酬核算：中国个税累计预扣（与财务智能体 computeIit 一致）、社保公积金、增减员、计提分录；
 * 沙特 GOSI 与期末服务金分段计算（期望值见夹具注释，手算）。
 */
import { describe, expect, it } from 'vitest';
import * as FX from '../../__fixtures__/accounting/subledgers';
import { parse } from '../../__fixtures__/accounting/parse';
import { thresholdsFor } from '../../thresholds';
import { computeIit } from '../../../financeAgent/tax';
import { eosbLiability, monthIndexOf, payrollReview } from './payroll/engine';

const Y = (yuan: number) => Math.round(yuan * 100);
const th = thresholdsFor('payroll');
const cnRows = parse('payroll', FX.PAYROLL_CN).rows;
const cn = payrollReview({ regime: 'cn', period: FX.PERIOD, rows: cnRows, prior: parse('payroll', FX.PAYROLL_CN_PRIOR).rows, cnCodes: true, th });
const emp = (id: string) => cn.lines.find((l) => l.empId === id)!;
const codes = (id: string) => emp(id).flags.map((f) => f.code);

describe('A7 中国', () => {
  it('个税累计预扣与财务智能体 computeIit 逐人一致', () => {
    expect(emp('E001').iitExpected).toBe(Y(950));
    expect(emp('E002').iitExpected).toBe(Y(48));
    expect(emp('E003').iitExpected).toBe(Y(3.75));
    for (const r of cnRows) {
      const l = emp(r.empId);
      const direct = computeIit({
        name: r.name, salary: r.gross / 100, insurance: ((r.socialPersonal ?? 0) + (r.fundPersonal ?? 0)) / 100, special: r.special / 100,
        ytdSalary: r.ytdIncome / 100, ytdInsurance: r.ytdInsurance / 100, ytdSpecial: r.ytdSpecial / 100, ytdTaxPaid: r.ytdTaxPaid / 100, monthIndex: monthIndexOf(r, FX.PERIOD),
      });
      expect(l.iitExpected).toBe(Math.round((direct.taxThisMonth ?? 0) * 100));
    }
    expect(monthIndexOf(cnRows[1], FX.PERIOD)).toBe(3);
  });

  it('社保公积金个人部分 8% + 2% + 0.5% + 7%；实扣差异、实发不一致、个税误差', () => {
    expect(emp('E001')).toMatchObject({ personalExpected: Y(3500), personal: Y(3500), netExpected: Y(15550) });
    expect(codes('E001')).toEqual([]);
    expect(emp('E002').flags).toContainEqual(expect.objectContaining({ code: 'pay.iit_mismatch', level: 'warn' }));
    expect(emp('E003')).toMatchObject({ personalExpected: Y(875), netExpected: Y(5121.25) });
    expect(codes('E003')).toContain('pay.net_mismatch');
    expect(emp('E001').employer).toBe(Y(3300) + Y(1400));
  });

  it('增减员与离职仍发薪', () => {
    expect(cn.changes!.map((c) => [c.kind, c.empId])).toEqual([['hire', 'E002'], ['leave', 'E009']]);
    expect(emp('E004').flags).toContainEqual(expect.objectContaining({ code: 'pay.leaver_paid', level: 'block' }));
    expect(cn.escalations.some((e) => e.params?.p0 === '赵六')).toBe(true);
  });

  it('计提分录：按部门归费用科目，借贷平衡', () => {
    const dr = cn.je.reduce((s, l) => s + l.debit, 0);
    const cr = cn.je.reduce((s, l) => s + l.credit, 0);
    expect(dr).toBe(cr);
    expect(cn.je.filter((l) => l.debit && l.accountCode === '6601').map((l) => l.debit)[0]).toBe(Y(8000));
    expect(cn.je.filter((l) => l.debit && l.accountCode === '5101').map((l) => l.debit)[0]).toBe(Y(6000));
    expect(cn.je.find((l) => l.credit && l.accountCode === '2221')!.credit).toBe(Y(950 + 100 + 3.75));
  });
});

describe('A7 沙特', () => {
  const sa = payrollReview({ regime: 'sa', period: FX.PERIOD, rows: parse('payroll', FX.PAYROLL_SA).rows, prior: null, cnCodes: false, th });
  const s = (id: string) => sa.lines.find((l) => l.empId === id)!;
  it('GOSI：沙特籍 9% + 0.75%，单位 9% + 0.75% + 2%；非沙特籍只交职业危害', () => {
    expect(s('S001')).toMatchObject({ base: Y(12500), personalExpected: Y(1218.75), employer: Y(1468.75) });
    expect(s('S001').flags.map((f) => f.code)).not.toContain('pay.gosi_mismatch');
    expect(s('S002')).toMatchObject({ personalExpected: 0, employer: Y(200) });
  });

  it('期末服务金分段：前 5 年每年半个月工资，之后每年一个月', () => {
    expect(eosbLiability(Y(12500), 5, th)).toBe(Y(31250));
    expect(eosbLiability(Y(12500), 7, th)).toBe(Y(56250));
    expect(eosbLiability(Y(10000), 2, th)).toBe(Y(10000));
    expect(s('S001').eosb).toMatchObject({ wage: Y(12500), liability: Y(51078.77), booked: Y(48000), diff: Y(-3078.77) });
    expect(s('S001').flags.map((f) => f.code)).toContain('pay.eosb_mismatch');
    expect(s('S002').eosb).toMatchObject({ liability: Y(13739.73), booked: null });
    expect(sa.totals.eosbAccrual).toBe(Y(3078.77) + Y(410.96));
  });

  it('沙特计提分录：期末服务金费用 / 准备，借贷平衡，没有中国科目编码', () => {
    expect(sa.je.reduce((x, l) => x + l.debit - l.credit, 0)).toBe(0);
    expect(sa.je.every((l) => l.accountCode === '' && l.nameIsKey)).toBe(true);
    expect(sa.je.find((l) => l.accountName === '期末服务金准备')!.credit).toBe(Y(3078.77) + Y(410.96));
    expect(sa.lines.every((l) => l.iitExpected === null)).toBe(true);
  });
});
