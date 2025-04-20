"""
schemas.py

This file defines the Pydantic schemas used for data validation and serialization.
It ensures that data received from or sent to clients (requests/responses) is clean, structured, and type-safe.

Main Responsibilities:
- Define input data for user registration, login, and report creation
- Define response models to control what data is returned to the user
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List

# ---------- USER SCHEMAS ----------

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        orm_mode = True  # Allows Pydantic to work with SQLAlchemy objects


# ---------- REPORT SCHEMAS ----------

class ReportCreate(BaseModel):
    report_data: str  # Could be refined later to structured data

class ReportResponse(BaseModel):
    id: int
    user_id: int
    report_data: str

    class Config:
        orm_mode = True


# ---------- GENERAL PURPOSE SCHEMAS ----------

class MessageResponse(BaseModel):
    message: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"