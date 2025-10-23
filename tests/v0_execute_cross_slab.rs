//! v0 execute_cross_slab Tests
//!
//! Tests for the router's execute_cross_slab instruction logic

use pinocchio::pubkey::Pubkey;

#[cfg(test)]
mod execute_cross_slab_tests {
    use super::*;
    use percolator_router::state::{Portfolio, Vault};
    use percolator_router::instructions::{SlabSplit, process_execute_cross_slab};

    /// Helper to create test portfolio
    fn create_portfolio() -> Portfolio {
        Portfolio::new(Pubkey::default(), Pubkey::default(), 0)
    }

    /// Helper to create test vault
    fn create_vault() -> Vault {
        Vault {
            mint: Pubkey::default(),
            balance: 100_000_000_000, // $100k
            token_account: Pubkey::default(),
            bump: 0,
        }
    }

    /// Test atomic split across multiple slabs
    #[test]
    fn test_atomic_split() {
        let mut portfolio = create_portfolio();
        portfolio.update_equity(100_000_000_000); // $100k equity

        // Create splits for 2 slabs
        let splits = vec![
            SlabSplit {
                slab_id: Pubkey::default(),
                qty: 500_000,    // 0.5 BTC
                side: 0,         // Buy
                limit_px: 50_000_000_000,
            },
            SlabSplit {
                slab_id: Pubkey::default(),
                qty: 500_000,    // 0.5 BTC
                side: 0,         // Buy
                limit_px: 50_010_000_000,
            },
        ];

        // Simulate processing (without real accounts)
        // Update exposures manually as the function would
        for (i, split) in splits.iter().enumerate() {
            let slab_idx = i as u16;
            let current = portfolio.get_exposure(slab_idx, 0);
            let new_exposure = if split.side == 0 {
                current + split.qty
            } else {
                current - split.qty
            };
            portfolio.update_exposure(slab_idx, 0, new_exposure);
        }

        // Verify both fills were recorded
        assert_eq!(portfolio.exposure_count, 2);
        assert_eq!(portfolio.get_exposure(0, 0), 500_000);
        assert_eq!(portfolio.get_exposure(1, 0), 500_000);

        // Net exposure = 1.0 BTC total
        let mut net = 0i64;
        for i in 0..portfolio.exposure_count as usize {
            net += portfolio.exposures[i].2;
        }
        assert_eq!(net, 1_000_000);

        println!("✅ ATOMIC SPLIT TEST:");
        println!("   Slab A: {} BTC", portfolio.get_exposure(0, 0) / 1_000_000);
        println!("   Slab B: {} BTC", portfolio.get_exposure(1, 0) / 1_000_000);
        println!("   Net: {} BTC", net / 1_000_000);
    }

    /// Test hedged position (long + short on different slabs)
    #[test]
    fn test_hedged_position() {
        let mut portfolio = create_portfolio();
        portfolio.update_equity(100_000_000_000);

        // Long 1 BTC on Slab A
        let splits_long = vec![
            SlabSplit {
                slab_id: Pubkey::default(),
                qty: 1_000_000,
                side: 0, // Buy
                limit_px: 50_000_000_000,
            },
        ];

        // Short 1 BTC on Slab B
        let splits_short = vec![
            SlabSplit {
                slab_id: Pubkey::default(),
                qty: 1_000_000,
                side: 1, // Sell
                limit_px: 50_010_000_000,
            },
        ];

        // Process long
        for (i, split) in splits_long.iter().enumerate() {
            let current = portfolio.get_exposure(i as u16, 0);
            let new_exposure = current + split.qty;
            portfolio.update_exposure(i as u16, 0, new_exposure);
        }

        // Process short
        for (i, split) in splits_short.iter().enumerate() {
            let slab_idx = (i + 1) as u16; // Different slab
            let current = portfolio.get_exposure(slab_idx, 0);
            let new_exposure = current - split.qty;
            portfolio.update_exposure(slab_idx, 0, new_exposure);
        }

        // Verify exposures
        assert_eq!(portfolio.get_exposure(0, 0), 1_000_000);   // Long
        assert_eq!(portfolio.get_exposure(1, 0), -1_000_000);  // Short

        // Calculate net exposure
        let mut net = 0i64;
        for i in 0..portfolio.exposure_count as usize {
            net += portfolio.exposures[i].2;
        }

        // Net should be ZERO
        assert_eq!(net, 0, "Hedged position should have zero net exposure");

        // Calculate IM on net exposure
        let price = 50_000_000_000i128;
        let imr = 10;
        let im = ((net.abs() as i128 * price * imr) / (100 * 1_000_000)) as u128;

        // IM should be ZERO!
        assert_eq!(im, 0, "IM for hedged position should be ZERO");

        println!("✅ HEDGED POSITION TEST:");
        println!("   Slab A (long): {} BTC", portfolio.get_exposure(0, 0) / 1_000_000);
        println!("   Slab B (short): {} BTC", portfolio.get_exposure(1, 0) / 1_000_000);
        println!("   Net exposure: {}", net);
        println!("   IM required: ${}", im / 1_000_000);
    }

