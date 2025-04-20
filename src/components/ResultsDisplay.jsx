import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/ResultsDisplay.css';

const ResultsDisplay = ({ responses, selectedModels }) => {
  const navigate = useNavigate();
  const [sonarMetrics, setSonarMetrics] = useState({});
  const [loading, setLoading] = useState(false);

  // SonarQube API integration
  const analyzeWithSonarQube = async (code, modelName) => {
    setLoading(true);
    try {
      // In a real implementation, you would:
      // 1. Send code to your backend
      // 2. Backend creates temporary SonarQube project
      // 3. Backend returns analysis results
      // This is a mock implementation
      
      const response = await axios.post('/api/sonarqube/analyze', {
        code,
        language: 'javascript', // or detect language
        projectKey: `temp-${modelName}-${Date.now()}`
      });
      
      return response.data;
    } catch (error) {
      console.error('SonarQube analysis failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // More accurate technical debt calculation
  const calculateTechnicalDebt = (metrics) => {
    if (!metrics) return 0;
    
    // Core factors (weights can be adjusted)
    const debtScore = 
      (metrics.code_smells * 0.4) +          // Code smells (40%)
      (metrics.complexity * 0.3) +           // Cyclomatic complexity (30%)
      (metrics.duplicated_lines * 0.15) +    // Duplication (15%)
      ((100 - metrics.coverage) * 0.1) +     // Lack of coverage (10%)
      (metrics.violations * 0.05);           // Rule violations (5%)
      
    return Math.min(100, Math.round(debtScore));
  };

  const analyzeCode = async (code, modelName) => {
    if (!code || typeof code !== 'string') return null;

    // Basic static analysis
    const lines = code.split('\n').length;
    const characters = code.length;
    const commentLines = (code.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;
    const commentDensity = lines > 0 ? (commentLines / lines) * 100 : 0;
    const functions = (code.match(/\bfunction\b|\bdef\b|\bfunc\b/g) || []).length;
    const conditionals = (code.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b/g) || []).length;
    const loops = (code.match(/\bfor\b|\bwhile\b|\bdo\b|\bforeach\b/g) || []).length;
    const operators = (code.match(/[+\-*/%=<>!&|^~?:]/g) || []).length;
    const complexityPoints = conditionals + loops + functions * 2;

    // Get SonarQube metrics if available
    const sonarData = await analyzeWithSonarQube(code, modelName);
    const sonarMetrics = sonarData?.metrics || {};

    // Calculate metrics
    const readability = Math.min(100, Math.max(0,
      70 - (lines / 30) + (commentDensity * 0.5) - (complexityPoints / 10) - (operators / lines * 5)
    ));
    
    const complexity = sonarMetrics.complexity || Math.min(100, Math.max(10,
      (complexityPoints * 2) + (operators / lines * 10) + (functions * 3)
    ));
    
    const technicalDebt = sonarMetrics.sqale_index ? 
      Math.min(100, (sonarMetrics.sqale_index / 1000)) : // Convert SonarQube debt to 0-100 scale
      calculateTechnicalDebt({
        code_smells: sonarMetrics.code_smells || functions * 2,
        complexity,
        duplicated_lines: sonarMetrics.duplicated_lines || 0,
        coverage: sonarMetrics.coverage || 0,
        violations: sonarMetrics.violations || 0
      });
    
    const maintainability = sonarMetrics.maintainability_rating ? 
      (6 - sonarMetrics.maintainability_rating) * 20 : // Convert 1-5 rating to 0-100
      Math.min(100, Math.max(0,
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
      amr: ((lines + complexity) / 3).toFixed(2),
      ...sonarMetrics // Include all SonarQube metrics
    };
  };

  const getOverallAnalysis = async () => {
    const models = ['chatgpt', 'deepseek', 'gemini'];
    const analysis = {};
    let bestScore = -Infinity;
    let bestModel = null;

    for (const model of models) {
      if (selectedModels[model] && responses[model]) {
        const metrics = await analyzeCode(responses[model], model);
        if (metrics) {
          const score = metrics.readability + metrics.maintainability - metrics.complexity - metrics.technicalDebt;
          analysis[model] = metrics;
          if (score > bestScore) {
            bestScore = score;
            bestModel = model;
          }
        }
      }
    }

    if (bestModel) {
      analysis.bestModel = bestModel;
    }

    return analysis;
  };

  const [analysis, setAnalysis] = useState({});

  useEffect(() => {
    const fetchAnalysis = async () => {
      const result = await getOverallAnalysis();
      setAnalysis(result);
    };
    fetchAnalysis();
  }, [responses, selectedModels]);

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
    const metrics = analysis[label.toLowerCase()];

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

  return (
    <div className="results">
      {loading && <div className="loading-overlay">Analyzing code quality...</div>}

      {selectedModels.chatgpt && responses.chatgpt && renderCodeBlock("ChatGPT", responses.chatgpt)}
      {selectedModels.deepseek && responses.deepseek && renderCodeBlock("DeepSeek", responses.deepseek)}
      {selectedModels.gemini && responses.gemini && renderCodeBlock("Gemini", responses.gemini)}

      <button onClick={handleAnalyze} className="analyze-btn">Analyze All</button>

      <div className="analysis-results">
        <h2>Code Quality Analysis</h2>
        <div className="metrics-grid">
          {Object.entries(analysis).map(([model, data]) => {
            if (model === 'bestModel') return null;

            return (
              <div key={model} className={`metric-card ${analysis.bestModel === model ? 'best-model-card' : ''}`}>
                <h3>{model.charAt(0).toUpperCase() + model.slice(1)}</h3>

                <div className="metric">
                  <label>Readability:</label>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill readability" 
                        style={{ width: `${data.readability}%` }}
                        data-value={data.readability}
                      ></div>
                    </div>
                    <span className="progress-value">{data.readability}/100</span>
                  </div>
                </div>

                <div className="metric">
                  <label>Complexity:</label>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill complexity" 
                        style={{ width: `${data.complexity}%` }}
                        data-value={data.complexity}
                      ></div>
                    </div>
                    <span className="progress-value">{data.complexity}/100</span>
                  </div>
                </div>

                <div className="metric">
                  <label>Technical Debt:</label>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill debt" 
                        style={{ width: `${data.technicalDebt}%` }}
                        data-value={data.technicalDebt}
                      ></div>
                    </div>
                    <span className="progress-value">{data.technicalDebt}/100</span>
                  </div>
                  {data.sqale_index && (
                    <div className="metric-detail">
                      <small>Debt Ratio: {(data.sqale_index / data.lines).toFixed(2)} min/LOC</small>
                    </div>
                  )}
                </div>

                <div className="metric">
                  <label>Maintainability:</label>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill maintainability" 
                        style={{ width: `${data.maintainability}%` }}
                        data-value={data.maintainability}
                      ></div>
                    </div>
                    <span className="progress-value">{data.maintainability}/100</span>
                  </div>
                </div>

                {data.bugs && (
                  <div className="metric">
                    <label>Bugs:</label>
                    <span className="badge critical">{data.bugs}</span>
                  </div>
                )}

                {data.vulnerabilities && (
                  <div className="metric">
                    <label>Vulnerabilities:</label>
                    <span className="badge high">{data.vulnerabilities}</span>
                  </div>
                )}

                {data.code_smells && (
                  <div className="metric">
                    <label>Code Smells:</label>
                    <span className="badge medium">{data.code_smells}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {analysis.bestModel && (
          <div className="best-model-summary">
            <h3>🏆 Best Model: {analysis.bestModel.charAt(0).toUpperCase() + analysis.bestModel.slice(1)}</h3>
            <p>This model had the best balance across all quality metrics with:</p>
            <ul>
              <li>Readability: {analysis[analysis.bestModel].readability}/100</li>
              <li>Technical Debt: {analysis[analysis.bestModel].technicalDebt}/100</li>
              <li>Maintainability: {analysis[analysis.bestModel].maintainability}/100</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;