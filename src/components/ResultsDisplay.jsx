import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/ResultsDisplay.css';

const ResultsDisplay = ({ responses, selectedModels }) => {
  const navigate = useNavigate();

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
      maintainability: Math.round(maintainability),
      operators,
      aci: ((complexity * 2 + conditionals + lines * 0.1) / 3).toFixed(2),
      amr: ((lines + complexity) / 3).toFixed(2)
    };
  };

  const getOverallAnalysis = () => {
    const models = ['chatgpt', 'deepseek', 'gemini' , 'llama' , 'mistral' ];
    const analysis = {};
    let bestScore = -Infinity;
    let bestModel = null;

    models.forEach(model => {
      if (selectedModels[model] && responses[model]) {
        const metrics = analyzeCode(responses[model]);
        if (metrics) {
          const score = metrics.readability + metrics.maintainability - metrics.complexity - metrics.technicalDebt;
          analysis[model] = metrics;
          if (score > bestScore) {
            bestScore = score;
            bestModel = model;
          }
        }
      }
    });

    if (bestModel) {
      analysis.bestModel = bestModel;
    }

    return analysis;
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
            <div className="metric"><span>Lines:</span><span>{metrics.lines}</span></div>
            <div className="metric"><span>Functions:</span><span>{metrics.functions}</span></div>
            <div className="metric"><span>Readability:</span><span>{metrics.readability}/100</span></div>
            <div className="metric"><span>Complexity:</span><span>{metrics.complexity}/100</span></div>
            <div className="metric"><span>Tech Debt:</span><span>{metrics.technicalDebt}/100</span></div>
            <div className="metric"><span>Maintainability:</span><span>{metrics.maintainability}/100</span></div>
            <div className="metric"><span>ACI:</span><span>{metrics.aci}</span></div>
            <div className="metric"><span>AMR:</span><span>{metrics.amr}</span></div>

          </div>
        )}

        <pre><code>{code}</code></pre>
      </div>
    );
  };

  const analysis = getOverallAnalysis();

  return (
    <div className="results">
      {selectedModels.chatgpt && responses.chatgpt && renderCodeBlock("ChatGPT Response", responses.chatgpt)}
      {selectedModels.deepseek && responses.deepseek && renderCodeBlock("DeepSeek Response", responses.deepseek)}
      {selectedModels.gemini && responses.gemini && renderCodeBlock("Gemini Response", responses.gemini)}
      {selectedModels.llama && responses.llama && renderCodeBlock("LLaMA Response", responses.llama)}
      {selectedModels.mistral && responses.mistral && renderCodeBlock("Mistral Response", responses.mistral)}

      <button onClick={handleAnalyze} className="analyze-btn">Analyze All</button>

      <div className="analysis-results">
        <h2>Code Quality Analysis</h2>
        <div className="metrics-grid">
          {Object.entries(analysis).map(([model, data]) => {
            if (model === 'bestModel') return null;

            return (
              <div key={model} className="metric-card">
                <h3>{model.charAt(0).toUpperCase() + model.slice(1)}</h3>

                <div className="metric">
                  <label>Readability:</label>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${data.readability}%` }}></div>
                    <span>{data.readability}/100</span>
                  </div>
                </div>

                <div className="metric">
                  <label>Complexity:</label>
                  <div className="progress-bar">
                    <div className="progress-fill complexity" style={{ width: `${data.complexity}%` }}></div>
                    <span>{data.complexity}/100</span>
                  </div>
                </div>

                <div className="metric">
                  <label>Technical Debt:</label>
                  <div className="progress-bar">
                    <div className="progress-fill debt" style={{ width: `${data.technicalDebt}%` }}></div>
                    <span>{data.technicalDebt}/100</span>
                  </div>
                </div>

                <div className="metric">
                  <label>Maintainability:</label>
                  <div className="progress-bar">
                    <div className="progress-fill maintainability" style={{ width: `${data.maintainability}%` }}></div>
                    <span>{data.maintainability}/100</span>
                  </div>
                </div>

                <div className="metric">
                  <label>ACI:</label>
                  <div className="progress-bar">
                    <div className="progress-fill aci" style={{ width: `${data.aci}%` }}></div>
                    <span>{data.aci}</span>
                  </div>
                </div>

                <div className="metric">
                  <label>AMR:</label>
                  <div className="progress-bar">
                    <div className="progress-fill amr" style={{ width: `${data.amr}%` }}></div>
                    <span>{data.amr}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {analysis.bestModel && (
          <div className="best-model">
            <h3>🏆 Best Model: {analysis.bestModel.charAt(0).toUpperCase() + analysis.bestModel.slice(1)}</h3>
            <p>This model had the best balance across readability, complexity, technical debt, and maintainability.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
