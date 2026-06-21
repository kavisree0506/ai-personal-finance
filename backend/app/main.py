from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
from datetime import datetime

from .database import init_db, get_session
from .models import User, Expense, Goal
from .crud import (
    create_user, add_expense, list_expenses, add_goal, list_goals,
    get_user, get_user_by_email, update_goal, get_expense_summary
)
from .auth import get_password_hash, authenticate_user, create_access_token
from .ai import call_openai_chat, is_ai_configured
from .schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse, UserUpdate,
    ExpenseCreate, ExpenseResponse, ExpenseListResponse,
    GoalCreate, GoalUpdate, GoalResponse,
    AIAdviceRequest, AIAdviceResponse
)
from .logger import setup_logger

from sqlmodel import Session
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parents[1] / ".env")

logger = setup_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FinAdvisor - AI Personal Finance Backend",
    description="Backend API for the FinAdvisor personal finance tracking application",
    version="1.0.0"
)

# CORS Configuration
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
logger.info(f"CORS configured for origin: {FRONTEND_ORIGIN}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Initialize database on startup."""
    try:
        logger.info("Initializing database...")
        init_db()
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow()}


# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/register", response_model=UserResponse, tags=["Auth"])
def register(request: RegisterRequest):
    """Register a new user."""
    logger.info(f"Registration attempt for email: {request.email}")
    
    try:
        existing = get_user_by_email(request.email)
        if existing:
            logger.warning(f"Registration failed: Email already registered - {request.email}")
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        hashed = get_password_hash(request.password)
        user = User(
            email=request.email,
            hashed_password=hashed,
            full_name=request.full_name,
            monthly_salary=request.monthly_salary
        )
        created = create_user(user)
        logger.info(f"User registered successfully: {request.email} with salary: ₹{request.monthly_salary}")
        
        return UserResponse(
            id=created.id,
            email=created.email,
            full_name=created.full_name,
            monthly_salary=created.monthly_salary
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Please try again."
        )


@app.post("/login", response_model=TokenResponse, tags=["Auth"])
def login(request: LoginRequest):
    """Login user and return access token."""
    logger.info(f"Login attempt for email: {request.email}")
    
    try:
        user = authenticate_user(request.email, request.password)
        if not user:
            logger.warning(f"Login failed: Invalid credentials - {request.email}")
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        token = create_access_token({"sub": str(user.id)})
        logger.info(f"User logged in successfully: {request.email}")
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.id
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Login failed. Please try again."
        )


@app.get("/user/{user_id}", response_model=UserResponse, tags=["Auth"])
def get_user_profile(user_id: int):
    """Get user profile information including salary."""
    logger.debug(f"Fetching user profile: {user_id}")
    
    try:
        user = get_user(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        logger.debug(f"User profile retrieved: {user.email}")
        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            monthly_salary=user.monthly_salary
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch user profile"
        )


@app.put("/user/{user_id}", response_model=UserResponse, tags=["Auth"])
def update_user_profile(user_id: int, request: UserUpdate):
    """Update user profile information (full name and/or salary)."""
    logger.info(f"Updating user profile: {user_id}")
    
    try:
        user = get_user(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # Update fields if provided
        if request.full_name is not None:
            user.full_name = request.full_name
        if request.monthly_salary is not None:
            user.monthly_salary = request.monthly_salary
            logger.info(f"User salary updated to: ₹{request.monthly_salary}")
        
        # Save updates
        from .database import engine
        with Session(engine) as session:
            session.merge(user)
            session.commit()
            session.refresh(user)
        
        logger.info(f"User profile updated: {user_id}")
        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            monthly_salary=user.monthly_salary
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update user profile"
        )


# ============ EXPENSE ENDPOINTS ============

@app.get("/expenses", response_model=ExpenseListResponse, tags=["Expenses"])
def get_expenses(user_id: int, session: Session = Depends(get_session)):
    """Get all expenses for a user with summary."""
    logger.debug(f"Fetching expenses for user: {user_id}")
    
    try:
        # Verify user exists
        user = get_user(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        expenses = list_expenses(user_id)
        summary = get_expense_summary(user_id)
        
        response = ExpenseListResponse(
            total_count=len(expenses),
            expenses=[
                ExpenseResponse(
                    id=e.id,
                    user_id=e.user_id,
                    amount=e.amount,
                    category=e.category,
                    note=e.note,
                    date=e.date
                )
                for e in expenses
            ],
            total_amount=summary["total"],
            category_breakdown=summary["by_category"]
        )
        
        logger.debug(f"Retrieved {len(expenses)} expenses for user {user_id}")
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching expenses: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch expenses"
        )


