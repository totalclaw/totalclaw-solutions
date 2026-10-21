const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const _ = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/saudi/SaudiWorkbench.vue"];
if (!_) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/saudi/SaudiWorkbench.vue");
const o = _.default, l = /* @__PURE__ */ e.defineComponent({
  __name: "BidDecisionWorkbenchView",
  setup(s) {
    return (r, n) => (e.openBlock(), e.createBlock(o, { "module-id": "bid-decision" }));
  }
});
export {
  l as default
};
