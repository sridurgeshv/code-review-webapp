import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CreateProjectModal from '../CreateProjectModal';
import Card from '../Card';
import './index.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects] = useState([
    { id: 1, language: 'JavaScript', title: 'Testing', timeAgo: '2 days ago' },
    { id: 2, language: 'Python', title: 'Iron Man', timeAgo: '4 days ago' }
  ]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-top">
          <div className="user-greeting">
            <div className="greeting-top">
              <img
                src={user?.photoURL}
                alt="Profile"
              />
              <span className="hi-text">Hi,</span>
            </div>
              <span className="username">{user?.displayName?.split(' ').slice(0, 2).join(' ')}</span>
          </div>
          
          <nav className="menu">
            <ul>
              <li onClick={() => navigate('/dashboard')}>Dashboard</li>
              <li onClick={() => navigate('/projects')}>Projects</li>
              <li onClick={() => navigate('/teams')}>Teams</li>
              <li onClick={() => navigate('/settings')}>Settings</li>
            </ul>
          </nav>
        </div>
        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Title */}
        <div className="header">
          <h1>CodeRev</h1>
        </div>

        {/* Projects section */}
        <div className="projects-container">
          <div className="projects-header">
            <h2>Projects</h2>
            <button 
            className="add-button" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            +
          </button>
          </div>
          <CreateProjectModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />       
          <div className="divider"></div>        
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>Projects haven't been assigned</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  language={project.language}
                  title={project.title}
                  timeAgo={project.timeAgo}
                />
              ))}
            </div>
          )}
        </div>

        {/* Teams section */}
        <div className="teams-section">
        <div className="teams-header">
          <h2>Teams</h2>
        </div>
          <div className="divider"></div>
          <div className="team-list">
            <div className="team-item">
              <img src="https://via.placeholder.com/50" alt="User 1" />
              <span>User 1</span>
            </div>
            <div className="team-item">
              <img src="https://via.placeholder.com/50" alt="User 2" />
              <span>User 2</span>
            </div>
            <div className="team-item">
              <img src="https://via.placeholder.com/50" alt="User 3" />
              <span>User 3</span>
            </div>
            <div className="team-item">
              <img src="https://via.placeholder.com/50" alt="User 4" />
              <span>User 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