@app.post("/expenses", response_model=ExpenseResponse, tags=["Expenses"])
def create_expense(
    user_id: int,
    request: ExpenseCreate,
    session: Session = Depends(get_session)
):
    """Create a new expense."""
    logger.info(f"Creating expense: {request.amount} for user {user_id}")
    
    try:
        # Verify user exists
        user = get_user(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        expense = Expense(
            user_id=user_id,
            amount=request.amount,
            category=request.category,
            note=request.note
        )
        created = add_expense(expense)
        
        logger.info(f"Expense created successfully: {created.id}")
        
        return ExpenseResponse(
            id=created.id,
            user_id=created.user_id,
            amount=created.amount,
            category=created.category,
            note=created.note,
            date=created.date
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating expense: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create expense"
        )


# ============ GOAL ENDPOINTS ============

@app.get("/goals", response_model=List[GoalResponse], tags=["Goals"])
def get_goals(user_id: int):
    """Get all financial goals for a user."""
    logger.debug(f"Fetching goals for user: {user_id}")
    
    try:
        # Verify user exists
        user = get_user(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        goals = list_goals(user_id)
        
        response = [
            GoalResponse(
                id=g.id,
                user_id=g.user_id,
                title=g.title,
                target_amount=g.target_amount,
                current_amount=g.current_amount,
                due_date=g.due_date,
                created_at=g.created_at,
                progress_percentage=(g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0
            )
            for g in goals
        ]
        
        logger.debug(f"Retrieved {len(goals)} goals for user {user_id}")
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching goals: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch goals"
        )


@app.post("/goals", response_model=GoalResponse, tags=["Goals"])
def create_goal(user_id: int, request: GoalCreate):
    """Create a new financial goal."""
    logger.info(f"Creating goal: {request.title} for user {user_id}")
    
    try:
        # Verify user exists
        user = get_user(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        goal = Goal(
            user_id=user_id,
            title=request.title,
            target_amount=request.target_amount,
            due_date=request.due_date
        )
        created = add_goal(goal)
        
        logger.info(f"Goal created successfully: {created.id}")
        
        return GoalResponse(
            id=created.id,
            user_id=created.user_id,
            title=created.title,
            target_amount=created.target_amount,
            current_amount=created.current_amount,
            due_date=created.due_date,
            created_at=created.created_at,
            progress_percentage=0
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating goal: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create goal"
        )


@app.patch("/goals/{goal_id}", response_model=GoalResponse, tags=["Goals"])
def update_goal_progress(goal_id: int, request: GoalUpdate):
    """Update goal progress."""
    logger.info(f"Updating goal {goal_id} with amount: {request.current_amount}")
    
    try:
        updated = update_goal(goal_id, request.current_amount)
        
        if not updated:
            logger.warning(f"Goal not found: {goal_id}")
            raise HTTPException(
                status_code=404,
                detail="Goal not found"
            )
        
        logger.info(f"Goal updated successfully: {goal_id}")
        
        return GoalResponse(
            id=updated.id,
            user_id=updated.user_id,
            title=updated.title,
            target_amount=updated.target_amount,
            current_amount=updated.current_amount,
            due_date=updated.due_date,
            created_at=updated.created_at,
            progress_percentage=(updated.current_amount / updated.target_amount * 100) if updated.target_amount > 0 else 0
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating goal: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update goal"
        )


# ============ AI ADVISOR ENDPOINTS ============

@app.post("/ai/advice", response_model=AIAdviceResponse, tags=["AI Advisor"])
async def get_ai_advice(user_id: int, request: AIAdviceRequest):
    """Get AI financial advice based on user's financial data."""
    logger.info(f"AI advice requested for user {user_id}: {request.question}")
    
    try:
        # Verify user exists
        user = get_user(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # Fetch user's expenses and goals for personalized advice
        expenses = list_expenses(user_id)
        goals = list_goals(user_id)
        
        # Format expenses into readable text
        expenses_text = ""
        if expenses:
            expenses_text = "Recent expenses (last 10):\n" + "\n".join(
                f"- {exp.date.strftime('%Y-%m-%d')}: ₹{exp.amount:,.2f} in {exp.category or 'Uncategorized'} ({exp.note or 'No note'})"
                for exp in expenses[:10]
            )
        else:
            expenses_text = "No expenses recorded yet."
        
        # Format goals into readable text
        goals_text = ""
        if goals:
            goals_text = "Financial goals:\n" + "\n".join(
                f"- {goal.title}: ₹{goal.current_amount:,.2f}/₹{goal.target_amount:,.2f} ({(goal.current_amount/goal.target_amount*100):.1f}% completed, Due: {goal.due_date.strftime('%Y-%m-%d') if goal.due_date else 'No due date'})"
                for goal in goals
            )
        else:
            goals_text = "No financial goals set yet."
        
        # Build context from user's data
        context = f"{expenses_text}\n\n{goals_text}"
        
        # Build a system prompt with user context
        system = (
            "You are a helpful personal finance advisor with deep expertise in budgeting, saving, and financial planning. "
            "Provide clear, concise, and actionable financial guidance based on the user's data. "
            "If the user has limited data, provide general advice tailored to their question. "
            "Always be encouraging and provide specific, measurable recommendations."
        )
        
        user_prompt = (
            f"User's financial data:\n{context}\n\n"
            f"Question: {request.question}\n\n"
            f"Provide actionable suggestions, next steps, and specific recommendations based on the user's financial situation."
        )
        
        # Call AI service (Gemini if configured, otherwise fallback responses)
        advice = await call_openai_chat(system, user_prompt)
        logger.info(f"AI advice generated successfully for user {user_id}")
        
        return AIAdviceResponse(
            advice=advice,
            confidence=0.95,
            sources=["User expense data", "Financial goals", "AI analysis"],
            next_steps=["Review the advice", "Create an action plan", "Track progress"]
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error generating AI advice: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI advice"
        )


@app.get("/ai/config", tags=["AI Advisor"])
def ai_config():
    """Return whether AI integration is available."""
    return {
        "configured": is_ai_configured()
    }


# Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions with proper logging."""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

