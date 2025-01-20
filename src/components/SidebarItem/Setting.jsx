import React, { useState, useEffect, useRef } from "react";
import "./Setting.css";

function Setting({ closeSettings }) {
  const [isAlwaysShowCode, setIsAlwaysShowCode] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(true);
  const settingsRef = useRef(null);

  const handleToggle = () => {
    setIsAlwaysShowCode(!isAlwaysShowCode);
  };

  const handleThemeToggle = () => {
    setIsLightTheme(!isLightTheme);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        closeSettings();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeSettings]);

  return (
    <div className="overlay">
      <div className="settings-container" ref={settingsRef}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={closeSettings}>
            ✖
          </button>
        </div>
        <div className="settings-content">
          <div className="settings-item">
            <span>Theme</span>
            <div className="toggle-container">
              <span className="spanmargin">Light</span>
              <button
                className={`toggle-switch ${isLightTheme ? "on" : "off"}`}
                onClick={handleThemeToggle}
              ></button>
              <span className="spanmargin">Dark</span>
            </div>
          </div>
          <hr />

          <div className="settings-item">
            <span>Language</span>
            <select className="dropdown">
              <option>Auto-detected</option>
              <option>English</option>
              <option>Vietnamese</option>
            </select>
          </div>

          <div className="settings-item">
            <span>Archived chats</span>
            <button className="manage-button">Manage</button>
          </div>

          <div className="settings-item">
            <span>Archive all chats</span>
            <button className="action-button">Archive all</button>
          </div>

          <div className="settings-item">
            <span>Delete all chats</span>
            <button className="action-button delete">Delete all</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;