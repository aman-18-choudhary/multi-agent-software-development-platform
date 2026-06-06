import httpx
from app.config import settings
from .base_provider import BaseProvider
import logging

logger = logging.getLogger(__name__)

class OllamaProvider(BaseProvider):
    async def generate_json(self, prompt: str) -> tuple[dict, int, int, str]:
        # Implementation using local Ollama REST API
        model = settings.OLLAMA_MODEL
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        
        # Check if Ollama is available first to fail gracefully
        try:
            async with httpx.AsyncClient() as client:
                health_check = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags", timeout=2.0)
                if health_check.status_code != 200:
                    raise ValueError(f"Ollama health check failed with status: {health_check.status_code}")
        except Exception as e:
            raise ValueError(f"Ollama is unavailable at {settings.OLLAMA_BASE_URL}: {e}")

        payload = {
            "model": model,
            "prompt": prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.1
            }
        }
        
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=300.0) as client:
                    response = await client.post(url, json=payload)
                    response.raise_for_status()
                    data = response.json()
                    
                    response_text = data.get("response", "")
                    pt = data.get("prompt_eval_count", 0)
                    ct = data.get("eval_count", 0)
                    
                    parsed = self._parse_json(response_text)
                    return parsed, pt, ct, model
            except Exception as e:
                logger.warning(f"Ollama attempt {attempt} failed: {e}")
                if attempt == 2: raise
                
        raise RuntimeError("Failed to generate json from Ollama")
