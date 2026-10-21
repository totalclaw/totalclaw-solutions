/**
 * 政采云智能体 · 发给数字员工 / 模型的指令（是载荷不是界面文案，不进词典）。
 *
 * 政采云是中文站点，操作指令一律用中文，菜单与按钮名照页面原文写。
 * 账号密码不出现在任何指令里：登录由应用把账号密码填进登录框、人过验证码后完成。
 */
import type { ZcAccount, ZcInquiry, ZcOrder, ZcProduct, ZcRegionRule } from '@totalclaw/ipc-contracts';

const RULES = [
  '硬性要求：',
  '1. 我已经在内置浏览器里登录了政采云。如果页面要求登录、验证码、滑块、短信或 CA 证书，停下来告诉我，不要尝试绕过，也不要向我索要密码。',
  '2. 下面给的文字、价格、数量逐字照抄，不许自己改价、不许自己计算。',
  '3. 不要点任何最终按钮（提交审核、提交报价、确认接单、确认发货、签章、确认改价）：做到那一步前停下，截图给我，由我亲自点。',
  '4. 页面上的字段和我给的对不上、或者有我没给的必填项时，停下来把字段名原文列给我，不要编内容填进去。',
];

const home = (a: ZcAccount): string => a.homeUrl || 'https://www.zcygov.cn/';

export function listingInstruction(p: ZcProduct, rule: ZcRegionRule, a: ZcAccount): string {
  return [
    `请在内置浏览器打开政采云（${home(a)}），进入供应商工作台，发布一个商品。`,
    '路径：我的工作台 → 商品中心 → 商品管理 → 商品发布（各区划菜单名可能略有不同，找不到时把看到的菜单列给我）。',
    ...RULES,
    '',
    `类目：${p.category}（类目带「标」的要引用平台已有的标准商品，按品牌和型号搜索后选择完全一致的那条；搜不到就停下来告诉我；带「资」的类目需要资质，页面提示缺资质时停下来）`,
    `品牌：${p.brand}`,
    `型号：${p.model || '（无）'}`,
    `商品标题：${p.title}（系统按类目自动生成标题时以系统为准，把生成的标题告诉我）`,
    `售价：${p.price} 元`,
    `库存：${p.stock}${p.unit ? ` ${p.unit}` : ''}`,
    p.params.trim() ? `参数（逐项对应页面字段填写）：\n${p.params.trim().split('\n').map((x) => `  - ${x}`).join('\n')}` : '',
    p.detail.trim() ? `商品详情：${p.detail.trim()}` : '',
    '电商平台比价链接（填到对应平台的输入框）：',
    ...p.refs.filter((r) => r.url).map((r) => `  - ${{ jd: '京东', tmall: '天猫', suning: '苏宁', other: '其他' }[r.platform]}：${r.url}（对方售价 ${r.price} 元）`),
    `主图（按顺序上传，第一张为主图；要求不小于 ${rule.imageMinSide}×${rule.imageMinSide}）：`,
    ...p.images.map((im, i) => `  ${i + 1}. ${im.path}`),
    '',
    '填完后停在「提交审核」前，回复我：页面上的标题、售价、类目各是什么，有没有红字提示，并附截图。',
  ].filter((x) => x !== '').join('\n');
}

export function ordersPatrolInstruction(a: ZcAccount): string {
  return [
    `请在内置浏览器打开政采云（${home(a)}），进入供应商工作台，只读取订单列表，不做任何操作。`,
    '路径：交易中心 → 订单管理。依次查看「待接单 / 待确认」「待发货」「待验收 / 已发货」「待结算」「待开票」这几个状态页签，每个页签读第一页。',
    ...RULES,
    '',
    '读完后只回复一个 ```json 代码块，内容是数组，每个订单一个对象，字段：',
    '  orderNo（订单编号，照抄）、buyer（采购单位）、buyerTaxNo（页面上有统一社会信用代码才填，否则空字符串）、',
    '  amount（订单金额，数字）、createdAt（下单时间，格式 2026-01-31 14:30）、status（页面上的状态原文，如 待接单）、',
    '  items（商品名称与数量的简述）、logisticsCompany、logisticsNo（没有就空字符串）。',
    '页面上没有的字段填空字符串，不要猜；一个订单都没有就回复 []。',
  ].join('\n');
}

