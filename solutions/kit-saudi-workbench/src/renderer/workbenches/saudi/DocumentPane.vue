<template>
  <div class="sd-doc-pane">
    <div v-if="!attachments.length" class="sd-right-empty">
      <i class="ri-file-search-line"></i>
      <p>{{ $t('该任务暂无附件。点中栏结论上的 📎 锚点可定位到对应原文位置。') }}</p>
    </div>

    <template v-else>
      <div class="sd-doc-files">
        <button
          v-for="file in attachments"
          :key="file.relPath"
          type="button"
          :class="{ active: activeFile?.relPath === file.relPath }"
          @click="openFile(file)"
        >
          <i :class="fileIcon(file.kind)"></i>{{ file.fileName }}
        </button>
      </div>

      <div v-if="loading" class="sd-doc-loading">
        <i class="ri-loader-4-line spin"></i>{{ $t('正在解析原文…') }}
      </div>

      <div v-else-if="error" class="sd-doc-error">
        <i class="ri-error-warning-line"></i>{{ error }}
      </div>

      <!-- PDF：pdf.js 画布 + 自绘高亮层（高亮层读锚点的页码/关键词） -->
      <template v-else-if="activeFile?.kind === 'pdf'">
        <div class="sd-doc-toolbar">
          <button type="button" :disabled="pageNo <= 1" @click="gotoPage(pageNo - 1)"><i class="ri-arrow-left-s-line"></i></button>
          <span>{{ pageNo }} / {{ pageCount }}</span>
          <button type="button" :disabled="pageNo >= pageCount" @click="gotoPage(pageNo + 1)"><i class="ri-arrow-right-s-line"></i></button>
          <span class="sd-doc-spacer"></span>
          <button type="button" @click="zoom(-0.2)"><i class="ri-zoom-out-line"></i></button>
          <button type="button" @click="zoom(0.2)"><i class="ri-zoom-in-line"></i></button>
        </div>
        <div class="sd-doc-canvas-wrap">
          <canvas ref="canvasEl"></canvas>
          <div v-for="(box, i) in highlightBoxes" :key="i" class="sd-doc-hl" :style="box"></div>
        </div>
      </template>

      <!-- Excel：转 JSON 网格自渲染，按 sheet!cell 定位并整行高亮 -->
      <template v-else-if="activeFile?.kind === 'xlsx'">
        <div class="sd-doc-toolbar">
          <select v-model="activeSheet" @change="renderSheet()">
            <option v-for="name in sheetNames" :key="name" :value="name">{{ name }}</option>
          </select>
          <span class="sd-doc-spacer"></span>
          <span class="sd-doc-hint">{{ $t('{p0} 行 × {p1} 列', { p0: grid.length, p1: maxCols }) }}</span>
        </div>
        <div class="sd-doc-grid-wrap">
          <table class="sd-doc-grid">
            <tbody>
              <tr v-for="(row, r) in grid" :key="r" :class="{ hit: r === hitRow }">
                <th class="sd-doc-rowno">{{ r + 1 }}</th>
                <td
                  v-for="(cell, c) in row"
                  :key="c"
                  :class="{ hit: r === hitRow && c === hitCol }"
                  dir="auto"
                >{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Word：主进程拆成段落，这里按序号渲染。锚点用段落序号（Word 没有稳定页码） -->
      <template v-else-if="activeFile?.kind === 'docx'">
        <div class="sd-doc-toolbar">
          <span>{{ $t('{p0} 段', { p0: docxBlocks.length }) }}</span>
          <span class="sd-doc-spacer"></span>
          <span class="sd-doc-hint">{{ $t('Word 按段落定位（无固定页码）') }}</span>
        </div>
        <div class="sd-doc-docx">
          <div
            v-for="b in docxBlocks"
            :key="b.index"
            class="sd-docx-block"
            :class="[`kind-${b.kind}`, { hit: b.index === docxHit }]"
          >
            <span class="sd-docx-no">{{ b.index }}</span>
            <table v-if="b.kind === 'table-row'" class="sd-docx-row">
              <tbody><tr><td v-for="(cell, i) in b.cells" :key="i" dir="auto">{{ cell }}</td></tr></tbody>
            </table>
            <p v-else dir="auto">{{ b.text }}</p>
          </div>
        </div>
      </template>

      <template v-else-if="activeFile?.kind === 'text'">
        <div class="sd-textdoc">
          <div
            v-for="(line, i) in textLines"
            :key="i"
            class="sd-textdoc-line"
            :class="{ hit: i === textHit }"
            dir="auto"
          >{{ line || ' ' }}</div>
        </div>
      </template>

      <div v-else class="sd-doc-error">
        <i class="ri-file-line"></i>{{ $t('该类型暂不支持在右栏预览：{p0}', { p0: activeFile?.fileName || '' }) }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { humanizeErrorMessage } from '../../utils/humanize';
import { t as i18nT } from '../../i18n';
import type { Anchor } from './types';

/** 与主进程 IntakeAttachmentDTO 对齐的最小形状 */
export interface DocAttachment {
  fileName: string;
  relPath: string;
  /** 'text' = 邮件/表单/聊天/网页快照等纯文本来件，右栏按文本预览 */
  kind: 'pdf' | 'xlsx' | 'docx' | 'image' | 'text' | 'other';
  mime?: string;
  /** 附件挂在哪条收件上。合并任务里附件可能来自同组另一条来源，读字节要用它 */
  itemId?: string;
}

const props = defineProps<{
  itemId: string;
  attachments: DocAttachment[];
  anchor?: Anchor | null;
}>();

const activeFile = ref<DocAttachment | null>(null);
/** Word 段落（主进程拆好给过来）+ 当前命中的段落序号 */
const docxBlocks = ref<{ index: number; kind: string; text: string; cells?: string[] }[]>([]);
/** 纯文本来件（.eml/.txt/.json/.html）的正文，按行渲染以便高亮命中行 */
const textLines = ref<string[]>([]);
const textHit = ref(-1);
const docxHit = ref(-1);
const loading = ref(false);
const error = ref('');
const canvasEl = ref<HTMLCanvasElement | null>(null);

// PDF 态
let pdfDoc: any = null;
/**
 * 正在进行的 pdf.js 渲染任务。
 *
 * 同一张 canvas 上并发 `render()` 会被 pdf.js 直接拒掉：
 * "Cannot use the same canvas during multiple render() operations" ——
 * 现象是右栏一片空白 + 「原文解析失败」，而附件本身完全没问题。
 * 打开案件那一下最容易撞上：attachments 与 anchor 两个 watcher 前后脚各发一次渲染。
 * 所以新渲染开工前必须先把旧的取消掉，取消抛的 RenderingCancelledException 是预期的。
 */
let renderTask: any = null;
/** 渲染序号：只有最新一次 gotoPage 有资格画，旧的在每个 await 之后自行退场。 */
let renderSeq = 0;
const pageNo = ref(1);
const pageCount = ref(0);
const scale = ref(1);
const highlightBoxes = ref<Record<string, string>[]>([]);

// Excel 态
let workbook: any = null;
let xlsxModule: any = null;
const sheetNames = ref<string[]>([]);
const activeSheet = ref('');
const grid = ref<string[][]>([]);
const hitRow = ref(-1);
const hitCol = ref(-1);
const maxCols = computed(() => grid.value.reduce((m, r) => Math.max(m, r.length), 0));

function fileIcon(kind: DocAttachment['kind']): string {
  return {
    pdf: 'ri-file-pdf-line', xlsx: 'ri-file-excel-line', docx: 'ri-file-word-line',
    image: 'ri-image-line', text: 'ri-mail-line', other: 'ri-file-line',
  }[kind];
}

/**
 * 加载 pdf.js，并让它**在主线程跑**（不起 Web Worker）。
 *
 * 为什么不用 worker：打包后渲染层是 `loadFile` 起的 `file://` 页面，Chromium 不允许从
 * file:// 起（module）Worker；给个 CDN/相对 URL 又要额外产物与协议假设。
 *
 * 正确的关法是 `globalThis.pdfjsWorker` —— pdf.js 的 `#mainThreadWorkerMessageHandler`
 * 读到它就直接用 LoopbackPort 在主线程装 WorkerMessageHandler，全程不碰 URL。
 * ⚠ 曾经写成 `GlobalWorkerOptions.workerSrc = ''` 想"关掉 worker"，pdf.js v4 里
 * 那个 getter 遇到空值是**直接抛** `No "GlobalWorkerOptions.workerSrc" specified.`，
 * 于是右栏所有 PDF 都打不开（`disableWorker` 在 v4 也早已不是公开选项）。
 * worker 模块 2.3MB 但自包含，走动态 import 单独成 chunk，只有真打开 PDF 时才下载。
 */
let pdfjsPromise: Promise<any> | null = null;
function loadPdfjs(): Promise<any> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const [pdfjs, worker] = await Promise.all([
        import('pdfjs-dist/legacy/build/pdf.mjs'),
        import('pdfjs-dist/legacy/build/pdf.worker.mjs'),
      ]);
      (globalThis as any).pdfjsWorker = worker;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

async function readBytes(file: DocAttachment): Promise<Uint8Array> {
  const api = (window as any).electronAPI?.intake;
  if (!api?.readAttachment) throw new Error(i18nT('收件服务未就绪，无法读取附件'));
  // 合并任务的附件可能挂在同组的**另一条**来源上（邮件发的规格书、表单传的清单）。
  // 附件自带 itemId 时按它读，否则才回落当前条目 —— 用错宿主 id 会读成「附件已不在本机」。
  const res = await api.readAttachment({ itemId: file.itemId || props.itemId, relPath: file.relPath });
  if (!res?.ok || !res.base64) throw new Error(i18nT('附件已不在本机（可能被清理），请重新收取'));
  const binary = atob(res.base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function openFile(file: DocAttachment): Promise<void> {
  activeFile.value = file;
  error.value = '';
  loading.value = true;
  pdfDoc = null;
  workbook = null;
  grid.value = [];
  docxBlocks.value = [];
  docxHit.value = -1;
  textLines.value = [];
  textHit.value = -1;
  highlightBoxes.value = [];
  try {
    // docx 由主进程拆段落，不用把整份字节搬进渲染层（一份 20MB 的标书 base64 过 IPC 没必要）
    if (file.kind === 'docx') {
      const api = (window as any).electronAPI?.intake;
      const res = await api?.readDocxText?.({ itemId: file.itemId || props.itemId, relPath: file.relPath });
      if (!res?.ok) throw new Error(res?.message || i18nT('Word 文档解析失败'));
      docxBlocks.value = res.blocks || [];
      docxHit.value = props.anchor?.docName === file.fileName ? (props.anchor?.page ?? -1) : -1;
      return;
    }
    const bytes = await readBytes(file);
    if (file.kind === 'text') {
      // 邮件/表单/聊天/网页快照：右栏按纯文本预览。
      // 这些文件没有页码与单元格，锚点是文件级，所以这里只做「定位到命中那一行」。
      const raw = new TextDecoder('utf-8').decode(bytes);
      textLines.value = raw.replace(/\r\n/g, '\n').split('\n');
      const kw = (props.anchor?.docName === file.fileName ? props.anchor?.keyword : '') || '';
      textHit.value = kw ? textLines.value.findIndex((l) => l.includes(kw.slice(0, 24))) : -1;
      loading.value = false;
      return;
    }
    if (file.kind === 'pdf') {
      const pdfjs: any = await loadPdfjs();
      pdfDoc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true } as any).promise;
      pageCount.value = pdfDoc.numPages;
      // ⚠ 必须先退出 loading 再画：模板里 canvas 在 `v-else-if`（loading 为真时整个 PDF 分支
      // 都不在 DOM 里），在 loading 期间调 gotoPage 只会拿到 null canvas 然后**静默返回** ——
      // 这条路径让「PDF 永远是空白页」藏了很久。Excel 分支不受影响是因为它只填响应式数组。
      loading.value = false;
      await gotoPage(props.anchor?.page && props.anchor.docName === file.fileName ? props.anchor.page : 1);
    } else if (file.kind === 'xlsx') {
      xlsxModule = await import('xlsx');
      workbook = xlsxModule.read(bytes, { type: 'array' });
      sheetNames.value = workbook.SheetNames || [];
      activeSheet.value = anchorSheet() || sheetNames.value[0] || '';
      renderSheet();
    }
  } catch (e) {
    // 给用户看的是干净文案（humanize 还会把语种不符的原文换成通用句），但排障必须留原文：
    // pdf.js / xlsx 的报错全是英文，被兜底吃掉后控制台里再无线索，只能靠猜。
    console.error('[saudi/DocumentPane] 打开附件失败', { file: file.fileName, kind: file.kind }, e);
    error.value = humanizeErrorMessage(e, i18nT('原文解析失败'));
  } finally {
    loading.value = false;
  }
}

function anchorSheet(): string {
  const cell = props.anchor?.cell || '';
  return cell.includes('!') ? cell.split('!')[0] : '';
}

async function gotoPage(target: number): Promise<void> {
  if (!pdfDoc) return;
  // 本次渲染的序号。每次进来都自增，后面每个 await 之后都对一次 ——
  // 只有「最新的那次」有资格往下走。附件与锚点两个 watcher 会前后脚各叫一次 gotoPage，
  // 没有这道闸门时两次都会跑到最后，画面来回抢同一张 canvas。
  const seq = ++renderSeq;
  pageNo.value = Math.min(Math.max(1, target), pageCount.value || 1);
  const page = await pdfDoc.getPage(pageNo.value);
  if (seq !== renderSeq) return;
  const viewport = page.getViewport({ scale: scale.value * 1.2 });
  await nextTick();
  if (seq !== renderSeq) return;
  // canvas 可能还没挂上（切文件那一帧）：再等一帧；仍拿不到就说出来，别静默吞掉——
  // 静默 return 的代价是「界面一片空白但没有任何报错」，排障时无从下手。
  let canvas = canvasEl.value;
  if (!canvas) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    if (seq !== renderSeq) return;
    canvas = canvasEl.value;
  }
  if (!canvas) {
    console.warn('[saudi/DocumentPane] canvas 未挂载，跳过本次渲染', { page: pageNo.value });
    return;
  }
  // 停掉上一次还没画完的那次，**然后立刻开画，中间一个 await 都不能有**：
  // pdf.js 的 cancel() 是同步把 canvas 从 in-use 集合里摘掉的，而只要中间夹一次 await，
  // 两次并发的 gotoPage 就会双双通过「没有在途任务」的检查、双双 render 同一张 canvas，
  // 报 "Cannot use the same canvas during multiple render() operations" —— 右栏一片空白 +
  // 「原文解析失败」，而附件本身完全没问题。改 canvas.width 也会清空画布，同理不能留在旧任务之后。
  cancelPendingRender();
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const task = page.render({ canvasContext: ctx, viewport });
  renderTask = task;
  try {
    await task.promise;
  } catch (e) {
    // 被后来的渲染取消：正常路径，直接让位，不能冒泡成「原文解析失败」
    if (isRenderCancelled(e)) return;
    throw e;
  } finally {
    if (renderTask === task) renderTask = null;
  }
  await paintHighlights(page, viewport);
}

function isRenderCancelled(e: unknown): boolean {
  return (e as any)?.name === 'RenderingCancelledException';
}

/**
 * 取消在途渲染。**必须是同步的** —— 见 gotoPage 里那段注释。
 * 被取消的任务会以 RenderingCancelledException 收尾，它的 await 方自己吞掉，这里不等。
 */
function cancelPendingRender(): void {
  const task = renderTask;
  if (!task) return;
  renderTask = null;
  try { task.cancel(); } catch { /* 已经结束的任务再取消一次无所谓 */ }
}

/**
 * 高亮层：锚点没有 bbox 时，用文本层定位锚点关键词所在的行 —— 演示里客户点的是
 * 「这个结论出自哪」，能把那几行框出来就够，不需要精确到字。
 */
async function paintHighlights(page: any, viewport: any): Promise<void> {
  highlightBoxes.value = [];
  const anchor = props.anchor;
  if (!anchor || anchor.page !== pageNo.value) return;
  if (anchor.bbox) {
    const [x0, y0, x1, y1] = anchor.bbox;
    highlightBoxes.value = [{
      left: `${x0 * viewport.width}px`,
      top: `${y0 * viewport.height}px`,
      width: `${(x1 - x0) * viewport.width}px`,
      height: `${(y1 - y0) * viewport.height}px`,
    }];
    return;
  }
  const keyword = (anchor.keyword || '').trim();
  if (!keyword) return;
  try {
    const content = await page.getTextContent();
    const boxes: Record<string, string>[] = [];
    for (const item of content.items as any[]) {
      if (!item.str || !String(item.str).includes(keyword)) continue;
      const tx = item.transform;
      const width = item.width * viewport.scale;
      const height = (item.height || 10) * viewport.scale;
      boxes.push({
        left: `${tx[4] * viewport.scale}px`,
        top: `${viewport.height - tx[5] * viewport.scale - height}px`,
        width: `${width}px`,
        height: `${height}px`,
      });
    }
    highlightBoxes.value = boxes.slice(0, 20);
  } catch { /* 文本层取不到就不高亮，页面照常显示 */ }
}

function zoom(delta: number): void {
  scale.value = Math.min(3, Math.max(0.5, scale.value + delta));
  void gotoPage(pageNo.value);
}

function renderSheet(): void {
  if (!workbook || !activeSheet.value) return;
  const sheet = workbook.Sheets[activeSheet.value];
  if (!sheet) return;
  // header:1 拿二维数组并保留空单元格位置，才能按 A1 记号定位；
  // 取不到 utils（极端打包分支）时退回自己按 !ref 读格子。
  const data: any[][] = xlsxModule?.utils
    ? xlsxModule.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    : sheetToRows(sheet);
  grid.value = data.slice(0, 400).map((row) => row.map((cell) => String(cell ?? '')));
  locateAnchorCell();
}

/** 不依赖 XLSX.utils 的兜底：直接读 !ref 范围里的单元格。 */
function sheetToRows(sheet: any): any[][] {
  const ref: string = sheet['!ref'] || 'A1';
  const match = ref.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) return [];
  const colToNum = (col: string) => col.split('').reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0);
  const numToCol = (num: number) => {
    let s = '';
    let n = num;
    while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
  };
  const [, c0, r0, c1, r1] = match;
  const out: any[][] = [];
  for (let r = Number(r0); r <= Number(r1); r += 1) {
    const row: any[] = [];
    for (let c = colToNum(c0); c <= colToNum(c1); c += 1) {
      row.push(sheet[`${numToCol(c)}${r}`]?.v ?? '');
    }
    out.push(row);
  }
  return out;
}

