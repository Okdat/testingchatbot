import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";
import "./ResultPage.css";
import TopBar from "./teacherTopbar";
import Sidebar from "./Sidebar";

const ResultPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility
  const { testId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const questionRefs = useRef([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchTestResult = async () => {
      const userId = state?.userId || user?.user_id;

      if (!userId || !testId || !user?.access_token) {
        setError("Required parameters are missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/test/${testId}/student/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const responseBody = JSON.parse(response.data.body);

        if (responseBody.message === "You have already completed this test.") {
          setTestResult(responseBody.testResult);
        } else {
          setError("Test result not found.");
        }
      } catch (err) {
        console.error("Failed to fetch test result:", err);
        setError("Failed to load test result. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestResult();
  }, [testId, state, user]);

  const scrollToQuestion = (index) => {
    questionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="result-content">
      <Sidebar isOpen={isSidebarOpen} /><TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />
      <div
        className={`result-page-container ${
          isSidebarOpen ? "" : "sidebar-closed"
        }`}
      >
        
        {loading ? (
          <p>Loading test results...</p>
        ) : error ? (
          <p>{error}</p>
        ) : testResult && testResult.answers ? (
          <>
            {/* Left Navigation Bar */}
            <div className="result-page-nav">
              <h3>Questions</h3>
              <div className="result-page-grid">
                {testResult.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`result-page-nav-item ${
                      answer.is_correct ? "correct" : "incorrect"
                    }`}
                    onClick={() => scrollToQuestion(index)}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="result-page-content">
              <h2 style={{ marginBottom: '0px' }}>Test Results</h2>
              <p>
                <strong>Score:</strong> {testResult.test_point} /{" "}
                {testResult.answers.length}
              </p>

              <div className="result-page-questions">
                {testResult.answers.map((answer, index) => (
                  <div
                    key={index}
                    ref={(el) => (questionRefs.current[index] = el)}
                    className="result-page-question-card"
                  >
                    <p>
                      <strong>Question {index + 1}:</strong>{" "}
                      {answer.question_text}
                    </p>
                    <div className="result-page-options">
                      {answer.choices.map((choice) => (
                        <p
                          key={choice.choice_id}
                          className={`result-page-option ${
                            choice.choice_id ===
                            parseInt(answer.submitted_answer)
                              ? answer.is_correct
                                ? "correct"
                                : "incorrect"
                              : choice.is_correct
                              ? "correct"
                              : ""
                          }`}
                        >
                          {choice.choice_id}. {choice.choice_text}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p>No results available for this test.</p>
        )}
      </div>
    </div>
  );
};

export default ResultPage;