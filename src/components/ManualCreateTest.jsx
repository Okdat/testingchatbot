import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./ManualCreateTest.css";

const ManualCreateTest = ({ subjectName }) => {
  const [allQuestions, setAllQuestions] = useState([]); 
  const [questionBank, setQuestionBank] = useState([]); 
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  const teacherName = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).user_name
    : null;

  const navigate = useNavigate();

  // Fetch danh sách câu hỏi
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/quizquestions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = JSON.parse(response.data.body);
        if (data && Array.isArray(data.questions)) {
          setAllQuestions(data.questions); 
        } else {
          throw new Error("Invalid question bank format.");
        }
      } catch (err) {
        console.error("Error fetching question bank:", err);
        setError(err.response?.data?.message || "Failed to fetch question bank.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  // Lọc câu hỏi theo subject_name mỗi khi allQuestions hoặc subjectName thay đổi
  useEffect(() => {
    if (subjectName && allQuestions.length > 0) {
      const filteredQuestions = allQuestions.filter(
        (question) => question.subject_name === subjectName
      );
      setQuestionBank(filteredQuestions);
    }
  }, [subjectName, allQuestions]);

  // Xử lý chọn/deselect câu hỏi
  const handleQuestionSelect = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId));
    } else if (selectedQuestions.length < 10) {
      setSelectedQuestions([...selectedQuestions, questionId]);
    } else {
      alert("You can only select up to 10 questions.");
    }
  };

  // Xử lý khi nhấn Submit
  const handleSubmit = async () => {
    try {
      if (selectedQuestions.length !== 10) {
        alert("Please select exactly 10 questions.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/test/create-test`,
        { question_ids: selectedQuestions, teacher_name: teacherName, subject_name: subjectName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Test created successfully!");
        navigate("/FullListTest");
      } else {
        alert("Failed to create test.");
      }
    } catch (err) {
      console.error("Error creating test:", err);
      alert("An error occurred while creating the test.");
    }
  };

  // Xử lý khi nhấn Cancel
  const handleCancel = () => {
    navigate("/FullListTest");
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="manual-create-test-container">
      <h1 className="manual-create-test-title">Choose questions for {subjectName}</h1>
      <div className="question-bank">
        <h2>Question Bank</h2>
        {questionBank.length > 0 ? (
          questionBank.map((question) => (
            <div
              key={question.quiz_id}
              className={`question-item ${
                selectedQuestions.includes(question.quiz_id) ? "selected" : ""
              }`}
              onClick={() => handleQuestionSelect(question.quiz_id)}
            >
              <h3>{question.question_text}</h3>
            </div>
          ))
        ) : (
          <p>No questions available for the selected subject.</p>
        )}
      </div>
      <div className="button-group">
        {questionBank.length > 0 && (
          <button className="submit-test-button" onClick={handleSubmit}>
            Submit
          </button>
        )}
        <button className="cancel-test-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ManualCreateTest;
