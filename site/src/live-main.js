/**
 * Live Freenet bootstrap for Kairos pages.
 * Site-wide network duty starts from app.js; Telemetry only paints on events.
 */
import {
  pulseStats,
  MIN_AGE_MS,
} from "./kairos-api.js";
import { witnessLabelFromNodeId } from "./identity.js";
import {
  watchNetworkDuty,
  MIN_STAMP_WITNESSES,
  EXAMPLE_STAMP_ID,
} from "./network-duty.js";

function formatIso(ms) {
  return new Date(ms).toISOString();
}

function formatConfidence(ms) {
  if (ms == null) return "—";
  if (ms < 1000) return `±${ms} ms`;
  return `±${(ms / 1000).toFixed(2)} s`;
}

function formatAge(ms) {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${(ms / 3_600_000).toFixed(1)}h`;
  return `${(ms / 86_400_000).toFixed(1)}d`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sortedSealedEntries(state) {
  return Object.entries(state.sealed_stamps || {}).sort((a, b) => {
    const ta = a[1]?.sealed_at_ms ?? a[1]?.median_wall_ms ?? 0;
    const tb = b[1]?.sealed_at_ms ?? b[1]?.median_wall_ms ?? 0;
    return tb - ta;
  });
}

function renderSealWitnessTable(state, el, identity) {
  if (!el) return;
  const entries = sortedSealedEntries(state).slice(0, 12);
  if (!entries.length) {
    el.innerHTML =
      `<p class="lede" style="font-size:0.9rem">No sealed stamps yet — witnesses appear here after a seal.</p>`;
    return;
  }
  const rows = [];
  for (const [requestId, s] of entries) {
    const ids = Array.isArray(s.witness_ids) ? s.witness_ids : [];
    const err = s.error_ms ?? s.confidence_ms ?? "—";
    const tag =
      requestId === EXAMPLE_STAMP_ID
        ? ` <span class="seal-tag">example</span>`
        : "";
    const sealCell = `
      <div class="seal-id-block">
        <button type="button" class="witness-key seal-id-btn" data-node-id="${escHtml(requestId)}" title="Copy seal request id">${escHtml(requestId)}</button>${tag}
        <span class="seal-meta">${formatIso(s.median_wall_ms)} · ±${err}ms · n=${s.witness_count ?? ids.length}</span>
        <span class="seal-meta mono">tx ${escHtml(s.transcript_digest || "—")}</span>
      </div>`;
    if (!ids.length) {
      rows.push(`<tr>
        <td>${sealCell}</td>
        <td class="seal-witness-cell"><span class="muted">no witness_ids</span></td>
      </tr>`);
      continue;
    }
    const witnessBits = ids
      .map((nid) => {
        const mine =
          identity && nid === identity.nodeId ? " (you)" : "";
        const label = witnessLabelFromNodeId(nid);
        const keyPrev = `${nid.slice(0, 12)}…`;
        return `<li>
          <span class="witness-label">${escHtml(label)}${mine}</span>
          <button type="button" class="witness-key" data-node-id="${escHtml(nid)}" title="Copy full node id">${escHtml(keyPrev)}</button>
        </li>`;
      })
      .join("");
    rows.push(`<tr>
      <td>${sealCell}</td>
      <td class="seal-witness-cell"><ul class="seal-witness-ids">${witnessBits}</ul></td>
    </tr>`);
  }
  el.innerHTML = `
    <table class="seal-witness-table">
      <thead>
        <tr><th scope="col">Seal</th><th scope="col">Witnesses</th></tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>`;
}

function renderSealed(state, sealedMetrics, sealedList, sealHelp = null) {
  if (!sealedMetrics || !sealedList) return;
  const sealed = state.sealed_stamps || {};
  const open = state.open_stamps || {};
  const openEntries = Object.entries(open);
  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // const entries = Object.entries(sealed).sort(...)
  // NEW CODE - TESTING: shared sort helper
  const entries = sortedSealedEntries(state);
  const exampleOpen = open[EXAMPLE_STAMP_ID];
  const exampleSealed = sealed[EXAMPLE_STAMP_ID];
  const exampleNote = exampleSealed
    ? "example sealed"
    : exampleOpen
      ? `example open ${Object.keys(exampleOpen.observations || {}).length}/${MIN_STAMP_WITNESSES}`
      : "example missing";
  sealedMetrics.innerHTML = `
    <div class="metric"><span class="label">Sealed count</span><span class="value">${entries.length}</span></div>
    <div class="metric"><span class="label">Open requests</span><span class="value">${openEntries.length}</span></div>
    <div class="metric"><span class="label">Example stamp</span><span class="value small">${exampleNote}</span></div>
    <div class="metric"><span class="label">Duty</span><span class="value small">${sealHelp || "—"}</span></div>
  `;
  const openLines = openEntries.length
    ? openEntries
        .slice(0, 6)
        .map(([id, req]) => {
          const n = Object.keys(req.observations || {}).length;
          const tag = id === EXAMPLE_STAMP_ID ? " (public example)" : "";
          return `open ${id}${tag} · ${n}/${MIN_STAMP_WITNESSES} observes`;
        })
        .join("\n")
    : "No open stamp requests.";
  if (!entries.length) {
    sealedList.textContent = `${openLines}\n\nNo sealed stamps yet. Need ≥${MIN_STAMP_WITNESSES} distinct aged observes (example id ${EXAMPLE_STAMP_ID}).`;
    return;
  }
  sealedList.textContent = [
    openLines,
    "",
    ...entries.slice(0, 8).map(([id, s]) => {
      const err = s.error_ms ?? s.confidence_ms;
      const tag = id === EXAMPLE_STAMP_ID ? " (public example)" : "";
      return [
        `${id}${tag}`,
        `  median=${formatIso(s.median_wall_ms)} error=±${err}ms`,
        `  interval=[${s.earliest_ms ?? "?"} … ${s.latest_ms ?? "?"}]`,
        `  witnesses=${s.witness_count} transcript=${s.transcript_digest || "—"}`,
      ].join("\n");
    }),
  ].join("\n");
}

function paintTelemetryFromDuty(detail) {
  const result = detail?.result || detail;
  if (!result?.state) return;
  const modePill = document.getElementById("mode-pill");
  const identityEl = document.getElementById("identity-status");
  const statusEl = document.getElementById("live-status");
  const metrics = document.getElementById("metrics");
  const witnesses = document.getElementById("witnesses");
  const sealedMetrics = document.getElementById("sealed-metrics");
  const sealedList = document.getElementById("sealed-list");
  const sealWitnesses = document.getElementById("seal-witnesses");
  if (!metrics || !witnesses) return;

  const state = result.state;
  const identity = result.identity;
  const stats = pulseStats(state);
  const dutySummary = result.plan?.summary || "—";

  if (statusEl) {
    if (result.errors?.length) {
      statusEl.hidden = false;
      statusEl.textContent = result.errors.map((e) => e.error).join("; ");
    } else {
      statusEl.hidden = true;
      statusEl.textContent = "";
    }
  }
  if (modePill) {
    modePill.textContent = "Live Freenet · duty";
    modePill.classList.add("live-pill");
  }
  if (identityEl && identity) {
    identityEl.textContent = `${identity.label} · via ${identity.backend} · ${dutySummary}`;
  }

  metrics.innerHTML = `
    <div class="metric"><span class="label">Median pulse</span><span class="value small">${stats.median_wall_ms != null ? formatIso(stats.median_wall_ms) : "—"}</span></div>
    <div class="metric"><span class="label">Pulse spread</span><span class="value">${formatConfidence(stats.confidence_ms)}</span></div>
    <div class="metric"><span class="label">Live pulses</span><span class="value">${stats.witness_count}</span></div>
    <div class="metric"><span class="label">Roster / eligible</span><span class="value small">${stats.roster_count} / ${stats.eligible_count}</span></div>
    <div class="metric"><span class="label">Sealed stamps</span><span class="value">${stats.sealed_count}</span></div>
    <div class="metric"><span class="label">Open stamps</span><span class="value">${stats.open_count}</span></div>
  `;

  const med = stats.median_wall_ms ?? 0;
  const maxDev = Math.max(
    ...stats.observations.map((o) => Math.abs(o.wall_ms - med)),
    1,
  );
  witnesses.innerHTML = stats.observations.length
    ? stats.observations
        .map((o) => {
          const dev = Math.abs(o.wall_ms - med);
          const pct = Math.max(8, 100 - (dev / maxDev) * 100);
          const entry = state.roster?.[o.node_id];
          const age = entry
            ? formatAge(entry.last_seen_ms - entry.first_seen_ms)
            : "?";
          const elig =
            entry && entry.last_seen_ms - entry.first_seen_ms >= MIN_AGE_MS
              ? "✓"
              : "·";
          const mine =
            identity && o.node_id === identity.nodeId ? " (you)" : "";
          const label = witnessLabelFromNodeId(o.node_id);
          const keyPrev = `${o.node_id.slice(0, 12)}…`;
          return `<li>
            <div class="witness-id">
              <span class="witness-label">${label}${mine}</span>
              <button type="button" class="witness-key" data-node-id="${o.node_id}" title="Copy full node id">${keyPrev}</button>
            </div>
            <span class="bar" title="drift ${dev} ms"><i style="width:${pct}%"></i></span>
            <span class="witness-meta">${elig} age ${age} · Δ${dev}ms</span>
          </li>`;
        })
        .join("")
    : `<li><span class="id">none yet</span><span></span><span>waiting for pulses</span></li>`;
  renderSealed(state, sealedMetrics, sealedList, dutySummary);
  renderSealWitnessTable(state, sealWitnesses, identity);
}

function bindWitnessKeyCopy(root) {
  root?.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.(".witness-key");
    if (!btn || !root.contains(btn)) return;
    const id = btn.getAttribute("data-node-id");
    if (!id) return;
    void navigator.clipboard.writeText(id).then(
      () => {
        btn.dataset.copied = "1";
        const prev = btn.textContent;
        btn.textContent = "copied";
        setTimeout(() => {
          btn.dataset.copied = "0";
          btn.textContent = prev;
        }, 1100);
      },
      () => {
        btn.textContent = "copy failed";
      },
    );
  });
}

function runTelemetryUi() {
  const modePill = document.getElementById("mode-pill");
  const witnesses = document.getElementById("witnesses");
  const sealWitnesses = document.getElementById("seal-witnesses");
  if (modePill) modePill.textContent = "Waiting for site duty…";

  const onDuty = (ev) => {
    paintTelemetryFromDuty(ev.detail);
  };
  window.addEventListener("kairos-duty", onDuty);
  if (globalThis.__kairosLastDuty) {
    paintTelemetryFromDuty(globalThis.__kairosLastDuty);
  }

  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // witnesses?.addEventListener("click", ...) — only pulse list
  // NEW CODE - TESTING: shared copy handler for pulse + seal tables
  bindWitnessKeyCopy(witnesses);
  bindWitnessKeyCopy(sealWitnesses);

  return () => {
    window.removeEventListener("kairos-duty", onDuty);
  };
}

/**
 * Singleton site-wide duty: pulse + example stamp + observe when eligible.
 * Safe to call from every page; only one watcher runs.
 */
export function ensureSiteNetworkDuty() {
  if (globalThis.__kairosSiteDutyStop) {
    return globalThis.__kairosSiteDutyStop;
  }
  globalThis.__kairosSiteDutyStop = watchNetworkDuty({
    onDuty: (result, reason) => {
      const detail = { result, reason };
      globalThis.__kairosLastDuty = detail;
      globalThis.dispatchEvent(
        new CustomEvent("kairos-duty", { detail }),
      );
    },
    onError: (err) => {
      console.warn("[kairos] network duty:", err);
      globalThis.dispatchEvent(
        new CustomEvent("kairos-duty-error", {
          detail: err instanceof Error ? err.message : String(err),
        }),
      );
    },
  });
  return globalThis.__kairosSiteDutyStop;
}

export function mountTelemetryPage() {
  return runTelemetryUi();
}

export {
  ensureKairosExists,
  submitPulse,
  fetchKairosState,
  pulseStats,
  openStamp,
  observeStamp,
  getKairosIdentitySummary,
} from "./kairos-api.js";

export {
  planNetworkDuty,
  queryNetworkDuty,
  runNetworkDuty,
  watchNetworkDuty,
  ensureExampleStamp,
  MIN_STAMP_WITNESSES,
  EXAMPLE_STAMP_ID,
  EXAMPLE_STAMP_CONTENT_HASH,
  EXAMPLE_STAMP_NONCE,
} from "./network-duty.js";

export {
  fetchOtpNetworkClock,
  clockFromKairosState,
  watchOtpNetworkClock,
} from "./otp-network-clock.js";

export { onContractUpdate } from "./ws.js";

// OLD CODE - KEEP UNTIL CONFIRMED WORKING
// document.addEventListener DOMContentLoaded → runTelemetryUi via data-kairos-live
// NEW CODE - TESTING: app.js mountPageScript mounts telemetry (works with soft-nav)
