import json
import os
import re
from typing import Optional
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from data.dummy_data import SUPPLIERS, INDUSTRIES, ALERTS
from database import get_db
from services.copilot.schemas import CopilotChatRequest, CopilotChatResponse
from services.copilot.service import copilot_chat_service

router = APIRouter()
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
DATASET_COUNTRIES = {supplier["country"].lower() for supplier in SUPPLIERS}
EXTERNAL_COUNTRY_HINTS = {
    "iran", "iraq", "syria", "afghanistan", "pakistan", "turkey", "egypt", "israel",
    "qatar", "uae", "saudi", "yemen", "lebanon", "jordan", "oman", "bahrain",
    "kuwait", "libya", "sudan", "algeria", "morocco", "tunisia", "ethiopia", "nigeria",
    "venezuela", "brazil", "mexico", "canada", "france", "spain", "italy", "uk",
}
INDUSTRY_ALIASES = {
    "semiconductor": "Semiconductors",
    "semiconductors": "Semiconductors",
    "chip": "Semiconductors",
    "chips": "Semiconductors",
    "pharma": "Pharmaceuticals",
    "pharmaceutical": "Pharmaceuticals",
    "pharmaceuticals": "Pharmaceuticals",
    "drug": "Pharmaceuticals",
    "drugs": "Pharmaceuticals",
    "medicine": "Pharmaceuticals",
    "medicines": "Pharmaceuticals",
    "automotive": "Automotive",
    "vehicle": "Automotive",
    "vehicles": "Automotive",
    "car": "Automotive",
    "cars": "Automotive",
    "energy": "Energy",
    "oil": "Energy",
    "gas": "Energy",
    "food": "Food",
    "agriculture": "Food",
    "grain": "Food",
    "wheat": "Food",
}
SUPPLY_CHAIN_KEYWORDS = {
    "risk", "supplier", "suppliers", "alert", "alerts", "disruption", "mitigation", "inventory",
    "logistics", "port", "transport", "shipping", "trade", "geopolitical", "resilience",
    "automotive", "energy", "food", "pharma", "pharmaceutical", "semiconductor", "chip", "factory",
    "shipment", "shipments", "manufacturing", "network", "procurement", "warehouse", "route",
    "supply", "chain", "vendor", "vendors", "bottleneck", "sourcing", "delay", "shortage",
}
CASUAL_QUERY_PATTERNS = [
    r"^\s*(hi|hello|hey|hii|heyy)\s*[!.?]*\s*$",
    r"^\s*good\s+(morning|afternoon|evening)\s*[!.?]*\s*$",
    r"^\s*(how are you|how's it going|how is it going|what's up|whats up)\s*[?.!]*\s*$",
    r"^\s*(fine|well|good|great|awesome|okay|ok|alright|not bad)\s*[!.?]*\s*$",
    r"^\s*(i am|i'm|im)\s*(fine|well|good|great|okay|ok|alright)\s*[!.?]*\s*$",
    r"^\s*(doing\s+)?(fine|well|good|great)\s*[!.?]*\s*$",
    r"^\s*(thanks|thank you|thankyou)\s*[!.?]*\s*$",
    r"^\s*(what can you do|what do you do|how can you help|what are you|your capabilities|help me)\s*[?.!]*\s*$",
    r"^\s*(who are you|what are you)\s*[?.!]*\s*$",
]


class CopilotQuery(BaseModel):
    query: str
    context: Optional[str] = None


