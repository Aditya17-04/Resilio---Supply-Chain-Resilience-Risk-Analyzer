from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

PromptType = Literal[
    "database_query",
    "graph_analysis",
    "real_time_query",
    "hybrid_query",
    "casual_chat",
]


class CopilotChatRequest(BaseModel):
    user_id: str
    company_id: str
    prompt: str
    company_name: Optional[str] = None
    conversation_id: Optional[str] = None


class CompanyContext(BaseModel):
    company_id: str
    company_name: Optional[str] = None
    supplier_ids: list[str] = Field(default_factory=list)
    supplier_rows: list[dict[str, Any]] = Field(default_factory=list)


class MemoryTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    extracted_entities: list[str] = Field(default_factory=list)


class ClassifierResult(BaseModel):
    prompt_type: PromptType
    reason: str


class CopilotChatResponse(BaseModel):
    summary: str
    insights: list[str] = Field(default_factory=list)
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "MEDIUM"
    supporting_data: dict[str, Any] = Field(default_factory=dict)
    recommendations: list[str] = Field(default_factory=list)
    prompt_type: PromptType
    company_id: str
    company_name: Optional[str] = None
    memory_references: list[str] = Field(default_factory=list)
