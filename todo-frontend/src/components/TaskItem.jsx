import React, { useState } from 'react';
import { Check, Clock, Edit3, Trash2, Calendar } from 'lucide-react';
import { tasksAPI } from '../services/api';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(task);
  const [loading, setLoading] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 0: return 'border-l-green-500 bg-green-50';
      case 1: return 'border-l-yellow-500 bg-yellow-50';
      case 2: return 'border-l-orange-500 bg-orange-50';
      case 3: return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      case 3: return 'Critical';
      default: return 'Unknown';
    }
  };

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await tasksAPI.updateTask(task.id, {
        ...task,
        isCompleted: !task.isCompleted
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await tasksAPI.updateTask(task.id, editData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await tasksAPI.deleteTask(task.id);
        onDelete();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isEditing) {
    return (
      <div className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(task.priority)}`}>
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task title"
          />
          <textarea
            value={editData.description || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task description"
            rows="3"
          />
          <div className="flex gap-2">
            <select
              value={editData.priority}
              onChange={(e) => setEditData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Low</option>
              <option value={1}>Medium</option>
              <option value={2}>High</option>
              <option value={3}>Critical</option>
            </select>
            <input
              type="datetime-local"
              value={editData.dueDate ? new Date(editData.dueDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(task.priority)} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.isCompleted && <Check className="w-3 h-3" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-gray-900 ${
              task.isCompleted ? 'line-through text-gray-500' : ''
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Created: {formatDate(task.createdAt)}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === 0 ? 'bg-green-100 text-green-800' :
                task.priority === 1 ? 'bg-yellow-100 text-yellow-800' :
                task.priority === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getPriorityText(task.priority)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;