import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./ViewTest.css";
import TopBar from "./teacherTopbar";
import Sidebar from "./teacherSidebar";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const ViewTest = () => {
  const { testId } = useParams();
  const [testDetails, setTestDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("questions");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/test/${testId}/teacher`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const parsedBody = JSON.parse(response.data.body);
        setTestDetails(parsedBody);
      } catch (error) {
        console.error("Error fetching test details:", error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/test/${testId}/teacher/get-userscore`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const parsedBody = JSON.parse(response.data.body);
        setStudents(parsedBody.students || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchTestDetails();
    fetchStudents();
  }, [testId, token]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const scoreCounts = Array(11).fill(0);
  students.forEach((student) => {
    const score = Math.min(student.score, 10);
    scoreCounts[score]++;
  });

  const chartData = {
    labels: ["<=1", "<=2", "<=3", "<=4", "<=5", "<=6", "<=7", "<=8", "<=9", "<=10"],
    datasets: [
      {
        label: "Number of Students",
        data: scoreCounts.slice(1),
        backgroundColor: [
          "#4caf50",
          "#ff9800",
          "#f44336",
          "#2196f3",
          "#9c27b0",
          "#ffeb3b",
          "#00bcd4",
          "#e91e63",
          "#8bc34a",
          "#607d8b",
        ],
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#0d47a1",
          font: { size: 14 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.7)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: { color: "#333", font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: { stepSize: 1, color: "#333", font: { size: 12 } },
      },
    },
  };

  return (
    <div className="view-test-container">
      <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="view-test-content">
      <h1 className="view-test-title">Test Details</h1>
      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "questions" ? "active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </button>
        <button
          className={`tab-button ${activeTab === "statistics" ? "active" : ""}`}
          onClick={() => setActiveTab("statistics")}
        >
          Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "questions" && (
          <div className="questions-section">
            <h2 className="create-test-title">Questions</h2>
            <div className="view-test-questions-list">
              {testDetails?.questions.map((question, index) => (
                <div className="question-item" key={question.question_id}>
                  <h3>
                    {index + 1}. {question.question_text}
                  </h3>
                  <ul className="choices-list">
                    {question.choices.map((choice) => (
                      <li
                        key={choice.choice_id}
                        className={`choice-item ${choice.is_correct ? "correct-choice" : ""}`}
                      >
                        {choice.choice_text}
                        {choice.is_correct && (
                          <span className="correct-label"> (Correct)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="statistics-section">
            <h2 className="chart-title">Score Statistics</h2>
            <div className="chart-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <h2 className="chart-title">Student Scores</h2>
            <table className="student-scores-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Score</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                <tr
                  key={student.student_id}
                  onClick={() =>
                    navigate(`/results/${testId}`, { state: { userId: student.student_id } })
                  }
                  style={{ cursor: "pointer" }}
                >
                    <td>{student.student_name || "N/A"}</td>
                    <td>{student.student_id}</td>
                    <td>{student.score}</td>
                    <td>
                      {student.submitted_at ? formatDate(student.submitted_at) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ViewTest;
