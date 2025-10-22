# ✅ Deployment Checklist

## 📦 What You're Deploying

```
┌─────────────────────────────────────────────┐
│  BACKEND (Node.js/Express)                  │
│  ├── Market Data API (CoinGecko)            │
│  ├── Trading API (Reserve/Commit)           │
│  ├── WebSocket Server                       │
│  └── Solana Integration                     │
└─────────────────────────────────────────────┘
                    ↓ HTTP/WSS
┌─────────────────────────────────────────────┐
│  FRONTEND (Next.js)                         │
│  ├── Dashboard UI                           │
│  ├── TradingView Charts                     │
│  ├── Phantom Wallet Integration             │
│  └── Order Entry Panel                      │
└─────────────────────────────────────────────┘
```

---

## 🎯 Pre-Deployment

- [ ] Code tested locally
- [ ] `npm run build` works in `/api`
- [ ] `npm run build` works in `/frontend`
- [ ] Code pushed to GitHub
- [ ] GitHub repository is public (or Render has access)

---

## 🔧 Backend Deployment (Render.com)

### Step 1: Create Backend Service
- [ ] Login to https://dashboard.render.com/
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repo
- [ ] Select `percolator` repository

### Step 2: Configure Backend
```
✅ Name: percolator-api
✅ Root Directory: api
✅ Environment: Node
✅ Build Command: npm install && npm run build
✅ Start Command: npm start
✅ Plan: Free
```

### Step 3: Environment Variables
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SLAB_PROGRAM_ID=6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz
ROUTER_PROGRAM_ID=9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG
```

### Step 4: Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait for build (~5 min)
- [ ] Copy your backend URL: `https://______________.onrender.com`
- [ ] Test health endpoint:
  ```bash
  curl https://YOUR-BACKEND-URL.onrender.com/api/health
  ```
- [ ] Should return: `{"status":"healthy",...}`

**✅ Backend URL:** `https://________________________________.onrender.com`

---

## 🎨 Frontend Deployment (Render.com)

### Step 1: Create Frontend Service
- [ ] Click "New +" → "Web Service" (again)
- [ ] Select same `percolator` repo

### Step 2: Configure Frontend
```
✅ Name: percolator-frontend
✅ Root Directory: frontend
✅ Environment: Node
✅ Build Command: npm install && npm run build
✅ Start Command: npm start
✅ Plan: Free
```

### Step 3: Environment Variables
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com
NEXT_PUBLIC_WS_URL=wss://YOUR-BACKEND-URL.onrender.com/ws
```

**⚠️ REPLACE** `YOUR-BACKEND-URL` with the URL from Backend Step 4!

### Step 4: Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait for build (~5 min)
- [ ] Copy your frontend URL: `https://______________.onrender.com`
- [ ] Visit: `https://YOUR-FRONTEND-URL.onrender.com/dashboard`
- [ ] Dashboard should load with live prices ✅

**✅ Frontend URL:** `https://________________________________.onrender.com`

---

## 🧪 Testing Your Live Site

Visit your frontend dashboard and check:

### Visual Tests
- [ ] Dashboard loads (no 404 errors)
- [ ] Header shows "PERColator" logo
- [ ] Three coin tabs visible (BTC/ETH/SOL)
- [ ] TradingView chart displays
- [ ] Orderbook shows bid/ask levels
- [ ] Wallet button visible (top right)

### Functional Tests
- [ ] Click ETH tab → Price updates
- [ ] Click BTC tab → Price updates
- [ ] Click SOL tab → Price updates
- [ ] Connect Phantom wallet → Success
- [ ] Enter price + quantity → Inputs work
- [ ] Click "Reserve" → Phantom opens
- [ ] Sign transaction → Gets error 0x2 (expected!)

**✅ All tests passing means deployment successful!**

---

## 🔗 Your Live URLs

After deployment, save these:

```yaml
Production URLs:
  Backend API: https://_________________________.onrender.com
  Frontend:    https://_________________________.onrender.com
  
API Endpoints:
  Health:      https://YOUR-API.onrender.com/api/health
  Markets:     https://YOUR-API.onrender.com/api/market/list
  Orderbook:   https://YOUR-API.onrender.com/api/market/ETH-PERP/orderbook
  
Dashboard Pages:
  Main:        https://YOUR-FRONTEND.onrender.com
  Dashboard:   https://YOUR-FRONTEND.onrender.com/dashboard
  Info:        https://YOUR-FRONTEND.onrender.com/info
```

---

## 🐛 Troubleshooting

### Build Failed?
```bash
# Test locally first:
cd api && npm install && npm run build
cd ../frontend && npm install && npm run build

# If local build works, check Render logs for specific error
```

### CORS Error?
- Backend already configured for `*.onrender.com`
- If using custom domain, add to `allowedOrigins` in `api/src/index.ts`
- Redeploy after changes

### Can't Connect to API?
- Check `NEXT_PUBLIC_API_URL` in frontend env vars
- Make sure it's `https://` not `http://`
- Verify backend is running (green in Render dashboard)

### WebSocket Not Working?
- Check `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
- Format: `wss://your-backend.onrender.com/ws`

### Service Sleeps?
- Free tier sleeps after 15 min
- Wakes in ~30 seconds on first request
- Upgrade to Starter ($7/mo) to keep awake

---

## 📝 Post-Deployment

After successful deployment:

1. **Share Your DEX!**
   ```
   🚀 Live Solana DEX: https://your-frontend-url.onrender.com/dashboard
   
   Features:
   ✅ Live crypto prices (BTC/ETH/SOL)
   ✅ TradingView charts
   ✅ Phantom wallet integration
   ✅ Beautiful modern UI
   ```

2. **Monitor Uptime**
   - Use UptimeRobot (free)
   - Get alerts if site goes down

3. **Check Logs**
   - Render Dashboard → Logs
   - Monitor for errors

4. **Next Steps:**
   - Add custom domain
   - Initialize programs (75 SOL needed)
   - Add analytics (Google Analytics)
   - Share on Twitter/Discord

---

## 💰 Costs

**Current Setup: $0/month** 🎉

Free tier includes:
- 750 hours/month per service (enough for hobby projects)
- Automatic SSL/HTTPS
- Auto-deploy from GitHub
- Logs and monitoring

**Optional Upgrades:**
- Starter Plan: $7/month per service (no sleep, more resources)
- Custom domain: Free with Render (just buy the domain)

---

## ✅ Final Checklist

- [ ] Backend deployed ✅
- [ ] Frontend deployed ✅
- [ ] Health check working ✅
- [ ] Dashboard loads ✅
- [ ] Prices updating ✅
- [ ] Wallet connects ✅
- [ ] All tests pass ✅
- [ ] URLs documented ✅

**🎉 CONGRATULATIONS! Your DEX is LIVE! 🎉**

---

## 📞 Support

**Documentation:**
- Quick Start: `DEPLOY_QUICK_START.md`
- Full Guide: `DEPLOY_TO_PRODUCTION.md`
- API Ref: `QUICK_API_REFERENCE.md`

**Render Docs:**
- https://render.com/docs

**Need Help?**
- Check Render logs
- Review build output
- Test API endpoints with `curl`

---

**Your Production URLs:**

```
🌐 Frontend: https://______________________________.onrender.com
🔧 Backend:  https://______________________________.onrender.com
📊 Status:   https://status.render.com
```

**Fill in your actual URLs above and save this file!**

