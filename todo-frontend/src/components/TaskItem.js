import React, { useState } from 'react';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title || '',
    description: task.description || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    priority: task.priority || 0,
    isCompleted: task.isCompleted || false,
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 0:
        return '#4ade80'; // Green for low priority
      case 1:
        return '#fbbf24'; // Yellow for medium priority
      case 2:
        return '#f87171'; // Red for high priority
      default:
        return '#d1d5db'; // Gray for undefined
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate(task.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 0,
      isCompleted: task.isCompleted || false,
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  if (isEditing) {
    return (
      <div className="task-item editing" style={{ borderLeft: `4px solid ${getPriorityColor(editData.priority)}` }}>
        <div className="task-header">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="task-title-input"
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) })}
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
        </div>
        <textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          className="task-description-input"
          placeholder="Description"
        />
        <div className="task-footer">
          <input
            type="date"
            value={editData.dueDate}
            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={editData.isCompleted}
              onChange={(e) => setEditData({ ...editData, isCompleted: e.target.checked })}
            />
            Completed
          </label>
          <div className="task-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${task.isCompleted ? 'completed' : ''}`} style={{ borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}>
      <div className="task-header">
        <h3 className="task-title">{task.title || 'Untitled Task'}</h3>
        <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority === 0 ? 'Low' : task.priority === 1 ? 'Medium' : 'High'}
        </span>
      </div>
      <p className="task-description">{task.description || 'No description'}</p>
      <div className="task-footer">
        <span className="due-date">Due: {formatDate(task.dueDate)}</span>
        <span className="created-date">Created: {formatDate(task.createdAt)}</span>
        <div className="task-actions">
          <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
          <button onClick={() => onDelete(task.id)} className="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;