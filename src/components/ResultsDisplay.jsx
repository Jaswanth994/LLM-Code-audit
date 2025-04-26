import React from "react";
import '../styles/ResultsDisplay.css';

const ResultsDisplay = ({ responses, selectedModels, analysis }) => {
  const analyzeCode = (code) => {
    if (!code || typeof code !== 'string') return null;

    const lines = code.split('\n').length;
    const characters = code.length;
    const commentLines = (code.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;
    const commentDensity = lines > 0 ? (commentLines / lines) * 100 : 0;
    const functions = (code.match(/\bfunction\b|\bdef\b|\bfunc\b/g) || []).length;
    const conditionals = (code.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b/g) || []).length;
    const loops = (code.match(/\bfor\b|\bwhile\b|\bdo\b|\bforeach\b/g) || []).length;
    const operators = (code.match(/[+\-*/%=<>!&|^~?:]/g) || []).length;
    const complexityPoints = conditionals + loops + functions * 2;

    const readability = Math.min(100, Math.max(0,
      70 - (lines / 30) + (commentDensity * 0.5) - (complexityPoints / 10) - (operators / lines * 5)
    ));
    const complexity = Math.min(100, Math.max(10,
      (complexityPoints * 2) + (operators / lines * 10) + (functions * 3)
    ));
    const technicalDebt = Math.min(100, Math.max(0,
      (complexity * 0.6) - (readability * 0.4) + (lines > 100 ? 10 : 0) + (commentDensity < 10 ? 15 : 0)
    ));
    const maintainability = Math.min(100, Math.max(0,
      100 - (complexity * 0.3) - (technicalDebt * 0.2) - (lines / 50)
    ));

    return {
      lines,
      characters,
      functions,
      conditionals,
      loops,
      commentDensity: Math.round(commentDensity),
      readability: Math.round(readability),
      complexity: Math.round(complexity),
      technicalDebt: Math.round(technicalDebt),
      maintainability: Math.round(maintainability)
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

  const renderCodeBlock = (label, code) => {
    const metrics = analyzeCode(code);

    return (
      <div className="model-result-card">
        <div className="model-header">
          <div className="model-name">{label}</div>
          {metrics && (
            <div className="model-meta">
              {metrics.lines} lines | {metrics.functions} functions
            </div>
          )}
        </div>
        
        <div className="code-block">
          <pre>
            <button onClick={() => handleCopy(code)} className="copy-btn">
              Copy
            </button>
            {code}
          </pre>
        </div>
      </div>
    );
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className="analysis-section">
        <h2>Code Quality Analysis</h2>
        
        <div className="metrics-grid">
          {Object.entries(analysis).map(([model, data]) => {
            if (model === 'bestModel' || !data) return null;

            return (
              <div key={model} className="metric-card">
                <h3>{model.charAt(0).toUpperCase() + model.slice(1)}</h3>
                
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Readability</span>
                    <span>{data.readability}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill readability" 
                      style={{ width: `${data.readability}%` }}
                    ></div>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label">
                    <span>Complexity</span>
                    <span>{data.complexity}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill complexity" 
                      style={{ width: `${data.complexity}%` }}
                    ></div>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label">
                    <span>Tech Debt</span>
                    <span>{data.technicalDebt}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill debt" 
                      style={{ width: `${data.technicalDebt}%` }}
                    ></div>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label">
                    <span>Maintainability</span>
                    <span>{data.maintainability}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill maintainability" 
                      style={{ width: `${data.maintainability}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {analysis.bestModel && (
          <div className="best-model-card">
            <h2>Best Performing Code</h2>
            <div className="best-model-name">
              {analysis.bestModel === 'user' ? 'YOUR CODE' : analysis.bestModel.toUpperCase()}
            </div>
            <p className="best-model-reason">
              This implementation scored highest in our analysis for having the best 
              balance of readability, complexity, and maintainability.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="results-container">
      <div className="results-content">
        <div className="results-header">
          <h1 className="results-title">Code Comparison Results</h1>
        </div>

        <div className="model-results-list">
          {selectedModels.chatgpt && responses.chatgpt && renderCodeBlock("ChatGPT", responses.chatgpt)}
          {selectedModels.deepseek && responses.deepseek && renderCodeBlock("DeepSeek", responses.deepseek)}
          {selectedModels.gemini && responses.gemini && renderCodeBlock("Gemini", responses.gemini)}
          {selectedModels.llama && responses.llama && renderCodeBlock("LLaMA", responses.llama)}
          {selectedModels.mistral && responses.mistral && renderCodeBlock("Mistral", responses.mistral)}
          {selectedModels.user && responses.user && renderCodeBlock("Your Code", responses.user)}
        </div>

        {renderAnalysis()}
      </div>
    </div>
  );
};

export default ResultsDisplay;