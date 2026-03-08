import { useState, useRef, useEffect } from 'react'
import { copilotResponses, suppliers, industries, alerts } from '../data/dummyData'

const INITIAL_MESSAGE = {
  id: 0,
  role: 'ai',
  content: copilotResponses.default.response,
  timestamp: new Date(),
}

const SUGGESTED_QUESTIONS = [
  'Which suppliers are highest risk right now?',
  'Analyze pharmaceutical supply chain risks',
  'What could disrupt semiconductor supply?',
  'Which industries need immediate attention?',
  'Find hidden dependencies in automotive sector',
  'What is the risk level for energy supply?',
]

function formatMessage(text) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <div key={i} className="font-bold text-slate-200 mt-2 mb-1">{line.replace(/\*\*/g, '')}</div>
    }
    if (line.startsWith('• ')) {
      return <div key={i} className="flex items-start gap-2 text-slate-300 my-0.5"><span className="text-blue-400 mt-0.5">•</span><span>{line.slice(2)}</span></div>
    }
    if (line.startsWith('🔴') || line.startsWith('🟡') || line.startsWith('🟢') || line.startsWith('⚠') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
      return <div key={i} className="my-0.5 text-slate-300">{line}</div>
    }
    if (line === '') return <div key={i} className="h-1"></div>
    return <div key={i} className="text-slate-300">{line}</div>
  })
}

function getAIResponse(query) {
  const q = query.toLowerCase()

  if (q.includes('semiconductor') || q.includes('chip') || q.includes('tsmc') || q.includes('taiwan')) {
    return copilotResponses.semiconductor.response
  }
  if (q.includes('pharma') || q.includes('medicine') || q.includes('drug') || q.includes('api')) {
    return copilotResponses.pharma.response
  }
  if (q.includes('risk') || q.includes('highest') || q.includes('dangerous')) {
    return copilotResponses.risk.response
  }
  if (q.includes('energy') || q.includes('oil') || q.includes('gas') || q.includes('cobalt')) {
    return `**Energy Supply Chain Analysis:**\n\n🔴 **Critical Risk Detected**\n\n• **Gazprom Pipeline** (Russia) — Risk Score: 92/100. Active sanctions and conflict create extreme gas supply risk for Europe.\n\n• **Cobalt Congo** (DRC) — Risk Score: 95/100. 70% of global cobalt supply from politically unstable region. Critical for EV batteries.\n\n• **Saudi Aramco** (Saudi Arabia) — Risk Score: 58/100. Geopolitical tension in Middle East creates oil supply variability.\n\n**Recommended Actions:**\n1. Accelerate renewable energy transition\n2. Diversify cobalt sourcing to Zambia and battery recycling\n3. Build 6-month strategic petroleum reserve\n\n**Predicted Disruption Risk Next 4 Weeks: 82%**`
  }
  if (q.includes('automotive') || q.includes('car') || q.includes('vehicle') || q.includes('battery')) {
    return `**Automotive Supply Chain Analysis:**\n\n🟡 **Elevated Risk Detected**\n\n• **CATL Battery** (China) — Risk Score: 68/100. EV battery production concentrated in China. Geopolitical risk elevated.\n\n• **Lithium Americas** (Argentina) — Risk Score: 75/100. Critical lithium supply with water scarcity and political risk.\n\n• **Toyota Supply Hub** (Japan) — Risk Score: 32/100 — Strong diversification, low risk.\n\n**Supply Chain Depth:** OEM → Battery System (China) → Lithium Mining (Argentina/DRC)\n\n**Recommended Actions:**\n1. Invest in North American lithium projects\n2. Develop battery recycling programs\n3. Dual-source battery cells between CATL and Korean suppliers\n\n**Predicted Disruption Risk Next 4 Weeks: 55%**`
  }
  if (q.includes('food') || q.includes('agriculture') || q.includes('wheat') || q.includes('grain')) {
    return `**Food & Agriculture Supply Chain Analysis:**\n\n🔴 **Critical Risk Detected**\n\n• **Ukraine Wheat** — Risk Score: 88/100. Active conflict zone. Ukraine exports 10% of global wheat. Black Sea corridor disruptions ongoing.\n\n• **Cargill Grain** (USA) — Risk Score: 25/100 — Stable, but climate exposure increasing.\n\n**Current Situation:**\n- Global wheat prices elevated 40% from pre-conflict baseline\n- 2.3M tonnes delayed in Black Sea ports\n- El Niño pattern threatens 2024-25 grain harvests\n\n**Recommended Actions:**\n1. Diversify grain sourcing to Canada, Australia, Argentina\n2. Build 90-day food commodity reserves\n3. Monitor Black Sea shipping corridor daily\n\n**Predicted Disruption Risk Next 4 Weeks: 70%**`
  }
  if (q.includes('alert') || q.includes('urgent') || q.includes('emergency')) {
    const active = alerts.filter(a => a.status === 'active')
    return `**Active Alert Summary (${active.length} Active):**\n\n${active.map(a => `🔴 **${a.type}** - ${a.title}\n   ${a.supplier} · ${a.probability}% probability · ${a.affectedVolume} exposure`).join('\n\n')}\n\n**Highest Priority:** ${active[0]?.title}\n\n**Immediate Action Required for:** ${active.filter(a => a.type === 'CRITICAL').length} critical alerts`
  }

  return `**Analysis Complete**\n\nI analyzed your query: "${query}"\n\nHere's what I found based on your supply chain data:\n\n• **${suppliers.filter(s => s.riskScore >= 70).length} high-risk suppliers** currently need monitoring\n• **Global risk level:** ELEVATED (70/100)\n• **Most urgent concern:** Taiwan geopolitical risk affecting semiconductor supply\n\nTry asking about specific industries:\n• "Analyze semiconductor supply risks"\n• "What are the food supply chain risks?"\n• "Show me the highest risk suppliers"\n• "What alerts need immediate attention?"`
}

