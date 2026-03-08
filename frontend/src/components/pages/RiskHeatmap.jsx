import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { heatmapRegions, suppliers } from '../../data/mockData';
import RiskBadge from '../common/RiskBadge';
import { Info, Thermometer } from 'lucide-react';

function getRiskHex(level) {
  if (level === 'CRITICAL') return '#dc2626';
  if (level === 'HIGH') return '#ef4444';
  if (level === 'MEDIUM') return '#f59e0b';
  return '#10b981';
}

export default function RiskHeatmap() {
  const [filter, setFilter] = useState('All');
  const levels = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const filtered = heatmapRegions.filter(r => filter === 'All' || r.risk === filter);

  // Count by level
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  heatmapRegions.forEach(r => counts[r.risk]++);

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Global Risk Heatmap</h2>
          <p className="text-slate-500 text-sm">Regional supply chain risk intensity based on 6 disruption factors</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {levels.map(l => (
            <button key={l}
              onClick={() => setFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all font-medium ${
                filter === l
                  ? l === 'CRITICAL' ? 'bg-red-900/60 border-red-500 text-red-300'
                    : l === 'HIGH' ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : l === 'MEDIUM' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : l === 'LOW' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : 'bg-[#0d1526] border-[#1e3050] text-slate-400 hover:text-slate-200'
              }`}
            >
              {l} {l !== 'All' && `(${counts[l] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 flex-wrap">
        {[['CRITICAL','#dc2626','Imminent threat / active conflict'],
          ['HIGH','#ef4444','Significant risk factors present'],
          ['MEDIUM','#f59e0b','Moderate risk — monitoring required'],
          ['LOW','#10b981','Stable conditions']].map(([l,c,desc]) => (
          <div key={l} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.8 }} />
            <span className="text-slate-400 text-xs"><span className="font-medium" style={{ color: c }}>{l}</span> — {desc}</span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          ['CRITICAL', counts.CRITICAL, '#dc2626', 'bg-red-900/20 border-red-700/30'],
          ['HIGH', counts.HIGH, '#ef4444', 'bg-red-500/10 border-red-500/20'],
          ['MEDIUM', counts.MEDIUM, '#f59e0b', 'bg-amber-500/10 border-amber-500/20'],
          ['LOW', counts.LOW, '#10b981', 'bg-emerald-500/10 border-emerald-500/20'],
        ].map(([l, c, color, cls]) => (
          <div key={l} className={`border rounded-xl p-3 text-center ${cls}`}>
            <div className="text-2xl font-bold" style={{ color }}>{c}</div>
            <div className="text-xs mt-0.5" style={{ color, opacity: 0.8 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-[#1e3050]" style={{ minHeight: 400 }}>
        <MapContainer
          center={[20, 15]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          minZoom={1}
          maxZoom={8}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {filtered.map((r, i) => (
            <CircleMarker
              key={i}
              center={[r.lat, r.lng]}
              radius={r.risk === 'CRITICAL' ? 30 : r.risk === 'HIGH' ? 22 : r.risk === 'MEDIUM' ? 16 : 12}
              pathOptions={{
                color: getRiskHex(r.risk),
                fillColor: getRiskHex(r.risk),
                fillOpacity: r.intensity * 0.5,
                weight: r.risk === 'CRITICAL' ? 2 : 1,
                opacity: 0.8,
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-bold text-white mb-1">{r.country}</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-slate-500">Risk Level</span>
                    <RiskBadge level={r.risk} size="xs" pulse={r.risk === 'CRITICAL'} />
                    <span className="text-slate-500">Key Factor</span>
                    <span className="text-slate-300">{r.factor}</span>
                    <span className="text-slate-500">Intensity</span>
                    <span className="text-slate-300">{Math.round(r.intensity * 100)}%</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Risk factors legend */}
      <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-4 h-4 text-slate-400" />
          <h3 className="text-white font-medium text-sm">Risk Factor Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            ['Natural Disasters', '🌪', 'Hurricanes, floods, earthquakes'],
            ['Armed Conflicts', '⚔️', 'Wars, terrorism, civil unrest'],
            ['Trade Restrictions', '🚫', 'Tariffs, sanctions, embargoes'],
            ['Economic Instability', '📉', 'Inflation, currency risk, debt'],
            ['Port Congestion', '⚓', 'Container backlogs, strikes'],
            ['Geopolitical Tension', '🌍', 'Diplomatic disputes, proxy risks'],
          ].map(([name, icon, desc]) => (
            <div key={name} className="text-center p-2 rounded-lg bg-[#111e36] border border-[#1e3050]">
              <div className="text-lg mb-1">{icon}</div>
              <div className="text-slate-300 text-[11px] font-medium">{name}</div>
              <div className="text-slate-600 text-[10px] mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-slate-600 text-xs">
        <Info className="w-3 h-3" />
        Circle size indicates risk severity. Opacity indicates disruption probability. Data sourced from World Bank, ACLED, and geopolitical indices.
      </div>
    </div>
  );
}
