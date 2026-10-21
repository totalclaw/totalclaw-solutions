import { describe, expect, it } from 'vitest';
import { SNAPSHOT_SCRIPT, etaxFacts, etaxHomeUrl, etaxPageKind, isChinataxHost, locateScript, parseBatchPreview, parseBatchRecords, parseSnapshot, type EtaxSnapshot } from './etaxPage';

const snap = (over: Partial<EtaxSnapshot>): EtaxSnapshot => ({ url: '', title: '', text: '', dialogs: [], hasFileInput: false, tables: [], ...over });
// 下面的页面文字照 2026-10-10 在吉林电子税务局看到的原样（企业名称与税号换成了示例）
const BLUE_TEXT = '全国统一规范电子税务局 吉林\n示例科技有限公司\n蓝字发票开具\n发票业务\n蓝字发票开具\n操作指引\n数据概览\n可用发票额度 （申报前）\n500,000.00元\n去调整\n发票总额度： 500,000.00元\n-\n当前可用纸票数量（张）\n0\n发票填开 扫脸认证时长设置\n立即开票\n发票草稿\n扫码开票\n复制开票\n批量开票';
const BATCH_TEXT = '批量开票\n批量开票记录\n温馨提醒：为防止因扫脸认证超过有效期导致批量开票失败，您可点击扫脸认证延长有效期。\n当前导入模板已更新至V260401版（查看更新详情），请先下载模板《批量导入开具发票模板》，按照模板填写导入信息后上传！\n选择文件\n支持文件扩展名：.xls .xlsx\n批量开具\n批量删除\n清空导入\n批量设置';

