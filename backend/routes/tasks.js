const express = require('express');
const { createTask, getTasks, getTaskById } = require('../controllers/tasksController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require JWT token
router.use(protect);

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', createTask);

// @route   GET /api/tasks
// @desc    Get all tasks for user
router.get('/', getTasks);

// @route   GET /api/tasks/:id
// @desc    Get task by ID
router.get('/:id', getTaskById);

module.exports = router;
