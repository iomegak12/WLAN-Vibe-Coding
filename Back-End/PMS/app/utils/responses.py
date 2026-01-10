"""
Standardized Response Formatting Utilities
"""

from typing import Any, Optional, Dict
from datetime import datetime
from fastapi.responses import JSONResponse


def success_response(
    data: Any,
    message: str = "Operation successful",
    status_code: int = 200
) -> Dict[str, Any]:
    """
    Create a standardized success response.
    
    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code
    
    Returns:
        Dict: Standardized success response
    """
    return {
        "success": True,
        "data": data,
        "message": message,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


def created_response(
    data: Any,
    message: str = "Resource created successfully"
) -> Dict[str, Any]:
    """
    Create a standardized response for resource creation (HTTP 201).
    
    Args:
        data: Created resource data
        message: Success message
    
    Returns:
        Dict: Standardized creation response
    """
    return {
        "success": True,
        "data": data,
        "message": message,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


def error_response(
    code: str,
    message: str,
    details: Optional[Any] = None,
    status_code: int = 500
) -> JSONResponse:
    """
    Create a standardized error response.
    
    Args:
        code: Error code
        message: Error message
        details: Additional error details
        status_code: HTTP status code
    
    Returns:
        JSONResponse: Standardized error response
    """
    response_data = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    return JSONResponse(
        status_code=status_code,
        content=response_data
    )


def paginated_response(
    items: list,
    page: int,
    limit: int,
    total: int,
    message: str = "Data retrieved successfully"
) -> Dict[str, Any]:
    """
    Create a standardized paginated response.
    
    Args:
        items: List of items for current page
        page: Current page number
        limit: Items per page
        total: Total number of items
        message: Success message
    
    Returns:
        Dict: Standardized paginated response
    """
    total_pages = (total + limit - 1) // limit  # Ceiling division
    
    return {
        "success": True,
        "data": {
            "items": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": total_pages,
                "hasNext": page < total_pages,
                "hasPrev": page > 1
            }
        },
        "message": message,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
