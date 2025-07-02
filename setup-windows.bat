@echo off
echo ========================================
echo   Care Coordination System Setup
echo ========================================
echo.
echo This will set up the care coordination system on your Windows machine.
echo Make sure Docker Desktop is installed and running!
echo.
pause

echo Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo.
    echo Please:
    echo 1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo 2. Start Docker Desktop
    echo 3. Wait for the whale icon to appear in your system tray
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo Docker is running! ✓
echo.

echo Stopping any existing containers...
docker-compose down >nul 2>&1

echo Building and starting the care coordination system...
echo This may take 5-10 minutes the first time as it downloads everything.
echo.

docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start the system!
    echo Please check that:
    echo - Docker Desktop is running
    echo - Ports 3003 and 3004 are not in use
    echo - You have internet connection
    echo.
    pause
    exit /b 1
)

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   Setup Complete! 🎉
echo ========================================
echo.
echo Your care coordination system is now running!
echo.
echo 🌐 Open your web browser and go to:
echo    http://localhost:3004
echo.
echo 🔑 Login with:
echo    Email: admin@carecompany.com
echo    Password: password123
echo.
echo 📋 To stop the system later, run: stop-windows.bat
echo 📋 To start it again, run: start-windows.bat
echo.
echo Press any key to open the website...
pause >nul

start http://localhost:3004
