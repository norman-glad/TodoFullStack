import React, { useState } from 'react';
import { tasksAPI } from '../services/api';

const TaskForm = ({ onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await tasksAPI.createTask(formData);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 0,
      });
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="task-form">
      <h3>Create New Task</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Due Date:</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Priority:</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;