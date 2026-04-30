# AI Task Processing Platform - Architecture

## 📐 System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User                                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP Requests
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ Frontend (React + Vite)                                          │
│ - SPA with React Router                                          │
│ - JWT stored in localStorage                                     │
│ - Axios HTTP client with token interceptor                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                      HTTP/REST
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ API Gateway / Load Balancer                                      │
│ - Ingress (Kubernetes) or Nginx                                  │
│ - SSL/TLS termination                                            │
│ - Request routing                                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────────────┐ │
│ Backend (Express + Node.js)                                    │ │
│ ┌────────────────────────────────────────────────────────────┐ │ │
│ │ Authentication Routes (with Rate Limiting)                 │ │ │
│ │ - POST /api/auth/register                                 │ │ │
│ │ - POST /api/auth/login                                    │ │ │
│ └────────────────────────────────────────────────────────────┘ │ │
│                                                                  │ │
│ ┌────────────────────────────────────────────────────────────┐ │ │
│ │ Protected Routes (JWT Required)                            │ │ │
│ │ - POST /api/tasks       (Create & enqueue)                │ │ │
│ │ - GET  /api/tasks       (List with pagination)            │ │ │
│ │ - GET  /api/tasks/:id   (Get single task)                 │ │ │
│ └────────────────────────────────────────────────────────────┘ │ │
│                                                                  │ │
│ ┌────────────────────────────────────────────────────────────┐ │ │
│ │ Middleware Stack:                                          │ │ │
│ │ - Helmet (security headers)                               │ │ │
│ │ - CORS (frontend access)                                  │ │ │
│ │ - Rate Limiting (auth: 5/15min, api: 100/15min)          │ │ │
│ │ - Body Parser (JSON)                                      │ │ │
│ │ - Auth Middleware (JWT verification)                      │ │ │
│ └────────────────────────────────────────────────────────────┘ │ │
└────────────────────────────────────────────────────────────────┘ │
           │              │                    │                    │
      Stores            Enqueue             Queries                │
      User              Job                 Data                   │
           │              │                    │                    │
┌──────────▼─┐   ┌────────▼──┐   ┌─────────────▼──┐   ┌───────────▼┐
│  MongoDB   │   │   Redis   │   │    MongoDB     │   │ MongoDB    │
│            │   │   Queue   │   │   (Read)       │   │ (Write)    │
│ Collections│   │  (BullMQ) │   │                │   │            │
│ - User     │   │           │   │ Indexes:       │   │ Indexes:   │
│ - Task     │   │ Queues:   │   │ - userId       │   │ - userId   │
│            │   │ - tasks   │   │ - status       │   │ - status   │
└────────────┘   │           │   │ - createdAt    │   │ - createdAt│
                 └────────────┘   └────────────────┘   └────────────┘
                      │
              Jobs pulled from
              Redis queue
                      │
┌──────────────────────▼──────────────────────────────────────────┐
│ Worker Pool (Node.js + BullMQ)                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Concurrency: 5 (default, configurable)                    │  │
│ │ Auto-scaling: Can run multiple instances                  │  │
│ │                                                            │  │
│ │ Job Processor:                                            │  │
│ │ 1. Poll Redis for jobs                                   │  │
│ │ 2. Update task status: pending → running                 │  │
│ │ 3. Execute operation (uppercase/lowercase/reverse/count) │  │
│ │ 4. Store result in MongoDB                               │  │
│ │ 5. Update task status: running → success/failed          │  │
│ │ 6. Add log entries with timestamps                       │  │
│ └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Task Lifecycle

```
1. User submits task via Frontend
   ↓
2. Frontend sends POST /api/tasks (with JWT)
   ↓
3. Backend validates JWT
   ↓
4. Backend creates Task in MongoDB (status: pending)
   ↓
5. Backend enqueues job to Redis queue
   ↓
6. Backend returns task with ID to frontend
   ↓
7. Frontend updates UI (task in "pending" status)
   ↓
8. Worker picks up job from Redis queue
   ↓
9. Worker updates task status: pending → running
   ↓
10. Worker processes data (operation execution)
   ↓
11. Worker stores result in MongoDB
   ↓
12. Worker updates task status: running → success/failed
   ↓
13. Worker adds log entries
   ↓
14. Frontend polls GET /api/tasks to display updated status
   ↓
15. User clicks task to view details (logs, result)
```

### Database Schema

