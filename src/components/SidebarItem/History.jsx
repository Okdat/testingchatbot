import React from "react";
import "./History.css";

const History = ({ isOpen, onChatSelect }) => {
  const conversationChats = ["Chat 1", "Chat 2", "Chat 3"];

  const handleChatSelect = (chatName) => {
    onChatSelect(chatName);
  };

  return (
    <div className={`history ${isOpen ? "open" : ""}`}>
      <h2 className="history-header">Conversation History</h2>
      <div className="chat-list">
        {conversationChats.map((chat, index) => (
          <div
            key={index}
            className="chat"
            onClick={() => handleChatSelect(chat)}
          >
            {chat}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
