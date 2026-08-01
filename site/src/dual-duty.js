/**
 * Dual public-good duty for the Kairos site.
 *
 * Kairos and Tyche keep separate identities and contracts. This coordinator only
 * runs their existing bounded client duties side by side; it never opens/closes
 * application rounds or changes either contract's consensus rules.
 */
import { watchNetworkDuty } from "./network-duty.js";
import { watchTycheDuty } from "./tyche-client/tyche-api.js";

const KAIROS_STOP = "__kairosSiteDutyStop";
const TYCHE_STOP = "__kairosTycheDutyStop";

function emit(type, detail) {
  try {
    globalThis.dispatchEvent(new CustomEvent(type, { detail }));
  } catch {
    /* Non-browser consumers can use callbacks instead. */
  }
}

export function ensureSiteDualDuty(handlers = {}) {
  if (globalThis[KAIROS_STOP] && globalThis[TYCHE_STOP]) {
    return globalThis.__kairosDualDutyStop;
  }

  const {
    onKairosDuty,
    onTycheDuty,
    onStatus,
    onError,
    kairos = {},
    tyche = {},
  } = handlers;

  const kairosStop = globalThis[KAIROS_STOP] || watchNetworkDuty({
    ...kairos,
    onStatus: (message, reason) => onStatus?.("kairos", message, reason),
    onError: (error) => {
      onError?.("kairos", error);
      emit("dual-duty-error", { service: "kairos", error });
    },
    onDuty: (result, reason) => {
      const detail = { service: "kairos", result, reason };
      globalThis.__kairosLastDuty = detail;
      onKairosDuty?.(result, reason);
      emit("dual-duty", detail);
      emit("kairos-duty", { result, reason });
    },
  });
  const tycheStop = globalThis[TYCHE_STOP] || watchTycheDuty({
    ...tyche,
    onStatus: (message) => onStatus?.("tyche", message),
    onError: (error) => {
      onError?.("tyche", error);
      emit("dual-duty-error", { service: "tyche", error });
    },
    onDuty: (result, reason) => {
      const detail = { service: "tyche", result, reason };
      globalThis.__kairosLastTycheDuty = detail;
      onTycheDuty?.(result, reason);
      emit("dual-duty", detail);
      emit("tyche-duty", { result, reason });
    },
  });

  globalThis[KAIROS_STOP] = kairosStop;
  globalThis[TYCHE_STOP] = tycheStop;
  globalThis.__kairosDualDutyStop = () => {
    globalThis[KAIROS_STOP]?.();
    globalThis[TYCHE_STOP]?.();
    delete globalThis[KAIROS_STOP];
    delete globalThis[TYCHE_STOP];
    delete globalThis.__kairosDualDutyStop;
  };
  return globalThis.__kairosDualDutyStop;
}
