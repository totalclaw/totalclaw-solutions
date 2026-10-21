/**
 * 正文占位标记的**协议串**：主进程提示词要求模型写成 `【待补充：需要什么信息】`，
 * 主进程按同一形态解析（services/bidWriter/matchPatterns.PLACEHOLDER_RE）。
 *
 * 它不是界面文案，**不随界面语言变** —— 翻译掉就等于两端对不上、占位永远识别不出来。
 * 这里用正则字面量拼，避免写成中文字符串被 i18n 扫描当成漏翻的界面文案。
 */
import { t as i18nT } from '../../i18n';

const PREFIX = /【待补充[:：]/;
/** 模型有时直接写成裸「【投标总报价】」，回填要把这种也换掉 */
const BARE = /【/;

/** 正文里所有占位：捕获组 1 是「要填什么」 */
export function placeholderPattern(): RegExp {
  return new RegExp(`${PREFIX.source}([^】]{1,60})】`, 'g');
}

/** 某一条占位的精确匹配：`【待补充：X】` 与裸 `【X】` 两种写法都算 */
export function placeholderFor(label: string): RegExp {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:${PREFIX.source}|${BARE.source})${escaped}】`, 'g');
}

export function collectPlaceholders(content: string): string[] {
  const out: string[] = [];
  for (const m of String(content || '').matchAll(placeholderPattern())) out.push(m[1].trim());
  return [...new Set(out)];
}

/**
 * 同义占位归一：模型会把同一件事写成好几种名字 ——
 * 「投标总报价 / 投标总报价（小写）/ 报价总额」「工期日历天 / 总工期 / 工期或服务期」
 * 「采购人 / 采购人全称 / 采购人名称」。不归一的话缺料表里同一项要填三遍（实测 38 项里有 11 项是重复）。
 *
 * 归一只影响**表里怎么分组**：回填时仍按每个原始占位名逐一替换，不会替错。
 * 「（大写）」不能并进「投标总报价」—— 那是两个不同的值（小写数字 vs 中文大写）。
 */
// 左边是匹配模式（模型写出来的各种写法），右边是**显示给用户的那一行的名字**（走词典）
const CANONICAL: Array<[RegExp, () => string]> = [
  [/^(投标)?(总)?报价(总额)?(（小写）|小写)?$|^报价金额$/, () => i18nT('投标总报价')],
  [/大写/, () => i18nT('投标总报价（大写）')],
  [/^(总)?工期(日历天|天数)?$|^工期或服务期$|^服务期(限)?$/, () => i18nT('工期')],
  [/^质保(期)?(年限)?$|^保修期$/, () => i18nT('质保年限')],
  [/采购人|招标人/, () => i18nT('采购人全称')],
  [/授权代表.*身份证/, () => i18nT('授权代表身份证号')],
  [/授权代表.*姓名|^授权代表$/, () => i18nT('授权代表姓名')],
  [/项目经理/, () => i18nT('项目经理姓名及职称证书')],
  [/技术负责人/, () => i18nT('技术负责人姓名')],
  [/软著|高企/, () => i18nT('软著 / 高企证书')],
  [/体系认证|ISO|CMMI/i, () => i18nT('体系认证（含证书号）')],
  [/行业资质|资质及等级|资质等级/, () => i18nT('行业资质及等级')],
];

/** 同义占位归一到一个**显示名**；回填仍按原始写法逐条替换（见 BwGapForm 的 raw 列表） */
export function canonicalLabel(label: string): string {
  const t = String(label || '').trim();
  return CANONICAL.find(([re]) => re.test(t))?.[1]() || t;
}
