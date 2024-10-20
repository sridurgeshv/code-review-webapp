import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TeamsPage.css';

const TeamsPage = () => {
  const [teamsData, setTeamsData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/record-collaboration');
        setTeamsData(response.data);
      } catch (error) {
        console.error("Error fetching teams data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="teams-page">
      <div className="teams-container">
        <div className="teams-header">
          <ArrowLeft 
            className="back-arrow" 
            size={24} 
            onClick={() => navigate('/dashboard')}
          />
          <h1 className="teams-title">Teams</h1>
        </div>
        <div className="teams-table-container">
          <table className="teams-table">
            <thead>
              <tr>
                <th>Users</th>
                <th>Project Title</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {teamsData.map((team, index) => (
                <tr key={index}>
                  <td>{team.users.join(', ')}</td>
                  <td>{team.project}</td>
                  <td>{new Date(team.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;