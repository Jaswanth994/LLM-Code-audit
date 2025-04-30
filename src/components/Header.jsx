import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import '../styles/Header.css';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname.startsWith('/dashboard'));
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">LLM Code Audit</Link>
        <nav className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
          <Link to="/history" className={isActive('/history') ? 'active' : ''}>History</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
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