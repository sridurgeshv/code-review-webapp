import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import Editor from '../Editor';
import './index.css';

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('New Project');
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="Projects-container">
      <div className="sidebar2">
        <div className="project-Logo">
          <span>{`{ }`}</span>
          <span>CodeRev</span>
        </div>
        
        <div className="file-explorer">
          <ul className="file-list">
            <li className="file-item">
              <span className="file-icon">📄</span>
              index.html
            </li>
            <li className="file-item">
              <span className="file-icon">📄</span>
              script.js
            </li>
            <li className="file-item">
              <span className="file-icon">📄</span>
              style.css
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
      
      <div className="flex-1">
        <div className="project-title-container">
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
        <Editor />
      </div>
    </div>
  );
}

export default Project;