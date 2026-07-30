#!/usr/bin/env bash
# Publish kairos-identity delegate to the local Freenet node.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG="$ROOT/site/public/kairos_identity.pkg"
WASM="$ROOT/site/public/kairos_identity.wasm"

if [[ ! -f "$PKG" && ! -f "$WASM" ]]; then
  echo "error: missing identity package — run scripts/build.sh first" >&2
  exit 1
fi

CODE="${PKG}"
if [[ ! -f "$CODE" ]]; then
  CODE="$WASM"
fi

echo "==> fdev publish kairos-identity (delegate)"
fdev publish --code "$CODE" --timeout 90 delegate
echo "Published kairos-identity (or already present)."
