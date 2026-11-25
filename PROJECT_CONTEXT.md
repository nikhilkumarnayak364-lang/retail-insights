# Retail Insights — Complete Project Specification & LLM Context Document

> **Purpose of this file:** This single document provides a complete, self-contained overview of the **Retail Insights** codebase, architecture, data algorithms, technology stack, file structure, API endpoints, and production deployment configuration. Feed this file to any LLM (such as ChatGPT, Claude, or Gemini) to give it immediate, complete understanding of the entire project.

---

## 1. Executive Summary

- **Project Name:** Retail Insights (Enterprise Retail Analytics & Business Intelligence Platform)
- **Primary Domain:** Multi-category retail business intelligence (Fashion/Clothing, Supermarket/Grocery, Consumer Electronics, and General Retail).
- **Core Functionality:**
  1. Ingests raw sales transaction CSVs from POS and ERP systems.
  2. Dynamically normalizes varying header schemas using fuzzy regex mapping.
  3. Computes comprehensive analytics across 6 core retail domains:
     - **Sales Trends & Velocity**
     - **Product Catalog & Margin Economics**
     - **Customer RFM Segmentation & Cohorts**
     - **Geographic Store & City Benchmarking**
     - **Category & Subcategory Taxonomy Hierarchy**
     - **Checkout Tender & Interchange Fee Economics**
  4. Generates an automated **Prescriptive Recommendation Engine** and a **100-Point Retail Health Score** with actionable financial impact estimates.
  5. Provides real-time currency conversion across **USD ($)**, **INR (₹)**, **EUR (€)**, and **GBP (£)**.
  6. Connects to **MongoDB Atlas Cloud Database** for scalable persistence, with a local JSON store fallback for offline execution.
- **Production Status:** Live and fully deployed:
  - **Frontend:** Deployed on Vercel (`https://frontend-m5va.vercel.app`)
  - **Backend:** Deployed on Render (`https://retail-insights-backend.onrender.com`)
  - **Database:** MongoDB Atlas M0 Cluster (`retail_insights` database)

---

## 2. Technology Stack & Strict Boundary Rules

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Language:** TypeScript 5.6
- **Styling:** Tailwind CSS 3.4
- **Charts:** Recharts 2.15 (Area, Bar, Donut, Line charts with custom tooltips)
- **Icons:** Lucide React
- **Client Port:** `:3000` (Local) / Vercel Edge (Production)

### Backend
- **Language:** Python 3.11+ / 3.13+
- **Framework:** FastAPI (ASGI web framework)
- **Web Server:** Uvicorn
- **Data Processing:** Python Pandas 2.2+ & NumPy 1.26+
- **Validation & Settings:** Pydantic v2 & Pydantic Settings
- **Database Driver:** PyMongo 4.6+ with `dnspython` (SRV DNS resolution)
- **Server Port:** `:8000` (Local) / Render Managed Port (Production)

### Database Layer
- **Cloud Database:** MongoDB Atlas (M0 Shared Cluster or Dedicated)
  - Collections: `datasets` (metadata, summary statistics, schema mappings), `transactions` (normalized transaction line items).
  - Indexes: Compound indexes on `(dataset_id, date)`, `(dataset_id, transaction_id)`, `(dataset_id, category)`, `(dataset_id, customer_id)`.
- **Offline Fallback:** Local persistent JSON repository at `backend/data/local_store.json` (auto-activates when `MONGODB_URI` is unconfigured).

### Architectural Boundary Rules
1. **Python as Sole Analytics Engine:** All business logic, statistical formulas, aggregations, and data manipulations are strictly executed in Python. Node.js is exclusively a build tool and runtime for Next.js frontend rendering.
2. **No Direct Frontend-to-Database Communication:** The frontend never connects to MongoDB directly. All operations pass through authenticated FastAPI endpoints.
3. **Resilient Network Handshake:** Centralized API client (`frontend/src/services/api.ts`) automatically routes requests to localhost when developing on PC, and routes to the live Render cloud backend when accessed via public URLs (Vercel, custom domain, mobile).

---

## 3. High-Level Architecture Flow

