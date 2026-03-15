from __future__ import annotations

from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from data.dummy_data import SUPPLIERS
from .sql_generator import SQLTask


def run_sql_task(db: Session, task: SQLTask) -> list[dict[str, Any]]:
    try:
        rows = db.execute(text(task.sql), task.params).mappings().all()
        return [dict(row) for row in rows]
    except Exception:
        return _fallback_from_dummy(task)


def _fallback_from_dummy(task: SQLTask) -> list[dict[str, Any]]:
    rows = [
        {
            "supplier_id": item["id"],
            "supplier_name": item["name"],
            "country": item["country"],
            "tier": item["tier"],
            "risk_score": item["riskScore"],
            "industry": item["industry"],
        }
        for item in SUPPLIERS
    ]

    country = task.params.get("country")
    if country:
        rows = [row for row in rows if row["country"].lower() == str(country).lower()]

    if "tier = 2" in task.sql.lower():
        rows = [row for row in rows if row["tier"] == 2]

    rows.sort(key=lambda row: row.get("risk_score", 0), reverse=True)
    return rows[:25]
