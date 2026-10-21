<template>
  <section v-if="gaps.length" class="bw-panel bw-gaps">
    <header class="bw-panel__head">
      <strong><i class="ri-edit-box-line"></i>{{ $t('需要你填写的信息（{n} 项）', { n: gaps.length }) }}</strong>
      <span class="bw-muted">{{ $t('正文里这些地方 AI 没有依据，不能编 —— 填完点「回填到正文」，占位会被替换掉。') }}</span>
      <span class="grow"></span>
      <button
        type="button" class="bw-chip" :class="{ on: saveToKnowledge }"
        :title="$t('与页面顶部「我手填的信息」是同一个开关')"
        @click="saveToKnowledge = !saveToKnowledge"
      >
        <i :class="saveToKnowledge ? 'ri-toggle-fill' : 'ri-toggle-line'"></i>
        {{ saveToKnowledge ? $t('存入知识图谱（以后自动带出）') : $t('仅本次有效（不进知识图谱）') }}
      </button>
      <button type="button" class="bw-btn sm primary" :disabled="!filledCount || busy" @click="apply">
        <i :class="busy ? 'ri-loader-4-line bw-spin' : 'ri-check-double-line'"></i>
        {{ $t('回填到正文（{n} 项）', { n: filledCount }) }}
      </button>
    </header>
    <div class="bw-panel__body">
      <table class="bw-table">
        <thead><tr>
          <th>{{ $t('需要填的信息') }}</th><th>{{ $t('你的填写') }}</th><th>{{ $t('出现位置') }}</th>
        </tr></thead>
        <tbody>
          <tr v-for="g in gaps" :key="g.label">
            <td>
              <strong>{{ g.label }}</strong>
              <span v-if="g.count > 1" class="bw-muted">{{ $t('（{n} 处）', { n: g.count }) }}</span>
              <!-- 只给一个字段名（「单价」「比例」「体系认证」）用户不知道填什么，把正文原句摆出来 -->
              <div v-if="g.context" class="bw-gap__ctx">
                …{{ g.context.before }}<mark>{{ $t('【{p0}】', { p0: g.label }) }}</mark>{{ g.context.after }}…
              </div>
            </td>
            <td>
              <input
                v-model="values[g.label]" type="text"
                :placeholder="g.example || $t('按招标文件或公司实际情况填写')"
                @keyup.enter="apply"
              />
              <div v-if="g.example" class="bw-muted bw-gap__eg">{{ $t('例：{e}', { e: g.example }) }}</div>
            </td>
            <td class="bw-muted">{{ g.sections.slice(0, 2).join($t('、')) }}<template v-if="g.sections.length > 2">…</template></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 缺料表单：把正文里的【待补充：X】收成一张「你来填」的表。
 *
 * 为什么必须有这一步：标书里的报价、工期、资质编号、项目经理姓名这些**只能人填**，
 * 模型编一个就是事故。所以生成阶段写占位、这里集中填、一次回填到所有章节 ——
 * 用户实测一份草稿里 194 处占位（105 个不重复），靠人在正文里逐个找根本不现实。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { BidWriterSection } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { canonicalLabel, placeholderFor } from './placeholder';

const props = defineProps<{
  sections: BidWriterSection[];
  busy?: boolean;
  /** 「存入知识图谱」开关的当前值（由上层按项目持久化） */
  remember?: boolean;
}>();
const emit = defineEmits<{
  (e: 'apply', payload: Record<string, string>, saveToKnowledge: boolean): void;
  (e: 'update:remember', value: boolean): void;
}>();

const values = reactive<Record<string, string>>({});
// 开关默认开：多数信息（公司名、资质编号、项目经理）下次还要用，填一次就该记住。
// 关掉则只在本次标书里生效 —— 一次性的报价、这标特有的工期不该污染知识图谱。
const saveToKnowledge = computed({
  get: () => props.remember !== false,
  set: (v: boolean) => emit('update:remember', v),
});

