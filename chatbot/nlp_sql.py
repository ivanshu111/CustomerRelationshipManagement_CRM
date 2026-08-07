import os
import re
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from database import execute_raw_sql

# Ensure UTF-8 output encoding for Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables from the exact directory of this file
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=ENV_PATH, override=True)

def get_gemini_api_key() -> str:
    """Dynamically loads and returns the current GEMINI_API_KEY from .env."""
    load_dotenv(dotenv_path=ENV_PATH, override=True)
    key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
    return key

def get_model_candidates() -> list:
    """Returns active model candidate names to try in order."""
    primary_model = os.getenv("GEMINI_MODEL", "gemini-flash-latest").strip()
    candidates = [
        primary_model,
        "gemini-flash-latest",
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite",
        "gemini-2.0-flash"
    ]
    return list(dict.fromkeys(candidates))

# -----------------------------------------------------------------------------
# CRM Database Schema Description
# -----------------------------------------------------------------------------
CRM_SCHEMA_CONTEXT = """
Database Engine: MySQL

Tables & Columns:
1. `users`: Stores system employees and administrators.
   - `id` (INT, Primary Key, Auto-Increment)
   - `name` (VARCHAR)
   - `email` (VARCHAR, Unique)
   - `password` (VARCHAR - account password)
   - `role` (ENUM: 'ADMIN', 'EMPLOYEE' - MUST be UPPERCASE)
   - `employee_status` (ENUM: 'ACTIVE', 'PENDING', 'BLOCKED', 'RESIGNED', 'DELETED' - default 'ACTIVE')
   - `block_removal_requested` (TINYINT/BOOLEAN - default 0)
   - `created_at` (DATETIME)

2. `customer`: Stores customer profiles.
   - `id` (INT, Primary Key, Auto-Increment)
   - `name` (VARCHAR)
   - `email` (VARCHAR, Unique)
   - `phone` (VARCHAR, Unique)
   - `user_id` (INT, Foreign Key referencing `users.id` - The assigned employee/sales rep)
   - `created_at` (DATETIME)

3. `interaction`: Logs customer interactions and follow-ups.
   - `id` (INT, Primary Key, Auto-Increment)
   - `notes` (TEXT - conversation notes)
   - `interaction_date` (DATETIME - default NOW())
   - `status` (ENUM: 'NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CLOSED', 'PENDING')
   - `next_follow_up_date` (DATE - e.g. 'YYYY-MM-DD' or NULL)
   - `customer_id` (INT, Foreign Key referencing `customer.id`)
   - `employee_id` (INT, Foreign Key referencing `users.id`)

4. `leads`: Pipeline conversion tracking history.
   - `id` (INT, Primary Key, Auto-Increment)
   - `status` (ENUM: 'NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CLOSED', 'PENDING')
   - `customer_id` (INT, Foreign Key referencing `customer.id`)
   - `employee_id` (INT, Foreign Key referencing `users.id`)
"""

# Prompt template for SQL generation
SQL_GENERATION_PROMPT = PromptTemplate.from_template(
    """You are a senior MySQL Database Engineer for an Enterprise CRM system.
Your job is to convert a user's natural language request into a valid, efficient MySQL query (SELECT to retrieve data or INSERT to create new entries).

Schema Description:
{schema}

User Request: "{user_question}"
User Persona/Role: {user_role}
User Employee ID: {user_id}

Rules:
1. Generate ONLY a single raw MySQL query (SELECT or INSERT). Do NOT write markdown, code blocks (```sql), or extra explanations.
2. You may write SELECT queries to retrieve data OR INSERT queries to create new database entries. Never write UPDATE, DELETE, DROP, ALTER, or TRUNCATE statements.
3. For INSERT into `users`:
   - Set `name`, `email`, `password`, `role` (UPPERCASE: 'ADMIN' or 'EMPLOYEE'), `employee_status` ('ACTIVE'), `block_removal_requested` (0), and `created_at` (NOW()).
   - If password is provided in user input, use that exact password string. If not provided, default password is 'password123'.
4. For INSERT into `customer`, `interaction`, or `leads`: set proper FKs and standard datetime fields using NOW() or CURDATE().
5. If User Persona is 'EMPLOYEE':
   - For SELECT queries, restrict results so customer.user_id = {user_id} or employee_id = {user_id}.
   - For INSERT into `customer`, set `user_id` = {user_id}.
   - For INSERT into `interaction` or `leads`, set `employee_id` = {user_id}.
6. If User Persona is 'ADMIN', they can query or create entries across any user/employee ID.

Generated SQL Query:"""
)

# Prompt template for natural language summary generation
SUMMARY_GENERATION_PROMPT = PromptTemplate.from_template(
    """You are an intelligent AI Assistant in a CRM system. 
Translate the SQL database operation results into a clear, conversational response for the user.

Original User Request: "{user_question}"
Executed SQL Query: `{sql_query}`
Raw Database Operation Result: {query_result}

Instructions:
- If an entry was created in the database (INSERT query), confirm clearly that the record/entry was successfully created, highlighting key details (e.g. name, email, role, or ID).
- If it was a query (SELECT), summarize the retrieved data directly, highlighting key numbers, names, or metrics.
- Keep the tone helpful, professional, and concise.
- If the result set is empty (e.g. []), state clearly that no records were found matching their search.

Response:"""
)

