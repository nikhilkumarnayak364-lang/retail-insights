# Production Deployment Guide — Retail Insights

This comprehensive guide explains how to deploy **Retail Insights** to production in the cloud with zero dependency on your local machine:
- **Cloud Database:** MongoDB Atlas (M0 Free Tier or Dedicated)
- **Backend API:** Render (Python FastAPI ASGI Web Service)
- **Frontend App:** Vercel (Next.js 14 App Router)

---

## Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │             User Devices                │
                      │       (Mobile & Desktop Browsers)       │
                      └────────────────────┬────────────────────┘
                                           │
                                           │ HTTPS (Web & Mobile UI)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │              Vercel Edge                │
                      │      (Next.js 14 Production App)        │
                      └────────────────────┬────────────────────┘
                                           │
                                           │ REST API / CORS HTTPS
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │              Render Cloud               │
                      │    (Python 3.11+ FastAPI Backend)       │
                      └────────────────────┬────────────────────┘
                                           │
                                           │ mongodb+srv:// SSL/TLS
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │          MongoDB Atlas Cloud            │
                      │       (Transactions & Datasets)         │
                      └─────────────────────────────────────────┘
```

---

## Step 1: Cloud Database Setup — MongoDB Atlas

1. **Sign Up / Log In:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.

2. **Create a Free Cluster:**
   - Click **Create Deployment** &rarr; select **M0 Free** (Shared).
   - Choose a cloud provider and region closest to your users (e.g. AWS / us-east-1).
   - Name your cluster (e.g., `Cluster0`) and click **Create**.

3. **Configure Database Security (User Credentials):**
   - In the left sidebar, navigate to **Security** &rarr; **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `retail_admin` (or your choice).
   - Password: Click **Autogenerate Secure Password** or create your own strong password. **Copy this password!**
   - *Note:* If your password contains special characters like `@`, `:`, `/`, or `%`, URL-encode them (e.g. `@` becomes `%40`) so the connection URI parses correctly.
   - Database User Privileges: Select **Read and write to any database**.
   - Click **Add User**.

4. **Configure Network Access (IP Whitelist):**
   - In the left sidebar, navigate to **Security** &rarr; **Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (adds `0.0.0.0/0`).
   - *Why?* Cloud hosts like Render and Vercel use dynamic IP addresses that rotate.
   - Click **Confirm**.

5. **Copy Your Connection String:**
   - In the left sidebar, click **Deployment** &rarr; **Database**.
   - Click the **Connect** button next to your cluster.
   - Under **Connect your application**, select **Drivers**.
   - Driver: **Python**, Version: **3.11 or later**.
   - Copy the connection string format:
     ```
     mongodb+srv://retail_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password you copied in Step 1.3.

---

## Step 2: Backend Cloud Deployment — Render

The repository contains a pre-configured [`render.yaml`](../render.yaml) blueprint and a production [`Dockerfile`](../backend/Dockerfile).

### Option A: Deploy via Render Blueprint (Recommended)

1. Push your latest code changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure production deployment for Vercel, Render and MongoDB Atlas"
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** &rarr; **Blueprint**.
4. Connect your GitHub repository (`retail-insights`).
5. Render will automatically detect `render.yaml` and parse the service settings.
6. Under **Environment Variables**:
   - `MONGODB_URI`: Paste your MongoDB Atlas connection string from Step 1.5.
   - `FRONTEND_ORIGIN`: Enter `https://*.vercel.app` or leave blank initially (our CORS middleware auto-permits all Vercel domains).
7. Click **Apply**. Render will install dependencies and start the Uvicorn server on `$PORT`.

### Option B: Manual Web Service Setup on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository (`retail-insights`).
4. Configure the settings:
   - **Name:** `retail-insights-backend`
   - **Region:** Ohio / Oregon / Frankfurt (select nearest to your Atlas region)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
5. Click **Advanced** &rarr; **Add Environment Variable**:
   | Key | Value | Description |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.8` | Python runtime version |
   | `MONGODB_URI` | `mongodb+srv://...` | Connection URI from Step 1.5 |
   | `MONGODB_DATABASE` | `retail_insights` | Database name |
   | `FRONTEND_ORIGIN` | `https://*.vercel.app` | Allowed frontend origin |
   | `ENVIRONMENT` | `production` | Deployment environment |
