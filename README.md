# AI Task Processing Platform

A full-stack MERN application for processing text tasks asynchronously using a worker queue system. Built with React, Node.js, MongoDB, Redis, and Kubernetes.

**Live Demo**: https://ai-task-platform.example.com

## 🎯 Features

- **User Authentication**: Register and login with JWT tokens
- **Task Processing**: Submit text tasks with 4 operations (uppercase, lowercase, reverse, wordcount)
- **Asynchronous Processing**: BullMQ queue with worker pool
- **Real-time Status**: Track task status (pending → running → success/failed)
- **Task Logs**: Detailed execution logs with timestamps
- **Scalable**: Docker + Kubernetes ready, worker scales horizontally
- **Secure**: Bcrypt password hashing, Helmet security headers, Rate limiting

## 📋 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express + JWT |
| **Database** | MongoDB 6.0 |
| **Queue** | Redis 7 + BullMQ |
| **Worker** | Node.js + BullMQ |
| **Containerization** | Docker + docker-compose |
| **Orchestration** | Kubernetes (k8s) |
| **CI/CD** | GitHub Actions |

## 🚀 Quick Start

### Prerequisites

- **Local Development**: Docker + Docker Compose
- **Kubernetes**: kubectl + Helm (optional)
- Node.js 18+ (for manual development)

### Option 1: Docker Compose (Easiest)

```bash
# Clone the repository
git clone <repo-url>
cd ai-task-platform

# Build and start all services
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost
# Backend: http://localhost:5000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

**Check service health:**

```bash
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f worker
```

**Stop all services:**

```bash
docker-compose down
```

### Option 2: Manual Setup (Development)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Backend running on http://localhost:5000
```

#### MongoDB (required)

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongo mongo:6.0-alpine
```

#### Redis (required)

```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

#### Worker

```bash
cd worker
npm install
cp .env.example .env
npm run dev
# Worker listening to Redis queue
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```

### Option 3: Kubernetes Deployment

#### Prerequisites

```bash
# Install kubectl
# Create a cluster (Minikube, EKS, GKE, etc.)
# Update image registry in infra/*/deployment.yaml
```

#### Deploy

```bash
# Create namespace and apply configs
kubectl apply -f infra/namespace.yaml
kubectl apply -f infra/configmap.yaml
kubectl apply -f infra/secret.yaml

# Deploy MongoDB and Redis
kubectl apply -f infra/mongo/statefulset.yaml
kubectl apply -f infra/mongo/service.yaml
kubectl apply -f infra/redis/deployment.yaml
kubectl apply -f infra/redis/service.yaml

# Deploy services
kubectl apply -f infra/backend/deployment.yaml
kubectl apply -f infra/backend/service.yaml
kubectl apply -f infra/frontend/deployment.yaml
kubectl apply -f infra/frontend/service.yaml
kubectl apply -f infra/worker/deployment.yaml

# Setup Ingress
kubectl apply -f infra/frontend/ingress.yaml
```

#### Access Services

```bash
# Port forward backend
kubectl port-forward -n ai-task-platform svc/backend 5000:5000

# Port forward frontend
kubectl port-forward -n ai-task-platform svc/frontend 80:80

# View logs
kubectl logs -n ai-task-platform -f deployment/backend
kubectl logs -n ai-task-platform -f deployment/worker

# Scale worker
kubectl scale deployment/worker -n ai-task-platform --replicas=5
```

## 🔧 Environment Variables

### Backend

```env
MONGO_URI=mongodb://localhost:27017/ai-task-platform
JWT_SECRET=your_super_secret_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=5000
NODE_ENV=production
```

### Worker

