from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime


class User(SQLModel, table=True):
    """User model for authentication and profile management."""
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: Optional[str] = None
    monthly_salary: float = Field(default=0.0, ge=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    expenses: List["Expense"] = Relationship(back_populates="user")
    goals: List["Goal"] = Relationship(back_populates="user")


class Expense(SQLModel, table=True):
    """Expense tracking model."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    amount: float = Field(gt=0)
    category: Optional[str] = None
    note: Optional[str] = None
    date: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="expenses")


class Goal(SQLModel, table=True):
    """Financial goals model."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str
    target_amount: float = Field(gt=0)
    current_amount: float = Field(default=0.0, ge=0)
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="goals")
