/**
 * 领域助手：按关键词把问题分到招生、教务、资助、就业、后勤、心理、信息化、图书馆、财务、科研之一。
 * 只用于展示「由哪个助手作答」、统计诉求分布，以及没有依据时转给哪个部门；不影响检索与作答的依据。
 * 关键词在 domains.json（数据，按原文匹配，不进词典）；助手名与部门名走 i18nT。
 */
import type { CaDomain } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import CFG from './domains.json';

export const FALLBACK_DOMAIN = CFG.fallback.id;

function names(): Record<string, { name: string; dept: string }> {
  return {
    admission: { name: i18nT('招生迎新助手'), dept: i18nT('招生办') },
    academic: { name: i18nT('教务学业助手'), dept: i18nT('教务处') },
    aid: { name: i18nT('奖助资助助手'), dept: i18nT('学工处') },
    career: { name: i18nT('就业创业助手'), dept: i18nT('就业指导中心') },
    life: { name: i18nT('后勤生活助手'), dept: i18nT('后勤处') },
    wellbeing: { name: i18nT('心理关怀助手'), dept: i18nT('学工处') },
    it: { name: i18nT('信息化服务助手'), dept: i18nT('信息中心') },
    library: { name: i18nT('图书馆助手'), dept: i18nT('图书馆') },
    finance: { name: i18nT('财务缴费助手'), dept: i18nT('财务处') },
    research: { name: i18nT('科研服务助手'), dept: i18nT('科研处') },
    [FALLBACK_DOMAIN]: { name: i18nT('校园综合助手'), dept: i18nT('待分派') },
  };
}

export function listDomains(): CaDomain[] {
  const n = names();
  return [...CFG.domains.map((d) => d.id), FALLBACK_DOMAIN].map((id) => ({ id, name: n[id]?.name || id, dept: n[id]?.dept || '' }));
}

export function domainOf(id: string | undefined): CaDomain {
  const n = names();
  const key = id && n[id] ? id : FALLBACK_DOMAIN;
  return { id: key, name: n[key].name, dept: n[key].dept };
}

/** 命中关键词最多（并列时取最长关键词）的领域；一个都没命中归综合助手 */
export function classifyDomain(question: string): string {
  const q = String(question || '').toLowerCase();
  let best = { id: FALLBACK_DOMAIN, hits: 0, len: 0 };
  for (const d of CFG.domains) {
    let hits = 0;
    let len = 0;
    for (const k of d.keywords) {
      if (q.includes(k.toLowerCase())) { hits++; len = Math.max(len, k.length); }
    }
    if (hits > best.hits || (hits === best.hits && hits > 0 && len > best.len)) best = { id: d.id, hits, len };
  }
  return best.id;
}
