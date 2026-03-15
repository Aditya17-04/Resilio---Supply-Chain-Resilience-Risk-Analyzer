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

export const queryCopilotStream = async (query, context, handlers = {}) => {
  const { onToken, onDone } = handlers
  const res = await fetch(`${BASE}/api/copilot/query/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, context }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`API /api/copilot/query/stream → ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const events = buffer.split('\n\n')
    buffer = events.pop() || ''

    for (const event of events) {
      const lines = event.split('\n')
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payloadText = line.slice(5).trim()
        if (!payloadText) continue

        let payload
        try {
          payload = JSON.parse(payloadText)
        } catch {
          continue
        }

        if (payload.error) {
          throw new Error(payload.error)
        }

        if (payload.token && onToken) {
          onToken(payload.token)
        }

        if (payload.done && onDone) {
          onDone()
        }
      }
    }
  }
}

// ── Realtime ──────────────────────────────────────────────────────────────────
export const getRealtimeDashboard = () => fetchJSON('/api/realtime/dashboard')
export const getRealtimeWeather = () => fetchJSON('/api/realtime/weather')
export const getRealtimeStocks = () => fetchJSON('/api/realtime/stocks')
export const getExchangeRates = () => fetchJSON('/api/realtime/exchange-rates')
export const getTradeFlows = () => fetchJSON('/api/realtime/trade-flows')
export const getEnrichedSupplier = (id) => fetchJSON(`/api/realtime/supplier/${id}`)
