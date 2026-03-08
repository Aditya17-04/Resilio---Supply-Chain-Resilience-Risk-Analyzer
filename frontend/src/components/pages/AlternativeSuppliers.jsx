import React, { useState } from 'react';
import { alternativeSuppliers } from '../../data/mockData';
import RiskBadge from '../common/RiskBadge';
import { Star, MapPin, Clock, DollarSign, CheckCircle2, Zap } from 'lucide-react';
import clsx from 'clsx';

function ScoreBar({ value, max = 100, color = '#3b82f6' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1e3050] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-slate-400 w-8 text-right">{value}{max === 100 ? '%' : ''}</span>
    </div>
  );
}

function MatchScore({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#1e3050" strokeWidth="4" />
        <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${(score / 100) * 125.6} 125.6`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export default function AlternativeSuppliers() {
  const [selected, setSelected] = useState(0);
  const group = alternativeSuppliers[selected];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Alternative Supplier Recommendations</h2>
        <p className="text-slate-500 text-sm">AI-powered backup supplier analysis with multi-factor matching</p>
      </div>

      {/* Supplier group selector */}
      <div className="flex gap-3 flex-wrap">
        {alternativeSuppliers.map((g, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={clsx('px-4 py-2.5 rounded-xl border text-sm transition-all',
              selected === i
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                : 'bg-[#0d1526] border-[#1e3050] text-slate-400 hover:text-slate-200 hover:border-[#2d4a7a]'
            )}
          >
            <div className="font-medium">{g.forSupplier}</div>
            <div className="text-[11px] opacity-70">{g.forProduct}</div>
          </button>
        ))}
      </div>

      {/* Header card */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
        <Zap className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div>
          <div className="text-red-300 font-medium">Analyzing alternatives for: <span className="text-white">{group.forSupplier}</span></div>
          <div className="text-slate-500 text-sm">Product: {group.forProduct}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-slate-500 text-xs">Alternatives found</div>
          <div className="text-white font-bold text-xl">{group.alternatives.length}</div>
        </div>
      </div>

      {/* Alternatives table */}
      <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e3050]">
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Supplier</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Match Score</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Risk Score</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cost Index</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Delivery Time</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Reliability</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Capacity</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Certifications</th>
              </tr>
            </thead>
            <tbody>
              {[...group.alternatives].sort((a, b) => b.matchScore - a.matchScore).map((alt, i) => (
                <tr key={alt.id} className={`border-b border-[#1e3050]/50 hover:bg-white/3 transition-colors ${i === 0 ? 'bg-emerald-500/5' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-2">
                      {i === 0 && <Star className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />}
                      <div>
                        <div className="text-slate-200 font-medium">{alt.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-600" />
                          <span className="text-slate-500 text-xs">{alt.country}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <MatchScore score={alt.matchScore} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><RiskBadge score={alt.riskScore} size="xs" /></td>
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="text-slate-300 font-mono text-sm">{alt.cost}</div>
                      <div className="text-slate-600 text-[10px]">Base = 100</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-slate-300 text-sm">{alt.deliveryWeeks}w</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="w-28">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-xs">{alt.reliability}%</span>
                      </div>
                      <ScoreBar value={alt.reliability} color={alt.reliability >= 90 ? '#10b981' : alt.reliability >= 80 ? '#f59e0b' : '#ef4444'} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-slate-300 text-sm font-medium">{alt.capacity}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {alt.certifications.map(cert => (
                        <span key={cert} className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 font-medium">AI Recommendation</span>
        </div>
        <p className="text-slate-400 text-sm">
          Based on multi-factor analysis (cost {' '}<span className="text-white">25%</span>{' '}· risk {' '}<span className="text-white">30%</span>{' '}· delivery {' '}<span className="text-white">20%</span>{' '}· reliability {' '}<span className="text-white">25%</span>),
          {' '}<span className="text-white font-medium">{group.alternatives.sort((a, b) => b.matchScore - a.matchScore)[0]?.name}</span>{' '}
          is the recommended primary backup supplier for {group.forProduct} with a match score of{' '}
          <span className="text-emerald-400 font-bold">{group.alternatives.sort((a, b) => b.matchScore - a.matchScore)[0]?.matchScore}%</span>.
        </p>
      </div>
    </div>
  );
}
