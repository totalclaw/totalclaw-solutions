import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { MmPerson } from '../../../../shared/meetingMgmt/types';
import { decodeText, matchNickname, parseClock, parseTranscriptFile, parseTranscriptText } from './transcriptParse';

const people: MmPerson[] = [
  { id: 'u1', name: '林晓', deptId: 'd1' },
  { id: 'u2', name: '王建国', deptId: 'd2', wecomUserId: 'wangjg' },
  { id: 'u3', name: '张三', deptId: 'd3' },
  { id: 'u4', name: '张三丰', deptId: 'd3' },
  { id: 'u5', name: 'Alice Chen', deptId: 'd4' },
];
const o = { attendees: people };

describe('parseClock', () => {
  it('常见时间写法', () => {
    expect(parseClock('01:02:03')).toBe(3723);
    expect(parseClock('02:03')).toBe(123);
    expect(parseClock('00:00:01,500')).toBe(1.5);
    expect(parseClock('00:01.250')).toBe(1.25);
    expect(parseClock('1:2')).toBeNull();
    expect(parseClock('abc')).toBeNull();
  });
});

describe('matchNickname', () => {
  it('姓名 / 带角色括号 / 企微 userid / 最长名优先 / 通用标签不匹配', () => {
    expect(matchNickname('林晓', people)?.id).toBe('u1');
    expect(matchNickname('林晓（主持人）', people)?.id).toBe('u1');
    expect(matchNickname('王建国-产品部', people)?.id).toBe('u2');
    expect(matchNickname('wangjg', people)?.id).toBe('u2');
    expect(matchNickname('张三丰', people)?.id).toBe('u4');
    expect(matchNickname('张三', people)?.id).toBe('u3');
    expect(matchNickname('alice chen', people)?.id).toBe('u5');
    expect(matchNickname('说话人1', people)).toBeNull();
    expect(matchNickname('Speaker 2', people)).toBeNull();
    expect(matchNickname('赵六', people)).toBeNull();
  });
});

describe('parseTranscriptText', () => {
  it('「昵称：内容」+ 元信息行不当发言人，同一人连续发言合并', () => {
    const r = parseTranscriptText([
      '会议主题：二期方案评审',
      '时间：2026-11-16 10:00',
      '',
      '林晓：大家好，今天评审二期方案。',
      '王建国：我先讲一下进度。',
      '目前开发完成了七成。',
      '王建国：下周三之前提测。',
      '张三：好的，我们测试组配合。',
    ].join('\n'), '.txt', o);
    expect(r.segments.map(s => s.speakerLabel)).toEqual(['林晓', '王建国', '张三']);
    expect(r.segments[1]!.text).toBe('我先讲一下进度。目前开发完成了七成。下周三之前提测。');
    expect(r.speakers).toEqual([
      { label: '林晓', personId: 'u1', matchedBy: 'nickname' },
      { label: '王建国', personId: 'u2', matchedBy: 'nickname' },
      { label: '张三', personId: 'u3', matchedBy: 'nickname' },
    ]);
    expect(r.segments.every(s => s.end > s.start)).toBe(true);
  });

  it('「[00:01:02] 昵称：」「昵称(00:01:02)：」都带时间戳', () => {
    const r = parseTranscriptText('[00:00:05] 林晓：开始。\n[00:01:10] 赵六：我是外部顾问。\n赵六(00:02:00)：补充一点。\n[00:03:00] 林晓：散会。', '.md', o);
    expect(r.segments.map(s => [s.speakerLabel, s.start])).toEqual([['林晓', 5], ['赵六', 70], ['林晓', 180]]);
    expect(r.segments[1]!.text).toBe('我是外部顾问。补充一点。');
    expect(r.speakers.find(s => s.label === '赵六')!.personId).toBeUndefined();
  });

  it('飞书 / 腾讯会议导出：「昵称 00:01:02」单独一行，下面是内容', () => {
    const r = parseTranscriptText('林晓 00:00:03\n大家好。\n\n说话人2 00:00:15\n我来讲一下。\n继续讲。\n\n林晓 00:01:00\n好的。', '.txt', o);
    expect(r.segments.map(s => s.speakerLabel)).toEqual(['林晓', '说话人2', '林晓']);
    expect(r.segments[1]!.text).toBe('我来讲一下。继续讲。');
    expect(r.speakers.find(s => s.label === '说话人2')!.personId).toBeUndefined();
  });

  it('Markdown 加粗 / 列表', () => {
    const r = parseTranscriptText('# 纪要\n\n- **林晓**：先说结论。\n- **张三丰**：同意。\n- **林晓**：那就这么定。', '.md', o);
    expect(r.segments.map(s => s.speakerLabel)).toEqual(['林晓', '张三丰', '林晓']);
    expect(r.speakers.find(s => s.label === '张三丰')!.personId).toBe('u4');
  });

  it('srt：行首说话人、时间戳', () => {
    const srt = '1\n00:00:01,000 --> 00:00:04,000\n林晓：大家好\n\n2\n00:00:04,500 --> 00:00:08,000\n林晓：我们开始\n\n3\n00:00:09,000 --> 00:00:12,000\n王建国: 好的\n';
    const r = parseTranscriptText(srt, '.srt', o);
    expect(r.segments).toHaveLength(2);
    expect(r.segments[0]).toMatchObject({ speakerLabel: '林晓', start: 1, end: 8, text: '大家好我们开始' });
    expect(r.segments[1]).toMatchObject({ speakerLabel: '王建国', start: 9 });
  });

  it('vtt（Zoom）：<v 名字> 标签', () => {
    const vtt = 'WEBVTT\n\n1\n00:00:01.000 --> 00:00:03.000\n<v Alice Chen>Hello everyone</v>\n\n2\n00:00:03.500 --> 00:00:06.000\n<v 林晓>好的，开始吧</v>\n';
    const r = parseTranscriptText(vtt, '.vtt', o);
    expect(r.segments.map(s => s.speakerLabel)).toEqual(['Alice Chen', '林晓']);
    expect(r.speakers[0]!.personId).toBe('u5');
  });

  it('没有发言人标注的字幕：整篇归 S1，按停顿合并成段', () => {
    const srt = '1\n00:00:01,000 --> 00:00:03,000\n大家好\n\n2\n00:00:03,200 --> 00:00:05,000\n今天开会\n\n3\n00:00:20,000 --> 00:00:22,000\n下一个议题\n';
    const r = parseTranscriptText(srt, '.srt', o);
    expect(r.speakers).toEqual([{ label: 'S1' }]);
    expect(r.segments).toHaveLength(2);
    expect(r.segments[0]!.text).toBe('大家好今天开会');
  });

  it('没有发言人标注的纯文本：按空行分段，整篇归 S1', () => {
    const r = parseTranscriptText('第一段讨论预算。\n继续预算。\n\n第二段讨论人员。', '.txt', o);
    expect(r.speakers).toEqual([{ label: 'S1' }]);
    expect(r.segments.map(s => s.text)).toEqual(['第一段讨论预算。继续预算。', '第二段讨论人员。']);
  });

  it('只出现一次又不是参会人的「标签：」当正文', () => {
    const r = parseTranscriptText('林晓：说明一下。\n注意：这里很重要\n林晓：好。', '.txt', o);
    expect(r.speakers.map(s => s.label)).toEqual(['林晓']);
    expect(r.segments[0]!.text).toContain('注意：这里很重要');
  });

  it('json：常见字段名，毫秒时间戳，数字说话人', () => {
    const json = JSON.stringify({ data: { sentences: [
      { spk: 0, text: '开始', bg: 1000, ed: 3000 },
      { spk: 1, text: '收到', bg: 40000, ed: 42000 },
      { speaker: '林晓', content: '结束', start: 60000, end: 61000 },
    ] } });
    const r = parseTranscriptText(json, '.json', o);
    expect(r.segments.map(s => [s.speakerLabel, s.start])).toEqual([['S1', 1], ['S2', 40], ['林晓', 60]]);
    expect(r.speakers.find(s => s.label === '林晓')!.personId).toBe('u1');
  });
});

