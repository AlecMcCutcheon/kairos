function Li(r, i) {
  for (var l = 0; l < i.length; l++) {
    const f = i[l];
    if (typeof f != "string" && !Array.isArray(f)) {
      for (const c in f)
        if (c !== "default" && !(c in r)) {
          const u = Object.getOwnPropertyDescriptor(f, c);
          u && Object.defineProperty(r, c, u.get ? u : {
            enumerable: !0,
            get: () => f[c]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }));
}
const Wo = "kairos-time-v2", Tn = "4PWZzjjmTGxBwzKYwtL2wtMTLmkRywyeHArBauQds42F", zs = "./public/kairos_time.wasm";
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function zo(r) {
  return r instanceof Uint8Array || ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array";
}
function Yn(r) {
  if (!Number.isSafeInteger(r) || r < 0)
    throw new Error("positive integer expected, got " + r);
}
function Me(r, ...i) {
  if (!zo(r))
    throw new Error("Uint8Array expected");
  if (i.length > 0 && !i.includes(r.length))
    throw new Error("Uint8Array expected of length " + i + ", got length=" + r.length);
}
function Qe(r, i = !0) {
  if (r.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (i && r.finished)
    throw new Error("Hash#digest() has already been called");
}
function hs(r, i) {
  Me(r);
  const l = i.outputLen;
  if (r.length < l)
    throw new Error("digestInto() expects output buffer of length at least " + l);
}
function Xo(r) {
  return new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
}
function mn(r) {
  return new Uint32Array(r.buffer, r.byteOffset, Math.floor(r.byteLength / 4));
}
function Ae(...r) {
  for (let i = 0; i < r.length; i++)
    r[i].fill(0);
}
function Vn(r) {
  return new DataView(r.buffer, r.byteOffset, r.byteLength);
}
function jn(r, i) {
  return r << 32 - i | r >>> i;
}
const Vi = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function Fi(r) {
  return r << 24 & 4278190080 | r << 8 & 16711680 | r >>> 8 & 65280 | r >>> 24 & 255;
}
const Zo = Vi ? (r) => r : (r) => Fi(r);
function Yo(r) {
  for (let i = 0; i < r.length; i++)
    r[i] = Fi(r[i]);
  return r;
}
const Gt = Vi ? (r) => r : Yo, Jo = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Qo = /* @__PURE__ */ Array.from({ length: 256 }, (r, i) => i.toString(16).padStart(2, "0"));
function tc(r) {
  if (Me(r), Jo)
    return r.toHex();
  let i = "";
  for (let l = 0; l < r.length; l++)
    i += Qo[r[l]];
  return i;
}
function ec(r) {
  if (typeof r != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(r));
}
function ze(r) {
  return typeof r == "string" && (r = ec(r)), Me(r), r;
}
class Bi {
}
function nc(r) {
  const i = (f) => r().update(ze(f)).digest(), l = r();
  return i.outputLen = l.outputLen, i.blockLen = l.blockLen, i.create = () => r(), i;
}
function sc(r) {
  const i = (f, c) => r(c).update(ze(f)).digest(), l = r({});
  return i.outputLen = l.outputLen, i.blockLen = l.blockLen, i.create = (f) => r(f), i;
}
function rc(r, i, l, f) {
  if (typeof r.setBigUint64 == "function")
    return r.setBigUint64(i, l, f);
  const c = BigInt(32), u = BigInt(4294967295), o = Number(l >> c & u), n = Number(l & u), t = f ? 4 : 0, e = f ? 0 : 4;
  r.setUint32(i + t, o, f), r.setUint32(i + e, n, f);
}
class ic extends Bi {
  constructor(i, l, f, c) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = i, this.outputLen = l, this.padOffset = f, this.isLE = c, this.buffer = new Uint8Array(i), this.view = Vn(this.buffer);
  }
  update(i) {
    Qe(this), i = ze(i), Me(i);
    const { view: l, buffer: f, blockLen: c } = this, u = i.length;
    for (let o = 0; o < u; ) {
      const n = Math.min(c - this.pos, u - o);
      if (n === c) {
        const t = Vn(i);
        for (; c <= u - o; o += c)
          this.process(t, o);
        continue;
      }
      f.set(i.subarray(o, o + n), this.pos), this.pos += n, o += n, this.pos === c && (this.process(l, 0), this.pos = 0);
    }
    return this.length += i.length, this.roundClean(), this;
  }
  digestInto(i) {
    Qe(this), hs(i, this), this.finished = !0;
    const { buffer: l, view: f, blockLen: c, isLE: u } = this;
    let { pos: o } = this;
    l[o++] = 128, Ae(this.buffer.subarray(o)), this.padOffset > c - o && (this.process(f, 0), o = 0);
    for (let a = o; a < c; a++)
      l[a] = 0;
    rc(f, c - 8, BigInt(this.length * 8), u), this.process(f, 0);
    const n = Vn(i), t = this.outputLen;
    if (t % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const e = t / 4, s = this.get();
    if (e > s.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let a = 0; a < e; a++)
      n.setUint32(4 * a, s[a], u);
  }
  digest() {
    const { buffer: i, outputLen: l } = this;
    this.digestInto(i);
    const f = i.slice(0, l);
    return this.destroy(), f;
  }
  _cloneInto(i) {
    i || (i = new this.constructor()), i.set(...this.get());
    const { blockLen: l, buffer: f, length: c, finished: u, destroyed: o, pos: n } = this;
    return i.destroyed = o, i.finished = u, i.length = c, i.pos = n, c % l && i.buffer.set(f), i;
  }
  clone() {
    return this._cloneInto();
  }
}
const ac = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), V = /* @__PURE__ */ Uint32Array.from([
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
]), dn = /* @__PURE__ */ BigInt(2 ** 32 - 1), Xs = /* @__PURE__ */ BigInt(32);
function Jn(r, i = !1) {
  return i ? { h: Number(r & dn), l: Number(r >> Xs & dn) } : { h: Number(r >> Xs & dn) | 0, l: Number(r & dn) | 0 };
}
function oc(r, i = !1) {
  const l = r.length;
  let f = new Uint32Array(l), c = new Uint32Array(l);
  for (let u = 0; u < l; u++) {
    const { h: o, l: n } = Jn(r[u], i);
    [f[u], c[u]] = [o, n];
  }
  return [f, c];
}
const Zs = (r, i, l) => r >>> l, Ys = (r, i, l) => r << 32 - l | i >>> l, Fe = (r, i, l) => r >>> l | i << 32 - l, Be = (r, i, l) => r << 32 - l | i >>> l, hn = (r, i, l) => r << 64 - l | i >>> l - 32, _n = (r, i, l) => r >>> l - 32 | i << 64 - l;
function ae(r, i, l, f) {
  const c = (i >>> 0) + (f >>> 0);
  return { h: r + l + (c / 2 ** 32 | 0) | 0, l: c | 0 };
}
const cc = (r, i, l) => (r >>> 0) + (i >>> 0) + (l >>> 0), uc = (r, i, l, f) => i + l + f + (r / 2 ** 32 | 0) | 0, lc = (r, i, l, f) => (r >>> 0) + (i >>> 0) + (l >>> 0) + (f >>> 0), fc = (r, i, l, f, c) => i + l + f + c + (r / 2 ** 32 | 0) | 0, dc = (r, i, l, f, c) => (r >>> 0) + (i >>> 0) + (l >>> 0) + (f >>> 0) + (c >>> 0), hc = (r, i, l, f, c, u) => i + l + f + c + u + (r / 2 ** 32 | 0) | 0;
function fe(r, i, l, f, c) {
  return r = r + i + c | 0, f = jn(f ^ r, 16), l = l + f | 0, i = jn(i ^ l, 12), { a: r, b: i, c: l, d: f };
}
function de(r, i, l, f, c) {
  return r = r + i + c | 0, f = jn(f ^ r, 8), l = l + f | 0, i = jn(i ^ l, 7), { a: r, b: i, c: l, d: f };
}
class _c extends Bi {
  constructor(i, l) {
    super(), this.finished = !1, this.destroyed = !1, this.length = 0, this.pos = 0, Yn(i), Yn(l), this.blockLen = i, this.outputLen = l, this.buffer = new Uint8Array(i), this.buffer32 = mn(this.buffer);
  }
  update(i) {
    Qe(this), i = ze(i), Me(i);
    const { blockLen: l, buffer: f, buffer32: c } = this, u = i.length, o = i.byteOffset, n = i.buffer;
    for (let t = 0; t < u; ) {
      this.pos === l && (Gt(c), this.compress(c, 0, !1), Gt(c), this.pos = 0);
      const e = Math.min(l - this.pos, u - t), s = o + t;
      if (e === l && !(s % 4) && t + e < u) {
        const a = new Uint32Array(n, s, Math.floor((u - t) / 4));
        Gt(a);
        for (let d = 0; t + l < u; d += c.length, t += l)
          this.length += l, this.compress(a, d, !1);
        Gt(a);
        continue;
      }
      f.set(i.subarray(t, t + e), this.pos), this.pos += e, this.length += e, t += e;
    }
    return this;
  }
  digestInto(i) {
    Qe(this), hs(i, this);
    const { pos: l, buffer32: f } = this;
    this.finished = !0, Ae(this.buffer.subarray(l)), Gt(f), this.compress(f, 0, !0), Gt(f);
    const c = mn(i);
    this.get().forEach((u, o) => c[o] = Zo(u));
  }
  digest() {
    const { buffer: i, outputLen: l } = this;
    this.digestInto(i);
    const f = i.slice(0, l);
    return this.destroy(), f;
  }
  _cloneInto(i) {
    const { buffer: l, length: f, finished: c, destroyed: u, outputLen: o, pos: n } = this;
    return i || (i = new this.constructor({ dkLen: o })), i.set(...this.get()), i.buffer.set(l), i.destroyed = u, i.finished = c, i.length = f, i.pos = n, i.outputLen = o, i;
  }
  clone() {
    return this._cloneInto();
  }
}
function Js(r, i, l, f, c, u, o, n, t, e, s, a, d, _, g, v, w, p, D, O) {
  let R = 0;
  for (let S = 0; S < f; S++)
    ({ a: c, b: t, c: d, d: w } = fe(c, t, d, w, l[i + r[R++]])), { a: c, b: t, c: d, d: w } = de(c, t, d, w, l[i + r[R++]]), { a: u, b: e, c: _, d: p } = fe(u, e, _, p, l[i + r[R++]]), { a: u, b: e, c: _, d: p } = de(u, e, _, p, l[i + r[R++]]), { a: o, b: s, c: g, d: D } = fe(o, s, g, D, l[i + r[R++]]), { a: o, b: s, c: g, d: D } = de(o, s, g, D, l[i + r[R++]]), { a: n, b: a, c: v, d: O } = fe(n, a, v, O, l[i + r[R++]]), { a: n, b: a, c: v, d: O } = de(n, a, v, O, l[i + r[R++]]), { a: c, b: e, c: g, d: O } = fe(c, e, g, O, l[i + r[R++]]), { a: c, b: e, c: g, d: O } = de(c, e, g, O, l[i + r[R++]]), { a: u, b: s, c: v, d: w } = fe(u, s, v, w, l[i + r[R++]]), { a: u, b: s, c: v, d: w } = de(u, s, v, w, l[i + r[R++]]), { a: o, b: a, c: d, d: p } = fe(o, a, d, p, l[i + r[R++]]), { a: o, b: a, c: d, d: p } = de(o, a, d, p, l[i + r[R++]]), { a: n, b: t, c: _, d: D } = fe(n, t, _, D, l[i + r[R++]]), { a: n, b: t, c: _, d: D } = de(n, t, _, D, l[i + r[R++]]);
  return { v0: c, v1: u, v2: o, v3: n, v4: t, v5: e, v6: s, v7: a, v8: d, v9: _, v10: g, v11: v, v12: w, v13: p, v14: D, v15: O };
}
const ee = {
  CHUNK_START: 1,
  CHUNK_END: 2,
  PARENT: 4,
  ROOT: 8,
  KEYED_HASH: 16,
  DERIVE_KEY_CONTEXT: 32,
  DERIVE_KEY_MATERIAL: 64
}, oe = ac.slice(), Qs = /* @__PURE__ */ (() => {
  const r = Array.from({ length: 16 }, (f, c) => c), i = (f) => [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8].map((c) => f[c]), l = [];
  for (let f = 0, c = r; f < 7; f++, c = i(c))
    l.push(...c);
  return Uint8Array.from(l);
})();
class _s extends _c {
  constructor(i = {}, l = 0) {
    super(64, i.dkLen === void 0 ? 32 : i.dkLen), this.chunkPos = 0, this.chunksDone = 0, this.flags = 0, this.stack = [], this.posOut = 0, this.bufferOut32 = new Uint32Array(16), this.chunkOut = 0, this.enableXOF = !0;
    const { key: f, context: c } = i, u = c !== void 0;
    if (f !== void 0) {
      if (u)
        throw new Error('Only "key" or "context" can be specified at same time');
      const o = ze(f).slice();
      Me(o, 32), this.IV = mn(o), Gt(this.IV), this.flags = l | ee.KEYED_HASH;
    } else if (u) {
      const o = ze(c), n = new _s({ dkLen: 32 }, ee.DERIVE_KEY_CONTEXT).update(o).digest();
      this.IV = mn(n), Gt(this.IV), this.flags = l | ee.DERIVE_KEY_MATERIAL;
    } else
      this.IV = oe.slice(), this.flags = l;
    this.state = this.IV.slice(), this.bufferOut = Xo(this.bufferOut32);
  }
  // Unused
  get() {
    return [];
  }
  set() {
  }
  b2Compress(i, l, f, c = 0) {
    const { state: u, pos: o } = this, { h: n, l: t } = Jn(BigInt(i), !0), { v0: e, v1: s, v2: a, v3: d, v4: _, v5: g, v6: v, v7: w, v8: p, v9: D, v10: O, v11: R, v12: S, v13: U, v14: A, v15: q } = Js(Qs, c, f, 7, u[0], u[1], u[2], u[3], u[4], u[5], u[6], u[7], oe[0], oe[1], oe[2], oe[3], n, t, o, l);
    u[0] = e ^ p, u[1] = s ^ D, u[2] = a ^ O, u[3] = d ^ R, u[4] = _ ^ S, u[5] = g ^ U, u[6] = v ^ A, u[7] = w ^ q;
  }
  compress(i, l = 0, f = !1) {
    let c = this.flags;
    if (this.chunkPos || (c |= ee.CHUNK_START), (this.chunkPos === 15 || f) && (c |= ee.CHUNK_END), f || (this.pos = this.blockLen), this.b2Compress(this.chunksDone, c, i, l), this.chunkPos += 1, this.chunkPos === 16 || f) {
      let u = this.state;
      this.state = this.IV.slice();
      for (let o, n = this.chunksDone + 1; (f || !(n & 1)) && (o = this.stack.pop()); n >>= 1)
        this.buffer32.set(o, 0), this.buffer32.set(u, 8), this.pos = this.blockLen, this.b2Compress(0, this.flags | ee.PARENT, this.buffer32, 0), u = this.state, this.state = this.IV.slice();
      this.chunksDone++, this.chunkPos = 0, this.stack.push(u);
    }
    this.pos = 0;
  }
  _cloneInto(i) {
    i = super._cloneInto(i);
    const { IV: l, flags: f, state: c, chunkPos: u, posOut: o, chunkOut: n, stack: t, chunksDone: e } = this;
    return i.state.set(c.slice()), i.stack = t.map((s) => Uint32Array.from(s)), i.IV.set(l), i.flags = f, i.chunkPos = u, i.chunksDone = e, i.posOut = o, i.chunkOut = n, i.enableXOF = this.enableXOF, i.bufferOut32.set(this.bufferOut32), i;
  }
  destroy() {
    this.destroyed = !0, Ae(this.state, this.buffer32, this.IV, this.bufferOut32), Ae(...this.stack);
  }
  // Same as b2Compress, but doesn't modify state and returns 16 u32 array (instead of 8)
  b2CompressOut() {
    const { state: i, pos: l, flags: f, buffer32: c, bufferOut32: u } = this, { h: o, l: n } = Jn(BigInt(this.chunkOut++));
    Gt(c);
    const { v0: t, v1: e, v2: s, v3: a, v4: d, v5: _, v6: g, v7: v, v8: w, v9: p, v10: D, v11: O, v12: R, v13: S, v14: U, v15: A } = Js(Qs, 0, c, 7, i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], oe[0], oe[1], oe[2], oe[3], n, o, l, f);
    u[0] = t ^ w, u[1] = e ^ p, u[2] = s ^ D, u[3] = a ^ O, u[4] = d ^ R, u[5] = _ ^ S, u[6] = g ^ U, u[7] = v ^ A, u[8] = i[0] ^ w, u[9] = i[1] ^ p, u[10] = i[2] ^ D, u[11] = i[3] ^ O, u[12] = i[4] ^ R, u[13] = i[5] ^ S, u[14] = i[6] ^ U, u[15] = i[7] ^ A, Gt(c), Gt(u), this.posOut = 0;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = !0, Ae(this.buffer.subarray(this.pos));
    let i = this.flags | ee.ROOT;
    this.stack.length ? (i |= ee.PARENT, Gt(this.buffer32), this.compress(this.buffer32, 0, !0), Gt(this.buffer32), this.chunksDone = 0, this.pos = this.blockLen) : i |= (this.chunkPos ? 0 : ee.CHUNK_START) | ee.CHUNK_END, this.flags = i, this.b2CompressOut();
  }
  writeInto(i) {
    Qe(this, !1), Me(i), this.finish();
    const { blockLen: l, bufferOut: f } = this;
    for (let c = 0, u = i.length; c < u; ) {
      this.posOut >= l && this.b2CompressOut();
      const o = Math.min(l - this.posOut, u - c);
      i.set(f.subarray(this.posOut, this.posOut + o), c), this.posOut += o, c += o;
    }
    return i;
  }
  xofInto(i) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible after digest call");
    return this.writeInto(i);
  }
  xof(i) {
    return Yn(i), this.xofInto(new Uint8Array(i));
  }
  digestInto(i) {
    if (hs(i, this), this.finished)
      throw new Error("digest() was already called");
    return this.enableXOF = !1, this.writeInto(i), this.destroy(), i;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
}
const bs = /* @__PURE__ */ sc((r) => new _s(r));
function bc(r) {
  if (r.length >= 255)
    throw new TypeError("Alphabet too long");
  const i = new Uint8Array(256);
  for (let e = 0; e < i.length; e++)
    i[e] = 255;
  for (let e = 0; e < r.length; e++) {
    const s = r.charAt(e), a = s.charCodeAt(0);
    if (i[a] !== 255)
      throw new TypeError(s + " is ambiguous");
    i[a] = e;
  }
  const l = r.length, f = r.charAt(0), c = Math.log(l) / Math.log(256), u = Math.log(256) / Math.log(l);
  function o(e) {
    if (e instanceof Uint8Array || (ArrayBuffer.isView(e) ? e = new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : Array.isArray(e) && (e = Uint8Array.from(e))), !(e instanceof Uint8Array))
      throw new TypeError("Expected Uint8Array");
    if (e.length === 0)
      return "";
    let s = 0, a = 0, d = 0;
    const _ = e.length;
    for (; d !== _ && e[d] === 0; )
      d++, s++;
    const g = (_ - d) * u + 1 >>> 0, v = new Uint8Array(g);
    for (; d !== _; ) {
      let D = e[d], O = 0;
      for (let R = g - 1; (D !== 0 || O < a) && R !== -1; R--, O++)
        D += 256 * v[R] >>> 0, v[R] = D % l >>> 0, D = D / l >>> 0;
      if (D !== 0)
        throw new Error("Non-zero carry");
      a = O, d++;
    }
    let w = g - a;
    for (; w !== g && v[w] === 0; )
      w++;
    let p = f.repeat(s);
    for (; w < g; ++w)
      p += r.charAt(v[w]);
    return p;
  }
  function n(e) {
    if (typeof e != "string")
      throw new TypeError("Expected String");
    if (e.length === 0)
      return new Uint8Array();
    let s = 0, a = 0, d = 0;
    for (; e[s] === f; )
      a++, s++;
    const _ = (e.length - s) * c + 1 >>> 0, g = new Uint8Array(_);
    for (; s < e.length; ) {
      const D = e.charCodeAt(s);
      if (D > 255)
        return;
      let O = i[D];
      if (O === 255)
        return;
      let R = 0;
      for (let S = _ - 1; (O !== 0 || R < d) && S !== -1; S--, R++)
        O += l * g[S] >>> 0, g[S] = O % 256 >>> 0, O = O / 256 >>> 0;
      if (O !== 0)
        throw new Error("Non-zero carry");
      d = R, s++;
    }
    let v = _ - d;
    for (; v !== _ && g[v] === 0; )
      v++;
    const w = new Uint8Array(a + (_ - v));
    let p = a;
    for (; v !== _; )
      w[p++] = g[v++];
    return w;
  }
  function t(e) {
    const s = n(e);
    if (s)
      return s;
    throw new Error("Non-base" + l + " character");
  }
  return {
    encode: o,
    decodeUnsafe: n,
    decode: t
  };
}
var pc = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const tn = bc(pc);
function gc(r) {
  if (Object.prototype.hasOwnProperty.call(r, "__esModule")) return r;
  var i = r.default;
  if (typeof i == "function") {
    var l = function f() {
      return this instanceof f ? Reflect.construct(i, arguments, this.constructor) : i.apply(this, arguments);
    };
    l.prototype = i.prototype;
  } else l = {};
  return Object.defineProperty(l, "__esModule", { value: !0 }), Object.keys(r).forEach(function(f) {
    var c = Object.getOwnPropertyDescriptor(r, f);
    Object.defineProperty(l, f, c.get ? c : {
      enumerable: !0,
      get: function() {
        return r[f];
      }
    });
  }), l;
}
var we = {}, H = {};
const wn = 2, Jt = 4, re = 4, Hi = 4, ue = new Int32Array(2), Qn = new Float32Array(ue.buffer), ts = new Float64Array(ue.buffer), Ze = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
var Dn;
(function(r) {
  r[r.UTF8_BYTES = 1] = "UTF8_BYTES", r[r.UTF16_STRING = 2] = "UTF16_STRING";
})(Dn || (Dn = {}));
class en {
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
    return new en(new Uint8Array(i));
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
    return ue[0] = this.readInt32(i), Qn[0];
  }
  readFloat64(i) {
    return ue[Ze ? 0 : 1] = this.readInt32(i), ue[Ze ? 1 : 0] = this.readInt32(i + 4), ts[0];
  }
  writeInt8(i, l) {
    this.bytes_[i] = l;
  }
  writeUint8(i, l) {
    this.bytes_[i] = l;
  }
  writeInt16(i, l) {
    this.bytes_[i] = l, this.bytes_[i + 1] = l >> 8;
  }
  writeUint16(i, l) {
    this.bytes_[i] = l, this.bytes_[i + 1] = l >> 8;
  }
  writeInt32(i, l) {
    this.bytes_[i] = l, this.bytes_[i + 1] = l >> 8, this.bytes_[i + 2] = l >> 16, this.bytes_[i + 3] = l >> 24;
  }
  writeUint32(i, l) {
    this.bytes_[i] = l, this.bytes_[i + 1] = l >> 8, this.bytes_[i + 2] = l >> 16, this.bytes_[i + 3] = l >> 24;
  }
  writeInt64(i, l) {
    this.writeInt32(i, Number(BigInt.asIntN(32, l))), this.writeInt32(i + 4, Number(BigInt.asIntN(32, l >> BigInt(32))));
  }
  writeUint64(i, l) {
    this.writeUint32(i, Number(BigInt.asUintN(32, l))), this.writeUint32(i + 4, Number(BigInt.asUintN(32, l >> BigInt(32))));
  }
  writeFloat32(i, l) {
    Qn[0] = l, this.writeInt32(i, ue[0]);
  }
  writeFloat64(i, l) {
    ts[0] = l, this.writeInt32(i, ue[Ze ? 0 : 1]), this.writeInt32(i + 4, ue[Ze ? 1 : 0]);
  }
  /**
   * Return the file identifier.   Behavior is undefined for FlatBuffers whose
   * schema does not include a file_identifier (likely points at padding or the
   * start of a the root vtable).
   */
  getBufferIdentifier() {
    if (this.bytes_.length < this.position_ + Jt + re)
      throw new Error("FlatBuffers: ByteBuffer is too short to contain an identifier.");
    let i = "";
    for (let l = 0; l < re; l++)
      i += String.fromCharCode(this.readInt8(this.position_ + Jt + l));
    return i;
  }
  /**
   * Look up a field in the vtable, return an offset into the object, or 0 if the
   * field is not present.
   */
  __offset(i, l) {
    const f = i - this.readInt32(i);
    return l < this.readInt16(f) ? this.readInt16(f + l) : 0;
  }
  /**
   * Initialize any Table-derived type to point to the union at the given offset.
   */
  __union(i, l) {
    return i.bb_pos = l + this.readInt32(l), i.bb = this, i;
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
  __string(i, l) {
    i += this.readInt32(i);
    const f = this.readInt32(i);
    i += Jt;
    const c = this.bytes_.subarray(i, i + f);
    return l === Dn.UTF8_BYTES ? c : this.text_decoder_.decode(c);
  }
  /**
   * Handle unions that can contain string as its member, if a Table-derived type then initialize it,
   * if a string then return a new one
   *
   * WARNING: strings are immutable in JS so we can't change the string that the user gave us, this
   * makes the behaviour of __union_with_string different compared to __union
   */
  __union_with_string(i, l) {
    return typeof i == "string" ? this.__string(l) : this.__union(i, l);
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
    return i + this.readInt32(i) + Jt;
  }
  /**
   * Get the length of a vector whose offset is stored at "offset" in this object.
   */
  __vector_len(i) {
    return this.readInt32(i + this.readInt32(i));
  }
  __has_identifier(i) {
    if (i.length != re)
      throw new Error("FlatBuffers: file identifier must be length " + re);
    for (let l = 0; l < re; l++)
      if (i.charCodeAt(l) != this.readInt8(this.position() + Jt + l))
        return !1;
    return !0;
  }
  /**
   * A helper function for generating list for obj api
   */
  createScalarList(i, l) {
    const f = [];
    for (let c = 0; c < l; ++c) {
      const u = i(c);
      u !== null && f.push(u);
    }
    return f;
  }
  /**
   * A helper function for generating list for obj api
   * @param listAccessor function that accepts an index and return data at that index
   * @param listLength listLength
   * @param res result list
   */
  createObjList(i, l) {
    const f = [];
    for (let c = 0; c < l; ++c) {
      const u = i(c);
      u !== null && f.push(u.unpack());
    }
    return f;
  }
}
class ps {
  /**
   * Create a FlatBufferBuilder.
   */
  constructor(i) {
    this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = !1, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = !1, this.string_maps = null, this.text_encoder = new TextEncoder();
    let l;
    i ? l = i : l = 1024, this.bb = en.allocate(l), this.space = l;
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
  prep(i, l) {
    i > this.minalign && (this.minalign = i);
    const f = ~(this.bb.capacity() - this.space + l) + 1 & i - 1;
    for (; this.space < f + i + l; ) {
      const c = this.bb.capacity();
      this.bb = ps.growByteBuffer(this.bb), this.space += this.bb.capacity() - c;
    }
    this.pad(f);
  }
  pad(i) {
    for (let l = 0; l < i; l++)
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
  addFieldInt8(i, l, f) {
    (this.force_defaults || l != f) && (this.addInt8(l), this.slot(i));
  }
  addFieldInt16(i, l, f) {
    (this.force_defaults || l != f) && (this.addInt16(l), this.slot(i));
  }
  addFieldInt32(i, l, f) {
    (this.force_defaults || l != f) && (this.addInt32(l), this.slot(i));
  }
  addFieldInt64(i, l, f) {
    (this.force_defaults || l !== f) && (this.addInt64(l), this.slot(i));
  }
  addFieldFloat32(i, l, f) {
    (this.force_defaults || l != f) && (this.addFloat32(l), this.slot(i));
  }
  addFieldFloat64(i, l, f) {
    (this.force_defaults || l != f) && (this.addFloat64(l), this.slot(i));
  }
  addFieldOffset(i, l, f) {
    (this.force_defaults || l != f) && (this.addOffset(l), this.slot(i));
  }
  /**
   * Structs are stored inline, so nothing additional is being added. `d` is always 0.
   */
  addFieldStruct(i, l, f) {
    l != f && (this.nested(l), this.slot(i));
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
    const l = i.capacity();
    if (l & 3221225472)
      throw new Error("FlatBuffers: cannot grow buffer beyond 2 gigabytes.");
    const f = l << 1, c = en.allocate(f);
    return c.setPosition(f - l), c.bytes().set(i.bytes(), f - l), c;
  }
  /**
   * Adds on offset, relative to where it will be written.
   *
   * @param offset The offset to add.
   */
  addOffset(i) {
    this.prep(Jt, 0), this.writeInt32(this.offset() - i + Jt);
  }
  /**
   * Start encoding a new object in the buffer.  Users will not usually need to
   * call this directly. The FlatBuffers compiler will generate helper methods
   * that call this method internally.
   */
  startObject(i) {
    this.notNested(), this.vtable == null && (this.vtable = []), this.vtable_in_use = i;
    for (let l = 0; l < i; l++)
      this.vtable[l] = 0;
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
    let l = this.vtable_in_use - 1;
    for (; l >= 0 && this.vtable[l] == 0; l--)
      ;
    const f = l + 1;
    for (; l >= 0; l--)
      this.addInt16(this.vtable[l] != 0 ? i - this.vtable[l] : 0);
    const c = 2;
    this.addInt16(i - this.object_start);
    const u = (f + c) * wn;
    this.addInt16(u);
    let o = 0;
    const n = this.space;
    t: for (l = 0; l < this.vtables.length; l++) {
      const t = this.bb.capacity() - this.vtables[l];
      if (u == this.bb.readInt16(t)) {
        for (let e = wn; e < u; e += wn)
          if (this.bb.readInt16(n + e) != this.bb.readInt16(t + e))
            continue t;
        o = this.vtables[l];
        break;
      }
    }
    return o ? (this.space = this.bb.capacity() - i, this.bb.writeInt32(this.space, o - i)) : (this.vtables.push(this.offset()), this.bb.writeInt32(this.bb.capacity() - i, this.offset() - i)), this.isNested = !1, i;
  }
  /**
   * Finalize a buffer, poiting to the given `root_table`.
   */
  finish(i, l, f) {
    const c = f ? Hi : 0;
    if (l) {
      const u = l;
      if (this.prep(this.minalign, Jt + re + c), u.length != re)
        throw new TypeError("FlatBuffers: file identifier must be length " + re);
      for (let o = re - 1; o >= 0; o--)
        this.writeInt8(u.charCodeAt(o));
    }
    this.prep(this.minalign, Jt + c), this.addOffset(i), c && this.addInt32(this.bb.capacity() - this.space), this.bb.setPosition(this.space);
  }
  /**
   * Finalize a size prefixed buffer, pointing to the given `root_table`.
   */
  finishSizePrefixed(i, l) {
    this.finish(i, l, !0);
  }
  /**
   * This checks a required field has been set in a given table that has
   * just been constructed.
   */
  requiredField(i, l) {
    const f = this.bb.capacity() - i, c = f - this.bb.readInt32(f);
    if (!(l < this.bb.readInt16(c) && this.bb.readInt16(c + l) != 0))
      throw new TypeError("FlatBuffers: field " + l + " must be set");
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
  startVector(i, l, f) {
    this.notNested(), this.vector_num_elems = l, this.prep(Jt, i * l), this.prep(f, i * l);
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
    const l = this.createString(i);
    return this.string_maps.set(i, l), l;
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
    let l;
    return i instanceof Uint8Array ? l = i : l = this.text_encoder.encode(i), this.addInt8(0), this.startVector(1, l.length, 1), this.bb.setPosition(this.space -= l.length), this.bb.bytes().set(l, this.space), this.endVector();
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
    const l = [];
    for (let f = 0; f < i.length; ++f) {
      const c = i[f];
      if (c !== null)
        l.push(this.createObjectOffset(c));
      else
        throw new TypeError("FlatBuffers: Argument for createObjectOffsetList cannot contain null.");
    }
    return l;
  }
  createStructOffsetList(i, l) {
    return l(this, i.length), this.createObjectOffsetList(i.slice().reverse()), this.endVector();
  }
}
const yc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Builder: ps,
  ByteBuffer: en,
  get Encoding() {
    return Dn;
  },
  FILE_IDENTIFIER_LENGTH: re,
  SIZEOF_INT: Jt,
  SIZEOF_SHORT: wn,
  SIZE_PREFIX_LENGTH: Hi,
  float32: Qn,
  float64: ts,
  int32: ue,
  isLittleEndian: Ze
}, Symbol.toStringTag, { value: "Module" })), j = /* @__PURE__ */ gc(yc);
var He = {}, bn = {}, tr;
function Oc() {
  if (tr) return bn;
  tr = 1, Object.defineProperty(bn, "__esModule", { value: !0 });
  function r(i) {
    if (i.length >= 255)
      throw new TypeError("Alphabet too long");
    const l = new Uint8Array(256);
    for (let s = 0; s < l.length; s++)
      l[s] = 255;
    for (let s = 0; s < i.length; s++) {
      const a = i.charAt(s), d = a.charCodeAt(0);
      if (l[d] !== 255)
        throw new TypeError(a + " is ambiguous");
      l[d] = s;
    }
    const f = i.length, c = i.charAt(0), u = Math.log(f) / Math.log(256), o = Math.log(256) / Math.log(f);
    function n(s) {
      if (s instanceof Uint8Array || (ArrayBuffer.isView(s) ? s = new Uint8Array(s.buffer, s.byteOffset, s.byteLength) : Array.isArray(s) && (s = Uint8Array.from(s))), !(s instanceof Uint8Array))
        throw new TypeError("Expected Uint8Array");
      if (s.length === 0)
        return "";
      let a = 0, d = 0, _ = 0;
      const g = s.length;
      for (; _ !== g && s[_] === 0; )
        _++, a++;
      const v = (g - _) * o + 1 >>> 0, w = new Uint8Array(v);
      for (; _ !== g; ) {
        let O = s[_], R = 0;
        for (let S = v - 1; (O !== 0 || R < d) && S !== -1; S--, R++)
          O += 256 * w[S] >>> 0, w[S] = O % f >>> 0, O = O / f >>> 0;
        if (O !== 0)
          throw new Error("Non-zero carry");
        d = R, _++;
      }
      let p = v - d;
      for (; p !== v && w[p] === 0; )
        p++;
      let D = c.repeat(a);
      for (; p < v; ++p)
        D += i.charAt(w[p]);
      return D;
    }
    function t(s) {
      if (typeof s != "string")
        throw new TypeError("Expected String");
      if (s.length === 0)
        return new Uint8Array();
      let a = 0, d = 0, _ = 0;
      for (; s[a] === c; )
        d++, a++;
      const g = (s.length - a) * u + 1 >>> 0, v = new Uint8Array(g);
      for (; a < s.length; ) {
        const O = s.charCodeAt(a);
        if (O > 255)
          return;
        let R = l[O];
        if (R === 255)
          return;
        let S = 0;
        for (let U = g - 1; (R !== 0 || S < _) && U !== -1; U--, S++)
          R += f * v[U] >>> 0, v[U] = R % 256 >>> 0, R = R / 256 >>> 0;
        if (R !== 0)
          throw new Error("Non-zero carry");
        _ = S, a++;
      }
      let w = g - _;
      for (; w !== g && v[w] === 0; )
        w++;
      const p = new Uint8Array(d + (g - w));
      let D = d;
      for (; w !== g; )
        p[D++] = v[w++];
      return p;
    }
    function e(s) {
      const a = t(s);
      if (a)
        return a;
      throw new Error("Non-base" + f + " character");
    }
    return {
      encode: n,
      decodeUnsafe: t,
      decode: e
    };
  }
  return bn.default = r, bn;
}
var er;
function wc() {
  if (er) return He;
  er = 1;
  var r = He && He.__importDefault || function(f) {
    return f && f.__esModule ? f : { default: f };
  };
  Object.defineProperty(He, "__esModule", { value: !0 });
  var i = r(Oc()), l = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return He.default = (0, i.default)(l), He;
}
var Fn = {}, nr;
function Ki() {
  return nr || (nr = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.ReassemblyBuffer = r.StreamError = r.MAX_CONCURRENT_STREAMS = r.MAX_TOTAL_CHUNKS = r.CHUNK_THRESHOLD = r.CHUNK_SIZE = void 0, r.CHUNK_SIZE = 256 * 1024, r.CHUNK_THRESHOLD = 512 * 1024, r.MAX_TOTAL_CHUNKS = 256, r.MAX_CONCURRENT_STREAMS = 8;
    class i extends Error {
      constructor(u) {
        super(u), this.name = "StreamError";
      }
    }
    r.StreamError = i;
    const l = 6e4;
    class f {
      constructor() {
        this.streams = /* @__PURE__ */ new Map();
      }
      receiveChunk(u, o, n, t) {
        if (n === 0)
          throw new i("total_chunks is zero");
        if (n > r.MAX_TOTAL_CHUNKS)
          throw new i(`total_chunks ${n} exceeds maximum ${r.MAX_TOTAL_CHUNKS}`);
        if (o >= n)
          throw new i(`chunk index ${o} out of range for stream ${u} (total ${n})`);
        if (this.evictStale(), !this.streams.has(u) && this.streams.size >= r.MAX_CONCURRENT_STREAMS)
          throw new i(`too many concurrent streams (${this.streams.size}), maximum is ${r.MAX_CONCURRENT_STREAMS}`);
        let e = this.streams.get(u);
        if (e || (e = {
          chunks: new Array(n).fill(null),
          total: n,
          received: 0,
          createdAt: Date.now()
        }, this.streams.set(u, e)), e.total !== n)
          throw new i(`total_chunks mismatch for stream ${u} (expected ${e.total}, got ${n})`);
        if (e.chunks[o] !== null)
          throw new i(`duplicate chunk index ${o} for stream ${u}`);
        if (e.chunks[o] = t, e.received += 1, e.received === e.total) {
          this.streams.delete(u);
          let s = 0;
          for (const _ of e.chunks)
            s += _.length;
          const a = new Uint8Array(s);
          let d = 0;
          for (const _ of e.chunks)
            a.set(_, d), d += _.length;
          return a;
        }
        return null;
      }
      removeStream(u) {
        return this.streams.delete(u);
      }
      evictStale() {
        const u = Date.now();
        for (const [o, n] of this.streams)
          u - n.createdAt > l && this.streams.delete(o);
      }
    }
    r.ReassemblyBuffer = f;
  })(Fn)), Fn;
}
var K = {}, ve = {}, k = {}, G = {}, sr;
function ki() {
  if (sr) return G;
  sr = 1;
  var r = G && G.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = G && G.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = G && G.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(G, "__esModule", { value: !0 }), G.ContractCodeT = G.ContractCode = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsContractCode(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsContractCode(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startContractCode(n), c.addData(n, t), c.addCodeHash(n, e), c.endContractCode(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.data.bind(this), this.dataLength()), this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength()), n.codeHash = this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength());
    }
  }
  G.ContractCode = c;
  class u {
    constructor(n = [], t = []) {
      this.data = n, this.codeHash = t;
    }
    pack(n) {
      const t = c.createDataVector(n, this.data), e = c.createCodeHashVector(n, this.codeHash);
      return c.createContractCode(n, t, e);
    }
  }
  return G.ContractCodeT = u, G;
}
var x = {}, $ = {}, rr;
function ge() {
  if (rr) return $;
  rr = 1;
  var r = $ && $.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = $ && $.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = $ && $.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty($, "__esModule", { value: !0 }), $.ContractInstanceIdT = $.ContractInstanceId = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsContractInstanceId(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsContractInstanceId(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startContractInstanceId(n), c.addData(n, t), c.endContractInstanceId(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  $.ContractInstanceId = c;
  class u {
    constructor(n = []) {
      this.data = n;
    }
    pack(n) {
      const t = c.createDataVector(n, this.data);
      return c.createContractInstanceId(n, t);
    }
  }
  return $.ContractInstanceIdT = u, $;
}
var ir;
function Qt() {
  if (ir) return x;
  ir = 1;
  var r = x && x.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = x && x.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = x && x.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(x, "__esModule", { value: !0 }), x.ContractKeyT = x.ContractKey = void 0;
  const f = l(j), c = ge();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsContractKey(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsContractKey(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    instance(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startContractKey(t), u.addInstance(t, e), u.addCode(t, s), u.endContractKey(t);
    }
    unpack() {
      return new o(this.instance() !== null ? this.instance().unpack() : null, this.bb.createScalarList(this.code.bind(this), this.codeLength()));
    }
    unpackTo(t) {
      t.instance = this.instance() !== null ? this.instance().unpack() : null, t.code = this.bb.createScalarList(this.code.bind(this), this.codeLength());
    }
  }
  x.ContractKey = u;
  class o {
    constructor(t = null, e = []) {
      this.instance = t, this.code = e;
    }
    pack(t) {
      const e = this.instance !== null ? this.instance.pack(t) : 0, s = u.createCodeVector(t, this.code);
      return u.createContractKey(t, e, s);
    }
  }
  return x.ContractKeyT = o, x;
}
var ar;
function Gi() {
  if (ar) return k;
  ar = 1;
  var r = k && k.__createBinding || (Object.create ? (function(t, e, s, a) {
    a === void 0 && (a = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, a, d);
  }) : (function(t, e, s, a) {
    a === void 0 && (a = s), t[a] = e[s];
  })), i = k && k.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), l = k && k.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var a = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (a[a.length] = d);
        return a;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var a = t(e), d = 0; d < a.length; d++) a[d] !== "default" && r(s, e, a[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(k, "__esModule", { value: !0 }), k.WasmContractV1T = k.WasmContractV1 = void 0;
  const f = l(j), c = ki(), u = Qt();
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsWasmContractV1(e, s) {
      return (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsWasmContractV1(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    data(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new c.ContractCode()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
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
      return s ? (e || new u.ContractKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
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
      for (let a = s.length - 1; a >= 0; a--)
        e.addInt8(s[a]);
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
  k.WasmContractV1 = o;
  class n {
    constructor(e = null, s = [], a = null) {
      this.data = e, this.parameters = s, this.key = a;
    }
    pack(e) {
      const s = this.data !== null ? this.data.pack(e) : 0, a = o.createParametersVector(e, this.parameters), d = this.key !== null ? this.key.pack(e) : 0;
      return o.startWasmContractV1(e), o.addData(e, s), o.addParameters(e, a), o.addKey(e, d), o.endWasmContractV1(e);
    }
  }
  return k.WasmContractV1T = n, k;
}
var or;
function gs() {
  if (or) return ve;
  or = 1, Object.defineProperty(ve, "__esModule", { value: !0 }), ve.ContractType = void 0, ve.unionToContractType = l, ve.unionListToContractType = f;
  const r = Gi();
  var i;
  (function(c) {
    c[c.NONE = 0] = "NONE", c[c.WasmContractV1 = 1] = "WasmContractV1";
  })(i || (ve.ContractType = i = {}));
  function l(c, u) {
    switch (i[c]) {
      case "NONE":
        return null;
      case "WasmContractV1":
        return u(new r.WasmContractV1());
      default:
        return null;
    }
  }
  function f(c, u, o) {
    switch (i[c]) {
      case "NONE":
        return null;
      case "WasmContractV1":
        return u(o, new r.WasmContractV1());
      default:
        return null;
    }
  }
  return ve;
}
var cr;
function An() {
  if (cr) return K;
  cr = 1;
  var r = K && K.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = K && K.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = K && K.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(K, "__esModule", { value: !0 }), K.ContractContainerT = K.ContractContainer = void 0;
  const f = l(j), c = gs();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsContractContainer(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsContractContainer(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    contractType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.ContractType.NONE;
    }
    contract(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startContractContainer(t) {
      t.startObject(2);
    }
    static addContractType(t, e) {
      t.addFieldInt8(0, e, c.ContractType.NONE);
    }
    static addContract(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endContractContainer(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createContractContainer(t, e, s) {
      return u.startContractContainer(t), u.addContractType(t, e), u.addContract(t, s), u.endContractContainer(t);
    }
    unpack() {
      return new o(this.contractType(), (() => {
        const t = (0, c.unionToContractType)(this.contractType(), this.contract.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.contractType = this.contractType(), t.contract = (() => {
        const e = (0, c.unionToContractType)(this.contractType(), this.contract.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  K.ContractContainer = u;
  class o {
    constructor(t = c.ContractType.NONE, e = null) {
      this.contractType = t, this.contract = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.contract);
      return u.createContractContainer(t, this.contractType, e);
    }
  }
  return K.ContractContainerT = o, K;
}
var W = {}, ur;
function ys() {
  if (ur) return W;
  ur = 1;
  var r = W && W.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = W && W.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = W && W.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(W, "__esModule", { value: !0 }), W.DeltaUpdateT = W.DeltaUpdate = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDeltaUpdate(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDeltaUpdate(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startDeltaUpdate(n), c.addDelta(n, t), c.endDeltaUpdate(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.delta.bind(this), this.deltaLength()));
    }
    unpackTo(n) {
      n.delta = this.bb.createScalarList(this.delta.bind(this), this.deltaLength());
    }
  }
  W.DeltaUpdate = c;
  class u {
    constructor(n = []) {
      this.delta = n;
    }
    pack(n) {
      const t = c.createDeltaVector(n, this.delta);
      return c.createDeltaUpdate(n, t);
    }
  }
  return W.DeltaUpdateT = u, W;
}
var z = {}, lr;
function Os() {
  if (lr) return z;
  lr = 1;
  var r = z && z.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = z && z.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = z && z.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(z, "__esModule", { value: !0 }), z.RelatedDeltaUpdateT = z.RelatedDeltaUpdate = void 0;
  const f = l(j), c = ge();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedDeltaUpdate(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedDeltaUpdate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    relatedTo(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startRelatedDeltaUpdate(t), u.addRelatedTo(t, e), u.addDelta(t, s), u.endRelatedDeltaUpdate(t);
    }
    unpack() {
      return new o(this.relatedTo() !== null ? this.relatedTo().unpack() : null, this.bb.createScalarList(this.delta.bind(this), this.deltaLength()));
    }
    unpackTo(t) {
      t.relatedTo = this.relatedTo() !== null ? this.relatedTo().unpack() : null, t.delta = this.bb.createScalarList(this.delta.bind(this), this.deltaLength());
    }
  }
  z.RelatedDeltaUpdate = u;
  class o {
    constructor(t = null, e = []) {
      this.relatedTo = t, this.delta = e;
    }
    pack(t) {
      const e = this.relatedTo !== null ? this.relatedTo.pack(t) : 0, s = u.createDeltaVector(t, this.delta);
      return u.createRelatedDeltaUpdate(t, e, s);
    }
  }
  return z.RelatedDeltaUpdateT = o, z;
}
var X = {}, fr;
function ws() {
  if (fr) return X;
  fr = 1;
  var r = X && X.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = X && X.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = X && X.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(X, "__esModule", { value: !0 }), X.RelatedStateAndDeltaUpdateT = X.RelatedStateAndDeltaUpdate = void 0;
  const f = l(j), c = ge();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedStateAndDeltaUpdate(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedStateAndDeltaUpdate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    relatedTo(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
    static createRelatedStateAndDeltaUpdate(t, e, s, a) {
      return u.startRelatedStateAndDeltaUpdate(t), u.addRelatedTo(t, e), u.addState(t, s), u.addDelta(t, a), u.endRelatedStateAndDeltaUpdate(t);
    }
    unpack() {
      return new o(this.relatedTo() !== null ? this.relatedTo().unpack() : null, this.bb.createScalarList(this.state.bind(this), this.stateLength()), this.bb.createScalarList(this.delta.bind(this), this.deltaLength()));
    }
    unpackTo(t) {
      t.relatedTo = this.relatedTo() !== null ? this.relatedTo().unpack() : null, t.state = this.bb.createScalarList(this.state.bind(this), this.stateLength()), t.delta = this.bb.createScalarList(this.delta.bind(this), this.deltaLength());
    }
  }
  X.RelatedStateAndDeltaUpdate = u;
  class o {
    constructor(t = null, e = [], s = []) {
      this.relatedTo = t, this.state = e, this.delta = s;
    }
    pack(t) {
      const e = this.relatedTo !== null ? this.relatedTo.pack(t) : 0, s = u.createStateVector(t, this.state), a = u.createDeltaVector(t, this.delta);
      return u.createRelatedStateAndDeltaUpdate(t, e, s, a);
    }
  }
  return X.RelatedStateAndDeltaUpdateT = o, X;
}
var Z = {}, dr;
function vs() {
  if (dr) return Z;
  dr = 1;
  var r = Z && Z.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Z && Z.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = Z && Z.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Z, "__esModule", { value: !0 }), Z.RelatedStateUpdateT = Z.RelatedStateUpdate = void 0;
  const f = l(j), c = ge();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedStateUpdate(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedStateUpdate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    relatedTo(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startRelatedStateUpdate(t), u.addRelatedTo(t, e), u.addState(t, s), u.endRelatedStateUpdate(t);
    }
    unpack() {
      return new o(this.relatedTo() !== null ? this.relatedTo().unpack() : null, this.bb.createScalarList(this.state.bind(this), this.stateLength()));
    }
    unpackTo(t) {
      t.relatedTo = this.relatedTo() !== null ? this.relatedTo().unpack() : null, t.state = this.bb.createScalarList(this.state.bind(this), this.stateLength());
    }
  }
  Z.RelatedStateUpdate = u;
  class o {
    constructor(t = null, e = []) {
      this.relatedTo = t, this.state = e;
    }
    pack(t) {
      const e = this.relatedTo !== null ? this.relatedTo.pack(t) : 0, s = u.createStateVector(t, this.state);
      return u.createRelatedStateUpdate(t, e, s);
    }
  }
  return Z.RelatedStateUpdateT = o, Z;
}
var Y = {}, hr;
function Rs() {
  if (hr) return Y;
  hr = 1;
  var r = Y && Y.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Y && Y.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Y && Y.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Y, "__esModule", { value: !0 }), Y.StateAndDeltaUpdateT = Y.StateAndDeltaUpdate = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsStateAndDeltaUpdate(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsStateAndDeltaUpdate(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startStateAndDeltaUpdate(n), c.addState(n, t), c.addDelta(n, e), c.endStateAndDeltaUpdate(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.state.bind(this), this.stateLength()), this.bb.createScalarList(this.delta.bind(this), this.deltaLength()));
    }
    unpackTo(n) {
      n.state = this.bb.createScalarList(this.state.bind(this), this.stateLength()), n.delta = this.bb.createScalarList(this.delta.bind(this), this.deltaLength());
    }
  }
  Y.StateAndDeltaUpdate = c;
  class u {
    constructor(n = [], t = []) {
      this.state = n, this.delta = t;
    }
    pack(n) {
      const t = c.createStateVector(n, this.state), e = c.createDeltaVector(n, this.delta);
      return c.createStateAndDeltaUpdate(n, t, e);
    }
  }
  return Y.StateAndDeltaUpdateT = u, Y;
}
var J = {}, _r;
function Ts() {
  if (_r) return J;
  _r = 1;
  var r = J && J.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = J && J.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = J && J.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(J, "__esModule", { value: !0 }), J.StateUpdateT = J.StateUpdate = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsStateUpdate(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsStateUpdate(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startStateUpdate(n), c.addState(n, t), c.endStateUpdate(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.state.bind(this), this.stateLength()));
    }
    unpackTo(n) {
      n.state = this.bb.createScalarList(this.state.bind(this), this.stateLength());
    }
  }
  J.StateUpdate = c;
  class u {
    constructor(n = []) {
      this.state = n;
    }
    pack(n) {
      const t = c.createStateVector(n, this.state);
      return c.createStateUpdate(n, t);
    }
  }
  return J.StateUpdateT = u, J;
}
var Bn = {}, Q = {}, tt = {}, br;
function qn() {
  if (br) return tt;
  br = 1;
  var r = tt && tt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = tt && tt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = tt && tt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(tt, "__esModule", { value: !0 }), tt.DelegateKeyT = tt.DelegateKey = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDelegateKey(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDelegateKey(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startDelegateKey(n), c.addKey(n, t), c.addCodeHash(n, e), c.endDelegateKey(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.key.bind(this), this.keyLength()), this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength()));
    }
    unpackTo(n) {
      n.key = this.bb.createScalarList(this.key.bind(this), this.keyLength()), n.codeHash = this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength());
    }
  }
  tt.DelegateKey = c;
  class u {
    constructor(n = [], t = []) {
      this.key = n, this.codeHash = t;
    }
    pack(n) {
      const t = c.createKeyVector(n, this.key), e = c.createCodeHashVector(n, this.codeHash);
      return c.createDelegateKey(n, t, e);
    }
  }
  return tt.DelegateKeyT = u, tt;
}
var et = {}, Re = {}, nt = {}, st = {}, pr;
function xi() {
  if (pr) return st;
  pr = 1;
  var r = st && st.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = st && st.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = st && st.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(st, "__esModule", { value: !0 }), st.ClientResponseT = st.ClientResponse = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsClientResponse(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsClientResponse(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startClientResponse(n), c.addData(n, t), c.endClientResponse(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  st.ClientResponse = c;
  class u {
    constructor(n = []) {
      this.data = n;
    }
    pack(n) {
      const t = c.createDataVector(n, this.data);
      return c.createClientResponse(n, t);
    }
  }
  return st.ClientResponseT = u, st;
}
var gr;
function $i() {
  if (gr) return nt;
  gr = 1;
  var r = nt && nt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = nt && nt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = nt && nt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(nt, "__esModule", { value: !0 }), nt.UserInputResponseT = nt.UserInputResponse = void 0;
  const f = l(j), c = xi();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUserInputResponse(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUserInputResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    requestId() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint32(this.bb_pos + t) : 0;
    }
    response(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? (t || new c.ClientResponse()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return new o(this.requestId(), this.response() !== null ? this.response().unpack() : null, this.bb.createScalarList(this.delegateContext.bind(this), this.delegateContextLength()));
    }
    unpackTo(t) {
      t.requestId = this.requestId(), t.response = this.response() !== null ? this.response().unpack() : null, t.delegateContext = this.bb.createScalarList(this.delegateContext.bind(this), this.delegateContextLength());
    }
  }
  nt.UserInputResponse = u;
  class o {
    constructor(t = 0, e = null, s = []) {
      this.requestId = t, this.response = e, this.delegateContext = s;
    }
    pack(t) {
      const e = this.response !== null ? this.response.pack(t) : 0, s = u.createDelegateContextVector(t, this.delegateContext);
      return u.startUserInputResponse(t), u.addRequestId(t, this.requestId), u.addResponse(t, e), u.addDelegateContext(t, s), u.endUserInputResponse(t);
    }
  }
  return nt.UserInputResponseT = o, nt;
}
var rt = {}, yr;
function ms() {
  if (yr) return rt;
  yr = 1;
  var r = rt && rt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = rt && rt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = rt && rt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(rt, "__esModule", { value: !0 }), rt.ApplicationMessageT = rt.ApplicationMessage = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsApplicationMessage(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsApplicationMessage(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startApplicationMessage(n), c.addPayload(n, t), c.addContext(n, e), c.addProcessed(n, s), c.endApplicationMessage(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.payload.bind(this), this.payloadLength()), this.bb.createScalarList(this.context.bind(this), this.contextLength()), this.processed());
    }
    unpackTo(n) {
      n.payload = this.bb.createScalarList(this.payload.bind(this), this.payloadLength()), n.context = this.bb.createScalarList(this.context.bind(this), this.contextLength()), n.processed = this.processed();
    }
  }
  rt.ApplicationMessage = c;
  class u {
    constructor(n = [], t = [], e = !1) {
      this.payload = n, this.context = t, this.processed = e;
    }
    pack(n) {
      const t = c.createPayloadVector(n, this.payload), e = c.createContextVector(n, this.context);
      return c.createApplicationMessage(n, t, e, this.processed);
    }
  }
  return rt.ApplicationMessageT = u, rt;
}
var Or;
function Wi() {
  if (Or) return Re;
  Or = 1, Object.defineProperty(Re, "__esModule", { value: !0 }), Re.InboundDelegateMsgType = void 0, Re.unionToInboundDelegateMsgType = f, Re.unionListToInboundDelegateMsgType = c;
  const r = $i(), i = ms();
  var l;
  (function(u) {
    u[u.NONE = 0] = "NONE", u[u.common_ApplicationMessage = 1] = "common_ApplicationMessage", u[u.UserInputResponse = 2] = "UserInputResponse";
  })(l || (Re.InboundDelegateMsgType = l = {}));
  function f(u, o) {
    switch (l[u]) {
      case "NONE":
        return null;
      case "common_ApplicationMessage":
        return o(new i.ApplicationMessage());
      case "UserInputResponse":
        return o(new r.UserInputResponse());
      default:
        return null;
    }
  }
  function c(u, o, n) {
    switch (l[u]) {
      case "NONE":
        return null;
      case "common_ApplicationMessage":
        return o(n, new i.ApplicationMessage());
      case "UserInputResponse":
        return o(n, new r.UserInputResponse());
      default:
        return null;
    }
  }
  return Re;
}
var wr;
function zi() {
  if (wr) return et;
  wr = 1;
  var r = et && et.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = et && et.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = et && et.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(et, "__esModule", { value: !0 }), et.InboundDelegateMsgT = et.InboundDelegateMsg = void 0;
  const f = l(j), c = Wi();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsInboundDelegateMsg(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsInboundDelegateMsg(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    inboundType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.InboundDelegateMsgType.NONE;
    }
    inbound(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startInboundDelegateMsg(t) {
      t.startObject(2);
    }
    static addInboundType(t, e) {
      t.addFieldInt8(0, e, c.InboundDelegateMsgType.NONE);
    }
    static addInbound(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endInboundDelegateMsg(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createInboundDelegateMsg(t, e, s) {
      return u.startInboundDelegateMsg(t), u.addInboundType(t, e), u.addInbound(t, s), u.endInboundDelegateMsg(t);
    }
    unpack() {
      return new o(this.inboundType(), (() => {
        const t = (0, c.unionToInboundDelegateMsgType)(this.inboundType(), this.inbound.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.inboundType = this.inboundType(), t.inbound = (() => {
        const e = (0, c.unionToInboundDelegateMsgType)(this.inboundType(), this.inbound.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  et.InboundDelegateMsg = u;
  class o {
    constructor(t = c.InboundDelegateMsgType.NONE, e = null) {
      this.inboundType = t, this.inbound = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.inbound);
      return u.createInboundDelegateMsg(t, this.inboundType, e);
    }
  }
  return et.InboundDelegateMsgT = o, et;
}
var vr;
function Xi() {
  if (vr) return Q;
  vr = 1;
  var r = Q && Q.__createBinding || (Object.create ? (function(t, e, s, a) {
    a === void 0 && (a = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, a, d);
  }) : (function(t, e, s, a) {
    a === void 0 && (a = s), t[a] = e[s];
  })), i = Q && Q.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), l = Q && Q.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var a = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (a[a.length] = d);
        return a;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var a = t(e), d = 0; d < a.length; d++) a[d] !== "default" && r(s, e, a[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(Q, "__esModule", { value: !0 }), Q.ApplicationMessagesT = Q.ApplicationMessages = void 0;
  const f = l(j), c = qn(), u = zi();
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsApplicationMessages(e, s) {
      return (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsApplicationMessages(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new c.DelegateKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
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
      const a = this.bb.__offset(this.bb_pos, 8);
      return a ? (s || new u.InboundDelegateMsg()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + a) + e * 4), this.bb) : null;
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
      for (let a = s.length - 1; a >= 0; a--)
        e.addInt8(s[a]);
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
      for (let a = s.length - 1; a >= 0; a--)
        e.addOffset(s[a]);
      return e.endVector();
    }
    static startInboundVector(e, s) {
      e.startVector(4, s, 4);
    }
    static endApplicationMessages(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), e.requiredField(s, 8), s;
    }
    static createApplicationMessages(e, s, a, d) {
      return o.startApplicationMessages(e), o.addKey(e, s), o.addParams(e, a), o.addInbound(e, d), o.endApplicationMessages(e);
    }
    unpack() {
      return new n(this.key() !== null ? this.key().unpack() : null, this.bb.createScalarList(this.params.bind(this), this.paramsLength()), this.bb.createObjList(this.inbound.bind(this), this.inboundLength()));
    }
    unpackTo(e) {
      e.key = this.key() !== null ? this.key().unpack() : null, e.params = this.bb.createScalarList(this.params.bind(this), this.paramsLength()), e.inbound = this.bb.createObjList(this.inbound.bind(this), this.inboundLength());
    }
  }
  Q.ApplicationMessages = o;
  class n {
    constructor(e = null, s = [], a = []) {
      this.key = e, this.params = s, this.inbound = a;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, a = o.createParamsVector(e, this.params), d = o.createInboundVector(e, e.createObjectOffsetList(this.inbound));
      return o.createApplicationMessages(e, s, a, d);
    }
  }
  return Q.ApplicationMessagesT = n, Q;
}
var it = {}, Rr;
function Zi() {
  if (Rr) return it;
  Rr = 1;
  var r = it && it.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = it && it.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = it && it.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(it, "__esModule", { value: !0 }), it.AuthenticateT = it.Authenticate = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsAuthenticate(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsAuthenticate(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startAuthenticate(n), c.addToken(n, t), c.endAuthenticate(n);
    }
    unpack() {
      return new u(this.token());
    }
    unpackTo(n) {
      n.token = this.token();
    }
  }
  it.Authenticate = c;
  class u {
    constructor(n = null) {
      this.token = n;
    }
    pack(n) {
      const t = this.token !== null ? n.createString(this.token) : 0;
      return c.createAuthenticate(n, t);
    }
  }
  return it.AuthenticateT = u, it;
}
var at = {}, Te = {}, ot = {}, me = {}, ct = {}, Tr;
function Yi() {
  if (Tr) return ct;
  Tr = 1;
  var r = ct && ct.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = ct && ct.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = ct && ct.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(ct, "__esModule", { value: !0 }), ct.GetT = ct.Get = void 0;
  const f = l(j), c = Qt();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsGet(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsGet(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
    static createGet(t, e, s, a, d) {
      return u.startGet(t), u.addKey(t, e), u.addFetchContract(t, s), u.addSubscribe(t, a), u.addBlockingSubscribe(t, d), u.endGet(t);
    }
    unpack() {
      return new o(this.key() !== null ? this.key().unpack() : null, this.fetchContract(), this.subscribe(), this.blockingSubscribe());
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null, t.fetchContract = this.fetchContract(), t.subscribe = this.subscribe(), t.blockingSubscribe = this.blockingSubscribe();
    }
  }
  ct.Get = u;
  class o {
    constructor(t = null, e = !1, s = !1, a = !1) {
      this.key = t, this.fetchContract = e, this.subscribe = s, this.blockingSubscribe = a;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0;
      return u.createGet(t, e, this.fetchContract, this.subscribe, this.blockingSubscribe);
    }
  }
  return ct.GetT = o, ct;
}
var ut = {}, lt = {}, ft = {}, mr;
function Ji() {
  if (mr) return ft;
  mr = 1;
  var r = ft && ft.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = ft && ft.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = ft && ft.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(ft, "__esModule", { value: !0 }), ft.RelatedContractT = ft.RelatedContract = void 0;
  const f = l(j), c = ge();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedContract(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedContract(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    instanceId(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startRelatedContract(t), u.addInstanceId(t, e), u.addState(t, s), u.endRelatedContract(t);
    }
    unpack() {
      return new o(this.instanceId() !== null ? this.instanceId().unpack() : null, this.bb.createScalarList(this.state.bind(this), this.stateLength()));
    }
    unpackTo(t) {
      t.instanceId = this.instanceId() !== null ? this.instanceId().unpack() : null, t.state = this.bb.createScalarList(this.state.bind(this), this.stateLength());
    }
  }
  ft.RelatedContract = u;
  class o {
    constructor(t = null, e = []) {
      this.instanceId = t, this.state = e;
    }
    pack(t) {
      const e = this.instanceId !== null ? this.instanceId.pack(t) : 0, s = u.createStateVector(t, this.state);
      return u.createRelatedContract(t, e, s);
    }
  }
  return ft.RelatedContractT = o, ft;
}
var jr;
function Qi() {
  if (jr) return lt;
  jr = 1;
  var r = lt && lt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = lt && lt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = lt && lt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(lt, "__esModule", { value: !0 }), lt.RelatedContractsT = lt.RelatedContracts = void 0;
  const f = l(j), c = Ji();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRelatedContracts(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRelatedContracts(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    contracts(t, e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new c.RelatedContract()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + s) + t * 4), this.bb) : null;
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
      return u.startRelatedContracts(t), u.addContracts(t, e), u.endRelatedContracts(t);
    }
    unpack() {
      return new o(this.bb.createObjList(this.contracts.bind(this), this.contractsLength()));
    }
    unpackTo(t) {
      t.contracts = this.bb.createObjList(this.contracts.bind(this), this.contractsLength());
    }
  }
  lt.RelatedContracts = u;
  class o {
    constructor(t = []) {
      this.contracts = t;
    }
    pack(t) {
      const e = u.createContractsVector(t, t.createObjectOffsetList(this.contracts));
      return u.createRelatedContracts(t, e);
    }
  }
  return lt.RelatedContractsT = o, lt;
}
var Dr;
function ta() {
  if (Dr) return ut;
  Dr = 1;
  var r = ut && ut.__createBinding || (Object.create ? (function(t, e, s, a) {
    a === void 0 && (a = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, a, d);
  }) : (function(t, e, s, a) {
    a === void 0 && (a = s), t[a] = e[s];
  })), i = ut && ut.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), l = ut && ut.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var a = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (a[a.length] = d);
        return a;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var a = t(e), d = 0; d < a.length; d++) a[d] !== "default" && r(s, e, a[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(ut, "__esModule", { value: !0 }), ut.PutT = ut.Put = void 0;
  const f = l(j), c = Qi(), u = An();
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsPut(e, s) {
      return (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsPut(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    container(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new u.ContractContainer()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
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
      return s ? (e || new c.RelatedContracts()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
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
      for (let a = s.length - 1; a >= 0; a--)
        e.addInt8(s[a]);
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
  ut.Put = o;
  class n {
    constructor(e = null, s = [], a = null, d = !1, _ = !1) {
      this.container = e, this.wrappedState = s, this.relatedContracts = a, this.subscribe = d, this.blockingSubscribe = _;
    }
    pack(e) {
      const s = this.container !== null ? this.container.pack(e) : 0, a = o.createWrappedStateVector(e, this.wrappedState), d = this.relatedContracts !== null ? this.relatedContracts.pack(e) : 0;
      return o.startPut(e), o.addContainer(e, s), o.addWrappedState(e, a), o.addRelatedContracts(e, d), o.addSubscribe(e, this.subscribe), o.addBlockingSubscribe(e, this.blockingSubscribe), o.endPut(e);
    }
  }
  return ut.PutT = n, ut;
}
var dt = {}, Sr;
function ea() {
  if (Sr) return dt;
  Sr = 1;
  var r = dt && dt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = dt && dt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = dt && dt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(dt, "__esModule", { value: !0 }), dt.SubscribeT = dt.Subscribe = void 0;
  const f = l(j), c = Qt();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsSubscribe(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsSubscribe(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startSubscribe(t), u.addKey(t, e), u.addSummary(t, s), u.endSubscribe(t);
    }
    unpack() {
      return new o(this.key() !== null ? this.key().unpack() : null, this.bb.createScalarList(this.summary.bind(this), this.summaryLength()));
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null, t.summary = this.bb.createScalarList(this.summary.bind(this), this.summaryLength());
    }
  }
  dt.Subscribe = u;
  class o {
    constructor(t = null, e = []) {
      this.key = t, this.summary = e;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0, s = u.createSummaryVector(t, this.summary);
      return u.createSubscribe(t, e, s);
    }
  }
  return dt.SubscribeT = o, dt;
}
var ht = {}, _t = {}, je = {}, Pr;
function Sn() {
  if (Pr) return je;
  Pr = 1, Object.defineProperty(je, "__esModule", { value: !0 }), je.UpdateDataType = void 0, je.unionToUpdateDataType = n, je.unionListToUpdateDataType = t;
  const r = ys(), i = Os(), l = ws(), f = vs(), c = Rs(), u = Ts();
  var o;
  (function(e) {
    e[e.NONE = 0] = "NONE", e[e.StateUpdate = 1] = "StateUpdate", e[e.DeltaUpdate = 2] = "DeltaUpdate", e[e.StateAndDeltaUpdate = 3] = "StateAndDeltaUpdate", e[e.RelatedStateUpdate = 4] = "RelatedStateUpdate", e[e.RelatedDeltaUpdate = 5] = "RelatedDeltaUpdate", e[e.RelatedStateAndDeltaUpdate = 6] = "RelatedStateAndDeltaUpdate";
  })(o || (je.UpdateDataType = o = {}));
  function n(e, s) {
    switch (o[e]) {
      case "NONE":
        return null;
      case "StateUpdate":
        return s(new u.StateUpdate());
      case "DeltaUpdate":
        return s(new r.DeltaUpdate());
      case "StateAndDeltaUpdate":
        return s(new c.StateAndDeltaUpdate());
      case "RelatedStateUpdate":
        return s(new f.RelatedStateUpdate());
      case "RelatedDeltaUpdate":
        return s(new i.RelatedDeltaUpdate());
      case "RelatedStateAndDeltaUpdate":
        return s(new l.RelatedStateAndDeltaUpdate());
      default:
        return null;
    }
  }
  function t(e, s, a) {
    switch (o[e]) {
      case "NONE":
        return null;
      case "StateUpdate":
        return s(a, new u.StateUpdate());
      case "DeltaUpdate":
        return s(a, new r.DeltaUpdate());
      case "StateAndDeltaUpdate":
        return s(a, new c.StateAndDeltaUpdate());
      case "RelatedStateUpdate":
        return s(a, new f.RelatedStateUpdate());
      case "RelatedDeltaUpdate":
        return s(a, new i.RelatedDeltaUpdate());
      case "RelatedStateAndDeltaUpdate":
        return s(a, new l.RelatedStateAndDeltaUpdate());
      default:
        return null;
    }
  }
  return je;
}
var Ir;
function Mn() {
  if (Ir) return _t;
  Ir = 1;
  var r = _t && _t.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = _t && _t.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = _t && _t.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(_t, "__esModule", { value: !0 }), _t.UpdateDataT = _t.UpdateData = void 0;
  const f = l(j), c = Sn();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUpdateData(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUpdateData(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    updateDataType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.UpdateDataType.NONE;
    }
    updateData(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startUpdateData(t) {
      t.startObject(2);
    }
    static addUpdateDataType(t, e) {
      t.addFieldInt8(0, e, c.UpdateDataType.NONE);
    }
    static addUpdateData(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endUpdateData(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createUpdateData(t, e, s) {
      return u.startUpdateData(t), u.addUpdateDataType(t, e), u.addUpdateData(t, s), u.endUpdateData(t);
    }
    unpack() {
      return new o(this.updateDataType(), (() => {
        const t = (0, c.unionToUpdateDataType)(this.updateDataType(), this.updateData.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.updateDataType = this.updateDataType(), t.updateData = (() => {
        const e = (0, c.unionToUpdateDataType)(this.updateDataType(), this.updateData.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  _t.UpdateData = u;
  class o {
    constructor(t = c.UpdateDataType.NONE, e = null) {
      this.updateDataType = t, this.updateData = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.updateData);
      return u.createUpdateData(t, this.updateDataType, e);
    }
  }
  return _t.UpdateDataT = o, _t;
}
var Cr;
function na() {
  if (Cr) return ht;
  Cr = 1;
  var r = ht && ht.__createBinding || (Object.create ? (function(t, e, s, a) {
    a === void 0 && (a = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, a, d);
  }) : (function(t, e, s, a) {
    a === void 0 && (a = s), t[a] = e[s];
  })), i = ht && ht.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), l = ht && ht.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var a = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (a[a.length] = d);
        return a;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var a = t(e), d = 0; d < a.length; d++) a[d] !== "default" && r(s, e, a[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(ht, "__esModule", { value: !0 }), ht.UpdateT = ht.Update = void 0;
  const f = l(j), c = Qt(), u = Mn();
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsUpdate(e, s) {
      return (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsUpdate(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    data(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? (e || new u.UpdateData()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
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
  ht.Update = o;
  class n {
    constructor(e = null, s = null) {
      this.key = e, this.data = s;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, a = this.data !== null ? this.data.pack(e) : 0;
      return o.startUpdate(e), o.addKey(e, s), o.addData(e, a), o.endUpdate(e);
    }
  }
  return ht.UpdateT = n, ht;
}
var Ur;
function sa() {
  if (Ur) return me;
  Ur = 1, Object.defineProperty(me, "__esModule", { value: !0 }), me.ContractRequestType = void 0, me.unionToContractRequestType = u, me.unionListToContractRequestType = o;
  const r = Yi(), i = ta(), l = ea(), f = na();
  var c;
  (function(n) {
    n[n.NONE = 0] = "NONE", n[n.Put = 1] = "Put", n[n.Update = 2] = "Update", n[n.Get = 3] = "Get", n[n.Subscribe = 4] = "Subscribe";
  })(c || (me.ContractRequestType = c = {}));
  function u(n, t) {
    switch (c[n]) {
      case "NONE":
        return null;
      case "Put":
        return t(new i.Put());
      case "Update":
        return t(new f.Update());
      case "Get":
        return t(new r.Get());
      case "Subscribe":
        return t(new l.Subscribe());
      default:
        return null;
    }
  }
  function o(n, t, e) {
    switch (c[n]) {
      case "NONE":
        return null;
      case "Put":
        return t(e, new i.Put());
      case "Update":
        return t(e, new f.Update());
      case "Get":
        return t(e, new r.Get());
      case "Subscribe":
        return t(e, new l.Subscribe());
      default:
        return null;
    }
  }
  return me;
}
var Ar;
function ra() {
  if (Ar) return ot;
  Ar = 1;
  var r = ot && ot.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = ot && ot.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = ot && ot.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(ot, "__esModule", { value: !0 }), ot.ContractRequestT = ot.ContractRequest = void 0;
  const f = l(j), c = sa();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsContractRequest(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsContractRequest(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    contractRequestType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.ContractRequestType.NONE;
    }
    contractRequest(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startContractRequest(t) {
      t.startObject(2);
    }
    static addContractRequestType(t, e) {
      t.addFieldInt8(0, e, c.ContractRequestType.NONE);
    }
    static addContractRequest(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endContractRequest(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createContractRequest(t, e, s) {
      return u.startContractRequest(t), u.addContractRequestType(t, e), u.addContractRequest(t, s), u.endContractRequest(t);
    }
    unpack() {
      return new o(this.contractRequestType(), (() => {
        const t = (0, c.unionToContractRequestType)(this.contractRequestType(), this.contractRequest.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.contractRequestType = this.contractRequestType(), t.contractRequest = (() => {
        const e = (0, c.unionToContractRequestType)(this.contractRequestType(), this.contractRequest.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  ot.ContractRequest = u;
  class o {
    constructor(t = c.ContractRequestType.NONE, e = null) {
      this.contractRequestType = t, this.contractRequest = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.contractRequest);
      return u.createContractRequest(t, this.contractRequestType, e);
    }
  }
  return ot.ContractRequestT = o, ot;
}
var bt = {}, De = {}, pt = {}, gt = {}, Se = {}, yt = {}, Ot = {}, qr;
function ia() {
  if (qr) return Ot;
  qr = 1;
  var r = Ot && Ot.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Ot && Ot.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Ot && Ot.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Ot, "__esModule", { value: !0 }), Ot.DelegateCodeT = Ot.DelegateCode = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDelegateCode(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDelegateCode(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startDelegateCode(n), c.addData(n, t), c.addCodeHash(n, e), c.endDelegateCode(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.data.bind(this), this.dataLength()), this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength()), n.codeHash = this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength());
    }
  }
  Ot.DelegateCode = c;
  class u {
    constructor(n = [], t = []) {
      this.data = n, this.codeHash = t;
    }
    pack(n) {
      const t = c.createDataVector(n, this.data), e = c.createCodeHashVector(n, this.codeHash);
      return c.createDelegateCode(n, t, e);
    }
  }
  return Ot.DelegateCodeT = u, Ot;
}
var Mr;
function aa() {
  if (Mr) return yt;
  Mr = 1;
  var r = yt && yt.__createBinding || (Object.create ? (function(t, e, s, a) {
    a === void 0 && (a = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, a, d);
  }) : (function(t, e, s, a) {
    a === void 0 && (a = s), t[a] = e[s];
  })), i = yt && yt.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), l = yt && yt.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var a = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (a[a.length] = d);
        return a;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var a = t(e), d = 0; d < a.length; d++) a[d] !== "default" && r(s, e, a[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(yt, "__esModule", { value: !0 }), yt.WasmDelegateV1T = yt.WasmDelegateV1 = void 0;
  const f = l(j), c = ia(), u = qn();
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsWasmDelegateV1(e, s) {
      return (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsWasmDelegateV1(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
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
      return s ? (e || new c.DelegateCode()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 8);
      return s ? (e || new u.DelegateKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    static startWasmDelegateV1(e) {
      e.startObject(3);
    }
    static addParameters(e, s) {
      e.addFieldOffset(0, s, 0);
    }
    static createParametersVector(e, s) {
      e.startVector(1, s.length, 1);
      for (let a = s.length - 1; a >= 0; a--)
        e.addInt8(s[a]);
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
  yt.WasmDelegateV1 = o;
  class n {
    constructor(e = [], s = null, a = null) {
      this.parameters = e, this.data = s, this.key = a;
    }
    pack(e) {
      const s = o.createParametersVector(e, this.parameters), a = this.data !== null ? this.data.pack(e) : 0, d = this.key !== null ? this.key.pack(e) : 0;
      return o.startWasmDelegateV1(e), o.addParameters(e, s), o.addData(e, a), o.addKey(e, d), o.endWasmDelegateV1(e);
    }
  }
  return yt.WasmDelegateV1T = n, yt;
}
var Er;
function oa() {
  if (Er) return Se;
  Er = 1, Object.defineProperty(Se, "__esModule", { value: !0 }), Se.DelegateType = void 0, Se.unionToDelegateType = l, Se.unionListToDelegateType = f;
  const r = aa();
  var i;
  (function(c) {
    c[c.NONE = 0] = "NONE", c[c.WasmDelegateV1 = 1] = "WasmDelegateV1";
  })(i || (Se.DelegateType = i = {}));
  function l(c, u) {
    switch (i[c]) {
      case "NONE":
        return null;
      case "WasmDelegateV1":
        return u(new r.WasmDelegateV1());
      default:
        return null;
    }
  }
  function f(c, u, o) {
    switch (i[c]) {
      case "NONE":
        return null;
      case "WasmDelegateV1":
        return u(o, new r.WasmDelegateV1());
      default:
        return null;
    }
  }
  return Se;
}
var Nr;
function ca() {
  if (Nr) return gt;
  Nr = 1;
  var r = gt && gt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = gt && gt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = gt && gt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(gt, "__esModule", { value: !0 }), gt.DelegateContainerT = gt.DelegateContainer = void 0;
  const f = l(j), c = oa();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsDelegateContainer(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsDelegateContainer(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    delegateType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.DelegateType.NONE;
    }
    delegate(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startDelegateContainer(t) {
      t.startObject(2);
    }
    static addDelegateType(t, e) {
      t.addFieldInt8(0, e, c.DelegateType.NONE);
    }
    static addDelegate(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endDelegateContainer(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createDelegateContainer(t, e, s) {
      return u.startDelegateContainer(t), u.addDelegateType(t, e), u.addDelegate(t, s), u.endDelegateContainer(t);
    }
    unpack() {
      return new o(this.delegateType(), (() => {
        const t = (0, c.unionToDelegateType)(this.delegateType(), this.delegate.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.delegateType = this.delegateType(), t.delegate = (() => {
        const e = (0, c.unionToDelegateType)(this.delegateType(), this.delegate.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  gt.DelegateContainer = u;
  class o {
    constructor(t = c.DelegateType.NONE, e = null) {
      this.delegateType = t, this.delegate = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.delegate);
      return u.createDelegateContainer(t, this.delegateType, e);
    }
  }
  return gt.DelegateContainerT = o, gt;
}
var Lr;
function ua() {
  if (Lr) return pt;
  Lr = 1;
  var r = pt && pt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = pt && pt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = pt && pt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(pt, "__esModule", { value: !0 }), pt.RegisterDelegateT = pt.RegisterDelegate = void 0;
  const f = l(j), c = ca();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRegisterDelegate(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRegisterDelegate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    delegate(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.DelegateContainer()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
    static createRegisterDelegate(t, e, s, a) {
      return u.startRegisterDelegate(t), u.addDelegate(t, e), u.addCipher(t, s), u.addNonce(t, a), u.endRegisterDelegate(t);
    }
    unpack() {
      return new o(this.delegate() !== null ? this.delegate().unpack() : null, this.bb.createScalarList(this.cipher.bind(this), this.cipherLength()), this.bb.createScalarList(this.nonce.bind(this), this.nonceLength()));
    }
    unpackTo(t) {
      t.delegate = this.delegate() !== null ? this.delegate().unpack() : null, t.cipher = this.bb.createScalarList(this.cipher.bind(this), this.cipherLength()), t.nonce = this.bb.createScalarList(this.nonce.bind(this), this.nonceLength());
    }
  }
  pt.RegisterDelegate = u;
  class o {
    constructor(t = null, e = [], s = []) {
      this.delegate = t, this.cipher = e, this.nonce = s;
    }
    pack(t) {
      const e = this.delegate !== null ? this.delegate.pack(t) : 0, s = u.createCipherVector(t, this.cipher), a = u.createNonceVector(t, this.nonce);
      return u.createRegisterDelegate(t, e, s, a);
    }
  }
  return pt.RegisterDelegateT = o, pt;
}
var wt = {}, Vr;
function la() {
  if (Vr) return wt;
  Vr = 1;
  var r = wt && wt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = wt && wt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = wt && wt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(wt, "__esModule", { value: !0 }), wt.UnregisterDelegateT = wt.UnregisterDelegate = void 0;
  const f = l(j), c = qn();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUnregisterDelegate(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUnregisterDelegate(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.DelegateKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startUnregisterDelegate(t), u.addKey(t, e), u.endUnregisterDelegate(t);
    }
    unpack() {
      return new o(this.key() !== null ? this.key().unpack() : null);
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null;
    }
  }
  wt.UnregisterDelegate = u;
  class o {
    constructor(t = null) {
      this.key = t;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0;
      return u.createUnregisterDelegate(t, e);
    }
  }
  return wt.UnregisterDelegateT = o, wt;
}
var Fr;
function fa() {
  if (Fr) return De;
  Fr = 1, Object.defineProperty(De, "__esModule", { value: !0 }), De.DelegateRequestType = void 0, De.unionToDelegateRequestType = c, De.unionListToDelegateRequestType = u;
  const r = Xi(), i = ua(), l = la();
  var f;
  (function(o) {
    o[o.NONE = 0] = "NONE", o[o.ApplicationMessages = 1] = "ApplicationMessages", o[o.RegisterDelegate = 2] = "RegisterDelegate", o[o.UnregisterDelegate = 3] = "UnregisterDelegate";
  })(f || (De.DelegateRequestType = f = {}));
  function c(o, n) {
    switch (f[o]) {
      case "NONE":
        return null;
      case "ApplicationMessages":
        return n(new r.ApplicationMessages());
      case "RegisterDelegate":
        return n(new i.RegisterDelegate());
      case "UnregisterDelegate":
        return n(new l.UnregisterDelegate());
      default:
        return null;
    }
  }
  function u(o, n, t) {
    switch (f[o]) {
      case "NONE":
        return null;
      case "ApplicationMessages":
        return n(t, new r.ApplicationMessages());
      case "RegisterDelegate":
        return n(t, new i.RegisterDelegate());
      case "UnregisterDelegate":
        return n(t, new l.UnregisterDelegate());
      default:
        return null;
    }
  }
  return De;
}
var Br;
function da() {
  if (Br) return bt;
  Br = 1;
  var r = bt && bt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = bt && bt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = bt && bt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(bt, "__esModule", { value: !0 }), bt.DelegateRequestT = bt.DelegateRequest = void 0;
  const f = l(j), c = fa();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsDelegateRequest(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsDelegateRequest(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    delegateRequestType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.DelegateRequestType.NONE;
    }
    delegateRequest(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startDelegateRequest(t) {
      t.startObject(2);
    }
    static addDelegateRequestType(t, e) {
      t.addFieldInt8(0, e, c.DelegateRequestType.NONE);
    }
    static addDelegateRequest(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endDelegateRequest(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createDelegateRequest(t, e, s) {
      return u.startDelegateRequest(t), u.addDelegateRequestType(t, e), u.addDelegateRequest(t, s), u.endDelegateRequest(t);
    }
    unpack() {
      return new o(this.delegateRequestType(), (() => {
        const t = (0, c.unionToDelegateRequestType)(this.delegateRequestType(), this.delegateRequest.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.delegateRequestType = this.delegateRequestType(), t.delegateRequest = (() => {
        const e = (0, c.unionToDelegateRequestType)(this.delegateRequestType(), this.delegateRequest.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  bt.DelegateRequest = u;
  class o {
    constructor(t = c.DelegateRequestType.NONE, e = null) {
      this.delegateRequestType = t, this.delegateRequest = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.delegateRequest);
      return u.createDelegateRequest(t, this.delegateRequestType, e);
    }
  }
  return bt.DelegateRequestT = o, bt;
}
var vt = {}, Hr;
function ha() {
  if (Hr) return vt;
  Hr = 1;
  var r = vt && vt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = vt && vt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = vt && vt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(vt, "__esModule", { value: !0 }), vt.DisconnectT = vt.Disconnect = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDisconnect(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDisconnect(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startDisconnect(n), c.addCause(n, t), c.endDisconnect(n);
    }
    unpack() {
      return new u(this.cause());
    }
    unpackTo(n) {
      n.cause = this.cause();
    }
  }
  vt.Disconnect = c;
  class u {
    constructor(n = null) {
      this.cause = n;
    }
    pack(n) {
      const t = this.cause !== null ? n.createString(this.cause) : 0;
      return c.createDisconnect(n, t);
    }
  }
  return vt.DisconnectT = u, vt;
}
var Rt = {}, Kr;
function js() {
  if (Kr) return Rt;
  Kr = 1;
  var r = Rt && Rt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Rt && Rt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Rt && Rt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Rt, "__esModule", { value: !0 }), Rt.StreamChunkT = Rt.StreamChunk = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsStreamChunk(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsStreamChunk(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
    static createStreamChunk(n, t, e, s, a) {
      return c.startStreamChunk(n), c.addStreamId(n, t), c.addIndex(n, e), c.addTotal(n, s), c.addData(n, a), c.endStreamChunk(n);
    }
    unpack() {
      return new u(this.streamId(), this.index(), this.total(), this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.streamId = this.streamId(), n.index = this.index(), n.total = this.total(), n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  Rt.StreamChunk = c;
  class u {
    constructor(n = 0, t = 0, e = 0, s = []) {
      this.streamId = n, this.index = t, this.total = e, this.data = s;
    }
    pack(n) {
      const t = c.createDataVector(n, this.data);
      return c.createStreamChunk(n, this.streamId, this.index, this.total, t);
    }
  }
  return Rt.StreamChunkT = u, Rt;
}
var kr;
function _a() {
  if (kr) return Te;
  kr = 1, Object.defineProperty(Te, "__esModule", { value: !0 }), Te.ClientRequestType = void 0, Te.unionToClientRequestType = o, Te.unionListToClientRequestType = n;
  const r = Zi(), i = ra(), l = da(), f = ha(), c = js();
  var u;
  (function(t) {
    t[t.NONE = 0] = "NONE", t[t.ContractRequest = 1] = "ContractRequest", t[t.DelegateRequest = 2] = "DelegateRequest", t[t.Disconnect = 3] = "Disconnect", t[t.Authenticate = 4] = "Authenticate", t[t.StreamChunk = 5] = "StreamChunk";
  })(u || (Te.ClientRequestType = u = {}));
  function o(t, e) {
    switch (u[t]) {
      case "NONE":
        return null;
      case "ContractRequest":
        return e(new i.ContractRequest());
      case "DelegateRequest":
        return e(new l.DelegateRequest());
      case "Disconnect":
        return e(new f.Disconnect());
      case "Authenticate":
        return e(new r.Authenticate());
      case "StreamChunk":
        return e(new c.StreamChunk());
      default:
        return null;
    }
  }
  function n(t, e, s) {
    switch (u[t]) {
      case "NONE":
        return null;
      case "ContractRequest":
        return e(s, new i.ContractRequest());
      case "DelegateRequest":
        return e(s, new l.DelegateRequest());
      case "Disconnect":
        return e(s, new f.Disconnect());
      case "Authenticate":
        return e(s, new r.Authenticate());
      case "StreamChunk":
        return e(s, new c.StreamChunk());
      default:
        return null;
    }
  }
  return Te;
}
var Gr;
function vc() {
  if (Gr) return at;
  Gr = 1;
  var r = at && at.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = at && at.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = at && at.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(at, "__esModule", { value: !0 }), at.ClientRequestT = at.ClientRequest = void 0;
  const f = l(j), c = _a();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsClientRequest(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsClientRequest(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    clientRequestType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.ClientRequestType.NONE;
    }
    clientRequest(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startClientRequest(t) {
      t.startObject(2);
    }
    static addClientRequestType(t, e) {
      t.addFieldInt8(0, e, c.ClientRequestType.NONE);
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
      return u.startClientRequest(t), u.addClientRequestType(t, e), u.addClientRequest(t, s), u.endClientRequest(t);
    }
    unpack() {
      return new o(this.clientRequestType(), (() => {
        const t = (0, c.unionToClientRequestType)(this.clientRequestType(), this.clientRequest.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.clientRequestType = this.clientRequestType(), t.clientRequest = (() => {
        const e = (0, c.unionToClientRequestType)(this.clientRequestType(), this.clientRequest.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  at.ClientRequest = u;
  class o {
    constructor(t = c.ClientRequestType.NONE, e = null) {
      this.clientRequestType = t, this.clientRequest = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.clientRequest);
      return u.createClientRequest(t, this.clientRequestType, e);
    }
  }
  return at.ClientRequestT = o, at;
}
var Tt = {}, xr;
function Rc() {
  if (xr) return Tt;
  xr = 1;
  var r = Tt && Tt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Tt && Tt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Tt && Tt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.DelegateContextT = Tt.DelegateContext = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDelegateContext(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDelegateContext(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startDelegateContext(n), c.addData(n, t), c.endDelegateContext(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  Tt.DelegateContext = c;
  class u {
    constructor(n = []) {
      this.data = n;
    }
    pack(n) {
      const t = c.createDataVector(n, this.data);
      return c.createDelegateContext(n, t);
    }
  }
  return Tt.DelegateContextT = u, Tt;
}
var $r;
function ba() {
  return $r || ($r = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.WasmDelegateV1 = r.UserInputResponseT = r.UserInputResponse = r.UpdateT = r.Update = r.UnregisterDelegateT = r.UnregisterDelegate = r.SubscribeT = r.Subscribe = r.StreamChunkT = r.StreamChunk = r.RelatedContractsT = r.RelatedContracts = r.RelatedContractT = r.RelatedContract = r.RegisterDelegateT = r.RegisterDelegate = r.PutT = r.Put = r.InboundDelegateMsgType = r.InboundDelegateMsgT = r.InboundDelegateMsg = r.GetT = r.Get = r.DisconnectT = r.Disconnect = r.DelegateType = r.DelegateRequestType = r.DelegateRequestT = r.DelegateRequest = r.DelegateKeyT = r.DelegateKey = r.DelegateContextT = r.DelegateContext = r.DelegateContainerT = r.DelegateContainer = r.DelegateCodeT = r.DelegateCode = r.ContractRequestType = r.ContractRequestT = r.ContractRequest = r.ClientResponseT = r.ClientResponse = r.ClientRequestType = r.ClientRequestT = r.ClientRequest = r.AuthenticateT = r.Authenticate = r.ApplicationMessagesT = r.ApplicationMessages = void 0, r.WasmDelegateV1T = void 0;
    var i = Xi();
    Object.defineProperty(r, "ApplicationMessages", { enumerable: !0, get: function() {
      return i.ApplicationMessages;
    } }), Object.defineProperty(r, "ApplicationMessagesT", { enumerable: !0, get: function() {
      return i.ApplicationMessagesT;
    } });
    var l = Zi();
    Object.defineProperty(r, "Authenticate", { enumerable: !0, get: function() {
      return l.Authenticate;
    } }), Object.defineProperty(r, "AuthenticateT", { enumerable: !0, get: function() {
      return l.AuthenticateT;
    } });
    var f = vc();
    Object.defineProperty(r, "ClientRequest", { enumerable: !0, get: function() {
      return f.ClientRequest;
    } }), Object.defineProperty(r, "ClientRequestT", { enumerable: !0, get: function() {
      return f.ClientRequestT;
    } });
    var c = _a();
    Object.defineProperty(r, "ClientRequestType", { enumerable: !0, get: function() {
      return c.ClientRequestType;
    } });
    var u = xi();
    Object.defineProperty(r, "ClientResponse", { enumerable: !0, get: function() {
      return u.ClientResponse;
    } }), Object.defineProperty(r, "ClientResponseT", { enumerable: !0, get: function() {
      return u.ClientResponseT;
    } });
    var o = ra();
    Object.defineProperty(r, "ContractRequest", { enumerable: !0, get: function() {
      return o.ContractRequest;
    } }), Object.defineProperty(r, "ContractRequestT", { enumerable: !0, get: function() {
      return o.ContractRequestT;
    } });
    var n = sa();
    Object.defineProperty(r, "ContractRequestType", { enumerable: !0, get: function() {
      return n.ContractRequestType;
    } });
    var t = ia();
    Object.defineProperty(r, "DelegateCode", { enumerable: !0, get: function() {
      return t.DelegateCode;
    } }), Object.defineProperty(r, "DelegateCodeT", { enumerable: !0, get: function() {
      return t.DelegateCodeT;
    } });
    var e = ca();
    Object.defineProperty(r, "DelegateContainer", { enumerable: !0, get: function() {
      return e.DelegateContainer;
    } }), Object.defineProperty(r, "DelegateContainerT", { enumerable: !0, get: function() {
      return e.DelegateContainerT;
    } });
    var s = Rc();
    Object.defineProperty(r, "DelegateContext", { enumerable: !0, get: function() {
      return s.DelegateContext;
    } }), Object.defineProperty(r, "DelegateContextT", { enumerable: !0, get: function() {
      return s.DelegateContextT;
    } });
    var a = qn();
    Object.defineProperty(r, "DelegateKey", { enumerable: !0, get: function() {
      return a.DelegateKey;
    } }), Object.defineProperty(r, "DelegateKeyT", { enumerable: !0, get: function() {
      return a.DelegateKeyT;
    } });
    var d = da();
    Object.defineProperty(r, "DelegateRequest", { enumerable: !0, get: function() {
      return d.DelegateRequest;
    } }), Object.defineProperty(r, "DelegateRequestT", { enumerable: !0, get: function() {
      return d.DelegateRequestT;
    } });
    var _ = fa();
    Object.defineProperty(r, "DelegateRequestType", { enumerable: !0, get: function() {
      return _.DelegateRequestType;
    } });
    var g = oa();
    Object.defineProperty(r, "DelegateType", { enumerable: !0, get: function() {
      return g.DelegateType;
    } });
    var v = ha();
    Object.defineProperty(r, "Disconnect", { enumerable: !0, get: function() {
      return v.Disconnect;
    } }), Object.defineProperty(r, "DisconnectT", { enumerable: !0, get: function() {
      return v.DisconnectT;
    } });
    var w = Yi();
    Object.defineProperty(r, "Get", { enumerable: !0, get: function() {
      return w.Get;
    } }), Object.defineProperty(r, "GetT", { enumerable: !0, get: function() {
      return w.GetT;
    } });
    var p = zi();
    Object.defineProperty(r, "InboundDelegateMsg", { enumerable: !0, get: function() {
      return p.InboundDelegateMsg;
    } }), Object.defineProperty(r, "InboundDelegateMsgT", { enumerable: !0, get: function() {
      return p.InboundDelegateMsgT;
    } });
    var D = Wi();
    Object.defineProperty(r, "InboundDelegateMsgType", { enumerable: !0, get: function() {
      return D.InboundDelegateMsgType;
    } });
    var O = ta();
    Object.defineProperty(r, "Put", { enumerable: !0, get: function() {
      return O.Put;
    } }), Object.defineProperty(r, "PutT", { enumerable: !0, get: function() {
      return O.PutT;
    } });
    var R = ua();
    Object.defineProperty(r, "RegisterDelegate", { enumerable: !0, get: function() {
      return R.RegisterDelegate;
    } }), Object.defineProperty(r, "RegisterDelegateT", { enumerable: !0, get: function() {
      return R.RegisterDelegateT;
    } });
    var S = Ji();
    Object.defineProperty(r, "RelatedContract", { enumerable: !0, get: function() {
      return S.RelatedContract;
    } }), Object.defineProperty(r, "RelatedContractT", { enumerable: !0, get: function() {
      return S.RelatedContractT;
    } });
    var U = Qi();
    Object.defineProperty(r, "RelatedContracts", { enumerable: !0, get: function() {
      return U.RelatedContracts;
    } }), Object.defineProperty(r, "RelatedContractsT", { enumerable: !0, get: function() {
      return U.RelatedContractsT;
    } });
    var A = js();
    Object.defineProperty(r, "StreamChunk", { enumerable: !0, get: function() {
      return A.StreamChunk;
    } }), Object.defineProperty(r, "StreamChunkT", { enumerable: !0, get: function() {
      return A.StreamChunkT;
    } });
    var q = ea();
    Object.defineProperty(r, "Subscribe", { enumerable: !0, get: function() {
      return q.Subscribe;
    } }), Object.defineProperty(r, "SubscribeT", { enumerable: !0, get: function() {
      return q.SubscribeT;
    } });
    var N = la();
    Object.defineProperty(r, "UnregisterDelegate", { enumerable: !0, get: function() {
      return N.UnregisterDelegate;
    } }), Object.defineProperty(r, "UnregisterDelegateT", { enumerable: !0, get: function() {
      return N.UnregisterDelegateT;
    } });
    var Wt = na();
    Object.defineProperty(r, "Update", { enumerable: !0, get: function() {
      return Wt.Update;
    } }), Object.defineProperty(r, "UpdateT", { enumerable: !0, get: function() {
      return Wt.UpdateT;
    } });
    var te = $i();
    Object.defineProperty(r, "UserInputResponse", { enumerable: !0, get: function() {
      return te.UserInputResponse;
    } }), Object.defineProperty(r, "UserInputResponseT", { enumerable: !0, get: function() {
      return te.UserInputResponseT;
    } });
    var zt = aa();
    Object.defineProperty(r, "WasmDelegateV1", { enumerable: !0, get: function() {
      return zt.WasmDelegateV1;
    } }), Object.defineProperty(r, "WasmDelegateV1T", { enumerable: !0, get: function() {
      return zt.WasmDelegateV1T;
    } });
  })(Bn)), Bn;
}
var mt = {}, Wr;
function Ds() {
  if (Wr) return mt;
  Wr = 1;
  var r = mt && mt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = mt && mt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = mt && mt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(mt, "__esModule", { value: !0 }), mt.PutResponseT = mt.PutResponse = void 0;
  const f = l(j), c = Qt();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsPutResponse(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsPutResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startPutResponse(t), u.addKey(t, e), u.endPutResponse(t);
    }
    unpack() {
      return new o(this.key() !== null ? this.key().unpack() : null);
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null;
    }
  }
  mt.PutResponse = u;
  class o {
    constructor(t = null) {
      this.key = t;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0;
      return u.createPutResponse(t, e);
    }
  }
  return mt.PutResponseT = o, mt;
}
var jt = {}, zr;
function Ss() {
  if (zr) return jt;
  zr = 1;
  var r = jt && jt.__createBinding || (Object.create ? (function(t, e, s, a) {
    a === void 0 && (a = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, a, d);
  }) : (function(t, e, s, a) {
    a === void 0 && (a = s), t[a] = e[s];
  })), i = jt && jt.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), l = jt && jt.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var a = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (a[a.length] = d);
        return a;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var a = t(e), d = 0; d < a.length; d++) a[d] !== "default" && r(s, e, a[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(jt, "__esModule", { value: !0 }), jt.GetResponseT = jt.GetResponse = void 0;
  const f = l(j), c = An(), u = Qt();
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsGetResponse(e, s) {
      return (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsGetResponse(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new u.ContractKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    contract(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? (e || new c.ContractContainer()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
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
      for (let a = s.length - 1; a >= 0; a--)
        e.addInt8(s[a]);
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
  jt.GetResponse = o;
  class n {
    constructor(e = null, s = null, a = []) {
      this.key = e, this.contract = s, this.state = a;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, a = this.contract !== null ? this.contract.pack(e) : 0, d = o.createStateVector(e, this.state);
      return o.startGetResponse(e), o.addKey(e, s), o.addContract(e, a), o.addState(e, d), o.endGetResponse(e);
    }
  }
  return jt.GetResponseT = n, jt;
}
var Dt = {}, Xr;
function Ps() {
  if (Xr) return Dt;
  Xr = 1;
  var r = Dt && Dt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Dt && Dt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = Dt && Dt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Dt, "__esModule", { value: !0 }), Dt.UpdateResponseT = Dt.UpdateResponse = void 0;
  const f = l(j), c = Qt();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUpdateResponse(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUpdateResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startUpdateResponse(t), u.addKey(t, e), u.addSummary(t, s), u.endUpdateResponse(t);
    }
    unpack() {
      return new o(this.key() !== null ? this.key().unpack() : null, this.bb.createScalarList(this.summary.bind(this), this.summaryLength()));
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null, t.summary = this.bb.createScalarList(this.summary.bind(this), this.summaryLength());
    }
  }
  Dt.UpdateResponse = u;
  class o {
    constructor(t = null, e = []) {
      this.key = t, this.summary = e;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0, s = u.createSummaryVector(t, this.summary);
      return u.createUpdateResponse(t, e, s);
    }
  }
  return Dt.UpdateResponseT = o, Dt;
}
var St = {}, Zr;
function Is() {
  if (Zr) return St;
  Zr = 1;
  var r = St && St.__createBinding || (Object.create ? (function(t, e, s, a) {
    a === void 0 && (a = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, a, d);
  }) : (function(t, e, s, a) {
    a === void 0 && (a = s), t[a] = e[s];
  })), i = St && St.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), l = St && St.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var a = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (a[a.length] = d);
        return a;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var a = t(e), d = 0; d < a.length; d++) a[d] !== "default" && r(s, e, a[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(St, "__esModule", { value: !0 }), St.UpdateNotificationT = St.UpdateNotification = void 0;
  const f = l(j), c = Qt(), u = Mn();
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsUpdateNotification(e, s) {
      return (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsUpdateNotification(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    update(e) {
      const s = this.bb.__offset(this.bb_pos, 6);
      return s ? (e || new u.UpdateData()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
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
  St.UpdateNotification = o;
  class n {
    constructor(e = null, s = null) {
      this.key = e, this.update = s;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, a = this.update !== null ? this.update.pack(e) : 0;
      return o.startUpdateNotification(e), o.addKey(e, s), o.addUpdate(e, a), o.endUpdateNotification(e);
    }
  }
  return St.UpdateNotificationT = n, St;
}
var Pt = {}, Pe = {}, It = {}, Ie = {}, Ct = {}, Yr;
function pa() {
  if (Yr) return Ct;
  Yr = 1;
  var r = Ct && Ct.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Ct && Ct.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = Ct && Ct.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.NotFoundT = Ct.NotFound = void 0;
  const f = l(j), c = ge();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsNotFound(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsNotFound(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    instanceId(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractInstanceId()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startNotFound(t), u.addInstanceId(t, e), u.endNotFound(t);
    }
    unpack() {
      return new o(this.instanceId() !== null ? this.instanceId().unpack() : null);
    }
    unpackTo(t) {
      t.instanceId = this.instanceId() !== null ? this.instanceId().unpack() : null;
    }
  }
  Ct.NotFound = u;
  class o {
    constructor(t = null) {
      this.instanceId = t;
    }
    pack(t) {
      const e = this.instanceId !== null ? this.instanceId.pack(t) : 0;
      return u.createNotFound(t, e);
    }
  }
  return Ct.NotFoundT = o, Ct;
}
var Ut = {}, Jr;
function ga() {
  if (Jr) return Ut;
  Jr = 1;
  var r = Ut && Ut.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Ut && Ut.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = Ut && Ut.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Ut, "__esModule", { value: !0 }), Ut.SubscribeResponseT = Ut.SubscribeResponse = void 0;
  const f = l(j), c = Qt();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsSubscribeResponse(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsSubscribeResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    key(t) {
      const e = this.bb.__offset(this.bb_pos, 4);
      return e ? (t || new c.ContractKey()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
      return u.startSubscribeResponse(t), u.addKey(t, e), u.addSubscribed(t, s), u.endSubscribeResponse(t);
    }
    unpack() {
      return new o(this.key() !== null ? this.key().unpack() : null, this.subscribed());
    }
    unpackTo(t) {
      t.key = this.key() !== null ? this.key().unpack() : null, t.subscribed = this.subscribed();
    }
  }
  Ut.SubscribeResponse = u;
  class o {
    constructor(t = null, e = !1) {
      this.key = t, this.subscribed = e;
    }
    pack(t) {
      const e = this.key !== null ? this.key.pack(t) : 0;
      return u.createSubscribeResponse(t, e, this.subscribed);
    }
  }
  return Ut.SubscribeResponseT = o, Ut;
}
var Qr;
function ya() {
  if (Qr) return Ie;
  Qr = 1, Object.defineProperty(Ie, "__esModule", { value: !0 }), Ie.ContractResponseType = void 0, Ie.unionToContractResponseType = n, Ie.unionListToContractResponseType = t;
  const r = Ss(), i = pa(), l = Ds(), f = ga(), c = Is(), u = Ps();
  var o;
  (function(e) {
    e[e.NONE = 0] = "NONE", e[e.GetResponse = 1] = "GetResponse", e[e.PutResponse = 2] = "PutResponse", e[e.UpdateNotification = 3] = "UpdateNotification", e[e.UpdateResponse = 4] = "UpdateResponse", e[e.NotFound = 5] = "NotFound", e[e.SubscribeResponse = 6] = "SubscribeResponse";
  })(o || (Ie.ContractResponseType = o = {}));
  function n(e, s) {
    switch (o[e]) {
      case "NONE":
        return null;
      case "GetResponse":
        return s(new r.GetResponse());
      case "PutResponse":
        return s(new l.PutResponse());
      case "UpdateNotification":
        return s(new c.UpdateNotification());
      case "UpdateResponse":
        return s(new u.UpdateResponse());
      case "NotFound":
        return s(new i.NotFound());
      case "SubscribeResponse":
        return s(new f.SubscribeResponse());
      default:
        return null;
    }
  }
  function t(e, s, a) {
    switch (o[e]) {
      case "NONE":
        return null;
      case "GetResponse":
        return s(a, new r.GetResponse());
      case "PutResponse":
        return s(a, new l.PutResponse());
      case "UpdateNotification":
        return s(a, new c.UpdateNotification());
      case "UpdateResponse":
        return s(a, new u.UpdateResponse());
      case "NotFound":
        return s(a, new i.NotFound());
      case "SubscribeResponse":
        return s(a, new f.SubscribeResponse());
      default:
        return null;
    }
  }
  return Ie;
}
var ti;
function Oa() {
  if (ti) return It;
  ti = 1;
  var r = It && It.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = It && It.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = It && It.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(It, "__esModule", { value: !0 }), It.ContractResponseT = It.ContractResponse = void 0;
  const f = l(j), c = ya();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsContractResponse(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsContractResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    contractResponseType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.ContractResponseType.NONE;
    }
    contractResponse(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startContractResponse(t) {
      t.startObject(2);
    }
    static addContractResponseType(t, e) {
      t.addFieldInt8(0, e, c.ContractResponseType.NONE);
    }
    static addContractResponse(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endContractResponse(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createContractResponse(t, e, s) {
      return u.startContractResponse(t), u.addContractResponseType(t, e), u.addContractResponse(t, s), u.endContractResponse(t);
    }
    unpack() {
      return new o(this.contractResponseType(), (() => {
        const t = (0, c.unionToContractResponseType)(this.contractResponseType(), this.contractResponse.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.contractResponseType = this.contractResponseType(), t.contractResponse = (() => {
        const e = (0, c.unionToContractResponseType)(this.contractResponseType(), this.contractResponse.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  It.ContractResponse = u;
  class o {
    constructor(t = c.ContractResponseType.NONE, e = null) {
      this.contractResponseType = t, this.contractResponse = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.contractResponse);
      return u.createContractResponse(t, this.contractResponseType, e);
    }
  }
  return It.ContractResponseT = o, It;
}
var At = {}, qt = {}, ei;
function wa() {
  if (ei) return qt;
  ei = 1;
  var r = qt && qt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = qt && qt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = qt && qt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(qt, "__esModule", { value: !0 }), qt.DelegateKeyT = qt.DelegateKey = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsDelegateKey(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsDelegateKey(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startDelegateKey(n), c.addKey(n, t), c.addCodeHash(n, e), c.endDelegateKey(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.key.bind(this), this.keyLength()), this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength()));
    }
    unpackTo(n) {
      n.key = this.bb.createScalarList(this.key.bind(this), this.keyLength()), n.codeHash = this.bb.createScalarList(this.codeHash.bind(this), this.codeHashLength());
    }
  }
  qt.DelegateKey = c;
  class u {
    constructor(n = [], t = []) {
      this.key = n, this.codeHash = t;
    }
    pack(n) {
      const t = c.createKeyVector(n, this.key), e = c.createCodeHashVector(n, this.codeHash);
      return c.createDelegateKey(n, t, e);
    }
  }
  return qt.DelegateKeyT = u, qt;
}
var Mt = {}, Ce = {}, Et = {}, ni;
function va() {
  if (ni) return Et;
  ni = 1;
  var r = Et && Et.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Et && Et.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Et && Et.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Et, "__esModule", { value: !0 }), Et.ContextUpdatedT = Et.ContextUpdated = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsContextUpdated(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsContextUpdated(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startContextUpdated(n), c.addContext(n, t), c.endContextUpdated(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.context.bind(this), this.contextLength()));
    }
    unpackTo(n) {
      n.context = this.bb.createScalarList(this.context.bind(this), this.contextLength());
    }
  }
  Et.ContextUpdated = c;
  class u {
    constructor(n = []) {
      this.context = n;
    }
    pack(n) {
      const t = c.createContextVector(n, this.context);
      return c.createContextUpdated(n, t);
    }
  }
  return Et.ContextUpdatedT = u, Et;
}
var Nt = {}, Lt = {}, si;
function Cs() {
  if (si) return Lt;
  si = 1;
  var r = Lt && Lt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Lt && Lt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Lt && Lt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Lt, "__esModule", { value: !0 }), Lt.ClientResponseT = Lt.ClientResponse = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsClientResponse(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsClientResponse(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startClientResponse(n), c.addData(n, t), c.endClientResponse(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  Lt.ClientResponse = c;
  class u {
    constructor(n = []) {
      this.data = n;
    }
    pack(n) {
      const t = c.createDataVector(n, this.data);
      return c.createClientResponse(n, t);
    }
  }
  return Lt.ClientResponseT = u, Lt;
}
var ri;
function Ra() {
  if (ri) return Nt;
  ri = 1;
  var r = Nt && Nt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Nt && Nt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = Nt && Nt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.RequestUserInputT = Nt.RequestUserInput = void 0;
  const f = l(j), c = Cs();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsRequestUserInput(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsRequestUserInput(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
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
      return s ? (e || new c.ClientResponse()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + s) + t * 4), this.bb) : null;
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
    static createRequestUserInput(t, e, s, a) {
      return u.startRequestUserInput(t), u.addRequestId(t, e), u.addMessage(t, s), u.addResponses(t, a), u.endRequestUserInput(t);
    }
    unpack() {
      return new o(this.requestId(), this.bb.createScalarList(this.message.bind(this), this.messageLength()), this.bb.createObjList(this.responses.bind(this), this.responsesLength()));
    }
    unpackTo(t) {
      t.requestId = this.requestId(), t.message = this.bb.createScalarList(this.message.bind(this), this.messageLength()), t.responses = this.bb.createObjList(this.responses.bind(this), this.responsesLength());
    }
  }
  Nt.RequestUserInput = u;
  class o {
    constructor(t = 0, e = [], s = []) {
      this.requestId = t, this.message = e, this.responses = s;
    }
    pack(t) {
      const e = u.createMessageVector(t, this.message), s = u.createResponsesVector(t, t.createObjectOffsetList(this.responses));
      return u.createRequestUserInput(t, this.requestId, e, s);
    }
  }
  return Nt.RequestUserInputT = o, Nt;
}
var ii;
function Ta() {
  if (ii) return Ce;
  ii = 1, Object.defineProperty(Ce, "__esModule", { value: !0 }), Ce.OutboundDelegateMsgType = void 0, Ce.unionToOutboundDelegateMsgType = c, Ce.unionListToOutboundDelegateMsgType = u;
  const r = ms(), i = va(), l = Ra();
  var f;
  (function(o) {
    o[o.NONE = 0] = "NONE", o[o.common_ApplicationMessage = 1] = "common_ApplicationMessage", o[o.RequestUserInput = 2] = "RequestUserInput", o[o.ContextUpdated = 3] = "ContextUpdated";
  })(f || (Ce.OutboundDelegateMsgType = f = {}));
  function c(o, n) {
    switch (f[o]) {
      case "NONE":
        return null;
      case "common_ApplicationMessage":
        return n(new r.ApplicationMessage());
      case "RequestUserInput":
        return n(new l.RequestUserInput());
      case "ContextUpdated":
        return n(new i.ContextUpdated());
      default:
        return null;
    }
  }
  function u(o, n, t) {
    switch (f[o]) {
      case "NONE":
        return null;
      case "common_ApplicationMessage":
        return n(t, new r.ApplicationMessage());
      case "RequestUserInput":
        return n(t, new l.RequestUserInput());
      case "ContextUpdated":
        return n(t, new i.ContextUpdated());
      default:
        return null;
    }
  }
  return Ce;
}
var ai;
function ma() {
  if (ai) return Mt;
  ai = 1;
  var r = Mt && Mt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Mt && Mt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = Mt && Mt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Mt, "__esModule", { value: !0 }), Mt.OutboundDelegateMsgT = Mt.OutboundDelegateMsg = void 0;
  const f = l(j), c = Ta();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsOutboundDelegateMsg(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsOutboundDelegateMsg(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    inboundType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.OutboundDelegateMsgType.NONE;
    }
    inbound(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startOutboundDelegateMsg(t) {
      t.startObject(2);
    }
    static addInboundType(t, e) {
      t.addFieldInt8(0, e, c.OutboundDelegateMsgType.NONE);
    }
    static addInbound(t, e) {
      t.addFieldOffset(1, e, 0);
    }
    static endOutboundDelegateMsg(t) {
      const e = t.endObject();
      return t.requiredField(e, 6), e;
    }
    static createOutboundDelegateMsg(t, e, s) {
      return u.startOutboundDelegateMsg(t), u.addInboundType(t, e), u.addInbound(t, s), u.endOutboundDelegateMsg(t);
    }
    unpack() {
      return new o(this.inboundType(), (() => {
        const t = (0, c.unionToOutboundDelegateMsgType)(this.inboundType(), this.inbound.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.inboundType = this.inboundType(), t.inbound = (() => {
        const e = (0, c.unionToOutboundDelegateMsgType)(this.inboundType(), this.inbound.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  Mt.OutboundDelegateMsg = u;
  class o {
    constructor(t = c.OutboundDelegateMsgType.NONE, e = null) {
      this.inboundType = t, this.inbound = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.inbound);
      return u.createOutboundDelegateMsg(t, this.inboundType, e);
    }
  }
  return Mt.OutboundDelegateMsgT = o, Mt;
}
var oi;
function ja() {
  if (oi) return At;
  oi = 1;
  var r = At && At.__createBinding || (Object.create ? (function(t, e, s, a) {
    a === void 0 && (a = s);
    var d = Object.getOwnPropertyDescriptor(e, s);
    (!d || ("get" in d ? !e.__esModule : d.writable || d.configurable)) && (d = { enumerable: !0, get: function() {
      return e[s];
    } }), Object.defineProperty(t, a, d);
  }) : (function(t, e, s, a) {
    a === void 0 && (a = s), t[a] = e[s];
  })), i = At && At.__setModuleDefault || (Object.create ? (function(t, e) {
    Object.defineProperty(t, "default", { enumerable: !0, value: e });
  }) : function(t, e) {
    t.default = e;
  }), l = At && At.__importStar || /* @__PURE__ */ (function() {
    var t = function(e) {
      return t = Object.getOwnPropertyNames || function(s) {
        var a = [];
        for (var d in s) Object.prototype.hasOwnProperty.call(s, d) && (a[a.length] = d);
        return a;
      }, t(e);
    };
    return function(e) {
      if (e && e.__esModule) return e;
      var s = {};
      if (e != null) for (var a = t(e), d = 0; d < a.length; d++) a[d] !== "default" && r(s, e, a[d]);
      return i(s, e), s;
    };
  })();
  Object.defineProperty(At, "__esModule", { value: !0 }), At.DelegateResponseT = At.DelegateResponse = void 0;
  const f = l(j), c = wa(), u = ma();
  class o {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(e, s) {
      return this.bb_pos = e, this.bb = s, this;
    }
    static getRootAsDelegateResponse(e, s) {
      return (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    static getSizePrefixedRootAsDelegateResponse(e, s) {
      return e.setPosition(e.position() + f.SIZE_PREFIX_LENGTH), (s || new o()).__init(e.readInt32(e.position()) + e.position(), e);
    }
    key(e) {
      const s = this.bb.__offset(this.bb_pos, 4);
      return s ? (e || new c.DelegateKey()).__init(this.bb.__indirect(this.bb_pos + s), this.bb) : null;
    }
    values(e, s) {
      const a = this.bb.__offset(this.bb_pos, 6);
      return a ? (s || new u.OutboundDelegateMsg()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + a) + e * 4), this.bb) : null;
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
      for (let a = s.length - 1; a >= 0; a--)
        e.addOffset(s[a]);
      return e.endVector();
    }
    static startValuesVector(e, s) {
      e.startVector(4, s, 4);
    }
    static endDelegateResponse(e) {
      const s = e.endObject();
      return e.requiredField(s, 4), e.requiredField(s, 6), s;
    }
    static createDelegateResponse(e, s, a) {
      return o.startDelegateResponse(e), o.addKey(e, s), o.addValues(e, a), o.endDelegateResponse(e);
    }
    unpack() {
      return new n(this.key() !== null ? this.key().unpack() : null, this.bb.createObjList(this.values.bind(this), this.valuesLength()));
    }
    unpackTo(e) {
      e.key = this.key() !== null ? this.key().unpack() : null, e.values = this.bb.createObjList(this.values.bind(this), this.valuesLength());
    }
  }
  At.DelegateResponse = o;
  class n {
    constructor(e = null, s = []) {
      this.key = e, this.values = s;
    }
    pack(e) {
      const s = this.key !== null ? this.key.pack(e) : 0, a = o.createValuesVector(e, e.createObjectOffsetList(this.values));
      return o.createDelegateResponse(e, s, a);
    }
  }
  return At.DelegateResponseT = n, At;
}
var Vt = {}, ci;
function Da() {
  if (ci) return Vt;
  ci = 1;
  var r = Vt && Vt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Vt && Vt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Vt && Vt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Vt, "__esModule", { value: !0 }), Vt.ErrorT = Vt.Error = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsError(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsError(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startError(n), c.addMsg(n, t), c.endError(n);
    }
    unpack() {
      return new u(this.msg());
    }
    unpackTo(n) {
      n.msg = this.msg();
    }
  }
  Vt.Error = c;
  class u {
    constructor(n = null) {
      this.msg = n;
    }
    pack(n) {
      const t = this.msg !== null ? n.createString(this.msg) : 0;
      return c.createError(n, t);
    }
  }
  return Vt.ErrorT = u, Vt;
}
var Ft = {}, ui;
function Sa() {
  if (ui) return Ft;
  ui = 1;
  var r = Ft && Ft.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Ft && Ft.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Ft && Ft.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.GenerateRandDataT = Ft.GenerateRandData = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsGenerateRandData(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsGenerateRandData(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startGenerateRandData(n), c.addWrappedState(n, t), c.endGenerateRandData(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.wrappedState.bind(this), this.wrappedStateLength()));
    }
    unpackTo(n) {
      n.wrappedState = this.bb.createScalarList(this.wrappedState.bind(this), this.wrappedStateLength());
    }
  }
  Ft.GenerateRandData = c;
  class u {
    constructor(n = []) {
      this.wrappedState = n;
    }
    pack(n) {
      const t = c.createWrappedStateVector(n, this.wrappedState);
      return c.createGenerateRandData(n, t);
    }
  }
  return Ft.GenerateRandDataT = u, Ft;
}
var Bt = {}, li;
function Pa() {
  if (li) return Bt;
  li = 1;
  var r = Bt && Bt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Bt && Bt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Bt && Bt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Bt, "__esModule", { value: !0 }), Bt.OkT = Bt.Ok = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsOk(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsOk(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startOk(n), c.addMsg(n, t), c.endOk(n);
    }
    unpack() {
      return new u(this.msg());
    }
    unpackTo(n) {
      n.msg = this.msg();
    }
  }
  Bt.Ok = c;
  class u {
    constructor(n = null) {
      this.msg = n;
    }
    pack(n) {
      const t = this.msg !== null ? n.createString(this.msg) : 0;
      return c.createOk(n, t);
    }
  }
  return Bt.OkT = u, Bt;
}
var Ht = {}, fi;
function Ia() {
  if (fi) return Ht;
  fi = 1;
  var r = Ht && Ht.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = Ht && Ht.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = Ht && Ht.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(Ht, "__esModule", { value: !0 }), Ht.StreamChunkT = Ht.StreamChunk = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsStreamChunk(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsStreamChunk(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
    static createStreamChunk(n, t, e, s, a) {
      return c.startStreamChunk(n), c.addStreamId(n, t), c.addIndex(n, e), c.addTotal(n, s), c.addData(n, a), c.endStreamChunk(n);
    }
    unpack() {
      return new u(this.streamId(), this.index(), this.total(), this.bb.createScalarList(this.data.bind(this), this.dataLength()));
    }
    unpackTo(n) {
      n.streamId = this.streamId(), n.index = this.index(), n.total = this.total(), n.data = this.bb.createScalarList(this.data.bind(this), this.dataLength());
    }
  }
  Ht.StreamChunk = c;
  class u {
    constructor(n = 0, t = 0, e = 0, s = []) {
      this.streamId = n, this.index = t, this.total = e, this.data = s;
    }
    pack(n) {
      const t = c.createDataVector(n, this.data);
      return c.createStreamChunk(n, this.streamId, this.index, this.total, t);
    }
  }
  return Ht.StreamChunkT = u, Ht;
}
var di;
function Ca() {
  if (di) return Pe;
  di = 1, Object.defineProperty(Pe, "__esModule", { value: !0 }), Pe.HostResponseType = void 0, Pe.unionToHostResponseType = n, Pe.unionListToHostResponseType = t;
  const r = Oa(), i = ja(), l = Da(), f = Sa(), c = Pa(), u = Ia();
  var o;
  (function(e) {
    e[e.NONE = 0] = "NONE", e[e.ContractResponse = 1] = "ContractResponse", e[e.DelegateResponse = 2] = "DelegateResponse", e[e.GenerateRandData = 3] = "GenerateRandData", e[e.Ok = 4] = "Ok", e[e.Error = 5] = "Error", e[e.StreamChunk = 6] = "StreamChunk";
  })(o || (Pe.HostResponseType = o = {}));
  function n(e, s) {
    switch (o[e]) {
      case "NONE":
        return null;
      case "ContractResponse":
        return s(new r.ContractResponse());
      case "DelegateResponse":
        return s(new i.DelegateResponse());
      case "GenerateRandData":
        return s(new f.GenerateRandData());
      case "Ok":
        return s(new c.Ok());
      case "Error":
        return s(new l.Error());
      case "StreamChunk":
        return s(new u.StreamChunk());
      default:
        return null;
    }
  }
  function t(e, s, a) {
    switch (o[e]) {
      case "NONE":
        return null;
      case "ContractResponse":
        return s(a, new r.ContractResponse());
      case "DelegateResponse":
        return s(a, new i.DelegateResponse());
      case "GenerateRandData":
        return s(a, new f.GenerateRandData());
      case "Ok":
        return s(a, new c.Ok());
      case "Error":
        return s(a, new l.Error());
      case "StreamChunk":
        return s(a, new u.StreamChunk());
      default:
        return null;
    }
  }
  return Pe;
}
var hi;
function Ua() {
  if (hi) return Pt;
  hi = 1;
  var r = Pt && Pt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Pt && Pt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = Pt && Pt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Pt, "__esModule", { value: !0 }), Pt.HostResponseT = Pt.HostResponse = void 0;
  const f = l(j), c = Ca();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsHostResponse(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsHostResponse(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    responseType() {
      const t = this.bb.__offset(this.bb_pos, 4);
      return t ? this.bb.readUint8(this.bb_pos + t) : c.HostResponseType.NONE;
    }
    response(t) {
      const e = this.bb.__offset(this.bb_pos, 6);
      return e ? this.bb.__union(t, this.bb_pos + e) : null;
    }
    static startHostResponse(t) {
      t.startObject(2);
    }
    static addResponseType(t, e) {
      t.addFieldInt8(0, e, c.HostResponseType.NONE);
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
      return u.startHostResponse(t), u.addResponseType(t, e), u.addResponse(t, s), u.endHostResponse(t);
    }
    unpack() {
      return new o(this.responseType(), (() => {
        const t = (0, c.unionToHostResponseType)(this.responseType(), this.response.bind(this));
        return t === null ? null : t.unpack();
      })());
    }
    unpackTo(t) {
      t.responseType = this.responseType(), t.response = (() => {
        const e = (0, c.unionToHostResponseType)(this.responseType(), this.response.bind(this));
        return e === null ? null : e.unpack();
      })();
    }
  }
  Pt.HostResponse = u;
  class o {
    constructor(t = c.HostResponseType.NONE, e = null) {
      this.responseType = t, this.response = e;
    }
    pack(t) {
      const e = t.createObjectOffset(this.response);
      return u.createHostResponse(t, this.responseType, e);
    }
  }
  return Pt.HostResponseT = o, Pt;
}
var Hn = {}, Kt = {}, _i;
function Tc() {
  if (_i) return Kt;
  _i = 1;
  var r = Kt && Kt.__createBinding || (Object.create ? (function(n, t, e, s) {
    s === void 0 && (s = e);
    var a = Object.getOwnPropertyDescriptor(t, e);
    (!a || ("get" in a ? !t.__esModule : a.writable || a.configurable)) && (a = { enumerable: !0, get: function() {
      return t[e];
    } }), Object.defineProperty(n, s, a);
  }) : (function(n, t, e, s) {
    s === void 0 && (s = e), n[s] = t[e];
  })), i = Kt && Kt.__setModuleDefault || (Object.create ? (function(n, t) {
    Object.defineProperty(n, "default", { enumerable: !0, value: t });
  }) : function(n, t) {
    n.default = t;
  }), l = Kt && Kt.__importStar || /* @__PURE__ */ (function() {
    var n = function(t) {
      return n = Object.getOwnPropertyNames || function(e) {
        var s = [];
        for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (s[s.length] = a);
        return s;
      }, n(t);
    };
    return function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (t != null) for (var s = n(t), a = 0; a < s.length; a++) s[a] !== "default" && r(e, t, s[a]);
      return i(e, t), e;
    };
  })();
  Object.defineProperty(Kt, "__esModule", { value: !0 }), Kt.UserInputRequestT = Kt.UserInputRequest = void 0;
  const f = l(j), c = Cs();
  class u {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(t, e) {
      return this.bb_pos = t, this.bb = e, this;
    }
    static getRootAsUserInputRequest(t, e) {
      return (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
    }
    static getSizePrefixedRootAsUserInputRequest(t, e) {
      return t.setPosition(t.position() + f.SIZE_PREFIX_LENGTH), (e || new u()).__init(t.readInt32(t.position()) + t.position(), t);
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
      return s ? (e || new c.ClientResponse()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + s) + t * 4), this.bb) : null;
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
    static createUserInputRequest(t, e, s, a) {
      return u.startUserInputRequest(t), u.addRequestId(t, e), u.addMessage(t, s), u.addResponses(t, a), u.endUserInputRequest(t);
    }
    unpack() {
      return new o(this.requestId(), this.bb.createScalarList(this.message.bind(this), this.messageLength()), this.bb.createObjList(this.responses.bind(this), this.responsesLength()));
    }
    unpackTo(t) {
      t.requestId = this.requestId(), t.message = this.bb.createScalarList(this.message.bind(this), this.messageLength()), t.responses = this.bb.createObjList(this.responses.bind(this), this.responsesLength());
    }
  }
  Kt.UserInputRequest = u;
  class o {
    constructor(t = 0, e = [], s = []) {
      this.requestId = t, this.message = e, this.responses = s;
    }
    pack(t) {
      const e = u.createMessageVector(t, this.message), s = u.createResponsesVector(t, t.createObjectOffsetList(this.responses));
      return u.createUserInputRequest(t, this.requestId, e, s);
    }
  }
  return Kt.UserInputRequestT = o, Kt;
}
var bi;
function mc() {
  return bi || (bi = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.UserInputRequestT = r.UserInputRequest = r.UpdateResponseT = r.UpdateResponse = r.UpdateNotificationT = r.UpdateNotification = r.SubscribeResponseT = r.SubscribeResponse = r.StreamChunkT = r.StreamChunk = r.RequestUserInputT = r.RequestUserInput = r.PutResponseT = r.PutResponse = r.OutboundDelegateMsgType = r.OutboundDelegateMsgT = r.OutboundDelegateMsg = r.OkT = r.Ok = r.NotFoundT = r.NotFound = r.HostResponseType = r.HostResponseT = r.HostResponse = r.GetResponseT = r.GetResponse = r.GenerateRandDataT = r.GenerateRandData = r.ErrorT = r.Error = r.DelegateResponseT = r.DelegateResponse = r.DelegateKeyT = r.DelegateKey = r.ContractResponseType = r.ContractResponseT = r.ContractResponse = r.ContextUpdatedT = r.ContextUpdated = r.ClientResponseT = r.ClientResponse = void 0;
    var i = Cs();
    Object.defineProperty(r, "ClientResponse", { enumerable: !0, get: function() {
      return i.ClientResponse;
    } }), Object.defineProperty(r, "ClientResponseT", { enumerable: !0, get: function() {
      return i.ClientResponseT;
    } });
    var l = va();
    Object.defineProperty(r, "ContextUpdated", { enumerable: !0, get: function() {
      return l.ContextUpdated;
    } }), Object.defineProperty(r, "ContextUpdatedT", { enumerable: !0, get: function() {
      return l.ContextUpdatedT;
    } });
    var f = Oa();
    Object.defineProperty(r, "ContractResponse", { enumerable: !0, get: function() {
      return f.ContractResponse;
    } }), Object.defineProperty(r, "ContractResponseT", { enumerable: !0, get: function() {
      return f.ContractResponseT;
    } });
    var c = ya();
    Object.defineProperty(r, "ContractResponseType", { enumerable: !0, get: function() {
      return c.ContractResponseType;
    } });
    var u = wa();
    Object.defineProperty(r, "DelegateKey", { enumerable: !0, get: function() {
      return u.DelegateKey;
    } }), Object.defineProperty(r, "DelegateKeyT", { enumerable: !0, get: function() {
      return u.DelegateKeyT;
    } });
    var o = ja();
    Object.defineProperty(r, "DelegateResponse", { enumerable: !0, get: function() {
      return o.DelegateResponse;
    } }), Object.defineProperty(r, "DelegateResponseT", { enumerable: !0, get: function() {
      return o.DelegateResponseT;
    } });
    var n = Da();
    Object.defineProperty(r, "Error", { enumerable: !0, get: function() {
      return n.Error;
    } }), Object.defineProperty(r, "ErrorT", { enumerable: !0, get: function() {
      return n.ErrorT;
    } });
    var t = Sa();
    Object.defineProperty(r, "GenerateRandData", { enumerable: !0, get: function() {
      return t.GenerateRandData;
    } }), Object.defineProperty(r, "GenerateRandDataT", { enumerable: !0, get: function() {
      return t.GenerateRandDataT;
    } });
    var e = Ss();
    Object.defineProperty(r, "GetResponse", { enumerable: !0, get: function() {
      return e.GetResponse;
    } }), Object.defineProperty(r, "GetResponseT", { enumerable: !0, get: function() {
      return e.GetResponseT;
    } });
    var s = Ua();
    Object.defineProperty(r, "HostResponse", { enumerable: !0, get: function() {
      return s.HostResponse;
    } }), Object.defineProperty(r, "HostResponseT", { enumerable: !0, get: function() {
      return s.HostResponseT;
    } });
    var a = Ca();
    Object.defineProperty(r, "HostResponseType", { enumerable: !0, get: function() {
      return a.HostResponseType;
    } });
    var d = pa();
    Object.defineProperty(r, "NotFound", { enumerable: !0, get: function() {
      return d.NotFound;
    } }), Object.defineProperty(r, "NotFoundT", { enumerable: !0, get: function() {
      return d.NotFoundT;
    } });
    var _ = Pa();
    Object.defineProperty(r, "Ok", { enumerable: !0, get: function() {
      return _.Ok;
    } }), Object.defineProperty(r, "OkT", { enumerable: !0, get: function() {
      return _.OkT;
    } });
    var g = ma();
    Object.defineProperty(r, "OutboundDelegateMsg", { enumerable: !0, get: function() {
      return g.OutboundDelegateMsg;
    } }), Object.defineProperty(r, "OutboundDelegateMsgT", { enumerable: !0, get: function() {
      return g.OutboundDelegateMsgT;
    } });
    var v = Ta();
    Object.defineProperty(r, "OutboundDelegateMsgType", { enumerable: !0, get: function() {
      return v.OutboundDelegateMsgType;
    } });
    var w = Ds();
    Object.defineProperty(r, "PutResponse", { enumerable: !0, get: function() {
      return w.PutResponse;
    } }), Object.defineProperty(r, "PutResponseT", { enumerable: !0, get: function() {
      return w.PutResponseT;
    } });
    var p = Ra();
    Object.defineProperty(r, "RequestUserInput", { enumerable: !0, get: function() {
      return p.RequestUserInput;
    } }), Object.defineProperty(r, "RequestUserInputT", { enumerable: !0, get: function() {
      return p.RequestUserInputT;
    } });
    var D = Ia();
    Object.defineProperty(r, "StreamChunk", { enumerable: !0, get: function() {
      return D.StreamChunk;
    } }), Object.defineProperty(r, "StreamChunkT", { enumerable: !0, get: function() {
      return D.StreamChunkT;
    } });
    var O = ga();
    Object.defineProperty(r, "SubscribeResponse", { enumerable: !0, get: function() {
      return O.SubscribeResponse;
    } }), Object.defineProperty(r, "SubscribeResponseT", { enumerable: !0, get: function() {
      return O.SubscribeResponseT;
    } });
    var R = Is();
    Object.defineProperty(r, "UpdateNotification", { enumerable: !0, get: function() {
      return R.UpdateNotification;
    } }), Object.defineProperty(r, "UpdateNotificationT", { enumerable: !0, get: function() {
      return R.UpdateNotificationT;
    } });
    var S = Ps();
    Object.defineProperty(r, "UpdateResponse", { enumerable: !0, get: function() {
      return S.UpdateResponse;
    } }), Object.defineProperty(r, "UpdateResponseT", { enumerable: !0, get: function() {
      return S.UpdateResponseT;
    } });
    var U = Tc();
    Object.defineProperty(r, "UserInputRequest", { enumerable: !0, get: function() {
      return U.UserInputRequest;
    } }), Object.defineProperty(r, "UserInputRequestT", { enumerable: !0, get: function() {
      return U.UserInputRequestT;
    } });
  })(Hn)), Hn;
}
var Kn = {}, kt = {}, pi;
function jc() {
  if (pi) return kt;
  pi = 1;
  var r = kt && kt.__createBinding || (Object.create ? (function(o, n, t, e) {
    e === void 0 && (e = t);
    var s = Object.getOwnPropertyDescriptor(n, t);
    (!s || ("get" in s ? !n.__esModule : s.writable || s.configurable)) && (s = { enumerable: !0, get: function() {
      return n[t];
    } }), Object.defineProperty(o, e, s);
  }) : (function(o, n, t, e) {
    e === void 0 && (e = t), o[e] = n[t];
  })), i = kt && kt.__setModuleDefault || (Object.create ? (function(o, n) {
    Object.defineProperty(o, "default", { enumerable: !0, value: n });
  }) : function(o, n) {
    o.default = n;
  }), l = kt && kt.__importStar || /* @__PURE__ */ (function() {
    var o = function(n) {
      return o = Object.getOwnPropertyNames || function(t) {
        var e = [];
        for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (e[e.length] = s);
        return e;
      }, o(n);
    };
    return function(n) {
      if (n && n.__esModule) return n;
      var t = {};
      if (n != null) for (var e = o(n), s = 0; s < e.length; s++) e[s] !== "default" && r(t, n, e[s]);
      return i(t, n), t;
    };
  })();
  Object.defineProperty(kt, "__esModule", { value: !0 }), kt.SecretsIdT = kt.SecretsId = void 0;
  const f = l(j);
  class c {
    constructor() {
      this.bb = null, this.bb_pos = 0;
    }
    __init(n, t) {
      return this.bb_pos = n, this.bb = t, this;
    }
    static getRootAsSecretsId(n, t) {
      return (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
    }
    static getSizePrefixedRootAsSecretsId(n, t) {
      return n.setPosition(n.position() + f.SIZE_PREFIX_LENGTH), (t || new c()).__init(n.readInt32(n.position()) + n.position(), n);
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
      return c.startSecretsId(n), c.addKey(n, t), c.addHash(n, e), c.endSecretsId(n);
    }
    unpack() {
      return new u(this.bb.createScalarList(this.key.bind(this), this.keyLength()), this.bb.createScalarList(this.hash.bind(this), this.hashLength()));
    }
    unpackTo(n) {
      n.key = this.bb.createScalarList(this.key.bind(this), this.keyLength()), n.hash = this.bb.createScalarList(this.hash.bind(this), this.hashLength());
    }
  }
  kt.SecretsId = c;
  class u {
    constructor(n = [], t = []) {
      this.key = n, this.hash = t;
    }
    pack(n) {
      const t = c.createKeyVector(n, this.key), e = c.createHashVector(n, this.hash);
      return c.createSecretsId(n, t, e);
    }
  }
  return kt.SecretsIdT = u, kt;
}
var gi;
function Aa() {
  return gi || (gi = 1, (function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.WasmContractV1T = r.WasmContractV1 = r.UpdateDataType = r.UpdateDataT = r.UpdateData = r.StateUpdateT = r.StateUpdate = r.StateAndDeltaUpdateT = r.StateAndDeltaUpdate = r.SecretsIdT = r.SecretsId = r.RelatedStateUpdateT = r.RelatedStateUpdate = r.RelatedStateAndDeltaUpdateT = r.RelatedStateAndDeltaUpdate = r.RelatedDeltaUpdateT = r.RelatedDeltaUpdate = r.DeltaUpdateT = r.DeltaUpdate = r.ContractType = r.ContractKeyT = r.ContractKey = r.ContractInstanceIdT = r.ContractInstanceId = r.ContractContainerT = r.ContractContainer = r.ContractCodeT = r.ContractCode = r.ApplicationMessageT = r.ApplicationMessage = void 0;
    var i = ms();
    Object.defineProperty(r, "ApplicationMessage", { enumerable: !0, get: function() {
      return i.ApplicationMessage;
    } }), Object.defineProperty(r, "ApplicationMessageT", { enumerable: !0, get: function() {
      return i.ApplicationMessageT;
    } });
    var l = ki();
    Object.defineProperty(r, "ContractCode", { enumerable: !0, get: function() {
      return l.ContractCode;
    } }), Object.defineProperty(r, "ContractCodeT", { enumerable: !0, get: function() {
      return l.ContractCodeT;
    } });
    var f = An();
    Object.defineProperty(r, "ContractContainer", { enumerable: !0, get: function() {
      return f.ContractContainer;
    } }), Object.defineProperty(r, "ContractContainerT", { enumerable: !0, get: function() {
      return f.ContractContainerT;
    } });
    var c = ge();
    Object.defineProperty(r, "ContractInstanceId", { enumerable: !0, get: function() {
      return c.ContractInstanceId;
    } }), Object.defineProperty(r, "ContractInstanceIdT", { enumerable: !0, get: function() {
      return c.ContractInstanceIdT;
    } });
    var u = Qt();
    Object.defineProperty(r, "ContractKey", { enumerable: !0, get: function() {
      return u.ContractKey;
    } }), Object.defineProperty(r, "ContractKeyT", { enumerable: !0, get: function() {
      return u.ContractKeyT;
    } });
    var o = gs();
    Object.defineProperty(r, "ContractType", { enumerable: !0, get: function() {
      return o.ContractType;
    } });
    var n = ys();
    Object.defineProperty(r, "DeltaUpdate", { enumerable: !0, get: function() {
      return n.DeltaUpdate;
    } }), Object.defineProperty(r, "DeltaUpdateT", { enumerable: !0, get: function() {
      return n.DeltaUpdateT;
    } });
    var t = Os();
    Object.defineProperty(r, "RelatedDeltaUpdate", { enumerable: !0, get: function() {
      return t.RelatedDeltaUpdate;
    } }), Object.defineProperty(r, "RelatedDeltaUpdateT", { enumerable: !0, get: function() {
      return t.RelatedDeltaUpdateT;
    } });
    var e = ws();
    Object.defineProperty(r, "RelatedStateAndDeltaUpdate", { enumerable: !0, get: function() {
      return e.RelatedStateAndDeltaUpdate;
    } }), Object.defineProperty(r, "RelatedStateAndDeltaUpdateT", { enumerable: !0, get: function() {
      return e.RelatedStateAndDeltaUpdateT;
    } });
    var s = vs();
    Object.defineProperty(r, "RelatedStateUpdate", { enumerable: !0, get: function() {
      return s.RelatedStateUpdate;
    } }), Object.defineProperty(r, "RelatedStateUpdateT", { enumerable: !0, get: function() {
      return s.RelatedStateUpdateT;
    } });
    var a = jc();
    Object.defineProperty(r, "SecretsId", { enumerable: !0, get: function() {
      return a.SecretsId;
    } }), Object.defineProperty(r, "SecretsIdT", { enumerable: !0, get: function() {
      return a.SecretsIdT;
    } });
    var d = Rs();
    Object.defineProperty(r, "StateAndDeltaUpdate", { enumerable: !0, get: function() {
      return d.StateAndDeltaUpdate;
    } }), Object.defineProperty(r, "StateAndDeltaUpdateT", { enumerable: !0, get: function() {
      return d.StateAndDeltaUpdateT;
    } });
    var _ = Ts();
    Object.defineProperty(r, "StateUpdate", { enumerable: !0, get: function() {
      return _.StateUpdate;
    } }), Object.defineProperty(r, "StateUpdateT", { enumerable: !0, get: function() {
      return _.StateUpdateT;
    } });
    var g = Mn();
    Object.defineProperty(r, "UpdateData", { enumerable: !0, get: function() {
      return g.UpdateData;
    } }), Object.defineProperty(r, "UpdateDataT", { enumerable: !0, get: function() {
      return g.UpdateDataT;
    } });
    var v = Sn();
    Object.defineProperty(r, "UpdateDataType", { enumerable: !0, get: function() {
      return v.UpdateDataType;
    } });
    var w = Gi();
    Object.defineProperty(r, "WasmContractV1", { enumerable: !0, get: function() {
      return w.WasmContractV1;
    } }), Object.defineProperty(r, "WasmContractV1T", { enumerable: !0, get: function() {
      return w.WasmContractV1T;
    } });
  })(Kn)), Kn;
}
var kn, yi;
function Dc() {
  return yi || (yi = 1, kn = function() {
    throw new Error(
      "ws does not work in the browser. Browser clients must use the native WebSocket object"
    );
  }), kn;
}
var Oi;
function Sc() {
  return Oi || (Oi = 1, (function(r) {
    var i = H && H.__createBinding || (Object.create ? (function(P, h, b, y) {
      y === void 0 && (y = b);
      var m = Object.getOwnPropertyDescriptor(h, b);
      (!m || ("get" in m ? !h.__esModule : m.writable || m.configurable)) && (m = { enumerable: !0, get: function() {
        return h[b];
      } }), Object.defineProperty(P, y, m);
    }) : (function(P, h, b, y) {
      y === void 0 && (y = b), P[y] = h[b];
    })), l = H && H.__setModuleDefault || (Object.create ? (function(P, h) {
      Object.defineProperty(P, "default", { enumerable: !0, value: h });
    }) : function(P, h) {
      P.default = h;
    }), f = H && H.__importStar || /* @__PURE__ */ (function() {
      var P = function(h) {
        return P = Object.getOwnPropertyNames || function(b) {
          var y = [];
          for (var m in b) Object.prototype.hasOwnProperty.call(b, m) && (y[y.length] = m);
          return y;
        }, P(h);
      };
      return function(h) {
        if (h && h.__esModule) return h;
        var b = {};
        if (h != null) for (var y = P(h), m = 0; m < y.length; m++) y[m] !== "default" && i(b, h, y[m]);
        return l(b, h), b;
      };
    })(), c = H && H.__awaiter || function(P, h, b, y) {
      function m(I) {
        return I instanceof b ? I : new b(function(C) {
          C(I);
        });
      }
      return new (b || (b = Promise))(function(I, C) {
        function M(B) {
          try {
            Yt(y.next(B));
          } catch (L) {
            C(L);
          }
        }
        function Le(B) {
          try {
            Yt(y.throw(B));
          } catch (L) {
            C(L);
          }
        }
        function Yt(B) {
          B.done ? I(B.value) : m(B.value).then(M, Le);
        }
        Yt((y = y.apply(P, h || [])).next());
      });
    }, u = H && H.__importDefault || function(P) {
      return P && P.__esModule ? P : { default: P };
    };
    Object.defineProperty(r, "__esModule", { value: !0 }), r.FreenetWsApi = r.DelegateResponse = r.OutboundDelegateMsg = r.UpdateNotification = r.UpdateResponse = r.GetResponse = r.PutResponse = r.DelegateRequest = r.InboundDelegateMsg = r.DisconnectRequest = r.SubscribeRequest = r.GetRequest = r.UpdateRequest = r.PutRequest = r.DelegateContainer = r.WasmDelegateV1 = r.ContractContainer = r.WasmContractV1 = r.ContractKey = r.RelatedStateAndDeltaUpdate = r.RelatedDeltaUpdate = r.RelatedStateUpdate = r.StateAndDeltaUpdate = r.DeltaUpdate = r.StateUpdate = r.UpdateData = r.ContractType = r.UpdateDataType = void 0;
    const o = f(j), n = u(wc()), t = Ki(), e = An(), s = ge(), a = ys(), d = Os(), _ = ws(), g = vs(), v = Rs(), w = Ts(), p = ba(), D = js(), O = Mn(), R = Sn();
    var S = Sn();
    Object.defineProperty(r, "UpdateDataType", { enumerable: !0, get: function() {
      return S.UpdateDataType;
    } });
    var U = gs();
    Object.defineProperty(r, "ContractType", { enumerable: !0, get: function() {
      return U.ContractType;
    } });
    const A = Qt(), q = Ds(), N = Ss(), Wt = Ps(), te = Is(), zt = Ua(), E = mc(), rn = Aa();
    class an extends O.UpdateDataT {
      constructor(h = R.UpdateDataType.NONE, b = null) {
        super(h, b);
      }
    }
    r.UpdateData = an;
    class ho extends w.StateUpdateT {
      constructor(h = []) {
        super(h);
      }
    }
    r.StateUpdate = ho;
    class _o extends a.DeltaUpdateT {
      constructor(h = []) {
        super(h);
      }
    }
    r.DeltaUpdate = _o;
    class bo extends v.StateAndDeltaUpdateT {
      constructor(h = [], b = []) {
        super(h, b);
      }
    }
    r.StateAndDeltaUpdate = bo;
    class po extends g.RelatedStateUpdateT {
      constructor(h = null, b = []) {
        super(h, b);
      }
    }
    r.RelatedStateUpdate = po;
    class go extends d.RelatedDeltaUpdateT {
      constructor(h = null, b = []) {
        super(h, b);
      }
    }
    r.RelatedDeltaUpdate = go;
    class yo extends _.RelatedStateAndDeltaUpdateT {
      constructor(h = null, b = [], y = []) {
        super(h, b, y);
      }
    }
    r.RelatedStateAndDeltaUpdate = yo;
    class le extends A.ContractKeyT {
      constructor(h, b) {
        if (h.length !== 32 || b && b.length !== 32)
          throw new TypeError("Invalid array length, expected 32 bytes");
        let y = new s.ContractInstanceIdT(Array.from(h)), m = [];
        b && (m = Array.from(b)), super(y, m);
      }
      static fromInstanceId(h) {
        const b = n.default.decode(h);
        return new le(b);
      }
      bytes() {
        var h;
        return new Uint8Array((h = this.instance) === null || h === void 0 ? void 0 : h.data);
      }
      codePart() {
        return new Uint8Array(this.code);
      }
      encode() {
        var h;
        const b = new Uint8Array((h = this.instance) === null || h === void 0 ? void 0 : h.data);
        return n.default.encode(b);
      }
      get_contract_key() {
        return this;
      }
    }
    r.ContractKey = le;
    class Oo extends rn.WasmContractV1T {
      constructor(h = null, b = [], y = null) {
        super(h, b, y);
      }
    }
    r.WasmContractV1 = Oo;
    class wo extends e.ContractContainerT {
      constructor(h = rn.ContractType.NONE, b) {
        super(h, b);
      }
    }
    r.ContractContainer = wo;
    class vo extends p.WasmDelegateV1T {
      constructor(h = [], b, y) {
        super(h, b, y);
      }
    }
    r.WasmDelegateV1 = vo;
    class Ro extends p.DelegateContainerT {
      constructor(h = p.DelegateType.NONE, b) {
        super(h, b);
      }
    }
    r.DelegateContainer = Ro;
    class To extends p.PutT {
      constructor(h = null, b = [], y = null, m = !1, I = !1) {
        super(h, b, y, m, I);
      }
    }
    r.PutRequest = To;
    class mo extends p.UpdateT {
      constructor(h = null, b = null) {
        const y = h?.get_contract_key();
        super(y, b);
      }
    }
    r.UpdateRequest = mo;
    class jo extends p.GetT {
      constructor(h, b = !1, y = !1, m = !1) {
        const I = h.get_contract_key();
        super(I, b, y, m);
      }
    }
    r.GetRequest = jo;
    class Do extends p.SubscribeT {
      constructor(h = null, b = []) {
        const y = h?.get_contract_key();
        super(y, b);
      }
    }
    r.SubscribeRequest = Do;
    class So extends p.DisconnectT {
      constructor(h = null) {
        super(h);
      }
    }
    r.DisconnectRequest = So;
    class Po extends p.InboundDelegateMsgT {
      constructor(h = p.InboundDelegateMsgType.NONE, b) {
        super(h, b);
      }
    }
    r.InboundDelegateMsg = Po;
    class Io extends p.DelegateRequestT {
      constructor(h = p.DelegateRequestType.NONE, b) {
        super(h, b);
      }
    }
    r.DelegateRequest = Io;
    class on extends q.PutResponseT {
      constructor(h) {
        super(h), this.key = h;
      }
      static fromPutResponseT(h) {
        var b, y, m;
        let I = new Uint8Array((y = (b = h.key) === null || b === void 0 ? void 0 : b.instance) === null || y === void 0 ? void 0 : y.data);
        const C = !((m = h.key) === null || m === void 0) && m.code && h.key.code.length > 0 ? new Uint8Array(h.key.code) : void 0;
        let M = new le(I, C);
        return new on(M);
      }
    }
    r.PutResponse = on;
    class cn extends N.GetResponseT {
      constructor(h, b, y = []) {
        super(h, b, y), this.key = h, this.contract = b, this.state = y;
      }
      static fromGetResponseT(h) {
        var b, y, m;
        let I = new Uint8Array((y = (b = h.key) === null || b === void 0 ? void 0 : b.instance) === null || y === void 0 ? void 0 : y.data);
        const C = !((m = h.key) === null || m === void 0) && m.code && h.key.code.length > 0 ? new Uint8Array(h.key.code) : void 0;
        let M = new le(I, C);
        return new cn(M, h.contract, h.state);
      }
    }
    r.GetResponse = cn;
    class un extends Wt.UpdateResponseT {
      constructor(h, b = []) {
        super(h, b), this.key = h, this.summary = b;
      }
      static fromUpdateResponseT(h) {
        var b, y, m;
        let I = new Uint8Array((y = (b = h.key) === null || b === void 0 ? void 0 : b.instance) === null || y === void 0 ? void 0 : y.data);
        const C = !((m = h.key) === null || m === void 0) && m.code && h.key.code.length > 0 ? new Uint8Array(h.key.code) : void 0;
        let M = new le(I, C);
        return new un(M, h.summary);
      }
    }
    r.UpdateResponse = un;
    class ln extends te.UpdateNotificationT {
      constructor(h, b) {
        super(h, b), this.key = h, this.update = b;
      }
      static fromUpdateNotificationT(h) {
        var b, y, m;
        let I = new Uint8Array((y = (b = h.key) === null || b === void 0 ? void 0 : b.instance) === null || y === void 0 ? void 0 : y.data);
        const C = !((m = h.key) === null || m === void 0) && m.code && h.key.code.length > 0 ? new Uint8Array(h.key.code) : void 0;
        let M = new le(I, C);
        return new ln(M, h.update);
      }
    }
    r.UpdateNotification = ln;
    class Co extends E.OutboundDelegateMsgT {
      constructor(h = E.OutboundDelegateMsgType.NONE, b) {
        super(h, b);
      }
    }
    r.OutboundDelegateMsg = Co;
    class Uo extends E.DelegateResponseT {
      constructor(h = null, b = []) {
        super(h, b);
      }
    }
    r.DelegateResponse = Uo;
    const Ao = "flatbuffers";
    function qo() {
      if (typeof document > "u")
        return null;
      const P = document.cookie.split(";");
      for (let h of P) {
        const [b, y] = h.trim().split("=");
        if (b === "authorization") {
          const m = decodeURIComponent(y).split("Bearer ");
          return m.length == 2 ? m[1] : null;
        }
      }
      return null;
    }
    function Mo() {
      if (typeof WebSocket < "u")
        return WebSocket;
      try {
        return Dc();
      } catch {
        throw new Error("No WebSocket implementation found. Install the 'ws' package for Node.js support.");
      }
    }
    const Eo = 3e4;
    class No {
      constructor(h, b, y) {
        this.reassembly = new t.ReassemblyBuffer(), this.nextStreamId = 0, this.pendingGets = [], this.pendingPuts = [], this.pendingUpdates = [], this.responseHandler = b;
        const m = y ?? qo();
        m && h.searchParams.append("authToken", m), h.searchParams.append("encodingProtocol", Ao);
        const I = Mo();
        this.ws = new I(h.toString()), this.ws.binaryType = "arraybuffer", this.ws.onmessage = (C) => this.handleResponse(C), this.ws.addEventListener("open", () => {
          y && this.sendRequest(new p.ClientRequestT(p.ClientRequestType.Authenticate, new p.AuthenticateT(y))), b.onOpen();
        }), this.ws.addEventListener("close", (C) => {
          var M;
          this.rejectAllPending(new Error(`Connection closed: ${C.reason || C.code}`)), (M = b.onClose) === null || M === void 0 || M.call(b, C.code, C.reason);
        });
      }
      handleResponse(h) {
        var b, y, m, I, C, M, Le, Yt;
        let B;
        try {
          let L = new o.ByteBuffer(new Uint8Array(h.data));
          B = zt.HostResponse.getRootAsHostResponse(L).unpack();
        } catch (L) {
          return console.log(`found error: ${L}`), new Error(`${L}`);
        }
        switch (B.responseType) {
          case E.HostResponseType.ContractResponse:
            let L = B.response;
            switch (L.contractResponseType) {
              case E.ContractResponseType.PutResponse:
                const ie = on.fromPutResponseT(L.contractResponse);
                this.responseHandler.onContractPut(ie), this.resolveNext(this.pendingPuts, ie);
                break;
              case E.ContractResponseType.GetResponse:
                const Oe = cn.fromGetResponseT(L.contractResponse);
                this.responseHandler.onContractGet(Oe), this.resolveNext(this.pendingGets, Oe);
                break;
              case E.ContractResponseType.UpdateResponse:
                const Ve = un.fromUpdateResponseT(L.contractResponse);
                this.responseHandler.onContractUpdate(Ve), this.resolveNext(this.pendingUpdates, Ve);
                break;
              case E.ContractResponseType.UpdateNotification:
                const Bo = ln.fromUpdateNotificationT(L.contractResponse);
                this.responseHandler.onContractUpdateNotification(Bo);
                break;
              case E.ContractResponseType.NotFound:
                const Ho = L.contractResponse, Ko = new Uint8Array((y = (b = Ho.instanceId) === null || b === void 0 ? void 0 : b.data) !== null && y !== void 0 ? y : []);
                this.responseHandler.onContractNotFound(Ko), this.rejectNext(this.pendingGets, new Error("Contract not found"));
                break;
              case E.ContractResponseType.SubscribeResponse:
                const Xe = L.contractResponse, ko = new Uint8Array((C = (I = (m = Xe.key) === null || m === void 0 ? void 0 : m.instance) === null || I === void 0 ? void 0 : I.data) !== null && C !== void 0 ? C : []), Go = !((M = Xe.key) === null || M === void 0) && M.code && Xe.key.code.length > 0 ? new Uint8Array(Xe.key.code) : void 0, xo = new le(ko, Go);
                (Yt = (Le = this.responseHandler).onSubscribeResponse) === null || Yt === void 0 || Yt.call(Le, xo, Xe.subscribed);
                break;
              default:
                const Ws = "Contract response type not implemented";
                console.log(Ws);
                const $o = {
                  cause: Ws
                };
                this.responseHandler.onErr($o);
                break;
            }
            break;
          case E.HostResponseType.DelegateResponse:
            let Lo = B.response;
            this.responseHandler.onDelegateResponse(Lo);
            break;
          case E.HostResponseType.Ok:
            break;
          case E.HostResponseType.Error:
            const fn = B.response.msg, xs = typeof fn == "string" ? fn : fn instanceof Uint8Array ? new TextDecoder().decode(fn) : "unknown error", Vo = { cause: xs };
            this.responseHandler.onErr(Vo), this.rejectAllPending(new Error(xs));
            break;
          case E.HostResponseType.StreamChunk: {
            const ie = B.response;
            try {
              const Oe = this.reassembly.receiveChunk(ie.streamId, ie.index, ie.total, new Uint8Array(ie.data));
              if (Oe !== null) {
                const Ve = { data: Oe.buffer };
                this.handleResponse(Ve);
              }
            } catch (Oe) {
              const Ve = {
                cause: `Stream reassembly error: ${Oe}`
              };
              this.responseHandler.onErr(Ve), ie.streamId !== void 0 && this.reassembly.removeStream(ie.streamId);
            }
            break;
          }
          default:
            const $s = "Received wrong HostResponse type";
            console.log($s);
            const Fo = {
              cause: $s
            };
            this.responseHandler.onErr(Fo);
            break;
        }
      }
      sendRequest(h) {
        const b = new o.Builder(1024);
        p.ClientRequest.finishClientRequestBuffer(b, h.pack(b));
        const y = b.asUint8Array();
        y.byteLength > t.CHUNK_THRESHOLD ? this.sendChunked(y) : this.ws.send(y);
      }
      sendChunked(h) {
        const b = this.nextStreamId++, y = Math.ceil(h.byteLength / t.CHUNK_SIZE);
        for (let m = 0; m < y; m++) {
          const I = m * t.CHUNK_SIZE, C = Math.min(I + t.CHUNK_SIZE, h.byteLength), M = new D.StreamChunkT(b, m, y, Array.from(h.subarray(I, C))), Le = new p.ClientRequestT(p.ClientRequestType.StreamChunk, M), Yt = new o.Builder(C - I + 128);
          p.ClientRequest.finishClientRequestBuffer(Yt, Le.pack(Yt)), this.ws.send(Yt.asUint8Array());
        }
      }
      awaitResponse(h) {
        return new Promise((b, y) => {
          const m = setTimeout(() => {
            const I = h.findIndex((C) => C.timer === m);
            I !== -1 && h.splice(I, 1), y(new Error("Request timeout"));
          }, Eo);
          h.push({ resolve: b, reject: y, timer: m });
        });
      }
      resolveNext(h, b) {
        const y = h.shift();
        y && (clearTimeout(y.timer), y.resolve(b));
      }
      rejectNext(h, b) {
        const y = h.shift();
        y && (clearTimeout(y.timer), y.reject(b));
      }
      rejectAllPending(h) {
        for (const b of [this.pendingGets, this.pendingPuts, this.pendingUpdates])
          for (; b.length > 0; ) {
            const y = b.shift();
            clearTimeout(y.timer), y.reject(h);
          }
      }
      put(h) {
        return c(this, void 0, void 0, function* () {
          return this.sendRequest(new p.ClientRequestT(p.ClientRequestType.ContractRequest, new p.ContractRequestT(p.ContractRequestType.Put, h))), this.awaitResponse(this.pendingPuts);
        });
      }
      update(h) {
        return c(this, void 0, void 0, function* () {
          return this.sendRequest(new p.ClientRequestT(p.ClientRequestType.ContractRequest, new p.ContractRequestT(p.ContractRequestType.Update, h))), this.awaitResponse(this.pendingUpdates);
        });
      }
      get(h) {
        return c(this, void 0, void 0, function* () {
          return this.sendRequest(new p.ClientRequestT(p.ClientRequestType.ContractRequest, new p.ContractRequestT(p.ContractRequestType.Get, h))), this.awaitResponse(this.pendingGets);
        });
      }
      subscribe(h) {
        return c(this, void 0, void 0, function* () {
          this.sendRequest(new p.ClientRequestT(p.ClientRequestType.ContractRequest, new p.ContractRequestT(p.ContractRequestType.Subscribe, h)));
        });
      }
      disconnect(h) {
        return c(this, void 0, void 0, function* () {
          this.sendRequest(new p.ClientRequestT(p.ClientRequestType.Disconnect, h));
        });
      }
    }
    r.FreenetWsApi = No;
  })(H)), H;
}
var wi;
function Pc() {
  return wi || (wi = 1, (function(r) {
    var i = we && we.__createBinding || (Object.create ? (function(f, c, u, o) {
      o === void 0 && (o = u);
      var n = Object.getOwnPropertyDescriptor(c, u);
      (!n || ("get" in n ? !c.__esModule : n.writable || n.configurable)) && (n = { enumerable: !0, get: function() {
        return c[u];
      } }), Object.defineProperty(f, o, n);
    }) : (function(f, c, u, o) {
      o === void 0 && (o = u), f[o] = c[u];
    })), l = we && we.__exportStar || function(f, c) {
      for (var u in f) u !== "default" && !Object.prototype.hasOwnProperty.call(c, u) && i(c, f, u);
    };
    Object.defineProperty(r, "__esModule", { value: !0 }), l(Sc(), r), l(Ki(), r);
  })(we)), we;
}
var Zt = Pc();
function qa() {
  return new TextEncoder().encode(Wo);
}
function Ic(r, i) {
  const l = tn.decode(r), f = new Uint8Array(l.length + i.length);
  f.set(l, 0), f.set(i, l.length);
  const c = bs(f);
  return { bytes: c, base58: tn.encode(c) };
}
function Ma() {
  const r = qa(), i = Ic(Tn, r), l = tn.decode(Tn);
  return new Zt.ContractKey(i.bytes, l);
}
var Ge = Aa();
const Cc = /* @__PURE__ */ Li({
  __proto__: null
}, [Ge]);
var Ea = ba();
const Na = /* @__PURE__ */ Li({
  __proto__: null
}, [Ea]);
function Uc(r) {
  const i = tn.decode(r);
  if (i.length !== 32)
    throw new Error(`code hash must be 32 bytes, got ${i.length}`);
  return i;
}
function Ac(r, i, l, f) {
  const c = Uc(i), u = new Uint8Array(c.length + l.length);
  u.set(c, 0), u.set(l, c.length);
  const o = bs(u), n = new Ge.ContractCodeT(
    Array.from(r),
    Array.from(c)
  ), t = new Ge.ContractKeyT(
    new Ge.ContractInstanceIdT(Array.from(o)),
    Array.from(c)
  ), e = new Ge.WasmContractV1T(n, Array.from(l), t), s = new Ge.ContractContainerT(
    Zt.ContractType.WasmContractV1,
    e
  );
  return new Zt.PutRequest(
    s,
    Array.from(f),
    new Ea.RelatedContractsT([]),
    !0,
    !1
  );
}
function Us(r, i) {
  const l = new Zt.UpdateData(
    Zt.UpdateDataType.DeltaUpdate,
    new Zt.DeltaUpdate(Array.from(i))
  );
  return new Zt.UpdateRequest(r, l);
}
function qc() {
  const r = globalThis.location, i = r?.protocol === "https:" ? "wss:" : "ws:", l = r?.host || "127.0.0.1:7509";
  return new URL(`${i}//${l}/v1/contract/command`);
}
let Ye = null, Ke = null;
const $e = /* @__PURE__ */ new Set(), es = /* @__PURE__ */ new Set(), ns = /* @__PURE__ */ new Set(), ss = /* @__PURE__ */ new Set(), rs = /* @__PURE__ */ new Set();
function Mc(r, i = null) {
  for (const l of $e)
    try {
      l(r, i);
    } catch {
    }
}
function La(r) {
  return $e.add(r), () => $e.delete(r);
}
function Ec(r) {
  const i = [];
  if (!r?.values) return i;
  for (const l of r.values) {
    if (l.inboundType !== 1) continue;
    const f = l.inbound;
    if (f?.payload?.length)
      try {
        const c = new Uint8Array(f.payload);
        i.push(JSON.parse(new TextDecoder().decode(c)));
      } catch {
      }
  }
  return i;
}
function Nc(r) {
  for (const l of ns)
    try {
      l(r);
    } catch {
    }
  const i = Ec(r);
  if (i.length)
    for (const l of es)
      try {
        l(i);
      } catch {
      }
}
function Lc(r) {
  const i = new Error(r || "Freenet host error");
  for (const l of ss)
    try {
      l(i);
    } catch {
    }
}
function Vc(r, i) {
  const l = new Error(
    `Connection closed: ${r}${i ? ` ${i}` : ""}`
  );
  for (const f of rs)
    try {
      f(l);
    } catch {
    }
}
function Fc(r) {
  return es.add(r), () => es.delete(r);
}
function Bc(r) {
  return ns.add(r), () => ns.delete(r);
}
function Hc(r) {
  return ss.add(r), () => ss.delete(r);
}
function Kc(r) {
  return rs.add(r), () => rs.delete(r);
}
function kc() {
  return {
    onContractPut: () => {
    },
    onContractGet: () => {
    },
    onContractUpdate: () => {
    },
    onContractUpdateNotification: (r) => {
      r?.key && Mc(r.key, r);
    },
    onContractNotFound: () => {
    },
    onDelegateResponse: (r) => {
      Nc(r);
    },
    onErr: (r) => {
      console.warn("[kairos] host error:", r?.cause ?? r), Lc(
        typeof r?.cause == "string" ? r.cause : String(r?.cause ?? r)
      );
    },
    onOpen: () => {
    }
  };
}
async function Gc() {
  let r, i, l = !1;
  const f = new Promise((o, n) => {
    r = () => {
      l || (l = !0, o());
    }, i = (t) => {
      l || (l = !0, n(t));
    };
  });
  let c;
  const u = {
    ...kc(),
    onOpen: () => r(),
    onClose: (o, n) => {
      Ye?.api === c && (Ye = null), Vc(o, n), i(
        new Error(`Connection closed: ${o}${n ? ` ${n}` : ""}`)
      );
    }
  };
  return c = new Zt.FreenetWsApi(qc(), u, ""), await Promise.race([
    f,
    new Promise(
      (o, n) => setTimeout(() => n(new Error("Freenet WS connect timeout")), 12e3)
    )
  ]), { api: c };
}
async function En() {
  return Ye || Ke || (Ke = Gc().then((r) => (Ye = r, Ke = null, r)).catch((r) => {
    throw Ke = null, r;
  }), Ke);
}
async function Va() {
  return (await En()).api;
}
function xc(r) {
  return r ? r instanceof Uint8Array ? r : Array.isArray(r) ? new Uint8Array(r) : r.data ? new Uint8Array(r.data) : null : null;
}
async function $c(r, i = {}) {
  try {
    return await As(r, {
      timeoutMs: i.timeoutMs ?? 8e3,
      subscribe: !1,
      fetchContract: !1
    });
  } catch {
    return null;
  }
}
async function As(r, i = {}) {
  const {
    timeoutMs: l = 2e4,
    subscribe: f = !1,
    fetchContract: c = !1
  } = i, { api: u } = await En(), o = new Zt.GetRequest(r, c, f, !1), n = await Promise.race([
    u.get(o),
    new Promise(
      (t, e) => setTimeout(() => e(new Error("GET timeout")), l)
    )
  ]);
  if (n instanceof Zt.GetResponse || n?.state != null) {
    const t = xc(n.state);
    if (!t) throw new Error("empty GET state");
    return t;
  }
  throw new Error("unexpected GET result");
}
function Fa(r, i) {
  return new Promise((l, f) => {
    const c = setTimeout(() => {
      $e.delete(u), f(new Error("update notification timeout"));
    }, i), u = (o) => {
      clearTimeout(c), $e.delete(u), l(o);
    };
    $e.add(u);
  });
}
async function Wc(r, i) {
  const { api: l } = await En(), f = i ? Fa(i, 45e3).catch(() => null) : Promise.resolve(null);
  try {
    await Promise.race([
      l.put(r),
      f,
      new Promise(
        (c, u) => setTimeout(() => u(new Error("PUT timeout")), 45e3)
      )
    ]);
  } catch (c) {
    if (String(c).includes("timeout") && await f) return;
    throw c;
  }
}
async function qs(r, i) {
  const { api: l } = await En(), f = i ? Fa(i, 45e3).catch(() => null) : Promise.resolve(null);
  try {
    await Promise.race([
      l.update(r),
      f,
      new Promise(
        (c, u) => setTimeout(() => u(new Error("UPDATE timeout")), 45e3)
      )
    ]);
  } catch (c) {
    if (String(c).includes("timeout") && await f) return;
    throw c;
  }
}
const We = [198, 187, 222, 173, 215, 177, 246, 202, 225, 230, 58, 42, 2, 42, 182, 28, 178, 67, 93, 134, 212, 17, 134, 73, 91, 215, 38, 109, 112, 150, 219, 36], nn = [71, 236, 156, 62, 216, 89, 248, 138, 12, 78, 190, 202, 107, 121, 79, 125, 25, 85, 131, 160, 254, 28, 138, 63, 230, 34, 50, 107, 66, 223, 0, 242], zc = "./public/kairos_identity.wasm";
function Ba() {
  return Array.isArray(We) && We.length === 32 && Array.isArray(nn) && nn.length === 32;
}
/*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
const Xc = {
  p: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,
  n: 0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,
  a: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,
  d: 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,
  Gx: 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
  Gy: 0x6666666666666666666666666666666666666666666666666666666666666658n
}, { p: F, n: vn, Gx: vi, Gy: Ri, a: Gn, d: xn } = Xc, Zc = 8n, Ee = 32, Ms = 64, $t = (r = "") => {
  throw new Error(r);
}, Yc = (r) => typeof r == "bigint", Ha = (r) => typeof r == "string", Jc = (r) => r instanceof Uint8Array || ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array", Ne = (r, i) => !Jc(r) || typeof i == "number" && i > 0 && r.length !== i ? $t("Uint8Array expected") : r, Nn = (r) => new Uint8Array(r), Es = (r) => Uint8Array.from(r), Ka = (r, i) => r.toString(16).padStart(i, "0"), Ns = (r) => Array.from(Ne(r)).map((i) => Ka(i, 2)).join(""), ce = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 }, Ti = (r) => {
  if (r >= ce._0 && r <= ce._9)
    return r - ce._0;
  if (r >= ce.A && r <= ce.F)
    return r - (ce.A - 10);
  if (r >= ce.a && r <= ce.f)
    return r - (ce.a - 10);
}, Ls = (r) => {
  const i = "hex invalid";
  if (!Ha(r))
    return $t(i);
  const l = r.length, f = l / 2;
  if (l % 2)
    return $t(i);
  const c = Nn(f);
  for (let u = 0, o = 0; u < f; u++, o += 2) {
    const n = Ti(r.charCodeAt(o)), t = Ti(r.charCodeAt(o + 1));
    if (n === void 0 || t === void 0)
      return $t(i);
    c[u] = n * 16 + t;
  }
  return c;
}, Ln = (r, i) => Ne(Ha(r) ? Ls(r) : Es(Ne(r)), i), ka = () => globalThis?.crypto, Qc = () => ka()?.subtle ?? $t("crypto.subtle must be defined"), Pn = (...r) => {
  const i = Nn(r.reduce((f, c) => f + Ne(c).length, 0));
  let l = 0;
  return r.forEach((f) => {
    i.set(f, l), l += f.length;
  }), i;
}, Ga = (r = Ee) => ka().getRandomValues(Nn(r)), In = BigInt, Ue = (r, i, l, f = "bad number: out of range") => Yc(r) && i <= r && r < l ? r : $t(f), T = (r, i = F) => {
  const l = r % i;
  return l >= 0n ? l : i + l;
}, xa = (r) => T(r, vn), $a = (r, i) => {
  (r === 0n || i <= 0n) && $t("no inverse n=" + r + " mod=" + i);
  let l = T(r, i), f = i, c = 0n, u = 1n;
  for (; l !== 0n; ) {
    const o = f / l, n = f % l, t = c - u * o;
    f = l, l = n, c = u, u = t;
  }
  return f === 1n ? T(c, i) : $t("no inverse");
}, tu = (r) => {
  const i = Cn[r];
  return typeof i != "function" && $t("hashes." + r + " not set"), i;
}, mi = (r) => r instanceof Xt ? r : $t("Point expected"), is = 2n ** 256n;
class Xt {
  static BASE;
  static ZERO;
  ex;
  ey;
  ez;
  et;
  constructor(i, l, f, c) {
    const u = is;
    this.ex = Ue(i, 0n, u), this.ey = Ue(l, 0n, u), this.ez = Ue(f, 1n, u), this.et = Ue(c, 0n, u), Object.freeze(this);
  }
  static fromAffine(i) {
    return new Xt(i.x, i.y, 1n, T(i.x * i.y));
  }
  /** RFC8032 5.1.3: Uint8Array to Point. */
  static fromBytes(i, l = !1) {
    const f = xn, c = Es(Ne(i, Ee)), u = i[31];
    c[31] = u & -129;
    const o = za(c);
    Ue(o, 0n, l ? is : F);
    const t = T(o * o), e = T(t - 1n), s = T(f * t + 1n);
    let { isValid: a, value: d } = nu(e, s);
    a || $t("bad point: y not sqrt");
    const _ = (d & 1n) === 1n, g = (u & 128) !== 0;
    return !l && d === 0n && g && $t("bad point: x==0, isLastByteOdd"), g !== _ && (d = T(-d)), new Xt(d, o, 1n, T(d * o));
  }
  /** Checks if the point is valid and on-curve. */
  assertValidity() {
    const i = Gn, l = xn, f = this;
    if (f.is0())
      throw new Error("bad point: ZERO");
    const { ex: c, ey: u, ez: o, et: n } = f, t = T(c * c), e = T(u * u), s = T(o * o), a = T(s * s), d = T(t * i), _ = T(s * T(d + e)), g = T(a + T(l * T(t * e)));
    if (_ !== g)
      throw new Error("bad point: equation left != right (1)");
    const v = T(c * u), w = T(o * n);
    if (v !== w)
      throw new Error("bad point: equation left != right (2)");
    return this;
  }
  /** Equality check: compare points P&Q. */
  equals(i) {
    const { ex: l, ey: f, ez: c } = this, { ex: u, ey: o, ez: n } = mi(i), t = T(l * n), e = T(u * c), s = T(f * n), a = T(o * c);
    return t === e && s === a;
  }
  is0() {
    return this.equals(xe);
  }
  /** Flip point over y coordinate. */
  negate() {
    return new Xt(T(-this.ex), this.ey, this.ez, T(-this.et));
  }
  /** Point doubling. Complete formula. Cost: `4M + 4S + 1*a + 6add + 1*2`. */
  double() {
    const { ex: i, ey: l, ez: f } = this, c = Gn, u = T(i * i), o = T(l * l), n = T(2n * T(f * f)), t = T(c * u), e = i + l, s = T(T(e * e) - u - o), a = t + o, d = a - n, _ = t - o, g = T(s * d), v = T(a * _), w = T(s * _), p = T(d * a);
    return new Xt(g, v, p, w);
  }
  /** Point addition. Complete formula. Cost: `8M + 1*k + 8add + 1*2`. */
  add(i) {
    const { ex: l, ey: f, ez: c, et: u } = this, { ex: o, ey: n, ez: t, et: e } = mi(i), s = Gn, a = xn, d = T(l * o), _ = T(f * n), g = T(u * a * e), v = T(c * t), w = T((l + f) * (o + n) - d - _), p = T(v - g), D = T(v + g), O = T(_ - s * d), R = T(w * p), S = T(D * O), U = T(w * O), A = T(p * D);
    return new Xt(R, S, A, U);
  }
  /**
   * Point-by-scalar multiplication. Scalar must be in range 1 <= n < CURVE.n.
   * Uses {@link wNAF} for base point.
   * Uses fake point to mitigate side-channel leakage.
   * @param n scalar by which point is multiplied
   * @param safe safe mode guards against timing attacks; unsafe mode is faster
   */
  multiply(i, l = !0) {
    if (!l && (i === 0n || this.is0()))
      return xe;
    if (Ue(i, 1n, vn), i === 1n)
      return this;
    if (this.equals(pe))
      return du(i).p;
    let f = xe, c = pe;
    for (let u = this; i > 0n; u = u.double(), i >>= 1n)
      i & 1n ? f = f.add(u) : l && (c = c.add(u));
    return f;
  }
  /** Convert point to 2d xy affine point. (X, Y, Z) ∋ (x=X/Z, y=Y/Z) */
  toAffine() {
    const { ex: i, ey: l, ez: f } = this;
    if (this.equals(xe))
      return { x: 0n, y: 1n };
    const c = $a(f, F);
    return T(f * c) !== 1n && $t("invalid inverse"), { x: T(i * c), y: T(l * c) };
  }
  toBytes() {
    const { x: i, y: l } = this.assertValidity().toAffine(), f = Wa(l);
    return f[31] |= i & 1n ? 128 : 0, f;
  }
  toHex() {
    return Ns(this.toBytes());
  }
  // encode to hex string
  clearCofactor() {
    return this.multiply(In(Zc), !1);
  }
  isSmallOrder() {
    return this.clearCofactor().is0();
  }
  isTorsionFree() {
    let i = this.multiply(vn / 2n, !1).double();
    return vn % 2n && (i = i.add(this)), i.is0();
  }
  static fromHex(i, l) {
    return Xt.fromBytes(Ln(i), l);
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
const pe = new Xt(vi, Ri, 1n, T(vi * Ri)), xe = new Xt(0n, 1n, 1n, 0n);
Xt.BASE = pe;
Xt.ZERO = xe;
const Wa = (r) => Ls(Ka(Ue(r, 0n, is), Ms)).reverse(), za = (r) => In("0x" + Ns(Es(Ne(r)).reverse())), ne = (r, i) => {
  let l = r;
  for (; i-- > 0n; )
    l *= l, l %= F;
  return l;
}, eu = (r) => {
  const l = r * r % F * r % F, f = ne(l, 2n) * l % F, c = ne(f, 1n) * r % F, u = ne(c, 5n) * c % F, o = ne(u, 10n) * u % F, n = ne(o, 20n) * o % F, t = ne(n, 40n) * n % F, e = ne(t, 80n) * t % F, s = ne(e, 80n) * t % F, a = ne(s, 10n) * u % F;
  return { pow_p_5_8: ne(a, 2n) * r % F, b2: l };
}, ji = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n, nu = (r, i) => {
  const l = T(i * i * i), f = T(l * l * i), c = eu(r * f).pow_p_5_8;
  let u = T(r * l * c);
  const o = T(i * u * u), n = u, t = T(u * ji), e = o === r, s = o === T(-r), a = o === T(-r * ji);
  return e && (u = n), (s || a) && (u = t), (T(u) & 1n) === 1n && (u = T(-u)), { isValid: e || s, value: u };
}, as = (r) => xa(za(r)), Vs = (...r) => Cn.sha512Async(...r), su = (...r) => tu("sha512Sync")(...r), Xa = (r) => {
  const i = r.slice(0, Ee);
  i[0] &= 248, i[31] &= 127, i[31] |= 64;
  const l = r.slice(Ee, Ms), f = as(i), c = pe.multiply(f), u = c.toBytes();
  return { head: i, prefix: l, scalar: f, point: c, pointBytes: u };
}, Fs = (r) => Vs(Ln(r, Ee)).then(Xa), ru = (r) => Xa(su(Ln(r, Ee))), iu = (r) => Fs(r).then((i) => i.pointBytes), au = (r) => Vs(r.hashable).then(r.finish), ou = (r, i, l) => {
  const { pointBytes: f, scalar: c } = r, u = as(i), o = pe.multiply(u).toBytes();
  return { hashable: Pn(o, f, l), finish: (e) => {
    const s = xa(u + as(e) * c);
    return Ne(Pn(o, Wa(s)), Ms);
  } };
}, cu = async (r, i) => {
  const l = Ln(r), f = await Fs(i), c = await Vs(f.prefix, l);
  return au(ou(f, c, l));
}, Cn = {
  sha512Async: async (...r) => {
    const i = Qc(), l = Pn(...r);
    return Nn(await i.digest("SHA-512", l.buffer));
  },
  sha512Sync: void 0,
  bytesToHex: Ns,
  hexToBytes: Ls,
  concatBytes: Pn,
  mod: T,
  invert: $a,
  randomBytes: Ga
}, uu = {
  getExtendedPublicKeyAsync: Fs,
  getExtendedPublicKey: ru,
  randomPrivateKey: () => Ga(Ee),
  precompute: (r = 8, i = pe) => (i.multiply(3n), i)
  // no-op
}, Un = 8, lu = 256, Za = Math.ceil(lu / Un) + 1, os = 2 ** (Un - 1), fu = () => {
  const r = [];
  let i = pe, l = i;
  for (let f = 0; f < Za; f++) {
    l = i, r.push(l);
    for (let c = 1; c < os; c++)
      l = l.add(i), r.push(l);
    i = l.double();
  }
  return r;
};
let Di;
const Si = (r, i) => {
  const l = i.negate();
  return r ? l : i;
}, du = (r) => {
  const i = Di || (Di = fu());
  let l = xe, f = pe;
  const c = 2 ** Un, u = c, o = In(c - 1), n = In(Un);
  for (let t = 0; t < Za; t++) {
    let e = Number(r & o);
    r >>= n, e > os && (e -= u, r += 1n);
    const s = t * os, a = s, d = s + Math.abs(e) - 1, _ = t % 2 !== 0, g = e < 0;
    e === 0 ? f = f.add(Si(_, i[a])) : l = l.add(Si(g, i[d]));
  }
  return { p: l, f };
}, Ya = oc([
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
].map((r) => BigInt(r))), hu = Ya[0], _u = Ya[1], he = /* @__PURE__ */ new Uint32Array(80), _e = /* @__PURE__ */ new Uint32Array(80);
class bu extends ic {
  constructor(i = 64) {
    super(128, i, 16, !1), this.Ah = V[0] | 0, this.Al = V[1] | 0, this.Bh = V[2] | 0, this.Bl = V[3] | 0, this.Ch = V[4] | 0, this.Cl = V[5] | 0, this.Dh = V[6] | 0, this.Dl = V[7] | 0, this.Eh = V[8] | 0, this.El = V[9] | 0, this.Fh = V[10] | 0, this.Fl = V[11] | 0, this.Gh = V[12] | 0, this.Gl = V[13] | 0, this.Hh = V[14] | 0, this.Hl = V[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah: i, Al: l, Bh: f, Bl: c, Ch: u, Cl: o, Dh: n, Dl: t, Eh: e, El: s, Fh: a, Fl: d, Gh: _, Gl: g, Hh: v, Hl: w } = this;
    return [i, l, f, c, u, o, n, t, e, s, a, d, _, g, v, w];
  }
  // prettier-ignore
  set(i, l, f, c, u, o, n, t, e, s, a, d, _, g, v, w) {
    this.Ah = i | 0, this.Al = l | 0, this.Bh = f | 0, this.Bl = c | 0, this.Ch = u | 0, this.Cl = o | 0, this.Dh = n | 0, this.Dl = t | 0, this.Eh = e | 0, this.El = s | 0, this.Fh = a | 0, this.Fl = d | 0, this.Gh = _ | 0, this.Gl = g | 0, this.Hh = v | 0, this.Hl = w | 0;
  }
  process(i, l) {
    for (let O = 0; O < 16; O++, l += 4)
      he[O] = i.getUint32(l), _e[O] = i.getUint32(l += 4);
    for (let O = 16; O < 80; O++) {
      const R = he[O - 15] | 0, S = _e[O - 15] | 0, U = Fe(R, S, 1) ^ Fe(R, S, 8) ^ Zs(R, S, 7), A = Be(R, S, 1) ^ Be(R, S, 8) ^ Ys(R, S, 7), q = he[O - 2] | 0, N = _e[O - 2] | 0, Wt = Fe(q, N, 19) ^ hn(q, N, 61) ^ Zs(q, N, 6), te = Be(q, N, 19) ^ _n(q, N, 61) ^ Ys(q, N, 6), zt = lc(A, te, _e[O - 7], _e[O - 16]), E = fc(zt, U, Wt, he[O - 7], he[O - 16]);
      he[O] = E | 0, _e[O] = zt | 0;
    }
    let { Ah: f, Al: c, Bh: u, Bl: o, Ch: n, Cl: t, Dh: e, Dl: s, Eh: a, El: d, Fh: _, Fl: g, Gh: v, Gl: w, Hh: p, Hl: D } = this;
    for (let O = 0; O < 80; O++) {
      const R = Fe(a, d, 14) ^ Fe(a, d, 18) ^ hn(a, d, 41), S = Be(a, d, 14) ^ Be(a, d, 18) ^ _n(a, d, 41), U = a & _ ^ ~a & v, A = d & g ^ ~d & w, q = dc(D, S, A, _u[O], _e[O]), N = hc(q, p, R, U, hu[O], he[O]), Wt = q | 0, te = Fe(f, c, 28) ^ hn(f, c, 34) ^ hn(f, c, 39), zt = Be(f, c, 28) ^ _n(f, c, 34) ^ _n(f, c, 39), E = f & u ^ f & n ^ u & n, rn = c & o ^ c & t ^ o & t;
      p = v | 0, D = w | 0, v = _ | 0, w = g | 0, _ = a | 0, g = d | 0, { h: a, l: d } = ae(e | 0, s | 0, N | 0, Wt | 0), e = n | 0, s = t | 0, n = u | 0, t = o | 0, u = f | 0, o = c | 0;
      const an = cc(Wt, zt, rn);
      f = uc(an, N, te, E), c = an | 0;
    }
    ({ h: f, l: c } = ae(this.Ah | 0, this.Al | 0, f | 0, c | 0)), { h: u, l: o } = ae(this.Bh | 0, this.Bl | 0, u | 0, o | 0), { h: n, l: t } = ae(this.Ch | 0, this.Cl | 0, n | 0, t | 0), { h: e, l: s } = ae(this.Dh | 0, this.Dl | 0, e | 0, s | 0), { h: a, l: d } = ae(this.Eh | 0, this.El | 0, a | 0, d | 0), { h: _, l: g } = ae(this.Fh | 0, this.Fl | 0, _ | 0, g | 0), { h: v, l: w } = ae(this.Gh | 0, this.Gl | 0, v | 0, w | 0), { h: p, l: D } = ae(this.Hh | 0, this.Hl | 0, p | 0, D | 0), this.set(f, c, u, o, n, t, e, s, a, d, _, g, v, w, p, D);
  }
  roundClean() {
    Ae(he, _e);
  }
  destroy() {
    Ae(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
const pu = /* @__PURE__ */ nc(() => new bu()), gu = pu;
Cn.sha512Sync = (...r) => gu(Cn.concatBytes(...r));
const pn = "kairos.witness.sk.v2", gn = "kairos.witness.label.v2", cs = "__kairos_store_v1__";
let yn = null, $n = null, Wn = null;
function yu(r) {
  let i = "";
  for (let l = 0; l < r.length; l++) i += String.fromCharCode(r[l]);
  return btoa(i);
}
function Ou(r) {
  const i = atob(r), l = new Uint8Array(i.length);
  for (let f = 0; f < i.length; f++) l[f] = i.charCodeAt(f);
  return l;
}
function Bs() {
  try {
    const r = String(window.name || "");
    if (!r.startsWith(cs)) return {};
    const i = JSON.parse(r.slice(cs.length));
    return i && typeof i == "object" ? i : {};
  } catch {
    return {};
  }
}
function Ja(r, i) {
  try {
    const l = Bs();
    l[r] = i, window.name = cs + JSON.stringify(l);
  } catch {
  }
}
function us(r) {
  try {
    return localStorage.getItem(r);
  } catch {
    return null;
  }
}
function Qa(r, i) {
  try {
    return localStorage.setItem(r, i), !0;
  } catch {
    return !1;
  }
}
function zn(r) {
  if (!r || typeof r != "string") return null;
  try {
    const i = Ou(r);
    return i.length === 32 ? i : null;
  } catch {
    return null;
  }
}
function to(r) {
  return `kairos-${String(r || "xxxx").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toLowerCase() || "node"}`;
}
function eo(r) {
  return to(r);
}
function wu() {
  if ($n?.length === 32) return $n;
  let r = zn(us(pn)) || zn(Bs()[pn]) || null;
  r || (r = zn(us("kairos.witness.sk"))), r || (r = uu.randomPrivateKey()), $n = r;
  const i = yu(r);
  return Qa(pn, i), Ja(pn, i), r;
}
function vu(r) {
  if (Wn) return Wn;
  const i = us(gn) || Bs()[gn] || null, l = i && String(i).trim() ? String(i).trim() : to(r);
  return Wn = l, Qa(gn, l), Ja(gn, l), l;
}
async function no() {
  if (yn) return yn;
  const r = wu(), i = await iu(r), l = tn.encode(i), f = vu(l);
  return yn = {
    secretKey: r,
    publicKey: i,
    nodeId: l,
    label: f,
    backend: "local"
  }, yn;
}
async function Pi() {
  const r = await no();
  return {
    nodeId: r.nodeId,
    label: r.label,
    backend: r.backend || "local",
    shortId: r.nodeId.slice(0, 12)
  };
}
function Ru(r) {
  const i = new TextEncoder(), l = [];
  for (const o of r)
    l.push(i.encode(String(o))), l.push(new Uint8Array([0]));
  const f = l.reduce((o, n) => o + n.length, 0), c = new Uint8Array(f);
  let u = 0;
  for (const o of l)
    c.set(o, u), u += o.length;
  return c;
}
async function so(r, i, l) {
  const f = await no(), c = new TextEncoder().encode(r), u = Ru([...i, f.nodeId, ...l]), o = new Uint8Array(c.length + u.length);
  o.set(c, 0), o.set(u, c.length);
  const n = await cu(o, f.secretKey);
  return {
    node_id: f.nodeId,
    wall_ms: l[0],
    monotonic_ms: l[1],
    uncertainty_ms: l[2],
    sig: tc(n)
  };
}
async function Ii({ wall_ms: r, monotonic_ms: i, uncertainty_ms: l }) {
  return so("kairos.pulse.v1\0", [], [
    r,
    i,
    l
  ]);
}
async function Ci(r, { wall_ms: i, monotonic_ms: l, uncertainty_ms: f }) {
  return so("kairos.stamp.observe.v1\0", [r], [
    i,
    l,
    f
  ]);
}
let On = null, se = null;
function Ui(r, i) {
  if (!r || !i || r.length !== i.length) return !1;
  for (let l = 0; l < r.length; l++) if (r[l] !== i[l]) return !1;
  return !0;
}
function Hs() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function Tu() {
  const r = new Uint8Array(32);
  return crypto.getRandomValues(r), Array.from(r);
}
function Ks(r, i = 2e4) {
  return new Promise((l, f) => {
    let c = !1;
    const u = (s) => {
      c || (c = !0, clearTimeout(o), e(), n(), t(), s());
    }, o = setTimeout(() => {
      u(() => f(new Error("delegate response timeout")));
    }, i), n = Kc((s) => u(() => f(s))), t = Hc((s) => u(() => f(s))), e = Fc((s) => {
      for (const a of s)
        r(a) && u(() => l(a));
    });
  });
}
async function ks(r) {
  const i = await Va(), l = Array.from(
    new TextEncoder().encode(JSON.stringify(r))
  ), f = await Promise.resolve().then(() => Na), {
    ClientRequestT: c,
    ClientRequestType: u,
    ApplicationMessagesT: o,
    DelegateKeyT: n,
    DelegateRequestType: t,
    InboundDelegateMsgT: e,
    InboundDelegateMsgType: s
  } = f, { ApplicationMessageT: a } = await Promise.resolve().then(() => Cc), d = new a(l, [], !1), _ = new e(
    s.common_ApplicationMessage,
    d
  ), g = new n(
    nn,
    We
  ), v = new o(g, [], [_]), w = new Zt.DelegateRequest(
    t.ApplicationMessages,
    v
  ), p = new c(
    u.DelegateRequest,
    w
  );
  i.sendRequest(p);
}
async function mu() {
  if (!Ba())
    throw new Error("kairos-identity constants missing — run scripts/build.sh");
  const r = zc, i = await fetch(r);
  if (!i.ok) throw new Error(`failed to fetch ${r}: ${i.status}`);
  const l = new Uint8Array(await i.arrayBuffer()), f = Array.from(bs(l));
  if (!Ui(f, We))
    throw new Error(
      "kairos-identity WASM BLAKE3 mismatch — rebuild + republish website"
    );
  const c = await Promise.resolve().then(() => Na), {
    ClientRequestT: u,
    ClientRequestType: o,
    DelegateRequestType: n,
    DelegateType: t,
    RegisterDelegateT: e,
    DelegateContainerT: s,
    WasmDelegateV1T: a,
    DelegateCodeT: d,
    DelegateKeyT: _
  } = c, g = new d(Array.from(l), We), v = new _(
    nn,
    We
  ), w = new a([], g, v), p = new s(
    t.WasmDelegateV1,
    w
  ), D = new e(
    p,
    Tu(),
    new Array(24).fill(0)
  ), O = new Zt.DelegateRequest(
    n.RegisterDelegate,
    D
  ), R = new u(
    o.DelegateRequest,
    O
  ), S = await Va(), U = new Promise((A, q) => {
    const N = setTimeout(() => {
      Wt(), q(new Error("RegisterDelegate kairos-identity timed out"));
    }, 45e3), Wt = Bc((te) => {
      const zt = te.key?.key;
      !zt || !Ui(zt, nn) || (clearTimeout(N), Wt(), A());
    });
  });
  S.sendRequest(R);
  try {
    await U;
  } catch (A) {
    try {
      await ro(8e3);
      return;
    } catch {
      throw A;
    }
  }
}
async function ro(r = 2e4) {
  const i = Hs(), l = Ks(
    (c) => (c.type === "Identity" || c.type === "Error") && (!c.nonce || c.nonce === i),
    r
  );
  await ks({ type: "EnsureIdentity", nonce: i });
  const f = await l;
  if (f.type === "Error")
    throw new Error(f.message || "EnsureIdentity failed");
  return se = {
    nodeId: f.node_id,
    label: f.label,
    backend: "delegate",
    created: !!f.created
  }, se;
}
async function sn(r) {
  if (se?.backend === "delegate") return se;
  if (!Ba())
    return r?.("Identity: local durable key (delegate not built)"), se = { ...await Pi(), backend: "local" }, se;
  try {
    return r?.("Registering kairos-identity delegate…"), On || (On = mu().catch((i) => {
      throw On = null, i;
    })), await On, r?.("Ensuring witness identity…"), await ro();
  } catch (i) {
    return console.warn("[kairos] delegate identity unavailable, using local:", i), r?.(
      `Identity: local fallback (${i instanceof Error ? i.message : String(i)})`
    ), se = { ...await Pi(), backend: "local" }, se;
  }
}
async function io(r) {
  return sn(r);
}
async function ju(r) {
  try {
    if (await sn(), se?.backend !== "delegate")
      return Ii(r);
    const i = Hs(), l = Ks(
      (c) => (c.type === "SignedObservation" || c.type === "Error") && c.nonce === i,
      2e4
    );
    await ks({
      type: "SignPulse",
      nonce: i,
      wall_ms: r.wall_ms,
      monotonic_ms: r.monotonic_ms,
      uncertainty_ms: r.uncertainty_ms
    });
    const f = await l;
    if (f.type === "Error") throw new Error(f.message || "SignPulse failed");
    return {
      node_id: f.node_id,
      wall_ms: f.wall_ms,
      monotonic_ms: f.monotonic_ms,
      uncertainty_ms: f.uncertainty_ms,
      sig: f.sig
    };
  } catch (i) {
    return console.warn("[kairos] SignPulse delegate failed, local fallback:", i), Ii(r);
  }
}
async function Du(r, i) {
  try {
    if (await sn(), se?.backend !== "delegate")
      return Ci(r, i);
    const l = Hs(), f = Ks(
      (u) => (u.type === "SignedObservation" || u.type === "Error") && u.nonce === l,
      2e4
    );
    await ks({
      type: "SignStampObserve",
      nonce: l,
      request_id: r,
      wall_ms: i.wall_ms,
      monotonic_ms: i.monotonic_ms,
      uncertainty_ms: i.uncertainty_ms
    });
    const c = await f;
    if (c.type === "Error")
      throw new Error(c.message || "SignStampObserve failed");
    return {
      node_id: c.node_id,
      wall_ms: c.wall_ms,
      monotonic_ms: c.monotonic_ms,
      uncertainty_ms: c.uncertainty_ms,
      sig: c.sig
    };
  } catch (l) {
    return console.warn(
      "[kairos] SignStampObserve delegate failed, local fallback:",
      l
    ), Ci(r, i);
  }
}
const ls = JSON.stringify({
  schema_version: 2,
  roster: {},
  pulse: {},
  open_stamps: {},
  sealed_stamps: {}
}), be = 36e5, Xn = 500, Su = 300, Zn = 10, Pu = 3, Ai = 168 * 36e5, Iu = 1, qi = 9e4;
function fs(r) {
  if (!r?.length)
    return JSON.parse(ls);
  const i = JSON.parse(new TextDecoder().decode(r));
  return i.roster = i.roster || {}, i.pulse = i.pulse || {}, i.open_stamps = i.open_stamps || i.open || {}, i.sealed_stamps = i.sealed_stamps || i.sealed || {}, i;
}
async function ye(r) {
  const i = Ma();
  if (!i || !Tn)
    throw new Error("Kairos constants missing — run scripts/build.sh");
  r?.("Looking up Kairos contract…");
  const l = await $c(i, { timeoutMs: 6e3 });
  if (l)
    return r?.("Kairos contract found — subscribing…"), await As(i, {
      fetchContract: !0,
      subscribe: !0,
      timeoutMs: 15e3
    }).catch(() => l), { key: i, created: !1, state: fs(l) };
  r?.("Kairos missing — publishing to this node…");
  const f = await fetch(zs);
  if (!f.ok)
    throw new Error(`failed to fetch ${zs}: ${f.status}`);
  const c = new Uint8Array(await f.arrayBuffer()), u = new TextEncoder().encode(ls), o = Ac(
    c,
    Tn,
    qa(),
    u
  );
  return await Wc(o, i), r?.("Kairos contract created on this node"), {
    key: i,
    created: !0,
    state: fs(new TextEncoder().encode(ls))
  };
}
async function qe() {
  const r = Ma(), i = await As(r, {
    fetchContract: !0,
    subscribe: !0,
    timeoutMs: 15e3
  });
  return fs(i);
}
async function ao(r) {
  const { key: i } = await ye(r);
  await sn(r);
  const l = Date.now(), f = typeof performance < "u" ? Math.floor(performance.now()) : 0, c = await ju({
    wall_ms: l,
    monotonic_ms: f,
    uncertainty_ms: 40
  });
  r?.("Submitting pulse…");
  const u = new TextEncoder().encode(JSON.stringify({ pulse: c }));
  return await qs(Us(i, u), i), c;
}
async function Cu(r, i, l) {
  const { key: f } = await ye(l), c = new TextEncoder().encode(
    JSON.stringify({
      open_stamp: { content_hash: r, nonce: i }
    })
  );
  return l?.("Opening stamp request…"), await qs(Us(f, c), f), `${r}:${i}`;
}
async function Uu(r, i) {
  const { key: l } = await ye(i);
  await sn(i);
  const f = Date.now(), c = typeof performance < "u" ? Math.floor(performance.now()) : 0, u = await Du(r, {
    wall_ms: f,
    monotonic_ms: c,
    uncertainty_ms: 40
  });
  i?.("Submitting stamp observation…");
  const o = new TextEncoder().encode(
    JSON.stringify({
      observe_stamp: { request_id: r, observation: u }
    })
  );
  return await qs(Us(l, o), l), u;
}
function Au(r) {
  const i = Object.values(r.pulse || {}), l = Object.values(r.roster || {}), f = l.filter(
    (e) => e.last_seen_ms - e.first_seen_ms >= be
  ).length;
  if (!i.length)
    return {
      witness_count: 0,
      eligible_count: f,
      roster_count: l.length,
      median_wall_ms: null,
      confidence_ms: null,
      median_abs_dev_ms: null,
      observations: [],
      sealed_count: Object.keys(r.sealed_stamps || {}).length,
      open_count: Object.keys(r.open_stamps || {}).length
    };
  const c = i.map((e) => e.wall_ms).sort((e, s) => e - s), u = Je(c), o = Je(
    i.map((e) => Math.abs(e.wall_ms - u)).sort((e, s) => e - s)
  ), n = Je(
    i.map((e) => e.uncertainty_ms).sort((e, s) => e - s)
  ), t = Math.max(n, Math.round(1.4826 * o), 1);
  return {
    witness_count: i.length,
    eligible_count: f,
    roster_count: l.length,
    median_wall_ms: u,
    confidence_ms: t,
    median_abs_dev_ms: o,
    observations: i.sort(
      (e, s) => Math.abs(e.wall_ms - u) - Math.abs(s.wall_ms - u)
    ),
    sealed_count: Object.keys(r.sealed_stamps || {}).length,
    open_count: Object.keys(r.open_stamps || {}).length
  };
}
function oo(r) {
  if (!r) return Xn;
  const i = Number(r.seals_included) || 0, l = Number(r.seals_outlier) || 0, f = i + l;
  if (!f) return Xn;
  const c = Math.floor(i * 1e3 / f), u = Math.min(f, Zn);
  return Math.floor((c * u + Xn * (Zn - u)) / Zn);
}
function qu(r, i) {
  if (!r) return 0;
  const l = i - r.first_seen_ms;
  if (l < be) return 0;
  const f = Math.max(1, oo(r)), c = Math.min(Math.max(0, l - be), Ai), u = 1e3 + Math.floor(c * 3e3 / Math.max(Ai, 1));
  return Math.min(64, Math.max(1, Math.floor(f * u / 1e5)));
}
function Mu(r) {
  if (!r.length) return null;
  const i = [...r].sort((u, o) => u.wall - o.wall), l = i.reduce((u, o) => u + o.weight, 0);
  if (!l) return i[Math.floor(i.length / 2)].wall;
  const f = Math.ceil(l / 2);
  let c = 0;
  for (const u of i)
    if (c += u.weight, c >= f) return u.wall;
  return i[i.length - 1].wall;
}
function Eu(r) {
  const i = r.roster || {}, l = Object.keys(r.sealed_stamps || {}).length, f = Object.values(r.pulse || {}), c = [];
  for (const d of f) {
    const _ = i[d.node_id];
    if (!_ || d.wall_ms - _.first_seen_ms < be || l >= Pu && oo(_) < Su)
      continue;
    const v = qu(_, d.wall_ms);
    v > 0 && c.push({ wall: d.wall_ms, weight: v, unc: d.uncertainty_ms, o: d });
  }
  let u = c, o = "aged";
  if (c.length < Iu && (u = f.map((d) => ({
    wall: d.wall_ms,
    weight: 1,
    unc: d.uncertainty_ms,
    o: d
  })), o = "bootstrap"), !u.length)
    return {
      median_wall_ms: null,
      confidence_ms: null,
      witness_count: 0,
      trusted_count: 0,
      trusted_mode: o,
      sealed_count: l
    };
  const n = Mu(u.map((d) => ({ wall: d.wall, weight: d.weight }))), t = u.map((d) => d.wall).sort((d, _) => d - _), e = Je(
    t.map((d) => Math.abs(d - n)).sort((d, _) => d - _)
  ), s = Je(u.map((d) => d.unc).sort((d, _) => d - _));
  let a = Math.max(s, Math.round(1.4826 * e), 1);
  return o === "bootstrap" && (a = Math.max(a, 5e3)), {
    median_wall_ms: n,
    confidence_ms: a,
    median_abs_dev_ms: e,
    witness_count: u.length,
    trusted_count: c.length,
    trusted_mode: o,
    sealed_count: l,
    observations: u.map((d) => d.o)
  };
}
function Je(r) {
  if (!r.length) return 0;
  const i = Math.floor(r.length / 2);
  return r.length % 2 ? r[i] : Math.round((r[i - 1] + r[i]) / 2);
}
const Rn = 5, Nu = 5, Lu = 8e3, co = "kairos.public.example.v1", uo = "v1", xt = `${co}:${uo}`;
async function Vu(r, i) {
  return r?.sealed_stamps?.[xt] || r?.open_stamps?.[xt] ? { opened: !1, request_id: xt } : (i?.("Opening public example stamp…"), await Cu(co, uo, i), { opened: !0, request_id: xt });
}
function ds(r, i, l = {}) {
  const f = i?.nodeId || null, c = f ? r.roster?.[f] : null, u = c ? c.last_seen_ms - c.first_seen_ms : 0, o = !!(c && u >= be), n = Object.entries(r.open_stamps || {}), t = l.maxObserve ?? Nu, e = o ? n.filter(([, d]) => !d.observations?.[f]).map(([d]) => d).slice(0, t) : [], s = [];
  l.pulse !== !1 && s.push({
    type: "pulse",
    reason: c ? "keep-alive + accrue roster age" : "join roster + keep-alive"
  });
  for (const d of e)
    s.push({
      type: "observe_stamp",
      request_id: d,
      reason: "age-eligible — help seal open request"
    });
  let a;
  return c ? o ? e.length ? a = `pulse + observe ${e.length} open` : n.length ? a = "pulse · eligible · already observed open" : a = "pulse · eligible · no open requests" : a = `pulse · aging ${u} / ${be} ms` : a = "pulse · join roster", {
    schema: "kairos.network.duty.v1",
    node_id: f,
    roster_age_ms: u,
    min_age_ms: be,
    stamp_eligible: o,
    open_count: n.length,
    sealed_count: Object.keys(r.sealed_stamps || {}).length,
    min_stamp_witnesses: Rn,
    actions: s,
    summary: a
  };
}
async function Fu(r, i = {}) {
  await ye(r);
  const l = await io(r), f = await qe();
  return {
    identity: l,
    state: f,
    plan: ds(f, l, i)
  };
}
async function Bu(r, i = {}) {
  await ye(r);
  const l = await io(r);
  let f = await qe(), c = { opened: !1, request_id: xt };
  if (i.ensureExample !== !1)
    try {
      c = await Vu(f, r), c.opened && (f = await qe());
    } catch (n) {
      c = {
        opened: !1,
        request_id: xt,
        error: n instanceof Error ? n.message : String(n)
      };
    }
  const u = ds(f, l, i), o = {
    identity: l,
    plan: u,
    pulsed: !1,
    observed: [],
    example: c,
    errors: [],
    state: f
  };
  for (const n of u.actions)
    try {
      n.type === "pulse" ? (r?.(u.summary), await ao(r), o.pulsed = !0) : n.type === "observe_stamp" && n.request_id && (r?.(`Observing ${n.request_id}…`), await Uu(n.request_id, r), o.observed.push(n.request_id));
    } catch (t) {
      o.errors.push({
        action: n,
        error: t instanceof Error ? t.message : String(t)
      });
    }
  return (o.pulsed || o.observed.length || c.opened) && (f = await qe(), o.state = f), o.plan_after = ds(f, l, {
    ...i,
    pulse: !1
  }), o;
}
function Hu(r = {}) {
  const {
    onDuty: i,
    onStatus: l,
    onError: f,
    intervalMs: c = Lu,
    runOnUpdate: u = !0
  } = r;
  let o = !1, n = !1, t = null, e = () => {
  }, s = null;
  async function a(d) {
    if (!o) {
      if (n) {
        t = d;
        return;
      }
      n = !0;
      try {
        let _;
        if (d === "update" || d === "queued-update") {
          const g = await Fu((v) => l?.(v, d));
          _ = {
            identity: g.identity,
            plan: g.plan,
            pulsed: !1,
            observed: [],
            example: { opened: !1, request_id: xt },
            errors: [],
            state: g.state,
            plan_after: g.plan
          };
        } else
          _ = await Bu((g) => l?.(g, d));
        o || i?.(_, d);
      } catch (_) {
        o || f?.(_);
      } finally {
        if (n = !1, t && !o) {
          const _ = t;
          t = null, a(_ === "update" ? "queued-update" : _);
        }
      }
    }
  }
  return (async () => {
    try {
      if (await ye(l), o) return;
      await qe(), u && (e = La(() => {
        a("update");
      })), await a("initial"), s = setInterval(() => void a("interval"), c);
    } catch (d) {
      o || f?.(d);
    }
  })(), () => {
    o = !0, e(), s && clearInterval(s);
  };
}
function Mi(r) {
  let i = 2166136261;
  for (let l = 0; l < r.length; l++)
    i ^= r.charCodeAt(l), i = Math.imul(i, 16777619);
  return (i >>> 0) % 1e6;
}
function lo(r, i = {}) {
  const l = Object.entries(r.sealed_stamps || {}).sort(
    (n, t) => (t[1].sealed_at_ms ?? t[1].median_wall_ms ?? 0) - (n[1].sealed_at_ms ?? n[1].median_wall_ms ?? 0)
  ), f = Eu(r), c = Date.now(), u = l.length, o = i.prev || null;
  if (f.median_wall_ms != null) {
    let n = f.median_wall_ms, t = !1, e = f.confidence_ms ?? 80;
    o?.otp_time_ms != null && Math.abs(n - o.otp_time_ms) > qi && (n = o.otp_time_ms, t = !0, e = Math.max(e, qi));
    const s = `pulse:${f.trusted_mode}:${n}:${f.trusted_count}`;
    return {
      sequence: Mi(s),
      sealed_at_ms: c,
      otp_time_ms: n,
      request_id: s,
      tip: s,
      source: t ? "pulse-hold" : f.trusted_mode === "bootstrap" ? "pulse-bootstrap" : "pulse",
      got_at_ms: c,
      pulse_witnesses: f.witness_count,
      trusted_count: f.trusted_count,
      trusted_mode: f.trusted_mode,
      jump_blocked: t,
      sealed_count: u,
      stamp: {
        median_wall_ms: n,
        confidence_ms: e,
        error_ms: e,
        median_abs_dev_ms: f.median_abs_dev_ms,
        witness_count: f.witness_count,
        source: "pulse"
      }
    };
  }
  if (l.length) {
    const [n, t] = l[0], e = t.median_wall_ms, s = `sealed:${n}:${e}`;
    return {
      sequence: Mi(s),
      sealed_at_ms: t.sealed_at_ms ?? c,
      otp_time_ms: e,
      request_id: n,
      tip: s,
      source: "sealed",
      got_at_ms: c,
      pulse_witnesses: 0,
      sealed_count: u,
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
async function zu(r, i = {}) {
  await ye(r), i.pulse === !0 && (r?.("Pulsing keep-alive…"), await ao(r).catch(() => null)), r?.("Getting Kairos contract…");
  const l = await qe();
  return lo(l, { prev: i.prev || null });
}
function Xu(r = {}) {
  const { onClock: i, onStatus: l, onError: f } = r;
  let c = !1, u = !1, o = !1, n = () => {
  }, t = null;
  async function e(s) {
    if (!c) {
      if (u) {
        o = !0;
        return;
      }
      u = !0;
      try {
        l?.(
          s === "update" ? "Contract update — refreshing tip…" : "Getting Kairos (subscribe)…"
        );
        const a = await qe();
        if (c) return;
        const d = lo(a, { prev: t });
        d.jump_blocked || (t = d), i?.(d, s);
      } catch (a) {
        c || f?.(a);
      } finally {
        u = !1, o && !c && (o = !1, e("queued"));
      }
    }
  }
  return (async () => {
    try {
      if (await ye(l), c) return;
      n = La(() => {
        e("update");
      }), await e("initial");
    } catch (s) {
      c || f?.(s);
    }
  })(), () => {
    c = !0, n();
  };
}
function Gs(r) {
  return new Date(r).toISOString();
}
function Ku(r) {
  return r == null ? "—" : r < 1e3 ? `±${r} ms` : `±${(r / 1e3).toFixed(2)} s`;
}
function ku(r) {
  return r < 6e4 ? `${Math.round(r / 1e3)}s` : r < 36e5 ? `${Math.round(r / 6e4)}m` : r < 864e5 ? `${(r / 36e5).toFixed(1)}h` : `${(r / 864e5).toFixed(1)}d`;
}
function ke(r) {
  return String(r).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function fo(r) {
  return Object.entries(r.sealed_stamps || {}).sort((i, l) => {
    const f = i[1]?.sealed_at_ms ?? i[1]?.median_wall_ms ?? 0;
    return (l[1]?.sealed_at_ms ?? l[1]?.median_wall_ms ?? 0) - f;
  });
}
function Gu(r, i, l) {
  if (!i) return;
  const f = fo(r).slice(0, 12);
  if (!f.length) {
    i.innerHTML = '<p class="lede" style="font-size:0.9rem">No sealed stamps yet — witnesses appear here after a seal.</p>';
    return;
  }
  const c = [];
  for (const [u, o] of f) {
    const n = Array.isArray(o.witness_ids) ? o.witness_ids : [], t = o.error_ms ?? o.confidence_ms ?? "—", e = u === xt ? ' <span class="seal-tag">example</span>' : "", s = `
      <div class="seal-id-block">
        <button type="button" class="witness-key seal-id-btn" data-node-id="${ke(u)}" title="Copy seal request id">${ke(u)}</button>${e}
        <span class="seal-meta">${Gs(o.median_wall_ms)} · ±${t}ms · n=${o.witness_count ?? n.length}</span>
        <span class="seal-meta mono">tx ${ke(o.transcript_digest || "—")}</span>
      </div>`;
    if (!n.length) {
      c.push(`<tr>
        <td>${s}</td>
        <td class="seal-witness-cell"><span class="muted">no witness_ids</span></td>
      </tr>`);
      continue;
    }
    const a = n.map((d) => {
      const _ = l && d === l.nodeId ? " (you)" : "", g = eo(d), v = `${d.slice(0, 12)}…`;
      return `<li>
          <span class="witness-label">${ke(g)}${_}</span>
          <button type="button" class="witness-key" data-node-id="${ke(d)}" title="Copy full node id">${ke(v)}</button>
        </li>`;
    }).join("");
    c.push(`<tr>
      <td>${s}</td>
      <td class="seal-witness-cell"><ul class="seal-witness-ids">${a}</ul></td>
    </tr>`);
  }
  i.innerHTML = `
    <table class="seal-witness-table">
      <thead>
        <tr><th scope="col">Seal</th><th scope="col">Witnesses</th></tr>
      </thead>
      <tbody>${c.join("")}</tbody>
    </table>`;
}
function xu(r, i, l, f = null) {
  if (!i || !l) return;
  const c = r.sealed_stamps || {}, u = r.open_stamps || {}, o = Object.entries(u), n = fo(r), t = u[xt], s = c[xt] ? "example sealed" : t ? `example open ${Object.keys(t.observations || {}).length}/${Rn}` : "example missing";
  i.innerHTML = `
    <div class="metric"><span class="label">Sealed count</span><span class="value">${n.length}</span></div>
    <div class="metric"><span class="label">Open requests</span><span class="value">${o.length}</span></div>
    <div class="metric"><span class="label">Example stamp</span><span class="value small">${s}</span></div>
    <div class="metric"><span class="label">Duty</span><span class="value small">${f || "—"}</span></div>
  `;
  const a = o.length ? o.slice(0, 6).map(([d, _]) => {
    const g = Object.keys(_.observations || {}).length;
    return `open ${d}${d === xt ? " (public example)" : ""} · ${g}/${Rn} observes`;
  }).join(`
`) : "No open stamp requests.";
  if (!n.length) {
    l.textContent = `${a}

No sealed stamps yet. Need ≥${Rn} distinct aged observes (example id ${xt}).`;
    return;
  }
  l.textContent = [
    a,
    "",
    ...n.slice(0, 8).map(([d, _]) => {
      const g = _.error_ms ?? _.confidence_ms;
      return [
        `${d}${d === xt ? " (public example)" : ""}`,
        `  median=${Gs(_.median_wall_ms)} error=±${g}ms`,
        `  interval=[${_.earliest_ms ?? "?"} … ${_.latest_ms ?? "?"}]`,
        `  witnesses=${_.witness_count} transcript=${_.transcript_digest || "—"}`
      ].join(`
`);
    })
  ].join(`
`);
}
function Ei(r) {
  const i = r?.result || r;
  if (!i?.state) return;
  const l = document.getElementById("mode-pill"), f = document.getElementById("identity-status"), c = document.getElementById("live-status"), u = document.getElementById("metrics"), o = document.getElementById("witnesses"), n = document.getElementById("sealed-metrics"), t = document.getElementById("sealed-list"), e = document.getElementById("seal-witnesses");
  if (!u || !o) return;
  const s = i.state, a = i.identity, d = Au(s), _ = i.plan?.summary || "—";
  c && (i.errors?.length ? (c.hidden = !1, c.textContent = i.errors.map((w) => w.error).join("; ")) : (c.hidden = !0, c.textContent = "")), l && (l.textContent = "Live Freenet · duty", l.classList.add("live-pill")), f && a && (f.textContent = `${a.label} · via ${a.backend} · ${_}`), u.innerHTML = `
    <div class="metric"><span class="label">Median pulse</span><span class="value small">${d.median_wall_ms != null ? Gs(d.median_wall_ms) : "—"}</span></div>
    <div class="metric"><span class="label">Pulse spread</span><span class="value">${Ku(d.confidence_ms)}</span></div>
    <div class="metric"><span class="label">Live pulses</span><span class="value">${d.witness_count}</span></div>
    <div class="metric"><span class="label">Roster / eligible</span><span class="value small">${d.roster_count} / ${d.eligible_count}</span></div>
    <div class="metric"><span class="label">Sealed stamps</span><span class="value">${d.sealed_count}</span></div>
    <div class="metric"><span class="label">Open stamps</span><span class="value">${d.open_count}</span></div>
  `;
  const g = d.median_wall_ms ?? 0, v = Math.max(
    ...d.observations.map((w) => Math.abs(w.wall_ms - g)),
    1
  );
  o.innerHTML = d.observations.length ? d.observations.map((w) => {
    const p = Math.abs(w.wall_ms - g), D = Math.max(8, 100 - p / v * 100), O = s.roster?.[w.node_id], R = O ? ku(O.last_seen_ms - O.first_seen_ms) : "?", S = O && O.last_seen_ms - O.first_seen_ms >= be ? "✓" : "·", U = a && w.node_id === a.nodeId ? " (you)" : "", A = eo(w.node_id), q = `${w.node_id.slice(0, 12)}…`;
    return `<li>
            <div class="witness-id">
              <span class="witness-label">${A}${U}</span>
              <button type="button" class="witness-key" data-node-id="${w.node_id}" title="Copy full node id">${q}</button>
            </div>
            <span class="bar" title="drift ${p} ms"><i style="width:${D}%"></i></span>
            <span class="witness-meta">${S} age ${R} · Δ${p}ms</span>
          </li>`;
  }).join("") : '<li><span class="id">none yet</span><span></span><span>waiting for pulses</span></li>', xu(s, n, t, _), Gu(s, e, a);
}
function Ni(r) {
  r?.addEventListener("click", (i) => {
    const l = i.target?.closest?.(".witness-key");
    if (!l || !r.contains(l)) return;
    const f = l.getAttribute("data-node-id");
    f && navigator.clipboard.writeText(f).then(
      () => {
        l.dataset.copied = "1";
        const c = l.textContent;
        l.textContent = "copied", setTimeout(() => {
          l.dataset.copied = "0", l.textContent = c;
        }, 1100);
      },
      () => {
        l.textContent = "copy failed";
      }
    );
  });
}
function $u() {
  const r = document.getElementById("mode-pill"), i = document.getElementById("witnesses"), l = document.getElementById("seal-witnesses");
  r && (r.textContent = "Waiting for site duty…");
  const f = (c) => {
    Ei(c.detail);
  };
  return window.addEventListener("kairos-duty", f), globalThis.__kairosLastDuty && Ei(globalThis.__kairosLastDuty), Ni(i), Ni(l), () => {
    window.removeEventListener("kairos-duty", f);
  };
}
function Zu() {
  return globalThis.__kairosSiteDutyStop || (globalThis.__kairosSiteDutyStop = Hu({
    onDuty: (r, i) => {
      const l = { result: r, reason: i };
      globalThis.__kairosLastDuty = l, globalThis.dispatchEvent(
        new CustomEvent("kairos-duty", { detail: l })
      );
    },
    onError: (r) => {
      console.warn("[kairos] network duty:", r), globalThis.dispatchEvent(
        new CustomEvent("kairos-duty-error", {
          detail: r instanceof Error ? r.message : String(r)
        })
      );
    }
  })), globalThis.__kairosSiteDutyStop;
}
function Yu() {
  return $u();
}
export {
  co as EXAMPLE_STAMP_CONTENT_HASH,
  xt as EXAMPLE_STAMP_ID,
  uo as EXAMPLE_STAMP_NONCE,
  Rn as MIN_STAMP_WITNESSES,
  lo as clockFromKairosState,
  Vu as ensureExampleStamp,
  ye as ensureKairosExists,
  Zu as ensureSiteNetworkDuty,
  qe as fetchKairosState,
  zu as fetchOtpNetworkClock,
  io as getKairosIdentitySummary,
  Yu as mountTelemetryPage,
  Uu as observeStamp,
  La as onContractUpdate,
  Cu as openStamp,
  ds as planNetworkDuty,
  Au as pulseStats,
  Fu as queryNetworkDuty,
  Bu as runNetworkDuty,
  ao as submitPulse,
  Hu as watchNetworkDuty,
  Xu as watchOtpNetworkClock
};
//# sourceMappingURL=live.bundle.js.map
