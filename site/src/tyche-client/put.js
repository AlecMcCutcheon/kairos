import { PutRequest, UpdateRequest, UpdateData, UpdateDataType, DeltaUpdate, ContractType as WasmContractType } from "@freenetorg/freenet-stdlib";
import { ContractCodeT, WasmContractV1T, ContractContainerT, ContractKeyT, ContractInstanceIdT } from "@freenetorg/freenet-stdlib/common";
import { RelatedContractsT } from "@freenetorg/freenet-stdlib/client-request";
import { blake3 } from "@noble/hashes/blake3";
import bs58 from "bs58";

function hashBytes(b58) { const b = bs58.decode(b58); if (b.length !== 32) throw new Error("code hash must be 32 bytes"); return b; }
export function buildPutRequest(wasm, codeHashB58, parameters, initialState) { const codeHash = hashBytes(codeHashB58); const input = new Uint8Array(codeHash.length + parameters.length); input.set(codeHash); input.set(parameters, codeHash.length); const instance = blake3(input); const code = new ContractCodeT(Array.from(wasm), Array.from(codeHash)); const key = new ContractKeyT(new ContractInstanceIdT(Array.from(instance)), Array.from(codeHash)); const contract = new WasmContractV1T(code, Array.from(parameters), key); const container = new ContractContainerT(WasmContractType.WasmContractV1, contract); return new PutRequest(container, Array.from(initialState), new RelatedContractsT([]), true, false); }
export function wrapDeltaUpdate(key, bytes) { return new UpdateRequest(key, new UpdateData(UpdateDataType.DeltaUpdate, new DeltaUpdate(Array.from(bytes)))); }
