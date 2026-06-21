from datetime import datetime, timedelta
from typing import Optional
import os
from jose import JWTError, jwt
from passlib.context import CryptContext

from sqlmodel import Session, select
from .models import User
from .database import engine
from .logger import setup_logger

from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parents[2] / ".env")

logger = setup_logger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY", "replace-this-with-a-random-secret")
if SECRET_KEY == "replace-this-with-a-random-secret":
    logger.warning("Using default SECRET_KEY - change this in production!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        logger.debug(f"Password verification: {'success' if result else 'failed'}")
        return result
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a password for storage."""
    try:
        hashed = pwd_context.hash(password)
        logger.debug("Password hashed successfully")
        return hashed
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta 
            if expires_delta 
            else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.debug(f"Access token created for user: {data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Token creation error: {e}")
        raise


def get_user_by_email(email: str) -> Optional[User]:
    """Retrieve a user by email."""
    try:
        with Session(engine) as session:
            statement = select(User).where(User.email == email)
            result = session.exec(statement).first()
            if result:
                logger.debug(f"User found: {email}")
            else:
                logger.debug(f"User not found: {email}")
            return result
    except Exception as e:
        logger.error(f"Error retrieving user by email: {e}")
        raise


def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate a user with email and password."""
    try:
        user = get_user_by_email(email)
        if not user:
            logger.warning(f"Authentication failed: user not found ({email})")
            return None
        
        if not verify_password(password, user.hashed_password):
            logger.warning(f"Authentication failed: incorrect password ({email})")
            return None
        
        logger.info(f"User authenticated successfully: {email}")
        return user
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise

