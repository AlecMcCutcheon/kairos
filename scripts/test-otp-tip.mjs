/**
 * Unit tests for kairos/site/src/otp-tip.js (pure OTP-tip math).
 * Run: node kairos/scripts/test-otp-tip.mjs
 *
 * All timestamps (got_at_ms / gotAt / medianMs) share one epoch `BASE` so the
 * elapsed math behaves like real wall-clock values.
 */
import { strict as assert } from "node:assert";
import {
  gateOtpPulses,
  computeAnchoredTip,
  MAX_TIP_SLEW_MS,
  TIP_SLEW_FACTOR,
  MAX_ANCHOR_ELAPSED_MS,
  OTP_MAX_TIP_JUMP_MS,
} from "../site/src/otp-tip.js";

const BASE = 1_700_000_000_000;

let passed = 0;
let failed = 0;
function ok(name) {
  passed += 1;
  console.log(`  ok  ${name}`);
}
function fail(name, error) {
  failed += 1;
  console.error(`  FAIL ${name}: ${error?.message ?? error}`);
}

// ---- gateOtpPulses ----
console.log("\n== gateOtpPulses (relative freshness window) ==");
{
  try {
    assert.deepEqual(gateOtpPulses([]), []);
    ok("empty list -> []");
  } catch (e) { fail("empty list", e); }
  try {
    assert.deepEqual(gateOtpPulses(null), []);
    ok("null input -> []");
  } catch (e) { fail("null input", e); }

  const obs = [
    { node_id: "a", wall_ms: BASE + 1_000_000 },
    { node_id: "b", wall_ms: BASE + 990_000 },
    { node_id: "c", wall_ms: BASE + 600_000 },
  ];
  try {
    const gated = gateOtpPulses(obs);
    assert.equal(gated.length, 2, "stale pulse dropped");
    assert.ok(gated.some((o) => o.node_id === "a"), "freshest kept");
    assert.ok(gated.some((o) => o.node_id === "b"), "near-freshest kept");
    assert.ok(!gated.some((o) => o.node_id === "c"), "5-min-old dropped");
    ok("drops pulses older than window vs freshest");
  } catch (e) { fail("window filter", e); }

  try {
    const narrow = gateOtpPulses(obs, 5_000);
    assert.equal(narrow.length, 1, "custom window keeps only freshest");
    assert.equal(narrow[0].node_id, "a");
    ok("custom window respected");
  } catch (e) { fail("custom window", e); }

  try {
    const single = gateOtpPulses([{ node_id: "x", wall_ms: 42 }]);
    assert.equal(single.length, 1);
    ok("single observation always survives");
  } catch (e) { fail("single observation", e); }
}

