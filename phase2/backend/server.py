"""
Simple standalone server for Phase II Full-Stack Multi-User Web Application with AI Chatbot.
"""

import asyncio
import os
import re
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

# Import cohere for AI integration
try:
    import cohere
    COHERE_AVAILABLE = True
except ImportError:
    COHERE_AVAILABLE = False
    print("Warning: Cohere not installed. Install with 'pip install cohere'")

# Configuration
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "my-super-secret-key")
ALGORITHM = "HS256"

# Models

# Conversation models
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    __table_args__ = {'extend_existing': True}  # Allow redefinition

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True)  # Foreign key to user
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Message(SQLModel, table=True):
    __tablename__ = "messages"
    __table_args__ = {'extend_existing': True}  # Allow redefinition

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(index=True)  # Foreign key to conversation
    role: str = Field(regex="^(user|assistant)$")  # user or assistant
    content: str = Field(max_length=10000)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Chat request/response models
class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ToolCall(BaseModel):
    name: str
    arguments: dict

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    tool_calls: list[ToolCall] = []
    message_id: str

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
    due_date: Optional[datetime] = None

class TaskUpdate(TaskBase):
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: UUID
    user_id: UUID
    completed: bool
    due_date: Optional[datetime] = None
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

# Handle async driver for PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./todo_app.db")
if DATABASE_URL.startswith("postgresql://"):
    # Replace with asyncpg driver and clean up incompatible parameters
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    # Remove parameters not supported by asyncpg
    DATABASE_URL = re.sub(r'[&?]sslmode=[^&]*', '', DATABASE_URL)
    DATABASE_URL = re.sub(r'[&?]channel_binding=[^&]*', '', DATABASE_URL)
    # Ensure we have a clean URL
    DATABASE_URL = DATABASE_URL.replace('?&', '?').rstrip('&')
elif DATABASE_URL.startswith("postgres://"):  # Alternative format
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    # Remove parameters not supported by asyncpg
    DATABASE_URL = re.sub(r'[&?]sslmode=[^&]*', '', DATABASE_URL)
    DATABASE_URL = re.sub(r'[&?]channel_binding=[^&]*', '', DATABASE_URL)
    # Ensure we have a clean URL
    DATABASE_URL = DATABASE_URL.replace('?&', '?').rstrip('&')

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
    pool_timeout=30,     # Timeout for getting connection from pool
    pool_reset_on_return='commit'  # Reset connection when returning to pool
)
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
    due_date: Optional[datetime] = Field(default=None)
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
    # Create tables with checkfirst=True to avoid duplicate errors on restart
    try:
        async with engine.begin() as conn:
            # Import all models to ensure they're registered with SQLModel
            from sqlmodel import SQLModel
            # Use checkfirst=True to skip existing tables/indexes
            await conn.run_sync(
                lambda sync_conn: SQLModel.metadata.create_all(sync_conn, checkfirst=True)
            )
            print("Database tables initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        # Don't raise the exception here to avoid crashing the app
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        due_date=task_data.due_date,
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
        due_date=new_task.due_date,
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
    task.due_date = task_update.due_date

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=task.user_id,
        due_date=task.due_date,
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

# Chat request/response models
class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ToolCall(BaseModel):
    name: str
    arguments: dict

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    tool_calls: list[ToolCall] = []
    message_id: str


# Helper function to initialize Cohere client
def get_cohere_client():
    if not COHERE_AVAILABLE:
        return None

    api_key = os.getenv("COHERE_API_KEY")
    if not api_key:
        print("Warning: COHERE_API_KEY not set in environment")
        return None

    try:
        client = cohere.Client(api_key)
        return client
    except Exception as e:
        print(f"Error initializing Cohere client: {e}")
        return None

# Tool functions for the AI to use
async def add_task_tool(session: AsyncSession, user_id: UUID, title: str, description: Optional[str] = None):
    """Tool to add a new task to the user's list."""
    new_task = Task(
        title=title,
        description=description,
        user_id=user_id,
        completed=False
    )
    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)

    return {
        "success": True,
        "task_id": str(new_task.id),
        "message": f"Added task '{title}' successfully"
    }

async def list_tasks_tool(session: AsyncSession, user_id: UUID, status: Optional[str] = "all"):
    """Tool to list tasks for the user."""
    query = select(Task).where(Task.user_id == user_id)

    if status == "pending":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)

    result = await session.execute(query)
    tasks = result.scalars().all()

    return {
        "success": True,
        "tasks": [
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed
            }
            for task in tasks
        ]
    }

