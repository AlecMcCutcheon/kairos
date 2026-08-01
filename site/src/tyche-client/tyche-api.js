import { blake3 } from "@noble/hashes/blake3";
import { tycheKey, paramsBytes } from "./keys.js";
import { tryGetContractState, getContractState, updateContract, onContractUpdate } from "./ws.js";
import { ensureTycheIdentity, signPulseAuto, signCommitAuto, signRevealAuto, signRecoveryShareAuto } from "./identity-delegate.js";
import { TYCHE_PARAMS_UTF8, TYCHE_WASM_HASH_B58, TYCHE_WASM_PATH } from "./tyche-constants.js";
import { resolveTycheTimeAnchor } from "./time-anchor.js";

const EMPTY = { schema_version: 3, roster: {}, pulse: {}, excluded_nodes: [], rounds: {} };
const MIN_AGE_MS = 3_600_000;
const DEFAULT_DUTY_INTERVAL_MS = 60_000;
const DEFAULT_MAX_AUTO_COMMITS = 5;
const DEFAULT_MAX_AUTO_REVEALS = 5;
const DEFAULT_MAX_AUTO_ROUND_AGE_MS = 7 * 24 * 3_600_000;
const AUTO_SECRET_PREFIX = `tyche.auto.secret.v1.${TYCHE_PARAMS_UTF8}.`;
const AUTO_LOCK_PREFIX = `tyche.auto.lock.v1.${TYCHE_PARAMS_UTF8}.`;
const enc = new TextEncoder();
const hex = bytes => Array.from(bytes).map(x => x.toString(16).padStart(2, "0")).join("");
const fromHex = value => { if (!/^[0-9a-fA-F]{64}$/.test(value)) throw new Error("Tyche values must be 32-byte hex"); return Uint8Array.from(value.match(/../g), x => parseInt(x, 16)); };
function field(out, value) { out.push(...enc.encode(String(value)), 0); }
function hashCommitment(roundId, nodeId, secret) { const out = [...enc.encode("tyche.commitment.v1\0")]; field(out, roundId); field(out, nodeId); out.push(...secret); return blake3(new Uint8Array(out)); }
function recoveryCommitmentHash(roundId, sourceId, recipientId, x, threshold, share) { const out = [...enc.encode("tyche.recovery-commit.v2\0")]; field(out, roundId); field(out, sourceId); field(out, recipientId); out.push(x, threshold, ...share); return blake3(new Uint8Array(out)); }
function recoveryDigest(roundId, sourceId, commitments) { const out = [...enc.encode("tyche.recovery-transcript.v2\0")]; field(out, roundId); field(out, sourceId); for (const recipient of Object.keys(commitments).sort()) { const c = commitments[recipient]; field(out, recipient); out.push(c.x, c.threshold); field(out, c.commitment); } return hex(blake3(new Uint8Array(out))); }
function gfMul(a, b) { let out = 0; for (let i = 0; i < 8; i++) { if (b & 1) out ^= a; const hi = a & 0x80; a = (a << 1) & 0xff; if (hi) a ^= 0x1b; b >>>= 1; } return out; }
function makeShares(secret, recipients, threshold) {
  const coefficients = Array.from({ length: threshold - 1 }, () => crypto.getRandomValues(new Uint8Array(32)));
  return recipients.map(({ nodeId, x }) => {
    const value = new Uint8Array(32);
    for (let i = 0; i < 32; i++) { let y = secret[i], power = x; for (const coefficient of coefficients) { y ^= gfMul(coefficient[i], power); power = gfMul(power, x); } value[i] = y; }
    return { recipient_id: nodeId, x, threshold, share_hex: hex(value) };
  });
}

