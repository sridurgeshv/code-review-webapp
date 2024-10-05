// Welcome/index.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <h1>Real-Time Code Review</h1>
      <p>Collaborate with your team in real-time, review code together, and get instant AI-powered suggestions.</p>
      
      <button className="start-button"
      onClick={() => navigate('/signin')}>Get Started</button>

      <div className="mock-browser">
        <div className="browser-header">
          <div className="browser-dots">
            <div className="dot"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
          </div>
        </div>
        <div className="mock-editor">
          <p>// Welcome to the Editor</p>
          <p>function helloWorld() {`{`}</p>
          <p>&nbsp;&nbsp;console.log("Hello, Coders!");</p>
          <p>{`}`}</p>
        </div>
      </div>
       {/* Footer */}
       <div className="footer">
          <p>&copy; 2024 CodeRev. All rights reserved.</p>
        </div>
    </div>
  );
}

export default Welcome;