6. Click **Create Web Service**.
7. Wait 2–3 minutes for the build to finish. Once live, Render displays your public backend URL:
   ```
   https://retail-insights-backend.onrender.com
   ```
8. **Verify Backend:** Open `https://<your-backend-url>/api/health` in your browser. You should receive:
   ```json
   {
     "status": "healthy",
     "database": {
       "configured": true,
       "status": "connected",
       "database_name": "retail_insights"
     }
   }
   ```

---

## Step 3: Frontend Cloud Deployment — Vercel

1. Log in to [Vercel](https://vercel.com/) (sign in with GitHub).
2. Click **Add New…** &rarr; **Project**.
3. Select and import your GitHub repository (`retail-insights`).
4. In the **Configure Project** screen:
   - **Project Name:** `retail-insights` (or custom name)
   - **Framework Preset:** `Next.js` (auto-detected)
   - **Root Directory:** Click **Edit** and set it to:
     ```
     frontend
     ```
     *(Crucial step: Ensures Vercel builds the Next.js app in the frontend folder)*
5. Expand **Environment Variables**:
   - Add:
     - **Key:** `NEXT_PUBLIC_API_URL`
     - **Value:** `https://<your-backend-url>.onrender.com` *(your actual Render URL from Step 2)*
6. Click **Deploy**.
7. Vercel will install dependencies, run `npm run build`, and publish your app in ~60 seconds.
8. You will receive a public production domain, e.g.:
   ```
   https://retail-insights.vercel.app
   ```

> [!TIP]
> **Updating Render CORS:** Once you have your exact Vercel production domain (e.g. `https://retail-insights.vercel.app`), you can update the `FRONTEND_ORIGIN` environment variable in your Render dashboard settings to this domain for strict origin isolation. Our backend also auto-authorizes `https://*.vercel.app` via regex!

---

## Step 4: End-to-End Verification Checklist

Test the complete online pipeline on both desktop and mobile:

- [ ] **Direct Website Access:** Open your Vercel URL on PC and mobile phone. The site loads without any localhost errors.
- [ ] **Top Navbar Status:** The green indicator shows "System Online" (or pulsing dot on mobile).
- [ ] **Diagnostic Check:** Navigate to **Platform Settings** &rarr; verify:
  - Backend API: `CONNECTED`
  - Database: `MongoDB Atlas Active`
  - Round-Trip Latency: `< 300 ms`
- [ ] **Data Ingestion:**
  - Navigate to **Data Explorer** &rarr; Click **Load Sample Dataset** (e.g. Clothing or Electronics).
  - Confirm the dataset ingests and displays with complete metrics.
- [ ] **Real-time Analytics Views:**
  - Check **Sales Analysis**: charts, KPI summary, and AOV trends render dynamically.
  - Check **Customer Demographics**, **Product Matrix**, **Geographic**, and **Payment Tender**.
  - Check **Business Insights**: AI-modeled prescriptive actions and health score display.
- [ ] **Currency Converter:**
  - Open the calculator and toggle currencies (USD, INR, EUR, GBP).
  - Verify conversions update instantly across all analytics tables and cards.
- [ ] **Mobile Responsiveness:**
  - Test opening drawer menu via hamburger on mobile.
  - Verify tables scroll smoothly within cards with no document-level horizontal page spill.

---

## Step 5: Cloud Quirks & Troubleshooting

### 1. Render Free Tier Cold-Start Latency
- Render free tier spins down instances after 15 minutes of inactivity.
- When an inactive instance receives a request, it takes ~30–50 seconds to boot up.
- *Solution:* Our frontend is pre-configured with a 60-second fetch timeout and adaptive UI notices. If you see "Connecting to Analytics Services", wait a few moments and click **Retry Connection**.
- *(Optional)* Set up a free uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com/)) pinging `https://<your-backend>.onrender.com/api/health` every 10 minutes to keep the backend warm 24/7.

### 2. MongoDB Atlas Special Characters
- If your database password contains characters like `#`, `@`, `:`, or `%`, URI decoding may fail.
- Encode them using standard percent-encoding (e.g., `@` &rarr; `%40`, `#` &rarr; `%23`).

### 3. Updating Vercel Environment Variables
- `NEXT_PUBLIC_*` environment variables in Next.js are compiled into the client bundle at build time.
- If you change `NEXT_PUBLIC_API_URL` in Vercel settings, you **must trigger a redeploy** (**Deployments** &rarr; **...** &rarr; **Redeploy**) for the new URL to take effect.
