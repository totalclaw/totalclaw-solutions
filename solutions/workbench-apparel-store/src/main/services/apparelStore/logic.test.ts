import { describe, expect, it } from 'vitest';
import type { ApCustomer, ApGarment, ApTryon } from '@totalclaw/ipc-contracts';
import {
  buildTryonPrompt, codeMatches, garmentCoverage, codeValidToday, computeStats, expiredCustomers, newTryonCode, normalizeChoice, normalizeFaceMatch, normalizePhotoCheck,
  parseSizes, recommendSize, sanitizeSuggestions, tryonsToday,
} from './logic';
import { allStyleOptions, backgroundOptions, hairOptions, poseOptions, publicStyleOptions } from './styleOptions';

const defs = allStyleOptions();

function garment(id: string, name = id): ApGarment {
  return { id, name, sku: '', price: 199, category: '连衣裙', color: '白色', style: '通勤', fabric: '棉', season: '夏', audience: 'women', stock: { M: 2 }, image: '/x.png', tags: [], sellingPoints: '', onShelf: true, createdAt: '2026-09-01T00:00:00Z' };
}

function tryon(p: Partial<ApTryon>): ApTryon {
  return { id: Math.random().toString(36), customerId: 'c1', garmentId: 'g1', choice: { backgroundId: 'B01', poseId: 'P01', hairId: 'H00' }, status: 'done', source: 'desk', code: 'ABCDEF', createdAt: new Date().toISOString(), ...p };
}

describe('选项库', () => {
  it('条目数与方案文档一致：背景 30、姿势 20、发型 25', () => {
    expect(backgroundOptions()).toHaveLength(30);
    expect(poseOptions()).toHaveLength(20);
    expect(hairOptions()).toHaveLength(25);
  });
  it('id 全局唯一，细分场景 id 带父项前缀', () => {
    const ids = defs.flatMap((d) => [d.id, ...d.variants.map((v) => v.id)]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const d of defs) for (const v of d.variants) expect(v.id.startsWith(`${d.id}-`)).toBe(true);
  });
  it('公开版不带英文画面描述', () => {
    const pub = publicStyleOptions();
    expect(JSON.stringify(pub)).not.toContain('cozy artisan coffee shop');
  });
});

describe('试穿码', () => {
  it('6 位、不含易混字符、不重复', () => {
    const taken = new Set<string>();
    for (let i = 0; i < 200; i++) { const c = newTryonCode(taken); expect(c).toMatch(/^[A-HJKMNP-Z2-9]{6}$/); taken.add(c); }
    expect(taken.size).toBe(200);
  });
  it('当天有效：以点「想试实物」的日期为准', () => {
    const now = new Date('2026-09-30T20:00:00');
    expect(codeValidToday({ createdAt: '2026-09-29T10:00:00', wantAt: '2026-09-30T09:00:00' }, now)).toBe(true);
    expect(codeValidToday({ createdAt: '2026-09-29T10:00:00' }, now)).toBe(false);
  });
  it('读混 0/O、1/I/L 与小写也能对上', () => {
    expect(codeMatches('AB0C1D', 'abocid')).toBe(true);
    expect(codeMatches('ABCDEF', 'ABCDE')).toBe(false);
  });
});

describe('尺码助手', () => {
  it('没填身高不推荐', () => { expect(recommendSize('women', ['S', 'M', 'L'])).toBeUndefined(); });
  it('女装按身高与体重取较大一档', () => {
    expect(recommendSize('women', ['S', 'M', 'L', 'XL'], 160, 50)).toBe('M');
    expect(recommendSize('women', ['S', 'M', 'L', 'XL'], 158, 60)).toBe('L');
  });
  it('推荐档不在售时偏大一档', () => { expect(recommendSize('men', ['M', 'XL'], 176, 70)).toBe('XL'); });
  it('童装数字码按身高取不小于身高的最小一档', () => {
    expect(recommendSize('kids', ['110', '120', '130'], 115)).toBe('120');
    expect(recommendSize('kids', ['110', '120'], 140)).toBe('120');
  });
  it('解析尺码并排序', () => { expect(parseSizes('xl, s，M/L')).toEqual(['S', 'M', 'L', 'XL']); });
});

