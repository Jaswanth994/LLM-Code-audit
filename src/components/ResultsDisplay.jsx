// src/components/ResultsDisplay.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ResultsDisplay = ({ responses, selectedModels }) => {
  const navigate = useNavigate();

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Code copied to clipboard!");
    } catch (err) {
      alert("Failed to copy code.");
      console.error(err);
    }
  };

  const handleAnalyze = () => {
    // Prepare the models query parameter
    const models = Object.entries(selectedModels)
      .filter(([_, selected]) => selected)
      .map(([model]) => model)
      .join(',');
    
    // Navigate to dashboard with the responses as state
    navigate('/dashboard', {
      state: {
        responses,
        selectedModels
      }
    });
  };

  const renderCodeBlock = (label, code) => (
    <div className="code-block">
      <div className="code-header">
        <h3>{label}:</h3>
        <button onClick={() => handleCopy(code)}>Copy</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );

  return (
    <div className="results">
      {selectedModels.chatgpt && renderCodeBlock("ChatGPT Response", responses.chatgpt)}
      {selectedModels.deepseek && renderCodeBlock("DeepSeek Response", responses.deepseek)}
      {selectedModels.gemini && renderCodeBlock("Gemini Response", responses.gemini)}
      
      <button 
        onClick={handleAnalyze} 
        className="analyze-btn"
      >
        Analyze All
      </button>
    </div>
  );
};

export default ResultsDisplay;