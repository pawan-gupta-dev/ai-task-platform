# Windows Setup Guide - AI Task Platform

## Prerequisites Installed
- ✅ Node.js 18+
- ✅ MongoDB 8.2.7
- ✅ Redis (installing...)

## Setup Instructions

### Step 1: Install Dependencies

```powershell
# Backend
cd backend
npm install

# Worker
cd ../worker
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Create MongoDB Data Directory

```powershell
mkdir $env:APPDATA\MongoDB\data
```

### Step 3: Start Services (Open 5 Terminal Windows)

#### Terminal 1 - MongoDB
```powershell
cd "C:\Program Files\MongoDB\Server\8.2\bin"
.\mongod.exe --dbpath $env:APPDATA\MongoDB\data
```

#### Terminal 2 - Redis
```powershell
redis-server.exe
```

Wait for both to show "ready to accept connections"

#### Terminal 3 - Backend
```powershell
cd backend
npm run dev
```

Should show: `✓ Backend server running on port 5000`

#### Terminal 4 - Worker
```powershell
cd worker
npm run dev
```

Should show: `✓ Worker service running successfully`

#### Terminal 5 - Frontend
```powershell
cd frontend
npm run dev
```

Should show: `➜ Local: http://localhost:5173`

### Step 4: Access the Platform

Open browser: **http://localhost:5173**

### Step 5: Test

1. Register new account
2. Create a task (type some text, select operation)
3. Watch worker process it in Terminal 4
4. See status update to "success"

## Troubleshooting

### MongoDB won't start
- Check if port 27017 is in use: `netstat -ano | findstr :27017`
- Kill process: `taskkill /PID <PID> /F`
- Ensure `$env:APPDATA\MongoDB\data` folder exists

### Redis won't start
- Check if port 6379 is in use: `netstat -ano | findstr :6379`
- Kill process: `taskkill /PID <PID> /F`

### Backend connection errors
- Ensure MongoDB is running first
- Ensure Redis is running before backend

### Worker not processing
- Check worker terminal for errors
- Ensure Backend and Redis are connected
- Check browser console for errors

### Frontend loads but blank
- Check browser console (F12)
- Ensure Backend is running on port 5000
- Check that VITE_API_URL is correct in .env

## Environment Variables

All `.env` files are already configured:

**backend/.env:**
- MONGO_URI=mongodb://localhost:27017/ai-task-platform
- REDIS_HOST=localhost
- REDIS_PORT=6379
- PORT=5000

**worker/.env:**
- MONGO_URI=mongodb://localhost:27017/ai-task-platform
- REDIS_HOST=localhost
- REDIS_PORT=6379
- WORKER_CONCURRENCY=5

**frontend/.env:**
- VITE_API_URL=http://localhost:5000/api

## Stopping Services

Simply close each terminal window, or:

```powershell
# To stop all services
taskkill /F /IM node.exe
taskkill /F /IM mongod.exe
taskkill /F /IM redis-server.exe
```

## MongoDB Management

### View collections
```powershell
mongosh

# In mongosh shell:
> use ai-task-platform
> db.users.find()
> db.tasks.find()
```

### Clear data (fresh start)
```powershell
mongosh

# In mongosh shell:
> use ai-task-platform
> db.users.deleteMany({})
> db.tasks.deleteMany({})
```

## Performance Tips

- Use **latest Node.js LTS** (18+ or 20+)
- Add `-max_old_space_size=4096` to Node if running out of memory
- Close other heavy applications to reduce resource contention

## Next Steps

1. **Local Development**: Follow above steps
2. **Deploy to Kubernetes**: See infra/ folder README
3. **Deploy to Cloud**: Update docker-compose.yml for your provider

---

For issues, check:
- Browser console (F12)
- Terminal logs
- MongoDB: http://localhost:27017 (ping: mongosh --eval "db.adminCommand('ping')")
- Redis: `redis-cli ping`
