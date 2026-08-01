function za(r, i) {
  for (var a = 0; a < i.length; a++) {
    const f = i[a];
    if (typeof f != "string" && !Array.isArray(f)) {
      for (const o in f)
        if (o !== "default" && !(o in r)) {
          const c = Object.getOwnPropertyDescriptor(f, o);
          c && Object.defineProperty(r, o, c.get ? c : {
            enumerable: !0,
            get: () => f[o]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }));
}
const fu = "kairos-time-v2", Xn = "9mW5W6i2873t1Zr4EPtVBHi7kjjTFhyeUfyC5CWNEHP", Qr = "./public/kairos_time.wasm";
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function du(r) {
  return r instanceof Uint8Array || ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array";
}
function Ls(r) {
  if (!Number.isSafeInteger(r) || r < 0)
    throw new Error("positive integer expected, got " + r);
}
function Ge(r, ...i) {
  if (!du(r))
    throw new Error("Uint8Array expected");
  if (i.length > 0 && !i.includes(r.length))
    throw new Error("Uint8Array expected of length " + i + ", got length=" + r.length);
}
function Tn(r, i = !0) {
  if (r.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (i && r.finished)
    throw new Error("Hash#digest() has already been called");
}
function ur(r, i) {
  Ge(r);
  const a = i.outputLen;
  if (r.length < a)
    throw new Error("digestInto() expects output buffer of length at least " + a);
}
function hu(r) {
  return new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
}
function Zn(r) {
  return new Uint32Array(r.buffer, r.byteOffset, Math.floor(r.byteLength / 4));
}
function Ke(...r) {
  for (let i = 0; i < r.length; i++)
    r[i].fill(0);
}
function Os(r) {
  return new DataView(r.buffer, r.byteOffset, r.byteLength);
}
function Yn(r, i) {
  return r << 32 - i | r >>> i;
}
const Xa = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function Za(r) {
  return r << 24 & 4278190080 | r << 8 & 16711680 | r >>> 8 & 65280 | r >>> 24 & 255;
}
const _u = Xa ? (r) => r : (r) => Za(r);
function bu(r) {
  for (let i = 0; i < r.length; i++)
    r[i] = Za(r[i]);
  return r;
}
const zt = Xa ? (r) => r : bu, pu = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", gu = /* @__PURE__ */ Array.from({ length: 256 }, (r, i) => i.toString(16).padStart(2, "0"));
function yu(r) {
  if (Ge(r), pu)
    return r.toHex();
  let i = "";
  for (let a = 0; a < r.length; a++)
    i += gu[r[a]];
  return i;
}
function wu(r) {
  if (typeof r != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(r));
}
function fn(r) {
  return typeof r == "string" && (r = wu(r)), Ge(r), r;
}
class Ya {
}
function mu(r) {
  const i = (f) => r().update(fn(f)).digest(), a = r();
  return i.outputLen = a.outputLen, i.blockLen = a.blockLen, i.create = () => r(), i;
}
function vu(r) {
  const i = (f, o) => r(o).update(fn(f)).digest(), a = r({});
  return i.outputLen = a.outputLen, i.blockLen = a.blockLen, i.create = (f) => r(f), i;
}
function Ou(r, i, a, f) {
  if (typeof r.setBigUint64 == "function")
    return r.setBigUint64(i, a, f);
  const o = BigInt(32), c = BigInt(4294967295), l = Number(a >> o & c), n = Number(a & c), t = f ? 4 : 0, e = f ? 0 : 4;
  r.setUint32(i + t, l, f), r.setUint32(i + e, n, f);
}
class Ru extends Ya {
  constructor(i, a, f, o) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = i, this.outputLen = a, this.padOffset = f, this.isLE = o, this.buffer = new Uint8Array(i), this.view = Os(this.buffer);
  }
  update(i) {
    Tn(this), i = fn(i), Ge(i);
    const { view: a, buffer: f, blockLen: o } = this, c = i.length;
    for (let l = 0; l < c; ) {
      const n = Math.min(o - this.pos, c - l);
      if (n === o) {
        const t = Os(i);
        for (; o <= c - l; l += o)
          this.process(t, l);
        continue;
      }
      f.set(i.subarray(l, l + n), this.pos), this.pos += n, l += n, this.pos === o && (this.process(a, 0), this.pos = 0);
    }
    return this.length += i.length, this.roundClean(), this;
  }
  digestInto(i) {
    Tn(this), ur(i, this), this.finished = !0;
    const { buffer: a, view: f, blockLen: o, isLE: c } = this;
    let { pos: l } = this;
    a[l++] = 128, Ke(this.buffer.subarray(l)), this.padOffset > o - l && (this.process(f, 0), l = 0);
    for (let u = l; u < o; u++)
      a[u] = 0;
    Ou(f, o - 8, BigInt(this.length * 8), c), this.process(f, 0);
    const n = Os(i), t = this.outputLen;
    if (t % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const e = t / 4, s = this.get();
    if (e > s.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let u = 0; u < e; u++)
      n.setUint32(4 * u, s[u], c);
  }
  digest() {
    const { buffer: i, outputLen: a } = this;
    this.digestInto(i);
    const f = i.slice(0, a);
    return this.destroy(), f;
  }
  _cloneInto(i) {
    i || (i = new this.constructor()), i.set(...this.get());
    const { blockLen: a, buffer: f, length: o, finished: c, destroyed: l, pos: n } = this;
    return i.destroyed = l, i.finished = c, i.length = o, i.pos = n, o % a && i.buffer.set(f), i;
  }
  clone() {
    return this._cloneInto();
  }
}
const Tu = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), B = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]), En = /* @__PURE__ */ BigInt(2 ** 32 - 1), ti = /* @__PURE__ */ BigInt(32);
function Fs(r, i = !1) {
  return i ? { h: Number(r & En), l: Number(r >> ti & En) } : { h: Number(r >> ti & En) | 0, l: Number(r & En) | 0 };
}
function Du(r, i = !1) {
  const a = r.length;
  let f = new Uint32Array(a), o = new Uint32Array(a);
  for (let c = 0; c < a; c++) {
    const { h: l, l: n } = Fs(r[c], i);
    [f[c], o[c]] = [l, n];
  }
  return [f, o];
}
const ei = (r, i, a) => r >>> a, ni = (r, i, a) => r << 32 - a | i >>> a, Ye = (r, i, a) => r >>> a | i << 32 - a, Je = (r, i, a) => r << 32 - a | i >>> a, qn = (r, i, a) => r << 64 - a | i >>> a - 32, Nn = (r, i, a) => r >>> a - 32 | i << 64 - a;
function de(r, i, a, f) {
  const o = (i >>> 0) + (f >>> 0);
  return { h: r + a + (o / 2 ** 32 | 0) | 0, l: o | 0 };
}
const Su = (r, i, a) => (r >>> 0) + (i >>> 0) + (a >>> 0), ju = (r, i, a, f) => i + a + f + (r / 2 ** 32 | 0) | 0, Pu = (r, i, a, f) => (r >>> 0) + (i >>> 0) + (a >>> 0) + (f >>> 0), Iu = (r, i, a, f, o) => i + a + f + o + (r / 2 ** 32 | 0) | 0, Cu = (r, i, a, f, o) => (r >>> 0) + (i >>> 0) + (a >>> 0) + (f >>> 0) + (o >>> 0), Au = (r, i, a, f, o, c) => i + a + f + o + c + (r / 2 ** 32 | 0) | 0;
function ye(r, i, a, f, o) {
  return r = r + i + o | 0, f = Yn(f ^ r, 16), a = a + f | 0, i = Yn(i ^ a, 12), { a: r, b: i, c: a, d: f };
}
function we(r, i, a, f, o) {
  return r = r + i + o | 0, f = Yn(f ^ r, 8), a = a + f | 0, i = Yn(i ^ a, 7), { a: r, b: i, c: a, d: f };
}
class Uu extends Ya {
  constructor(i, a) {
    super(), this.finished = !1, this.destroyed = !1, this.length = 0, this.pos = 0, Ls(i), Ls(a), this.blockLen = i, this.outputLen = a, this.buffer = new Uint8Array(i), this.buffer32 = Zn(this.buffer);
  }
  update(i) {
    Tn(this), i = fn(i), Ge(i);
    const { blockLen: a, buffer: f, buffer32: o } = this, c = i.length, l = i.byteOffset, n = i.buffer;
    for (let t = 0; t < c; ) {
      this.pos === a && (zt(o), this.compress(o, 0, !1), zt(o), this.pos = 0);
      const e = Math.min(a - this.pos, c - t), s = l + t;
      if (e === a && !(s % 4) && t + e < c) {
        const u = new Uint32Array(n, s, Math.floor((c - t) / 4));
        zt(u);
        for (let d = 0; t + a < c; d += o.length, t += a)
          this.length += a, this.compress(u, d, !1);
        zt(u);
        continue;
      }
      f.set(i.subarray(t, t + e), this.pos), this.pos += e, this.length += e, t += e;
    }
    return this;
  }
  digestInto(i) {
    Tn(this), ur(i, this);
    const { pos: a, buffer32: f } = this;
    this.finished = !0, Ke(this.buffer.subarray(a)), zt(f), this.compress(f, 0, !0), zt(f);
    const o = Zn(i);
    this.get().forEach((c, l) => o[l] = _u(c));
  }
  digest() {
    const { buffer: i, outputLen: a } = this;
    this.digestInto(i);
    const f = i.slice(0, a);
    return this.destroy(), f;
  }
  _cloneInto(i) {
    const { buffer: a, length: f, finished: o, destroyed: c, outputLen: l, pos: n } = this;
    return i || (i = new this.constructor({ dkLen: l })), i.set(...this.get()), i.buffer.set(a), i.destroyed = c, i.finished = o, i.length = f, i.pos = n, i.outputLen = l, i;
  }
  clone() {
    return this._cloneInto();
  }
}
function si(r, i, a, f, o, c, l, n, t, e, s, u, d, h, b, g, w, y, m, O) {
  let R = 0;
  for (let P = 0; P < f; P++)
    ({ a: o, b: t, c: d, d: w } = ye(o, t, d, w, a[i + r[R++]])), { a: o, b: t, c: d, d: w } = we(o, t, d, w, a[i + r[R++]]), { a: c, b: e, c: h, d: y } = ye(c, e, h, y, a[i + r[R++]]), { a: c, b: e, c: h, d: y } = we(c, e, h, y, a[i + r[R++]]), { a: l, b: s, c: b, d: m } = ye(l, s, b, m, a[i + r[R++]]), { a: l, b: s, c: b, d: m } = we(l, s, b, m, a[i + r[R++]]), { a: n, b: u, c: g, d: O } = ye(n, u, g, O, a[i + r[R++]]), { a: n, b: u, c: g, d: O } = we(n, u, g, O, a[i + r[R++]]), { a: o, b: e, c: b, d: O } = ye(o, e, b, O, a[i + r[R++]]), { a: o, b: e, c: b, d: O } = we(o, e, b, O, a[i + r[R++]]), { a: c, b: s, c: g, d: w } = ye(c, s, g, w, a[i + r[R++]]), { a: c, b: s, c: g, d: w } = we(c, s, g, w, a[i + r[R++]]), { a: l, b: u, c: d, d: y } = ye(l, u, d, y, a[i + r[R++]]), { a: l, b: u, c: d, d: y } = we(l, u, d, y, a[i + r[R++]]), { a: n, b: t, c: h, d: m } = ye(n, t, h, m, a[i + r[R++]]), { a: n, b: t, c: h, d: m } = we(n, t, h, m, a[i + r[R++]]);
  return { v0: o, v1: c, v2: l, v3: n, v4: t, v5: e, v6: s, v7: u, v8: d, v9: h, v10: b, v11: g, v12: w, v13: y, v14: m, v15: O };
}
const oe = {
  CHUNK_START: 1,
  CHUNK_END: 2,
  PARENT: 4,
  ROOT: 8,
  KEYED_HASH: 16,
  DERIVE_KEY_CONTEXT: 32,
  DERIVE_KEY_MATERIAL: 64
}, he = Tu.slice(), ri = /* @__PURE__ */ (() => {
  const r = Array.from({ length: 16 }, (f, o) => o), i = (f) => [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8].map((o) => f[o]), a = [];
  for (let f = 0, o = r; f < 7; f++, o = i(o))
    a.push(...o);
  return Uint8Array.from(a);
})();
class lr extends Uu {
  constructor(i = {}, a = 0) {
    super(64, i.dkLen === void 0 ? 32 : i.dkLen), this.chunkPos = 0, this.chunksDone = 0, this.flags = 0, this.stack = [], this.posOut = 0, this.bufferOut32 = new Uint32Array(16), this.chunkOut = 0, this.enableXOF = !0;
    const { key: f, context: o } = i, c = o !== void 0;
    if (f !== void 0) {
      if (c)
        throw new Error('Only "key" or "context" can be specified at same time');
      const l = fn(f).slice();
      Ge(l, 32), this.IV = Zn(l), zt(this.IV), this.flags = a | oe.KEYED_HASH;
    } else if (c) {
      const l = fn(o), n = new lr({ dkLen: 32 }, oe.DERIVE_KEY_CONTEXT).update(l).digest();
      this.IV = Zn(n), zt(this.IV), this.flags = a | oe.DERIVE_KEY_MATERIAL;
    } else
      this.IV = he.slice(), this.flags = a;
    this.state = this.IV.slice(), this.bufferOut = hu(this.bufferOut32);
  }
  // Unused
  get() {
    return [];
  }
  set() {
  }
  b2Compress(i, a, f, o = 0) {
    const { state: c, pos: l } = this, { h: n, l: t } = Fs(BigInt(i), !0), { v0: e, v1: s, v2: u, v3: d, v4: h, v5: b, v6: g, v7: w, v8: y, v9: m, v10: O, v11: R, v12: P, v13: U, v14: N, v15: L } = si(ri, o, f, 7, c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], he[0], he[1], he[2], he[3], n, t, l, a);
    c[0] = e ^ y, c[1] = s ^ m, c[2] = u ^ O, c[3] = d ^ R, c[4] = h ^ P, c[5] = b ^ U, c[6] = g ^ N, c[7] = w ^ L;
  }
  compress(i, a = 0, f = !1) {
    let o = this.flags;
    if (this.chunkPos || (o |= oe.CHUNK_START), (this.chunkPos === 15 || f) && (o |= oe.CHUNK_END), f || (this.pos = this.blockLen), this.b2Compress(this.chunksDone, o, i, a), this.chunkPos += 1, this.chunkPos === 16 || f) {
      let c = this.state;
      this.state = this.IV.slice();
      for (let l, n = this.chunksDone + 1; (f || !(n & 1)) && (l = this.stack.pop()); n >>= 1)
        this.buffer32.set(l, 0), this.buffer32.set(c, 8), this.pos = this.blockLen, this.b2Compress(0, this.flags | oe.PARENT, this.buffer32, 0), c = this.state, this.state = this.IV.slice();
      this.chunksDone++, this.chunkPos = 0, this.stack.push(c);
    }
    this.pos = 0;
  }
  _cloneInto(i) {
    i = super._cloneInto(i);
    const { IV: a, flags: f, state: o, chunkPos: c, posOut: l, chunkOut: n, stack: t, chunksDone: e } = this;
    return i.state.set(o.slice()), i.stack = t.map((s) => Uint32Array.from(s)), i.IV.set(a), i.flags = f, i.chunkPos = c, i.chunksDone = e, i.posOut = l, i.chunkOut = n, i.enableXOF = this.enableXOF, i.bufferOut32.set(this.bufferOut32), i;
  }
  destroy() {
    this.destroyed = !0, Ke(this.state, this.buffer32, this.IV, this.bufferOut32), Ke(...this.stack);
  }
  // Same as b2Compress, but doesn't modify state and returns 16 u32 array (instead of 8)
  b2CompressOut() {
    const { state: i, pos: a, flags: f, buffer32: o, bufferOut32: c } = this, { h: l, l: n } = Fs(BigInt(this.chunkOut++));
    zt(o);
    const { v0: t, v1: e, v2: s, v3: u, v4: d, v5: h, v6: b, v7: g, v8: w, v9: y, v10: m, v11: O, v12: R, v13: P, v14: U, v15: N } = si(ri, 0, o, 7, i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], he[0], he[1], he[2], he[3], n, l, a, f);
    c[0] = t ^ w, c[1] = e ^ y, c[2] = s ^ m, c[3] = u ^ O, c[4] = d ^ R, c[5] = h ^ P, c[6] = b ^ U, c[7] = g ^ N, c[8] = i[0] ^ w, c[9] = i[1] ^ y, c[10] = i[2] ^ m, c[11] = i[3] ^ O, c[12] = i[4] ^ R, c[13] = i[5] ^ P, c[14] = i[6] ^ U, c[15] = i[7] ^ N, zt(o), zt(c), this.posOut = 0;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = !0, Ke(this.buffer.subarray(this.pos));
    let i = this.flags | oe.ROOT;
    this.stack.length ? (i |= oe.PARENT, zt(this.buffer32), this.compress(this.buffer32, 0, !0), zt(this.buffer32), this.chunksDone = 0, this.pos = this.blockLen) : i |= (this.chunkPos ? 0 : oe.CHUNK_START) | oe.CHUNK_END, this.flags = i, this.b2CompressOut();
  }
  writeInto(i) {
    Tn(this, !1), Ge(i), this.finish();
    const { blockLen: a, bufferOut: f } = this;
    for (let o = 0, c = i.length; o < c; ) {
      this.posOut >= a && this.b2CompressOut();
      const l = Math.min(a - this.posOut, c - o);
      i.set(f.subarray(this.posOut, this.posOut + l), o), this.posOut += l, o += l;
    }
    return i;
  }
  xofInto(i) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible after digest call");
    return this.writeInto(i);
  }
  xof(i) {
    return Ls(i), this.xofInto(new Uint8Array(i));
  }
  digestInto(i) {
    if (ur(i, this), this.finished)
      throw new Error("digest() was already called");
    return this.enableXOF = !1, this.writeInto(i), this.destroy(), i;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
}
const ge = /* @__PURE__ */ vu((r) => new lr(r));
function Mu(r) {
  if (r.length >= 255)
    throw new TypeError("Alphabet too long");
  const i = new Uint8Array(256);
  for (let e = 0; e < i.length; e++)
    i[e] = 255;
  for (let e = 0; e < r.length; e++) {
    const s = r.charAt(e), u = s.charCodeAt(0);
    if (i[u] !== 255)
      throw new TypeError(s + " is ambiguous");
    i[u] = e;
  }
  const a = r.length, f = r.charAt(0), o = Math.log(a) / Math.log(256), c = Math.log(256) / Math.log(a);
  function l(e) {
    if (e instanceof Uint8Array || (ArrayBuffer.isView(e) ? e = new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : Array.isArray(e) && (e = Uint8Array.from(e))), !(e instanceof Uint8Array))
      throw new TypeError("Expected Uint8Array");
    if (e.length === 0)
      return "";
    let s = 0, u = 0, d = 0;
    const h = e.length;
    for (; d !== h && e[d] === 0; )
      d++, s++;
    const b = (h - d) * c + 1 >>> 0, g = new Uint8Array(b);
    for (; d !== h; ) {
      let m = e[d], O = 0;
      for (let R = b - 1; (m !== 0 || O < u) && R !== -1; R--, O++)
        m += 256 * g[R] >>> 0, g[R] = m % a >>> 0, m = m / a >>> 0;
      if (m !== 0)
        throw new Error("Non-zero carry");
      u = O, d++;
    }
    let w = b - u;
    for (; w !== b && g[w] === 0; )
      w++;
    let y = f.repeat(s);
    for (; w < b; ++w)
      y += r.charAt(g[w]);
    return y;
  }
  function n(e) {
    if (typeof e != "string")
      throw new TypeError("Expected String");
    if (e.length === 0)
      return new Uint8Array();
    let s = 0, u = 0, d = 0;
    for (; e[s] === f; )
      u++, s++;
    const h = (e.length - s) * o + 1 >>> 0, b = new Uint8Array(h);
    for (; s < e.length; ) {
      const m = e.charCodeAt(s);
      if (m > 255)
        return;
      let O = i[m];
      if (O === 255)
        return;
      let R = 0;
      for (let P = h - 1; (O !== 0 || R < d) && P !== -1; P--, R++)
        O += a * b[P] >>> 0, b[P] = O % 256 >>> 0, O = O / 256 >>> 0;
      if (O !== 0)
        throw new Error("Non-zero carry");
      d = R, s++;
    }
    let g = h - d;
    for (; g !== h && b[g] === 0; )
      g++;
    const w = new Uint8Array(u + (h - g));
    let y = u;
    for (; g !== h; )
      w[y++] = b[g++];
    return w;
  }
  function t(e) {
    const s = n(e);
    if (s)
      return s;
    throw new Error("Non-base" + a + " character");
  }
  return {
    encode: l,
    decodeUnsafe: n,
    decode: t
  };
}
var Eu = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const De = Mu(Eu);
function qu(r) {
  if (Object.prototype.hasOwnProperty.call(r, "__esModule")) return r;
  var i = r.default;
  if (typeof i == "function") {
    var a = function f() {
      return this instanceof f ? Reflect.construct(i, arguments, this.constructor) : i.apply(this, arguments);
    };
    a.prototype = i.prototype;
  } else a = {};
  return Object.defineProperty(a, "__esModule", { value: !0 }), Object.keys(r).forEach(function(f) {
    var o = Object.getOwnPropertyDescriptor(r, f);
    Object.defineProperty(a, f, o.get ? o : {
      enumerable: !0,
      get: function() {
        return r[f];
      }
    });
  }), a;
}
var Ae = {}, x = {};
const Gn = 2, se = 4, ue = 4, Ja = 4, be = new Int32Array(2), Vs = new Float32Array(be.buffer), ks = new Float64Array(be.buffer), yn = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
var Jn;
(function(r) {
  r[r.UTF8_BYTES = 1] = "UTF8_BYTES", r[r.UTF16_STRING = 2] = "UTF16_STRING";
})(Jn || (Jn = {}));
class Dn {
  /**
   * Create a new ByteBuffer with a given array of bytes (`Uint8Array`)
   */
  constructor(i) {
    this.bytes_ = i, this.position_ = 0, this.text_decoder_ = new TextDecoder();
  }
  /**
   * Create and allocate a new ByteBuffer with a given size.
   */
  static allocate(i) {
    return new Dn(new Uint8Array(i));
  }
  clear() {
    this.position_ = 0;
  }
  /**
   * Get the underlying `Uint8Array`.
   */
  bytes() {
    return this.bytes_;
  }
  /**
   * Get the buffer's position.
   */
  position() {
    return this.position_;
  }
  /**
   * Set the buffer's position.
   */
  setPosition(i) {
    this.position_ = i;
  }
  /**
   * Get the buffer's capacity.
   */
  capacity() {
    return this.bytes_.length;
  }
  readInt8(i) {
    return this.readUint8(i) << 24 >> 24;
  }
  readUint8(i) {
    return this.bytes_[i];
  }
  readInt16(i) {
    return this.readUint16(i) << 16 >> 16;
  }
  readUint16(i) {
    return this.bytes_[i] | this.bytes_[i + 1] << 8;
  }
  readInt32(i) {
    return this.bytes_[i] | this.bytes_[i + 1] << 8 | this.bytes_[i + 2] << 16 | this.bytes_[i + 3] << 24;
  }
  readUint32(i) {
    return this.readInt32(i) >>> 0;
  }
  readInt64(i) {
    return BigInt.asIntN(64, BigInt(this.readUint32(i)) + (BigInt(this.readUint32(i + 4)) << BigInt(32)));
  }
  readUint64(i) {
    return BigInt.asUintN(64, BigInt(this.readUint32(i)) + (BigInt(this.readUint32(i + 4)) << BigInt(32)));
  }
  readFloat32(i) {
    return be[0] = this.readInt32(i), Vs[0];
  }
  readFloat64(i) {
    return be[yn ? 0 : 1] = this.readInt32(i), be[yn ? 1 : 0] = this.readInt32(i + 4), ks[0];
  }
  writeInt8(i, a) {
    this.bytes_[i] = a;
  }
  writeUint8(i, a) {
    this.bytes_[i] = a;
  }
  writeInt16(i, a) {
    this.bytes_[i] = a, this.bytes_[i + 1] = a >> 8;
  }
  writeUint16(i, a) {
    this.bytes_[i] = a, this.bytes_[i + 1] = a >> 8;
  }
  writeInt32(i, a) {
    this.bytes_[i] = a, this.bytes_[i + 1] = a >> 8, this.bytes_[i + 2] = a >> 16, this.bytes_[i + 3] = a >> 24;
  }
  writeUint32(i, a) {
    this.bytes_[i] = a, this.bytes_[i + 1] = a >> 8, this.bytes_[i + 2] = a >> 16, this.bytes_[i + 3] = a >> 24;
  }
  writeInt64(i, a) {
    this.writeInt32(i, Number(BigInt.asIntN(32, a))), this.writeInt32(i + 4, Number(BigInt.asIntN(32, a >> BigInt(32))));
  }
  writeUint64(i, a) {
    this.writeUint32(i, Number(BigInt.asUintN(32, a))), this.writeUint32(i + 4, Number(BigInt.asUintN(32, a >> BigInt(32))));
  }
  writeFloat32(i, a) {
    Vs[0] = a, this.writeInt32(i, be[0]);
  }
  writeFloat64(i, a) {
    ks[0] = a, this.writeInt32(i, be[yn ? 0 : 1]), this.writeInt32(i + 4, be[yn ? 1 : 0]);
  }
  /**
   * Return the file identifier.   Behavior is undefined for FlatBuffers whose
   * schema does not include a file_identifier (likely points at padding or the
   * start of a the root vtable).
   */
  getBufferIdentifier() {
    if (this.bytes_.length < this.position_ + se + ue)
      throw new Error("FlatBuffers: ByteBuffer is too short to contain an identifier.");
    let i = "";
    for (let a = 0; a < ue; a++)
      i += String.fromCharCode(this.readInt8(this.position_ + se + a));
    return i;
  }
  /**
   * Look up a field in the vtable, return an offset into the object, or 0 if the
   * field is not present.
   */
  __offset(i, a) {
    const f = i - this.readInt32(i);
    return a < this.readInt16(f) ? this.readInt16(f + a) : 0;
  }
  /**
   * Initialize any Table-derived type to point to the union at the given offset.
   */
  __union(i, a) {
    return i.bb_pos = a + this.readInt32(a), i.bb = this, i;
  }
  /**
   * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
   * This allocates a new string and converts to wide chars upon each access.
   *
   * To avoid the conversion to string, pass Encoding.UTF8_BYTES as the
   * "optionalEncoding" argument. This is useful for avoiding conversion when
   * the data will just be packaged back up in another FlatBuffer later on.
   *
   * @param offset
   * @param opt_encoding Defaults to UTF16_STRING
   */
  __string(i, a) {
    i += this.readInt32(i);
    const f = this.readInt32(i);
    i += se;
    const o = this.bytes_.subarray(i, i + f);
    return a === Jn.UTF8_BYTES ? o : this.text_decoder_.decode(o);
  }
  /**
   * Handle unions that can contain string as its member, if a Table-derived type then initialize it,
   * if a string then return a new one
   *
   * WARNING: strings are immutable in JS so we can't change the string that the user gave us, this
   * makes the behaviour of __union_with_string different compared to __union
   */
  __union_with_string(i, a) {
    return typeof i == "string" ? this.__string(a) : this.__union(i, a);
  }
  /**
   * Retrieve the relative offset stored at "offset"
   */
  __indirect(i) {
    return i + this.readInt32(i);
  }
  /**
   * Get the start of data of a vector whose offset is stored at "offset" in this object.
   */
  __vector(i) {
    return i + this.readInt32(i) + se;
  }
  /**
   * Get the length of a vector whose offset is stored at "offset" in this object.
   */
  __vector_len(i) {
    return this.readInt32(i + this.readInt32(i));
  }
  __has_identifier(i) {
    if (i.length != ue)
      throw new Error("FlatBuffers: file identifier must be length " + ue);
    for (let a = 0; a < ue; a++)
      if (i.charCodeAt(a) != this.readInt8(this.position() + se + a))
        return !1;
    return !0;
  }
  /**
   * A helper function for generating list for obj api
   */
  createScalarList(i, a) {
    const f = [];
    for (let o = 0; o < a; ++o) {
      const c = i(o);
      c !== null && f.push(c);
    }
    return f;
  }
  /**
   * A helper function for generating list for obj api
   * @param listAccessor function that accepts an index and return data at that index
   * @param listLength listLength
   * @param res result list
   */
  createObjList(i, a) {
    const f = [];
    for (let o = 0; o < a; ++o) {
      const c = i(o);
      c !== null && f.push(c.unpack());
    }
    return f;
  }
}
class fr {
  /**
   * Create a FlatBufferBuilder.
   */
  constructor(i) {
    this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = !1, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = !1, this.string_maps = null, this.text_encoder = new TextEncoder();
    let a;
    i ? a = i : a = 1024, this.bb = Dn.allocate(a), this.space = a;
  }
  clear() {
    this.bb.clear(), this.space = this.bb.capacity(), this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = !1, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = !1, this.string_maps = null;
  }
  /**
   * In order to save space, fields that are set to their default value
   * don't get serialized into the buffer. Forcing defaults provides a
   * way to manually disable this optimization.
   *
   * @param forceDefaults true always serializes default values
   */
  forceDefaults(i) {
    this.force_defaults = i;
  }
  /**
   * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
   * called finish(). The actual data starts at the ByteBuffer's current position,
   * not necessarily at 0.
   */
  dataBuffer() {
    return this.bb;
  }
  /**
   * Get the bytes representing the FlatBuffer. Only call this after you've
   * called finish().
   */
  asUint8Array() {
    return this.bb.bytes().subarray(this.bb.position(), this.bb.position() + this.offset());
  }
  /**
   * Prepare to write an element of `size` after `additional_bytes` have been
   * written, e.g. if you write a string, you need to align such the int length
   * field is aligned to 4 bytes, and the string data follows it directly. If all
   * you need to do is alignment, `additional_bytes` will be 0.
   *
   * @param size This is the of the new element to write
   * @param additional_bytes The padding size
   */
  prep(i, a) {
    i > this.minalign && (this.minalign = i);
    const f = ~(this.bb.capacity() - this.space + a) + 1 & i - 1;
    for (; this.space < f + i + a; ) {
      const o = this.bb.capacity();
      this.bb = fr.growByteBuffer(this.bb), this.space += this.bb.capacity() - o;
    }
    this.pad(f);
  }
  pad(i) {
    for (let a = 0; a < i; a++)
      this.bb.writeInt8(--this.space, 0);
  }
  writeInt8(i) {
    this.bb.writeInt8(this.space -= 1, i);
  }
  writeInt16(i) {
    this.bb.writeInt16(this.space -= 2, i);
  }
  writeInt32(i) {
    this.bb.writeInt32(this.space -= 4, i);
  }
  writeInt64(i) {
    this.bb.writeInt64(this.space -= 8, i);
  }
  writeFloat32(i) {
    this.bb.writeFloat32(this.space -= 4, i);
  }
  writeFloat64(i) {
    this.bb.writeFloat64(this.space -= 8, i);
  }
  /**
   * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `int8` to add the buffer.
   */
  addInt8(i) {
    this.prep(1, 0), this.writeInt8(i);
  }
  /**
   * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `int16` to add the buffer.
   */
  addInt16(i) {
    this.prep(2, 0), this.writeInt16(i);
  }
  /**
   * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `int32` to add the buffer.
   */
  addInt32(i) {
    this.prep(4, 0), this.writeInt32(i);
  }
  /**
   * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `int64` to add the buffer.
   */
  addInt64(i) {
    this.prep(8, 0), this.writeInt64(i);
  }
  /**
   * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `float32` to add the buffer.
   */
  addFloat32(i) {
    this.prep(4, 0), this.writeFloat32(i);
  }
  /**
   * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `float64` to add the buffer.
   */
  addFloat64(i) {
    this.prep(8, 0), this.writeFloat64(i);
  }
  addFieldInt8(i, a, f) {
    (this.force_defaults || a != f) && (this.addInt8(a), this.slot(i));
  }
  addFieldInt16(i, a, f) {
    (this.force_defaults || a != f) && (this.addInt16(a), this.slot(i));
  }
  addFieldInt32(i, a, f) {
    (this.force_defaults || a != f) && (this.addInt32(a), this.slot(i));
  }
  addFieldInt64(i, a, f) {
    (this.force_defaults || a !== f) && (this.addInt64(a), this.slot(i));
  }
  addFieldFloat32(i, a, f) {
    (this.force_defaults || a != f) && (this.addFloat32(a), this.slot(i));
  }
  addFieldFloat64(i, a, f) {
    (this.force_defaults || a != f) && (this.addFloat64(a), this.slot(i));
  }
  addFieldOffset(i, a, f) {
    (this.force_defaults || a != f) && (this.addOffset(a), this.slot(i));
  }
  /**
   * Structs are stored inline, so nothing additional is being added. `d` is always 0.
   */
  addFieldStruct(i, a, f) {
    a != f && (this.nested(a), this.slot(i));
  }
  /**
   * Structures are always stored inline, they need to be created right
   * where they're used.  You'll get this assertion failure if you
   * created it elsewhere.
   */
  nested(i) {
    if (i != this.offset())
      throw new TypeError("FlatBuffers: struct must be serialized inline.");
  }
  /**
   * Should not be creating any other object, string or vector
   * while an object is being constructed
   */
  notNested() {
    if (this.isNested)
      throw new TypeError("FlatBuffers: object serialization must not be nested.");
  }
  /**
   * Set the current vtable at `voffset` to the current location in the buffer.
   */
  slot(i) {
    this.vtable !== null && (this.vtable[i] = this.offset());
  }
  /**
   * @returns Offset relative to the end of the buffer.
   */
  offset() {
    return this.bb.capacity() - this.space;
  }
  /**
   * Doubles the size of the backing ByteBuffer and copies the old data towards
   * the end of the new buffer (since we build the buffer backwards).
   *
   * @param bb The current buffer with the existing data
   * @returns A new byte buffer with the old data copied
   * to it. The data is located at the end of the buffer.
   *
   * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
   * it a uint8Array we need to suppress the type check:
   * @suppress {checkTypes}
   */
  static growByteBuffer(i) {
    const a = i.capacity();
    if (a & 3221225472)
      throw new Error("FlatBuffers: cannot grow buffer beyond 2 gigabytes.");
    const f = a << 1, o = Dn.allocate(f);
    return o.setPosition(f - a), o.bytes().set(i.bytes(), f - a), o;
  }
  /**
   * Adds on offset, relative to where it will be written.
   *
   * @param offset The offset to add.
   */
  addOffset(i) {
    this.prep(se, 0), this.writeInt32(this.offset() - i + se);
  }
  /**
   * Start encoding a new object in the buffer.  Users will not usually need to
   * call this directly. The FlatBuffers compiler will generate helper methods
   * that call this method internally.
   */
  startObject(i) {
    this.notNested(), this.vtable == null && (this.vtable = []), this.vtable_in_use = i;
    for (let a = 0; a < i; a++)
      this.vtable[a] = 0;
    this.isNested = !0, this.object_start = this.offset();
  }
  /**
   * Finish off writing the object that is under construction.
   *
   * @returns The offset to the object inside `dataBuffer`
   */
  endObject() {
    if (this.vtable == null || !this.isNested)
      throw new Error("FlatBuffers: endObject called without startObject");
    this.addInt32(0);
    const i = this.offset();
    let a = this.vtable_in_use - 1;
    for (; a >= 0 && this.vtable[a] == 0; a--)
      ;
    const f = a + 1;
    for (; a >= 0; a--)
      this.addInt16(this.vtable[a] != 0 ? i - this.vtable[a] : 0);
    const o = 2;
    this.addInt16(i - this.object_start);
    const c = (f + o) * Gn;
    this.addInt16(c);
    let l = 0;
    const n = this.space;
    t: for (a = 0; a < this.vtables.length; a++) {
      const t = this.bb.capacity() - this.vtables[a];
      if (c == this.bb.readInt16(t)) {
        for (let e = Gn; e < c; e += Gn)
          if (this.bb.readInt16(n + e) != this.bb.readInt16(t + e))
            continue t;
        l = this.vtables[a];
        break;
      }
    }
    return l ? (this.space = this.bb.capacity() - i, this.bb.writeInt32(this.space, l - i)) : (this.vtables.push(this.offset()), this.bb.writeInt32(this.bb.capacity() - i, this.offset() - i)), this.isNested = !1, i;
  }
  /**
   * Finalize a buffer, poiting to the given `root_table`.
   */
  finish(i, a, f) {
    const o = f ? Ja : 0;
    if (a) {
      const c = a;
      if (this.prep(this.minalign, se + ue + o), c.length != ue)
        throw new TypeError("FlatBuffers: file identifier must be length " + ue);
      for (let l = ue - 1; l >= 0; l--)
        this.writeInt8(c.charCodeAt(l));
    }
    this.prep(this.minalign, se + o), this.addOffset(i), o && this.addInt32(this.bb.capacity() - this.space), this.bb.setPosition(this.space);
  }
  /**
   * Finalize a size prefixed buffer, pointing to the given `root_table`.
   */
  finishSizePrefixed(i, a) {
    this.finish(i, a, !0);
  }
  /**
   * This checks a required field has been set in a given table that has
   * just been constructed.
   */
  requiredField(i, a) {
    const f = this.bb.capacity() - i, o = f - this.bb.readInt32(f);
    if (!(a < this.bb.readInt16(o) && this.bb.readInt16(o + a) != 0))
      throw new TypeError("FlatBuffers: field " + a + " must be set");
  }
  /**
   * Start a new array/vector of objects.  Users usually will not call
   * this directly. The FlatBuffers compiler will create a start/end
   * method for vector types in generated code.
   *
   * @param elem_size The size of each element in the array
   * @param num_elems The number of elements in the array
   * @param alignment The alignment of the array
   */
  startVector(i, a, f) {
    this.notNested(), this.vector_num_elems = a, this.prep(se, i * a), this.prep(f, i * a);
  }
  /**
   * Finish off the creation of an array and all its elements. The array must be
   * created with `startVector`.
   *
   * @returns The offset at which the newly created array
   * starts.
   */
  endVector() {
    return this.writeInt32(this.vector_num_elems), this.offset();
  }
  /**
   * Encode the string `s` in the buffer using UTF-8. If the string passed has
   * already been seen, we return the offset of the already written string
   *
   * @param s The string to encode
   * @return The offset in the buffer where the encoded string starts
   */
  createSharedString(i) {
    if (!i)
      return 0;
    if (this.string_maps || (this.string_maps = /* @__PURE__ */ new Map()), this.string_maps.has(i))
      return this.string_maps.get(i);
    const a = this.createString(i);
    return this.string_maps.set(i, a), a;
  }
  /**
   * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
   * instead of a string, it is assumed to contain valid UTF-8 encoded data.
   *
   * @param s The string to encode
   * @return The offset in the buffer where the encoded string starts
   */
  createString(i) {
    if (i == null)
      return 0;
    let a;
    return i instanceof Uint8Array ? a = i : a = this.text_encoder.encode(i), this.addInt8(0), this.startVector(1, a.length, 1), this.bb.setPosition(this.space -= a.length), this.bb.bytes().set(a, this.space), this.endVector();
  }
  /**
   * Create a byte vector.
   *
   * @param v The bytes to add
   * @returns The offset in the buffer where the byte vector starts
   */
  createByteVector(i) {
    return i == null ? 0 : (this.startVector(1, i.length, 1), this.bb.setPosition(this.space -= i.length), this.bb.bytes().set(i, this.space), this.endVector());
  }
  /**
   * A helper function to pack an object
   *
   * @returns offset of obj
   */
  createObjectOffset(i) {
    return i === null ? 0 : typeof i == "string" ? this.createString(i) : i.pack(this);
  }
  /**
   * A helper function to pack a list of object
   *
   * @returns list of offsets of each non null object
   */
  createObjectOffsetList(i) {
    const a = [];
    for (let f = 0; f < i.length; ++f) {
      const o = i[f];
      if (o !== null)
        a.push(this.createObjectOffset(o));
      else
        throw new TypeError("FlatBuffers: Argument for createObjectOffsetList cannot contain null.");
    }
    return a;
  }
  createStructOffsetList(i, a) {
    return a(this, i.length), this.createObjectOffsetList(i.slice().reverse()), this.endVector();
  }
}
const Nu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Builder: fr,
  ByteBuffer: Dn,
  get Encoding() {
    return Jn;
  },
  FILE_IDENTIFIER_LENGTH: ue,
  SIZEOF_INT: se,
  SIZEOF_SHORT: Gn,
  SIZE_PREFIX_LENGTH: Ja,
  float32: Vs,
  float64: ks,
  int32: be,
  isLittleEndian: yn
}, Symbol.toStringTag, { value: "Module" })), j = /* @__PURE__ */ qu(Nu);
var Qe = {}, Ln = {}, ii;
function Lu() {
  if (ii) return Ln;
  ii = 1, Object.defineProperty(Ln, "__esModule", { value: !0 });
  function r(i) {
    if (i.length >= 255)
      throw new TypeError("Alphabet too long");
    const a = new Uint8Array(256);
    for (let s = 0; s < a.length; s++)
      a[s] = 255;
    for (let s = 0; s < i.length; s++) {
      const u = i.charAt(s), d = u.charCodeAt(0);
      if (a[d] !== 255)
        throw new TypeError(u + " is ambiguous");
      a[d] = s;
    }
    const f = i.length, o = i.charAt(0), c = Math.log(f) / Math.log(256), l = Math.log(256) / Math.log(f);
    function n(s) {
      if (s instanceof Uint8Array || (ArrayBuffer.isView(s) ? s = new Uint8Array(s.buffer, s.byteOffset, s.byteLength) : Array.isArray(s) && (s = Uint8Array.from(s))), !(s instanceof Uint8Array))
        throw new TypeError("Expected Uint8Array");
      if (s.length === 0)
        return "";
      let u = 0, d = 0, h = 0;
      const b = s.length;
      for (; h !== b && s[h] === 0; )
        h++, u++;
      const g = (b - h) * l + 1 >>> 0, w = new Uint8Array(g);
      for (; h !== b; ) {
        let O = s[h], R = 0;
        for (let P = g - 1; (O !== 0 || R < d) && P !== -1; P--, R++)
          O += 256 * w[P] >>> 0, w[P] = O % f >>> 0, O = O / f >>> 0;
        if (O !== 0)
          throw new Error("Non-zero carry");
        d = R, h++;
      }
      let y = g - d;
      for (; y !== g && w[y] === 0; )
        y++;
      let m = o.repeat(u);
      for (; y < g; ++y)
        m += i.charAt(w[y]);
      return m;
    }
    function t(s) {
      if (typeof s != "string")
        throw new TypeError("Expected String");
      if (s.length === 0)
        return new Uint8Array();
      let u = 0, d = 0, h = 0;
      for (; s[u] === o; )
        d++, u++;
      const b = (s.length - u) * c + 1 >>> 0, g = new Uint8Array(b);
      for (; u < s.length; ) {
        const O = s.charCodeAt(u);
        if (O > 255)
          return;
        let R = a[O];
        if (R === 255)
          return;
        let P = 0;
        for (let U = b - 1; (R !== 0 || P < h) && U !== -1; U--, P++)
          R += f * g[U] >>> 0, g[U] = R % 256 >>> 0, R = R / 256 >>> 0;
        if (R !== 0)
          throw new Error("Non-zero carry");
        h = P, u++;
      }
      let w = b - h;
      for (; w !== b && g[w] === 0; )
        w++;
      const y = new Uint8Array(d + (b - w));
      let m = d;
      for (; w !== b; )
        y[m++] = g[w++];
      return y;
    }
    function e(s) {
      const u = t(s);
      if (u)
        return u;
      throw new Error("Non-base" + f + " character");
    }
    return {
      encode: n,
      decodeUnsafe: t,
      decode: e
    };
  }
  return Ln.default = r, Ln;
}
var ai;
function Fu() {
  if (ai) return Qe;
  ai = 1;
  var r = Qe && Qe.__importDefault || function(f) {
    return f && f.__esModule ? f : { default: f };
  };
  Object.defineProperty(Qe, "__esModule", { value: !0 });
  var i = r(Lu()), a = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Qe.default = (0, i.default)(a), Qe;
}
var Rs = {}, oi;
function Qa() {
  return oi || (oi = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.ReassemblyBuffer = r.StreamError = r.MAX_CONCURRENT_STREAMS = r.MAX_TOTAL_CHUNKS = r.CHUNK_THRESHOLD = r.CHUNK_SIZE = void 0, r.CHUNK_SIZE = 256 * 1024, r.CHUNK_THRESHOLD = 512 * 1024, r.MAX_TOTAL_CHUNKS = 256, r.MAX_CONCURRENT_STREAMS = 8;
    class i extends Error {
      constructor(c) {
        super(c), this.name = "StreamError";
      }
    }
    r.StreamError = i;
    const a = 6e4;
    class f {
      constructor() {
        this.streams = /* @__PURE__ */ new Map();
      }
      receiveChunk(c, l, n, t) {
        if (n === 0)
          throw new i("total_chunks is zero");
        if (n > r.MAX_TOTAL_CHUNKS)
          throw new i(`total_chunks ${n} exceeds maximum ${r.MAX_TOTAL_CHUNKS}`);
        if (l >= n)
          throw new i(`chunk index ${l} out of range for stream ${c} (total ${n})`);
        if (this.evictStale(), !this.streams.has(c) && this.streams.size >= r.MAX_CONCURRENT_STREAMS)
          throw new i(`too many concurrent streams (${this.streams.size}), maximum is ${r.MAX_CONCURRENT_STREAMS}`);
        let e = this.streams.get(c);
        if (e || (e = {
          chunks: new Array(n).fill(null),
          total: n,
          received: 0,
          createdAt: Date.now()
        }, this.streams.set(c, e)), e.total !== n)
          throw new i(`total_chunks mismatch for stream ${c} (expected ${e.total}, got ${n})`);
        if (e.chunks[l] !== null)
          throw new i(`duplicate chunk index ${l} for stream ${c}`);
        if (e.chunks[l] = t, e.received += 1, e.received === e.total) {
          this.streams.delete(c);
          let s = 0;
          for (const h of e.chunks)
            s += h.length;
          const u = new Uint8Array(s);
          let d = 0;
          for (const h of e.chunks)
            u.set(h, d), d += h.length;
          return u;
        }
        return null;
      }
      removeStream(c) {
        return this.streams.delete(c);
      }
      evictStale() {
        const c = Date.now();
        for (const [l, n] of this.streams)
          c - n.createdAt > a && this.streams.delete(l);
      }
    }
    r.ReassemblyBuffer = f;
  })(Rs)), Rs;
}
var $ = {}, Ue = {}, W = {}, z = {}, ci;
function to() {
  if (ci) return z;
  ci = 1;
  var r = z && z.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = z && z.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = z && z.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(z, "__esModule", { value: !0 }), z.ContractCodeT = z.ContractCode = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsContractCode(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsContractCode(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    data(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    dataLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    dataArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    codeHash(n) {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    codeHashLength() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    codeHashArray() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startContractCode(n) {
      n.startObject(2);
    }
    static addData(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createDataVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDataVector(n, t) {
      n.startVector(1, t, 1);
    }
    static addCodeHash(n, t) {
      n.addFieldOffset(1, t, 0);
    }
    static createCodeHashVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startCodeHashVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endContractCode(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), n.requiredField(t, 6), t;
    }
    static createContractCode(n, t, e) {
      return o.startContractCode(n), o.addData(n, t), o.addCodeHash(n, e), o.endContractCode(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.data.bind(this), this.dataLength()), this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength()), n.codeHash = this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength());
    }
  }
  z.ContractCode = o;
  class c {
    constructor(n = [], t = []) {
      this.data = n, this.codeHash = t;
    }
    pack(n) {
      const t = o.createDataVector(n, this.data), e = o.createCodeHashVector(n, this.codeHash);
      return o.createContractCode(n, t, e);
    }
  }
  return z.ContractCodeT = c, z;
}
var X = {}, Z = {}, ui;
function je() {
  if (ui) return Z;
  ui = 1;
  var r = Z && Z.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Z && Z.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Z && Z.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Z, "__esModule", { value: !0 }), Z.ContractInstanceIdT = Z.ContractInstanceId = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsContractInstanceId(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsContractInstanceId(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    data(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    dataLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    dataArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startContractInstanceId(n) {
      n.startObject(1);
    }
    static addData(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createDataVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDataVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endContractInstanceId(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createContractInstanceId(n, t) {
      return o.startContractInstanceId(n), o.addData(n, t), o.endContractInstanceId(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  Z.ContractInstanceId = o;
  class c {
    constructor(n = []) {
      this.data = n;
    }
    pack(n) {
      const t = o.createDataVector(n, this.data);
      return o.createContractInstanceId(n, t);
    }
  }
  return Z.ContractInstanceIdT = c, Z;
}
var li;
function ie() {
  if (li) return X;
  li = 1;
  var r = X && X.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = X && X.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = X && X.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(X, "__esModule", { value: !0 }), X.ContractKeyT = X.ContractKey = void 0;
  const f = a(j), o = je();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsContractKey(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsContractKey(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    instance(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    code(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    codeLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    codeArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startContractKey(t) {
      t.startObject(2);
    }
    static addInstance(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addCode(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createCodeVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startCodeVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endContractKey(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), e;
    }
    static createContractKey(t, e, s) {
      return c.startContractKey(t), c.addInstance(t, e), c.addCode(t, s), c.endContractKey(t);
    }
    unpack() {
      return new l(this.instance() !== null ? this.instance().unpack() : null, this.bb.createScalarList(this.code.bind(this), this.codeLength()));
    }
    unpackTo(t) {
      t.instance = this.instance() !== null ? this.instance().unpack() : null, t.code = this.bb.createScalarList(this.code.bind(this), this.codeLength());
    }
  }
  X.ContractKey = c;
  class l {
    constructor(t = null, e = []) {
      this.instance = t, this.code = e;
    }
    pack(t) {
      const e = this.instance !== null ? this.instance.pack(t) : 0, s = c.createCodeVector(t, this.code);
      return c.createContractKey(t, e, s);
    }
  }
  return X.ContractKeyT = l, X;
}
var fi;
function eo() {
  if (fi) return W;
  fi = 1;
  var r = W && W.__createBinding || (Object.create ? (function(t, e, s, u) {
    u === void 0 && (u = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, u, d);
  }) : (function(t, e, s, u) {
    u === void 0 && (u = s), t[u] = e[s];
  })), i = W && W.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), a = W && W.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var u = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (u[u.length] = d);
        return u;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var u = t(e), d = 0; d < u.length; d++) u[d] !== "default" && r(s, e, u[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(W, "__esModule", { value: !0 }), W.WasmContractV1T = W.WasmContractV1 = void 0;
  const f = a(j), o = to(), c = ie();
  class l {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsWasmContractV1(e, s) {
      return (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsWasmContractV1(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    data(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new o.ContractCode()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    parameters(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? this.bb.readUint8(this.bb.__vector(this.bb_pos + s) + e) : 0;
    }
    parametersLength() {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__vector_len(this.bb_pos + e) : 0;
    }
    parametersArray() {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + e), this.bb.__vector_len(this.bb_pos + e)) : null;
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 8);
      return s ? (e || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    static startWasmContractV1(e) {
      e.startObject(3);
    }
    static addData(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static addParameters(e, s) {
      e.addFieldOffset(1, s, 0);
    }
    static createParametersVector(e, s) {
      e.startVector(1, s.length, 1);
      for (let u = s.length - 1; u >= 0; u--)
        e.addInt8(s[u]);
      return e.endVector();
    }
    static startParametersVector(e, s) {
      e.startVector(1, s, 1);
    }
    static addKey(e, s) {
      e.addFieldOffset(2, s, 0);
    }
    static endWasmContractV1(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), e.requiredField(s, 8), s;
    }
    unpack() {
      return new n(this.data() !== null ? this.data().unpack() : null, this.bb.createScalarList(this.parameters.bind(this), this.parametersLength()), this.key() !== null ? this.key().unpack() : null);
    }
    unpackTo(e) {
      e.data = this.data() !== null ? this.data().unpack() : null, e.parameters = this.bb.createScalarList(this.parameters.bind(this), this.parametersLength()), e.key = this.key() !== null ? this.key().unpack() : null;
    }
  }
  W.WasmContractV1 = l;
  class n {
    constructor(e = null, s = [], u = null) {
      this.data = e, this.parameters = s, this.key = u;
    }
    pack(e) {
      const s = this.data !== null ? this.data.pack(e) : 0, u = l.createParametersVector(e, this.parameters), d = this.key !== null ? this.key.pack(e) : 0;
      return l.startWasmContractV1(e), l.addData(e, s), l.addParameters(e, u), l.addKey(e, d), l.endWasmContractV1(e);
    }
  }
  return W.WasmContractV1T = n, W;
}
var di;
function dr() {
  if (di) return Ue;
  di = 1, Object.defineProperty(Ue, "__esModule", { value: !0 }), Ue.ContractType = void 0, Ue.unionToContractType = a, Ue.unionListToContractType = f;
  const r = eo();
  var i;
  (function(o) {
    o[o.NONE = 0] = "NONE", o[o.WasmContractV1 = 1] = "WasmContractV1";
  })(i || (Ue.ContractType = i = {}));
  function a(o, c) {
    switch (i[o]) {
      case "NONE":
        return null;
      case "WasmContractV1":
        return c(new r.WasmContractV1());
      default:
        return null;
    }
  }
  function f(o, c, l) {
    switch (i[o]) {
      case "NONE":
        return null;
      case "WasmContractV1":
        return c(l, new r.WasmContractV1());
      default:
        return null;
    }
  }
  return Ue;
}
var hi;
function as() {
  if (hi) return $;
  hi = 1;
  var r = $ && $.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = $ && $.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = $ && $.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty($, "__esModule", { value: !0 }), $.ContractContainerT = $.ContractContainer = void 0;
  const f = a(j), o = dr();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsContractContainer(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsContractContainer(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    contractType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.ContractType.NONE;
    }
    contract(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startContractContainer(t) {
      t.startObject(2);
    }
    static addContractType(t, e) {
      t.addFieldInt8(0, e, o.ContractType.NONE);
    }
    static addContract(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endContractContainer(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createContractContainer(t, e, s) {
      return c.startContractContainer(t), c.addContractType(t, e), c.addContract(t, s), c.endContractContainer(t);
    }
    unpack() {
      return new l(this.contractType(), (() => {
        const t = (0, o.unionToContractType)(this.contractType(), this.contract.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.contractType = this.contractType(), t.contract = (() => {
        const e = (0, o.unionToContractType)(this.contractType(), this.contract.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  $.ContractContainer = c;
  class l {
    constructor(t = o.ContractType.NONE, e = null) {
      this.contractType = t, this.contract = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.contract);
      return c.createContractContainer(t, this.contractType, e);
    }
  }
  return $.ContractContainerT = l, $;
}
var Y = {}, _i;
function hr() {
  if (_i) return Y;
  _i = 1;
  var r = Y && Y.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Y && Y.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Y && Y.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Y, "__esModule", { value: !0 }), Y.DeltaUpdateT = Y.DeltaUpdate = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDeltaUpdate(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDeltaUpdate(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    delta(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    deltaLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    deltaArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startDeltaUpdate(n) {
      n.startObject(1);
    }
    static addDelta(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createDeltaVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDeltaVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endDeltaUpdate(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createDeltaUpdate(n, t) {
      return o.startDeltaUpdate(n), o.addDelta(n, t), o.endDeltaUpdate(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.delta.bind(this), this.deltaLength()));
    }
    unpackTo(n) {
      n.delta = this.bb.createScalarList(this.delta.bind(this), this.deltaLength());
    }
  }
  Y.DeltaUpdate = o;
  class c {
    constructor(n = []) {
      this.delta = n;
    }
    pack(n) {
      const t = o.createDeltaVector(n, this.delta);
      return o.createDeltaUpdate(n, t);
    }
  }
  return Y.DeltaUpdateT = c, Y;
}
var J = {}, bi;
function _r() {
  if (bi) return J;
  bi = 1;
  var r = J && J.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = J && J.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = J && J.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(J, "__esModule", { value: !0 }), J.RelatedDeltaUpdateT = J.RelatedDeltaUpdate = void 0;
  const f = a(j), o = je();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedDeltaUpdate(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedDeltaUpdate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    relatedTo(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    delta(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    deltaLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    deltaArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startRelatedDeltaUpdate(t) {
      t.startObject(2);
    }
    static addRelatedTo(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addDelta(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createDeltaVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startDeltaVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endRelatedDeltaUpdate(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), t.requiredField(e, 6), e;
    }
    static createRelatedDeltaUpdate(t, e, s) {
      return c.startRelatedDeltaUpdate(t), c.addRelatedTo(t, e), c.addDelta(t, s), c.endRelatedDeltaUpdate(t);
    }
    unpack() {
      return new l(this.relatedTo() !== null ? this.relatedTo().unpack() : null, this.bb.createScalarList(this.delta.bind(this), this.deltaLength()));
    }
    unpackTo(t) {
      t.relatedTo = this.relatedTo() !== null ? this.relatedTo().unpack() : null, t.delta = this.bb.createScalarList(this.delta.bind(this), this.deltaLength());
    }
  }
  J.RelatedDeltaUpdate = c;
  class l {
    constructor(t = null, e = []) {
      this.relatedTo = t, this.delta = e;
    }
    pack(t) {
      const e = this.relatedTo !== null ? this.relatedTo.pack(t) : 0, s = c.createDeltaVector(t, this.delta);
      return c.createRelatedDeltaUpdate(t, e, s);
    }
  }
  return J.RelatedDeltaUpdateT = l, J;
}
var Q = {}, pi;
function br() {
  if (pi) return Q;
  pi = 1;
  var r = Q && Q.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Q && Q.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = Q && Q.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Q, "__esModule", { value: !0 }), Q.RelatedStateAndDeltaUpdateT = Q.RelatedStateAndDeltaUpdate = void 0;
  const f = a(j), o = je();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedStateAndDeltaUpdate(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedStateAndDeltaUpdate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    relatedTo(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    state(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    stateLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    stateArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    delta(t) {
      const e = this.bb.__offset(this.bb_pos, 8);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    deltaLength() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    deltaArray() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startRelatedStateAndDeltaUpdate(t) {
      t.startObject(3);
    }
    static addRelatedTo(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addState(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createStateVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startStateVector(t, e) {
      t.startVector(1, e, 1);
    }
    static addDelta(t, e) {
      t.addFieldOffset(2, e, 0);
    }
    static createDeltaVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startDeltaVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endRelatedStateAndDeltaUpdate(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), t.requiredField(e, 6), t.requiredField(e, 8), e;
    }
    static createRelatedStateAndDeltaUpdate(t, e, s, u) {
      return c.startRelatedStateAndDeltaUpdate(t), c.addRelatedTo(t, e), c.addState(t, s), c.addDelta(t, u), c.endRelatedStateAndDeltaUpdate(t);
    }
    unpack() {
      return new l(this.relatedTo() !== null ? this.relatedTo().unpack() : null, this.bb.createScalarList(this.state.bind(this), this.stateLength()), this.bb.createScalarList(this.delta.bind(this), this.deltaLength()));
    }
    unpackTo(t) {
      t.relatedTo = this.relatedTo() !== null ? this.relatedTo().unpack() : null, t.state = this.bb.createScalarList(this.state.bind(this), this.stateLength()), t.delta = this.bb.createScalarList(this.delta.bind(this), this.deltaLength());
    }
  }
  Q.RelatedStateAndDeltaUpdate = c;
  class l {
    constructor(t = null, e = [], s = []) {
      this.relatedTo = t, this.state = e, this.delta = s;
    }
    pack(t) {
      const e = this.relatedTo !== null ? this.relatedTo.pack(t) : 0, s = c.createStateVector(t, this.state), u = c.createDeltaVector(t, this.delta);
      return c.createRelatedStateAndDeltaUpdate(t, e, s, u);
    }
  }
  return Q.RelatedStateAndDeltaUpdateT = l, Q;
}
var tt = {}, gi;
function pr() {
  if (gi) return tt;
  gi = 1;
  var r = tt && tt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = tt && tt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = tt && tt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(tt, "__esModule", { value: !0 }), tt.RelatedStateUpdateT = tt.RelatedStateUpdate = void 0;
  const f = a(j), o = je();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedStateUpdate(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedStateUpdate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    relatedTo(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    state(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    stateLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    stateArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startRelatedStateUpdate(t) {
      t.startObject(2);
    }
    static addRelatedTo(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addState(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createStateVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startStateVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endRelatedStateUpdate(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), t.requiredField(e, 6), e;
    }
    static createRelatedStateUpdate(t, e, s) {
      return c.startRelatedStateUpdate(t), c.addRelatedTo(t, e), c.addState(t, s), c.endRelatedStateUpdate(t);
    }
    unpack() {
      return new l(this.relatedTo() !== null ? this.relatedTo().unpack() : null, this.bb.createScalarList(this.state.bind(this), this.stateLength()));
    }
    unpackTo(t) {
      t.relatedTo = this.relatedTo() !== null ? this.relatedTo().unpack() : null, t.state = this.bb.createScalarList(this.state.bind(this), this.stateLength());
    }
  }
  tt.RelatedStateUpdate = c;
  class l {
    constructor(t = null, e = []) {
      this.relatedTo = t, this.state = e;
    }
    pack(t) {
      const e = this.relatedTo !== null ? this.relatedTo.pack(t) : 0, s = c.createStateVector(t, this.state);
      return c.createRelatedStateUpdate(t, e, s);
    }
  }
  return tt.RelatedStateUpdateT = l, tt;
}
var et = {}, yi;
function gr() {
  if (yi) return et;
  yi = 1;
  var r = et && et.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = et && et.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = et && et.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(et, "__esModule", { value: !0 }), et.StateAndDeltaUpdateT = et.StateAndDeltaUpdate = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsStateAndDeltaUpdate(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsStateAndDeltaUpdate(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    state(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    stateLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    stateArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    delta(n) {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    deltaLength() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    deltaArray() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startStateAndDeltaUpdate(n) {
      n.startObject(2);
    }
    static addState(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createStateVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startStateVector(n, t) {
      n.startVector(1, t, 1);
    }
    static addDelta(n, t) {
      n.addFieldOffset(1, t, 0);
    }
    static createDeltaVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDeltaVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endStateAndDeltaUpdate(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), n.requiredField(t, 6), t;
    }
    static createStateAndDeltaUpdate(n, t, e) {
      return o.startStateAndDeltaUpdate(n), o.addState(n, t), o.addDelta(n, e), o.endStateAndDeltaUpdate(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.state.bind(this), this.stateLength()), this.bb.createScalarList(this.delta.bind(this), this.deltaLength()));
    }
    unpackTo(n) {
      n.state = this.bb.createScalarList(this.state.bind(this), this.stateLength()), n.delta = this.bb.createScalarList(this.delta.bind(this), this.deltaLength());
    }
  }
  et.StateAndDeltaUpdate = o;
  class c {
    constructor(n = [], t = []) {
      this.state = n, this.delta = t;
    }
    pack(n) {
      const t = o.createStateVector(n, this.state), e = o.createDeltaVector(n, this.delta);
      return o.createStateAndDeltaUpdate(n, t, e);
    }
  }
  return et.StateAndDeltaUpdateT = c, et;
}
var nt = {}, wi;
function yr() {
  if (wi) return nt;
  wi = 1;
  var r = nt && nt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = nt && nt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = nt && nt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(nt, "__esModule", { value: !0 }), nt.StateUpdateT = nt.StateUpdate = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsStateUpdate(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsStateUpdate(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    state(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    stateLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    stateArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startStateUpdate(n) {
      n.startObject(1);
    }
    static addState(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createStateVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startStateVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endStateUpdate(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createStateUpdate(n, t) {
      return o.startStateUpdate(n), o.addState(n, t), o.endStateUpdate(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.state.bind(this), this.stateLength()));
    }
    unpackTo(n) {
      n.state = this.bb.createScalarList(this.state.bind(this), this.stateLength());
    }
  }
  nt.StateUpdate = o;
  class c {
    constructor(n = []) {
      this.state = n;
    }
    pack(n) {
      const t = o.createStateVector(n, this.state);
      return o.createStateUpdate(n, t);
    }
  }
  return nt.StateUpdateT = c, nt;
}
var Ts = {}, st = {}, rt = {}, mi;
function os() {
  if (mi) return rt;
  mi = 1;
  var r = rt && rt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = rt && rt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = rt && rt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(rt, "__esModule", { value: !0 }), rt.DelegateKeyT = rt.DelegateKey = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDelegateKey(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDelegateKey(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    key(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    keyLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    keyArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    codeHash(n) {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    codeHashLength() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    codeHashArray() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startDelegateKey(n) {
      n.startObject(2);
    }
    static addKey(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createKeyVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startKeyVector(n, t) {
      n.startVector(1, t, 1);
    }
    static addCodeHash(n, t) {
      n.addFieldOffset(1, t, 0);
    }
    static createCodeHashVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startCodeHashVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endDelegateKey(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), n.requiredField(t, 6), t;
    }
    static createDelegateKey(n, t, e) {
      return o.startDelegateKey(n), o.addKey(n, t), o.addCodeHash(n, e), o.endDelegateKey(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.key.bind(this), this.keyLength()), this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength()));
    }
    unpackTo(n) {
      n.key = this.bb.createScalarList(this.key.bind(this), this.keyLength()), n.codeHash = this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength());
    }
  }
  rt.DelegateKey = o;
  class c {
    constructor(n = [], t = []) {
      this.key = n, this.codeHash = t;
    }
    pack(n) {
      const t = o.createKeyVector(n, this.key), e = o.createCodeHashVector(n, this.codeHash);
      return o.createDelegateKey(n, t, e);
    }
  }
  return rt.DelegateKeyT = c, rt;
}
var it = {}, Me = {}, at = {}, ot = {}, vi;
function no() {
  if (vi) return ot;
  vi = 1;
  var r = ot && ot.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = ot && ot.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = ot && ot.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(ot, "__esModule", { value: !0 }), ot.ClientResponseT = ot.ClientResponse = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsClientResponse(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsClientResponse(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    data(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    dataLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    dataArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startClientResponse(n) {
      n.startObject(1);
    }
    static addData(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createDataVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDataVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endClientResponse(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createClientResponse(n, t) {
      return o.startClientResponse(n), o.addData(n, t), o.endClientResponse(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  ot.ClientResponse = o;
  class c {
    constructor(n = []) {
      this.data = n;
    }
    pack(n) {
      const t = o.createDataVector(n, this.data);
      return o.createClientResponse(n, t);
    }
  }
  return ot.ClientResponseT = c, ot;
}
var Oi;
function so() {
  if (Oi) return at;
  Oi = 1;
  var r = at && at.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = at && at.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = at && at.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(at, "__esModule", { value: !0 }), at.UserInputResponseT = at.UserInputResponse = void 0;
  const f = a(j), o = no();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUserInputResponse(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUserInputResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    requestId() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint32(this.bb_pos + t) : 0;
    }
    response(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? (t || new o.ClientResponse()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    delegateContext(t) {
      const e = this.bb.__offset(this.bb_pos, 8);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    delegateContextLength() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    delegateContextArray() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startUserInputResponse(t) {
      t.startObject(3);
    }
    static addRequestId(t, e) {
      t.addFieldInt32(0, e, 0);
    }
    static addResponse(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static addDelegateContext(t, e) {
      t.addFieldOffset(2, e, 0);
    }
    static createDelegateContextVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startDelegateContextVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endUserInputResponse(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), t.requiredField(e, 8), e;
    }
    unpack() {
      return new l(this.requestId(), this.response() !== null ? this.response().unpack() : null, this.bb.createScalarList(this.delegateContext.bind(this), this.delegateContextLength()));
    }
    unpackTo(t) {
      t.requestId = this.requestId(), t.response = this.response() !== null ? this.response().unpack() : null, t.delegateContext = this.bb.createScalarList(this.delegateContext.bind(this), this.delegateContextLength());
    }
  }
  at.UserInputResponse = c;
  class l {
    constructor(t = 0, e = null, s = []) {
      this.requestId = t, this.response = e, this.delegateContext = s;
    }
    pack(t) {
      const e = this.response !== null ? this.response.pack(t) : 0, s = c.createDelegateContextVector(t, this.delegateContext);
      return c.startUserInputResponse(t), c.addRequestId(t, this.requestId), c.addResponse(t, e), c.addDelegateContext(t, s), c.endUserInputResponse(t);
    }
  }
  return at.UserInputResponseT = l, at;
}
var ct = {}, Ri;
function wr() {
  if (Ri) return ct;
  Ri = 1;
  var r = ct && ct.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = ct && ct.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = ct && ct.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(ct, "__esModule", { value: !0 }), ct.ApplicationMessageT = ct.ApplicationMessage = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsApplicationMessage(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsApplicationMessage(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    payload(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    payloadLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    payloadArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    context(n) {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    contextLength() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    contextArray() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    processed() {
      const n = this.bb.__offset(this.bb_pos, 8);
      return n ? !!this.bb.readInt8(this.bb_pos + n) : !1;
    }
    static startApplicationMessage(n) {
      n.startObject(3);
    }
    static addPayload(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createPayloadVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startPayloadVector(n, t) {
      n.startVector(1, t, 1);
    }
    static addContext(n, t) {
      n.addFieldOffset(1, t, 0);
    }
    static createContextVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startContextVector(n, t) {
      n.startVector(1, t, 1);
    }
    static addProcessed(n, t) {
      n.addFieldInt8(2, +t, 0);
    }
    static endApplicationMessage(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), n.requiredField(t, 6), t;
    }
    static createApplicationMessage(n, t, e, s) {
      return o.startApplicationMessage(n), o.addPayload(n, t), o.addContext(n, e), o.addProcessed(n, s), o.endApplicationMessage(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.payload.bind(this), this.payloadLength()), this.bb.createScalarList(this.context.bind(this), this.contextLength()), this.processed());
    }
    unpackTo(n) {
      n.payload = this.bb.createScalarList(this.payload.bind(this), this.payloadLength()), n.context = this.bb.createScalarList(this.context.bind(this), this.contextLength()), n.processed = this.processed();
    }
  }
  ct.ApplicationMessage = o;
  class c {
    constructor(n = [], t = [], e = !1) {
      this.payload = n, this.context = t, this.processed = e;
    }
    pack(n) {
      const t = o.createPayloadVector(n, this.payload), e = o.createContextVector(n, this.context);
      return o.createApplicationMessage(n, t, e, this.processed);
    }
  }
  return ct.ApplicationMessageT = c, ct;
}
var Ti;
function ro() {
  if (Ti) return Me;
  Ti = 1, Object.defineProperty(Me, "__esModule", { value: !0 }), Me.InboundDelegateMsgType = void 0, Me.unionToInboundDelegateMsgType = f, Me.unionListToInboundDelegateMsgType = o;
  const r = so(), i = wr();
  var a;
  (function(c) {
    c[c.NONE = 0] = "NONE", c[c.common_ApplicationMessage = 1] = "common_ApplicationMessage", c[c.UserInputResponse = 2] = "UserInputResponse";
  })(a || (Me.InboundDelegateMsgType = a = {}));
  function f(c, l) {
    switch (a[c]) {
      case "NONE":
        return null;
      case "common_ApplicationMessage":
        return l(new i.ApplicationMessage());
      case "UserInputResponse":
        return l(new r.UserInputResponse());
      default:
        return null;
    }
  }
  function o(c, l, n) {
    switch (a[c]) {
      case "NONE":
        return null;
      case "common_ApplicationMessage":
        return l(n, new i.ApplicationMessage());
      case "UserInputResponse":
        return l(n, new r.UserInputResponse());
      default:
        return null;
    }
  }
  return Me;
}
var Di;
function io() {
  if (Di) return it;
  Di = 1;
  var r = it && it.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = it && it.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = it && it.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(it, "__esModule", { value: !0 }), it.InboundDelegateMsgT = it.InboundDelegateMsg = void 0;
  const f = a(j), o = ro();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsInboundDelegateMsg(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsInboundDelegateMsg(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    inboundType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.InboundDelegateMsgType.NONE;
    }
    inbound(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startInboundDelegateMsg(t) {
      t.startObject(2);
    }
    static addInboundType(t, e) {
      t.addFieldInt8(0, e, o.InboundDelegateMsgType.NONE);
    }
    static addInbound(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endInboundDelegateMsg(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createInboundDelegateMsg(t, e, s) {
      return c.startInboundDelegateMsg(t), c.addInboundType(t, e), c.addInbound(t, s), c.endInboundDelegateMsg(t);
    }
    unpack() {
      return new l(this.inboundType(), (() => {
        const t = (0, o.unionToInboundDelegateMsgType)(this.inboundType(), this.inbound.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.inboundType = this.inboundType(), t.inbound = (() => {
        const e = (0, o.unionToInboundDelegateMsgType)(this.inboundType(), this.inbound.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  it.InboundDelegateMsg = c;
  class l {
    constructor(t = o.InboundDelegateMsgType.NONE, e = null) {
      this.inboundType = t, this.inbound = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.inbound);
      return c.createInboundDelegateMsg(t, this.inboundType, e);
    }
  }
  return it.InboundDelegateMsgT = l, it;
}
var Si;
function ao() {
  if (Si) return st;
  Si = 1;
  var r = st && st.__createBinding || (Object.create ? (function(t, e, s, u) {
    u === void 0 && (u = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, u, d);
  }) : (function(t, e, s, u) {
    u === void 0 && (u = s), t[u] = e[s];
  })), i = st && st.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), a = st && st.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var u = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (u[u.length] = d);
        return u;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var u = t(e), d = 0; d < u.length; d++) u[d] !== "default" && r(s, e, u[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(st, "__esModule", { value: !0 }), st.ApplicationMessagesT = st.ApplicationMessages = void 0;
  const f = a(j), o = os(), c = io();
  class l {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsApplicationMessages(e, s) {
      return (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsApplicationMessages(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new o.DelegateKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    params(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? this.bb.readUint8(this.bb.__vector(this.bb_pos + s) + e) : 0;
    }
    paramsLength() {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__vector_len(this.bb_pos + e) : 0;
    }
    paramsArray() {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + e), this.bb.__vector_len(this.bb_pos + e)) : null;
    }
    inbound(e, s) {
      const u = this.bb.__offset(this.bb_pos, 8);
      return u ? (s || new c.InboundDelegateMsg()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + u) + e * 4), this.bb) : null;
    }
    inboundLength() {
      const e = this.bb.__offset(this.bb_pos, 8);
      return e ? this.bb.__vector_len(this.bb_pos + e) : 0;
    }
    static startApplicationMessages(e) {
      e.startObject(3);
    }
    static addKey(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static addParams(e, s) {
      e.addFieldOffset(1, s, 0);
    }
    static createParamsVector(e, s) {
      e.startVector(1, s.length, 1);
      for (let u = s.length - 1; u >= 0; u--)
        e.addInt8(s[u]);
      return e.endVector();
    }
    static startParamsVector(e, s) {
      e.startVector(1, s, 1);
    }
    static addInbound(e, s) {
      e.addFieldOffset(2, s, 0);
    }
    static createInboundVector(e, s) {
      e.startVector(4, s.length, 4);
      for (let u = s.length - 1; u >= 0; u--)
        e.addOffset(s[u]);
      return e.endVector();
    }
    static startInboundVector(e, s) {
      e.startVector(4, s, 4);
    }
    static endApplicationMessages(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), e.requiredField(s, 8), s;
    }
    static createApplicationMessages(e, s, u, d) {
      return l.startApplicationMessages(e), l.addKey(e, s), l.addParams(e, u), l.addInbound(e, d), l.endApplicationMessages(e);
    }
    unpack() {
      return new n(this.key() !== null ? this.key().unpack() : null, this.bb.createScalarList(this.params.bind(this), this.paramsLength()), this.bb.createObjList(this.inbound.bind(this), this.inboundLength()));
    }
    unpackTo(e) {
      e.key = this.key() !== null ? this.key().unpack() : null, e.params = this.bb.createScalarList(this.params.bind(this), this.paramsLength()), e.inbound = this.bb.createObjList(this.inbound.bind(this), this.inboundLength());
    }
  }
  st.ApplicationMessages = l;
  class n {
    constructor(e = null, s = [], u = []) {
      this.key = e, this.params = s, this.inbound = u;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, u = l.createParamsVector(e, this.params), d = l.createInboundVector(e, e.createObjectOffsetList(this.inbound));
      return l.createApplicationMessages(e, s, u, d);
    }
  }
  return st.ApplicationMessagesT = n, st;
}
var ut = {}, ji;
function oo() {
  if (ji) return ut;
  ji = 1;
  var r = ut && ut.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = ut && ut.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = ut && ut.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(ut, "__esModule", { value: !0 }), ut.AuthenticateT = ut.Authenticate = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsAuthenticate(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsAuthenticate(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    token(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.__string(this.bb_pos + t, n) : null;
    }
    static startAuthenticate(n) {
      n.startObject(1);
    }
    static addToken(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static endAuthenticate(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createAuthenticate(n, t) {
      return o.startAuthenticate(n), o.addToken(n, t), o.endAuthenticate(n);
    }
    unpack() {
      return new c(this.token());
    }
    unpackTo(n) {
      n.token = this.token();
    }
  }
  ut.Authenticate = o;
  class c {
    constructor(n = null) {
      this.token = n;
    }
    pack(n) {
      const t = this.token !== null ? n.createString(this.token) : 0;
      return o.createAuthenticate(n, t);
    }
  }
  return ut.AuthenticateT = c, ut;
}
var lt = {}, Ee = {}, ft = {}, qe = {}, dt = {}, Pi;
function co() {
  if (Pi) return dt;
  Pi = 1;
  var r = dt && dt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = dt && dt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = dt && dt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(dt, "__esModule", { value: !0 }), dt.GetT = dt.Get = void 0;
  const f = a(j), o = ie();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsGet(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsGet(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    fetchContract() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
    }
    subscribe() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
    }
    blockingSubscribe() {
      const t = this.bb.__offset(this.bb_pos, 10);
      return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
    }
    static startGet(t) {
      t.startObject(4);
    }
    static addKey(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addFetchContract(t, e) {
      t.addFieldInt8(1, +e, 0);
    }
    static addSubscribe(t, e) {
      t.addFieldInt8(2, +e, 0);
    }
    static addBlockingSubscribe(t, e) {
      t.addFieldInt8(3, +e, 0);
    }
    static endGet(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), e;
    }
    static createGet(t, e, s, u, d) {
      return c.startGet(t), c.addKey(t, e), c.addFetchContract(t, s), c.addSubscribe(t, u), c.addBlockingSubscribe(t, d), c.endGet(t);
    }
    unpack() {
      return new l(this.key() !== null ? this.key().unpack() : null, this.fetchContract(), this.subscribe(), this.blockingSubscribe());
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null, t.fetchContract = this.fetchContract(), t.subscribe = this.subscribe(), t.blockingSubscribe = this.blockingSubscribe();
    }
  }
  dt.Get = c;
  class l {
    constructor(t = null, e = !1, s = !1, u = !1) {
      this.key = t, this.fetchContract = e, this.subscribe = s, this.blockingSubscribe = u;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0;
      return c.createGet(t, e, this.fetchContract, this.subscribe, this.blockingSubscribe);
    }
  }
  return dt.GetT = l, dt;
}
var ht = {}, _t = {}, bt = {}, Ii;
function uo() {
  if (Ii) return bt;
  Ii = 1;
  var r = bt && bt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = bt && bt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = bt && bt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(bt, "__esModule", { value: !0 }), bt.RelatedContractT = bt.RelatedContract = void 0;
  const f = a(j), o = je();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedContract(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedContract(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    instanceId(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    state(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    stateLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    stateArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startRelatedContract(t) {
      t.startObject(2);
    }
    static addInstanceId(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addState(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createStateVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startStateVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endRelatedContract(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), t.requiredField(e, 6), e;
    }
    static createRelatedContract(t, e, s) {
      return c.startRelatedContract(t), c.addInstanceId(t, e), c.addState(t, s), c.endRelatedContract(t);
    }
    unpack() {
      return new l(this.instanceId() !== null ? this.instanceId().unpack() : null, this.bb.createScalarList(this.state.bind(this), this.stateLength()));
    }
    unpackTo(t) {
      t.instanceId = this.instanceId() !== null ? this.instanceId().unpack() : null, t.state = this.bb.createScalarList(this.state.bind(this), this.stateLength());
    }
  }
  bt.RelatedContract = c;
  class l {
    constructor(t = null, e = []) {
      this.instanceId = t, this.state = e;
    }
    pack(t) {
      const e = this.instanceId !== null ? this.instanceId.pack(t) : 0, s = c.createStateVector(t, this.state);
      return c.createRelatedContract(t, e, s);
    }
  }
  return bt.RelatedContractT = l, bt;
}
var Ci;
function lo() {
  if (Ci) return _t;
  Ci = 1;
  var r = _t && _t.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = _t && _t.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = _t && _t.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(_t, "__esModule", { value: !0 }), _t.RelatedContractsT = _t.RelatedContracts = void 0;
  const f = a(j), o = uo();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedContracts(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedContracts(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    contracts(t, e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new o.RelatedContract()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + s) + t * 4), this.bb) : null;
    }
    contractsLength() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    static startRelatedContracts(t) {
      t.startObject(1);
    }
    static addContracts(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static createContractsVector(t, e) {
      t.startVector(4, e.length, 4);
      for (let s = e.length - 1; s >= 0; s--)
        t.addOffset(e[s]);
      return t.endVector();
    }
    static startContractsVector(t, e) {
      t.startVector(4, e, 4);
    }
    static endRelatedContracts(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), e;
    }
    static createRelatedContracts(t, e) {
      return c.startRelatedContracts(t), c.addContracts(t, e), c.endRelatedContracts(t);
    }
    unpack() {
      return new l(this.bb.createObjList(this.contracts.bind(this), this.contractsLength()));
    }
    unpackTo(t) {
      t.contracts = this.bb.createObjList(this.contracts.bind(this), this.contractsLength());
    }
  }
  _t.RelatedContracts = c;
  class l {
    constructor(t = []) {
      this.contracts = t;
    }
    pack(t) {
      const e = c.createContractsVector(t, t.createObjectOffsetList(this.contracts));
      return c.createRelatedContracts(t, e);
    }
  }
  return _t.RelatedContractsT = l, _t;
}
var Ai;
function fo() {
  if (Ai) return ht;
  Ai = 1;
  var r = ht && ht.__createBinding || (Object.create ? (function(t, e, s, u) {
    u === void 0 && (u = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, u, d);
  }) : (function(t, e, s, u) {
    u === void 0 && (u = s), t[u] = e[s];
  })), i = ht && ht.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), a = ht && ht.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var u = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (u[u.length] = d);
        return u;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var u = t(e), d = 0; d < u.length; d++) u[d] !== "default" && r(s, e, u[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(ht, "__esModule", { value: !0 }), ht.PutT = ht.Put = void 0;
  const f = a(j), o = lo(), c = as();
  class l {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsPut(e, s) {
      return (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsPut(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    container(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new c.ContractContainer()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    wrappedState(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? this.bb.readUint8(this.bb.__vector(this.bb_pos + s) + e) : 0;
    }
    wrappedStateLength() {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__vector_len(this.bb_pos + e) : 0;
    }
    wrappedStateArray() {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + e), this.bb.__vector_len(this.bb_pos + e)) : null;
    }
    relatedContracts(e) {
      const s = this.bb.__offset(this.bb_pos, 8);
      return s ? (e || new o.RelatedContracts()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    subscribe() {
      const e = this.bb.__offset(this.bb_pos, 10);
      return e ? !!this.bb.readInt8(this.bb_pos + e) : !1;
    }
    blockingSubscribe() {
      const e = this.bb.__offset(this.bb_pos, 12);
      return e ? !!this.bb.readInt8(this.bb_pos + e) : !1;
    }
    static startPut(e) {
      e.startObject(5);
    }
    static addContainer(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static addWrappedState(e, s) {
      e.addFieldOffset(1, s, 0);
    }
    static createWrappedStateVector(e, s) {
      e.startVector(1, s.length, 1);
      for (let u = s.length - 1; u >= 0; u--)
        e.addInt8(s[u]);
      return e.endVector();
    }
    static startWrappedStateVector(e, s) {
      e.startVector(1, s, 1);
    }
    static addRelatedContracts(e, s) {
      e.addFieldOffset(2, s, 0);
    }
    static addSubscribe(e, s) {
      e.addFieldInt8(3, +s, 0);
    }
    static addBlockingSubscribe(e, s) {
      e.addFieldInt8(4, +s, 0);
    }
    static endPut(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), e.requiredField(s, 8), s;
    }
    unpack() {
      return new n(this.container() !== null ? this.container().unpack() : null, this.bb.createScalarList(this.wrappedState.bind(this), this.wrappedStateLength()), this.relatedContracts() !== null ? this.relatedContracts().unpack() : null, this.subscribe(), this.blockingSubscribe());
    }
    unpackTo(e) {
      e.container = this.container() !== null ? this.container().unpack() : null, e.wrappedState = this.bb.createScalarList(this.wrappedState.bind(this), this.wrappedStateLength()), e.relatedContracts = this.relatedContracts() !== null ? this.relatedContracts().unpack() : null, e.subscribe = this.subscribe(), e.blockingSubscribe = this.blockingSubscribe();
    }
  }
  ht.Put = l;
  class n {
    constructor(e = null, s = [], u = null, d = !1, h = !1) {
      this.container = e, this.wrappedState = s, this.relatedContracts = u, this.subscribe = d, this.blockingSubscribe = h;
    }
    pack(e) {
      const s = this.container !== null ? this.container.pack(e) : 0, u = l.createWrappedStateVector(e, this.wrappedState), d = this.relatedContracts !== null ? this.relatedContracts.pack(e) : 0;
      return l.startPut(e), l.addContainer(e, s), l.addWrappedState(e, u), l.addRelatedContracts(e, d), l.addSubscribe(e, this.subscribe), l.addBlockingSubscribe(e, this.blockingSubscribe), l.endPut(e);
    }
  }
  return ht.PutT = n, ht;
}
var pt = {}, Ui;
function ho() {
  if (Ui) return pt;
  Ui = 1;
  var r = pt && pt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = pt && pt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = pt && pt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(pt, "__esModule", { value: !0 }), pt.SubscribeT = pt.Subscribe = void 0;
  const f = a(j), o = ie();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsSubscribe(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsSubscribe(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    summary(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    summaryLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    summaryArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startSubscribe(t) {
      t.startObject(2);
    }
    static addKey(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addSummary(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createSummaryVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startSummaryVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endSubscribe(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), e;
    }
    static createSubscribe(t, e, s) {
      return c.startSubscribe(t), c.addKey(t, e), c.addSummary(t, s), c.endSubscribe(t);
    }
    unpack() {
      return new l(this.key() !== null ? this.key().unpack() : null, this.bb.createScalarList(this.summary.bind(this), this.summaryLength()));
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null, t.summary = this.bb.createScalarList(this.summary.bind(this), this.summaryLength());
    }
  }
  pt.Subscribe = c;
  class l {
    constructor(t = null, e = []) {
      this.key = t, this.summary = e;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0, s = c.createSummaryVector(t, this.summary);
      return c.createSubscribe(t, e, s);
    }
  }
  return pt.SubscribeT = l, pt;
}
var gt = {}, yt = {}, Ne = {}, Mi;
function Qn() {
  if (Mi) return Ne;
  Mi = 1, Object.defineProperty(Ne, "__esModule", { value: !0 }), Ne.UpdateDataType = void 0, Ne.unionToUpdateDataType = n, Ne.unionListToUpdateDataType = t;
  const r = hr(), i = _r(), a = br(), f = pr(), o = gr(), c = yr();
  var l;
  (function(e) {
    e[e.NONE = 0] = "NONE", e[e.StateUpdate = 1] = "StateUpdate", e[e.DeltaUpdate = 2] = "DeltaUpdate", e[e.StateAndDeltaUpdate = 3] = "StateAndDeltaUpdate", e[e.RelatedStateUpdate = 4] = "RelatedStateUpdate", e[e.RelatedDeltaUpdate = 5] = "RelatedDeltaUpdate", e[e.RelatedStateAndDeltaUpdate = 6] = "RelatedStateAndDeltaUpdate";
  })(l || (Ne.UpdateDataType = l = {}));
  function n(e, s) {
    switch (l[e]) {
      case "NONE":
        return null;
      case "StateUpdate":
        return s(new c.StateUpdate());
      case "DeltaUpdate":
        return s(new r.DeltaUpdate());
      case "StateAndDeltaUpdate":
        return s(new o.StateAndDeltaUpdate());
      case "RelatedStateUpdate":
        return s(new f.RelatedStateUpdate());
      case "RelatedDeltaUpdate":
        return s(new i.RelatedDeltaUpdate());
      case "RelatedStateAndDeltaUpdate":
        return s(new a.RelatedStateAndDeltaUpdate());
      default:
        return null;
    }
  }
  function t(e, s, u) {
    switch (l[e]) {
      case "NONE":
        return null;
      case "StateUpdate":
        return s(u, new c.StateUpdate());
      case "DeltaUpdate":
        return s(u, new r.DeltaUpdate());
      case "StateAndDeltaUpdate":
        return s(u, new o.StateAndDeltaUpdate());
      case "RelatedStateUpdate":
        return s(u, new f.RelatedStateUpdate());
      case "RelatedDeltaUpdate":
        return s(u, new i.RelatedDeltaUpdate());
      case "RelatedStateAndDeltaUpdate":
        return s(u, new a.RelatedStateAndDeltaUpdate());
      default:
        return null;
    }
  }
  return Ne;
}
var Ei;
function cs() {
  if (Ei) return yt;
  Ei = 1;
  var r = yt && yt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = yt && yt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = yt && yt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(yt, "__esModule", { value: !0 }), yt.UpdateDataT = yt.UpdateData = void 0;
  const f = a(j), o = Qn();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUpdateData(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUpdateData(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    updateDataType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.UpdateDataType.NONE;
    }
    updateData(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startUpdateData(t) {
      t.startObject(2);
    }
    static addUpdateDataType(t, e) {
      t.addFieldInt8(0, e, o.UpdateDataType.NONE);
    }
    static addUpdateData(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endUpdateData(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createUpdateData(t, e, s) {
      return c.startUpdateData(t), c.addUpdateDataType(t, e), c.addUpdateData(t, s), c.endUpdateData(t);
    }
    unpack() {
      return new l(this.updateDataType(), (() => {
        const t = (0, o.unionToUpdateDataType)(this.updateDataType(), this.updateData.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.updateDataType = this.updateDataType(), t.updateData = (() => {
        const e = (0, o.unionToUpdateDataType)(this.updateDataType(), this.updateData.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  yt.UpdateData = c;
  class l {
    constructor(t = o.UpdateDataType.NONE, e = null) {
      this.updateDataType = t, this.updateData = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.updateData);
      return c.createUpdateData(t, this.updateDataType, e);
    }
  }
  return yt.UpdateDataT = l, yt;
}
var qi;
function _o() {
  if (qi) return gt;
  qi = 1;
  var r = gt && gt.__createBinding || (Object.create ? (function(t, e, s, u) {
    u === void 0 && (u = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, u, d);
  }) : (function(t, e, s, u) {
    u === void 0 && (u = s), t[u] = e[s];
  })), i = gt && gt.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), a = gt && gt.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var u = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (u[u.length] = d);
        return u;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var u = t(e), d = 0; d < u.length; d++) u[d] !== "default" && r(s, e, u[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(gt, "__esModule", { value: !0 }), gt.UpdateT = gt.Update = void 0;
  const f = a(j), o = ie(), c = cs();
  class l {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsUpdate(e, s) {
      return (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsUpdate(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new o.ContractKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    data(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? (e || new c.UpdateData()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    static startUpdate(e) {
      e.startObject(2);
    }
    static addKey(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static addData(e, s) {
      e.addFieldOffset(1, s, 0);
    }
    static endUpdate(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), s;
    }
    unpack() {
      return new n(this.key() !== null ? this.key().unpack() : null, this.data() !== null ? this.data().unpack() : null);
    }
    unpackTo(e) {
      e.key = this.key() !== null ? this.key().unpack() : null, e.data = this.data() !== null ? this.data().unpack() : null;
    }
  }
  gt.Update = l;
  class n {
    constructor(e = null, s = null) {
      this.key = e, this.data = s;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, u = this.data !== null ? this.data.pack(e) : 0;
      return l.startUpdate(e), l.addKey(e, s), l.addData(e, u), l.endUpdate(e);
    }
  }
  return gt.UpdateT = n, gt;
}
var Ni;
function bo() {
  if (Ni) return qe;
  Ni = 1, Object.defineProperty(qe, "__esModule", { value: !0 }), qe.ContractRequestType = void 0, qe.unionToContractRequestType = c, qe.unionListToContractRequestType = l;
  const r = co(), i = fo(), a = ho(), f = _o();
  var o;
  (function(n) {
    n[n.NONE = 0] = "NONE", n[n.Put = 1] = "Put", n[n.Update = 2] = "Update", n[n.Get = 3] = "Get", n[n.Subscribe = 4] = "Subscribe";
  })(o || (qe.ContractRequestType = o = {}));
  function c(n, t) {
    switch (o[n]) {
      case "NONE":
        return null;
      case "Put":
        return t(new i.Put());
      case "Update":
        return t(new f.Update());
      case "Get":
        return t(new r.Get());
      case "Subscribe":
        return t(new a.Subscribe());
      default:
        return null;
    }
  }
  function l(n, t, e) {
    switch (o[n]) {
      case "NONE":
        return null;
      case "Put":
        return t(e, new i.Put());
      case "Update":
        return t(e, new f.Update());
      case "Get":
        return t(e, new r.Get());
      case "Subscribe":
        return t(e, new a.Subscribe());
      default:
        return null;
    }
  }
  return qe;
}
var Li;
function po() {
  if (Li) return ft;
  Li = 1;
  var r = ft && ft.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = ft && ft.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = ft && ft.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(ft, "__esModule", { value: !0 }), ft.ContractRequestT = ft.ContractRequest = void 0;
  const f = a(j), o = bo();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsContractRequest(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsContractRequest(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    contractRequestType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.ContractRequestType.NONE;
    }
    contractRequest(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startContractRequest(t) {
      t.startObject(2);
    }
    static addContractRequestType(t, e) {
      t.addFieldInt8(0, e, o.ContractRequestType.NONE);
    }
    static addContractRequest(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endContractRequest(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createContractRequest(t, e, s) {
      return c.startContractRequest(t), c.addContractRequestType(t, e), c.addContractRequest(t, s), c.endContractRequest(t);
    }
    unpack() {
      return new l(this.contractRequestType(), (() => {
        const t = (0, o.unionToContractRequestType)(this.contractRequestType(), this.contractRequest.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.contractRequestType = this.contractRequestType(), t.contractRequest = (() => {
        const e = (0, o.unionToContractRequestType)(this.contractRequestType(), this.contractRequest.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  ft.ContractRequest = c;
  class l {
    constructor(t = o.ContractRequestType.NONE, e = null) {
      this.contractRequestType = t, this.contractRequest = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.contractRequest);
      return c.createContractRequest(t, this.contractRequestType, e);
    }
  }
  return ft.ContractRequestT = l, ft;
}
var wt = {}, Le = {}, mt = {}, vt = {}, Fe = {}, Ot = {}, Rt = {}, Fi;
function go() {
  if (Fi) return Rt;
  Fi = 1;
  var r = Rt && Rt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Rt && Rt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Rt && Rt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Rt, "__esModule", { value: !0 }), Rt.DelegateCodeT = Rt.DelegateCode = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDelegateCode(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDelegateCode(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    data(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    dataLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    dataArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    codeHash(n) {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    codeHashLength() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    codeHashArray() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startDelegateCode(n) {
      n.startObject(2);
    }
    static addData(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createDataVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDataVector(n, t) {
      n.startVector(1, t, 1);
    }
    static addCodeHash(n, t) {
      n.addFieldOffset(1, t, 0);
    }
    static createCodeHashVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startCodeHashVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endDelegateCode(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), n.requiredField(t, 6), t;
    }
    static createDelegateCode(n, t, e) {
      return o.startDelegateCode(n), o.addData(n, t), o.addCodeHash(n, e), o.endDelegateCode(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.data.bind(this), this.dataLength()), this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength()), n.codeHash = this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength());
    }
  }
  Rt.DelegateCode = o;
  class c {
    constructor(n = [], t = []) {
      this.data = n, this.codeHash = t;
    }
    pack(n) {
      const t = o.createDataVector(n, this.data), e = o.createCodeHashVector(n, this.codeHash);
      return o.createDelegateCode(n, t, e);
    }
  }
  return Rt.DelegateCodeT = c, Rt;
}
var Vi;
function yo() {
  if (Vi) return Ot;
  Vi = 1;
  var r = Ot && Ot.__createBinding || (Object.create ? (function(t, e, s, u) {
    u === void 0 && (u = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, u, d);
  }) : (function(t, e, s, u) {
    u === void 0 && (u = s), t[u] = e[s];
  })), i = Ot && Ot.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), a = Ot && Ot.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var u = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (u[u.length] = d);
        return u;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var u = t(e), d = 0; d < u.length; d++) u[d] !== "default" && r(s, e, u[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(Ot, "__esModule", { value: !0 }), Ot.WasmDelegateV1T = Ot.WasmDelegateV1 = void 0;
  const f = a(j), o = go(), c = os();
  class l {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsWasmDelegateV1(e, s) {
      return (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsWasmDelegateV1(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    parameters(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? this.bb.readUint8(this.bb.__vector(this.bb_pos + s) + e) : 0;
    }
    parametersLength() {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? this.bb.__vector_len(this.bb_pos + e) : 0;
    }
    parametersArray() {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + e), this.bb.__vector_len(this.bb_pos + e)) : null;
    }
    data(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? (e || new o.DelegateCode()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 8);
      return s ? (e || new c.DelegateKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    static startWasmDelegateV1(e) {
      e.startObject(3);
    }
    static addParameters(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static createParametersVector(e, s) {
      e.startVector(1, s.length, 1);
      for (let u = s.length - 1; u >= 0; u--)
        e.addInt8(s[u]);
      return e.endVector();
    }
    static startParametersVector(e, s) {
      e.startVector(1, s, 1);
    }
    static addData(e, s) {
      e.addFieldOffset(1, s, 0);
    }
    static addKey(e, s) {
      e.addFieldOffset(2, s, 0);
    }
    static endWasmDelegateV1(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), e.requiredField(s, 8), s;
    }
    unpack() {
      return new n(this.bb.createScalarList(this.parameters.bind(this), this.parametersLength()), this.data() !== null ? this.data().unpack() : null, this.key() !== null ? this.key().unpack() : null);
    }
    unpackTo(e) {
      e.parameters = this.bb.createScalarList(this.parameters.bind(this), this.parametersLength()), e.data = this.data() !== null ? this.data().unpack() : null, e.key = this.key() !== null ? this.key().unpack() : null;
    }
  }
  Ot.WasmDelegateV1 = l;
  class n {
    constructor(e = [], s = null, u = null) {
      this.parameters = e, this.data = s, this.key = u;
    }
    pack(e) {
      const s = l.createParametersVector(e, this.parameters), u = this.data !== null ? this.data.pack(e) : 0, d = this.key !== null ? this.key.pack(e) : 0;
      return l.startWasmDelegateV1(e), l.addParameters(e, s), l.addData(e, u), l.addKey(e, d), l.endWasmDelegateV1(e);
    }
  }
  return Ot.WasmDelegateV1T = n, Ot;
}
var ki;
function wo() {
  if (ki) return Fe;
  ki = 1, Object.defineProperty(Fe, "__esModule", { value: !0 }), Fe.DelegateType = void 0, Fe.unionToDelegateType = a, Fe.unionListToDelegateType = f;
  const r = yo();
  var i;
  (function(o) {
    o[o.NONE = 0] = "NONE", o[o.WasmDelegateV1 = 1] = "WasmDelegateV1";
  })(i || (Fe.DelegateType = i = {}));
  function a(o, c) {
    switch (i[o]) {
      case "NONE":
        return null;
      case "WasmDelegateV1":
        return c(new r.WasmDelegateV1());
      default:
        return null;
    }
  }
  function f(o, c, l) {
    switch (i[o]) {
      case "NONE":
        return null;
      case "WasmDelegateV1":
        return c(l, new r.WasmDelegateV1());
      default:
        return null;
    }
  }
  return Fe;
}
var Bi;
function mo() {
  if (Bi) return vt;
  Bi = 1;
  var r = vt && vt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = vt && vt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = vt && vt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(vt, "__esModule", { value: !0 }), vt.DelegateContainerT = vt.DelegateContainer = void 0;
  const f = a(j), o = wo();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsDelegateContainer(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsDelegateContainer(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    delegateType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.DelegateType.NONE;
    }
    delegate(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startDelegateContainer(t) {
      t.startObject(2);
    }
    static addDelegateType(t, e) {
      t.addFieldInt8(0, e, o.DelegateType.NONE);
    }
    static addDelegate(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endDelegateContainer(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createDelegateContainer(t, e, s) {
      return c.startDelegateContainer(t), c.addDelegateType(t, e), c.addDelegate(t, s), c.endDelegateContainer(t);
    }
    unpack() {
      return new l(this.delegateType(), (() => {
        const t = (0, o.unionToDelegateType)(this.delegateType(), this.delegate.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.delegateType = this.delegateType(), t.delegate = (() => {
        const e = (0, o.unionToDelegateType)(this.delegateType(), this.delegate.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  vt.DelegateContainer = c;
  class l {
    constructor(t = o.DelegateType.NONE, e = null) {
      this.delegateType = t, this.delegate = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.delegate);
      return c.createDelegateContainer(t, this.delegateType, e);
    }
  }
  return vt.DelegateContainerT = l, vt;
}
var Hi;
function vo() {
  if (Hi) return mt;
  Hi = 1;
  var r = mt && mt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = mt && mt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = mt && mt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(mt, "__esModule", { value: !0 }), mt.RegisterDelegateT = mt.RegisterDelegate = void 0;
  const f = a(j), o = mo();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRegisterDelegate(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRegisterDelegate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    delegate(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.DelegateContainer()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    cipher(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    cipherLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    cipherArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    nonce(t) {
      const e = this.bb.__offset(this.bb_pos, 8);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    nonceLength() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    nonceArray() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startRegisterDelegate(t) {
      t.startObject(3);
    }
    static addDelegate(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addCipher(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createCipherVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startCipherVector(t, e) {
      t.startVector(1, e, 1);
    }
    static addNonce(t, e) {
      t.addFieldOffset(2, e, 0);
    }
    static createNonceVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startNonceVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endRegisterDelegate(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), t.requiredField(e, 6), t.requiredField(e, 8), e;
    }
    static createRegisterDelegate(t, e, s, u) {
      return c.startRegisterDelegate(t), c.addDelegate(t, e), c.addCipher(t, s), c.addNonce(t, u), c.endRegisterDelegate(t);
    }
    unpack() {
      return new l(this.delegate() !== null ? this.delegate().unpack() : null, this.bb.createScalarList(this.cipher.bind(this), this.cipherLength()), this.bb.createScalarList(this.nonce.bind(this), this.nonceLength()));
    }
    unpackTo(t) {
      t.delegate = this.delegate() !== null ? this.delegate().unpack() : null, t.cipher = this.bb.createScalarList(this.cipher.bind(this), this.cipherLength()), t.nonce = this.bb.createScalarList(this.nonce.bind(this), this.nonceLength());
    }
  }
  mt.RegisterDelegate = c;
  class l {
    constructor(t = null, e = [], s = []) {
      this.delegate = t, this.cipher = e, this.nonce = s;
    }
    pack(t) {
      const e = this.delegate !== null ? this.delegate.pack(t) : 0, s = c.createCipherVector(t, this.cipher), u = c.createNonceVector(t, this.nonce);
      return c.createRegisterDelegate(t, e, s, u);
    }
  }
  return mt.RegisterDelegateT = l, mt;
}
var Tt = {}, Ki;
function Oo() {
  if (Ki) return Tt;
  Ki = 1;
  var r = Tt && Tt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Tt && Tt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = Tt && Tt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.UnregisterDelegateT = Tt.UnregisterDelegate = void 0;
  const f = a(j), o = os();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUnregisterDelegate(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUnregisterDelegate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.DelegateKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    static startUnregisterDelegate(t) {
      t.startObject(1);
    }
    static addKey(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static endUnregisterDelegate(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), e;
    }
    static createUnregisterDelegate(t, e) {
      return c.startUnregisterDelegate(t), c.addKey(t, e), c.endUnregisterDelegate(t);
    }
    unpack() {
      return new l(this.key() !== null ? this.key().unpack() : null);
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null;
    }
  }
  Tt.UnregisterDelegate = c;
  class l {
    constructor(t = null) {
      this.key = t;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0;
      return c.createUnregisterDelegate(t, e);
    }
  }
  return Tt.UnregisterDelegateT = l, Tt;
}
var Gi;
function Ro() {
  if (Gi) return Le;
  Gi = 1, Object.defineProperty(Le, "__esModule", { value: !0 }), Le.DelegateRequestType = void 0, Le.unionToDelegateRequestType = o, Le.unionListToDelegateRequestType = c;
  const r = ao(), i = vo(), a = Oo();
  var f;
  (function(l) {
    l[l.NONE = 0] = "NONE", l[l.ApplicationMessages = 1] = "ApplicationMessages", l[l.RegisterDelegate = 2] = "RegisterDelegate", l[l.UnregisterDelegate = 3] = "UnregisterDelegate";
  })(f || (Le.DelegateRequestType = f = {}));
  function o(l, n) {
    switch (f[l]) {
      case "NONE":
        return null;
      case "ApplicationMessages":
        return n(new r.ApplicationMessages());
      case "RegisterDelegate":
        return n(new i.RegisterDelegate());
      case "UnregisterDelegate":
        return n(new a.UnregisterDelegate());
      default:
        return null;
    }
  }
  function c(l, n, t) {
    switch (f[l]) {
      case "NONE":
        return null;
      case "ApplicationMessages":
        return n(t, new r.ApplicationMessages());
      case "RegisterDelegate":
        return n(t, new i.RegisterDelegate());
      case "UnregisterDelegate":
        return n(t, new a.UnregisterDelegate());
      default:
        return null;
    }
  }
  return Le;
}
var xi;
function To() {
  if (xi) return wt;
  xi = 1;
  var r = wt && wt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = wt && wt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = wt && wt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(wt, "__esModule", { value: !0 }), wt.DelegateRequestT = wt.DelegateRequest = void 0;
  const f = a(j), o = Ro();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsDelegateRequest(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsDelegateRequest(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    delegateRequestType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.DelegateRequestType.NONE;
    }
    delegateRequest(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startDelegateRequest(t) {
      t.startObject(2);
    }
    static addDelegateRequestType(t, e) {
      t.addFieldInt8(0, e, o.DelegateRequestType.NONE);
    }
    static addDelegateRequest(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endDelegateRequest(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createDelegateRequest(t, e, s) {
      return c.startDelegateRequest(t), c.addDelegateRequestType(t, e), c.addDelegateRequest(t, s), c.endDelegateRequest(t);
    }
    unpack() {
      return new l(this.delegateRequestType(), (() => {
        const t = (0, o.unionToDelegateRequestType)(this.delegateRequestType(), this.delegateRequest.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.delegateRequestType = this.delegateRequestType(), t.delegateRequest = (() => {
        const e = (0, o.unionToDelegateRequestType)(this.delegateRequestType(), this.delegateRequest.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  wt.DelegateRequest = c;
  class l {
    constructor(t = o.DelegateRequestType.NONE, e = null) {
      this.delegateRequestType = t, this.delegateRequest = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.delegateRequest);
      return c.createDelegateRequest(t, this.delegateRequestType, e);
    }
  }
  return wt.DelegateRequestT = l, wt;
}
var Dt = {}, $i;
function Do() {
  if ($i) return Dt;
  $i = 1;
  var r = Dt && Dt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Dt && Dt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Dt && Dt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Dt, "__esModule", { value: !0 }), Dt.DisconnectT = Dt.Disconnect = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDisconnect(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDisconnect(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    cause(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.__string(this.bb_pos + t, n) : null;
    }
    static startDisconnect(n) {
      n.startObject(1);
    }
    static addCause(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static endDisconnect(n) {
      return n.endObject();
    }
    static createDisconnect(n, t) {
      return o.startDisconnect(n), o.addCause(n, t), o.endDisconnect(n);
    }
    unpack() {
      return new c(this.cause());
    }
    unpackTo(n) {
      n.cause = this.cause();
    }
  }
  Dt.Disconnect = o;
  class c {
    constructor(n = null) {
      this.cause = n;
    }
    pack(n) {
      const t = this.cause !== null ? n.createString(this.cause) : 0;
      return o.createDisconnect(n, t);
    }
  }
  return Dt.DisconnectT = c, Dt;
}
var St = {}, Wi;
function mr() {
  if (Wi) return St;
  Wi = 1;
  var r = St && St.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = St && St.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = St && St.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(St, "__esModule", { value: !0 }), St.StreamChunkT = St.StreamChunk = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsStreamChunk(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsStreamChunk(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    streamId() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.readUint32(this.bb_pos + n) : 0;
    }
    index() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.readUint32(this.bb_pos + n) : 0;
    }
    total() {
      const n = this.bb.__offset(this.bb_pos, 8);
      return n ? this.bb.readUint32(this.bb_pos + n) : 0;
    }
    data(n) {
      const t = this.bb.__offset(this.bb_pos, 10);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    dataLength() {
      const n = this.bb.__offset(this.bb_pos, 10);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    dataArray() {
      const n = this.bb.__offset(this.bb_pos, 10);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startStreamChunk(n) {
      n.startObject(4);
    }
    static addStreamId(n, t) {
      n.addFieldInt32(0, t, 0);
    }
    static addIndex(n, t) {
      n.addFieldInt32(1, t, 0);
    }
    static addTotal(n, t) {
      n.addFieldInt32(2, t, 0);
    }
    static addData(n, t) {
      n.addFieldOffset(3, t, 0);
    }
    static createDataVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDataVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endStreamChunk(n) {
      const t = n.endObject();
      return n.requiredField(t, 10), t;
    }
    static createStreamChunk(n, t, e, s, u) {
      return o.startStreamChunk(n), o.addStreamId(n, t), o.addIndex(n, e), o.addTotal(n, s), o.addData(n, u), o.endStreamChunk(n);
    }
    unpack() {
      return new c(this.streamId(), this.index(), this.total(), this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.streamId = this.streamId(), n.index = this.index(), n.total = this.total(), n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  St.StreamChunk = o;
  class c {
    constructor(n = 0, t = 0, e = 0, s = []) {
      this.streamId = n, this.index = t, this.total = e, this.data = s;
    }
    pack(n) {
      const t = o.createDataVector(n, this.data);
      return o.createStreamChunk(n, this.streamId, this.index, this.total, t);
    }
  }
  return St.StreamChunkT = c, St;
}
var zi;
function So() {
  if (zi) return Ee;
  zi = 1, Object.defineProperty(Ee, "__esModule", { value: !0 }), Ee.ClientRequestType = void 0, Ee.unionToClientRequestType = l, Ee.unionListToClientRequestType = n;
  const r = oo(), i = po(), a = To(), f = Do(), o = mr();
  var c;
  (function(t) {
    t[t.NONE = 0] = "NONE", t[t.ContractRequest = 1] = "ContractRequest", t[t.DelegateRequest = 2] = "DelegateRequest", t[t.Disconnect = 3] = "Disconnect", t[t.Authenticate = 4] = "Authenticate", t[t.StreamChunk = 5] = "StreamChunk";
  })(c || (Ee.ClientRequestType = c = {}));
  function l(t, e) {
    switch (c[t]) {
      case "NONE":
        return null;
      case "ContractRequest":
        return e(new i.ContractRequest());
      case "DelegateRequest":
        return e(new a.DelegateRequest());
      case "Disconnect":
        return e(new f.Disconnect());
      case "Authenticate":
        return e(new r.Authenticate());
      case "StreamChunk":
        return e(new o.StreamChunk());
      default:
        return null;
    }
  }
  function n(t, e, s) {
    switch (c[t]) {
      case "NONE":
        return null;
      case "ContractRequest":
        return e(s, new i.ContractRequest());
      case "DelegateRequest":
        return e(s, new a.DelegateRequest());
      case "Disconnect":
        return e(s, new f.Disconnect());
      case "Authenticate":
        return e(s, new r.Authenticate());
      case "StreamChunk":
        return e(s, new o.StreamChunk());
      default:
        return null;
    }
  }
  return Ee;
}
var Xi;
function Vu() {
  if (Xi) return lt;
  Xi = 1;
  var r = lt && lt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = lt && lt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = lt && lt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(lt, "__esModule", { value: !0 }), lt.ClientRequestT = lt.ClientRequest = void 0;
  const f = a(j), o = So();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsClientRequest(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsClientRequest(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    clientRequestType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.ClientRequestType.NONE;
    }
    clientRequest(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startClientRequest(t) {
      t.startObject(2);
    }
    static addClientRequestType(t, e) {
      t.addFieldInt8(0, e, o.ClientRequestType.NONE);
    }
    static addClientRequest(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endClientRequest(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static finishClientRequestBuffer(t, e) {
      t.finish(e);
    }
    static finishSizePrefixedClientRequestBuffer(t, e) {
      t.finish(e, void 0, !0);
    }
    static createClientRequest(t, e, s) {
      return c.startClientRequest(t), c.addClientRequestType(t, e), c.addClientRequest(t, s), c.endClientRequest(t);
    }
    unpack() {
      return new l(this.clientRequestType(), (() => {
        const t = (0, o.unionToClientRequestType)(this.clientRequestType(), this.clientRequest.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.clientRequestType = this.clientRequestType(), t.clientRequest = (() => {
        const e = (0, o.unionToClientRequestType)(this.clientRequestType(), this.clientRequest.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  lt.ClientRequest = c;
  class l {
    constructor(t = o.ClientRequestType.NONE, e = null) {
      this.clientRequestType = t, this.clientRequest = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.clientRequest);
      return c.createClientRequest(t, this.clientRequestType, e);
    }
  }
  return lt.ClientRequestT = l, lt;
}
var jt = {}, Zi;
function ku() {
  if (Zi) return jt;
  Zi = 1;
  var r = jt && jt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = jt && jt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = jt && jt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(jt, "__esModule", { value: !0 }), jt.DelegateContextT = jt.DelegateContext = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDelegateContext(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDelegateContext(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    data(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    dataLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    dataArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startDelegateContext(n) {
      n.startObject(1);
    }
    static addData(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createDataVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDataVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endDelegateContext(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createDelegateContext(n, t) {
      return o.startDelegateContext(n), o.addData(n, t), o.endDelegateContext(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  jt.DelegateContext = o;
  class c {
    constructor(n = []) {
      this.data = n;
    }
    pack(n) {
      const t = o.createDataVector(n, this.data);
      return o.createDelegateContext(n, t);
    }
  }
  return jt.DelegateContextT = c, jt;
}
var Yi;
function jo() {
  return Yi || (Yi = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.WasmDelegateV1 = r.UserInputResponseT = r.UserInputResponse = r.UpdateT = r.Update = r.UnregisterDelegateT = r.UnregisterDelegate = r.SubscribeT = r.Subscribe = r.StreamChunkT = r.StreamChunk = r.RelatedContractsT = r.RelatedContracts = r.RelatedContractT = r.RelatedContract = r.RegisterDelegateT = r.RegisterDelegate = r.PutT = r.Put = r.InboundDelegateMsgType = r.InboundDelegateMsgT = r.InboundDelegateMsg = r.GetT = r.Get = r.DisconnectT = r.Disconnect = r.DelegateType = r.DelegateRequestType = r.DelegateRequestT = r.DelegateRequest = r.DelegateKeyT = r.DelegateKey = r.DelegateContextT = r.DelegateContext = r.DelegateContainerT = r.DelegateContainer = r.DelegateCodeT = r.DelegateCode = r.ContractRequestType = r.ContractRequestT = r.ContractRequest = r.ClientResponseT = r.ClientResponse = r.ClientRequestType = r.ClientRequestT = r.ClientRequest = r.AuthenticateT = r.Authenticate = r.ApplicationMessagesT = r.ApplicationMessages = void 0, r.WasmDelegateV1T = void 0;
    var i = ao();
    Object.defineProperty(r, "ApplicationMessages", { enumerable: !0, get: function() {
      return i.ApplicationMessages;
    } }), Object.defineProperty(r, "ApplicationMessagesT", { enumerable: !0, get: function() {
      return i.ApplicationMessagesT;
    } });
    var a = oo();
    Object.defineProperty(r, "Authenticate", { enumerable: !0, get: function() {
      return a.Authenticate;
    } }), Object.defineProperty(r, "AuthenticateT", { enumerable: !0, get: function() {
      return a.AuthenticateT;
    } });
    var f = Vu();
    Object.defineProperty(r, "ClientRequest", { enumerable: !0, get: function() {
      return f.ClientRequest;
    } }), Object.defineProperty(r, "ClientRequestT", { enumerable: !0, get: function() {
      return f.ClientRequestT;
    } });
    var o = So();
    Object.defineProperty(r, "ClientRequestType", { enumerable: !0, get: function() {
      return o.ClientRequestType;
    } });
    var c = no();
    Object.defineProperty(r, "ClientResponse", { enumerable: !0, get: function() {
      return c.ClientResponse;
    } }), Object.defineProperty(r, "ClientResponseT", { enumerable: !0, get: function() {
      return c.ClientResponseT;
    } });
    var l = po();
    Object.defineProperty(r, "ContractRequest", { enumerable: !0, get: function() {
      return l.ContractRequest;
    } }), Object.defineProperty(r, "ContractRequestT", { enumerable: !0, get: function() {
      return l.ContractRequestT;
    } });
    var n = bo();
    Object.defineProperty(r, "ContractRequestType", { enumerable: !0, get: function() {
      return n.ContractRequestType;
    } });
    var t = go();
    Object.defineProperty(r, "DelegateCode", { enumerable: !0, get: function() {
      return t.DelegateCode;
    } }), Object.defineProperty(r, "DelegateCodeT", { enumerable: !0, get: function() {
      return t.DelegateCodeT;
    } });
    var e = mo();
    Object.defineProperty(r, "DelegateContainer", { enumerable: !0, get: function() {
      return e.DelegateContainer;
    } }), Object.defineProperty(r, "DelegateContainerT", { enumerable: !0, get: function() {
      return e.DelegateContainerT;
    } });
    var s = ku();
    Object.defineProperty(r, "DelegateContext", { enumerable: !0, get: function() {
      return s.DelegateContext;
    } }), Object.defineProperty(r, "DelegateContextT", { enumerable: !0, get: function() {
      return s.DelegateContextT;
    } });
    var u = os();
    Object.defineProperty(r, "DelegateKey", { enumerable: !0, get: function() {
      return u.DelegateKey;
    } }), Object.defineProperty(r, "DelegateKeyT", { enumerable: !0, get: function() {
      return u.DelegateKeyT;
    } });
    var d = To();
    Object.defineProperty(r, "DelegateRequest", { enumerable: !0, get: function() {
      return d.DelegateRequest;
    } }), Object.defineProperty(r, "DelegateRequestT", { enumerable: !0, get: function() {
      return d.DelegateRequestT;
    } });
    var h = Ro();
    Object.defineProperty(r, "DelegateRequestType", { enumerable: !0, get: function() {
      return h.DelegateRequestType;
    } });
    var b = wo();
    Object.defineProperty(r, "DelegateType", { enumerable: !0, get: function() {
      return b.DelegateType;
    } });
    var g = Do();
    Object.defineProperty(r, "Disconnect", { enumerable: !0, get: function() {
      return g.Disconnect;
    } }), Object.defineProperty(r, "DisconnectT", { enumerable: !0, get: function() {
      return g.DisconnectT;
    } });
    var w = co();
    Object.defineProperty(r, "Get", { enumerable: !0, get: function() {
      return w.Get;
    } }), Object.defineProperty(r, "GetT", { enumerable: !0, get: function() {
      return w.GetT;
    } });
    var y = io();
    Object.defineProperty(r, "InboundDelegateMsg", { enumerable: !0, get: function() {
      return y.InboundDelegateMsg;
    } }), Object.defineProperty(r, "InboundDelegateMsgT", { enumerable: !0, get: function() {
      return y.InboundDelegateMsgT;
    } });
    var m = ro();
    Object.defineProperty(r, "InboundDelegateMsgType", { enumerable: !0, get: function() {
      return m.InboundDelegateMsgType;
    } });
    var O = fo();
    Object.defineProperty(r, "Put", { enumerable: !0, get: function() {
      return O.Put;
    } }), Object.defineProperty(r, "PutT", { enumerable: !0, get: function() {
      return O.PutT;
    } });
    var R = vo();
    Object.defineProperty(r, "RegisterDelegate", { enumerable: !0, get: function() {
      return R.RegisterDelegate;
    } }), Object.defineProperty(r, "RegisterDelegateT", { enumerable: !0, get: function() {
      return R.RegisterDelegateT;
    } });
    var P = uo();
    Object.defineProperty(r, "RelatedContract", { enumerable: !0, get: function() {
      return P.RelatedContract;
    } }), Object.defineProperty(r, "RelatedContractT", { enumerable: !0, get: function() {
      return P.RelatedContractT;
    } });
    var U = lo();
    Object.defineProperty(r, "RelatedContracts", { enumerable: !0, get: function() {
      return U.RelatedContracts;
    } }), Object.defineProperty(r, "RelatedContractsT", { enumerable: !0, get: function() {
      return U.RelatedContractsT;
    } });
    var N = mr();
    Object.defineProperty(r, "StreamChunk", { enumerable: !0, get: function() {
      return N.StreamChunk;
    } }), Object.defineProperty(r, "StreamChunkT", { enumerable: !0, get: function() {
      return N.StreamChunkT;
    } });
    var L = ho();
    Object.defineProperty(r, "Subscribe", { enumerable: !0, get: function() {
      return L.Subscribe;
    } }), Object.defineProperty(r, "SubscribeT", { enumerable: !0, get: function() {
      return L.SubscribeT;
    } });
    var D = Oo();
    Object.defineProperty(r, "UnregisterDelegate", { enumerable: !0, get: function() {
      return D.UnregisterDelegate;
    } }), Object.defineProperty(r, "UnregisterDelegateT", { enumerable: !0, get: function() {
      return D.UnregisterDelegateT;
    } });
    var C = _o();
    Object.defineProperty(r, "Update", { enumerable: !0, get: function() {
      return C.Update;
    } }), Object.defineProperty(r, "UpdateT", { enumerable: !0, get: function() {
      return C.UpdateT;
    } });
    var K = so();
    Object.defineProperty(r, "UserInputResponse", { enumerable: !0, get: function() {
      return K.UserInputResponse;
    } }), Object.defineProperty(r, "UserInputResponseT", { enumerable: !0, get: function() {
      return K.UserInputResponseT;
    } });
    var F = yo();
    Object.defineProperty(r, "WasmDelegateV1", { enumerable: !0, get: function() {
      return F.WasmDelegateV1;
    } }), Object.defineProperty(r, "WasmDelegateV1T", { enumerable: !0, get: function() {
      return F.WasmDelegateV1T;
    } });
  })(Ts)), Ts;
}
var Pt = {}, Ji;
function vr() {
  if (Ji) return Pt;
  Ji = 1;
  var r = Pt && Pt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Pt && Pt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = Pt && Pt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Pt, "__esModule", { value: !0 }), Pt.PutResponseT = Pt.PutResponse = void 0;
  const f = a(j), o = ie();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsPutResponse(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsPutResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    static startPutResponse(t) {
      t.startObject(1);
    }
    static addKey(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static endPutResponse(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), e;
    }
    static createPutResponse(t, e) {
      return c.startPutResponse(t), c.addKey(t, e), c.endPutResponse(t);
    }
    unpack() {
      return new l(this.key() !== null ? this.key().unpack() : null);
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null;
    }
  }
  Pt.PutResponse = c;
  class l {
    constructor(t = null) {
      this.key = t;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0;
      return c.createPutResponse(t, e);
    }
  }
  return Pt.PutResponseT = l, Pt;
}
var It = {}, Qi;
function Or() {
  if (Qi) return It;
  Qi = 1;
  var r = It && It.__createBinding || (Object.create ? (function(t, e, s, u) {
    u === void 0 && (u = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, u, d);
  }) : (function(t, e, s, u) {
    u === void 0 && (u = s), t[u] = e[s];
  })), i = It && It.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), a = It && It.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var u = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (u[u.length] = d);
        return u;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var u = t(e), d = 0; d < u.length; d++) u[d] !== "default" && r(s, e, u[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(It, "__esModule", { value: !0 }), It.GetResponseT = It.GetResponse = void 0;
  const f = a(j), o = as(), c = ie();
  class l {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsGetResponse(e, s) {
      return (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsGetResponse(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    contract(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? (e || new o.ContractContainer()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    state(e) {
      const s = this.bb.__offset(this.bb_pos, 8);
      return s ? this.bb.readUint8(this.bb.__vector(this.bb_pos + s) + e) : 0;
    }
    stateLength() {
      const e = this.bb.__offset(this.bb_pos, 8);
      return e ? this.bb.__vector_len(this.bb_pos + e) : 0;
    }
    stateArray() {
      const e = this.bb.__offset(this.bb_pos, 8);
      return e ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + e), this.bb.__vector_len(this.bb_pos + e)) : null;
    }
    static startGetResponse(e) {
      e.startObject(3);
    }
    static addKey(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static addContract(e, s) {
      e.addFieldOffset(1, s, 0);
    }
    static addState(e, s) {
      e.addFieldOffset(2, s, 0);
    }
    static createStateVector(e, s) {
      e.startVector(1, s.length, 1);
      for (let u = s.length - 1; u >= 0; u--)
        e.addInt8(s[u]);
      return e.endVector();
    }
    static startStateVector(e, s) {
      e.startVector(1, s, 1);
    }
    static endGetResponse(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 8), s;
    }
    unpack() {
      return new n(this.key() !== null ? this.key().unpack() : null, this.contract() !== null ? this.contract().unpack() : null, this.bb.createScalarList(this.state.bind(this), this.stateLength()));
    }
    unpackTo(e) {
      e.key = this.key() !== null ? this.key().unpack() : null, e.contract = this.contract() !== null ? this.contract().unpack() : null, e.state = this.bb.createScalarList(this.state.bind(this), this.stateLength());
    }
  }
  It.GetResponse = l;
  class n {
    constructor(e = null, s = null, u = []) {
      this.key = e, this.contract = s, this.state = u;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, u = this.contract !== null ? this.contract.pack(e) : 0, d = l.createStateVector(e, this.state);
      return l.startGetResponse(e), l.addKey(e, s), l.addContract(e, u), l.addState(e, d), l.endGetResponse(e);
    }
  }
  return It.GetResponseT = n, It;
}
var Ct = {}, ta;
function Rr() {
  if (ta) return Ct;
  ta = 1;
  var r = Ct && Ct.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Ct && Ct.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = Ct && Ct.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.UpdateResponseT = Ct.UpdateResponse = void 0;
  const f = a(j), o = ie();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUpdateResponse(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUpdateResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    summary(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    summaryLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    summaryArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    static startUpdateResponse(t) {
      t.startObject(2);
    }
    static addKey(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addSummary(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createSummaryVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startSummaryVector(t, e) {
      t.startVector(1, e, 1);
    }
    static endUpdateResponse(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), t.requiredField(e, 6), e;
    }
    static createUpdateResponse(t, e, s) {
      return c.startUpdateResponse(t), c.addKey(t, e), c.addSummary(t, s), c.endUpdateResponse(t);
    }
    unpack() {
      return new l(this.key() !== null ? this.key().unpack() : null, this.bb.createScalarList(this.summary.bind(this), this.summaryLength()));
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null, t.summary = this.bb.createScalarList(this.summary.bind(this), this.summaryLength());
    }
  }
  Ct.UpdateResponse = c;
  class l {
    constructor(t = null, e = []) {
      this.key = t, this.summary = e;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0, s = c.createSummaryVector(t, this.summary);
      return c.createUpdateResponse(t, e, s);
    }
  }
  return Ct.UpdateResponseT = l, Ct;
}
var At = {}, ea;
function Tr() {
  if (ea) return At;
  ea = 1;
  var r = At && At.__createBinding || (Object.create ? (function(t, e, s, u) {
    u === void 0 && (u = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, u, d);
  }) : (function(t, e, s, u) {
    u === void 0 && (u = s), t[u] = e[s];
  })), i = At && At.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), a = At && At.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var u = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (u[u.length] = d);
        return u;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var u = t(e), d = 0; d < u.length; d++) u[d] !== "default" && r(s, e, u[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(At, "__esModule", { value: !0 }), At.UpdateNotificationT = At.UpdateNotification = void 0;
  const f = a(j), o = ie(), c = cs();
  class l {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsUpdateNotification(e, s) {
      return (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsUpdateNotification(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new o.ContractKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    update(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? (e || new c.UpdateData()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    static startUpdateNotification(e) {
      e.startObject(2);
    }
    static addKey(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static addUpdate(e, s) {
      e.addFieldOffset(1, s, 0);
    }
    static endUpdateNotification(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), s;
    }
    unpack() {
      return new n(this.key() !== null ? this.key().unpack() : null, this.update() !== null ? this.update().unpack() : null);
    }
    unpackTo(e) {
      e.key = this.key() !== null ? this.key().unpack() : null, e.update = this.update() !== null ? this.update().unpack() : null;
    }
  }
  At.UpdateNotification = l;
  class n {
    constructor(e = null, s = null) {
      this.key = e, this.update = s;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, u = this.update !== null ? this.update.pack(e) : 0;
      return l.startUpdateNotification(e), l.addKey(e, s), l.addUpdate(e, u), l.endUpdateNotification(e);
    }
  }
  return At.UpdateNotificationT = n, At;
}
var Ut = {}, Ve = {}, Mt = {}, ke = {}, Et = {}, na;
function Po() {
  if (na) return Et;
  na = 1;
  var r = Et && Et.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Et && Et.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = Et && Et.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Et, "__esModule", { value: !0 }), Et.NotFoundT = Et.NotFound = void 0;
  const f = a(j), o = je();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsNotFound(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsNotFound(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    instanceId(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    static startNotFound(t) {
      t.startObject(1);
    }
    static addInstanceId(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static endNotFound(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), e;
    }
    static createNotFound(t, e) {
      return c.startNotFound(t), c.addInstanceId(t, e), c.endNotFound(t);
    }
    unpack() {
      return new l(this.instanceId() !== null ? this.instanceId().unpack() : null);
    }
    unpackTo(t) {
      t.instanceId = this.instanceId() !== null ? this.instanceId().unpack() : null;
    }
  }
  Et.NotFound = c;
  class l {
    constructor(t = null) {
      this.instanceId = t;
    }
    pack(t) {
      const e = this.instanceId !== null ? this.instanceId.pack(t) : 0;
      return c.createNotFound(t, e);
    }
  }
  return Et.NotFoundT = l, Et;
}
var qt = {}, sa;
function Io() {
  if (sa) return qt;
  sa = 1;
  var r = qt && qt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = qt && qt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = qt && qt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(qt, "__esModule", { value: !0 }), qt.SubscribeResponseT = qt.SubscribeResponse = void 0;
  const f = a(j), o = ie();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsSubscribeResponse(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsSubscribeResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new o.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
    }
    subscribed() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
    }
    static startSubscribeResponse(t) {
      t.startObject(2);
    }
    static addKey(t, e) {
      t.addFieldOffset(0, e, 0);
    }
    static addSubscribed(t, e) {
      t.addFieldInt8(1, +e, 0);
    }
    static endSubscribeResponse(t) {
      const e = t.endObject();
      return t.requiredField(e, 4), e;
    }
    static createSubscribeResponse(t, e, s) {
      return c.startSubscribeResponse(t), c.addKey(t, e), c.addSubscribed(t, s), c.endSubscribeResponse(t);
    }
    unpack() {
      return new l(this.key() !== null ? this.key().unpack() : null, this.subscribed());
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null, t.subscribed = this.subscribed();
    }
  }
  qt.SubscribeResponse = c;
  class l {
    constructor(t = null, e = !1) {
      this.key = t, this.subscribed = e;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0;
      return c.createSubscribeResponse(t, e, this.subscribed);
    }
  }
  return qt.SubscribeResponseT = l, qt;
}
var ra;
function Co() {
  if (ra) return ke;
  ra = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.ContractResponseType = void 0, ke.unionToContractResponseType = n, ke.unionListToContractResponseType = t;
  const r = Or(), i = Po(), a = vr(), f = Io(), o = Tr(), c = Rr();
  var l;
  (function(e) {
    e[e.NONE = 0] = "NONE", e[e.GetResponse = 1] = "GetResponse", e[e.PutResponse = 2] = "PutResponse", e[e.UpdateNotification = 3] = "UpdateNotification", e[e.UpdateResponse = 4] = "UpdateResponse", e[e.NotFound = 5] = "NotFound", e[e.SubscribeResponse = 6] = "SubscribeResponse";
  })(l || (ke.ContractResponseType = l = {}));
  function n(e, s) {
    switch (l[e]) {
      case "NONE":
        return null;
      case "GetResponse":
        return s(new r.GetResponse());
      case "PutResponse":
        return s(new a.PutResponse());
      case "UpdateNotification":
        return s(new o.UpdateNotification());
      case "UpdateResponse":
        return s(new c.UpdateResponse());
      case "NotFound":
        return s(new i.NotFound());
      case "SubscribeResponse":
        return s(new f.SubscribeResponse());
      default:
        return null;
    }
  }
  function t(e, s, u) {
    switch (l[e]) {
      case "NONE":
        return null;
      case "GetResponse":
        return s(u, new r.GetResponse());
      case "PutResponse":
        return s(u, new a.PutResponse());
      case "UpdateNotification":
        return s(u, new o.UpdateNotification());
      case "UpdateResponse":
        return s(u, new c.UpdateResponse());
      case "NotFound":
        return s(u, new i.NotFound());
      case "SubscribeResponse":
        return s(u, new f.SubscribeResponse());
      default:
        return null;
    }
  }
  return ke;
}
var ia;
function Ao() {
  if (ia) return Mt;
  ia = 1;
  var r = Mt && Mt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Mt && Mt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = Mt && Mt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Mt, "__esModule", { value: !0 }), Mt.ContractResponseT = Mt.ContractResponse = void 0;
  const f = a(j), o = Co();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsContractResponse(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsContractResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    contractResponseType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.ContractResponseType.NONE;
    }
    contractResponse(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startContractResponse(t) {
      t.startObject(2);
    }
    static addContractResponseType(t, e) {
      t.addFieldInt8(0, e, o.ContractResponseType.NONE);
    }
    static addContractResponse(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endContractResponse(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createContractResponse(t, e, s) {
      return c.startContractResponse(t), c.addContractResponseType(t, e), c.addContractResponse(t, s), c.endContractResponse(t);
    }
    unpack() {
      return new l(this.contractResponseType(), (() => {
        const t = (0, o.unionToContractResponseType)(this.contractResponseType(), this.contractResponse.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.contractResponseType = this.contractResponseType(), t.contractResponse = (() => {
        const e = (0, o.unionToContractResponseType)(this.contractResponseType(), this.contractResponse.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  Mt.ContractResponse = c;
  class l {
    constructor(t = o.ContractResponseType.NONE, e = null) {
      this.contractResponseType = t, this.contractResponse = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.contractResponse);
      return c.createContractResponse(t, this.contractResponseType, e);
    }
  }
  return Mt.ContractResponseT = l, Mt;
}
var Nt = {}, Lt = {}, aa;
function Uo() {
  if (aa) return Lt;
  aa = 1;
  var r = Lt && Lt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Lt && Lt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Lt && Lt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Lt, "__esModule", { value: !0 }), Lt.DelegateKeyT = Lt.DelegateKey = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDelegateKey(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDelegateKey(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    key(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    keyLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    keyArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    codeHash(n) {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    codeHashLength() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    codeHashArray() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startDelegateKey(n) {
      n.startObject(2);
    }
    static addKey(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createKeyVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startKeyVector(n, t) {
      n.startVector(1, t, 1);
    }
    static addCodeHash(n, t) {
      n.addFieldOffset(1, t, 0);
    }
    static createCodeHashVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startCodeHashVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endDelegateKey(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), n.requiredField(t, 6), t;
    }
    static createDelegateKey(n, t, e) {
      return o.startDelegateKey(n), o.addKey(n, t), o.addCodeHash(n, e), o.endDelegateKey(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.key.bind(this), this.keyLength()), this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength()));
    }
    unpackTo(n) {
      n.key = this.bb.createScalarList(this.key.bind(this), this.keyLength()), n.codeHash = this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength());
    }
  }
  Lt.DelegateKey = o;
  class c {
    constructor(n = [], t = []) {
      this.key = n, this.codeHash = t;
    }
    pack(n) {
      const t = o.createKeyVector(n, this.key), e = o.createCodeHashVector(n, this.codeHash);
      return o.createDelegateKey(n, t, e);
    }
  }
  return Lt.DelegateKeyT = c, Lt;
}
var Ft = {}, Be = {}, Vt = {}, oa;
function Mo() {
  if (oa) return Vt;
  oa = 1;
  var r = Vt && Vt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Vt && Vt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Vt && Vt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Vt, "__esModule", { value: !0 }), Vt.ContextUpdatedT = Vt.ContextUpdated = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsContextUpdated(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsContextUpdated(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    context(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    contextLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    contextArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startContextUpdated(n) {
      n.startObject(1);
    }
    static addContext(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createContextVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startContextVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endContextUpdated(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createContextUpdated(n, t) {
      return o.startContextUpdated(n), o.addContext(n, t), o.endContextUpdated(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.context.bind(this), this.contextLength()));
    }
    unpackTo(n) {
      n.context = this.bb.createScalarList(this.context.bind(this), this.contextLength());
    }
  }
  Vt.ContextUpdated = o;
  class c {
    constructor(n = []) {
      this.context = n;
    }
    pack(n) {
      const t = o.createContextVector(n, this.context);
      return o.createContextUpdated(n, t);
    }
  }
  return Vt.ContextUpdatedT = c, Vt;
}
var kt = {}, Bt = {}, ca;
function Dr() {
  if (ca) return Bt;
  ca = 1;
  var r = Bt && Bt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Bt && Bt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Bt && Bt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Bt, "__esModule", { value: !0 }), Bt.ClientResponseT = Bt.ClientResponse = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsClientResponse(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsClientResponse(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    data(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    dataLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    dataArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startClientResponse(n) {
      n.startObject(1);
    }
    static addData(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createDataVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDataVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endClientResponse(n) {
      return n.endObject();
    }
    static createClientResponse(n, t) {
      return o.startClientResponse(n), o.addData(n, t), o.endClientResponse(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  Bt.ClientResponse = o;
  class c {
    constructor(n = []) {
      this.data = n;
    }
    pack(n) {
      const t = o.createDataVector(n, this.data);
      return o.createClientResponse(n, t);
    }
  }
  return Bt.ClientResponseT = c, Bt;
}
var ua;
function Eo() {
  if (ua) return kt;
  ua = 1;
  var r = kt && kt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = kt && kt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = kt && kt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(kt, "__esModule", { value: !0 }), kt.RequestUserInputT = kt.RequestUserInput = void 0;
  const f = a(j), o = Dr();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRequestUserInput(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRequestUserInput(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    requestId() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint32(this.bb_pos + t) : 0;
    }
    message(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    messageLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    messageArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    responses(t, e) {
      const s = this.bb.__offset(this.bb_pos, 8);
      return s ? (e || new o.ClientResponse()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + s) + t * 4), this.bb) : null;
    }
    responsesLength() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    static startRequestUserInput(t) {
      t.startObject(3);
    }
    static addRequestId(t, e) {
      t.addFieldInt32(0, e, 0);
    }
    static addMessage(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createMessageVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startMessageVector(t, e) {
      t.startVector(1, e, 1);
    }
    static addResponses(t, e) {
      t.addFieldOffset(2, e, 0);
    }
    static createResponsesVector(t, e) {
      t.startVector(4, e.length, 4);
      for (let s = e.length - 1; s >= 0; s--)
        t.addOffset(e[s]);
      return t.endVector();
    }
    static startResponsesVector(t, e) {
      t.startVector(4, e, 4);
    }
    static endRequestUserInput(t) {
      const e = t.endObject();
      return t.requiredField(e, 8), e;
    }
    static createRequestUserInput(t, e, s, u) {
      return c.startRequestUserInput(t), c.addRequestId(t, e), c.addMessage(t, s), c.addResponses(t, u), c.endRequestUserInput(t);
    }
    unpack() {
      return new l(this.requestId(), this.bb.createScalarList(this.message.bind(this), this.messageLength()), this.bb.createObjList(this.responses.bind(this), this.responsesLength()));
    }
    unpackTo(t) {
      t.requestId = this.requestId(), t.message = this.bb.createScalarList(this.message.bind(this), this.messageLength()), t.responses = this.bb.createObjList(this.responses.bind(this), this.responsesLength());
    }
  }
  kt.RequestUserInput = c;
  class l {
    constructor(t = 0, e = [], s = []) {
      this.requestId = t, this.message = e, this.responses = s;
    }
    pack(t) {
      const e = c.createMessageVector(t, this.message), s = c.createResponsesVector(t, t.createObjectOffsetList(this.responses));
      return c.createRequestUserInput(t, this.requestId, e, s);
    }
  }
  return kt.RequestUserInputT = l, kt;
}
var la;
function qo() {
  if (la) return Be;
  la = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.OutboundDelegateMsgType = void 0, Be.unionToOutboundDelegateMsgType = o, Be.unionListToOutboundDelegateMsgType = c;
  const r = wr(), i = Mo(), a = Eo();
  var f;
  (function(l) {
    l[l.NONE = 0] = "NONE", l[l.common_ApplicationMessage = 1] = "common_ApplicationMessage", l[l.RequestUserInput = 2] = "RequestUserInput", l[l.ContextUpdated = 3] = "ContextUpdated";
  })(f || (Be.OutboundDelegateMsgType = f = {}));
  function o(l, n) {
    switch (f[l]) {
      case "NONE":
        return null;
      case "common_ApplicationMessage":
        return n(new r.ApplicationMessage());
      case "RequestUserInput":
        return n(new a.RequestUserInput());
      case "ContextUpdated":
        return n(new i.ContextUpdated());
      default:
        return null;
    }
  }
  function c(l, n, t) {
    switch (f[l]) {
      case "NONE":
        return null;
      case "common_ApplicationMessage":
        return n(t, new r.ApplicationMessage());
      case "RequestUserInput":
        return n(t, new a.RequestUserInput());
      case "ContextUpdated":
        return n(t, new i.ContextUpdated());
      default:
        return null;
    }
  }
  return Be;
}
var fa;
function No() {
  if (fa) return Ft;
  fa = 1;
  var r = Ft && Ft.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Ft && Ft.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = Ft && Ft.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.OutboundDelegateMsgT = Ft.OutboundDelegateMsg = void 0;
  const f = a(j), o = qo();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsOutboundDelegateMsg(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsOutboundDelegateMsg(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    inboundType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.OutboundDelegateMsgType.NONE;
    }
    inbound(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startOutboundDelegateMsg(t) {
      t.startObject(2);
    }
    static addInboundType(t, e) {
      t.addFieldInt8(0, e, o.OutboundDelegateMsgType.NONE);
    }
    static addInbound(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endOutboundDelegateMsg(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createOutboundDelegateMsg(t, e, s) {
      return c.startOutboundDelegateMsg(t), c.addInboundType(t, e), c.addInbound(t, s), c.endOutboundDelegateMsg(t);
    }
    unpack() {
      return new l(this.inboundType(), (() => {
        const t = (0, o.unionToOutboundDelegateMsgType)(this.inboundType(), this.inbound.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.inboundType = this.inboundType(), t.inbound = (() => {
        const e = (0, o.unionToOutboundDelegateMsgType)(this.inboundType(), this.inbound.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  Ft.OutboundDelegateMsg = c;
  class l {
    constructor(t = o.OutboundDelegateMsgType.NONE, e = null) {
      this.inboundType = t, this.inbound = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.inbound);
      return c.createOutboundDelegateMsg(t, this.inboundType, e);
    }
  }
  return Ft.OutboundDelegateMsgT = l, Ft;
}
var da;
function Lo() {
  if (da) return Nt;
  da = 1;
  var r = Nt && Nt.__createBinding || (Object.create ? (function(t, e, s, u) {
    u === void 0 && (u = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, u, d);
  }) : (function(t, e, s, u) {
    u === void 0 && (u = s), t[u] = e[s];
  })), i = Nt && Nt.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), a = Nt && Nt.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var u = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (u[u.length] = d);
        return u;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var u = t(e), d = 0; d < u.length; d++) u[d] !== "default" && r(s, e, u[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.DelegateResponseT = Nt.DelegateResponse = void 0;
  const f = a(j), o = Uo(), c = No();
  class l {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsDelegateResponse(e, s) {
      return (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsDelegateResponse(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new l()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new o.DelegateKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    values(e, s) {
      const u = this.bb.__offset(this.bb_pos, 6);
      return u ? (s || new c.OutboundDelegateMsg()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + u) + e * 4), this.bb) : null;
    }
    valuesLength() {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__vector_len(this.bb_pos + e) : 0;
    }
    static startDelegateResponse(e) {
      e.startObject(2);
    }
    static addKey(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static addValues(e, s) {
      e.addFieldOffset(1, s, 0);
    }
    static createValuesVector(e, s) {
      e.startVector(4, s.length, 4);
      for (let u = s.length - 1; u >= 0; u--)
        e.addOffset(s[u]);
      return e.endVector();
    }
    static startValuesVector(e, s) {
      e.startVector(4, s, 4);
    }
    static endDelegateResponse(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), s;
    }
    static createDelegateResponse(e, s, u) {
      return l.startDelegateResponse(e), l.addKey(e, s), l.addValues(e, u), l.endDelegateResponse(e);
    }
    unpack() {
      return new n(this.key() !== null ? this.key().unpack() : null, this.bb.createObjList(this.values.bind(this), this.valuesLength()));
    }
    unpackTo(e) {
      e.key = this.key() !== null ? this.key().unpack() : null, e.values = this.bb.createObjList(this.values.bind(this), this.valuesLength());
    }
  }
  Nt.DelegateResponse = l;
  class n {
    constructor(e = null, s = []) {
      this.key = e, this.values = s;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, u = l.createValuesVector(e, e.createObjectOffsetList(this.values));
      return l.createDelegateResponse(e, s, u);
    }
  }
  return Nt.DelegateResponseT = n, Nt;
}
var Ht = {}, ha;
function Fo() {
  if (ha) return Ht;
  ha = 1;
  var r = Ht && Ht.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Ht && Ht.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Ht && Ht.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Ht, "__esModule", { value: !0 }), Ht.ErrorT = Ht.Error = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsError(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsError(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    msg(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.__string(this.bb_pos + t, n) : null;
    }
    static startError(n) {
      n.startObject(1);
    }
    static addMsg(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static endError(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createError(n, t) {
      return o.startError(n), o.addMsg(n, t), o.endError(n);
    }
    unpack() {
      return new c(this.msg());
    }
    unpackTo(n) {
      n.msg = this.msg();
    }
  }
  Ht.Error = o;
  class c {
    constructor(n = null) {
      this.msg = n;
    }
    pack(n) {
      const t = this.msg !== null ? n.createString(this.msg) : 0;
      return o.createError(n, t);
    }
  }
  return Ht.ErrorT = c, Ht;
}
var Kt = {}, _a;
function Vo() {
  if (_a) return Kt;
  _a = 1;
  var r = Kt && Kt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Kt && Kt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Kt && Kt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Kt, "__esModule", { value: !0 }), Kt.GenerateRandDataT = Kt.GenerateRandData = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsGenerateRandData(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsGenerateRandData(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    wrappedState(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    wrappedStateLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    wrappedStateArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startGenerateRandData(n) {
      n.startObject(1);
    }
    static addWrappedState(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createWrappedStateVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startWrappedStateVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endGenerateRandData(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createGenerateRandData(n, t) {
      return o.startGenerateRandData(n), o.addWrappedState(n, t), o.endGenerateRandData(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.wrappedState.bind(this), this.wrappedStateLength()));
    }
    unpackTo(n) {
      n.wrappedState = this.bb.createScalarList(this.wrappedState.bind(this), this.wrappedStateLength());
    }
  }
  Kt.GenerateRandData = o;
  class c {
    constructor(n = []) {
      this.wrappedState = n;
    }
    pack(n) {
      const t = o.createWrappedStateVector(n, this.wrappedState);
      return o.createGenerateRandData(n, t);
    }
  }
  return Kt.GenerateRandDataT = c, Kt;
}
var Gt = {}, ba;
function ko() {
  if (ba) return Gt;
  ba = 1;
  var r = Gt && Gt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Gt && Gt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Gt && Gt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Gt, "__esModule", { value: !0 }), Gt.OkT = Gt.Ok = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsOk(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsOk(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    msg(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.__string(this.bb_pos + t, n) : null;
    }
    static startOk(n) {
      n.startObject(1);
    }
    static addMsg(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static endOk(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), t;
    }
    static createOk(n, t) {
      return o.startOk(n), o.addMsg(n, t), o.endOk(n);
    }
    unpack() {
      return new c(this.msg());
    }
    unpackTo(n) {
      n.msg = this.msg();
    }
  }
  Gt.Ok = o;
  class c {
    constructor(n = null) {
      this.msg = n;
    }
    pack(n) {
      const t = this.msg !== null ? n.createString(this.msg) : 0;
      return o.createOk(n, t);
    }
  }
  return Gt.OkT = c, Gt;
}
var xt = {}, pa;
function Bo() {
  if (pa) return xt;
  pa = 1;
  var r = xt && xt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = xt && xt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = xt && xt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(xt, "__esModule", { value: !0 }), xt.StreamChunkT = xt.StreamChunk = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsStreamChunk(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsStreamChunk(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    streamId() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.readUint32(this.bb_pos + n) : 0;
    }
    index() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.readUint32(this.bb_pos + n) : 0;
    }
    total() {
      const n = this.bb.__offset(this.bb_pos, 8);
      return n ? this.bb.readUint32(this.bb_pos + n) : 0;
    }
    data(n) {
      const t = this.bb.__offset(this.bb_pos, 10);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    dataLength() {
      const n = this.bb.__offset(this.bb_pos, 10);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    dataArray() {
      const n = this.bb.__offset(this.bb_pos, 10);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startStreamChunk(n) {
      n.startObject(4);
    }
    static addStreamId(n, t) {
      n.addFieldInt32(0, t, 0);
    }
    static addIndex(n, t) {
      n.addFieldInt32(1, t, 0);
    }
    static addTotal(n, t) {
      n.addFieldInt32(2, t, 0);
    }
    static addData(n, t) {
      n.addFieldOffset(3, t, 0);
    }
    static createDataVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startDataVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endStreamChunk(n) {
      const t = n.endObject();
      return n.requiredField(t, 10), t;
    }
    static createStreamChunk(n, t, e, s, u) {
      return o.startStreamChunk(n), o.addStreamId(n, t), o.addIndex(n, e), o.addTotal(n, s), o.addData(n, u), o.endStreamChunk(n);
    }
    unpack() {
      return new c(this.streamId(), this.index(), this.total(), this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.streamId = this.streamId(), n.index = this.index(), n.total = this.total(), n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  xt.StreamChunk = o;
  class c {
    constructor(n = 0, t = 0, e = 0, s = []) {
      this.streamId = n, this.index = t, this.total = e, this.data = s;
    }
    pack(n) {
      const t = o.createDataVector(n, this.data);
      return o.createStreamChunk(n, this.streamId, this.index, this.total, t);
    }
  }
  return xt.StreamChunkT = c, xt;
}
var ga;
function Ho() {
  if (ga) return Ve;
  ga = 1, Object.defineProperty(Ve, "__esModule", { value: !0 }), Ve.HostResponseType = void 0, Ve.unionToHostResponseType = n, Ve.unionListToHostResponseType = t;
  const r = Ao(), i = Lo(), a = Fo(), f = Vo(), o = ko(), c = Bo();
  var l;
  (function(e) {
    e[e.NONE = 0] = "NONE", e[e.ContractResponse = 1] = "ContractResponse", e[e.DelegateResponse = 2] = "DelegateResponse", e[e.GenerateRandData = 3] = "GenerateRandData", e[e.Ok = 4] = "Ok", e[e.Error = 5] = "Error", e[e.StreamChunk = 6] = "StreamChunk";
  })(l || (Ve.HostResponseType = l = {}));
  function n(e, s) {
    switch (l[e]) {
      case "NONE":
        return null;
      case "ContractResponse":
        return s(new r.ContractResponse());
      case "DelegateResponse":
        return s(new i.DelegateResponse());
      case "GenerateRandData":
        return s(new f.GenerateRandData());
      case "Ok":
        return s(new o.Ok());
      case "Error":
        return s(new a.Error());
      case "StreamChunk":
        return s(new c.StreamChunk());
      default:
        return null;
    }
  }
  function t(e, s, u) {
    switch (l[e]) {
      case "NONE":
        return null;
      case "ContractResponse":
        return s(u, new r.ContractResponse());
      case "DelegateResponse":
        return s(u, new i.DelegateResponse());
      case "GenerateRandData":
        return s(u, new f.GenerateRandData());
      case "Ok":
        return s(u, new o.Ok());
      case "Error":
        return s(u, new a.Error());
      case "StreamChunk":
        return s(u, new c.StreamChunk());
      default:
        return null;
    }
  }
  return Ve;
}
var ya;
function Ko() {
  if (ya) return Ut;
  ya = 1;
  var r = Ut && Ut.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Ut && Ut.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = Ut && Ut.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Ut, "__esModule", { value: !0 }), Ut.HostResponseT = Ut.HostResponse = void 0;
  const f = a(j), o = Ho();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsHostResponse(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsHostResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    responseType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : o.HostResponseType.NONE;
    }
    response(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startHostResponse(t) {
      t.startObject(2);
    }
    static addResponseType(t, e) {
      t.addFieldInt8(0, e, o.HostResponseType.NONE);
    }
    static addResponse(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endHostResponse(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static finishHostResponseBuffer(t, e) {
      t.finish(e);
    }
    static finishSizePrefixedHostResponseBuffer(t, e) {
      t.finish(e, void 0, !0);
    }
    static createHostResponse(t, e, s) {
      return c.startHostResponse(t), c.addResponseType(t, e), c.addResponse(t, s), c.endHostResponse(t);
    }
    unpack() {
      return new l(this.responseType(), (() => {
        const t = (0, o.unionToHostResponseType)(this.responseType(), this.response.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.responseType = this.responseType(), t.response = (() => {
        const e = (0, o.unionToHostResponseType)(this.responseType(), this.response.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  Ut.HostResponse = c;
  class l {
    constructor(t = o.HostResponseType.NONE, e = null) {
      this.responseType = t, this.response = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.response);
      return c.createHostResponse(t, this.responseType, e);
    }
  }
  return Ut.HostResponseT = l, Ut;
}
var Ds = {}, $t = {}, wa;
function Bu() {
  if (wa) return $t;
  wa = 1;
  var r = $t && $t.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var u = Object.getOwnPropertyDescriptor(t, e);
    (!u || ("get" in u ? !t.__esModule : u.writable || u.configurable)) && (u = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, u);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = $t && $t.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), a = $t && $t.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var u in e) Object.prototype.hasOwnProperty.call(e, u) && (s[s.length] = u);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), u = 0; u < s.length; u++) s[u] !== "default" && r(e, t, s[u]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty($t, "__esModule", { value: !0 }), $t.UserInputRequestT = $t.UserInputRequest = void 0;
  const f = a(j), o = Dr();
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUserInputRequest(t, e) {
      return (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUserInputRequest(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new c()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    requestId() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint32(this.bb_pos + t) : 0;
    }
    message(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
    }
    messageLength() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    messageArray() {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
    }
    responses(t, e) {
      const s = this.bb.__offset(this.bb_pos, 8);
      return s ? (e || new o.ClientResponse()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + s) + t * 4), this.bb) : null;
    }
    responsesLength() {
      const t = this.bb.__offset(this.bb_pos, 8);
      return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
    }
    static startUserInputRequest(t) {
      t.startObject(3);
    }
    static addRequestId(t, e) {
      t.addFieldInt32(0, e, 0);
    }
    static addMessage(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static createMessageVector(t, e) {
      t.startVector(1, e.length, 1);
      for (let s = e.length - 1; s >= 0; s--)
        t.addInt8(e[s]);
      return t.endVector();
    }
    static startMessageVector(t, e) {
      t.startVector(1, e, 1);
    }
    static addResponses(t, e) {
      t.addFieldOffset(2, e, 0);
    }
    static createResponsesVector(t, e) {
      t.startVector(4, e.length, 4);
      for (let s = e.length - 1; s >= 0; s--)
        t.addOffset(e[s]);
      return t.endVector();
    }
    static startResponsesVector(t, e) {
      t.startVector(4, e, 4);
    }
    static endUserInputRequest(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), t.requiredField(e, 8), e;
    }
    static createUserInputRequest(t, e, s, u) {
      return c.startUserInputRequest(t), c.addRequestId(t, e), c.addMessage(t, s), c.addResponses(t, u), c.endUserInputRequest(t);
    }
    unpack() {
      return new l(this.requestId(), this.bb.createScalarList(this.message.bind(this), this.messageLength()), this.bb.createObjList(this.responses.bind(this), this.responsesLength()));
    }
    unpackTo(t) {
      t.requestId = this.requestId(), t.message = this.bb.createScalarList(this.message.bind(this), this.messageLength()), t.responses = this.bb.createObjList(this.responses.bind(this), this.responsesLength());
    }
  }
  $t.UserInputRequest = c;
  class l {
    constructor(t = 0, e = [], s = []) {
      this.requestId = t, this.message = e, this.responses = s;
    }
    pack(t) {
      const e = c.createMessageVector(t, this.message), s = c.createResponsesVector(t, t.createObjectOffsetList(this.responses));
      return c.createUserInputRequest(t, this.requestId, e, s);
    }
  }
  return $t.UserInputRequestT = l, $t;
}
var ma;
function Hu() {
  return ma || (ma = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.UserInputRequestT = r.UserInputRequest = r.UpdateResponseT = r.UpdateResponse = r.UpdateNotificationT = r.UpdateNotification = r.SubscribeResponseT = r.SubscribeResponse = r.StreamChunkT = r.StreamChunk = r.RequestUserInputT = r.RequestUserInput = r.PutResponseT = r.PutResponse = r.OutboundDelegateMsgType = r.OutboundDelegateMsgT = r.OutboundDelegateMsg = r.OkT = r.Ok = r.NotFoundT = r.NotFound = r.HostResponseType = r.HostResponseT = r.HostResponse = r.GetResponseT = r.GetResponse = r.GenerateRandDataT = r.GenerateRandData = r.ErrorT = r.Error = r.DelegateResponseT = r.DelegateResponse = r.DelegateKeyT = r.DelegateKey = r.ContractResponseType = r.ContractResponseT = r.ContractResponse = r.ContextUpdatedT = r.ContextUpdated = r.ClientResponseT = r.ClientResponse = void 0;
    var i = Dr();
    Object.defineProperty(r, "ClientResponse", { enumerable: !0, get: function() {
      return i.ClientResponse;
    } }), Object.defineProperty(r, "ClientResponseT", { enumerable: !0, get: function() {
      return i.ClientResponseT;
    } });
    var a = Mo();
    Object.defineProperty(r, "ContextUpdated", { enumerable: !0, get: function() {
      return a.ContextUpdated;
    } }), Object.defineProperty(r, "ContextUpdatedT", { enumerable: !0, get: function() {
      return a.ContextUpdatedT;
    } });
    var f = Ao();
    Object.defineProperty(r, "ContractResponse", { enumerable: !0, get: function() {
      return f.ContractResponse;
    } }), Object.defineProperty(r, "ContractResponseT", { enumerable: !0, get: function() {
      return f.ContractResponseT;
    } });
    var o = Co();
    Object.defineProperty(r, "ContractResponseType", { enumerable: !0, get: function() {
      return o.ContractResponseType;
    } });
    var c = Uo();
    Object.defineProperty(r, "DelegateKey", { enumerable: !0, get: function() {
      return c.DelegateKey;
    } }), Object.defineProperty(r, "DelegateKeyT", { enumerable: !0, get: function() {
      return c.DelegateKeyT;
    } });
    var l = Lo();
    Object.defineProperty(r, "DelegateResponse", { enumerable: !0, get: function() {
      return l.DelegateResponse;
    } }), Object.defineProperty(r, "DelegateResponseT", { enumerable: !0, get: function() {
      return l.DelegateResponseT;
    } });
    var n = Fo();
    Object.defineProperty(r, "Error", { enumerable: !0, get: function() {
      return n.Error;
    } }), Object.defineProperty(r, "ErrorT", { enumerable: !0, get: function() {
      return n.ErrorT;
    } });
    var t = Vo();
    Object.defineProperty(r, "GenerateRandData", { enumerable: !0, get: function() {
      return t.GenerateRandData;
    } }), Object.defineProperty(r, "GenerateRandDataT", { enumerable: !0, get: function() {
      return t.GenerateRandDataT;
    } });
    var e = Or();
    Object.defineProperty(r, "GetResponse", { enumerable: !0, get: function() {
      return e.GetResponse;
    } }), Object.defineProperty(r, "GetResponseT", { enumerable: !0, get: function() {
      return e.GetResponseT;
    } });
    var s = Ko();
    Object.defineProperty(r, "HostResponse", { enumerable: !0, get: function() {
      return s.HostResponse;
    } }), Object.defineProperty(r, "HostResponseT", { enumerable: !0, get: function() {
      return s.HostResponseT;
    } });
    var u = Ho();
    Object.defineProperty(r, "HostResponseType", { enumerable: !0, get: function() {
      return u.HostResponseType;
    } });
    var d = Po();
    Object.defineProperty(r, "NotFound", { enumerable: !0, get: function() {
      return d.NotFound;
    } }), Object.defineProperty(r, "NotFoundT", { enumerable: !0, get: function() {
      return d.NotFoundT;
    } });
    var h = ko();
    Object.defineProperty(r, "Ok", { enumerable: !0, get: function() {
      return h.Ok;
    } }), Object.defineProperty(r, "OkT", { enumerable: !0, get: function() {
      return h.OkT;
    } });
    var b = No();
    Object.defineProperty(r, "OutboundDelegateMsg", { enumerable: !0, get: function() {
      return b.OutboundDelegateMsg;
    } }), Object.defineProperty(r, "OutboundDelegateMsgT", { enumerable: !0, get: function() {
      return b.OutboundDelegateMsgT;
    } });
    var g = qo();
    Object.defineProperty(r, "OutboundDelegateMsgType", { enumerable: !0, get: function() {
      return g.OutboundDelegateMsgType;
    } });
    var w = vr();
    Object.defineProperty(r, "PutResponse", { enumerable: !0, get: function() {
      return w.PutResponse;
    } }), Object.defineProperty(r, "PutResponseT", { enumerable: !0, get: function() {
      return w.PutResponseT;
    } });
    var y = Eo();
    Object.defineProperty(r, "RequestUserInput", { enumerable: !0, get: function() {
      return y.RequestUserInput;
    } }), Object.defineProperty(r, "RequestUserInputT", { enumerable: !0, get: function() {
      return y.RequestUserInputT;
    } });
    var m = Bo();
    Object.defineProperty(r, "StreamChunk", { enumerable: !0, get: function() {
      return m.StreamChunk;
    } }), Object.defineProperty(r, "StreamChunkT", { enumerable: !0, get: function() {
      return m.StreamChunkT;
    } });
    var O = Io();
    Object.defineProperty(r, "SubscribeResponse", { enumerable: !0, get: function() {
      return O.SubscribeResponse;
    } }), Object.defineProperty(r, "SubscribeResponseT", { enumerable: !0, get: function() {
      return O.SubscribeResponseT;
    } });
    var R = Tr();
    Object.defineProperty(r, "UpdateNotification", { enumerable: !0, get: function() {
      return R.UpdateNotification;
    } }), Object.defineProperty(r, "UpdateNotificationT", { enumerable: !0, get: function() {
      return R.UpdateNotificationT;
    } });
    var P = Rr();
    Object.defineProperty(r, "UpdateResponse", { enumerable: !0, get: function() {
      return P.UpdateResponse;
    } }), Object.defineProperty(r, "UpdateResponseT", { enumerable: !0, get: function() {
      return P.UpdateResponseT;
    } });
    var U = Bu();
    Object.defineProperty(r, "UserInputRequest", { enumerable: !0, get: function() {
      return U.UserInputRequest;
    } }), Object.defineProperty(r, "UserInputRequestT", { enumerable: !0, get: function() {
      return U.UserInputRequestT;
    } });
  })(Ds)), Ds;
}
var Ss = {}, Wt = {}, va;
function Ku() {
  if (va) return Wt;
  va = 1;
  var r = Wt && Wt.__createBinding || (Object.create ? (function(l, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(l, e, s);
  }) : (function(l, n, t, e) {
    e === void 0 && (e = t), l[e] = n[t];
  })), i = Wt && Wt.__setModuleDefault || (Object.create ? (function(l, n) {
    Object.defineProperty(l, "default", { enumerable: !0, value: n });
  }) : function(l, n) {
    l.default = n;
  }), a = Wt && Wt.__importStar || /* @__PURE__ */ (function() {
    var l = function(n) {
      return l = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, l(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = l(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Wt, "__esModule", { value: !0 }), Wt.SecretsIdT = Wt.SecretsId = void 0;
  const f = a(j);
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsSecretsId(n, t) {
      return (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsSecretsId(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new o()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    key(n) {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    keyLength() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    keyArray() {
      const n = this.bb.__offset(this.bb_pos, 4);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    hash(n) {
      const t = this.bb.__offset(this.bb_pos, 6);
      return t ? this.bb.readUint8(this.bb.__vector(this.bb_pos + t) + n) : 0;
    }
    hashLength() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? this.bb.__vector_len(this.bb_pos + n) : 0;
    }
    hashArray() {
      const n = this.bb.__offset(this.bb_pos, 6);
      return n ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + n), this.bb.__vector_len(this.bb_pos + n)) : null;
    }
    static startSecretsId(n) {
      n.startObject(2);
    }
    static addKey(n, t) {
      n.addFieldOffset(0, t, 0);
    }
    static createKeyVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startKeyVector(n, t) {
      n.startVector(1, t, 1);
    }
    static addHash(n, t) {
      n.addFieldOffset(1, t, 0);
    }
    static createHashVector(n, t) {
      n.startVector(1, t.length, 1);
      for (let e = t.length - 1; e >= 0; e--)
        n.addInt8(t[e]);
      return n.endVector();
    }
    static startHashVector(n, t) {
      n.startVector(1, t, 1);
    }
    static endSecretsId(n) {
      const t = n.endObject();
      return n.requiredField(t, 4), n.requiredField(t, 6), t;
    }
    static createSecretsId(n, t, e) {
      return o.startSecretsId(n), o.addKey(n, t), o.addHash(n, e), o.endSecretsId(n);
    }
    unpack() {
      return new c(this.bb.createScalarList(this.key.bind(this), this.keyLength()), this.bb.createScalarList(this.hash.bind(this), this.hashLength()));
    }
    unpackTo(n) {
      n.key = this.bb.createScalarList(this.key.bind(this), this.keyLength()), n.hash = this.bb.createScalarList(this.hash.bind(this), this.hashLength());
    }
  }
  Wt.SecretsId = o;
  class c {
    constructor(n = [], t = []) {
      this.key = n, this.hash = t;
    }
    pack(n) {
      const t = o.createKeyVector(n, this.key), e = o.createHashVector(n, this.hash);
      return o.createSecretsId(n, t, e);
    }
  }
  return Wt.SecretsIdT = c, Wt;
}
var Oa;
function Go() {
  return Oa || (Oa = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.WasmContractV1T = r.WasmContractV1 = r.UpdateDataType = r.UpdateDataT = r.UpdateData = r.StateUpdateT = r.StateUpdate = r.StateAndDeltaUpdateT = r.StateAndDeltaUpdate = r.SecretsIdT = r.SecretsId = r.RelatedStateUpdateT = r.RelatedStateUpdate = r.RelatedStateAndDeltaUpdateT = r.RelatedStateAndDeltaUpdate = r.RelatedDeltaUpdateT = r.RelatedDeltaUpdate = r.DeltaUpdateT = r.DeltaUpdate = r.ContractType = r.ContractKeyT = r.ContractKey = r.ContractInstanceIdT = r.ContractInstanceId = r.ContractContainerT = r.ContractContainer = r.ContractCodeT = r.ContractCode = r.ApplicationMessageT = r.ApplicationMessage = void 0;
    var i = wr();
    Object.defineProperty(r, "ApplicationMessage", { enumerable: !0, get: function() {
      return i.ApplicationMessage;
    } }), Object.defineProperty(r, "ApplicationMessageT", { enumerable: !0, get: function() {
      return i.ApplicationMessageT;
    } });
    var a = to();
    Object.defineProperty(r, "ContractCode", { enumerable: !0, get: function() {
      return a.ContractCode;
    } }), Object.defineProperty(r, "ContractCodeT", { enumerable: !0, get: function() {
      return a.ContractCodeT;
    } });
    var f = as();
    Object.defineProperty(r, "ContractContainer", { enumerable: !0, get: function() {
      return f.ContractContainer;
    } }), Object.defineProperty(r, "ContractContainerT", { enumerable: !0, get: function() {
      return f.ContractContainerT;
    } });
    var o = je();
    Object.defineProperty(r, "ContractInstanceId", { enumerable: !0, get: function() {
      return o.ContractInstanceId;
    } }), Object.defineProperty(r, "ContractInstanceIdT", { enumerable: !0, get: function() {
      return o.ContractInstanceIdT;
    } });
    var c = ie();
    Object.defineProperty(r, "ContractKey", { enumerable: !0, get: function() {
      return c.ContractKey;
    } }), Object.defineProperty(r, "ContractKeyT", { enumerable: !0, get: function() {
      return c.ContractKeyT;
    } });
    var l = dr();
    Object.defineProperty(r, "ContractType", { enumerable: !0, get: function() {
      return l.ContractType;
    } });
    var n = hr();
    Object.defineProperty(r, "DeltaUpdate", { enumerable: !0, get: function() {
      return n.DeltaUpdate;
    } }), Object.defineProperty(r, "DeltaUpdateT", { enumerable: !0, get: function() {
      return n.DeltaUpdateT;
    } });
    var t = _r();
    Object.defineProperty(r, "RelatedDeltaUpdate", { enumerable: !0, get: function() {
      return t.RelatedDeltaUpdate;
    } }), Object.defineProperty(r, "RelatedDeltaUpdateT", { enumerable: !0, get: function() {
      return t.RelatedDeltaUpdateT;
    } });
    var e = br();
    Object.defineProperty(r, "RelatedStateAndDeltaUpdate", { enumerable: !0, get: function() {
      return e.RelatedStateAndDeltaUpdate;
    } }), Object.defineProperty(r, "RelatedStateAndDeltaUpdateT", { enumerable: !0, get: function() {
      return e.RelatedStateAndDeltaUpdateT;
    } });
    var s = pr();
    Object.defineProperty(r, "RelatedStateUpdate", { enumerable: !0, get: function() {
      return s.RelatedStateUpdate;
    } }), Object.defineProperty(r, "RelatedStateUpdateT", { enumerable: !0, get: function() {
      return s.RelatedStateUpdateT;
    } });
    var u = Ku();
    Object.defineProperty(r, "SecretsId", { enumerable: !0, get: function() {
      return u.SecretsId;
    } }), Object.defineProperty(r, "SecretsIdT", { enumerable: !0, get: function() {
      return u.SecretsIdT;
    } });
    var d = gr();
    Object.defineProperty(r, "StateAndDeltaUpdate", { enumerable: !0, get: function() {
      return d.StateAndDeltaUpdate;
    } }), Object.defineProperty(r, "StateAndDeltaUpdateT", { enumerable: !0, get: function() {
      return d.StateAndDeltaUpdateT;
    } });
    var h = yr();
    Object.defineProperty(r, "StateUpdate", { enumerable: !0, get: function() {
      return h.StateUpdate;
    } }), Object.defineProperty(r, "StateUpdateT", { enumerable: !0, get: function() {
      return h.StateUpdateT;
    } });
    var b = cs();
    Object.defineProperty(r, "UpdateData", { enumerable: !0, get: function() {
      return b.UpdateData;
    } }), Object.defineProperty(r, "UpdateDataT", { enumerable: !0, get: function() {
      return b.UpdateDataT;
    } });
    var g = Qn();
    Object.defineProperty(r, "UpdateDataType", { enumerable: !0, get: function() {
      return g.UpdateDataType;
    } });
    var w = eo();
    Object.defineProperty(r, "WasmContractV1", { enumerable: !0, get: function() {
      return w.WasmContractV1;
    } }), Object.defineProperty(r, "WasmContractV1T", { enumerable: !0, get: function() {
      return w.WasmContractV1T;
    } });
  })(Ss)), Ss;
}
var js, Ra;
function Gu() {
  return Ra || (Ra = 1, js = function() {
    throw new Error(
      "ws does not work in the browser. Browser clients must use the native WebSocket object"
    );
  }), js;
}
var Ta;
function xu() {
  return Ta || (Ta = 1, (function(r) {
    var i = x && x.__createBinding || (Object.create ? (function(I, _, p, v) {
      v === void 0 && (v = p);
      var S = Object.getOwnPropertyDescriptor(_, p);
      (!S || ("get" in S ? !_.__esModule : S.writable || S.configurable)) && (S = { enumerable: !0, get: function() {
        return _[p];
      } }), Object.defineProperty(I, v, S);
    }) : (function(I, _, p, v) {
      v === void 0 && (v = p), I[v] = _[p];
    })), a = x && x.__setModuleDefault || (Object.create ? (function(I, _) {
      Object.defineProperty(I, "default", { enumerable: !0, value: _ });
    }) : function(I, _) {
      I.default = _;
    }), f = x && x.__importStar || /* @__PURE__ */ (function() {
      var I = function(_) {
        return I = Object.getOwnPropertyNames || function(p) {
          var v = [];
          for (var S in p) Object.prototype.hasOwnProperty.call(p, S) && (v[v.length] = S);
          return v;
        }, I(_);
      };
      return function(_) {
        if (_ && _.__esModule) return _;
        var p = {};
        if (_ != null) for (var v = I(_), S = 0; S < v.length; S++) v[S] !== "default" && i(p, _, v[S]);
        return a(p, _), p;
      };
    })(), o = x && x.__awaiter || function(I, _, p, v) {
      function S(A) {
        return A instanceof p ? A : new p(function(M) {
          M(A);
        });
      }
      return new (p || (p = Promise))(function(A, M) {
        function V(G) {
          try {
            ee(v.next(G));
          } catch (k) {
            M(k);
          }
        }
        function Xe(G) {
          try {
            ee(v.throw(G));
          } catch (k) {
            M(k);
          }
        }
        function ee(G) {
          G.done ? A(G.value) : S(G.value).then(V, Xe);
        }
        ee((v = v.apply(I, _ || [])).next());
      });
    }, c = x && x.__importDefault || function(I) {
      return I && I.__esModule ? I : { default: I };
    };
    Object.defineProperty(r, "__esModule", { value: !0 }), r.FreenetWsApi = r.DelegateResponse = r.OutboundDelegateMsg = r.UpdateNotification = r.UpdateResponse = r.GetResponse = r.PutResponse = r.DelegateRequest = r.InboundDelegateMsg = r.DisconnectRequest = r.SubscribeRequest = r.GetRequest = r.UpdateRequest = r.PutRequest = r.DelegateContainer = r.WasmDelegateV1 = r.ContractContainer = r.WasmContractV1 = r.ContractKey = r.RelatedStateAndDeltaUpdate = r.RelatedDeltaUpdate = r.RelatedStateUpdate = r.StateAndDeltaUpdate = r.DeltaUpdate = r.StateUpdate = r.UpdateData = r.ContractType = r.UpdateDataType = void 0;
    const l = f(j), n = c(Fu()), t = Qa(), e = as(), s = je(), u = hr(), d = _r(), h = br(), b = pr(), g = gr(), w = yr(), y = jo(), m = mr(), O = cs(), R = Qn();
    var P = Qn();
    Object.defineProperty(r, "UpdateDataType", { enumerable: !0, get: function() {
      return P.UpdateDataType;
    } });
    var U = dr();
    Object.defineProperty(r, "ContractType", { enumerable: !0, get: function() {
      return U.ContractType;
    } });
    const N = ie(), L = vr(), D = Or(), C = Rr(), K = Tr(), F = Ko(), E = Hu(), Yt = Go();
    class te extends O.UpdateDataT {
      constructor(_ = R.UpdateDataType.NONE, p = null) {
        super(_, p);
      }
    }
    r.UpdateData = te;
    class ze extends w.StateUpdateT {
      constructor(_ = []) {
        super(_);
      }
    }
    r.StateUpdate = ze;
    class Ie extends u.DeltaUpdateT {
      constructor(_ = []) {
        super(_);
      }
    }
    r.DeltaUpdate = Ie;
    class ws extends g.StateAndDeltaUpdateT {
      constructor(_ = [], p = []) {
        super(_, p);
      }
    }
    r.StateAndDeltaUpdate = ws;
    class ms extends b.RelatedStateUpdateT {
      constructor(_ = null, p = []) {
        super(_, p);
      }
    }
    r.RelatedStateUpdate = ms;
    class vs extends d.RelatedDeltaUpdateT {
      constructor(_ = null, p = []) {
        super(_, p);
      }
    }
    r.RelatedDeltaUpdate = vs;
    class Pn extends h.RelatedStateAndDeltaUpdateT {
      constructor(_ = null, p = [], v = []) {
        super(_, p, v);
      }
    }
    r.RelatedStateAndDeltaUpdate = Pn;
    class ae extends N.ContractKeyT {
      constructor(_, p) {
        if (_.length !== 32 || p && p.length !== 32)
          throw new TypeError("Invalid array length, expected 32 bytes");
        let v = new s.ContractInstanceIdT(Array.from(_)), S = [];
        p && (S = Array.from(p)), super(v, S);
      }
      static fromInstanceId(_) {
        const p = n.default.decode(_);
        return new ae(p);
      }
      bytes() {
        var _;
        return new Uint8Array((_ = this.instance) === null || _ === void 0 ? void 0 : _.data);
      }
      codePart() {
        return new Uint8Array(this.code);
      }
      encode() {
        var _;
        const p = new Uint8Array((_ = this.instance) === null || _ === void 0 ? void 0 : _.data);
        return n.default.encode(p);
      }
      get_contract_key() {
        return this;
      }
    }
    r.ContractKey = ae;
    class Lc extends Yt.WasmContractV1T {
      constructor(_ = null, p = [], v = null) {
        super(_, p, v);
      }
    }
    r.WasmContractV1 = Lc;
    class Fc extends e.ContractContainerT {
      constructor(_ = Yt.ContractType.NONE, p) {
        super(_, p);
      }
    }
    r.ContractContainer = Fc;
    class Vc extends y.WasmDelegateV1T {
      constructor(_ = [], p, v) {
        super(_, p, v);
      }
    }
    r.WasmDelegateV1 = Vc;
    class kc extends y.DelegateContainerT {
      constructor(_ = y.DelegateType.NONE, p) {
        super(_, p);
      }
    }
    r.DelegateContainer = kc;
    class Bc extends y.PutT {
      constructor(_ = null, p = [], v = null, S = !1, A = !1) {
        super(_, p, v, S, A);
      }
    }
    r.PutRequest = Bc;
    class Hc extends y.UpdateT {
      constructor(_ = null, p = null) {
        const v = _?.get_contract_key();
        super(v, p);
      }
    }
    r.UpdateRequest = Hc;
    class Kc extends y.GetT {
      constructor(_, p = !1, v = !1, S = !1) {
        const A = _.get_contract_key();
        super(A, p, v, S);
      }
    }
    r.GetRequest = Kc;
    class Gc extends y.SubscribeT {
      constructor(_ = null, p = []) {
        const v = _?.get_contract_key();
        super(v, p);
      }
    }
    r.SubscribeRequest = Gc;
    class xc extends y.DisconnectT {
      constructor(_ = null) {
        super(_);
      }
    }
    r.DisconnectRequest = xc;
    class $c extends y.InboundDelegateMsgT {
      constructor(_ = y.InboundDelegateMsgType.NONE, p) {
        super(_, p);
      }
    }
    r.InboundDelegateMsg = $c;
    class Wc extends y.DelegateRequestT {
      constructor(_ = y.DelegateRequestType.NONE, p) {
        super(_, p);
      }
    }
    r.DelegateRequest = Wc;
    class In extends L.PutResponseT {
      constructor(_) {
        super(_), this.key = _;
      }
      static fromPutResponseT(_) {
        var p, v, S;
        let A = new Uint8Array((v = (p = _.key) === null || p === void 0 ? void 0 : p.instance) === null || v === void 0 ? void 0 : v.data);
        const M = !((S = _.key) === null || S === void 0) && S.code && _.key.code.length > 0 ? new Uint8Array(_.key.code) : void 0;
        let V = new ae(A, M);
        return new In(V);
      }
    }
    r.PutResponse = In;
    class Cn extends D.GetResponseT {
      constructor(_, p, v = []) {
        super(_, p, v), this.key = _, this.contract = p, this.state = v;
      }
      static fromGetResponseT(_) {
        var p, v, S;
        let A = new Uint8Array((v = (p = _.key) === null || p === void 0 ? void 0 : p.instance) === null || v === void 0 ? void 0 : v.data);
        const M = !((S = _.key) === null || S === void 0) && S.code && _.key.code.length > 0 ? new Uint8Array(_.key.code) : void 0;
        let V = new ae(A, M);
        return new Cn(V, _.contract, _.state);
      }
    }
    r.GetResponse = Cn;
    class An extends C.UpdateResponseT {
      constructor(_, p = []) {
        super(_, p), this.key = _, this.summary = p;
      }
      static fromUpdateResponseT(_) {
        var p, v, S;
        let A = new Uint8Array((v = (p = _.key) === null || p === void 0 ? void 0 : p.instance) === null || v === void 0 ? void 0 : v.data);
        const M = !((S = _.key) === null || S === void 0) && S.code && _.key.code.length > 0 ? new Uint8Array(_.key.code) : void 0;
        let V = new ae(A, M);
        return new An(V, _.summary);
      }
    }
    r.UpdateResponse = An;
    class Un extends K.UpdateNotificationT {
      constructor(_, p) {
        super(_, p), this.key = _, this.update = p;
      }
      static fromUpdateNotificationT(_) {
        var p, v, S;
        let A = new Uint8Array((v = (p = _.key) === null || p === void 0 ? void 0 : p.instance) === null || v === void 0 ? void 0 : v.data);
        const M = !((S = _.key) === null || S === void 0) && S.code && _.key.code.length > 0 ? new Uint8Array(_.key.code) : void 0;
        let V = new ae(A, M);
        return new Un(V, _.update);
      }
    }
    r.UpdateNotification = Un;
    class zc extends E.OutboundDelegateMsgT {
      constructor(_ = E.OutboundDelegateMsgType.NONE, p) {
        super(_, p);
      }
    }
    r.OutboundDelegateMsg = zc;
    class Xc extends E.DelegateResponseT {
      constructor(_ = null, p = []) {
        super(_, p);
      }
    }
    r.DelegateResponse = Xc;
    const Zc = "flatbuffers";
    function Yc() {
      if (typeof document > "u")
        return null;
      const I = document.cookie.split(";");
      for (let _ of I) {
        const [p, v] = _.trim().split("=");
        if (p === "authorization") {
          const S = decodeURIComponent(v).split("Bearer ");
          return S.length == 2 ? S[1] : null;
        }
      }
      return null;
    }
    function Jc() {
      if (typeof WebSocket < "u")
        return WebSocket;
      try {
        return Gu();
      } catch {
        throw new Error("No WebSocket implementation found. Install the 'ws' package for Node.js support.");
      }
    }
    const Qc = 3e4;
    class tu {
      constructor(_, p, v) {
        this.reassembly = new t.ReassemblyBuffer(), this.nextStreamId = 0, this.pendingGets = [], this.pendingPuts = [], this.pendingUpdates = [], this.responseHandler = p;
        const S = v ?? Yc();
        S && _.searchParams.append("authToken", S), _.searchParams.append("encodingProtocol", Zc);
        const A = Jc();
        this.ws = new A(_.toString()), this.ws.binaryType = "arraybuffer", this.ws.onmessage = (M) => this.handleResponse(M), this.ws.addEventListener("open", () => {
          v && this.sendRequest(new y.ClientRequestT(y.ClientRequestType.Authenticate, new y.AuthenticateT(v))), p.onOpen();
        }), this.ws.addEventListener("close", (M) => {
          var V;
          this.rejectAllPending(new Error(`Connection closed: ${M.reason || M.code}`)), (V = p.onClose) === null || V === void 0 || V.call(p, M.code, M.reason);
        });
      }
      handleResponse(_) {
        var p, v, S, A, M, V, Xe, ee;
        let G;
        try {
          let k = new l.ByteBuffer(new Uint8Array(_.data));
          G = F.HostResponse.getRootAsHostResponse(k).unpack();
        } catch (k) {
          return console.log(`found error: ${k}`), new Error(`${k}`);
        }
        switch (G.responseType) {
          case E.HostResponseType.ContractResponse:
            let k = G.response;
            switch (k.contractResponseType) {
              case E.ContractResponseType.PutResponse:
                const fe = In.fromPutResponseT(k.contractResponse);
                this.responseHandler.onContractPut(fe), this.resolveNext(this.pendingPuts, fe);
                break;
              case E.ContractResponseType.GetResponse:
                const Ce = Cn.fromGetResponseT(k.contractResponse);
                this.responseHandler.onContractGet(Ce), this.resolveNext(this.pendingGets, Ce);
                break;
              case E.ContractResponseType.UpdateResponse:
                const Ze = An.fromUpdateResponseT(k.contractResponse);
                this.responseHandler.onContractUpdate(Ze), this.resolveNext(this.pendingUpdates, Ze);
                break;
              case E.ContractResponseType.UpdateNotification:
                const ru = Un.fromUpdateNotificationT(k.contractResponse);
                this.responseHandler.onContractUpdateNotification(ru);
                break;
              case E.ContractResponseType.NotFound:
                const iu = k.contractResponse, au = new Uint8Array((v = (p = iu.instanceId) === null || p === void 0 ? void 0 : p.data) !== null && v !== void 0 ? v : []);
                this.responseHandler.onContractNotFound(au), this.rejectNext(this.pendingGets, new Error("Contract not found"));
                break;
              case E.ContractResponseType.SubscribeResponse:
                const hn = k.contractResponse, ou = new Uint8Array((M = (A = (S = hn.key) === null || S === void 0 ? void 0 : S.instance) === null || A === void 0 ? void 0 : A.data) !== null && M !== void 0 ? M : []), cu = !((V = hn.key) === null || V === void 0) && V.code && hn.key.code.length > 0 ? new Uint8Array(hn.key.code) : void 0, uu = new ae(ou, cu);
                (ee = (Xe = this.responseHandler).onSubscribeResponse) === null || ee === void 0 || ee.call(Xe, uu, hn.subscribed);
                break;
              default:
                const Jr = "Contract response type not implemented";
                console.log(Jr);
                const lu = {
                  cause: Jr
                };
                this.responseHandler.onErr(lu);
                break;
            }
            break;
          case E.HostResponseType.DelegateResponse:
            let eu = G.response;
            this.responseHandler.onDelegateResponse(eu);
            break;
          case E.HostResponseType.Ok:
            break;
          case E.HostResponseType.Error:
            const Mn = G.response.msg, Zr = typeof Mn == "string" ? Mn : Mn instanceof Uint8Array ? new TextDecoder().decode(Mn) : "unknown error", nu = { cause: Zr };
            this.responseHandler.onErr(nu), this.rejectAllPending(new Error(Zr));
            break;
          case E.HostResponseType.StreamChunk: {
            const fe = G.response;
            try {
              const Ce = this.reassembly.receiveChunk(fe.streamId, fe.index, fe.total, new Uint8Array(fe.data));
              if (Ce !== null) {
                const Ze = { data: Ce.buffer };
                this.handleResponse(Ze);
              }
            } catch (Ce) {
              const Ze = {
                cause: `Stream reassembly error: ${Ce}`
              };
              this.responseHandler.onErr(Ze), fe.streamId !== void 0 && this.reassembly.removeStream(fe.streamId);
            }
            break;
          }
          default:
            const Yr = "Received wrong HostResponse type";
            console.log(Yr);
            const su = {
              cause: Yr
            };
            this.responseHandler.onErr(su);
            break;
        }
      }
      sendRequest(_) {
        const p = new l.Builder(1024);
        y.ClientRequest.finishClientRequestBuffer(p, _.pack(p));
        const v = p.asUint8Array();
        v.byteLength > t.CHUNK_THRESHOLD ? this.sendChunked(v) : this.ws.send(v);
      }
      sendChunked(_) {
        const p = this.nextStreamId++, v = Math.ceil(_.byteLength / t.CHUNK_SIZE);
        for (let S = 0; S < v; S++) {
          const A = S * t.CHUNK_SIZE, M = Math.min(A + t.CHUNK_SIZE, _.byteLength), V = new m.StreamChunkT(p, S, v, Array.from(_.subarray(A, M))), Xe = new y.ClientRequestT(y.ClientRequestType.StreamChunk, V), ee = new l.Builder(M - A + 128);
          y.ClientRequest.finishClientRequestBuffer(ee, Xe.pack(ee)), this.ws.send(ee.asUint8Array());
        }
      }
      awaitResponse(_) {
        return new Promise((p, v) => {
          const S = setTimeout(() => {
            const A = _.findIndex((M) => M.timer === S);
            A !== -1 && _.splice(A, 1), v(new Error("Request timeout"));
          }, Qc);
          _.push({ resolve: p, reject: v, timer: S });
        });
      }
      resolveNext(_, p) {
        const v = _.shift();
        v && (clearTimeout(v.timer), v.resolve(p));
      }
      rejectNext(_, p) {
        const v = _.shift();
        v && (clearTimeout(v.timer), v.reject(p));
      }
      rejectAllPending(_) {
        for (const p of [this.pendingGets, this.pendingPuts, this.pendingUpdates])
          for (; p.length > 0; ) {
            const v = p.shift();
            clearTimeout(v.timer), v.reject(_);
          }
      }
      put(_) {
        return o(this, void 0, void 0, function* () {
          return this.sendRequest(new y.ClientRequestT(y.ClientRequestType.ContractRequest, new y.ContractRequestT(y.ContractRequestType.Put, _))), this.awaitResponse(this.pendingPuts);
        });
      }
      update(_) {
        return o(this, void 0, void 0, function* () {
          return this.sendRequest(new y.ClientRequestT(y.ClientRequestType.ContractRequest, new y.ContractRequestT(y.ContractRequestType.Update, _))), this.awaitResponse(this.pendingUpdates);
        });
      }
      get(_) {
        return o(this, void 0, void 0, function* () {
          return this.sendRequest(new y.ClientRequestT(y.ClientRequestType.ContractRequest, new y.ContractRequestT(y.ContractRequestType.Get, _))), this.awaitResponse(this.pendingGets);
        });
      }
      subscribe(_) {
        return o(this, void 0, void 0, function* () {
          this.sendRequest(new y.ClientRequestT(y.ClientRequestType.ContractRequest, new y.ContractRequestT(y.ContractRequestType.Subscribe, _)));
        });
      }
      disconnect(_) {
        return o(this, void 0, void 0, function* () {
          this.sendRequest(new y.ClientRequestT(y.ClientRequestType.Disconnect, _));
        });
      }
    }
    r.FreenetWsApi = tu;
  })(x)), x;
}
var Da;
function $u() {
  return Da || (Da = 1, (function(r) {
    var i = Ae && Ae.__createBinding || (Object.create ? (function(f, o, c, l) {
      l === void 0 && (l = c);
      var n = Object.getOwnPropertyDescriptor(o, c);
      (!n || ("get" in n ? !o.__esModule : n.writable || n.configurable)) && (n = { enumerable: !0, get: function() {
        return o[c];
      } }), Object.defineProperty(f, l, n);
    }) : (function(f, o, c, l) {
      l === void 0 && (l = c), f[l] = o[c];
    })), a = Ae && Ae.__exportStar || function(f, o) {
      for (var c in f) c !== "default" && !Object.prototype.hasOwnProperty.call(o, c) && i(o, f, c);
    };
    Object.defineProperty(r, "__esModule", { value: !0 }), a(xu(), r), a(Qa(), r);
  })(Ae)), Ae;
}
var q = $u();
function xo() {
  return new TextEncoder().encode(fu);
}
function Wu(r, i) {
  const a = De.decode(r), f = new Uint8Array(a.length + i.length);
  f.set(a, 0), f.set(i, a.length);
  const o = ge(f);
  return { bytes: o, base58: De.encode(o) };
}
function $o() {
  const r = xo(), i = Wu(Xn, r), a = De.decode(Xn);
  return new q.ContractKey(i.bytes, a);
}
var re = Go();
const Wo = /* @__PURE__ */ za({
  __proto__: null
}, [re]);
var Sr = jo();
const us = /* @__PURE__ */ za({
  __proto__: null
}, [Sr]);
function zu(r) {
  const i = De.decode(r);
  if (i.length !== 32)
    throw new Error(`code hash must be 32 bytes, got ${i.length}`);
  return i;
}
function Xu(r, i, a, f) {
  const o = zu(i), c = new Uint8Array(o.length + a.length);
  c.set(o, 0), c.set(a, o.length);
  const l = ge(c), n = new re.ContractCodeT(
    Array.from(r),
    Array.from(o)
  ), t = new re.ContractKeyT(
    new re.ContractInstanceIdT(Array.from(l)),
    Array.from(o)
  ), e = new re.WasmContractV1T(n, Array.from(a), t), s = new re.ContractContainerT(
    q.ContractType.WasmContractV1,
    e
  );
  return new q.PutRequest(
    s,
    Array.from(f),
    new Sr.RelatedContractsT([]),
    !0,
    !1
  );
}
function jr(r, i) {
  const a = new q.UpdateData(
    q.UpdateDataType.DeltaUpdate,
    new q.DeltaUpdate(Array.from(i))
  );
  return new q.UpdateRequest(r, a);
}
function Zu() {
  const r = globalThis.location, i = r?.protocol === "https:" ? "wss:" : "ws:", a = r?.host || "127.0.0.1:7509";
  return new URL(`${i}//${a}/v1/contract/command`);
}
let vn = null, tn = null;
const on = /* @__PURE__ */ new Set(), Bs = /* @__PURE__ */ new Set(), Hs = /* @__PURE__ */ new Set(), Ks = /* @__PURE__ */ new Set(), Gs = /* @__PURE__ */ new Set();
function Yu(r, i = null) {
  for (const a of on)
    try {
      a(r, i);
    } catch {
    }
}
function zo(r) {
  return on.add(r), () => on.delete(r);
}
function Ju(r) {
  const i = [];
  if (!r?.values) return i;
  for (const a of r.values) {
    if (a.inboundType !== 1) continue;
    const f = a.inbound;
    if (f?.payload?.length)
      try {
        const o = new Uint8Array(f.payload);
        i.push(JSON.parse(new TextDecoder().decode(o)));
      } catch {
      }
  }
  return i;
}
function Qu(r) {
  for (const a of Hs)
    try {
      a(r);
    } catch {
    }
  const i = Ju(r);
  if (i.length)
    for (const a of Bs)
      try {
        a(i);
      } catch {
      }
}
function tl(r) {
  const i = new Error(r || "Freenet host error");
  for (const a of Ks)
    try {
      a(i);
    } catch {
    }
}
function el(r, i) {
  const a = new Error(
    `Connection closed: ${r}${i ? ` ${i}` : ""}`
  );
  for (const f of Gs)
    try {
      f(a);
    } catch {
    }
}
function nl(r) {
  return Bs.add(r), () => Bs.delete(r);
}
function sl(r) {
  return Hs.add(r), () => Hs.delete(r);
}
function rl(r) {
  return Ks.add(r), () => Ks.delete(r);
}
function il(r) {
  return Gs.add(r), () => Gs.delete(r);
}
function al() {
  return {
    onContractPut: () => {
    },
    onContractGet: () => {
    },
    onContractUpdate: () => {
    },
    onContractUpdateNotification: (r) => {
      r?.key && Yu(r.key, r);
    },
    onContractNotFound: () => {
    },
    onDelegateResponse: (r) => {
      Qu(r);
    },
    onErr: (r) => {
      console.warn("[kairos] host error:", r?.cause ?? r), tl(
        typeof r?.cause == "string" ? r.cause : String(r?.cause ?? r)
      );
    },
    onOpen: () => {
    }
  };
}
async function ol() {
  let r, i, a = !1;
  const f = new Promise((l, n) => {
    r = () => {
      a || (a = !0, l());
    }, i = (t) => {
      a || (a = !0, n(t));
    };
  });
  let o;
  const c = {
    ...al(),
    onOpen: () => r(),
    onClose: (l, n) => {
      vn?.api === o && (vn = null), el(l, n), i(
        new Error(`Connection closed: ${l}${n ? ` ${n}` : ""}`)
      );
    }
  };
  return o = new q.FreenetWsApi(Zu(), c, ""), await Promise.race([
    f,
    new Promise(
      (l, n) => setTimeout(() => n(new Error("Freenet WS connect timeout")), 12e3)
    )
  ]), { api: o };
}
async function ls() {
  return vn || tn || (tn = ol().then((r) => (vn = r, tn = null, r)).catch((r) => {
    throw tn = null, r;
  }), tn);
}
async function Xo() {
  return (await ls()).api;
}
function cl(r) {
  return r ? r instanceof Uint8Array ? r : Array.isArray(r) ? new Uint8Array(r) : r.data ? new Uint8Array(r.data) : null : null;
}
async function ul(r, i = {}) {
  try {
    return await Pr(r, {
      timeoutMs: i.timeoutMs ?? 8e3,
      subscribe: !1,
      fetchContract: !1
    });
  } catch {
    return null;
  }
}
async function Pr(r, i = {}) {
  const {
    timeoutMs: a = 2e4,
    subscribe: f = !1,
    fetchContract: o = !1
  } = i, { api: c } = await ls(), l = new q.GetRequest(r, o, f, !1), n = await Promise.race([
    c.get(l),
    new Promise(
      (t, e) => setTimeout(() => e(new Error("GET timeout")), a)
    )
  ]);
  if (n instanceof q.GetResponse || n?.state != null) {
    const t = cl(n.state);
    if (!t) throw new Error("empty GET state");
    return t;
  }
  throw new Error("unexpected GET result");
}
function Zo(r, i) {
  return new Promise((a, f) => {
    const o = setTimeout(() => {
      on.delete(c), f(new Error("update notification timeout"));
    }, i), c = (l) => {
      clearTimeout(o), on.delete(c), a(l);
    };
    on.add(c);
  });
}
async function ll(r, i) {
  const { api: a } = await ls(), f = i ? Zo(i, 45e3).catch(() => null) : Promise.resolve(null);
  try {
    await Promise.race([
      a.put(r),
      f,
      new Promise(
        (o, c) => setTimeout(() => c(new Error("PUT timeout")), 45e3)
      )
    ]);
  } catch (o) {
    if (String(o).includes("timeout") && await f) return;
    throw o;
  }
}
async function Ir(r, i) {
  const { api: a } = await ls(), f = i ? Zo(i, 45e3).catch(() => null) : Promise.resolve(null);
  try {
    await Promise.race([
      a.update(r),
      f,
      new Promise(
        (o, c) => setTimeout(() => c(new Error("UPDATE timeout")), 45e3)
      )
    ]);
  } catch (o) {
    if (String(o).includes("timeout") && await f) return;
    throw o;
  }
}
const cn = [198, 187, 222, 173, 215, 177, 246, 202, 225, 230, 58, 42, 2, 42, 182, 28, 178, 67, 93, 134, 212, 17, 134, 73, 91, 215, 38, 109, 112, 150, 219, 36], Sn = [71, 236, 156, 62, 216, 89, 248, 138, 12, 78, 190, 202, 107, 121, 79, 125, 25, 85, 131, 160, 254, 28, 138, 63, 230, 34, 50, 107, 66, 223, 0, 242], fl = "./public/kairos_identity.wasm";
function Yo() {
  return Array.isArray(cn) && cn.length === 32 && Array.isArray(Sn) && Sn.length === 32;
}
/*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
const dl = {
  p: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,
  n: 0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,
  a: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,
  d: 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,
  Gx: 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
  Gy: 0x6666666666666666666666666666666666666666666666666666666666666658n
}, { p: H, n: xn, Gx: Sa, Gy: ja, a: Ps, d: Is } = dl, hl = 8n, xe = 32, Cr = 64, Zt = (r = "") => {
  throw new Error(r);
}, _l = (r) => typeof r == "bigint", Jo = (r) => typeof r == "string", bl = (r) => r instanceof Uint8Array || ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array", $e = (r, i) => !bl(r) || typeof i == "number" && i > 0 && r.length !== i ? Zt("Uint8Array expected") : r, fs = (r) => new Uint8Array(r), Ar = (r) => Uint8Array.from(r), Qo = (r, i) => r.toString(16).padStart(i, "0"), Ur = (r) => Array.from($e(r)).map((i) => Qo(i, 2)).join(""), _e = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 }, Pa = (r) => {
  if (r >= _e._0 && r <= _e._9)
    return r - _e._0;
  if (r >= _e.A && r <= _e.F)
    return r - (_e.A - 10);
  if (r >= _e.a && r <= _e.f)
    return r - (_e.a - 10);
}, Mr = (r) => {
  const i = "hex invalid";
  if (!Jo(r))
    return Zt(i);
  const a = r.length, f = a / 2;
  if (a % 2)
    return Zt(i);
  const o = fs(f);
  for (let c = 0, l = 0; c < f; c++, l += 2) {
    const n = Pa(r.charCodeAt(l)), t = Pa(r.charCodeAt(l + 1));
    if (n === void 0 || t === void 0)
      return Zt(i);
    o[c] = n * 16 + t;
  }
  return o;
}, ds = (r, i) => $e(Jo(r) ? Mr(r) : Ar($e(r)), i), tc = () => globalThis?.crypto, pl = () => tc()?.subtle ?? Zt("crypto.subtle must be defined"), ts = (...r) => {
  const i = fs(r.reduce((f, o) => f + $e(o).length, 0));
  let a = 0;
  return r.forEach((f) => {
    i.set(f, a), a += f.length;
  }), i;
}, ec = (r = xe) => tc().getRandomValues(fs(r)), es = BigInt, He = (r, i, a, f = "bad number: out of range") => _l(r) && i <= r && r < a ? r : Zt(f), T = (r, i = H) => {
  const a = r % i;
  return a >= 0n ? a : i + a;
}, nc = (r) => T(r, xn), sc = (r, i) => {
  (r === 0n || i <= 0n) && Zt("no inverse n=" + r + " mod=" + i);
  let a = T(r, i), f = i, o = 0n, c = 1n;
  for (; a !== 0n; ) {
    const l = f / a, n = f % a, t = o - c * l;
    f = a, a = n, o = c, c = t;
  }
  return f === 1n ? T(o, i) : Zt("no inverse");
}, gl = (r) => {
  const i = ns[r];
  return typeof i != "function" && Zt("hashes." + r + " not set"), i;
}, Ia = (r) => r instanceof Jt ? r : Zt("Point expected"), xs = 2n ** 256n;
class Jt {
  static BASE;
  static ZERO;
  ex;
  ey;
  ez;
  et;
  constructor(i, a, f, o) {
    const c = xs;
    this.ex = He(i, 0n, c), this.ey = He(a, 0n, c), this.ez = He(f, 1n, c), this.et = He(o, 0n, c), Object.freeze(this);
  }
  static fromAffine(i) {
    return new Jt(i.x, i.y, 1n, T(i.x * i.y));
  }
  /** RFC8032 5.1.3: Uint8Array to Point. */
  static fromBytes(i, a = !1) {
    const f = Is, o = Ar($e(i, xe)), c = i[31];
    o[31] = c & -129;
    const l = ic(o);
    He(l, 0n, a ? xs : H);
    const t = T(l * l), e = T(t - 1n), s = T(f * t + 1n);
    let { isValid: u, value: d } = wl(e, s);
    u || Zt("bad point: y not sqrt");
    const h = (d & 1n) === 1n, b = (c & 128) !== 0;
    return !a && d === 0n && b && Zt("bad point: x==0, isLastByteOdd"), b !== h && (d = T(-d)), new Jt(d, l, 1n, T(d * l));
  }
  /** Checks if the point is valid and on-curve. */
  assertValidity() {
    const i = Ps, a = Is, f = this;
    if (f.is0())
      throw new Error("bad point: ZERO");
    const { ex: o, ey: c, ez: l, et: n } = f, t = T(o * o), e = T(c * c), s = T(l * l), u = T(s * s), d = T(t * i), h = T(s * T(d + e)), b = T(u + T(a * T(t * e)));
    if (h !== b)
      throw new Error("bad point: equation left != right (1)");
    const g = T(o * c), w = T(l * n);
    if (g !== w)
      throw new Error("bad point: equation left != right (2)");
    return this;
  }
  /** Equality check: compare points P&Q. */
  equals(i) {
    const { ex: a, ey: f, ez: o } = this, { ex: c, ey: l, ez: n } = Ia(i), t = T(a * n), e = T(c * o), s = T(f * n), u = T(l * o);
    return t === e && s === u;
  }
  is0() {
    return this.equals(sn);
  }
  /** Flip point over y coordinate. */
  negate() {
    return new Jt(T(-this.ex), this.ey, this.ez, T(-this.et));
  }
  /** Point doubling. Complete formula. Cost: `4M + 4S + 1*a + 6add + 1*2`. */
  double() {
    const { ex: i, ey: a, ez: f } = this, o = Ps, c = T(i * i), l = T(a * a), n = T(2n * T(f * f)), t = T(o * c), e = i + a, s = T(T(e * e) - c - l), u = t + l, d = u - n, h = t - l, b = T(s * d), g = T(u * h), w = T(s * h), y = T(d * u);
    return new Jt(b, g, y, w);
  }
  /** Point addition. Complete formula. Cost: `8M + 1*k + 8add + 1*2`. */
  add(i) {
    const { ex: a, ey: f, ez: o, et: c } = this, { ex: l, ey: n, ez: t, et: e } = Ia(i), s = Ps, u = Is, d = T(a * l), h = T(f * n), b = T(c * u * e), g = T(o * t), w = T((a + f) * (l + n) - d - h), y = T(g - b), m = T(g + b), O = T(h - s * d), R = T(w * y), P = T(m * O), U = T(w * O), N = T(y * m);
    return new Jt(R, P, N, U);
  }
  /**
   * Point-by-scalar multiplication. Scalar must be in range 1 <= n < CURVE.n.
   * Uses {@link wNAF} for base point.
   * Uses fake point to mitigate side-channel leakage.
   * @param n scalar by which point is multiplied
   * @param safe safe mode guards against timing attacks; unsafe mode is faster
   */
  multiply(i, a = !0) {
    if (!a && (i === 0n || this.is0()))
      return sn;
    if (He(i, 1n, xn), i === 1n)
      return this;
    if (this.equals(Se))
      return jl(i).p;
    let f = sn, o = Se;
    for (let c = this; i > 0n; c = c.double(), i >>= 1n)
      i & 1n ? f = f.add(c) : a && (o = o.add(c));
    return f;
  }
  /** Convert point to 2d xy affine point. (X, Y, Z) ∋ (x=X/Z, y=Y/Z) */
  toAffine() {
    const { ex: i, ey: a, ez: f } = this;
    if (this.equals(sn))
      return { x: 0n, y: 1n };
    const o = sc(f, H);
    return T(f * o) !== 1n && Zt("invalid inverse"), { x: T(i * o), y: T(a * o) };
  }
  toBytes() {
    const { x: i, y: a } = this.assertValidity().toAffine(), f = rc(a);
    return f[31] |= i & 1n ? 128 : 0, f;
  }
  toHex() {
    return Ur(this.toBytes());
  }
  // encode to hex string
  clearCofactor() {
    return this.multiply(es(hl), !1);
  }
  isSmallOrder() {
    return this.clearCofactor().is0();
  }
  isTorsionFree() {
    let i = this.multiply(xn / 2n, !1).double();
    return xn % 2n && (i = i.add(this)), i.is0();
  }
  static fromHex(i, a) {
    return Jt.fromBytes(ds(i), a);
  }
  get x() {
    return this.toAffine().x;
  }
  get y() {
    return this.toAffine().y;
  }
  toRawBytes() {
    return this.toBytes();
  }
}
const Se = new Jt(Sa, ja, 1n, T(Sa * ja)), sn = new Jt(0n, 1n, 1n, 0n);
Jt.BASE = Se;
Jt.ZERO = sn;
const rc = (r) => Mr(Qo(He(r, 0n, xs), Cr)).reverse(), ic = (r) => es("0x" + Ur(Ar($e(r)).reverse())), ce = (r, i) => {
  let a = r;
  for (; i-- > 0n; )
    a *= a, a %= H;
  return a;
}, yl = (r) => {
  const a = r * r % H * r % H, f = ce(a, 2n) * a % H, o = ce(f, 1n) * r % H, c = ce(o, 5n) * o % H, l = ce(c, 10n) * c % H, n = ce(l, 20n) * l % H, t = ce(n, 40n) * n % H, e = ce(t, 80n) * t % H, s = ce(e, 80n) * t % H, u = ce(s, 10n) * c % H;
  return { pow_p_5_8: ce(u, 2n) * r % H, b2: a };
}, Ca = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n, wl = (r, i) => {
  const a = T(i * i * i), f = T(a * a * i), o = yl(r * f).pow_p_5_8;
  let c = T(r * a * o);
  const l = T(i * c * c), n = c, t = T(c * Ca), e = l === r, s = l === T(-r), u = l === T(-r * Ca);
  return e && (c = n), (s || u) && (c = t), (T(c) & 1n) === 1n && (c = T(-c)), { isValid: e || s, value: c };
}, $s = (r) => nc(ic(r)), Er = (...r) => ns.sha512Async(...r), ml = (...r) => gl("sha512Sync")(...r), ac = (r) => {
  const i = r.slice(0, xe);
  i[0] &= 248, i[31] &= 127, i[31] |= 64;
  const a = r.slice(xe, Cr), f = $s(i), o = Se.multiply(f), c = o.toBytes();
  return { head: i, prefix: a, scalar: f, point: o, pointBytes: c };
}, qr = (r) => Er(ds(r, xe)).then(ac), oc = (r) => ac(ml(ds(r, xe))), vl = (r) => qr(r).then((i) => i.pointBytes), Ol = (r) => oc(r).pointBytes, Rl = (r) => Er(r.hashable).then(r.finish), Tl = (r, i, a) => {
  const { pointBytes: f, scalar: o } = r, c = $s(i), l = Se.multiply(c).toBytes();
  return { hashable: ts(l, f, a), finish: (e) => {
    const s = nc(c + $s(e) * o);
    return $e(ts(l, rc(s)), Cr);
  } };
}, hs = async (r, i) => {
  const a = ds(r), f = await qr(i), o = await Er(f.prefix, a);
  return Rl(Tl(f, o, a));
}, ns = {
  sha512Async: async (...r) => {
    const i = pl(), a = ts(...r);
    return fs(await i.digest("SHA-512", a.buffer));
  },
  sha512Sync: void 0,
  bytesToHex: Ur,
  hexToBytes: Mr,
  concatBytes: ts,
  mod: T,
  invert: sc,
  randomBytes: ec
}, cc = {
  getExtendedPublicKeyAsync: qr,
  getExtendedPublicKey: oc,
  randomPrivateKey: () => ec(xe),
  precompute: (r = 8, i = Se) => (i.multiply(3n), i)
  // no-op
}, ss = 8, Dl = 256, uc = Math.ceil(Dl / ss) + 1, Ws = 2 ** (ss - 1), Sl = () => {
  const r = [];
  let i = Se, a = i;
  for (let f = 0; f < uc; f++) {
    a = i, r.push(a);
    for (let o = 1; o < Ws; o++)
      a = a.add(i), r.push(a);
    i = a.double();
  }
  return r;
};
let Aa;
const Ua = (r, i) => {
  const a = i.negate();
  return r ? a : i;
}, jl = (r) => {
  const i = Aa || (Aa = Sl());
  let a = sn, f = Se;
  const o = 2 ** ss, c = o, l = es(o - 1), n = es(ss);
  for (let t = 0; t < uc; t++) {
    let e = Number(r & l);
    r >>= n, e > Ws && (e -= c, r += 1n);
    const s = t * Ws, u = s, d = s + Math.abs(e) - 1, h = t % 2 !== 0, b = e < 0;
    e === 0 ? f = f.add(Ua(h, i[u])) : a = a.add(Ua(b, i[d]));
  }
  return { p: a, f };
}, lc = Du([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((r) => BigInt(r))), Pl = lc[0], Il = lc[1], me = /* @__PURE__ */ new Uint32Array(80), ve = /* @__PURE__ */ new Uint32Array(80);
class Cl extends Ru {
  constructor(i = 64) {
    super(128, i, 16, !1), this.Ah = B[0] | 0, this.Al = B[1] | 0, this.Bh = B[2] | 0, this.Bl = B[3] | 0, this.Ch = B[4] | 0, this.Cl = B[5] | 0, this.Dh = B[6] | 0, this.Dl = B[7] | 0, this.Eh = B[8] | 0, this.El = B[9] | 0, this.Fh = B[10] | 0, this.Fl = B[11] | 0, this.Gh = B[12] | 0, this.Gl = B[13] | 0, this.Hh = B[14] | 0, this.Hl = B[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah: i, Al: a, Bh: f, Bl: o, Ch: c, Cl: l, Dh: n, Dl: t, Eh: e, El: s, Fh: u, Fl: d, Gh: h, Gl: b, Hh: g, Hl: w } = this;
    return [i, a, f, o, c, l, n, t, e, s, u, d, h, b, g, w];
  }
  // prettier-ignore
  set(i, a, f, o, c, l, n, t, e, s, u, d, h, b, g, w) {
    this.Ah = i | 0, this.Al = a | 0, this.Bh = f | 0, this.Bl = o | 0, this.Ch = c | 0, this.Cl = l | 0, this.Dh = n | 0, this.Dl = t | 0, this.Eh = e | 0, this.El = s | 0, this.Fh = u | 0, this.Fl = d | 0, this.Gh = h | 0, this.Gl = b | 0, this.Hh = g | 0, this.Hl = w | 0;
  }
  process(i, a) {
    for (let O = 0; O < 16; O++, a += 4)
      me[O] = i.getUint32(a), ve[O] = i.getUint32(a += 4);
    for (let O = 16; O < 80; O++) {
      const R = me[O - 15] | 0, P = ve[O - 15] | 0, U = Ye(R, P, 1) ^ Ye(R, P, 8) ^ ei(R, P, 7), N = Je(R, P, 1) ^ Je(R, P, 8) ^ ni(R, P, 7), L = me[O - 2] | 0, D = ve[O - 2] | 0, C = Ye(L, D, 19) ^ qn(L, D, 61) ^ ei(L, D, 6), K = Je(L, D, 19) ^ Nn(L, D, 61) ^ ni(L, D, 6), F = Pu(N, K, ve[O - 7], ve[O - 16]), E = Iu(F, U, C, me[O - 7], me[O - 16]);
      me[O] = E | 0, ve[O] = F | 0;
    }
    let { Ah: f, Al: o, Bh: c, Bl: l, Ch: n, Cl: t, Dh: e, Dl: s, Eh: u, El: d, Fh: h, Fl: b, Gh: g, Gl: w, Hh: y, Hl: m } = this;
    for (let O = 0; O < 80; O++) {
      const R = Ye(u, d, 14) ^ Ye(u, d, 18) ^ qn(u, d, 41), P = Je(u, d, 14) ^ Je(u, d, 18) ^ Nn(u, d, 41), U = u & h ^ ~u & g, N = d & b ^ ~d & w, L = Cu(m, P, N, Il[O], ve[O]), D = Au(L, y, R, U, Pl[O], me[O]), C = L | 0, K = Ye(f, o, 28) ^ qn(f, o, 34) ^ qn(f, o, 39), F = Je(f, o, 28) ^ Nn(f, o, 34) ^ Nn(f, o, 39), E = f & c ^ f & n ^ c & n, Yt = o & l ^ o & t ^ l & t;
      y = g | 0, m = w | 0, g = h | 0, w = b | 0, h = u | 0, b = d | 0, { h: u, l: d } = de(e | 0, s | 0, D | 0, C | 0), e = n | 0, s = t | 0, n = c | 0, t = l | 0, c = f | 0, l = o | 0;
      const te = Su(C, F, Yt);
      f = ju(te, D, K, E), o = te | 0;
    }
    ({ h: f, l: o } = de(this.Ah | 0, this.Al | 0, f | 0, o | 0)), { h: c, l } = de(this.Bh | 0, this.Bl | 0, c | 0, l | 0), { h: n, l: t } = de(this.Ch | 0, this.Cl | 0, n | 0, t | 0), { h: e, l: s } = de(this.Dh | 0, this.Dl | 0, e | 0, s | 0), { h: u, l: d } = de(this.Eh | 0, this.El | 0, u | 0, d | 0), { h, l: b } = de(this.Fh | 0, this.Fl | 0, h | 0, b | 0), { h: g, l: w } = de(this.Gh | 0, this.Gl | 0, g | 0, w | 0), { h: y, l: m } = de(this.Hh | 0, this.Hl | 0, y | 0, m | 0), this.set(f, o, c, l, n, t, e, s, u, d, h, b, g, w, y, m);
  }
  roundClean() {
    Ke(me, ve);
  }
  destroy() {
    Ke(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
const Al = /* @__PURE__ */ mu(() => new Cl()), Ul = Al;
ns.sha512Sync = (...r) => Ul(ns.concatBytes(...r));
const Fn = "kairos.witness.sk.v2", Vn = "kairos.witness.label.v2", zs = "__kairos_store_v1__";
let kn = null, Cs = null, As = null;
function Ml(r) {
  let i = "";
  for (let a = 0; a < r.length; a++) i += String.fromCharCode(r[a]);
  return btoa(i);
}
function El(r) {
  const i = atob(r), a = new Uint8Array(i.length);
  for (let f = 0; f < i.length; f++) a[f] = i.charCodeAt(f);
  return a;
}
function Nr() {
  try {
    const r = String(window.name || "");
    if (!r.startsWith(zs)) return {};
    const i = JSON.parse(r.slice(zs.length));
    return i && typeof i == "object" ? i : {};
  } catch {
    return {};
  }
}
function fc(r, i) {
  try {
    const a = Nr();
    a[r] = i, window.name = zs + JSON.stringify(a);
  } catch {
  }
}
function Xs(r) {
  try {
    return localStorage.getItem(r);
  } catch {
    return null;
  }
}
function dc(r, i) {
  try {
    return localStorage.setItem(r, i), !0;
  } catch {
    return !1;
  }
}
function Us(r) {
  if (!r || typeof r != "string") return null;
  try {
    const i = El(r);
    return i.length === 32 ? i : null;
  } catch {
    return null;
  }
}
function hc(r) {
  return `kairos-${String(r || "xxxx").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toLowerCase() || "node"}`;
}
function _c(r) {
  return hc(r);
}
function ql() {
  if (Cs?.length === 32) return Cs;
  let r = Us(Xs(Fn)) || Us(Nr()[Fn]) || null;
  r || (r = Us(Xs("kairos.witness.sk"))), r || (r = cc.randomPrivateKey()), Cs = r;
  const i = Ml(r);
  return dc(Fn, i), fc(Fn, i), r;
}
function Nl(r) {
  if (As) return As;
  const i = Xs(Vn) || Nr()[Vn] || null, a = i && String(i).trim() ? String(i).trim() : hc(r);
  return As = a, dc(Vn, a), fc(Vn, a), a;
}
async function bc() {
  if (kn) return kn;
  const r = ql(), i = await vl(r), a = De.encode(i), f = Nl(a);
  return kn = {
    secretKey: r,
    publicKey: i,
    nodeId: a,
    label: f,
    backend: "local"
  }, kn;
}
async function Ma() {
  const r = await bc();
  return {
    nodeId: r.nodeId,
    label: r.label,
    backend: r.backend || "local",
    shortId: r.nodeId.slice(0, 12)
  };
}
function Ll(r) {
  const i = new TextEncoder(), a = [];
  for (const l of r)
    a.push(i.encode(String(l))), a.push(new Uint8Array([0]));
  const f = a.reduce((l, n) => l + n.length, 0), o = new Uint8Array(f);
  let c = 0;
  for (const l of a)
    o.set(l, c), c += l.length;
  return o;
}
async function pc(r, i, a) {
  const f = await bc(), o = new TextEncoder().encode(r), c = Ll([...i, f.nodeId, ...a]), l = new Uint8Array(o.length + c.length);
  l.set(o, 0), l.set(c, o.length);
  const n = await hs(l, f.secretKey);
  return {
    node_id: f.nodeId,
    wall_ms: a[0],
    monotonic_ms: a[1],
    uncertainty_ms: a[2],
    sig: yu(n)
  };
}
async function Fl({ wall_ms: r, monotonic_ms: i, uncertainty_ms: a }) {
  return pc("kairos.pulse.v1\0", [], [
    r,
    i,
    a
  ]);
}
async function Vl(r, { wall_ms: i, monotonic_ms: a, uncertainty_ms: f }) {
  return pc("kairos.stamp.observe.v1\0", [r], [
    i,
    a,
    f
  ]);
}
let Bn = null, Oe = null;
function Ea(r, i) {
  if (!r || !i || r.length !== i.length) return !1;
  for (let a = 0; a < r.length; a++) if (r[a] !== i[a]) return !1;
  return !0;
}
function Lr() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function kl() {
  const r = new Uint8Array(32);
  return crypto.getRandomValues(r), Array.from(r);
}
function Fr(r, i = 2e4) {
  return new Promise((a, f) => {
    let o = !1;
    const c = (s) => {
      o || (o = !0, clearTimeout(l), e(), n(), t(), s());
    }, l = setTimeout(() => {
      c(() => f(new Error("delegate response timeout")));
    }, i), n = il((s) => c(() => f(s))), t = rl((s) => c(() => f(s))), e = nl((s) => {
      for (const u of s)
        r(u) && c(() => a(u));
    });
  });
}
async function Vr(r) {
  const i = await Xo(), a = Array.from(
    new TextEncoder().encode(JSON.stringify(r))
  ), f = await Promise.resolve().then(() => us), {
    ClientRequestT: o,
    ClientRequestType: c,
    ApplicationMessagesT: l,
    DelegateKeyT: n,
    DelegateRequestType: t,
    InboundDelegateMsgT: e,
    InboundDelegateMsgType: s
  } = f, { ApplicationMessageT: u } = await Promise.resolve().then(() => Wo), d = new u(a, [], !1), h = new e(
    s.common_ApplicationMessage,
    d
  ), b = new n(
    Sn,
    cn
  ), g = new l(b, [], [h]), w = new q.DelegateRequest(
    t.ApplicationMessages,
    g
  ), y = new o(
    c.DelegateRequest,
    w
  );
  i.sendRequest(y);
}
async function Bl() {
  if (!Yo())
    throw new Error("kairos-identity constants missing — run scripts/build.sh");
  const r = fl, i = await fetch(r);
  if (!i.ok) throw new Error(`failed to fetch ${r}: ${i.status}`);
  const a = new Uint8Array(await i.arrayBuffer()), f = Array.from(ge(a));
  if (!Ea(f, cn))
    throw new Error(
      "kairos-identity WASM BLAKE3 mismatch — rebuild + republish website"
    );
  const o = await Promise.resolve().then(() => us), {
    ClientRequestT: c,
    ClientRequestType: l,
    DelegateRequestType: n,
    DelegateType: t,
    RegisterDelegateT: e,
    DelegateContainerT: s,
    WasmDelegateV1T: u,
    DelegateCodeT: d,
    DelegateKeyT: h
  } = o, b = new d(Array.from(a), cn), g = new h(
    Sn,
    cn
  ), w = new u([], b, g), y = new s(
    t.WasmDelegateV1,
    w
  ), m = new e(
    y,
    kl(),
    new Array(24).fill(0)
  ), O = new q.DelegateRequest(
    n.RegisterDelegate,
    m
  ), R = new c(
    l.DelegateRequest,
    O
  ), P = await Xo(), U = new Promise((N, L) => {
    const D = setTimeout(() => {
      C(), L(new Error("RegisterDelegate kairos-identity timed out"));
    }, 45e3), C = sl((K) => {
      const F = K.key?.key;
      !F || !Ea(F, Sn) || (clearTimeout(D), C(), N());
    });
  });
  P.sendRequest(R);
  try {
    await U;
  } catch (N) {
    try {
      await gc(8e3);
      return;
    } catch {
      throw N;
    }
  }
}
async function gc(r = 2e4) {
  const i = Lr(), a = Fr(
    (o) => (o.type === "Identity" || o.type === "Error") && (!o.nonce || o.nonce === i),
    r
  );
  await Vr({ type: "EnsureIdentity", nonce: i });
  const f = await a;
  if (f.type === "Error")
    throw new Error(f.message || "EnsureIdentity failed");
  return Oe = {
    nodeId: f.node_id,
    label: f.label,
    backend: "delegate",
    created: !!f.created
  }, Oe;
}
async function jn(r) {
  if (Oe?.backend === "delegate") return Oe;
  if (!Yo())
    return r?.("Identity: local durable key (delegate not built)"), Oe = { ...await Ma(), backend: "local" }, Oe;
  try {
    return r?.("Registering kairos-identity delegate…"), Bn || (Bn = Bl().catch((i) => {
      throw Bn = null, i;
    })), await Bn, r?.("Ensuring witness identity…"), await gc();
  } catch (i) {
    return console.warn("[kairos] delegate identity unavailable, using local:", i), r?.(
      `Identity: local fallback (${i instanceof Error ? i.message : String(i)})`
    ), Oe = { ...await Ma(), backend: "local" }, Oe;
  }
}
async function yc(r) {
  return jn(r);
}
function wc(r, i) {
  const a = i instanceof Error ? i.message : String(i);
  return new Error(`Kairos delegate ${r} signing failed; refusing local fallback: ${a}`);
}
function mc(r, i, a) {
  if (a?.type === "Error")
    throw new Error(a.message || `Kairos delegate ${r} failed`);
  if (!a?.node_id || a.node_id !== i.nodeId)
    throw new Error(`Kairos delegate ${r} returned an unexpected identity`);
  return a;
}
async function Hl(r) {
  const i = await jn();
  if (i.backend !== "delegate") return Fl(r);
  try {
    const a = Lr(), f = Fr(
      (c) => (c.type === "SignedObservation" || c.type === "Error") && c.nonce === a,
      2e4
    );
    await Vr({
      type: "SignPulse",
      nonce: a,
      wall_ms: r.wall_ms,
      monotonic_ms: r.monotonic_ms,
      uncertainty_ms: r.uncertainty_ms
    });
    const o = mc("pulse", i, await f);
    return {
      node_id: o.node_id,
      wall_ms: o.wall_ms,
      monotonic_ms: o.monotonic_ms,
      uncertainty_ms: o.uncertainty_ms,
      sig: o.sig
    };
  } catch (a) {
    throw wc("pulse", a);
  }
}
async function Kl(r, i) {
  const a = await jn();
  if (a.backend !== "delegate") return Vl(r, i);
  try {
    const f = Lr(), o = Fr(
      (l) => (l.type === "SignedObservation" || l.type === "Error") && l.nonce === f,
      2e4
    );
    await Vr({
      type: "SignStampObserve",
      nonce: f,
      request_id: r,
      wall_ms: i.wall_ms,
      monotonic_ms: i.monotonic_ms,
      uncertainty_ms: i.uncertainty_ms
    });
    const c = mc("stamp observation", a, await o);
    return {
      node_id: c.node_id,
      wall_ms: c.wall_ms,
      monotonic_ms: c.monotonic_ms,
      uncertainty_ms: c.uncertainty_ms,
      sig: c.sig
    };
  } catch (f) {
    throw wc("stamp observation", f);
  }
}
const Gl = 5 * 6e4, xl = 3e4, $l = 0.5, Wl = 15 * 6e4, vc = 9e4;
function qa(r, i, a) {
  return Math.max(i, Math.min(a, r));
}
function zl(r, i = Gl) {
  const a = Array.isArray(r) ? r : [];
  if (!a.length) return [];
  let f = 0;
  for (const o of a) {
    const c = Number(o?.wall_ms) || 0;
    c > f && (f = c);
  }
  return f ? a.filter((o) => f - (Number(o?.wall_ms) || 0) <= i) : a;
}
function Xl({
  prev: r,
  gotAt: i,
  medianMs: a,
  confidenceMs: f = 80,
  maxJumpMs: o = vc,
  slewFactor: c = $l,
  maxSlewMs: l = xl,
  maxElapsedMs: n = Wl
}) {
  if (a == null || !Number.isFinite(a)) return null;
  if (!r || r.otp_time_ms == null || r.got_at_ms == null)
    return {
      otp_time_ms: a,
      confidence_ms: f,
      jump_blocked: !1,
      source: "bootstrap",
      slew_ms: 0
    };
  const t = i - r.got_at_ms;
  if (!Number.isFinite(t) || t > n)
    return {
      otp_time_ms: Math.max(a, r.otp_time_ms),
      confidence_ms: Math.max(f, o),
      jump_blocked: !1,
      source: "reanchor",
      slew_ms: 0
    };
  const s = qa(t, 0, n), u = r.otp_time_ms + s, d = a - u;
  if (Math.abs(d) > o)
    return {
      otp_time_ms: r.otp_time_ms,
      confidence_ms: Math.max(f, o),
      jump_blocked: !0,
      source: "hold",
      slew_ms: 0
    };
  const h = qa(Math.round(d * c), -l, l), b = u + h;
  return {
    otp_time_ms: Math.max(b, r.otp_time_ms),
    confidence_ms: f,
    jump_blocked: !1,
    source: "anchored",
    slew_ms: h
  };
}
const Zs = JSON.stringify({
  schema_version: 2,
  roster: {},
  pulse: {},
  open_stamps: {},
  sealed_stamps: {}
}), le = 36e5, Ms = 500, Zl = 300, Es = 10, Yl = 3, Na = 168 * 36e5, Jl = 1, Ql = 15 * 6e4, tf = 12 * 6e4, _n = /* @__PURE__ */ new Map();
function ef(r, i = Date.now()) {
  const a = Array.isArray(r) ? r : [], f = new Set(a.map((c) => c.node_id));
  for (const c of [..._n.keys()])
    f.has(c) || _n.delete(c);
  const o = [];
  for (const c of a) {
    if (!c?.node_id) continue;
    const l = i - Number(c.wall_ms), n = _n.get(c.node_id);
    if (n != null) {
      Number(c.wall_ms) > n && l <= tf && (_n.delete(c.node_id), o.push(c));
      continue;
    }
    if (l > Ql) {
      _n.set(c.node_id, Number(c.wall_ms));
      continue;
    }
    o.push(c);
  }
  return o;
}
function Ys(r) {
  if (!r?.length)
    return JSON.parse(Zs);
  const i = JSON.parse(new TextDecoder().decode(r));
  return i.roster = i.roster || {}, i.pulse = i.pulse || {}, i.open_stamps = i.open_stamps || i.open || {}, i.sealed_stamps = i.sealed_stamps || i.sealed || {}, i;
}
async function Pe(r) {
  const i = $o();
  if (!i || !Xn)
    throw new Error("Kairos constants missing — run scripts/build.sh");
  r?.("Looking up Kairos contract…");
  const a = await ul(i, { timeoutMs: 6e3 });
  if (a)
    return r?.("Kairos contract found — subscribing…"), await Pr(i, {
      fetchContract: !0,
      subscribe: !0,
      timeoutMs: 15e3
    }).catch(() => a), { key: i, created: !1, state: Ys(a) };
  r?.("Kairos missing — publishing to this node…");
  const f = await fetch(Qr);
  if (!f.ok)
    throw new Error(`failed to fetch ${Qr}: ${f.status}`);
  const o = new Uint8Array(await f.arrayBuffer()), c = new TextEncoder().encode(Zs), l = Xu(
    o,
    Xn,
    xo(),
    c
  );
  return await ll(l, i), r?.("Kairos contract created on this node"), {
    key: i,
    created: !0,
    state: Ys(new TextEncoder().encode(Zs))
  };
}
async function Te() {
  const r = $o(), i = await Pr(r, {
    fetchContract: !0,
    subscribe: !0,
    timeoutMs: 15e3
  });
  return Ys(i);
}
async function Oc(r) {
  const { key: i } = await Pe(r);
  await jn(r);
  const a = Date.now(), f = typeof performance < "u" ? Math.floor(performance.now()) : 0, o = await Hl({
    wall_ms: a,
    monotonic_ms: f,
    uncertainty_ms: 40
  });
  r?.("Submitting pulse…");
  const c = new TextEncoder().encode(JSON.stringify({ pulse: o }));
  return await Ir(jr(i, c), i), o;
}
async function nf(r, i, a) {
  const { key: f } = await Pe(a), o = new TextEncoder().encode(
    JSON.stringify({
      open_stamp: { content_hash: r, nonce: i }
    })
  );
  return a?.("Opening stamp request…"), await Ir(jr(f, o), f), `${r}:${i}`;
}
async function sf(r, i) {
  const { key: a } = await Pe(i);
  await jn(i);
  const f = Date.now(), o = typeof performance < "u" ? Math.floor(performance.now()) : 0, c = await Kl(r, {
    wall_ms: f,
    monotonic_ms: o,
    uncertainty_ms: 40
  });
  i?.("Submitting stamp observation…");
  const l = new TextEncoder().encode(
    JSON.stringify({
      observe_stamp: { request_id: r, observation: c }
    })
  );
  return await Ir(jr(a, l), a), c;
}
function rf(r) {
  const i = ef(Object.values(r.pulse || {})), a = Object.values(r.roster || {}), f = a.filter(
    (s) => s.last_seen_ms - s.first_seen_ms >= le
  ).length;
  if (!i.length)
    return {
      witness_count: 0,
      eligible_count: f,
      roster_count: a.length,
      median_wall_ms: null,
      confidence_ms: null,
      median_abs_dev_ms: null,
      observations: [],
      sealed_count: Object.keys(r.sealed_stamps || {}).length,
      open_count: Object.keys(r.open_stamps || {}).length
    };
  const o = i.map((s) => s.wall_ms).sort((s, u) => s - u), c = On(o), l = On(
    i.map((s) => Math.abs(s.wall_ms - c)).sort((s, u) => s - u)
  ), n = On(
    i.map((s) => s.uncertainty_ms).sort((s, u) => s - u)
  ), t = Math.max(n, Math.round(1.4826 * l), 1), e = [...i].sort(
    (s, u) => String(s.node_id).localeCompare(String(u.node_id))
  );
  return {
    witness_count: e.length,
    eligible_count: f,
    roster_count: a.length,
    median_wall_ms: c,
    confidence_ms: t,
    median_abs_dev_ms: l,
    observations: e,
    sealed_count: Object.keys(r.sealed_stamps || {}).length,
    open_count: Object.keys(r.open_stamps || {}).length
  };
}
function Rc(r) {
  if (!r) return Ms;
  const i = Number(r.seals_included) || 0, a = Number(r.seals_outlier) || 0, f = i + a;
  if (!f) return Ms;
  const o = Math.floor(i * 1e3 / f), c = Math.min(f, Es);
  return Math.floor((o * c + Ms * (Es - c)) / Es);
}
function af(r, i) {
  if (!r) return 0;
  const a = i - r.first_seen_ms;
  if (a < le) return 0;
  const f = Math.max(1, Rc(r)), o = Math.min(Math.max(0, a - le), Na), c = 1e3 + Math.floor(o * 3e3 / Math.max(Na, 1));
  return Math.min(64, Math.max(1, Math.floor(f * c / 1e5)));
}
function of(r) {
  if (!r.length) return null;
  const i = [...r].sort((c, l) => c.wall - l.wall), a = i.reduce((c, l) => c + l.weight, 0);
  if (!a) return i[Math.floor(i.length / 2)].wall;
  const f = Math.ceil(a / 2);
  let o = 0;
  for (const c of i)
    if (o += c.weight, o >= f) return c.wall;
  return i[i.length - 1].wall;
}
function Tc(r) {
  const i = r.roster || {}, a = Object.keys(r.sealed_stamps || {}).length, f = zl(Object.values(r.pulse || {})), o = [];
  for (const d of f) {
    const h = i[d.node_id];
    if (!h || d.wall_ms - h.first_seen_ms < le || a >= Yl && Rc(h) < Zl)
      continue;
    const g = af(h, d.wall_ms);
    g > 0 && o.push({ wall: d.wall_ms, weight: g, unc: d.uncertainty_ms, o: d });
  }
  let c = o, l = "aged";
  if (o.length < Jl && (c = f.map((d) => ({
    wall: d.wall_ms,
    weight: 1,
    unc: d.uncertainty_ms,
    o: d
  })), l = "bootstrap"), !c.length)
    return {
      median_wall_ms: null,
      confidence_ms: null,
      witness_count: 0,
      trusted_count: 0,
      trusted_mode: l,
      sealed_count: a
    };
  const n = of(c.map((d) => ({ wall: d.wall, weight: d.weight }))), t = c.map((d) => d.wall).sort((d, h) => d - h), e = On(
    t.map((d) => Math.abs(d - n)).sort((d, h) => d - h)
  ), s = On(c.map((d) => d.unc).sort((d, h) => d - h));
  let u = Math.max(s, Math.round(1.4826 * e), 1);
  return l === "bootstrap" && (u = Math.max(u, 5e3)), {
    median_wall_ms: n,
    confidence_ms: u,
    median_abs_dev_ms: e,
    witness_count: c.length,
    trusted_count: o.length,
    trusted_mode: l,
    sealed_count: a,
    observations: c.map((d) => d.o)
  };
}
function On(r) {
  if (!r.length) return 0;
  const i = Math.floor(r.length / 2);
  return r.length % 2 ? r[i] : Math.round((r[i - 1] + r[i]) / 2);
}
const $n = 5, cf = 5, uf = 8e3, Dc = "kairos.public.example.v1", Sc = "v1", Xt = `${Dc}:${Sc}`;
async function lf(r, i) {
  return r?.sealed_stamps?.[Xt] || r?.open_stamps?.[Xt] ? { opened: !1, request_id: Xt } : (i?.("Opening public example stamp…"), await nf(Dc, Sc, i), { opened: !0, request_id: Xt });
}
function Js(r, i, a = {}) {
  const f = i?.nodeId || null, o = f ? r.roster?.[f] : null, c = o ? o.last_seen_ms - o.first_seen_ms : 0, l = !!(o && c >= le), n = Object.entries(r.open_stamps || {}), t = a.maxObserve ?? cf, e = l ? n.filter(([, d]) => !d.observations?.[f]).map(([d]) => d).slice(0, t) : [], s = [];
  a.pulse !== !1 && s.push({
    type: "pulse",
    reason: o ? "keep-alive + accrue roster age" : "join roster + keep-alive"
  });
  for (const d of e)
    s.push({
      type: "observe_stamp",
      request_id: d,
      reason: "age-eligible — help seal open request"
    });
  let u;
  return o ? l ? e.length ? u = `pulse + observe ${e.length} open` : n.length ? u = "pulse · eligible · already observed open" : u = "pulse · eligible · no open requests" : u = `pulse · aging ${c} / ${le} ms` : u = "pulse · join roster", {
    schema: "kairos.network.duty.v1",
    node_id: f,
    roster_age_ms: c,
    min_age_ms: le,
    stamp_eligible: l,
    open_count: n.length,
    sealed_count: Object.keys(r.sealed_stamps || {}).length,
    min_stamp_witnesses: $n,
    actions: s,
    summary: u
  };
}
async function ff(r, i = {}) {
  await Pe(r);
  const a = await yc(r), f = await Te();
  return {
    identity: a,
    state: f,
    plan: Js(f, a, i)
  };
}
async function df(r, i = {}) {
  await Pe(r);
  const a = await yc(r);
  let f = await Te(), o = { opened: !1, request_id: Xt };
  if (i.ensureExample !== !1)
    try {
      o = await lf(f, r), o.opened && (f = await Te());
    } catch (n) {
      o = {
        opened: !1,
        request_id: Xt,
        error: n instanceof Error ? n.message : String(n)
      };
    }
  const c = Js(f, a, i), l = {
    identity: a,
    plan: c,
    pulsed: !1,
    observed: [],
    example: o,
    errors: [],
    state: f
  };
  for (const n of c.actions)
    try {
      n.type === "pulse" ? (r?.(c.summary), await Oc(r), l.pulsed = !0) : n.type === "observe_stamp" && n.request_id && (r?.(`Observing ${n.request_id}…`), await sf(n.request_id, r), l.observed.push(n.request_id));
    } catch (t) {
      l.errors.push({
        action: n,
        error: t instanceof Error ? t.message : String(t)
      });
    }
  return (l.pulsed || l.observed.length || o.opened) && (f = await Te(), l.state = f), l.plan_after = Js(f, a, {
    ...i,
    pulse: !1
  }), l;
}
function hf(r = {}) {
  const {
    onDuty: i,
    onStatus: a,
    onError: f,
    intervalMs: o = uf,
    runOnUpdate: c = !0
  } = r;
  let l = !1, n = !1, t = null, e = () => {
  }, s = null;
  async function u(d) {
    if (!l) {
      if (n) {
        t = d;
        return;
      }
      n = !0;
      try {
        let h;
        if (d === "update" || d === "queued-update") {
          const b = await ff((g) => a?.(g, d));
          h = {
            identity: b.identity,
            plan: b.plan,
            pulsed: !1,
            observed: [],
            example: { opened: !1, request_id: Xt },
            errors: [],
            state: b.state,
            plan_after: b.plan
          };
        } else
          h = await df((b) => a?.(b, d));
        l || i?.(h, d);
      } catch (h) {
        l || f?.(h);
      } finally {
        if (n = !1, t && !l) {
          const h = t;
          t = null, u(h === "update" ? "queued-update" : h);
        }
      }
    }
  }
  return (async () => {
    try {
      if (await Pe(a), l) return;
      await Te(), c && (e = zo(() => {
        u("update");
      })), await u("initial"), s = setInterval(() => void u("interval"), o);
    } catch (d) {
      l || f?.(d);
    }
  })(), () => {
    l = !0, e(), s && clearInterval(s);
  };
}
const kr = "tyche-random-v3-reliability-20260731", _f = "G1NeWjKr3z1uuF3XmqM46bYwiY74gKnrofpUeiGmsHRc";
function bf() {
  return new TextEncoder().encode(kr);
}
function pf() {
  const r = De.decode(_f), i = bf(), a = new Uint8Array(r.length + i.length);
  return a.set(r), a.set(i, r.length), new q.ContractKey(ge(a), r);
}
function gf() {
  const r = globalThis.location;
  return new URL(`${r?.protocol === "https:" ? "wss:" : "ws:"}//${r?.host || "127.0.0.1:7509"}/v1/contract/command`);
}
let Hn = null, en = null;
const un = /* @__PURE__ */ new Set(), Qs = /* @__PURE__ */ new Set(), tr = /* @__PURE__ */ new Set();
function yf(r) {
  const i = [];
  for (const a of r?.values || [])
    if (!(a.inboundType !== 1 || !a.inbound?.payload?.length))
      try {
        i.push(JSON.parse(new TextDecoder().decode(new Uint8Array(a.inbound.payload))));
      } catch {
      }
  return i;
}
async function wf() {
  let r, i;
  const a = new Promise((c, l) => {
    r = c, i = l;
  });
  let f;
  const o = { onOpen: r, onContractPut: () => {
  }, onContractGet: () => {
  }, onContractUpdate: () => {
  }, onContractUpdateNotification: (c) => {
    for (const l of un) l(c?.key, c);
  }, onContractNotFound: () => {
  }, onDelegateResponse: (c) => {
    for (const n of tr) n(c);
    const l = yf(c);
    for (const n of Qs) n(l);
  }, onErr: (c) => i(new Error(String(c?.cause || c))), onClose: (c, l) => i(new Error(`Connection closed: ${c} ${l || ""}`)) };
  return f = new q.FreenetWsApi(gf(), o, ""), await Promise.race([a, new Promise((c, l) => setTimeout(() => l(new Error("Freenet WS connect timeout")), 12e3))]), { api: f };
}
async function jc() {
  return Hn || en || (en = wf().then((r) => (Hn = r, en = null, r)).catch((r) => (en = null, Hn = null, Promise.reject(r))), en);
}
async function Br() {
  return (await jc()).api;
}
function mf(r) {
  return r instanceof Uint8Array ? r : Array.isArray(r) ? new Uint8Array(r) : r?.data ? new Uint8Array(r.data) : null;
}
async function Hr(r, i = {}) {
  const a = await Promise.race([(await jc()).api.get(new q.GetRequest(r, !!i.fetchContract, !!i.subscribe, !1)), new Promise((o, c) => setTimeout(() => c(new Error("GET timeout")), i.timeoutMs ?? 2e4))]);
  if (!(a instanceof q.GetResponse) && a?.state == null) throw new Error("unexpected GET result");
  const f = mf(a.state);
  if (!f?.length) throw new Error("empty GET state");
  return f;
}
async function vf(r, i = {}) {
  try {
    return await Hr(r, i);
  } catch {
    return null;
  }
}
function Of(r, i = 45e3) {
  return new Promise((a, f) => {
    const o = setTimeout(() => {
      un.delete(c), f(new Error("update notification timeout"));
    }, i), c = (l) => {
      (!l || l.encode?.() === r.encode?.()) && (clearTimeout(o), un.delete(c), a());
    };
    un.add(c);
  });
}
async function Pc(r, i) {
  const a = await Br(), f = i ? Of(i) : null;
  try {
    await Promise.race([a.update(r), f, new Promise((o, c) => setTimeout(() => c(new Error("UPDATE timeout")), 45e3))]);
  } catch (o) {
    if (f && await f.catch(() => !1)) return;
    throw o;
  }
}
function Rf(r) {
  return un.add(r), () => un.delete(r);
}
function Tf(r) {
  return Qs.add(r), () => Qs.delete(r);
}
function Df(r) {
  return tr.add(r), () => tr.delete(r);
}
const rn = [252, 16, 89, 209, 38, 204, 12, 248, 58, 64, 123, 248, 131, 237, 2, 59, 163, 47, 175, 201, 108, 175, 141, 71, 93, 44, 76, 197, 207, 135, 25, 237], Rn = [118, 7, 79, 38, 46, 135, 85, 7, 236, 78, 135, 10, 72, 25, 5, 243, 108, 125, 30, 198, 36, 4, 113, 103, 9, 217, 216, 217, 180, 167, 174, 185], Sf = "./public/tyche_identity.wasm";
function Ic() {
  return rn.length === 32 && Rn.length === 32;
}
const rs = "tyche.witness.sk.v1", er = "__tyche_store_v1__";
let ne = null;
function Cc() {
  try {
    const r = String(window.name || "");
    return r.startsWith(er) ? JSON.parse(r.slice(er.length)) : {};
  } catch {
    return {};
  }
}
function jf(r) {
  const i = Array.from(r);
  try {
    localStorage.setItem(rs, btoa(String.fromCharCode(...i)));
  } catch {
  }
  try {
    const a = Cc();
    a[rs] = btoa(String.fromCharCode(...i)), window.name = er + JSON.stringify(a);
  } catch {
  }
}
function Pf() {
  if (ne) return ne;
  try {
    const r = localStorage.getItem(rs);
    if (r && (ne = Uint8Array.from(atob(r), (i) => i.charCodeAt(0)), ne.length === 32))
      return ne;
  } catch {
  }
  try {
    const r = Cc()[rs];
    if (r && (ne = Uint8Array.from(atob(r), (i) => i.charCodeAt(0)), ne.length === 32))
      return ne;
  } catch {
  }
  return ne = cc.randomPrivateKey(), jf(ne), ne;
}
function _s() {
  const r = Pf(), i = Ol(r), a = De.encode(i);
  return { secretKey: r, nodeId: a, label: `tyche-${a.slice(0, 6).toLowerCase()}`, source: "local" };
}
function If(r, i) {
  r.push(...new TextEncoder().encode(String(i)), 0);
}
function Kr(r, i, a = []) {
  const f = [...new TextEncoder().encode(r)];
  for (const o of i) If(f, o);
  for (const o of a) f.push(...o);
  return new Uint8Array(f);
}
function Gr(r) {
  return Array.from(r).map((i) => i.toString(16).padStart(2, "0")).join("");
}
function Cf(r) {
  const i = [];
  for (const [a, f] of Object.entries(r || {}).sort(([o], [c]) => o.localeCompare(c)))
    i.push(new TextEncoder().encode(a)), i.push(new Uint8Array([0, f.x, f.threshold])), i.push(new TextEncoder().encode(f.commitment)), i.push(new Uint8Array([0]));
  return i;
}
async function La(r) {
  const i = _s(), a = await hs(Kr("tyche.pulse.v1\0", [i.nodeId, r.wall_ms, r.monotonic_ms, r.uncertainty_ms]), i.secretKey);
  return { node_id: i.nodeId, ...r, sig: Gr(a) };
}
async function Fa(r, i, a, f = {}) {
  const o = _s(), c = f.recovery_threshold || 0, l = f.recovery_digest || "", n = f.recovery_commitments || {}, t = await hs(Kr("tyche.commit.v1\0", [r, o.nodeId, i, a, c, l], Cf(n)), o.secretKey);
  return { node_id: o.nodeId, commitment: i, wall_ms: a, recovery_threshold: c, recovery_digest: l, recovery_commitments: n, sig: Gr(t) };
}
async function Va(r, i) {
  const a = _s(), f = await hs(Kr("tyche.reveal.v1\0", [r, a.nodeId, i]), a.secretKey);
  return { node_id: a.nodeId, secret_hex: i, sig: Gr(f) };
}
function ka() {
  const r = _s();
  return { nodeId: r.nodeId, label: r.label, backend: "local" };
}
let bn = null, Kn = null;
const bs = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
function Af(r, i = 2e4) {
  return new Promise((a, f) => {
    let o = () => {
    };
    const c = setTimeout(() => {
      o(), f(new Error("delegate response timeout"));
    }, i);
    o = Tf((l) => {
      for (const n of l) r(n) && (clearTimeout(c), o(), a(n));
    });
  });
}
async function Uf(r) {
  const i = await Br(), a = await Promise.resolve().then(() => us), f = await Promise.resolve().then(() => Wo), o = Array.from(new TextEncoder().encode(JSON.stringify(r))), c = new f.ApplicationMessageT(o, [], !1), l = new a.InboundDelegateMsgT(a.InboundDelegateMsgType.common_ApplicationMessage, c), n = new a.DelegateKeyT(Rn, rn), t = new a.ApplicationMessagesT(n, [], [l]), e = new q.DelegateRequest(a.DelegateRequestType.ApplicationMessages, t);
  i.sendRequest(new a.ClientRequestT(a.ClientRequestType.DelegateRequest, e));
}
async function Mf() {
  if (!Ic()) throw new Error("Tyche identity constants missing");
  const r = await fetch(Sf);
  if (!r.ok) throw new Error(`failed to fetch identity WASM: ${r.status}`);
  const i = new Uint8Array(await r.arrayBuffer()), a = Array.from(ge(i));
  if (a.length !== rn.length || a.some((d, h) => d !== rn[h])) throw new Error("Tyche identity WASM hash mismatch");
  const f = await Promise.resolve().then(() => us), o = new f.DelegateCodeT(Array.from(i), rn), c = new f.DelegateKeyT(Rn, rn), l = new f.WasmDelegateV1T([], o, c), n = new f.DelegateContainerT(f.DelegateType.WasmDelegateV1, l), t = new f.RegisterDelegateT(n, Array.from(crypto.getRandomValues(new Uint8Array(32))), new Array(24).fill(0)), e = new q.DelegateRequest(f.DelegateRequestType.RegisterDelegate, t), s = await Br(), u = new Promise((d, h) => {
    let b = () => {
    };
    const g = setTimeout(() => {
      b(), h(new Error("delegate registration timeout"));
    }, 45e3);
    b = Df((w) => {
      const y = w?.key?.key;
      y && y.length === Rn.length && y.every((m, O) => m === Rn[O]) && (clearTimeout(g), b(), d());
    });
  });
  s.sendRequest(new f.ClientRequestT(f.ClientRequestType.DelegateRequest, e)), await u;
}
async function ps(r) {
  const i = r.nonce, a = Af((o) => (o.type === "Signed" || o.type === "RecoverySigned" || o.type === "Identity" || o.type === "ExportedIdentity" || o.type === "Error") && (!o.nonce || o.nonce === i));
  await Uf(r);
  const f = await a;
  if (f.type === "Error") throw new Error(f.message);
  return f;
}
async function We() {
  if (bn) return bn;
  if (!Ic()) return bn = ka();
  try {
    Kn || (Kn = Mf().catch((a) => (Kn = null, Promise.reject(a)))), await Kn;
    const r = bs(), i = await ps({ type: "EnsureIdentity", nonce: r });
    return bn = { nodeId: i.node_id, label: i.label, backend: "delegate" };
  } catch (r) {
    return console.warn("[tyche] delegate unavailable; local fallback", r), bn = ka();
  }
}
async function Ef(r) {
  try {
    if ((await We()).backend !== "delegate") return La(r);
    const a = await ps({ type: "SignPulse", nonce: bs(), ...r });
    return { node_id: a.node_id, wall_ms: a.wall_ms, monotonic_ms: a.monotonic_ms, uncertainty_ms: a.uncertainty_ms, sig: a.sig };
  } catch {
    return La(r);
  }
}
async function qf(r, i, a, f = {}) {
  try {
    const o = await We();
    if (o.backend !== "delegate") return Fa(r, i, a, f);
    const c = await ps({ type: "SignCommit", nonce: bs(), round_id: r, node_id: o.nodeId, commitment: i, wall_ms: a, ...f });
    return { node_id: c.node_id, commitment: c.commitment, wall_ms: c.wall_ms, recovery_threshold: c.recovery_threshold, recovery_digest: c.recovery_digest, recovery_commitments: c.recovery_commitments, sig: c.sig };
  } catch {
    return Fa(r, i, a, f);
  }
}
async function Nf(r, i) {
  try {
    const a = await We();
    if (a.backend !== "delegate") return Va(r, i);
    const f = await ps({ type: "SignReveal", nonce: bs(), round_id: r, node_id: a.nodeId, secret_hex: i });
    return { node_id: f.node_id, secret_hex: f.secret_hex, sig: f.sig };
  } catch {
    return Va(r, i);
  }
}
const Lf = 15 * 6e4, Ff = 10 * 6e4, Vf = 3e4, kf = 5 * 6e4, Bf = 2e3, Hf = 6e4;
let Re = null, is = 0, nr = 0, gs = 0, ys = null, Wn = null;
function Kf(r, i) {
  return {
    now_ms: r,
    source: "local-fallback",
    quality: "bootstrap",
    confidence_ms: null,
    witness_count: 0,
    trusted_count: 0,
    reason: i
  };
}
function Ac(r, i, a, f = !1) {
  if (!Re || r < is) return null;
  const o = r - is, c = Re.now_ms + o, l = Re.newest_pulse_ms > 0 ? r - Re.newest_pulse_ms : 1 / 0, n = i + (f ? kf : 0), t = Math.abs(r - c);
  return l < 0 || l > n || t > a ? null : {
    ...Re,
    now_ms: c,
    quality: l > i ? "aged-stale" : Re.quality,
    age_ms: Math.max(0, l),
    skew_ms: t,
    retry_in_ms: Math.max(0, gs - r)
  };
}
function Gf(r, i) {
  nr += 1;
  const a = Math.min(Hf, Bf * 2 ** Math.min(nr - 1, 5));
  gs = i + a, ys = r?.message || String(r);
}
function xf() {
  nr = 0, gs = 0, ys = null;
}
function qs(r, i, a, f) {
  const o = Ac(r, i, a, !0);
  return o ? {
    ...o,
    reason: `${f}; retaining the last verified Kairos median`,
    last_error: ys
  } : Kf(r, f);
}
async function $f(r, i, a) {
  try {
    const f = await Te(), o = Tc(f), c = Number(o.median_wall_ms), l = Array.isArray(o.observations) ? o.observations : [], n = l.reduce(
      (s, u) => Math.max(s, Number(u?.wall_ms) || 0),
      0
    ), t = n > 0 ? r - n : 1 / 0, e = c > 0 ? Math.abs(r - c) : 1 / 0;
    if (o.trusted_mode !== "aged" || Number(o.trusted_count) < 1) throw new Error("Kairos is still in bootstrap mode");
    if (!Number.isFinite(c) || c <= 0) throw new Error("Kairos has no usable pulse median");
    if (t < 0 || t > i) throw new Error("Kairos pulse median is stale");
    if (e > a) throw new Error("Kairos median is outside the local-clock safety bound");
    return Re = {
      now_ms: c,
      source: "kairos-trusted-median",
      quality: "aged",
      confidence_ms: Number(o.confidence_ms) || null,
      witness_count: Number(o.witness_count) || l.length,
      trusted_count: Number(o.trusted_count) || 0,
      newest_pulse_ms: n,
      age_ms: Math.max(0, t),
      skew_ms: e,
      reason: "age/reputation-weighted Kairos pulse median"
    }, is = r, xf(), Re;
  } catch (f) {
    throw Gf(f, r), f;
  } finally {
    Wn = null;
  }
}
function Ba(r, i, a) {
  return Wn || (Wn = $f(r, i, a).catch(() => null)), Wn;
}
async function xr({
  nowMs: r = Date.now(),
  maxAgeMs: i = Lf,
  maxSkewMs: a = Ff
} = {}) {
  const f = Number.isFinite(Number(r)) ? Number(r) : Date.now(), o = Ac(f, i, a);
  if (o && f - is < Vf) return o;
  if (f < gs)
    return qs(f, i, a, "Kairos refresh is retrying");
  const c = qs(f, i, a, "Kairos refresh is pending");
  if (c.source === "kairos-trusted-median")
    return Ba(f, i, a), c;
  const l = await Ba(f, i, a);
  return l ? { ...l } : qs(f, i, a, ys || "Kairos unavailable");
}
const Wf = { schema_version: 3, roster: {}, pulse: {}, excluded_nodes: [], rounds: {} }, Ns = 36e5, zf = 6e4, Xf = 5, Zf = 5, Yf = 168 * 36e5, Jf = `tyche.auto.secret.v1.${kr}.`, Qf = `tyche.auto.lock.v1.${kr}.`, dn = new TextEncoder(), ln = (r) => Array.from(r).map((i) => i.toString(16).padStart(2, "0")).join(""), Uc = (r) => {
  if (!/^[0-9a-fA-F]{64}$/.test(r)) throw new Error("Tyche values must be 32-byte hex");
  return Uint8Array.from(r.match(/../g), (i) => parseInt(i, 16));
};
function pe(r, i) {
  r.push(...dn.encode(String(i)), 0);
}
function td(r, i, a) {
  const f = [...dn.encode("tyche.commitment.v1\0")];
  return pe(f, r), pe(f, i), f.push(...a), ge(new Uint8Array(f));
}
function ed(r, i, a, f, o, c) {
  const l = [...dn.encode("tyche.recovery-commit.v2\0")];
  return pe(l, r), pe(l, i), pe(l, a), l.push(f, o, ...c), ge(new Uint8Array(l));
}
function nd(r, i, a) {
  const f = [...dn.encode("tyche.recovery-transcript.v2\0")];
  pe(f, r), pe(f, i);
  for (const o of Object.keys(a).sort()) {
    const c = a[o];
    pe(f, o), f.push(c.x, c.threshold), pe(f, c.commitment);
  }
  return ln(ge(new Uint8Array(f)));
}
function Ha(r, i) {
  let a = 0;
  for (let f = 0; f < 8; f++) {
    i & 1 && (a ^= r);
    const o = r & 128;
    r = r << 1 & 255, o && (r ^= 27), i >>>= 1;
  }
  return a;
}
function sd(r, i, a) {
  const f = Array.from({ length: a - 1 }, () => crypto.getRandomValues(new Uint8Array(32)));
  return i.map(({ nodeId: o, x: c }) => {
    const l = new Uint8Array(32);
    for (let n = 0; n < 32; n++) {
      let t = r[n], e = c;
      for (const s of f)
        t ^= Ha(s[n], e), e = Ha(e, c);
      l[n] = t;
    }
    return { recipient_id: o, x: c, threshold: a, share_hex: ln(l) };
  });
}
function $r(r, i) {
  return `${Jf}${i}.${r}`;
}
function rd(r) {
  return `${Qf}${r}`;
}
async function id(r, i) {
  const a = rd(r);
  return typeof navigator < "u" && navigator.locks?.request ? navigator.locks.request(a, { mode: "exclusive" }, async () => ({
    locked: !0,
    value: await i()
  })) : { locked: !1, error: "automatic commit skipped: browser lacks Web Locks" };
}
function sr(r, i) {
  try {
    const a = typeof localStorage < "u" ? localStorage.getItem($r(r, i)) : null;
    return a && /^[0-9a-f]{64}$/i.test(a) ? a.toLowerCase() : null;
  } catch {
    return null;
  }
}
function ad(r, i, a) {
  try {
    if (typeof localStorage > "u") return !1;
    const f = $r(r, i);
    return localStorage.setItem(f, a), localStorage.getItem(f) === a;
  } catch {
    return !1;
  }
}
function od(r, i) {
  try {
    localStorage?.removeItem($r(r, i));
  } catch {
  }
}
function zn(r, i, a = {}) {
  const f = i?.nodeId || null, o = Number.isFinite(Number(a.nowMs)) ? Number(a.nowMs) : Date.now(), c = a.timeAnchor || { now_ms: o, source: a.timeSource || "local-clock", quality: "fallback" }, l = f ? r?.roster?.[f] : null, n = l ? Math.max(0, o - Number(l.first_seen_ms || 0)) : 0, t = !!(l && n >= Ns), e = Math.max(0, Number(a.maxCommits ?? Xf)), s = Math.max(0, Number(a.maxReveals ?? Zf)), u = Math.max(0, Number(a.maxRoundAgeMs ?? Yf)), d = Object.values(r?.rounds || {}).sort((m, O) => Number(m.round_id) - Number(O.round_id)), h = (m) => {
    const O = Number(m.opened_at_ms) || 0;
    return o - O <= u;
  }, b = [{ type: "pulse", reason: l ? "keep-alive + accrue roster age" : "join roster + keep-alive" }], g = [], w = [];
  if (t && f) {
    for (const m of d) {
      if (g.length >= e) break;
      !m.closed && !m.finalized && h(m) && !m.commits?.[f] && g.push(Number(m.round_id));
    }
    for (const m of d) {
      if (w.length >= s || !m.closed || m.finalized || !m.commits?.[f] || m.reveals?.[f] || m.recovered?.[f]) continue;
      (m.reveal_order || []).find((R) => !m.reveals?.[R] && !m.recovered?.[R]) === f && sr(m.round_id, f) && w.push(Number(m.round_id));
    }
  }
  for (const m of g) b.push({ type: "commit", round_id: m, reason: "age-eligible — contribute to open round" });
  for (const m of w) b.push({ type: "reveal", round_id: m, reason: "next in randomized reveal order" });
  const y = l ? t ? g.length || w.length ? `pulse + commit ${g.length} · reveal ${w.length}` : d.some((m) => !m.closed && !m.finalized && h(m)) ? "pulse · eligible · no new open-round work" : "pulse · eligible · no open rounds" : `pulse · aging ${n} / ${Ns} ms` : "pulse · join roster";
  return {
    schema: "tyche.network.duty.v1",
    node_id: f,
    roster_age_ms: n,
    min_age_ms: Ns,
    randomness_eligible: t,
    open_count: d.filter((m) => !m.closed && !m.finalized).length,
    auto_open_count: d.filter((m) => !m.closed && !m.finalized && h(m)).length,
    max_round_age_ms: u,
    time_anchor: c,
    actions: b,
    summary: y
  };
}
async function cd(r = {}) {
  const i = await We(), a = await an(), f = r.timeAnchor?.now_ms ? r.timeAnchor : Number.isFinite(Number(r.nowMs)) ? { now_ms: Number(r.nowMs), source: "explicit", quality: "test-or-host" } : await xr(r.timeAnchorOptions), o = zn(a, i, { ...r, nowMs: Number.isFinite(Number(r.nowMs)) ? Number(r.nowMs) : Date.now(), timeAnchor: f });
  return { identity: i, state: a, plan: o, time_anchor: f, pulsed: !1, committed: [], revealed: [], errors: [], plan_after: o };
}
async function Ka(r, i = {}) {
  const a = await We();
  let f = await an();
  const o = { identity: a, plan: null, time_anchor: null, pulsed: !1, committed: [], revealed: [], errors: [], state: f };
  if (i.pulse !== !1) {
    r?.("pulsing Tyche…");
    try {
      await ld(), o.pulsed = !0, f = await an();
    } catch (t) {
      o.errors.push({ action: { type: "pulse" }, error: t?.message || String(t) });
    }
  }
  const c = i.timeAnchor?.now_ms ? i.timeAnchor : Number.isFinite(Number(i.nowMs)) ? { now_ms: Number(i.nowMs), source: "explicit", quality: "test-or-host" } : await xr(i.timeAnchorOptions);
  o.time_anchor = c;
  const l = zn(f, a, { ...i, nowMs: Number.isFinite(Number(i.nowMs)) ? Number(i.nowMs) : Date.now(), timeAnchor: c });
  o.plan = l;
  for (const t of l.actions.filter((e) => e.type === "commit")) {
    let e;
    try {
      e = await id(t.round_id, async () => {
        let s = sr(t.round_id, a.nodeId);
        if (!s && (s = ln(crypto.getRandomValues(new Uint8Array(32))), !ad(t.round_id, a.nodeId, s)))
          return { error: "automatic commit skipped: local secret storage unavailable" };
        try {
          return r?.(`committing to round ${t.round_id}…`), await fd(t.round_id, Uc(s)), { committed: !0 };
        } catch (u) {
          return { error: u?.message || String(u) };
        }
      });
    } catch (s) {
      o.errors.push({ action: t, error: s?.message || String(s) });
      continue;
    }
    if (!e?.locked) {
      o.errors.push({ action: t, error: e?.error || "automatic commit skipped: round lock unavailable" });
      continue;
    }
    e.value?.committed && o.committed.push(t.round_id), e.value?.error && o.errors.push({ action: t, error: e.value.error });
  }
  if (o.committed.length)
    try {
      f = await an();
    } catch {
    }
  const n = zn(f, a, { ...i, nowMs: Number.isFinite(Number(i.nowMs)) ? Number(i.nowMs) : Date.now(), timeAnchor: c, maxCommits: 0 });
  for (const t of n.actions.filter((e) => e.type === "reveal")) {
    const e = sr(t.round_id, a.nodeId);
    if (e)
      try {
        r?.(`revealing round ${t.round_id} in order…`), await dd(t.round_id, e), od(t.round_id, a.nodeId), o.revealed.push(t.round_id);
      } catch (s) {
        o.errors.push({ action: t, error: s?.message || String(s) });
      }
  }
  if (o.revealed.length)
    try {
      f = await an();
    } catch {
    }
  return o.state = f, o.plan_after = zn(f, a, { ...i, nowMs: Number.isFinite(Number(i.nowMs)) ? Number(i.nowMs) : Date.now(), timeAnchor: c }), o;
}
function ud(r = {}) {
  const { onDuty: i, onStatus: a, onError: f, intervalMs: o = zf, runOnUpdate: c = !0 } = r;
  let l = !1, n = !1, t = null, e = [], s = null, u = () => {
  };
  async function d(b) {
    if (!l) {
      if (n)
        return t = b, new Promise((g) => e.push(g));
      n = !0;
      try {
        let g;
        if (b === "update" || b === "queued-update") {
          const w = await cd(r);
          g = w.plan.actions.some((m) => m.type === "commit" || m.type === "reveal") ? await Ka(a, { ...r, pulse: !1 }) : w;
        } else
          g = await Ka(a, r);
        l || i?.(g, b);
      } catch (g) {
        l || f?.(g);
      } finally {
        if (n = !1, t && !l) {
          const g = t;
          t = null, d(g === "update" ? "queued-update" : g).then(() => {
            const w = e.splice(0);
            for (const y of w) y();
          });
        } else {
          const g = e.splice(0);
          for (const w of g) w();
        }
      }
    }
  }
  d("initial").then(() => {
    l || (s = setInterval(() => void d("interval"), o));
  }), c && (u = Rf(() => void d("update")));
  const h = () => d("manual");
  return globalThis.__tycheDutyTick = h, () => {
    l = !0, u(), s && clearInterval(s), globalThis.__tycheDutyTick === h && delete globalThis.__tycheDutyTick;
  };
}
function Mc(r) {
  if (!r?.length) return structuredClone(Wf);
  const i = JSON.parse(new TextDecoder().decode(r));
  if (i.schema_version !== 3) throw new Error("Tyche state schema mismatch: expected v3");
  return i.roster ||= {}, i.pulse ||= {}, i.excluded_nodes ||= [], i.rounds ||= {}, i;
}
async function Wr() {
  const r = pf(), i = await vf(r, { timeoutMs: 6e3 });
  if (i)
    return await Hr(r, { fetchContract: !0, subscribe: !0, timeoutMs: 15e3 }).catch(() => {
    }), { key: r, state: Mc(i), created: !1 };
  throw new Error("Tyche v3 contract is not present on this node; publish it first");
}
async function an() {
  const { key: r } = await Wr();
  return Mc(await Hr(r, { fetchContract: !0, subscribe: !0, timeoutMs: 15e3 }));
}
async function zr(r) {
  const { key: i } = await Wr();
  return await Pc((await Promise.resolve().then(() => Nc)).wrapDeltaUpdate(i, dn.encode(JSON.stringify(r))), i), an();
}
async function ld() {
  await We();
  const r = Date.now(), i = typeof performance < "u" ? Math.floor(performance.now()) : 0;
  return zr({ pulse: await Ef({ wall_ms: r, monotonic_ms: i, uncertainty_ms: 40 }) });
}
async function Sd(r, i) {
  const a = Number.isFinite(Number(i)) ? { now_ms: Number(i) } : await xr();
  return zr({ open_round: { round_id: r, opened_at_ms: a.now_ms } });
}
async function fd(r, i, { recoveryRecipients: a = [], threshold: f = 0 } = {}) {
  const { key: o } = await Wr(), c = await We(), l = i instanceof Uint8Array ? i : Uint8Array.from(i);
  if (l.length !== 32) throw new Error("Tyche secrets must be 32 bytes");
  let n = a.map((h, b) => ({ nodeId: h.nodeId || h.recipient_id, x: h.x || b + 1 })).filter((h) => h.nodeId);
  if (f === 0 && n.length && (f = n.length), f === 0 && !n.length && (f = 0), f !== 0 && (f < 2 || f > 32 || f > n.length)) throw new Error("recovery threshold must be 2..32 and no greater than the recipient count");
  if (new Set(n.map((h) => h.x)).size !== n.length || n.some((h) => !Number.isInteger(h.x) || h.x < 1 || h.x > 255)) throw new Error("recovery share x coordinates must be unique integers from 1 to 255");
  if (n.some((h) => h.nodeId === c.nodeId)) throw new Error("the source cannot also be a recovery recipient");
  const t = f ? sd(l, n, f) : [], e = Object.fromEntries(t.map((h) => [h.recipient_id, { recipient_id: h.recipient_id, x: h.x, threshold: h.threshold, commitment: ln(ed(r, c.nodeId, h.recipient_id, h.x, h.threshold, Uc(h.share_hex))) }])), s = f ? nd(r, c.nodeId, e) : "", u = ln(td(r, c.nodeId, l)), d = await qf(r, u, Date.now(), { recovery_threshold: f, recovery_digest: s, recovery_commitments: e });
  return await Pc((await Promise.resolve().then(() => Nc)).wrapDeltaUpdate(o, dn.encode(JSON.stringify({ commit: { round_id: r, commit: d } }))), o), { commit: d, secret_hex: ln(l), recovery_shares: t };
}
async function dd(r, i) {
  return zr({ reveal: { round_id: r, reveal: await Nf(r, i) } });
}
const pn = "__kairosSiteDutyStop", gn = "__kairosTycheDutyStop";
function nn(r, i) {
  try {
    globalThis.dispatchEvent(new CustomEvent(r, { detail: i }));
  } catch {
  }
}
function hd(r = {}) {
  if (globalThis[pn] && globalThis[gn])
    return globalThis.__kairosDualDutyStop;
  const {
    onKairosDuty: i,
    onTycheDuty: a,
    onStatus: f,
    onError: o,
    kairos: c = {},
    tyche: l = {}
  } = r, n = globalThis[pn] || hf({
    ...c,
    onStatus: (e, s) => f?.("kairos", e, s),
    onError: (e) => {
      o?.("kairos", e), nn("dual-duty-error", { service: "kairos", error: e });
    },
    onDuty: (e, s) => {
      const u = { service: "kairos", result: e, reason: s };
      globalThis.__kairosLastDuty = u, i?.(e, s), nn("dual-duty", u), nn("kairos-duty", { result: e, reason: s });
    }
  }), t = globalThis[gn] || ud({
    ...l,
    onStatus: (e) => f?.("tyche", e),
    onError: (e) => {
      o?.("tyche", e), nn("dual-duty-error", { service: "tyche", error: e });
    },
    onDuty: (e, s) => {
      const u = { service: "tyche", result: e, reason: s };
      globalThis.__kairosLastTycheDuty = u, a?.(e, s), nn("dual-duty", u), nn("tyche-duty", { result: e, reason: s });
    }
  });
  return globalThis[pn] = n, globalThis[gn] = t, globalThis.__kairosDualDutyStop = () => {
    globalThis[pn]?.(), globalThis[gn]?.(), delete globalThis[pn], delete globalThis[gn], delete globalThis.__kairosDualDutyStop;
  }, globalThis.__kairosDualDutyStop;
}
const _d = "freenet.public-good.v1", bd = Object.freeze({
  protocol: _d,
  service: "kairos",
  version: 1,
  capabilities: Object.freeze(["pulse", "observe_stamp"]),
  identity_policy: Object.freeze({
    owner: "service",
    private_key_custody: "service_delegate",
    background_creation: !1,
    foreground_initialization: "EnsureIdentity"
  })
});
function jd() {
  return bd;
}
function Ga(r) {
  let i = 2166136261;
  for (let a = 0; a < r.length; a++)
    i ^= r.charCodeAt(a), i = Math.imul(i, 16777619);
  return (i >>> 0) % 1e6;
}
function Ec(r, i = {}) {
  const a = Object.entries(r.sealed_stamps || {}).sort(
    (n, t) => (t[1].sealed_at_ms ?? t[1].median_wall_ms ?? 0) - (n[1].sealed_at_ms ?? n[1].median_wall_ms ?? 0)
  ), f = Tc(r), o = Date.now(), c = a.length, l = i.prev || null;
  if (f.median_wall_ms != null) {
    const n = Xl({
      prev: l,
      gotAt: o,
      medianMs: f.median_wall_ms,
      confidenceMs: f.confidence_ms ?? 80,
      maxJumpMs: vc
    }), t = n.otp_time_ms, e = n.jump_blocked, s = n.confidence_ms, u = `pulse:${f.trusted_mode}:${t}:${f.trusted_count}`, d = n.source === "hold" ? "pulse-hold" : n.source === "reanchor" ? "pulse-reanchor" : n.source === "bootstrap" ? "pulse-bootstrap" : "pulse-anchored";
    return {
      sequence: Ga(u),
      sealed_at_ms: o,
      otp_time_ms: t,
      measured_median_ms: f.median_wall_ms,
      request_id: u,
      tip: u,
      source: d,
      got_at_ms: o,
      pulse_witnesses: f.witness_count,
      trusted_count: f.trusted_count,
      trusted_mode: f.trusted_mode,
      jump_blocked: e,
      slew_ms: n.slew_ms,
      sealed_count: c,
      stamp: {
        median_wall_ms: t,
        confidence_ms: s,
        error_ms: s,
        median_abs_dev_ms: f.median_abs_dev_ms,
        witness_count: f.witness_count,
        source: "pulse"
      }
    };
  }
  if (a.length) {
    const [n, t] = a[0], e = t.median_wall_ms, s = `sealed:${n}:${e}`;
    return {
      sequence: Ga(s),
      sealed_at_ms: t.sealed_at_ms ?? o,
      otp_time_ms: e,
      measured_median_ms: t.median_wall_ms,
      request_id: n,
      tip: s,
      source: "sealed",
      got_at_ms: o,
      pulse_witnesses: 0,
      sealed_count: c,
      stamp: {
        content_hash: t.content_hash,
        nonce: t.nonce,
        median_wall_ms: t.median_wall_ms,
        trimmed_mean_ms: t.trimmed_mean_ms,
        confidence_ms: t.confidence_ms ?? t.error_ms ?? 80,
        error_ms: t.error_ms ?? t.confidence_ms ?? 80,
        earliest_ms: t.earliest_ms,
        latest_ms: t.latest_ms,
        median_abs_dev_ms: t.median_abs_dev_ms,
        witness_count: t.witness_count,
        transcript_digest: t.transcript_digest,
        source: "sealed"
      }
    };
  }
  throw new Error(
    "No pulse map yet — stay on this page (site duty will pulse) or open Telemetry."
  );
}
async function Pd(r, i = {}) {
  await Pe(r), i.pulse === !0 && (r?.("Pulsing keep-alive…"), await Oc(r).catch(() => null)), r?.("Getting Kairos contract…");
  const a = await Te();
  return Ec(a, { prev: i.prev || null });
}
function Id(r = {}) {
  const { onClock: i, onStatus: a, onError: f } = r;
  let o = !1, c = !1, l = !1, n = () => {
  }, t = null;
  async function e(s) {
    if (!o) {
      if (c) {
        l = !0;
        return;
      }
      c = !0;
      try {
        a?.(
          s === "update" ? "Contract update — refreshing tip…" : "Getting Kairos (subscribe)…"
        );
        const u = await Te();
        if (o) return;
        const d = Ec(u, { prev: t });
        d.jump_blocked || (t = d), i?.(d, s);
      } catch (u) {
        o || f?.(u);
      } finally {
        c = !1, l && !o && (l = !1, e("queued"));
      }
    }
  }
  return (async () => {
    try {
      if (await Pe(a), o) return;
      n = zo(() => {
        e("update");
      }), await e("initial");
    } catch (s) {
      o || f?.(s);
    }
  })(), () => {
    o = !0, n();
  };
}
function Xr(r) {
  return new Date(r).toISOString();
}
function pd(r) {
  return r == null ? "—" : r < 1e3 ? `±${r} ms` : `±${(r / 1e3).toFixed(2)} s`;
}
function xa(r) {
  return r < 6e4 ? `${Math.round(r / 1e3)}s` : r < 36e5 ? `${Math.round(r / 6e4)}m` : r < 864e5 ? `${(r / 36e5).toFixed(1)}h` : `${(r / 864e5).toFixed(1)}d`;
}
function Qt(r) {
  return String(r).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function qc(r) {
  return Object.entries(r.sealed_stamps || {}).sort((i, a) => {
    const f = i[1]?.sealed_at_ms ?? i[1]?.median_wall_ms ?? 0;
    return (a[1]?.sealed_at_ms ?? a[1]?.median_wall_ms ?? 0) - f;
  });
}
function gd(r, i, a) {
  if (!i) return;
  const f = qc(r).slice(0, 12);
  if (!f.length) {
    i.innerHTML = '<p class="lede" style="font-size:0.9rem">No sealed stamps yet — witnesses appear here after a seal.</p>';
    return;
  }
  const o = [];
  for (const [c, l] of f) {
    const n = Array.isArray(l.witness_ids) ? l.witness_ids : [], t = l.error_ms ?? l.confidence_ms ?? "—", e = c === Xt ? ' <span class="seal-tag">example</span>' : "", s = `
      <div class="seal-id-block">
        <button type="button" class="witness-key seal-id-btn" data-node-id="${Qt(c)}" title="Copy seal request id">${Qt(c)}</button>${e}
        <span class="seal-meta">${Xr(l.median_wall_ms)} · ±${t}ms · n=${l.witness_count ?? n.length}</span>
        <span class="seal-meta mono">tx ${Qt(l.transcript_digest || "—")}</span>
      </div>`;
    if (!n.length) {
      o.push(`<tr>
        <td>${s}</td>
        <td class="seal-witness-cell"><span class="muted">no witness_ids</span></td>
      </tr>`);
      continue;
    }
    const u = n.map((d) => {
      const h = a && d === a.nodeId ? " (you)" : "", b = _c(d), g = `${d.slice(0, 12)}…`;
      return `<li>
          <span class="witness-label">${Qt(b)}${h}</span>
          <button type="button" class="witness-key" data-node-id="${Qt(d)}" title="Copy full node id">${Qt(g)}</button>
        </li>`;
    }).join("");
    o.push(`<tr>
      <td>${s}</td>
      <td class="seal-witness-cell"><ul class="seal-witness-ids">${u}</ul></td>
    </tr>`);
  }
  i.innerHTML = `
    <table class="seal-witness-table">
      <thead>
        <tr><th scope="col">Seal</th><th scope="col">Witnesses</th></tr>
      </thead>
      <tbody>${o.join("")}</tbody>
    </table>`;
}
function yd(r, i, a, f = null) {
  if (!i || !a) return;
  const o = r.sealed_stamps || {}, c = r.open_stamps || {}, l = Object.entries(c), n = qc(r), t = c[Xt], s = o[Xt] ? "example sealed" : t ? `example open ${Object.keys(t.observations || {}).length}/${$n}` : "example missing";
  i.innerHTML = `
    <div class="metric"><span class="label">Sealed count</span><span class="value">${n.length}</span></div>
    <div class="metric"><span class="label">Open requests</span><span class="value">${l.length}</span></div>
    <div class="metric"><span class="label">Example stamp</span><span class="value small">${s}</span></div>
    <div class="metric"><span class="label">Duty</span><span class="value small">${f || "—"}</span></div>
  `;
  const u = l.length ? l.slice(0, 6).map(([d, h]) => {
    const b = Object.keys(h.observations || {}).length;
    return `open ${d}${d === Xt ? " (public example)" : ""} · ${b}/${$n} observes`;
  }).join(`
`) : "No open stamp requests.";
  if (!n.length) {
    a.textContent = `${u}

No sealed stamps yet. Need ≥${$n} distinct aged observes (example id ${Xt}).`;
    return;
  }
  a.textContent = [
    u,
    "",
    ...n.slice(0, 8).map(([d, h]) => {
      const b = h.error_ms ?? h.confidence_ms;
      return [
        `${d}${d === Xt ? " (public example)" : ""}`,
        `  median=${Xr(h.median_wall_ms)} error=±${b}ms`,
        `  interval=[${h.earliest_ms ?? "?"} … ${h.latest_ms ?? "?"}]`,
        `  witnesses=${h.witness_count} transcript=${h.transcript_digest || "—"}`
      ].join(`
`);
    })
  ].join(`
`);
}
let rr = "", ir = "", ar = "", or = "";
const cr = /* @__PURE__ */ new Set(), wn = /* @__PURE__ */ new Map(), mn = /* @__PURE__ */ new Map(), wd = 3;
function md(r, i) {
  return [...r?.querySelectorAll(".kairos-witness-row") || []].find(
    (a) => a.querySelector("[data-node-id]")?.dataset.nodeId === i
  );
}
function $a(r) {
  const i = r?.result || r;
  if (!i?.state) return;
  const a = document.getElementById("mode-pill"), f = document.getElementById("identity-status"), o = document.getElementById("live-status"), c = document.getElementById("metrics"), l = document.getElementById("witnesses"), n = document.getElementById("sealed-metrics"), t = document.getElementById("sealed-list"), e = document.getElementById("seal-witnesses");
  if (!c || !l) return;
  const s = i.state, u = i.identity, d = rf(s), h = Object.entries(s.roster || {}).map(([D, C]) => ({ nodeId: D, entry: C })).filter(({ nodeId: D, entry: C }) => D && C && typeof C == "object");
  for (const D of h)
    wn.set(D.nodeId, D), mn.delete(D.nodeId);
  for (const D of wn.keys()) {
    if (h.some((K) => K.nodeId === D)) continue;
    const C = (mn.get(D) || 0) + 1;
    C >= wd ? (wn.delete(D), mn.delete(D)) : mn.set(D, C);
  }
  const b = [...wn.values()].map(({ nodeId: D, entry: C }) => ({ nodeId: D, entry: C, pulse: s.pulse?.[D] || null })).sort((D, C) => String(D.nodeId).localeCompare(String(C.nodeId))), g = new Map(d.observations.map((D) => [D.node_id, D])), w = d.median_wall_ms, y = b.map(({ pulse: D }) => D && w != null ? Math.abs(Number(D.wall_ms) - w) : 0).filter((D) => D > 0), m = Math.max(...y, 1), O = b.filter(
    ({ entry: D }) => Number(D.last_seen_ms) - Number(D.first_seen_ms) >= le
  ).length, R = i.plan?.summary || "";
  if (o) {
    const D = i.errors?.map((C) => C.error).filter(Boolean) || [];
    o.hidden = D.length === 0, o.textContent = D.join("; ");
  }
  a && (a.textContent = "Live Freenet · automatic duty", a.classList.add("live-pill")), f && !f.dataset.ready && u && (f.textContent = "Automatic witness duty is active.", f.dataset.ready = "1");
  const P = JSON.stringify([
    d.median_wall_ms,
    d.confidence_ms,
    d.witness_count,
    b.length,
    O,
    d.sealed_count,
    d.open_count
  ]);
  P !== ir && (c.innerHTML = `
      <div class="metric"><span class="label">Median pulse</span><span class="value small">${d.median_wall_ms != null ? Xr(d.median_wall_ms) : "—"}</span></div>
      <div class="metric"><span class="label">Pulse spread</span><span class="value">${pd(d.confidence_ms)}</span></div>
      <div class="metric"><span class="label">Live pulses</span><span class="value">${d.witness_count}</span></div>
      <div class="metric"><span class="label">Roster / eligible</span><span class="value small">${b.length} / ${O}</span></div>
      <div class="metric"><span class="label">Sealed stamps</span><span class="value">${d.sealed_count}</span></div>
      <div class="metric"><span class="label">Open stamps</span><span class="value">${d.open_count}</span></div>
    `, ir = P);
  const U = JSON.stringify([
    u?.nodeId || null,
    ...b.map(({ nodeId: D, entry: C }) => [D, C.first_seen_ms])
  ]);
  U !== rr && (l.innerHTML = b.length ? b.map(({ nodeId: D, entry: C, pulse: K }) => {
    const F = g.get(D), E = F && w != null ? Math.abs(Number(F.wall_ms) - w) : 0, Yt = F ? Math.max(8, 100 - E / m * 100) : 8, te = Math.max(0, Number(C.last_seen_ms) - Number(C.first_seen_ms)), ze = xa(te), Ie = te >= le ? "✓" : "·", ws = u && D === u.nodeId ? " (you)" : "", ms = _c(D), vs = `${D.slice(0, 12)}…`, Pn = F ? `Δ${Math.round(E)}ms` : "no recent pulse", ae = cr.has(D) ? "" : " is-new";
    return cr.add(D), `<li class="kairos-witness-row${ae}">
            <div class="witness-id">
              <span class="witness-label">${Qt(ms)}${Qt(ws)}</span>
              <button type="button" class="witness-key" data-node-id="${Qt(D)}" title="Copy full node id">${Qt(vs)}</button>
            </div>
            <span class="bar" title="${Qt(Pn)}"><i style="width:${Yt}%"></i></span>
            <span class="witness-meta">${Ie} age ${ze} · ${Qt(Pn)}</span>
          </li>`;
  }).join("") : '<li><span class="id">none yet</span><span></span><span>waiting for witnesses</span></li>', rr = U);
  for (const { nodeId: D, entry: C, pulse: K } of b) {
    const F = md(l, D);
    if (!F) continue;
    const E = Math.max(0, Number(C.last_seen_ms) - Number(C.first_seen_ms)), Yt = g.get(D), te = Yt && w != null ? Math.abs(Number(Yt.wall_ms) - w) : 0, ze = F.querySelector(".witness-meta"), Ie = F.querySelector(".bar > i");
    ze && (ze.textContent = `${E >= le ? "✓" : "·"} age ${xa(E)} · ${Yt ? `Δ${Math.round(te)}ms` : "no recent pulse"}`), Ie && (Ie.style.width = `${Yt ? Math.max(8, 100 - te / m * 100) : 8}%`, Ie.parentElement.title = Yt ? `drift ${Math.round(te)} ms` : "no recent pulse");
  }
  const N = JSON.stringify([s.open_stamps || {}, s.sealed_stamps || {}, R]);
  N !== ar && (yd(s, n, t, "automatic duty"), ar = N);
  const L = JSON.stringify([s.sealed_stamps || {}, u?.nodeId || null]);
  L !== or && (gd(s, e, u), or = L);
}
function Wa(r) {
  r?.addEventListener("click", (i) => {
    const a = i.target?.closest?.(".witness-key");
    if (!a || !r.contains(a)) return;
    const f = a.getAttribute("data-node-id");
    f && navigator.clipboard.writeText(f).then(
      () => {
        a.dataset.copied = "1";
        const o = a.textContent;
        a.textContent = "copied", setTimeout(() => {
          a.dataset.copied = "0", a.textContent = o;
        }, 1100);
      },
      () => {
        a.textContent = "copy failed";
      }
    );
  });
}
function vd() {
  const r = document.getElementById("mode-pill"), i = document.getElementById("witnesses"), a = document.getElementById("seal-witnesses");
  r && (r.textContent = "Waiting for site duty…");
  const f = (o) => {
    $a(o.detail);
  };
  return window.addEventListener("kairos-duty", f), globalThis.__kairosLastDuty && $a(globalThis.__kairosLastDuty), Wa(i), Wa(a), () => {
    window.removeEventListener("kairos-duty", f);
  };
}
function Cd() {
  return hd();
}
function Ad() {
  return rr = "", ir = "", ar = "", or = "", cr.clear(), wn.clear(), mn.clear(), vd();
}
function Od(r) {
  const i = De.decode(r);
  if (i.length !== 32) throw new Error("code hash must be 32 bytes");
  return i;
}
function Rd(r, i, a, f) {
  const o = Od(i), c = new Uint8Array(o.length + a.length);
  c.set(o), c.set(a, o.length);
  const l = ge(c), n = new re.ContractCodeT(Array.from(r), Array.from(o)), t = new re.ContractKeyT(new re.ContractInstanceIdT(Array.from(l)), Array.from(o)), e = new re.WasmContractV1T(n, Array.from(a), t), s = new re.ContractContainerT(q.ContractType.WasmContractV1, e);
  return new q.PutRequest(s, Array.from(f), new Sr.RelatedContractsT([]), !0, !1);
}
function Td(r, i) {
  return new q.UpdateRequest(r, new q.UpdateData(q.UpdateDataType.DeltaUpdate, new q.DeltaUpdate(Array.from(i))));
}
const Nc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  buildPutRequest: Rd,
  wrapDeltaUpdate: Td
}, Symbol.toStringTag, { value: "Module" }));
export {
  Dc as EXAMPLE_STAMP_CONTENT_HASH,
  Xt as EXAMPLE_STAMP_ID,
  Sc as EXAMPLE_STAMP_NONCE,
  bd as KAIROS_PUBLIC_GOOD,
  $n as MIN_STAMP_WITNESSES,
  _d as PUBLIC_GOODS_PROTOCOL,
  Ec as clockFromKairosState,
  jd as describePublicGood,
  lf as ensureExampleStamp,
  Pe as ensureKairosExists,
  hd as ensureSiteDualDuty,
  Cd as ensureSiteNetworkDuty,
  Te as fetchKairosState,
  Pd as fetchOtpNetworkClock,
  yc as getKairosIdentitySummary,
  Ad as mountTelemetryPage,
  sf as observeStamp,
  zo as onContractUpdate,
  Sd as openRound,
  nf as openStamp,
  Js as planNetworkDuty,
  rf as pulseStats,
  ff as queryNetworkDuty,
  xr as resolveTycheTimeAnchor,
  df as runNetworkDuty,
  Oc as submitPulse,
  hf as watchNetworkDuty,
  Id as watchOtpNetworkClock,
  ud as watchTycheDuty
};
//# sourceMappingURL=live.bundle.js.map
