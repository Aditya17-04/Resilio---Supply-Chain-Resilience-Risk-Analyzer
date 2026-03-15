from __future__ import annotations

import re

from .schemas import ClassifierResult, PromptType

DATABASE_HINTS = {
    "supplier", "suppliers", "tier", "risk score", "highest risk", "in taiwan", "country", "my suppliers",
}
GRAPH_HINTS = {
    "dependency", "dependencies", "chain", "graph", "node", "centrality", "single point", "spof", "critical node",
}
REALTIME_HINTS = {
    "geopolitical", "news", "weather", "port", "congestion", "logistics", "sanction", "strike", "real-time", "realtime",
}
CASUAL_PATTERNS = [
    r"^\s*(hi|hello|hey|good\s+morning|good\s+afternoon|good\s+evening)\s*[!.?]*\s*$",
    r"^\s*(how are you|what is supply chain resilience|explain supply chain resilience)\s*[!.?]*\s*$",
]


def _contains_any(prompt: str, keywords: set[str]) -> bool:
    return any(keyword in prompt for keyword in keywords)


def classify_prompt(prompt: str, memory_entities: list[str]) -> ClassifierResult:
    text = prompt.lower().strip()

    if any(re.match(pattern, text, flags=re.IGNORECASE) for pattern in CASUAL_PATTERNS):
        return ClassifierResult(prompt_type="casual_chat", reason="Matched casual-chat pattern")

    has_db = _contains_any(text, DATABASE_HINTS)
    has_graph = _contains_any(text, GRAPH_HINTS)
    has_rt = _contains_any(text, REALTIME_HINTS)

    if re.search(r"\b(them|those|them\?|those\?)\b", text) and memory_entities:
        has_db = True

    if has_db and (has_rt or has_graph):
        prompt_type: PromptType = "hybrid_query"
        reason = "Prompt combines company-data with external/graph intent"
    elif has_graph:
        prompt_type = "graph_analysis"
        reason = "Graph/dependency intent detected"
    elif has_db:
        prompt_type = "database_query"
        reason = "Company-data query intent detected"
    elif has_rt:
        prompt_type = "real_time_query"
        reason = "External signal / real-time intent detected"
    else:
        prompt_type = "casual_chat"
        reason = "Defaulting to conversational mode"

    return ClassifierResult(prompt_type=prompt_type, reason=reason)
