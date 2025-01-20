import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from "./teacherTopbar";
import Sidebar from "./Sidebar";
import "./studentTheory.css";
import StudentSubjectCard from './studentSubjectCard';

const StudentTheory = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="student-theory">
      <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      <div className={`student-dashboard-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        <div className="student-card-container">
          <StudentSubjectCard />
        </div>
      </div>
    </div>
  );
};

export default StudentTheory;
