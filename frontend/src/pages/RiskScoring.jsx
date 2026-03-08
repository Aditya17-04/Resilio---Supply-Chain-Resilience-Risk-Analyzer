import { useState, useMemo } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { suppliers as dummySuppliers, getRiskColor, getRiskLevel } from '../data/dummyData'
import useApi from '../hooks/useApi'
import { getSuppliers } from '../lib/api'

function ScoreGauge({ score, size = 96 }) {
  const cx = size / 2
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = getRiskColor(score)
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ color, fontSize: size * 0.24 }}>{score}</span>
        <span className="text-slate-500" style={{ fontSize: size * 0.11 }}>/ 100</span>
      </div>
    </div>
  )
}

function MiniGauge({ score }) {
  const r = 11
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = getRiskColor(score)
  return (
    <div className="relative w-8 h-8 flex-shrink-0">
      <svg width="32" height="32" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="16" cy="16" r={r} fill="none" stroke="#1e293b" strokeWidth="3" />
        <circle cx="16" cy="16" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

function FactorBar({ label, icon, value, inverted = false }) {
  const display = inverted ? 100 - value : value
  const color = getRiskColor(display)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{icon} {label}</span>
        <span className="font-semibold" style={{ color }}>{display}</span>
      </div>
      <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${display}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const concentrationScore = (c) =>
  c === 'Critical' ? 95 : c === 'High' ? 70 : c === 'Medium' ? 40 : 20

const getRiskBadgeStyle = (score) => {
  if (score >= 70) return 'bg-red-500/15 text-red-400 border-red-500/30'
  if (score >= 40) return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
}

const getTierColor = (tier) => {
  if (tier === 1) return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  if (tier === 2) return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
}

export default function RiskScoring() {
  const [selected, setSelected] = useState(null)
  const [sortBy, setSortBy] = useState('riskScore')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [search, setSearch] = useState('')

  const { data } = useApi(getSuppliers, [])
  const suppliers = data?.suppliers ?? dummySuppliers

  const industries = ['all', ...new Set(suppliers.map(s => s.industry))]

  const filtered = suppliers
    .filter(s => filterIndustry === 'all' || s.industry === filterIndustry)
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortBy === 'financialStability' ? b[sortBy] - a[sortBy] : b[sortBy] - a[sortBy])

  const stats = useMemo(() => {
    const high = suppliers.filter(s => s.riskScore >= 70).length
    const medium = suppliers.filter(s => s.riskScore >= 40 && s.riskScore < 70).length
    const low = suppliers.filter(s => s.riskScore < 40).length
    const avg = Math.round(suppliers.reduce((acc, s) => acc + s.riskScore, 0) / (suppliers.length || 1))
    const countries = new Set(suppliers.map(s => s.country)).size
    return { high, medium, low, avg, countries, total: suppliers.length }
  }, [suppliers])

  const industryAvgs = useMemo(() => {
    const map = {}
    suppliers.forEach(s => {
      if (!map[s.industry]) map[s.industry] = { sum: 0, count: 0 }
      map[s.industry].sum += s.riskScore
      map[s.industry].count++
    })
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, Math.round(v.sum / v.count)]))
  }, [suppliers])

  const topThreats = useMemo(() =>
    [...suppliers].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5),
    [suppliers]
  )

  const radarData = selected ? [
    { subject: 'Geopolitical', A: selected.geopoliticalRisk },
    { subject: 'Climate', A: selected.disasterRisk },
    { subject: 'Transport', A: selected.transportRisk },
    { subject: 'Financial', A: 100 - selected.financialStability },
    { subject: 'Concentration', A: concentrationScore(selected.concentration) },
  ] : []

  return (
    <div className="space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Suppliers', value: stats.total, sub: `${stats.countries} countries`, color: 'text-blue-400' },
          { label: 'High Risk', value: stats.high, sub: 'Score ≥ 70', color: 'text-red-400' },
          { label: 'Avg Risk Score', value: stats.avg, sub: getRiskLevel(stats.avg) + ' RISK', color: stats.avg >= 70 ? 'text-red-400' : stats.avg >= 40 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Stable Suppliers', value: stats.low, sub: 'Score < 40', color: 'text-emerald-400' },
        ].map(card => (
          <div key={card.label} className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-1">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Risk distribution bar */}
      <div className="glass-card px-5 py-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio Risk Distribution</span>
          <div className="flex gap-4 text-xs">
            <span className="text-slate-500"><span className="text-red-400 font-bold">{stats.high}</span> High</span>
            <span className="text-slate-500"><span className="text-amber-400 font-bold">{stats.medium}</span> Medium</span>
            <span className="text-slate-500"><span className="text-emerald-400 font-bold">{stats.low}</span> Low</span>
          </div>
        </div>
        <div className="flex rounded-full overflow-hidden h-2.5 gap-px">
          <div className="bg-red-500/75 transition-all duration-700 rounded-l-full" style={{ width: `${(stats.high / stats.total) * 100}%` }} />
          <div className="bg-amber-500/75 transition-all duration-700" style={{ width: `${(stats.medium / stats.total) * 100}%` }} />
          <div className="bg-emerald-500/75 transition-all duration-700 rounded-r-full" style={{ width: `${(stats.low / stats.total) * 100}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-48"
        />
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700/50 flex-wrap">
          {industries.map(ind => (
            <button key={ind} onClick={() => setFilterIndustry(ind)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${filterIndustry === ind ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >{ind}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-44">
          <option value="riskScore">Sort: Overall Risk</option>
          <option value="geopoliticalRisk">Sort: Geopolitical</option>
          <option value="disasterRisk">Sort: Climate Risk</option>
          <option value="transportRisk">Sort: Transport</option>
          <option value="financialStability">Sort: Financial Stability</option>
        </select>
        <div className="ml-auto text-xs text-slate-500">{filtered.length} of {stats.total} suppliers</div>
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* Table */}
        <div className="col-span-2 glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Supplier</th>
                  <th>Tier</th>
                  <th>Geopolitical</th>
                  <th>Climate</th>
                  <th>Transport</th>
                  <th>Financial</th>
                  <th>Overall</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(selected?.id === s.id ? null : s)}
                    className={`cursor-pointer transition-colors ${selected?.id === s.id ? 'bg-blue-500/10 !border-blue-500/30' : 'hover:bg-slate-700/20'}`}
                  >
                    <td><span className="text-xs text-slate-600 font-mono">{String(i + 1).padStart(2, '0')}</span></td>
                    <td>
                      <div className="font-medium text-slate-200">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.country}</div>
                    </td>
                    <td>
                      <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${getTierColor(s.tier)}`}>T{s.tier}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${s.geopoliticalRisk}%`, backgroundColor: getRiskColor(s.geopoliticalRisk) }} />
                        </div>
                        <span className="text-xs font-medium w-6" style={{ color: getRiskColor(s.geopoliticalRisk) }}>{s.geopoliticalRisk}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${s.disasterRisk}%`, backgroundColor: getRiskColor(s.disasterRisk) }} />
                        </div>
                        <span className="text-xs font-medium w-6" style={{ color: getRiskColor(s.disasterRisk) }}>{s.disasterRisk}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${s.transportRisk}%`, backgroundColor: getRiskColor(s.transportRisk) }} />
                        </div>
                        <span className="text-xs font-medium w-6" style={{ color: getRiskColor(s.transportRisk) }}>{s.transportRisk}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${s.financialStability}%` }} />
                        </div>
                        <span className="text-xs font-medium w-6 text-emerald-400">{s.financialStability}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <MiniGauge score={s.riskScore} />
                        <span className={`text-xs font-semibold border px-1.5 py-0.5 rounded ${getRiskBadgeStyle(s.riskScore)}`}>
                          {getRiskLevel(s.riskScore)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail / Sidebar Panel */}
        <div className="space-y-3">
          {selected ? (
            <>
              {/* Main detail card */}
              <div className="glass-card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base leading-tight truncate">{selected.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selected.country} · {selected.industry}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{selected.description}</p>
                  </div>
                  <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full flex-shrink-0 ${getTierColor(selected.tier)}`}>
                    Tier {selected.tier}
                  </span>
                </div>

                {/* Gauge row */}
                <div className="flex items-center gap-4">
                  <ScoreGauge score={selected.riskScore} size={96} />
                  <div className="flex-1 space-y-2.5">
                    <div>
                      <div className={`text-lg font-bold leading-none ${selected.riskScore >= 70 ? 'text-red-400' : selected.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {getRiskLevel(selected.riskScore)} RISK
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Overall composite score</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500">Industry avg:</span>
                      <span className="font-semibold" style={{ color: getRiskColor(industryAvgs[selected.industry] ?? 50) }}>
                        {industryAvgs[selected.industry] ?? '—'}
                      </span>
                      {industryAvgs[selected.industry] != null && (
                        <span className={`font-medium ${selected.riskScore > industryAvgs[selected.industry] ? 'text-red-400' : 'text-emerald-400'}`}>
                          ({selected.riskScore > industryAvgs[selected.industry]
                            ? `+${selected.riskScore - industryAvgs[selected.industry]} above`
                            : `${selected.riskScore - industryAvgs[selected.industry]} below`})
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="bg-slate-700/40 rounded px-2 py-1.5">
                        <div className="text-slate-500">Revenue</div>
                        <div className="font-semibold text-slate-200">{selected.revenue}</div>
                      </div>
                      <div className="bg-slate-700/40 rounded px-2 py-1.5">
                        <div className="text-slate-500">Est.</div>
                        <div className="font-semibold text-slate-200">{selected.established}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radar chart */}
                <ResponsiveContainer width="100%" height={170}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Radar name="Risk" dataKey="A" stroke={getRiskColor(selected.riskScore)} fill={getRiskColor(selected.riskScore)} fillOpacity={0.25} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(v) => [v, 'Score']}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Risk factor breakdown */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Factor Breakdown</div>
                  <FactorBar label="Geopolitical" icon="⚡" value={selected.geopoliticalRisk} />
                  <FactorBar label="Natural Disaster" icon="🌊" value={selected.disasterRisk} />
                  <FactorBar label="Transport" icon="🚢" value={selected.transportRisk} />
                  <FactorBar label="Financial Instability" icon="💰" value={100 - selected.financialStability} />
                  <FactorBar label="Concentration" icon="🎯" value={concentrationScore(selected.concentration)} />
                </div>

                {/* Key metrics grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-700/40 rounded-lg p-2">
                    <div className="text-slate-500">Employees</div>
                    <div className="font-semibold text-slate-200">{selected.employees?.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-2">
                    <div className="text-slate-500">Fin. Stability</div>
                    <div className="font-semibold text-emerald-400">{selected.financialStability}/100</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-2 col-span-2">
                    <div className="text-slate-500 mb-0.5">Concentration Risk</div>
                    <div className={`font-semibold text-sm ${selected.concentration === 'Critical' ? 'text-red-400' : selected.concentration === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {selected.concentration}
                      <span className="text-slate-500 font-normal text-xs ml-1">
                        {selected.concentration === 'Critical' ? '— sole/near-sole source' : selected.concentration === 'High' ? '— limited alternatives' : selected.concentration === 'Medium' ? '— some alternatives' : '— well diversified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="glass-card p-4 border-l-2 border-blue-500/60">
                <div className="text-xs font-semibold text-blue-400 mb-2">AI Risk Insight</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selected.riskScore >= 70
                    ? `${selected.name} presents CRITICAL supply chain exposure. Recommend immediate alternative sourcing strategy and 90-day safety stock buildup.`
                    : selected.riskScore >= 40
                    ? `${selected.name} shows moderate risk. Monitor geopolitical developments and consider dual-sourcing for key components.`
                    : `${selected.name} is a stable, low-risk supplier. Continue standard monitoring cadence with quarterly reviews.`
                  }
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Empty state + top threats */}
              <div className="glass-card p-5">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">◎</div>
                  <p className="text-xs text-slate-400">Click a row for detailed analysis</p>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Top 5 Threats</div>
                  {topThreats.map((s, i) => (
                    <div
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <span className="text-xs text-slate-600 font-mono w-4 flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-200 truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.country}</div>
                      </div>
                      <MiniGauge score={s.riskScore} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Score legend */}
              <div className="glass-card p-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score Legend</h4>
                {[
                  { range: '70–100', level: 'HIGH', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', desc: 'Immediate action required' },
                  { range: '40–69', level: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', desc: 'Monitor closely' },
                  { range: '0–39', level: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', desc: 'Standard cadence' },
                ].map(item => (
                  <div key={item.level} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${item.bg}`}>
                    <div>
                      <span className={`text-xs font-bold ${item.color}`}>{item.level}</span>
                      <div className="text-[10px] text-slate-500">{item.desc}</div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{item.range}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
