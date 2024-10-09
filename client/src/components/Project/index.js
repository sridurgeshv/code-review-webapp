import React, { useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Pencil, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Terminal from '../Terminal';
import Editor from '../Editor';
import axios from 'axios';
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
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef(null);
  const [title, setTitle] = useState(location.state?.projectTitle || 'New Project');
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [output, setOutput] = useState('');
  const selectedTemplate = location.state?.selectedTemplate;

  const getTemplateFiles = () => {
    switch (selectedTemplate) {
      case 'Python':
        return [{ name: 'main.py', icon: '📄' }];
      case 'Node.js':
        return [{ name: 'index.js', icon: '📄' }];
      case 'C':
        return [{ name: 'main.c', icon: '📄' }];
      case 'C++':
        return [{ name: 'main.cpp', icon: '📄' }];
      case 'Java':
        return [{ name: 'Main.java', icon: '📄' }];
      case 'HTML, CSS, JS':
        return [
          { name: 'index.html', icon: '📄' },
          { name: 'style.css', icon: '📄' },
          { name: 'script.js', icon: '📄' }
        ];
      case 'React':
        return [
          { name: 'src', icon: '📁', children: [
            { name: 'App.jsx', icon: '📄' },
            { name: 'index.js', icon: '📄' }
          ]},
          { name: 'index.html', icon: '📄' }
        ];
      default:
        return [{ name: 'main.txt', icon: '📄' }];
    }
  };

  const handleRun = async () => {
    try {
      const code = editorRef.current?.getValue();
      if (!code) return;

      setOutput('Running...');
      
      const response = await axios.post('http://localhost:5000/api/execute', {
        code,
        language: selectedTemplate
      });

      setOutput(response.data.output || 'No output');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

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
        <button className="run-button" onClick={handleRun}>
        <Play size={16} />
        Run
        </button>
      </div>

      <div className="main-content2">
        <div className="sidebar2">
          <div className="file-explorer">
            <h3 className="files-title">Files</h3>
            <ul className="file-list">
              {getTemplateFiles().map((file, index) => (
                <li key={index} className="file-item">
                  <span className="file-icon">{file.icon}</span>
                  {file.name}
                  {file.children && (
                    <ul className="nested-files">
                      {file.children.map((child, childIndex) => (
                        <li key={childIndex} className="file-item">
                          <span className="file-icon">{child.icon}</span>
                          {child.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="connected-section">
            <h3 className="connected-title">Connected</h3>
            <img
              src={user?.photoURL}
              alt="Profile"
              className="user-connected-avatar"
            />
          </div>

        <div className="Action-buttons">
          <button className="action-button" onClick={copyRoomId}>Copy ROOM ID</button>
          <button className="action-button2" onClick={() => navigate('/dashboard')}>Leave</button>
        </div>
       </div>
       <div className="editor-container">
          <Editor
            ref={editorRef}
            selectedTemplate={selectedTemplate}
          />
        </div>
        <Terminal output={output} />
      </div>
    </div>
  );
}

export default Project;