// ---- computeAnchoredTip ----
console.log("\n== computeAnchoredTip (anchor + slew + guard + floor) ==");
{
  try {
    assert.equal(computeAnchoredTip({ prev: null, gotAt: 0, medianMs: null, confidenceMs: 80 }), null);
    ok("null median -> null");
  } catch (e) { fail("null median", e); }

  try {
    const r = computeAnchoredTip({ prev: null, gotAt: BASE, medianMs: BASE + 500, confidenceMs: 80 });
    assert.equal(r.otp_time_ms, BASE + 500);
    assert.equal(r.source, "bootstrap");
    assert.equal(r.jump_blocked, false);
    ok("no prev -> bootstrap uses raw median");
  } catch (e) { fail("bootstrap", e); }

  const prev = { otp_time_ms: BASE, got_at_ms: BASE };
  try {
    const r = computeAnchoredTip({ prev, gotAt: BASE + 30_000, medianMs: BASE + 30_000, confidenceMs: 80 });
    assert.equal(r.otp_time_ms, BASE + 30_000, "tip == expected when median agrees");
    assert.equal(r.slew_ms, 0);
    assert.equal(r.jump_blocked, false);
    assert.equal(r.source, "anchored");
    ok("zero drift -> anchored exactly at expected (prev + elapsed)");
  } catch (e) { fail("zero drift", e); }

  try {
    const r = computeAnchoredTip({ prev, gotAt: BASE + 30_000, medianMs: BASE + 40_000, confidenceMs: 80 });
    const drift = 10_000;
    const slew = Math.round(drift * TIP_SLEW_FACTOR);
    assert.equal(r.otp_time_ms, BASE + 30_000 + slew, "half the drift applied");
    assert.equal(r.slew_ms, slew);
    ok("small drift -> slew fraction toward median (not a jump)");
  } catch (e) { fail("small drift", e); }

  try {
    const r = computeAnchoredTip({ prev, gotAt: BASE + 30_000, medianMs: BASE + 90_000, confidenceMs: 80 });
    const drift = 60_000;
    const slew = Math.min(Math.round(drift * TIP_SLEW_FACTOR), MAX_TIP_SLEW_MS);
    assert.equal(r.slew_ms, MAX_TIP_SLEW_MS, "slew capped at MAX_TIP_SLEW_MS");
    assert.equal(r.otp_time_ms, BASE + 30_000 + slew);
    ok("large drift -> slew capped per refresh");
  } catch (e) { fail("slew cap", e); }

  try {
    const r = computeAnchoredTip({ prev, gotAt: BASE + 30_000, medianMs: BASE + 200_000, confidenceMs: 80 });
    assert.equal(r.jump_blocked, true);
    assert.equal(r.otp_time_ms, BASE, "holds previous tip");
    assert.equal(r.confidence_ms, Math.max(80, OTP_MAX_TIP_JUMP_MS), "confidence widened");
    assert.equal(r.source, "hold");
    ok("gross jump -> hold previous tip + widen confidence");
  } catch (e) { fail("jump guard", e); }

  try {
    const r = computeAnchoredTip({ prev, gotAt: BASE + 10_000, medianMs: BASE - 50_000, confidenceMs: 80 });
    assert.equal(r.otp_time_ms, BASE, "never moves below previous tip");
    ok("negative drift -> monotonic floor at prev tip");
  } catch (e) { fail("monotonic floor", e); }

  try {
    const r = computeAnchoredTip({
      prev,
      gotAt: prev.got_at_ms + 3_600_000, // 1 hour later
      medianMs: BASE + MAX_ANCHOR_ELAPSED_MS,
      confidenceMs: 80,
    });
    assert.equal(r.source, "reanchor", "stale anchor re-anchors");
    assert.equal(r.jump_blocked, false, "reanchor accepts the fresh median");
    assert.equal(r.otp_time_ms, BASE + MAX_ANCHOR_ELAPSED_MS, "reanchors to median");
    assert.ok(r.confidence_ms >= OTP_MAX_TIP_JUMP_MS, "confidence widened");
    ok("stale anchor (1h gap) -> re-anchor to median, not stuck hold");
  } catch (e) { fail("stale anchor reanchor", e); }

  try {
    // Regression for the stuck-tip bug: a stale anchor plus a median that is
    // far ahead must NOT hold the old tip forever; it must re-anchor. Without
    // the reanchor branch, |drift| = ~45min >> maxJumpMs -> hold, forever.
    const prevStale = { otp_time_ms: BASE, got_at_ms: BASE };
    const r = computeAnchoredTip({
      prev: prevStale,
      gotAt: BASE + 3_600_000,
      medianMs: BASE + 3_600_000, // network advanced a full hour
      confidenceMs: 80,
    });
    assert.equal(r.source, "reanchor");
    assert.equal(r.otp_time_ms, BASE + 3_600_000, "recovers to network time");
    assert.equal(r.jump_blocked, false);
    ok("long-offline recovery never sticks the tip at the old value");
  } catch (e) { fail("long-offline recovery", e); }

  try {
    // NaN / missing gotAt (bad caller) must not poison the tip with NaN.
    const r = computeAnchoredTip({ prev, gotAt: undefined, medianMs: BASE + 10_000, confidenceMs: 80 });
    assert.equal(r.source, "reanchor", "non-finite gap treated as stale");
    assert.equal(Number.isFinite(r.otp_time_ms), true, "tip stays finite");
    ok("non-finite elapsed -> re-anchor, no NaN propagation");
  } catch (e) { fail("NaN elapsed", e); }

  try {
    // Device clock rollback: gotAt < prev.got_at_ms. The elapsed gap clamps
    // to 0 (no negative elapsed), so expected == prev and the tip does not
    // jump backward.
    const r = computeAnchoredTip({
      prev,
      gotAt: prev.got_at_ms - 60_000,
      medianMs: BASE, // network time unchanged
      confidenceMs: 80,
    });
    assert.equal(r.otp_time_ms, BASE, "no backward jump on clock rollback");
    assert.equal(r.source, "anchored");
    ok("device clock rollback -> elapsed clamped to 0, no backward jump");
  } catch (e) { fail("clock rollback", e); }

  try {
    // Convergence: constant +10s drift. Each refresh slew = +5s, so the tip
    // advances elapsed(30s) + slew(5s) = 35s per step and trails the median by
    // exactly half the drift (5s) once it settles.
    // computeAnchoredTip does not return got_at_ms (the caller supplies it from
    // Date.now()); carry it forward here the same way otp-network-clock does.
    let tip = { otp_time_ms: BASE, got_at_ms: BASE };
    let previous = tip.otp_time_ms;
    for (let i = 1; i <= 6; i++) {
      const gotAt = tip.got_at_ms + 30_000;
      const medianMs = tip.otp_time_ms + 40_000;
      const result = computeAnchoredTip({ prev: tip, gotAt, medianMs, confidenceMs: 80 });
      tip = { otp_time_ms: result.otp_time_ms, got_at_ms: gotAt };
      assert.ok(tip.otp_time_ms >= previous, `step ${i}: monotonic non-decreasing`);
      previous = tip.otp_time_ms;
      assert.equal(result.jump_blocked, false);
    }
    const expectedFinal = BASE + 6 * (30_000 + Math.round(10_000 * TIP_SLEW_FACTOR));
    assert.equal(previous, expectedFinal, "tip advances 35s/step and settles");
    ok("multi-refresh convergence stays monotonic and settles");
  } catch (e) { fail("convergence", e); }
}

console.log(`\nPASS: ${passed} ok, ${failed} failed`);
process.exit(failed ? 1 : 0);
