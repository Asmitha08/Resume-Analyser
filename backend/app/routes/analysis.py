import io
import os
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
from app.services.extractor import (
    extract_text_from_file,
    extract_text_and_metadata_from_file,
    validate_file_upload,
)
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
    job_description: Optional[str] = Form(None, description="Target job description (uses industry role benchmark if omitted)"),
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

    # Extract text and layout metadata
    try:
        resume_text, metadata = extract_text_and_metadata_from_file(file.filename or "resume.pdf", content)
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

    # Validate role and handle missing job description appropriately
    selected_role = role if role in SUPPORTED_ROLES else "Other"
    clean_jd = (job_description or "").strip()
    if len(clean_jd) < 20:
        clean_jd = EXAMPLE_JOB_DESCRIPTIONS.get(
            selected_role,
            EXAMPLE_JOB_DESCRIPTIONS.get("Software Developer", "Professional software development role requiring strong technical skills.")
        )

    # Analyze with Gemini & ATS Scanner
    analyzer = GeminiAnalyzer(api_key=x_gemini_api_key)
    try:
        result = analyzer.analyze_resume(
            resume_text=resume_text,
            role=selected_role,
            job_description=clean_jd,
            filename=file.filename or "Uploaded_Resume.pdf",
            metadata=metadata,
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
    clean_jd = (payload.job_description or "").strip()
    if len(clean_jd) < 20:
        clean_jd = EXAMPLE_JOB_DESCRIPTIONS.get(
            selected_role,
            EXAMPLE_JOB_DESCRIPTIONS.get("Software Developer", "Professional software development role requiring strong technical skills.")
        )
    analyzer = GeminiAnalyzer(api_key=x_gemini_api_key)

    try:
        result = analyzer.analyze_resume(
            resume_text=payload.resume_text,
            role=selected_role,
            job_description=clean_jd,
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
        results = analyzer.improve_bullets(
            bullets=payload.bullets,
            role=payload.role,
            job_description=payload.job_description or "",
        )
        return results
    except GeminiKeyMissingError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "GEMINI_API_KEY_MISSING", "message": str(e)},
        )
    except GeminiAnalysisError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": "GEMINI_ANALYSIS_FAILED", "message": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bullet improvement failed: {str(e)}",
        )


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
