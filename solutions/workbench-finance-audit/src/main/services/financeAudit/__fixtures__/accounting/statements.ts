/**
 * MT940 / CAMT.053 对账单夹具（批次 2）。
 *
 * MT940 第 1 张（带 SWIFT 信封）：工行 6222000011111234，期初 C 300,000.00
 *   :61: 09-04 D 60,000.00 B0904001        对方「华南物业」（/NAME/），摘要「支付8月房租」（/REMI/）
 *   :61: 09-15 C 90,000.00 B0915088        对方「客户甲有限公司」（?32 + ?33），摘要「收回货款」（?20）
 *   :61: 09-25 D 35.00 NONREF//FEE0925     参考号取银行参考 FEE0925；补充说明「支付手续费」+ 附言「手续费」
 *   期末 300,000 − 60,000 + 90,000 − 35 = 329,965.00 = :62F: ✓
 * MT940 第 2 张：沙特 IBAN，期初 C 1,000.00；09-05 C 500.00；09-06 RC 500.00（贷记冲正 → 按支出）→ 期末 1,000.00 ✓
 *
 * CAMT.053：同一沙特 IBAN，期初 OPBD 10,000.00；09-03 收 3,000.00（付款人 شركة الأمل）；09-10 付 149.50（手续费，DtTm 记账时间）；
 *   09-12 收 500.00 但 RvslInd=true → 按支出；09-30 一条 PDNG 未记账 → 跳过并提醒。期末 10,000 + 3,000 − 149.50 − 500 = 12,350.50 = CLBD ✓
 */
export const MT940 = [
  '{1:F01ICBKCNBJXXXX0000000000}{2:I940ICBKCNBJXXXXN}{4:',
  ':20:STMT20260930',
  ':25:6222000011111234',
  ':28C:00009/001',
  ':60F:C260831CNY300000,00',
  ':61:2609040904D60000,00NTRFB0904001//BREF001',
  ':86:/NAME/华南物业/REMI/支付8月房租',
  ':61:260915C90000,00NTRFB0915088',
  ':86:?20收回货款?32客户甲?33有限公司',
  ':61:2609250925D35,00NCHGNONREF//FEE0925',
  '支付手续费',
  ':86:手续费',
  ':62F:C260930CNY329965,00',
  '-}',
  ':20:STMT2',
  ':25:SA0380000000608010167519',
  ':28C:00010/001',
  ':60F:C260831SAR1000,00',
  ':61:2609050905C500,00NTRFREF1',
  ':86:/NAME/شركة المثال/REMI/دفعة',
  ':61:2609060906RC500,00NTRFREF1',
  ':86:REVERSAL',
  ':62F:C260930SAR1000,00',
  '',
].join('\r\n');

/** 期末被改过：期初 + 发生额 ≠ 期末 */
export const MT940_BROKEN = MT940.replace(':62F:C260930CNY329965,00', ':62F:C260930CNY329000,00');

export const CAMT053 = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr><MsgId>M-2026-09</MsgId><CreDtTm>2026-10-01T06:00:00</CreDtTm></GrpHdr>
    <Stmt>
      <Id>S-2026-09</Id><ElctrncSeqNb>9</ElctrncSeqNb>
      <Acct><Id><IBAN>SA0380000000608010167519</IBAN></Id><Ccy>SAR</Ccy></Acct>
      <Bal><Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp><Amt Ccy="SAR">10000.00</Amt><CdtDbtInd>CRDT</CdtDbtInd><Dt><Dt>2026-08-31</Dt></Dt></Bal>
      <Bal><Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp><Amt Ccy="SAR">12350.50</Amt><CdtDbtInd>CRDT</CdtDbtInd><Dt><Dt>2026-09-30</Dt></Dt></Bal>
      <!-- 收款 -->
      <Ntry>
        <Amt Ccy="SAR">3000.00</Amt><CdtDbtInd>CRDT</CdtDbtInd><Sts><Cd>BOOK</Cd></Sts>
        <BookgDt><Dt>2026-09-03</Dt></BookgDt><ValDt><Dt>2026-09-03</Dt></ValDt><AcctSvcrRef>BR-1</AcctSvcrRef>
        <NtryDtls><TxDtls><Refs><EndToEndId>E2E-1</EndToEndId></Refs><RltdPties><Dbtr><Nm>شركة الأمل</Nm></Dbtr></RltdPties><RmtInf><Ustrd>فاتورة 1001</Ustrd></RmtInf></TxDtls></NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="SAR">149.50</Amt><CdtDbtInd>DBIT</CdtDbtInd><Sts>BOOK</Sts>
        <BookgDt><DtTm>2026-09-10T08:00:00</DtTm></BookgDt><AcctSvcrRef>BR-2</AcctSvcrRef><AddtlNtryInf>Bank charges &amp; fees</AddtlNtryInf>
      </Ntry>
      <Ntry>
        <Amt Ccy="SAR">500.00</Amt><CdtDbtInd>CRDT</CdtDbtInd><RvslInd>true</RvslInd><Sts><Cd>BOOK</Cd></Sts>
        <BookgDt><Dt>2026-09-12</Dt></BookgDt><AcctSvcrRef>BR-3</AcctSvcrRef><AddtlNtryInf><![CDATA[Reversal <1> & more]]></AddtlNtryInf>
      </Ntry>
      <Ntry>
        <Amt Ccy="SAR">999.00</Amt><CdtDbtInd>CRDT</CdtDbtInd><Sts><Cd>PDNG</Cd></Sts><BookgDt><Dt>2026-09-30</Dt></BookgDt>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>
`;

/** 同一份 CAMT，标签全部带命名空间前缀（部分银行这样导出） */
export const CAMT053_PREFIXED = CAMT053.replace(/<(\/?)([A-Za-z])/g, '<$1ns2:$2').replace('xmlns=', 'xmlns:ns2=');
