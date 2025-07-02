@echo off
echo ========================================
echo   Starting Care Coordination System
echo ========================================
echo.

echo Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo Starting the care coordination system...
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start the system!
    echo Please check that Docker Desktop is running.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   System Started! 🎉
echo ========================================
echo.
echo 🌐 Open your web browser and go to:
echo    http://localhost:3004
echo.
echo 🔑 Login with:
echo    Email: admin@carecompany.com
echo    Password: password123
echo.
echo Press any key to open the website...
pause >nul

start http://localhost:3004
