import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import addChatIcon from '../assets/add_note.png';
import awardIcon from '../assets/award.png';
import logoutIcon from '../assets/logout.png';
import quizIcon from '../assets/quiz.png';
import settingIcon from '../assets/settings.png';
import usthLogo from '../assets/usthlogo.png';
import profileIcon from '../assets/profile.png';
import theoryIcon from '../assets/theory.png';
import Setting from './SidebarItem/Setting';
import axios from 'axios';

export default function Sidebar({ isOpen }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).access_token
    : null;

  const mainMenuItems = [
    { text: 'Chat Bot', icon: addChatIcon, path: '/student-dashboard' },
    { text: 'Subjects', icon: theoryIcon, path: '/subject', dropdown: true },
    { text: 'Rankings', icon: awardIcon, path: '/Ranking' },
    { text: 'User', icon: profileIcon, path: '/user_profile' },
    { text: 'Setting', icon: settingIcon, path: '/Setting' },
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setError(null); // Clear previous errors
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/subject`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const subjectsData = JSON.parse(response.data.body).subjects || [];
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        setError(error); // Set error state
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    // Only fetch subjects if on the /subject page or its subpages
    if (location.pathname.startsWith('/subject')) {
      fetchSubjects();
    }
  }, [token, location.pathname]); // Update dependency array

  useEffect(() => {
    // Always show the dropdown on /subject and its subpages
    if (location.pathname.startsWith('/subject')) {
      setShowSubjectsDropdown(true);
    } else {
      setShowSubjectsDropdown(false);
    }
  }, [location]);

  const handleMainMenuClick = (path) => {
    // Only close the dropdown if navigating to a page outside of /subject
    if (!location.pathname.startsWith('/subject')) {
      setShowSubjectsDropdown(false);
    }
    navigate(path);
  };

  const handleSubjectClick = (subjectId) => {
    navigate(`/subject/${subjectId}`);
  };

  const handleSubjectsMenuClick = () => {
    // Toggle the dropdown only if on the main /subject page
    if (location.pathname === '/subject') {
      setShowSubjectsDropdown(!showSubjectsDropdown);
    }
    navigate('/subject'); // Always navigate to the main /subject page
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src={usthLogo} alt="USTH Logo" className="usthlogo" />
      </div>

      <div className="sidebar-menu">
        {mainMenuItems.map((item) => (
          <React.Fragment key={item.text}>
            <div
              className={`sidebar-item ${
                location.pathname === item.path ||
                (item.text === 'Subjects' &&
                  location.pathname.startsWith('/subject')) ||
                (item.text === 'Setting' && showSettings)
                  ? 'active'
                  : ''
              }`}
              onClick={
                item.text === 'Subjects'
                  ? handleSubjectsMenuClick
                  : item.text === 'Setting'
                  ? handleSettings
                  : () => handleMainMenuClick(item.path)
              }
            >
              <img src={item.icon} alt={item.text} className="sidebar-icon" />
              <span>{item.text}</span>
            </div>

            {/* Submenu for Subjects */}
            {item.dropdown && showSubjectsDropdown && (
              <div className="sidebar-submenu">
                {isLoadingSubjects ? (
                  <div className="sidebar-subitem loading">Loading...</div>
                ) : error ? (
                  <div className="sidebar-subitem error">
                    Error: {error.message}
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="sidebar-subitem">No subjects found.</div>
                ) : (
                  subjects.map((subject) => (
                    <div
                      key={subject.subject_id}
                      className={`sidebar-subitem ${
                        location.pathname === `/subject/${subject.subject_id}`
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => handleSubjectClick(subject.subject_id)}
                    >
                      <span>{subject.subject_name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="sidebar-logout" onClick={handleLogout}>
        <img src={logoutIcon} alt="Logout" className="sidebar-icon" />
        <span>Logout</span>
      </div>

      {/* Setting Modal */}
      {showSettings && <Setting closeSettings={() => setShowSettings(false)} />}
    </div>
  );
}