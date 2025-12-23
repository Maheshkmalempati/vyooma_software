"""
Authentication middleware for protected routes
Provides dependency injection for current user and role-based access control
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from app.auth import verify_token

# HTTP Bearer token scheme
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to extract and validate JWT token from request
    
    Args:
        credentials: Automatically extracted Bearer token
    
    Returns:
        dict: User payload {user_id, email, role}
    
    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Validate required fields
    if "user_id" not in payload or "role" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload

def require_role(allowed_roles: List[str]):
    """
    Dependency factory for role-based access control
    
    Usage:
        @app.get("/admin")
        def admin_route(user = Depends(require_role(["admin"]))):
            ...
    
    Args:
        allowed_roles: List of role strings that can access the endpoint
    
    Returns:
        Dependency function that validates user role
    """
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker

# Convenience dependencies for common roles
require_customer = require_role(["customer"])
require_pilot = require_role(["pilot"])
require_customer_or_pilot = require_role(["customer", "pilot"])
