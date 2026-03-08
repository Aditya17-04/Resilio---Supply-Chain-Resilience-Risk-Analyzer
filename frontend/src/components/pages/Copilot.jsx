import React, { useState, useRef, useEffect } from 'react';
import { suppliers, industries, singlePointFailures, alerts, alternativeSuppliers, simulationScenarios, metrics } from '../../data/mockData';
import { Bot, Send, User, Sparkles, ChevronRight, RefreshCw, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

// ─── Copilot knowledge engine ─────────────────────────────────────────────
function generateResponse(msg) {
  const q = msg.toLowerCase();

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return { text: `Hello! I'm **Supply Chain Copilot**, your AI assistant for Resilio. I can help you analyze supply chain risks, identify vulnerabilities, recommend suppliers, and explain disruption predictions.\n\nTry asking me things like:\n- "Which suppliers are risky for semiconductor production?"\n- "What are our single points of failure?"\n- "Show me high-risk automotive suppliers"\n- "What would happen if TSMC shut down?"\n- "Recommend alternatives for critical lithium supply"` };
  }

  if (q.includes('semiconductor') && (q.includes('risk') || q.includes('risky') || q.includes('supplier'))) {
    const semSuppliers = suppliers.filter(s => s.industry === 'Semiconductors');
    const highRisk = semSuppliers.filter(s => s.riskScore >= 60);
    return {
      text: `## Semiconductor Supply Chain Risk Analysis\n\nI found **${semSuppliers.length} semiconductor suppliers** in your network:\n\n${semSuppliers.map(s => `- **${s.name}** (${s.country}) — Risk Score: **${s.riskScore}/100** ${s.riskScore >= 70 ? '🔴 HIGH' : s.riskScore >= 40 ? '🟡 MEDIUM' : '🟢 LOW'}`).join('\n')}\n\n### High-Risk Concerns:\n${highRisk.map(s => `- **${s.name}**: Geopolitical risk ${s.geopoliticalRisk}, Concentration risk ${s.concentrationRisk}`).join('\n')}\n\n### Key Insight:\nTSMC (Taiwan) is your most critical semiconductor dependency with a **72/100 risk score**. The geopolitical situation in the Taiwan Strait poses significant disruption risk. I recommend qualifying Samsung Foundry or Intel Foundry Services as backup suppliers.`,
      data: semSuppliers,
    };
  }

  if (q.includes('single point') || q.includes('spof') || q.includes('failure')) {
    const critical = singlePointFailures.filter(s => s.criticalityScore >= 90);
    return {
      text: `## Single Points of Failure Detected\n\nI've identified **${singlePointFailures.length} critical dependencies** in your supply chain:\n\n${singlePointFailures.map(s => `### ${s.product}\n- **Sole Supplier:** ${s.supplier} (${s.country})\n- **Dependency:** ${s.dependency}% — ${s.alternativesCount === 0 ? '🚨 NO BACKUP EXISTS' : `${s.alternativesCount} alternative(s)`}\n- **Estimated Annual Loss if Disrupted:** ${s.estimatedLoss}`).join('\n\n')}\n\n### Most Critical:\n${critical.map(s => `⚠️ **${s.product}** — ${s.supplier} has a criticality score of ${s.criticalityScore}/100`).join('\n')}\n\n**Recommendation:** Immediately initiate supplier diversification programs for items with zero backup suppliers.`,
    };
  }

  if ((q.includes('alternative') || q.includes('backup') || q.includes('replace')) && (q.includes('lithium') || q.includes('cobalt') || q.includes('supplier'))) {
    const lithiumGroup = alternativeSuppliers.find(g => g.forProduct.toLowerCase().includes('lithium'));
    return {
      text: `## Alternative Suppliers for Lithium Supply\n\nFor **${lithiumGroup?.forProduct}** (currently sourced from ${lithiumGroup?.forSupplier}), I recommend:\n\n${lithiumGroup?.alternatives.map((a, i) => `**${i+1}. ${a.name}** (${a.country})\n- Match Score: ${a.matchScore}% | Risk: ${a.riskScore}/100 | Delivery: ${a.deliveryWeeks} weeks\n- Reliability: ${a.reliability}% | Capacity Available: ${a.capacity}\n- Certifications: ${a.certifications.join(', ')}`).join('\n\n')}\n\n✅ **Top Recommendation:** ${lithiumGroup?.alternatives.sort((a,b) => b.matchScore - a.matchScore)[0]?.name} with a ${lithiumGroup?.alternatives.sort((a,b) => b.matchScore - a.matchScore)[0]?.matchScore}% AI match score.`,
    };
  }

  if (q.includes('tsmc') && q.includes('shutdown') || q.includes('tsmc') && q.includes('fail') || q.includes('taiwan') && q.includes('conflict')) {
    const sim = simulationScenarios[0];
    return {
      text: `## TSMC Shutdown Scenario Analysis\n\n**Scenario:** ${sim.name}\n\n### Impact Summary:\n- **Economic Loss:** $2.4 Trillion\n- **Production Delay:** 18–24 months\n- **Recovery Time:** 36 months\n- **Probability:** ${sim.probability}% (based on current geopolitical indicators)\n\n### Cascade Effects:\n${sim.cascadeSteps.map(s => `**Step ${s.step}:** ${s.event}\n→ ${s.impact} (${s.severity}% severity)`).join('\n\n')}\n\n### Affected Industries:\n${sim.affectedIndustries.map(i => `- ${i}`).join('\n')}\n\n### Recommendations:\n1. Accelerate Samsung Foundry qualification\n2. Build 6-month chip inventory buffers\n3. Invest in domestic semiconductor capacity\n4. Establish geopolitical tripwires for early warning`,
    };
  }

  if (q.includes('pharmaceutical') || q.includes('pharma') || q.includes('drug') || q.includes('medicine')) {
    const pharmaInd = industries.find(i => i.name === 'Pharmaceuticals');
    const pharmaSuppliers = suppliers.filter(s => s.industry === 'Pharmaceuticals');
    return {
      text: `## Pharmaceutical Supply Chain Analysis\n\n**Industry Risk Level:** ${pharmaInd?.riskLevel} (Score: ${pharmaInd?.riskScore}/100)\n**30-day Trend:** ${pharmaInd?.trend > 0 ? '📈' : '📉'} ${Math.abs(pharmaInd?.trend)}%\n\n**Key Issue:** ${pharmaInd?.description}\n\n### Suppliers in Network:\n${pharmaSuppliers.map(s => `- **${s.name}** (${s.country}): Risk ${s.riskScore}/100`).join('\n')}\n\n### Critical Vulnerability:\nUp to 85% of pharmaceutical API (Active Pharmaceutical Ingredient) production for Western markets is concentrated in **India and China**. A disruption in either country could affect medicine availability within 60–90 days.\n\n### Recommendations:\n1. Map Tier 2/3 API chemical suppliers\n2. Establish 90-day strategic medicine reserves\n3. Incentivize domestic API manufacturing\n4. Diversify to European API suppliers`,
    };
  }

  if (q.includes('alert') || q.includes('warning') || q.includes('disruption')) {
    const active = alerts.filter(a => !a.read);
    return {
      text: `## Active Supply Chain Alerts\n\nI found **${active.length} unread alerts** requiring attention:\n\n${active.map(a => `### 🚨 ${a.title}\n- **Type:** ${a.type.toUpperCase()} | **Supplier:** ${a.supplierName}\n- **Probability:** ${a.probability}% | **Economic Impact:** ${a.econLoss}\n- ${a.description}`).join('\n\n')}\n\n### Priority Actions:\n1. Monitor Taiwan Strait situation — TSMC geopolitical risk is elevated\n2. Prepare contingency logistics for Red Sea rerouting\n3. Assess DRC mining exposure in battery supply chain`,
    };
  }

  if (q.includes('energy') || q.includes('oil') || q.includes('gas') || q.includes('power')) {
    const energyInd = industries.find(i => i.name === 'Energy');
    const energySuppliers = suppliers.filter(s => s.industry === 'Energy');
    return {
      text: `## Energy Sector Supply Chain Risk\n\n**Industry Risk Level:** ${energyInd?.riskLevel} (Score: ${energyInd?.riskScore}/100)\n**30-day Trend:** ${energyInd?.trend > 0 ? '📈 +' : '📉 '}${energyInd?.trend}%\n\n### Energy Suppliers:\n${energySuppliers.map(s => `- **${s.name}** (${s.country}): Risk ${s.riskScore}/100`).join('\n')}\n\n### Key Risks:\n1. **Geopolitical:** Middle East conflicts impacting oil transit through Strait of Hormuz\n2. **Trade:** Russian energy sanctions reshaping European supply routes\n3. **Transition Risk:** Rapid solar/wind scaling straining rare earth supply chains\n\n### Recommendations:\n- Diversify energy source by geography and carrier type\n- Establish strategic petroleum reserves per IEA guidelines\n- Hedge commodity prices on 12-month forward contracts`,
    };
  }

  if (q.includes('food') || q.includes('agriculture') || q.includes('grain') || q.includes('crop')) {
    const foodInd = industries.find(i => i.name === 'Food & Agriculture');
    return {
      text: `## Food & Agriculture Supply Chain\n\n**Industry Risk Level:** ${foodInd?.riskLevel} (Score: ${foodInd?.riskScore}/100)\n\n### Top Risks:\n- 🌾 **Ukraine conflict** disrupted 25% of global wheat export\n- ☀️ **El Niño patterns** causing drought in key agricultural zones\n- 🚢 **Port congestion** in major grain export terminals\n- 💧 **Water scarcity** affecting irrigation in major farming regions\n\n### Strategic Suppliers:\n- Cargill (USA) — Risk: 24/100 ✅\n- Wilmar International (Singapore) — Risk: 33/100 ✅\n\n### Food Security Index:\nThe global food security situation is at MEDIUM risk. Recommend monitoring Black Sea grain corridor status and building 3-month grain reserves for critical markets.`,
    };
  }

  if (q.includes('highest risk') || q.includes('most risk') || q.includes('worst supplier')) {
    const top5 = [...suppliers].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
    return {
      text: `## Top 5 Highest Risk Suppliers\n\n${top5.map((s, i) => `**${i+1}. ${s.name}** — Risk Score: ${s.riskScore}/100 🔴\n- Country: ${s.country} | Industry: ${s.industry} | Tier: ${s.tier}\n- Key Risks: Geopolitical (${s.geopoliticalRisk}), Concentration (${s.concentrationRisk})`).join('\n\n')}\n\n### Summary:\n**Terke Mining (DRC)** has the highest risk at **89/100** due to extreme political instability in the Democratic Republic of Congo. **TSMC (Taiwan)** follows at **72/100** due to Taiwan Strait geopolitical tensions.\n\nBoth companies are critical single points of failure for the global electronics and EV supply chain.`,
    };
  }

  if (q.includes('automotive') && (q.includes('risk') || q.includes('supply'))) {
    const autoSuppliers = suppliers.filter(s => s.industry === 'Automotive');
    const autoInd = industries.find(i => i.name === 'Automotive');
    return {
      text: `## Automotive Supply Chain Analysis\n\n**Industry Risk Level:** ${autoInd?.riskLevel} (Score: ${autoInd?.riskScore}/100)\n\n### Automotive Suppliers:\n${autoSuppliers.map(s => `- **${s.name}** (${s.country}, T${s.tier}): Risk ${s.riskScore}/100 ${s.riskScore >= 70 ? '🔴' : s.riskScore >= 40 ? '🟡' : '🟢'}`).join('\n')}\n\n### Critical Path:\n**EV Battery Supply Chain Vulnerability:**\n1. Bosch requires → CATL batteries (China, Risk: 61)\n2. CATL requires → Ganfeng Lithium (China, Risk: 67)\n3. Ganfeng requires → Tenke Mining DRC (Risk: 89)\n\n⚠️ **The entire EV supply chain traces back to a single high-risk mining operation in the DRC.**\n\n### Recommendations:\n1. Invest in LFP (no-cobalt) battery technology\n2. Develop North American lithium extraction\n3. Sign long-term contracts with multiple cobalt suppliers`,
    };
  }

  if (q.includes('summary') || q.includes('overview') || q.includes('status') || q.includes('how are we')) {
    const highRisk = suppliers.filter(s => s.riskScore >= 70);
    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    return {
      text: `## Supply Chain Portfolio Summary\n\n**Portfolio Status: ⚠️ ELEVATED RISK**\n\n### Key Metrics:\n- 📊 **${metrics.totalSuppliers} total suppliers** across ${metrics.countriesMonitored} countries\n- 🔴 **${metrics.highRiskCount} high-risk suppliers** (score ≥ 60)\n- 🚨 **${metrics.activeAlerts} active alerts** (${metrics.criticalAlerts} critical)\n- ⚠️ **${metrics.singlePointFailures} single points of failure** detected\n- 📉 **Average risk score: ${metrics.avgRiskScore}/100**\n\n### Top Concerns Right Now:\n${criticalAlerts.map(a => `- 🚨 ${a.title}`).join('\n')}\n\n### High-Risk Suppliers:\n${highRisk.map(s => `- ${s.name} (${s.country}): ${s.riskScore}/100`).join('\n')}\n\n**Economic Exposure:** ${metrics.economicExposure} globally`,
    };
  }

  if (q.includes('port') || q.includes('shipping') || q.includes('logistics') || q.includes('sea')) {
    return {
      text: `## Logistics & Maritime Supply Chain\n\n### Active Disruptions:\n🚢 **Red Sea Crisis** — Houthi attacks forcing vessels via Cape of Good Hope\n- Transit time increase: +14 days\n- Cost increase: +340% freight rates\n- Weekly economic impact: ~$1.1B\n\n⚓ **Port of Shanghai Strike Risk** — 55% probability of dock worker strike\n- Daily volume at risk: $890M\n- Global container impact: 15% of total volume\n\n### Key Logistics Suppliers:\n- **Maersk** (Denmark) — Risk: 31/100 ✅\n- **DHL Supply Chain** (Germany) — Risk: 22/100 ✅\n- **Port of Shanghai** (China) — Risk: 62/100 ⚠️\n\n### Recommendations:\n1. Pre-book capacity via Cape of Good Hope route\n2. Build 6-week buffer inventory for Red Sea-dependent products\n3. Identify alternative ports (Jebel Ali, Salalah) for Middle East routing`,
    };
  }

  // Default response
  return {
    text: `I understand you're asking about "${msg.slice(0, 60)}${msg.length > 60 ? '...' : ''}". Here's what I can help you with:\n\n**Supply Chain Copilot capabilities:**\n- 🔍 **Risk Analysis** — "Which suppliers are risky for [industry]?"\n- ⚠️ **Disruptions** — "What active disruptions affect our supply chain?"\n- 🔧 **Single Points of Failure** — "Show me our critical dependencies"\n- 🔄 **Alternatives** — "Recommend alternatives for [supplier/product]"\n- 🌐 **Simulations** — "What happens if TSMC shuts down?"\n- 📊 **Summaries** — "Give me a supply chain overview"\n- 🏭 **Industries** — "Analyze semiconductor/automotive/pharma supply chains"\n\nTry one of these queries for detailed insights!`,
  };
}

