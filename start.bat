@echo off
title SharedChat Scanner - Startup
echo ===================================================
echo    SHAREDCHAT SCANNER - QUICK START UP
echo ===================================================
echo.
echo [1/2] Starting backend server (Port 3001)...
start "Scanner Backend" cmd /c "cd server && npm run dev"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak > /dev/null

echo [2/2] Starting frontend server and opening browser...
start "Scanner Frontend" cmd /c "npm run dev -- --open"

echo.
echo All services started! 
echo Close this window to exit the startup script (Servers will keep running in their own windows).
pause > /dev/null
