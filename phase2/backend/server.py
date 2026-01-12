"""
Simple standalone server for Phase II Full-Stack Multi-User Web Application.
"""

import asyncio
import os
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import SQLModel, Field, Session, select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, timedelta
import bcrypt
import jwt
from pydantic import BaseModel
from contextlib import asynccontextmanager
import uvicorn

# Configuration
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "my-super-secret-key")
ALGORITHM = "HS256"

# Models
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

class UserWithToken(BaseModel):
    user: UserResponse
    token: str

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: UUID
    user_id: UUID
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    completed: int
    pending: int

# Database setup
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession as SQLAlchemyAsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./todo_app.db")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=SQLAlchemyAsyncSession, expire_on_commit=False)

# SQLModel definitions
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    user_id: UUID = Field(index=True)  # Foreign key to user
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)

# Dependency
async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

# JWT functions
def create_access_token(user_id: UUID) -> str:
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())) -> str:
    return verify_token(credentials.credentials)

# App setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Authentication routes
@app.post("/api/auth/signup", response_model=UserWithToken)
async def signup(user_data: UserCreate, session: AsyncSession = Depends(get_session)):
    # Check if user already exists
    result = await session.execute(select(User).where(User.email == user_data.email))
    existing_user = result.first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Create new user
    password_hash = hash_password(user_data.password)
    new_user = User(email=user_data.email, password_hash=password_hash)
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    # Generate token
    token = create_access_token(new_user.id)

    return UserWithToken(
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            created_at=new_user.created_at
        ),
        token=token
    )

@app.post("/api/auth/signin", response_model=UserWithToken)
async def signin(user_data: UserLogin, session: AsyncSession = Depends(get_session)):
    # Find user by email
    result = await session.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    # Verify password
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate token
    token = create_access_token(user.id)

    return UserWithToken(
        user=UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at
        ),
        token=token
    )

@app.post("/api/auth/signout")
async def signout(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    # Verify token
    try:
        verify_token(credentials.credentials)
    except HTTPException:
        pass

    return {"message": "Successfully signed out"}

# Task routes
@app.get("/api/tasks", response_model=TaskListResponse)
async def list_tasks(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
    limit: int = 100,
    offset: int = 0
):
    user_uuid = UUID(user_id)

    # Get user's tasks
    result = await session.execute(
        select(Task)
        .where(Task.user_id == user_uuid)
        .order_by(Task.created_at.desc())  # Order by creation date, newest first
        .offset(offset)
        .limit(limit)
    )
    tasks = result.scalars().all()

    # Count statistics
    total_result = await session.execute(select(func.count(Task.id)).where(Task.user_id == user_uuid))
    total = total_result.scalar_one() or 0

    completed_result = await session.execute(
        select(func.count(Task.id))
        .where(Task.user_id == user_uuid, Task.completed == True)
    )
    completed = completed_result.scalar_one() or 0

    pending = total - completed

    return TaskListResponse(
        tasks=[
            TaskResponse(
                id=task.id,
                title=task.title,
                description=task.description,
                completed=task.completed,
                user_id=task.user_id,
                created_at=task.created_at,
                completed_at=task.completed_at
            )
            for task in tasks
        ],
        total=total,
        completed=completed,
        pending=pending
    )

@app.post("/api/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    user_uuid = UUID(user_id)

    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        user_id=user_uuid
    )
    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)

    return TaskResponse(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        completed=new_task.completed,
        user_id=new_task.user_id,
        created_at=new_task.created_at,
        completed_at=new_task.completed_at
    )

@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    user_uuid = UUID(user_id)

    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=task.user_id,
        created_at=task.created_at,
        completed_at=task.completed_at
    )

@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    user_uuid = UUID(user_id)

    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update fields
    task.title = task_update.title
    task.description = task_update.description

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=task.user_id,
        created_at=task.created_at,
        completed_at=task.completed_at
    )

@app.delete("/api/tasks/{task_id}")
async def delete_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    user_uuid = UUID(user_id)

    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()

    return {"message": "Task deleted successfully"}

@app.patch("/api/tasks/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    user_uuid = UUID(user_id)

    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Toggle completion
    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None

    await session.commit()
    await session.refresh(task)

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=task.user_id,
        created_at=task.created_at,
        completed_at=task.completed_at
    )

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Todo API - Phase II", "docs": "/docs", "health": "/health"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)