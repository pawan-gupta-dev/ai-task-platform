import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/tokenUtils';
import { taskService } from '../services/taskService';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import '../styles/Dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');

  // Check authentication and load user info from localStorage
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    // Load user name from localStorage (set during login)
    const storedUserName = localStorage.getItem('user_name');
    if (storedUserName) {
      setUserName(storedUserName);
    }

    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  return (
    <div className="dashboard">
      <Navbar userName={userName} />

      <div className="dashboard-container">
        <div className="dashboard-main">
          <TaskForm onTaskCreated={handleTaskCreated} />
          <TaskList tasks={tasks} loading={loading} />
        </div>
      </div>
    </div>
  );
}
