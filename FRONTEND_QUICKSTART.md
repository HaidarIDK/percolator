# Frontend Quick Start Guide

## ✅ Your Programs Are Deployed!

**Slab Account**: `5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB`
**Router Registry**: `DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx`

Now let's get the frontend running so people can trade!

---

## 🚀 3-Step Setup

### Step 1: Setup Frontend Environment

```bash
cd frontend
npm install
npm run setup
```

This automatically reads your deployed addresses and creates `.env.local`

### Step 2: Start the Frontend

```bash
npm run dev
```

Frontend runs at: **http://localhost:3001**

### Step 3: Start the Backend API (if not running)

Open a new terminal:

```bash
cd api
npm install
npm start
```

API runs at: **http://localhost:3000**

---

## 🎉 You're Ready!

Open http://localhost:3001/trade and:

1. **Install Phantom Wallet** ([phantom.app](https://phantom.app))
2. **Switch to Devnet** in wallet settings
3. **Get SOL** from [faucet.solana.com](https://faucet.solana.com)
4. **Connect Wallet** (click button in top right)
5. **Place Your First Trade!**

---

## 📋 What You Can Do Now

### Trading (`/trade`)
- View live orderbook from your Slab account
- Place Buy/Sell orders
- Use Reserve-Commit workflow
- See transactions on Solana Explorer

### Dashboard (`/dashboard`)
- Monitor market activity
- View price charts
- Track trading volume

### Portfolio (`/portfolio`)
- View your positions
- Track P&L
- Manage balances

---

## 🔍 Verify Your Deployment

### View on Solana Explorer:

**Slab Account:**
https://explorer.solana.com/address/5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB?cluster=devnet

**Router Registry:**
https://explorer.solana.com/address/DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx?cluster=devnet

**Slab Program:**
https://explorer.solana.com/address/SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep?cluster=devnet

**Router Program:**
https://explorer.solana.com/address/RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr?cluster=devnet

---

## 💡 How Trading Works

### Reserve-Commit Workflow

**Step 1: Reserve**
- User specifies: BUY or SELL, price, amount
- Frontend builds Reserve transaction
- User signs with wallet
- Liquidity locked at current price
- Hold ID returned

**Step 2: Commit**
- User clicks "Commit Trade"
- Frontend builds Commit transaction with Hold ID
- User signs with wallet
- Trade executed on-chain!
- View transaction on explorer

### Under the Hood

```
┌──────────┐    ┌──────────┐    ┌─────────┐    ┌──────────────┐
│ Frontend │───▶│ Backend  │───▶│ Solana  │───▶│ Your Slab    │
│ (React)  │◀───│ API      │◀───│ Network │◀───│ Program      │
└──────────┘    └──────────┘    └─────────┘    └──────────────┘
     │                │
   Signs            Builds
   TX               TX
```

1. **Frontend** displays UI, fetches orderbook
2. **Backend API** builds program instructions
3. **User's Wallet** signs transactions
4. **Solana Network** executes on-chain
5. **Slab Program** updates orderbook state

---

## 🛠️ Troubleshooting

### Frontend won't start
```bash
# Make sure you're in the frontend directory
cd frontend
npm install
npm run setup
npm run dev
```

### "Failed to fetch orderbook"
```bash
# Start the backend API
cd api
npm install
npm start
```

### "Connect wallet first"
1. Install Phantom wallet browser extension
2. Switch wallet to **Devnet** (Settings → Network)
3. Click "Select Wallet" button in app

### "Insufficient balance"
- Get devnet SOL: https://faucet.solana.com
- Paste your wallet address (shown after connecting)
- Wait for airdrop (usually instant)

### Transaction fails
1. Check browser console for errors
2. View transaction on explorer (link shown after TX)
3. Verify you're on devnet (not mainnet!)
4. Ensure sufficient SOL balance

---

## 📂 Project Structure

```
percolator/
├── frontend/           ← Frontend (Next.js)
│   ├── src/
│   │   ├── app/       ← Pages (trade, dashboard, etc)
│   │   ├── components/← React components
│   │   └── lib/       ← Config & utilities
│   ├── setup-env.js   ← Auto-setup script
│   └── .env.local     ← Environment variables (auto-generated)
│
├── api/               ← Backend API (Express)
│   └── src/
│       └── routes/    ← API endpoints (/trade/reserve, /trade/commit)
│
├── scripts/           ← Deployment scripts
│   ├── slab-account.json      ← Your deployed slab info
│   └── router-info.json       ← Your deployed router info
│
└── programs/          ← Solana programs (Rust)
    ├── slab/          ← Order book program
    └── router/        ← Cross-margin routing program
```

---

## 🎯 Next Steps

### For Development:
1. **Customize UI**: Edit `frontend/src/app/trade/page.tsx`
2. **Add Features**: Create new components in `frontend/src/components/`
3. **Integrate APIs**: Use `frontend/src/lib/api-client.ts`

### For Production:
1. **Deploy Programs** to mainnet-beta
2. **Update .env.local** with mainnet addresses
3. **Deploy Frontend** to Vercel/Render
4. **Deploy Backend** API server

### Share Your DEX:
- Share the frontend URL
- Users just need: Solana wallet + SOL
- No signup required!

---

## 📚 Documentation

- **Frontend Setup**: `frontend/SETUP.md`
- **Frontend README**: `frontend/README.md`
- **API Endpoints**: `api/ENDPOINTS.md`
- **Architecture**: `ARCHITECTURE_FLOW_COMPLETE.md`

---

## 🎉 Success Checklist

- [x] Programs deployed to devnet
- [x] Slab initialized
- [x] Router initialized
- [ ] Frontend running (`npm run dev`)
- [ ] Backend API running (`npm start`)
- [ ] Wallet connected
- [ ] First trade executed

---

**Need Help?**
- Check browser console for errors
- View transactions on Solscan/Explorer
- Read detailed docs in `frontend/SETUP.md`

**Ready to Trade!** 🚀
Open http://localhost:3001/trade

