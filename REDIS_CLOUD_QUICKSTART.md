# 🚀 QUICK START: Using Redis Cloud (FREE)

## Why Redis Cloud?
- ✅ Free tier (30MB)
- ✅ No Windows installation issues
- ✅ Works perfectly with BullMQ
- ✅ 5 minutes to setup
- ✅ Perfect for learning/testing

## Setup Steps

### Step 1: Create Redis Cloud Database (5 min)
1. Go to https://redis.com/cloud
2. Click "Signup for free"
3. Complete signup
4. Click "Create database"
5. Select:
   - Cloud: AWS
   - Region: us-east-1 (or nearest)
   - Database name: ai-task-platform
6. Click "Create"
7. Wait for database to initialize

### Step 2: Get Connection Details
1. In Redis Cloud dashboard, click your database
2. Under "Configuration", find:
   - Endpoint: something like `redis-18456.c345.us-east-1-2.ec2.cloud.redislabs.com`
   - Port: `12345`
   - Default user password (or create one)

### Step 3: Update Environment Variables

**Backend (.env)**
```
REDIS_HOST=redis-xxxxx.c345.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_password_here
REDIS_URL=redis://:your_password@redis-xxxxx.c345.us-east-1-2.ec2.cloud.redislabs.com:12345
```

**Worker (.env)**
```
REDIS_HOST=redis-xxxxx.c345.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_password_here
REDIS_URL=redis://:your_password@redis-xxxxx.c345.us-east-1-2.ec2.cloud.redislabs.com:12345
```

### Step 4: Update Backend Code (Optional - for better compatibility)

In `backend/config/redis.js`, update to:
```javascript
const Queue = require('bull');

const queue = new Queue('tasks', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS ? {} : undefined,  // Enable TLS for cloud
  }
});

module.exports = queue;
```

In `worker/config/redis.js`, update identically.

### Step 5: Now Start All Services!

**Terminal 1: MongoDB**
```powershell
mkdir $env:APPDATA\MongoDB\data
cd "C:\Program Files\MongoDB\Server\8.2\bin"
.\mongod.exe --dbpath $env:APPDATA\MongoDB\data
```

**Terminal 2: Backend**
```powershell
cd C:\Users\pawan\Desktop\venture\ai-task-platform\backend
npm run dev
```

**Terminal 3: Worker**
```powershell
cd C:\Users\pawan\Desktop\venture\ai-task-platform\worker
npm run dev
```

**Terminal 4: Frontend**
```powershell
cd C:\Users\pawan\Desktop\venture\ai-task-platform\frontend
npm run dev
```

### Step 6: Test It!
1. Open http://localhost:5173
2. Register account
3. Create a task
4. Watch Worker process it
5. ✅ Done!

## Cost
- **Free**: Always free (30MB storage)
- **Upgrade**: $7.99/month if you exceed limits

---

## Alternative: Use Memurai (Local Redis)

If you prefer local Redis:

```powershell
# Run as Administrator
choco install memurai -y
# Then start Terminal 2 with Backend (Redis runs as service)
```

---

## Alternative: Use WSL2

```bash
# In WSL2 Ubuntu terminal
sudo apt-get update
sudo apt-get install redis-server -y
redis-server
```

Then proceed with Steps 5-6 above (Terminals 2-4 only).

---

## Need Help?
Check REDIS_SETUP.md for more options.
