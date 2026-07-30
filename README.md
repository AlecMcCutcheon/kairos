# Kairos

**Active demo / experimental** Freenet time oracle — verifiable *shared*
wall time for apps on the mesh. Peers pulse signed observations; aged
witnesses help seal content-hash stamps with a median, error interval, and
transcript apps can `Get`.

Kairos is a **shared Freenet clock**, not laptop NTP. Labs on the site
(Telemetry, OTP) are intentionally demo-grade in places; we still harden
what we can (age gates, seal-history reputation, OTP tip jump guard) to
lead by example. Honest limits:
[Trust & security](site/wiki-security.html) (also on the published site).

| Piece | Status |
|-------|--------|
| Status | **Active** — contract + website published; APIs evolving |
| Maturity | **Demo / experimental** — useful for Freenet labs & early app wiring |
| `kairos-time` | Published (`kairos-time-v2` params) |
| `kairos-identity` | Auto-minted ed25519 witness delegate |
| Website | `fdev` key `kairos` → contract `DWA62j25yachmcDhwrax7mGfUoFp8u68LpPfxBmLKYcZ` |
| OTP / Telemetry | Live Freenet labs (site-wide network duty) |

**Website (local gateway):**  
http://127.0.0.1:7509/v1/contract/web/DWA62j25yachmcDhwrax7mGfUoFp8u68LpPfxBmLKYcZ/

**River chat (invite):**  
http://127.0.0.1:7509/v1/contract/web/raAqMhMG7KUpXBU2SxgCQ3Vh4PYjttxdSWd9ftV7RLv/?invitation=2C4uYXWqtvgFofF3fjeo8irDkgMg41ZQQLdGVXidSEKPHAb81MLVXnEM48cYkXTe876uCKTb9dwExaME9Ng1AufGqVFAXRwfMWpwMDbiqz1LrWBd1PLRCoCsSEQ4coQfhr1ZMGKRLR8YtrPvRhX47N3k8yqZqRHxT8rjUYgKBuvommAR4kpcsrRrDJLC83BWoY4BquZxKDLSFNJH7QQuMc9gXAvwP8BQdg5GdKyxuCCAaRgmMRmXFYvzHGU3ast2f8KDRVSSzFF2hGQieLTHKKfXro8BjA7EJ8n3RtjGKyxVBEeVhH8w4gtVPGH2hVHRcHVz6APXnfZP5vszAf9ggSyC5ZdEwYdEjoBkWLpV4mvE62FUMDF8WKZ32jtJdE5yCkhMHVmpzFREnhY1fYeEHCTDfvCY4kistJ1EVMzkvidKuuxubzuvjLQuQReHdJBir8JhuTcvccCHXRSqf3H2W4gf

## Why apps should embed this

Seals and a useful tip only appear when **other Freenet apps** Subscribe /
run network duty so their users contribute pulses and stamp observes as a
side effect of using those apps. Reciprocity is client policy — Freenet
does not auto-keep unrelated contracts alive. See
[`docs/public-goods.md`](docs/public-goods.md) and the wiki **Hosting** /
**Trust & security** pages.

## Docs

- [`SCHEMA.md`](SCHEMA.md) — contract state & surfaces  
- [`docs/dependable-time.md`](docs/dependable-time.md) — dependable intervals  
- [`docs/identity.md`](docs/identity.md) — witness + delegate  
- [`docs/public-goods.md`](docs/public-goods.md) — mutual soft-hosting  
- Site wiki (Overview → Trust & security, Pulses vs stamps, OTP, …)

## Build / publish

```bash
bash scripts/build.sh              # WASM → site/public + constants
cd site && npm install && npm run build:live
bash scripts/publish-contract.sh
bash scripts/publish-identity.sh
bash scripts/publish-website.sh
```

Hard-refresh the website URL from `fdev website list` (key `kairos`).

## Remotes

- GitHub: `https://github.com/AlecMcCutcheon/kairos`  
- Freenet: `freenet::Ezqujc7nQxWx/kairos` (GitForge Discover after register)