describe('电子税务局页面', () => {
  it('地址：门户带 8443 端口；只认 chinatax.gov.cn', () => {
    expect(etaxHomeUrl('Jilin')).toBe('https://etax.jilin.chinatax.gov.cn:8443/');
    expect(() => etaxHomeUrl('')).toThrow();
    expect(isChinataxHost('https://dppt.jilin.chinatax.gov.cn:8443/blue-invoice-makeout')).toBe(true);
    expect(isChinataxHost('https://dppt.jilin.chinatax.gov.cn.evil.com/')).toBe(false);
    expect(isChinataxHost('http://etax.jilin.chinatax.gov.cn/')).toBe(false);
  });
  it('页面类型', () => {
    expect(etaxPageKind('https://etax.jilin.chinatax.gov.cn:8443/')).toBe('portal');
    expect(etaxPageKind('https://etax.jilin.chinatax.gov.cn:8443/loginb/')).toBe('portal_login');
    expect(etaxPageKind('https://tpass.jilin.chinatax.gov.cn:8443/#/login?redirect_uri=x')).toBe('login');
    expect(etaxPageKind('https://dppt.jilin.chinatax.gov.cn:8443/invoice-business?ruuid=1')).toBe('invoice_business');
    expect(etaxPageKind('https://dppt.jilin.chinatax.gov.cn:8443/blue-invoice-makeout?ruuid=1')).toBe('blue');
    expect(etaxPageKind('https://dppt.jilin.chinatax.gov.cn:8443/blue-invoice-makeout/invoice-batch')).toBe('batch');
    expect(etaxPageKind('https://dppt.jilin.chinatax.gov.cn:8443/blue-invoice-makeout/invoice-makeout')).toBe('makeout');
    expect(etaxPageKind('https://www.baidu.com/')).toBe('other');
  });
  it('读出企业、额度、模板版本', () => {
    const f = etaxFacts(snap({ url: 'https://dppt.jilin.chinatax.gov.cn:8443/blue-invoice-makeout?ruuid=1', title: '蓝字发票开具-全国统一规范电子税务局-示例科技有限公司', text: BLUE_TEXT }));
    expect(f).toMatchObject({ kind: 'blue', company: '示例科技有限公司', quota: 500000, totalQuota: 500000, need: '' });
    expect(etaxFacts(snap({ url: 'https://dppt.jilin.chinatax.gov.cn:8443/blue-invoice-makeout/invoice-batch', text: BATCH_TEXT })).templateVersion).toBe('V260401');
    expect(etaxFacts(snap({ url: 'https://etax.jilin.chinatax.gov.cn:8443/loginb/', text: '首页\n我要办税\n**鹏\n示例科技有限公司\n91220106MA00000000\n距本月征期结束还有16天' })).taxNo).toBe('91220106MA00000000');
  });
  it('认出要人做的事：没登录、会话失效、认证等级、扫脸、已通过待确认', () => {
    const at = (url: string, o: Partial<EtaxSnapshot> = {}) => etaxFacts(snap({ url, ...o })).need;
    const dppt = 'https://dppt.jilin.chinatax.gov.cn:8443/blue-invoice-makeout';
    expect(at('https://etax.jilin.chinatax.gov.cn:8443/')).toBe('login');
    expect(at('https://tpass.jilin.chinatax.gov.cn:8443/#/login')).toBe('login');
    expect(at('https://dppt.jilin.chinatax.gov.cn:8443/invoice-business', { text: '系统检测到电票平台会话已失效或电局账号已退出，需刷新重新操作' })).toBe('session');
    expect(at(dppt, { dialogs: ['温馨提示\n您当前认证等级无法访问该功能，请先进行认证。\n取消\n开始认证'] })).toBe('level');
    expect(at(dppt, { dialogs: ['扫脸认证\n为了您开票的安全便捷、稳定可靠，请按照指引完成扫脸认证处理。\n电子税务局APP扫脸认证'] })).toBe('face');
    expect(at(dppt, { dialogs: ['扫脸认证通过\n您已扫脸认证通过，请继续开票！\n我已知晓，继续开票'] })).toBe('ack');
    expect(at(dppt, { text: BLUE_TEXT })).toBe('');
  });
  it('批量开票记录：按流水号读回号码与结果', () => {
    const head = ['', '序号', '发票流水号', '发票类型', '数电发票号码', '合计金额（不含税）', '操作时间', '操作人员', '购买方邮箱', '开具结果', '失败原因', '操作'];
    const recs = parseBatchRecords(snap({ tables: [{ head: ['序号', '别的表'], rows: [['1', 'x']] }, { head, rows: [
      ['', '1', '26101005240001', '普通发票', '26222000000012345678', '150.00', '2026-10-10 17:30:01', '张三', '', '成功', '', '查看'],
      ['', '2', '26101005240002', '普通发票', '', '29.50', '2026-10-10 17:30:02', '张三', '', '失败', '购买方纳税人识别号有误', '查看'],
      ['', '3', '', '', '', '', '', '', '', '', '', ''],
    ] }] }));
    expect(recs).toHaveLength(2);
    expect(recs[0]).toMatchObject({ serial: '26101005240001', invoiceNo: '26222000000012345678', ok: true, amount: 150 });
    expect(recs[1]).toMatchObject({ serial: '26101005240002', invoiceNo: '', ok: false, failReason: '购买方纳税人识别号有误' });
    expect(parseBatchRecords(snap({ tables: [] }))).toEqual([]);
  });
  it('导入后的预览表：流水号与价税合计', () => {
    const head = ['', '序号', '发票流水号', '发票类型', '特定业务', '合计金额', '合计税额', '价税合计', '购买方纳税人名称', '购买方纳税人识别号', '操作'];
    expect(parseBatchPreview(snap({ tables: [{ head, rows: [['', '1', '26101005240001', '普通发票', '', '150.00', '19.50', '169.50', '甲公司', '9135', '删除']] }] }))).toEqual([{ serial: '26101005240001', total: 169.5, buyer: '甲公司' }]);
  });
  it('页面脚本语法正确，文字里的引号不会撑破脚本', () => {
    expect(() => new Function(`return ${SNAPSHOT_SCRIPT}`)).not.toThrow();
    expect(() => new Function(`return ${locateScript('我已知晓，"继续"\'开票`${x}', '.t-dialog button')}`)).not.toThrow();
    expect(parseSnapshot('不是 JSON')).toMatchObject({ url: '', tables: [] });
    expect(parseSnapshot(JSON.stringify({ url: 'u', tables: [{ head: ['a'], rows: [['1']] }], hasFileInput: 1 }))).toMatchObject({ url: 'u', hasFileInput: true, tables: [{ head: ['a'], rows: [['1']] }] });
  });
});
