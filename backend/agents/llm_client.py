"""
MASDP Backend — LLM Client.

Reusable async client for Groq, implementing retry logic and
robust JSON extraction.
"""

import json
import re
import logging
from typing import Any, Dict, Tuple

from groq import AsyncGroq
from app.config import settings

logger = logging.getLogger(__name__)

async def _parse_json(response_text: str) -> Dict[str, Any]:
    """Parse JSON with multiple fallback strategies."""
    # Attempt 1: Direct JSON parsing
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass

    # Attempt 2: Strip markdown fences
    stripped = response_text.strip()
    if stripped.startswith("```json"):
        stripped = stripped[7:]
    elif stripped.startswith("```"):
        stripped = stripped[3:]
    if stripped.endswith("```"):
        stripped = stripped[:-3]
    stripped = stripped.strip()
    
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    # Attempt 3: Regex extract
    match = re.search(r"\{.*\}", response_text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError("Failed to parse JSON from LLM response")


async def generate_structured_json(prompt: str, max_retries: int = 3) -> Tuple[Dict[str, Any], int, int, str]:
    """
    Generates a structured JSON response using Groq.
    
    Returns:
        Tuple containing:
        - Parsed JSON dictionary
        - prompt_tokens count
        - completion_tokens count
        - llm_model name
    """
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured")
        
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    model = "llama-3.1-8b-instant"
    
    for attempt in range(max_retries):
        try:
            response = await client.chat.completions.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model=model,
                temperature=0.1,
                max_tokens=4096,
            )
            
            response_text = response.choices[0].message.content
            usage = response.usage
            prompt_tokens = usage.prompt_tokens if usage else 0
            completion_tokens = usage.completion_tokens if usage else 0
            
            parsed_json = await _parse_json(response_text)
            return parsed_json, prompt_tokens, completion_tokens, model
            
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed for Groq LLM call: {e}")
            if attempt == max_retries - 1:
                logger.error("All retries exhausted for Groq LLM call")
                raise
