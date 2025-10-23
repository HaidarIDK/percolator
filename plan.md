Below is a fully expanded, implementation-ready design for the sharded perp DEX protocol—covering the Router and single-slab LP DEX, wire protocols, data layouts, invariants, adversarial controls, and a comprehensive validation plan (unit, property-based, fuzz, integration, chaos, and economic/regression tests). Everything is written to be directly actionable for engineers and reviewers. No prompts or questions—just the full answer.

⸻

Sharded Perpetual Exchange — Aggregator (Router) + Safe Single-Slab DEX

Version: 1.0
Scope: On-chain programs, 10 MB slab engines, aggregator Router, collateral/security boundaries, risk, matching, funding, liquidation, batch timing, reservations, capability-scoped debits, and testing.

⸻

0) Terminology & Symbols
	•	Slab — an LP-run perp engine; all state in a 10 MB contiguous slab (no heap).
	•	Router — global aggregator with custody of collateral, portfolio margin, routing/reserve/commit coordination, and escrow/capability issuance.
	•	Cap — a non-transferable capability token/record allowing a slab to debit only (user, slab, asset) escrow up to amount_max until expiry.
	•	Reserve → Commit — two-phase execution: reserve quotes/slices, pre-pledge max charge, then commit at captured maker prices.
	•	Epoch/Batch — discrete matching windows (e.g., 50–100 ms) used for anti-toxicity and promotion of delayed makers.
	•	DLP — designated LP accounts with immediate posting rights; non-DLP resting orders are promoted next batch (optional, recommended).

⸻

1) Top-Level Architecture

1.1 Components
	•	Router Program
	•	Global vault(s) per asset.
	•	Per-user Portfolio account (equity, IM/MM, exposures).
	•	Escrow PDA per (user, slab, asset).
	•	Cap records per (user, slab, asset, route_id), short TTL.
	•	Registry of allow-listed slabs (code hash, oracles, params).
	•	Reserve/Commit/Cancel orchestration; liquidation coordinator.
	•	Slab Program (per LP)
	•	In-slab header: risk params, fee schedule, batch/epoch, DLP set/bitset, anti-toxicity knobs.
	•	Pools: accounts, instruments, orders (with reserved_qty), positions, trades ring, reservation table + slice pool, optional aggressor ledger, pending queues for non-DLP.
	•	Functions: reserve, commit, cancel, batch_open, liquidation_call.
	•	Deterministic matching + cross-margin within slab, funding, and fee settlement with Router-scoped debit checks.

