/**
 * 服装实体店智能体 · 业务服务（电脑端 IPC 与手机端局域网服务共用一份）。
 *
 *   - 商品库：导入图片、AI 打标签（看图理解）、手改；
 *   - 顾客：先授权后传照片；传照片后自动质检（多人 / 半身 / 过暗）；可选形象分析给 3 组推荐；
 *   - 试穿：排队、同时最多 2 张（fal 多图参考改图），单张失败不影响其它，可重试；
 *   - 到店：想试实物 → 试穿码 + 尺码助手；店员凭码登记备货 / 试穿 / 成交；
 *   - 隐私：到期或顾客要求时真删照片、试穿图、分析结果，只留匿名计数。
 *
 * 图像服务一律带 solutionId，走管理员按方案下发的密钥或用户自己在「设置 → 媒体模型」填的。
 */
import { copyFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type {
  ApCustomer, ApGarment, ApGarmentInput, ApPhotoCheck, ApStyleChoice, ApTryon, ApVisitStatus,
} from '@totalclaw/ipc-contracts';
import type { IpcDeps } from '../../ipc/shared';
import { falKeysReady, runFalJob } from '../../ipc/mediaFal.ipc';
import { parseJsonLoose } from '../bidWriter/llmReply';
import { userFacingError } from '../../utils/userFacingError';
import { ApparelStore, newId, normalizeGarment, type StoredCustomer } from './store';
import { allStyleOptions, type StyleOptionDef } from './styleOptions';
import * as P from './prompts';
import {
  buildTryonPrompt, codeMatches, computeStats, expiredCustomers, newTryonCode, normalizeAudience, normalizeBodyShape,
  normalizeChoice, normalizeFaceMatch, normalizePhotoCheck, recommendSize, sanitizeSuggestions, tryonsToday,
} from './logic';

export const APPAREL_SOLUTION_ID = 'workbench-apparel-store';
const CONCURRENCY = 2;
/** 试穿图最多画几次：第一次脸不像就重画一次 */
const FACE_ATTEMPTS = 2;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|heic|bmp)$/i;

export class ApparelService {
  private running = 0;
  private defsCache: StyleOptionDef[] | null = null;

  constructor(
    private readonly deps: IpcDeps,
    readonly store: ApparelStore,
    private readonly onChange: () => void,
    private readonly progress: (msg: string) => void = () => {},
  ) {}

  defs(): StyleOptionDef[] {
    if (!this.defsCache) this.defsCache = allStyleOptions();
    return this.defsCache;
  }

  imageReady(): boolean {
    return falKeysReady(this.deps, APPAREL_SOLUTION_ID);
  }

  // ── 商品库 ─────────────────────────────────────────

  importGarments(paths: string[]): ApGarment[] {
    const files = (paths || []).filter((p) => IMAGE_EXT_RE.test(p) && existsSync(p));
    if (!files.length) throw new Error(i18nT('请选择 JPG / PNG / WEBP 格式的服装图'));
    const dir = this.store.dir('garments');
    const made: ApGarment[] = [];
    this.store.update((s) => {
      for (const src of files) {
        const g = normalizeGarment({ name: src.split(/[\\/]/).pop()!.replace(/\.[^.]+$/, ''), stock: { S: 0, M: 0, L: 0, XL: 0 } });
        const dest = join(dir, `${g.id}${extname(src).toLowerCase() || '.png'}`);
        copyFileSync(src, dest);
        g.image = dest;
        s.garments.unshift(g);
        made.push(g);
      }
    });
    this.onChange();
    return made;
  }

  saveGarment(input: ApGarmentInput): ApGarment {
    const r = this.store.update((s) => {
      const i = input.id ? s.garments.findIndex((g) => g.id === input.id) : -1;
      const prev = i >= 0 ? s.garments[i] : undefined;
      if (input.id && !prev) throw new Error(i18nT('商品不存在或已删除'));
      const next = normalizeGarment({ ...input, image: prev?.image || input.image || '' }, prev);
      if (input.recommended) next.recommended = normalizeChoice(input.recommended, this.defs());
      if (i >= 0) s.garments[i] = next; else s.garments.unshift(next);
      return next;
    });
    this.onChange();
    return r;
  }