def analyze_query(query: str) -> dict:
    q = query.lower()
    suppliers_data = SUPPLIERS

    if any(kw in q for kw in ["semiconductor", "chip", "taiwan", "tsmc", "fab"]):
        semi_suppliers = [s for s in suppliers_data if s["industry"] == "Semiconductors"]
        high_risk = [s for s in semi_suppliers if s["riskScore"] >= 70]
        return {
            "topic": "Semiconductors",
            "risk_level": "HIGH",
            "summary": f"Found {len(high_risk)} high-risk semiconductor suppliers out of {len(semi_suppliers)} total. TSMC (Taiwan) represents the critical chokepoint with 90%+ of sub-5nm chip production.",
            "key_risks": ["Taiwan geopolitical tension", "Rare earth export controls", "Single fab concentration"],
            "recommendations": [
                "Diversify to Samsung Foundry for non-advanced nodes",
                "Build 90-day chip inventory buffer",
                "Invest in domestic fab capacity"
            ],
            "disruption_probability": 74,
        }

    if any(kw in q for kw in ["risk", "risky", "dangerous", "highest"]):
        top_risk = sorted(suppliers_data, key=lambda x: x["riskScore"], reverse=True)[:5]
        return {
            "topic": "Top Risk Suppliers",
            "risk_level": "HIGH",
            "summary": f"Top 5 highest risk suppliers identified with scores ranging from {top_risk[4]['riskScore']} to {top_risk[0]['riskScore']}.",
            "top_suppliers": [{"name": s["name"], "country": s["country"], "riskScore": s["riskScore"]} for s in top_risk],
            "recommendations": [
                "Prioritize mitigation for suppliers with risk > 80",
                "Implement dual-sourcing strategy",
                "Build emergency stockpiles for critical components"
            ],
        }

    avg_risk = sum(s["riskScore"] for s in suppliers_data) / len(suppliers_data)
    return {
        "topic": "General Analysis",
        "risk_level": "ELEVATED" if avg_risk >= 55 else "MODERATE",
        "summary": f"Supply chain analysis complete. Average risk score: {avg_risk:.1f}/100. {sum(1 for s in suppliers_data if s['riskScore'] >= 70)} suppliers in high-risk zone.",
        "global_risk": round(avg_risk),
        "active_alerts": sum(1 for a in ALERTS if a["status"] == "active"),
        "recommendations": [
            "Review top 5 highest risk suppliers",
            "Activate alternative supplier protocols for critical SPOFs",
            "Monitor geopolitical developments in Taiwan and Ukraine"
        ],
    }


def build_system_prompt(external_mode: bool = False) -> str:
    if external_mode:
        return (
            "You are Resilio Supply Chain AI Copilot. "
            "The user is asking about a geography or entity outside the project's supplier dataset. "
            "Provide concise, practical supply-chain risk analysis using broad domain knowledge.\n\n"
            "RULES:\n"
            "1) Start with heading: External Content\n"
            "2) Do NOT mention project alert IDs, supplier IDs, or dataset citations.\n"
            "3) Do NOT start with 'Based on the provided dataset'.\n"
            "4) Structure your answer as: Summary → Key Insights → Recommendations.\n"
        "5) If data is unavailable, say: 'I don't have data for that supplier in your current supply network.'\n"
            "6) Use **Summary —**, **Key Insights —**, **Recommendations —** as section headings (each on its own line), with a blank line after each section. Do NOT use ** anywhere else."
        )

    high_risk_count = sum(1 for s in SUPPLIERS if s["riskScore"] >= 70)
    active_alerts = sum(1 for a in ALERTS if a["status"] == "active")
    industries = ", ".join(sorted({s["industry"] for s in SUPPLIERS}))
    return (
        "You are Resilio Supply Chain AI Copilot. Your job is to help users analyze supply chain risks, "
        "suppliers, disruptions, logistics, and supply network resilience.\n\n"
        f"Dataset: suppliers={len(SUPPLIERS)}, high_risk={high_risk_count}, "
        f"active_alerts={active_alerts}, industries={industries}.\n\n"
        "RULES:\n"
        "1) Only answer questions related to supply chains, logistics, suppliers, disruptions, risk analysis, "
        "manufacturing networks, and company supply networks.\n"
        "2) If supplier data is provided in the prompt, use it to generate the response.\n"
        "3) NEVER hallucinate data. If data is not available, say: "
        "'I don't have data for that supplier in your current supply network.'\n"
        "4) Do NOT start with 'Based on the provided dataset'.\n"
        "5) Always respond clearly and professionally using EXACTLY this format (each heading on its own line, wrapped in **, followed by a blank line, then content, then another blank line before the next heading):\n"
        "**Summary —**\n"
        "[brief overview]\n\n"
        "**Key Insights —**\n"
        "[bullet points, one per line starting with -]\n\n"
        "**Recommendations —**\n"
        "[numbered action items, one per line]\n"
        "6) Do NOT use ** or * anywhere except on the three heading lines above."
    )


def detect_target_industries(query: str) -> set[str]:
    q = query.lower()
    tokens = q.replace("-", " ").split()
    detected = set()

    for token in tokens:
        industry = INDUSTRY_ALIASES.get(token)
        if industry:
            detected.add(industry)

    for industry in {item["name"] for item in INDUSTRIES}:
        if industry.lower() in q:
            detected.add(industry)

    return detected