async def complete_task_tool(session: AsyncSession, user_id: UUID, task_id: str):
    """Tool to mark a task as completed."""
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        return {"success": False, "message": "Invalid task ID format"}

    result = await session.execute(
        select(Task).where(Task.id == task_uuid, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        return {"success": False, "message": "Task not found or access denied"}

    task.completed = True
    task.completed_at = datetime.utcnow()
    session.add(task)
    await session.commit()

    return {
        "success": True,
        "message": f"Task '{task.title}' marked as completed"
    }

async def delete_task_tool(session: AsyncSession, user_id: UUID, task_id: str):
    """Tool to delete a task from the user's list."""
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        return {"success": False, "message": "Invalid task ID format"}

    result = await session.execute(
        select(Task).where(Task.id == task_uuid, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        return {"success": False, "message": "Task not found or access denied"}

    await session.delete(task)
    await session.commit()

    return {
        "success": True,
        "message": f"Task '{task.title}' deleted successfully"
    }

async def update_task_tool(session: AsyncSession, user_id: UUID, task_id: str, title: Optional[str] = None, description: Optional[str] = None):
    """Tool to update a task in the user's list."""
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        return {"success": False, "message": "Invalid task ID format"}

    result = await session.execute(
        select(Task).where(Task.id == task_uuid, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        return {"success": False, "message": "Task not found or access denied"}

    if title:
        task.title = title
    if description is not None:  # Allow empty string
        task.description = description

    session.add(task)
    await session.commit()

    return {
        "success": True,
        "message": f"Task '{task.title}' updated successfully"
    }

# Define the tools for Cohere
TODO_TOOLS = [
    {
        "name": "add_task",
        "description": "Add a new task to the user's task list",
        "parameter_definitions": {
            "title": {"type": "str", "required": True, "description": "Title of the task"},
            "description": {"type": "str", "required": False, "description": "Optional description of the task"}
        }
    },
    {
        "name": "list_tasks",
        "description": "List tasks for the user, optionally filtered by status",
        "parameter_definitions": {
            "status": {"type": "str", "required": False, "description": "Filter by status: all, pending, or completed", "default": "all"}
        }
    },
    {
        "name": "complete_task",
        "description": "Mark a task as completed",
        "parameter_definitions": {
            "task_id": {"type": "str", "required": True, "description": "ID of the task to complete"}
        }
    },
    {
        "name": "delete_task",
        "description": "Delete a task from the user's task list",
        "parameter_definitions": {
            "task_id": {"type": "str", "required": True, "description": "ID of the task to delete"}
        }
    },
    {
        "name": "update_task",
        "description": "Update a task in the user's task list",
        "parameter_definitions": {
            "task_id": {"type": "str", "required": True, "description": "ID of the task to update"},
            "title": {"type": "str", "required": False, "description": "New title for the task (optional)"},
            "description": {"type": "str", "required": False, "description": "New description for the task (optional)"}
        }
    }
]

async def process_with_cohere(user_id: str, message: str, session: AsyncSession):
    """Process message with Cohere AI and execute tools as needed."""
    cohere_client = get_cohere_client()

    if not cohere_client:
        # Fallback to simple rule-based processing if Cohere is not available
        return await process_with_rules(user_id, message, session)

    try:
        # Get conversation history for context
        history_result = await session.execute(
            select(Message)
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Conversation.user_id == UUID(user_id))
            .order_by(Message.timestamp.asc())
        )
        history_messages = history_result.scalars().all()

        # Format conversation history for Cohere
        chat_history = []
        for msg in history_messages:
            if msg.role == "user":
                chat_history.append({"role": "USER", "message": msg.content})
            elif msg.role == "assistant":
                chat_history.append({"role": "CHATBOT", "message": msg.content})

        # Call Cohere with tools
        response = cohere_client.chat(
            message=message,
            chat_history=chat_history[-10:] if len(chat_history) > 10 else chat_history,  # Limit history to last 10 messages
            tools=TODO_TOOLS,
            model="command-r-plus"  # Using a capable model for tool use
        )

        # Check if Cohere wants to call any tools
        tool_calls = []
        if hasattr(response, 'tool_calls') and response.tool_calls:
            tool_results = []

            for tool_call in response.tool_calls:
                # Execute the tool
                result = await execute_tool(tool_call.name, tool_call.parameters, UUID(user_id), session)
                tool_results.append({
                    "call": tool_call,
                    "outputs": [result]
                })
                tool_calls.append(ToolCall(name=tool_call.name, arguments=tool_call.parameters))

            # If there were tool calls, get the final response from Cohere
            if tool_results:
                final_response = cohere_client.chat(
                    message=message,
                    chat_history=chat_history[-10:] + [{"role": "CHATBOT", "message": response.text}],
                    tools=TODO_TOOLS,
                    tool_results=tool_results,
                    model="command-r-plus"
                )

                return {
                    "response": final_response.text,
                    "tool_calls": tool_calls
                }

        # Return response if no tools were called
        return {
            "response": response.text,
            "tool_calls": []
        }

    except Exception as e:
        print(f"Error with Cohere processing: {e}")
        # Fallback to rule-based processing
        return await process_with_rules(user_id, message, session)

async def execute_tool(tool_name: str, parameters: dict, user_id: UUID, session: AsyncSession):
    """Execute a tool based on its name and parameters."""
    # Add user_id to parameters for tools that need it
    params = parameters.copy()
    if 'user_id' not in params:
        params['user_id'] = str(user_id)

    tool_functions = {
        "add_task": add_task_tool,
        "list_tasks": list_tasks_tool,
        "complete_task": complete_task_tool,
        "delete_task": delete_task_tool,
        "update_task": update_task_tool
    }

    func = tool_functions.get(tool_name)
    if not func:
        return {"error": f"Unknown tool: {tool_name}"}

    try:
        result = await func(session, UUID(params['user_id']), **{k: v for k, v in params.items() if k != 'user_id'})
        return result
    except Exception as e:
        return {"error": f"Tool execution failed: {str(e)}"}

async def process_with_rules(user_id: str, message: str, session: AsyncSession):
    """Fallback rule-based processing when Cohere is not available."""
    import re

    # Simple natural language processing
    user_msg_lower = message.lower()
    response_text = ""
    tool_calls = []

    # Check for add task command
    if "add" in user_msg_lower or "create" in user_msg_lower:
        # Try multiple patterns to extract task title
        task_title = None

        # Pattern 1: "add task to buy milk"
        match = re.search(r"(?:add|create)\s+(?:a\s+)?(?:task|todo)\s+to\s+(.+)", user_msg_lower)
        if match:
            task_title = match.group(1).strip()

        # Pattern 2: "add task buy milk"
        if not task_title:
            match = re.search(r"(?:add|create)\s+(?:a\s+)?(?:task|todo)\s+(.+)", user_msg_lower)
            if match:
                task_title = match.group(1).strip()

        # Pattern 3: "add buy milk"
        if not task_title:
            match = re.search(r"(?:add|create)\s+(.+)", user_msg_lower)
            if match:
                task_title = match.group(1).strip()
                # Remove common words
                task_title = re.sub(r'^(a|an|the|task|todo)\s+', '', task_title)

        if task_title and len(task_title) > 0:
            # Create task
            result = await add_task_tool(session, UUID(user_id), task_title, None)
            if result["success"]:
                response_text = f"I've added the task '{task_title}' to your list."
                tool_calls = [ToolCall(name="add_task", arguments={"task_id": result["task_id"], "title": task_title})]
            else:
                response_text = f"Failed to add task: {result['message']}"
        else:
            response_text = "I can help you add tasks. Try saying something like 'Add a task to buy groceries' or 'Add buy milk'."

    # Check for list tasks command
    elif "show" in user_msg_lower or "list" in user_msg_lower or "my tasks" in user_msg_lower:
        result = await list_tasks_tool(session, UUID(user_id), "all")
        if result["success"]:
            tasks = result["tasks"]
            if tasks:
                task_list = "\n".join([f"- {task['title']} ({'✓' if task['completed'] else '○'})" for task in tasks[:5]])  # Show first 5
                response_text = f"Here are your tasks:\n{task_list}\n\nYou have {len(tasks)} total tasks."
            else:
                response_text = "You don't have any tasks yet. You can add tasks by saying something like 'Add a task to buy groceries'."
            tool_calls = [ToolCall(name="list_tasks", arguments={"count": len(tasks)})]
        else:
            response_text = f"Failed to list tasks: {result['message']}"

    # Check for complete task command
    elif "complete" in user_msg_lower or "done" in user_msg_lower or "finish" in user_msg_lower:
        # Try to find a task ID in the message
        task_id_match = re.search(r'task\s+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})', user_msg_lower)
        if task_id_match:
            task_id = task_id_match.group(1)
            result = await complete_task_tool(session, UUID(user_id), task_id)
            response_text = result["message"]
            if result["success"]:
                tool_calls = [ToolCall(name="complete_task", arguments={"task_id": task_id, "title": "completed task"})]
        else:
            response_text = "I can help you mark tasks as complete. Try saying something like 'Mark task [task-id] as complete'."

    # Check for delete task command
    elif "delete" in user_msg_lower or "remove" in user_msg_lower or "cancel" in user_msg_lower:
        response_text = "I can help you delete tasks. Try saying something like 'Delete task [task-id]'."

    # Default response
    else:
        response_text = f"I received your message: '{message}'. I can help you manage your tasks. Try commands like 'Add a task to...', 'Show my tasks', or 'Mark task as complete'."

    return {
        "response": response_text,
        "tool_calls": tool_calls
    }

# Chat endpoints
@app.post("/api/{user_id}/chat", response_model=ChatResponse)
async def chat_endpoint(
    user_id: str,
    message_request: ChatMessageRequest,
    token_user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    Stateless chat endpoint that processes natural language commands
    and manages conversation history in the database
    """
    # Verify that the authenticated user matches the requested user_id
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot access another user's chat")

    # Verify that the user_id is valid
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Verify that the user exists
    user_result = await session.execute(select(User).where(User.id == user_uuid))
    current_user = user_result.scalar_one_or_none()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    # If no conversation_id provided, create a new one
    conversation_id = message_request.conversation_id
    if not conversation_id:
        # Create new conversation
        conversation = Conversation(user_id=user_uuid)
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)
        conversation_id = str(conversation.id)
    else:
        # Verify conversation belongs to user
        try:
            conv_uuid = UUID(conversation_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid conversation ID format")

        conv_result = await session.execute(
            select(Conversation).where(Conversation.id == conv_uuid, Conversation.user_id == user_uuid)
        )
        conversation = conv_result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

    # Save user's message to the conversation
    user_message = Message(
        conversation_id=UUID(conversation_id),
        role="user",
        content=message_request.message
    )
    session.add(user_message)
    await session.commit()

    # Process the message with AI (Cohere) or fallback rules
    result = await process_with_cohere(user_id, message_request.message, session)
    response_text = result["response"]
    tool_calls = result["tool_calls"]

    # Save assistant's response to the conversation
    assistant_message = Message(
        conversation_id=UUID(conversation_id),
        role="assistant",
        content=response_text
    )
    session.add(assistant_message)
    await session.commit()

    # Update conversation timestamp
    conversation_result = await session.execute(
        select(Conversation).where(Conversation.id == UUID(conversation_id))
    )
    conversation = conversation_result.scalar_one()
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    await session.commit()

    return ChatResponse(
        response=response_text,
        conversation_id=conversation_id,
        tool_calls=tool_calls,
        message_id=str(assistant_message.id)
    )


@app.get("/api/{user_id}/conversations")
async def get_user_conversations(
    user_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get list of conversation IDs for the user"""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Verify that the user exists
    user_result = await session.execute(select(User).where(User.id == user_uuid))
    current_user = user_result.scalar_one_or_none()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user's conversations
    result = await session.execute(
        select(Conversation)
        .where(Conversation.user_id == user_uuid)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()

    return {
        "conversations": [
            {
                "id": str(conv.id),
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat()
            }
            for conv in conversations
        ]
    }


@app.get("/api/{user_id}/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    user_id: str,
    conversation_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get messages from a specific conversation"""
    try:
        user_uuid = UUID(user_id)
        conv_uuid = UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    # Verify that the user exists
    user_result = await session.execute(select(User).where(User.id == user_uuid))
    current_user = user_result.scalar_one_or_none()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify conversation belongs to user
    conv_result = await session.execute(
        select(Conversation).where(Conversation.id == conv_uuid, Conversation.user_id == user_uuid)
    )
    conversation = conv_result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get conversation messages
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conv_uuid)
        .order_by(Message.timestamp.asc())
    )
    messages = result.scalars().all()

    return {
        "messages": [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in messages
        ]
    }


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Todo API - Phase II with AI Chatbot Integration",
        "features": ["authentication", "task_management", "ai_chatbot"],
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "auth": "/api/auth/*",
            "tasks": "/api/tasks/*",
            "chat": "/api/{user_id}/chat",
            "conversations": "/api/{user_id}/conversations"
        }
    }

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)