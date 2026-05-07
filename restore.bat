@echo off
echo ============================================
echo Inventory Management System - Data Restore
echo ============================================
echo.

REM Check if backup directory is provided
if "%~1"=="" (
    echo Usage: restore.bat [backup_folder_name]
    echo.
    echo Available backups:
    dir /B backups
    echo.
    echo Example: restore.bat 20260705-033409
    pause
    exit /b 1
)

set BACKUP_DIR=backups\%1

REM Check if backup exists
if not exist "%BACKUP_DIR%\data" (
    echo Error: Backup not found at %BACKUP_DIR%
    pause
    exit /b 1
)

REM Stop container if running
echo Stopping container...
docker-compose down

REM Restore data
echo Restoring data from %BACKUP_DIR% to backend\data...
xcopy "%BACKUP_DIR%\data" "backend\data\" /E /I /H /Y

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo Restore completed successfully!
    echo ============================================
    echo.
    echo Starting container...
    docker-compose up -d
    
    if %errorlevel% equ 0 (
        echo Container started successfully!
        echo.
        echo Frontend: http://localhost
        echo API Docs: http://localhost/docs
    ) else (
        echo Failed to start container. Run: docker-compose up -d
    )
) else (
    echo.
    echo ============================================
    echo Restore failed! Error code: %errorlevel%
    echo ============================================
)

pause
