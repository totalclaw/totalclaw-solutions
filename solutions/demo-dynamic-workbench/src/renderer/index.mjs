/**
 * 动态方案渲染入口（ESM）：宿主经 tc-solution:// 协议 import 本文件。
 *
 * 默认导出一个工厂函数 (sdk) => Vue 组件。不要 import 'vue'——用 sdk.vue（与宿主同一个 Vue 实例）。
 *   sdk.invoke(action, payload)  调主进程模块 ctx.handle 注册的 action
 *   sdk.on(event, fn)            订阅主进程 ctx.emit 的事件，返回取消订阅函数
 *   sdk.t(text)                  宿主多语言（中文原文为 key）
 *   sdk.notify.success/info/warn/error
 *   sdk.navigate(path)           宿主路由跳转
 *   sdk.asset(rel)               本方案包内文件 URL
 * 用 SFC 开发时，构建把 `import { … } from 'vue'` 改写为 `globalThis.__TOTALCLAW_SDK__.vue` 即可。
 */
export default function createSolution(sdk) {
  const { defineComponent, h, onMounted, onUnmounted, ref } = sdk.vue;
  const t = sdk.t;

  return defineComponent({
    name: 'DemoDynamicWorkbench',
    setup() {
      const info = ref(null);
      const notes = ref([]);
      const text = ref('');
      const busy = ref(false);
      let off = null;

      async function load() {
        try {
          info.value = await sdk.invoke('info');
          notes.value = await sdk.invoke('listNotes');
        } catch (e) {
          sdk.notify.warn(e.message);
        }
      }

      async function add() {
        if (!text.value.trim() || busy.value) return;
        busy.value = true;
        try {
          notes.value = await sdk.invoke('addNote', { text: text.value });
          text.value = '';
        } catch (e) {
          sdk.notify.warn(e.message);
        } finally {
          busy.value = false;
        }
      }

      async function remove(id) {
        notes.value = await sdk.invoke('removeNote', { id });
      }

      onMounted(() => {
        void load();
        off = sdk.on('notes-changed', () => void load());
      });
      onUnmounted(() => off && off());

      const box = 'max-width:720px;margin:32px auto;padding:0 24px;font-size:14px;color:var(--color-text-primary,#111827)';
      const card = 'border:1px solid var(--color-border,#e5e7eb);border-radius:12px;padding:14px 16px;margin-top:12px;background:var(--color-bg-card,#fff)';
      const btn = 'padding:6px 14px;border-radius:8px;border:1px solid var(--color-brand,#6366f1);background:var(--color-brand,#6366f1);color:#fff;cursor:pointer';

      return () =>
        h('div', { style: box, 'data-test': 'demo-dynamic-workbench' }, [
          h('h2', { style: 'margin:0 0 4px;font-size:20px' }, t('动态方案样例（开发者模板）')),
          h(
            'p',
            { style: 'margin:0;color:var(--color-text-secondary,#6b7280)' },
            info.value ? `v${info.value.version} · hostApi ${info.value.hostApi} · App ${info.value.appVersion}` : '…',
          ),
          h('div', { style: card }, [
            h('textarea', {
              value: text.value,
              rows: 3,
              style: 'width:100%;box-sizing:border-box;border:1px solid var(--color-border,#e5e7eb);border-radius:8px;padding:8px;font:inherit',
              placeholder: t('写一条笔记，保存在当前账号的数据目录（升级方案不会丢）'),
              onInput: (e) => (text.value = e.target.value),
            }),
            h('div', { style: 'margin-top:8px;text-align:right' }, [
              h('button', { style: btn, disabled: busy.value, onClick: add }, t('保存')),
            ]),
          ]),
          ...notes.value.map((n) =>
            h('div', { key: n.id, style: card }, [
              h('div', { style: 'white-space:pre-wrap' }, n.text),
              h('div', { style: 'margin-top:6px;font-size:12px;color:var(--color-text-secondary,#6b7280);display:flex;justify-content:space-between' }, [
                h('span', new Date(n.at).toLocaleString()),
                h('a', { style: 'cursor:pointer;color:#dc2626', onClick: () => remove(n.id) }, t('删除')),
              ]),
            ]),
          ),
        ]);
    },
  });
}
