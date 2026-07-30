/**
 * Kairos witness identity — auto-minted ed25519 key, no username UX.
 *
 * Persistence (Freenet `__sandbox=1` often blocks Web Storage):
 *   1) in-memory (same JS realm)
 *   2) window.name bag shared with app.js (`__kairos_store_v1__`)
 *   3) localStorage when allowed
 *
 * Prefer signing via the kairos-identity Freenet delegate when registered;
 * this module remains the local fallback and still used for display helpers.
 */
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import bs58 from "bs58";
import { bytesToHex } from "@noble/hashes/utils";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const STORAGE_KEY = "kairos.witness.sk.v2";
const LABEL_KEY = "kairos.witness.label.v2";
/** Same bag as site/app.js so soft-nav / sandbox survive together. */
const NAME_BAG_PREFIX = "__kairos_store_v1__";

let cached = null;
let memSk = null;
let memLabel = null;

function bytesToB64(u8) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

function b64ToBytes(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function readNameBag() {
  try {
    const n = String(window.name || "");
    if (!n.startsWith(NAME_BAG_PREFIX)) return {};
    const parsed = JSON.parse(n.slice(NAME_BAG_PREFIX.length));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeNameBagKey(key, value) {
  try {
    const bag = readNameBag();
    bag[key] = value;
    window.name = NAME_BAG_PREFIX + JSON.stringify(bag);
  } catch {
    /* */
  }
}

function readWebStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeWebStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function parseSk(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const bytes = b64ToBytes(raw);
    return bytes.length === 32 ? bytes : null;
  } catch {
    return null;
  }
}

function autoLabel(nodeId) {
  const short = String(nodeId || "xxxx")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toLowerCase();
  return `kairos-${short || "node"}`;
}

/** Deterministic display name from node_id (same rule as mint / delegate). */
export function witnessLabelFromNodeId(nodeId) {
  return autoLabel(nodeId);
}

function loadOrCreateSecret() {
  if (memSk?.length === 32) return memSk;

  let sk =
    parseSk(readWebStorage(STORAGE_KEY)) ||
    parseSk(readNameBag()[STORAGE_KEY]) ||
    null;

  // Migrate v1 key if present
  if (!sk) {
    sk = parseSk(readWebStorage("kairos.witness.sk"));
  }

  if (!sk) {
    sk = ed.utils.randomPrivateKey();
  }

  memSk = sk;
  const b64 = bytesToB64(sk);
  writeWebStorage(STORAGE_KEY, b64);
  writeNameBagKey(STORAGE_KEY, b64);
  return sk;
}

function loadOrCreateLabel(nodeId) {
  if (memLabel) return memLabel;
  const existing =
    readWebStorage(LABEL_KEY) || readNameBag()[LABEL_KEY] || null;
  const label =
    existing && String(existing).trim()
      ? String(existing).trim()
      : autoLabel(nodeId);
  memLabel = label;
  writeWebStorage(LABEL_KEY, label);
  writeNameBagKey(LABEL_KEY, label);
  return label;
}

export async function getWitness() {
  if (cached) return cached;
  const secretKey = loadOrCreateSecret();
  const publicKey = await ed.getPublicKeyAsync(secretKey);
  const nodeId = bs58.encode(publicKey);
  const label = loadOrCreateLabel(nodeId);
  cached = {
    secretKey,
    publicKey,
    nodeId,
    label,
    backend: "local",
  };
  return cached;
}

/** Stable display id for UI (auto-generated, not a social username). */
export async function getWitnessSummary() {
  const w = await getWitness();
  return {
    nodeId: w.nodeId,
    label: w.label,
    backend: w.backend || "local",
    shortId: w.nodeId.slice(0, 12),
  };
}

function encodeFields(parts) {
  const enc = new TextEncoder();
  const chunks = [];
  for (const p of parts) {
    chunks.push(enc.encode(String(p)));
    chunks.push(new Uint8Array([0]));
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

async function signObservation(domainStr, extraFields, fields) {
  const w = await getWitness();
  const domain = new TextEncoder().encode(domainStr);
  const rest = encodeFields([...extraFields, w.nodeId, ...fields]);
  const payload = new Uint8Array(domain.length + rest.length);
  payload.set(domain, 0);
  payload.set(rest, domain.length);
  const sig = await ed.signAsync(payload, w.secretKey);
  return {
    node_id: w.nodeId,
    wall_ms: fields[0],
    monotonic_ms: fields[1],
    uncertainty_ms: fields[2],
    sig: bytesToHex(sig),
  };
}

/** Pulse API — keep-alive / age accrual (local signer). */
export async function signPulse({ wall_ms, monotonic_ms, uncertainty_ms }) {
  return signObservation("kairos.pulse.v1\0", [], [
    wall_ms,
    monotonic_ms,
    uncertainty_ms,
  ]);
}

/** Stamp API — observation bound to request_id (local signer). */
export async function signStampObserve(
  requestId,
  { wall_ms, monotonic_ms, uncertainty_ms },
) {
  return signObservation("kairos.stamp.observe.v1\0", [requestId], [
    wall_ms,
    monotonic_ms,
    uncertainty_ms,
  ]);
}
