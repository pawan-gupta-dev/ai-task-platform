import React, { useState } from 'react';
import { taskService } from '../services/taskService';
import '../styles/TaskForm.css';

export default function TaskForm({ onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    inputText: '',
    operation: 'uppercase',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await taskService.createTask(
        formData.title,
        formData.inputText,
        formData.operation
      );
      setFormData({ title: '', inputText: '', operation: 'uppercase' });
      onTaskCreated(response.data.task);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>Create New Task</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Task Title</label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., Convert Email to Uppercase"
        />
      </div>

      <div className="form-group">
        <label htmlFor="inputText">Input Text</label>
        <textarea
          id="inputText"
          name="inputText"
          value={formData.inputText}
          onChange={handleChange}
          required
          placeholder="Paste your text here..."
          rows="5"
        />
      </div>

      <div className="form-group">
        <label htmlFor="operation">Operation</label>
        <select
          id="operation"
          name="operation"
          value={formData.operation}
          onChange={handleChange}
        >
          <option value="uppercase">🔤 UPPERCASE</option>
          <option value="lowercase">🔤 lowercase</option>
          <option value="reverse">↩️ Reverse</option>
          <option value="wordcount">📊 Word Count</option>
        </select>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Processing...' : 'Create Task'}
      </button>
    </form>
  );
}
