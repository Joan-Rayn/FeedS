import os
import magic
from fastapi import UploadFile, HTTPException
from typing import List

ALLOWED_MIME_TYPES = {
    # Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],

    # Documents
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],

    # Archives
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_FILES_PER_UPLOAD = 5

def validate_file_upload(file: UploadFile) -> None:
    """Validate a single uploaded file"""
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024)}MB"
        )

    # Read file content to check MIME type
    content = file.file.read()
    file.file.seek(0)  # Reset file pointer

    # Detect MIME type
    mime_type = magic.from_buffer(content, mime=True)

    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Detected: {mime_type}"
        )

    # Check file extension matches MIME type
    filename = file.filename.lower()
    file_extension = os.path.splitext(filename)[1]

    if file_extension not in ALLOWED_MIME_TYPES[mime_type]:
        raise HTTPException(
            status_code=400,
            detail=f"File extension {file_extension} does not match detected MIME type {mime_type}"
        )

def validate_multiple_files(files: List[UploadFile]) -> None:
    """Validate multiple uploaded files"""
    if len(files) > MAX_FILES_PER_UPLOAD:
        raise HTTPException(
            status_code=413,
            detail=f"Too many files. Maximum {MAX_FILES_PER_UPLOAD} files allowed"
        )

    for file in files:
        validate_file_upload(file)

def get_secure_filename(filename: str) -> str:
    """Generate a secure filename"""
    import uuid
    name, ext = os.path.splitext(filename)
    return f"{uuid.uuid4().hex}{ext}"