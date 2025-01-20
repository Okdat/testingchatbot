import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./quiz.css";
import TopBar from "./teacherTopbar";
import Sidebar from "./Sidebar";

const QuizPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/test`
        );

        const data = JSON.parse(response.data.body);
        const tests = data.tests;

        const quizData = tests.map((test, index) => ({
          id: test.test_id,
          testNumber: index + 1,
        }));

        setQuestions(quizData);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const displayedQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const getPaginationGroup = () => {
    const startPage = Math.max(currentPage - 1, 1);
    const endPage = Math.min(startPage + 2, totalPages);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToTestDetail = (testId) => {
    navigate(`/test/${testId}/details`);
  };

  return (
    <div className="quiz-page">
      
      <div className="quiz-content">
      <div className="quiz-container">
        <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />
        
        {displayedQuestions.map((question) => (
          <button
            key={question.id}
            className="quiz-card"
            onClick={() => goToTestDetail(question.id)}
          >
            <div className="quiz-number">Test {question.testNumber}</div>
          </button>
        ))}
      </div>
      <div className="quiz-pagination">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="pagination-arrow"
        >
          «
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-arrow"
        >
          ‹
        </button>
        {getPaginationGroup().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={currentPage === pageNumber ? "active-page" : ""}
          >
            {pageNumber}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-arrow"
        >
          ›
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-arrow"
        >
          »
        </button>
      </div>
      </div>
    </div>
  );
};

export default QuizPage;
