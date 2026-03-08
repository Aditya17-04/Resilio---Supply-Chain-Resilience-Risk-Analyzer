import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { suppliers, supplyChainLinks, getRiskColor, getRiskLevel } from '../data/dummyData'

export default function SupplierGraph() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const filteredSuppliers = filter === 'all' ? suppliers : suppliers.filter(s => s.industry.toLowerCase() === filter.toLowerCase())
  const filteredIds = new Set(filteredSuppliers.map(s => s.id))
  const filteredLinks = supplyChainLinks.filter(l => filteredIds.has(l.source) && filteredIds.has(l.target))

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = 480

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Define arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#475569')

    // Background grid
    const defs = svg.select('defs')
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 30)
      .attr('height', 30)
      .attr('patternUnits', 'userSpaceOnUse')

    pattern.append('path')
      .attr('d', 'M 30 0 L 0 0 0 30')
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1)

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#grid)')
      .attr('rx', 12)

    const nodes = filteredSuppliers.map(s => ({ ...s }))
    const links = filteredLinks.map(l => ({
      source: l.source,
      target: l.target,
      strength: l.strength
    }))

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120).strength(d => d.strength * 0.5))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    const zoomG = svg.append('g')

    svg.call(d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        zoomG.attr('transform', event.transform)
      })
    )

    // Links
    const link = zoomG.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', d => {
        const strength = d.strength
        if (strength >= 0.9) return '#ef4444'
        if (strength >= 0.7) return '#f59e0b'
        return '#475569'
      })
      .attr('stroke-width', d => d.strength * 2.5)
      .attr('stroke-opacity', 0.5)
      .attr('marker-end', 'url(#arrow)')

    // Node groups
    const node = zoomG.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x; d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        setSelected(d)
      })

    // Outer glow ring for high-risk
    node.filter(d => d.riskScore >= 70)
      .append('circle')
      .attr('r', 18)
      .attr('fill', 'none')
      .attr('stroke', d => getRiskColor(d.riskScore))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.3)

    // Main circle
    node.append('circle')
      .attr('r', 12)
      .attr('fill', d => getRiskColor(d.riskScore))
      .attr('fill-opacity', 0.85)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)

    // Tier label inside
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text(d => `T${d.tier}`)

    // Name label below
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 24)
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .attr('fill', '#cbd5e1')
      .text(d => d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name)

    // Risk score above
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -18)
      .attr('font-size', '8px')
      .attr('fill', d => getRiskColor(d.riskScore))
      .attr('font-weight', 'bold')
      .text(d => d.riskScore)

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    svg.on('click', () => setSelected(null))

    return () => simulation.stop()
  }, [filter, filteredSuppliers, filteredLinks])

  const industries = ['all', ...new Set(suppliers.map(s => s.industry))]

  // Count dependencies
  const getDependencyCount = (id) => {
    const asSource = supplyChainLinks.filter(l => l.source === id).length
    const asTarget = supplyChainLinks.filter(l => l.target === id).length
    return { upstream: asSource, downstream: asTarget }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
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
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-red-500"></div>Strong dependency</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-amber-500"></div>Medium</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-slate-500"></div>Weak</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Graph */}
        <div ref={containerRef} className="col-span-2 glass-card overflow-hidden" style={{ height: '520px' }}>
          <svg ref={svgRef} className="w-full"></svg>
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          {selected ? (
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{selected.name}</h3>
                  <p className="text-xs text-slate-400">{selected.country} · {selected.industry}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg">×</button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: getRiskColor(selected.riskScore) }}>
                  {selected.riskScore}
                </div>
                <div>
                  <div className={`text-sm font-bold ${selected.riskScore >= 70 ? 'text-red-400' : selected.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {getRiskLevel(selected.riskScore)} RISK
                  </div>
                  <div className="text-xs text-slate-500">Tier {selected.tier} Supplier</div>
                </div>
              </div>

              {(() => {
                const deps = getDependencyCount(selected.id)
                return (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-400">{deps.upstream}</div>
                      <div className="text-xs text-slate-500">Downstream deps</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-purple-400">{deps.downstream}</div>
                      <div className="text-xs text-slate-500">Upstream deps</div>
                    </div>
                  </div>
                )
              })()}

              <div className="space-y-2">
                {[
                  { label: 'Geopolitical', value: selected.geopoliticalRisk },
                  { label: 'Disaster Risk', value: selected.disasterRisk },
                  { label: 'Transport', value: selected.transportRisk },
                  { label: 'Concentration', value: selected.concentration === 'Critical' ? 95 : selected.concentration === 'High' ? 70 : 30 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium" style={{ color: getRiskColor(item.value) }}>{item.value}</span>
                    </div>
                    <div className="risk-bar">
                      <div className="risk-bar-fill" style={{ width: `${item.value}%`, backgroundColor: getRiskColor(item.value) }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 text-center space-y-2">
              <div className="text-3xl">⬡</div>
              <p className="text-xs text-slate-400">Click any node to view supplier dependencies and risk breakdown</p>
              <p className="text-xs text-slate-600">Drag nodes to rearrange the graph</p>
            </div>
          )}

          {/* Legend */}
          <div className="glass-card p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Node Legend</h4>
            {[
              { label: 'Tier 1 Supplier (T1)', desc: 'Direct supplier', color: 'text-slate-200' },
              { label: 'Tier 2 Supplier (T2)', desc: 'Sub-supplier', color: 'text-slate-400' },
              { label: 'Tier 3 Supplier (T3)', desc: 'Raw material / mining', color: 'text-slate-500' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs text-white font-bold mt-0.5 flex-shrink-0">T</div>
                <div>
                  <div className={`text-xs font-medium ${item.color}`}>{item.label}</div>
                  <div className="text-xs text-slate-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="glass-card p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Graph Stats</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total nodes</span>
                <span className="text-slate-200 font-medium">{filteredSuppliers.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Edges / dependencies</span>
                <span className="text-slate-200 font-medium">{filteredLinks.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Critical connections</span>
                <span className="text-red-400 font-medium">{filteredLinks.filter(l => l.strength >= 0.9).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
