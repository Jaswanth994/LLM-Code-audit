import React, { useState } from "react";

const QueryInput = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="query-form">
      <label htmlFor="prompt" className="visually-hidden">
        Enter your prompt
      </label>
      <textarea
        id="prompt"
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        disabled={isLoading}
        className="prompt-input"
      />
      <button type="submit" disabled={isLoading} className="submit-btn">
        {isLoading ? "Generating..." : "Generate Code"}
      </button>
    </form>
  );
};

export default QueryInput;
