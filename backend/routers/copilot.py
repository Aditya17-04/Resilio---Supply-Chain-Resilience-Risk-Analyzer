from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from data.dummy_data import SUPPLIERS, INDUSTRIES, ALERTS

router = APIRouter()


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


@router.post("/query")
def copilot_query(req: CopilotQuery):
    response = analyze_query(req.query)
    return {
        "query": req.query,
        "response": response,
        "model": "Resilio-Copilot-v1",
        "confidence": 0.87,
    }


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