```
User Collection:
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  createdAt: DateTime,
  updatedAt: DateTime
}

Task Collection:
{
  _id: ObjectId,
  userId: ObjectId (ref: User),        // Index
  title: String,
  inputText: String,
  operation: String (enum: uppercase|lowercase|reverse|wordcount),
  status: String (enum: pending|running|success|failed), // Index
  result: String (null until complete),
  logs: [
    {
      timestamp: DateTime,
      message: String
    }
  ],
  createdAt: DateTime,                 // Index
  updatedAt: DateTime
}

Indexes:
- Task: { userId: 1, createdAt: -1 }
- Task: { status: 1 }
- Task: { userId: 1, status: 1 }
```

## 📊 Scaling for 100k Tasks/Day

### Task Volume Analysis

```
100,000 tasks/day = ~1.16 tasks/second (average)
Peak hours (8am-6pm): ~2-3 tasks/second
Off-peak (6pm-8am): ~0.3 tasks/second

Processing time:
- Uppercase/lowercase: ~1ms
- Reverse: ~1ms
- Word count: ~2ms
Average: ~1.3ms per task
```

### Scaling Architecture

```
┌──────────────────────────────────────────────────┐
│ Load Balancer (Kubernetes Ingress or Nginx)      │
│ - Distributes requests across backend pods       │
│ - SSL/TLS termination                           │
│ - Rate limiting at gateway level                │
└──────────────────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼───┐   ┌────▼───┐   ┌────▼───┐
    │Backend │   │Backend │   │Backend │
    │Pod 1   │   │Pod 2   │   │Pod N   │
    │:5000   │   │:5000   │   │:5000   │
    └────┬───┘   └────┬───┘   └────┬───┘
         │            │            │
         └────────────┼────────────┘
                      │
              (All connect to)
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼──────┐         ┌────────▼────┐
    │  Redis    │         │  MongoDB    │
    │ (Single)  │         │ (Replicaset)│
    │  Queue    │         │             │
    └────┬──────┘         └────────┬────┘
         │                        │
    Jobs pulled by           Data stored by
    worker pool             all backends
         │
    ┌────▼─────────────────────────────┐
    │ Worker Pool (Scalable)            │
    ├───────────────────────────────────┤
    │ Worker 1  (5 concurrent jobs)     │
    │ Worker 2  (5 concurrent jobs)     │
    │ Worker 3  (5 concurrent jobs)     │
    │ ...                               │
    │ Worker N  (5 concurrent jobs)     │
    │                                   │
    │ Auto-scales: 2-20 replicas        │
    │ CPU-based or queue-depth-based    │
    └───────────────────────────────────┘
```

### Horizontal Scaling Strategy

| Component | Local Dev | Small | Medium | Large |
|-----------|-----------|-------|--------|-------|
| **Backend** | 1 | 2 | 5 | 10+ |
| **Worker** | 1 | 2 | 5-10 | 20+ |
| **MongoDB** | Single | Single | Replicaset | Replicaset |
| **Redis** | Single | Single | Single (RDB) | Redis Cluster |
| **Tasks/day** | 1k | 10k | 100k | 1M+ |
| **Peak QPS** | 0.1 | 1 | 3 | 10+ |

### Auto-scaling Configuration

```yaml
# Kubernetes HPA for Backend
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: ai-task-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

# HPA for Worker
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: worker-hpa
  namespace: ai-task-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: worker
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
```

## 🗄️ MongoDB Indexing Strategy

### Existing Indexes

```javascript
// In Task.js model
taskSchema.indexes = [
  // Single field indexes for fast queries
  { userId: 1 },           // Filter by user
  { status: 1 },           // Filter by status
  
  // Compound indexes for common queries
  { userId: 1, createdAt: -1 },    // User's tasks sorted by date
  { userId: 1, status: 1 },        // User's tasks by status
  { status: 1, createdAt: -1 },    // All tasks by status & date
];
```

### Query Optimization

```javascript
// ✅ FAST - Uses index
db.tasks.find({ userId: "...", status: "success" })
         .sort({ createdAt: -1 })
         .limit(10)

// ✅ FAST - Uses index
db.tasks.find({ status: "pending" }).count()

// ⚠️ SLOW - Full collection scan
db.tasks.find({ inputText: "..." })
// Add index if common:
db.tasks.createIndex({ inputText: "text" })
```

### Index Maintenance

```bash
# View indexes
db.tasks.getIndexes()

# Drop unused index
db.tasks.dropIndex("index_name")

# Rebuild indexes (maintenance window)
db.tasks.reIndex()

# Monitor index usage
db.tasks.aggregate([{ $indexStats: {} }])
```

### Monitoring Indexes