def tokenize_text(text: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9]+", text.lower()) if len(token) >= 3}


def is_supply_chain_query(query: str) -> bool:
    q = query.lower().strip()
    if not q:
        return False

    query_tokens = tokenize_text(q)
    if not query_tokens:
        return False

    if query_tokens & SUPPLY_CHAIN_KEYWORDS:
        return True

    for supplier in SUPPLIERS:
        supplier_text = f"{supplier['id']} {supplier['name']} {supplier['industry']} {supplier['country']}".lower()
        supplier_tokens = tokenize_text(supplier_text)
        if query_tokens & supplier_tokens:
            return True

    for alert in ALERTS:
        alert_text = f"{alert['id']} {alert['title']} {alert.get('supplier', '')} {alert.get('industry', '')}".lower()
        alert_tokens = tokenize_text(alert_text)
        if query_tokens & alert_tokens:
            return True

    return False


def is_casual_query(query: str) -> bool:
    q = query.lower().strip()
    if not q:
        return False
    return any(re.match(pattern, q, flags=re.IGNORECASE) for pattern in CASUAL_QUERY_PATTERNS)


def classify_prompt(prompt: str) -> str:
    """Classify prompt as 'greeting', 'domain', or 'out_of_domain'."""
    if is_casual_query(prompt):
        return "greeting"
    if is_supply_chain_query(prompt):
        return "domain"
    return "out_of_domain"


def build_local_casual_response(query: str) -> str:
    q = query.lower().strip()
    if re.match(r"^\s*(fine|well|good|great|awesome|okay|ok|alright|not bad)\s*[!.?]*\s*$", q):
        return "Great to hear! What supply chain question can I help you with?"
    if re.match(r"^\s*(i am|i'm|im)\s*(fine|well|good|great|okay|ok|alright)\s*[!.?]*\s*$", q):
        return "Nice! What supply chain question can I help you with?"
    if re.match(r"^\s*(doing\s+)?(fine|well|good|great)\s*[!.?]*\s*$", q):
        return "Glad you're doing well! What supply chain question can I help you with?"
    if re.match(r"^\s*(thanks|thank you|thankyou)\s*[!.?]*\s*$", q):
        return "You're welcome! Is there anything else about your supply chain you'd like to explore?"
    if re.match(r"^\s*(what can you do|what do you do|how can you help|your capabilities|help me)\s*[?.!]*\s*$", q):
        return (
            "I'm your Supply Chain AI Copilot. I can help you with:\n"
            "- Supplier risk analysis\n"
            "- Disruption and logistics insights\n"
            "- Geopolitical supply chain impacts\n"
            "- Alternative supplier recommendations\n\n"
            "What would you like to analyze?"
        )
    if re.match(r"^\s*(who are you|what are you)\s*[?.!]*\s*$", q):
        return (
            "I'm Resilio Supply Chain AI Copilot — your intelligent assistant for supply chain risk analysis, "
            "supplier monitoring, and logistics disruption insights. What would you like to explore?"
        )
    return (
        "Hello! I'm your Supply Chain AI Copilot. "
        "I can help analyze supplier risks, disruptions, and supply network insights. "
        "What would you like to analyze?"
    )


def should_include_citations(query: str) -> bool:
    q = query.lower()
    citation_keywords = {
        "citation", "citations", "source", "sources", "evidence", "prove", "proof",
        "reference", "references", "why", "show data", "show source",
    }
    return any(keyword in q for keyword in citation_keywords)


def should_allow_external_context(query: str) -> bool:
    q = query.lower()
    tokens = tokenize_text(q)
    has_supply_chain_intent = any(
        keyword in q
        for keyword in ["industry", "industries", "risk", "alert", "supply", "shipping", "export", "sanction"]
    )
    if not has_supply_chain_intent:
        return False

    if any(country in q for country in DATASET_COUNTRIES):
        return False

    has_external_geo_hint = any(token in EXTERNAL_COUNTRY_HINTS for token in tokens)
    if not has_external_geo_hint:
        return False

    return True


def _score_text_match(query: str, values: list[str]) -> int:
    q = query.lower()
    score = 0
    for value in values:
        text = str(value).lower()
        if q in text:
            score += 6
        for token in q.split():
            if len(token) < 3:
                continue
            if token in text:
                score += 1
    return score


