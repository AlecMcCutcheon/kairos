/**
 * Shared interoperability description for Freenet public goods.
 *
 * This manifest is deliberately separate from the identity key: Kairos owns
 * its own delegate, witness age, reputation, and signing domain.
 */
export const PUBLIC_GOODS_PROTOCOL = "freenet.public-good.v1";

export const KAIROS_PUBLIC_GOOD = Object.freeze({
  protocol: PUBLIC_GOODS_PROTOCOL,
  service: "kairos",
  version: 1,
  capabilities: Object.freeze(["pulse", "observe_stamp"]),
  identity_policy: Object.freeze({
    owner: "service",
    private_key_custody: "service_delegate",
    background_creation: false,
    foreground_initialization: "EnsureIdentity",
  }),
});

export function describePublicGood() {
  return KAIROS_PUBLIC_GOOD;
}
