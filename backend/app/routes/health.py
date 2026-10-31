import os
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service Health and Readiness Check")
async def health_check():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    return {
        "status": "healthy",
        "service": "ResumeAI Backend",
        "version": "1.0.0",
        "gemini_configured": bool(api_key and len(api_key) > 5),
    }
