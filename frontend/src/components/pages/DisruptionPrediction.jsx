import React, { useState } from 'react';
import { predictions, industries, suppliers } from '../../data/mockData';
import RiskBadge from '../common/RiskBadge';
import { TrendingUp, Brain, Activity, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  Legend, Cell, ReferenceLine
} from 'recharts';

const INDUSTRY_COLORS = {
  semiconductor: '#8b5cf6', automotive: '#ef4444',
  pharmaceutical: '#06b6d4', food: '#10b981',
  energy: '#f59e0b', logistics: '#f97316'
};

const modelMetrics = [
  { model: 'XGBoost', accuracy: 82, precision: 79, recall: 85, f1: 82, status: 'active' },
  { model: 'LSTM', accuracy: 78, precision: 75, recall: 81, f1: 78, status: 'active' },
  { model: 'Random Forest', accuracy: 80, precision: 77, recall: 83, f1: 80, status: 'active' },
  { model: 'Ensemble', accuracy: 87, precision: 84, recall: 89, f1: 86, status: 'active' },
];

const inputSignals = [
  { name: 'News Sentiment', weight: 22, status: 'live', value: -0.34, trend: 'down' },
  { name: 'Shipping Delays', weight: 19, status: 'live', value: '+2.4 days', trend: 'up' },
  { name: 'Port Congestion', weight: 18, status: 'live', value: '68%', trend: 'up' },
  { name: 'Weather Events', weight: 15, status: 'live', value: '3 active', trend: 'up' },
  { name: 'Political Stability', weight: 14, status: 'live', value: '-1.2 pts', trend: 'down' },
  { name: 'Commodity Prices', weight: 12, status: 'live', value: '+8.3%', trend: 'up' },
];

// Extend predictions with dates
const extendedPredictions = predictions.map((p, i) => ({
  ...p,
  date: `Mar ${(i + 1) * 7 + 7}`,
}));

// Generate historical + predicted combined view
const combinedData = [
  { period: 'Feb 7', semiconductor: 44, automotive: 30, logistics: 55, actual: true },
  { period: 'Feb 14', semiconductor: 48, automotive: 33, logistics: 58, actual: true },
  { period: 'Feb 21', semiconductor: 53, automotive: 38, logistics: 63, actual: true },
  { period: 'Feb 28', semiconductor: 55, automotive: 40, logistics: 68, actual: true },
  { period: 'Mar 7', semiconductor: 58, automotive: 42, logistics: 72, actual: false },
  { period: 'Mar 14', semiconductor: 65, automotive: 48, logistics: 78, actual: false },
  { period: 'Mar 21', semiconductor: 71, automotive: 55, logistics: 69, actual: false },
  { period: 'Mar 28', semiconductor: 68, automotive: 51, logistics: 65, actual: false },
];

export default function DisruptionPrediction() {
  const [selectedIndustry, setSelectedIndustry] = useState('semiconductor');

  const industryPrediction = combinedData[4][selectedIndustry];
  const currentRisk = industryPrediction >= 70 ? 'HIGH' : industryPrediction >= 40 ? 'MEDIUM' : 'LOW';

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Disruption Prediction Model</h2>
          <p className="text-slate-500 text-sm">AI forecast engine — 2 to 4 week advance warning system</p>
        </div>
        <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full">
          <Brain className="w-3 h-3 text-violet-400" />
          <span className="text-violet-400 text-xs font-medium">Ensemble Model Active — 87% Accuracy</span>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {modelMetrics.map(m => (
          <div key={m.model} className={`bg-[#0d1526] border rounded-xl p-4 ${m.model === 'Ensemble' ? 'border-violet-500/30 bg-violet-500/5' : 'border-[#1e3050]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm font-medium">{m.model}</span>
              {m.model === 'Ensemble' && <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/30">Primary</span>}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{m.accuracy}%</div>
            <div className="text-slate-600 text-xs">Accuracy</div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
              <div><div className="text-slate-400 font-medium">{m.precision}%</div><div className="text-slate-600">Prec.</div></div>
              <div><div className="text-slate-400 font-medium">{m.recall}%</div><div className="text-slate-600">Recall</div></div>
              <div><div className="text-slate-400 font-medium">{m.f1}%</div><div className="text-slate-600">F1</div></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-white font-semibold">Disruption Probability Timeline</h3>
            <p className="text-slate-500 text-xs mt-0.5">Solid = historical · Dashed = predicted</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(INDUSTRY_COLORS).map(([key, color]) => (
              <button key={key}
                onClick={() => setSelectedIndustry(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all capitalize ${
                  selectedIndustry === key ? 'border-opacity-60 text-white' : 'border-[#1e3050] text-slate-500 hover:text-slate-300'
                }`}
                style={selectedIndustry === key ? { background: `${color}20`, borderColor: `${color}60`, color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {key}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={combinedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {Object.entries(INDUSTRY_COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" />
            <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <ReferenceLine y={70} stroke="#ef444460" strokeDasharray="4 4" label={{ value: 'HIGH', fill: '#ef4444', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={40} stroke="#f59e0b60" strokeDasharray="4 4" label={{ value: 'MED', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
            <Tooltip
              contentStyle={{ background: '#0d1526', border: '1px solid #1e3050', borderRadius: 8, fontSize: 12 }}
              formatter={(v, name) => [`${v}%`, name]}
              labelFormatter={(l) => `Period: ${l}`}
            />
            {Object.entries(INDUSTRY_COLORS).map(([key, color]) => (
              <Area key={key} type="monotone" dataKey={key} stroke={color}
                fill={`url(#grad_${key})`}
                strokeWidth={selectedIndustry === key ? 2.5 : 1}
                opacity={selectedIndustry === key ? 1 : 0.35}
                strokeDasharray={null}
                dot={false}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-3 pt-3 border-t border-[#1e3050] flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-slate-500">Forecast (Week 1)</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white font-bold text-lg capitalize">{industryPrediction}%</span>
              <RiskBadge level={currentRisk} size="xs" pulse />
            </div>
          </div>
          <div className="flex-1 text-xs text-slate-500">
            Based on {inputSignals.length} live data signals including news sentiment, port congestion, weather events, and geopolitical indicators.
          </div>
        </div>
      </div>

      {/* Input Signals */}
      <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Live Input Signals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {inputSignals.map(sig => (
            <div key={sig.name} className="flex items-center justify-between p-3 rounded-lg bg-[#111e36] border border-[#1e3050]">
              <div>
                <div className="text-slate-300 text-sm font-medium">{sig.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">Weight: {sig.weight}%</div>
              </div>
              <div className="text-right">
                <div className={`font-mono text-sm font-medium ${sig.trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {sig.value}
                </div>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-[10px]">live</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
