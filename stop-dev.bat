@echo off
echo ========================================
echo DSHome Development Environment Stopper
echo ========================================
echo.

REM Kill backend and admin processes
echo [1/2] Killing backend and admin processes...
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

REM Stop Docker services
echo [2/2] Stopping Docker services...
docker compose -f docker\docker-compose.dev.yml down
if errorlevel 1 (
    echo   WARNING: Failed to stop Docker services
) else (
    echo   Done!
)
echo.

echo ========================================
echo Development environment stopped!
echo ========================================
echo.
pause
