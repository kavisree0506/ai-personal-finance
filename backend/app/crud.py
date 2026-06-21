from typing import List, Optional
from sqlmodel import Session, select
from .models import User, Expense, Goal
from .database import engine
from .logger import setup_logger

logger = setup_logger(__name__)


def create_user(user: User) -> User:
    """Create a new user in the database."""
    try:
        with Session(engine) as session:
            session.add(user)
            session.commit()
            session.refresh(user)
            logger.info(f"User created: {user.email}")
            return user
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise


def get_user(user_id: int) -> Optional[User]:
    """Retrieve a user by ID."""
    try:
        with Session(engine) as session:
            user = session.get(User, user_id)
            if user:
                logger.debug(f"User retrieved: {user.email}")
            else:
                logger.warning(f"User not found: {user_id}")
            return user
    except Exception as e:
        logger.error(f"Error retrieving user: {e}")
        raise


def get_user_by_email(email: str) -> Optional[User]:
    """Retrieve a user by email."""
    try:
        with Session(engine) as session:
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()
            if user:
                logger.debug(f"User retrieved by email: {email}")
            return user
    except Exception as e:
        logger.error(f"Error retrieving user by email: {e}")
        raise


def list_expenses(user_id: int) -> List[Expense]:
    """Get all expenses for a user."""
    try:
        with Session(engine) as session:
            statement = select(Expense).where(Expense.user_id == user_id).order_by(Expense.date.desc())
            expenses = session.exec(statement).all()
            logger.debug(f"Retrieved {len(expenses)} expenses for user {user_id}")
            return expenses
    except Exception as e:
        logger.error(f"Error listing expenses: {e}")
        raise


def add_expense(expense: Expense) -> Expense:
    """Create a new expense."""
    try:
        with Session(engine) as session:
            session.add(expense)
            session.commit()
            session.refresh(expense)
            logger.info(f"Expense added: {expense.amount} in {expense.category} for user {expense.user_id}")
            return expense
    except Exception as e:
        logger.error(f"Error adding expense: {e}")
        raise


def get_expense_by_id(expense_id: int) -> Optional[Expense]:
    """Retrieve an expense by ID."""
    try:
        with Session(engine) as session:
            expense = session.get(Expense, expense_id)
            if expense:
                logger.debug(f"Expense retrieved: {expense_id}")
            return expense
    except Exception as e:
        logger.error(f"Error retrieving expense: {e}")
        raise


def list_goals(user_id: int) -> List[Goal]:
    """Get all goals for a user."""
    try:
        with Session(engine) as session:
            statement = select(Goal).where(Goal.user_id == user_id).order_by(Goal.created_at.desc())
            goals = session.exec(statement).all()
            logger.debug(f"Retrieved {len(goals)} goals for user {user_id}")
            return goals
    except Exception as e:
        logger.error(f"Error listing goals: {e}")
        raise


def add_goal(goal: Goal) -> Goal:
    """Create a new financial goal."""
    try:
        with Session(engine) as session:
            session.add(goal)
            session.commit()
            session.refresh(goal)
            logger.info(f"Goal added: {goal.title} (₹{goal.target_amount}) for user {goal.user_id}")
            return goal
    except Exception as e:
        logger.error(f"Error adding goal: {e}")
        raise


def update_goal(goal_id: int, current_amount: float) -> Optional[Goal]:
    """Update goal progress."""
    try:
        with Session(engine) as session:
            goal = session.get(Goal, goal_id)
            if goal:
                goal.current_amount = current_amount
                session.add(goal)
                session.commit()
                session.refresh(goal)
                logger.info(f"Goal updated: {goal.title} progress = {current_amount}/{goal.target_amount}")
                return goal
            else:
                logger.warning(f"Goal not found: {goal_id}")
                return None
    except Exception as e:
        logger.error(f"Error updating goal: {e}")
        raise


def get_expense_summary(user_id: int) -> dict:
    """Get expense summary for a user."""
    try:
        with Session(engine) as session:
            expenses = list_expenses(user_id)
            summary = {
                "total": sum(e.amount for e in expenses),
                "count": len(expenses),
                "by_category": {}
            }
            
            for expense in expenses:
                category = expense.category or "Uncategorized"
                if category not in summary["by_category"]:
                    summary["by_category"][category] = 0
                summary["by_category"][category] += expense.amount
            
            logger.debug(f"Expense summary generated for user {user_id}")
            return summary
    except Exception as e:
        logger.error(f"Error generating expense summary: {e}")
        raise
