# 🚀 Deploy Your PERColator DEX to Production

This guide will help you deploy your DEX to a live website in ~15 minutes!

---

## 📋 What You're Deploying

1. **Backend API** (Node.js/Express) → Port 3000
2. **Frontend Dashboard** (Next.js) → Port 3001

---

## 🎯 Recommended: Render.com (Free Tier)

**Why Render?**
- ✅ Free tier available
- ✅ Easy setup (no credit card for free tier)
- ✅ Auto-deploys from GitHub
- ✅ Built-in SSL (HTTPS)
- ✅ Environment variables UI
- ✅ Good for both backend & frontend

**Alternatives:**
- **Vercel** (Best for frontend, free)
- **Railway** (Good for backend, free tier)
- **Fly.io** (Full stack, free tier)
- **Heroku** (Paid)

---

## 🔧 Step-by-Step Deployment

### Prerequisites

1. **GitHub Account** (to store your code)
2. **Render Account** (free) - https://render.com/

---

### Step 1: Prepare Your Code for Deployment

#### A. Create `.gitignore` (if not exists)
```bash
node_modules/
.env
.env.local
dist/
.next/
*.log
target/
```

#### B. Commit Your Code
```bash
git add .
git commit -m "Prepare for deployment"
git push origin master
```

---

### Step 2: Deploy Backend API to Render

#### A. Login to Render.com

Go to https://dashboard.render.com/

#### B. Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your `percolator` repo

#### C. Configure Backend Service

**Settings:**
- **Name:** `percolator-api`
- **Region:** Choose closest to you
- **Branch:** `master`
- **Root Directory:** `api`
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** `Free`

**Environment Variables:**
Add these in Render dashboard:

```
NODE_ENV=production
PORT=3000
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SLAB_PROGRAM_ID=6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz
ROUTER_PROGRAM_ID=9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG
HOST=0.0.0.0
```

#### D. Deploy!

Click **"Create Web Service"**

⏳ Wait ~5 minutes for build...

✅ You'll get a URL like: `https://percolator-api.onrender.com`

**Test it:**
```bash
curl https://percolator-api.onrender.com/api/health
```

---

### Step 3: Deploy Frontend to Render

#### A. Create Another Web Service

1. Click **"New +"** → **"Web Service"**
2. Select your `percolator` repo again

#### B. Configure Frontend Service

**Settings:**
- **Name:** `percolator-frontend`
- **Region:** Same as backend
- **Branch:** `master`
- **Root Directory:** `frontend`
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** `Free`

**Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://percolator-api.onrender.com
NEXT_PUBLIC_WS_URL=wss://percolator-api.onrender.com/ws
PORT=3000
```

**⚠️ IMPORTANT:** Replace `percolator-api.onrender.com` with YOUR actual backend URL from Step 2!

#### C. Deploy!

Click **"Create Web Service"**

⏳ Wait ~5 minutes...

✅ You'll get a URL like: `https://percolator-frontend.onrender.com`

---

### Step 4: Update Backend CORS

Your backend needs to allow requests from your frontend domain.

**Edit `api/src/index.ts`:**

```typescript
// Change from:
app.use(cors());

// To:
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://percolator-frontend.onrender.com', // ⬅️ Your frontend URL
    'https://your-custom-domain.com' // Optional: if you add custom domain
  ],
  credentials: true
}));
```

**Commit and push:**
```bash
git add api/src/index.ts
git commit -m "Update CORS for production"
git push
```

Render will auto-redeploy your backend! ✅

---

### Step 5: Test Your Live Site! 🎉

**Open your frontend:**
```
https://percolator-frontend.onrender.com/dashboard
```

**Check if it works:**
1. ✅ Dashboard loads
2. ✅ Prices show (from CoinGecko API)
3. ✅ Connect Phantom wallet
4. ✅ Try Reserve transaction (will get error 0x2 - expected, needs init)

---

## 🎨 Optional: Add Custom Domain

### Option 1: Use Render's Custom Domain (Free)

1. Go to your frontend service in Render
2. Click **"Settings"** → **"Custom Domain"**
3. Add: `percolator-dex.com` (you need to own this domain)
4. Update DNS records as shown by Render

### Option 2: Use Vercel for Frontend (Better URLs)

Vercel gives you: `percolator-dex.vercel.app` for free!

**Deploy to Vercel:**
```bash
cd frontend
npx vercel --prod
```

Follow prompts, then update `NEXT_PUBLIC_API_URL` in Vercel dashboard.

---

## 📝 Deployment Checklist

### Backend (API)
- [✅] Deployed to Render
- [✅] Environment variables set
- [✅] Health endpoint working
- [✅] CORS configured for frontend domain
- [✅] SSL/HTTPS enabled (automatic on Render)

### Frontend
- [✅] Deployed to Render
- [✅] Environment variables pointing to production API
- [✅] Build successful
- [✅] Dashboard loads
- [✅] Phantom wallet connects

### Testing
- [✅] Visit live dashboard
- [✅] Connect wallet
- [✅] Check market data loads
- [✅] Check orderbook displays
- [✅] Try Reserve transaction (will fail with 0x2 until programs initialized)

---

## 🐛 Common Issues & Fixes

### Issue 1: "Failed to fetch" from API

