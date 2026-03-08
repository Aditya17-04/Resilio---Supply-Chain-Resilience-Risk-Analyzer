import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Globe, GitBranch, ShieldAlert, TrendingUp,
  AlertTriangle, Users, Factory, Bell, FlaskConical, Map,
  Bot, ChevronRight, Activity, Zap
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/overview',    icon: LayoutDashboard, label: 'Overview',              group: 'main' },
  { to: '/map',         icon: Globe,            label: 'Supply Chain Map',      group: 'main' },
  { to: '/graph',       icon: GitBranch,        label: 'Supplier Network',      group: 'main' },
  { to: '/heatmap',     icon: Map,              label: 'Risk Heatmap',          group: 'main' },
  { to: '/risk',        icon: ShieldAlert,      label: 'Risk Scoring',          group: 'risk' },
  { to: '/prediction',  icon: TrendingUp,       label: 'Disruption Prediction', group: 'risk' },
  { to: '/spof',        icon: AlertTriangle,    label: 'Single Point Failure',  group: 'risk', badge: '5' },
  { to: '/industries',  icon: Factory,          label: 'Critical Industries',   group: 'risk' },
  { to: '/alerts',      icon: Bell,             label: 'Risk Alerts',           group: 'ops', badge: '3' },
  { to: '/alternatives',icon: Users,            label: 'Alt. Suppliers',        group: 'ops' },
  { to: '/simulation',  icon: FlaskConical,     label: 'Simulation',            group: 'ops' },
  { to: '/copilot',     icon: Bot,              label: 'AI Copilot',            group: 'ai' },
];

const groups = {
  main: 'Core Views',
  risk: 'Risk Analysis',
  ops: 'Operations',
  ai: 'AI Assistant',
};

export default function Sidebar({ open, onToggle }) {
  const grouped = Object.entries(groups).map(([key, label]) => ({
    key, label, items: navItems.filter(n => n.group === key)
  }));

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-[#080f1f] border-r border-[#1e3050] transition-all duration-300 z-20 flex-shrink-0',
        open ? 'w-60' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1e3050] min-h-[60px]">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full status-dot" />
        </div>
        {open && (
          <div>
            <div className="text-white font-bold text-sm leading-tight">Resilio</div>
            <div className="text-slate-500 text-[10px] leading-tight">Supply Chain AI</div>
          </div>
        )}
        {open && (
          <button
            onClick={onToggle}
            className="ml-auto text-slate-600 hover:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {grouped.map(({ key, label, items }) => (
          <div key={key}>
            {open && (
              <div className="px-4 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  {label}
                </span>
              </div>
            )}
            {items.map(({ to, icon: Icon, label: itemLabel, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 group relative',
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  )
                }
                title={!open ? itemLabel : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {open && (
                  <>
                    <span className="text-sm font-medium truncate">{itemLabel}</span>
                    {badge && (
                      <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-500/30">
                        {badge}
                      </span>
                    )}
                  </>
                )}
                {!open && badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={clsx('border-t border-[#1e3050] p-3', open ? 'flex items-center gap-2' : 'flex justify-center')}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">SC</span>
        </div>
        {open && (
          <div>
            <div className="text-slate-300 text-xs font-medium">Supply Chain Analyst</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-emerald-400 text-[10px]">Live Monitoring</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
