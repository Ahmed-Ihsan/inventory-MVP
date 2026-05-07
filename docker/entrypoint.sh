#!/bin/bash
# Initialize database if it doesn't exist
cd /app

# Create data directory if it doesn't exist
mkdir -p /app/backend/data

# Run alembic migrations if alembic.ini exists
if [ -f "alembic.ini" ]; then
    alembic upgrade head 2>/dev/null || echo "Skipping alembic migration"
fi

# Execute the CMD
exec "$@"
