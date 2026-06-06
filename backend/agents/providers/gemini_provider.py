from google import genai
from app.config import settings
from .base_provider import BaseProvider
import logging
import asyncio

logger = logging.getLogger(__name__)

class GeminiProvider(BaseProvider):
    async def generate_json(self, prompt: str) -> tuple[dict, int, int, str]:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY missing")
            
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        model = "gemini-flash-latest"
        
        for attempt in range(3):
            try:
                def _gen():
                    return client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config=genai.types.GenerateContentConfig(
                            temperature=0.1,
                            response_mime_type="application/json"
                        )
                    )
                response = await asyncio.to_thread(_gen)
                response_text = response.text
                pt = response.usage_metadata.prompt_token_count if response.usage_metadata else 0
                ct = response.usage_metadata.candidates_token_count if response.usage_metadata else 0
                
                parsed = self._parse_json(response_text)
                return parsed, pt, ct, model
            except Exception as e:
                logger.warning(f"Gemini attempt {attempt} failed: {e}")
                if attempt == 2: raise
                
        raise RuntimeError("Failed to generate json from Gemini")
