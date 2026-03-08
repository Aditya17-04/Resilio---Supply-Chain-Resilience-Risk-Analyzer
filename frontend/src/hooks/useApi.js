import { useState, useEffect, useRef } from 'react'

/**
 * Generic data-fetching hook.
 * @param {() => Promise<any>} fetchFn  - function returning a Promise
 * @param {any[]}              deps     - re-run when these change
 * @param {any}                fallback - value used when the API call fails
 */
export default function useApi(fetchFn, deps = [], fallback = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    setLoading(true)
    setError(null)
    fetchFn()
      .then(d => { if (mounted.current) { setData(d); setLoading(false) } })
      .catch(e => { if (mounted.current) { setError(e.message); setData(fallback); setLoading(false) } })
    return () => { mounted.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
