import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import '../styles/Header.css';

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <h1 className="logo">LLM Code Audit</h1>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={handleLogout} className="auth-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="auth-button">Login</Link>
              <Link to="/auth?type=signup" className="auth-button">Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
