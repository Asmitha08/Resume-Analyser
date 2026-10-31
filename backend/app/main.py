import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment variables from .env file in backend/
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from app.routes.health import router as health_router
from app.routes.analysis import router as analysis_router

app = FastAPI(
    title="ResumeAI API",
    description="Backend API for AI-Powered Resume Analyzer and Job Matcher using Google Gemini AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env.strip() == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Register routes
app.include_router(health_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")


@app.get("/", summary="Root index")
async def root():
    return {
        "app": "ResumeAI – AI-Powered Resume Analyzer & Job Matcher",
        "status": "online",
        "documentation": "/docs",
        "health": "/api/health",
    }
