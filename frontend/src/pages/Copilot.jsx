import { useState, useRef, useEffect } from 'react'
import { copilotResponses, suppliers, industries, alerts } from '../data/dummyData'
import { queryCopilot, queryCopilotStream } from '../lib/api'

const CHAT_STORAGE_KEY = 'resilio_copilot_chats_v1'
const ACTIVE_CHAT_STORAGE_KEY = 'resilio_copilot_active_chat_v1'
const COPILOT_STARTER_TEXT = 'Start The Conversation'

function isLegacyStarterMessage(text) {
  if (typeof text !== 'string') return false
  const normalized = text.trim().toLowerCase()
  return (
    normalized === 'start the converstaion' ||
    normalized === 'start the conversation' ||
    normalized.includes('supply chain copilot ready')
  )
}

function createInitialMessage() {
  return {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role: 'ai',
    content: COPILOT_STARTER_TEXT,
    timestamp: new Date().toISOString(),
  }
}

function createConversation(title = 'New Chat') {
  const now = new Date().toISOString()
  return {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    createdAt: now,
    updatedAt: now,
    messages: [createInitialMessage()],
  }
}

function hydrateConversations(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(item => item && item.id && Array.isArray(item.messages))
    .map(item => ({
      ...item,
      title: item.title || 'New Chat',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      messages: item.messages.map((msg, index) => {
        const normalizedContent = index === 0 && msg?.role === 'ai' && isLegacyStarterMessage(msg?.content)
          ? COPILOT_STARTER_TEXT
          : msg?.content

        return {
          ...msg,
          content: normalizedContent,
          timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date().toISOString(),
        }
      }),
    }))
}

function buildChatTitle(query) {
  const clean = query.trim().replace(/\s+/g, ' ')
  if (!clean) return 'New Chat'
  return clean.length > 42 ? `${clean.slice(0, 42)}...` : clean
}

function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const SUGGESTED_QUESTIONS = [
  'Which suppliers are highest risk right now?',
  'Analyze pharmaceutical supply chain risks',
  'What could disrupt semiconductor supply?',
  'Which industries need immediate attention?',
  'Find hidden dependencies in automotive sector',
  'What is the risk level for energy supply?',
]

const SECTION_HEADING_RE = /^\*{0,2}(Summary|Key Insights|Recommendations)\s*[—\-]\*{0,2}\s*$/i

function formatMessage(text) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const trimmed = line.trim()
    // Bold section headings: **Summary —** or plain Summary —
    if (SECTION_HEADING_RE.test(trimmed)) {
      const label = trimmed.replace(/\*\*/g, '').trim()
      return <div key={i} className="font-bold text-white text-sm mt-4 mb-2">{label}</div>
    }
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return <div key={i} className="font-bold text-white text-sm mt-3 mb-1">{trimmed.replace(/\*\*/g, '')}</div>
    }
    if (line.startsWith('• ')) {
      return <div key={i} className="flex items-start gap-2 text-slate-300 my-1"><span className="text-blue-400 mt-0.5">•</span><span>{line.slice(2)}</span></div>
    }
    if (/^-\s/.test(line)) {
      return <div key={i} className="flex items-start gap-2 text-slate-300 my-1"><span className="text-blue-400 mt-0.5">•</span><span>{line.slice(2)}</span></div>
    }
    if (line.startsWith('🔴') || line.startsWith('🟡') || line.startsWith('🟢') || line.startsWith('⚠') || /^\d+\./.test(line)) {
      return <div key={i} className="my-1 text-slate-300">{line}</div>
    }
    if (line === '') return <div key={i} className="h-2"></div>
    return <div key={i} className="text-slate-300 leading-relaxed">{line}</div>
  })
}

