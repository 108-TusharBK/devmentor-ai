from fastapi import APIRouter
from pydantic import BaseModel

from app.services.gemini_service import ask_gemini
from app.services.requirement_analyzer import analyze_requirements
from app.services.tech_comparison import compare_technologies

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ProjectRequest(BaseModel):
    project_idea: str


class CompareRequest(BaseModel):
    query: str


@router.post("/chat")
def chat(request: ChatRequest):
    reply = ask_gemini(request.message)
    return {"response": reply}


@router.post("/analyze-project")
def analyze_project(request: ProjectRequest):
    result = analyze_requirements(request.project_idea)
    return result


@router.post("/compare-tech")
def compare_tech(request: CompareRequest):
    result = compare_technologies(request.query)
    return {"response": result}