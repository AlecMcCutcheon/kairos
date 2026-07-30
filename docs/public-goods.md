# Public-goods hosting (Kairos ↔ GitForge)

Freenet does not auto-keep unrelated contracts alive. Reciprocity is
**client policy**.

Kairos only becomes broadly useful once other Freenet apps and services
**embed the API** (Get / Subscribe / network duty) so that people using those
apps automatically help pulse and observe — contributing to this shared good
(and peers like it). As a network, that means putting time and energy into
wiring and maintaining these services inside product frameworks, not only
opening the Kairos lab tab.

## While browsing GitForge

The GitForge SPA should soft-Get / Subscribe (and optionally witness) the
Kairos time contract whenever the site is open. That enrolls forge visitors
as hosts/witnesses for verifiable time.

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

## What WASM cannot do

The time contract cannot “call back” to load GitForge. Only the browser app,
CLI, or a local delegate can subscribe to multiple keys.