/** 常见待填项的示例值：给个样子，用户就知道要填成什么形态 */
// 左边是匹配模式（占位名），右边是给用户看的示例值（走词典，英/阿界面下是本地化的样子）
const EXAMPLES: Array<[RegExp, () => string]> = [
  [/总报价|投标报价|报价总|合同金额/, () => i18nT('286.50 万元')],
  [/大写/, () => i18nT('贰佰捌拾陆万伍仟元整')],
  [/单价/, () => i18nT('12,800 元')],
  [/合价|小计|合计/, () => i18nT('128,000 元')],
  [/工期|服务期|日历天/, () => i18nT('125 日历天')],
  [/质保|保修/, () => i18nT('3 年')],
  [/比例/, () => i18nT('80%')],
  [/人数|人员数量/, () => i18nT('12 人')],
  [/分钟/, () => i18nT('15 分钟')],
  [/小时/, () => i18nT('4 小时')],
  [/身份证/, () => i18nT('110108198603121234')],
  [/职称|证书编号|资格/, () => i18nT('高级工程师 / 证书编号 0319004201800321')],
  [/体系认证/, () => i18nT('ISO9001:2015（证书号 00123Q30456R0M）')],
  [/资质/, () => i18nT('信息系统集成及服务资质二级')],
  [/姓名/, () => i18nT('张某某')],
  [/采购人|招标人/, () => i18nT('某某市大数据管理局')],
  [/项目名称/, () => i18nT('智慧园区平台建设项目')],
  [/完成时间|签订时间|日期/, () => i18nT('2024 年 11 月')],
  [/条款号|章节/, () => i18nT('第三章 3.2 条')],
];
function exampleFor(label: string): string | undefined {
  return EXAMPLES.find(([re]) => re.test(label))?.[1]();
}

/** 聚合：同一条占位在多章出现只列一行，回填时一次全换掉；顺带取正文原句当上下文 */
const gaps = computed(() => {
  type Gap = {
    label: string;            // 归一后的名字（表里显示 + 用户填一次）
    raw: string[];            // 正文里真实出现的所有写法（回填时逐个替换）
    count: number; sections: string[];
    example?: string; context?: { before: string; after: string };
  };
  const byLabel = new Map<string, Gap>();
  for (const s of props.sections) {
    const body = String(s.content || '');
    for (const p of s.placeholders || []) {
      const raw = String(p || '').trim();
      if (!raw) continue;
      const label = canonicalLabel(raw);
      const hit = byLabel.get(label) || { label, raw: [] as string[], count: 0, sections: [] as string[], example: exampleFor(label) };
      hit.count += 1;
      if (!hit.raw.includes(raw)) hit.raw.push(raw);
      if (!hit.sections.includes(s.title)) hit.sections.push(s.title);
      if (!hit.context && body) {
        const m = placeholderFor(raw).exec(body);
        if (m) {
          const idx = m.index;
          hit.context = {
            before: body.slice(Math.max(0, idx - 34), idx).replace(/\s+/g, ' '),
            after: body.slice(idx + m[0].length, idx + m[0].length + 34).replace(/\s+/g, ' '),
          };
        }
      }
      byLabel.set(label, hit);
    }
  }
  return [...byLabel.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-CN'));
});

const filledCount = computed(() => gaps.value.filter((g) => String(values[g.label] || '').trim()).length);

// 章节重新生成后占位会变：把已经不存在的条目清掉，避免回填时替换到别处
watch(gaps, (list) => {
  const alive = new Set(list.map((g) => g.label));
  for (const key of Object.keys(values)) if (!alive.has(key)) delete values[key];
});

function apply(): void {
  const payload: Record<string, string> = {};
  for (const g of gaps.value) {
    const v = String(values[g.label] || '').trim();
    if (!v) continue;
    // 用户填一次，归一到这一组的所有写法都用这个值回填
    for (const raw of g.raw) payload[raw] = v;
  }
  if (!Object.keys(payload).length) return;
  emit('apply', payload, saveToKnowledge.value);
}
</script>

<style scoped>
.bw-gaps { border-color: color-mix(in srgb, #e08c00 45%, var(--color-border)); }
.bw-gaps .bw-panel__head { background: color-mix(in srgb, #e08c00 10%, transparent); }
.bw-gap__ctx {
  margin-top: 3px; font-size: 12px; line-height: 1.6; color: var(--color-text-secondary);
  background: var(--color-bg-hover); border-radius: 7px; padding: 4px 8px;
}
.bw-gap__ctx mark { background: color-mix(in srgb, #e08c00 25%, transparent); color: inherit; border-radius: 4px; padding: 0 2px; }
.bw-gap__eg { margin-top: 3px; font-size: 11.5px; }
.bw-gaps input[type="text"] {
  width: 100%; padding: 6px 9px; border-radius: 8px; border: 1px solid var(--color-border);
  background: var(--color-bg-primary); color: var(--color-text-primary); font: inherit; font-size: 13px;
}
</style>
