import {
  FreenetWsApi,
  GetRequest,
  GetResponse,
  DelegateRequest,
  DelegateResponse,
} from "@freenetorg/freenet-stdlib";

function commandWsUrl() {
  const loc = globalThis.location;
  const proto = loc?.protocol === "https:" ? "wss:" : "ws:";
  const host = loc?.host || "127.0.0.1:7509";
  return new URL(`${proto}//${host}/v1/contract/command`);
}

let conn = null;
let connecting = null;
const updateWaiters = new Set();
const delegatePayloadListeners = new Set();
const delegateRawListeners = new Set();
const hostErrListeners = new Set();
const connDropListeners = new Set();

function notifyUpdate(key, notification = null) {
  for (const w of updateWaiters) {
    try {
      w(key, notification);
    } catch {
      /* */
    }
  }
}

/** Listen for Freenet UpdateNotification on the shared WS (per-node). */
export function onContractUpdate(listener) {
  updateWaiters.add(listener);
  return () => updateWaiters.delete(listener);
}

function parseDelegatePayloads(response) {
  const results = [];
  if (!response?.values) return results;
  for (const outbound of response.values) {
    if (outbound.inboundType !== 1) continue;
    const msg = outbound.inbound;
    if (!msg?.payload?.length) continue;
    try {
      const bytes = new Uint8Array(msg.payload);
      results.push(JSON.parse(new TextDecoder().decode(bytes)));
    } catch {
      /* */
    }
  }
  return results;
}

function notifyDelegate(response) {
  for (const l of delegateRawListeners) {
    try {
      l(response);
    } catch {
      /* */
    }
  }
  const payloads = parseDelegatePayloads(response);
  if (!payloads.length) return;
  for (const l of delegatePayloadListeners) {
    try {
      l(payloads);
    } catch {
      /* */
    }
  }
}

function notifyHostError(cause) {
  const err = new Error(cause || "Freenet host error");
  for (const l of hostErrListeners) {
    try {
      l(err);
    } catch {
      /* */
    }
  }
}

function notifyConnDrop(code, reason) {
  const err = new Error(
    `Connection closed: ${code}${reason ? ` ${reason}` : ""}`,
  );
  for (const l of connDropListeners) {
    try {
      l(err);
    } catch {
      /* */
    }
  }
}

export function onDelegatePayloads(listener) {
  delegatePayloadListeners.add(listener);
  return () => delegatePayloadListeners.delete(listener);
}

export function onDelegateResponseRaw(listener) {
  delegateRawListeners.add(listener);
  return () => delegateRawListeners.delete(listener);
}

export function onFreenetHostError(listener) {
  hostErrListeners.add(listener);
  return () => hostErrListeners.delete(listener);
}

export function onFreenetConnDrop(listener) {
  connDropListeners.add(listener);
  return () => connDropListeners.delete(listener);
}

function noopHandler() {
  return {
    onContractPut: () => {},
    onContractGet: () => {},
    onContractUpdate: () => {},
    onContractUpdateNotification: (n) => {
      if (n?.key) notifyUpdate(n.key, n);
    },
    onContractNotFound: () => {},
    onDelegateResponse: (r) => {
      notifyDelegate(r);
    },
    onErr: (err) => {
      console.warn("[kairos] host error:", err?.cause ?? err);
      notifyHostError(
        typeof err?.cause === "string" ? err.cause : String(err?.cause ?? err),
      );
    },
    onOpen: () => {},
  };
}

async function openConn() {
  let resolveReady;
  let rejectReady;
  let settled = false;
  const ready = new Promise((resolve, reject) => {
    resolveReady = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    rejectReady = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };
  });
  let api;
  const handler = {
    ...noopHandler(),
    onOpen: () => resolveReady(),
    onClose: (code, reason) => {
      if (conn?.api === api) conn = null;
      notifyConnDrop(code, reason);
      rejectReady(
        new Error(`Connection closed: ${code}${reason ? ` ${reason}` : ""}`),
      );
    },
  };
  api = new FreenetWsApi(commandWsUrl(), handler, "");
  await Promise.race([
    ready,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("Freenet WS connect timeout")), 12_000),
    ),
  ]);
  return { api };
}

async function ensureConn() {
  if (conn) return conn;
  if (connecting) return connecting;
  connecting = openConn()
    .then((c) => {
      conn = c;
      connecting = null;
      return c;
    })
    .catch((e) => {
      connecting = null;
      throw e;
    });
  return connecting;
}

export async function getFreenetApi() {
  return (await ensureConn()).api;
}

function stateToBytes(state) {
  if (!state) return null;
  if (state instanceof Uint8Array) return state;
  if (Array.isArray(state)) return new Uint8Array(state);
  if (state.data) return new Uint8Array(state.data);
  return null;
}

export async function tryGetContractState(key, opts = {}) {
  try {
    return await getContractState(key, {
      timeoutMs: opts.timeoutMs ?? 8_000,
      subscribe: false,
      fetchContract: false,
    });
  } catch {
    return null;
  }
}

export async function getContractState(key, opts = {}) {
  const {
    timeoutMs = 20_000,
    subscribe = false,
    fetchContract = false,
  } = opts;
  const { api } = await ensureConn();
  const req = new GetRequest(key, fetchContract, subscribe, false);
  const result = await Promise.race([
    api.get(req),
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("GET timeout")), timeoutMs),
    ),
  ]);
  if (result instanceof GetResponse || result?.state != null) {
    const bytes = stateToBytes(result.state);
    if (!bytes) throw new Error("empty GET state");
    return bytes;
  }
  throw new Error("unexpected GET result");
}

function waitUpdateNotif(expectKey, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      updateWaiters.delete(fn);
      reject(new Error("update notification timeout"));
    }, ms);
    const fn = (key) => {
      clearTimeout(timer);
      updateWaiters.delete(fn);
      resolve(key);
    };
    updateWaiters.add(fn);
  });
}

export async function putContract(req, expectKey) {
  const { api } = await ensureConn();
  const notif = expectKey
    ? waitUpdateNotif(expectKey, 45_000).catch(() => null)
    : Promise.resolve(null);
  try {
    await Promise.race([
      api.put(req),
      notif,
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("PUT timeout")), 45_000),
      ),
    ]);
  } catch (e) {
    if (String(e).includes("timeout") && (await notif)) return;
    throw e;
  }
}

export async function updateContract(req, expectKey) {
  const { api } = await ensureConn();
  const notif = expectKey
    ? waitUpdateNotif(expectKey, 45_000).catch(() => null)
    : Promise.resolve(null);
  try {
    await Promise.race([
      api.update(req),
      notif,
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("UPDATE timeout")), 45_000),
      ),
    ]);
  } catch (e) {
    if (String(e).includes("timeout") && (await notif)) return;
    throw e;
  }
}

export { DelegateRequest, DelegateResponse };
