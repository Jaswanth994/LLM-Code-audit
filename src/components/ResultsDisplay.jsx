// src/components/ResultsDisplay.jsx
import React from "react";

const ResultsDisplay = ({ responses, selectedModels }) => {
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Code copied to clipboard!");
    } catch (err) {
      alert("Failed to copy code.");
      console.error(err);
    }
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
    </div>
  );
};

export default ResultsDisplay;