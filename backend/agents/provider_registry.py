from .providers.groq_provider import GroqProvider
from .providers.gemini_provider import GeminiProvider
from .providers.ollama_provider import OllamaProvider

_providers = {
    "groq": GroqProvider(),
    "gemini": GeminiProvider(),
    "ollama": OllamaProvider()
}

def get_provider(name: str):
    if name not in _providers:
        raise ValueError(f"Unknown provider: {name}")
    return _providers[name]
