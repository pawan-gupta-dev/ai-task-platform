const { Queue, Worker } = require('bullmq');

// Create Redis connection options for Upstash
const redisConnection = {
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  tls: process.env.REDIS_TLS === 'true',
};

// Create task queue (same queue used by backend)
const taskQueue = new Queue('tasks', { connection: redisConnection });

// Handle queue errors
taskQueue.on('error', (err) => {
  console.error('Queue error:', err);
});

module.exports = {
  taskQueue,
  redisConnection,
};
