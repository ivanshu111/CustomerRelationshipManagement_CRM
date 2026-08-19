import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from nlp_sql import process_nlp_to_sql
from database import test_db_connection

# Initialize FastAPI Application
app = FastAPI(
    title="Enterprise CRM - Gemini NLP to SQL Service",
    description="Feature 1 Implementation: Natural Language to SQL query pipeline powered by Google Gemini AI.",
    version="1.0.0"
)

# Enable CORS (Cross-Origin Resource Sharing) for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to match React app URL (e.g. http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Request & Response Schema Models (Pydantic)
# -----------------------------------------------------------------------------
class QueryRequest(BaseModel):
    question: str = Field(
        ..., 
        example="How many leads are in CLOSED status?",
        description="The natural language question to ask the database"
    )
    user_role: str = Field(
        default="ADMIN", 
        example="ADMIN",
        description="Role of the user: 'ADMIN' or 'EMPLOYEE'"
    )
    user_id: int = Field(
        default=1, 
        example=1,
        description="ID of the logged-in user"
    )

class QueryResponse(BaseModel):
    success: bool
    answer: str
    sql_query: str
    data_count: int
    raw_data: list[dict]

# -----------------------------------------------------------------------------
# API Endpoints
# -----------------------------------------------------------------------------
@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Enterprise CRM Chatbot - NLP to SQL",
        "llm_engine": "Google Gemini (gemini-1.5-flash)",
        "docs_url": "http://localhost:8000/docs"
    }

@app.post("/api/chat/sql", response_model=QueryResponse)
def ask_crm_database(request: QueryRequest):
    """
    NLP to SQL Endpoint:
    Accepts a natural language question and returns the generated SQL + conversational answer.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    result = process_nlp_to_sql(
        user_question=request.question,
        user_role=request.user_role.upper(),
        user_id=request.user_id
    )
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=500, 
            detail=result.get("error", "Failed to process query.")
        )
        
    return QueryResponse(
        success=True,
        answer=result["answer"],
        sql_query=result["sql_query"],
        data_count=result["data_count"],
        raw_data=result["raw_data"]
    )

# Run server when launched directly with `python main.py`
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FastAPI Gemini Chatbot Service...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
