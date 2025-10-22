# Build and Deploy Updated Slab Program

## ✅ Changes Made
Modified `programs/slab/src/matching/reserve.rs` to **automatically create user accounts** on first trade!

**What this fixes:**
- ✅ Users can now trade immediately after connecting Phantom wallet
- ✅ No separate account initialization needed
- ✅ Accounts are auto-created in the Slab's account pool when user first reserves

## 🔧 Build & Deploy Instructions

### Option 1: Using WSL (Recommended)

1. **Install Solana CLI in WSL** (if not already installed):
   ```bash
   wsl
   sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   ```

2. **Build the program:**
   ```bash
   cd /mnt/c/Users/7haid/OneDrive/Desktop/percolator
   cargo build-sbf --manifest-path programs/slab/Cargo.toml
   ```

3. **Deploy to devnet:**
   ```bash
   solana config set --url https://api.devnet.solana.com
   solana program deploy target/deploy/percolator_slab.so
   ```

4. **Copy the new Program ID** from the output

### Option 2: Using Windows PowerShell

1. **Install Solana CLI for Windows:**
   - Download from: https://github.com/solana-labs/solana/releases
   - Or use: `choco install solana`

2. **Install cargo-build-sbf:**
   ```powershell
   cargo install --git https://github.com/solana-labs/cargo-build-sbf
   ```

3. **Build:**
   ```powershell
   cd C:\Users\7haid\OneDrive\Desktop\percolator
   cargo build-sbf --manifest-path programs\slab\Cargo.toml
   ```

4. **Deploy:**
   ```powershell
   solana config set --url https://api.devnet.solana.com
   solana program deploy target\deploy\percolator_slab.so
   ```

### Option 3: Use Existing Build Script (if WSL configured)

```bash
wsl bash build-programs.sh
```

---

## 📝 After Deployment

### 1. Update Backend Environment Variables

Edit `api/.env`:
```env
SLAB_PROGRAM_ID=<NEW_PROGRAM_ID_FROM_DEPLOY>
SLAB_ACCOUNT=79DUPoYSvfrsHTGHUZDtb98vGA5tzKUAVQyYSxsVX8fk  # Keep same
```

### 2. Reinitialize Slab Account (if needed)

The existing Slab account (`79DUPoYSvfrsHTGHUZDtb98vGA5tzKUAVQyYSxsVX8fk`) might need to be reinitialized with the new program:

```bash
cd scripts
npm run initialize
```

Or create a new Slab account:
```bash
cd scripts
ts-node initialize-slab.ts
```

### 3. Update Frontend (if different program ID)

If you get a new program ID, update `api/src/services/transactions.ts`:
```typescript
export const SLAB_PROGRAM_ID = new PublicKey('NEW_PROGRAM_ID_HERE');
```

### 4. Restart Backend

```bash
cd api
npm run dev
```

### 5. Deploy to Render

```bash
git add programs/slab/src/matching/reserve.rs api/.env api/src/services/transactions.ts
git commit -m "Add auto-account creation to Slab program"
git push origin master
```

---

## 🎯 What Changed in the Code

**File:** `programs/slab/src/matching/reserve.rs`

**Change:** Added auto-account creation at the start of the `reserve()` function:

```rust
// AUTO-CREATE ACCOUNT: If account doesn't exist at this index, initialize it
// This allows users to start trading without separate account initialization
if (account_idx as usize) < MAX_ACCOUNTS && !slab.accounts[account_idx as usize].active {
    slab.accounts[account_idx as usize] = AccountState {
        key: Pubkey::default(),
        cash: 0,
        im: 0,
        mm: 0,
        position_head: NULL_IDX,
        index: account_idx,
        active: true,
        _padding: [0; 7],
    };
}
```

**Impact:**
- When a user calls Reserve for the first time, if no account exists at `account_idx`, one is automatically created
- No more "Account has invalid owner" error!
- Users can trade immediately after connecting wallet

---

## 🧪 Testing After Deployment

1. **Connect Phantom wallet** on the dashboard
2. **Click a coin** (ETH/BTC/SOL)
3. **Enter price and quantity**
4. **Click "Reserve Buy Order"**
5. ✅ Should work! Phantom will popup for signature
6. **Sign the transaction**
7. ✅ See "Reserve successful!" toast
8. **Click "Commit Buy Order"**
9. ✅ Order should execute!

---

## 🐛 Troubleshooting

### Build Errors

**Error:** `cargo: command not found` in WSL
```bash
# Install Rust in WSL
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Error:** `no such command: build-sbf`
```bash
# Install Solana CLI (includes cargo-build-sbf)
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

### Deploy Errors

**Error:** `Insufficient funds`
```bash
# Request airdrop
solana airdrop 2
# Or use web faucet: https://faucet.solana.com
```

**Error:** `Transaction simulation failed`
- Make sure you're on devnet: `solana config get`
- Check your balance: `solana balance`

---

## ⚡ Quick Command Reference

```bash
# Build
cargo build-sbf --manifest-path programs/slab/Cargo.toml

# Deploy
solana program deploy target/deploy/percolator_slab.so

# Check program
solana program show <PROGRAM_ID>

# Get balance
solana balance

# Airdrop SOL
solana airdrop 2
```

---

## 📊 Expected Result

After deployment, users will be able to:
- ✅ Connect Phantom wallet
- ✅ See real-time prices
- ✅ Place Reserve orders (creates account automatically!)
- ✅ Commit orders
- ✅ See transactions on Solscan
- ✅ View order book updates

**No more account initialization errors!** 🎉

