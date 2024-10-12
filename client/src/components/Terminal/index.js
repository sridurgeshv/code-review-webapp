import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import axios from 'axios';
import Prism from 'prismjs';
import './index.css';

const Terminal = ({ output }) => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: message
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.response) {
        const aiMessage = { role: 'assistant', content: response.data.response };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Failed to get response. Please try again.';
      
      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data?.details || error.response.data?.error || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }

      setMessages(prev => [...prev, { 
        role: 'error', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const renderMessage = (msg) => {
    if (msg.role === 'user') {
      return <div className="message user">{msg.content}</div>;
    } else if (msg.role === 'assistant') {
      if (Array.isArray(msg.content)) {
        return (
          <div className="message assistant">
            {msg.content.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <div 
                    key={`text-${index}`} 
                    className="assistant-text"
                    dangerouslySetInnerHTML={{ __html: part.content }}
                  />
                );
              } else if (part.type === 'code') {
                return (
                  <pre key={`code-${index}`} className={`language-${part.language}`}>
                    <code dangerouslySetInnerHTML={{
                      __html: Prism.highlight(
                        part.content,
                        Prism.languages[part.language] || Prism.languages.javascript,
                        part.language
                      )
                    }} />
                  </pre>
                );
              }
              return null;
            })}
          </div>
        );
      } else {
        return <div className="message assistant">{msg.content}</div>;
      }
    } else {
      return <div className={`message ${msg.role}`}>{msg.content}</div>;
    }
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
              {messages.length === 0 && (
                <div className="welcome-message">
                  Ask me anything about your code or programming questions!
                </div>
              )}
              {messages.map((msg, index) => (
                <React.Fragment key={index}>
                  {renderMessage(msg)}
                </React.Fragment>
              ))}
              {isLoading && <div className="message loading">AI is thinking...</div>}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
                disabled={isLoading}
              />
              <button type="submit" className="send-button" disabled={isLoading}>
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