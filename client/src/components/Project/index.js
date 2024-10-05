import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '../Editor';
import './index.css';

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();

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
          <div className="user-avatar">N</div>
        </div>

        <div className="Action-buttons">
          <button className="action-button">Copy ROOM ID</button>
          <button className="action-button2" onClick={() => navigate('/dashboard')}>Leave</button>
        </div>
      </div>
      
      <div className="flex-1">
        <Editor />
      </div>
    </div>
  );
}

export default Project;