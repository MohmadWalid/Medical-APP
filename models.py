#the database models, relationships, and the table creation logic

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from passlib.context import CryptContext
from database import Base
from datetime import datetime

# Create password hashing context (for password security)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define the User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    reports = relationship("MedicalReport", back_populates="user")
    chat_history = relationship("ChatHistory", back_populates="user")

# Define the MedicalReport model
class MedicalReport(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String, index=True)
    report_data = Column(Text)
    diagnosis = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reports")
    chat_messages = relationship("ChatHistory", back_populates="report")

# Define the ChatHistory model
class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    report_id = Column(Integer, ForeignKey('reports.id'), nullable=True)
    message = Column(Text)
    response = Column(Text)
    suggestions = Column(Text)  # Stored as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chat_history")
    report = relationship("MedicalReport", back_populates="chat_messages")