```
┌────────────────────────────────────────────────────────┐
│             User Mobile & Desktop Browsers             │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS
                            ▼
┌────────────────────────────────────────────────────────┐
│             Frontend: Next.js 14 (Vercel)              │
│  - App Router (/src/app)                               │
│  - Recharts Visualizations (/src/components/analytics) │
│  - Centralized API Service (/src/services/api.ts)      │
│  - Dynamic Currency Context (/src/context)             │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (CORS Allowed)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Backend: Python FastAPI (Render)           │
│  - Routing & Validation (/backend/app/api)             │
│  - Analytical Engines (/backend/app/analytics)         │
│  - Dataset & Repository Services (/backend/app/services│
│  - Database Manager (/backend/app/database)            │
└───────────────────────────┬────────────────────────────┘
                            │ mongodb+srv:// (SSL/TLS)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Storage: MongoDB Atlas                   │
│  - Database: retail_insights                           │
│  - Collections: datasets, transactions                 │
└────────────────────────────────────────────────────────┘
```

---

## 4. Repository Structure & File Guide

```
c:\NEW PROJECT\
├── render.yaml                    # Infrastructure-as-code blueprint for Render
├── vercel.json                    # Monorepo configuration for Vercel
├── .gitignore                     # Git ignore rules (protects .env and credentials)
├── README.md                      # Primary project readme
├── docs/
│   ├── architecture.md            # Detailed system design & Mermaid diagrams
│   └── deployment.md              # Complete cloud deployment guide
├── backend/
│   ├── Dockerfile                 # Production Python 3.11 container build
│   ├── .dockerignore              # Excludes virtualenv and local cache from Docker
│   ├── requirements.txt           # Python packages (FastAPI, Pandas, PyMongo[srv], etc.)
│   ├── run_backend.bat            # Windows 1-click batch launcher
│   ├── run_backend.ps1            # Windows PowerShell launcher
│   ├── .env.example               # Template environment configuration
│   ├── sample_data/               # Realistic retail CSV datasets
│   │   ├── clothing_retail_sales.csv
│   │   ├── coffee_shop_cafe_sales.csv
│   │   ├── electronics_retail_sales.csv
│   │   ├── grocery_supermarket_sales.csv
│   │   └── sports_fitness_gear_sales.csv
│   ├── app/
│   │   ├── main.py                # FastAPI app initialization, CORS & lifespan
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic Settings, environment variables & CORS
│   │   │   ├── logging.py         # Standardized structured logging
│   │   │   └── security.py        # API key authentication & rate limiting
│   │   ├── database/
│   │   │   ├── connection.py      # MongoDB Atlas client with ping verification
│   │   │   └── repository.py      # DatasetRepository abstraction (Atlas + JSON fallback)
│   │   ├── analytics/             # PURE ANALYTICAL & STATISTICAL ENGINES
│   │   │   ├── ingestion.py       # CSV parser, schema synonym matcher, data validator
│   │   │   ├── sales_analytics.py # Time-series, temporal weekday/hourly cycles, velocity
│   │   │   ├── product_analytics.py # Best-seller rankings, margin tiers, dead stock
│   │   │   ├── customer_analytics.py # RFM segmentation, customer lifetime value (CLV)
│   │   │   ├── geographic_analytics.py # Regional revenue, store fleet benchmarking
│   │   │   ├── category_analytics.py # Department & subcategory hierarchy
│   │   │   ├── payment_analytics.py # Tender mix, digital adoption, interchange fees
│   │   │   └── insights_engine.py # Heuristic recommendation engine & health score
│   │   ├── api/
│   │   │   ├── api_router.py      # Central API router combining all route modules
│   │   │   └── routes/            # Individual REST endpoint controllers
│   │   ├── models/                # Database documents & internal entity representations
│   │   ├── schemas/               # Pydantic request & response validation schemas
│   │   ├── services/              # Business logic controllers
│   │   └── utils/
│   │       ├── currency_rates.py  # Real-time FX conversion engine
│   │       └── sample_generator.py # Synthetic retail data generator
│   └── tests/                     # 20+ automated PyTest integration & scale tests
└── frontend/
    ├── package.json               # Next.js, React, Tailwind, Lucide & Recharts packages
    ├── next.config.mjs            # Next.js production configuration
    ├── tsconfig.json              # TypeScript configuration
    ├── tailwind.config.ts         # Tailwind styling tokens & breakpoints
    ├── vercel.json                # Vercel project preset
    ├── .env.example               # Frontend environment template
    └── src/
        ├── app/
        │   ├── layout.tsx         # Root layout with CurrencyProvider
        │   ├── page.tsx           # Dashboard view orchestrator & navigation
        │   └── globals.css        # Responsive styling & scrollbar containment
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.tsx    # Responsive navigation drawer (collapsible on mobile)
        │   │   └── TopNavbar.tsx  # System health status, dataset badge & currency dropdown
        │   ├── dashboard/         # Shared dashboard cards & health status banner
        │   ├── analytics/         # Specialized dashboard views for each analytical domain
        │   ├── datasets/          # DataExplorerView table & DatasetUploadModal
        │   ├── insights/          # BusinessInsightsView (Health Score & Prescriptive Actions)
        │   ├── settings/          # SettingsView (System diagnostics & environment specs)
        │   └── currency/          # CurrencyConverterModal
        ├── context/
        │   └── CurrencyContext.tsx # Currency state, formatting rules & FX multipliers
        ├── hooks/
        │   ├── useBackendHealth.ts # Connection polling & latency benchmark hook
        │   └── useDatasets.ts     # Ingestion & dataset activation hook
        ├── services/
        │   └── api.ts             # Centralized HTTP client service
        └── types/
            └── api.ts             # TypeScript interfaces for all backend API contracts
```

