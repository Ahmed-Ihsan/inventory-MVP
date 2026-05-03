@echo off
echo Starting Inventory Management System...
echo.

echo Starting Backend (FastAPI)...
start "Backend Server" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend (React)...
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
