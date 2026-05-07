@echo off
chcp 65001 >nul
title Inventory Management System - Frontend

echo ========================================
echo Starting Frontend Server
echo ========================================
echo.

cd frontend

echo Installing dependencies...
call npm install
echo [OK] Dependencies installed

echo.
echo Starting React development server...
echo Frontend will be available at: http://localhost:3000
echo.
npm start
