# 🚀 STARTUP GUIDE - Windows (Ready to Go!)

## ✅ Installation Complete
- ✅ MongoDB 8.2.7 installed
- ✅ Redis 3.0 installed  
- ✅ Backend dependencies installed ✓
- ✅ Worker dependencies installed ✓
- ✅ Frontend dependencies installed ✓

---

## 🎯 Start the Platform (5 Easy Steps)

### Step 1️⃣: Create MongoDB data folder
```powershell
mkdir $env:APPDATA\MongoDB\data
```

### Step 2️⃣: Open 5 PowerShell terminals

---

## 🟦 Terminal 1 - MongoDB
```powershell
cd "C:\Program Files\MongoDB\Server\8.2\bin"
.\mongod.exe --dbpath $env:APPDATA\MongoDB\data
```

**Wait for:** `"Waiting for connections on port 27017"`

---

## 🟥 Terminal 2 - Redis  

⚠️ **Windows Redis has binding issues.** Choose ONE:

### Option A: Redis Cloud (RECOMMENDED)
1. See `REDIS_CLOUD_QUICKSTART.md` for 5-min setup
2. Update `.env` in backend/ and worker/ folders
3. Skip this terminal, proceed to Terminal 3

### Option B: Memurai (Local)
```powershell
# If using Memurai (installed as service)
# Just proceed to Terminal 3 - Redis runs automatically
```

### Option C: WSL2
```bash
# In WSL2 Ubuntu terminal
redis-server
```

---

## 🟪 Terminal 3 - Backend API
```powershell
cd C:\Users\pawan\Desktop\venture\ai-task-platform\backend
npm run dev
```

**Wait for:** `"✓ Backend server running on port 5000"`

---

## 🟫 Terminal 4 - Worker
```powershell
cd C:\Users\pawan\Desktop\venture\ai-task-platform\worker
npm run dev
```

**Wait for:** `"✓ Worker service running successfully"`

---

## 🟩 Terminal 5 - Frontend
```powershell
cd C:\Users\pawan\Desktop\venture\ai-task-platform\frontend
npm run dev
```

**Wait for:** `"Local: http://localhost:5173"`

---

## ✅ You're Done!

Open browser: **http://localhost:5173**

---

## 🧪 Quick Test

1. **Register** 
   - Email: `test@example.com`
   - Password: `123456`
   - Name: `Test User`

2. **Create a Task**
   - Title: `My First Task`
   - Text: `hello world`
   - Operation: `UPPERCASE`
   - Click: `Create Task`

3. **Watch It Process**
   - Check Terminal 4 (worker) - you'll see logs
   - Page auto-updates in 2-3 seconds
   - Status changes: `pending` → `running` → `success`

4. **View Details**
   - Click task in list
   - See result: `HELLO WORLD`
   - See processing logs with timestamps

---

## 📊 What's Happening Behind the Scenes

```
Frontend (http://localhost:5173)
    ↓ POST /api/tasks (with auth token)
    
Backend API (http://localhost:5000)
    ↓ Validates token, creates task
    ↓ Stores in MongoDB
    ↓ Pushes job to Redis queue
    
Redis Queue (localhost:6379)
    ↓ Worker pulls job
    
Worker Service
    ↓ Executes operation (uppercase, lowercase, reverse, wordcount)
    ↓ Updates MongoDB with result
    
Frontend polls for updates
    ↓ Shows updated status & result
```

---

## 🐛 Troubleshooting

### MongoDB won't start
```powershell
# Check if port 27017 is in use
netstat -ano | findstr :27017

# If in use, kill it
taskkill /PID <PID_NUMBER> /F

# Then retry Terminal 1
```

### Redis won't start
```powershell
# Check if port 6379 is in use
netstat -ano | findstr :6379

# If in use, kill it
taskkill /PID <PID_NUMBER> /F

# Then retry Terminal 2
```

### Backend shows "MongoDB connection error"
- Ensure Terminal 1 shows "Waiting for connections"
- Start Terminal 3 AFTER Terminal 1 is ready

### Worker shows "Redis connection timeout"
- Ensure Terminal 2 shows "Ready to accept connections"
- Start Terminal 4 AFTER Terminal 2 is ready

### Frontend blank with F12 errors
- Check backend is running (Terminal 3)
- Check frontend shows `Local: http://localhost:5173`
- Clear browser cache (Ctrl+Shift+Delete)

### Task stuck on "pending"
- Check worker terminal (Terminal 4) for errors
- Ensure Redis and MongoDB are running
- Check operations are correct

---

## 🛑 Stop Everything

```powershell
# Option 1: Close each terminal window

# Option 2: Kill all processes
taskkill /F /IM node.exe
taskkill /F /IM mongod.exe
taskkill /F /IM redis-server.exe
```

---

## 📚 Learn More

- **README.md** - Full documentation
- **QUICKSTART.md** - Quick reference
- **SETUP_WINDOWS.md** - Detailed setup
- **architecture.md** - System design & scaling
- **infra/** - Kubernetes deployment

---

## 🎓 What You're Learning

✅ **Frontend** (React)
- Components & hooks
- API integration with Axios
- JWT authentication
- Real-time UI updates

✅ **Backend** (Express + Node.js)
- REST API design
- Database queries with MongoDB
- Authentication & authorization
- Queue job management

✅ **Worker** (Background Job Processing)
- BullMQ queue system
- Async task processing
- Database updates
- Error handling

✅ **DevOps** (Database & Infrastructure)
- MongoDB setup & querying
- Redis queue system
- Environment variables
- Service orchestration

---

## 🎉 Congratulations!

You now have a **production-ready MERN stack** application running locally!

### Next Steps:
1. 🔧 Explore the code in each folder
2. 📝 Modify operations in `worker/processors/jobProcessor.js`
3. 🎨 Customize UI in `frontend/src/`
4. 🚀 Deploy to Kubernetes (see `infra/` folder)

---

**Happy coding! Questions? Check the docs or terminal logs.** 💻
