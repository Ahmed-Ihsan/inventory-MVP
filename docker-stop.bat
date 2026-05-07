@echo off
echo ============================================
echo Stopping Inventory Management System
echo ============================================
echo.

echo Stopping containers...
docker-compose down

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo Application stopped successfully!
    echo ============================================
) else (
    echo.
    echo ============================================
    echo Failed to stop! Check the errors above.
    echo ============================================
    pause
)
