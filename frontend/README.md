# Percolator Frontend

Modern trading interface for the Percolator perpetual DEX on Solana.

## 🚀 Quick Start

### 1. Setup Environment

After deploying your programs, run the setup script to automatically configure environment variables:

```bash
cd frontend
npm install
npm run setup
```

This will:
- Read deployed addresses from `scripts/slab-account.json` and `scripts/router-info.json`
- Generate `.env.local` with your program addresses
- Configure API endpoints

### 2. Start Development Server

```bash
npm run dev
```

Frontend will be available at **http://localhost:3001**

### 3. Connect Wallet & Trade

1. Install [Phantom Wallet](https://phantom.app/)
2. Switch to **Devnet** in wallet settings
3. Get devnet SOL from [faucet.solana.com](https://faucet.solana.com)
4. Open http://localhost:3001/trade
5. Connect your wallet
6. Place your first trade!

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx           # Landing page
│   │   ├── trade/page.tsx     # Trading interface
│   │   ├── dashboard/         # Dashboard
│   │   └── portfolio/         # Portfolio view
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives
│   │   ├── WalletProvider.tsx # Solana wallet integration
│   │   └── TransactionStatus.tsx # TX status display
│   └── lib/                   # Utilities
│       ├── program-config.ts  # Program addresses & config
│       ├── api-client.ts      # API client
│       └── utils.ts           # Helper functions
├── setup-env.js               # Auto-setup script
├── SETUP.md                   # Detailed setup guide
└── package.json
```

## 🔧 Manual Configuration

If you prefer to manually configure (instead of using `npm run setup`):

Create `.env.local`:

```bash
# Get these from scripts/slab-account.json and scripts/router-info.json

NEXT_PUBLIC_SLAB_PROGRAM_ID=SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep
NEXT_PUBLIC_SLAB_ACCOUNT=5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB
NEXT_PUBLIC_INSTRUMENT_ID=G4Um9dNaWKDwd2bhLTEX3DCLRLVWixKvZ1WdEcq6pgfN

NEXT_PUBLIC_ROUTER_PROGRAM_ID=RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr
NEXT_PUBLIC_ROUTER_REGISTRY=DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx

NEXT_PUBLIC_AUTHORITY=pErcnK9NSVQQK54BsKV4tUt8YWiKngubpJ7jxHrFtvL
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🎯 Features

### Trading Interface (`/trade`)
- **Real-time Orderbook**: Live data from on-chain Slab account
- **Reserve-Commit Workflow**:
  1. Reserve: Lock liquidity at current price
  2. Commit: Execute your reserved trade
- **Wallet Integration**: Connect Phantom, Solflare, or any Solana wallet
- **Transaction History**: View all your trades on Solscan/Explorer

### Dashboard (`/dashboard`)
- Market overview
- Price charts
- Trading volume
- Recent transactions

### Portfolio (`/portfolio`)
- Position tracking
- P&L calculation
- Balance management

## 🔐 How Transactions Work

```
User Wallet → Frontend → Backend API → Solana Programs
    ↓           ↓            ↓              ↓
  Signs TX   Builds UI   Builds TX    Slab + Router
```

**Reserve Transaction:**
1. User enters trade details (side, price, amount)
2. Frontend calls `/api/trade/reserve`
3. Backend builds Reserve instruction for Slab program
4. Frontend prompts user to sign transaction
5. Transaction sent to Solana devnet
6. Hold ID returned for commit step

**Commit Transaction:**
1. User clicks "Commit Trade" button
2. Frontend calls `/api/trade/commit` with Hold ID
3. Backend builds Commit instruction
4. User signs and broadcasts
5. Trade executed on-chain!

## 🛠️ Development

### Key Configuration Files

**`src/lib/program-config.ts`** - Central configuration:
```typescript
import { ACCOUNTS, PROGRAM_IDS, NETWORK } from '@/lib/program-config';

// Use in components:
const slabAccount = ACCOUNTS.slab;
const routerProgram = PROGRAM_IDS.router;
```

**`src/components/WalletProvider.tsx`** - Wallet integration:
- Auto-connects to devnet
- Provides `useWallet()` hook
- Handles wallet adapter UI

### Adding New Features

1. **New Page**: Create in `src/app/your-page/page.tsx`
2. **New Component**: Add to `src/components/`
3. **API Integration**: Use `src/lib/api-client.ts`
4. **Program Interaction**: Import from `program-config.ts`

### Environment Variables

All config is loaded from `.env.local` into `program-config.ts`:

```typescript
// Example usage:
import { ACCOUNTS, EXPLORERS } from '@/lib/program-config';

// Get slab account
const slab = ACCOUNTS.slab.toBase58();

// Generate explorer link
const link = EXPLORERS.solanaExplorer(slab, 'devnet');
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Render

1. Create new Web Service
2. Connect repository
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables
6. Deploy!

## 🧪 Testing

### Testing on Devnet

1. **Get devnet SOL**: [faucet.solana.com](https://faucet.solana.com)
2. **Switch wallet to devnet**: Settings → Network → Devnet
3. **Connect wallet** in app
4. **Place test trades**
5. **View transactions**: Links provided after each transaction

### Verify Programs

Check your deployed programs:
- Slab: `https://explorer.solana.com/address/5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB?cluster=devnet`
- Router: `https://explorer.solana.com/address/DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx?cluster=devnet`

## 📚 Resources

- **Solana Docs**: [docs.solana.com](https://docs.solana.com)
- **Wallet Adapter**: [github.com/solana-labs/wallet-adapter](https://github.com/solana-labs/wallet-adapter)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Web3.js**: [solana-labs.github.io/solana-web3.js](https://solana-labs.github.io/solana-web3.js/)

## 🐛 Troubleshooting

### "Failed to fetch orderbook"
**Solution**: Start backend API first
```bash
cd ../api
npm start
```

### "Connect wallet first"
**Solution**: 
1. Install Phantom wallet extension
2. Create/import wallet
3. Switch to devnet
4. Click "Select Wallet" button

### "Transaction failed"
**Solutions**:
- Check you're on devnet (not mainnet)
- Ensure sufficient SOL balance
- View transaction logs in browser console
- Check transaction on explorer (link shown after TX)

### Environment variables not loading
**Solution**:
1. Restart dev server after changing `.env.local`
2. Make sure file is named exactly `.env.local` (not `.env`)
3. Verify variables start with `NEXT_PUBLIC_`

## 📝 License

MIT License - See LICENSE file for details

---

**Built with** ❤️ **using Next.js, Solana Web3.js, and Tailwind CSS**
