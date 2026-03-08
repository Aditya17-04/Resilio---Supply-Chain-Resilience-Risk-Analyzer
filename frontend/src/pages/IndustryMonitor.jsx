import { useState } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip } from 'recharts'
import { industries, suppliers, getRiskColor } from '../data/dummyData'

const riskConfig = {
  HIGH: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-500' },
  MEDIUM: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-500' },
  LOW: { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-500' },
}

export default function IndustryMonitor() {
  const [selected, setSelected] = useState(industries[0])

  const industrySuppliers = suppliers.filter(s =>
    s.industry.toLowerCase().includes(selected.id.slice(0, 5).toLowerCase()) ||
    s.industry.toLowerCase() === selected.name.toLowerCase()
  )

  const radarData = [
    { subject: 'Geopolitical', value: Math.round(industrySuppliers.reduce((acc, s) => acc + s.geopoliticalRisk, 0) / (industrySuppliers.length || 1)) },
    { subject: 'Disaster', value: Math.round(industrySuppliers.reduce((acc, s) => acc + s.disasterRisk, 0) / (industrySuppliers.length || 1)) },
    { subject: 'Transport', value: Math.round(industrySuppliers.reduce((acc, s) => acc + s.transportRisk, 0) / (industrySuppliers.length || 1)) },
    { subject: 'Concentration', value: selected.criticalNodes * 25 },
    { subject: 'Financial', value: 100 - Math.round(industrySuppliers.reduce((acc, s) => acc + s.financialStability, 0) / (industrySuppliers.length || 1)) },
  ]

  const cfg = riskConfig[selected.riskLevel]

  return (
    <div className="space-y-6">
      {/* Industry Cards Grid */}
      <div className="grid grid-cols-5 gap-3">
        {industries.map(ind => {
          const c = riskConfig[ind.riskLevel]
          const isSelected = selected.id === ind.id
          return (
            <button
              key={ind.id}
              onClick={() => setSelected(ind)}
              className={`glass-card p-5 text-left transition-all hover:bg-slate-700/30 ${isSelected ? 'ring-2 ring-blue-500/50' : ''} border ${c.border}`}
            >
              <div className="text-3xl mb-3">{ind.icon}</div>
              <div className="font-bold text-sm text-slate-200 mb-2">{ind.name}</div>
              <div className={`text-xs font-bold ${c.text} ${c.bg} border ${c.border} px-2 py-1 rounded-lg inline-block`}>
                {ind.riskLevel}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Risk</span>
                  <span style={{ color: c.color }}>{ind.riskScore}/100</span>
                </div>
                <div className="risk-bar">
                  <div className="risk-bar-fill" style={{ width: `${ind.riskScore}%`, backgroundColor: c.color }}></div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${ind.trend === 'up' ? 'bg-red-400' : ind.trend === 'down' ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                <span className="text-xs text-slate-500">{ind.trend === 'up' ? 'Rising' : ind.trend === 'down' ? 'Falling' : 'Stable'}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detailed View */}
      <div className="grid grid-cols-3 gap-4">
        {/* Industry Detail */}
        <div className="col-span-1 glass-card p-5 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl mb-2">{selected.icon}</div>
              <h2 className="text-xl font-bold text-white">{selected.name}</h2>
              <div className={`text-sm font-bold ${cfg.text} mt-1`}>{selected.riskLevel} RISK</div>
            </div>
            <div className={`px-4 py-3 rounded-xl ${cfg.bg} border ${cfg.border} text-center`}>
              <div className="text-3xl font-black" style={{ color: cfg.color }}>{selected.riskScore}</div>
              <div className="text-xs text-slate-500">Score</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{selected.supplierCount}</div>
              <div className="text-xs text-slate-500">Suppliers</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-400">{selected.criticalNodes}</div>
              <div className="text-xs text-slate-500">Critical Nodes</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center col-span-2">
              <div className="text-xl font-bold text-emerald-400">{selected.gdpImpact}</div>
              <div className="text-xs text-slate-500">Annual GDP Impact</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Key Risk Factors:</div>
            <div className="space-y-1.5">
              {selected.keyRisks.map((risk, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}></div>
                  <span className="text-slate-300">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Risk Profile — {selected.name}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar dataKey="value" stroke={cfg.color} fill={cfg.color} fillOpacity={0.2} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier list for industry */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Suppliers — {selected.name}</h3>
          <div className="space-y-3">
            {suppliers
              .filter(s => s.industry === selected.name || selected.name.includes(s.industry.split(' ')[0]))
              .sort((a, b) => b.riskScore - a.riskScore)
              .slice(0, 6)
              .map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: getRiskColor(s.riskScore) }}>
                    T{s.tier}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: getRiskColor(s.riskScore) }}>{s.riskScore}</div>
                    <div className="text-xs text-slate-600">risk</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Industry Comparison */}
      <div className="glass-card p-5">
        <h3 className="section-title mb-4">Industry Risk Comparison</h3>
        <div className="grid grid-cols-5 gap-2">
          {industries.map(ind => {
            const c = riskConfig[ind.riskLevel]
            return (
              <div key={ind.id} className="text-center">
                <div className="text-2xl mb-1">{ind.icon}</div>
                <div className="text-xs text-slate-400 mb-2">{ind.name.split(' ')[0]}</div>
                <div className="mx-auto w-full max-w-16 space-y-0.5">
                  {['Geopolitical', 'Climate', 'Financial', 'Transport'].map((label, li) => {
                    const vals = [ind.riskScore * 0.4, ind.riskScore * 0.3, ind.riskScore * 0.15, ind.riskScore * 0.15]
                    return (
                      <div key={label} className="risk-bar">
                        <div className="risk-bar-fill" style={{ width: `${vals[li] / ind.riskScore * 100}%`, backgroundColor: c.color, opacity: 0.6 + li * 0.1 }}></div>
                      </div>
                    )
                  })}
                </div>
                <div className="text-lg font-black mt-2" style={{ color: c.color }}>{ind.riskScore}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
