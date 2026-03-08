import { useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { suppliers, getRiskColor, getRiskLevel } from '../data/dummyData'

export default function RiskScoring() {
  const [selected, setSelected] = useState(null)
  const [sortBy, setSortBy] = useState('riskScore')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [search, setSearch] = useState('')

  const industries = ['all', ...new Set(suppliers.map(s => s.industry))]

  const filtered = suppliers
    .filter(s => filterIndustry === 'all' || s.industry === filterIndustry)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy])

  const radarData = selected ? [
    { subject: 'Geopolitical', A: selected.geopoliticalRisk },
    { subject: 'Disaster', A: selected.disasterRisk },
    { subject: 'Transport', A: selected.transportRisk },
    { subject: 'Financial', A: 100 - selected.financialStability },
    { subject: 'Concentration', A: selected.concentration === 'Critical' ? 95 : selected.concentration === 'High' ? 70 : selected.concentration === 'Medium' ? 40 : 20 },
  ] : []

  const getRiskBadgeStyle = (score) => {
    if (score >= 70) return 'bg-red-500/10 text-red-400 border-red-500/30'
    if (score >= 40) return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  }

  const getTierColor = (tier) => {
    if (tier === 1) return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    if (tier === 2) return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-48"
        />
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700/50">
          {industries.map(ind => (
            <button key={ind} onClick={() => setFilterIndustry(ind)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${filterIndustry === ind ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >{ind}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-40">
          <option value="riskScore">Sort: Risk Score</option>
          <option value="geopoliticalRisk">Sort: Geopolitical</option>
          <option value="disasterRisk">Sort: Disaster</option>
          <option value="transportRisk">Sort: Transport</option>
        </select>
        <div className="ml-auto text-xs text-slate-500">{filtered.length} suppliers</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Table */}
        <div className="col-span-2 glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Industry</th>
                  <th>Tier</th>
                  <th>Geopolitical</th>
                  <th>Disaster</th>
                  <th>Transport</th>
                  <th>Financial</th>
                  <th>Overall</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(selected?.id === s.id ? null : s)}
                    className={`cursor-pointer ${selected?.id === s.id ? 'bg-blue-500/10 !border-blue-500/30' : ''}`}
                  >
                    <td>
                      <div className="font-medium text-slate-200">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.country}</div>
                    </td>
                    <td><span className="text-xs text-slate-400">{s.industry}</span></td>
                    <td>
                      <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${getTierColor(s.tier)}`}>
                        Tier {s.tier}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 risk-bar">
                          <div className="risk-bar-fill" style={{ width: `${s.geopoliticalRisk}%`, backgroundColor: getRiskColor(s.geopoliticalRisk) }}></div>
                        </div>
                        <span className="text-xs font-medium" style={{ color: getRiskColor(s.geopoliticalRisk) }}>{s.geopoliticalRisk}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 risk-bar">
                          <div className="risk-bar-fill" style={{ width: `${s.disasterRisk}%`, backgroundColor: getRiskColor(s.disasterRisk) }}></div>
                        </div>
                        <span className="text-xs font-medium" style={{ color: getRiskColor(s.disasterRisk) }}>{s.disasterRisk}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 risk-bar">
                          <div className="risk-bar-fill" style={{ width: `${s.transportRisk}%`, backgroundColor: getRiskColor(s.transportRisk) }}></div>
                        </div>
                        <span className="text-xs font-medium" style={{ color: getRiskColor(s.transportRisk) }}>{s.transportRisk}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 risk-bar">
                          <div className="risk-bar-fill bg-emerald-500" style={{ width: `${s.financialStability}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-emerald-400">{s.financialStability}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-sm font-bold border px-2 py-1 rounded-lg ${getRiskBadgeStyle(s.riskScore)}`}>
                        {s.riskScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="space-y-3">
          {selected ? (
            <>
              <div className="glass-card p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-white">{selected.name}</h3>
                  <p className="text-xs text-slate-400">{selected.country} · {selected.industry}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl border-4 text-white"
                    style={{ borderColor: getRiskColor(selected.riskScore), color: getRiskColor(selected.riskScore) }}
                  >
                    {selected.riskScore}
                  </div>
                  <div>
                    <div className={`font-bold ${selected.riskScore >= 70 ? 'text-red-400' : selected.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {getRiskLevel(selected.riskScore)} RISK
                    </div>
                    <div className="text-xs text-slate-500">Overall risk score</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar name="Risk" dataKey="A" stroke={getRiskColor(selected.riskScore)} fill={getRiskColor(selected.riskScore)} fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-700/40 rounded-lg p-2">
                    <div className="text-slate-500">Revenue</div>
                    <div className="font-semibold text-slate-200">{selected.revenue}</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-2">
                    <div className="text-slate-500">Employees</div>
                    <div className="font-semibold text-slate-200">{selected.employees?.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-2">
                    <div className="text-slate-500">Concentration</div>
                    <div className={`font-semibold ${selected.concentration === 'Critical' ? 'text-red-400' : selected.concentration === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {selected.concentration}
                    </div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-2">
                    <div className="text-slate-500">Fin. Stability</div>
                    <div className="font-semibold text-emerald-400">{selected.financialStability}/100</div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="glass-card p-4 border-l-2 border-blue-500/60">
                <div className="text-xs font-semibold text-blue-400 mb-2">AI Risk Insight</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selected.riskScore >= 70
                    ? `${selected.name} presents CRITICAL supply chain exposure. Recommend immediate alternative sourcing strategy and 90-day safety stock buildup.`
                    : selected.riskScore >= 40
                    ? `${selected.name} shows moderate risk. Monitor geopolitical developments and consider dual-sourcing for key components.`
                    : `${selected.name} is a stable and low-risk supplier. Continue standard monitoring cadence.`}
                </p>
              </div>
            </>
          ) : (
            <div className="glass-card p-5 text-center space-y-2">
              <div className="text-3xl">◎</div>
              <p className="text-sm text-slate-400">Click a supplier row to see detailed radar analysis</p>
            </div>
          )}

          {/* Score Legend */}
          <div className="glass-card p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score Legend</h4>
            {[
              { label: '0–39', level: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
              { label: '40–69', level: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
              { label: '70–100', level: 'HIGH', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
            ].map(item => (
              <div key={item.level} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${item.bg}`}>
                <span className={`text-xs font-bold ${item.color}`}>{item.level}</span>
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
