import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen p-4">
          <div className="flex items-center mb-8">
            <img
              src={user?.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="font-medium">{user?.displayName}</span>
          </div>
          <nav>
            <ul className="space-y-2">
              <li className="hover:bg-gray-100 p-2 rounded">Dashboard</li>
              <li className="hover:bg-gray-100 p-2 rounded">Projects</li>
              <li className="hover:bg-gray-100 p-2 rounded">Teams</li>
              <li className="hover:bg-gray-100 p-2 rounded">Settings</li>
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Projects</h1>
            <button
              onClick={createNewProject}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
            >
              +
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-white p-4 rounded-lg shadow cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(project.created).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;