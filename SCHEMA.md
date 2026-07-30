# Kairos time-oracle — contract schema (v2)

## What this is (and is not)

Kairos seals **shared, Get-able timestamps** for Freenet apps: anti-replay
clocks, notarization (“this hash existed by interval *I*”), and feed
consumers that need a network-agreed wall time with an explicit error bound.

It is **not** a laptop/NTP sync protocol. Peers do not converge device clocks;
apps Get a stamp and treat `[earliest_ms, latest_ms]` (widened by local
staleness after Get) as the dependable interval.

Borrowings:

| Family | Borrowed idea | In Kairos |
|--------|---------------|------------|
| Byztime | offset + **error** + grow with age | `error_ms`, `earliest_ms`/`latest_ms`; clients widen σ after Get |
| Roughtime | accountability / divergence | `transcript_digest` over sorted witness lines |
| OTS / ledger clocks | existence proof | sealed stamp under `content_hash:nonce` on Freenet |

## Two API surfaces (do not mix)

| Surface | Purpose | Who | Effect |
|---------|---------|-----|--------|
| **Pulse** | Liveness, telemetry, age accrual | Any key | Updates `roster` + `pulse` only |
| **Stamp** | Authoritative time for a hash | Age-eligible witnesses only | `open_stamps` → `sealed_stamps` |

Pulse never seals “truth.” Stamps never accept fresh Sybils.

Eligibility is **minimum age** on the Kairos roster **and** (once the
network has a few seals) a **seal-history reputation** floor. Reputation is
scored from how often a key was included vs MAD-dropped at seal — **not** from
agreement with the live pulse median (that would let a Sybil flood exile honest
peers). New keys start neutral. Stamp medians weight observes by age × reputation.

Pulse never seals “truth.” Stamps never accept fresh Sybils / sustained outliers.

## Parameters

UTF-8: `kairos-time-v2` (instance id; bump when intentionally starting a fresh oracle).
Logic version is `schema_version` in state.

Baked policy (see Rust constants; raise age as the network matures):

| Constant | Current | Intent |
|----------|---------|--------|
| `MIN_AGE_MS` | 1 hour | Sybil friction; target days/weeks later |
| `MIN_STAMP_WITNESSES` | 5 | After MAD filter |
| `MAX_ROSTER` | 4096 | Drop oldest `last_seen` |
| `MAX_PULSE` | 1024 | Latest pulse map |
| `MAX_OPEN_STAMPS` | 256 | Drop oldest open |
| `MAX_SEALED_STAMPS` | 1024 | Drop oldest sealed |
| `MAX_OBS_PER_STAMP` | 512 | Cap per request |

State stays large enough for accuracy / flood resistance, but **bounded** so millions of keys cannot grow the contract forever.

## State (v2)

```json
{
  "schema_version": 2,
  "roster": {
    "<node_id_b58>": {
      "first_seen_ms": 0,
      "last_seen_ms": 0,
      "pulse_count": 0,
      "seals_included": 0,
      "seals_outlier": 0
    }
  },
  "pulse": { "<node_id>": { "node_id", "wall_ms", "monotonic_ms", "uncertainty_ms", "sig" } },
  "open_stamps": {
    "<content_hash>:<nonce>": {
      "content_hash": "",
      "nonce": "",
      "opened_hint_ms": 0,
      "observations": {}
    }
  },
  "sealed_stamps": {
    "<content_hash>:<nonce>": {
      "content_hash": "",
      "nonce": "",
      "median_wall_ms": 0,
      "trimmed_mean_ms": 0,
      "confidence_ms": 0,
      "median_abs_dev_ms": 0,
      "witness_count": 0,
      "witness_ids": [],
      "sealed_at_ms": 0,
      "error_ms": 0,
      "earliest_ms": 0,
      "latest_ms": 0,
      "transcript_digest": ""
    }
  }
}
```

### Sealed stamp fields (dependable feed)

| Field | Meaning |
|-------|---------|
| `confidence_ms` / `error_ms` | Half-width at seal (`error_ms == confidence_ms`) |
| `earliest_ms` / `latest_ms` | Inclusive interval `[median − error, median + error]` |
| `transcript_digest` | FNV-1a-64 hex of sorted `node_id\|wall\|unc\|sig` lines |
| `witness_ids` | Eligible witnesses that survived MAD filter |

Legacy seals missing the new fields are filled on parse from `confidence_ms`.

## Updates

```json
{ "pulse": { /* Observation, domain kairos.pulse.v1 */ } }

{ "open_stamp": { "content_hash": "…", "nonce": "unique-per-request" } }

{ "observe_stamp": {
    "request_id": "<content_hash>:<nonce>",
    "observation": { /* domain kairos.stamp.observe.v1 */ }
  }
}
```

## Seal

When ≥ `MIN_STAMP_WITNESSES` **eligible** observations exist: trim + MAD, compute median + confidence/error interval + transcript digest, move to `sealed_stamps`. Further observes ignored.

## Client usage

- **Sites / keep-alive:** call pulse on an interval (telemetry page).
- **Apps needing time:** `open_stamp` + wait for seal; only aged witnesses’ `observe_stamp` count.
- **Notarize / anti-replay:** Get sealed stamp; assert claim times against `earliest_ms`/`latest_ms`, then widen with local staleness (`effective_error = error_ms + stale × growth`). Export a notary receipt (request id + stamp fields + Freenet key).
- **Demo lab:** browser simulation only — not this contract.
