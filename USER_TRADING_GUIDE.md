# Percolator DEX - User Trading Guide

## Welcome to Percolator DEX!

Your trading platform is now fully operational with Router-based portfolio management. Here's everything you need to know to start trading.

---

## Quick Start (3 Steps to Trade)

### 1. Get Devnet SOL (Free Test Money)
- Click **"Get SOL"** button (top right, blue)
- OR visit: https://faucet.solana.com
- You'll receive 2 SOL for testing

### 2. Deposit Collateral
- Click **"Deposit Collateral"** button (top right, purple)
- Enter amount: **1** SOL
- Click **"Deposit 1 SOL"**
- Sign with Phantom wallet
- Wait for confirmation (5-10 seconds)
- See your balance appear: "Portfolio Balance: 1.0000 SOL"

### 3. Start Trading!
- Select coin: **ETH**, **BTC**, or **SOL**
- Enter price or click the price button for market price
- Enter quantity (e.g., **0.01**)
- Click **"Reserve Buy Order"** (or Sell)
- Sign with Phantom
- Trade executes!

---

## Dashboard Overview

### Top Bar (Header)
```
[Percolator] [Live]    [Portfolio: X SOL] [Deposit] [Wallet] [Get SOL]
```

- **Percolator** - Logo + status indicator
- **Portfolio Balance** - Your collateral (appears after deposit)
- **Deposit Collateral** - Add more SOL to trade
- **Wallet** - Connect/disconnect Phantom
- **Get SOL** - Request devnet SOL from faucet

### Trading Mode Toggle
- **Simple Trading** - Direct execution (default)
- **Cross-Slab Router** - Advanced multi-slab routing

### Main Trading Area
```
┌─────────────────┬──────────────────────┬─────────────────┐
│                 │                      │                 │
│   Order Book    │   TradingView Chart  │   Trade Panel   │
│   (Live Data)   │   [ETH] [BTC] [SOL]  │   (Simplified)  │
│                 │   Real-time prices   │                 │
│                 │                      │                 │
└─────────────────┴──────────────────────┴─────────────────┘
                    Market Ticker Bar
```

**Left:** Live order book from blockchain
**Center:** TradingView chart with coin selector
**Right:** Trading panel (buy/sell, price, quantity)

---

## Trading Panel Guide

### Controls

**Buy/Sell Toggle**
- Green = Buy
- Red = Sell
- Click to switch

**Price Input**
- Enter custom price
- Or click price button for market price
- Auto-updates when you switch coins

**Amount Input**
- Enter quantity to trade
- Minimum: 0.01

**Order Type**
- Limit Order (default)
- Market Order

**Submit Button**
- Shows current action:
  - "Reserve Buy Order" (first click)
  - "Commit Buy Order" (second click)
- Disabled if wallet not connected or fields empty
- Shows loading spinner while processing

**Wallet Info**
- Shows connected wallet address (abbreviated)
- Appears when wallet is connected

---

## How Deposits Work

### Creating Your Portfolio

When you deposit for the first time:

1. **Router program creates Portfolio account** (PDA)
   - Address is deterministic based on your wallet
   - Example: `6Nb5KUEDhNqF4DWjUs3Ya84Xc94CAGQumGCcYEZfejXB`

2. **SOL transferred** from your wallet to Portfolio account

3. **Portfolio initialized** with:
   - Cash balance: Your deposit amount
   - Positions: Empty (until you trade)
   - Margin: Calculated as you trade
   - Authority: Your wallet address

4. **Portfolio appears** in top bar of dashboard

### Adding More Collateral

Subsequent deposits:
- Click "Deposit Collateral" again
- Enter amount
- Portfolio balance increases
- More buying power for trading!

---

## How Trading Works

### Reserve-Commit Flow (Two-Phase)

**Phase 1: Reserve**
- Click "Reserve Buy Order"
- Router checks your portfolio has sufficient collateral
- Locks liquidity from order book
- Returns: hold_id, vwap_price, max_charge
- Button changes to: "Commit Buy Order"

**Phase 2: Commit**
- Click "Commit Buy Order"  
- Executes the reserved order
- Updates your portfolio with new position
- Shows success + Solscan link

### Router → Slab Flow

Behind the scenes:
```
1. You click "Reserve Buy"
2. Frontend → Backend API
3. Backend builds ExecuteCrossSlab instruction
4. You sign with Phantom
5. Transaction → Router Program
6. Router validates portfolio
7. Router CPIs to Slab Program
8. Slab matches order
9. Slab executes fills
10. Slab returns receipt to Router
11. Router updates your portfolio
12. Transaction confirmed!
13. You see success message
```

