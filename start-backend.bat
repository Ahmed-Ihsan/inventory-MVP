@echo off
chcp 65001 >nul
title Inventory Management System - Backend

echo ========================================
echo Starting Backend Server
echo ========================================
echo.

cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
)

echo Activating virtual environment...
call venv\Scripts\activate
echo [OK] Virtual environment activated

echo.
echo Installing dependencies...
pip install -r requirements.txt
echo [OK] Dependencies installed

echo.
echo Running database migrations...
alembic upgrade head
echo [OK] Migrations completed

echo.
echo Starting FastAPI server...
echo Backend will be available at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
