import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import './index.css';

const Terminal = ({ output }) => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Message handling logic will go here when API is integrated
    setMessage('');
  };

  return (
    <div className="output-container">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'terminal' ? 'active' : ''}`}
          onClick={() => setActiveTab('terminal')}
        >
          Terminal
        </button>
        <button 
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI
        </button>
      </div>

      <hr className="output-divider" />
      <div className="terminal-content">
        {activeTab === 'terminal' ? (
          <pre className="output-text">
            {output || 'No output to display. Click Run to execute the code.'}
          </pre>
        ) : (
          <div className="ai-content">
            <div className="ai-header">
              <MessageCircle size={24} />
              <h2>AI Assistant</h2>
            </div>
            <div className="ai-messages">
              <div className="welcome-message">
                Ask me anything about your code or programming questions!
              </div>
            </div>
            <form onSubmit={handleSendMessage} className="message-input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;