import {
  KAIROS_WASM_HASH_B58,
  KAIROS_WASM_PATH,
} from "./kairos-constants.js";
import { kairosKey, paramsBytes } from "./keys.js";
import { buildPutRequest, wrapDeltaUpdate } from "./put.js";
import {
  tryGetContractState,
  getContractState,
  putContract,
  updateContract,
} from "./ws.js";
import {
  signPulseAuto,
  signStampObserveAuto,
  ensureKairosIdentity,
  getKairosIdentitySummary,
} from "./identity-delegate.js";

const EMPTY_STATE = JSON.stringify({
  schema_version: 2,
  roster: {},
  pulse: {},
  open_stamps: {},
  sealed_stamps: {},
});

const MIN_AGE_MS = 3_600_000;
const REP_NEUTRAL = 500;
const REP_MIN_OTP = 300;
const REP_HISTORY_BLEND = 10;
const MIN_NETWORK_SEALS_FOR_REP = 3;
const AGE_RAMP_MS = 7 * 24 * 3_600_000;
/** Prefer this many trusted pulses for OTP; cold-start allows 1. */
const MIN_OTP_TRUSTED = 1;
/** Ignore tip jumps larger than this vs last accepted tip (3×30s bins). */
export const OTP_MAX_TIP_JUMP_MS = 90_000;

export function parseKairosState(bytes) {
  if (!bytes?.length) {
    return JSON.parse(EMPTY_STATE);
  }
  const s = JSON.parse(new TextDecoder().decode(bytes));
  s.roster = s.roster || {};
  s.pulse = s.pulse || {};
  s.open_stamps = s.open_stamps || s.open || {};
  s.sealed_stamps = s.sealed_stamps || s.sealed || {};
  return s;
}

export async function ensureKairosExists(onStatus) {
  const key = kairosKey();
  if (!key || !KAIROS_WASM_HASH_B58) {
    throw new Error("Kairos constants missing — run scripts/build.sh");
  }
  onStatus?.("Looking up Kairos contract…");
  const existing = await tryGetContractState(key, { timeoutMs: 6_000 });
  if (existing) {
    onStatus?.("Kairos contract found — subscribing…");
    await getContractState(key, {
      fetchContract: true,
      subscribe: true,
      timeoutMs: 15_000,
    }).catch(() => existing);
    return { key, created: false, state: parseKairosState(existing) };
  }

  onStatus?.("Kairos missing — publishing to this node…");
  const resp = await fetch(KAIROS_WASM_PATH);
  if (!resp.ok) {
    throw new Error(`failed to fetch ${KAIROS_WASM_PATH}: ${resp.status}`);
  }
  const wasm = new Uint8Array(await resp.arrayBuffer());
  const initial = new TextEncoder().encode(EMPTY_STATE);
  const req = buildPutRequest(
    wasm,
    KAIROS_WASM_HASH_B58,
    paramsBytes(),
    initial,
  );
  await putContract(req, key);
  onStatus?.("Kairos contract created on this node");
  return {
    key,
    created: true,
    state: parseKairosState(new TextEncoder().encode(EMPTY_STATE)),
  };
}

export async function fetchKairosState() {
  const key = kairosKey();
  const bytes = await getContractState(key, {
    fetchContract: true,
    subscribe: true,
    timeoutMs: 15_000,
  });
  return parseKairosState(bytes);
}

/** Pulse API — keep-alive + age accrual. Not authoritative time. */
export async function submitPulse(onStatus) {
  const { key } = await ensureKairosExists(onStatus);
  await ensureKairosIdentity(onStatus);
  const now = Date.now();
  const perf =
    typeof performance !== "undefined" ? Math.floor(performance.now()) : 0;
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // const observation = await signPulse({...});
  // NEW CODE - TESTING: delegate signer with durable local fallback
  const observation = await signPulseAuto({
    wall_ms: now,
    monotonic_ms: perf,
    uncertainty_ms: 40,
  });
  onStatus?.("Submitting pulse…");
  const delta = new TextEncoder().encode(JSON.stringify({ pulse: observation }));
  await updateContract(wrapDeltaUpdate(key, delta), key);
  return observation;
}

/** Stamp API — open authoritative request. */
export async function openStamp(contentHash, nonce, onStatus) {
  const { key } = await ensureKairosExists(onStatus);
  const delta = new TextEncoder().encode(
    JSON.stringify({
      open_stamp: { content_hash: contentHash, nonce },
    }),
  );
  onStatus?.("Opening stamp request…");
  await updateContract(wrapDeltaUpdate(key, delta), key);
  return `${contentHash}:${nonce}`;
}

/** Stamp API — age-eligible observe. */
export async function observeStamp(requestId, onStatus) {
  const { key } = await ensureKairosExists(onStatus);
  await ensureKairosIdentity(onStatus);
  const now = Date.now();
  const perf =
    typeof performance !== "undefined" ? Math.floor(performance.now()) : 0;
  const observation = await signStampObserveAuto(requestId, {
    wall_ms: now,
    monotonic_ms: perf,
    uncertainty_ms: 40,
  });
  onStatus?.("Submitting stamp observation…");
  const delta = new TextEncoder().encode(
    JSON.stringify({
      observe_stamp: { request_id: requestId, observation },
    }),
  );
  await updateContract(wrapDeltaUpdate(key, delta), key);
  return observation;
}

