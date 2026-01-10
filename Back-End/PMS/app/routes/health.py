"""
Health Check Endpoints
"""

from fastapi import APIRouter, status
from app.config.database import Database
from app.utils.responses import success_response
from app.config.settings import settings
from datetime import datetime

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Basic health check",
    description="Check if the service is running"
)
async def health_check():
    """
    Basic health check endpoint.
    
    Returns:
        Dict: Service health status
    """
    return success_response(
        data={
            "status": "healthy",
            "service": settings.app_name,
            "version": settings.app_version,
            "environment": settings.app_env,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        },
        message="Service is healthy"
    )


@router.get(
    "/health/ready",
    status_code=status.HTTP_200_OK,
    summary="Readiness check",
    description="Check if the service is ready to accept requests (DB connection)"
)
async def readiness_check():
    """
    Readiness check - verifies database connection.
    
    Returns:
        Dict: Service readiness status
    """
    db_connected = await Database.check_connection()
    
    if not db_connected:
        return success_response(
            data={
                "status": "not_ready",
                "service": settings.app_name,
                "database": "disconnected",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            },
            message="Service is not ready",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    return success_response(
        data={
            "status": "ready",
            "service": settings.app_name,
            "database": "connected",
            "gridfs": "available",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        },
        message="Service is ready"
    )


@router.get(
    "/health/live",
    status_code=status.HTTP_200_OK,
    summary="Liveness check",
    description="Check if the service is alive"
)
async def liveness_check():
    """
    Liveness check - simple ping to verify service is running.
    
    Returns:
        Dict: Service liveness status
    """
    return success_response(
        data={
            "status": "alive",
            "service": settings.app_name,
            "uptime": "running",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        },
        message="Service is alive"
    )
