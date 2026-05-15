from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import ask_gemini

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(request: ChatRequest):
    reply = ask_gemini(request.message)
    return {"response": reply}