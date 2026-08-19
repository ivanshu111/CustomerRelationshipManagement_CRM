from google import genai
from google.genai.errors import APIError
from fastapi import HTTPException

from config import GEMINI_API_KEY
from prompt import build_prompt
from guardrails import validate_input, validate_output

import json


def evaluate_candidate(name: str, answers: list[str]):

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing. Please set GEMINI_API_KEY in the environment or .env file."
        )

    client = genai.Client(api_key=GEMINI_API_KEY)

    try:
        validate_input(name, answers)
        
        prompt = build_prompt(name, answers)

        response = client.models.generate_content(
            model="models/gemini-flash-latest",
            contents=prompt
        )

        text = response.text.strip()

        result = json.loads(text)

        validate_output(result)

        return result

    except APIError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API Error: {str(e)}"
        )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Gemini returned an invalid JSON response."
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error while evaluating candidate: {str(e)}"
        )