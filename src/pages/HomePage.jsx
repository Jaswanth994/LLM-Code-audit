// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/HomePage.css';

const HomePage = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    if (!user) {
      navigate('/auth', { state: { from: { pathname: '/dashboard', search: `?prompt=${encodeURIComponent(prompt)}` } } });
      return;
    }

    navigate(`/dashboard?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="home-container">
      <Header user={user} />
      
      <main className="home-content">
        <div className="prompt-container">
          <h2>Compare LLM Code Generations</h2>
          <form onSubmit={handleSubmit} className="prompt-form">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your code prompt here (e.g., generate palindrome code in C++)..."
              rows={6}
              className="prompt-input"
            />
            <button type="submit" className="submit-btn">
              Compare Models
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default HomePage;