const suggestedQuestions = [
  "Which suppliers are risky for semiconductor production?",
  "Show me all single points of failure",
  "What active disruptions should I be worried about?",
  "What happens if TSMC shuts down?",
  "Recommend alternative lithium suppliers",
  "Give me a supply chain portfolio summary",
  "Analyze automotive supply chain risks",
  "What's the current logistics situation?",
];

function Message({ msg }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMarkdown = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-white font-bold text-base mt-3 mb-1.5">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-blue-300 font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white text-sm">{line.slice(2, -2)}</p>;
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const content = line.slice(2);
          return (
            <li key={i} className="text-slate-300 text-sm ml-3 mb-0.5 list-none flex gap-2">
              <span className="text-slate-600 mt-1.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-[#1e3050] px-1 rounded text-blue-300 text-xs font-mono">$1</code>') }} />
            </li>
          );
        }
        if (/^\d+\./.test(line)) {
          return (
            <li key={i} className="text-slate-300 text-sm ml-3 mb-0.5 list-none flex gap-2">
              <span className="text-blue-400 font-bold flex-shrink-0">{line.match(/^\d+/)[0]}.</span>
              <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            </li>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1.5" />;
        return (
          <p key={i} className="text-slate-300 text-sm"
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-[#1e3050] px-1 rounded text-blue-300 text-xs font-mono">$1</code>')
            }}
          />
        );
      });
  };

  return (
    <div className={clsx('chat-message flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
        isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-violet-500 to-blue-500'
      )}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className={clsx('flex-1 max-w-[80%]', isUser && 'flex flex-col items-end')}>
        <div className={clsx('rounded-xl px-4 py-3 relative group',
          isUser
            ? 'bg-blue-500/20 border border-blue-500/30 text-right'
            : 'bg-[#0d1526] border border-[#1e3050]'
        )}>
          {isUser ? (
            <p className="text-white text-sm">{msg.content}</p>
          ) : (
            <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
          )}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
            </button>
          )}
        </div>
        <span className="text-slate-700 text-[10px] mt-1 px-1">{msg.time}</span>
      </div>
    </div>
  );
}

