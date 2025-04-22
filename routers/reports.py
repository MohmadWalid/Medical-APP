"""
reports.py

Handles endpoints related to medical report processing:
- Upload medical images
- Generate reports from uploaded images
- Manage reports (CRUD operations)
- Download reports as PDF

Connected to the MedicalReport model and user authentication.
"""
from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException, 
    File, 
    UploadFile, 
    status,
    Response
)
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from uuid import uuid4
from datetime import datetime
from pathlib import Path

from models import MedicalReport, User
from database import get_db
from schemas import (
    ReportCreate,
    ReportResponse,
    ReportUpdate,
    ReportList,
    MessageResponse
)
from utils.security import get_current_active_user
from utils.pdf_generator import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

# Constants
UPLOAD_DIR = Path("static/uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file: UploadFile) -> bool:
    """Validate image file"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    size = file.file.tell()
    file.file.seek(0)  # Reset position
    
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE/1024/1024}MB"
        )
    
    return True

@router.post("/upload", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def upload_image_and_generate_report(
    title: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload images and generate medical report"""
    try:
        # Ensure upload directory exists
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        
        # Process each file
        saved_files = []
        for file in files:
            # Validate file
            validate_image(file)
            
            # Generate unique filename
            file_ext = Path(file.filename).suffix.lower()
            unique_filename = f"{uuid4()}{file_ext}"
            file_path = UPLOAD_DIR / unique_filename
            
            # Save file
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(str(file_path))
        
        # TODO: Integrate with medical image processing service
        # For now, create a mock report
        diagnosis = "Mock diagnosis based on uploaded images"
        report_data = f"Analysis of {len(files)} images.\nDiagnosis: {diagnosis}"
        
        # Create report in database
        report = MedicalReport(
            user_id=current_user.id,
            title=title,
            report_data=report_data,
            diagnosis=diagnosis
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return report
        
    except Exception as e:
        # Clean up any saved files
        for file_path in saved_files:
            try:
                os.remove(file_path)
            except:
                pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/my-reports", response_model=ReportList)
async def get_user_reports(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all reports for current user"""
    reports = db.query(MedicalReport)\
        .filter(MedicalReport.user_id == current_user.id)\
        .order_by(MedicalReport.created_at.desc())\
        .all()
    
    return ReportList(reports=reports)

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific report by ID"""
    report = db.query(MedicalReport)\
        .filter(
            MedicalReport.id == report_id,
            MedicalReport.user_id == current_user.id
        ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return report

@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    report_update: ReportUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update report details"""
    report = db.query(MedicalReport)\
        .filter(
            MedicalReport.id == report_id,
            MedicalReport.user_id == current_user.id
        ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Update fields if provided
    if report_update.title is not None:
        report.title = report_update.title
    if report_update.report_data is not None:
        report.report_data = report_update.report_data
    if report_update.diagnosis is not None:
        report.diagnosis = report_update.diagnosis
    
    report.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(report)
        return report
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update report"
        )

@router.delete("/{report_id}", response_model=MessageResponse)
async def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a report"""
    report = db.query(MedicalReport)\
        .filter(
            MedicalReport.id == report_id,
            MedicalReport.user_id == current_user.id
        ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    try:
        db.delete(report)
        db.commit()
        return MessageResponse(message="Report deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete report"
        )

@router.get("/recent")
async def get_recent_reports(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = 5
):
    """Get recent reports for current user"""
    reports = db.query(MedicalReport)\
        .filter(MedicalReport.user_id == current_user.id)\
        .order_by(MedicalReport.created_at.desc())\
        .limit(limit)\
        .all()
    
    return [
        {
            "id": report.id,
            "title": report.title,
            "date": report.created_at
        }
        for report in reports
    ]

@router.get("/summary")
async def get_activity_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get activity summary for current user"""
    from datetime import datetime, timedelta
    
    # Get total reports count
    total_reports = db.query(MedicalReport)\
        .filter(MedicalReport.user_id == current_user.id)\
        .count()
    
    # Get reports count for current month
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    reports_this_month = db.query(MedicalReport)\
        .filter(
            MedicalReport.user_id == current_user.id,
            MedicalReport.created_at >= start_of_month
        ).count()
    
    # Get chat sessions count (mock data for now)
    chat_sessions = 0  # TODO: Implement chat sessions tracking
    
    return {
        "totalReports": total_reports,
        "reportsThisMonth": reports_this_month,
        "chatSessions": chat_sessions
    }

@router.get("/{report_id}/download")
async def download_report(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download report as PDF"""
    report = db.query(MedicalReport)\
        .filter(
            MedicalReport.id == report_id,
            MedicalReport.user_id == current_user.id
        ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    try:
        # Generate PDF
        pdf_content = generate_pdf_report(report)
        
        # Prepare filename
        filename = f"report_{report_id}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
        
        # Return PDF file
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate PDF"
        )