/**
 * 三条收件通道的**真实**状态。
 *
 * 状态由主进程统一给（INTAKE_CHANNEL_STATUS），三条通道各自的真实来源：
 *   邮件      MailIntakeProc     —— IMAP 轮询的最近一次结果（含认证失败原因）
 *   WhatsApp  gateway 绑定态     —— 个人号扫码 creds.json + WHATSAPP_ENABLED
 *   网页表单  TicketIntakeProc   —— 工单库数据源 + 上次拉取游标
 *
 * 取不到就如实报 not_configured / error，并带「下一步去哪配」，绝不显示假的"已连接"。
 */
import { ref } from 'vue';
import { humanizeErrorMessage } from '../../utils/humanize';
import { t as i18nT, i18nKey } from '../../i18n';
import type { ChannelStatus, IntakeChannel } from './types';

function api(): any {
  return (window as any).electronAPI?.intake;
}

// detail / nextStep 一律存 i18n key，模板里才 $t() —— 这些值会一直挂在 ref 上，
// 提前翻译的话用户切语言后不会跟着变（英文界面上冒中文的老毛病）。
const PLACEHOLDER: ChannelStatus[] = [
  { channel: 'email', state: 'not_configured', detail: i18nKey('正在检测…') },
  { channel: 'whatsapp', state: 'not_configured', detail: i18nKey('正在检测…') },
  { channel: 'webform', state: 'not_configured', detail: i18nKey('正在检测…') },
  { channel: 'upload', state: 'ready', detail: i18nKey('随时可用') },
];

export function useIntakeChannels() {
  const channels = ref<ChannelStatus[]>(PLACEHOLDER.map((c) => ({ ...c })));
  const loading = ref(false);
  const lastError = ref('');

  async function refresh(): Promise<void> {
    loading.value = true;
    lastError.value = '';
    try {
      const res = await api()?.channelStatus?.();
      if (res?.ok && Array.isArray(res.channels)) {
        channels.value = res.channels as ChannelStatus[];
      } else {
        channels.value = PLACEHOLDER.map((c) => ({
          ...c,
          state: 'error' as const,
          detail: i18nKey('收件服务未就绪'),
          nextStep: i18nKey('重启应用；若持续如此，检查打包是否裁剪了收件模块'),
        }));
      }
    } catch (error) {
      lastError.value = humanizeErrorMessage(error, i18nT('通道状态读取失败'));
      channels.value = PLACEHOLDER.map((c) => ({ ...c, state: 'error' as const, detail: lastError.value }));
    } finally {
      loading.value = false;
    }
  }

  /** 立即收取：邮件走 IMAP 拉一轮，网页表单走工单库增量查，WhatsApp 重扫 ingress 目录。 */
  async function pollNow(channel: IntakeChannel): Promise<{ fetched: number; message: string }> {
    try {
      const res = await api()?.pollNow?.(channel);
      await refresh();
      return { fetched: res?.fetched ?? 0, message: res?.message || '' };
    } catch (error) {
      return { fetched: 0, message: humanizeErrorMessage(error, i18nT('收取失败')) };
    }
  }

  return { channels, loading, lastError, refresh, pollNow };
}
