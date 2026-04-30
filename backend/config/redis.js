const { Queue, Worker } = require('bullmq');

// Create Redis connection options
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

// Create task queue (jobs will be pushed here)
const taskQueue = new Queue('tasks', { connection: redisConnection });

// Handle queue errors
taskQueue.on('error', (err) => {
  console.error('Queue error:', err);
});

module.exports = {
  taskQueue,
  redisConnection,
};
