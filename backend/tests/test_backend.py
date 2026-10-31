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

    old_key = os.environ.get("GEMINI_API_KEY")
    os.environ["GEMINI_API_KEY"] = ""
    try:
        with open(pdf_path, "rb") as f:
            res = client.post(
                "/api/analyze",
                files={"file": ("sample_test_resume.pdf", f, "application/pdf")},
                data={
                    "role": "Software Developer",
                    "job_description": "We are seeking a Software Developer with experience in Python and SQL.",
                },
            )
        assert res.status_code == 503
        data = res.json()
        assert "detail" in data
        assert data["detail"]["code"] == "GEMINI_API_KEY_MISSING"
    finally:
        if old_key is not None:
            os.environ["GEMINI_API_KEY"] = old_key


def test_ats_scanner():
    from app.services.ats_scanner import evaluate_ats_compatibility

    sample_text = """
    Alex Morgan
    Email: alex.morgan@example.com | Phone: (555) 234-5678 | San Francisco, CA | linkedin.com/in/alexmorgan
    
    Professional Summary
    Dedicated Software Developer with 3+ years experience building scalable web applications.
    
    Work Experience
    Software Engineer | Tech Corp (2022 - Present)
    - Developed RESTful APIs in Python and FastAPI, handling 10,000 requests per minute.
    - Optimized PostgreSQL database queries, reducing average latency by [insert actual metric].
    
    Education
    B.S. in Computer Science | University of California (2018 - 2022)
    
    Skills
    Python, FastAPI, SQL, PostgreSQL, Docker, Git, CI/CD, React
    
    Projects
    Personal Task Manager: Built full-stack Kanban application using React and FastAPI.
    """

    ats_result = evaluate_ats_compatibility(
        text=sample_text,
        role="Software Developer",
        job_description="Looking for a Software Developer with Python, FastAPI, Docker, and PostgreSQL experience.",
        page_count=1,
        images_count=0,
        tables_count=1,
    )

    # Validate overall score and category
    assert 0 <= ats_result["overall_score"] <= 100
    assert ats_result["category"] in ["Exceptional Compatibility", "High Compatibility", "Moderate Compatibility", "Needs Improvement", "Low Compatibility"]

    # Validate 5 weighted breakdown dimensions
    bd = ats_result["breakdown"]
    assert 0 <= bd["formatting_score"] <= 100
    assert 0 <= bd["section_headings_score"] <= 100
    assert 0 <= bd["contact_info_score"] <= 100
    assert 0 <= bd["parsing_quality_score"] <= 100
    assert 0 <= bd["keyword_alignment_score"] <= 100

    # Validate section detection
    detected = ats_result["detected_sections"]
    assert "Experience" in detected
    assert "Education" in detected
    assert "Skills" in detected
    assert "Projects" in detected

    # Validate checks
    checks = ats_result["checks"]
    assert len(checks) >= 5
    for c in checks:
        assert "name" in c
        assert c["status"] in ["pass", "warning", "fail"]
        assert "detail" in c

    # Validate keyword coverage
    assert ats_result["keyword_coverage_percent"] > 0
    assert ats_result["found_keywords_count"] > 0
    assert ats_result["total_keywords_count"] > 0


def test_ats_with_real_pdf_and_docx():
    from app.services.extractor import extract_text_and_metadata_from_file
    from app.services.ats_scanner import evaluate_ats_compatibility

    fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures")
    pdf_path = os.path.join(fixtures_dir, "sample_test_resume.pdf")
    docx_path = os.path.join(fixtures_dir, "sample_test_resume.docx")

    # Test real PDF
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    pdf_text, pdf_meta = extract_text_and_metadata_from_file("sample_test_resume.pdf", pdf_bytes)
    assert len(pdf_text) > 200
    pdf_ats = evaluate_ats_compatibility(
        text=pdf_text,
        role="Software Developer",
        job_description="Python, FastAPI, SQL, Git",
        page_count=pdf_meta.get("page_count", 1),
        images_count=pdf_meta.get("images_count", 0),
        tables_count=pdf_meta.get("tables_count", 0),
    )
    assert pdf_ats["overall_score"] >= 60
    assert len(pdf_ats["detected_sections"]) >= 3

    # Test real DOCX
    with open(docx_path, "rb") as f:
        docx_bytes = f.read()
    docx_text, docx_meta = extract_text_and_metadata_from_file("sample_test_resume.docx", docx_bytes)
    assert len(docx_text) > 200
    docx_ats = evaluate_ats_compatibility(
        text=docx_text,
        role="Software Developer",
        job_description="Python, FastAPI, SQL, Git",
        page_count=docx_meta.get("page_count", 1),
        images_count=docx_meta.get("images_count", 0),
        tables_count=docx_meta.get("tables_count", 0),
    )
    assert docx_ats["overall_score"] >= 60
    assert len(docx_ats["detected_sections"]) >= 3


if __name__ == "__main__":
    test_file_validation()
    test_pdf_and_docx_extraction()
    test_role_definitions()
    test_ats_scanner()
    test_ats_with_real_pdf_and_docx()
    test_reportlab_pdf_generation()
    test_api_health_endpoint()
    test_api_roles_endpoint()
    test_api_download_report_endpoint()
    test_api_analyze_missing_key_behavior()
    print("ALL 10 BACKEND TESTS PASSED SUCCESSFULLY!")

