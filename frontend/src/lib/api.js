const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const getSuppliers = (params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString()
  return fetchJSON(`/api/suppliers/${q ? '?' + q : ''}`)
}

// ── Risk ──────────────────────────────────────────────────────────────────────
export const getRiskScores = (industry) =>
  fetchJSON(`/api/risk/scores${industry ? `?industry=${encodeURIComponent(industry)}` : ''}`)

export const getRiskIndustries = () => fetchJSON('/api/risk/industries')
export const getRiskTrend = () => fetchJSON('/api/risk/trend')
export const getRiskPrediction = () => fetchJSON('/api/risk/prediction')
export const getRiskHeatmap = () => fetchJSON('/api/risk/heatmap')

// ── Alerts ────────────────────────────────────────────────────────────────────
export const getAlerts = (params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString()
  return fetchJSON(`/api/alerts/${q ? '?' + q : ''}`)
}

// ── Simulation ────────────────────────────────────────────────────────────────
export const getSimulationScenarios = () => fetchJSON('/api/simulation/scenarios')
export const runSimulationAPI = (body) =>
  fetchJSON('/api/simulation/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
export const getSPOF = () => fetchJSON('/api/simulation/spof')

// ── Copilot ───────────────────────────────────────────────────────────────────
export const queryCopilot = (query, context) =>
  fetchJSON('/api/copilot/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, context }),
  })

// ── Realtime ──────────────────────────────────────────────────────────────────
export const getRealtimeDashboard = () => fetchJSON('/api/realtime/dashboard')
export const getRealtimeWeather = () => fetchJSON('/api/realtime/weather')
export const getRealtimeStocks = () => fetchJSON('/api/realtime/stocks')
export const getExchangeRates = () => fetchJSON('/api/realtime/exchange-rates')
export const getTradeFlows = () => fetchJSON('/api/realtime/trade-flows')
export const getEnrichedSupplier = (id) => fetchJSON(`/api/realtime/supplier/${id}`)
