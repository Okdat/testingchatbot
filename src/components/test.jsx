import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./test.css";
import { useAuth } from "../context/authContext";
import TopBar from "./teacherTopbar";
import Sidebar from "./Sidebar";

const MultipleChoiceLayout = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(
    JSON.parse(localStorage.getItem(`answers_${testId}`)) || {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // Timer in seconds
  const timerRef = useRef(null);

  // Toggle Sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fetch Test Status
  useEffect(() => {
    const fetchTestStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/test/${testId}/student/${user.user_id}`,
          {
            headers: { Authorization: `Bearer ${user.access_token}` },
          }
        );

        const responseBody = JSON.parse(response.data.body);
        if (responseBody.status === "Completed") {
          alert("You have already completed this test.");
          navigate(`/test/${testId}/details`);
        }
      } catch (err) {
        console.error("Failed to fetch test status:", err);
        navigate("/dashboard");
      }
    };

    fetchTestStatus();
  }, [testId, user, navigate]);

  // Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/test/${testId}`,
          {
            headers: { Authorization: `Bearer ${user.access_token}` },
          }
        );

        const responseData = JSON.parse(response.data.body);
        if (responseData && Array.isArray(responseData.questions)) {
          const formattedQuestions = responseData.questions.map((q) => ({
            questionId: q.question_id,
            text: q.question_text,
            options: q.choices.map((choice) => ({
              optionId: choice.choice_id,
              text: choice.choice_text,
            })),
          }));
          setQuestions(formattedQuestions);
        } else {
          throw new Error("Invalid question format in API response.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testId, user]);

  // Timer Logic
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Save answers to local storage
  useEffect(() => {
    localStorage.setItem(`answers_${testId}`, JSON.stringify(answers));
  }, [answers, testId]);

  // Submit Test
  const handleSubmit = async () => {
    clearInterval(timerRef.current);

    try {
      const payload = {
        user_id: user.user_id,
        answers: Object.entries(answers).map(([qId, answer]) => ({
          question_id: qId,
          answer: answer.toString(),
        })),
        time_limit: 600 - timeLeft,
      };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/test/${testId}`,
        payload,
        { headers: { Authorization: `Bearer ${user.access_token}` } }
      );

      localStorage.setItem(`test_status_${testId}`, "completed");
      alert("Your test has been submitted successfully.");
      navigate(`/test/${testId}/details`);
    } catch (err) {
      console.error(err);
      alert("Error submitting the test. Please try again.");
    }
  };

  // Handle Answer Change
  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Handle Navigation Between Questions
  const handleNavigation = (direction) => {
    setCurrentQuestionIndex((prev) => {
      if (direction === "next" && prev < questions.length - 1) return prev + 1;
      if (direction === "prev" && prev > 0) return prev - 1;
      return prev;
    });
  };

  // Format Timer Display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="student-test-content">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="test-container">
        <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />

        {/* Loading and Error State */}
        {loading && <p className="loading">Loading questions...</p>}
        {error && <p className="error">{error}</p>}

        {/* Main Content */}
        {!loading && !error && (
          <>
            <div className="test-sidebar">
              <h4>Quiz Navigation</h4>
              <div className="navigation-buttons">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={currentQuestionIndex === i ? "active" : ""}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button className="finish" onClick={handleSubmit}>
                Finish Test
              </button>
            </div>

            <div className="question-section">
              <div className="timer">Time Left: {formatTime(timeLeft)}</div>
              <h4>Test ID: {testId}</h4>
              {questions.length > 0 && (
                <>
                  <h2>{questions[currentQuestionIndex].text}</h2>
                  <div className="options">
                    {questions[currentQuestionIndex].options.map((option) => (
                      <label key={option.optionId} className="option-label">
                        <input
                          type="radio"
                          name={`question${currentQuestionIndex}`}
                          value={option.optionId}
                          checked={
                            answers[
                              questions[currentQuestionIndex].questionId
                            ] === option.optionId
                          }
                          onChange={() =>
                            handleAnswerChange(
                              questions[currentQuestionIndex].questionId,
                              option.optionId
                            )
                          }
                        />
                        {option.text}
                      </label>
                    ))}
                  </div>
                  <div className="button-container">
                    <button
                      onClick={() => handleNavigation("prev")}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handleNavigation("next")}
                      disabled={
                        currentQuestionIndex === questions.length - 1
                      }
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MultipleChoiceLayout;
