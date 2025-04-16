import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import '../styles/AuthModal.css';

const AuthModal = ({ type, onClose, switchAuthType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // You can add name to user profile here if needed
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{type === 'login' ? 'Login' : 'Sign Up'}</h2>
        
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {type === 'signup' && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="thick-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="thick-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="thick-input"
              />
              <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁' : '👁'}
              </span>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {type === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-switch">
          {type === 'login' ? (
            <p>Don't have an account? <button type="button" onClick={() => switchAuthType('signup')}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button type="button" onClick={() => switchAuthType('login')}>Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;