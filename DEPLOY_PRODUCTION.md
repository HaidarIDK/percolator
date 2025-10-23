# Deploy Percolator to Production

Your trading system is ready for production! Hosting providers automatically handle HTTPS, so Phantom wallet will work perfectly.

---

## 🚀 Quick Deploy (Recommended: Vercel + Render)

### Frontend → Vercel (Free, Auto HTTPS)

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Import** your repository: `HaidarIDK/PERColator`
5. **Configure**:
   - Framework: Next.js ✅ (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
6. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SLAB_PROGRAM_ID=SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep
   NEXT_PUBLIC_SLAB_ACCOUNT=5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB
   NEXT_PUBLIC_INSTRUMENT_ID=G4Um9dNaWKDwd2bhLTEX3DCLRLVWixKvZ1WdEcq6pgfN
   NEXT_PUBLIC_ROUTER_PROGRAM_ID=RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr
   NEXT_PUBLIC_ROUTER_REGISTRY=DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx
   NEXT_PUBLIC_AUTHORITY=pErcnK9NSVQQK54BsKV4tUt8YWiKngubpJ7jxHrFtvL
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com
   ```
7. **Click "Deploy"**
8. **Wait 2-3 minutes**
9. **Done!** Your frontend is live at `https://your-app.vercel.app` ✅

### Backend → Render (Free Tier)

1. **Go to**: https://render.com
2. **Sign in** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect** your repository: `HaidarIDK/PERColator`
5. **Configure**:
   - Name: `percolator-api`
   - Root Directory: `api`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   SOLANA_NETWORK=devnet
   SOLANA_RPC_URL=https://api.devnet.solana.com
   SLAB_PROGRAM_ID=SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep
   SLAB_ACCOUNT=5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB
   INSTRUMENT_ID=G4Um9dNaWKDwd2bhLTEX3DCLRLVWixKvZ1WdEcq6pgfN
   ROUTER_PROGRAM_ID=RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr
   ROUTER_REGISTRY=DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx
   ```
7. **Click "Create Web Service"**
8. **Wait 5-10 minutes** for deployment
9. **Copy your backend URL**: `https://percolator-api-xxx.onrender.com`

### Update Frontend with Backend URL

1. **Go back to Vercel**
2. **Your Project** → **Settings** → **Environment Variables**
3. **Update** `NEXT_PUBLIC_API_URL` to your Render backend URL
4. **Redeploy** (Vercel will auto-redeploy)

---

## ✅ Production is Ready!

Your live site will be:
- ✅ **HTTPS automatically** (Phantom wallet works!)
- ✅ **Fast global CDN** (Vercel edge network)
- ✅ **Auto-scaling backend** (Render handles traffic)
- ✅ **Free tier available** (both platforms have free plans)

**Share your URL**: `https://your-app.vercel.app/trade`

Anyone with:
- Phantom/Solflare wallet
- Devnet SOL

Can trade on your DEX! 🎉

---

## 🔧 Update CORS for Production

Before deploying, update the API to allow your production frontend:

Add your Vercel URL to `api/src/index.ts`:

```typescript
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://your-app.vercel.app',  // ← ADD YOUR VERCEL URL
  'https://dex.percolator.site',
  // ... rest
];
```

---

## 📋 Deployment Checklist

- [ ] Deploy backend to Render
- [ ] Copy backend URL
- [ ] Deploy frontend to Vercel
- [ ] Set `NEXT_PUBLIC_API_URL` to Render URL
- [ ] Update CORS in `api/src/index.ts` with Vercel URL
- [ ] Push to GitHub (triggers redeploy)
- [ ] Test on production URL
- [ ] Share with the world! 🌍

---

## 🎯 Alternative: Both on Render

You can also deploy both on Render:

### Create `render.yaml` in root:

```yaml
services:
  # Backend API
  - type: web
    name: percolator-api
    runtime: node
    rootDir: api
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SOLANA_NETWORK
        value: devnet
      - key: SLAB_ACCOUNT
        value: 5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB
      - key: ROUTER_REGISTRY
        value: DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx

  # Frontend
  - type: web
    name: percolator-frontend
    runtime: node
    rootDir: frontend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://percolator-api.onrender.com
      - key: NEXT_PUBLIC_SLAB_ACCOUNT
        value: 5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB
```

Then:
1. **Push to GitHub**
2. **Render** → **New** → **Blueprint**
3. **Connect** your repo
4. **Deploy!**

---

## 🌍 For Mainnet (When Ready)

1. **Deploy programs to mainnet-beta**:
   ```bash
   solana config set --url mainnet-beta
   solana program deploy ...
   ```

2. **Update all `.env` files**:
   ```
   SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

3. **Use production RPC** (QuickNode, Helius, Alchemy):
   - Better rate limits
   - Faster response times
   - Higher reliability

---

## ✅ Summary

**For Production Deployment:**
- ✅ Vercel/Render handle HTTPS automatically
- ✅ Phantom wallet works perfectly on HTTPS
- ✅ No code changes needed!
- ✅ Just add environment variables
- ✅ Push to GitHub and deploy

**Your trading system is production-ready!** 🚀

