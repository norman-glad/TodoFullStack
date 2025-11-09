import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import TaskItem from './TaskItem';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    completed: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await tasksAPI.getTasks(filters);
      setTasks(response.items || []);
      setPagination({
        totalCount: response.totalCount,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const handleUpdateTask = async (id, updateData) => {
    try {
      await tasksAPI.updateTask(id, updateData);
      loadTasks(); // Reload tasks to reflect changes
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(id);
        loadTasks(); // Reload tasks to reflect changes
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="task-list">
      <div className="filters">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="search-input"
        />
        <select
          value={filters.completed}
          onChange={(e) => handleFilterChange('completed', e.target.value)}
        >
          <option value="">All Tasks</option>
          <option value="true">Completed</option>
          <option value="false">Pending</option>
        </select>
        <select
          value={filters.pageSize}
          onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <>
          <div className="tasks-grid">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          {tasks.length === 0 && !loading && (
            <div className="empty-state">
              No tasks found. Create your first task!
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;