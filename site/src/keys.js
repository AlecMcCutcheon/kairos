import { blake3 } from "@noble/hashes/blake3";
import bs58 from "bs58";
import { ContractKey } from "@freenetorg/freenet-stdlib";
import {
  KAIROS_PARAMS_UTF8,
  KAIROS_WASM_HASH_B58,
} from "./kairos-constants.js";

export function paramsBytes() {
  return new TextEncoder().encode(KAIROS_PARAMS_UTF8);
}

export function deriveInstanceId(codeHashBase58, parameters) {
  const codeHash = bs58.decode(codeHashBase58);
  const concat = new Uint8Array(codeHash.length + parameters.length);
  concat.set(codeHash, 0);
  concat.set(parameters, codeHash.length);
  const bytes = blake3(concat);
  return { bytes, base58: bs58.encode(bytes) };
}

export function kairosKey() {
  if (!KAIROS_WASM_HASH_B58) return null;
  const parameters = paramsBytes();
  const instance = deriveInstanceId(KAIROS_WASM_HASH_B58, parameters);
  const codeBytes = bs58.decode(KAIROS_WASM_HASH_B58);
  return new ContractKey(instance.bytes, codeBytes);
}
