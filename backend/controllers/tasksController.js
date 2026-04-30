const Task = require('../models/Task');
const { taskQueue } = require('../config/redis');

// @route   POST /api/tasks
// @desc    Create a new task and push to queue
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, inputText, operation } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!title || !inputText || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, inputText, and operation',
      });
    }

    // Validate operation
    const validOperations = ['uppercase', 'lowercase', 'reverse', 'wordcount'];
    if (!validOperations.includes(operation)) {
      return res.status(400).json({
        success: false,
        message: `Invalid operation. Must be one of: ${validOperations.join(', ')}`,
      });
    }

    // Create task in MongoDB
    const task = await Task.create({
      userId,
      title,
      inputText,
      operation,
      status: 'pending',
    });

    // Add to Redis queue (worker will process this)
    await taskQueue.add(
      'process-task',
      {
        taskId: task._id.toString(),
        userId,
        inputText,
        operation,
      },
      { removeOnComplete: true, removeOnFail: false }
    );

    // Add log entry
    task.logs.push({
      timestamp: new Date(),
      message: 'Task created and queued',
    });
    await task.save();

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route   GET /api/tasks
// @desc    Get all tasks for logged-in user
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch tasks with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Task.countDocuments({ userId });

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(id);

    // Check if task exists
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
