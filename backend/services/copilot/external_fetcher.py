from __future__ import annotations

from typing import Any

from services import realtime_data


def fetch_external_signals(prompt: str) -> dict[str, Any]:
    text = prompt.lower()

    weather = realtime_data.get_weather_all()
    active_weather_risks = [
        {
            "supplier_id": key,
            "name": value.get("name"),
            "country": value.get("country"),
            "condition": value.get("condition"),
            "risk_contribution": value.get("risk_contribution", 0),
        }
        for key, value in weather.items()
        if value.get("available") and value.get("risk_contribution", 0) >= 10
    ]

    exchange = realtime_data.get_exchange_rates()

    geopolitical_keywords = ["taiwan", "china", "ukraine", "russia", "middle east", "sanction", "geopolitical"]
    geopolitical_flag = any(keyword in text for keyword in geopolitical_keywords)

    insights = []
    if geopolitical_flag:
        insights.append("Geopolitical sensitivity detected in prompt.")
    if active_weather_risks:
        top_weather = sorted(active_weather_risks, key=lambda item: item["risk_contribution"], reverse=True)[:3]
        insights.append(
            "Weather disruptions with elevated risk: "
            + ", ".join(f"{item['name']} ({item['condition']})" for item in top_weather)
        )

    return {
        "summary": "External risk signals collected from weather, currency, and domain risk heuristics.",
        "insights": insights,
        "risk_level": "HIGH" if geopolitical_flag else "MEDIUM",
        "supporting_data": {
            "weather_risks": active_weather_risks[:10],
            "exchange_rates": exchange,
            "geopolitical_flag": geopolitical_flag,
        },
        "recommendations": [
            "Monitor port/weather/geopolitical feeds daily for impacted regions",
            "Add safety-stock buffers for lanes exposed to active risk signals",
        ],
    }