1.2 Security Boundary
	•	Slabs cannot access Router vaults.
	•	Slabs can only debit escrow via an unexpired Cap scoped to (user, this_slab, asset) and **≤ amount_max`.
	•	Router never honors slab “pull” requests; it push-pledges escrow before commit.

Must-hold invariant: No path exists for a slab to move funds for any (user’, slab’) ≠ (user, this_slab); Router has no insurance pool, and cannot be debited by a slab directly.

⸻

2) Data Layouts & Wire Interfaces

2.1 Router Accounts

Vault[mint]
	•	Custody of asset; controlled by Router multisig/timelock.
Test properties
	•	P1: Only Router can move funds (CPI/ACL enforced).
	•	P2: Mint address matches expected; no mutable authority drift.
	•	P3: Vault balance monotone non-negative; no underflows.

Escrow(user, slab, mint) ⇒ PDA(“pledge”, router_id, slab_id, user_id, mint)
	•	balance: u128
	•	nonce/epoch: u64 (anti-replay)
	•	Optional frozen: bool
Test properties
	•	P4: Only Router can credit/debit escrow; slab only reads balance.
	•	P5: Balance ≥ 0 at all times; idempotent re-credit on rollback.

Cap(route_id)
	•	scope_user, scope_slab, mint (pubkeys)
	•	amount_max: u128, remaining: u128
	•	expiry_ts: u64, nonce: u64
	•	burned: bool
Test properties
	•	P6: Cap cannot be altered by slab; only Router mints/burns.
	•	P7: Debit attempts past remaining or after expiry_ts are rejected.

UserPortfolio
	•	equity: i128, im: u128, mm: u128
	•	exposures: map<(slab, instrument), i128>
	•	free_collateral: i128
	•	last_mark_ts: u64
Test properties
	•	P8: Portfolio IM computed from net exposures across slabs (convexity not double-counted).
	•	P9: equity = cash + Σ unrealized_pnl consistency across marks.

SlabRegistry
	•	slab_id, version_hash, oracle_id, imr, mmr, fee caps, latency SLA
Test properties
	•	P10: Only governance updates registry; version hash matches deployed code.
	•	P11: Router rejects reserve/commit to unregistered or stale hash slabs.

⸻

2.2 Slab State (within 10 MB)

Header
	•	Magic/version; sizes/offsets; limits for pools
	•	Risk params: imr, mmr, maker_fee, taker_fee
	•	Anti-toxicity: batch_ms, freeze_levels, kill_band_bps, as_fee_k, jit_penalty_on, maker_rebate_min_ms
	•	DLP: dlp_max_fixed or off_dlp_bitset
	•	Trade ring size; reservation pool sizes
Test properties
	•	S1: Header checksum stable between restarts (optional CRC).
	•	S2: Updating params respects governance rules (LP can’t exceed fee caps).

Instruments
	•	symbol, contract_size, tick, lot, index_price, funding_rate, cum_funding
	•	Book heads: bids_head, asks_head
	•	Pending heads: bids_pending_head, asks_pending_head
	•	epoch: u16, batch_open_ms: u64, freeze_until_ms: u64
Test properties
	•	S3: Tick/lot alignment enforced.
	•	S4: Epoch increments strictly at batch_open; pending promotions happen once.

Orders (pool)
	•	used, side, tif
	•	maker_class: REG|DLP, state: LIVE|PENDING
	•	eligible_epoch: u16, created_ms
	•	price, qty, reserved_qty, qty_orig
	•	Links: next, prev (book), next_free
	•	account_idx, instrument_idx, order_id
Test properties
	•	S5: reserved_qty ≤ qty always; book list links are acyclic and consistent.
	•	S6: Price–time priority preserved (order_id monotone at insert/promotion).
	•	S7: PENDING orders never match before promotion.

Reservations & Slices
	•	Reservation: {hold_id, route_id, side, iidx, aidx, qty, vwap_px, worst_px, max_charge, commitment_hash, salt16, book_seqno_at_hold, expiry_ms, reserved_list_head}
	•	Slice: {order_idx, qty, next}
Test properties
	•	S8: Total reserved slices per order ≤ qty - reserved_qty invariant.
	•	S9: Commit consumes ≤ reserved qty and ≤ max_charge translated to debits at maker prices.

Positions
	•	{account, instrument, qty, entry_px, last_funding, next_in_account}
Test properties
	•	S10: VWAP arithmetic exact under fixed-point; flip logic realizes PnL correctly.

Aggressor Ledger (optional anti-sandwich)
	•	{epoch, buy_qty, buy_notional, sell_qty, sell_notional} per (account, instrument) seen in batch
Test properties
	•	S11: Roundtrip guard clips or taxes only overlapping aggressive legs; maker/passive fills exempt.

Trades ring
	•	{ts, order_id_maker, order_id_taker, instrument, price, qty, side, optional hash32, reveal_ms}
Test properties
	•	S12: Commit emits prints equal to slice fills; reveal delay honored.

⸻

2.3 Cross-Program Interfaces

Slab.reserve(route_id, user, iidx, side, qty, limit_px, ttl_ms, commitment_hash) → {hold_id, vwap_px, worst_px, max_charge, expiry_ms, book_seqno}
	•	Purely slab-local: reserves slices, locks reserved_qty, returns worst/vwap & maximum debit upper bound.
Validation
	•	R1: qty aligned to lot; limit_px to tick.
	•	R2: Price walk stops at limit_px (buy: ≤ limit, sell: ≥ limit).
	•	R3: No visible depth change unless policy chooses to show “available”.

Router escrow+cap funding
	•	Credit escrow(user, slab, mint) by max_charge.
	•	Mint Cap(scope=(user, slab, mint), amount_max=max_charge, expiry=now+ttl, route_id).

Slab.commit(hold_id, cap)
	•	Recompute debit ≤ cap.remaining; verify within max_charge.
	•	Execute fills at maker prices captured at reserve; apply fees/funding; debit escrow via cap.
Validation
	•	R4: Reject if now > expiry_ms or cap.expired/burned.
	•	R5: Reject if any order slice missing (order canceled beyond unreserved part).
	•	R6: Debit bound ≤ cap.remaining and ≤ escrow.balance.
	•	R7: Anti-toxicity checks (kill band vs mark; JIT penalty; freeze).

Slab.cancel(hold_id)
	•	Releases reserved slices; reserved_qty reduced; no debits.
Validation
	•	R8: Idempotent; partially canceled holds leave correct reserved_qty.

Slab.batch_open(iidx, now_ms)
	•	epoch++; promote pending with eligible_epoch == epoch; set freeze windows as configured.
Validation
	•	R9: Promotions are O(#pending) and stable; no duplicate inserts.

Slab.liquidation_call(user, deficit)
	•	Closes positions via market sweeps up to deficit target; returns residual.
Validation
	•	R10: Only Router can invoke; matches only LIVE depth; respects price bands.

⸻

3) Risk, Margin & Funding

3.1 Local (Slab) Risk
	•	equity_local = cash_local + Σ pnl_positions
	•	IM_slab = Σ_i |qty_i|*contract_size_i*mark_i*imr_slab
	•	Enforcement: Pre-trade can_place checks for takers/makers; post-trade checks; liquidation threshold on equity_local < MM_slab.

Tests
	•	RM1: Monotone IM: increasing absolute exposure increases IM_slab.
	•	RM2: Close trade reduces IM appropriately; zero position ⇒ zero IM.
	•	RM3: Liquidation triggers only when equity < MM_slab ± 1 tick tolerance.

3.2 Global (Router) Portfolio Margin
	•	Net exposures across slabs, same oracles; correlation matrix optional.
	•	IM_router = g(Σ slabs instruments exposures)
	•	Router assures free_collateral ≥ IM_router + buffers.

Tests
	•	RM4: Convexity penalty not double-counted: Σ IM_slab ≥ IM_router when positions net.
	•	RM5: Cross-slab opposite exposures reduce required IM (within correlation bounds).

3.3 Funding
	•	Shared funding_rate grid per instrument symbol across slabs.
	•	Slab applies funding to positions; Router nets funding cashflows across slabs at portfolio level.

Tests
	•	RM6: Funding applied exactly once per interval; cum_funding snapshots per position correct.
	•	RM7: Router net funding equals sum of slab deltas within rounding error bounds.

⸻

4) Matching, Queues & Anti-Toxicity

4.1 Price–Time
	•	Strict FIFO by better price then order_id within same price.
	•	Non-DLP resting orders PENDING → LIVE on next epoch (optional rule to reduce sandwiches).

Tests
	•	M1: Inserting at same price w/ earlier order_id executes first.
	•	M2: PENDING never matched before promotion.
	•	M3: Cancellation of an earlier order updates head correctly; no orphan links.

4.2 Reservations
	•	Shadow reservations reduce available_qty but may choose not to display reserved size to avoid signaling.

Tests
	•	M4: Sum(reserved on order) ≤ qty; no negative available.
	•	M5: Two concurrent reserves cannot over-reserve the same order.

4.3 Commit-Reveal Batches (optional but recommended)
	•	commitment_hash = H(route_id||iidx||side||qty||limit_px||salt) at reserve; reveal at commit verifies.

Tests
	•	M6: Wrong salt or altered inputs reject at reveal.
	•	M7: Batch tick boundaries enforced; DLP immediate posting vs REG delay.

4.4 Anti-Sandwich
	•	Top-K freeze of contra queue within batch.
	•	JIT penalty: DLPs posted after batch_open_ms earn no rebate this batch.
	•	Kill band: if |mark_now/mark_before - 1| > bps, reject commit.
	•	Aggressor Roundtrip Guard (ARG) (optional): within batch, an account cannot realize non-negative PnL on buy→sell (or sell→buy) overlap without paying sandwich tax.

Tests
	•	M8: Top-K freeze keeps reserved slices at the front vs late pop-ins.
	•	M9: JIT penalty toggles only on creation time relative to batch_open_ms.
	•	M10: Kill band rejections deterministic; router can pre-check with same oracle.
	•	M11: ARG clips/taxes only overlapping aggressive legs; maker/passive fills exempt.

⸻

5) Liquidation & Recovery
	•	Router-first: attempts off-setting across slabs and collateral re-pledge during grace window.
	•	Slab liquidation: if still under MM, slab sweeps positions up to deficit target using market orders with price bands.

Tests
	•	L1: Grace window honored; if router restores margin, slab doesn’t liquidate.
	•	L2: Liquidation never debits beyond cap/escrow.
	•	L3: Liquidation fills priced within configurable bands vs mark.

⸻

6) Failure Handling & Liveness
	•	Cap expiry: short TTL (≤ 2 minutes); after expiry, slab commits must fail; router cancels holds.
	•	Router crash during batch: funds safe—escrow balances immobile; caps expire.
	•	Slab unresponsive: router re-routes in next batch; per-slab E-max throttles exposure.

Tests
	•	F1: Expired caps cause deterministic commit failure; escrow unchanged.
	•	F2: Idempotent cancel of holds.
	•	F3: Network partitions: router retry leads to at-most-once commit semantics (cap nonce).

⸻

7) Performance & Memory Budgets
	•	Slab (10 MB target):
	•	Accounts (10k), Instruments (≤ 32), Orders (60–80k), Positions (60–80k), Trades (10–20k ring), Reservations (8k) + Slices (32k), Aggressor ledger (4–8k), Pending queues, Bitsets: ≤ 10 MB with O(1) freelists.
	•	Throughput: ≥ 50k order inserts/sec per slab in-process; commits bounded by slices (#price levels walked).
	•	Latency: Reserve < 200 µs typical; Commit < 500 µs typical under moderate contention.

Tests
	•	PFM1: Microbench insert/cancel/commit under pool full/near-full conditions.
	•	PFM2: Fragmentation-free freelists; allocation constant-time.
	•	PFM3: Regression budgets: slab must compile to < 10 MB total state; steady memory over 24h soak.

⸻

8) End-to-End Flows (Message Sequences)

8.1 Atomic Multi-Slab Buy (Router)
	1.	reserve() parallel on slabs {A,B,C} → {hold_i, vwap, worst, max_charge}
	2.	Router selects subset hitting target qty & limit.
	3.	Router credits escrow(user, slab_i), mints Cap_i(max_charge_i).
	4.	Router calls commit(hold_i, Cap_i) across chosen slabs.
	5.	On all success: burn caps, update portfolio; otherwise cancel and roll back.

Tests
	•	E2E1: Any single commit failure causes full cancel; no debit beyond caps.
	•	E2E2: Blended VWAP ≤ user limit; unit rounding tolerance consistent.

8.2 Liquidation Across Slabs
	1.	Router detects equity < MM_router; calls re-pledge/off-set attempts.
	2.	Residual deficit distributed to slabs via liquidation_call.
	3.	Slabs sweep positions; returns final deficit; Router may tap insurance per policy.

Tests
	•	E2E3: Cross-slab offset reduces sell pressure; measured price impact lower than independent slab liquidations.
	•	E2E4: Insurance payouts require verified proofs; no direct slab pull.

⸻

9) Adversarial & Abuse Scenarios
	•	Malicious slab tries to over-debit: blocked by cap remaining/expiry and escrow bounds.
	•	Over-reservation race: reservation engine enforces reserved_qty limit; second reserve fails if no available.
	•	LP fee gouging: slab header fee caps validated vs registry; Router refuses commits above caps.
	•	Oracle spike mid-batch: kill band rejects; Router retries next batch.
	•	User sybil across accounts to bypass ARG: other anti-toxicity (commit-reveal, freeze, JIT penalty) still increase cost; optional KYC link can aggregate.

Tests
	•	ADV1: Fuzz commit values (prices/qty/fees) above caps → must fail.
	•	ADV2: Cancel after reserve removing slices → commit fails or quantity auto-reduced (policy), never over-fills.
	•	ADV3: Fee cap violations rejected deterministically.

⸻

10) Test Plan (Exhaustive)

10.1 Unit Tests (Deterministic)
	•	Math: fixed-point mul/div, VWAP updates, PnL realization at flips, funding accrual (RM set).
	•	Book: insert/erase at head/middle/tail; FIFO tie-breakers; pending promotion; reserved_qty accounting (M set).
	•	Risk: local pre-trade checks; global IM function; liquidation thresholds (RM/L sets).
	•	Caps/Escrow: mint/burn/expiry; remaining decrements; multiple debits; nonce replay protection (P set).

10.2 Property-Based Tests
	•	Price-time invariant: random sequences of posts/cancels/matches → always yields same execution as deterministic replay.
	•	Conservation of value: Across reserve → commit → cancel, total debits ≤ Σ amount_max; and cash/PnL balances sum to trade notional ± fees.
	•	No over-reservation: Generate adversarial concurrent reserves → never exceeds qty - reserved_qty.

10.3 Fuzz Tests
	•	Commit with corrupted cap (wrong scope, expiry, nonce).
	•	Extreme tick/lot settings (tiny ticks, huge lots).
	•	Max pools (orders, positions) near limits; random churn.
	•	Oracle jitter within/over kill band.

10.4 Integration Tests
	•	Multi-slab atomic route (success & rollback).
	•	Router crash mid-batch (caps expire; no lost funds).
	•	Cross-slab offset (long A / short B → IM_router ≪ Σ IM_slab).
	•	Liquidation coordination (router grace, then slab sweeps).

10.5 Chaos/Soak
	•	24-72h randomized load: 60–80% book utilization, reserves/commits at 50–100 ms batches; memory & latency drift monitored; no leaks or OOM.

10.6 Economic/Behavioral
	•	VPIN / toxicity over replayed tick data: compare with and without anti-toxicity controls; LP PnL variance should drop.
	•	Capital efficiency: measure posted collateral vs net exposure; target within 2–5% of monolithic DEX baseline.

10.7 Formal/Static
	•	Symbolic execution of slab debit path ensures debit ≤ min(cap.remaining, escrow.balance) on every branch.
	•	ACL proofs: no CPI path from slab to Router vault.
	•	State invariants: book links acyclic; pools’ freelist integrity.

⸻

11) Implementation Notes & Pseudocode Highlights

11.1 Slab Debit Guard (hot path)

bool safe_debit(User u, Slab s, Mint m, u128 amount, Cap cap) {
  require(cap.scope_user==u && cap.scope_slab==s && cap.mint==m);
  require(now <= cap.expiry && !cap.burned);
  u128 esc = read_escrow(u,s,m);
  require(amount <= cap.remaining && amount <= esc);
  cap.remaining -= amount;
  write_escrow(u,s,m, esc - amount);
  return true;
}

Test props: ADV1, P6–P7.

11.2 Reserve Slices (price-time faithful)

for (head = best_contra(iidx, side); qty_left>0 && head; head = next(head)) {
  available = ord[head].qty - ord[head].reserved_qty;
  take = min(qty_left, available);
  if (take <= 0) continue;
  add_slice(resv, head, take);
  ord[head].reserved_qty += take;
  qty_left -= take;
}

Test props: S8, M4–M5.

11.3 Commit at Captured Prices
	•	Iterate reserved slices; for each maker order compute trade at maker limit price captured during reserve → creates position updates, fees, and safe_debit call for notional±fees; emit trade print.

Test props: S9, R6–R7, S12.

11.4 Pending Promotion at Batch

epoch++;
promote_list(bids_pending_head, epoch);
promote_list(asks_pending_head, epoch);

Test props: R9, S5–S7.

⸻

12) Governance, Upgrades, & Observability
	•	Governance: Router DAO manages registry, oracles, fee caps; slabs publish version_hash.
	•	Upgrades: Per-slab upgrades do not impact others; Router refuses mismatched hashes.
	•	Telemetry: Emit metrics (depth, spreads, reserves, fails, kill-band rejections, ARG taxes).
	•	State Snapshots: Slabs periodically publish Merkle roots of user balances/positions; Router verifies before increasing E_max.

Tests
	•	GOV1: Router rejects unknown version hashes.
	•	OBS1: Merkle root recomputation matches local state across random samples.

⸻

13) Deliverables Checklist (Engineering)
	•	Router program (vault, escrow, caps, registry, portfolio margin, liquidation coordinator).
	•	Slab program (10 MB slab; matching, risk, reservations, commit, pending queues).
	•	On-chain interfaces + client SDK: reserve, commit, cancel, batch_open, liquidation_call.
	•	Oracles adapter (shared marks/funding).
	•	Test harness with all tests above; CI gating on invariants/latency/memory.
	•	Benchmarks + Soak profiles.
	•	Formal ACL proofs for debit path.
	•	Operational runbooks (failover, kill-switches, cap expiries, incident response).

⸻

14) Acceptance Criteria (Go/No-Go)
	•	Safety: No failing case allows debit beyond (cap.remaining ∧ escrow.balance); slabs cannot touch unrelated funds—validated by unit, fuzz, and formal ACL checks.
	•	Capital Efficiency: For canonical scenarios (long/short offsets across slabs), IM_router within ≤ 5% of monolithic baseline.
	•	Performance: Reserve < 0.2 ms, Commit < 0.5 ms median per slab at 50% book utilization; no state growth beyond configured pools.
	•	Anti-Toxicity Efficacy: LP PnL variance reduced vs control (A/B on historical data); sandwich payoff eliminated within batch (ARG/tax or freeze+batch).
	•	Reliability: Chaos tests pass; caps expire cleanly; router crash recovery is lossless.

⸻

Final Note

This design keeps each LP’s slab fully self-contained and innovable, while the Router guarantees atomic routing, portfolio netting, and capability-scoped safety. The testing matrix ensures no single malicious or buggy slab can impact users who never interacted with it, and that aggregate capital efficiency matches a monolithic DEX—often with better execution quality via selective routing.
