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
  if (!code || typeof code !== 'string' || !code.trim()) {
    return {
      readability: 0,
      complexity: 0,
      technicalDebt: 0,
      maintainability: 0,
      aci: 0,
      amr:0,
      issues: []
    };
  }
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
  
  const issues = [];
  if (lines > 100) issues.push("Long method/function");
  if (complexity > 70) issues.push("High complexity");
  if (readability < 50) issues.push("Low readability");
  
  return {
    readability: Math.round(readability),
    complexity: Math.round(complexity),
    aci: Math.round(aci),
    amr:Math.round(amr),
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
    llama: "",
    mistral: "",
    user: ""
  });
  const [loading, setLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState({});
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const prompt = decodeURIComponent(searchParams.get("prompt") || "");
    const models = searchParams.get("models")?.split(",") || [];
    const userCode = searchParams.get("userCode");

    setCurrentPrompt(prompt);
    
    const newSelectedModels = {
      chatgpt: models.includes("chatgpt"),
      deepseek: models.includes("deepseek"),
      gemini: models.includes("gemini"),
      llama: models.includes("llama"),
      mistral: models.includes("mistral"),
      user: !!userCode
    };
    
    setSelectedModels(newSelectedModels);

    if (userCode) {
      try {
        const decodedCode = decodeURIComponent(userCode);
        setResponses(prev => ({ ...prev, user: decodedCode }));
      } catch (error) {
        console.error("Error decoding user code:", error);
      }
    }

    if (prompt) {
      handleQuerySubmit(prompt, newSelectedModels);
    } else if (userCode) {
      analyzeResponses();
    }
  }, [location]);

  const analyzeResponses = async () => {
    const analysisResults = {};
    
    if (responses.user.trim()) {
      analysisResults.user = analyzeCode(responses.user);
    }

    Object.keys(responses).forEach(model => {
      const response = responses[model];
      if (model !== 'user' && typeof response === 'string' && response.trim()) {
        analysisResults[model] = analyzeCode(response);
      }
    });
    
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
      
      analysisResults.bestModel = bestModel;
    }
    
    setAnalysis(analysisResults);

    if (user) {
      try {
        await saveComparison(
          user.uid, 
          currentPrompt, 
          responses, 
          analysisResults, 
          selectedModels
        );
      } catch (error) {
        console.error("Failed to save comparison:", error);
      }
    }
  };  

  const handleQuerySubmit = async (prompt, modelsToUse) => {
    if (!prompt.trim()) return;

    setLoading(true);
    setAnalysis(null);
    const initialLoadingStates = {};
    
    try {
      const requests = [];
      const requestModels = [];

      // Configure ChatGPT request
      if (modelsToUse.chatgpt) {
        initialLoadingStates.chatgpt = true;
        requests.push(
          getChatGPTResponse(prompt)
            .then(res => ({ model: "chatgpt", response: res }))
            .catch(error => ({ 
              model: "chatgpt", 
              response: `Error: ${error.message || "Failed to fetch response"}`
            }))
        );
        requestModels.push("chatgpt");
      }

      // Configure DeepSeek request
      if (modelsToUse.deepseek) {
        initialLoadingStates.deepseek = true;
        requests.push(
          getDeepSeekResponse(prompt)
            .then(res => ({ model: "deepseek", response: res }))
            .catch(error => ({
              model: "deepseek",
              response: `Error: ${error.message || "Failed to fetch response"}`
            }))
        );
        requestModels.push("deepseek");
      }

      // Configure Gemini request
      if (modelsToUse.gemini) {
        initialLoadingStates.gemini = true;
        requests.push(
          getGeminiResponse(prompt)
            .then(res => ({ model: "gemini", response: res }))
            .catch(error => ({
              model: "gemini",
              response: `Error: ${error.message || "Failed to fetch response"}`
            }))
        );
        requestModels.push("gemini");
      }

      // Configure Llama request
      if (modelsToUse.llama) {
        initialLoadingStates.llama = true;
        requests.push(
          getLlama4ScoutResponse(prompt)
            .then(res => ({ model: "llama", response: res }))
            .catch(error => ({
              model: "llama",
              response: `Error: ${error.message || "Failed to fetch response"}`
            }))
        );
        requestModels.push("llama");
      }

      // Configure Mistral request
      if (modelsToUse.mistral) {
        initialLoadingStates.mistral = true;
        requests.push(
          getDolphinResponse(prompt)
            .then(res => ({ model: "mistral", response: res }))
            .catch(error => ({
              model: "mistral",
              response: `Error: ${error.message || "Failed to fetch response"}`
            }))
        );
        requestModels.push("mistral");
      }

      setLoadingModels(initialLoadingStates);

      const results = await Promise.all(requests);
      
      setResponses(prev => {
        const newResponses = { ...prev };
        results.forEach(({ model, response }) => {
          newResponses[model] = response;
          initialLoadingStates[model] = false;
        });
        return newResponses;
      });

    } catch (err) {
      console.error("Failed to process responses:", err);
    } finally {
      setLoading(false);
      setLoadingModels({});
    }
  };

  const handleEditPrompt = () => {
    const enabledModels = Object.entries(selectedModels)
      .filter(([model, isSelected]) => isSelected && model !== 'user')
      .map(([model]) => model);

    navigate(`/?prompt=${encodeURIComponent(currentPrompt)}&models=${enabledModels.join(',')}${
      responses.user ? `&userCode=${encodeURIComponent(responses.user)}` : ''
    }`);
  };

  return (
    <div className="dashboard-container">
      <Header user={user} />
      
      <main className="dashboard-content">
        <div className="prompt-display">
          <h3>Original Prompt:</h3>
          <p className="prompt-text">{currentPrompt}</p>
          <div className="button-group">
            <button onClick={handleEditPrompt} className="edit-prompt-btn">
              Edit Prompt
            </button>
          </div>
        </div>

        {responses.user.trim() && (
          <div className="user-code-display">
            <h3>Your Custom Code:</h3>
            <pre className="user-code-content">{responses.user}</pre>
          </div>
        )}

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Generating responses...</p>
            {responses.user.trim()  }
          </div>
        ) : (
          <ResultsDisplay 
            responses={responses} 
            selectedModels={selectedModels} 
            analysis={analysis}
            loadingModels={loadingModels}
          />
        )}

        {!analysis && !loading && (
          Object.keys(responses).some(model => 
           (model !== 'user' && responses[model].trim()) || 
             (model === 'user' && responses.user.trim() && selectedModels.user)
            ) && (
          <button onClick={analyzeResponses} className="analyze-btn">
              Analyze Codes
              </button>
              ))}
              
      </main>
    </div>
  );
};

export default Dashboard;