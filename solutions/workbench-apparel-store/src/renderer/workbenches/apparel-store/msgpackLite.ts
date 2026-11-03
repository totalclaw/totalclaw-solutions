/**
 * 实时试衣的信令编解码：fal 的 Decart realtime 通道用 msgpack 收发（offer / answer / icecandidate / 输入参数）。
 * 只需要 map / array / string / number / bool / nil / bin 这几种，自己写一份，不为这几十行引一个依赖。
 */
const te = new TextEncoder();
const td = new TextDecoder();

export function encode(value: unknown): Uint8Array {
  const out: number[] = [];
  const u8 = (n: number) => out.push(n & 0xff);
  const u16 = (n: number) => { u8(n >> 8); u8(n); };
  const u32 = (n: number) => { u8(n >>> 24); u8(n >>> 16); u8(n >>> 8); u8(n); };
  const bytes = (b: Uint8Array) => { for (const x of b) out.push(x); };
  const write = (v: unknown): void => {
    if (v === null || v === undefined) { u8(0xc0); return; }
    if (v === false) { u8(0xc2); return; }
    if (v === true) { u8(0xc3); return; }
    if (typeof v === 'number') {
      if (Number.isInteger(v) && v >= 0 && v <= 0xffffffff) {
        if (v < 0x80) u8(v); else if (v < 0x100) { u8(0xcc); u8(v); } else if (v < 0x10000) { u8(0xcd); u16(v); } else { u8(0xce); u32(v); }
      } else if (Number.isInteger(v) && v < 0 && v >= -0x80000000) {
        if (v >= -32) u8(v); else if (v >= -128) { u8(0xd0); u8(v); } else if (v >= -32768) { u8(0xd1); u16(v); } else { u8(0xd2); u32(v); }
      } else {
        const b = new Uint8Array(8);
        new DataView(b.buffer).setFloat64(0, v);
        u8(0xcb); bytes(b);
      }
      return;
    }
    if (typeof v === 'string') {
      const b = te.encode(v);
      const n = b.length;
      if (n < 32) u8(0xa0 | n); else if (n < 0x100) { u8(0xd9); u8(n); } else if (n < 0x10000) { u8(0xda); u16(n); } else { u8(0xdb); u32(n); }
      bytes(b);
      return;
    }
    if (v instanceof Uint8Array) {
      const n = v.length;
      if (n < 0x100) { u8(0xc4); u8(n); } else if (n < 0x10000) { u8(0xc5); u16(n); } else { u8(0xc6); u32(n); }
      bytes(v);
      return;
    }
    if (Array.isArray(v)) {
      const n = v.length;
      if (n < 16) u8(0x90 | n); else if (n < 0x10000) { u8(0xdc); u16(n); } else { u8(0xdd); u32(n); }
      for (const x of v) write(x);
      return;
    }
    if (typeof v === 'object') {
      const entries = Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined);
      const n = entries.length;
      if (n < 16) u8(0x80 | n); else if (n < 0x10000) { u8(0xde); u16(n); } else { u8(0xdf); u32(n); }
      for (const [k, x] of entries) { write(k); write(x); }
      return;
    }
    throw new Error(`msgpack: unsupported ${typeof v}`);
  };
  write(value);
  return Uint8Array.from(out);
}

export function decode(buf: Uint8Array): any {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let i = 0;
  const str = (n: number) => { const s = td.decode(buf.subarray(i, i + n)); i += n; return s; };
  const bin = (n: number) => { const b = buf.slice(i, i + n); i += n; return b; };
  const arr = (n: number) => { const a: any[] = []; for (let k = 0; k < n; k += 1) a.push(read()); return a; };
  const map = (n: number) => { const o: Record<string, any> = {}; for (let k = 0; k < n; k += 1) { const key = read(); o[String(key)] = read(); } return o; };
  const read = (): any => {
    const b = dv.getUint8(i++);
    if (b < 0x80) return b;
    if (b >= 0xe0) return b - 0x100;
    if ((b & 0xf0) === 0x80) return map(b & 0x0f);
    if ((b & 0xf0) === 0x90) return arr(b & 0x0f);
    if ((b & 0xe0) === 0xa0) return str(b & 0x1f);
    switch (b) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;
      case 0xc4: { const n = dv.getUint8(i); i += 1; return bin(n); }
      case 0xc5: { const n = dv.getUint16(i); i += 2; return bin(n); }
      case 0xc6: { const n = dv.getUint32(i); i += 4; return bin(n); }
      case 0xca: { const v = dv.getFloat32(i); i += 4; return v; }
      case 0xcb: { const v = dv.getFloat64(i); i += 8; return v; }
      case 0xcc: { const v = dv.getUint8(i); i += 1; return v; }
      case 0xcd: { const v = dv.getUint16(i); i += 2; return v; }
      case 0xce: { const v = dv.getUint32(i); i += 4; return v; }
      case 0xcf: { const v = Number(dv.getBigUint64(i)); i += 8; return v; }
      case 0xd0: { const v = dv.getInt8(i); i += 1; return v; }
      case 0xd1: { const v = dv.getInt16(i); i += 2; return v; }
      case 0xd2: { const v = dv.getInt32(i); i += 4; return v; }
      case 0xd3: { const v = Number(dv.getBigInt64(i)); i += 8; return v; }
      case 0xd9: { const n = dv.getUint8(i); i += 1; return str(n); }
      case 0xda: { const n = dv.getUint16(i); i += 2; return str(n); }
      case 0xdb: { const n = dv.getUint32(i); i += 4; return str(n); }
      case 0xdc: { const n = dv.getUint16(i); i += 2; return arr(n); }
      case 0xdd: { const n = dv.getUint32(i); i += 4; return arr(n); }
      case 0xde: { const n = dv.getUint16(i); i += 2; return map(n); }
      case 0xdf: { const n = dv.getUint32(i); i += 4; return map(n); }
      default: throw new Error(`msgpack: unsupported byte 0x${b.toString(16)}`);
    }
  };
  return read();
}
