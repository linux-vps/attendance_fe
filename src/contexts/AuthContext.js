// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('user');
    if (token && userRole && userData) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ ...JSON.parse(userData), token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    
    if (!response.data.data || !response.data.data.access_token) {
      console.error('Invalid response structure:', response.data);
      return { success: false };
    }

    const { access_token, employee } = response.data.data;
    const { role } = employee;

    if (!role) {
      console.error('Role not found in response');
      return { success: false };
    }

    localStorage.setItem('token', access_token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('user', JSON.stringify(employee));

    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser({ ...employee, token: access_token });
    return { success: true, role };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};