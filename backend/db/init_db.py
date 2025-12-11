"""
Database initialization script.

Run this script to create all database tables:
    python -m db.init_db
"""

from db.database import engine, Base
from models import User, CloudAccount, DailyCost, Anomaly


def init_db():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ All tables created successfully!")


def drop_all_tables():
    """Drop all database tables (use with caution!)."""
    print("WARNING: Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    print("✓ All tables dropped!")


if __name__ == "__main__":
    init_db()
