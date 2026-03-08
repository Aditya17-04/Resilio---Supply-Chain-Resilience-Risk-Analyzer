import { useState } from 'react'
import { singlePointsOfFailure as dummySPOF, getSupplierById, getRiskColor } from '../data/dummyData'
import useApi from '../hooks/useApi'
import { getSPOF } from '../lib/api'

function mapSpof(s) {
  return {
    id: s.id,
    name: `${s.supplier} — ${s.component}`,
    description: `${s.product}. Affects ${s.affectedCompanies} companies. Estimated loss: ${s.estimatedLoss}.`,
    riskScore: s.criticalityScore,
    industry: s.industryImpact,
    supplierId: null,
    affectedProducts: [s.product],
    annualValue: s.estimatedLoss,
    alternativesAvailable: s.alternativesCount,
    mitigationScore: Math.round((100 - s.criticalityScore) * 0.4),
  }
}

export default function SinglePointFailure() {
  const [selected, setSelected] = useState(null)

  const { data } = useApi(getSPOF, [])
  const singlePointsOfFailure = data?.spof?.map(mapSpof) ?? dummySPOF

  return (
    <div className="space-y-6">
      {/* Critical Warning Banner */}
      <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-5 flex items-start gap-4">
        <div className="text-3xl flex-shrink-0 animate-pulse">⚠️</div>
        <div className="flex-1">
          <h2 className="text-red-400 font-bold text-lg">CRITICAL: {singlePointsOfFailure.filter(s => s.riskScore >= 85).length} Single Points of Failure Detected</h2>
          <p className="text-red-300/70 text-sm mt-1">
            These suppliers have no viable alternatives. A failure would cause catastrophic, cascading disruptions across multiple industries and geographies.
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-black text-red-400">{singlePointsOfFailure.length}</div>
          <div className="text-xs text-red-400/70">Total SPOFs</div>
        </div>
      </div>

      {/* SPOF Cards */}
      <div className="grid grid-cols-2 gap-4">
        {singlePointsOfFailure.map(spof => {
          const supplier = getSupplierById(spof.supplierId)
          const isSelected = selected?.id === spof.id
          return (
            <div
              key={spof.id}
              onClick={() => setSelected(isSelected ? null : spof)}
              className={`glass-card p-5 cursor-pointer transition-all border-l-4 hover:bg-slate-700/30 ${
                spof.riskScore >= 90 ? 'border-l-red-500 glow-red' :
                spof.riskScore >= 80 ? 'border-l-orange-500' :
                'border-l-amber-500'
              } ${isSelected ? 'ring-2 ring-blue-500/50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
                      SINGLE POINT OF FAILURE
                    </span>
                    <span className="text-xs text-slate-500">{spof.industry}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{spof.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{spof.description}</p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="text-2xl font-black" style={{ color: getRiskColor(spof.riskScore) }}>{spof.riskScore}</div>
                  <div className="text-xs text-slate-500">Risk</div>
                </div>
              </div>

              {/* Mitigation score */}
              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Mitigation Score</span>
                    <span className={spof.mitigationScore < 30 ? 'text-red-400' : 'text-amber-400'} style={{ fontWeight: 'bold' }}>
                      {spof.mitigationScore}/100
                    </span>
                  </div>
                  <div className="risk-bar">
                    <div className="risk-bar-fill" style={{
                      width: `${spof.mitigationScore}%`,
                      backgroundColor: spof.mitigationScore < 30 ? '#ef4444' : '#f59e0b'
                    }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-slate-200">{spof.annualValue}</div>
                  <div className="text-xs text-slate-500">Annual Value</div>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-red-400">{spof.alternativesAvailable}</div>
                  <div className="text-xs text-slate-500">Alternatives</div>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-amber-400">{spof.affectedProducts.length}</div>
                  <div className="text-xs text-slate-500">Products</div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">Affected Products/Industries:</div>
                    <div className="flex flex-wrap gap-1">
                      {spof.affectedProducts.map(p => (
                        <span key={p} className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded border border-slate-600/40">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <div className="text-xs font-semibold text-red-400 mb-1">Recommended Actions:</div>
                    <ul className="space-y-1">
                      <li className="text-xs text-slate-400">🔴 Immediately identify and qualify alternative suppliers</li>
                      <li className="text-xs text-slate-400">🟡 Build strategic stockpile inventory (90–180 days)</li>
                      <li className="text-xs text-slate-400">🟢 Invest in multi-sourcing and reshoring strategies</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="section-title">SPOF Risk Summary</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>SPOF Name</th>
              <th>Industry</th>
              <th>Risk Score</th>
              <th>Annual Exposure</th>
              <th>Alternatives</th>
              <th>Mitigation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {singlePointsOfFailure.map(spof => (
              <tr key={spof.id}>
                <td className="font-medium text-slate-200">{spof.name}</td>
                <td className="text-slate-400 text-xs">{spof.industry}</td>
                <td>
                  <span className="font-bold" style={{ color: getRiskColor(spof.riskScore) }}>{spof.riskScore}</span>
                </td>
                <td className="text-slate-300">{spof.annualValue}</td>
                <td>
                  <span className={`font-bold ${spof.alternativesAvailable === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {spof.alternativesAvailable === 0 ? 'NONE' : spof.alternativesAvailable}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 risk-bar">
                      <div className="risk-bar-fill" style={{
                        width: `${spof.mitigationScore}%`,
                        backgroundColor: spof.mitigationScore < 30 ? '#ef4444' : '#f59e0b'
                      }}></div>
                    </div>
                    <span className="text-xs text-slate-500">{spof.mitigationScore}%</span>
                  </div>
                </td>
                <td>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
                    CRITICAL
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
