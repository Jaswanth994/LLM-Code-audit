// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [authType, setAuthType] = useState(
    new URLSearchParams(location.search).get('type') || 'login'
  );

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  const switchAuthType = (type) => {
    setAuthType(type);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-content">
        <h1>Welcome to LLM Code Audit</h1>
        <p>Please login or sign up to continue</p>
        <AuthModal 
          type={authType}
          onClose={handleSuccess}
          switchAuthType={switchAuthType}
          showClose={false}
        />
      </div>
    </div>
  );
};

export default AuthPage;