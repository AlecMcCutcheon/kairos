/**
 * Pure OTP-tip math for Kairos.
 *
 * Two NTP-style clock-discipline problems live here:
 *
 * 1. Freshness gating. The pulse map holds each node's LATEST pulse, which can
 *    be many minutes old. Averaging absolute wall-clock readings taken at
 *    different real moments is only sound when the readings are
 *    near-simultaneous, so the set is gated to pulses within a window of the
 *    freshest one. The window is RELATIVE to the freshest pulse (not to a
 *    trusted "now"), so a wrong device clock can neither hide nor reveal
 *    pulses.
 *
 * 2. Anchoring. Instead of jumping to the newest raw median, advance the last
 *    accepted tip by local elapsed time (expected = prev + elapsed), then
 *    correct only a bounded fraction of the drift (slew). A gross jump past
 *    the guard holds the previous tip instead. The tip never moves backwards
 *    (monotonic floor) so TOTP bins don't repeat.
 *
 * This module is pure (no browser/node side effects) so it can be unit-tested
 * with plain node.
 */

/** Keep pulses within this many ms of the freshest pulse for the OTP tip. */
export const MAX_OTP_PULSE_SPREAD_MS = 5 * 60_000;
/** Max per-refresh correction of the anchored tip (one TOTP bin = 30s). */
export const MAX_TIP_SLEW_MS = 30_000;
/** Correct this fraction of the drift each refresh (NTP-ish low-pass). */
export const TIP_SLEW_FACTOR = 0.5;
/** Cap elapsed time used to advance the anchor (tab sleep / clock jump). */
export const MAX_ANCHOR_ELAPSED_MS = 15 * 60_000;
/** Ignore tip jumps larger than this vs expected (3×30s bins). */
export const OTP_MAX_TIP_JUMP_MS = 90_000;

export function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

/**
 * Keep only observations whose wall_ms is within `maxSpreadMs` of the freshest
 * pulse. The freshest pulse always survives (it is the reference), so the
 * result is never empty when the input is non-empty.
 */
export function gateOtpPulses(observations, maxSpreadMs = MAX_OTP_PULSE_SPREAD_MS) {
  const list = Array.isArray(observations) ? observations : [];
  if (!list.length) return [];
  let freshest = 0;
  for (const o of list) {
    const wall = Number(o?.wall_ms) || 0;
    if (wall > freshest) freshest = wall;
  }
  if (!freshest) return list;
  return list.filter((o) => freshest - (Number(o?.wall_ms) || 0) <= maxSpreadMs);
}

/**
 * Compute the anchored OTP tip from the freshness-gated pulse median.
 *
 * - No previous tip (first read): bootstrap — use the raw median as-is.
 * - Stale anchor (elapsed gap since prev > maxElapsedMs — tab slept, node was
 *   down, or the tip was held too long): re-anchor to the fresh median with
 *   widened confidence instead of holding forever. Without this, the jump
 *   guard would hold the old tip on every refresh and the tip would be stuck
 *   until a page reload.
 * - Otherwise: expected = prev.otp_time_ms + clamp(gotAt - prev.got_at_ms).
 *   drift = medianMs - expected. If |drift| exceeds the jump guard, hold the
 *   previous tip and widen confidence (attacker may be yanking the map). Else
 *   slew: correction = clamp(round(drift * slewFactor), ±maxSlewMs), and
 *   tip = max(expected + correction, prev.otp_time_ms) — never backwards.
 *
 * Returns { otp_time_ms, confidence_ms, jump_blocked, source, slew_ms } or
 * null when medianMs is missing. source is one of bootstrap | reanchor |
 * anchored | hold.
 */
export function computeAnchoredTip({
  prev,
  gotAt,
  medianMs,
  confidenceMs = 80,
  maxJumpMs = OTP_MAX_TIP_JUMP_MS,
  slewFactor = TIP_SLEW_FACTOR,
  maxSlewMs = MAX_TIP_SLEW_MS,
  maxElapsedMs = MAX_ANCHOR_ELAPSED_MS,
}) {
  if (medianMs == null || !Number.isFinite(medianMs)) return null;
  if (!prev || prev.otp_time_ms == null || prev.got_at_ms == null) {
    return {
      otp_time_ms: medianMs,
      confidence_ms: confidenceMs,
      jump_blocked: false,
      source: "bootstrap",
      slew_ms: 0,
    };
  }
  const rawElapsed = gotAt - prev.got_at_ms;
  // A non-finite gap (missing/NaN gotAt) or a gap beyond the cap means the
  // anchor is too old to trust — re-anchor instead of computing a meaningless
  // expected. A non-finite gap can also be caused by a bad caller value, so
  // treat it as stale too rather than letting NaN propagate into the tip.
  const staleAnchor = !Number.isFinite(rawElapsed) || rawElapsed > maxElapsedMs;
  if (staleAnchor) {
    return {
      otp_time_ms: Math.max(medianMs, prev.otp_time_ms),
      confidence_ms: Math.max(confidenceMs, maxJumpMs),
      jump_blocked: false,
      source: "reanchor",
      slew_ms: 0,
    };
  }
  const elapsed = clamp(rawElapsed, 0, maxElapsedMs);
  const expected = prev.otp_time_ms + elapsed;
  const drift = medianMs - expected;
  if (Math.abs(drift) > maxJumpMs) {
    return {
      otp_time_ms: prev.otp_time_ms,
      confidence_ms: Math.max(confidenceMs, maxJumpMs),
      jump_blocked: true,
      source: "hold",
      slew_ms: 0,
    };
  }
  const slew = clamp(Math.round(drift * slewFactor), -maxSlewMs, maxSlewMs);
  const candidate = expected + slew;
  const otp_time_ms = Math.max(candidate, prev.otp_time_ms);
  return {
    otp_time_ms,
    confidence_ms: confidenceMs,
    jump_blocked: false,
    source: "anchored",
    slew_ms: slew,
  };
}
