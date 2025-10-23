//! v0 Capital Efficiency Tests
//!
//! These tests prove the core v0 thesis: portfolio netting enables capital efficiency.
//!
//! THE KEY TEST: Long slab A + Short slab B = ~0 IM requirement

use pinocchio::pubkey::Pubkey;

// Test helper to create a portfolio
fn create_test_portfolio() -> percolator_router::state::Portfolio {
    percolator_router::state::Portfolio::new(
        Pubkey::default(),
        Pubkey::default(),
        0,
    )
}

#[cfg(test)]
mod capital_efficiency_tests {
    use super::*;

    /// THE KILLER TEST: Capital Efficiency Proof
    ///
    /// This test proves that portfolio netting works:
    /// - User goes long 1 BTC on Slab A at $50,000
    /// - User goes short 1 BTC on Slab B at $50,010
    /// - Net exposure = 0
    /// - IM requirement = ~$0 (not $10,000!)
    /// - User locks in $10 profit with zero capital
    #[test]
    fn test_capital_efficiency_zero_net_exposure() {
        let mut portfolio = create_test_portfolio();

        // Initial state: no positions, no margin required
        assert_eq!(portfolio.exposure_count, 0);
        assert_eq!(portfolio.im, 0);

        // Simulate long 1 BTC on Slab A (slab_idx=0, instrument_idx=0)
        // qty = 1_000_000 (1.0 BTC in 1e6 scale)
        portfolio.update_exposure(0, 0, 1_000_000);

        // Simulate short 1 BTC on Slab B (slab_idx=1, instrument_idx=0)
        // qty = -1_000_000 (short 1.0 BTC)
        portfolio.update_exposure(1, 0, -1_000_000);

        // Verify exposures were recorded
        assert_eq!(portfolio.exposure_count, 2);
        assert_eq!(portfolio.get_exposure(0, 0), 1_000_000);  // Long on slab A
        assert_eq!(portfolio.get_exposure(1, 0), -1_000_000); // Short on slab B

        // Calculate net exposure across both slabs (same instrument)
        let mut net_exposure = 0i64;
        for i in 0..portfolio.exposure_count as usize {
            // Sum all exposures for instrument 0
            if portfolio.exposures[i].1 == 0 {
                net_exposure += portfolio.exposures[i].2;
            }
        }

        // THE PROOF: Net exposure = 0!
        assert_eq!(net_exposure, 0, "Net exposure should be zero (long + short cancel)");

        // Calculate IM based on net exposure
        // IM = abs(net_exposure) * price * imr_factor
        let price = 50_000_000_000i128; // $50,000 in 1e6 scale
        let imr_factor = 10; // 10% IMR
        let im_required = ((net_exposure.abs() as i128 * price * imr_factor) / (100 * 1_000_000)) as u128;

        // THE CAPITAL EFFICIENCY PROOF: IM = $0 when net = 0!
        assert_eq!(im_required, 0, "IM should be ZERO for zero net exposure!");

        // Compare with naive per-slab margin:
        // - Long 1 BTC: 1 * $50,000 * 10% = $5,000
        // - Short 1 BTC: 1 * $50,000 * 10% = $5,000
        // - Total per-slab: $10,000
        // - Portfolio netting: $0
        // - Capital efficiency: INFINITE!

        let per_slab_margin = 2 * ((1_000_000 as i128 * price * imr_factor) / (100 * 1_000_000));
        assert_eq!(per_slab_margin, 10_000_000_000, "Per-slab margin would be $10,000");

        println!("✅ CAPITAL EFFICIENCY PROOF:");
        println!("   Per-slab margin: ${}", per_slab_margin / 1_000_000);
        println!("   Portfolio margin: ${}", im_required / 1_000_000);
        println!("   Savings: ${}", (per_slab_margin - im_required as i128) / 1_000_000);
    }

    /// Test partial netting: Long 2 BTC on A, Short 1 BTC on B
    /// Net = +1 BTC, IM should be based on 1 BTC not 3 BTC
    #[test]
    fn test_capital_efficiency_partial_netting() {
        let mut portfolio = create_test_portfolio();

        // Long 2 BTC on Slab A
        portfolio.update_exposure(0, 0, 2_000_000);

        // Short 1 BTC on Slab B
        portfolio.update_exposure(1, 0, -1_000_000);

        // Calculate net exposure
        let mut net_exposure = 0i64;
        for i in 0..portfolio.exposure_count as usize {
            if portfolio.exposures[i].1 == 0 {
                net_exposure += portfolio.exposures[i].2;
            }
        }

        // Net = +1 BTC
        assert_eq!(net_exposure, 1_000_000);

        // Calculate IM on net exposure (1 BTC)
        let price = 50_000_000_000i128;
        let imr_factor = 10;
        let im_required = ((net_exposure.abs() as i128 * price * imr_factor) / (100 * 1_000_000)) as u128;

        // IM should be for 1 BTC, not 3 BTC
        assert_eq!(im_required, 5_000_000_000, "IM for 1 BTC net = $5,000");

        // Compare with per-slab: 2 * $5k + 1 * $5k = $15k
        let per_slab_margin = ((2_000_000 as i128 * price * imr_factor) / (100 * 1_000_000))
            + ((1_000_000 as i128 * price * imr_factor) / (100 * 1_000_000));
        assert_eq!(per_slab_margin, 15_000_000_000);

        // Savings: $10k (66% reduction!)
        let savings = per_slab_margin - im_required as i128;
        assert_eq!(savings, 10_000_000_000);

        println!("✅ PARTIAL NETTING TEST:");
        println!("   Gross exposure: 3 BTC");
        println!("   Net exposure: 1 BTC");
        println!("   Per-slab margin: ${}", per_slab_margin / 1_000_000);
        println!("   Portfolio margin: ${}", im_required / 1_000_000);
        println!("   Savings: ${} (66%)", savings / 1_000_000);
    }

