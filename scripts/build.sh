#!/usr/bin/env bash
# Build kairos-time contract + kairos-identity delegate, copy into site/, regenerate constants.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export CARGO_TARGET_DIR="$ROOT/target"

echo "==> Package kairos-time (fdev contract)"
(cd contracts/kairos-time && fdev build --package-type contract)

RAW="$ROOT/target/wasm32-unknown-unknown/release/kairos_time.wasm"
PKG="$ROOT/contracts/kairos-time/build/freenet/kairos_time"
if [[ ! -f "$RAW" || ! -f "$PKG" ]]; then
  echo "error: missing contract build outputs" >&2
  ls -la "$ROOT/target/wasm32-unknown-unknown/release/" 2>/dev/null || true
  ls -la "$ROOT/contracts/kairos-time/build/freenet/" 2>/dev/null || true
  exit 1
fi

echo "==> Package kairos-identity (fdev delegate)"
(cd delegates/kairos-identity && fdev build --package-type delegate)

ID_RAW="$ROOT/target/wasm32-unknown-unknown/release/kairos_identity.wasm"
ID_PKG="$ROOT/delegates/kairos-identity/build/freenet/kairos_identity"
# fdev may name the package after the crate; accept either.
if [[ ! -f "$ID_PKG" ]]; then
  ID_PKG="$(ls "$ROOT/delegates/kairos-identity/build/freenet/"* 2>/dev/null | head -1 || true)"
fi
if [[ ! -f "$ID_RAW" ]]; then
  echo "error: missing $ID_RAW" >&2
  ls -la "$ROOT/target/wasm32-unknown-unknown/release/" 2>/dev/null || true
  exit 1
fi
if [[ -z "${ID_PKG}" || ! -f "$ID_PKG" ]]; then
  echo "warn: packaged delegate missing — using raw wasm for site copy" >&2
  ID_PKG="$ID_RAW"
fi

mkdir -p site/public build
cp -f "$RAW" site/public/kairos_time.wasm
cp -f "$PKG" site/public/kairos_time.pkg
cp -f "$ID_RAW" site/public/kairos_identity.wasm
cp -f "$ID_PKG" site/public/kairos_identity.pkg 2>/dev/null || cp -f "$ID_RAW" site/public/kairos_identity.pkg

node scripts/gen-constants.mjs "$RAW"

# Prefer fdev-reported code hash from build log if inspectable; else blake3(wasm).
ID_HASH_B58=""
if command -v fdev >/dev/null 2>&1; then
  ID_HASH_B58="$(fdev inspect "$ID_PKG" 2>/dev/null | sed -n 's/.*code hash[: ]*\([1-9A-HJ-NP-Za-km-z]\{32,\}\).*/\1/p' | head -1 || true)"
fi
if [[ -n "$ID_HASH_B58" ]]; then
  node scripts/gen-identity-constants.mjs "$ID_RAW" "$ID_HASH_B58"
else
  node scripts/gen-identity-constants.mjs "$ID_RAW"
fi

echo "==> Built kairos_time.wasm + kairos_identity.wasm → site/public/"
