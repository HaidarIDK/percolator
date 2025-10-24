# End-to-End Surfpool Testing Plan (Router + Slab Matchers + Keeper)

This plan validates the v0 architecture on a local Surfpool (Solana SVM) network: Router owns collateral, portfolios, risk & liquidations; Matcher/Slab programs expose quotes & execute commit_fill via CPI; Keeper maintains an off-chain priority queue and triggers liquidations/deleveraging.

---

## 0) Test Matrix Overview

**Tracks:**
1. Bootstrap & Layout — programs deploy, accounts init, fixed offsets validated
2. Happy-Path Trading — router reads K-levels, splits, CPIs, settles
3. Capital Efficiency — cross-slab netting (IM on net exposure)
4. Liquidations & Deleveraging — reduce-only flows via same CPI
5. Boundary / Safety — allow-list, TOCTOU, oracle alignment, write-scope, atomicity
6. Keeper Loop — off-chain PQ drives liquidation order, router re-validates
7. Perf/CU — compute & latency bounds under multi-slab concurrency
8. Determinism & Replay — identical hashes on reruns

---

## 1) Environment & Artifacts

### 1.1 Programs
- `router.so` (+ IDL)
- `matcherA.so`, `matcherB.so` (+ IDLs) — identical API, fixed layout
- `oracle.so` (+ IDL)

### 1.2 Accounts (created by harness)
- `slabA_state`, `slabB_state` — single large state accounts per matcher (header + book + QuoteCache)
- Router:
  - `router_registry`
  - `router_vault_[USDC]` (SPL token)
  - `portfolio_[makerLP]`, `portfolio_[taker1]`, `portfolio_[taker2]`, `portfolio_[at_risk]`
- Keeper config (off-chain JSON)
- For each CPI: ephemeral `receipt_pda` owned by the matcher program

### 1.3 Constants
- `SCALE = 1_000_000`
- `K = 4` QuoteCache levels/side
- `imr = 0.10`, `mmr = 0.05`
- `taker_bps = 5`
- `liq_band_bps = 50` (liquidations), `preliq_band_bps = 25`
- Oracle tolerance `ε_ticks = 1`

### 1.4 Artifacts to persist per test
- Tx logs & CU usage
- Pre/post snapshots:
  - Router UserPortfolio(s), router_registry
  - Slab header (magic, version, seqno, mark_px, off_quote_cache) & QuoteCache
  - All FillReceipts
  - Keeper PQ state (worst N users)
- Test report JSON with assertions & hashes

---

## 2) Harness Boot Sequence

1. Start Surfpool localnet; airdrop SOL to deployer, router_admin, lp_A, lp_B, taker1, taker2, keeper
2. Deploy oracle.so, matcherA.so, matcherB.so, router.so
3. Create slab states; initialize header:
   - `magic="PERP10\0\0"`, `version=1`, `seqno=0`
   - `contract_size=SCALE`, `tick=SCALE`, `lot=SCALE`
   - `off_quote_cache` set & in-bounds
4. Bind oracles:
   - Publish `oracle_px = 60_000 * SCALE`
   - Update `Header.mark_px` on both slabs (authorized)
5. Router init:
   - Create `router_registry` with allow-listed entries:
     `(program_id=matcherA/B, version_hash, slab_state_pubkey, oracle_id, fee_caps, K, ε)`
   - Create Router vault(s) & portfolios; deposit collateral for users/LPs
6. Sanity checks:
   - Offsets parse; `QuoteCache.seqno_snapshot == Header.seqno`
   - Router verifies `(program_id, version_hash)` matches registry

---

## 3) Helper API (Harness)

```rust
// Read QuoteCache from slab state
fn read_quote_cache(slab_state) -> QuoteCacheSnapshot {
    seqno_snapshot, bids[K], asks[K]
}

// Create new receipt PDA owned by matcher program
fn new_receipt_pda(owner=matcher_program_id) -> Pubkey

// Router trade transaction builder
fn router_trade_tx(splits: Vec<Split>) -> Transaction {
    // 1. reads QuoteCache(s)
    // 2. performs CPIs to matcher.commit_fill(side, qty, limit_px, receipt_pda)
    // 3. after CPIs, reads receipts, updates Router portfolios
}

// Router liquidation transaction builder
fn router_liquidate_tx(user: Pubkey, plan: LiquidationPlan) -> Transaction {
    // Same as trade but reduce-only with liquidation bands
}

// Assertions from receipts
fn assert_from_receipts(...)

// State snapshot for determinism testing
fn snapshot_state(label: &str) -> StateHash

// Keeper event loop
fn keeper_loop(step_ms: u64, max_iters: usize) {
    // Off-chain PQ updates; submits liquidation txs for worst accounts; records outcomes
}
```

