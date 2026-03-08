import { useEffect, useRef } from 'react'

// Key logistics hub coordinates mapped to SVG viewBox (0 0 1000 500)
const HUBS = [
  { id: 'shanghai',   x: 760, y: 195, label: 'Shanghai' },
  { id: 'singapore',  x: 720, y: 270, label: 'Singapore' },
  { id: 'rotterdam',  x: 470, y: 155, label: 'Rotterdam' },
  { id: 'dubai',      x: 600, y: 220, label: 'Dubai' },
  { id: 'la',         x: 115, y: 205, label: 'Los Angeles' },
  { id: 'newyork',    x: 210, y: 185, label: 'New York' },
  { id: 'mumbai',     x: 635, y: 245, label: 'Mumbai' },
  { id: 'sydney',     x: 820, y: 360, label: 'Sydney' },
  { id: 'capetown',   x: 490, y: 360, label: 'Cape Town' },
  { id: 'saopaulo',   x: 275, y: 330, label: 'São Paulo' },
  { id: 'tokyo',      x: 805, y: 185, label: 'Tokyo' },
  { id: 'hamburg',    x: 475, y: 148, label: 'Hamburg' },
]

const ROUTES = [
  ['shanghai', 'rotterdam'],
  ['shanghai', 'la'],
  ['shanghai', 'singapore'],
  ['shanghai', 'tokyo'],
  ['singapore', 'dubai'],
  ['singapore', 'rotterdam'],
  ['dubai', 'rotterdam'],
  ['dubai', 'mumbai'],
  ['rotterdam', 'newyork'],
  ['la', 'newyork'],
  ['la', 'saopaulo'],
  ['newyork', 'capetown'],
  ['saopaulo', 'capetown'],
  ['sydney', 'singapore'],
  ['tokyo', 'la'],
]

const RISK_ARCS = [
  { from: 'shanghai', to: 'la', risk: 'high' },
  { from: 'dubai', to: 'rotterdam', risk: 'medium' },
  { from: 'singapore', to: 'rotterdam', risk: 'medium' },
]

function getHub(id) {
  return HUBS.find(h => h.id === id)
}

function cubicBezierMid(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2
  const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.18
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`
}

const riskColor = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
}

export default function WorldMapBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1628] to-[#050d1a]" />

      {/* Radial glow at center */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(59,130,246,0.07) 0%, transparent 70%)'
      }} />

      <svg
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Route gradient */}
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Animated dash for route travel */}
          <style>{`
            @keyframes routeTravel {
              from { stroke-dashoffset: 600; }
              to   { stroke-dashoffset: 0; }
            }
            @keyframes routeTravelSlow {
              from { stroke-dashoffset: 900; }
              to   { stroke-dashoffset: 0; }
            }
            @keyframes hubPulse {
              0%, 100% { r: 3; opacity: 0.9; }
              50%       { r: 5; opacity: 1; }
            }
            @keyframes ringExpand {
              0%   { r: 5;  opacity: 0.7; }
              100% { r: 18; opacity: 0; }
            }
            @keyframes particleFloat {
              0%   { cy: 480; opacity: 0; }
              10%  { opacity: 0.6; }
              90%  { opacity: 0.6; }
              100% { cy: 20; opacity: 0; }
            }
            @keyframes shipTravel {
              0%   { offset-distance: 0%; opacity: 0; }
              5%   { opacity: 1; }
              95%  { opacity: 1; }
              100% { offset-distance: 100%; opacity: 0; }
            }
          `}</style>
        </defs>

        {/* Grid dots - subtle background texture */}
        {Array.from({ length: 20 }, (_, row) =>
          Array.from({ length: 40 }, (_, col) => (
            <circle
              key={`dot-${row}-${col}`}
              cx={col * 26 + 3}
              cy={row * 26 + 3}
              r="0.6"
              fill="rgba(148,163,184,0.12)"
            />
          ))
        )}

        {/* Normal routes */}
        {ROUTES.map(([fromId, toId], i) => {
          const from = getHub(fromId)
          const to = getHub(toId)
          if (!from || !to) return null
          const d = cubicBezierMid(from.x, from.y, to.x, to.y)
          const delay = (i * 0.4) % 6
          return (
            <g key={`route-${fromId}-${toId}`}>
              {/* Base dim line */}
              <path d={d} fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="0.8" />
              {/* Animated traveling dash */}
              <path
                d={d}
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="1.2"
                strokeDasharray="40 600"
                strokeDashoffset="600"
                style={{
                  animation: `routeTravel ${5 + (i % 3)}s linear ${delay}s infinite`,
                }}
                filter="url(#glow)"
              />
            </g>
          )
        })}

        {/* Risk-highlighted routes */}
        {RISK_ARCS.map(({ from: fromId, to: toId, risk }, i) => {
          const from = getHub(fromId)
          const to = getHub(toId)
          if (!from || !to) return null
          const d = cubicBezierMid(from.x, from.y, to.x, to.y)
          const color = riskColor[risk]
          return (
            <g key={`risk-${fromId}-${toId}`}>
              <path d={d} fill="none" stroke={color} strokeWidth="0.6" strokeOpacity="0.3" />
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeDasharray="20 900"
                strokeDashoffset="900"
                strokeOpacity="0.85"
                filter="url(#strongGlow)"
                style={{
                  animation: `routeTravelSlow ${7 + i}s linear ${i * 1.5}s infinite`,
                }}
              />
            </g>
          )
        })}

        {/* Hub nodes with pulse rings */}
        {HUBS.map((hub, i) => (
          <g key={hub.id}>
            {/* Expanding ring */}
            <circle
              cx={hub.x} cy={hub.y} r="5"
              fill="none"
              stroke="rgba(59,130,246,0.6)"
              strokeWidth="1"
              style={{
                animation: `ringExpand 3s ease-out ${(i * 0.4) % 3}s infinite`,
                transformOrigin: `${hub.x}px ${hub.y}px`,
              }}
            />
            {/* Core dot */}
            <circle
              cx={hub.x} cy={hub.y} r="3"
              fill="#3b82f6"
              filter="url(#glow)"
              style={{
                animation: `hubPulse 2.5s ease-in-out ${(i * 0.3) % 2}s infinite`,
                transformOrigin: `${hub.x}px ${hub.y}px`,
              }}
            />
          </g>
        ))}

        {/* Floating particles */}
        {[120, 250, 400, 550, 700, 850].map((x, i) => (
          <circle
            key={`particle-${i}`}
            cx={x}
            cy="480"
            r="1.5"
            fill="rgba(96,165,250,0.6)"
            style={{
              animation: `particleFloat ${8 + i * 1.5}s linear ${i * 2}s infinite`,
            }}
          />
        ))}
      </svg>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,13,26,0.6) 100%)'
      }} />
    </div>
  )
}
