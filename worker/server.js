require('dotenv').config();
const { Worker } = require('bullmq');
const connectDB = require('./config/database');
const { redisConnection } = require('./config/redis');
const { processJob } = require('./processors/jobProcessor');

// Connect to MongoDB
connectDB();

console.log('🚀 Starting Worker Service...');

// Create worker to process jobs from 'tasks' queue
const worker = new Worker('tasks', processJob, {
  connection: {
    url: process.env.UPSTASH_REDIS_URL 
  },
  concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 5,
});

// Log worker events
worker.on('ready', () => {
  console.log('✓ Worker ready and listening for jobs');
});

worker.on('completed', (job, result) => {
  console.log(`✓ Job ${job.id} completed:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`✗ Job ${job.id} failed:`, err.message);
});

worker.on('error', (error) => {
  console.error('Worker error:', error);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📛 SIGTERM received, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📛 SIGINT received, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

console.log('✓ Worker service running successfully');
