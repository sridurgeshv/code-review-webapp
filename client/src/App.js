import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Welcome from './components/Welcome';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import Project from './components/Project';
import Settings from './pages/Settings';
import { useAuth } from './contexts/AuthContext';
import ProjectList from './pages/ProjectPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route
            path="/dashboard"
            element={             
                <Dashboard />
            }
          />
          <Route
            path="/project/:id"
            element={
              <PrivateRoute>
                <Project />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;