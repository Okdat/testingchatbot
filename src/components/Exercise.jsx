import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./Exercise.css";

function Exercise() {
  const { subjectId } = useParams();
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  const [chapters, setChapters] = useState([]); // List of chapters
  const [selectedChapterId, setSelectedChapterId] = useState(null); // Selected chapter id
  const [questions, setQuestions] = useState([]); // Questions for the selected chapter
  const [answers, setAnswers] = useState([]); // Answers selected by the user
  const [exerciseResult, setExerciseResult] = useState(null); // Exercise result
  const [loading, setLoading] = useState(true);
  const [showChapters, setShowChapters] = useState(true); // Control chapter list visibility

  // Fetch chapters list from the API
  const fetchChapters = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/subject/${subjectId}`, // Fetch chapters for the subject
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const body = JSON.parse(response.data.body);
      if (Array.isArray(body)) {
        setChapters(body);
      } else {
        setChapters([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      setLoading(false);
    }
  };

  // Fetch exercise questions for the selected chapter
  const fetchQuestions = async (chapterId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chapter/${chapterId}/exercise`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const body = JSON.parse(response.data.body);
      setQuestions(body.questions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  // Handle chapter selection
  const handleChapterSelect = (chapterId) => {
    setSelectedChapterId(chapterId);
    setShowChapters(false); // Hide chapters list
    fetchQuestions(chapterId); // Fetch questions for the selected chapter
  };

  // Handle answer change for the questions
  const handleAnswerChange = (questionId, choiceId) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      const existingAnswerIndex = newAnswers.findIndex(
        (answer) => answer.question_id === questionId
      );
      if (existingAnswerIndex !== -1) {
        newAnswers[existingAnswerIndex].submitted_answer = choiceId;
      } else {
        newAnswers.push({ question_id: questionId, submitted_answer: choiceId });
      }
      return newAnswers;
    });
  };

  // Submit the answers and get the exercise result
  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/chapter/${selectedChapterId}/exercise`,
        {
          user_id: JSON.parse(localStorage.getItem("user")).user_id,
          answers: answers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const body = JSON.parse(response.data.body);
      setExerciseResult(body);
    } catch (error) {
      console.error("Error submitting exercise:", error);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    setShowChapters(true); 
    setSelectedChapterId(null); 
    setQuestions([]); 
    setExerciseResult(null); 
  };

  useEffect(() => {
    fetchChapters();
  }, [subjectId]);

  return (
    <div className="exercise-container">
      {loading ? (
        <p>Loading chapters...</p>
      ) : (
        <>
          {showChapters && chapters.length > 0 && (
            <div className="exercise-chapters-list">
              {chapters.map((chapter) => (
                <div key={chapter.chapter_id} className="chapter-card">
                  <h3>{chapter.chapter_name}</h3>
                  <button onClick={() => handleChapterSelect(chapter.chapter_id)}>
                    Start Exercise
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedChapterId && questions.length > 0 && !showChapters && (
            <div className="questions-container">
              <h3>Questions for the Selected Chapter</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                {questions.map((question, index) => (
                  <div key={question.quiz_id} className="question-item">
                    <h4>{`${index + 1}. ${question.question_text}`}</h4>
                    <div>
                      {question.choices.map((choice) => (
                        <label key={choice.choice_id}>
                          <input
                            type="radio"
                            name={question.quiz_id}
                            value={choice.choice_id}
                            onChange={() =>
                              handleAnswerChange(question.quiz_id, choice.choice_id)
                            }
                          />
                          {choice.choice_text}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleSubmit}>
                  Submit Answers
                </button>
                <button type="button" className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {exerciseResult && (
            <div className="exercise-result">
              <h3>Results</h3>
              <p>Exercise Points: {exerciseResult.exercise_point}</p>
              <ul>
                {exerciseResult.answers.map((answer) => (
                  <li key={answer.question_id}>
                    Question: {answer.question_id}, Your Answer:{" "}
                    {answer.submitted_answer}, Correct:{" "}
                    {answer.is_correct ? "Yes" : "No"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Exercise;
