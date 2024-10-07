import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CreateProjectModal from '../CreateProjectModal';
import './index.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects] = useState([]);
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
            <img
              src={user?.photoURL}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <span>{`Hi, ${user?.displayName}`}</span>
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
              <div key={project.id} className="project-item" onClick={() => navigate(`/project/${project.id}`)}>
                <h3>{project.name}</h3>
                <p>{new Date(project.created).toLocaleDateString()}</p>
              </div>
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
