# Deploy Updated Slab Program - Manual Steps

## Current Situation

- ✅ Code modified with auto-account creation
- ✅ Compilation errors fixed (Pubkey import, NULL_IDX → u32::MAX)
- ❌ Program not yet deployed (still seeing old error)

## 🚀 Deploy Right Now - Simple Steps

### Method 1: WSL (Copy-Paste These Commands)

Open WSL terminal and paste these commands one by one:

```bash
# Step 1: Set PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Step 2: Go to project
cd /mnt/c/Users/7haid/OneDrive/Desktop/percolator

# Step 3: Build
cargo build-sbf --manifest-path programs/slab/Cargo.toml

# Step 4: Set to devnet
solana config set --url https://api.devnet.solana.com

# Step 5: Deploy
solana program deploy target/deploy/percolator_slab.so

# COPY THE PROGRAM ID FROM OUTPUT!
```

**After running, you'll see:**
```
Program Id: 6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz
```

If it's the SAME ID → Perfect! Just wait 2 minutes for RPC cache to update.

If it's a DIFFERENT ID → Update backend config (see below).

---

## If Program ID Changes

### Update Backend

**File: `api/src/services/transactions.ts`**

Find line ~17 and update:
```typescript
export const SLAB_PROGRAM_ID = new PublicKey(
  process.env.SLAB_PROGRAM_ID || 'PUT_NEW_PROGRAM_ID_HERE'
);
```

### Restart Backend
```bash
# Stop current backend (Ctrl+C in the terminal running it)
# Then:
cd api
npm run dev
```

### Reinitialize Slab Account

Since you have a new program, you need a new Slab account:

```bash
cd scripts
npx tsx initialize-slab.ts
```

**Copy the new Slab account address** from output, then update:

**File: `api/src/services/transactions.ts`**
```typescript
export const SLAB_ACCOUNT = new PublicKey(
  process.env.SLAB_ACCOUNT || 'PUT_NEW_SLAB_ACCOUNT_HERE'
);
```

Restart backend again.

---

## Alternative: Quick POC Test Without Deployment

If deployment is having issues, here's a SUPER QUICK workaround to test the UI:

### Make Backend Return Success (Mock Mode)

**File: `api/src/routes/trading.ts`**

At the very top of the `/reserve` endpoint (line ~101), add:

```typescript
tradingRouter.post('/reserve', async (req, res) => {
  // TEMP: Mock success for UI testing
  return res.json({
    success: true,
    needsSigning: false,
    holdId: Math.floor(Math.random() * 1000000),
    vwapPrice: req.body.price,
    worstPrice: req.body.price,
    maxCharge: req.body.price * req.body.quantity,
    message: 'Mock Reserve - UI test mode'
  });
  
  // ... rest of actual code
```

And for `/commit`:

```typescript
tradingRouter.post('/commit', async (req, res) => {
  // TEMP: Mock success for UI testing  
  return res.json({
    success: true,
    needsSigning: false,
    signature: '1111111111111111111111111111111111111111111111111111111111111111',
    message: 'Mock Commit - UI test mode'
  });
  
  // ... rest of actual code
```

This lets you test the full UI flow without blockchain interaction.

---

## 📊 Verification

### After Deployment, Test:

1. **Refresh browser** (Ctrl + Shift + R)
2. **Connect Phantom**
3. **Try trade:**
   - Price: 3850 (ETH price)
   - Amount: 0.01
   - Click Reserve

4. **Check console logs:**
   - If you see: `"Program log: Instruction: Reserve"` → Program is running
   - If you see: `"Program log: Error: Account has invalid owner"` → Old code (wait longer or check deployment)
   - If you see: `"Reserve successful"` → NEW CODE WORKING! ✅

---

## 🎯 Expected Timeline

- **Deploy command:** 30 seconds
- **RPC propagation:** 2-5 minutes
- **Total:** ~5 minutes from deploy to working

Be patient - Solana RPC caching is real!

---

## 🆘 If Still Having Issues

The fastest path forward:

1. **Use mock mode** (see Alternative above) to test UI
2. **Separately debug deployment** in WSL
3. **Once deployed, switch back to real mode**

This way you can continue working on the UI/UX while sorting out the deployment!

---

**Run those WSL commands now and let's get this deployed!** 🚀

