"""
PMS Service - FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config.settings import settings
from app.config.database import Database
from app.utils.logger import logger
from app.middleware.error_handler import (
    pms_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)
from app.utils.exceptions import PMSException
from app.routes import health, category, subcategory, product, files
from pydantic import ValidationError


# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for application startup and shutdown.
    """
    # Startup
    logger.info("="* 60)
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.app_env}")
    logger.info("=" * 60)
    
    try:
        # Connect to MongoDB
        await Database.connect_db()
        
        # Run bootstrap (create collections, indexes)
        from app.scripts.bootstrap import bootstrap_database
        await bootstrap_database()
        
        # Load seed data if configured
        if settings.load_seed_data:
            logger.info("Seed data loading is enabled")
            from app.scripts.seed_data import load_seed_data
            await load_seed_data()
        
        logger.info("Application startup complete")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Failed to start application: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await Database.close_db()
    logger.info("Application shutdown complete")


# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address) if settings.rate_limit_enabled else None


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Product Management System (PMS) - Microservice for managing product catalog",
    docs_url=settings.api_docs_url,
    redoc_url=settings.api_redoc_url,
    openapi_url=settings.openapi_url,
    lifespan=lifespan
)


# Add rate limiting state (if enabled)
if settings.rate_limit_enabled:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    logger.info(f"Rate limiting enabled: {settings.rate_limit_per_minute} requests/minute")


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Add exception handlers
app.add_exception_handler(PMSException, pms_exception_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


# Include routers
app.include_router(health.router)
app.include_router(category.router, prefix="/api/v1")
app.include_router(subcategory.router, prefix="/api/v1")
app.include_router(product.router, prefix="/api/v1")
app.include_router(files.router, prefix="/api/v1")


# Root endpoint
@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint",
    description="Welcome message and service information"
)
async def root():
    """
    Root endpoint - service information.
    
    Returns:
        Dict: Service information
    """
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": settings.api_docs_url,
        "redoc": settings.api_redoc_url,
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.debug
    )
