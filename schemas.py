"""
schemas.py

This file defines the Pydantic schemas used for data validation and serialization.
It ensures that data received from or sent to clients (requests/responses) is clean, structured, and type-safe.

Main Responsibilities:
- Define input data for user registration, login, and report creation
- Define response models to control what data is returned to the user
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ---------- USER SCHEMAS ----------

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)

# ---------- REPORT SCHEMAS ----------

class ReportBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    report_data: str
    diagnosis: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    report_data: Optional[str] = None
    diagnosis: Optional[str] = None

class ReportResponse(ReportBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportList(BaseModel):
    reports: List[ReportResponse]

    class Config:
        from_attributes = True

# ---------- CHAT SCHEMAS ----------

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    context_report_id: Optional[int] = None

class ChatResponse(BaseModel):
    message: str
    suggestions: List[str]
    report_reference: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatHistory(BaseModel):
    messages: List[ChatResponse]
    total_messages: int

# ---------- GENERAL PURPOSE SCHEMAS ----------

class MessageResponse(BaseModel):
    message: str
    status: str = "success"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600  # Token expiration time in seconds

class ErrorResponse(BaseModel):
    detail: str
    status: str = "error"