function autoSecretKey(roundId, nodeId) { return `${AUTO_SECRET_PREFIX}${nodeId}.${roundId}`; }
function autoLockKey(roundId) { return `${AUTO_LOCK_PREFIX}${roundId}`; }
async function withAutoSecretLock(roundId, work) {
  const lockName = autoLockKey(roundId);
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request(lockName, { mode: "exclusive" }, async () => ({
      locked: true,
      value: await work(),
    }));
  }
  // Without Web Locks, do not attempt automatic commits. A local in-memory
  // guard cannot make two tabs atomic, so this is a deliberate safe skip.
  return { locked: false, error: "automatic commit skipped: browser lacks Web Locks" };
}
function readAutoSecret(roundId, nodeId) {
  try {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(autoSecretKey(roundId, nodeId)) : null;
    return stored && /^[0-9a-f]{64}$/i.test(stored) ? stored.toLowerCase() : null;
  } catch { return null; }
}
function persistAutoSecret(roundId, nodeId, secretHex) {
  try {
    if (typeof localStorage === "undefined") return false;
    const key = autoSecretKey(roundId, nodeId);
    localStorage.setItem(key, secretHex);
    return localStorage.getItem(key) === secretHex;
  } catch { return false; }
}
function forgetAutoSecret(roundId, nodeId) {
  try { localStorage?.removeItem(autoSecretKey(roundId, nodeId)); } catch {}
}

/** Pure duty planner: pulses always; existing open rounds may be committed/revealed. */
export function planTycheDuty(state, identity, opts = {}) {
  const nodeId = identity?.nodeId || null;
  const nowMs = Number.isFinite(Number(opts.nowMs)) ? Number(opts.nowMs) : Date.now();
  const timeAnchor = opts.timeAnchor || { now_ms: nowMs, source: opts.timeSource || "local-clock", quality: "fallback" };
  const entry = nodeId ? state?.roster?.[nodeId] : null;
  const ageMs = entry ? Math.max(0, nowMs - Number(entry.first_seen_ms || 0)) : 0;
  const eligible = Boolean(entry && ageMs >= MIN_AGE_MS);
  const maxCommits = Math.max(0, Number(opts.maxCommits ?? DEFAULT_MAX_AUTO_COMMITS));
  const maxReveals = Math.max(0, Number(opts.maxReveals ?? DEFAULT_MAX_AUTO_REVEALS));
  const maxRoundAgeMs = Math.max(0, Number(opts.maxRoundAgeMs ?? DEFAULT_MAX_AUTO_ROUND_AGE_MS));
  const rounds = Object.values(state?.rounds || {}).sort((a, b) => Number(a.round_id) - Number(b.round_id));
  const autoRound = (round) => {
    const openedAt = Number(round.opened_at_ms) || 0;
    return nowMs - openedAt <= maxRoundAgeMs;
  };
  const actions = [{ type: "pulse", reason: entry ? "keep-alive + accrue roster age" : "join roster + keep-alive" }];
  const commits = [];
  const reveals = [];
  if (eligible && nodeId) {
    for (const round of rounds) {
      if (commits.length >= maxCommits) break;
      if (!round.closed && !round.finalized && autoRound(round) && !round.commits?.[nodeId]) commits.push(Number(round.round_id));
    }
    for (const round of rounds) {
      if (reveals.length >= maxReveals || !round.closed || round.finalized || !round.commits?.[nodeId]) continue;
      if (round.reveals?.[nodeId] || round.recovered?.[nodeId]) continue;
      const next = (round.reveal_order || []).find((id) => !round.reveals?.[id] && !round.recovered?.[id]);
      if (next === nodeId && readAutoSecret(round.round_id, nodeId)) reveals.push(Number(round.round_id));
    }
  }
  for (const roundId of commits) actions.push({ type: "commit", round_id: roundId, reason: "age-eligible — contribute to open round" });
  for (const roundId of reveals) actions.push({ type: "reveal", round_id: roundId, reason: "next in randomized reveal order" });
  const summary = !entry
    ? "pulse · join roster"
    : !eligible
      ? `pulse · aging ${ageMs} / ${MIN_AGE_MS} ms`
      : commits.length || reveals.length
        ? `pulse + commit ${commits.length} · reveal ${reveals.length}`
        : rounds.some((r) => !r.closed && !r.finalized && autoRound(r)) ? "pulse · eligible · no new open-round work" : "pulse · eligible · no open rounds";
  return {
    schema: "tyche.network.duty.v1",
    node_id: nodeId,
    roster_age_ms: ageMs,
    min_age_ms: MIN_AGE_MS,
    randomness_eligible: eligible,
    open_count: rounds.filter((r) => !r.closed && !r.finalized).length,
    auto_open_count: rounds.filter((r) => !r.closed && !r.finalized && autoRound(r)).length,
    max_round_age_ms: maxRoundAgeMs,
    time_anchor: timeAnchor,
    actions,
    summary,
  };
}

