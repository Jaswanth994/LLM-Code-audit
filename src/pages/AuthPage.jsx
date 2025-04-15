// src/pages/AuthPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page-container">
      <div className="auth-content">
        <h1>Welcome to LLM Code Audit</h1>
        <p>Please login or sign up to continue</p>
        <AuthModal 
          onClose={handleSuccess}
          onSuccess={handleSuccess}
          showClose={false}
        />
      </div>
    </div>
  );
};

export default AuthPage;