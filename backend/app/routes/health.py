import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service Health and Readiness Check")
async def health_check():
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"
        if env_file.exists():
            load_dotenv(dotenv_path=env_file, override=True)
            key = os.getenv("GEMINI_API_KEY", "").strip()

    return {
        "status": "healthy",
        "service": "ResumeAI Backend",
        "version": "1.0.0",
        "gemini_configured": bool(key and len(key) > 5),
    }

