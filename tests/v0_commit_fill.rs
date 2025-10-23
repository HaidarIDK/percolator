//! v0 commit_fill Tests
//!
//! Tests for the slab's commit_fill instruction logic

use pinocchio::pubkey::Pubkey;

#[cfg(test)]
mod commit_fill_tests {
    use super::*;

    /// Test that SlabHeader increments seqno correctly
    #[test]
    fn test_seqno_increment() {
        use percolator_slab::state::SlabHeader;

        let mut header = SlabHeader::new(
            Pubkey::default(),
            Pubkey::default(),
            Pubkey::default(),
            Pubkey::default(),
            50_000_000_000, // mark_px
            20,             // taker_fee_bps (0.2%)
            255,            // bump
        );

        assert_eq!(header.seqno, 0);

        header.increment_seqno();
        assert_eq!(header.seqno, 1);

        header.increment_seqno();
        assert_eq!(header.seqno, 2);
    }

    /// Test FillReceipt writing
    #[test]
    fn test_fill_receipt() {
        use percolator_slab::state::FillReceipt;

        let mut receipt = FillReceipt::new();
        assert!(!receipt.is_used());

        // Write fill data
        receipt.write(
            123,              // seqno
            1_000_000,        // filled 1.0 BTC
            50_000_000_000,   // vwap $50,000
            50_000_000_000,   // notional $50,000
            10_000_000,       // fee $10
        );

        assert!(receipt.is_used());
        assert_eq!(receipt.seqno_committed, 123);
        assert_eq!(receipt.filled_qty, 1_000_000);
        assert_eq!(receipt.vwap_px, 50_000_000_000);
        assert_eq!(receipt.notional, 50_000_000_000);
        assert_eq!(receipt.fee, 10_000_000);
    }

    /// Test QuoteCache updates
    #[test]
    fn test_quote_cache_update() {
        use percolator_slab::state::{QuoteCache, QuoteLevel};

        let mut cache = QuoteCache::new();

        let bids = [
            QuoteLevel { px: 50_000_000_000, avail_qty: 1_000_000 },
            QuoteLevel { px: 49_999_000_000, avail_qty: 2_000_000 },
            QuoteLevel { px: 49_998_000_000, avail_qty: 1_500_000 },
            QuoteLevel { px: 49_997_000_000, avail_qty: 500_000 },
        ];

        let asks = [
            QuoteLevel { px: 50_001_000_000, avail_qty: 1_500_000 },
            QuoteLevel { px: 50_002_000_000, avail_qty: 2_500_000 },
            QuoteLevel { px: 50_003_000_000, avail_qty: 1_000_000 },
            QuoteLevel { px: 50_004_000_000, avail_qty: 3_000_000 },
        ];

        cache.update(42, &bids, &asks);

        // Verify seqno
        assert_eq!(cache.seqno_snapshot, 42);

        // Verify best bids (descending price)
        assert_eq!(cache.best_bids[0].px, 50_000_000_000);
        assert_eq!(cache.best_bids[0].avail_qty, 1_000_000);
        assert_eq!(cache.best_bids[1].px, 49_999_000_000);
        assert_eq!(cache.best_bids[1].avail_qty, 2_000_000);

        // Verify best asks (ascending price)
        assert_eq!(cache.best_asks[0].px, 50_001_000_000);
        assert_eq!(cache.best_asks[0].avail_qty, 1_500_000);
        assert_eq!(cache.best_asks[1].px, 50_002_000_000);
        assert_eq!(cache.best_asks[1].avail_qty, 2_500_000);

        // Verify totals
        assert_eq!(cache.total_bid_qty(), 5_000_000);
        assert_eq!(cache.total_ask_qty(), 8_000_000);
    }

    /// Test notional and fee calculations
    #[test]
    fn test_notional_and_fee_calc() {
        // Simulate fill: 1 BTC at $50,000
        let filled_qty = 1_000_000i64;       // 1.0 BTC
        let vwap_px = 50_000_000_000i64;     // $50,000
        let taker_fee_bps = 20i64;           // 0.2% (20 bps)

        // Calculate notional: qty * price / 1e6
        let notional = (filled_qty as i128 * vwap_px as i128 / 1_000_000) as i64;
        assert_eq!(notional, 50_000_000_000, "Notional should be $50,000");

        // Calculate fee: notional * fee_bps / 10000
        let fee = (notional as i128 * taker_fee_bps as i128 / 10_000) as i64;
        assert_eq!(fee, 100_000_000, "Fee should be $100 (0.2% of $50k)");

        println!("✅ NOTIONAL & FEE CALCULATION:");
        println!("   Filled: {} BTC", filled_qty / 1_000_000);
        println!("   Price: ${}", vwap_px / 1_000_000);
        println!("   Notional: ${}", notional / 1_000_000);
        println!("   Fee: ${}", fee / 1_000_000);
    }

    /// Test v0 instant fill logic
    #[test]
    fn test_v0_instant_fill() {
        // In v0, fills are instant at limit price
        let qty = 1_000_000i64;           // Want to buy 1 BTC
        let limit_px = 50_000_000_000i64; // Willing to pay up to $50k

        // v0 logic: filled_qty = qty, vwap_px = limit_px
        let filled_qty = qty;
        let vwap_px = limit_px;

        assert_eq!(filled_qty, 1_000_000);
        assert_eq!(vwap_px, 50_000_000_000);

        // Calculate notional
        let notional = (filled_qty as i128 * vwap_px as i128 / 1_000_000) as i64;
        assert_eq!(notional, 50_000_000_000);

        println!("✅ V0 INSTANT FILL:");
        println!("   Requested: {} BTC @ ${}", qty / 1_000_000, limit_px / 1_000_000);
        println!("   Filled: {} BTC @ ${}", filled_qty / 1_000_000, vwap_px / 1_000_000);
        println!("   Notional: ${}", notional / 1_000_000);
    }

    /// Test SlabState size (should be ~4KB for v0)
    #[test]
    fn test_slab_size() {
        use percolator_slab::state::SlabState;
        use core::mem::size_of;

        let size = size_of::<SlabState>();

        // Should be around 4KB (between 3KB and 5KB)
        assert!(size > 3_000, "SlabState should be > 3KB, got {}", size);
        assert!(size < 5_000, "SlabState should be < 5KB, got {}", size);

        println!("✅ SLAB SIZE: {} bytes (~{}KB)", size, size / 1024);
    }

    /// Test QuoteCache size (should be 256 bytes)
    #[test]
    fn test_quote_cache_size() {
        use percolator_slab::state::QuoteCache;
        use core::mem::size_of;

        let size = size_of::<QuoteCache>();
        assert_eq!(size, QuoteCache::LEN);
        assert_eq!(size, 256, "QuoteCache should be exactly 256 bytes");

        println!("✅ QUOTE CACHE SIZE: {} bytes", size);
    }

    /// Test FillReceipt size
    #[test]
    fn test_fill_receipt_size() {
        use percolator_slab::state::FillReceipt;
        use core::mem::size_of;

        let size = size_of::<FillReceipt>();
        assert_eq!(size, FillReceipt::LEN);

        println!("✅ FILL RECEIPT SIZE: {} bytes", size);
    }
}
