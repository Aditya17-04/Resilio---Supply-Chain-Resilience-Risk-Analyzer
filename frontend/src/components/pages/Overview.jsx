import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, Bell, AlertTriangle, Globe, TrendingUp,
  Factory, Users, ArrowRight, Zap, Activity, RefreshCw
} from 'lucide-react';
import MetricCard from '../common/MetricCard';
import RiskBadge from '../common/RiskBadge';
import { metrics, suppliers, alerts, industries, predictions } from '../../data/mockData';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

function AlertRow({ alert }) {
  const typeColors = {
    critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-blue-500'
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${alert.read ? 'border-[#1e3050] bg-transparent' : 'border-blue-500/20 bg-blue-500/5'}`}>
      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[alert.type] || 'bg-slate-500'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-slate-200 text-sm font-medium leading-tight truncate">{alert.title}</p>
          <span className="text-slate-600 text-[10px] whitespace-nowrap flex-shrink-0">
            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-slate-500 text-xs mt-0.5 truncate">{alert.description.slice(0, 80)}…</p>
      </div>
    </div>
  );
}

function RiskGauge({ score }) {
  const angle = -135 + (score / 100) * 270;
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="80" viewBox="0 0 120 80">
        <path d="M 15 75 A 50 50 0 0 1 105 75" fill="none" stroke="#1e3050" strokeWidth="8" strokeLinecap="round" />
        <path d="M 15 75 A 50 50 0 0 1 105 75"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 157} 157`}
        />
        <text x="60" y="70" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="JetBrains Mono">{score}</text>
        <text x="60" y="55" textAnchor="middle" fill="#64748b" fontSize="8">AVG RISK</text>
      </svg>
    </div>
  );
}

export default function Overview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const topRisk = [...suppliers].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  const recentAlerts = [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  const highIndustries = [...industries].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Supply Chain Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Monitoring {metrics.totalSuppliers} suppliers across {metrics.countriesMonitored} countries — {metrics.economicExposure} economic exposure</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>Live — Updated just now</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Total Suppliers" value={metrics.totalSuppliers} subtitle={`${metrics.countriesMonitored} countries`} icon={Users} color="blue" />
        <MetricCard title="High Risk" value={metrics.highRiskCount} subtitle="Score ≥ 60" icon={ShieldAlert} color="red" trend={+8} trendLabel="30d" />
        <MetricCard title="Active Alerts" value={metrics.activeAlerts} subtitle={`${metrics.criticalAlerts} critical`} icon={Bell} color="yellow" />
        <MetricCard title="SPO Failures" value={metrics.singlePointFailures} subtitle="Detected" icon={AlertTriangle} color="red" />
        <MetricCard title="Industries" value={metrics.industriesMonitored} subtitle="Monitored" icon={Factory} color="purple" />
        <MetricCard title="Avg Risk Score" value={metrics.avgRiskScore} subtitle="Out of 100" icon={TrendingUp} color={metrics.avgRiskScore >= 60 ? 'red' : metrics.avgRiskScore >= 40 ? 'yellow' : 'green'} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Prediction chart */}
        <div className="xl:col-span-2 bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Disruption Probability Forecast</h3>
              <p className="text-slate-500 text-xs mt-0.5">Next 4 weeks — AI model (XGBoost + LSTM)</p>
            </div>
            <Link to="/prediction" className="flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300">
              View Full <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={predictions} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="semGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="autGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="logGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#0d1526', border: '1px solid #1e3050', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                formatter={(v, name) => [`${v}%`, name]}
              />
              <Area type="monotone" dataKey="semiconductor" name="Semiconductor" stroke="#8b5cf6" fill="url(#semGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="automotive" name="Automotive" stroke="#ef4444" fill="url(#autGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="logistics" name="Logistics" stroke="#f97316" fill="url(#logGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            {[['Semiconductor','#8b5cf6'],['Automotive','#ef4444'],['Logistics','#f97316']].map(([l,c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded" style={{ background: c }} />
                <span className="text-slate-500 text-xs">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Gauge + Industry */}
        <div className="space-y-4">
          <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Portfolio Risk Score</h3>
            <div className="flex flex-col items-center">
              <RiskGauge score={metrics.avgRiskScore} />
              <div className="flex gap-3 mt-3 text-xs">
                <div className="text-center"><div className="font-bold text-emerald-400">{metrics.lowRiskCount}</div><div className="text-slate-600">Low</div></div>
                <div className="text-center"><div className="font-bold text-amber-400">{metrics.mediumRiskCount}</div><div className="text-slate-600">Medium</div></div>
                <div className="text-center"><div className="font-bold text-red-400">{metrics.highRiskCount}</div><div className="text-slate-600">High</div></div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Industry Risk</h3>
              <Link to="/industries" className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">All <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-2">
              {highIndustries.slice(0, 5).map(ind => (
                <div key={ind.id} className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 text-xs truncate">{ind.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#1e3050] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${ind.riskScore}%`, background: ind.color }} />
                    </div>
                    <RiskBadge level={ind.riskLevel} size="xs" showLabel={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top risky suppliers */}
        <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Highest Risk Suppliers</h3>
            <Link to="/risk" className="flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300">
              All suppliers <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {topRisk.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-slate-600 text-xs w-4 text-right">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 text-sm font-medium truncate">{s.name}</span>
                    <span className="text-slate-600 text-xs">({s.country})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-600 text-[10px]">Tier {s.tier}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-slate-600 text-[10px]">{s.industry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 bg-[#1e3050] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${s.riskScore}%`,
                      background: s.riskScore >= 70 ? '#ef4444' : s.riskScore >= 40 ? '#f59e0b' : '#10b981'
                    }} />
                  </div>
                  <RiskBadge score={s.riskScore} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Alerts</h3>
            <Link to="/alerts" className="flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300">
              All alerts <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentAlerts.map(a => <AlertRow key={a.id} alert={a} />)}
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/map', icon: Globe, label: 'View World Map', color: 'blue' },
          { to: '/graph', icon: Zap, label: 'Supplier Graph', color: 'purple' },
          { to: '/simulation', icon: RefreshCw, label: 'Run Simulation', color: 'cyan' },
          { to: '/copilot', icon: Activity, label: 'Ask AI Copilot', color: 'green' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 p-3 rounded-xl border border-[#1e3050] bg-[#0d1526] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group`}
          >
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{label}</span>
            <ArrowRight className="w-3 h-3 text-slate-600 ml-auto group-hover:text-blue-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
