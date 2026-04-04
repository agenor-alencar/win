@echo off
REM ============================================
REM START BACKEND + FRONTEND SERVERS
REM ============================================

echo.
echo ===================================================
echo   PHASE 9 - STARTING BACKEND + FRONTEND
echo ===================================================
echo.

REM Start Backend in new window
echo [1/2] Starting Backend on port 8080...
start "WIN Marketplace Backend" cmd /k cd /d c:\Users\user\OneDrive\Documentos\win\backend ^& mvnw.cmd spring-boot:run

REM Wait for backend to start
timeout /t 5

REM Start Frontend in new window  
echo [2/2] Starting Frontend on port 5173...
start "WIN Marketplace Frontend" cmd /k cd /d c:\Users\user\OneDrive\Documentos\win\win-frontend ^& npm run dev

echo.
echo ===================================================
echo   SERVERS STARTED!
echo ===================================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo WebSocket: ws://localhost:8080/ws/connect
echo.
echo Check the new windows for server output.
echo.
pause
