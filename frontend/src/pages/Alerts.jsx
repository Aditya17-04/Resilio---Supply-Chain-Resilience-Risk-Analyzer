import { useState } from 'react'
import { alerts as dummyAlerts } from '../data/dummyData'
import useApi from '../hooks/useApi'
import { getAlerts } from '../lib/api'

const typeConfig = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', borderL: 'border-l-red-500', dot: 'bg-red-500', icon: '🔴' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/40', borderL: 'border-l-orange-500', dot: 'bg-orange-500', icon: '🟠' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', borderL: 'border-l-amber-500', dot: 'bg-amber-500', icon: '🟡' },
  LOW: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/40', borderL: 'border-l-blue-500', dot: 'bg-blue-400', icon: '🔵' },
}

const statusConfig = {
  active: { label: 'Active', color: 'text-red-400', bg: 'bg-red-500/10 border border-red-500/30' },
  monitoring: { label: 'Monitoring', color: 'text-amber-400', bg: 'bg-amber-500/10 border border-amber-500/30' },
  resolved: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/30' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Alerts() {
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const { data } = useApi(getAlerts, [])
  const alerts = data?.alerts ?? dummyAlerts

  const filtered = alerts
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => typeFilter === 'all' || a.type === typeFilter)

  const counts = {
    all: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    monitoring: alerts.filter(a => a.status === 'monitoring').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'all', label: 'Total Alerts', color: 'text-slate-200' },
          { key: 'active', label: 'Active', color: 'text-red-400' },
          { key: 'monitoring', label: 'Monitoring', color: 'text-amber-400' },
          { key: 'resolved', label: 'Resolved', color: 'text-emerald-400' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`stat-card text-left hover:bg-slate-700/40 transition-all ${filter === s.key ? 'ring-2 ring-blue-500/50' : ''}`}
          >
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{counts[s.key]}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700/50">
          {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${typeFilter === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >{t}</button>
          ))}
        </div>
        <div className="ml-auto text-xs text-slate-500">{filtered.length} alerts shown</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Alert List */}
        <div className="col-span-2 space-y-2">
          {filtered.map(alert => {
            const tc = typeConfig[alert.type]
            const sc = statusConfig[alert.status]
            const isSelected = selected?.id === alert.id
            return (
              <div
                key={alert.id}
                onClick={() => setSelected(isSelected ? null : alert)}
                className={`glass-card p-4 cursor-pointer hover:bg-slate-700/30 transition-all border-l-4 ${tc.borderL} ${isSelected ? 'ring-2 ring-blue-500/40' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-0.5">{tc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${tc.color} ${tc.bg} border ${tc.border} px-2 py-0.5 rounded-full`}>{alert.type}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      <span className="text-xs text-slate-500">{alert.industry}</span>
                      <span className="text-xs text-slate-600 ml-auto">{timeAgo(alert.timestamp)}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-slate-200 mt-1">{alert.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>📍 {alert.supplier}</span>
                      <span>💰 {alert.affectedVolume}</span>
                      <span>📊 {alert.probability}% probability</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-3">
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold" style={{ color: alert.probability >= 70 ? '#ef4444' : alert.probability >= 40 ? '#f59e0b' : '#10b981' }}>
                        {alert.probability}%
                      </div>
                      <div className="text-xs text-slate-500">Probability</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <div className="text-sm font-bold text-amber-400">{alert.affectedVolume}</div>
                      <div className="text-xs text-slate-500">Exposure</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <div className={`text-sm font-bold ${sc.color}`}>{sc.label}</div>
                      <div className="text-xs text-slate-500">Status</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="glass-card p-10 text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-slate-400">No alerts matching your filters</p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-3">
          {/* Alert breakdown by severity */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="section-title">Alert Breakdown</h3>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(type => {
              const count = alerts.filter(a => a.type === type).length
              const tc = typeConfig[type]
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs">{tc.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className={tc.color + ' font-semibold'}>{type}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="risk-bar">
                      <div className="h-full rounded-full" style={{
                        width: `${(count / alerts.length) * 100}%`,
                        backgroundColor: tc.dot.replace('bg-', '').includes('red') ? '#ef4444' :
                          tc.dot.includes('orange') ? '#f97316' :
                          tc.dot.includes('amber') ? '#f59e0b' : '#3b82f6'
                      }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Email Alert config */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="section-title">Alert Notifications</h3>
            <div className="space-y-2">
              {['Email Alerts', 'Dashboard Notifications', 'SMS Alerts', 'Slack Integration'].map((item, i) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{item}</span>
                  <div className={`w-8 h-4 rounded-full relative cursor-pointer ${i !== 2 ? 'bg-blue-500' : 'bg-slate-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${i !== 2 ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400">Alert Email</label>
              <input className="input-field w-full mt-1" defaultValue="analyst@company.com" />
            </div>
            <button className="btn-primary w-full justify-center">Save Settings</button>
          </div>

          {/* Quick stats */}
          <div className="glass-card p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Stats</h4>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Avg response time</span>
              <span className="text-slate-200 font-medium">2.4 hours</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Resolved this week</span>
              <span className="text-emerald-400 font-medium">3</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">False positive rate</span>
              <span className="text-slate-200 font-medium">8.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
