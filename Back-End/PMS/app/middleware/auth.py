"""
Authentication Middleware for JWT Token Verification
"""

from fastapi import Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional, List
from app.utils.auth_client import auth_client
from app.utils.exceptions import UnauthorizedError, ForbiddenError
from app.utils.logger import logger


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """
    Dependency to get current authenticated user.
    
    Args:
        credentials: HTTP Bearer credentials
    
    Returns:
        Dict: User information
    
    Raises:
        UnauthorizedError: If token is invalid
    """
    token = credentials.credentials
    user = await auth_client.verify_token(token)
    return user


async def get_optional_user(
    request: Request
) -> Optional[Dict]:
    """
    Dependency to get current user (optional - doesn't raise error if not authenticated).
    
    Args:
        request: FastAPI request object
    
    Returns:
        Optional[Dict]: User information if authenticated, None otherwise
    """
    try:
        authorization = request.headers.get("Authorization")
        if not authorization:
            return None
        
        token = auth_client.extract_token(authorization)
        user = await auth_client.verify_token(token)
        return user
    except Exception:
        return None


def require_permission(required_permission: str):
    """
    Decorator to require specific permission.
    
    Args:
        required_permission: Permission string required
    
    Returns:
        Dependency function
    """
    async def permission_checker(current_user: Dict = Depends(get_current_user)) -> Dict:
        """
        Check if user has required permission.
        
        Args:
            current_user: Current authenticated user
        
        Returns:
            Dict: User information
        
        Raises:
            ForbiddenError: If user doesn't have required permission
        """
        user_permissions = current_user.get("role", {}).get("permissions", [])
        
        # Check for wildcard permission (Super Admin)
        if "*" in user_permissions:
            return current_user
        
        # Check for specific permission
        if required_permission not in user_permissions:
            logger.warning(
                f"User {current_user.get('email')} attempted to access "
                f"resource requiring {required_permission} permission"
            )
            raise ForbiddenError(f"Insufficient permissions. Required: {required_permission}")
        
        return current_user
    
    return permission_checker


def require_any_permission(required_permissions: List[str]):
    """
    Decorator to require any one of the specified permissions.
    
    Args:
        required_permissions: List of permission strings
    
    Returns:
        Dependency function
    """
    async def permission_checker(current_user: Dict = Depends(get_current_user)) -> Dict:
        """
        Check if user has any of the required permissions.
        
        Args:
            current_user: Current authenticated user
        
        Returns:
            Dict: User information
        
        Raises:
            ForbiddenError: If user doesn't have any required permission
        """
        user_permissions = current_user.get("role", {}).get("permissions", [])
        
        # Check for wildcard permission
        if "*" in user_permissions:
            return current_user
        
        # Check if user has any of the required permissions
        if not any(perm in user_permissions for perm in required_permissions):
            logger.warning(
                f"User {current_user.get('email')} attempted to access "
                f"resource requiring one of: {', '.join(required_permissions)}"
            )
            raise ForbiddenError(
                f"Insufficient permissions. Required one of: {', '.join(required_permissions)}"
            )
        
        return current_user
    
    return permission_checker


def require_role(required_role: str):
    """
    Decorator to require specific role.
    
    Args:
        required_role: Role name required
    
    Returns:
        Dependency function
    """
    async def role_checker(current_user: Dict = Depends(get_current_user)) -> Dict:
        """
        Check if user has required role.
        
        Args:
            current_user: Current authenticated user
        
        Returns:
            Dict: User information
        
        Raises:
            ForbiddenError: If user doesn't have required role
        """
        user_role = current_user.get("role", {}).get("roleName", "")
        
        if user_role != required_role:
            logger.warning(
                f"User {current_user.get('email')} attempted to access "
                f"resource requiring {required_role} role"
            )
            raise ForbiddenError(f"Insufficient permissions. Required role: {required_role}")
        
        return current_user
    
    return role_checker
