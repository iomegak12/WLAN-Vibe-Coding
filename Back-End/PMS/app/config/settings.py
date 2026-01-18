"""
Application Settings and Configuration Management
"""

import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    
    # Application Configuration
    app_name: str = Field(default="PMS Service", alias="APP_NAME")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=5002, alias="APP_PORT")
    debug: bool = Field(default=True, alias="DEBUG")
    
    # Logging Configuration
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    log_type: str = Field(default="CONSOLE", alias="LOG_TYPE")
    
    # MongoDB Configuration
    mongodb_uri: str = Field(
        default="mongodb://admin:password123@localhost:27017/pms_db?authSource=admin",
        alias="MONGODB_URI"
    )
    mongodb_database: str = Field(default="pms_db", alias="MONGODB_DATABASE")
    mongodb_gridfs_bucket: str = Field(default="pms_files", alias="MONGODB_GRIDFS_BUCKET")
    
    # AUTH Service Configuration
    auth_service_url: str = Field(default="http://localhost:5001", alias="AUTH_SERVICE_URL")
    auth_verify_endpoint: str = Field(default="/api/v1/auth/verify", alias="AUTH_VERIFY_ENDPOINT")
    
    # Rate Limiting Configuration
    rate_limit_enabled: bool = Field(default=False, alias="RATE_LIMIT_ENABLED")
    rate_limit_per_minute: int = Field(default=100, alias="RATE_LIMIT_PER_MINUTE")
    
    # CORS Configuration
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        alias="CORS_ORIGINS"
    )
    
    # API Documentation
    api_docs_url: str = Field(default="/docs", alias="API_DOCS_URL")
    api_redoc_url: str = Field(default="/redoc", alias="API_REDOC_URL")
    openapi_url: str = Field(default="/openapi.json", alias="OPENAPI_URL")
    
    # Seed Data Configuration
    load_seed_data: bool = Field(default=False, alias="LOAD_SEED_DATA")
    
    # File Upload Configuration
    max_upload_size_mb: int = Field(default=5, alias="MAX_UPLOAD_SIZE_MB")
    allowed_image_formats: str = Field(
        default="image/jpeg,image/png,image/webp",
        alias="ALLOWED_IMAGE_FORMATS"
    )
    
    # QR Code Configuration
    qr_code_size: int = Field(default=300, alias="QR_CODE_SIZE")
    qr_code_error_correction: str = Field(default="H", alias="QR_CODE_ERROR_CORRECTION")
    
    # Barcode Configuration
    barcode_width: int = Field(default=400, alias="BARCODE_WIDTH")
    barcode_height: int = Field(default=200, alias="BARCODE_HEIGHT")
    
    # SKU Configuration
    sku_sequence_start: int = Field(default=1, alias="SKU_SEQUENCE_START")
    sku_sequence_pad: int = Field(default=4, alias="SKU_SEQUENCE_PAD")
    
    # Unsplash API Configuration
    unsplash_access_key: str = Field(default="", alias="UNSPLASH_ACCESS_KEY")
    unsplash_secret_key: str = Field(default="", alias="UNSPLASH_SECRET_KEY")
    unsplash_application_id: str = Field(default="", alias="UNSPLASH_APPLICATION_ID")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def allowed_image_formats_list(self) -> List[str]:
        """Parse allowed image formats string into list."""
        return [fmt.strip() for fmt in self.allowed_image_formats.split(",")]
    
    @property
    def max_upload_size_bytes(self) -> int:
        """Convert max upload size from MB to bytes."""
        return self.max_upload_size_mb * 1024 * 1024
    
    @property
    def auth_verify_url(self) -> str:
        """Get full AUTH verify URL."""
        return f"{self.auth_service_url}{self.auth_verify_endpoint}"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.app_env.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env.lower() == "production"


# Create global settings instance
settings = Settings()
