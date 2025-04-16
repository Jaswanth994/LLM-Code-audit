// src/components/ResultsDisplay.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/ResultsDisplay.css';
const ResultsDisplay = ({ responses, selectedModels }) => {
  const navigate = useNavigate();

  // Code analysis function
  const analyzeCode = (code) => {
    if (!code || typeof code !== 'string') return null;

    const lines = code.split('\n').length;
    const characters = code.length;
    const commentCount = (code.match(/\/\/|\/\*|\*\//g) || []).length;
    const functions = (code.match(/\bfunction\b|\bdef\b|\bfunc\b/g) || []).length;
    const conditionals = (code.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b/g) || []).length;
    const loops = (code.match(/\bfor\b|\bwhile\b|\bdo\b|\bforeach\b/g) || []).length;

    // Calculate metrics with proper parentheses
    const readability = Math.min(100, Math.max(
      0,
      80 - (lines / 50) - (characters / lines / 100) + (commentCount * 2)
    ));
    
    const complexity = Math.min(100, Math.max(
      0,
      (lines / 20) + (conditionals * 5) + (loops * 3)
    ));
    
    const technicalDebt = Math.min(100, Math.max(
      0,
      complexity * 0.7 - readability * 0.3)
    );

    return {
      lines,
      readability: Math.round(readability),
      complexity: Math.round(complexity),
      technicalDebt: Math.round(technicalDebt),
      functions,
      conditionals,
      loops
    };
  };

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
    navigate('/dashboard', {
      state: {
        responses,
        selectedModels
      }
    });
  };

  const renderCodeBlock = (label, code) => {
    const metrics = analyzeCode(code);
    
    return (
      <div className="code-block">
        <div className="code-header">
          <h3>{label}:</h3>
          <button onClick={() => handleCopy(code)}>Copy</button>
        </div>
        
        {metrics && (
          <div className="metrics-summary">
            <div className="metric">
              <span>Lines:</span>
              <span>{metrics.lines}</span>
            </div>
            <div className="metric">
              <span>Readability:</span>
              <span>{metrics.readability}/100</span>
            </div>
            <div className="metric">
              <span>Complexity:</span>
              <span>{metrics.complexity}/100</span>
            </div>
            <div className="metric">
              <span>Tech Debt:</span>
              <span>{metrics.technicalDebt}/100</span>
            </div>
          </div>
        )}

        <pre><code>{code}</code></pre>
      </div>
    );
  };

  return (
    <div className="results">
      {selectedModels.chatgpt && responses && responses.chatgpt && 
        renderCodeBlock("ChatGPT Response", responses.chatgpt)}
      
      {selectedModels.deepseek && responses && responses.deepseek && 
        renderCodeBlock("DeepSeek Response", responses.deepseek)}
      
      {selectedModels.gemini && responses && responses.gemini && 
        renderCodeBlock("Gemini Response", responses.gemini)}
      
      <button onClick={handleAnalyze} className="analyze-btn">
        Analyze All
      </button>
    </div>
  );
};

export default ResultsDisplay;