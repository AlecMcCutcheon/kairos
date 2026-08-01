import { blake3 } from "@noble/hashes/blake3";
import bs58 from "bs58";
import { ContractKey } from "@freenetorg/freenet-stdlib";
import { TYCHE_PARAMS_UTF8, TYCHE_WASM_HASH_B58 } from "./tyche-constants.js";
export function paramsBytes(){return new TextEncoder().encode(TYCHE_PARAMS_UTF8);}
export function tycheKey(){if(!TYCHE_WASM_HASH_B58) throw new Error("Tyche constants missing — run scripts/build.sh"); const code=bs58.decode(TYCHE_WASM_HASH_B58); const p=paramsBytes(); const b=new Uint8Array(code.length+p.length); b.set(code); b.set(p,code.length); return new ContractKey(blake3(b),code);}
