//! Kairos identity delegate — auto-minted ed25519 witness for the time oracle.
//!
//! Secrets live in Freenet delegate storage (`id_sk`, `id_label`). The website
//! calls EnsureIdentity / SignPulse / SignStampObserve; the secret never needs
//! to sit in page JS when this path works. If the delegate is wiped, Ensure
//! mints a new key (roster age starts over — intentional Sybil cost).

#![allow(unexpected_cfgs)]

use ed25519_dalek::{Signer, SigningKey};
use freenet_stdlib::prelude::*;
use serde::{Deserialize, Serialize};

#[cfg(all(target_arch = "wasm32", not(test)))]
use getrandom::register_custom_getrandom;

#[cfg(all(target_arch = "wasm32", not(test)))]
fn freenet_getrandom(dest: &mut [u8]) -> Result<(), getrandom::Error> {
    let bytes = freenet_stdlib::rand::rand_bytes(dest.len() as u32);
    dest.copy_from_slice(&bytes[..dest.len()]);
    Ok(())
}

#[cfg(all(target_arch = "wasm32", not(test)))]
register_custom_getrandom!(freenet_getrandom);

struct KairosIdentityDelegate;

const SECRET_ID_SK: &[u8] = b"id_sk";
const SECRET_ID_LABEL: &[u8] = b"id_label";

