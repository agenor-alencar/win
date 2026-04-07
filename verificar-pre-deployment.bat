@echo off
REM ============================================
REM VERIFICAÇÃO PRÉ-DEPLOYMENT
REM Checklist completo antes de ir para VPS
REM ============================================

setlocal enabledelayedexpansion
color 0A

echo:
echo ============================================
echo VERIFICACAO PRE-DEPLOYMENT
echo ============================================
echo:

REM Verificar Git
echo [*] Verificando Git...
git status >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [X] Git nao esta disponivel!
    exit /b 1
)
echo [OK] Git disponivel
echo:

REM Verificar se ha arquivos modificados nao commitados
echo [*] Verificando arquivos modificados...
git status --porcelain >temp_git_status.txt
for /f "tokens=*" %%A in (temp_git_status.txt) do (
    set line=%%A
    if not "!line!"=="" (
        REM Ignorar documentos .md
        if not "!line:~3!" == "*.md" (
            echo [!] Arquivo modificado: !line!
        )
    )
)
del temp_git_status.txt

REM Verificar Docker
echo:
echo [*] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [X] Docker nao esta disponivel!
    exit /b 1
)
echo [OK] Docker disponivel
echo:

REM Verificar containers locais
echo [*] Verificando containers locais...
docker ps | findstr "win-marketplace-db" >nul
if %errorlevel% neq 0 (
    color 0C
    echo [!] PostgreSQL nao esta rodando localmente (OK se voe apenas fara push)
) else (
    echo [OK] PostgreSQL container rodando
)

docker ps | findstr "win-marketplace-backend" >nul
if %errorlevel% neq 0 (
    echo [!] Backend nao esta rodando localmente (OK se voc apenas fara push)
) else (
    echo [OK] Backend container rodando
)
echo:

REM Verificar arquivos críticos existem
echo [*] Verificando arquivos criticos...
set missing=0

if not exist "backend\src\main\java\com\win\marketplace\service\OtpService.java" (
    echo [X] OtpService.java nao encontrado!
    set missing=1
) else (
    echo [OK] OtpService.java
)

if not exist "database\init.sql" (
    echo [X] init.sql nao encontrado!
    set missing=1
) else (
    echo [OK] init.sql
)

if not exist "docker-compose.yml" (
    echo [X] docker-compose.yml nao encontrado!
    set missing=1
) else (
    echo [OK] docker-compose.yml
)

if not exist "win-frontend\src\pages\shared\PhoneLogin.tsx" (
    echo [X] PhoneLogin.tsx nao encontrado!
    set missing=1
) else (
    echo [OK] PhoneLogin.tsx
)

if !missing! equ 1 (
    color 0C
    echo:
    echo [X] Alguns arquivos criticos estao faltando!
    exit /b 1
)
echo:

REM Verificar conteúdo crítico
echo [*] Verificando conteudo critico...

REM Verificar se OtpService tem correcao
findstr /C:"!otpToken.isNotExpired()" "backend\src\main\java\com\win\marketplace\service\OtpService.java" >nul
if %errorlevel% neq 0 (
    color 0C
    echo [X] Correcao do OtpService nao encontrada!
    echo    Procure por: "if (!otpToken.isNotExpired())"
    exit /b 1
)
echo [OK] Correcao de logica no OtpService

REM Verificar se init.sql tem otp_tokens
findstr /C:"otp_tokens" "database\init.sql" >nul
if %errorlevel% neq 0 (
    color 0C
    echo [X] Tabela otp_tokens nao encontrada em init.sql!
    exit /b 1
)
echo [OK] Tabela otp_tokens em init.sql

REM Verificar docker-compose tem volumes corretos
findstr /C:"00_init.sql" "docker-compose.yml" >nul
if %errorlevel% neq 0 (
    color 0C
    echo [X] Volumes do docker-compose nao estao com prefixo numerico!
    exit /b 1
)
echo [OK] Docker-compose com ordem correta de migracions

REM Verificar PhoneLogin tem componente correto
findstr /C:"PhoneLogin" "win-frontend\src\pages\shared\Login.tsx" >nul
if %errorlevel% neq 0 (
    color 0C
    echo [X] PhoneLogin nao esta integrado em Login.tsx!
    exit /b 1
)
echo [OK] PhoneLogin integrado em Login.tsx

REM Verificar documentação
echo:
echo [*] Verificando documentacao de seguranca...

if not exist "DEPLOYMENT_CHECKLIST.md" (
    echo [!] Arquivo DEPLOYMENT_CHECKLIST.md nao encontrado
) else (
    echo [OK] DEPLOYMENT_CHECKLIST.md
)

if not exist "GARANTIA_SEGURANCA_DADOS.md" (
    echo [!] Arquivo GARANTIA_SEGURANCA_DADOS.md nao encontrado
) else (
    echo [OK] GARANTIA_SEGURANCA_DADOS.md
)

if not exist "GUIA_DEPLOYMENT_VPS.md" (
    echo [!] Arquivo GUIA_DEPLOYMENT_VPS.md nao encontrado
) else (
    echo [OK] GUIA_DEPLOYMENT_VPS.md
)

if not exist "deploy-seguro-vps.sh" (
    echo [!] Arquivo deploy-seguro-vps.sh nao encontrado
) else (
    echo [OK] deploy-seguro-vps.sh
)

REM Resumo final
echo:
echo ============================================
echo RESULTADO FINAL
echo ============================================
color 0A
echo:
echo    [OK] Todos os arquivos e verificacoes passaram!
echo:
echo    Pronto para:
echo    1. Commit de codigo
echo    2. Push para repositorio
echo    3. Deploy em VPS
echo:
echo Proximos passos:
echo:
echo   1. Fazer COMMIT (ainda nao feito):
echo      git add backend/src/main/java/com/win/marketplace/service/OtpService.java
echo      ... (ver GUIA_DEPLOYMENT_VPS.md para lista completa)
echo      git commit -m "feat: ..."
echo      git push origin main
echo:
echo   2. Na VPS, executar:
echo      bash deploy-seguro-vps.sh
echo:
echo ============================================
echo:

pause
