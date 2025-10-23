# 🚀 Deployment Checklist

## 📋 Local Development Setup

### 1. Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws
NEXT_PUBLIC_SERVER_WS_URL=ws://localhost:3000/ws
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### 2. Create `api/.env`:
```env
NODE_ENV=development
PORT=3000
HOST=localhost

SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Add these when you deploy your custom programs:
# ROUTER_PROGRAM_ID=your_custom_router_address
# SLAB_PROGRAM_ID=your_custom_slab_address
```

### 3. Test Locally:
```bash
# Terminal 1 - Start API
cd api
npm start

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

Visit: http://localhost:3001

---

## ☁️ Render.com Production Setup

### Backend (percolator-api)

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Add these later when you deploy your custom Solana programs:
# ROUTER_PROGRAM_ID=your_custom_router_address
# SLAB_PROGRAM_ID=your_custom_slab_address
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

---

### Frontend (percolator-frontend)

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.percolator.site
NEXT_PUBLIC_WS_URL=wss://api.percolator.site/ws
NEXT_PUBLIC_SERVER_WS_URL=wss://api.percolator.site/ws
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**⚠️ Important:** Make sure PORT is set by Render (usually 10000) - don't manually set it.

---

## 🔄 Deployment Steps

1. ✅ **Commit & Push to GitHub:**
   ```bash
   git add .
   git commit -m "Clean up environment configuration"
   git push origin master
   ```

2. ✅ **Update Backend on Render:**
   - Go to https://dashboard.render.com
   - Select `percolator-api` service
   - Go to "Environment" tab
   - Update environment variables (remove any NEXT_PUBLIC_ vars)
   - Click "Manual Deploy" → "Deploy latest commit"

3. ✅ **Update Frontend on Render:**
   - Select `percolator-frontend` service
   - Go to "Environment" tab
   - Update environment variables as listed above
   - Go to "Settings" tab
   - Verify Build Command: `npm install && npm run build`
   - Verify Start Command: `npm start`
   - Click "Manual Deploy" → "Deploy latest commit"

4. ✅ **Wait for Deployment:**
   - Backend should deploy first (faster)
   - Frontend will take 3-5 minutes to build
   - Watch the logs for any errors

5. ✅ **Test Live Site:**
   - Visit https://dex.percolator.site/dashboard
   - Check browser console (F12) for errors
   - Verify WebSocket connection shows `wss://api.percolator.site/ws`
   - Verify data is loading

---

## 🐛 Troubleshooting

### Frontend Deployment Fails with "Port scan timeout"
- Make sure Start Command is: `npm start`
- Render automatically sets PORT env variable
- The updated package.json will use it automatically

### WebSocket not connecting on live site
- Check browser console for connection URL
- Should be `wss://api.percolator.site/ws`
- If it's `ws://localhost:3000/ws`, env vars aren't set correctly

### API returns 503 errors
- Backend might be sleeping (free tier)
- First request wakes it up (takes 30-60 seconds)
- Subsequent requests should work

### Local development not working
- Make sure you created `.env.local` in frontend folder
- Make sure you created `.env` in api folder
- Both services must be running simultaneously

---

## ✅ Success Checklist

- [ ] Local development works (localhost:3001)
- [ ] Backend deployed successfully on Render
- [ ] Frontend deployed successfully on Render
- [ ] Live site loads (https://dex.percolator.site)
- [ ] WebSocket connects on live site
- [ ] Market data displays correctly
- [ ] Charts render properly
- [ ] No CSP errors in console

---

**Last Updated:** October 23, 2025
