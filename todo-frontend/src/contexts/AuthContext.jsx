import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you might want to validate the token with your API
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      // Adjust this based on your actual API response structure
      const token = response.data?.token || response.data?.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
        setUser({ token });
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const register = async (email, password, userName) => {
    try {
      const response = await authAPI.register({ email, password, userName });
      // Adjust this based on your actual API response structure
      const token = response.data?.token || response.data?.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
        setUser({ token });
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};