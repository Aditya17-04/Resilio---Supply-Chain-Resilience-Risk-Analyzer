import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'blue', className }) {
  const colors = {
    blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    icon: 'text-blue-400' },
    red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     icon: 'text-red-400' },
    green:   { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
    yellow:  { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   icon: 'text-amber-400' },
    purple:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  icon: 'text-violet-400' },
    cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400',    icon: 'text-cyan-400' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={clsx('bg-[#0d1526] border border-[#1e3050] rounded-xl p-4 hover:border-[#2d4a7a] transition-all', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide truncate">{title}</p>
          <p className={clsx('text-2xl font-bold mt-1', c.text)}>{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-0.5 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <div className={clsx('inline-flex items-center gap-1 mt-2 text-xs font-medium',
              trend > 0 ? 'text-red-400' : trend < 0 ? 'text-emerald-400' : 'text-slate-400'
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              <span>{trend > 0 ? '+' : ''}{trend}% {trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', c.bg, 'border', c.border)}>
            <Icon className={clsx('w-5 h-5', c.icon)} />
          </div>
        )}
      </div>
    </div>
  );
}
