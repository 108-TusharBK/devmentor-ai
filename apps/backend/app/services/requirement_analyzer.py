import json
import re
from apps.backend.app.services.gemini_service import ask_gemini

def extract_json(text: str) -> dict:
    # Remove markdown fences
    text = re.sub(r"^```json\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text.strip())

    # Find first JSON object
    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model response.")

    json_text = text[start:end + 1]
    return json.loads(json_text)


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

    return extract_json(response)