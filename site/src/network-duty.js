/**
 * Network duty — one client surface that decides how this witness should help
 * Kairos right now (pulse always; observe open stamps when age-eligible).
 *
 * Same Freenet WebSocket as Get/Update/Subscribe — not a separate HTTP API.
 * Apps call `runNetworkDuty()` on a timer, or `watchNetworkDuty()` for
 * Subscribe + periodic duty.
 */
import {
  ensureKairosExists,
  fetchKairosState,
  submitPulse,
  observeStamp,
  openStamp,
  MIN_AGE_MS,
  getKairosIdentitySummary,
} from "./kairos-api.js";
import { onContractUpdate } from "./ws.js";

/** Must match contract MIN_STAMP_WITNESSES. */
export const MIN_STAMP_WITNESSES = 5;
export const MAX_OBSERVE_PER_DUTY = 5;
export const DEFAULT_DUTY_INTERVAL_MS = 8_000;

/**
 * Public example stamp — deterministic id so the lab always has something to
 * show / recreate after prune. Apps with real content use their own opens.
 */
export const EXAMPLE_STAMP_CONTENT_HASH = "kairos.public.example.v1";
export const EXAMPLE_STAMP_NONCE = "v1";
export const EXAMPLE_STAMP_ID = `${EXAMPLE_STAMP_CONTENT_HASH}:${EXAMPLE_STAMP_NONCE}`;

/** Open the public example stamp if neither open nor sealed. */
export async function ensureExampleStamp(state, onStatus) {
  if (
    state?.sealed_stamps?.[EXAMPLE_STAMP_ID] ||
    state?.open_stamps?.[EXAMPLE_STAMP_ID]
  ) {
    return { opened: false, request_id: EXAMPLE_STAMP_ID };
  }
  onStatus?.("Opening public example stamp…");
  await openStamp(EXAMPLE_STAMP_CONTENT_HASH, EXAMPLE_STAMP_NONCE, onStatus);
  return { opened: true, request_id: EXAMPLE_STAMP_ID };
}

/**
 * Pure plan: what should this identity do given current state?
 */
export function planNetworkDuty(state, identity, opts = {}) {
  const nodeId = identity?.nodeId || null;
  const me = nodeId ? state.roster?.[nodeId] : null;
  const ageMs = me ? me.last_seen_ms - me.first_seen_ms : 0;
  const stamp_eligible = Boolean(me && ageMs >= MIN_AGE_MS);
  const open = Object.entries(state.open_stamps || {});
  const maxObs = opts.maxObserve ?? MAX_OBSERVE_PER_DUTY;
  const observe_ids = stamp_eligible
    ? open
        .filter(([, req]) => !req.observations?.[nodeId])
        .map(([id]) => id)
        .slice(0, maxObs)
    : [];

  /** @type {{ type: string, request_id?: string, reason: string }[]} */
  const actions = [];
  if (opts.pulse !== false) {
    actions.push({
      type: "pulse",
      reason: me
        ? "keep-alive + accrue roster age"
        : "join roster + keep-alive",
    });
  }
  for (const request_id of observe_ids) {
    actions.push({
      type: "observe_stamp",
      request_id,
      reason: "age-eligible — help seal open request",
    });
  }

  let summary;
  if (!me) {
    summary = "pulse · join roster";
  } else if (!stamp_eligible) {
    summary = `pulse · aging ${ageMs} / ${MIN_AGE_MS} ms`;
  } else if (observe_ids.length) {
    summary = `pulse + observe ${observe_ids.length} open`;
  } else if (open.length) {
    summary = "pulse · eligible · already observed open";
  } else {
    summary = "pulse · eligible · no open requests";
  }

  return {
    schema: "kairos.network.duty.v1",
    node_id: nodeId,
    roster_age_ms: ageMs,
    min_age_ms: MIN_AGE_MS,
    stamp_eligible,
    open_count: open.length,
    sealed_count: Object.keys(state.sealed_stamps || {}).length,
    min_stamp_witnesses: MIN_STAMP_WITNESSES,
    actions,
    summary,
  };
}

/**
 * Query plan only (Get + decide). Does not write.
 */
