import React from 'react';
import './index.css';

const Terminal = ({ output }) => {
  return (
    <div className="output-container">
      <h3 className="output-title">Terminal</h3>
      <hr className="output-divider" />
      <div className="terminal-content">
        <pre className="output-text">
          {output || 'No output to display. Click Run to execute the code.'}
        </pre>
      </div>
    </div>
  );
};

export default Terminal;