import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/tokenUtils';
import { taskService } from '../services/taskService';
import StatusBadge from '../components/StatusBadge';
import Navbar from '../components/Navbar';
import '../styles/TaskDetail.css';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const storedUserName = localStorage.getItem('user_name');
    if (storedUserName) {
      setUserName(storedUserName);
    }

    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskById(taskId);
      setTask(response.data.task);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar userName={userName} />
        <div className="task-detail loading">Loading task...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar userName={userName} />
        <div className="task-detail error">
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar userName={userName} />
      <div className="task-detail">
        <div className="task-detail-container">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>

          <div className="task-detail-card">
            <div className="task-detail-header">
              <h1>{task.title}</h1>
              <StatusBadge status={task.status} />
            </div>

            <div className="task-detail-info">
              <div className="info-group">
                <label>Operation</label>
                <p>{task.operation}</p>
              </div>

              <div className="info-group">
                <label>Status</label>
                <p>{task.status}</p>
              </div>

              <div className="info-group">
                <label>Created</label>
                <p>{new Date(task.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="task-detail-content">
              <div className="content-section">
                <h2>Input Text</h2>
                <div className="content-box">
                  <p>{task.inputText}</p>
                </div>
              </div>

              {task.result && (
                <div className="content-section">
                  <h2>Result</h2>
                  <div className="content-box result">
                    <p>{task.result}</p>
                  </div>
                </div>
              )}

              {task.logs && task.logs.length > 0 && (
                <div className="content-section">
                  <h2>Processing Logs</h2>
                  <div className="logs-box">
                    {task.logs.map((log, index) => (
                      <div key={index} className="log-entry">
                        <span className="log-time">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="log-message">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