export default function Copilot() {
  const [conversations, setConversations] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]')
      const hydrated = hydrateConversations(parsed)
      if (hydrated.length) return hydrated
    } catch {
      // ignore parse errors and fallback to default chat
    }
    return [createConversation('New Chat')]
  })
  const [activeConversationId, setActiveConversationId] = useState(() => localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY) || null)
  const [input, setInput] = useState('')
  const [loadingConversationId, setLoadingConversationId] = useState(null)
  const messagesEndRef = useRef(null)

  const orderedConversations = [...conversations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  const activeConversation = conversations.find(c => c.id === activeConversationId) || orderedConversations[0] || null
  const messages = activeConversation?.messages || []
  const loading = activeConversation ? loadingConversationId === activeConversation.id : false

  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      setActiveConversationId(conversations[0].id)
    }
  }, [activeConversation, conversations])

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, activeConversationId)
    }
  }, [activeConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const upsertMessage = (conversationId, messageId, content) => {
    setConversations(prev => prev.map(chat => {
      if (chat.id !== conversationId) return chat
      const exists = chat.messages.some(m => m.id === messageId)
      const nextMessages = exists
        ? chat.messages.map(m => (m.id === messageId ? { ...m, content } : m))
        : [...chat.messages, { id: messageId, role: 'ai', content, timestamp: new Date().toISOString() }]

      return {
        ...chat,
        messages: nextMessages,
        updatedAt: new Date().toISOString(),
      }
    }))
  }

  const startNewChat = () => {
    const next = createConversation('New Chat')
    setConversations(prev => [next, ...prev])
    setActiveConversationId(next.id)
    setInput('')
  }

  const deleteChat = (conversationId) => {
    setConversations(prev => {
      const remaining = prev.filter(chat => chat.id !== conversationId)
      if (remaining.length === 0) {
        const replacement = createConversation('New Chat')
        setActiveConversationId(replacement.id)
        return [replacement]
      }
      if (conversationId === activeConversationId) {
        setActiveConversationId(remaining[0].id)
      }
      return remaining
    })
  }

  const clearActiveConversation = () => {
    if (!activeConversation) return
    setConversations(prev => prev.map(chat => {
      if (chat.id !== activeConversation.id) return chat
      return {
        ...chat,
        messages: [createInitialMessage()],
        updatedAt: new Date().toISOString(),
      }
    }))
  }

  const send = async (query) => {
    if (!query.trim() || loadingConversationId || !activeConversation) return

    const conversationId = activeConversation.id
    const userMsg = {
      id: `m_${Date.now()}_u`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    }
    const aiMsgId = `m_${Date.now()}_a`

    setConversations(prev => prev.map(chat => {
      if (chat.id !== conversationId) return chat
      const shouldRetitle = chat.title === 'New Chat' || chat.messages.length <= 1
      return {
        ...chat,
        title: shouldRetitle ? buildChatTitle(query) : chat.title,
        messages: [...chat.messages, userMsg],
        updatedAt: new Date().toISOString(),
      }
    }))

    setInput('')
    setLoadingConversationId(conversationId)

    let streamedContent = ''
    try {
      upsertMessage(conversationId, aiMsgId, '')
      await queryCopilotStream(query, undefined, {
        onToken: (token) => {
          streamedContent += token
          upsertMessage(conversationId, aiMsgId, streamedContent)
        },
      })

      if (!streamedContent.trim()) {
        const apiRes = await queryCopilot(query)
        let response
        if (apiRes?.response_text) {
          response = apiRes.response_text
        } else {
          const r = apiRes.response
          let text = `**${r.topic}**\n\n${r.summary}\n\n`
          if (r.key_risks?.length) {
            text += `**Key Risks:**\n`
            r.key_risks.forEach(k => { text += `• ${k}\n` })
          }
          if (r.recommendations?.length) {
            text += `\n**Recommended Actions:**\n`
            r.recommendations.forEach((rec, i) => { text += `${i + 1}. ${rec}\n` })
          }
          if (r.disruption_probability) text += `\n**Predicted Disruption Probability: ${r.disruption_probability}%**`
          response = text.trim()
        }
        upsertMessage(conversationId, aiMsgId, response)
      }
    } catch {
      try {
        const apiRes = await queryCopilot(query)
        const response = apiRes?.response_text || 'I could not generate a response right now. Please try again.'
        upsertMessage(conversationId, aiMsgId, response)
      } catch {
        upsertMessage(
          conversationId,
          aiMsgId,
          'I’m having trouble reaching the AI service right now. Please check that the backend is running and try again.'
        )
      }
    }

    setLoadingConversationId(null)
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
          <p className="text-xs text-slate-400">{activeConversation?.title || 'AI-powered supply chain intelligence'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={startNewChat} className="btn-secondary text-xs px-3 py-1.5">+ New Chat</button>
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
                    {formatTime(msg.timestamp)}
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
        <div className="w-72 space-y-3 flex-shrink-0">
          {/* Chats */}
          <div className="glass-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chats</h4>
              <button onClick={startNewChat} className="text-xs text-blue-400 hover:text-blue-300">New</button>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {orderedConversations.map(chat => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all ${
                    activeConversation?.id === chat.id
                      ? 'bg-slate-700/50 border-slate-600'
                      : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/30'
                  }`}
                >
                  <button
                    onClick={() => setActiveConversationId(chat.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="text-xs text-slate-200 truncate">{chat.title}</div>
                    <div className="text-[11px] text-slate-500">{formatTime(chat.updatedAt)}</div>
                  </button>
                  <button
                    onClick={() => deleteChat(chat.id)}
                    className="text-slate-500 hover:text-red-400 text-xs opacity-80 group-hover:opacity-100"
                    title="Delete chat"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

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
            onClick={clearActiveConversation}
            className="w-full btn-secondary justify-center text-xs"
          >
            Clear Conversation
          </button>
        </div>
      </div>
    </div>
  )
}
