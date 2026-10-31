"""
Resume text extraction service supporting PDF and DOCX files.
Uses PyMuPDF (pymupdf) for PDF extraction and python-docx for DOCX files.
"""

import io
import re
from typing import Tuple
import pymupdf
import docx

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def validate_file_upload(filename: str, file_size: int) -> Tuple[bool, str]:
    """
    Validates file extension and size.
    Returns (is_valid, error_message).
    """
    if not filename:
        return False, "Filename cannot be empty."

    # Check extension
    lower_name = filename.lower()
    has_valid_ext = any(lower_name.endswith(ext) for ext in ALLOWED_EXTENSIONS)
    if not has_valid_ext:
        return False, f"Unsupported file type. Only PDF and DOCX files are allowed (received '{filename}')."

    # Check size
    if file_size > MAX_FILE_SIZE_BYTES:
        return False, f"File size exceeds the 10 MB limit (received {file_size / (1024 * 1024):.2f} MB)."

    if file_size <= 0:
        return False, "Uploaded file is empty (0 bytes)."

    return True, ""


def clean_extracted_text(raw_text: str) -> str:
    """Cleans up whitespace and artifacts while preserving structure."""
    if not raw_text:
        return ""
    # Normalize unicode spaces
    text = raw_text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")
    # Collapse multiple consecutive empty lines to two
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse multiple horizontal whitespace
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def extract_text_from_pdf(content: bytes) -> str:
    """Extracts text from PDF bytes using PyMuPDF."""
    try:
        doc = pymupdf.open(stream=content, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Failed to open PDF document: {str(e)}")

    if doc.is_encrypted:
        raise ValueError("Password-protected or encrypted PDF files are not supported. Please remove the password and try again.")

    extracted_pages = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        page_text = page.get_text("text")
        if page_text and page_text.strip():
            extracted_pages.append(page_text.strip())

    full_text = "\n\n".join(extracted_pages)
    cleaned = clean_extracted_text(full_text)

    if not cleaned or len(cleaned) < 50:
        raise ValueError(
            "The uploaded PDF contains insufficient selectable text. "
            "If your resume is a scanned image, please export it with selectable text or upload a DOCX file."
        )

    return cleaned


def extract_text_from_docx(content: bytes) -> str:
    """Extracts text from DOCX bytes using python-docx."""
    try:
        doc_stream = io.BytesIO(content)
        document = docx.Document(doc_stream)
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX document: {str(e)}")

    text_parts = []
    # Extract paragraphs
    for para in document.paragraphs:
        if para.text and para.text.strip():
            text_parts.append(para.text.strip())

    # Extract tables (many resumes format experience or skills in tables)
    for table in document.tables:
        for row in table.rows:
            row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_cells:
                text_parts.append(" | ".join(row_cells))

    full_text = "\n".join(text_parts)
    cleaned = clean_extracted_text(full_text)

    if not cleaned or len(cleaned) < 50:
        raise ValueError("The uploaded DOCX file contains insufficient text. Please verify your document contents.")

    return cleaned


def extract_text_from_file(filename: str, content: bytes) -> str:
    """
    Dispatcher to extract text based on filename extension.
    """
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(content)
    elif lower.endswith(".docx"):
        return extract_text_from_docx(content)
    else:
        raise ValueError(f"Unsupported file format for '{filename}'. Only .pdf and .docx are supported.")
