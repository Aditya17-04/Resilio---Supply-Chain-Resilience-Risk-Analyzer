import React from 'react';
import { industries } from '../../data/mockData';
import RiskBadge from '../common/RiskBadge';
import { TrendingUp, TrendingDown, Cpu, Pill, Wheat, Zap, Car, Layers, FlaskConical, Ship, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from 'recharts';

const iconMap = { Cpu, Pill, Wheat, Zap, Car, Layers, FlaskConical, Ship };

function IndustryCard({ ind }) {
  const iconColors = {
    HIGH: 'text-red-400 bg-red-500/10 border-red-500/20',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  const trendUp = ind.trend > 0;

  return (
    <div className={`bg-[#0d1526] border rounded-xl p-5 hover:border-[#2d4a7a] transition-all ${
      ind.riskLevel === 'HIGH' ? 'border-red-500/30' : ind.riskLevel === 'MEDIUM' ? 'border-amber-500/20' : 'border-[#1e3050]'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconColors[ind.riskLevel]}`}>
            <span className="text-lg">{ind.flag}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{ind.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-slate-500 text-xs">{ind.suppliers} suppliers</span>
              <span className="text-slate-700">·</span>
              <span className="text-red-400 text-xs font-medium">{ind.criticalCount} critical</span>
            </div>
          </div>
        </div>
        <RiskBadge level={ind.riskLevel} size="xs" pulse={ind.riskLevel === 'HIGH'} />
      </div>

      {/* Risk bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-500 text-xs">Risk Score</span>
          <div className="flex items-center gap-1">
            {trendUp ? <TrendingUp className="w-3 h-3 text-red-400" /> : <TrendingDown className="w-3 h-3 text-emerald-400" />}
            <span className={`text-xs font-medium ${trendUp ? 'text-red-400' : 'text-emerald-400'}`}>
              {trendUp ? '+' : ''}{ind.trend}% 30d
            </span>
          </div>
        </div>
        <div className="h-2 bg-[#1e3050] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${ind.riskScore}%`, background: ind.color }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-slate-600 text-[10px]">0 — Safe</span>
          <span className="font-mono text-xs font-medium" style={{ color: ind.color }}>{ind.riskScore}/100</span>
          <span className="text-slate-600 text-[10px]">100 — Critical</span>
        </div>
      </div>

      <p className="text-slate-500 text-xs">{ind.description}</p>

      {ind.riskLevel === 'HIGH' && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400/80 bg-red-500/5 border border-red-500/20 rounded-lg px-2.5 py-1.5">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          National security risk — immediate review recommended
        </div>
      )}
    </div>
  );
}

export default function CriticalIndustries() {
  const chartData = [...industries].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">National Critical Industry Monitor</h2>
          <p className="text-slate-500 text-sm">Real-time risk assessment for strategic industries</p>
        </div>
        <div className="flex items-center gap-3">
          {['HIGH', 'MEDIUM', 'LOW'].map(level => (
            <div key={level} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${level === 'HIGH' ? 'bg-red-400' : level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-slate-400 text-xs">{level}</span>
              <span className="text-slate-600 text-xs">({industries.filter(i => i.riskLevel === level).length})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overview chart */}
      <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
        <h3 className="text-white font-medium text-sm mb-4">Industry Risk Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={58} />
            <Tooltip
              contentStyle={{ background: '#0d1526', border: '1px solid #1e3050', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v}/100`, 'Risk Score']}
            />
            <Bar dataKey="riskScore" radius={[0, 4, 4, 0]} barSize={14}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Industry cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...industries].sort((a, b) => b.riskScore - a.riskScore).map(ind => (
          <IndustryCard key={ind.id} ind={ind} />
        ))}
      </div>
    </div>
  );
}
