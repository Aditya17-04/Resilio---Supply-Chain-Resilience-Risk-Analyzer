"""
Real-time data service — fetches live signals from external APIs.

APIs used:
  ALPHA_VANTAGE_KEY  → stock quotes for publicly-listed suppliers
  OPENWEATHER_KEY    → current weather at supplier coordinates
  EXCHANGERATE_KEY   → USD-based currency rates (exchangerate-api.com)
  COMTRADE_KEY       → UN Comtrade international trade flows
"""

import os
import time
from typing import Any, Dict, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

_AV_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")
_OW_KEY = os.getenv("OPENWEATHER_KEY", "")
_ER_KEY = os.getenv("EXCHANGERATE_KEY", "")
_CT_KEY = os.getenv("COMTRADE_KEY", "")

_AV_BASE = "https://www.alphavantage.co/query"
_OW_BASE = "https://api.openweathermap.org/data/2.5"
_ER_BASE = f"https://v6.exchangerate-api.com/v6/{_ER_KEY}"
_CT_BASE = "https://comtradeapi.un.org/data/v1/get"

# ── Simple in-memory TTL cache ────────────────────────────────────────────────
_CACHE: Dict[str, Dict[str, Any]] = {}
_TTL = 300  # seconds (5 minutes)


def _cached(key: str, fetch_fn, *args, **kwargs) -> Any:
    entry = _CACHE.get(key)
    if entry and (time.time() - entry["ts"]) < _TTL:
        return entry["data"]
    data = fetch_fn(*args, **kwargs)
    _CACHE[key] = {"ts": time.time(), "data": data}
    return data


# ── Supplier metadata ─────────────────────────────────────────────────────────

# Alpha Vantage ticker symbols for public suppliers
SUPPLIER_TICKERS: Dict[str, Dict[str, str]] = {
    "S001": {"symbol": "TSM",   "name": "TSMC"},
    "S002": {"symbol": "SSNLF", "name": "Samsung Electronics"},
    "S004": {"symbol": "HNHPF", "name": "Foxconn"},
    "S005": {"symbol": "BASFY", "name": "BASF"},
    "S006": {"symbol": "VALE",  "name": "Vale SA"},
    "S008": {"symbol": "AMKBY", "name": "Maersk"},
    "S009": {"symbol": "SNP",   "name": "Sinopec"},
    "S010": {"symbol": "PFE",   "name": "Pfizer"},
}

# Geographic locations for OpenWeatherMap
SUPPLIER_LOCATIONS: Dict[str, Dict[str, Any]] = {
    "S001": {"name": "TSMC",             "lat": 24.80,  "lng": 120.97, "country": "Taiwan"},
    "S002": {"name": "Samsung",          "lat": 37.56,  "lng": 126.97, "country": "South Korea"},
    "S003": {"name": "CATL",             "lat": 26.66,  "lng": 119.54, "country": "China"},
    "S004": {"name": "Foxconn",          "lat": 25.01,  "lng": 121.45, "country": "Taiwan"},
    "S005": {"name": "BASF",             "lat": 49.47,  "lng":   8.44, "country": "Germany"},
    "S006": {"name": "Vale SA",          "lat": -22.90, "lng": -43.17, "country": "Brazil"},
    "S007": {"name": "Glencore",         "lat": 47.19,  "lng":   8.47, "country": "Switzerland"},
    "S008": {"name": "Maersk",           "lat": 55.67,  "lng":  12.56, "country": "Denmark"},
    "S009": {"name": "Sinopec",          "lat": 39.90,  "lng": 116.40, "country": "China"},
    "S010": {"name": "Pfizer",           "lat": 40.71,  "lng": -74.00, "country": "USA"},
    "S012": {"name": "Ganfeng Lithium",  "lat": 27.81,  "lng": 114.93, "country": "China"},
    "S013": {"name": "Tenke Mining",     "lat": -10.55, "lng":  26.10, "country": "DR Congo"},
}

# ── Weather risk scoring helper ───────────────────────────────────────────────

_WEATHER_RISK: Dict[str, int] = {
    "Thunderstorm": 20,
    "Tornado":      40,
    "Hurricane":    45,
    "Extreme":      35,
    "Snow":         10,
    "Rain":          5,
    "Drizzle":       3,
    "Squall":       15,
    "Ash":          25,
}


def _weather_risk_score(condition: str, wind_speed_ms: float) -> int:
    base = _WEATHER_RISK.get(condition, 0)
    wind_bonus = 0
    if wind_speed_ms > 25:
        wind_bonus = 20
    elif wind_speed_ms > 17:
        wind_bonus = 12
    elif wind_speed_ms > 10:
        wind_bonus = 5
    return min(50, base + wind_bonus)


