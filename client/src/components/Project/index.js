import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Pencil, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Terminal from '../Terminal';
import Editor from '../Editor';
import { io } from 'socket.io-client';
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
  const [title, setTitle] = useState(() => {
    return location.state?.projectTitle || 'New Project';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [output, setOutput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(location.state?.selectedTemplate);
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchProject = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/get-project/${id}`);
        const project = response.data;
        setTitle(project.title || location.state?.projectTitle || 'New Project');
        setSelectedTemplate(project.template || location.state?.selectedTemplate);
        if (editorRef.current && project.code) {
          editorRef.current.setValue(project.code);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
    setSocket(newSocket);

    const projectData = {
      roomId: id,
      user,
      template: selectedTemplate,
      projectTitle: title
    };

    newSocket.emit('join-room', projectData);

    newSocket.on('init-room', ({ users, template, code, title: roomTitle }) => {
      setConnectedUsers(users.filter((u, index, self) =>
        index === self.findIndex((t) => t.uid === u.uid)
      ));
      if (template) setSelectedTemplate(template);
      if (code && editorRef.current) editorRef.current.setValue(code);
      if (roomTitle) setTitle(roomTitle);
    });

    newSocket.on('room-users', ({ users }) => {
      setConnectedUsers(users.filter((u, index, self) =>
        index === self.findIndex((t) => t.uid === u.uid)
      ));
    });

    newSocket.on('title-update', ({ title: newTitle }) => {
      setTitle(newTitle);
    });
  
    return () => {
      newSocket.disconnect();
    };
  }, [id, user, selectedTemplate, location.state, title]);

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
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditing(false);
      if (socket) {
        socket.emit('update-title', { roomId: id, title });
      }
    }
  };

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(id);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleEditorChange = (code) => {
    if (socket) {
      socket.emit('code-change', { roomId: id, code });
    }
  };

  const handleSave = async (code) => {
    try {
      const projectDetails = {
        id,
        title,
        language: selectedTemplate,
        code,
        lastEdited: new Date().toISOString()
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/save-project`, projectDetails);
      
      if (socket) {
        socket.emit('code-save', {
          roomId: id,
          code,
          version: Date.now(),
          userId: socket.id,
          projectDetails
        });
      }

      setOutput('Code saved and synced with collaborators');
      setTimeout(() => setOutput(''), 2000);
    } catch (error) {
      console.error('Error saving project:', error);
      setOutput('Error saving project');
    }
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
              onBlur={handleTitleSubmit}
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
            <div className="connected-users">
            {connectedUsers
              .filter(user => user.displayName && user.photoURL)
              .map(user => (
              <img
                key={user.uid}
                src={user.photoURL}
                alt={user.displayName}
                className="user-connected-avatar"
                title={user.displayName}
              />
            ))}
        </div>
      </div>

        <div className="Action-buttons">
          <button className="action-button" onClick={copyRoomId}>Copy ROOM ID</button>
          <button className="action-button2" onClick={() => navigate('/dashboard')}>Leave</button>
        </div>
       </div>
       <div className="editor-container">
       <Editor
          user={user}
          ref={editorRef}
          selectedTemplate={selectedTemplate}
          onCodeChange={handleEditorChange}
          onSave={handleSave}
        />
        </div>
        <Terminal output={output} />
      </div>
    </div>
  );
}

export default Project;