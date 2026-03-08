import React, { useState } from 'react';
import { singlePointFailures } from '../../data/mockData';
import { AlertTriangle, Shield, Building2, Globe, DollarSign, Users } from 'lucide-react';
import clsx from 'clsx';

function CriticalityBar({ value }) {
  const color = value >= 90 ? '#ef4444' : value >= 75 ? '#f97316' : '#f59e0b';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#1e3050] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-xs" style={{ color }}>{value}</span>
    </div>
  );
}

function DependencyRing({ value }) {
  const color = value >= 90 ? '#ef4444' : value >= 70 ? '#f97316' : '#f59e0b';
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1e3050" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-xs font-bold font-mono" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function SinglePointFailure() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Single Point of Failure Detector</h2>
          <p className="text-slate-500 text-sm">Products with critical dependencies on a single supplier</p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-red-400 font-medium text-sm">{singlePointFailures.length} Critical SPOFs Detected</span>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div>
          <div className="text-red-300 font-semibold">⚠ CRITICAL: Single Points of Failure Detected in Supply Chain</div>
          <div className="text-red-400/70 text-sm mt-0.5">
            {singlePointFailures.filter(s => s.alternativesCount === 0).length} product(s) depend on ONLY ONE supplier with no backup options.
            Total estimated economic exposure: <span className="font-bold text-red-300">$650B+/year</span>
          </div>
        </div>
      </div>

      {/* SPOF Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {singlePointFailures.map(spof => (
          <div
            key={spof.id}
            onClick={() => setSelected(selected?.id === spof.id ? null : spof)}
            className={clsx(
              'bg-[#0d1526] border rounded-xl p-5 cursor-pointer transition-all',
              spof.alternativesCount === 0
                ? 'border-red-500/40 hover:border-red-500/60'
                : 'border-amber-500/30 hover:border-amber-500/50',
              selected?.id === spof.id && 'ring-1 ring-blue-500/40'
            )}
          >
            {/* Card header */}
            <div className="flex items-start gap-3 mb-4">
              <DependencyRing value={spof.dependency} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-white font-semibold text-sm leading-tight">{spof.product}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Component: {spof.component}</p>
                  </div>
                  {spof.alternativesCount === 0 && (
                    <span className="flex-shrink-0 text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full uppercase tracking-wide risk-pulse-red">
                      NO BACKUP
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-600">Sole Supplier</div>
                  <div className="text-slate-300 text-xs font-medium">{spof.supplier}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-600">Country</div>
                  <div className="text-slate-300 text-xs font-medium">{spof.country}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-600">Companies Affected</div>
                  <div className="text-slate-300 text-xs font-medium">{spof.affectedCompanies.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-600">Economic Loss</div>
                  <div className="text-red-400 text-xs font-bold">{spof.estimatedLoss}</div>
                </div>
              </div>
            </div>

            {/* Criticality */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">Criticality Score</span>
                <span className="text-xs text-slate-400">Alternatives: <span className={spof.alternativesCount === 0 ? 'text-red-400 font-bold' : 'text-amber-400'}>{spof.alternativesCount}</span></span>
              </div>
              <CriticalityBar value={spof.criticalityScore} />
            </div>

            {selected?.id === spof.id && (
              <div className="mt-4 pt-4 border-t border-[#1e3050] space-y-2">
                <div className="text-xs text-slate-500 mb-2">Additional Details</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Industry</span><span className="text-slate-300">{spof.industryImpact}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Monthly Vol.</span><span className="text-slate-300">{spof.monthlyVolume}</span></div>
                </div>
                <div className="mt-2 p-2.5 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-xs">
                    {spof.alternativesCount === 0
                      ? '🚨 CRITICAL: No backup supplier exists. Immediate action required to identify and qualify alternative sources.'
                      : `⚠️ WARNING: Only ${spof.alternativesCount} alternative supplier(s) available. Dependency concentration risk is high.`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
