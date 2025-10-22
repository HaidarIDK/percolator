# ⚡ Quick Deploy Guide (15 Minutes)

## 🚀 Deploy Your DEX in 4 Steps

### Prerequisites
- GitHub account
- Render.com account (free) - https://render.com/

---

## Step 1: Push to GitHub (2 min)

```bash
# If not already done:
git add .
git commit -m "Ready for deployment"
git push origin master
```

---

## Step 2: Deploy Backend on Render (5 min)

1. **Go to:** https://dashboard.render.com/
2. **Click:** "New +" → "Web Service"
3. **Connect:** Your GitHub repo
4. **Select:** `percolator` repository

### Backend Configuration:
```
Name: percolator-api
Root Directory: api
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
Plan: Free
```

### Environment Variables (Click "Add Environment Variable"):
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SLAB_PROGRAM_ID=6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz
ROUTER_PROGRAM_ID=9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG
```

5. **Click:** "Create Web Service"
6. **Wait:** ~5 minutes for build
7. **Copy:** Your backend URL (e.g., `https://percolator-api-xyz123.onrender.com`)

**Test:** Visit `https://your-backend-url.onrender.com/api/health` ✅

---

## Step 3: Deploy Frontend on Render (5 min)

1. **Click:** "New +" → "Web Service" again
2. **Select:** Same `percolator` repo

### Frontend Configuration:
```
Name: percolator-frontend
Root Directory: frontend
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
Plan: Free
```

### Environment Variables:
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com
NEXT_PUBLIC_WS_URL=wss://YOUR-BACKEND-URL.onrender.com/ws
```

**⚠️ IMPORTANT:** Replace `YOUR-BACKEND-URL` with the URL from Step 2!

5. **Click:** "Create Web Service"
6. **Wait:** ~5 minutes for build
7. **Get:** Your frontend URL (e.g., `https://percolator-frontend-xyz123.onrender.com`)

---

## Step 4: Update Backend CORS (3 min)

Your backend needs to know about your frontend URL.

1. **Edit** `render.yaml` in your repo (or add env var in Render dashboard):

Add to backend's environment variables in Render:
```
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**OR** the code already has it hardcoded, so this step might not be needed!

2. **Redeploy** backend (automatic if you push)

---

## ✅ You're Live!

**Your Live DEX:**
```
Frontend: https://percolator-frontend-xyz123.onrender.com/dashboard
Backend API: https://percolator-api-xyz123.onrender.com/api/health
```

### Test It:
1. Open your frontend URL
2. Click "Connect Wallet"
3. See live BTC/ETH/SOL prices ✅
4. Try Reserve (will get error 0x2 - needs program init) ✅

---

## 🎉 Next Steps

1. **Share your DEX!**
   ```
   Check out my Solana DEX:
   https://your-frontend-url.onrender.com/dashboard
   ```

2. **Add Custom Domain** (optional)
   - Buy domain: Namecheap, GoDaddy, etc.
   - Add in Render: Settings → Custom Domain
   - Get: `percolator-dex.com`

3. **Initialize Programs** (to enable real trading)
   - Get 75 SOL from faucet
   - Run `npm run init-slab` in `scripts/`
   - Update backend with Slab account

4. **Monitor**
   - Check logs in Render dashboard
   - Set up UptimeRobot for monitoring

---

## 🐛 Troubleshooting

### Frontend won't load
- Check build logs in Render
- Verify environment variables are set
- Try rebuilding: "Manual Deploy" → "Clear build cache & deploy"

### API not connecting
- Check `NEXT_PUBLIC_API_URL` has correct backend URL
- Make sure it's `https://` not `http://`
- Test API directly: `curl https://your-api-url.onrender.com/api/health`

### CORS errors
- Backend CORS is already configured for `*.onrender.com`
- If using custom domain, add it to `allowedOrigins` in `api/src/index.ts`

---

## 💰 Free Tier Limits

**Render Free Tier:**
- ✅ 750 hours/month per service
- ⚠️ Services sleep after 15 min inactivity
- 🔄 Wake up in ~30 seconds on first request
- ✅ Automatic SSL/HTTPS
- ✅ Auto-deploys from GitHub

**Cost: $0/month** 🎉

**To prevent sleep:**
- Upgrade to Starter ($7/mo per service)
- Or use a "ping" service to keep it awake

---

## 📝 Deployment Checklist

- [✅] Code pushed to GitHub
- [✅] Backend deployed to Render
- [✅] Backend health check working
- [✅] Frontend deployed to Render
- [✅] Frontend loads dashboard
- [✅] API connection working
- [✅] Wallet connects
- [✅] Market data shows

---

**That's it! Your DEX is live! 🚀**

Full guide: See `DEPLOY_TO_PRODUCTION.md`

