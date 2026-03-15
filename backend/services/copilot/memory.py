from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass

from .schemas import MemoryTurn


@dataclass
class ConversationMemory:
    turns: deque[MemoryTurn]


class ConversationMemoryStore:
    def __init__(self, max_turns: int = 12) -> None:
        self.max_turns = max_turns
        self._store: dict[tuple[str, str], ConversationMemory] = defaultdict(
            lambda: ConversationMemory(turns=deque(maxlen=self.max_turns))
        )

    def add_turn(self, user_id: str, company_id: str, turn: MemoryTurn) -> None:
        self._store[(user_id, company_id)].turns.append(turn)

    def get_turns(self, user_id: str, company_id: str) -> list[MemoryTurn]:
        return list(self._store[(user_id, company_id)].turns)

    def last_entities(self, user_id: str, company_id: str) -> list[str]:
        turns = self._store[(user_id, company_id)].turns
        entities: list[str] = []
        for turn in reversed(turns):
            entities.extend(turn.extracted_entities)
            if len(entities) >= 12:
                break
        deduped: list[str] = []
        seen: set[str] = set()
        for value in entities:
            if value not in seen:
                deduped.append(value)
                seen.add(value)
        return deduped


memory_store = ConversationMemoryStore()