```javascript
// Mongoose: Use explain() to verify index usage
const tasks = await Task.find({ userId: "..." })
                        .sort({ createdAt: -1 })
                        .explain("executionStats");

// executionStats shows:
// - executionStages.stage (should be "COLLSCAN" = bad, "IXSCAN" = good)
// - executionStats.totalDocsExamined
// - executionStats.executionStages.nReturned
// Ratio of examined:returned should be low
```

## 🔴 Redis Downtime Handling

### What Happens When Redis Goes Down

```
Timeline:
0s   - Redis crashes
3s   - Backend gets connection timeout on next task POST
5s   - User sees error: "Failed to enqueue task"
8s   - Worker stops processing (can't connect to Redis)
```

### Failure Handling Strategy

**Current Implementation (Production Ready):**

```
1. Task Status Fallback:
   - Task saved to MongoDB with status "pending"
   - Job enqueue to Redis fails with error
   - Frontend shows error: "Task created but queued failed"
   - User can retry via frontend

2. Worker Behavior:
   - Worker has connection retry logic
   - Reconnects with exponential backoff
   - Logs all failures
   - Eventually resumes when Redis is back

3. Data Consistency:
   - MongoDB has all task data (source of truth)
   - Redis queue is ephemeral (can be rebuilt)
   - No data loss, only processing delay
```

### Full Redis Recovery Strategy

```
Option 1: RDB Snapshot (Simple)
- Redis creates periodic snapshots
- On restart, loads data from dump.rdb
- Jobs that were in queue are restored
- Setup: redis.conf -> save 900 1
  (save if 1+ keys change in 900 seconds)

Option 2: AOF Persistence (Safer)
- Redis logs every operation
- On restart, replays all operations
- 100% durability guarantee
- Setup: redis.conf -> appendonly yes
  + appendfsync everysec (every 1 second)

Option 3: Redis Cluster (HA)
- Multiple Redis instances (replication)
- Automatic failover if master dies
- Production-grade HA setup
- Setup: Redis Sentinel or Redis Cluster mode

Option 4: Message Queue with Persistence
- Replace Redis with RabbitMQ or Apache Kafka
- Built-in persistence and durability
- Advanced features (dead-letter queues, etc.)
```

### Implementation for 100k Tasks/Day

```yaml
# Kubernetes: Redis with persistent volume
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 50Gi

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-config
data:
  redis.conf: |
    # Persistence
    save 900 1          # Save after 900s if 1+ key changed
    appendonly yes      # AOF persistence
    appendfsync everysec  # Sync to disk every second

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  template:
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        command:
        - redis-server
        - /usr/local/etc/redis/redis.conf
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        - name: redis-config
          mountPath: /usr/local/etc/redis
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
      - name: redis-config
        configMap:
          name: redis-config
```

## 🌍 Staging vs Production Deployment

### Environment Configuration

```
┌──────────────────────────────────────────┐
│           STAGING                        │
├──────────────────────────────────────────┤
│ ✅ Features: All enabled                 │
│ ✅ Data: Separate DB (non-production)    │
│ ✅ Replicas: 1-2 per service             │
│ ✅ Resources: Shared cluster             │
│ ✅ Logs: Verbose (DEBUG level)           │
│ ✅ Monitoring: Basic                     │
│ ✅ Cost: Low ($100-200/month)            │
│ ✅ SLA: None (can be down)               │
│ ✅ Database: SQLite or small MongoDB     │
│ ✅ Backups: Daily                        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│           PRODUCTION                     │
├──────────────────────────────────────────┤
│ ✅ Features: Feature flagged             │
│ ✅ Data: Production DB (critical)        │
│ ✅ Replicas: 3+ per service              │
│ ✅ Resources: Dedicated cluster          │
│ ✅ Logs: INFO level + centralized        │
│ ✅ Monitoring: Advanced (Prometheus)     │
│ ✅ Cost: High ($500-2000/month)          │
│ ✅ SLA: 99.9% uptime                     │
│ ✅ Database: MongoDB Replicaset          │
│ ✅ Backups: Hourly                       │
│ ✅ Disaster Recovery: Multi-region       │
│ ✅ Security: RBAC, NetworkPolicy         │
│ ✅ Secrets: Encrypted at rest/transit    │
└──────────────────────────────────────────┘
```

### Deployment Differences

```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  backend:
    image: ai-task-backend:staging
    environment:
      NODE_ENV: staging
      LOG_LEVEL: debug
    replicas: 1
    resources:
      limits:
        memory: 512M

# Kubernetes: Production namespace
kubectl apply -f infra/namespace.yaml
kubectl apply -f infra/backend/deployment.yaml  # 3 replicas, more resources

# Staging namespace (if separate cluster)
kubectl create namespace staging
kubectl apply -f infra-staging/backend/deployment.yaml  # 1 replica
```

