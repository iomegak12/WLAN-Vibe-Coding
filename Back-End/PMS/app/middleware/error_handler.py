"""
Global Error Handler Middleware
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.utils.exceptions import PMSException
from app.utils.responses import error_response
from app.utils.logger import logger
from pydantic import ValidationError
import traceback


async def pms_exception_handler(request: Request, exc: PMSException) -> JSONResponse:
    """
    Handle custom PMS exceptions.
    
    Args:
        request: FastAPI request object
        exc: PMSException instance
    
    Returns:
        JSONResponse: Error response
    """
    logger.error(f"PMS Exception: {exc.code} - {exc.message}")
    
    return error_response(
        code=exc.code,
        message=exc.message,
        details=exc.details,
        status_code=exc.status_code
    )


async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors.
    
    Args:
        request: FastAPI request object
        exc: ValidationError instance
    
    Returns:
        JSONResponse: Error response
    """
    errors = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors[field] = error["msg"]
    
    logger.warning(f"Validation error: {errors}")
    
    return error_response(
        code="VALIDATION_ERROR",
        message="Validation failed",
        details=errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions.
    
    Args:
        request: FastAPI request object
        exc: Exception instance
    
    Returns:
        JSONResponse: Error response
    """
    # Log full traceback for debugging
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    
    # Don't expose internal errors in production
    from app.config.settings import settings
    
    if settings.is_production:
        message = "An internal server error occurred"
        details = {}
    else:
        message = str(exc)
        details = {"traceback": traceback.format_exc()}
    
    return error_response(
        code="INTERNAL_SERVER_ERROR",
        message=message,
        details=details,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