def get_relevant_suppliers(query: str, limit: int = 6, industry_filter: Optional[set[str]] = None) -> list[dict]:
    scored = []
    for supplier in SUPPLIERS:
        if industry_filter and supplier.get("industry") not in industry_filter:
            continue
        match_score = _score_text_match(
            query,
            [supplier["id"], supplier["name"], supplier["industry"], supplier["country"], supplier.get("description", "")],
        )
        risk_tiebreak = supplier.get("riskScore", 0)
        scored.append((match_score > 0, match_score, risk_tiebreak, supplier))

    scored.sort(key=lambda pair: (pair[0], pair[1], pair[2]), reverse=True)
    matched = [item[3] for item in scored if item[0]]
    if matched:
        return matched[:limit]

    fallback = sorted(SUPPLIERS, key=lambda s: s.get("riskScore", 0), reverse=True)
    selected = fallback[:limit]
    return selected


def get_relevant_alerts(
    query: str,
    limit: int = 4,
    industry_filter: Optional[set[str]] = None,
    active_only: bool = False,
    allow_global_fallback: bool = True,
) -> list[dict]:
    scored = []
    for alert in ALERTS:
        if active_only and alert.get("status") != "active":
            continue
        if industry_filter and alert.get("industry") not in industry_filter:
            continue
        match_score = _score_text_match(
            query,
            [
                alert["id"],
                alert["title"],
                alert.get("industry", ""),
                alert.get("supplier", ""),
                alert.get("description", ""),
                alert.get("type", ""),
            ],
        )
        score = match_score
        if alert.get("status") == "active":
            score += 2
        scored.append((match_score > 0, score, alert.get("probability", 0), alert))

    scored.sort(key=lambda pair: (pair[0], pair[1], pair[2]), reverse=True)
    matched = [item[3] for item in scored if item[0]]
    if matched:
        return matched[:limit]

    if not allow_global_fallback:
        fallback_local = sorted(scored, key=lambda pair: (pair[1], pair[2]), reverse=True)
        return [item[3] for item in fallback_local[:limit]]

    fallback = sorted(ALERTS, key=lambda a: (a.get("status") == "active", a.get("probability", 0)), reverse=True)
    selected = fallback[:limit]
    return selected


def format_supplier_citation(supplier: dict) -> str:
    return (
        f"- Supplier: {supplier['id']} | {supplier['name']} | industry={supplier['industry']} "
        f"| country={supplier['country']} | riskScore={supplier['riskScore']}"
    )


def format_alert_citation(alert: dict) -> str:
    return (
        f"- Alert: {alert['id']} | {alert['type']} | {alert['title']} "
        f"| supplier={alert['supplier']} | status={alert['status']} | probability={alert['probability']}"
    )


def strip_model_citations(text: str) -> str:
    markers = ["data citations:", "citations:"]
    lowered = text.lower()
    cut_idx = -1
    for marker in markers:
        idx = lowered.find(marker)
        if idx != -1 and (cut_idx == -1 or idx < cut_idx):
            cut_idx = idx
    if cut_idx == -1:
        return text.strip()
    return text[:cut_idx].rstrip()


