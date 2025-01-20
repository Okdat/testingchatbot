import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import StudentDashboard from '../components/StudentDashboard';
import TeacherDashboard from '../components/TeacherDashboard';
import FullListTest from '../components/FullListTest'; // Import FullListTest
import ProtectedRoute from '../components/ProtectedRoute';

const AppRouter = () => (
  <Router>
    <Routes>
      {/* Route cho trang Login */}
      <Route path="/login" element={<Login />} />

      {/* Route cho StudentDashboard */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute requiredRole="Student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Route cho TeacherDashboard */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute requiredRole="Teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

     
    
    </Routes>
  </Router>
);

export default AppRouter;
