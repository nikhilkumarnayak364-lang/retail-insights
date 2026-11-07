# Retail Insights — Enterprise Retail Analytics Platform

[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.15-22c55e.svg)](https://recharts.org/)
[![MongoDB Atlas Ready](https://img.shields.io/badge/MongoDB_Atlas-Active_Storage-brightgreen.svg)](https://www.mongodb.com/atlas)

**Retail Insights** is an enterprise-grade Retail Analytics and Business Intelligence web application that empowers multi-category retailers (clothing, grocery, electronics, and general merchandise) to analyze sales performance, customer cohorts, product turnover, store geographies, and payment economics.

> **Status:** Current implementation represents **Phase 5: Automated Business Insights & Production-Ready Platform**.

---

## 1. Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Visualization:** Recharts (Area, Bar, Donut, Line charts)
- **Iconography:** Lucide React

### Backend
- **Language:** Python 3.13+ (All business logic, data calculations, and analytics)
- **Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Data Modeling & Validation:** Pydantic v2 & Pydantic Settings
- **Analytical & Ingestion Engines:** Pandas & NumPy
- **Database Driver:** PyMongo (MongoDB Atlas with automatic local fallback)

### Database
- **Primary Target:** MongoDB Atlas Cloud Database (`retail_insights`)
- **Local Fallback:** Built-in JSON-backed repository for immediate testing without external dependencies

---

## 2. Key Features by Phase

### Phase 1: Foundation
- Decoupled Next.js frontend and Python FastAPI backend with CORS middleware.
- Resilient REST handshake with latency tracking and diagnostic indicators.

### Phase 2: Data Ingestion & Storage
- Flexible CSV schema normalizer that matches POS/ERP column synonyms.
- Ingestion of custom retail CSVs or 1-Click sample datasets (**Fashion Boutique**, **Supermarket Grocery**, **Consumer Electronics**).
- Interactive **Data Explorer** with paginated transaction tables and schema mapping inspector.

### Phase 3: Sales & Product Analytics Dashboards
- **Sales Analytics View**:
  - Net Invoiced Revenue, Gross Profit, Total Orders, and Average Order Value (AOV).
  - Time-series Revenue & Profit Trajectory Area Chart (with Daily vs Cumulative toggle).
  - Weekly Day-of-the-Week Revenue Cycle Bar Chart (highlighting busiest trading days).
  - Peak Retail Traffic Hours (0:00 to 23:00) Bar Chart.
  - Payment Tender Breakdown Donut Chart (Cards, Wallets, Cash, BNPL).
  - Sales Velocity & Daily Run Rate momentum card.
- **Product & Inventory Analytics View**:
  - Catalog Breadth KPIs: Total SKUs, Active Departments, Weighted Average Price Point, Overall Merchandise Margin %.
  - Top Best-Sellers Bar Chart ranked dynamically by **Revenue**, **Units Sold**, or **Gross Profit**.
  - Department / Category Revenue Contribution Donut Chart.
  - Price Point Sensitivity Tiers (`Under $25`, `$25-$50`, `$50-$100`, `$100-$250`, `$250+`).
  - Inventory Velocity Alert highlighting **Slow Movers & Dead Stock Risk**.
  - Sortable Merchandise Performance Table with revenue share % and profit margins.

### Phase 4: Customer, Category, Geographic & Payment Analytics Dashboards
- **Customer Analytics View**:
  - Total Customer Base, Repeat Rate %, Average Customer Lifetime Value (CLV), Orders per Customer.
  - **RFM Segmentation** — Champions, Loyal Customers, At Risk, Lost, etc. — horizontal bar chart + revenue breakdown table.
  - **Demographics** — Gender breakdown donut chart and Age Group distribution bar chart (when columns are present in dataset).
  - **VIP Customer Leaderboard** — Top customers ranked by lifetime spend with recency-based color coding.
- **Category & Subcategory Hierarchy View**:
  - Total Categories, Total Subcategories, Top Revenue Department, Top Margin Department, Catalog Diversity Score.
  - Category Revenue & Profit Bar Chart and Department Share Donut Chart.
  - Expandable Category Taxonomy Table revealing subcategory revenue, units, and profit margins.
- **Geographic Analytics View**:
  - Total Stores, Regions, Cities, and Average Revenue per Store KPI cards.
  - Regional Revenue bar chart with margin and store count details.
  - Top 10 Cities by Revenue horizontal bar chart.
  - Regional Performance Detail cards showing revenue share, margin, store count, and city count per region.
  - **Store Benchmarking Table** — Performance Index (100 = fleet average), with green (>110), neutral (90–110), and amber (<90) badges.
- **Payment Tender & Checkout Economics View**:
  - Dominant Payment Method, Digital vs Cash Adoption Rate, Average Ticket, and Estimated Processing Fees.
  - Revenue by Tender Type Bar Chart and Day-of-Week Digital vs Cash Mix stacked chart.
  - Payment Method Performance & Fee Matrix with interchange fee calculations and margin impact.

### Phase 5: Automated Business Insights & Platform Settings
- **Automated Business Insights & Prescriptive Engine**:
  - Overall **Retail Health Index (0-100)** with letter grades (`A+`, `A`, `B`, `C`, `Needs Attention`).
  - 4 Pillars of Health: Profit Margin Health, Customer Retention, Catalog Velocity, and Store Network Balance.
  - Key operational strengths & urgent action priorities.
  - Heuristics engine detecting **Margin Leakage** on high-velocity items, **Dead Stock & Stagnant Inventory**, **Customer Retention Gaps**, **Store Basket Size Variances**, and **Credit Card Fee Optimization**.
  - Quantified financial impact tags (`Estimated Financial Gain`) and confidence scores.
  - Interactive multi-criteria filtering by severity (`Critical`, `High`, `Medium`, `Opportunity`) and domain category (`Pricing`, `Inventory`, `Customer`, `Operations`, `Checkout`).
- **Platform Settings & Diagnostic Suite**:
  - Live runtime & framework specifications (Next.js 14, React 18, FastAPI, Python 3.13, Pandas).
  - Database status monitor (MongoDB Atlas or Local Persistent JSON Store fallback) with record counters.
  - Connection latency rechecker and Swagger docs link.
  - Copyable MongoDB Atlas `.env` configuration template.

---

## 3. API Endpoints

### Health & Diagnostics
- `GET /` — Service identity and status
- `GET /api/health` — System and database health
- `GET /api/health/frontend-check` — Frontend handshake verification

### Dataset Management & Ingestion
- `POST /api/datasets/upload` — Ingest sales CSV file (`multipart/form-data`)
- `GET /api/datasets` — List all ingested datasets with summary KPIs
- `GET /api/datasets/active` — Get currently active analytics dataset
- `GET /api/datasets/{dataset_id}` — Get specific dataset metadata
- `GET /api/datasets/{dataset_id}/preview` — Paginated transaction records
- `POST /api/datasets/{dataset_id}/activate` — Set dataset as active
- `DELETE /api/datasets/{dataset_id}` — Delete dataset and records
- `POST /api/datasets/sample/{retail_type}` — 1-click sample dataset generation (`clothing`, `grocery`, `electronics`)

### Analytics Engines (Phase 3, 4 & 5)
- `GET /api/analytics/sales?dataset_id={id}` — Time-series revenue, weekdays, hourly traffic, payment breakdown
- `GET /api/analytics/products?dataset_id={id}&limit={n}` — Top products, slow movers, categories, price tiers
- `GET /api/analytics/customers?dataset_id={id}` — RFM segments, demographics, CLV, VIP leaderboard
- `GET /api/analytics/geographic?dataset_id={id}` — Regional revenue, store benchmarking, city rankings
- `GET /api/analytics/categories?dataset_id={id}` — Category hierarchy, subcategories, margin analysis
- `GET /api/analytics/payments?dataset_id={id}` — Payment tender breakdown, fee estimation, digital adoption
- `GET /api/analytics/insights?dataset_id={id}` — Automated prescriptive insights, anomalies, and health score

---

## 4. How to Run

### Option A: 1-Click Launchers (Recommended)
- **Start Everything:** Double-click `run_all.bat` in the project root to launch both backend and frontend together!
- **Backend Only:** Double-click `run_backend.bat` in File Explorer or run `.\run_backend.ps1` in PowerShell.
- **Frontend Only:** Double-click `run_frontend.bat` in File Explorer.

### Option B: Direct Terminal Commands
**Terminal 1 (Backend):**
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

### Run Unit Tests
```powershell
cd backend
.\venv\Scripts\pytest.exe tests -v
```
All **20 unit tests** will execute and verify health, datasets, schema normalization, sales/product analytics, customer/geographic analytics, category/payment analytics, and business insights.


---

## 5. Cloud Deployment

- **Database:** MongoDB Atlas (Cloud Database)
- **Backend:** Render ([`render.yaml`](render.yaml) provided)
- **Frontend:** Vercel ([`frontend/vercel.json`](frontend/vercel.json) provided)

See the full step-by-step deployment guide in [docs/deployment.md](docs/deployment.md).
