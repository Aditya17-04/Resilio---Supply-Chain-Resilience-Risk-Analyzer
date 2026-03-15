# Resilio — Supply Chain Resilience & Risk Analyzer

> A full-stack platform for real-time supply chain risk monitoring, AI-powered disruption prediction, and scenario simulation across 25 global suppliers.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Pages](#pages)
- [Real-Time Data Sources](#real-time-data-sources)
- [License](#license)

---

## Overview

Resilio is a supply chain intelligence platform that aggregates geopolitical, financial, climate, and transport risk signals across a global supplier network. It provides risk scoring, live market data integration, AI copilot analysis, and disruption simulation — all in a dark-themed, analytics-focused UI.

---

## Features

| Feature | Description |
|---|---|
| **Risk Scoring** | Per-supplier composite risk scores across 5 dimensions with SVG gauge rings and radar charts |
| **Risk Heatmap** | Geographic world heatmap showing regional risk intensity |
| **Disruption Prediction** | 4-week rolling forecasts per industry (Semiconductors, Pharma, Energy, Automotive, Food) |
| **Single Point of Failure** | Identification of critical nodes with zero or minimal alternatives |
| **Simulation Engine** | Scenario impact analysis (TSMC shutdown, Suez Canal closure, China embargo, etc.) |
| **AI Copilot** | Natural language supply chain Q&A backed by the backend analysis engine |
| **Live Signals** | Real-time weather alerts, stock movers, FX rates, and trade flows |
| **Alerts** | Prioritized alert feed (Critical / High / Medium / Low) with status tracking |
| **Industry Monitor** | Risk overview per industry with key driver breakdown |
| **Supply Chain Map** | Interactive Leaflet map of supplier locations |
| **Supplier Graph** | D3-powered dependency tree visualization |
| **Alternative Suppliers** | Substitution recommendations for high-risk nodes |
| **Auth** | Email/password sign-up, sign-in, and password reset via JWT + Supabase |

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| FastAPI | ≥0.115 | REST API framework |
| Uvicorn | ≥0.30 | ASGI server |
| Pydantic | ≥2.9 | Request/response validation |
| SQLAlchemy | ≥2.0 | ORM |
| psycopg2 | ≥2.9 | PostgreSQL driver |
| httpx | ≥0.27 | Async HTTP client for external APIs |
| scikit-learn | ≥1.5 | ML-based risk prediction |
| numpy | ≥2.1 | Numerical computation |
| python-jose | ≥3.3 | JWT token handling |
| bcrypt | ≥4.0 | Password hashing |
| python-dotenv | ≥1.0 | Environment variable loading |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| Recharts | 2 | Charts (radar, line, area, bar) |
| React Leaflet | 4 | Interactive maps |
| D3 | 7 | Supplier dependency graph |
| Framer Motion | 12 | Animations |
| Lucide React | 0.294 | Icon library |
| React Router | 6 | Client-side routing |
| @supabase/supabase-js | 2 | Auth/database client |

---

## Project Structure

```
Resilio---Supply-Chain-Resilience-Risk-Analyzer/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # SQLAlchemy engine & session
│   ├── models.py                # ORM models
│   ├── requirements.txt
│   ├── .env                     # API keys & secrets (never commit)
│   ├── data/
│   │   ├── dummy_data.py        # 25-supplier dataset, alerts, predictions
│   │   └── mock_data.py         # Alternative mock dataset
│   ├── routers/
│   │   ├── suppliers.py         # GET /api/suppliers
│   │   ├── risk.py              # GET /api/risk/*
│   │   ├── alerts.py            # GET /api/alerts
│   │   ├── simulation.py        # GET /api/simulation/*
│   │   ├── copilot.py           # POST /api/copilot/query
│   │   ├── auth.py              # POST /api/auth/*
│   │   └── realtime.py          # GET /api/realtime/*
│   └── services/
│       └── realtime_data.py     # External API integrations (TTL cache)
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx              # Routes & layout
        ├── main.jsx
        ├── data/
        │   └── dummyData.js     # Frontend fallback data
        ├── hooks/
        │   ├── useApi.js        # Generic data-fetching hook (with fallback)
        │   └── useRealtime.js   # Polling hook for live dashboard signals
        ├── lib/
        │   ├── api.js           # Centralized API client (all endpoints)
        │   └── supabaseClient.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Header.jsx
        │   ├── Sidebar.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── RiskScoring.jsx
            ├── RiskHeatmap.jsx
            ├── DisruptionPrediction.jsx
            ├── SinglePointFailure.jsx
            ├── Simulation.jsx
            ├── Alerts.jsx
            ├── IndustryMonitor.jsx
            ├── Copilot.jsx
            ├── SupplyChainMap.jsx
            ├── SupplierGraph.jsx
            ├── AlternativeSuppliers.jsx
            ├── SignIn.jsx
            ├── SignUp.jsx
            ├── ForgotPassword.jsx
            └── ResetPassword.jsx
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project (for the database and auth)

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your values (see [Environment Variables](#environment-variables)).

Start the development server:

```bash
python -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev -- --port 3000
```

The app will be available at `http://localhost:3000`.

---

### Environment Variables

Create `backend/.env` with the following keys:

```env
# ── Database (Supabase) ─────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/postgres

# ── Email / Password Reset ──────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=your_app_password

# The base URL shown in reset-password emails
APP_URL=http://localhost:3000

# ── Real-Time Data APIs ─────────────────────────────────────────────
ALPHA_VANTAGE_KEY=your_key      # https://www.alphavantage.co/support/#api-key
OPENWEATHER_KEY=your_key        # https://openweathermap.org/api
EXCHANGERATE_KEY=your_key       # https://www.exchangerate-api.com
COMTRADE_KEY=your_key           # https://comtradeplus.un.org

# ── AI Copilot (Groq) ───────────────────────────────────────────────
GROQ_API_KEY=your_groq_api_key  # https://console.groq.com/keys
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Note:** Alpha Vantage free tier allows 25 requests/day. Each dashboard load fetches 8 stock quotes. The API response is cached for 5 minutes to minimize consumption.

---

## API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/suppliers` | List all 25 suppliers (filterable by industry, tier, risk) |
| GET | `/api/suppliers/{id}` | Single supplier detail + supply chain links |
| GET | `/api/risk/scores` | Risk scores for all suppliers |
| GET | `/api/risk/heatmap` | Regional heatmap intensity data |
| GET | `/api/risk/trend` | 8-month global risk trend |
| GET | `/api/risk/prediction` | 4-week disruption forecasts |
| GET | `/api/risk/industries` | Industry-level risk aggregation |
| GET | `/api/alerts` | Active alerts (filterable by type/status) |
| GET | `/api/simulation/scenarios` | Available simulation scenarios |
| GET | `/api/simulation/spof` | Single points of failure |
| POST | `/api/copilot/query` | AI supply chain Q&A |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |
| GET | `/api/realtime/dashboard` | Aggregated live signals (weather + stocks + FX) |
| GET | `/api/realtime/weather` | Weather alerts for all supplier locations |
| GET | `/api/realtime/stocks` | Stock quotes for supplier tickers |
| GET | `/api/realtime/exchange-rates` | Live FX rates (8 currencies vs USD) |
| GET | `/api/realtime/trade-flows` | UN Comtrade import/export data |
| GET | `/api/realtime/supplier/{id}` | Enriched single-supplier data with live price |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | KPI cards, risk trend chart, distribution donut, live signals |
| `/risk-scoring` | Risk Scoring | Per-supplier scoring table with radar chart and gauge rings |
| `/risk-heatmap` | Risk Heatmap | World map with regional risk intensity overlay |
| `/prediction` | Disruption Prediction | 4-week forecast line charts per industry |
| `/spof` | Single Point of Failure | Critical dependency nodes ranked by risk |
| `/simulation` | Simulation | Scenario impact modeling and recovery timelines |
| `/alerts` | Risk Alerts | Live alert feed with filtering and status tracking |
| `/industries` | Industry Monitor | Risk summary per industry sector |
| `/copilot` | AI Copilot | Natural language supply chain assistant |
| `/map` | Supply Chain Map | Interactive Leaflet map of supplier locations |
| `/graph` | Supplier Graph | D3 dependency tree visualization |
| `/alternatives` | Alternative Suppliers | Substitution options for high-risk nodes |
| `/signin` | Sign In | Email/password login |
| `/signup` | Sign Up | Account registration |
| `/forgot-password` | Forgot Password | Password reset request |
| `/reset-password` | Reset Password | Password reset with email token |

---

## Real-Time Data Sources

| Source | Data | Free Tier Limit |
|---|---|---|
| [Alpha Vantage](https://www.alphavantage.co) | Stock quotes (TSM, Samsung, Maersk, Pfizer, etc.) | 25 requests/day |
| [OpenWeatherMap](https://openweathermap.org/api) | Current weather at 12 supplier locations | 1,000 calls/day |
| [ExchangeRate-API](https://www.exchangerate-api.com) | Live FX rates (EUR, CNY, JPY, KRW, TWD, INR, BRL, RUB) | 1,500 calls/month |
| [UN Comtrade](https://comtradeplus.un.org) | Trade flow data for 5 commodity HS codes | 500 calls/day |

All responses are cached in memory for 5 minutes to avoid exhausting free tier quotas.

---

## License

MIT © Resilio 2026