# ── Alpha Vantage — stock quotes ──────────────────────────────────────────────

def _fetch_quote(symbol: str) -> Dict[str, Any]:
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(_AV_BASE, params={
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": _AV_KEY,
            })
            resp.raise_for_status()
            data = resp.json()
        q = data.get("Global Quote", {})
        if not q:
            return {"symbol": symbol, "available": False}
        return {
            "symbol": symbol,
            "available": True,
            "price": _safe_float(q.get("05. price")),
            "change": _safe_float(q.get("09. change")),
            "change_pct": q.get("10. change percent", "").replace("%", ""),
            "volume": _safe_int(q.get("06. volume")),
            "latest_trading_day": q.get("07. latest trading day"),
        }
    except Exception as exc:
        return {"symbol": symbol, "available": False, "error": str(exc)}


def get_stock_quotes() -> Dict[str, Any]:
    """Return live quotes for all mapped supplier tickers (cached 5 min)."""
    results: Dict[str, Any] = {}
    for sid, info in SUPPLIER_TICKERS.items():
        symbol = info["symbol"]
        results[sid] = {
            **_cached(f"quote:{symbol}", _fetch_quote, symbol),
            "supplier_id": sid,
            "supplier_name": info["name"],
        }
    return results


def get_stock_quote(supplier_id: str) -> Optional[Dict[str, Any]]:
    info = SUPPLIER_TICKERS.get(supplier_id)
    if not info:
        return None
    symbol = info["symbol"]
    return {
        **_cached(f"quote:{symbol}", _fetch_quote, symbol),
        "supplier_id": supplier_id,
        "supplier_name": info["name"],
    }


# ── OpenWeatherMap — current weather ─────────────────────────────────────────

def _fetch_weather(lat: float, lng: float, name: str) -> Dict[str, Any]:
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{_OW_BASE}/weather", params={
                "lat": lat, "lon": lng,
                "appid": _OW_KEY, "units": "metric",
            })
            resp.raise_for_status()
            data = resp.json()
        w = data.get("weather", [{}])[0]
        m = data.get("main", {})
        wind = data.get("wind", {})
        condition = w.get("main", "Clear")
        wind_speed = float(wind.get("speed", 0))
        return {
            "available":    True,
            "condition":    condition,
            "description":  w.get("description", ""),
            "temp_c":       m.get("temp"),
            "feels_like_c": m.get("feels_like"),
            "humidity":     m.get("humidity"),
            "wind_speed_ms": wind_speed,
            "icon":         w.get("icon"),
            "city":         data.get("name", name),
            "risk_contribution": _weather_risk_score(condition, wind_speed),
        }
    except Exception as exc:
        return {"available": False, "error": str(exc)}


def get_weather_all() -> Dict[str, Any]:
    """Return current weather for all key supplier locations (cached 5 min)."""
    results: Dict[str, Any] = {}
    for sid, loc in SUPPLIER_LOCATIONS.items():
        weather = _cached(
            f"weather:{sid}",
            _fetch_weather,
            loc["lat"], loc["lng"], loc["name"],
        )
        results[sid] = {
            "supplier_id": sid,
            "name":        loc["name"],
            "country":     loc["country"],
            "lat":         loc["lat"],
            "lng":         loc["lng"],
            **weather,
        }
    return results


def get_weather_for(supplier_id: str) -> Optional[Dict[str, Any]]:
    loc = SUPPLIER_LOCATIONS.get(supplier_id)
    if not loc:
        return None
    weather = _cached(
        f"weather:{supplier_id}",
        _fetch_weather,
        loc["lat"], loc["lng"], loc["name"],
    )
    return {
        "supplier_id": supplier_id,
        "name":        loc["name"],
        "country":     loc["country"],
        **weather,
    }


# ── ExchangeRate API — currency rates ─────────────────────────────────────────

_KEY_CURRENCIES = ["EUR", "CNY", "TWD", "KRW", "JPY", "INR", "BRL", "RUB", "SAR", "CHF", "GBP", "AUD"]

# Country → currency mapping for impact calculations
COUNTRY_CURRENCY: Dict[str, str] = {
    "Taiwan":       "TWD",
    "South Korea":  "KRW",
    "China":        "CNY",
    "Germany":      "EUR",
    "Brazil":       "BRL",
    "Switzerland":  "CHF",
    "Denmark":      "EUR",
    "USA":          "USD",
    "Japan":        "JPY",
    "India":        "INR",
    "Russia":       "RUB",
    "Saudi Arabia": "SAR",
    "DR Congo":     "USD",
    "Argentina":    "ARS",
    "Netherlands":  "EUR",
    "Ukraine":      "UAH",
}


