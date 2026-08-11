def build_prompt(name: str, answers: list[str]) -> str:

    return f"""
You are an experienced Sales Recruitment Manager.

Your task is to evaluate a candidate applying for a Sales Executive role.

Evaluate the candidate based on:

1. Communication Skills
2. Confidence
3. Sales Aptitude
4. Customer Handling Ability
5. Problem Solving Ability

Candidate Name:
{name}

Answer 1:
{answers[0]}

Answer 2:
{answers[1]}

Answer 3:
{answers[2]}

Answer 4:
{answers[3]}

Provide an overall score out of 10.

Return ONLY valid JSON.

Format:

{{
    "score": 8.5,
    "analysis": "A concise evaluation in 3-4 sentences.",
    "recommendation": "SHORTLIST"
}}

Rules:

- Score must be between 0 and 10.
- Recommendation must be exactly one of:
  SHORTLIST
  REVIEW
  NOT_RECOMMENDED
- Do not use markdown.
- Do not explain anything outside JSON.
"""