export function inquiriesPatrolInstruction(a: ZcAccount): string {
  return [
    `请在内置浏览器打开政采云（${home(a)}），进入供应商工作台，只读取我能参与的在线询价 / 反向竞价单，不做任何操作。`,
    '路径：交易中心 → 在线询价（或「询价管理」「竞价管理」）→ 待报价 / 可参与。读第一页，逐个点进详情读明细。',
    ...RULES,
    '',
    '读完后只回复一个 ```json 代码块，内容是数组，每张询价单一个对象，字段：',
    '  no（询价单号）、title（项目名称）、buyer（采购单位）、deadline（报价截止时间，格式 2026-01-31 17:00）、',
    '  budget（预算或总限价，数字，没有填 0）、url（详情页地址）、',
    '  items（数组：name 名称、spec 规格参数要求、qty 数量、unit 单位、ceiling 单价最高限价，没有填 0）。',
    '页面上没有的字段填空字符串或 0，不要猜；没有可参与的就回复 []。',
  ].join('\n');
}

export function quoteInstruction(q: ZcInquiry, a: ZcAccount): string {
  return [
    `请在内置浏览器打开政采云（${q.url || home(a)}），对询价单「${q.title || q.no}」${q.no ? `（${q.no}）` : ''}填写报价。`,
    q.url ? '' : '路径：交易中心 → 在线询价 → 待报价，按单号找到这张询价单。',
    ...RULES,
    '',
    '逐项填写单价（含税，元），照抄，不要改：',
    ...q.items.map((it, i) => `  ${i + 1}. ${it.name}${it.spec ? `（${it.spec}）` : ''} × ${it.qty}${it.unit}：单价 ${it.quote.toFixed(2)}`),
    `报价合计应为 ${q.total.toFixed(2)} 元；页面合计与此不一致时不要继续，把页面上的合计告诉我。`,
    q.note ? `补充说明 / 响应说明：${q.note}` : '',
    '询价只有一轮报价，提交后不能改。停在「提交报价」前，截图给我，由我亲自点。',
  ].filter((x) => x !== '').join('\n');
}

export function acceptOrderInstruction(o: ZcOrder, a: ZcAccount): string {
  return [
    `请在内置浏览器打开政采云（${home(a)}），找到订单 ${o.orderNo}（${o.buyer}，${o.amount} 元），准备接单。`,
    '路径：交易中心 → 订单管理 → 待接单 / 待确认。',
    ...RULES,
    '',
    '先核对订单里的商品、数量、金额、收货地址，把这些内容原文回复给我；然后停在「确认接单」前，由我亲自点。不要改价，不要拒单。',
  ].join('\n');
}

export function shipOrderInstruction(o: ZcOrder, a: ZcAccount): string {
  return [
    `请在内置浏览器打开政采云（${home(a)}），找到订单 ${o.orderNo}（${o.buyer}），回填发货信息。`,
    '路径：交易中心 → 订单管理 → 待发货 → 发货。',
    ...RULES,
    '',
    `物流公司：${o.logisticsCompany}`,
    `物流单号：${o.logisticsNo}`,
    '填好后停在「确认发货」前，截图给我，由我亲自点。',
  ].join('\n');
}

/** 写商品详情：只许用给定的参数，数字不许编 */
export function describePrompt(p: Pick<ZcProduct, 'name' | 'brand' | 'model' | 'category' | 'params'>): string {
  return [
    'Write a product description in Simplified Chinese for a government e-procurement marketplace listing.',
    'Style: factual, 80-160 Chinese characters, no marketing superlatives, no promotions, no contact info, no price.',
    'Use ONLY the facts below. Every number in your text must appear in the facts. Do not invent certifications, awards, or specs.',
    'Return plain text only.',
    '',
    `Category: ${p.category}`,
    `Brand: ${p.brand}`,
    `Name: ${p.name}`,
    `Model: ${p.model}`,
    'Specs:',
    p.params || '(none)',
  ].join('\n');
}
