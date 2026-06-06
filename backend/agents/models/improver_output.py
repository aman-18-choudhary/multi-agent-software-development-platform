from pydantic import BaseModel
from typing import List

class ImproverOutput(BaseModel):
    changes_made: List[str]
    security_improvements: List[str]
    scalability_improvements: List[str]
    architecture_updates: List[str]
    database_updates: List[str]
    expected_score_improvement: int
