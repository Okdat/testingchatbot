import React from 'react';
import menuIcon from '../assets/menu.png';
import logoIcon from '../assets/usthlogo.png';
import sidebarRightIcon from '../assets/sidebar-right.png';
import './teacherTopbar.css';

const TopBar = ({ toggleSidebar, toggleHistory }) => {
  return (
    <div className="teacher-top-bar">
      <img
        src={menuIcon}
        alt="Menu"
        className="teacher-menu-toggle"
        onClick={toggleSidebar}
      />
      <div className='teacher-logo-center'>
        <img src={logoIcon} alt="Logo" className="teacher-logo" />
      </div>
    </div>
  );
};

export default TopBar;
