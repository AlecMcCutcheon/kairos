/**
 * OTP network clock from live Kairos Freenet state.
 *
 * Tip = age + seal-reputation weighted pulse median (not raw public median).
 * Jump guard rejects sudden multi-bin leaps vs the last accepted tip.
 */
import {
  ensureKairosExists,
  fetchKairosState,
  submitPulse,
  otpTrustedPulseStats,
  OTP_MAX_TIP_JUMP_MS,
} from "./kairos-api.js";
import { onContractUpdate } from "./ws.js";
import { computeAnchoredTip } from "./otp-tip.js";

function hashTip(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1_000_000;
}

/**
 * @param {object} state
 * @param {{ prev?: object|null }} opts
 */
export function clockFromKairosState(state, opts = {}) {
  const sealedEntries = Object.entries(state.sealed_stamps || {}).sort(
    (a, b) =>
      (b[1].sealed_at_ms ?? b[1].median_wall_ms ?? 0) -
      (a[1].sealed_at_ms ?? a[1].median_wall_ms ?? 0),
  );
  const stats = otpTrustedPulseStats(state);
  const gotAt = Date.now();
  const sealed_count = sealedEntries.length;
  const prev = opts.prev || null;

  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // Raw pulseStats median of everyone — Sybil-floodable.
  // NEW CODE - TESTING: trusted weighted tip + jump guard
  if (stats.median_wall_ms != null) {
    // Anchor: advance the last accepted tip by local elapsed time, then apply
    // only a bounded fraction of the drift (NTP-style slew). A gross jump past
    // the guard holds the previous tip; the tip never moves backwards.
    const anchored = computeAnchoredTip({
      prev,
      gotAt,
      medianMs: stats.median_wall_ms,
      confidenceMs: stats.confidence_ms ?? 80,
      maxJumpMs: OTP_MAX_TIP_JUMP_MS,
    });
    const otp_time_ms = anchored.otp_time_ms;
    const jump_blocked = anchored.jump_blocked;
    const confidence_ms = anchored.confidence_ms;
    const tip = `pulse:${stats.trusted_mode}:${otp_time_ms}:${stats.trusted_count}`;
    // source: pulse-anchored | pulse-hold | pulse-bootstrap | pulse-reanchor
    const source =
      anchored.source === "hold"
        ? "pulse-hold"
        : anchored.source === "reanchor"
          ? "pulse-reanchor"
          : anchored.source === "bootstrap"
            ? "pulse-bootstrap"
            : "pulse-anchored";
    return {
      sequence: hashTip(tip),
      sealed_at_ms: gotAt,
      otp_time_ms,
      measured_median_ms: stats.median_wall_ms,
      request_id: tip,
      tip,
      source,
      got_at_ms: gotAt,
      pulse_witnesses: stats.witness_count,
      trusted_count: stats.trusted_count,
      trusted_mode: stats.trusted_mode,
      jump_blocked,
      slew_ms: anchored.slew_ms,
      sealed_count,
      stamp: {
        median_wall_ms: otp_time_ms,
        confidence_ms,
        error_ms: confidence_ms,
        median_abs_dev_ms: stats.median_abs_dev_ms,
        witness_count: stats.witness_count,
        source: "pulse",
      },
    };
  }

  if (sealedEntries.length) {
    const [requestId, s] = sealedEntries[0];
    const otp_time_ms = s.median_wall_ms;
    const tip = `sealed:${requestId}:${otp_time_ms}`;
    return {
      sequence: hashTip(tip),
      sealed_at_ms: s.sealed_at_ms ?? gotAt,
      otp_time_ms,
      measured_median_ms: s.median_wall_ms,
      request_id: requestId,
      tip,
      source: "sealed",
      got_at_ms: gotAt,
      pulse_witnesses: 0,
      sealed_count,
      stamp: {
        content_hash: s.content_hash,
        nonce: s.nonce,
        median_wall_ms: s.median_wall_ms,
        trimmed_mean_ms: s.trimmed_mean_ms,
        confidence_ms: s.confidence_ms ?? s.error_ms ?? 80,
        error_ms: s.error_ms ?? s.confidence_ms ?? 80,
        earliest_ms: s.earliest_ms,
        latest_ms: s.latest_ms,
        median_abs_dev_ms: s.median_abs_dev_ms,
        witness_count: s.witness_count,
        transcript_digest: s.transcript_digest,
        source: "sealed",
      },
    };
  }

  throw new Error(
    "No pulse map yet — stay on this page (site duty will pulse) or open Telemetry.",
  );
}

export async function fetchOtpNetworkClock(onStatus, opts = {}) {
  await ensureKairosExists(onStatus);
  if (opts.pulse === true) {
    onStatus?.("Pulsing keep-alive…");
    await submitPulse(onStatus).catch(() => null);
  }
  onStatus?.("Getting Kairos contract…");
  const state = await fetchKairosState();
  return clockFromKairosState(state, { prev: opts.prev || null });
}

export function watchOtpNetworkClock(handlers = {}) {
  const { onClock, onStatus, onError } = handlers;
  let stopped = false;
  let fetching = false;
  let queued = false;
  let unsubUpdate = () => {};
  let lastAccepted = null;

  async function refresh(reason) {
    if (stopped) return;
    if (fetching) {
      queued = true;
      return;
    }
    fetching = true;
    try {
      onStatus?.(
        reason === "update"
          ? "Contract update — refreshing tip…"
          : "Getting Kairos (subscribe)…",
      );
      const state = await fetchKairosState();
      if (stopped) return;
      const clock = clockFromKairosState(state, { prev: lastAccepted });
      if (!clock.jump_blocked) {
        lastAccepted = clock;
      }
      onClock?.(clock, reason);
    } catch (err) {
      if (!stopped) onError?.(err);
    } finally {
      fetching = false;
      if (queued && !stopped) {
        queued = false;
        void refresh("queued");
      }
    }
  }

  void (async () => {
    try {
      await ensureKairosExists(onStatus);
      if (stopped) return;
      unsubUpdate = onContractUpdate(() => {
        void refresh("update");
      });
      await refresh("initial");
    } catch (err) {
      if (!stopped) onError?.(err);
    }
  })();

  return () => {
    stopped = true;
    unsubUpdate();
  };
}
