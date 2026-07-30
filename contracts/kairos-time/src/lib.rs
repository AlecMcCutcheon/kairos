//! Kairos time oracle v2 — pulse (liveness) vs stamp (authoritative), age-gated.

#![allow(unexpected_cfgs)]

use ed25519_compact::{PublicKey, Signature};
use freenet_stdlib::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

const PULSE_DOMAIN: &[u8] = b"kairos.pulse.v1\0";
const STAMP_OBSERVE_DOMAIN: &[u8] = b"kairos.stamp.observe.v1\0";

/// Stamp witnesses must have been pulsing at least this long
/// (`observation.wall_ms - roster.first_seen_ms`). Not tied to GitForge.
/// Early-network default: 1 hour. Target production: raise toward days/weeks.
const MIN_AGE_MS: u64 = 3_600_000;
const MIN_STAMP_WITNESSES: usize = 5;
const TRIM_FRACTION: f64 = 0.2;
const MAX_UNCERTAINTY_MS: u64 = 5_000;

/// Seal-history reputation (0–1000). Neutral when no seal history (cold start).
const REP_NEUTRAL: u32 = 500;
/// Below this, refuse stamp observes once the network has enough seals.
const REP_MIN_STAMP: u32 = 300;
/// Blend inclusion rate toward neutral until this many seal outcomes.
const REP_HISTORY_BLEND: u64 = 10;
/// Don't apply reputation gate until this many seals exist network-wide.
const MIN_NETWORK_SEALS_FOR_REP_GATE: usize = 3;
/// Age weight ramps from 1× at MIN_AGE up to 4× over this span.
const AGE_RAMP_MS: u64 = 7 * 24 * 3_600_000;

