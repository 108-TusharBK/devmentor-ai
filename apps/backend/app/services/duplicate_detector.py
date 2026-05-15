from app.services.gemini_service import ask_gemini


def detect_duplicates(tool_list: str) -> str:
    prompt = f"""
You are an expert software architect.

Analyze the following list of tools and technologies.

Identify:
1. Tools with overlapping functionality
2. Redundant tools
3. Minimal recommended stack
4. Why the simplified stack is better
5. Situations where keeping multiple tools is justified

Tool List:
{tool_list}
"""
    return ask_gemini(prompt)