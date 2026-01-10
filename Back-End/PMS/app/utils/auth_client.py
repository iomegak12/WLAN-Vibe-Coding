"""
AUTH Service Client for JWT Token Verification
"""

import httpx
from typing import Dict, Optional
from app.config.settings import settings
from app.utils.logger import logger
from app.utils.exceptions import UnauthorizedError, ExternalServiceError


class AuthClient:
    """
    Client for communicating with AUTH service.
    """
    
    @staticmethod
    async def verify_token(token: str) -> Dict:
        """
        Verify JWT token with AUTH service.
        
        Args:
            token: JWT access token
        
        Returns:
            Dict: User information from AUTH service
        
        Raises:
            UnauthorizedError: If token is invalid or expired
            ExternalServiceError: If AUTH service is unavailable
        """
        try:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    settings.auth_verify_url,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        logger.info(f"Token verified successfully for user: {data['data']['user'].get('email')}")
                        return data["data"]["user"]
                    else:
                        logger.warning("Token verification failed: Invalid response format")
                        raise UnauthorizedError("Invalid token response")
                
                elif response.status_code == 401:
                    error_data = response.json()
                    error_message = error_data.get("error", {}).get("message", "Unauthorized")
                    logger.warning(f"Token verification failed: {error_message}")
                    raise UnauthorizedError(error_message)
                
                elif response.status_code == 403:
                    logger.warning("Token verification failed: User account inactive")
                    raise UnauthorizedError("User account is inactive")
                
                elif response.status_code == 404:
                    logger.warning("Token verification failed: User not found")
                    raise UnauthorizedError("User not found")
                
                else:
                    logger.error(f"AUTH service returned unexpected status: {response.status_code}")
                    raise ExternalServiceError(
                        "Failed to verify token with AUTH service",
                        details={"status_code": response.status_code}
                    )
        
        except httpx.TimeoutException:
            logger.error("AUTH service timeout")
            raise ExternalServiceError("AUTH service timeout")
        
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to AUTH service: {str(e)}")
            raise ExternalServiceError(
                "Failed to connect to AUTH service",
                details={"error": str(e)}
            )
        
        except (UnauthorizedError, ExternalServiceError):
            raise
        
        except Exception as e:
            logger.error(f"Unexpected error during token verification: {str(e)}")
            raise ExternalServiceError(
                "Unexpected error during token verification",
                details={"error": str(e)}
            )
    
    @staticmethod
    def extract_token(authorization_header: Optional[str]) -> str:
        """
        Extract Bearer token from Authorization header.
        
        Args:
            authorization_header: Authorization header value
        
        Returns:
            str: Extracted token
        
        Raises:
            UnauthorizedError: If token is missing or invalid format
        """
        if not authorization_header:
            raise UnauthorizedError("No token provided")
        
        parts = authorization_header.split()
        
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise UnauthorizedError("Invalid token format")
        
        return parts[1]


# Create global instance
auth_client = AuthClient()
