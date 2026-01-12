"""
Database initialization script for Phase II Full-Stack Multi-User Web Application.

Task Reference: T-006
Spec Reference: @phase2/specs/data-model.md - Database Migration Strategy

This script creates database tables on first run.
"""

import sys
from pathlib import Path

# Add src directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from phase2.backend.src.core.database import engine, init_db, test_connection


def main():
    """
    Main initialization function.

    T-006: Creates tables if not exist (idempotent)
    T-006: Handles connection errors gracefully
    T-006: Can be run independently
    T-006: Script can be executed via `python init_db.py`
    """
    print("Starting database initialization...")

    # T-006: Database connection can be established using DATABASE_URL
    if not test_connection():
        print("❌ Failed to connect to database. Please check DATABASE_URL.")
        sys.exit(1)

    print("✅ Database connection successful")

    # T-006: Creates tables if not exist (idempotent)
    try:
        init_db()
        print("✅ Database tables created successfully")
        print("✅ Database initialization complete")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
