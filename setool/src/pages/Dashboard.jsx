import React, { useState } from "react";
import QueryInput from "../components/QueryInput";
import { getChatGPTResponse } from "../api/openaiService";
import { getDeepSeekResponse } from "../api/deepseekService";
import { getGeminiResponse } from "../api/geminiService";

const Dashboard = () => {
  const [responses, setResponses] = useState({
    chatgpt: "",
    deepseek: "",
    gemini: "",
  });
  const [loading, setLoading] = useState(false);

  const handleQuerySubmit = async (prompt) => {
    setLoading(true);
    try {
      const [chatgpt, deepseek, gemini] = await Promise.all([
        getChatGPTResponse(prompt),
        getDeepSeekResponse(prompt),
        getGeminiResponse(prompt),
      ]);
      setResponses({ chatgpt, deepseek, gemini });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Code copied to clipboard!");
  };

  const renderResponse = (title, content) => (
    <div className="response-box">
      <h2>{title}</h2>
      <pre>
        <code>{content}</code>
      </pre>
      <button onClick={() => handleCopy(content)}>📋 Copy</button>
    </div>
  );

  return (
    <div className="dashboard">
      <h1>Multi-LLM Code Generator</h1>
      <QueryInput onSubmit={handleQuerySubmit} isLoading={loading} />
      <div className="results-section">
        {renderResponse("ChatGPT", responses.chatgpt)}
        {renderResponse("DeepSeek", responses.deepseek)}
        {renderResponse("Gemini", responses.gemini)}
      </div>
    </div>
  );
};

export default Dashboard;
