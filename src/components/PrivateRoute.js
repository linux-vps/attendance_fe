import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Nếu chưa đăng nhập, chuyển về trang login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Nếu có yêu cầu về role và user không có role phù hợp
  if (roles && !roles.includes(user.role)) {
    // Nếu là admin, chuyển về /admin
    if (user.role === 'admin') {
      return <Navigate to="/admin" />;
    }
    // Nếu là manager, chuyển về /manager 
    if (user.role === 'manager') {
      return <Navigate to="/manager" />;
    }
    // Nếu là user (nhân viên), chuyển về /employee
    if (user.role === 'user') {
      return <Navigate to="/employee" />;
    }
    // Nếu không có role hợp lệ, chuyển về trang chủ
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
