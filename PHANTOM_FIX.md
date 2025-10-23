# Fix Phantom "Request Blocked" Error

Phantom wallet blocks HTTP connections for security. Here are 3 solutions:

---

## ✅ Option 1: Use HTTPS (Recommended)

Your frontend already supports HTTPS!

### Stop the current frontend:
Press `Ctrl+C` in the terminal running the frontend

### Start with HTTPS:
```bash
cd frontend
npm run dev:https
```

Then open: **https://localhost:3001/trade**

(You'll see a security warning - click "Advanced" → "Proceed to localhost")

---

## ✅ Option 2: Configure Phantom to Trust Localhost

1. **Open Phantom wallet**
2. **Click Settings** (gear icon)
3. **Go to "Security & Privacy"**
4. **Find "Trusted Apps"** or **"Developer Settings"**
5. **Add** `http://localhost:3001` to trusted sites
6. **Refresh the page**

---

## ✅ Option 3: Use Phantom's Developer Mode

1. **Open Phantom wallet**
2. **Click Settings** → **Developer Settings**
3. **Enable "Testnet Mode"**
4. **Enable "Developer Mode"** (if available)
5. **Refresh the browser**
6. **Try connecting again**

---

## 🔧 Alternative: Use Solflare Wallet

If Phantom continues blocking:

1. **Install Solflare** wallet extension
2. **Create/Import wallet**
3. **Switch to Devnet** in settings
4. **Connect on your site**

Solflare is more permissive with localhost connections!

---

## ✅ Quick Fix (Easiest)

**Just run with HTTPS:**

```powershell
cd C:\Users\7haid\OneDrive\Desktop\percolator\frontend
npm run dev:https
```

Then visit: **https://localhost:3001/trade**

(Accept the self-signed certificate warning)

---

## ℹ️ Why This Happens

Phantom wallet blocks:
- HTTP connections (only allows HTTPS)
- Untrusted origins
- Cross-origin requests

This is for your security to prevent malicious sites from stealing your wallet!

---

**Try Option 1 (HTTPS) first - it's the fastest solution!** 🚀