export default function Copilot() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'assistant',
      content: "Hello! I'm **Supply Chain Copilot** — your AI assistant for Resilio. I have full access to your supply chain data, risk scores, alerts, and predictive models.\n\nAsk me anything about your supply chain risks, supplier vulnerabilities, or disruption scenarios.",
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', content: q, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    const response = generateResponse(q);
    setMessages(m => [...m, { id: Date.now() + 1, role: 'assistant', content: response.text, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4 max-h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#050b18]" />
          </div>
          <div>
            <h2 className="text-white font-bold">Supply Chain Copilot</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs">Online — Analyzing {metrics.totalSuppliers} suppliers</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs bg-violet-500/10 border border-violet-500/20 text-violet-400 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          Powered by Resilio AI — GPT-4 + Supply Chain RAG
        </div>
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div>
          <p className="text-slate-500 text-xs mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="flex items-center gap-1.5 text-xs bg-[#0d1526] border border-[#1e3050] text-slate-300 hover:text-white hover:border-blue-500/30 hover:bg-blue-500/5 px-3 py-1.5 rounded-full transition-all"
              >
                <ChevronRight className="w-3 h-3 text-slate-600" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && (
          <div className="chat-message flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map(d => (
                    <div key={d} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
                <span className="text-slate-500 text-xs">Analyzing supply chain data…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#0d1526] border border-[#1e3050] rounded-xl p-3 flex items-end gap-3 focus-within:border-blue-500/40 transition-colors">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about supply chain risks, disruptions, suppliers, predictions…"
          rows={1}
          className="flex-1 bg-transparent text-slate-200 text-sm resize-none focus:outline-none placeholder-slate-600 max-h-24"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className={clsx(
            'p-2 rounded-lg transition-all flex-shrink-0',
            input.trim() && !loading
              ? 'bg-blue-500 hover:bg-blue-400 text-white'
              : 'bg-[#1e3050] text-slate-600 cursor-not-allowed'
          )}
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex items-center justify-between px-1">
        <span className="text-slate-700 text-[10px]">Press Enter to send • Shift+Enter for new line</span>
        <span className="text-slate-700 text-[10px]">{messages.length - 1} messages in this session</span>
      </div>
    </div>
  );
}
