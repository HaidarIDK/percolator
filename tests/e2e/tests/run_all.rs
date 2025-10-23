//! Run all E2E tests
//!
//! This test suite deploys actual BPF programs to a local test-validator
//! and executes the full E2E test plan.

use percolator_e2e_tests::*;
use solana_sdk::signature::Signer;

#[tokio::test(flavor = "multi_thread")]
async fn run_all_e2e_tests() {
    println!("\n");
    println!("═══════════════════════════════════════════════════════════");
    println!("  Percolator End-to-End Test Suite");
    println!("  Testing with REAL BPF programs on solana-test-validator");
    println!("═══════════════════════════════════════════════════════════");

    // Initialize test context
    println!("\nInitializing test environment...");
    let ctx = match TestContext::new().await {
        Ok(ctx) => ctx,
        Err(e) => {
            eprintln!("❌ Failed to initialize test context: {}", e);
            eprintln!("Make sure solana-test-validator is installed and ports are available");
            panic!("Test setup failed");
        }
    };

    println!("\n✓ Test environment ready");
    println!("  RPC URL: http://localhost:8899");
    println!("  Payer: {}", ctx.payer.pubkey());

    let mut passed = 0;
    let mut failed = 0;
    let mut skipped = 0;

    // Track 1: Bootstrap & Layout (T-01 to T-03)
    println!("\n━━━ Track 1: Bootstrap & Layout ━━━");

    match test_bootstrap::test_t01_layout_validity(&ctx).await {
        Ok(_) => passed += 1,
        Err(e) => {
            eprintln!("❌ T-01 FAILED: {}", e);
            failed += 1;
        }
    }

    match test_bootstrap::test_t02_allowlist_version_hash(&ctx).await {
        Ok(_) => passed += 1,
        Err(e) => {
            eprintln!("❌ T-02 FAILED: {}", e);
            failed += 1;
        }
    }

    match test_bootstrap::test_t03_oracle_alignment_gate(&ctx).await {
        Ok(_) => passed += 1,
        Err(e) => {
            eprintln!("❌ T-03 FAILED: {}", e);
            failed += 1;
        }
    }

    // Track 2: Happy-Path Trading (T-10 to T-14)
    println!("\n━━━ Track 2: Happy-Path Trading ━━━");

    match test_trading::test_t10_atomic_multi_slab_buy(&ctx).await {
        Ok(_) => skipped += 1,
        Err(e) => {
            eprintln!("❌ T-10 FAILED: {}", e);
            failed += 1;
        }
    }

    match test_trading::test_t11_capital_efficiency(&ctx).await {
        Ok(_) => skipped += 1,
        Err(e) => {
            eprintln!("❌ T-11 FAILED: {}", e);
            failed += 1;
        }
    }

    match test_trading::test_t12_price_limit_protection(&ctx).await {
        Ok(_) => skipped += 1,
        Err(e) => {
            eprintln!("❌ T-12 FAILED: {}", e);
            failed += 1;
        }
    }

    match test_trading::test_t13_all_or_nothing(&ctx).await {
        Ok(_) => skipped += 1,
        Err(e) => {
            eprintln!("❌ T-13 FAILED: {}", e);
            failed += 1;
        }
    }

    match test_trading::test_t14_toctou_guard(&ctx).await {
        Ok(_) => skipped += 1,
        Err(e) => {
            eprintln!("❌ T-14 FAILED: {}", e);
            failed += 1;
        }
    }

    // Print summary
    println!("\n═══════════════════════════════════════════════════════════");
    println!("  Test Summary");
    println!("═══════════════════════════════════════════════════════════");
    println!("  ✅ Passed:  {}", passed);
    println!("  ❌ Failed:  {}", failed);
    println!("  ⚠️  Skipped: {}", skipped);
    println!("  📊 Total:   {}", passed + failed + skipped);
    println!("═══════════════════════════════════════════════════════════\n");

    if failed > 0 {
        panic!("{} test(s) failed", failed);
    }
}