**Problem:** Frontend can't reach backend

**Fix:**
- Check `NEXT_PUBLIC_API_URL` in frontend env vars
- Make sure it's `https://` not `http://`
- Verify backend is running (visit `/api/health`)

### Issue 2: CORS Error

**Problem:** Browser blocks API requests

**Fix:**
```typescript
// In api/src/index.ts
app.use(cors({
  origin: 'https://your-frontend-url.onrender.com',
  credentials: true
}));
```

### Issue 3: WebSocket Not Connecting

**Problem:** WS URL incorrect

**Fix:**
```
NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com/ws
```
Note: `wss://` not `ws://` for HTTPS sites!

### Issue 4: Environment Variables Not Working

**Problem:** Env vars not loaded

**Fix:**
- Restart service in Render dashboard
- Wait 1-2 minutes for redeploy
- Check logs for errors

### Issue 5: Build Fails

**Problem:** Missing dependencies or TypeScript errors

**Fix:**
```bash
# Locally test build:
cd frontend && npm run build
cd ../api && npm run build

# Check for errors, fix, then push
```

---

## 🚀 Auto-Deploy on Push

Render automatically redeploys when you push to GitHub!

**To deploy updates:**
```bash
git add .
git commit -m "Update feature"
git push origin master
```

⏳ Render detects push → Builds → Deploys (2-5 min)

---

## 💰 Cost Breakdown

### Render Free Tier (Recommended)

**Backend:**
- ✅ Free up to 750 hours/month
- ⚠️ Sleeps after 15 min inactivity
- 🔄 Wakes up in ~30 seconds on first request

**Frontend:**
- ✅ Free up to 750 hours/month
- ⚠️ Same sleep behavior

**Total Cost: $0/month** 🎉

**To prevent sleep (paid):**
- Upgrade to Starter plan: $7/month per service
- Keeps services always running

### Vercel (Alternative for Frontend)

- ✅ **Free tier:** Unlimited
- ✅ No sleep
- ✅ Better URLs: `your-dex.vercel.app`
- ✅ Fast global CDN

**Total: $0/month**

---

## 🎯 Production URLs

After deployment, you'll have:

**Backend API:**
```
https://percolator-api.onrender.com
https://percolator-api.onrender.com/api/health
https://percolator-api.onrender.com/api/market/list
```

**Frontend:**
```
https://percolator-frontend.onrender.com
https://percolator-frontend.onrender.com/dashboard
```

**WebSocket:**
```
wss://percolator-api.onrender.com/ws
```

---

## 🔐 Security Checklist

Before going live:

- [✅] HTTPS enabled (automatic on Render)
- [✅] CORS properly configured
- [✅] Environment variables in Render (not in code!)
- [✅] No API keys committed to GitHub
- [✅] Rate limiting (add if needed for production)

---

## 📊 Monitoring Your Live Site

### Check Logs in Render

1. Go to Render dashboard
2. Click your service
3. Click **"Logs"** tab
4. See real-time logs

### Monitor Uptime

Use these (free):
- **UptimeRobot** (https://uptimerobot.com/)
- **Pingdom** (https://pingdom.com/)

---

## 🎉 You're Live!

**Share your DEX:**
```
🚀 My Solana Perpetuals DEX:
https://percolator-frontend.onrender.com/dashboard

✨ Features:
- Live BTC/ETH/SOL prices
- TradingView charts
- Phantom wallet integration
- Reserve/Commit trading system
- Beautiful modern UI
```

---

## 🔄 Next Steps After Deployment

1. **Initialize Programs** (get 75 SOL for devnet)
   - Run `npm run init-slab` in `scripts/`
   - Update backend with Slab account address
   - Redeploy backend

2. **Add Custom Domain**
   - Buy domain (Namecheap, GoDaddy, etc.)
   - Point to Render or Vercel
   - Get `percolator-dex.com`

3. **Add Analytics**
   - Google Analytics
   - PostHog (privacy-friendly)
   - Track user behavior

4. **Add More Features**
   - User onboarding
   - Trading history
   - Portfolio analytics
   - Social sharing

---

## 💡 Tips for Success

1. **Test Locally First**
   ```bash
   npm run build  # In both api/ and frontend/
   ```
   If it builds locally, it'll build on Render!

2. **Check Logs Regularly**
   - Render dashboard → Logs
   - Look for errors

3. **Use Environment Variables**
   - Never hardcode URLs
   - Use `process.env.NEXT_PUBLIC_API_URL`

4. **Monitor Performance**
   - Check page load times
   - Optimize images
   - Use CDN for assets

5. **Keep Dependencies Updated**
   ```bash
   npm outdated
   npm update
   ```

---

## 📞 Need Help?

**Render Documentation:**
https://render.com/docs

**Your Deployment Files:**
- `render-backend.yaml` (created below)
- `render-frontend.yaml` (updated below)
- `DEPLOY_TO_PRODUCTION.md` (this file)

**Common Commands:**
```bash
# Rebuild locally
npm run build

# Check env vars
echo $NEXT_PUBLIC_API_URL

# View logs
# (Use Render dashboard)

# Redeploy
git push origin master
```

---

**Your DEX is ready for the world! 🌍✨**

