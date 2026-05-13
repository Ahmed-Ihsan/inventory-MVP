@echo off
REM Build Combined Backend + Frontend EXE
REM This script builds the React frontend and packages it with the backend into a single EXE

echo ========================================
echo Building Combined Backend + Frontend EXE
echo ========================================

REM Step 1: Build React frontend
echo.
echo Step 1: Building React frontend...
cd ..\frontend
call npm run build
if errorlevel 1 (
    echo ERROR: React build failed
    pause
    exit /b 1
)

REM Step 2: Copy build folder to backend
echo.
echo Step 2: Copying React build to backend...
xcopy build ..\backend\build /E /I /Y
if errorlevel 1 (
    echo ERROR: Failed to copy build folder
    pause
    exit /b 1
)

REM Step 3: Build backend EXE
echo.
echo Step 3: Building backend EXE with PyInstaller...
cd ..\backend
call venv\Scripts\activate
call pyinstaller --clean inventory_backend.spec
if errorlevel 1 (
    echo ERROR: PyInstaller build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Output location: backend\dist\inventory_backend\
echo EXE file: inventory_backend.exe
echo.
echo To run: .\dist\inventory_backend\inventory_backend.exe
echo.

pause