---

## 5. Analytical Algorithms & Mathematical Models

Rather than using opaque machine learning models that require training epochs and are prone to hallucinations, Retail Insights uses **deterministic statistical modeling and heuristic expert systems** executed via vectorized Pandas and NumPy operations:

### 1. Schema Synonym Normalization (`ingestion.py`)
- Analyzes raw CSV column headers against a dictionary of canonical retail synonyms:
  - `transaction_id`: `["invoice no", "order id", "receipt id", "bill no", "trx id"]`
  - `date`: `["timestamp", "order date", "sale date", "purchase date"]`
  - `product_name`: `["item description", "description", "title", "sku name"]`
  - `category`: `["department", "merchandise group", "family", "section"]`
  - `unit_cost`: `["cogs", "wholesale price", "cost price", "supplier cost"]`
- Strips punctuation, lowercases strings, cleans whitespace.
- Imputes missing cost data using a 30% gross margin baseline while setting `cost_data_available: false`.

### 2. RFM Customer Segmentation Algorithm (`customer_analytics.py`)
- Computes 3 behavioral scores for each unique customer:
  - **Recency ($R$):** Days elapsed since customer's last recorded order.
  - **Frequency ($F$):** Total count of unique orders placed.
  - **Monetary ($M$):** Total cumulative currency spent.
