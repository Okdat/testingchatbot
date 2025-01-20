import React, { useState, useEffect, useRef } from 'react';
import './ChatArea.css';

const ChatArea = ({ currentChat, messages, onSendMessage, isOpen }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to the last message when the messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      onSendMessage(userMessage);
      setInput('');

      try {
        const response = await fetch('http://localhost:5000/api/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const botResponse = await response.json();

        if (botResponse.text) {
          onSendMessage({ text: botResponse.text, sender: 'bot' });
        } else {
          onSendMessage({
            text: 'Error: Received an invalid response from the server.',
            sender: 'bot',
          });
        }
      } catch (error) {
        console.error('Error:', error.message);
        onSendMessage({
          text: 'Error: Unable to connect to the chatbot server. Please try again later.',
          sender: 'bot',
        });
      }
    }
  };

  return (
    <div className={`chat-area ${isOpen ? 'chat-area-with-history' : ''}`}>
      <h2 className="chat-area-current-chat">{currentChat}</h2>
      <div className="chat-area-divider"></div>
      <div className="chat-area-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-area-message ${
              msg.sender === 'bot' ? 'chat-area-message-bot' : 'chat-area-message-user'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-area-input-area">
        <input
          type="text"
          className="chat-area-input"
          placeholder="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="chat-area-send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatArea;


