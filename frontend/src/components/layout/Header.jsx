import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, RefreshCw, Wifi, Clock, ChevronRight } from 'lucide-react';
import { alerts } from '../../data/mockData';

const routeLabels = {
  '/overview':    { title: 'Overview', sub: 'Global Supply Chain Dashboard' },
  '/map':         { title: 'Supply Chain Map', sub: 'Interactive Global Network' },
  '/graph':       { title: 'Supplier Network Graph', sub: 'Multi-Tier Dependency Analysis' },
  '/heatmap':     { title: 'Global Risk Heatmap', sub: 'Regional Risk Concentration' },
  '/risk':        { title: 'Risk Scoring', sub: 'AI-Powered Supplier Risk Assessment' },
  '/prediction':  { title: 'Disruption Prediction', sub: '2-4 Week Forecast Model' },
  '/spof':        { title: 'Single Point of Failure', sub: 'Critical Dependency Detection' },
  '/industries':  { title: 'Critical Industries', sub: 'National Security Monitor' },
  '/alerts':      { title: 'Risk Alerts', sub: 'Real-Time Disruption Notifications' },
  '/alternatives':{ title: 'Alternative Suppliers', sub: 'AI Recommendation Engine' },
  '/simulation':  { title: 'Supply Chain Simulation', sub: 'What-If Scenario Analysis' },
  '/copilot':     { title: 'Supply Chain Copilot', sub: 'AI-Powered Assistant' },
};

export default function Header({ onMenuToggle }) {
  const { pathname } = useLocation();
  const [time, setTime] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  const unread = alerts.filter(a => !a.read).length;
  const page = routeLabels[pathname] || { title: 'Resilio', sub: '' };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  return (
    <header className="flex items-center gap-4 px-5 h-[60px] border-b border-[#1e3050] bg-[#080f1f]/80 backdrop-blur-sm flex-shrink-0 z-10">
      <button
        onClick={onMenuToggle}
        className="text-slate-400 hover:text-white transition-colors p-1 rounded"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-slate-500 text-sm hidden sm:block">Resilio</span>
        <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:block flex-shrink-0" />
        <h1 className="text-white text-sm font-semibold truncate">{page.title}</h1>
        {page.sub && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-600 hidden md:block flex-shrink-0" />
            <span className="text-slate-500 text-xs hidden md:block truncate">{page.sub}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
          <Wifi className="w-3 h-3" />
          <span>Live</span>
        </div>

        {/* Time */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-[#0d1526] border border-[#1e3050] px-2.5 py-1 rounded-full font-mono">
          <Clock className="w-3 h-3" />
          <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>

        {/* Sync */}
        <button
          onClick={handleSync}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all ${syncing ? 'text-blue-400' : ''}`}
          title="Sync data"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        </button>

        {/* Alerts bell */}
        <button className="relative p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
