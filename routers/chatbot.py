"""
chatbot.py

Handles chatbot interaction endpoints:
- Process user messages
- Generate AI responses
- Maintain chat history
- Provide context-aware responses based on medical reports
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from datetime import datetime
from typing import List, Optional

from database import get_db
from models import User, MedicalReport, ChatHistory
from schemas import ChatMessage, ChatResponse, ChatHistory as ChatHistorySchema
from utils.security import get_current_active_user

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

def generate_bot_response(message: str, report: Optional[MedicalReport] = None) -> tuple[str, List[str]]:
    """
    Generate chatbot response and suggestions.
    TODO: Replace with actual AI model integration
    """
    # Simulate different responses based on common medical queries
    suggestions = []
    
    if "symptoms" in message.lower():
        response = "Could you describe your symptoms in detail? This will help me provide better guidance."
        suggestions = [
            "I have fever and headache",
            "I'm experiencing chest pain",
            "I have difficulty breathing"
        ]
    elif "report" in message.lower() and report:
        response = f"Based on your report '{report.title}', the diagnosis shows: {report.diagnosis}"
        suggestions = [
            "What does this diagnosis mean?",
            "What should I do next?",
            "Are there any precautions I should take?"
        ]
    elif "treatment" in message.lower():
        response = "While I can provide general information, it's important to follow your doctor's specific recommendations."
        suggestions = [
            "What are the common treatments?",
            "Are there any side effects?",
            "How long does treatment usually take?"
        ]
    else:
        response = "I'm here to help answer your medical questions. What would you like to know?"
        suggestions = [
            "Tell me about my latest report",
            "What do my symptoms indicate?",
            "Explain my treatment options"
        ]
    
    return response, suggestions

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    chat_message: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Process chat message and return bot response
    """
    # Get referenced report if provided
    report = None
    if chat_message.context_report_id:
        report = db.query(MedicalReport)\
            .filter(
                MedicalReport.id == chat_message.context_report_id,
                MedicalReport.user_id == current_user.id
            ).first()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referenced report not found"
            )
    else:
        # Get user's most recent report
        report = db.query(MedicalReport)\
            .filter(MedicalReport.user_id == current_user.id)\
            .order_by(MedicalReport.created_at.desc())\
            .first()

    # Generate response
    response, suggestions = generate_bot_response(chat_message.message, report)

    try:
        # Save to chat history
        chat_entry = ChatHistory(
            user_id=current_user.id,
            report_id=report.id if report else None,
            message=chat_message.message,
            response=response,
            suggestions=json.dumps(suggestions)
        )
        
        db.add(chat_entry)
        db.commit()
        
        return ChatResponse(
            message=response,
            suggestions=suggestions,
            report_reference=report.title if report else None,
            created_at=datetime.utcnow()
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not process chat message"
        )

@router.get("/history", response_model=ChatHistorySchema)
async def get_chat_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user's chat history
    """
    try:
        # Get total count
        total_messages = db.query(ChatHistory)\
            .filter(ChatHistory.user_id == current_user.id)\
            .count()
        
        # Get recent messages
        chat_history = db.query(ChatHistory)\
            .filter(ChatHistory.user_id == current_user.id)\
            .order_by(ChatHistory.created_at.desc())\
            .limit(limit)\
            .all()
        
        # Convert to response format
        messages = [
            ChatResponse(
                message=chat.response,
                suggestions=json.loads(chat.suggestions),
                report_reference=chat.report.title if chat.report else None,
                created_at=chat.created_at
            )
            for chat in chat_history
        ]
        
        return ChatHistorySchema(
            messages=messages,
            total_messages=total_messages
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve chat history"
        )

@router.delete("/history", response_model=dict)
async def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Clear user's chat history
    """
    try:
        # Delete all chat history for user
        db.query(ChatHistory)\
            .filter(ChatHistory.user_id == current_user.id)\
            .delete()
        
        db.commit()
        return {"message": "Chat history cleared successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not clear chat history"
        )
