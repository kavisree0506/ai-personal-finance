"""
Pydantic request and response models for API validation and documentation.
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# ============ AUTH MODELS ============
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: Optional[str] = None
    monthly_salary: float = Field(..., gt=0, description="Monthly salary must be greater than 0")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "full_name": "John Doe",
                "monthly_salary": 50000.00
            }
        }


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    monthly_salary: float = 0.0

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    monthly_salary: Optional[float] = Field(None, gt=0, description="Monthly salary must be greater than 0")

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "monthly_salary": 60000.00
            }
        }


# ============ EXPENSE MODELS ============
class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    category: Optional[str] = None
    note: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 1250.00,
                "category": "Food & Dining",
                "note": "Lunch at Italian Restaurant"
            }
        }


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    category: Optional[str] = None
    note: Optional[str] = None
    date: datetime

    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    total_count: int
    expenses: List[ExpenseResponse]
    total_amount: float
    category_breakdown: dict


# ============ GOAL MODELS ============
class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    target_amount: float = Field(..., gt=0)
    due_date: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Emergency Fund",
                "target_amount": 50000.00,
                "due_date": "2026-12-31T00:00:00"
            }
        }


class GoalUpdate(BaseModel):
    current_amount: float = Field(..., ge=0)


class GoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    current_amount: float
    due_date: Optional[datetime] = None
    created_at: datetime
    progress_percentage: float

    class Config:
        from_attributes = True


# ============ AI ADVISOR MODELS ============
class AIAdviceRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=1000)

    class Config:
        json_schema_extra = {
            "example": {
                "question": "Why is my savings so low this month?"
            }
        }


class AIAdviceResponse(BaseModel):
    advice: str
    confidence: float = 0.9
    sources: Optional[List[str]] = None
    next_steps: Optional[List[str]] = None
