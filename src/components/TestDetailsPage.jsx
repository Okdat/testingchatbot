import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";
import "./TestDetailsPage.css";
import TopBar from "./teacherTopbar";
import Sidebar from "./Sidebar";

const TestDetailsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { testId } = useParams();
  const { user } = useAuth();
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!user || !user.user_id || !user.access_token) {
        setError("User authentication is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/test/${testId}/student/${user.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const responseBody = JSON.parse(response.data.body);
        console.log("Test Details Response:", responseBody);

        if (
          responseBody.message === "Tests fetched successfully" ||
          responseBody.message === "Test not completed. Starting now."
        ) {
          setTestDetails({
            test_id: responseBody.test_id,
            status: "Not Attempted",
          });
        } else if (responseBody.message === "You have already completed this test.") {
          setTestDetails({
            test_id: responseBody.test_id,
            status: "Completed",
            testResult: responseBody.testResult,
          });
        } else {
          setError("Unexpected response from the server.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch test details:", err);
        setError("Failed to load test details. Please try again later.");
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId, user]);

  const handleStartTest = () => {
    navigate(`/test/${testId}`);
  };

  const handleViewResults = () => {
    navigate(`/results/${testId}`, {
      state: {
        userId: user.user_id,
      },
    });
  };

  return (
    <div className="test-details-content">
      <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />
      <Sidebar isOpen={isSidebarOpen} />
      <div className="test-details-container">
        <h2>Test Details</h2>
        {loading ? (
          <p>Loading test details...</p>
        ) : error ? (
          <p>{error}</p>
        ) : testDetails ? (
          <>
            <p>
              <strong>Test ID:</strong> {testDetails.test_id}
            </p>

            {testDetails.status === "Not Attempted" ? (
              <>
                <p>This test has not been attempted yet.</p>
                <button onClick={handleStartTest} className="start-button">
                  Start Test
                </button>
              </>
            ) : (
              <>
                <p>
                  <strong>Status:</strong> {testDetails.status}
                </p>
                {testDetails.testResult ? (
                  <>
                    <p>
                      <strong>Test Score:</strong>{" "}
                      {testDetails.testResult.test_point}
                    </p>
                    <p>
                      <strong>Submitted At:</strong>{" "}
                      {new Date(
                        testDetails.testResult.submitted_at
                      ).toLocaleString()}
                    </p>
                    <button onClick={handleViewResults} className="start-button">
                      View Results
                    </button>
                  </>
                ) : (
                  <p>No result available for this test.</p>
                )}
              </>
            )}
          </>
        ) : (
          <p>Test details are unavailable.</p>
        )}
      </div>
    </div>
  );
};

export default TestDetailsPage; 