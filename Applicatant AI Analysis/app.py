from fastapi import FastAPI, Header, HTTPException

from models import AIRequest, AIResponse
from ai_service import evaluate_candidate
from config import AI_SERVICE_API_KEY

app = FastAPI()


@app.post("/api/ai/evaluate", response_model=AIResponse)
def evaluate(
    request: AIRequest,
    x_api_key: str = Header(...)
):

    if x_api_key != AI_SERVICE_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    result = evaluate_candidate(
        request.name,
        request.answers
    )

    return AIResponse(**result)