/** 把锚点的 `Sheet!C12` 转成行列下标并高亮。 */
function locateAnchorCell(): void {
  hitRow.value = -1;
  hitCol.value = -1;
  const cell = props.anchor?.cell;
  if (!cell) return;
  const target = cell.includes('!') ? cell.split('!')[1] : cell;
  const match = target.match(/^([A-Z]+)(\d+)$/);
  if (!match) return;
  const colNum = match[1].split('').reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0);
  hitRow.value = Number(match[2]) - 1;
  hitCol.value = colNum - 1;
}

watch(() => props.attachments, (list) => {
  if (!list.length) { activeFile.value = null; return; }
  const preferred = props.anchor
    ? list.find((f) => f.fileName === props.anchor?.docName)
    : undefined;
  void openFile(preferred || list[0]);
}, { immediate: true });

watch(() => props.anchor, (anchor) => {
  if (!anchor) return;
  const match = props.attachments.find((f) => f.fileName === anchor.docName);
  if (match && match.relPath !== activeFile.value?.relPath) {
    void openFile(match);
    return;
  }
  if (activeFile.value?.kind === 'pdf' && anchor.page) void gotoPage(anchor.page);
  if (activeFile.value?.kind === 'xlsx') {
    const sheet = anchorSheet();
    if (sheet && sheet !== activeSheet.value) { activeSheet.value = sheet; renderSheet(); }
    else locateAnchorCell();
  }
});
</script>

