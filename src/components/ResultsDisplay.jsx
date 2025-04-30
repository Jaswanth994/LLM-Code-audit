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
    const nestingLevel = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
    const complexityPoints = conditionals + loops + functions * 2;

    // Calculate ACI (AI Complexity Index)
    const cognitiveComplexity = conditionals + loops + nestingLevel;
    const methodLength = lines / Math.max(1, functions);
    const normalizedMethodLength = Math.min(10, methodLength) / 10 * 100; // Normalize to 0-100
    const normalizedNestingLevel = Math.min(5, nestingLevel) / 5 * 100; // Normalize to 0-100
    const aci = (0.5 * cognitiveComplexity) + (0.3 * normalizedMethodLength) + (0.2 * normalizedNestingLevel);
  

    // Calculate AMR (AI Maintainability Risk)
    const codeSmellsPer100LOC = (complexityPoints / lines) * 100;
    const duplicationDensity = (code.match(/duplicate|repeat|copy/g) || []).length / lines * 100;
    const methodsWithoutComments = functions > 0 ? ((functions - commentLines) / functions) * 100 : 0;
    const amr = (0.4 * codeSmellsPer100LOC) + (0.4 * duplicationDensity) + (0.2 * methodsWithoutComments);

    const readability = Math.min(100, Math.max(0,
      70 - (lines / 30) + (commentDensity * 0.5) - (complexityPoints / 10) - (operators / lines * 5)
    ));
    const complexity = Math.min(100, Math.max(10,
      (complexityPoints * 2) + (operators / lines * 10) + (functions * 3)
    ));
    
    // Updated Technical Debt calculation
    const normalizedReadability = 100 - readability;
    const normalizedLines = Math.min(500, lines) / 500 * 100;
    const normalizedComplexity = complexity;
    const normalizedFunctionsComplexity = functions * 10;
    
    const technicalDebt = Math.min(100, Math.max(0,
      (0.1 * normalizedReadability) + 
      (0.1 * normalizedLines) + 
      (0.1 * normalizedComplexity) + 
      (0.1 * normalizedFunctionsComplexity) + 
      (0.3 * aci) + 
      (0.3 * amr)
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
      nestingLevel,
      commentDensity: Math.round(commentDensity),
      readability: Math.round(readability),
      complexity: Math.round(complexity),
      technicalDebt: Math.round(technicalDebt),
      maintainability: Math.round(maintainability),
      aci: Math.round(aci),
      amr: Math.round(amr),
      cognitiveComplexity,
      methodLength: Math.round(methodLength),
      codeSmellsPer100LOC: Math.round(codeSmellsPer100LOC),
      duplicationDensity: Math.round(duplicationDensity),
      methodsWithoutComments: Math.round(methodsWithoutComments)
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

  const renderCodeBlock = (label, codeData) => {
    const code = typeof codeData === 'string' ? codeData : codeData.code;
    const metrics = analyzeCode(code);
    const storedMetrics = typeof codeData === 'object' ? codeData : null;

    return (
      <div className="model-result-card">
        <div className="model-header">
          <div className="model-name">{label}</div>
          {metrics && (
            <div className="model-meta">
              {metrics.lines} lines | {metrics.functions} functions | 
              ACI: {storedMetrics?.aci ?? metrics.aci} | AMR: {storedMetrics?.amr ?? metrics.amr}
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

        {storedMetrics && (
          <div className="stored-metrics">
            <h4>Stored Analysis:</h4>
            <div>Readability: {storedMetrics.readability}/100</div>
            <div>Complexity: {storedMetrics.complexity}/100</div>
            <div>ACI: {storedMetrics.aci}/100</div>
            <div>AMR: {storedMetrics.amr}/100</div>
            <div>Maintainability: {storedMetrics.maintainability}/100</div>
          </div>
        )}
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
                    <span>ACI</span>
                    <span>{data.aci}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill aci" 
                      style={{ width: `${data.aci}%` }}
                    ></div>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label">
                    <span>AMR</span>
                    <span>{data.amr}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill amr" 
                      style={{ width: `${data.amr}%` }}
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
              balance of readability, complexity, ACI, AMR, and maintainability.
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