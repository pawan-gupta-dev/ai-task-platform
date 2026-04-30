# 🚀 QUICK START - AI Task Platform (Windows)

## ✅ Already Installed
- ✅ Node.js 18+
- ✅ MongoDB 8.2.7
- ✅ Redis 3.0

---

## 🎯 Step 1: Install Dependencies (npm install)

```powershell
# Terminal 1 - Backend
cd backend
npm install

# Terminal 2 - Worker  
cd worker
npm install

# Terminal 3 - Frontend
cd frontend
npm install
```

**Skip if already done.**

---

## 🎯 Step 2: Start MongoDB

```powershell
# PowerShell terminal
mkdir $env:APPDATA\MongoDB\data

cd "C:\Program Files\MongoDB\Server\8.2\bin"
.\mongod.exe --dbpath $env:APPDATA\MongoDB\data
```

Wait until you see: `"Waiting for connections"`

---

## 🎯 Step 3: Start Redis

```powershell
# New PowerShell terminal
redis-server.exe
```

Wait until you see: `"Ready to accept connections"`

---

## 🎯 Step 4: Start Backend

```powershell
# New PowerShell terminal
cd backend
npm run dev
```

Should show: `✓ Backend server running on port 5000`

---

## 🎯 Step 5: Start Worker

```powershell
# New PowerShell terminal
cd worker
npm run dev
```

Should show: `✓ Worker service running successfully`

---

## 🎯 Step 6: Start Frontend

```powershell
# New PowerShell terminal
cd frontend
npm run dev
```

Should show: `Local: http://localhost:5173`

---

## ✅ You're Done!

Open browser: **http://localhost:5173**

### Test It:
1. **Register** - Create new account
2. **Login** - Use credentials
3. **Create Task** - Pick operation (uppercase, lowercase, reverse, wordcount)
4. **Watch Worker** - Check terminal 5 for processing
5. **View Result** - See updated status in a few seconds

---

## 🧹 Cleanup

```powershell
# Kill all services
taskkill /F /IM node.exe
taskkill /F /IM mongod.exe
taskkill /F /IM redis-server.exe
```

---

## 📊 Architecture at a Glance

```
Frontend (React) 
    ↓ HTTP
Backend API (Express)
    ↓ Push to queue
Redis Queue
    ↓ Pull jobs
Worker (Node.js)
    ↓ Process tasks
MongoDB (Store results)
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB won't start | Port 27017 in use: `netstat -ano \| findstr :27017` then `taskkill /PID XXX /F` |
| Redis won't start | Port 6379 in use: `netstat -ano \| findstr :6379` then `taskkill /PID XXX /F` |
| Backend won't connect | Ensure MongoDB + Redis are running first |
| Worker not processing | Check worker terminal - should show "✓ Worker ready" |
| Frontend blank | Press F12, check console for errors |
| npm install fails | Delete `node_modules` and `package-lock.json`, try again |

---

## 📚 Full Documentation

- **README.md** - Complete setup guide
- **SETUP_WINDOWS.md** - Detailed Windows instructions
- **architecture.md** - System design & scaling
- **infra/** - Kubernetes manifests for production

---

**Happy coding! 🎉**