def strip_leading_boilerplate(text: str) -> str:
    cleaned = text.strip()
    patterns = [
        r"^based on the provided dataset,?\s*",
        r"^based on the dataset,?\s*",
        r"^according to the provided dataset,?\s*",
    ]
    for pattern in patterns:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    cleaned = re.sub(r"\bbased on the provided dataset\b,?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\bbased on the dataset\b,?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\baccording to the provided dataset\b,?\s*", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def build_citation_block(query: str, max_suppliers: int = 2, max_alerts: int = 2) -> str:
    target_industries = detect_target_industries(query)
    same_industry_available = bool(
        get_relevant_alerts(
            query,
            limit=1,
            industry_filter=target_industries,
            active_only=True,
            allow_global_fallback=False,
        )
    ) if target_industries else False

    suppliers = get_relevant_suppliers(query, limit=max_suppliers, industry_filter=target_industries or None)
    if not suppliers:
        suppliers = get_relevant_suppliers(query, limit=max_suppliers)
    primary_supplier = suppliers[0] if suppliers else None

    alert_industry_filter = target_industries or ({primary_supplier.get("industry")} if primary_supplier else None)
    alerts = get_relevant_alerts(
        query,
        limit=max_alerts,
        industry_filter=alert_industry_filter,
        active_only=True,
        allow_global_fallback=False,
    )

    fallback_note = None
    if not alerts:
        alerts = get_relevant_alerts(query, limit=max_alerts, active_only=True)
        if alert_industry_filter:
            wanted = ", ".join(sorted(alert_industry_filter))
            fallback_note = f"- Note: No active alerts found for industry={wanted}; showing closest active alerts instead."

    lines = []
    if primary_supplier:
        lines.append(format_supplier_citation(primary_supplier))
    for alert in alerts[:max_alerts]:
        lines.append(format_alert_citation(alert))
    for supplier in suppliers[1:max_suppliers]:
        lines.append(format_supplier_citation(supplier))

    has_supplier = any("Supplier:" in line for line in lines)
    has_active_alert = any("Alert:" in line and "| status=active |" in line for line in lines)

    if not has_supplier:
        fallback_supplier = sorted(SUPPLIERS, key=lambda s: s["riskScore"], reverse=True)[0]
        lines.insert(0, format_supplier_citation(fallback_supplier))
    if not has_active_alert:
        fallback_alerts = [a for a in ALERTS if a.get("status") == "active"]
        if fallback_alerts:
            best_alert = sorted(fallback_alerts, key=lambda a: a.get("probability", 0), reverse=True)[0]
            lines.append(format_alert_citation(best_alert))

    deduped = []
    seen = set()
    for line in lines:
        if line not in seen:
            deduped.append(line)
            seen.add(line)

    if fallback_note:
        deduped.append(fallback_note)
    if target_industries and same_industry_available:
        deduped.append(f"- Note: Citation pairing enforced for industry={', '.join(sorted(target_industries))}.")

    return "Data Citations:\n" + "\n".join(deduped[:6])


def build_off_topic_response(query: str) -> str:
    return (
        "I’m your Supply Chain Copilot, so I focus on supplier, logistics, disruption, and risk analysis.\n\n"
        "Try asking something like:\n"
        "- Which suppliers are highest risk this week?\n"
        "- What disruptions could impact semiconductor supply?\n"
        "- Recommend mitigation actions for critical alerts.\n\n"
        f"If useful, I can reframe your question into a supply-chain analysis: \"{query}\"."
    )


def build_data_context(query: str) -> str:
    suppliers = get_relevant_suppliers(query)
    alerts = get_relevant_alerts(query)
    supplier_lines = [format_supplier_citation(s) for s in suppliers]
    alert_lines = [format_alert_citation(a) for a in alerts]
    return (
        "Use only the references below as ground truth for this answer.\n\n"
        "Supplier references:\n"
        + "\n".join(supplier_lines)
        + "\n\nAlert references:\n"
        + "\n".join(alert_lines)
    )


def build_external_context_instruction() -> str:
    return (
        "The requested geography/entity appears outside the project dataset. "
        "Provide a concise, practical supply-chain risk answer using broad domain knowledge. "
        "Do not claim this comes from project data. "
        "Include a short heading exactly: External Content."
    )


def strip_markdown_stars(text: str) -> str:
    """Remove inline markdown bold/italic asterisks but preserve standalone **Heading** lines."""
    lines = text.split('\n')
    result = []
    for line in lines:
        stripped = line.strip()
        # Keep lines that are purely a **heading** — the frontend renders these as bold
        if stripped.startswith('**') and stripped.endswith('**') and stripped.count('**') == 2:
            result.append(line)
        else:
            # Strip inline **bold** and *italic* markers
            cleaned = re.sub(r'\*{2,}', '', line)
            cleaned = re.sub(r'(?<![\w])\*(?![\w])', '', cleaned)
            result.append(cleaned)
    return '\n'.join(result)


def ensure_citations_in_text(text: str, query: str, include_citations: bool) -> str:
    normalized = strip_markdown_stars(strip_leading_boilerplate(strip_model_citations(text)))
    if include_citations:
        return f"{normalized}\n\n{build_citation_block(query)}"
    return normalized


def build_user_prompt(query: str, context: Optional[str]) -> str:
    external_mode = should_allow_external_context(query)
    external_instruction = build_external_context_instruction() if external_mode else ""
    data_context = build_data_context(query)
    main_context = external_instruction if external_mode else data_context
    if context:
        return (
            f"Context:\n{context}\n\n"
            + (f"{main_context}\n\n" if main_context else "")
            + f"User query:\n{query}"
        )
    return (f"{main_context}\n\n" if main_context else "") + f"User query:\n{query}"


async def call_groq_chat(query: str, context: Optional[str]) -> str:
    if is_casual_query(query):
        if not GROQ_API_KEY:
            return build_local_casual_response(query)

        payload = {
            "model": GROQ_MODEL,
            "temperature": 0.4,
            "max_tokens": 250,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are Resilio Supply Chain AI Copilot. Reply naturally and concisely to greetings and casual messages. "
                        "For a greeting like 'hello', respond: 'Hello! I'm your Supply Chain AI Copilot. "
                        "I can help analyze supplier risks, disruptions, and supply network insights. What would you like to analyze?' "
                        "If the user says they are fine/well/good, acknowledge it briefly and ask what supply chain question they have. "
                        "If asked what you can do, list your supply chain capabilities briefly. "
                        "Always steer the conversation toward supply chain topics."
                    ),
                },
                {"role": "user", "content": query},
            ],
        }
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(GROQ_CHAT_URL, headers=headers, json=payload)

        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Groq API error: {resp.text[:300]}")

        data = resp.json()
        choices = data.get("choices") or []
        if not choices:
            raise HTTPException(status_code=502, detail="Groq returned empty choices")
        content = (choices[0].get("message") or {}).get("content", "").strip()
        if not content:
            raise HTTPException(status_code=502, detail="Groq returned empty content")
        return strip_markdown_stars(content)

    if not is_supply_chain_query(query):
        return (
            "I'm designed to assist with supply chain analysis, supplier risks, logistics disruptions, "
            "and resilience insights. Please ask a question related to supply chain intelligence."
        )

    include_citations = should_include_citations(query)
    external_mode = should_allow_external_context(query)

    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.2,
        "max_tokens": 900,
        "messages": [
            {"role": "system", "content": build_system_prompt(external_mode=external_mode)},
            {"role": "user", "content": build_user_prompt(query, context)},
        ],
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=40.0) as client:
        resp = await client.post(GROQ_CHAT_URL, headers=headers, json=payload)

    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Groq API error: {resp.text[:300]}")

    data = resp.json()
    choices = data.get("choices") or []
    if not choices:
        raise HTTPException(status_code=502, detail="Groq returned empty choices")
    content = (choices[0].get("message") or {}).get("content", "").strip()
    if not content:
        raise HTTPException(status_code=502, detail="Groq returned empty content")
    return ensure_citations_in_text(content, query, include_citations and not external_mode)


