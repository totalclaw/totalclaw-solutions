<template>
  <div class="ss-module fa-ov">
    <!-- 一、核心财务智能体清单 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-apps-2-line"></i> {{ $t('一、核心财务智能体清单') }}</strong>
        <span class="ss-muted">{{ $t('按业务模块划分，点卡片进入对应智能体') }}</span>
      </header>
      <div class="fa-grid">
        <button v-for="m in modules" :key="m.key" type="button" class="fa-card fa-card--click" :class="{ dim: !inPackage(m.key) }" @click="$emit('goto', m.key)">
          <div class="fa-card__head"><i :class="m.icon"></i><strong>{{ m.title }}</strong><em v-if="stat(m.key)" class="ss-chip warn">{{ stat(m.key) }}</em></div>
          <p>{{ m.desc }}</p>
        </button>
      </div>
    </section>

    <!-- 二、配套能力 -->
    <section class="ss-panel">
      <header><strong><i class="ri-stack-line"></i> {{ $t('二、配套能力（智能体公共能力）') }}</strong></header>
      <div class="fa-grid">
        <div class="fa-card">
          <div class="fa-card__head"><i class="ri-scan-2-line"></i><strong>{{ $t('文档 / OCR 识别') }}</strong></div>
          <p>{{ $t('PDF、图片发票、银行回单、合同解析。电子发票读文字层，扫描件与图片走本机 OCR，识别出的字段逐项回原文核对。') }}</p>
        </div>
        <div class="fa-card">
          <div class="fa-card__head"><i class="ri-database-2-line"></i><strong>{{ $t('数据对接') }}</strong></div>
          <p>{{ $t('可对接 Excel、账套导出数据（序时账、科目余额表），支持 API 接收外部数据。') }}</p>
          <button type="button" class="ss-link" @click="$emit('goto', 'settings')">{{ $t('到设置里打开 API 接收') }}</button>
        </div>
        <div class="fa-card">
          <div class="fa-card__head"><i class="ri-file-excel-2-line"></i><strong>{{ $t('输出') }}</strong></div>
          <p>{{ $t('Markdown 报告、Excel 表格、文字建议。结果文件按账套、按智能体分目录存放。') }}</p>
          <button v-if="state?.outputDir" type="button" class="ss-link" @click="openDir">{{ $t('打开结果目录') }}</button>
        </div>
        <div class="fa-card">
          <div class="fa-card__head"><i class="ri-brain-line"></i><strong>{{ $t('记忆') }}</strong></div>
          <p>{{ $t('支持会话记忆，持续跟进同一账套 / 同一项目分析：每个账套的问答记录与记忆要点独立保存。') }}</p>
        </div>
      </div>
    </section>

    <!-- 三、业务落地定位 -->
    <section class="ss-panel">
      <header><strong><i class="ri-focus-3-line"></i> {{ $t('三、业务落地定位') }}</strong></header>
      <blockquote class="fa-quote">{{ $t('财务智能体不是替代会计，是帮财务做重复、数据核对、信息提取、预审分析工作，把财务从机械单据处理释放到管理决策。') }}</blockquote>
    </section>

    <!-- 四、合规区分 -->
    <section class="ss-panel">
      <header><strong><i class="ri-shield-check-line"></i> {{ $t('四、区分：哪些不能交给智能体') }}</strong></header>
      <div class="fa-rules">
        <div class="fa-rule no">
          <i class="ri-close-circle-fill"></i>
          <p>{{ $t('不能自动提交纳税申报、不能电子签名、不能直接修改正式账套数据') }}</p>
        </div>
        <div class="fa-rule yes">
          <i class="ri-checkbox-circle-fill"></i>
          <p>{{ $t('只做：数据解析、草稿生成、风险提示、辅助计算、文档整理、分析建议，最终由财务人员人工复核确认') }}</p>
        </div>
      </div>
      <div class="ss-subhead">{{ $t('本工作台怎么落实') }}</div>
      <ul class="fa-list">
        <li>{{ $t('凭证只生成草稿并导出成导入文件，由财务导入自己的账套软件；本工作台不连接、不修改正式账套。') }}</li>
        <li>{{ $t('税务申报只出申报表草稿、申报备注与风险预检，不对接电子税务局，申报由人在税务局系统里核对后提交。') }}</li>
        <li>{{ $t('所有金额（税额、分录、分摊、账龄、预算执行）由固定规则计算，每一步有公式可查；模型不参与算钱。') }}</li>
        <li>{{ $t('模型从票据、合同里抽出的值必须能在原文里找到，找不到的丢弃或标记「未核实」；模型写的文字只许引用规则算好的数字。') }}</li>
        <li>{{ $t('报销结论是预审意见，通过 / 驳回由财务点确认；对账函、催款函是草稿，签章后才发出。') }}</li>
      </ul>
    </section>

    <!-- 五、打包套餐 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-gift-line"></i> {{ $t('五、可选：打包套餐') }}</strong>
        <span class="ss-muted">{{ $t('启用套餐后，顶部只显示套餐内的智能体') }}</span>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm" :class="current === 'all' ? 'primary' : 'ghost'" @click="setPackage('all')">{{ $t('显示全部智能体') }}</button>
      </header>
      <div class="fa-grid">
        <div v-for="p in packs" :key="p.key" class="fa-card fa-pack" :class="{ active: current === p.key }">
          <div class="fa-card__head"><i :class="p.icon"></i><strong>{{ packageLabel(p.key) }}</strong><em v-if="current === p.key" class="ss-chip ok">{{ $t('当前') }}</em></div>
          <p>{{ p.text }}</p>
          <div class="fa-chips"><span v-for="k in packageModules(p.key)" :key="k" class="ss-chip">{{ titleOf(k) }}</span></div>
          <button type="button" class="ss-btn sm" :class="current === p.key ? 'ghost' : 'primary'" :disabled="current === p.key || saving" @click="setPackage(p.key)">
            {{ current === p.key ? $t('已启用') : $t('启用此套餐') }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 方案说明：按方案目录一~五（智能体清单、配套能力、业务定位、合规区分、打包套餐）。
 */
import { computed, onMounted, ref } from 'vue';
import type { FaModuleKey, FaPackage } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { errorMessage, fa, faState, moduleMetas, openPath, packageLabel, packageModules, refreshState } from './shared';

defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();
const state = faState;
const modules = moduleMetas();
const current = computed<FaPackage>(() => state.value?.settings.package || 'all');
const saving = ref(false);
const ov = ref<Record<string, any> | null>(null);

const packs: Array<{ key: Exclude<FaPackage, 'all'>; icon: string; text: string }> = [
  { key: 'micro', icon: 'ri-store-3-line', text: i18nT('凭证智能体 + 费用报销 + 财税问答 + 简易报表') },
  { key: 'agency', icon: 'ri-briefcase-4-line', text: i18nT('凭证智能体 + 税务预检 + 往来对账 + 风险巡检') },
  { key: 'manufacturing', icon: 'ri-building-4-line', text: i18nT('在前两个包的基础上，增加成本核算、预算智能体、合同财税审核') },
];

function titleOf(k: FaModuleKey): string { return modules.find((m) => m.key === k)?.title || k; }
function inPackage(k: FaModuleKey): boolean { return packageModules(current.value).includes(k); }
function stat(k: FaModuleKey): string {
  const o = ov.value;
  if (!o) return '';
  if (k === 'voucher' && o.flaggedDocs) return i18nT('{n} 张异常', { n: o.flaggedDocs });
  if (k === 'voucher' && o.draftVouchers) return i18nT('{n} 张待审', { n: o.draftVouchers });
  if (k === 'expense' && o.pendingClaims) return i18nT('{n} 单待定', { n: o.pendingClaims });
  if (k === 'reconcile' && o.overdue) return i18nT('{n} 家逾期', { n: o.overdue });
  if (k === 'risk' && o.risks) return i18nT('{n} 项高风险', { n: o.risks });
  if (k === 'budget' && o.overBudget) return i18nT('{n} 项超支', { n: o.overBudget });
  return '';
}

async function setPackage(p: FaPackage): Promise<void> {
  saving.value = true;
  try { await fa('settings.patch', { patch: { package: p } }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } finally { saving.value = false; }
}
function openDir(): void {
  if (state.value?.outputDir) openPath(state.value.outputDir).catch((e) => notif.error(errorMessage(e)));
}
onMounted(async () => { try { ov.value = await fa('overview'); } catch { /* 概况拿不到不影响说明页 */ } });
</script>

<style scoped>
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.grow { flex: 1; }
.fa-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
.fa-card { display: grid; gap: 6px; align-content: start; padding: 12px; border-radius: var(--radius-5); border: 1px solid var(--color-border); background: var(--color-bg-primary); text-align: start; font: inherit; color: inherit; }
.fa-card--click { cursor: pointer; transition: border-color .15s; }
.fa-card--click:hover { border-color: var(--color-brand); }
.fa-card.dim { opacity: .55; }
.fa-card__head { display: flex; gap: 6px; align-items: center; font-size: 13.5px; }
.fa-card__head i { color: var(--color-brand); font-size: var(--font-size-xl); }
.fa-card p { margin: 0; font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.6; }
.fa-pack.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-primary)); }
.fa-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.fa-quote { margin: 0; padding: 10px 14px; border-left: 3px solid var(--color-brand); background: var(--color-bg-primary); border-radius: 0 var(--radius-4) var(--radius-4) 0; font-size: var(--font-size-base); line-height: 1.7; }
.fa-rules { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; }
.fa-rule { display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; border-radius: var(--radius-4); font-size: var(--font-size-md); line-height: 1.6; }
.fa-rule p { margin: 0; }
.fa-rule i { font-size: var(--font-size-xl); }
.fa-rule.no { background: color-mix(in srgb, var(--color-danger) 8%, transparent); }
.fa-rule.no i { color: var(--color-danger); }
.fa-rule.yes { background: color-mix(in srgb, var(--color-success) 8%, transparent); }
.fa-rule.yes i { color: var(--color-success); }
.fa-list { margin: 0; padding-left: 18px; display: grid; gap: 4px; font-size: 12.5px; line-height: 1.6; }
</style>
