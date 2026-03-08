import React, { useState } from 'react';
import { alerts } from '../../data/mockData';
import RiskBadge from '../common/RiskBadge';
import { Bell, AlertTriangle, Ship, CloudRain, BarChart2, Globe, Building2, Filter, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const categoryMeta = {
  geopolitical: { icon: Globe, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Geopolitical' },
  natural_disaster: { icon: CloudRain, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Natural Disaster' },
  port: { icon: Ship, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Port' },
  financial: { icon: BarChart2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Financial' },
  logistics: { icon: Ship, color: 'text-violet-400', bg: 'bg-violet-400/10', label: 'Logistics' },
  trade: { icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Trade' },
  weather: { icon: CloudRain, color: 'text-sky-400', bg: 'bg-sky-400/10', label: 'Weather' },
};

const alertTypeBorder = {
  critical: 'border-l-red-500 bg-red-500/5',
  high: 'border-l-orange-500 bg-orange-500/5',
  medium: 'border-l-amber-500 bg-amber-500/5',
  low: 'border-l-blue-500 bg-blue-500/5',
};

function AlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const meta = categoryMeta[alert.category] || { icon: Bell, color: 'text-slate-400', bg: 'bg-slate-400/10', label: 'General' };
  const Icon = meta.icon;

  return (
    <div
      className={clsx(
        'border border-[#1e3050] border-l-4 rounded-xl p-4 cursor-pointer transition-all hover:border-[#2d4a7a]',
        alertTypeBorder[alert.type],
        !alert.read && 'ring-1 ring-white/5'
      )}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="flex items-start gap-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', meta.bg)}>
          <Icon className={clsx('w-4 h-4', meta.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={clsx('text-sm font-semibold', alert.read ? 'text-slate-300' : 'text-white')}>
                {alert.title}
              </span>
              {!alert.read && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <RiskBadge level={alert.type.toUpperCase()} size="xs" pulse={alert.type === 'critical'} />
              <span className="text-slate-600 text-[10px] whitespace-nowrap">
                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-400 text-xs">{alert.supplierName}</span>
            <span className="text-slate-700 text-xs">|</span>
            <span className={clsx('text-xs px-1.5 py-0.5 rounded', meta.bg, meta.color)}>{meta.label}</span>
          </div>
          <p className="text-slate-500 text-xs mt-1.5">{alert.description}</p>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-[#1e3050] grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div className="text-slate-600 text-[10px] mb-1">Probability</div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-[#1e3050] rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${alert.probability}%`, background: alert.probability >= 70 ? '#ef4444' : alert.probability >= 40 ? '#f59e0b' : '#10b981' }} />
                  </div>
                  <span className="text-slate-300 text-xs font-mono">{alert.probability}%</span>
                </div>
              </div>
              <div>
                <div className="text-slate-600 text-[10px] mb-1">Est. Economic Loss</div>
                <div className="text-red-400 text-sm font-bold">{alert.econLoss}</div>
              </div>
              <div>
                <div className="text-slate-600 text-[10px] mb-1">Affected Industries</div>
                <div className="flex flex-wrap gap-1">
                  {alert.affected.slice(0, 3).map(a => (
                    <span key={a} className="text-[10px] bg-[#1e3050] text-slate-400 px-1.5 py-0.5 rounded">{a}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-slate-600 text-[10px] mb-1">Source</div>
                <div className="text-slate-400 text-xs">{alert.supplierName}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiskAlerts() {
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const typeFilters = ['all', 'critical', 'high', 'medium', 'low'];
  const categories = ['all', ...Object.keys(categoryMeta)];

  const filtered = alerts.filter(a => {
    const typeOk = filter === 'all' || a.type === filter;
    const catOk = categoryFilter === 'all' || a.category === categoryFilter;
    return typeOk && catOk;
  });

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  alerts.forEach(a => counts[a.type]++);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Real-Time Risk Alerts</h2>
          <p className="text-slate-500 text-sm">Live disruption monitoring — {alerts.filter(a => !a.read).length} unread alerts</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live monitoring active
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3">
        {[['CRITICAL', counts.critical, 'bg-red-500/10 border-red-500/30 text-red-400'],
          ['HIGH', counts.high, 'bg-orange-500/10 border-orange-500/30 text-orange-400'],
          ['MEDIUM', counts.medium, 'bg-amber-500/10 border-amber-500/30 text-amber-400'],
          ['LOW', counts.low, 'bg-blue-500/10 border-blue-500/30 text-blue-400']].map(([l, c, cls]) => (
          <div key={l} className={`border rounded-xl p-3 text-center ${cls}`}>
            <div className="text-2xl font-bold">{c}</div>
            <div className="text-[11px] font-semibold mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500" />
        <div className="flex items-center gap-1 bg-[#0d1526] border border-[#1e3050] rounded-lg p-1">
          {typeFilters.map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={clsx('px-2.5 py-1 rounded text-xs font-medium capitalize transition-all',
                filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'
              )}
            >{f}</button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#0d1526] border border-[#1e3050] text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none capitalize"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : categoryMeta[c]?.label || c}</option>
          ))}
        </select>
        <span className="text-slate-600 text-xs ml-auto">{filtered.length} alerts</span>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <CheckCheck className="w-8 h-8 mx-auto mb-2" />
            <p>No alerts for selected filters</p>
          </div>
        ) : (
          filtered.map(a => <AlertCard key={a.id} alert={a} />)
        )}
      </div>
    </div>
  );
}
