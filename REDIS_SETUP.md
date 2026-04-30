# Redis Windows Issues - Workaround Guide

## Problem
Redis on Windows doesn't bind properly to port 6379.

## Solution Options (Choose 1)

### ✅ Option 1: Use Redis Cloud (Easiest - Free Tier!)
1. Go to https://redis.com/cloud
2. Sign up free
3. Create free 30MB database
4. Copy connection string
5. Update `.env` files with:
   ```
   REDIS_HOST=redis-xxx.c123.us-east-1-2.ec2.cloud.redislabs.com
   REDIS_PORT=12345
   REDIS_PASSWORD=your_password
   ```

### ✅ Option 2: Use WSL2 (If installed)
```powershell
# In WSL2 terminal
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### ✅ Option 3: Use Node.js Redis Mock (For Development Only)
See `redis-mock-server.js` in root folder

### ✅ Option 4: Install Memurai (Properly Maintained Redis for Windows)
```powershell
# Uninstall broken Redis first
winget uninstall Redis.Redis

# Install Memurai
choco install memurai  # If you have Chocolatey
# OR download from: https://www.memurai.com/
```

## Recommended for Quick Start
**Option 1: Redis Cloud Free Tier** - Takes 5 minutes, no local installation needed

## For Production
Use Kubernetes with Redis StatefulSet (see `infra/redis/`)
