import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './index.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const createNewProject = () => {
    const newProject = {
      id: Date.now(),
      name: `Project ${projects.length + 1}`,
      created: new Date()
    };
    setProjects([...projects, newProject]);
    navigate(`/project/${newProject.id}`);
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-greeting">
          <img
            src={user?.photoURL}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <span>{`Hello, ${user?.displayName}`}</span>
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
          <button className="add-button">+</button>
        </div>
        
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
          <h2>Teams</h2>
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