- Evaluates median/quantile distribution cutoffs across the dataset to classify customers into 8 cohorts:
  1. *Champions* (High $R$, High $F$, High $M$)
  2. *Loyal Customers* (High $F$, High $M$)
  3. *Recent Big Spenders* (Low $R$, High $M$)
  4. *Potential Loyalists* (Low $R$, High $F$)
  5. *At Risk* (High $R$, High $M$ — high spenders who haven't returned)
  6. *Dormant / Needs Reactivation* (High $R$, Moderate $M$)
  7. *Recent / New Shoppers* (Low $R$, Single purchase)
  8. *Low Engagement / Hibernating* (High $R$, Low $F$, Low $M$)

### 3. Product Margin & Velocity Matrix (`product_analytics.py`)
- Segments catalog SKUs across sales volume (velocity) and profit margins:
  - **Stars:** High volume + high gross margin (&ge; 30%).
  - **Cash Cows:** High volume + low gross margin (&lt; 20%).
  - **Dead Stock Alert:** Low volume (&le; 2 units sold over operating window).

### 4. Fleet Performance Indexing (`geographic_analytics.py`)
- Standardizes store performance against the entire fleet average:
  $$\text{Performance Index} = \left(\frac{\text{Store AOV}}{\text{Fleet Mean AOV}}\right) \times 100$$
  - Score &gt; 110: *Outperforming store*
  - Score 90–110: *Fleet average*
  - Score &lt; 90: *Underperforming store*

### 5. Prescriptive Recommendation Engine & Health Score (`insights_engine.py`)
- **Margin Leakage Scanner:** Flags high-velocity products operating below 20% margin and calculates estimated gross profit expansion if priced 5–8% higher:
  $$\text{Potential Gain} = \text{Leaking SKU Revenue} \times 0.08$$
- **Dead Stock Capital Recovery:** Identifies stagnant inventory and models recoverable cash from clearance:
  $$\text{Recoverable Capital} = \text{Stagnant Inventory Revenue} \times 0.65$$
- **100-Point Retail Health Score:**
  - Profit Margin Health (25 pts, benchmark &gt; 30%)
  - Customer Retention (25 pts, benchmark &gt; 25% repeat rate)
  - Catalog Velocity (25 pts, benchmark &lt; 15% slow movers)
  - Store Network Balance (25 pts, benchmark &lt; 20% variance)
  - Translates into letter grades (`A+`, `A`, `B`, `C`, `Needs Attention`).

---

## 6. Complete REST API Specifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root API health status & project metadata |
| `GET` | `/api/health` | Comprehensive system diagnostic & MongoDB connectivity check |
| `GET` | `/api/health/frontend-check` | Latency handshake test called by Next.js client |
| `POST` | `/api/datasets/upload` | Upload and normalize raw retail CSV (`multipart/form-data`) |
| `GET` | `/api/datasets` | List all ingested datasets with summary KPIs |
| `GET` | `/api/datasets/active` | Get currently active dataset metadata |
| `GET` | `/api/datasets/{id}` | Get metadata for specific dataset |
| `GET` | `/api/datasets/{id}/preview` | Paginated transaction rows with search and column sorting |
| `POST` | `/api/datasets/{id}/activate` | Set active dataset powering dashboard views |
| `DELETE` | `/api/datasets/{id}` | Delete dataset and all associated transaction records |
| `POST` | `/api/datasets/sample/{type}` | 1-Click sample generator (`clothing`, `grocery`, `electronics`) |
| `GET` | `/api/analytics/sales` | Time-series daily trends, day-of-week, peak hours, sales velocity |
| `GET` | `/api/analytics/products` | Best-seller rankings, margin breakdown, price sensitivity tiers |
| `GET` | `/api/analytics/customers` | RFM segmentation, customer lifetime value (CLV), demographics |
| `GET` | `/api/analytics/geographic` | Regional revenue breakdown, store benchmarking, city rankings |
| `GET` | `/api/analytics/categories` | Department & subcategory revenue, profit, SKU diversity |
| `GET` | `/api/analytics/payments` | Tender mix, interchange fee estimation, digital vs cash share |
| `GET` | `/api/analytics/insights` | Prescriptive recommendations, anomaly alerts, health score |
| `GET` | `/api/currency/rates` | Real-time exchange rates (USD, INR, EUR, GBP) |
| `POST` | `/api/currency/convert` | Multi-currency conversion calculator endpoint |

---

## 7. Cloud Deployment Configuration

### Frontend on Vercel
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `frontend/.next`
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL`: `https://retail-insights-backend.onrender.com`

### Backend on Render
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `PYTHON_VERSION`: `3.11.8`
  - `MONGODB_URI`: `mongodb+srv://...`
  - `MONGODB_DATABASE`: `retail_insights`
  - `FRONTEND_ORIGIN`: `https://*.vercel.app`
  - `ENVIRONMENT`: `production`

---

## 8. Quick Start for Developers

### Local Execution (Windows)
1. **Double-click:** `run_all.bat` (starts both backend and frontend).
2. **Backend Docs:** Visit `http://localhost:8000/docs` (Interactive Swagger UI).
3. **Frontend Dashboard:** Visit `http://localhost:3000`.

### Running Automated Tests
```powershell
cd backend
.\venv\Scripts\pytest.exe tests -v
```
Executes all 20 PyTest integration tests verifying data validation, analytics math, and MongoDB repository operations.
