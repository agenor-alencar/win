# ============================================
# START PHASE 9 - FULL E2E DEMO SERVERS
# ============================================

$backend_path = "c:\Users\Usuario\Documents\win\backend"
$frontend_path = "c:\Users\Usuario\Documents\win\win-frontend"

Write-Host "" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PHASE 9 E2E - STARTING SERVERS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ============================================
# START BACKEND
# ============================================
Write-Host "[1/2] Starting Backend (Spring Boot on port 8080)..." -ForegroundColor Yellow
Push-Location $backend_path
$backend_job = Start-Job -ScriptBlock {
    cd "c:\Users\Usuario\Documents\win\backend"
    cmd /c mvnw.cmd spring-boot:run
} -Name "backend-server"
Pop-Location

Write-Host "     ✓ Backend started in background (Job ID: $($backend_job.Id))" -ForegroundColor Green
Start-Sleep -Seconds 5

# ============================================
# START FRONTEND
# ============================================
Write-Host "[2/2] Starting Frontend (Vite on port 5173)..." -ForegroundColor Yellow
Push-Location $frontend_path
$frontend_job = Start-Job -ScriptBlock {
    cd "c:\Users\Usuario\Documents\win\win-frontend"
    npm run dev
} -Name "frontend-server"
Pop-Location

Write-Host "     ✓ Frontend started in background (Job ID: $($frontend_job.Id))" -ForegroundColor Green
Start-Sleep -Seconds 3

# ============================================
# DISPLAY STATUS
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 SERVERS STATUS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$jobs = Get-Job -Name "*-server"
foreach ($job in $jobs) {
    $status_color = if ($job.State -eq "Running") { "Green" } else { "Yellow" }
    Write-Host "  Job ID: $($job.Id) | Name: $($job.Name) | State: $($job.State)" -ForegroundColor $status_color
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 READY TO TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  WebSocket URL: ws://localhost:8080/ws/connect" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📝 To view logs:" -ForegroundColor Yellow
Write-Host "    Get-Job | Get-Job | Receive-Job -Keep" -ForegroundColor Gray
Write-Host ""
Write-Host "  🛑 To stop servers:" -ForegroundColor Yellow
Write-Host "    Get-Job -Name '*-server' | Stop-Job" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Keep script running to show status
while ($true) {
    $jobs = Get-Job -Name "*-server"
    $backend = $jobs | Where-Object { $_.Name -eq "backend-server" }
    $frontend = $jobs | Where-Object { $_.Name -eq "frontend-server" }
    
    # Check if both are still running
    if ($backend.State -ne "Running" -or $frontend.State -ne "Running") {
        Write-Host "⚠️  Warning: One or more servers stopped!" -ForegroundColor Red
        Write-Host "Backend: $($backend.State)" -ForegroundColor $(if ($backend.State -eq "Running") { "Green" } else { "Red" })
        Write-Host "Frontend: $($frontend.State)" -ForegroundColor $(if ($frontend.State -eq "Running") { "Green" } else { "Red" })
    }
    
    Start-Sleep -Seconds 30
}
