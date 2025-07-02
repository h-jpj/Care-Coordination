@echo off
echo ========================================
echo   Stopping Care Coordination System
echo ========================================
echo.

echo Stopping all containers...
docker-compose down

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to stop the system!
    echo The system may not be running.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   System Stopped! ✓
echo ========================================
echo.
echo The care coordination system has been stopped.
echo.
echo To start it again, run: start-windows.bat
echo.
pause
