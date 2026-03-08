import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { simulationScenarios, suppliers, supplyChainLinks, getRiskColor } from '../data/dummyData'

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

export default function Simulation() {
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [customSupplier, setCustomSupplier] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const runSimulation = (scenario) => {
    setRunning(true)
    setResult(null)
    setTimeout(() => {
      const affectedSuppliers = scenario.affectedSuppliers.map(id => suppliers.find(s => s.id === id)).filter(Boolean)
      const cascadeData = [
        { stage: 'Week 1', affected: Math.round(scenario.affectedFactories * 0.3), production: 70 },
        { stage: 'Week 2', affected: Math.round(scenario.affectedFactories * 0.6), production: 45 },
        { stage: 'Week 3', affected: Math.round(scenario.affectedFactories * 0.85), production: 25 },
        { stage: 'Week 4', affected: scenario.affectedFactories, production: 12 },
        { stage: 'Month 2', affected: Math.round(scenario.affectedFactories * 1.2), production: 8 },
        { stage: 'Month 3', affected: Math.round(scenario.affectedFactories * 0.9), production: 18 },
      ]
      setResult({ scenario, affectedSuppliers, cascadeData })
      setRunning(false)
    }, 2000)
  }

  const runCustom = () => {
    const supplier = suppliers.find(s =>
      s.name.toLowerCase().includes(customSupplier.toLowerCase())
    )
    if (!supplier) return
    const linkedIds = supplyChainLinks
      .filter(l => l.source === supplier.id || l.target === supplier.id)
      .map(l => l.source === supplier.id ? l.target : l.source)
    const mockScenario = {
      id: 'CUSTOM',
      name: `${supplier.name} failure simulation`,
      supplierId: supplier.id,
      description: `Custom simulation: What happens if ${supplier.name} fails?`,
      duration: '2-4 months',
      affectedSuppliers: linkedIds,
      economicImpact: `$${Math.round(supplier.riskScore * 8)}B`,
      affectedFactories: Math.round(supplier.riskScore * 5),
      recoveryTime: supplier.riskScore >= 70 ? '12-18 months' : '3-6 months',
    }
    setSelectedScenario(mockScenario)
    runSimulation(mockScenario)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5 border-l-4 border-l-purple-500">
        <h2 className="font-bold text-white text-base mb-1">Supply Chain Simulation Engine</h2>
        <p className="text-slate-400 text-sm">Model "what-if" failure scenarios. Instantly visualize cascading impacts, economic losses, and recovery timelines across your supply network.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Scenario Selector */}
        <div className="space-y-3">
          <h3 className="section-title">Select Scenario</h3>

          {/* Custom scenario */}
          <div className="glass-card p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custom Simulation</div>
            <div className="flex gap-2">
              <input
                value={customSupplier}
                onChange={e => setCustomSupplier(e.target.value)}
                placeholder="Supplier name..."
                className="input-field flex-1"
              />
              <button onClick={runCustom} className="btn-primary flex-shrink-0">Run</button>
            </div>
            <p className="text-xs text-slate-500">Type any supplier name to simulate their failure</p>
          </div>

          <div className="text-xs text-slate-500 px-1">— OR choose a preset —</div>

          {simulationScenarios.map(scenario => {
            const isSelected = selectedScenario?.id === scenario.id
            return (
              <div
                key={scenario.id}
                onClick={() => { setSelectedScenario(scenario); setResult(null) }}
                className={`glass-card p-4 cursor-pointer hover:bg-slate-700/30 transition-all ${isSelected ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : ''}`}
              >
                <div className="font-semibold text-sm text-slate-200">{scenario.name}</div>
                <p className="text-xs text-slate-500 mt-1">{scenario.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span>⏱ {scenario.duration}</span>
                  <span>💰 {scenario.economicImpact}</span>
                </div>
              </div>
            )
          })}

          {selectedScenario && !result && (
            <button
              onClick={() => runSimulation(selectedScenario)}
              disabled={running}
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              {running ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Running Simulation...
                </span>
              ) : '▶ Run Simulation'}
            </button>
          )}
        </div>

        {/* Results */}
        <div className="col-span-2">
          {!result && !running && (
            <div className="glass-card h-full flex items-center justify-center text-center p-10">
              <div>
                <div className="text-4xl mb-3">⚙️</div>
                <h3 className="text-slate-300 font-semibold">Ready to Simulate</h3>
                <p className="text-slate-500 text-sm mt-2">Select a scenario on the left and run the simulation to see cascading impact analysis</p>
              </div>
            </div>
          )}

          {running && (
            <div className="glass-card h-full flex items-center justify-center text-center p-10">
              <div>
                <div className="text-4xl mb-3 animate-spin">⟳</div>
                <h3 className="text-slate-300 font-semibold">Running Monte Carlo Simulation...</h3>
                <p className="text-slate-500 text-sm mt-2">Analyzing cascading effects across supply network</p>
                <div className="mt-4 space-y-1 text-xs text-slate-600 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2"><span className="text-blue-400">✓</span> Loading supplier graph...</div>
                  <div className="flex items-center gap-2"><span className="text-blue-400">✓</span> Computing first-order effects...</div>
                  <div className="flex items-center gap-2"><span className="text-amber-400 animate-pulse">●</span> Propagating cascades...</div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-4 border-l-2 border-l-red-500">
                  <div className="text-xs text-slate-400">Economic Impact</div>
                  <div className="text-2xl font-black text-red-400 mt-1">{result.scenario.economicImpact}</div>
                </div>
                <div className="glass-card p-4 border-l-2 border-l-orange-500">
                  <div className="text-xs text-slate-400">Affected Factories</div>
                  <div className="text-2xl font-black text-orange-400 mt-1">{result.scenario.affectedFactories.toLocaleString()}</div>
                </div>
                <div className="glass-card p-4 border-l-2 border-l-amber-500">
                  <div className="text-xs text-slate-400">Recovery Time</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{result.scenario.recoveryTime}</div>
                </div>
              </div>

              {/* Cascade Chart */}
              <div className="glass-card p-5">
                <h3 className="section-title mb-4">Cascade Effect Timeline</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.cascadeData} barSize={35}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="stage" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="affected" name="Affected Factories" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
                    <Bar yAxisId="right" dataKey="production" name="Production Capacity %" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Affected Suppliers */}
              <div className="glass-card p-5">
                <h3 className="section-title mb-3">Directly Affected Suppliers</h3>
                <div className="space-y-2">
                  {result.affectedSuppliers.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: getRiskColor(s.riskScore) }}>
                        {s.tier}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-200">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.country} · {s.industry}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold" style={{ color: getRiskColor(s.riskScore) }}>{s.riskScore}</div>
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">IMPACTED</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
