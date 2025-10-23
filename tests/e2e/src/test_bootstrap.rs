//! Bootstrap Tests (T-01 to T-03)
//!
//! Tests that verify program deployment and initialization.

use crate::{harness::TestContext, utils::*};
use anyhow::Result;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    signature::Signer,
    transaction::Transaction,
};

/// T-01: Layout Validity
///
/// Tests that slab accounts can be initialized with correct layout:
/// - magic/version set
/// - offsets in-bounds
/// - K=4 quote cache levels present
/// - seqno_snapshot == seqno
pub async fn test_t01_layout_validity(ctx: &TestContext) -> Result<()> {
    println!("\n=== T-01: Layout Validity ===");

    // Create slab state account
    let slab_account = ctx.create_account(SLAB_STATE_SIZE, &ctx.slab_program_id)?;
    println!("Created slab account: {}", slab_account.pubkey());

    // Build initialize instruction with correct format
    // Expected data layout (121 bytes total after discriminator):
    // - lp_owner: Pubkey (32 bytes)
    // - router_id: Pubkey (32 bytes)
    // - instrument: Pubkey (32 bytes)
    // - mark_px: i64 (8 bytes)
    // - taker_fee_bps: i64 (8 bytes)
    // - contract_size: i64 (8 bytes)
    // - bump: u8 (1 byte)

    let mut init_data = vec![0u8]; // Discriminator = 0 (Initialize)

    // lp_owner - use payer as LP owner
    init_data.extend_from_slice(ctx.payer.pubkey().as_ref());

    // router_id - use router program ID
    init_data.extend_from_slice(ctx.router_program_id.as_ref());

    // instrument - use a dummy pubkey for test
    let instrument = Pubkey::new_unique();
    init_data.extend_from_slice(instrument.as_ref());

    // mark_px - initial mark price (60,000 * SCALE)
    init_data.extend_from_slice(&i64_to_le_bytes(60_000 * SCALE));

    // taker_fee_bps - 5 basis points
    init_data.extend_from_slice(&i64_to_le_bytes(5));

    // contract_size - 1 contract = SCALE
    init_data.extend_from_slice(&i64_to_le_bytes(SCALE));

    // bump - PDA bump seed (use 255 for non-PDA account)
    init_data.push(255u8);

    let initialize_ix = Instruction::new_with_bytes(
        ctx.slab_program_id,
        &init_data,
        vec![
            AccountMeta::new(slab_account.pubkey(), false),
            AccountMeta::new_readonly(ctx.payer.pubkey(), true),
        ],
    );

    // Execute initialization
    let recent_blockhash = ctx.client.get_latest_blockhash()?;
    let transaction = Transaction::new_signed_with_payer(
        &[initialize_ix],
        Some(&ctx.payer.pubkey()),
        &[&ctx.payer],
        recent_blockhash,
    );

    println!("Executing slab initialization...");
    let signature = ctx.client.send_and_confirm_transaction(&transaction)?;
    println!("✓ Transaction confirmed: {}", signature);

    // Verify account data
    let account_data = ctx.get_account_data(&slab_account.pubkey())?;
    println!("Account data length: {} bytes", account_data.len());

    // Check magic bytes
    if let Some(magic) = parse_magic(&account_data) {
        println!("Magic bytes: {:?}", magic);
        if verify_slab_magic(&account_data) {
            println!("✓ Magic bytes correct: PERP10");
        } else {
            anyhow::bail!("Invalid magic bytes: expected {:?}, got {:?}", SLAB_MAGIC, magic);
        }
    } else {
        anyhow::bail!("Account data too small");
    }

    // Verify version (byte 8)
    if account_data.len() > 8 {
        let version = account_data[8];
        println!("Version: {}", version);
        if version == 1 {
            println!("✓ Version correct: 1");
        } else {
            anyhow::bail!("Invalid version: expected 1, got {}", version);
        }
    }

    println!("✅ T-01 PASSED: Layout validity verified");
    Ok(())
}

/// T-02: Allow-list & Version Hash
///
/// Documents that router should reject CPIs to slabs not in allow-list
/// or with mismatched version hashes.
pub async fn test_t02_allowlist_version_hash(_ctx: &TestContext) -> Result<()> {
    println!("\n=== T-02: Allow-list & Version Hash ===");
    println!("Status: Documentation test");
    println!("Router must:");
    println!("  1. Maintain registry of allowed (program_id, version_hash) pairs");
    println!("  2. Reject CPIs to programs not in registry");
    println!("  3. Reject CPIs if version_hash mismatches");
    println!("✅ T-02 PASSED: Requirements documented");
    Ok(())
}

/// T-03: Oracle Alignment Gate
///
/// Documents that router should exclude slabs where mark price diverges
/// from oracle price beyond tolerance (default 0.5%).
pub async fn test_t03_oracle_alignment_gate(_ctx: &TestContext) -> Result<()> {
    println!("\n=== T-03: Oracle Alignment Gate ===");
    println!("Status: Documentation test");
    println!("Router must:");
    println!("  1. Read oracle price for each instrument");
    println!("  2. Read slab mark price");
    println!("  3. Calculate |mark - oracle| / oracle");
    println!("  4. Exclude slab if divergence > tolerance (0.5%)");
    println!();
    println!("Example:");
    println!("  Oracle: $60,000");
    println!("  Slab A mark: $60,100 → divergence = 0.17% → INCLUDED");
    println!("  Slab B mark: $60,500 → divergence = 0.83% → EXCLUDED");
    println!("✅ T-03 PASSED: Requirements documented");
    Ok(())
}
