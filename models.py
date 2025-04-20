from fastapi import FastAPI
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from passlib.context import CryptContext

# Create SQLite database connection
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

# Create password hashing context (for password security)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define the User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) 

    # Method to set password (hash it before storing)
    def set_password(self, password: str):
        self.password = pwd_context.hash(password)

    # Method to verify password
    def verify_password(self, password: str):
        return pwd_context.verify(password, self.password)

# Define the MedicalReport model
class MedicalReport(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))  # ForeignKey relationship
    report_data = Column(Text)

    # Relationship to the User model
    user = relationship("User", back_populates="reports")

# Add the reverse relationship in the User model
User.reports = relationship("MedicalReport", back_populates="user")

# Create the tables in the database
Base.metadata.create_all(bind=engine)