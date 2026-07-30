/**
 * Kairos site helpers — simulated oracle until the Freenet contract ships.
 * Demo only: browser-local witnesses, not network consensus.
 */

const DEMO_WITNESSES = [
  "gw-a3f1",
  "peer-9c2e",
  "peer-1b77",
  "edge-44aa",
  "hub-0df2",
  "leaf-b819",
  "node-71ce",
  "node-e2a0",
  "relay-55f3",
  "core-88bd",
  "peer-c01d",
  "edge-2afe",
];

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function median(sorted) {
  if (!sorted.length) return 0;
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[m]
    : (sorted[m - 1] + sorted[m]) / 2;
}

function trimmedMean(values, fraction = 0.2) {
  const sorted = [...values].sort((a, b) => a - b);
  const drop = Math.floor(sorted.length * fraction);
  const slice = sorted.slice(drop, sorted.length - drop || undefined);
  if (!slice.length) return median(sorted);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function mad(values, med) {
  const devs = values.map((v) => Math.abs(v - med)).sort((a, b) => a - b);
  return median(devs);
}

/**
 * Persistent demo witness network — biases random-walk; occasional pulses
 * mimic out-of-sync nodes so median / confidence wobble like a real feed.
 */
const demoWitnesses = DEMO_WITNESSES.map((id) => ({
  id,
  bias_ms: (Math.random() - 0.5) * 120,
  pulse_ms: 0,
}));
let lastWitnessStepAt = 0;

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function stepDemoWitnessNetwork(dtMs) {
  const dt = clamp(dtMs, 0, 15_000) / 1000;
  for (const w of demoWitnesses) {
    // Organic clock wander + mean reversion
    w.bias_ms += (Math.random() - 0.5) * 55 * dt;
    w.bias_ms *= Math.pow(0.92, dt);
    w.bias_ms = clamp(w.bias_ms, -900, 900);
    // Shock decays over ~1s
    w.pulse_ms *= Math.pow(0.45, dt);
    if (Math.abs(w.pulse_ms) < 8) w.pulse_ms = 0;
  }
  // Probability of slightly / more aggressive desync this seal
  const roll = Math.random();
  if (roll < 0.22) {
    const count = roll < 0.07 ? 2 + Math.floor(Math.random() * 2) : 1;
    for (let i = 0; i < count; i++) {
      const w = demoWitnesses[Math.floor(Math.random() * demoWitnesses.length)];
      // Mild ~0.4–1.2s or aggressive ~2–7s skew
      const aggressive = Math.random() < 0.35;
      const mag = aggressive
        ? 2000 + Math.random() * 5000
        : 400 + Math.random() * 800;
      w.pulse_ms += Math.random() < 0.5 ? mag : -mag;
    }
  }
  // Rare shared skew (many nodes nudged together)
  if (Math.random() < 0.05) {
    const skew = (Math.random() - 0.5) * 500;
    for (const w of demoWitnesses) w.bias_ms += skew;
  }
  persistWitnessState();
}

function persistWitnessState() {
  try {
    storageSet(
      DEMO_WITNESS_KEY,
      JSON.stringify({
        step_at: lastWitnessStepAt,
        witnesses: demoWitnesses.map((w) => ({
          bias_ms: w.bias_ms,
          pulse_ms: w.pulse_ms,
        })),
      }),
    );
  } catch {
    /* */
  }
}

function hydrateWitnessState() {
  try {
    const raw = storageGet(DEMO_WITNESS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    const list = data?.witnesses;
    if (!Array.isArray(list) || list.length !== demoWitnesses.length) return;
    for (let i = 0; i < list.length; i++) {
      demoWitnesses[i].bias_ms = Number(list[i].bias_ms) || 0;
      demoWitnesses[i].pulse_ms = Number(list[i].pulse_ms) || 0;
    }
    lastWitnessStepAt = Number(data.step_at) || 0;
  } catch {
    /* */
  }
}

/** Simulated seal for a content hash string. */
export function simulateStamp(contentHash, seedHint = Date.now()) {
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // const seed = [...String(contentHash)].reduce(...) + (seedHint|0);
  // const rnd = mulberry32(seed);
  // const center = Date.now();
  // observations: independent ±90ms noise + rare fixed outlier on i===3
  // NEW CODE - TESTING: stateful witness drift + random desync pulses
  const now = Date.now();
  const dt = lastWitnessStepAt ? now - lastWitnessStepAt : 1200;
  lastWitnessStepAt = now;
  stepDemoWitnessNetwork(dt);

  const observations = demoWitnesses.map((w) => {
    const jitter = (Math.random() - 0.5) * 35;
    const wall = Math.round(now + w.bias_ms + w.pulse_ms + jitter);
    const shock = Math.abs(w.pulse_ms);
    return {
      node_id: w.id,
      wall_ms: wall,
      uncertainty_ms: Math.round(
        22 + Math.abs(w.bias_ms) * 0.04 + shock * 0.015 + Math.random() * 50,
      ),
      monotonic_ms: Math.round(1e6 + Math.random() * 5e5),
      demo_bias_ms: Math.round(w.bias_ms),
      demo_pulse_ms: Math.round(w.pulse_ms),
    };
  });

  void contentHash;
  void seedHint;

  const walls = observations.map((o) => o.wall_ms).sort((a, b) => a - b);
  const med = median(walls);
  const m = mad(
    observations.map((o) => o.wall_ms),
    med,
  );
  const filtered = observations.filter(
    (o) => m === 0 || Math.abs(o.wall_ms - med) <= 5 * m,
  );
  const fw = filtered.map((o) => o.wall_ms).sort((a, b) => a - b);
  const med2 = median(fw);
  const mad2 = mad(
    filtered.map((o) => o.wall_ms),
    med2,
  );
  const uncMed = median(
    filtered.map((o) => o.uncertainty_ms).sort((a, b) => a - b),
  );
  const confidence = Math.max(uncMed, Math.round(1.4826 * mad2), 1);

  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // return {
  //   content_hash: contentHash,
  //   median_wall_ms: Math.round(med2),
  //   trimmed_mean_ms: Math.round(trimmedMean(fw)),
  //   confidence_ms: confidence,
  //   median_abs_dev_ms: Math.round(mad2),
  //   witness_count: filtered.length,
  //   observations: filtered.sort(...),
  //   demo: true,
  // };
  // NEW CODE - TESTING: error interval + transcript for notarize / feed apps
  const median_wall_ms = Math.round(med2);
  const error_ms = confidence;
  const sortedObs = filtered.sort(
    (a, b) => Math.abs(a.wall_ms - med2) - Math.abs(b.wall_ms - med2),
  );
  return {
    content_hash: contentHash,
    median_wall_ms,
    trimmed_mean_ms: Math.round(trimmedMean(fw)),
    confidence_ms: confidence,
    error_ms,
    earliest_ms: Math.max(0, median_wall_ms - error_ms),
    latest_ms: median_wall_ms + error_ms,
    median_abs_dev_ms: Math.round(mad2),
    witness_count: filtered.length,
    transcript_digest: transcriptDigestFromObservations(sortedObs),
    observations: sortedObs,
    demo: true,
  };
}

export function formatIso(ms) {
  return new Date(ms).toISOString();
}

export function formatConfidence(ms) {
  if (ms < 1000) return `±${ms} ms`;
  return `±${(ms / 1000).toFixed(2)} s`;
}

/** FNV-1a-64 hex — matches contract `transcript_digest` binding. */
export function transcriptDigestFromObservations(observations = []) {
  const lines = observations
    .map(
      (o) =>
        `${o.node_id}|${o.wall_ms}|${o.uncertainty_ms}|${o.sig ?? ""}`,
    )
    .sort();
  let h = 0xcbf29ce484222325n;
  const mul = 0x100000001b3n;
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      h ^= BigInt(line.charCodeAt(i) & 0xff);
      h = (h * mul) & 0xffffffffffffffffn;
    }
    h ^= 0xffn;
    h = (h * mul) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, "0");
}

