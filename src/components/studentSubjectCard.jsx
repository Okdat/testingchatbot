import React, { useState, useEffect } from "react";
import axios from "axios";
import "./studentSubjectCard.css";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "./teacherTopbar"; // Assuming this is compatible with the student view
import Sidebar from "./Sidebar"; // Assuming this is compatible with the student view

function StudentSubjectCard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/subject`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const subjects = JSON.parse(response.data.body).subjects || [];
      const formattedSubjects = subjects.map((subject) => ({
        id: subject.subject_id,
        title: subject.subject_name,
      }));
      setCards(formattedSubjects);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setError(error); // Set error state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [token]);

  return (
    <div className="student-subject-card-page">
      <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="student-card-container">
        {/* Loading and Error States */}
        {loading ? (
          <p>Loading subjects...</p>
        ) : error ? (
          <p>Error loading subjects: {error.message}</p>
        ) : (
          /* Display Cards */
          cards.map((card) => (
            <Link
              key={card.id || card.title}
              to={`/subject/${card.id}`}
              style={{ textDecoration: "none" }}
            >
              <div className="student-subject-card">
                <div className="student-card-theme">
                  <p className="student-card-title">{card.title}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentSubjectCard;