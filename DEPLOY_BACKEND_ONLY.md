# 🔧 Deploy Backend API Only (10 Minutes)

Your frontend is already live! Now let's deploy your backend API so it can connect.

---

## 🚀 **Quick Deploy to Render.com** (Recommended - Free)

### Step 1: Login to Render (2 min)

1. Go to: https://dashboard.render.com/
2. Sign up/Login (free, no credit card needed)
3. Connect your GitHub account

---

### Step 2: Create Web Service (2 min)

1. Click **"New +"** → **"Web Service"**
2. Connect your `percolator` GitHub repository
3. Click **"Connect"**

---

### Step 3: Configure Backend (3 min)

**Basic Settings:**
```
Name: percolator-api
Region: Oregon (or closest to you)
Branch: master
Root Directory: api
Environment: Node
```

**Build & Start:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

**Instance Type:**
```
Plan: Free
```

---

### Step 4: Add Environment Variables (3 min)

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SLAB_PROGRAM_ID=6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz
ROUTER_PROGRAM_ID=9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG
```

**Optional (add if you know your frontend URL):**
```bash
FRONTEND_URL=https://your-frontend-url.com
```

---

### Step 5: Deploy! (5 min)

1. Click **"Create Web Service"**
2. Wait for build (takes ~5 minutes)
3. You'll see build logs in real-time

**When done, you'll get a URL like:**
```
https://percolator-api.onrender.com
```

**Or something like:**
```
https://percolator-api-xyz123.onrender.com
```

---

### Step 6: Test Your Backend (1 min)

Open in browser or use curl:

```bash
https://YOUR-BACKEND-URL.onrender.com/api/health
```

**You should see:**
```json
{
  "status": "healthy",
  "solana": {
    "network": "devnet",
    "connected": true
  }
}
```

✅ **If you see this, your backend is LIVE!**

---

## 🔗 **Connect Your Frontend to Backend**

Now update your live frontend to use the new backend.

### Option A: If using Vercel/Netlify

1. Go to your frontend dashboard
2. Find **"Environment Variables"** or **"Settings"**
3. Add/Update:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com/ws
   ```
4. **Redeploy** frontend

### Option B: If using Render for Frontend

1. Go to your frontend service in Render
2. Click **"Environment"** tab
3. Edit these variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com/ws
   ```
4. Click **"Save Changes"** (auto-redeploys)

---

## ✅ **Test Everything**

Visit your live frontend dashboard:

```
https://your-frontend-url.com/dashboard
```

**Check these:**
- [ ] Prices load (BTC/ETH/SOL) ✅
- [ ] Charts display ✅
- [ ] Orderbook shows bids/asks ✅
- [ ] Connect wallet works ✅
- [ ] Click "Reserve" → Phantom opens ✅

**If all work, you're done!** 🎉

---

## 🐛 **Troubleshooting**

### Build Failed?

**Check logs in Render dashboard for errors.**

Common fixes:
```bash
# Make sure package.json has these scripts:
"build": "tsc"
"start": "node dist/index.js"
```

### Can't Connect from Frontend?

**Check CORS settings:**

Your backend already has CORS configured for `*.onrender.com` domains!

If using custom domain, add it to `api/src/index.ts`:
```typescript
const allowedOrigins = [
  'https://your-custom-domain.com', // Add this
  'https://percolator-frontend.onrender.com',
  // ... existing origins
];
```

### 404 Errors?

Make sure you're calling the right endpoints:
```
✅ https://your-api.onrender.com/api/health
✅ https://your-api.onrender.com/api/market/list
❌ https://your-api.onrender.com/health (missing /api/)
```

### WebSocket Not Working?

Use `wss://` (not `ws://`) for HTTPS sites:
```
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com/ws
```

---

## 💰 **Free Tier Details**

**Render Free Plan:**
- ✅ 750 hours/month (enough for hobby projects)
- ✅ Automatic SSL (HTTPS)
- ✅ Auto-deploy from GitHub
- ⚠️ Sleeps after 15 min inactivity
- 🔄 Wakes in ~30 seconds on first request

**To keep awake (optional):**
- Upgrade to Starter: $7/month
- Or use a "ping" service (UptimeRobot)

---

## 📝 **Your URLs**

After deployment, save these:

```yaml
Backend API: https://________________________________.onrender.com

Endpoints:
  Health:      /api/health
  Markets:     /api/market/list
  Orderbook:   /api/market/ETH-PERP/orderbook
  Reserve:     /api/trade/reserve
  Commit:      /api/trade/commit
  WebSocket:   wss://YOUR-URL.onrender.com/ws
```

---

## 🎉 **You're Done!**

Your backend is live and your frontend can now:
- ✅ Fetch real-time prices from CoinGecko
- ✅ Display orderbook data
- ✅ Connect to Phantom wallet
- ✅ Build Reserve/Commit transactions
- ✅ Use WebSocket for live updates

**Next step:** Initialize programs (get 75 SOL) for real on-chain trading!

---

## 🆘 **Quick Reference**

**Deploy Backend:**
1. Render → New Web Service
2. Root: `api`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add env vars
6. Deploy!

**Update Frontend:**
1. Add `NEXT_PUBLIC_API_URL`
2. Add `NEXT_PUBLIC_WS_URL`
3. Redeploy

**Test:**
1. Visit `/api/health`
2. Check dashboard
3. Try trading!

---

**Your DEX is now fully operational! 🚀**