---

## 4) Test Scenarios

### 4.1 Bootstrap & Layout

**T-01: Layout Validity**
- Read SlabHeader & QuoteCache offsets for A/B
- Expect: magic/version set; offsets in-bounds; K=4 present; seqno_snapshot == seqno

**T-02: Allow-list & Version Hash**
- Flip a registry entry's version hash; attempt CPI
- Expect: Router rejects pre-CPI with explicit error

**T-03: Oracle Alignment Gate**
- Set slabB mark_px = oracle + 3ε
- Expect: Router excludes B from any routing/liq plan

---

### 4.2 Happy-Path Trading

**T-10: Atomic Multi-Slab Buy**
- Seed asks: A: [59_900×5, 60_000×10], B: [59_950×8, 60_050×8]
- Buy +10 with limit 60_000
- Expect: Receipts: A +5 @ 59_900, B +5 @ 59_950; portfolio exposure +10; fees computed; seqno matched; tx CU < budget

**T-11: Capital Efficiency (Netting)**
- In same tx: open +10 then -10 across slabs (two CPIs sets)
- Expect: Net exposure ≈ 0, IM_router ≈ 0 (epsilon); per-slab exposures non-zero pre-netting

**T-12: Price-Limit Protection**
- Best ask 60_100, buy +5 with limit=60_000
- Expect: filled_qty=0 (or partial within limit); tx aborts if quantity target unmet by policy

**T-13: All-or-Nothing on Partial Failure**
- Remove B's top level after read; route A+B
- Expect: CPI to B fails; entire tx aborts; no receipts written; no Router state changes

**T-14: TOCTOU Guard**
- Bump Header.seqno between read & CPI
- Expect: commit_fill rejects; tx aborts; pre/post snapshots identical

---

### 4.3 Liquidations

**L-01: Hard Liquidation Happy Path**
- User at_risk long +Q; move oracle so equity < MM
- Router builds reduce-only sells within liq_band_bps; split across A/B
- Expect: Receipts within band; exposure reduced; equity ≥ MM (or improved); accounting/fees correct

**L-02: Fragmented Depth**
- Thin top-K across A/B; need both
- Expect: Multiple receipts; seqnos match; post-tx IM decreases; CU within budget

**L-03: Insufficient Depth Iterative**
- Not enough within band to restore MM
- Expect: First tx partial; second tx (same or wider band) completes; monotone improvement in health = equity − MM

**L-04: Misaligned Slab Excluded**
- B's mark misaligned; plan must use A only
- Expect: If insufficient depth, tx fails with "insufficient aligned liquidity"

**L-05: Reduce-Only Enforcement**
- Planner target > exposure (stale PQ)
- Expect: Router clamps total reduces to ≤ current exposure; no direction flip

---

### 4.4 Deleveraging (Pre-emptive)

**D-01: Buffer Trigger**
- MM ≤ equity < MM + preliq_buffer
- Router uses preliq_band_bps (tighter) to reduce risk
- Expect: Smaller receipts; exposure reduced; equity margin improves; smaller fee schedule applied (if configured)

**D-02: Rate Limit / Cooldown**
- Keeper submits repeated deleveraging txs
- Expect: Router enforces cooldown per user; rejects extras; keeper backs off

---

### 4.5 Keeper Loop

**K-01: PQ Ordering**
- Randomize 50 users' health; keeper pops worst-N and submits txs
- Expect: Router re-validates health at entry; executes only true under-MM; keeper re-queues improved users correctly

**K-02: Stale Item Handling**
- Health improves between pop & submit
- Expect: Router rejects; keeper recomputes & drops or reprioritizes; no livelock

---

### 4.6 Boundary & Safety

**B-01: Write Scope**
- Instrument matcher to attempt writing any account other than slab_state & receipt_pda
- Expect: Instruction fails; no state change

**B-02: Receipt Reuse**
- Reuse same receipt_pda twice within tx
- Expect: Second write rejected; tx aborts

**B-03: No Token CPI**
- Ensure no token accounts passed to matcher; static scan & runtime logs confirm no SPL Token CPI

