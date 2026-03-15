from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"


async def chat_reasoning(prompt: str, company_name: str | None, evidence: dict[str, Any]) -> str:
    if not GROQ_API_KEY:
        return _local_reasoning(prompt, company_name, evidence)

    system_prompt = (
        "You are ResilioGraph AI Copilot. Provide concise, professional supply-chain reasoning. "
        "Use provided evidence only for factual claims and avoid hallucinations."
    )

    user_prompt = (
        f"Company: {company_name or 'Unknown'}\n"
        f"User Prompt: {prompt}\n"
        f"Evidence: {evidence}\n\n"
        "Return a 3-5 sentence executive summary."
    )

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.2,
        "max_tokens": 350,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(GROQ_CHAT_URL, headers=headers, json=payload)
        if resp.status_code >= 400:
            return _local_reasoning(prompt, company_name, evidence)
        data = resp.json()
        choices = data.get("choices") or []
        if not choices:
            return _local_reasoning(prompt, company_name, evidence)
        content = (choices[0].get("message") or {}).get("content", "").strip()
        return content or _local_reasoning(prompt, company_name, evidence)
    except Exception:
        return _local_reasoning(prompt, company_name, evidence)


def _local_reasoning(prompt: str, company_name: str | None, evidence: dict[str, Any]) -> str:
    return (
        f"For {company_name or 'your company'}, I analyzed your request: '{prompt}'. "
        "The result combines available company supply-network context and risk signals. "
        "Use the key insights and recommendations below to prioritize mitigation actions."
    )