export async function queryTycheDuty(opts = {}) {
  const identity = await ensureTycheIdentity();
  const state = await fetchTycheState();
  const timeAnchor = opts.timeAnchor?.now_ms
    ? opts.timeAnchor
    : Number.isFinite(Number(opts.nowMs))
      ? { now_ms: Number(opts.nowMs), source: "explicit", quality: "test-or-host" }
      : await resolveTycheTimeAnchor(opts.timeAnchorOptions);
  const plan = planTycheDuty(state, identity, { ...opts, nowMs: Number.isFinite(Number(opts.nowMs)) ? Number(opts.nowMs) : Date.now(), timeAnchor });
  return { identity, state, plan, time_anchor: timeAnchor, pulsed: false, committed: [], revealed: [], errors: [], plan_after: plan };
}

/** Execute one bounded duty cycle. It never opens/closes rounds or opens recovery. */
export async function runTycheDuty(onStatus, opts = {}) {
  const identity = await ensureTycheIdentity();
  let state = await fetchTycheState();
  const result = { identity, plan: null, time_anchor: null, pulsed: false, committed: [], revealed: [], errors: [], state };
  if (opts.pulse !== false) {
    onStatus?.("pulsing Tyche…");
    try { await pulseTyche(); result.pulsed = true; state = await fetchTycheState(); } catch (error) { result.errors.push({ action: { type: "pulse" }, error: error?.message || String(error) }); }
  }
  const timeAnchor = opts.timeAnchor?.now_ms
    ? opts.timeAnchor
    : Number.isFinite(Number(opts.nowMs))
      ? { now_ms: Number(opts.nowMs), source: "explicit", quality: "test-or-host" }
      : await resolveTycheTimeAnchor(opts.timeAnchorOptions);
  result.time_anchor = timeAnchor;
  const plan = planTycheDuty(state, identity, { ...opts, nowMs: Number.isFinite(Number(opts.nowMs)) ? Number(opts.nowMs) : Date.now(), timeAnchor });
  result.plan = plan;
  for (const action of plan.actions.filter((a) => a.type === "commit")) {
    let locked;
    try {
      locked = await withAutoSecretLock(action.round_id, async () => {
      let secretHex = readAutoSecret(action.round_id, identity.nodeId);
      if (!secretHex) {
        secretHex = hex(crypto.getRandomValues(new Uint8Array(32)));
        if (!persistAutoSecret(action.round_id, identity.nodeId, secretHex)) {
          return { error: "automatic commit skipped: local secret storage unavailable" };
        }
      }
      try {
        onStatus?.(`committing to round ${action.round_id}…`);
        await commitSecret(action.round_id, fromHex(secretHex));
        return { committed: true };
      } catch (error) {
        return { error: error?.message || String(error) };
      }
      });
    } catch (error) {
      result.errors.push({ action, error: error?.message || String(error) });
      continue;
    }
    if (!locked?.locked) {
      result.errors.push({ action, error: locked?.error || "automatic commit skipped: round lock unavailable" });
      continue;
    }
    if (locked.value?.committed) result.committed.push(action.round_id);
    if (locked.value?.error) result.errors.push({ action, error: locked.value.error });
  }
  if (result.committed.length) { try { state = await fetchTycheState(); } catch {} }
  const revealPlan = planTycheDuty(state, identity, { ...opts, nowMs: Number.isFinite(Number(opts.nowMs)) ? Number(opts.nowMs) : Date.now(), timeAnchor, pulse: false, maxCommits: 0 });
  for (const action of revealPlan.actions.filter((a) => a.type === "reveal")) {
    const secret = readAutoSecret(action.round_id, identity.nodeId);
    if (!secret) continue;
    try {
      onStatus?.(`revealing round ${action.round_id} in order…`);
      await revealSecret(action.round_id, secret);
      forgetAutoSecret(action.round_id, identity.nodeId);
      result.revealed.push(action.round_id);
    } catch (error) { result.errors.push({ action, error: error?.message || String(error) }); }
  }
  if (result.revealed.length) { try { state = await fetchTycheState(); } catch {} }
  result.state = state;
  result.plan_after = planTycheDuty(state, identity, { ...opts, nowMs: Number.isFinite(Number(opts.nowMs)) ? Number(opts.nowMs) : Date.now(), timeAnchor, pulse: false });
  return result;
}

