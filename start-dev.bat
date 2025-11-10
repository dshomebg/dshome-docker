@echo off
echo ========================================
echo DSHome Development Environment Starter
echo ========================================
echo.

REM Kill processes on ports 4000 (backend) and 3001 (admin)
echo [1/5] Killing processes on ports 4000 and 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    echo   - Killing backend process %%a
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo   - Killing admin process %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo   Done!
echo.

REM Wait a moment for ports to free up
timeout /t 2 /nobreak >nul

REM Start Docker services
echo [2/5] Starting Docker services (PostgreSQL, Redis, Meilisearch)...
docker compose -f docker\docker-compose.dev.yml up -d
if errorlevel 1 (
    echo   ERROR: Failed to start Docker services
    pause
    exit /b 1
)
echo   Done!
echo.

REM Wait for services to be ready
echo [3/5] Waiting for services to be ready...
timeout /t 5 /nobreak >nul
echo   Done!
echo.

REM Start backend dev server in new window
echo [4/5] Starting backend dev server...
start "DSHome Backend" cmd /k "cd /d %~dp0packages\backend && pnpm dev"
echo   Backend started in new window
echo.

REM Wait a moment before starting admin
timeout /t 2 /nobreak >nul

REM Start admin dev server in new window
echo [5/5] Starting admin dev server...
start "DSHome Admin" cmd /k "cd /d %~dp0packages\admin && pnpm dev"
echo   Admin started in new window
echo.

echo ========================================
echo Development environment started!
echo ========================================
echo.
echo Backend: http://localhost:4000/api/
echo Admin:   http://localhost:3001/
echo.
echo Check the opened windows for logs.
echo.
pause
