import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    console.log('No user found, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`Unauthorized role: ${user.role}. Redirecting...`);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