export default function Copilot() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (query) => {
    if (!query.trim() || loading) return
    const userMsg = { id: Date.now(), role: 'user', content: query, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))

    const response = getAIResponse(query)
    const aiMsg = { id: Date.now() + 1, role: 'ai', content: response, timestamp: new Date() }
    setMessages(prev => [...prev, aiMsg])
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="h-full flex flex-col gap-4" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
          ✦
        </div>
        <div>
          <h2 className="font-bold text-white">Supply Chain Copilot</h2>
          <p className="text-xs text-slate-400">AI-powered supply chain intelligence — Ask anything about your global supply network</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs text-slate-500">Online</span>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-bold ${
                  msg.role === 'ai'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    : 'bg-slate-600 text-slate-200'
                }`}>
                  {msg.role === 'ai' ? '✦' : 'U'}
                </div>

                {/* Bubble */}
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <div className="leading-relaxed text-sm">
                    {msg.role === 'ai' ? formatMessage(msg.content) : msg.content}
                  </div>
                  <div className="text-xs opacity-50 mt-1.5">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">✦</div>
                <div className="chat-bubble-ai flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-slate-500">Analyzing supply chain data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Supply Chain Copilot anything... (Enter to send)"
                rows={2}
                className="input-field flex-1 resize-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="btn-primary px-5 self-end disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-3 flex-shrink-0">
          {/* Suggested Questions */}
          <div className="glass-card p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested Questions</h4>
            <div className="space-y-1.5">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="w-full text-left text-xs text-slate-400 hover:text-blue-400 hover:bg-slate-700/40 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-slate-700/50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Data Context */}
          <div className="glass-card p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Context</h4>
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'Suppliers loaded', value: suppliers.length.toString(), color: 'text-blue-400' },
                { label: 'Industries tracked', value: industries.length.toString(), color: 'text-blue-400' },
                { label: 'Active alerts', value: alerts.filter(a => a.status === 'active').length.toString(), color: 'text-red-400' },
                { label: 'High risk suppliers', value: suppliers.filter(s => s.riskScore >= 70).length.toString(), color: 'text-red-400' },
                { label: 'Model accuracy', value: '91%', color: 'text-emerald-400' },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clear chat */}
          <button
            onClick={() => setMessages([INITIAL_MESSAGE])}
            className="w-full btn-secondary justify-center text-xs"
          >
            Clear Conversation
          </button>
        </div>
      </div>
    </div>
  )
}
