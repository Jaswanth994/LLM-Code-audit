// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import QueryInput from "../components/QueryInput";
import ResultsDisplay from "../components/ResultsDisplay";
import { getChatGPTResponse } from "../api/openaiService";
import { getDeepSeekResponse } from "../api/deepseekService";
import { getGeminiResponse } from "../api/geminiService";
import Header from "../components/Header";
import "../styles/dashboard.css";
import { useAuthState } from 'react-firebase-hooks/auth';


const analyzeCode = (code) => {
  if (!code || typeof code !== 'string') {
    return {
      readability: 0,
      complexity: 0,
      technicalDebt: 0,
      issues: []
    };
  }

  // Simple analysis (in a real app, you'd use proper code analysis tools)
  const lines = code.split('\n').length;
  const charCount = code.length;
  const commentCount = (code.match(/\/\/|\/\*|\*\//g) || []).length;
  
  // Calculate metrics (simplified for demo)
  const readability = Math.min(100, Math.max(0, 
    80 - (lines / 50) - (charCount / lines / 100) + (commentCount * 2)
  ));
  
  const complexity = Math.min(100, Math.max(0, 
    (lines / 20) + (code.match(/\bif\b|\bfor\b|\bwhile\b/g) || []).length * 5
  ));
  
  const technicalDebt = Math.min(100, Math.max(0, 
    complexity * 0.7 - readability * 0.3
  ));
  
  const issues = [];
  if (lines > 100) issues.push("Long method/function");
  if (complexity > 70) issues.push("High complexity");
  if (readability < 50) issues.push("Low readability");
  
  return {
    readability: Math.round(readability),
    complexity: Math.round(complexity),
    technicalDebt: Math.round(technicalDebt),
    issues
  };
};

const Dashboard = () => {
  const location = useLocation();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [responses, setResponses] = useState({
    chatgpt: "",
    deepseek: "",
    gemini: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState({
    chatgpt: true,
    deepseek: true,
    gemini: true,
  });
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const prompt = searchParams.get("prompt");
    const models = searchParams.get("models")?.split(",") || [];
    
    if (prompt) {
      setInitialPrompt(prompt);
      setSelectedModels({
        chatgpt: models.includes("chatgpt"),
        deepseek: models.includes("deepseek"),
        gemini: models.includes("gemini"),
      });
    }
  }, [location]);

  const analyzeResponses = () => {
    const analysisResults = {};
    Object.keys(responses).forEach(model => {
      if (responses[model]) {
        analysisResults[model] = analyzeCode(responses[model]);
      }
    });
    setAnalysis(analysisResults);
    
    // Determine best model
    if (Object.keys(analysisResults).length > 0) {
      const models = Object.keys(analysisResults);
      const bestModel = models.reduce((best, current) => {
        const currentScore = analysisResults[current].readability * 0.5 - 
                           analysisResults[current].complexity * 0.3 - 
                           analysisResults[current].technicalDebt * 0.2;
        const bestScore = analysisResults[best].readability * 0.5 - 
                         analysisResults[best].complexity * 0.3 - 
                         analysisResults[best].technicalDebt * 0.2;
        return currentScore > bestScore ? current : best;
      }, models[0]);
      
      setAnalysis(prev => ({
        ...prev,
        bestModel
      }));
    }
  };

  const handleQuerySubmit = async (prompt, modelsToUse = selectedModels) => {
    if (!prompt.trim()) {
      setError("Please enter a valid prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const requests = [];
      
      if (modelsToUse.chatgpt) {
        requests.push(
          getChatGPTResponse(prompt)
            .then(res => ({ model: "chatgpt", response: res }))
            .catch(err => ({ model: "chatgpt", response: `Error: ${err.message}` }))
        );
      }
      if (modelsToUse.deepseek) {
        requests.push(
          getDeepSeekResponse(prompt)
            .then(res => ({ model: "deepseek", response: res }))
            .catch(err => ({ model: "deepseek", response: `Error: ${err.message}` }))
        );
      }
      if (modelsToUse.gemini) {
        requests.push(
          getGeminiResponse(prompt)
            .then(res => ({ model: "gemini", response: res }))
            .catch(err => ({ model: "gemini", response: `Error: ${err.message}` }))
        );
      }

      const results = await Promise.all(requests);
      const newResponses = { ...responses };
      
      results.forEach(({ model, response }) => {
        newResponses[model] = response;
      });
      
      setResponses(newResponses);
      analyzeResponses();
    } catch (err) {
      setError(`Failed to get responses: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="dashboard-container">
    <Header user={user} /> 
    
    <main className="dashboard-content">
      <h1 className="dashboard-title">LLM Code Analysis Dashboard</h1>
      
      <div className="query-section">
        <QueryInput 
          onSubmit={handleQuerySubmit}
          isLoading={loading}
          initialValue={initialPrompt}
        />
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="model-selection">
        <h3>Select Models to Compare:</h3>
        <div className="model-checkboxes">
          {Object.entries(selectedModels).map(([model, isSelected]) => (
            <label key={model} className="model-checkbox">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => setSelectedModels(prev => ({
                  ...prev,
                  [model]: !prev[model]
                }))}
              />
              {model.charAt(0).toUpperCase() + model.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Generating responses...</p>
        </div>
      ) : (
        <>
          <ResultsDisplay 
            responses={responses} 
            selectedModels={selectedModels} 
            analysis={analysis}
          />
        </>
      )}
    </main>
  </div>
);
};

export default Dashboard;