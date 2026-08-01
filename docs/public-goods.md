# Public-goods hosting (Kairos ↔ GitForge)

Kairos publishes the versioned `freenet.public-good.v1` manifest from its live
bundle. The manifest describes `pulse` and `observe_stamp` capabilities while
keeping the Kairos identity delegate and private key service-owned. `GetIdentity`
is read-only; the foreground initialization operation is `EnsureIdentity`, and
background duty never calls it.

Freenet does not auto-keep unrelated contracts alive. Reciprocity is
**client policy**.

Kairos is the production shared clock (early maturity). It becomes broadly
useful once other Freenet apps and services **embed the API** (Get /
Subscribe / network duty) so people using those apps automatically help
pulse and observe. As a network, that means putting time and energy into
wiring these services into product frameworks — not only opening the Kairos
site.

## While browsing GitForge

The GitForge SPA mounts a non-blocking **Kairos duty worker** (delayed
start; failures never block page load). It soft-Gets / Subscribes the time
contract and runs network duty (pulse; observe open stamps when
age-eligible). That enrolls forge visitors as hosts/witnesses for verifiable
time.

## While using Kairos directly

The Kairos site (and any SDK that stamps content) should soft-host a small
**public-goods set**, for example:

1. Kairos time oracle contract  
2. GitForge ForgeRegistry (optional but encourages mutual survival)  
3. This Kairos website contract (so the docs stay reachable)

Exact keys (current):

| Good | Key / note |
|------|------------|
| Kairos website | `DWA62j25yachmcDhwrax7mGfUoFp8u68LpPfxBmLKYcZ` (`fdev` name `kairos`) |
| Time params | `kairos-time-v2` (instance id; see `SCHEMA.md`) |
| Time WASM hash | `9mW5W6i2873t1Zr4EPtVBHi7kjjTFhyeUfyC5CWNEHP` |

## What WASM cannot do

The time contract cannot “call back” to load GitForge. Only the browser app,
CLI, or a local delegate can subscribe to multiple keys.