def _fetch_exchange_rates() -> Dict[str, Any]:
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{_ER_BASE}/latest/USD")
            resp.raise_for_status()
            data = resp.json()
        all_rates = data.get("conversion_rates", {})
        return {
            "available":   True,
            "base":        "USD",
            "last_update": data.get("time_last_update_utc"),
            "rates":       {k: all_rates[k] for k in _KEY_CURRENCIES if k in all_rates},
        }
    except Exception as exc:
        return {"available": False, "error": str(exc)}


def get_exchange_rates() -> Dict[str, Any]:
    """Return latest USD-based exchange rates (cached 5 min)."""
    return _cached("exchange_rates", _fetch_exchange_rates)


# ── UN Comtrade — trade flow data ────────────────────────────────────────────

# HS codes for critical supply-chain commodities
COMTRADE_COMMODITIES: Dict[str, Dict[str, str]] = {
    "8542": {"label": "Integrated Circuits (Semiconductors)",      "reporter": "158"},  # Taiwan exports
    "2844": {"label": "Radioactive / Nuclear Fuel",                "reporter": "156"},  # China
    "2602": {"label": "Manganese Ores (Battery minerals)",         "reporter": "710"},  # South Africa
    "2615": {"label": "Niobium / Tantalum Ores (rare metals)",     "reporter": "076"},  # Brazil
    "1001": {"label": "Wheat",                                     "reporter": "804"},  # Ukraine
}

# ISO numeric reporter codes
REPORTER_NAMES: Dict[str, str] = {
    "158": "Taiwan",
    "156": "China",
    "710": "South Africa",
    "076": "Brazil",
    "804": "Ukraine",
}


def _fetch_comtrade(reporter: str, cmd_code: str) -> Dict[str, Any]:
    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.get(f"{_CT_BASE}/C/A/HS", params={
                "reporterCode":    reporter,
                "period":          "2023",
                "cmdCode":         cmd_code,
                "flowCode":        "X",      # exports
                "partnerCode":     "0",      # world total
                "maxRecords":      5,
                "subscription-key": _CT_KEY,
            })
            resp.raise_for_status()
            data = resp.json()
        records = data.get("data", [])
        if not records:
            return {"available": False, "message": "No data returned"}
        r = records[0]
        return {
            "available":        True,
            "reporter":         REPORTER_NAMES.get(reporter, reporter),
            "commodity_code":   cmd_code,
            "period":           r.get("period"),
            "trade_value_usd":  r.get("primaryValue"),
            "net_weight_kg":    r.get("netWgt"),
            "qty":              r.get("qty"),
            "qty_unit":         r.get("qtyUnitAbbr"),
        }
    except Exception as exc:
        return {"available": False, "error": str(exc)}


def get_trade_flows() -> Dict[str, Any]:
    """Return trade flow data for key supply-chain commodities (cached 5 min)."""
    results: Dict[str, Any] = {}
    for cmd_code, meta in COMTRADE_COMMODITIES.items():
        key = f"comtrade:{cmd_code}"
        results[cmd_code] = {
            "commodity":     meta["label"],
            **_cached(key, _fetch_comtrade, meta["reporter"], cmd_code),
        }
    return results


# ── Enriched supplier snapshot ───────────────────────────────────────────────

def get_enriched_supplier(supplier_id: str, base_risk_score: int) -> Dict[str, Any]:
    """
    Return live data enrichment for a single supplier.
    Adjusts the base risk score using real weather and financial signals.
    """
    weather = get_weather_for(supplier_id) or {}
    stock   = get_stock_quote(supplier_id)
    rates   = get_exchange_rates()

    weather_bump = weather.get("risk_contribution", 0)

    # Financial adjustment: stock down >3% → bump risk by up to 10
    financial_bump = 0
    if stock:
        try:
            pct = float(stock.get("change_pct") or 0)
            if pct < -5:
                financial_bump = 10
            elif pct < -3:
                financial_bump = 5
            elif pct > 3:
                financial_bump = -3   # positive signal lowers risk
        except (ValueError, TypeError):
            pass

    adjusted_risk = min(100, max(0, base_risk_score + weather_bump + financial_bump))

    return {
        "supplier_id":    supplier_id,
        "base_risk":      base_risk_score,
        "adjusted_risk":  adjusted_risk,
        "adjustments": {
            "weather":   weather_bump,
            "financial": financial_bump,
        },
        "weather": weather,
        "stock":   stock,
        "currency": COUNTRY_CURRENCY.get(weather.get("country", ""), None),
        "exchange_rates": rates,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _safe_float(val: Any) -> Optional[float]:
    try:
        return float(val)
    except (TypeError, ValueError):
        return None


def _safe_int(val: Any) -> Optional[int]:
    try:
        return int(val)
    except (TypeError, ValueError):
        return None
