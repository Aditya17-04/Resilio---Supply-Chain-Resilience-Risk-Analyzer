import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { disruptionPredictions, riskTrend, suppliers } from '../data/dummyData'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-xs shadow-xl">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}%</span></p>
        ))}
      </div>
    )
  }
  return null
}

const inputs = [
  { name: 'Weather Events', value: 68, icon: '🌪', trend: 'up', change: '+12%' },
  { name: 'News Sentiment', value: 42, icon: '📰', trend: 'up', change: '+8%' },
  { name: 'Shipping Delays', value: 55, icon: '🚢', trend: 'stable', change: '0%' },
  { name: 'Port Congestion', value: 71, icon: '⚓', trend: 'up', change: '+15%' },
  { name: 'Political Instability', value: 78, icon: '🏛', trend: 'up', change: '+22%' },
]

const modelAccuracy = [
  { model: 'Random Forest', accuracy: 84, f1: 82, precision: 86 },
  { model: 'XGBoost', accuracy: 88, f1: 87, precision: 89 },
  { model: 'LSTM', accuracy: 91, f1: 90, precision: 92 },
]

const weeklyForecast = [
  { day: 'Mon', probability: 62, threshold: 70 },
  { day: 'Tue', probability: 68, threshold: 70 },
  { day: 'Wed', probability: 75, threshold: 70 },
  { day: 'Thu', probability: 72, threshold: 70 },
  { day: 'Fri', probability: 80, threshold: 70 },
  { day: 'Sat', probability: 78, threshold: 70 },
  { day: 'Sun', probability: 74, threshold: 70 },
]

export default function DisruptionPrediction() {
  const [selectedIndustry, setSelectedIndustry] = useState('semiconductors')

  const topRiskByIndustry = {
    semiconductors: { prob: 74, label: 'Semiconductors', drivers: ['Taiwan geopolitical tension', 'Typhoon season Q3', 'Rare earth export controls'] },
    energy: { prob: 82, label: 'Energy', drivers: ['Russia conflict escalation', 'OPEC production cuts', 'European gas shortage'] },
    food: { prob: 70, label: 'Food & Agriculture', drivers: ['Black Sea corridor disruption', 'El Niño drought pattern', 'Wheat export bans'] },
    pharmaceuticals: { prob: 38, label: 'Pharmaceuticals', drivers: ['API supplier concentration India', 'Chemical precursor shortage', 'Regulatory delays'] },
    automotive: { prob: 55, label: 'Automotive', drivers: ['Lithium price spike', 'Chip shortage persistence', 'EV demand surge'] },
  }

  const current = topRiskByIndustry[selectedIndustry]

  return (
    <div className="space-y-6">
      {/* Input Signals */}
      <div>
        <h3 className="section-title mb-3">AI Model Input Signals</h3>
        <div className="grid grid-cols-5 gap-3">
          {inputs.map(input => (
            <div key={input.name} className="glass-card p-4">
              <div className="text-2xl mb-2">{input.icon}</div>
              <div className="text-xs text-slate-400 mb-1">{input.name}</div>
              <div className="text-xl font-bold" style={{ color: input.value >= 70 ? '#ef4444' : input.value >= 40 ? '#f59e0b' : '#10b981' }}>
                {input.value}
              </div>
              <div className="risk-bar mt-1">
                <div className="risk-bar-fill" style={{
                  width: `${input.value}%`,
                  backgroundColor: input.value >= 70 ? '#ef4444' : input.value >= 40 ? '#f59e0b' : '#10b981'
                }}></div>
              </div>
              <div className={`text-xs mt-1.5 font-medium ${input.trend === 'up' ? 'text-red-400' : input.trend === 'down' ? 'text-emerald-400' : 'text-slate-500'}`}>
                {input.trend === 'up' ? '▲' : input.trend === 'down' ? '▼' : '—'} {input.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* 4-Week Prediction Chart */}
        <div className="col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">4-Week Disruption Probability Forecast</h3>
            <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
              {Object.keys(topRiskByIndustry).map(ind => (
                <button key={ind} onClick={() => setSelectedIndustry(ind)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all capitalize ${selectedIndustry === ind ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >{ind.slice(0, 4)}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={disruptionPredictions}>
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Alert threshold', fill: '#ef4444', fontSize: 10 }} />
              <Area type="monotone" dataKey={selectedIndustry} name={current.label} stroke="#3b82f6" fill="url(#predGrad)" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction Detail */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="section-title">Prediction Summary</h3>
          <div className="text-center py-4">
            <div className="text-6xl font-black" style={{ color: current.prob >= 70 ? '#ef4444' : current.prob >= 40 ? '#f59e0b' : '#10b981' }}>
              {current.prob}%
            </div>
            <div className="text-sm text-slate-400 mt-1">Disruption Probability</div>
            <div className={`text-xs font-bold mt-2 px-3 py-1 rounded-full inline-block ${
              current.prob >= 70 ? 'bg-red-500/20 text-red-400' :
              current.prob >= 40 ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {current.prob >= 70 ? '⚠ HIGH ALERT' : current.prob >= 40 ? '⚡ ELEVATED' : '✓ NORMAL'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium mb-2">Key Disruption Drivers:</div>
            <div className="space-y-1.5">
              {current.drivers.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                  {d}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Prediction Window</div>
            <div className="text-sm font-semibold text-slate-200">2–4 weeks ahead</div>
            <div className="text-xs text-slate-500 mt-0.5">Updated every 6 hours</div>
          </div>
        </div>

        {/* Daily forecast */}
        <div className="col-span-2 glass-card p-5">
          <h3 className="section-title mb-4">This Week — Daily Probability View</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyForecast} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 2" />
              <Bar dataKey="probability" name="Probability" radius={[4, 4, 0, 0]}
                fill="#3b82f6"
                label={{ position: 'top', fill: '#94a3b8', fontSize: 10, formatter: v => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model Performance */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="section-title">Model Performance</h3>
          <div className="space-y-3">
            {modelAccuracy.map(m => (
              <div key={m.model} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{m.model}</span>
                  <span className="text-emerald-400 font-bold">{m.accuracy}% accuracy</span>
                </div>
                <div className="risk-bar">
                  <div className="risk-bar-fill bg-emerald-500" style={{ width: `${m.accuracy}%` }}></div>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>F1: {m.f1}%</span>
                  <span>Precision: {m.precision}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-xs font-semibold text-blue-400">Active Model: LSTM</div>
            <div className="text-xs text-slate-400 mt-0.5">Best performing on time-series disruption data</div>
          </div>
        </div>
      </div>
    </div>
  )
}
