from fastapi import APIRouter
from pydantic import BaseModel

from apps.backend.app.services.gemini_service import ask_gemini
from apps.backend.app.services.requirement_analyzer import analyze_requirements
from apps.backend.app.services.tech_comparison import compare_technologies
from apps.backend.app.services.duplicate_detector import detect_duplicates
from apps.backend.app.services.roadmap_generator import generate_roadmap

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ProjectRequest(BaseModel):
    project_idea: str


class CompareRequest(BaseModel):
    query: str


class DuplicateRequest(BaseModel):
    tool_list: str


class RoadmapRequest(BaseModel):
    goal: str    


@router.post("/chat")
def chat(request: ChatRequest):
    reply = ask_gemini(request.message)
    return {"response": reply}


@router.post("/analyze-project")
def analyze_project(request: ProjectRequest):
    result = analyze_requirements(request.project_idea)
    return {"response": result}


@router.post("/compare-tech")
def compare_tech(request: CompareRequest):
    result = compare_technologies(request.query)
    return {"response": result}


@router.post("/detect-duplicates")
def detect_duplicate_tools(request: DuplicateRequest):
    result = detect_duplicates(request.tool_list)
    return {"response": result}


@router.post("/generate-roadmap")
def generate_learning_roadmap(request: RoadmapRequest):
    result = generate_roadmap(request.goal)
    return {"response": result}