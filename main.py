"""
FastAPI Medical Application

Main application entry point that configures:
- FastAPI application
- Database
- Routers
- CORS
- Static files
- Templates
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from typing import Dict

from routers import users, reports, chatbot
from database import engine, Base
from models import User, MedicalReport, ChatHistory

def get_firebase_config() -> Dict[str, str]:
    """Get Firebase configuration"""
    return {
        "apiKey": "AIzaSyDXEqeGNeJgN9hCOZfS2TSpwtOW9Wkbd0A",
        "authDomain": "mediscan-cc1d2.firebaseapp.com",
        "projectId": "mediscan-cc1d2",
        "storageBucket": "mediscan-cc1d2.firebasestorage.app",
        "messagingSenderId": "213800978424",
        "appId": "1:213800978424:web:ec893f9be88bf67ecef80d",
        "measurementId": "G-VSSQ5ZF75T"
    }

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Medical App API",
    description="A medical application for managing patient reports and providing AI-assisted analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize templates
templates = Jinja2Templates(directory="templates")

# Register routers
app.include_router(users.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status": "error"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "status": "error"
        }
    )

# Root endpoint
@app.get("/")
async def root(request: Request):
    """Render the main page"""
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )

# Login page endpoint
@app.get("/login")
async def login_page(request: Request):
    """Render the login page"""
    return templates.TemplateResponse(
        "login.html",
        {"request": request, "firebase_config": get_firebase_config()}
    )

# Dashboard page endpoint
@app.get("/dashboard")
async def dashboard_page(request: Request):
    """Render the dashboard page"""
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "firebase_config": get_firebase_config()}
    )

# Upload page endpoint
@app.get("/upload")
async def upload_page(request: Request):
    """Render the upload page"""
    return templates.TemplateResponse(
        "upload.html",
        {"request": request, "firebase_config": get_firebase_config()}
    )

# Reports page endpoint
@app.get("/reports")
async def reports_page(request: Request):
    """Render the reports page"""
    return templates.TemplateResponse(
        "reports.html",
        {"request": request, "firebase_config": get_firebase_config()}
    )

# Chat page endpoint
@app.get("/chat")
async def chat_page(request: Request):
    """Render the chat page"""
    return templates.TemplateResponse(
        "chat.html",
        {"request": request, "firebase_config": get_firebase_config()}
    )

# Profile page endpoint
@app.get("/profile")
async def profile_page(request: Request):
    """Render the profile page"""
    return templates.TemplateResponse(
        "profile.html",
        {"request": request, "firebase_config": get_firebase_config()}
    )

# Doctor dashboard page endpoint
@app.get("/doctor")
async def doctor_page(request: Request):
    """Render the doctor dashboard page"""
    return templates.TemplateResponse(
        "doctor.html",
        {"request": request, "firebase_config": get_firebase_config()}
    )

# Register page endpoint
@app.get("/register")
async def register_page(request: Request):
    """Render the registration page"""
    return templates.TemplateResponse(
        "register.html",
        {"request": request, "firebase_config": get_firebase_config()}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )