"""
Integration and Unit Tests for ResumeAI Backend
"""

import os
import sys
import io

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient



from app.main import app
from app.services.extractor import (
    validate_file_upload,
    extract_text_from_file,
    clean_extracted_text,
)
from app.services.report_generator import generate_pdf_report
from app.utils.role_definitions import (
    SUPPORTED_ROLES,
    ROLE_EVALUATION_CRITERIA,
    EXAMPLE_JOB_DESCRIPTIONS,
    get_role_prompt_guidance,
)

client = TestClient(app)


def test_file_validation():
    # Valid
    is_valid, msg = validate_file_upload("resume.pdf", 1024)
    assert is_valid is True
    assert msg == ""

    is_valid, msg = validate_file_upload("resume.docx", 2048)
    assert is_valid is True

    # Invalid extension
    is_valid, msg = validate_file_upload("resume.txt", 1024)
    assert is_valid is False
    assert "Unsupported file type" in msg

    # Oversized file (>10MB)
    is_valid, msg = validate_file_upload("resume.pdf", 11 * 1024 * 1024)
    assert is_valid is False
    assert "exceeds" in msg

    # Empty file
    is_valid, msg = validate_file_upload("resume.pdf", 0)
    assert is_valid is False
    assert "empty" in msg


def test_pdf_and_docx_extraction():
    fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures")
    pdf_path = os.path.join(fixtures_dir, "sample_test_resume.pdf")
    docx_path = os.path.join(fixtures_dir, "sample_test_resume.docx")

    # Read generated sample PDF
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    pdf_text = extract_text_from_file("sample_test_resume.pdf", pdf_bytes)
    assert "Alex Morgan" in pdf_text
    assert "Software Developer" in pdf_text
    assert "FastAPI" in pdf_text

    # Read generated sample DOCX
    with open(docx_path, "rb") as f:
        docx_bytes = f.read()

    docx_text = extract_text_from_file("sample_test_resume.docx", docx_bytes)
    assert "Alex Morgan" in docx_text
    assert "FastAPI" in docx_text



def test_role_definitions():
    assert len(SUPPORTED_ROLES) >= 6
    assert "Software Developer" in SUPPORTED_ROLES
    assert "Data Analyst" in SUPPORTED_ROLES
    assert "AI/ML Engineer" in SUPPORTED_ROLES

    for role in ["Software Developer", "Data Analyst", "AI/ML Engineer"]:
        guidance = get_role_prompt_guidance(role)
        assert role in guidance
        assert "Do NOT penalize" in guidance


