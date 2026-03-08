import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import { suppliers, transportRoutes } from '../../data/mockData';
import RiskBadge from '../common/RiskBadge';
import { Filter, Layers, Info } from 'lucide-react';
import clsx from 'clsx';

function getRiskHex(score) {
  if (score >= 70) return '#ef4444';
  if (score >= 40) return '#f59e0b';
  return '#10b981';
}

function RouteLines({ route }) {
  const color = route.status === 'disrupted' ? '#ef4444' : route.status === 'warning' ? '#f59e0b' : '#3b82f6';
  return (
    <Polyline
      positions={route.waypoints}
      pathOptions={{ color, weight: route.status === 'disrupted' ? 3 : 1.5, opacity: 0.6, dashArray: route.status === 'disrupted' ? '8,6' : null }}
    />
  );
}

const tierFilters = ['All', '1', '2', '3'];
const industryFilters = ['All', 'Semiconductors', 'Automotive', 'Electronics', 'Mining', 'Energy', 'Logistics', 'Pharmaceuticals', 'Food', 'Chemicals'];

export default function SupplyChainMap() {
  const [tierFilter, setTierFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [showRoutes, setShowRoutes] = useState(true);
  const [selected, setSelected] = useState(null);

  const filtered = suppliers.filter(s => {
    const tierOk = tierFilter === 'All' || String(s.tier) === tierFilter;
    const indOk = industryFilter === 'All' || s.industry === industryFilter;
    return tierOk && indOk;
  });

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Global Supply Chain Map</h2>
          <p className="text-slate-500 text-sm">Click any node to inspect supplier details</p>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#0d1526] border border-[#1e3050] rounded-lg p-1">
            {tierFilters.map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={clsx('px-2.5 py-1 rounded text-xs font-medium transition-all',
                  tierFilter === t ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {t === 'All' ? 'All Tiers' : `T${t}`}
              </button>
            ))}
          </div>
          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="bg-[#0d1526] border border-[#1e3050] text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50"
          >
            {industryFilters.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <button
            onClick={() => setShowRoutes(v => !v)}
            className={clsx('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all',
              showRoutes ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'text-slate-400 border-[#1e3050] hover:text-slate-200'
            )}
          >
            <Layers className="w-3 h-3" />
            Routes
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {[['High Risk (≥70)', '#ef4444'], ['Medium Risk (40-69)', '#f59e0b'], ['Low Risk (<40)', '#10b981']].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: c, background: `${c}30` }} />
            <span className="text-slate-500 text-xs">{l}</span>
          </div>
        ))}
        {showRoutes && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-blue-500 rounded" />
              <span className="text-slate-500 text-xs">Normal Route</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-red-500 rounded border-dashed" />
              <span className="text-slate-500 text-xs">Disrupted Route</span>
            </div>
          </>
        )}
      </div>

      {/* Map area */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-[#1e3050]" style={{ minHeight: 450 }}>
        <MapContainer
          center={[20, 20]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          minZoom={1}
          maxZoom={10}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {showRoutes && transportRoutes.map(r => <RouteLines key={r.id} route={r} />)}

          {filtered.map(s => (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={s.tier === 1 ? 10 : s.tier === 2 ? 7 : 5}
              pathOptions={{
                color: getRiskHex(s.riskScore),
                fillColor: getRiskHex(s.riskScore),
                fillOpacity: 0.75,
                weight: 2,
              }}
              eventHandlers={{ click: () => setSelected(s) }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-white font-bold text-sm">{s.name}</div>
                      <div className="text-slate-400 text-xs">{s.city}, {s.country}</div>
                    </div>
                    <RiskBadge score={s.riskScore} size="xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="text-slate-500">Tier</div><div className="text-slate-200">{s.tier}</div>
                    <div className="text-slate-500">Industry</div><div className="text-slate-200">{s.industry}</div>
                    <div className="text-slate-500">Revenue</div><div className="text-slate-200">{s.revenue}</div>
                    <div className="text-slate-500">Employees</div><div className="text-slate-200">{s.employees.toLocaleString()}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#1e3050]">
                    <div className="text-slate-500 text-[10px] mb-1">Risk Breakdown</div>
                    <div className="space-y-1">
                      {[
                        ['Geopolitical', s.geopoliticalRisk],
                        ['Financial', s.financialStability],
                        ['Natural Disaster', s.naturalDisasterRisk],
                        ['Transport', s.transportRisk],
                        ['Concentration', s.concentrationRisk],
                      ].map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 text-[10px]">{label}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${val}%`,
                                background: val >= 70 ? '#ef4444' : val >= 40 ? '#f59e0b' : '#10b981'
                              }} />
                            </div>
                            <span className="text-slate-400 text-[10px] w-6 text-right">{val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="text-slate-600 text-xs flex items-center gap-1.5">
        <Info className="w-3 h-3" />
        Showing {filtered.length} of {suppliers.length} suppliers. Nodes sized by supplier tier (T1 = largest).
      </div>
    </div>
  );
}
