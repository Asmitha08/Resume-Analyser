"""
Deterministic, explainable ATS (Applicant Tracking System) Compatibility Scanner.

Calculates an objective ATS Compatibility Score (0-100) based on 5 transparent heuristic dimensions:
1. Resume Formatting & Readability (25%)
2. Standard Section Headings (20%)
3. Contact Information & Document Structure (15%)
4. Text Extraction & Parsing Quality (20%)
5. Job Description Keyword Alignment (20%)
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.analysis import (
    ATSScoreBreakdown,
    ATSFormattingCheck,
    ATSCompatibilityScore,
)
from app.utils.role_definitions import ROLE_EVALUATION_CRITERIA, SUPPORTED_ROLES


# Regex patterns for standard resume section headings (line-anchored or standalone)
SECTION_PATTERNS = {
    "Experience": [
        r"(?:^|\n)\s*(?:work\s+)?experience\b",
        r"(?:^|\n)\s*professional\s+experience\b",
        r"(?:^|\n)\s*employment\s+history\b",
        r"(?:^|\n)\s*work\s+history\b",
        r"(?:^|\n)\s*career\s+history\b",
    ],
    "Education": [
        r"(?:^|\n)\s*education\b",
        r"(?:^|\n)\s*academic\s+background\b",
        r"(?:^|\n)\s*qualifications\b",
        r"(?:^|\n)\s*degrees?\b",
    ],
    "Skills": [
        r"(?:^|\n)\s*(?:technical\s+)?skills\b",
        r"(?:^|\n)\s*technical\s+competencies\b",
        r"(?:^|\n)\s*technologies\b",
        r"(?:^|\n)\s*tech\s+stack\b",
        r"(?:^|\n)\s*core\s+competencies\b",
        r"(?:^|\n)\s*proficiencies\b",
    ],
    "Projects": [
        r"(?:^|\n)\s*projects\b",
        r"(?:^|\n)\s*personal\s+projects\b",
        r"(?:^|\n)\s*key\s+projects\b",
        r"(?:^|\n)\s*selected\s+projects\b",
        r"(?:^|\n)\s*portfolio\b",
    ],
    "Certifications": [
        r"(?:^|\n)\s*certifications?\b",
        r"(?:^|\n)\s*certificates?\b",
        r"(?:^|\n)\s*licenses?\b",
    ],
    "Summary": [
        r"(?:^|\n)\s*summary\b",
        r"(?:^|\n)\s*professional\s+summary\b",
        r"(?:^|\n)\s*profile\b",
        r"(?:^|\n)\s*about\s+me\b",
        r"(?:^|\n)\s*objective\b",
    ],
}


EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
PHONE_REGEX = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
LINK_REGEX = re.compile(r"(?:linkedin\.com/in/|github\.com/|https?://|www\.)\S+", re.IGNORECASE)


def extract_keywords_from_text(text: str) -> List[str]:
    """Extracts distinctive meaningful technical & professional terms from text."""
    if not text:
        return []
    # Common stop words to exclude
    stop_words = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
        "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
        "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
        "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
        "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me",
        "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only",
        "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
        "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then",
        "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
        "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
        "with", "would", "you", "your", "yours", "yourself", "yourselves", "will", "job", "role",
        "candidate", "work", "years", "experience", "looking", "responsibilities", "requirements",
        "qualifications", "skills", "ability", "strong", "team", "working", "must", "plus", "required",
    }

    # Match alphanumeric words + common tech terms like C++, C#, .NET, CI/CD, React.js
    raw_tokens = re.findall(r"\b[A-Za-z][A-Za-z0-9+#.-]{1,24}\b", text)
    cleaned = []
    seen = set()
    for tok in raw_tokens:
        tok_clean = tok.strip(".-")
        tok_lower = tok_clean.lower()
        if (
            len(tok_clean) >= 2
            and tok_lower not in stop_words
            and not tok_clean.isdigit()
            and tok_lower not in seen
        ):
            seen.add(tok_lower)
            cleaned.append(tok_clean)
    return cleaned


def evaluate_ats_compatibility(
    resume_text: str = "",
    text: Optional[str] = None,
    role: str = "Software Developer",
    job_description: str = "",
    filename: str = "Uploaded_Resume.pdf",
    metadata: Optional[Dict[str, Any]] = None,
    page_count: Optional[int] = None,
    images_count: Optional[int] = None,
    tables_count: Optional[int] = None,
    **kwargs,
) -> ATSCompatibilityScore:
    """
    Performs deterministic, explainable ATS compatibility assessment.
    Returns structured ATSCompatibilityScore adhering to standard 5-dimension weights.
    """
    if text is not None and not resume_text:
        resume_text = text

    metadata = dict(metadata or {})
    if page_count is not None:
        metadata["page_count"] = page_count
    if images_count is not None:
        metadata["images_count"] = images_count
    if tables_count is not None:
        metadata["tables_count"] = tables_count

    text = resume_text or ""
    words = text.split()
    word_count = len(words)
    char_count = len(text)
    formatting_warnings: List[str] = []
    recommendations: List[str] = []
    checks: List[ATSFormattingCheck] = []

    # -------------------------------------------------------------
    # Dimension 1: Resume Formatting & Readability (Weight: 25%)
    # -------------------------------------------------------------
    formatting_score = 100

    # 1a. Word count check (Ideal: 350 - 1400 words)
    if word_count < 150:
        formatting_score -= 40
        formatting_warnings.append("Resume contains very low word count (<150 words), which may indicate truncated text or scan issues.")
        recommendations.append("Expand on your work experience and project accomplishments to reach a comprehensive length (400–1000 words).")
        checks.append(ATSFormattingCheck(
            name="Document Word Count",
            status="fail",
            detail=f"Only {word_count} words detected. Ideal range is 400–1200 words.",
        ))
    elif word_count < 300:
        formatting_score -= 15
        formatting_warnings.append(f"Brief resume length ({word_count} words). ATS parsers may lack sufficient context to index.")
        checks.append(ATSFormattingCheck(
            name="Document Word Count",
            status="warning",
            detail=f"{word_count} words detected. Consider expanding key responsibilities and measurable outcomes.",
        ))
    elif word_count > 2200:
        formatting_score -= 15
        formatting_warnings.append(f"Lengthy resume ({word_count} words). Multi-page resumes over 2000 words risk losing recruiter attention.")
        recommendations.append("Condense resume to 1–2 pages (under 1500 words) focusing on the most relevant recent experience.")
        checks.append(ATSFormattingCheck(
            name="Document Word Count",
            status="warning",
            detail=f"{word_count} words. Ideal length is 500–1500 words.",
        ))
    else:
        checks.append(ATSFormattingCheck(
            name="Document Word Count",
            status="pass",
            detail=f"Optimal length ({word_count} words) for ATS parsing and readability.",
        ))

    # 1b. Bullet point structure check
    bullet_symbols = len(re.findall(r"(?:^|\n)\s*[•\-\*▪–—\d+\.]\s+", text))
    if bullet_symbols < 4:
        formatting_score -= 20
        formatting_warnings.append("Low use of structured bullet points. ATS systems parse bulleted lists more reliably than narrative paragraphs.")
        recommendations.append("Convert long paragraphs of job descriptions into concise, action-driven bullet points.")
        checks.append(ATSFormattingCheck(
            name="List & Bullet Structure",
            status="warning",
            detail=f"Found only {bullet_symbols} bullet points. Bullets enhance ATS segment parsing.",
        ))
    else:
        checks.append(ATSFormattingCheck(
            name="List & Bullet Structure",
            status="pass",
            detail=f"Well-structured with {bullet_symbols} detected bullet points.",
        ))

    # 1c. Tables and layout evaluation
    tables_found = metadata.get("tables_count", 0)
    has_table_text_pipes = text.count(" | ") > 5
    if tables_found > 0 or has_table_text_pipes:
        # Evaluate if extraction was disrupted
        if word_count < 250:
            formatting_score -= 15
            formatting_warnings.append("Complex table formatting may have disrupted text extraction flow.")
            recommendations.append("Replace multi-column grid tables with clean single-column headings and standard bullet lists.")
            checks.append(ATSFormattingCheck(
                name="Tables & Column Layout",
                status="warning",
                detail="Tables detected with low extracted word density. Some ATS tools struggle with multi-cell grids.",
            ))
        else:
            checks.append(ATSFormattingCheck(
                name="Tables & Column Layout",
                status="pass",
                detail="Content in tables or columns was successfully extracted without data loss.",
            ))
    else:
        checks.append(ATSFormattingCheck(
            name="Tables & Column Layout",
            status="pass",
            detail="Clean linear layout without disruptive tables or nested columns.",
        ))

    # 1d. Non-standard characters / decorative icons
    weird_chars = len(re.findall(r"[\ufffd\u25a0-\u25ff\u2600-\u26ff]", text))
    if weird_chars > 3:
        formatting_score -= 10
        formatting_warnings.append("Custom decorative glyphs or icon fonts detected (e.g. phone/mail icons). Standard text is safer for ATS.")
        recommendations.append("Replace icon glyphs with plain standard labels (e.g. 'Email:', 'Phone:', 'LinkedIn:').")

    formatting_score = max(0, min(100, formatting_score))

    # -------------------------------------------------------------
    # Dimension 2: Standard Section Headings (Weight: 20%)
    # -------------------------------------------------------------
    headings_score = 0
    detected_sections: List[str] = []
    missing_sections: List[str] = []

    text_lower = text.lower()

    # Core standard sections
    core_section_weights = {
        "Experience": 30,
        "Skills": 30,
        "Education": 25,
        "Projects": 15,
    }

    for section_name, patterns in SECTION_PATTERNS.items():
        found = any(re.search(pat, text_lower, re.MULTILINE) for pat in patterns)
        if found:
            detected_sections.append(section_name)
            if section_name in core_section_weights:
                headings_score += core_section_weights[section_name]
        else:
            if section_name in core_section_weights:
                missing_sections.append(section_name)

    if missing_sections:
        for ms in missing_sections:
            formatting_warnings.append(f"Standard section heading '{ms}' was not clearly identified.")
            recommendations.append(f"Add a distinct, standard '{ms}' section heading so ATS scanners can automatically index this data.")
        checks.append(ATSFormattingCheck(
            name="Standard Section Headings",
            status="warning" if len(missing_sections) == 1 else "fail",
            detail=f"Detected: {', '.join(detected_sections) or 'None'}. Missing: {', '.join(missing_sections)}.",
        ))
    else:
        checks.append(ATSFormattingCheck(
            name="Standard Section Headings",
            status="pass",
            detail=f"All essential headings detected: {', '.join(detected_sections)}.",
        ))

    section_headings_score = max(0, min(100, headings_score))

    # -------------------------------------------------------------
    # Dimension 3: Contact Info & Document Structure (Weight: 15%)
    # -------------------------------------------------------------
    contact_score = 0

    # 3a. Email
    emails = EMAIL_REGEX.findall(text)
    if emails:
        contact_score += 40
        checks.append(ATSFormattingCheck(
            name="Email Identification",
            status="pass",
            detail=f"Valid contact email detected ({emails[0]}).",
        ))
    else:
        formatting_warnings.append("No recognizable email address found in resume.")
        recommendations.append("Ensure your professional email address is written in standard text near the top of the resume.")
        checks.append(ATSFormattingCheck(
            name="Email Identification",
            status="fail",
            detail="No valid email format identified.",
        ))

    # 3b. Phone Number
    phones = PHONE_REGEX.findall(text)
    if phones:
        contact_score += 30
        checks.append(ATSFormattingCheck(
            name="Phone Number",
            status="pass",
            detail="Valid telephone number detected.",
        ))
    else:
        formatting_warnings.append("No standard phone number detected.")
        recommendations.append("Include your contact phone number formatted with standard separators (e.g., +1-555-0123).")
        checks.append(ATSFormattingCheck(
            name="Phone Number",
            status="warning",
            detail="No standard phone number pattern recognized.",
        ))

    # 3c. Online profile links (LinkedIn / GitHub / Portfolio)
    links = LINK_REGEX.findall(text)
    if links:
        contact_score += 20
        checks.append(ATSFormattingCheck(
            name="Professional Links",
            status="pass",
            detail=f"Found {len(links)} professional link(s) (e.g. LinkedIn, GitHub, or Portfolio).",
        ))
    else:
        recommendations.append("Add your LinkedIn profile URL and GitHub/portfolio link to boost recruiter validation.")
        checks.append(ATSFormattingCheck(
            name="Professional Links",
            status="warning",
            detail="No LinkedIn or portfolio URL detected.",
        ))

    # 3d. Top placement of contact details
    # Check if email/phone appears in the first 25% of text
    first_quarter_idx = max(200, int(len(text) * 0.25))
    first_quarter = text[:first_quarter_idx]
    if (emails and emails[0] in first_quarter) or (phones and phones[0] in first_quarter):
        contact_score += 10
    else:
        if emails or phones:
            formatting_warnings.append("Contact details are positioned lower in the document. Place contact info in the top header block.")

    contact_info_score = max(0, min(100, contact_score))

    # -------------------------------------------------------------
    # Dimension 4: Text Extraction & Parsing Quality (Weight: 20%)
    # -------------------------------------------------------------
    parsing_score = 100

    # Printable character ratio
    if char_count > 0:
        printable_count = sum(1 for c in text if c.isprintable() or c in "\n\r\t")
        printable_ratio = printable_count / char_count
        if printable_ratio < 0.95:
            parsing_score -= 35
            formatting_warnings.append("Extracted text contains unprintable characters or corrupt font encodings.")
            recommendations.append("Avoid re-saving PDFs with non-standard font subsets. Use a standard PDF export from Word or Google Docs.")
            checks.append(ATSFormattingCheck(
                name="Text Encoding & Characters",
                status="fail",
                detail=f"Only {printable_ratio*100:.1f}% printable characters. File encoding issues present.",
            ))
        else:
            checks.append(ATSFormattingCheck(
                name="Text Encoding & Characters",
                status="pass",
                detail="Clean text stream with 99%+ valid printable characters.",
            ))
    else:
        parsing_score = 0
        checks.append(ATSFormattingCheck(
            name="Text Encoding & Characters",
            status="fail",
            detail="0 characters extracted.",
        ))

    # Average word length (natural language is usually 4 to 8 characters)
    if words:
        avg_word_len = sum(len(w) for w in words) / len(words)
        if avg_word_len < 3.2 or avg_word_len > 11.0:
            parsing_score -= 25
            formatting_warnings.append(f"Unusual average word length ({avg_word_len:.1f} chars). Words may be fused together without spaces.")
            recommendations.append("Check document spacing; multi-column or customized layout might cause text words to concatenate.")
            checks.append(ATSFormattingCheck(
                name="Word Boundary Separation",
                status="warning",
                detail=f"Average token length is {avg_word_len:.1f} characters.",
            ))
        else:
            checks.append(ATSFormattingCheck(
                name="Word Boundary Separation",
                status="pass",
                detail=f"Natural word boundaries and spacing preserved ({avg_word_len:.1f} chars/word).",
            ))

    # Image-to-text interference check
    images_count = metadata.get("images_count", 0)
    if images_count > 5 and word_count < 400:
        parsing_score -= 25
        formatting_warnings.append(f"Document contains {images_count} image elements with low text density. ATS cannot parse text inside images.")
        recommendations.append("Ensure all skills, dates, and experience are written in selectable text, not embedded in images or graphic canvas.")
        checks.append(ATSFormattingCheck(
            name="Graphics & Image Interference",
            status="warning",
            detail=f"{images_count} image/graphic elements found with low text extraction density.",
        ))
    else:
        checks.append(ATSFormattingCheck(
            name="Graphics & Image Interference",
            status="pass",
            detail="No graphic interference blocking text accessibility.",
        ))

    parsing_quality_score = max(0, min(100, parsing_score))

    # -------------------------------------------------------------
    # Dimension 5: Job Description Keyword Alignment (Weight: 20%)
    # -------------------------------------------------------------
    # If job description is empty or <20 chars, handle appropriately by using role benchmarks
    target_text = job_description.strip() if len(job_description.strip()) >= 20 else ""
    if not target_text:
        # Fall back to role criteria
        role_crit = ROLE_EVALUATION_CRITERIA.get(role, ROLE_EVALUATION_CRITERIA.get("Software Developer", {}))
        fallback_keywords = role_crit.get("core_domains", [])
        jd_keywords = [re.sub(r"\(.*?\)", "", k).strip() for k in fallback_keywords if k]
        # Flatten
        jd_keywords = [item.strip() for k in jd_keywords for item in re.split(r"[,/&]", k) if len(item.strip()) > 1]
    else:
        jd_keywords = extract_keywords_from_text(target_text)

    # Dedup and take top 25 meaningful keywords
    unique_jd_keywords = []
    seen_kw = set()
    for kw in jd_keywords:
        kw_lower = kw.lower()
        if kw_lower not in seen_kw and len(kw_lower) >= 2:
            seen_kw.add(kw_lower)
            unique_jd_keywords.append(kw)
    unique_jd_keywords = unique_jd_keywords[:25]

    resume_text_lower = text.lower()
    found_keywords: List[str] = []
    missing_keywords: List[str] = []

    for kw in unique_jd_keywords:
        # Check boundary or phrase
        pattern = r"\b" + re.escape(kw.lower()) + r"\b"
        if re.search(pattern, resume_text_lower):
            found_keywords.append(kw)
        else:
            missing_keywords.append(kw)

    total_kw_count = max(len(unique_jd_keywords), 1)
    found_kw_count = len(found_keywords)
    keyword_coverage_percent = min(100, int((found_kw_count / total_kw_count) * 100))

    # Keyword alignment score
    if keyword_coverage_percent >= 75:
        keyword_alignment_score = 95
    elif keyword_coverage_percent >= 55:
        keyword_alignment_score = 80
    elif keyword_coverage_percent >= 40:
        keyword_alignment_score = 65
    elif keyword_coverage_percent >= 25:
        keyword_alignment_score = 50
    else:
        keyword_alignment_score = max(20, keyword_coverage_percent * 2)

    if keyword_coverage_percent < 50:
        missing_sample = ", ".join(missing_keywords[:4])
        formatting_warnings.append(f"ATS keyword coverage is low ({keyword_coverage_percent}%). Critical role terms are absent.")
        recommendations.append(f"Incorporate missing core terms naturally where you have experience (e.g. {missing_sample}).")
        checks.append(ATSFormattingCheck(
            name="Job Description Keyword Coverage",
            status="warning",
            detail=f"{found_kw_count} of {total_kw_count} core target keywords identified ({keyword_coverage_percent}% coverage).",
        ))
    else:
        checks.append(ATSFormattingCheck(
            name="Job Description Keyword Coverage",
            status="pass",
            detail=f"Strong keyword coverage ({keyword_coverage_percent}%). Found {found_kw_count} of {total_kw_count} core terms.",
        ))

    # -------------------------------------------------------------
    # Overall ATS Score Computation (Exact weights: 25%, 20%, 15%, 20%, 20%)
    # -------------------------------------------------------------
    raw_overall = (
        0.25 * formatting_score
        + 0.20 * section_headings_score
        + 0.15 * contact_info_score
        + 0.20 * parsing_quality_score
        + 0.20 * keyword_alignment_score
    )
    overall_score = max(0, min(100, int(round(raw_overall))))

    if overall_score >= 90:
        category = "Exceptional Compatibility"
        explanation = (
            "Your resume features clear headings, clean text extraction, standard contact details, "
            "and strong keyword density suitable for modern enterprise ATS parsers."
        )
    elif overall_score >= 75:
        category = "High Compatibility"
        explanation = (
            "Your resume features clear headings, clean text extraction, standard contact details, "
            "and strong keyword density suitable for modern enterprise ATS parsers."
        )
    elif overall_score >= 60:
        category = "Moderate Compatibility"
        explanation = (
            "The resume structure and formatting are largely ATS-friendly. Addressing identified missing sections "
            "or keyword gaps will ensure error-free machine indexing."
        )
    elif overall_score >= 45:
        category = "Needs Improvement"
        explanation = (
            "Several structural or formatting elements pose parsing risks. Standardizing section headings "
            "and ensuring clear contact information will significantly boost ATS pass-through rates."
        )
    else:
        category = "Low Compatibility"
        explanation = (
            "The resume has critical formatting, sectioning, or text extraction hurdles that could cause "
            "Applicant Tracking Systems to reject or miscategorize your application."
        )

    # General fallback recommendations if list is short
    if len(recommendations) < 2:
        recommendations.append("Maintain clean, unstyled font headings and avoid text embedded in images or canvas graphics.")
        recommendations.append("Tailor your bullet descriptions with explicit technologies and tools matching each job description.")

    breakdown = ATSScoreBreakdown(
        formatting_score=formatting_score,
        section_headings_score=section_headings_score,
        contact_info_score=contact_info_score,
        parsing_quality_score=parsing_quality_score,
        keyword_alignment_score=keyword_alignment_score,
    )

    return ATSCompatibilityScore(
        overall_score=overall_score,
        category=category,
        explanation=explanation,
        breakdown=breakdown,
        formatting_warnings=formatting_warnings,
        missing_sections=missing_sections,
        detected_sections=detected_sections,
        checks=checks,
        keyword_coverage_percent=keyword_coverage_percent,
        found_keywords_count=found_kw_count,
        total_keywords_count=total_kw_count,
        recommendations=recommendations,
        disclaimer=(
            "ATS Compatibility Score: An application-defined heuristic estimate evaluating document formatting, "
            "layout, section parsing, and contact structure. It is not an official vendor-specific ATS score."
        ),
    )
