import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateQuestion.css";

const CreateQuestion = ({ addNewQuestion, editingQuestion, saveEditedQuestion }) => {
  const [newQuestion, setNewQuestion] = useState({
    subject: "",
    chapter: "",
    content: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  useEffect(() => {
    if (editingQuestion) {
      setNewQuestion({
        subject: editingQuestion.subject_name || "",
        chapter: editingQuestion.chapter_name || "",
        content: editingQuestion.question_text || "",
        options: editingQuestion.choices.map((choice) => choice.choice_text) || [
          "",
          "",
          "",
          "",
        ],
        correctAnswer:
          editingQuestion.choices.findIndex((choice) => choice.is_correct) >= 0
            ? String.fromCharCode(
                65 + editingQuestion.choices.findIndex((choice) => choice.is_correct)
              )
            : "",
      });
    }
  }, [editingQuestion]);

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
        if (response.status === 200) {
          const data = JSON.parse(response.data.body);
          setSubjects(data.subjects || []);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [token]);

  useEffect(() => {
    if (newQuestion.subject) {
      const selectedSubject = subjects.find(
        (subject) => subject.subject_name === newQuestion.subject
      );

      if (selectedSubject) {
        const fetchChapters = async () => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/subject/${selectedSubject.subject_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (response.status === 200) {
              const data = JSON.parse(response.data.body);
              console.log("Chapters: ", data);
              setChapters(data || []);
            }
          } catch (error) {
            console.error("Error fetching chapters:", error);
          }
        };

        fetchChapters();
      }
    } else {
      setChapters([]);
    }
  }, [newQuestion.subject, token, subjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion((prevState) => ({
      ...prevState,
      options: updatedOptions,
    }));
  };

  const handleAddOrEditQuestion = async () => {
    const requestBody = {
      subject_name: newQuestion.subject,
      chapter_name: newQuestion.chapter,
      type: "MCQ",
      question_text: newQuestion.content,
      choices: newQuestion.options.map((option, idx) => ({
        choice_text: option,
        is_correct: newQuestion.correctAnswer === String.fromCharCode(65 + idx),
      })),
    };

    setLoading(true);

    try {
      if (editingQuestion) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/quizquestions/${editingQuestion.quiz_id}`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          alert("Question updated successfully!");
          saveEditedQuestion({ ...requestBody, quiz_id: editingQuestion.quiz_id });
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/quizquestions`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          alert("Question created successfully!");
          addNewQuestion(response.data);
          setNewQuestion({
            subject: "",
            chapter: "",
            content: "",
            options: ["", "", "", ""],
            correctAnswer: "",
          });
        }
      }
    } catch (error) {
      console.error("Error saving the question:", error);
      alert("An error occurred while saving the question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-question-container">
      <h1>{editingQuestion ? "Edit Question" : "Create New Question"}</h1>
      <div className="form">
        <div className="form-group">
          <label>Subject</label>
          <select
            name="subject"
            value={newQuestion.subject}
            onChange={handleInputChange}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subject) => (
              <option key={subject.subject_id} value={subject.subject_name}>
                {subject.subject_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Chapter</label>
          <select
            name="chapter"
            value={newQuestion.chapter}
            onChange={handleInputChange}
            disabled={chapters.length === 0}
          >
            <option value="">-- Select Chapter --</option>
            {Array.isArray(chapters) && chapters.map((chapter) => (
              <option key={chapter.chapter_id} value={chapter.chapter_name}>
                {chapter.chapter_name}
              </option>
            ))}
          </select>
          {chapters.length === 0 && newQuestion.subject && (
            <p className="error-message">No chapters available for the selected subject.</p>
          )}
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            value={newQuestion.content}
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        {["A", "B", "C", "D"].map((label, idx) => (
          <div className="form-group" key={idx}>
            <label>Option {label}</label>
            <input
              type="text"
              value={newQuestion.options[idx]}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
            />
          </div>
        ))}

        <div className="form-group">
          <label>Correct Answer</label>
          <select
            name="correctAnswer"
            value={newQuestion.correctAnswer}
            onChange={handleInputChange}
          >
            <option value="">-- Select Correct Answer --</option>
            {["A", "B", "C", "D"].map((answer) => (
              <option key={answer} value={answer}>
                {answer}
              </option>
            ))}
          </select>
        </div>

        <button className="submit" onClick={handleAddOrEditQuestion} disabled={loading}>
          {loading ? "Saving..." : editingQuestion ? "Update Question" : "Create Question"}
        </button>
      </div>
    </div>
  );
};

export default CreateQuestion;
