"""
chatbot.py

Stub router for chatbot interaction.
Simulates chatbot responses based on the user's medical report.
Later, this will be replaced by an AI-powered response system.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from database import SessionLocal
from models import User, MedicalReport
from utils.security import verify_token

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# DB session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authenticated user dependency
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# Simulated chatbot response based on latest report
@router.get("/chat")
def chat_with_bot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user's most recent report
    report = db.query(MedicalReport).filter(MedicalReport.user_id == current_user.id).order_by(MedicalReport.id.desc()).first()

    if not report:
        raise HTTPException(status_code=404, detail="No medical report found for user.")

    # ✨ Simulated chatbot response based on mock data
    response = f"Based on your report: '{report.report_data}', we recommend you follow up with a specialist and maintain a healthy lifestyle."

    return {"chatbot_reply": response}