export function watchTycheDuty(handlers = {}) {
  const { onDuty, onStatus, onError, intervalMs = DEFAULT_DUTY_INTERVAL_MS, runOnUpdate = true } = handlers;
  let stopped = false, busy = false, queued = null, queuedWaiters = [], timer = null, unsub = () => {};
  async function tick(reason) {
    if (stopped) return;
    if (busy) {
      queued = reason;
      return new Promise((resolve) => queuedWaiters.push(resolve));
    }
    busy = true;
    try {
      let result;
      if (reason === "update" || reason === "queued-update") {
        const planned = await queryTycheDuty(handlers);
        const actionable = planned.plan.actions.some((action) => action.type === "commit" || action.type === "reveal");
        result = actionable
          ? await runTycheDuty(onStatus, { ...handlers, pulse: false })
          : planned;
      } else {
        result = await runTycheDuty(onStatus, handlers);
      }
      if (!stopped) onDuty?.(result, reason);
    } catch (error) { if (!stopped) onError?.(error); }
    finally {
      busy = false;
      if (queued && !stopped) {
        const next = queued;
        queued = null;
        void tick(next === "update" ? "queued-update" : next).then(() => {
          const waiters = queuedWaiters.splice(0);
          for (const resolve of waiters) resolve();
        });
      } else {
        const waiters = queuedWaiters.splice(0);
        for (const resolve of waiters) resolve();
      }
    }
  }
  void tick("initial").then(() => { if (!stopped) timer = setInterval(() => void tick("interval"), intervalMs); });
  if (runOnUpdate) unsub = onContractUpdate(() => void tick("update"));
  // Manual UI actions use this same serialized queue instead of starting a
  // second pulse/commit/reveal cycle beside the watcher.
  const manualTick = () => tick("manual");
  globalThis.__tycheDutyTick = manualTick;
  return () => {
    stopped = true;
    unsub();
    if (timer) clearInterval(timer);
    if (globalThis.__tycheDutyTick === manualTick) delete globalThis.__tycheDutyTick;
  };
}

export function parseTycheState(bytes) { if (!bytes?.length) return structuredClone(EMPTY); const s = JSON.parse(new TextDecoder().decode(bytes)); if (s.schema_version !== 3) throw new Error("Tyche state schema mismatch: expected v3"); s.roster ||= {}; s.pulse ||= {}; s.excluded_nodes ||= []; s.rounds ||= {}; return s; }
export async function ensureTycheExists() { const key = tycheKey(), existing = await tryGetContractState(key, { timeoutMs: 6000 }); if (existing) { await getContractState(key, { fetchContract: true, subscribe: true, timeoutMs: 15000 }).catch(() => {}); return { key, state: parseTycheState(existing), created: false }; } throw new Error("Tyche v3 contract is not present on this node; publish it first"); }
export async function fetchTycheState() { const { key } = await ensureTycheExists(); return parseTycheState(await getContractState(key, { fetchContract: true, subscribe: true, timeoutMs: 15000 })); }
async function update(envelope) { const { key } = await ensureTycheExists(); await updateContract((await import("./put.js")).wrapDeltaUpdate(key, enc.encode(JSON.stringify(envelope))), key); return fetchTycheState(); }
export async function pulseTyche() { await ensureTycheIdentity(); const now = Date.now(), mono = typeof performance !== "undefined" ? Math.floor(performance.now()) : 0; return update({ pulse: await signPulseAuto({ wall_ms: now, monotonic_ms: mono, uncertainty_ms: 40 }) }); }
export async function openRound(roundId, openedAtMs) {
  const timeAnchor = Number.isFinite(Number(openedAtMs))
    ? { now_ms: Number(openedAtMs), source: "explicit", quality: "caller-supplied" }
    : await resolveTycheTimeAnchor();
  return update({ open_round: { round_id: roundId, opened_at_ms: timeAnchor.now_ms } });
}