/// Retention — large enough for accuracy / Sybil friction, bounded so state
/// cannot grow without limit.
const MAX_ROSTER: usize = 4_096;
const MAX_PULSE: usize = 1_024;
const MAX_OPEN_STAMPS: usize = 256;
const MAX_SEALED_STAMPS: usize = 1_024;
const MAX_OBS_PER_STAMP: usize = 512;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Observation {
    pub node_id: String,
    pub wall_ms: u64,
    pub monotonic_ms: u64,
    pub uncertainty_ms: u64,
    pub sig: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct RosterEntry {
    pub first_seen_ms: u64,
    pub last_seen_ms: u64,
    pub pulse_count: u64,
    /// Times this key was included in a sealed stamp's `witness_ids`.
    #[serde(default)]
    pub seals_included: u64,
    /// Times this key observed an open stamp but was MAD-dropped at seal.
    #[serde(default)]
    pub seals_outlier: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct OpenStamp {
    pub content_hash: String,
    pub nonce: String,
    pub opened_hint_ms: u64,
    pub observations: BTreeMap<String, Observation>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct SealedStamp {
    pub content_hash: String,
    pub nonce: String,
    pub median_wall_ms: u64,
    pub trimmed_mean_ms: u64,
    pub confidence_ms: u64,
    pub median_abs_dev_ms: u64,
    pub witness_count: u32,
    pub witness_ids: Vec<String>,
    pub sealed_at_ms: u64,
    /// Half-width of the sealed interval at seal time (Byztime-style `error`).
    /// Equal to `confidence_ms`; explicit for app consumers that expect an
    /// error bound rather than a confidence label. Apps widen this with
    /// local staleness after Get — Kairos does not sync device clocks.
    #[serde(default)]
    pub error_ms: u64,
    /// Inclusive lower bound at seal: `median_wall_ms.saturating_sub(error_ms)`.
    #[serde(default)]
    pub earliest_ms: u64,
    /// Inclusive upper bound at seal: `median_wall_ms + error_ms`.
    #[serde(default)]
    pub latest_ms: u64,
    /// FNV-1a-64 hex digest of sorted witness lines
    /// (`node_id|wall_ms|uncertainty_ms|sig`). Binds what entered the seal
    /// for Roughtime-style accountability / divergence checks.
    #[serde(default)]
    pub transcript_digest: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Default)]
pub struct KairosState {
    #[serde(default)]
    pub schema_version: u32,
    /// Long-lived participation (age / eligibility). Not GitForge-linked.
    #[serde(default)]
    pub roster: BTreeMap<String, RosterEntry>,
    /// Latest pulse per node — telemetry / keep-alive only.
    #[serde(default)]
    pub pulse: BTreeMap<String, Observation>,
    /// Authoritative stamp requests in flight.
    #[serde(default)]
    pub open_stamps: BTreeMap<String, OpenStamp>,
    #[serde(default)]
    pub sealed_stamps: BTreeMap<String, SealedStamp>,
}

impl KairosState {
    fn empty() -> Self {
        Self {
            schema_version: 2,
            roster: BTreeMap::new(),
            pulse: BTreeMap::new(),
            open_stamps: BTreeMap::new(),
            sealed_stamps: BTreeMap::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(untagged)]
enum UpdateEnvelope {
    /// Keep-alive / telemetry. Anyone. Does not create stamps.
    Pulse { pulse: Observation },
    /// Authoritative API — open a stamp request.
    OpenStamp { open_stamp: OpenStampOp },
    /// Authoritative API — eligible witness observation.
    ObserveStamp { observe_stamp: ObserveStampOp },
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct OpenStampOp {
    pub content_hash: String,
    pub nonce: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ObserveStampOp {
    pub request_id: String,
    pub observation: Observation,
}

fn push_field(out: &mut Vec<u8>, bytes: &[u8]) {
    out.extend_from_slice(bytes);
    out.push(0);
}

pub fn pulse_signing_payload(o: &Observation) -> Vec<u8> {
    let mut out = Vec::with_capacity(128);
    out.extend_from_slice(PULSE_DOMAIN);
    push_field(&mut out, o.node_id.as_bytes());
    push_field(&mut out, o.wall_ms.to_string().as_bytes());
    push_field(&mut out, o.monotonic_ms.to_string().as_bytes());
    push_field(&mut out, o.uncertainty_ms.to_string().as_bytes());
    out
}

pub fn stamp_observe_signing_payload(request_id: &str, o: &Observation) -> Vec<u8> {
    let mut out = Vec::with_capacity(160);
    out.extend_from_slice(STAMP_OBSERVE_DOMAIN);
    push_field(&mut out, request_id.as_bytes());
    push_field(&mut out, o.node_id.as_bytes());
    push_field(&mut out, o.wall_ms.to_string().as_bytes());
    push_field(&mut out, o.monotonic_ms.to_string().as_bytes());
    push_field(&mut out, o.uncertainty_ms.to_string().as_bytes());
    out
}

fn decode_vk_b58(s: &str) -> Result<[u8; 32], String> {
    let bytes = bs58::decode(s)
        .into_vec()
        .map_err(|e| format!("base58 decode: {e}"))?;
    bytes
        .as_slice()
        .try_into()
        .map_err(|_| format!("verifying key must be 32 bytes, got {}", bytes.len()))
}

fn verify_ed25519(vk: &[u8; 32], sig_hex: &str, payload: &[u8]) -> Result<(), String> {
    let sig_bytes = hex::decode(sig_hex).map_err(|e| format!("sig hex: {e}"))?;
    if sig_bytes.len() != 64 {
        return Err(format!("signature must be 64 bytes, got {}", sig_bytes.len()));
    }
    let pk = PublicKey::from_slice(vk).map_err(|e| format!("public key: {e}"))?;
    let sig = Signature::from_slice(&sig_bytes).map_err(|e| format!("signature: {e}"))?;
    pk.verify(payload, &sig)
        .map_err(|_| "ed25519 verification failed".to_string())
}

fn check_observation(o: &Observation) -> Result<(), String> {
    if o.uncertainty_ms == 0 || o.uncertainty_ms > MAX_UNCERTAINTY_MS {
        return Err(format!(
            "uncertainty_ms {} out of range 1..={MAX_UNCERTAINTY_MS}",
            o.uncertainty_ms
        ));
    }
    let vk = decode_vk_b58(&o.node_id)?;
    let expected = bs58::encode(vk).into_string();
    if expected != o.node_id {
        return Err("node_id must be canonical bs58".into());
    }
    Ok(())
}

fn verify_pulse(o: &Observation) -> Result<(), ContractError> {
    check_observation(o).map_err(ContractError::Other)?;
    let vk = decode_vk_b58(&o.node_id).map_err(ContractError::Other)?;
    verify_ed25519(&vk, &o.sig, &pulse_signing_payload(o)).map_err(ContractError::Other)?;
    Ok(())
}

fn verify_stamp_observe(request_id: &str, o: &Observation) -> Result<(), ContractError> {
    check_observation(o).map_err(ContractError::Other)?;
    let vk = decode_vk_b58(&o.node_id).map_err(ContractError::Other)?;
    verify_ed25519(&vk, &o.sig, &stamp_observe_signing_payload(request_id, o))
        .map_err(ContractError::Other)?;
    Ok(())
}

fn is_eligible(state: &KairosState, o: &Observation) -> bool {
    let Some(e) = state.roster.get(&o.node_id) else {
        return false;
    };
    if o.wall_ms.saturating_sub(e.first_seen_ms) < MIN_AGE_MS {
        return false;
    }
    // OLD CODE - KEEP UNTIL CONFIRMED WORKING
    // age-only eligibility
    // NEW CODE - TESTING: seal-history reputation gate after cold start
    if state.sealed_stamps.len() < MIN_NETWORK_SEALS_FOR_REP_GATE {
        return true;
    }
    reputation_score(e) >= REP_MIN_STAMP
}

/// 0–1000 score from seal inclusion vs outlier history; neutral with no history.
fn reputation_score(e: &RosterEntry) -> u32 {
    let total = e.seals_included.saturating_add(e.seals_outlier);
    if total == 0 {
        return REP_NEUTRAL;
    }
    let rate = ((e.seals_included.saturating_mul(1000)) / total.max(1)) as u32;
    let n = total.min(REP_HISTORY_BLEND);
    ((u64::from(rate) * n + u64::from(REP_NEUTRAL) * (REP_HISTORY_BLEND - n))
        / REP_HISTORY_BLEND) as u32
}

/// Observation weight for weighted median (age ramp × reputation).
fn observe_weight(e: &RosterEntry, wall_ms: u64) -> u64 {
    let age = wall_ms.saturating_sub(e.first_seen_ms);
    if age < MIN_AGE_MS {
        return 0;
    }
    let rep = u64::from(reputation_score(e).max(1));
    let over = age.saturating_sub(MIN_AGE_MS).min(AGE_RAMP_MS);
    let age_factor = 1000 + (over.saturating_mul(3000)) / AGE_RAMP_MS.max(1);
    ((rep * age_factor) / 100_000).clamp(1, 64)
}

fn weighted_median(pairs: &[(u64, u64)]) -> u64 {
    if pairs.is_empty() {
        return 0;
    }
    let mut v = pairs.to_vec();
    v.sort_by_key(|(wall, _)| *wall);
    let total: u64 = v.iter().map(|(_, w)| *w).sum();
    if total == 0 {
        return v[v.len() / 2].0;
    }
    let half = (total + 1) / 2;
    let mut acc = 0u64;
    for (wall, w) in &v {
        acc = acc.saturating_add(*w);
        if acc >= half {
            return *wall;
        }
    }
    v.last().map(|(wall, _)| *wall).unwrap_or(0)
}

fn median_u64(sorted: &[u64]) -> u64 {
    if sorted.is_empty() {
        return 0;
    }
    let m = sorted.len() / 2;
    if sorted.len() % 2 == 1 {
        sorted[m]
    } else {
        (sorted[m - 1] + sorted[m]) / 2
    }
}

fn trimmed_mean_u64(values: &[u64]) -> u64 {
    if values.is_empty() {
        return 0;
    }
    let mut sorted = values.to_vec();
    sorted.sort_unstable();
    let drop = ((sorted.len() as f64) * TRIM_FRACTION).floor() as usize;
    let end = sorted.len().saturating_sub(drop);
    let slice = if end > drop {
        &sorted[drop..end]
    } else {
        &sorted[..]
    };
    let sum: u128 = slice.iter().map(|&x| x as u128).sum();
    (sum / slice.len() as u128) as u64
}

fn mad_u64(values: &[u64], med: u64) -> u64 {
    let mut devs: Vec<u64> = values.iter().map(|&v| v.abs_diff(med)).collect();
    devs.sort_unstable();
    median_u64(&devs)
}

/// Deterministic transcript bind for sealed witnesses (no extra crypto dep).
fn transcript_digest_fnv(filtered: &[&Observation]) -> String {
    let mut lines: Vec<String> = filtered
        .iter()
        .map(|o| {
            format!(
                "{}|{}|{}|{}",
                o.node_id, o.wall_ms, o.uncertainty_ms, o.sig
            )
        })
        .collect();
    lines.sort();
    let mut h: u64 = 0xcbf29ce484222325;
    for line in lines {
        for b in line.as_bytes() {
            h ^= u64::from(*b);
            h = h.wrapping_mul(0x100000001b3);
        }
        h ^= 0xff;
        h = h.wrapping_mul(0x100000001b3);
    }
    format!("{h:016x}")
}

fn seal_interval(median_wall_ms: u64, error_ms: u64) -> (u64, u64) {
    let earliest = median_wall_ms.saturating_sub(error_ms);
    let latest = median_wall_ms.saturating_add(error_ms);
    (earliest, latest)
}

/// Fill dependable-time fields on legacy seals that lack them.
fn ensure_seal_bounds(stamp: &mut SealedStamp) {
    if stamp.error_ms == 0 {
        stamp.error_ms = stamp.confidence_ms.max(1);
    }
    if stamp.earliest_ms == 0 && stamp.latest_ms == 0 {
        let (lo, hi) = seal_interval(stamp.median_wall_ms, stamp.error_ms);
        stamp.earliest_ms = lo;
        stamp.latest_ms = hi;
    }
}

fn try_seal(state: &KairosState, req: &OpenStamp) -> Option<(SealedStamp, Vec<String>, Vec<String>)> {
    if req.observations.len() < MIN_STAMP_WITNESSES {
        return None;
    }
    let walls: Vec<u64> = req.observations.values().map(|o| o.wall_ms).collect();
    let mut sorted = walls.clone();
    sorted.sort_unstable();
    let med = median_u64(&sorted);
    let mad = mad_u64(&walls, med);
    let filtered: Vec<&Observation> = req
        .observations
        .values()
        .filter(|o| mad == 0 || o.wall_ms.abs_diff(med) <= 5 * mad)
        .collect();
    if filtered.len() < MIN_STAMP_WITNESSES {
        return None;
    }
    // NEW CODE - TESTING: weighted median by age×reputation among MAD survivors
    let weighted: Vec<(u64, u64)> = filtered
        .iter()
        .map(|o| {
            let w = state
                .roster
                .get(&o.node_id)
                .map(|e| observe_weight(e, o.wall_ms))
                .unwrap_or(1);
            (o.wall_ms, w)
        })
        .collect();
    let med2 = weighted_median(&weighted);
    let fw: Vec<u64> = filtered.iter().map(|o| o.wall_ms).collect();
    let mad2 = mad_u64(&fw, med2);
    let mut unc: Vec<u64> = filtered.iter().map(|o| o.uncertainty_ms).collect();
    unc.sort_unstable();
    let unc_med = median_u64(&unc);
    let confidence = unc_med
        .max(((mad2 as f64) * 1.4826).round() as u64)
        .max(1);
    let mut witness_ids: Vec<String> = filtered.iter().map(|o| o.node_id.clone()).collect();
    witness_ids.sort();
    let included = witness_ids.clone();
    let outliers: Vec<String> = req
        .observations
        .keys()
        .filter(|id| !included.contains(id))
        .cloned()
        .collect();
    let error_ms = confidence;
    let (earliest_ms, latest_ms) = seal_interval(med2, error_ms);
    Some((
        SealedStamp {
            content_hash: req.content_hash.clone(),
            nonce: req.nonce.clone(),
            median_wall_ms: med2,
            trimmed_mean_ms: trimmed_mean_u64(&fw),
            confidence_ms: confidence,
            median_abs_dev_ms: mad2,
            witness_count: filtered.len() as u32,
            witness_ids,
            sealed_at_ms: med2,
            error_ms,
            earliest_ms,
            latest_ms,
            transcript_digest: transcript_digest_fnv(&filtered),
        },
        included,
        outliers,
    ))
}

fn apply_seal_reputation(state: &mut KairosState, included: &[String], outliers: &[String]) {
    for id in included {
        if let Some(e) = state.roster.get_mut(id) {
            e.seals_included = e.seals_included.saturating_add(1);
        }
    }
    for id in outliers {
        if let Some(e) = state.roster.get_mut(id) {
            e.seals_outlier = e.seals_outlier.saturating_add(1);
        }
    }
}

fn prune_roster(state: &mut KairosState) {
    while state.roster.len() > MAX_ROSTER {
        let victim = state
            .roster
            .iter()
            .min_by_key(|(_, e)| e.last_seen_ms)
            .map(|(k, _)| k.clone());
        if let Some(k) = victim {
            state.roster.remove(&k);
            state.pulse.remove(&k);
        } else {
            break;
        }
    }
}

fn prune_pulse(state: &mut KairosState) {
    while state.pulse.len() > MAX_PULSE {
        let victim = state
            .pulse
            .iter()
            .min_by_key(|(_, o)| o.wall_ms)
            .map(|(k, _)| k.clone());
        if let Some(k) = victim {
            state.pulse.remove(&k);
        } else {
            break;
        }
    }
}

fn prune_open(state: &mut KairosState) {
    while state.open_stamps.len() > MAX_OPEN_STAMPS {
        let victim = state
            .open_stamps
            .iter()
            .min_by_key(|(_, r)| r.opened_hint_ms)
            .map(|(k, _)| k.clone());
        if let Some(k) = victim {
            state.open_stamps.remove(&k);
        } else {
            break;
        }
    }
}

fn prune_sealed(state: &mut KairosState) {
    while state.sealed_stamps.len() > MAX_SEALED_STAMPS {
        let victim = state
            .sealed_stamps
            .iter()
            .min_by_key(|(_, s)| s.sealed_at_ms)
            .map(|(k, _)| k.clone());
        if let Some(k) = victim {
            state.sealed_stamps.remove(&k);
        } else {
            break;
        }
    }
}

fn apply_pulse(state: &mut KairosState, o: Observation) -> Result<(), ContractError> {
    verify_pulse(&o)?;
    let id = o.node_id.clone();
    let wall = o.wall_ms;
    match state.roster.get_mut(&id) {
        Some(e) => {
            e.last_seen_ms = e.last_seen_ms.max(wall);
            e.pulse_count = e.pulse_count.saturating_add(1);
            if wall < e.first_seen_ms {
                // Ignore clock-rewind for first_seen (anti-gaming).
            }
        }
        None => {
            state.roster.insert(
                id.clone(),
                RosterEntry {
                    first_seen_ms: wall,
                    last_seen_ms: wall,
                    pulse_count: 1,
                    seals_included: 0,
                    seals_outlier: 0,
                },
            );
        }
    }
    state.pulse.insert(id, o);
    prune_roster(state);
    prune_pulse(state);
    Ok(())
}

fn apply_open_stamp(state: &mut KairosState, op: OpenStampOp) -> Result<(), ContractError> {
    let hash = op.content_hash.trim().to_string();
    let nonce = op.nonce.trim().to_string();
    if hash.is_empty() || hash.len() > 128 {
        return Err(ContractError::Other("content_hash invalid".into()));
    }
    if nonce.is_empty() || nonce.len() > 128 {
        return Err(ContractError::Other("nonce required".into()));
    }
    let request_id = format!("{hash}:{nonce}");
    if state.sealed_stamps.contains_key(&request_id) {
        return Ok(());
    }
    state
        .open_stamps
        .entry(request_id)
        .or_insert_with(|| OpenStamp {
            content_hash: hash,
            nonce,
            opened_hint_ms: 0,
            observations: BTreeMap::new(),
        });
    prune_open(state);
    Ok(())
}

fn apply_observe_stamp(state: &mut KairosState, op: ObserveStampOp) -> Result<(), ContractError> {
    verify_stamp_observe(&op.request_id, &op.observation)?;
    if !is_eligible(state, &op.observation) {
        return Err(ContractError::Other(
            "witness not eligible for stamps (age and/or seal reputation)".into(),
        ));
    }
    if state.sealed_stamps.contains_key(&op.request_id) {
        return Ok(());
    }
    let req = state
        .open_stamps
        .get_mut(&op.request_id)
        .ok_or_else(|| ContractError::Other("unknown stamp request_id".into()))?;
    if req.opened_hint_ms == 0 {
        req.opened_hint_ms = op.observation.wall_ms;
    }
    req.observations
        .insert(op.observation.node_id.clone(), op.observation);
    while req.observations.len() > MAX_OBS_PER_STAMP {
        let victim = req.observations.keys().next().cloned();
        if let Some(k) = victim {
            req.observations.remove(&k);
        } else {
            break;
        }
    }
    // Clone request for seal attempt (need immutable state borrow for weights).
    let req_snap = state.open_stamps.get(&op.request_id).cloned();
    if let Some(req_snap) = req_snap {
        if let Some((stamp, included, outliers)) = try_seal(state, &req_snap) {
            state.open_stamps.remove(&op.request_id);
            state.sealed_stamps.insert(op.request_id.clone(), stamp);
            apply_seal_reputation(state, &included, &outliers);
            prune_sealed(state);
        }
    }
    Ok(())
}

fn parse_state(bytes: &[u8]) -> Result<KairosState, ContractError> {
    if bytes.is_empty() {
        return Ok(KairosState::empty());
    }
    // Prefer v2; soft-upgrade legacy { pulse, open, sealed }.
    if let Ok(v2) = serde_json::from_slice::<KairosState>(bytes) {
        // v2 shape (roster / open_stamps) or already schema_version >= 2
        if v2.schema_version >= 2
            || !v2.roster.is_empty()
            || !v2.open_stamps.is_empty()
            || !v2.sealed_stamps.is_empty()
            || (!v2.pulse.is_empty() && v2.schema_version == 2)
        {
            let mut s = v2;
            s.schema_version = 2;
            for stamp in s.sealed_stamps.values_mut() {
                ensure_seal_bounds(stamp);
            }
            return Ok(s);
        }
        // Empty-ish deserialize of KairosState from legacy JSON may succeed
        // with defaults — fall through to Legacy parser.
        if v2.schema_version == 2 {
            let mut s = v2;
            for stamp in s.sealed_stamps.values_mut() {
                ensure_seal_bounds(stamp);
            }
            return Ok(s);
        }
    }
    #[derive(Deserialize)]
    struct Legacy {
        #[serde(default)]
        pulse: BTreeMap<String, Observation>,
        #[serde(default)]
        open: BTreeMap<String, LegacyOpen>,
        #[serde(default)]
        sealed: BTreeMap<String, LegacySealed>,
    }
    #[derive(Deserialize)]
    struct LegacyOpen {
        content_hash: String,
        #[serde(default)]
        observations: BTreeMap<String, Observation>,
    }
    #[derive(Deserialize)]
    struct LegacySealed {
        content_hash: String,
        median_wall_ms: u64,
        trimmed_mean_ms: u64,
        confidence_ms: u64,
        median_abs_dev_ms: u64,
        witness_count: u32,
        witness_ids: Vec<String>,
    }
    if let Ok(leg) = serde_json::from_slice::<Legacy>(bytes) {
        let mut s = KairosState::empty();
        for (id, o) in leg.pulse {
            s.roster.insert(
                id.clone(),
                RosterEntry {
                    first_seen_ms: o.wall_ms,
                    last_seen_ms: o.wall_ms,
                    pulse_count: 1,
                    seals_included: 0,
                    seals_outlier: 0,
                },
            );
            s.pulse.insert(id, o);
        }
        for (id, open) in leg.open {
            s.open_stamps.insert(
                id,
                OpenStamp {
                    content_hash: open.content_hash,
                    nonce: "legacy".into(),
                    opened_hint_ms: 0,
                    observations: open.observations,
                },
            );
        }
        for (id, sealed) in leg.sealed {
            let mut stamp = SealedStamp {
                content_hash: sealed.content_hash,
                nonce: "legacy".into(),
                median_wall_ms: sealed.median_wall_ms,
                trimmed_mean_ms: sealed.trimmed_mean_ms,
                confidence_ms: sealed.confidence_ms,
                median_abs_dev_ms: sealed.median_abs_dev_ms,
                witness_count: sealed.witness_count,
                witness_ids: sealed.witness_ids,
                sealed_at_ms: sealed.median_wall_ms,
                error_ms: 0,
                earliest_ms: 0,
                latest_ms: 0,
                transcript_digest: String::new(),
            };
            ensure_seal_bounds(&mut stamp);
            s.sealed_stamps.insert(id, stamp);
        }
        return Ok(s);
    }
    serde_json::from_slice(bytes).map_err(|e| ContractError::Deser(e.to_string()))
}

fn apply_bytes(state: &mut KairosState, bytes: &[u8]) -> Result<(), ContractError> {
    if bytes.is_empty() {
        return Ok(());
    }
    if let Ok(env) = serde_json::from_slice::<UpdateEnvelope>(bytes) {
        match env {
            UpdateEnvelope::Pulse { pulse } => apply_pulse(state, pulse)?,
            UpdateEnvelope::OpenStamp { open_stamp } => apply_open_stamp(state, open_stamp)?,
            UpdateEnvelope::ObserveStamp { observe_stamp } => {
                apply_observe_stamp(state, observe_stamp)?
            }
        }
        return Ok(());
    }
    if let Ok(incoming) = serde_json::from_slice::<KairosState>(bytes) {
        for (_, o) in incoming.pulse {
            let _ = apply_pulse(state, o);
        }
        for (_, e) in incoming.roster {
            // Roster merges via pulses; ignore bare roster without pulse.
            let _ = e;
        }
        for (_id, req) in incoming.open_stamps {
            let _ = apply_open_stamp(
                state,
                OpenStampOp {
                    content_hash: req.content_hash.clone(),
                    nonce: req.nonce.clone(),
                },
            );
            let rid = format!("{}:{}", req.content_hash, req.nonce);
            for (_, o) in req.observations {
                let _ = apply_observe_stamp(
                    state,
                    ObserveStampOp {
                        request_id: rid.clone(),
                        observation: o,
                    },
                );
            }
        }
        for (id, stamp) in incoming.sealed_stamps {
            let mut stamp = stamp;
            ensure_seal_bounds(&mut stamp);
            state.sealed_stamps.entry(id).or_insert(stamp);
        }
        prune_sealed(state);
    }
    Ok(())
}

pub struct Contract;

#[contract]
impl ContractInterface for Contract {
    fn validate_state(
        _parameters: Parameters<'static>,
        state: State<'static>,
        _related: RelatedContracts<'static>,
    ) -> Result<ValidateResult, ContractError> {
        let parsed = parse_state(state.as_ref())?;
        for o in parsed.pulse.values() {
            verify_pulse(o)?;
        }
        for (id, req) in &parsed.open_stamps {
            for o in req.observations.values() {
                verify_stamp_observe(id, o)?;
            }
        }
        Ok(ValidateResult::Valid)
    }

    fn update_state(
        _parameters: Parameters<'static>,
        state: State<'static>,
        data: Vec<UpdateData<'static>>,
    ) -> Result<UpdateModification<'static>, ContractError> {
        let mut current = parse_state(state.as_ref())?;
        current.schema_version = 2;
        for ud in data {
            match ud {
                UpdateData::State(s) => apply_bytes(&mut current, s.as_ref())?,
                UpdateData::Delta(s) => apply_bytes(&mut current, s.as_ref())?,
                UpdateData::StateAndDelta { state: st, delta } => {
                    apply_bytes(&mut current, st.as_ref())?;
                    apply_bytes(&mut current, delta.as_ref())?;
                }
                _ => {}
            }
        }
        let bytes = serde_json::to_vec(&current)
            .map_err(|e| ContractError::Deser(e.to_string()))?;
        Ok(UpdateModification::valid(State::from(bytes)))
    }

    fn summarize_state(
        _parameters: Parameters<'static>,
        state: State<'static>,
    ) -> Result<StateSummary<'static>, ContractError> {
        let parsed = parse_state(state.as_ref())?;
        let eligible = parsed
            .roster
            .values()
            .filter(|e| e.last_seen_ms.saturating_sub(e.first_seen_ms) >= MIN_AGE_MS)
            .count();
        let summary = serde_json::json!({
            "schema_version": parsed.schema_version,
            "roster": parsed.roster.len(),
            "eligible": eligible,
            "pulse": parsed.pulse.len(),
            "open_stamps": parsed.open_stamps.len(),
            "sealed_stamps": parsed.sealed_stamps.len(),
        });
        let bytes =
            serde_json::to_vec(&summary).map_err(|e| ContractError::Deser(e.to_string()))?;
        Ok(StateSummary::from(bytes))
    }

    fn get_state_delta(
        _parameters: Parameters<'static>,
        state: State<'static>,
        _summary: StateSummary<'static>,
    ) -> Result<StateDelta<'static>, ContractError> {
        Ok(StateDelta::from(state.as_ref().to_vec()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};
    use std::time::Instant;

    fn sk_for(seed: u8) -> SigningKey {
        let mut bytes = [0u8; 32];
        bytes[0] = seed;
        bytes[31] = seed.wrapping_add(17);
        SigningKey::from_bytes(&bytes)
    }

    fn signed_pulse(sk: &SigningKey, wall: u64) -> Observation {
        signed_pulse_unc(sk, wall, 40)
    }

    fn signed_pulse_unc(sk: &SigningKey, wall: u64, uncertainty_ms: u64) -> Observation {
        let vk = sk.verifying_key().to_bytes();
        let node_id = bs58::encode(vk).into_string();
        let mut o = Observation {
            node_id,
            wall_ms: wall,
            monotonic_ms: 1000,
            uncertainty_ms,
            sig: String::new(),
        };
        o.sig = hex::encode(sk.sign(&pulse_signing_payload(&o)).to_bytes());
        o
    }

    fn signed_observe(sk: &SigningKey, request_id: &str, wall: u64, unc: u64) -> Observation {
        let vk = sk.verifying_key().to_bytes();
        let node_id = bs58::encode(vk).into_string();
        let mut o = Observation {
            node_id,
            wall_ms: wall,
            monotonic_ms: 1000,
            uncertainty_ms: unc,
            sig: String::new(),
        };
        o.sig = hex::encode(sk.sign(&stamp_observe_signing_payload(request_id, &o)).to_bytes());
        o
    }

    /// Age `n` witnesses past MIN_AGE_MS so they can observe stamps.
    fn age_n_witnesses(state: &mut KairosState, n: usize, t0: u64) -> Vec<SigningKey> {
        let mut keys = Vec::with_capacity(n);
        for i in 0..n {
            let sk = sk_for((i as u8).wrapping_add(1));
            apply_pulse(state, signed_pulse(&sk, t0)).unwrap();
            apply_pulse(state, signed_pulse(&sk, t0 + MIN_AGE_MS + 1)).unwrap();
            keys.push(sk);
        }
        keys
    }

    #[test]
    fn pulse_builds_roster_age_gates_stamp() {
        let mut state = KairosState::empty();
        let sk = SigningKey::from_bytes(&[3u8; 32]);
        let t0 = 1_000_000u64;
        apply_pulse(&mut state, signed_pulse(&sk, t0)).unwrap();
        assert_eq!(state.roster.len(), 1);

        apply_open_stamp(
            &mut state,
            OpenStampOp {
                content_hash: "doc".into(),
                nonce: "n1".into(),
            },
        )
        .unwrap();

        let young = {
            let mut o = signed_pulse(&sk, t0 + 60_000);
            let rid = "doc:n1";
            o.sig = hex::encode(sk.sign(&stamp_observe_signing_payload(rid, &o)).to_bytes());
            o
        };
        assert!(apply_observe_stamp(
            &mut state,
            ObserveStampOp {
                request_id: "doc:n1".into(),
                observation: young,
            },
        )
        .is_err());

        let aged_wall = t0 + MIN_AGE_MS + 1;
        apply_pulse(&mut state, signed_pulse(&sk, aged_wall)).unwrap();
        let aged = {
            let mut o = signed_pulse(&sk, aged_wall);
            o.sig =
                hex::encode(sk.sign(&stamp_observe_signing_payload("doc:n1", &o)).to_bytes());
            o
        };
        apply_observe_stamp(
            &mut state,
            ObserveStampOp {
                request_id: "doc:n1".into(),
                observation: aged,
            },
        )
        .unwrap();
        assert!(state.open_stamps["doc:n1"].observations.len() == 1);
    }

    #[test]
    fn pulse_never_creates_sealed_stamps() {
        let mut state = KairosState::empty();
        let t0 = 2_000_000u64;
        for i in 0..20u8 {
            let sk = sk_for(i.wrapping_add(10));
            apply_pulse(&mut state, signed_pulse(&sk, t0 + u64::from(i) * 100)).unwrap();
        }
        assert!(state.sealed_stamps.is_empty());
        assert_eq!(state.pulse.len(), 20);
        assert_eq!(state.open_stamps.len(), 0);
    }

    #[test]
    fn seal_emits_error_interval_and_transcript() {
        let mut state = KairosState::empty();
        let t0 = 3_000_000u64;
        let keys = age_n_witnesses(&mut state, MIN_STAMP_WITNESSES, t0);
        apply_open_stamp(
            &mut state,
            OpenStampOp {
                content_hash: "hash-a".into(),
                nonce: "n-seal".into(),
            },
        )
        .unwrap();
        let rid = "hash-a:n-seal";
        let center = t0 + MIN_AGE_MS + 5_000;
        for (i, sk) in keys.iter().enumerate() {
            let wall = center + (i as u64) * 3; // tight cluster
            apply_observe_stamp(
                &mut state,
                ObserveStampOp {
                    request_id: rid.into(),
                    observation: signed_observe(sk, rid, wall, 40),
                },
            )
            .unwrap();
        }
        assert!(
            state.open_stamps.get(rid).is_none(),
            "request should seal and leave open_stamps"
        );
        let stamp = state.sealed_stamps.get(rid).expect("sealed");
        assert_eq!(stamp.error_ms, stamp.confidence_ms);
        assert!(stamp.error_ms >= 1);
        for sk in &keys {
            let id = bs58::encode(sk.verifying_key().to_bytes()).into_string();
            let e = state.roster.get(&id).expect("roster");
            assert!(
                e.seals_included >= 1,
                "included witness should gain reputation"
            );
        }
        assert_eq!(
            stamp.earliest_ms,
            stamp.median_wall_ms.saturating_sub(stamp.error_ms)
        );
        assert_eq!(
            stamp.latest_ms,
            stamp.median_wall_ms.saturating_add(stamp.error_ms)
        );
        assert_eq!(stamp.transcript_digest.len(), 16);
        assert!(stamp.transcript_digest.chars().all(|c| c.is_ascii_hexdigit()));
        assert_eq!(stamp.witness_count as usize, MIN_STAMP_WITNESSES);
    }

    #[test]
    fn mad_filter_drops_far_outlier_before_seal() {
        let mut state = KairosState::empty();
        let t0 = 4_000_000u64;
        // Need enough inliers after MAD filter (>= MIN_STAMP_WITNESSES).
        let keys = age_n_witnesses(&mut state, MIN_STAMP_WITNESSES + 1, t0);
        apply_open_stamp(
            &mut state,
            OpenStampOp {
                content_hash: "hash-out".into(),
                nonce: "n2".into(),
            },
        )
        .unwrap();
        let rid = "hash-out:n2";
        let center = t0 + MIN_AGE_MS + 10_000;
        for (i, sk) in keys.iter().enumerate() {
            let wall = if i == 0 {
                center + 3_600_000 // hour-scale outlier
            } else {
                center + (i as u64)
            };
            apply_observe_stamp(
                &mut state,
                ObserveStampOp {
                    request_id: rid.into(),
                    observation: signed_observe(sk, rid, wall, 40),
                },
            )
            .unwrap();
        }
        let stamp = state.sealed_stamps.get(rid).expect("should still seal");
        assert!(
            stamp.median_wall_ms.abs_diff(center) < 100,
            "outlier must not pull median"
        );
        assert!(
            !stamp.witness_ids.iter().any(|id| {
                let outlier = keys[0].verifying_key().to_bytes();
                id == &bs58::encode(outlier).into_string()
            }),
            "outlier node should be filtered from witness_ids"
        );
    }

    #[test]
    fn legacy_sealed_fields_filled_on_parse() {
        let legacy = serde_json::json!({
            "pulse": {},
            "open": {},
            "sealed": {
                "old:n": {
                    "content_hash": "old",
                    "median_wall_ms": 1_000_000,
                    "trimmed_mean_ms": 1_000_000,
                    "confidence_ms": 50,
                    "median_abs_dev_ms": 2,
                    "witness_count": 5,
                    "witness_ids": ["a"]
                }
            }
        });
        let bytes = serde_json::to_vec(&legacy).unwrap();
        let state = parse_state(&bytes).unwrap();
        let stamp = state.sealed_stamps.get("old:n").unwrap();
        assert_eq!(stamp.error_ms, 50);
        assert_eq!(stamp.earliest_ms, 999_950);
        assert_eq!(stamp.latest_ms, 1_000_050);
    }

    #[test]
    fn reject_zero_and_huge_uncertainty() {
        let mut state = KairosState::empty();
        let sk = sk_for(99);
        let mut bad = signed_pulse(&sk, 5_000_000);
        bad.uncertainty_ms = 0;
        bad.sig = hex::encode(sk.sign(&pulse_signing_payload(&bad)).to_bytes());
        assert!(apply_pulse(&mut state, bad).is_err());

        let mut huge = signed_pulse(&sk, 5_000_001);
        huge.uncertainty_ms = MAX_UNCERTAINTY_MS + 1;
        huge.sig = hex::encode(sk.sign(&pulse_signing_payload(&huge)).to_bytes());
        assert!(apply_pulse(&mut state, huge).is_err());
    }

    #[test]
    fn transcript_digest_stable_for_same_witness_set() {
        let mut lines = vec![
            Observation {
                node_id: "b".into(),
                wall_ms: 2,
                monotonic_ms: 0,
                uncertainty_ms: 10,
                sig: "aa".into(),
            },
            Observation {
                node_id: "a".into(),
                wall_ms: 1,
                monotonic_ms: 0,
                uncertainty_ms: 10,
                sig: "bb".into(),
            },
        ];
        let refs: Vec<&Observation> = lines.iter().collect();
        let d1 = transcript_digest_fnv(&refs);
        lines.reverse();
        let refs2: Vec<&Observation> = lines.iter().collect();
        let d2 = transcript_digest_fnv(&refs2);
        assert_eq!(d1, d2, "digest must sort lines");
        lines[0].wall_ms = 99;
        let refs3: Vec<&Observation> = lines.iter().collect();
        let d3 = transcript_digest_fnv(&refs3);
        assert_ne!(d1, d3, "wall change must change digest");
    }

    /// Micro-bench: seal path for 32 aged witnesses (prints timing; asserts budget).
    #[test]
    fn bench_seal_32_witnesses() {
        let mut state = KairosState::empty();
        let t0 = 9_000_000u64;
        let n = 32usize;
        let keys = age_n_witnesses(&mut state, n, t0);
        apply_open_stamp(
            &mut state,
            OpenStampOp {
                content_hash: "bench".into(),
                nonce: "b1".into(),
            },
        )
        .unwrap();
        let rid = "bench:b1";
        let center = t0 + MIN_AGE_MS + 1_000;
        let start = Instant::now();
        for (i, sk) in keys.iter().enumerate() {
            apply_observe_stamp(
                &mut state,
                ObserveStampOp {
                    request_id: rid.into(),
                    observation: signed_observe(sk, rid, center + i as u64, 40),
                },
            )
            .unwrap();
        }
        let elapsed = start.elapsed();
        assert!(state.sealed_stamps.contains_key(rid));
        eprintln!(
            "bench_seal_32_witnesses: {:?} ({:.1} µs/observe)",
            elapsed,
            elapsed.as_secs_f64() * 1e6 / n as f64
        );
        // Generous host budget — catches accidental O(n^2) blowups.
        assert!(
            elapsed.as_millis() < 2_000,
            "seal path too slow: {elapsed:?}"
        );
    }

    #[test]
    fn ensure_seal_bounds_idempotent() {
        let mut stamp = SealedStamp {
            content_hash: "x".into(),
            nonce: "y".into(),
            median_wall_ms: 500,
            trimmed_mean_ms: 500,
            confidence_ms: 25,
            median_abs_dev_ms: 1,
            witness_count: 5,
            witness_ids: vec![],
            sealed_at_ms: 500,
            error_ms: 0,
            earliest_ms: 0,
            latest_ms: 0,
            transcript_digest: String::new(),
        };
        ensure_seal_bounds(&mut stamp);
        assert_eq!(stamp.error_ms, 25);
        assert_eq!(stamp.earliest_ms, 475);
        assert_eq!(stamp.latest_ms, 525);
        ensure_seal_bounds(&mut stamp);
        assert_eq!(stamp.earliest_ms, 475);
    }
}

