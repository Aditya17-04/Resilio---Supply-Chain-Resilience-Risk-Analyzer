from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any


@dataclass
class SQLTask:
    sql: str
    params: dict[str, Any]
    description: str


def generate_sql(prompt: str, company_id: str, memory_entities: list[str]) -> SQLTask:
    text = prompt.lower().strip()

    if "tier-2" in text or "tier 2" in text:
        return SQLTask(
            sql=(
                "SELECT supplier_id, supplier_name, country, tier, risk_score, industry "
                "FROM company_suppliers WHERE company_id = :company_id AND tier = 2 "
                "ORDER BY risk_score DESC LIMIT 25"
            ),
            params={"company_id": company_id},
            description="Tier-2 suppliers for logged-in company",
        )

    country_match = re.search(r"in\s+([a-z\s]+)\??$", text)
    if "suppliers" in text and country_match:
        country = country_match.group(1).strip().title()
        return SQLTask(
            sql=(
                "SELECT supplier_id, supplier_name, country, tier, risk_score, industry "
                "FROM company_suppliers WHERE company_id = :company_id AND country = :country "
                "ORDER BY risk_score DESC LIMIT 25"
            ),
            params={"company_id": company_id, "country": country},
            description=f"Company suppliers in {country}",
        )

    if "highest" in text and "risk" in text:
        return SQLTask(
            sql=(
                "SELECT supplier_id, supplier_name, country, tier, risk_score, industry "
                "FROM company_suppliers WHERE company_id = :company_id "
                "ORDER BY risk_score DESC LIMIT 10"
            ),
            params={"company_id": company_id},
            description="Highest-risk company suppliers",
        )

    if re.search(r"\bthem\b", text) and memory_entities:
        return SQLTask(
            sql=(
                "SELECT supplier_id, supplier_name, country, tier, risk_score, industry "
                "FROM company_suppliers WHERE company_id = :company_id AND supplier_name = ANY(:names) "
                "ORDER BY risk_score DESC LIMIT 25"
            ),
            params={"company_id": company_id, "names": memory_entities[:12]},
            description="Memory-resolved suppliers from previous conversation",
        )

    return SQLTask(
        sql=(
            "SELECT supplier_id, supplier_name, country, tier, risk_score, industry "
            "FROM company_suppliers WHERE company_id = :company_id "
            "ORDER BY risk_score DESC LIMIT 10"
        ),
        params={"company_id": company_id},
        description="Default company supplier snapshot",
    )