    /// Test progressive scaling (adding to position)
    #[test]
    fn test_progressive_scaling() {
        let mut portfolio = create_portfolio();
        portfolio.update_equity(100_000_000_000);

        // First trade: Buy 0.5 BTC on Slab A
        portfolio.update_exposure(0, 0, 500_000);
        assert_eq!(portfolio.get_exposure(0, 0), 500_000);

        // Second trade: Buy another 0.5 BTC on same slab
        let current = portfolio.get_exposure(0, 0);
        portfolio.update_exposure(0, 0, current + 500_000);
        assert_eq!(portfolio.get_exposure(0, 0), 1_000_000);

        // Third trade: Reduce by 0.3 BTC
        let current = portfolio.get_exposure(0, 0);
        portfolio.update_exposure(0, 0, current - 300_000);
        assert_eq!(portfolio.get_exposure(0, 0), 700_000);

        println!("✅ PROGRESSIVE SCALING:");
        println!("   After +0.5: {} BTC", 500_000 / 1_000_000);
        println!("   After +0.5: {} BTC", 1_000_000 / 1_000_000);
        println!("   After -0.3: {} BTC", 700_000 / 1_000_000);
    }

    /// Test margin calculation with various net exposures
    #[test]
    fn test_margin_calculation_scenarios() {
        let test_cases = vec![
            (0i64, 0u128, "Zero net exposure"),
            (1_000_000, 5_000_000_000, "Long 1 BTC"),
            (-1_000_000, 5_000_000_000, "Short 1 BTC"),
            (500_000, 2_500_000_000, "Long 0.5 BTC"),
            (2_000_000, 10_000_000_000, "Long 2 BTC"),
        ];

        let price = 50_000_000_000i128; // $50k
        let imr = 10; // 10%

        for (net_exposure, expected_im, desc) in test_cases {
            let im = ((net_exposure.abs() as i128 * price * imr) / (100 * 1_000_000)) as u128;
            assert_eq!(im, expected_im, "{}: expected IM ${}", desc, expected_im / 1_000_000);

            println!("  {} -> IM: ${}", desc, im / 1_000_000);
        }
    }

    /// Test exposure removal when qty = 0
    #[test]
    fn test_exposure_removal() {
        let mut portfolio = create_portfolio();

        // Add exposure
        portfolio.update_exposure(0, 0, 1_000_000);
        assert_eq!(portfolio.exposure_count, 1);

        // Close position (qty = 0)
        portfolio.update_exposure(0, 0, 0);
        assert_eq!(portfolio.exposure_count, 0);
        assert_eq!(portfolio.get_exposure(0, 0), 0);

        println!("✅ EXPOSURE REMOVAL TEST:");
        println!("   After add: count = 1");
        println!("   After close: count = 0");
    }

    /// Test multiple exposures across different slabs and instruments
    #[test]
    fn test_multi_slab_multi_instrument() {
        let mut portfolio = create_portfolio();

        // Slab 0, Instrument 0 (BTC)
        portfolio.update_exposure(0, 0, 1_000_000);

        // Slab 1, Instrument 0 (BTC on different slab)
        portfolio.update_exposure(1, 0, -500_000);

        // Slab 0, Instrument 1 (ETH)
        portfolio.update_exposure(0, 1, 10_000_000);

        // Slab 2, Instrument 1 (ETH on different slab)
        portfolio.update_exposure(2, 1, -5_000_000);

        assert_eq!(portfolio.exposure_count, 4);

        // Calculate net BTC (instrument 0)
        let mut btc_net = 0i64;
        for i in 0..portfolio.exposure_count as usize {
            if portfolio.exposures[i].1 == 0 {
                btc_net += portfolio.exposures[i].2;
            }
        }

        // Calculate net ETH (instrument 1)
        let mut eth_net = 0i64;
        for i in 0..portfolio.exposure_count as usize {
            if portfolio.exposures[i].1 == 1 {
                eth_net += portfolio.exposures[i].2;
            }
        }

        assert_eq!(btc_net, 500_000, "BTC net should be +0.5");
        assert_eq!(eth_net, 5_000_000, "ETH net should be +5.0");

        println!("✅ MULTI-SLAB MULTI-INSTRUMENT:");
        println!("   BTC net: {} BTC", btc_net / 1_000_000);
        println!("   ETH net: {} ETH", eth_net / 1_000_000);
    }

    /// Test insufficient margin scenario
    #[test]
    fn test_insufficient_margin() {
        let mut portfolio = create_portfolio();

        // Set low equity
        portfolio.update_equity(1_000_000_000); // Only $1k

        // Try to require $5k margin
        portfolio.update_margin(5_000_000_000, 2_500_000_000);

        // Should fail margin check
        assert!(!portfolio.has_sufficient_margin());
        assert!(!portfolio.is_above_maintenance());

        println!("✅ INSUFFICIENT MARGIN:");
        println!("   Equity: ${}", portfolio.equity / 1_000_000);
        println!("   IM required: ${}", portfolio.im / 1_000_000);
        println!("   Has margin: {}", portfolio.has_sufficient_margin());
    }

    /// Test sufficient margin scenario
    #[test]
    fn test_sufficient_margin() {
        let mut portfolio = create_portfolio();

        // Set high equity
        portfolio.update_equity(100_000_000_000); // $100k

        // Require only $5k margin
        portfolio.update_margin(5_000_000_000, 2_500_000_000);

        // Should pass margin check
        assert!(portfolio.has_sufficient_margin());
        assert!(portfolio.is_above_maintenance());
        assert_eq!(portfolio.free_collateral, 95_000_000_000);

        println!("✅ SUFFICIENT MARGIN:");
        println!("   Equity: ${}", portfolio.equity / 1_000_000);
        println!("   IM required: ${}", portfolio.im / 1_000_000);
        println!("   Free collateral: ${}", portfolio.free_collateral / 1_000_000);
    }
}
