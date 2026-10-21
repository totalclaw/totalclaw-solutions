<template>
  <div class="fau-arts" data-test="fau-artifacts">
    <p v-if="!artifacts.length" class="ss-note"><i class="ri-information-line"></i>{{ $t('还没有生成文件') }}</p>
    <div v-for="a in artifacts" :key="a.id" class="ss-file-out">
      <i :class="a.kind === 'docx' ? 'ri-file-word-2-line' : 'ri-file-excel-2-line'"></i>
      <strong>{{ msg(a.title) }}</strong>
      <span class="fau-badge" :class="archived ? 'ok' : 'warn'">{{ archived ? $t('已签核·已归档') : $t('草稿—待签核') }}</span>
      <code :title="a.path"><FauNum :value="baseName(a.path)" /></code>
      <button type="button" class="ss-btn sm" @click="preview(a)"><i class="ri-eye-line"></i>{{ $t('预览') }}</button>
      <button type="button" class="ss-btn sm" @click="open(a, false)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
      <button type="button" class="ss-btn sm ghost" @click="open(a, true)"><i class="ri-folder-line"></i>{{ $t('在文件夹中显示') }}</button>
    </div>
    <div v-if="view" class="fau-preview" data-test="fau-preview">
      <div class="fau-row">
        <strong class="grow">{{ msg(view.title) }}</strong>
        <span v-if="data?.rtl" class="fau-badge muted">RTL</span>
        <button type="button" class="ss-btn ghost sm" @click="view = null"><i class="ri-close-line"></i></button>
      </div>
      <p v-if="err" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ err }}</p>
      <template v-else-if="data?.kind === 'xlsx'">
        <div class="fau-seg fau-sheets">
          <button v-for="(s, i) in data.sheets" :key="s.name" type="button" :class="{ on: sheet === i }" @click="sheet = i">{{ s.name }}</button>
        </div>
        <div class="fau-table-wrap" :dir="data.rtl ? 'rtl' : undefined">
          <table class="fau-table">
            <tbody>
              <tr v-for="(r, ri) in data.sheets[sheet]?.rows || []" :key="ri">
                <td v-for="(c, ci) in r" :key="ci" :class="{ num: typeof c === 'number' }"><FauNum v-if="typeof c === 'number'" :value="c" /><template v-else>{{ c }}</template></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else-if="data?.kind === 'docx'" class="fau-docx" :dir="data.rtl ? 'rtl' : undefined">
        <p v-for="(p, i) in data.paragraphs" :key="i">{{ p }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 产出文件：表格分页预览 / 打开 / 在文件夹显示（只允许本方案生成的文件，主进程再校一次路径） */
import { ref } from 'vue';
import type { FauArtifact } from '@totalclaw/ipc-contracts';
import FauNum from './FauNum.vue';
import { errorMessage, fau, msg } from './shared';
import { useNotificationStore } from '../../stores/notification';

defineProps<{ artifacts: FauArtifact[]; archived?: boolean }>();
const view = ref<FauArtifact | null>(null);
const data = ref<any>(null);
const sheet = ref(0);
const err = ref('');
const baseName = (p: string) => p.split(/[\\/]/).pop() || p;

async function preview(a: FauArtifact): Promise<void> {
  view.value = a; data.value = null; sheet.value = 0; err.value = '';
  try { data.value = await fau('artifact.preview', { path: a.path, maxRows: 40 }); } catch (e) { err.value = errorMessage(e); }
}
async function open(a: FauArtifact, reveal: boolean): Promise<void> {
  try { await fau(reveal ? 'artifact.reveal' : 'artifact.open', { path: a.path }); } catch (e) { useNotificationStore().error(errorMessage(e)); }
}
</script>

<style scoped>
.fau-arts { display: grid; gap: 8px; }
.fau-preview { border: 1px solid var(--color-border); border-radius: 12px; padding: 10px 12px; display: grid; gap: 8px; background: var(--color-bg-card); }
.fau-sheets { flex-wrap: wrap; }
.fau-docx { max-height: 360px; overflow: auto; font-size: 12.5px; line-height: 1.6; }
.fau-docx p { margin: 0 0 6px; }
</style>
