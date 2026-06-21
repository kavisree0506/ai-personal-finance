from sqlmodel import create_engine, SQLModel, Session
import os
import sqlite3
from pathlib import Path
from dotenv import load_dotenv
from .logger import setup_logger

# Setup logger
logger = setup_logger(__name__)

load_dotenv(Path(__file__).parents[2] / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finance.db")
logger.info(f"Initializing database with URL: {DATABASE_URL}")

# Determine local SQLite file path for schema checks
DATABASE_FILE_PATH = None
if DATABASE_URL.startswith("sqlite:///"):
    path_value = DATABASE_URL.replace("sqlite:///", "")
    database_path = Path(path_value)
    if not database_path.is_absolute():
        database_path = Path(__file__).resolve().parent.parent / database_path
    database_path = database_path.resolve()
    DATABASE_FILE_PATH = database_path
    DATABASE_URL = f"sqlite:///{database_path.as_posix()}"
    logger.info(f"SQLite database file resolved to: {DATABASE_FILE_PATH}")

# Configure SQLite-specific settings
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        DATABASE_URL,
        echo=os.getenv("LOG_LEVEL") == "DEBUG",
        connect_args=connect_args
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    raise


def _is_user_schema_outdated() -> bool:
    """Detect whether the current SQLite user table is missing required columns."""
    if not DATABASE_FILE_PATH or not DATABASE_FILE_PATH.exists():
        return False

    required_columns = {"id", "email", "hashed_password", "full_name", "created_at", "monthly_salary"}
    try:
        with sqlite3.connect(DATABASE_FILE_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user';")
            if not cursor.fetchone():
                return False

            cursor.execute("PRAGMA table_info(user);")
            existing_columns = {row[1] for row in cursor.fetchall()}
            missing_columns = required_columns - existing_columns
            if missing_columns:
                logger.warning(f"Outdated user schema detected, missing columns: {sorted(missing_columns)}")
                return True
    except Exception as e:
        logger.error(f"Failed to inspect current database schema: {e}")
    return False


def _migrate_user_table():
    """Apply schema migrations to the existing user table if needed."""
    if not DATABASE_FILE_PATH or not DATABASE_FILE_PATH.exists():
        return

    try:
        with sqlite3.connect(DATABASE_FILE_PATH, timeout=10) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user';")
            if not cursor.fetchone():
                return

            cursor.execute("PRAGMA table_info(user);")
            existing_columns = [row[1] for row in cursor.fetchall()]
            if "monthly_salary" not in existing_columns:
                logger.warning("Adding missing monthly_salary column to user table.")
                cursor.execute("ALTER TABLE user ADD COLUMN monthly_salary FLOAT NOT NULL DEFAULT 0.0;")
                conn.commit()
                logger.info("Added monthly_salary column to user table.")
    except Exception as e:
        logger.error(f"Failed to migrate user table schema: {e}")
        raise


def init_db():
    """
    Initialize the database by creating all tables.
    Safe to call multiple times - only creates tables that don't exist.
    If the existing SQLite schema is outdated, apply a safe migration.
    """
    try:
        from . import models  # Import to register models

        if _is_user_schema_outdated():
            logger.warning("Database schema is outdated. Applying migration to add missing columns.")
            _migrate_user_table()

        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")
        raise


def get_session():
    """
    Get a database session for a request.
    Used as a dependency in FastAPI routes.
    """
    try:
        with Session(engine) as session:
            logger.debug("Database session created")
            yield session
    except Exception as e:
        logger.error(f"Database session error: {e}")
        raise
    finally:
        logger.debug("Database session closed")

