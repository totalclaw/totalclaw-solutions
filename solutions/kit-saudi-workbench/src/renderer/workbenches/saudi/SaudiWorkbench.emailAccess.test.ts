import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { shallowMount, flushPromises, enableAutoUnmount } from '@vue/test-utils';
import { ref } from 'vue';
const state = vi.hoisted(() => ({ feature: null as any, push: vi.fn() }));
vi.mock('vue-router', () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock('vue-i18n', async importOriginal => ({ ...await importOriginal<typeof import('vue-i18n')>(), useI18n: () => ({ locale: ref('zh-CN') }) }));
vi.mock('../../composables/useEditionFeature', () => ({ useEditionFeature: () => state.feature }));
vi.mock('../../composables/useDialog', () => ({ useDialog: () => ({ confirm: vi.fn() }) }));
import SaudiWorkbench from './SaudiWorkbench.vue';

enableAutoUnmount(afterEach);
let emailGetConfig: ReturnType<typeof vi.fn>;
let emailConfigure: ReturnType<typeof vi.fn>;
beforeEach(() => {
  state.feature = ref(false); state.push.mockClear();
  emailGetConfig = vi.fn(async () => ({ config: { address: 'sender@example.com', passwordSet: true, smtpHost: 'smtp.example.com' } }));
  emailConfigure = vi.fn(async () => ({ ok: true }));
  (window as any).electronAPI = { qiyeApi: { emailGetConfig, emailConfigure } };
});
afterEach(() => { delete (window as any).electronAPI; });

it('工作台个人版入口指向锁定设置，不加载或保存邮件；企业权限恢复后可以打开', async () => {
  const w = shallowMount(SaudiWorkbench, { props: { moduleId: 'rfq-quote' }, global: { mocks: { $t: (s: string) => s } } });
  await flushPromises();
  const setup = (w.vm as any).$?.setupState;
  const emailModal = () => w.findAllComponents({ name: 'TModal' }).find(m => m.props('title') === '邮箱收件配置');
  expect(emailModal()).toBeUndefined();
  await setup.openEmailConfig();
  await setup.saveEmailConfig();
  await setup.refreshSmtpState();
  expect(state.push).toHaveBeenCalledWith('/settings?section=notify');
  expect(emailGetConfig).not.toHaveBeenCalled();
  expect(emailConfigure).not.toHaveBeenCalled();
  state.feature.value = true;
  await setup.openEmailConfig();
  await flushPromises();
  expect(emailModal()?.props('open')).toBe(true);
  expect(emailGetConfig).toHaveBeenCalledOnce();
  state.feature.value = false;
  await flushPromises();
  expect(emailModal()).toBeUndefined();
});
