import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, LayerGroup } from 'react-leaflet'
import { heatmapRegions } from '../data/dummyData'

const getHeatColor = (intensity) => {
  if (intensity >= 0.8) return '#ef4444'
  if (intensity >= 0.6) return '#f97316'
  if (intensity >= 0.4) return '#f59e0b'
  if (intensity >= 0.25) return '#84cc16'
  return '#10b981'
}

const getRiskLabel = (intensity) => {
  if (intensity >= 0.8) return 'CRITICAL'
  if (intensity >= 0.6) return 'HIGH'
  if (intensity >= 0.4) return 'MEDIUM'
  if (intensity >= 0.25) return 'LOW'
  return 'MINIMAL'
}

export default function RiskHeatmap() {
  const [selected, setSelected] = useState(null)
  const [overlayType, setOverlayType] = useState('overall')

  const sortedRegions = [...heatmapRegions].sort((a, b) => b.intensity - a.intensity)

  const overlayModifiers = {
    overall: r => r.intensity,
    geopolitical: r => Math.min(1, r.intensity * 1.2),
    climate: r => Math.min(1, r.intensity * 0.8 + 0.1),
    economic: r => Math.min(1, r.intensity * 0.9),
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700/50">
          {[
            { key: 'overall', label: 'Overall Risk' },
            { key: 'geopolitical', label: 'Geopolitical' },
            { key: 'climate', label: 'Climate' },
            { key: 'economic', label: 'Economic' },
          ].map(t => (
            <button key={t.key} onClick={() => setOverlayType(t.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${overlayType === t.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >{t.label}</button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Minimal</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-lime-400"></div>Low</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Medium</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div>High</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div>Critical</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Heatmap */}
        <div className="col-span-2 glass-card overflow-hidden" style={{ height: '520px' }}>
          <MapContainer
            center={[20, 10]}
            zoom={2}
            style={{ width: '100%', height: '100%' }}
            minZoom={1}
            maxZoom={6}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
              attribution=''
              pane="shadowPane"
            />

            <LayerGroup>
              {heatmapRegions.map((region, i) => {
                const intensity = overlayModifiers[overlayType](region)
                const radius = 80 + intensity * 120
                const color = getHeatColor(intensity)
                const isSelected = selected?.name === region.name
                return (
                  <CircleMarker
                    key={region.name}
                    center={[region.lat, region.lng]}
                    radius={radius / 8}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.25 + intensity * 0.35,
                      weight: isSelected ? 2 : 1,
                      opacity: isSelected ? 1 : 0.7,
                    }}
                    eventHandlers={{ click: (e) => { e.originalEvent.stopPropagation(); setSelected(isSelected ? null : region) } }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      <div className="text-xs">
                        <div className="font-bold">{region.name}</div>
                        <div>Risk: {getRiskLabel(intensity)} ({Math.round(intensity * 100)})</div>
                        <div className="text-slate-300 mt-0.5">{region.reason}</div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                )
              })}
            </LayerGroup>

          </MapContainer>
        </div>

        {/* Region Ranking Panel */}
        <div className="space-y-3">
          {selected ? (
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-white">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg">×</button>
              </div>
              <div className="text-center py-3">
                <div className="text-5xl font-black" style={{ color: getHeatColor(selected.intensity) }}>
                  {Math.round(selected.intensity * 100)}
                </div>
                <div className="text-sm font-bold mt-1" style={{ color: getHeatColor(selected.intensity) }}>
                  {getRiskLabel(selected.intensity)} RISK
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Overall Risk', value: selected.intensity },
                  { label: 'Geopolitical', value: Math.min(1, selected.intensity * 1.2) },
                  { label: 'Climate', value: Math.min(1, selected.intensity * 0.8 + 0.1) },
                  { label: 'Economic', value: Math.min(1, selected.intensity * 0.9) },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium" style={{ color: getHeatColor(item.value) }}>
                        {Math.round(item.value * 100)}
                      </span>
                    </div>
                    <div className="risk-bar">
                      <div className="risk-bar-fill" style={{ width: `${item.value * 100}%`, backgroundColor: getHeatColor(item.value) }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-xs text-slate-400 font-medium mb-1">Key Risk Factors:</div>
                <p className="text-xs text-slate-300 leading-relaxed">{selected.reason}</p>
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 text-center space-y-2">
              <div className="text-3xl">🌡</div>
              <p className="text-xs text-slate-400">Click any region on the map to see detailed risk breakdown</p>
            </div>
          )}

          {/* Risk Ranking */}
          <div className="glass-card p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Ranking</h4>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {sortedRegions.map((region, i) => {
                const intensity = overlayModifiers[overlayType](region)
                return (
                  <div
                    key={region.name}
                    onClick={() => setSelected(region)}
                    className={`flex items-center gap-2 cursor-pointer hover:bg-slate-700/30 rounded p-1.5 transition-all ${selected?.name === region.name ? 'bg-slate-700/40' : ''}`}
                  >
                    <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getHeatColor(intensity) }}></div>
                    <span className="text-xs text-slate-300 flex-1 truncate">{region.name}</span>
                    <span className="text-xs font-bold" style={{ color: getHeatColor(intensity) }}>
                      {Math.round(intensity * 100)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factor Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Natural Disasters', count: heatmapRegions.filter(r => r.intensity >= 0.5).length, icon: '🌊', color: 'text-blue-400' },
          { label: 'Active Conflicts', count: heatmapRegions.filter(r => r.intensity >= 0.8).length, icon: '⚔️', color: 'text-red-400' },
          { label: 'Economic Instability', count: heatmapRegions.filter(r => r.intensity >= 0.6 && r.intensity < 0.8).length, icon: '📉', color: 'text-amber-400' },
          { label: 'Trade Restrictions', count: heatmapRegions.filter(r => r.intensity >= 0.7).length, icon: '🚫', color: 'text-orange-400' },
        ].map(item => (
          <div key={item.label} className="glass-card p-4 flex items-center gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className={`text-xl font-bold ${item.color}`}>{item.count}</div>
              <div className="text-xs text-slate-400">{item.label}</div>
              <div className="text-xs text-slate-600">active regions</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
