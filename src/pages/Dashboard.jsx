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


 
  const customCode = location.state?.customCode || '';


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
  const [error, setError] = useState(null);

 
  const [customCodeAnalysis, setCustomCodeAnalysis] = useState(null);



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
    const userCode = searchParams.get("userCode");
    
    if (prompt) {
      setCurrentPrompt(prompt);
      setSelectedModels({
        chatgpt: models.includes("chatgpt"),
        deepseek: models.includes("deepseek"),
        gemini: models.includes("gemini"),
        llama: models.includes("llama"),
        mistral: models.includes("mistral"),
        user: userCode ? true : false
      });
      
      if (userCode) {
        setResponses(prev => ({ ...prev, user: userCode }));
      }
      
      handleQuerySubmit(prompt, {
        chatgpt: models.includes("chatgpt"),
        deepseek: models.includes("deepseek"),
        gemini: models.includes("gemini"),
        llama: models.includes("llama"),
        mistral: models.includes("mistral"),
        user: userCode ? true : false
      });
    }
  }, [location]);

  const analyzeResponses = async () => {
    const analysisResults = {};
    Object.keys(responses).forEach(model => {
      if (responses[model]) {
        analysisResults[model] = analyzeCode(responses[model]);
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

  const handleQuerySubmit = async (prompt, modelsToUse = selectedModels) => {
    if (!prompt.trim()) return;

    setLoading(true);
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
      if (modelsToUse.llama) {
        requests.push(
          getLlama4ScoutResponse(prompt)
            .then(res => ({ model: "llama", response: res }))
            .catch(err => ({ model: "llama", response: `Error: ${err.message}` }))
        );
      }
      if (modelsToUse.mistral) {
        requests.push(
          getDolphinResponse(prompt)
            .then(res => ({ model: "mistral", response: res }))
            .catch(err => ({ model: "mistral", response: `Error: ${err.message}` }))
        );
      }
      

      const results = await Promise.all(requests);
      const newResponses = { ...responses };
      
      results.forEach(({ model, response }) => {
        newResponses[model] = response;
      });

      
      setResponses(newResponses);
    } catch (err) {
      console.error("Failed to get responses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrompt = () => {
    const enabledModels = Object.entries(selectedModels)
      .filter(([model, isSelected]) => isSelected && model !== 'user')
      .map(([model]) => model)
      .join(',');
  
    navigate(`/?prompt=${encodeURIComponent(currentPrompt)}&models=${enabledModels}${
      responses.user ? `&userCode=${encodeURIComponent(responses.user)}` : ''
    }`);
  };

  const handleCustomCodeChange = (event) => {
    setCustomCode(event.target.value);
  };

  const analyzeCustomCode = () => {
    setError(null); // Clear any previous errors
  
    try {
      // Try to evaluate the custom code to check for syntax errors
      new Function(customCode); // This will throw an error if the code is invalid
  
      // If no error, proceed with the analysis
      const analysisResult = analyzeCode(customCode);
      setCustomCodeAnalysis(analysisResult);
  
    } catch (error) {
      // If there's a syntax error, set the error state
    
        console.error(error);
        
      setCustomCodeAnalysis(null);  // Clear any previous analysis
      setError("Code has a syntax error: " + error.message);  // Display the error message
    }
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
          <ResultsDisplay 
            responses={responses} 
            selectedModels={selectedModels} 
            analysis={analysis}
          />
        )}
       
 {!analysis &&
              Object.values(responses).some((response) => response) && (
                <button onClick={analyzeResponses} className="analyze-btn">
                  Analyze Codes
                </button>
              )}

            {/* Custom Code Section */}
            <div className="custom-code-section">
              <h3>Enter Custom Code</h3>
              <textarea
                value={customCode}
                onChange={handleCustomCodeChange}
                rows="10"
                cols="50"
                placeholder="Enter your custom code inhere..."
              />
              <button onClick={analyzeCustomCode} className="analyze-btn">
                Analyze Custom Code
              </button>

              {error && (
    <div className="error-message">
      <p>{error}</p>
    </div>
  )}


              {customCodeAnalysis && (
                <div className="custom-code-analysis">
                  <h4>Custom Code Analysis</h4>
                  <pre>{JSON.stringify(customCodeAnalysis, null, 2)}</pre>
                </div>
              )}

{customCodeAnalysis && (

   
<ResultsDisplay 
responses={responses} 
selectedModels={selectedModels} 
customCode={customCode}   
analysis={analysis}
/>


)}
            </div>
          
      </main>
    </div>
  );
};

export default Dashboard;