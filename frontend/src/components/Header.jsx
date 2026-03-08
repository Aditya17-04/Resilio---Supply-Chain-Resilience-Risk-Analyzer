import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { alerts } from '../data/dummyData'

const pageTitles = {
  '/': 'Dashboard Overview',
  '/map': 'Global Supply Chain Map',
  '/graph': 'Multi-Tier Supplier Graph',
  '/risk-scoring': 'AI Risk Scoring',
  '/prediction': 'Disruption Prediction',
  '/spof': 'Single Point of Failure Detector',
  '/alternatives': 'Alternative Supplier Recommendations',
  '/industries': 'National Critical Industry Monitor',
  '/alerts': 'Real-Time Risk Alerts',
  '/simulation': 'Supply Chain Simulation',
  '/heatmap': 'Global Risk Heatmap',
  '/copilot': 'Supply Chain Copilot',
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showAlerts, setShowAlerts] = useState(false)
  const title = pageTitles[location.pathname] || 'Resilio'
  const activeAlerts = alerts.filter(a => a.status === 'active')

  const alertColors = {
    CRITICAL: 'border-l-red-500 bg-red-500/5',
    HIGH: 'border-l-orange-500 bg-orange-500/5',
    MEDIUM: 'border-l-amber-500 bg-amber-500/5',
    LOW: 'border-l-blue-500 bg-blue-500/5',
  }

  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 flex items-center px-6 gap-4 z-30">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-slate-200">{title}</h1>
      </div>

      {/* Global risk indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700/50">
        <div className="w-2 h-2 rounded-full bg-amber-400 pulse-ring"></div>
        <span className="text-xs text-slate-400">Global Risk:</span>
        <span className="text-xs font-bold text-amber-400">ELEVATED</span>
        <span className="text-xs text-slate-500">70/100</span>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
        Live
      </div>

      {/* Alerts bell */}
      <div className="relative">
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-all text-slate-400 hover:text-white"
        >
          <span className="text-sm">🔔</span>
          {activeAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {activeAlerts.length}
            </span>
          )}
        </button>

        {showAlerts && (
          <div className="absolute right-0 top-10 w-80 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 z-50">
            <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
              <span className="font-semibold text-sm text-white">Active Alerts</span>
              <button
                onClick={() => { navigate('/alerts'); setShowAlerts(false) }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                View all →
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {activeAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`border-l-2 ${alertColors[alert.type]} rounded-r-lg p-2.5 flex items-start gap-2`}>
                  <div className={`text-xs font-bold flex-shrink-0 mt-0.5 ${alert.type === 'CRITICAL' ? 'text-red-400' :
                    alert.type === 'HIGH' ? 'text-orange-400' :
                      alert.type === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                    {alert.type}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 leading-tight">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{alert.supplier}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="text-xs text-slate-500">
        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </header>
  )
}
