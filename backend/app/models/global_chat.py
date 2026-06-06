from pydantic import BaseModel
from typing import List

class GlobalChatRequest(BaseModel):
    question: str

class GlobalChatResponse(BaseModel):
    answer: str
    projects: List[str]
