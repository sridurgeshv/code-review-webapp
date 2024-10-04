import React from 'react';
import './index.css';

function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Hello Username</h1>
      <div className="mt-4">
        {/* Project list */}
        <p>No projects yet</p>
      </div>
    </div>
  );
}

export default Dashboard;