@echo off
echo ============================================
echo Inventory Management System - Data Backup
echo ============================================
echo.

REM Create timestamp using date and time variables
set YEAR=%date:~-4,4%
set MONTH=%date:~-7,2%
set DAY=%date:~-10,2%
set HOUR=%time:~0,2%
set MINUTE=%time:~3,2%
set SECOND=%time:~6,2%
set TIMESTAMP=%YEAR%%MONTH%%DAY%-%HOUR%%MINUTE%%SECOND%

REM Remove spaces from timestamp
set TIMESTAMP=%TIMESTAMP: =0%

set BACKUP_DIR=backups\%TIMESTAMP%

REM Create backup directory
if not exist "backups" mkdir backups
mkdir "%BACKUP_DIR%"

REM Copy data directory
echo Backing up data from backend\data to %BACKUP_DIR%...
xcopy "backend\data" "%BACKUP_DIR%\data\" /E /I /H /Y

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo Backup completed successfully!
    echo ============================================
    echo Backup location: %BACKUP_DIR%
    echo.
    echo To restore on another PC:
    echo   1. Copy the entire %BACKUP_DIR% folder
    echo   2. Replace backend\data with the backed up data
) else (
    echo.
    echo ============================================
    echo Backup failed! Error code: %errorlevel%
    echo ============================================
)

pause
