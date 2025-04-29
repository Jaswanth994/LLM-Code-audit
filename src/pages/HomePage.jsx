// HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/HomePage.css';
import chatgptIcon from '../assets/chatgpt.png';
import deepseekIcon from '../assets/deepseek.png';
import geminiIcon from '../assets/gemini.png';
import llamaIcon from '../assets/llama.png';
import mistralIcon from '../assets/mistral.png';
import uploadIcon from '../assets/upload.png';

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
  const [customCode, setCustomCode] = useState('');
  const [selectedModels, setSelectedModels] = useState({
    chatgpt: false,
    deepseek: false,
    gemini: false,
    llama: false,
    mistral: false,
  });
  const [userCode, setUserCode] = useState('');
  const [showUserCodeInput, setShowUserCodeInput] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const modelSelectionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const promptParam = params.get('prompt');
    const modelsParam = params.get('models');
    const userCodeParam = params.get('userCode');

    if (promptParam) setPrompt(promptParam);
    if (modelsParam) {
      const modelsArray = modelsParam.split(',');
      const newModels = {};
      Object.keys(selectedModels).forEach((model) => {
        newModels[model] = modelsArray.includes(model);
      });
      setSelectedModels(newModels);
      setShowModels(true);

      setTimeout(() => {
        modelSelectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
    if (userCodeParam) {
      setUserCode(decodeURIComponent(userCodeParam));
      setShowUserCodeInput(true);
    }
  }, [location.search]);

  const handleFirstSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setShowModels(true);

    setTimeout(() => {
      modelSelectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };

  const handleNavigate = () => {
    navigate('/dashboard', { state: { customCode } });
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const enabledModels = Object.entries(selectedModels)
      .filter(([_, isSelected]) => isSelected)
      .map(([model]) => model)
      .join(',');
  
    if (!enabledModels && !userCode)
      return alert('Please select at least one LLM or provide your own code.');
  
    const searchParams = new URLSearchParams();
    searchParams.set('prompt', prompt);
    searchParams.set('models', enabledModels);
  
    if (!user) {
      navigate('/auth', {
        state: {
          from: {
            pathname: '/dashboard',
            search: `?${searchParams.toString()}`,
          },
        },
      });
    } else {
      navigate(`/dashboard?${searchParams.toString()}`, {
        state: { customCode: userCode },
      });
      
    }
  };
  

  const toggleModel = (model) => {
    setSelectedModels((prev) => ({
      ...prev,
      [model]: !prev[model],
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserCode(event.target.result);
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="home-container">
      <Header user={user} />

      <main className="home-content">
        <div className="prompt-container">
          <h2>Compare LLM Code Generations</h2>
          <form
            className="prompt-form"
            onSubmit={showModels ? handleFinalSubmit : handleFirstSubmit}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your code prompt here (e.g., generate palindrome code in C++)..."
              className="prompt-input"
              rows={6}
            />

            {!showModels ? (
              <button type="submit" className="submit-btn">
                Generate Code
              </button>
            ) : (
              <>
                <div className="model-selection-container" ref={modelSelectionRef}>
                  <h3>Select LLMs to Compare</h3>
                  <div className="model-grid">
                    {Object.entries(modelIcons).map(([model, icon]) => (
                      <div
                        key={model}
                        className={`model-box ${selectedModels[model] ? 'selected' : ''}`}
                        onClick={() => toggleModel(model)}
                      >
                        <img src={icon} alt={model} className="model-icon" />
                        <span className="model-name">{model.toUpperCase()}</span>
                        {selectedModels[model] && (
                          <div className="model-checkmark">✓</div>
                        )}
                      </div>
                    ))}
                    <div
                      className={`model-box ${showUserCodeInput ? 'selected' : ''}`}
                      onClick={() => setShowUserCodeInput(!showUserCodeInput)}
                    >
                      <img src={uploadIcon} alt="user-code" className="model-icon" />
                      <span className="model-name">MY CODE</span>
                      {showUserCodeInput && <div className="model-checkmark">✓</div>}
                    </div>
                  </div>
                </div>

                {showUserCodeInput && (
                  <div className="user-code-container">
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder="Paste your custom code here..."
                      className="user-code-input"
                      rows={6}
                    />
                    <input
                      type="file"
                      accept=".txt,.js,.py,.cpp,.c,.java"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button type="button" onClick={triggerFileInput}>
                      Upload Code File
                    </button>
                  </div>
                )}

                <button type="submit" className="submit-btn">
                  Compare Code
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
