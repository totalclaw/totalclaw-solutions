/**
 * O9 例行事务库（OPC 日历）：公司在老板不说话时也在运转。
 * 到点生成一件事（来源 = 定时例行），走和老板下令同一个入口。
 *
 * 排期：daily 每天 HH:MM / weekly 每周 N（1=周一…7=周日）HH:MM / monthly 每月 N 号或最后一天 HH:MM。
 * 每条例行记录上次触发的日期，同一周期只触发一次；App 没开着错过的不补跑（第二天照常）。
 */

const LIBRARY = [
  { id: 'daily-report', name: '每日经营日报', text: '生成昨日经营日报：收支与利润、渠道与流量、订单与回款，列出异常和今天要关注的事。', schedule: { kind: 'daily', time: '08:30' }, legions: ['legion-finance', 'legion-ops', 'legion-sales'] },
  { id: 'daily-cs', name: '每日客服汇总', text: '汇总昨天的客户咨询与投诉：数量、主要问题、未结工单与超时情况，给出改进建议。', schedule: { kind: 'daily', time: '18:00' }, legions: ['legion-cs'] },
  { id: 'weekly-sales', name: '每周销售周报', text: '出本周销售周报：新增商机、报价与成交、回款进度、下周重点客户。', schedule: { kind: 'weekly', weekday: 5, time: '17:00' }, legions: ['legion-sales'] },
  { id: 'month-close', name: '月底结账', text: '月底结账：凭证核对、往来对账、费用计提，出月度经营简报。', schedule: { kind: 'monthly', day: 'last', time: '16:00' }, legions: ['legion-finance'] },
  { id: 'payroll', name: '月度工资表', text: '月底结账与工资表：按考勤汇总编制本月工资表，付款需老板确认。', schedule: { kind: 'monthly', day: 'last', time: '10:00' }, legions: ['legion-hr', 'legion-finance'] },
  { id: 'quarter-review', name: '季度经营复盘', text: '季度经营复盘：收入利润、各渠道表现、客户与回款、下季度目标与资源建议。', schedule: { kind: 'monthly', day: 'last', time: '15:00', months: [3, 6, 9, 12] }, legions: ['legion-finance', 'legion-ops', 'legion-sales'] },
  { id: 'contract-expiry', name: '合同到期提醒', text: '梳理 30 天内到期的合同，逐份给出续签、重谈或终止建议。', schedule: { kind: 'weekly', weekday: 1, time: '09:00' }, legions: ['legion-legal'] },
  { id: 'ar-overdue', name: '应收逾期提醒', text: '列出逾期未回款的应收款：客户、金额、逾期天数，给出催收话术与优先级。', schedule: { kind: 'weekly', weekday: 1, time: '09:30' }, legions: ['legion-finance', 'legion-sales'] },
  { id: 'invoice-pending', name: '发票待开提醒', text: '列出已回款或已发货但还没开票的订单，准备开票清单，开票需老板确认。', schedule: { kind: 'weekly', weekday: 3, time: '10:00' }, legions: ['legion-finance'] },
];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function lastDayOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** 这条排期在本地时间 d 所在的这一分钟是否该触发；返回周期 key（防重复）或 null */
function dueKey(schedule, d) {
  const m = TIME_RE.exec(schedule?.time || '');
  if (!m) return null;
  if (d.getHours() !== Number(m[1]) || d.getMinutes() !== Number(m[2])) return null;
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (schedule.kind === 'daily') return date;
  if (schedule.kind === 'weekly') {
    const wd = d.getDay() === 0 ? 7 : d.getDay();
    return wd === Number(schedule.weekday) ? date : null;
  }
  if (schedule.kind === 'monthly') {
    if (Array.isArray(schedule.months) && !schedule.months.includes(d.getMonth() + 1)) return null;
    const day = schedule.day === 'last' ? lastDayOfMonth(d) : Number(schedule.day);
    return d.getDate() === day ? date : null;
  }
  return null;
}

function describe(schedule) {
  const wd = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  if (schedule.kind === 'daily') return `每天 ${schedule.time}`;
  if (schedule.kind === 'weekly') return `每${wd[schedule.weekday] || ''} ${schedule.time}`;
  if (schedule.kind === 'monthly') {
    const months = Array.isArray(schedule.months) ? `${schedule.months.join('、')} 月` : '每月';
    return `${months}${schedule.day === 'last' ? '最后一天' : `${schedule.day} 号`} ${schedule.time}`;
  }
  return '';
}

class RoutineScheduler {
  /**
   * @param {object} o
   * @param {() => {enabled: Record<string, boolean>, lastRun: Record<string, string>, custom?: object[]}} o.read
   * @param {(s:object) => void} o.write
   * @param {(r:object) => void} o.fire     到点：交给 runner.submit
   */
  constructor({ read, write, fire, now = () => new Date(), log }) {
    Object.assign(this, { read, write, fire, now, log });
    this.timer = null;
  }

  state() {
    const s = this.read() || {};
    return { enabled: s.enabled || {}, lastRun: s.lastRun || {} };
  }

  list() {
    const s = this.state();
    return LIBRARY.map((r) => ({ ...r, when: describe(r.schedule), enabled: !!s.enabled[r.id], lastRun: s.lastRun[r.id] || null }));
  }

  setEnabled(id, on) {
    if (!LIBRARY.some((r) => r.id === id)) throw new Error('没有这条例行事务');
    const s = this.state();
    s.enabled[id] = !!on;
    this.write(s);
    return this.list();
  }

  /** 检查一次；返回本次触发的例行 id */
  tick() {
    const d = this.now();
    const s = this.state();
    const fired = [];
    for (const r of LIBRARY) {
      if (!s.enabled[r.id]) continue;
      const key = dueKey(r.schedule, d);
      if (!key || s.lastRun[r.id] === key) continue;
      s.lastRun[r.id] = key;
      fired.push(r.id);
      try {
        this.fire(r);
      } catch (e) {
        this.log?.warn(`例行事务「${r.name}」触发失败：${e.message}`);
      }
    }
    if (fired.length) this.write(s);
    return fired;
  }

  /** 立即跑一次（控制台「现在试一次」） */
  runNow(id) {
    const r = LIBRARY.find((x) => x.id === id);
    if (!r) throw new Error('没有这条例行事务');
    return this.fire(r);
  }

  start() {
    this.stop();
    this.timer = setInterval(() => this.tick(), 20_000);
    if (this.timer.unref) this.timer.unref();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

module.exports = { RoutineScheduler, LIBRARY, dueKey, describe };