def test_reportlab_pdf_generation():
    mock_payload = {
        "candidate_name": "Test Candidate",
        "filename": "TestResume.pdf",
        "selected_role": "Software Developer",
        "job_title": "Junior Software Developer",
        "created_at": "October 31, 2026",
        "match_score": {
            "overall_score": 82,
            "match_category": "Strong Match",
            "explanation": "Solid alignment on Python and database development.",
            "score_breakdown": {
                "skills_score": 85,
                "keywords_score": 80,
                "experience_score": 82,
                "education_score": 80,
            },
            "disclaimer": "AI Job Match Estimate: Not a real ATS score.",
        },
        "skills_analysis": {
            "matching_skills": ["Python", "FastAPI", "PostgreSQL", "Git"],
            "missing_skills": ["Docker", "Kubernetes"],
            "additional_skills": ["Redis", "TailwindCSS"],
            "skill_category_scores": [
                {"category": "Languages", "candidate_score": 90, "required_score": 85},
                {"category": "Databases", "candidate_score": 80, "required_score": 75},
            ],
        },
        "keyword_analysis": {
            "found_keywords": ["REST", "OOP", "CI/CD"],
            "missing_keywords": ["Microservices"],
            "important_job_keywords": ["Python", "OOP", "Microservices"],
        },
        "strengths": {
            "strong_sections": ["Clear technical stack summary"],
            "relevant_projects": ["High-throughput API project"],
            "relevant_experience": ["Full-stack intern experience"],
        },
        "improvement_areas": {
            "weak_bullet_points": ["Assisted with database tasks"],
            "missing_information": ["Add metric on latency improvement"],
            "formatting_and_clarity": ["Use consistent bullet spacing"],
        },
        "bullet_improvements": [
            {
                "original": "Worked on backend APIs for user auth",
                "improved": "Architected secure OAuth2 authentication microservices, reducing unauthorized login attempts by [X%].",
                "explanation": "Active verb and business outcome framing.",
                "action_verbs_used": ["Architected", "Secured"],
                "metrics_note": "Replace [X%] with your verified reduction.",
            }
        ],
        "skill_gap_roadmap": {
            "high_priority": [
                {
                    "skill_name": "Docker & Containers",
                    "priority": "High",
                    "what_to_learn": "Dockerfiles, image layers, multi-stage builds, docker-compose",
                    "why_it_matters": "Core requirement in modern deployment pipelines",
                    "recommended_order": 1,
                    "mini_project": "Containerize a FastAPI app with PostgreSQL and Redis compose.",
                }
            ],
            "thirty_day_plan": [
                {
                    "week_number": 1,
                    "focus_theme": "Docker fundamentals",
                    "tasks": ["Read docs", "Write Dockerfile"],
                    "milestone_deliverable": "Working Docker image",
                }
            ],
        },
        "personalized_recommendations": [
            "Add Docker containerization to your featured project.",
            "Include GitHub links to your repositories.",
        ],
    }

    pdf_buf = generate_pdf_report(mock_payload)
    assert isinstance(pdf_buf, io.BytesIO)
    content = pdf_buf.getvalue()
    assert len(content) > 1000
    assert content.startswith(b"%PDF")  # Valid PDF header magic bytes!


def test_api_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "gemini_configured" in data


def test_api_roles_endpoint():
    res = client.get("/api/roles")
    assert res.status_code == 200
    data = res.json()
    assert "supported_roles" in data
    assert "Software Developer" in data["supported_roles"]
    assert "example_job_descriptions" in data


def test_api_download_report_endpoint():
    mock_payload = {
        "candidate_name": "Alex Morgan",
        "selected_role": "Software Developer",
        "match_score": {
            "overall_score": 85,
            "match_category": "Exceptional Match",
            "explanation": "Superb match",
            "score_breakdown": {
                "skills_score": 90,
                "keywords_score": 85,
                "experience_score": 80,
                "education_score": 85,
            },
        },
    }
    res = client.post("/api/download-report", json=mock_payload)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert "ResumeAI_Report" in res.headers["content-disposition"]
    assert res.content.startswith(b"%PDF")


def test_api_analyze_missing_key_behavior():
    # When no key is set and none provided in header, it should return 503 with clear message
    # rather than faking results
    fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures")
    pdf_path = os.path.join(fixtures_dir, "sample_test_resume.pdf")

    with open(pdf_path, "rb") as f:
        res = client.post(
            "/api/analyze",
            files={"file": ("sample_test_resume.pdf", f, "application/pdf")},
            data={
                "role": "Software Developer",
                "job_description": "We are seeking a Software Developer with experience in Python and SQL.",
            },
        )

    # If GEMINI_API_KEY is not in env, should return 503
    # If GEMINI_API_KEY is in env, will run real analysis
    if not os.getenv("GEMINI_API_KEY"):
        assert res.status_code == 503
        data = res.json()
        assert "detail" in data
        assert data["detail"]["code"] == "GEMINI_API_KEY_MISSING"


if __name__ == "__main__":
    test_file_validation()
    test_pdf_and_docx_extraction()
    test_role_definitions()
    test_reportlab_pdf_generation()
    test_api_health_endpoint()
    test_api_roles_endpoint()
    test_api_download_report_endpoint()
    test_api_analyze_missing_key_behavior()
    print("ALL 8 BACKEND TESTS PASSED SUCCESSFULLY!")
