from pydantic import BaseModel
from typing import List

class CriticOutput(BaseModel):
    overall_score: int
    requirements_score: int
    architecture_score: int
    database_score: int
    documentation_score: int
    strengths: List[str]
    weaknesses: List[str]
    security_concerns: List[str]
    scalability_concerns: List[str]
    improvement_suggestions: List[str]
