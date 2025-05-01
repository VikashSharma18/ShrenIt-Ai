// profile css
import React from 'react';
import { useAuth } from '../Login/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!student) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">Student Profile</h1>
          <div className="profile-gradient-bar"></div>
        </div>

        <div className="profile-content">
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{student.name}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{student.email}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Course</span>
              <span className="info-value">{student.course}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Semester</span>
              <span className="info-value">{student.sem}</span>
            </div>
          </div>

          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
            <div className="button-gradient-overlay"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;