describe('造型与提示词', () => {
  it('库外 id 回落默认，细分不属于该项就去掉', () => {
    const c = normalizeChoice({ backgroundId: 'B99', poseId: 'P02', poseVariant: 'P01-1', hairId: 'H02', hairVariant: 'H02-2' }, defs);
    expect(c).toEqual({ backgroundId: 'B29', poseId: 'P02', hairId: 'H02', hairVariant: 'H02-2' });
  });
  it('提示词：保脸约束 + 选项描述；保持本人发型', () => {
    const p = buildTryonPrompt(garment('g1'), { backgroundId: 'B01', backgroundVariant: 'B01-1', poseId: 'P02', hairId: 'H00' }, defs);
    expect(p).toContain('Keep the customer\'s face exactly as in image 1');
    expect(p).toContain('IDENTITY LOCK');
    expect(p.indexOf('IDENTITY LOCK')).toBeLessThan(p.indexOf('Dress the customer'));
    expect(p).toContain('warm afternoon sunlight');
    expect(p).toContain('own hairstyle');
  });
  it('按品类判断覆盖部位：吊带连衣裙算整身，背心算上衣，品类为空看名称', () => {
    expect(garmentCoverage({ category: '连衣裙', name: '亮片吊带连衣裙' })).toBe('full');
    expect(garmentCoverage({ category: '背心', name: '' })).toBe('top');
    expect(garmentCoverage({ category: '半身裙', name: '' })).toBe('bottom');
    expect(garmentCoverage({ category: '', name: '男士牛仔裤' })).toBe('bottom');
    expect(garmentCoverage({ category: '', name: '生成解决方案素材 (8)' })).toBe('unknown');
  });
  it('只换上衣：保留原下装，不许光腿', () => {
    const p = buildTryonPrompt({ ...garment('g1'), category: 'T恤' }, { backgroundId: 'B01', poseId: 'P02', hairId: 'H00' }, defs);
    expect(p).toContain('replace only the upper-body clothing');
    expect(p).toContain('never bare legs');
    const u = buildTryonPrompt({ ...garment('g1'), category: '', name: 'IMG_001' }, { backgroundId: 'B01', poseId: 'P02', hairId: 'H00' }, defs);
    expect(u).toContain('Judge from image 2');
  });
  it('保脸核对：只有明说 same=false 才算换脸，答不上来不拦', () => {
    expect(normalizeFaceMatch({ same: false, reason: '眼型不同' })).toEqual({ same: false, reason: '眼型不同' });
    expect(normalizeFaceMatch({ same: 'false' }).same).toBe(false);
    expect(normalizeFaceMatch({ same: true }).same).toBe(true);
    expect(normalizeFaceMatch({}).same).toBe(true);
    expect(normalizeFaceMatch(null).same).toBe(true);
  });
  it('自定义背景走第 3 张图', () => {
    const p = buildTryonPrompt(garment('g1'), normalizeChoice({ backgroundId: 'B30', poseId: 'P01', hairId: 'H01', customBackground: '/bg.jpg' }, defs), defs);
    expect(p).toContain('image 3');
  });
  it('形象分析推荐只收库里有的、按人群过滤、最多 3 组', () => {
    const r = sanitizeSuggestions([
      { backgroundId: 'B01', poseId: 'P01', hairId: 'H01', reason: 'a' },
      { backgroundId: 'B99', poseId: 'P01', hairId: 'H01' },
      { backgroundId: 'B02', poseId: 'P02', hairId: 'H22' },
      { backgroundId: 'B30', poseId: 'P02', hairId: 'H01' },
      { backgroundId: 'B03', poseId: 'P03', hairId: 'H02' },
      { backgroundId: 'B04', poseId: 'P04', hairId: 'H03' },
      { backgroundId: 'B05', poseId: 'P05', hairId: 'H04' },
    ], defs, 'women');
    expect(r.map((x) => x.backgroundId)).toEqual(['B01', 'B03', 'B04']);
  });
  it('照片质检：列出问题就不合格', () => {
    expect(normalizePhotoCheck({ ok: true, issues: ['半身'] }).ok).toBe(false);
    expect(normalizePhotoCheck({ ok: true, issues: [] }).ok).toBe(true);
    expect(normalizePhotoCheck({ ok: false }).ok).toBe(false);
  });
});

describe('看板与隐私', () => {
  it('漏斗与热门组合', () => {
    const list = [
      tryon({ wantVisit: true, visit: { status: 'purchased', at: new Date().toISOString() } }),
      tryon({ wantVisit: true, visit: { status: 'left', at: new Date().toISOString() } }),
      tryon({ wantVisit: true }),
      tryon({}),
      tryon({ status: 'failed', source: 'mobile' }),
    ];
    const s = computeStats([garment('g1')], [], list, 7);
    expect(s.done).toBe(4);
    expect(s.wantRate).toBe(0.75);
    expect(s.visitRate).toBeCloseTo(0.667, 3);
    expect(s.closeRate).toBe(0.5);
    expect(s.mobileShare).toBe(0.2);
    expect(s.combos[0]).toEqual({ backgroundId: 'B01', poseId: 'P01', hairId: 'H00', count: 4 });
    expect(s.byDay).toHaveLength(7);
    expect(s.byDay[6].purchased).toBe(1);
  });
  it('高试穿低成交款', () => {
    const list: ApTryon[] = [];
    for (let i = 0; i < 10; i++) list.push(tryon({ garmentId: 'hot' }));
    for (let i = 0; i < 5; i++) list.push(tryon({ garmentId: 'ok', visit: { status: 'purchased', at: new Date().toISOString() } }));
    const s = computeStats([garment('hot'), garment('ok')], [], list);
    expect(s.lagging).toEqual(['hot']);
  });
  it('保留期到期的顾客', () => {
    const now = Date.parse('2026-09-30T00:00:00Z');
    const c = (id: string, at: string, purgedAt?: string): ApCustomer => ({ id, nickname: id, source: 'desk', photo: '', consentAt: at, createdAt: at, purgedAt });
    const r = expiredCustomers([c('a', '2026-09-20T00:00:00Z'), c('b', '2026-09-28T00:00:00Z'), c('c', '2026-09-01T00:00:00Z', '2026-09-08T00:00:00Z')], 7, now);
    expect(r.map((x) => x.id)).toEqual(['a']);
  });
  it('今日生成张数', () => {
    const list = [tryon({}), tryon({ createdAt: '2020-01-01T00:00:00Z' }), tryon({ customerId: 'c2' })];
    expect(tryonsToday(list, 'c1')).toBe(1);
  });
});
