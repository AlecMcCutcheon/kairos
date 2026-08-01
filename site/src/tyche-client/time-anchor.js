import { fetchKairosState, otpTrustedPulseStats } from "../kairos-api.js";

const DEFAULT_MAX_AGE_MS = 15 * 60_000;
const DEFAULT_MAX_SKEW_MS = 10 * 60_000;
const CACHE_TTL_MS = 30_000;
const STALE_GRACE_MS = 5 * 60_000;
const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 60_000;
let cachedAnchor = null;
let cachedAtMs = 0;
let failedRefreshes = 0;
let retryAtMs = 0;
let lastRefreshError = null;
let refreshInFlight = null;

function localFallback(nowMs, reason) {
  return {
    now_ms: nowMs,
    source: "local-fallback",
    quality: "bootstrap",
    confidence_ms: null,
    witness_count: 0,
    trusted_count: 0,
    reason,
  };
}

function cachedAnchorAt(localNow, maxAgeMs, maxSkewMs, allowGrace = false) {
  if (!cachedAnchor || localNow < cachedAtMs) return null;
  const elapsedMs = localNow - cachedAtMs;
  const anchoredNow = cachedAnchor.now_ms + elapsedMs;
  const ageMs = cachedAnchor.newest_pulse_ms > 0
    ? localNow - cachedAnchor.newest_pulse_ms
    : Infinity;
  const maxAllowedAge = maxAgeMs + (allowGrace ? STALE_GRACE_MS : 0);
  const skewMs = Math.abs(localNow - anchoredNow);
  if (ageMs < 0 || ageMs > maxAllowedAge || skewMs > maxSkewMs) return null;
  return {
    ...cachedAnchor,
    now_ms: anchoredNow,
    quality: ageMs > maxAgeMs ? "aged-stale" : cachedAnchor.quality,
    age_ms: Math.max(0, ageMs),
    skew_ms: skewMs,
    retry_in_ms: Math.max(0, retryAtMs - localNow),
  };
}

function noteRefreshFailure(error, localNow) {
  failedRefreshes += 1;
  const delay = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** Math.min(failedRefreshes - 1, 5));
  retryAtMs = localNow + delay;
  lastRefreshError = error?.message || String(error);
}

function noteRefreshSuccess() {
  failedRefreshes = 0;
  retryAtMs = 0;
  lastRefreshError = null;
}

function retainedAnchorOrFallback(localNow, maxAgeMs, maxSkewMs, reason) {
  const retained = cachedAnchorAt(localNow, maxAgeMs, maxSkewMs, true);
  if (retained) {
    return {
      ...retained,
      reason: `${reason}; retaining the last verified Kairos median`,
      last_error: lastRefreshError,
    };
  }
  return localFallback(localNow, reason);
}

async function refreshAnchor(localNow, maxAgeMs, maxSkewMs) {
  try {
    const kairosState = await fetchKairosState();
    const stats = otpTrustedPulseStats(kairosState);
    const median = Number(stats.median_wall_ms);
    const observations = Array.isArray(stats.observations) ? stats.observations : [];
    const newest = observations.reduce(
      (latest, observation) => Math.max(latest, Number(observation?.wall_ms) || 0),
      0,
    );
    const ageMs = newest > 0 ? localNow - newest : Infinity;
    const skewMs = median > 0 ? Math.abs(localNow - median) : Infinity;
    if (stats.trusted_mode !== "aged" || Number(stats.trusted_count) < 1) throw new Error("Kairos is still in bootstrap mode");
    if (!Number.isFinite(median) || median <= 0) throw new Error("Kairos has no usable pulse median");
    if (ageMs < 0 || ageMs > maxAgeMs) throw new Error("Kairos pulse median is stale");
    if (skewMs > maxSkewMs) throw new Error("Kairos median is outside the local-clock safety bound");

    cachedAnchor = {
      now_ms: median,
      source: "kairos-trusted-median",
      quality: "aged",
      confidence_ms: Number(stats.confidence_ms) || null,
      witness_count: Number(stats.witness_count) || observations.length,
      trusted_count: Number(stats.trusted_count) || 0,
      newest_pulse_ms: newest,
      age_ms: Math.max(0, ageMs),
      skew_ms: skewMs,
      reason: "age/reputation-weighted Kairos pulse median",
    };
    cachedAtMs = localNow;
    noteRefreshSuccess();
    return cachedAnchor;
  } catch (error) {
    noteRefreshFailure(error, localNow);
    throw error;
  } finally {
    refreshInFlight = null;
  }
}

function startAnchorRefresh(localNow, maxAgeMs, maxSkewMs) {
  if (!refreshInFlight) {
    refreshInFlight = refreshAnchor(localNow, maxAgeMs, maxSkewMs).catch(() => null);
  }
  return refreshInFlight;
}

/**
 * Resolve a soft network clock from Kairos without making Tyche depend on it.
 * Reads are stale-while-revalidate: the last verified median stays visible
 * during transient failures while a single shared refresh retries with backoff.
 */
export async function resolveTycheTimeAnchor({
  nowMs = Date.now(),
  maxAgeMs = DEFAULT_MAX_AGE_MS,
  maxSkewMs = DEFAULT_MAX_SKEW_MS,
} = {}) {
  const localNow = Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
  const freshCache = cachedAnchorAt(localNow, maxAgeMs, maxSkewMs);
  if (freshCache && localNow - cachedAtMs < CACHE_TTL_MS) return freshCache;

  if (localNow < retryAtMs) {
    return retainedAnchorOrFallback(localNow, maxAgeMs, maxSkewMs, "Kairos refresh is retrying");
  }

  const retained = retainedAnchorOrFallback(localNow, maxAgeMs, maxSkewMs, "Kairos refresh is pending");
  if (retained.source === "kairos-trusted-median") {
    void startAnchorRefresh(localNow, maxAgeMs, maxSkewMs);
    return retained;
  }

  const refreshed = await startAnchorRefresh(localNow, maxAgeMs, maxSkewMs);
  if (refreshed) return { ...refreshed };
  return retainedAnchorOrFallback(localNow, maxAgeMs, maxSkewMs, lastRefreshError || "Kairos unavailable");
}

export { DEFAULT_MAX_AGE_MS, DEFAULT_MAX_SKEW_MS, STALE_GRACE_MS };
