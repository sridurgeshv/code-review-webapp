import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './TeamsPage.css';

const TeamsPage = () => {
  const [teamsData, setTeamsData] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.uid) {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/get-collaborations/${user.uid}`);
          setTeamsData(response.data);
        }
      } catch (error) {
        console.error("Error fetching teams data", error);
      }
    };
    fetchData();
  }, [user]);

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
                  <td>{team.collaborator.displayName}</td>
                  <td>{team.projectTitle}</td>
                  <td>{new Date(team.createdAt).toLocaleString()}</td>
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