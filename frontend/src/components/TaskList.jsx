import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import '../styles/TaskList.css';

export default function TaskList({ tasks, loading }) {
  if (loading) {
    return <div className="task-list loading">Loading tasks...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-list empty">
        <p>📭 No tasks yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2>Your Tasks</h2>
      <div className="tasks-grid">
        {tasks.map((task) => (
          <Link
            to={`/task/${task._id}`}
            key={task._id}
            className="task-card"
          >
            <div className="task-header">
              <h3>{task.title}</h3>
              <StatusBadge status={task.status} />
            </div>

            <p className="task-operation">
              Operation: <strong>{task.operation}</strong>
            </p>

            <p className="task-preview">
              {task.inputText.substring(0, 50)}
              {task.inputText.length > 50 ? '...' : ''}
            </p>

            {task.result && (
              <p className="task-result">
                Result: <strong>{task.result.substring(0, 30)}...</strong>
              </p>
            )}

            <p className="task-date">
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
