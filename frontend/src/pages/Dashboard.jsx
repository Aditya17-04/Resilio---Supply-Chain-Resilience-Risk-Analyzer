import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  suppliers as dummySuppliers,
  alerts as dummyAlerts,
  industries,
  riskTrend as dummyRiskTrend,
  disruptionPredictions as dummyPredictions,
  getRiskColor, getRiskLevel,
} from '../data/dummyData'
import useApi from '../hooks/useApi'
import useRealtime from '../hooks/useRealtime'
import { getSuppliers, getAlerts, getRiskTrend, getRiskPrediction } from '../lib/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-2.5 text-xs shadow-xl">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: suppliersData } = useApi(getSuppliers, [])
  const { data: alertsData }    = useApi(getAlerts,    [])
  const { data: trendData }     = useApi(getRiskTrend, [])
  const { data: predData }      = useApi(getRiskPrediction, [])
  const { data: live, lastUpdated } = useRealtime(60_000)

  const suppliers          = suppliersData?.suppliers           ?? dummySuppliers
  const alerts             = alertsData?.alerts                  ?? dummyAlerts
  const riskTrend          = trendData?.trend                    ?? dummyRiskTrend
  const disruptionPredictions = predData?.predictions            ?? dummyPredictions

  const highRisk      = suppliers.filter(s => s.riskScore >= 70).length
  const mediumRisk    = suppliers.filter(s => s.riskScore >= 40 && s.riskScore < 70).length
  const lowRisk       = suppliers.filter(s => s.riskScore < 40).length
  const criticalAlerts = alerts.filter(a => (a.type === 'CRITICAL' || a.type === 'critical') && a.status === 'active').length
  const avgRisk       = Math.round(suppliers.reduce((sum, s) => sum + s.riskScore, 0) / suppliers.length)

  const riskDist = [
    { name: 'Low', value: lowRisk, color: '#10b981' },
    { name: 'Medium', value: mediumRisk, color: '#f59e0b' },
    { name: 'High', value: highRisk, color: '#ef4444' },
  ]

  const industryBar = industries.map(i => ({
    name: i.name.split(' ')[0],
    risk: i.riskScore,
    fill: i.riskScore >= 70 ? '#ef4444' : i.riskScore >= 40 ? '#f59e0b' : '#10b981',
  }))

  const topRiskSuppliers = [...suppliers].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5)
  const recentAlerts = alerts.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card glow-blue">
          <div className="text-slate-400 text-xs font-medium">Total Suppliers</div>
          <div className="text-3xl font-bold text-white">{suppliers.length}</div>
          <div className="text-xs text-slate-500">Across {[...new Set(suppliers.map(s => s.country))].length} countries</div>
        </div>
        <div className="stat-card">
          <div className="text-slate-400 text-xs font-medium">Average Risk Score</div>
          <div className="text-3xl font-bold" style={{ color: getRiskColor(avgRisk) }}>{avgRisk}</div>
          <div className="text-xs text-amber-400 font-medium">{getRiskLevel(avgRisk)} RISK</div>
        </div>
        <div className="stat-card glow-red">
          <div className="text-slate-400 text-xs font-medium">Critical Alerts</div>
          <div className="text-3xl font-bold text-red-400">{criticalAlerts}</div>
          <div className="text-xs text-red-400/70">Requires immediate action</div>
        </div>
        <div className="stat-card">
          <div className="text-slate-400 text-xs font-medium">High Risk Suppliers</div>
          <div className="text-3xl font-bold text-red-400">{highRisk}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 risk-bar">
              <div className="risk-bar-fill bg-red-500" style={{ width: `${(highRisk / suppliers.length) * 100}%` }}></div>
            </div>
            <span className="text-xs text-slate-500">{Math.round((highRisk / suppliers.length) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Risk Trend Chart */}
        <div className="col-span-8 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Global Risk Trend</h3>
            <span className="text-xs text-slate-500">Last 8 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={riskTrend}>
              <defs>
                <linearGradient id="globalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="geoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="global" name="Global" stroke="#3b82f6" fill="url(#globalGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="geopolitical" name="Geopolitical" stroke="#ef4444" fill="url(#geoGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="climate" name="Climate" stroke="#10b981" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="col-span-4 glass-card p-5">
          <h3 className="section-title mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                {riskDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {riskDist.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }}></div>
                <span className="text-xs text-slate-400 flex-1">{d.name} Risk</span>
                <span className="text-xs font-semibold text-slate-200">{d.value} suppliers</span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Risk Bar */}
        <div className="col-span-5 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Industry Risk Levels</h3>
            <button onClick={() => navigate('/industries')} className="text-xs text-blue-400 hover:text-blue-300">View →</button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={industryBar} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="risk" name="Risk Score" radius={[4, 4, 0, 0]}>
                {industryBar.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Risk Suppliers */}
        <div className="col-span-7 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Top Risk Suppliers</h3>
            <button onClick={() => navigate('/risk-scoring')} className="text-xs text-blue-400 hover:text-blue-300">View all →</button>
          </div>
          <div className="space-y-2.5">
            {topRiskSuppliers.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{s.name}</span>
                    <span className="text-xs text-slate-500">{s.country}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 risk-bar">
                      <div
                        className="risk-bar-fill"
                        style={{
                          width: `${s.riskScore}%`,
                          backgroundColor: getRiskColor(s.riskScore)
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: getRiskColor(s.riskScore) }}>{s.riskScore}</span>
                  </div>
                </div>
                <span className={getRiskLevel(s.riskScore) === 'HIGH' ? 'risk-badge-high' : getRiskLevel(s.riskScore) === 'MEDIUM' ? 'risk-badge-medium' : 'risk-badge-low'}>
                  {getRiskLevel(s.riskScore)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="col-span-6 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Alerts</h3>
            <button onClick={() => navigate('/alerts')} className="text-xs text-blue-400 hover:text-blue-300">View all →</button>
          </div>
          <div className="space-y-2">
            {recentAlerts.map(alert => {
              const typeColors = {
                CRITICAL: 'border-red-500/60 bg-red-500/5',
                HIGH: 'border-orange-500/60 bg-orange-500/5',
                MEDIUM: 'border-amber-500/60 bg-amber-500/5',
                LOW: 'border-blue-500/60 bg-blue-500/5',
              }
              const textColors = {
                CRITICAL: 'text-red-400',
                HIGH: 'text-orange-400',
                MEDIUM: 'text-amber-400',
                LOW: 'text-blue-400',
              }
              return (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border-l-2 ${typeColors[alert.type]}`}>
                  <div className={`text-xs font-bold flex-shrink-0 min-w-[52px] ${textColors[alert.type]}`}>{alert.type}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{alert.supplier} · {new Date(alert.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-slate-500">{alert.probability}%</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Disruption Forecast */}
        <div className="col-span-6 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">4-Week Disruption Forecast</h3>
            <button onClick={() => navigate('/prediction')} className="text-xs text-blue-400 hover:text-blue-300">Details →</button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={disruptionPredictions} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="semiconductors" name="Semiconductors" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="energy" name="Energy" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="food" name="Food" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Run Simulation', desc: 'Test failure scenarios', path: '/simulation', color: 'blue' },
          { label: 'View Heatmap', desc: 'Global risk visualization', path: '/heatmap', color: 'amber' },
          { label: 'Find Alternatives', desc: 'Backup supplier search', path: '/alternatives', color: 'emerald' },
          { label: 'Ask Copilot', desc: 'AI supply chain insights', path: '/copilot', color: 'purple' },
        ].map(action => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="glass-card p-4 text-left hover:bg-slate-700/40 transition-all group"
          >
            <div className="font-semibold text-sm text-slate-200 group-hover:text-white">{action.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{action.desc}</div>
          </button>
        ))}
      </div>

      {/* Live Signals */}
      {live && (
        <div className="glass-card p-5 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <h3 className="section-title">Live Signals</h3>
            </div>
            <span className="text-xs text-slate-500">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Updating…'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* Weather */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">⛈ Weather Alerts</div>
              {(live.weather_alerts?.length === 0 && live.weather_conditions?.length === 0) && (
                <p className="text-xs text-slate-500">No data available</p>
              )}
              {/* Show alerts first, fallback to top 3 current conditions */}
              {(live.weather_alerts?.length > 0 ? live.weather_alerts : live.weather_conditions?.slice(0, 3) ?? []).map(w => (
                <div key={w.supplier_id} className="flex items-start gap-2 mb-2">
                  <span className={`text-xs font-bold mt-0.5 flex-shrink-0 ${w.risk_contribution >= 15 ? 'text-red-400' : w.risk_contribution >= 5 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {w.risk_contribution > 0 ? `+${w.risk_contribution}` : '\u2014'}
                  </span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">{w.name}</div>
                    <div className="text-xs text-slate-500">{w.description || w.condition}{w.temp_c != null ? ` · ${Math.round(w.temp_c)}°C` : ''} · {w.country}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Stock movers */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">📈 Stock Movers</div>
              {live.stocks_rate_limited && live.stock_movers?.length === 0 && (
                <div>
                  <p className="text-xs text-amber-400/80">Alpha Vantage daily limit reached</p>
                  <p className="text-xs text-slate-600 mt-0.5">Resets at midnight UTC</p>
                </div>
              )}
              {!live.stocks_rate_limited && live.stock_movers?.length === 0 && (
                <p className="text-xs text-slate-500">No significant moves (≥2%)</p>
              )}
              {live.stock_movers?.slice(0, 3).map(s => (
                <div key={s.supplier_id} className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-medium text-slate-200">{s.symbol}</div>
                    <div className="text-xs text-slate-500">{s.supplier_name}</div>
                  </div>
                  <span className={`text-xs font-bold ${s.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.direction === 'up' ? '▲' : '▼'} {Math.abs(s.change_pct).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            {/* FX rates */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">💱 Key FX Rates (USD)</div>
              {live.exchange_rates?.available === false && (
                <p className="text-xs text-slate-500">Rates unavailable</p>
              )}
              {live.exchange_rates?.rates && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(live.exchange_rates.rates).slice(0, 8).map(([cur, rate]) => (
                    <div key={cur} className="flex justify-between text-xs">
                      <span className="text-slate-400">{cur}</span>
                      <span className="text-slate-200 font-medium">{Number(rate).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
