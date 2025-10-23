# 🚀 Deploy to Production NOW

## Fastest Way (5 Minutes)

### Step 1: Deploy Backend to Render

1. **Go to**: https://render.com/dashboard
2. **Click**: "New +" → "Blueprint"
3. **Connect**: Your GitHub repo `HaidarIDK/PERColator`
4. **Click**: "Apply" (it will read `render.yaml`)
5. **Wait**: 5-10 minutes for deployment
6. **Copy**: Your backend URL (e.g., `https://percolator-api.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com/new
2. **Import**: `HaidarIDK/PERColator` from GitHub
3. **Configure**:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
4. **Environment Variables** (paste all at once):
   ```
   NEXT_PUBLIC_SLAB_PROGRAM_ID=SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep
   NEXT_PUBLIC_SLAB_ACCOUNT=5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB
   NEXT_PUBLIC_INSTRUMENT_ID=G4Um9dNaWKDwd2bhLTEX3DCLRLVWixKvZ1WdEcq6pgfN
   NEXT_PUBLIC_ROUTER_PROGRAM_ID=RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr
   NEXT_PUBLIC_ROUTER_REGISTRY=DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx
   NEXT_PUBLIC_AUTHORITY=pErcnK9NSVQQK54BsKV4tUt8YWiKngubpJ7jxHrFtvL
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_API_URL=https://percolator-api.onrender.com
   ```
   
   **Important**: Replace `percolator-api.onrender.com` with your actual Render backend URL!

5. **Click "Deploy"**
6. **Wait**: 2-3 minutes
7. **Done!** Frontend is live at `https://your-app.vercel.app` ✅

### Step 3: Update Backend CORS

1. **In your code**, update `api/src/index.ts`:
   ```typescript
   const allowedOrigins = [
     'http://localhost:3001',
     'https://your-app.vercel.app',  // ← ADD YOUR VERCEL URL HERE
     // ... rest
   ];
   ```

2. **Push to GitHub**:
   ```bash
   git add api/src/index.ts
   git commit -m "Add production frontend URL to CORS"
   git push origin master
   ```

3. **Render auto-redeploys** (2 minutes)

---

## ✅ Your DEX is LIVE!

Visit your Vercel URL and:
- ✅ **HTTPS enabled** → Phantom works perfectly!
- ✅ **Global CDN** → Fast worldwide
- ✅ **Auto-scaling** → Handles traffic
- ✅ **Free tier** → No cost to start

**Share your URL** with anyone who wants to trade! 🌍

---

## 🎯 After Deployment

### Update Frontend URL in Backend

1. Go to **Render Dashboard**
2. Your **percolator-api** service
3. **Environment** → Add/Update:
   - Key: `FRONTEND_URL`
   - Value: `https://your-app.vercel.app`
4. **Save** (auto-redeploys)

### Test Production

1. **Visit**: `https://your-app.vercel.app/trade`
2. **Connect Phantom** (should work perfectly on HTTPS!)
3. **Make sure wallet is on Devnet**
4. **Place a trade**
5. **Success!** 🎉

---

## 🔄 Auto-Deployments

Both platforms auto-deploy on git push:

```bash
git add .
git commit -m "Update trading UI"
git push origin master
```

- **Vercel**: Redeploys in ~2 minutes
- **Render**: Redeploys in ~5 minutes

---

## 💰 Free Tier Limits

### Vercel:
- ✅ Unlimited bandwidth
- ✅ Unlimited requests
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

### Render (Free Tier):
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Cold starts take ~30 seconds
- ✅ Automatic HTTPS
- ✅ Custom domains

**Upgrade to paid**: $7/month for always-on backend

---

## 🚀 Production Mainnet (Optional)

When you're ready for real money:

1. **Deploy programs to mainnet-beta**
2. **Update environment variables**:
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```
3. **Use production RPC provider** (Helius, QuickNode)
4. **Test thoroughly first!**

---

## 📱 Custom Domain (Optional)

### Vercel:
1. **Settings** → **Domains**
2. **Add**: `dex.yourdomain.com`
3. **Update DNS** (follow Vercel instructions)
4. **Done!** HTTPS auto-configured

---

**Deploy in the next 5 minutes!** 🚀

The HTTPS from Vercel/Render will fix the Phantom blocking issue automatically!
