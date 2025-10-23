# 🚀 New Programs Setup Guide

## ✅ What's Been Cleaned Up

All old program instances have been removed:

### 🗑️ Deleted Files:
- ❌ `router_deploy.json` - Old router deployment config
- ❌ `slab_deploy.json` - Old slab deployment config  
- ❌ `scripts/slab-account.json` - Old slab account
- ❌ `scripts/slab-payer.json` - Old slab payer

### 🔧 Updated Files:
- ✅ `api/src/services/router.ts` - Removed hardcoded program IDs
- ✅ `api/src/services/transactions.ts` - Removed hardcoded program IDs
- ✅ `api/dist/` - Rebuilt with clean configuration

### 📝 Old Program IDs (Now Removed):
- Router: `9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG`
- Slab: `6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz`
- Slab Account: `79DUPoYSvfrsHTGHUZDtb98vGA5tzKUAVQyYSxsVX8fk`

---

## 📋 Next Steps: Deploy New Programs

### Step 1: Update Program Code
1. Get your new slab and router code from Tolly
2. Replace the code in:
   - `programs/slab/src/` - New slab program
   - `programs/router/src/` - New router program

### Step 2: Build Programs
```powershell
# Build both programs
cd c:\Users\7haid\OneDrive\Desktop\percolator
.\build-bpf.ps1
```

This will create:
- `target/deploy/slab.so`
- `target/deploy/router.so`

### Step 3: Deploy Programs to Devnet
```bash
# Deploy Slab Program
solana program deploy target/deploy/slab.so

# Deploy Router Program  
solana program deploy target/deploy/router.so
```

**Save the program IDs!** You'll see output like:
```
Program Id: AbcDef123456789...
```

### Step 4: Initialize Slab
After deployment, you need to initialize the slab account:

```bash
# Use one of the initialization scripts
cd scripts
npm run init-slab
```

Or create a custom initialization transaction.

### Step 5: Update Environment Variables

#### **Local (Development):**

Create/update `api/.env`:
```env
NODE_ENV=development
PORT=3000
HOST=localhost

SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Add your new program IDs here:
ROUTER_PROGRAM_ID=YOUR_NEW_ROUTER_PROGRAM_ID
SLAB_PROGRAM_ID=YOUR_NEW_SLAB_PROGRAM_ID
SLAB_ACCOUNT=YOUR_NEW_SLAB_ACCOUNT_ID
```

#### **Production (Render.com):**

Update environment variables on https://dashboard.render.com:

**Backend Service (`percolator-api`):**
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
ROUTER_PROGRAM_ID=YOUR_NEW_ROUTER_PROGRAM_ID
SLAB_PROGRAM_ID=YOUR_NEW_SLAB_PROGRAM_ID
SLAB_ACCOUNT=YOUR_NEW_SLAB_ACCOUNT_ID
```

### Step 6: Test Locally
```powershell
# Restart API
cd api
npm start

# In another terminal, test
curl http://localhost:3000/api/health
```

### Step 7: Deploy to Production
```bash
git add .
git commit -m "Add new slab and router programs"
git push origin master
```

Then manually trigger redeploy on Render.com for both services.

---

## 🔍 Files With Old Program ID References

These files still contain references to old program IDs in **comments/documentation only**:
- `scripts/initialize-slab.ts` - Update with new program IDs
- `scripts/initialize-router.ts` - Update with new program IDs
- `scripts/init-with-phantom.ts` - Update with new program IDs
- `scripts/check-programs.ts` - Update with new program IDs
- `scripts/create-simple-slab.ts` - Update with new program IDs
- `api/src/routes/slab.ts` - May need updating
- `programs/router/src/entrypoint.rs` - Check for hardcoded IDs
- Various `.md` documentation files (safe to ignore)

You can update these scripts **after** you have your new program IDs.

---

## 🎯 Current Status

✅ **Localhost:** Working perfectly with real Hyperliquid data!
- Frontend: http://localhost:3001
- API: http://localhost:3000
- WebSocket: Connected
- Market Data: Real-time from CoinGecko + Hyperliquid

⏳ **Programs:** Ready for new deployment
- Old program instances completely removed
- API configured to use environment variables only
- Build script (`build-bpf.ps1`) ready to use

🚀 **Production:** Waiting for new program IDs
- Backend: `percolator-api` on Render
- Frontend: `percolator-frontend` on Render
- Both services ready for new environment variables

---

## 💡 Tips

1. **Keep Your Program IDs Safe:** Save them somewhere secure after deployment!
2. **Test Locally First:** Always test with new program IDs on localhost before deploying to production
3. **Solana CLI:** Make sure you have SOL in your devnet wallet:
   ```bash
   solana airdrop 2
   ```
4. **Check Program Status:**
   ```bash
   solana program show YOUR_PROGRAM_ID
   ```

---

## 🆘 Need Help?

If you run into issues:
1. Check `solana program show <program-id>` to verify deployment
2. Check `solana logs` for real-time program execution logs
3. Use the initialization scripts in `scripts/` directory
4. Check API logs for any program ID errors

---

Ready to deploy your new programs! 🎉

