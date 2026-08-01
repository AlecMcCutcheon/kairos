import { getPublicKey, signAsync, utils } from "@noble/ed25519";
import bs58 from "bs58";
import { blake3 } from "@noble/hashes/blake3";

const KEY = "tyche.witness.sk.v1";
const BAG = "__tyche_store_v1__";
let memory = null;

function readBag() {
  try {
    const s = String(window.name || "");
    return s.startsWith(BAG) ? JSON.parse(s.slice(BAG.length)) : {};
  } catch { return {}; }
}
function write(sk) {
  const b = Array.from(sk);
  try { localStorage.setItem(KEY, btoa(String.fromCharCode(...b))); } catch {}
  try {
    const bag = readBag(); bag[KEY] = btoa(String.fromCharCode(...b));
    window.name = BAG + JSON.stringify(bag);
  } catch {}
}
function load() {
  if (memory) return memory;
  try {
    const x = localStorage.getItem(KEY);
    if (x) { memory = Uint8Array.from(atob(x), c => c.charCodeAt(0)); if (memory.length === 32) return memory; }
  } catch {}
  try {
    const x = readBag()[KEY];
    if (x) { memory = Uint8Array.from(atob(x), c => c.charCodeAt(0)); if (memory.length === 32) return memory; }
  } catch {}
  memory = utils.randomPrivateKey(); write(memory); return memory;
}

export function getWitness() {
  const secretKey = load(), publicKey = getPublicKey(secretKey), nodeId = bs58.encode(publicKey);
  return { secretKey, nodeId, label: `tyche-${nodeId.slice(0, 6).toLowerCase()}`, source: "local" };
}
function field(out, value) { out.push(...new TextEncoder().encode(String(value)), 0); }
function payload(domain, fields, raw = []) {
  const out = [...new TextEncoder().encode(domain)];
  for (const value of fields) field(out, value);
  for (const value of raw) out.push(...value);
  return new Uint8Array(out);
}
function hex(bytes) { return Array.from(bytes).map(x => x.toString(16).padStart(2, "0")).join(""); }
function commitmentFields(commitments) {
  const raw = [];
  for (const [recipient, c] of Object.entries(commitments || {}).sort(([a], [b]) => a.localeCompare(b))) {
    raw.push(new TextEncoder().encode(recipient)); raw.push(new Uint8Array([0, c.x, c.threshold]));
    raw.push(new TextEncoder().encode(c.commitment)); raw.push(new Uint8Array([0]));
  }
  return raw;
}

export async function signPulse(fields) {
  const w = getWitness();
  const sig = await signAsync(payload("tyche.pulse.v1\0", [w.nodeId, fields.wall_ms, fields.monotonic_ms, fields.uncertainty_ms]), w.secretKey);
  return { node_id: w.nodeId, ...fields, sig: hex(sig) };
}
export async function signCommit(roundId, commitment, wall, options = {}) {
  const w = getWitness();
  const threshold = options.recovery_threshold || 0;
  const digest = options.recovery_digest || "";
  const commitments = options.recovery_commitments || {};
  const sig = await signAsync(payload("tyche.commit.v1\0", [roundId, w.nodeId, commitment, wall, threshold, digest], commitmentFields(commitments)), w.secretKey);
  return { node_id: w.nodeId, commitment, wall_ms: wall, recovery_threshold: threshold, recovery_digest: digest, recovery_commitments: commitments, sig: hex(sig) };
}
export async function signReveal(roundId, secretHex) {
  const w = getWitness();
  const sig = await signAsync(payload("tyche.reveal.v1\0", [roundId, w.nodeId, secretHex]), w.secretKey);
  return { node_id: w.nodeId, secret_hex: secretHex, sig: hex(sig) };
}
export async function signRecoveryShare(roundId, sourceId, recipientId, x, threshold, shareHex) {
  const w = getWitness();
  if (w.nodeId !== recipientId) throw new Error("the recipient identity must sign its recovery share");
  const sig = await signAsync(payload("tyche.recovery-share.v2\0", [roundId, sourceId, recipientId], [new Uint8Array([x, threshold]), new TextEncoder().encode(shareHex), new Uint8Array([0])]), w.secretKey);
  return { source_id: sourceId, recipient_id: recipientId, x, threshold, share_hex: shareHex, sig: hex(sig) };
}
export function getWitnessSummary() { const w = getWitness(); return { nodeId: w.nodeId, label: w.label, backend: "local" }; }
export { blake3 };
