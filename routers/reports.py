"""
reports.py

Handles endpoints related to medical report processing:
- Upload medical images
- Generate reports from uploaded images
- (Later) Save & download report as PDF

Connected to the MedicalReport model and user authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from typing import List
import shutil
import os
from uuid import uuid4

from models import MedicalReport, User
from database import SessionLocal
from schemas import ReportResponse
from utils.security import verify_token

router = APIRouter(prefix="/reports", tags=["Reports"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get the current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# Upload image(s) and generate mock report
@router.post("/upload", response_model=ReportResponse)
def upload_image_and_generate_report(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_dir = "uploaded_images/"
    os.makedirs(upload_dir, exist_ok=True)

    # Save all images locally
    filenames = []
    for file in files:
        file_ext = file.filename.split(".")[-1]
        file_name = f"{uuid4()}.{file_ext}"
        file_path = os.path.join(upload_dir, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        filenames.append(file_name)

    # ✨ TODO: Pass images to CLARA -> PALEMERA to generate actual report
    # For now, we simulate this
    simulated_report = f"Mock diagnosis result for uploaded images: {', '.join(filenames)}."

    # Save to DB
    report = MedicalReport(
        user_id=current_user.id,
        report_data=simulated_report
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return ReportResponse(
        id=report.id,
        report_data=report.report_data,
        user_id=current_user.id
    )