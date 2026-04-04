# ========================================
# WIN Marketplace - Setup Scripts
# ========================================
# 
# Para usar este arquivo no Windows:
# 1. Copie como: start-servers.bat
# 2. Instale as dependências necessárias
# 3. Configure o .env conforme .env.example
# 4. Execute este script
#

@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ======================================
echo  WIN Marketplace - Startup Script
echo ======================================
echo.

REM ========================================
REM Verificar se backends estão instalados
REM ========================================
echo [1/4] Verificando prerequisites...
where java >nul 2>nul
if errorlevel 1 (
    echo ERROR: Java nao encontrado. Instale Java 21+
    exit /b 1
)

where mvn >nul 2>nul || (
    if not exist "backend\mvnw.cmd" (
        echo ERROR: Maven nao encontrado
        exit /b 1
    )
)

REM ========================================
REM Compilar Backend
REM ========================================
echo.
echo [2/4] Compilando backend (Spring Boot)...
cd backend
call mvnw clean package -q -DskipTests
if errorlevel 1 (
    echo ERROR: Falha ao compilar backend
    exit /b 1
)
cd ..

REM ========================================
REM Instalar Frontend
REM ========================================
echo.
echo [3/4] Instalando dependencias frontend (Node.js)...
where npm >nul 2>nul
if errorlevel 1 (
    echo WARNING: npm nao encontrado. Instalando dependencias manualmente...
)
cd win-frontend
call npm install --silent
if errorlevel 1 (
    echo ERROR: Falha ao instalar dependencias do frontend
    exit /b 1
)
cd ..

REM ========================================
REM Iniciar Servidores
REM ========================================
echo.
echo [4/4] Iniciando servidores...
echo.
echo IMPORTANTE: Este script vai iniciar TWO terminals
echo - Terminal 1: Backend (Spring Boot - porta 8080)
echo - Terminal 2: Frontend (Vite - porta 3000)
echo.
echo Aguarde... pressionando Enter em cada janela
echo.

REM Backend
start "WIN Backend" cmd /k "cd backend && mvnw spring-boot:run"
timeout /t 3

REM Frontend
start "WIN Frontend" cmd /k "cd win-frontend && npm run dev"

echo.
echo ======================================
echo  Servidores iniciados!
echo ======================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8080
echo Docs:      http://localhost:8080/swagger-ui.html
echo.
echo Pressione Ctrl+C em cada janela para parar
echo.
pause

endlocal
