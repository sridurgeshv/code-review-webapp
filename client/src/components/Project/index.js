import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Pencil, Play } from 'lucide-react';
import Editor from '../Editor';
import './index.css';

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState(location.state?.projectTitle || 'New Project');
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="Projects-container">
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
          <div className="user-avatar">S</div>
        </div>

        <div className="Action-buttons">
          <button className="action-button">Copy ROOM ID</button>
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