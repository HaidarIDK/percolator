# 🚀 How to Deploy Backend on Render.com (Step-by-Step)

## 📸 **Visual Step-by-Step Guide**

---

## **STEP 1: Go to Render Dashboard** (30 seconds)

1. Open browser
2. Go to: **https://dashboard.render.com/**
3. Sign up or login (it's FREE - no credit card needed!)

**What you'll see:**
```
┌──────────────────────────────────────┐
│  Render Dashboard                    │
│  ┌────────────────────────────────┐  │
│  │  New +  ▼                      │  │  ← Click this button!
│  └────────────────────────────────┘  │
│                                      │
│  My Services:                        │
│  (your services will appear here)    │
└──────────────────────────────────────┘
```

---

## **STEP 2: Click "New +" Button** (5 seconds)

Click the blue **"New +"** button at the top

**You'll see a dropdown menu:**
```
┌────────────────────┐
│  Web Service       │  ← Click this one!
│  Static Site       │
│  Private Service   │
│  Cron Job         │
│  Background Worker │
└────────────────────┘
```

Click **"Web Service"** ✅

---

## **STEP 3: Connect GitHub** (1 minute)

**You'll see:**
```
┌──────────────────────────────────────────┐
│  Create a new Web Service                │
│                                          │
│  Connect a repository:                   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  🔗 Connect GitHub                 │  │  ← Click here
│  └────────────────────────────────────┘  │
│                                          │
│  Or:                                     │
│  ┌────────────────────────────────────┐  │
│  │  🔗 Connect GitLab                 │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

1. Click **"Connect GitHub"**
2. A popup will appear - click **"Authorize Render"**
3. You'll see a list of your GitHub repositories

---

## **STEP 4: Select Your Repository** (30 seconds)

**Search for your repo:**
```
┌──────────────────────────────────────────┐
│  Select a repository                     │
│                                          │
│  🔍 Search: percolator___                │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  📁 percolator                     │  │  ← Click "Connect"
│  │     (your-username/percolator)     │  │
│  │                      [Connect]     │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

1. Type "percolator" in search
2. Find your `percolator` repo
3. Click the **"Connect"** button next to it

---

## **STEP 5: Configure the Service** (3 minutes)

**Now you'll see a form. Fill it out EXACTLY like this:**

### Basic Info:
```
┌──────────────────────────────────────────┐
│  Name: percolator-api_______________     │  ← Type this
│                                          │
│  Region: [Oregon ▼]                     │  ← Select Oregon (or nearest)
│                                          │
│  Branch: [master ▼]                     │  ← Should be "master" or "main"
│                                          │
│  Root Directory: api_________________    │  ← Type "api" (IMPORTANT!)
└──────────────────────────────────────────┘
```

### Build Settings:
```
┌──────────────────────────────────────────┐
│  Environment: [Node ▼]                   │  ← Select "Node"
│                                          │
│  Build Command:                          │
│  npm install && npm run build________    │  ← Copy this exactly
│                                          │
│  Start Command:                          │
│  npm start___________________________    │  ← Copy this exactly
└──────────────────────────────────────────┘
```

### Instance Type:
```
┌──────────────────────────────────────────┐
│  Instance Type: [Free ▼]                 │  ← Select "Free"
└──────────────────────────────────────────┘
```

---

## **STEP 6: Add Environment Variables** (2 minutes)

**Scroll down to "Environment Variables" section**

Click **"Add Environment Variable"** button (click it 7 times, one for each variable)

**Add these EXACTLY:**

```
Variable 1:
Key:   NODE_ENV
Value: production

Variable 2:
Key:   PORT
Value: 3000

Variable 3:
Key:   HOST
Value: 0.0.0.0

Variable 4:
Key:   SOLANA_NETWORK
Value: devnet

Variable 5:
Key:   SOLANA_RPC_URL
Value: https://api.devnet.solana.com

Variable 6:
Key:   SLAB_PROGRAM_ID
Value: 6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz

Variable 7:
Key:   ROUTER_PROGRAM_ID
Value: 9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG
```

**It should look like this:**
```
┌──────────────────────────────────────────────────┐
│  Environment Variables:                          │
│                                                  │
│  NODE_ENV          = production                  │
│  PORT              = 3000                        │
│  HOST              = 0.0.0.0                     │
│  SOLANA_NETWORK    = devnet                      │
│  SOLANA_RPC_URL    = https://api.devnet.solana.com│
│  SLAB_PROGRAM_ID   = 6EF2acRfPejnxXYd9apK...     │
│  ROUTER_PROGRAM_ID = 9CQWTSDobkHqWzvx4nuf...     │
│                                                  │
│  [+ Add Environment Variable]                    │
└──────────────────────────────────────────────────┘
```

---

## **STEP 7: Deploy!** (5 minutes)

**Scroll to the bottom and click:**

```
┌──────────────────────────────────────────┐
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Create Web Service                │  │  ← Click here!
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**What happens next:**
1. Render starts building your backend
2. You'll see real-time logs:

```
┌──────────────────────────────────────────┐
│  🔨 Building...                          │
│                                          │
│  ==> Cloning from GitHub...              │
│  ==> Installing dependencies...          │
│  ==> Running npm install...              │
│  ==> Building TypeScript...              │
│  ==> Starting server...                  │
│  ✅ Deploy successful!                   │
└──────────────────────────────────────────┘
```

**Wait ~5 minutes for the build to complete**

---

## **STEP 8: Get Your URL!** (10 seconds)

**When build completes, you'll see:**

```
┌──────────────────────────────────────────────┐
│  ✅ percolator-api                           │
│                                              │
│  🌐 https://percolator-api.onrender.com     │  ← This is YOUR URL!
│                                              │
│  Status: ● Live                              │
└──────────────────────────────────────────────┘
```

**Copy that URL!** It might look like:
- `https://percolator-api.onrender.com`
- `https://percolator-api-xyz123.onrender.com`

---

## **STEP 9: Test Your Backend** (30 seconds)

Open a new browser tab and go to:

```
https://YOUR-URL.onrender.com/api/health
```

**Replace `YOUR-URL` with the URL from Step 8!**

**You should see:**
```json
{
  "status": "healthy",
  "timestamp": 1234567890,
  "solana": {
    "network": "devnet",
    "connected": true,
    "slot": 416201990
  }
}
```

**If you see this ➡️ SUCCESS! ✅ Your backend is LIVE!**

---

## **STEP 10: Update Your Frontend** (2 minutes)

Now tell your live website to use this backend!

### If frontend is on Vercel:
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   ```
   NEXT_PUBLIC_API_URL = https://YOUR-BACKEND-URL.onrender.com
   NEXT_PUBLIC_WS_URL = wss://YOUR-BACKEND-URL.onrender.com/ws
   ```
5. Go to **Deployments** → Click **...** → **Redeploy**

### If frontend is on Netlify:
1. Go to https://app.netlify.com/
2. Click your site
3. Go to **Site settings** → **Environment variables**
4. Add/Update same as above
5. Go to **Deploys** → **Trigger deploy**

### If frontend is on Render too:
1. In Render dashboard, click your frontend service
2. Go to **Environment** tab
3. Edit `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`
4. Click **Save Changes** (auto-redeploys)

---

## **STEP 11: Test Your Live Website!** (1 minute)

Go to your live website:
```
https://your-website.com/dashboard
```

**Check if it works:**
- ✅ Prices load (BTC/ETH/SOL)
- ✅ Chart displays
- ✅ Orderbook shows
- ✅ Connect wallet button works

**If everything works ➡️ YOU'RE DONE! 🎉**

---

## 🎉 **Congratulations!**

Your backend is LIVE at:
```
https://percolator-api-xyz123.onrender.com
```

Your website can now:
- ✅ Fetch live crypto prices
- ✅ Display real-time orderbook
- ✅ Connect Phantom wallet
- ✅ Build transactions
- ✅ Everything works!

---

## 🐛 **Troubleshooting**

### Build Failed?
1. Check the logs in Render dashboard
2. Make sure you typed `api` in "Root Directory"
3. Make sure Build Command is: `npm install && npm run build`

### Can't access /api/health?
1. Wait 1-2 more minutes (first deploy takes time)
2. Check if service status shows "Live" (green dot)
3. Make sure you're using `/api/health` (with `/api/`)

### Frontend still not connecting?
1. Double-check `NEXT_PUBLIC_API_URL` is correct
2. Make sure it's `https://` not `http://`
3. Redeploy frontend after changing env vars

---

## 📝 **Your URLs Checklist**

Fill these in:

```
✅ Backend URL: https://________________________________.onrender.com

✅ Test endpoints:
   Health: https://YOUR-URL.onrender.com/api/health
   Markets: https://YOUR-URL.onrender.com/api/market/list
   
✅ Updated frontend env vars: [YES / NO]

✅ Frontend redeployed: [YES / NO]

✅ Dashboard loads prices: [YES / NO]
```

---

**You're all set! Your DEX is fully operational! 🚀**

