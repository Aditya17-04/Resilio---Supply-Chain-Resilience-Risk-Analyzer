"""
Realtime router — exposes live data from external APIs.

Endpoints:
  GET /api/realtime/stocks              – live stock quotes (Alpha Vantage)
  GET /api/realtime/stocks/{id}         – single supplier stock quote
  GET /api/realtime/weather             – weather at all supplier locations
  GET /api/realtime/weather/{id}        – single supplier weather
  GET /api/realtime/exchange-rates      – USD-based FX rates
  GET /api/realtime/trade-flows         – UN Comtrade export data
  GET /api/realtime/supplier/{id}       – enriched risk snapshot for supplier
  GET /api/realtime/dashboard           – combined live signals overview
"""

from fastapi import APIRouter, HTTPException
from services import realtime_data as rd
from data.dummy_data import SUPPLIERS

router = APIRouter()


# ── Stock quotes ──────────────────────────────────────────────────────────────

@router.get("/stocks")
def get_stocks():
    """Live stock quotes for all publicly listed suppliers (Alpha Vantage)."""
    return {"quotes": rd.get_stock_quotes()}


@router.get("/stocks/{supplier_id}")
def get_stock(supplier_id: str):
    """Live stock quote for a single supplier."""
    data = rd.get_stock_quote(supplier_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"No ticker mapping for supplier '{supplier_id}'")
    return data


# ── Weather ───────────────────────────────────────────────────────────────────

@router.get("/weather")
def get_weather():
    """Current weather conditions at all key supplier locations (OpenWeatherMap)."""
    return {"weather": rd.get_weather_all()}


@router.get("/weather/{supplier_id}")
def get_weather_supplier(supplier_id: str):
    """Current weather for a single supplier location."""
    data = rd.get_weather_for(supplier_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"No location data for supplier '{supplier_id}'")
    return data


# ── Exchange rates ────────────────────────────────────────────────────────────

@router.get("/exchange-rates")
def get_exchange_rates():
    """Latest USD-based FX rates for currencies relevant to the supplier network."""
    return rd.get_exchange_rates()


# ── Trade flows ───────────────────────────────────────────────────────────────

@router.get("/trade-flows")
def get_trade_flows():
    """UN Comtrade export data for key supply-chain commodities."""
    return {"trade_flows": rd.get_trade_flows()}


# ── Enriched supplier snapshot ────────────────────────────────────────────────

@router.get("/supplier/{supplier_id}")
def get_enriched_supplier(supplier_id: str):
    """
    Returns live-enriched risk data for a supplier:
    base risk score + weather adjustment + financial (stock) adjustment.
    """
    supplier = next((s for s in SUPPLIERS if s["id"] == supplier_id), None)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    base_risk = supplier.get("riskScore", 50)
    return rd.get_enriched_supplier(supplier_id, base_risk)


# ── Dashboard overview ─────────────────────────────────────────────────────────

@router.get("/dashboard")
def get_realtime_dashboard():
    """
    Aggregated real-time signals across all data sources.
    Returns a compact summary suitable for the Overview page.
    """
    weather_all = rd.get_weather_all()
    rates       = rd.get_exchange_rates()
    quotes      = rd.get_stock_quotes()

    # Weather alerts (risk_contribution ≥ 5) — show notable conditions
    weather_alerts = [
        {
            "supplier_id":  sid,
            "name":         info["name"],
            "country":      info["country"],
            "condition":    info.get("condition"),
            "description":  info.get("description"),
            "temp_c":       info.get("temp_c"),
            "wind_speed_ms": info.get("wind_speed_ms"),
            "risk_contribution": info.get("risk_contribution", 0),
        }
        for sid, info in weather_all.items()
        if info.get("available") and info.get("risk_contribution", 0) >= 5
    ]

    # Include top weather locations even with no alert (so UI always has data)
    weather_conditions = [
        {
            "supplier_id":  sid,
            "name":         info["name"],
            "country":      info["country"],
            "condition":    info.get("condition"),
            "description":  info.get("description"),
            "temp_c":       info.get("temp_c"),
            "risk_contribution": info.get("risk_contribution", 0),
        }
        for sid, info in weather_all.items()
        if info.get("available")
    ]

    # Stock movers (change_pct available) + rate-limit detection
    stock_movers = []
    stocks_rate_limited = False
    for sid, q in quotes.items():
        if not q.get("available"):
            # Detect Alpha Vantage rate-limit message
            if "rate" in str(q.get("error", "")).lower() or not q.get("available"):
                stocks_rate_limited = True
            continue
        if q.get("change_pct") not in (None, ""):
            try:
                pct = float(q["change_pct"])
                if abs(pct) >= 2:
                    stock_movers.append({
                        "supplier_id":   sid,
                        "supplier_name": q["supplier_name"],
                        "symbol":        q["symbol"],
                        "price":         q.get("price"),
                        "change_pct":    pct,
                        "direction":     "up" if pct > 0 else "down",
                    })
            except (ValueError, TypeError):
                pass
    stock_movers.sort(key=lambda x: abs(x["change_pct"]), reverse=True)

    return {
        "weather_alerts":     weather_alerts,
        "weather_conditions": weather_conditions,
        "stock_movers":       stock_movers,
        "stocks_rate_limited": stocks_rate_limited,
        "exchange_rates":     rates,
        "data_sources": {
            "alpha_vantage":  "rate_limited" if stocks_rate_limited else "active",
            "openweathermap": "active",
            "exchangerate":   "active",
            "comtrade":       "active",
        },
    }
