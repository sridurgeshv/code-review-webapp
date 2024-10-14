import React from 'react';
import './index.css';

const Card = ({ language, title, timeAgo }) => {
  return (
    <div className="card">
      <div className="card-header">{language}</div>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-footer">{timeAgo}</div>
    </div>
  );
};

export default Card;