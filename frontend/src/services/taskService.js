import apiClient from './authService';

// Task endpoints
export const taskService = {
  // Create a new task
  createTask: (title, inputText, operation) =>
    apiClient.post('/tasks', { title, inputText, operation }),

  // Get all tasks for logged-in user (with pagination)
  getTasks: (page = 1, limit = 10) =>
    apiClient.get('/tasks', { params: { page, limit } }),

  // Get a specific task by ID
  getTaskById: (taskId) =>
    apiClient.get(`/tasks/${taskId}`),
};
