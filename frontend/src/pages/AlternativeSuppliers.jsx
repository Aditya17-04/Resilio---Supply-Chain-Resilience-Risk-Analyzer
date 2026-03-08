import { useState } from 'react'
import { alternativeSuppliers, suppliers, getRiskColor, getRiskLevel } from '../data/dummyData'

export default function AlternativeSuppliers() {
  const [selectedGroup, setSelectedGroup] = useState(alternativeSuppliers[0])

  const getRiskBg = (score) => {
    if (score >= 70) return 'bg-red-500/10 border border-red-500/30'
    if (score >= 40) return 'bg-amber-500/10 border border-amber-500/30'
    return 'bg-emerald-500/10 border border-emerald-500/30'
  }

  const getCostColor = (cost) => {
    if (cost > 130) return 'text-amber-400'
    if (cost > 110) return 'text-blue-400'
    return 'text-emerald-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5 border-l-4 border-l-blue-500">
        <h2 className="font-bold text-white text-base mb-1">AI Supplier Recommendation Engine</h2>
        <p className="text-slate-400 text-sm">Intelligent backup supplier recommendations based on cost, location, reliability, delivery time, and AI-calculated risk score.</p>
      </div>

      {/* Supplier selector */}
      <div className="flex gap-3">
        {alternativeSuppliers.map(group => {
          const target = suppliers.find(s => s.id === group.targetSupplierId)
          return (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`glass-card px-4 py-3 text-left transition-all hover:bg-slate-700/40 ${selectedGroup.id === group.id ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : ''}`}
            >
              <div className="font-semibold text-sm text-slate-200">{group.targetSupplierName}</div>
              <div className="text-xs text-slate-500 mt-0.5">{group.alternatives.length} alternatives found</div>
            </button>
          )
        })}
      </div>

      {/* Target supplier info */}
      {(() => {
        const target = suppliers.find(s => s.id === selectedGroup.targetSupplierId)
        if (!target) return null
        return (
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">Current Supplier</span>
                  <span className="text-xs text-slate-500">{target.industry} · Tier {target.tier}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{target.name}</h3>
                <p className="text-sm text-slate-400">{target.country}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-3xl font-black" style={{ color: getRiskColor(target.riskScore) }}>{target.riskScore}</div>
                <div className="text-xs text-slate-500">Risk Score</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Geopolitical', value: target.geopoliticalRisk },
                { label: 'Disaster', value: target.disasterRisk },
                { label: 'Transport', value: target.transportRisk },
                { label: 'Financial Stability', value: target.financialStability, inverted: true },
              ].map(item => (
                <div key={item.label} className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className="text-lg font-bold" style={{ color: item.inverted ? '#10b981' : getRiskColor(item.value) }}>
                    {item.value}
                  </div>
                  <div className="risk-bar mt-1">
                    <div className="risk-bar-fill" style={{
                      width: `${item.value}%`,
                      backgroundColor: item.inverted ? '#10b981' : getRiskColor(item.value)
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Alternatives */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title">Recommended Alternatives</h3>
          <span className="text-xs text-slate-500">Ranked by AI recommendation score</span>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Supplier</th>
                <th>Country</th>
                <th>Relative Cost</th>
                <th>Risk Score</th>
                <th>Delivery Time</th>
                <th>Reliability</th>
                <th>Transit Risk</th>
                <th>AI Score</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {selectedGroup.alternatives.map((alt, i) => {
                const aiScore = Math.round(
                  (alt.reliabilityScore * 0.35) +
                  ((100 - alt.riskScore) * 0.35) +
                  ((140 - alt.costIndex) * 0.15) +
                  ((16 - alt.deliveryWeeks) * 0.15 * 4)
                )
                return (
                  <tr key={alt.name}>
                    <td>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-blue-500/30 text-blue-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {i + 1}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-slate-200">{alt.name}</div>
                      {i === 0 && <div className="text-xs text-blue-400 font-medium">⭐ Top Recommendation</div>}
                    </td>
                    <td><span className="text-sm text-slate-400">{alt.country}</span></td>
                    <td>
                      <span className={`text-sm font-bold ${getCostColor(alt.costIndex)}`}>
                        {alt.costIndex}%
                      </span>
                      <div className="text-xs text-slate-600">of base</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-12 risk-bar">
                          <div className="risk-bar-fill" style={{ width: `${alt.riskScore}%`, backgroundColor: getRiskColor(alt.riskScore) }}></div>
                        </div>
                        <span className="text-xs font-bold" style={{ color: getRiskColor(alt.riskScore) }}>{alt.riskScore}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-slate-300 font-medium">{alt.deliveryWeeks}w</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-12 risk-bar">
                          <div className="risk-bar-fill bg-blue-500" style={{ width: `${alt.reliabilityScore}%` }}></div>
                        </div>
                        <span className="text-xs text-blue-400 font-medium">{alt.reliabilityScore}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-xs font-semibold ${
                        alt.transitRisk === 'LOW' ? 'text-emerald-400' :
                        alt.transitRisk === 'MEDIUM' ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {alt.transitRisk}
                      </span>
                    </td>
                    <td>
                      <span className={`text-sm font-bold ${aiScore >= 70 ? 'text-emerald-400' : aiScore >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                        {aiScore}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500 max-w-36">{alt.notes}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation factors */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { factor: 'Cost Index', weight: '15%', desc: 'Relative cost vs current supplier', color: 'text-amber-400' },
          { factor: 'Risk Score', weight: '35%', desc: 'AI-calculated supplier risk level', color: 'text-red-400' },
          { factor: 'Reliability', weight: '35%', desc: 'Historical delivery performance', color: 'text-blue-400' },
          { factor: 'Delivery Time', weight: '15%', desc: 'Lead time to production', color: 'text-emerald-400' },
        ].map(f => (
          <div key={f.factor} className="glass-card p-4">
            <div className={`text-lg font-bold ${f.color}`}>{f.weight}</div>
            <div className="text-sm font-semibold text-slate-200 mt-1">{f.factor}</div>
            <div className="text-xs text-slate-500 mt-1">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
