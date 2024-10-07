import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import './CreateProjectModal.css';

export default function CreateProjectModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [searchTemplate, setSearchTemplate] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const templates = [
    { name: 'Python', id: 'python' },
    { name: 'Node.js', id: 'nodejs' },
    { name: 'C', id: 'c' },
    { name: 'Java', id: 'java' },
    { name: 'C++', id: 'cpp' },
    { name: 'HTML', id: 'html' },
    { name: 'CSS', id: 'css' },
    { name: 'JavaScript', id: 'javascript' },
    { name: 'React', id: 'react' }
  ];

  if (!isOpen) return null;

  const handleCreateProject = () => {
    const projectId = Date.now();
    onClose();
    navigate(`/project/${projectId}`, { state: { projectTitle: title } });
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTemplate.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Choose Template | Import GitHub</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
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
        </div>
      </div>
    </div>
  );
}