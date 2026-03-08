import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { graphData } from '../../data/mockData';
import RiskBadge from '../common/RiskBadge';
import { ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';

function getRiskColor(score) {
  if (score >= 70) return '#ef4444';
  if (score >= 40) return '#f59e0b';
  return '#10b981';
}

function getTierColor(tier) {
  const t = { 0: '#6366f1', 1: '#3b82f6', 2: '#06b6d4', 3: '#10b981', 4: '#f59e0b' };
  return t[tier] || '#64748b';
}

export default function SupplierGraph() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [selected, setSelected] = useState(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (containerRef.current) {
      const obs = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        setDimensions({ w: width, h: Math.max(height, 400) });
      });
      obs.observe(containerRef.current);
      return () => obs.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const { w, h } = dimensions;
    const nodes = graphData.nodes.map(n => ({ ...n }));
    const links = graphData.links.map(l => ({ ...l }));

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h);

    // Gradient defs
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#1e3050');

    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);

    // Background
    svg.insert('rect', ':first-child')
      .attr('width', w)
      .attr('height', h)
      .attr('fill', 'transparent');

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        const src = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
        return src?.tier === 0 ? 140 : 100;
      }).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide().radius(40))
      .force('y', d3.forceY(d => (d.tier / 4) * h * 0.7 + h * 0.15).strength(0.35));

    // Links
    const link = g.append('g').selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#1e3050')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)')
      .attr('opacity', 0.7);

    // Nodes
    const node = g.append('g').selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'supplier-node')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('mouseenter', (event, d) => setTooltip({ x: event.clientX, y: event.clientY, data: d }))
      .on('mousemove', (event) => setTooltip(t => t ? { ...t, x: event.clientX, y: event.clientY } : null))
      .on('mouseleave', () => setTooltip(null))
      .on('click', (e, d) => { e.stopPropagation(); setSelected(d); });

    // Outer ring (Risk color)
    node.append('circle')
      .attr('r', d => d.tier === 0 ? 26 : d.tier === 1 ? 22 : d.tier <= 2 ? 18 : 14)
      .attr('fill', d => `${getRiskColor(d.riskScore)}20`)
      .attr('stroke', d => getRiskColor(d.riskScore))
      .attr('stroke-width', 1.5);

    // Inner circle (Tier color)
    node.append('circle')
      .attr('r', d => d.tier === 0 ? 18 : d.tier === 1 ? 14 : d.tier <= 2 ? 11 : 8)
      .attr('fill', d => `${getTierColor(d.tier)}40`)
      .attr('stroke', d => getTierColor(d.tier))
      .attr('stroke-width', 1);

    // Label
    node.append('text')
      .attr('dy', d => (d.tier === 0 ? 26 : d.tier === 1 ? 22 : d.tier <= 2 ? 18 : 14) + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', d => d.tier <= 1 ? 10 : 9)
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name)
      .style('pointer-events', 'none');

    // Tier badge
    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', d => getTierColor(d.tier))
      .attr('font-size', d => d.tier === 0 ? 9 : 8)
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.tier === 0 ? 'ROOT' : `T${d.tier}`)
      .style('pointer-events', 'none');

    svg.on('click', () => setSelected(null));

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [dimensions]);

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Multi-Tier Supplier Network</h2>
          <p className="text-slate-500 text-sm">Force-directed dependency graph — drag nodes to explore</p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {[[0,'Root','#6366f1'],[1,'Tier 1','#3b82f6'],[2,'Tier 2','#06b6d4'],[3,'Tier 3','#10b981'],[4,'Tier 4','#f59e0b']].map(([t,l,c]) => (
            <div key={t} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: c, background: `${c}20` }} />
              <span className="text-slate-500 text-xs">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Graph */}
        <div ref={containerRef} className="flex-1 bg-[#0d1526] border border-[#1e3050] rounded-xl overflow-hidden relative" style={{ minHeight: 500 }}>
          <svg ref={svgRef} className="w-full h-full" />
          <div className="absolute bottom-3 right-3 text-slate-600 text-xs flex items-center gap-1">
            <Info className="w-3 h-3" />
            Scroll to zoom · Drag to pan · Click node for details
          </div>
        </div>

        {/* Selected panel */}
        {selected && (
          <div className="w-64 bg-[#0d1526] border border-[#1e3050] rounded-xl p-4 space-y-3 flex-shrink-0 overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-semibold text-sm">{selected.name}</h3>
              <RiskBadge score={selected.riskScore} size="xs" />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Industry</span><span className="text-slate-300">{selected.industry}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tier</span><span className="text-slate-300">{selected.tier === 0 ? 'Root' : `Tier ${selected.tier}`}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Risk Score</span>
                <span style={{ color: selected.riskScore >= 70 ? '#ef4444' : selected.riskScore >= 40 ? '#f59e0b' : '#10b981' }}>{selected.riskScore}/100</span>
              </div>
            </div>

            {selected.riskScore > 0 && (
              <div>
                <div className="text-slate-500 text-xs mb-1.5">Risk Bar</div>
                <div className="w-full h-2 bg-[#1e3050] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${selected.riskScore}%`,
                      background: selected.riskScore >= 70 ? '#ef4444' : selected.riskScore >= 40 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#1e3050]">
              <div className="text-slate-500 text-xs">Dependencies</div>
              <div className="mt-1.5 space-y-1">
                {graphData.links
                  .filter(l => (typeof l.source === 'object' ? l.source.id : l.source) === selected.id ||
                               (typeof l.target === 'object' ? l.target.id : l.target) === selected.id)
                  .slice(0, 6)
                  .map((l, i) => {
                    const isSource = (typeof l.source === 'object' ? l.source.id : l.source) === selected.id;
                    const otherId = isSource ? (typeof l.target === 'object' ? l.target.id : l.target) : (typeof l.source === 'object' ? l.source.id : l.source);
                    const other = graphData.nodes.find(n => n.id === otherId);
                    return (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span className={isSource ? 'text-blue-400' : 'text-slate-600'}>→</span>
                        <span className="text-slate-400">{other?.name || otherId}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
