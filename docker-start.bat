@echo off
echo ============================================
echo Starting Inventory Management System
echo ============================================
echo.

echo Starting containers...
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo Application started successfully!
    echo ============================================
    echo.
    echo Frontend: http://localhost
    echo API Docs: http://localhost/docs
) else (
    echo.
    echo ============================================
    echo Failed to start! Check the errors above.
    echo ============================================
    pause
)
