# Kairos – Agent / Contributor Guide

[CONTRIBUTING.md](CONTRIBUTING.md) is the authoritative contribution policy.
In short:

- **Bug fixes** and **non-overreaching performance improvements** (no behavior
  change) — accepted without prior discussion.
- **Features, behavior changes, API / schema reshaping** — require an issue
  approved by a maintainer **before** writing the bulk of the code. Feature
  PRs without an approved issue may be closed.
- **One logical change per PR.**

When unsure which bucket a change is in, open an issue first.

## Project Layout

```
kairos/
├── site/                 # Static website + browser API helpers (pulse, OTP, duty)
├── contracts/kairos-time # Shared Freenet time oracle contract
├── delegates/kairos-identity # Local Ed25519 identity / signing delegate
├── scripts/              # build / publish helpers (contract, identity, website)
├── docs/                 # identity + public-goods notes
└── build/                # generated fingerprints, params, initial state
```

## Behavioral Rules

### BEFORE modifying product behavior

1. Is this a **feature / behavior / API / schema** change?
   → Confirm there is an **approved issue** (see CONTRIBUTING.md).
2. Does it only work on a **custom freenet-core fork**?
   → Say so in the issue. Prefer designs that degrade cleanly on stock nodes.
3. Touching the time contract state, pulse, stamps, or OTP semantics?
   → Plan compatibility (dual-read / migration). Breaking silent schema churn
     burns users' transcripts and witness reputation.

### BEFORE changing `contracts/` or `delegates/`

- Rebuild and republish with the project scripts (`bash scripts/build.sh`,
  `scripts/publish-contract.sh`, `scripts/publish-identity.sh`); keep
  SCHEMA.md in sync.
- The site's browser helpers must match the contract's pulse / stamp / OTP
  state machine.

### BEFORE changing `site/`

- Prefer Freenet **website-native** paths (soft-Get / Subscribe against the
  published contract). Never invent a missing Kairos contract from the browser.
- Automatic duty must be bounded and opt-in: pulse + observe eligible work
  only, never spend ungated node resources.
- Avoid committing generated `dist-live/`, `node_modules/`, `*.map`, or
  secrets.

### BEFORE committing

1. No secrets, identity bundles, or `.env` files.
2. Conventional commit subject (`feat:`, `fix:`, `docs:`, …).
3. PR body explains **why**; link the approved issue for features.
4. Note how you verified (publish + hard-refresh preferred).

### WHEN fixing a bug

Prefer a clear reproduction in the issue or PR (steps, expected, actual). If
you add automated coverage, keep it focused on the failure mode.

### WHEN using AI

Disclose assistance on the PR (`[AI-assisted - …]`). You still own the design
and must be able to defend it.

## Primary Verification

```sh
cargo test -p kairos-time -- --nocapture
cargo test -p kairos-identity -- --nocapture
cd site && npm install && npm run build:live
# end-to-end (needs a running Freenet node + fdev):
bash scripts/publish-contract.sh
bash scripts/publish-website.sh
```

Open the printed website URL and hard-refresh. The browser must soft-Get /
Subscribe to the existing contract — never create it.

## Related Docs

- [`SCHEMA.md`](SCHEMA.md) — contract wire format
- [`docs/identity.md`](docs/identity.md) — witness identity
- [`docs/public-goods.md`](docs/public-goods.md) — public-goods policy
