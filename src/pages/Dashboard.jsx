import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import ResultsDisplay from "../components/ResultsDisplay";
import { getChatGPTResponse } from "../api/openaiService";
import { getDeepSeekResponse } from "../api/deepseekService";
import { getGeminiResponse } from "../api/geminiService";
import { getLlama4ScoutResponse } from "../api/llamaService";
import { getDolphinResponse } from "../api/mistralService";
import Header from "../components/Header";
import "../styles/dashboard.css";
import { useAuthState } from 'react-firebase-hooks/auth';
import { saveComparison } from "../firestoreService";

const analyzeCode = (code) => {
  if (!code || typeof code !== 'string') {
    return {
      readability: 0,
      complexity: 0,
      technicalDebt: 0,
      maintainability: 0,
      issues: []
    };
  }

  const lines = code.split('\n').length;
  const charCount = code.length;
  const commentCount = (code.match(/\/\/|\/\*|\*\//g) || []).length;
  
  const readability = Math.min(100, Math.max(0, 
    80 - (lines / 50) - (charCount / lines / 100) + (commentCount * 2)
  ));
  
  const complexity = Math.min(100, Math.max(0, 
    (lines / 20) + (code.match(/\bif\b|\bfor\b|\bwhile\b/g) || []).length * 5
  ));
  
  const technicalDebt = Math.min(100, Math.max(0, 
    complexity * 0.7 - readability * 0.3
  ));
  
  const maintainability = Math.min(100, Math.max(0,
    100 - (complexity * 0.3) - (technicalDebt * 0.2) - (lines / 50)
  ));
  
  const issues = [];
  if (lines > 100) issues.push("Long method/function");
  if (complexity > 70) issues.push("High complexity");
  if (readability < 50) issues.push("Low readability");
  
  return {
    readability: Math.round(readability),
    complexity: Math.round(complexity),
    technicalDebt: Math.round(technicalDebt),
    maintainability: Math.round(maintainability),
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
    llama: "",
    mistral: "",
    user: ""
  });
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState({
    chatgpt: true,
    deepseek: true,
    gemini: true,
    llama: true,
    mistral: true,
    user: true
  });
  const [analysis, setAnalysis] = useState(null);
  const [hasRunInitialAnalysis, setHasRunInitialAnalysis] = useState(false);

  // Authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle initial load and URL parameters - runs only once
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const prompt = searchParams.get("prompt") || searchParams.get("prompt"); // Handle typo in URL
    const models = searchParams.get("models")?.split(",").filter(Boolean) || [];
    const userCode = searchParams.get("userCode");
    
    if (prompt) {
      setCurrentPrompt(prompt);
      
      const modelsConfig = {
        chatgpt: models.includes("chatgpt"),
        deepseek: models.includes("deepseek"),
        gemini: models.includes("gemini"),
        llama: models.includes("llama"),
        mistral: models.includes("mistral"),
        user: !!userCode
      };
      
      setSelectedModels(modelsConfig);
      
      // Initialize responses with user code if available
      const initialResponses = {
        chatgpt: "",
        deepseek: "",
        gemini: "",
        llama: "",
        mistral: "",
        user: userCode ? decodeURIComponent(userCode) : ""
      };
      
      setResponses(initialResponses);
      
      // Only submit query if we have models selected (excluding user)
      const hasModelsToQuery = Object.entries(modelsConfig).some(
        ([model, isSelected]) => isSelected && model !== 'user'
      );
      
      if (hasModelsToQuery) {
        handleQuerySubmit(prompt, modelsConfig, initialResponses);
      } else if (userCode) {
        // If only user code is provided, just analyze it
        setHasRunInitialAnalysis(true);
        analyzeResponses({ ...initialResponses }, modelsConfig);
      }
    }
  }, [location]);

  // Analyze responses with optional parameters
  const analyzeResponses = async (responsesToAnalyze = responses, modelsConfig = selectedModels) => {
    const analysisResults = {};
    const modelsToAnalyze = Object.keys(responsesToAnalyze).filter(
      model => responsesToAnalyze[model] && modelsConfig[model]
    );

    // Analyze each model's response
    modelsToAnalyze.forEach(model => {
      analysisResults[model] = analyzeCode(responsesToAnalyze[model]);
    });

    // Determine best model if we have results
    if (modelsToAnalyze.length > 0) {
      analysisResults.bestModel = modelsToAnalyze.reduce((best, current) => {
        const currentData = analysisResults[current];
        const bestData = analysisResults[best];
        
        const currentScore = currentData.readability * 0.5 - 
                          currentData.complexity * 0.3 - 
                          currentData.technicalDebt * 0.2;
        const bestScore = bestData.readability * 0.5 - 
                        bestData.complexity * 0.3 - 
                        bestData.technicalDebt * 0.2;
        
        return currentScore > bestScore ? current : best;
      }, modelsToAnalyze[0]);
    }

    setAnalysis(analysisResults);
    setHasRunInitialAnalysis(true);

    // Save to database if user is logged in
    if (user) {
      try {
        await saveComparison(
          user.uid, 
          currentPrompt, 
          responsesToAnalyze, 
          analysisResults, 
          modelsConfig
        );
      } catch (error) {
        console.error("Failed to save comparison:", error);
      }
    }

    return analysisResults;
  };

  // Handle query submission to LLMs
  const handleQuerySubmit = async (prompt, modelsToUse = selectedModels, initialResponses = responses) => {
    if (!prompt.trim()) return;

    setLoading(true);
    setAnalysis(null);
    setHasRunInitialAnalysis(false);
    
    try {
      const requests = [];
      const newResponses = { ...initialResponses };
      
      // Prepare requests for each selected model
      const modelApis = {
        chatgpt: getChatGPTResponse,
        deepseek: getDeepSeekResponse,
        gemini: getGeminiResponse,
        llama: getLlama4ScoutResponse,
        mistral: getDolphinResponse
      };

      Object.entries(modelsToUse).forEach(([model, shouldUse]) => {
        if (shouldUse && model !== 'user' && modelApis[model]) {
          requests.push(
            modelApis[model](prompt)
              .then(res => {
                newResponses[model] = res;
              })
              .catch(err => {
                newResponses[model] = `Error: ${err.message || 'Failed to get response'}`;
              })
          );
        }
      });

      await Promise.all(requests);
      setResponses(newResponses);
      
      // Only auto-analyze if we have more than just user code
      const hasLLMResponses = Object.entries(modelsToUse).some(
        ([model, shouldUse]) => shouldUse && model !== 'user'
      );
      
      if (hasLLMResponses) {
        await analyzeResponses(newResponses, modelsToUse);
      }
    } catch (err) {
      console.error("Failed to get responses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing the prompt
  const handleEditPrompt = () => {
    const enabledModels = Object.entries(selectedModels)
      .filter(([model, isSelected]) => isSelected && model !== 'user')
      .map(([model]) => model)
      .join(',');
  
    navigate(`/?prompt=${encodeURIComponent(currentPrompt)}&models=${enabledModels}${
      responses.user ? `&userCode=${encodeURIComponent(responses.user)}` : ''
    }`);
  };

  return (
    <div className="dashboard-container">
      <Header user={user} />
      
      <main className="dashboard-content">
        <div className="prompt-display">
          <h3>Entered Prompt:</h3>
          <p className="prompt-text">{currentPrompt}</p>
          <div className="button-group">
            <button onClick={handleEditPrompt} className="edit-prompt-btn">
              Edit Prompt
            </button>
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
            
            {/* Show analyze button if we have responses but no analysis */}
            {!hasRunInitialAnalysis && !loading && 
              Object.values(responses).some(res => res && res.trim()) && (
                <div className="analyze-button-container">
                  <button 
                    onClick={() => analyzeResponses()} 
                    className="analyze-btn"
                    disabled={loading}
                  >
                    Analyze Codes
                  </button>
                </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;