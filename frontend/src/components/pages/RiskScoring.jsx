import React, { useState } from 'react';
import { suppliers } from '../../data/mockData';
import RiskBadge from '../common/RiskBadge';
import { Search, ChevronDown, ChevronUp, ArrowUpDown, Shield } from 'lucide-react';
import clsx from 'clsx';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

function RiskBar({ value }) {
  const color = value >= 70 ? '#ef4444' : value >= 40 ? '#f59e0b' : '#10b981';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1e3050] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

export default function RiskScoring() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('riskScore');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(null);
  const [industryFilter, setIndustryFilter] = useState('All');

  const industries = ['All', ...new Set(suppliers.map(s => s.industry))].sort();

  const filtered = suppliers
    .filter(s =>
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
       s.country.toLowerCase().includes(search.toLowerCase())) &&
      (industryFilter === 'All' || s.industry === industryFilter)
    )
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (typeof a[sortKey] === 'number') return (a[sortKey] - b[sortKey]) * mult;
      return a[sortKey].localeCompare(b[sortKey]) * mult;
    });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const radarData = selected ? [
    { subject: 'Geopolitical', A: selected.geopoliticalRisk },
    { subject: 'Financial', A: selected.financialStability },
    { subject: 'Natural\nDisaster', A: selected.naturalDisasterRisk },
    { subject: 'Transport', A: selected.transportRisk },
    { subject: 'Concentration', A: selected.concentrationRisk },
  ] : [];

  const barData = [...suppliers]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 12)
    .map(s => ({ name: s.name.split(' ')[0], score: s.riskScore }));

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-slate-600" />;
    return sortDir === 'desc' ? <ChevronDown className="w-3 h-3 text-blue-400" /> : <ChevronUp className="w-3 h-3 text-blue-400" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">AI Risk Scoring System</h2>
          <p className="text-slate-500 text-sm">Dynamic 0–100 risk scores powered by multi-factor analysis</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {[['Low Risk', 'bg-emerald-500'], ['Medium Risk', 'bg-amber-500'], ['High Risk', 'bg-red-500']].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${c}`} /><span className="text-slate-400 text-xs">{l}</span></div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
          <h3 className="text-white font-medium text-sm mb-4">Top 12 Suppliers by Risk Score</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3050', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 70 ? '#ef4444' : entry.score >= 40 ? '#f59e0b' : '#10b981'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {selected ? (
          <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium text-sm">{selected.name}</h3>
              <RiskBadge score={selected.riskScore} size="xs" />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e3050" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="Risk" dataKey="A" stroke={selected.riskScore >= 70 ? '#ef4444' : selected.riskScore >= 40 ? '#f59e0b' : '#10b981'}
                  fill={selected.riskScore >= 70 ? '#ef444440' : selected.riskScore >= 40 ? '#f59e0b40' : '#10b98140'}
                  fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-xs text-slate-500 text-center">Click a row to change</div>
          </div>
        ) : (
          <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5 flex flex-col items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-slate-700" />
            <p className="text-slate-500 text-sm text-center">Click a supplier row to see detailed risk radar</p>
          </div>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search supplier or country…"
            className="w-full bg-[#0d1526] border border-[#1e3050] text-slate-200 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
          />
        </div>
        <select
          value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
          className="bg-[#0d1526] border border-[#1e3050] text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none"
        >
          {industries.map(i => <option key={i}>{i}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e3050]">
                {[['name','Supplier'],['country','Country'],['tier','Tier'],['industry','Industry'],['riskScore','Risk Score'],['geopoliticalRisk','Geopolitical'],['financialStability','Financial'],['naturalDisasterRisk','Natural Disaster'],['transportRisk','Transport'],['concentrationRisk','Concentration']].map(([k,l]) => (
                  <th key={k}
                    className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 cursor-pointer hover:text-slate-300 whitespace-nowrap"
                    onClick={() => handleSort(k)}
                  >
                    <div className="flex items-center gap-1">{l} <SortIcon col={k} /></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className={clsx('border-b border-[#1e3050]/50 cursor-pointer transition-colors',
                    selected?.id === s.id ? 'bg-blue-500/10' : i % 2 === 0 ? 'bg-transparent hover:bg-white/3' : 'bg-white/[0.02] hover:bg-white/5'
                  )}
                  onClick={() => setSelected(s)}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', s.status === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400')} />
                      <span className="text-slate-200 font-medium whitespace-nowrap">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{s.country}</td>
                  <td className="px-4 py-2.5 text-slate-400">T{s.tier}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-slate-400 bg-[#1e3050] px-2 py-0.5 rounded text-[11px] whitespace-nowrap">{s.industry}</span>
                  </td>
                  <td className="px-4 py-2.5"><RiskBadge score={s.riskScore} size="xs" /></td>
                  <td className="px-4 py-2.5 min-w-[80px]"><RiskBar value={s.geopoliticalRisk} /></td>
                  <td className="px-4 py-2.5 min-w-[80px]"><RiskBar value={s.financialStability} /></td>
                  <td className="px-4 py-2.5 min-w-[80px]"><RiskBar value={s.naturalDisasterRisk} /></td>
                  <td className="px-4 py-2.5 min-w-[80px]"><RiskBar value={s.transportRisk} /></td>
                  <td className="px-4 py-2.5 min-w-[80px]"><RiskBar value={s.concentrationRisk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-[#1e3050] flex items-center justify-between">
          <span className="text-slate-600 text-xs">{filtered.length} of {suppliers.length} suppliers</span>
        </div>
      </div>
    </div>
  );
}