**B-04: Per-Matcher Cap**
- Planned routed notional > router_cap_per_matcher
- Expect: Router clamps per-matcher; reallocates remainder to others or leaves residual; plan still reduce-only

---

### 4.7 Performance / CU

**P-01: 8-Slab Split**
- Deploy 8 matchers (clone A) with K=4; buy +16 or liquidate similar notional
- Expect: CU < threshold (set budget, e.g., 1.2M); wall time < 150 ms localnet; receipts correct

**P-02: Burst 50 Txs**
- 50 sequential trades/liquidations
- Expect: seqno increments once per book mutation; no account growth beyond allocated size; median latency stable

---

### 4.8 Determinism & Replay

**R-01: Deterministic Replay**
- Re-run T-10 and L-01 20× with identical inputs
- Expect: Identical receipts & post-state hashes

**R-02: Idempotent Failure**
- Force CPI fail; state unchanged; rerun with corrected inputs succeeds

---

## 5) Assertions (per test)

- **Authority/ACL**: CPI caller = Router authority; non-router calls rejected
- **Oracle Alignment**: slabs used satisfy |mark − oracle| ≤ ε
- **TOCTOU**: Header.seqno at CPI entry equals QuoteCache.seqno_snapshot read
- **Limit & Band**: fills respect limit_px (trades) / liq_band_bps (liquidations)
- **Reduce-only**: liquidation/deleveraging never increases exposure
- **Receipts**: single write, correct (qty, vwap, notional, fee) with SCALE rounding tolerance
- **Atomicity**: any CPI failure → entire tx aborts, no Router state change
- **Netting**: IM computed on net exposure; flat → IM≈0 (+ε)
- **Conservation**: taker/maker PnL + user PnL + fees == trade notional deltas (± rounding)
- **CU/time**: under budget thresholds

---

## 6) Example Test Report JSON

```json
{
  "test": "L-01 Hard Liquidation Happy Path",
  "inputs": {
    "oracle_px": 60000000,
    "liq_band_bps": 50,
    "user": "at_risk",
    "exposure": {"A": {"long": 7000000}, "B": {"long": 3000000}}
  },
  "preState": {"equity": 950000000, "IM": 100000000, "MM": 50000000, "health": -5000000},
  "plan": [
    {"slab":"A","side":"Sell","qty":5000000,"limit_px":59700000},
    {"slab":"B","side":"Sell","qty":2000000,"limit_px":59700000}
  ],
  "receipts": [
    {"slab":"A","filled_qty":5000000,"vwap_px":59900000,"fee":14975,"seqno":23},
    {"slab":"B","filled_qty":2000000,"vwap_px":59950000,"fee":5990,"seqno":11}
  ],
  "postState": {"equity": 1008000000, "IM": 50000000, "MM": 50000000, "health": 3000000},
  "assertions": {
    "reduce_only": true,
    "within_band": true,
    "atomicity": true,
    "conservation": true,
    "cu_used": 780000
  },
  "pass": true
}
```

---

## 7) CI Gates (Pass/Fail)

All must hold:
- All Bootstrap tests T-01..T-03 pass
- Trading T-10..T-14 pass
- Liquidations L-01..L-05 pass
- Deleveraging D-01..D-02 pass
- Keeper K-01..K-02 pass
- Boundary B-01..B-04 pass
- Perf P-01..P-02 within budgets
- Replay R-01..R-02 consistent

If any fail, emit:
- Full tx logs, diffs of touched accounts, receipts, PQ snapshot, and a one-paragraph fix suggestion pointing to the exact guard or bound to add/adjust

---

## 8) Implementation Notes (Harness)

- In each tx, pass matcher slab_state writable (locks TOCTOU window), plus a fresh receipt_pda owned by matcher program
- Do not pass any token accounts to matchers
- For TOCTOU tests, schedule a pre-CPI instruction that mutates the book to advance seqno
- For CU budget, enable compute unit logging to collect per-tx CU
- Hash post-state as SHA256(router portfolios || slabA header+cache || slabB header+cache || receipts)

---

## Implementation Status

This plan keeps v0 scope minimal while exercising every safety boundary and proving router-centric risk & liquidation with atomic multi-slab execution under Surfpool.

**Current Status:** Framework in progress
**Tests Implemented:** 0/27
**Next:** Create test harness and helper functions
