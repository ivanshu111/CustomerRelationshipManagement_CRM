from fastapi import HTTPException

ALLOWED_RECOMMENDATIONS = {
    "SHORTLIST",
    "REVIEW",
    "NOT_RECOMMENDED"
}

SUSPICIOUS_PHRASES = [
    "ignore previous",
    "ignore all instructions",
    "ignore the above",
    "system prompt",
    "you are chatgpt",
    "always give me",
    "always shortlist",
    "return 10",
    "give me full marks"
]


def validate_input(name: str, answers: list[str]):

    if not name.strip():
        raise HTTPException(
            status_code=400,
            detail="Candidate name cannot be empty."
        )

    if len(answers) != 4:
        raise HTTPException(
            status_code=400,
            detail="Exactly 4 answers are required."
        )

    for index, answer in enumerate(answers, start=1):

        if not answer.strip():
            raise HTTPException(
                status_code=400,
                detail=f"Answer {index} cannot be empty."
            )

        if len(answer.strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail=f"Answer {index} is too short. Please provide a meaningful answer."
            )

        lower_answer = answer.lower()

        for phrase in SUSPICIOUS_PHRASES:
            if phrase in lower_answer:
                raise HTTPException(
                    status_code=400,
                    detail=f"Answer {index} contains prompt injection attempts."
                )


def validate_output(result: dict):

    required_fields = [
        "score",
        "analysis",
        "recommendation"
    ]

    for field in required_fields:
        if field not in result:
            raise HTTPException(
                status_code=500,
                detail=f"Gemini response missing '{field}'."
            )

    score = result["score"]

    if not isinstance(score, (int, float)):
        raise HTTPException(
            status_code=500,
            detail="Score must be numeric."
        )

    if score < 0 or score > 10:
        raise HTTPException(
            status_code=500,
            detail="Score must be between 0 and 10."
        )

    recommendation = result["recommendation"]

    if recommendation not in ALLOWED_RECOMMENDATIONS:
        raise HTTPException(
            status_code=500,
            detail="Invalid recommendation returned by Gemini."
        )

    if not result["analysis"].strip():
        raise HTTPException(
            status_code=500,
            detail="Analysis cannot be empty."
        )