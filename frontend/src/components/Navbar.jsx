import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/tokenUtils';
import '../styles/Navbar.css';

export default function Navbar({ userName }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>🤖 AI Task Platform</h1>
        </div>
        <div className="navbar-menu">
          <span className="user-name">👤 {userName}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
