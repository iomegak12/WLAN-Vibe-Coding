"""
Custom Exception Classes
"""

from typing import Optional, Any


class PMSException(Exception):
    """
    Base exception class for PMS service.
    """
    
    def __init__(
        self,
        message: str,
        code: str = "PMS_ERROR",
        status_code: int = 500,
        details: Optional[Any] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(PMSException):
    """
    Exception for validation errors.
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )


class NotFoundError(PMSException):
    """
    Exception for resource not found errors.
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=404,
            details=details
        )


class FileUploadError(PMSException):
    """
    Exception for file upload errors.
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="FILE_UPLOAD_ERROR",
            status_code=400,
            details=details
        )


class DuplicateError(PMSException):
    """
    Exception for duplicate resource errors.
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="DUPLICATE_ERROR",
            status_code=409,
            details=details
        )


class UnauthorizedError(PMSException):
    """
    Exception for unauthorized access errors.
    """
    
    def __init__(self, message: str = "Unauthorized access", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=401,
            details=details
        )


class ForbiddenError(PMSException):
    """
    Exception for forbidden access errors.
    """
    
    def __init__(self, message: str = "Forbidden", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=403,
            details=details
        )


class DatabaseError(PMSException):
    """
    Exception for database operation errors.
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="DATABASE_ERROR",
            status_code=500,
            details=details
        )


class FileUploadError(PMSException):
    """
    Exception for file upload errors.
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="FILE_UPLOAD_ERROR",
            status_code=400,
            details=details
        )


class ExternalServiceError(PMSException):
    """
    Exception for external service communication errors (e.g., AUTH service).
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="EXTERNAL_SERVICE_ERROR",
            status_code=502,
            details=details
        )


class RateLimitError(PMSException):
    """
    Exception for rate limit exceeded errors.
    """
    
    def __init__(self, message: str = "Rate limit exceeded", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            details=details
        )
