"""
Pydantic schemas for User API validation.

Task Reference: T-005
Spec Reference: @phase2/specs/contracts/openapi.yaml - Authentication Endpoints

This module defines request/response schemas for user authentication using Pydantic.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    """
    Schema for user registration request.

    T-005: UserCreate schema with email and password fields
    """

    email: EmailStr = Field(
        ...,
        description="User's email address for sign-in"
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password (min 8 characters)"
    )

    @validator('email')
    def email_must_be_valid(cls, v):
        """Validate email format."""
        if '@' not in v or '.' not in v.split('@')[-1]:
            raise ValueError('Invalid email format')
        return v


class UserLogin(BaseModel):
    """
    Schema for user sign-in request.

    T-005: UserResponse schema with id, email fields
    """

    email: EmailStr = Field(
        ...,
        description="User's email address"
    )
    password: str = Field(
        ...,
        description="User's password"
    )


class UserResponse(BaseModel):
    """
    Schema for user data response.

    T-005: UserResponse schema with id, email fields
    """

    id: UUID = Field(
        ...,
        description="Unique identifier for user"
    )
    email: EmailStr = Field(
        ...,
        description="User's email address"
    )
    created_at: datetime = Field(
        ...,
        description="Account creation timestamp"
    )

    class Config:
        from_attributes = True


class UserWithToken(BaseModel):
    """
    Schema for user response with JWT token.

    T-008: Returns JWT token on success (201)
    """

    token: str = Field(
        ...,
        description="JWT authentication token"
    )
    user: UserResponse = Field(
        ...,
        description="User information"
    )


class UserRead(BaseModel):
    """
    Schema for reading user information.

    T-005: UserResponse schema with id, email fields
    """

    id: UUID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True
