import React, { useState } from 'react';
import { simulationScenarios } from '../../data/mockData';
import { PlayCircle, AlertTriangle, TrendingDown, Clock, DollarSign, Factory, ChevronRight, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

function CascadeStep({ step, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={clsx('w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold',
          step.severity >= 90 ? 'border-red-500 bg-red-500/20 text-red-400'
          : step.severity >= 70 ? 'border-orange-500 bg-orange-500/20 text-orange-400'
          : step.severity >= 50 ? 'border-amber-500 bg-amber-500/20 text-amber-400'
          : 'border-blue-500 bg-blue-500/20 text-blue-400'
        )}>
          {step.step}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-[#1e3050] my-1 min-h-[20px]" />}
      </div>
      <div className="pb-4 min-w-0">
        <div className="text-white text-sm font-medium">{step.event}</div>
        <div className="text-slate-500 text-xs mt-0.5">{step.impact}</div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex-1 max-w-[120px] h-1.5 bg-[#1e3050] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{
              width: `${step.severity}%`,
              background: step.severity >= 90 ? '#ef4444' : step.severity >= 70 ? '#f97316' : step.severity >= 50 ? '#f59e0b' : '#3b82f6'
            }} />
          </div>
          <span className="text-xs text-slate-500 font-mono">{step.severity}% impact</span>
        </div>
      </div>
    </div>
  );
}

export default function Simulation() {
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runSim = async () => {
    if (!selected) return;
    setRunning(true);
    setResults(null);
    await new Promise(r => setTimeout(r, 1800));
    setResults(selected);
    setRunning(false);
  };

  const barData = selected?.cascadeSteps.map(s => ({ name: `Step ${s.step}`, impact: s.severity, event: s.event })) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Supply Chain Simulation Engine</h2>
        <p className="text-slate-500 text-sm">What-if analysis — simulate supplier failures and cascading effects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {simulationScenarios.map(s => (
          <div
            key={s.id}
            onClick={() => { setSelected(s); setResults(null); }}
            className={clsx(
              'bg-[#0d1526] border rounded-xl p-5 cursor-pointer transition-all hover:border-[#2d4a7a]',
              selected?.id === s.id ? 'border-blue-500/40 ring-1 ring-blue-500/20' : 'border-[#1e3050]'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm leading-tight">{s.name}</h3>
                <span className={clsx('inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border capitalize',
                  s.trigger === 'geopolitical' ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : s.trigger === 'labor' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                )}>
                  {s.trigger}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-[#1e3050] px-2 py-1 rounded-lg flex-shrink-0">
                <span className="text-slate-400">{s.probability}%</span>
                <span className="text-slate-600">prob.</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mb-3 line-clamp-2">{s.description}</p>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{s.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-red-400">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">
                  {parseFloat(s.estimatedLoss.replace(/[^0-9.]/g, '')) >= 1e12
                    ? `$${(parseFloat(s.estimatedLoss.replace(/[^0-9.]/g, '')) / 1e12).toFixed(1)}T`
                    : `$${(parseFloat(s.estimatedLoss.replace(/[^0-9.]/g, '')) / 1e9).toFixed(0)}B`} loss
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Simulation: {selected.name}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{selected.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {results && (
                <button onClick={() => setResults(null)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-[#1e3050] transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
              <button
                onClick={runSim}
                disabled={running}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  running ? 'bg-blue-500/20 text-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-400 text-white'
                )}
              >
                <PlayCircle className={clsx('w-4 h-4', running && 'animate-spin')} />
                {running ? 'Simulating…' : results ? 'Re-run Simulation' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {running && (
            <div className="py-8 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <p className="text-slate-400 text-sm">Running Monte Carlo simulation…</p>
              <p className="text-slate-600 text-xs">Analyzing {selected.impactedSuppliers.length} affected suppliers across {selected.affectedIndustries.length} industries</p>
            </div>
          )}

          {results && (
            <div className="space-y-5">
              {/* Impact metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#111e36] rounded-xl p-4 border border-[#1e3050]">
                  <div className="text-slate-500 text-xs mb-1">Economic Loss</div>
                  <div className="text-red-400 font-bold text-lg">
                    {parseFloat(results.estimatedLoss.replace(/[^0-9.]/g, '')) >= 1e12
                      ? `$${(parseFloat(results.estimatedLoss.replace(/[^0-9.]/g, '')) / 1e12).toFixed(1)}T`
                      : `$${(parseFloat(results.estimatedLoss.replace(/[^0-9.]/g, '')) / 1e9).toFixed(0)}B`}
                  </div>
                </div>
                <div className="bg-[#111e36] rounded-xl p-4 border border-[#1e3050]">
                  <div className="text-slate-500 text-xs mb-1">Production Delay</div>
                  <div className="text-amber-400 font-bold text-lg">{results.productionDelay}</div>
                </div>
                <div className="bg-[#111e36] rounded-xl p-4 border border-[#1e3050]">
                  <div className="text-slate-500 text-xs mb-1">Recovery Time</div>
                  <div className="text-blue-400 font-bold text-lg">{results.recoveryTime}</div>
                </div>
                <div className="bg-[#111e36] rounded-xl p-4 border border-[#1e3050]">
                  <div className="text-slate-500 text-xs mb-1">Affected Industries</div>
                  <div className="text-violet-400 font-bold text-lg">{results.affectedIndustries.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Cascade chart */}
                <div>
                  <h4 className="text-white font-medium text-sm mb-3">Cascade Impact by Step</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#0d1526', border: '1px solid #1e3050', borderRadius: 8, fontSize: 12 }}
                        formatter={(v) => [`${v}%`, 'Impact']}
                        labelFormatter={(l, payload) => payload?.[0]?.payload?.event || l}
                      />
                      <Bar dataKey="impact" radius={[3, 3, 0, 0]} barSize={28}>
                        {barData.map((entry, i) => (
                          <Cell key={i} fill={entry.impact >= 90 ? '#ef4444' : entry.impact >= 70 ? '#f97316' : entry.impact >= 50 ? '#f59e0b' : '#3b82f6'} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Cascade steps */}
                <div>
                  <h4 className="text-white font-medium text-sm mb-3">Cascade Sequence</h4>
                  <div className="space-y-0">
                    {results.cascadeSteps.map((step, i) => (
                      <CascadeStep key={step.step} step={step} isLast={i === results.cascadeSteps.length - 1} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Affected industries */}
              <div>
                <h4 className="text-white font-medium text-sm mb-2">Affected Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {results.affectedIndustries.map(ind => (
                    <span key={ind} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!results && !running && (
            <div className="py-6 text-center text-slate-600 text-sm">
              Click "Run Simulation" to analyze cascading effects
            </div>
          )}
        </div>
      )}
    </div>
  );
}
