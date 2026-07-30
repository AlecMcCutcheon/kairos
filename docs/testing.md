# Testing Kairos

## Contract unit tests (no Freenet node)

```bash
cd kairos
cargo test -p kairos-time -- --nocapture
```

Covers: pulse ≠ seal, age gating, seal interval/transcript, MAD outliers,
legacy field fill, uncertainty rejection, seal micro-bench (32 witnesses).

## What Telemetry does (manual check)

| Action | Network | What moves |
|--------|---------|------------|
| Page load / 8s timer / **Pulse now** | `Update` pulse + `Get` | Pulse median / roster age |
| **Get only** | `Get` | Same metrics, no write |
| Header “Offline demo · seal #” | nothing on Freenet | Browser demo simulator |

Sealed stamps only change after `open_stamp` + aged `observe_stamp`.

## Website after UI/test-related site edits

```bash
cd kairos/site && npm run build:live
bash ../scripts/publish-website.sh
```
