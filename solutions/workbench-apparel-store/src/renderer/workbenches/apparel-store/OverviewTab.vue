<template>
  <div class="ap-ov">
    <section class="ss-panel">
      <h3>{{ $t('不止一键换装：先把「试穿 → 到店 → 成交」跑通') }}</h3>
      <p class="ss-muted">{{ $t('顾客在手机上 30 秒内看到自己穿上店里衣服的样子，想试实物再进试衣间；店员凭试穿码提前备好尺码；老板看每件款式的试穿、到店与成交，决定主推款。不需要智能试衣镜，也不需要小程序。') }}</p>
      <div class="ap-ov__cards">
        <div v-for="c in cards" :key="c.title" class="ap-ov__card"><i :class="c.icon"></i><strong>{{ c.title }}</strong><span>{{ c.text }}</span></div>
      </div>
    </section>
    <section class="ss-panel">
      <h3>{{ $t('能力边界') }}</h3>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('本方案做') }}</th><th>{{ $t('本方案不做') }}</th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in bounds" :key="i"><td class="ap-wrap">{{ r[0] }}</td><td class="ap-wrap">{{ r[1] }}</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="ss-panel">
      <h3>{{ $t('AI 结果的可信边界') }}</h3>
      <ul class="ap-list">
        <li>{{ $t('形象分析只作搭配参考，界面标注「AI 估计」，不给任何身材评价') }}</li>
        <li>{{ $t('推荐造型只能来自选项库，模型给出库外选项一律丢弃') }}</li>
        <li>{{ $t('尺码推荐由尺码表规则计算，不交给模型；没填身高不推荐') }}</li>
        <li>{{ $t('AI 打标签可手改，手改后以人工为准') }}</li>
        <li>{{ $t('未配置图像服务时明确提示去哪配置，不出假图') }}</li>
      </ul>
    </section>
    <section class="ss-panel">
      <h3>{{ $t('配套：经营自动化智能体') }}</h3>
      <p class="ss-muted">{{ $t('同一个商品库继续用于：短视频生成并发布抖音 / 快手 / 小红书 / 视频号、商品图文上下架、数字人介绍门店、经营数据日报。') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { t as i18nT } from '../../i18n';

const cards = [
  { icon: 'ri-t-shirt-air-line', title: i18nT('AI 一键换装'), text: i18nT('顾客照片 + 服装图，按所选背景、姿势、发型生成照片级试穿图') },
  { icon: 'ri-landscape-line', title: i18nT('75 项造型 · 200+ 细分场景'), text: i18nT('背景 30、姿势 20、发型 25（含男装、童装），每项再选细分场景') },
  { icon: 'ri-smartphone-line', title: i18nT('手机、电脑同时看'), text: i18nT('门店码扫码即用；店员建档的顾客也能扫专属码在手机上看、保存') },
  { icon: 'ri-qr-scan-2-line', title: i18nT('试穿码到店'), text: i18nT('想试实物 → 试穿码 + 推荐尺码，店员提前备货，登记成交自动扣库存') },
  { icon: 'ri-bar-chart-2-line', title: i18nT('试穿数据看板'), text: i18nT('漏斗、款式排行、高试穿低成交预警、热门造型组合') },
  { icon: 'ri-shield-user-line', title: i18nT('隐私优先'), text: i18nT('先授权后上传，照片只存门店电脑，到期自动删除，顾客可随时删除') },
];
const bounds: Array<[string, string]> = [
  [i18nT('商品库导入与 AI 打标签'), i18nT('3D 服装建模、AR 实时试穿')],
  [i18nT('顾客授权、照片质检、形象分析'), i18nT('微信小程序（先用店内手机网页）')],
  [i18nT('背景 / 姿势 / 发型选项库与细分场景'), i18nT('对接收银 / 进销存（库存先手工维护）')],
  [i18nT('AI 合成、手机电脑同时查看、带码保存'), i18nT('顾客在店外通过公网访问')],
  [i18nT('试穿码核销、尺码助手、试穿数据看板'), i18nT('会员营销、补货预测、巡店（后续规划）')],
];
</script>

<style scoped>
.ap-ov { display: grid; gap: 14px; max-width: 1100px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 16px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: 15px; }
.ap-ov__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
.ap-ov__card { display: grid; gap: 4px; padding: 12px; border-radius: 12px; background: var(--color-bg-primary); border: 1px solid var(--color-border); font-size: 12.5px; }
.ap-ov__card i { font-size: 22px; color: var(--color-brand); }
.ap-ov__card span { color: var(--color-text-secondary); line-height: 1.55; }
.ap-list { margin: 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-secondary); display: grid; gap: 4px; }
.ap-wrap { white-space: normal !important; }
</style>