### Rollout Strategy

```
Staging Deployment:
1. Deploy to staging cluster
2. Run smoke tests (5 min)
3. Load test (10 min)
4. Manual testing (30 min)
5. Approve for production

Production Deployment (Blue-Green):
1. Deploy v2 (Green) alongside v1 (Blue)
2. Route 10% traffic to v2 (canary)
3. Monitor metrics for 15 min
4. If OK: Route 50% traffic to v2
5. Monitor for 15 min
6. If OK: Route 100% traffic to v2
7. Keep v1 running for 1 hour (rollback ready)
8. Scale down v1
```

## 🏥 Health Checks & Monitoring

### Liveness Probes

```
Backend:   GET /health (every 10s)
           If 3 failures → Container restart
           Timeout: 5s

Worker:    No HTTP health check
           BullMQ auto-reconnects to Redis
           If Redis offline for >5min → Pod restart

MongoDB:   mongosh admin.ping() (every 10s)

Redis:     redis-cli ping (every 10s)
```

### Metrics to Monitor

```
Application:
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Active connections
- Task processing time
- Queue depth (pending jobs)

Infrastructure:
- CPU usage per pod
- Memory usage per pod
- Disk I/O (MongoDB)
- Network bandwidth
- Database connection pool

Business:
- Tasks completed/day
- Average processing time
- Success rate (%)
- User signups/day
- Task distribution (by operation)
```

### Alerting Rules

```
Alert if:
- Error rate > 1%
- Task processing queue > 1000 jobs
- Backend latency p99 > 2 seconds
- Worker CPU > 90% for 5 min (scale up)
- MongoDB replication lag > 10 seconds
- Redis memory > 80% capacity
- Pod restart count > 3 in 1 hour
```

## 🔒 Security Considerations

### HTTPS/TLS

```
- All traffic encrypted
- Certificate via cert-manager + Let's Encrypt
- Auto-renewal before expiry
- HSTS header enabled (force HTTPS)
```

### Authentication

```
JWT Flow:
1. User logs in with email/password
2. Password compared with bcrypt hash
3. Server issues JWT (valid for 7 days)
4. Frontend stores JWT in localStorage
5. Frontend sends JWT in Authorization header
6. Backend verifies JWT signature using secret
7. Frontend auto-refreshes JWT before expiry (optional)
```

### Secrets Management

```
Development:
- .env files (NOT committed)
- Secrets in docker-compose via .env

Production (Kubernetes):
- Kubernetes Secrets (encrypted at rest)
- Sealed Secrets or Vault for encryption keys
- RBAC to restrict secret access

Secrets needed:
- JWT_SECRET (encryption key)
- MONGO_URI (database connection)
- REDIS_PASSWORD (if enabled)
- API_KEYS (external services)
```

### Network Security

```
Kubernetes NetworkPolicy:
- Restrict ingress: Only Ingress → Frontend
- Restrict ingress: Only Frontend → Backend API
- Restrict ingress: Only Backend → MongoDB/Redis
- Restrict ingress: Only Backend → Worker (via Redis)
- Egress: Only to required services

Docker Compose:
- Services on isolated network
- No direct host port exposure (except frontend)
- Firewall rules at host level
```

## 📈 Performance Optimization

### Caching Strategy

```
Frontend:
- JWT in localStorage (survives page refresh)
- Task list cached with SWR/React Query
- Revalidate on: task creation, status change

Backend:
- User data cached (JWT contains minimal info)
- No request caching (real-time is critical)

Database:
- Indexes on frequently queried fields
- Connection pooling (default: 5 connections)
- Read replicas for heavy queries (if MongoDB Enterprise)

Redis:
- BullMQ handles queue optimization
- Job retry with exponential backoff
```

### Load Testing (100k Tasks)

```bash
# Locust load test
locust -f locustfile.py --host=http://localhost:5000

# Expected:
# - 100k tasks = 1.16 tasks/sec average
# - Throughput: 3 requests/sec (peak)
# - Latency: <200ms p95
# - Error rate: <0.1%
```

---

## Summary

This platform is designed to handle 100k tasks/day with:

✅ **Scalability**: Horizontal scaling via Kubernetes  
✅ **Reliability**: Multi-level error handling, persistence  
✅ **Performance**: Optimized queries, caching, async processing  
✅ **Security**: JWT, bcrypt, rate limiting, RBAC  
✅ **Monitoring**: Probes, metrics, alerting  
✅ **DevOps**: Docker, Kubernetes, CI/CD ready  

**For 1M+ tasks/day**: Add Redis Cluster, MongoDB Replicaset, multiple regions.
