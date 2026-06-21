"""
Logging configuration for the application.
Provides detailed logging with proper formatting and handlers.
"""
import logging
import os
from pathlib import Path
from datetime import datetime

# Create logs directory if it doesn't exist
logs_dir = Path(__file__).parent.parent.parent / "logs"
logs_dir.mkdir(exist_ok=True)

# Configure logging level
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


def setup_logger(name: str) -> logging.Logger:
    """
    Setup a logger with file and console handlers.
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, LOG_LEVEL))
    
    # Create formatters
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler (only for ERROR and above)
    error_handler = logging.FileHandler(logs_dir / f"error_{datetime.now().strftime('%Y%m%d')}.log")
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(getattr(logging, LOG_LEVEL))
    console_handler.setFormatter(formatter)
    
    # Add handlers if not already added
    if not logger.handlers:
        logger.addHandler(error_handler)
        logger.addHandler(console_handler)
    
    return logger


# Create module logger
logger = setup_logger(__name__)