/**
 * Byztime-style: seal half-width grows with local age since Get/seal.
 * Does not advance wall time — only widens the dependable interval.
 */
export function effectiveErrorMs(
  stamp,
  { sealedAtMs = null, nowMs = Date.now(), growth = 0.35 } = {},
) {
  const base = Math.max(
    1,
    stamp?.error_ms ?? stamp?.confidence_ms ?? 80,
  );
  const sealed = sealedAtMs ?? stamp?.sealed_at_ms ?? nowMs;
  const stale = Math.max(0, nowMs - sealed);
  return Math.round(base + stale * growth);
}

export function effectiveInterval(stamp, opts = {}) {
  const med = stamp?.median_wall_ms ?? 0;
  const err = effectiveErrorMs(stamp, opts);
  return {
    median_wall_ms: med,
    error_ms: err,
    earliest_ms: Math.max(0, med - err),
    latest_ms: med + err,
  };
}

/** Portable notary receipt for apps (existence + interval + transcript). */
export function buildNotaryReceipt({
  request_id,
  stamp,
  sealed_at_ms = null,
  sequence = null,
  contract_key = null,
  source = "kairos",
} = {}) {
  const s = stamp || {};
  const error_ms = Math.max(1, s.error_ms ?? s.confidence_ms ?? 1);
  const median = s.median_wall_ms ?? 0;
  return {
    schema: "kairos.notary.receipt.v1",
    source,
    request_id: request_id ?? null,
    contract_key: contract_key ?? null,
    sequence: sequence ?? null,
    sealed_at_ms: sealed_at_ms ?? s.sealed_at_ms ?? null,
    content_hash: s.content_hash ?? null,
    nonce: s.nonce ?? null,
    median_wall_ms: median,
    confidence_ms: s.confidence_ms ?? error_ms,
    error_ms,
    earliest_ms: s.earliest_ms ?? Math.max(0, median - error_ms),
    latest_ms: s.latest_ms ?? median + error_ms,
    median_abs_dev_ms: s.median_abs_dev_ms ?? null,
    witness_count: s.witness_count ?? null,
    witness_ids: s.witness_ids ?? null,
    transcript_digest: s.transcript_digest ?? null,
    demo: !!s.demo,
  };
}

/** Claim time must not be before the (possibly widened) interval starts. */
export function assertNotBefore(claimMs, stamp, opts = {}) {
  const { earliest_ms } = effectiveInterval(stamp, opts);
  return claimMs >= earliest_ms;
}

/** Claim time must not be after the (possibly widened) interval ends. */
export function assertNotAfter(claimMs, stamp, opts = {}) {
  const { latest_ms } = effectiveInterval(stamp, opts);
  return claimMs <= latest_ms;
}

