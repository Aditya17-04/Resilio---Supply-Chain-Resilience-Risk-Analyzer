import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, LayerGroup, Polyline } from 'react-leaflet'
import { suppliers, ports, transportRoutes, getRiskColor, getRiskLevel } from '../data/dummyData'

const portPositions = {
  PT001: [31.23, 121.47],
  PT002: [51.95, 4.13],
  PT003: [1.29, 103.85],
  PT004: [33.74, -118.27],
  PT005: [35.10, 129.04],
}

const routeLines = transportRoutes.map(r => ({
  ...r,
  positions: [portPositions[r.from], portPositions[r.to]],
  color: r.riskScore >= 60 ? '#ef4444' : r.riskScore >= 40 ? '#f59e0b' : '#10b981',
}))

export default function SupplyChainMap() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [mapLayer, setMapLayer] = useState('suppliers')

  const filtered = filter === 'all' ? suppliers : suppliers.filter(s => s.industry.toLowerCase() === filter.toLowerCase())

  const industries = ['all', ...new Set(suppliers.map(s => s.industry))]

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700/50">
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => setFilter(ind)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                filter === ind ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700/50">
          {['suppliers', 'ports', 'routes'].map(layer => (
            <button
              key={layer}
              onClick={() => setMapLayer(layer)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                mapLayer === layer ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs text-slate-400">Low (&lt;40)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-xs text-slate-400">Medium (40-69)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs text-slate-400">High (70+)</span></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Map */}
        <div className="col-span-2 glass-card overflow-hidden" style={{ height: '520px' }}>
          <MapContainer
            center={[20, 20]}
            zoom={2}
            style={{ width: '100%', height: '100%' }}
            minZoom={2}
            maxZoom={8}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Supplier markers */}
            {(mapLayer === 'suppliers' || mapLayer === 'routes') && (
              <LayerGroup>
                {filtered.map(supplier => (
                  <CircleMarker
                    key={supplier.id}
                    center={[supplier.lat, supplier.lng]}
                    radius={supplier.riskScore >= 70 ? 10 : supplier.riskScore >= 40 ? 8 : 7}
                    pathOptions={{
                      color: getRiskColor(supplier.riskScore),
                      fillColor: getRiskColor(supplier.riskScore),
                      fillOpacity: 0.8,
                      weight: 2,
                    }}
                    eventHandlers={{ click: () => setSelected(supplier) }}
                  >
                    <Tooltip permanent={false} direction="top" offset={[0, -8]}>
                      <div className="text-xs font-semibold">{supplier.name}</div>
                      <div className="text-xs">Risk: {supplier.riskScore} | {supplier.country}</div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </LayerGroup>
            )}

            {/* Port markers */}
            {(mapLayer === 'ports' || mapLayer === 'routes') && (
              <LayerGroup>
                {ports.map(port => (
                  <CircleMarker
                    key={port.id}
                    center={[port.lat, port.lng]}
                    radius={8}
                    pathOptions={{
                      color: port.congestionLevel === 'HIGH' ? '#ef4444' : port.congestionLevel === 'MEDIUM' ? '#f59e0b' : '#06b6d4',
                      fillColor: port.congestionLevel === 'HIGH' ? '#ef4444' : port.congestionLevel === 'MEDIUM' ? '#f59e0b' : '#06b6d4',
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  >
                    <Tooltip permanent={false} direction="top" offset={[0, -8]}>
                      <div className="text-xs font-semibold">{port.name}</div>
                      <div className="text-xs">Congestion: {port.congestionLevel}</div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </LayerGroup>
            )}

            {/* Transport routes */}
            {mapLayer === 'routes' && (
              <LayerGroup>
                {routeLines.map(route => (
                  <Polyline
                    key={route.id}
                    positions={route.positions}
                    pathOptions={{
                      color: route.color,
                      weight: 2,
                      opacity: 0.6,
                      dashArray: route.status === 'delayed' ? '8 4' : null,
                    }}
                  >
                    <Tooltip>
                      <div className="text-xs">{route.name} — Risk: {route.riskScore}</div>
                    </Tooltip>
                  </Polyline>
                ))}
              </LayerGroup>
            )}

          </MapContainer>
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          {selected ? (
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{selected.name}</h3>
                  <p className="text-sm text-slate-400">{selected.country}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg leading-none">×</button>
              </div>

              {/* Risk Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Overall Risk Score</span>
                  <span className="text-lg font-bold" style={{ color: getRiskColor(selected.riskScore) }}>{selected.riskScore}</span>
                </div>
                <div className="risk-bar">
                  <div className="risk-bar-fill" style={{ width: `${selected.riskScore}%`, backgroundColor: getRiskColor(selected.riskScore) }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs text-slate-500">Tier</span><div className="text-sm font-semibold text-slate-200 mt-0.5">Tier {selected.tier}</div></div>
                <div><span className="text-xs text-slate-500">Industry</span><div className="text-sm font-semibold text-slate-200 mt-0.5">{selected.industry}</div></div>
                <div><span className="text-xs text-slate-500">Employees</span><div className="text-sm font-semibold text-slate-200 mt-0.5">{selected.employees?.toLocaleString()}</div></div>
                <div><span className="text-xs text-slate-500">Revenue</span><div className="text-sm font-semibold text-slate-200 mt-0.5">{selected.revenue}</div></div>
                <div><span className="text-xs text-slate-500">Est.</span><div className="text-sm font-semibold text-slate-200 mt-0.5">{selected.established}</div></div>
                <div><span className="text-xs text-slate-500">Concentration</span>
                  <div className={`text-sm font-semibold mt-0.5 ${selected.concentration === 'Critical' ? 'text-red-400' : selected.concentration === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selected.concentration}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Risk Breakdown</span>
                {[
                  { label: 'Geopolitical', value: selected.geopoliticalRisk, color: '#ef4444' },
                  { label: 'Disaster', value: selected.disasterRisk, color: '#f59e0b' },
                  { label: 'Transport', value: selected.transportRisk, color: '#3b82f6' },
                  { label: 'Financial', value: 100 - selected.financialStability, color: '#8b5cf6' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-20">{item.label}</span>
                    <div className="flex-1 risk-bar">
                      <div className="risk-bar-fill" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                    </div>
                    <span className="text-xs font-medium" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 italic">{selected.description}</p>
            </div>
          ) : (
            <div className="glass-card p-5 text-center space-y-2">
              <div className="text-3xl">🌍</div>
              <p className="text-sm text-slate-400">Click any supplier on the map to see detailed risk analysis</p>
            </div>
          )}

          {/* Stats */}
          <div className="glass-card p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Map Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Visible suppliers</span>
                <span className="text-slate-200 font-medium">{filtered.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Countries</span>
                <span className="text-slate-200 font-medium">{[...new Set(filtered.map(s => s.country))].length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">High risk nodes</span>
                <span className="text-red-400 font-semibold">{filtered.filter(s => s.riskScore >= 70).length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Active ports</span>
                <span className="text-cyan-400 font-medium">{ports.length}</span>
              </div>
            </div>
          </div>

          {/* Port Status */}
          <div className="glass-card p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Port Status</h4>
            {ports.map(port => (
              <div key={port.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  port.congestionLevel === 'HIGH' ? 'bg-red-400' :
                  port.congestionLevel === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                }`}></div>
                <span className="text-xs text-slate-300 truncate flex-1">{port.name.replace('Port of ', '')}</span>
                <span className={`text-xs font-medium ${
                  port.congestionLevel === 'HIGH' ? 'text-red-400' :
                  port.congestionLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                }`}>{port.congestionLevel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
