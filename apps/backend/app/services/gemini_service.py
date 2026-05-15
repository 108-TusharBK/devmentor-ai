import google.generativeai as genai
from app.config.settings import GEMINI_API_KEY, MODEL_NAME

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)


def ask_gemini(prompt: str) -> str:
    response = model.generate_content(prompt)
    return response.text