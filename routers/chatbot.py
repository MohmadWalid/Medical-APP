from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import json
from datetime import datetime
from typing import Optional, List
import requests  # Import the requests library

from database import get_db
from models import ChatHistory, User
from schemas import ChatMessage, ChatResponse
from routers.users import get_current_user

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# --- API Configuration ---
API_URL = "https://b26a-34-124-155-136.ngrok-free.app/ask"

# --- Utility Functions ---
def sanitize_user_message(message: str) -> str:
    """Removes leading/trailing whitespace."""
    return message.strip()

def generate_bot_response(message: str) -> tuple[str, List[str]]:
    """Generates a response by calling the external API."""
    sanitized_message = sanitize_user_message(message)
    if not sanitized_message:
        return "Hello! How can I help you today?", []

    try:
        # Call the external API
        response = requests.post(
            API_URL,
            json={"prompt": sanitized_message},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        # Extract the response text
        response_data = response.json()
        bot_response = response_data.get("response", "Sorry, I couldn't get a response.")
        
        return bot_response, []

    except requests.exceptions.RequestException as e:
        print(f"[API Error] Could not connect to the chatbot API: {e}")
        return "Sorry, I'm having trouble connecting to my services. Please try again later.", []
    except Exception as e:
        print(f"[API Error] An unexpected error occurred: {e}")
        return "An unexpected error occurred. Please try again.", []

# --- User Helper ---
async def get_optional_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None  # No authentication provided
    try:
        return await get_current_user(request, db)
    except Exception:
        return None

# --- Chat Endpoint ---
@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    chat_message: ChatMessage,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # Note: The `history` from chat_message is no longer used as the API seems to be single-turn
    response, suggestions = generate_bot_response(chat_message.message)
    try:
        chat_entry = ChatHistory(
            user_id=current_user.id if current_user else None,
            report_id=chat_message.context_report_id,
            message=chat_message.message,
            response=response,
            suggestions=json.dumps(suggestions)
        )
        db.add(chat_entry)
        db.commit()
        return ChatResponse(
            message=response,
            suggestions=suggestions,
            report_reference=None,
            created_at=datetime.utcnow()
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not process chat message: {str(e)}"
        )
