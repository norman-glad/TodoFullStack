import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './styles/App.css';

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(0);

  const handleTaskCreated = () => {
    setRefreshTasks(prev => prev + 1); // Trigger task list refresh
  };

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="auth-container">
          {showRegister ? (
            <Register onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <Login onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </header>
      <main className="app-main">
        <div className="sidebar">
          <TaskForm onTaskCreated={handleTaskCreated} />
        </div>
        <div className="content">
          <TaskList key={refreshTasks} />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;