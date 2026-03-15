from __future__ import annotations

from sqlalchemy.orm import Session

from .routing_engine import route_prompt
from .schemas import CopilotChatRequest, CopilotChatResponse


class CopilotChatService:
    async def chat(self, req: CopilotChatRequest, db: Session) -> CopilotChatResponse:
        return await route_prompt(req, db)


copilot_chat_service = CopilotChatService()
