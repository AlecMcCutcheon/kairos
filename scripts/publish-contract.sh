#!/usr/bin/env bash
# Publish kairos-time contract to the local Freenet node (idempotent Put).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PARAMS="$ROOT/build/kairos-time-params.bin"
STATE="$ROOT/build/kairos-time-empty.json"
WASM="$ROOT/site/public/kairos_time.wasm"

mkdir -p "$ROOT/build"
printf 'kairos-time-v2' > "$PARAMS"
printf '{"schema_version":2,"roster":{},"pulse":{},"open_stamps":{},"sealed_stamps":{}}' > "$STATE"

if [[ ! -f "$WASM" ]]; then
  echo "error: missing $WASM — run scripts/build.sh first" >&2
  exit 1
fi

echo "==> fdev publish kairos-time"
fdev publish --code "$WASM" --parameters "$PARAMS" --timeout 90 contract --state "$STATE"
echo "Published (or already present)."
