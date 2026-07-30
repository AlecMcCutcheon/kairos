import {
  PutRequest,
  UpdateRequest,
  UpdateData,
  UpdateDataType,
  DeltaUpdate,
  ContractType as WasmContractType,
} from "@freenetorg/freenet-stdlib";
import {
  ContractCodeT,
  WasmContractV1T,
  ContractContainerT,
  ContractKeyT,
  ContractInstanceIdT,
} from "@freenetorg/freenet-stdlib/common";
import { RelatedContractsT } from "@freenetorg/freenet-stdlib/client-request";
import { blake3 } from "@noble/hashes/blake3";
import bs58 from "bs58";

function decodeHashB58(hashB58) {
  const bytes = bs58.decode(hashB58);
  if (bytes.length !== 32) {
    throw new Error(`code hash must be 32 bytes, got ${bytes.length}`);
  }
  return bytes;
}

export function buildPutRequest(wasm, codeHashB58, parameters, initialState) {
  const codeHashBytes = decodeHashB58(codeHashB58);
  const concat = new Uint8Array(codeHashBytes.length + parameters.length);
  concat.set(codeHashBytes, 0);
  concat.set(parameters, codeHashBytes.length);
  const instanceBytes = blake3(concat);
  const code = new ContractCodeT(
    Array.from(wasm),
    Array.from(codeHashBytes),
  );
  const keyT = new ContractKeyT(
    new ContractInstanceIdT(Array.from(instanceBytes)),
    Array.from(codeHashBytes),
  );
  const contract = new WasmContractV1T(code, Array.from(parameters), keyT);
  const container = new ContractContainerT(
    WasmContractType.WasmContractV1,
    contract,
  );
  return new PutRequest(
    container,
    Array.from(initialState),
    new RelatedContractsT([]),
    true,
    false,
  );
}

export function wrapDeltaUpdate(key, deltaBytes) {
  const update = new UpdateData(
    UpdateDataType.DeltaUpdate,
    new DeltaUpdate(Array.from(deltaBytes)),
  );
  return new UpdateRequest(key, update);
}
