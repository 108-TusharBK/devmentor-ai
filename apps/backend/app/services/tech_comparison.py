from app.services.gemini_service import ask_gemini


def compare_technologies(query: str) -> str:
    prompt = f"""
You are an expert software architect and technology advisor.

Compare the technologies mentioned in the user's query.

Your response must include these sections:

1. Summary
2. Comparison Table
3. Pros and Cons
4. Cost Considerations
5. Learning Curve
6. Best Recommendation
7. When to Choose Each Option

User Query:
{query}
"""
    return ask_gemini(prompt)