/** Prepare and publish a commit. Recovery shares are returned for private out-of-band delivery. */
export async function commitSecret(roundId, secretBytes, { recoveryRecipients = [], threshold = 0 } = {}) {
  const { key } = await ensureTycheExists(); const identity = await ensureTycheIdentity();
  const secret = secretBytes instanceof Uint8Array ? secretBytes : Uint8Array.from(secretBytes);
  if (secret.length !== 32) throw new Error("Tyche secrets must be 32 bytes");
  let recipients = recoveryRecipients.map((r, i) => ({ nodeId: r.nodeId || r.recipient_id, x: r.x || i + 1 })).filter(r => r.nodeId);
  if (threshold === 0 && recipients.length) threshold = recipients.length;
  if (threshold === 0 && !recipients.length) { threshold = 0; }
  if (threshold !== 0 && (threshold < 2 || threshold > 32 || threshold > recipients.length)) throw new Error("recovery threshold must be 2..32 and no greater than the recipient count");
  if (new Set(recipients.map(r => r.x)).size !== recipients.length || recipients.some(r => !Number.isInteger(r.x) || r.x < 1 || r.x > 255)) throw new Error("recovery share x coordinates must be unique integers from 1 to 255");
  if (recipients.some(r => r.nodeId === identity.nodeId)) throw new Error("the source cannot also be a recovery recipient");
  const shares = threshold ? makeShares(secret, recipients, threshold) : [];
  const commitments = Object.fromEntries(shares.map(s => [s.recipient_id, { recipient_id: s.recipient_id, x: s.x, threshold: s.threshold, commitment: hex(recoveryCommitmentHash(roundId, identity.nodeId, s.recipient_id, s.x, s.threshold, fromHex(s.share_hex))) }]));
  const recovery_digest = threshold ? recoveryDigest(roundId, identity.nodeId, commitments) : "";
  const commitment = hex(hashCommitment(roundId, identity.nodeId, secret));
  const commit = await signCommitAuto(roundId, commitment, Date.now(), { recovery_threshold: threshold, recovery_digest, recovery_commitments: commitments });
  await updateContract((await import("./put.js")).wrapDeltaUpdate(key, enc.encode(JSON.stringify({ commit: { round_id: roundId, commit } }))), key);
  return { commit, secret_hex: hex(secret), recovery_shares: shares };
}
export async function closeRound(roundId) { return update({ close_commits: { round_id: roundId } }); }
export async function openRecovery(roundId) { return update({ open_recovery: { round_id: roundId } }); }
export async function revealSecret(roundId, secretHex) { return update({ reveal: { round_id: roundId, reveal: await signRevealAuto(roundId, secretHex) } }); }
export async function submitRecoveryShare(roundId, share) { return update({ recovery_share: { round_id: roundId, share: await signRecoveryShareAuto(roundId, share.source_id, share.recipient_id, share.x, share.threshold, share.share_hex) } }); }
export function currentFinalizedRound(state) { return Object.values(state?.rounds || {}).filter(r => r.finalized).sort((a, b) => a.round_id - b.round_id).at(-1) || null; }
export { resolveTycheTimeAnchor, ensureTycheIdentity, paramsBytes, TYCHE_WASM_HASH_B58, TYCHE_WASM_PATH, MIN_AGE_MS, DEFAULT_DUTY_INTERVAL_MS, DEFAULT_MAX_AUTO_ROUND_AGE_MS };
