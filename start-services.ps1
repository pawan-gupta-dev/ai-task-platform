# AI Task Platform - Windows Startup Script
# Run: powershell -ExecutionPolicy Bypass -File .\start-services.ps1

param(
    [switch]$SkipMongoDB,
    [switch]$SkipRedis
)

Write-Host "`n" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AI Task Platform Startup (Windows)   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Cyan

$mongoPath = "C:\Program Files\MongoDB\Server\8.2\bin"
$redisPath = "C:\tools\redis-server.exe"

# Check if MongoDB exists
if (-not (Test-Path $mongoPath)) {
    Write-Host "⚠ MongoDB not found. Please install: winget install MongoDB.Server" -ForegroundColor Yellow
    $SkipMongoDB = $true
}

# Start MongoDB
if (-not $SkipMongoDB) {
    Write-Host "[1/5] Starting MongoDB..." -ForegroundColor Green
    $mongoDataPath = "$env:APPDATA\MongoDB\data"
    if (-not (Test-Path $mongoDataPath)) {
        New-Item -ItemType Directory -Path $mongoDataPath | Out-Null
        Write-Host "    Created data directory: $mongoDataPath" -ForegroundColor Gray
    }
    
    Start-Process -FilePath "$mongoPath\mongod.exe" `
        -ArgumentList "--dbpath `"$mongoDataPath`"" `
        -NoNewWindow `
        -RedirectStandardOutput "$PSScriptRoot\logs\mongodb.log" `
        -RedirectStandardError "$PSScriptRoot\logs\mongodb-error.log"
    
    Start-Sleep -Seconds 3
    Write-Host "    ✓ MongoDB started" -ForegroundColor Green
}

# Start Redis
if (-not $SkipRedis) {
    Write-Host "[2/5] Starting Redis..." -ForegroundColor Green
    if (Get-Command redis-server -ErrorAction SilentlyContinue) {
        Start-Process -FilePath "redis-server.exe" `
            -NoNewWindow `
            -RedirectStandardOutput "$PSScriptRoot\logs\redis.log" `
            -RedirectStandardError "$PSScriptRoot\logs\redis-error.log"
    } else {
        Write-Host "    ⚠ Redis not found in PATH. Skipping..." -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 2
    Write-Host "    ✓ Redis started" -ForegroundColor Green
}

# Install dependencies if needed
Write-Host "`n[3/5] Checking dependencies..." -ForegroundColor Green

@("backend", "worker", "frontend") | ForEach-Object {
    $folder = "$PSScriptRoot\$_"
    if (Test-Path $folder) {
        if (-not (Test-Path "$folder\node_modules")) {
            Write-Host "    Installing $_..." -ForegroundColor Gray
            Push-Location $folder
            npm install --silent | Out-Null
            Pop-Location
        }
    }
}

Write-Host "    ✓ Dependencies ready" -ForegroundColor Green

# Start Backend
Write-Host "`n[4/5] Starting Backend (Port 5000)..." -ForegroundColor Green
Push-Location "$PSScriptRoot\backend"
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -NoNewWindow
Pop-Location
Start-Sleep -Seconds 3
Write-Host "    ✓ Backend started" -ForegroundColor Green

# Start Worker
Write-Host "[4/5] Starting Worker..." -ForegroundColor Green
Push-Location "$PSScriptRoot\worker"
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -NoNewWindow
Pop-Location
Start-Sleep -Seconds 2
Write-Host "    ✓ Worker started" -ForegroundColor Green

# Start Frontend
Write-Host "[5/5] Starting Frontend (Port 5173)..." -ForegroundColor Green
Push-Location "$PSScriptRoot\frontend"
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -NoNewWindow
Pop-Location

Write-Host "`n" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✓ All services started successfully!  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"
Write-Host "📱 Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend:   http://localhost:5000" -ForegroundColor Cyan
Write-Host "🗄  MongoDB:   localhost:27017" -ForegroundColor Cyan
Write-Host "📮 Redis:     localhost:6379" -ForegroundColor Cyan
Write-Host "`n"
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Register a new account at the login screen" -ForegroundColor Gray
Write-Host "   - Create a task and watch the worker process it" -ForegroundColor Gray
Write-Host "   - Check worker terminal for processing logs" -ForegroundColor Gray
Write-Host "   - Open browser DevTools (F12) to see API calls" -ForegroundColor Gray
Write-Host "`n"
Write-Host "❌ To stop all services:" -ForegroundColor Yellow
Write-Host "   taskkill /F /IM node.exe" -ForegroundColor Gray
Write-Host "   taskkill /F /IM mongod.exe" -ForegroundColor Gray
Write-Host "   taskkill /F /IM redis-server.exe" -ForegroundColor Gray
Write-Host "`n"