/** Base32 (RFC 4648) without padding — for otpauth secrets. */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function randomBase32(byteLen = 20) {
  const bytes = new Uint8Array(byteLen);
  crypto.getRandomValues(bytes);
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(str) {
  const clean = str.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

async function hmacSha1(keyBytes, msgBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, msgBytes);
  return new Uint8Array(sig);
}

const DEMO_ORACLE_KEY = "kairos.demo.oracle.v3";
const DEMO_ORACLE_CHANNEL = "kairos-demo-oracle-v3";
const DEMO_ORACLE_LEADER_KEY = "kairos.demo.oracle.leader.v3";
const DEMO_WITNESS_KEY = "kairos.demo.witnesses.v3";
const DEMO_OBS_KEY = "kairos.demo.obs.v3";
const DEMO_SEQ_KEY = "kairos.demo.seq.v3";
/** Authenticator-app view of the network (own Get snapshot) — not the contract feed. */
const AUTH_CLOCK_KEY = "kairos.otp.auth-clock.v3";
const AUTH_SESSION_KEY = "kairos.otp.auth-session.v3";
/** Bump to defeat Freenet / browser module cache. */
export const KAIROS_ASSET_V = "20260730x";

/** How fast local age widens seal error after Get (Byztime-style). */
export const OTP_STALE_GROWTH = 0.35;
// Demo stand-in for Freenet seal cadence — real seals are slower / request-driven.
// OLD CODE - KEEP UNTIL CONFIRMED WORKING
// export const DEMO_SEAL_INTERVAL_MS = 20_000;
// export const DEMO_SEAL_INTERVAL_MS = 5_000;
// NEW CODE - TESTING: after each seal, re-queue next in [min,max] (not a metronome)
export const DEMO_SEAL_MIN_MS = 1_000;
export const DEMO_SEAL_MAX_MS = 4_000;
/** Typical / meter fallback (midpoint of random re-queue window). */
export const DEMO_SEAL_INTERVAL_MS = Math.round(
  (DEMO_SEAL_MIN_MS + DEMO_SEAL_MAX_MS) / 2,
);
// OLD CODE - KEEP UNTIL CONFIRMED WORKING
// const DEMO_LEADER_TTL_MS = 45_000;
// NEW CODE - TESTING: shorter so a dead lock can't blank the OTP UI for long
const DEMO_LEADER_TTL_MS = 12_000;
const DEMO_HEARTBEAT_MS = 3_000;

/**
 * Freenet `__sandbox=1` denies localStorage/sessionStorage (null origin).
 * GitForge hits the same wall. Survive same-tab navigations via:
 *   1) in-memory Map (alive while this JS realm lives)
 *   2) window.name JSON bag (survives full document loads in the same tab)
 *   3) Web Storage when the host actually allows it
 */
const memoryStore = new Map();
const NAME_BAG_PREFIX = "__kairos_store_v1__";
let webStorageOk = null;

function probeWebStorage() {
  if (webStorageOk != null) return webStorageOk;
  try {
    const k = "__kairos_probe__";
    sessionStorage.setItem(k, "1");
    webStorageOk = sessionStorage.getItem(k) === "1";
    sessionStorage.removeItem(k);
  } catch {
    webStorageOk = false;
  }
  return webStorageOk;
}

function readNameBag() {
  try {
    const n = String(window.name || "");
    if (!n.startsWith(NAME_BAG_PREFIX)) return {};
    const parsed = JSON.parse(n.slice(NAME_BAG_PREFIX.length));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeNameBag(bag) {
  try {
    window.name = NAME_BAG_PREFIX + JSON.stringify(bag);
  } catch {
    /* */
  }
}

function hydrateMemoryFromNameBag() {
  const bag = readNameBag();
  for (const [k, v] of Object.entries(bag)) {
    if (!memoryStore.has(k) && typeof v === "string") {
      memoryStore.set(k, v);
    }
  }
}

function storageGet(key) {
  if (memoryStore.has(key)) return memoryStore.get(key);
  if (probeWebStorage()) {
    try {
      const s = sessionStorage.getItem(key);
      if (s != null) {
        memoryStore.set(key, s);
        return s;
      }
    } catch {
      /* */
    }
    try {
      const s = localStorage.getItem(key);
      if (s != null) {
        memoryStore.set(key, s);
        return s;
      }
    } catch {
      /* */
    }
  }
  const bag = readNameBag();
  if (typeof bag[key] === "string") {
    memoryStore.set(key, bag[key]);
    return bag[key];
  }
  return null;
}

function storageSet(key, value) {
  memoryStore.set(key, value);
  const bag = readNameBag();
  bag[key] = value;
  writeNameBag(bag);
  if (!probeWebStorage()) return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* */
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    /* */
  }
}

function storageRemove(key) {
  memoryStore.delete(key);
  const bag = readNameBag();
  delete bag[key];
  writeNameBag(bag);
  if (!probeWebStorage()) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* */
  }
  try {
    localStorage.removeItem(key);
  } catch {
    /* */
  }
}

// Pull any prior-tab-navigation state before first oracle read.
hydrateMemoryFromNameBag();

function slimStamp(stamp) {
  if (!stamp) return stamp;
  return {
    content_hash: stamp.content_hash,
    nonce: stamp.nonce,
    median_wall_ms: stamp.median_wall_ms,
    trimmed_mean_ms: stamp.trimmed_mean_ms,
    confidence_ms: stamp.confidence_ms,
    error_ms: stamp.error_ms ?? stamp.confidence_ms,
    earliest_ms: stamp.earliest_ms,
    latest_ms: stamp.latest_ms,
    median_abs_dev_ms: stamp.median_abs_dev_ms,
    witness_count: stamp.witness_count,
    transcript_digest: stamp.transcript_digest ?? null,
    source: stamp.source ?? null,
    demo: !!stamp.demo,
  };
}

/** Never persist observations on the main oracle record (quota resets). */
function slimOracleRecord(rec) {
  if (!rec) return rec;
  const history = Array.isArray(rec.history)
    ? rec.history.map((h) => ({
        sequence: h.sequence,
        sealed_at_ms: h.sealed_at_ms,
        request_id: h.request_id,
        stamp: slimStamp(h.stamp),
      }))
    : [];
  return {
    running: !!rec.running,
    sequence: rec.sequence,
    sealed_at_ms: rec.sealed_at_ms,
    otp_time_ms: rec.otp_time_ms,
    request_id: rec.request_id,
    stamp: slimStamp(rec.stamp),
    history,
    next_seal_due_ms: rec.next_seal_due_ms,
    next_seal_delay_ms: rec.next_seal_delay_ms,
  };
}

function readPersistedSeq() {
  const raw = storageGet(DEMO_SEQ_KEY);
  const n = raw != null ? Number(raw) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function writePersistedSeq(seq) {
  if (seq == null || !Number.isFinite(Number(seq))) return;
  storageSet(DEMO_SEQ_KEY, String(seq));
}

// Resume witness drift across page navigations (same origin).
hydrateWitnessState();

/**
 * Site-wide demo oracle — shared contract-feed simulation (puts).
 * Demo page + OTP verify Get this. Survives nav via session+local storage.
 */
let demoOracleSeq = readPersistedSeq();
let demoSealTimer = null;
let demoHeartbeatTimer = null;
let demoIsLeader = false;
let lastTickAtMs = 0;
let memoryOracle = null;
/** When the leader next intends to seal (for UI liveness meter). */
let nextSealDueMs = 0;
/** Last chosen re-queue delay (1–4s). */
let lastSealDelayMs = DEMO_SEAL_INTERVAL_MS;
let siteOracleChromeMounted = false;
const demoLeaderId = `tab-${Math.random().toString(36).slice(2, 10)}`;
const demoListeners = new Set();
let demoContentHash = "kairos:demo:stream";

function randomSealDelayMs() {
  return Math.round(
    DEMO_SEAL_MIN_MS +
      Math.random() * (DEMO_SEAL_MAX_MS - DEMO_SEAL_MIN_MS),
  );
}

function readLatestObservations() {
  try {
    const raw = storageGet(DEMO_OBS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLatestObservations(observations) {
  if (!observations) return;
  try {
    storageSet(DEMO_OBS_KEY, JSON.stringify(observations));
  } catch {
    /* */
  }
}

export function readDemoOracle() {
  try {
    const raw = storageGet(DEMO_ORACLE_KEY);
    if (raw) {
      memoryOracle = JSON.parse(raw);
    }
  } catch {
    /* storage blocked */
  }
  if (!memoryOracle) return null;
  // Reattach latest witnesses for Demo page after navigation (slim persist)
  if (memoryOracle.stamp && !memoryOracle.stamp.observations) {
    const obs = readLatestObservations();
    if (obs) {
      return {
        ...memoryOracle,
        stamp: { ...memoryOracle.stamp, observations: obs },
      };
    }
  }
  return memoryOracle;
}

/**
 * Independent Get of the shared demo contract feed.
 * Does not use the authenticator clock — stand-in for Freenet Get.
 */
export function getDemoContractState() {
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // memoryOracle = null; // wiped tip on sandbox when durable read lagged
  // NEW CODE - TESTING: refresh from store without discarding memory tip
  try {
    const raw = storageGet(DEMO_ORACLE_KEY);
    if (raw) memoryOracle = JSON.parse(raw);
  } catch {
    /* */
  }
  return readDemoOracle();
}

/** Wait until demo put sequence advances past minSeq (verifier Get ≠ auth snapshot). */
export async function getDemoContractStateAfter(
  minSeq,
  timeoutMs = 8_000,
) {
  const deadline = Date.now() + timeoutMs;
  let live = getDemoContractState();
  while (Date.now() < deadline) {
    live = getDemoContractState();
    if (
      live?.stamp &&
      live.sequence != null &&
      Number(live.sequence) > Number(minSeq)
    ) {
      return live;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return live;
}

/** Persist slim record; notify with optional richer payload (e.g. observations). */
function writeDemoOracle(persistRecord, notifyRecord = persistRecord) {
  const slim = slimOracleRecord(persistRecord);
  memoryOracle = notifyRecord;
  try {
    storageSet(DEMO_ORACLE_KEY, JSON.stringify(slim));
  } catch {
    /* */
  }
  if (slim?.sequence != null) writePersistedSeq(slim.sequence);
  if (notifyRecord?.stamp?.observations) {
    writeLatestObservations(notifyRecord.stamp.observations);
  }
  for (const fn of demoListeners) {
    try {
      fn(notifyRecord);
    } catch {
      /* */
    }
  }
  try {
    new BroadcastChannel(DEMO_ORACLE_CHANNEL).postMessage(notifyRecord);
  } catch {
    /* */
  }
  return true;
}

export function lifetimeMsForConfidence(confidence_ms) {
  return Math.min(5 * 60_000, Math.max(45_000, confidence_ms * 600));
}

export function stepMsForConfidence(confidence_ms) {
  return Math.max(30_000, confidence_ms * 4);
}

/** One seal tick — mimics open→witness→MAD→seal for a rolling demo stream. */
export function tickDemoOracle(contentHash = demoContentHash) {
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // if (!demoIsLeader) return readDemoOracle();
  // NEW CODE - TESTING: only leader seals; bootstrap claim if feed is empty
  if (!demoIsLeader) {
    const empty = !readDemoOracle()?.stamp;
    if (empty && claimLeader()) {
      demoIsLeader = true;
      // fall through and seal once; caller / startSealingLoop re-queues
    } else {
      return readDemoOracle();
    }
  }
  const now = Date.now();
  const prev = readDemoOracle();
  // Min-gap gate — stops UI/heal paths from racing seals (<1s)
  const minGap = DEMO_SEAL_MIN_MS * 0.85;
  if (prev?.sealed_at_ms && now - prev.sealed_at_ms < minGap) {
    lastTickAtMs = prev.sealed_at_ms;
    if (prev.sequence) demoOracleSeq = prev.sequence;
    return prev;
  }
  if (lastTickAtMs && now - lastTickAtMs < minGap) {
    return prev;
  }
  if (prev?.sequence && prev.sequence > demoOracleSeq) {
    demoOracleSeq = prev.sequence;
  }
  demoOracleSeq = Math.max(demoOracleSeq, readPersistedSeq());
  const nextSeq = demoOracleSeq + 1;
  writePersistedSeq(nextSeq); // pin seq before stamp work so nav can't wipe it
  const nonce = `seq-${nextSeq}-${now}`;
  const stamp = simulateStamp(
    `${contentHash}:${nonce}`,
    now + nextSeq,
  );
  const entry = {
    sequence: nextSeq,
    sealed_at_ms: now,
    request_id: `${contentHash}:${nonce}`,
    stamp: {
      content_hash: contentHash,
      nonce,
      median_wall_ms: stamp.median_wall_ms,
      trimmed_mean_ms: stamp.trimmed_mean_ms,
      confidence_ms: stamp.confidence_ms,
      // NEW CODE - TESTING: dependable interval + transcript
      error_ms: stamp.error_ms ?? stamp.confidence_ms,
      earliest_ms: stamp.earliest_ms,
      latest_ms: stamp.latest_ms,
      transcript_digest: stamp.transcript_digest,
      median_abs_dev_ms: stamp.median_abs_dev_ms,
      witness_count: stamp.witness_count,
      observations: stamp.observations,
      demo: true,
    },
  };
  const prevOtp = prev?.otp_time_ms ?? 0;
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // const prevSealed = prev?.sealed_at_ms ?? entry.sealed_at_ms;
  // const elapsedSeals = Math.max(0, entry.sealed_at_ms - prevSealed);
  // entry.otp_time_ms = Math.max(prevOtp + elapsedSeals, stamp.median_wall_ms);
  // NEW CODE - TESTING: network t tracks sealed median (monotonic) so drift shows
  entry.otp_time_ms = Math.max(prevOtp + 1, stamp.median_wall_ms);
  const prevHistory = Array.isArray(prev?.history) ? prev.history : [];
  const slimPrev = prevHistory.map((h) => ({
    sequence: h.sequence,
    sealed_at_ms: h.sealed_at_ms,
    request_id: h.request_id,
    stamp: slimStamp(h.stamp),
  }));
  const history = [
    ...slimPrev.filter((h) => h.sequence !== entry.sequence),
    {
      sequence: entry.sequence,
      sealed_at_ms: entry.sealed_at_ms,
      request_id: entry.request_id,
      stamp: slimStamp(entry.stamp),
    },
  ]
    .sort((a, b) => a.sequence - b.sequence)
    .slice(-16);

  const persistStamp = slimStamp(entry.stamp);
  const record = {
    running: true,
    sequence: entry.sequence,
    sealed_at_ms: entry.sealed_at_ms,
    otp_time_ms: entry.otp_time_ms,
    request_id: entry.request_id,
    stamp: persistStamp,
    history,
    // Hint for non-leader tabs (overwritten when scheduleNextSeal runs)
    next_seal_delay_ms: lastSealDelayMs,
  };
  const notify = { ...record, stamp: entry.stamp };
  if (!writeDemoOracle(record, notify)) {
    return prev;
  }
  demoOracleSeq = nextSeq;
  lastTickAtMs = now;
  return notify;
}

function readLeaderLock() {
  try {
    const raw = storageGet(DEMO_ORACLE_LEADER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function claimLeader() {
  const now = Date.now();
  try {
    const lock = readLeaderLock();
    const stale = !lock || now - lock.beat > DEMO_LEADER_TTL_MS;
    if (!stale && lock.id !== demoLeaderId) return false;
    storageSet(
      DEMO_ORACLE_LEADER_KEY,
      JSON.stringify({ id: demoLeaderId, beat: now }),
    );
    return true;
  } catch {
    // OLD CODE - KEEP UNTIL CONFIRMED WORKING
    // return false;
    // NEW CODE - TESTING: this tab is solo leader when storage is unavailable
    return true;
  }
}

function startSealingLoop() {
  if (demoSealTimer) return;
  const existing = readDemoOracle();
  const seq = Math.max(
    demoOracleSeq,
    readPersistedSeq(),
    existing?.sequence ?? 0,
  );
  demoOracleSeq = seq;
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // tickDemoOracle(demoContentHash); scheduleNextSeal(); // forced seal every nav
  // NEW CODE - TESTING: resume scheduled due time — don't reset the feed on nav
  if (!existing?.stamp) {
    tickDemoOracle(demoContentHash);
    scheduleNextSeal();
    return;
  }
  const due = existing.next_seal_due_ms;
  if (due && due > Date.now() + 50) {
    lastSealDelayMs =
      existing.next_seal_delay_ms || Math.max(DEMO_SEAL_MIN_MS, due - Date.now());
    nextSealDueMs = due;
    demoSealTimer = setTimeout(() => {
      demoSealTimer = null;
      tickDemoOracle(demoContentHash);
      if (demoIsLeader) scheduleNextSeal();
    }, due - Date.now());
    return;
  }
  tickDemoOracle(demoContentHash);
  scheduleNextSeal();
}

function stopSealingLoop() {
  if (demoSealTimer) {
    clearTimeout(demoSealTimer);
    demoSealTimer = null;
  }
  // Keep nextSealDueMs in storage; only clear in-memory timer
}

/**
 * After a seal completes, queue the next attempt ASAP with jitter.
 * Stand-in for: seal returns → immediately request another (demo is instant,
 * so we wait 1–4s instead of fixed cadence).
 */
function scheduleNextSeal() {
  if (!demoIsLeader) return;
  if (demoSealTimer) {
    clearTimeout(demoSealTimer);
    demoSealTimer = null;
  }
  lastSealDelayMs = randomSealDelayMs();
  nextSealDueMs = Date.now() + lastSealDelayMs;
  const cur = readDemoOracle();
  if (cur?.stamp) {
    // CRITICAL: slim only — never re-persist observations (quota wiped the feed)
    const slim = slimOracleRecord({
      ...cur,
      next_seal_due_ms: nextSealDueMs,
      next_seal_delay_ms: lastSealDelayMs,
    });
    writeDemoOracle(slim, {
      ...slim,
      stamp: cur.stamp,
      next_seal_due_ms: nextSealDueMs,
      next_seal_delay_ms: lastSealDelayMs,
    });
  }
  demoSealTimer = setTimeout(() => {
    demoSealTimer = null;
    tickDemoOracle(demoContentHash);
    if (demoIsLeader) scheduleNextSeal();
  }, lastSealDelayMs);
}

function heartbeatLeader() {
  if (claimLeader()) {
    if (!demoIsLeader) {
      demoIsLeader = true;
      startSealingLoop();
    }
  } else if (demoIsLeader) {
    demoIsLeader = false;
    stopSealingLoop();
  }
}

/**
 * Keep the demo oracle alive for as long as this tab is on the Kairos site.
 * Site-wide: every page that loads app.js runs this. Only one tab seals;
 * localStorage is the shared feed Demo + OTP both read.
 */
export function ensureDemoOracleRunning(opts = {}) {
  if (opts.contentHash) demoContentHash = opts.contentHash;
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // if (demoHeartbeatTimer) return () => {};
  // heartbeatLeader(); ...
  // NEW CODE - TESTING: always reclaim; start timers once; hand off on pagehide
  if (!demoHeartbeatTimer) {
    demoHeartbeatTimer = setInterval(heartbeatLeader, DEMO_HEARTBEAT_MS);
    window.addEventListener("pagehide", releaseLeaderIfOwned);
    window.addEventListener("pageshow", () => {
      heartbeatLeader();
    });
  }
  heartbeatLeader();
  return () => {};
}

/** Header chrome — offline demo badge removed (feed still runs in background). */
export function mountSiteOracleChrome() {
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // Created #site-oracle-pill in the header showing "Offline demo · seal #N"
  // NEW CODE - TESTING: no header badge; remove leftover pill if soft-nav left one
  const el = document.getElementById("site-oracle-pill");
  if (el) el.remove();
  siteOracleChromeMounted = true;
}

/** Progress through the current seal tick (for TOTP-like countdown UI). */
export function sealTickProgress(oracle = readDemoOracle()) {
  const sealedAt = oracle?.sealed_at_ms ?? Date.now();
  const ageMs = Math.max(0, Date.now() - sealedAt);
  const intervalMs =
    oracle?.next_seal_delay_ms || lastSealDelayMs || DEMO_SEAL_INTERVAL_MS;
  const due =
    oracle?.next_seal_due_ms ||
    nextSealDueMs ||
    sealedAt + intervalMs;
  const remainingMs = Math.max(0, due - Date.now());
  const progress = Math.min(1, ageMs / Math.max(intervalMs, 1));
  return {
    ageMs,
    remainingMs,
    progress,
    intervalMs,
    next_due_ms: due,
    stale: ageMs > DEMO_SEAL_MAX_MS * 1.5,
    sequence: oracle?.sequence ?? null,
  };
}

/**
 * Ensure the demo feeder is running; return latest state.
 * Does NOT seal on every call — UI polls were force-ticking and racing seal #.
 */
export function pollDemoOracle() {
  ensureDemoOracleRunning();
  return readDemoOracle();
}

/** Explicit heal if the leader loop died and the feed is actually stale. */
export function healDemoOracleIfStale() {
  ensureDemoOracleRunning();
  const cur = readDemoOracle();
  const tick = sealTickProgress(cur);
  if (!cur?.stamp || tick.stale) {
    if (claimLeader()) {
      if (!demoIsLeader) {
        demoIsLeader = true;
        startSealingLoop();
      } else {
        tickDemoOracle(demoContentHash);
      }
    }
  }
  return readDemoOracle();
}

function releaseLeaderIfOwned() {
  const lock = readLeaderLock();
  if (lock?.id === demoLeaderId) {
    storageRemove(DEMO_ORACLE_LEADER_KEY);
  }
  demoIsLeader = false;
  stopSealingLoop();
}

export function stopDemoOracle() {
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // cleared local timer and marked running:false (killed stream for everyone)
  // NEW CODE - TESTING: only release this tab's leadership; peers may continue
  releaseLeaderIfOwned();
  if (demoHeartbeatTimer) {
    clearInterval(demoHeartbeatTimer);
    demoHeartbeatTimer = null;
  }
}

export function onDemoOracleUpdate(listener) {
  demoListeners.add(listener);
  const fromStorage = (e) => {
    if (e.key === DEMO_ORACLE_KEY && e.newValue) {
      try {
        listener(JSON.parse(e.newValue));
      } catch {
        /* */
      }
    }
  };
  window.addEventListener("storage", fromStorage);
  let bc = null;
  try {
    bc = new BroadcastChannel(DEMO_ORACLE_CHANNEL);
    bc.onmessage = (ev) => listener(ev.data);
  } catch {
    /* */
  }
  return () => {
    demoListeners.delete(listener);
    window.removeEventListener("storage", fromStorage);
    bc?.close();
  };
}

async function hotpCode(secretB32, counter, digits = 6) {
  const key = base32Decode(secretB32);
  if (!key.length) {
    throw new Error("Invalid base32 secret");
  }
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto unavailable (need secure context)");
  }
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(4, counter >>> 0);
  view.setUint32(0, Math.floor(counter / 0x100000000));
  const hmac = await hmacSha1(key, new Uint8Array(buf));
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(bin % 10 ** digits).padStart(digits, "0");
}

/** RFC 4226 truncate step — used only as the TOTP inner function. */
export async function computeHotp(secretB32, counter, digits = 6) {
  return hotpCode(secretB32, counter, digits);
}

/**
 * RFC 6238-style TOTP: code = HOTP(K, floor(T / X)) where T is Kairos
 * network time (pulse median), not the device wall clock. Not counter HOTP.
 */
export async function computeTotp(secretB32, timeCounter, digits = 6) {
  return hotpCode(secretB32, timeCounter, digits);
}

/**
 * Kairos OTP — network belief / collapse probability (not a local countdown)
 *
 * Critique of coasting `t_est = otp_time + (now − sealed_at)` for the bar:
 * that advances “now” with the laptop clock. Verify would then disagree with
 * pure network Gets, and the window is fake-traditional.
 *
 * Model:
 *   1. Point estimate `t` updates ONLY when a seal arrives (monotonic otp_time).
 *   2. Local clock is used only to measure *staleness* since that seal —
 *      uncertainty grows: σ = confidence + stale.
 *   3. Network time is quantized into bins of OTP_BIN_MS (30s of *network*
 *      time coordinates — not “count 30 local seconds”).
 *   4. Belief ≈ uniform on [t−σ, t+σ]. P(epoch k) = overlap of that interval
 *      with [k·bin, (k+1)·bin). Bar = P(displayed epoch) — collapse risk.
 *   5. Digits = TOTP(secret, argmax_k P(k)) i.e. HOTP(K, floor(T/X)) with
 *      T from the network tip. When the tip moves t across a bin (or
 *      staleness smears mass into the next bin), the code collapses.
 *   6. Verify: Get same oracle, recompute belief, accept TOTP for any epoch
 *      with P ≥ OTP_ACCEPT_P (probability fringe — not a fixed grace timer).
 */

/** Bin size in network-time coordinates (shared constant). */
export const OTP_BIN_MS = 30_000;
/** @deprecated alias */
export const OTP_STEP_MS = OTP_BIN_MS;
export const OTP_FRINGE_MS = 10_000; // unused for accept; kept for old imports
/** Minimum probability mass to accept an epoch at verify. */
export const OTP_ACCEPT_P = 0.12;
// OLD CODE - KEEP UNTIL CONFIRMED WORKING
// export const OTP_STALE_GROWTH = 0.35;
// NEW CODE - TESTING: declared once near KAIROS_ASSET_V (used by notary + belief)

export function otpStepMs() {
  return OTP_BIN_MS;
}

export function otpFringeMs() {
  return OTP_FRINGE_MS;
}

/** Overlap fraction of [t−σ, t+σ] with epoch bin k. */
export function epochProbability(t, sigma, binMs, counter) {
  const half = Math.max(1, sigma);
  const lo = t - half;
  const hi = t + half;
  const eLo = counter * binMs;
  const eHi = (counter + 1) * binMs;
  const overlap = Math.max(0, Math.min(hi, eHi) - Math.max(lo, eLo));
  return Math.max(0, Math.min(1, overlap / (hi - lo)));
}

/**
 * Network belief from last seal. Local `now` only widens σ (staleness) —
 * it does not advance the point estimate t.
 */
export function networkBelief(oracle = readDemoOracle(), nowMs = Date.now()) {
  if (!oracle?.stamp) {
    return {
      t: nowMs,
      sigma: OTP_BIN_MS,
      stale_ms: 0,
      confidence_ms: 80,
      seal_sequence: null,
      fresh: false,
    };
  }
  const t = oracle.otp_time_ms ?? oracle.stamp.median_wall_ms;
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // const confidence = Math.max(1, oracle.stamp.confidence_ms ?? 80);
  // const sealedAt = oracle.sealed_at_ms ?? nowMs;
  // const stale_ms = Math.max(0, nowMs - sealedAt);
  // const sigma = confidence + stale_ms * OTP_STALE_GROWTH;
  // NEW CODE - TESTING: Byztime-style effective error (same growth rule as notary)
  const confidence = Math.max(
    1,
    oracle.stamp.error_ms ?? oracle.stamp.confidence_ms ?? 80,
  );
  const sealedAt = oracle.sealed_at_ms ?? nowMs;
  const stale_ms = Math.max(0, nowMs - sealedAt);
  const sigma = effectiveErrorMs(oracle.stamp, {
    sealedAtMs: sealedAt,
    nowMs,
    growth: OTP_STALE_GROWTH,
  });
  return {
    t,
    sigma,
    stale_ms,
    confidence_ms: confidence,
    error_ms: confidence,
    seal_sequence: oracle.sequence,
    fresh: stale_ms < DEMO_SEAL_INTERVAL_MS * 1.5,
    median_wall_ms: oracle.stamp.median_wall_ms,
    earliest_ms: oracle.stamp.earliest_ms,
    latest_ms: oracle.stamp.latest_ms,
    transcript_digest: oracle.stamp.transcript_digest ?? null,
    otp_time_ms: t,
  };
}

export function otpEpochState(oracle = readDemoOracle(), nowMs = Date.now()) {
  const live = oracle?.stamp ? oracle : null;
  const belief = networkBelief(
    live || {
      stamp: { median_wall_ms: nowMs, confidence_ms: 80 },
      sealed_at_ms: nowMs,
      otp_time_ms: nowMs,
      sequence: null,
    },
    nowMs,
  );
  const bin = OTP_BIN_MS;
  const pointCounter = Math.floor(belief.t / bin);
  const into_bin_ms = ((belief.t % bin) + bin) % bin;
  // Network ms until the *next* bin if t only moves forward with seals
  const forward_ms = Math.max(1, bin - into_bin_ms);
  const hold = forward_ms / (forward_ms + belief.sigma);
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // freshness = confidence/σ — stays ~100% when confidence ≫ seal interval
  // NEW CODE - TESTING: linear "time since last seal" for the visible meter.
  // This is feed liveness, NOT the security of the code.
  const seal_wait = Math.max(
    0,
    Math.min(1, 1 - belief.stale_ms / DEMO_SEAL_INTERVAL_MS),
  );
  const freshness = seal_wait;
  const bin_progress = into_bin_ms / bin;

  const candidates = [pointCounter - 1, pointCounter, pointCounter + 1];
  let best = pointCounter;
  let bestP = -1;
  const masses = {};
  for (const k of candidates) {
    const p = epochProbability(belief.t, belief.sigma, bin, k);
    masses[k] = p;
    if (p > bestP) {
      bestP = p;
      best = k;
    }
  }
  const pCurrent = masses[best] ?? 0;
  const pPrev = masses[best - 1] ?? 0;
  const pNext = masses[best + 1] ?? 0;
  const leak = pPrev + pNext;
  const phase =
    hold < 0.35 || pCurrent < 0.45 || leak > 0.35
      ? "collapsing"
      : belief.stale_ms > DEMO_SEAL_INTERVAL_MS
        ? "stale"
        : "stable";

  return {
    t_est_ms: belief.t,
    t_network_ms: belief.t,
    sigma_ms: belief.sigma,
    stale_ms: belief.stale_ms,
    into_bin_ms,
    forward_ms,
    hold,
    freshness,
    bin_progress,
    counter: best,
    prev_counter: best - 1,
    next_counter: best + 1,
    step_ms: bin,
    bin_ms: bin,
    fringe_ms: OTP_FRINGE_MS,
    p_epoch: pCurrent,
    p_prev: pPrev,
    p_next: pNext,
    p_masses: masses,
    // Primary UI bar — seal freshness (visible every poll)
    until_roll: freshness,
    remaining_ms: forward_ms,
    phase,
    confidence_ms: belief.confidence_ms,
    seal_sequence: belief.seal_sequence,
    median_wall_ms: belief.median_wall_ms ?? null,
    otp_time_ms: belief.otp_time_ms,
    accept_p: OTP_ACCEPT_P,
    polled_at_ms: nowMs,
  };
}

/**
 * Authenticator clock — tip from Freenet subscribe (or legacy poll schedule).
 */
// OLD CODE - KEEP UNTIL CONFIRMED WORKING
// export const AUTH_POLL_MIN_MS = 30_000;
// export const AUTH_POLL_MAX_MS = 60_000;
// NEW CODE - TESTING: kept for imports; subscribe path no longer schedules Gets
export const AUTH_POLL_MIN_MS = 30_000;
export const AUTH_POLL_MAX_MS = 60_000;

export function readAuthClock() {
  try {
    const raw = storageGet(AUTH_CLOCK_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function adoptAuthClock(oracle, meta = {}) {
  if (!oracle?.stamp) return null;
  const now = Date.now();
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // const delay =
  //   meta.next_poll_delay_ms ??
  //   Math.round(
  //     AUTH_POLL_MIN_MS +
  //       Math.random() * (AUTH_POLL_MAX_MS - AUTH_POLL_MIN_MS),
  //   );
  // NEW CODE - TESTING: subscribe mode — no next Get timer
  const subscribe = meta.subscribe !== false;
  const delay = subscribe
    ? null
    : (meta.next_poll_delay_ms ??
      Math.round(
        AUTH_POLL_MIN_MS +
          Math.random() * (AUTH_POLL_MAX_MS - AUTH_POLL_MIN_MS),
      ));
  const clock = {
    adopted_at_ms: now,
    mode: subscribe ? "subscribe" : "poll",
    next_poll_at_ms: delay != null ? now + delay : null,
    next_poll_delay_ms: delay,
    sequence: oracle.sequence,
    sealed_at_ms: oracle.sealed_at_ms,
    otp_time_ms: oracle.otp_time_ms,
    request_id: oracle.request_id,
    tip: oracle.tip ?? null,
    source: oracle.source ?? oracle.stamp?.source ?? null,
    stamp: slimStamp(oracle.stamp),
  };
  storageSet(AUTH_CLOCK_KEY, JSON.stringify(clock));
  return clock;
}

/** If an old auth clock lacks a poll schedule, pin one without re-Getting. */
export function ensureAuthPollSchedule(clock = readAuthClock()) {
  if (!clock?.stamp) return clock;
  if (clock.mode === "subscribe") return clock;
  if (clock.next_poll_at_ms && clock.next_poll_at_ms > Date.now()) return clock;
  if (clock.next_poll_at_ms && clock.next_poll_at_ms <= Date.now()) return clock;
  const delay = Math.round(
    AUTH_POLL_MIN_MS +
      Math.random() * (AUTH_POLL_MAX_MS - AUTH_POLL_MIN_MS),
  );
  const fixed = {
    ...clock,
    next_poll_at_ms: Date.now() + delay,
    next_poll_delay_ms: delay,
  };
  storageSet(AUTH_CLOCK_KEY, JSON.stringify(fixed));
  return fixed;
}

/**
 * Authenticator Get — pull current demo contract state into the auth clock.
 * Explicit poll only (not every demo seal).
 */
export function pollAuthClock() {
  ensureDemoOracleRunning();
  const network = getDemoContractState();
  if (!network?.stamp) return readAuthClock();
  return adoptAuthClock(network, { subscribe: false });
}

/** Progress until the authenticator’s next independent Get (poll mode only). */
export function authPollProgress(clock = readAuthClock()) {
  const now = Date.now();
  if (clock?.mode === "subscribe" || clock?.next_poll_at_ms == null) {
    const age = Math.max(0, now - (clock?.adopted_at_ms || now));
    return {
      remainingMs: 0,
      delayMs: 1,
      progress: 1,
      due_at_ms: now,
      sequence: clock?.sequence ?? null,
      mode: "subscribe",
      tip_age_ms: age,
    };
  }
  const delay = clock?.next_poll_delay_ms || AUTH_POLL_MIN_MS;
  const due = clock?.next_poll_at_ms || now;
  const remainingMs = Math.max(0, due - now);
  return {
    remainingMs,
    delayMs: delay,
    progress: Math.min(1, 1 - remainingMs / Math.max(delay, 1)),
    due_at_ms: due,
    sequence: clock?.sequence ?? null,
    mode: "poll",
    tip_age_ms: Math.max(0, now - (clock?.adopted_at_ms || now)),
  };
}

/** Lab authenticator session (secret + last shown code). */
export function readAuthSession() {
  try {
    const raw = storageGet(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeAuthSession(session) {
  storageSet(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function currentKairosOtp(secretB32) {
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // ensureDemoOracleRunning(); … demo seal wait
  // NEW CODE - TESTING: digits only from authenticator’s last Freenet Get
  const clock = readAuthClock();
  if (!clock?.stamp) {
    throw new Error("No authenticator Get yet — tap Refresh Get");
  }
  const view = {
    sequence: clock.sequence,
    sealed_at_ms: clock.sealed_at_ms,
    otp_time_ms: clock.otp_time_ms,
    request_id: clock.request_id,
    stamp: clock.stamp,
  };
  const epoch = otpEpochState(view);
  const code = await hotpCode(secretB32, epoch.counter);
  const prevCode =
    epoch.p_prev >= OTP_ACCEPT_P
      ? await hotpCode(secretB32, epoch.prev_counter)
      : null;
  return {
    label: "kairos",
    secret: secretB32,
    code,
    counter: epoch.counter,
    prev_code: prevCode,
    ...epoch,
    stamp: view.stamp,
    sealed_at_ms: view.sealed_at_ms,
    request_id: view.request_id,
    sequence: view.sequence,
    clock: "auth-get",
    source: clock.source || clock.stamp?.source || null,
    tip: clock.tip || null,
    next_poll_at_ms: clock.next_poll_at_ms,
  };
}

/**
 * Verify via an independent network clock (caller supplies Freenet Get).
 * Never uses the authenticator clock for belief.
 */
export async function verifyKairosOtp(secretB32, code, opts = {}) {
  const normalized = String(code || "").replace(/\s+/g, "");
  const auth = readAuthClock();
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // ensureDemoOracleRunning(); wait for demo put after auth…
  // NEW CODE - TESTING: caller passes live Freenet clock
  const live = opts.live;
  if (!live?.stamp) {
    return {
      ok: false,
      reason: "verifier Get returned no clock (pulse or seal)",
      seal_sequence: null,
      auth_sequence: auth?.sequence ?? null,
    };
  }
  const epoch = otpEpochState(live);
  const bin = OTP_BIN_MS;
  const belief = networkBelief(live);
  const point = Math.floor(belief.t / bin);
  const toTry = [point - 1, point, point + 1];
  for (const k of toTry) {
    const p = epochProbability(belief.t, belief.sigma, bin, k);
    if (p < OTP_ACCEPT_P) continue;
    const expected = await hotpCode(secretB32, k);
    if (normalized === expected) {
      return {
        ok: true,
        reason: `Valid — verifier Get tip #${live.sequence} (${live.source || "network"}); epoch ${k} (~${Math.round(p * 100)}% belief)`,
        matched_counter: k,
        phase: epoch.phase,
        p_epoch: p,
        sigma_ms: belief.sigma,
        stale_ms: belief.stale_ms,
        step_ms: bin,
        seal_sequence: live.sequence,
        auth_sequence: auth?.sequence ?? null,
        clock: "verify-get",
        source: live.source || null,
        t_network_ms: belief.t,
      };
    }
  }
  return {
    ok: false,
    reason: `Verifier Get tip #${live.sequence} rejects code (need P≥${OTP_ACCEPT_P}); mode epoch ${epoch.counter} P=${epoch.p_epoch.toFixed(2)}`,
    expected_counter: epoch.counter,
    phase: epoch.phase,
    p_epoch: epoch.p_epoch,
    sigma_ms: belief.sigma,
    stale_ms: belief.stale_ms,
    step_ms: bin,
    seal_sequence: live.sequence,
    auth_sequence: auth?.sequence ?? null,
    clock: "verify-get",
    source: live.source || null,
    t_network_ms: belief.t,
  };
}

/** @deprecated — belief model replaced coasting estimate */
export function estimatedNetworkMs(oracle = readDemoOracle(), nowMs = Date.now()) {
  return networkBelief(oracle, nowMs).t;
}

// OLD helpers retained as no-ops / thin wrappers for stray imports
export function acceptWindowSeals(oracle = readDemoOracle()) {
  if (!oracle?.stamp) return [];
  return [
    {
      sequence: oracle.sequence,
      sealed_at_ms: oracle.sealed_at_ms,
      request_id: oracle.request_id,
      stamp: oracle.stamp,
    },
  ];
}

export async function otpForSeal(secretB32, seal) {
  const epoch = otpEpochState({
    sequence: seal.sequence,
    sealed_at_ms: seal.sealed_at_ms,
    request_id: seal.request_id,
    stamp: seal.stamp,
  });
  const code = await hotpCode(secretB32, epoch.counter);
  return { code, counter: epoch.counter, sequence: seal.sequence, stamp: seal.stamp };
}

export async function mintKairosOtp(secretB32) {
  return currentKairosOtp(secretB32);
}

export function certaintyAt() {
  return { certainty: 0, remainingMs: 0, expired: true };
}

export function liveAgreement() {
  return {
    agreement: 0,
    certainty: 0,
    driftMs: 0,
    acceptRadiusMs: 0,
    remainingMs: 0,
    expired: true,
    live_sequence: null,
    live_median_ms: null,
  };
}

export async function syncOtpSession(secretB32) {
  const cur = await currentKairosOtp(secretB32);
  return { session: cur, switched: true, waiting: false };
}

export function markCurrentNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  const onWiki = path === "wiki.html" || path.startsWith("wiki-");
  document.querySelectorAll(".nav a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (
      href === path ||
      (path === "" && href === "index.html") ||
      (onWiki && href === "wiki.html")
    ) {
      a.setAttribute("aria-current", "page");
    } else {
      a.removeAttribute("aria-current");
    }
  });
  document.querySelectorAll(".wiki-nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").split("#")[0];
    if (href === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

let pageCleanup = null;
let softNavInstalled = false;

function pageNameFromHref(href) {
  const clean = String(href || "")
    .split("?")[0]
    .split("#")[0];
  const base = clean.split("/").pop();
  return base || "index.html";
}

/**
 * Soft-navigate so app.js (and the sealing loop) never unload.
 * Freenet sandbox has no Web Storage — full reloads used to reset seal # to 1.
 */
export async function softNavigate(href, push = true) {
  const page = pageNameFromHref(href);
  const url = new URL(page, location.href);
  let html;
  try {
    const res = await fetch(url.href, { cache: "no-cache" });
    if (!res.ok) throw new Error(`fetch ${page} ${res.status}`);
    html = await res.text();
  } catch {
    // Fallback: hard navigation (window.name still carries seal state)
    location.href = url.href;
    return;
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  const newMain = doc.querySelector("main") || doc.querySelector(".wiki-layout");
  const curMain = document.querySelector("main") || document.querySelector(".wiki-layout");
  if (!newMain || !curMain) {
    location.href = url.href;
    return;
  }
  if (typeof pageCleanup === "function") {
    try {
      pageCleanup();
    } catch {
      /* */
    }
    pageCleanup = null;
  }
  curMain.replaceWith(document.importNode(newMain, true));
  const newFooter = doc.querySelector(".site-footer");
  const curFooter = document.querySelector(".site-footer");
  if (newFooter && curFooter) {
    curFooter.replaceWith(document.importNode(newFooter, true));
  }
  document.title = doc.title || document.title;
  if (push) {
    history.pushState({ kairos: page }, "", page);
  }
  markCurrentNav();
  mountSiteOracleChrome();
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // ensureDemoOracleRunning();
  pageCleanup = await mountPageScript(page);
}

async function mountPageScript(page) {
  const v = KAIROS_ASSET_V;
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // if (page === "demo.html") { … mountDemoPage … }
  if (page === "otp.html") {
    const { mountOtpPage } = await import(`./pages/otp-page.js?v=${v}`);
    return mountOtpPage();
  }
  if (page === "telemetry.html") {
    const live = await import(`./live.bundle.js?v=${v}`);
    return live.mountTelemetryPage?.() ?? null;
  }
  return null;
}

function installSoftNav() {
  if (softNavInstalled) return;
  softNavInstalled = true;
  document.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey)
        return;
      const a = e.target.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (/^[a-z]+:/i.test(href)) return; // absolute external
      if (!href.endsWith(".html") && href.includes("/")) return;
      e.preventDefault();
      void softNavigate(href);
    },
    true,
  );
  window.addEventListener("popstate", () => {
    const page = pageNameFromHref(location.pathname);
    void softNavigate(page, false);
  });
}

/** Boot site chrome + background network duty on every page. */
export function bootKairosSite() {
  hydrateMemoryFromNameBag();
  markCurrentNav();
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // ensureDemoOracleRunning();
  mountSiteOracleChrome();
  installSoftNav();
  const page = pageNameFromHref(location.pathname);
  void mountPageScript(page).then((cleanup) => {
    pageCleanup = cleanup;
  });
  // NEW CODE - TESTING: duty runs site-wide (pulse + example stamp + observe)
  void import(`./live.bundle.js?v=${KAIROS_ASSET_V}`)
    .then((live) => {
      live.ensureSiteNetworkDuty?.();
    })
    .catch((err) => {
      console.warn("[kairos] site duty failed to start:", err);
    });
}

// OLD CODE - KEEP UNTIL CONFIRMED WORKING
// document.addEventListener("DOMContentLoaded", () => {
//   markCurrentNav();
//   ensureDemoOracleRunning();
// });
// NEW CODE - TESTING: start as soon as app.js evaluates (all pages import it)
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootKairosSite);
  } else {
    bootKairosSite();
  }
}