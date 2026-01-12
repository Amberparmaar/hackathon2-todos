"""
JWT security module for Phase II Full-Stack Multi-User Web Application.

Task Reference: T-007
Spec Reference: @phase2/specs/plan.md - FR-004, FR-005

This module sets up JWT token generation and validation using BETTER_AUTH_SECRET.
"""

from datetime import datetime, timedelta
from typing import Optional
import os
from uuid import UUID

import jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# T-007: BETTER_AUTH_SECRET environment variable documented
# T-007: Token expiration logic (default 7 days)
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "my-super-secret-phase2-key-2026")
ALGORITHM = "HS256"
TOKEN_EXPIRATION_DAYS = 7

# Security scheme for FastAPI
security = HTTPBearer()


def create_access_token(user_id: UUID) -> str:
    """
    Create JWT access token for user.

    T-007: JWT token can be generated with user_id in subject

    Args:
        user_id: UUID of the user

    Returns:
        str: JWT token

    Raises:
        ValueError: If user_id is not valid
    """
    if not isinstance(user_id, UUID):
        raise ValueError("user_id must be a valid UUID")

    # T-007: Token expiration configurable
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRATION_DAYS)

    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }

    # T-007: Token signed with BETTER_AUTH_SECRET
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> str:
    """
    Verify JWT token and extract user_id.

    T-007: JWT can be validated with BETTER_AUTH_SECRET
    T-007: User ID can be extracted from validated token
    T-007: Error handling for invalid/expired tokens

    Args:
        token: JWT token string

    Returns:
        str: user_id as string

    Raises:
        HTTPException: If token is invalid or expired (401 Unauthorized)
    """
    try:
        # T-007: JWT can be validated with BETTER_AUTH_SECRET
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extract user_id from subject claim
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_id

    except jwt.ExpiredSignatureError:
        # T-007: Error handling for invalid/expired tokens
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(credentials: HTTPAuthorizationCredentials) -> str:
    """
    FastAPI dependency to extract user_id from JWT token.

    T-010: Validates Authorization: Bearer <token> header
    T-010: Extracts user_id from JWT
    T-010: Returns 401 if token invalid/missing
    T-010: Can be applied as dependency to protected routes

    Args:
        credentials: HTTPAuthorizationCredentials from HTTPBearer

    Returns:
        str: user_id as string

    Raises:
        HTTPException: If token is invalid or missing (401 Unauthorized)
    """
    return verify_token(credentials.credentials)
