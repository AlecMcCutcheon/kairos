/**
 * Kairos identity Freenet delegate — register + EnsureIdentity / Sign*.
 * Falls back to local durable identity.js when the delegate is unavailable.
 */
import { blake3 } from "@noble/hashes/blake3";
import { DelegateRequest } from "@freenetorg/freenet-stdlib";
import {
  KAIROS_IDENTITY_KEY_BYTES,
  KAIROS_IDENTITY_CODE_HASH_BYTES,
  KAIROS_IDENTITY_WASM_PATH,
  kairosIdentityReady,
} from "./kairos-identity-constants.js";
import {
  getFreenetApi,
  onDelegatePayloads,
  onDelegateResponseRaw,
  onFreenetConnDrop,
  onFreenetHostError,
} from "./ws.js";
import {
  getWitness,
  getWitnessSummary,
  signPulse as localSignPulse,
  signStampObserve as localSignStampObserve,
} from "./identity.js";

let registerOnce = null;
let identityCache = null;

function bytesEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function nonce() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomCipher32() {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf);
}

export function waitForDelegate(match, timeoutMs = 20_000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsub();
      unsubDrop();
      unsubHost();
      fn();
    };
    const timer = setTimeout(() => {
      finish(() => reject(new Error("delegate response timeout")));
    }, timeoutMs);
    const unsubDrop = onFreenetConnDrop((err) => finish(() => reject(err)));
    const unsubHost = onFreenetHostError((err) => finish(() => reject(err)));
    const unsub = onDelegatePayloads((payloads) => {
      for (const raw of payloads) {
        if (match(raw)) finish(() => resolve(raw));
      }
    });
  });
}

async function sendDelegateMessage(message) {
  const api = await getFreenetApi();
  const payload = Array.from(
    new TextEncoder().encode(JSON.stringify(message)),
  );
  const clientReqModule = await import(
    "@freenetorg/freenet-stdlib/client-request"
  );
  const {
    ClientRequestT,
    ClientRequestType,
    ApplicationMessagesT,
    DelegateKeyT,
    DelegateRequestType,
    InboundDelegateMsgT,
    InboundDelegateMsgType,
  } = clientReqModule;
  const { ApplicationMessageT } = await import(
    "@freenetorg/freenet-stdlib/common"
  );

  const appMsg = new ApplicationMessageT(payload, [], false);
  const inbound = new InboundDelegateMsgT(
    InboundDelegateMsgType.common_ApplicationMessage,
    appMsg,
  );
  const delegateKey = new DelegateKeyT(
    KAIROS_IDENTITY_KEY_BYTES,
    KAIROS_IDENTITY_CODE_HASH_BYTES,
  );
  const appMessages = new ApplicationMessagesT(delegateKey, [], [inbound]);
  const delegateReq = new DelegateRequest(
    DelegateRequestType.ApplicationMessages,
    appMessages,
  );
  const clientReq = new ClientRequestT(
    ClientRequestType.DelegateRequest,
    delegateReq,
  );
  api.sendRequest(clientReq);
}

async function registerDelegate() {
  if (!kairosIdentityReady()) {
    throw new Error("kairos-identity constants missing — run scripts/build.sh");
  }
  const path = KAIROS_IDENTITY_WASM_PATH;
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`failed to fetch ${path}: ${resp.status}`);
  const wasm = new Uint8Array(await resp.arrayBuffer());
  const digest = Array.from(blake3(wasm));
  if (!bytesEqual(digest, KAIROS_IDENTITY_CODE_HASH_BYTES)) {
    throw new Error(
      "kairos-identity WASM BLAKE3 mismatch — rebuild + republish website",
    );
  }

  const clientReqModule = await import(
    "@freenetorg/freenet-stdlib/client-request"
  );
  const {
    ClientRequestT,
    ClientRequestType,
    DelegateRequestType,
    DelegateType,
    RegisterDelegateT,
    DelegateContainerT,
    WasmDelegateV1T,
    DelegateCodeT,
    DelegateKeyT,
  } = clientReqModule;

  const code = new DelegateCodeT(Array.from(wasm), KAIROS_IDENTITY_CODE_HASH_BYTES);
  const key = new DelegateKeyT(
    KAIROS_IDENTITY_KEY_BYTES,
    KAIROS_IDENTITY_CODE_HASH_BYTES,
  );
  const wasmDelegate = new WasmDelegateV1T([], code, key);
  const container = new DelegateContainerT(
    DelegateType.WasmDelegateV1,
    wasmDelegate,
  );
  const register = new RegisterDelegateT(
    container,
    randomCipher32(),
    new Array(24).fill(0),
  );
  const delegateReq = new DelegateRequest(
    DelegateRequestType.RegisterDelegate,
    register,
  );
  const clientReq = new ClientRequestT(
    ClientRequestType.DelegateRequest,
    delegateReq,
  );

  const api = await getFreenetApi();
  const pending = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsub();
      reject(new Error("RegisterDelegate kairos-identity timed out"));
    }, 45_000);
    const unsub = onDelegateResponseRaw((r) => {
      const k = r.key?.key;
      if (!k || !bytesEqual(k, KAIROS_IDENTITY_KEY_BYTES)) return;
      clearTimeout(timer);
      unsub();
      resolve();
    });
  });
  api.sendRequest(clientReq);
  try {
    await pending;
  } catch (err) {
    // Delegate may already be registered — probe EnsureIdentity.
    try {
      await ensureViaDelegate(8_000);
      return;
    } catch {
      throw err;
    }
  }
}