describe('parseTranscriptFile', () => {
  let dir = '';
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'mm-tr-')); });
  afterAll(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });

  it('GBK 编码的 txt 也能读', async () => {
    const p = join(dir, 'gbk.txt');
    // 「林晓：你好」的 GB18030 编码
    writeFileSync(p, Buffer.from([0xc1, 0xd6, 0xcf, 0xfe, 0xa3, 0xba, 0xc4, 0xe3, 0xba, 0xc3, 0x0a, 0xc1, 0xd6, 0xcf, 0xfe, 0xa3, 0xba, 0xba, 0xc3]));
    const r = await parseTranscriptFile(p, 'gbk.txt', o);
    expect(r.segments[0]?.speakerLabel).toBe('林晓');
    expect(decodeText(Buffer.from('﻿abc', 'utf8'))).toBe('abc');
  });

  it('docx（腾讯会议导出的「昵称(时间)：内容」）', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    const para = (t: string) => `<w:p><w:r><w:t>${t}</w:t></w:r></w:p>`;
    const body = [para('会议记录'), para('林晓(00:00:05)：先过一下进度。'), para('王建国(00:00:30)：后端接口本周完成。'), para('林晓(00:01:10)：好，那就这么定。')].join('');
    zip.addFile('[Content_Types].xml', Buffer.from('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>'));
    zip.addFile('word/document.xml', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`));
    const p = join(dir, 'minutes.docx');
    zip.writeZip(p);
    const r = await parseTranscriptFile(p, 'minutes.docx', o);
    expect(r.segments.map(s => [s.speakerLabel, s.start])).toEqual([['林晓', 5], ['王建国', 30], ['林晓', 70]]);
    expect(r.speakers.every(s => s.matchedBy === 'nickname')).toBe(true);
  }, 60_000); // 首次动态加载 documentExtractor 要转译一串依赖，机器忙时会超过默认 5 秒

  it('UTF-16 带 BOM', async () => {
    const p = join(dir, 'u16.txt');
    writeFileSync(p, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('张三：测试\n张三：再测', 'utf16le')]));
    const r = await parseTranscriptFile(p, 'u16.txt', o);
    expect(r.segments[0]).toMatchObject({ speakerLabel: '张三', text: '测试再测' });
  });
});
