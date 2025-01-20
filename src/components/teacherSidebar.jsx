import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css'; // Adjust CSS file name if needed
import logoutIcon from '../assets/logout.png';
import settingIcon from '../assets/settings.png';
import usthLogo from '../assets/usthlogo.png';
import Setting from './SidebarItem/Setting';
import testIcon from '../assets/test.png';
import questionbankIcon from '../assets/questionbank.png';
import subjectIcon from '../assets/subject.png';
import profileIcon from '../assets/profile.png';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const mainMenuItems = [
    { text: 'Subjects', icon: subjectIcon, path: '/SubjectCard' }, // No dropdown needed
    { text: 'Question Bank', icon: questionbankIcon, path: '/QuestionBank' },
    { text: 'Tests', icon: testIcon, path: '/FullListTest' },
    { text: 'Profile', icon: profileIcon, path: '/user_profile' },
    { text: 'Setting', icon: settingIcon, path: '/Setting' },
  ];

  const handleMainMenuClick = (menuItemText) => {
    switch (menuItemText) {
      case 'Subjects':
        navigate('/SubjectCard');
        break; 
      case 'Tests':
        navigate('/FullListTest');
        break;
      case 'Question Bank':
        navigate('/QuestionBank');
        break;
      case 'Profile':
        navigate('/user_profile');
        break;
      case 'Setting':
        handleSettings();
        break;
      default:
        break;
    }
    toggleSidebar();
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('user');
    toggleSidebar();
    navigate('/login');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src={usthLogo} alt="USTH Logo" className="usthlogo" />
      </div>

      <div className="sidebar-menu">
        {mainMenuItems.map((item) => (
          <div
            key={item.text}
            className={`sidebar-item ${
              location.pathname === item.path ||
              (item.text === 'Setting' && showSettings)
                ? 'active'
                : ''
            }`}
            onClick={
              item.text === 'Setting'
                ? handleSettings
                : () => handleMainMenuClick(item.text)
            }
          >
            <img src={item.icon} alt={item.text} className="sidebar-icon" />
            <span>{item.text}</span>
          </div>
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
