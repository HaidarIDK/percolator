//! Test utilities for E2E tests

use solana_sdk::signature::Keypair;

/// Test constants matching the program expectations
pub const SCALE: i64 = 1_000_000;
pub const SLAB_STATE_SIZE: usize = 3408; // SlabHeader(200) + QuoteCache(136) + BookArea(3072)
pub const K: usize = 4; // Quote cache levels per side

/// Serialize i64 to little-endian bytes
pub fn i64_to_le_bytes(value: i64) -> Vec<u8> {
    value.to_le_bytes().to_vec()
}

/// Serialize u64 to little-endian bytes
pub fn u64_to_le_bytes(value: u64) -> Vec<u8> {
    value.to_le_bytes().to_vec()
}

/// Generate a deterministic keypair from seed
#[allow(dead_code)]
pub fn keypair_from_seed(seed: &str) -> Keypair {
    let seed_bytes = seed.as_bytes();
    let mut full_seed = [0u8; 32];
    let len = seed_bytes.len().min(32);
    full_seed[..len].copy_from_slice(&seed_bytes[..len]);
    Keypair::try_from(&full_seed[..]).unwrap_or_else(|_| Keypair::new())
}

/// Parse magic bytes from account data
pub fn parse_magic(data: &[u8]) -> Option<&[u8]> {
    if data.len() >= 8 {
        Some(&data[0..8])
    } else {
        None
    }
}

/// Expected magic for slab accounts
pub const SLAB_MAGIC: &[u8] = b"PERP10\0\0";

/// Verify slab magic bytes
pub fn verify_slab_magic(data: &[u8]) -> bool {
    if let Some(magic) = parse_magic(data) {
        magic == SLAB_MAGIC
    } else {
        false
    }
}
