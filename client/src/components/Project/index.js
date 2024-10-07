import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Pencil, Play } from 'lucide-react';
import Editor from '../Editor';
import './index.css';

// Inline Alert Component
const Alert = ({ children }) => {
  return (
    <div style={{
      padding: '10px',
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
      borderRadius: '4px',
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {children}
    </div>
  );
};

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState(location.state?.projectTitle || 'New Project');
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleTitleSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(id);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="Projects-container">
      {showNotification && (
        <div className="fixed top-4 right-4">
          <Alert>Room ID copied successfully!</Alert>
        </div>
      )}
       <div className="top-nav">
        <div className="nav-title">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleSubmit}
              className="title-input"
              autoFocus
            />
          ) : (
            <div className="title-display">
              <h1>{title}</h1>
              <button onClick={() => setIsEditing(true)} className="edit-button">
                <Pencil size={15} />
              </button>
            </div>
          )}
        </div>
        <button className="run-button">
          <Play size={16} />
          Run
        </button>
      </div>

      <div className="main-content2">
        <div className="sidebar2">
          <div className="file-explorer">
            <ul className="file-list">
              <li className="file-item">
                <span className="file-icon">📄</span>
                main.py
              </li>
            </ul>
          </div>

        <div className="connected-section">
          <h3 className="connected-title">Connected</h3>
          <div className="user-avatar">M</div>
        </div>

        <div className="Action-buttons">
          <button className="action-button" onClick={copyRoomId}>Copy ROOM ID</button>
          <button className="action-button2" onClick={() => navigate('/dashboard')}>Leave</button>
        </div>
       </div>
       <div className="editor-container">
          <Editor />
        </div>
      </div>
  </div>
  );
}

export default Project;