export async function queryNetworkDuty(onStatus, opts = {}) {
  await ensureKairosExists(onStatus);
  const identity = await getKairosIdentitySummary(onStatus);
  const state = await fetchKairosState();
  return {
    identity,
    state,
    plan: planNetworkDuty(state, identity, opts),
  };
}

/**
 * Execute one duty cycle: ensure example stamp, pulse, observe open stamps.
 */
export async function runNetworkDuty(onStatus, opts = {}) {
  await ensureKairosExists(onStatus);
  const identity = await getKairosIdentitySummary(onStatus);
  let state = await fetchKairosState();

  let example = { opened: false, request_id: EXAMPLE_STAMP_ID };
  if (opts.ensureExample !== false) {
    try {
      example = await ensureExampleStamp(state, onStatus);
      if (example.opened) {
        state = await fetchKairosState();
      }
    } catch (err) {
      /* example open is best-effort */
      example = {
        opened: false,
        request_id: EXAMPLE_STAMP_ID,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  const plan = planNetworkDuty(state, identity, opts);
  const result = {
    identity,
    plan,
    pulsed: false,
    observed: [],
    example,
    errors: [],
    state,
  };

  for (const action of plan.actions) {
    try {
      if (action.type === "pulse") {
        onStatus?.(plan.summary);
        await submitPulse(onStatus);
        result.pulsed = true;
      } else if (action.type === "observe_stamp" && action.request_id) {
        onStatus?.(`Observing ${action.request_id}…`);
        await observeStamp(action.request_id, onStatus);
        result.observed.push(action.request_id);
      }
    } catch (err) {
      result.errors.push({
        action,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (result.pulsed || result.observed.length || example.opened) {
    state = await fetchKairosState();
    result.state = state;
  }
  result.plan_after = planNetworkDuty(state, identity, {
    ...opts,
    pulse: false,
  });
  return result;
}

/**
 * Keep helping automatically: interval runs full duty; Subscribe updates only
 * refresh state (no write) so the UI stays live without pulse feedback loops.
 * @returns {() => void} stop
 */
export function watchNetworkDuty(handlers = {}) {
  const {
    onDuty,
    onStatus,
    onError,
    intervalMs = DEFAULT_DUTY_INTERVAL_MS,
    runOnUpdate = true,
  } = handlers;
  let stopped = false;
  let busy = false;
  let queued = null;
  let unsub = () => {};
  let timer = null;

  async function tick(reason) {
    if (stopped) return;
    if (busy) {
      queued = reason;
      return;
    }
    busy = true;
    try {
      // OLD CODE - KEEP UNTIL CONFIRMED WORKING
      // const result = await runNetworkDuty(...) on every update → pulse storm
      // NEW CODE - TESTING: updates = read-only refresh; interval/initial = write duty
      let result;
      if (reason === "update" || reason === "queued-update") {
        const q = await queryNetworkDuty((msg) => onStatus?.(msg, reason));
        result = {
          identity: q.identity,
          plan: q.plan,
          pulsed: false,
          observed: [],
          example: { opened: false, request_id: EXAMPLE_STAMP_ID },
          errors: [],
          state: q.state,
          plan_after: q.plan,
        };
      } else {
        result = await runNetworkDuty((msg) => onStatus?.(msg, reason));
      }
      if (!stopped) onDuty?.(result, reason);
    } catch (err) {
      if (!stopped) onError?.(err);
    } finally {
      busy = false;
      if (queued && !stopped) {
        const next = queued;
        queued = null;
        void tick(next === "update" ? "queued-update" : next);
      }
    }
  }

  void (async () => {
    try {
      await ensureKairosExists(onStatus);
      if (stopped) return;
      await fetchKairosState();
      if (runOnUpdate) {
        unsub = onContractUpdate(() => {
          void tick("update");
        });
      }
      await tick("initial");
      timer = setInterval(() => void tick("interval"), intervalMs);
    } catch (err) {
      if (!stopped) onError?.(err);
    }
  })();

  return () => {
    stopped = true;
    unsub();
    if (timer) clearInterval(timer);
  };
}
