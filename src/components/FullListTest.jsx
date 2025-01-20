import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./FullListTest.css";
import TopBar from "./teacherTopbar";
import Sidebar from "./teacherSidebar";
import "@fortawesome/fontawesome-free/css/all.min.css";

const FullListTest = () => {
  const [tests, setTests] = useState([]); 
  const [filteredTests, setFilteredTests] = useState([]); 
  const [subjects, setSubjects] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [subjectFilter, setSubjectFilter] = useState(""); 
  const [teacherNameFilter, setTeacherNameFilter] = useState(""); 
  const testsPerPage = 6; 
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  // Fetch all tests from the backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/test`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const parsedBody = JSON.parse(response.data.body);
        if (response.status === 200 && parsedBody.tests) {
          const sortedTests = parsedBody.tests.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          setTests(sortedTests); // Store all tests
          setFilteredTests(sortedTests); // Initialize filtered tests
        } else {
          setError("Failed to fetch tests.");
        }
      } catch (err) {
        console.error("Error fetching tests:", err);
        setError(err.message || "Error fetching tests.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [token]);

  // Fetch subjects from the backend
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/subject`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = JSON.parse(response.data.body);
        if (Array.isArray(data.subjects)) {
          setSubjects(data.subjects); // Set the list of subjects
        } else {
          throw new Error("Invalid subject data format.");
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, [token]);

  // Apply filters locally
  useEffect(() => {
    const applyFilters = () => {
      const filtered = tests.filter((test) => {
        const subjectMatch = subjectFilter
          ? test.subject_name?.toLowerCase() === subjectFilter.toLowerCase()
          : true;
        const teacherNameMatch = teacherNameFilter
          ? test.teacher_name?.toLowerCase().includes(teacherNameFilter.toLowerCase())
          : true;
        return subjectMatch && teacherNameMatch;
      });
      setFilteredTests(filtered);
      setCurrentPage(1); 
    };

    applyFilters();
  }, [subjectFilter, teacherNameFilter, tests]);

  // Pagination logic
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);

  const totalPages = Math.ceil(filteredTests.length / testsPerPage);
  const getPaginationGroup = () => {
    const startPage = Math.max(currentPage - 2, 1);
    const endPage = Math.min(startPage + 4, totalPages);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleViewDetail = (testId) => {
    navigate(`/ViewTest/${testId}`);
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/test/${testId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          alert("Test successfully deleted!");
          setTests((prevTests) => prevTests.filter((test) => test.test_id !== testId));
        } else {
          throw new Error("Failed to delete the test.");
        }
      } catch (err) {
        console.error("Error deleting test:", err);
        alert("An error occurred while deleting the test.");
      }
    }
  };


  return (
    <div className="full-list-test-container">
      <TopBar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="full-list-test-content">
        {loading ? (
          <div className="loading-container">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">Error: {error}</p>
          </div>
        ) : (
          <>
            <div className="tests-list">
              <div className="header">
                <button
                  className="create-test-button"
                  onClick={() => navigate("/TestCreationOptions")}
                >
                  + Create Test
                </button>
                <div className="filter-container">
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="filter-dropdown"
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_id} value={subject.subject_name}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Search by Teacher Name"
                    value={teacherNameFilter}
                    onChange={(e) => setTeacherNameFilter(e.target.value)}
                  />
                </div>
              </div>
              {currentTests.length > 0 ? (
                currentTests.map((test, index) => (
                  <div className="test-item" key={test.test_id}>
                    <div className="test-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="test-content">
                      <h4>Test {indexOfFirstTest + index + 1}</h4>
                      <span className="test-date">
                        {new Date(test.created_at).toLocaleString()}
                      </span>
                      <div className="test-details">
                        <span>
                          <i className="fas fa-book"></i> {test.subject_name || "N/A"}
                        </span>
                        <span>
                          <i className="fas fa-user"></i> {test.teacher_name || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="test-actions">
                      <button
                        className="view-details"
                        onClick={() => handleViewDetail(test.test_id)}
                      >
                        <i className="fas fa-eye"></i> View Details
                      </button>
                      {localStorage.getItem("user") &&
                      JSON.parse(localStorage.getItem("user")).user_name ===
                        test.teacher_name ? (
                        <button
                          className="delete"
                          onClick={() => handleDeleteTest(test.test_id)}
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p>No tests available. Create a new test to get started!</p>
              )}
            </div>
            <div className="pagination">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="pagination-arrow"
              >
                «
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-arrow"
              >
                ‹
              </button>
              {getPaginationGroup().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={currentPage === pageNumber ? "active-page" : ""}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-arrow"
              >
                ›
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-arrow"
              >
                »
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
  
};

export default FullListTest;