const PULSE_DOMAIN: &[u8] = b"kairos.pulse.v1\0";
const STAMP_OBSERVE_DOMAIN: &[u8] = b"kairos.stamp.observe.v1\0";

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum Request {
    /// Create if missing; always return current identity.
    EnsureIdentity {
        #[serde(default)]
        nonce: String,
    },
    GetIdentity {
        #[serde(default)]
        nonce: String,
    },
    SignPulse {
        nonce: String,
        wall_ms: u64,
        monotonic_ms: u64,
        uncertainty_ms: u64,
    },
    SignStampObserve {
        nonce: String,
        request_id: String,
        wall_ms: u64,
        monotonic_ms: u64,
        uncertainty_ms: u64,
    },
    ExportIdentity {
        #[serde(default)]
        nonce: String,
    },
    ImportIdentity {
        #[serde(default)]
        nonce: String,
        secret_key_hex: String,
        #[serde(default)]
        label: String,
    },
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum Response {
    Identity {
        #[serde(default)]
        nonce: String,
        node_id: String,
        label: String,
        created: bool,
    },
    SignedObservation {
        nonce: String,
        node_id: String,
        wall_ms: u64,
        monotonic_ms: u64,
        uncertainty_ms: u64,
        sig: String,
    },
    ExportedIdentity {
        #[serde(default)]
        nonce: String,
        secret_key_hex: String,
        node_id: String,
        label: String,
    },
    Error {
        message: String,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        nonce: Option<String>,
    },
}

fn push_field(out: &mut Vec<u8>, bytes: &[u8]) {
    out.extend_from_slice(bytes);
    out.push(0);
}

fn pulse_signing_payload(node_id: &str, wall_ms: u64, monotonic_ms: u64, unc: u64) -> Vec<u8> {
    let mut out = Vec::with_capacity(128);
    out.extend_from_slice(PULSE_DOMAIN);
    push_field(&mut out, node_id.as_bytes());
    push_field(&mut out, wall_ms.to_string().as_bytes());
    push_field(&mut out, monotonic_ms.to_string().as_bytes());
    push_field(&mut out, unc.to_string().as_bytes());
    out
}

fn stamp_observe_signing_payload(
    request_id: &str,
    node_id: &str,
    wall_ms: u64,
    monotonic_ms: u64,
    unc: u64,
) -> Vec<u8> {
    let mut out = Vec::with_capacity(160);
    out.extend_from_slice(STAMP_OBSERVE_DOMAIN);
    push_field(&mut out, request_id.as_bytes());
    push_field(&mut out, node_id.as_bytes());
    push_field(&mut out, wall_ms.to_string().as_bytes());
    push_field(&mut out, monotonic_ms.to_string().as_bytes());
    push_field(&mut out, unc.to_string().as_bytes());
    out
}

fn node_id_of(sk: &SigningKey) -> String {
    bs58::encode(sk.verifying_key().as_bytes()).into_string()
}

fn auto_label(node_id: &str) -> String {
    let short: String = node_id
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .take(6)
        .collect::<String>()
        .to_lowercase();
    format!(
        "kairos-{}",
        if short.is_empty() { "node".into() } else { short }
    )
}

fn random_sk_bytes() -> [u8; 32] {
    let rnd = freenet_stdlib::rand::rand_bytes(32);
    let mut key = [0u8; 32];
    key.copy_from_slice(&rnd[..32]);
    key
}

fn load_sk(ctx: &DelegateCtx) -> Result<SigningKey, Response> {
    match ctx.get_secret(SECRET_ID_SK) {
        Some(bytes) if bytes.len() == 32 => {
            let mut arr = [0u8; 32];
            arr.copy_from_slice(&bytes);
            Ok(SigningKey::from_bytes(&arr))
        }
        Some(_) => Err(Response::Error {
            message: "identity secret corrupt".into(),
            nonce: None,
        }),
        None => Err(Response::Error {
            message: "no identity — call EnsureIdentity first".into(),
            nonce: None,
        }),
    }
}

fn load_label(ctx: &DelegateCtx, node_id: &str) -> String {
    match ctx.get_secret(SECRET_ID_LABEL) {
        Some(bytes) => String::from_utf8_lossy(&bytes).trim().to_string(),
        None => auto_label(node_id),
    }
}

fn ensure_identity(ctx: &mut DelegateCtx, nonce: &str) -> Response {
    if let Ok(sk) = load_sk(ctx) {
        let node_id = node_id_of(&sk);
        return Response::Identity {
            nonce: nonce.to_string(),
            label: load_label(ctx, &node_id),
            node_id,
            created: false,
        };
    }
    let sk_bytes = random_sk_bytes();
    let sk = SigningKey::from_bytes(&sk_bytes);
    let node_id = node_id_of(&sk);
    let label = auto_label(&node_id);
    ctx.set_secret(SECRET_ID_SK, &sk_bytes);
    ctx.set_secret(SECRET_ID_LABEL, label.as_bytes());
    Response::Identity {
        nonce: nonce.to_string(),
        node_id,
        label,
        created: true,
    }
}

fn get_identity(ctx: &DelegateCtx, nonce: &str) -> Response {
    match load_sk(ctx) {
        Ok(sk) => {
            let node_id = node_id_of(&sk);
            Response::Identity {
                nonce: nonce.to_string(),
                label: load_label(ctx, &node_id),
                node_id,
                created: false,
            }
        }
        Err(mut e) => {
            if let Response::Error {
                nonce: ref mut n, ..
            } = e
            {
                *n = Some(nonce.to_string());
            }
            e
        }
    }
}

fn sign_pulse(
    ctx: &DelegateCtx,
    nonce: &str,
    wall_ms: u64,
    monotonic_ms: u64,
    uncertainty_ms: u64,
) -> Response {
    let sk = match load_sk(ctx) {
        Ok(k) => k,
        Err(mut e) => {
            if let Response::Error {
                nonce: ref mut n, ..
            } = e
            {
                *n = Some(nonce.to_string());
            }
            return e;
        }
    };
    if uncertainty_ms == 0 || uncertainty_ms > 5_000 {
        return Response::Error {
            message: format!("uncertainty_ms {uncertainty_ms} out of range 1..=5000"),
            nonce: Some(nonce.to_string()),
        };
    }
    let node_id = node_id_of(&sk);
    let payload = pulse_signing_payload(&node_id, wall_ms, monotonic_ms, uncertainty_ms);
    Response::SignedObservation {
        nonce: nonce.to_string(),
        node_id,
        wall_ms,
        monotonic_ms,
        uncertainty_ms,
        sig: hex::encode(sk.sign(&payload).to_bytes()),
    }
}

fn sign_stamp_observe(
    ctx: &DelegateCtx,
    nonce: &str,
    request_id: &str,
    wall_ms: u64,
    monotonic_ms: u64,
    uncertainty_ms: u64,
) -> Response {
    let sk = match load_sk(ctx) {
        Ok(k) => k,
        Err(mut e) => {
            if let Response::Error {
                nonce: ref mut n, ..
            } = e
            {
                *n = Some(nonce.to_string());
            }
            return e;
        }
    };
    if request_id.trim().is_empty() {
        return Response::Error {
            message: "request_id required".into(),
            nonce: Some(nonce.to_string()),
        };
    }
    if uncertainty_ms == 0 || uncertainty_ms > 5_000 {
        return Response::Error {
            message: format!("uncertainty_ms {uncertainty_ms} out of range 1..=5000"),
            nonce: Some(nonce.to_string()),
        };
    }
    let node_id = node_id_of(&sk);
    let payload =
        stamp_observe_signing_payload(request_id, &node_id, wall_ms, monotonic_ms, uncertainty_ms);
    Response::SignedObservation {
        nonce: nonce.to_string(),
        node_id,
        wall_ms,
        monotonic_ms,
        uncertainty_ms,
        sig: hex::encode(sk.sign(&payload).to_bytes()),
    }
}

fn export_identity(ctx: &DelegateCtx, nonce: &str) -> Response {
    match load_sk(ctx) {
        Ok(sk) => {
            let node_id = node_id_of(&sk);
            Response::ExportedIdentity {
                nonce: nonce.to_string(),
                secret_key_hex: hex::encode(sk.to_bytes()),
                node_id: node_id.clone(),
                label: load_label(ctx, &node_id),
            }
        }
        Err(mut e) => {
            if let Response::Error {
                nonce: ref mut n, ..
            } = e
            {
                *n = Some(nonce.to_string());
            }
            e
        }
    }
}

fn import_identity(ctx: &mut DelegateCtx, nonce: &str, secret_hex: &str, label: &str) -> Response {
    let bytes = match hex::decode(secret_hex.trim()) {
        Ok(b) => b,
        Err(e) => {
            return Response::Error {
                message: format!("bad secret hex: {e}"),
                nonce: Some(nonce.to_string()),
            };
        }
    };
    let arr: [u8; 32] = match bytes.as_slice().try_into() {
        Ok(a) => a,
        Err(_) => {
            return Response::Error {
                message: "secret must be 32 bytes".into(),
                nonce: Some(nonce.to_string()),
            };
        }
    };
    let sk = SigningKey::from_bytes(&arr);
    let node_id = node_id_of(&sk);
    let lab = if label.trim().is_empty() {
        auto_label(&node_id)
    } else {
        label.trim().to_string()
    };
    ctx.set_secret(SECRET_ID_SK, &arr);
    ctx.set_secret(SECRET_ID_LABEL, lab.as_bytes());
    Response::Identity {
        nonce: nonce.to_string(),
        node_id,
        label: lab,
        created: false,
    }
}

fn respond(response: Response) -> Result<Vec<OutboundDelegateMsg>, DelegateError> {
    let bytes =
        serde_json::to_vec(&response).map_err(|e| DelegateError::Other(format!("serde: {e}")))?;
    Ok(vec![OutboundDelegateMsg::ApplicationMessage(
        ApplicationMessage::new(bytes),
    )])
}

#[delegate]
impl DelegateInterface for KairosIdentityDelegate {
    fn process(
        ctx: &mut DelegateCtx,
        _parameters: Parameters<'static>,
        origin: Option<MessageOrigin>,
        message: InboundDelegateMsg,
    ) -> Result<Vec<OutboundDelegateMsg>, DelegateError> {
        match &origin {
            Some(MessageOrigin::WebApp(_)) | None => {}
            Some(MessageOrigin::Delegate(_)) => {
                return Err(DelegateError::Other(
                    "kairos-identity does not accept inter-delegate calls".into(),
                ));
            }
            other => {
                return Err(DelegateError::Other(format!(
                    "kairos-identity rejects origin {other:?}"
                )));
            }
        }

        match message {
            InboundDelegateMsg::ApplicationMessage(app_msg) => {
                let request: Request = serde_json::from_slice(&app_msg.payload)
                    .map_err(|e| DelegateError::Other(format!("invalid request: {e}")))?;
                let response = match request {
                    Request::EnsureIdentity { nonce } => ensure_identity(ctx, &nonce),
                    Request::GetIdentity { nonce } => get_identity(ctx, &nonce),
                    Request::SignPulse {
                        nonce,
                        wall_ms,
                        monotonic_ms,
                        uncertainty_ms,
                    } => sign_pulse(ctx, &nonce, wall_ms, monotonic_ms, uncertainty_ms),
                    Request::SignStampObserve {
                        nonce,
                        request_id,
                        wall_ms,
                        monotonic_ms,
                        uncertainty_ms,
                    } => sign_stamp_observe(
                        ctx,
                        &nonce,
                        &request_id,
                        wall_ms,
                        monotonic_ms,
                        uncertainty_ms,
                    ),
                    Request::ExportIdentity { nonce } => export_identity(ctx, &nonce),
                    Request::ImportIdentity {
                        nonce,
                        secret_key_hex,
                        label,
                    } => import_identity(ctx, &nonce, &secret_key_hex, &label),
                };
                respond(response)
            }
            _ => Err(DelegateError::Other("unsupported message".into())),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pulse_payload_domain_prefix() {
        let p = pulse_signing_payload("abc", 1, 2, 40);
        assert!(p.starts_with(PULSE_DOMAIN));
    }

    #[test]
    fn auto_label_shape() {
        let l = auto_label("AbC123XYZ");
        assert_eq!(l, "kairos-abc123");
    }
}