  removeGarment(id: string): void {
    const g = this.store.garment(id);
    this.store.update((s) => { s.garments = s.garments.filter((x) => x.id !== id); });
    this.store.removeOwnFile(g?.image);
    this.onChange();
  }

  /** AI 打标签：看图理解出品类 / 颜色 / 风格 / 面料 / 季节 / 人群 / 卖点，并给一组推荐造型 */
  async tagGarment(id: string): Promise<ApGarment> {
    const g = this.store.garment(id);
    if (!g || !existsSync(g.image)) throw new Error(i18nT('商品图不存在，请重新导入'));
    this.progress(i18nT('正在识别「{p0}」…', { p0: g.name }));
    const json = await this.visionJson([g.image], P.garmentTagPrompt(this.optionCatalog()));
    const r = this.store.update((s) => {
      const cur = s.garments.find((x) => x.id === id);
      if (!cur) throw new Error(i18nT('商品不存在或已删除'));
      const audience = normalizeAudience(json.audience, cur.audience);
      const next = normalizeGarment({
        name: String(json.name || cur.name),
        category: String(json.category || cur.category),
        color: String(json.color || cur.color),
        style: String(json.style || cur.style),
        fabric: String(json.fabric || cur.fabric),
        season: String(json.season || cur.season),
        audience,
        tags: Array.isArray(json.tags) ? json.tags.map(String) : cur.tags,
        sellingPoints: String(json.sellingPoints || cur.sellingPoints || ''),
        taggedBy: 'fal-ai/any-llm/vision',
      }, cur);
      const rec = sanitizeSuggestions([{ ...(json.recommended || {}), reason: '' }], this.defs(), audience)[0];
      if (rec) { const { reason: _r, ...choice } = rec; next.recommended = choice; }
      Object.assign(cur, next);
      return cur;
    });
    this.onChange();
    return r;
  }

  // ── 顾客 ─────────────────────────────────────────

  createCustomer(p: { nickname?: string; heightCm?: number; weightKg?: number; source: 'desk' | 'mobile'; consent: boolean; mobileToken?: string }): StoredCustomer {
    if (!p.consent) throw new Error(i18nT('顾客需要先勾选授权，才能上传照片'));
    const now = new Date().toISOString();
    const c: StoredCustomer = {
      id: newId('apc'),
      nickname: String(p.nickname || '').trim().slice(0, 20) || i18nT('顾客 {p0}', { p0: now.slice(11, 16) }),
      heightCm: validNum(p.heightCm, 50, 230), weightKg: validNum(p.weightKg, 10, 250),
      source: p.source, photo: '', consentAt: now, createdAt: now, lastSeenAt: now,
      ...(p.mobileToken ? { mobileToken: p.mobileToken } : {}),
    };
    this.store.update((s) => { s.customers.unshift(c); });
    this.onChange();
    return c;
  }

  updateCustomer(id: string, patch: { nickname?: string; heightCm?: number | null; weightKg?: number | null }): StoredCustomer {
    const r = this.store.update((s) => {
      const c = this.mustCustomer(s.customers, id);
      if (patch.nickname !== undefined) c.nickname = String(patch.nickname || '').trim().slice(0, 20) || c.nickname;
      if (patch.heightCm !== undefined) c.heightCm = validNum(patch.heightCm, 50, 230);
      if (patch.weightKg !== undefined) c.weightKg = validNum(patch.weightKg, 10, 250);
      // 身高体重变了，没到店的推荐尺码跟着重算
      for (const t of s.tryons) {
        if (t.customerId !== c.id || t.visit) continue;
        const g = s.garments.find((x) => x.id === t.garmentId);
        if (g && t.wantVisit) t.size = recommendSize(g.audience, Object.keys(g.stock), c.heightCm, c.weightKg);
      }
      return c;
    });
    this.onChange();
    return r;
  }

