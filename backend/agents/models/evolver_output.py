from pydantic import BaseModel
from typing import List, Any

class EvolverOutput(BaseModel):
    updated_architecture: Any
    updated_database: Any
    updated_documentation: Any
    score_delta: int
    summary_of_changes: List[str]
