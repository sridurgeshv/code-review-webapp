import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CreateProjectModal from '../CreateProjectModal';
import Card from '../Card';
import './index.css';
import { io } from 'socket.io-client'; // Import socket.io-client
const socket = io('http://localhost:5000'); // Initialize the socket connection

function Dashboard() {
  const { user,setUser,logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    setProjects(savedProjects);
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user.uid });
    }

    socket.on('user-update', (updatedUser) => {
      if (updatedUser.uid === user.uid) {
        // Update the AuthContext
        setUser(prevUser => ({
          ...prevUser,
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL,
        }));
      }
    });

    return () => {
      socket.off('user-update');
    };
  }, [user, setUser]);

  const handleCardClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const handleDeleteProject = (projectId) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
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
                 id={project.id}
                 language={project.language}
                 title={project.title}
                 timeAgo={getTimeAgo(project.lastEdited)}
                 onClick={() => handleCardClick(project.id)}
                 onDelete={handleDeleteProject}
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
