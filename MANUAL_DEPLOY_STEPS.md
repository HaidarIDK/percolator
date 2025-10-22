# Manual Deployment Steps

The auto-account creation code has been added to the Slab program, but we're having issues with automated deployment output capture. Here's how to manually complete the deployment:

## 🔧 Option 1: Deploy via WSL (Recommended)

### Step 1: Open WSL Terminal
```bash
wsl
```

### Step 2: Set Solana PATH and Config
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana config set --url https://api.devnet.solana.com
```

### Step 3: Navigate to Project
```bash
cd /mnt/c/Users/7haid/OneDrive/Desktop/percolator
```

### Step 4: Deploy the Slab Program
```bash
solana program deploy target/deploy/percolator_slab.so
```

**IMPORTANT: Copy the Program ID from the output!**

It will look like:
```
Program Id: AbC123...XyZ
```

### Step 5: If You Get a New Program ID

If the Program ID changed, update these files:

**File: `api/src/services/transactions.ts`**
```typescript
export const SLAB_PROGRAM_ID = new PublicKey(
  process.env.SLAB_PROGRAM_ID || 'NEW_PROGRAM_ID_HERE'
);
```

**File: `api/.env` (create if doesn't exist)**
```env
SLAB_PROGRAM_ID=NEW_PROGRAM_ID_HERE
SLAB_ACCOUNT=79DUPoYSvfrsHTGHUZDtb98vGA5tzKUAVQyYSxsVX8fk
```

### Step 6: Reinitialize Slab Account (if new program ID)

If you got a new program ID, you need to create a new Slab account:

```bash
cd scripts
npm install
ts-node initialize-slab.ts
```

Copy the new Slab account address and update:
- `api/.env` → `SLAB_ACCOUNT=NEW_SLAB_ACCOUNT_HERE`
- `api/src/services/transactions.ts` → `SLAB_ACCOUNT`

### Step 7: Restart Backend
```bash
cd ../api
npm run dev
```

### Step 8: Test Trading!
- Refresh dashboard
- Connect Phantom
- Try placing a trade
- ✅ Should work!

---

## 🔧 Option 2: Check if Current Deployment Works

The program might have deployed successfully but we're just not seeing the output. Try trading again:

1. **Hard refresh your browser** (Ctrl + Shift + R)
2. **Connect Phantom wallet**
3. **Try placing a trade**
4. **Check if the error changed**

If it works → Great! If not → Follow Option 1 above.

---

## 🐛 Debugging Steps

### Check if Program is Deployed
```bash
wsl
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana program show 6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz --url https://api.devnet.solana.com
```

You should see:
- Program Id: 6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz
- Owner: BPFLoaderUpgradeable...
- ProgramData Address: ...
- Authority: <your keypair>
- Last Deployed In Slot: ...
- Data Length: ... bytes

### Check Slab Account Owner
```bash
solana account 79DUPoYSvfrsHTGHUZDtb98vGA5tzKUAVQyYSxsVX8fk --url https://api.devnet.solana.com
```

Should show:
- Owner: 6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz

### Get Program Deploy Logs
```bash
solana confirm 4hCnjpDTwjhceBAMp9NsgcMWM4s6HUg3stqyzszJ3vJqk5nimSt9MXMA6z1kPQ1jgBX9Ntt9QPC34DcsUHUVeRSH --url https://api.devnet.solana.com
```

---

## 💡 Alternative: Use Solana Playground

If WSL is having issues:

1. Go to https://beta.solpg.io
2. Upload `programs/slab/src/**` files
3. Build in browser
4. Deploy from browser
5. Copy new Program ID
6. Update backend configuration

---

## 📝 What Should Happen

Once deployed correctly, when a user tries to trade:

### In the Program (NEW CODE):
```rust
// At the start of reserve() function in reserve.rs:
if (account_idx as usize) < MAX_ACCOUNTS && !slab.accounts[account_idx as usize].active {
    // Auto-create account! ✨
    slab.accounts[account_idx as usize] = AccountState {
        key: Pubkey::default(),
        cash: 0,
        im: 0,
        mm: 0,
        position_head: NULL_IDX,
        index: account_idx,
        active: true,  // ← This fixes the error!
        _padding: [0; 7],
    };
}
```

### Result:
- ✅ No more "Account has invalid owner" error
- ✅ Trading works immediately
- ✅ Account persists for future trades

---

## 🎯 Quick Verification

To test if the update worked, try this in your browser console after attempting a trade:

If you see in the logs:
- `Program log: Instruction: Reserve`
- `Program log: Error: Account has invalid owner`

Then the OLD code is still running (upgrade didn't work).

If you see:
- `Program log: Instruction: Reserve`
- `Program log: Reserve successful` (or different error)

Then the NEW code is running! ✅

---

Need help? The deployment commands are all in this file!

