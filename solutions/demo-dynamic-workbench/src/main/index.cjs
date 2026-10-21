/**
 * 动态方案主进程模块（CommonJS）：宿主在安装 / 升级后 require 本文件并调用 activate(ctx)。
 *
 * ctx（hostApi=1）：
 *   ctx.handle(action, fn)         注册渲染层可调用的 action（渲染层 sdk.invoke(action, payload)）
 *   ctx.emit(event, payload)       向渲染层推事件（渲染层 sdk.on(event, fn)）
 *   ctx.readJson / ctx.writeJson   读写当前账号数据——只能在 solution.json data.paths 声明的路径内
 *   ctx.dataSchemaVersion()        当前账号数据结构版本（升级迁移由宿主在进入前完成）
 *   ctx.packagePath(rel)           本方案包内文件（只读资源）
 *   ctx.log.info / ctx.log.warn
 * 不要直接 require('electron') 或写任意路径：升级时代码目录会被替换，数据必须经 ctx 存到账号目录。
 */
const NOTES = 'demo-dynamic-workbench/notes.json';
const MAX_NOTES = 200;

let timer = null;

module.exports = {
  hostApi: 1,

  activate(ctx) {
    ctx.handle('info', () => ({
      id: ctx.id,
      version: ctx.version,
      hostApi: ctx.hostApi,
      appVersion: ctx.appVersion,
      dataSchemaVersion: ctx.dataSchemaVersion(),
    }));

    ctx.handle('listNotes', () => ctx.readJson(NOTES, []));

    ctx.handle('addNote', (payload) => {
      const text = String((payload && payload.text) || '').trim().slice(0, 2000);
      if (!text) throw new Error('内容不能为空');
      const notes = ctx.readJson(NOTES, []);
      notes.unshift({ id: `${Date.now()}`, text, at: new Date().toISOString() });
      const next = notes.slice(0, MAX_NOTES);
      ctx.writeJson(NOTES, next);
      ctx.emit('notes-changed', { count: next.length });
      return next;
    });

    ctx.handle('removeNote', (payload) => {
      const id = String((payload && payload.id) || '');
      const next = ctx.readJson(NOTES, []).filter((n) => n.id !== id);
      ctx.writeJson(NOTES, next);
      ctx.emit('notes-changed', { count: next.length });
      return next;
    });

    // 后台任务示例：deactivate 时必须清理，否则热替换后旧版本还在跑
    timer = setInterval(() => ctx.emit('heartbeat', { at: Date.now() }), 60_000);
    if (timer.unref) timer.unref();
    ctx.log.info('activated');
  },

  deactivate() {
    if (timer) clearInterval(timer);
    timer = null;
  },
};
