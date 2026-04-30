# Redis Windows Installation Fix
# Run this in PowerShell as Administrator

Write-Host "================================" -ForegroundColor Green
Write-Host "Redis for Windows - Installation" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Uninstall broken Redis
Write-Host "`n[1/3] Removing broken Redis installation..." -ForegroundColor Yellow
winget uninstall --exact --silent "Redis.Redis" 2>$null
Remove-Item "C:\Program Files\Redis" -Recurse -Force -ErrorAction SilentlyContinue

# Install using Chocolatey (requires choco)
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "[2/3] Installing Memurai (maintained Redis for Windows)..." -ForegroundColor Yellow
    choco install memurai -y
    Write-Host "[3/3] Done! Starting Redis..." -ForegroundColor Yellow
    # Memurai installs as a service and starts automatically
    Start-Sleep -Seconds 2
    
    # Verify Redis is running
    $redisRunning = Get-Process redis-server -ErrorAction SilentlyContinue
    if ($redisRunning) {
        Write-Host "`n✅ Redis is running successfully on port 6379" -ForegroundColor Green
        
        # Test connection
        Write-Host "`nTesting connection..." -ForegroundColor Cyan
        $testResult = & {
            try {
                $redis = New-Object System.Net.Sockets.TcpClient
                $redis.Connect("127.0.0.1", 6379)
                $redis.Close()
                return $true
            } catch {
                return $false
            }
        }
        
        if ($testResult) {
            Write-Host "✅ Redis is accepting connections!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "`n⚠️  Chocolatey not found. Installing via alternative method..." -ForegroundColor Yellow
    
    # Create redis.conf for Windows
    $confPath = "C:\redis.conf"
    @"
# Redis for Windows configuration
port 6379
bind 127.0.0.1
loglevel notice
databases 16
save 900 1
save 300 10
appendonly yes
"@ | Out-File -FilePath $confPath -Encoding ASCII
    
    Write-Host "`n⚠️  Please download Memurai from: https://www.memurai.com/" -ForegroundColor Yellow
    Write-Host "⚠️  Or use Redis Cloud (free tier): https://redis.com/cloud" -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "1. Open 5 PowerShell windows" -ForegroundColor Cyan
Write-Host "2. Run .\start-services.ps1" -ForegroundColor Cyan
