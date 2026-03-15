from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from data.dummy_data import SUPPLIERS
from .classifier import classify_prompt
from .external_fetcher import fetch_external_signals
from .graph_analyzer import analyze_graph
from .llm_reasoner import chat_reasoning
from .memory import memory_store
from .response_formatter import format_response
from .schemas import CompanyContext, CopilotChatRequest, MemoryTurn
from .sql_generator import generate_sql
from .sql_runner import run_sql_task


def _extract_entities_from_rows(rows: list[dict[str, Any]]) -> list[str]:
    values = [row.get("supplier_name") for row in rows if row.get("supplier_name")]
    deduped: list[str] = []
    seen: set[str] = set()
    for value in values:
        if value not in seen:
            deduped.append(value)
            seen.add(value)
    return deduped[:15]


def _build_company_context(req: CopilotChatRequest) -> CompanyContext:
    return CompanyContext(company_id=req.company_id, company_name=req.company_name)


def _supporting_supplier_snapshot(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if rows:
        return rows[:10]
    return [
        {
            "supplier_id": item["id"],
            "supplier_name": item["name"],
            "risk_score": item["riskScore"],
            "country": item["country"],
            "tier": item["tier"],
            "industry": item["industry"],
        }
        for item in sorted(SUPPLIERS, key=lambda supplier: supplier["riskScore"], reverse=True)[:10]
    ]


async def route_prompt(req: CopilotChatRequest, db: Session):
    company_ctx = _build_company_context(req)
    past_entities = memory_store.last_entities(req.user_id, req.company_id)
    classification = classify_prompt(req.prompt, past_entities)

    sql_rows: list[dict[str, Any]] = []
    graph_result: dict[str, Any] = {}
    external_result: dict[str, Any] = {}

    if classification.prompt_type in {"database_query", "hybrid_query", "graph_analysis"}:
        sql_task = generate_sql(req.prompt, req.company_id, past_entities)
        sql_rows = run_sql_task(db, sql_task)

    if classification.prompt_type in {"graph_analysis", "hybrid_query"}:
        graph_result = analyze_graph(req.prompt, sql_rows)

    if classification.prompt_type in {"real_time_query", "hybrid_query"}:
        external_result = fetch_external_signals(req.prompt)

    if classification.prompt_type == "casual_chat":
        llm_summary = await chat_reasoning(req.prompt, req.company_name, {"mode": "casual_chat"})
        insights = [
            "You can ask about risky suppliers, tier analysis, dependencies, or geopolitical impact.",
            f"Company context ready for company_id={req.company_id}.",
        ]
        response = format_response(
            summary=llm_summary,
            insights=insights,
            risk_level="LOW",
            supporting_data={"mode": "casual_chat"},
            recommendations=["Ask a company-specific supply chain question to get data-grounded insights."],
            prompt_type=classification.prompt_type,
            company_id=req.company_id,
            company_name=req.company_name,
            memory_references=past_entities[:10],
        )
        memory_store.add_turn(req.user_id, req.company_id, MemoryTurn(role="user", content=req.prompt, extracted_entities=[]))
        memory_store.add_turn(req.user_id, req.company_id, MemoryTurn(role="assistant", content=response.summary, extracted_entities=[]))
        return response

    combined_evidence = {
        "classification": classification.model_dump(),
        "company_context": company_ctx.model_dump(),
        "sql_rows": _supporting_supplier_snapshot(sql_rows),
        "graph": graph_result,
        "external": external_result,
    }
    llm_summary = await chat_reasoning(req.prompt, req.company_name, combined_evidence)

    insights: list[str] = []
    recommendations: list[str] = []
    risk_level = "MEDIUM"

    if sql_rows:
        top = max(sql_rows, key=lambda row: row.get("risk_score", 0))
        insights.append(f"Top supplier risk in scoped results: {top.get('supplier_name')} ({top.get('risk_score')}).")
        recommendations.append("Prioritize mitigation plans for highest-risk suppliers.")

    if graph_result:
        insights.extend(graph_result.get("insights", []))
        recommendations.extend(graph_result.get("recommendations", []))
        risk_level = graph_result.get("risk_level", risk_level)

    if external_result:
        insights.extend(external_result.get("insights", []))
        recommendations.extend(external_result.get("recommendations", []))
        if external_result.get("risk_level") in {"HIGH", "CRITICAL"}:
            risk_level = external_result["risk_level"]

    if not insights:
        insights.append("No direct structured signal was found; consider refining the prompt.")
    if not recommendations:
        recommendations.append("Ask a more specific question (supplier, tier, geography, dependency, or disruption type).")

    extracted_entities = _extract_entities_from_rows(sql_rows)
    response = format_response(
        summary=llm_summary,
        insights=insights[:10],
        risk_level=risk_level,
        supporting_data=combined_evidence,
        recommendations=list(dict.fromkeys(recommendations))[:8],
        prompt_type=classification.prompt_type,
        company_id=req.company_id,
        company_name=req.company_name,
        memory_references=past_entities[:10],
    )

    memory_store.add_turn(req.user_id, req.company_id, MemoryTurn(role="user", content=req.prompt, extracted_entities=[]))
    memory_store.add_turn(
        req.user_id,
        req.company_id,
        MemoryTurn(role="assistant", content=response.summary, extracted_entities=extracted_entities),
    )
    return response