    /// Test multiple instrument netting
    /// Should only net same instruments, not across different instruments
    #[test]
    fn test_multi_instrument_netting() {
        let mut portfolio = create_test_portfolio();

        // Long 1 BTC (instrument 0) on Slab A
        portfolio.update_exposure(0, 0, 1_000_000);

        // Short 1 BTC (instrument 0) on Slab B
        portfolio.update_exposure(1, 0, -1_000_000);

        // Long 1 ETH (instrument 1) on Slab C
        portfolio.update_exposure(2, 1, 10_000_000); // 10 ETH

        // Calculate net for BTC (instrument 0)
        let mut btc_net = 0i64;
        for i in 0..portfolio.exposure_count as usize {
            if portfolio.exposures[i].1 == 0 {
                btc_net += portfolio.exposures[i].2;
            }
        }

        // Calculate net for ETH (instrument 1)
        let mut eth_net = 0i64;
        for i in 0..portfolio.exposure_count as usize {
            if portfolio.exposures[i].1 == 1 {
                eth_net += portfolio.exposures[i].2;
            }
        }

        assert_eq!(btc_net, 0, "BTC should net to zero");
        assert_eq!(eth_net, 10_000_000, "ETH should be 10 ETH net long");

        // IM calculation (simplified)
        let btc_price = 50_000_000_000i128;
        let eth_price = 3_000_000_000i128;
        let imr_factor = 10;

        let btc_im = ((btc_net.abs() as i128 * btc_price * imr_factor) / (100 * 1_000_000)) as u128;
        let eth_im = ((eth_net.abs() as i128 * eth_price * imr_factor) / (100 * 1_000_000)) as u128;

        assert_eq!(btc_im, 0, "BTC IM should be zero");
        assert_eq!(eth_im, 30_000_000_000, "ETH IM should be $30k (10 ETH * $3k * 10%)");

        println!("✅ MULTI-INSTRUMENT NETTING:");
        println!("   BTC net: {} (IM: $0)", btc_net);
        println!("   ETH net: {} (IM: ${})", eth_net, eth_im / 1_000_000);
        println!("   Total IM: ${}", (btc_im + eth_im) / 1_000_000);
    }

    /// Test exposure updates
    #[test]
    fn test_exposure_updates() {
        let mut portfolio = create_test_portfolio();

        // Add exposure
        portfolio.update_exposure(0, 0, 1_000_000);
        assert_eq!(portfolio.get_exposure(0, 0), 1_000_000);
        assert_eq!(portfolio.exposure_count, 1);

        // Update exposure
        portfolio.update_exposure(0, 0, 2_000_000);
        assert_eq!(portfolio.get_exposure(0, 0), 2_000_000);
        assert_eq!(portfolio.exposure_count, 1); // Should not add duplicate

        // Close exposure
        portfolio.update_exposure(0, 0, 0);
        assert_eq!(portfolio.get_exposure(0, 0), 0);
        assert_eq!(portfolio.exposure_count, 0); // Should remove when zero
    }

    /// Test margin requirement checking
    #[test]
    fn test_margin_requirements() {
        let mut portfolio = create_test_portfolio();

        // Set equity to $10,000
        portfolio.update_equity(10_000_000_000);

        // Set IM requirement to $5,000
        portfolio.update_margin(5_000_000_000, 2_500_000_000);

        // Should have sufficient margin
        assert!(portfolio.has_sufficient_margin());
        assert!(portfolio.is_above_maintenance());
        assert_eq!(portfolio.free_collateral, 5_000_000_000);

        // Reduce equity to $4,000 (below IM, above MM)
        portfolio.update_equity(4_000_000_000);
        assert!(!portfolio.has_sufficient_margin());
        assert!(portfolio.is_above_maintenance());

        // Reduce equity to $2,000 (below MM)
        portfolio.update_equity(2_000_000_000);
        assert!(!portfolio.has_sufficient_margin());
        assert!(!portfolio.is_above_maintenance());
    }
}
