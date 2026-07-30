# Kairos auto-identity

Kairos does not ask for a username. Each node that pulses gets an **auto-minted
ed25519 witness**:

- Display label: `kairos-<short>` (cosmetic only)
- Contract id: `bs58(pubkey)` (`node_id`)

## Where the secret lives

1. **Preferred:** Freenet delegate `kairos-identity` (`EnsureIdentity` /
   `SignPulse` / `SignStampObserve`). Secret stored with `set_secret` on the
   local node — survives site reloads and is reusable by any Freenet app that
   talks to this delegate.
2. **Fallback:** Durable local key in the page — memory + shared `window.name`
   bag + `localStorage` when the host allows it (needed under `__sandbox=1`).

If the delegate secret is wiped, Ensure mints a new key. Roster **age gating
resets** for that new key (intentional Sybil cost).

## Age gating (unchanged)

Stamp *observations* require ~1 hour on the Kairos roster. Pulsing itself has
no rate limit. Age is per witness key, same rule for everyone.
