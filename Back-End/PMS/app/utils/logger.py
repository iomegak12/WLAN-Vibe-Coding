"""
Logging Utility with Console and File Support
"""

import logging
import sys
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path
from datetime import datetime
from app.config.settings import settings


class Logger:
    """
    Logger class with support for console and file logging with daily rotation.
    """
    
    _instance = None
    _logger = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._logger is None:
            self._setup_logger()
    
    def _setup_logger(self) -> None:
        """
        Set up logger with configured handlers.
        """
        # Create logger
        self._logger = logging.getLogger("PMS")
        self._logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
        
        # Clear existing handlers
        self._logger.handlers = []
        
        # Create formatter
        formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Add handlers based on LOG_TYPE
        if settings.log_type.upper() == "CONSOLE":
            self._add_console_handler(formatter)
        elif settings.log_type.upper() == "FILE":
            self._add_file_handler(formatter)
        else:
            # Default to console if invalid type
            self._add_console_handler(formatter)
    
    def _add_console_handler(self, formatter: logging.Formatter) -> None:
        """
        Add console handler to logger.
        
        Args:
            formatter: Log message formatter
        """
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        self._logger.addHandler(console_handler)
    
    def _add_file_handler(self, formatter: logging.Formatter) -> None:
        """
        Add file handler with daily rotation to logger.
        
        Args:
            formatter: Log message formatter
        """
        # Create logs directory if it doesn't exist
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)
        
        # Log file path
        log_file = logs_dir / "pms.log"
        
        # Create rotating file handler (daily rotation)
        file_handler = TimedRotatingFileHandler(
            filename=str(log_file),
            when="midnight",
            interval=1,
            backupCount=30,  # Keep 30 days of logs
            encoding="utf-8"
        )
        file_handler.setFormatter(formatter)
        file_handler.suffix = "%Y-%m-%d"
        self._logger.addHandler(file_handler)
        
        # Also add console handler for important messages
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.WARNING)  # Only warnings and above to console
        console_handler.setFormatter(formatter)
        self._logger.addHandler(console_handler)
    
    def get_logger(self) -> logging.Logger:
        """
        Get logger instance.
        
        Returns:
            logging.Logger: Configured logger
        """
        return self._logger


# Create global logger instance
logger = Logger().get_logger()
