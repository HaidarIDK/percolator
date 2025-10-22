# Full Architecture Implementation Plan

## Current Blocker: Slab Program Deployment

The auto-account creation code is written but having deployment issues in WSL. 

**Temporary Solution:** Implement the full Router architecture in parallel, which will work around the account initialization issue by using the Router's portfolio management system.

---

## Phase 1: Router Program Integration (Solves Account Issue!)

The Router program manages user portfolios and handles account initialization automatically. This is actually the PROPER architecture and will bypass the current Slab account issue.

### Why Router Solves Our Problem:

1. **Router manages user portfolios** - Each user has a Portfolio account owned by the Router
2. **Router calls Slab via CPI** - The Router is authorized to interact with Slab
3. **No manual account initialization needed** - Portfolio creation happens on first deposit
4. **Cross-margin benefits** - Users can trade across multiple slabs with shared collateral

### Implementation Steps:

#### Step 1: Portfolio Initialization
- User deposits USDC collateral
- Router creates Portfolio account (PDA)
- Portfolio tracks: cash balance, positions across all slabs, margin requirements

#### Step 2: Trading Flow
- User clicks "Buy ETH"  
- Frontend calls `/api/router/execute-cross-slab`
- Backend builds ExecuteCrossSlab transaction
- Router splits order across slabs
- Router calls Slab.commit_fill via CPI
- Portfolio updated with net positions

#### Step 3: Real-time Updates
- WebSocket monitors Router and Slab events
- Parses fill receipts
- Streams to frontend
- Updates order book and activity feed

---

## Implementation Roadmap

### ✅ Already Complete
- Slab program deployed (basic version)
- Router program deployed
- Frontend UI (dashboard, trade panel, order book)
- Backend API structure
- WebSocket server foundation

### 🔄 In Progress
- Auto-account creation (deployment issues)
- Slab program updates

### 📋 To Implement

#### 1. Router Integration (Priority 1)
**Files to modify:**
- `api/src/services/router.ts` - Router transaction builders
- `api/src/routes/router.ts` - Router API endpoints
- `frontend/src/app/dashboard/page.tsx` - Use Router flow instead of direct Slab

**New Endpoints:**
- `POST /api/router/deposit` - Deposit USDC collateral
- `POST /api/router/withdraw` - Withdraw collateral
- `POST /api/router/execute` - Execute cross-slab trade
- `GET /api/router/portfolio/:wallet` - Get user portfolio

#### 2. Portfolio Management
**Frontend changes:**
- Add "Deposit Collateral" button
- Show portfolio balance, margin, positions
- Display cross-margin health

**Backend:**
- Build deposit/withdraw transactions
- Calculate margin requirements
- Track portfolio state

#### 3. Cross-Slab Execution
**Trading flow:**
```
User: Click "Buy 1 ETH"
  ↓
Frontend: POST /api/router/execute
  ↓
Backend: Build ExecuteCrossSlab tx
  ↓
Router Program: Split across slabs
  ↓
Router→Slab CPI: Execute fills
  ↓
Router: Update portfolio
  ↓
Frontend: Show success + Solscan link
```

#### 4. WebSocket Streaming
**Real-time updates:**
- Subscribe to Router portfolio account changes
- Subscribe to Slab state changes
- Parse fill receipts
- Stream to frontend

---

## Quick Win: Implement Router Deposit Flow

This will allow users to:
1. Connect wallet
2. Deposit USDC collateral (creates portfolio automatically)
3. See their balance
4. THEN implement trading (which will work because Router handles account setup)

### Code to Add:

**Backend: `api/src/services/router.ts`**
```typescript
export function buildDepositInstruction(params: {
  routerAccount: PublicKey;
  portfolioAccount: PublicKey;
  userAuthority: PublicKey;
  usdcMint: PublicKey;
  userUsdcAccount: PublicKey;
  vaultUsdcAccount: PublicKey;
  amount: number;
}): TransactionInstruction {
  // Build Router Deposit instruction
  // Creates Portfolio account if doesn't exist
  // Transfers USDC from user to vault
  // Updates portfolio.cash balance
}
```

**Frontend: Add to dashboard**
```tsx
<button onClick={handleDeposit}>
  💰 Deposit Collateral
</button>
```

---

## Decision Point

### Option A: Continue Debugging Slab Deployment
- Fix WSL cargo-build-sbf issues
- Deploy updated Slab with auto-create
- Simpler short-term
- But doesn't get us full architecture

### Option B: Implement Router Integration (Recommended)
- Skip direct Slab interaction
- Use proper Router → Slab architecture
- Solves account issue automatically
- Gets us to production architecture faster
- More work upfront, but correct design

---

## Recommendation

**Implement Router integration** because:
1. ✅ Bypasses current Slab account initialization issue
2. ✅ Proper production architecture
3. ✅ Enables cross-margin trading
4. ✅ Better user experience (deposit → trade)
5. ✅ Scales to multiple slabs/markets

We can debug the direct Slab trading later for advanced users, but the Router flow is the main user journey.

---

## Next Steps

Would you like me to:

**A)** Continue debugging Slab deployment (might take more time with WSL issues)

**B)** Start implementing Router integration (deposit collateral → execute cross-slab trades)

**C)** Create a hybrid: Simple mock mode for UI testing while implementing Router in parallel

Let me know and I'll proceed! 🚀

