"""
users.py

This file defines the API endpoints related to user operations such as:
- User registration
- User login (authentication)
- Fetching the currently logged-in user's profile

It uses:
- Pydantic schemas (schemas.py) for input/output validation
- SQLAlchemy models (models.py) for database interaction
- Database session (database.py)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext

from models import User
from database import SessionLocal
from schemas import UserCreate, UserLogin, UserResponse, TokenResponse

# ----------- Setup -----------

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token management
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")


# ----------- Register Endpoint -----------

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user.username,
        email=user.email
    )
    new_user.set_password(user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ----------- Login Endpoint -----------

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # For now: Fake token (JWT to be added later)
    token = f"fake-token-for-{user.username}"
    return TokenResponse(access_token=token)


# ----------- Get Current User -----------

@router.get("/me", response_model=UserResponse)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # In real apps: decode JWT token and get user info
    username = token.replace("fake-token-for-", "")
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user