# PERColator

Contract Address: CXobgfkQT6wCysehb3abkuimkmx5chS62fZew9NBpump

A perpetual exchange protocol on PERCS (Percolator Exchange Resource Coordination System)

**Forked from:** [Toly's Percolator](https://github.com/toly-labs/percolator)  

**Live Demo (v0.1)**: https://dex.percolator.site

---

## 🚀 v0.1 - Live Deployment on Solana Devnet

### What's Currently Deployed & Working

**Try it now**: https://dex.percolator.site/trade

**Deployed Programs:**
- **Slab Program**: `SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep`
- **Slab Account**: `5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB` (3.4 KB, ~0.025 SOL rent)
- **Router Program**: `RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr`
- **Router Registry**: `DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx` (43 KB, ~0.30 SOL rent)

### ✅ v0.1 Features

**Slab Program Instructions (All Working):**
- `Initialize` (0) - Create slab account
- `CommitFill` (1) - Router-executed fills
- `Reserve` (2) - Lock liquidity for trading ✅ NEW
- `Commit` (3) - Execute reservation ✅ NEW
- `Cancel` (4) - Cancel reservation ✅ NEW

**Production Frontend (Next.js + React):**
- Full trading interface with Tolly's Reserve → Commit workflow
- Real-time orderbook fetched from on-chain Slab account
- Transaction history with color-coded Reserve (blue) / Commit (green)
- Toast notification system for all events
- Phantom/Solflare wallet integration
- Dashboard with live price charts (ETH, BTC, SOL)
- Portfolio page with real transaction history
- Testnet warning banners with Phantom setup instructions
- Production deployment on HTTPS (Vercel)

**Backend API (Node.js + Express):**
- REST endpoints: `/api/trade/reserve`, `/api/trade/commit`, `/api/trade/record-fill`
- Live Slab data: `/api/slab-live/orderbook`, `/api/slab-live/transactions`
- Transaction builders with unique blockhash per trade
- Active order tracking in memory
- Wallet signer display for each transaction
- Deployed on Render with auto-scaling

**Key Achievements:**
- ✅ Two-phase Reserve/Commit trading works end-to-end on-chain
- ✅ Transactions execute successfully (verify on Solscan)
- ✅ Multiple trades from same wallet (unique route_id + blockhash)
- ✅ Real Slab orderbook data (no mock data)
- ✅ Wallet addresses shown for every Reserve/Commit
- ✅ Production HTTPS deployment (fixes Phantom wallet security)
- ✅ Toast notifications replace all alerts
- ✅ Color-coded transaction types for clarity

### ⚠️ v0.1 Limitations (Proof of Concept)

Current behavior:
- Reserve/Commit instructions execute and log success
- No state modification (mock mode - returns success without updating slab)
- No real orderbook matching engine
- No position tracking on-chain
- No P&L calculation
- No collateral settlement

**Why POC?** v0.1 demonstrates the complete two-phase workflow, UI/UX, and blockchain integration. Full state management will be added in v1.

### 💰 Cost Comparison: v0 vs v1

| | v0.1 (Current POC) | v1 (Full Production) |
|---|---|---|
| **Slab Size** | 3.4 KB | 10 MB (10,485,760 bytes) |
| **Deployment Cost** | ~0.025 SOL (~$5) | ~73 SOL (~$13,900) |
| **Purpose** | Demo & testing | Live trading |
| **Users Supported** | Testing only | 1,000+ concurrent |
| **Orders Capacity** | Mock logging | 10,000 real orders |
| **Matching Engine** | Logs only | Full price-time priority |
| **Position Tracking** | None | Full on-chain tracking |
| **Best For** | Learning & demos | Production markets |

**Why 73 SOL for v1?** The 10MB account contains: 1,000 user accounts (320KB) + 10,000 orders (2.4MB) + 5,000 positions (1.4MB) + 1,000 reservations (480KB) + 2,000 slices (512KB) + trade history (800KB) + aggressor tracking (192KB). This requires ~73 SOL for rent-exemption on Solana.

---

## What I Added to This Fork

This fork extends Toly's original Percolator with production-ready backend infrastructure and user-facing capabilities.

### 1. Router Program - Capability Token System (NEW)

**Purpose:** Secure cross-slab coordination with time-limited, scope-locked authorization tokens

**What It Does:**
- Manages collateral custody across multiple trading slabs
- Issues capability tokens that allow slabs to debit specific user escrows with strict limits
- Prevents malicious slabs from accessing funds they shouldn't (scoped to user/slab/mint)
- Enforces 2-minute expiry on all authorization tokens
- Tracks cross-slab portfolio positions and margin requirements

**Components Added:**
- `Vault` state - Collateral custody with pledge/unpledge tracking
- `Escrow` state - Per-user per-slab collateral accounts with nonces
- `Cap` state - Time-limited capability tokens (max 120s TTL)
- `Portfolio` state - Cross-slab position aggregation
- `SlabRegistry` state - Governance-controlled slab whitelist
- Capability operations: `mint_cap_for_reserve`, `cap_debit`, `burn_cap_and_refund`
- PDA derivations for all router account types
- 12 comprehensive tests covering all security boundaries

**Security Features:**
- Caps enforce (user, slab, mint) scope - cannot be misused
- Automatic expiry (2 minute max)
- Amount limits strictly enforced
- Anti-replay with nonces
- No direct vault access for slabs

**Files:** `programs/router/src/state/`, `programs/router/src/instructions/cap_ops.rs`

---

### 2. Production API Server (NEW)

**Purpose:** Backend REST API and WebSocket server for frontend integration

**What It Does:**
- Provides clean REST endpoints for all trading operations
- Streams real-time market data via WebSocket
- Abstracts Solana complexity from frontend developers
- Works with mock data for rapid UI development
- Easy switch to real blockchain data once programs deployed

**Endpoints Implemented:**
- **System:** Health check, API info
- **Market Data:** Instruments, orderbook, trades, 24h stats (4 endpoints)
- **Trading:** Place order, cancel, reserve, commit (4 endpoints)
- **User Portfolio:** Balance, positions, orders, trade history (4 endpoints)
- **Router:** Deposit, withdraw, cross-slab portfolio, slabs list, multi-slab routing (6 endpoints)
- **WebSocket:** Real-time orderbook, trade feed, user updates

**Technology:**
- Node.js + TypeScript + Express
- WebSocket server with channel subscriptions
- Mock data for frontend development
- CORS enabled, request logging, error handling

**Files:** `api/src/`, `api/package.json`, `api/README.md`, `api/ENDPOINTS.md`

---

### 3. Complete Anti-Toxicity Implementation (ENHANCED)

**Purpose:** Protect liquidity providers from toxic flow and sandwich attacks

**What It Does:**
- Enforces all anti-toxicity mechanisms during trade execution
- Blocks or taxes predatory trading strategies
- Gives designated LPs privileges while protecting against JIT attacks
- Automatically manages freeze windows and batch epochs

**Mechanisms Implemented:**
- **Kill Band** - Rejects commits if oracle moved > threshold (prevents stale price exploitation)
- **JIT Penalty** - No rebates for orders posted after batch opens (stops front-running)
- **Freeze Window** - Blocks non-DLP reserves during freeze period
- **Top-K Freeze** - Non-DLP cannot access best K price levels during freeze
- **Aggressor Roundtrip Guard** - Taxes overlapping buy/sell in same batch
- **Batch Window Management** - Auto-promotes pending orders, clears old aggressor entries

**Testing:**
- 8 dedicated anti-toxicity tests
- Tests cover all freeze scenarios, DLP exemptions, expiry conditions
- Helper functions for realistic test setups

**Files:** `programs/slab/src/matching/commit.rs`, `programs/slab/src/matching/reserve.rs`, `programs/slab/src/instructions/batch_open.rs`, `programs/slab/src/matching/antitoxic.rs`

---

### 4. Funding Rate System (NEW)

**Purpose:** Periodic funding payments to keep perpetual prices anchored to spot

**What It Does:**
- Calculates hourly funding rates based on mark-index spread
- Updates cumulative funding for each instrument
- Applies funding payments to all open positions automatically
- Supports multi-instrument updates in a single call

**How It Works:**
- **Formula:** `rate = k * (mark_price - index_price) / index_price`
- **Coefficient:** 1 basis point per hour base rate
- **Rate Cap:** ±500 bps (5%) maximum to prevent extreme funding
- **Interval:** Updates hourly (3,600,000 ms)
- **Time-Weighted:** Calculates funding proportional to time elapsed
- **Position Integration:** Funding applied via cumulative tracking in equity calculations

**Testing:**
- 8 dedicated funding system tests
- Tests balanced markets, premium/discount scenarios, multi-instrument updates
- Validates early call rejection, cumulative tracking accuracy
- Integration with position PnL calculations

**Files:** `programs/slab/src/matching/funding.rs`, `programs/slab/src/instructions/update_funding.rs`

---

### 5. Complete Instruction Handler System (NEW)

**Purpose:** Full BPF-ready instruction processing for both Router and Slab programs

**What It Does:**
- Deserializes instruction data from raw bytes
- Validates all accounts (owner, signer, writable flags)
- Enforces security checks before execution
- Routes to appropriate business logic handlers
- Returns descriptive error messages

**Slab Instruction Handlers:**
- **Reserve** - Parse 71 bytes: account_idx, instrument_idx, side, qty, limit_px, ttl, commitment_hash, route_id
- **Commit** - Parse 16 bytes: hold_id, current_ts; execute trades at reserved prices
- **Cancel** - Parse 8 bytes: hold_id; release reservation
- **BatchOpen** - Parse 10 bytes: instrument_idx, current_ts; increment epoch, promote pending
- **Initialize** - Parse 114 bytes: authority, oracle, router, imr, mmr, fees, batch_ms, freeze_levels
- **AddInstrument** - Parse 40 bytes: symbol, contract_size, tick, lot, index_price
- **UpdateFunding** - Parse 11 bytes: update_all flag, instrument_idx, current_ts
- **Liquidate** - Parse 24 bytes: account_idx, deficit_target, fee_bps, band_bps

**Router Instruction Handlers:**
- **Initialize** - Setup registry with program authority
- **Deposit** - Parse mint + amount (48 bytes); validate collateral, update portfolio
- **Withdraw** - Check free collateral, validate amount, update vault and portfolio
- **MultiReserve** - Parse slab count + per-slab params; coordinate multi-slab reserves
- **MultiCommit** - Parse slab count + hold_ids; execute coordinated commits
- **Liquidate** - Parse liquidatee + max_debt (48 bytes); check eligibility, close positions

**Serialization Utilities:**
- Zero-copy read/write for all primitive types (u8, u16, u32, u64, u128, i64)
- Fixed-size byte array serialization
- Error-safe with bounds checking
- 5 comprehensive serialization tests

**Security Features:**
- Account owner validation (prevents unauthorized program access)
- Writable flag enforcement (protects read-only accounts)
- Signer verification (prevents impersonation)
- Data length validation (prevents buffer overflows)
- Authority checks (only authorized users can modify state)

**Files:** `programs/common/src/serialize.rs`, `programs/slab/src/entrypoint.rs`, `programs/router/src/entrypoint.rs`

---

### 6. Complete Liquidation Engine (NEW)

**Purpose:** Forced closure of underwater positions to protect the system

**What It Does:**
- Detects underwater accounts (equity < maintenance margin)
- Closes positions via market orders within price bands
- Applies liquidation fees to incentivize liquidators
- Handles partial liquidations (close just enough to restore margin)
- Realizes PnL on forced closure
- Updates portfolio state

**Slab-Side Execution:**
- `execute_liquidation()` - Main coordinator for position closure
- `close_position()` - Close individual positions via market sweep
- `execute_liquidation_sweep()` - Walk book within price bands
- `execute_liquidation_trade()` - Execute single liquidation fill
- Position list management (removal after close)

**Features:**
- Price band enforcement (e.g., ±3% from mark) prevents excessive slippage
- Liquidation fee configurable in basis points (capped at 10%)
- No maker rebates on liquidations (all fees positive)
- Sequential position closure until deficit covered
- Proper PnL realization and cash updates

**Router-Side Coordination:**
- Underwater account detection
- Deficit calculation (MM - equity)
- Cross-slab position offsetting during grace window
- Forced liquidation distribution across slabs
- Liquidator reward calculation and transfer
- Portfolio margin recalculation

**Testing:**
- 7 liquidation tests (Slab)
- 11 liquidation tests (Router)
- Fee calculation validation
- Price band tests
- Deficit calculation tests
- Grace window tests
- Portfolio update tests

**Files:** `programs/slab/src/matching/liquidate.rs`, `programs/slab/src/instructions/liquidate.rs`, `programs/router/src/instructions/liquidate.rs`

---

### 7. Router Multi-Slab Orchestration (NEW)

**Purpose:** Coordinate trading across multiple liquidity sources for best execution

**What It Does:**
- Routes orders to multiple slabs simultaneously
- Selects best execution path based on VWAP
- Manages escrow and capability tokens
- Provides atomic rollback on failures
- Aggregates cross-slab exposures

**Multi-Reserve Orchestration (8 Tests):**
- Calls reserve() on multiple slabs
- Sorts results by VWAP (best price first)
- Greedy selection within price/quantity limits
- Credits escrow for selected slabs
- Mints time-limited capability tokens
- Cancels non-selected reserves

**Multi-Commit Orchestration (10 Tests):**
- Validates all capability tokens
- Executes commits sequentially across slabs
- Atomic rollback if ANY commit fails
- Updates cross-slab portfolio exposures
- Recalculates margin requirements
- Burns caps and refunds escrow

**Key Algorithms:**
- VWAP selection: O(N log N) sorting for optimal routing
- Price limit enforcement: Reject slabs outside user's tolerance
- Atomic semantics: All-or-nothing execution
- Rollback on failure: Cancel remaining, refund all

**Testing:**
- 8 multi-reserve tests (sorting, selection, escrow, caps)
- 10 multi-commit tests (validation, rollback, portfolio)
- 11 liquidation coordinator tests
- All edge cases covered

**Files:** `programs/router/src/instructions/multi_reserve.rs`, `programs/router/src/instructions/multi_commit.rs`

---

### 8. TypeScript SDK & CLI Tools (NEW)

**Purpose:** Production-ready SDK for frontend integration and CLI for LP/admin operations

**TypeScript SDK (@percolator/sdk):**
- Complete client library with all protocol interactions
- `PercolatorClient` - Main class (reserve, commit, cancel, deposit, withdraw, etc.)
- Instruction builders for all 13 instructions
- PDA derivation helpers (slab, vault, escrow, portfolio, cap, registry)
- State decoders (portfolio, orderbook, vault, escrow)
- Utility functions (price conversion, PnL calc, VWAP, etc.)
- Full TypeScript type definitions
- Comprehensive examples

**CLI Tools (@percolator/cli):**
- `perc lp create-slab` - Initialize new perpetual market
- `perc lp add-instrument` - Add trading pairs
- `perc lp set-params` - Update risk parameters
- `perc trade reserve/commit/cancel` - Trading operations
- `perc portfolio show/positions` - Portfolio management
- `perc mm quote/watch` - Market making automation
- `perc monitor equity/liquidations` - Real-time monitoring
- `perc admin deploy/initialize` - Deployment & setup
- `perc balance/airdrop/config` - Utilities

**Developer Experience:**
- NPM packages ready for publication
- TypeScript with full type safety
- Beautiful terminal UI (chalk, ora, inquirer)
- Configuration file support
- Comprehensive documentation
- Code examples for all operations

**Frontend Integration:**
```typescript
import { PercolatorClient, Side, priceToProtocol } from '@percolator/sdk';

const client = new PercolatorClient(connection, ROUTER_ID, SLAB_ID);
await client.reserve(slab, wallet, 0, 0, Side.Buy, qty, price, 60000);
```

**CLI Usage:**
```bash
npm install -g @percolator/cli
perc lp create-slab --market BTC-PERP
perc trade reserve --slab <ADDR> --side buy --qty 1 --price 65000
perc portfolio show
```

**Files:** `sdk/typescript/src/*` (14 files), `cli/src/*` (comprehensive CLI)

---

### 9. Comprehensive Testing & CI (NEW)

**Purpose:** Ensure code quality and catch bugs before deployment

**What It Does:**
- 140+ automated tests across all components
- GitHub Actions CI that runs on every push
- Caching for faster CI runs
- Tests all critical paths and edge cases

**Test Coverage:**
- 32 tests: Common library (math, VWAP, PnL, margin, serialization)
- 45 tests: Router (vault, escrow, caps, portfolio, registry, orchestration, liquidation, initialization)
- 63+ tests: Slab (pools, matching, anti-toxicity, reserve/commit, funding, liquidation, initialization)

**CI Configuration:**
- Runs on every push and pull request
- Tests all three packages separately
- Build caching for speed
- Clear pass/fail status on GitHub

**Files:** `.github/workflows/rust.yml`, comprehensive test suites in all programs

---

### 10. Critical Bug Fixes (FIXED)

**Stack Overflow Fix:**
- Problem: 10MB SlabState caused test thread stack overflow
- Solution: Heap allocation + increased stack size to 16MB
- Files: `.cargo/config.toml`, `programs/slab/src/matching/commit.rs`

**Linter Configuration:**
- Problem: `unexpected_cfgs` warnings for Solana target
- Solution: Proper `[lints.rust]` configuration
- Files: `programs/slab/Cargo.toml`, `programs/router/Cargo.toml`

**Test Logic Corrections:**
- Fixed price crossing logic (maker vs taker perspective)
- Corrected Top-K freeze level counting
- Resolved conflicts between freeze checks
- Added helper functions for test setup

---

### 11. Documentation (NEW)

**Created:**
- `api/README.md` - API server setup and usage
- `api/ENDPOINTS.md` - Complete endpoint reference with examples
- `frontend/README.md` - Frontend deployment guide
- `frontend/SETUP.md` - Environment setup instructions
- `scripts/README.md` - Deployment scripts
- Updated main `README.md` with v0.1 deployment info and fork attribution

---

## About the Original Percolator (Toly's Work)

This fork is based on [Toly's Percolator](https://github.com/toly-labs/percolator), which provides:

### Core Architecture (From Original)

**Slab Program:**
- 10 MB single-slab design for isolated perp markets
- Price-time priority matching engine
- Reserve-commit two-phase execution
- Memory pool management with O(1) freelists
- Fixed-point math utilities
- BPF build support with Pinocchio framework

**Data Structures (From Original):**
- `SlabHeader` - Risk params, batch settings
- `Instrument` - Contract specs, book heads
- `Order` - Price-time sorted with reservation tracking
- `Position` - User positions with VWAP entry
- `Reservation` & `Slice` - Two-phase execution state
- `Trade` ring buffer
- `AggressorEntry` - Batch tracking

**Features (From Original):**
- Batch window concept for fair execution
- DLP (Designated Liquidity Provider) framework
- Pending queue for non-DLP orders
- Basic anti-toxicity field definitions in headers
- PDA derivation patterns

**What Was NOT in Original:**
- Router program (added in this fork)
- Capability token system (added in this fork)
- API server (added in this fork)
- Frontend UI (added in this fork)
- Anti-toxicity enforcement logic (fields existed, logic was TODO - implemented in this fork)
- Comprehensive testing (added 140+ tests in this fork)
- CI/CD (added GitHub Actions in this fork)
- Production deployment (added in this fork)

---

## License

Apache-2.0 (same as original Percolator)

---

## Acknowledgments

- **Toly** for the original Percolator architecture, slab design, and sharded perp exchange concept
- **Solana Foundation** for blockchain infrastructure
- **Pinocchio team** for zero-dependency Solana framework

---

---

## 🔨 Building the Programs

### Quick Build (Windows)

```bash
# Build all 4 programs at once
.\build-bpf.ps1
```

This builds:
1. **Common library** (shared types)
2. **Slab program** → `target/deploy/percolator_slab.so`
3. **Router program** → `target/deploy/percolator_router.so`
4. **AMM program** → `target/deploy/percolator_amm.so`
5. **Oracle program** → `target/deploy/percolator_oracle.so`

### Build on Linux/Mac

```bash
# Make executable
chmod +x build-all-bpf.sh

# Build all programs
./build-all-bpf.sh
```

### Manual Build (Individual Programs)

```bash
# Build just the Slab program
cargo-build-sbf --manifest-path programs/slab/Cargo.toml

# Build just the Router program
cargo-build-sbf --manifest-path programs/router/Cargo.toml
```

### Prerequisites

- Solana CLI tools installed
- Rust toolchain
- cargo-build-sbf (comes with Solana CLI)

Install Solana CLI:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

---

## 📁 Project Directories

### `archive/`
Contains old/unused code and experiments that are **not part of the current implementation**. This folder is kept for reference but can be safely ignored. The active codebase is in `programs/`, `api/`, and `frontend/`.

---

**Last Updated:** October 24, 2025  
**Maintainer:** Haidar  
**Original Author:** Toly
