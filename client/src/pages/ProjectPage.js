import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Code, Folder, ArrowLeft } from 'lucide-react';
import './ProjectPage.css';

const ProjectCard = ({ project, onClick }) => {
  return (
    <div className="project-card" onClick={onClick}>
      <div className="card-header">
        <div className="icon-wrapper">
          <Code className="icon" />
        </div>
        <h2 className="card-title">
          {project.title || 'New Project'}
        </h2>
      </div>

      <div className="card-body">
        <div className="card-info">
          <Folder className="info-icon" />
          <span className="info-text">{project.template || 'Python'}</span>
        </div>

        <div className="card-info">
          <Clock className="info-icon" />
          <span className="info-text">
            {new Date(project.lastEdited).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-all-projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="back-icon" />
        </button>
        <h1 className="project-list-title">My Projects</h1>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigate(`/project/${project.id}`)}
          />
        ))}
      </div>
      {projects.length === 0 && (
        <div className="no-projects-message">
          <Folder className="no-project-icon" />
          <h3>No Projects Found</h3>
          <p>Start creating a new project to see it here.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;