async def stream_groq_chat(query: str, context: Optional[str]):
    if is_casual_query(query):
        if not GROQ_API_KEY:
            text = build_local_casual_response(query)
            yield f"data: {json.dumps({'token': text, 'done': True})}\n\n"
            return

        payload = {
            "model": GROQ_MODEL,
            "temperature": 0.4,
            "max_tokens": 250,
            "stream": True,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are Resilio Supply Chain AI Copilot. Reply naturally and concisely to greetings and casual messages. "
                        "For a greeting like 'hello', respond: 'Hello! I'm your Supply Chain AI Copilot. "
                        "I can help analyze supplier risks, disruptions, and supply network insights. What would you like to analyze?' "
                        "If the user says they are fine/well/good, acknowledge it briefly and ask what supply chain question they have. "
                        "If asked what you can do, list your supply chain capabilities briefly. "
                        "Always steer the conversation toward supply chain topics."
                    ),
                },
                {"role": "user", "content": query},
            ],
        }
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", GROQ_CHAT_URL, headers=headers, json=payload) as resp:
                if resp.status_code >= 400:
                    detail = await resp.aread()
                    err = detail.decode("utf-8", errors="ignore")[:300]
                    yield f"data: {json.dumps({'error': f'Groq API error: {err}', 'done': True})}\n\n"
                    return

                async for line in resp.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    data_str = line.removeprefix("data:").strip()
                    if data_str == "[DONE]":
                        yield f"data: {json.dumps({'done': True})}\n\n"
                        break
                    try:
                        chunk = json.loads(data_str)
                    except json.JSONDecodeError:
                        continue

                    delta = ((chunk.get("choices") or [{}])[0].get("delta") or {}).get("content")
                    if delta:
                        yield f"data: {json.dumps({'token': delta, 'done': False})}\n\n"
        return

    if not is_supply_chain_query(query):
        text = (
            "I'm designed to assist with supply chain analysis, supplier risks, logistics disruptions, "
            "and resilience insights. Please ask a question related to supply chain intelligence."
        )
        yield f"data: {json.dumps({'token': text, 'done': True})}\n\n"
        return

    include_citations = should_include_citations(query)
    external_mode = should_allow_external_context(query)

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.2,
        "max_tokens": 900,
        "stream": True,
        "messages": [
            {"role": "system", "content": build_system_prompt(external_mode=external_mode)},
            {"role": "user", "content": build_user_prompt(query, context)},
        ],
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    if not GROQ_API_KEY:
        fallback = analyze_query(query)
        text = f"{fallback['summary']}\n\nRecommended Actions:\n" + "\n".join(
            f"- {r}" for r in fallback.get("recommendations", [])
        )
        text = ensure_citations_in_text(text, query, include_citations and not external_mode)
        yield f"data: {json.dumps({'token': text, 'done': True})}\n\n"
        return

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream("POST", GROQ_CHAT_URL, headers=headers, json=payload) as resp:
            if resp.status_code >= 400:
                detail = await resp.aread()
                err = detail.decode("utf-8", errors="ignore")[:300]
                yield f"data: {json.dumps({'error': f'Groq API error: {err}', 'done': True})}\n\n"
                return

            streamed_text = ""
            async for line in resp.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data_str = line.removeprefix("data:").strip()
                if data_str == "[DONE]":
                    finalized = ensure_citations_in_text(streamed_text, query, include_citations and not external_mode)
                    if finalized != streamed_text:
                        tail = finalized[len(streamed_text):]
                        if tail:
                            yield f"data: {json.dumps({'token': tail, 'done': False})}\n\n"
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    break
                try:
                    chunk = json.loads(data_str)
                except json.JSONDecodeError:
                    continue

                delta = ((chunk.get("choices") or [{}])[0].get("delta") or {}).get("content")
                if delta:
                    streamed_text += delta
                    yield f"data: {json.dumps({'token': delta, 'done': False})}\n\n"


