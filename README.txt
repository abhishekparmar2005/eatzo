=======================================================
  EATZO — Production Deployment Guide
=======================================================

OVERVIEW
--------
- Backend  → Render (Node/Express) — with keepalive self-ping
- Frontend → Vercel (React / CRA)  — always on, no sleep
- Database → MongoDB Atlas          — always on, free tier

=======================================================
  STEP 1 — SET UP MONGODB ATLAS
=======================================================

1. Go to https://cloud.mongodb.com → create a free account
2. Create a new Project → inside it, create a free M0 cluster
3. "Database Access" tab → Add a DB user → set username & password (save these)
4. "Network Access" tab → Add IP → choose "Allow access from anywhere" (0.0.0.0/0)
5. "Connect" button → Drivers → copy the connection string:
   mongodb+srv://youruser:yourpass@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
6. Add your DB name before the ?:
   mongodb+srv://youruser:yourpass@cluster0.abc12.mongodb.net/eatzo?retryWrites=true&w=majority
   Save this — it's your MONGO_URI.

=======================================================
  STEP 2 — DEPLOY BACKEND ON RENDER
=======================================================

1. Push project to GitHub (github.com → new repo → upload folder)
2. Go to https://render.com → New + → Web Service
3. Connect your GitHub repo
4. Settings:
   Name:            eatzo-backend
   Root Directory:  eatzo_prod/backend
   Runtime:         Node
   Build Command:   npm install
   Start Command:   npm start
   Instance Type:   Free

5. Environment Variables to add:

   MONGO_URI        → your Atlas URI from Step 1
   JWT_SECRET       → any long random string (e.g. eatzo_jwt_xK92mPlqR7vZ)
   NODE_ENV         → production
   PORT             → 5000
   FRONTEND_URL     → (leave blank now, fill after Step 3)

   ✅ DO NOT add RENDER_EXTERNAL_URL — Render sets this automatically.
      The keepalive system reads it on its own. No action needed from you.

6. Click "Create Web Service" → wait for build
7. Copy your URL: https://eatzo-backend.onrender.com

=======================================================
  STEP 3 — DEPLOY FRONTEND ON VERCEL
=======================================================

1. Go to https://vercel.com → Add New → Project
2. Import the same GitHub repo
3. Settings:
   Framework Preset: Create React App
   Root Directory:   eatzo_prod/frontend

4. Environment Variables:
   REACT_APP_API_URL → https://eatzo-backend.onrender.com  (your Render URL)

5. Click Deploy → copy your URL: https://eatzo.vercel.app

=======================================================
  STEP 4 — LINK FRONTEND TO BACKEND
=======================================================

1. Go back to Render → your backend → Environment tab
2. Set FRONTEND_URL = https://eatzo.vercel.app  (your Vercel URL)
3. Render auto-redeploys — wait ~1 minute

=======================================================
  STEP 5 — SET UP CRON-JOB.ORG (backup keepalive)
=======================================================

Your backend already self-pings every 9 minutes via keepalive.js.
For extra reliability, set up an external pinger too:

1. Go to https://cron-job.org → create a free account
2. Click "Create Cronjob"
3. Settings:
   Title:     Eatzo Keepalive
   URL:       https://eatzo-backend.onrender.com/health
   Schedule:  Every 10 minutes
              (select "Every" → Minutes → */10)
4. Save

That's it. Two layers of keepalive = backend stays awake 24/7.

=======================================================
  STEP 6 — SEED YOUR DATABASE (add restaurants/menu)
=======================================================

Run this ONCE from your local machine after deployment:

Mac/Linux:
  cd eatzo_prod/backend
  npm install
  MONGO_URI="your_atlas_uri" node seed.js

Windows (Command Prompt):
  cd eatzo_prod\backend
  npm install
  set MONGO_URI=your_atlas_uri && node seed.js

=======================================================
  STEP 7 — VERIFY
=======================================================

1. Open your Vercel URL — you'll see Eatzo
2. Register an account, log in, browse, order
3. Check Render logs to confirm keepalive pings:
   [Keepalive] ✅ Self-ping OK — status 200 at 2024-xx-xxTxx:xx:xxZ

=======================================================
  HOW THE KEEPALIVE WORKS
=======================================================

keepalive.js runs inside your backend process:
- Waits 1 minute after server starts
- Then pings /health endpoint every 9 minutes
- Render's free tier sleeps after 15 minutes of inactivity
- 9-minute pings ensure it never reaches 15 minutes idle
- cron-job.org pings every 10 minutes as a second layer

Result: backend stays awake 24/7, users never see a delay.

=======================================================
  LOCAL DEVELOPMENT
=======================================================

Backend:
  cd eatzo_prod/backend
  cp .env.example .env   ← fill in your values
  npm install
  npm run dev            ← keepalive won't run (NODE_ENV != production)

Frontend:
  cd eatzo_prod/frontend
  npm install
  npm start              ← /api calls proxy to localhost:5000

=======================================================
  FILES CHANGED FROM ORIGINAL
=======================================================

backend/keepalive.js     NEW — self-ping scheduler
backend/server.js        Updated — imports keepalive, adds /health route
backend/config/db.js     Updated — Atlas-compatible options
backend/package.json     Updated — engines: node >= 18
backend/.env.example     Updated — all production vars documented
backend/.gitignore       NEW
frontend/src/utils/api.js  Updated — reads REACT_APP_API_URL env var
frontend/.env.example    NEW
frontend/.gitignore      NEW

=======================================================