async function ensureViaDelegate(timeoutMs = 20_000) {
  const n = nonce();
  const pending = waitForDelegate(
    (p) =>
      (p.type === "Identity" || p.type === "Error") &&
      (!p.nonce || p.nonce === n),
    timeoutMs,
  );
  await sendDelegateMessage({ type: "EnsureIdentity", nonce: n });
  const res = await pending;
  if (res.type === "Error") {
    throw new Error(res.message || "EnsureIdentity failed");
  }
  identityCache = {
    nodeId: res.node_id,
    label: res.label,
    backend: "delegate",
    created: !!res.created,
  };
  return identityCache;
}

/** Register delegate once, EnsureIdentity, return summary. */
export async function ensureKairosIdentity(onStatus) {
  if (identityCache?.backend === "delegate") return identityCache;
  if (!kairosIdentityReady()) {
    onStatus?.("Identity: local durable key (delegate not built)");
    const local = await getWitnessSummary();
    identityCache = { ...local, backend: "local" };
    return identityCache;
  }
  try {
    onStatus?.("Registering kairos-identity delegate…");
    if (!registerOnce) registerOnce = registerDelegate().catch((e) => {
      registerOnce = null;
      throw e;
    });
    await registerOnce;
    onStatus?.("Ensuring witness identity…");
    return await ensureViaDelegate();
  } catch (err) {
    console.warn("[kairos] delegate identity unavailable, using local:", err);
    onStatus?.(
      `Identity: local fallback (${err instanceof Error ? err.message : String(err)})`,
    );
    const local = await getWitnessSummary();
    identityCache = { ...local, backend: "local" };
    return identityCache;
  }
}

/** Read-only service identity lookup. Never registers or creates an identity. */
export async function getKairosIdentity() {
  if (identityCache?.backend === "delegate") return identityCache;
  if (!kairosIdentityReady()) return null;
  try {
    const n = nonce();
    const pending = waitForDelegate(
      (p) =>
        (p.type === "Identity" || p.type === "Error") &&
        (!p.nonce || p.nonce === n),
      8_000,
    );
    await sendDelegateMessage({ type: "GetIdentity", nonce: n });
    const res = await pending;
    if (res.type === "Error" || !res.node_id || !res.label) return null;
    identityCache = {
      nodeId: res.node_id,
      label: res.label,
      backend: "delegate",
      created: false,
    };
    return identityCache;
  } catch {
    return null;
  }
}

export async function getKairosIdentitySummary(onStatus) {
  return ensureKairosIdentity(onStatus);
}

function delegateFailure(operation, error) {
  const detail = error instanceof Error ? error.message : String(error);
  return new Error(`Kairos delegate ${operation} signing failed; refusing local fallback: ${detail}`);
}

function assertDelegateNode(operation, identity, response) {
  if (response?.type === "Error") {
    throw new Error(response.message || `Kairos delegate ${operation} failed`);
  }
  if (!response?.node_id || response.node_id !== identity.nodeId) {
    throw new Error(`Kairos delegate ${operation} returned an unexpected identity`);
  }
  return response;
}

/** Use the selected backend consistently; never switch identities mid-operation. */
export async function signPulseAuto(fields) {
  const identity = await ensureKairosIdentity();
  if (identity.backend !== "delegate") return localSignPulse(fields);
  try {
    const n = nonce();
    const pending = waitForDelegate(
      (p) =>
        (p.type === "SignedObservation" || p.type === "Error") &&
        p.nonce === n,
      20_000,
    );
    await sendDelegateMessage({
      type: "SignPulse",
      nonce: n,
      wall_ms: fields.wall_ms,
      monotonic_ms: fields.monotonic_ms,
      uncertainty_ms: fields.uncertainty_ms,
    });
    const res = assertDelegateNode("pulse", identity, await pending);
    return {
      node_id: res.node_id,
      wall_ms: res.wall_ms,
      monotonic_ms: res.monotonic_ms,
      uncertainty_ms: res.uncertainty_ms,
      sig: res.sig,
    };
  } catch (err) {
    throw delegateFailure("pulse", err);
  }
}

export async function signStampObserveAuto(requestId, fields) {
  const identity = await ensureKairosIdentity();
  if (identity.backend !== "delegate") return localSignStampObserve(requestId, fields);
  try {
    const n = nonce();
    const pending = waitForDelegate(
      (p) =>
        (p.type === "SignedObservation" || p.type === "Error") &&
        p.nonce === n,
      20_000,
    );
    await sendDelegateMessage({
      type: "SignStampObserve",
      nonce: n,
      request_id: requestId,
      wall_ms: fields.wall_ms,
      monotonic_ms: fields.monotonic_ms,
      uncertainty_ms: fields.uncertainty_ms,
    });
    const res = assertDelegateNode("stamp observation", identity, await pending);
    return {
      node_id: res.node_id,
      wall_ms: res.wall_ms,
      monotonic_ms: res.monotonic_ms,
      uncertainty_ms: res.uncertainty_ms,
      sig: res.sig,
    };
  } catch (err) {
    throw delegateFailure("stamp observation", err);
  }
}

export { getWitness, getWitnessSummary };
