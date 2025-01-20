import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./SubjectCard.css";
import { Link } from "react-router-dom";
import TopBar from "./teacherTopbar";
import Sidebar from "./teacherSidebar";

function SubjectCard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Track errors
  const dropdownRef = useRef(null); 
  const [activeCardId, setActiveCardId] = useState(null); 
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).access_token : null;
  const teacher_id = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user_id : null;
  const role = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
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
        console.log("Response: ", response);
        const subjects = JSON.parse(response.data.body).subjects || [];

        const filteredSubjects = role?.toLowerCase() === "teacher" ? subjects.filter((subject) => subject.teacher_id === teacher_id) : subjects;
        console.log("Display: ", subjects);
        const formattedSubjects = filteredSubjects.map((subjects) => ({
          id: subjects.subject_id, // Generate an ID based on index
          title: subjects.subject_name,
        }));
        setCards(formattedSubjects); // Assume API returns an array of subjects
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setLoading(false);
      }  
    }


  useEffect(() => {
    fetchSubjects();
  }, [token]);

  const handleAddCard = async () => {
    try {
      const subject_name = prompt("Enter the subject name:");
      if (!subject_name) {
        alert("Subject name is required!");
        return;
      }

      const newSubject = {
        subject_name,
        subject_description: "Default description",
        teacher_id,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/subject`,
        newSubject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const addedSubject = response.data;
      setCards([...cards, { id: addedSubject.subject_id, title: addedSubject.subject_name }]);
      await fetchSubjects();
    } catch (error) {
      console.error("Failed to add new subject:", error);
    }
  };

  const handleDeleteCard = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this card?");
    if (confirmDelete) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/subject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCards(cards.filter((card) => card.id !== id));
      } catch (error) {
        console.error("Failed to delete subject:", error);
      }
    }
  };

  const handleEditCard = async (id) => {
    const newTitle = prompt("Enter a new title for the card:");
    if (newTitle) {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/subject/${id}`,
          { subject_name: newTitle },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCards(
          cards.map((card) =>
            card.id === id ? { ...card, title: response.data.subject_name || newTitle } : card
          )
        );
        alert("Subject updated successfully!");
      } catch (error) {
        console.error("Failed to edit subject:", error);
        alert("Failed to update subject. Please try again.");
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (id) => {
    setActiveCardId(activeCardId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveCardId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="teacher-subject-main">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="contentContainer">
        <TopBar toggleSidebar={toggleSidebar} />
        
        <div className="mainContent">
          {loading && <p>Loading subjects...</p>}
          {error && <p>Failed to load subjects. Please try again later.</p>}
          {!loading && !error && (
            <div className="cardContainer">
              {cards.map((card) => (
                <div key={card.id} className="subjectCard">
                  <Link
                    to={`/subject/${card.id}`}
                    style={{ textDecoration: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="cardTheme">
                      <p className="title">{card.title}</p>
                    </div>
                  </Link>
                  <img
                    src="src/assets/more.png"
                    alt="Options"
                    className="moreCardImageButton"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(card.id);
                    }}
                />
                {/* Conditional rendering of dropdown */}
                {activeCardId === card.id && (
                    <div
                        ref={dropdownRef} // Reference to the dropdown menu
                        className="dropdownMenu"
                    >
                        <button className="Edit" onClick={() => handleEditCard(card.id)}>Edit</button>
                        <button className="Delete" onClick={() => handleDeleteCard(card.id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
              <button className="addCardButton" onClick={handleAddCard}>
                Add New Card
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
