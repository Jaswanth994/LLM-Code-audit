import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/HomePage.css';
import chatgptIcon from '../assets/chatgpt.png';
import deepseekIcon from '../assets/deepseek.png';
import geminiIcon from '../assets/gemini.png';
import llamaIcon from '../assets/llama.png';
import mistralIcon from '../assets/mistral.png';

const modelIcons = {
  chatgpt: chatgptIcon,
  deepseek: deepseekIcon,
  gemini: geminiIcon,
  llama: llamaIcon,
  mistral: mistralIcon,
};

const HomePage = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [showModels, setShowModels] = useState(false);
  const [selectedModels, setSelectedModels] = useState({
    chatgpt: false,
    deepseek: false,
    gemini: false,
    llama: false,
    mistral: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // If redirected with prompt (Edit Prompt use case)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const promptParam = params.get('prompt');
    const modelsParam = params.get('models');

    if (promptParam) setPrompt(promptParam);
    if (modelsParam) {
      const modelsArray = modelsParam.split(',');
      const newModels = {};
      Object.keys(selectedModels).forEach((model) => {
        newModels[model] = modelsArray.includes(model);
      });
      setSelectedModels(newModels);
      setShowModels(true); // Show model section if editing
    }
  }, [location.search]);

  const handleFirstSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setShowModels(true);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const enabledModels = Object.entries(selectedModels)
      .filter(([_, isSelected]) => isSelected)
      .map(([model]) => model)
      .join(',');

    if (!enabledModels) return alert('Please select at least one LLM.');

    if (!user) {
      navigate('/auth', {
        state: {
          from: {
            pathname: '/dashboard',
            search: `?prompt=${encodeURIComponent(prompt)}&models=${enabledModels}`,
          },
        },
      });
    } else {
      navigate(`/dashboard?prompt=${encodeURIComponent(prompt)}&models=${enabledModels}`);
    }
  };

  const toggleModel = (model) => {
    setSelectedModels((prev) => ({
      ...prev,
      [model]: !prev[model],
    }));
  };

  return (
    <div className="home-container">
      <Header user={user} />

      <main className="home-content">
        <div className="prompt-container">
          <h2>Compare LLM Code Generations</h2>
          <form className="prompt-form" onSubmit={showModels ? handleFinalSubmit : handleFirstSubmit}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your code prompt here (e.g., generate palindrome code in C++)..."
              className="prompt-input"
              rows={6}
            />

            {!showModels && (
              <button type="submit" className="submit-btn">
                Generate Code
              </button>
            )}

            {showModels && (
              <>
                <div className="model-selection-container">
                  <h3>Select LLMs:</h3>
                  <div className="model-grid">
                    {Object.entries(modelIcons).map(([model, icon]) => (
                      <div
                        key={model}
                        className={`model-box ${selectedModels[model] ? 'selected' : ''}`}
                        onClick={() => toggleModel(model)}
                      >
                        <img src={icon} alt={model} className="model-icon" />
                        <span className="model-name">{model.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="submit-btn">
                  Generate with Selected Models
                </button>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