<style scoped>
.sd-doc-pane { display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.sd-right-empty { text-align: center; color: #94a3b8; padding: 40px 0; }
.sd-right-empty i { font-size: 30px; }
.sd-right-empty p { font-size: 13px; margin: 8px 0 0; }
.sd-doc-files { display: flex; flex-wrap: wrap; gap: 6px; }
.sd-doc-files button {
  border: 1px solid #e3e8ef; background: #fff; border-radius: 6px; padding: 3px 9px;
  font-size: 12px; color: #475467; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
}
.sd-doc-files button.active { border-color: #0e9e86; color: #0b7d6a; background: #e6f7f3; }
.sd-doc-loading, .sd-doc-error {
  display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; padding: 16px 0;
}
.sd-doc-error { color: #b42318; }
.sd-doc-toolbar { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475467; }
.sd-doc-toolbar button {
  border: 1px solid #e3e8ef; background: #fff; border-radius: 4px; cursor: pointer;
  width: 24px; height: 22px; display: inline-flex; align-items: center; justify-content: center;
}
.sd-doc-toolbar button:disabled { opacity: .4; cursor: not-allowed; }
.sd-doc-toolbar select { border: 1px solid #e3e8ef; border-radius: 4px; padding: 2px 6px; font-size: 12px; }
.sd-doc-spacer { flex: 1; }
.sd-doc-hint { color: #94a3b8; }
.sd-doc-canvas-wrap { position: relative; overflow: auto; background: #f1f5f9; border-radius: 6px; padding: 8px; }
.sd-doc-canvas-wrap canvas { display: block; max-width: 100%; background: #fff; box-shadow: 0 1px 2px rgba(16,24,40,.08); }
.sd-doc-hl {
  position: absolute; background: rgba(14, 158, 134, .22); border: 1px solid #0e9e86;
  border-radius: 2px; pointer-events: none;
}
.sd-doc-grid-wrap { overflow: auto; border: 1px solid #e3e8ef; border-radius: 6px; }
.sd-doc-grid { border-collapse: collapse; font-size: 11px; }
.sd-doc-grid td, .sd-doc-grid th {
  border: 1px solid #eef2f6; padding: 2px 6px; white-space: nowrap;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis;
}
.sd-doc-rowno { background: #f1f5f9; color: #94a3b8; position: sticky; left: 0; }
.sd-doc-grid tr.hit td { background: #fffaeb; }
.sd-doc-grid td.hit { background: #fde68a; outline: 2px solid #b45309; }
.spin { animation: sd-spin 1s linear infinite; }
@keyframes sd-spin { to { transform: rotate(360deg); } }

/* 跟随父工作台与全局明暗主题。文档画布本身保持白纸，工具栏和表格换肤。 */
.sd-right-empty, .sd-doc-hint { color: var(--sd-text-muted, var(--color-text-muted)); }
.sd-doc-files button, .sd-doc-toolbar button, .sd-doc-toolbar select {
  color: var(--sd-text-soft, var(--color-text-secondary));
  background: var(--sd-surface, var(--color-bg-card));
  border-color: var(--sd-border, var(--color-border));
}
.sd-doc-files button.active {
  color: var(--sd-accent-strong, var(--color-brand-hover));
  background: var(--sd-accent-soft, var(--color-brand-subtle));
  border-color: var(--sd-accent, var(--color-brand));
}
.sd-doc-files button:focus-visible, .sd-doc-toolbar button:focus-visible,
.sd-doc-toolbar select:focus-visible {
  outline: 2px solid var(--sd-accent, var(--color-brand)); outline-offset: 2px;
}
.sd-doc-loading, .sd-doc-toolbar { color: var(--sd-text-soft, var(--color-text-secondary)); }
.sd-doc-error { color: var(--sd-danger, var(--color-danger)); }
.sd-doc-canvas-wrap, .sd-doc-rowno {
  color: var(--sd-text-muted, var(--color-text-muted));
  background: var(--sd-surface-soft, var(--color-bg-input));
}
.sd-doc-grid-wrap { border-color: var(--sd-border, var(--color-border)); }
.sd-doc-grid td, .sd-doc-grid th { color: var(--sd-text, var(--color-text-primary)); border-color: var(--sd-divider, var(--color-divider)); }
.sd-doc-grid tr.hit td { background: var(--sd-warning-soft, var(--color-status-warning-bg)); }
.sd-doc-grid td.hit {
  background: color-mix(in srgb, var(--sd-warning, var(--color-warning)) 24%, var(--sd-surface, var(--color-bg-card)));
  outline-color: var(--sd-warning, var(--color-warning));
}
.sd-doc-hl {
  background: color-mix(in srgb, var(--sd-accent, var(--color-brand)) 22%, transparent);
  border-color: var(--sd-accent, var(--color-brand));
}

@media (prefers-reduced-motion: reduce) {
  .spin { animation-duration: .01ms; animation-iteration-count: 1; }
}
/* Word 段落预览 */
.sd-doc-docx { overflow: auto; padding: 12px 14px; background: #fff; }
.sd-docx-block { display: flex; gap: 10px; padding: 4px 0; align-items: flex-start; }
.sd-docx-block.hit { background: #fffaeb; border-radius: 4px; }
.sd-docx-no {
  flex-shrink: 0; width: 28px; text-align: right; color: #94a3b8;
  font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding-top: 3px;
}
.sd-docx-block p { margin: 0; font-size: 13px; line-height: 21px; color: #1b2733; }
.sd-docx-block.kind-heading p { font-weight: 700; font-size: 14px; }
/* 纯文本来件：等宽 + 保留缩进，命中行高亮（锚点只能到文件级，行高亮已是最强定位） */
.sd-textdoc { padding: 10px 12px; overflow: auto; }
.sd-textdoc-line {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 12px; line-height: 1.7; white-space: pre-wrap; word-break: break-word;
  padding: 0 4px; border-radius: 3px; color: #1b2733;
}
.sd-textdoc-line.hit { background: #fef3c7; }
.sd-docx-row { border-collapse: collapse; font-size: 12px; }
.sd-docx-row td { border: 1px solid #e3e8ef; padding: 3px 8px; color: #1b2733; }
.sd-doc-hint { font-size: 11px; color: #94a3b8; }
</style>