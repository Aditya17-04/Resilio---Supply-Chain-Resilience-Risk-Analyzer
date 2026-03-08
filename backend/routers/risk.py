from fastapi import APIRouter
from typing import Optional
from data.dummy_data import SUPPLIERS, INDUSTRIES, DISRUPTION_PREDICTIONS, RISK_TREND
import random
import math

router = APIRouter()


def compute_risk_score(supplier: dict) -> int:
    """AI-style weighted risk score calculation"""
    geo = supplier.get("geopoliticalRisk", 50) * 0.35
    disaster = supplier.get("disasterRisk", 30) * 0.20
    transport = supplier.get("transportRisk", 30) * 0.15
    financial = (100 - supplier.get("financialStability", 70)) * 0.20
    concentration = {
        "Critical": 95, "High": 70, "Medium": 40, "Low": 20
    }.get(supplier.get("concentration", "Medium"), 40) * 0.10
    return min(100, round(geo + disaster + transport + financial + concentration))


@router.get("/scores")
def get_risk_scores(industry: Optional[str] = None):
    suppliers = SUPPLIERS
    if industry:
        suppliers = [s for s in suppliers if s["industry"].lower() == industry.lower()]
    scores = []
    for s in suppliers:
        computed = compute_risk_score(s)
        scores.append({
            "id": s["id"],
            "name": s["name"],
            "riskScore": s["riskScore"],
            "computedScore": computed,
            "breakdown": {
                "geopolitical": s.get("geopoliticalRisk", 0),
                "disaster": s.get("disasterRisk", 0),
                "transport": s.get("transportRisk", 0),
                "financial": 100 - s.get("financialStability", 80),
            }
        })
    scores.sort(key=lambda x: x["riskScore"], reverse=True)
    return {"scores": scores}


@router.get("/industries")
def get_industry_risks():
    return {"industries": INDUSTRIES}


@router.get("/trend")
def get_risk_trend():
    return {"trend": RISK_TREND}


@router.get("/prediction")
def get_disruption_prediction():
    return {
        "predictions": DISRUPTION_PREDICTIONS,
        "model": "LSTM",
        "accuracy": 91,
        "updated": "2026-03-07T06:00:00Z"
    }


@router.get("/heatmap")
def get_heatmap_data():
    from data.dummy_data import HEATMAP_REGIONS
    return {"regions": HEATMAP_REGIONS}
