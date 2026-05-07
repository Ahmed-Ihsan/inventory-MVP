@echo off
echo ============================================
echo Building Docker Image for Inventory System
echo ============================================
echo.

echo Step 1: Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 2: Building Docker image...
docker-compose build

if %errorlevel% neq 0 (
    echo.
    echo ============================================
    echo Build failed! Check the errors above.
    echo ============================================
    pause
    exit /b 1
)

echo.
echo Step 3: Starting container...
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo Build and start completed successfully!
    echo ============================================
    echo.
    echo Frontend: http://localhost
    echo API Docs: http://localhost/docs
) else (
    echo.
    echo ============================================
    echo Failed to start container!
    echo ============================================
    pause
)
