from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="DevMentor AI Backend")

@app.get("/")
def root():
    return {"message": "DevMentor AI Backend is running"}

app.include_router(router)