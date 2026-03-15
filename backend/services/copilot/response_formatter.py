from __future__ import annotations

from typing import Any

from .schemas import CopilotChatResponse, PromptType


def format_response(
    *,
    summary: str,
    insights: list[str],
    risk_level: str,
    supporting_data: dict[str, Any],
    recommendations: list[str],
    prompt_type: PromptType,
    company_id: str,
    company_name: str | None,
    memory_references: list[str],
) -> CopilotChatResponse:
    normalized_risk = risk_level.upper()
    if normalized_risk not in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}:
        normalized_risk = "MEDIUM"

    return CopilotChatResponse(
        summary=summary,
        insights=insights,
        risk_level=normalized_risk,
        supporting_data=supporting_data,
        recommendations=recommendations,
        prompt_type=prompt_type,
        company_id=company_id,
        company_name=company_name,
        memory_references=memory_references,
    )
