import {
  ensureDemoOracleRunning,
  onDemoOracleUpdate,
  readDemoOracle,
  formatIso,
  formatConfidence,
  buildNotaryReceipt,
  effectiveInterval,
} from "../app.js?v=20260731ar";

/** Mount Demo oracle UI. Returns cleanup. */
export function mountDemoPage() {
  const metrics = document.getElementById("metrics");
  const witnesses = document.getElementById("witnesses");
  const modePill = document.getElementById("mode-pill");
  const receiptEl = document.getElementById("notary-receipt");
  const copyBtn = document.getElementById("copy-receipt");
  if (!metrics || !witnesses || !modePill) return null;

  let lastReceiptJson = "";

  function render(record) {
    if (!record?.stamp) return;
    const s = record.stamp;
    const interval = effectiveInterval(s, {
      sealedAtMs: record.sealed_at_ms,
      nowMs: Date.now(),
    });
    modePill.textContent = `Demo oracle · seal #${record.sequence}`;
    metrics.innerHTML = `
      <div class="metric"><span class="label">Seal #</span><span class="value">${record.sequence}</span></div>
      <div class="metric"><span class="label">Median</span><span class="value small">${formatIso(s.median_wall_ms)}</span></div>
      <div class="metric"><span class="label">Error</span><span class="value">${formatConfidence(s.error_ms ?? s.confidence_ms)}</span></div>
      <div class="metric"><span class="label">Interval</span><span class="value small">±${interval.error_ms} ms now</span></div>
      <div class="metric"><span class="label">Witnesses</span><span class="value">${s.witness_count}</span></div>
      <div class="metric"><span class="label">MAD</span><span class="value">${s.median_abs_dev_ms} ms</span></div>
      <div class="metric"><span class="label">Transcript</span><span class="value small">${String(s.transcript_digest || "—").slice(0, 12)}…</span></div>
      <div class="metric"><span class="label">Request</span><span class="value small">${String(record.request_id || "").slice(0, 28)}…</span></div>
    `;
    const med = s.median_wall_ms;
    const obs = s.observations || [];
    const maxDev = Math.max(...obs.map((o) => Math.abs(o.wall_ms - med)), 1);
    witnesses.innerHTML = obs
      .map((o) => {
        const dev = Math.abs(o.wall_ms - med);
        const pct = Math.max(8, 100 - (dev / maxDev) * 100);
        return `<li>
          <span class="id">${o.node_id}</span>
          <span class="bar"><i style="width:${pct}%"></i></span>
          <span>${dev} ms · ±${o.uncertainty_ms}</span>
        </li>`;
      })
      .join("");

    const receipt = buildNotaryReceipt({
      request_id: record.request_id,
      stamp: s,
      sealed_at_ms: record.sealed_at_ms,
      sequence: record.sequence,
      source: "kairos.demo",
    });
    lastReceiptJson = JSON.stringify(receipt, null, 2);
    if (receiptEl) receiptEl.textContent = lastReceiptJson;
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!lastReceiptJson) return;
      try {
        await navigator.clipboard.writeText(lastReceiptJson);
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy receipt";
        }, 1200);
      } catch {
        copyBtn.textContent = "Copy failed";
      }
    });
  }

  ensureDemoOracleRunning();
  render(readDemoOracle());
  const off = onDemoOracleUpdate(render);
  return typeof off === "function" ? off : null;
}
