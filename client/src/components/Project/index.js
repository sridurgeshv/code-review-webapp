import React from 'react';
import { useParams } from 'react-router-dom';
import Editor from '../Editor';

function Project() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex">
      <div className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-4">Project Name</h2>
        <div className="mb-4">
          <h3 className="font-medium mb-2">Files</h3>
          <ul className="space-y-1">
            <li className="text-sm hover:bg-gray-100 p-1 rounded">index.js</li>
            <li className="text-sm hover:bg-gray-100 p-1 rounded">style.css</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">Connected Users</h3>
          <div className="flex flex-wrap gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500"></div>
            <div className="w-8 h-8 rounded-full bg-green-500"></div>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <Editor />
      </div>
    </div>
  );
}

export default Project;