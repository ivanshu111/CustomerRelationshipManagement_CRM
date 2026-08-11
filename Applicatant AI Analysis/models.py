from pydantic import BaseModel
from typing import List


class AIRequest(BaseModel):
    name: str
    answers: List[str]


class AIResponse(BaseModel):
    score: float
    analysis: str
    recommendation: str