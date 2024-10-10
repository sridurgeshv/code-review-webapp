import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { io } from 'socket.io-client';
import './CreateProjectModal.css';

export default function CreateProjectModal({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('template');
  const [title, setTitle] = useState('');
  const [searchTemplate, setSearchTemplate] = useState('');
  const [roomId, setRoomId] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const templates = [
    { name: 'Python', id: 'python' },
    { name: 'Node.js', id: 'nodejs' },
    { name: 'C', id: 'c' },
    { name: 'Java', id: 'java' },
    { name: 'C++', id: 'cpp' },
    { name: 'HTML, CSS, JS', id: 'frontend'},
    { name: 'React', id: 'react' }
  ];

  if (!isOpen) return null;

  const handleCreateProject = () => {
    const projectId = Date.now().toString();
    const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    
    // Updated to ensure project title is properly passed
    const projectData = {
      roomId: projectId,
      user,
      template: searchTemplate,
      projectTitle: title.trim() // Ensure we trim any whitespace
    };

    socket.emit('join-room', projectData);
    socket.disconnect();
    onClose();

    // Pass the project title in navigation state
    navigate(`/project/${projectId}`, {
      state: {
        projectTitle: title.trim(),
        selectedTemplate: searchTemplate
      }
    });
  };

  const handleJoinTeam = () => {
    if (roomId) {
      onClose();
      navigate(`/project/${roomId}`);
    }
  };


  const handleGithubImport = () => {
    if (githubUrl) {
      onClose();
      // Handle GitHub import logic
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTemplate.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'template':
        return (
          <>
            <div className="input-group">
              <label>Template</label>
              <div className="template-select" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTemplate}
                  onChange={(e) => setSearchTemplate(e.target.value)}
                />
                <div className="template-select-icons">
                  <Search size={18} />
                  <ChevronDown size={18} />
                </div>
                {isDropdownOpen && (
                  <div className="template-dropdown">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className="template-option"
                        onClick={() => {
                          setSearchTemplate(template.name);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {template.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Enter project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="button-container">
              <button 
                className="create-button" 
                onClick={handleCreateProject}
                disabled={!title.trim()}
              >
                Create Project
              </button>
            </div>
          </>
        );
      case 'team':
        return (
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-input"
            />
            <div className="button-container">
              <button 
                className="create-button" 
                onClick={handleJoinTeam}
                disabled={!roomId.trim()}
              >
                Join Team
              </button>
            </div>
          </div>
        );
      case 'github':
        return (
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter your GitHub URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="github-input"
            />
            <div className="button-container">
              <button 
                className="create-button" 
                onClick={handleGithubImport}
                disabled={!githubUrl.trim()}
              >
                Import Project
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-tabs">
          <button 
            className={`tab-button ${activeTab === 'template' ? 'active' : ''}`}
            onClick={() => setActiveTab('template')}
          >
            Choose Template
          </button>
          <button 
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Join Team
          </button>
          <button 
            className={`tab-button ${activeTab === 'github' ? 'active' : ''}`}
            onClick={() => setActiveTab('github')}
          >
            Import GitHub
          </button>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}