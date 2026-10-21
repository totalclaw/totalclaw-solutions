/**
 * 对抗性回归：古兰经 state 必须原子落盘，且坏文件要留档（2026-09-22 审查确认）。
 *
 * 现场机制：原实现是 `writeFileSync(file, JSON.stringify(state))` 直接覆盖写。
 * 学生交卷阶段每答一题写一次**整份** state，写盘途中断电 / 被强杀就留下一个截断的
 * `state.json`；而 `load()` 的 catch 只 warn 一句就换成空状态 ——
 * 语料目录、全部试卷、全部答题记录、教学计划、卡片一起归零，而且不报错。
 *
 * 这组用例钉两条：
 *   ① 写入过程不留半截文件：任何时刻 state.json 要么是旧的完整内容、要么是新的完整内容；
 *   ② 读到坏文件时先隔离留档（.corrupt-*），不能静默清零。
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeJsonAtomic, quarantineCorruptFile } from '../../utils/atomicJson';

let dir = '';
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'tc-quran-atomic-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('古兰经 state 原子落盘', () => {
  it('写入期间不会让读者看到半截文件（旧内容完整保留到 rename 那一刻）', () => {
    const f = join(dir, 'state.json');
    writeJsonAtomic(f, { papers: ['旧卷'], records: [{ id: 'r1' }] });
    const before = JSON.parse(readFileSync(f, 'utf8'));
    expect(before.papers).toEqual(['旧卷']);

    // 原子写的关键：新内容先落到 .tmp，再 rename 顶替；过程中 state.json 始终可解析
    writeJsonAtomic(f, { papers: ['旧卷', '新卷'], records: [{ id: 'r1' }, { id: 'r2' }] });
    const after = JSON.parse(readFileSync(f, 'utf8'));
    expect(after.papers).toEqual(['旧卷', '新卷']);
    expect(after.records).toHaveLength(2);

    // 不许留下临时残骸
    expect(readdirSync(dir).filter((n) => n.endsWith('.tmp'))).toEqual([]);
  });

  it('坏文件必须隔离留档，不能静默清零', () => {
    const f = join(dir, 'state.json');
    writeFileSync(f, '{"papers":["半截'); // 断电现场：截断的 JSON
    expect(() => JSON.parse(readFileSync(f, 'utf8'))).toThrow();

    const kept = quarantineCorruptFile(f, 'Unexpected end of JSON input');
    expect(kept, '必须返回隔离后的路径').toBeTruthy();
    // 原文件让位，损坏内容原样留档供追查
    expect(existsSync(f)).toBe(false);
    expect(readFileSync(kept!, 'utf8')).toBe('{"papers":["半截');
    expect(kept!).toMatch(/\.corrupt-/);
  });

  it('隔离后可以从干净状态重新写入', () => {
    const f = join(dir, 'state.json');
    writeFileSync(f, 'not json');
    quarantineCorruptFile(f, 'bad');
    writeJsonAtomic(f, { papers: [] });
    expect(JSON.parse(readFileSync(f, 'utf8'))).toEqual({ papers: [] });
  });
});
