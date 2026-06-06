"""
MASDP Backend — LLM Client.

Delegates generation to the provider registry.
"""
from typing import Any, Dict, Tuple
from agents.provider_registry import get_provider

async def generate_structured_json(prompt: str, max_retries: int = 3, provider_name: str = "groq") -> Tuple[Dict[str, Any], int, int, str]:
    """
    Generates a structured JSON response using the specified provider.
    
    Returns:
        Tuple containing:
        - Parsed JSON dictionary
        - prompt_tokens count
        - completion_tokens count
        - llm_model name
    """
    provider = get_provider(provider_name)
    return await provider.generate_json(prompt)
