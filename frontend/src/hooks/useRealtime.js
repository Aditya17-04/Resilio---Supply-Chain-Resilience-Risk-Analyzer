import { useState, useEffect } from 'react'
import { getRealtimeDashboard } from '../lib/api'

/**
 * Polls /api/realtime/dashboard on a fixed interval.
 * @param {number} intervalMs  - polling interval in ms (default: 60 s)
 */
export default function useRealtime(intervalMs = 60_000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  function refresh() {
    getRealtimeDashboard()
      .then(d => { setData(d); setLoading(false); setLastUpdated(new Date()) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs])

  return { data, loading, lastUpdated, refresh }
}
