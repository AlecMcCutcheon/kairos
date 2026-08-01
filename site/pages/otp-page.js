import {
  randomBase32,
  currentKairosOtp,
  verifyKairosOtp,
  otpEpochState,
  authPollProgress,
  adoptAuthClock,
  readAuthClock,
  readAuthSession,
  writeAuthSession,
  OTP_BIN_MS,
} from "../app.js?v=20260731ar";
import {
  fetchOtpNetworkClock,
  watchOtpNetworkClock,
} from "../live.bundle.js?v=20260731ar";

/**
 * OTP lab — Freenet Kairos subscribe (UpdateNotification) for authenticator tip;
 * Verify still does an independent Get.
 */
export function mountOtpPage() {
  const secretEl = document.getElementById("secret");
  const codeEl = document.getElementById("code");
  if (!secretEl || !codeEl) return null;

  const saved = readAuthSession();
  let secret = saved?.secret || randomBase32(20);
  let live = null;
  let displayedCode = saved?.code || null;
  let authHeldTip = readAuthClock()?.tip ?? null;
  let authHeldSeq =
    readAuthClock()?.sequence ?? saved?.seal ?? null;
  let busy = false;
  let syncQueued = false;
  let lastNetwork = null;

  const codeMeta = document.getElementById("code-meta");
  const tickLabel = document.getElementById("tick-label");
  const tickBar = document.getElementById("tick-bar");
  const forwardLabel = document.getElementById("forward-label");
  const forwardBar = document.getElementById("forward-bar");
  const netMarksEl = document.getElementById("net-marks");
  const receiptEl = document.getElementById("receipt");
  const stampMetrics = document.getElementById("stamp-metrics");
  const labError = document.getElementById("lab-error");
  const verifyInput = document.getElementById("verify-input");
  const verifyResult = document.getElementById("verify-result");
  const authStatus = document.getElementById("auth-status");
  const verifyStatus = document.getElementById("verify-status");
  const labelInput = document.getElementById("label");
  const authAccount = document.getElementById("auth-account");

  function showErr(msg) {
    if (!msg) {
      labError.hidden = true;
      labError.textContent = "";
      return;
    }
    labError.hidden = false;
    labError.textContent = msg;
  }

  function syncAccountLabel() {
    const name =
      (labelInput?.value || "kairos@freenet").trim() || "kairos@freenet";
    if (authAccount) authAccount.textContent = name;
  }

  function ensureMetricShell() {
    if (stampMetrics.dataset.ready === "1") return;
    stampMetrics.dataset.ready = "1";
    stampMetrics.innerHTML = `
      <div class="metric"><span class="label">Auth median</span><span class="value small" id="m-auth">—</span></div>
      <div class="metric"><span class="label">Auth source</span><span class="value" id="m-src">—</span></div>
      <div class="metric"><span class="label">Epoch</span><span class="value" id="m-epoch">—</span></div>
      <div class="metric"><span class="label">Pulses / sealed</span><span class="value small" id="m-net">—</span></div>
    `;
  }

  // Real network readings plotted inside the current countdown cycle. Every
  // fresh pulse median drops a mark; marks vanish at the next bin rollover.
  const MAX_NET_MARKS = 24;
  let netMarks = []; // [{ ms, el }]

  function addNetMark(measuredMs) {
    if (!netMarksEl || !Number.isFinite(measuredMs)) return;
    const el = document.createElement("i");
    el.className = "otp-net-mark";
    const mark = { ms: measuredMs, el };
    netMarks.push(mark);
    // Newest reading is the bright one; older marks stay as a dim trail.
    for (const m of netMarks) m.el.classList.toggle("latest", m === mark);
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 750);
    while (netMarks.length > MAX_NET_MARKS) {
      const oldest = netMarks.shift();
      oldest.el.remove();
    }
    netMarksEl.appendChild(el);
    // Position the new mark immediately — if we waited for the next paint,
    // it would sit (and flash) at the 0% edge while the async Get resolves.
    const now = Date.now();
    const auth = readAuthClock();
    const gotAt = auth?.got_at_ms ?? auth?.adopted_at_ms ?? now;
    positionNetMarks(
      (auth?.otp_time_ms ?? now) + Math.max(0, now - gotAt),
      OTP_BIN_MS,
    );
  }

  // Prune + position the real-mark trail for the given countdown estimate.
  // Marks from a finished bin are dropped (the cycle "reset"); the rest keep
  // a fixed in-cycle position (binEnd is constant until rollover).
  function positionNetMarks(smoothMs, bin) {
    if (!netMarks.length) return;
    const binStart = Math.floor(smoothMs / bin) * bin;
    const binEnd = binStart + bin;
    for (let i = netMarks.length - 1; i >= 0; i--) {
      const mark = netMarks[i];
      if (mark.ms < binStart) {
        mark.el.remove();
        netMarks.splice(i, 1);
        continue;
      }
      const pct = Math.max(
        0,
        Math.min(100, ((binEnd - mark.ms) / bin) * 100),
      );
      mark.el.style.left = `${pct}%`;
    }
  }

  function paintMeters(epoch) {
    ensureMetricShell();
    const auth = readAuthClock();
    const poll = authPollProgress(auth);
    const ageSec = Math.round((poll.tip_age_ms ?? 0) / 1000);
    // Subscribe mode: fill bar from tip freshness (cap ~60s visual).
    const ageCap = 60_000;
    const freshPct = Math.round(
      Math.max(0, Math.min(1, 1 - (poll.tip_age_ms ?? 0) / ageCap)) * 100,
    );
    // Smooth NTP-style countdown: anchored tip advanced by local elapsed time.
    // The bar drains continuously; a fresh reading only corrects the anchor
    // (slew), so the countdown never jumps — it seeks the real mark.
    const now = Date.now();
    const bin = OTP_BIN_MS;
    const gotAt = auth?.got_at_ms ?? auth?.adopted_at_ms ?? now;
    const tipMs = auth?.otp_time_ms ?? epoch?.otp_time_ms ?? now;
    const smoothMs = tipMs + Math.max(0, now - gotAt);
    const binEnd = (Math.floor(smoothMs / bin) + 1) * bin;
    const remainMs = Math.max(1, binEnd - smoothMs);
    const forwardPct = Math.round((remainMs / bin) * 100);

    tickLabel.textContent = `${ageSec}s ago`;
    tickBar.style.width = `${freshPct}%`;
    tickBar.dataset.level =
      freshPct > 60 ? "high" : freshPct > 25 ? "mid" : "low";

    forwardLabel.textContent = `${Math.round(remainMs / 1000)}s`;
    forwardBar.style.width = `${forwardPct}%`;
    forwardBar.dataset.level =
      forwardPct > 40 ? "high" : forwardPct > 15 ? "mid" : "low";

    // Real network marks — every fresh pulse median stays plotted for the
    // rest of the cycle (a dim trail of where the network actually was), not
    // just the latest one. All of them clear at the next bin rollover.
    positionNetMarks(smoothMs, bin);
    const latestMark = netMarks[netMarks.length - 1] ?? null;
    if (latestMark) {
      const driftSec = Math.round((latestMark.ms - smoothMs) / 100) / 10;
      latestMark.el.title =
        driftSec === 0
          ? "Real network mark — aligned"
          : `Real network mark ${driftSec > 0 ? "+" : ""}${driftSec}s`;
      if (Math.abs(driftSec) >= 1.5) {
        // Clamp: when the real mark already crossed the estimate's rollover
        // edge, show the next-bin countdown instead of a negative number.
        const netSec = Math.max(
          0,
          Math.round((binEnd - latestMark.ms) / 1000),
        );
        forwardLabel.textContent =
          `${Math.round(remainMs / 1000)}s · net ${netSec}s`;
      }
    }

    document.getElementById("m-auth").textContent =
      authHeldSeq != null ? `#${authHeldSeq}` : "—";
    document.getElementById("m-src").textContent =
      auth?.source || live?.source || "—";
    document.getElementById("m-epoch").textContent = String(
      epoch.counter ?? "—",
    );
    document.getElementById("m-net").textContent = lastNetwork
      ? `${lastNetwork.pulse_witnesses ?? "?"} / ${lastNetwork.sealed_count ?? "?"}`
      : "—";

    if (authStatus) {
      authStatus.textContent = auth?.source
        ? `Subscribed · pulse median #${authHeldSeq ?? "?"} · ${ageSec}s ago`
        : "Subscribing…";
    }
  }

  function persistSession(extra = {}) {
    writeAuthSession({
      secret,
      code: displayedCode,
      seal: authHeldSeq,
      tip: authHeldTip,
      counter: live?.counter ?? null,
      saved_at_ms: Date.now(),
      ...extra,
    });
  }

  function setLiveCode(code, counter, meta = {}) {
    if (code === displayedCode && codeEl.textContent === code) return;
    displayedCode = code;
    codeEl.textContent = code;
    codeMeta.textContent = `TOTP · pulse median #${meta.seq ?? authHeldSeq ?? "?"} · ${meta.source || "network"}`;
    if (receiptEl) {
      receiptEl.hidden = false;
      receiptEl.textContent = JSON.stringify(
        {
          code,
          counter,
          pulse_median_id: meta.tip ?? authHeldTip,
          auth_sequence: meta.seq ?? authHeldSeq,
          source: meta.source,
          note: "TOTP over Kairos pulse-map median; Get pulses first, then reads; Verify Gets independently",
        },
        null,
        2,
      );
    }
  }

  async function refreshFromAuthClock() {
    if (busy) {
      syncQueued = true;
      return;
    }
    busy = true;
    syncQueued = false;
    try {
      showErr("");
      const next = await currentKairosOtp(secret);
      if (next.sequence != null) authHeldSeq = Number(next.sequence);
      live = next;
      setLiveCode(live.code, live.counter, {
        seq: authHeldSeq,
        tip: authHeldTip,
        source: next.source,
      });
      paintMeters(live);
      persistSession();
    } catch (err) {
      showErr(err?.message || String(err));
    } finally {
      busy = false;
      if (syncQueued) void refreshFromAuthClock();
    }
  }

  async function applyNetworkTip(network, reason) {
    lastNetwork = network;
    // NEW CODE - TESTING: subscribe adopts without scheduling a Get poll
    const clock = adoptAuthClock(network, { subscribe: true });
    authHeldSeq = clock?.sequence ?? network.sequence;
    authHeldTip = network.tip;
    // Fresh real reading — plot it on the countdown bar. The mark stays for
    // the rest of this cycle (until the next bin rollover), so you can see
    // every real network measurement, not just the latest one.
    addNetMark(
      network.measured_median_ms ?? clock?.measured_median_ms ?? null,
    );
    await refreshFromAuthClock();
    if (authStatus) {
      authStatus.textContent = `Subscribed · pulse median #${authHeldSeq} (${reason})`;
    }
  }

  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // async function doAuthGet(reason) { ... poll timer ... }
  // NEW CODE - TESTING: manual refresh still does one Get (re-registers subscribe)
  async function doAuthGet(reason) {
    if (authStatus) {
      authStatus.textContent = `Get pulse median (${reason})…`;
    }
    try {
      showErr("");
      // Pulse first (submitPulse) so this read's median includes our fresh
      // observation, then Get the contract.
      const network = await fetchOtpNetworkClock(
        (msg) => {
          if (authStatus) authStatus.textContent = msg;
        },
        { pulse: true },
      );
      await applyNetworkTip(network, reason);
    } catch (err) {
      showErr(err?.message || String(err));
      if (authStatus) authStatus.textContent = "Get failed";
    }
  }

  function paintBeliefOnly() {
    const auth = readAuthClock();
    // Keep the real-mark trail aligned with the countdown cycle even before a
    // stamp exists (pulse-only mode): drop marks as their bins elapse so the
    // reset at each rollover is airtight regardless of the stamp gate below.
    if (auth?.otp_time_ms != null) {
      const now = Date.now();
      const gotAt = auth?.got_at_ms ?? auth?.adopted_at_ms ?? now;
      positionNetMarks(
        auth.otp_time_ms + Math.max(0, now - gotAt),
        OTP_BIN_MS,
      );
    }
    if (!auth?.stamp) return;
    if (live) {
      const epoch = otpEpochState({
        sequence: auth.sequence,
        sealed_at_ms: auth.sealed_at_ms,
        otp_time_ms: auth.otp_time_ms,
        stamp: auth.stamp,
      });
      live = { ...live, ...epoch, code: live.code, sequence: auth.sequence };
      authHeldSeq = Number(auth.sequence);
      paintMeters(live);
    } else {
      void refreshFromAuthClock();
    }
  }

  async function runVerify() {
    verifyResult.dataset.ok = "";
    verifyResult.textContent = "Verifier Get…";
    if (verifyStatus) verifyStatus.textContent = "Independent Freenet Get…";
    try {
      // Pulse first, then read — same as the authenticator Get.
      const network = await fetchOtpNetworkClock(
        (msg) => {
          if (verifyStatus) verifyStatus.textContent = msg;
        },
        { pulse: true },
      );
      lastNetwork = network;
      const result = await verifyKairosOtp(secret, verifyInput.value, {
        live: network,
      });
      verifyResult.dataset.ok = result.ok ? "1" : "0";
      verifyResult.textContent = result.ok
        ? result.reason
        : `Rejected — ${result.reason}`;
      if (verifyStatus) {
        verifyStatus.textContent = `Verify Get · pulse median #${network.sequence}`;
      }
      ensureMetricShell();
      document.getElementById("m-net").textContent =
        `${network.pulse_witnesses ?? "?"} / ${network.sealed_count ?? "?"}`;
    } catch (err) {
      verifyResult.dataset.ok = "0";
      verifyResult.textContent = err?.message || String(err);
      if (verifyStatus) verifyStatus.textContent = "Verify Get failed";
    }
  }

  const onNewSecret = () => {
    secret = randomBase32(20);
    secretEl.textContent = secret;
    displayedCode = null;
    verifyResult.textContent = "";
    persistSession();
    void doAuthGet("new-secret");
  };
  const onCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
    } catch {
      /* */
    }
  };
  const onVerify = () => void runVerify();
  const onCopy = () => {
    if (!displayedCode) return;
    verifyInput.value = displayedCode;
  };
  const onVerifyKey = (e) => {
    if (e.key === "Enter") void runVerify();
  };
  const onLabel = () => syncAccountLabel();

  document.getElementById("new-secret")?.addEventListener("click", onNewSecret);
  document.getElementById("copy-secret")?.addEventListener("click", onCopySecret);
  document.getElementById("verify-btn")?.addEventListener("click", onVerify);
  document.getElementById("copy-code")?.addEventListener("click", onCopy);
  verifyInput?.addEventListener("keydown", onVerifyKey);
  labelInput?.addEventListener("input", onLabel);

  secretEl.textContent = secret;
  syncAccountLabel();
  if (displayedCode) {
    codeEl.textContent = displayedCode;
    if (verifyInput) verifyInput.value = displayedCode;
  }
  ensureMetricShell();

  if (authStatus) authStatus.textContent = "Subscribing…";
  const stopWatch = watchOtpNetworkClock({
    onStatus: (msg) => {
      if (authStatus) authStatus.textContent = msg;
    },
    onClock: (network, reason) => {
      showErr("");
      void applyNetworkTip(network, reason);
    },
    onError: (err) => {
      showErr(err?.message || String(err));
      if (authStatus) authStatus.textContent = "Subscribe failed";
    },
  });

  const uiTimer = setInterval(paintBeliefOnly, 250);
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // const pulseTimer = setInterval(() => { void submitPulse()… }, 8_000);
  // NEW CODE - TESTING: site-wide network duty pulses; Subscribe refreshes tip

  return () => {
    stopWatch();
    clearInterval(uiTimer);
    document
      .getElementById("new-secret")
      ?.removeEventListener("click", onNewSecret);
    document
      .getElementById("copy-secret")
      ?.removeEventListener("click", onCopySecret);
    document
      .getElementById("verify-btn")
      ?.removeEventListener("click", onVerify);
    document.getElementById("copy-code")?.removeEventListener("click", onCopy);
    verifyInput?.removeEventListener("keydown", onVerifyKey);
    labelInput?.removeEventListener("input", onLabel);
  };
}
