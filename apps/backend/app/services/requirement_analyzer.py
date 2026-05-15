import json
from app.services.gemini_service import ask_gemini


def analyze_requirements(project_idea: str) -> dict:
    prompt = f"""
You are an expert software architect and technical mentor.

Analyze the following project idea and return ONLY valid JSON.

Project Idea:
{project_idea}

Return JSON in this exact format:
{{
  "project_summary": "...",
  "recommended_stack": {{
    "frontend": ["..."],
    "backend": ["..."],
    "ai_models": ["..."],
    "databases": ["..."],
    "deployment": ["..."]
  }},
  "complexity": {{
    "level": "Beginner | Intermediate | Advanced",
    "estimated_time": "..."
  }},
  "learning_roadmap": [
    "...",
    "..."
  ],
  "architecture_notes": [
    "...",
    "..."
  ]
}}
"""
    response = ask_gemini(prompt)

    # Remove optional markdown code fences if present
    response = response.strip()
    if response.startswith("```"):
        response = response.split("```", 2)[1]
        if response.startswith("json"):
            response = response[4:]
        response = response.strip()

    return json.loads(response)