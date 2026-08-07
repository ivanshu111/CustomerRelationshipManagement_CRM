# 🤖 Feature 1 Implementation: NLP to SQL with Google Gemini Free AI

This directory contains the human-readable Python implementation of **Feature 1 (NLP to SQL)** using Google Gemini AI (`gemini-1.5-flash`), FastAPI, and SQLAlchemy.

---

## 📁 Directory Files Structure

- **`database.py`**: Connects Python to MySQL using SQLAlchemy. Contains query execution and SQL security guardrails.
- **`nlp_sql.py`**: Core NLP-to-SQL logic using Google Gemini AI. Translates plain text to SQL, runs the query, and converts data into a conversational response.
- **`main.py`**: FastAPI web application exposing `/api/chat/sql` endpoint for testing & frontend integration.
- **`requirements.txt`**: List of required Python packages (`langchain-google-genai`, `fastapi`, `pymysql`, `uvicorn`).
- **`.env.example`**: Template for setting up environment variables.

---

## ⚡ Quick Setup Instructions (Step-by-Step)

### Step 1: Get a Free Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Create API Key**.
3. Copy your API Key (It is 100% free with generous rate limits).

### Step 2: Install Python Dependencies
Open your terminal inside the `chatbot` folder:

```bash
cd chatbot

# Create Python virtual environment
python -m venv venv

# Activate Virtual Environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate Virtual Environment (Mac/Linux)
# source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create a file named `.env` inside the `chatbot` folder (copy from `.env.example`):

```env
GEMINI_API_KEY=AIzaSy...Your_Actual_Gemini_API_Key...
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crm_db
```

### Step 4: Run the Service
Start the FastAPI server:

```bash
python main.py
```
Or:
```bash
uvicorn main:app --reload --port 8000
```

---

## 🧪 How to Test Your NLP to SQL Service

### Option A: Interactive Swagger Documentation UI (Recommended)
1. Open your browser and go to `http://localhost:8000/docs`.
2. Click on `POST /api/chat/sql` -> **Try it out**.
3. Paste a request payload:
```json
{
  "question": "How many total customers are in the system?",
  "user_role": "ADMIN",
  "user_id": 1
}
```
4. Click **Execute** to view the generated SQL query and natural response!

### Option B: Test via Terminal (cURL)
```bash
curl -X POST "http://localhost:8000/api/chat/sql" \
     -H "Content-Type: application/json" \
     -d '{"question": "Show me all customers assigned to me", "user_role": "EMPLOYEE", "user_id": 1}'
```
