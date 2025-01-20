import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./ChapterDetail.css";
import TopBar from "./teacherTopbar";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { htmlToText } from "html-to-text";

function ChapterDetailStudent() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null); 
  const [userAnswer, setUserAnswer] = useState(null);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  const { chapterId } = useParams();
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  const fetchChapterDetail = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chapter/${chapterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const body = JSON.parse(response.data.body);
      if (body && body.data) {
        setChapter(body.data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch chapter detail:", error);
      setLoading(false);
    }
  };

  const fetchQuizQuestion = async () => {
    setQuizLoading(true);
    setQuizError(null);
    setSubmissionResult(null); // Reset previous results
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chapter/${chapterId}/quiz`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const parsedData = JSON.parse(response.data.body);
      console.log("Fetched Quiz Question:", parsedData);
      setQuestion(parsedData); // Store the single quiz question
    } catch (err) {
      console.error("Failed to fetch quiz question:", err);
      setQuizError(err.message);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswerChange = (selectedAnswer) => {
    setUserAnswer(selectedAnswer); // Update the selected answer
  };

  const handleSubmitAnswer = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const userId = currentUser ? currentUser.user_id : null;
    console.log("User ID:", userId);

    if (!userId) {
      console.error("User ID not found. User might not be logged in.");
      setSubmissionResult({ error: "User ID not found." });
      return;
    }

    if (!userAnswer) {
      console.error("No answer selected.");
      setSubmissionResult({ error: "Please select an answer before submitting." });
      return;
    }

    // Build the answer data for the POST request
    const answerData = {
      user_id: userId,
      chapter_id: chapterId,
      answer: userAnswer,
    };
    console.log("Answer Data:", answerData);

    try {
      // Send the POST request to submit the answer
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/chapter/${chapterId}/quiz`,
        answerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Parse the response
      const responseData = response.data;
      console.log("Quiz Submission Response:", responseData);
      const parsedBody = JSON.parse(responseData.body);
      
      // Update submission result
      setSubmissionResult(parsedBody);
    } catch (error) {
      console.error("Error submitting answer:", error);
      setSubmissionResult({ error: "Failed to submit answer." });
    }
  };

  useEffect(() => {
    fetchChapterDetail();
    fetchQuizQuestion();
  }, [chapterId, token]);

  const handleDownload = () => {
    if (chapter) {
      const doc = new jsPDF();
      const pageHeight = 297; // A4 page height (mm)
      const marginTop = 10;
      const marginBottom = 10;
      const maxHeight = pageHeight - marginTop - marginBottom;
      const lineHeight = 5;
      let y = marginTop;

      const plainTextContent = htmlToText(chapter.theory_content, {
        wordwrap: 130,
      });

      const lines = doc.splitTextToSize(plainTextContent, 180);

      doc.setFontSize(18);
      doc.text(chapter.chapter_name, 10, y);
      y += 15;

      doc.setFontSize(12);
      lines.forEach((line) => {
        if (y + lineHeight > maxHeight) {
          doc.addPage();
          y = marginTop;
        }
        doc.text(line, 10, y);
        y += lineHeight;
      });

      doc.save(`${chapter.chapter_name}.pdf`);
    }
  };

  return (
    <div className="chapterdetail-page">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content-wrapper">
        <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />
        {loading ? (
          <div className="loading-container">
            <p>Loading chapter details...</p>
          </div>
        ) : quizError ? (
          <div className="error-container">
            <p>Error: {quizError}</p>
          </div>
        ) : chapter ? (
          <>
            <div className="chapterDetail-container">
              <h2 className="chapterDetail-title">{chapter.chapter_name}</h2>
              <div className="chapterDetail-editorContainer">
                <div className="chapterDetail-content">
                  <div
                    dangerouslySetInnerHTML={{ __html: chapter.theory_content }}
                  />
                </div>
                <div className="chapterDetail-mediaContainer">
                  {chapter.video_url && (
                    <iframe
                      src={chapter.video_url}
                      title="Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="chapterDetail-iframe"
                    ></iframe>
                  )}
                  {chapter.image_url && (
                    <img
                      src={chapter.image_url}
                      alt="Chapter"
                      className="chapterDetail-image"
                    />
                  )}
                  <button className="download-button" onClick={handleDownload}>
                    Download Chapter
                  </button>
                </div>
              </div>
            </div>
            <div className="quiz-section">
              {quizLoading ? (
                <p>Loading quiz question...</p>
              ) : question ? (
                <div>
                  <h3>Quiz</h3>
                  <h2>{question.question_text}</h2>
                  <div className="options">
                    {question.choice_text.map((choice, index) => (
                      <label key={index} className="option-label">
                        <input
                          type="radio"
                          name="quiz-option"
                          value={choice}
                          onChange={() => handleAnswerChange(choice)}
                        />
                        {choice}
                      </label>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <button className="submit-button" onClick={handleSubmitAnswer}>
                    Submit Answer
                  </button>

                  {/* Show Results */}
                  {submissionResult && (
                    <div className="submission-result">
                      {submissionResult.error ? (
                        <p className="error-message">{submissionResult.error}</p>
                      ) : (
                        <p className={submissionResult.result === "correct" ? "correct-message" : "incorrect-message"}>
                          {submissionResult.result === "correct"
                            ? "Correct!"
                            : `Incorrect! The correct answer is: ${submissionResult.correct_answer}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p>No quiz question available.</p>
              )}
            </div>
          </>
        ) : (
          <div className="error-container">
            <p>Chapter not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChapterDetailStudent;
