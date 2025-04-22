"""
users.py

Handles user-related API endpoints:
- Register new users
- Authenticate existing users (login)
- Manage user profiles (get, update, delete)
- Handle user authentication and authorization

Uses Firebase Authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth
from pathlib import Path

from models import User
from schemas import (
    UserCreate,
    UserResponse,
    TokenResponse,
    UserProfileUpdate,
    MessageResponse
)
from database import get_db

# Initialize Firebase Admin
cred = credentials.Certificate(Path(__file__).parent.parent / "firebase-service-account.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

router = APIRouter(prefix="/users", tags=["Users"])

class FirebaseToken(BaseModel):
    token: str

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Get current user from Firebase token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(' ')[1]
    try:
        # Verify the Firebase token
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token['uid']
        
        # Get or create user in our database
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            # Create new user from Firebase data
            user = User(
                email=decoded_token.get('email'),
                username=decoded_token.get('email').split('@')[0],  # Use email prefix as username
                firebase_uid=firebase_uid,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Check if current user is active"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


@router.post("/verify-token", response_model=TokenResponse)
async def verify_token(
    token_data: FirebaseToken,
    db: Session = Depends(get_db)
):
    """Verify Firebase token and return user info"""
    try:
        # Verify the Firebase token
        decoded_token = auth.verify_id_token(token_data.token)
        firebase_uid = decoded_token['uid']
        
        # Get or create user in our database
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            # Create new user from Firebase data
            user = User(
                email=decoded_token.get('email'),
                username=decoded_token.get('email').split('@')[0],  # Use email prefix as username
                firebase_uid=firebase_uid,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return TokenResponse(
            access_token=token_data.token,
            expires_in=3600  # 1 hour
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Check if email is being updated and already exists
    if profile_update.email and profile_update.email != current_user.email:
        if db.query(User).filter(User.email == profile_update.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = profile_update.email

    # Check if username is being updated and already exists
    if profile_update.username and profile_update.username != current_user.username:
        if db.query(User).filter(User.username == profile_update.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = profile_update.username

    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update profile"
        )

@router.delete("/me", response_model=MessageResponse)
async def delete_user(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete current user account"""
    try:
        db.delete(current_user)
        db.commit()
        return MessageResponse(message="User account deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete user account"
        )