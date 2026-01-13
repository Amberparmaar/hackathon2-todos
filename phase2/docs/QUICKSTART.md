# Quickstart Guide: Phase II Full-Stack Multi-User Web Application

## Task Reference: T-BONUS-002
## Spec Reference: @phase2/specs/quickstart.md template

## Overview
This guide provides step-by-step instructions to set up, develop, and run the Phase II Full-Stack Multi-User Web Application with authentication and task management.

## Prerequisites
- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **npm** or **yarn** package managers
- **Git** for version control
- **SQLite** (included with Python) or access to Neon PostgreSQL database

## Repository Structure
```
phase2/
├── backend/                    # FastAPI + SQLModel backend
│   ├── src/
│   │   ├── models/            # SQLModel database models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── api/               # API routes (auth, tasks)
│   │   ├── core/              # Core functionality (security, database)
│   │   └── main.py            # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   └── tests/                 # Backend test suite
├── frontend/                   # Next.js 16+ frontend
│   ├── src/
│   │   ├── app/              # App Router pages (signin, signup, dashboard)
│   │   ├── components/        # Reusable UI components (TaskCard, TaskForm, etc.)
│   │   ├── lib/               # Utilities (API client, auth)
│   │   └── types/             # TypeScript types
│   ├── package.json           # Node.js dependencies
│   ├── next.config.js         # Next.js configuration
│   └── tests/                 # Frontend test suite
├── specs/                     # Phase 2 specifications
└── docs/                      # Documentation
```

## Backend Setup

### 1. Navigate to Backend Directory
````
cd phase2/backend
````

### 2. Create Virtual Environment
````
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
````

### 3. Install Dependencies
````
pip install -r requirements.txt
````
Dependencies include:
- FastAPI (web framework)
- SQLModel (ORM)
- PyJWT (authentication)
- bcrypt (password hashing)
- pytest (testing)

### 4. Set Environment Variables
Create a `.env` file in the backend root:
````
DATABASE_URL=postgresql://username:password@host:port/database_name
# Or for local development with SQLite:
# DATABASE_URL=sqlite+aiosqlite:///./todo_app.db

BETTER_AUTH_SECRET=your-super-secret-key-here
````

### 5. Initialize Database
````
python -m src.init_db
````
This creates the required tables for users and tasks.

## Frontend Setup

### 1. Navigate to Frontend Directory
````
cd phase2/frontend
````

### 2. Install Dependencies
````
npm install
````
This installs all required packages including:
- Next.js 16+
- React and React DOM
- Tailwind CSS
- TypeScript

### 3. Configure Environment Variables
Create a `.env.local` file in the frontend root:
````
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_SECRET=your-super-secret-key-here
````
Ensure this matches the backend configuration.

## Running the Application

### Backend Server
````
cd phase2/backend
source venv/bin/activate  # Activate virtual environment
python -m src.main
````
The backend will start on `http://localhost:8000` with:
- API endpoints at `/api/*`
- Documentation at `/docs`
- Health check at `/health`

### Frontend Server
````
cd phase2/frontend
npm run dev
````
The frontend will start on `http://localhost:3000` with:
- Sign-in page at `/signin`
- Sign-up page at `/signup`
- Dashboard at `/dashboard`

## Development Commands

### Backend Development
````
# Run tests
pytest

# Run tests with coverage
pytest --cov=src

# Run with auto-reload
python -m src.main
````

### Frontend Development
````
# Run development server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run type-check
````

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Task Endpoints
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/toggle` - Toggle task completion

## Database Schema

### Users Table
- `id`: UUID (primary key)
- `email`: VARCHAR (unique, indexed)
- `password_hash`: VARCHAR (hashed password)
- `created_at`: TIMESTAMP (auto-generated)

### Tasks Table
- `id`: UUID (primary key)
- `title`: VARCHAR (max 200, not null)
- `description`: TEXT (nullable)
- `completed`: BOOLEAN (default false)
- `user_id`: UUID (foreign key to users.id)
- `created_at`: TIMESTAMP (auto-generated)
- `completed_at`: TIMESTAMP (nullable)

## Testing

### Backend Tests
````
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage report
pytest --cov=src --cov-report=html

# Run tests with verbose output
pytest -v
````

### Frontend Tests
````
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
````

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend runs on port 8000 by default
   - Frontend runs on port 3000 by default
   - Change ports in configuration if conflicts occur

2. **Environment Variables Missing**
   - Ensure all required environment variables are set
   - Check that `.env` files are properly configured

3. **Database Connection Errors**
   - Verify database URL is correct
   - Ensure database server is running
   - Check that credentials are valid

4. **JWT Secret Issues**
   - Ensure `BETTER_AUTH_SECRET` is the same in both frontend and backend
   - Use a strong, random secret key

5. **CORS Issues**
   - Verify frontend origin is allowed in backend CORS configuration
   - Check that API endpoints are properly configured

### Verification Checklist
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] API endpoints return expected responses
- [ ] Authentication flow works (signup → signin → dashboard → signout)
- [ ] Task CRUD operations work correctly
- [ ] User isolation is enforced (users can't access others' tasks)
- [ ] Tests pass successfully
- [ ] Environment variables are properly configured

## Next Steps
1. Customize UI components in `frontend/src/components/`
2. Extend task features in `backend/src/api/tasks.py`
3. Add new API endpoints as needed
4. Enhance test coverage
5. Deploy to production environment

## Support
For issues with the setup, check the existing documentation in `phase2/specs/` or consult the implementation files directly.