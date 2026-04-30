@echo off
REM AI Task Platform - Local Development Startup Script

echo.
echo ========================================
echo   AI Task Platform Startup
echo ========================================
echo.

REM Start MongoDB in background
echo [1] Starting MongoDB...
start "MongoDB" cmd /k mongod --dbpath %APPDATA%\MongoDB\data

REM Wait for MongoDB to start
timeout /t 3 /nobreak

REM Start Redis in background  
echo [2] Starting Redis...
start "Redis" cmd /k redis-server

REM Wait for Redis to start
timeout /t 2 /nobreak

REM Start Backend
echo [3] Starting Backend (Port 5000)...
start "Backend" cmd /k cd /d "%~dp0backend" && npm run dev

REM Wait for Backend to start
timeout /t 3 /nobreak

REM Start Worker
echo [4] Starting Worker...
start "Worker" cmd /k cd /d "%~dp0worker" && npm run dev

REM Wait for Worker to start
timeout /t 2 /nobreak

REM Start Frontend
echo [5] Starting Frontend (Port 5173)...
start "Frontend" cmd /k cd /d "%~dp0frontend" && npm run dev

echo.
echo ========================================
echo   ✓ All services started!
echo ========================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:5000
echo MongoDB:   localhost:27017
echo Redis:     localhost:6379
echo.
echo Close any window to stop that service
echo Close all windows to stop the platform
echo.
pause
