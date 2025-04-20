from fastapi import FastAPI
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Initialize FastAPI app
app = FastAPI()

#Create Database Models (SQLAlchemy)
#interacting with the database

# Create SQLite database connection
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

# Define the User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) 

    def set_password(self, password: str):
        """Hash the password before storing it."""
        self.password = pwd_context.hash(password)

    def verify_password(self, password: str):
        """Verify the password."""
        return pwd_context.verify(password, self.password)

# Define the Medical Report model
class MedicalReport(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    report_data = Column(Text)

# Create the tables in the database
Base.metadata.create_all(bind=engine)
