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

const Dashboard = () => {
  const location = useLocation();
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

  // Authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle initial prompt from URL
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

  const handleQuerySubmit = async (prompt, modelsToUse = selectedModels) => {
    if (!prompt.trim()) {
      setError("Please enter a valid prompt");
      return;
    }

    setLoading(true);
    setError(null);
    
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
    } catch (err) {
      setError(`Failed to get responses: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      
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
          <ResultsDisplay 
            responses={responses} 
            selectedModels={selectedModels} 
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;