def clean_sql_output(raw_sql: str) -> str:
    """Helper function to remove markdown backticks (```sql ... ```) if Gemini returns them."""
    cleaned = raw_sql.strip()
    cleaned = re.sub(r"^```(?:sql)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()

def validate_api_key() -> str:
    """Validates if GEMINI_API_KEY is present and formatted properly."""
    api_key = get_gemini_api_key()
    if not api_key or api_key.startswith("your_") or len(api_key) < 10:
        raise ValueError("GEMINI_API_KEY is missing or invalid in chatbot/.env! Please get an API key at https://aistudio.google.com/")
    return api_key

def invoke_llm_with_fallback(prompt_text: str) -> str:
    """Tries invoking Gemini with candidate model names with fast timeout & low retries."""
    api_key = validate_api_key()
    model_candidates = get_model_candidates()
        
    last_err = None
    for model_name in model_candidates:
        try:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=api_key,
                temperature=0.0,
                max_retries=1,
                timeout=12.0
            )
            response = llm.invoke(prompt_text)
            content = response.content if hasattr(response, 'content') else str(response)
            
            # Convert list content blocks (LangChain 4.x format) to string
            if isinstance(content, list):
                parts = []
                for item in content:
                    if isinstance(item, dict) and "text" in item:
                        parts.append(item["text"])
                    else:
                        parts.append(str(item))
                content = "".join(parts)
                
            return str(content)
        except Exception as e:
            last_err = e
            continue
            
    err_str = str(last_err)
    if "API_KEY_INVALID" in err_str or "INVALID_ARGUMENT" in err_str or "API key not valid" in err_str:
        raise RuntimeError("Invalid Gemini API Key provided. Please make sure your GEMINI_API_KEY in chatbot/.env is copied correctly from https://aistudio.google.com/ and starts with 'AIzaSy'.")
    if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str or "quota" in err_str.lower():
        raise RuntimeError("Google Gemini API free tier rate limit / quota exceeded. Please wait 60 seconds before retrying, or create a new API key in a NEW Google Cloud project at https://aistudio.google.com/.")
    
    raise RuntimeError(
        f"Gemini API Error: {last_err}"
    )

def process_nlp_to_sql(user_question: str, user_role: str = "EMPLOYEE", user_id: int = 1) -> dict:
    """
    Main Feature 1 Pipeline:
    Step 1: Converts User Natural Language Question -> MySQL Query using Gemini.
    Step 2: Executes MySQL Query safely against the database.
    Step 3: Converts Query Results -> Natural Language Summary using Gemini.
    """
    # -------------------------------------------------------------------------
    # STEP 1: Generate SQL Query using Gemini
    # -------------------------------------------------------------------------
    formatted_sql_prompt = SQL_GENERATION_PROMPT.format(
        schema=CRM_SCHEMA_CONTEXT,
        user_question=user_question,
        user_role=user_role,
        user_id=user_id
    )
    
    try:
        raw_generated_sql = invoke_llm_with_fallback(formatted_sql_prompt)
    except Exception as e:
        err_msg = str(e)
        if "RESOURCE_EXHAUSTED" in err_msg or "429" in err_msg or "rate limit" in err_msg.lower():
            friendly_answer = "⏳ **Google Gemini API Rate Limit Reached**: The free API key has temporarily exceeded its request quota (15 requests/min). Please wait 60 seconds before retrying, or create a new key in a **NEW project** on [Google AI Studio](https://aistudio.google.com/) and update `GEMINI_API_KEY` in `chatbot/.env`."
        else:
            friendly_answer = f"⚠️ **API Key / Model Error**: {err_msg}"
            
        return {
            "success": False,
            "error": err_msg,
            "sql_query": "",
            "answer": friendly_answer
        }
    
    # Clean SQL output
    sql_query = clean_sql_output(raw_generated_sql)
    
    # -------------------------------------------------------------------------
    # STEP 2: Execute SQL Query on MySQL Database
    # -------------------------------------------------------------------------
    try:
        query_result = execute_raw_sql(sql_query)
    except Exception as err:
        err_str = str(err)
        if "1062" in err_str or "Duplicate entry" in err_str:
            clean_err = "An entry with this email or unique identifier already exists in the database."
            return {
                "success": False,
                "error": err_str,
                "sql_query": sql_query,
                "answer": f"⚠️ Cannot create entry: {clean_err} Please try again with a unique email address or identifier."
            }
        return {
            "success": False,
            "error": f"Database execution error: {err_str}",
            "sql_query": sql_query,
            "answer": f"I generated the SQL query `{sql_query}`, but database execution failed: {err_str}"
        }
    
    # -------------------------------------------------------------------------
    # STEP 3: Summarize SQL Result in Natural Language using Gemini
    # -------------------------------------------------------------------------
    formatted_summary_prompt = SUMMARY_GENERATION_PROMPT.format(
        user_question=user_question,
        sql_query=sql_query,
        query_result=str(query_result)
    )
    
    try:
        final_answer = invoke_llm_with_fallback(formatted_summary_prompt)
    except Exception as e:
        final_answer = f"Query executed successfully ({len(query_result)} rows found), but failed to generate summary: {str(e)}"

    return {
        "success": True,
        "answer": final_answer,
        "sql_query": sql_query,
        "data_count": len(query_result),
        "raw_data": query_result
    }

if __name__ == "__main__":
    print("Testing Feature 1 (NLP to SQL with Gemini)...")
    sample_question = "How many total customers are registered in the CRM?"
    print(f"\nQuestion: '{sample_question}'")
    
    result = process_nlp_to_sql(sample_question, user_role="ADMIN", user_id=1)
    
    print("\n--- RESULTS ---")
    print(f"Generated SQL: {result.get('sql_query')}")
    print(f"Final Answer:  {result.get('answer')}")
