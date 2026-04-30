const Task = require('../models/Task');

// Supported operations
const operations = {
  uppercase: (text) => text.toUpperCase(),
  lowercase: (text) => text.toLowerCase(),
  reverse: (text) => text.split('').reverse().join(''),
  wordcount: (text) => text.split(/\s+/).filter((word) => word.length > 0).length.toString(),
};

// Process a single job
const processJob = async (job) => {
  const { taskId, userId, inputText, operation } = job.data;

  try {
    console.log(`📝 Processing job ${job.id}: Task ${taskId}`);

    // Find task in MongoDB
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found in database`);
    }

    // Add log entry
    task.logs.push({
      timestamp: new Date(),
      message: 'Job picked up by worker - processing started',
    });

    // Update status to running
    task.status = 'running';
    await task.save();

    console.log(`⚙️  Executing operation: ${operation}`);

    // Check if operation exists
    if (!operations[operation]) {
      throw new Error(`Operation '${operation}' not supported`);
    }

    // Execute operation
    const result = operations[operation](inputText);

    // Update task with result
    task.result = result;
    task.status = 'success';
    task.logs.push({
      timestamp: new Date(),
      message: `Operation completed successfully. Result: ${result.substring(0, 100)}...`,
    });

    await task.save();

    console.log(`✓ Task ${taskId} completed successfully`);

    return {
      success: true,
      taskId,
      result,
    };
  } catch (error) {
    console.error(`✗ Job failed: ${error.message}`);

    try {
      // Find and update task status to failed
      const task = await Task.findById(taskId);
      if (task) {
        task.status = 'failed';
        task.logs.push({
          timestamp: new Date(),
          message: `Error: ${error.message}`,
        });
        await task.save();
      }
    } catch (dbError) {
      console.error('Could not update task status:', dbError.message);
    }

    // Re-throw error so BullMQ retries or moves to dead-letter queue
    throw error;
  }
};

module.exports = { processJob, operations };
