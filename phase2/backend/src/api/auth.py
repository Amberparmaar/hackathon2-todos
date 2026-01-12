"""
Authentication API endpoints for Phase II Full-Stack Multi-User Web Application.

Task Reference: T-008, T-009, T-011
Spec Reference: @phase2/specs/contracts/openapi.yaml - Authentication Endpoints

This module implements user registration, sign-in, and sign-out endpoints
with email validation, password hashing, and JWT token generation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from uuid import UUID
import bcrypt
from typing import Optional

from ..core.database import get_session
from ..core.security import create_access_token, verify_token
from ..models.user import User
from ..schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserWithToken
)


router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.

    T-008: Password hashing with bcrypt (12 rounds)

    Args:
        password: Plain text password

    Returns:
        str: Hashed password
    """
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash.

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password

    Returns:
        bool: True if password matches, False otherwise
    """
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


@router.post("/signup", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
def signup(
    user_data: UserCreate,
    session: Session = Depends(get_session)
):
    """
    Create new user account.

    T-008: Endpoint accepts POST /api/auth/signup
    T-008: Email format validated
    T-008: Password hashed before storage
    T-008: Returns 409 if email already exists
    T-008: Returns 400 for invalid input
    T-008: Returns JWT token on success (201)
    T-008: Token signed with BETTER_AUTH_SECRET

    Args:
        user_data: User registration data (email, password)
        session: Database session

    Returns:
        UserWithToken: User data with JWT token

    Raises:
        HTTPException: If email already registered (409 Conflict)
        HTTPException: If validation fails (400 Bad Request)
    """
    # Check if user already exists
    # T-008: Duplicate email check (409 Conflict)
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash password
    # T-008: Password hashing with bcrypt (12 rounds)
    password_hash = hash_password(user_data.password)

    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=password_hash
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Generate JWT token
    # T-008: Returns JWT token on success (201)
    # T-008: Token signed with BETTER_AUTH_SECRET
    token = create_access_token(new_user.id)

    return UserWithToken(
        token=token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            created_at=new_user.created_at
        )
    )


@router.post("/signin", response_model=UserWithToken)
def signin(
    user_data: UserLogin,
    session: Session = Depends(get_session)
):
    """
    Authenticate existing user and return JWT token.

    T-009: Endpoint accepts POST /api/auth/signin
    T-009: Email lookup in users table
    T-009: Bcrypt password verification
    T-009: Returns JWT token on successful login
    T-009: Returns 401 Unauthorized for invalid credentials
    T-009: Token contains user_id in subject claim
    T-009: Token signed with BETTER_AUTH_SECRET

    Args:
        user_data: User sign-in data (email, password)
        session: Database session

    Returns:
        UserWithToken: User data with JWT token

    Raises:
        HTTPException: If credentials invalid (401 Unauthorized)
    """
    # Find user by email
    # T-009: Email lookup in users table
    user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()

    # Verify password
    # T-009: Bcrypt password verification
    if not user or not verify_password(user_data.password, user.password_hash):
        # T-009: Returns 401 Unauthorized for invalid credentials
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT token
    # T-009: Returns JWT token on successful login
    # T-009: Token contains user_id in subject claim
    # T-009: Token signed with BETTER_AUTH_SECRET
    token = create_access_token(user.id)

    return UserWithToken(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at
        )
    )


@router.post("/signout")
def signout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Invalidate JWT token (client-side action).

    T-011: Endpoint accepts POST /api/auth/signout
    T-011: Returns 200 OK status
    T-011: Response includes success message
    T-011: Client instructed to remove token from storage

    Args:
        credentials: JWT token from Authorization header

    Returns:
        dict: Success message

    Note:
        Token invalidation is primarily a client-side action (remove from localStorage/cookies).
        This endpoint validates the token before acknowledging sign-out.
    """
    # Validate token
    try:
        verify_token(credentials.credentials)
    except HTTPException:
        # Even if token is invalid, return success (client should still remove token)
        pass

    # T-011: Returns 200 OK status
    # T-011: Response includes success message
    # T-011: Client instructed to remove token from storage
    return {"message": "Successfully signed out"}