@router.post("/query")
async def copilot_query(req: CopilotQuery):
    if GROQ_API_KEY:
        ai_text = await call_groq_chat(req.query, req.context)
        return {
            "query": req.query,
            "response_text": ai_text,
            "model": GROQ_MODEL,
            "provider": "groq",
        }

    response = analyze_query(req.query)
    fallback_text = response["summary"]
    if response.get("key_risks"):
        fallback_text += "\n\nKey Risks:\n" + "\n".join(f"- {x}" for x in response["key_risks"])
    if response.get("recommendations"):
        fallback_text += "\n\nRecommended Actions:\n" + "\n".join(f"- {x}" for x in response["recommendations"])

    return {
        "query": req.query,
        "response": response,
        "response_text": fallback_text,
        "model": "Resilio-Copilot-v1-fallback",
        "provider": "local-rule-engine",
    }


@router.post("/query/stream")
async def copilot_query_stream(req: CopilotQuery):
    return StreamingResponse(stream_groq_chat(req.query, req.context), media_type="text/event-stream")


@router.post("/chat", response_model=CopilotChatResponse)
async def copilot_chat(req: CopilotChatRequest, db: Session = Depends(get_db)):
    return await copilot_chat_service.chat(req, db)


@router.get("/insights")
def get_insights():
    high_risk_count = sum(1 for s in SUPPLIERS if s["riskScore"] >= 70)
    critical_alerts = sum(1 for a in ALERTS if a["type"] == "CRITICAL" and a["status"] == "active")
    return {
        "insights": [
            {
                "title": f"{high_risk_count} high-risk suppliers detected",
                "severity": "HIGH",
                "action": "Review and build alternative sourcing strategies",
            },
            {
                "title": f"{critical_alerts} critical alerts require immediate attention",
                "severity": "CRITICAL",
                "action": "Activate emergency response protocols",
            },
            {
                "title": "ASML remains single-point-of-failure for all advanced chip production",
                "severity": "HIGH",
                "action": "Develop domestic EUV alternatives — 5-10 year horizon",
            },
        ],
        "global_risk_score": 70,
        "risk_trend": "RISING",
    }
