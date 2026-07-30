#!/usr/bin/env bash
# Publish Kairos site as a Freenet website (excludes node_modules).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="${ROOT}/site"
STAGE="${ROOT}/build/website-stage"
KEY_NAME="${KAIROS_WEBSITE_KEY:-kairos}"

if [[ ! -f "${SITE}/index.html" || ! -f "${SITE}/live.bundle.js" ]]; then
  echo "error: build site first (npm run build:live in site/, need live.bundle.js)" >&2
  exit 1
fi
if [[ ! -f "${SITE}/public/kairos_time.wasm" ]]; then
  echo "error: missing kairos_time.wasm — run scripts/build.sh" >&2
  exit 1
fi

rm -rf "${STAGE}"
mkdir -p "${STAGE}"
# Copy only what the browser needs — never node_modules / src / vite junk.
rsync -a \
  --exclude node_modules \
  --exclude src \
  --exclude dist-live \
  --exclude package.json \
  --exclude package-lock.json \
  --exclude vite.config.js \
  --exclude '*.map' \
  "${SITE}/" "${STAGE}/"

if ! fdev website list 2>/dev/null | grep -qE "(^|[[:space:]])${KEY_NAME}([[:space:]]|$)"; then
  echo "Initializing website key '${KEY_NAME}'…"
  fdev website init "${KEY_NAME}"
fi

if fdev website update "${STAGE}" --key "${KEY_NAME}"; then
  echo "Updated Kairos website (${KEY_NAME})."
else
  fdev website publish "${STAGE}" --key "${KEY_NAME}"
  echo "Published Kairos website (${KEY_NAME})."
fi

fdev website list
