import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import TopBar from "./teacherTopbar";
import Sidebar from "./teacherSidebar";
import SubjectCard from "./SubjectCard";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const navigate = useNavigate(); // Khởi tạo navigate
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  
  return (
    <div className="teacher-dashboard">
      {/* TopBar stays at the top */}
      <TopBar toggleSidebar={toggleSidebar} />
      
      {/* Sidebar is displayed based on the `isSidebarOpen` state */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="dashboard-content">
        <SubjectCard /> {/* Default content */}
      </div>
      
    </div>
  );
};

export default TeacherDashboard;
