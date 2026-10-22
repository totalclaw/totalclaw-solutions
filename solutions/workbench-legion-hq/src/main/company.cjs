/**
 * O1 公司档案（唯一真相源）：公司名称、大屏显示名、标志、行业、主营、所在地、老板称呼、规模。
 * 大屏、部门提示词、产出抬头都读它。
 *
 * 读取优先级：本地手改 > 宿主提供（登录账号的公司主体 / 知识库公司字段，在线时）> 默认「北京泰途科技有限公司」（带 App logo）。
 * 演示模式（O2 / A9）开启时对外一律显示「示例公司」，不露真实名称。
 */

const LIMITS = { name: 40, short: 12, logo: 2, industry: 16, products: 80, location: 24, boss: 8, size: 16 };
/** 默认公司（用户 2026-10-22 定）：北京泰途科技有限公司，标志用 App 自己的 logo（包内 resources/company-logo.png，由入口读成 data URL 传入） */
const DEFAULT = { name: '北京泰途科技有限公司', short: '泰途科技', logo: '泰', industry: 'AI 企业服务', products: '泰途AI 企业助手（TotalClaw）', location: '北京', boss: '老板', size: '' };
const DEMO = { name: '示例科技有限公司', short: '示例科技', logo: '示', industry: '智能家电', products: '智能家电', location: '', boss: '王总', size: '' };
const MAX_LOGO_IMAGE = 300 * 1024;

/** 去掉「(股份)有限(责任)公司」做大屏显示名 */
function shortOf(name) {
  return String(name || '')
    .replace(/(股份)?有限(责任)?公司$/, '')
    .replace(/集团$/, '')
    .slice(0, LIMITS.short);
}

function clean(input) {
  const out = {};
  for (const [k, n] of Object.entries(LIMITS)) {
    if (input && typeof input[k] === 'string') {
      const v = input[k].replace(/[\r\n\t]/g, ' ').trim().slice(0, n);
      if (v) out[k] = v;
    }
  }
  if (input && typeof input.logoImage === 'string' && /^data:image\/(png|jpe?g|svg\+xml|webp);base64,/.test(input.logoImage) && input.logoImage.length <= MAX_LOGO_IMAGE) {
    out.logoImage = input.logoImage;
  }
  return out;
}

/**
 * 合并出生效档案。
 * @param {object} local     本地手改（company-profile.json）
 * @param {object[]} sources 宿主来源，按优先级从高到低
 */
function resolveProfile(local, sources = [], { defaultLogoImage = '' } = {}) {
  const own = clean(local || {});
  const hosts = sources.map(clean);
  const merged = { ...DEFAULT, ...(defaultLogoImage ? { logoImage: defaultLogoImage } : {}) };
  for (const layer of [...hosts].reverse()) Object.assign(merged, layer);
  Object.assign(merged, own);
  const from = Object.keys(own).length ? 'local' : hosts.some((h) => Object.keys(h).length) ? 'host' : 'default';
  const given = (k) => own[k] || hosts.some((h) => h[k]);
  if (!given('short') && merged.name !== DEFAULT.name) merged.short = shortOf(merged.name) || merged.name.slice(0, LIMITS.short);
  if (!given('logo')) merged.logo = (merged.short || merged.name).slice(0, 1);
  // 默认 logo 只配默认公司：换了公司名又没给标志图时不能挂着泰途的 logo
  if (!given('logoImage') && merged.name !== DEFAULT.name) delete merged.logoImage;
  return { ...merged, from };
}

/** 对外展示（大屏 / 员工机）：演示模式下换成示例公司 */
function displayProfile(profile, demoMode) {
  if (demoMode) return { ...DEMO, demo: true };
  const { from, ...rest } = profile;
  return { ...rest, demo: false };
}

/** O3 部门提示词里注入的身份句 */
function identityLine(profile, legion) {
  const name = profile.name || DEFAULT.name;
  const dept = legion ? legion.name : 'AI 总经理';
  const main = profile.products ? `，公司主营 ${profile.products}` : profile.industry ? `，所在行业 ${profile.industry}` : '';
  return `你是「${name}」的${dept} AI 员工${main}。老板称呼：${profile.boss || '老板'}。`;
}

module.exports = { resolveProfile, displayProfile, identityLine, clean, shortOf, DEFAULT, DEMO, LIMITS };