export function pulseStats(state) {
  const obs = Object.values(state.pulse || {});
  const roster = Object.values(state.roster || {});
  const eligible = roster.filter(
    (e) => e.last_seen_ms - e.first_seen_ms >= MIN_AGE_MS,
  ).length;
  if (!obs.length) {
    return {
      witness_count: 0,
      eligible_count: eligible,
      roster_count: roster.length,
      median_wall_ms: null,
      confidence_ms: null,
      median_abs_dev_ms: null,
      observations: [],
      sealed_count: Object.keys(state.sealed_stamps || {}).length,
      open_count: Object.keys(state.open_stamps || {}).length,
    };
  }
  const walls = obs.map((o) => o.wall_ms).sort((a, b) => a - b);
  const med = median(walls);
  const mad = median(
    obs.map((o) => Math.abs(o.wall_ms - med)).sort((a, b) => a - b),
  );
  const unc = median(
    obs.map((o) => o.uncertainty_ms).sort((a, b) => a - b),
  );
  const confidence = Math.max(unc, Math.round(1.4826 * mad), 1);
  return {
    witness_count: obs.length,
    eligible_count: eligible,
    roster_count: roster.length,
    median_wall_ms: med,
    confidence_ms: confidence,
    median_abs_dev_ms: mad,
    observations: obs.sort(
      (a, b) => Math.abs(a.wall_ms - med) - Math.abs(b.wall_ms - med),
    ),
    sealed_count: Object.keys(state.sealed_stamps || {}).length,
    open_count: Object.keys(state.open_stamps || {}).length,
  };
}

/** Seal-history score 0–1000 (matches contract); neutral with no history. */
export function reputationScore(entry) {
  if (!entry) return REP_NEUTRAL;
  const included = Number(entry.seals_included) || 0;
  const outlier = Number(entry.seals_outlier) || 0;
  const total = included + outlier;
  if (!total) return REP_NEUTRAL;
  const rate = Math.floor((included * 1000) / total);
  const n = Math.min(total, REP_HISTORY_BLEND);
  return Math.floor((rate * n + REP_NEUTRAL * (REP_HISTORY_BLEND - n)) / REP_HISTORY_BLEND);
}

function observeWeight(entry, wallMs) {
  if (!entry) return 0;
  const age = wallMs - entry.first_seen_ms;
  if (age < MIN_AGE_MS) return 0;
  const rep = Math.max(1, reputationScore(entry));
  const over = Math.min(Math.max(0, age - MIN_AGE_MS), AGE_RAMP_MS);
  const ageFactor = 1000 + Math.floor((over * 3000) / Math.max(AGE_RAMP_MS, 1));
  return Math.min(64, Math.max(1, Math.floor((rep * ageFactor) / 100_000)));
}

function weightedMedian(pairs) {
  if (!pairs.length) return null;
  const sorted = [...pairs].sort((a, b) => a.wall - b.wall);
  const total = sorted.reduce((s, p) => s + p.weight, 0);
  if (!total) return sorted[Math.floor(sorted.length / 2)].wall;
  const half = Math.ceil(total / 2);
  let acc = 0;
  for (const p of sorted) {
    acc += p.weight;
    if (acc >= half) return p.wall;
  }
  return sorted[sorted.length - 1].wall;
}

/**
 * OTP tip from age+reputation-weighted pulses (not raw public median).
 * Cold-start: if no aged pulses yet, fall back to all pulses with untrusted flag.
 */
export function otpTrustedPulseStats(state) {
  const roster = state.roster || {};
  const sealedCount = Object.keys(state.sealed_stamps || {}).length;
  const all = Object.values(state.pulse || {});
  const trusted = [];
  for (const o of all) {
    const e = roster[o.node_id];
    if (!e) continue;
    const age = o.wall_ms - e.first_seen_ms;
    if (age < MIN_AGE_MS) continue;
    if (
      sealedCount >= MIN_NETWORK_SEALS_FOR_REP &&
      reputationScore(e) < REP_MIN_OTP
    ) {
      continue;
    }
    const w = observeWeight(e, o.wall_ms);
    if (w > 0) trusted.push({ wall: o.wall_ms, weight: w, unc: o.uncertainty_ms, o });
  }

  let used = trusted;
  let trusted_mode = "aged";
  if (trusted.length < MIN_OTP_TRUSTED) {
    // Bootstrap: raw pulses until someone is aged (demo still works).
    used = all.map((o) => ({
      wall: o.wall_ms,
      weight: 1,
      unc: o.uncertainty_ms,
      o,
    }));
    trusted_mode = "bootstrap";
  }
  if (!used.length) {
    return {
      median_wall_ms: null,
      confidence_ms: null,
      witness_count: 0,
      trusted_count: 0,
      trusted_mode,
      sealed_count: sealedCount,
    };
  }
  const med = weightedMedian(used.map((p) => ({ wall: p.wall, weight: p.weight })));
  const walls = used.map((p) => p.wall).sort((a, b) => a - b);
  const mad = median(
    walls.map((w) => Math.abs(w - med)).sort((a, b) => a - b),
  );
  const unc = median(used.map((p) => p.unc).sort((a, b) => a - b));
  let confidence = Math.max(unc, Math.round(1.4826 * mad), 1);
  if (trusted_mode === "bootstrap") {
    confidence = Math.max(confidence, 5_000);
  }
  return {
    median_wall_ms: med,
    confidence_ms: confidence,
    median_abs_dev_ms: mad,
    witness_count: used.length,
    trusted_count: trusted.length,
    trusted_mode,
    sealed_count: sealedCount,
    observations: used.map((p) => p.o),
  };
}

function median(sorted) {
  if (!sorted.length) return 0;
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[m]
    : Math.round((sorted[m - 1] + sorted[m]) / 2);
}

export {
  MIN_AGE_MS,
  REP_NEUTRAL,
  REP_MIN_OTP,
  MIN_OTP_TRUSTED,
  ensureKairosIdentity,
  getKairosIdentitySummary,
};
