import io
import re
from typing import Optional, List, Dict, Any

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Header,
    HTTPException,
    status,
)
from fastapi.responses import StreamingResponse

from app.schemas.analysis import (
    ResumeAnalysisResponse,
    AnalyzeTextRequest,
    ImproveBulletsRequest,
    BulletImprovement,
    GenerateRoadmapRequest,
    SkillGapRoadmap,
)
from app.services.extractor import extract_text_from_file, validate_file_upload
from app.services.gemini_analyzer import (
    GeminiAnalyzer,
    GeminiKeyMissingError,
    GeminiAnalysisError,
)
from app.services.report_generator import generate_pdf_report
from app.utils.role_definitions import (
    SUPPORTED_ROLES,
    ROLE_EVALUATION_CRITERIA,
    EXAMPLE_JOB_DESCRIPTIONS,
)

router = APIRouter(tags=["Analysis"])


@router.get("/roles", summary="Get supported job roles and example job descriptions")
async def get_roles_and_examples():
    return {
        "supported_roles": SUPPORTED_ROLES,
        "criteria": ROLE_EVALUATION_CRITERIA,
        "example_job_descriptions": EXAMPLE_JOB_DESCRIPTIONS,
    }


@router.post(
    "/analyze",
    response_model=ResumeAnalysisResponse,
    summary="Upload resume file (PDF or DOCX) and analyze against Job Description",
)
async def analyze_resume_file(
    file: UploadFile = File(..., description="Resume file (.pdf or .docx)"),
    role: str = Form(..., description="Selected job role"),
    job_description: str = Form(..., min_length=20, description="Target job description"),
    x_gemini_api_key: Optional[str] = Header(None, description="Optional override API key"),
):
    # Validate file
    content = await file.read()
    file_size = len(content)

    is_valid, error_msg = validate_file_upload(file.filename or "", file_size)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    # Extract text
    try:
        resume_text = extract_text_from_file(file.filename or "resume.pdf", content)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while parsing the resume: {str(e)}",
        )

    # Validate role
    selected_role = role if role in SUPPORTED_ROLES else "Other"

    # Analyze with Gemini
    analyzer = GeminiAnalyzer(api_key=x_gemini_api_key)
    try:
        result = analyzer.analyze_resume(
            resume_text=resume_text,
            role=selected_role,
            job_description=job_description,
            filename=file.filename or "Uploaded_Resume.pdf",
        )
        return result
    except GeminiKeyMissingError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "GEMINI_API_KEY_MISSING",
                "message": str(e),
                "help": "Please set GEMINI_API_KEY in backend/.env to enable AI resume analysis.",
            },
        )
    except GeminiAnalysisError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": "GEMINI_ANALYSIS_FAILED", "message": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}",
        )


@router.post(
    "/analyze-text",
    response_model=ResumeAnalysisResponse,
    summary="Analyze raw resume text against Job Description",
)
async def analyze_resume_text(
    payload: AnalyzeTextRequest,
    x_gemini_api_key: Optional[str] = Header(None, description="Optional override API key"),
):
    selected_role = payload.role if payload.role in SUPPORTED_ROLES else "Other"
    analyzer = GeminiAnalyzer(api_key=x_gemini_api_key)

    try:
        result = analyzer.analyze_resume(
            resume_text=payload.resume_text,
            role=selected_role,
            job_description=payload.job_description,
            filename=payload.filename or "Pasted_Resume.txt",
        )
        return result
    except GeminiKeyMissingError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "GEMINI_API_KEY_MISSING",
                "message": str(e),
                "help": "Please set GEMINI_API_KEY in backend/.env to enable AI resume analysis.",
            },
        )
    except GeminiAnalysisError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": "GEMINI_ANALYSIS_FAILED", "message": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}",
        )


@router.post(
    "/improve-resume",
    response_model=List[BulletImprovement],
    summary="Improve specific resume bullet points without fabricating metrics",
)
async def improve_resume_bullets(
    payload: ImproveBulletsRequest,
    x_gemini_api_key: Optional[str] = Header(None),
):
    if not payload.bullets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one bullet point must be provided.",
        )

    analyzer = GeminiAnalyzer(api_key=x_gemini_api_key)
    try:
        # Mini analysis focused on bullets
        client = analyzer._get_client()
        bullets_text = "\n".join([f"- {b}" for b in payload.bullets])
        prompt = f"""Role: {payload.role}
Job Context: {payload.job_description or 'Standard industry benchmark'}
Bullets to improve:
{bullets_text}

Transform each bullet into a high-impact, professional bullet.
RULES:
1. Do NOT invent numbers, percentages, or achievements.
2. Insert clear placeholders like '[X%]' or '[Y requests/sec]' for missing metrics.
3. Use powerful active verbs.
Return JSON array of objects with keys: original, improved, explanation, action_verbs_used (array of strings), metrics_note."""

        from google.genai import types
        models_to_try = [
            os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
            "gemini-3.8-flash",
            "gemini-2.5-flash",
            "gemini-1.5-flash",
        ]
        response = None
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2,
                    ),
                )
                if response and response.text:
                    break
            except Exception:
                continue

        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Gemini failed to generate improved bullets.")

        import json

        raw = response.text.strip()
        data = json.loads(raw)
        if isinstance(data, dict) and "bullets" in data:
            data = data["bullets"]
        return [BulletImprovement(**b) for b in data]
    except GeminiKeyMissingError as e:
        raise HTTPException(status_code=503, detail={"code": "GEMINI_API_KEY_MISSING", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bullet improvement failed: {str(e)}")


@router.post(
    "/download-report",
    summary="Generate and download executive PDF evaluation report",
)
async def download_report_pdf(payload: Dict[str, Any]):
    """
    Accepts the complete analysis JSON response and generates a formatted ReportLab PDF.
    """
    if not payload or not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis payload provided.",
        )

    try:
        pdf_buffer = generate_pdf_report(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(e)}",
        )

    role_slug = re.sub(r"[^a-zA-Z0-9]+", "_", payload.get("selected_role", "Analysis")).strip("_")
    filename = f"ResumeAI_Report_{role_slug}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