```env
MONGO_URI=mongodb://localhost:27017/ai-task-platform
REDIS_HOST=localhost
REDIS_PORT=6379
WORKER_CONCURRENCY=5
NODE_ENV=production
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 API Endpoints

### Authentication

```
POST   /api/auth/register    - Create new user
POST   /api/auth/login       - Login user
```

### Tasks (Protected Routes - require JWT)

```
POST   /api/tasks            - Create task
GET    /api/tasks            - Get all tasks (paginated)
GET    /api/tasks/:id        - Get specific task
```

### Health

```
GET    /health               - Backend health check
```

## 🏗️ Architecture

See [architecture.md](./architecture.md) for detailed architecture documentation including:

- System design and data flow
- Horizontal scaling strategy
- MongoDB indexing strategy
- High availability setup
- Disaster recovery
- 100k tasks/day handling

## 🐳 Docker Images

All images use **multi-stage builds** for production optimization:

- **Base**: Alpine Linux (lightweight)
- **Non-root user**: Security hardening
- **Small size**: Reduced deployment time

Build commands:

```bash
docker build -t ai-task-backend:latest ./backend
docker build -t ai-task-worker:latest ./worker
docker build -t ai-task-frontend:latest ./frontend
```

Push to registry:

```bash
docker tag ai-task-backend:latest username/ai-task-backend:latest
docker push username/ai-task-backend:latest
```

## 🔐 Security

- ✅ JWT authentication (7-day expiry)
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Helmet security headers (HSTS, CSP, XSS protection)
- ✅ Rate limiting (5 requests/15 min on auth, 100 requests/15 min on API)
- ✅ Non-root Docker users
- ✅ Environment variables for secrets (no hardcoding)
- ✅ CORS configured
- ✅ Input validation on all routes

## 📈 Performance & Scaling

| Metric | Value |
|--------|-------|
| **Tasks/day capacity** | 100k+ |
| **Worker concurrency** | 5 (default, configurable) |
| **Task timeout** | 30s (configurable in BullMQ) |
| **API rate limit** | 100 req/15 min |
| **Auth rate limit** | 5 req/15 min |
| **DB indexes** | userId, status, createdAt |
| **Connection pooling** | Mongoose default (5 connections) |

**Scaling strategy:**

```bash
# Scale workers (Kubernetes)
kubectl scale deployment/worker --replicas=10

# Scale backend API
kubectl scale deployment/backend --replicas=5

# Redis persistence: Use RDB snapshots or AOF
# MongoDB: Enable replication sets for HA
```

## 🚢 Deployment

### Local Development

```bash
docker-compose -f docker-compose.yml up
```

### Staging

```bash
docker-compose -f docker-compose.staging.yml up
```

### Production (Kubernetes)

```bash
kubectl apply -f infra/
```

## 🔍 Monitoring & Logs

### Docker Compose

```bash
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend
```

### Kubernetes

```bash
kubectl logs -n ai-task-platform deployment/backend -f
kubectl logs -n ai-task-platform deployment/worker -f
```

### Redis Queue

```bash
# Connect to Redis CLI
docker exec -it ai-task-redis redis-cli

# View queue stats
> INFO stats
> KEYS *
```

## 📝 Testing

### Manual Testing

1. Register: http://localhost/register
2. Login: http://localhost/login
3. Create task: Fill form → Submit
4. Monitor: Real-time status updates
5. View logs: Click task to see details

### API Testing

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456"}'

# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}' | jq -r '.token')

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","inputText":"hello","operation":"uppercase"}'
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running on port 27017 |
| Redis connection error | Ensure Redis is running on port 6379 |
| Worker not processing tasks | Check Redis connection, verify BullMQ queue |
| Frontend API calls failing | Check CORS settings, verify backend is running |
| Tasks stuck in pending | Check worker logs, verify operations are supported |
| Docker compose port conflict | Change ports in docker-compose.yml |

## 📚 Project Structure

```
ai-task-platform/
├── backend/                 # Express API
│   ├── models/             # MongoDB schemas
│   ├── controllers/        # Route handlers
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, error handling
│   ├── config/             # DB, Redis config
│   └── server.js           # Main entry
├── worker/                 # Job processor
│   ├── models/             # Task schema
│   ├── processors/         # Job processing logic
│   └── server.js           # Worker entry
├── frontend/               # React app
│   ├── src/
│   │   ├── pages/         # Login, Register, Dashboard, TaskDetail
│   │   ├── components/    # Navbar, TaskForm, TaskList, StatusBadge
│   │   ├── services/      # API clients
│   │   ├── utils/         # Auth, token utils
│   │   └── styles/        # CSS
├── infra/                  # Kubernetes manifests
│   ├── namespace.yaml      # K8s namespace
│   ├── configmap.yaml      # Config
│   ├── secret.yaml         # Secrets
│   ├── backend/            # Backend deployment + service
│   ├── frontend/           # Frontend deployment + service + ingress
│   ├── worker/             # Worker deployment (2 replicas)
│   ├── mongo/              # MongoDB StatefulSet + service
│   └── redis/              # Redis deployment + service
├── docker-compose.yml      # Local development setup
├── README.md               # This file
├── architecture.md         # Architecture & scaling
└── .github/workflows/ci.yml # CI/CD pipeline
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/xyz`
2. Commit changes: `git commit -m "feat: add xyz"`
3. Push branch: `git push origin feature/xyz`
4. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

For issues, questions, or feedback:
- Open GitHub Issue
- Create Discussion thread
- Contact: support@example.com

---

**Made with ❤️ for MERN Stack learners**
