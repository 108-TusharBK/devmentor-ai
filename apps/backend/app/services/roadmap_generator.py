from app.services.gemini_service import ask_gemini


def generate_roadmap(goal: str) -> str:
    prompt = f"""
You are an expert technical mentor.

Create a detailed learning roadmap for the following goal.

Include:
1. Prerequisites
2. Step-by-step learning plan
3. Estimated time for each step
4. Recommended mini-projects
5. Final milestone project

Goal:
{goal}
"""
    return ask_gemini(prompt)