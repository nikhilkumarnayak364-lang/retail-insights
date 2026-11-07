# Production Deployment Guide — Retail Insights

This guide explains how to deploy **Retail Insights** to production following the architecture requirements:
- **Database:** MongoDB Atlas
- **Backend:** Render (Python FastAPI Web Service)
- **Frontend:** Vercel (Next.js 14 App Router)

---

## 1. Database Setup: MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (M0) or dedicated cluster.
3. Under **Database Access**, create a database user (e.g. `retail_admin`) with Read and Write permissions.
4. Under **Network Access**, add an IP Access entry (`0.0.0.0/0` for cloud deployment, or your hosting IPs).
5. Click **Connect** &rarr; **Drivers** (Python 3.11+) and copy the connection string:
   ```
   mongodb+srv://retail_admin:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```
6. The application will automatically create the database `retail_insights` and required collections (`datasets`, `transactions`) with compound indexes on first upload.

---

## 2. Backend Deployment: Render

The repository includes a ready-to-use [`render.yaml`](../render.yaml) blueprint.

### Option A: Deploy via Render Blueprint
1. Go to [Render Dashboard](https://dashboard.render.com/) &rarr; **New** &rarr; **Blueprint**.
2. Connect your Git repository.
3. Render will auto-detect `render.yaml` and configure the Python web service.
4. Supply the secret environment variables:
   - `MONGODB_URI`: your MongoDB Atlas connection string from Step 1.
   - `FRONTEND_ORIGIN`: your Vercel frontend URL (e.g. `https://retail-insights.vercel.app`).
5. Click **Apply**. Render will install dependencies and launch Uvicorn on `$PORT`.

### Option B: Manual Web Service Setup on Render
- **Environment:** Python
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `PYTHON_VERSION`: `3.11.8`
  - `MONGODB_URI`: `<your-mongodb-atlas-uri>`
  - `MONGODB_DATABASE`: `retail_insights`
  - `FRONTEND_ORIGIN`: `https://<your-vercel-domain>.vercel.app`

Once deployed, note your Render backend URL (e.g. `https://retail-insights-backend.onrender.com`).

---

## 3. Frontend Deployment: Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** &rarr; **Project** and import your Git repository.
3. In project configuration:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
4. Under **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL=https://retail-insights-backend.onrender.com
   ```
   *(Replace with your actual Render backend URL)*
5. Click **Deploy**. Vercel will run `npm run build` and publish your app.
6. Once deployed, copy your production Vercel URL and update `FRONTEND_ORIGIN` in your Render backend settings so CORS allows requests.

---

## 4. Verification

After deployment:
1. Visit `https://<your-backend>.onrender.com/api/health` to confirm the backend is up and MongoDB is connected.
2. Visit `https://<your-frontend>.vercel.app` and check the **Backend Connection Status** banner:
   - Should display **Connected** with measured latency.
3. Navigate to **Data Explorer** &rarr; Click **Load Sample Dataset** to verify data ingestion and all analytics views.