---

## Understanding Your Portfolio

### Portfolio Display (Top Bar)

**Portfolio Balance: X.XXXX SOL**
- Total collateral you've deposited
- Updates in real-time
- Refreshes every 10 seconds

### Portfolio Components (Full View)

**Equity**
- Total value of your portfolio
- = Cash + Unrealized PnL

**Collateral**
- Total SOL deposited
- Base for margin calculations

**Free Collateral**
- Available for new trades
- = Equity - Initial Margin Required

**Leverage**
- Current leverage ratio
- Position value / Collateral

**Health**
- Portfolio health percentage
- 100% = Safe, 0% = Liquidation risk

---

## Coin Selection

### Available Markets

**ETH (Blue)**
- Symbol: ETH/USDC
- Typical price: $3,850
- Minimum: 0.001 ETH

**BTC (Orange)**
- Symbol: BTC/USDC
- Typical price: $108,000
- Minimum: 0.0001 BTC

**SOL (Purple)**
- Symbol: SOL/USDC
- Typical price: $185
- Minimum: 0.01 SOL

**Click the coin pills** to switch markets instantly!

---

## Order Book

### Reading the Order Book

**Asks (Red) - Sell Orders**
- Price | Quantity | Total
- Higher prices at bottom
- These are sell orders you can buy from

**Mid Price (White)**
- Current market price
- = (Best Ask + Best Bid) / 2

**Bids (Green) - Buy Orders**
- Price | Quantity | Total
- Higher prices at top
- These are buy orders you can sell to

### Status Indicators

**On-Chain** (green dot)
- Order book is live from blockchain
- Updates every 5 seconds

**Offline** (red dot)
- Can't connect to blockchain
- Using cached data

---

## Fees

### Transaction Fees

**Network Fee (SOL)**
- ~0.000005 SOL per transaction
- Paid to Solana validators

**Protocol Fee (Trading)**
- 0.02% of trade value
- Example: Trade $100 worth → $0.02 fee

### Example Trade Costs

**Buy 0.01 ETH @ $3,850:**
- Position value: $38.50
- Protocol fee: $0.0077
- Network fee: ~$0.0009 (in SOL)
- **Total cost:** ~$0.01

---

## Troubleshooting

### "Connect wallet to trade"
- Click the wallet button
- Select Phantom
- Approve connection

### "Portfolio not created yet"
- You need to deposit collateral first
- Click "Deposit Collateral"
- Deposit at least 0.01 SOL

### "Insufficient collateral"
- Your portfolio doesn't have enough SOL
- Deposit more collateral
- Or reduce trade size

### "Transaction failed: Blockhash not found"
- Transaction took too long
- Try again (uses fresh blockhash now)

### "Simulation failed"
- Program might need updating
- Contact support or check BUILD_AND_DEPLOY.md

---

## Advanced Features

### Cross-Slab Router Mode

Click "Cross-Slab Router" toggle to enable:
- Multi-slab order routing
- Optimized execution across markets
- Best price discovery
- Advanced routing algorithms

(Coming soon - UI already in place!)

---

## Safety & Security

### Your Funds
- SOL deposited to Portfolio PDA (program-owned account)
- Only you can withdraw (requires your signature)
- Portfolio address is deterministic
- No custody - you control via wallet signature

### Transactions
- All transactions require Phantom signature
- You can reject any transaction
- Review details before signing
- Check Solscan links after confirmation

### Devnet Testing
- This is TESTNET (not real money!)
- Free SOL from faucet
- Practice without risk
- Learn the interface

---

## Support & Resources

### Documentation
- `ROUTER_TRADING_GUIDE.md` - Technical architecture
- `ROUTER_IMPLEMENTATION_COMPLETE.md` - Implementation details
- `BUILD_AND_DEPLOY.md` - Deployment guide

### Blockchain Explorers
- **Your Slab:** https://explorer.solana.com/address/79DUPoYSvfrsHTGHUZDtb98vGA5tzKUAVQyYSxsVX8fk?cluster=devnet
- **Router Program:** https://explorer.solana.com/address/9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG?cluster=devnet
- **Slab Program:** https://explorer.solana.com/address/6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz?cluster=devnet

### Useful Links
- **Devnet Faucet:** https://faucet.solana.com
- **Solana Docs:** https://docs.solana.com
- **Phantom Wallet:** https://phantom.app

---

## Summary

You now have a fully functional DEX with:
- Portfolio management
- Collateral deposits
- Live trading
- Real-time data
- Clean, professional UI
- Router-based architecture

**Just open the dashboard and start trading!**

http://localhost:3001/dashboard

Happy trading!

