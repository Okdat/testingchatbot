import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import "./TestCreationOptions.css";
import RandomlyCreateTest from "./RandomlyCreateTest";
import ManualCreateTest from "./ManualCreateTest";
import TopBar from "./teacherTopbar";
import Sidebar from "./teacherSidebar";

const TestCreationOptions = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [subjects, setSubjects] = useState([]); 
  const [selectedSubject, setSelectedSubject] = useState(""); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  // Fetch list of subjects
  useEffect(() => {
    const fetchSubjects = async () => {
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
        const data = JSON.parse(response.data.body);
        console.log(data);
        if (Array.isArray(data.subjects)) {
          setSubjects(data.subjects);
        } else {
          throw new Error("Invalid subject data format.");
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleManualCreation = () => {
    if (!selectedSubject) {
      alert("Please select a subject first.");
      return;
    }
    setSelectedOption("manual");
  };

  const handleRandomCreation = () => {
    if (!selectedSubject) {
      alert("Please select a subject first.");
      return;
    }
    setSelectedOption("random");
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  return (
    <div className="test-creation-container">
      {/* TopBar stays at the top */}
      <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="test-creation-content">
        {/* Left Panel */}
        <div className="left-panel">
          <h2>Select a Subject</h2>
          <select
            className="subject-select"
            value={selectedSubject}
            onChange={handleSubjectChange}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subject) => (
              <option key={subject.subject_id} value={subject.subject_name}>
                {subject.subject_name}
              </option>
            ))}
          </select>

          <h2>Choose Your Test Method</h2>
          <div
            className={`option-card ${selectedOption === "manual" ? "active" : ""}`}
            onClick={handleManualCreation}
          >
            <i className="icon manual-icon"></i>
            <h3>Create Test Manually</h3>
            <p>Customize your test by selecting specific questions.</p>
          </div>
          <div
            className={`option-card ${selectedOption === "random" ? "active" : ""}`}
            onClick={handleRandomCreation}
          >
            <i className="icon random-icon"></i>
            <h3>Create Test Randomly</h3>
            <p>Generate a test automatically with random questions.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {selectedOption === "manual" && (
            <ManualCreateTest subjectName={selectedSubject} />
          )}
          {selectedOption === "random" && (
            <RandomlyCreateTest subjectName={selectedSubject} />
          )}
          {!selectedOption && (
            <div className="placeholder">
              <p>Select a subject and method on the left to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCreationOptions;
