# Dependable shared time (not device sync)

## Goal

Make Kairos stamps **dependable enough** to:

1. **Feed apps** — Freenet contracts/sites Get one shared clock with an
   explicit error bound (anti-replay, epoch bins, deadlines).
2. **Notarize** — prove a content hash was sealed inside
   `[earliest_ms, latest_ms]` by a witness set, retrievable via Freenet Get.

Kairos is **not** trying to sync laptops to UTC. Device NTP / Chrony /
Roughtime clients remain the right tool for that.

## Threat model (honest neighborhood)

- Witnesses are aged on the Kairos roster (Sybil friction).
- Outliers trimmed via MAD; confidence/error from uncertainty + MAD.
- A sealed transcript digest binds which observations entered the seal.
- After Get, uncertainty **grows with staleness** (Byztime-style); apps must
  not treat a stale Get as tight as a fresh seal.

## App checklist

1. `open_stamp(content_hash, nonce)` → wait for `sealed_stamps[id]`.
2. Read `median_wall_ms`, `error_ms`, `earliest_ms`, `latest_ms`,
   `transcript_digest`, `witness_ids`.
3. On later verify: Get again (or keep a receipt + re-Get state); widen error
   by local age since `sealed_at_ms` / Get time.
4. For “not after T”: require `T >= earliest_ms` (with widened bounds as needed).
5. For “not before T”: require `T <= latest_ms` (same).

## What we deliberately skip

- Cross-device sub-second sync.
- Trusting a single external NTP farm as the Freenet clock of record.
- Replacing OpenTimestamps / blockchain anchors (optional later; Freenet Get
  of the sealed entry is the primary existence surface today).
