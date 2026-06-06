from groq import AsyncGroq
from app.config import settings
from .base_provider import BaseProvider
import logging

logger = logging.getLogger(__name__)

class GroqProvider(BaseProvider):
    async def generate_json(self, prompt: str) -> tuple[dict, int, int, str]:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY missing")
            
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        model = "llama-3.1-8b-instant"
        
        for attempt in range(3):
            try:
                response = await client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=model,
                    temperature=0.1,
                    max_tokens=4096,
                    response_format={"type": "json_object"}
                )
                response_text = response.choices[0].message.content
                
                logger.info(f"=== GROQ RAW RESPONSE START (Attempt {attempt + 1}) ===")
                logger.info(response_text)
                logger.info("=== GROQ RAW RESPONSE END ===")
                
                usage = response.usage
                pt = usage.prompt_tokens if usage else 0
                ct = usage.completion_tokens if usage else 0
                
                try:
                    parsed = self._parse_json(response_text)
                    return parsed, pt, ct, model
                except Exception as parse_err:
                    logger.error(f"Failed to parse JSON. Error: {parse_err}")
                    raise ValueError(f"JSON Parsing Error: {parse_err}\nRaw Response Excerpt: {str(response_text)[:1000]}")
                    
            except Exception as e:
                logger.warning(f"Groq attempt {attempt} failed: {e}")
                if attempt == 2: raise
                
        raise RuntimeError("Failed to generate json from Groq")
