from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
AI_SERVICE_API_KEY = os.getenv("AI_SERVICE_API_KEY")