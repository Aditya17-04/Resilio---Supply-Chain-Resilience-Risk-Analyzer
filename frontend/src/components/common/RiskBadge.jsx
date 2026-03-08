import React from 'react';
import clsx from 'clsx';

export function getRiskColor(score) {
  if (score >= 70) return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400', label: 'HIGH', hex: '#ef4444' };
  if (score >= 40) return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400', label: 'MEDIUM', hex: '#f59e0b' };
  return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400', label: 'LOW', hex: '#10b981' };
}

export function getRiskLevelColor(level) {
  if (level === 'HIGH' || level === 'CRITICAL') return getRiskColor(80);
  if (level === 'MEDIUM') return getRiskColor(55);
  return getRiskColor(20);
}

export default function RiskBadge({ score, level, size = 'sm', showLabel = true, pulse = false }) {
  const c = score !== undefined ? getRiskColor(score) : getRiskLevelColor(level);
  const displayLabel = level || c.label;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        c.bg, c.text, c.border,
        size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      )}
    >
      <span className={clsx('rounded-full flex-shrink-0', c.dot, size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5', pulse && 'animate-pulse')} />
      {showLabel && displayLabel}
      {score !== undefined && showLabel && <span className="opacity-60">({score})</span>}
    </span>
  );
}