  /** 保存顾客照片或自定义背景（来源：本机文件或手机传来的 base64）。照片会触发一次质检 */
  setImage(customerId: string, kind: 'photo' | 'background', src: { path?: string; dataUrl?: string }): StoredCustomer {
    const dir = this.store.dir(kind === 'photo' ? 'photos' : 'backgrounds');
    let dest = '';
    if (src.dataUrl) {
      const m = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i.exec(src.dataUrl);
      if (!m) throw new Error(i18nT('照片格式不支持，请用 JPG / PNG'));
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length < 2000) throw new Error(i18nT('照片太小，请换一张清晰的全身照'));
      dest = join(dir, `${customerId}-${Date.now()}.${m[1].toLowerCase() === 'png' ? 'png' : 'jpg'}`);
      writeFileSync(dest, buf);
    } else if (src.path && IMAGE_EXT_RE.test(src.path) && existsSync(src.path)) {
      dest = join(dir, `${customerId}-${Date.now()}${extname(src.path).toLowerCase()}`);
      copyFileSync(src.path, dest);
    } else {
      throw new Error(i18nT('请选择 JPG / PNG 照片'));
    }
    let old = '';
    const r = this.store.update((s) => {
      const c = this.mustCustomer(s.customers, customerId);
      if (!c.consentAt) throw new Error(i18nT('顾客需要先勾选授权，才能上传照片'));
      if (kind === 'photo') { old = c.photo; c.photo = dest; c.photoCheck = undefined; c.profile = undefined; c.purgedAt = undefined; }
      else { old = c.background || ''; c.background = dest; }
      return c;
    });
    this.store.removeOwnFile(old);
    this.onChange();
    if (kind === 'photo') void this.checkPhoto(customerId).catch(() => { /* 质检失败不挡流程 */ });
    return r;
  }

  customerBackground(c: StoredCustomer): string { return c.background || ''; }

  /** 照片质检：不合格只提示，不强拦（顾客坚持也能生成） */
  async checkPhoto(customerId: string): Promise<void> {
    const c = this.store.read().customers.find((x) => x.id === customerId);
    if (!c?.photo || !existsSync(c.photo)) return;
    if (!this.imageReady()) {
      this.store.update((s) => { const x = s.customers.find((y) => y.id === customerId); if (x && x.photo === c.photo) x.photoCheck = { ok: true, issues: [] }; });
      this.onChange();
      return;
    }
    // 检查失败不能当合格放行：曾因网络抖一下就把一张衣架上的衣服图当顾客照放过去，后面每张试穿图都白花钱
    let check: ApPhotoCheck | undefined;
    for (let attempt = 0; attempt < 2 && !check; attempt++) {
      try {
        check = normalizePhotoCheck(await this.visionJson([c.photo], P.photoCheckPrompt()));
      } catch (e) {
        this.deps.logger?.warn?.('apparel-store', 'photo check failed', { attempt, error: (e as Error)?.message });
      }
    }
    if (!check) check = { ok: false, issues: [i18nT('照片检查没完成（网络不稳定），重新上传这张照片即可')] };
    this.store.update((s) => { const x = s.customers.find((y) => y.id === customerId); if (x && x.photo === c.photo) x.photoCheck = check; });
    this.onChange();
  }

  /** AI 形象分析：体型 / 肤色 / 脸型 + 3 组推荐造型（只收选项库里有的） */
  async analyze(customerId: string, audienceHint?: string): Promise<ApCustomer> {
    const c = this.store.read().customers.find((x) => x.id === customerId);
    if (!c?.photo || !existsSync(c.photo)) throw new Error(i18nT('还没有顾客照片'));
    this.progress(i18nT('正在分析顾客形象…'));
    const audience = normalizeAudience(audienceHint, 'women');
    const json = await this.visionJson([c.photo], P.analyzePrompt(this.optionCatalog(audience)));
    const r = this.store.update((s) => {
      const x = this.mustCustomer(s.customers, customerId);
      x.profile = {
        bodyShape: normalizeBodyShape(json.bodyShape),
        skinTone: String(json.skinTone || '').slice(0, 20),
        faceShape: String(json.faceShape || '').slice(0, 20),
        notes: String(json.notes || '').slice(0, 80),
        suggestions: sanitizeSuggestions(json.suggestions, this.defs(), audience),
        model: 'fal-ai/any-llm/vision',
        at: new Date().toISOString(),
      };
      return x;
    });
    this.onChange();
    return r;
  }

  // ── 造型示意图 ─────────────────────────────────────

  /** 已有示意图：选项 id → 本机路径 */
  thumbs(): Record<string, string> {
    const dir = this.store.dir('thumbs');
    const out: Record<string, string> = {};
    for (const d of this.defs()) {
      const f = join(dir, `${d.id}.jpg`);
      if (existsSync(f)) out[d.id] = f;
    }
    return out;
  }

  /** 为缺示意图的选项逐张生成（文生图），已有的跳过；返回生成数与失败原因 */
  async generateThumbs(ids?: string[]): Promise<{ made: number; errors: string[] }> {
    if (!this.imageReady()) throw new Error(i18nT('还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发'));
    const have = this.thumbs();
    const todo = this.defs().filter((d) => !d.needsUpload && d.prompt !== 'KEEP_ORIGINAL' && !have[d.id] && (!ids?.length || ids.includes(d.id)));
    const dir = this.store.dir('thumbs');
    const errors: string[] = [];
    let made = 0;
    for (const [i, d] of todo.entries()) {
      this.progress(i18nT('正在生成造型示意图 {a}/{b}：{p0}', { a: i + 1, b: todo.length, p0: d.label }));
      try {
        const r = await runFalJob(this.deps, { capability: 't2i', prompt: P.thumbPrompt(d.kind, d.prompt), width: 512, height: 640, num: 1, outDir: dir, solutionId: APPAREL_SOLUTION_ID, maxWaitMs: 120_000 });
        const f = r.files.find(Boolean);
        if (!f) throw new Error(i18nT('图像服务没有返回图片'));
        copyFileSync(f, join(dir, `${d.id}.jpg`));
        if (f !== join(dir, `${d.id}.jpg`)) this.store.removeOwnFile(f);
        made++;
        this.onChange();
      } catch (e) {
        errors.push(`${d.label}：${userFacingError(e)}`);
        if (errors.length >= 3 && !made) break; // 连续失败多半是密钥 / 额度问题，别空烧
      }
    }
    return { made, errors };
  }

  // ── 试穿 ─────────────────────────────────────────

  /** 衣服 × 造型逐一排队；手机端受每日上限约束 */
  enqueue(customerId: string, garmentIds: string[], choices: Array<Partial<ApStyleChoice>>, source: 'desk' | 'mobile'): ApTryon[] {
    const s0 = this.store.read();
    const c = this.mustCustomer(s0.customers, customerId);
    if (!c.photo || !existsSync(c.photo)) throw new Error(i18nT('还没有顾客照片'));
    // 质量兜底：质检不合格在这一步就拦下，不浪费生成费用（2.0 需求「不合格即时提示重拍」）
    if (c.photoCheck && !c.photoCheck.ok) {
      throw Object.assign(new Error(i18nT('照片不适合试穿：{p0}。请重拍一张单人、全身正面、光线充足的照片', { p0: c.photoCheck.issues.join('；') || i18nT('不符合要求') })), { code: 'PHOTO_BAD' });
    }
    if (!c.photoCheck && this.imageReady()) throw Object.assign(new Error(i18nT('照片还在检查中，请稍候几秒再生成')), { code: 'PHOTO_CHECKING' });
    const gids = [...new Set(garmentIds || [])].filter((id) => s0.garments.some((g) => g.id === id)).slice(0, 4);
    if (!gids.length) throw new Error(i18nT('请先选择要试穿的衣服'));
    const bg = this.customerBackground(c);
    const norm = (choices?.length ? choices : [{}]).slice(0, 4).map((ch) => normalizeChoice({ ...ch, customBackground: ch.customBackground ? bg : undefined }, this.defs()));
    for (const ch of norm) {
      if (this.defs().find((d) => d.id === ch.backgroundId)?.needsUpload && !ch.customBackground) throw new Error(i18nT('选了「自定义上传」背景，请先上传一张背景照片'));
    }
    const total = gids.length * norm.length;
    if (source === 'mobile') {
      const used = tryonsToday(s0.tryons, customerId);
      if (used + total > s0.settings.mobileDailyLimit) throw Object.assign(new Error('LIMIT'), { code: 'LIMIT' });
    }
    const made = this.store.update((s) => {
      const taken = new Set(s.tryons.map((t) => t.code));
      const out: ApTryon[] = [];
      for (const gid of gids) {
        for (const choice of norm) {
          const code = newTryonCode(taken);
          taken.add(code);
          out.push({ id: newId('apt'), customerId, garmentId: gid, choice, status: 'queued', source, code, createdAt: new Date().toISOString() });
        }
      }
      s.tryons.unshift(...out);
      return out;
    });
    this.onChange();
    this.pump();
    return made;
  }

  retry(tryonId: string): void {
    this.store.update((s) => {
      const t = s.tryons.find((x) => x.id === tryonId);
      if (!t) throw new Error(i18nT('试穿记录不存在'));
      if (t.status !== 'failed') return;
      t.status = 'queued'; t.error = undefined; t.startedAt = undefined; t.finishedAt = undefined;
    });
    this.onChange();
    this.pump();
  }

  /** 启动时：上次没跑完的重新排队 */
  resumeQueue(): void {
    let n = 0;
    this.store.update((s) => { for (const t of s.tryons) if (t.status === 'running') { t.status = 'queued'; n++; } });
    if (n) this.onChange();
    this.pump();
  }

  private pump(): void {
    while (this.running < CONCURRENCY) {
      const next = this.store.read().tryons.filter((t) => t.status === 'queued').pop(); // 最早排队的先做
      if (!next) return;
      this.store.update((s) => { const t = s.tryons.find((x) => x.id === next.id); if (t) { t.status = 'running'; t.startedAt = new Date().toISOString(); } });
      this.running++;
      this.onChange();
      void this.generate(next.id).finally(() => { this.running--; this.pump(); });
    }
  }

  private async generate(tryonId: string): Promise<void> {
    const s = this.store.read();
    const t = s.tryons.find((x) => x.id === tryonId);
    const c = t && s.customers.find((x) => x.id === t.customerId);
    const g = t && s.garments.find((x) => x.id === t.garmentId);
    const fail = (msg: string) => {
      this.store.update((st) => { const x = st.tryons.find((y) => y.id === tryonId); if (x) { x.status = 'failed'; x.error = msg; x.finishedAt = new Date().toISOString(); } });
      this.onChange();
    };
    if (!t || !c || !g) { fail(i18nT('顾客或商品已被删除')); return; }
    if (!c.photo || !existsSync(c.photo)) { fail(i18nT('顾客照片已删除')); return; }
    if (!existsSync(g.image)) { fail(i18nT('商品图不存在，请重新导入')); return; }
    if (!this.imageReady()) { fail(i18nT('还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发')); return; }
    try {
      const imageUrls = [c.photo, g.image];
      if (t.choice.customBackground && existsSync(t.choice.customBackground)) imageUrls.push(t.choice.customBackground);
      const runEdit = () => runFalJob(this.deps, {
        capability: 'edit',
        model: s.settings.editModel,
        prompt: buildTryonPrompt(g, t.choice, this.defs()),
        imageUrls,
        // 顾客照常是横拍的，不指定画幅出图就跟着变横图；试穿图统一竖版 3:4（提示词里也写了）
        aspect: '3:4',
        num: 1,
        outDir: this.store.dir('results'),
        solutionId: APPAREL_SOLUTION_ID,
        maxWaitMs: 180_000,
      });
      // 换装禁止改脸：出图后让看图模型对比顾客原照，换了脸就丢掉重画一次，两次都不像就判失败（不把别人的脸交给顾客）
      let r!: Awaited<ReturnType<typeof runEdit>>;
      let file: string | undefined;
      let faceReason = '';
      for (let attempt = 0; attempt < FACE_ATTEMPTS; attempt++) {
        r = await runEdit();
        file = r.files.find(Boolean);
        if (!file) throw new Error(i18nT('图像服务没有返回图片'));
        const face = await this.checkFace(c.photo, file);
        if (face.same) break;
        faceReason = face.reason;
        this.deps.logger?.warn?.('apparel-store', 'tryon face mismatch', { tryonId, attempt, reason: face.reason });
        try { rmSync(file, { force: true }); } catch { /* 删不掉不影响重画 */ }
        file = undefined;
      }
      if (!file) throw new Error(i18nT('生成的试穿图人脸和顾客照片不一致（{p0}），已自动重画仍不符，未采用。可点重试，或换一张正脸清晰的照片', { p0: faceReason || i18nT('不像同一个人') }));
      const doneFile = file;
      this.store.update((st) => {
        const x = st.tryons.find((y) => y.id === tryonId);
        if (!x) return;
        x.status = 'done'; x.image = doneFile; x.model = r.model; x.finishedAt = new Date().toISOString(); x.error = undefined;
      });
      this.onChange();
    } catch (e) {
      fail(userFacingError(e));
    }
  }

  /** 顾客点「想试实物」：给试穿码 + 推荐尺码 */
  want(tryonId: string, customerId?: string): ApTryon {
    const r = this.store.update((s) => {
      const t = s.tryons.find((x) => x.id === tryonId && (!customerId || x.customerId === customerId));
      if (!t || t.status !== 'done') throw new Error(i18nT('试穿记录不存在'));
      const c = s.customers.find((x) => x.id === t.customerId);
      const g = s.garments.find((x) => x.id === t.garmentId);
      t.wantVisit = true;
      t.wantAt = t.wantAt || new Date().toISOString();
      if (g) t.size = recommendSize(g.audience, Object.keys(g.stock), c?.heightCm, c?.weightKg);
      return t;
    });
    this.onChange();
    return r;
  }

  findByCode(code: string): ApTryon | undefined {
    const s = this.store.read();
    const t = s.tryons.find((x) => codeMatches(x.code, code));
    // 推荐尺码只在顾客点「想到店试实物」时写入；店员凭码直接查的记录也要给出推荐，否则核销页误报「未填身高」
    if (!t || t.size || t.visit) return t;
    const g = s.garments.find((x) => x.id === t.garmentId);
    const c = s.customers.find((x) => x.id === t.customerId);
    return g ? { ...t, size: recommendSize(g.audience, Object.keys(g.stock), c?.heightCm, c?.weightKg) } : t;
  }

  /** 店员登记：备货 / 已试穿 / 成交 / 未成交。成交时扣该尺码库存 */
  visit(tryonId: string, status: ApVisitStatus, size?: string, note?: string): ApTryon {
    const r = this.store.update((s) => {
      const t = s.tryons.find((x) => x.id === tryonId);
      if (!t) throw new Error(i18nT('试穿记录不存在'));
      const g = s.garments.find((x) => x.id === t.garmentId);
      const sz = String(size || t.visit?.size || t.size || '').trim().toUpperCase();
      if (status === 'purchased' && t.visit?.status !== 'purchased' && g && sz && g.stock[sz] > 0) g.stock[sz] -= 1;
      t.wantVisit = true;
      t.visit = { status, size: sz || undefined, note: String(note || '').slice(0, 200) || undefined, at: new Date().toISOString() };
      return t;
    });
    this.onChange();
    return r;
  }

  // ── 隐私 ─────────────────────────────────────────

  /** 真删照片、背景、试穿图、分析结果；试穿记录只留匿名计数所需字段 */
  purgeCustomer(customerId: string): void {
    const files: string[] = [];
    this.store.update((s) => {
      const c = s.customers.find((x) => x.id === customerId);
      if (!c) return;
      files.push(c.photo, this.customerBackground(c));
      c.photo = ''; c.background = ''; c.profile = undefined; c.photoCheck = undefined;
      c.nickname = i18nT('已清除'); c.heightCm = undefined; c.weightKg = undefined; c.mobileToken = undefined;
      c.purgedAt = new Date().toISOString();
      for (const t of s.tryons) {
        if (t.customerId !== customerId) continue;
        files.push(t.image || '');
        t.image = undefined;
        if (t.choice.customBackground) t.choice = { ...t.choice, customBackground: undefined };
        if (t.status === 'queued' || t.status === 'running') { t.status = 'failed'; t.error = i18nT('顾客已删除照片'); }
      }
    });
    for (const f of files) this.store.removeOwnFile(f);
    this.onChange();
  }

  purgeExpired(): number {
    const list = expiredCustomers(this.store.read().customers, this.store.read().settings.retentionDays);
    for (const c of list) this.purgeCustomer(c.id);
    return list.length;
  }

  purgeAll(): number {
    const ids = this.store.read().customers.filter((c) => !c.purgedAt).map((c) => c.id);
    for (const id of ids) this.purgeCustomer(id);
    return ids.length;
  }

  stats() {
    const s = this.store.read();
    return computeStats(s.garments, s.customers, s.tryons);
  }

  // ── 内部 ─────────────────────────────────────────

  private mustCustomer(list: StoredCustomer[], id: string): StoredCustomer {
    const c = list.find((x) => x.id === id);
    if (!c) throw new Error(i18nT('顾客不存在或已删除'));
    return c;
  }

  /** 给模型看的选项清单：id + 名称（按人群过滤、去掉要上传的自定义背景） */
  private optionCatalog(audience?: string): string {
    const aud = audience ? normalizeAudience(audience) : null;
    const pick = (kind: string) => this.defs().filter((d) => d.kind === kind && !d.needsUpload && (!aud || d.audience.includes(aud))).map((d) => `${d.id}=${d.label}`).join(', ');
    return `backgrounds: ${pick('background')}\nposes: ${pick('pose')}\nhairs: ${pick('hair')}`;
  }

  /** 保脸核对：网络 / 解析失败不拦（已出的图照常给），只有模型明说不是同一个人才算 */
  private async checkFace(customerPhoto: string, result: string): Promise<{ same: boolean; reason: string }> {
    try {
      return normalizeFaceMatch(await this.visionJson([customerPhoto, result], P.faceMatchPrompt()));
    } catch (e) {
      this.deps.logger?.warn?.('apparel-store', 'face check failed', { error: (e as Error)?.message });
      return { same: true, reason: '' };
    }
  }

  private async visionJson(images: string[], prompt: string): Promise<any> {
    if (!this.imageReady()) throw new Error(i18nT('还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发'));
    const r = await runFalJob(this.deps, { capability: 'vision', prompt, imageUrls: images, maxTokens: 1200, solutionId: APPAREL_SOLUTION_ID, maxWaitMs: 120_000 });
    try {
      return parseJsonLoose(String(r.text || ''));
    } catch {
      throw new Error(i18nT('看图服务没有按要求返回结构化结果，请重试'));
    }
  }
}

function validNum(v: unknown, min: number, max: number): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : undefined;
}
